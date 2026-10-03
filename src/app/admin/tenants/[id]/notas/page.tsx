import { Pin, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirConsole } from '@/lib/auth/guardas'
import { listarNotas } from '@/lib/dados/cadeia'
import { obterTenant } from '@/lib/dados/tenants'

export const metadata: Metadata = { title: 'Notas internas' }

function quando(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

/** Primeiras linhas do Markdown sem a sintaxe, para o cartão. */
function excerto(md: string) {
  return md
    .replace(/[#>*_`~-]+/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

/** O dossiê da empresa: briefing, acessos, reuniões. Só a equipa vê. */
export default async function PaginaNotas(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const { supabase } = await exigirConsole()
  const tenant = await obterTenant(supabase, id)
  if (!tenant) notFound()
  const notas = await listarNotas(supabase, id)

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={`/admin/tenants/${tenant.id}`}
            className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
          >
            ← {tenant.nome_fantasia}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Notas internas</h1>
          <p className="text-sm text-cinza">Markdown livre. O comerciante nunca vê isto.</p>
        </div>
        <Link
          href={`/admin/tenants/${tenant.id}/notas/nova`}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-tinta px-3.5 text-sm font-semibold text-papel hover:bg-carvao"
        >
          <Plus className="size-4" /> Nova nota
        </Link>
      </header>

      {notas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-areia px-6 py-14 text-center text-carvao">
          <p className="text-lg font-semibold">Ainda sem notas</p>
          <p className="mt-1 text-sm">Comece pelo briefing: contexto, o que foi combinado, acessos.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {notas.map((n) => (
            <li key={n.id}>
              <Link
                href={`/admin/tenants/${tenant.id}/notas/${n.id}`}
                className="flex h-full flex-col gap-2 rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao transition-colors hover:border-carvao"
              >
                <p className="flex items-center gap-2 font-display text-lg font-bold">
                  {n.fixada && <Pin className="size-4 marca" aria-label="Fixada" />}
                  {n.titulo}
                </p>
                <p className="line-clamp-3 text-sm text-carvao">{excerto(n.conteudo) || 'Sem conteúdo.'}</p>
                <p className="mt-auto text-xs text-cinza">
                  {n.autor_nome ?? 'Equipa'} · {quando(n.atualizado_em)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
