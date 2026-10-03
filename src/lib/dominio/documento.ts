/**
 * CPF e CNPJ: só dígitos na base, dígitos verificadores conferidos aqui.
 */
import { apenasDigitos } from './telefone'

function todosIguais(digitos: string): boolean {
  return /^(\d)\1+$/.test(digitos)
}

function digitoVerificador(base: string, pesos: number[]): number {
  const soma = pesos.reduce((total, peso, i) => total + Number(base[i]) * peso, 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

export function cpfValido(entrada: string): boolean {
  const d = apenasDigitos(entrada)
  if (d.length !== 11 || todosIguais(d)) return false
  const d1 = digitoVerificador(d, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = digitoVerificador(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === Number(d[9]) && d2 === Number(d[10])
}

export function cnpjValido(entrada: string): boolean {
  const d = apenasDigitos(entrada)
  if (d.length !== 14 || todosIguais(d)) return false
  const d1 = digitoVerificador(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = digitoVerificador(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === Number(d[12]) && d2 === Number(d[13])
}

export type Documento = { tipo: 'pf' | 'pj'; digitos: string }

/** CPF ou CNPJ válido, com ou sem máscara; null se não for nenhum dos dois. */
export function lerDocumento(entrada: string): Documento | null {
  const d = apenasDigitos(entrada)
  if (d.length === 11) return cpfValido(d) ? { tipo: 'pf', digitos: d } : null
  if (d.length === 14) return cnpjValido(d) ? { tipo: 'pj', digitos: d } : null
  return null
}

/** "123.456.789-09" ou "12.345.678/0001-95". */
export function formatarDocumento(digitos: string): string {
  const d = apenasDigitos(digitos)
  if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  return digitos
}

/** CEP só com dígitos (8); null se inválido. */
export function lerCep(entrada: string): string | null {
  const d = apenasDigitos(entrada)
  return d.length === 8 ? d : null
}
