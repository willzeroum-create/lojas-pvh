/**
 * Resumo diário automático (módulo `ia_whatsapp`), chamado pelo Vercel Cron às
 * 22:00 de Porto Velho. Protegido por CRON_SECRET. Sem a API oficial do
 * WhatsApp configurada não envia nada e diz porquê (pré-funcional).
 */
import { NextResponse } from 'next/server'
import { coletarResumoDiario, hojeEmPortoVelho } from '@/lib/dados/resumo-diario'
import { linhaResumo } from '@/lib/dominio/resumo-diario'
import { configWhatsapp, enviarModelo } from '@/lib/integracoes/whatsapp-cloud'
import { clienteAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const segredo = process.env.CRON_SECRET
  if (!segredo || request.headers.get('authorization') !== `Bearer ${segredo}`) {
    return NextResponse.json({ erro: 'não autorizado' }, { status: 401 })
  }
  const config = configWhatsapp()
  if (!config) {
    return NextResponse.json({
      enviados: 0,
      aviso: 'API oficial do WhatsApp não configurada (WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TEMPLATE_RESUMO).',
    })
  }

  // Chave secreta: cada consulta abaixo filtra explicitamente pelo tenant.
  const admin = clienteAdmin()
  const { data: ligados } = await admin
    .from('tenant_modulos')
    .select('tenant_id, configuracao, tenants!inner(nome_fantasia, whatsapp, status)')
    .eq('modulo', 'ia_whatsapp')
    .eq('ativo', true)

  const dia = hojeEmPortoVelho()
  const resultados: Array<{ tenant: string; ok: boolean; erro?: string }> = []
  for (const l of ligados ?? []) {
    const t = l.tenants as unknown as { nome_fantasia: string; whatsapp: string; status: string }
    if (t.status === 'cancelado' || t.status === 'suspenso') continue
    const cfg = (l.configuracao ?? {}) as { numero_dono?: string; automatico?: boolean }
    if (cfg.automatico === false) continue
    try {
      const dados = await coletarResumoDiario(admin, l.tenant_id, t.nome_fantasia, dia)
      const r = await enviarModelo(config, cfg.numero_dono ?? t.whatsapp, config.modeloResumo, [t.nome_fantasia, dados.dia, linhaResumo(dados)])
      resultados.push({ tenant: l.tenant_id, ok: r.ok, erro: r.ok ? undefined : r.erro })
    } catch (e) {
      resultados.push({ tenant: l.tenant_id, ok: false, erro: e instanceof Error ? e.message : 'erro' })
    }
  }
  return NextResponse.json({ enviados: resultados.filter((r) => r.ok).length, resultados })
}
