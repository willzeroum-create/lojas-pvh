/**
 * Teste de ponta a ponta do pedido, contra um servidor a correr e o Supabase
 * real: abre a página pública da loja de demonstração, monta um pedido,
 * preenche o checkout, submete, apanha o link do WhatsApp e confirma o
 * pedido gravado na base.
 *
 *   pnpm test:e2e            (dev server em http://localhost:3000)
 *   E2E_URL=https://… pnpm test:e2e
 *
 * Precisa de `.env.local` com SUPABASE_SECRET_KEY para ler o pedido gravado.
 * O pedido fica com nome "Teste E2E" e observação a dizer que é automático.
 */
import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { carregarEnvLocal, DEMO, fazerPedidoDemo } from './_fluxos.mjs'

carregarEnvLocal()

function falhar(mensagem) {
  console.error(`✗ ${mensagem}`)
  process.exit(1)
}
function ok(mensagem) {
  console.log(`✓ ${mensagem}`)
}

const browser = await chromium.launch()
const contexto = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})
const page = await contexto.newPage()
const errosConsola = []
page.on('pageerror', (e) => errosConsola.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errosConsola.push(m.text()))

const { urlWhatsapp, mensagem, numero, textoBarra, totais } = await fazerPedidoDemo(page)

if (!textoBarra.includes('R$ 34,00')) falhar(`barra do carrinho devia mostrar R$ 34,00: "${textoBarra}"`)
ok(`carrinho: ${textoBarra}`)
if (!totais.includes('Total R$ 39,00')) falhar(`total com entrega devia ser R$ 39,00: "${totais}"`)
ok('totais: subtotal R$ 34,00 + entrega R$ 5,00 = R$ 39,00')
if (!numero) falhar(`sem número de pedido na mensagem: "${mensagem.slice(0, 80)}"`)
ok(`confirmação: pedido #${numero}`)

if (!urlWhatsapp.startsWith(`https://wa.me/${DEMO.whatsapp}?`))
  falhar(`número do WhatsApp errado: ${urlWhatsapp}`)
for (const trecho of [
  `*Pedido #${numero} — Lanchonete da Praça*`,
  '1x X-Salada — R$ 22,00',
  'Ao ponto, Bacon',
  '2x Refrigerante lata 350 ml — R$ 12,00',
  'Guaraná',
  'Entrega: R$ 5,00',
  '*Total: R$ 39,00*',
  'Rua de Teste, 42 – Centro',
  'troco para R$ 100,00',
  'Teste E2E',
]) {
  if (!mensagem.includes(trecho)) falhar(`mensagem do WhatsApp sem "${trecho}":\n${mensagem}`)
}
ok('mensagem do WhatsApp completa e com o número certo')

// O pedido está na base, com itens e totais recalculados no servidor.
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})
const { data: pedido, error } = await admin
  .from('pedidos')
  .select('numero, status, canal, total, cliente_nome, itens_pedido(nome, quantidade, total, opcoes)')
  .eq('tenant_id', DEMO.tenantId)
  .eq('cliente_nome', 'Teste E2E')
  .order('criado_em', { ascending: false })
  .limit(1)
  .maybeSingle()
if (error || !pedido) falhar(`pedido não encontrado na base: ${error?.message}`)
if (pedido.numero !== numero) falhar(`número na base (${pedido.numero}) difere da confirmação (${numero})`)
if (Number(pedido.total) !== 39 || pedido.status !== 'novo' || pedido.canal !== 'cardapio')
  falhar(`pedido gravado com valores errados: ${JSON.stringify(pedido)}`)
if (pedido.itens_pedido.length !== 2) falhar(`esperava 2 itens, veio ${pedido.itens_pedido.length}`)
ok(
  `pedido #${pedido.numero} na base: ${pedido.itens_pedido.map((i) => `${i.quantidade}x ${i.nome}`).join(', ')} · total R$ ${Number(pedido.total).toFixed(2)}`,
)

if (errosConsola.length) falhar(`erros na consola do browser:\n${errosConsola.join('\n')}`)
ok('sem erros na consola')

await browser.close()
