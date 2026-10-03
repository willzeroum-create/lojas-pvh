import type { Resultado } from '../../actions'

/** Campos monetários aceitam vírgula ou ponto, sem arredondar uma entrada inválida. */
export function lerNumero(texto: string, casas = 2): number {
  const valor = texto.trim()
  if (!valor) return 0
  if (!new RegExp(`^\\d+(?:[.,]\\d{0,${casas}})?$`).test(valor)) return NaN
  const numero = Number(valor.replace(',', '.'))
  return Number.isSafeInteger(Math.round(numero * 10 ** casas)) ? numero : NaN
}

export const escreverNumero = (valor: number, casas = 2) => valor.toFixed(casas).replace('.', ',')

export type ExecutarComanda = (
  acao: () => Promise<Resultado>,
  mensagem: string,
  depois?: () => void,
) => Promise<boolean>
