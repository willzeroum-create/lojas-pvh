/**
 * Cria um operador da plataforma (quem usa o console em /admin).
 *
 *   pnpm operador will "Senha forte" "Will"            # nome de utilizador
 *   pnpm operador email@equipe.com "Senha forte" "Nome"  # ou e-mail completo
 *
 * Um nome de utilizador vira `nome@equipe.pvh.local` (o Supabase Auth só
 * conhece e-mails). Usa a chave secreta do Supabase lida de `.env.local`. Se
 * o utilizador já existir no Auth, actualiza a senha e garante que está em
 * `operadores`: serve também para trocar a senha de um operador.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { nomeDeUtilizador, normalizarIdentificador } from '../src/lib/dominio/identificador'
import type { Database } from '../src/lib/supabase/tipos'

function carregarEnvLocal() {
  try {
    for (const linha of readFileSync('.env.local', 'utf8').split('\n')) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch {
    // sem .env.local: usa o ambiente
  }
}

async function principal() {
  carregarEnvLocal()
  const [identificador, senha, nome = 'Operador'] = process.argv.slice(2)
  if (!identificador || !senha) {
    console.error('Uso: pnpm operador <nome-de-utilizador|email> <senha> [nome]')
    process.exit(1)
  }
  const normalizado = normalizarIdentificador(identificador)
  if (!normalizado.ok) {
    console.error(normalizado.erro)
    process.exit(1)
  }
  const email = normalizado.email
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.SUPABASE_SECRET_KEY
  if (!url || !chave) {
    console.error('Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SECRET_KEY em .env.local')
    process.exit(1)
  }

  const admin = createClient<Database>(url, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let userId: string
  const criado = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    app_metadata: { papel: 'operador' },
  })
  if (criado.data.user) {
    userId = criado.data.user.id
    console.log(`Utilizador criado: ${email}`)
  } else {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existente = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (!existente) {
      console.error(`Não foi possível criar o utilizador: ${criado.error?.message}`)
      process.exit(1)
    }
    userId = existente.id
    const { error } = await admin.auth.admin.updateUserById(userId, { password: senha })
    if (error) {
      console.error(`Não foi possível actualizar a senha: ${error.message}`)
      process.exit(1)
    }
    console.log(`Utilizador já existia: ${email}. Senha actualizada.`)
  }

  const { error } = await admin.from('operadores').upsert({ user_id: userId, nome })
  if (error) {
    console.error(`Não foi possível registar como operador: ${error.message}`)
    process.exit(1)
  }
  console.log(`Operador pronto: ${nome}, entra como "${nomeDeUtilizador(email)}" em /entrar e vai a /admin.`)
}

principal().catch((e) => {
  console.error(e)
  process.exit(1)
})
