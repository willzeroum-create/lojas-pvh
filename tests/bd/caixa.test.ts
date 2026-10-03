/**
 * Caixa e PDV na base: só se vende com caixa aberto, os pagamentos fecham com
 * o total, o caixa fecha às cegas e uma sessão fechada não recebe movimentos.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
let tenant: string
let loja: string
let dono: string
let outro: string
let produto: string
const como = (id: string) => ({ tipo: 'utilizador' as const, id })

function venda(total: number, pagamentos: Array<{ forma: string; valor: number; troco?: number }>, quem = dono) {
  return bd.consultar<{ id: string; status: string; canal: string; numero: number }>(
    como(quem),
    'select id, status, canal, numero from public.registar_venda_balcao($1::jsonb)',
    [
      JSON.stringify({
        tenant_id: tenant,
        loja_id: loja,
        subtotal: total,
        total,
        autor_nome: 'Caixa 1',
        itens: [{ produto_id: produto, nome: 'Item', quantidade: 0.5, preco_unitario: total * 2, total }],
        pagamentos,
      }),
    ],
  )
}

async function abrir(fundo = 100) {
  const [s] = await bd.consultar<{ id: string }>(
    como(dono),
    `insert into public.caixa_sessoes (tenant_id, loja_id, operador_nome, fundo_troco) values ($1, $2, 'Ana', $3) returning id`,
    [tenant, loja, fundo],
  )
  return s!.id
}

beforeAll(async () => {
  bd = await BaseDeTeste.criar()
  tenant = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('padaria', 'Padaria', '5569999990000') returning id`)).rows[0]!.id
  const outroTenant = (await bd.db.query<{ id: string }>(`insert into public.tenants (slug, nome_fantasia, whatsapp) values ('outra', 'Outra', '5569999990000') returning id`)).rows[0]!.id
  loja = (await bd.db.query<{ id: string }>(`insert into public.lojas (tenant_id) values ($1) returning id`, [tenant])).rows[0]!.id
  const cat = (await bd.db.query<{ id: string }>(`insert into public.categorias (tenant_id, nome) values ($1, 'Pães') returning id`, [tenant])).rows[0]!.id
  produto = (await bd.db.query<{ id: string }>(`insert into public.produtos (tenant_id, categoria_id, nome, preco, vendido_por_peso, codigo_barras) values ($1, $2, 'Pão', 16.9, true, '0123') returning id`, [tenant, cat])).rows[0]!.id
  dono = await bd.criarUtilizador('dono@teste.local')
  outro = await bd.criarUtilizador('outro@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id) values ($1, $2), ($3, $4)`, [dono, tenant, outro, outroTenant])
})

afterAll(async () => {
  await bd.fechar()
})

describe('PDV', () => {
  it('não vende com o caixa fechado', async () => {
    await expect(venda(10, [{ forma: 'pix', valor: 10 }])).rejects.toThrow(/abra o caixa/)
  })

  it('vende com caixa aberto: pedido concluído no canal balcão, pagamentos e movimentos', async () => {
    const sessao = await abrir()
    const [p] = await venda(20, [{ forma: 'dinheiro', valor: 50, troco: 30 }])
    expect(p).toMatchObject({ status: 'concluido', canal: 'balcao' })
    const movs = await bd.consultar<{ tipo: string; forma: string; valor: string }>(
      { tipo: 'servidor' },
      'select tipo, forma, valor from public.caixa_movimentos where pedido_id = $1',
      [p!.id],
    )
    expect(movs).toEqual([{ tipo: 'venda', forma: 'dinheiro', valor: '20.00' }])
    // Quantidade fraccionada (quilos) aceite.
    const [item] = await bd.consultar<{ q: string }>({ tipo: 'servidor' }, 'select quantidade::text q from public.itens_pedido where pedido_id = $1', [p!.id])
    expect(item!.q).toBe('0.500')
    await bd.consultar({ tipo: 'servidor' }, `update public.caixa_sessoes set estado = 'fechada' where id = $1`, [sessao])
  })

  it('recusa pagamentos que não fecham com o total e troco fora do dinheiro', async () => {
    const sessao = await abrir()
    await expect(venda(20, [{ forma: 'pix', valor: 15 }])).rejects.toThrow(/não fecham/)
    await expect(venda(20, [{ forma: 'pix', valor: 30, troco: 10 }])).rejects.toThrow(/check constraint/)
    await bd.consultar({ tipo: 'servidor' }, `update public.caixa_sessoes set estado = 'fechada' where id = $1`, [sessao])
  })

  it('cancelar a venda estorna no caixa e guarda o motivo', async () => {
    const sessao = await abrir()
    const [p] = await venda(12, [{ forma: 'pix', valor: 12 }])
    await bd.consultar(como(dono), 'select public.cancelar_venda_balcao($1, $2, $3, $4)', [tenant, p!.id, 'cliente desistiu', 'Ana'])
    const movs = await bd.consultar<{ tipo: string }>({ tipo: 'servidor' }, 'select tipo from public.caixa_movimentos where pedido_id = $1 order by criado_em', [p!.id])
    expect(movs.map((m) => m.tipo)).toEqual(['venda', 'estorno'])
    await expect(
      bd.consultar(como(dono), 'select public.cancelar_venda_balcao($1, $2, $3, $4)', [tenant, p!.id, 'de novo', 'Ana']),
    ).rejects.toThrow(/já cancelada/)
    await bd.consultar({ tipo: 'servidor' }, `update public.caixa_sessoes set estado = 'fechada' where id = $1`, [sessao])
  })
})

describe('caixa', () => {
  it('um só caixa aberto por loja', async () => {
    const sessao = await abrir()
    await expect(abrir()).rejects.toThrow(/duplicate key/)
    await bd.consultar({ tipo: 'servidor' }, `update public.caixa_sessoes set estado = 'fechada' where id = $1`, [sessao])
  })

  it('sangria e suprimento exigem motivo e dinheiro; caixa fechado não recebe movimentos', async () => {
    const sessao = await abrir()
    await expect(
      bd.consultar(como(dono), `insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor) values ($1, $2, 'sangria', 'dinheiro', 10)`, [tenant, sessao]),
    ).rejects.toThrow(/check constraint/)
    await bd.consultar(
      como(dono),
      `insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, motivo) values ($1, $2, 'sangria', 'dinheiro', 10, 'cofre')`,
      [tenant, sessao],
    )
    await bd.consultar(como(dono), `update public.caixa_sessoes set estado = 'fechada' where id = $1`, [sessao])
    await expect(
      bd.consultar(como(dono), `insert into public.caixa_movimentos (tenant_id, sessao_id, tipo, forma, valor, motivo) values ($1, $2, 'suprimento', 'dinheiro', 5, 'troco')`, [tenant, sessao]),
    ).rejects.toThrow(/fechado/)
  })

  it('fechado não reabre e a conferência calcula a diferença', async () => {
    const sessao = await abrir()
    await bd.consultar(
      como(dono),
      `insert into public.caixa_conferencias (tenant_id, sessao_id, forma, esperado, informado) values ($1, $2, 'dinheiro', 100, 97.5)`,
      [tenant, sessao],
    )
    const [c] = await bd.consultar<{ diferenca: string }>({ tipo: 'servidor' }, 'select diferenca from public.caixa_conferencias where sessao_id = $1', [sessao])
    expect(c!.diferenca).toBe('-2.50')
    await bd.consultar(como(dono), `update public.caixa_sessoes set estado = 'fechada' where id = $1`, [sessao])
    await expect(bd.consultar(como(dono), `update public.caixa_sessoes set estado = 'aberta' where id = $1`, [sessao])).rejects.toThrow(/não pode passar/)
    await bd.consultar(como(dono), `update public.caixa_sessoes set estado = 'conferida' where id = $1`, [sessao])
  })

  it('outro tenant não vê nem vende neste caixa', async () => {
    const sessao = await abrir()
    expect(await bd.consultar(como(outro), 'select id from public.caixa_sessoes')).toHaveLength(0)
    await expect(venda(10, [{ forma: 'pix', valor: 10 }], outro)).rejects.toThrow(/abra o caixa/)
    await bd.consultar({ tipo: 'servidor' }, `update public.caixa_sessoes set estado = 'fechada' where id = $1`, [sessao])
  })
})
