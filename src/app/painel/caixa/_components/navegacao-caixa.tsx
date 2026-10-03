'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'

export function NavegacaoCaixa() {
  const caminho = usePathname()
  return (
    <nav
      aria-label="Páginas do caixa"
      className="flex flex-wrap items-center gap-2 border-b border-areia pb-3"
    >
      {[
        { href: '/painel/caixa', rotulo: 'Caixa atual', ativo: caminho === '/painel/caixa' },
        { href: '/painel/caixa/historico', rotulo: 'Histórico', ativo: caminho !== '/painel/caixa' },
      ].map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.ativo ? 'page' : undefined}
          className={`inline-flex min-h-12 items-center justify-center rounded-xl px-4 py-3 text-sm font-bold ${item.ativo ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-2'}`}
        >
          {item.rotulo}
        </Link>
      ))}
      <Link
        href="/painel/pdv"
        className="ml-auto inline-flex min-h-12 items-center gap-2 rounded-xl px-3 py-3 text-sm font-bold hover:bg-papel-2"
      >
        Ir ao PDV
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </nav>
  )
}
