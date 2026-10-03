import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirConsole } from '@/lib/auth/guardas'
import { resumirCadeia } from '@/lib/cadeia/progresso'
import { listarRegistos, obterCadeia } from '@/lib/dados/cadeia'
import { obterTenant } from '@/lib/dados/tenants'
import { CadeiaEditor } from './cadeia-editor'
import { Historico } from './historico'

export const metadata: Metadata = { title: 'Cadeia de produção' }

/**
 * A cadeia de produção da empresa: o diagnóstico ("já tem?") e a execução,
 * frente a frente, com notas, prazos e histórico. Abrir esta página garante
 * que a empresa tem todas as etapas do modelo actual.
 */
export default async function PaginaCadeia(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const { supabase } = await exigirConsole()
  const tenant = await obterTenant(supabase, id)
  if (!tenant) notFound()

  const [frentes, registos] = await Promise.all([obterCadeia(supabase, id), listarRegistos(supabase, id)])
  const total = resumirCadeia(frentes)

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={`/admin/tenants/${tenant.id}`}
            className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
          >
            ← {tenant.nome_fantasia}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">Cadeia de produção</h1>
          <p className="text-sm text-cinza">
            {total.atendidas} de {total.total} etapas atendidas · {total.abertas} em aberto ·{' '}
            {total.total - total.avaliadas} por avaliar
          </p>
        </div>
        <Link
          href={`/admin/tenants/${tenant.id}/notas`}
          className="inline-flex h-10 items-center rounded-lg border border-areia bg-branco px-3.5 text-sm font-semibold hover:bg-papel-2"
        >
          Notas internas
        </Link>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <CadeiaEditor tenantId={tenant.id} frentesIniciais={frentes} />
        <Historico registos={registos} />
      </div>
    </div>
  )
}
