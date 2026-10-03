'use client'

import Image from 'next/image'
import type { CategoriaCanonica, ItemCanonico } from '@/lib/canais/tipos'
import { formatarBRL } from '@/lib/dominio/moeda'

export function Preco({ item, className }: { item: Pick<ItemCanonico, 'preco'>; className?: string }) {
  return (
    <span className={className}>
      {item.preco.valorOriginal !== undefined && (
        <span className="mr-2 text-sm font-normal text-nevoa tabular-nums line-through">
          {formatarBRL(item.preco.valorOriginal)}
        </span>
      )}
      <span className="tabular-nums">{formatarBRL(item.preco.valor)}</span>
    </span>
  )
}

export function ListaCardapio({
  categorias,
  onEscolher,
}: {
  categorias: CategoriaCanonica[]
  onEscolher: (item: ItemCanonico) => void
}) {
  return (
    <div className="divide-y divide-areia/60">
      {categorias.map((c) => (
        <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-20 py-6">
          <h2 className="mb-3 text-2xl font-bold">{c.nome}</h2>
          <ul className="-mx-2">
            {c.itens.map((item, indice) => (
              <li
                key={item.id}
                className="animate-aparecer"
                style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}
              >
                <button
                  type="button"
                  onClick={() => onEscolher(item)}
                  className="flex w-full items-stretch gap-4 rounded-lg px-2 py-3 text-left transition-colors hover:bg-papel-2 active:bg-papel-3"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[17px] leading-snug font-semibold">{item.nome}</h3>
                    {item.descricao && (
                      <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-cinza">{item.descricao}</p>
                    )}
                    <p className="mt-1.5 font-semibold">
                      <Preco item={item} />
                      {item.gruposOpcao.some((g) => g.obrigatorio || g.min > 0) && (
                        <span className="ml-2 text-xs font-medium text-cinza">a partir de</span>
                      )}
                    </p>
                  </div>
                  {item.imagemUrl && (
                    <div className="relative size-22 shrink-0 overflow-hidden rounded-lg bg-papel-3">
                      <Image src={item.imagemUrl} alt="" fill sizes="88px" className="object-cover" />
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
