/**
 * Aviso de pagamento do Mercado Pago. Duas camadas: a URL leva a nossa
 * assinatura por cliente; o cabeçalho `x-signature` é conferido com a chave
 * secreta do webhook do cliente. O estado é sempre confirmado por consulta à
 * API (nunca se confia só no corpo do aviso). Deduplicado; responde rápido.
 */
import { NextResponse } from 'next/server'
import { aplicarEstadoPagamento } from '@/lib/dados/pix'
import { webhookValido } from '@/lib/integracoes/assinatura-webhook'
import { assinaturaMercadoPagoValida, consultarPagamento } from '@/lib/integracoes/pix/mercadopago'
import { lerSegredo } from '@/lib/integracoes/segredos'
import { clienteAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const tenantId = url.searchParams.get('tenant') ?? ''
  if (!/^[0-9a-f-]{36}$/.test(tenantId) || !webhookValido('mercadopago', tenantId, url.searchParams.get('assinatura'))) {
    return NextResponse.json({ erro: 'assinatura inválida' }, { status: 401 })
  }
  const corpo = (await request.json().catch(() => null)) as { type?: string; action?: string; data?: { id?: string | number } } | null
  const dataId = corpo?.data?.id != null ? String(corpo.data.id) : (url.searchParams.get('data.id') ?? '')
  if (!dataId) return NextResponse.json({ ok: true, ignorado: true })

  const segredo = await lerSegredo(tenantId, 'pix', 'segredo_webhook')
  const assinaturaOk = segredo
    ? assinaturaMercadoPagoValida(segredo, {
        dataId,
        requestId: request.headers.get('x-request-id'),
        cabecalhoAssinatura: request.headers.get('x-signature'),
      })
    : false
  if (segredo && !assinaturaOk) return NextResponse.json({ erro: 'x-signature inválida' }, { status: 401 })

  const admin = clienteAdmin()
  const { error: duplicado } = await admin.from('webhooks_recebidos').insert({
    provedor: 'mercadopago',
    evento_id: `${dataId}:${corpo?.action ?? corpo?.type ?? ''}`,
    tenant_id: tenantId,
    payload: (corpo ?? {}) as never,
    assinatura_ok: assinaturaOk,
  })
  if (duplicado?.code === '23505') return NextResponse.json({ ok: true, repetido: true })

  const token = await lerSegredo(tenantId, 'pix', 'token')
  if (!token) return NextResponse.json({ ok: true, aviso: 'sem token' })
  const pagamento = await consultarPagamento(token, dataId)
  if (!pagamento?.txid) return NextResponse.json({ ok: true, aviso: 'pagamento sem referência' })

  const { data: cobranca } = await admin.from('cobrancas_pix').select('id').eq('tenant_id', tenantId).eq('txid', pagamento.txid).maybeSingle()
  if (cobranca && pagamento.estado !== 'pendente') {
    await aplicarEstadoPagamento(tenantId, cobranca.id, pagamento.estado, pagamento.pagoEm)
  }
  return NextResponse.json({ ok: true })
}
