'use server'

/**
 * Actions do módulo Financeiro. Todas passam por `exigirModulo('financeiro')`.
 * Nada se apaga: pagamento errado estorna-se, conta errada cancela-se.
 */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { cancelarTitulo, criarTitulo, estornarBaixa, registarBaixa } from '@/lib/dados/financeiro'
import { esquemaBaixa, esquemaTitulo } from '@/lib/validacao/financeiro'
import { uuid, validar } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string> }

const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

function revalidar(tituloId?: string) {
  revalidatePath('/painel/financeiro', 'layout')
  if (tituloId) revalidatePath(`/painel/financeiro/contas/${tituloId}`)
}

export async function criarContaAction(entrada: unknown): Promise<Resultado<{ id: string }>> {
  const { supabase, tenantId } = await exigirModulo('financeiro')
  const r = validar(esquemaTitulo, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const id = await criarTitulo(supabase, tenantId, { ...r.dados, origem: 'manual', origemId: undefined })
    revalidar(id)
    return { ok: true, id }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível criar a conta.') }
  }
}

export async function registarPagamentoAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('financeiro')
  const r = validar(esquemaBaixa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    await registarBaixa(supabase, tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar o pagamento.') }
  }
  revalidar()
  return { ok: true }
}

export async function estornarPagamentoAction(baixaId: string): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('financeiro')
  const r = validar(uuid, baixaId)
  if (!r.ok) return { ok: false, erro: 'Pagamento inválido.' }
  try {
    await estornarBaixa(supabase, tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível estornar.') }
  }
  revalidar()
  return { ok: true }
}

export async function cancelarContaAction(tituloId: string): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('financeiro')
  const r = validar(uuid, tituloId)
  if (!r.ok) return { ok: false, erro: 'Conta inválida.' }
  try {
    await cancelarTitulo(supabase, tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar.') }
  }
  revalidar(r.dados)
  return { ok: true }
}
