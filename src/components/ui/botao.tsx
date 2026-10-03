import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'perigo' | 'sucesso' | 'marca'
type Tamanho = 'sm' | 'md' | 'lg'

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-tinta text-papel hover:bg-carvao active:bg-tinta',
  secundario: 'bg-branco text-tinta border border-areia hover:bg-papel-2 active:bg-papel-3',
  fantasma: 'bg-transparent text-carvao hover:bg-papel-2 active:bg-papel-3',
  perigo: 'bg-vermelho-clara text-vermelho hover:bg-[#f5cfc9]',
  sucesso: 'bg-verde text-branco hover:bg-[#19733f]',
  marca: 'bg-marca text-branco hover:brightness-95 active:brightness-90',
}

/** Alvos de toque: 40, 48 e 56 px. O painel usa `md` e `lg`. */
const TAMANHOS: Record<Tamanho, string> = {
  sm: 'h-10 px-3.5 text-sm rounded-md gap-1.5',
  md: 'h-12 px-5 text-[15px] rounded-lg gap-2',
  lg: 'h-14 px-6 text-base rounded-xl gap-2.5',
}

export type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante
  tamanho?: Tamanho
  cheio?: boolean
  carregando?: boolean
  icone?: ReactNode
}

export function Botao({
  variante = 'primario',
  tamanho = 'md',
  cheio,
  carregando,
  icone,
  className,
  children,
  disabled,
  ...resto
}: BotaoProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-[background-color,transform,filter] duration-150 select-none',
        'focus-visible:ring-2 focus-visible:ring-tinta/40 focus-visible:ring-offset-2 focus-visible:ring-offset-papel focus-visible:outline-none',
        'active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTES[variante],
        TAMANHOS[tamanho],
        cheio && 'w-full',
        className,
      )}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {carregando ? <Girante /> : icone}
      {children}
    </button>
  )
}

export function Girante({ className }: { className?: string }) {
  return (
    <svg className={cn('size-4 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
