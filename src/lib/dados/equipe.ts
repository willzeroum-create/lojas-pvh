import 'server-only'

import { pinAceitavel, type Papel } from '@/lib/equipe/papeis'
import { conferirPin, hashPin } from '@/lib/equipe/pin'
import { clienteAdmin, type Cliente } from '@/lib/supabase/server'
import { ErroAprovacao, ErroDados, garantir, ouErro } from './erros'

export type MembroEquipe = {
  id: string
  nome: string
  papel: Papel
  ativo: boolean
  bloqueadoAte: string | null
}

const BLOQUEIO_MIN = 5
const MAX_TENTATIVAS = 5

export async function listarEquipe(supabase: Cliente, tenantId: string): Promise<MembroEquipe[]> {
  return ouErro(
    await supabase.from('equipe_membros').select('id, nome, papel, ativo, bloqueado_ate').eq('tenant_id', tenantId).order('nome'),
    'Não foi possível ler a equipe',
  ).map((m) => ({ id: m.id, nome: m.nome, papel: m.papel, ativo: m.ativo, bloqueadoAte: m.bloqueado_ate }))
}

export async function obterMembro(supabase: Cliente, tenantId: string, id: string): Promise<MembroEquipe | null> {
  const { data } = await supabase.from('equipe_membros').select('id, nome, papel, ativo, bloqueado_ate').eq('tenant_id', tenantId).eq('id', id).maybeSingle()
  return data ? { id: data.id, nome: data.nome, papel: data.papel, ativo: data.ativo, bloqueadoAte: data.bloqueado_ate } : null
}

/** Os hashes só se lêem com a chave secreta, e sempre filtrados pelo tenant já verificado. */
async function hashesDoTenant(tenantId: string, filtro?: { id?: string; papel?: Papel }) {
  let q = clienteAdmin().from('equipe_membros').select('id, nome, papel, pin_hash, ativo, tentativas_falhas, bloqueado_ate').eq('tenant_id', tenantId).eq('ativo', true)
  if (filtro?.id) q = q.eq('id', filtro.id)
  if (filtro?.papel) q = q.eq('papel', filtro.papel)
  return ouErro(await q, 'Não foi possível conferir o PIN')
}

/** Cria ou altera alguém da equipe. O PIN é obrigatório ao criar e tem de ser único na loja. */
export async function salvarMembro(
  supabase: Cliente,
  tenantId: string,
  d: { id?: string; nome: string; papel: Papel; pin?: string; ativo: boolean },
): Promise<string> {
  if (!d.id && !d.pin) throw new ErroDados('Defina um PIN para a pessoa.')
  if (d.pin) {
    const v = pinAceitavel(d.pin)
    if (!v.ok) throw new ErroDados(v.motivo)
    const outros = (await hashesDoTenant(tenantId)).filter((m) => m.id !== d.id)
    if (outros.some((m) => conferirPin(d.pin!, m.pin_hash))) throw new ErroDados('Este PIN já é de outra pessoa da equipe. Escolha outro.')
  }
  const linha = { nome: d.nome, papel: d.papel, ativo: d.ativo, ...(d.pin ? { pin_hash: hashPin(d.pin) } : {}) }
  const r = d.id
    ? await supabase.from('equipe_membros').update(linha).eq('tenant_id', tenantId).eq('id', d.id).select('id').single()
    : await supabase.from('equipe_membros').insert({ tenant_id: tenantId, ...linha, pin_hash: hashPin(d.pin!) }).select('id').single()
  if (r.error?.code === '23505') throw new ErroDados('Já há alguém com este nome na equipe.')
  return ouErro(r, 'Não foi possível guardar').id
}

/** Confere o PIN de uma pessoa: 5 erros bloqueiam por 5 minutos. */
export async function entrarComPin(tenantId: string, membroId: string, pin: string): Promise<MembroEquipe> {
  const [m] = await hashesDoTenant(tenantId, { id: membroId })
  if (!m) throw new ErroDados('Pessoa não encontrada ou inativa.')
  if (m.bloqueado_ate && new Date(m.bloqueado_ate) > new Date()) {
    throw new ErroDados('PIN bloqueado por tentativas erradas. Tente de novo em alguns minutos ou fale com o gerente.')
  }
  const admin = clienteAdmin()
  if (!conferirPin(pin, m.pin_hash)) {
    const tentativas = m.tentativas_falhas + 1
    await admin
      .from('equipe_membros')
      .update({
        tentativas_falhas: tentativas >= MAX_TENTATIVAS ? 0 : tentativas,
        bloqueado_ate: tentativas >= MAX_TENTATIVAS ? new Date(Date.now() + BLOQUEIO_MIN * 60_000).toISOString() : null,
      })
      .eq('id', m.id)
    throw new ErroDados(tentativas >= MAX_TENTATIVAS ? 'PIN errado. Bloqueado por 5 minutos.' : 'PIN errado.')
  }
  if (m.tentativas_falhas > 0 || m.bloqueado_ate) {
    await admin.from('equipe_membros').update({ tentativas_falhas: 0, bloqueado_ate: null }).eq('id', m.id)
  }
  return { id: m.id, nome: m.nome, papel: m.papel, ativo: m.ativo, bloqueadoAte: null }
}

/** Aprovação de uma ação sensível: o PIN de qualquer gerente activo. Devolve o nome de quem aprovou. */
export async function aprovarComPinGerente(tenantId: string, pin: string): Promise<string> {
  const gerentes = await hashesDoTenant(tenantId, { papel: 'gerente' })
  const aprovador = gerentes.find((g) => (!g.bloqueado_ate || new Date(g.bloqueado_ate) <= new Date()) && conferirPin(pin, g.pin_hash))
  if (!aprovador) throw new ErroAprovacao('PIN de gerente inválido.')
  return aprovador.nome
}

export type EntradaAuditoria = {
  quem: string
  papel?: string | null
  aprovadoPor?: string | null
  acao: string
  descricao: string
  alvoId?: string
  detalhe?: Record<string, unknown>
}

export async function registarAuditoria(supabase: Cliente, tenantId: string, e: EntradaAuditoria): Promise<void> {
  garantir(
    await supabase.from('auditoria').insert({
      tenant_id: tenantId,
      quem: e.quem,
      papel: e.papel ?? null,
      aprovado_por: e.aprovadoPor ?? null,
      acao: e.acao,
      descricao: e.descricao.slice(0, 300),
      alvo_id: e.alvoId ?? null,
      detalhe: (e.detalhe ?? {}) as never,
    }),
    'Não foi possível registar na auditoria',
  )
}

export async function listarAuditoria(supabase: Cliente, tenantId: string, limite = 200) {
  return ouErro(
    await supabase.from('auditoria').select('*').eq('tenant_id', tenantId).order('criado_em', { ascending: false }).limit(limite),
    'Não foi possível ler a auditoria',
  )
}
