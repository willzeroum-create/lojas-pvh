@AGENTS.md

# Projecto

Plataforma multi-tenant para pequenos comerciantes de alimentação (Brasil):
página pública com cardápio e pedido por WhatsApp, painel do comerciante e
console da equipa com a cadeia de produção de cada empresa.

- Regras de domínio e vocabulário: `.claude/skills/dominio-produto/SKILL.md`
- Brief e fases: `docs/brief.md` (só a Fase 1 está construída; fases 2 a 4 têm
  o modelo preparado, sem ecrãs)
- Decisões e modelo de dados: `docs/plano-fase-1.md`
- Pôr no ar, operar, testar: `docs/operacao.md`

## Verificar antes de dar por concluído

```bash
pnpm test && pnpm typecheck && pnpm lint && pnpm build
pnpm test:e2e && pnpm test:e2e:console   # com o dev server a correr e .env.local preenchido
pnpm diagnostico                          # responsividade e fluidez de todos os ecrãs (ver docs/operacao.md §10.1)
```

## Convenções

- Código e comentários em português; interface em português do Brasil.
- Toda a leitura de dados passa por `src/lib/dados/*` com `tenantId` explícito;
  a RLS é a rede de segurança, provada em `tests/bd/rls.test.ts` (PGlite).
- Lógica pura em `src/lib/dominio` e `src/lib/cadeia`, sem React nem Supabase.
- Migrações só se acrescentam (`supabase/migrations/NNNN_*.sql`); depois
  correr `pnpm sql:completo` e actualizar `src/lib/supabase/tipos.ts`.
- `.env.local` é privado e não deve ser lido; `pnpm env:verificar` diz o que
  está preenchido sem mostrar valores.
