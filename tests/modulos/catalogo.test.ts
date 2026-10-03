import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  MODULOS,
  modulosPadrao,
  podeDesligar,
  podeLigar,
  resolverAtivos,
  separadoresDoPainel,
  type ModuloModelo,
} from '@/lib/modulos/catalogo'

const catalogo = MODULOS as readonly ModuloModelo[]

describe('catálogo de módulos', () => {
  it('ids únicos, no formato aceite pela base e dependências que existem', () => {
    const ids = catalogo.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const m of catalogo) {
      expect(m.id).toMatch(/^[a-z][a-z0-9_]{1,39}$/)
      for (const r of m.requer ?? []) expect(ids).toContain(r)
    }
  })

  it('nenhum módulo pronto depende de um módulo planejado', () => {
    for (const m of catalogo.filter((x) => x.maturidade !== 'planejado')) {
      for (const r of m.requer ?? []) {
        expect(catalogo.find((x) => x.id === r)?.maturidade, `${m.id} → ${r}`).not.toBe('planejado')
      }
    }
  })

  it('a migração e o seed ligam exactamente os módulos por defeito do código', () => {
    const padrao = [...modulosPadrao()].sort()
    for (const ficheiro of ['supabase/migrations/0008_modulos.sql', 'supabase/seed.sql']) {
      const sql = readFileSync(path.resolve(__dirname, '../..', ficheiro), 'utf8')
      const valores = sql.match(/\(values ([^)]*\)(?:, \([^)]*\))*)\) as m \(modulo\)/)
      expect(valores, ficheiro).not.toBeNull()
      const ids = [...valores![1]!.matchAll(/'([a-z_]+)'/g)].map((x) => x[1]).sort()
      expect(ids, ficheiro).toEqual(padrao)
    }
  })
})

describe('resolverAtivos', () => {
  it('junta sempre os essenciais', () => {
    const ativos = resolverAtivos([])
    expect([...ativos].sort()).toEqual(['conta', 'loja'])
  })

  it('ignora ids desconhecidos e módulos planejados', () => {
    const ativos = resolverAtivos(['pedidos', 'inexistente', 'fiscal'])
    expect(ativos.has('pedidos')).toBe(true)
    expect(ativos.has('fiscal' as never)).toBe(false)
    expect(ativos.has('inexistente' as never)).toBe(false)
  })

  it('desliga em cascata o que perdeu a dependência', () => {
    // cardapio e resumo requerem pedidos
    const ativos = resolverAtivos(['cardapio', 'resumo'])
    expect(ativos.has('cardapio')).toBe(false)
    expect(ativos.has('resumo')).toBe(false)
  })
})

describe('ligar e desligar', () => {
  const base = resolverAtivos(['pedidos'])

  it('liga um módulo pronto com as dependências satisfeitas', () => {
    expect(podeLigar('cardapio', base)).toEqual({ ok: true })
  })

  it('recusa ligar sem a dependência, planejado, essencial ou desconhecido', () => {
    expect(podeLigar('cardapio', resolverAtivos([]))).toEqual({ ok: false, motivo: 'Ligue primeiro: Pedidos.' })
    expect(podeLigar('fiscal', base).ok).toBe(false)
    expect(podeLigar('loja', base).ok).toBe(false)
    expect(podeLigar('nada', base).ok).toBe(false)
  })

  it('não desliga aquilo de que outro módulo ligado depende', () => {
    const ativos = resolverAtivos(['pedidos', 'cardapio'])
    expect(podeDesligar('pedidos', ativos)).toEqual({ ok: false, motivo: 'Desligue antes: Cardápio digital.' })
    expect(podeDesligar('cardapio', ativos)).toEqual({ ok: true })
    expect(podeDesligar('conta', ativos).ok).toBe(false)
  })
})

describe('separadores do painel', () => {
  it('um por módulo activo, na ordem do catálogo, com Loja e Conta sempre', () => {
    expect(separadoresDoPainel(resolverAtivos(modulosPadrao())).map((s) => s.rotulo)).toEqual([
      'Pedidos',
      'Cardápio',
      'Loja',
      'Resumo',
      'Conta',
    ])
    expect(separadoresDoPainel(resolverAtivos([])).map((s) => s.rotulo)).toEqual(['Loja', 'Conta'])
  })
})
