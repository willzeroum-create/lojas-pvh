import type { ReactNode } from 'react'
import { NavegacaoFiscal } from './_components/navegacao-fiscal'

export default function LayoutFiscal({ children }: { children: ReactNode }) {
  return (
    <div className="fiscal-area mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <NavegacaoFiscal />
      {children}
    </div>
  )
}
