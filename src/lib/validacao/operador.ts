import { normalizarIdentificador } from '@/lib/dominio/identificador'
import { z } from './zod'

/** O campo chama-se `email` mas aceita um nome de utilizador ("will"), que vira e-mail do domínio da equipa. */
export const esquemaNovoOperador = z.object({
  nome: z.string().trim().min(2).max(60),
  email: z
    .string()
    .trim()
    .min(1, 'Informe o e-mail ou o nome de usuário')
    .transform((v, ctx) => {
      const r = normalizarIdentificador(v)
      if (!r.ok) {
        ctx.addIssue({ code: 'custom', message: r.erro })
        return z.NEVER
      }
      return r.email
    })
    .pipe(z.email()),
  senha: z.string().min(8, 'A senha precisa de pelo menos 8 caracteres').max(72),
})
export type NovoOperador = z.infer<typeof esquemaNovoOperador>
