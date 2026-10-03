import 'server-only'

import { randomBytes } from 'node:crypto'
import { aAcertar, chaveBairro, type EstadoEntrega, type ZonaEntrega } from '@/lib/dominio/delivery'
import type { Endereco } from '@/lib/dominio/endereco'
import { urlBase } from '@/lib/config/marca'
import { clienteAdmin, type Cliente } from '@/lib/supabase/server'
import { ErroDados, garantir, ouErro } from './erros'

const mensagemBase = (m: string) => m.charAt(0).toUpperCase() + m.slice(1) + '.'
function erroRpc(r: { error: { code?: string; message: string } | null }, padrao: string) {
  if (r.error?.code === '23514' || r.error?.code === 'P0002') throw new ErroDados(mensagemBase(r.error.message))
  garantir(r as never, padrao)
}

// -----------------------------------------------------------------------------
// Zonas
// -----------------------------------------------------------------------------
export type Zona = ZonaEntrega & { ativo: boolean }

const paraZona = (z: { id: string; nome: string; chave: string; taxa: number; tempo_min: number; ativo: boolean }): Zona => ({
  id: z.id,
  nome: z.nome,
  chave: z.chave,
  taxa: Number(z.taxa),
  tempoMin: z.tempo_min,
  ativo: z.ativo,
})

export async function listarZonas(supabase: Cliente, tenantId: string): Promise<Zona[]> {
  return ouErro(await supabase.from('delivery_zonas').select('*').eq('tenant_id', tenantId).order('nome'), 'Não foi possível ler as zonas').map(paraZona)
}

/** Zonas activas para a página pública (cliente anónimo). */
export async function zonasPublicas(anon: Cliente, tenantId: string): Promise<ZonaEntrega[]> {
  const { data } = await anon.from('delivery_zonas').select('id, nome, chave, taxa, tempo_min, ativo').eq('tenant_id', tenantId).eq('ativo', true).order('nome')
  return (data ?? []).map(paraZona).map((z) => ({ id: z.id, nome: z.nome, chave: z.chave, taxa: z.taxa, tempoMin: z.tempoMin }))
}

export async function salvarZona(
  supabase: Cliente,
  tenantId: string,
  d: { id?: string; nome: string; taxa: number; tempoMin: number; ativo: boolean },
): Promise<void> {
  const linha = { nome: d.nome.trim(), chave: chaveBairro(d.nome), taxa: d.taxa, tempo_min: d.tempoMin, ativo: d.ativo }
  if (!linha.chave) throw new ErroDados('Nome do bairro inválido.')
  const r = d.id
    ? await supabase.from('delivery_zonas').update(linha).eq('tenant_id', tenantId).eq('id', d.id)
    : await supabase.from('delivery_zonas').insert({ tenant_id: tenantId, ...linha })
  if (r.error?.code === '23505') throw new ErroDados('Este bairro já está cadastrado.')
  garantir(r, 'Não foi possível guardar o bairro')
}

export async function removerZona(supabase: Cliente, tenantId: string, id: string): Promise<void> {
  garantir(await supabase.from('delivery_zonas').delete().eq('tenant_id', tenantId).eq('id', id), 'Não foi possível remover o bairro')
}

// -----------------------------------------------------------------------------
// Entregadores
// -----------------------------------------------------------------------------
export type Entregador = { id: string; nome: string; whatsapp: string | null; repasse: number; ativo: boolean; aAcertar: { quantidade: number; valor: number } }

export async function listarEntregadores(supabase: Cliente, tenantId: string): Promise<Entregador[]> {
  const [ents, entregas] = await Promise.all([
    supabase.from('entregadores').select('id, nome, whatsapp, repasse, ativo').eq('tenant_id', tenantId).order('nome'),
    supabase.from('entregas').select('entregador_id, repasse, estado, acertado_em').eq('tenant_id', tenantId).eq('estado', 'entregue').is('acertado_em', null),
  ])
  const pendentes = ouErro(entregas, 'Não foi possível ler as entregas')
  return ouErro(ents, 'Não foi possível ler os entregadores').map((e) => ({
    id: e.id,
    nome: e.nome,
    whatsapp: e.whatsapp,
    repasse: Number(e.repasse),
    ativo: e.ativo,
    aAcertar: aAcertar(
      pendentes.filter((p) => p.entregador_id === e.id).map((p) => ({ repasse: Number(p.repasse), estado: p.estado, acertadoEm: p.acertado_em })),
    ),
  }))
}

export async function salvarEntregador(
  supabase: Cliente,
  tenantId: string,
  d: { id?: string; nome: string; whatsapp: string | null; repasse: number; ativo: boolean },
): Promise<string> {
  const linha = { nome: d.nome.trim(), whatsapp: d.whatsapp, repasse: d.repasse, ativo: d.ativo }
  const r = d.id
    ? await supabase.from('entregadores').update(linha).eq('tenant_id', tenantId).eq('id', d.id).select('id').single()
    : await supabase.from('entregadores').insert({ tenant_id: tenantId, ...linha }).select('id').single()
  if (r.error?.code === '23505') throw new ErroDados('Já há um entregador com este nome.')
  return ouErro(r, 'Não foi possível guardar o entregador').id
}

/** Link do entregador (só o servidor lê o token). `novo` revoga o anterior. */
export async function linkDoEntregador(supabase: Cliente, tenantId: string, entregadorId: string, novo = false): Promise<string> {
  const { data: visivel } = await supabase.from('entregadores').select('id').eq('tenant_id', tenantId).eq('id', entregadorId).maybeSingle()
  if (!visivel) throw new ErroDados('Entregador não encontrado.')
  const admin = clienteAdmin()
  if (novo) {
    garantir(
      await admin.from('entregadores').update({ token_acesso: randomBytes(24).toString('hex') }).eq('tenant_id', tenantId).eq('id', entregadorId),
      'Não foi possível gerar outro link',
    )
  }
  const { data } = await admin.from('entregadores').select('token_acesso').eq('tenant_id', tenantId).eq('id', entregadorId).single()
  return `${urlBase()}/entregador/${data!.token_acesso}`
}

export async function acertarEntregador(supabase: Cliente, tenantId: string, entregadorId: string): Promise<{ quantidade: number; valor: number }> {
  const r = await supabase.rpc('acertar_entregador', { p_tenant: tenantId, p_entregador: entregadorId })
  return ouErro(r, 'Não foi possível acertar') as { quantidade: number; valor: number }
}

// -----------------------------------------------------------------------------
// Entregas
// -----------------------------------------------------------------------------
export type EntregaNoPainel = {
  id: string
  codigo: string
  estado: EstadoEntrega
  entregador: { id: string; nome: string } | null
  saiuEm: string | null
  entregueEm: string | null
  ocorrencia: string | null
  pedido: {
    id: string
    numero: number | null
    status: string
    clienteNome: string | null
    clienteTelefone: string | null
    endereco: Endereco | null
    total: number
    formaPagamento: string
    trocoPara: number | null
    criadoEm: string
  }
}

type LinhaEntrega = {
  id: string
  codigo: string
  estado: EstadoEntrega
  saiu_em: string | null
  entregue_em: string | null
  ocorrencia: string | null
  entregadores: { id: string; nome: string } | null
  pedidos: {
    id: string
    numero: number | null
    status: string
    cliente_nome: string | null
    cliente_telefone: string | null
    endereco: Endereco | null
    total: number
    forma_pagamento: string
    troco_para: number | null
    criado_em: string
  }
}

const SELECT_ENTREGA =
  'id, codigo, estado, saiu_em, entregue_em, ocorrencia, entregadores(id, nome), pedidos!inner(id, numero, status, cliente_nome, cliente_telefone, endereco, total, forma_pagamento, troco_para, criado_em)'

const paraEntrega = (l: LinhaEntrega): EntregaNoPainel => ({
  id: l.id,
  codigo: l.codigo,
  estado: l.estado,
  entregador: l.entregadores,
  saiuEm: l.saiu_em,
  entregueEm: l.entregue_em,
  ocorrencia: l.ocorrencia,
  pedido: {
    id: l.pedidos.id,
    numero: l.pedidos.numero,
    status: l.pedidos.status,
    clienteNome: l.pedidos.cliente_nome,
    clienteTelefone: l.pedidos.cliente_telefone,
    endereco: l.pedidos.endereco,
    total: Number(l.pedidos.total),
    formaPagamento: l.pedidos.forma_pagamento,
    trocoPara: l.pedidos.troco_para != null ? Number(l.pedidos.troco_para) : null,
    criadoEm: l.pedidos.criado_em,
  },
})

/** Quadro de entregas: em aberto (qualquer dia) e as concluídas nas últimas 24 h. */
export async function quadroDeEntregas(supabase: Cliente, tenantId: string): Promise<EntregaNoPainel[]> {
  const desde = new Date(Date.now() - 24 * 3_600_000).toISOString()
  const r = await supabase
    .from('entregas')
    .select(SELECT_ENTREGA)
    .eq('tenant_id', tenantId)
    .or(`estado.in.(aguardando,em_rota,nao_entregue),entregue_em.gte.${desde}`)
    .order('criado_em', { ascending: true })
    .limit(200)
  return (ouErro(r, 'Não foi possível ler as entregas') as unknown as LinhaEntrega[]).map(paraEntrega)
}

export async function despacharEntrega(supabase: Cliente, tenantId: string, entregaId: string, entregadorId: string): Promise<void> {
  erroRpc(await supabase.rpc('despachar_entrega', { p_tenant: tenantId, p_entrega: entregaId, p_entregador: entregadorId }), 'Não foi possível despachar')
}

export async function concluirEntrega(supabase: Cliente, tenantId: string, entregaId: string, entregue: boolean, ocorrencia: string | null): Promise<void> {
  erroRpc(
    await supabase.rpc('concluir_entrega', { p_tenant: tenantId, p_entrega: entregaId, p_entregue: entregue, p_ocorrencia: ocorrencia }),
    'Não foi possível concluir a entrega',
  )
}

/** Volta para "aguardando" (ex.: entregador trocado). */
export async function devolverEntrega(supabase: Cliente, tenantId: string, entregaId: string): Promise<void> {
  const r = await supabase
    .from('entregas')
    .update({ estado: 'aguardando', entregador_id: null, saiu_em: null, repasse: 0 })
    .eq('tenant_id', tenantId)
    .eq('id', entregaId)
  if (r.error?.code === '23514') throw new ErroDados('Esta entrega não pode voltar para a fila.')
  garantir(r, 'Não foi possível devolver a entrega')
}

export const linkAcompanhamento = (codigo: string) => `${urlBase()}/entrega/${codigo}`

/** Código da entrega de um pedido (para pôr o link na mensagem do WhatsApp). */
export async function codigoDaEntrega(tenantId: string, pedidoId: string): Promise<string | null> {
  const { data } = await clienteAdmin().from('entregas').select('codigo').eq('tenant_id', tenantId).eq('pedido_id', pedidoId).maybeSingle()
  return data?.codigo ?? null
}

// -----------------------------------------------------------------------------
// Público: acompanhamento e link do entregador (sem login; pelo código/token)
// -----------------------------------------------------------------------------
export type Acompanhamento = {
  loja: { nome: string; whatsapp: string; slug: string }
  numero: number | null
  estado: EstadoEntrega
  pedidoStatus: string
  criadoEm: string
  saiuEm: string | null
  entregueEm: string | null
  entregador: string | null
}

/** O que o cliente vê pelo link: sem endereço nem telefone, só o andamento. */
export async function acompanhamentoPublico(codigo: string): Promise<Acompanhamento | null> {
  if (!/^[0-9a-f]{16}$/.test(codigo)) return null
  const { data } = await clienteAdmin()
    .from('entregas')
    .select('estado, saiu_em, entregue_em, entregadores(nome), pedidos!inner(numero, status, criado_em), tenants!inner(nome_fantasia, whatsapp, slug)')
    .eq('codigo', codigo)
    .maybeSingle()
  if (!data) return null
  const p = data.pedidos as unknown as { numero: number | null; status: string; criado_em: string }
  const t = data.tenants as unknown as { nome_fantasia: string; whatsapp: string; slug: string }
  const ent = data.entregadores as unknown as { nome: string } | null
  return {
    loja: { nome: t.nome_fantasia, whatsapp: t.whatsapp, slug: t.slug },
    numero: p.numero,
    estado: data.estado,
    pedidoStatus: p.status,
    criadoEm: p.criado_em,
    saiuEm: data.saiu_em,
    entregueEm: data.entregue_em,
    // Só o primeiro nome do entregador.
    entregador: ent?.nome.split(' ')[0] ?? null,
  }
}

export type PainelDoEntregador = {
  entregador: { id: string; nome: string }
  tenantId: string
  loja: string
  entregas: EntregaNoPainel[]
  hoje: { entregues: number; aAcertar: { quantidade: number; valor: number } }
}

async function entregadorPorToken(token: string) {
  if (!/^[0-9a-f]{48,64}$/.test(token)) return null
  const { data } = await clienteAdmin()
    .from('entregadores')
    .select('id, nome, tenant_id, ativo, tenants!inner(nome_fantasia)')
    .eq('token_acesso', token)
    .maybeSingle()
  if (!data || !data.ativo) return null
  return { id: data.id, nome: data.nome, tenantId: data.tenant_id, loja: (data.tenants as unknown as { nome_fantasia: string }).nome_fantasia }
}

/** A página do entregador: as entregas que estão com ele agora e o que tem a receber. */
export async function painelDoEntregador(token: string): Promise<PainelDoEntregador | null> {
  const ent = await entregadorPorToken(token)
  if (!ent) return null
  const admin = clienteAdmin()
  const [emRota, pendentes, hoje] = await Promise.all([
    admin.from('entregas').select(SELECT_ENTREGA).eq('tenant_id', ent.tenantId).eq('entregador_id', ent.id).eq('estado', 'em_rota').order('saiu_em'),
    admin.from('entregas').select('repasse, estado, acertado_em').eq('tenant_id', ent.tenantId).eq('entregador_id', ent.id).eq('estado', 'entregue').is('acertado_em', null),
    admin
      .from('entregas')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', ent.tenantId)
      .eq('entregador_id', ent.id)
      .eq('estado', 'entregue')
      .gte('entregue_em', new Date(Date.now() - 24 * 3_600_000).toISOString()),
  ])
  return {
    entregador: { id: ent.id, nome: ent.nome },
    tenantId: ent.tenantId,
    loja: ent.loja,
    entregas: ((emRota.data ?? []) as unknown as LinhaEntrega[]).map(paraEntrega),
    hoje: {
      entregues: hoje.count ?? 0,
      aAcertar: aAcertar((pendentes.data ?? []).map((p) => ({ repasse: Number(p.repasse), estado: p.estado, acertadoEm: p.acertado_em }))),
    },
  }
}

/** O entregador marca pelo link: só entregas que estão com ele. */
export async function concluirPeloEntregador(token: string, entregaId: string, entregue: boolean, ocorrencia: string | null): Promise<void> {
  const ent = await entregadorPorToken(token)
  if (!ent) throw new ErroDados('Link inválido. Peça um novo à loja.')
  const admin = clienteAdmin()
  const { data } = await admin.from('entregas').select('id').eq('tenant_id', ent.tenantId).eq('id', entregaId).eq('entregador_id', ent.id).eq('estado', 'em_rota').maybeSingle()
  if (!data) throw new ErroDados('Esta entrega já não está com você.')
  await concluirEntrega(admin, ent.tenantId, entregaId, entregue, ocorrencia)
}
