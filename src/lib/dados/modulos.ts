import 'server-only'

import { modulosPadrao, podeDesligar, podeLigar, resolverAtivos, type ModuloId } from '@/lib/modulos/catalogo'
import type { Cliente } from '@/lib/supabase/server'
import type { TenantModuloLinha } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'

/** Linhas de `tenant_modulos` do tenant, para o console (inclui os desligados). */
export async function listarModulosDoTenant(supabase: Cliente, tenantId: string): Promise<TenantModuloLinha[]> {
  return ouErro(
    await supabase.from('tenant_modulos').select('*').eq('tenant_id', tenantId),
    'Não foi possível ler os módulos',
  )
}

/** Módulos efectivamente activos (essenciais incluídos, dependências resolvidas). */
export async function modulosAtivos(supabase: Cliente, tenantId: string): Promise<Set<ModuloId>> {
  const linhas = ouErro(
    await supabase.from('tenant_modulos').select('modulo').eq('tenant_id', tenantId).eq('ativo', true),
    'Não foi possível ler os módulos',
  )
  return resolverAtivos(linhas.map((l) => l.modulo))
}

/** A página pública só lê se um módulo está ligado (grant de colunas para `anon`). */
export async function moduloLigado(supabase: Cliente, tenantId: string, modulo: ModuloId): Promise<boolean> {
  return (await modulosAtivos(supabase, tenantId)).has(modulo)
}

/**
 * Liga ou desliga um módulo, respeitando o catálogo: não se liga o que está
 * planejado ou sem as dependências, nem se desliga aquilo de que outro módulo
 * ligado depende. Só operadores passam a RLS desta escrita.
 */
export async function definirModulo(
  supabase: Cliente,
  tenantId: string,
  modulo: string,
  ativo: boolean,
): Promise<void> {
  const atuais = await modulosAtivos(supabase, tenantId)
  const verificacao = ativo ? podeLigar(modulo, atuais) : podeDesligar(modulo, atuais)
  if (!verificacao.ok) throw new ErroDados(verificacao.motivo)

  garantir(
    await supabase.from('tenant_modulos').upsert(
      {
        tenant_id: tenantId,
        modulo,
        ativo,
        ...(ativo ? { ativado_em: new Date().toISOString() } : {}),
      },
      { onConflict: 'tenant_id,modulo' },
    ),
    'Não foi possível guardar o módulo',
  )

  // Módulos que precisam de dados de partida ao serem ligados.
  if (ativo && modulo === 'financeiro') {
    garantir(await supabase.rpc('financeiro_padrao', { p_tenant: tenantId }), 'Não foi possível preparar o financeiro')
  }
  if (ativo && modulo === 'cozinha') {
    garantir(await supabase.rpc('cozinha_padrao', { p_tenant: tenantId }), 'Não foi possível preparar a cozinha')
  }
}

/** Empresa nova: liga os módulos por defeito do catálogo. */
export async function ligarModulosPadrao(admin: Cliente, tenantId: string): Promise<void> {
  const agora = new Date().toISOString()
  garantir(
    await admin.from('tenant_modulos').upsert(
      modulosPadrao().map((modulo) => ({ tenant_id: tenantId, modulo, ativo: true, ativado_em: agora })),
      { onConflict: 'tenant_id,modulo', ignoreDuplicates: true },
    ),
    'Não foi possível ligar os módulos da empresa',
  )
}
