import { describe, expect, it } from 'vitest'
import { formatarEndereco, urlMapa } from '@/lib/dominio/endereco'
import { arredondar, formatarBRL, interpretarBRL } from '@/lib/dominio/moeda'
import { podeTransitar, proximoStatus } from '@/lib/dominio/pedido'
import { calcularResumo } from '@/lib/dominio/resumo'
import { gerarSlug, slugValido } from '@/lib/dominio/slug'
import { formatarTelefone, normalizarTelefoneNacional, normalizarWhatsapp } from '@/lib/dominio/telefone'

describe('moeda', () => {
  it('formata em reais', () => {
    expect(formatarBRL(18)).toBe('R$ 18,00')
    expect(formatarBRL(1234.5)).toBe('R$ 1.234,50')
  })
  it('arredonda a duas casas sem erro de vírgula flutuante', () => {
    expect(arredondar(0.1 + 0.2)).toBe(0.3)
    expect(arredondar(1.005)).toBe(1.01)
  })
  it('interpreta valores escritos à brasileira e à americana', () => {
    expect(interpretarBRL('18')).toBe(18)
    expect(interpretarBRL('18,5')).toBe(18.5)
    expect(interpretarBRL('R$ 1.234,56')).toBe(1234.56)
    expect(interpretarBRL('18.50')).toBe(18.5)
    expect(interpretarBRL('abc')).toBeNull()
  })
})

describe('telefone', () => {
  it('normaliza WhatsApp com e sem DDI', () => {
    expect(normalizarWhatsapp('(69) 99999-8888')).toBe('5569999998888')
    expect(normalizarWhatsapp('+55 69 99999-8888')).toBe('5569999998888')
    expect(normalizarWhatsapp('69 3222-1234')).toBe('556932221234')
    expect(normalizarWhatsapp('123')).toBeNull()
    expect(normalizarWhatsapp('+351 912 345 678')).toBeNull()
  })
  it('normaliza telefone nacional e formata', () => {
    expect(normalizarTelefoneNacional('+55 (69) 99999-8888')).toBe('69999998888')
    expect(formatarTelefone('69999998888')).toBe('(69) 99999-8888')
    expect(formatarTelefone('6932221234')).toBe('(69) 3222-1234')
  })
})

describe('slug', () => {
  it('gera slugs limpos', () => {
    expect(gerarSlug('Lanchonete da Praça')).toBe('lanchonete-da-praca')
    expect(gerarSlug('  Açaí & Cia!! ')).toBe('acai-cia')
    expect(gerarSlug('Zé')).toBe('ze0')
  })
  it('valida formato e reservados', () => {
    expect(slugValido('lanchonete-da-praca')).toBe(true)
    expect(slugValido('painel')).toBe(false)
    expect(slugValido('Maiúsculas')).toBe(false)
    expect(slugValido('ab')).toBe(false)
    expect(slugValido('-abc')).toBe(false)
  })
})

describe('endereco', () => {
  it('formata saltando o que falta', () => {
    expect(
      formatarEndereco({ rua: 'Av. Sete', numero: '12', bairro: 'Centro', cidade: 'Porto Velho', uf: 'RO' }),
    ).toBe('Av. Sete, 12 – Centro, Porto Velho/RO')
    expect(formatarEndereco({ cidade: 'Porto Velho' })).toBe('Porto Velho')
    expect(urlMapa({ rua: 'Av. Sete', numero: '12' })).toContain('query=Av.%20Sete%2C%2012')
  })
})

describe('pedido', () => {
  it('só permite transições válidas', () => {
    expect(podeTransitar('novo', 'aceite')).toBe(true)
    expect(podeTransitar('novo', 'concluido')).toBe(false)
    expect(podeTransitar('concluido', 'cancelado')).toBe(false)
    expect(proximoStatus('aceite')).toBe('pronto')
    expect(proximoStatus('concluido')).toBeNull()
  })
})

describe('resumo', () => {
  const FUSO = 'America/Sao_Paulo'
  const agora = new Date('2026-09-02T18:00:00-03:00')
  const pedidos = [
    {
      criado_em: '2026-09-02T12:00:00-03:00',
      total: 30,
      status: 'concluido' as const,
      itens: [{ produto_id: 'a', nome: 'X-Salada', quantidade: 2 }],
    },
    {
      criado_em: '2026-09-02T13:00:00-03:00',
      total: 20,
      status: 'novo' as const,
      itens: [{ produto_id: 'b', nome: 'Suco', quantidade: 1 }],
    },
    {
      criado_em: '2026-09-02T14:00:00-03:00',
      total: 99,
      status: 'cancelado' as const,
      itens: [{ produto_id: 'a', nome: 'X-Salada', quantidade: 9 }],
    },
    {
      criado_em: '2026-08-30T20:00:00-03:00',
      total: 50,
      status: 'concluido' as const,
      itens: [
        { produto_id: 'a', nome: 'X-Salada', quantidade: 1 },
        { produto_id: null, nome: 'Antigo', quantidade: 5 },
      ],
    },
    {
      criado_em: '2026-08-20T20:00:00-03:00',
      total: 500,
      status: 'concluido' as const,
      itens: [{ produto_id: 'c', nome: 'Fora da semana', quantidade: 50 }],
    },
  ]

  it('separa hoje e semana, ignora cancelados e ordena os mais vendidos', () => {
    const r = calcularResumo(pedidos, agora, FUSO)
    expect(r.hoje).toEqual({ faturacao: 50, pedidos: 2, ticketMedio: 25 })
    expect(r.semana).toEqual({ faturacao: 100, pedidos: 3, ticketMedio: 33.33 })
    expect(r.maisVendidos).toEqual([
      { produtoId: null, nome: 'Antigo', quantidade: 5 },
      { produtoId: 'a', nome: 'X-Salada', quantidade: 3 },
      { produtoId: 'b', nome: 'Suco', quantidade: 1 },
    ])
  })

  it('respeita o fuso: 23:30 em São Paulo ainda é hoje, mas em UTC já é amanhã', () => {
    const tarde = new Date('2026-09-02T23:30:00-03:00')
    const r = calcularResumo(
      [{ criado_em: tarde.toISOString(), total: 10, status: 'novo', itens: [] }],
      tarde,
      FUSO,
    )
    expect(r.hoje.pedidos).toBe(1)
  })
})
