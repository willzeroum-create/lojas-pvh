/**
 * Teste de ponta a ponta do console e do painel, contra um servidor a correr
 * e o Supabase real. Cria um operador descartável, entra por link de acesso
 * (sem senha), percorre a cadeia, as notas, a equipa, a criação de uma
 * empresa de teste com importação de cardápio, o painel por impersonação e o
 * painel da loja de demonstração. No fim apaga tudo o que criou.
 *
 *   pnpm test:e2e:console
 *
 * Precisa de `.env.local` com SUPABASE_SECRET_KEY e do tenant de demonstração
 * (seed). Deixa a loja de demonstração como estava.
 */
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { carregarEnvLocal, DEMO, fazerPedidoDemo, URL_BASE } from './_fluxos.mjs'

carregarEnvLocal()

const DEMO_ID = DEMO.tenantId
/** PNG de 1×1 px para testar o upload de fotos. */
const PNG_MINIMO = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
)
const OPERADOR_EMAIL = 'e2e-operador@teste.local'
const DONO_EMAIL = 'e2e-dono@teste.local'
const SLUG_TESTE = 'zanata-e2e'

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

function ok(mensagem) {
  console.log(`✓ ${mensagem}`)
}
function verificar(condicao, mensagem) {
  if (!condicao) throw new Error(`✗ ${mensagem}`)
}
const senhaAleatoria = () =>
  Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase()

async function apagarUtilizadorPorEmail(email) {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  for (const u of data.users.filter((x) => x.email?.toLowerCase() === email)) {
    await admin.from('operadores').delete().eq('user_id', u.id)
    await admin.auth.admin.deleteUser(u.id)
  }
}

/** Fotos no Storage de tenants que já não existem (o teste apaga o tenant, o bucket não sabe). */
async function limparFotosOrfas() {
  const { data: pastas } = await admin.storage.from('fotos').list('', { limit: 1000 })
  const { data: tenants } = await admin.from('tenants').select('id')
  const vivos = new Set((tenants ?? []).map((t) => t.id))
  for (const pasta of pastas ?? []) {
    if (pasta.id !== null || vivos.has(pasta.name)) continue
    const { data: produtos } = await admin.storage
      .from('fotos')
      .list(`${pasta.name}/produtos`, { limit: 1000 })
    const caminhos = [
      ...(produtos ?? []).map((o) => `${pasta.name}/produtos/${o.name}`),
      `${pasta.name}/logo.webp`,
    ]
    await admin.storage.from('fotos').remove(caminhos)
  }
}

async function limpar() {
  await admin.from('tenants').delete().eq('slug', SLUG_TESTE)
  await apagarUtilizadorPorEmail(DONO_EMAIL)
  await apagarUtilizadorPorEmail(OPERADOR_EMAIL)
  await limparFotosOrfas()
}

async function principal() {
  await limpar()

  // Operador descartável, com entrada por link (sem senha em formulário nenhum).
  const { data: criado, error: erroCriar } = await admin.auth.admin.createUser({
    email: OPERADOR_EMAIL,
    password: senhaAleatoria(),
    email_confirm: true,
  })
  verificar(!erroCriar && criado.user, `criar operador de teste: ${erroCriar?.message}`)
  await admin.from('operadores').upsert({ user_id: criado.user.id, nome: 'Operador E2E' })
  const { data: link, error: erroLink } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: OPERADOR_EMAIL,
  })
  verificar(!erroLink && link.properties?.hashed_token, `gerar link: ${erroLink?.message}`)

  const browser = await chromium.launch()
  const contexto = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await contexto.newPage()
  const erros = []
  page.on('pageerror', (e) => erros.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
  page.on('dialog', (d) => d.accept())
  // innerText vem com o text-transform do CSS aplicado e, depois de um redirect, o documento
  // novo pode ainda estar a chegar: esperar pelo load e comparar tudo em minúsculas.
  const texto = async (alvo = 'main') => {
    // Na Vercel alguns prefetches dos <Link> (?_rsc=) ficam abertos vários segundos; limitar a espera pelo silêncio de rede.
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {})
    // Navegações do router mostram primeiro o esqueleto (aria-busy) e só depois o conteúdo.
    await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: 15_000 })
    const el = typeof alvo === 'string' ? page.locator(alvo) : alvo
    return (await el.innerText()).replace(/\s+/g, ' ').toLowerCase()
  }

  try {
    // -- Entrada por link e vista de holding -----------------------------------
    await page.goto(
      `${URL_BASE}/auth/confirmar?token_hash=${link.properties.hashed_token}&type=magiclink&proximo=/admin`,
    )
    await page.waitForURL(/\/admin$/)
    let t = await texto()
    verificar(
      t.includes('empresas ativas') && t.includes('pedidos hoje'),
      'resumo da holding no topo do console',
    )
    verificar(t.includes('lanchonete da praça'), 'lista de tenants com a demonstração')
    ok('entrada por link de acesso; console com resumo e lista')

    await page.goto(`${URL_BASE}/admin/equipa`)
    t = await texto()
    verificar(
      t.includes('operador e2e') && t.includes('você'),
      'equipa lista o operador de teste como "você"',
    )
    ok('página da equipa')

    // -- Vista de holding: tudo clicável ---------------------------------------
    await page.goto(`${URL_BASE}/admin`)
    await page.getByRole('link', { name: /Pedidos hoje/ }).click()
    await page.waitForURL(/\/admin\/pedidos$/)
    t = await texto()
    verificar(
      t.includes('lanchonete da praça') && t.includes('teste e2e'),
      'pedidos de hoje por empresa e cliente',
    )
    await page.goto(`${URL_BASE}/admin/pedidos?periodo=7d`)
    verificar((await texto()).includes('últimos 7 dias'), 'período de 7 dias')
    await page.goto(`${URL_BASE}/admin`)
    await page.getByRole('link', { name: /Etapas em aberto/ }).click()
    await page.waitForURL(/\/admin\/cadeia$/)
    verificar((await texto()).includes('lanchonete da praça'), 'etapas em aberto por empresa')
    await page.goto(`${URL_BASE}/admin`)
    await page.getByRole('link', { name: /Empresas ativas/ }).click()
    await page.waitForURL(/\/admin\?status=ativo$/)
    ok('cartões da holding abrem pedidos, cadeia e empresas')

    // -- Cadeia de produção da demonstração ------------------------------------
    await page.goto(`${URL_BASE}/admin/tenants/${DEMO_ID}/cadeia`)
    const estadoInstagram = page.getByLabel('Estado de Instagram')
    const estadoAntes = await estadoInstagram.inputValue()
    await estadoInstagram.selectOption('em_curso')
    await page.waitForTimeout(1500)
    await page.reload()
    verificar(
      (await page.getByLabel('Estado de Instagram').inputValue()) === 'em_curso',
      'estado da etapa persistido',
    )

    await page.getByRole('button', { name: /Google Meu Negócio/ }).click()
    await page.getByPlaceholder(/Acessos, decisões/).fill('Nota E2E: perfil reivindicado em teste.')
    await page.getByRole('button', { name: 'Guardar', exact: true }).click()
    await page.waitForTimeout(1500)
    await page.reload()
    await page.getByRole('button', { name: /Google Meu Negócio/ }).click()
    verificar(
      (await page.getByPlaceholder(/Acessos, decisões/).inputValue()).toLowerCase().includes('nota e2e'),
      'notas da etapa persistidas',
    )
    const historico = await texto(page.locator('aside', { hasText: 'Histórico' }))
    verificar(
      historico.includes('operador e2e') && historico.includes('em curso'),
      'histórico regista autor e estado',
    )

    await page.getByRole('button', { name: 'Etapa só desta empresa' }).first().click()
    await page.getByPlaceholder(/Barraca na feira/).fill('Etapa E2E')
    await page.getByRole('button', { name: 'Criar', exact: true }).click()
    await page.waitForTimeout(1500)
    await page.reload()
    verificar((await texto()).includes('etapa e2e'), 'etapa personalizada criada')
    await page.getByRole('button', { name: /Etapa E2E/ }).click()
    await page.getByRole('button', { name: 'Apagar etapa' }).click()
    await page.waitForTimeout(1500)
    await page.reload()
    verificar(!(await texto()).includes('etapa e2e'), 'etapa personalizada apagada')

    await page.getByLabel('Estado de Instagram').selectOption(estadoAntes)
    await page.waitForTimeout(1500)
    ok('cadeia: estado, notas, histórico e etapa própria')

    // -- Notas internas --------------------------------------------------------
    await page.goto(`${URL_BASE}/admin/tenants/${DEMO_ID}/notas/nova`)
    await page.getByLabel('Título').fill('Nota E2E')
    await page.getByLabel('Markdown').fill('# Olá\n\n- [x] teste automático')
    await page.getByRole('button', { name: 'Criar nota' }).click()
    await page.waitForURL(/\/notas$/)
    verificar((await texto()).includes('nota e2e'), 'nota criada e listada')
    await page.getByRole('link', { name: /Nota E2E/ }).click()
    await page.getByRole('button', { name: 'Apagar', exact: true }).click()
    await page.waitForURL(/\/notas$/)
    verificar(!(await texto()).includes('nota e2e'), 'nota apagada')
    ok('notas internas: criar, listar, apagar')

    // -- Empresa nova + importação de cardápio ---------------------------------
    await page.goto(`${URL_BASE}/admin/tenants/novo`)
    await page.getByLabel('Nome fantasia').fill('Zanata E2E')
    verificar(
      (await page.getByLabel('Slug (endereço público)').inputValue()) === SLUG_TESTE,
      'slug gerado do nome',
    )
    await page.getByLabel('WhatsApp para pedidos').fill('(69) 98888-7777')
    await page.getByLabel('E-mail do dono').fill(DONO_EMAIL)
    await page.getByLabel('Senha inicial').fill(senhaAleatoria())
    await page.getByRole('button', { name: 'Criar tenant' }).click()
    await page.waitForURL(/\/admin\/tenants\/[0-9a-f-]{36}\?criado=1$/)
    const tenantId = page.url().match(/tenants\/([0-9a-f-]{36})/)[1]
    t = await texto()
    verificar(
      t.includes('cadeia de produção') && t.includes(DONO_EMAIL),
      'ficha da empresa nova com cadeia e dono',
    )
    ok(`empresa de teste criada (${tenantId.slice(0, 8)}…)`)

    const pasta = mkdtempSync(path.join(tmpdir(), 'pvh-e2e-'))
    const csv = path.join(pasta, 'cardapio.csv')
    writeFileSync(
      csv,
      'categoria,nome,descricao,preco\nSalgados,Pastel de carne,Massa fina e crocante,8\nSalgados,Coxinha,,6\nBebidas,Caldo de cana,,7\n',
    )
    await page.goto(`${URL_BASE}/admin/tenants/${tenantId}/importar`)
    await page.locator('input[accept^=".csv"]').setInputFiles(csv)
    await page.getByRole('button', { name: /Gravar 3 produtos/ }).click()
    await page.waitForFunction(() => document.body.innerText.includes('gravados'))
    ok('importação de cardápio por CSV com revisão')

    // -- Arquivos (só se as migrações 0006/0007 já estiverem no banco) ---------
    const { error: erroArquivos } = await admin.from('arquivos').select('id').limit(1)
    if (erroArquivos) {
      ok(`arquivos: passo saltado, migração ainda não aplicada (${erroArquivos.code})`)
    } else {
      await page.goto(`${URL_BASE}/admin/tenants/${tenantId}/arquivos`)
      const fachada = path.join(pasta, 'fachada.png')
      writeFileSync(fachada, PNG_MINIMO)
      await page.locator('input[type="file"][multiple]').setInputFiles(fachada)
      const miniatura = page.locator('img[src*="/storage/v1/object/sign/"]').first()
      await miniatura.waitFor({ timeout: 20_000 })
      const respostaMini = await page.request.get(await miniatura.getAttribute('src'))
      verificar(respostaMini.ok(), `o link assinado não abre: ${respostaMini.status()}`)
      t = await texto()
      verificar(
        t.includes('fachada.webp') && t.includes('operador e2e'),
        'arquivo listado com autor e convertido para webp',
      )
      await page.getByRole('button', { name: 'Apagar fachada.webp' }).click()
      await page.waitForFunction(() => document.body.innerText.includes('Ainda sem arquivos'))
      ok('arquivos: upload para o bucket privado, link assinado, apagar')
    }

    // Link de acesso para o dono: gerado no console, aberto noutro browser sem cookies.
    await page.goto(`${URL_BASE}/admin/tenants/${tenantId}`)
    await page.getByRole('button', { name: 'Gerar link de acesso' }).click()
    const linkDono = await page.locator('input[readonly]').inputValue()
    verificar(linkDono.includes('/auth/confirmar?token_hash='), 'link de acesso gerado')
    const contextoDono = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const paginaDono = await contextoDono.newPage()
    await paginaDono.goto(linkDono)
    await paginaDono.waitForURL(/\/painel/)
    verificar(
      (await paginaDono.locator('body').innerText()).toLowerCase().includes('zanata e2e'),
      'dono entra no painel pelo link',
    )
    await contextoDono.close()
    ok('link de acesso do dono funciona sem senha')

    // -- Painel por impersonação -----------------------------------------------
    await page.getByRole('button', { name: 'Entrar como' }).click()
    await page.waitForURL(/\/painel\/pedidos/)
    verificar((await texto('body')).includes('operando como zanata e2e'), 'banner de impersonação')
    await page.goto(`${URL_BASE}/painel/cardapio`)
    t = await texto()
    verificar(
      t.includes('pastel de carne') && t.includes('caldo de cana'),
      `cardápio importado visível no painel; texto: ${t.slice(0, 300)}`,
    )
    const interruptor = page.getByRole('switch', { name: 'Disponibilidade de Pastel de carne' })
    await interruptor.click()
    await page.waitForTimeout(1500)
    await page.reload()
    verificar(
      (await page
        .getByRole('switch', { name: 'Disponibilidade de Pastel de carne' })
        .getAttribute('aria-checked')) === 'false',
      'interruptor de disponibilidade persistido',
    )
    const publica = await page.request.get(`${URL_BASE}/${SLUG_TESTE}`)
    const html = (await publica.text()).toLowerCase()
    verificar(
      html.includes('coxinha') && !html.includes('pastel de carne'),
      'esgotado some da página pública',
    )
    // Foto do produto: redimensionada no browser e enviada para o Storage com a sessão do operador.
    await page.getByRole('link', { name: /Coxinha/ }).click()
    await page.waitForURL(/\/painel\/cardapio\/produto\//)
    const png = path.join(pasta, 'coxinha.png')
    writeFileSync(png, PNG_MINIMO)
    await page.locator('input[type="file"][accept="image/*"]').setInputFiles(png)
    const foto = page.locator('img[src*="/storage/v1/object/public/fotos/"]').first()
    await foto.waitFor({ timeout: 20_000 })
    const urlFoto = await foto.getAttribute('src')
    const respostaFoto = await page.request.get(urlFoto)
    verificar(respostaFoto.ok(), `a foto enviada não é pública: ${respostaFoto.status()}`)
    verificar(
      (respostaFoto.headers()['content-type'] ?? '').includes('image/webp'),
      'a foto foi convertida para WebP',
    )
    ok('upload de foto para o Storage, pública e em WebP')

    await page.goto(`${URL_BASE}/painel/loja`)
    verificar((await texto()).includes('fechar loja agora'), 'ecrã da loja')
    await page.getByLabel('Taxa (R$)').fill('7,50')
    await page.getByLabel('Mínimo (R$)').fill('20')
    await page.getByRole('button', { name: 'Guardar loja' }).click()
    await page.waitForFunction(() => document.body.innerText.includes('Loja guardada'))
    await page.reload()
    verificar((await page.getByLabel('Taxa (R$)').inputValue()) === '7,50', 'taxa de entrega persistida')
    verificar((await page.getByLabel('Mínimo (R$)').inputValue()) === '20,00', 'pedido mínimo persistido')
    ok('formulário da loja guarda e relê')
    await page.goto(`${URL_BASE}/painel/resumo`)
    verificar((await texto()).includes('mais vendidos'), 'ecrã do resumo')
    await page.goto(`${URL_BASE}/painel/conta`)
    verificar((await texto()).includes(SLUG_TESTE), 'ecrã da conta com o link público')
    await page.getByRole('button', { name: 'Voltar ao console' }).click()
    await page.waitForURL(/\/admin$/)
    ok('painel por impersonação: pedidos, cardápio, loja, resumo, conta')

    const exportacao = await page.request.get(`${URL_BASE}/admin/tenants/${tenantId}/exportar`)
    const dados = await exportacao.json()
    verificar(
      dados.produtos?.length === 3 && dados.cadeia_etapas?.length > 0,
      'exportação JSON com produtos e cadeia',
    )
    ok('exportação de dados')

    // -- Painel da demonstração: pedidos do teste E2E --------------------------
    await page
      .locator('tr', { hasText: 'Lanchonete da Praça' })
      .getByRole('button', { name: 'Entrar como' })
      .click()
    await page.waitForURL(/\/painel\/pedidos/)
    t = await texto()
    verificar(t.includes('teste e2e'), 'pedidos do teste E2E visíveis no painel')
    const cartao = page.locator('article', { hasText: 'Teste E2E' }).first()
    if (await cartao.getByRole('button', { name: 'Aceitar' }).count()) {
      await cartao.getByRole('button', { name: 'Aceitar' }).click()
      await page.waitForTimeout(1500)
      await page.reload()
      verificar((await texto()).includes('em preparo'), 'pedido aceite persistido')
      ok('pedido aceite no painel')
    } else {
      ok('pedidos já aceites; transição não repetida')
    }

    // Tempo real: um pedido feito noutro browser aparece no painel sem recarregar.
    await page.goto(`${URL_BASE}/painel/pedidos`)
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {})
    const contextoCliente = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    })
    const paginaCliente = await contextoCliente.newPage()
    const { numero: numeroRealtime } = await fazerPedidoDemo(paginaCliente, {
      nomeCliente: 'Teste E2E Realtime',
    })
    await contextoCliente.close()
    await page.waitForFunction(
      (n) =>
        document.body.innerText.includes('Teste E2E Realtime') && document.body.innerText.includes(`#${n}`),
      numeroRealtime,
      { timeout: 25_000 },
    )
    ok(`pedido #${numeroRealtime} chegou ao painel em tempo real, sem recarregar`)

    verificar(erros.length === 0, `erros na consola do browser:\n${erros.join('\n')}`)
    ok('sem erros na consola')
  } finally {
    await browser.close()
    await admin
      .from('cadeia_etapas')
      .update({ estado: 'ja_tinha' })
      .eq('tenant_id', DEMO_ID)
      .eq('frente', 'presenca_digital')
      .eq('chave', 'instagram')
    await limpar()
    ok('dados de teste apagados (empresa, dono, operador)')
  }
}

principal().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
