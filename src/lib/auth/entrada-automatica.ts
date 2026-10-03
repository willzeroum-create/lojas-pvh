/**
 * Entrada automática enquanto a plataforma está em construção: no `pnpm dev`,
 * quem abre /painel, /admin ou /entrar sem sessão entra logo como o operador
 * mais antigo, sem ver o ecrã de login.
 *
 * Só em `next dev` aberto neste computador (localhost): o `next build` que vai
 * para a Vercel corre com NODE_ENV=production e nunca entra aqui. Usa o mesmo
 * magic link do console (gerado com a chave secreta, sem enviar e-mail) e a
 * rota /auth/confirmar, por isso a sessão é real e a RLS aplica-se como sempre.
 *
 * Para voltar a ter login em dev: PVH_LOGIN_OBRIGATORIO=1 no .env.local.
 */
import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { chaveSecreta, envPublico } from '@/lib/supabase/env'
import type { Database } from '@/lib/supabase/tipos'

const HOSTS_LOCAIS = new Set(['localhost', '127.0.0.1', '[::1]', '::1'])

function activa(request: NextRequest): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.PVH_LOGIN_OBRIGATORIO !== '1' &&
    HOSTS_LOCAIS.has(request.nextUrl.hostname)
  )
}

function falhar(motivo: string): null {
  console.warn(`[entrada automática] segue para /entrar: ${motivo}`)
  return null
}

/** Link de /auth/confirmar que abre sessão como o operador mais antigo; null fora de dev ou sem operador. */
export async function linkEntradaAutomatica(request: NextRequest, proximo: string): Promise<URL | null> {
  if (!activa(request)) return null

  const admin = createClient<Database>(envPublico().url, chaveSecreta(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: operador, error: erroOperador } = await admin
    .from('operadores')
    .select('user_id')
    .order('criado_em')
    .limit(1)
    .maybeSingle()
  if (!operador) return falhar(erroOperador?.message ?? 'não há operadores (pnpm operador)')

  const { data: utilizador } = await admin.auth.admin.getUserById(operador.user_id)
  if (!utilizador.user?.email) return falhar('o operador não tem e-mail no Auth')
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: utilizador.user.email })
  if (error || !data.properties?.hashed_token) return falhar(error?.message ?? 'link sem token')

  const destino = request.nextUrl.clone()
  destino.pathname = '/auth/confirmar'
  destino.search = ''
  destino.searchParams.set('token_hash', data.properties.hashed_token)
  destino.searchParams.set('type', 'magiclink')
  destino.searchParams.set('proximo', proximo)
  return destino
}
