import { describe, expect, it } from 'vitest'
import { nomeDeUtilizador, normalizarIdentificador } from '@/lib/dominio/identificador'

describe('normalizarIdentificador', () => {
  it('transforma um nome de utilizador num e-mail do domínio da equipa', () => {
    expect(normalizarIdentificador('will')).toEqual({ ok: true, email: 'will@equipe.pvh.local' })
    expect(normalizarIdentificador('  Marco ')).toEqual({ ok: true, email: 'marco@equipe.pvh.local' })
    expect(normalizarIdentificador('ana.paula-2')).toEqual({
      ok: true,
      email: 'ana.paula-2@equipe.pvh.local',
    })
  })

  it('deixa e-mails completos como estão, em minúsculas', () => {
    expect(normalizarIdentificador('Dono@Loja.com.br')).toEqual({ ok: true, email: 'dono@loja.com.br' })
  })

  it('recusa vazio e caracteres estranhos', () => {
    expect(normalizarIdentificador('   ').ok).toBe(false)
    expect(normalizarIdentificador('will zero').ok).toBe(false)
    expect(normalizarIdentificador('.will').ok).toBe(false)
    expect(normalizarIdentificador('will!').ok).toBe(false)
  })
})

describe('nomeDeUtilizador', () => {
  it('esconde o domínio da equipa e mantém e-mails reais', () => {
    expect(nomeDeUtilizador('will@equipe.pvh.local')).toBe('will')
    expect(nomeDeUtilizador('dono@loja.com.br')).toBe('dono@loja.com.br')
    expect(nomeDeUtilizador(null)).toBe('')
  })
})
