import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarEntregadores, quadroDeEntregas } from '@/lib/dados/delivery'
import { urlBase } from '@/lib/config/marca'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { QuadroEntregas } from './_components/quadro-entregas'

export const metadata: Metadata = { title: 'Entregas' }

export default async function PaginaDelivery() {
  const ctx = await exigirModulo('delivery')
  const [entregas, entregadores] = await Promise.all([quadroDeEntregas(ctx.supabase, ctx.tenantId), listarEntregadores(ctx.supabase, ctx.tenantId)])
  return (
    <QuadroEntregas
      entregasIniciais={entregas}
      entregadores={entregadores.filter((e) => e.ativo).map((e) => ({ id: e.id, nome: e.nome }))}
      podeGerir={donoOuGerente(ctx.equipe)}
      nomeLoja={ctx.tenant.nome_fantasia}
      base={urlBase()}
    />
  )
}
