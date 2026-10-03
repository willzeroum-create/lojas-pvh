import type { ReactNode } from 'react'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'

export default async function LayoutEstoque({ children }: { children: ReactNode }) {
  const ctx = await exigirModulo('estoque')
  const destinos = [
    ['', 'Visão geral'],
    ['/entradas', 'Entradas'],
    ['/inventario', 'Inventário'],
    ['/produtos', 'Produtos'],
    ...(ctx.modulos.has('producao')
      ? [
          ['/insumos', 'Insumos'],
          ['/custos', 'Custos e margens'],
        ]
      : []),
  ]
  return (
    <div className="estoque-area mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-6">
      <nav aria-label="Estoque" className="flex flex-wrap gap-2">
        {destinos.map(([rota, rotulo]) => (
          <Link
            key={rota}
            href={`/painel/estoque${rota}`}
            className="inline-flex min-h-12 items-center rounded-lg border border-areia bg-papel px-4 py-3 text-sm font-bold hover:bg-papel-2"
          >
            {rotulo}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  )
}
