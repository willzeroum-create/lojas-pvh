import 'server-only'

import { conferir, esperadoPorForma, FORMAS_RECEBIMENTO, ROTULO_FORMA, type LinhaConferencia } from '@/lib/dominio/caixa'
import type { FormaRecebimento } from '@/lib/dominio/pdv'
import type { Cliente } from '@/lib/supabase/server'
import type { CaixaMovimentoLinha, CaixaSessaoLinha } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'
import { criarTitulo } from './financeiro'
import { modulosAtivos } from './modulos'

export type Operador = { id: string; nome: string }

export type CaixaAtual = {
  sessao: CaixaSessaoLinha
  movimentos: CaixaMovimentoLinha[]
  /** Esperado por forma. Não mostrar ao operador antes de ele contar (fechamento cego). */
  esperado: Record<FormaRecebimento, number>
  vendas: { quantidade: number; total: number }
}

/** O caixa aberto da loja, com os movimentos e o esperado; null se estiver fechado. */
export async function caixaAberto(supabase: Cliente, tenantId: string, lojaId: string): Promise<CaixaAtual | null> {
  const { data: sessao } = await supabase
    .from('caixa_sessoes')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('loja_id', lojaId)
    .eq('estado', 'aberta')
    .maybeSingle()
  if (!sessao) return null
  return montarCaixa(supabase, tenantId, sessao)
}

async function montarCaixa(supabase: Cliente, tenantId: string, sessao: CaixaSessaoLinha): Promise<CaixaAtual> {
  const movimentos = ouErro(
    await supabase.from('caixa_movimentos').select('*').eq('tenant_id', tenantId).eq('sessao_id', sessao.id).order('criado_em'),
    'Não foi possível ler o caixa',
  )
  const numericos = movimentos.map((m) => ({ ...m, valor: Number(m.valor) }))
  const pedidosVendidos = new Set(numericos.filter((m) => m.tipo === 'venda').map((m) => m.pedido_id))
  const pedidosEstornados = new Set(numericos.filter((m) => m.tipo === 'estorno').map((m) => m.pedido_id))
  const totalVendas =
    numericos.filter((m) => m.tipo === 'venda').reduce((s, m) => s + m.valor * 100, 0) -
    numericos.filter((m) => m.tipo === 'estorno').reduce((s, m) => s + m.valor * 100, 0)
  return {
    sessao,
    movimentos: numericos,
    esperado: esperadoPorForma(Number(sessao.fundo_troco), numericos),
    vendas: {
      quantidade: [...pedidosVendidos].filter((p) => !pedidosEstornados.has(p)).length,
      total: Math.round(totalVendas) / 100,
    },
  }
}

export async function abrirCaixa(
  supabase: Cliente,
  tenantId: string,
  lojaId: string,
  operador: Operador,
  fundoTroco: number,
): Promise<string> {
  const r = await supabase
    .from('caixa_sessoes')
    .insert({ tenant_id: tenantId, loja_id: lojaId, operador_id: operador.id, operador_nome: operador.nome, fundo_troco: fundoTroco })
    .select('id')
    .single()
  if (r.error?.code === '23505') throw new ErroDados('Já há um caixa aberto nesta loja.')
  return ouErro(r, 'Não foi possível abrir o caixa').id
}

/** Suprimento (põe dinheiro na gaveta) ou sangria (tira), sempre com motivo. */
export async function movimentarCaixa(
  supabase: Cliente,
  tenantId: string,
  sessaoId: string,
  tipo: 'suprimento' | 'sangria',
  valor: number,
  motivo: string,
  autor: string,
): Promise<void> {
  if (tipo === 'sangria') {
    const { data: sessao } = await supabase.from('caixa_sessoes').select('*').eq('tenant_id', tenantId).eq('id', sessaoId).maybeSingle()
    if (!sessao) throw new ErroDados('Caixa não encontrado.')
    const atual = await montarCaixa(supabase, tenantId, sessao)
    if (valor > atual.esperado.dinheiro) throw new ErroDados('A sangria passa do dinheiro que há na gaveta.')
  }
  const r = await supabase.from('caixa_movimentos').insert({
    tenant_id: tenantId,
    sessao_id: sessaoId,
    tipo,
    forma: 'dinheiro',
    valor,
    motivo,
    autor_nome: autor,
  })
  if (r.error?.code === '23514') throw new ErroDados('O caixa está fechado.')
  garantir(r, 'Não foi possível registar o movimento')
}

export type ResultadoFechamento = { linhas: LinhaConferencia[]; diferencaTotal: number; bate: boolean; lancadoNoFinanceiro: boolean }

const CARTEIRA_DA_FORMA: Record<FormaRecebimento, string> = {
  dinheiro: 'Caixa da loja',
  pix: 'Pix',
  cartao_debito: 'Cartão a receber',
  cartao_credito: 'Cartão a receber',
  outro: 'Caixa da loja',
}

/**
 * Fechamento cego: o operador informa o que contou por forma; o esperado é
 * calculado aqui, no servidor. Com diferença, a justificativa é obrigatória.
 * Se o financeiro estiver ligado, as vendas do caixa entram como conta a
 * receber já recebida: uma conta por forma de pagamento, na sua carteira.
 */
export async function fecharCaixa(
  supabase: Cliente,
  tenantId: string,
  sessaoId: string,
  informado: Partial<Record<FormaRecebimento, number>>,
  justificativa: string | undefined,
): Promise<ResultadoFechamento> {
  const { data: sessao } = await supabase.from('caixa_sessoes').select('*').eq('tenant_id', tenantId).eq('id', sessaoId).maybeSingle()
  if (!sessao) throw new ErroDados('Caixa não encontrado.')
  if (sessao.estado !== 'aberta') throw new ErroDados('Este caixa já foi fechado.')

  const atual = await montarCaixa(supabase, tenantId, sessao)
  const conferencia = conferir(atual.esperado, informado)
  if (!conferencia.bate && !justificativa?.trim()) {
    throw new ErroDados('Há diferença no caixa: escreva a justificativa antes de fechar.')
  }

  const linhas = FORMAS_RECEBIMENTO.map((forma) => ({
    tenant_id: tenantId,
    sessao_id: sessaoId,
    forma,
    esperado: atual.esperado[forma],
    informado: informado[forma] ?? 0,
  })).filter((l) => l.esperado !== 0 || l.informado !== 0)
  if (linhas.length > 0) {
    garantir(await supabase.from('caixa_conferencias').insert(linhas), 'Não foi possível guardar a conferência')
  }
  garantir(
    await supabase
      .from('caixa_sessoes')
      .update({ estado: 'fechada', fechada_em: new Date().toISOString(), justificativa: justificativa?.trim() || null })
      .eq('tenant_id', tenantId)
      .eq('id', sessaoId),
    'Não foi possível fechar o caixa',
  )

  const lancado = await lancarVendasNoFinanceiro(supabase, tenantId, sessao, atual)
  return { ...conferencia, lancadoNoFinanceiro: lancado }
}

async function lancarVendasNoFinanceiro(
  supabase: Cliente,
  tenantId: string,
  sessao: CaixaSessaoLinha,
  atual: CaixaAtual,
): Promise<boolean> {
  if (!(await modulosAtivos(supabase, tenantId)).has('financeiro')) return false

  const porForma = new Map<FormaRecebimento, number>()
  for (const m of atual.movimentos) {
    if (m.tipo !== 'venda' && m.tipo !== 'estorno') continue
    porForma.set(m.forma, (porForma.get(m.forma) ?? 0) + (m.tipo === 'venda' ? 1 : -1) * Math.round(m.valor * 100))
  }
  const formas = [...porForma.entries()].filter(([, v]) => v > 0)
  if (formas.length === 0) return false

  const [categoria, carteiras] = await Promise.all([
    supabase.from('categorias_financeiras').select('id').eq('tenant_id', tenantId).eq('tipo', 'receber').eq('linha', 'receita_vendas').limit(1).maybeSingle(),
    supabase.from('carteiras').select('id, nome').eq('tenant_id', tenantId),
  ])
  if (!categoria.data) return false
  const carteiraPorNome = new Map((carteiras.data ?? []).map((c) => [c.nome, c.id]))

  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Porto_Velho' })
  const dia = new Date(sessao.aberta_em).toLocaleDateString('pt-BR', { timeZone: 'America/Porto_Velho' })
  // Uma conta por forma (cada parcela vai para a sua carteira).
  for (const [forma, centavos] of formas) {
    const carteiraId = carteiraPorNome.get(CARTEIRA_DA_FORMA[forma]) ?? carteiras.data?.[0]?.id
    if (!carteiraId) return false
    await criarTitulo(supabase, tenantId, {
      tipo: 'receber',
      descricao: `Vendas do caixa ${dia} · ${ROTULO_FORMA[forma]}`,
      categoriaId: categoria.data.id,
      valor: centavos / 100,
      parcelas: 1,
      primeiroVencimento: hoje,
      competencia: hoje,
      pagoEm: hoje,
      carteiraId,
      forma: forma === 'outro' ? 'outro' : forma,
      origem: 'caixa',
      origemId: undefined,
    })
  }
  return true
}

export type SessaoResumo = CaixaSessaoLinha & { diferencaTotal: number | null }

/** Histórico de caixas com a diferença de cada fechamento. */
export async function historicoCaixas(supabase: Cliente, tenantId: string, limite = 60): Promise<SessaoResumo[]> {
  const sessoes = ouErro(
    await supabase.from('caixa_sessoes').select('*, caixa_conferencias(diferenca)').eq('tenant_id', tenantId).order('aberta_em', { ascending: false }).limit(limite),
    'Não foi possível ler o histórico',
  )
  return sessoes.map(({ caixa_conferencias, ...s }) => ({
    ...s,
    diferencaTotal:
      s.estado === 'aberta'
        ? null
        : Math.round((caixa_conferencias as Array<{ diferenca: number }>).reduce((t, c) => t + Number(c.diferenca) * 100, 0)) / 100,
  }))
}

/** Detalhe de um caixa fechado: conferência e movimentos. */
export async function detalheCaixa(supabase: Cliente, tenantId: string, sessaoId: string) {
  const { data: sessao } = await supabase.from('caixa_sessoes').select('*').eq('tenant_id', tenantId).eq('id', sessaoId).maybeSingle()
  if (!sessao) return null
  const [atual, conferencias] = await Promise.all([
    montarCaixa(supabase, tenantId, sessao),
    supabase.from('caixa_conferencias').select('*').eq('tenant_id', tenantId).eq('sessao_id', sessaoId),
  ])
  return { ...atual, conferencias: ouErro(conferencias, 'Não foi possível ler a conferência') }
}

/** O gerente confere um caixa fechado. */
export async function conferirCaixa(supabase: Cliente, tenantId: string, sessaoId: string, quem: string): Promise<void> {
  garantir(
    await supabase
      .from('caixa_sessoes')
      .update({ estado: 'conferida', conferida_por: quem, conferida_em: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', sessaoId)
      .eq('estado', 'fechada'),
    'Não foi possível conferir o caixa',
  )
}
