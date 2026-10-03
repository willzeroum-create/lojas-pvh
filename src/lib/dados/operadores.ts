import 'server-only'

/**
 * A equipa que usa o console. Tudo passa pelo cliente admin: criar o acesso
 * exige a API de Auth, e a tabela `operadores` só deixa cada um ver a sua
 * linha.
 */
import type { Cliente } from '@/lib/supabase/server'
import { ErroDados, garantir, ouErro } from './erros'

export type Operador = { user_id: string; nome: string; email: string | null; criado_em: string }

export async function listarOperadores(admin: Cliente): Promise<Operador[]> {
  const linhas = ouErro(
    await admin.from('operadores').select('user_id, nome, criado_em').order('criado_em'),
    'Não foi possível listar a equipa',
  )
  return Promise.all(
    linhas.map(async (o) => {
      const { data } = await admin.auth.admin.getUserById(o.user_id)
      return { ...o, email: data.user?.email ?? null }
    }),
  )
}

/** Cria (ou reaproveita) o utilizador no Auth e regista-o como operador. */
export async function criarOperador(
  admin: Cliente,
  dados: { nome: string; email: string; senha: string },
): Promise<string> {
  let userId: string
  const criado = await admin.auth.admin.createUser({
    email: dados.email,
    password: dados.senha,
    email_confirm: true,
    app_metadata: { papel: 'operador' },
  })
  if (criado.data.user) {
    userId = criado.data.user.id
  } else {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existente = data.users.find((u) => u.email?.toLowerCase() === dados.email.toLowerCase())
    if (!existente)
      throw new ErroDados(`Não foi possível criar o acesso: ${criado.error?.message ?? 'erro desconhecido'}`)
    userId = existente.id
    const { error } = await admin.auth.admin.updateUserById(userId, { password: dados.senha })
    if (error) throw new ErroDados(`Não foi possível definir a senha: ${error.message}`)
  }
  garantir(
    await admin.from('operadores').upsert({ user_id: userId, nome: dados.nome }),
    'Não foi possível registar o operador',
  )
  return userId
}

/** Tira o acesso ao console. Não apaga o utilizador do Auth: pode ser dono de um tenant. */
export async function removerOperador(admin: Cliente, userId: string): Promise<void> {
  garantir(
    await admin.from('operadores').delete().eq('user_id', userId),
    'Não foi possível remover o operador',
  )
}
