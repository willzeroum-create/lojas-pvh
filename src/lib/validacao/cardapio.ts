import { booleano, dinheiro, inteiro, uuid, z } from './zod'

export const esquemaCategoria = z.object({
  nome: z.string().trim().min(1).max(60),
  ordem: inteiro.min(0).default(0),
  ativo: booleano.default(true),
})
export type DadosCategoria = z.infer<typeof esquemaCategoria>

export const esquemaOpcao = z.object({
  id: uuid.optional(),
  nome: z.string().trim().min(1).max(60),
  preco_adicional: dinheiro.default(0),
  disponivel: booleano.default(true),
})

export const esquemaGrupoOpcao = z
  .object({
    id: uuid.optional(),
    nome: z.string().trim().min(1).max(60),
    min: inteiro.min(0).default(0),
    max: inteiro.min(1).default(1),
    obrigatorio: booleano.default(false),
    opcoes: z.array(esquemaOpcao).min(1, 'Um grupo precisa de pelo menos uma opção').max(30),
  })
  .refine((g) => g.max >= g.min, { message: 'O máximo não pode ser menor que o mínimo', path: ['max'] })
export type DadosGrupoOpcao = z.infer<typeof esquemaGrupoOpcao>

export const esquemaProduto = z
  .object({
    categoria_id: uuid,
    nome: z.string().trim().min(1).max(100),
    descricao: z.string().trim().max(300).optional(),
    preco: dinheiro,
    preco_promocional: dinheiro.optional(),
    sku: z.string().trim().max(40).optional(),
    disponivel: booleano.default(true),
    tempo_preparo_min: inteiro.min(0).max(240).optional(),
    ordem: inteiro.min(0).default(0),
  })
  .refine((p) => p.preco_promocional === undefined || p.preco_promocional < p.preco, {
    message: 'O preço promocional tem de ser menor que o preço',
    path: ['preco_promocional'],
  })
export type DadosProduto = z.infer<typeof esquemaProduto>

/** Linha do importador de cardápio, já revista pelo operador. */
export const esquemaLinhaImportacao = z.object({
  categoria: z.string().trim().min(1).max(60),
  nome: z.string().trim().min(1).max(100),
  descricao: z.string().trim().max(300).optional(),
  preco: dinheiro,
})
export const esquemaImportacao = z.array(esquemaLinhaImportacao).min(1).max(500)
export type LinhaImportacao = z.infer<typeof esquemaLinhaImportacao>
