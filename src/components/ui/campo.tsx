import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

const BASE =
  'w-full rounded-lg border border-areia bg-branco px-3.5 text-[15px] text-tinta placeholder:text-nevoa transition-colors ' +
  'focus:border-tinta focus:outline-none focus:ring-2 focus:ring-tinta/15 disabled:bg-papel-2 disabled:text-cinza aria-[invalid=true]:border-vermelho'

type Envolvente = {
  rotulo?: ReactNode
  ajuda?: ReactNode
  erro?: string
  className?: string
}

function Envolvente({
  rotulo,
  ajuda,
  erro,
  className,
  id,
  children,
}: Envolvente & { id?: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {rotulo && (
        <label htmlFor={id} className="text-sm font-semibold text-carvao">
          {rotulo}
        </label>
      )}
      {children}
      {erro ? (
        <p className="text-sm text-vermelho">{erro}</p>
      ) : ajuda ? (
        <p className="text-sm text-cinza">{ajuda}</p>
      ) : null}
    </div>
  )
}

export function Campo({
  rotulo,
  ajuda,
  erro,
  className,
  id,
  ...resto
}: InputHTMLAttributes<HTMLInputElement> & Envolvente) {
  const idFinal = id ?? resto.name
  return (
    <Envolvente rotulo={rotulo} ajuda={ajuda} erro={erro} className={className} id={idFinal}>
      <input id={idFinal} className={cn(BASE, 'h-12')} aria-invalid={erro ? true : undefined} {...resto} />
    </Envolvente>
  )
}

export function AreaTexto({
  rotulo,
  ajuda,
  erro,
  className,
  id,
  ...resto
}: TextareaHTMLAttributes<HTMLTextAreaElement> & Envolvente) {
  const idFinal = id ?? resto.name
  return (
    <Envolvente rotulo={rotulo} ajuda={ajuda} erro={erro} className={className} id={idFinal}>
      <textarea
        id={idFinal}
        className={cn(BASE, 'min-h-24 py-3 leading-snug')}
        aria-invalid={erro ? true : undefined}
        {...resto}
      />
    </Envolvente>
  )
}

export function Seleccao({
  rotulo,
  ajuda,
  erro,
  className,
  id,
  children,
  ...resto
}: SelectHTMLAttributes<HTMLSelectElement> & Envolvente) {
  const idFinal = id ?? resto.name
  return (
    <Envolvente rotulo={rotulo} ajuda={ajuda} erro={erro} className={className} id={idFinal}>
      <select
        id={idFinal}
        className={cn(
          BASE,
          'bg-[url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 fill=%27none%27 stroke=%27%237a7266%27 stroke-width=%272%27><path d=%27m4 6 4 4 4-4%27/></svg>")] h-12 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
        )}
        aria-invalid={erro ? true : undefined}
        {...resto}
      >
        {children}
      </select>
    </Envolvente>
  )
}
