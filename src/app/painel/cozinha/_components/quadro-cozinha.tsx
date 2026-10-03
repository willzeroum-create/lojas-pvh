'use client'

import {
  Check,
  ChevronRight,
  Maximize,
  Minimize,
  Monitor,
  RefreshCw,
  Settings2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import type { CartaoCozinha, Estacao, ItemCozinha } from '@/lib/dados/cozinha'
import type { CanalPedido } from '@/lib/supabase/tipos'
import { cancelarItemAction, mudarPreparoAction, type Resultado } from '../actions'

type Etapa = 'aguardando' | 'em_preparo' | 'pronto'
const ETAPAS: Array<{
  estado: Etapa
  titulo: string
  acao: string
  tudo: string
  proximo: Etapa | 'entregue'
  vazio: string
}> = [
  {
    estado: 'aguardando',
    titulo: 'Na fila',
    acao: 'Começar',
    tudo: 'Começar tudo',
    proximo: 'em_preparo',
    vazio: 'Nenhum pedido na fila.',
  },
  {
    estado: 'em_preparo',
    titulo: 'Em preparo',
    acao: 'Pronto',
    tudo: 'Tudo pronto',
    proximo: 'pronto',
    vazio: 'Nenhum item em preparo.',
  },
  {
    estado: 'pronto',
    titulo: 'Pronto',
    acao: 'Entregue',
    tudo: 'Entregue',
    proximo: 'entregue',
    vazio: 'Os próximos saem por aqui.',
  },
]
const CANAIS: Record<CanalPedido, string> = {
  cardapio: 'Cardápio',
  whatsapp: 'WhatsApp',
  balcao: 'Balcão',
  ifood: 'iFood',
  '99food': '99Food',
  mesa: 'Salão',
}

function tempoDecorrido(inicio: string | number, agora: number) {
  const total = Math.max(
    0,
    Math.floor((agora - (typeof inicio === 'number' ? inicio : Date.parse(inicio))) / 1000),
  )
  if (!Number.isFinite(total)) return '—'
  const minutos = Math.floor(total / 60)
  return `${minutos.toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`
}

function tocarAviso(contexto: AudioContext) {
  if (contexto.state !== 'running') return
  const oscilador = contexto.createOscillator()
  const ganho = contexto.createGain()
  oscilador.connect(ganho)
  ganho.connect(contexto.destination)
  oscilador.frequency.setValueAtTime(740, contexto.currentTime)
  oscilador.frequency.setValueAtTime(980, contexto.currentTime + 0.12)
  ganho.gain.setValueAtTime(0.0001, contexto.currentTime)
  ganho.gain.exponentialRampToValueAtTime(0.12, contexto.currentTime + 0.02)
  ganho.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.32)
  oscilador.start()
  oscilador.stop(contexto.currentTime + 0.34)
  oscilador.onended = () => {
    oscilador.disconnect()
    ganho.disconnect()
  }
}

export function QuadroCozinha({
  cartoes,
  estacoes,
  lojaNome,
  consultadoEm,
  cancelamentoExigePin,
}: {
  cartoes: CartaoCozinha[]
  estacoes: Estacao[]
  lojaNome: string
  consultadoEm: number
  cancelamentoExigePin: boolean
}) {
  const roteador = useRouter()
  const quadro = useRef<HTMLElement>(null)
  const contextoSom = useRef<AudioContext | null>(null)
  const pedidosVistos = useRef(new Set(cartoes.map((cartao) => cartao.pedidoId)))
  const enviando = useRef(false)
  const [agora, definirAgora] = useState(consultadoEm)
  const [estacaoId, definirEstacao] = useState('todas')
  const [som, definirSom] = useState(false)
  const [modoTv, definirModoTv] = useState(false)
  const [telaCheia, definirTelaCheia] = useState(false)
  const [erro, definirErro] = useState<string | null>(null)
  const [aviso, definirAviso] = useState<string | null>(null)
  const [cancelamento, definirCancelamento] = useState<{ item: ItemCozinha; rotulo: string } | null>(null)
  const [motivo, definirMotivo] = useState('')
  const [pinGerente, definirPinGerente] = useState('')
  const [erroMotivo, definirErroMotivo] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()
  const [atualizando, iniciarAtualizacao] = useTransition()

  useEffect(() => {
    // O relógio acompanha o servidor mesmo se a TV estiver com a hora incorreta.
    const inicio = performance.now()
    const relogio = window.setInterval(() => definirAgora(consultadoEm + performance.now() - inicio), 1000)
    return () => window.clearInterval(relogio)
  }, [consultadoEm])

  useEffect(() => {
    const atualizacao = window.setInterval(() => {
      if (!enviando.current) iniciarAtualizacao(() => roteador.refresh())
    }, 10000)
    return () => window.clearInterval(atualizacao)
  }, [roteador])

  useEffect(() => {
    const novo = cartoes.some((cartao) => !pedidosVistos.current.has(cartao.pedidoId))
    // Compara a fila inteira; trocar a estação não cria alertas falsos.
    pedidosVistos.current = new Set(cartoes.map((cartao) => cartao.pedidoId))
    if (novo && som && contextoSom.current) tocarAviso(contextoSom.current)
  }, [cartoes, som])

  useEffect(() => {
    const aoMudar = () => definirTelaCheia(document.fullscreenElement === quadro.current)
    document.addEventListener('fullscreenchange', aoMudar)
    return () => document.removeEventListener('fullscreenchange', aoMudar)
  }, [])

  useEffect(
    () => () => {
      void contextoSom.current?.close()
    },
    [],
  )

  useEffect(() => {
    if (!modoTv) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // O modo TV cobre o painel: o teclado e o leitor de tela permanecem na cozinha.
    const foraDoQuadro: Array<{ elemento: HTMLElement; inerte: boolean }> = []
    let ramo: HTMLElement | null = quadro.current
    while (ramo && ramo !== document.body) {
      const pai: HTMLElement | null = ramo.parentElement
      if (!pai) break
      for (const irmao of pai.children) {
        if (irmao instanceof HTMLElement && irmao !== ramo) {
          foraDoQuadro.push({ elemento: irmao, inerte: irmao.inert })
          irmao.setAttribute('inert', '')
        }
      }
      ramo = pai
    }
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') definirModoTv(false)
      if (evento.key !== 'Tab') return
      const alvos = Array.from(
        quadro.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]',
        ) ?? [],
      ).filter((elemento) => elemento.getClientRects().length > 0)
      const primeiro = alvos[0]
      const ultimo = alvos[alvos.length - 1]
      if (!primeiro || !ultimo) return
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }
    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.body.style.overflow = anterior
      for (const { elemento, inerte } of foraDoQuadro) elemento.toggleAttribute('inert', inerte)
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [modoTv])

  async function alternarSom() {
    if (som) {
      definirSom(false)
      return
    }
    try {
      if (!contextoSom.current || contextoSom.current.state === 'closed')
        contextoSom.current = new AudioContext()
      await contextoSom.current.resume()
      tocarAviso(contextoSom.current)
      definirSom(true)
      definirAviso('Som ativado. Você ouvirá um aviso quando chegar um novo pedido.')
    } catch {
      definirErro('Este navegador não conseguiu ativar o som. Os pedidos continuam aparecendo na tela.')
    }
  }

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (quadro.current?.requestFullscreen) await quadro.current.requestFullscreen()
      else definirErro('Tela cheia indisponível neste navegador. Use o modo TV para ampliar a cozinha.')
    } catch {
      definirErro('Não foi possível abrir a tela cheia. O modo TV continua disponível.')
    }
  }

  function executar(acao: () => Promise<Resultado>, mensagem: string, aoSalvar?: () => void) {
    if (enviando.current) return
    enviando.current = true
    definirErro(null)
    definirAviso(null)
    definirErroMotivo(null)
    iniciarTransicao(async () => {
      try {
        const resposta = await acao()
        if (!resposta.ok) {
          definirErro(resposta.erro)
          definirErroMotivo(resposta.porCampo?.motivo ?? null)
          return
        }
        definirAviso(mensagem)
        aoSalvar?.()
        roteador.refresh()
      } catch {
        definirErro(
          'A conexão caiu durante a atualização. Atualize a fila e confira o estado antes de tentar de novo.',
        )
      } finally {
        enviando.current = false
      }
    })
  }

  function cancelar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!cancelamento) return
    if (motivo.trim().length < 3) {
      definirErroMotivo('Escreva o motivo com pelo menos 3 caracteres.')
      return
    }
    executar(
      async () => {
        try {
          return await cancelarItemAction({
            itemId: cancelamento.item.id,
            motivo: motivo.trim(),
            pinGerente: cancelamentoExigePin ? pinGerente : undefined,
          })
        } finally {
          definirPinGerente('')
        }
      },
      'Item cancelado. O motivo ficou registrado.',
      () => {
        definirCancelamento(null)
        definirMotivo('')
      },
    )
  }

  const porEstacao = new Map(estacoes.map((estacao) => [estacao.id, estacao]))
  const filtro =
    estacaoId === 'todas' || estacoes.some((estacao) => estacao.id === estacaoId) ? estacaoId : 'todas'
  const filtrados = cartoes
    .map((cartao) => ({
      ...cartao,
      itens: cartao.itens.filter((item) => filtro === 'todas' || item.estacaoId === filtro),
    }))
    .filter((cartao) => cartao.itens.length > 0)
  const desatualizada = agora - consultadoEm > 35000

  return (
    <section
      ref={quadro}
      className="cozinha-painel rounded-xl bg-tinta p-4 text-papel sm:p-6"
      data-tv={modoTv}
      role={modoTv ? 'dialog' : 'region'}
      aria-modal={modoTv || undefined}
      aria-label="Fila da cozinha"
    >
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-carvao pb-5">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-areia uppercase">{lojaNome} / Produção</p>
          <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight">Cozinha</h1>
          <p className="mt-2 text-sm text-areia">
            {filtrados.length} {filtrados.length === 1 ? 'pedido' : 'pedidos'} · ordem de chegada
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="cozinha-botao" onClick={alternarSom} aria-pressed={som}>
            {som ? (
              <Volume2 aria-hidden="true" className="size-5" />
            ) : (
              <VolumeX aria-hidden="true" className="size-5" />
            )}
            {som ? 'Som ligado' : 'Ativar som'}
          </button>
          <button
            type="button"
            className="cozinha-botao"
            aria-pressed={modoTv}
            disabled={pendente || Boolean(cancelamento)}
            onClick={() => definirModoTv(!modoTv)}
          >
            <Monitor aria-hidden="true" className="size-5" />
            {modoTv ? 'Sair do modo TV' : 'Modo TV'}
          </button>
          <button
            type="button"
            className="cozinha-botao"
            onClick={alternarTelaCheia}
            aria-pressed={telaCheia}
          >
            {telaCheia ? (
              <Minimize aria-hidden="true" className="size-5" />
            ) : (
              <Maximize aria-hidden="true" className="size-5" />
            )}
            {telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
          </button>
          {!modoTv && (
            <Link href="/painel/cozinha/estacoes" className="cozinha-botao">
              <Settings2 aria-hidden="true" className="size-5" />
              Estações
            </Link>
          )}
        </div>
      </header>

      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex max-w-full gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filtrar por estação"
        >
          <button
            type="button"
            className="cozinha-aba"
            aria-pressed={filtro === 'todas'}
            onClick={() => definirEstacao('todas')}
          >
            Todas
          </button>
          {estacoes
            .filter(
              (estacao) =>
                estacao.ativa ||
                cartoes.some((cartao) => cartao.itens.some((item) => item.estacaoId === estacao.id)),
            )
            .map((estacao) => (
              <button
                key={estacao.id}
                type="button"
                className="cozinha-aba"
                aria-pressed={filtro === estacao.id}
                onClick={() => definirEstacao(estacao.id)}
              >
                {estacao.nome}
                {!estacao.ativa ? ' · inativa' : ''}
              </button>
            ))}
        </div>
        <button
          type="button"
          className="cozinha-botao text-sm"
          disabled={pendente || atualizando}
          onClick={() => iniciarAtualizacao(() => roteador.refresh())}
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          {atualizando ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>
      <div className="mb-5 flex flex-wrap justify-between gap-2 text-xs text-areia">
        <p>
          {modoTv ? 'Modo de exibição · sem ações de preparo' : 'Atualização automática a cada 10 segundos'}
        </p>
        <p>Âmbar: limite da estação · vermelho: dobro do limite</p>
      </div>
      {desatualizada && (
        <p role="status" className="mb-4 rounded-lg border border-ambar bg-ambar/10 p-4 text-[#fbd68d]">
          A fila está há mais de 35 segundos sem atualização. Confira a conexão e atualize antes de continuar.
        </p>
      )}
      {erro && (
        <p role="alert" className="mb-4 rounded-lg border border-[#e87566] bg-vermelho/15 p-4 text-[#ffb9ae]">
          {erro}
        </p>
      )}
      <p role="status" className={aviso ? 'mb-4 text-sm text-areia' : 'sr-only'}>
        {aviso ?? ''}
      </p>

      {cancelamento && (
        <form
          onSubmit={cancelar}
          className="mb-6 space-y-4 rounded-lg border border-[#e87566] bg-carvao p-4"
          aria-busy={pendente}
        >
          <div>
            <h2 className="font-sans text-xl font-bold">
              Cancelar {cancelamento.item.quantidade} × {cancelamento.item.nome}?
            </h2>
            <p className="mt-1 text-areia">
              {cancelamento.rotulo} · o item sai da conta e o motivo fica no histórico.
            </p>
          </div>
          <label htmlFor="cozinha-motivo" className="block font-bold">
            Motivo do cancelamento
          </label>
          <textarea
            id="cozinha-motivo"
            autoFocus
            required
            minLength={3}
            maxLength={200}
            rows={2}
            value={motivo}
            disabled={pendente || desatualizada}
            onChange={(evento) => definirMotivo(evento.target.value)}
            className="cozinha-campo"
            aria-invalid={Boolean(erroMotivo)}
            aria-describedby={erroMotivo ? 'cozinha-erro-motivo' : undefined}
          />
          {erroMotivo && (
            <p id="cozinha-erro-motivo" className="text-[#ffb9ae]">
              {erroMotivo}
            </p>
          )}
          {cancelamentoExigePin && (
            <div className="space-y-2">
              <label htmlFor="cozinha-pin-gerente" className="block font-bold">
                PIN do gerente
              </label>
              <p id="cozinha-pin-ajuda" className="text-sm text-areia">
                Peça ao gerente para aprovar este cancelamento com seu PIN de 4 a 6 números.
              </p>
              <input
                id="cozinha-pin-gerente"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                required
                minLength={4}
                maxLength={6}
                pattern="[0-9]{4,6}"
                value={pinGerente}
                onChange={(evento) => definirPinGerente(evento.target.value)}
                disabled={pendente || desatualizada}
                className="cozinha-campo max-w-xs"
                aria-describedby="cozinha-pin-ajuda"
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="cozinha-botao border-[#e87566]! bg-vermelho! text-white!"
              disabled={pendente || desatualizada}
            >
              {pendente ? 'Cancelando…' : 'Confirmar cancelamento'}
            </button>
            <button
              type="button"
              className="cozinha-botao"
              disabled={pendente}
              onClick={() => {
                definirCancelamento(null)
                definirPinGerente('')
              }}
            >
              Manter item
            </button>
          </div>
        </form>
      )}

      {!estacoes.length && (
        <p className="mb-5 rounded-lg border border-carvao p-4 text-areia">
          Cadastre as estações e direcione as categorias para começar a receber os itens na cozinha.{' '}
          <Link
            href="/painel/cozinha/estacoes"
            className="inline-flex min-h-12 items-center font-bold text-papel underline"
          >
            Configurar estações
          </Link>
        </p>
      )}

      <div
        className={`cozinha-colunas grid items-start gap-4 ${modoTv || telaCheia ? 'lg:grid-cols-3' : 'xl:grid-cols-3'}`}
      >
        {ETAPAS.map((etapa, indice) => {
          const fila = filtrados
            .map((cartao) => ({
              ...cartao,
              itens: cartao.itens.filter((item) => item.preparo === etapa.estado),
            }))
            .filter((cartao) => cartao.itens.length > 0)
          const quantidade = fila.reduce(
            (soma, cartao) => soma + cartao.itens.reduce((total, item) => total + item.quantidade, 0),
            0,
          )
          return (
            <section key={etapa.estado} aria-labelledby={`cozinha-${etapa.estado}`} className="min-w-0">
              <header
                className="cozinha-coluna-titulo mb-3 flex items-center justify-between gap-3 border-t-2 border-areia py-3"
                data-etapa={etapa.estado}
              >
                <h2
                  id={`cozinha-${etapa.estado}`}
                  className={`font-sans font-bold ${modoTv ? 'text-3xl' : 'text-xl'}`}
                >
                  <span className="mr-2 text-sm text-areia">0{indice + 1}</span>
                  {etapa.titulo}
                </h2>
                <span className="rounded-md bg-carvao px-2.5 py-1 text-sm font-bold tabular-nums">
                  {quantidade.toLocaleString('pt-BR')} itens
                </span>
              </header>
              <div className="space-y-4">
                {fila.length === 0 && (
                  <p className="rounded-lg border border-dashed border-carvao px-4 py-10 text-center text-areia">
                    {etapa.vazio}
                  </p>
                )}
                {fila.map((cartao) => {
                  const limite = Math.min(
                    ...cartao.itens.map((item) => porEstacao.get(item.estacaoId)?.alertaMin ?? 15),
                  )
                  const minutos = Math.max(0, (agora - Date.parse(cartao.entrouEm)) / 60000)
                  const urgencia =
                    minutos >= limite * 2 ? 'atrasado' : minutos >= limite ? 'alerta' : 'normal'
                  return (
                    <article
                      key={cartao.pedidoId}
                      className="cozinha-cartao overflow-hidden rounded-lg border border-carvao bg-[#24201a]"
                      data-urgencia={urgencia}
                    >
                      <header className="border-b border-carvao p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="cozinha-numero text-3xl font-bold tabular-nums">
                            {cartao.numero == null ? 'Pedido' : `#${cartao.numero}`}
                          </p>
                          <div className="cozinha-tempo text-right" data-urgencia={urgencia}>
                            <p
                              className="text-2xl leading-none font-bold tabular-nums"
                              aria-label={`${tempoDecorrido(cartao.entrouEm, agora)} desde a entrada`}
                            >
                              {tempoDecorrido(cartao.entrouEm, agora)}
                            </p>
                            <p className="mt-1 text-[11px] font-bold uppercase">
                              {urgencia === 'atrasado'
                                ? 'Atrasado'
                                : urgencia === 'alerta'
                                  ? 'Atenção'
                                  : 'Na cozinha'}
                            </p>
                          </div>
                        </div>
                        <h3 className="cozinha-rotulo mt-3 font-sans text-xl font-bold break-words">
                          {cartao.rotulo}
                        </h3>
                        <p className={`mt-1 text-areia ${modoTv ? 'text-lg' : 'text-sm'}`}>
                          {CANAIS[cartao.canal]}
                          {cartao.canal !== 'mesa' && cartao.canal !== 'balcao'
                            ? ` · ${cartao.tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'}`
                            : ''}
                        </p>
                      </header>
                      <ul className="divide-y divide-carvao">
                        {cartao.itens.map((item) => (
                          <li key={item.id} className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="cozinha-quantidade min-w-9 text-3xl leading-none font-bold tabular-nums">
                                {item.quantidade.toLocaleString('pt-BR')}
                                <span className="text-base text-areia">×</span>
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="cozinha-item-nome text-lg leading-snug font-bold break-words">
                                  {item.nome}
                                </p>
                                {filtro === 'todas' && (
                                  <p
                                    className={`mt-1 font-bold text-areia ${modoTv ? 'text-base' : 'text-xs'}`}
                                  >
                                    {porEstacao.get(item.estacaoId)?.nome ?? 'Estação'}
                                  </p>
                                )}
                                {item.opcoes.length > 0 && (
                                  <ul className="cozinha-opcoes mt-2 space-y-1 text-sm text-papel-3">
                                    {item.opcoes.map((opcao, ordem) => (
                                      <li key={`${opcao.nome}-${ordem}`}>
                                        {opcao.grupo ? `${opcao.grupo}: ` : ''}
                                        {opcao.nome}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                            {item.observacao && (
                              <p className="cozinha-observacao mt-3 rounded-md border-l-4 border-ambar bg-ambar/10 px-3 py-2 text-base font-semibold break-words text-[#fbd68d]">
                                <span className="mb-1 block text-xs font-bold uppercase">Observação</span>
                                {item.observacao}
                              </p>
                            )}
                            {!modoTv && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="cozinha-botao flex-1"
                                  disabled={pendente || Boolean(cancelamento) || desatualizada}
                                  aria-label={`${etapa.acao}: ${item.nome}, ${cartao.rotulo}`}
                                  onClick={() =>
                                    executar(
                                      () => mudarPreparoAction({ itemIds: [item.id], estado: etapa.proximo }),
                                      `${item.nome}: ${etapa.proximo === 'em_preparo' ? 'preparo iniciado' : etapa.proximo === 'pronto' ? 'pronto para sair' : 'entregue'}.`,
                                    )
                                  }
                                >
                                  {etapa.proximo === 'entregue' ? (
                                    <Check className="size-4" aria-hidden="true" />
                                  ) : (
                                    <ChevronRight className="size-4" aria-hidden="true" />
                                  )}
                                  {etapa.acao}
                                </button>
                                <button
                                  type="button"
                                  className="cozinha-botao text-sm"
                                  disabled={pendente || Boolean(cancelamento) || desatualizada}
                                  aria-label={`Cancelar ${item.nome}, ${cartao.rotulo}`}
                                  onClick={() => {
                                    definirCancelamento({ item, rotulo: cartao.rotulo })
                                    definirMotivo('')
                                    definirPinGerente('')
                                    definirErroMotivo(null)
                                    definirErro(null)
                                  }}
                                >
                                  Cancelar
                                </button>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      {!modoTv && (
                        <div className="border-t border-carvao p-3">
                          <button
                            type="button"
                            className="cozinha-botao cozinha-primario w-full"
                            disabled={pendente || Boolean(cancelamento) || desatualizada}
                            aria-label={`${etapa.tudo}: ${cartao.rotulo}, ${cartao.itens.length} itens nesta coluna`}
                            onClick={() =>
                              executar(async () => {
                                // Cada chamada respeita o limite de 100 itens do contrato existente.
                                for (let inicio = 0; inicio < cartao.itens.length; inicio += 100) {
                                  const resultado = await mudarPreparoAction({
                                    itemIds: cartao.itens.slice(inicio, inicio + 100).map((item) => item.id),
                                    estado: etapa.proximo,
                                  })
                                  if (!resultado.ok) return resultado
                                }
                                return { ok: true }
                              }, `${cartao.rotulo}: ${etapa.tudo.toLowerCase()}.`)
                            }
                          >
                            {pendente ? 'Atualizando…' : etapa.tudo}
                            <ChevronRight className="size-5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
