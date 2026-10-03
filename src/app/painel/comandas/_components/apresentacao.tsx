import type { ReactNode } from 'react'

export const BOTAO_COMANDA =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-areia bg-branco px-4 py-3 text-sm font-bold text-tinta hover:bg-papel-2 disabled:cursor-not-allowed disabled:opacity-50'
export const PRIMARIO_COMANDA =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tangerina px-5 py-3 text-sm font-bold text-tinta hover:bg-tangerina-clara disabled:cursor-not-allowed disabled:opacity-50'
export const CAMPO_COMANDA =
  'min-h-12 w-full min-w-0 rounded-xl border border-areia bg-branco px-3 py-3 text-base text-tinta disabled:opacity-50 aria-[invalid=true]:border-vermelho'

export function AvisoComanda({ children, erro = false }: { children: ReactNode; erro?: boolean }) {
  return (
    <div
      role={erro ? 'alert' : 'status'}
      className={`rounded-xl border p-4 text-sm leading-relaxed ${erro ? 'border-vermelho/40 bg-vermelho-clara text-[#a82a1a]' : 'border-areia bg-papel-2 text-carvao'}`}
    >
      {children}
    </div>
  )
}

export function tempoAberto(inicio: string, agora: number) {
  const minutos = Math.max(0, Math.floor((agora - new Date(inicio).getTime()) / 60000))
  if (!Number.isFinite(minutos)) return 'Tempo indisponível'
  if (minutos < 1) return 'Agora'
  if (minutos < 60) return `${minutos} min`
  return `${Math.floor(minutos / 60)}h ${String(minutos % 60).padStart(2, '0')}min`
}
