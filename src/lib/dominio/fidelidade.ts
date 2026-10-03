/**
 * Cashback: cada compra concluída de um cliente identificado devolve uma
 * percentagem em crédito, que vence após N dias. O resgate gasta primeiro o
 * crédito que vence antes (FIFO por vencimento). Lógica pura; a base aplica
 * a mesma regra em `public.saldo_cashback`.
 */
import { arredondar } from './moeda'

export type ConfigCashback = {
  ativo: boolean
  /** % do valor da compra (sem taxa de entrega) devolvido em crédito. */
  percentual: number
  validadeDias: number
  /** Saldo mínimo para poder usar. */
  resgateMinimo: number
  /** Máximo da compra que se paga com cashback, em %. */
  limiteResgatePct: number
}

export const CONFIG_CASHBACK_PADRAO: ConfigCashback = { ativo: false, percentual: 5, validadeDias: 90, resgateMinimo: 5, limiteResgatePct: 50 }

/** `em`: dia do movimento (AAAA-MM-DD). Créditos e devoluções têm vencimento. */
export type MovimentoCashback =
  | { tipo: 'credito' | 'devolucao'; valor: number; em: string; expiraEm: string; pedidoId?: string | null }
  | { tipo: 'resgate' | 'estorno' | 'ajuste'; valor: number; em: string; pedidoId?: string | null }

/** Crédito de uma compra (arredondado ao centavo, nunca negativo). */
export function creditoDaCompra(cfg: ConfigCashback, total: number, taxaEntrega = 0): number {
  if (!cfg.ativo || cfg.percentual <= 0) return 0
  return Math.max(0, Math.floor((total - taxaEntrega) * cfg.percentual) / 100)
}

/**
 * Saldo disponível em `hoje` (AAAA-MM-DD) e o que vence nos próximos 30 dias.
 * Corre os movimentos pela ordem do tempo: cada débito (resgate, estorno,
 * ajuste negativo) gasta os créditos ainda válidos nesse dia, primeiro o que
 * vence antes; o que vence sem uso perde-se. A devolução (cashback de uma
 * venda cancelada) volta como crédito novo; ajuste positivo não vence.
 */
export function saldoCashback(movimentos: MovimentoCashback[], hoje: string): { saldo: number; aVencer30: number; proximoVencimento: string | null } {
  const ehCredito = (m: MovimentoCashback) => m.tipo === 'credito' || m.tipo === 'devolucao' || (m.tipo === 'ajuste' && m.valor > 0)
  const creditos: Array<{ restante: number; expiraEm: string }> = []
  // No mesmo dia, os créditos entram antes dos débitos.
  const ordenados = [...movimentos].sort((x, y) => x.em.localeCompare(y.em) || Number(!ehCredito(x)) - Number(!ehCredito(y)))
  for (const m of ordenados) {
    if (ehCredito(m)) {
      creditos.push({ restante: Math.abs(m.valor), expiraEm: 'expiraEm' in m ? m.expiraEm : '9999-12-31' })
      creditos.sort((x, y) => x.expiraEm.localeCompare(y.expiraEm))
      continue
    }
    let falta = Math.abs(m.valor)
    for (const c of creditos) {
      if (falta <= 0) break
      if (c.expiraEm < m.em || c.restante <= 0) continue
      const usado = Math.min(c.restante, falta)
      c.restante -= usado
      falta -= usado
    }
  }
  const validos = creditos.filter((c) => c.expiraEm >= hoje && c.restante > 0.0001)
  const em30 = new Date(Date.parse(hoje) + 30 * 86_400_000).toISOString().slice(0, 10)
  return {
    saldo: arredondar(validos.reduce((s, c) => s + c.restante, 0)),
    aVencer30: arredondar(validos.filter((c) => c.expiraEm <= em30).reduce((s, c) => s + c.restante, 0)),
    proximoVencimento: !validos[0] || validos[0].expiraEm === '9999-12-31' ? null : validos[0].expiraEm,
  }
}

/** Quanto do cashback se pode usar nesta compra. */
export function resgatePossivel(cfg: ConfigCashback, saldo: number, totalCompra: number): number {
  if (!cfg.ativo || saldo < cfg.resgateMinimo || totalCompra <= 0) return 0
  return arredondar(Math.min(saldo, (totalCompra * cfg.limiteResgatePct) / 100))
}
