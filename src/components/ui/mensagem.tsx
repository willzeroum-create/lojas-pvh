import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

type Tipo = 'erro' | 'sucesso' | 'info'

const ESTILOS: Record<Tipo, { caixa: string; Icone: typeof Info }> = {
  erro: { caixa: 'bg-vermelho-clara text-vermelho', Icone: AlertTriangle },
  sucesso: { caixa: 'bg-verde-clara text-verde', Icone: CheckCircle2 },
  info: { caixa: 'bg-ambar-clara text-[#8a5806]', Icone: Info },
}

/** Caixa de feedback de formulário. Aceita uma string ou uma lista de erros. */
export function Mensagem({
  tipo = 'info',
  children,
  className,
}: {
  tipo?: Tipo
  children: ReactNode
  className?: string
}) {
  if (!children) return null
  const { caixa, Icone } = ESTILOS[tipo]
  return (
    <div
      role={tipo === 'erro' ? 'alert' : 'status'}
      className={cn('flex gap-2.5 rounded-lg px-3.5 py-3 text-sm', caixa, className)}
    >
      <Icone className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="space-y-1">
        {Array.isArray(children) ? children.map((c, i) => <p key={i}>{c}</p>) : children}
      </div>
    </div>
  )
}
