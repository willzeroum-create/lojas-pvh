/**
 * Aviso da Focus NFe quando uma nota muda de estado (autorizada, rejeitada,
 * cancelada). URL por cliente, assinada: /api/webhooks/focus?tenant=…&assinatura=….
 * Grava o aviso deduplicado e actualiza o documento; responde rápido.
 */
import { NextResponse } from 'next/server'
import { atualizarDocumento } from '@/lib/dados/fiscal'
import { estadoDaFocus } from '@/lib/dominio/fiscal'
import { webhookValido } from '@/lib/integracoes/assinatura-webhook'
import { clienteAdmin } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const tenantId = url.searchParams.get('tenant') ?? ''
  if (!/^[0-9a-f-]{36}$/.test(tenantId) || !webhookValido('focus', tenantId, url.searchParams.get('assinatura'))) {
    return NextResponse.json({ erro: 'assinatura inválida' }, { status: 401 })
  }
  const corpo = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const ref = typeof corpo?.ref === 'string' ? corpo.ref : null
  if (!corpo || !ref) return NextResponse.json({ erro: 'corpo inválido' }, { status: 400 })

  const admin = clienteAdmin()
  const eventoId = `${ref}:${String(corpo.status ?? '')}:${String(corpo.chave_nfe ?? '')}`
  const { error: duplicado } = await admin
    .from('webhooks_recebidos')
    .insert({ provedor: 'focus', evento_id: eventoId, tenant_id: tenantId, payload: corpo as never, assinatura_ok: true })
  if (duplicado?.code === '23505') return NextResponse.json({ ok: true, repetido: true })

  const { data: doc } = await admin.from('documentos_fiscais').select('id, ambiente').eq('tenant_id', tenantId).eq('ref', ref).maybeSingle()
  if (doc) {
    const base = doc.ambiente === 'producao' ? 'https://api.focusnfe.com.br' : 'https://homologacao.focusnfe.com.br'
    const caminho = (c: unknown) => (typeof c === 'string' && c ? (c.startsWith('http') ? c : base + c) : null)
    await atualizarDocumento(tenantId, doc.id, {
      estado: estadoDaFocus(corpo.status as string),
      numero: corpo.numero != null ? String(corpo.numero) : null,
      serie: corpo.serie != null ? String(corpo.serie) : null,
      chave: typeof corpo.chave_nfe === 'string' ? corpo.chave_nfe.replace(/\D/g, '') || null : null,
      protocolo: typeof corpo.protocolo === 'string' ? corpo.protocolo : null,
      urlDanfe: caminho(corpo.caminho_danfe),
      urlXml: caminho(corpo.caminho_xml_nota_fiscal),
      mensagem: (corpo.mensagem_sefaz as string) ?? null,
    })
    await admin.from('webhooks_recebidos').update({ processado_em: new Date().toISOString() }).eq('provedor', 'focus').eq('evento_id', eventoId)
  }
  return NextResponse.json({ ok: true })
}
