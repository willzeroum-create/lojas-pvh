'use client'

import { Botao } from '@/components/ui/botao'

export default function ErroPix({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="pix-area rounded-xl border border-areia bg-branco p-5 sm:p-8">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Pix</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar o Pix</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-carvao">
        Tente novamente para consultar as cobranças e confirmar os pagamentos.
      </p>
      <Botao type="button" onClick={retry} className="mt-6">
        Tentar novamente
      </Botao>
    </section>
  )
}
