/**
 * Telefones brasileiros. Guardamos só dígitos; o WhatsApp leva o DDI 55.
 */

const DDI_BRASIL = '55'

export function apenasDigitos(texto: string): string {
  return texto.replace(/\D/g, '')
}

/**
 * Normaliza para o formato do `wa.me`: DDI + DDD + número, só dígitos.
 * Aceita com ou sem DDI, com ou sem máscara. Devolve null se não for um número
 * brasileiro plausível (10 ou 11 dígitos nacionais).
 */
export function normalizarWhatsapp(entrada: string): string | null {
  let digitos = apenasDigitos(entrada)
  if (digitos.startsWith('0')) digitos = digitos.replace(/^0+/, '')
  if (digitos.length === 12 || digitos.length === 13) {
    return digitos.startsWith(DDI_BRASIL) ? digitos : null
  }
  if (digitos.length === 10 || digitos.length === 11) {
    return DDI_BRASIL + digitos
  }
  return null
}

/** Telefone nacional, 10 ou 11 dígitos, sem DDI. Usado para o telefone do cliente final. */
export function normalizarTelefoneNacional(entrada: string): string | null {
  let digitos = apenasDigitos(entrada)
  if (digitos.length === 12 || digitos.length === 13) {
    if (!digitos.startsWith(DDI_BRASIL)) return null
    digitos = digitos.slice(2)
  }
  return digitos.length === 10 || digitos.length === 11 ? digitos : null
}

/** "(69) 99999-8888" ou "(69) 3222-1234". Aceita com ou sem DDI. */
export function formatarTelefone(digitos: string): string {
  const nacional = normalizarTelefoneNacional(digitos) ?? apenasDigitos(digitos)
  if (nacional.length === 11) return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 7)}-${nacional.slice(7)}`
  if (nacional.length === 10) return `(${nacional.slice(0, 2)}) ${nacional.slice(2, 6)}-${nacional.slice(6)}`
  return digitos
}
