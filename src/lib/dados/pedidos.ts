import type { ItemCalculado } from '@/lib/dominio/carrinho'
import type { Endereco } from '@/lib/dominio/endereco'
import { podeTransitar, STATUS_ABERTOS, type StatusPedido } from '@/lib/dominio/pedido'
import type { PedidoParaResumo } from '@/lib/dominio/resumo'
import type { Cliente } from '@/lib/supabase/server'
import type { ItemPedidoLinha, Json, PedidoLinha } from '@/lib/supabase/tipos'
import type { NovoPedido } from '@/lib/validacao/pedido'
import { ErroDados, garantir, ouErro } from './erros'

export type PedidoComItens = PedidoLinha & { itens_pedido: ItemPedidoLinha[] }

/**
 * O ecrã "Pedidos do dia": tudo o que ainda está aberto, mais o que foi
 * fechado nas últimas 24 horas, do mais recente para o mais antigo.
 */
export async function listarPedidosDoDia(supabase: Cliente, tenantId: string): Promise<PedidoComItens[]> {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const abertos = STATUS_ABERTOS.map((s) => `status.eq.${s}`).join(',')
  return ouErro(
    await supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .eq('tenant_id', tenantId)
      .or(`${abertos},criado_em.gte.${desde}`)
      .order('criado_em', { ascending: false })
      .limit(200),
    'Não foi possível listar os pedidos',
  )
}

export async function obterPedidoComItens(
  supabase: Cliente,
  tenantId: string,
  pedidoId: string,
): Promise<PedidoComItens | null> {
  const { data } = await supabase
    .from('pedidos')
    .select('*, itens_pedido(*)')
    .eq('tenant_id', tenantId)
    .eq('id', pedidoId)
    .maybeSingle()
  return data
}

/** Os últimos sete dias, no formato que `calcularResumo` consome. */
export async function listarPedidosDaSemana(
  supabase: Cliente,
  tenantId: string,
): Promise<PedidoParaResumo[]> {
  const desde = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  const linhas = ouErro(
    await supabase
      .from('pedidos')
      .select('criado_em, total, status, itens_pedido(produto_id, nome, quantidade)')
      .eq('tenant_id', tenantId)
      .gte('criado_em', desde),
    'Não foi possível ler os pedidos da semana',
  )
  return linhas.map((p) => ({
    criado_em: p.criado_em,
    total: Number(p.total),
    status: p.status,
    itens: p.itens_pedido,
  }))
}

/** Muda o estado respeitando o ciclo de vida. Lê o estado actual primeiro para nunca saltar passos. */
export async function atualizarStatusPedido(
  supabase: Cliente,
  tenantId: string,
  pedidoId: string,
  novo: StatusPedido,
): Promise<void> {
  const { data: atual, error } = await supabase
    .from('pedidos')
    .select('status')
    .eq('tenant_id', tenantId)
    .eq('id', pedidoId)
    .maybeSingle()
  if (error) throw new ErroDados(`Não foi possível ler o pedido: ${error.message}`, error)
  if (!atual) throw new ErroDados('Pedido não encontrado')
  if (!podeTransitar(atual.status, novo))
    throw new ErroDados(`Um pedido "${atual.status}" não pode passar a "${novo}"`)
  garantir(
    await supabase
      .from('pedidos')
      .update({ status: novo })
      .eq('tenant_id', tenantId)
      .eq('id', pedidoId)
      .eq('status', atual.status),
    'Não foi possível actualizar o pedido',
  )
}

export type PedidoCalculado = {
  itens: ItemCalculado[]
  subtotal: number
  taxaEntrega: number
  total: number
}

/** Chamado só pelo servidor com o cliente admin, depois de validar e recalcular tudo. Atómico via `criar_pedido`. */
export async function registarPedido(
  admin: Cliente,
  dados: NovoPedido,
  calculado: PedidoCalculado,
): Promise<PedidoLinha> {
  const endereco: Endereco | null = dados.tipoEntrega === 'entrega' ? (dados.endereco ?? null) : null
  const carga = {
    tenant_id: dados.tenantId,
    loja_id: dados.lojaId,
    canal: 'cardapio',
    cliente_nome: dados.clienteNome,
    cliente_telefone: dados.clienteTelefone,
    tipo_entrega: dados.tipoEntrega,
    endereco,
    observacoes: dados.observacoes ?? null,
    subtotal: calculado.subtotal,
    taxa_entrega: calculado.taxaEntrega,
    total: calculado.total,
    forma_pagamento: dados.formaPagamento,
    troco_para: dados.formaPagamento === 'dinheiro' ? (dados.trocoPara ?? null) : null,
    itens: calculado.itens.map((i) => ({
      produto_id: i.produtoId,
      nome: i.nome,
      quantidade: i.quantidade,
      preco_unitario: i.precoUnitario,
      opcoes: i.opcoes,
      observacao: i.observacao ?? null,
      total: i.total,
    })),
  }
  return ouErro(
    await admin.rpc('criar_pedido', { p: carga as unknown as Json }),
    'Não foi possível registar o pedido',
  )
}
