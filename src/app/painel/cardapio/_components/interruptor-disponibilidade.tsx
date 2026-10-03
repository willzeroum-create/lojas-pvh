'use client'

import { useOptimistic, useTransition } from 'react'
import { Interruptor } from '@/components/ui/interruptor'
import { alternarDisponibilidade } from '../actions'

/** Um toque: esgotado ↔ disponível. Optimista, com reversão se o servidor falhar. */
export function InterruptorDisponibilidade({
  produtoId,
  inicial,
  nome,
}: {
  produtoId: string
  inicial: boolean
  nome: string
}) {
  const [ocupado, iniciar] = useTransition()
  const [valor, definirOptimista] = useOptimistic(inicial)

  return (
    <Interruptor
      tamanho="grande"
      ligado={valor}
      ocupado={ocupado}
      rotulo={`Disponibilidade de ${nome}`}
      onMudar={(novo) =>
        iniciar(async () => {
          definirOptimista(novo)
          await alternarDisponibilidade(produtoId, novo)
        })
      }
    />
  )
}
