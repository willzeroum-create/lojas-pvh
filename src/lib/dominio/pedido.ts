/**
 * Ciclo de vida do pedido no painel: novo → aceite → pronto → concluído,
 * com cancelamento possível até ficar pronto.
 */

export type StatusPedido = 'novo' | 'aceite' | 'pronto' | 'concluido' | 'cancelado'

export const TRANSICOES: Record<StatusPedido, StatusPedido[]> = {
  novo: ['aceite', 'cancelado'],
  aceite: ['pronto', 'cancelado'],
  pronto: ['concluido', 'cancelado'],
  concluido: [],
  cancelado: [],
}

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  novo: 'Novo',
  aceite: 'Em preparo',
  pronto: 'Pronto',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
}

/** O texto do botão que leva a cada estado. */
export const ACAO_PARA: Record<StatusPedido, string> = {
  novo: 'Reabrir',
  aceite: 'Aceitar',
  pronto: 'Marcar pronto',
  concluido: 'Concluir',
  cancelado: 'Cancelar',
}

/** Estados que ainda exigem atenção no balcão, na ordem em que aparecem. */
export const STATUS_ABERTOS: StatusPedido[] = ['novo', 'aceite', 'pronto']

export function podeTransitar(de: StatusPedido, para: StatusPedido): boolean {
  return TRANSICOES[de].includes(para)
}

/** A acção principal do cartão do pedido: o próximo passo natural. */
export function proximoStatus(atual: StatusPedido): StatusPedido | null {
  return TRANSICOES[atual].find((s) => s !== 'cancelado') ?? null
}

export function estaFechado(status: StatusPedido): boolean {
  return status === 'concluido' || status === 'cancelado'
}
