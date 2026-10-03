import 'server-only'

/**
 * A vista de holding: o que se passa em todas as empresas de uma vez. Lê com
 * o cliente do operador (RLS deixa operadores verem tudo).
 */
import { estaAberta, estaAvaliada } from '@/lib/cadeia/estados'
import { arredondar } from '@/lib/dominio/moeda'
import { chaveDia } from '@/lib/dominio/resumo'
import type { Cliente } from '@/lib/supabase/server'
import type { TenantStatus } from '@/lib/supabase/tipos'
import { ouErro } from './erros'
import type { TenantLista } from './tenants'

export type VisaoGeral = {
  empresas: Record<TenantStatus, number>
  pedidosHoje: { total: number; faturacao: number; abertos: number }
  cadeia: { abertas: number; porAvaliar: number }
  renovacoes: Array<{ id: string; nome_fantasia: string; renovacao_em: string; atrasada: boolean }>
}

const FUSO_PADRAO = 'America/Sao_Paulo'

export async function obterVisaoGeral(
  supabase: Cliente,
  tenants: TenantLista[],
  agora = new Date(),
): Promise<VisaoGeral> {
  const empresas: Record<TenantStatus, number> = { onboarding: 0, ativo: 0, suspenso: 0, cancelado: 0 }
  for (const t of tenants) empresas[t.status]++

  const etapas = tenants.flatMap((t) => t.cadeia_etapas)
  const cadeia = {
    abertas: etapas.filter((e) => estaAberta(e.estado)).length,
    porAvaliar: etapas.filter((e) => !estaAvaliada(e.estado)).length,
  }

  // Pedidos das últimas 30 horas, filtrados depois pelo dia local: chega para "hoje" em qualquer fuso do Brasil.
  const desde = new Date(agora.getTime() - 30 * 60 * 60 * 1000).toISOString()
  const pedidos = ouErro(
    await supabase.from('pedidos').select('total, status, criado_em').gte('criado_em', desde),
    'Não foi possível ler os pedidos de hoje',
  )
  const hoje = chaveDia(agora, FUSO_PADRAO)
  const deHoje = pedidos.filter(
    (p) => p.status !== 'cancelado' && chaveDia(new Date(p.criado_em), FUSO_PADRAO) === hoje,
  )
  const pedidosHoje = {
    total: deHoje.length,
    faturacao: arredondar(deHoje.reduce((s, p) => s + Number(p.total), 0)),
    abertos: deHoje.filter((p) => p.status !== 'concluido').length,
  }

  const hojeIso = chaveDia(agora, FUSO_PADRAO)
  const limite = chaveDia(new Date(agora.getTime() + 15 * 24 * 60 * 60 * 1000), FUSO_PADRAO)
  const renovacoes = tenants
    .filter((t) => t.renovacao_em && t.status === 'ativo' && t.renovacao_em <= limite)
    .map((t) => ({
      id: t.id,
      nome_fantasia: t.nome_fantasia,
      renovacao_em: t.renovacao_em!,
      atrasada: t.renovacao_em! < hojeIso,
    }))
    .sort((a, b) => a.renovacao_em.localeCompare(b.renovacao_em))

  return { empresas, pedidosHoje, cadeia, renovacoes }
}
