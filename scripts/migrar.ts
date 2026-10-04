/**
 * Aplica as migrações de `supabase/migrations` ao projecto Supabase, por
 * ordem, uma transacção por ficheiro, registando o que já foi aplicado em
 * `app.migracoes`. Idempotente: correr duas vezes não faz nada de novo.
 *
 *   pnpm migrar           aplica o que falta
 *   pnpm migrar --seed    idem, e depois corre supabase/seed.sql
 *   pnpm migrar --demo    idem, e depois supabase/demo-erp.sql (módulos ligados e
 *                         gerente de teste na Lanchonete da Praça; implica --seed)
 *   pnpm migrar --listar  só mostra o estado
 *   pnpm migrar --do-zero apaga tudo o que é da plataforma (supabase/limpeza.sql) e
 *                         reinstala; só em projectos sem dados reais
 *
 * Lê `SUPABASE_DB_URL` de `.env.local`: a string de ligação "Session pooler"
 * do dashboard (Connect → Session pooler), com a senha da base de dados.
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { Client } from 'pg'

const PASTA = path.resolve('supabase/migrations')
const SEED = path.resolve('supabase/seed.sql')
const DEMO = path.resolve('supabase/demo-erp.sql')
const LIMPEZA = path.resolve('supabase/limpeza.sql')

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
  const url = process.env.SUPABASE_DB_URL
  if (!url) {
    console.error('Falta SUPABASE_DB_URL em .env.local (Dashboard → Connect → Session pooler, com a senha).')
    process.exit(1)
  }
  const demo = process.argv.includes('--demo')
  const seed = demo || process.argv.includes('--seed')
  const soListar = process.argv.includes('--listar')
  const doZero = process.argv.includes('--do-zero')

  const cliente = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await cliente.connect()
  try {
    if (doZero && !soListar) {
      process.stdout.write('  limpeza      supabase/limpeza.sql … ')
      await cliente.query(readFileSync(LIMPEZA, 'utf8'))
      console.log('ok')
    }
    await cliente.query('create schema if not exists app')
    await cliente.query(
      'create table if not exists app.migracoes (nome text primary key, aplicada_em timestamptz not null default now())',
    )
    const aplicadas = new Set(
      (await cliente.query<{ nome: string }>('select nome from app.migracoes order by nome')).rows.map(
        (r) => r.nome,
      ),
    )
    const ficheiros = readdirSync(PASTA)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const ficheiro of ficheiros) {
      if (aplicadas.has(ficheiro)) {
        console.log(`  já aplicada  ${ficheiro}`)
        continue
      }
      if (soListar) {
        console.log(`  por aplicar  ${ficheiro}`)
        continue
      }
      const sql = readFileSync(path.join(PASTA, ficheiro), 'utf8')
      process.stdout.write(`  a aplicar    ${ficheiro} … `)
      await cliente.query('begin')
      try {
        await cliente.query(sql)
        await cliente.query('insert into app.migracoes (nome) values ($1)', [ficheiro])
        await cliente.query('commit')
        console.log('ok')
      } catch (erro) {
        await cliente.query('rollback')
        console.log('FALHOU')
        throw erro
      }
    }

    if (seed && !soListar) {
      process.stdout.write('  seed         supabase/seed.sql … ')
      await cliente.query(readFileSync(SEED, 'utf8'))
      console.log('ok')
    }
    if (demo && !soListar) {
      process.stdout.write('  demo         supabase/demo-erp.sql … ')
      await cliente.query(readFileSync(DEMO, 'utf8'))
      console.log('ok')
    }
  } finally {
    await cliente.end()
  }
}

principal().catch((erro) => {
  console.error('\n', erro instanceof Error ? erro.message : erro)
  process.exit(1)
})
