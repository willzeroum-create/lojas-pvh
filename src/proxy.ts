import type { NextRequest } from 'next/server'
import { atualizarSessao } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return atualizarSessao(request)
}

/**
 * Só as áreas com sessão passam por aqui. A página pública do comerciante
 * não toca em cookies: fica mais rápida e cacheável pelo CDN.
 */
export const config = {
  matcher: ['/painel/:path*', '/admin/:path*', '/entrar'],
}
