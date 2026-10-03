import 'server-only'

/**
 * Segredos das integrações de cada cliente (tokens, senhas): cifrados com
 * AES-256-GCM antes de irem para `integracoes_segredos`, que só o servidor
 * lê. A chave vem de PVH_CHAVE_SEGREDOS (32 bytes em base64) ou, na falta, é
 * derivada da chave secreta do Supabase. Trocar a chave obriga a regravar os
 * segredos.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { clienteAdmin } from '@/lib/supabase/server'

function chave(): Buffer {
  const propria = process.env.PVH_CHAVE_SEGREDOS
  if (propria) {
    const b = Buffer.from(propria, 'base64')
    if (b.length === 32) return b
    throw new Error('PVH_CHAVE_SEGREDOS tem de ter 32 bytes em base64.')
  }
  const base = process.env.SUPABASE_SECRET_KEY
  if (!base) throw new Error('Falta PVH_CHAVE_SEGREDOS (ou SUPABASE_SECRET_KEY) para cifrar os segredos.')
  return createHash('sha256').update(`pvh-segredos-v1:${base}`).digest()
}

export function cifrar(texto: string): string {
  const iv = randomBytes(12)
  const c = createCipheriv('aes-256-gcm', chave(), iv)
  const corpo = Buffer.concat([c.update(texto, 'utf8'), c.final()])
  return `v1:${iv.toString('base64url')}:${c.getAuthTag().toString('base64url')}:${corpo.toString('base64url')}`
}

export function decifrar(valor: string): string {
  const [versao, iv, tag, corpo] = valor.split(':')
  if (versao !== 'v1' || !iv || !tag || !corpo) throw new Error('segredo em formato desconhecido')
  const d = createDecipheriv('aes-256-gcm', chave(), Buffer.from(iv, 'base64url'))
  d.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([d.update(Buffer.from(corpo, 'base64url')), d.final()]).toString('utf8')
}

export async function guardarSegredo(tenantId: string, dominio: string, nome: string, valor: string): Promise<void> {
  const { error } = await clienteAdmin()
    .from('integracoes_segredos')
    .upsert({ tenant_id: tenantId, dominio, nome, valor_cifrado: cifrar(valor), atualizado_em: new Date().toISOString() })
  if (error) throw new Error(`Não foi possível guardar o segredo: ${error.message}`)
}

export async function lerSegredo(tenantId: string, dominio: string, nome: string): Promise<string | null> {
  const { data } = await clienteAdmin()
    .from('integracoes_segredos')
    .select('valor_cifrado')
    .eq('tenant_id', tenantId)
    .eq('dominio', dominio)
    .eq('nome', nome)
    .maybeSingle()
  return data ? decifrar(data.valor_cifrado) : null
}
