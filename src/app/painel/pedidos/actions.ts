'use server'

import { revalidatePath } from 'next/cache'
import { exigirPainel } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import {
  atualizarStatusPedido,
  listarPedidosDoDia,
  obterPedidoComItens,
  type PedidoComItens,
} from '@/lib/dados/pedidos'
import { esquemaStatusPedido } from '@/lib/validacao/pedido'
import { validar } from '@/lib/validacao/zod'

export async function mudarStatus(entrada: unknown): Promise<{ ok: true } | { ok: false; erro: string }> {
  const r = validar(esquemaStatusPedido, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  const { supabase, tenantId } = await exigirPainel()
  try {
    await atualizarStatusPedido(supabase, tenantId, r.dados.pedidoId, r.dados.status)
  } catch (e) {
    return { ok: false, erro: e instanceof ErroDados ? e.message : 'Não foi possível atualizar o pedido.' }
  }
  revalidatePath('/painel/pedidos')
  return { ok: true }
}

/** Usado pelo Realtime: o evento traz só a linha do pedido, sem os itens. */
export async function obterPedido(pedidoId: string): Promise<PedidoComItens | null> {
  const { supabase, tenantId } = await exigirPainel()
  return obterPedidoComItens(supabase, tenantId, pedidoId)
}

/** Reserva do Realtime: polling curto. */
export async function listarPedidos(): Promise<PedidoComItens[]> {
  const { supabase, tenantId } = await exigirPainel()
  return listarPedidosDoDia(supabase, tenantId)
}
