'use server'

/**
 * Página do entregador (sem login): o token secreto do link identifica-o.
 * Só mexe nas entregas que estão com ele e em rota.
 */
import { revalidatePath } from 'next/cache'
import { concluirPeloEntregador, painelDoEntregador, type PainelDoEntregador } from '@/lib/dados/delivery'
import { ErroDados } from '@/lib/dados/erros'
import { uuid, validar, z } from '@/lib/validacao/zod'

type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string }

const esquema = z.object({
  token: z.string().regex(/^[0-9a-f]{48,64}$/),
  entregaId: uuid,
  entregue: z.boolean(),
  ocorrencia: z.preprocess((v) => (typeof v === 'string' && v.trim() ? v.trim() : null), z.string().max(200).nullable()),
})

export async function marcarEntregaAction(entrada: unknown): Promise<Resultado<{ painel: PainelDoEntregador | null }>> {
  const r = validar(esquema, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    await concluirPeloEntregador(r.dados.token, r.dados.entregaId, r.dados.entregue, r.dados.ocorrencia)
  } catch (e) {
    return { ok: false, erro: e instanceof ErroDados ? e.message : 'Não foi possível marcar. Tente de novo.' }
  }
  revalidatePath(`/entregador/${r.dados.token}`)
  return { ok: true, painel: await painelDoEntregador(r.dados.token) }
}

export async function atualizarPainelEntregadorAction(token: string): Promise<Resultado<{ painel: PainelDoEntregador }>> {
  if (typeof token !== 'string' || !/^[0-9a-f]{48,64}$/.test(token)) return { ok: false, erro: 'Link inválido.' }
  const painel = await painelDoEntregador(token)
  return painel ? { ok: true, painel } : { ok: false, erro: 'Link inválido ou desativado. Peça um novo à loja.' }
}
