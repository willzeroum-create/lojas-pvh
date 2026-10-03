import 'server-only'

/**
 * Guardas de autorização para layouts, páginas e Server Actions. Cada uma
 * devolve o contexto de que a rota precisa ou redirecciona.
 */
import { redirect } from 'next/navigation'
import { clienteServidor, type Cliente } from '@/lib/supabase/server'
import { obterSessao, type Sessao, type TenantResumo } from './sessao'

export type ContextoTenant = {
  supabase: Cliente
  tenantId: string
}

export type ContextoPainel = ContextoTenant & {
  sessao: Sessao
  tenant: TenantResumo
}

export async function exigirSessao(): Promise<Sessao> {
  const sessao = await obterSessao()
  if (!sessao) redirect('/entrar')
  return sessao
}

/** Painel do comerciante: precisa de um tenant activo (próprio ou impersonado). */
export async function exigirPainel(): Promise<ContextoPainel> {
  const sessao = await exigirSessao()
  if (!sessao.tenantAtivo) {
    // Operador sem tenant escolhido vai ao console escolher; outro utilizador não tem para onde ir.
    redirect(sessao.operador ? '/admin' : '/entrar?erro=sem-tenant')
  }
  return {
    sessao,
    tenant: sessao.tenantAtivo,
    tenantId: sessao.tenantAtivo.id,
    supabase: await clienteServidor(),
  }
}

/** Console interno: só operadores. */
export async function exigirConsole(): Promise<{ sessao: Sessao; supabase: Cliente }> {
  const sessao = await exigirSessao()
  if (!sessao.operador) redirect('/painel')
  return { sessao, supabase: await clienteServidor() }
}
