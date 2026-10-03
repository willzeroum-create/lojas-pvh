import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { COOKIE_IMPERSONACAO } from '@/lib/auth/impersonacao'
import { clienteServidor } from '@/lib/supabase/server'

/** Termina a sessão e limpa a impersonação. Só por POST, para não sair por um link acidental. */
export async function POST(request: Request) {
  const supabase = await clienteServidor()
  await supabase.auth.signOut()
  const jarra = await cookies()
  jarra.delete(COOKIE_IMPERSONACAO)
  return NextResponse.redirect(new URL('/entrar', request.url), { status: 303 })
}
