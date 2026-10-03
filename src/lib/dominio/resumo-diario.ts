/**
 * O resumo do dia que o dono recebe no WhatsApp: o que vendeu (por canal), o
 * caixa (e se fechou com diferença), contas a vencer, estoque baixo e o que
 * ficou aberto. Só as secções com conteúdo aparecem. Lógica pura.
 */
import { formatarBRL } from './moeda'

const ROTULO_CANAL: Record<string, string> = {
  cardapio: 'Cardápio digital',
  whatsapp: 'WhatsApp',
  balcao: 'Balcão',
  mesa: 'Mesas',
  ifood: 'iFood',
  '99food': '99Food',
}

export type DadosResumoDiario = {
  empresa: string
  /** "sexta-feira, 3 de outubro" */
  dia: string
  vendas: { total: number; pedidos: number; porCanal: Array<{ canal: string; total: number; pedidos: number }>; cancelados: number }
  /** Mesmo dia da semana anterior, para comparar. */
  semanaPassada: number | null
  maisVendidos: Array<{ nome: string; quantidade: number }>
  caixas: Array<{ operador: string; diferenca: number | null; aberto: boolean }>
  contas: { pagarHoje: number; pagarAmanha: number; vencidasPagar: number; receberHoje: number; vencidasReceber: number } | null
  estoqueBaixo: Array<{ nome: string; saldo: number; unidade: string }>
  comandasAbertas: number
}

const quantidade = (q: number) => (Number.isInteger(q) ? String(q) : q.toFixed(3).replace('.', ',').replace(/,?0+$/, ''))

export function montarResumoDiario(d: DadosResumoDiario): string {
  const l: string[] = [`*${d.empresa} · resumo de ${d.dia}*`, '']

  if (d.vendas.pedidos === 0) {
    l.push('Nenhuma venda registrada hoje.')
  } else {
    let linha = `💰 *${formatarBRL(d.vendas.total)}* em ${d.vendas.pedidos} ${d.vendas.pedidos === 1 ? 'venda' : 'vendas'}`
    linha += ` · ticket médio ${formatarBRL(Math.round((d.vendas.total / d.vendas.pedidos) * 100) / 100)}`
    l.push(linha)
    if (d.semanaPassada !== null && d.semanaPassada > 0) {
      const variacao = Math.round(((d.vendas.total - d.semanaPassada) / d.semanaPassada) * 100)
      l.push(`${variacao >= 0 ? '📈' : '📉'} ${variacao >= 0 ? '+' : ''}${variacao}% contra a semana passada (${formatarBRL(d.semanaPassada)})`)
    }
    if (d.vendas.porCanal.length > 1) {
      for (const c of [...d.vendas.porCanal].sort((a, b) => b.total - a.total)) {
        l.push(`   • ${ROTULO_CANAL[c.canal] ?? c.canal}: ${formatarBRL(c.total)} (${c.pedidos})`)
      }
    }
    if (d.vendas.cancelados > 0) l.push(`   ${d.vendas.cancelados} ${d.vendas.cancelados === 1 ? 'cancelamento' : 'cancelamentos'}`)
  }

  if (d.maisVendidos.length > 0) {
    l.push('', '*Mais vendidos*')
    d.maisVendidos.slice(0, 5).forEach((p, i) => l.push(`${i + 1}. ${p.nome} — ${quantidade(p.quantidade)}`))
  }

  if (d.caixas.length > 0) {
    l.push('', '*Caixa*')
    for (const c of d.caixas) {
      if (c.aberto) l.push(`⏳ ${c.operador}: ainda aberto`)
      else if (c.diferenca === 0 || c.diferenca === null) l.push(`✅ ${c.operador}: fechou sem diferença`)
      else l.push(`⚠️ ${c.operador}: ${c.diferenca > 0 ? 'sobra' : 'falta'} de ${formatarBRL(Math.abs(c.diferenca))}`)
    }
  }

  if (d.contas) {
    const c = d.contas
    const linhas: string[] = []
    if (c.vencidasPagar > 0) linhas.push(`🔴 Vencidas a pagar: ${formatarBRL(c.vencidasPagar)}`)
    if (c.pagarHoje > 0) linhas.push(`Pagar hoje: ${formatarBRL(c.pagarHoje)}`)
    if (c.pagarAmanha > 0) linhas.push(`Pagar amanhã: ${formatarBRL(c.pagarAmanha)}`)
    if (c.receberHoje > 0) linhas.push(`Receber hoje: ${formatarBRL(c.receberHoje)}`)
    if (c.vencidasReceber > 0) linhas.push(`🟠 Clientes em atraso: ${formatarBRL(c.vencidasReceber)}`)
    if (linhas.length) l.push('', '*Contas*', ...linhas)
  }

  if (d.estoqueBaixo.length > 0) {
    l.push('', '*Estoque baixo*')
    d.estoqueBaixo.slice(0, 8).forEach((e) => l.push(`• ${e.nome}: ${quantidade(e.saldo)} ${e.unidade}`))
    if (d.estoqueBaixo.length > 8) l.push(`… e mais ${d.estoqueBaixo.length - 8}`)
  }

  if (d.comandasAbertas > 0) l.push('', `🍽️ ${d.comandasAbertas} ${d.comandasAbertas === 1 ? 'comanda ainda aberta' : 'comandas ainda abertas'}`)

  return l.join('\n')
}

/**
 * Versão de uma linha para o modelo (template) da API oficial do WhatsApp:
 * os parâmetros de um modelo não aceitam quebras de linha. O texto completo
 * fica no painel; aqui vão só os números e os alertas.
 */
export function linhaResumo(d: DadosResumoDiario): string {
  const partes: string[] = []
  partes.push(
    d.vendas.pedidos === 0 ? 'sem vendas' : `${formatarBRL(d.vendas.total)} em ${d.vendas.pedidos} ${d.vendas.pedidos === 1 ? 'venda' : 'vendas'}`,
  )
  const comDiferenca = d.caixas.filter((c) => !c.aberto && c.diferenca)
  if (comDiferenca.length) partes.push(`caixa com diferença (${comDiferenca.map((c) => formatarBRL(c.diferenca!)).join(', ')})`)
  if (d.contas?.vencidasPagar) partes.push(`${formatarBRL(d.contas.vencidasPagar)} vencidos a pagar`)
  if (d.contas?.pagarAmanha) partes.push(`${formatarBRL(d.contas.pagarAmanha)} a pagar amanhã`)
  if (d.estoqueBaixo.length) partes.push(`${d.estoqueBaixo.length} ${d.estoqueBaixo.length === 1 ? 'item' : 'itens'} com estoque baixo`)
  return partes.join(' · ').slice(0, 900)
}
