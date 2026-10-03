'use client'

import { Botao } from '@/components/ui/botao'

/** Erro inesperado numa página do painel: mensagem simples e um botão para tentar de novo. */
export default function ErroPainel({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <p className="font-display text-5xl font-bold text-areia">Ops</p>
      <h1 className="text-xl font-bold">Algo deu errado nesta tela</h1>
      <p className="text-sm text-carvao">{error.message || 'Erro inesperado.'}</p>
      <Botao onClick={reset}>Tentar de novo</Botao>
      {error.digest && <p className="text-xs text-nevoa">ref. {error.digest}</p>}
    </div>
  )
}
