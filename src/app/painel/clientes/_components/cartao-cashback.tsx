import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ExtratoCashback } from '@/lib/dados/fidelidade'
import { formatarBRL } from '@/lib/dominio/moeda'

export function CartaoCashback({ extrato }: { extrato: ExtratoCashback }) {
  return (
    <section
      aria-labelledby="cashback-cliente-titulo"
      className="rounded-xl border border-areia bg-branco p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="cashback-cliente-titulo" className="font-sans text-lg font-bold">
          Cashback
        </h2>
        <span className="rounded-md bg-papel-2 px-2.5 py-1.5 text-sm text-carvao">Fidelidade</span>
      </div>
      <p className="mt-4 text-sm text-carvao">Saldo disponível</p>
      <p className="mt-1 text-3xl font-bold tracking-tight break-words tabular-nums">
        {formatarBRL(extrato.saldo)}
      </p>
      {extrato.aVencer30 > 0 && (
        <p className="mt-3 rounded-lg bg-ambar-clara px-3 py-2 text-sm font-semibold text-[#754b0b]">
          {formatarBRL(extrato.aVencer30)} vencem nos próximos 30 dias.
        </p>
      )}
      <Link
        href={`/painel/fidelidade?cliente=${encodeURIComponent(extrato.pessoa.id)}`}
        className="mt-4 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-areia px-4 text-sm font-bold hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
      >
        Ver extrato e ajustar saldo <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </Link>
    </section>
  )
}
