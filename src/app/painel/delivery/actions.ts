'use server'

/**
 * Delivery no painel: bairros e taxas, entregadores (com o link para o
 * celular deles), despacho, conclusão e acerto do repasse.
 */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import {
  acertarEntregador,
  concluirEntrega,
  despacharEntrega,
  devolverEntrega,
  linkDoEntregador,
  quadroDeEntregas,
  removerZona,
  salvarEntregador,
  salvarZona,
  type EntregaNoPainel,
} from '@/lib/dados/delivery'
import { ErroDados } from '@/lib/dados/erros'
import { normalizarWhatsapp } from '@/lib/dominio/telefone'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { booleano, dinheiro, uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string> }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)
const revalidar = () => revalidatePath('/painel/delivery', 'page')

async function contextoGestao() {
  const ctx = await exigirModulo('delivery')
  if (!donoOuGerente(ctx.equipe)) throw new ErroDados('Só o gerente altera bairros, entregadores e acertos.')
  return ctx
}

const esquemaZona = z.object({
  id: z.preprocess((v) => (v === '' ? undefined : v), uuid.optional()),
  nome: z.string().trim().min(1, 'Informe o bairro').max(80),
  taxa: dinheiro.refine((v) => v <= 500, 'Taxa alta demais'),
  tempoMin: z.coerce.number().int().min(5, 'Mínimo de 5 minutos').max(240, 'No máximo 4 horas'),
  ativo: booleano,
})

export async function salvarZonaAction(entrada: unknown): Promise<Resultado> {
  const r = validar(esquemaZona, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contextoGestao()
    await salvarZona(ctx.supabase, ctx.tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar o bairro.') }
  }
  revalidar()
  return { ok: true }
}

export async function removerZonaAction(id: string): Promise<Resultado> {
  const r = validar(uuid, id)
  if (!r.ok) return { ok: false, erro: 'Bairro inválido.' }
  try {
    const ctx = await contextoGestao()
    await removerZona(ctx.supabase, ctx.tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível remover.') }
  }
  revalidar()
  return { ok: true }
}

const esquemaEntregador = z.object({
  id: z.preprocess((v) => (v === '' ? undefined : v), uuid.optional()),
  nome: z.string().trim().min(1, 'Informe o nome').max(60),
  whatsapp: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() ? normalizarWhatsapp(v) ?? 'invalido' : null),
    z.string().regex(/^[0-9]{12,13}$/, 'WhatsApp inválido').nullable(),
  ),
  repasse: dinheiro.refine((v) => v <= 500, 'Repasse alto demais'),
  ativo: booleano,
})

export async function salvarEntregadorAction(entrada: unknown): Promise<Resultado<{ id: string }>> {
  const r = validar(esquemaEntregador, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const ctx = await contextoGestao()
    const id = await salvarEntregador(ctx.supabase, ctx.tenantId, r.dados)
    revalidar()
    return { ok: true, id }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar o entregador.') }
  }
}

/** Link para o celular do entregador; `novo` revoga o anterior (celular perdido, ex-entregador). */
export async function linkEntregadorAction(entregadorId: string, novo = false): Promise<Resultado<{ link: string }>> {
  const r = validar(uuid, entregadorId)
  if (!r.ok) return { ok: false, erro: 'Entregador inválido.' }
  try {
    const ctx = await contextoGestao()
    return { ok: true, link: await linkDoEntregador(ctx.supabase, ctx.tenantId, r.dados, novo === true) }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível gerar o link.') }
  }
}

export async function acertarEntregadorAction(entregadorId: string): Promise<Resultado<{ quantidade: number; valor: number }>> {
  const r = validar(uuid, entregadorId)
  if (!r.ok) return { ok: false, erro: 'Entregador inválido.' }
  try {
    const ctx = await contextoGestao()
    const res = await acertarEntregador(ctx.supabase, ctx.tenantId, r.dados)
    revalidar()
    return { ok: true, ...res }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível acertar.') }
  }
}

/** Para o quadro se actualizar de tempos a tempos. */
export async function quadroDeEntregasAction(): Promise<Resultado<{ entregas: EntregaNoPainel[] }>> {
  const ctx = await exigirModulo('delivery')
  try {
    return { ok: true, entregas: await quadroDeEntregas(ctx.supabase, ctx.tenantId) }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível ler as entregas.') }
  }
}

export async function despacharAction(entregaId: string, entregadorId: string): Promise<Resultado> {
  const ctx = await exigirModulo('delivery')
  const r = validar(z.object({ entregaId: uuid, entregadorId: uuid }), { entregaId, entregadorId })
  if (!r.ok) return { ok: false, erro: 'Dados inválidos' }
  try {
    await despacharEntrega(ctx.supabase, ctx.tenantId, r.dados.entregaId, r.dados.entregadorId)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível despachar.') }
  }
  revalidar()
  return { ok: true }
}

const esquemaConcluir = z.object({
  entregaId: uuid,
  entregue: z.boolean(),
  ocorrencia: z.preprocess((v) => (typeof v === 'string' && v.trim() ? v.trim() : null), z.string().max(200).nullable()),
})

export async function concluirEntregaAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('delivery')
  const r = validar(esquemaConcluir, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    await concluirEntrega(ctx.supabase, ctx.tenantId, r.dados.entregaId, r.dados.entregue, r.dados.ocorrencia)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível concluir.') }
  }
  revalidar()
  revalidatePath('/painel', 'page')
  return { ok: true }
}

export async function devolverEntregaAction(entregaId: string): Promise<Resultado> {
  const ctx = await exigirModulo('delivery')
  const r = validar(uuid, entregaId)
  if (!r.ok) return { ok: false, erro: 'Entrega inválida.' }
  try {
    await devolverEntrega(ctx.supabase, ctx.tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível devolver.') }
  }
  revalidar()
  return { ok: true }
}
