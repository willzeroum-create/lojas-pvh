import 'server-only'

import { curvaAbc, limitesUtc, relatorioVendas, type ItemRelatorio, type LinhaAbc, type RelatorioVendas, type VendaRelatorio } from '@/lib/dominio/relatorios'
import type { Cliente } from '@/lib/supabase/server'
import { ErroDados } from './erros'

const LOTE = 1000
const MAX_VENDAS = 20_000

export type LinhaVenda = {
  id: string
  numero: number | null
  criado_em: string
  canal: string
  total: number
  desconto: number
  taxa_entrega: number
  forma_pagamento: string
  cliente_nome: string | null
  pagamentos_pedido: Array<{ forma: string; valor: number; troco: number }>
  itens_pedido: Array<{ produto_id: string | null; nome: string; quantidade: number; total: number; preparo: string | null }>
}

/** Vendas concluídas de [de, ate] (dias locais), com pagamentos e itens. Lê em lotes. */
export async function lerVendas(supabase: Cliente, tenantId: string, de: string, ate: string): Promise<LinhaVenda[]> {
  const { desde, antes } = limitesUtc(de, ate)
  const linhas: LinhaVenda[] = []
  for (let inicio = 0; inicio < MAX_VENDAS; inicio += LOTE) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(
        'id, numero, criado_em, canal, total, desconto, taxa_entrega, forma_pagamento, cliente_nome, pagamentos_pedido(forma, valor, troco), itens_pedido(produto_id, nome, quantidade, total, preparo)',
      )
      .eq('tenant_id', tenantId)
      .eq('status', 'concluido')
      .gte('criado_em', desde)
      .lt('criado_em', antes)
      .order('criado_em')
      .range(inicio, inicio + LOTE - 1)
    if (error) throw new ErroDados('Não foi possível ler as vendas.')
    linhas.push(...(data as unknown as LinhaVenda[]))
    if (!data || data.length < LOTE) break
  }
  return linhas
}

const paraVenda = (l: LinhaVenda): VendaRelatorio => ({
  id: l.id,
  criadoEm: l.criado_em,
  canal: l.canal,
  total: Number(l.total),
  desconto: Number(l.desconto),
  taxaEntrega: Number(l.taxa_entrega),
  pagamentos: (l.pagamentos_pedido ?? []).map((p) => ({ forma: p.forma, valor: Number(p.valor) - Number(p.troco) })),
  formaPedido: l.forma_pagamento,
})

const itensDe = (linhas: LinhaVenda[]): ItemRelatorio[] =>
  linhas.flatMap((l) =>
    (l.itens_pedido ?? [])
      .filter((i) => i.preparo !== 'cancelado')
      .map((i) => ({ produtoId: i.produto_id, nome: i.nome, quantidade: Number(i.quantidade), total: Number(i.total) })),
  )

export type RelatorioDoPeriodo = {
  de: string
  ate: string
  vendas: RelatorioVendas
  produtos: LinhaAbc[]
  /** O mesmo número de dias logo antes, para comparar. */
  anterior: { de: string; ate: string; faturamento: number; vendas: number; ticketMedio: number }
}

export async function relatorioDoPeriodo(supabase: Cliente, tenantId: string, de: string, ate: string): Promise<RelatorioDoPeriodo> {
  const dias = Math.round((Date.parse(ate) - Date.parse(de)) / 86_400_000) + 1
  const antAte = new Date(Date.parse(de) - 86_400_000).toISOString().slice(0, 10)
  const antDe = new Date(Date.parse(de) - dias * 86_400_000).toISOString().slice(0, 10)
  const [atual, anterior] = await Promise.all([lerVendas(supabase, tenantId, de, ate), lerVendas(supabase, tenantId, antDe, antAte)])
  const ant = relatorioVendas(anterior.map(paraVenda))
  return {
    de,
    ate,
    vendas: relatorioVendas(atual.map(paraVenda)),
    produtos: curvaAbc(itensDe(atual)),
    anterior: { de: antDe, ate: antAte, faturamento: ant.faturamento, vendas: ant.vendas, ticketMedio: ant.ticketMedio },
  }
}

/** Para a exportação: as vendas linha a linha e os produtos da curva ABC. */
export async function dadosParaExportar(supabase: Cliente, tenantId: string, de: string, ate: string) {
  const linhas = await lerVendas(supabase, tenantId, de, ate)
  return { vendas: linhas, produtos: curvaAbc(itensDe(linhas)) }
}
