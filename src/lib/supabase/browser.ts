'use client'

/**
 * Cliente Supabase para Client Components. Usa a chave publishable: tudo o
 * que consegue ler ou escrever passa por RLS. Usado no painel para Realtime e
 * upload de fotos.
 */
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './tipos'

let cliente: ReturnType<typeof createBrowserClient<Database>> | undefined

export function clienteBrowser() {
  cliente ??= createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
  return cliente
}
