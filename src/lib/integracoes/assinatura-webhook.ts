import 'server-only'

/**
 * URL de webhook por cliente: leva o tenant e uma assinatura HMAC, para que
 * só o emissor (que recebeu a URL na configuração) consiga notificar.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

function segredo(): string {
  const base = process.env.PVH_SEGREDO_WEBHOOKS ?? process.env.SUPABASE_SECRET_KEY
  if (!base) throw new Error('Falta PVH_SEGREDO_WEBHOOKS (ou SUPABASE_SECRET_KEY).')
  return base
}

export function assinarWebhook(provedor: string, tenantId: string): string {
  return createHmac('sha256', segredo()).update(`${provedor}:${tenantId}`).digest('base64url')
}

export function webhookValido(provedor: string, tenantId: string, assinatura: string | null): boolean {
  if (!assinatura) return false
  const esperada = Buffer.from(assinarWebhook(provedor, tenantId))
  const recebida = Buffer.from(assinatura)
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida)
}
