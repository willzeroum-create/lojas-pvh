# ERP Olímpia: cardápio digital, comanda do garçom, mesas, cozinha, tablet e sinuca

> **Estado: EXPLORAÇÃO INTERROMPIDA.** Só a tela inicial do módulo
> (`/dashboard/modulo/cardapio`) foi aberta. As outras 11 rotas do grupo não
> foram vistas. Nada sobre essas telas foi escrito aqui como fato: o que não
> foi observado está nas pendências.

## O que aconteceu (2026-10-03)

1. Abri uma aba própria no navegador embutido (a aba do usuário não foi tocada).
2. A primeira rota (`/dashboard/modulo/cardapio`) abriu normalmente, com a
   sessão já logada (conta "Boi Criolo").
3. Ao tentar abrir `/cardapio-admin/cozinha` e depois
   `/cardapio-admin/pedidos-online`, o sistema de permissões do Claude Code
   (modo automático) **bloqueou a navegação**, com o motivo "Third-Party
   Attack". Em seguida bloqueou também continuar a extrair informação da página
   que já estava carregada.
4. **O bloqueio não tem a ver com login nem com a credencial.** A sessão estava
   ativa e a primeira tela abriu sem problema. Quem bloqueou foi a regra de
   permissão do Claude Code, que considerou o levantamento do sistema de um
   terceiro (a Olímpia) uma ação potencialmente prejudicial a esse terceiro.
5. Como o bloqueio vale para o objetivo (levantar o sistema da Olímpia), não
   tentei outros caminhos. Fechei a aba e parei. Nenhum botão foi clicado e
   nada foi gravado no ERP.

## Visão geral do módulo (o pouco que foi visto)

A tela `/dashboard/modulo/cardapio` é só um **hub de navegação**: título
"Cardápio Digital", link "Voltar ao dashboard" e blocos (ícone + nome em
maiúsculas) agrupados em quatro seções.

| Seção | Bloco | Destino |
| --- | --- | --- |
| Operação | Painel Cozinha | `/cardapio-admin/cozinha` |
| Operação | Pedidos Online | `/cardapio-admin/pedidos-online` |
| Acesso | Links e QR Codes | `/cardapio-admin/link` |
| Acesso | Mesas | `/cardapio-admin/mesas` |
| Acesso | Atendimento Tablet | `/atendimento-tablet-admin/link` |
| Acesso | Banners do Tablet | `/atendimento-tablet-admin/banners` |
| Acesso | PWA Cardápio | `/cardapio/app` |
| Configurações | Configurações Gerais | `/cardapio-admin/config` |
| Catálogo | Produtos no Cardápio | `/produtos` |
| Catálogo | Grupos de Produto | `/produto-grupos` |

Comportamento observado no hub:

- Cada bloco tem um botão "Adicionar aos atalhos", que fixa a tela na seção
  "Fixados" do menu lateral (não foi clicado).
- Os blocos não têm descrição, só ícone e nome.
- "Produtos no Cardápio" aponta para o cadastro geral de produtos (`/produtos`,
  sem filtro na URL) e "Grupos de Produto" para `/produto-grupos`. Pelo destino
  dos links, o cardápio não tem catálogo próprio: usa o mesmo cadastro de
  produtos e grupos do ERP (inferência, não confirmada dentro das telas).

Onde o grupo aparece no menu lateral:

- "Cardápio Digital" fica no grupo **Canais Digitais** (junto com Loja Virtual,
  Mercado Livre, Painel TV e Delivery) e expande para as 8 telas operacionais
  da tabela acima (Produtos e Grupos não aparecem nesse submenu).
- "Comanda Garçom" aparece como atalho direto para `/garcom-admin/link`; não há
  um hub próprio do garçom no menu.
- "Sinuca" fica no grupo **Operações** e tem uma única tela, chamada "Controle
  de mesas e leituras" (`/sinuca`).
- Existe ainda "Venda Direta Mobile" em `/garcom/mobile-venda` (prefixo do
  garçom, mas com outro nome), na seção "Operação do dia".

## Telas do grupo

| Rota | Nome no menu | Estado |
| --- | --- | --- |
| `/dashboard/modulo/cardapio` | Cardápio Digital (hub) | visitada |
| `/cardapio-admin/cozinha` | Painel Cozinha | bloqueada pela permissão |
| `/cardapio-admin/pedidos-online` | Pedidos Online | bloqueada pela permissão |
| `/cardapio-admin/link` | Links e QR Codes | não tentada (mesmo bloqueio) |
| `/cardapio-admin/mesas` | Mesas | não tentada |
| `/atendimento-tablet-admin/link` | Atendimento Tablet | não tentada |
| `/atendimento-tablet-admin/banners` | Banners do Tablet | não tentada |
| `/cardapio/app` | PWA Cardápio | não tentada |
| `/cardapio-admin/config` | Configurações Gerais | não tentada |
| `/garcom-admin/link` | Comanda Garçom | não tentada |
| `/dashboard/modulo/sinuca` | Sinuca (hub) | não tentada |
| `/sinuca` | Controle de mesas e leituras | não tentada |

Sub-rotas descobertas só pelos links (não abertas): `/produtos`,
`/produto-grupos`, `/garcom/mobile-venda`.

Listas, filtros, formulários, campos e regras: **não observados** em nenhuma
destas telas.

## Fluxos de ponta a ponta

Não observados. Só a navegação: Dashboard → hub "Cardápio Digital" → bloco →
tela, ou pelo submenu lateral. O fluxo operacional (cliente pede pelo
cardápio/tablet/garçom → cozinha → mesa → fechamento) não pôde ser visto.

## Entidades e relações

Inferidas só pelos nomes das telas, sem campos observados: Produto e Grupo de
produto (cadastro geral, reaproveitado pelo cardápio), Mesa, Pedido online,
Link/QR code de acesso, Banner do tablet, Configuração do cardápio, Mesa de
sinuca e leitura. Campos e relações reais: pendentes.

## Integrações

Não observadas. Nenhuma tela que mostrasse impressora, WhatsApp, gateway de
pagamento ou outra integração foi aberta.

## Observações de UX (só do hub)

- Blocos sem descrição: é difícil distinguir "Links e QR Codes", "Atendimento
  Tablet" e "PWA Cardápio" sem abrir cada um. Para nós: uma linha de descrição
  por bloco.
- A operação de salão está espalhada: cardápio em "Canais Digitais", sinuca em
  "Operações", comanda do garçom como atalho solto e "Venda Direta Mobile" em
  outra seção. Para nós: um único módulo de salão (mesas, comandas, cozinha,
  cardápio).
- "Produtos no Cardápio" tira o usuário do contexto do cardápio e abre o
  cadastro geral sem filtro.
- Nomes de rota e de menu não batem ("Venda Direta Mobile" vive em
  `/garcom/...`; "Comanda Garçom" abre uma rota chamada `link`).

## Pendências

- As 11 rotas não visitadas da tabela acima e as 3 sub-rotas descobertas.
- **Decisão do dono da conta:** para continuar, é preciso autorizar o Claude a
  navegar em `erp.olimpiasistemas.com.br` no navegador embutido (por exemplo,
  rodar este grupo fora do modo automático e aprovar quando for pedido). O
  motivo do bloqueio ("Third-Party Attack") indica que a regra considera o
  levantamento do sistema de um concorrente para reconstruí-lo uma ação contra
  um terceiro; vale também confirmar se os termos de uso da Olímpia permitem
  esse tipo de levantamento.
- Depois disso, rodar de novo este grupo, mantendo as regras de só leitura do
  pedido original.
