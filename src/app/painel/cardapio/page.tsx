import { ChevronRight, Plus, Settings2 } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { exigirPainel } from '@/lib/auth/guardas'
import { listarCategoriasComProdutos } from '@/lib/dados/cardapio'
import { formatarBRL } from '@/lib/dominio/moeda'
import { InterruptorDisponibilidade } from './_components/interruptor-disponibilidade'

export const metadata: Metadata = { title: 'Cardápio' }

export default async function PaginaCardapio() {
  const { supabase, tenantId } = await exigirPainel()
  const categorias = await listarCategoriasComProdutos(supabase, tenantId)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Cardápio</h1>
        <Link
          href="/painel/cardapio/categoria/nova"
          className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-areia bg-branco px-3.5 text-sm font-semibold"
        >
          <Plus className="size-4" /> Categoria
        </Link>
      </div>

      {categorias.length === 0 && (
        <div className="rounded-lg border border-dashed border-areia px-6 py-14 text-center text-carvao">
          <p className="text-lg font-semibold">O cardápio está vazio</p>
          <p className="mt-1 text-sm">Comece por criar uma categoria, como “Lanches” ou “Bebidas”.</p>
        </div>
      )}

      {categorias.map((c) => (
        <section key={c.id} className="rounded-lg border border-areia/70 bg-branco shadow-cartao">
          <header className="flex items-center justify-between gap-3 border-b border-areia/60 px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              {c.nome}
              {!c.ativo && <span className="text-xs font-bold text-cinza uppercase">oculta</span>}
            </h2>
            <div className="flex gap-1">
              <Link
                href={`/painel/cardapio/categoria/${c.id}`}
                aria-label={`Editar ${c.nome}`}
                className="inline-flex size-11 items-center justify-center rounded-lg text-carvao hover:bg-papel-2"
              >
                <Settings2 className="size-5" />
              </Link>
              <Link
                href={`/painel/cardapio/produto/novo?categoria=${c.id}`}
                className="inline-flex h-11 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-carvao hover:bg-papel-2"
              >
                <Plus className="size-4" /> Produto
              </Link>
            </div>
          </header>
          {c.produtos.length === 0 ? (
            <p className="px-4 py-5 text-sm text-cinza">Nenhum produto nesta categoria.</p>
          ) : (
            <ul className="divide-y divide-areia/60">
              {c.produtos.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-papel-3">
                    {p.foto_url && (
                      <Image src={p.foto_url} alt="" fill sizes="48px" className="object-cover" />
                    )}
                  </div>
                  <Link
                    href={`/painel/cardapio/produto/${p.id}`}
                    className="flex min-w-0 flex-1 items-center gap-2 py-2"
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-semibold ${p.disponivel ? '' : 'text-cinza line-through'}`}
                      >
                        {p.nome}
                      </span>
                      <span className="text-sm text-carvao tabular-nums">
                        {p.preco_promocional != null ? (
                          <>
                            <span className="mr-1.5 text-nevoa line-through">
                              {formatarBRL(Number(p.preco))}
                            </span>
                            {formatarBRL(Number(p.preco_promocional))}
                          </>
                        ) : (
                          formatarBRL(Number(p.preco))
                        )}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-nevoa" />
                  </Link>
                  <InterruptorDisponibilidade produtoId={p.id} inicial={p.disponivel} nome={p.nome} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
