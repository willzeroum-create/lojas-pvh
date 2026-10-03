# 20 — Relatórios de comissões e de ordens de serviço (ERP Olímpia)

> **Estado: EXPLORADO EM PARTE.** Feito em 2026-10-03, só leitura, na conta de teste
> "Boi Criolo" (plano Full).
>
> - **10 das 15 telas abriram** e todos os filtros delas foram lidos.
> - **5 telas não abriram.** A checagem de segurança do Claude Code (modo automático)
>   recusou a navegação. **Login e senha não foram o problema:** a sessão que já estava
>   aberta funcionou nas outras 10 telas.
> - **Nenhum relatório foi gerado.** Em todas as telas, a única ação é o botão "Gerar",
>   e esse botão está na lista de proibidos desta pesquisa. Por isso o conteúdo de cada
>   relatório (colunas e totais) foi **deduzido** da frase de explicação que aparece na
>   tela. Os filtros, as opções e os códigos internos foram **vistos** na tela.

## Em uma frase

O grupo serve só para consultar dados: são 15 relatórios do tipo "filtros + Gerar" sobre
dois assuntos. O primeiro é quanto cada colaborador ganha de comissão (em vendas, em
ordens de serviço e no recebimento das parcelas). O segundo é como estão as ordens de
serviço (por período, status, técnico e cliente, peças, serviços, abertas e faturadas).
Nenhuma destas telas cria ou edita registros: os dados vêm dos módulos de Vendas, Ordem
de Serviço (OS) e Financeiro.

---

## Visão geral do módulo

### Onde fica e moldura do sistema

- Todas as telas ficam em `/relatorios/<nome>`. Cada uma tem um botão "← Central" que
  leva à central de relatórios (`/relatorios`), que não foi visitada.
- Todas as telas usam a mesma moldura do ERP:
  - na barra de cima: busca de telas (Ctrl+K), "Novidades", escolha de tema visual,
    notificações, menu do usuário ("ADMIN");
  - num balão no canto: um assistente de conversa;
  - à esquerda: uma coluna de ícones **sem texto**, com atalhos para Venda Balcão, Venda
    PDV, Venda Direta Mobile, Caixa, Ordem de Serviço, Mensalidades, Produtos, Clientes,
    Consulta Cliente, Gestão Loja Virtual, Cardápio Digital, Comanda Garçom, API Força de
    Vendas, Visitas de rota e Ponto Eletrônico.

### O que todas as telas do grupo têm

1. **Título** e uma linha que explica o que o relatório mostra.
2. **Um cartão de filtros**, com:
   - **Período:** "Data inicial" e "Data final", no campo de data do próprio navegador.
     Nas duas telas vistas em imagem, o período já vinha do dia 1 do mês até hoje
     (01/10/2026 a 03/10/2026). As outras devem seguir o mesmo padrão.
   - **Campos de pesquisa com lupa** para Colaborador, Cliente, Produto, Serviço e
     Técnico. É uma caixa de texto com o aviso "Clique na lupa para pesquisar..." e um
     botão de lupa que abre uma janela de pesquisa (explicada abaixo). O aviso dá a
     entender que a escolha é feita pela lupa, e não digitando na caixa.
   - **Listas de opções** (status, tipo, origem etc.). A opção de "todos" vem
     selecionada por padrão.
   - **Campos de texto livre** em alguns relatórios: "Nº OS" e "Placa".
3. **Um único botão, "Gerar"**, que envia os filtros. Antes de gerar não há botão de
   exportar, imprimir, guardar filtros ou agendar.

Nenhum campo mostra sinal de obrigatório.

### Janela de pesquisa (lupa)

Foi vista no filtro Colaborador de "Comissões por recebimento":

- Título "Pesquisar — Colaborador / Vendedor".
- Um campo para pesquisar por código ou descrição e um botão "Buscar".
- Uma tabela com as colunas **Código, Nome e CPF/CNPJ**.
- No rodapé: "Página X de Y (N registros)", os botões Anterior/Próximo e "Fechar".
- A janela **abre vazia** e mostra "nenhum registro encontrado" até alguém clicar em
  "Buscar". A lista não carrega sozinha.
- O clique em "Buscar" foi recusado pela checagem de segurança e não foi refeito. Por
  isso não se sabe se a conta tem colaboradores cadastrados. As janelas de Cliente,
  Produto, Serviço e Técnico não foram abertas. O mais provável é que sejam a mesma
  janela, cada uma com as colunas do seu cadastro.

### Mapa das 15 telas

| # | Rota | Título na tela | Estado | Filtros (além do período) |
|---|---|---|---|---|
| 1 | `/relatorios/comissoes-por-recebimento` | Comissões por recebimento | lida | Colaborador, Cliente, Origem, Status do título, Filtrar data por |
| 2 | `/relatorios/comissoes-venda-analitico` | Comissões de vendas — analítico | lida | Colaborador, Cliente, Produto, Status |
| 3 | `/relatorios/comissoes-venda-colaborador` | — | **não abriu** (permissão) | — |
| 4 | `/relatorios/comissoes-servicos` | Comissões de serviços (OS) | lida | Colaborador, Cliente, Serviço, Status OS, Nº OS |
| 5 | `/relatorios/comissoes-vendas-pecas-os` | — | **não abriu** (permissão) | — |
| 6 | `/relatorios/comissoes-os-analitico` | Comissões de OS — analítico | lida | Colaborador, Cliente, Tipo, Nº OS, Status OS |
| 7 | `/relatorios/comissoes-os-colaborador` | Comissões de OS — por colaborador | lida | Colaborador, Tipo, Status OS |
| 8 | `/relatorios/os-periodo` | OS por período | lida | Cliente, Técnico responsável, Placa, Status OS, Financeiro |
| 9 | `/relatorios/os-por-status` | OS por status | lida | Cliente, Técnico responsável |
| 10 | `/relatorios/os-por-tecnico` | — | **não abriu** (permissão) | — |
| 11 | `/relatorios/os-por-cliente` | — | **não abriu** (permissão) | — |
| 12 | `/relatorios/os-servicos-executados` | Serviços executados na OS | lida | Cliente, Técnico (item), Serviço, Status OS, Nº OS |
| 13 | `/relatorios/os-pecas-utilizadas` | Peças utilizadas na OS | lida | Cliente, Técnico (item), Produto, Nº OS, Status OS |
| 14 | `/relatorios/os-abertas` | OS abertas | lida | Cliente, Técnico responsável, Placa |
| 15 | `/relatorios/os-faturadas` | — | **não abriu** (permissão) | — |

### Códigos internos que as telas mostram

As listas de opções carregam o valor que é enviado ao servidor. Esses valores mostram
como o sistema guarda os estados.

| Conceito | Valores vistos |
|---|---|
| Status da OS | `0` Aberta · `1` Fechada · `2` Cancelada |
| Status da venda | `0` Orçamento · `1` Venda · `2` Cancelada · `todos` |
| Status do título a receber | `0` aberto · `1` pago (não há opção para "parcial" nem para "cancelado") |
| Origem do título a receber | `venda` · `os` (vazio = os dois) |
| Data usada para filtrar títulos | `movimento` (padrão, mistura pagamento, vencimento e emissão) · `pagamento` · `vencimento` · `emissao` |
| Tipo de item da OS | `peca` · `servico` (vazio = os dois) |
| Situação financeira da OS | `1` com títulos a receber · `0` sem títulos |

---

## Telas

### 1. Comissões por recebimento — `/relatorios/comissoes-por-recebimento`

**Para que serve:** mostra a comissão que ficou gravada em cada parcela a receber criada
por vendas e por OS. Serve para pagar o colaborador à medida que o cliente paga (comissão
"por recebimento", ou seja, regime de caixa).

**Filtros (vistos na tela)**

| Campo | Tipo | Opções e comportamento |
|---|---|---|
| Data inicial / Data final | data | padrão: do dia 1 do mês até hoje |
| Colaborador | lupa | janela "Colaborador / Vendedor" com Código, Nome e CPF/CNPJ |
| Cliente | lupa | — |
| Origem | lista | Vendas e OS (padrão) · Somente vendas · Somente OS |
| Status do título | lista | Abertos e pagos (padrão) · Somente abertos · Somente pagos |
| Filtrar data por | lista | Pagamento / vencimento / emissão (padrão) · Somente data de pagamento · Somente vencimento · Somente emissão do título |

Ação: **Gerar** (não clicado).

**O que o relatório mostra (deduzido da frase da tela):** a parcela, o colaborador, o
percentual e o valor da comissão. A frase da tela cita o nome da coluna do banco de dados
(`valor_comissao`).

**Regras que a tela deixa ver**

- A comissão fica **gravada no título a receber**: cada parcela guarda o colaborador, o
  percentual e o valor. Ela não é calculada só na hora de gerar o relatório. Isso indica
  que, quando a venda ou a OS cria as parcelas, a comissão já é dividida entre elas.
- Vendas e OS usam o mesmo contas a receber. O campo "origem" diz de onde veio cada
  título.
- O título tem só dois estados: aberto e pago. Não há opção para pagamento parcial
  (pendência).
- Para responder "quanto pago de comissão este mês?", os filtros certos seriam "Somente
  pagos" com "Somente data de pagamento". O padrão, que mistura as três datas, dá uma
  visão geral, mas não deixa claro qual data foi usada em cada linha.

### 2. Comissões de vendas — analítico — `/relatorios/comissoes-venda-analitico`

**Para que serve:** mostra a comissão de cada item vendido: o produto, quem vendeu, o
percentual e o valor calculado.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Cliente | lupa | — |
| Produto | lupa | — |
| Status | lista | Vendas (padrão) · Orçamentos · Canceladas · Todos |

**Regras que a tela deixa ver**

- A comissão é calculada **por item** (produto), e não só pelo total da venda. Assim, o
  percentual pode mudar de um produto para outro ou de um vendedor para outro. Falta
  descobrir onde ele é configurado (pendência).
- Orçamento e venda são **o mesmo documento** em estados diferentes: 0 = orçamento,
  1 = venda, 2 = cancelada. Com isso dá para prever a comissão de orçamentos ainda
  abertos e conferir a comissão de vendas canceladas.
- Por padrão, só entram vendas concluídas. É a comissão "por venda" (regime de
  competência), diferente da tela 1.

### 3. Comissões de vendas por colaborador — `/relatorios/comissoes-venda-colaborador`

**Não abriu.** A checagem de segurança recusou a navegação, e nada foi visto. Pelo nome e
pelo par das telas 6 e 7, deve ser o resumo por colaborador da tela 2. Isso precisa ser
confirmado.

### 4. Comissões de serviços (OS) — `/relatorios/comissoes-servicos`

**Para que serve:** mostra a comissão "geral" sobre os serviços lançados nas OS: o
colaborador, o serviço, o percentual e o valor.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Cliente | lupa | — |
| Serviço | lupa | — |
| Status OS | lista | Todos (padrão) · Aberta · Fechada · Cancelada |
| Nº OS | texto | número da OS |

**Regras que a tela deixa ver**

- Serviço é um cadastro próprio, separado de Produto, e é escolhido pela lupa.
- A palavra "geral" sugere um percentual padrão (do serviço ou do colaborador) aplicado
  aos serviços. Ele seria diferente da comissão item a item da tela 6. Precisa ser
  confirmado.
- Também entram OS abertas e canceladas. O sistema não separa sozinho a comissão
  "prevista" da "realizada": quem decide é quem escolhe os filtros.

### 5. Comissões de vendas de peças em OS — `/relatorios/comissoes-vendas-pecas-os`

**Não abriu.** A checagem de segurança recusou a navegação, e nada foi visto.

### 6. Comissões de OS — analítico — `/relatorios/comissoes-os-analitico`

**Para que serve:** mostra a comissão de cada item das OS, tanto peças como serviços, com
o colaborador, o percentual e o valor.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Cliente | lupa | — |
| Tipo | lista | Peças e serviços (padrão) · Somente peças · Somente serviços |
| Nº OS | texto | — |
| Status OS | lista | Todos (padrão) · Aberta · Fechada · Cancelada |

**Regras que a tela deixa ver:** cada item da OS é uma peça ou um serviço, tem um
colaborador e guarda o seu percentual e o seu valor de comissão.

### 7. Comissões de OS — por colaborador — `/relatorios/comissoes-os-colaborador`

**Para que serve:** é o resumo da tela 6. Mostra o total de comissão de cada colaborador,
com peças e serviços separados.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Tipo | lista | Peças e serviços (padrão) · Somente peças · Somente serviços |
| Status OS | lista | Todos (padrão) · Aberta · Fechada · Cancelada |

Este relatório não tem filtro de Cliente nem de Nº OS. O uso mais provável é o
fechamento do mês do técnico ou mecânico.

### 8. OS por período — `/relatorios/os-periodo`

**Para que serve:** lista detalhada das OS do período, com cliente, veículo, técnico e
totais.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Cliente | lupa | — |
| Técnico responsável | lupa | — |
| Placa | texto | placa do veículo |
| Status OS | lista | Todos (padrão) · Aberta · Fechada · Cancelada |
| Financeiro | lista | Todas (padrão) · Com títulos a receber · Sem títulos |

**Regras que a tela deixa ver**

- A OS tem **veículo e placa**. O módulo de OS foi feito pensando em oficina mecânica ou
  em negócios parecidos.
- O cabeçalho da OS tem um **técnico responsável**. Ele não é o mesmo técnico de cada
  item (ver telas 12 e 13).
- Uma OS pode ter gerado **títulos a receber** ou não. O filtro "Financeiro" ajuda a
  encontrar OS fechadas que não viraram cobrança, ou OS com pagamento adiantado.
  Precisa ser confirmado.

### 9. OS por status — `/relatorios/os-por-status`

**Para que serve:** resumo das OS do período agrupadas por status, com quantidade e
valores.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Cliente | lupa | — |
| Técnico responsável | lupa | — |

O status não é um filtro porque é ele que agrupa o relatório. O resultado deve ter uma
linha por status (Aberta, Fechada, Cancelada), com a quantidade e a soma dos valores
(deduzido).

### 10. OS por técnico — `/relatorios/os-por-tecnico`

**Não abriu.** A checagem de segurança recusou a navegação, e nada foi visto.

### 11. OS por cliente — `/relatorios/os-por-cliente`

**Não abriu.** A checagem de segurança recusou a navegação, e nada foi visto.

### 12. Serviços executados na OS — `/relatorios/os-servicos-executados`

**Para que serve:** mostra os serviços lançados nas OS, com quantidade, valores e
técnico.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Cliente | lupa | — |
| Técnico (item) | lupa | técnico de cada linha de serviço |
| Serviço | lupa | — |
| Status OS | lista | Todos (padrão) · Aberta · Fechada (sem "Cancelada") |
| Nº OS | texto | — |

**Regras que a tela deixa ver:** cada linha de serviço tem **o seu próprio técnico**.
Numa mesma OS, técnicos diferentes podem fazer serviços diferentes. "Cancelada" não
aparece como opção, e não se sabe se a opção "Todos" inclui as OS canceladas.

### 13. Peças utilizadas na OS — `/relatorios/os-pecas-utilizadas`

**Para que serve:** mostra as peças lançadas nas OS, com produto, quantidade, valores e
técnico.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Cliente | lupa | — |
| Técnico (item) | lupa | — |
| Produto | lupa | — |
| Nº OS | texto | — |
| Status OS | lista | Todos (padrão) · Aberta · Fechada |

**Regras que a tela deixa ver:** a peça é um **Produto** do cadastro geral, o mesmo
usado nas vendas. Isso sugere que a OS dá baixa no estoque (precisa ser confirmado).
Cada peça também tem o seu técnico.

### 14. OS abertas — `/relatorios/os-abertas`

**Para que serve:** mostra as OS em aberto (status 0), há quantos dias estão abertas e
os valores.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | padrão: mês corrente (visto em imagem) |
| Cliente | lupa | — |
| Técnico responsável | lupa | — |
| Placa | texto | — |

**Regras que a tela deixa ver**

- "Dias em aberto" deve ser a data de hoje menos a data de abertura (deduzido). É um
  relatório de envelhecimento das OS.
- **Cuidado:** o período já vem com o mês corrente. Se esse filtro valer para a data de
  abertura, as OS abertas há mais tempo ficam de fora, e são justamente as mais
  urgentes. Precisa ser confirmado.
- A frase da tela mostra o código interno do status ("status 0").

### 15. OS faturadas — `/relatorios/os-faturadas`

**Não abriu.** A checagem de segurança recusou a navegação, e nada foi visto.

---

## Fluxos de ponta a ponta (deduzidos dos filtros)

### A. Comissão de venda

1. O colaborador lança um orçamento ou uma venda (Venda Balcão, PDV, Venda Direta Mobile
   ou Força de Vendas).
2. Cada item guarda o colaborador, o percentual e o valor da comissão (tela 2).
3. O orçamento (0) vira venda (1) ou é cancelado (2). A comissão segue o estado do
   documento.
4. A venda cria os títulos a receber (parcelas), e a comissão é dividida entre elas
   (tela 1, origem "venda").
5. O cliente paga no caixa ou no financeiro, e o título passa para "pago".
6. No fechamento, o gestor usa "Comissões por recebimento" (somente pagos, pela data de
   pagamento) se paga pelo recebimento, ou "Comissões de vendas" (status Vendas) se paga
   pela venda.
7. O pagamento da comissão ao colaborador não aparece neste grupo. Não há botão de
   "pagar comissão" nem ligação visível com o contas a pagar (pendência).

### B. Ordem de serviço (oficina)

1. Abre-se a OS para um cliente, com veículo (placa) e técnico responsável. Ela fica com
   status Aberta (0).
2. São lançadas peças (produtos) e serviços. Cada item tem o seu técnico, a quantidade,
   o valor e a comissão.
3. O andamento é acompanhado em "OS abertas" (dias em aberto), "OS por status" e "OS por
   período".
4. A OS é fechada (1), criando ou não títulos a receber, ou é cancelada (2).
5. A OS cobrada aparece em "Financeiro: com títulos a receber" e, provavelmente, em "OS
   faturadas" (tela que não abriu).
6. As comissões aparecem item a item (tela 6), por colaborador (tela 7), nos serviços
   (tela 4) e no recebimento das parcelas da OS (tela 1, origem "OS").
7. A operação é analisada em "Serviços executados" (tela 12) e "Peças utilizadas"
   (tela 13), por técnico, cliente, serviço ou produto.

### C. Fechamento mensal de comissões (como o gestor deve usar as telas)

1. Escolher o regime da empresa: comissão pela venda ou pelo recebimento. O ERP não diz
   qual é o regime: é o usuário que precisa saber qual relatório usar.
2. Gerar o resumo por colaborador (telas 3 e 7), conferir no detalhado (telas 2 e 6) e,
   se for regime de caixa, cruzar com "Comissões por recebimento" (tela 1).
3. Pagar o colaborador fora destas telas.

---

## Entidades e relações (deduzidas)

| Entidade | Campos que aparecem ou se deduzem | Relações |
|---|---|---|
| **Colaborador** (pessoa no papel de vendedor ou técnico) | código, nome, CPF/CNPJ | vende itens de venda; é técnico responsável da OS; é técnico de itens da OS; recebe a comissão nos títulos |
| **Cliente** (pessoa) | código, nome, CPF/CNPJ (presumido) | tem várias vendas, OS e títulos |
| **Produto** | código, descrição | é item de venda; é peça na OS |
| **Serviço** | código, descrição, talvez um % de comissão "geral" | é item de serviço na OS |
| **Venda** (documento único para orçamento e venda) | número, data, cliente, status 0/1/2 | tem vários itens; cria vários títulos (origem "venda") |
| **Item de venda** | produto, quantidade, valor, colaborador, % de comissão, valor da comissão | pertence a uma venda; aponta um produto e um colaborador |
| **Ordem de serviço** | Nº OS, data de abertura (e, presumivelmente, de fechamento), cliente, placa ou veículo, técnico responsável, status 0/1/2, totais, dias em aberto (calculado), se tem títulos | tem vários itens; cria vários títulos (origem "os") |
| **Item da OS** | tipo (peça ou serviço), produto ou serviço, quantidade, valores, técnico do item, colaborador, % e valor da comissão | pertence a uma OS; aponta um produto ou um serviço; aponta um técnico |
| **Veículo** | placa | não se sabe se é um cadastro próprio ou só um campo da OS |
| **Título a receber** (parcela) | origem (venda ou OS), documento de origem, cliente, parcela, emissão, vencimento, pagamento, status 0/1, colaborador, % e valor da comissão | pertence a uma venda ou OS; aponta o colaborador que recebe a comissão |

## Regras de negócio em resumo

- **Há dois regimes de comissão no sistema:** pela venda ou execução (competência, telas
  2, 4, 6 e 7) e pelo recebimento (caixa, tela 1).
- A comissão fica **gravada no item** (da venda e da OS) e **copiada para as parcelas**
  a receber, já dividida.
- O percentual pode mudar por item (produto ou serviço). O termo "comissão geral" sugere
  que também existe um percentual padrão.
- **O técnico aparece em dois níveis:** o responsável pela OS (no cabeçalho) e o técnico
  de cada peça ou serviço.
- **Os estados usam números:** OS e venda usam 0/1/2, e o título usa 0/1 (sem estado
  parcial). Orçamento e venda são o mesmo documento.
- **O período padrão é sempre o mês corrente**, inclusive em "OS abertas".
- Nas telas vistas, o filtro "Status OS" oferece "Cancelada" nos relatórios de comissão
  e de OS por período, mas não nos de serviços executados e peças utilizadas.

## Integrações

- **Nenhuma integração externa aparece nestas telas.** Não há SEFAZ, banco, gateway,
  WhatsApp, impressora, balança nem TEF.
- **Dependências dentro do ERP:** Vendas (balcão, PDV, mobile, força de vendas), Ordem de
  Serviço, Financeiro (contas a receber e caixa) e os cadastros de pessoas, produtos e
  serviços.
- "OS faturadas" pode envolver nota fiscal (NFS-e para serviço, NF-e para peças), mas
  isso não foi visto porque a tela não abriu.
- O formato de saída dos relatórios (tela, PDF, impressão, planilha) não foi visto,
  porque nenhum relatório foi gerado.

---

## Observações de UX: oportunidades para nós

1. **São 15 telas quase iguais.** Os relatórios de comissão poderiam ser uma só tela
   "Comissões", com escolha de agrupamento (colaborador, cliente, produto ou serviço,
   documento) e uma chave "resumo/detalhado". Os de OS poderiam ser uma só tela "Ordens
   de serviço", com agrupamento por status, técnico ou cliente. O poder é o mesmo, com
   menos menus.
2. **Escolher uma pessoa custa três cliques e uma janela:** a lupa, depois "Buscar" (a
   janela abre vazia) e depois a linha. Uma busca que completa enquanto se digita,
   direto no campo, resolve isso.
3. **O layout dos filtros é irregular.** Os rótulos dos campos de lupa ficam mais altos
   que os das datas. O aviso aparece cortado ("Clique na lup…") em campos estreitos. Os
   ícones da barra lateral não têm texto.
4. **A tela mostra termos técnicos ao usuário:** o nome de coluna `valor_comissao` e
   "status 0". Para nós, a interface deve usar só linguagem de negócio.
5. **"OS abertas" com o período do mês corrente** pode esconder as OS mais antigas. Um
   relatório de pendências deve mostrar, por padrão, tudo o que está em aberto, ordenado
   por dias em aberto.
6. **O filtro "Filtrar data por" é ambíguo:** o padrão mistura três datas. Para nós: a
   data deve ser escolhida de forma explícita, com uma explicação curta. Para "comissão a
   pagar", o padrão deve ser a data de pagamento.
7. **O regime de comissão fica por conta do usuário,** que precisa saber se usa o
   relatório "por venda" ou "por recebimento". Para nós: configurar o regime uma vez
   (por empresa ou por colaborador) e oferecer um só "Extrato de comissões do
   colaborador", que já aplica a regra certa.
8. **O ciclo não se fecha:** não há como marcar a comissão como paga nem criar o
   pagamento ao colaborador. Para nós: um fechamento de comissões que gera o contas a
   pagar e trava o período já pago.
9. **Tudo depende do botão "Gerar".** Não há resultado ao vivo, filtros guardados,
   favoritos nem agendamento por e-mail ou WhatsApp. Para nós: resultado que atualiza
   sozinho, exportação para CSV e PDF, filtros guardados e envio programado.
10. **O status não é igual em todas as telas:** algumas oferecem "Cancelada" e outras
    não. Para nós: o mesmo conjunto de estados em todas as telas, mostrado como etiquetas
    coloridas.
11. **A OS é amarrada à oficina** (placa, veículo). No nosso ERP modular, o "objeto da
    OS" deve ser configurável (veículo, equipamento, imóvel, nenhum), e o módulo só deve
    aparecer para quem o usa. Para os comerciantes de alimentação atuais, ele nem
    aparece.
12. **Permissões:** não se viu se um colaborador consegue ver só as suas próprias
    comissões. Para nós: um "Minhas comissões" com acesso restrito, além da visão do
    gestor.

---

## Pendências

1. **5 telas não abriram** porque a checagem de segurança do Claude Code (modo
   automático) recusou a navegação: `/relatorios/comissoes-venda-colaborador`,
   `/relatorios/comissoes-vendas-pecas-os`, `/relatorios/os-por-tecnico`,
   `/relatorios/os-por-cliente` e `/relatorios/os-faturadas`. Em quatro casos o motivo
   dado foi "Third-Party Attack". Num deles não veio motivo. Nenhuma foi tentada de novo
   nem por outro caminho.
2. **O conteúdo dos relatórios não foi visto** (colunas, totais, agrupamentos, botões de
   exportar e imprimir), porque "Gerar" está na lista de botões proibidos desta
   pesquisa. As colunas citadas acima foram deduzidas da frase de cada tela.
3. **O resultado da janela de pesquisa não foi visto.** O clique em "Buscar" foi recusado
   pela checagem de segurança. Só se viu a estrutura da janela de Colaborador. As
   janelas de Cliente, Produto, Serviço e Técnico não foram abertas.
4. **A estrutura interna das páginas não foi lida.** A leitura por script foi recusada
   pela checagem de segurança. Os nomes dos parâmetros enviados não foram confirmados;
   só se sabem os valores das opções.
5. **Não visitadas:** a central de relatórios (`/relatorios`) e o painel do módulo de OS
   (`/dashboard/modulo/os`).
6. **Perguntas que continuam abertas:**
   - Onde se configura o percentual de comissão (colaborador, produto, serviço, grupo,
     tabela)? A comissão sobre desconto ou sobre o valor líquido é tratada?
   - O que acontece com a comissão quando a venda é cancelada ou devolvida, ou quando a
     parcela é renegociada?
   - "Fechada" é o mesmo que "faturada"? O que muda em "OS faturadas"?
   - Qual data o período usa em cada relatório de OS: abertura, fechamento ou
     faturamento?
   - Como é contado "dias em aberto"?
   - A OS dá baixa no estoque das peças? Em que momento?
   - O pagamento parcial de um título conta como "aberto" ou "pago" para a comissão?
   - Como o relatório é entregue (tela, PDF, planilha) e se há impressão?
   - Que permissão de usuário libera cada relatório?

## Como completar (decisão do usuário)

- **Não é preciso mandar a credencial de novo.** O login funcionou: as 10 telas lidas
  abriram com a sessão "Boi Criolo" que já estava no navegador.
- O que barrou as 5 telas foi a **checagem de segurança do Claude Code**, não o ERP. Só
  o usuário pode liberar: rodando este grupo no modo normal de permissões e aprovando
  quando aparecer o pedido, ou liberando a navegação do navegador embutido nas
  configurações do Claude Code. Este agente não mudou nenhuma permissão nem
  configuração.
- Para ver as colunas dos relatórios, o orquestrador precisa permitir de forma explícita
  o botão "Gerar" **nos relatórios**, que só consultam dados. Hoje "Gerar" está proibido
  em todo o lado.
- No ERP nada foi gravado, alterado, enviado nem apagado. A aba usada foi fechada no
  fim.
