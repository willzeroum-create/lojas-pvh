'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, CheckCheck, Save } from 'lucide-react'
import type { DetalheEntrada, ItemEstoque } from '@/lib/dados/estoque'
import type { EstadoEntrada } from '@/lib/supabase/tipos'
import { formatarBRL } from '@/lib/dominio/moeda'
import { esquemaLigarItem } from '@/lib/validacao/estoque'
import { validar } from '@/lib/validacao/zod'
import { cancelarEntradaAction, concluirEntradaAction, ligarItemEntradaAction } from '../../actions'
import {
  BOTAO_ENTRADA,
  CampoEntrada,
  dataEntrada,
  PRIMARIO_ENTRADA,
  quantidadeEntrada,
  SeloEntrada,
} from './apresentacao'
import { chaveItem, SeletorItem } from './seletor-item'

type Vinculo = { alvo: string; fator: string }
type Duplicata = { numero: string; vencimento: string; valor: number }

export function ConferenciaEntrada({
  entrada,
  catalogo,
  financeiroAtivo,
}: {
  entrada: DetalheEntrada
  catalogo: ItemEstoque[]
  financeiroAtivo: boolean
}) {
  const roteador = useRouter()
  const iniciais = Object.fromEntries(
    entrada.itens.map((item) => [
      item.id,
      {
        alvo: item.produto_id
          ? `produto:${item.produto_id}`
          : item.insumo_id
            ? `insumo:${item.insumo_id}`
            : '',
        fator: String(item.fator),
      },
    ]),
  )
  const [vinculos, setVinculos] = useState<Record<string, Vinculo>>(iniciais)
  const [salvos, setSalvos] = useState<Record<string, Vinculo>>(iniciais)
  const [estado, setEstado] = useState<EstadoEntrada>(entrada.estado)
  const [ocupado, iniciar] = useTransition()
  const [resultadoIncerto, setResultadoIncerto] = useState(false)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [erros, setErros] = useState<Record<string, Record<string, string>>>({})
  const resumoErro = useRef<HTMLDivElement>(null)
  const pendente = estado === 'pendente'
  const semLigacao = entrada.itens.filter(
    (item) => !catalogo.some((opcao) => chaveItem(opcao) === vinculos[item.id]?.alvo),
  ).length
  const duplicatas: Duplicata[] = []
  if (Array.isArray(entrada.duplicatas)) {
    for (const parcela of entrada.duplicatas) {
      if (
        parcela &&
        typeof parcela === 'object' &&
        !Array.isArray(parcela) &&
        typeof parcela.numero === 'string' &&
        typeof parcela.vencimento === 'string' &&
        typeof parcela.valor === 'number'
      )
        duplicatas.push({ numero: parcela.numero, vencimento: parcela.vencimento, valor: parcela.valor })
    }
  }

  function alterado(id: string) {
    return vinculos[id]?.alvo !== salvos[id]?.alvo || vinculos[id]?.fator !== salvos[id]?.fator
  }
  const totalAlterados = entrada.itens.filter((item) => alterado(item.id)).length

  function alterar(id: string, dados: Partial<Vinculo>) {
    setVinculos((atuais) => ({
      ...atuais,
      [id]: { alvo: atuais[id]?.alvo ?? '', fator: atuais[id]?.fator ?? '1', ...dados },
    }))
    setErros((atuais) => ({ ...atuais, [id]: {} }))
    setSucesso('')
  }

  function falhar(mensagem: string, id?: string, campos?: Record<string, string>) {
    setErro(mensagem)
    if (id) setErros((atuais) => ({ ...atuais, [id]: campos ?? {} }))
    requestAnimationFrame(() => resumoErro.current?.focus())
  }

  async function salvar(id: string) {
    const vinculo = vinculos[id]
    if (!vinculo) return false
    const alvo = catalogo.find((opcao) => chaveItem(opcao) === vinculo.alvo)
    if (vinculo.alvo && !alvo) {
      falhar('Escolha um item disponível no estoque para continuar.', id, {
        alvo: 'O item vinculado não está disponível.',
      })
      return false
    }
    const validacao = validar(esquemaLigarItem, {
      itemId: id,
      alvo: alvo ? { tipo: alvo.tipo, id: alvo.id } : null,
      fator: vinculo.fator.trim().replace(',', '.'),
    })
    if (!validacao.ok) {
      falhar('Confira a ligação e o fator indicados.', id, validacao.porCampo)
      return false
    }
    const resultado = await ligarItemEntradaAction(validacao.dados)
    if (!resultado.ok) {
      falhar(resultado.erro, id, resultado.porCampo)
      return false
    }
    setSalvos((atuais) => ({ ...atuais, [id]: { ...vinculo } }))
    setErros((atuais) => ({ ...atuais, [id]: {} }))
    return true
  }

  function salvarUm(id: string) {
    setErro('')
    setSucesso('')
    iniciar(async () => {
      try {
        if (await salvar(id))
          setSucesso('Ligação e fator salvos. O saldo será atualizado ao concluir a entrada.')
      } catch {
        falhar('Não foi possível salvar. Verifique sua conexão e tente novamente.')
      }
    })
  }

  function concluir() {
    setErro('')
    setSucesso('')
    iniciar(async () => {
      let conclusaoEnviada = false
      try {
        for (const item of entrada.itens) if (alterado(item.id) && !(await salvar(item.id))) return
        conclusaoEnviada = true
        const resultado = await concluirEntradaAction(entrada.id)
        if (!resultado.ok) {
          setResultadoIncerto(true)
          falhar(
            `${resultado.erro} Confira o estado da entrada e as contas a pagar antes de tentar concluir novamente.`,
          )
          return
        }
        setEstado('concluida')
        setSucesso(
          `Entrada concluída. ${resultado.itens} ${resultado.itens === 1 ? 'item atualizado' : 'itens atualizados'} no estoque ${resultado.contasCriadas > 0 ? `e a nota lançada em contas a pagar (${resultado.contasCriadas} ${resultado.contasCriadas === 1 ? 'parcela' : 'parcelas'})` : 'sem duplicatas para o financeiro'}.`,
        )
        roteador.refresh()
      } catch {
        setResultadoIncerto(conclusaoEnviada)
        falhar(
          conclusaoEnviada
            ? 'Não recebemos a confirmação. Confira o estado da entrada e as contas a pagar antes de tentar concluir novamente.'
            : 'Não foi possível salvar as ligações. Verifique sua conexão e tente novamente.',
        )
      }
    })
  }

  function cancelar() {
    if (resultadoIncerto) return
    setErro('')
    iniciar(async () => {
      try {
        const resultado = await cancelarEntradaAction(entrada.id)
        if (!resultado.ok) {
          falhar(resultado.erro)
          return
        }
        setEstado('cancelada')
        setConfirmandoCancelamento(false)
        setSucesso('Entrada cancelada. Nenhum saldo foi alterado.')
        roteador.refresh()
      } catch {
        falhar('Não foi possível cancelar a entrada. Verifique sua conexão e tente novamente.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Estoque / {entrada.numero_nota ? `NF ${entrada.numero_nota}` : 'Entrada manual'}
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {pendente
              ? 'Confira antes de entrar.'
              : estado === 'concluida'
                ? 'Entrada concluída'
                : 'Entrada cancelada'}
          </h1>
          <p className="mt-2 text-sm break-words text-carvao">
            {entrada.fornecedor_nome ||
              (entrada.fornecedor_id ? 'Fornecedor cadastrado' : 'Fornecedor não informado')}{' '}
            · {dataEntrada(entrada.emitida_em ?? entrada.criado_em)}
          </p>
        </div>
        <div className="space-y-2">
          <SeloEntrada estado={estado} />
          <p className="text-3xl font-bold tracking-tight tabular-nums">{formatarBRL(entrada.valor_total)}</p>
        </div>
      </header>
      {erro && (
        <div
          ref={resumoErro}
          role="alert"
          tabIndex={-1}
          className="rounded-xl border border-vermelho/30 bg-vermelho-clara p-4 text-sm text-vermelho focus:outline-2 focus:outline-vermelho"
        >
          {erro}
        </div>
      )}
      {sucesso && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-xl border border-verde/30 bg-verde-clara p-4 text-sm text-[#176b3a]"
        >
          <CheckCheck aria-hidden="true" className="size-5 shrink-0" />
          {sucesso}
        </p>
      )}
      {resultadoIncerto && (
        <Link href="/painel/estoque/entradas" className={BOTAO_ENTRADA}>
          Conferir o estado na lista de entradas
        </Link>
      )}
      {pendente && (
        <div
          className={`rounded-xl border p-4 text-sm ${semLigacao ? 'border-ambar/40 bg-ambar-clara text-[#7b4b00]' : 'border-areia bg-papel-2 text-carvao'}`}
        >
          <strong>
            {semLigacao
              ? `${semLigacao} ${semLigacao === 1 ? 'item precisa de ligação.' : 'itens precisam de ligação.'}`
              : 'Todos os itens estão ligados.'}
          </strong>
          <p className="mt-1 leading-relaxed">
            Confira a unidade e o fator: 1 caixa com 12 unidades usa fator 12. O saldo e o custo médio só
            mudam ao concluir.
          </p>
        </div>
      )}
      <section aria-labelledby="titulo-itens-entrada" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-itens-entrada" className="text-xl font-bold">
            Itens da compra <span className="text-carvao">({entrada.itens.length})</span>
          </h2>
          {pendente && totalAlterados > 0 && (
            <p role="status" className="text-sm text-[#7b4b00]">
              {totalAlterados} {totalAlterados === 1 ? 'item com alteração' : 'itens com alterações'} para
              salvar
            </p>
          )}
        </div>
        {entrada.itens.map((item, indice) => {
          const vinculo = vinculos[item.id] ?? { alvo: '', fator: '1' }
          const alvo = catalogo.find((opcao) => chaveItem(opcao) === vinculo.alvo)
          const fator = Number(vinculo.fator.replace(',', '.'))
          const fatorValido = Number.isFinite(fator) && fator > 0 && fator <= 10000
          const campos = erros[item.id] ?? {}
          return (
            <article
              key={item.id}
              className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-areia bg-papel-2/60 px-4 py-4 sm:px-5">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold tracking-wider text-carvao">
                    ITEM {String(indice + 1).padStart(2, '0')} · DESCRIÇÃO DA COMPRA
                  </p>
                  <h3 className="mt-1 font-bold break-words">{item.descricao}</h3>
                  {(item.codigo_fornecedor || item.ean) && (
                    <p className="mt-1 text-xs break-all text-carvao">
                      {item.codigo_fornecedor ? `Código: ${item.codigo_fornecedor}` : ''}
                      {item.ean ? ` · EAN: ${item.ean}` : ''}
                    </p>
                  )}
                </div>
                <p className="text-lg font-bold tabular-nums">{formatarBRL(item.valor_total)}</p>
              </header>
              <div className="grid min-w-0 gap-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                {pendente ? (
                  <fieldset disabled={ocupado || resultadoIncerto} className="min-w-0">
                    <legend className="sr-only">Ligação do item {indice + 1}</legend>
                    <SeletorItem
                      id={`ligacao-${item.id}`}
                      itens={catalogo}
                      valor={vinculo.alvo}
                      aoMudar={(alvoNovo) => alterar(item.id, { alvo: alvoNovo })}
                      disabled={ocupado || resultadoIncerto}
                      erro={campos.alvo || campos['alvo.id'] || campos['alvo.tipo']}
                    />
                  </fieldset>
                ) : (
                  <div>
                    <p className="text-sm text-carvao">Item no estoque</p>
                    <p className="mt-1 font-bold break-words">
                      {alvo?.nome ??
                        (item.produto_id
                          ? 'Produto vinculado indisponível no estoque atual'
                          : item.insumo_id
                            ? 'Insumo vinculado indisponível no estoque atual'
                            : 'Sem ligação')}
                    </p>
                    {alvo && (
                      <p className="mt-1 text-sm text-carvao">
                        {alvo.tipo === 'insumo' ? 'Insumo' : 'Produto'} · {alvo.unidade}
                      </p>
                    )}
                  </div>
                )}
                <div className="min-w-0 space-y-4">
                  {pendente && (
                    <CampoEntrada
                      id={`fator-${item.id}`}
                      rotulo="Fator de conversão"
                      inputMode="decimal"
                      value={vinculo.fator}
                      onChange={(evento) => alterar(item.id, { fator: evento.target.value })}
                      disabled={ocupado || resultadoIncerto}
                      erro={campos.fator}
                    />
                  )}
                  <div className="rounded-lg bg-papel px-4 py-3">
                    <p className="text-xs font-bold tracking-wide text-carvao uppercase">
                      Quantidade no estoque
                    </p>
                    <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base tabular-nums">
                      <span>
                        {quantidadeEntrada(item.quantidade_nota)} {item.unidade_nota ?? ''}
                      </span>
                      <span className="text-carvao">× {fatorValido ? quantidadeEntrada(fator) : '—'} =</span>
                      <strong className="text-2xl">
                        {fatorValido ? quantidadeEntrada(item.quantidade_nota * fator) : '—'}{' '}
                        {alvo?.unidade ?? ''}
                      </strong>
                    </p>
                    {fatorValido && (
                      <p className="mt-2 text-xs text-carvao">
                        Custo desta compra: {formatarBRL(item.valor_total / (item.quantidade_nota * fator))}{' '}
                        por {alvo?.unidade ?? 'unidade de estoque'}
                      </p>
                    )}
                  </div>
                  {pendente && (
                    <button
                      type="button"
                      disabled={ocupado || resultadoIncerto || !alterado(item.id)}
                      onClick={() => salvarUm(item.id)}
                      className={`${BOTAO_ENTRADA} w-full`}
                    >
                      {alterado(item.id) ? (
                        <Save aria-hidden="true" className="size-4" />
                      ) : (
                        <Check aria-hidden="true" className="size-4" />
                      )}
                      {alterado(item.id) ? 'Salvar ligação e fator' : alvo ? 'Ligação salva' : 'Sem ligação'}
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
        {!entrada.itens.length && (
          <p className="rounded-xl border border-areia bg-branco p-5 text-sm text-carvao">
            Esta entrada não possui itens. Cancele-a e registre a compra novamente.
          </p>
        )}
      </section>
      <section
        aria-labelledby="titulo-duplicatas"
        className="overflow-hidden rounded-xl border border-areia bg-branco"
      >
        <header className="border-b border-areia bg-papel-2/60 px-4 py-4 sm:px-5">
          <h2 id="titulo-duplicatas" className="font-bold">
            Duplicatas da nota
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-carvao">
            {financeiroAtivo
              ? 'Ao concluir, as duplicatas válidas viram contas a pagar no financeiro.'
              : 'O módulo Financeiro está desativado. Esta entrada não criará contas a pagar.'}
          </p>
        </header>
        {duplicatas.length ? (
          <ul className="divide-y divide-areia">
            {duplicatas.map((parcela, indice) => (
              <li
                key={`${parcela.numero}-${indice}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5"
              >
                <div>
                  <p className="text-sm font-bold">Duplicata {parcela.numero || indice + 1}</p>
                  <p className="mt-1 text-sm text-carvao">Vencimento: {dataEntrada(parcela.vencimento)}</p>
                </div>
                <strong className="text-xl tabular-nums">{formatarBRL(parcela.valor)}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-5 text-sm text-carvao sm:px-5">Nenhuma duplicata informada nesta compra.</p>
        )}
      </section>
      {entrada.observacoes && (
        <section className="rounded-xl border border-areia bg-papel-2 p-4">
          <h2 className="text-sm font-bold">Observações</h2>
          <p className="mt-2 text-sm whitespace-pre-wrap text-carvao">{entrada.observacoes}</p>
        </section>
      )}
      <p className="text-xs text-carvao">
        Registrada em {dataEntrada(entrada.criado_em)}
        {entrada.autor_nome ? ` por ${entrada.autor_nome}` : ''}.
        {entrada.concluida_em ? ` Concluída em ${dataEntrada(entrada.concluida_em)}.` : ''}
      </p>
      {pendente ? (
        <div className="space-y-4 rounded-xl border border-areia bg-papel-2 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">Pronto para atualizar o estoque?</p>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-carvao">
                As alterações de ligação e fator serão salvas antes da conclusão.
              </p>
            </div>
            <button
              type="button"
              disabled={
                ocupado ||
                resultadoIncerto ||
                semLigacao > 0 ||
                !entrada.itens.length ||
                confirmandoCancelamento
              }
              aria-busy={ocupado}
              onClick={concluir}
              className={`${PRIMARIO_ENTRADA} w-full sm:w-auto`}
            >
              <CheckCheck aria-hidden="true" className="size-5" />
              {resultadoIncerto
                ? 'Confira o estado da entrada'
                : ocupado
                  ? 'Processando…'
                  : 'Concluir entrada'}
            </button>
          </div>
          {semLigacao > 0 && (
            <p className="text-sm font-semibold text-[#7b4b00]">
              Ligue todos os itens para habilitar a conclusão.
            </p>
          )}
          {confirmandoCancelamento ? (
            <div className="space-y-3 border-t border-areia pt-4">
              <p className="text-sm font-bold">Cancelar esta entrada? O saldo continuará como está.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={ocupado || resultadoIncerto}
                  onClick={cancelar}
                  className={`${BOTAO_ENTRADA} border-vermelho/30 bg-vermelho-clara text-vermelho hover:bg-vermelho-clara`}
                >
                  Sim, cancelar entrada
                </button>
                <button
                  type="button"
                  disabled={ocupado || resultadoIncerto}
                  onClick={() => setConfirmandoCancelamento(false)}
                  className={BOTAO_ENTRADA}
                >
                  Continuar conferindo
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={ocupado || resultadoIncerto}
              onClick={() => setConfirmandoCancelamento(true)}
              className="min-h-12 rounded-lg px-2 text-sm font-semibold text-vermelho underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-vermelho"
            >
              Cancelar entrada
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/painel/estoque" className={PRIMARIO_ENTRADA}>
            Ver estoque atualizado
          </Link>
          <Link href="/painel/estoque/entradas" className={BOTAO_ENTRADA}>
            Voltar às entradas
          </Link>
        </div>
      )}
    </div>
  )
}
