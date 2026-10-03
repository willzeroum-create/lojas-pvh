/**
 * Delivery: entrega criada sozinha para pedido de entrega (só com o módulo
 * ligado), despacho e conclusão com o pedido concluído, transições válidas,
 * acerto, token do entregador escondido, zonas públicas e isolamento.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenant: string
let loja: string
let dono: string
let intruso: string
let motoboy: string
const como = (id: string) => ({ tipo: 'utilizador' as const, id })
const srv = { tipo: 'servidor' as const }

async function pedido(tipo: 'entrega' | 'retirada') {
  const [p] = await bd.consultar<{ id: string }>(
    srv,
    `insert into public.pedidos (tenant_id, loja_id, canal, cliente_nome, tipo_entrega, subtotal, taxa_entrega, total, forma_pagamento)
     values ($1, $2, 'cardapio', 'Maria', $3, 30, 5, 35, 'pix') returning id`,
    [tenant, loja, tipo],
  )
  return p!.id
}
const entregaDe = async (pedidoId: string) =>
  (await bd.consultar<{ id: string; estado: string; codigo: string }>(srv, 'select id, estado, codigo from public.entregas where pedido_id = $1', [pedidoId]))[0]

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  tenant = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('pizza', 'Pizza', '5569999990000') returning id`)).rows[0]!.id
  const outro = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('outro', 'Outro', '5569999990001') returning id`)).rows[0]!.id
  loja = (await bd.db.query<{ id: string }>(`insert into public.lojas (tenant_id) values ($1) returning id`, [tenant])).rows[0]!.id
  dono = await bd.criarUtilizador('dono@teste.local')
  intruso = await bd.criarUtilizador('intruso@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2), ($3, $4)`, [dono, tenant, intruso, outro])
  motoboy = (await bd.db.query<{ id: string }>(`insert into public.entregadores (tenant_id, nome, repasse) values ($1, 'João', 6) returning id`, [tenant])).rows[0]!.id
})

afterAll(async () => {
  await bd.fechar()
})

describe('delivery', () => {
  it('sem o módulo não cria entrega; com ele, só para pedido de entrega', async () => {
    expect(await entregaDe(await pedido('entrega'))).toBeUndefined()
    await bd.db.query(`insert into public.tenant_modulos (tenant_id, modulo) values ($1, 'delivery')`, [tenant])
    expect(await entregaDe(await pedido('retirada'))).toBeUndefined()
    const e = await entregaDe(await pedido('entrega'))
    expect(e).toMatchObject({ estado: 'aguardando' })
    expect(e!.codigo).toMatch(/^[0-9a-f]{16}$/)
  })

  it('despachar e entregar conclui o pedido; transições inválidas falham', async () => {
    const p = await pedido('entrega')
    const e = (await entregaDe(p))!
    await expect(bd.consultar(como(dono), `update public.entregas set estado = 'entregue' where id = $1`, [e.id])).rejects.toThrow(/não pode passar/)
    await expect(bd.consultar(como(dono), 'select public.concluir_entrega($1, $2, false, $3)', [tenant, e.id, ' '])).rejects.toThrow(/diga o que aconteceu/)
    await bd.consultar(como(dono), 'select public.despachar_entrega($1, $2, $3)', [tenant, e.id, motoboy])
    await bd.consultar(como(dono), 'select public.concluir_entrega($1, $2, true, null)', [tenant, e.id])
    const [r] = await bd.consultar<{ estado: string; repasse: string; status: string }>(
      srv,
      'select e.estado, e.repasse::text, p.status from public.entregas e join public.pedidos p on p.id = e.pedido_id where e.id = $1',
      [e.id],
    )
    expect(r).toEqual({ estado: 'entregue', repasse: '6.00', status: 'concluido' })
    await expect(bd.consultar(como(dono), `update public.entregas set estado = 'em_rota' where id = $1`, [e.id])).rejects.toThrow(/não pode passar/)
  })

  it('pedido cancelado não sai para entrega', async () => {
    const p = await pedido('entrega')
    await bd.consultar(srv, `update public.pedidos set status = 'cancelado' where id = $1`, [p])
    await expect(bd.consultar(como(dono), 'select public.despachar_entrega($1, $2, $3)', [tenant, (await entregaDe(p))!.id, motoboy])).rejects.toThrow(/cancelado/)
  })

  it('acerto fecha o devido uma vez e trava o repasse', async () => {
    const [a] = await bd.consultar<{ r: { quantidade: number; valor: number } }>(como(dono), 'select public.acertar_entregador($1, $2) r', [tenant, motoboy])
    expect(a!.r).toEqual({ quantidade: 1, valor: 6 })
    const [b] = await bd.consultar<{ r: { quantidade: number } }>(como(dono), 'select public.acertar_entregador($1, $2) r', [tenant, motoboy])
    expect(b!.r.quantidade).toBe(0)
    await expect(bd.consultar(como(dono), `update public.entregas set repasse = 0 where acertado_em is not null`)).rejects.toThrow(/já acertada/)
  })

  it('o painel não lê o token do entregador; o público lê só zonas activas; outro tenant não vê nada', async () => {
    await expect(bd.consultar(como(dono), 'select token_acesso from public.entregadores')).rejects.toThrow(/permission denied/)
    expect((await bd.consultar(como(dono), 'select id, nome from public.entregadores')).length).toBe(1)
    await bd.consultar(como(dono), `insert into public.delivery_zonas (tenant_id, nome, chave, taxa) values ($1, 'Centro', 'centro', 5), ($1, 'Embratel', 'embratel', 8)`, [tenant])
    await bd.consultar(como(dono), `update public.delivery_zonas set ativo = false where chave = 'embratel'`)
    const publicas = await bd.consultar<{ nome: string }>({ tipo: 'anon' }, 'select nome from public.delivery_zonas')
    expect(publicas.map((z) => z.nome)).toEqual(['Centro'])
    expect(await bd.consultar(como(intruso), 'select id from public.entregas')).toEqual([])
    expect(await bd.consultar(como(intruso), 'select id from public.entregadores')).toEqual([])
  })
})
