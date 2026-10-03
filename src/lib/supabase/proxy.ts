/**
 * Refresca a sessão em cada pedido às áreas autenticadas e redirecciona quem
 * não tem sessão para `/entrar` (em dev, entra logo como operador: ver
 * `entrada-automatica.ts`). Corre no `proxy.ts` (Next.js 16).
 *
 * `getClaims()` valida a assinatura do JWT localmente; nunca usamos
 * `getSession()` no servidor.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { linkEntradaAutomatica } from '@/lib/auth/entrada-automatica'
import { envPublico } from './env'

const AREAS_PROTEGIDAS = ['/painel', '/admin']

export async function atualizarSessao(request: NextRequest): Promise<NextResponse> {
  const { url, chave } = envPublico()
  let resposta = NextResponse.next({ request })

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(lista) {
        for (const { name, value } of lista) request.cookies.set(name, value)
        resposta = NextResponse.next({ request })
        for (const { name, value, options } of lista) resposta.cookies.set(name, value, options)
      },
    },
  })

  const { data } = await supabase.auth.getClaims()
  const autenticado = Boolean(data?.claims)
  const caminho = request.nextUrl.pathname
  const protegida = AREAS_PROTEGIDAS.some((area) => caminho.startsWith(area))

  // Em dev, sem sessão, entra-se logo como operador. Em /entrar com `erro` não: evita um ciclo se o link falhar.
  if (!autenticado && (protegida || (caminho === '/entrar' && !request.nextUrl.searchParams.has('erro')))) {
    const proximo = protegida
      ? caminho + request.nextUrl.search
      : (request.nextUrl.searchParams.get('proximo') ?? '/admin')
    const automatica = await linkEntradaAutomatica(request, proximo)
    if (automatica) return NextResponse.redirect(automatica)
  }

  if (!autenticado && protegida) {
    const destino = request.nextUrl.clone()
    destino.pathname = '/entrar'
    destino.search = `?proximo=${encodeURIComponent(caminho)}`
    return NextResponse.redirect(destino)
  }

  if (autenticado && caminho === '/entrar') {
    const destino = request.nextUrl.clone()
    destino.pathname = '/painel'
    destino.search = ''
    return NextResponse.redirect(destino)
  }

  return resposta
}
