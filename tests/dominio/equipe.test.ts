import { describe, expect, it, vi } from 'vitest'
import { descontoPrecisaAprovacao, papelAbreModulo, papelFazSemAprovacao, pinAceitavel } from '@/lib/equipe/papeis'

vi.mock('server-only', () => ({}))

describe('papéis', () => {
  it('cada papel abre só os seus módulos; o gerente abre todos', () => {
    expect(papelAbreModulo('gerente', 'financeiro')).toBe(true)
    expect(papelAbreModulo('caixa', 'pdv')).toBe(true)
    expect(papelAbreModulo('caixa', 'financeiro')).toBe(false)
    expect(papelAbreModulo('garcom', 'comandas')).toBe(true)
    expect(papelAbreModulo('garcom', 'pdv')).toBe(false)
    expect(papelAbreModulo('cozinha', 'cozinha')).toBe(true)
  })

  it('ações sensíveis e limite de desconto', () => {
    expect(papelFazSemAprovacao('gerente', 'cancelar_venda')).toBe(true)
    expect(papelFazSemAprovacao('caixa', 'cancelar_venda')).toBe(false)
    expect(papelFazSemAprovacao('cozinha', 'cancelar_item')).toBe(true)
    expect(descontoPrecisaAprovacao('caixa', 10, 100)).toBe(false)
    expect(descontoPrecisaAprovacao('caixa', 10.5, 100)).toBe(true)
    expect(descontoPrecisaAprovacao('garcom', 1, 100)).toBe(true)
    expect(descontoPrecisaAprovacao('gerente', 100, 100)).toBe(false)
  })

  it('PIN: 4 a 6 números, sem repetidos nem sequências', () => {
    expect(pinAceitavel('4821').ok).toBe(true)
    expect(pinAceitavel('123').ok).toBe(false)
    expect(pinAceitavel('1111').ok).toBe(false)
    expect(pinAceitavel('1234').ok).toBe(false)
    expect(pinAceitavel('9876').ok).toBe(false)
    expect(pinAceitavel('12a4').ok).toBe(false)
  })
})

describe('PIN e sessão da equipe', () => {
  it('hash com sal confere só o PIN certo', async () => {
    const { conferirPin, hashPin } = await import('@/lib/equipe/pin')
    const h = hashPin('4821')
    expect(h).toMatch(/^scrypt\$/)
    expect(hashPin('4821')).not.toBe(h) // sal diferente
    expect(conferirPin('4821', h)).toBe(true)
    expect(conferirPin('4822', h)).toBe(false)
    expect(conferirPin('4821', 'lixo')).toBe(false)
  })

  it('a sessão assinada não aceita adulteração nem expiração', async () => {
    vi.stubEnv('PVH_SEGREDO_EQUIPE', 'x'.repeat(40))
    const { assinarSessaoEquipe, lerSessaoEquipe } = await import('@/lib/equipe/pin')
    const agora = 1_000_000
    const valor = assinarSessaoEquipe('m1', 't1', agora)
    expect(lerSessaoEquipe(valor, agora + 1000)).toMatchObject({ membroId: 'm1', tenantId: 't1' })
    const [corpo, assinatura] = valor.split('.')
    const falso = Buffer.from(JSON.stringify({ membroId: 'gerente', tenantId: 't1', expira: agora + 1e9 })).toString('base64url')
    expect(lerSessaoEquipe(`${falso}.${assinatura}`, agora)).toBeNull()
    expect(lerSessaoEquipe(`${corpo}.${assinatura}`, agora + 13 * 3600 * 1000)).toBeNull()
    expect(lerSessaoEquipe(undefined)).toBeNull()
    vi.unstubAllEnvs()
  })
})
