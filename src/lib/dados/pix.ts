import 'server-only'

import { randomUUID } from 'node:crypto'
import { saldoParcela } from '@/lib/dominio/financeiro'
import { urlBase } from '@/lib/config/marca'
import { assinarWebhook } from '@/lib/integracoes/assinatura-webhook'
import { cancelarPagamento, consultarPagamento, criarCobranca } from '@/lib/integracoes/pix/mercadopago'
import { guardarSegredo, lerSegredo } from '@/lib/integracoes/segredos'
import { clienteAdmin, type Cliente } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'

export type CobrancaPix = {
  id: string
  txid: string
  valor: number
  descricao: string
  estado: 'pendente' | 'pago' | 'expirado' | 'cancelado' | 'devolvido' | 'erro'
  copiaCola: string | null
  qrBase64: string | null
  expiraEm: string | null
  pagoEm: string | null
  mensagem: string | null
}

const paraCobranca = (c: {
  id: string
  txid: string
  valor: number
  descricao: string
  estado: CobrancaPix['estado']
  copia_cola: string | null
  qr_base64: string | null
  expira_em: string | null
  pago_em: string | null
  mensagem: string | null
}): CobrancaPix => ({
  id: c.id,
  txid: c.txid,
  valor: Number(c.valor),
  descricao: c.descricao,
  estado: c.estado,
  copiaCola: c.copia_cola,
  qrBase64: c.qr_base64,
  expiraEm: c.expira_em,
  pagoEm: c.pago_em,
  mensagem: c.mensagem,
})

/** URL de aviso do Mercado Pago para este cliente (assinada por nós). */
export function urlAvisoPix(tenantId: string): string {
  return `${urlBase()}/api/webhooks/mercadopago?tenant=${tenantId}&assinatura=${assinarWebhook('mercadopago', tenantId)}`
}

/** Configura o Pix do cliente (só operadores): token e chave do webhook, cifrados. */
export async function configurarPix(
  supabase: Cliente,
  tenantId: string,
  d: { ambiente: 'homologacao' | 'producao'; token?: string; segredoWebhook?: string },
): Promise<void> {
  if (d.token) await guardarSegredo(tenantId, 'pix', 'token', d.token)
  if (d.segredoWebhook) await guardarSegredo(tenantId, 'pix', 'segredo_webhook', d.segredoWebhook)
  const temToken = d.token ? true : !!(await lerSegredo(tenantId, 'pix', 'token'))
  garantir(
    await supabase.from('integracoes').upsert(
      {
        tenant_id: tenantId,
        dominio: 'pix',
        provedor: 'mercadopago',
        ambiente: d.ambiente,
        estado: !temToken ? 'aguardando_credenciais' : d.ambiente === 'producao' ? 'em_producao' : 'em_homologacao',
        configuracao: { url_aviso: urlAvisoPix(tenantId) } as Json,
        ultimo_erro: null,
      },
      { onConflict: 'tenant_id,dominio' },
    ),
    'Não foi possível guardar a configuração do Pix',
  )
}

async function tokenPix(supabase: Cliente, tenantId: string): Promise<string> {
  const { data } = await supabase.from('integracoes').select('estado').eq('tenant_id', tenantId).eq('dominio', 'pix').maybeSingle()
  if (!data || data.estado === 'aguardando_credenciais') {
    throw new ErroDados('O Pix ainda não está ligado: falta a equipa ligar a conta do Mercado Pago da empresa.')
  }
  if (data.estado === 'suspensa') throw new ErroDados('O Pix está suspenso para esta empresa.')
  const token = await lerSegredo(tenantId, 'pix', 'token')
  if (!token) throw new ErroDados('Falta o token do Mercado Pago.')
  return token
}

/** Cria uma cobrança Pix (QR + copia-e-cola) com o nosso txid. */
export async function criarCobrancaPix(
  supabase: Cliente,
  tenantId: string,
  d: { valor: number; descricao: string; origem: 'pdv' | 'parcela' | 'comanda' | 'manual'; origemId?: string; expiraEmMin?: number },
): Promise<CobrancaPix> {
  if (!(d.valor > 0)) throw new ErroDados('Valor inválido.')
  const token = await tokenPix(supabase, tenantId)
  const txid = randomUUID().replace(/-/g, '')
  const linha = ouErro(
    await supabase
      .from('cobrancas_pix')
      .insert({
        tenant_id: tenantId,
        txid,
        provedor: 'mercadopago',
        valor: d.valor,
        descricao: d.descricao,
        origem: d.origem,
        origem_id: d.origemId ?? null,
      })
      .select('id')
      .single(),
    'Não foi possível registar a cobrança',
  )
  const r = await criarCobranca(token, { txid, valor: d.valor, descricao: d.descricao, expiraEmMin: d.expiraEmMin ?? 30, urlAviso: urlAvisoPix(tenantId) })
  const admin = clienteAdmin()
  if (!r.ok) {
    await admin.from('cobrancas_pix').update({ estado: 'erro', mensagem: r.erro }).eq('id', linha.id)
    throw new ErroDados(`Não foi possível gerar o Pix: ${r.erro}`)
  }
  const { data } = await admin
    .from('cobrancas_pix')
    .update({ provedor_id: r.provedorId, copia_cola: r.copiaCola, qr_base64: r.qrBase64, expira_em: r.expiraEm })
    .eq('id', linha.id)
    .select('*')
    .single()
  return paraCobranca(data!)
}

/**
 * Estado da cobrança. Se ainda está pendente, pergunta ao PSP (rede de
 * segurança caso o aviso se perca) e aplica o pagamento.
 */
export async function consultarCobrancaPix(supabase: Cliente, tenantId: string, id: string): Promise<CobrancaPix> {
  const { data: c } = await supabase.from('cobrancas_pix').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle()
  if (!c) throw new ErroDados('Cobrança não encontrada.')
  if (c.estado !== 'pendente' || !c.provedor_id) return paraCobranca(c)
  const token = await lerSegredo(tenantId, 'pix', 'token')
  if (!token) return paraCobranca(c)
  const p = await consultarPagamento(token, c.provedor_id)
  if (p && p.estado !== 'pendente') await aplicarEstadoPagamento(tenantId, c.id, p.estado, p.pagoEm)
  const { data: atual } = await supabase.from('cobrancas_pix').select('*').eq('id', id).single()
  return paraCobranca(atual!)
}

/** Grava o novo estado; pago numa cobrança de parcela dá baixa no financeiro (carteira Pix). */
export async function aplicarEstadoPagamento(
  tenantId: string,
  cobrancaId: string,
  estado: CobrancaPix['estado'],
  pagoEm: string | null,
): Promise<void> {
  const admin = clienteAdmin()
  const { data: c } = await admin
    .from('cobrancas_pix')
    .update({ estado, pago_em: estado === 'pago' ? (pagoEm ?? new Date().toISOString()) : null })
    .eq('tenant_id', tenantId)
    .eq('id', cobrancaId)
    .eq('estado', 'pendente')
    .select('*')
    .maybeSingle()
  if (!c || estado !== 'pago' || c.origem !== 'parcela' || !c.origem_id) return

  const [{ data: parcela }, { data: carteira }] = await Promise.all([
    admin.from('parcelas').select('id, valor, valor_pago, estado').eq('tenant_id', tenantId).eq('id', c.origem_id).maybeSingle(),
    admin.from('carteiras').select('id').eq('tenant_id', tenantId).eq('nome', 'Pix').maybeSingle(),
  ])
  if (!parcela || !carteira || parcela.estado === 'paga' || parcela.estado === 'cancelada') return
  const valor = Math.min(Number(c.valor), saldoParcela(Number(parcela.valor), Number(parcela.valor_pago)))
  if (valor <= 0) return
  await admin.from('baixas').insert({
    tenant_id: tenantId,
    parcela_id: parcela.id,
    carteira_id: carteira.id,
    data: new Date(c.pago_em ?? Date.now()).toLocaleDateString('sv-SE', { timeZone: 'America/Porto_Velho' }),
    valor,
    forma: 'pix',
    observacao: `Pix ${c.txid}`,
  })
}

/** Cobrança Pix do saldo de uma parcela a receber. */
export async function cobrarParcelaPorPix(supabase: Cliente, tenantId: string, parcelaId: string): Promise<CobrancaPix> {
  const { data: p } = await supabase
    .from('parcelas')
    .select('id, numero, valor, valor_pago, estado, titulos!inner(tipo, descricao)')
    .eq('tenant_id', tenantId)
    .eq('id', parcelaId)
    .maybeSingle()
  if (!p) throw new ErroDados('Parcela não encontrada.')
  const t = p.titulos as unknown as { tipo: string; descricao: string }
  if (t.tipo !== 'receber') throw new ErroDados('Só se cobra por Pix uma conta a receber.')
  if (p.estado === 'paga' || p.estado === 'cancelada') throw new ErroDados('Esta parcela já não está em aberto.')
  const saldo = saldoParcela(Number(p.valor), Number(p.valor_pago))
  // Uma cobrança pendente do mesmo saldo, ainda válida por mais de 10 min, é reaproveitada.
  const { data: pendente } = await supabase
    .from('cobrancas_pix')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('origem', 'parcela')
    .eq('origem_id', p.id)
    .eq('estado', 'pendente')
    .gt('expira_em', new Date(Date.now() + 10 * 60_000).toISOString())
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (pendente && Number(pendente.valor) === saldo && pendente.copia_cola) return paraCobranca(pendente)
  return criarCobrancaPix(supabase, tenantId, {
    valor: saldo,
    descricao: `${t.descricao} · parcela ${p.numero}`,
    origem: 'parcela',
    origemId: p.id,
    expiraEmMin: 60 * 24 * 3,
  })
}

export async function cancelarCobrancaPix(supabase: Cliente, tenantId: string, id: string): Promise<void> {
  const { data: c } = await supabase.from('cobrancas_pix').select('provedor_id, estado').eq('tenant_id', tenantId).eq('id', id).maybeSingle()
  if (!c) throw new ErroDados('Cobrança não encontrada.')
  if (c.estado !== 'pendente') throw new ErroDados('Só se cancela uma cobrança pendente.')
  const token = await lerSegredo(tenantId, 'pix', 'token')
  if (token && c.provedor_id) await cancelarPagamento(token, c.provedor_id)
  garantir(await supabase.from('cobrancas_pix').update({ estado: 'cancelado' }).eq('tenant_id', tenantId).eq('id', id), 'Não foi possível cancelar')
}

export type EstadoPix = {
  estado: 'aguardando_credenciais' | 'em_homologacao' | 'em_producao' | 'com_erro' | 'suspensa'
  ambiente: 'homologacao' | 'producao'
  urlAviso: string
  temSegredoWebhook: boolean
  ultimoErro: string | null
}

/** Estado da integração Pix (sem segredos); null se nunca foi configurada. */
export async function estadoPix(supabase: Cliente, tenantId: string): Promise<EstadoPix | null> {
  const { data } = await supabase.from('integracoes').select('estado, ambiente, ultimo_erro').eq('tenant_id', tenantId).eq('dominio', 'pix').maybeSingle()
  if (!data) return null
  return {
    estado: data.estado,
    ambiente: data.ambiente,
    urlAviso: urlAvisoPix(tenantId),
    temSegredoWebhook: !!(await lerSegredo(tenantId, 'pix', 'segredo_webhook')),
    ultimoErro: data.ultimo_erro,
  }
}

/** Últimas cobranças Pix (para o painel acompanhar o que caiu). */
export async function listarCobrancasPix(supabase: Cliente, tenantId: string, limite = 50): Promise<CobrancaPix[]> {
  return ouErro(
    await supabase.from('cobrancas_pix').select('*').eq('tenant_id', tenantId).order('criado_em', { ascending: false }).limit(limite),
    'Não foi possível ler as cobranças Pix',
  ).map(paraCobranca)
}
