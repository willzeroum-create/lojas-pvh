'use server'

/**
 * Pix no painel: gerar o QR de um valor (PDV, comanda) ou do saldo de uma
 * parcela a receber, acompanhar o estado e cancelar. Exige o módulo `bancos`.
 */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { cancelarCobrancaPix, cobrarParcelaPorPix, consultarCobrancaPix, criarCobrancaPix, type CobrancaPix } from '@/lib/dados/pix'
import { dinheiro, uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

const esquemaGerar = z.object({
  valor: dinheiro.refine((v) => v > 0, 'Valor inválido'),
  descricao: z.string().trim().min(1).max(140),
  origem: z.enum(['pdv', 'comanda', 'manual']),
  origemId: z.preprocess((v) => (v === '' ? undefined : v), uuid.optional()),
})

export async function gerarPixAction(entrada: unknown): Promise<Resultado<{ cobranca: CobrancaPix }>> {
  const ctx = await exigirModulo('bancos')
  const r = validar(esquemaGerar, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    return { ok: true, cobranca: await criarCobrancaPix(ctx.supabase, ctx.tenantId, r.dados) }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível gerar o Pix.') }
  }
}

export async function cobrarParcelaPixAction(parcelaId: string): Promise<Resultado<{ cobranca: CobrancaPix }>> {
  const ctx = await exigirModulo('bancos')
  const r = validar(uuid, parcelaId)
  if (!r.ok) return { ok: false, erro: 'Parcela inválida.' }
  try {
    const cobranca = await cobrarParcelaPorPix(ctx.supabase, ctx.tenantId, r.dados)
    revalidatePath('/painel/financeiro', 'layout')
    return { ok: true, cobranca }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível gerar o Pix.') }
  }
}

/** Para a tela do QR perguntar de tempos a tempos se o Pix já caiu. */
export async function estadoPixAction(cobrancaId: string): Promise<Resultado<{ cobranca: CobrancaPix }>> {
  const ctx = await exigirModulo('bancos')
  const r = validar(uuid, cobrancaId)
  if (!r.ok) return { ok: false, erro: 'Cobrança inválida.' }
  try {
    const cobranca = await consultarCobrancaPix(ctx.supabase, ctx.tenantId, r.dados)
    if (cobranca.estado === 'pago') revalidatePath('/painel/financeiro', 'layout')
    return { ok: true, cobranca }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível consultar o Pix.') }
  }
}

export async function cancelarPixAction(cobrancaId: string): Promise<Resultado> {
  const ctx = await exigirModulo('bancos')
  const r = validar(uuid, cobrancaId)
  if (!r.ok) return { ok: false, erro: 'Cobrança inválida.' }
  try {
    await cancelarCobrancaPix(ctx.supabase, ctx.tenantId, r.dados)
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar.') }
  }
}
