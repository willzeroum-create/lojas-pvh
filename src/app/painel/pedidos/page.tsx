import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { listarPedidosDoDia } from '@/lib/dados/pedidos'
import { ListaPedidos } from './_components/lista-pedidos'

export const metadata: Metadata = { title: 'Pedidos' }

export default async function PaginaPedidos() {
  const { supabase, tenantId } = await exigirModulo('pedidos')
  const [pedidos, loja] = await Promise.all([
    listarPedidosDoDia(supabase, tenantId),
    obterLojaPrincipal(supabase, tenantId),
  ])

  return (
    <div className="mx-auto max-w-3xl">
      <ListaPedidos inicial={pedidos} tenantId={tenantId} fuso={loja?.fuso_horario ?? 'America/Sao_Paulo'} />
    </div>
  )
}
