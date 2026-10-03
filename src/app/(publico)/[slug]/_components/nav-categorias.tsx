'use client'

import { useEffect, useState } from 'react'
import type { CategoriaCanonica } from '@/lib/canais/tipos'
import { cn } from '@/lib/utils/cn'

/** Barra de categorias colada ao topo. A activa acompanha o scroll. */
export function NavCategorias({ categorias }: { categorias: CategoriaCanonica[] }) {
  const [activa, setActiva] = useState(categorias[0]?.id)

  useEffect(() => {
    const seccoes = categorias
      .map((c) => document.getElementById(`cat-${c.id}`))
      .filter((el): el is HTMLElement => Boolean(el))
    if (seccoes.length === 0) return
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visivel) setActiva(visivel.target.id.replace('cat-', ''))
      },
      { rootMargin: '-96px 0px -70% 0px' },
    )
    seccoes.forEach((s) => observador.observe(s))
    return () => observador.disconnect()
  }, [categorias])

  useEffect(() => {
    document
      .querySelector<HTMLElement>(`[data-chip="${activa}"]`)
      ?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [activa])

  return (
    <nav
      className="sticky top-0 z-10 border-b border-areia/60 bg-papel/90 backdrop-blur"
      aria-label="Categorias"
    >
      <ul className="mx-auto sem-scrollbar flex max-w-2xl gap-2 overflow-x-auto px-5 py-3">
        {categorias.map((c) => (
          <li key={c.id} className="shrink-0">
            <a
              href={`#cat-${c.id}`}
              data-chip={c.id}
              className={cn(
                'inline-flex h-10 items-center rounded-full px-3.5 text-sm font-semibold transition-colors',
                activa === c.id ? 'bg-tinta text-papel' : 'bg-papel-2 text-carvao hover:bg-papel-3',
              )}
            >
              {c.nome}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
