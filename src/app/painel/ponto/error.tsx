'use client'

import { Botao } from '@/components/ui/botao'

export default function ErroPonto({ reset }: { reset: () => void }) {
  return <section role="alert" className="space-y-4 rounded-xl border border-areia bg-branco p-6"><h1 className="text-2xl font-bold">Não foi possível abrir o ponto.</h1><p className="text-carvao">Confira a conexão e tente novamente.</p><Botao onClick={reset}>Tentar novamente</Botao></section>
}
