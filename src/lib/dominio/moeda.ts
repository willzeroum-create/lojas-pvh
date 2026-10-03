/**
 * Dinheiro em reais. Valores circulam como `number` com duas casas; toda a
 * soma passa por `arredondar` para não acumular erros de vírgula flutuante.
 */

export function arredondar(valor: number): number {
  return Math.round((valor + Number.EPSILON) * 100) / 100
}

const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** "R$ 18,00". Usa espaço normal em vez do espaço inquebrável do Intl, para caber em mensagens de WhatsApp. */
export function formatarBRL(valor: number): string {
  return formatador.format(valor).replace(/ /g, ' ')
}

/** Aceita "18", "18,5", "18.50", "R$ 1.234,56" e devolve o número, ou null se não for um valor. */
export function interpretarBRL(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.-]/g, '').trim()
  if (!limpo) return null
  // Se a última separação for vírgula, é decimal brasileiro: tira os pontos de milhar.
  const normalizado =
    limpo.lastIndexOf(',') > limpo.lastIndexOf('.')
      ? limpo.replace(/\./g, '').replace(',', '.')
      : limpo.replace(/,/g, '')
  const n = Number(normalizado)
  return Number.isFinite(n) && n >= 0 ? arredondar(n) : null
}
