'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Search } from 'lucide-react'
import { useRef, useState, useTransition, type ReactNode } from 'react'
import type { Carteira, CategoriaFinanceira } from '@/lib/dados/financeiro'
import { gerarParcelas, type ParcelaGerada, type TipoTitulo } from '@/lib/dominio/financeiro'
import { formatarBRL, interpretarBRL } from '@/lib/dominio/moeda'
import { esquemaTitulo } from '@/lib/validacao/financeiro'
import { validar } from '@/lib/validacao/zod'
import { criarContaAction } from '../actions'
import {
  CampoFinanceiro,
  ESTILO_BOTAO,
  ESTILO_PRIMARIO,
  FORMAS_PAGAMENTO,
  formatarDataFinanceira,
  SelecaoFinanceira,
  TextoFinanceiro,
} from './apresentacao'

type PessoaOpcao = { id: string; nome: string; nomeFantasia: string | null }

type Props = {
  tipo: TipoTitulo
  hoje: string
  carteiras: Carteira[]
  categorias: CategoriaFinanceira[]
  pessoas: PessoaOpcao[]
  totalPessoas: number
  pessoasIndisponiveis: boolean
  buscaInicial: string
}

function SecaoConta({
  numero,
  titulo,
  descricao,
  children,
}: {
  numero: string
  titulo: string
  descricao: string
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={`conta-secao-${numero}`}
      className="min-w-0 rounded-2xl border border-areia bg-branco"
    >
      <div className="flex items-start gap-3 rounded-t-2xl border-b border-areia bg-papel-2/50 px-4 py-5 sm:px-6">
        <span className="pt-0.5 text-xs font-extrabold tracking-wider text-carvao" aria-hidden="true">
          {numero}
        </span>
        <div className="min-w-0">
          <h2 id={`conta-secao-${numero}`} className="font-sans text-lg font-bold tracking-tight">
            {titulo}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-carvao">{descricao}</p>
        </div>
      </div>
      <div className="space-y-5 p-4 sm:p-6">{children}</div>
    </section>
  )
}

export function FormularioConta({
  tipo,
  hoje,
  carteiras,
  categorias,
  pessoas,
  totalPessoas,
  pessoasIndisponiveis,
  buscaInicial,
}: Props) {
  const roteador = useRouter()
  const formulario = useRef<HTMLFormElement>(null)
  const resumoErro = useRef<HTMLDivElement>(null)
  const [salvando, iniciarSalvamento] = useTransition()
  const [buscando, iniciarBusca] = useTransition()
  const [navegando, setNavegando] = useState(false)
  const [conferenciaPendente, setConferenciaPendente] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState('')
  const [busca, setBusca] = useState(buscaInicial)
  const [pessoaSelecionada, setPessoaSelecionada] = useState<PessoaOpcao | null>(null)
  const [jaPago, setJaPago] = useState(false)
  const [dados, setDados] = useState({
    descricao: '',
    categoriaId: '',
    valor: '',
    parcelas: '1',
    primeiroVencimento: hoje,
    competencia: hoje,
    documento: '',
    observacoes: '',
    pagoEm: hoje,
    carteiraId: '',
    forma: 'pix',
  })

  const ocupado = salvando || navegando || buscando
  const valor = interpretarBRL(dados.valor)
  const quantidade = Number(dados.parcelas)
  const pessoasDisponiveis =
    pessoaSelecionada && !pessoas.some((pessoa) => pessoa.id === pessoaSelecionada.id)
      ? [pessoaSelecionada, ...pessoas]
      : pessoas
  let previsao: ParcelaGerada[] = []
  if (
    valor !== null &&
    valor > 0 &&
    Number.isInteger(quantidade) &&
    quantidade >= 1 &&
    quantidade <= 60 &&
    Math.round(valor * 100) >= quantidade &&
    dados.primeiroVencimento
  ) {
    try {
      previsao = gerarParcelas(valor, quantidade, dados.primeiroVencimento)
    } catch {
      // A prévia só aparece quando os campos formam um parcelamento válido.
    }
  }

  function limparErro(campo: string) {
    setErros((anteriores) => {
      const atualizados = { ...anteriores }
      delete atualizados[campo]
      return atualizados
    })
  }

  function alterarDado(campo: keyof typeof dados, valorCampo: string) {
    setDados((anteriores) => ({ ...anteriores, [campo]: valorCampo }))
    limparErro(campo)
    if (campo === 'valor') limparErro('parcelas')
  }

  function focarErro(porCampo?: Record<string, string>) {
    requestAnimationFrame(() => {
      const nome = Object.keys(porCampo ?? {})[0]
      const campo = nome && formulario.current?.elements.namedItem(nome)
      if (campo instanceof HTMLElement) campo.focus()
      else resumoErro.current?.focus()
    })
  }

  function buscarPessoas() {
    if (ocupado) return
    const parametros = new URLSearchParams({ tipo })
    if (busca.trim()) parametros.set('busca', busca.trim())
    iniciarBusca(() =>
      roteador.replace(`/painel/financeiro/contas/nova?${parametros.toString()}`, { scroll: false }),
    )
  }

  function salvar() {
    if (ocupado || conferenciaPendente) return
    setErroGeral('')
    setErros({})
    const entrada = {
      ...dados,
      tipo,
      pessoaId: pessoaSelecionada?.id,
      pagoEm: jaPago ? dados.pagoEm : undefined,
      carteiraId: jaPago ? dados.carteiraId : undefined,
      forma: jaPago ? dados.forma : undefined,
    }
    const validacao = validar(esquemaTitulo, entrada)
    const porCampo: Record<string, string> = validacao.ok ? {} : { ...validacao.porCampo }
    if (
      valor !== null &&
      valor > 0 &&
      Number.isInteger(quantidade) &&
      quantidade >= 1 &&
      quantidade <= 60 &&
      Math.round(valor * 100) < quantidade
    ) {
      porCampo.parcelas = 'Reduza o número de parcelas. Cada parcela precisa ter pelo menos R$ 0,01.'
    }
    if (jaPago && !dados.pagoEm) porCampo.pagoEm = 'Informe a data do pagamento.'
    if (jaPago && !dados.carteiraId) porCampo.carteiraId = 'Escolha a carteira do pagamento.'
    if (jaPago && !dados.forma) porCampo.forma = 'Escolha a forma de pagamento.'
    if (Object.keys(porCampo).length > 0) {
      setErros(porCampo)
      setErroGeral('Confira os campos indicados antes de salvar.')
      focarErro(porCampo)
      return
    }
    iniciarSalvamento(async () => {
      try {
        const resultado = await criarContaAction(entrada)
        if (!resultado.ok) {
          if (resultado.erro.startsWith('A conta foi criada, mas não foi possível dar baixa')) {
            setConferenciaPendente(true)
            setErroGeral(
              'A conta foi criada, mas não foi possível registrar o pagamento. Abra a conta na lista para conferir e concluir o pagamento.',
            )
            focarErro()
            return
          }
          setErroGeral(resultado.erro)
          setErros(resultado.porCampo ?? {})
          focarErro(resultado.porCampo)
          return
        }
        setNavegando(true)
        roteador.push(`/painel/financeiro/contas/${resultado.id}`)
        roteador.refresh()
      } catch {
        setNavegando(false)
        setConferenciaPendente(true)
        setErroGeral(
          'Não foi possível confirmar se a conta foi salva. Seus campos foram mantidos. Confira a lista antes de cadastrar outra conta para evitar duplicidade.',
        )
        focarErro()
      }
    })
  }

  return (
    <form
      ref={formulario}
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault()
        salvar()
      }}
      className="space-y-5"
      aria-busy={ocupado}
    >
      <fieldset disabled={ocupado} className="min-w-0 space-y-5">
        <legend className="sr-only">Nova conta a {tipo}</legend>
        <SecaoConta
          numero="01"
          titulo="Identifique a conta"
          descricao="Descrição e categoria ajudam a entender de onde vem e para onde vai o dinheiro."
        >
          <CampoFinanceiro
            name="descricao"
            rotulo="Descrição"
            required
            maxLength={120}
            placeholder={tipo === 'receber' ? 'Ex.: venda de mercadorias' : 'Ex.: aluguel da loja'}
            value={dados.descricao}
            onChange={(evento) => alterarDado('descricao', evento.target.value)}
            erro={erros.descricao}
          />
          <SelecaoFinanceira
            name="categoriaId"
            rotulo="Categoria"
            required
            value={dados.categoriaId}
            onChange={(evento) => alterarDado('categoriaId', evento.target.value)}
            erro={erros.categoriaId}
            ajuda={
              categorias.length === 0
                ? 'Não há categorias ativas para esta conta. Peça ao responsável para ativar uma categoria.'
                : undefined
            }
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </SelecaoFinanceira>
          <div className="space-y-4 rounded-xl border border-areia bg-papel/60 p-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
              <CampoFinanceiro
                name="buscaPessoa"
                rotulo={`Buscar ${tipo === 'receber' ? 'cliente' : 'fornecedor'} (opcional)`}
                placeholder="Nome, documento ou WhatsApp"
                maxLength={100}
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter') {
                    evento.preventDefault()
                    buscarPessoas()
                  }
                }}
                className="flex-1"
              />
              <button type="button" onClick={buscarPessoas} className={`${ESTILO_BOTAO} sm:mt-7`}>
                <Search size={17} aria-hidden="true" />
                {buscando ? 'Buscando…' : 'Buscar'}
              </button>
            </div>
            <SelecaoFinanceira
              name="pessoaId"
              rotulo={tipo === 'receber' ? 'Cliente' : 'Fornecedor'}
              value={pessoaSelecionada?.id ?? ''}
              onChange={(evento) => {
                setPessoaSelecionada(
                  pessoasDisponiveis.find((pessoa) => pessoa.id === evento.target.value) ?? null,
                )
                limparErro('pessoaId')
              }}
              erro={erros.pessoaId}
              ajuda="Vincular um cadastro é opcional. Você pode salvar a conta sem ele."
            >
              <option value="">Sem vínculo com cadastro</option>
              {pessoasDisponiveis.map((pessoa) => (
                <option key={pessoa.id} value={pessoa.id}>
                  {pessoa.nomeFantasia ? `${pessoa.nomeFantasia} · ${pessoa.nome}` : pessoa.nome}
                </option>
              ))}
            </SelecaoFinanceira>
            <p role="status" className="text-sm leading-relaxed text-carvao">
              {buscando
                ? 'Buscando cadastros…'
                : pessoasIndisponiveis
                  ? 'Os cadastros estão indisponíveis agora. Continue sem vincular uma pessoa.'
                  : pessoas.length === 0
                    ? buscaInicial
                      ? 'Nenhum cadastro encontrado para esta busca.'
                      : 'Nenhum cadastro disponível.'
                    : totalPessoas > pessoas.length
                      ? `Mostrando ${pessoas.length} de ${totalPessoas} cadastros. Busque pelo nome para encontrar outro.`
                      : `${pessoas.length} ${pessoas.length === 1 ? 'cadastro disponível' : 'cadastros disponíveis'}.`}
            </p>
          </div>
        </SecaoConta>

        <SecaoConta
          numero="02"
          titulo="Valor e vencimentos"
          descricao="As parcelas são mensais. Confira os valores e as datas antes de salvar."
        >
          <div className="grid min-w-0 gap-5 sm:grid-cols-2">
            <CampoFinanceiro
              name="valor"
              rotulo="Valor total (R$)"
              required
              inputMode="decimal"
              placeholder="0,00"
              value={dados.valor}
              onChange={(evento) => alterarDado('valor', evento.target.value)}
              erro={erros.valor}
              ajuda="Informe o total da conta, antes de dividir em parcelas."
            />
            <CampoFinanceiro
              name="parcelas"
              rotulo="Número de parcelas"
              required
              type="number"
              inputMode="numeric"
              min={1}
              max={60}
              step={1}
              value={dados.parcelas}
              onChange={(evento) => alterarDado('parcelas', evento.target.value)}
              erro={erros.parcelas}
              ajuda="De 1 a 60 parcelas."
            />
            <CampoFinanceiro
              name="primeiroVencimento"
              rotulo="Primeiro vencimento"
              required
              type="date"
              value={dados.primeiroVencimento}
              onChange={(evento) => alterarDado('primeiroVencimento', evento.target.value)}
              erro={erros.primeiroVencimento}
            />
            <CampoFinanceiro
              name="competencia"
              rotulo="Data de competência"
              required
              type="date"
              value={dados.competencia}
              onChange={(evento) => alterarDado('competencia', evento.target.value)}
              erro={erros.competencia}
              ajuda="Data da venda ou despesa. Define o mês no resultado."
            />
          </div>
          <section aria-labelledby="previa-parcelas" className="rounded-xl border border-areia bg-papel/60">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-areia px-4 py-4">
              <h3 id="previa-parcelas" className="text-sm font-bold text-tinta">
                Prévia das parcelas
              </h3>
              <p className="text-sm font-bold text-tinta tabular-nums">
                {valor !== null ? formatarBRL(valor) : 'Informe o valor'}
              </p>
            </div>
            {previsao.length > 0 ? (
              <div
                className="max-h-80 overflow-y-auto rounded-b-xl focus-visible:outline-2 focus-visible:outline-tangerina"
                tabIndex={previsao.length > 4 ? 0 : undefined}
                role="region"
                aria-label="Vencimentos e valores das parcelas"
              >
                <table className="w-full table-fixed text-left text-sm tabular-nums">
                  <thead className="bg-papel-2 text-carvao">
                    <tr>
                      <th scope="col" className="w-1/4 px-3 py-3 font-semibold sm:px-4">
                        Parcela
                      </th>
                      <th scope="col" className="px-3 py-3 font-semibold sm:px-4">
                        Vence em
                      </th>
                      <th scope="col" className="px-3 py-3 text-right font-semibold sm:px-4">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-areia">
                    {previsao.map((parcela) => (
                      <tr key={parcela.numero}>
                        <th scope="row" className="px-3 py-3 font-semibold sm:px-4">
                          {parcela.numero}/{previsao.length}
                        </th>
                        <td className="px-3 py-3 sm:px-4">
                          <time dateTime={parcela.vencimento}>
                            {formatarDataFinanceira(parcela.vencimento)}
                          </time>
                        </td>
                        <td className="px-3 py-3 text-right font-bold break-words sm:px-4">
                          {formatarBRL(parcela.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-4 text-sm leading-relaxed text-carvao">
                Preencha o valor, o número de parcelas e o primeiro vencimento para conferir a divisão.
              </p>
            )}
          </section>
          {previsao.length > 1 && (
            <p className="text-sm leading-relaxed text-carvao">
              Vencimentos no fim do mês se ajustam ao último dia disponível. A diferença de centavos fica na
              primeira parcela.
            </p>
          )}
        </SecaoConta>

        <SecaoConta
          numero="03"
          titulo="Pagamento e detalhes"
          descricao="Se o dinheiro já entrou ou saiu, registre o pagamento junto com a conta."
        >
          <label
            className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border p-4 ${jaPago ? 'border-tinta bg-papel-2' : 'border-areia bg-branco'}`}
          >
            <input
              type="checkbox"
              name="jaPago"
              checked={jaPago}
              onChange={(evento) => {
                setJaPago(evento.target.checked)
                limparErro('pagoEm')
                limparErro('carteiraId')
                limparErro('forma')
              }}
              className="h-5 w-5 shrink-0 accent-tinta"
              aria-controls="detalhes-pagamento"
            />
            <span className="min-w-0">
              <span className="block font-bold text-tinta">
                {tipo === 'receber' ? 'Já foi recebido' : 'Já foi pago'}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-carvao">
                O valor total já foi quitado.
              </span>
            </span>
          </label>
          <div id="detalhes-pagamento" hidden={!jaPago} className="space-y-4">
            <p className="rounded-xl border border-areia bg-papel-2 px-4 py-3 text-sm leading-relaxed text-carvao">
              Ao salvar, todas as parcelas serão marcadas como pagas nesta data. Para pagamento parcial, salve
              a conta em aberto e registre o valor no detalhe.
            </p>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <CampoFinanceiro
                name="pagoEm"
                rotulo="Data do pagamento"
                required={jaPago}
                type="date"
                value={dados.pagoEm}
                onChange={(evento) => alterarDado('pagoEm', evento.target.value)}
                erro={erros.pagoEm}
              />
              <SelecaoFinanceira
                name="carteiraId"
                rotulo="Carteira"
                required={jaPago}
                value={dados.carteiraId}
                onChange={(evento) => alterarDado('carteiraId', evento.target.value)}
                erro={erros.carteiraId}
                ajuda={
                  carteiras.length === 0
                    ? 'Não há carteiras ativas. Salve a conta em aberto até ativar uma carteira.'
                    : undefined
                }
              >
                <option value="">Selecione a carteira</option>
                {carteiras.map((carteira) => (
                  <option key={carteira.id} value={carteira.id}>
                    {carteira.nome}
                  </option>
                ))}
              </SelecaoFinanceira>
              <SelecaoFinanceira
                name="forma"
                rotulo="Forma de pagamento"
                required={jaPago}
                value={dados.forma}
                onChange={(evento) => alterarDado('forma', evento.target.value)}
                erro={erros.forma}
              >
                {FORMAS_PAGAMENTO.map((forma) => (
                  <option key={forma.valor} value={forma.valor}>
                    {forma.rotulo}
                  </option>
                ))}
              </SelecaoFinanceira>
            </div>
          </div>
          <CampoFinanceiro
            name="documento"
            rotulo="Documento (opcional)"
            placeholder="Ex.: nota fiscal, recibo ou número do pedido"
            maxLength={60}
            value={dados.documento}
            onChange={(evento) => alterarDado('documento', evento.target.value)}
            erro={erros.documento}
          />
          <TextoFinanceiro
            name="observacoes"
            rotulo="Observações (opcional)"
            rows={3}
            maxLength={1000}
            value={dados.observacoes}
            onChange={(evento) => alterarDado('observacoes', evento.target.value)}
            erro={erros.observacoes}
          />
        </SecaoConta>
      </fieldset>

      {erroGeral && (
        <div
          ref={resumoErro}
          id="erro-salvar-conta"
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-vermelho/30 bg-vermelho/5 p-4 text-sm leading-relaxed font-semibold text-vermelho"
        >
          <p>{erroGeral}</p>
          {conferenciaPendente && (
            <Link
              href={`/painel/financeiro/${tipo}?situacao=todas`}
              className={`${ESTILO_BOTAO} mt-3 w-full sm:w-auto`}
            >
              Conferir conta na lista
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-2xl border border-areia bg-papel-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-extrabold tracking-[0.12em] text-carvao uppercase">Total a {tipo}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight break-words text-tinta tabular-nums">
            {valor !== null ? formatarBRL(valor) : 'R$ 0,00'}
          </p>
          <p className="mt-1 text-sm text-carvao">
            {conferenciaPendente
              ? 'Confira a conta na lista antes de fazer um novo cadastro.'
              : jaPago
                ? 'Será registrado como quitado.'
                : previsao.length > 1
                  ? `${previsao.length} parcelas mensais em aberto.`
                  : 'Será registrado em aberto.'}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <button
            type="submit"
            disabled={ocupado || conferenciaPendente || categorias.length === 0}
            aria-describedby={conferenciaPendente ? 'erro-salvar-conta' : undefined}
            className={ESTILO_PRIMARIO}
          >
            {navegando ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
            {navegando ? 'Conta salva…' : salvando ? 'Salvando conta…' : 'Salvar conta'}
          </button>
          <Link
            href={`/painel/financeiro/${tipo}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-carvao hover:text-tinta"
            aria-disabled={ocupado || undefined}
            onClick={(evento) => {
              if (ocupado) evento.preventDefault()
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {conferenciaPendente ? 'Voltar às contas' : 'Voltar sem salvar'}
          </Link>
        </div>
      </div>
    </form>
  )
}
