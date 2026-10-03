import { booleano, dinheiro, inteiro, uuid, z } from './zod'

const vazio = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const quantia = z.preprocess((v) => (v === '' || v === undefined || v === null ? 0 : v), dinheiro)
const formas = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'outro'] as const

export const esquemaMesa = z.object({
  id: z.preprocess(vazio, uuid.optional()),
  numero: inteiro.min(1, 'Número da mesa').max(9999),
  area: z.preprocess(vazio, z.string().trim().max(40).optional()),
  lugares: z.preprocess((v) => (v === '' || v === undefined ? 4 : v), inteiro.min(1).max(99)),
  ativa: booleano,
})

export const esquemaAbrirComanda = z
  .object({
    mesaId: z.preprocess(vazio, uuid.optional()),
    identificador: z.preprocess(vazio, z.string().trim().max(30).optional()),
    pessoas: z.preprocess((v) => (v === '' || v === undefined ? 1 : v), inteiro.min(1).max(99)),
  })
  .refine((d) => d.mesaId || d.identificador, { message: 'Escolha a mesa ou escreva o número da comanda', path: ['mesaId'] })

export const esquemaLancarItens = z.object({
  comandaId: uuid,
  itens: z
    .array(
      z.object({
        produtoId: uuid,
        quantidade: z.coerce.number().positive().max(999).multipleOf(0.001),
        observacao: z.preprocess(vazio, z.string().trim().max(140).optional()),
      }),
    )
    .min(1, 'Escolha pelo menos um produto')
    .max(100),
})

export const esquemaFecharComanda = z.object({
  comandaId: uuid,
  taxaServico: quantia,
  desconto: quantia,
  pagamentos: z
    .array(z.object({ forma: z.enum(formas), valor: dinheiro.refine((v) => v > 0, 'Valor inválido') }))
    .min(1, 'Escolha a forma de pagamento')
    .max(20),
})

export const esquemaEstacao = z.object({
  id: z.preprocess(vazio, uuid.optional()),
  nome: z.string().trim().min(1, 'Nome da estação').max(40),
  ordem: z.preprocess((v) => (v === '' || v === undefined ? 0 : v), inteiro.min(0).max(99)),
  alertaMin: z.preprocess((v) => (v === '' || v === undefined ? 15 : v), inteiro.min(1).max(240)),
  ativa: booleano,
})

export const esquemaPreparo = z.object({
  itemIds: z.array(uuid).min(1).max(100),
  estado: z.enum(['aguardando', 'em_preparo', 'pronto', 'entregue']),
})

export const esquemaCancelarItem = z.object({
  itemId: uuid,
  motivo: z.string().trim().min(3, 'Escreva o motivo').max(200),
})
