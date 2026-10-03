import { describe, expect, it } from 'vitest'
import {
  estadoLoja,
  fimDoDiaLocal,
  horariosPorDia,
  momentoLocal,
  type IntervaloHorario,
} from '@/lib/dominio/horario'

const FUSO = 'America/Sao_Paulo' // UTC-3, sem horário de verão desde 2019

/** Constrói um instante UTC a partir de uma hora local de São Paulo. */
function saoPaulo(iso: string): Date {
  return new Date(`${iso}:00-03:00`)
}

const HORARIOS: IntervaloHorario[] = [
  { dia: 1, abre: '17:00', fecha: '23:30' }, // segunda
  { dia: 5, abre: '17:00', fecha: '01:00' }, // sexta, atravessa a meia-noite
  { dia: 6, abre: '11:00', fecha: '15:00' }, // sábado, almoço
  { dia: 6, abre: '18:00', fecha: '23:00' }, // sábado, jantar
]

const base = { horarios: HORARIOS, fechada_ate: null, fuso_horario: FUSO }

describe('momentoLocal', () => {
  it('converte para o dia e minutos do fuso da loja', () => {
    // 2026-09-07 é segunda-feira. 02:00 UTC = 23:00 de domingo em São Paulo.
    expect(momentoLocal(new Date('2026-09-07T02:00:00Z'), FUSO)).toEqual({ dia: 0, minutos: 23 * 60 })
    expect(momentoLocal(new Date('2026-09-07T03:00:00Z'), FUSO)).toEqual({ dia: 1, minutos: 0 })
  })
})

describe('estadoLoja', () => {
  it('está aberta dentro do horário do dia', () => {
    expect(estadoLoja(base, saoPaulo('2026-09-07T18:00'))).toEqual({ aberta: true, fechaAs: '23:30' })
  })

  it('está fechada antes de abrir e diz quando abre hoje', () => {
    expect(estadoLoja(base, saoPaulo('2026-09-07T10:00'))).toEqual({
      aberta: false,
      motivo: 'fora_do_horario',
      abreAs: 'hoje às 17:00',
    })
  })

  it('fecha exactamente à hora de fecho', () => {
    expect(estadoLoja(base, saoPaulo('2026-09-07T23:29')).aberta).toBe(true)
    expect(estadoLoja(base, saoPaulo('2026-09-07T23:30')).aberta).toBe(false)
  })

  it('continua aberta depois da meia-noite quando o intervalo atravessa o dia', () => {
    // sábado 00:30 ainda é a sexta que abriu às 17:00 e fecha à 01:00
    expect(estadoLoja(base, saoPaulo('2026-09-12T00:30'))).toEqual({ aberta: true, fechaAs: '01:00' })
    expect(estadoLoja(base, saoPaulo('2026-09-12T01:00')).aberta).toBe(false)
  })

  it('suporta dois intervalos no mesmo dia', () => {
    expect(estadoLoja(base, saoPaulo('2026-09-12T12:00')).aberta).toBe(true)
    expect(estadoLoja(base, saoPaulo('2026-09-12T16:00'))).toEqual({
      aberta: false,
      motivo: 'fora_do_horario',
      abreAs: 'hoje às 18:00',
    })
    expect(estadoLoja(base, saoPaulo('2026-09-12T19:00')).aberta).toBe(true)
  })

  it('indica "amanhã" e o nome do dia quando a próxima abertura é mais à frente', () => {
    // domingo 2026-09-13 → abre segunda
    expect(estadoLoja(base, saoPaulo('2026-09-13T12:00'))).toMatchObject({
      aberta: false,
      abreAs: 'amanhã às 17:00',
    })
    // terça 2026-09-08 → abre sexta
    expect(estadoLoja(base, saoPaulo('2026-09-08T12:00'))).toMatchObject({
      aberta: false,
      abreAs: 'sexta às 17:00',
    })
  })

  it('dá a volta à semana: sábado à noite depois do fecho aponta para segunda', () => {
    expect(estadoLoja(base, saoPaulo('2026-09-12T23:30'))).toMatchObject({
      aberta: false,
      abreAs: 'segunda às 17:00',
    })
  })

  it('"Fechar loja agora" vence o horário', () => {
    const fechada = { ...base, fechada_ate: saoPaulo('2026-09-07T23:59').toISOString() }
    expect(estadoLoja(fechada, saoPaulo('2026-09-07T18:00'))).toEqual({
      aberta: false,
      motivo: 'fechada_manualmente',
      abreAs: null,
    })
    // depois de passar a hora, volta ao horário normal
    expect(estadoLoja(fechada, saoPaulo('2026-09-14T18:00')).aberta).toBe(true)
  })

  it('sem horários definidos fica fechada e diz porquê', () => {
    expect(estadoLoja({ ...base, horarios: [] }, saoPaulo('2026-09-07T18:00'))).toEqual({
      aberta: false,
      motivo: 'sem_horario',
      abreAs: null,
    })
  })

  it('respeita o fuso da loja (Manaus está uma hora atrás)', () => {
    const manaus = { ...base, fuso_horario: 'America/Manaus' }
    // 16:30 em Manaus = 17:30 em São Paulo: fechada em Manaus, aberta em SP
    const instante = new Date('2026-09-07T20:30:00Z')
    expect(estadoLoja(manaus, instante).aberta).toBe(false)
    expect(estadoLoja(base, instante).aberta).toBe(true)
  })
})

describe('fimDoDiaLocal', () => {
  it('devolve 23:59:59 do dia local', () => {
    const fim = fimDoDiaLocal(saoPaulo('2026-09-07T18:00'), FUSO)
    expect(fim.toISOString()).toBe('2026-09-08T02:59:59.000Z')
  })
})

describe('horariosPorDia', () => {
  it('agrupa e ordena os intervalos por dia', () => {
    const tabela = horariosPorDia(HORARIOS)
    expect(tabela[6]).toEqual({ dia: 6, nome: 'sábado', intervalos: ['11:00 – 15:00', '18:00 – 23:00'] })
    expect(tabela[0]!.intervalos).toEqual([])
  })
})
