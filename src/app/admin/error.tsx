'use client'

import { Botao } from '@/components/ui/botao'

/** Erro inesperado numa página do console. A mensagem vem inteira: é para a equipa. */
export default function ErroConsole({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex max-w-xl flex-col gap-4 py-10">
      <h1 className="text-xl font-bold">Erro nesta página</h1>
      <pre className="overflow-x-auto rounded-lg bg-vermelho-clara px-4 py-3 text-sm whitespace-pre-wrap text-vermelho">
        {error.message || 'Erro inesperado.'}
      </pre>
      {error.digest && <p className="text-xs text-cinza">ref. {error.digest}</p>}
      <div>
        <Botao onClick={reset}>Tentar de novo</Botao>
      </div>
    </div>
  )
}
