import { dinheiro, inteiro, uuid, z } from './zod'

const vazio = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const data = z.iso.date('Data inválida')
const FORMAS = ['dinheiro', 'pix', 'cartao_debito', 'cartao_credito', 'boleto', 'transferencia', 'outro'] as const

export const esquemaTitulo = z
  .object({
    tipo: z.enum(['receber', 'pagar']),
    descricao: z.string().trim().min(1, 'Descreva a conta').max(120),
    pessoaId: z.preprocess(vazio, uuid.optional()),
    categoriaId: uuid,
    valor: dinheiro.refine((v) => v > 0, 'Informe o valor'),
    parcelas: z.preprocess((v) => (v === undefined || v === '' ? 1 : v), inteiro.min(1).max(60)),
    primeiroVencimento: data,
    competencia: data,
    documento: z.preprocess(vazio, z.string().trim().max(60).optional()),
    observacoes: z.preprocess(vazio, z.string().trim().max(1000).optional()),
    /** À vista: já pago nesta data e nesta carteira. */
    pagoEm: z.preprocess(vazio, data.optional()),
    carteiraId: z.preprocess(vazio, uuid.optional()),
    forma: z.preprocess(vazio, z.enum(FORMAS).optional()),
    origem: z.enum(['manual', 'pedido', 'compra', 'recorrente']).optional(),
    origemId: uuid.optional(),
  })
  .refine((t) => !t.pagoEm || t.carteiraId, { message: 'Escolha a carteira do pagamento', path: ['carteiraId'] })
export type DadosTitulo = z.infer<typeof esquemaTitulo>

export const esquemaBaixa = z.object({
  parcelaId: uuid,
  carteiraId: uuid,
  data,
  valor: dinheiro.refine((v) => v > 0, 'Informe o valor'),
  juros: z.preprocess((v) => v ?? 0, dinheiro),
  multa: z.preprocess((v) => v ?? 0, dinheiro),
  desconto: z.preprocess((v) => v ?? 0, dinheiro),
  forma: z.enum(FORMAS).default('dinheiro'),
  observacao: z.preprocess(vazio, z.string().trim().max(300).optional()),
})
export type DadosBaixa = z.infer<typeof esquemaBaixa>

export const esquemaFiltroParcelas = z.object({
  tipo: z.enum(['receber', 'pagar']).default('receber'),
  situacao: z.enum(['abertas', 'vencidas', 'pagas', 'todas']).default('abertas'),
  de: z.preprocess(vazio, data.optional()),
  ate: z.preprocess(vazio, data.optional()),
})
export type FiltroParcelas = z.infer<typeof esquemaFiltroParcelas>
