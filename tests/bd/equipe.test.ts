/** Equipe na base: o hash do PIN não se lê pela API do browser e cada loja só vê a sua equipe. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenantA: string
let tenantB: string
let donoA: string
let donoB: string

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  const novo = async (slug: string) =>
    (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ($1, $1, '5569999990000') returning id`, [slug])).rows[0]!.id
  tenantA = await novo('loja-a')
  tenantB = await novo('loja-b')
  donoA = await bd.criarUtilizador('a@teste.local')
  donoB = await bd.criarUtilizador('b@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2), ($3, $4)`, [donoA, tenantA, donoB, tenantB])
  await bd.consultar(
    { tipo: 'utilizador', id: donoA },
    `insert into public.equipe_membros (tenant_id, nome, papel, pin_hash) values ($1, 'Ana', 'gerente', 'scrypt$sal$hash')`,
    [tenantA],
  )
})

afterAll(async () => {
  await bd.fechar()
})

describe('equipe', () => {
  it('o dono lê a equipe mas não o hash do PIN', async () => {
    const linhas = await bd.consultar<{ nome: string }>({ tipo: 'utilizador', id: donoA }, 'select nome, papel from public.equipe_membros')
    expect(linhas).toEqual([{ nome: 'Ana', papel: 'gerente' }])
    await expect(bd.consultar({ tipo: 'utilizador', id: donoA }, 'select pin_hash from public.equipe_membros')).rejects.toThrow(/permission denied/)
  })

  it('o PIN só se guarda como hash scrypt', async () => {
    await expect(
      bd.consultar({ tipo: 'utilizador', id: donoA }, `insert into public.equipe_membros (tenant_id, nome, papel, pin_hash) values ($1, 'Bia', 'caixa', '4821')`, [tenantA]),
    ).rejects.toThrow(/check constraint/)
  })

  it('outra loja não vê esta equipe nem a auditoria', async () => {
    await bd.consultar({ tipo: 'utilizador', id: donoA }, `insert into public.auditoria (tenant_id, quem, acao, descricao) values ($1, 'Ana', 'entrada', 'Ana começou a operar')`, [tenantA])
    expect(await bd.consultar({ tipo: 'utilizador', id: donoB }, 'select id from public.equipe_membros')).toHaveLength(0)
    expect(await bd.consultar({ tipo: 'utilizador', id: donoB }, 'select id from public.auditoria')).toHaveLength(0)
    await expect(
      bd.consultar({ tipo: 'utilizador', id: donoA }, 'delete from public.auditoria'),
    ).rejects.toThrow(/permission denied/)
  })
})
