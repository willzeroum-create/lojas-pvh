import { describe, expect, it, vi } from 'vitest'
import { estadoDaFocus, montarNfceFocus, pendenciasNfce, type ItemFiscal } from '@/lib/dominio/fiscal'

vi.mock('server-only', () => ({}))

const item = (p: Partial<ItemFiscal> = {}): ItemFiscal => ({
  produtoId: 'p1',
  nome: 'X-Salada',
  quantidade: 2,
  precoUnitario: 18,
  desconto: 1,
  total: 35,
  unidade: 'un',
  ncm: '21069090',
  cfop: '5102',
  csosn: '102',
  origem: 0,
  cest: null,
  ...p,
})

describe('NFC-e', () => {
  const config = { cnpj: '11.222.333/0001-81', inscricaoEstadual: '00000000123456', regime: 1 as const }

  it('aponta o que falta antes de enviar', () => {
    expect(pendenciasNfce(null, [item()]).map((p) => p.campo)).toEqual(['cnpj', 'ie', 'regime'])
    expect(pendenciasNfce(config, [item({ ncm: null, nome: 'Suco' })])).toEqual([
      { campo: 'ncm:p1', mensagem: 'Suco: falta o NCM no cadastro do produto.' },
    ])
    expect(pendenciasNfce(config, [item()])).toEqual([])
  })

  it('monta o documento da Focus com CSOSN, pagamentos e troco', () => {
    const doc = montarNfceFocus(
      config,
      [item(), item({ produtoId: 'p2', nome: 'Refrigerante', quantidade: 0.5, precoUnitario: 7, desconto: 0, unidade: 'l', ncm: '22021000' })],
      [
        { forma: 'pix', valor: 20, troco: 0 },
        { forma: 'dinheiro', valor: 20, troco: 1.5 },
      ],
      { dataEmissao: '2026-10-03T20:00:00-04:00', cpfCnpjConsumidor: '529.982.247-25', nomeConsumidor: 'Maria' },
    )
    expect(doc).toMatchObject({
      cnpj_emitente: '11222333000181',
      presenca_comprador: 1,
      cpf_destinatario: '52998224725',
      nome_destinatario: 'Maria',
      valor_troco: 1.5,
      formas_pagamento: [
        { forma_pagamento: '17', valor_pagamento: 20 },
        { forma_pagamento: '01', valor_pagamento: 20 },
      ],
    })
    expect(doc.itens[0]).toMatchObject({ numero_item: 1, codigo_ncm: '21069090', cfop: '5102', icms_situacao_tributaria: '102', valor_bruto: 36, valor_desconto: 1, unidade_comercial: 'UN' })
    expect(doc.itens[1]).toMatchObject({ quantidade_comercial: 0.5, unidade_comercial: 'L', valor_bruto: 3.5 })
    expect(doc.itens[1]).not.toHaveProperty('valor_desconto')
  })

  it('regime normal usa ICMS 00 em vez de CSOSN', () => {
    const doc = montarNfceFocus({ ...config, regime: 3 }, [item()], [{ forma: 'cartao_debito', valor: 35, troco: 0 }], { dataEmissao: 'x' })
    expect(doc.itens[0]).toMatchObject({ icms_situacao_tributaria: '00' })
    expect(doc.formas_pagamento[0]!.forma_pagamento).toBe('04')
  })

  it('estados da Focus', () => {
    expect(estadoDaFocus('autorizado')).toBe('autorizado')
    expect(estadoDaFocus('erro_autorizacao')).toBe('rejeitado')
    expect(estadoDaFocus('processando_autorizacao')).toBe('processando')
    expect(estadoDaFocus(undefined)).toBe('erro')
  })
})

describe('segredos cifrados', () => {
  it('cifra e decifra; o texto cifrado não revela o segredo e não aceita adulteração', async () => {
    vi.stubEnv('PVH_CHAVE_SEGREDOS', Buffer.alloc(32, 7).toString('base64'))
    const { cifrar, decifrar } = await import('@/lib/integracoes/segredos')
    const c = cifrar('token-super-secreto')
    expect(c).toMatch(/^v1:/)
    expect(c).not.toContain('secreto')
    expect(cifrar('token-super-secreto')).not.toBe(c)
    expect(decifrar(c)).toBe('token-super-secreto')
    const partes = c.split(':')
    partes[3] = partes[3]!.slice(0, -2) + (partes[3]!.endsWith('A') ? 'BB' : 'AA')
    expect(() => decifrar(partes.join(':'))).toThrow()
    vi.unstubAllEnvs()
  })
})

describe('Pix pelo Mercado Pago', () => {
  it('estados e assinatura do aviso', async () => {
    const { createHmac } = await import('node:crypto')
    const { assinaturaMercadoPagoValida, estadoDoMercadoPago } = await import('@/lib/integracoes/pix/mercadopago')
    expect(estadoDoMercadoPago('approved')).toBe('pago')
    expect(estadoDoMercadoPago('pending')).toBe('pendente')
    expect(estadoDoMercadoPago('refunded')).toBe('devolvido')
    const segredo = 'chave-do-webhook'
    const v1 = createHmac('sha256', segredo).update('id:12345;request-id:req-1;ts:1700000000;').digest('hex')
    expect(assinaturaMercadoPagoValida(segredo, { dataId: '12345', requestId: 'req-1', cabecalhoAssinatura: `ts=1700000000,v1=${v1}` })).toBe(true)
    expect(assinaturaMercadoPagoValida(segredo, { dataId: '99999', requestId: 'req-1', cabecalhoAssinatura: `ts=1700000000,v1=${v1}` })).toBe(false)
    expect(assinaturaMercadoPagoValida(segredo, { dataId: '12345', requestId: 'req-1', cabecalhoAssinatura: null })).toBe(false)
  })
})
