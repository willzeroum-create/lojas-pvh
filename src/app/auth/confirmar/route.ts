import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { clienteServidor } from '@/lib/supabase/server'

/**
 * Entrada por link (magic link). O console gera o link na ficha do tenant e
 * a equipa envia-o ao comerciante por WhatsApp; ao abrir, a sessão fica
 * criada nos cookies e segue para o painel. Um link vale uma vez e expira.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const tokenHash = url.searchParams.get('token_hash')
  const tipo = url.searchParams.get('type') as EmailOtpType | null
  const proximo = url.searchParams.get('proximo') ?? '/painel'
  const destino = proximo.startsWith('/') && !proximo.startsWith('//') ? proximo : '/painel'

  if (!tokenHash || !tipo) redirect('/entrar?erro=link-invalido')

  const supabase = await clienteServidor()
  const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })
  if (error) redirect('/entrar?erro=link-invalido')

  redirect(destino)
}
