/**
 * PDV: as contas da venda de balcão e a leitura da etiqueta da balança.
 * Lógica pura, em centavos para não perder dinheiro em arredondamentos.
 */

export type FormaRecebimento = 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'outro'

export type ItemVenda = {
  produtoId: string
  nome: string
  /** Unidades ou quilos (até 3 casas). */
  quantidade: number
  precoUnitario: number
  /** Desconto em reais neste item. */
  desconto?: number
}

export type PagamentoVenda = { forma: FormaRecebimento; valor: number }

export type ItemCalculado = ItemVenda & { desconto: number; total: number }

export type CalculoVenda =
  | {
      ok: true
      itens: ItemCalculado[]
      subtotal: number
      desconto: number
      total: number
      pago: number
      troco: number
      /** Pagamentos como se gravam: o troco sai do dinheiro. */
      pagamentos: Array<PagamentoVenda & { troco: number }>
    }
  | { ok: false; erro: string; falta?: number }

const c = (v: number) => Math.round(v * 100)
const r = (v: number) => v / 100

export function calcularVenda(itens: readonly ItemVenda[], descontoGeral: number, pagamentos: readonly PagamentoVenda[]): CalculoVenda {
  if (itens.length === 0) return { ok: false, erro: 'Adicione pelo menos um produto.' }

  const calculados: ItemCalculado[] = []
  let subtotal = 0
  let descontoItens = 0
  for (const i of itens) {
    if (!(i.quantidade > 0)) return { ok: false, erro: `Quantidade inválida em ${i.nome}.` }
    const bruto = Math.round(i.quantidade * c(i.precoUnitario))
    const desconto = c(i.desconto ?? 0)
    if (desconto > bruto) return { ok: false, erro: `Desconto maior que o valor de ${i.nome}.` }
    subtotal += bruto
    descontoItens += desconto
    calculados.push({ ...i, desconto: r(desconto), total: r(bruto - desconto) })
  }

  const descontoTotal = descontoItens + c(descontoGeral)
  if (descontoTotal > subtotal) return { ok: false, erro: 'O desconto passa do valor da venda.' }
  const total = subtotal - descontoTotal

  const pago = pagamentos.reduce((s, p) => s + c(p.valor), 0)
  if (pagamentos.some((p) => !(p.valor > 0))) return { ok: false, erro: 'Valor de pagamento inválido.' }
  if (pago < total) return { ok: false, erro: 'Falta receber.', falta: r(total - pago) }

  const excesso = pago - total
  const dinheiro = pagamentos.filter((p) => p.forma === 'dinheiro').reduce((s, p) => s + c(p.valor), 0)
  if (excesso > dinheiro) return { ok: false, erro: 'Só há troco em dinheiro: o valor pago em outras formas passa do total.' }

  // O troco sai do(s) pagamento(s) em dinheiro, a começar pelo último.
  let trocoRestante = excesso
  const gravados = [...pagamentos].map((p) => ({ ...p, troco: 0 }))
  for (let k = gravados.length - 1; k >= 0 && trocoRestante > 0; k--) {
    const p = gravados[k]!
    if (p.forma !== 'dinheiro') continue
    const tira = Math.min(trocoRestante, c(p.valor))
    p.troco = r(tira)
    trocoRestante -= tira
  }

  return {
    ok: true,
    itens: calculados,
    subtotal: r(subtotal),
    desconto: r(descontoTotal),
    total: r(total),
    pago: r(pago),
    troco: r(excesso),
    pagamentos: gravados,
  }
}

export type EtiquetaBalanca = { codigoProduto: string; tipo: 'preco' | 'peso'; valor: number }

/**
 * Etiqueta da balança (EAN-13 que começa por 2), no formato mais comum no
 * Brasil: 2 + código do produto + valor + dígito. `digitosCodigo` (4 a 6) e o
 * tipo de valor (preço em reais ou peso em quilos, ambos com 3 casas para o
 * peso e 2 para o preço) são configuração da loja. Devolve null se não for uma
 * etiqueta de balança válida.
 */
export function lerEtiquetaBalanca(
  codigo: string,
  config: { digitosCodigo: number; tipo: 'preco' | 'peso' },
): EtiquetaBalanca | null {
  if (!/^2\d{12}$/.test(codigo)) return null
  if (!eanValido(codigo)) return null
  const n = config.digitosCodigo
  if (n < 4 || n > 6) return null
  const codigoProduto = codigo.slice(1, 1 + n)
  const campoValor = codigo.slice(1 + n, 12)
  const numero = Number(campoValor)
  const valor = config.tipo === 'peso' ? numero / 1000 : numero / 100
  return valor > 0 ? { codigoProduto, tipo: config.tipo, valor } : null
}

/** Dígito verificador EAN-13 / EAN-8. */
export function eanValido(codigo: string): boolean {
  if (!/^(\d{8}|\d{13})$/.test(codigo)) return false
  const digitos = codigo.split('').map(Number)
  const dv = digitos.pop()!
  const soma = digitos.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (soma % 10)) % 10 === dv
}
