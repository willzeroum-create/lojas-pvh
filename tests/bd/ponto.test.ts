/**
 * Ponto: a base garante a ordem das batidas do relógio, ignora o toque duplo,
 * não deixa o painel gravar nem alterar batidas (só anular, uma vez) e isola
 * os tenants.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenant: string
let outro: string
let membro: string
let dono: string
let intruso: string
const srv = { tipo: 'servidor' as const }

const bater = (tipo: string, momento: string, origem = 'relogio', motivo: string | null = null) =>
  bd.consultar<{ id: string }>(
    srv,
    `insert into public.ponto_batidas (tenant_id, membro_id, tipo, momento, origem, motivo) values ($1, $2, $3, $4, $5, $6) returning id`,
    [tenant, membro, tipo, momento, origem, motivo],
  )

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  tenant = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('lanche', 'Lanche', '5569999990000') returning id`)).rows[0]!.id
  outro = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('outro', 'Outro', '5569999990001') returning id`)).rows[0]!.id
  membro = (await bd.db.query<{ id: string }>(`insert into public.equipe_membros (tenant_id, nome, papel, pin_hash) values ($1, 'Ana', 'caixa', 'scrypt$a$b') returning id`, [tenant])).rows[0]!.id
  dono = await bd.criarUtilizador('dono@teste.local')
  intruso = await bd.criarUtilizador('intruso@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2), ($3, $4)`, [dono, tenant, intruso, outro])
})

afterAll(async () => {
  await bd.fechar()
})

describe('ponto', () => {
  it('jornada na ordem certa passa; fora de ordem e toque duplo não', async () => {
    await expect(bater('saida', '2026-10-01T12:00:00Z')).rejects.toThrow(/fora de ordem/)
    await bater('entrada', '2026-10-01T12:00:00Z')
    await expect(bater('saida', '2026-10-01T12:00:30Z')).rejects.toThrow(/repetida/)
    await expect(bater('volta_intervalo', '2026-10-01T15:00:00Z')).rejects.toThrow(/fora de ordem/)
    await bater('saida_intervalo', '2026-10-01T16:00:00Z')
    await bater('volta_intervalo', '2026-10-01T17:00:00Z')
    await bater('saida', '2026-10-01T21:00:00Z')
    // Batida manual (esquecida) não passa pela ordem, mas exige motivo.
    await expect(bater('entrada', '2026-10-01T11:00:00Z', 'manual')).rejects.toThrow()
    await bater('entrada', '2026-09-30T12:00:00Z', 'manual', 'Esqueceu de bater')
  })

  it('o painel lê, mas não grava nem altera; anula só uma vez', async () => {
    const como = { tipo: 'utilizador' as const, id: dono }
    expect((await bd.consultar(como, 'select id from public.ponto_batidas')).length).toBe(5)
    await expect(
      bd.consultar(como, `insert into public.ponto_batidas (tenant_id, membro_id, tipo) values ($1, $2, 'entrada')`, [tenant, membro]),
    ).rejects.toThrow()
    const [b] = await bd.consultar<{ id: string }>(srv, `select id from public.ponto_batidas where origem = 'manual'`)
    await expect(bd.consultar(srv, `update public.ponto_batidas set momento = now() where id = $1`, [b!.id])).rejects.toThrow(/não se altera/)
    await bd.consultar(srv, `update public.ponto_batidas set anulada_em = now(), anulada_por = 'Gerente', anulada_motivo = 'Lançada em duplicado' where id = $1`, [b!.id])
    await expect(
      bd.consultar(srv, `update public.ponto_batidas set anulada_motivo = 'Outro motivo qualquer' where id = $1`, [b!.id]),
    ).rejects.toThrow(/não se altera/)
    await expect(bd.consultar(srv, `delete from public.ponto_batidas where id = $1`, [b!.id])).rejects.toThrow(/permission denied/)
  })

  it('outro tenant não vê as batidas', async () => {
    expect(await bd.consultar({ tipo: 'utilizador', id: intruso }, 'select id from public.ponto_batidas')).toEqual([])
  })
})
