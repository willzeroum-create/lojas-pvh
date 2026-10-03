import { esquemaEndereco, esquemaHorarios, fusoHorario } from './comum'
import { booleano, dinheiro, z } from './zod'

export const esquemaLoja = z.object({
  nome: z.string().trim().min(1).max(60).default('Principal'),
  endereco: esquemaEndereco.optional(),
  fuso_horario: fusoHorario,
  horarios: esquemaHorarios,
  aceita_entrega: booleano,
  aceita_retirada: booleano,
  raio_entrega_km: z.coerce.number().min(0).max(200).optional(),
  taxa_entrega: dinheiro,
  pedido_minimo: dinheiro,
})
export type DadosLoja = z.infer<typeof esquemaLoja>
