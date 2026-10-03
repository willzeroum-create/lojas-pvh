import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirConsole } from '@/lib/auth/guardas'
import { obterNota } from '@/lib/dados/cadeia'
import { obterTenant } from '@/lib/dados/tenants'
import { EditorNota } from '../_components/editor-nota'

export const metadata: Metadata = { title: 'Nota' }

export default async function PaginaNota(props: { params: Promise<{ id: string; notaId: string }> }) {
  const { id, notaId } = await props.params
  const { supabase } = await exigirConsole()
  const tenant = await obterTenant(supabase, id)
  if (!tenant) notFound()

  const nota = notaId === 'nova' ? null : await obterNota(supabase, id, notaId)
  if (notaId !== 'nova' && !nota) notFound()

  return (
    <div className="flex max-w-6xl flex-col gap-4">
      <Link
        href={`/admin/tenants/${tenant.id}/notas`}
        className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
      >
        ← Notas de {tenant.nome_fantasia}
      </Link>
      <EditorNota tenantId={tenant.id} nota={nota} />
    </div>
  )
}
