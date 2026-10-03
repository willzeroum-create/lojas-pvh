import 'server-only'

import type { DadosResumoDiario } from '@/lib/dominio/resumo-diario'
import { saldoParcela, somarDias } from '@/lib/dominio/financeiro'
import type { Cliente } from '@/lib/supabase/server'
import { listarItensEstoque } from './estoque'
import { modulosAtivos } from './modulos'
import { ouErro } from './erros'

const FUSO = 'America/Porto_Velho'

/** Início e fim (UTC) de um dia civil no fuso de Porto Velho (UTC−4, sem horário de verão). */
function janelaDoDia(dia: string): { inicio: string; fim: string } {
  const inicio = new Date(`${dia}T00:00:00-04:00`)
  return { inicio: inicio.toISOString(), fim: new Date(inicio.getTime() + 86_400_000).toISOString() }
}

export function hojeEmPortoVelho(agora = new Date()): string {
  return agora.toLocaleDateString('sv-SE', { timeZone: FUSO })
}

/** Junta tudo o que o resumo do dia precisa, só dos módulos que a empresa tem. */
export async function coletarResumoDiario(supabase: Cliente, tenantId: string, empresa: string, dia: string): Promise<DadosResumoDiario> {
  const modulos = await modulosAtivos(supabase, tenantId)
  const { inicio, fim } = janelaDoDia(dia)
  const semanaPassada = janelaDoDia(somarDias(dia, -7))

  const [pedidos, anterior, caixas, comandas] = await Promise.all([
    supabase
      .from('pedidos')
      .select('canal, total, status, itens_pedido(nome, quantidade, preparo)')
      .eq('tenant_id', tenantId)
      .gte('criado_em', inicio)
      .lt('criado_em', fim),
    supabase.from('pedidos').select('total').eq('tenant_id', tenantId).neq('status', 'cancelado').gte('criado_em', semanaPassada.inicio).lt('criado_em', semanaPassada.fim),
    modulos.has('caixa')
      ? supabase.from('caixa_sessoes').select('operador_nome, estado, caixa_conferencias(diferenca)').eq('tenant_id', tenantId).gte('aberta_em', inicio).lt('aberta_em', fim)
      : Promise.resolve({ data: [], error: null }),
    modulos.has('comandas')
      ? supabase.from('comandas').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).in('estado', ['aberta', 'conta'])
      : Promise.resolve({ count: 0, error: null }),
  ])

  const lista = ouErro(pedidos, 'Não foi possível ler as vendas do dia')
  // Comanda ainda aberta não é venda: no canal mesa só conta a conta fechada.
  const validos = lista.filter((p) => p.status !== 'cancelado' && (p.canal !== 'mesa' || p.status === 'concluido'))
  const porCanal = new Map<string, { canal: string; total: number; pedidos: number }>()
  const vendidos = new Map<string, number>()
  for (const p of validos) {
    const c = porCanal.get(p.canal) ?? { canal: p.canal, total: 0, pedidos: 0 }
    c.total = Math.round((c.total + Number(p.total)) * 100) / 100
    c.pedidos++
    porCanal.set(p.canal, c)
    for (const i of p.itens_pedido as Array<{ nome: string; quantidade: number; preparo: string | null }>) {
      if (i.preparo === 'cancelado') continue
      vendidos.set(i.nome, (vendidos.get(i.nome) ?? 0) + Number(i.quantidade))
    }
  }
  const total = Math.round(validos.reduce((s, p) => s + Number(p.total) * 100, 0)) / 100
  const totalAnterior = Math.round((anterior.data ?? []).reduce((s, p) => s + Number(p.total) * 100, 0)) / 100

  let contas: DadosResumoDiario['contas'] = null
  if (modulos.has('financeiro')) {
    const abertas = ouErro(
      await supabase.from('parcelas').select('vencimento, valor, valor_pago, titulos!inner(tipo)').eq('tenant_id', tenantId).in('estado', ['aberta', 'parcial']),
      'Não foi possível ler as contas',
    )
    const amanha = somarDias(dia, 1)
    const soma = (filtro: (p: { tipo: string; vencimento: string }) => boolean) =>
      Math.round(
        abertas
          .map((p) => ({ tipo: (p.titulos as unknown as { tipo: string }).tipo, vencimento: p.vencimento, saldo: saldoParcela(Number(p.valor), Number(p.valor_pago)) }))
          .filter(filtro)
          .reduce((s, p) => s + p.saldo * 100, 0),
      ) / 100
    contas = {
      pagarHoje: soma((p) => p.tipo === 'pagar' && p.vencimento === dia),
      pagarAmanha: soma((p) => p.tipo === 'pagar' && p.vencimento === amanha),
      vencidasPagar: soma((p) => p.tipo === 'pagar' && p.vencimento < dia),
      receberHoje: soma((p) => p.tipo === 'receber' && p.vencimento === dia),
      vencidasReceber: soma((p) => p.tipo === 'receber' && p.vencimento < dia),
    }
  }

  const estoqueBaixo = modulos.has('estoque')
    ? (await listarItensEstoque(supabase, tenantId)).filter((i) => i.abaixoDoMinimo).map((i) => ({ nome: i.nome, saldo: i.saldo, unidade: i.unidade }))
    : []

  return {
    empresa,
    dia: new Date(`${dia}T12:00:00-04:00`).toLocaleDateString('pt-BR', { timeZone: FUSO, weekday: 'long', day: 'numeric', month: 'long' }),
    vendas: { total, pedidos: validos.length, porCanal: [...porCanal.values()], cancelados: lista.filter((p) => p.status === 'cancelado').length },
    semanaPassada: totalAnterior > 0 ? totalAnterior : null,
    maisVendidos: [...vendidos.entries()].map(([nome, quantidade]) => ({ nome, quantidade })).sort((a, b) => b.quantidade - a.quantidade),
    caixas: (caixas.data ?? []).map((c) => {
      const conf = (c as { caixa_conferencias?: Array<{ diferenca: number }> }).caixa_conferencias ?? []
      return {
        operador: c.operador_nome,
        aberto: c.estado === 'aberta',
        diferenca: c.estado === 'aberta' ? null : Math.round(conf.reduce((s, x) => s + Number(x.diferenca) * 100, 0)) / 100,
      }
    }),
    contas,
    estoqueBaixo,
    comandasAbertas: comandas.count ?? 0,
  }
}
