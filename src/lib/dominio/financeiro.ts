/**
 * Financeiro simples: parcelamento, situação das parcelas, fluxo de caixa e
 * resultado do mês. Lógica pura; datas como 'AAAA-MM-DD' (dia civil da loja).
 */

export type TipoTitulo = 'receber' | 'pagar'
export type EstadoParcela = 'aberta' | 'parcial' | 'paga' | 'cancelada'
export type LinhaResultado =
  | 'receita_vendas'
  | 'outras_receitas'
  | 'impostos'
  | 'custo_mercadoria'
  | 'despesa_variavel'
  | 'pessoal'
  | 'despesa_fixa'
  | 'outras_despesas'

const centavos = (v: number) => Math.round(v * 100)
const reais = (c: number) => c / 100

/** Soma um número de meses a uma data, prendendo ao último dia do mês (31/01 + 1 → 28/02). */
export function somarMeses(data: string, meses: number): string {
  const [a, m, d] = data.split('-').map(Number) as [number, number, number]
  const alvo = new Date(Date.UTC(a, m - 1 + meses, 1))
  const ultimoDia = new Date(Date.UTC(alvo.getUTCFullYear(), alvo.getUTCMonth() + 1, 0)).getUTCDate()
  alvo.setUTCDate(Math.min(d, ultimoDia))
  return alvo.toISOString().slice(0, 10)
}

export function somarDias(data: string, dias: number): string {
  const t = new Date(`${data}T00:00:00Z`)
  t.setUTCDate(t.getUTCDate() + dias)
  return t.toISOString().slice(0, 10)
}

export type ParcelaGerada = { numero: number; vencimento: string; valor: number }

/** Divide o total em n parcelas mensais; os centavos que sobram vão para a primeira. */
export function gerarParcelas(total: number, quantidade: number, primeiroVencimento: string): ParcelaGerada[] {
  if (quantidade < 1 || !Number.isInteger(quantidade)) throw new Error('quantidade de parcelas inválida')
  const totalC = centavos(total)
  if (totalC <= 0) throw new Error('valor tem de ser positivo')
  const base = Math.floor(totalC / quantidade)
  const resto = totalC - base * quantidade
  return Array.from({ length: quantidade }, (_, i) => ({
    numero: i + 1,
    vencimento: somarMeses(primeiroVencimento, i),
    valor: reais(base + (i === 0 ? resto : 0)),
  }))
}

export type Situacao = 'em_dia' | 'vence_hoje' | 'vencida' | 'parcial' | 'paga' | 'cancelada'

/** O que o dono vê numa parcela. "Vencida" não é estado guardado: depende de hoje. */
export function situacaoParcela(estado: EstadoParcela, vencimento: string, hoje: string): Situacao {
  if (estado === 'paga' || estado === 'cancelada') return estado
  if (vencimento < hoje) return 'vencida'
  if (vencimento === hoje) return 'vence_hoje'
  return estado === 'parcial' ? 'parcial' : 'em_dia'
}

/** Quanto falta de uma parcela. */
export function saldoParcela(valor: number, valorPago: number): number {
  return reais(Math.max(0, centavos(valor) - centavos(valorPago)))
}

/** O que entrou ou saiu da carteira numa baixa. */
export function valorMovimentado(b: { valor: number; juros: number; multa: number; desconto: number }): number {
  return reais(centavos(b.valor) + centavos(b.juros) + centavos(b.multa) - centavos(b.desconto))
}

export type MovimentoRealizado = { tipo: TipoTitulo; data: string; valor: number }
export type ParcelaPrevista = { tipo: TipoTitulo; vencimento: string; saldo: number }

export type SemanaFluxo = {
  inicio: string
  fim: string
  entradas: number
  saidas: number
  saldoFinal: number
}

/**
 * Fluxo previsto por semana a partir de hoje: o saldo actual das carteiras,
 * mais o que vence a receber, menos o que vence a pagar. O que já venceu e
 * não foi pago entra na primeira semana (é dinheiro que ainda se espera).
 */
export function fluxoPrevisto(
  saldoAtual: number,
  abertas: readonly ParcelaPrevista[],
  hoje: string,
  semanas = 8,
): SemanaFluxo[] {
  let saldo = centavos(saldoAtual)
  const resultado: SemanaFluxo[] = []
  for (let s = 0; s < semanas; s++) {
    const inicio = somarDias(hoje, s * 7)
    const fim = somarDias(hoje, s * 7 + 6)
    let entradas = 0
    let saidas = 0
    for (const p of abertas) {
      const naSemana = s === 0 ? p.vencimento <= fim : p.vencimento >= inicio && p.vencimento <= fim
      if (!naSemana) continue
      if (p.tipo === 'receber') entradas += centavos(p.saldo)
      else saidas += centavos(p.saldo)
    }
    saldo += entradas - saidas
    resultado.push({ inicio, fim, entradas: reais(entradas), saidas: reais(saidas), saldoFinal: reais(saldo) })
  }
  return resultado
}

export type LancamentoResultado = { linha: LinhaResultado; valor: number }

export type ResultadoMes = {
  receitaBruta: number
  impostos: number
  receitaLiquida: number
  custoMercadoria: number
  margemBruta: number
  despesasVariaveis: number
  pessoal: number
  despesasFixas: number
  outrasDespesas: number
  outrasReceitas: number
  resultado: number
  /** Margem líquida em % da receita bruta; null sem receita. */
  margemPercentual: number | null
}

/** DRE gerencial do mês, por competência. */
export function resultadoDoMes(lancamentos: readonly LancamentoResultado[]): ResultadoMes {
  const soma: Record<LinhaResultado, number> = {
    receita_vendas: 0,
    outras_receitas: 0,
    impostos: 0,
    custo_mercadoria: 0,
    despesa_variavel: 0,
    pessoal: 0,
    despesa_fixa: 0,
    outras_despesas: 0,
  }
  for (const l of lancamentos) soma[l.linha] += centavos(l.valor)
  const receitaLiquida = soma.receita_vendas - soma.impostos
  const margemBruta = receitaLiquida - soma.custo_mercadoria
  const resultado =
    margemBruta - soma.despesa_variavel - soma.pessoal - soma.despesa_fixa - soma.outras_despesas + soma.outras_receitas
  return {
    receitaBruta: reais(soma.receita_vendas),
    impostos: reais(soma.impostos),
    receitaLiquida: reais(receitaLiquida),
    custoMercadoria: reais(soma.custo_mercadoria),
    margemBruta: reais(margemBruta),
    despesasVariaveis: reais(soma.despesa_variavel),
    pessoal: reais(soma.pessoal),
    despesasFixas: reais(soma.despesa_fixa),
    outrasDespesas: reais(soma.outras_despesas),
    outrasReceitas: reais(soma.outras_receitas),
    resultado: reais(resultado),
    margemPercentual: soma.receita_vendas > 0 ? Math.round((resultado / soma.receita_vendas) * 1000) / 10 : null,
  }
}
