'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Recarrega os dados da página a cada 30 s enquanto está visível. */
export function AtualizarSozinho({ segundos = 30 }: { segundos?: number }) {
  const router = useRouter()
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) router.refresh()
    }, segundos * 1000)
    return () => window.clearInterval(id)
  }, [router, segundos])
  return null
}
