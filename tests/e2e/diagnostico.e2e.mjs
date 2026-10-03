/**
 * Diagnóstico de responsividade e fluidez, contra um servidor a correr e o
 * Supabase real. Percorre todos os ecrãs (página pública, entrada, console e
 * painel por impersonação) em três larguras (telemóvel, tablet, computador) e
 * mede, em cada um:
 *
 *   - estado HTTP, tempo até ao servidor responder e até à rede acalmar;
 *   - overflow horizontal (a página nunca deve andar para o lado) e quais os
 *     elementos que saem do ecrã;
 *   - erros de consola, erros de JavaScript e pedidos falhados;
 *   - alvos de toque pequenos (< 36 px) e texto minúsculo (< 12 px) no telemóvel;
 *   - imagens sem `alt`, botões sem nome, campos sem rótulo;
 *   - um screenshot de página inteira, por ecrã e largura.
 *
 * No fim mede a fluidez de três interacções (abrir um produto, abrir o
 * carrinho, saltar de um cartão da holding para a lista de pedidos) e escreve
 * um relatório em Markdown.
 *
 *   pnpm diagnostico            # screenshots e relatório em .diagnostico/
 *   DIAG_SAIDA=/pasta pnpm diagnostico
 *
 * Cria e apaga um operador descartável. Não altera dados das empresas.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { carregarEnvLocal, DEMO, URL_BASE } from './_fluxos.mjs'

carregarEnvLocal()

const SAIDA = process.env.DIAG_SAIDA ?? path.resolve('.diagnostico')
const OPERADOR_EMAIL = 'e2e-diagnostico@teste.local'
const LARGURAS = [
  { nome: 'computador', width: 1440, height: 900 },
  { nome: 'tablet', width: 768, height: 1024 },
  { nome: 'telemovel', width: 375, height: 812, mobile: true },
]

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

const senhaAleatoria = () =>
  Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase()

async function apagarOperador() {
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  for (const u of data.users.filter((x) => x.email?.toLowerCase() === OPERADOR_EMAIL)) {
    await admin.from('operadores').delete().eq('user_id', u.id)
    await admin.auth.admin.deleteUser(u.id)
  }
}

/**
 * Corre no browser: tudo o que se consegue medir olhando para o DOM. A largura
 * vem de fora porque, em modo telemóvel, o Chrome afasta o zoom quando o
 * conteúdo transborda e `innerWidth` passa a mentir.
 */
function inspeccionar({ mobile, largura }) {
  const raiz = document.documentElement
  const overflow = Math.max(raiz.scrollWidth, document.body.scrollWidth, window.innerWidth) - largura
  const descrever = (el) => {
    const classes = (el.className && typeof el.className === 'string' ? el.className : '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4)
      .join('.')
    const texto = (el.innerText ?? el.getAttribute?.('aria-label') ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 40)
    return `<${el.tagName.toLowerCase()}${classes ? '.' + classes : ''}>${texto ? ' “' + texto + '”' : ''}`
  }
  const visivel = (el) => {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) return false
    const cs = getComputedStyle(el)
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'
  }

  // Elementos que saem pelo lado direito (só quando há overflow real).
  const transbordam = []
  if (overflow > 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.right > largura + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed') {
        transbordam.push(`${descrever(el)} (${Math.round(r.right - largura)} px fora)`)
        if (transbordam.length >= 6) break
      }
    }
  }

  const interactivos = [
    ...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]'),
  ]
    .filter(visivel)
    .filter((el) => !el.closest('[hidden], dialog:not([open])'))
  const alvosPequenos = []
  if (mobile) {
    for (const el of interactivos) {
      if (el.type === 'hidden' || el.type === 'checkbox' || el.type === 'radio') continue
      const r = el.getBoundingClientRect()
      if (r.height < 36 || r.width < 36) {
        alvosPequenos.push(`${descrever(el)} ${Math.round(r.width)}×${Math.round(r.height)}`)
      }
    }
  }

  const textoMinusculo = []
  if (mobile) {
    const percorrer = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const vistos = new Set()
    while (percorrer.nextNode()) {
      const no = percorrer.currentNode
      if (!no.textContent.trim()) continue
      const el = no.parentElement
      if (!el || vistos.has(el) || !visivel(el) || el.closest('script, style, dialog:not([open])')) continue
      vistos.add(el)
      const tamanho = parseFloat(getComputedStyle(el).fontSize)
      if (tamanho < 12) textoMinusculo.push(`${descrever(el)} ${tamanho.toFixed(1)} px`)
    }
  }

  const imagensSemAlt = [...document.querySelectorAll('img')]
    .filter((i) => !i.hasAttribute('alt'))
    .map(descrever)
  const botoesSemNome = [...document.querySelectorAll('button, a[href]')]
    .filter(visivel)
    .filter(
      (b) =>
        !(b.innerText ?? '').trim() &&
        !b.getAttribute('aria-label') &&
        !b.getAttribute('title') &&
        !b.querySelector('img[alt]'),
    )
    .map(descrever)
  const camposSemRotulo = [...document.querySelectorAll('input:not([type="hidden"]), select, textarea')]
    .filter(visivel)
    .filter((c) => {
      if (c.getAttribute('aria-label') || c.getAttribute('aria-labelledby')) return false
      if (c.id && document.querySelector(`label[for="${CSS.escape(c.id)}"]`)) return false
      return !c.closest('label')
    })
    .map(descrever)

  const nav = performance.getEntriesByType('navigation')[0]
  return {
    titulo: document.title,
    h1: document.querySelector('h1')?.innerText?.trim().replace(/\s+/g, ' ').slice(0, 60) ?? null,
    overflow: Math.round(overflow),
    transbordam,
    alvosPequenos: alvosPequenos.slice(0, 8),
    totalAlvosPequenos: alvosPequenos.length,
    textoMinusculo: textoMinusculo.slice(0, 6),
    totalTextoMinusculo: textoMinusculo.length,
    imagensSemAlt,
    botoesSemNome,
    camposSemRotulo,
    interactivos: interactivos.length,
    ttfb: nav ? Math.round(nav.responseStart - nav.startTime) : null,
    domCarregado: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
    carregado: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
    transferido: nav ? Math.round(nav.transferSize / 1024) : null,
    alturaPagina: Math.round(raiz.scrollHeight),
  }
}

async function principal() {
  mkdirSync(SAIDA, { recursive: true })
  await apagarOperador()

  const { data: criado, error: erroCriar } = await admin.auth.admin.createUser({
    email: OPERADOR_EMAIL,
    password: senhaAleatoria(),
    email_confirm: true,
  })
  if (erroCriar) throw new Error(`criar operador: ${erroCriar.message}`)
  await admin.from('operadores').upsert({ user_id: criado.user.id, nome: 'Diagnóstico' })

  // Uma nota e uma categoria/produto da demonstração para os ecrãs de detalhe.
  const [{ data: nota }, { data: categoria }, { data: produto }] = await Promise.all([
    admin.from('notas_internas').select('id').eq('tenant_id', DEMO.tenantId).limit(1).maybeSingle(),
    admin.from('categorias').select('id').eq('tenant_id', DEMO.tenantId).limit(1).maybeSingle(),
    admin.from('produtos').select('id').eq('tenant_id', DEMO.tenantId).limit(1).maybeSingle(),
  ])

  const ID = DEMO.tenantId
  const ECRAS = [
    { grupo: 'público', rota: '/' },
    { grupo: 'público', rota: '/entrar' },
    { grupo: 'público', rota: `/${DEMO.slug}` },
    { grupo: 'público', rota: '/loja-que-nao-existe', esperado: 404 },
    { grupo: 'console', rota: '/admin', autenticado: true },
    { grupo: 'console', rota: '/admin?status=ativo', autenticado: true },
    { grupo: 'console', rota: '/admin/pedidos', autenticado: true },
    { grupo: 'console', rota: '/admin/pedidos?periodo=7d', autenticado: true },
    { grupo: 'console', rota: '/admin/cadeia', autenticado: true },
    { grupo: 'console', rota: '/admin/equipa', autenticado: true },
    { grupo: 'console', rota: '/admin/tenants/novo', autenticado: true },
    { grupo: 'console', rota: `/admin/tenants/${ID}`, autenticado: true },
    { grupo: 'console', rota: `/admin/tenants/${ID}/cadeia`, autenticado: true },
    { grupo: 'console', rota: `/admin/tenants/${ID}/notas`, autenticado: true },
    nota && { grupo: 'console', rota: `/admin/tenants/${ID}/notas/${nota.id}`, autenticado: true },
    { grupo: 'console', rota: `/admin/tenants/${ID}/arquivos`, autenticado: true },
    { grupo: 'console', rota: `/admin/tenants/${ID}/importar`, autenticado: true },
    { grupo: 'painel', rota: '/painel', impersonado: true },
    { grupo: 'painel', rota: '/painel/pedidos', impersonado: true },
    { grupo: 'painel', rota: '/painel/cardapio', impersonado: true },
    categoria && { grupo: 'painel', rota: `/painel/cardapio/categoria/${categoria.id}`, impersonado: true },
    produto && { grupo: 'painel', rota: `/painel/cardapio/produto/${produto.id}`, impersonado: true },
    { grupo: 'painel', rota: '/painel/loja', impersonado: true },
    { grupo: 'painel', rota: '/painel/resumo', impersonado: true },
    { grupo: 'painel', rota: '/painel/conta', impersonado: true },
  ].filter(Boolean)

  const browser = await chromium.launch()
  const resultados = []
  const fluidez = []

  try {
    for (const largura of LARGURAS) {
      const contexto = await browser.newContext({
        viewport: { width: largura.width, height: largura.height },
        isMobile: !!largura.mobile,
        hasTouch: !!largura.mobile,
        deviceScaleFactor: largura.mobile ? 2 : 1,
      })
      const page = await contexto.newPage()
      const erros = []
      const pedidosFalhados = []
      page.on('pageerror', (e) => erros.push(`JS: ${String(e).slice(0, 200)}`))
      page.on('console', (m) => {
        // Num 404 esperado o próprio documento vem com 404 e o Chrome regista-o como erro.
        if (m.text().includes('status of 404') && page.url().includes('/loja-que-nao-existe')) return
        if (m.type() === 'error' || m.type() === 'warning')
          erros.push(`${m.type()}: ${m.text().slice(0, 200)}`)
      })
      page.on('response', (r) => {
        if (r.status() >= 400 && !r.url().includes('/loja-que-nao-existe'))
          pedidosFalhados.push(`${r.status()} ${r.url().replace(URL_BASE, '')}`.slice(0, 160))
      })
      page.on('dialog', (d) => d.accept())

      // Entrada por link de acesso (sem senha) e impersonação da demonstração.
      const { data: link, error: erroLink } = await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: OPERADOR_EMAIL,
      })
      if (erroLink) throw new Error(`gerar link: ${erroLink.message}`)
      await page.goto(
        `${URL_BASE}/auth/confirmar?token_hash=${link.properties.hashed_token}&type=magiclink&proximo=/admin`,
      )
      await page.waitForURL(/\/admin$/)
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {})
      let impersonado = false

      for (const ecra of ECRAS) {
        if (ecra.impersonado && !impersonado) {
          await page.goto(`${URL_BASE}/admin/tenants/${ID}`, { waitUntil: 'load' })
          await page.getByRole('button', { name: 'Entrar como' }).click()
          await page.waitForURL(/\/painel/)
          impersonado = true
        }
        erros.length = 0
        pedidosFalhados.length = 0
        const inicio = Date.now()
        const resposta = await page.goto(URL_BASE + ecra.rota, { waitUntil: 'load' })
        const ateLoad = Date.now() - inicio
        await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {})
        await page
          .waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, { timeout: 15_000 })
          .catch(() => {})
        const ateAcalmar = Date.now() - inicio
        // Fontes e imagens lazy: dar um instante antes de medir.
        await page.waitForTimeout(300)
        const medidas = await page.evaluate(inspeccionar, {
          mobile: !!largura.mobile,
          largura: largura.width,
        })
        const ficheiro = `${largura.nome}-${ecra.rota.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-') || 'inicio'}.png`
        await page.screenshot({ path: path.join(SAIDA, ficheiro), fullPage: true })
        resultados.push({
          largura: largura.nome,
          ...ecra,
          status: resposta?.status() ?? null,
          ateLoad,
          ateAcalmar,
          erros: [...erros],
          pedidosFalhados: [...pedidosFalhados],
          ficheiro,
          ...medidas,
        })
        const avisos = [
          medidas.overflow > 1 && `overflow ${medidas.overflow}px`,
          erros.length && `${erros.length} erro(s) consola`,
          pedidosFalhados.length && `${pedidosFalhados.length} pedido(s) falhado(s)`,
          medidas.totalAlvosPequenos && `${medidas.totalAlvosPequenos} alvo(s) pequeno(s)`,
          medidas.totalTextoMinusculo && `${medidas.totalTextoMinusculo} texto(s) < 12px`,
        ].filter(Boolean)
        // "carregado" é o evento load; "ateAcalmar" inclui os 500 ms de silêncio de rede do networkidle.
        console.log(
          `${largura.nome.padEnd(10)} ${String(resposta?.status()).padEnd(4)} ttfb ${String(medidas.ttfb ?? '?').padStart(5)} ms  load ${String(medidas.carregado ?? '?').padStart(5)} ms  ${ecra.rota}${avisos.length ? '   ⚠ ' + avisos.join(', ') : ''}`,
        )
      }

      // -- Fluidez das interacções principais ------------------------------------
      // Folhas: medido dentro da página, do clique até ao diálogo abrir e ser pintado,
      // para não contar as esperas do Playwright por animações a acabar.
      const medirFolha = (nomeBotao) =>
        page.evaluate(
          (nome) =>
            new Promise((resolver) => {
              const botao = [...document.querySelectorAll('button')].find((b) => b.innerText.includes(nome))
              if (!botao) return resolver({ ateAbrir: -1, atePintar: -1 })
              const obs = new MutationObserver(() => {
                if (!document.querySelector('dialog[open]')) return
                obs.disconnect()
                const ateAbrir = performance.now() - t0
                requestAnimationFrame(() =>
                  requestAnimationFrame(() =>
                    resolver({
                      ateAbrir: Math.round(ateAbrir),
                      atePintar: Math.round(performance.now() - t0),
                    }),
                  ),
                )
              })
              obs.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] })
              const t0 = performance.now()
              botao.click()
            }),
          nomeBotao,
        )

      await page.goto(`${URL_BASE}/${DEMO.slug}`, { waitUntil: 'networkidle' })
      await page.evaluate(() => localStorage.clear())
      await page.reload({ waitUntil: 'networkidle' })
      const folhaItem = await medirFolha('X-Salada')
      fluidez.push({
        largura: largura.nome,
        accao: 'abrir a folha de um produto (até pintar)',
        ms: folhaItem.atePintar,
      })
      const folha = page.locator('dialog[open]')
      await folha.getByLabel('Ao ponto').check()
      let t0 = Date.now()
      await folha.getByRole('button', { name: /^Adicionar/ }).click()
      await folha.waitFor({ state: 'hidden' })
      await page.getByRole('button', { name: /Ver pedido/ }).waitFor({ state: 'visible' })
      fluidez.push({
        largura: largura.nome,
        accao: 'adicionar ao carrinho até à barra aparecer',
        ms: Date.now() - t0,
      })
      await page.waitForTimeout(450)
      const folhaCarrinho = await medirFolha('Ver pedido')
      fluidez.push({
        largura: largura.nome,
        accao: 'abrir o carrinho (até pintar)',
        ms: folhaCarrinho.atePintar,
      })
      t0 = Date.now()
      await page.locator('dialog[open]').getByRole('button', { name: 'Continuar' }).click()
      await page.getByLabel('Seu nome').waitFor({ state: 'visible' })
      fluidez.push({ largura: largura.nome, accao: 'carrinho → formulário de entrega', ms: Date.now() - t0 })

      await page.goto(`${URL_BASE}/admin`, { waitUntil: 'load' })
      t0 = Date.now()
      await page.getByRole('link', { name: /Pedidos hoje/ }).click()
      await page.waitForURL(/\/admin\/pedidos$/)
      await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, {
        timeout: 15_000,
      })
      fluidez.push({
        largura: largura.nome,
        accao: 'cartão "Pedidos hoje" → lista de pedidos',
        ms: Date.now() - t0,
      })

      await page.goto(`${URL_BASE}/painel`, { waitUntil: 'load' })
      t0 = Date.now()
      await page
        .getByRole('link', { name: /Cardápio/ })
        .first()
        .click()
      await page.waitForURL(/\/painel\/cardapio$/)
      await page.waitForFunction(() => !document.querySelector('[aria-busy="true"]'), null, {
        timeout: 15_000,
      })
      fluidez.push({ largura: largura.nome, accao: 'painel: separador Cardápio', ms: Date.now() - t0 })

      await contexto.close()
    }
  } finally {
    await browser.close()
    await apagarOperador()
  }

  // -- Relatório -----------------------------------------------------------------
  const linhas = [
    '# Diagnóstico de responsividade e fluidez',
    '',
    `Servidor: ${URL_BASE}`,
    `Data: ${new Date().toISOString()}`,
    '',
  ]
  const problemas = resultados.filter(
    (r) =>
      r.overflow > 1 ||
      r.erros.length ||
      r.pedidosFalhados.length ||
      r.status !== (r.esperado ?? 200) ||
      r.imagensSemAlt.length ||
      r.botoesSemNome.length ||
      r.camposSemRotulo.length,
  )
  linhas.push(
    `## Resumo`,
    '',
    `- Ecrãs medidos: ${resultados.length} (${ECRAS.length} rotas × ${LARGURAS.length} larguras)`,
  )
  linhas.push(`- Com problemas: ${problemas.length}`, '')

  linhas.push(
    '## Tempos (ms até a rede acalmar)',
    '',
    '| Rota | ' + LARGURAS.map((l) => l.nome).join(' | ') + ' |',
    '| --- | ' + LARGURAS.map(() => '---:').join(' | ') + ' |',
  )
  for (const ecra of ECRAS) {
    const celulas = LARGURAS.map((l) => {
      const r = resultados.find((x) => x.largura === l.nome && x.rota === ecra.rota)
      return r ? `${r.ateAcalmar} (ttfb ${r.ttfb ?? '?'})` : '—'
    })
    linhas.push(`| \`${ecra.rota}\` | ${celulas.join(' | ')} |`)
  }
  linhas.push('')

  linhas.push('## Fluidez das interacções', '', '| Largura | Acção | ms |', '| --- | --- | ---: |')
  for (const f of fluidez) linhas.push(`| ${f.largura} | ${f.accao} | ${f.ms} |`)
  linhas.push('')

  linhas.push('## Problemas por ecrã', '')
  if (problemas.length === 0)
    linhas.push(
      'Nenhum. Sem overflow, sem erros de consola, sem pedidos falhados, sem falhas de acessibilidade básicas.',
      '',
    )
  for (const r of problemas) {
    linhas.push(`### ${r.largura} · \`${r.rota}\` (${r.status})`, '')
    if (r.status !== (r.esperado ?? 200))
      linhas.push(`- estado HTTP ${r.status}, esperado ${r.esperado ?? 200}`)
    if (r.overflow > 1)
      linhas.push(`- overflow horizontal de ${r.overflow} px`, ...r.transbordam.map((t) => `  - ${t}`))
    for (const e of r.erros) linhas.push(`- consola: ${e}`)
    for (const p of r.pedidosFalhados) linhas.push(`- pedido falhado: ${p}`)
    for (const i of r.imagensSemAlt) linhas.push(`- imagem sem alt: ${i}`)
    for (const b of r.botoesSemNome) linhas.push(`- botão sem nome acessível: ${b}`)
    for (const c of r.camposSemRotulo) linhas.push(`- campo sem rótulo: ${c}`)
    linhas.push('')
  }

  linhas.push('## Telemóvel: alvos de toque e texto pequeno', '')
  for (const r of resultados.filter(
    (x) => x.largura === 'telemovel' && (x.totalAlvosPequenos || x.totalTextoMinusculo),
  )) {
    linhas.push(`### \`${r.rota}\``, '')
    if (r.totalAlvosPequenos)
      linhas.push(
        `- ${r.totalAlvosPequenos} alvo(s) com menos de 36 px:`,
        ...r.alvosPequenos.map((a) => `  - ${a}`),
      )
    if (r.totalTextoMinusculo)
      linhas.push(
        `- ${r.totalTextoMinusculo} texto(s) com menos de 12 px:`,
        ...r.textoMinusculo.map((a) => `  - ${a}`),
      )
    linhas.push('')
  }

  linhas.push(
    '## Todos os ecrãs',
    '',
    '| Largura | Rota | Status | Título | h1 | Interactivos | Altura | Screenshot |',
    '| --- | --- | --- | --- | --- | ---: | ---: | --- |',
  )
  for (const r of resultados)
    linhas.push(
      `| ${r.largura} | \`${r.rota}\` | ${r.status} | ${r.titulo} | ${r.h1 ?? '—'} | ${r.interactivos} | ${r.alturaPagina} | ${r.ficheiro} |`,
    )

  writeFileSync(path.join(SAIDA, 'relatorio.md'), linhas.join('\n'))
  writeFileSync(path.join(SAIDA, 'resultados.json'), JSON.stringify({ resultados, fluidez }, null, 2))
  console.log(
    `\nRelatório em ${path.join(SAIDA, 'relatorio.md')} · ${problemas.length} ecrã(s) com problemas`,
  )
}

principal().catch((e) => {
  console.error(e)
  process.exit(1)
})
