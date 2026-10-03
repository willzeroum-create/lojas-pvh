# 04 — Cardápio digital, comanda do garçom, mesas, cozinha, tablet e sinuca (ERP Olímpia)

> Cobre o módulo "Cardápio Digital" (hub, painel da cozinha, pedidos online,
> links e QR codes, mesas, atendimento por tablet, configurações e o PWA do
> cliente), a comanda do garçom (link de gestão e PWA) e o módulo Sinuca.
> Exploração de 2026-10-03, conta de teste "Boi Criolo" (plano Full, perfil ADMIN).
> Legenda de certeza: [visto], [visto em parte], [deduzido], [afirmado pelo
> manual], [código] (lido no HTML/JS da página), [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

**O que o módulo faz [deduzido dos nomes e do manual].** Atendimento de salão:
o cliente abre o cardápio pelo QR code da mesa e faz o pedido; o garçom lança
itens pelo PWA; a cozinha acompanha num painel; há atendimento por tablet com
banners e um canal de "pedidos online". A sinuca é um módulo à parte (controle de
mesas e leituras). Quase todas as telas de gestão ficaram por abrir (ver 1.4);
o que se sabe vem do hub, dos PWAs públicos, do manual e dos avisos globais.

**Onde fica no menu [visto].**

- "Cardápio Digital" fica na seção **Canais Digitais** (com Loja Virtual,
  Mercado Livre, Painel TV e Delivery). O submenu tem as 8 telas operacionais
  do hub (Painel Cozinha, Pedidos Online, Links e QR Codes, Mesas, Atendimento
  Tablet, Banners do Tablet, PWA, Configurações); "Produtos no Cardápio" e
  "Grupos de Produto" não aparecem no submenu.
- "Comanda Garçom" é um atalho direto para `/garcom-admin/link`; não há hub
  próprio do garçom no menu.
- "Sinuca" fica na seção **Operações** e tem uma única tela, "Controle de mesas
  e leituras" (`/sinuca`).
- "Venda Direta Mobile" (`/garcom/mobile-venda`, seção "Operação do dia") usa o
  prefixo do garçom, mas é outra tela: fica em [02-vendas-pdv.md](02-vendas-pdv.md).
- O menu completo tem 27 módulos em 7 seções; a tabela está em
  [22-manual.md](22-manual.md).

**Plano [visto em parte].** Na tela de troca de plano (ver
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)), o plano
Premium (R$ 499,90, 25 módulos) é resumido como "omnicanal: loja, cardápio,
Mercado Livre, delivery...". Entre os 36 módulos do Full aparecem "Comanda
Digital / Cardápio" e "sinuca". [deduzido, hipótese da ordem dos módulos] Os dois
entrariam a partir do Premium.

### 1.1 Hub `/dashboard/modulo/cardapio` em resumo

Dez blocos em quatro seções (detalhe na seção 2.1): Operação (Painel Cozinha,
Pedidos Online), Acesso (Links e QR Codes, Mesas, Atendimento Tablet, Banners do
Tablet, PWA Cardápio), Configurações (Configurações Gerais) e Catálogo (Produtos
no Cardápio, Grupos de Produto).

### 1.2 Catálogo único [visto nos links; deduzido]

"Produtos no Cardápio" aponta para o cadastro geral `/produtos` (sem filtro na
URL) e "Grupos de Produto" para `/produto-grupos`. O mesmo cadastro aparece como
"Produtos na Loja" e "Produtos" (Mercado Livre), e "Grupos de Produto" aparece
nos menus da Loja Virtual, do Cardápio, do Painel TV e de Cadastros. O cardápio
não tem catálogo próprio. Telas de produtos e grupos: ver
[07-produtos.md](07-produtos.md) (o grupo tem campo "Ordem", que talvez ordene as
categorias no cardápio; o subgrupo tem foto).

### 1.3 Avisos globais e parâmetros que tocam o salão

- **Aviso "Cardápio digital" [visto; código].** Em todas as páginas do ERP há um
  modal de "chamado do salão" com mesa, data/hora e detalhes. Chega por consulta
  periódica ao servidor (endpoints `/erp/notificacoes/cardapio/…`) e **toca um
  som**. O sino tem uma seção "Cardápio digital" com link para o painel da
  cozinha e "Marcar lidas". [deduzido; a confirmar] Pode ser a forma como os
  pedidos e chamados do cardápio chegam ao operador. Também existe o modal
  "Novo pedido WhatsApp" (pedidos do "Agente de Vendas IA", com botão de
  confirmar recebimento), cuja relação com os pedidos online do cardápio não foi
  vista. A camada global completa (sino, polling, pop-ups) está descrita em
  [22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas).
- **Parâmetros do PDV ligados ao salão [visto; detalhe em
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md) e
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)]:**
  - nos parâmetros da empresa (grupo PDV): "Comanda", extrato de mesa no
    fechamento, couvert (valor) e taxa de serviço (%);
  - grupo "Consulta / Diversos": impressão agrupada de mesas e as credenciais
    (e-mail e senha) do "Olimpia Comanda" [a verificar: provavelmente um app de
    comanda à parte];
  - nos parâmetros do sistema (aba PDV): "Imprimir CP/NF direto (ficha bar)" e
    "Abrir tela de mesas automaticamente" (Não/Sim).
  - [deduzido] O PDV tem (ou herdou do desktop) uma tela de mesas própria; não se
    sabe como ela se relaciona com `/cardapio-admin/mesas`.

### 1.4 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/cardapio` | Cardápio Digital (hub) | lida |
| `/cardapio-admin/cozinha` | Painel Cozinha | recusada |
| `/cardapio-admin/pedidos-online` | Pedidos Online | recusada |
| `/cardapio-admin/link` | Links e QR Codes | não aberta |
| `/cardapio-admin/mesas` | Mesas | não aberta |
| `/cardapio-admin/config` | Configurações Gerais | não aberta |
| `/atendimento-tablet-admin/link` | Atendimento Tablet | não aberta |
| `/atendimento-tablet-admin/banners` | Banners do Tablet | não aberta |
| `/cardapio/app` → `/cardapio/v/{slug}/app` | PWA Cardápio (instalação) | só login (página de instalação) |
| `/cardapio/v/{slug}` → `/cardapio/v/{slug}/sem-mesa` | Cardápio público | só login (só a página "sem mesa") |
| `/garcom-admin/link` | Comanda Garçom | não aberta |
| `/garcom/app` → `/garcom/v/{slug}/login` | PWA do garçom | só login |
| `/dashboard/modulo/sinuca` | Sinuca (hub) | não aberta |
| `/sinuca` | Controle de mesas e leituras | não aberta |

Fora deste documento: `/garcom/mobile-venda` (Venda Direta Mobile, ver
[02-vendas-pdv.md](02-vendas-pdv.md)); `/produtos` e `/produto-grupos` (ver
[07-produtos.md](07-produtos.md)). Na conta de teste, `{slug}` é `boi-criolo`.

## 2. Telas

### 2.1 `/dashboard/modulo/cardapio` — Cardápio Digital (hub) [visto]

Título "Cardápio Digital", link "Voltar ao dashboard" e blocos (ícone + nome em
maiúsculas) em quatro seções:

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

- Cada bloco tem o botão "Adicionar aos atalhos", que fixa a tela na seção
  "Fixados" do menu lateral (não clicado).
- Os blocos não têm descrição, só ícone e nome.
- Não há lista, filtro, formulário nem número (pedidos do dia, mesas ocupadas).

### 2.2 `/cardapio-admin/cozinha` — Painel Cozinha [recusada]

A navegação foi recusada pelo classificador do modo automático do Claude Code
("Third-Party Attack") na primeira passagem; numa passagem posterior a rota não
chegou a ser tentada. Nada visto.

**O que se sabe por outras fontes:**
- [afirmado pelo manual] "Cozinha e PDV recebem em tempo real" os pedidos do
  cardápio; o garçom "acompanha a cozinha" pelo PWA.
- [visto] O sino tem a seção "Cardápio digital" com link para o painel da
  cozinha, e o aviso do cardápio toca som.

**Perguntas a responder:**
- Como os pedidos aparecem (cartão por pedido ou por item); estados (novo, em
  preparo, pronto, entregue) e quem muda o estado.
- Separação por setor (cozinha, bar, chapa), tempo de preparo, alerta de atraso,
  aviso sonoro.
- Impressão automática do pedido e tipo de impressora (há o parâmetro "Imprimir
  CP/NF direto (ficha bar)" e o agente local Bridge para impressoras, ver
  [17-consultoria-ia.md](17-consultoria-ia.md)).
- De onde vêm os pedidos: comanda do garçom, cardápio digital, tablet, delivery,
  PDV. O "tempo real" do manual é polling (como os outros avisos) ou outra coisa?
- Ligação com o Painel TV (pedidos prontos na TV?), ver
  [01-dashboard-bi-tv.md](01-dashboard-bi-tv.md).

### 2.3 `/cardapio-admin/pedidos-online` — Pedidos Online [recusada]

Navegação recusada pelo mesmo classificador ("Third-Party Attack"). Nada visto.

**O que se sabe por outras fontes:**
- [deduzido] Pelo endereço público, o cardápio só funciona com o QR de uma mesa
  (seção 2.9). Os pedidos "externos" (para viagem ou entrega) devem chegar por
  outro caminho e aparecer aqui [a confirmar].
- A Central de relatórios tem `cardapio-pedidos` (4 filtros, "pedidos do
  cardápio digital — mesa ou delivery"; só na Central, não no menu). Ou seja, o
  pedido do cardápio pode ser de mesa ou de delivery. Catálogo de relatórios:
  ver [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).

**Perguntas a responder:**
- Ciclo do pedido (recebido, aceito, em preparo, saiu para entrega, entregue,
  cancelado) e quem aceita.
- Como o cliente é avisado (WhatsApp?) e ligação com o modal global "Novo pedido
  WhatsApp".
- Pagamento online (gateway, PIX) ou na entrega; taxa de entrega; ligação com o
  Delivery ([05-delivery.md](05-delivery.md)).
- Se o pedido vira venda e NFC-e sozinho e se entra no caixa.

### 2.4 `/cardapio-admin/link` — Links e QR Codes [não aberta]

Não foi tentada (mesmo bloqueio das telas anteriores).

**O que se sabe:** [afirmado pelo manual] "mesas e QR codes no admin"; o QR da
mesa é a porta de entrada do cliente. A Loja Virtual tem uma tela de links sem
QR (ver [06](06-loja-virtual-mercado-livre.md)); o cardápio é o único canal
com "QR Codes" no nome.

**Perguntas a responder:**
- Link público do cardápio; QR geral ou por mesa; personalização (logo, cores);
  domínio próprio.
- Diferença entre link de mesa (consumo no local) e link de entrega ou retirada.
- Formato do endereço com mesa (o QR leva um token da mesa? ver 2.9).

### 2.5 `/cardapio-admin/mesas` — Mesas [não aberta]

**O que se sabe:** [afirmado pelo manual] as mesas são cadastradas no admin e
cada uma gera um QR code. [deduzido] Entidade Mesa com identificação e token do
QR.

**Perguntas a responder:** campos da mesa (número, nome, lugares, setor/salão),
estado (livre, ocupada, aguardando conta), abertura e fechamento de conta,
transferência e junção de mesas, ligação com a "tela de mesas" do PDV e com o
extrato de mesa no fechamento (parâmetro do PDV), couvert e taxa de serviço.

### 2.6 `/cardapio-admin/config` — Configurações Gerais [não aberta]

**Perguntas a responder:** horários, aparência (logo, cores), pedido mínimo,
formas de pagamento, se aceita pedido sem mesa, taxa de serviço, impressão,
chamar garçom, pedir a conta.

### 2.7 `/atendimento-tablet-admin/link` — Atendimento Tablet [não aberta]

**O que se sabe:** é um bloco da seção Acesso do hub. [deduzido] Um modo
quiosque/tablet de autoatendimento na mesa ou no balcão, com link próprio (o
padrão "link" das outras telas de acesso).

**Perguntas a responder:** como o tablet se liga à empresa e à mesa (link, QR,
código de pareamento), se é o mesmo cardápio do QR ou outra interface, se o
tablet fica preso a uma mesa, se exige login.

### 2.8 `/atendimento-tablet-admin/banners` — Banners do Tablet [não aberta]

**Perguntas a responder:** quantos banners, tamanhos, se rodam em carrossel com
tempo, link para produto, período de validade. Para comparação: a Loja Virtual
tem 3 slides de carrossel (1200×400) e 2 banners promocionais (600×200), ver
[06](06-loja-virtual-mercado-livre.md).

### 2.9 `/cardapio/app` → `/cardapio/v/{slug}/app` → `/cardapio/v/{slug}` → `/cardapio/v/{slug}/sem-mesa` — PWA e cardápio público [visto em parte]

Aberto a partir do botão "Abrir módulo" do cartão do manual (o botão leva ao app
**do cliente**, não à gestão).

- `/cardapio/app` redireciona para `/cardapio/v/{slug}/app`: página de
  instalação do PWA, com o botão "Abrir cardápio" [visto].
- "Abrir cardápio" leva a `/cardapio/v/{slug}`, que, **sem o QR de uma mesa**,
  redireciona para `/cardapio/v/{slug}/sem-mesa`: a página só pede para
  escanear o QR da mesa [visto].
- [deduzido] **O cardápio só funciona dentro do contexto de uma mesa**,
  identificada pelo QR. Não há navegação livre "para viagem" por esse endereço.
- O endereço público segue o padrão `/{app}/v/{slug-da-empresa}/...`, comum a
  todos os PWAs.
- Não se viu o cardápio por dentro (produtos, adicionais, carrinho, chamar
  garçom, pedir a conta).

### 2.10 `/garcom-admin/link` — Comanda Garçom [não aberta]

Atalho "Comanda Garçom" do menu. Não foi tentado.

**Perguntas a responder:** se é só a página com o link/QR do PWA do garçom (como
as outras telas "link") ou se tem gestão (garçons, permissões, comissão, mesas
atendidas); quem cria o acesso do garçom.

### 2.11 `/garcom/app` → `/garcom/v/{slug}/login` — PWA do garçom [só login]

- `/garcom/app` redireciona para `/garcom/v/{slug}/login` [visto].
- Login próprio com **Empresa** (lista, com "001 - BOI CRIOLO"), **Usuário**,
  **Senha** e "Entrar" (não clicado) [visto].
- Usa o **usuário do ERP**, mas não aproveita a sessão já aberta no ERP [visto].
  A lista de empresas antes de usuário e senha confirma o padrão multiempresa do
  login do ERP.
- [afirmado pelo manual] Abrir `/garcom/app` no celular, instalar como app,
  lançar itens na mesa e acompanhar a cozinha.
- Telas internas não vistas (exigem credenciais, que não foram usadas).

### 2.12 `/dashboard/modulo/sinuca` — Sinuca (hub) [não aberta]

Hub do módulo Sinuca (seção Operações do menu). O manual **não tem cartão** para
a sinuca. Nada mais se sabe.

### 2.13 `/sinuca` — Controle de mesas e leituras [não aberta]

Única tela do módulo, pelo nome no menu. [deduzido] Controle de mesas de sinuca
cobradas por tempo ou por leitura (de ficha ou de contador).

**Perguntas a responder:** o que é uma "leitura" (tempo, fichas, contador da
mesa), como se cobra (por hora, por ficha), se lança na comanda/mesa do
cardápio ou do PDV, se tem cronômetro e histórico.

## 3. Fluxos de ponta a ponta

1. **Navegação [visto]:** Dashboard → hub "Cardápio Digital" → bloco → tela, ou
   pelo submenu lateral.
2. **Salão: cardápio, comanda e cozinha [afirmado pelo manual, salvo indicação]:**
   1. Cadastrar mesas e gerar os QR codes no admin.
   2. O cliente escaneia o QR e abre o cardápio da mesa (sem QR, a tela só pede
      para escanear [visto]).
   3. O pedido vai em tempo real para a cozinha e para o PDV.
   4. O garçom lança itens pelo PWA, com login do ERP [visto], e acompanha a
      cozinha.
   5. [a confirmar] O operador é avisado pelo modal "Cardápio digital" (com som)
      e pelo sino [visto o modal].
3. **Caminho completo ainda não visto [perguntas]:** pedido (balcão, comanda ou
   cardápio online) → cozinha → recebimento no caixa (ver
   [03-caixa.md](03-caixa.md)) → fechamento da mesa (extrato, couvert, taxa de
   serviço) → relatórios.

## 4. Entidades e relações

| Entidade | Campos (vistos ou prováveis) | Relações |
| --- | --- | --- |
| Produto / Grupo de produto | cadastro geral (ver [07](07-produtos.md)) | o cardápio usa o mesmo catálogo da loja, do Painel TV e do Mercado Livre |
| Mesa / QR | mesa, token do QR [deduzido] | o cardápio só abre com a mesa; 1–N pedidos [deduzido] |
| Pedido do cardápio | origem mesa ou delivery (pela descrição do relatório `cardapio-pedidos`) | [deduzido] vira venda (ver [02](02-vendas-pdv.md)); vai para a cozinha |
| Pedido online | não visto | relação com Delivery e WhatsApp a confirmar |
| Link / QR de acesso | não visto | por empresa (`{slug}`) e talvez por mesa |
| Banner do tablet | não visto | do atendimento por tablet |
| Configuração do cardápio | não vista | por empresa |
| Usuário do ERP (garçom) | empresa, usuário, senha | entra no ERP e no PWA do garçom |
| Notificação "Cardápio digital" | mesa, data/hora, detalhes, lida | aparece no sino e em modal com som |
| Mesa de sinuca / Leitura | não vistos | módulo Sinuca |

## 5. Integrações

- **PWA (instalação)** [visto]: cardápio do cliente e app do garçom, com
  endereço por empresa.
- **Impressora da cozinha** [a verificar]: parâmetro "ficha bar" e agente local
  Bridge (ver [17](17-consultoria-ia.md)); nenhuma tela do cardápio que mostre
  impressora foi aberta.
- **WhatsApp** [a verificar]: só o modal global "Novo pedido WhatsApp" do Agente
  de Vendas IA; ligação com o cardápio não vista.
- Gateway de pagamento: nada visto.
- [deduzido] Não aparece integração com iFood nem 99Food em nenhuma tela vista
  nem no manual.

## 6. Oportunidades de UX

1. **Blocos do hub sem descrição:** é difícil distinguir "Links e QR Codes",
   "Atendimento Tablet" e "PWA Cardápio" sem abrir cada um. [proposta] Uma
   linha de descrição por bloco e números úteis (pedidos abertos, mesas
   ocupadas).
2. **Operação de salão espalhada:** cardápio em "Canais Digitais", sinuca em
   "Operações", comanda do garçom como atalho solto e "Venda Direta Mobile" em
   "Operação do dia"; ainda há a tela de mesas do PDV e o "Olimpia Comanda" nos
   parâmetros. [proposta] Um único módulo de salão (mesas, comandas, cozinha,
   cardápio).
3. **"Produtos no Cardápio" tira o usuário do contexto** e abre o cadastro geral
   sem filtro.
4. **Nomes de rota e de menu não batem:** "Venda Direta Mobile" vive em
   `/garcom/...`; "Comanda Garçom" abre uma rota chamada `link`.
5. **Vale copiar:** o cardápio preso à mesa pelo QR evita pedido sem mesa no
   salão; os endereços públicos por empresa (`/{app}/v/{slug}`) e a página de
   instalação de cada PWA.
6. **Vários logins:** o garçom entra com empresa + usuário + senha do ERP; o
   entregador, o ponto e o colaborador têm outros logins, e o manual não explica
   quem cria essas credenciais. [proposta] Um acesso só para a equipe da loja
   (garçom, cozinha, entregador, ponto), com perfil e PIN, gerido numa tela
   "Equipe".
7. **Botão "Abrir módulo" do manual** leva ao app do cliente (cardápio), não à
   gestão, e abre outra aba.
8. **Aviso do cardápio por polling com som e modal** que interrompe qualquer
   tela. [proposta] Eventos em tempo real e um painel único de pedidos de todos
   os canais, com som configurável.

## 7. Pendências

- **Telas por abrir:** Painel Cozinha e Pedidos Online (recusadas); Links e QR
  Codes, Mesas, Configurações, Atendimento Tablet, Banners do Tablet, Comanda
  Garçom, hub e tela da Sinuca (não abertas). Interior do cardápio público e do
  PWA do garçom (exigem QR de mesa ou credenciais).
- **Recusas:** o classificador do modo automático do Claude Code recusou abrir
  `/cardapio-admin/cozinha` e `/cardapio-admin/pedidos-online` e, a seguir,
  continuar a extrair a página já carregada (motivo "Third-Party Attack"). Não
  foi problema de login nem de credencial: a sessão estava ativa e o hub abriu.
  Não houve outra tentativa por outro caminho; nada foi clicado nem gravado.
  Completar depende de o dono da conta autorizar a leitura (e de confirmar que os
  termos de uso da Olímpia permitem o levantamento).
- **Afirmações do manual não testadas:** "tempo real" entre cardápio, cozinha e
  PDV; o garçom acompanhar a cozinha.
- **Perguntas abertas:** ver as perguntas de cada tela (2.2 a 2.13); relação
  entre a tela de mesas do PDV, `/cardapio-admin/mesas`, o "Olimpia Comanda" e o
  PWA do garçom; se a sinuca lança consumo na mesa/comanda.
- **Ações vistas e não clicadas:** "Adicionar aos atalhos" (hub) e "Entrar" no
  PWA do garçom. O cardápio público só foi aberto pelo endereço, até a página
  "sem mesa".

## 8. Sub-rotas descobertas

| Rota | Origem | Situação |
| --- | --- | --- |
| `/cardapio/v/{slug}/app` | redirecionamento de `/cardapio/app` | lida (instalação) |
| `/cardapio/v/{slug}` → `/cardapio/v/{slug}/sem-mesa` | botão "Abrir cardápio" | lida ("sem mesa") |
| `/garcom/v/{slug}/login` | redirecionamento de `/garcom/app` | lida (login) |
| `/garcom/mobile-venda` | menu "Venda Direta Mobile" | ver [02](02-vendas-pdv.md) |
| `/produtos`, `/produto-grupos` | blocos do hub | ver [07](07-produtos.md) |
| `/erp/notificacoes/cardapio/…` | código da moldura | só no código |
| `/manual#mod-cardapio`, `/manual#mod-garcom` | cartões do manual | ver [22](22-manual.md) |
