import { inteiro, uuid, z } from './zod'

/** Pastas propostas ao criar; a equipa pode escrever qualquer outra. */
export const PASTAS_SUGERIDAS = [
  'Fotos de produtos',
  'Fachada e ambiente',
  'Logo e identidade',
  'Cardápio de papel',
  'Redes sociais',
  'Documentos',
] as const

export const esquemaPasta = z.string().trim().min(1).max(60)

/** Registo de um ficheiro já enviado para o bucket `arquivos`. */
export const esquemaRegistarArquivo = z
  .object({
    tenantId: uuid,
    pasta: esquemaPasta,
    nome: z.string().trim().min(1).max(200),
    caminho: z.string().min(3).max(400),
    tipo: z.string().min(1).max(120),
    tamanho: inteiro.min(0).max(26_214_400),
  })
  .refine((a) => a.caminho.startsWith(`${a.tenantId}/`), {
    message: 'O caminho tem de começar pela pasta do tenant',
    path: ['caminho'],
  })
export type RegistarArquivo = z.infer<typeof esquemaRegistarArquivo>
