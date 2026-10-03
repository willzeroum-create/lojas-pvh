import 'server-only'

/**
 * Quem está autenticado e sobre que tenant opera.
 *
 * O "tenant activo" é:
 *   1. o tenant impersonado (cookie `pvh_tenant`), se o utilizador for operador;
 *   2. senão, o primeiro tenant de que é membro.
 *
 * Memoizado por pedido com `cache`: layouts e páginas podem chamar à vontade.
 */
import { cache } from 'react'
import { cookies } from 'next/headers'
import { clienteServidor } from '@/lib/supabase/server'
import type { PapelMembro, TenantStatus } from '@/lib/supabase/tipos'
import { COOKIE_IMPERSONACAO } from './impersonacao'

export type TenantResumo = {
  id: string
  slug: string
  nome_fantasia: string
  status: TenantStatus
}

export type Sessao = {
  userId: string
  email: string | null
  operador: { nome: string } | null
  tenants: Array<TenantResumo & { papel: PapelMembro }>
  tenantAtivo: TenantResumo | null
  impersonando: boolean
}

export const obterSessao = cache(async (): Promise<Sessao | null> => {
  const supabase = await clienteServidor()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  if (!claims?.sub) return null

  const userId = claims.sub
  const email = typeof claims.email === 'string' ? claims.email : null

  const [membros, operador] = await Promise.all([
    supabase.from('membros').select('papel, tenants(id, slug, nome_fantasia, status)').eq('user_id', userId),
    supabase.from('operadores').select('nome').eq('user_id', userId).maybeSingle(),
  ])

  const tenants = (membros.data ?? []).flatMap((m) => (m.tenants ? [{ ...m.tenants, papel: m.papel }] : []))

  let tenantAtivo: TenantResumo | null = tenants[0] ?? null
  let impersonando = false

  if (operador.data) {
    const jarra = await cookies()
    const idImpersonado = jarra.get(COOKIE_IMPERSONACAO)?.value
    if (idImpersonado) {
      const { data: t } = await supabase
        .from('tenants')
        .select('id, slug, nome_fantasia, status')
        .eq('id', idImpersonado)
        .maybeSingle()
      if (t) {
        tenantAtivo = t
        impersonando = true
      }
    }
  }

  return { userId, email, operador: operador.data ?? null, tenants, tenantAtivo, impersonando }
})
