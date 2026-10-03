import 'server-only'

/**
 * Listas transversais a todas as empresas, para o console: pedidos por
 * período e etapas em aberto. Lidas com o cliente do operador (RLS deixa
 * operadores verem tudo).
 */
import { lerDesde, pertenceAoPeriodo, type Periodo } from '@/lib/dominio/periodo'
import { arredondar } from '@/lib/dominio/moeda'
import type { Cliente } from '@/lib/supabase/server'
import type { CadeiaEtapaLinha, ItemPedidoLinha, PedidoLinha } from '@/lib/supabase/tipos'
import { ouErro } from './erros'

const FUSO_PADRAO = 'America/Sao_Paulo'

type Empresa = { nome_fantasia: string; slug: string } | null

export type PedidoHolding = PedidoLinha & {
  itens_pedido: Array<Pick<ItemPedidoLinha, 'nome' | 'quantidade'>>
  tenants: Empresa
}

export type GrupoPedidos = {
  tenantId: string
  nome: string
  slug: string
  pedidos: PedidoHolding[]
  faturacao: number
  abertos: number
}

export async function listarPedidosDaHolding(
  supabase: Cliente,
  periodo: Periodo,
  agora = new Date(),
  fuso = FUSO_PADRAO,
): Promise<{ grupos: GrupoPedidos[]; quantidade: number; faturacao: number }> {
  const linhas = ouErro(
    await supabase
      .from('pedidos')
      .select('*, itens_pedido(nome, quantidade), tenants(nome_fantasia, slug)')
      .gte('criado_em', lerDesde(periodo, agora).toISOString())
      .order('criado_em', { ascending: false }),
    'Não foi possível listar os pedidos',
  )
  const noPeriodo = linhas.filter((p) => pertenceAoPeriodo(p.criado_em, periodo, agora, fuso))

  const porTenant = new Map<string, GrupoPedidos>()
  for (const p of noPeriodo) {
    const grupo = porTenant.get(p.tenant_id) ?? {
      tenantId: p.tenant_id,
      nome: p.tenants?.nome_fantasia ?? 'Empresa',
      slug: p.tenants?.slug ?? '',
      pedidos: [],
      faturacao: 0,
      abertos: 0,
    }
    grupo.pedidos.push(p)
    if (p.status !== 'cancelado') grupo.faturacao = arredondar(grupo.faturacao + Number(p.total))
    if (p.status !== 'cancelado' && p.status !== 'concluido') grupo.abertos++
    porTenant.set(p.tenant_id, grupo)
  }
  const grupos = [...porTenant.values()].sort(
    (a, b) => b.faturacao - a.faturacao || a.nome.localeCompare(b.nome),
  )
  return {
    grupos,
    quantidade: noPeriodo.filter((p) => p.status !== 'cancelado').length,
    faturacao: arredondar(grupos.reduce((s, g) => s + g.faturacao, 0)),
  }
}

export type EtapaAberta = CadeiaEtapaLinha & { tenants: Empresa }

export type GrupoEtapas = {
  tenantId: string
  nome: string
  etapas: EtapaAberta[]
  porAvaliar: number
}

/** Tudo o que está pendente ou em curso, por empresa, com as etapas por avaliar contadas ao lado. */
export async function listarEtapasAbertas(supabase: Cliente): Promise<GrupoEtapas[]> {
  const [abertas, porAvaliar] = await Promise.all([
    supabase
      .from('cadeia_etapas')
      .select('*, tenants(nome_fantasia, slug)')
      .in('estado', ['pendente', 'em_curso'])
      .order('prevista_em', { ascending: true, nullsFirst: false })
      .order('frente')
      .order('ordem'),
    supabase
      .from('cadeia_etapas')
      .select('tenant_id, tenants(nome_fantasia, slug)')
      .eq('estado', 'nao_avaliado'),
  ])
  const lista = ouErro(abertas, 'Não foi possível listar as etapas')
  const semAvaliar = ouErro(porAvaliar, 'Não foi possível contar as etapas por avaliar')

  const grupos = new Map<string, GrupoEtapas>()
  const grupoDe = (tenantId: string, empresa: Empresa) => {
    const g = grupos.get(tenantId) ?? {
      tenantId,
      nome: empresa?.nome_fantasia ?? 'Empresa',
      etapas: [],
      porAvaliar: 0,
    }
    grupos.set(tenantId, g)
    return g
  }
  for (const e of lista) grupoDe(e.tenant_id, e.tenants).etapas.push(e)
  for (const e of semAvaliar) grupoDe(e.tenant_id, e.tenants).porAvaliar++

  return [...grupos.values()].sort(
    (a, b) => b.etapas.length - a.etapas.length || a.nome.localeCompare(b.nome),
  )
}
