# Plataforma para o pequeno comerciante de alimentação

Cardápio digital com pedido por WhatsApp, painel do comerciante e console de
operação com a cadeia de produção de cada empresa, num só catálogo
multi-tenant. Fase 1 do [brief](docs/brief.md) mais o módulo da cadeia.

- **Plano e decisões:** [docs/plano-fase-1.md](docs/plano-fase-1.md)
- **Pôr no ar e operar:** [docs/operacao.md](docs/operacao.md)
- **Regras de domínio:** [.claude/skills/dominio-produto/SKILL.md](.claude/skills/dominio-produto/SKILL.md)

## Mapa

| Rota                           | Quem          | O quê                                                          |
| ------------------------------ | ------------- | -------------------------------------------------------------- |
| `/{slug}`                      | Cliente final | Página do comerciante: cardápio, carrinho, checkout → WhatsApp |
| `/painel`                      | Comerciante   | Pedidos em tempo real, cardápio, loja, resumo, conta           |
| `/admin`                       | Equipa        | Tenants, impersonação, importador, exportação                  |
| `/admin/tenants/[id]/cadeia`   | Equipa        | Cadeia de produção: diagnóstico, execução, histórico           |
| `/admin/tenants/[id]/notas`    | Equipa        | Notas internas em Markdown                                     |
| `/admin/pedidos`               | Equipa        | Pedidos de todas as empresas, por período                      |
| `/admin/cadeia`                | Equipa        | Etapas em aberto em todas as empresas                          |
| `/admin/tenants/[id]/arquivos` | Equipa        | Biblioteca de fotos e documentos da empresa, por pastas        |
| `/admin/equipa`                | Equipa        | Quem tem acesso ao console                                     |
| `/entrar`                      | Ambos         | Login                                                          |

```
src/app            rotas e Server Actions (uma pasta por área)
src/lib/dominio    regras puras, sem React nem Supabase, todas testadas
src/lib/cadeia     modelo da cadeia de produção e cálculo de progresso
src/lib/dados      acesso a dados, sempre por tenant
src/lib/canais     formato canónico (Open Delivery) e adaptador do cardápio
src/lib/supabase   clientes, tipos, proxy de sessão
supabase           migrações SQL, seed
scripts            migrar, criar-operador
tests              vitest: domínio, cadeia e isolamento RLS em PGlite
```

```bash
pnpm install && cp .env.example .env.local   # preencher
pnpm migrar --seed && pnpm operador voce@equipe.com "senha" "Nome"
pnpm test && pnpm typecheck && pnpm build
pnpm test:e2e && pnpm test:e2e:console   # com o dev server a correr
pnpm dev
```
