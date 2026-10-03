import 'server-only'

/**
 * Emissor fiscal parceiro: Focus NFe (docs/pesquisa/integracoes.md §1).
 * Token por empresa (Basic, token como utilizador), `ref` como chave de
 * idempotência — reenviar a mesma `ref` nunca duplica a nota.
 */
import { estadoDaFocus, type EstadoDocumentoFiscal } from '@/lib/dominio/fiscal'

const BASE = {
  homologacao: 'https://homologacao.focusnfe.com.br',
  producao: 'https://api.focusnfe.com.br',
} as const

export type AmbienteFiscal = keyof typeof BASE

export type RespostaEmissor = {
  estado: EstadoDocumentoFiscal
  numero: string | null
  serie: string | null
  chave: string | null
  protocolo: string | null
  urlDanfe: string | null
  urlXml: string | null
  mensagem: string | null
}

function autorizacao(token: string) {
  return `Basic ${Buffer.from(`${token}:`).toString('base64')}`
}

function ler(corpo: Record<string, unknown>, ambiente: AmbienteFiscal): RespostaEmissor {
  const absoluto = (caminho: unknown) => (typeof caminho === 'string' && caminho ? (caminho.startsWith('http') ? caminho : BASE[ambiente] + caminho) : null)
  return {
    estado: estadoDaFocus(corpo.status as string | undefined),
    numero: corpo.numero != null ? String(corpo.numero) : null,
    serie: corpo.serie != null ? String(corpo.serie) : null,
    chave: typeof corpo.chave_nfe === 'string' ? corpo.chave_nfe.replace(/\D/g, '') || null : null,
    protocolo: typeof corpo.protocolo === 'string' ? corpo.protocolo : null,
    urlDanfe: absoluto(corpo.caminho_danfe),
    urlXml: absoluto(corpo.caminho_xml_nota_fiscal),
    mensagem: (corpo.mensagem_sefaz as string) ?? (corpo.mensagem as string) ?? null,
  }
}

async function chamar(ambiente: AmbienteFiscal, token: string, metodo: string, caminho: string, corpo?: unknown): Promise<RespostaEmissor> {
  try {
    const r = await fetch(BASE[ambiente] + caminho, {
      method: metodo,
      signal: AbortSignal.timeout(30_000),
      headers: { authorization: autorizacao(token), 'content-type': 'application/json' },
      body: corpo ? JSON.stringify(corpo) : undefined,
    })
    const json = (await r.json().catch(() => ({}))) as Record<string, unknown>
    if (!r.ok && !json.status) {
      return { ...ler({}, ambiente), estado: 'erro', mensagem: (json.mensagem as string) ?? `Emissor respondeu ${r.status}` }
    }
    return ler(json, ambiente)
  } catch (e) {
    return { ...ler({}, ambiente), estado: 'erro', mensagem: e instanceof Error ? `Sem resposta do emissor: ${e.message}` : 'Sem resposta do emissor' }
  }
}

export const focusNfe = {
  emitirNfce: (ambiente: AmbienteFiscal, token: string, ref: string, documento: unknown) =>
    chamar(ambiente, token, 'POST', `/v2/nfce?ref=${encodeURIComponent(ref)}`, documento),
  consultarNfce: (ambiente: AmbienteFiscal, token: string, ref: string) =>
    chamar(ambiente, token, 'GET', `/v2/nfce/${encodeURIComponent(ref)}?completa=0`),
  cancelarNfce: (ambiente: AmbienteFiscal, token: string, ref: string, justificativa: string) =>
    chamar(ambiente, token, 'DELETE', `/v2/nfce/${encodeURIComponent(ref)}`, { justificativa }),
}
