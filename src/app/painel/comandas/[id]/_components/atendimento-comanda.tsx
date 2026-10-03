'use client'

import { ArrowLeft, ArrowRightLeft, Check, ChevronRight, Clock3, Plus, RefreshCw, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import type { DetalheComanda, ItemComanda, MesaMapa } from '@/lib/dados/comandas'
import type { ProdutoPdv } from '@/lib/dados/pdv'
import { formatarBRL } from '@/lib/dominio/moeda'
import {
  cancelarItemComandaAction,
  juntarComandasAction,
  pedirContaAction,
  removerItemAction,
  transferirMesaAction,
  type Resultado,
} from '../../actions'
import { FecharConta } from './fechar-conta'
import { LancarItens } from './lancar-itens'

type OutraComanda = { id: string; rotulo: string; total: number }
type Secao = 'consumo' | 'lancar' | 'fechar'

const PREPARO = {
  aguardando: { nome: 'Na fila', estilo: 'border-areia bg-papel-2 text-carvao' },
  em_preparo: { nome: 'Preparando', estilo: 'border-tangerina/30 bg-tangerina-clara text-[#923009]' },
  pronto: { nome: 'Pronto', estilo: 'border-verde/30 bg-verde-clara text-[#176737]' },
  entregue: { nome: 'Entregue', estilo: 'border-areia bg-papel-2 text-carvao' },
  cancelado: { nome: 'Cancelado', estilo: 'border-vermelho/30 bg-vermelho-clara text-[#a82a1a]' },
}

function TempoComanda({ abertaEm }: { abertaEm: string }) {
  const [agora, definirAgora] = useState(0)
  useEffect(() => {
    const atualizar = () => definirAgora(Date.now())
    const inicio = window.setTimeout(atualizar, 0)
    const relogio = window.setInterval(atualizar, 1000)
    return () => {
      window.clearTimeout(inicio)
      window.clearInterval(relogio)
    }
  }, [])
  const minutos = agora ? Math.max(0, Math.floor((agora - Date.parse(abertaEm)) / 60000)) : null
  return (
    <span className="tabular-nums">
      {minutos === null
        ? 'Calculando tempo'
        : minutos < 60
          ? `${minutos} min aberta`
          : `${Math.floor(minutos / 60)} h ${String(minutos % 60).padStart(2, '0')} min aberta`}
    </span>
  )
}

export function AtendimentoComanda({
  comanda,
  produtos,
  mesasLivres,
  outrasComandas,
  caixaEstaAberto,
  cancelamentoExigePin,
}: {
  comanda: DetalheComanda
  produtos: ProdutoPdv[]
  mesasLivres: MesaMapa[]
  outrasComandas: OutraComanda[]
  caixaEstaAberto: boolean
  cancelamentoExigePin: boolean
}) {
  const router = useRouter()
  const [atualizando, atualizar] = useTransition()
  const [ocupado, definirOcupado] = useState(false)
  const trava = useRef(false)
  const erroRef = useRef<HTMLDivElement>(null)
  const sucessoRef = useRef<HTMLHeadingElement>(null)
  const [erro, definirErro] = useState('')
  const [aviso, definirAviso] = useState('')
  const [incerto, definirIncerto] = useState(false)
  const [secao, definirSecao] = useState<Secao>('consumo')
  const [pagamentoVisitado, definirPagamentoVisitado] = useState(false)
  const [rascunho, definirRascunho] = useState(0)
  const [cancelando, definirCancelando] = useState<ItemComanda | null>(null)
  const [motivo, definirMotivo] = useState('')
  const [pinGerente, definirPinGerente] = useState('')
  const [mesaDestino, definirMesaDestino] = useState('')
  const [comandaOrigem, definirComandaOrigem] = useState('')
  const [operacaoMesa, definirOperacaoMesa] = useState<'transferir' | 'juntar' | null>(null)
  const [recibo, definirRecibo] = useState<{ total: number; troco: number } | null>(null)
  const aberta = !recibo && (comanda.estado === 'aberta' || comanda.estado === 'conta')
  const bloqueado = ocupado || incerto || !aberta
  const rotulo = comanda.mesa ? `Mesa ${comanda.mesa.numero}` : comanda.identificador || 'Comanda avulsa'
  const ativos = comanda.itens.filter((item) => item.preparo !== 'cancelado')
  const emPreparo = ativos.filter(
    (item) => item.preparo === 'aguardando' || item.preparo === 'em_preparo',
  ).length
  const prontos = ativos.filter((item) => item.preparo === 'pronto').length
  const origem = outrasComandas.find((outra) => outra.id === comandaOrigem)
  const mesa = mesasLivres.find((livre) => livre.id === mesaDestino)
  const revisao = `${comanda.pedido.subtotal}|${comanda.itens.map((item) => `${item.id}:${item.quantidade}:${item.total}:${item.preparo === 'cancelado'}`).join('|')}`

  useEffect(() => {
    if (!aberta) return
    const renovar = () => {
      if (!trava.current && document.visibilityState === 'visible') atualizar(() => router.refresh())
    }
    const intervalo = window.setInterval(renovar, 10000)
    document.addEventListener('visibilitychange', renovar)
    return () => {
      window.clearInterval(intervalo)
      document.removeEventListener('visibilitychange', renovar)
    }
  }, [aberta, router])

  useEffect(() => {
    if (recibo) sucessoRef.current?.focus()
  }, [recibo])
  useEffect(() => {
    if (erro) erroRef.current?.focus()
  }, [erro])

  async function executar(acao: () => Promise<Resultado>, mensagem: string, depois?: () => void) {
    if (trava.current || incerto || !aberta) return false
    trava.current = true
    definirOcupado(true)
    definirErro('')
    definirAviso('')
    try {
      const resposta = await acao()
      if (!resposta.ok) {
        definirErro([...new Set([resposta.erro, ...Object.values(resposta.porCampo ?? {})])].join(' '))
        atualizar(() => router.refresh())
        return false
      }
      definirAviso(mensagem)
      depois?.()
      atualizar(() => router.refresh())
      return true
    } catch {
      definirIncerto(true)
      definirErro(
        'A resposta não chegou. Atualize e confira o consumo e a situação da comanda antes de repetir a operação, para evitar itens ou pagamentos duplicados.',
      )
      atualizar(() => router.refresh())
      return false
    } finally {
      trava.current = false
      definirOcupado(false)
    }
  }

  function abrirSecao(proxima: Secao) {
    definirPinGerente('')
    definirSecao(proxima)
    definirErro('')
    definirOperacaoMesa(null)
    if (proxima === 'fechar') definirPagamentoVisitado(true)
  }

  return (
    <div className="pdv-area mx-auto max-w-6xl space-y-5 pb-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/painel/comandas" className="pdv-botao text-sm">
            <ArrowLeft aria-hidden className="size-4" />
            Mesas e comandas
          </Link>
          <button
            type="button"
            disabled={ocupado || atualizando}
            className="pdv-botao text-sm"
            onClick={() => atualizar(() => router.refresh())}
          >
            <RefreshCw aria-hidden className="size-4" />
            {atualizando ? 'Atualizando…' : 'Atualizar'}
          </button>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-widest text-carvao uppercase">
              Atendimento {comanda.pedido.numero !== null && `· Pedido #${comanda.pedido.numero}`}
            </p>
            <h1 className="mt-1 text-4xl leading-tight font-extrabold break-words">{rotulo}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-carvao">
              <span className="inline-flex items-center gap-1.5">
                <Users aria-hidden className="size-4" />
                {comanda.pessoas} {comanda.pessoas === 1 ? 'pessoa' : 'pessoas'}
              </span>
              {aberta && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden className="size-4" />
                  <TempoComanda abertaEm={comanda.aberta_em} />
                </span>
              )}
              {comanda.garcom_nome && <span>Atendimento: {comanda.garcom_nome}</span>}
            </div>
          </div>
          <span
            className={`rounded-md border px-3 py-2 text-xs font-bold tracking-wide uppercase ${!aberta ? 'border-areia bg-papel-2 text-carvao' : comanda.estado === 'conta' ? 'border-ambar bg-ambar-clara text-[#774800]' : 'border-tangerina/30 bg-tangerina-clara text-[#923009]'}`}
          >
            {recibo || comanda.estado === 'fechada'
              ? 'Conta fechada'
              : comanda.estado === 'cancelada'
                ? 'Comanda encerrada'
                : comanda.estado === 'conta'
                  ? 'Conta solicitada'
                  : 'Em atendimento'}
          </span>
        </div>
      </header>

      {erro && (
        <div ref={erroRef} tabIndex={-1} role="alert" className="pdv-erro">
          {erro}
        </div>
      )}
      {aviso && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-lg border border-verde/30 bg-verde-clara p-3 text-sm text-[#176737]"
        >
          <Check aria-hidden className="size-5 shrink-0" />
          {aviso}
        </p>
      )}
      {incerto && aberta && (
        <section className="space-y-3 rounded-xl border border-ambar bg-ambar-clara p-4">
          <h2 className="font-bold">Confira a última operação</h2>
          <p className="text-sm text-carvao">
            Veja se o item, a transferência ou o fechamento já aparece antes de continuar.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="pdv-botao"
              disabled={atualizando}
              onClick={() => atualizar(() => router.refresh())}
            >
              Atualizar comanda
            </button>
            <button
              type="button"
              disabled={atualizando}
              className="pdv-botao"
              onClick={() => {
                definirIncerto(false)
                definirErro('')
              }}
            >
              Conferi a comanda · continuar
            </button>
          </div>
        </section>
      )}
      {!aberta && (
        <section className="rounded-xl bg-tinta p-5 text-papel sm:p-6">
          <h2 ref={sucessoRef} tabIndex={-1} className="text-2xl font-bold">
            {recibo || comanda.estado === 'fechada' ? 'Conta encerrada' : 'Atendimento encerrado'}
          </h2>
          <p className="mt-2 text-sm">
            {recibo
              ? 'Recebimento registrado. A mesa já pode receber o próximo cliente.'
              : 'Confira abaixo o consumo que ficou registrado nesta comanda.'}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-sm">Total</dt>
              <dd className="mt-1 text-3xl font-extrabold tabular-nums">
                {formatarBRL(recibo?.total ?? comanda.pedido.total)}
              </dd>
            </div>
            {recibo && (
              <div>
                <dt className="text-sm">Troco em dinheiro</dt>
                <dd className="mt-1 text-3xl font-extrabold tabular-nums">{formatarBRL(recibo.troco)}</dd>
              </div>
            )}
          </dl>
          <Link href="/painel/comandas" className="pdv-botao mt-5 bg-papel! text-tinta!">
            Voltar às mesas
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        </section>
      )}

      {aberta && (
        <>
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl bg-tinta p-4 text-papel sm:p-5">
            <div>
              <p className="text-sm">Consumo da comanda</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">
                {formatarBRL(comanda.pedido.subtotal)}
              </p>
              <p className="mt-1 text-xs">Serviço e desconto no fechamento.</p>
            </div>
            <div className="text-right">
              <strong className="block text-2xl tabular-nums">{ativos.length}</strong>
              <span className="text-xs">{ativos.length === 1 ? 'item' : 'itens'}</span>
              {prontos > 0 && (
                <p className="mt-2 text-xs font-bold">
                  {prontos} {prontos === 1 ? 'pronto' : 'prontos'} para servir
                </p>
              )}
            </div>
          </div>
          <nav aria-label="Atendimento da comanda" className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={ocupado}
              aria-pressed={secao === 'consumo'}
              className={`pdv-botao text-sm ${secao === 'consumo' ? 'border-tinta! bg-tinta! text-papel!' : ''}`}
              onClick={() => abrirSecao('consumo')}
            >
              Consumo
            </button>
            <button
              type="button"
              disabled={bloqueado}
              aria-pressed={secao === 'lancar'}
              className={`pdv-botao text-sm ${secao === 'lancar' ? 'border-tinta! bg-tinta! text-papel!' : ''}`}
              onClick={() => abrirSecao('lancar')}
            >
              Lançar itens{rascunho > 0 ? ` (${rascunho})` : ''}
            </button>
            <button
              type="button"
              disabled={bloqueado || rascunho > 0}
              aria-pressed={secao === 'fechar'}
              className={`pdv-botao text-sm ${secao === 'fechar' ? 'border-tinta! bg-tinta! text-papel!' : ''}`}
              onClick={() => abrirSecao('fechar')}
            >
              Fechar conta
            </button>
          </nav>
          {rascunho > 0 && secao !== 'lancar' && (
            <p className="rounded-lg border border-ambar bg-ambar-clara p-3 text-sm text-[#774800]">
              Há {rascunho} {rascunho === 1 ? 'item' : 'itens'} no próximo envio. Envie ou retire esses itens
              em “Lançar itens” antes de fechar a conta.
            </p>
          )}
        </>
      )}

      <div hidden={aberta && secao !== 'consumo'} className="space-y-5">
        <section
          className="overflow-hidden rounded-xl border border-areia bg-branco"
          aria-labelledby="consumo-titulo"
        >
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-areia p-4">
            <h2 id="consumo-titulo" className="text-lg font-bold">
              Consumo
            </h2>
            {aberta && <span className="text-xs text-carvao">Cozinha atualiza a cada 10 s</span>}
          </header>
          {!comanda.itens.length ? (
            <div className="space-y-3 p-5">
              <p className="font-bold">
                {aberta ? 'A comanda está aberta. Pode anotar o pedido.' : 'Nenhum item nesta comanda.'}
              </p>
              <p className="text-sm text-carvao">
                {aberta
                  ? 'Os itens enviados aparecem aqui, junto com o andamento da cozinha.'
                  : 'Se o consumo foi juntado, os itens estão na comanda de destino.'}
              </p>
              {aberta && (
                <button
                  type="button"
                  className="pdv-botao pdv-primario"
                  disabled={bloqueado}
                  onClick={() => abrirSecao('lancar')}
                >
                  <Plus aria-hidden className="size-4" />
                  Lançar primeiros itens
                </button>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-areia">
              {comanda.itens.map((item) => {
                const estado = item.preparo ? PREPARO[item.preparo] : null
                const cancelado = item.preparo === 'cancelado'
                const podeCancelar =
                  item.preparo === 'aguardando' || item.preparo === 'em_preparo' || item.preparo === 'pronto'
                return (
                  <li key={item.id} className={`p-4 ${cancelado ? 'bg-papel-2' : ''}`}>
                    <div className="flex items-start gap-3">
                      <strong className="min-w-9 shrink-0 pt-0.5 text-xl tabular-nums">
                        {item.quantidade.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}
                        <span className="ml-0.5 text-xs font-normal">×</span>
                      </strong>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                          <h3
                            className={`min-w-0 text-base font-bold break-words ${cancelado ? 'text-carvao line-through' : ''}`}
                          >
                            {item.nome}
                          </h3>
                          <span
                            className={`shrink-0 font-bold tabular-nums ${cancelado ? 'text-carvao line-through' : ''}`}
                          >
                            {formatarBRL(item.total)}
                          </span>
                        </div>
                        <span
                          className={`mt-2 inline-flex rounded border px-2 py-1 text-[11px] font-bold tracking-wide uppercase ${estado?.estilo ?? 'border-areia bg-papel-2 text-carvao'}`}
                        >
                          {estado?.nome ?? 'Sem preparo na cozinha'}
                        </span>
                        {item.observacao && (
                          <p className="mt-3 border-l-2 border-tangerina pl-2 text-sm leading-relaxed font-semibold">
                            {item.observacao}
                          </p>
                        )}
                        {cancelado && (
                          <p className="mt-2 text-sm text-[#a82a1a]">
                            Motivo: {item.canceladoMotivo || 'Não informado'}
                          </p>
                        )}
                        {aberta && (podeCancelar || item.preparo === null) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.preparo === null ? (
                              <button
                                type="button"
                                className="pdv-botao text-xs"
                                disabled={bloqueado}
                                onClick={() =>
                                  executar(
                                    () => removerItemAction(comanda.id, item.id),
                                    `${item.nome} removido da comanda.`,
                                  )
                                }
                              >
                                Remover item
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="pdv-botao text-xs"
                                disabled={bloqueado}
                                aria-expanded={cancelando?.id === item.id}
                                onClick={() => {
                                  definirCancelando(item)
                                  definirMotivo('')
                                  definirPinGerente('')
                                  definirErro('')
                                }}
                              >
                                Cancelar com motivo
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {aberta && cancelando?.id === item.id && podeCancelar && (
                      <form
                        className="mt-4 space-y-3 rounded-lg border border-vermelho/40 bg-vermelho-clara p-3"
                        onSubmit={async (evento) => {
                          evento.preventDefault()
                          if (
                            motivo.trim().length < 3 ||
                            (cancelamentoExigePin && !/^[0-9]{4,6}$/.test(pinGerente))
                          )
                            return
                          const pin = pinGerente
                          definirPinGerente('')
                          await executar(
                            () =>
                              cancelarItemComandaAction(comanda.id, {
                                itemId: item.id,
                                motivo: motivo.trim(),
                                pinGerente: pin || undefined,
                              }),
                            'Item cancelado. O motivo permanece no histórico.',
                            () => {
                              definirCancelando(null)
                              definirMotivo('')
                            },
                          )
                        }}
                      >
                        <fieldset disabled={bloqueado} className="min-w-0 space-y-3">
                          <p className="text-sm text-[#a82a1a]">
                            O item sai da conta e da fila da cozinha. O motivo fica registrado.
                          </p>
                          <label htmlFor={`motivo-${item.id}`} className="block text-sm font-bold">
                            Motivo do cancelamento
                          </label>
                          <textarea
                            id={`motivo-${item.id}`}
                            className="pdv-campo"
                            required
                            minLength={3}
                            maxLength={200}
                            rows={2}
                            value={motivo}
                            onChange={(evento) => definirMotivo(evento.target.value)}
                            placeholder="Ex.: cliente desistiu do pedido"
                          />
                          {cancelamentoExigePin && (
                            <label className="block text-sm font-bold" htmlFor="pin-cancelamento-comanda">
                              PIN do gerente
                              <input
                                id="pin-cancelamento-comanda"
                                type="password"
                                inputMode="numeric"
                                autoComplete="off"
                                required
                                pattern="[0-9]{4,6}"
                                minLength={4}
                                maxLength={6}
                                className="pdv-campo mt-1"
                                value={pinGerente}
                                onChange={(evento) =>
                                  definirPinGerente(evento.target.value.replace(/\D/g, ''))
                                }
                              />
                              <span className="mt-1 block text-xs font-normal text-carvao">
                                Aprovação necessária para cancelar este item. Use de 4 a 6 números.
                              </span>
                            </label>
                          )}
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="pdv-botao"
                              onClick={() => {
                                definirCancelando(null)
                                definirPinGerente('')
                              }}
                            >
                              Manter item
                            </button>
                            <button
                              type="submit"
                              className="pdv-botao border-vermelho! text-[#a82a1a]!"
                              disabled={
                                motivo.trim().length < 3 ||
                                bloqueado ||
                                (cancelamentoExigePin && !/^[0-9]{4,6}$/.test(pinGerente))
                              }
                            >
                              {ocupado ? 'Cancelando…' : 'Cancelar item'}
                            </button>
                          </div>
                        </fieldset>
                      </form>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
        {aberta && (
          <section
            className="space-y-4 rounded-xl border border-areia bg-branco p-4"
            aria-labelledby="acoes-comanda"
          >
            <h2 id="acoes-comanda" className="text-lg font-bold">
              Atender esta comanda
            </h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                className="pdv-botao"
                disabled={bloqueado}
                onClick={() =>
                  executar(
                    () => pedirContaAction(comanda.id, comanda.estado === 'conta' ? 'aberta' : 'conta'),
                    comanda.estado === 'conta'
                      ? 'Comanda em atendimento novamente.'
                      : 'Conta solicitada. O caixa já pode conferir o consumo.',
                  )
                }
              >
                {comanda.estado === 'conta' ? 'Voltar ao atendimento' : 'Pedir conta'}
              </button>
              <button
                type="button"
                className="pdv-botao"
                disabled={bloqueado}
                aria-expanded={operacaoMesa === 'transferir'}
                onClick={() => {
                  definirOperacaoMesa(operacaoMesa === 'transferir' ? null : 'transferir')
                  definirErro('')
                }}
              >
                <ArrowRightLeft aria-hidden className="size-4" />
                Transferir mesa
              </button>
              <button
                type="button"
                className="pdv-botao"
                disabled={bloqueado}
                aria-expanded={operacaoMesa === 'juntar'}
                onClick={() => {
                  definirOperacaoMesa(operacaoMesa === 'juntar' ? null : 'juntar')
                  definirErro('')
                }}
              >
                Juntar com outra
              </button>
            </div>
            {operacaoMesa === 'transferir' && (
              <form
                className="space-y-3 border-t border-areia pt-4"
                onSubmit={async (evento) => {
                  evento.preventDefault()
                  if (!mesa) return
                  await executar(
                    () => transferirMesaAction(comanda.id, mesa.id),
                    `Comanda transferida para a mesa ${mesa.numero}.`,
                    () => {
                      definirOperacaoMesa(null)
                      definirMesaDestino('')
                    },
                  )
                }}
              >
                <fieldset disabled={bloqueado} className="min-w-0 space-y-3">
                  <label htmlFor="mesa-transferencia" className="block text-sm font-bold">
                    Mesa de destino
                  </label>
                  <select
                    id="mesa-transferencia"
                    required
                    className="pdv-campo"
                    value={mesaDestino}
                    onChange={(evento) => definirMesaDestino(evento.target.value)}
                  >
                    <option value="">Selecione uma mesa livre</option>
                    {mesasLivres.map((livre) => (
                      <option key={livre.id} value={livre.id}>
                        Mesa {livre.numero}
                        {livre.area ? ` · ${livre.area}` : ''} · {livre.lugares} lugares
                      </option>
                    ))}
                  </select>
                  {!mesasLivres.length && (
                    <p className="text-sm text-carvao">Nenhuma mesa livre no momento.</p>
                  )}
                  {mesa && (
                    <p className="text-sm text-carvao">
                      O consumo de {rotulo} vai para a mesa {mesa.numero}.
                      {comanda.mesa ? ' A mesa atual fica livre.' : ''}
                    </p>
                  )}
                  <button type="submit" className="pdv-botao pdv-primario" disabled={bloqueado || !mesa}>
                    {ocupado ? 'Transferindo…' : 'Transferir comanda'}
                  </button>
                </fieldset>
              </form>
            )}
            {operacaoMesa === 'juntar' && (
              <form
                className="space-y-3 border-t border-areia pt-4"
                onSubmit={async (evento) => {
                  evento.preventDefault()
                  if (!origem) return
                  await executar(
                    () => juntarComandasAction(comanda.id, origem.id),
                    `O consumo de ${origem.rotulo} foi trazido para ${rotulo}.`,
                    () => {
                      definirOperacaoMesa(null)
                      definirComandaOrigem('')
                    },
                  )
                }}
              >
                <fieldset disabled={bloqueado} className="min-w-0 space-y-3">
                  <label htmlFor="comanda-juntar" className="block text-sm font-bold">
                    Trazer o consumo de
                  </label>
                  <select
                    id="comanda-juntar"
                    required
                    className="pdv-campo"
                    value={comandaOrigem}
                    onChange={(evento) => definirComandaOrigem(evento.target.value)}
                  >
                    <option value="">Selecione outra comanda</option>
                    {outrasComandas.map((outra) => (
                      <option key={outra.id} value={outra.id}>
                        {outra.rotulo} · {formatarBRL(outra.total)}
                      </option>
                    ))}
                  </select>
                  {!outrasComandas.length && (
                    <p className="text-sm text-carvao">Nenhuma outra comanda aberta para juntar.</p>
                  )}
                  {origem && (
                    <p className="rounded-lg bg-ambar-clara p-3 text-sm text-[#774800]">
                      <strong>{origem.rotulo}</strong> será encerrada. Os itens e as pessoas vão para{' '}
                      <strong>{rotulo}</strong>, que permanece aberta.
                    </p>
                  )}
                  <button type="submit" className="pdv-botao pdv-primario" disabled={bloqueado || !origem}>
                    {ocupado ? 'Juntando…' : `Juntar nesta ${comanda.mesa ? 'mesa' : 'comanda'}`}
                  </button>
                </fieldset>
              </form>
            )}
          </section>
        )}
      </div>

      {aberta && (
        <div hidden={secao !== 'lancar'}>
          <LancarItens
            comandaId={comanda.id}
            produtos={produtos}
            ocupado={bloqueado}
            executar={executar}
            aoConcluir={() => abrirSecao('consumo')}
            aoAlterarRascunho={definirRascunho}
          />
        </div>
      )}
      {aberta && pagamentoVisitado && (
        <div hidden={secao !== 'fechar'}>
          <FecharConta
            comandaId={comanda.id}
            subtotal={comanda.pedido.subtotal}
            pessoas={comanda.pessoas}
            descontoInicial={comanda.pedido.desconto}
            revisao={revisao}
            caixaEstaAberto={caixaEstaAberto}
            itensEmPreparo={emPreparo}
            ocupado={bloqueado || rascunho > 0}
            executar={executar}
            aoFechar={definirRecibo}
          />
        </div>
      )}
    </div>
  )
}
