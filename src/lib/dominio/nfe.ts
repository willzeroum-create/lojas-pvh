/**
 * Leitura do XML de uma NF-e de compra (o arquivo que o fornecedor manda),
 * só o necessário para dar entrada no estoque e criar as contas a pagar.
 * Sem dependências: o XML da NF-e tem estrutura fixa e é lido por etiquetas.
 * Lógica pura.
 */

export type ItemNfe = {
  numero: number
  codigo: string
  ean: string | null
  descricao: string
  ncm: string | null
  unidade: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

export type DuplicataNfe = { numero: string; vencimento: string; valor: number }

export type NotaCompra = {
  chave: string | null
  numero: string
  serie: string | null
  emitidaEm: string | null
  emitente: { documento: string; nome: string; fantasia: string | null }
  destinatarioDocumento: string | null
  valorTotal: number
  itens: ItemNfe[]
  duplicatas: DuplicataNfe[]
}

const desescapar = (t: string) =>
  t
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()

/** Conteúdo da primeira etiqueta `nome` dentro de `xml` (ignora prefixos de namespace). */
function tag(xml: string, nome: string): string | null {
  const m = xml.match(new RegExp(`<(?:\\w+:)?${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${nome}>`))
  return m ? desescapar(m[1]!) : null
}

function blocos(xml: string, nome: string): string[] {
  return [...xml.matchAll(new RegExp(`<(?:\\w+:)?${nome}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:\\w+:)?${nome}>`, 'g'))].map((m) => m[0])
}

const numero = (t: string | null) => (t === null ? 0 : Number(t))

export class ErroNfe extends Error {}

export function lerNotaCompra(xml: string): NotaCompra {
  const infNFe = blocos(xml, 'infNFe')[0]
  if (!infNFe) throw new ErroNfe('Este arquivo não é o XML de uma NF-e.')
  const chave = infNFe.match(/Id="NFe(\d{44})"/)?.[1] ?? null
  const ide = blocos(infNFe, 'ide')[0] ?? ''
  const emit = blocos(infNFe, 'emit')[0] ?? ''
  const dest = blocos(infNFe, 'dest')[0] ?? ''
  const total = blocos(infNFe, 'ICMSTot')[0] ?? ''

  const emitenteDoc = tag(emit, 'CNPJ') ?? tag(emit, 'CPF')
  if (!emitenteDoc) throw new ErroNfe('O XML não traz o CNPJ do fornecedor.')

  const itens = blocos(infNFe, 'det').map((det, i) => {
    const prod = blocos(det, 'prod')[0] ?? ''
    const ean = tag(prod, 'cEAN')
    return {
      numero: Number(det.match(/nItem="(\d+)"/)?.[1] ?? i + 1),
      codigo: tag(prod, 'cProd') ?? String(i + 1),
      ean: ean && /^\d{8,14}$/.test(ean) ? ean : null,
      descricao: tag(prod, 'xProd') ?? 'Item sem descrição',
      ncm: tag(prod, 'NCM'),
      unidade: (tag(prod, 'uCom') ?? 'UN').toUpperCase(),
      quantidade: numero(tag(prod, 'qCom')),
      valorUnitario: numero(tag(prod, 'vUnCom')),
      valorTotal: numero(tag(prod, 'vProd')),
    }
  })
  if (itens.length === 0) throw new ErroNfe('A nota não tem itens.')

  const duplicatas = blocos(infNFe, 'dup').map((d) => ({
    numero: tag(d, 'nDup') ?? '',
    vencimento: tag(d, 'dVenc') ?? '',
    valor: numero(tag(d, 'vDup')),
  }))

  const emissao = tag(ide, 'dhEmi') ?? tag(ide, 'dEmi')
  return {
    chave,
    numero: tag(ide, 'nNF') ?? '',
    serie: tag(ide, 'serie'),
    emitidaEm: emissao ? emissao.slice(0, 10) : null,
    emitente: { documento: emitenteDoc, nome: tag(emit, 'xNome') ?? 'Fornecedor', fantasia: tag(emit, 'xFant') },
    destinatarioDocumento: tag(dest, 'CNPJ') ?? tag(dest, 'CPF'),
    valorTotal: numero(tag(total, 'vNF')),
    itens,
    duplicatas,
  }
}

/** Fator de conversão a partir da unidade da nota, quando é óbvio (CX12 → 12, DZ → 12). */
export function fatorSugerido(unidadeNota: string): number {
  const u = unidadeNota.toUpperCase()
  const caixa = u.match(/^(?:CX|FD|PCT|PC|PT|EMB|KIT)\D*(\d{1,4})$/)
  if (caixa) return Number(caixa[1])
  if (u === 'DZ') return 12
  return 1
}
