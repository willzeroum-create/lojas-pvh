'use client'

import { PRIMARIO_CAIXA } from './_components/apresentacao'

export default function ErroCaixa({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="rounded-xl border border-areia bg-branco p-5 sm:p-8">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Caixa</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar o caixa</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
        Verifique a conexão e tente novamente. Se acabou de enviar uma abertura, movimentação ou fechamento,
        confira os registros antes de repetir.
      </p>
      <button type="button" onClick={() => retry()} className={`${PRIMARIO_CAIXA} mt-6`}>
        Tentar novamente
      </button>
    </section>
  )
}
