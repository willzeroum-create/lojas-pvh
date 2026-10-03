/**
 * Relatórios de vendas: totais, por dia, por hora, por canal e por forma de
 * pagamento, curva ABC dos produtos e exportação em CSV que o Excel em
 * português abre directo. Lógica pura.
 */
import { arredondar } from './moeda'
import { diaLocal, FUSO_PORTO_VELHO_MIN } from './ponto'

export type VendaRelatorio = {
  id: string
  criadoEm: string
  canal: string
  total: number
  desconto: number
  taxaEntrega: number
  /** Pagamentos efectivos (valor − troco). Vazio = usa a forma do pedido. */
  pagamentos: Array<{ forma: string; valor: number }>
  formaPedido: string
}

export type ItemRelatorio = { produtoId: string | null; nome: string; quantidade: number; total: number }

export const ROTULO_CANAL: Record<string, string> = {
  cardapio: 'Cardápio online',
  whatsapp: 'WhatsApp',
  balcao: 'Balcão',
  mesa: 'Mesa',
  ifood: 'iFood',
  '99food': '99Food',
}

export const ROTULO_FORMA: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao: 'Cartão',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito',
  outro: 'Outro',
}

export type Fatia = { chave: string; rotulo: string; valor: number; quantidade: number; participacao: number }

function fatias(mapa: Map<string, { valor: number; quantidade: number }>, rotulos: Record<string, string>): Fatia[] {
  const total = [...mapa.values()].reduce((s, v) => s + v.valor, 0)
  return [...mapa.entries()]
    .map(([chave, v]) => ({
      chave,
      rotulo: rotulos[chave] ?? chave,
      valor: arredondar(v.valor),
      quantidade: v.quantidade,
      participacao: total > 0 ? Math.round((v.valor / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.valor - a.valor)
}

function somar(mapa: Map<string, { valor: number; quantidade: number }>, chave: string, valor: number, quantidade = 1) {
  const atual = mapa.get(chave) ?? { valor: 0, quantidade: 0 }
  atual.valor += valor
  atual.quantidade += quantidade
  mapa.set(chave, atual)
}

export type RelatorioVendas = {
  faturamento: number
  vendas: number
  ticketMedio: number
  descontos: number
  taxasEntrega: number
  porDia: Array<{ dia: string; valor: number; vendas: number }>
  /** 24 posições, hora local 0–23. */
  porHora: Array<{ hora: number; valor: number; vendas: number }>
  porCanal: Fatia[]
  porForma: Fatia[]
}

export function relatorioVendas(vendas: VendaRelatorio[], fusoMin = FUSO_PORTO_VELHO_MIN): RelatorioVendas {
  const porDia = new Map<string, { valor: number; quantidade: number }>()
  const porHora = Array.from({ length: 24 }, (_, hora) => ({ hora, valor: 0, vendas: 0 }))
  const porCanal = new Map<string, { valor: number; quantidade: number }>()
  const porForma = new Map<string, { valor: number; quantidade: number }>()
  let faturamento = 0
  let descontos = 0
  let taxas = 0

  for (const v of vendas) {
    faturamento += v.total
    descontos += v.desconto
    taxas += v.taxaEntrega
    somar(porDia, diaLocal(v.criadoEm, fusoMin), v.total)
    const hora = new Date(new Date(v.criadoEm).getTime() + fusoMin * 60_000).getUTCHours()
    porHora[hora]!.valor += v.total
    porHora[hora]!.vendas += 1
    somar(porCanal, v.canal, v.total)
    const pags = v.pagamentos.length > 0 ? v.pagamentos : [{ forma: v.formaPedido, valor: v.total }]
    for (const p of pags) somar(porForma, p.forma, p.valor)
  }

  return {
    faturamento: arredondar(faturamento),
    vendas: vendas.length,
    ticketMedio: vendas.length ? arredondar(faturamento / vendas.length) : 0,
    descontos: arredondar(descontos),
    taxasEntrega: arredondar(taxas),
    porDia: [...porDia.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([dia, x]) => ({ dia, valor: arredondar(x.valor), vendas: x.quantidade })),
    porHora: porHora.map((h) => ({ ...h, valor: arredondar(h.valor) })),
    porCanal: fatias(porCanal, ROTULO_CANAL),
    porForma: fatias(porForma, ROTULO_FORMA),
  }
}

export type LinhaAbc = { chave: string; nome: string; quantidade: number; total: number; participacao: number; acumulado: number; classe: 'A' | 'B' | 'C' }

/**
 * Curva ABC por faturamento: A até 80 % acumulado, B até 95 %, C o resto.
 * Agrupa pelo produto (ou pelo nome, para itens sem produto ligado).
 */
export function curvaAbc(itens: ItemRelatorio[]): LinhaAbc[] {
  const mapa = new Map<string, { nome: string; quantidade: number; total: number }>()
  for (const i of itens) {
    const chave = i.produtoId ?? `nome:${i.nome.trim().toLowerCase()}`
    const atual = mapa.get(chave) ?? { nome: i.nome, quantidade: 0, total: 0 }
    atual.quantidade += i.quantidade
    atual.total += i.total
    mapa.set(chave, atual)
  }
  const ordenados = [...mapa.entries()].sort(([, a], [, b]) => b.total - a.total)
  const geral = ordenados.reduce((s, [, x]) => s + x.total, 0)
  let acumulado = 0
  return ordenados.map(([chave, x]) => {
    const antes = acumulado
    acumulado += x.total
    const pAntes = geral > 0 ? (antes / geral) * 100 : 0
    return {
      chave,
      nome: x.nome,
      quantidade: Math.round(x.quantidade * 1000) / 1000,
      total: arredondar(x.total),
      participacao: geral > 0 ? Math.round((x.total / geral) * 1000) / 10 : 0,
      acumulado: geral > 0 ? Math.round((acumulado / geral) * 1000) / 10 : 0,
      // A classe é decidida por onde o produto começa: o que puxa a soma até 80 % é A.
      classe: pAntes < 80 ? 'A' : pAntes < 95 ? 'B' : 'C',
    }
  })
}

/** Intervalo de datas válido (AAAA-MM-DD), no máximo `maxDias`. */
export function lerIntervalo(de: unknown, ate: unknown, hoje: string, maxDias = 92): { de: string; ate: string } {
  const ok = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s))
  let fim = ok(ate) ? ate : hoje
  if (fim > hoje) fim = hoje
  const padrao = new Date(Date.parse(fim) - 29 * 86_400_000).toISOString().slice(0, 10)
  let inicio = ok(de) ? de : padrao
  if (inicio > fim) inicio = fim
  const minimo = new Date(Date.parse(fim) - (maxDias - 1) * 86_400_000).toISOString().slice(0, 10)
  if (inicio < minimo) inicio = minimo
  return { de: inicio, ate: fim }
}

/** Limites UTC de um intervalo de dias locais [de, ate]. */
export function limitesUtc(de: string, ate: string, fusoMin = FUSO_PORTO_VELHO_MIN): { desde: string; antes: string } {
  return {
    desde: new Date(Date.parse(de) - fusoMin * 60_000).toISOString(),
    antes: new Date(Date.parse(ate) + 86_400_000 - fusoMin * 60_000).toISOString(),
  }
}

/**
 * CSV para o Excel em português: separador `;`, vírgula decimal, BOM UTF-8
 * para os acentos, aspas quando é preciso. Células que começam por = + - @
 * levam um apóstrofo (não viram fórmula ao abrir).
 */
export function paraCsv(colunas: Array<{ titulo: string; valor: (l: never) => string | number | null }>, linhas: unknown[]): string {
  const celula = (v: string | number | null) => {
    if (v === null) return ''
    let s = typeof v === 'number' ? String(v).replace('.', ',') : v
    if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`
    return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const cabecalho = colunas.map((c) => celula(c.titulo)).join(';')
  const corpo = linhas.map((l) => colunas.map((c) => celula(c.valor(l as never))).join(';'))
  return '﻿' + [cabecalho, ...corpo].join('\r\n') + '\r\n'
}
