import { esquemaEndereco, telefoneNacional } from './comum'
import { dinheiro, uuid, z } from './zod'

const esquemaItemCarrinho = z.object({
  produtoId: uuid,
  quantidade: z.number().int().min(1).max(99),
  opcoesIds: z.array(uuid).max(30).default([]),
  observacao: z.string().trim().max(140).optional(),
})

/** O que o checkout envia. Sem preços: o servidor recalcula tudo do catálogo. */
export const esquemaNovoPedido = z
  .object({
    tenantId: uuid,
    lojaId: uuid,
    itens: z.array(esquemaItemCarrinho).min(1).max(50),
    tipoEntrega: z.enum(['entrega', 'retirada']),
    clienteNome: z.string().trim().min(2).max(60),
    clienteTelefone: telefoneNacional,
    endereco: esquemaEndereco.optional(),
    formaPagamento: z.enum(['pix', 'dinheiro', 'cartao']),
    trocoPara: dinheiro.optional(),
    observacoes: z.string().trim().max(300).optional(),
    /** Campo-armadilha para bots. Tem de vir vazio. */
    site: z.string().max(0).optional(),
  })
  .refine((p) => p.tipoEntrega !== 'entrega' || (p.endereco?.rua && p.endereco?.numero), {
    message: 'Informe rua e número para a entrega',
    path: ['endereco'],
  })
export type NovoPedido = z.infer<typeof esquemaNovoPedido>

export const esquemaStatusPedido = z.object({
  pedidoId: uuid,
  status: z.enum(['novo', 'aceite', 'pronto', 'concluido', 'cancelado']),
})
