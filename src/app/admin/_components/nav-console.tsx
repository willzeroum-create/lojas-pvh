'use client'

import { ClipboardList, LayoutGrid, ListChecks, LogOut, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MARCA } from '@/lib/config/marca'
import { cn } from '@/lib/utils/cn'

const ENTRADAS = [
  { href: '/admin', rotulo: 'Tenants', Icone: LayoutGrid, exacto: true },
  { href: '/admin/tenants/novo', rotulo: 'Novo tenant', Icone: Plus, exacto: true },
  { href: '/admin/pedidos', rotulo: 'Pedidos', Icone: ClipboardList, exacto: false },
  { href: '/admin/cadeia', rotulo: 'Cadeia', Icone: ListChecks, exacto: false },
  { href: '/admin/equipa', rotulo: 'Equipa', Icone: Users, exacto: false },
] as const

type Props = { nome?: string | null; email?: string | null }

/**
 * Navegação do console. No computador é a coluna da esquerda; em ecrãs
 * estreitos vira uma barra colada ao topo com os mesmos cinco destinos em
 * fila, deslizável, para o console também servir no telemóvel.
 */
export function NavConsole({ nome, email }: Props) {
  const caminho = usePathname()
  const activa = (e: (typeof ENTRADAS)[number]) => {
    // As fichas dos tenants pertencem a "Tenants"; "Novo tenant" tem entrada própria.
    if (e.href === '/admin')
      return (
        caminho === '/admin' || (caminho.startsWith('/admin/tenants/') && caminho !== '/admin/tenants/novo')
      )
    if (e.exacto) return caminho === e.href
    return caminho.startsWith(e.href)
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-areia bg-papel-2/95 backdrop-blur lg:hidden">
        <div className="flex h-12 items-center justify-between gap-3 px-4">
          <p className="min-w-0 truncate font-display text-base font-bold">
            <span className="mr-2 font-sans text-xs font-bold tracking-[0.3em] text-cinza uppercase">
              {MARCA.nome}
            </span>
            Console
          </p>
          <form action="/sair" method="post">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-carvao hover:bg-papel-3"
            >
              <LogOut className="size-4" /> Sair
            </button>
          </form>
        </div>
        <nav aria-label="Console" className="sem-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {ENTRADAS.map((e) => {
            const on = activa(e)
            return (
              <Link
                key={e.href}
                href={e.href}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors',
                  on ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3',
                )}
              >
                <e.Icone className="size-4" /> {e.rotulo}
              </Link>
            )
          })}
        </nav>
      </header>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-areia bg-papel-2 p-4 lg:flex">
        <p className="px-2 text-xs font-bold tracking-[0.3em] text-cinza uppercase">{MARCA.nome}</p>
        <p className="px-2 font-display text-lg font-bold">Console</p>
        <nav aria-label="Console" className="mt-6 flex flex-col gap-1 text-sm font-semibold">
          {ENTRADAS.map((e) => {
            const on = activa(e)
            return (
              <Link
                key={e.href}
                href={e.href}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-md px-2 transition-colors',
                  on ? 'bg-papel-3 text-tinta' : 'text-carvao hover:bg-papel-3',
                )}
              >
                <e.Icone className="size-4" /> {e.rotulo}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-2 px-2 text-xs text-cinza">
          <p className="truncate">
            {nome}
            <br />
            {email}
          </p>
          <form action="/sair" method="post">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 font-semibold text-carvao underline underline-offset-4"
            >
              <LogOut className="size-3.5" /> Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
