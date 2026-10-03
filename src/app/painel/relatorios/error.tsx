'use client'

import { Botao } from '@/components/ui/botao'

export default function ErroRelatorios({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="rounded-xl border border-areia bg-branco p-5 sm:p-8">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Relatórios de vendas</p>
      <h1 className="mt-3 font-sans text-2xl font-bold">Não foi possível carregar as vendas.</h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-carvao">
        Confira sua conexão e tente novamente. O período que você escolheu será mantido.
      </p>
      <Botao type="button" onClick={() => retry()} className="mt-6">
        Tentar novamente
      </Botao>
    </section>
  )
}
