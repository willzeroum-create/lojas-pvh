import { describe, expect, it } from 'vitest'
import {
  agruparJornadas,
  batidasPossiveis,
  calcularJornada,
  diaLocal,
  espelhoDePonto,
  formatarMinutos,
  minutosNoturnos,
  type Batida,
} from '@/lib/dominio/ponto'

// Porto Velho é UTC−4: 08:00 local = 12:00Z.
const b = (tipo: Batida['tipo'], local: string): Batida => ({ tipo, momento: new Date(`${local}-04:00`).toISOString() })

describe('ponto', () => {
  it('sugere a próxima batida', () => {
    expect(batidasPossiveis(null)).toEqual(['entrada'])
    expect(batidasPossiveis('saida')).toEqual(['entrada'])
    expect(batidasPossiveis('entrada')[0]).toBe('saida_intervalo')
    expect(batidasPossiveis('entrada', true)[0]).toBe('saida')
    expect(batidasPossiveis('saida_intervalo')).toEqual(['volta_intervalo'])
  })

  it('dia comum: 8 h de trabalho com 1 h de almoço, dentro da tolerância', () => {
    const [j] = agruparJornadas([
      b('entrada', '2026-10-01T08:00'),
      b('saida_intervalo', '2026-10-01T12:00'),
      b('volta_intervalo', '2026-10-01T13:00'),
      b('saida', '2026-10-01T17:05'),
    ])
    const c = calcularJornada(j!, 480)
    expect(c).toMatchObject({ dia: '2026-10-01', trabalhadoMin: 485, intervaloMin: 60, noturnoMin: 0, saldoMin: 0, emAndamento: false, inconsistencias: [] })
  })

  it('turno da noite atravessa a meia-noite e conta como do dia em que começou', () => {
    const [j] = agruparJornadas([b('entrada', '2026-10-01T18:00'), b('saida_intervalo', '2026-10-01T21:00'), b('volta_intervalo', '2026-10-01T21:15'), b('saida', '2026-10-02T02:00')])
    const c = calcularJornada(j!, 420)
    expect(c.dia).toBe('2026-10-01')
    expect(c.trabalhadoMin).toBe(465)
    expect(c.noturnoMin).toBe(240) // 22h → 2h
    expect(c.noturnoFictoMin).toBe(274) // 240 × 60 / 52,5
    expect(c.saldoMin).toBe(45)
    expect(c.inconsistencias).toEqual(['Intervalo menor que 1 hora'])
  })

  it('minutos noturnos só entre 22 h e 5 h locais', () => {
    expect(minutosNoturnos(new Date('2026-10-01T04:00:00-04:00'), new Date('2026-10-01T06:00:00-04:00'))).toBe(60)
    expect(minutosNoturnos(new Date('2026-10-01T10:00:00-04:00'), new Date('2026-10-01T18:00:00-04:00'))).toBe(0)
    expect(minutosNoturnos(new Date('2026-10-01T21:00:00-04:00'), new Date('2026-10-02T07:00:00-04:00'))).toBe(420)
  })

  it('jornada aberta: em andamento conta até agora; esquecida vira inconsistência', () => {
    const [j] = agruparJornadas([b('entrada', '2026-10-01T08:00')])
    const agora = new Date('2026-10-01T10:30:00-04:00')
    expect(calcularJornada(j!, 480, agora)).toMatchObject({ emAndamento: true, trabalhadoMin: 150, saldoMin: 0, inconsistencias: [] })
    const depois = new Date('2026-10-02T09:00:00-04:00')
    expect(calcularJornada(j!, 480, depois).inconsistencias).toEqual(['Jornada sem saída registada'])
  })

  it('marcação fora de ordem e excesso de horas extras', () => {
    const [j] = agruparJornadas([b('saida_intervalo', '2026-10-01T12:00'), b('saida', '2026-10-01T13:00')])
    expect(calcularJornada(j!, 480).inconsistencias).toContain('Marcações fora de ordem')
    const [longa] = agruparJornadas([b('entrada', '2026-10-01T06:00'), b('saida_intervalo', '2026-10-01T12:00'), b('volta_intervalo', '2026-10-01T13:00'), b('saida', '2026-10-01T18:00')])
    expect(calcularJornada(longa!, 480).inconsistencias).toEqual(['Mais de 2 horas extras no dia'])
  })

  it('espelho soma os dias e conta dias trabalhados', () => {
    const e = espelhoDePonto(
      [
        b('entrada', '2026-10-01T08:00'),
        b('saida', '2026-10-01T12:00'),
        b('entrada', '2026-10-02T08:00'),
        b('saida', '2026-10-02T11:00'),
      ],
      240,
    )
    expect(e.totais).toMatchObject({ trabalhadoMin: 420, saldoMin: -60, diasTrabalhados: 2, inconsistencias: 0 })
    expect(diaLocal('2026-10-02T03:00:00Z')).toBe('2026-10-01')
    expect(formatarMinutos(440)).toBe('7h20')
    expect(formatarMinutos(-15)).toBe('−0h15')
  })
})
