import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { pessoasNoRelogio } from '@/lib/dados/ponto'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { RelogioPonto } from './_components/relogio'

export const metadata: Metadata = { title: 'Relógio de ponto' }

export default async function PaginaPonto() {
  const ctx = await exigirModulo('ponto')
  const pessoas = await pessoasNoRelogio(ctx.supabase, ctx.tenantId)
  return <RelogioPonto pessoasIniciais={pessoas} gestao={donoOuGerente(ctx.equipe)} agoraInicial={new Date().toISOString()} empresa={ctx.tenant.nome_fantasia} />
}
