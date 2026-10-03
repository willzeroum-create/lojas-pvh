import { describe, expect, it } from 'vitest'
import { ErroNfe, fatorSugerido, lerNotaCompra } from '@/lib/dominio/nfe'

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe><infNFe Id="NFe11260111222333000181550010000012341000012345" versao="4.00">
    <ide><cUF>11</cUF><nNF>1234</nNF><serie>1</serie><dhEmi>2026-10-01T09:30:00-04:00</dhEmi></ide>
    <emit><CNPJ>11222333000181</CNPJ><xNome>DISTRIBUIDORA NORTE &amp; CIA LTDA</xNome><xFant>Dist Norte</xFant></emit>
    <dest><CNPJ>12345678000195</CNPJ><xNome>Lanchonete</xNome></dest>
    <det nItem="1"><prod><cProd>LATA350</cProd><cEAN>7894900011517</cEAN><xProd>REFRIGERANTE LATA 350ML</xProd><NCM>22021000</NCM><uCom>CX12</uCom><qCom>2.0000</qCom><vUnCom>36.0000000000</vUnCom><vProd>72.00</vProd></prod></det>
    <det nItem="2"><prod><cProd>CARNE01</cProd><cEAN>SEM GTIN</cEAN><xProd>CARNE MOIDA KG</xProd><NCM>02013000</NCM><uCom>KG</uCom><qCom>5.250</qCom><vUnCom>30.0000</vUnCom><vProd>157.50</vProd></prod></det>
    <total><ICMSTot><vNF>229.50</vNF></ICMSTot></total>
    <cobr><dup><nDup>001</nDup><dVenc>2026-10-15</dVenc><vDup>114.75</vDup></dup><dup><nDup>002</nDup><dVenc>2026-10-30</dVenc><vDup>114.75</vDup></dup></cobr>
  </infNFe></NFe>
</nfeProc>`

describe('XML da NF-e de compra', () => {
  it('lê cabeçalho, fornecedor, itens e duplicatas', () => {
    const n = lerNotaCompra(XML)
    expect(n).toMatchObject({
      chave: '11260111222333000181550010000012341000012345',
      numero: '1234',
      serie: '1',
      emitidaEm: '2026-10-01',
      emitente: { documento: '11222333000181', nome: 'DISTRIBUIDORA NORTE & CIA LTDA', fantasia: 'Dist Norte' },
      destinatarioDocumento: '12345678000195',
      valorTotal: 229.5,
    })
    expect(n.itens).toEqual([
      { numero: 1, codigo: 'LATA350', ean: '7894900011517', descricao: 'REFRIGERANTE LATA 350ML', ncm: '22021000', unidade: 'CX12', quantidade: 2, valorUnitario: 36, valorTotal: 72 },
      { numero: 2, codigo: 'CARNE01', ean: null, descricao: 'CARNE MOIDA KG', ncm: '02013000', unidade: 'KG', quantidade: 5.25, valorUnitario: 30, valorTotal: 157.5 },
    ])
    expect(n.duplicatas).toEqual([
      { numero: '001', vencimento: '2026-10-15', valor: 114.75 },
      { numero: '002', vencimento: '2026-10-30', valor: 114.75 },
    ])
  })

  it('recusa o que não é NF-e', () => {
    expect(() => lerNotaCompra('<html></html>')).toThrow(ErroNfe)
  })

  it('sugere o fator pela unidade da nota', () => {
    expect(fatorSugerido('CX12')).toBe(12)
    expect(fatorSugerido('FD 6')).toBe(6)
    expect(fatorSugerido('DZ')).toBe(12)
    expect(fatorSugerido('KG')).toBe(1)
  })
})

describe('ficha técnica', () => {
  it('custo, participação, margem e preço sugerido', async () => {
    const { custoFicha, margem, precoSugerido } = await import('@/lib/dominio/ficha')
    const f = custoFicha([
      { insumo: 'Pão', quantidade: 1, custoUnitario: 0.8 },
      { insumo: 'Carne', quantidade: 0.15, custoUnitario: 30 },
      { insumo: 'Queijo', quantidade: 0.03, custoUnitario: 45 },
    ])
    expect(f.custo).toBe(6.65)
    expect(f.linhas.map((l) => l.participacao)).toEqual([12, 67.7, 20.3])
    expect(margem(20, f.custo)).toMatchObject({ cmvPercentual: 33.3, lucroBruto: 13.35, margemPercentual: 66.8, situacao: 'saudavel' })
    expect(margem(10, f.custo).situacao).toBe('apertada')
    expect(margem(5, f.custo).situacao).toBe('prejuizo')
    expect(precoSugerido(6.65, 35)).toBe(19)
    expect(precoSugerido(0, 35)).toBeNull()
  })
})
