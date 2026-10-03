# Plano de implementação — Fase 1

> Documento pedido pelo brief (§0): modelo de dados, estrutura de ficheiros e
> plano de design **antes** do código. Só a Fase 1 é construída; o modelo fica
> preparado para as fases 2, 3 e 4. Fonte: [brief.md](brief.md) e a skill
> `dominio-produto`.

**Objectivo.** Um operador cria um tenant no console e põe a página pública
com cardápio no ar em menos de trinta minutos; um cliente final monta um
pedido e chega ao WhatsApp em menos de um minuto; o pedido aparece no painel
com som.

**Stack.** Next.js 16.3 (App Router, Turbopack, `proxy.ts`), React 19.2,
TypeScript 5.9, Tailwind 4, Supabase (Postgres + RLS, Auth, Storage,
Realtime), `zod` 4, `vitest` 4 com PGlite para testar as migrações e o
isolamento por RLS sem Docker.

---

## 1. Decisões de arquitectura

| Decisão                   | Escolha                                                                                                                     | Porquê                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Isolamento                | RLS em todas as tabelas com `tenant_id` **e** filtro explícito na camada de dados                                           | RLS é a rede de segurança (critério 6); o filtro explícito torna a intenção legível no código.                  |
| Identidade do comerciante | `membros(user_id, tenant_id, papel)`                                                                                        | Um utilizador pode pertencer a mais de um tenant no futuro sem migração.                                        |
| Identidade do operador    | `operadores(user_id)`                                                                                                       | Operadores passam nas políticas RLS de todos os tenants; o console lista todos.                                 |
| Impersonação              | Cookie `pvh_tenant` (httpOnly) só honrado se o utilizador for operador                                                      | Sem senha do cliente, sem tokens partilhados, sem sessão dupla.                                                 |
| Página pública            | Server Component dinâmico, dados lidos com a chave publishable sob políticas `anon`                                         | Sempre fresca (critério 4), zero JS para ler o cardápio, RLS decide o que é público.                            |
| Registo de pedido         | Server Action com validação `zod`, preços recalculados da base, inserção atómica via função SQL chamada com a chave secreta | O browser nunca envia preços; `anon` não tem permissão de escrita em nada.                                      |
| Tempo real                | `postgres_changes` na tabela `pedidos` filtrado por `tenant_id`, com polling de 20 s como reserva                           | Respeita RLS, sem infraestrutura extra.                                                                         |
| Fotos                     | Redimensionamento no browser (canvas → WebP ≤ 1200 px) antes do upload                                                      | Resolve os 5 MB do telemóvel sem depender do plano Pro do Storage.                                              |
| Catálogo canónico         | Tipos em `lib/canais/tipos.ts` seguem o Open Delivery; `lib/canais/cardapio.ts` é o primeiro adaptador                      | A página pública já renderiza a partir do formato canónico; iFood e 99Food entram na Fase 3 sem tocar no resto. |
| Importador                | Foto → Claude (visão) → JSON; planilha CSV/XLSX → parser; ambos acabam no mesmo ecrã de revisão antes de gravar             | A tarefa mais demorada do setup fica com revisão humana obrigatória.                                            |
| Formulários               | Server Actions + `useActionState`; validação `zod` no servidor                                                              | Progressive enhancement, um único ponto de validação.                                                           |

---

## 2. Modelo de dados

Todas as tabelas de negócio têm `tenant_id uuid not null references tenants`
e RLS activa. Chaves primárias `uuid default gen_random_uuid()`. Dinheiro em
`numeric(10,2)`. Datas em `timestamptz`. Fuso horário guardado por loja.

### Enums

```sql
tenant_status       'onboarding' | 'ativo' | 'suspenso' | 'cancelado'
papel_membro        'dono' | 'funcionario'
canal_pedido        'cardapio' | 'whatsapp' | 'balcao' | 'ifood' | '99food'
pedido_status       'novo' | 'aceite' | 'pronto' | 'concluido' | 'cancelado'
tipo_entrega        'entrega' | 'retirada'
forma_pagamento     'pix' | 'dinheiro' | 'cartao'
etapa_onboarding    'cadastro' | 'cardapio' | 'fotos' | 'pagina' | 'google' | 'cobranca'
```

### Tabelas

```
tenants          id, slug (único, minúsculas), nome_fantasia, razao_social, cnpj,
                 telefone, whatsapp (só dígitos, com DDI), logo_url, cor_marca,
                 endereco jsonb, plano, status, renovacao_em date,
                 publicado_em, criado_em, atualizado_em

lojas            id, tenant_id, nome, endereco jsonb, fuso_horario,
                 horarios jsonb [{dia 0-6, abre 'HH:MM', fecha 'HH:MM'}],
                 aceita_entrega, aceita_retirada, raio_entrega_km,
                 taxa_entrega, pedido_minimo, fechada_ate timestamptz, ativo

categorias       id, tenant_id, nome, ordem, ativo
produtos         id, tenant_id, categoria_id, nome, descricao, preco,
                 preco_promocional, foto_url, sku, disponivel,
                 tempo_preparo_min, ordem, criado_em, atualizado_em
grupos_opcao     id, tenant_id, produto_id, nome, min, max, obrigatorio, ordem
opcoes           id, tenant_id, grupo_id, nome, preco_adicional, disponivel, ordem

pedidos          id, tenant_id, loja_id, canal, canal_pedido_id, numero (por
                 tenant e dia), cliente_nome, cliente_telefone, tipo_entrega,
                 endereco jsonb, observacoes, subtotal, taxa_entrega, total,
                 forma_pagamento, troco_para, status, criado_em, atualizado_em
itens_pedido     id, tenant_id, pedido_id, produto_id, nome, quantidade,
                 preco_unitario, opcoes jsonb [{grupo, nome, preco_adicional}],
                 observacao, total          -- snapshot: produtos mudam, pedidos não

membros          user_id, tenant_id, papel, criado_em        (PK composta)
operadores       user_id, nome, criado_em
tenant_onboarding tenant_id, etapa, concluida_em, nota        (PK composta)

insumos          id, tenant_id, nome, unidade, quantidade_atual,      -- Fase 2
                 quantidade_minima, custo_unitario
fichas           produto_id, insumo_id, tenant_id, quantidade          -- Fase 2
```

### Funções e triggers

- `app.tenants_do_utilizador()` — ids dos tenants do utilizador autenticado
  (`security invoker`, lê `membros` sob RLS).
- `app.e_operador()` — verdadeiro se o utilizador está em `operadores`.
- `app.tenant_publico(tenant_id)` — verdadeiro se o tenant pode ser lido por
  `anon` (status ≠ `cancelado`).
- `criar_pedido(jsonb)` — insere pedido e itens numa transacção; `execute`
  apenas para `service_role`.
- Trigger `pedidos_numero` — numera por tenant e por dia com lock consultivo.
- Trigger `atualizado_em` — carimba a data em cada `update`.
- `anonimizar_pedidos(dias)` — apaga nome, telefone e endereço de pedidos
  antigos (LGPD, §7); agendar com `pg_cron` quando houver volume.

### Políticas RLS (padrão)

```
anon           select em tenants (colunas públicas), lojas, categorias,
               produtos, grupos_opcao, opcoes — só de tenants públicos
authenticated  all em tabelas com tenant_id quando
               tenant_id in app.tenants_do_utilizador() or app.e_operador()
               (USING e WITH CHECK)
membros        select das próprias linhas; operadores gerem tudo
operadores     select da própria linha
service_role   bypass (usado só no servidor para criar pedidos e tenants)
```

Storage: bucket `fotos` público para leitura; escrita só em pastas
`{tenant_id}/…` do próprio tenant ou por operador.

---

## 3. Estrutura de ficheiros

```
src/
  app/
    layout.tsx · globals.css · page.tsx · not-found.tsx
    (publico)/[slug]/            página pública do comerciante
      page.tsx · loading.tsx · _components/{cabecalho,cardapio,carrinho,checkout}.tsx
    entrar/                      login
    sair/route.ts
    painel/                      área do comerciante (5 ecrãs)
      layout.tsx                 barra de 5 separadores, banner de impersonação
      pedidos/ · cardapio/ · loja/ · resumo/ · conta/
    admin/                       console do operador
      layout.tsx · page.tsx (lista de tenants)
      tenants/novo/ · tenants/[id]/ (ficha, checklist, importador, exportação)
  lib/
    config/marca.ts              nome do produto e URL base (um sítio para renomear)
    supabase/                    browser.ts · server.ts · admin.ts · sessao.ts · tipos.ts
    auth/                        sessao.ts (quem é, que tenant, impersonação) · guardas.ts
    dominio/                     lógica pura e testada
      horario.ts · carrinho.ts · whatsapp.ts · moeda.ts · pedido.ts · slug.ts · telefone.ts · resumo.ts
    dados/                       acesso a dados sempre com tenantId
      tenants.ts · lojas.ts · cardapio.ts · pedidos.ts · onboarding.ts
    canais/                      tipos.ts (Open Delivery) · cardapio.ts (adaptador Fase 1)
    importador/                  planilha.ts · foto.ts · normalizar.ts
    validacao/                   esquemas zod por entidade
    imagem/redimensionar.ts      canvas → WebP no browser
  components/ui/                 botao, campo, interruptor, folha, dialogo, etiqueta
  proxy.ts                       refresca sessão e protege /painel e /admin
supabase/
  migrations/                    0001_esquema · 0002_rls · 0003_storage · 0004_realtime
  seed.sql                       tenant de demonstração
scripts/criar-operador.ts        cria o primeiro operador
tests/
  dominio/*.test.ts              lógica pura
  bd/rls.test.ts                 migrações + isolamento em PGlite
docs/                            brief.md · plano-fase-1.md · operacao.md
```

Regras: um ficheiro, uma responsabilidade. Componentes só usados por uma rota
vivem em `_components/` ao lado dela. Nada em `lib/dados` aceita uma query sem
`tenantId`. Nada em `lib/dominio` importa Supabase ou React.

---

## 4. Plano de design

Três superfícies, três contextos de uso, uma só família de tokens.

### Tokens (Tailwind 4, `@theme`)

- Papel `#faf6ee` (fundo quente), Tinta `#171410`, Carvão `#3d3730`,
  Areia `#e9e1d3` (bordas), Tangerina `#f2541b` (acção principal),
  Verde `#1f8a4c` (aberto, concluído), Âmbar `#d98c0a` (atenção),
  Vermelho `#c8321f` (erro, esgotado).
- Fontes: **Fraunces** (display, nomes e preços na página pública) e
  **Figtree** (interface e corpo). Pesos limitados para manter a página pública
  leve.
- Cada tenant pode definir `cor_marca`; a página pública aplica-a em
  `--cor-marca` sobre os mesmos tokens.

### Página pública `/{slug}` — "cardápio de balcão"

Mobile-first, uma mão. Cabeçalho com logo, nome, estado **Aberto / Fechado**
calculado do horário real e botão WhatsApp. Cardápio em lista por categoria
com foto quadrada, nome em Fraunces, descrição curta e preço alinhado à
direita. Carrinho como folha deslizante inferior; botão fixo "Ver pedido"
quando há itens. Checkout num só ecrã: nome, telefone, entrega ou retirada,
endereço, pagamento. Ao confirmar, regista o pedido e abre o `wa.me` com a
mensagem formatada. Tenant suspenso: só nome, telefone, endereço e botão
WhatsApp. Alvo: < 1,5 s em 4G — sem JS para ler o cardápio, imagens
`next/image` com `sizes` correctos, fontes auto-hospedadas.

### Painel `/painel` — "balcão com as mãos ocupadas"

Barra inferior fixa com cinco separadores (Pedidos, Cardápio, Loja, Resumo,
Conta), alvos ≥ 48 px, contraste alto, sem menus escondidos. Pedidos em
cartões grandes com três botões de estado; som e vibração ao entrar pedido
novo; interruptor "Som" persistido. Cardápio com interruptor de disponibilidade
à vista em cada produto. Loja com botão grande **Fechar loja agora**. Resumo
com números grandes e uma lista. Funciona a 360 px.

### Console `/admin` — "mesa de operação"

Desktop, denso. Barra lateral, tabela de tenants com etapas de onboarding
como pontos coloridos, filtros por estado. Ficha do tenant com checklist,
o que foi entregue e falta, renovação, botões de acção (entrar como, ver
página, importar cardápio, definir senha, exportar dados). Importador com
pré-visualização editável antes de gravar.

---

## 5. Fluxos principais

1. **Pedido.** Carrinho (client) → Server Action `criarPedido` → `zod` →
   recalcula preços e valida disponibilidade, loja aberta e pedido mínimo →
   `criar_pedido(jsonb)` (atómico) → devolve número e URL `wa.me` → o browser
   abre o WhatsApp. O painel recebe o `INSERT` por Realtime e toca.
2. **Disponibilidade.** Interruptor no painel → Server Action → `update` sob
   RLS → `revalidatePath('/{slug}')`. A página pública é dinâmica: o próximo
   pedido já não vê o produto.
3. **Impersonação.** Console → `entrarComoTenant(id)` → verifica operador →
   cookie `pvh_tenant` → `/painel` mostra banner e opera sobre esse tenant.
4. **Importador.** Upload → extracção (Claude ou parser) → tabela editável →
   `gravarImportacao` cria categorias e produtos em bloco e marca a etapa
   `cardapio`.

---

## 6. Verificação

- `vitest`: horário (fuso, virar da meia-noite, fecho manual), carrinho
  (opções, mínimo, taxa), mensagem WhatsApp, transições de estado, slug,
  telefone, resumo.
- `vitest` + PGlite: aplica as migrações reais, cria dois tenants e dois
  utilizadores, prova que nenhum vê o outro em nenhuma tabela e que operador
  vê ambos.
- `tsc --noEmit`, `eslint`, `next build`.
- Critérios de aceitação §10 do brief, verificados manualmente contra um
  projecto Supabase real (ver `docs/operacao.md`).

---

## 7. Preparado, mas não construído

- **Fase 2:** tabelas `insumos` e `fichas` criadas com RLS; nenhum ecrã.
- **Fase 3:** enum `canal_pedido` com os cinco valores, `pedidos.canal_pedido_id`,
  interface `CanalAdapter` e formato canónico; nenhum adaptador externo.
- **Fase 4:** `itens_pedido` guarda `produto_id` e snapshot; `pedidos.canal`
  em todos os pedidos.
- **Não se constrói:** pagamento online, conta de cliente final, avaliações,
  cupões, chat, emissor fiscal, API oficial do WhatsApp.

---

## 8. Tarefas

- [x] Ambiente, versões, changelog Supabase, PGlite validado
- [x] Esqueleto Next.js 16 + Tailwind 4 + ESLint + Prettier + Vitest
- [x] Migrações SQL (esquema, RLS, storage, realtime, seed)
- [x] Testes de isolamento RLS em PGlite
- [x] Tipos `Database`, clientes Supabase, `proxy.ts`
- [x] Domínio puro com testes (horário, carrinho, WhatsApp, pedido, resumo)
- [x] Camada de dados por tenant
- [x] Sistema de design (tokens, fontes, componentes base)
- [x] Página pública + carrinho + checkout + Server Action de pedido
- [x] Login, sessão, impersonação
- [x] Painel: pedidos (tempo real + som), cardápio, loja, resumo, conta
- [x] Console: lista, novo tenant, ficha, checklist, importador, exportação
- [x] Script do primeiro operador, `docs/operacao.md`, `.env.example`
- [x] `tsc`, `eslint`, `vitest`, `next build`

---

## 9. Cadeia de produção (acrescentado em 2026-09-02)

O checklist fixo de seis etapas passou a ser a primeira frente de uma
**cadeia de produção** por empresa, para acompanhar a visão de incorporar
negócios como tentáculos: cada empresa recebe o mesmo diagnóstico (já tem
Instagram? site? Business Manager? Google Meu Negócio? iFood?) e a equipa vai
construindo o que falta.

- **Modelo em código** (`src/lib/cadeia/modelo.ts`): quatro frentes,
  lançamento, presença digital, canais e operação, com pergunta de
  diagnóstico por etapa e a fase do brief a que a construção pertence.
- **Estado por empresa** (`cadeia_etapas`): não avaliado, já tinha, pendente,
  em curso, concluído, não se aplica; notas em Markdown, link, responsável,
  data prevista. Etapas próprias de uma empresa são `personalizada`.
- **Histórico** (`cadeia_registos`): quem mudou o quê, quando.
- **Notas internas** (`notas_internas`): dossiê da empresa em Markdown.
- **Só operadores** vêem estas tabelas (RLS); o comerciante nunca as vê.
- Migração `0005_cadeia_producao.sql` converte o `tenant_onboarding` antigo e
  apaga-o. Testes em `tests/cadeia` e no `rls.test.ts`.

---

## 10. Arquivos e vista de holding (acrescentado em 2026-09-02)

- **Arquivos** (`arquivos` + bucket privado `arquivos`, migrações 0006 e
  0007): a biblioteca viva de cada empresa, por pastas, com upload directo do
  browser, redimensionamento de fotos e links assinados. Só operadores.
- **Vista de holding clicável:** `/admin/pedidos` (pedidos de todas as
  empresas por período, agrupados por empresa, com cliente e itens) e
  `/admin/cadeia` (etapas pendentes e em curso em todas as empresas, com
  prazos e responsáveis). Os cartões do topo do console ligam a estas páginas.
- **Equipa** (`/admin/equipa`) e **login por link** (`/auth/confirmar`).

---

## 11. Módulos por empresa (acrescentado em 2026-10-03)

O começo do ERP modular: cada cliente recebe só o que usa, contra o "template
com tudo" dos concorrentes locais.

- **Catálogo em código** (`src/lib/modulos/catalogo.ts`): id, nome, grupo,
  dependências, separador do painel e maturidade — `funcional` (pronto),
  `pre_funcional` (pronto, falta a credencial do cliente, ver `ativacao`) ou
  `planejado` (no roteiro; aparece no console mas não liga). Loja e Conta são
  essenciais; Pedidos, Cardápio e Resumo vêm ligados por defeito.
- **Estado por empresa** (`tenant_modulos`, migração 0008): só operadores
  ligam e desligam; membros lêem os do próprio tenant; `anon` só sabe se um
  módulo está ligado (a página pública esconde o cardápio e recusa pedidos
  sem o módulo `cardapio`). `configuracao` nunca guarda segredos.
- **Painel**: os separadores saem dos módulos activos; cada rota e action de
  módulo usa `exigirModulo(id)`.
- **Console**: secção "Módulos do cliente" na ficha do tenant, com
  interruptores e as razões quando não se pode ligar ou desligar.
- Projecto Supabase existente: aplicar `supabase/atualizacao-0008.sql`.
