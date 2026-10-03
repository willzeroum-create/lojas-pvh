'use client'

import Link from 'next/link'
import { BOTAO_COMANDA, PRIMARIO_COMANDA } from './_components/apresentacao'

export default function ErroComandas({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="comandas-area rounded-xl border border-areia bg-branco p-5 sm:p-8">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Mesas e comandas</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar o atendimento</h1>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
        Confira a conexão e tente novamente. Se acabou de enviar itens ou fechar uma conta, confira a comanda
        antes de repetir a operação.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className={PRIMARIO_COMANDA}>
          Tentar novamente
        </button>
        <Link href="/painel/comandas" className={BOTAO_COMANDA}>
          Voltar ao salão
        </Link>
      </div>
    </section>
  )
}
