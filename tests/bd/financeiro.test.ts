/**
 * Financeiro na base: o estado da parcela vem das baixas, não passa do saldo,
 * corrigir é estornar, nada se apaga e cada tenant só vê o seu.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenantA: string
let tenantB: string
let donoA: string
let donoB: string
let carteiraA: string
let categoriaPagarA: string

const como = (id: string) => ({ tipo: 'utilizador' as const, id })

async function criarConta(valor: number, parcelas = 1) {
  const [t] = await bd.consultar<{ id: string }>(
    como(donoA),
    `insert into public.titulos (tenant_id, tipo, descricao, categoria_id, competencia)
     values ($1, 'pagar', 'Aluguel', $2, '2026-10-01') returning id`,
    [tenantA, categoriaPagarA],
  )
  const ids: string[] = []
  for (let n = 1; n <= parcelas; n++) {
    const [p] = await bd.consultar<{ id: string }>(
      como(donoA),
      `insert into public.parcelas (tenant_id, titulo_id, numero, vencimento, valor) values ($1, $2, $3, '2026-10-10', $4) returning id`,
      [tenantA, t!.id, n, valor],
    )
    ids.push(p!.id)
  }
  return { titulo: t!.id, parcelas: ids }
}

const estado = async (parcela: string) =>
  (
    await bd.consultar<{ estado: string; valor_pago: string }>(
      { tipo: 'servidor' },
      'select estado, valor_pago from public.parcelas where id = $1',
      [parcela],
    )
  )[0]!

function baixar(parcela: string, valor: number) {
  return bd.consultar<{ id: string }>(
    como(donoA),
    `insert into public.baixas (tenant_id, parcela_id, carteira_id, data, valor) values ($1, $2, $3, '2026-10-10', $4) returning id`,
    [tenantA, parcela, carteiraA, valor],
  )
}

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  const novoTenant = async (slug: string) =>
    (
      await bd.db.query<{ id: string }>(
        `insert into public.tenants (slug, nome_fantasia, whatsapp) values ($1, $1, '5569999990000') returning id`,
        [slug],
      )
    ).rows[0]!.id
  tenantA = await novoTenant('tenant-a')
  tenantB = await novoTenant('tenant-b')
  donoA = await bd.criarUtilizador('a@teste.local')
  donoB = await bd.criarUtilizador('b@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2), ($3, $4)`, [donoA, tenantA, donoB, tenantB])
  await bd.consultar(como(donoA), 'select public.financeiro_padrao($1)', [tenantA])
  await bd.consultar(como(donoA), 'select public.financeiro_padrao($1)', [tenantA]) // idempotente
  carteiraA = (await bd.consultar<{ id: string }>({ tipo: 'servidor' }, `select id from public.carteiras where tenant_id = $1 and nome = 'Caixa da loja'`, [tenantA]))[0]!.id
  categoriaPagarA = (await bd.consultar<{ id: string }>({ tipo: 'servidor' }, `select id from public.categorias_financeiras where tenant_id = $1 and nome = 'Aluguel'`, [tenantA]))[0]!.id
})

afterAll(async () => {
  await bd.fechar()
})

describe('dados de partida', () => {
  it('cria 4 carteiras e 16 categorias, sem duplicar', async () => {
    const [c] = await bd.consultar<{ n: number }>({ tipo: 'servidor' }, 'select count(*)::int n from public.carteiras where tenant_id = $1', [tenantA])
    const [k] = await bd.consultar<{ n: number }>({ tipo: 'servidor' }, 'select count(*)::int n from public.categorias_financeiras where tenant_id = $1', [tenantA])
    expect(c!.n).toBe(4)
    expect(k!.n).toBe(16)
  })
})

describe('estado da parcela', () => {
  it('nasce aberta mesmo que tentem inserir como paga', async () => {
    const { titulo } = await criarConta(50)
    const [p] = await bd.consultar<{ estado: string }>(
      como(donoA),
      `insert into public.parcelas (tenant_id, titulo_id, numero, vencimento, valor, estado, valor_pago)
       values ($1, $2, 2, '2026-11-10', 50, 'paga', 50) returning estado`,
      [tenantA, titulo],
    )
    expect(p!.estado).toBe('aberta')
  })

  it('aberta → parcial → paga pelas baixas', async () => {
    const { parcelas } = await criarConta(100)
    await baixar(parcelas[0]!, 40)
    expect(await estado(parcelas[0]!)).toEqual({ estado: 'parcial', valor_pago: '40.00' })
    await baixar(parcelas[0]!, 60)
    expect(await estado(parcelas[0]!)).toEqual({ estado: 'paga', valor_pago: '100.00' })
  })

  it('não deixa pagar mais do que o saldo', async () => {
    const { parcelas } = await criarConta(100)
    await baixar(parcelas[0]!, 70)
    await expect(baixar(parcelas[0]!, 31)).rejects.toThrow(/passa do saldo/)
  })

  it('ninguém escreve o estado à mão', async () => {
    const { parcelas } = await criarConta(100)
    await expect(
      bd.consultar(como(donoA), `update public.parcelas set estado = 'paga' where id = $1`, [parcelas[0]]),
    ).rejects.toThrow(/permission denied/)
  })
})

describe('corrigir é estornar', () => {
  it('o estorno devolve o saldo e a baixa fica no histórico', async () => {
    const { parcelas } = await criarConta(100)
    const [b] = await baixar(parcelas[0]!, 100)
    await bd.consultar(como(donoA), 'update public.baixas set estornada_em = now() where id = $1', [b!.id])
    expect(await estado(parcelas[0]!)).toEqual({ estado: 'aberta', valor_pago: '0.00' })
    const [n] = await bd.consultar<{ n: number }>({ tipo: 'servidor' }, 'select count(*)::int n from public.baixas where id = $1', [b!.id])
    expect(n!.n).toBe(1)
  })

  it('não se estorna duas vezes nem se muda o valor de uma baixa', async () => {
    const { parcelas } = await criarConta(100)
    const [b] = await baixar(parcelas[0]!, 10)
    await expect(bd.consultar(como(donoA), 'update public.baixas set valor = 99 where id = $1', [b!.id])).rejects.toThrow(
      /permission denied/,
    )
    await bd.consultar(como(donoA), 'update public.baixas set estornada_em = now() where id = $1', [b!.id])
    await expect(
      bd.consultar(como(donoA), 'update public.baixas set estornada_em = now() where id = $1', [b!.id]),
    ).rejects.toThrow(/já estornada/)
  })

  it('não se apagam baixas nem contas', async () => {
    const { titulo, parcelas } = await criarConta(100)
    await baixar(parcelas[0]!, 10)
    await expect(bd.consultar(como(donoA), 'delete from public.baixas where parcela_id = $1', [parcelas[0]])).rejects.toThrow(
      /permission denied/,
    )
    await expect(bd.consultar(como(donoA), 'delete from public.titulos where id = $1', [titulo])).rejects.toThrow(/permission denied/)
  })

  it('cancelar a conta cancela as parcelas em aberto, não as pagas', async () => {
    const { titulo, parcelas } = await criarConta(100, 2)
    await baixar(parcelas[0]!, 100)
    await bd.consultar(como(donoA), 'update public.titulos set cancelado_em = now() where id = $1', [titulo])
    expect((await estado(parcelas[0]!)).estado).toBe('cancelada')
    expect((await estado(parcelas[1]!)).estado).toBe('cancelada')
    await expect(baixar(parcelas[1]!, 10)).rejects.toThrow(/cancelada/)
  })
})

describe('isolamento', () => {
  it('o dono B não vê nem paga as contas do A', async () => {
    const { parcelas } = await criarConta(100)
    const vistas = await bd.consultar(como(donoB), 'select id from public.parcelas')
    expect(vistas).toHaveLength(0)
    await expect(
      bd.consultar(
        como(donoB),
        `insert into public.baixas (tenant_id, parcela_id, carteira_id, data, valor) values ($1, $2, $3, '2026-10-10', 10)`,
        [tenantA, parcelas[0], carteiraA],
      ),
    ).rejects.toThrow(/row-level security/)
  })
})
