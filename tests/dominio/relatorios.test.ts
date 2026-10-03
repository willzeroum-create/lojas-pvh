import { describe, expect, it } from 'vitest'
import { curvaAbc, lerIntervalo, limitesUtc, paraCsv, relatorioVendas, type VendaRelatorio } from '@/lib/dominio/relatorios'

const venda = (p: Partial<VendaRelatorio>): VendaRelatorio => ({
  id: 'v',
  criadoEm: '2026-10-01T16:00:00Z', // 12h em Porto Velho
  canal: 'balcao',
  total: 10,
  desconto: 0,
  taxaEntrega: 0,
  pagamentos: [],
  formaPedido: 'dinheiro',
  ...p,
})

describe('relatórios', () => {
  it('soma vendas por dia local, hora, canal e forma (pagamento dividido conta em cada forma)', () => {
    const r = relatorioVendas([
      venda({ total: 30, pagamentos: [{ forma: 'pix', valor: 20 }, { forma: 'dinheiro', valor: 10 }] }),
      venda({ canal: 'cardapio', total: 50, taxaEntrega: 5, formaPedido: 'pix', criadoEm: '2026-10-02T02:30:00Z' }), // 22h30 do dia 1
      venda({ total: 20, desconto: 2, criadoEm: '2026-10-02T13:00:00Z' }),
    ])
    expect(r).toMatchObject({ faturamento: 100, vendas: 3, ticketMedio: 33.33, descontos: 2, taxasEntrega: 5 })
    expect(r.porDia).toEqual([
      { dia: '2026-10-01', valor: 80, vendas: 2 },
      { dia: '2026-10-02', valor: 20, vendas: 1 },
    ])
    expect(r.porHora[12]).toEqual({ hora: 12, valor: 30, vendas: 1 })
    expect(r.porHora[22]).toEqual({ hora: 22, valor: 50, vendas: 1 })
    expect(r.porCanal.map((c) => [c.rotulo, c.valor, c.participacao])).toEqual([
      ['Balcão', 50, 50],
      ['Cardápio online', 50, 50],
    ])
    expect(r.porForma.find((f) => f.chave === 'pix')!.valor).toBe(70)
    expect(r.porForma.find((f) => f.chave === 'dinheiro')!.valor).toBe(30)
  })

  it('curva ABC agrupa o produto e classifica pelo acumulado', () => {
    const abc = curvaAbc([
      { produtoId: 'x', nome: 'X-Burger', quantidade: 10, total: 500 },
      { produtoId: 'x', nome: 'X-Burger', quantidade: 6, total: 300 },
      { produtoId: 'r', nome: 'Refri', quantidade: 20, total: 150 },
      { produtoId: null, nome: 'Bala ', quantidade: 5, total: 30 },
      { produtoId: null, nome: 'bala', quantidade: 2, total: 20 },
    ])
    expect(abc.map((l) => [l.nome, l.quantidade, l.total, l.classe])).toEqual([
      ['X-Burger', 16, 800, 'A'],
      ['Refri', 20, 150, 'B'],
      ['Bala ', 7, 50, 'C'],
    ])
    expect(abc.at(-1)!.acumulado).toBe(100)
  })

  it('intervalo: padrão de 30 dias, sem futuro e no máximo 92 dias', () => {
    expect(lerIntervalo(undefined, undefined, '2026-10-03')).toEqual({ de: '2026-09-04', ate: '2026-10-03' })
    expect(lerIntervalo('2026-01-01', '2026-12-31', '2026-10-03')).toEqual({ de: '2026-07-04', ate: '2026-10-03' })
    expect(lerIntervalo('2026-10-05', '2026-10-01', '2026-10-03')).toEqual({ de: '2026-10-01', ate: '2026-10-01' })
    expect(limitesUtc('2026-10-01', '2026-10-01')).toEqual({ desde: '2026-10-01T04:00:00.000Z', antes: '2026-10-02T04:00:00.000Z' })
  })

  it('CSV abre no Excel pt-BR e não executa fórmulas', () => {
    const csv = paraCsv(
      [
        { titulo: 'Produto', valor: (l: { n: string }) => l.n },
        { titulo: 'Total', valor: (l: { t: number }) => l.t },
      ],
      [
        { n: 'Pão; com "queijo"', t: 12.5 },
        { n: '=HYPERLINK("x")', t: 3 },
      ],
    )
    expect(csv.startsWith('﻿Produto;Total\r\n')).toBe(true)
    expect(csv).toContain('"Pão; com ""queijo""";12,5')
    expect(csv).toContain(`"'=HYPERLINK(""x"")";3`)
  })
})
