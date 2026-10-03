import { describe, expect, it } from 'vitest'
import {
  fluxoPrevisto,
  gerarParcelas,
  resultadoDoMes,
  saldoParcela,
  situacaoParcela,
  somarMeses,
  valorMovimentado,
} from '@/lib/dominio/financeiro'
import { esquemaTitulo } from '@/lib/validacao/financeiro'
import { validar } from '@/lib/validacao/zod'

describe('parcelamento', () => {
  it('divide sem perder centavos; a sobra vai para a primeira', () => {
    const p = gerarParcelas(100, 3, '2026-10-10')
    expect(p.map((x) => x.valor)).toEqual([33.34, 33.33, 33.33])
    expect(p.map((x) => x.vencimento)).toEqual(['2026-10-10', '2026-11-10', '2026-12-10'])
  })

  it('fim de mês prende ao último dia', () => {
    expect(somarMeses('2026-01-31', 1)).toBe('2026-02-28')
    expect(somarMeses('2028-01-31', 1)).toBe('2028-02-29')
    expect(somarMeses('2026-12-15', 2)).toBe('2027-02-15')
  })

  it('recusa quantidade e valor inválidos', () => {
    expect(() => gerarParcelas(10, 0, '2026-10-10')).toThrow()
    expect(() => gerarParcelas(0, 1, '2026-10-10')).toThrow()
  })
})

describe('situação e saldos', () => {
  const hoje = '2026-10-03'
  it('vencida depende de hoje, não é guardada', () => {
    expect(situacaoParcela('aberta', '2026-10-02', hoje)).toBe('vencida')
    expect(situacaoParcela('parcial', '2026-10-01', hoje)).toBe('vencida')
    expect(situacaoParcela('aberta', hoje, hoje)).toBe('vence_hoje')
    expect(situacaoParcela('parcial', '2026-10-10', hoje)).toBe('parcial')
    expect(situacaoParcela('aberta', '2026-10-10', hoje)).toBe('em_dia')
    expect(situacaoParcela('paga', '2026-09-01', hoje)).toBe('paga')
  })

  it('saldo e valor que mexe na carteira', () => {
    expect(saldoParcela(100, 30.1)).toBe(69.9)
    expect(saldoParcela(100, 120)).toBe(0)
    expect(valorMovimentado({ valor: 100, juros: 2, multa: 2, desconto: 0.5 })).toBe(103.5)
  })
})

describe('fluxo de caixa previsto', () => {
  it('parte do saldo, soma a receber, tira a pagar; atrasados entram na primeira semana', () => {
    const fluxo = fluxoPrevisto(
      1000,
      [
        { tipo: 'pagar', vencimento: '2026-09-28', saldo: 200 },
        { tipo: 'receber', vencimento: '2026-10-05', saldo: 300 },
        { tipo: 'pagar', vencimento: '2026-10-12', saldo: 500 },
      ],
      '2026-10-03',
      3,
    )
    expect(fluxo[0]).toMatchObject({ inicio: '2026-10-03', fim: '2026-10-09', entradas: 300, saidas: 200, saldoFinal: 1100 })
    expect(fluxo[1]).toMatchObject({ entradas: 0, saidas: 500, saldoFinal: 600 })
    expect(fluxo[2]!.saldoFinal).toBe(600)
  })
})

describe('resultado do mês (DRE gerencial)', () => {
  it('monta as linhas e a margem', () => {
    const r = resultadoDoMes([
      { linha: 'receita_vendas', valor: 10000 },
      { linha: 'impostos', valor: 600 },
      { linha: 'custo_mercadoria', valor: 3500 },
      { linha: 'despesa_variavel', valor: 400 },
      { linha: 'pessoal', valor: 2500 },
      { linha: 'despesa_fixa', valor: 1800 },
      { linha: 'outras_receitas', valor: 100 },
    ])
    expect(r).toMatchObject({ receitaLiquida: 9400, margemBruta: 5900, resultado: 1300, margemPercentual: 13 })
    expect(resultadoDoMes([]).margemPercentual).toBeNull()
  })
})

describe('formulário de conta', () => {
  it('aceita valor à brasileira e exige carteira quando já pago', () => {
    const base = {
      tipo: 'pagar',
      descricao: 'Aluguel',
      categoriaId: '00000000-0000-4000-8000-000000000001',
      valor: '1.500,00',
      primeiroVencimento: '2026-10-10',
      competencia: '2026-10-01',
    }
    const ok = validar(esquemaTitulo, base)
    expect(ok.ok && ok.dados.valor).toBe(1500)
    expect(ok.ok && ok.dados.parcelas).toBe(1)
    const semCarteira = validar(esquemaTitulo, { ...base, pagoEm: '2026-10-10' })
    expect(semCarteira.ok).toBe(false)
  })
})
