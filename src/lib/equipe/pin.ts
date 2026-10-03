import 'server-only'

/**
 * PIN da equipe: guardado com scrypt e sal, nunca em claro; a sessão de quem
 * está a operar o tablet vai num cookie assinado (HMAC) que expira no fim do
 * turno. O segredo da assinatura vem de PVH_SEGREDO_EQUIPE ou, na falta, é
 * derivado da chave secreta do Supabase (nunca exposta ao browser).
 */
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const N = 16384

export function hashPin(pin: string): string {
  const sal = randomBytes(16).toString('base64url')
  const hash = scryptSync(pin, sal, 32, { N }).toString('base64url')
  return `scrypt$${sal}$${hash}`
}

export function conferirPin(pin: string, guardado: string): boolean {
  const [alg, sal, hash] = guardado.split('$')
  if (alg !== 'scrypt' || !sal || !hash) return false
  const calculado = scryptSync(pin, sal, 32, { N })
  const esperado = Buffer.from(hash, 'base64url')
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado)
}

function segredo(): string {
  const proprio = process.env.PVH_SEGREDO_EQUIPE
  if (proprio && proprio.length >= 32) return proprio
  const base = process.env.SUPABASE_SECRET_KEY
  if (!base) throw new Error('Falta PVH_SEGREDO_EQUIPE (ou SUPABASE_SECRET_KEY) para assinar a sessão da equipe.')
  return createHmac('sha256', base).update('pvh-equipe-v1').digest('base64url')
}

export type SessaoEquipe = { membroId: string; tenantId: string; expira: number }

const DURACAO_MS = 12 * 60 * 60 * 1000

export function assinarSessaoEquipe(membroId: string, tenantId: string, agora = Date.now()): string {
  const corpo = Buffer.from(JSON.stringify({ membroId, tenantId, expira: agora + DURACAO_MS })).toString('base64url')
  const assinatura = createHmac('sha256', segredo()).update(corpo).digest('base64url')
  return `${corpo}.${assinatura}`
}

export function lerSessaoEquipe(valor: string | undefined, agora = Date.now()): SessaoEquipe | null {
  if (!valor) return null
  const [corpo, assinatura] = valor.split('.')
  if (!corpo || !assinatura) return null
  const esperada = createHmac('sha256', segredo()).update(corpo).digest()
  const recebida = Buffer.from(assinatura, 'base64url')
  if (recebida.length !== esperada.length || !timingSafeEqual(recebida, esperada)) return null
  try {
    const s = JSON.parse(Buffer.from(corpo, 'base64url').toString()) as SessaoEquipe
    return s.expira > agora ? s : null
  } catch {
    return null
  }
}
