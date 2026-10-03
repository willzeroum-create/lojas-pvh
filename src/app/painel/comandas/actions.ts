'use server'

/** Actions de mesas e comandas: abrir, lançar, transferir, juntar, pedir a conta e fechar no caixa. */
import { revalidatePath } from 'next/cache'
import { autorDe, exigirAprovacao, exigirModulo } from '@/lib/auth/guardas'
import {
  abrirComanda,
  fecharComanda,
  juntarComandas,
  lancarItens,
  mudarEstadoComanda,
  removerItem,
  salvarMesa,
  transferirMesa,
} from '@/lib/dados/comandas'
import { cancelarItem } from '@/lib/dados/cozinha'
import { ErroDados, pedeGerente } from '@/lib/dados/erros'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import {
  esquemaAbrirComanda,
  esquemaCancelarItem,
  esquemaFecharComanda,
  esquemaLancarItens,
  esquemaMesa,
} from '@/lib/validacao/comandas'
import { uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string>; precisaGerente?: boolean }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

function revalidar(comandaId?: string) {
  revalidatePath('/painel/comandas', 'layout')
  revalidatePath('/painel/cozinha', 'layout')
  if (comandaId) revalidatePath(`/painel/comandas/${comandaId}`)
}

async function contexto() {
  const ctx = await exigirModulo('comandas')
  const loja = await obterLojaPrincipal(ctx.supabase, ctx.tenantId)
  if (!loja) throw new ErroDados('A empresa ainda não tem loja.')
  return { ...ctx, lojaId: loja.id }
}

export async function salvarMesaAction(entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaMesa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const { supabase, tenantId, lojaId } = await contexto()
    await salvarMesa(supabase, tenantId, lojaId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar a mesa.') }
  }
  revalidar()
  return { ok: true }
}

export async function abrirComandaAction(entrada: unknown): Promise<Resultado<{ comandaId: string }>> {
  const r = validar(esquemaAbrirComanda, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contexto()
    const comandaId = await abrirComanda(ctx.supabase, ctx.tenantId, ctx.lojaId, r.dados, autorDe(ctx))
    revalidar()
    return { ok: true, comandaId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível abrir a comanda.') }
  }
}

export async function lancarItensAction(entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaLancarItens, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const { supabase, tenantId } = await contexto()
    await lancarItens(supabase, tenantId, r.dados.comandaId, r.dados.itens)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível lançar.') }
  }
  revalidar(r.dados.comandaId)
  return { ok: true }
}

export async function removerItemAction(comandaId: string, itemId: string): Promise<Resultado> {
  const r = validar(z.object({ comandaId: uuid, itemId: uuid }), { comandaId, itemId })
  if (!r.ok) return { ok: false, erro: 'Item inválido.' }
  try {
    const { supabase, tenantId } = await contexto()
    await removerItem(supabase, tenantId, r.dados.itemId)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível remover.') }
  }
  revalidar(r.dados.comandaId)
  return { ok: true }
}

/** Item que já foi para a cozinha: cancela com motivo (sai da conta, fica no histórico). */
export async function cancelarItemComandaAction(comandaId: string, entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaCancelarItem.and(z.object({ pinGerente: z.string().optional() })), entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contexto()
    await exigirAprovacao(ctx, 'cancelar_item', `Cancelou um item da comanda: ${r.dados.motivo}`, r.dados.pinGerente || undefined, r.dados.itemId)
    await cancelarItem(ctx.supabase, ctx.tenantId, r.dados.itemId, r.dados.motivo)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar o item.'), precisaGerente: pedeGerente(e) }
  }
  revalidar(comandaId)
  return { ok: true }
}

export async function pedirContaAction(comandaId: string, estado: 'conta' | 'aberta'): Promise<Resultado> {
  const r = validar(uuid, comandaId)
  if (!r.ok) return { ok: false, erro: 'Comanda inválida.' }
  try {
    const { supabase, tenantId } = await contexto()
    await mudarEstadoComanda(supabase, tenantId, r.dados, estado)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível actualizar.') }
  }
  revalidar(r.dados)
  return { ok: true }
}

export async function transferirMesaAction(comandaId: string, mesaId: string): Promise<Resultado> {
  const r = validar(z.object({ comandaId: uuid, mesaId: uuid }), { comandaId, mesaId })
  if (!r.ok) return { ok: false, erro: 'Dados inválidos.' }
  try {
    const { supabase, tenantId } = await contexto()
    await transferirMesa(supabase, tenantId, r.dados.comandaId, r.dados.mesaId)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível transferir.') }
  }
  revalidar(r.dados.comandaId)
  return { ok: true }
}

export async function juntarComandasAction(destinoId: string, origemId: string): Promise<Resultado> {
  const r = validar(z.object({ destinoId: uuid, origemId: uuid }), { destinoId, origemId })
  if (!r.ok) return { ok: false, erro: 'Dados inválidos.' }
  try {
    const { supabase, tenantId } = await contexto()
    await juntarComandas(supabase, tenantId, r.dados.destinoId, r.dados.origemId)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível juntar.') }
  }
  revalidar(r.dados.destinoId)
  return { ok: true }
}

export async function fecharComandaAction(entrada: unknown): Promise<Resultado<{ total: number; troco: number }>> {
  const r = validar(esquemaFecharComanda, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contexto()
    const res = await fecharComanda(ctx.supabase, ctx.tenantId, r.dados.comandaId, r.dados, autorDe(ctx))
    revalidar(r.dados.comandaId)
    revalidatePath('/painel/caixa', 'layout')
    return { ok: true, ...res }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível fechar a conta.') }
  }
}
