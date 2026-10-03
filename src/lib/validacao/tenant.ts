import { slugValido } from '@/lib/dominio/slug'
import { corHex, esquemaEndereco, whatsapp } from './comum'
import { z } from './zod'

export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .refine(slugValido, 'Use só letras minúsculas, números e hífens (3 a 50), e não um nome reservado')

const cnpj = z
  .string()
  .trim()
  .transform((s) => s.replace(/\D/g, ''))
  .refine((s) => s.length === 14, 'CNPJ deve ter 14 dígitos')

/** Criação de tenant no console: dados do comerciante e do dono que vai entrar no painel. */
export const esquemaNovoTenant = z.object({
  nome_fantasia: z.string().trim().min(2).max(80),
  slug,
  whatsapp,
  telefone: z.string().trim().max(20).optional(),
  razao_social: z.string().trim().max(120).optional(),
  cnpj: cnpj.optional(),
  cor_marca: corHex.optional(),
  endereco: esquemaEndereco.optional(),
  fuso_horario: z.string().default('America/Sao_Paulo'),
  dono_email: z.email(),
  dono_senha: z.string().min(8, 'A senha precisa de pelo menos 8 caracteres').max(72),
})
export type NovoTenant = z.infer<typeof esquemaNovoTenant>

/** O que o próprio comerciante pode editar no ecrã "Conta". */
export const esquemaContaTenant = z.object({
  nome_fantasia: z.string().trim().min(2).max(80),
  whatsapp,
  telefone: z.string().trim().max(20).optional(),
  cor_marca: corHex.optional(),
  endereco: esquemaEndereco.optional(),
})
export type ContaTenant = z.infer<typeof esquemaContaTenant>

/** O que o operador edita na ficha do cliente. */
export const esquemaFichaTenant = z.object({
  nome_fantasia: z.string().trim().min(2).max(80),
  slug,
  whatsapp,
  telefone: z.string().trim().max(20).optional(),
  razao_social: z.string().trim().max(120).optional(),
  cnpj: cnpj.optional(),
  cor_marca: corHex.optional(),
  plano: z.string().trim().min(1).max(40),
  status: z.enum(['onboarding', 'ativo', 'suspenso', 'cancelado']),
  renovacao_em: z.iso.date().optional(),
})
export type FichaTenant = z.infer<typeof esquemaFichaTenant>

export const esquemaNovaSenha = z.object({
  senha: z.string().min(8, 'A senha precisa de pelo menos 8 caracteres').max(72),
})
