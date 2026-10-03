/**
 * Caixa: quanto deve haver em cada forma de pagamento e a conferência do
 * fechamento cego. Lógica pura.
 */
import type { FormaRecebimento } from './pdv'

export const FORMAS_RECEBIMENTO: readonly FormaRecebimento[] = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'outro']

export const ROTULO_FORMA: Record<FormaRecebimento, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito',
  outro: 'Outro',
}

export type TipoMovimento = 'venda' | 'suprimento' | 'sangria' | 'estorno'
export type MovimentoCaixa = { tipo: TipoMovimento; forma: FormaRecebimento; valor: number }

const c = (v: number) => Math.round(v * 100)

/** Esperado por forma: fundo de troco em dinheiro + vendas + suprimentos − sangrias − estornos. */
export function esperadoPorForma(fundoTroco: number, movimentos: readonly MovimentoCaixa[]): Record<FormaRecebimento, number> {
  const soma: Record<FormaRecebimento, number> = { dinheiro: c(fundoTroco), pix: 0, cartao_debito: 0, cartao_credito: 0, outro: 0 }
  for (const m of movimentos) {
    const sinal = m.tipo === 'venda' || m.tipo === 'suprimento' ? 1 : -1
    soma[m.forma] += sinal * c(m.valor)
  }
  return Object.fromEntries(Object.entries(soma).map(([k, v]) => [k, v / 100])) as Record<FormaRecebimento, number>
}

export type LinhaConferencia = { forma: FormaRecebimento; esperado: number; informado: number; diferenca: number }

/**
 * Conferência do fechamento: para cada forma com movimento ou informada, a
 * diferença entre o contado e o esperado (positivo = sobra, negativo = falta).
 */
export function conferir(
  esperado: Record<FormaRecebimento, number>,
  informado: Partial<Record<FormaRecebimento, number>>,
): { linhas: LinhaConferencia[]; diferencaTotal: number; bate: boolean } {
  const linhas = FORMAS_RECEBIMENTO.filter((f) => esperado[f] !== 0 || (informado[f] ?? 0) !== 0).map((forma) => {
    const e = c(esperado[forma])
    const i = c(informado[forma] ?? 0)
    return { forma, esperado: e / 100, informado: i / 100, diferenca: (i - e) / 100 }
  })
  const diferencaTotal = linhas.reduce((s, l) => s + c(l.diferenca), 0) / 100
  return { linhas, diferencaTotal, bate: linhas.every((l) => l.diferenca === 0) }
}
