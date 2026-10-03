'use server'

/**
 * Integrações do cliente, configuradas pela equipa no console: nota fiscal
 * (Focus NFe) e Pix (Mercado Pago). Os tokens são cifrados e nunca voltam
 * para o ecrã; deixar o campo vazio mantém o token guardado.
 */
import { revalidatePath } from 'next/cache'
import { exigirConsole } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { configurarFiscal } from '@/lib/dados/fiscal'
import { configurarPix } from '@/lib/dados/pix'
import { lerDocumento } from '@/lib/dominio/documento'
import { uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado = { ok: true } | { ok: false; erro: string }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)
const opcional = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)

const esquemaFiscal = z.object({
  tenantId: uuid,
  ambiente: z.enum(['homologacao', 'producao']),
  cnpj: z.string().refine((s) => lerDocumento(s)?.tipo === 'pj', 'CNPJ inválido'),
  inscricaoEstadual: z.string().trim().regex(/^[0-9]{2,14}$|^ISENTO$/i, 'Inscrição estadual inválida'),
  regime: z.coerce.number().pipe(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])),
  naturezaOperacao: z.preprocess(opcional, z.string().trim().max(60).optional()),
  token: z.preprocess(opcional, z.string().trim().min(10).max(200).optional()),
})

export async function configurarFiscalAction(entrada: unknown): Promise<Resultado> {
  const { supabase } = await exigirConsole()
  const r = validar(esquemaFiscal, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  const { tenantId, ambiente, token, ...config } = r.dados
  try {
    await configurarFiscal(supabase, tenantId, { config, ambiente, token })
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar a configuração fiscal.') }
  }
  revalidatePath(`/admin/tenants/${tenantId}`, 'layout')
  return { ok: true }
}

const esquemaPix = z.object({
  tenantId: uuid,
  ambiente: z.enum(['homologacao', 'producao']),
  token: z.preprocess(opcional, z.string().trim().regex(/^(APP_USR|TEST)-[\w-]{20,}$/, 'Token do Mercado Pago inválido (começa por APP_USR- ou TEST-)').optional()),
  segredoWebhook: z.preprocess(opcional, z.string().trim().min(16).max(200).optional()),
})

export async function configurarPixAction(entrada: unknown): Promise<Resultado> {
  const { supabase } = await exigirConsole()
  const r = validar(esquemaPix, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  const { tenantId, ...d } = r.dados
  try {
    await configurarPix(supabase, tenantId, d)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar a configuração do Pix.') }
  }
  revalidatePath(`/admin/tenants/${tenantId}`, 'layout')
  return { ok: true }
}
