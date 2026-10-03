import 'server-only'

import { distribuirPagamentos, type PagamentoVenda } from '@/lib/dominio/pdv'
import type { Cliente } from '@/lib/supabase/server'
import type { ComandaLinha, EstadoPreparo } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'

const mensagemBase = (m: string) => m.charAt(0).toUpperCase() + m.slice(1) + '.'

export type MesaMapa = {
  id: string
  numero: number
  area: string | null
  lugares: number
  ativa: boolean
  estado: 'livre' | 'ocupada' | 'conta'
  comanda: { id: string; pessoas: number; total: number; abertaEm: string; garcom: string | null } | null
}

/** O mapa de mesas: livre, ocupada ou a pedir a conta, com o total de cada uma. */
export async function mapaDeMesas(supabase: Cliente, tenantId: string, lojaId: string): Promise<MesaMapa[]> {
  const [mesas, abertas] = await Promise.all([
    supabase.from('mesas').select('id, numero, area, lugares, ativa').eq('tenant_id', tenantId).eq('loja_id', lojaId).order('numero'),
    supabase
      .from('comandas')
      .select('id, mesa_id, pessoas, estado, aberta_em, garcom_nome, pedidos(total)')
      .eq('tenant_id', tenantId)
      .in('estado', ['aberta', 'conta']),
  ])
  const porMesa = new Map(
    ouErro(abertas, 'Não foi possível ler as comandas')
      .filter((c) => c.mesa_id)
      .map((c) => [c.mesa_id!, c]),
  )
  return ouErro(mesas, 'Não foi possível ler as mesas').map((m) => {
    const c = porMesa.get(m.id)
    return {
      ...m,
      estado: !c ? 'livre' : c.estado === 'conta' ? 'conta' : 'ocupada',
      comanda: c
        ? {
            id: c.id,
            pessoas: c.pessoas,
            total: Number((c.pedidos as unknown as { total: number } | null)?.total ?? 0),
            abertaEm: c.aberta_em,
            garcom: c.garcom_nome,
          }
        : null,
    }
  })
}

/** Comandas individuais (sem mesa) abertas: cartão, pulseira, balcão. */
export async function comandasAvulsas(supabase: Cliente, tenantId: string) {
  return ouErro(
    await supabase
      .from('comandas')
      .select('id, identificador, pessoas, estado, aberta_em, pedidos(total)')
      .eq('tenant_id', tenantId)
      .is('mesa_id', null)
      .in('estado', ['aberta', 'conta'])
      .order('aberta_em'),
    'Não foi possível ler as comandas',
  ).map((c) => ({ ...c, total: Number((c.pedidos as unknown as { total: number } | null)?.total ?? 0) }))
}

export async function salvarMesa(
  supabase: Cliente,
  tenantId: string,
  lojaId: string,
  d: { id?: string; numero: number; area?: string; lugares: number; ativa: boolean },
): Promise<void> {
  const linha = { tenant_id: tenantId, loja_id: lojaId, numero: d.numero, area: d.area ?? null, lugares: d.lugares, ativa: d.ativa }
  const r = d.id
    ? await supabase.from('mesas').update(linha).eq('tenant_id', tenantId).eq('id', d.id)
    : await supabase.from('mesas').insert(linha)
  if (r.error?.code === '23505') throw new ErroDados(`Já existe a mesa ${d.numero}.`)
  garantir(r, 'Não foi possível guardar a mesa')
}

export async function abrirComanda(
  supabase: Cliente,
  tenantId: string,
  lojaId: string,
  d: { mesaId?: string; identificador?: string; pessoas: number },
  garcom: string,
): Promise<string> {
  const r = await supabase.rpc('abrir_comanda', {
    p_tenant: tenantId,
    p_loja: lojaId,
    p_mesa: d.mesaId ?? null,
    p_identificador: d.identificador ?? null,
    p_pessoas: d.pessoas,
    p_garcom: garcom,
  })
  if (r.error?.code === '23505') throw new ErroDados('Esta mesa já tem uma comanda aberta.')
  if (r.error?.code === '23514') throw new ErroDados('Informe a mesa ou o número da comanda.')
  return ouErro(r, 'Não foi possível abrir a comanda').id
}

export type ItemComanda = {
  id: string
  nome: string
  quantidade: number
  precoUnitario: number
  total: number
  observacao: string | null
  preparo: EstadoPreparo | null
  canceladoMotivo: string | null
  criadoEm: string
}

export type DetalheComanda = ComandaLinha & {
  mesa: { numero: number } | null
  pedido: { id: string; numero: number | null; subtotal: number; desconto: number; taxaServico: number; total: number }
  itens: ItemComanda[]
}

export async function obterComanda(supabase: Cliente, tenantId: string, id: string): Promise<DetalheComanda | null> {
  const { data: c } = await supabase
    .from('comandas')
    .select('*, mesas(numero), pedidos(id, numero, subtotal, desconto, taxa_servico, total)')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .maybeSingle()
  if (!c) return null
  const itens = ouErro(
    await supabase
      .from('itens_pedido')
      .select('id, nome, quantidade, preco_unitario, total, observacao, preparo, cancelado_motivo, criado_em')
      .eq('pedido_id', c.pedido_id)
      .order('criado_em'),
    'Não foi possível ler os itens',
  )
  const { mesas, pedidos, ...comanda } = c
  const p = pedidos as unknown as { id: string; numero: number | null; subtotal: number; desconto: number; taxa_servico: number; total: number }
  return {
    ...comanda,
    mesa: (mesas as unknown as { numero: number } | null) ?? null,
    pedido: {
      id: p.id,
      numero: p.numero,
      subtotal: Number(p.subtotal),
      desconto: Number(p.desconto),
      taxaServico: Number(p.taxa_servico),
      total: Number(p.total),
    },
    itens: itens.map((i) => ({
      id: i.id,
      nome: i.nome,
      quantidade: Number(i.quantidade),
      precoUnitario: Number(i.preco_unitario),
      total: Number(i.total),
      observacao: i.observacao,
      preparo: i.preparo,
      canceladoMotivo: i.cancelado_motivo,
      criadoEm: i.criado_em,
    })),
  }
}

/** Lança itens na comanda com o preço do catálogo; os de cozinha seguem logo para a estação. */
export async function lancarItens(
  supabase: Cliente,
  tenantId: string,
  comandaId: string,
  itens: Array<{ produtoId: string; quantidade: number; observacao?: string }>,
): Promise<void> {
  const { data: c } = await supabase.from('comandas').select('pedido_id, estado').eq('tenant_id', tenantId).eq('id', comandaId).maybeSingle()
  if (!c) throw new ErroDados('Comanda não encontrada.')
  if (c.estado !== 'aberta' && c.estado !== 'conta') throw new ErroDados('A comanda já foi fechada.')

  const produtos = ouErro(
    await supabase
      .from('produtos')
      .select('id, nome, preco, preco_promocional, disponivel, vendido_por_peso')
      .eq('tenant_id', tenantId)
      .in('id', [...new Set(itens.map((i) => i.produtoId))]),
    'Não foi possível ler os produtos',
  )
  const porId = new Map(produtos.map((p) => [p.id, p]))
  const linhas = itens.map((i) => {
    const p = porId.get(i.produtoId)
    if (!p) throw new ErroDados('Um dos produtos já não existe.')
    if (!p.disponivel) throw new ErroDados(`${p.nome} está indisponível.`)
    if (!p.vendido_por_peso && !Number.isInteger(i.quantidade)) throw new ErroDados(`${p.nome} vende-se por unidade.`)
    const preco = Number(p.preco_promocional ?? p.preco)
    return {
      tenant_id: tenantId,
      pedido_id: c.pedido_id,
      produto_id: p.id,
      nome: p.nome,
      quantidade: i.quantidade,
      preco_unitario: preco,
      total: Math.round(i.quantidade * preco * 100) / 100,
      observacao: i.observacao ?? null,
    }
  })
  const r = await supabase.from('itens_pedido').insert(linhas)
  if (r.error?.code === '23514') throw new ErroDados(mensagemBase(r.error.message))
  garantir(r, 'Não foi possível lançar os itens')
  if (c.estado === 'conta') await mudarEstadoComanda(supabase, tenantId, comandaId, 'aberta')
}

/** Item ainda não preparado e sem cozinha: sai da comanda. Os outros cancelam-se com motivo (ver cozinha). */
export async function removerItem(supabase: Cliente, tenantId: string, itemId: string): Promise<void> {
  const r = await supabase.from('itens_pedido').delete().eq('tenant_id', tenantId).eq('id', itemId)
  if (r.error?.code === '23514') throw new ErroDados(mensagemBase(r.error.message))
  garantir(r, 'Não foi possível remover o item')
}

export async function mudarEstadoComanda(
  supabase: Cliente,
  tenantId: string,
  comandaId: string,
  estado: 'aberta' | 'conta' | 'cancelada',
): Promise<void> {
  const r = await supabase.from('comandas').update({ estado }).eq('tenant_id', tenantId).eq('id', comandaId)
  if (r.error?.code === '23514') throw new ErroDados(mensagemBase(r.error.message))
  garantir(r, 'Não foi possível actualizar a comanda')
}

export async function transferirMesa(supabase: Cliente, tenantId: string, comandaId: string, mesaId: string): Promise<void> {
  const r = await supabase.from('comandas').update({ mesa_id: mesaId }).eq('tenant_id', tenantId).eq('id', comandaId)
  if (r.error?.code === '23505') throw new ErroDados('A mesa de destino já está ocupada. Use "juntar mesas".')
  garantir(r, 'Não foi possível transferir')
}

export async function juntarComandas(supabase: Cliente, tenantId: string, destinoId: string, origemId: string): Promise<void> {
  const r = await supabase.rpc('juntar_comandas', { p_tenant: tenantId, p_destino: destinoId, p_origem: origemId })
  if (r.error?.code === '23514') throw new ErroDados(mensagemBase(r.error.message))
  garantir(r, 'Não foi possível juntar as comandas')
}

/**
 * Fecha a conta: taxa de serviço e desconto opcionais, pagamento dividido em
 * várias formas, troco do dinheiro. Exige o caixa aberto e a cozinha concluída.
 */
export async function fecharComanda(
  supabase: Cliente,
  tenantId: string,
  comandaId: string,
  d: { taxaServico: number; desconto: number; pagamentos: PagamentoVenda[] },
  autor: string,
): Promise<{ total: number; troco: number }> {
  const comanda = await obterComanda(supabase, tenantId, comandaId)
  if (!comanda) throw new ErroDados('Comanda não encontrada.')
  const total = Math.round((Math.max(comanda.pedido.subtotal - d.desconto, 0) + d.taxaServico) * 100) / 100
  const pagos = distribuirPagamentos(total, d.pagamentos)
  if (!pagos.ok) throw new ErroDados(pagos.falta ? `${pagos.erro} Faltam R$ ${pagos.falta.toFixed(2).replace('.', ',')}.` : pagos.erro)

  const r = await supabase.rpc('fechar_comanda', {
    p: {
      tenant_id: tenantId,
      comanda_id: comandaId,
      taxa_servico: d.taxaServico,
      desconto: d.desconto,
      autor_nome: autor,
      pagamentos: pagos.valor.pagamentos.map((p) => ({ forma: p.forma, valor: p.valor, troco: p.troco })),
    },
  })
  if (r.error?.code === '23514' || r.error?.code === 'P0002') throw new ErroDados(mensagemBase(r.error.message))
  garantir(r, 'Não foi possível fechar a conta')
  return { total, troco: pagos.valor.troco }
}
