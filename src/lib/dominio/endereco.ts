/**
 * Endereço brasileiro guardado em jsonb. Todos os campos são opcionais porque
 * o comerciante preenche o que tem; a formatação salta o que falta.
 */

export type Endereco = {
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
  referencia?: string
}

export function formatarEndereco(e: Endereco): string {
  const linha1 = [e.rua, e.numero].filter(Boolean).join(', ')
  const complemento = e.complemento?.trim()
  const linha2 = [e.bairro, [e.cidade, e.uf].filter(Boolean).join('/')].filter(Boolean).join(', ')
  return [linha1, complemento, linha2].filter(Boolean).join(' – ')
}

export function enderecoVazio(e: Endereco | null | undefined): boolean {
  return !e || !Object.values(e).some((v) => typeof v === 'string' && v.trim().length > 0)
}

/** Pesquisa no Google Maps; não precisa de coordenadas. */
export function urlMapa(e: Endereco): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatarEndereco(e))}`
}

/** "76801000" → "76801-000". */
export function formatarCep(cep: string): string {
  const d = cep.replace(/\D/g, '')
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : cep
}
