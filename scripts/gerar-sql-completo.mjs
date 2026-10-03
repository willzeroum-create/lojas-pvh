/**
 * Junta `supabase/migrations/*.sql` em ficheiros para colar no SQL Editor do
 * Supabase, com o registo em `app.migracoes` que `pnpm migrar` também usa.
 * Correr sempre que houver uma migração nova:
 *
 *   pnpm sql:completo
 *
 * Gera dois ficheiros:
 *   supabase/instalacao-completa.sql   só instala (projecto vazio)
 *   supabase/reinstalar-do-zero.sql    apaga tudo o que é da plataforma e
 *                                      instala de novo (projecto sem dados
 *                                      reais, ou instalação a meio)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const pasta = 'supabase/migrations'
const ficheiros = readdirSync(pasta)
  .filter((f) => f.endsWith('.sql'))
  .sort()
const hoje = new Date().toISOString().slice(0, 10)

const LIMPEZA = '\n' + readFileSync('supabase/limpeza.sql', 'utf8')

function gerar({ limpar }) {
  let saida = `-- =============================================================================
-- ${limpar ? 'REINSTALAÇÃO DO ZERO' : 'INSTALAÇÃO COMPLETA'} — gerado em ${hoje} por scripts/gerar-sql-completo.mjs
--
-- Como usar: Supabase Dashboard → SQL Editor → New query → colar tudo → Run.
-- Corre numa transacção só: ou aplica tudo, ou nada.
${
  limpar
    ? `--
-- ATENÇÃO: apaga todas as tabelas da plataforma antes de instalar. Usar só num
-- projecto novo ou numa instalação que ficou a meio. Nunca com dados reais.`
    : ''
}
--
-- Depois, opcionalmente, correr supabase/seed.sql para ter um tenant de
-- demonstração (Lanchonete da Praça).
--
-- Ficheiros incluídos, por ordem:
${ficheiros.map((f) => `--   ${f}`).join('\n')}
-- =============================================================================

begin;
${limpar ? LIMPEZA : ''}
-- Registo do que foi aplicado (o mesmo que \`pnpm migrar\` usa).
create schema if not exists app;
create table if not exists app.migracoes (
  nome text primary key,
  aplicada_em timestamptz not null default now()
);
`
  for (const f of ficheiros) {
    const sql = readFileSync(path.join(pasta, f), 'utf8').trim()
    saida += `

-- #############################################################################
-- ${f}
-- #############################################################################

${sql}

insert into app.migracoes (nome) values ('${f}') on conflict (nome) do nothing;
`
  }
  return saida + '\ncommit;\n'
}

for (const [destino, limpar] of [
  ['supabase/instalacao-completa.sql', false],
  ['supabase/reinstalar-do-zero.sql', true],
]) {
  const conteudo = gerar({ limpar })
  writeFileSync(destino, conteudo)
  console.log(`${destino}: ${ficheiros.length} migrações, ${conteudo.split('\n').length} linhas`)
}
