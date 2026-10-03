import { booleano, dinheiro, uuid, z } from './zod'

const vazio = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v)
const quantidade = z.coerce.number().positive('Quantidade maior que zero').max(999999).multipleOf(0.001)
const unidade = z.enum(['un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'dz'])
const itemRef = z.object({ tipo: z.enum(['produto', 'insumo']), id: uuid })

export const esquemaSaida = z.object({
  item: itemRef,
  quantidade,
  motivo: z.string().trim().min(2, 'Escolha o motivo').max(120),
})

export const esquemaXmlNota = z.object({
  xml: z.string().min(100, 'Arquivo vazio').max(3_000_000, 'Arquivo grande demais'),
})

export const esquemaEntradaManual = z.object({
  fornecedorId: z.preprocess(vazio, uuid.optional()),
  observacoes: z.preprocess(vazio, z.string().trim().max(300).optional()),
  itens: z
    .array(
      z.object({
        tipo: z.enum(['produto', 'insumo']),
        id: uuid,
        descricao: z.string().trim().min(1).max(120),
        quantidade,
        valorTotal: z.preprocess((v) => (v === '' || v === undefined ? 0 : v), dinheiro),
      }),
    )
    .min(1, 'Adicione pelo menos um item')
    .max(300),
})

export const esquemaLigarItem = z.object({
  itemId: uuid,
  alvo: itemRef.nullable(),
  fator: z.coerce.number().positive('Fator maior que zero').max(10000),
})

export const esquemaInventario = z.object({
  descricao: z.preprocess(vazio, z.string().trim().max(80).default('Inventário')),
  contagem: z
    .array(z.object({ tipo: z.enum(['produto', 'insumo']), id: uuid, contado: z.coerce.number().min(0).max(999999).multipleOf(0.001) }))
    .min(1, 'Conte pelo menos um item')
    .max(2000),
})

export const esquemaInsumo = z.object({
  id: z.preprocess(vazio, uuid.optional()),
  nome: z.string().trim().min(1, 'Nome do insumo').max(80),
  unidade,
  minimo: z.preprocess((v) => (v === '' || v === undefined ? 0 : v), z.coerce.number().min(0).max(999999)),
  codigoBarras: z.preprocess(vazio, z.string().trim().max(30).optional()),
  ativo: booleano,
})

export const esquemaEstoqueProduto = z.object({
  produtoId: uuid,
  controla: booleano,
  unidade,
  minimo: z.preprocess((v) => (v === '' || v === undefined ? 0 : v), z.coerce.number().min(0).max(999999)),
  codigoBarras: z.preprocess(vazio, z.string().trim().regex(/^[0-9A-Za-z-]{3,30}$/, 'Código inválido').optional()),
  vendidoPorPeso: booleano,
})

export const esquemaFicha = z.object({
  produtoId: uuid,
  linhas: z
    .array(z.object({ insumoId: uuid, quantidade: z.coerce.number().positive('Quantidade maior que zero').max(9999).multipleOf(0.001) }))
    .max(60),
})
