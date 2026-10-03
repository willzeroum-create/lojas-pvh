import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

export function Cartao({ className, ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border border-areia/70 bg-branco shadow-cartao', className)} {...resto} />
  )
}

/** Número grande com legenda, para o ecrã "Resumo". */
export function NumeroGrande({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string
  valor: string
  detalhe?: string
}) {
  return (
    <Cartao className="p-4">
      <p className="text-xs font-bold tracking-wider text-cinza uppercase">{rotulo}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-tinta tabular-nums sm:text-4xl">
        {valor}
      </p>
      {detalhe && <p className="mt-1 text-sm text-cinza">{detalhe}</p>}
    </Cartao>
  )
}
