/** O seed de demonstração do ERP corre por cima do seed base, duas vezes, e deixa a loja pronta para testar. */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

let bd: BaseDeTeste
const TENANT = 'a0000000-0000-4000-8000-000000000001'

beforeAll(async () => {
  bd = await BaseDeTeste.criar({ seed: true })
  const sql = await readFile(path.resolve(__dirname, '../../supabase/demo-erp.sql'), 'utf8')
  await bd.db.exec(sql)
  await bd.db.exec(sql) // idempotente
})

afterAll(async () => {
  await bd.fechar()
})

describe('demonstração do ERP', () => {
  it('liga os módulos, cria mesas, estações, ficha e gerente', async () => {
    const [m] = await bd.consultar<{ n: number }>({ tipo: 'servidor' }, 'select count(*)::int n from public.tenant_modulos where tenant_id = $1 and ativo', [TENANT])
    expect(m!.n).toBe(14)
    const [mesas] = await bd.consultar<{ n: number }>({ tipo: 'servidor' }, 'select count(*)::int n from public.mesas where tenant_id = $1', [TENANT])
    expect(mesas!.n).toBe(8)
    const [g] = await bd.consultar<{ papel: string }>({ tipo: 'servidor' }, `select papel from public.equipe_membros where tenant_id = $1`, [TENANT])
    expect(g!.papel).toBe('gerente')
  })

  it('estoque inicial com saldo e custo médio, uma só vez', async () => {
    const [refri] = await bd.consultar<{ e: string; c: string }>(
      { tipo: 'servidor' },
      `select estoque_atual::text e, custo_medio::text c from public.produtos where id = 'd0000000-0000-4000-8000-000000000005'`,
    )
    expect(refri).toEqual({ e: '48.000', c: '3.0000' })
    const [pao] = await bd.consultar<{ q: string }>({ tipo: 'servidor' }, `select quantidade_atual::text q from public.insumos where nome = 'Pão de hambúrguer'`)
    expect(pao!.q).toBe('60.000')
  })
})
