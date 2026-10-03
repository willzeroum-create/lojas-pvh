'use client'

import { Botao } from '@/components/ui/botao'

export default function ErroFidelidade({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="space-y-4 rounded-xl border border-areia bg-branco p-5 sm:p-6">
      <h1 className="text-2xl font-bold">Não foi possível carregar o cashback.</h1>
      <p className="text-sm leading-relaxed text-carvao">Confira a conexão e tente novamente.</p>
      <Botao type="button" onClick={retry}>
        Tentar novamente
      </Botao>
    </section>
  )
}
