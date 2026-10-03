import { ESTADOS } from '@/lib/cadeia/estados'
import { booleano, uuid, z } from './zod'

const vazioParaIndefinido = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)

export const esquemaEstadoEtapa = z.object({
  tenantId: uuid,
  etapaId: uuid,
  estado: z.enum(ESTADOS),
})

export const esquemaDetalhesEtapa = z.object({
  tenantId: uuid,
  etapaId: uuid,
  notas: z.preprocess(vazioParaIndefinido, z.string().max(20_000).optional()),
  url: z.preprocess(vazioParaIndefinido, z.url('Informe um link completo, com https://').optional()),
  responsavel: z.preprocess(vazioParaIndefinido, z.string().trim().max(60).optional()),
  prevista_em: z.preprocess(vazioParaIndefinido, z.iso.date().optional()),
})
export type DetalhesEtapa = z.infer<typeof esquemaDetalhesEtapa>

export const esquemaEtapaPersonalizada = z.object({
  tenantId: uuid,
  frente: z.string().regex(/^[a-z][a-z0-9_]{1,39}$/),
  titulo: z.string().trim().min(1).max(120),
  descricao: z.preprocess(vazioParaIndefinido, z.string().trim().max(300).optional()),
})

export const esquemaNota = z.object({
  titulo: z.string().trim().min(1).max(120),
  conteudo: z.string().max(50_000).default(''),
  fixada: booleano.default(false),
})
export type DadosNota = z.infer<typeof esquemaNota>
