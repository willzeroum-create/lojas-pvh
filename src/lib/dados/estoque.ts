import 'server-only'

import { custoFicha, margem, type CustoProduto, type Margem } from '@/lib/dominio/ficha'
import { fatorSugerido, lerNotaCompra, ErroNfe } from '@/lib/dominio/nfe'
import { normalizarDocumento } from '@/lib/dominio/documento'
import type { Cliente } from '@/lib/supabase/server'
import type { Json, EstoqueEntradaItemLinha, EstoqueEntradaLinha, EstoqueMovimentoLinha, UnidadeEstoque } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'
import { modulosAtivos } from './modulos'

const mensagemBase = (m: string) => m.charAt(0).toUpperCase() + m.slice(1) + '.'

export type ItemEstoque = {
  tipo: 'produto' | 'insumo'
  id: string
  nome: string
  unidade: string
  saldo: number
  minimo: number
  custo: number
  valor: number
  abaixoDoMinimo: boolean
  codigoBarras: string | null
}

/** Tudo o que se controla no estoque: produtos com controlo e insumos activos. */
export async function listarItensEstoque(supabase: Cliente, tenantId: string): Promise<ItemEstoque[]> {
  const [produtos, insumos] = await Promise.all([
    supabase
      .from('produtos')
      .select('id, nome, unidade, estoque_atual, estoque_minimo, custo_medio, codigo_barras')
      .eq('tenant_id', tenantId)
      .eq('controla_estoque', true)
      .order('nome'),
    supabase
      .from('insumos')
      .select('id, nome, unidade, quantidade_atual, quantidade_minima, custo_unitario, codigo_barras')
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .order('nome'),
  ])
  const item = (tipo: 'produto' | 'insumo', id: string, nome: string, unidade: string, saldo: number, minimo: number, custo: number, codigo: string | null): ItemEstoque => ({
    tipo,
    id,
    nome,
    unidade,
    saldo,
    minimo,
    custo,
    valor: Math.round(Math.max(saldo, 0) * custo * 100) / 100,
    abaixoDoMinimo: minimo > 0 && saldo <= minimo,
    codigoBarras: codigo,
  })
  return [
    ...ouErro(produtos, 'Não foi possível ler os produtos').map((p) =>
      item('produto', p.id, p.nome, p.unidade, Number(p.estoque_atual), Number(p.estoque_minimo), Number(p.custo_medio), p.codigo_barras),
    ),
    ...ouErro(insumos, 'Não foi possível ler os insumos').map((i) =>
      item('insumo', i.id, i.nome, i.unidade, Number(i.quantidade_atual), Number(i.quantidade_minima), Number(i.custo_unitario), i.codigo_barras),
    ),
  ].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export type ResumoEstoque = { valorTotal: number; abaixoDoMinimo: number; zerados: number; itens: number }

export function resumirEstoque(itens: readonly ItemEstoque[]): ResumoEstoque {
  return {
    valorTotal: Math.round(itens.reduce((s, i) => s + i.valor * 100, 0)) / 100,
    abaixoDoMinimo: itens.filter((i) => i.abaixoDoMinimo).length,
    zerados: itens.filter((i) => i.saldo <= 0).length,
    itens: itens.length,
  }
}

/** Histórico de um item com saldo antes e depois, os mais recentes primeiro. */
export async function historicoItem(
  supabase: Cliente,
  tenantId: string,
  item: { tipo: 'produto' | 'insumo'; id: string },
  limite = 100,
): Promise<EstoqueMovimentoLinha[]> {
  return ouErro(
    await supabase
      .from('estoque_movimentos')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq(item.tipo === 'produto' ? 'produto_id' : 'insumo_id', item.id)
      .order('criado_em', { ascending: false })
      .limit(limite),
    'Não foi possível ler o histórico',
  ).map((m) => ({ ...m, quantidade: Number(m.quantidade), saldo_antes: Number(m.saldo_antes), saldo_depois: Number(m.saldo_depois) }))
}

export const MOTIVOS_SAIDA = ['Perda', 'Validade vencida', 'Consumo interno', 'Doação', 'Quebra', 'Outro'] as const

/** Saída manual com motivo (perda, validade, consumo interno…). */
export async function registarSaida(
  supabase: Cliente,
  tenantId: string,
  item: { tipo: 'produto' | 'insumo'; id: string },
  quantidade: number,
  motivo: string,
  autor: string,
): Promise<void> {
  garantir(
    await supabase.from('estoque_movimentos').insert({
      tenant_id: tenantId,
      produto_id: item.tipo === 'produto' ? item.id : null,
      insumo_id: item.tipo === 'insumo' ? item.id : null,
      tipo: 'saida',
      motivo,
      quantidade: -Math.abs(quantidade),
      origem: 'manual',
      autor_nome: autor,
      saldo_antes: 0,
      saldo_depois: 0,
    }),
    'Não foi possível registar a saída',
  )
}

export async function estornarMovimento(supabase: Cliente, tenantId: string, movimentoId: string, autor: string): Promise<void> {
  const r = await supabase.rpc('estornar_movimento_estoque', { p_tenant: tenantId, p_movimento: movimentoId, p_autor: autor })
  if (r.error?.code === '23514' || r.error?.code === 'P0002') throw new ErroDados(mensagemBase(r.error.message))
  garantir(r, 'Não foi possível estornar')
}

// ---------------------------------------------------------------------------
// Entradas
// ---------------------------------------------------------------------------

/**
 * Cria uma entrada pendente a partir do XML da NF-e: fornecedor (cadastra se
 * não existir), itens com o vínculo lembrado da nota anterior ou pelo código
 * de barras, e o fator sugerido pela unidade (CX12 → 12).
 */
export async function criarEntradaDeXml(supabase: Cliente, tenantId: string, xml: string, autor: string): Promise<string> {
  let nota
  try {
    nota = lerNotaCompra(xml)
  } catch (e) {
    throw new ErroDados(e instanceof ErroNfe ? e.message : 'Não foi possível ler o XML.')
  }
  const documento = normalizarDocumento(nota.emitente.documento)

  // Fornecedor: procura pelo documento, cria se não existir.
  const { data: existente } = await supabase.from('pessoas').select('id').eq('tenant_id', tenantId).eq('documento', documento).is('anonimizado_em', null).maybeSingle()
  let fornecedorId = existente?.id ?? null
  if (fornecedorId) {
    await supabase.from('pessoas').update({ e_fornecedor: true }).eq('id', fornecedorId)
  } else {
    const novo = await supabase
      .from('pessoas')
      .insert({
        tenant_id: tenantId,
        tipo: documento.length === 11 ? 'pf' : 'pj',
        nome: nota.emitente.nome,
        nome_fantasia: nota.emitente.fantasia,
        documento,
        e_cliente: false,
        e_fornecedor: true,
        origem: 'importacao',
      })
      .select('id')
      .single()
    fornecedorId = novo.data?.id ?? null
  }

  const entrada = await supabase
    .from('estoque_entradas')
    .insert({
      tenant_id: tenantId,
      fornecedor_id: fornecedorId,
      fornecedor_nome: nota.emitente.fantasia ?? nota.emitente.nome,
      fornecedor_documento: documento,
      numero_nota: nota.numero,
      serie: nota.serie,
      chave_acesso: nota.chave,
      emitida_em: nota.emitidaEm,
      valor_total: nota.valorTotal,
      duplicatas: nota.duplicatas,
      autor_nome: autor,
    })
    .select('id')
    .single()
  if (entrada.error?.code === '23505') throw new ErroDados('Esta nota já foi lançada.')
  const entradaId = ouErro(entrada, 'Não foi possível criar a entrada').id

  const [vinculos, porCodigoBarras] = await Promise.all([
    supabase.from('estoque_vinculos').select('*').eq('tenant_id', tenantId).eq('fornecedor_documento', documento),
    supabase
      .from('produtos')
      .select('id, codigo_barras')
      .eq('tenant_id', tenantId)
      .in('codigo_barras', nota.itens.map((i) => i.ean).filter((e): e is string => !!e)),
  ])
  const vinculo = new Map((vinculos.data ?? []).map((v) => [v.codigo_fornecedor, v]))
  const ean = new Map((porCodigoBarras.data ?? []).map((p) => [p.codigo_barras!, p.id]))

  garantir(
    await supabase.from('estoque_entrada_itens').insert(
      nota.itens.map((i) => {
        const v = vinculo.get(i.codigo)
        return {
          tenant_id: tenantId,
          entrada_id: entradaId,
          produto_id: v?.produto_id ?? (i.ean ? (ean.get(i.ean) ?? null) : null),
          insumo_id: v?.insumo_id ?? null,
          descricao: i.descricao,
          codigo_fornecedor: i.codigo,
          ean: i.ean,
          unidade_nota: i.unidade,
          quantidade_nota: i.quantidade,
          fator: v ? Number(v.fator) : fatorSugerido(i.unidade),
          valor_total: i.valorTotal,
        }
      }),
    ),
    'Não foi possível gravar os itens da nota',
  )
  return entradaId
}

/** Entrada manual (sem nota): itens já ligados a produto ou insumo. */
export async function criarEntradaManual(
  supabase: Cliente,
  tenantId: string,
  d: { fornecedorId?: string; observacoes?: string; itens: Array<{ tipo: 'produto' | 'insumo'; id: string; descricao: string; quantidade: number; valorTotal: number }> },
  autor: string,
): Promise<string> {
  const entrada = ouErro(
    await supabase
      .from('estoque_entradas')
      .insert({
        tenant_id: tenantId,
        fornecedor_id: d.fornecedorId ?? null,
        observacoes: d.observacoes ?? null,
        valor_total: Math.round(d.itens.reduce((s, i) => s + i.valorTotal * 100, 0)) / 100,
        autor_nome: autor,
      })
      .select('id')
      .single(),
    'Não foi possível criar a entrada',
  )
  garantir(
    await supabase.from('estoque_entrada_itens').insert(
      d.itens.map((i) => ({
        tenant_id: tenantId,
        entrada_id: entrada.id,
        produto_id: i.tipo === 'produto' ? i.id : null,
        insumo_id: i.tipo === 'insumo' ? i.id : null,
        descricao: i.descricao,
        quantidade_nota: i.quantidade,
        fator: 1,
        valor_total: i.valorTotal,
      })),
    ),
    'Não foi possível gravar os itens',
  )
  return entrada.id
}

export type DetalheEntrada = EstoqueEntradaLinha & { itens: EstoqueEntradaItemLinha[] }

export async function obterEntrada(supabase: Cliente, tenantId: string, id: string): Promise<DetalheEntrada | null> {
  const { data: e } = await supabase.from('estoque_entradas').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle()
  if (!e) return null
  const itens = ouErro(
    await supabase.from('estoque_entrada_itens').select('*').eq('entrada_id', id).order('descricao'),
    'Não foi possível ler os itens',
  )
  return {
    ...e,
    valor_total: Number(e.valor_total),
    itens: itens.map((i) => ({ ...i, quantidade_nota: Number(i.quantidade_nota), fator: Number(i.fator), valor_total: Number(i.valor_total) })),
  }
}

export async function listarEntradas(supabase: Cliente, tenantId: string, limite = 50) {
  return ouErro(
    await supabase
      .from('estoque_entradas')
      .select('id, fornecedor_nome, numero_nota, emitida_em, valor_total, estado, criado_em, estoque_entrada_itens(count)')
      .eq('tenant_id', tenantId)
      .order('criado_em', { ascending: false })
      .limit(limite),
    'Não foi possível ler as entradas',
  ).map((e) => ({
    ...e,
    valor_total: Number(e.valor_total),
    itens: (e.estoque_entrada_itens as unknown as Array<{ count: number }>)[0]?.count ?? 0,
  }))
}

/** Liga um item da nota a um produto ou insumo e acerta o fator de conversão. */
export async function ligarItemEntrada(
  supabase: Cliente,
  tenantId: string,
  itemId: string,
  alvo: { tipo: 'produto' | 'insumo'; id: string } | null,
  fator: number,
): Promise<void> {
  garantir(
    await supabase
      .from('estoque_entrada_itens')
      .update({
        produto_id: alvo?.tipo === 'produto' ? alvo.id : null,
        insumo_id: alvo?.tipo === 'insumo' ? alvo.id : null,
        fator,
      })
      .eq('tenant_id', tenantId)
      .eq('id', itemId),
    'Não foi possível ligar o item',
  )
}

/**
 * Conclui a entrada numa só transacção: saldos e custo médio e, com o
 * financeiro ligado, a nota vira uma conta a pagar (categoria de mercadorias)
 * com uma parcela por duplicata.
 */
export async function concluirEntrada(
  supabase: Cliente,
  tenantId: string,
  entradaId: string,
  autor: string,
): Promise<{ itens: number; contasCriadas: number }> {
  let categoriaId: string | null = null
  if ((await modulosAtivos(supabase, tenantId)).has('financeiro')) {
    const { data } = await supabase
      .from('categorias_financeiras')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('tipo', 'pagar')
      .eq('linha', 'custo_mercadoria')
      .limit(1)
      .maybeSingle()
    categoriaId = data?.id ?? null
  }
  const r = await supabase.rpc('concluir_entrada', { p_tenant: tenantId, p_entrada: entradaId, p_autor: autor, p_categoria: categoriaId })
  if (r.error?.code === '23514' || r.error?.code === 'P0002') throw new ErroDados(mensagemBase(r.error.message))
  const res = ouErro(r, 'Não foi possível concluir a entrada') as { itens: number; parcelas: number }
  return { itens: res.itens, contasCriadas: res.parcelas }
}

export async function cancelarEntrada(supabase: Cliente, tenantId: string, entradaId: string): Promise<void> {
  garantir(
    await supabase.from('estoque_entradas').update({ estado: 'cancelada' }).eq('tenant_id', tenantId).eq('id', entradaId).eq('estado', 'pendente'),
    'Não foi possível cancelar a entrada',
  )
}

export async function aplicarInventario(
  supabase: Cliente,
  tenantId: string,
  descricao: string,
  contagem: Array<{ tipo: 'produto' | 'insumo'; id: string; contado: number }>,
  autor: string,
): Promise<string> {
  const r = await supabase.rpc('aplicar_inventario', {
    p_tenant: tenantId,
    p_descricao: descricao,
    p_contagem: contagem.map((c) => (c.tipo === 'produto' ? { produto_id: c.id, contado: c.contado } : { insumo_id: c.id, contado: c.contado })),
    p_autor: autor,
  })
  if (r.error?.code === '23514' || r.error?.code === 'P0002') throw new ErroDados(mensagemBase(r.error.message))
  return ouErro(r, 'Não foi possível aplicar o inventário')
}

// ---------------------------------------------------------------------------
// Insumos e ficha técnica
// ---------------------------------------------------------------------------

export async function salvarInsumo(
  supabase: Cliente,
  tenantId: string,
  d: { id?: string; nome: string; unidade: UnidadeEstoque; minimo: number; codigoBarras?: string; ativo: boolean },
): Promise<string> {
  const linha = { tenant_id: tenantId, nome: d.nome, unidade: d.unidade, quantidade_minima: d.minimo, codigo_barras: d.codigoBarras ?? null, ativo: d.ativo }
  const r = d.id
    ? await supabase.from('insumos').update(linha).eq('tenant_id', tenantId).eq('id', d.id).select('id').single()
    : await supabase.from('insumos').insert(linha).select('id').single()
  if (r.error?.code === '23505') throw new ErroDados('Já existe um insumo com este nome.')
  return ouErro(r, 'Não foi possível guardar o insumo').id
}

/** Configuração de estoque de um produto (controlar, unidade, mínimo, código de barras). */
export async function configurarEstoqueProduto(
  supabase: Cliente,
  tenantId: string,
  produtoId: string,
  d: { controla: boolean; unidade: UnidadeEstoque; minimo: number; codigoBarras?: string; vendidoPorPeso: boolean },
): Promise<void> {
  const r = await supabase
    .from('produtos')
    .update({
      controla_estoque: d.controla,
      unidade: d.unidade,
      estoque_minimo: d.minimo,
      codigo_barras: d.codigoBarras ?? null,
      vendido_por_peso: d.vendidoPorPeso,
    })
    .eq('tenant_id', tenantId)
    .eq('id', produtoId)
  if (r.error?.code === '23505') throw new ErroDados('Este código de barras já está noutro produto.')
  garantir(r, 'Não foi possível guardar')
}

export type FichaProduto = {
  produto: { id: string; nome: string; preco: number }
  linhas: Array<{ insumoId: string; insumo: string; unidade: string; quantidade: number; custoUnitario: number }>
  custo: CustoProduto
  margem: Margem
}

/** A ficha técnica do produto com o custo actual dos insumos e a margem sobre o preço. */
export async function obterFicha(supabase: Cliente, tenantId: string, produtoId: string): Promise<FichaProduto | null> {
  const { data: p } = await supabase.from('produtos').select('id, nome, preco, preco_promocional').eq('tenant_id', tenantId).eq('id', produtoId).maybeSingle()
  if (!p) return null
  const linhas = ouErro(
    await supabase.from('fichas').select('insumo_id, quantidade, insumos(nome, unidade, custo_unitario)').eq('tenant_id', tenantId).eq('produto_id', produtoId),
    'Não foi possível ler a ficha',
  ).map((l) => {
    const i = l.insumos as unknown as { nome: string; unidade: string; custo_unitario: number }
    return { insumoId: l.insumo_id, insumo: i.nome, unidade: i.unidade, quantidade: Number(l.quantidade), custoUnitario: Number(i.custo_unitario) }
  })
  const preco = Number(p.preco_promocional ?? p.preco)
  const custo = custoFicha(linhas.map((l) => ({ insumo: l.insumo, quantidade: l.quantidade, custoUnitario: l.custoUnitario })))
  return { produto: { id: p.id, nome: p.nome, preco }, linhas, custo, margem: margem(preco, custo.custo) }
}

/** Substitui a ficha técnica do produto (quantidade de cada insumo por unidade vendida). */
export async function salvarFicha(
  supabase: Cliente,
  tenantId: string,
  produtoId: string,
  linhas: Array<{ insumoId: string; quantidade: number }>,
): Promise<void> {
  const r = await supabase.rpc('salvar_ficha', {
    p_tenant: tenantId,
    p_produto: produtoId,
    p_linhas: linhas.map((l) => ({ insumo_id: l.insumoId, quantidade: l.quantidade })) as Json,
  })
  if (r.error?.code === '23505') throw new ErroDados('O mesmo insumo aparece duas vezes na ficha.')
  ouErro(r, 'Não foi possível guardar a ficha')
}

/** CMV de todos os produtos com ficha, para a lista "o que dá mais lucro". */
export async function custosDosProdutos(supabase: Cliente, tenantId: string) {
  const [produtos, fichas] = await Promise.all([
    supabase.from('produtos').select('id, nome, preco, preco_promocional').eq('tenant_id', tenantId).order('nome'),
    supabase.from('fichas').select('produto_id, quantidade, insumos(nome, custo_unitario)').eq('tenant_id', tenantId),
  ])
  const porProduto = new Map<string, Array<{ insumo: string; quantidade: number; custoUnitario: number }>>()
  for (const f of ouErro(fichas, 'Não foi possível ler as fichas')) {
    const i = f.insumos as unknown as { nome: string; custo_unitario: number }
    porProduto.set(f.produto_id, [...(porProduto.get(f.produto_id) ?? []), { insumo: i.nome, quantidade: Number(f.quantidade), custoUnitario: Number(i.custo_unitario) }])
  }
  return ouErro(produtos, 'Não foi possível ler os produtos').map((p) => {
    const preco = Number(p.preco_promocional ?? p.preco)
    const linhas = porProduto.get(p.id) ?? []
    const custo = custoFicha(linhas).custo
    return { id: p.id, nome: p.nome, preco, temFicha: linhas.length > 0, custo, margem: margem(preco, custo) }
  })
}
