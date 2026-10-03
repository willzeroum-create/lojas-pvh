import { afterEach, describe, expect, it, vi } from 'vitest'

/** `AGENCIA.whatsapp` é lido do ambiente na importação: cada caso importa o módulo de novo. */
async function carregar(numero: string) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_COMERCIAL', numero)
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_SUPORTE', '')
  return import('@/lib/config/agencia')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('landing: WhatsApp da agência', () => {
  it('sem número configurado, os CTAs levam à secção de contacto', async () => {
    const { linkWhatsappAgencia } = await carregar('')
    expect(linkWhatsappAgencia()).toBe('#contato')
  })

  it('com número, abre o wa.me com a mensagem codificada', async () => {
    const { linkWhatsappAgencia } = await carregar('5569999990000')
    const url = new URL(linkWhatsappAgencia('Olá & tchau'))
    expect(url.origin + url.pathname).toBe('https://wa.me/5569999990000')
    expect(url.searchParams.get('text')).toBe('Olá & tchau')
  })

  it('"Monte o seu" manda a lista de módulos, um por linha', async () => {
    const { mensagemMonteOSeu } = await carregar('')
    const texto = mensagemMonteOSeu(['Pedidos', 'Estoque'])
    expect(texto.split('\n')).toEqual([
      'Olá! Montei no site um sistema com estes módulos:',
      '• Pedidos',
      '• Estoque',
      '',
      'Podemos marcar uma visita?',
    ])
  })

  it('"Monte o seu" sem módulos usa a mensagem padrão', async () => {
    const { mensagemMonteOSeu } = await carregar('')
    expect(mensagemMonteOSeu([])).toMatch(/^Olá! Vi o site/)
  })
})
