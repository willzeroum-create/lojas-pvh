/**
 * Cashback: crédito ao concluir, resgate na mesma transacção da venda (com
 * saldo, mínimo e limite conferidos pela base), estorno e devolução ao
 * cancelar, livro imutável e isolamento entre tenants.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenant: string
let loja: string
let dono: string
let intruso: string
let produto: string
let cliente: string
const como = (id: string) => ({ tipo: 'utilizador' as const, id })
const srv = { tipo: 'servidor' as const }

function vender(total: number, opcoes: { cashback?: number; desconto?: number; cliente?: string | null } = {}) {
  const cashback = opcoes.cashback ?? 0
  const desconto = opcoes.desconto ?? cashback
  const subtotal = total + desconto
  return bd.consultar<{ id: string; total: string }>(como(dono), 'select id, total::text from public.registar_venda_com_cashback($1::jsonb)', [
    JSON.stringify({
      tenant_id: tenant,
      loja_id: loja,
      cliente_id: opcoes.cliente === undefined ? cliente : opcoes.cliente,
      subtotal,
      desconto,
      total,
      cashback,
      autor: 'Caixa 1',
      itens: [{ produto_id: produto, nome: 'Lanche', quantidade: 1, preco_unitario: subtotal, total: subtotal }],
      pagamentos: [{ forma: 'dinheiro', valor: total }],
    }),
  ])
}

const saldo = async () =>
  Number((await bd.consultar<{ s: string }>(como(dono), 'select public.saldo_cashback($1, $2)::text s', [tenant, cliente]))[0]!.s)

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  tenant = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('acai', 'Açaí', '5569999990000') returning id`)).rows[0]!.id
  const outro = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('outro', 'Outro', '5569999990001') returning id`)).rows[0]!.id
  loja = (await bd.db.query<{ id: string }>(`insert into public.lojas (tenant_id) values ($1) returning id`, [tenant])).rows[0]!.id
  const cat = (await bd.db.query<{ id: string }>(`insert into public.categorias (tenant_id, nome) values ($1, 'Açaí') returning id`, [tenant])).rows[0]!.id
  produto = (await bd.db.query<{ id: string }>(`insert into public.produtos (tenant_id, categoria_id, nome, preco) values ($1, $2, 'Açaí 500', 20) returning id`, [tenant, cat])).rows[0]!.id
  cliente = (await bd.db.query<{ id: string }>(`insert into public.pessoas (tenant_id, nome, whatsapp) values ($1, 'Maria', '5569988887777') returning id`, [tenant])).rows[0]!.id
  dono = await bd.criarUtilizador('dono@teste.local')
  intruso = await bd.criarUtilizador('intruso@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2), ($3, $4)`, [dono, tenant, intruso, outro])
  await bd.db.query(`insert into public.tenant_modulos (tenant_id, modulo) values ($1, 'fidelidade')`, [tenant])
  await bd.db.query(`insert into public.caixa_sessoes (tenant_id, loja_id, operador_nome, fundo_troco) values ($1, $2, 'Ana', 100)`, [tenant, loja])
})

afterAll(async () => {
  await bd.fechar()
})

describe('cashback', () => {
  it('sem programa ligado não há crédito nem resgate', async () => {
    await vender(100)
    expect(await saldo()).toBe(0)
    await expect(vender(90, { cashback: 10 })).rejects.toThrow(/não está ligado/)
  })

  it('compra concluída de cliente identificado gera crédito', async () => {
    await bd.consultar(como(dono), `insert into public.fidelidade_config (tenant_id, ativo, percentual, resgate_minimo, limite_resgate_pct) values ($1, true, 10, 5, 50)`, [tenant])
    await vender(100)
    await vender(80, { cliente: null }) // sem cliente: nada
    expect(await saldo()).toBe(10)
  })

  it('resgate na venda: saldo, limite e o crédito da própria compra não conta', async () => {
    await expect(vender(5, { cashback: 10 })).rejects.toThrow(/limite/) // 10 > 50 % de 15
    await expect(vender(90, { cashback: 12 })).rejects.toThrow(/maior que o saldo/)
    await expect(vender(90, { cashback: 10, desconto: 5 })).rejects.toThrow(/entra no desconto/)
    // A venda falhada não deixou rasto.
    const [n] = await bd.consultar<{ n: number }>(srv, `select count(*)::int n from public.pedidos where tenant_id = $1`, [tenant])
    expect(n!.n).toBe(3)
    const [v] = await vender(30, { cashback: 10 }) // compra de 40, paga 30 + 10 de cashback
    expect(v!.total).toBe('30.00')
    expect(await saldo()).toBe(3) // 10 − 10 + 10 % de 30
    await expect(vender(10, { cashback: 3 })).rejects.toThrow(/abaixo do mínimo/)
  })

  it('cancelar a venda estorna o crédito e devolve o cashback usado', async () => {
    const [p] = await bd.consultar<{ id: string }>(srv, `select pedido_id id from public.fidelidade_movimentos where tipo = 'resgate'`)
    await bd.consultar(como(dono), 'select public.cancelar_venda_balcao($1, $2, $3, $4)', [tenant, p!.id, 'cliente desistiu', 'Ana'])
    expect(await saldo()).toBe(10) // 3 − 3 (estorno) + 10 (devolução)
    const tipos = await bd.consultar<{ tipo: string }>(srv, `select tipo from public.fidelidade_movimentos where pedido_id = $1 order by tipo`, [p!.id])
    expect(tipos.map((t) => t.tipo)).toEqual(['credito', 'devolucao', 'estorno', 'resgate'])
  })

  it('o livro não se altera; o painel não lança crédito; outro tenant não vê', async () => {
    await expect(
      bd.consultar(como(dono), `insert into public.fidelidade_movimentos (tenant_id, pessoa_id, tipo, valor, expira_em) values ($1, $2, 'credito', 100, '2030-01-01')`, [tenant, cliente]),
    ).rejects.toThrow()
    await expect(bd.consultar(srv, `update public.fidelidade_movimentos set valor = 999`)).rejects.toThrow(/permission denied/)
    await expect(bd.consultar(srv, `delete from public.fidelidade_movimentos`)).rejects.toThrow(/permission denied/)
    await expect(
      bd.consultar(como(intruso), `select app.lancar_resgate_cashback($1, $2, 1, null, 100, 'x')`, [tenant, cliente]),
    ).rejects.toThrow(/sem acesso/)
    expect(await bd.consultar(como(intruso), 'select id from public.fidelidade_movimentos')).toEqual([])
  })
})

describe('cashback com o módulo desligado', () => {
  it('não credita nem deixa resgatar, mesmo com a configuração ligada', async () => {
    const antes = await saldo()
    await bd.consultar(srv, `update public.tenant_modulos set ativo = false where tenant_id = $1 and modulo = 'fidelidade'`, [tenant])
    await vender(100)
    expect(await saldo()).toBe(antes)
    await expect(vender(90, { cashback: 5 })).rejects.toThrow(/não está ligado/)
  })
})
