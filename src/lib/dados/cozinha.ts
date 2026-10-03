import 'server-only'

import type { Cliente } from '@/lib/supabase/server'
import type { CanalPedido, EstadoPreparo } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'

export type Estacao = { id: string; nome: string; ordem: number; alertaMin: number; ativa: boolean; categorias: string[] }

export async function listarEstacoes(supabase: Cliente, tenantId: string): Promise<Estacao[]> {
  const [estacoes, mapa] = await Promise.all([
    supabase.from('estacoes').select('id, nome, ordem, alerta_min, ativa').eq('tenant_id', tenantId).order('ordem'),
    supabase.from('estacao_categorias').select('categoria_id, estacao_id').eq('tenant_id', tenantId),
  ])
  const porEstacao = new Map<string, string[]>()
  for (const m of ouErro(mapa, 'Não foi possível ler as estações')) {
    porEstacao.set(m.estacao_id, [...(porEstacao.get(m.estacao_id) ?? []), m.categoria_id])
  }
  return ouErro(estacoes, 'Não foi possível ler as estações').map((e) => ({
    id: e.id,
    nome: e.nome,
    ordem: e.ordem,
    alertaMin: e.alerta_min,
    ativa: e.ativa,
    categorias: porEstacao.get(e.id) ?? [],
  }))
}

export async function salvarEstacao(
  supabase: Cliente,
  tenantId: string,
  d: { id?: string; nome: string; ordem: number; alertaMin: number; ativa: boolean },
): Promise<string> {
  const linha = { tenant_id: tenantId, nome: d.nome, ordem: d.ordem, alerta_min: d.alertaMin, ativa: d.ativa }
  const r = d.id
    ? await supabase.from('estacoes').update(linha).eq('tenant_id', tenantId).eq('id', d.id).select('id').single()
    : await supabase.from('estacoes').insert(linha).select('id').single()
  if (r.error?.code === '23505') throw new ErroDados('Já existe uma estação com este nome.')
  return ouErro(r, 'Não foi possível guardar a estação').id
}

/** Liga a categoria a uma estação (ou tira-a da cozinha com `null`). Vale para os itens novos. */
export async function definirEstacaoDaCategoria(
  supabase: Cliente,
  tenantId: string,
  categoriaId: string,
  estacaoId: string | null,
): Promise<void> {
  if (estacaoId === null) {
    garantir(
      await supabase.from('estacao_categorias').delete().eq('tenant_id', tenantId).eq('categoria_id', categoriaId),
      'Não foi possível actualizar a categoria',
    )
    return
  }
  garantir(
    await supabase
      .from('estacao_categorias')
      .upsert({ tenant_id: tenantId, categoria_id: categoriaId, estacao_id: estacaoId }, { onConflict: 'categoria_id' }),
    'Não foi possível actualizar a categoria',
  )
}

export type ItemCozinha = {
  id: string
  nome: string
  quantidade: number
  opcoes: Array<{ grupo?: string; nome: string }>
  observacao: string | null
  preparo: EstadoPreparo
  estacaoId: string
  criadoEm: string
  iniciadoEm: string | null
  prontoEm: string | null
}

export type CartaoCozinha = {
  pedidoId: string
  numero: number | null
  canal: CanalPedido
  /** "Mesa 4", "Comanda A1", nome do cliente ou "Balcão". */
  rotulo: string
  tipoEntrega: 'entrega' | 'retirada'
  entrouEm: string
  itens: ItemCozinha[]
}

/**
 * A fila da cozinha: pedidos com itens à espera, em preparo ou prontos para
 * sair, por ordem de chegada. Filtra por estação quando pedido.
 */
export async function filaDaCozinha(supabase: Cliente, tenantId: string, estacaoId?: string): Promise<CartaoCozinha[]> {
  let consulta = supabase
    .from('itens_pedido')
    .select(
      'id, nome, quantidade, opcoes, observacao, preparo, estacao_id, criado_em, preparo_iniciado_em, pronto_em, pedidos!inner(id, numero, canal, cliente_nome, tipo_entrega, criado_em, status)',
    )
    .eq('tenant_id', tenantId)
    .in('preparo', ['aguardando', 'em_preparo', 'pronto'])
    .neq('pedidos.status', 'cancelado')
    .order('criado_em')
    .limit(400)
  if (estacaoId) consulta = consulta.eq('estacao_id', estacaoId)

  const linhas = ouErro(await consulta, 'Não foi possível ler a fila da cozinha')
  const cartoes = new Map<string, CartaoCozinha>()
  for (const l of linhas) {
    const p = l.pedidos as unknown as {
      id: string
      numero: number | null
      canal: CanalPedido
      cliente_nome: string | null
      tipo_entrega: 'entrega' | 'retirada'
      criado_em: string
    }
    let cartao = cartoes.get(p.id)
    if (!cartao) {
      cartao = {
        pedidoId: p.id,
        numero: p.numero,
        canal: p.canal,
        rotulo: p.cliente_nome ?? (p.canal === 'balcao' ? 'Balcão' : 'Pedido'),
        tipoEntrega: p.tipo_entrega,
        entrouEm: p.criado_em,
        itens: [],
      }
      cartoes.set(p.id, cartao)
    }
    cartao.itens.push({
      id: l.id,
      nome: l.nome,
      quantidade: Number(l.quantidade),
      opcoes: (Array.isArray(l.opcoes) ? l.opcoes : []) as ItemCozinha['opcoes'],
      observacao: l.observacao,
      preparo: l.preparo as EstadoPreparo,
      estacaoId: l.estacao_id!,
      criadoEm: l.criado_em,
      iniciadoEm: l.preparo_iniciado_em,
      prontoEm: l.pronto_em,
    })
  }
  return [...cartoes.values()].sort((a, b) => a.itens[0]!.criadoEm.localeCompare(b.itens[0]!.criadoEm))
}

/** Muda o preparo de um ou mais itens (ex.: "tudo pronto" do cartão). */
export async function mudarPreparo(
  supabase: Cliente,
  tenantId: string,
  itemIds: string[],
  estado: Exclude<EstadoPreparo, 'cancelado'>,
): Promise<void> {
  const r = await supabase.from('itens_pedido').update({ preparo: estado }).eq('tenant_id', tenantId).in('id', itemIds)
  if (r.error?.code === '23514') throw new ErroDados(r.error.message.charAt(0).toUpperCase() + r.error.message.slice(1) + '.')
  garantir(r, 'Não foi possível actualizar o preparo')
}

/** Cancela um item de preparo com motivo (fica no histórico, sai da conta). */
export async function cancelarItem(supabase: Cliente, tenantId: string, itemId: string, motivo: string): Promise<void> {
  const r = await supabase
    .from('itens_pedido')
    .update({ preparo: 'cancelado', cancelado_motivo: motivo })
    .eq('tenant_id', tenantId)
    .eq('id', itemId)
  if (r.error?.code === '23514') throw new ErroDados(r.error.message.charAt(0).toUpperCase() + r.error.message.slice(1) + '.')
  garantir(r, 'Não foi possível cancelar o item')
}
