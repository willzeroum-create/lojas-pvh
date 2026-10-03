import type { ReactNode } from 'react'
import { NavegacaoFinanceiro } from './_components/navegacao-financeiro'

export default function LayoutFinanceiro({ children }: { children: ReactNode }) {
  return (
    <div className="financeiro-area mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <NavegacaoFinanceiro />
      {children}
    </div>
  )
}
