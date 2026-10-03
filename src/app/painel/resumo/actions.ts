'use server'

/** Resumo do dia pronto para mandar ao WhatsApp do dono (envio manual, funciona já). */
import { exigirModulo } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { coletarResumoDiario, hojeEmPortoVelho } from '@/lib/dados/resumo-diario'
import { montarResumoDiario } from '@/lib/dominio/resumo-diario'
import { urlWhatsapp } from '@/lib/dominio/whatsapp'

export async function resumoDoDiaAction(): Promise<{ ok: true; texto: string; url: string } | { ok: false; erro: string }> {
  const ctx = await exigirModulo('resumo')
  try {
    const { data: tenant } = await ctx.supabase.from('tenants').select('nome_fantasia, whatsapp').eq('id', ctx.tenantId).single()
    const { data: config } = await ctx.supabase
      .from('tenant_modulos')
      .select('configuracao')
      .eq('tenant_id', ctx.tenantId)
      .eq('modulo', 'ia_whatsapp')
      .maybeSingle()
    const numero = (config?.configuracao as { numero_dono?: string } | null)?.numero_dono ?? tenant?.whatsapp ?? ''
    const dados = await coletarResumoDiario(ctx.supabase, ctx.tenantId, tenant?.nome_fantasia ?? 'Sua empresa', hojeEmPortoVelho())
    const texto = montarResumoDiario(dados)
    return { ok: true, texto, url: urlWhatsapp(numero, texto) }
  } catch (e) {
    return { ok: false, erro: e instanceof ErroDados ? e.message : 'Não foi possível montar o resumo.' }
  }
}
