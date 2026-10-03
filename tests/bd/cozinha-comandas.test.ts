/**
 * Cozinha e comandas na base: itens vão para a estação da categoria, o
 * preparo segue transições válidas, o pedido fica pronto sozinho, e a
 * comanda soma sozinha, protege o que já está na cozinha e fecha no caixa.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenant: string
let loja: string
let dono: string
let lanche: string
let bebida: string
let mesa1: string
let mesa2: string
const como = () => ({ tipo: 'utilizador' as const, id: dono })
const srv = { tipo: 'servidor' as const }

async function pedidoCardapio() {
  const [p] = await bd.consultar<{ id: string }>(srv, 'select id from public.criar_pedido($1::jsonb)', [
    JSON.stringify({
      tenant_id: tenant,
      loja_id: loja,
      tipo_entrega: 'retirada',
      subtotal: 35,
      total: 35,
      forma_pagamento: 'pix',
      itens: [
        { produto_id: lanche, nome: 'X-Salada', quantidade: 1, preco_unitario: 25, total: 25 },
        { produto_id: bebida, nome: 'Suco', quantidade: 1, preco_unitario: 10, total: 10 },
      ],
    }),
  ])
  return p!.id
}

const itens = (pedido: string) =>
  bd.consultar<{ id: string; nome: string; preparo: string | null; estacao: string | null }>(
    srv,
    `select i.id, i.nome, i.preparo, e.nome estacao from public.itens_pedido i left join public.estacoes e on e.id = i.estacao_id where i.pedido_id = $1 order by i.nome`,
    [pedido],
  )

const status = async (pedido: string) =>
  (await bd.consultar<{ status: string; subtotal: string; total: string }>(srv, 'select status, subtotal, total from public.pedidos where id = $1', [pedido]))[0]!

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  tenant = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('lanchonete', 'Lanchonete', '5569999990000') returning id`)).rows[0]!.id
  loja = (await bd.db.query<{ id: string }>(`insert into public.lojas (tenant_id) values ($1) returning id`, [tenant])).rows[0]!.id
  const catLanches = (await bd.db.query<{ id: string }>(`insert into public.categorias (tenant_id, nome) values ($1, 'Lanches') returning id`, [tenant])).rows[0]!.id
  const catBebidas = (await bd.db.query<{ id: string }>(`insert into public.categorias (tenant_id, nome) values ($1, 'Bebidas') returning id`, [tenant])).rows[0]!.id
  lanche = (await bd.db.query<{ id: string }>(`insert into public.produtos (tenant_id, categoria_id, nome, preco) values ($1, $2, 'X-Salada', 25) returning id`, [tenant, catLanches])).rows[0]!.id
  bebida = (await bd.db.query<{ id: string }>(`insert into public.produtos (tenant_id, categoria_id, nome, preco) values ($1, $2, 'Suco', 10) returning id`, [tenant, catBebidas])).rows[0]!.id
  dono = await bd.criarUtilizador('dono@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2)`, [dono, tenant])
  await bd.consultar(como(), 'select public.cozinha_padrao($1)', [tenant])
  const cozinha = (await bd.consultar<{ id: string }>(srv, `select id from public.estacoes where tenant_id = $1 and nome = 'Cozinha'`, [tenant]))[0]!.id
  await bd.consultar(como(), 'insert into public.estacao_categorias (tenant_id, categoria_id, estacao_id) values ($1, $2, $3)', [tenant, catLanches, cozinha])
  mesa1 = (await bd.consultar<{ id: string }>(como(), 'insert into public.mesas (tenant_id, loja_id, numero) values ($1, $2, 1) returning id', [tenant, loja]))[0]!.id
  mesa2 = (await bd.consultar<{ id: string }>(como(), 'insert into public.mesas (tenant_id, loja_id, numero) values ($1, $2, 2) returning id', [tenant, loja]))[0]!.id
})

afterAll(async () => {
  await bd.fechar()
})

describe('cozinha', () => {
  it('só os itens de categorias com estação passam pela cozinha', async () => {
    const pedido = await pedidoCardapio()
    expect(await itens(pedido)).toMatchObject([
      { nome: 'Suco', preparo: null, estacao: null },
      { nome: 'X-Salada', preparo: 'aguardando', estacao: 'Cozinha' },
    ])
  })

  it('aguardando → em preparo → pronto deixa o pedido pronto', async () => {
    const pedido = await pedidoCardapio()
    const item = (await itens(pedido)).find((i) => i.preparo)!
    await bd.consultar(como(), `update public.itens_pedido set preparo = 'em_preparo' where id = $1`, [item.id])
    expect((await status(pedido)).status).toBe('novo')
    await bd.consultar(como(), `update public.itens_pedido set preparo = 'pronto' where id = $1`, [item.id])
    expect((await status(pedido)).status).toBe('pronto')
    const [t] = await bd.consultar<{ iniciado: boolean; pronto: boolean }>(
      srv,
      'select preparo_iniciado_em is not null iniciado, pronto_em is not null pronto from public.itens_pedido where id = $1',
      [item.id],
    )
    expect(t).toEqual({ iniciado: true, pronto: true })
  })

  it('recusa transições inválidas e cancelamento sem motivo', async () => {
    const pedido = await pedidoCardapio()
    const item = (await itens(pedido)).find((i) => i.preparo)!
    await expect(bd.consultar(como(), `update public.itens_pedido set preparo = 'entregue' where id = $1`, [item.id])).rejects.toThrow(/não pode passar/)
    await expect(bd.consultar(como(), `update public.itens_pedido set preparo = 'cancelado' where id = $1`, [item.id])).rejects.toThrow(/motivo/)
    const suco = (await itens(pedido)).find((i) => !i.preparo)!
    await expect(bd.consultar(como(), `update public.itens_pedido set preparo = 'pronto' where id = $1`, [suco.id])).rejects.toThrow(/não passa pela cozinha/)
  })
})

describe('comandas', () => {
  async function abrir(mesa: string | null, identificador: string | null = null) {
    const [c] = await bd.consultar<{ id: string; pedido_id: string }>(
      como(),
      'select id, pedido_id from public.abrir_comanda($1, $2, $3, $4, 2, $5)',
      [tenant, loja, mesa, identificador, 'Rafa'],
    )
    return c!
  }
  const lancar = (pedido: string, produto: string, nome: string, preco: number, q = 1) =>
    bd.consultar<{ id: string }>(
      como(),
      'insert into public.itens_pedido (tenant_id, pedido_id, produto_id, nome, quantidade, preco_unitario, total) values ($1, $2, $3, $4, $5, $6, $7) returning id',
      [tenant, pedido, produto, nome, q, preco, preco * q],
    )

  it('abre na mesa, soma sozinha e não abre duas vezes a mesma mesa', async () => {
    const c = await abrir(mesa1)
    const [pedido] = await bd.consultar<{ canal: string; cliente_nome: string }>(srv, 'select canal, cliente_nome from public.pedidos where id = $1', [c.pedido_id])
    expect(pedido).toEqual({ canal: 'mesa', cliente_nome: 'Mesa 1' })
    await lancar(c.pedido_id, lanche, 'X-Salada', 25, 2)
    await lancar(c.pedido_id, bebida, 'Suco', 10)
    expect(await status(c.pedido_id)).toMatchObject({ subtotal: '60.00', total: '60.00', status: 'aceite' })
    await expect(abrir(mesa1)).rejects.toThrow(/duplicate key/)
  })

  it('item na cozinha não se apaga; fechar exige caixa e cozinha concluída', async () => {
    const c = await abrir(mesa2)
    const [item] = await lancar(c.pedido_id, lanche, 'X-Salada', 25)
    await bd.consultar(como(), `update public.itens_pedido set preparo = 'em_preparo' where id = $1`, [item!.id])
    await expect(bd.consultar(como(), 'delete from public.itens_pedido where id = $1', [item!.id])).rejects.toThrow(/cancele com motivo/)

    const fechar = (pagamentos: unknown[], taxa = 0) =>
      bd.consultar<{ status: string; total: string }>(como(), 'select status, total from public.fechar_comanda($1::jsonb)', [
        JSON.stringify({ tenant_id: tenant, comanda_id: c.id, taxa_servico: taxa, pagamentos, autor_nome: 'Rafa' }),
      ])
    await expect(fechar([{ forma: 'pix', valor: 25 }])).rejects.toThrow(/abra o caixa/)
    await bd.consultar(como(), `insert into public.caixa_sessoes (tenant_id, loja_id, operador_nome) values ($1, $2, 'Ana')`, [tenant, loja])
    await expect(fechar([{ forma: 'pix', valor: 25 }])).rejects.toThrow(/ainda na cozinha/)
    await bd.consultar(como(), `update public.itens_pedido set preparo = 'pronto' where id = $1`, [item!.id])
    await expect(fechar([{ forma: 'pix', valor: 25 }], 2.5)).rejects.toThrow(/não fecham/)
    const [fechado] = await fechar(
      [
        { forma: 'pix', valor: 13.75 },
        { forma: 'dinheiro', valor: 20, troco: 6.25 },
      ],
      2.5,
    )
    expect(fechado).toEqual({ status: 'concluido', total: '27.50' })
    await expect(lancar(c.pedido_id, bebida, 'Suco', 10)).rejects.toThrow(/já foi fechada/)
    const [entregue] = await bd.consultar<{ preparo: string }>(srv, 'select preparo from public.itens_pedido where id = $1', [item!.id])
    expect(entregue!.preparo).toBe('entregue')
  })

  it('juntar mesas passa os itens e cancela a comanda de origem', async () => {
    const a = await abrir(null, 'A1')
    const b = await abrir(null, 'B2')
    await lancar(a.pedido_id, bebida, 'Suco', 10)
    await lancar(b.pedido_id, bebida, 'Suco', 10, 3)
    await bd.consultar(como(), 'select public.juntar_comandas($1, $2, $3)', [tenant, a.id, b.id])
    expect((await status(a.pedido_id)).total).toBe('40.00')
    const [cb] = await bd.consultar<{ estado: string }>(srv, 'select estado from public.comandas where id = $1', [b.id])
    expect(cb!.estado).toBe('cancelada')
  })
})
