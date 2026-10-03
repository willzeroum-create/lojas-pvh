'use client'

import { BarChart3, ClipboardList, Store, UserRound, UtensilsCrossed } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'

const SEPARADORES = [
  { href: '/painel/pedidos', rotulo: 'Pedidos', Icone: ClipboardList },
  { href: '/painel/cardapio', rotulo: 'Cardápio', Icone: UtensilsCrossed },
  { href: '/painel/loja', rotulo: 'Loja', Icone: Store },
  { href: '/painel/resumo', rotulo: 'Resumo', Icone: BarChart3 },
  { href: '/painel/conta', rotulo: 'Conta', Icone: UserRound },
] as const

/** Cinco separadores, sempre visíveis. Alvos de 48 px ou mais. */
export function NavPainel() {
  const caminho = usePathname()
  return (
    <nav
      aria-label="Painel"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-areia bg-papel/95 pb-segura backdrop-blur',
        'sm:static sm:w-52 sm:shrink-0 sm:border-t-0 sm:border-r sm:pb-0',
      )}
    >
      <ul className="grid grid-cols-5 sm:flex sm:flex-col sm:gap-1 sm:p-3 sm:pt-6">
        {SEPARADORES.map(({ href, rotulo, Icone }) => {
          const activo = caminho.startsWith(href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors',
                  'sm:h-12 sm:flex-row sm:justify-start sm:gap-3 sm:rounded-lg sm:px-3 sm:text-sm',
                  activo ? 'text-tinta sm:bg-papel-3' : 'text-cinza hover:text-carvao',
                )}
              >
                <Icone className={cn('size-6 sm:size-5', activo && 'marca')} strokeWidth={activo ? 2.5 : 2} />
                {rotulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
