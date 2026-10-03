'use client'

import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import type { FichaProduto } from '@/lib/dados/estoque'
import { custoFicha, margem, precoSugerido } from '@/lib/dominio/ficha'
import { formatarBRL } from '@/lib/dominio/moeda'
import { salvarFichaAction } from '../actions'
import { BOTAO, CampoEstoque, PRIMARIO, SeloMargem } from './apresentacao'

type InsumoFicha = { id: string; nome: string; unidade: string; custoUnitario: number; ativo: boolean }
type LinhaEdicao = { insumoId: string; quantidade: string }
const percentual = (valor: number | null) =>
  valor === null ? '—' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

function lerQuantidade(texto: string) {
  const limpo = texto.trim()
  if (!/^\d+(?:[.,]\d{1,3})?$/.test(limpo)) return NaN
  const valor = Number(limpo.replace(',', '.'))
  return valor > 0 && valor <= 9999 ? valor : NaN
}

export function EditorFicha({ ficha, insumos }: { ficha: FichaProduto; insumos: InsumoFicha[] }) {
  const roteador = useRouter()
  const formulario = useRef<HTMLFormElement>(null)
  const trava = useRef(false)
  const iniciais = ficha.linhas.map((linha) => ({
    insumoId: linha.insumoId,
    quantidade: String(linha.quantidade).replace('.', ','),
  }))
  const [linhas, definirLinhas] = useState<LinhaEdicao[]>(iniciais)
  const [assinaturaSalva, definirAssinaturaSalva] = useState(JSON.stringify(iniciais))
  const [busca, definirBusca] = useState('')
  const [cmvAlvo, definirCmvAlvo] = useState(35)
  const [erro, definirErro] = useState('')
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [sucesso, definirSucesso] = useState('')
  const [pendente, iniciarTransicao] = useTransition()
  const alterada = JSON.stringify(linhas) !== assinaturaSalva
  const selecionados = new Set(linhas.map((linha) => linha.insumoId))
  const disponiveis = insumos.filter((insumo) => insumo.ativo && !selecionados.has(insumo.id))
  const encontrados = disponiveis.filter((insumo) =>
    insumo.nome.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR')),
  )
  const completos = linhas.map((linha) => {
    const insumo = insumos.find((item) => item.id === linha.insumoId)
    const original = ficha.linhas.find((item) => item.insumoId === linha.insumoId)
    return {
      ...linha,
      nome: insumo?.nome ?? original?.insumo ?? 'Insumo indisponível',
      unidade: insumo?.unidade ?? original?.unidade ?? '',
      custoUnitario: insumo?.custoUnitario ?? original?.custoUnitario ?? 0,
      ativo: insumo?.ativo ?? false,
      quantidadeNumerica: lerQuantidade(linha.quantidade),
    }
  })
  const valoresValidos = completos.every((linha) => Number.isFinite(linha.quantidadeNumerica))
  const custo = custoFicha(
    completos.map((linha) => ({
      insumo: linha.nome,
      quantidade: Number.isFinite(linha.quantidadeNumerica) ? linha.quantidadeNumerica : 0,
      custoUnitario: linha.custoUnitario,
    })),
  )
  const margemAtual = margem(ficha.produto.preco, custo.custo)
  const podeMostrarCalculo = completos.length > 0 && valoresValidos
  const sugestao = podeMostrarCalculo ? precoSugerido(custo.custo, cmvAlvo) : null
  const semCusto = completos.filter((linha) => linha.custoUnitario === 0).length

  useEffect(() => {
    if (!alterada) return
    const avisar = (evento: BeforeUnloadEvent) => evento.preventDefault()
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [alterada])

  function limparFeedback() {
    definirErro('')
    definirErros({})
    definirSucesso('')
  }
  function focarErro() {
    requestAnimationFrame(() =>
      formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    )
  }
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (trava.current || pendente) return
    limparFeedback()
    const porCampo: Record<string, string> = {}
    completos.forEach((linha, indice) => {
      if (!Number.isFinite(linha.quantidadeNumerica))
        porCampo[`linhas.${indice}.quantidade`] =
          'Informe uma quantidade maior que zero, até 9.999, com até 3 casas decimais.'
    })
    if (Object.keys(porCampo).length) {
      definirErros(porCampo)
      definirErro('Revise as quantidades destacadas antes de salvar.')
      focarErro()
      return
    }
    const entrada = {
      produtoId: ficha.produto.id,
      linhas: completos.map((linha) => ({ insumoId: linha.insumoId, quantidade: linha.quantidadeNumerica })),
    }
    const assinatura = JSON.stringify(linhas)
    trava.current = true
    iniciarTransicao(async () => {
      try {
        const resposta = await salvarFichaAction(entrada)
        if (!resposta.ok) {
          definirErro(resposta.erro)
          definirErros(resposta.porCampo ?? {})
          focarErro()
          return
        }
        definirAssinaturaSalva(assinatura)
        definirSucesso(
          entrada.linhas.length
            ? 'Ficha técnica salva. Os custos e as margens foram atualizados.'
            : 'Ficha esvaziada. Este produto voltou à lista de produtos sem ficha.',
        )
        roteador.refresh()
      } catch {
        definirErro(
          'Não foi possível confirmar a gravação. Seu rascunho continua aqui. Confira a ficha em outra aba antes de tentar salvar novamente.',
        )
      } finally {
        trava.current = false
      }
    })
  }

  return (
    <form ref={formulario} onSubmit={salvar} noValidate aria-busy={pendente} className="space-y-5">
      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-vermelho/30 bg-vermelho-clara p-4 text-sm text-vermelho"
        >
          {erro}
        </p>
      )}
      {sucesso && (
        <p
          role="status"
          className="rounded-lg border border-verde/30 bg-verde-clara p-4 text-sm text-[#176b3a]"
        >
          {sucesso}
        </p>
      )}
      {Object.entries(erros)
        .filter(([campo]) => !/^linhas\.\d+\.quantidade$/.test(campo))
        .map(([campo, mensagem]) => (
          <p key={campo} role="alert" className="text-sm text-vermelho">
            {mensagem}
          </p>
        ))}
      <fieldset
        disabled={pendente}
        className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
      >
        <legend className="sr-only">Ingredientes e custos de {ficha.produto.nome}</legend>
        <div className="min-w-0 space-y-5">
          <section
            className="rounded-xl border border-areia bg-branco"
            aria-labelledby="ficha-insumos-titulo"
          >
            <header className="border-b border-areia bg-papel-2 p-4">
              <h2 id="ficha-insumos-titulo" className="font-sans text-lg font-bold">
                Insumos por unidade vendida
              </h2>
              <p className="mt-1 text-sm text-carvao">
                {linhas.length} de até 60 insumos. Informe o consumo na unidade indicada.
              </p>
            </header>
            {completos.length === 0 ? (
              <p className="p-5 text-sm text-carvao">
                Adicione o primeiro insumo abaixo para montar a ficha técnica.
              </p>
            ) : (
              <ul className="divide-y divide-areia">
                {completos.map((linha, indice) => (
                  <li key={linha.insumoId} className="space-y-4 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-sans text-base font-bold break-words">{linha.nome}</h3>
                        <p className="mt-1 text-xs text-carvao">
                          Custo médio: {formatarBRL(linha.custoUnitario)} / {linha.unidade}
                        </p>
                        {!linha.ativo && (
                          <p className="mt-2 text-xs font-semibold text-[#805000]">
                            Insumo inativo. Continua nesta ficha até ser removido.
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        className={`${BOTAO} shrink-0 px-3!`}
                        aria-label={`Remover ${linha.nome} da ficha`}
                        onClick={() => {
                          definirLinhas((atuais) => atuais.filter((item) => item.insumoId !== linha.insumoId))
                          limparFeedback()
                        }}
                      >
                        <Trash2 aria-hidden="true" className="size-5" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
                      <CampoEstoque
                        name={`quantidade-${linha.insumoId}`}
                        rotulo={`Quantidade (${linha.unidade})`}
                        inputMode="decimal"
                        autoComplete="off"
                        value={linha.quantidade}
                        maxLength={12}
                        erro={erros[`linhas.${indice}.quantidade`]}
                        onChange={(evento) => {
                          definirLinhas((atuais) =>
                            atuais.map((item) =>
                              item.insumoId === linha.insumoId
                                ? { ...item, quantidade: evento.target.value }
                                : item,
                            ),
                          )
                          limparFeedback()
                        }}
                      />
                      <dl className="grid min-h-12 grid-cols-2 gap-3 rounded-lg bg-papel-2 px-3 py-2 text-sm">
                        <div>
                          <dt className="text-xs text-carvao">Custo na ficha</dt>
                          <dd className="mt-1 font-bold tabular-nums">
                            {Number.isFinite(linha.quantidadeNumerica)
                              ? formatarBRL(custo.linhas[indice]?.custo ?? 0)
                              : '—'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-carvao">Participação</dt>
                          <dd className="mt-1 font-bold tabular-nums">
                            {valoresValidos ? percentual(custo.linhas[indice]?.participacao ?? null) : '—'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section
            className="space-y-4 rounded-xl border border-areia bg-papel-2 p-4 sm:p-5"
            aria-labelledby="ficha-adicionar-titulo"
          >
            <h2 id="ficha-adicionar-titulo" className="font-sans text-lg font-bold">
              Adicionar insumo
            </h2>
            {linhas.length >= 60 ? (
              <p className="text-sm text-carvao">A ficha chegou ao limite de 60 insumos.</p>
            ) : (
              <>
                <CampoEstoque
                  name="busca-insumo-ficha"
                  rotulo="Buscar insumo ativo"
                  type="search"
                  value={busca}
                  onChange={(evento) => definirBusca(evento.target.value)}
                  placeholder="Nome do ingrediente ou embalagem"
                />
                <div className="max-h-80 space-y-2 overflow-y-auto overscroll-contain">
                  {encontrados.slice(0, 30).map((insumo) => (
                    <button
                      key={insumo.id}
                      type="button"
                      className={`${BOTAO} w-full justify-between! text-left`}
                      onClick={() => {
                        definirLinhas((atuais) => [...atuais, { insumoId: insumo.id, quantidade: '1' }])
                        definirBusca('')
                        limparFeedback()
                      }}
                    >
                      <span className="min-w-0">
                        <span className="block break-words">{insumo.nome}</span>
                        <span className="mt-1 block text-xs font-normal text-carvao">
                          {formatarBRL(insumo.custoUnitario)} / {insumo.unidade}
                        </span>
                      </span>
                      <Plus className="size-5 shrink-0" aria-hidden="true" />
                    </button>
                  ))}
                </div>
                {encontrados.length > 30 && (
                  <p className="text-xs text-carvao">
                    Exibindo 30 de {encontrados.length}. Digite mais letras para encontrar o insumo.
                  </p>
                )}
                {encontrados.length === 0 && (
                  <p className="text-sm text-carvao">
                    {disponiveis.length
                      ? 'Nenhum insumo encontrado com esta busca.'
                      : 'Todos os insumos ativos já estão na ficha, ou ainda não há insumos cadastrados.'}
                  </p>
                )}
              </>
            )}
            <Link
              href="/painel/estoque/insumos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center text-sm font-bold underline underline-offset-4"
            >
              Gerenciar insumos (nova aba)
            </Link>
          </section>
        </div>
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-6" aria-label="Prévia dos custos e da margem">
          <section className="rounded-xl bg-tinta p-5 text-papel" aria-live="polite" aria-atomic="true">
            <p className="text-sm font-bold text-areia">Custo por unidade</p>
            <p className="mt-2 text-4xl font-bold break-words tabular-nums">
              {podeMostrarCalculo ? formatarBRL(custo.custo) : '—'}
            </p>
            <dl className="mt-5 space-y-3 border-t border-carvao pt-4 text-sm">
              {[
                ['Preço de venda atual', formatarBRL(ficha.produto.preco)],
                ['CMV', podeMostrarCalculo ? percentual(margemAtual.cmvPercentual) : '—'],
                ['Lucro bruto por unidade', podeMostrarCalculo ? formatarBRL(margemAtual.lucroBruto) : '—'],
                ['Margem bruta', podeMostrarCalculo ? percentual(margemAtual.margemPercentual) : '—'],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="flex flex-wrap justify-between gap-x-3 gap-y-1">
                  <dt className="text-areia">{rotulo}</dt>
                  <dd className="font-bold tabular-nums">{valor}</dd>
                </div>
              ))}
            </dl>
            {podeMostrarCalculo && (
              <div className="mt-4">
                <SeloMargem situacao={margemAtual.situacao} />
              </div>
            )}
            {!valoresValidos && (
              <p className="mt-4 text-sm text-areia">Preencha as quantidades para atualizar a prévia.</p>
            )}
          </section>
          {semCusto > 0 && (
            <p className="rounded-lg border border-ambar/40 bg-ambar-clara p-4 text-sm text-[#805000]">
              {semCusto} {semCusto === 1 ? 'insumo está' : 'insumos estão'} com custo zerado. Confira as
              entradas de estoque: a margem pode estar superestimada.
            </p>
          )}
          <section
            className="space-y-4 rounded-xl border border-areia bg-branco p-5"
            aria-labelledby="ficha-preco-titulo"
          >
            <h2 id="ficha-preco-titulo" className="font-sans text-lg font-bold">
              Preço sugerido
            </h2>
            <label htmlFor="cmv-alvo-ficha" className="flex justify-between gap-3 text-sm font-bold">
              <span>CMV alvo</span>
              <output htmlFor="cmv-alvo-ficha">{cmvAlvo}%</output>
            </label>
            <input
              id="cmv-alvo-ficha"
              type="range"
              min={30}
              max={35}
              step={1}
              value={cmvAlvo}
              onChange={(evento) => definirCmvAlvo(Number(evento.target.value))}
              className="min-h-12 w-full accent-tangerina"
            />
            <div className="flex justify-between text-xs text-carvao">
              <span>30%</span>
              <span>35%</span>
            </div>
            <p aria-live="polite" className="text-3xl font-bold tabular-nums">
              {sugestao === null ? '—' : formatarBRL(sugestao)}
            </p>
            <p className="text-xs leading-relaxed text-carvao">
              Referência calculada a partir dos insumos. Não inclui taxas ou despesas fixas e não altera o
              preço do produto.
            </p>
          </section>
          {!linhas.length && ficha.linhas.length > 0 && (
            <p className="rounded-lg border border-ambar/40 bg-ambar-clara p-4 text-sm text-[#805000]">
              Ao salvar sem insumos, você remove a ficha técnica deste produto.
            </p>
          )}
          <button
            type="submit"
            disabled={pendente || (!alterada && linhas.length === 0)}
            className={`${PRIMARIO} w-full`}
          >
            {pendente ? 'Salvando ficha…' : linhas.length ? 'Salvar ficha técnica' : 'Salvar ficha vazia'}
          </button>
          <p role="status" className="text-center text-xs text-carvao">
            {alterada ? 'Há alterações ainda não salvas.' : 'Nenhuma alteração pendente.'}
          </p>
        </aside>
      </fieldset>
    </form>
  )
}
