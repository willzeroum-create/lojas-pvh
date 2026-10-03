'use server'

/**
 * Ponto: bater no relógio (qualquer pessoa da equipe, com o seu PIN), e o
 * espelho, batidas manuais, anulações e jornada (dono ou gerente; ajustes
 * pedem o PIN de um gerente e ficam na auditoria).
 */
import { revalidatePath } from 'next/cache'
import { autorDe, exigirAprovacao, exigirModulo } from '@/lib/auth/guardas'
import { ErroDados, pedeGerente } from '@/lib/dados/erros'
import { anularBatida, baterPonto, configurarPontoMembro, detalheBatida, lancarBatidaManual, pessoasNoRelogio, type PessoaNoRelogio } from '@/lib/dados/ponto'
import { ROTULO_BATIDA } from '@/lib/dominio/ponto'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string>; precisaGerente?: boolean }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)
const tipoBatida = z.enum(['entrada', 'saida_intervalo', 'volta_intervalo', 'saida'])
const pinGerente = z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(/^\d{4,6}$/).optional())

async function contextoGestao() {
  const ctx = await exigirModulo('ponto')
  if (!donoOuGerente(ctx.equipe)) throw new ErroDados('Só o gerente ajusta o ponto.')
  return ctx
}

const esquemaBater = z.object({
  membroId: uuid,
  pin: z.string().regex(/^\d{4,6}$/, 'PIN de 4 a 6 números'),
  tipo: tipoBatida,
  foto: z.string().max(800_000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  precisao: z.number().min(0).max(100_000).optional(),
  dispositivo: z.string().max(200).optional(),
})

export async function baterPontoAction(
  entrada: unknown,
): Promise<Resultado<{ nome: string; rotulo: string; momento: string; comFoto: boolean; pessoas: PessoaNoRelogio[] }>> {
  const ctx = await exigirModulo('ponto')
  const r = validar(esquemaBater, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const b = await baterPonto(ctx.tenantId, r.dados)
    revalidatePath('/painel', 'layout')
    return { ok: true, nome: b.nome, rotulo: ROTULO_BATIDA[b.tipo], momento: b.momento, comFoto: b.comFoto, pessoas: await pessoasNoRelogio(ctx.supabase, ctx.tenantId) }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar o ponto.') }
  }
}

/** O relógio actualiza a lista de tempos a tempos (quem entrou noutro aparelho). */
export async function pessoasNoRelogioAction(): Promise<Resultado<{ pessoas: PessoaNoRelogio[] }>> {
  const ctx = await exigirModulo('ponto')
  try {
    return { ok: true, pessoas: await pessoasNoRelogio(ctx.supabase, ctx.tenantId) }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível ler o ponto.') }
  }
}

export async function detalheBatidaAction(batidaId: string) {
  try {
    const ctx = await contextoGestao()
    const r = validar(uuid, batidaId)
    if (!r.ok) return { ok: false as const, erro: 'Batida inválida.' }
    return { ok: true as const, ...(await detalheBatida(ctx.supabase, ctx.tenantId, r.dados)) }
  } catch (e) {
    return { ok: false as const, erro: mensagem(e, 'Não foi possível abrir a batida.') }
  }
}

const esquemaManual = z.object({
  membroId: uuid,
  tipo: tipoBatida,
  // "AAAA-MM-DDTHH:MM" do input datetime-local, na hora de Porto Velho.
  momentoLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Data e hora inválidas'),
  motivo: z.string().trim().min(5, 'Explique o motivo (mín. 5 caracteres)').max(300),
  pinGerente,
})

export async function lancarBatidaManualAction(entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaManual, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contextoGestao()
    const momento = new Date(`${r.dados.momentoLocal}:00-04:00`).toISOString()
    await exigirAprovacao(ctx, 'ajustar_ponto', `Lançou ${ROTULO_BATIDA[r.dados.tipo].toLowerCase()} manual: ${r.dados.motivo}`, r.dados.pinGerente, r.dados.membroId)
    await lancarBatidaManual(ctx.supabase, ctx.tenantId, { membroId: r.dados.membroId, tipo: r.dados.tipo, momento, motivo: r.dados.motivo }, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível lançar a batida.'), precisaGerente: pedeGerente(e) }
  }
  revalidatePath('/painel', 'layout')
  return { ok: true }
}

const esquemaAnular = z.object({ batidaId: uuid, motivo: z.string().trim().min(5, 'Explique o motivo (mín. 5 caracteres)').max(300), pinGerente })

export async function anularBatidaAction(entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaAnular, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contextoGestao()
    await exigirAprovacao(ctx, 'ajustar_ponto', `Anulou uma batida de ponto: ${r.dados.motivo}`, r.dados.pinGerente, r.dados.batidaId)
    await anularBatida(ctx.supabase, ctx.tenantId, r.dados.batidaId, r.dados.motivo, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível anular a batida.'), precisaGerente: pedeGerente(e) }
  }
  revalidatePath('/painel', 'layout')
  return { ok: true }
}

const esquemaJornada = z.object({
  membroId: uuid,
  registraPonto: z.boolean(),
  jornadaMinutos: z.coerce.number().int().min(0, 'Jornada inválida').max(720, 'No máximo 12 horas'),
})

export async function configurarPontoMembroAction(entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaJornada, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contextoGestao()
    await configurarPontoMembro(ctx.supabase, ctx.tenantId, r.dados.membroId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar.') }
  }
  revalidatePath('/painel', 'layout')
  return { ok: true }
}
