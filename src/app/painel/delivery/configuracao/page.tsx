import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarEntregadores, listarZonas } from '@/lib/dados/delivery'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { ConfigDelivery } from '../_components/config-delivery'

export const metadata: Metadata = { title: 'Bairros e entregadores' }

export default async function PaginaConfigDelivery() {
  const ctx = await exigirModulo('delivery')
  if (!donoOuGerente(ctx.equipe)) notFound()
  const [zonas, entregadores] = await Promise.all([listarZonas(ctx.supabase, ctx.tenantId), listarEntregadores(ctx.supabase, ctx.tenantId)])
  return <ConfigDelivery zonas={zonas} entregadores={entregadores} nomeLoja={ctx.tenant.nome_fantasia} />
}
