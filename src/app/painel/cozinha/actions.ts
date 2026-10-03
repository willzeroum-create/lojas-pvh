'use server'

/** Actions da cozinha: mudar o preparo dos itens, cancelar com motivo, estações e categorias. */
import { revalidatePath } from 'next/cache'
import { exigirAprovacao, exigirModulo } from '@/lib/auth/guardas'
import { cancelarItem, definirEstacaoDaCategoria, mudarPreparo, salvarEstacao } from '@/lib/dados/cozinha'
import { ErroDados, pedeGerente } from '@/lib/dados/erros'
import { esquemaCancelarItem, esquemaEstacao, esquemaPreparo } from '@/lib/validacao/comandas'
import { uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado = { ok: true } | { ok: false; erro: string; porCampo?: Record<string, string>; precisaGerente?: boolean }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

function revalidar() {
  revalidatePath('/painel/cozinha', 'layout')
  revalidatePath('/painel/comandas', 'layout')
  revalidatePath('/painel/pedidos')
}

export async function mudarPreparoAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('cozinha')
  const r = validar(esquemaPreparo, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    await mudarPreparo(supabase, tenantId, r.dados.itemIds, r.dados.estado)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível actualizar.') }
  }
  revalidar()
  return { ok: true }
}

export async function cancelarItemAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('cozinha')
  const r = validar(esquemaCancelarItem.and(z.object({ pinGerente: z.string().optional() })), entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    await exigirAprovacao(ctx, 'cancelar_item', `Cancelou um item na cozinha: ${r.dados.motivo}`, r.dados.pinGerente || undefined, r.dados.itemId)
    await cancelarItem(ctx.supabase, ctx.tenantId, r.dados.itemId, r.dados.motivo)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar o item.'), precisaGerente: pedeGerente(e) }
  }
  revalidar()
  return { ok: true }
}

export async function salvarEstacaoAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('cozinha')
  const r = validar(esquemaEstacao, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    await salvarEstacao(supabase, tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar a estação.') }
  }
  revalidar()
  return { ok: true }
}

const esquemaCategoriaEstacao = z.object({ categoriaId: uuid, estacaoId: uuid.nullable() })

export async function definirEstacaoDaCategoriaAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('cozinha')
  const r = validar(esquemaCategoriaEstacao, entrada)
  if (!r.ok) return { ok: false, erro: 'Dados inválidos' }
  try {
    await definirEstacaoDaCategoria(supabase, tenantId, r.dados.categoriaId, r.dados.estacaoId)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível actualizar a categoria.') }
  }
  revalidar()
  return { ok: true }
}
