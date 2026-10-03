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

describe('integrações', () => {
  it('o dono lê o estado mas não altera; os segredos são inacessíveis', async () => {
    await bd.db.query(`insert into public.integracoes (tenant_id, dominio, provedor) values ($1, 'fiscal', 'focus')`, [tenantA])
    await bd.db.query(`insert into public.integracoes_segredos (tenant_id, dominio, nome, valor_cifrado) values ($1, 'fiscal', 'token_homologacao', 'v1:a:b:c')`, [tenantA])
    const [i] = await bd.consultar<{ estado: string }>({ tipo: 'utilizador', id: donoA }, 'select estado from public.integracoes')
    expect(i!.estado).toBe('aguardando_credenciais')
    await bd.consultar({ tipo: 'utilizador', id: donoA }, `update public.integracoes set estado = 'em_producao' where tenant_id = $1`, [tenantA])
    const [depois] = await bd.consultar<{ estado: string }>({ tipo: 'servidor' }, 'select estado from public.integracoes where tenant_id = $1', [tenantA])
    expect(depois!.estado).toBe('aguardando_credenciais')
    await expect(bd.consultar({ tipo: 'utilizador', id: donoA }, 'select * from public.integracoes_segredos')).rejects.toThrow(/permission denied/)
    expect(await bd.consultar({ tipo: 'utilizador', id: donoB }, 'select * from public.integracoes')).toHaveLength(0)
  })

  it('uma só nota por venda e a ref não se repete', async () => {
    await bd.db.query(
      `insert into public.documentos_fiscais (tenant_id, tipo, ref, provedor, ambiente) values ($1, 'nfce', 'pedido-x', 'focus', 'homologacao')`,
      [tenantA],
    )
    await expect(
      bd.db.query(`insert into public.documentos_fiscais (tenant_id, tipo, ref, provedor, ambiente) values ($1, 'nfce', 'pedido-x', 'focus', 'homologacao')`, [tenantA]),
    ).rejects.toThrow(/duplicate key/)
  })
})

describe('cobranças Pix', () => {
  it('o painel cria e cancela, mas não marca como pago', async () => {
    const [c] = await bd.consultar<{ id: string }>(
      { tipo: 'utilizador', id: donoA },
      `insert into public.cobrancas_pix (tenant_id, txid, provedor, valor, descricao, origem) values ($1, 'abcdefabcdefabcdefabcdefabcdef12', 'mercadopago', 10, 'Teste', 'manual') returning id`,
      [tenantA],
    )
    await expect(
      bd.consultar({ tipo: 'utilizador', id: donoA }, `update public.cobrancas_pix set estado = 'pago' where id = $1`, [c!.id]),
    ).rejects.toThrow(/só se cancela/)
    await bd.consultar({ tipo: 'utilizador', id: donoA }, `update public.cobrancas_pix set estado = 'cancelado' where id = $1`, [c!.id])
    await bd.consultar({ tipo: 'servidor' }, `update public.cobrancas_pix set estado = 'pago' where id = $1`, [c!.id])
  })
})
