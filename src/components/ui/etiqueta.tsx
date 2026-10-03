import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Tom = 'neutro' | 'verde' | 'ambar' | 'vermelho' | 'marca' | 'tinta'

const TONS: Record<Tom, string> = {
  neutro: 'bg-papel-3 text-carvao',
  verde: 'bg-verde-clara text-verde',
  ambar: 'bg-ambar-clara text-[#8a5806]',
  vermelho: 'bg-vermelho-clara text-vermelho',
  marca: 'bg-marca-clara marca',
  tinta: 'bg-tinta text-papel',
}

export function Etiqueta({
  tom = 'neutro',
  className,
  children,
  ponto,
}: {
  tom?: Tom
  className?: string
  children: ReactNode
  ponto?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase',
        TONS[tom],
        className,
      )}
    >
      {ponto && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
