'use client'

import { ESTILO_PRIMARIO } from './_components/apresentacao'

export default function ErroEquipe({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section
      role="alert"
      className="equipe-area mx-auto max-w-3xl rounded-xl border border-areia bg-branco p-5 sm:p-8"
    >
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Equipe</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar a equipe</h1>
      <p className="mt-3 text-sm leading-relaxed text-carvao">
        O serviço pode estar indisponível. Tente novamente para consultar as pessoas e os registros de
        operações.
      </p>
      <button type="button" onClick={retry} className={`${ESTILO_PRIMARIO} mt-6`}>
        Tentar novamente
      </button>
    </section>
  )
}
