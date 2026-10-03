import type { InputHTMLAttributes, ReactNode } from 'react'
import type { EstadoEntrada } from '@/lib/supabase/tipos'

export const BOTAO_ENTRADA =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold text-tinta hover:bg-papel-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta'
export const PRIMARIO_ENTRADA = `${BOTAO_ENTRADA} border-transparent bg-tangerina hover:bg-tangerina-clara`
export const CAMPO_ENTRADA =
  'min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 text-base text-tinta placeholder:text-carvao focus:border-tinta focus:outline-2 focus:outline-offset-2 focus:outline-tinta disabled:bg-papel-2 aria-[invalid=true]:border-vermelho'

export function dataEntrada(valor: string | null) {
  if (!valor) return 'Não informada'
  const data = new Date(valor.length === 10 ? `${valor}T12:00:00Z` : valor)
  return Number.isNaN(data.getTime())
    ? 'Não informada'
    : data.toLocaleDateString('pt-BR', { timeZone: 'America/Porto_Velho' })
}

export function quantidadeEntrada(valor: number) {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

export function SeloEntrada({ estado }: { estado: EstadoEntrada }) {
  const rotulos = { pendente: 'Em conferência', concluida: 'Concluída', cancelada: 'Cancelada' }
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${estado === 'concluida' ? 'bg-verde-clara text-[#176b3a]' : estado === 'cancelada' ? 'bg-papel-3 text-carvao' : 'bg-ambar-clara text-[#7b4b00]'}`}
    >
      {rotulos[estado]}
    </span>
  )
}

export function CampoEntrada({
  rotulo,
  erro,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: ReactNode; erro?: string; id: string }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-carvao">
        {rotulo}
      </label>
      <input
        {...props}
        id={id}
        className={CAMPO_ENTRADA}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
      />
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-vermelho">
          {erro}
        </p>
      )}
    </div>
  )
}
