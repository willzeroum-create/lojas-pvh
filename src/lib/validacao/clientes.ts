import { lerCep, lerDocumento } from '@/lib/dominio/documento'
import { normalizarWhatsapp } from '@/lib/dominio/telefone'
import { booleano, uuid, z } from './zod'

const vazio = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const textoOpcional = (max: number) => z.preprocess(vazio, z.string().trim().max(max).optional())

export const esquemaEndereco = z.object({
  rotulo: z.preprocess(vazio, z.string().trim().min(1).max(40).default('Principal')),
  cep: z.preprocess(
    vazio,
    z
      .string()
      .transform((v, ctx) => {
        const cep = lerCep(v)
        if (!cep) ctx.addIssue({ code: 'custom', message: 'CEP com 8 dígitos' })
        return cep ?? ''
      })
      .optional(),
  ),
  rua: textoOpcional(120),
  numero: textoOpcional(20),
  complemento: textoOpcional(80),
  bairro: textoOpcional(80),
  cidade: textoOpcional(80),
  uf: z.preprocess(
    (v) => (typeof v === 'string' ? (v.trim() === '' ? undefined : v.trim().toUpperCase()) : v),
    z.string().regex(/^[A-Z]{2}$/, 'UF com 2 letras').optional(),
  ),
  referencia: textoOpcional(120),
})
export type EnderecoPessoa = z.infer<typeof esquemaEndereco>

export const esquemaPessoa = z
  .object({
    id: uuid.optional(),
    nome: z.string().trim().min(1, 'Informe o nome').max(120),
    nome_fantasia: textoOpcional(120),
    documento: z.preprocess(
      vazio,
      z
        .string()
        .transform((v, ctx) => {
          const doc = lerDocumento(v)
          if (!doc) ctx.addIssue({ code: 'custom', message: 'CPF ou CNPJ inválido' })
          return doc
        })
        .optional(),
    ),
    whatsapp: z.preprocess(
      vazio,
      z
        .string()
        .transform((v, ctx) => {
          const numero = normalizarWhatsapp(v)
          if (!numero) ctx.addIssue({ code: 'custom', message: 'WhatsApp com DDD, ex.: (69) 99999-8888' })
          return numero ?? ''
        })
        .optional(),
    ),
    email: z.preprocess(vazio, z.email('E-mail inválido').toLowerCase().optional()),
    nascimento: z.preprocess(vazio, z.iso.date().optional()),
    observacoes: textoOpcional(2000),
    e_cliente: booleano,
    e_fornecedor: booleano,
    etiquetas: z.preprocess(
      (v) => (typeof v === 'string' ? v.split(',') : v),
      z.array(z.string().trim().toLowerCase().max(30)).transform((l) => [...new Set(l.filter(Boolean))].slice(0, 20)),
    ).default([]),
    endereco: esquemaEndereco.optional(),
    aceita_marketing: booleano.optional(),
  })
  .refine((p) => p.e_cliente || p.e_fornecedor, { message: 'Marque cliente, fornecedor ou ambos', path: ['e_cliente'] })
export type DadosPessoa = z.infer<typeof esquemaPessoa>

export const esquemaBuscaPessoas = z.object({
  busca: z.preprocess(vazio, z.string().trim().max(80).optional()),
  papel: z.enum(['todos', 'clientes', 'fornecedores']).default('todos'),
  pagina: z.coerce.number().int().min(1).max(1000).default(1),
})
export type BuscaPessoas = z.infer<typeof esquemaBuscaPessoas>
