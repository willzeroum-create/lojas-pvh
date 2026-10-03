/**
 * CPF e CNPJ, sem máscara na base, com os dígitos verificadores conferidos
 * aqui. Desde julho de 2026 a Receita emite CNPJ alfanumérico: 12 posições de
 * letras ou números mais 2 dígitos verificadores (ex.: 12.ABC.345/01DE-35).
 * O cálculo é o mesmo do numérico, com cada caractere a valer o código ASCII
 * menos 48 (0–9 → 0–9, A → 17 … Z → 42).
 */
import { apenasDigitos } from './telefone'

/** Maiúsculas, só letras e números. */
export function normalizarDocumento(entrada: string): string {
  return entrada.toUpperCase().replace(/[^0-9A-Z]/g, '')
}

function todosIguais(texto: string): boolean {
  return /^(.)\1+$/.test(texto)
}

const valor = (c: string) => c.charCodeAt(0) - 48

function digitoVerificador(base: string, pesos: number[]): number {
  const soma = pesos.reduce((total, peso, i) => total + valor(base[i]!) * peso, 0)
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

/** CNPJ numérico ou alfanumérico. */
export function cnpjValido(entrada: string): boolean {
  const c = normalizarDocumento(entrada)
  if (!/^[0-9A-Z]{12}[0-9]{2}$/.test(c) || todosIguais(c)) return false
  const d1 = digitoVerificador(c, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const d2 = digitoVerificador(c, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return d1 === Number(c[12]) && d2 === Number(c[13])
}

export type Documento = { tipo: 'pf' | 'pj'; digitos: string }

/** CPF ou CNPJ válido, com ou sem máscara; null se não for nenhum dos dois. */
export function lerDocumento(entrada: string): Documento | null {
  const c = normalizarDocumento(entrada)
  if (/^[0-9]{11}$/.test(c)) return cpfValido(c) ? { tipo: 'pf', digitos: c } : null
  if (c.length === 14) return cnpjValido(c) ? { tipo: 'pj', digitos: c } : null
  return null
}

/** "123.456.789-09", "12.345.678/0001-95" ou "12.ABC.345/01DE-35". */
export function formatarDocumento(documento: string): string {
  const c = normalizarDocumento(documento)
  if (/^[0-9]{11}$/.test(c)) return c.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
  if (c.length === 14) return c.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, '$1.$2.$3/$4-$5')
  return documento
}

/** CEP só com dígitos (8); null se inválido. */
export function lerCep(entrada: string): string | null {
  const d = apenasDigitos(entrada)
  return d.length === 8 ? d : null
}
