/**
 * Ponto único de configuração do zod: mensagens em português e utilitários
 * para ler formulários. Os esquemas importam `z` daqui.
 */
import { z } from 'zod'

z.config(z.locales.pt())

export { z }

export type ResultadoValidacao<T> =
  { ok: true; dados: T } | { ok: false; erros: string[]; porCampo: Record<string, string> }

/** Valida e devolve erros legíveis, prontos para o ecrã. */
export function validar<T>(esquema: z.ZodType<T>, entrada: unknown): ResultadoValidacao<T> {
  const r = esquema.safeParse(entrada)
  if (r.success) return { ok: true, dados: r.data }
  const porCampo: Record<string, string> = {}
  const erros: string[] = []
  for (const issue of r.error.issues) {
    const campo = issue.path.map(String).join('.')
    if (campo && !porCampo[campo]) porCampo[campo] = issue.message
    erros.push(campo ? `${campo}: ${issue.message}` : issue.message)
  }
  return { ok: false, erros, porCampo }
}

/**
 * Converte FormData num objecto simples. Campos repetidos (ou com sufixo `[]`)
 * viram arrays; strings vazias viram `undefined` para os `.optional()` pegarem.
 */
export function deFormData(fd: FormData): Record<string, unknown> {
  const saida: Record<string, unknown> = {}
  for (const [chaveBruta, valor] of fd.entries()) {
    if (typeof valor !== 'string') continue
    const lista = chaveBruta.endsWith('[]')
    const chave = lista ? chaveBruta.slice(0, -2) : chaveBruta
    const v = valor.trim() === '' ? undefined : valor
    if (lista || chave in saida) {
      const atual = saida[chave]
      saida[chave] = Array.isArray(atual)
        ? [...atual, v]
        : atual === undefined && !lista
          ? v
          : [atual, v].filter((x) => x !== undefined)
    } else {
      saida[chave] = v
    }
  }
  return saida
}

/** Checkbox de formulário: ausente → false, "on"/"true"/"1" → true. */
export const booleano = z.preprocess(
  (v) => v === true || v === 'on' || v === 'true' || v === '1',
  z.boolean(),
)

/** Número escrito à brasileira ("18,50") ou à americana ("18.50"). */
export const dinheiro = z.preprocess((v) => {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return v
  const limpo = v.replace(/[^\d,.-]/g, '')
  const normalizado =
    limpo.lastIndexOf(',') > limpo.lastIndexOf('.')
      ? limpo.replace(/\./g, '').replace(',', '.')
      : limpo.replace(/,/g, '')
  return normalizado === '' ? undefined : Number(normalizado)
}, z.number().min(0).multipleOf(0.01))

export const inteiro = z.coerce.number().int()

export const uuid = z.uuid()
