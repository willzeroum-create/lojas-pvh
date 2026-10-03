/**
 * Módulo Clientes na base: o pedido cria o cliente pelo WhatsApp, duplicados
 * não se repetem, a anonimização apaga o pessoal e cada tenant só vê os seus.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenantA: string
let tenantB: string
let lojaA: string
let donoA: string
let donoB: string

async function criarTenant(slug: string) {
  const t = (
    await bd.db.query<{ id: string }>(
      `insert into public.tenants (slug, nome_fantasia, whatsapp, status) values ($1, $1, '5569999990000', 'ativo') returning id`,
      [slug],
    )
  ).rows[0]!.id
  const l = (await bd.db.query<{ id: string }>(`insert into public.lojas (tenant_id) values ($1) returning id`, [t])).rows[0]!.id
  return { t, l }
}

function pedido(tenant: string, loja: string, nome: string | null, telefone: string | null, total = 20) {
  return bd.consultar<{ id: string; cliente_id: string | null }>(
    { tipo: 'servidor' },
    'select id, cliente_id from public.criar_pedido($1::jsonb)',
    [
      JSON.stringify({
        tenant_id: tenant,
        loja_id: loja,
        cliente_nome: nome,
        cliente_telefone: telefone,
        tipo_entrega: 'retirada',
        subtotal: total,
        total,
        forma_pagamento: 'pix',
        itens: [{ nome: 'Item', quantidade: 1, preco_unitario: total, total }],
      }),
    ],
  )
}

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  ;({ t: tenantA, l: lojaA } = await criarTenant('tenant-a'))
  ;({ t: tenantB } = await criarTenant('tenant-b'))
  donoA = await bd.criarUtilizador('a@teste.local')
  donoB = await bd.criarUtilizador('b@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2), ($3, $4)`, [donoA, tenantA, donoB, tenantB])
})

afterAll(async () => {
  await bd.fechar()
})

describe('cliente criado pelo pedido', () => {
  it('o primeiro pedido cria o cliente com WhatsApp e DDI; o segundo reaproveita', async () => {
    const [p1] = await pedido(tenantA, lojaA, 'Joana', '69988887777')
    const [p2] = await pedido(tenantA, lojaA, 'Joana S.', '69988887777')
    expect(p1!.cliente_id).not.toBeNull()
    expect(p2!.cliente_id).toBe(p1!.cliente_id)
    const [pessoa] = await bd.consultar<{ nome: string; whatsapp: string; origem: string }>(
      { tipo: 'servidor' },
      'select nome, whatsapp, origem from public.pessoas where id = $1',
      [p1!.cliente_id],
    )
    expect(pessoa).toEqual({ nome: 'Joana', whatsapp: '5569988887777', origem: 'pedido' })
  })

  it('pedido sem telefone não cria cliente', async () => {
    const [p] = await pedido(tenantA, lojaA, 'Balcão', null)
    expect(p!.cliente_id).toBeNull()
  })
})

describe('regras do cadastro', () => {
  it('CPF ou CNPJ é único por tenant, mas pode repetir noutro tenant', async () => {
    await bd.consultar(
      { tipo: 'utilizador', id: donoA },
      `insert into public.pessoas (tenant_id, nome, documento) values ($1, 'Fulano', '52998224725')`,
      [tenantA],
    )
    await expect(
      bd.consultar(
        { tipo: 'utilizador', id: donoA },
        `insert into public.pessoas (tenant_id, nome, documento) values ($1, 'Outro', '52998224725')`,
        [tenantA],
      ),
    ).rejects.toThrow(/duplicate key/)
    await bd.consultar(
      { tipo: 'utilizador', id: donoB },
      `insert into public.pessoas (tenant_id, nome, documento) values ($1, 'Fulano', '52998224725')`,
      [tenantB],
    )
  })

  it('o tipo tem de bater com o tamanho do documento', async () => {
    await expect(
      bd.consultar(
        { tipo: 'servidor' },
        `insert into public.pessoas (tenant_id, tipo, nome, documento) values ($1, 'pj', 'X', '52998224725')`,
        [tenantA],
      ),
    ).rejects.toThrow(/check constraint/)
  })

  it('cada dono só vê as pessoas do próprio tenant', async () => {
    const deB = await bd.consultar<{ tenant_id: string }>({ tipo: 'utilizador', id: donoB }, 'select tenant_id from public.pessoas')
    expect(new Set(deB.map((l) => l.tenant_id))).toEqual(new Set([tenantB]))
    await expect(
      bd.consultar({ tipo: 'anon' }, 'select id from public.pessoas'),
    ).rejects.toThrow(/permission denied/)
  })
})

describe('anonimização (LGPD)', () => {
  it('apaga o pessoal da pessoa e dos pedidos, mantém os valores e liberta o WhatsApp', async () => {
    const [p] = await pedido(tenantA, lojaA, 'Carla', '69977776666', 55)
    await bd.consultar({ tipo: 'utilizador', id: donoA }, 'select public.anonimizar_pessoa($1, $2)', [tenantA, p!.cliente_id])

    const [pessoa] = await bd.consultar<{ nome: string; whatsapp: string | null; anonimizado_em: string | null }>(
      { tipo: 'servidor' },
      'select nome, whatsapp, anonimizado_em from public.pessoas where id = $1',
      [p!.cliente_id],
    )
    expect(pessoa!.whatsapp).toBeNull()
    expect(pessoa!.anonimizado_em).not.toBeNull()
    const [ped] = await bd.consultar<{ cliente_nome: string | null; total: string }>(
      { tipo: 'servidor' },
      'select cliente_nome, total from public.pedidos where id = $1',
      [p!.id],
    )
    expect(ped).toEqual({ cliente_nome: null, total: '55.00' })

    // O mesmo número volta a pedir: nasce um cliente novo.
    const [novo] = await pedido(tenantA, lojaA, 'Carla', '69977776666')
    expect(novo!.cliente_id).not.toBe(p!.cliente_id)
  })

  it('um dono não anonimiza pessoas de outro tenant', async () => {
    const [p] = await pedido(tenantA, lojaA, 'Davi', '69966665555')
    await bd.consultar({ tipo: 'utilizador', id: donoB }, 'select public.anonimizar_pessoa($1, $2)', [tenantA, p!.cliente_id])
    const [pessoa] = await bd.consultar<{ whatsapp: string | null }>(
      { tipo: 'servidor' },
      'select whatsapp from public.pessoas where id = $1',
      [p!.cliente_id],
    )
    expect(pessoa!.whatsapp).toBe('5569966665555')
  })
})
