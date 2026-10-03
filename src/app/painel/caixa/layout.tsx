import type { ReactNode } from 'react'
import { NavegacaoCaixa } from './_components/navegacao-caixa'

export default function LayoutCaixa({ children }: { children: ReactNode }) {
  return (
    <div className="caixa-area mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <NavegacaoCaixa />
      {children}
    </div>
  )
}
