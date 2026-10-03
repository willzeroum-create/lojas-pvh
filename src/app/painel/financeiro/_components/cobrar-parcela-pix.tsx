'use client'

import { QrCode } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useRef, useState, useTransition, type ReactNode } from 'react'
import { cobrarParcelaPixAction } from '@/app/painel/pix/actions'
import { QrPix } from '@/app/painel/pix/_components/qr-pix'
import { Botao } from '@/components/ui/botao'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import type { CobrancaPix } from '@/lib/dados/pix'
import { formatarBRL } from '@/lib/dominio/moeda'
import { ESTILO_BOTAO } from './apresentacao'

type ParcelaPix = { id: string; descricao: string; numero: number; saldo: number }
const ContextoPix = createContext<((parcela: ParcelaPix) => void) | null>(null)

/** O diálogo permanece aberto quando a baixa automática remove a parcela da lista. */
export function CobrancasParcelasPix({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [parcela, definirParcela] = useState<ParcelaPix | null>(null)
  const [cobranca, definirCobranca] = useState<CobrancaPix | null>(null)
  const [erro, definirErro] = useState('')
  const [pendente, iniciar] = useTransition()
  const trava = useRef(false)
  const cobrancas = useRef(new Map<string, CobrancaPix>())

  function atualizar(nova: CobrancaPix) {
    definirCobranca(nova)
    if (parcela) cobrancas.current.set(parcela.id, nova)
  }

  function abrir(alvo: ParcelaPix) {
    if (trava.current) return
    definirParcela(alvo)
    definirErro('')
    const anterior = cobrancas.current.get(alvo.id)
    if (anterior && (anterior.estado === 'pendente' || anterior.estado === 'pago')) {
      definirCobranca(anterior)
      return
    }
    definirCobranca(null)
    trava.current = true
    iniciar(async () => {
      try {
        const resultado = await cobrarParcelaPixAction(alvo.id)
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        cobrancas.current.set(alvo.id, resultado.cobranca)
        definirCobranca(resultado.cobranca)
      } catch {
        definirErro(
          'Não foi possível confirmar a geração. Confira as cobranças na tela Pix antes de tentar novamente.',
        )
      } finally {
        trava.current = false
      }
    })
  }

  return (
    <ContextoPix.Provider value={abrir}>
      {children}
      {parcela && (
        <DialogoOperacao titulo="Cobrar por Pix" ocupado={pendente} fechar={() => definirParcela(null)}>
          <div className="pix-area min-w-0 space-y-4">
            <p className="text-sm leading-relaxed break-words text-carvao">
              {parcela.descricao} · Parcela {parcela.numero}
            </p>
            {pendente && (
              <div role="status" className="rounded-xl border border-areia bg-branco p-5">
                <p className="text-sm font-semibold text-carvao">Gerando cobrança do saldo</p>
                <p className="mt-2 text-3xl font-extrabold tabular-nums">{formatarBRL(parcela.saldo)}</p>
                <p className="mt-3 text-sm">Preparando o QR Pix…</p>
              </div>
            )}
            {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
            {cobranca && (
              <>
                <QrPix
                  cobranca={cobranca}
                  valorEsperado={parcela.saldo}
                  onAtualizar={atualizar}
                  onPago={() => router.refresh()}
                />
                <p className="text-sm leading-relaxed text-carvao">
                  A baixa da parcela é automática quando o Pix é confirmado.
                </p>
              </>
            )}
            {!pendente && (
              <Botao variante="secundario" cheio onClick={() => definirParcela(null)}>
                Voltar às contas
              </Botao>
            )}
          </div>
        </DialogoOperacao>
      )}
    </ContextoPix.Provider>
  )
}

export function BotaoCobrarParcelaPix({ parcela }: { parcela: ParcelaPix }) {
  const abrir = useContext(ContextoPix)
  return (
    <button type="button" className={`${ESTILO_BOTAO} w-full`} onClick={() => abrir?.(parcela)}>
      <QrCode aria-hidden="true" className="size-4 shrink-0" />
      Cobrar por Pix
    </button>
  )
}
