import 'server-only'

/**
 * Guardas de autorização para layouts, páginas e Server Actions. Cada uma
 * devolve o contexto de que a rota precisa ou redirecciona.
 *
 * Com o módulo `equipe` ligado, o painel exige que alguém da equipe se
 * identifique com o PIN (cookie assinado); o papel dessa pessoa decide os
 * módulos que abre e as ações sensíveis que faz sem aprovação. A equipe
 * interna (operadores do console) passa sempre.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { aprovarComPinGerente, obterMembro, registarAuditoria } from '@/lib/dados/equipe'
import { ErroAprovacao } from '@/lib/dados/erros'
import { modulosAtivos } from '@/lib/dados/modulos'
import { ACOES_SENSIVEIS, papelAbreModulo, papelFazSemAprovacao, type AcaoSensivel, type Papel } from '@/lib/equipe/papeis'
import { lerSessaoEquipe } from '@/lib/equipe/pin'
import type { ModuloId } from '@/lib/modulos/catalogo'
import { clienteServidor, type Cliente } from '@/lib/supabase/server'
import { obterSessao, type Sessao, type TenantResumo } from './sessao'

export const COOKIE_EQUIPE = 'pvh_equipe'

export type ContextoTenant = {
  supabase: Cliente
  tenantId: string
}

export type MembroAtivo = { id: string; nome: string; papel: Papel }

export type ContextoPainel = ContextoTenant & {
  sessao: Sessao
  tenant: TenantResumo
  /** Módulos activos do tenant, já filtrados pelo papel de quem está a operar. */
  modulos: ReadonlySet<ModuloId>
  /** Quem da equipe está a operar (com o módulo `equipe` ligado); null sem equipe ou para a equipe interna. */
  equipe: MembroAtivo | null
  /** Equipe ligada e ninguém identificado ainda (só com `semEquipe`). */
  aguardandoEquipe: boolean
}

/** Lidos uma vez por pedido: layout, página e actions partilham o resultado. */
const modulosDoTenant = cache(async (tenantId: string) => modulosAtivos(await clienteServidor(), tenantId))

const membroDaSessao = cache(async (tenantId: string): Promise<MembroAtivo | null> => {
  const s = lerSessaoEquipe((await cookies()).get(COOKIE_EQUIPE)?.value)
  if (!s || s.tenantId !== tenantId) return null
  const m = await obterMembro(await clienteServidor(), tenantId, s.membroId)
  return m && m.ativo ? { id: m.id, nome: m.nome, papel: m.papel } : null
})

export async function exigirSessao(): Promise<Sessao> {
  const sessao = await obterSessao()
  if (!sessao) redirect('/entrar')
  return sessao
}

/**
 * Painel do comerciante: precisa de um tenant activo (próprio ou impersonado).
 * `semEquipe` é só para a própria tela de escolher quem opera (evita o ciclo).
 */
export async function exigirPainel(opcoes: { semEquipe?: boolean } = {}): Promise<ContextoPainel> {
  const sessao = await exigirSessao()
  if (!sessao.tenantAtivo) {
    // Operador sem tenant escolhido vai ao console escolher; outro utilizador não tem para onde ir.
    redirect(sessao.operador ? '/admin' : '/entrar?erro=sem-tenant')
  }
  const tenantId = sessao.tenantAtivo.id
  const todos = await modulosDoTenant(tenantId)
  let equipe: MembroAtivo | null = null
  let aguardandoEquipe = false
  let modulos: ReadonlySet<ModuloId> = todos

  if (todos.has('equipe') && !sessao.operador) {
    equipe = await membroDaSessao(tenantId)
    if (!equipe && !opcoes.semEquipe) redirect('/painel/equipe/entrar')
    aguardandoEquipe = !equipe
    if (equipe) {
      const papel = equipe.papel
      modulos = new Set([...todos].filter((m) => papelAbreModulo(papel, m)))
    }
  }

  return {
    sessao,
    tenant: sessao.tenantAtivo,
    tenantId,
    supabase: await clienteServidor(),
    modulos,
    equipe,
    aguardandoEquipe,
  }
}

/** Rota ou action de um módulo: sem o módulo ligado (ou sem o papel), volta ao início do painel. */
export async function exigirModulo(modulo: ModuloId): Promise<ContextoPainel> {
  const contexto = await exigirPainel()
  if (!contexto.modulos.has(modulo)) redirect('/painel')
  return contexto
}

/** Nome que assina as ações: a pessoa da equipe, o operador interno ou o e-mail da conta. */
export function autorDe(ctx: Pick<ContextoPainel, 'equipe' | 'sessao'>): string {
  return ctx.equipe?.nome ?? ctx.sessao.operador?.nome ?? ctx.sessao.email ?? 'Equipe'
}

/**
 * Ação sensível: passa se não há equipe ligada, se o papel a faz sozinho, ou
 * com o PIN de um gerente. Fica na auditoria em qualquer caso. Lança
 * `ErroDados` com mensagem para o ecrã se faltar a aprovação.
 */
export async function exigirAprovacao(
  ctx: ContextoPainel,
  acao: AcaoSensivel,
  descricao: string,
  pinGerente?: string,
  alvoId?: string,
): Promise<{ aprovadoPor: string | null }> {
  let aprovadoPor: string | null = null
  if (ctx.equipe && !papelFazSemAprovacao(ctx.equipe.papel, acao)) {
    if (!pinGerente) throw new ErroAprovacao(`${ACOES_SENSIVEIS[acao]} precisa do PIN de um gerente.`)
    aprovadoPor = await aprovarComPinGerente(ctx.tenantId, pinGerente)
  }
  await registarAuditoria(ctx.supabase, ctx.tenantId, {
    quem: autorDe(ctx),
    papel: ctx.equipe?.papel ?? (ctx.sessao.operador ? 'operador' : 'conta'),
    aprovadoPor,
    acao,
    descricao,
    alvoId,
  })
  return { aprovadoPor }
}

/** Console interno: só operadores. */
export async function exigirConsole(): Promise<{ sessao: Sessao; supabase: Cliente }> {
  const sessao = await exigirSessao()
  if (!sessao.operador) redirect('/painel')
  return { sessao, supabase: await clienteServidor() }
}
