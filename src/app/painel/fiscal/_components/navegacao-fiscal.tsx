'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavegacaoFiscal() {
  const caminho = usePathname()
  return (
    <nav aria-label="Nota fiscal" className="flex flex-wrap gap-2">
      {(
        [
          ['/painel/fiscal', 'Notas fiscais'],
          ['/painel/fiscal/produtos', 'Dados dos produtos'],
        ] as const
      ).map(([destino, rotulo]) => (
        <Link
          key={destino}
          href={destino}
          aria-current={caminho === destino ? 'page' : undefined}
          className={`inline-flex min-h-12 items-center justify-center rounded-lg border px-4 py-3 text-sm font-bold ${caminho === destino ? 'border-tinta bg-tinta text-papel' : 'border-areia bg-branco text-tinta hover:bg-papel-2'}`}
        >
          {rotulo}
        </Link>
      ))}
    </nav>
  )
}
