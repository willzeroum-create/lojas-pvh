'use client'

import { useId } from 'react'
import { Delete } from 'lucide-react'

/** Teclado do balcão: não abre o teclado virtual e também aceita teclas físicas. */
export function TecladoPin({
  valor,
  onChange,
  desabilitado = false,
  id,
  rotulo = 'PIN de 4 a 6 números',
  erro,
}: {
  valor: string
  onChange: (valor: string) => void
  desabilitado?: boolean
  id?: string
  rotulo?: string
  erro?: string
}) {
  const gerado = useId()
  const identificador = id ?? gerado
  const digitar = (digito: string) => {
    if (!desabilitado && valor.length < 6) onChange(valor + digito)
  }
  return (
    <fieldset
      disabled={desabilitado}
      className="min-w-0 space-y-3"
      onKeyDown={(evento) => {
        if (evento.ctrlKey || evento.metaKey || evento.altKey || desabilitado) return
        if (/^[0-9]$/.test(evento.key)) {
          evento.preventDefault()
          digitar(evento.key)
        }
        if (evento.key === 'Backspace') {
          evento.preventDefault()
          onChange(valor.slice(0, -1))
        }
        if (evento.key === 'Delete') {
          evento.preventDefault()
          onChange('')
        }
      }}
    >
      <legend className="mb-2 text-sm font-semibold text-carvao">{rotulo}</legend>
      <div
        id={identificador}
        data-teclado-pin
        role="group"
        tabIndex={desabilitado ? -1 : 0}
        aria-label={`${valor.length} de até 6 números preenchidos`}
        aria-describedby={erro ? `${identificador}-erro` : undefined}
        className="flex min-h-14 items-center justify-center gap-3 rounded-lg border border-areia bg-papel-2 outline-offset-4 focus-visible:outline-2 focus-visible:outline-tinta"
      >
        {Array.from({ length: 6 }, (_, indice) => (
          <span
            key={indice}
            aria-hidden="true"
            className={`size-3 rounded-full border ${indice < valor.length ? 'border-tinta bg-tinta' : 'border-cinza bg-transparent'}`}
          />
        ))}
        <span className="sr-only" aria-live="polite">
          {valor.length} números preenchidos
        </span>
      </div>
      {erro && (
        <p id={`${identificador}-erro`} role="alert" className="text-sm text-vermelho">
          {erro}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'limpar', '0', 'apagar'].map((tecla) => (
          <button
            key={tecla}
            type="button"
            aria-label={
              tecla === 'apagar' ? 'Apagar último número' : tecla === 'limpar' ? 'Limpar PIN' : tecla
            }
            onClick={() =>
              tecla === 'limpar'
                ? onChange('')
                : tecla === 'apagar'
                  ? onChange(valor.slice(0, -1))
                  : digitar(tecla)
            }
            className="flex min-h-16 min-w-16 items-center justify-center rounded-lg border border-areia bg-branco text-2xl font-bold tabular-nums hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:opacity-50"
          >
            {tecla === 'apagar' ? (
              <Delete aria-hidden="true" className="size-6" />
            ) : tecla === 'limpar' ? (
              <span className="text-sm">Limpar</span>
            ) : (
              tecla
            )}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
