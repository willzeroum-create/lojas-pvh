'use client'

import { ESTILO_PRIMARIO } from './_components/apresentacao'

export default function ErroFinanceiro({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="rounded-xl border border-areia bg-branco p-5 sm:p-8">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Financeiro</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar os dados</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
        O serviço pode estar indisponível no momento. Tente novamente para consultar os saldos e as contas.
      </p>
      <button type="button" onClick={() => retry()} className={`${ESTILO_PRIMARIO} mt-6`}>
        Tentar novamente
      </button>
    </section>
  )
}
