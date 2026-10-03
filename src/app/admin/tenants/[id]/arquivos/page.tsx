import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirConsole } from '@/lib/auth/guardas'
import { listarArquivos, pastasDe } from '@/lib/dados/arquivos'
import { obterTenant } from '@/lib/dados/tenants'
import { cn } from '@/lib/utils/cn'
import { EnviadorArquivos } from './_components/enviador-arquivos'
import { GaleriaArquivos } from './_components/galeria-arquivos'

export const metadata: Metadata = { title: 'Arquivos' }

/**
 * A biblioteca viva da empresa: fotos, logo, cardápio de papel, documentos,
 * por pastas. Quem tem o console vê tudo, de qualquer lugar.
 */
export default async function PaginaArquivos(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ pasta?: string }>
}) {
  const [{ id }, { pasta }] = await Promise.all([props.params, props.searchParams])
  const { supabase } = await exigirConsole()
  const tenant = await obterTenant(supabase, id)
  if (!tenant) notFound()

  const todos = await listarArquivos(supabase, id)
  const pastas = pastasDe(todos)
  const pastaAtiva = pasta && pastas.some((p) => p.pasta === pasta) ? pasta : null
  const visiveis = pastaAtiva ? todos.filter((a) => a.pasta === pastaAtiva) : todos

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={`/admin/tenants/${tenant.id}`}
            className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
          >
            ← {tenant.nome_fantasia}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Arquivos</h1>
          <p className="text-sm text-cinza">
            {todos.length} ficheiro{todos.length === 1 ? '' : 's'} em {pastas.length} pasta
            {pastas.length === 1 ? '' : 's'}. Fotos são reduzidas ao enviar; o resto vai como está, até 25 MB.
          </p>
        </div>
      </header>

      <EnviadorArquivos
        tenantId={tenant.id}
        pastasExistentes={pastas.map((p) => p.pasta)}
        pastaInicial={pastaAtiva ?? undefined}
      />

      {pastas.length > 0 && (
        <nav className="flex flex-wrap gap-1" aria-label="Pastas">
          <Link
            href={`/admin/tenants/${tenant.id}/arquivos`}
            className={cn(
              'h-10 shrink-0 rounded-full px-3.5 text-sm leading-10 font-semibold',
              pastaAtiva === null ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3',
            )}
          >
            Tudo · {todos.length}
          </Link>
          {pastas.map((p) => (
            <Link
              key={p.pasta}
              href={`/admin/tenants/${tenant.id}/arquivos?pasta=${encodeURIComponent(p.pasta)}`}
              className={cn(
                'h-10 shrink-0 rounded-full px-3.5 text-sm leading-10 font-semibold',
                pastaAtiva === p.pasta ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3',
              )}
            >
              {p.pasta} · {p.total}
            </Link>
          ))}
        </nav>
      )}

      <GaleriaArquivos tenantId={tenant.id} arquivos={visiveis} />
    </div>
  )
}
