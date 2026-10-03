/**
 * Estoque na base: saldo e custo médio só por movimentos, estorno em vez de
 * apagar, entrada de nota com vínculo lembrado, baixa automática pela venda
 * (produto e ficha técnica) e inventário que gera ajustes.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenant: string
let loja: string
let dono: string
let produto: string
let insumo: string
const como = () => ({ tipo: 'utilizador' as const, id: dono })
const srv = { tipo: 'servidor' as const }

const saldoProduto = async () =>
  (await bd.consultar<{ e: string; c: string }>(srv, 'select estoque_atual::text e, custo_medio::text c from public.produtos where id = $1', [produto]))[0]!
const saldoInsumo = async () =>
  (await bd.consultar<{ q: string; c: string }>(srv, 'select quantidade_atual::text q, custo_unitario::text c from public.insumos where id = $1', [insumo]))[0]!

function entradaManual(itens: Array<{ produto_id?: string; insumo_id?: string; quantidade: number; total: number; codigo?: string; fator?: number }>, documento?: string) {
  return bd.como(como(), async (db) => {
    const e = (
      await db.query<{ id: string }>(
        `insert into public.estoque_entradas (tenant_id, fornecedor_documento, numero_nota) values ($1, $2, '123') returning id`,
        [tenant, documento ?? null],
      )
    ).rows[0]!.id
    for (const i of itens) {
      await db.query(
        `insert into public.estoque_entrada_itens (tenant_id, entrada_id, produto_id, insumo_id, descricao, codigo_fornecedor, quantidade_nota, fator, valor_total)
         values ($1, $2, $3, $4, 'Item', $5, $6, $7, $8)`,
        [tenant, e, i.produto_id ?? null, i.insumo_id ?? null, i.codigo ?? null, i.quantidade, i.fator ?? 1, i.total],
      )
    }
    return e
  })
}

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  tenant = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('acougue', 'Açougue', '5569999990000') returning id`)).rows[0]!.id
  loja = (await bd.db.query<{ id: string }>(`insert into public.lojas (tenant_id) values ($1) returning id`, [tenant])).rows[0]!.id
  const cat = (await bd.db.query<{ id: string }>(`insert into public.categorias (tenant_id, nome) values ($1, 'Lanches') returning id`, [tenant])).rows[0]!.id
  produto = (await bd.db.query<{ id: string }>(`insert into public.produtos (tenant_id, categoria_id, nome, preco, controla_estoque) values ($1, $2, 'Refri lata', 6, true) returning id`, [tenant, cat])).rows[0]!.id
  const lanche = (await bd.db.query<{ id: string }>(`insert into public.produtos (tenant_id, categoria_id, nome, preco) values ($1, $2, 'X-Burger', 20) returning id`, [tenant, cat])).rows[0]!.id
  insumo = (await bd.db.query<{ id: string }>(`insert into public.insumos (tenant_id, nome, unidade) values ($1, 'Carne moída', 'kg') returning id`, [tenant])).rows[0]!.id
  await bd.db.query(`insert into public.fichas (tenant_id, produto_id, insumo_id, quantidade) values ($1, $2, $3, 0.150)`, [tenant, lanche, insumo])
  dono = await bd.criarUtilizador('dono@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2)`, [dono, tenant])
  await bd.db.query(`insert into public.tenant_modulos (tenant_id, modulo) values ($1, 'estoque')`, [tenant])
})

afterAll(async () => {
  await bd.fechar()
})

describe('entrada e custo médio', () => {
  it('concluir a entrada dá saldo e custo; a segunda entrada faz a média ponderada', async () => {
    const e1 = await entradaManual([{ produto_id: produto, quantidade: 2, fator: 12, total: 72, codigo: 'LATA350' }], '11222333000181')
    await bd.consultar(como(), 'select public.concluir_entrada_estoque($1, $2, $3)', [tenant, e1, 'Ana'])
    expect(await saldoProduto()).toEqual({ e: '24.000', c: '3.0000' }) // 2 caixas × 12 = 24 latas a R$ 3
    const e2 = await entradaManual([{ produto_id: produto, quantidade: 12, total: 48 }])
    await bd.consultar(como(), 'select public.concluir_entrada_estoque($1, $2, $3)', [tenant, e2, 'Ana'])
    expect(await saldoProduto()).toEqual({ e: '36.000', c: '3.3333' }) // (24×3 + 12×4) / 36
    const [v] = await bd.consultar<{ fator: string }>(srv, `select fator::text from public.estoque_vinculos where codigo_fornecedor = 'LATA350'`)
    expect(v!.fator).toBe('12.0000')
  })

  it('não conclui com item sem ligação nem duas vezes', async () => {
    const e = await entradaManual([{ quantidade: 1, total: 10 }])
    await expect(bd.consultar(como(), 'select public.concluir_entrada_estoque($1, $2, $3)', [tenant, e, 'Ana'])).rejects.toThrow(/ligue todos/)
    const ok = await entradaManual([{ insumo_id: insumo, quantidade: 5, total: 150 }])
    await bd.consultar(como(), 'select public.concluir_entrada_estoque($1, $2, $3)', [tenant, ok, 'Ana'])
    await expect(bd.consultar(como(), 'select public.concluir_entrada_estoque($1, $2, $3)', [tenant, ok, 'Ana'])).rejects.toThrow(/já foi concluida/)
    expect(await saldoInsumo()).toEqual({ q: '5.000', c: '30.0000' })
  })

  it('saldo e custo não se escrevem à mão', async () => {
    await expect(bd.consultar(como(), 'update public.produtos set estoque_atual = 999 where id = $1', [produto])).rejects.toThrow(/permission denied/)
    await bd.consultar(como(), `update public.produtos set nome = 'Refri lata 350' where id = $1`, [produto])
  })
})

describe('baixa automática pela venda', () => {
  it('a venda de balcão concluída baixa o produto e os insumos da ficha', async () => {
    await bd.consultar(como(), `insert into public.caixa_sessoes (tenant_id, loja_id, operador_nome) values ($1, $2, 'Ana')`, [tenant, loja])
    const lanche = (await bd.consultar<{ id: string }>(srv, `select id from public.produtos where nome = 'X-Burger'`))[0]!.id
    const [p] = await bd.consultar<{ id: string }>(como(), 'select id from public.registar_venda_balcao($1::jsonb)', [
      JSON.stringify({
        tenant_id: tenant,
        loja_id: loja,
        subtotal: 52,
        total: 52,
        itens: [
          { produto_id: produto, nome: 'Refri', quantidade: 2, preco_unitario: 6, total: 12 },
          { produto_id: lanche, nome: 'X-Burger', quantidade: 2, preco_unitario: 20, total: 40 },
        ],
        pagamentos: [{ forma: 'pix', valor: 52 }],
      }),
    ])
    expect((await saldoProduto()).e).toBe('34.000')
    expect((await saldoInsumo()).q).toBe('4.700') // 5 − 2 × 0,150
    // Cancelar a venda devolve ao estoque.
    await bd.consultar(como(), 'select public.cancelar_venda_balcao($1, $2, $3, $4)', [tenant, p!.id, 'teste', 'Ana'])
    expect((await saldoProduto()).e).toBe('36.000')
    expect((await saldoInsumo()).q).toBe('5.000')
  })
})

describe('estorno e inventário', () => {
  it('estorno desfaz uma saída e não se estorna duas vezes', async () => {
    const [m] = await bd.consultar<{ id: string }>(
      como(),
      `insert into public.estoque_movimentos (tenant_id, produto_id, tipo, motivo, quantidade, saldo_antes, saldo_depois) values ($1, $2, 'saida', 'Perda', -3, 0, 0) returning id`,
      [tenant, produto],
    )
    expect((await saldoProduto()).e).toBe('33.000')
    await bd.consultar(como(), 'select public.estornar_movimento_estoque($1, $2, $3)', [tenant, m!.id, 'Ana'])
    expect((await saldoProduto()).e).toBe('36.000')
    await expect(bd.consultar(como(), 'select public.estornar_movimento_estoque($1, $2, $3)', [tenant, m!.id, 'Ana'])).rejects.toThrow(/já foi estornado/)
    await expect(bd.consultar(como(), 'delete from public.estoque_movimentos where id = $1', [m!.id])).rejects.toThrow(/permission denied/)
  })

  it('inventário gera ajuste só onde a contagem difere e guarda o registo', async () => {
    const [inv] = await bd.consultar<{ id: string }>(como(), 'select public.aplicar_inventario($1, $2, $3::jsonb, $4) id', [
      tenant,
      'Fim do mês',
      JSON.stringify([
        { produto_id: produto, contado: 30 },
        { insumo_id: insumo, contado: 5 },
      ]),
      'Ana',
    ])
    expect((await saldoProduto()).e).toBe('30.000')
    const [r] = await bd.consultar<{ ajustes: number }>(srv, 'select ajustes from public.inventarios where id = $1', [inv!.id])
    expect(r!.ajustes).toBe(1)
  })
})
