import { MODULOS } from '@/lib/modulos/catalogo'
import { uuid, z } from './zod'

const IDS = MODULOS.map((m) => m.id) as [string, ...string[]]

export const esquemaAlternarModulo = z.object({
  tenantId: uuid,
  modulo: z.enum(IDS),
  ativo: z.boolean(),
})
