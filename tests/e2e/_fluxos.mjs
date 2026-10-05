/**
 * Passos partilhados pelos testes de ponta a ponta.
 */
import { readFileSync } from 'node:fs'

/** Carrega `.env.local` para `process.env` sem sobrepor o que já lá está. */
export function carregarEnvLocal() {
  for (const linha of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}

export const URL_BASE = process.env.E2E_URL ?? 'http://localhost:3000'
export const DEMO = {
  tenantId: 'a0000000-0000-4000-8000-000000000001',
  slug: 'lanchonete-da-praca',
  whatsapp: '5569999998888',
}

/**
 * Faz um pedido completo na página pública da loja de demonstração: X-Salada
 * ao ponto com bacon e dois guaranás, entrega, dinheiro com troco. Devolve o
 * link do WhatsApp que a página tentou abrir e a mensagem descodificada.
 */
export async function fazerPedidoDemo(page, { nomeCliente = 'Teste E2E' } = {}) {
  let urlWhatsapp = null
  await page.route('https://wa.me/**', (rota) => {
    urlWhatsapp = rota.request().url()
    rota.abort()
  })

  await page.goto(`${URL_BASE}/${DEMO.slug}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })

  const estado = await page.locator('header span.inline-flex').first().innerText()
  if (!estado.startsWith('Aberto'))
    throw new Error(`a loja de demonstração tem de estar aberta; estado: "${estado}"`)

  await page.getByRole('button', { name: /X-Salada/ }).click()
  const folha = page.locator('dialog[open]')
  await folha.getByLabel('Ao ponto').check()
  await folha.getByLabel('Bacon').check()
  await folha.getByRole('button', { name: /^Adicionar/ }).click()
  await folha.waitFor({ state: 'hidden' })

  await page.getByRole('button', { name: /Refrigerante/ }).click()
  await folha.getByLabel('Guaraná').check()
  await folha.getByRole('button', { name: 'Mais um' }).click()
  await folha.getByRole('button', { name: /^Adicionar/ }).click()
  await folha.waitFor({ state: 'hidden' })

  const barra = page.getByRole('button', { name: /Ver pedido/ })
  const textoBarra = (await barra.innerText()).replace(/\s+/g, ' ')
  await barra.click()
  const carrinho = page.locator('dialog[open]')
  // Com o Delivery e bairros cadastrados, o bairro escolhe-se no carrinho (e define a taxa).
  const bairros = carrinho.getByLabel('Seu bairro')
  const porBairro = (await bairros.count()) > 0
  if (porBairro) await bairros.selectOption({ index: 1 })
  const totais = (await carrinho.innerText()).replace(/\s+/g, ' ')
  await carrinho.getByRole('button', { name: 'Continuar' }).click()

  await carrinho.getByLabel('Seu nome').fill(nomeCliente)
  await carrinho.getByLabel('Seu WhatsApp').fill('(69) 99999-0000')
  await carrinho.getByLabel('Rua').fill('Rua de Teste')
  await carrinho.getByLabel('Número').fill('42')
  if (!porBairro) await carrinho.getByLabel('Bairro').fill('Centro')
  await carrinho.getByLabel('Ponto de referência').fill('teste automático')
  await carrinho.getByRole('radio', { name: 'Dinheiro' }).click()
  await carrinho.getByLabel('Troco para quanto?').fill('100')
  await carrinho.getByLabel('Observações do pedido').fill('Pedido de teste automático. Pode cancelar.')
  await carrinho.getByRole('button', { name: /Enviar pelo WhatsApp/ }).click()

  const inicio = Date.now()
  while (!urlWhatsapp && Date.now() - inicio < 20_000) await page.waitForTimeout(250)
  if (!urlWhatsapp) {
    const dialogo = await page
      .locator('dialog[open]')
      .innerText()
      .catch(() => '(sem diálogo)')
    throw new Error(
      `o link do WhatsApp não foi aberto em 20 s. Diálogo: ${dialogo.replace(/\s+/g, ' ').slice(0, 300)}`,
    )
  }
  const mensagem = decodeURIComponent(new URL(urlWhatsapp).searchParams.get('text') ?? '')
  const numero = Number(mensagem.match(/\*Pedido #(\d+)/)?.[1])
  return { urlWhatsapp, mensagem, numero, textoBarra, totais }
}
