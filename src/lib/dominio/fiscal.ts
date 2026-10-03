/**
 * Nota fiscal de consumidor (NFC-e) a partir de uma venda: o documento no
 * formato da Focus NFe e a verificação, antes de enviar, do que falta no
 * cadastro (o erro aparece ao comerciante em português, não como rejeição da
 * SEFAZ). Lógica pura.
 */
import { normalizarDocumento } from './documento'

export type ConfigFiscal = {
  cnpj: string
  inscricaoEstadual: string
  /** 1 Simples, 2 Simples excesso, 3 Normal, 4 MEI. */
  regime: 1 | 2 | 3 | 4
  naturezaOperacao?: string
}

export type ItemFiscal = {
  produtoId: string | null
  nome: string
  quantidade: number
  precoUnitario: number
  desconto: number
  total: number
  unidade: string
  ncm: string | null
  cfop: string
  csosn: string
  origem: number
  cest: string | null
}

export type PagamentoFiscal = { forma: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'outro'; valor: number; troco: number }

/** Códigos de meio de pagamento da NFC-e (tPag). */
export const CODIGO_PAGAMENTO: Record<PagamentoFiscal['forma'], string> = {
  dinheiro: '01',
  cartao_credito: '03',
  cartao_debito: '04',
  pix: '17',
  outro: '99',
}

const UNIDADE_SEFAZ: Record<string, string> = { un: 'UN', kg: 'KG', g: 'G', l: 'L', ml: 'ML', cx: 'CX', pct: 'PCT', dz: 'DZ' }

export type Pendencia = { campo: string; mensagem: string }

/** O que impede emitir: cadastro da empresa e dos produtos. Vazio = pode emitir. */
export function pendenciasNfce(config: Partial<ConfigFiscal> | null, itens: readonly ItemFiscal[]): Pendencia[] {
  const p: Pendencia[] = []
  if (!config?.cnpj) p.push({ campo: 'cnpj', mensagem: 'Falta o CNPJ do emitente na configuração fiscal.' })
  if (!config?.inscricaoEstadual) p.push({ campo: 'ie', mensagem: 'Falta a inscrição estadual.' })
  if (!config?.regime) p.push({ campo: 'regime', mensagem: 'Falta o regime tributário.' })
  for (const i of itens) {
    if (!i.ncm) p.push({ campo: `ncm:${i.produtoId ?? i.nome}`, mensagem: `${i.nome}: falta o NCM no cadastro do produto.` })
  }
  return p
}

function arred(v: number, casas = 2) {
  const f = 10 ** casas
  return Math.round(v * f) / f
}

/**
 * Documento NFC-e no formato da Focus NFe (POST /v2/nfce?ref=...). Empresas do
 * Simples usam CSOSN (o padrão 102, sem crédito); PIS e COFINS 49 (outras
 * operações de saída), que é o caso comum no Simples — revisar com o contador.
 */
export function montarNfceFocus(
  config: ConfigFiscal,
  itens: readonly ItemFiscal[],
  pagamentos: readonly PagamentoFiscal[],
  opcoes: { dataEmissao: string; cpfCnpjConsumidor?: string | null; nomeConsumidor?: string | null; descontoGeral?: number },
) {
  const doc = opcoes.cpfCnpjConsumidor ? normalizarDocumento(opcoes.cpfCnpjConsumidor) : null
  const simples = config.regime !== 3
  const troco = arred(pagamentos.reduce((s, p) => s + p.troco, 0))
  return {
    cnpj_emitente: normalizarDocumento(config.cnpj),
    data_emissao: opcoes.dataEmissao,
    natureza_operacao: config.naturezaOperacao ?? 'Venda ao consumidor',
    presenca_comprador: 1,
    modalidade_frete: 9,
    local_destino: 1,
    ...(doc && doc.length === 11 ? { cpf_destinatario: doc } : {}),
    ...(doc && doc.length === 14 ? { cnpj_destinatario: doc } : {}),
    ...(doc && opcoes.nomeConsumidor ? { nome_destinatario: opcoes.nomeConsumidor.slice(0, 60) } : {}),
    ...(opcoes.descontoGeral ? { valor_desconto: arred(opcoes.descontoGeral) } : {}),
    itens: itens.map((i, k) => ({
      numero_item: k + 1,
      codigo_produto: (i.produtoId ?? `item-${k + 1}`).slice(0, 60),
      descricao: i.nome.slice(0, 120),
      codigo_ncm: i.ncm,
      ...(i.cest ? { cest: i.cest } : {}),
      cfop: i.cfop,
      unidade_comercial: UNIDADE_SEFAZ[i.unidade] ?? 'UN',
      quantidade_comercial: arred(i.quantidade, 4),
      valor_unitario_comercial: arred(i.precoUnitario, 4),
      unidade_tributavel: UNIDADE_SEFAZ[i.unidade] ?? 'UN',
      quantidade_tributavel: arred(i.quantidade, 4),
      valor_unitario_tributavel: arred(i.precoUnitario, 4),
      valor_bruto: arred(i.quantidade * i.precoUnitario),
      ...(i.desconto > 0 ? { valor_desconto: arred(i.desconto) } : {}),
      icms_origem: i.origem,
      ...(simples ? { icms_situacao_tributaria: i.csosn } : { icms_situacao_tributaria: '00', icms_modalidade_base_calculo: 3 }),
      pis_situacao_tributaria: '49',
      cofins_situacao_tributaria: '49',
    })),
    formas_pagamento: pagamentos.map((p) => ({ forma_pagamento: CODIGO_PAGAMENTO[p.forma], valor_pagamento: arred(p.valor) })),
    ...(troco > 0 ? { valor_troco: troco } : {}),
  }
}

export type EstadoDocumentoFiscal = 'enfileirado' | 'processando' | 'autorizado' | 'rejeitado' | 'denegado' | 'cancelado' | 'contingencia' | 'erro'

/** Status da Focus NFe → o nosso estado. */
export function estadoDaFocus(status: string | undefined): EstadoDocumentoFiscal {
  switch (status) {
    case 'autorizado':
      return 'autorizado'
    case 'cancelado':
      return 'cancelado'
    case 'erro_autorizacao':
      return 'rejeitado'
    case 'denegado':
      return 'denegado'
    case 'processando_autorizacao':
      return 'processando'
    default:
      return 'erro'
  }
}
