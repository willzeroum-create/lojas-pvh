import { exigirConsole } from '@/lib/auth/guardas'
import { exportarTenant } from '@/lib/dados/tenants'
import { clienteAdmin } from '@/lib/supabase/server'
import { uuid } from '@/lib/validacao/zod'

/** Exportação completa dos dados do tenant em JSON (brief §9). Só operadores. */
export async function GET(_request: Request, contexto: RouteContext<'/admin/tenants/[id]/exportar'>) {
  await exigirConsole()
  const { id } = await contexto.params
  const dados = await exportarTenant(clienteAdmin(), uuid.parse(id))
  const nome = `${dados.tenant?.slug ?? 'tenant'}-${new Date().toISOString().slice(0, 10)}.json`
  return new Response(JSON.stringify(dados, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nome}"`,
      'Cache-Control': 'no-store',
    },
  })
}
