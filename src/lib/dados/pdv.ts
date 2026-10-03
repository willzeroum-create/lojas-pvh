import 'server-only'

import { calcularVenda, type FormaRecebimento, type PagamentoVenda } from '@/lib/dominio/pdv'
import type { Cliente } from '@/lib/supabase/server'
import { ErroDados, garantir, ouErro } from './erros'

export type ProdutoPdv = {
  id: string
  nome: string
  categoria: string
  preco: number
  codigoBarras: string | null
  sku: string | null
  vendidoPorPeso: boolean
  fotoUrl: string | null
}

/** Produtos disponíveis para o balcão, com o preço em vigor (promocional quando houver). */
export async function produtosDoPdv(supabase: Cliente, tenantId: string): Promise<ProdutoPdv[]> {
  const linhas = ouErro(
    await supabase
      .from('produtos')
      .select('id, nome, preco, preco_promocional, codigo_barras, sku, vendido_por_peso, foto_url, categorias(nome, ordem)')
      .eq('tenant_id', tenantId)
      .eq('disponivel', true)
      .order('nome'),
    'Não foi possível ler os produtos',
  )
  return linhas.map((p) => ({
    id: p.id,
    nome: p.nome,
    categoria: (p.categorias as unknown as { nome: string } | null)?.nome ?? '',
    preco: Number(p.preco_promocional ?? p.preco),
    codigoBarras: p.codigo_barras,
    sku: p.sku,
    vendidoPorPeso: p.vendido_por_peso,
    fotoUrl: p.foto_url,
  }))
}

export type EntradaVenda = {
  lojaId: string
  itens: Array<{ produtoId: string; quantidade: number; desconto?: number; observacao?: string }>
  descontoGeral: number
  /** Cashback usado: soma-se ao desconto e é conferido e lançado na mesma transacção. */
  cashback?: number
  pagamentos: PagamentoVenda[]
  clienteId?: string
  clienteNome?: string
  observacoes?: string
}

export type VendaRegistada = { pedidoId: string; numero: number; total: number; troco: number }

/**
 * Regista a venda de balcão. Os preços vêm sempre do catálogo (o browser só
 * manda ids, quantidades e descontos); as contas são refeitas aqui e a
 * gravação é atómica na base, que confere o caixa aberto e a soma.
 */
export async function registarVendaBalcao(
  supabase: Cliente,
  tenantId: string,
  entrada: EntradaVenda,
  autor: string,
): Promise<VendaRegistada> {
  const ids = [...new Set(entrada.itens.map((i) => i.produtoId))]
  const produtos = ouErro(
    await supabase.from('produtos').select('id, nome, preco, preco_promocional, disponivel, vendido_por_peso').eq('tenant_id', tenantId).in('id', ids),
    'Não foi possível ler os produtos',
  )
  const porId = new Map(produtos.map((p) => [p.id, p]))
  for (const i of entrada.itens) {
    const p = porId.get(i.produtoId)
    if (!p) throw new ErroDados('Um dos produtos já não existe. Recarregue o PDV.')
    if (!p.disponivel) throw new ErroDados(`${p.nome} está indisponível.`)
    if (!p.vendido_por_peso && !Number.isInteger(i.quantidade)) throw new ErroDados(`${p.nome} vende-se por unidade.`)
  }

  const calculo = calcularVenda(
    entrada.itens.map((i) => {
      const p = porId.get(i.produtoId)!
      return { produtoId: p.id, nome: p.nome, quantidade: i.quantidade, precoUnitario: Number(p.preco_promocional ?? p.preco), desconto: i.desconto }
    }),
    entrada.descontoGeral + (entrada.cashback ?? 0),
    entrada.pagamentos,
  )
  if (!calculo.ok) throw new ErroDados(calculo.falta ? `${calculo.erro} Faltam R$ ${calculo.falta.toFixed(2).replace('.', ',')}.` : calculo.erro)

  const cashback = entrada.cashback ?? 0
  if (cashback > 0 && !entrada.clienteId) throw new ErroDados('Identifique o cliente para usar o cashback.')
  const r = await supabase.rpc(cashback > 0 ? 'registar_venda_com_cashback' : 'registar_venda_balcao', {
    p: {
      tenant_id: tenantId,
      cashback,
      autor: autor,
      loja_id: entrada.lojaId,
      cliente_id: entrada.clienteId ?? null,
      cliente_nome: entrada.clienteNome ?? null,
      observacoes: entrada.observacoes ?? null,
      subtotal: calculo.subtotal,
      desconto: calculo.desconto,
      total: calculo.total,
      autor_nome: autor,
      itens: calculo.itens.map((i, k) => ({
        produto_id: i.produtoId,
        nome: i.nome,
        quantidade: i.quantidade,
        preco_unitario: i.precoUnitario,
        desconto: i.desconto,
        total: i.total,
        observacao: entrada.itens[k]?.observacao ?? null,
      })),
      pagamentos: calculo.pagamentos.map((p) => ({ forma: p.forma, valor: p.valor, troco: p.troco })),
    },
  })
  if (r.error?.code === '23514') throw new ErroDados(r.error.message.charAt(0).toUpperCase() + r.error.message.slice(1) + '.')
  const pedido = ouErro(r, 'Não foi possível registar a venda')
  return { pedidoId: pedido.id, numero: pedido.numero ?? 0, total: calculo.total, troco: calculo.troco }
}

export async function cancelarVendaBalcao(
  supabase: Cliente,
  tenantId: string,
  pedidoId: string,
  motivo: string,
  autor: string,
): Promise<void> {
  const r = await supabase.rpc('cancelar_venda_balcao', { p_tenant: tenantId, p_pedido: pedidoId, p_motivo: motivo, p_autor: autor })
  if (r.error?.code === '23514' || r.error?.code === 'P0002') throw new ErroDados(r.error.message.charAt(0).toUpperCase() + r.error.message.slice(1) + '.')
  garantir(r, 'Não foi possível cancelar a venda')
}

export type VendaDoCaixa = {
  id: string
  numero: number | null
  total: number
  status: string
  criadoEm: string
  formas: FormaRecebimento[]
  itens: number
}

/** Vendas de uma sessão de caixa, as mais recentes primeiro. */
export async function vendasDoCaixa(supabase: Cliente, tenantId: string, sessaoId: string): Promise<VendaDoCaixa[]> {
  const linhas = ouErro(
    await supabase
      .from('pedidos')
      .select('id, numero, total, status, criado_em, pagamentos_pedido(forma), itens_pedido(count)')
      .eq('tenant_id', tenantId)
      .eq('caixa_sessao_id', sessaoId)
      .order('criado_em', { ascending: false }),
    'Não foi possível ler as vendas',
  )
  return linhas.map((p) => ({
    id: p.id,
    numero: p.numero,
    total: Number(p.total),
    status: p.status,
    criadoEm: p.criado_em,
    formas: [...new Set((p.pagamentos_pedido as Array<{ forma: FormaRecebimento }>).map((x) => x.forma))],
    itens: (p.itens_pedido as unknown as Array<{ count: number }>)[0]?.count ?? 0,
  }))
}

/** Subtotal da venda pelos preços do catálogo, para conferir o limite de desconto antes de gravar. */
export async function subtotalDaVenda(
  supabase: Cliente,
  tenantId: string,
  itens: Array<{ produtoId: string; quantidade: number }>,
): Promise<number> {
  const precos = ouErro(
    await supabase.from('produtos').select('id, preco, preco_promocional').eq('tenant_id', tenantId).in('id', [...new Set(itens.map((i) => i.produtoId))]),
    'Não foi possível ler os preços',
  )
  const porId = new Map(precos.map((p) => [p.id, Number(p.preco_promocional ?? p.preco)]))
  return Math.round(itens.reduce((s, i) => s + i.quantidade * (porId.get(i.produtoId) ?? 0) * 100, 0)) / 100
}
