'use client'

import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { conferirCaixaAction } from '../actions'
import { AvisoCaixa, BOTAO_CAIXA, PRIMARIO_CAIXA } from './apresentacao'

export function ConferirCaixa({ sessaoId }: { sessaoId: string }) {
  const roteador = useRouter()
  const enviando = useRef(false)
  const [confirmacao, definirConfirmacao] = useState(false)
  const [erro, definirErro] = useState<string | null>(null)
  const [incerto, definirIncerto] = useState(false)
  const [feito, definirFeito] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  function conferir() {
    if (enviando.current || incerto || feito) return
    enviando.current = true
    definirErro(null)
    iniciarTransicao(async () => {
      try {
        const resposta = await conferirCaixaAction(sessaoId)
        if (!resposta.ok) {
          definirErro(resposta.erro)
          return
        }
        definirFeito(true)
        roteador.refresh()
      } catch {
        definirIncerto(true)
        definirErro('A conexão caiu. Atualize a página para verificar se a conferência foi registrada.')
      } finally {
        enviando.current = false
      }
    })
  }

  if (feito) return <AvisoCaixa>Conferência registrada.</AvisoCaixa>
  return (
    <div className="space-y-3">
      {erro && <AvisoCaixa erro>{erro}</AvisoCaixa>}
      {confirmacao ? (
        <div className="space-y-3 rounded-xl border border-areia bg-papel-2 p-4">
          <p className="text-sm font-bold">Você revisou os valores e os movimentos deste caixa?</p>
          <p className="text-sm text-carvao">A conferência será registrada em seu nome.</p>
          <div className="flex flex-wrap gap-2">
            {incerto ? (
              <button type="button" className={BOTAO_CAIXA} onClick={() => window.location.reload()}>
                Atualizar situação
              </button>
            ) : (
              <>
                <button type="button" className={PRIMARIO_CAIXA} onClick={conferir} disabled={pendente}>
                  {pendente ? 'Registrando…' : 'Sim, marcar como conferido'}
                </button>
                <button
                  type="button"
                  className={BOTAO_CAIXA}
                  disabled={pendente}
                  onClick={() => definirConfirmacao(false)}
                >
                  Voltar
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <button type="button" className={PRIMARIO_CAIXA} onClick={() => definirConfirmacao(true)}>
          <Check aria-hidden="true" className="size-4" />
          Conferir caixa
        </button>
      )}
    </div>
  )
}
