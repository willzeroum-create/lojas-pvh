'use client'

import { Check, CheckCircle2, Clock3, Copy, QrCode, XCircle } from 'lucide-react'
import Image from 'next/image'
import { startTransition, useEffect, useRef, useState } from 'react'
import { cancelarPixAction, estadoPixAction } from '@/app/painel/pix/actions'
import { Botao } from '@/components/ui/botao'
import { Mensagem } from '@/components/ui/mensagem'
import type { CobrancaPix } from '@/lib/dados/pix'
import { formatarBRL } from '@/lib/dominio/moeda'

export type QrPixProps = {
  cobranca: CobrancaPix
  valorEsperado?: number
  onPago?: () => void
  onCancelar?: () => void
  onAtualizar?: (cobranca: CobrancaPix) => void
}

const SITUACOES: Record<CobrancaPix['estado'], { titulo: string; descricao: string }> = {
  pendente: {
    titulo: 'Aguardando o Pix',
    descricao: 'Peça ao cliente para escanear o QR no aplicativo do banco.',
  },
  pago: { titulo: 'Pix recebido', descricao: 'Pagamento confirmado.' },
  expirado: { titulo: 'Este Pix expirou', descricao: 'Gere uma nova cobrança para receber.' },
  cancelado: { titulo: 'Pix cancelado', descricao: 'Esta cobrança foi encerrada.' },
  devolvido: { titulo: 'Pix devolvido', descricao: 'O valor deste pagamento foi devolvido.' },
  erro: {
    titulo: 'Não foi possível concluir o Pix',
    descricao: 'Confira a mensagem abaixo antes de tentar novamente.',
  },
}

function tempoRestante(segundos: number) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const segundosFinais = segundos % 60
  return horas > 0
    ? `${horas}h ${String(minutos).padStart(2, '0')}min ${String(segundosFinais).padStart(2, '0')}s`
    : `${String(minutos).padStart(2, '0')}:${String(segundosFinais).padStart(2, '0')}`
}

/** Uma nova cobrança reinicia a consulta, o prazo e os avisos ao chamador. */
export function QrPix(props: QrPixProps) {
  return <ConteudoQrPix key={props.cobranca.id} {...props} />
}

function ConteudoQrPix({ cobranca, valorEsperado, onPago, onCancelar, onAtualizar }: QrPixProps) {
  const [atual, definirAtual] = useState(cobranca)
  const [erro, definirErro] = useState('')
  const [erroCopia, definirErroCopia] = useState('')
  const [copiado, definirCopiado] = useState(false)
  const [cancelando, definirCancelando] = useState(false)
  const [confirmarCancelamento, definirConfirmarCancelamento] = useState(false)
  const [agora, definirAgora] = useState<number | null>(null)
  const [imagemFalhou, definirImagemFalhou] = useState(false)
  const avisouPago = useRef(false)
  const consultando = useRef(false)
  const cancelamentoEmCurso = useRef(false)
  const callbacks = useRef({ onPago, onCancelar, onAtualizar })
  const montado = useRef(true)

  useEffect(() => {
    callbacks.current = { onPago, onCancelar, onAtualizar }
  }, [onPago, onCancelar, onAtualizar])

  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])

  useEffect(() => {
    if (atual.estado === 'pago' && !avisouPago.current) {
      avisouPago.current = true
      callbacks.current.onPago?.()
    }
  }, [atual.estado])

  useEffect(() => {
    if (atual.estado !== 'pendente' || cancelando) return
    let ativo = true
    let temporizador: ReturnType<typeof setTimeout> | undefined

    const agendar = () => {
      if (ativo && document.visibilityState === 'visible') {
        clearTimeout(temporizador)
        temporizador = setTimeout(() => startTransition(consultar), 3000)
      }
    }
    const consultar = async () => {
      if (!ativo || document.visibilityState !== 'visible') return
      if (consultando.current || cancelamentoEmCurso.current) {
        agendar()
        return
      }
      consultando.current = true
      let pendente = true
      try {
        const resultado = await estadoPixAction(atual.id)
        if (!ativo || cancelamentoEmCurso.current) return
        if (resultado.ok) {
          pendente = resultado.cobranca.estado === 'pendente'
          definirAtual(resultado.cobranca)
          definirErro('')
          if (resultado.cobranca.estado !== atual.estado) {
            callbacks.current.onAtualizar?.(resultado.cobranca)
          }
        } else {
          definirErro(`${resultado.erro} Vamos consultar novamente em instantes.`)
        }
      } catch {
        if (ativo) definirErro('Sem conexão para confirmar o Pix. A consulta será repetida automaticamente.')
      } finally {
        consultando.current = false
        if (pendente) agendar()
      }
    }
    const aoMudarVisibilidade = () => {
      clearTimeout(temporizador)
      if (document.visibilityState === 'visible') startTransition(consultar)
    }
    agendar()
    document.addEventListener('visibilitychange', aoMudarVisibilidade)
    return () => {
      ativo = false
      clearTimeout(temporizador)
      document.removeEventListener('visibilitychange', aoMudarVisibilidade)
    }
  }, [atual.id, atual.estado, cancelando])

  useEffect(() => {
    if (atual.estado !== 'pendente' || !atual.expiraEm) return
    const atualizarRelogio = () => {
      if (document.visibilityState === 'visible') definirAgora(Date.now())
    }
    const inicial = setTimeout(atualizarRelogio, 0)
    const intervalo = setInterval(atualizarRelogio, 1000)
    document.addEventListener('visibilitychange', atualizarRelogio)
    return () => {
      clearTimeout(inicial)
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', atualizarRelogio)
    }
  }, [atual.estado, atual.expiraEm])

  useEffect(() => {
    if (!copiado) return
    const temporizador = setTimeout(() => definirCopiado(false), 3000)
    return () => clearTimeout(temporizador)
  }, [copiado])

  async function copiar() {
    if (!atual.copiaCola) return
    definirErroCopia('')
    try {
      await navigator.clipboard.writeText(atual.copiaCola)
      if (montado.current) definirCopiado(true)
    } catch {
      if (montado.current)
        definirErroCopia('Não foi possível copiar. Selecione o código abaixo e copie manualmente.')
    }
  }

  function cancelar() {
    if (cancelamentoEmCurso.current) return
    cancelamentoEmCurso.current = true
    definirCancelando(true)
    definirErro('')
    startTransition(async () => {
      try {
        const resultado = await cancelarPixAction(atual.id)
        if (!montado.current) return
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        const cancelada: CobrancaPix = { ...atual, estado: 'cancelado' }
        definirAtual(cancelada)
        callbacks.current.onAtualizar?.(cancelada)
        callbacks.current.onCancelar?.()
      } catch {
        if (montado.current)
          definirErro('Não foi possível cancelar o Pix. Confira a conexão e tente novamente.')
      } finally {
        cancelamentoEmCurso.current = false
        if (montado.current) definirCancelando(false)
      }
    })
  }

  const expiraEm = atual.expiraEm ? Date.parse(atual.expiraEm) : null
  const segundos =
    agora !== null && expiraEm !== null && Number.isFinite(expiraEm)
      ? Math.max(0, Math.ceil((expiraEm - agora) / 1000))
      : null
  const prazoEncerrado = segundos === 0
  const pendente = atual.estado === 'pendente'
  const saldoDivergente =
    pendente &&
    valorEsperado !== undefined &&
    Math.round(valorEsperado * 100) !== Math.round(atual.valor * 100)
  const pago = atual.estado === 'pago'
  const situacao = SITUACOES[atual.estado]

  return (
    <section className="pix-area min-w-0 space-y-5" aria-label="Cobrança Pix">
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`rounded-xl p-5 text-center ${pago ? 'bg-verde-clara text-[#176b3a]' : 'bg-papel-2 text-tinta'}`}
      >
        {pago ? (
          <CheckCircle2 aria-hidden="true" className="mx-auto mb-3 size-14" />
        ) : !pendente ? (
          <XCircle aria-hidden="true" className="mx-auto mb-3 size-9" />
        ) : null}
        <h3 className="text-xl font-bold">{situacao.titulo}</h3>
        <p className="mt-2 text-[clamp(1.75rem,8vw,2.75rem)] leading-tight font-bold tracking-tight break-words tabular-nums">
          {formatarBRL(atual.valor)}
        </p>
        <p className="mt-3 text-sm leading-relaxed">
          {saldoDivergente ? 'O saldo desta conta mudou.' : situacao.descricao}
        </p>
      </div>
      <p className="text-center text-sm font-semibold break-words text-carvao">{atual.descricao}</p>
      {saldoDivergente && (
        <Mensagem tipo="info">
          {`O saldo mudou. Cancele esta cobrança de ${formatarBRL(atual.valor)} e gere outra para o saldo atual de ${formatarBRL(valorEsperado!)}.`}
        </Mensagem>
      )}
      {pendente && !prazoEncerrado && !saldoDivergente && (
        <>
          {atual.qrBase64 && !imagemFalhou ? (
            <div className="mx-auto w-full max-w-72 rounded-xl border border-areia bg-branco p-4">
              <Image
                src={`data:image/png;base64,${atual.qrBase64}`}
                alt={`QR Pix para pagar ${formatarBRL(atual.valor)}`}
                width={264}
                height={264}
                unoptimized
                onError={() => definirImagemFalhou(true)}
                className="h-auto w-full"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-areia bg-branco p-5 text-center">
              <QrCode aria-hidden="true" className="mx-auto mb-3 size-8 text-carvao" />
              <p className="text-sm text-carvao">
                QR indisponível.{' '}
                {atual.copiaCola ? 'Use o código Pix abaixo.' : 'Aguardando os dados da cobrança.'}
              </p>
            </div>
          )}
          {atual.copiaCola && (
            <Botao
              type="button"
              variante="primario"
              cheio
              onClick={() => void copiar()}
              icone={
                copiado ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <Copy aria-hidden="true" className="size-4" />
                )
              }
            >
              {copiado ? 'Código copiado' : 'Copiar código Pix'}
            </Botao>
          )}
          <span className="sr-only" aria-live="polite">
            {copiado ? 'Código Pix copiado.' : ''}
          </span>
          {erroCopia && (
            <div className="space-y-3">
              <Mensagem tipo="erro">{erroCopia}</Mensagem>
              <label className="block text-sm font-semibold text-carvao">
                Código Pix
                <textarea
                  readOnly
                  value={atual.copiaCola ?? ''}
                  onFocus={(evento) => evento.currentTarget.select()}
                  className="mt-2 min-h-28 w-full rounded-lg border border-areia bg-branco p-3 text-xs break-all focus-visible:outline-2 focus-visible:outline-tinta"
                />
              </label>
            </div>
          )}
        </>
      )}
      {pendente && (
        <>
          <p
            className={`flex items-center justify-center gap-2 text-center text-sm ${prazoEncerrado ? 'font-semibold text-[#805000]' : 'text-carvao'}`}
          >
            <Clock3 aria-hidden="true" className="size-4 shrink-0" />
            {prazoEncerrado ? (
              'Prazo encerrado. Confirmando situação…'
            ) : segundos !== null ? (
              <span>
                Expira em <strong className="tabular-nums">{tempoRestante(segundos)}</strong>
              </span>
            ) : (
              'A confirmação aparece aqui automaticamente.'
            )}
          </p>
          {confirmarCancelamento ? (
            <div className="space-y-3 rounded-xl border border-areia p-4">
              <p className="text-sm font-semibold">Cancelar esta cobrança?</p>
              <div className="grid gap-2 min-[400px]:grid-cols-2">
                <Botao type="button" variante="perigo" carregando={cancelando} onClick={cancelar}>
                  Sim, cancelar
                </Botao>
                <Botao
                  type="button"
                  variante="secundario"
                  disabled={cancelando}
                  onClick={() => definirConfirmarCancelamento(false)}
                >
                  Manter Pix
                </Botao>
              </div>
            </div>
          ) : (
            <Botao
              type="button"
              variante="secundario"
              cheio
              onClick={() => definirConfirmarCancelamento(true)}
            >
              Cancelar cobrança
            </Botao>
          )}
        </>
      )}
      {atual.mensagem && !pago && (
        <Mensagem tipo={atual.estado === 'erro' ? 'erro' : 'info'}>{atual.mensagem}</Mensagem>
      )}
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
    </section>
  )
}
