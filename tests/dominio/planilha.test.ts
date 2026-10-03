import { describe, expect, it } from 'vitest'
import { utils, write } from 'xlsx'
import { importarDePlanilha, interpretarLinhas, lerCsv } from '@/lib/importador/planilha'

describe('lerCsv', () => {
  it('lê separador por ponto e vírgula, aspas e linhas vazias', () => {
    const csv =
      'categoria;nome;descricao;preco\nLanches;"X-Salada; especial";"Pão, carne";18,50\n\nBebidas;Coca;;6'
    expect(lerCsv(csv)).toEqual([
      ['categoria', 'nome', 'descricao', 'preco'],
      ['Lanches', 'X-Salada; especial', 'Pão, carne', '18,50'],
      ['Bebidas', 'Coca', '', '6'],
    ])
  })
})

describe('interpretarLinhas', () => {
  it('usa o cabeçalho para achar as colunas em qualquer ordem', () => {
    const linhas = interpretarLinhas([
      ['Preço', 'Produto', 'Categoria', 'Descrição'],
      ['R$ 18,00', 'X-Salada', 'Lanches', 'Pão e carne'],
      ['6', 'Coca', 'Bebidas', ''],
    ])
    expect(linhas).toEqual([
      { categoria: 'Lanches', nome: 'X-Salada', descricao: 'Pão e carne', preco: 18 },
      { categoria: 'Bebidas', nome: 'Coca', descricao: undefined, preco: 6 },
    ])
  })

  it('entende a lista "de papel": categoria numa linha só, produtos abaixo', () => {
    const linhas = interpretarLinhas([
      ['Lanches'],
      ['X-Salada', 'Pão e carne', '18'],
      ['X-Bacon', '', '22'],
      ['Bebidas'],
      ['Coca', '', '6'],
    ])
    expect(linhas.map((l) => `${l.categoria}/${l.nome}/${l.preco}`)).toEqual([
      'Lanches/X-Salada/18',
      'Lanches/X-Bacon/22',
      'Bebidas/Coca/6',
    ])
  })

  it('ignora linhas sem nome ou sem preço', () => {
    expect(
      interpretarLinhas([
        ['categoria', 'nome', 'descricao', 'preco'],
        ['Lanches', '', '', '10'],
        ['Lanches', 'Sem preço', '', 'abc'],
      ]),
    ).toEqual([])
  })
})

describe('importarDePlanilha', () => {
  it('lê um XLSX gerado em memória', () => {
    const folha = utils.aoa_to_sheet([
      ['categoria', 'nome', 'preco'],
      ['Porções', 'Batata', 16],
      ['Porções', 'Mandioca', '14,50'],
    ])
    const livro = utils.book_new()
    utils.book_append_sheet(livro, folha, 'Cardápio')
    const bytes = write(livro, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
    expect(importarDePlanilha(bytes, 'cardapio.xlsx')).toEqual([
      { categoria: 'Porções', nome: 'Batata', descricao: undefined, preco: 16 },
      { categoria: 'Porções', nome: 'Mandioca', descricao: undefined, preco: 14.5 },
    ])
  })

  it('lê um CSV', () => {
    const bytes = new TextEncoder().encode('nome,preco\nSuco,9')
    expect(importarDePlanilha(bytes, 'lista.csv')).toEqual([
      { categoria: 'Geral', nome: 'Suco', descricao: undefined, preco: 9 },
    ])
  })
})
