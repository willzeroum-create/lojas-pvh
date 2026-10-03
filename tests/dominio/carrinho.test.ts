import { describe, expect, it } from 'vitest'
import {
  calcularItem,
  calcularPedido,
  chaveItem,
  type ProdutoCatalogo,
  type RegrasLoja,
} from '@/lib/dominio/carrinho'

const xSalada: ProdutoCatalogo = {
  id: 'p1',
  nome: 'X-Salada',
  preco: 18,
  preco_promocional: null,
  disponivel: true,
  grupos: [
    {
      id: 'g1',
      nome: 'Ponto da carne',
      min: 1,
      max: 1,
      obrigatorio: true,
      opcoes: [
        { id: 'o1', nome: 'Ao ponto', preco_adicional: 0, disponivel: true },
        { id: 'o2', nome: 'Bem passado', preco_adicional: 0, disponivel: true },
      ],
    },
    {
      id: 'g2',
      nome: 'Adicionais',
      min: 0,
      max: 2,
      obrigatorio: false,
      opcoes: [
        { id: 'o3', nome: 'Bacon', preco_adicional: 4, disponivel: true },
        { id: 'o4', nome: 'Ovo', preco_adicional: 2.5, disponivel: true },
        { id: 'o5', nome: 'Queijo extra', preco_adicional: 3, disponivel: false },
      ],
    },
  ],
}

const refrigerante: ProdutoCatalogo = {
  id: 'p2',
  nome: 'Refrigerante',
  preco: 6,
  preco_promocional: 4.9,
  disponivel: true,
  grupos: [],
}

const esgotado: ProdutoCatalogo = { ...refrigerante, id: 'p3', nome: 'Suco', disponivel: false }

const catalogo = [xSalada, refrigerante, esgotado]
const regras: RegrasLoja = { taxaEntrega: 5, pedidoMinimo: 15, aceitaEntrega: true, aceitaRetirada: true }

describe('calcularItem', () => {
  it('soma adicionais ao preço e multiplica pela quantidade', () => {
    const r = calcularItem({ produtoId: 'p1', quantidade: 2, opcoesIds: ['o1', 'o3', 'o4'] }, xSalada)
    expect(r).toEqual({
      ok: true,
      item: {
        produtoId: 'p1',
        nome: 'X-Salada',
        quantidade: 2,
        precoUnitario: 24.5,
        opcoes: [
          { grupo: 'Ponto da carne', nome: 'Ao ponto', preco_adicional: 0 },
          { grupo: 'Adicionais', nome: 'Bacon', preco_adicional: 4 },
          { grupo: 'Adicionais', nome: 'Ovo', preco_adicional: 2.5 },
        ],
        observacao: undefined,
        total: 49,
      },
    })
  })

  it('usa o preço promocional quando existe', () => {
    const r = calcularItem({ produtoId: 'p2', quantidade: 3, opcoesIds: [] }, refrigerante)
    expect(r.ok && r.item.total).toBe(14.7)
  })

  it('exige os grupos obrigatórios', () => {
    const r = calcularItem({ produtoId: 'p1', quantidade: 1, opcoesIds: [] }, xSalada)
    expect(r).toEqual({ ok: false, erro: 'Escolha uma opção em "Ponto da carne" (X-Salada).' })
  })

  it('respeita o máximo do grupo', () => {
    const r = calcularItem({ produtoId: 'p1', quantidade: 1, opcoesIds: ['o1', 'o2'] }, xSalada)
    expect(r).toEqual({ ok: false, erro: '"Ponto da carne" aceita no máximo 1 opção (X-Salada).' })
  })

  it('rejeita opções esgotadas, desconhecidas e produtos esgotados', () => {
    expect(calcularItem({ produtoId: 'p1', quantidade: 1, opcoesIds: ['o1', 'o5'] }, xSalada)).toMatchObject({
      ok: false,
      erro: '"Queijo extra" está esgotado em "X-Salada".',
    })
    expect(calcularItem({ produtoId: 'p1', quantidade: 1, opcoesIds: ['o1', 'zzz'] }, xSalada)).toMatchObject(
      {
        ok: false,
        erro: 'Opção desconhecida em "X-Salada".',
      },
    )
    expect(calcularItem({ produtoId: 'p3', quantidade: 1, opcoesIds: [] }, esgotado)).toMatchObject({
      ok: false,
      erro: '"Suco" está esgotado.',
    })
    expect(calcularItem({ produtoId: 'x', quantidade: 1, opcoesIds: [] }, undefined).ok).toBe(false)
  })

  it('rejeita quantidades inválidas', () => {
    expect(calcularItem({ produtoId: 'p2', quantidade: 0, opcoesIds: [] }, refrigerante).ok).toBe(false)
    expect(calcularItem({ produtoId: 'p2', quantidade: 1.5, opcoesIds: [] }, refrigerante).ok).toBe(false)
    expect(calcularItem({ produtoId: 'p2', quantidade: 100, opcoesIds: [] }, refrigerante).ok).toBe(false)
  })
})

describe('calcularPedido', () => {
  it('calcula subtotal, taxa de entrega e total', () => {
    const r = calcularPedido(
      [
        { produtoId: 'p1', quantidade: 1, opcoesIds: ['o2'], observacao: ' sem cebola ' },
        { produtoId: 'p2', quantidade: 2, opcoesIds: [] },
      ],
      catalogo,
      regras,
      'entrega',
    )
    expect(r).toMatchObject({ ok: true, subtotal: 27.8, taxaEntrega: 5, total: 32.8 })
    expect(r.ok && r.itens[0]!.observacao).toBe('sem cebola')
  })

  it('não cobra entrega na retirada', () => {
    const r = calcularPedido(
      [{ produtoId: 'p1', quantidade: 1, opcoesIds: ['o1'] }],
      catalogo,
      regras,
      'retirada',
    )
    expect(r).toMatchObject({ ok: true, subtotal: 18, taxaEntrega: 0, total: 18 })
  })

  it('aplica o pedido mínimo ao subtotal, sem a taxa', () => {
    const r = calcularPedido([{ produtoId: 'p2', quantidade: 2, opcoesIds: [] }], catalogo, regras, 'entrega')
    expect(r).toEqual({ ok: false, erros: ['O pedido mínimo é de R$ 15,00.'] })
  })

  it('acumula todos os erros de uma vez', () => {
    const r = calcularPedido(
      [
        { produtoId: 'p1', quantidade: 1, opcoesIds: [] },
        { produtoId: 'p3', quantidade: 1, opcoesIds: [] },
      ],
      catalogo,
      { ...regras, aceitaEntrega: false },
      'entrega',
    )
    expect(r.ok).toBe(false)
    expect(!r.ok && r.erros).toHaveLength(3)
  })

  it('carrinho vazio é erro', () => {
    expect(calcularPedido([], catalogo, regras, 'retirada')).toEqual({
      ok: false,
      erros: ['O carrinho está vazio.'],
    })
  })
})

describe('chaveItem', () => {
  it('ignora a ordem das opções e espaços na observação', () => {
    expect(chaveItem({ produtoId: 'p1', quantidade: 1, opcoesIds: ['o3', 'o1'], observacao: 'x ' })).toBe(
      chaveItem({ produtoId: 'p1', quantidade: 5, opcoesIds: ['o1', 'o3'], observacao: ' x' }),
    )
  })
})
