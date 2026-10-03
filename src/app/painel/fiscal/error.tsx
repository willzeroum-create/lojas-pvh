'use client'

import { Botao } from '@/components/ui/botao'

export default function ErroFiscal({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="rounded-xl border border-areia bg-branco p-5 sm:p-8">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Nota fiscal</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar os dados fiscais</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
        Tente novamente para consultar suas notas e os dados dos produtos.
      </p>
      <Botao type="button" onClick={() => retry()} className="mt-6">
        Tentar novamente
      </Botao>
    </section>
  )
}
