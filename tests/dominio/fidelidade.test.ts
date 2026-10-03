import { describe, expect, it } from 'vitest'
import { CONFIG_CASHBACK_PADRAO, creditoDaCompra, resgatePossivel, saldoCashback } from '@/lib/dominio/fidelidade'

const cfg = { ...CONFIG_CASHBACK_PADRAO, ativo: true }

describe('cashback', () => {
  it('crédito da compra sem a taxa de entrega, arredondado para baixo', () => {
    expect(creditoDaCompra(cfg, 47.9, 5)).toBe(2.14) // 5 % de 42,90 = 2,145
    expect(creditoDaCompra({ ...cfg, ativo: false }, 100)).toBe(0)
  })

  it('o resgate gasta primeiro o que vence antes; o vencido some', () => {
    const movs = [
      { tipo: 'credito' as const, valor: 10, em: '2026-07-01', expiraEm: '2026-10-01' },
      { tipo: 'credito' as const, valor: 8, em: '2026-09-01', expiraEm: '2026-12-01' },
      { tipo: 'resgate' as const, valor: -6, em: '2026-09-10' },
    ]
    expect(saldoCashback(movs, '2026-09-15')).toEqual({ saldo: 12, aVencer30: 4, proximoVencimento: '2026-10-01' })
    expect(saldoCashback(movs, '2026-10-02')).toEqual({ saldo: 8, aVencer30: 0, proximoVencimento: '2026-12-01' })
  })

  it('um resgate depois do vencimento não usa o crédito vencido', () => {
    const movs = [
      { tipo: 'credito' as const, valor: 10, em: '2026-07-01', expiraEm: '2026-08-01' },
      { tipo: 'credito' as const, valor: 8, em: '2026-09-01', expiraEm: '2026-12-01' },
      { tipo: 'resgate' as const, valor: -6, em: '2026-09-10' },
    ]
    expect(saldoCashback(movs, '2026-09-15').saldo).toBe(2)
  })

  it('ajuste positivo não vence; estorno desconta; devolução volta', () => {
    const s = saldoCashback(
      [
        { tipo: 'ajuste', valor: 3, em: '2026-09-01' },
        { tipo: 'credito', valor: 5, em: '2026-09-02', expiraEm: '2026-11-01' },
        { tipo: 'estorno', valor: -5, em: '2026-09-03' },
        { tipo: 'resgate', valor: -2, em: '2026-09-04' },
        { tipo: 'devolucao', valor: 2, em: '2026-09-05', expiraEm: '2026-12-04' },
      ],
      '2026-10-03',
    )
    expect(s).toEqual({ saldo: 3, aVencer30: 0, proximoVencimento: '2026-12-04' })
  })

  it('resgate respeita o mínimo e o limite da compra', () => {
    expect(resgatePossivel(cfg, 4, 100)).toBe(0) // abaixo do mínimo de 5
    expect(resgatePossivel(cfg, 30, 40)).toBe(20) // até 50 % da compra
    expect(resgatePossivel(cfg, 12, 100)).toBe(12)
  })
})
