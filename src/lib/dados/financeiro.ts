import 'server-only'

import {
  fluxoPrevisto,
  gerarParcelas,
  resultadoDoMes,
  saldoParcela,
  situacaoParcela,
  valorMovimentado,
  type LinhaResultado,
  type ResultadoMes,
  type SemanaFluxo,
  type Situacao,
  type TipoTitulo,
} from '@/lib/dominio/financeiro'
import type { Cliente } from '@/lib/supabase/server'
import type { DadosBaixa, DadosTitulo, FiltroParcelas } from '@/lib/validacao/financeiro'
import { ErroDados, garantir, ouErro } from './erros'

export type Carteira = { id: string; nome: string; tipo: string; ativa: boolean; saldo: number }
export type CategoriaFinanceira = { id: string; nome: string; tipo: TipoTitulo; linha: LinhaResultado; ativa: boolean }

/** Carteiras e categorias de partida; idempotente, chamado ao abrir o módulo. */
export async function garantirFinanceiroPadrao(supabase: Cliente, tenantId: string): Promise<void> {
  garantir(await supabase.rpc('financeiro_padrao', { p_tenant: tenantId }), 'Não foi possível preparar o financeiro')
}

export async function listarCategorias(supabase: Cliente, tenantId: string): Promise<CategoriaFinanceira[]> {
  return ouErro(
    await supabase.from('categorias_financeiras').select('id, nome, tipo, linha, ativa').eq('tenant_id', tenantId).order('nome'),
    'Não foi possível ler as categorias',
  )
}

/** Carteiras com o saldo actual: saldo inicial + entradas − saídas das baixas não estornadas. */
export async function listarCarteiras(supabase: Cliente, tenantId: string): Promise<Carteira[]> {
  const [carteiras, baixas] = await Promise.all([
    supabase.from('carteiras').select('id, nome, tipo, ativa, saldo_inicial').eq('tenant_id', tenantId).order('nome'),
    supabase
      .from('baixas')
      .select('carteira_id, valor, juros, multa, desconto, parcelas!inner(titulos!inner(tipo))')
      .eq('tenant_id', tenantId)
      .is('estornada_em', null),
  ])
  const saldos = new Map<string, number>()
  for (const b of ouErro(baixas, 'Não foi possível ler as baixas')) {
    const tipo = (b.parcelas as unknown as { titulos: { tipo: TipoTitulo } }).titulos.tipo
    const v = valorMovimentado({ valor: +b.valor, juros: +b.juros, multa: +b.multa, desconto: +b.desconto })
    saldos.set(b.carteira_id, (saldos.get(b.carteira_id) ?? 0) + (tipo === 'receber' ? v : -v))
  }
  return ouErro(carteiras, 'Não foi possível ler as carteiras').map((c) => ({
    id: c.id,
    nome: c.nome,
    tipo: c.tipo,
    ativa: c.ativa,
    saldo: Math.round((Number(c.saldo_inicial) + (saldos.get(c.id) ?? 0)) * 100) / 100,
  }))
}

/** Cria o título e as parcelas; se vier `pagoEm`, já dá baixa em todas (venda à vista). */
export async function criarTitulo(supabase: Cliente, tenantId: string, d: DadosTitulo): Promise<string> {
  const titulo = ouErro(
    await supabase
      .from('titulos')
      .insert({
        tenant_id: tenantId,
        tipo: d.tipo,
        descricao: d.descricao,
        pessoa_id: d.pessoaId ?? null,
        categoria_id: d.categoriaId,
        competencia: d.competencia,
        documento: d.documento ?? null,
        observacoes: d.observacoes ?? null,
        origem: d.origem ?? 'manual',
        origem_id: d.origemId ?? null,
      })
      .select('id')
      .single(),
    'Não foi possível criar a conta',
  )

  const parcelas = gerarParcelas(d.valor, d.parcelas, d.primeiroVencimento)
  const criadas = ouErro(
    await supabase
      .from('parcelas')
      .insert(parcelas.map((p) => ({ tenant_id: tenantId, titulo_id: titulo.id, numero: p.numero, vencimento: p.vencimento, valor: p.valor })))
      .select('id, valor'),
    'Não foi possível criar as parcelas',
  )

  if (d.pagoEm && d.carteiraId) {
    garantir(
      await supabase.from('baixas').insert(
        criadas.map((p) => ({
          tenant_id: tenantId,
          parcela_id: p.id,
          carteira_id: d.carteiraId!,
          data: d.pagoEm!,
          valor: Number(p.valor),
          forma: d.forma ?? 'dinheiro',
        })),
      ),
      'A conta foi criada, mas não foi possível dar baixa',
    )
  }
  return titulo.id
}

export type ParcelaLista = {
  id: string
  tituloId: string
  tipo: TipoTitulo
  descricao: string
  pessoa: string | null
  categoria: string
  numero: number
  totalParcelas: number
  vencimento: string
  valor: number
  valorPago: number
  saldo: number
  situacao: Situacao
}

/** Parcelas por tipo e período de vencimento, com a situação de hoje. */
export async function listarParcelas(
  supabase: Cliente,
  tenantId: string,
  filtro: FiltroParcelas,
  hoje: string,
): Promise<ParcelaLista[]> {
  let consulta = supabase
    .from('parcelas')
    .select(
      'id, titulo_id, numero, vencimento, valor, valor_pago, estado, titulos!inner(tipo, descricao, cancelado_em, pessoas(nome), categorias_financeiras(nome), parcelas(count))',
    )
    .eq('tenant_id', tenantId)
    .eq('titulos.tipo', filtro.tipo)
    .order('vencimento')
    .limit(500)
  if (filtro.ate) consulta = consulta.lte('vencimento', filtro.ate)
  if (filtro.de) consulta = consulta.gte('vencimento', filtro.de)
  if (filtro.situacao === 'abertas') consulta = consulta.in('estado', ['aberta', 'parcial'])
  if (filtro.situacao === 'vencidas') consulta = consulta.in('estado', ['aberta', 'parcial']).lt('vencimento', hoje)
  if (filtro.situacao === 'pagas') consulta = consulta.eq('estado', 'paga')

  const linhas = ouErro(await consulta, 'Não foi possível listar as contas')
  return linhas.map((p) => {
    const t = p.titulos as unknown as {
      tipo: TipoTitulo
      descricao: string
      pessoas: { nome: string } | null
      categorias_financeiras: { nome: string } | null
      parcelas: Array<{ count: number }>
    }
    return {
      id: p.id,
      tituloId: p.titulo_id,
      tipo: t.tipo,
      descricao: t.descricao,
      pessoa: t.pessoas?.nome ?? null,
      categoria: t.categorias_financeiras?.nome ?? '',
      numero: p.numero,
      totalParcelas: t.parcelas?.[0]?.count ?? 1,
      vencimento: p.vencimento,
      valor: Number(p.valor),
      valorPago: Number(p.valor_pago),
      saldo: saldoParcela(Number(p.valor), Number(p.valor_pago)),
      situacao: situacaoParcela(p.estado, p.vencimento, hoje),
    }
  })
}

export async function registarBaixa(supabase: Cliente, tenantId: string, d: DadosBaixa): Promise<void> {
  const r = await supabase.from('baixas').insert({
    tenant_id: tenantId,
    parcela_id: d.parcelaId,
    carteira_id: d.carteiraId,
    data: d.data,
    valor: d.valor,
    juros: d.juros,
    multa: d.multa,
    desconto: d.desconto,
    forma: d.forma,
    observacao: d.observacao ?? null,
  })
  if (r.error?.code === '23514') throw new ErroDados(r.error.message.replace(/^.*?: /, 'Não deu: '))
  garantir(r, 'Não foi possível registar o pagamento')
}

/** Corrigir é estornar: a baixa fica no histórico, marcada, e a parcela volta a ter saldo. */
export async function estornarBaixa(supabase: Cliente, tenantId: string, baixaId: string): Promise<void> {
  garantir(
    await supabase
      .from('baixas')
      .update({ estornada_em: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', baixaId)
      .is('estornada_em', null),
    'Não foi possível estornar',
  )
}

export async function cancelarTitulo(supabase: Cliente, tenantId: string, tituloId: string): Promise<void> {
  garantir(
    await supabase
      .from('titulos')
      .update({ cancelado_em: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('id', tituloId)
      .is('cancelado_em', null),
    'Não foi possível cancelar a conta',
  )
}

export type BaixaDoTitulo = {
  id: string
  parcelaNumero: number
  data: string
  valor: number
  movimentado: number
  forma: string
  carteira: string
  estornada: boolean
}

export type DetalheTitulo = {
  id: string
  tipo: TipoTitulo
  descricao: string
  pessoa: { id: string; nome: string } | null
  categoria: string
  competencia: string
  documento: string | null
  observacoes: string | null
  cancelado: boolean
  parcelas: Array<{ id: string; numero: number; vencimento: string; valor: number; valorPago: number; saldo: number; situacao: Situacao }>
  baixas: BaixaDoTitulo[]
}

export async function obterTitulo(supabase: Cliente, tenantId: string, id: string, hoje: string): Promise<DetalheTitulo | null> {
  const { data: t } = await supabase
    .from('titulos')
    .select('id, tipo, descricao, competencia, documento, observacoes, cancelado_em, pessoas(id, nome), categorias_financeiras(nome)')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .maybeSingle()
  if (!t) return null
  const parcelas = ouErro(
    await supabase.from('parcelas').select('id, numero, vencimento, valor, valor_pago, estado').eq('titulo_id', id).order('numero'),
    'Não foi possível ler as parcelas',
  )
  const baixas = ouErro(
    await supabase
      .from('baixas')
      .select('id, parcela_id, data, valor, juros, multa, desconto, forma, estornada_em, carteiras(nome)')
      .in('parcela_id', parcelas.map((p) => p.id))
      .order('data'),
    'Não foi possível ler os pagamentos',
  )
  const numeroDe = new Map(parcelas.map((p) => [p.id, p.numero]))
  const pessoa = t.pessoas as unknown as { id: string; nome: string } | null
  return {
    id: t.id,
    tipo: t.tipo,
    descricao: t.descricao,
    pessoa,
    categoria: (t.categorias_financeiras as unknown as { nome: string } | null)?.nome ?? '',
    competencia: t.competencia,
    documento: t.documento,
    observacoes: t.observacoes,
    cancelado: t.cancelado_em !== null,
    parcelas: parcelas.map((p) => ({
      id: p.id,
      numero: p.numero,
      vencimento: p.vencimento,
      valor: Number(p.valor),
      valorPago: Number(p.valor_pago),
      saldo: saldoParcela(Number(p.valor), Number(p.valor_pago)),
      situacao: situacaoParcela(p.estado, p.vencimento, hoje),
    })),
    baixas: baixas.map((b) => ({
      id: b.id,
      parcelaNumero: numeroDe.get(b.parcela_id) ?? 0,
      data: b.data,
      valor: Number(b.valor),
      movimentado: valorMovimentado({ valor: +b.valor, juros: +b.juros, multa: +b.multa, desconto: +b.desconto }),
      forma: b.forma,
      carteira: (b.carteiras as unknown as { nome: string } | null)?.nome ?? '',
      estornada: b.estornada_em !== null,
    })),
  }
}

export type PainelFinanceiro = {
  carteiras: Carteira[]
  saldoTotal: number
  aReceber: { total: number; vencido: number }
  aPagar: { total: number; vencido: number }
  fluxo: SemanaFluxo[]
  resultadoMes: ResultadoMes
}

/** A visão de cima: saldos, o que falta receber e pagar, as próximas 8 semanas e o resultado do mês. */
export async function painelFinanceiro(supabase: Cliente, tenantId: string, hoje: string): Promise<PainelFinanceiro> {
  const inicioMes = `${hoje.slice(0, 7)}-01`
  const [carteiras, abertas, doMes] = await Promise.all([
    listarCarteiras(supabase, tenantId),
    supabase
      .from('parcelas')
      .select('vencimento, valor, valor_pago, titulos!inner(tipo)')
      .eq('tenant_id', tenantId)
      .in('estado', ['aberta', 'parcial']),
    supabase
      .from('parcelas')
      .select('valor, titulos!inner(competencia, cancelado_em, categorias_financeiras(linha))')
      .eq('tenant_id', tenantId)
      .gte('titulos.competencia', inicioMes)
      .lte('titulos.competencia', `${hoje.slice(0, 7)}-31`)
      .is('titulos.cancelado_em', null),
  ])

  const previstas = ouErro(abertas, 'Não foi possível ler as contas em aberto').map((p) => ({
    tipo: (p.titulos as unknown as { tipo: TipoTitulo }).tipo,
    vencimento: p.vencimento,
    saldo: saldoParcela(Number(p.valor), Number(p.valor_pago)),
  }))
  const somar = (tipo: TipoTitulo, soVencidas: boolean) =>
    Math.round(
      previstas.filter((p) => p.tipo === tipo && (!soVencidas || p.vencimento < hoje)).reduce((s, p) => s + p.saldo * 100, 0),
    ) / 100

  const saldoTotal = Math.round(carteiras.filter((c) => c.ativa).reduce((s, c) => s + c.saldo * 100, 0)) / 100
  const lancamentos = ouErro(doMes, 'Não foi possível calcular o resultado').flatMap((p) => {
    const linha = (p.titulos as unknown as { categorias_financeiras: { linha: LinhaResultado } | null }).categorias_financeiras?.linha
    return linha ? [{ linha, valor: Number(p.valor) }] : []
  })

  return {
    carteiras,
    saldoTotal,
    aReceber: { total: somar('receber', false), vencido: somar('receber', true) },
    aPagar: { total: somar('pagar', false), vencido: somar('pagar', true) },
    fluxo: fluxoPrevisto(saldoTotal, previstas, hoje),
    resultadoMes: resultadoDoMes(lancamentos),
  }
}
