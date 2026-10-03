'use client'

import { PRIMARIO } from './_components/apresentacao'

export default function ErroEstoque({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="rounded-xl border border-areia bg-branco p-6">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Estoque</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar o estoque</h1>
      <p className="mt-3 text-sm text-carvao">
        Tente novamente para consultar os saldos e movimentos registrados.
      </p>
      <button type="button" className={`${PRIMARIO} mt-5`} onClick={retry}>
        Tentar novamente
      </button>
    </section>
  )
}
