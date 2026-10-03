import 'server-only'

/**
 * Pix pelo Mercado Pago (docs/pesquisa/integracoes.md §3): QR dinâmico sem
 * tarifa para a maioria das contas, só com o token de acesso do cliente (sem
 * mTLS, por isso funciona na Vercel). Idempotência pelo nosso `txid`.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

const API = 'https://api.mercadopago.com'

export type CobrancaCriada =
  | { ok: true; provedorId: string; copiaCola: string | null; qrBase64: string | null; expiraEm: string | null }
  | { ok: false; erro: string }

export type EstadoPagamento = 'pendente' | 'pago' | 'expirado' | 'cancelado' | 'devolvido' | 'erro'

/** Estado do pagamento no Mercado Pago → o nosso. */
export function estadoDoMercadoPago(status: string | undefined): EstadoPagamento {
  switch (status) {
    case 'approved':
      return 'pago'
    case 'pending':
    case 'in_process':
    case 'authorized':
      return 'pendente'
    case 'cancelled':
      return 'cancelado'
    case 'refunded':
    case 'charged_back':
      return 'devolvido'
    case 'expired':
      return 'expirado'
    default:
      return 'erro'
  }
}

export async function criarCobranca(
  token: string,
  d: { txid: string; valor: number; descricao: string; expiraEmMin: number; urlAviso: string; emailPagador?: string },
): Promise<CobrancaCriada> {
  const expira = new Date(Date.now() + d.expiraEmMin * 60_000)
  try {
    const r = await fetch(`${API}/v1/payments`, {
      method: 'POST',
      signal: AbortSignal.timeout(15_000),
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'x-idempotency-key': d.txid },
      body: JSON.stringify({
        transaction_amount: Math.round(d.valor * 100) / 100,
        description: d.descricao.slice(0, 140),
        payment_method_id: 'pix',
        external_reference: d.txid,
        notification_url: d.urlAviso,
        date_of_expiration: expira.toISOString().replace('Z', '-00:00'),
        payer: { email: d.emailPagador ?? 'pagador@pix.invalid' },
      }),
    })
    const corpo = (await r.json().catch(() => ({}))) as {
      id?: number
      message?: string
      point_of_interaction?: { transaction_data?: { qr_code?: string; qr_code_base64?: string } }
    }
    if (!r.ok || !corpo.id) return { ok: false, erro: corpo.message ?? `Mercado Pago respondeu ${r.status}` }
    return {
      ok: true,
      provedorId: String(corpo.id),
      copiaCola: corpo.point_of_interaction?.transaction_data?.qr_code ?? null,
      qrBase64: corpo.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      expiraEm: expira.toISOString(),
    }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? `Sem resposta do Mercado Pago: ${e.message}` : 'Sem resposta do Mercado Pago' }
  }
}

export async function consultarPagamento(
  token: string,
  provedorId: string,
): Promise<{ estado: EstadoPagamento; txid: string | null; valor: number | null; pagoEm: string | null } | null> {
  try {
    const r = await fetch(`${API}/v1/payments/${encodeURIComponent(provedorId)}`, {
      signal: AbortSignal.timeout(10_000),
      headers: { authorization: `Bearer ${token}` },
    })
    if (!r.ok) return null
    const p = (await r.json()) as { status?: string; external_reference?: string; transaction_amount?: number; date_approved?: string }
    return {
      estado: estadoDoMercadoPago(p.status),
      txid: p.external_reference ?? null,
      valor: typeof p.transaction_amount === 'number' ? p.transaction_amount : null,
      pagoEm: p.date_approved ?? null,
    }
  } catch {
    return null
  }
}

export async function cancelarPagamento(token: string, provedorId: string): Promise<boolean> {
  try {
    const r = await fetch(`${API}/v1/payments/${encodeURIComponent(provedorId)}`, {
      method: 'PUT',
      signal: AbortSignal.timeout(10_000),
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    return r.ok
  } catch {
    return false
  }
}

/**
 * Assinatura do aviso do Mercado Pago (cabeçalho `x-signature: ts=…,v1=…`):
 * HMAC-SHA256 do manifesto `id:{data.id};request-id:{x-request-id};ts:{ts};`
 * com a chave secreta do webhook configurada pelo cliente.
 */
export function assinaturaMercadoPagoValida(
  segredo: string,
  dados: { dataId: string; requestId: string | null; cabecalhoAssinatura: string | null },
): boolean {
  const partes = Object.fromEntries((dados.cabecalhoAssinatura ?? '').split(',').map((p) => p.trim().split('=') as [string, string]))
  const ts = partes.ts
  const v1 = partes.v1
  if (!ts || !v1) return false
  let manifesto = `id:${dados.dataId.toLowerCase()};`
  if (dados.requestId) manifesto += `request-id:${dados.requestId};`
  manifesto += `ts:${ts};`
  const esperado = Buffer.from(createHmac('sha256', segredo).update(manifesto).digest('hex'))
  const recebido = Buffer.from(v1)
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido)
}
