/**
 * Resumo do painel: faturação do dia e da semana, número de pedidos, ticket
 * médio e os dez produtos mais vendidos. Números grandes, uma lista, sem
 * gráficos — como o brief pede.
 *
 * Conta todos os pedidos não cancelados: o comerciante quer ver o dia a andar,
 * não só o que já concluiu.
 */
import { arredondar } from './moeda'
import type { StatusPedido } from './pedido'

export type PedidoParaResumo = {
  criado_em: string
  total: number
  status: StatusPedido
  itens: Array<{ produto_id: string | null; nome: string; quantidade: number }>
}

export type Periodo = { faturacao: number; pedidos: number; ticketMedio: number }

export type Resumo = {
  hoje: Periodo
  semana: Periodo
  maisVendidos: Array<{ produtoId: string | null; nome: string; quantidade: number }>
}

/** "2026-09-02" no fuso indicado. */
export function chaveDia(data: Date, fuso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(data)
}

function resumir(pedidos: PedidoParaResumo[]): Periodo {
  const faturacao = arredondar(pedidos.reduce((s, p) => s + p.total, 0))
  const n = pedidos.length
  return { faturacao, pedidos: n, ticketMedio: n === 0 ? 0 : arredondar(faturacao / n) }
}

export function calcularResumo(pedidos: PedidoParaResumo[], agora: Date, fuso: string): Resumo {
  const validos = pedidos.filter((p) => p.status !== 'cancelado')
  const hoje = chaveDia(agora, fuso)
  const diasDaSemana = new Set<string>()
  for (let i = 0; i < 7; i++) diasDaSemana.add(chaveDia(new Date(agora.getTime() - i * 86_400_000), fuso))

  const deHoje = validos.filter((p) => chaveDia(new Date(p.criado_em), fuso) === hoje)
  const daSemana = validos.filter((p) => diasDaSemana.has(chaveDia(new Date(p.criado_em), fuso)))

  const contagem = new Map<string, { produtoId: string | null; nome: string; quantidade: number }>()
  for (const p of daSemana) {
    for (const item of p.itens) {
      const chave = item.produto_id ?? `nome:${item.nome}`
      const atual = contagem.get(chave) ?? { produtoId: item.produto_id, nome: item.nome, quantidade: 0 }
      atual.quantidade += item.quantidade
      contagem.set(chave, atual)
    }
  }
  const maisVendidos = [...contagem.values()]
    .sort((a, b) => b.quantidade - a.quantidade || a.nome.localeCompare(b.nome))
    .slice(0, 10)

  return { hoje: resumir(deHoje), semana: resumir(daSemana), maisVendidos }
}
