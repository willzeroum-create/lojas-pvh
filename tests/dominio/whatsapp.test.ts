import { describe, expect, it } from 'vitest'
import { montarMensagemPedido, urlWhatsapp } from '@/lib/dominio/whatsapp'

describe('montarMensagemPedido', () => {
  it('monta a mensagem de entrega com itens, totais, endereço e pagamento', () => {
    const msg = montarMensagemPedido({
      numero: 12,
      nomeFantasia: 'Lanchonete da Praça',
      clienteNome: 'João',
      itens: [
        {
          produtoId: 'p1',
          nome: 'X-Salada',
          quantidade: 2,
          precoUnitario: 22,
          opcoes: [
            { grupo: 'Ponto', nome: 'Ao ponto', preco_adicional: 0 },
            { grupo: 'Adicionais', nome: 'Bacon', preco_adicional: 4 },
          ],
          observacao: 'sem cebola',
          total: 44,
        },
        { produtoId: 'p2', nome: 'Refrigerante', quantidade: 1, precoUnitario: 6, opcoes: [], total: 6 },
      ],
      subtotal: 50,
      taxaEntrega: 5,
      total: 55,
      tipoEntrega: 'entrega',
      endereco: {
        rua: 'Rua das Flores',
        numero: '10',
        bairro: 'Centro',
        cidade: 'Porto Velho',
        uf: 'RO',
        referencia: 'portão azul',
      },
      formaPagamento: 'dinheiro',
      trocoPara: 100,
      observacoes: 'campainha não funciona',
    })

    expect(msg).toBe(
      [
        '*Pedido #12 — Lanchonete da Praça*',
        '',
        '2x X-Salada — R$ 44,00',
        '   Ao ponto, Bacon',
        '   Obs: sem cebola',
        '1x Refrigerante — R$ 6,00',
        '',
        'Subtotal: R$ 50,00',
        'Entrega: R$ 5,00',
        '*Total: R$ 55,00*',
        '',
        '📍 Entrega: Rua das Flores, 10 – Centro, Porto Velho/RO',
        '   Ref: portão azul',
        '💳 Pagamento: Dinheiro (troco para R$ 100,00)',
        '👤 João',
        '📝 campainha não funciona',
      ].join('\n'),
    )
  })

  it('na retirada omite subtotal e endereço', () => {
    const msg = montarMensagemPedido({
      numero: 3,
      nomeFantasia: 'Açaí do Norte',
      clienteNome: 'Ana',
      itens: [
        { produtoId: 'p', nome: 'Açaí 500 ml', quantidade: 1, precoUnitario: 15, opcoes: [], total: 15 },
      ],
      subtotal: 15,
      taxaEntrega: 0,
      total: 15,
      tipoEntrega: 'retirada',
      endereco: null,
      formaPagamento: 'pix',
      trocoPara: null,
      observacoes: null,
    })
    expect(msg).toContain('🏪 Retirada no balcão')
    expect(msg).not.toContain('Subtotal')
    expect(msg).toContain('💳 Pagamento: Pix')
    expect(msg).not.toContain('Acompanhe')
  })

  it('com delivery próprio, termina com o link de acompanhamento', () => {
    const msg = montarMensagemPedido({
      numero: 4,
      nomeFantasia: 'Açaí do Norte',
      clienteNome: 'Ana',
      itens: [{ produtoId: 'p', nome: 'Açaí 500 ml', quantidade: 1, precoUnitario: 15, opcoes: [], total: 15 }],
      subtotal: 15,
      taxaEntrega: 5,
      total: 20,
      tipoEntrega: 'entrega',
      endereco: { rua: 'Rua A', numero: '10', bairro: 'Centro' },
      formaPagamento: 'pix',
      trocoPara: null,
      observacoes: null,
      linkAcompanhamento: 'https://exemplo.com/entrega/0123456789abcdef',
    })
    expect(msg.split('\n').slice(-2)).toEqual(['', 'Acompanhe a entrega: https://exemplo.com/entrega/0123456789abcdef'])
  })
})

describe('urlWhatsapp', () => {
  it('codifica a mensagem para o wa.me', () => {
    expect(urlWhatsapp('5569999998888', 'Olá, tudo bem?')).toBe(
      'https://wa.me/5569999998888?text=Ol%C3%A1%2C%20tudo%20bem%3F',
    )
  })
})
