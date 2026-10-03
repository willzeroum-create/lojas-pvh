import { normalizarTelefoneNacional, normalizarWhatsapp } from '@/lib/dominio/telefone'
import { z } from './zod'

export const esquemaEndereco = z.object({
  rua: z.string().trim().max(120).optional(),
  numero: z.string().trim().max(20).optional(),
  complemento: z.string().trim().max(80).optional(),
  bairro: z.string().trim().max(80).optional(),
  cidade: z.string().trim().max(80).optional(),
  uf: z
    .string()
    .trim()
    .length(2)
    .transform((s) => s.toUpperCase())
    .optional(),
  cep: z
    .string()
    .trim()
    .transform((s) => s.replace(/\D/g, ''))
    .refine((s) => s === '' || s.length === 8, 'CEP deve ter 8 dígitos')
    .optional(),
  referencia: z.string().trim().max(120).optional(),
})

export const esquemaHorario = z.object({
  dia: z.coerce.number().int().min(0).max(6),
  abre: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora no formato HH:MM'),
  fecha: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora no formato HH:MM'),
})

export const esquemaHorarios = z.array(esquemaHorario).max(21)

/** WhatsApp do comerciante: aceita máscara, guarda só dígitos com DDI. */
export const whatsapp = z
  .string()
  .trim()
  .transform((s, ctx) => {
    const n = normalizarWhatsapp(s)
    if (!n) ctx.addIssue({ code: 'custom', message: 'Informe um WhatsApp brasileiro válido, com DDD' })
    return n ?? ''
  })

/** Telefone nacional do cliente final, 10 ou 11 dígitos. */
export const telefoneNacional = z
  .string()
  .trim()
  .transform((s, ctx) => {
    const n = normalizarTelefoneNacional(s)
    if (!n) ctx.addIssue({ code: 'custom', message: 'Informe um telefone com DDD' })
    return n ?? ''
  })

export const corHex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor no formato #RRGGBB')

export const fusoHorario = z.string().refine((f) => {
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone: f })
    return true
  } catch {
    return false
  }
}, 'Fuso horário inválido')

export const FUSOS_BRASIL = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Porto_Velho',
  'America/Rio_Branco',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Bahia',
  'America/Cuiaba',
  'America/Campo_Grande',
  'America/Boa_Vista',
  'America/Noronha',
] as const
