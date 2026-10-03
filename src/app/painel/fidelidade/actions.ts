'use server'

/**
 * Cashback: configuração do programa e ajustes (dono ou gerente; ajuste pede
 * o PIN de um gerente), e a consulta de saldo que o PDV faz ao escolher o
 * cliente (qualquer pessoa no caixa).
 */
import { revalidatePath } from 'next/cache'
import { autorDe, exigirAprovacao, exigirModulo } from '@/lib/auth/guardas'
import { ErroDados, pedeGerente } from '@/lib/dados/erros'
import { ajustarCashback, cashbackParaVenda, extratoCashback, salvarConfigCashback, type ExtratoCashback } from '@/lib/dados/fidelidade'
import { formatarBRL } from '@/lib/dominio/moeda'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { booleano, dinheiro, uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string>; precisaGerente?: boolean }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

const esquemaConfig = z.object({
  ativo: booleano,
  percentual: z.coerce.number().gt(0, 'Maior que zero').max(50, 'No máximo 50 %'),
  validadeDias: z.coerce.number().int().min(7, 'Mínimo de 7 dias').max(730, 'No máximo 2 anos'),
  resgateMinimo: dinheiro,
  limiteResgatePct: z.coerce.number().gt(0, 'Maior que zero').max(100, 'No máximo 100 %'),
})

export async function salvarConfigCashbackAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('fidelidade')
  if (!donoOuGerente(ctx.equipe)) return { ok: false, erro: 'Só o gerente muda o cashback.' }
  const r = validar(esquemaConfig, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    await salvarConfigCashback(ctx.supabase, ctx.tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar.') }
  }
  revalidatePath('/painel', 'layout')
  return { ok: true }
}

export async function extratoCashbackAction(pessoaId: string): Promise<Resultado<{ extrato: ExtratoCashback }>> {
  const ctx = await exigirModulo('fidelidade')
  const r = validar(uuid, pessoaId)
  if (!r.ok) return { ok: false, erro: 'Cliente inválido.' }
  const extrato = await extratoCashback(ctx.supabase, ctx.tenantId, r.dados)
  return extrato ? { ok: true, extrato } : { ok: false, erro: 'Cliente não encontrado.' }
}

const esquemaAjuste = z.object({
  pessoaId: uuid,
  valor: z.coerce.number().refine((v) => v !== 0 && Math.abs(v) <= 10_000, 'Valor inválido'),
  motivo: z.string().trim().min(5, 'Explique o motivo (mín. 5 caracteres)').max(200),
  pinGerente: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(/^\d{4,6}$/).optional()),
})

export async function ajustarCashbackAction(entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaAjuste, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await exigirModulo('fidelidade')
    const valor = Math.round(r.dados.valor * 100) / 100
    await exigirAprovacao(ctx, 'ajustar_cashback', `Ajustou ${formatarBRL(valor)} de cashback: ${r.dados.motivo}`, r.dados.pinGerente, r.dados.pessoaId)
    await ajustarCashback(ctx.supabase, ctx.tenantId, r.dados.pessoaId, valor, r.dados.motivo, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível ajustar.'), precisaGerente: pedeGerente(e) }
  }
  revalidatePath('/painel', 'layout')
  return { ok: true }
}

/** PDV: ao escolher o cliente, quanto cashback tem e quanto pode usar nesta compra. */
export async function cashbackParaVendaAction(
  pessoaId: string,
  totalCompra: number,
): Promise<Resultado<{ ativo: boolean; saldo: number; maximo: number; minimo: number; limitePct: number }>> {
  const ctx = await exigirModulo('pdv')
  const r = validar(z.object({ pessoaId: uuid, totalCompra: z.number().min(0).max(1_000_000) }), { pessoaId, totalCompra })
  if (!r.ok) return { ok: false, erro: 'Dados inválidos' }
  try {
    return { ok: true, ...(await cashbackParaVenda(ctx.supabase, ctx.tenantId, r.dados.pessoaId, r.dados.totalCompra)) }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível ler o cashback.') }
  }
}
