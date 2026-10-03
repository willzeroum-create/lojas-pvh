'use client'

import { Minus, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ProdutoPdv } from '@/lib/dados/pdv'
import { formatarBRL } from '@/lib/dominio/moeda'
import { lancarItensAction } from '../../actions'
import { escreverNumero, lerNumero, type ExecutarComanda } from './campos-comanda'

type Linha = { chave: number; produto: ProdutoPdv; quantidade: string; observacao: string }
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

export function LancarItens({
  comandaId,
  produtos,
  ocupado,
  executar,
  aoConcluir,
  aoAlterarRascunho,
}: {
  comandaId: string
  produtos: ProdutoPdv[]
  ocupado: boolean
  executar: ExecutarComanda
  aoConcluir: () => void
  aoAlterarRascunho: (quantidade: number) => void
}) {
  const [busca, definirBusca] = useState('')
  const [categoria, definirCategoria] = useState('')
  const [linhas, definirLinhas] = useState<Linha[]>([])
  const [aviso, definirAviso] = useState('')
  const [erro, definirErro] = useState('')
  const sequencia = useRef(0)
  const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]))
  const linhasAtuais = linhas.map((linha) => ({
    ...linha,
    produto: produtosPorId.get(linha.produto.id) ?? linha.produto,
  }))
  const temIndisponivel = linhas.some((linha) => !produtosPorId.has(linha.produto.id))
  const categorias = [...new Set(produtos.map((produto) => produto.categoria || 'Sem categoria'))]
  const termo = normalizar(busca)
  const filtrados = produtos.filter(
    (produto) =>
      (!categoria || (produto.categoria || 'Sem categoria') === categoria) &&
      (!termo ||
        normalizar(`${produto.nome} ${produto.sku ?? ''} ${produto.codigoBarras ?? ''}`).includes(termo)),
  )
  const itens = linhasAtuais.map((linha) => ({
    produtoId: linha.produto.id,
    quantidade: lerNumero(linha.quantidade, linha.produto.vendidoPorPeso ? 3 : 0),
    observacao: linha.observacao.trim() || undefined,
  }))
  const invalido =
    temIndisponivel ||
    itens.some((item) => !Number.isFinite(item.quantidade) || item.quantidade <= 0 || item.quantidade > 999)
  const total =
    linhasAtuais.reduce(
      (soma, linha) => soma + Math.round(lerNumero(linha.quantidade, 3) * linha.produto.preco * 100),
      0,
    ) / 100

  useEffect(() => {
    if (!linhas.length) return
    const avisarSaida = (evento: BeforeUnloadEvent) => evento.preventDefault()
    window.addEventListener('beforeunload', avisarSaida)
    return () => window.removeEventListener('beforeunload', avisarSaida)
  }, [linhas.length])

  function adicionar(produto: ProdutoPdv) {
    if (linhas.length >= 100) {
      definirErro('Envie estes itens antes de adicionar outros. Cada envio comporta até 100 linhas.')
      return
    }
    const chave = ++sequencia.current
    definirLinhas((atuais) => [
      ...atuais,
      { chave, produto, quantidade: produto.vendidoPorPeso ? '' : '1', observacao: '' },
    ])
    aoAlterarRascunho(linhas.length + 1)
    definirAviso(`${produto.nome} adicionado ao próximo envio.`)
    definirErro('')
    if (produto.vendidoPorPeso)
      requestAnimationFrame(() => document.getElementById(`quantidade-comanda-${chave}`)?.focus())
  }

  function alterar(chave: number, mudanca: Partial<Pick<Linha, 'quantidade' | 'observacao'>>) {
    definirLinhas((atuais) =>
      atuais.map((linha) => (linha.chave === chave ? { ...linha, ...mudanca } : linha)),
    )
    definirErro('')
  }

  return (
    <section aria-labelledby="lancar-titulo" className="space-y-5">
      <header>
        <p className="text-xs font-bold tracking-widest text-carvao uppercase">Próximo pedido</p>
        <h2 id="lancar-titulo" className="mt-1 text-2xl font-bold">
          Lançar itens
        </h2>
        <p className="mt-1 text-sm text-carvao">Monte o pedido e envie todos os itens de uma vez.</p>
      </header>
      <p role="status" className="sr-only">
        {aviso}
      </p>
      {linhas.length > 0 && (
        <div className="sticky top-3 z-10 rounded-lg shadow-md xl:hidden">
          <button
            type="button"
            className="pdv-botao pdv-primario w-full"
            onClick={() => {
              const destino = document.getElementById('envio-comanda')
              destino?.focus({ preventScroll: true })
              destino?.scrollIntoView({ block: 'start' })
            }}
          >
            Ver envio ({linhas.length}) · {invalido ? 'revisar quantidades' : formatarBRL(total)}
          </button>
        </div>
      )}
      <fieldset disabled={ocupado} className="min-w-0 space-y-5">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
          <section className="min-w-0 rounded-xl border border-areia bg-branco p-4">
            <label htmlFor="busca-comanda" className="mb-2 block text-sm font-bold">
              Buscar produto
            </label>
            <div className="relative">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-3.5 left-3 size-5 text-carvao"
              />
              <input
                id="busca-comanda"
                type="search"
                value={busca}
                onChange={(evento) => definirBusca(evento.target.value)}
                className="pdv-campo pl-11!"
                placeholder="Nome, código ou SKU"
                autoComplete="off"
              />
            </div>
            {categorias.length > 1 && (
              <div className="mt-3">
                <label htmlFor="categoria-comanda" className="mb-1 block text-sm font-bold">
                  Categoria
                </label>
                <select
                  id="categoria-comanda"
                  className="pdv-campo"
                  value={categoria}
                  onChange={(evento) => definirCategoria(evento.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <p className="my-3 text-xs text-carvao">
              {filtrados.length} {filtrados.length === 1 ? 'produto disponível' : 'produtos disponíveis'}
            </p>
            <div className="grid max-h-[55dvh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain p-1 sm:grid-cols-3 xl:max-h-[65dvh] xl:grid-cols-2">
              {filtrados.map((produto) => (
                <button
                  key={produto.id}
                  type="button"
                  className="pdv-produto gap-2"
                  onClick={() => adicionar(produto)}
                  aria-label={`Adicionar ${produto.nome}, ${formatarBRL(produto.preco)}${produto.vendidoPorPeso ? ' por quilo' : ''}`}
                >
                  <span className="text-[11px] font-bold tracking-wide text-carvao uppercase">
                    {produto.categoria || 'Sem categoria'}
                  </span>
                  <span className="text-base leading-snug font-bold break-words">{produto.nome}</span>
                  <span className="mt-auto flex w-full flex-wrap items-center justify-between gap-1 pt-2">
                    <span className="font-bold tabular-nums">
                      {formatarBRL(produto.preco)}
                      {produto.vendidoPorPeso && <small className="font-normal"> / kg</small>}
                    </span>
                    <Plus aria-hidden className="size-5 text-tangerina-escura" />
                  </span>
                </button>
              ))}
            </div>
            {!filtrados.length && (
              <p className="rounded-lg bg-papel-2 p-5 text-sm text-carvao">
                {produtos.length
                  ? 'Nenhum produto para esta busca. Experimente outro nome ou categoria.'
                  : 'Nenhum produto disponível. Confira o cardápio.'}
              </p>
            )}
          </section>
          <section className="min-w-0 self-start rounded-xl border border-areia bg-branco">
            <header className="flex items-center justify-between gap-3 border-b border-areia p-4">
              <h3 id="envio-comanda" tabIndex={-1} className="scroll-mt-20 text-lg font-bold">
                Neste envio
              </h3>
              <span className="text-sm font-bold tabular-nums">{linhas.length}/100</span>
            </header>
            {!linhas.length ? (
              <p className="p-5 text-sm text-carvao">
                Toque em um produto para começar. Use linhas separadas para observações diferentes.
              </p>
            ) : (
              <ol className="divide-y divide-areia">
                {linhasAtuais.map((linha, indice) => {
                  const quantidade = lerNumero(linha.quantidade, linha.produto.vendidoPorPeso ? 3 : 0)
                  const quantidadeValida = Number.isFinite(quantidade) && quantidade > 0 && quantidade <= 999
                  return (
                    <li key={linha.chave} className="space-y-3 p-4">
                      {!produtosPorId.has(linha.produto.id) && (
                        <p role="status" className="pdv-erro">
                          Este produto ficou indisponível. Retire esta linha antes de enviar.
                        </p>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="font-bold break-words">{linha.produto.nome}</h4>
                          <p className="mt-1 text-sm text-carvao tabular-nums">
                            {formatarBRL(linha.produto.preco)} / {linha.produto.vendidoPorPeso ? 'kg' : 'un.'}
                          </p>
                          <p className="mt-1 text-sm font-bold tabular-nums">
                            Total:{' '}
                            {quantidadeValida
                              ? formatarBRL(Math.round(quantidade * linha.produto.preco * 100) / 100)
                              : '—'}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="pdv-icone shrink-0"
                          aria-label={`Retirar linha ${indice + 1}: ${linha.produto.nome}`}
                          onClick={() => {
                            definirLinhas((atuais) => atuais.filter((item) => item.chave !== linha.chave))
                            aoAlterarRascunho(linhas.length - 1)
                          }}
                        >
                          <Trash2 aria-hidden className="size-5" />
                        </button>
                      </div>
                      <label
                        className="block text-sm font-bold"
                        htmlFor={`quantidade-comanda-${linha.chave}`}
                      >
                        {linha.produto.vendidoPorPeso ? 'Peso em kg (ex.: 0,250)' : 'Quantidade'}
                      </label>
                      <div className="flex items-center gap-2">
                        {!linha.produto.vendidoPorPeso && (
                          <button
                            type="button"
                            className="pdv-icone shrink-0 border border-areia"
                            aria-label={`Diminuir quantidade de ${linha.produto.nome}, linha ${indice + 1}`}
                            disabled={!quantidadeValida || quantidade <= 1}
                            onClick={() =>
                              alterar(linha.chave, { quantidade: escreverNumero(quantidade - 1, 0) })
                            }
                          >
                            <Minus aria-hidden className="size-4" />
                          </button>
                        )}
                        <input
                          id={`quantidade-comanda-${linha.chave}`}
                          inputMode={linha.produto.vendidoPorPeso ? 'decimal' : 'numeric'}
                          className="pdv-campo min-w-0 flex-1 text-center text-lg tabular-nums"
                          value={linha.quantidade}
                          onChange={(evento) => alterar(linha.chave, { quantidade: evento.target.value })}
                          aria-invalid={!quantidadeValida}
                          maxLength={7}
                        />
                        {!linha.produto.vendidoPorPeso && (
                          <button
                            type="button"
                            className="pdv-icone shrink-0 border border-areia"
                            aria-label={`Aumentar quantidade de ${linha.produto.nome}, linha ${indice + 1}`}
                            disabled={!quantidadeValida || quantidade >= 999}
                            onClick={() =>
                              alterar(linha.chave, { quantidade: escreverNumero(quantidade + 1, 0) })
                            }
                          >
                            <Plus aria-hidden className="size-4" />
                          </button>
                        )}
                      </div>
                      {!quantidadeValida && (
                        <p className="text-xs text-vermelho">
                          Informe{' '}
                          {linha.produto.vendidoPorPeso
                            ? 'um peso acima de zero, com até 3 casas decimais'
                            : 'uma quantidade inteira acima de zero'}
                          . Máximo: 999.
                        </p>
                      )}
                      <label
                        htmlFor={`observacao-comanda-${linha.chave}`}
                        className="block text-sm font-bold"
                      >
                        Observação para este item <span className="font-normal text-carvao">(opcional)</span>
                      </label>
                      <textarea
                        id={`observacao-comanda-${linha.chave}`}
                        className="pdv-campo"
                        maxLength={140}
                        rows={2}
                        placeholder="Ex.: sem cebola, carne bem passada"
                        value={linha.observacao}
                        onChange={(evento) => alterar(linha.chave, { observacao: evento.target.value })}
                      />
                    </li>
                  )
                })}
              </ol>
            )}
            <div className="space-y-3 border-t border-areia p-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <span className="text-sm font-bold">Subtotal deste envio</span>
                <strong className="text-2xl tabular-nums">{invalido ? '—' : formatarBRL(total)}</strong>
              </div>
              {erro && (
                <p className="pdv-erro" role="alert">
                  {erro}
                </p>
              )}
              <button
                type="button"
                disabled={!linhas.length || invalido || ocupado}
                className="pdv-botao pdv-primario min-h-14! w-full"
                onClick={async () => {
                  const concluiu = await executar(
                    () => lancarItensAction({ comandaId, itens }),
                    'Itens enviados. O preparo aparece na comanda.',
                  )
                  if (concluiu) {
                    definirLinhas([])
                    aoAlterarRascunho(0)
                    aoConcluir()
                  }
                }}
              >
                {ocupado ? 'Enviando…' : 'Enviar todos os itens'}
              </button>
            </div>
          </section>
        </div>
      </fieldset>
    </section>
  )
}
