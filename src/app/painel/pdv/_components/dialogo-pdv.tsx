'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** O diálogo nativo mantém o foco dentro da operação e torna o balcão inerte. */
export function DialogoPdv({
  titulo,
  children,
  fechar,
  ocupado = false,
}: {
  titulo: string
  children: ReactNode
  fechar: () => void
  ocupado?: boolean
}) {
  const referencia = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const elemento = referencia.current
    if (!elemento) return
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    elemento.showModal()
    elemento.querySelector<HTMLElement>('[data-foco-inicial]')?.focus()
    return () => {
      elemento.close()
      document.body.style.overflow = overflow
      anterior?.focus()
    }
  }, [])
  return (
    <dialog
      ref={referencia}
      aria-labelledby="pdv-dialogo-titulo"
      className="pdv-area pdv-dialogo"
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) fechar()
      }}
    >
      <header className="flex items-start justify-between gap-3 border-b border-areia p-4 sm:p-6">
        <h2 id="pdv-dialogo-titulo" className="self-center text-xl font-bold">
          {titulo}
        </h2>
        <button
          type="button"
          className="pdv-icone"
          disabled={ocupado}
          onClick={fechar}
          aria-label="Fechar (Esc)"
        >
          <X aria-hidden className="size-5" />
        </button>
      </header>
      <div className="p-4 sm:p-6">{children}</div>
    </dialog>
  )
}
