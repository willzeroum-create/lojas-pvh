import { describe, expect, it } from 'vitest'
import { resumirCompras } from '@/lib/dominio/cliente'
import { cnpjValido, cpfValido, formatarDocumento, lerCep, lerDocumento } from '@/lib/dominio/documento'
import { mapearCep, mapearCnpjBrasilApi } from '@/lib/integracoes/consultas-formato'
import { esquemaPessoa } from '@/lib/validacao/clientes'
import { validar } from '@/lib/validacao/zod'

describe('CPF e CNPJ', () => {
  it('confere os dígitos verificadores', () => {
    expect(cpfValido('529.982.247-25')).toBe(true)
    expect(cpfValido('529.982.247-24')).toBe(false)
    expect(cpfValido('111.111.111-11')).toBe(false)
    expect(cnpjValido('11.222.333/0001-81')).toBe(true)
    expect(cnpjValido('11.222.333/0001-80')).toBe(false)
    expect(cnpjValido('00000000000000')).toBe(false)
  })

  it('lê o tipo pelo tamanho e formata', () => {
    expect(lerDocumento('52998224725')).toEqual({ tipo: 'pf', digitos: '52998224725' })
    expect(lerDocumento('11222333000181')).toEqual({ tipo: 'pj', digitos: '11222333000181' })
    expect(lerDocumento('123')).toBeNull()
    expect(formatarDocumento('52998224725')).toBe('529.982.247-25')
    expect(formatarDocumento('11222333000181')).toBe('11.222.333/0001-81')
    expect(lerCep('76801-000')).toBe('76801000')
    expect(lerCep('7680')).toBeNull()
  })
})

describe('resumo de compras do cliente', () => {
  const agora = new Date('2026-10-03T12:00:00Z')

  it('soma, ticket e frequência, ignorando cancelados', () => {
    const r = resumirCompras(
      [
        { total: 30, criadoEm: '2026-09-01T12:00:00Z', cancelado: false },
        { total: 50, criadoEm: '2026-09-11T12:00:00Z', cancelado: false },
        { total: 999, criadoEm: '2026-09-15T12:00:00Z', cancelado: true },
        { total: 40, criadoEm: '2026-09-21T12:00:00Z', cancelado: false },
      ],
      agora,
    )
    expect(r.quantidade).toBe(3)
    expect(r.totalGasto).toBe(120)
    expect(r.ticketMedio).toBe(40)
    expect(r.intervaloMedioDias).toBe(10)
    expect(r.diasSemComprar).toBe(12)
    expect(r.sumido).toBe(false)
  })

  it('marca como sumido quem passou 1,5× do intervalo habitual', () => {
    const r = resumirCompras(
      [
        { total: 10, criadoEm: '2026-09-01T12:00:00Z', cancelado: false },
        { total: 10, criadoEm: '2026-09-08T12:00:00Z', cancelado: false },
      ],
      agora,
    )
    expect(r.intervaloMedioDias).toBe(7)
    expect(r.diasSemComprar).toBe(25)
    expect(r.sumido).toBe(true)
  })

  it('sem compras: tudo zerado', () => {
    expect(resumirCompras([], agora)).toMatchObject({ quantidade: 0, totalGasto: 0, ticketMedio: 0, ultimaCompra: null, sumido: false })
  })
})

describe('consultas de CNPJ e CEP', () => {
  it('traduz a resposta da BrasilAPI para o cadastro', () => {
    const empresa = mapearCnpjBrasilApi({
      cnpj: '11222333000181',
      razao_social: 'PADARIA TESTE LTDA',
      nome_fantasia: '',
      descricao_situacao_cadastral: 'ATIVA',
      ddd_telefone_1: '6932221234',
      email: 'CONTATO@TESTE.COM',
      cep: '76801000',
      descricao_tipo_de_logradouro: 'AVENIDA',
      logradouro: 'SETE DE SETEMBRO',
      numero: '1200',
      bairro: 'CENTRO',
      municipio: 'PORTO VELHO',
      uf: 'ro',
    })
    expect(empresa).toMatchObject({
      razaoSocial: 'PADARIA TESTE LTDA',
      nomeFantasia: null,
      telefone: '6932221234',
      email: 'contato@teste.com',
      endereco: { cep: '76801000', rua: 'AVENIDA SETE DE SETEMBRO', cidade: 'PORTO VELHO', uf: 'RO' },
    })
  })

  it('aceita CEP da BrasilAPI e do ViaCEP; erro vira null', () => {
    expect(mapearCep({ cep: '76801-000', street: 'Av. Sete', neighborhood: 'Centro', city: 'Porto Velho', state: 'RO' })).toMatchObject({
      cep: '76801000',
      rua: 'Av. Sete',
      uf: 'RO',
    })
    expect(mapearCep({ cep: '76801-000', logradouro: 'Av. Sete', localidade: 'Porto Velho', uf: 'RO' })?.cidade).toBe('Porto Velho')
    expect(mapearCep({ erro: true })).toBeNull()
  })
})

describe('formulário de pessoa', () => {
  it('normaliza documento, WhatsApp, etiquetas e e-mail', () => {
    const r = validar(esquemaPessoa, {
      nome: ' Maria ',
      documento: '529.982.247-25',
      whatsapp: '(69) 99999-8888',
      email: 'Maria@Exemplo.com',
      etiquetas: 'VIP, fiado, vip',
      e_cliente: 'on',
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.dados.nome).toBe('Maria')
    expect(r.dados.documento).toEqual({ tipo: 'pf', digitos: '52998224725' })
    expect(r.dados.whatsapp).toBe('5569999998888')
    expect(r.dados.email).toBe('maria@exemplo.com')
    expect(r.dados.etiquetas).toEqual(['vip', 'fiado'])
  })

  it('recusa documento inválido', () => {
    const r = validar(esquemaPessoa, { nome: 'X', documento: '111.111.111-11', e_cliente: 'on' })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(Object.keys(r.porCampo)).toEqual(['documento'])
  })

  it('recusa pessoa que não é cliente nem fornecedor', () => {
    const r = validar(esquemaPessoa, { nome: 'X' })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(Object.keys(r.porCampo)).toEqual(['e_cliente'])
  })
})
