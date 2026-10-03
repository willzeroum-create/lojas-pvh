# Operação — pôr a plataforma no ar

Este guia leva do zero a uma empresa com a página pública a receber pedidos e
a cadeia de produção a andar. Tempo estimado: 20 minutos na primeira vez.

## 1. Projecto Supabase

1. Criar um projecto em [supabase.com](https://supabase.com) (região
   `sa-east-1`, São Paulo). Guardar a **senha da base de dados** escolhida na
   criação: é precisa no passo 2.
2. Em **Project Settings → API Keys**, copiar o URL do projecto, a chave
   **publishable** (`sb_publishable_…`) e criar/revelar uma chave **secret**
   (`sb_secret_…`).
3. Em **Connect** (botão no topo do dashboard) → **Session pooler**, copiar a
   string de ligação e substituir `[YOUR-PASSWORD]` pela senha da base.
4. Em **Authentication → Providers → Email**, deixar _Email_ activo e
   desligar _Confirm email_ (os acessos são criados pela equipa, já
   confirmados).

## 2. Aplicação

```bash
cp .env.example .env.local
```

Preencher em `.env.local`:

| Variável                               | Onde está                                 |
| -------------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Project Settings → API Keys               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → Publishable |
| `SUPABASE_SECRET_KEY`                  | Project Settings → API Keys → Secret keys |
| `SUPABASE_DB_URL`                      | Connect → Session pooler (com a senha)    |
| `ANTHROPIC_API_KEY`                    | Só para o importador por foto; opcional   |

Depois:

```bash
pnpm install
pnpm migrar --seed
pnpm operador voce@equipe.com "uma-senha-forte" "Seu nome"
pnpm dev
```

`pnpm migrar` aplica `supabase/migrations/*.sql` por ordem, uma transacção por
ficheiro, e regista o que aplicou em `app.migracoes`. Correr outra vez só
aplica o que faltar; `pnpm migrar --listar` mostra o estado. Sem `--seed`
não cria o tenant de demonstração.

**Migrações novas num projecto já instalado:** colar no SQL Editor o ficheiro
`supabase/atualizacao-NNNN-NNNN.sql` correspondente (ou `pnpm migrar`, que só
aplica o que falta).

**Sem ligação directa à base** (ou na primeira vez, pelo dashboard): colar
`supabase/instalacao-completa.sql` no **SQL Editor** e correr. É a
concatenação das migrações, numa transacção só, e regista-as em
`app.migracoes` para o `pnpm migrar` saber que já estão aplicadas. Depois,
opcionalmente, `supabase/seed.sql`. Se uma instalação ficou a meio (erro a
meio do SQL Editor), usar `supabase/reinstalar-do-zero.sql`, que apaga as
tabelas da plataforma e instala de novo: só em projectos sem dados reais. Regenerar o ficheiro consolidado sempre
que houver uma migração nova (ver `scripts/`).

Abrir `http://localhost:3000/entrar`, entrar com o operador e ir a `/admin`.

## 3. Primeira empresa (o setup que se vende)

1. **Console → Novo tenant.** Nome, WhatsApp, endereço, e-mail e senha do
   dono. Anotar a senha para enviar ao cliente.
2. **Cadeia de produção.** Na ficha, _Cadeia_: responder ao diagnóstico
   ("já tem Instagram?", "já está no iFood?") marcando cada etapa como _Já
   tinha_, _Pendente_ ou _Não se aplica_. Anotar acessos e decisões nas notas
   de cada etapa. Tudo fica no histórico com autor e hora.
3. **Notas internas.** _Notas_ → _Nova nota_: o briefing da empresa em
   Markdown (contexto, combinado, acessos). Fixar no topo.
4. **Importar cardápio.** _Importar cardápio_: foto do cardápio de papel ou
   planilha. Rever a tabela e gravar. A etapa "Cardápio carregado" fica
   concluída sozinha.
5. **Entrar como.** Abre o painel do cliente sem senha. Ajustar horários,
   taxa de entrega, pedido mínimo, fotos dos produtos principais e logo.
6. **Ver a página** em `/{slug}`. Fazer um pedido de teste até ao WhatsApp.
7. Marcar "Página publicada" como concluída na cadeia (muda o `robots` para
   indexável) e, quando a cobrança estiver combinada, mudar o **estado** para
   `ativo` e preencher a **renovação** na ficha.

## 4. Cadeia de produção

A cadeia é o catálogo do que a equipa faz com cada empresa, em quatro
frentes: **lançamento** (as seis etapas do setup), **presença digital**
(Instagram, WhatsApp Business, Google Meu Negócio, Business Manager, site,
conteúdo, identidade visual), **canais** (WhatsApp, iFood, 99Food, outros,
entregadores) e **operação** (pagamentos, CNPJ e fiscal, estoque, ficha
técnica, análise).

- O catálogo vive em `src/lib/cadeia/modelo.ts`. Acrescentar uma etapa ali
  faz aparecer em todas as empresas na próxima abertura da cadeia.
- Etapas só de uma empresa criam-se no fim de cada frente (_Etapa só desta
  empresa_).
- Etapas marcadas _Fase 2, 3 ou 4_ diagnosticam-se já; a construção espera a
  fase, como manda o brief.
- Os seis pontinhos da lista de tenants são a frente de lançamento.

## 5. Arquivos: a biblioteca viva de cada empresa

Na ficha, _Arquivos_: fotos da fachada, dos produtos, logo, cardápio de
papel, documentos, por pastas. Largar os ficheiros na zona de envio ou
escolher vários de uma vez; fotos são reduzidas para WebP até 2000 px, o
resto sobe como está (até 25 MB). Tudo fica no bucket privado `arquivos`
e só quem tem o console vê, com links assinados de uma hora. Apagar remove
o ficheiro e o registo.

## 6. Vista de holding

Os cartões no topo de `/admin` são portas: **Pedidos hoje** abre
`/admin/pedidos` (todos os pedidos, por empresa e cliente, com período
hoje/ontem/7 dias), **Etapas em aberto** abre `/admin/cadeia` (pendente e
em curso em todas as empresas, com prazos) e **Empresas ativas** filtra a
lista. Cada empresa tem _Abrir painel_ para entrar por impersonação.

## 7. Equipa

O primeiro operador é criado por `pnpm operador will "senha" "Will"`. Os
seguintes criam-se no console, em **Equipa**: nome, e-mail ou nome de
usuário, e senha. A equipa entra com o nome de usuário ("will"); por baixo,
o Supabase Auth guarda `will@equipe.pvh.local`, um domínio que não existe e
nunca recebe correio (por isso os operadores não recebem links por e-mail;
os donos, que entram com e-mail real, sim). Um operador vê todas as
empresas e entra em qualquer painel; _Remover acesso_ tira-o do console sem
apagar o utilizador. A vista de holding no topo de `/admin` soma pedidos do
dia, etapas em aberto e renovações de todas as empresas.

## 8. Verificação dos critérios de aceitação (brief §10)

| #   | Critério                                     | Como verificar                                                     |
| --- | -------------------------------------------- | ------------------------------------------------------------------ |
| 1   | Tenant novo com página no ar em < 30 min     | Cronometrar o passo 3                                              |
| 2   | Pedido até ao WhatsApp em < 1 min, sem conta | Telemóvel, página pública, carrinho, checkout                      |
| 3   | Pedido aparece no painel com som             | Painel → Pedidos → _Ligar som_; fazer um pedido noutro dispositivo |
| 4   | Esgotado some da página em < 5 s             | Painel → Cardápio → interruptor; recarregar a página pública       |
| 5   | Modelo suporta canal, opções e multi-loja    | `supabase/migrations/0001_esquema.sql`                             |
| 6   | Tenants isolados em todas as queries         | `pnpm test` (testes RLS em PGlite)                                 |

## 9. Rotina

- **Suspender por falta de pagamento:** ficha → estado `suspenso`. A página
  fica em modo reduzido (nome, telefone, endereço), nunca cai.
- **Cancelamento:** estado `cancelado`. A página deixa de existir. Antes,
  _Exportar dados_ e entregar o JSON ao cliente (inclui cadeia e notas).
- **Senha esquecida:** ficha → _Nova senha_ junto ao e-mail do dono, ou
  _Gerar link de acesso_ e enviar por WhatsApp: entra sem senha, vale uma
  vez e expira numa hora.
- **LGPD:** agendar `select public.anonimizar_pedidos(180);` com `pg_cron`
  quando houver volume (Database → Extensions → pg_cron).
- **Backups:** o Supabase faz backup diário no plano Pro; no Free, exportar
  periodicamente pelo console.

## 10. Comandos

Os testes E2E precisam do dev server a correr e criam pedidos chamados
"Teste E2E" na loja de demonstração (que fica aberta todos os dias para
isso); o teste do console cria e apaga uma empresa "Zanata E2E", um dono e um
operador descartáveis.

```bash
pnpm dev          # desenvolvimento
pnpm build        # build de produção
pnpm test         # vitest: domínio, cadeia e isolamento RLS (PGlite)
pnpm test:e2e     # Playwright: pedido completo na página pública (dev server + .env.local)
pnpm test:e2e:console  # Playwright: console, cadeia, notas, empresa nova, painel, tempo real
pnpm diagnostico  # Playwright: todos os ecrãs em telemóvel, tablet e computador (ver §10.1)
pnpm typecheck    # tsc
pnpm lint         # eslint
pnpm format       # prettier
pnpm migrar       # aplica migrações ao projecto Supabase (--seed, --listar)
pnpm operador     # cria o primeiro operador
pnpm tipos        # regenera src/lib/supabase/tipos.ts a partir do projecto ligado (CLI)
```

### 10.1 Diagnóstico de responsividade e fluidez

`pnpm diagnostico` abre os 25 ecrãs (página pública, entrada, console e
painel por impersonação) em três larguras e, para cada um, mede tempo até ao
servidor responder e até ao `load`, overflow horizontal, erros de consola,
pedidos falhados, alvos de toque abaixo de 36 px, texto abaixo de 12 px,
imagens sem `alt`, botões sem nome e campos sem rótulo. Depois cronometra,
dentro da página, abrir a folha de um produto, o carrinho, o passo de
entrega e duas navegações. Deixa screenshots de página inteira e
`relatorio.md` em `.diagnostico/` (ou em `DIAG_SAIDA`). Cria e apaga um
operador descartável; não altera dados.

Para medir o que o utilizador final sente, correr contra a build de
produção: `pnpm build && pnpm start -- -p 3001` noutro terminal e
`E2E_URL=http://localhost:3001 pnpm diagnostico`. O dev server compila cada
rota na primeira abertura e mede-se muito mais lento do que é.

## 11. Deploy

A produção está em **https://lojas-pvh.vercel.app** (projecto `lojas-pvh` na
Vercel). Para republicar a partir desta pasta, com a CLI da Vercel
autenticada (`vercel login` uma vez):

```bash
vercel link --yes --scope willzeroum-7239s-projects --project lojas-pvh  # só na primeira vez nesta máquina
pnpm env:vercel   # envia as variáveis de .env.local (produção e preview), sem as mostrar
pnpm deploy       # build e publicação em produção
```

O nome do projecto tem de ser explícito porque a pasta tem um espaço no
nome. `pnpm env:vercel` não envia `SUPABASE_DB_URL` (só serve para migrar a
partir da máquina da equipa) nem `NEXT_PUBLIC_URL_BASE`: na Vercel o
endereço público vem de `VERCEL_PROJECT_PRODUCTION_URL`. Para um domínio
próprio, definir `NEXT_PUBLIC_URL_BASE` na Vercel com esse domínio.

Qualquer outro host Node 22+ serve: definir as variáveis de `.env.example`
e `NEXT_PUBLIC_URL_BASE`. O `proxy.ts` corre no runtime Node; não precisa
de configuração extra. Para medir a produção: `E2E_URL=https://lojas-pvh.vercel.app pnpm diagnostico`.
