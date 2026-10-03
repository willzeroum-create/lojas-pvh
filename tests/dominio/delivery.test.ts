import { describe, expect, it } from 'vitest'
import { aAcertar, chaveBairro, zonaDoBairro, type ZonaEntrega } from '@/lib/dominio/delivery'

const zona = (nome: string, taxa: number): ZonaEntrega => ({ id: nome, nome, chave: chaveBairro(nome), taxa, tempoMin: 40 })

describe('delivery', () => {
  it('bairro normalizado: acentos, caixa e espaços', () => {
    expect(chaveBairro('  Jardim  América ')).toBe('jardim america')
    expect(chaveBairro('São João Bosco')).toBe(chaveBairro('sao joao-bosco'))
  })

  it('sem zonas vale a taxa única; com zonas, só os bairros cadastrados', () => {
    expect(zonaDoBairro([], 'Centro')).toEqual({ ok: true, zona: null })
    const zonas = [zona('Centro', 5), zona('Embratel', 8)]
    expect(zonaDoBairro(zonas, 'embratel')).toMatchObject({ ok: true, zona: { nome: 'Embratel', taxa: 8 } })
    expect(zonaDoBairro(zonas, 'Nacional')).toMatchObject({ ok: false, erro: expect.stringContaining('Nacional') })
    expect(zonaDoBairro(zonas, '')).toMatchObject({ ok: false, erro: 'Informe o bairro para calcular a entrega.' })
  })

  it('acerto soma só as entregues e ainda não acertadas', () => {
    expect(
      aAcertar([
        { repasse: 6, estado: 'entregue', acertadoEm: null },
        { repasse: 6, estado: 'entregue', acertadoEm: '2026-10-01' },
        { repasse: 6, estado: 'nao_entregue', acertadoEm: null },
        { repasse: 7.5, estado: 'entregue', acertadoEm: null },
      ]),
    ).toEqual({ quantidade: 2, valor: 13.5 })
  })
})
