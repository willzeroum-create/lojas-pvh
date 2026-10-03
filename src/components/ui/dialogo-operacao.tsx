'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function DialogoOperacao({
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
  const tituloId = useId()
  useEffect(() => {
    const dialogo = referencia.current
    const origem = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogo?.showModal()
    dialogo?.querySelector<HTMLElement>('[data-teclado-pin]')?.focus()
    return () => {
      dialogo?.close()
      origem?.focus()
    }
  }, [])
  return (
    <dialog
      ref={referencia}
      aria-labelledby={tituloId}
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) fechar()
      }}
      className="dialogo-operacao fixed inset-0 m-auto max-h-[92dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border border-areia bg-papel p-4 text-tinta shadow-xl backdrop:bg-tinta/60 sm:p-6"
    >
      <header className="mb-5 flex items-center justify-between gap-3">
        <h2 id={tituloId} className="text-xl font-bold">
          {titulo}
        </h2>
        <button
          type="button"
          disabled={ocupado}
          onClick={fechar}
          aria-label="Fechar diálogo"
          className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-areia hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-tinta disabled:opacity-50"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </header>
      {children}
    </dialog>
  )
}
