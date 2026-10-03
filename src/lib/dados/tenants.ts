import 'server-only'

import type { Endereco } from '@/lib/dominio/endereco'
import type { Cliente } from '@/lib/supabase/server'
import type { CadeiaEtapaLinha, TenantLinha, TenantStatus } from '@/lib/supabase/tipos'
import type { ContaTenant, FichaTenant, NovoTenant } from '@/lib/validacao/tenant'
import { ErroDados, garantir, ouErro } from './erros'
import { materializarCadeia } from './cadeia'
import { ligarModulosPadrao } from './modulos'

/** Colunas que `anon` pode ler. Nunca usar `*` em `tenants` na página pública. */
const COLUNAS_PUBLICAS =
  'id, slug, nome_fantasia, telefone, whatsapp, logo_url, cor_marca, endereco, status' as const

export type TenantPublico = Pick<
  TenantLinha,
  'id' | 'slug' | 'nome_fantasia' | 'telefone' | 'whatsapp' | 'logo_url' | 'cor_marca' | 'status'
> & { endereco: Endereco }

export async function obterTenantPublicoPorSlug(
  supabase: Cliente,
  slug: string,
): Promise<TenantPublico | null> {
  const { data } = await supabase.from('tenants').select(COLUNAS_PUBLICAS).eq('slug', slug).maybeSingle()
  return data ? { ...data, endereco: (data.endereco ?? {}) as Endereco } : null
}

export async function obterTenant(supabase: Cliente, id: string): Promise<TenantLinha | null> {
  const { data } = await supabase.from('tenants').select('*').eq('id', id).maybeSingle()
  return data
}

export type TenantLista = TenantLinha & {
  cadeia_etapas: Array<Pick<CadeiaEtapaLinha, 'frente' | 'chave' | 'estado'>>
}

/** Lista do console, com as etapas da cadeia para pintar os pontinhos do lançamento. */
export async function listarTenants(supabase: Cliente): Promise<TenantLista[]> {
  return ouErro(
    await supabase
      .from('tenants')
      .select('*, cadeia_etapas(frente, chave, estado)')
      .order('criado_em', { ascending: false }),
    'Não foi possível listar os tenants',
  )
}

/** O comerciante actualiza os próprios dados de contacto (colunas com grant de update). */
export async function atualizarContaTenant(
  supabase: Cliente,
  tenantId: string,
  dados: ContaTenant,
): Promise<void> {
  garantir(
    await supabase
      .from('tenants')
      .update({
        nome_fantasia: dados.nome_fantasia,
        whatsapp: dados.whatsapp,
        telefone: dados.telefone ?? null,
        cor_marca: dados.cor_marca ?? null,
        endereco: dados.endereco ?? {},
      })
      .eq('id', tenantId),
    'Não foi possível guardar os dados da conta',
  )
}

/** O operador edita a ficha completa. Requer o cliente admin (colunas como status e plano não têm grant). */
export async function atualizarFichaTenant(
  admin: Cliente,
  tenantId: string,
  dados: FichaTenant,
): Promise<void> {
  garantir(
    await admin
      .from('tenants')
      .update({
        nome_fantasia: dados.nome_fantasia,
        slug: dados.slug,
        whatsapp: dados.whatsapp,
        telefone: dados.telefone ?? null,
        razao_social: dados.razao_social ?? null,
        cnpj: dados.cnpj ?? null,
        cor_marca: dados.cor_marca ?? null,
        plano: dados.plano,
        status: dados.status,
        renovacao_em: dados.renovacao_em ?? null,
      })
      .eq('id', tenantId),
    'Não foi possível guardar a ficha',
  )
}

export async function atualizarStatusTenant(
  admin: Cliente,
  tenantId: string,
  status: TenantStatus,
): Promise<void> {
  garantir(
    await admin.from('tenants').update({ status }).eq('id', tenantId),
    'Não foi possível mudar o estado',
  )
}

export async function marcarPublicado(admin: Cliente, tenantId: string, publicado: boolean): Promise<void> {
  garantir(
    await admin
      .from('tenants')
      .update({ publicado_em: publicado ? new Date().toISOString() : null })
      .eq('id', tenantId),
    'Não foi possível marcar a publicação',
  )
}

/**
 * Cria o tenant completo: conta, loja principal, cadeia de produção, módulos
 * por defeito e o utilizador dono. Não há transacção entre Auth e Postgres; se algo falhar a
 * meio, o que já foi criado é desfeito.
 */
export async function criarTenant(
  admin: Cliente,
  dados: NovoTenant,
): Promise<{ tenantId: string; lojaId: string }> {
  const tenant = ouErro(
    await admin
      .from('tenants')
      .insert({
        nome_fantasia: dados.nome_fantasia,
        slug: dados.slug,
        whatsapp: dados.whatsapp,
        telefone: dados.telefone ?? null,
        razao_social: dados.razao_social ?? null,
        cnpj: dados.cnpj ?? null,
        cor_marca: dados.cor_marca ?? null,
        endereco: dados.endereco ?? {},
      })
      .select('id')
      .single(),
    'Não foi possível criar o tenant',
  )

  try {
    const loja = ouErro(
      await admin
        .from('lojas')
        .insert({
          tenant_id: tenant.id,
          nome: 'Principal',
          endereco: dados.endereco ?? {},
          fuso_horario: dados.fuso_horario,
        })
        .select('id')
        .single(),
      'Não foi possível criar a loja',
    )

    await materializarCadeia(admin, tenant.id, { concluirCadastro: true })
    await ligarModulosPadrao(admin, tenant.id)

    const { data: utilizador, error: erroAuth } = await admin.auth.admin.createUser({
      email: dados.dono_email,
      password: dados.dono_senha,
      email_confirm: true,
      app_metadata: { papel: 'dono' },
    })
    if (erroAuth || !utilizador.user) {
      throw new ErroDados(
        `Não foi possível criar o acesso do dono: ${erroAuth?.message ?? 'erro desconhecido'}`,
      )
    }

    garantir(
      await admin
        .from('membros')
        .insert({ user_id: utilizador.user.id, tenant_id: tenant.id, papel: 'dono' }),
      'Não foi possível ligar o dono ao tenant',
    )

    return { tenantId: tenant.id, lojaId: loja.id }
  } catch (erro) {
    await admin.from('tenants').delete().eq('id', tenant.id)
    throw erro
  }
}

/** Dono(s) do tenant, para a ficha do console. */
export async function listarMembros(
  admin: Cliente,
  tenantId: string,
): Promise<Array<{ user_id: string; papel: string; email: string | null }>> {
  const membros = ouErro(
    await admin.from('membros').select('user_id, papel').eq('tenant_id', tenantId),
    'Não foi possível listar os membros',
  )
  const comEmail = await Promise.all(
    membros.map(async (m) => {
      const { data } = await admin.auth.admin.getUserById(m.user_id)
      return { ...m, email: data.user?.email ?? null }
    }),
  )
  return comEmail
}

export async function definirSenhaMembro(admin: Cliente, userId: string, senha: string): Promise<void> {
  const { error } = await admin.auth.admin.updateUserById(userId, { password: senha })
  if (error) throw new ErroDados(`Não foi possível definir a senha: ${error.message}`)
}

/** Exportação completa (§9 do brief): tudo o que é do tenant, em JSON. */
export async function exportarTenant(admin: Cliente, tenantId: string) {
  const [tenant, lojas, categorias, produtos, grupos, opcoes, pedidos, itens, cadeia, registos, notas] =
    await Promise.all([
      admin.from('tenants').select('*').eq('id', tenantId).single(),
      admin.from('lojas').select('*').eq('tenant_id', tenantId),
      admin.from('categorias').select('*').eq('tenant_id', tenantId),
      admin.from('produtos').select('*').eq('tenant_id', tenantId),
      admin.from('grupos_opcao').select('*').eq('tenant_id', tenantId),
      admin.from('opcoes').select('*').eq('tenant_id', tenantId),
      admin.from('pedidos').select('*').eq('tenant_id', tenantId),
      admin.from('itens_pedido').select('*').eq('tenant_id', tenantId),
      admin.from('cadeia_etapas').select('*').eq('tenant_id', tenantId),
      admin.from('cadeia_registos').select('*').eq('tenant_id', tenantId),
      admin.from('notas_internas').select('*').eq('tenant_id', tenantId),
    ])
  return {
    exportado_em: new Date().toISOString(),
    tenant: tenant.data,
    lojas: lojas.data ?? [],
    categorias: categorias.data ?? [],
    produtos: produtos.data ?? [],
    grupos_opcao: grupos.data ?? [],
    opcoes: opcoes.data ?? [],
    pedidos: pedidos.data ?? [],
    itens_pedido: itens.data ?? [],
    cadeia_etapas: cadeia.data ?? [],
    cadeia_registos: registos.data ?? [],
    notas_internas: notas.data ?? [],
  }
}
