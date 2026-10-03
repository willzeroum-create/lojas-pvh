'use client'

import { Check, Minus, Plus, Printer, QrCode, Search, ShoppingBasket, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { venderAction } from '@/app/painel/caixa/actions'
import { gerarPixAction } from '@/app/painel/pix/actions'
import { QrPix } from '@/app/painel/pix/_components/qr-pix'
import { useAprovacaoGerente } from '@/components/ui/aprovacao-gerente'
import type { ProdutoPdv, VendaDoCaixa, VendaRegistada } from '@/lib/dados/pdv'
import type { CobrancaPix } from '@/lib/dados/pix'
import { FORMAS_RECEBIMENTO, ROTULO_FORMA } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import {
  calcularVenda,
  lerEtiquetaBalanca,
  type FormaRecebimento,
  type ItemCalculado,
  type PagamentoVenda,
} from '@/lib/dominio/pdv'
import { ComprovanteVenda } from './comprovante-venda'
import { DialogoPdv } from './dialogo-pdv'
import { UltimasVendas } from './ultimas-vendas'

type Linha = { produto: ProdutoPdv; quantidade: string; desconto: string }
type Recebimento = { chave: number; forma: FormaRecebimento; valor: string }
type Recibo = {
  venda: VendaRegistada
  itens: (ItemCalculado & { vendidoPorPeso: boolean })[]
  pagamentos: PagamentoVenda[]
  descontoGeral: number
  clienteNome: string
  criadoEm: string
}

/** Aceita vírgula decimal sem converter um campo inválido em zero. */
function numero(texto: string, casas = 2) {
  const valor = texto.trim()
  if (!valor) return 0
  if (!new RegExp(`^\\d+(?:[.,]\\d{0,${casas}})?$`).test(valor)) return NaN
  const convertido = Number(valor.replace(',', '.'))
  return Number.isSafeInteger(Math.round(convertido * 10 ** casas)) ? convertido : NaN
}
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
const decimal = (valor: number, casas = 2) => valor.toFixed(casas).replace('.', ',')

export function FrenteDeCaixa({
  produtos,
  vendas,
  lojaNome,
  operador,
  pixAtivo = false,
}: {
  produtos: ProdutoPdv[]
  vendas: VendaDoCaixa[]
  lojaNome: string
  operador: string
  pixAtivo?: boolean
}) {
  const router = useRouter()
  const { solicitar, dialogo } = useAprovacaoGerente()
  const buscaRef = useRef<HTMLInputElement>(null)
  const sucessoRef = useRef<HTMLHeadingElement>(null)
  const painelQrRef = useRef<HTMLElement>(null)
  const trava = useRef(false)
  const sequencia = useRef(0)
  const [pendente, iniciar] = useTransition()
  const [busca, definirBusca] = useState('')
  const [categoria, definirCategoria] = useState('')
  const [linhas, definirLinhas] = useState<Linha[]>([])
  const [selecionado, definirSelecionado] = useState<string | null>(null)
  const [desconto, definirDesconto] = useState('')
  const [recebimentos, definirRecebimentos] = useState<Recebimento[]>([])
  const [pagando, definirPagando] = useState(false)
  const [pesando, definirPesando] = useState<{ produto: ProdutoPdv; editar: boolean } | null>(null)
  const [peso, definirPeso] = useState('')
  const [limpando, definirLimpando] = useState(false)
  const [erro, definirErro] = useState('')
  const [aviso, definirAviso] = useState('')
  const [cliente, definirCliente] = useState('')
  const [observacoes, definirObservacoes] = useState('')
  const [recibo, definirRecibo] = useState<Recibo | null>(null)
  const [incerto, definirIncerto] = useState(false)
  const [cobrancaPix, definirCobrancaPix] = useState<CobrancaPix | null>(null)
  const [gerandoPix, iniciarPix] = useTransition()
  const travaPix = useRef(false)
  const pixConfirmado = useRef(false)

  const itens = linhas.map((linha) => ({
    produtoId: linha.produto.id,
    nome: linha.produto.nome,
    precoUnitario: linha.produto.preco,
    quantidade: numero(linha.quantidade, linha.produto.vendidoPorPeso ? 3 : 0),
    desconto: numero(linha.desconto),
  }))
  const descontoGeral = numero(desconto)
  const entradaInvalida =
    !Number.isFinite(descontoGeral) ||
    itens.some(
      (item) =>
        !Number.isFinite(item.desconto) ||
        !Number.isFinite(item.quantidade) ||
        item.quantidade <= 0 ||
        item.quantidade > 9999,
    )
  // Um centavo de referência permite obter o total pelo domínio antes de escolher
  // a forma. Este recebimento serve apenas à prévia e nunca é enviado à action.
  const previa = calcularVenda(itens, descontoGeral, [{ forma: 'dinheiro', valor: 0.01 }])
  const total = entradaInvalida
    ? null
    : previa.ok
      ? previa.total
      : previa.falta !== undefined
        ? Math.round((previa.falta + 0.01) * 100) / 100
        : null
  const resumo =
    total === null
      ? null
      : calcularVenda(itens, descontoGeral, [{ forma: 'dinheiro', valor: Math.max(0.01, total) }])
  const pagamentos = recebimentos.map(({ forma, valor }) => ({ forma, valor: numero(valor) }))
  const pagamentoInvalido = pagamentos.some(({ valor }) => !Number.isFinite(valor) || valor <= 0)
  const calculo = calcularVenda(itens, descontoGeral, pagamentos)
  const valorPix =
    pagamentos
      .filter((pagamento) => pagamento.forma === 'pix')
      .reduce((soma, pagamento) => soma + Math.round(pagamento.valor * 100), 0) / 100
  const pixEmCurso = cobrancaPix?.estado === 'pendente'
  const pixRecebido = cobrancaPix?.estado === 'pago'
  const pagamentoTravado = gerandoPix || pixEmCurso
  const podeConfirmar =
    !incerto &&
    total !== null &&
    !entradaInvalida &&
    !pagamentoInvalido &&
    pagamentos.length > 0 &&
    calculo.ok
  const erroCarrinho =
    linhas.length && total === null
      ? entradaInvalida
        ? 'Revise as quantidades e descontos. Use valores positivos, até 3 casas para kg e 2 para reais.'
        : !previa.ok
          ? previa.erro
          : ''
      : ''
  const categorias = [...new Set(produtos.map((produto) => produto.categoria || 'Sem categoria'))]
  const termo = normalizar(busca)
  const filtrados = produtos.filter(
    (produto) =>
      (!categoria || (produto.categoria || 'Sem categoria') === categoria) &&
      (!termo ||
        normalizar(`${produto.nome} ${produto.sku ?? ''} ${produto.codigoBarras ?? ''}`).includes(termo)),
  )

  function focarBusca() {
    buscaRef.current?.focus()
    buscaRef.current?.select()
  }
  function limparPagamentos() {
    // Um Pix confirmado continua vinculado ao rascunho durante correções da venda.
    definirRecebimentos((atuais) => (pixRecebido ? atuais.filter((item) => item.forma === 'pix') : []))
    definirErro('')
  }
  function alterarLinha(id: string, alteracao: Partial<Omit<Linha, 'produto'>>) {
    definirLinhas((atuais) =>
      atuais.map((linha) => (linha.produto.id === id ? { ...linha, ...alteracao } : linha)),
    )
    definirSelecionado(id)
    limparPagamentos()
  }
  function remover(id: string) {
    definirLinhas((atuais) => atuais.filter((linha) => linha.produto.id !== id))
    if (selecionado === id) definirSelecionado(null)
    limparPagamentos()
  }
  function adicionar(produto: ProdutoPdv, quantidade?: number) {
    definirErro('')
    if (!Number.isFinite(produto.preco) || produto.preco <= 0) {
      definirErro('Este produto precisa de um preço maior que zero no catálogo.')
      return false
    }
    if (produto.vendidoPorPeso && quantidade === undefined) {
      definirPeso('')
      definirPesando({ produto, editar: false })
      return false
    }
    const acrescimo = quantidade ?? 1
    const existente = linhas.find((linha) => linha.produto.id === produto.id)
    if (
      (!existente && linhas.length >= 200) ||
      acrescimo <= 0 ||
      acrescimo > 9999 ||
      (existente &&
        (!Number.isFinite(numero(existente.quantidade, 3)) ||
          numero(existente.quantidade, 3) + acrescimo > 9999))
    ) {
      definirErro('Revise a quantidade. O limite é 9.999 por produto e 200 produtos por venda.')
      return false
    }
    definirLinhas((atuais) => {
      const atual = atuais.find((linha) => linha.produto.id === produto.id)
      return atual
        ? atuais.map((linha) =>
            linha.produto.id === produto.id
              ? {
                  ...linha,
                  quantidade: decimal(
                    numero(linha.quantidade, 3) + acrescimo,
                    produto.vendidoPorPeso ? 3 : 0,
                  ),
                }
              : linha,
          )
        : [
            ...atuais,
            { produto, quantidade: decimal(acrescimo, produto.vendidoPorPeso ? 3 : 0), desconto: '' },
          ]
    })
    definirSelecionado(produto.id)
    definirBusca('')
    limparPagamentos()
    definirAviso(`${produto.nome} adicionado ao carrinho.`)
    focarBusca()
    return true
  }
  function lerBusca() {
    const codigo = busca.trim()
    if (!codigo) return
    const exatos = produtos.filter((produto) =>
      [produto.codigoBarras, produto.sku].some((valor) => valor && normalizar(valor) === normalizar(codigo)),
    )
    if (exatos.length === 1 && exatos[0]) {
      adicionar(exatos[0])
      return
    }
    if (exatos.length > 1) {
      definirErro('Este código está em mais de um produto. Selecione o produto na grade.')
      return
    }
    const etiqueta = lerEtiquetaBalanca(codigo, { digitosCodigo: 5, tipo: 'preco' })
    if (etiqueta) {
      const encontrados = produtos.filter(
        (produto) =>
          produto.vendidoPorPeso &&
          [produto.sku, produto.codigoBarras].some(
            (valor) =>
              valor &&
              /^\d+$/.test(valor) &&
              valor.replace(/^0+/, '') === etiqueta.codigoProduto.replace(/^0+/, ''),
          ),
      )
      const produto = encontrados.length === 1 ? encontrados[0] : undefined
      if (!produto || produto.preco <= 0) {
        definirErro(
          'Não foi possível identificar o produto da balança. Confira o código e o preço no catálogo.',
        )
        return
      }
      const quantidade = Math.round((etiqueta.valor / produto.preco) * 1000) / 1000
      if (adicionar(produto, quantidade))
        definirAviso(
          `Etiqueta de ${formatarBRL(etiqueta.valor)}: ${decimal(quantidade, 3)} kg de ${produto.nome}. Peso arredondado ao grama.`,
        )
      return
    }
    if (filtrados.length === 1 && filtrados[0]) {
      adicionar(filtrados[0])
      return
    }
    definirErro(
      filtrados.length
        ? 'Há mais de um resultado. Selecione o produto abaixo.'
        : 'Produto não encontrado. Confira o código ou busque pelo nome.',
    )
  }
  function mudarQuantidade(id: string, direcao: number) {
    const linha = linhas.find((item) => item.produto.id === id)
    if (!linha) return
    const casas = linha.produto.vendidoPorPeso ? 3 : 0
    const proxima =
      Math.round((numero(linha.quantidade, casas) + direcao * (casas ? 0.001 : 1)) * 1000) / 1000
    if (!Number.isFinite(proxima) || proxima <= 0 || proxima > 9999) return
    alterarLinha(id, { quantidade: decimal(proxima, casas) })
  }
  function abrirPagamento() {
    if (!linhas.length || total === null || limpando || pesando || recibo) return
    definirErro('')
    definirPagando(true)
  }
  function novaVenda() {
    definirCobrancaPix(null)
    pixConfirmado.current = false
    definirRecibo(null)
    definirLinhas([])
    definirSelecionado(null)
    definirDesconto('')
    definirRecebimentos([])
    definirCliente('')
    definirObservacoes('')
    definirErro('')
    definirBusca('')
    definirIncerto(false)
    definirAviso('Pronto para uma nova venda.')
    requestAnimationFrame(focarBusca)
  }
  function adicionarForma(forma: FormaRecebimento) {
    if (pixRecebido && forma === 'pix') return
    if (recebimentos.length >= 6) return
    const falta = !recebimentos.length
      ? (total ?? 0)
      : !calculo.ok && calculo.falta !== undefined
        ? calculo.falta
        : 0
    const chave = ++sequencia.current
    definirRecebimentos((atuais) => [...atuais, { chave, forma, valor: falta > 0 ? decimal(falta) : '' }])
    definirErro('')
    requestAnimationFrame(() => {
      const campo = document.getElementById(`pagamento-${chave}`) as HTMLInputElement | null
      campo?.focus()
      campo?.select()
    })
  }
  function gerarPix() {
    if (
      travaPix.current ||
      pagamentoTravado ||
      pixRecebido ||
      !podeConfirmar ||
      !Number.isFinite(valorPix) ||
      valorPix <= 0
    )
      return
    travaPix.current = true
    definirErro('')
    iniciarPix(async () => {
      try {
        const resposta = await gerarPixAction({
          valor: valorPix,
          descricao: `Venda no balcão · ${lojaNome}`.slice(0, 140),
          origem: 'pdv',
        })
        if (!resposta.ok) {
          definirErro(resposta.erro)
          return
        }
        pixConfirmado.current = false
        definirCobrancaPix(resposta.cobranca)
      } catch {
        definirErro(
          'Não foi possível confirmar a geração. Confira as cobranças na tela Pix antes de tentar novamente.',
        )
      } finally {
        travaPix.current = false
      }
    })
  }
  function confirmarVenda(pixAcabouDePagar = false) {
    if (gerandoPix || (pixEmCurso && !pixAcabouDePagar)) return
    if (trava.current || !podeConfirmar || !calculo.ok || !resumo?.ok) return
    const entrada = {
      itens: itens.map(({ produtoId, quantidade, desconto: descontoItem }) => ({
        produtoId,
        quantidade,
        desconto: descontoItem,
      })),
      descontoGeral,
      pagamentos: pagamentos.map((pagamento) => ({ ...pagamento })),
      clienteNome: cliente.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
    }
    const itensRecibo = resumo.itens.map((item, indice) => ({
      ...item,
      vendidoPorPeso: linhas[indice]?.produto.vendidoPorPeso ?? false,
    }))
    let respostaIncerta = false
    definirErro('')
    async function registrarVenda(pinGerente?: string) {
      if (respostaIncerta)
        return { ok: false as const, erro: 'Confira as últimas vendas antes de tentar novamente.' }
      trava.current = true
      try {
        const resposta = await venderAction({ ...entrada, pinGerente })
        if (!resposta.ok) {
          if (!resposta.precisaGerente)
            definirErro(
              [resposta.erro, ...Object.values(resposta.porCampo ?? {})]
                .filter((valor, indice, valores) => valores.indexOf(valor) === indice)
                .join(' '),
            )
          return resposta
        }
        definirRecibo({
          venda: resposta.venda,
          itens: itensRecibo,
          pagamentos: entrada.pagamentos,
          descontoGeral: entrada.descontoGeral,
          clienteNome: entrada.clienteNome ?? '',
          criadoEm: new Date().toISOString(),
        })
        definirPagando(false)
        router.refresh()
        return resposta
      } catch {
        respostaIncerta = true
        definirIncerto(true)
        const mensagem =
          'Não foi possível confirmar a resposta. Confira as últimas vendas antes de tentar novamente para evitar uma venda duplicada.'
        definirErro(mensagem)
        return { ok: false as const, erro: mensagem }
      } finally {
        trava.current = false
      }
    }
    iniciar(async () => {
      const resposta = await registrarVenda()
      if (!resposta.ok && 'precisaGerente' in resposta && resposta.precisaGerente) {
        solicitar((pinGerente) => registrarVenda(pinGerente), resposta.erro)
      }
    })
  }

  useEffect(() => {
    buscaRef.current?.focus()
  }, [])
  useEffect(() => {
    if (recibo) sucessoRef.current?.focus()
  }, [recibo])
  useEffect(() => {
    if (!cobrancaPix?.id || !pagando) return
    const quadro = requestAnimationFrame(() => {
      painelQrRef.current?.focus({ preventScroll: true })
      painelQrRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    })
    return () => cancelAnimationFrame(quadro)
  }, [cobrancaPix?.id, pagando])
  useEffect(() => {
    if (!linhas.length || recibo) return
    const avisarSaida = (evento: BeforeUnloadEvent) => {
      evento.preventDefault()
    }
    window.addEventListener('beforeunload', avisarSaida)
    return () => window.removeEventListener('beforeunload', avisarSaida)
  }, [linhas.length, recibo])
  useEffect(() => {
    const atalhos = (evento: KeyboardEvent) => {
      if (
        evento.defaultPrevented ||
        evento.isComposing ||
        evento.ctrlKey ||
        evento.altKey ||
        evento.metaKey ||
        pendente ||
        pagamentoTravado
      )
        return
      if (document.querySelector('dialog[open]')) return
      const alvo = evento.target as HTMLElement
      if (alvo.closest('[data-pdv-operacao]')) return
      if (evento.key === 'F2') {
        evento.preventDefault()
        focarBusca()
        return
      }
      if (evento.key === 'F4') {
        evento.preventDefault()
        abrirPagamento()
        return
      }
      const digitando = alvo.matches('input, textarea, select') || alvo.isContentEditable
      if (evento.key === 'Escape' && !recibo) {
        evento.preventDefault()
        if (busca) {
          definirBusca('')
          definirErro('')
          focarBusca()
        } else if (linhas.length && !pixRecebido) definirLimpando(true)
        return
      }
      if (
        (!digitando || (alvo === buscaRef.current && !busca)) &&
        selecionado &&
        (evento.key === '+' || evento.key === '-')
      ) {
        evento.preventDefault()
        mudarQuantidade(selecionado, evento.key === '+' ? 1 : -1)
      }
    }
    window.addEventListener('keydown', atalhos)
    return () => window.removeEventListener('keydown', atalhos)
  })

  return (
    <div className="pdv-area mx-auto w-full max-w-[1600px] space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia pb-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-carvao uppercase">Balcão · PDV</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Frente de caixa</h1>
        </div>
        <Link href="/painel/caixa" className="pdv-botao">
          <span className="size-2 rounded-full bg-verde" aria-hidden />
          Caixa aberto
        </Link>
      </header>
      <p role="status" className="sr-only">
        {aviso}
      </p>
      {pixRecebido && !recibo && (
        <section
          role="status"
          className="space-y-3 rounded-xl border border-verde/30 bg-verde-clara p-4 text-[#176b3a]"
        >
          <p className="font-bold">
            Pix de {formatarBRL(cobrancaPix.valor)} recebido · conclua o registro da venda
          </p>
          <p className="text-sm">
            Se precisar corrigir o carrinho, o valor já recebido será mantido. Não cobre este Pix novamente.
          </p>
          {!pagando && (
            <button type="button" className="pdv-botao" onClick={abrirPagamento}>
              Retomar registro da venda
            </button>
          )}
        </section>
      )}
      {recibo ? (
        <section
          className="pdv-sucesso rounded-xl border border-areia bg-branco p-5 sm:p-8"
          aria-labelledby="venda-concluida"
        >
          <div className="flex items-center gap-3 text-[#176b3a]">
            <Check aria-hidden className="size-7" />
            <p className="font-bold">Venda registrada</p>
          </div>
          <h2 id="venda-concluida" tabIndex={-1} ref={sucessoRef} className="mt-3 text-3xl font-extrabold">
            Venda nº {recibo.venda.numero}
          </h2>
          <p className="mt-2 text-carvao">
            Total recebido pela venda:{' '}
            <strong className="text-tinta">{formatarBRL(recibo.venda.total)}</strong>
          </p>
          <div role="status" className="my-6 rounded-xl bg-tinta p-6 text-papel">
            <p className="text-sm font-semibold">Troco a entregar</p>
            <p className="pdv-numero mt-1 font-extrabold tabular-nums">{formatarBRL(recibo.venda.troco)}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={novaVenda} className="pdv-botao pdv-primario">
              Nova venda
            </button>
            <button type="button" onClick={() => window.print()} className="pdv-botao">
              <Printer aria-hidden className="size-5" />
              Imprimir comprovante
            </button>
          </div>
          <ComprovanteVenda {...recibo} lojaNome={lojaNome} operador={operador} />
        </section>
      ) : (
        <>
          <div
            className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-carvao"
            aria-label="Atalhos de teclado"
          >
            <span>
              <kbd>F2</kbd> Buscar
            </span>
            <span>
              <kbd>F4</kbd> Pagar
            </span>
            <span>
              <kbd>Esc</kbd> Limpar busca / fechar
            </span>
            <span>
              <kbd>+ / −</kbd> Quantidade selecionada
            </span>
            <span>
              <kbd>Tab</kbd> Navegar · <kbd>Enter</kbd> Confirmar botão
            </span>
          </div>
          <div className="pdv-postos" inert={pagamentoTravado || undefined}>
            <section className="min-w-0" aria-label="Produtos">
              <form
                onSubmit={(evento) => {
                  evento.preventDefault()
                  lerBusca()
                }}
                className="space-y-2"
              >
                <label htmlFor="busca-pdv" className="text-sm font-bold">
                  Nome, SKU ou código de barras
                </label>
                <div className="flex gap-2">
                  <input
                    ref={buscaRef}
                    id="busca-pdv"
                    value={busca}
                    onChange={(evento) => {
                      definirBusca(evento.target.value)
                      definirErro('')
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Leia o código ou busque aqui"
                    className="pdv-campo min-h-14 flex-1"
                    aria-describedby="ajuda-busca"
                  />
                  <button
                    type="submit"
                    className="pdv-icone shrink-0 border border-areia bg-branco"
                    aria-label="Adicionar código ou resultado único"
                  >
                    <Search aria-hidden className="size-5" />
                  </button>
                </div>
                <p id="ajuda-busca" className="text-xs text-carvao">
                  Enter adiciona o código exato. Etiquetas de balança são lidas automaticamente.
                </p>
              </form>
              {erro && !pagando && !pesando && (
                <p role="alert" className="pdv-erro mt-3">
                  {erro}
                </p>
              )}
              <a href="#carrinho-pdv" className="pdv-botao mt-3 w-full lg:hidden">
                Ver carrinho · {linhas.length} produtos
              </a>
              <div className="my-4 flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Categorias">
                <button
                  type="button"
                  aria-pressed={!categoria}
                  onClick={() => definirCategoria('')}
                  className={`pdv-categoria ${!categoria ? 'pdv-ativa' : ''}`}
                >
                  Todos
                </button>
                {categorias.map((nome) => (
                  <button
                    type="button"
                    key={nome}
                    aria-pressed={categoria === nome}
                    onClick={() => definirCategoria(nome)}
                    className={`pdv-categoria ${categoria === nome ? 'pdv-ativa' : ''}`}
                  >
                    {nome}
                  </button>
                ))}
              </div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold">{categoria || 'Todos os produtos'}</h2>
                <span className="text-xs text-carvao">{filtrados.length} disponíveis</span>
              </div>
              {filtrados.length ? (
                <div className="pdv-grade">
                  {filtrados.map((produto) => (
                    <button
                      type="button"
                      key={produto.id}
                      className="pdv-produto"
                      onClick={() => adicionar(produto)}
                      aria-label={`Adicionar ${produto.nome}, ${formatarBRL(produto.preco)}${produto.vendidoPorPeso ? ' por quilo' : ' por unidade'}`}
                    >
                      <span className="text-[11px] font-bold tracking-wide text-carvao uppercase">
                        {produto.categoria || 'Balcão'}
                        {produto.sku ? ` · ${produto.sku}` : ''}
                      </span>
                      <span className="my-3 block text-base leading-snug font-bold">{produto.nome}</span>
                      <span className="mt-auto flex flex-wrap items-end justify-between gap-1">
                        <span className="text-xl font-extrabold tabular-nums">
                          {formatarBRL(produto.preco)}
                        </span>
                        <span className="text-xs text-carvao">/{produto.vendidoPorPeso ? 'kg' : 'un'}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-areia p-6 text-carvao">
                  <h3 className="font-bold text-tinta">
                    {produtos.length ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
                  </h3>
                  <p className="mt-2 text-sm">
                    {produtos.length
                      ? 'Confira a busca ou escolha outra categoria.'
                      : 'Disponibilize os produtos no catálogo para começar a vender.'}
                  </p>
                  {categoria && (
                    <button type="button" className="pdv-botao mt-4" onClick={() => definirCategoria('')}>
                      Buscar em todas as categorias
                    </button>
                  )}
                </div>
              )}
            </section>
            <section id="carrinho-pdv" className="pdv-carrinho" aria-labelledby="titulo-carrinho">
              <header className="flex items-center justify-between gap-3 border-b border-areia p-4">
                <h2 id="titulo-carrinho" className="text-lg font-bold">
                  Venda atual <span className="text-sm font-medium text-carvao">({linhas.length})</span>
                </h2>
                <button
                  type="button"
                  disabled={!linhas.length || pixRecebido}
                  onClick={() => definirLimpando(true)}
                  className="pdv-icone"
                  aria-label="Limpar venda"
                >
                  <Trash2 aria-hidden className="size-5" />
                </button>
              </header>
              {!linhas.length ? (
                <div className="px-6 py-9 text-center">
                  <ShoppingBasket aria-hidden className="mx-auto mb-3 size-8 text-carvao" />
                  <p className="font-bold">O próximo atendimento começa aqui</p>
                  <p className="mt-2 text-sm text-carvao">Leia um código ou toque em um produto.</p>
                </div>
              ) : (
                <ul className="pdv-itens divide-y divide-areia">
                  {linhas.map((linha, indice) => {
                    const { produto } = linha
                    const ativo = selecionado === produto.id
                    const item = resumo?.ok ? resumo.itens[indice] : undefined
                    return (
                      <li
                        key={produto.id}
                        className={`border-l-[3px] p-3 ${ativo ? 'border-l-tangerina bg-papel/70' : 'border-l-transparent'}`}
                        onFocus={() => definirSelecionado(produto.id)}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            type="button"
                            onClick={() => definirSelecionado(produto.id)}
                            aria-pressed={ativo}
                            className="min-h-12 min-w-0 flex-1 rounded-md py-1 text-left text-sm font-bold"
                          >
                            {produto.nome}
                            <span className="mt-1 block text-xs font-normal text-carvao">
                              {formatarBRL(produto.preco)} / {produto.vendidoPorPeso ? 'kg' : 'un'}
                            </span>
                          </button>
                          <span className="pt-3 text-sm font-extrabold tabular-nums">
                            {item ? formatarBRL(item.total) : '—'}
                          </span>
                          <button
                            type="button"
                            className="pdv-icone shrink-0"
                            aria-label={`Remover ${produto.nome}`}
                            onClick={() => remover(produto.id)}
                          >
                            <Trash2 aria-hidden className="size-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-end gap-2">
                          <div className="min-w-0 flex-1">
                            <label
                              htmlFor={`quantidade-${produto.id}`}
                              className="mb-1 block text-xs font-bold"
                            >
                              {produto.vendidoPorPeso ? 'Peso (kg)' : 'Quantidade'}
                            </label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                className="pdv-icone border border-areia"
                                disabled={numero(linha.quantidade, 3) <= (produto.vendidoPorPeso ? 0.001 : 1)}
                                aria-label={`Diminuir ${produto.vendidoPorPeso ? '1 grama de' : '1 unidade de'} ${produto.nome}`}
                                onClick={() => mudarQuantidade(produto.id, -1)}
                              >
                                <Minus aria-hidden className="size-4" />
                              </button>
                              <input
                                id={`quantidade-${produto.id}`}
                                inputMode={produto.vendidoPorPeso ? 'decimal' : 'numeric'}
                                value={linha.quantidade}
                                onChange={(evento) =>
                                  alterarLinha(produto.id, { quantidade: evento.target.value })
                                }
                                className="pdv-campo w-20 flex-1 text-center tabular-nums"
                                aria-invalid={
                                  !Number.isFinite(
                                    numero(linha.quantidade, produto.vendidoPorPeso ? 3 : 0),
                                  ) ||
                                  numero(linha.quantidade, 3) <= 0 ||
                                  numero(linha.quantidade, 3) > 9999
                                }
                              />
                              <button
                                type="button"
                                className="pdv-icone border border-areia"
                                aria-label={`Aumentar ${produto.vendidoPorPeso ? '1 grama de' : '1 unidade de'} ${produto.nome}`}
                                onClick={() => mudarQuantidade(produto.id, 1)}
                              >
                                <Plus aria-hidden className="size-4" />
                              </button>
                            </div>
                          </div>
                          <div className="w-24">
                            <label
                              htmlFor={`desconto-${produto.id}`}
                              className="mb-1 block text-xs font-bold"
                            >
                              Desconto R$
                            </label>
                            <input
                              id={`desconto-${produto.id}`}
                              inputMode="decimal"
                              placeholder="0,00"
                              value={linha.desconto}
                              onChange={(evento) =>
                                alterarLinha(produto.id, { desconto: evento.target.value })
                              }
                              className="pdv-campo text-right tabular-nums"
                              aria-invalid={!Number.isFinite(numero(linha.desconto))}
                            />
                          </div>
                        </div>
                        {produto.vendidoPorPeso && (
                          <button
                            type="button"
                            onClick={() => {
                              definirPeso(linha.quantidade)
                              definirPesando({ produto, editar: true })
                            }}
                            className="mt-1 min-h-12 rounded-md text-xs font-bold underline underline-offset-4"
                          >
                            Digitar peso · botões ajustam 1 g
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
              <div className="space-y-3 border-t border-areia p-4">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="desconto-geral" className="text-sm font-bold">
                    Desconto geral (R$)
                  </label>
                  <input
                    id="desconto-geral"
                    inputMode="decimal"
                    value={desconto}
                    placeholder="0,00"
                    disabled={!linhas.length}
                    onChange={(evento) => {
                      definirDesconto(evento.target.value)
                      limparPagamentos()
                    }}
                    className="pdv-campo max-w-28 text-right tabular-nums"
                    aria-invalid={!Number.isFinite(descontoGeral)}
                  />
                </div>
                {erroCarrinho && (
                  <p role="alert" className="pdv-erro">
                    {erroCarrinho}
                  </p>
                )}
                <div className="rounded-xl bg-tinta p-4 text-papel" aria-live="polite" aria-atomic="true">
                  <span className="text-sm font-semibold">Total da venda</span>
                  <p className="pdv-numero mt-1 font-extrabold tabular-nums">
                    {total === null && linhas.length ? '—' : formatarBRL(total ?? 0)}
                  </p>
                  {resumo?.ok && resumo.desconto > 0 && (
                    <p className="mt-1 text-xs">Descontos: {formatarBRL(resumo.desconto)}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={abrirPagamento}
                  disabled={!linhas.length || total === null}
                  className="pdv-botao pdv-primario w-full text-base"
                >
                  Ir para pagamento <kbd className="ml-auto">F4</kbd>
                </button>
              </div>
            </section>
          </div>
        </>
      )}
      {incerto && (
        <section role="alert" className="pdv-erro space-y-3">
          <h2 className="font-bold">Confira se a venda foi registrada</h2>
          <p>
            A resposta da última tentativa não chegou. Compare o total e o horário na lista abaixo antes de
            continuar.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => router.refresh()} className="pdv-botao">
              Atualizar vendas
            </button>
            <button type="button" onClick={novaVenda} className="pdv-botao">
              A venda já está na lista · nova venda
            </button>
            <button
              type="button"
              onClick={() => {
                definirIncerto(false)
                definirErro('')
                definirPagando(true)
              }}
              className="pdv-botao"
            >
              Conferi: não foi registrada · voltar ao pagamento
            </button>
          </div>
        </section>
      )}
      <div id="vendas-pdv">
        <UltimasVendas vendas={vendas} />
      </div>

      {pesando && (
        <DialogoPdv
          titulo={`${pesando.editar ? 'Alterar peso' : 'Produto por peso'} · ${pesando.produto.nome}`}
          fechar={() => {
            definirPesando(null)
            definirErro('')
          }}
        >
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              const quantidade = numero(peso, 3)
              if (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > 9999) {
                definirErro('Informe um peso maior que zero, até 9.999 kg, com no máximo 3 casas decimais.')
                return
              }
              if (pesando.editar) alterarLinha(pesando.produto.id, { quantidade: decimal(quantidade, 3) })
              else if (!adicionar(pesando.produto, quantidade)) return
              definirPesando(null)
            }}
            className="space-y-4"
          >
            <p className="text-carvao">
              Preço por kg: <strong>{formatarBRL(pesando.produto.preco)}</strong>
            </p>
            <label htmlFor="peso-pdv" className="block font-bold">
              Peso em quilogramas
            </label>
            <input
              data-foco-inicial
              id="peso-pdv"
              inputMode="decimal"
              placeholder="0,000"
              required
              value={peso}
              onChange={(evento) => definirPeso(evento.target.value)}
              className="pdv-campo text-3xl tabular-nums"
            />
            <p className="text-sm text-carvao">Exemplo: 0,250 = 250 gramas.</p>
            {erro && (
              <p role="alert" className="pdv-erro">
                {erro}
              </p>
            )}
            <button type="submit" className="pdv-botao pdv-primario w-full">
              {pesando.editar ? 'Atualizar peso' : 'Adicionar ao carrinho'}
            </button>
          </form>
        </DialogoPdv>
      )}
      {limpando && (
        <DialogoPdv titulo="Limpar esta venda?" fechar={() => definirLimpando(false)}>
          <p className="text-carvao">
            Os produtos e descontos desta venda serão removidos. Nenhuma venda será registrada.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              data-foco-inicial
              type="button"
              className="pdv-botao"
              onClick={() => definirLimpando(false)}
            >
              Continuar atendimento
            </button>
            <button
              type="button"
              className="pdv-botao border-vermelho text-vermelho"
              onClick={() => {
                definirLimpando(false)
                novaVenda()
              }}
            >
              Limpar venda
            </button>
          </div>
        </DialogoPdv>
      )}
      {pagando && (
        <DialogoPdv
          titulo="Receber pagamento"
          ocupado={pendente || pagamentoTravado}
          fechar={() => {
            definirPagando(false)
            definirErro('')
          }}
        >
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              confirmarVenda()
            }}
          >
            <fieldset disabled={pendente || gerandoPix} className="min-w-0 space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-areia pb-4">
                <p className="text-sm font-bold">Total a receber</p>
                <p className="text-4xl font-extrabold tabular-nums" aria-live="polite">
                  {formatarBRL(total ?? 0)}
                </p>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold">Escolha uma ou mais formas</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FORMAS_RECEBIMENTO.map((forma, indice) => (
                    <button
                      key={forma}
                      data-foco-inicial={indice === 0 ? true : undefined}
                      type="button"
                      disabled={
                        recebimentos.length >= 6 || pagamentoTravado || (pixRecebido && forma === 'pix')
                      }
                      onClick={() => adicionarForma(forma)}
                      className="pdv-botao justify-start text-left"
                    >
                      {ROTULO_FORMA[forma]}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-carvao">
                  Até 6 recebimentos. Confirme Pix e cartão antes de concluir.
                </p>
              </div>
              {recebimentos.length > 0 && (
                <div className="space-y-3">
                  {recebimentos.map((recebimento) => (
                    <div key={recebimento.chave} className="flex items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor={`pagamento-${recebimento.chave}`}
                          className="mb-1 block text-sm font-bold"
                        >
                          {ROTULO_FORMA[recebimento.forma]} ·{' '}
                          {recebimento.forma === 'dinheiro' ? 'valor recebido' : 'valor pago'} (R$)
                        </label>
                        <input
                          id={`pagamento-${recebimento.chave}`}
                          inputMode="decimal"
                          required
                          disabled={pagamentoTravado || (pixRecebido && recebimento.forma === 'pix')}
                          value={recebimento.valor}
                          onChange={(evento) => {
                            definirRecebimentos((atuais) =>
                              atuais.map((item) =>
                                item.chave === recebimento.chave
                                  ? { ...item, valor: evento.target.value }
                                  : item,
                              ),
                            )
                            definirErro('')
                          }}
                          className="pdv-campo text-xl tabular-nums"
                          aria-invalid={
                            !Number.isFinite(numero(recebimento.valor)) || numero(recebimento.valor) <= 0
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="pdv-icone border border-areia"
                        disabled={pagamentoTravado || (pixRecebido && recebimento.forma === 'pix')}
                        onClick={() =>
                          definirRecebimentos((atuais) =>
                            atuais.filter((item) => item.chave !== recebimento.chave),
                          )
                        }
                        aria-label={`Remover recebimento em ${ROTULO_FORMA[recebimento.forma]}`}
                      >
                        <Trash2 aria-hidden className="size-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                aria-live="polite"
                aria-atomic="true"
                className={`rounded-xl p-4 ${podeConfirmar ? 'bg-tinta text-papel' : 'bg-papel-2 text-tinta'}`}
              >
                {!recebimentos.length ? (
                  <>
                    <p className="text-sm font-bold">Falta receber</p>
                    <p className="pdv-numero mt-1 font-extrabold tabular-nums">{formatarBRL(total ?? 0)}</p>
                  </>
                ) : pagamentoInvalido ? (
                  <p className="font-bold">Informe um valor válido em cada recebimento.</p>
                ) : calculo.ok ? (
                  <>
                    <p className="text-sm font-bold">Troco em dinheiro</p>
                    <p className="pdv-numero mt-1 font-extrabold tabular-nums">
                      {formatarBRL(calculo.troco)}
                    </p>
                    <p className="mt-1 text-sm">
                      {podeConfirmar
                        ? pixEmCurso
                          ? 'Aguardando a confirmação do Pix abaixo.'
                          : 'Valores completos. Confira o recebimento antes de confirmar.'
                        : 'Escolha uma forma de pagamento.'}
                    </p>
                  </>
                ) : calculo.falta !== undefined ? (
                  <>
                    <p className="text-sm font-bold">Falta receber</p>
                    <p className="pdv-numero mt-1 font-extrabold tabular-nums">
                      {formatarBRL(calculo.falta)}
                    </p>
                  </>
                ) : (
                  <p className="font-bold">{calculo.erro}</p>
                )}
              </div>
              <details className="rounded-xl border border-areia px-3">
                <summary className="min-h-12 cursor-pointer py-3 text-sm font-bold">
                  Identificar cliente / observação (opcional)
                </summary>
                <div className="space-y-3 pb-3">
                  <label htmlFor="cliente-pdv" className="block text-sm font-bold">
                    Nome do cliente
                    <input
                      id="cliente-pdv"
                      disabled={pagamentoTravado}
                      value={cliente}
                      onChange={(evento) => definirCliente(evento.target.value)}
                      maxLength={120}
                      className="pdv-campo mt-1"
                      autoComplete="off"
                    />
                  </label>
                  <label htmlFor="observacoes-pdv" className="block text-sm font-bold">
                    Observação da venda
                    <textarea
                      id="observacoes-pdv"
                      disabled={pagamentoTravado}
                      value={observacoes}
                      onChange={(evento) => definirObservacoes(evento.target.value)}
                      maxLength={300}
                      rows={2}
                      className="pdv-campo mt-1"
                    />
                  </label>
                </div>
              </details>
              {pixAtivo && valorPix > 0 && (
                <section
                  ref={painelQrRef}
                  tabIndex={-1}
                  className="pix-area scroll-mt-4 space-y-3 rounded-xl border border-areia bg-branco p-3 sm:p-4"
                  aria-label="Recebimento por Pix"
                >
                  {cobrancaPix ? (
                    <>
                      <QrPix
                        cobranca={cobrancaPix}
                        onAtualizar={definirCobrancaPix}
                        onCancelar={() => definirCobrancaPix(null)}
                        onPago={() => {
                          if (pixConfirmado.current) return
                          pixConfirmado.current = true
                          confirmarVenda(true)
                        }}
                      />
                      {pixRecebido && (
                        <p role="status" className="text-sm font-semibold text-[#176b3a]">
                          {pendente
                            ? 'Registrando a venda…'
                            : 'Pix recebido. Se a venda ainda não foi registrada, conclua abaixo.'}
                        </p>
                      )}
                      {!pixEmCurso && !pixRecebido && (
                        <button
                          type="button"
                          className="pdv-botao w-full"
                          onClick={() => definirCobrancaPix(null)}
                        >
                          Voltar ao pagamento
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 font-bold">
                        <QrCode aria-hidden className="size-5" /> Pix no balcão
                      </div>
                      <p className="text-sm text-carvao">
                        Gere o QR de {formatarBRL(valorPix)}. Quando o Pix cair, a venda será registrada.
                      </p>
                      {pagamentos.some((pagamento) => pagamento.forma !== 'pix') && (
                        <p className="text-sm font-semibold text-carvao">
                          Confira os outros recebimentos antes de gerar o QR.
                        </p>
                      )}
                      <button
                        type="button"
                        className="pdv-botao pdv-primario w-full"
                        disabled={!podeConfirmar || gerandoPix}
                        onClick={gerarPix}
                      >
                        {gerandoPix ? 'Gerando QR Pix…' : 'Gerar QR Pix'}
                      </button>
                      {!podeConfirmar && (
                        <p className="text-sm text-carvao">
                          Complete os valores do pagamento para gerar o QR.
                        </p>
                      )}
                    </>
                  )}
                </section>
              )}
              {erro && (
                <p role="alert" className="pdv-erro">
                  {erro}
                </p>
              )}
              {pixRecebido && !pendente && !incerto && (
                <button
                  type="button"
                  className="pdv-botao w-full"
                  onClick={() => {
                    definirPagando(false)
                    router.refresh()
                  }}
                >
                  Corrigir carrinho · manter Pix recebido
                </button>
              )}
              {incerto && (
                <button
                  type="button"
                  className="pdv-botao w-full"
                  onClick={() => {
                    definirPagando(false)
                    router.refresh()
                    requestAnimationFrame(() =>
                      document.getElementById('vendas-pdv')?.scrollIntoView({ block: 'start' }),
                    )
                  }}
                >
                  Consultar vendas antes de continuar
                </button>
              )}
              <button
                type="submit"
                disabled={!podeConfirmar || pendente || gerandoPix || pixEmCurso}
                className="pdv-botao pdv-primario min-h-14 w-full text-base"
              >
                {pendente
                  ? 'Registrando venda…'
                  : pixRecebido
                    ? 'Concluir registro da venda'
                    : pixAtivo && valorPix > 0
                      ? 'Recebi de outro jeito'
                      : 'Confirmar venda'}
              </button>
            </fieldset>
          </form>
        </DialogoPdv>
      )}
      {dialogo}
    </div>
  )
}
