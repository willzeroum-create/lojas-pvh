import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirConsole } from '@/lib/auth/guardas'
import { obterTenant } from '@/lib/dados/tenants'
import { Importador } from './importador'

export const metadata: Metadata = { title: 'Importar cardápio' }

export default async function PaginaImportar(props: PageProps<'/admin/tenants/[id]/importar'>) {
  const { id } = await props.params
  const { supabase } = await exigirConsole()
  const tenant = await obterTenant(supabase, id)
  if (!tenant) notFound()

  return (
    <div className="max-w-4xl">
      <Link
        href={`/admin/tenants/${tenant.id}`}
        className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
      >
        ← {tenant.nome_fantasia}
      </Link>
      <h1 className="mt-1 text-2xl font-bold">Importar cardápio</h1>
      <p className="mt-1 text-sm text-cinza">
        Foto do cardápio de papel ou planilha (CSV/XLSX). Reveja a tabela antes de gravar: nada entra sem
        passar pelos seus olhos.
      </p>
      <Importador tenantId={tenant.id} fotoDisponivel={Boolean(process.env.ANTHROPIC_API_KEY)} />
    </div>
  )
}
