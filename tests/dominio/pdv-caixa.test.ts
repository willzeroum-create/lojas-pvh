import { describe, expect, it } from 'vitest'
import { conferir, esperadoPorForma } from '@/lib/dominio/caixa'
import { calcularVenda, eanValido, lerEtiquetaBalanca } from '@/lib/dominio/pdv'

const pao = { produtoId: 'p1', nome: 'Pão francês', quantidade: 0.35, precoUnitario: 16.9 }
const refri = { produtoId: 'p2', nome: 'Refrigerante', quantidade: 2, precoUnitario: 7.5 }

describe('venda de balcão', () => {
  it('soma itens por peso e unidade, aplica descontos e calcula troco do dinheiro', () => {
    const v = calcularVenda([pao, { ...refri, desconto: 1 }], 0.42, [{ forma: 'dinheiro', valor: 50 }])
    expect(v.ok).toBe(true)
    if (!v.ok) return
    expect(v.subtotal).toBe(20.92) // 0,35 × 16,90 = 5,915 → 5,92 ; 2 × 7,50 = 15
    expect(v.desconto).toBe(1.42)
    expect(v.total).toBe(19.5)
    expect(v.troco).toBe(30.5)
    expect(v.pagamentos).toEqual([{ forma: 'dinheiro', valor: 50, troco: 30.5 }])
  })

  it('pagamento dividido: o troco sai só do dinheiro', () => {
    const v = calcularVenda([refri], 0, [
      { forma: 'pix', valor: 10 },
      { forma: 'dinheiro', valor: 10 },
    ])
    expect(v.ok && v.pagamentos).toEqual([
      { forma: 'pix', valor: 10, troco: 0 },
      { forma: 'dinheiro', valor: 10, troco: 5 },
    ])
  })

  it('recusa falta de pagamento, troco sem dinheiro e desconto maior que a venda', () => {
    expect(calcularVenda([refri], 0, [{ forma: 'pix', valor: 10 }])).toEqual({ ok: false, erro: 'Falta receber.', falta: 5 })
    expect(calcularVenda([refri], 0, [{ forma: 'cartao_debito', valor: 20 }]).ok).toBe(false)
    expect(calcularVenda([refri], 16, [{ forma: 'pix', valor: 1 }]).ok).toBe(false)
    expect(calcularVenda([], 0, [{ forma: 'pix', valor: 1 }]).ok).toBe(false)
  })
})

describe('etiqueta da balança', () => {
  it('confere o dígito EAN', () => {
    expect(eanValido('7891000315507')).toBe(true)
    expect(eanValido('7891000315508')).toBe(false)
  })

  it('lê código do produto e preço ou peso', () => {
    const comDv = (doze: string) => {
      const d = doze.split('').map(Number).reverse()
      const soma = d.reduce((s, x, i) => s + x * (i % 2 === 0 ? 3 : 1), 0)
      return doze + ((10 - (soma % 10)) % 10)
    }
    // 2 + código de 5 dígitos (01230) + valor de 6 dígitos (001590) + DV
    const codigo = comDv('201230001590')
    expect(lerEtiquetaBalanca(codigo, { digitosCodigo: 5, tipo: 'preco' })).toEqual({ codigoProduto: '01230', tipo: 'preco', valor: 15.9 })
    expect(lerEtiquetaBalanca(codigo, { digitosCodigo: 5, tipo: 'peso' })).toEqual({ codigoProduto: '01230', tipo: 'peso', valor: 1.59 })
    // Com código de 4 dígitos o valor ocupa 7 posições.
    expect(lerEtiquetaBalanca(codigo, { digitosCodigo: 4, tipo: 'preco' })).toEqual({ codigoProduto: '0123', tipo: 'preco', valor: 15.9 })
    expect(lerEtiquetaBalanca('7891000315507', { digitosCodigo: 4, tipo: 'preco' })).toBeNull()
  })
})

describe('caixa', () => {
  it('esperado por forma e conferência cega', () => {
    const esperado = esperadoPorForma(100, [
      { tipo: 'venda', forma: 'dinheiro', valor: 50 },
      { tipo: 'venda', forma: 'pix', valor: 30 },
      { tipo: 'sangria', forma: 'dinheiro', valor: 80 },
      { tipo: 'suprimento', forma: 'dinheiro', valor: 20 },
      { tipo: 'estorno', forma: 'pix', valor: 10 },
    ])
    expect(esperado).toMatchObject({ dinheiro: 90, pix: 20, cartao_debito: 0 })
    const c = conferir(esperado, { dinheiro: 88, pix: 20 })
    expect(c.bate).toBe(false)
    expect(c.diferencaTotal).toBe(-2)
    expect(c.linhas).toEqual([
      { forma: 'dinheiro', esperado: 90, informado: 88, diferenca: -2 },
      { forma: 'pix', esperado: 20, informado: 20, diferenca: 0 },
    ])
  })
})
