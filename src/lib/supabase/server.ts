import 'server-only'

/**
 * Clientes Supabase para o servidor (Server Components, Server Actions, Route
 * Handlers).
 *
 *   clienteServidor()   sessão do utilizador via cookies — RLS aplica-se
 *   clienteAnonimo()    sem sessão — só vê o que as políticas `anon` permitem
 *   clienteAdmin()      chave secreta — ignora RLS; usar só depois de validar
 *                       a autorização em código
 */
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { chaveSecreta, envPublico } from './env'
import type { Database } from './tipos'

export type Cliente = SupabaseClient<Database>

export async function clienteServidor(): Promise<Cliente> {
  // cookies() primeiro: numa tentativa de pré-render marca a rota como dinâmica antes de tocar no env.
  const jarra = await cookies()
  const { url, chave } = envPublico()
  return createServerClient<Database>(url, chave, {
    cookies: {
      getAll() {
        return jarra.getAll()
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) jarra.set(name, value, options)
        } catch {
          // Server Components não podem escrever cookies; o proxy.ts trata do refresh.
        }
      },
    },
  })
}

export function clienteAnonimo(): Cliente {
  const { url, chave } = envPublico()
  return createClient<Database>(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function clienteAdmin(): Cliente {
  const { url } = envPublico()
  return createClient<Database>(url, chaveSecreta(), {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
