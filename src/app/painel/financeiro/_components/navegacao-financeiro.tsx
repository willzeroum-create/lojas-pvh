'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ABAS = [
  { href: '/painel/financeiro', rotulo: 'Visão geral' },
  { href: '/painel/financeiro/receber', rotulo: 'A receber' },
  { href: '/painel/financeiro/pagar', rotulo: 'A pagar' },
] as const

export function NavegacaoFinanceiro() {
  const caminho = usePathname()
  return (
    <nav
      aria-label="Financeiro"
      className="grid w-full grid-cols-3 gap-1 rounded-xl border border-areia bg-papel-2 p-1 sm:max-w-md"
    >
      {ABAS.map((aba) => (
        <Link
          key={aba.href}
          href={aba.href}
          aria-current={caminho === aba.href ? 'page' : undefined}
          className={`flex min-h-12 min-w-0 items-center justify-center rounded-lg px-2 py-3 text-center text-sm font-bold transition-colors ${caminho === aba.href ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3'}`}
        >
          {aba.rotulo}
        </Link>
      ))}
    </nav>
  )
}
