import { dinheiro, uuid, z } from './zod'

const vazio = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const formas = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'outro'] as const
const quantia = z.preprocess((v) => (v === '' || v === undefined || v === null ? 0 : v), dinheiro)

export const esquemaAbrirCaixa = z.object({ fundoTroco: quantia })

export const esquemaMovimentoCaixa = z.object({
  sessaoId: uuid,
  tipo: z.enum(['suprimento', 'sangria']),
  valor: dinheiro.refine((v) => v > 0, 'Informe o valor'),
  motivo: z.string().trim().min(3, 'Escreva o motivo').max(200),
})

export const esquemaFecharCaixa = z.object({
  sessaoId: uuid,
  informado: z.object(Object.fromEntries(formas.map((f) => [f, quantia.optional()])) as Record<(typeof formas)[number], z.ZodOptional<typeof quantia>>),
  justificativa: z.preprocess(vazio, z.string().trim().max(500).optional()),
})

export const esquemaVenda = z.object({
  itens: z
    .array(
      z.object({
        produtoId: uuid,
        quantidade: z.coerce.number().positive().max(9999).multipleOf(0.001),
        desconto: z.preprocess((v) => v ?? 0, dinheiro).optional(),
        observacao: z.preprocess(vazio, z.string().trim().max(140).optional()),
      }),
    )
    .min(1, 'Adicione pelo menos um produto')
    .max(200),
  descontoGeral: quantia,
  pagamentos: z
    .array(z.object({ forma: z.enum(formas), valor: dinheiro.refine((v) => v > 0, 'Valor inválido') }))
    .min(1, 'Escolha a forma de pagamento')
    .max(6),
  clienteId: z.preprocess(vazio, uuid.optional()),
  clienteNome: z.preprocess(vazio, z.string().trim().max(120).optional()),
  observacoes: z.preprocess(vazio, z.string().trim().max(300).optional()),
})
export type DadosVenda = z.infer<typeof esquemaVenda>

export const esquemaCancelarVenda = z.object({
  pedidoId: uuid,
  motivo: z.string().trim().min(3, 'Escreva o motivo').max(200),
})
