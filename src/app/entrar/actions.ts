'use server'

import { redirect } from 'next/navigation'
import { normalizarIdentificador } from '@/lib/dominio/identificador'
import { clienteServidor } from '@/lib/supabase/server'
import { validar, z } from '@/lib/validacao/zod'

const esquema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail ou o nome de usuário'),
  senha: z.string().min(1, 'Informe a senha'),
  proximo: z.string().optional(),
})

export type EstadoEntrar = { erro: string | null }

/** Entrada com e-mail (donos) ou nome de utilizador (equipa) e senha. */
export async function entrar(_anterior: EstadoEntrar, formData: FormData): Promise<EstadoEntrar> {
  const r = validar(esquema, Object.fromEntries(formData))
  if (!r.ok) return { erro: r.erros[0] ?? 'Dados inválidos' }
  const identificador = normalizarIdentificador(r.dados.email)
  if (!identificador.ok) return { erro: identificador.erro }

  const supabase = await clienteServidor()
  const { error } = await supabase.auth.signInWithPassword({
    email: identificador.email,
    password: r.dados.senha,
  })
  if (error) return { erro: 'Usuário ou senha incorretos.' }

  const destino = r.dados.proximo?.startsWith('/') ? r.dados.proximo : '/painel'
  redirect(destino)
}
