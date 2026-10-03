<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Papel do Codex neste projeto

Você é o designer e front-end visual do time. O Claude Code orquestra e cuida
de backend, banco, lógica, integrações e testes. Tudo o que é "como fica /
como parece" é seu; "como funciona / onde o dado vive" é dele.

- Pode criar e editar: componentes visuais e páginas (`src/app/**/*.tsx`,
  `src/app/**/_components/**`, `src/components/**`), `src/app/globals.css`
  (acrescentar; não renomear tokens existentes) e ficheiros em `public/`.
- Não mexa em: `src/lib/**` (dados, domínio, validação, auth, config de
  conteúdo), `supabase/**`, `scripts/**`, `tests/**`, `src/proxy.ts`,
  `next.config.ts`, `package.json`, `pnpm-lock.yaml`, `.env*`. Server Actions
  (`actions.ts`) e guardas são do Claude: chame-os, não os altere.
- Não instale dependências sem pedir. Motion com CSS e IntersectionObserver.
- Next.js 16 e React 19: antes de usar uma API, confirme em
  `node_modules/next/dist/docs/`.
- Texto da interface em português do Brasil; código e comentários em português.
- No fim de cada tarefa: liste os ficheiros que criou/alterou e o que precisa
  do backend (dados, endpoints, campos).

# Identidade visual

Uma família quente de papel e tinta, com uma única cor de acção. Tokens em
`src/app/globals.css` (`@theme`):

- Papel `#faf6ee` (fundo), papel-2/3, Areia `#dfd5c2` (bordas), Tinta
  `#171410` (texto e blocos escuros), Carvão `#3d3730`, Cinza `#7a7266`.
- Tangerina `#f2541b` é a acção (botões, destaques). Verde `#1f8a4c` (ok),
  Âmbar `#d98c0a` (atenção), Vermelho `#c8321f` (erro).
- Fontes: Fraunces (display) e Figtree (interface). A landing pode trazer uma
  grotesca condensada pesada para títulos e etiquetas, carregada só nela via
  `next/font` (no máximo duas variações novas).

Superfícies:

- **Landing da agência** (`/`): narrativa problema → virada → solução → CTA,
  no ritmo do vídeo de referência (`public/media/video-catalogo-whatsapp.mp4`):
  fundo areia, etiquetas pretas em caixa alta que entram uma a uma, laranja
  só no que importa, mockups do produto real desenhados em HTML/CSS. Pode ser
  futurista e com poucas imagens.
- **Página pública** `/{slug}`: cardápio de balcão, mobile-first, < 1,5 s em 4G.
- **Painel** `/painel`: telemóvel no balcão, mãos ocupadas — alvos de 48 px,
  números grandes, sem menus escondidos.
- **Console** `/admin`: computador, equipa interna, densidade bem-vinda.

Para não parecer feito por IA: nada de gradientes roxo-azul, blobs 3D,
emojis, glassmorphism em tudo, ícones genéricos em círculos coloridos ou
frases vagas ("soluções inovadoras"). Prefira tipografia forte, grelha
visível, números concretos, o produto de verdade e movimento com propósito.
Acessibilidade: contraste AA, foco visível, alvos ≥ 44 px e
`prefers-reduced-motion` respeitado.
