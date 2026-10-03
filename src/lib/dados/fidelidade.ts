import 'server-only'

import { CONFIG_CASHBACK_PADRAO, resgatePossivel, saldoCashback, type ConfigCashback, type MovimentoCashback } from '@/lib/dominio/fidelidade'
import { diaLocal } from '@/lib/dominio/ponto'
import { clienteAdmin, type Cliente } from '@/lib/supabase/server'
import type { FidelidadeMovimentoLinha } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'
import { modulosAtivos } from './modulos'

export async function obterConfigCashback(supabase: Cliente, tenantId: string): Promise<ConfigCashback> {
  const { data } = await supabase.from('fidelidade_config').select('*').eq('tenant_id', tenantId).maybeSingle()
  if (!data) return CONFIG_CASHBACK_PADRAO
  return {
    ativo: data.ativo,
    percentual: Number(data.percentual),
    validadeDias: data.validade_dias,
    resgateMinimo: Number(data.resgate_minimo),
    limiteResgatePct: Number(data.limite_resgate_pct),
  }
}

export async function salvarConfigCashback(supabase: Cliente, tenantId: string, c: ConfigCashback): Promise<void> {
  garantir(
    await supabase.from('fidelidade_config').upsert(
      {
        tenant_id: tenantId,
        ativo: c.ativo,
        percentual: c.percentual,
        validade_dias: c.validadeDias,
        resgate_minimo: c.resgateMinimo,
        limite_resgate_pct: c.limiteResgatePct,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'tenant_id' },
    ),
    'Não foi possível guardar o cashback',
  )
}

const paraMovimento = (l: Pick<FidelidadeMovimentoLinha, 'tipo' | 'valor' | 'criado_em' | 'expira_em' | 'pedido_id'>): MovimentoCashback =>
  l.tipo === 'credito' || l.tipo === 'devolucao'
    ? { tipo: l.tipo, valor: Number(l.valor), em: diaLocal(l.criado_em), expiraEm: l.expira_em!, pedidoId: l.pedido_id }
    : { tipo: l.tipo, valor: Number(l.valor), em: diaLocal(l.criado_em), pedidoId: l.pedido_id }

export type ExtratoCashback = {
  pessoa: { id: string; nome: string }
  saldo: number
  aVencer30: number
  proximoVencimento: string | null
  movimentos: Array<{
    id: string
    tipo: FidelidadeMovimentoLinha['tipo']
    valor: number
    criadoEm: string
    expiraEm: string | null
    pedidoId: string | null
    autor: string | null
    motivo: string | null
  }>
}

/** Extrato do cliente, do mais recente para o mais antigo, e o saldo de hoje. */
export async function extratoCashback(supabase: Cliente, tenantId: string, pessoaId: string): Promise<ExtratoCashback | null> {
  const [{ data: pessoa }, movimentos] = await Promise.all([
    supabase.from('pessoas').select('id, nome').eq('tenant_id', tenantId).eq('id', pessoaId).maybeSingle(),
    supabase.from('fidelidade_movimentos').select('*').eq('tenant_id', tenantId).eq('pessoa_id', pessoaId).order('criado_em', { ascending: false }).limit(500),
  ])
  if (!pessoa) return null
  const linhas = ouErro(movimentos, 'Não foi possível ler o cashback')
  const s = saldoCashback(linhas.map(paraMovimento), diaLocal(new Date()))
  return {
    pessoa,
    ...s,
    movimentos: linhas.map((l) => ({
      id: l.id,
      tipo: l.tipo,
      valor: Number(l.valor),
      criadoEm: l.criado_em,
      expiraEm: l.expira_em,
      pedidoId: l.pedido_id,
      autor: l.autor,
      motivo: l.motivo,
    })),
  }
}

/** Para o PDV: saldo do cliente e quanto pode usar numa compra deste valor. */
export async function cashbackParaVenda(
  supabase: Cliente,
  tenantId: string,
  pessoaId: string,
  totalCompra: number,
): Promise<{ ativo: boolean; saldo: number; maximo: number; minimo: number; limitePct: number }> {
  const [cfg, ativos] = await Promise.all([obterConfigCashback(supabase, tenantId), modulosAtivos(supabase, tenantId)])
  if (!cfg.ativo || !ativos.has('fidelidade')) return { ativo: false, saldo: 0, maximo: 0, minimo: 0, limitePct: 0 }
  const r = await supabase.rpc('saldo_cashback', { p_tenant: tenantId, p_pessoa: pessoaId })
  const saldo = Number(ouErro(r, 'Não foi possível ler o saldo de cashback'))
  return { ativo: true, saldo, maximo: resgatePossivel(cfg, saldo, totalCompra), minimo: cfg.resgateMinimo, limitePct: cfg.limiteResgatePct }
}

/** Ajuste manual (bónus ou correcção), com motivo; a aprovação fica na auditoria. */
export async function ajustarCashback(supabase: Cliente, tenantId: string, pessoaId: string, valor: number, motivo: string, autor: string): Promise<void> {
  if (valor === 0) throw new ErroDados('Informe um valor diferente de zero.')
  const { data: p } = await supabase.from('pessoas').select('id').eq('tenant_id', tenantId).eq('id', pessoaId).maybeSingle()
  if (!p) throw new ErroDados('Cliente não encontrado.')
  garantir(
    await clienteAdmin().from('fidelidade_movimentos').insert({ tenant_id: tenantId, pessoa_id: pessoaId, tipo: 'ajuste', valor, motivo, autor }),
    'Não foi possível ajustar o cashback',
  )
}

export type ClienteComCashback = { id: string; nome: string; saldo: number; aVencer30: number; ultimaCompra: string | null }

/** Clientes com saldo, do maior para o menor (para o dono ver quem chamar de volta). */
export async function clientesComCashback(supabase: Cliente, tenantId: string, limite = 100): Promise<ClienteComCashback[]> {
  const linhas = ouErro(
    await supabase
      .from('fidelidade_movimentos')
      .select('pessoa_id, tipo, valor, criado_em, expira_em, pedido_id, pessoas(nome)')
      .eq('tenant_id', tenantId)
      .order('criado_em')
      .limit(20_000),
    'Não foi possível ler o cashback',
  )
  const hoje = diaLocal(new Date())
  const porPessoa = new Map<string, { nome: string; movs: MovimentoCashback[]; ultima: string | null }>()
  for (const l of linhas) {
    const atual = porPessoa.get(l.pessoa_id) ?? { nome: (l.pessoas as unknown as { nome: string } | null)?.nome ?? 'Cliente', movs: [], ultima: null }
    atual.movs.push(paraMovimento(l))
    if (l.tipo === 'credito') atual.ultima = l.criado_em
    porPessoa.set(l.pessoa_id, atual)
  }
  return [...porPessoa.entries()]
    .map(([id, x]) => ({ id, nome: x.nome, ...saldoCashback(x.movs, hoje), ultimaCompra: x.ultima }))
    .filter((c) => c.saldo > 0)
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, limite)
    .map(({ id, nome, saldo, aVencer30, ultimaCompra }) => ({ id, nome, saldo, aVencer30, ultimaCompra }))
}
