/**
 * Períodos para as listas da holding: hoje, ontem, últimos 7 dias, sempre no
 * fuso indicado. Puro: recebe `agora`.
 */
import { chaveDia } from './resumo'

export const PERIODOS = ['hoje', 'ontem', '7d'] as const
export type Periodo = (typeof PERIODOS)[number]

export const ROTULO_PERIODO: Record<Periodo, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7d': 'Últimos 7 dias',
}

export function periodoValido(valor: unknown): Periodo {
  return PERIODOS.includes(valor as Periodo) ? (valor as Periodo) : 'hoje'
}

const DIA_MS = 24 * 60 * 60 * 1000

/** Os dias locais (chaves "AAAA-MM-DD") que o período abrange. */
export function diasDoPeriodo(periodo: Periodo, agora: Date, fuso: string): Set<string> {
  if (periodo === 'hoje') return new Set([chaveDia(agora, fuso)])
  if (periodo === 'ontem') return new Set([chaveDia(new Date(agora.getTime() - DIA_MS), fuso)])
  return new Set(Array.from({ length: 7 }, (_, i) => chaveDia(new Date(agora.getTime() - i * DIA_MS), fuso)))
}

/** Instante a partir do qual vale a pena ler da base para cobrir o período (com folga de um dia). */
export function lerDesde(periodo: Periodo, agora: Date): Date {
  const dias = periodo === '7d' ? 8 : 2
  return new Date(agora.getTime() - dias * DIA_MS)
}

export function pertenceAoPeriodo(criadoEm: string, periodo: Periodo, agora: Date, fuso: string): boolean {
  return diasDoPeriodo(periodo, agora, fuso).has(chaveDia(new Date(criadoEm), fuso))
}
