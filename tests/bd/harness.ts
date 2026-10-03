/**
 * Base de dados de teste em PGlite (Postgres em WASM, sem Docker).
 *
 * Aplica as migrações reais de `supabase/migrations` sobre um shim mínimo do
 * que o Supabase fornece de fábrica: o esquema `auth` com `auth.users` e
 * `auth.uid()`, e os papéis `anon`, `authenticated` e `service_role`.
 *
 * `auth.uid()` aqui faz exactamente o que faz no Supabase: lê o `sub` dos
 * claims JWT em `request.jwt.claims`. Assim as políticas RLS correm sem
 * alterações.
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { PGlite } from '@electric-sql/pglite'

const PASTA_MIGRACOES = path.resolve(__dirname, '../../supabase/migrations')
const PASTA_SEED = path.resolve(__dirname, '../../supabase/seed.sql')

/** Migrações que dependem de esquemas só existentes no Supabase. */
const IGNORAR_EM_PGLITE = ['0003_storage.sql', '0007_arquivos_storage.sql', '0020_ponto_storage.sql']

const SHIM_SUPABASE = `
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid
    language sql stable
    as $$ select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid $$;

  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;
`

export type Identidade = { tipo: 'anon' } | { tipo: 'servidor' } | { tipo: 'utilizador'; id: string }

export class BaseDeTeste {
  private constructor(readonly db: PGlite) {}

  static async criar(opcoes: { seed?: boolean } = {}): Promise<BaseDeTeste> {
    const db = new PGlite()
    await db.exec(SHIM_SUPABASE)

    const ficheiros = (await readdir(PASTA_MIGRACOES))
      .filter((f) => f.endsWith('.sql') && !IGNORAR_EM_PGLITE.includes(f))
      .sort()
    for (const ficheiro of ficheiros) {
      const sql = await readFile(path.join(PASTA_MIGRACOES, ficheiro), 'utf8')
      await db.exec(sql)
    }

    if (opcoes.seed) {
      await db.exec(await readFile(PASTA_SEED, 'utf8'))
    }

    return new BaseDeTeste(db)
  }

  /** Cria um utilizador em `auth.users` e devolve o id. */
  async criarUtilizador(email: string): Promise<string> {
    const r = await this.db.query<{ id: string }>(
      'insert into auth.users (id, email) values (gen_random_uuid(), $1) returning id',
      [email],
    )
    return r.rows[0]!.id
  }

  /**
   * Executa `fn` como a identidade indicada. Cada chamada corre numa transacção
   * própria com `set local role` e os claims JWT, e volta ao superuser no fim.
   */
  async como<T>(quem: Identidade, fn: (db: PGlite) => Promise<T>): Promise<T> {
    const papel = quem.tipo === 'anon' ? 'anon' : quem.tipo === 'servidor' ? 'service_role' : 'authenticated'
    const claims = quem.tipo === 'utilizador' ? JSON.stringify({ sub: quem.id, role: 'authenticated' }) : ''

    await this.db.exec(`set role ${papel}; select set_config('request.jwt.claims', '${claims}', false);`)
    try {
      return await fn(this.db)
    } finally {
      await this.db.exec(`reset role; select set_config('request.jwt.claims', '', false);`)
    }
  }

  /** Atalho: uma query simples como a identidade indicada. */
  async consultar<T = Record<string, unknown>>(
    quem: Identidade,
    sql: string,
    params?: unknown[],
  ): Promise<T[]> {
    return this.como(quem, async (db) => (await db.query<T>(sql, params)).rows)
  }

  async fechar() {
    await this.db.close()
  }
}
