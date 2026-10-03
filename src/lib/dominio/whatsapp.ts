/**
 * Mensagem de WhatsApp com o pedido, pronta a abrir em `wa.me`. É o que o
 * comerciante vê primeiro, por isso tem de ser legível num telemóvel de
 * relance: itens em cima, total em destaque, dados de entrega no fim.
 */
import type { Endereco } from './endereco'
import { formatarEndereco } from './endereco'
import type { ItemCalculado, TipoEntrega } from './carrinho'
import { formatarBRL } from './moeda'

export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao'

export const ROTULO_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão na entrega',
}

export type DadosMensagemPedido = {
  numero: number
  nomeFantasia: string
  clienteNome: string
  itens: ItemCalculado[]
  subtotal: number
  taxaEntrega: number
  total: number
  tipoEntrega: TipoEntrega
  endereco: Endereco | null
  formaPagamento: FormaPagamento
  trocoPara: number | null
  observacoes: string | null
}

export function montarMensagemPedido(d: DadosMensagemPedido): string {
  const linhas: string[] = []
  linhas.push(`*Pedido #${d.numero} — ${d.nomeFantasia}*`)
  linhas.push('')

  for (const item of d.itens) {
    linhas.push(`${item.quantidade}x ${item.nome} — ${formatarBRL(item.total)}`)
    if (item.opcoes.length > 0) linhas.push(`   ${item.opcoes.map((o) => o.nome).join(', ')}`)
    if (item.observacao) linhas.push(`   Obs: ${item.observacao}`)
  }

  linhas.push('')
  if (d.taxaEntrega > 0) {
    linhas.push(`Subtotal: ${formatarBRL(d.subtotal)}`)
    linhas.push(`Entrega: ${formatarBRL(d.taxaEntrega)}`)
  }
  linhas.push(`*Total: ${formatarBRL(d.total)}*`)
  linhas.push('')

  if (d.tipoEntrega === 'entrega') {
    linhas.push(`📍 Entrega: ${d.endereco ? formatarEndereco(d.endereco) : 'a combinar'}`)
    if (d.endereco?.referencia) linhas.push(`   Ref: ${d.endereco.referencia}`)
  } else {
    linhas.push('🏪 Retirada no balcão')
  }

  let pagamento = `💳 Pagamento: ${ROTULO_PAGAMENTO[d.formaPagamento]}`
  if (d.formaPagamento === 'dinheiro' && d.trocoPara) pagamento += ` (troco para ${formatarBRL(d.trocoPara)})`
  linhas.push(pagamento)
  linhas.push(`👤 ${d.clienteNome}`)
  if (d.observacoes) linhas.push(`📝 ${d.observacoes}`)

  return linhas.join('\n')
}

/** Link `wa.me` com a mensagem pré-preenchida. `numero` já vem normalizado (só dígitos, com DDI). */
export function urlWhatsapp(numero: string, mensagem: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}
