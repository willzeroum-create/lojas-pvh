import { describe, expect, it } from 'vitest'
import { diasDoPeriodo, lerDesde, periodoValido, pertenceAoPeriodo } from '@/lib/dominio/periodo'

const FUSO = 'America/Sao_Paulo'
const agora = new Date('2026-09-02T23:30:00-03:00') // quarta à noite em São Paulo

describe('periodo', () => {
  it('valida o valor da querystring com "hoje" por defeito', () => {
    expect(periodoValido('ontem')).toBe('ontem')
    expect(periodoValido('7d')).toBe('7d')
    expect(periodoValido('x')).toBe('hoje')
    expect(periodoValido(undefined)).toBe('hoje')
  })

  it('calcula os dias no fuso da loja', () => {
    expect([...diasDoPeriodo('hoje', agora, FUSO)]).toEqual(['2026-09-02'])
    expect([...diasDoPeriodo('ontem', agora, FUSO)]).toEqual(['2026-09-01'])
    expect(diasDoPeriodo('7d', agora, FUSO).size).toBe(7)
    expect(diasDoPeriodo('7d', agora, FUSO).has('2026-08-27')).toBe(true)
    expect(diasDoPeriodo('7d', agora, FUSO).has('2026-08-26')).toBe(false)
  })

  it('um pedido às 23:30 de São Paulo é de hoje, mesmo sendo já amanhã em UTC', () => {
    expect(pertenceAoPeriodo('2026-09-03T02:30:00Z', 'hoje', agora, FUSO)).toBe(true)
    expect(pertenceAoPeriodo('2026-09-02T02:30:00Z', 'hoje', agora, FUSO)).toBe(false)
    expect(pertenceAoPeriodo('2026-09-02T02:30:00Z', 'ontem', agora, FUSO)).toBe(true)
  })

  it('lê da base com folga de um dia', () => {
    expect(lerDesde('hoje', agora).toISOString()).toBe('2026-09-01T02:30:00.000Z')
    expect(lerDesde('7d', agora).toISOString()).toBe('2026-08-26T02:30:00.000Z')
  })
})
