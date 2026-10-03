'use server'

/**
 * Actions da equipe: entrar com o PIN no tablet da loja, trocar de pessoa e
 * gerir quem tem acesso. Gerir a equipe é do gerente (ou da equipe interna);
 * quando ainda não há ninguém, o dono cria o primeiro gerente.
 */
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { autorDe, COOKIE_EQUIPE, exigirPainel } from '@/lib/auth/guardas'
import { entrarComPin, listarEquipe, registarAuditoria, salvarMembro } from '@/lib/dados/equipe'
import { ErroDados } from '@/lib/dados/erros'
import { PAPEIS, type Papel } from '@/lib/equipe/papeis'
import { assinarSessaoEquipe } from '@/lib/equipe/pin'
import { booleano, uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado = { ok: true } | { ok: false; erro: string; porCampo?: Record<string, string> }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

const esquemaEntrar = z.object({ membroId: uuid, pin: z.string().regex(/^\d{4,6}$/, 'PIN de 4 a 6 números') })
const esquemaMembro = z.object({
  id: z.preprocess((v) => (v === '' ? undefined : v), uuid.optional()),
  nome: z.string().trim().min(1, 'Nome').max(60),
  papel: z.enum(Object.keys(PAPEIS) as [Papel, ...Papel[]]),
  pin: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(/^\d{4,6}$/, 'PIN de 4 a 6 números').optional()),
  ativo: booleano,
})

export async function entrarEquipeAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirPainel({ semEquipe: true })
  const r = validar(esquemaEntrar, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const membro = await entrarComPin(ctx.tenantId, r.dados.membroId, r.dados.pin)
    ;(await cookies()).set(COOKIE_EQUIPE, assinarSessaoEquipe(membro.id, ctx.tenantId), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 12 * 60 * 60,
    })
    await registarAuditoria(ctx.supabase, ctx.tenantId, { quem: membro.nome, papel: membro.papel, acao: 'entrada', descricao: `${membro.nome} começou a operar` })
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível entrar.') }
  }
  revalidatePath('/painel', 'layout')
  return { ok: true }
}

export async function sairEquipeAction(): Promise<void> {
  ;(await cookies()).delete(COOKIE_EQUIPE)
  revalidatePath('/painel', 'layout')
}

export async function salvarMembroAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirPainel({ semEquipe: true })
  const r = validar(esquemaMembro, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const equipe = await listarEquipe(ctx.supabase, ctx.tenantId)
    const primeiro = equipe.length === 0
    const pode = ctx.sessao.operador || ctx.equipe?.papel === 'gerente' || (primeiro && !ctx.equipe)
    if (!pode) return { ok: false, erro: 'Só um gerente gere a equipe.' }
    if (primeiro && r.dados.papel !== 'gerente') return { ok: false, erro: 'A primeira pessoa da equipe tem de ser gerente.' }
    const id = await salvarMembro(ctx.supabase, ctx.tenantId, r.dados)
    await registarAuditoria(ctx.supabase, ctx.tenantId, {
      quem: autorDe(ctx),
      papel: ctx.equipe?.papel ?? 'conta',
      acao: r.dados.id ? 'equipe_alterada' : 'equipe_nova',
      descricao: `${r.dados.id ? 'Alterou' : 'Cadastrou'} ${r.dados.nome} como ${PAPEIS[r.dados.papel]}${r.dados.pin && r.dados.id ? ' (PIN novo)' : ''}`,
      alvoId: id,
    })
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar.') }
  }
  revalidatePath('/painel/equipe', 'layout')
  return { ok: true }
}
