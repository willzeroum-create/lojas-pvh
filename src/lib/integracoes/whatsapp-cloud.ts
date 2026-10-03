import 'server-only'

/**
 * Envio pela API oficial do WhatsApp (Cloud API da Meta). Pré-funcional: o
 * código está pronto e entra em funcionamento quando a agência tiver a conta
 * WhatsApp Business verificada e o modelo do resumo aprovado.
 *
 *   WHATSAPP_TOKEN            token permanente do utilizador de sistema
 *   WHATSAPP_PHONE_NUMBER_ID  id do número que envia
 *   WHATSAPP_TEMPLATE_RESUMO  nome do modelo aprovado (ex.: resumo_diario)
 *
 * Mensagens iniciadas pela empresa fora da janela de 24 h só podem ser
 * modelos aprovados; o modelo do resumo tem três parâmetros: empresa, dia e a
 * linha com os números.
 */

export type ConfigWhatsapp = { token: string; numeroId: string; modeloResumo: string }

export function configWhatsapp(): ConfigWhatsapp | null {
  const token = process.env.WHATSAPP_TOKEN
  const numeroId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const modeloResumo = process.env.WHATSAPP_TEMPLATE_RESUMO
  return token && numeroId && modeloResumo ? { token, numeroId, modeloResumo } : null
}

export async function enviarModelo(
  config: ConfigWhatsapp,
  para: string,
  modelo: string,
  parametros: string[],
): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  try {
    const resposta = await fetch(`https://graph.facebook.com/v21.0/${config.numeroId}/messages`, {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: para,
        type: 'template',
        template: {
          name: modelo,
          language: { code: 'pt_BR' },
          components: [
            { type: 'body', parameters: parametros.map((text) => ({ type: 'text', text: text.replace(/\s+/g, ' ').slice(0, 1000) })) },
          ],
        },
      }),
    })
    const corpo = (await resposta.json().catch(() => ({}))) as { messages?: Array<{ id: string }>; error?: { message?: string } }
    if (!resposta.ok) return { ok: false, erro: corpo.error?.message ?? `HTTP ${resposta.status}` }
    return { ok: true, id: corpo.messages?.[0]?.id ?? '' }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'falha de rede' }
  }
}
