# Lojas PVH

Plataforma para **lojas, stands de carros e restaurantes**, feita em Porto
Velho (RO) para clientes no Brasil, em Portugal, na Espanha e nos Países
Baixos. Um sistema modular: cada empresa recebe só os módulos que usa, ligados
e desligados pela equipe no console.

- **Site da agência** (`/`): seis abas com um topo 3D interativo (objetos
  fotografados que se agarram e atiram, luz de cinema, poeira com bokeh),
  portfólio, configurador de módulos e pedido de cotação pelo WhatsApp.
- **Página pública de cada loja** (`/{slug}`): cardápio com carrinho e pedido
  pronto no WhatsApp; taxa de entrega por bairro.
- **Painel do comerciante** (`/painel`): PDV com leitor e balança, caixa,
  mesas e comandas, tela da cozinha, estoque com entrada por XML de nota e
  ficha técnica, financeiro, clientes, delivery próprio (link do entregador e
  acompanhamento para o cliente), cashback, ponto eletrônico com foto,
  relatórios com exportação para Excel, equipe com PIN e aprovação do gerente,
  nota fiscal (NFC-e) e Pix com QR.
- **Console da equipe** (`/admin`): empresas, módulos por cliente,
  integrações, cadeia de produção, importador de cardápio, arquivos.

## Documentação

- **Módulos, como pôr no ar e roteiro de teste:** [docs/plano-erp.md](docs/plano-erp.md)
- **Operar a plataforma:** [docs/operacao.md](docs/operacao.md)
- **Decisões e modelo de dados:** [docs/plano-fase-1.md](docs/plano-fase-1.md)
- **Brief do produto:** [docs/brief.md](docs/brief.md)
- **Pesquisa de mercado e concorrentes:** [docs/pesquisa](docs/pesquisa)
- **Regras de domínio:** [.claude/skills/dominio-produto/SKILL.md](.claude/skills/dominio-produto/SKILL.md)

## Rotas

| Rota                               | Quem          | O quê                                                     |
| ---------------------------------- | ------------- | --------------------------------------------------------- |
| `/`, `/servicos`, `/segmentos`, `/trabalhos`, `/monte-o-seu`, `/contato` | Visitante | Site da agência |
| `/{slug}`                          | Cliente final | Cardápio da loja, carrinho e pedido no WhatsApp           |
| `/entrega/{código}`                | Cliente final | Acompanhamento da entrega                                 |
| `/entregador/{token}`              | Entregador    | Entregas que estão com ele, marcar entregue               |
| `/painel/*`                        | Comerciante   | Os módulos ligados para a empresa                         |
| `/admin/*`                         | Equipe        | Empresas, módulos, integrações, cadeia, arquivos          |
| `/entrar`                          | Todos         | Login                                                     |

## Tecnologia

Next.js 16 (App Router), React 19, Tailwind 4, three.js, Supabase (Postgres
com RLS por empresa, Auth, Storage), zod, Vitest com PGlite para testar o banco
e Playwright para os testes de ponta a ponta.

```
src/app            rotas e Server Actions; (site) é o site da agência
src/lib/dominio    regras puras (caixa, PDV, ponto, cashback, delivery…), todas testadas
src/lib/dados      acesso a dados, sempre por empresa (tenantId explícito)
src/lib/modulos    catálogo de módulos e o que cada um abre no painel
src/lib/integracoes  Focus NFe, Mercado Pago, WhatsApp, BrasilAPI
supabase           migrações SQL (só se acrescentam), seed e demonstração
tests              Vitest: domínio e banco (RLS) em PGlite; e2e com Playwright
```

## Começar

```bash
pnpm install && cp .env.example .env.local   # preencher com as chaves do Supabase
pnpm migrar --demo                           # banco, loja de exemplo e módulos ligados
pnpm dev                                     # em localhost entra direto como equipe
pnpm test && pnpm typecheck && pnpm lint && pnpm build
E2E_NAVEGADOR=msedge pnpm test:e2e           # com o dev server a correr
```
