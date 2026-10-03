/**
 * Ficha técnica: o custo real de um produto a partir dos insumos, a margem e
 * o preço sugerido. "O número que o comerciante nunca sabe." Lógica pura.
 */

export type LinhaFicha = { insumo: string; quantidade: number; custoUnitario: number }

export type CustoProduto = {
  custo: number
  linhas: Array<LinhaFicha & { custo: number; participacao: number }>
}

const c = (v: number) => Math.round(v * 100)

/** Custo do produto: soma de quantidade × custo médio de cada insumo; participação de cada um em %. */
export function custoFicha(linhas: readonly LinhaFicha[]): CustoProduto {
  const comCusto = linhas.map((l) => ({ ...l, custoExato: l.quantidade * l.custoUnitario }))
  const total = comCusto.reduce((s, l) => s + l.custoExato, 0)
  return {
    custo: Math.round(total * 100) / 100,
    linhas: comCusto.map(({ custoExato, ...l }) => ({
      ...l,
      custo: Math.round(custoExato * 100) / 100,
      participacao: total > 0 ? Math.round((custoExato / total) * 1000) / 10 : 0,
    })),
  }
}

export type Margem = {
  /** Custo em % do preço (CMV). */
  cmvPercentual: number | null
  lucroBruto: number
  margemPercentual: number | null
  situacao: 'sem_preco' | 'prejuizo' | 'apertada' | 'saudavel'
}

/**
 * Margem sobre o preço de venda. "Apertada" abaixo de `alvo` (por defeito 60%
 * de margem bruta, ou seja, CMV de 40%), que é a referência comum em comida.
 */
export function margem(preco: number, custo: number, alvo = 60): Margem {
  if (!(preco > 0)) return { cmvPercentual: null, lucroBruto: 0, margemPercentual: null, situacao: 'sem_preco' }
  const lucro = (c(preco) - c(custo)) / 100
  const margemPct = Math.round((lucro / preco) * 1000) / 10
  return {
    cmvPercentual: Math.round((custo / preco) * 1000) / 10,
    lucroBruto: lucro,
    margemPercentual: margemPct,
    situacao: lucro < 0 ? 'prejuizo' : margemPct < alvo ? 'apertada' : 'saudavel',
  }
}

/** Preço para atingir um CMV alvo (ex.: 35%), arredondado para cima aos 10 centavos. */
export function precoSugerido(custo: number, cmvAlvoPercentual: number): number | null {
  if (!(custo > 0) || !(cmvAlvoPercentual > 0 && cmvAlvoPercentual < 100)) return null
  const bruto = custo / (cmvAlvoPercentual / 100)
  return Math.ceil(bruto * 10 - 1e-9) / 10
}
