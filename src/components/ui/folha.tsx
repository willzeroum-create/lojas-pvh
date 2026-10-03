'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Props = {
  aberta: boolean
  onFechar: () => void
  titulo?: ReactNode
  children: ReactNode
  /** No desktop a folha vira um diálogo centrado. */
  className?: string
}

/**
 * Folha deslizante inferior sobre `<dialog>` nativo: foco preso, Esc fecha,
 * fundo escurecido pelo browser. É o carrinho e o editor de opções.
 */
export function Folha({ aberta, onFechar, titulo, children, className }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (aberta && !el.open) el.showModal()
    if (!aberta && el.open) el.close()
  }, [aberta])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const aoFechar = () => onFechar()
    el.addEventListener('close', aoFechar)
    return () => el.removeEventListener('close', aoFechar)
  }, [onFechar])

  return (
    <dialog
      ref={ref}
      onClick={(e) => {
        if (e.target === ref.current) onFechar()
      }}
      className={cn(
        'fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-full bg-transparent p-0 backdrop:bg-tinta/55 backdrop:backdrop-blur-[2px]',
        'open:animate-subir',
        'sm:inset-0 sm:m-auto sm:w-[min(32rem,calc(100%-2rem))] sm:open:animate-aparecer',
      )}
    >
      <div
        className={cn(
          'flex max-h-[88dvh] flex-col rounded-t-xl bg-papel shadow-folha sm:max-h-[85dvh] sm:rounded-xl sm:shadow-flutuante',
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-areia sm:hidden" aria-hidden />
        <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="-mr-2 inline-flex size-11 items-center justify-center rounded-full text-carvao hover:bg-papel-2"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-segura">{children}</div>
      </div>
    </dialog>
  )
}
