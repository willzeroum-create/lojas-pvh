# 20 — Relatórios de comissões e de ordens de serviço (ERP Olímpia)

> Os 15 relatórios de comissões (`comissoes-*`) e de ordens de serviço (`os-*`) da
> Central de Relatórios. Exploração só de leitura em 2026-10-03, na conta de teste
> "Boi Criolo" (plano Full, perfil ADMIN), em duas passagens: na primeira abriram 10
> telas; as outras 5 abriram numa passagem posterior. **Os filtros das 15 telas foram
> vistos; nenhum relatório foi gerado** ("Gerar" está na lista de proibidos), por isso
> colunas e totais são deduzidos da frase de cada tela e do cartão da Central.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual], [código]
> (lido no HTML/JS da página), [proposta]; [a verificar] marca dúvida em aberto. Nada
> foi gravado no ERP.

## 1. Visão geral

**Em uma frase.** O grupo serve só para consultar dados: são 15 relatórios do tipo
"filtros + Gerar" sobre dois assuntos. O primeiro é quanto cada colaborador ganha de
comissão (em vendas, em ordens de serviço e no recebimento das parcelas). O segundo é
como estão as ordens de serviço (por período, status, técnico e cliente, peças,
serviços, abertas e faturadas). Nenhuma destas telas cria ou edita registros: os dados
vêm dos módulos de Vendas ([02-vendas-pdv.md](02-vendas-pdv.md)), Ordem de Serviço
([14-os-forca-vendas.md](14-os-forca-vendas.md)) e Financeiro
([11-financeiro-bancos.md](11-financeiro-bancos.md)).

**Moldura e comportamento comum.** Estas telas usam a moldura comum a todos os
relatórios (cabeçalho com título, frase e "← Central"; um cartão de filtros que é um
formulário GET para a própria rota com `executar=1`; período `de`/`ate` com padrão do
dia 1 do mês até hoje; lupas; um único botão "Gerar"; nenhum campo obrigatório; nada
de exportar ou imprimir antes de gerar). Essa moldura, a janela de pesquisa (lupa) e a
sua API (`/lookups/...`), a Central, os Processamentos e os códigos genéricos estão
descritos em [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).
Aqui fica só o que é próprio deste grupo.

**Onde se chega a estas telas [visto]:**

- **Central de Relatórios** (`/relatorios`, ver 19): categoria **Comissões** (7
  relatórios) e categoria **Ordem de Serviço** (`categoria=os`, 8 relatórios). Na
  Central, o filtro "Comissões" devolve só os 7 de comissão. Os 15 estão também no
  menu (nenhum é "só Central").
- **Hub de relatórios** (`/dashboard/modulo/relatorios`, ver 19): grupo "Comissões"
  com 8 cartões, dos quais o 1.º é "Comissão por metas" (`/comissoes/metas`, tela
  descrita em [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md));
  grupo "Ordem de Serviço" com 8 cartões.
- **Hub do módulo OS** (`/dashboard/modulo/os`, ver 14): bloco "Relatórios" com a
  Central e 8 cartões (OS por período, OS abertas, Serviços executados, Peças
  utilizadas, Comissões de serviços, Comissões por recebimento, Comissões vendas +
  peças, Comissões de OS). O grupo "Ordem de Serviço" do menu lateral tem mais 4 que
  não estão no hub: OS por status, OS por técnico, OS por cliente e OS faturadas.
- **Botão "Comissões"** no cabeçalho de `/os-admin` → `comissoes-os-analitico` (ver
  14).
- **Busca de telas (Ctrl+K):** mostra o grupo de cada tela, por exemplo "Relatórios ·
  Comissões".
- No menu, o grupo "Comissões" nomeia dois deles de forma curta: "Vendas — por
  colaborador" e "Vendas + peças OS".

**Padrões deste grupo [visto]:**

- O período padrão é sempre o mês corrente (01/10/2026 a 03/10/2026), inclusive em
  "OS abertas".
- A contagem de filtros que a Central anuncia (as duas datas contadas em separado)
  bate com os campos vistos nas 15 telas.
- Os campos de texto livre deste grupo são "Nº OS" e "Placa".
- Nenhum campo mostra sinal de obrigatório.

### 1.1 Rotas e estado

| # | Rota | Título na tela | Nome no hub / menu | Central (filtros) | Estado | Filtros (além do período) |
|---|---|---|---|---|---|---|
| 1 | `/relatorios/comissoes-por-recebimento` | Comissões por recebimento | "Comissões por recebimento" (hub OS) | Comissões (7) | lida (filtros; lupa Colaborador aberta) | Colaborador, Cliente, Origem, Status do título, Filtrar data por |
| 2 | `/relatorios/comissoes-venda-analitico` | Comissões de vendas — analítico | — | Comissões (6) | lida (filtros) | Colaborador, Cliente, Produto, Status |
| 3 | `/relatorios/comissoes-venda-colaborador` | Comissões de vendas — por colaborador | "Vendas — por colaborador" (menu Comissões) | Comissões (4) | lida (filtros, nomes internos e lupa) na 2.ª passagem; recusada na 1.ª | Colaborador, Status |
| 4 | `/relatorios/comissoes-servicos` | Comissões de serviços (OS) | "Comissões de serviços" (hub OS) | Comissões (7) | lida (filtros) | Colaborador, Cliente, Serviço, Status OS, Nº OS |
| 5 | `/relatorios/comissoes-vendas-pecas-os` | Comissões vendas + peças OS | "Comissões vendas + peças" (hub OS); "Vendas + peças OS" (menu Comissões) | Comissões (5) | lida (filtros, nomes internos e lupas) na 2.ª passagem; recusada na 1.ª | Colaborador, Cliente, Origem |
| 6 | `/relatorios/comissoes-os-analitico` | Comissões de OS — analítico | "Comissões de OS" (hub OS); botão "Comissões" de `/os-admin` | Comissões (7) | lida (filtros) | Colaborador, Cliente, Tipo, Nº OS, Status OS |
| 7 | `/relatorios/comissoes-os-colaborador` | Comissões de OS — por colaborador | — | Comissões (5) | lida (filtros) | Colaborador, Tipo, Status OS |
| 8 | `/relatorios/os-periodo` | OS por período | "OS por período" (hub OS) | Ordem de Serviço (7) | lida (filtros) | Cliente, Técnico responsável, Placa, Status OS, Financeiro |
| 9 | `/relatorios/os-por-status` | OS por status | menu lateral OS | Ordem de Serviço (4) | lida (filtros) | Cliente, Técnico responsável |
| 10 | `/relatorios/os-por-tecnico` | OS por técnico | menu lateral OS | Ordem de Serviço (4) | lida (filtros, nomes internos; lupa de técnico aberta e pesquisada) na 2.ª passagem; recusada na 1.ª | Técnico responsável, Status OS |
| 11 | `/relatorios/os-por-cliente` | OS por cliente | menu lateral OS | Ordem de Serviço (4) | lida (filtros, nomes internos; lupa de cliente aberta, seleção e limpeza testadas) na 2.ª passagem; recusada na 1.ª | Cliente, Status OS |
| 12 | `/relatorios/os-servicos-executados` | Serviços executados na OS | "Serviços executados" (hub OS) | Ordem de Serviço (7) | lida (filtros) | Cliente, Técnico (item), Serviço, Status OS, Nº OS |
| 13 | `/relatorios/os-pecas-utilizadas` | Peças utilizadas na OS | "Peças utilizadas" (hub OS) | Ordem de Serviço (7) | lida (filtros) | Cliente, Técnico (item), Produto, Nº OS, Status OS |
| 14 | `/relatorios/os-abertas` | OS abertas | "OS abertas" (hub OS) | Ordem de Serviço (5) | lida (filtros) | Cliente, Técnico responsável, Placa |
| 15 | `/relatorios/os-faturadas` | OS faturadas (com títulos) | menu lateral OS | Ordem de Serviço (6) | lida (filtros, nomes internos) na 2.ª passagem; recusada na 1.ª | Cliente, Técnico responsável, Placa, Status do título |

Em todas as 15, o resultado do relatório **não foi visto**. Nas telas 1, 2, 4, 6, 7, 8,
9, 12, 13 e 14 (1.ª passagem) a leitura por script foi recusada: os nomes internos dos
campos não foram confirmados, só os valores das opções. Nas telas 3, 5, 10, 11 e 15 os
nomes internos foram lidos ([código]); o mais provável é que as outras sigam o mesmo
padrão [deduzido].

### 1.2 Códigos e parâmetros deste grupo [visto]

As listas de opções carregam o valor que vai ao servidor. Esses valores mostram como o
sistema guarda os estados.

| Conceito | Parâmetro (onde lido) | Valores vistos |
|---|---|---|
| Período | `de`, `ate` | AAAA-MM-DD; padrão do dia 1 do mês até hoje |
| Status da OS (relatórios de comissão de OS e OS por período) | `status` | `0` Aberta · `1` Fechada · `2` Cancelada (vazio = Todos) |
| Status da OS (os-por-tecnico, os-por-cliente, os-servicos-executados, os-pecas-utilizadas) | `status` | vazio = Todos · `0` Aberta · `1` Fechada. Cancelada (`2`) e Quitado (`4`) existem na OS (ver 14), mas não são oferecidos aqui |
| Status da venda | `status` | `0` Orçamento · `1` Venda (padrão nas comissões de venda) · `2` Cancelada · `todos` |
| Status do título a receber (comissoes-por-recebimento) | — | `0` aberto · `1` pago (não há "parcial" nem "cancelado") |
| Status do título (os-faturadas) | `status` | vazio = Todos os títulos · `0` com título em aberto · `1` com título quitado |
| Origem do título a receber (comissoes-por-recebimento) | — | `venda` · `os` (vazio = os dois) |
| Origem da comissão (comissoes-vendas-pecas-os) | `origem` | `venda` · `peca_os` (vazio = as duas) |
| Data usada para filtrar títulos | — | `movimento` (padrão, mistura pagamento, vencimento e emissão) · `pagamento` · `vencimento` · `emissao` |
| Tipo de item da OS | — | `peca` · `servico` (vazio = os dois) |
| Situação financeira da OS (os-periodo) | — | `1` com títulos a receber · `0` sem títulos |
| Pessoas e cadastros | `id_colaborador`, `id_cliente`, `id_tecnico` | ID escolhido pela lupa |
| Placa | `placa` | texto livre |

O nome do parâmetro `status` muda de sentido conforme a tela (estado da OS, da venda ou
do título).

### 1.3 Lupas usadas neste grupo [visto]

A janela de pesquisa e a sua API são as genéricas (ver 19). Neste grupo:

| Filtro | Tipo de lupa | Campo enviado | Título da janela | Colunas | Registros na conta |
|---|---|---|---|---|---|
| Colaborador (comissões) | `pessoa_colaborador` | `id_colaborador` | "Pesquisar — Colaborador / Vendedor" | Código, Nome, CPF/CNPJ | **0** |
| Técnico responsável (os-por-tecnico, os-faturadas) | `pessoa_colaborador` | `id_tecnico` | "Pesquisar — Colaborador / Vendedor" | Código, Nome, CPF/CNPJ | **0** |
| Cliente (os-por-cliente, os-faturadas, comissoes-vendas-pecas-os) | `pessoa` (genérica) | `id_cliente` | "Pesquisar — Pessoa" | Código, Nome, CPF/CNPJ | 1 ("CONSUMIDOR FINAL", código 1, sem documento) |
| Produto (comissoes-venda-analitico, os-pecas-utilizadas) | `produto` [deduzido] | — | — | — | 0 (pela lupa de produto noutros relatórios) |
| Serviço, Técnico (item), Técnico responsável e Cliente das outras telas | não confirmado | — | não abertas | — | — |

- Na 1.ª passagem, a janela de Colaborador (em comissoes-por-recebimento) pareceu
  **abrir vazia** e o clique em "Buscar" foi recusado. Na 2.ª passagem ficou claro que
  a janela já abre com a primeira página carregada; estava vazia porque **a conta não
  tem nenhuma pessoa marcada como colaborador** ("Buscar" na lupa de técnico devolveu
  0 registros). Portanto não haveria técnico nem colaborador para escolher.
- A lupa "Cliente" é a genérica de Pessoa: mistura clientes, fornecedores e
  colaboradores, e o título da janela é "Pessoa", não "Cliente".
- **Teste feito em os-por-cliente:** um clique em "CONSUMIDOR FINAL" preencheu o filtro
  (ID 1 no campo escondido e o nome no campo visível); a janela fechou e apareceu o X;
  o X limpou os dois campos. Nada foi enviado.
- **Acessibilidade [código]:** o rótulo visível ("Técnico responsável") aponta para um
  ID que não existe (`f-id_tecnico`); o campo de verdade (`id_tecnico-display`) tem
  rótulo vazio. Um leitor de tela só anuncia a dica "Clique na lupa...".

### 1.4 Dados existentes na conta

A conta de teste não tem colaboradores, produtos, serviços nem OS (ver 14), e a única
pessoa é o registro padrão "CONSUMIDOR FINAL". Mesmo gerados, os relatórios sairiam
vazios.

## 2. Telas

Todas as telas seguem a moldura comum (ver 19). As seções abaixo registram só o que é
próprio de cada uma. Em todas, a única ação é **Gerar** (não clicado) e o link
"← Central".

### 2.1 `/relatorios/comissoes-por-recebimento` — Comissões por recebimento [visto]

**Para que serve:** mostra a comissão que ficou gravada em cada parcela a receber criada
por vendas e por OS. Serve para pagar o colaborador à medida que o cliente paga
(comissão "por recebimento", ou seja, regime de caixa).

**Filtros**

| Campo | Tipo | Opções e comportamento |
|---|---|---|
| Data inicial / Data final | data | padrão: do dia 1 do mês até hoje |
| Colaborador | lupa `pessoa_colaborador` | janela "Colaborador / Vendedor" com Código, Nome e CPF/CNPJ |
| Cliente | lupa | — |
| Origem | lista | Vendas e OS (padrão) · Somente vendas (`venda`) · Somente OS (`os`) |
| Status do título | lista | Abertos e pagos (padrão) · Somente abertos (`0`) · Somente pagos (`1`) |
| Filtrar data por | lista | Pagamento / vencimento / emissão (`movimento`, padrão) · Somente data de pagamento · Somente vencimento · Somente emissão do título |

**O que o relatório mostra [deduzido da frase da tela]:** a parcela, o colaborador, o
percentual e o valor da comissão. A frase da tela cita o nome da coluna do banco de
dados (`valor_comissao`).

**Regras que a tela deixa ver**

- A comissão fica **gravada no título a receber**: cada parcela guarda o colaborador, o
  percentual e o valor. Ela não é calculada só na hora de gerar o relatório. Isso indica
  que, quando a venda ou a OS cria as parcelas, a comissão já é dividida entre elas.
- Vendas e OS usam o mesmo contas a receber (ver 11). O campo "origem" diz de onde veio
  cada título.
- O título tem só dois estados: aberto e pago. Não há opção para pagamento parcial
  (pendência).
- Para responder "quanto pago de comissão este mês?", os filtros certos seriam "Somente
  pagos" com "Somente data de pagamento". O padrão, que mistura as três datas, dá uma
  visão geral, mas não deixa claro qual data foi usada em cada linha.
- Responde quase à mesma pergunta que "Vendas x recebimento por vendedor" e "Relatório
  caixa com vendedor" (ver 19 e [03-caixa.md](03-caixa.md)), que usam as mesmas
  parcelas.

### 2.2 `/relatorios/comissoes-venda-analitico` — Comissões de vendas — analítico [visto]

**Para que serve:** mostra a comissão de cada item vendido: o produto, quem vendeu, o
percentual e o valor calculado.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Cliente | lupa | — |
| Produto | lupa | — |
| Status | lista | Vendas (`1`, padrão) · Orçamentos (`0`) · Canceladas (`2`) · Todos (`todos`) |

**Regras que a tela deixa ver**

- A comissão é calculada **por item** (produto), e não só pelo total da venda. Assim, o
  percentual pode mudar de um produto para outro ou de um vendedor para outro (onde se
  configura: ver Pendências).
- Orçamento e venda são **o mesmo documento** em estados diferentes: 0 = orçamento,
  1 = venda, 2 = cancelada. Com isso dá para prever a comissão de orçamentos ainda
  abertos e conferir a comissão de vendas canceladas.
- Por padrão, só entram vendas concluídas. É a comissão "por venda" (regime de
  competência), diferente da tela 2.1.

### 2.3 `/relatorios/comissoes-venda-colaborador` — Comissões de vendas — por colaborador [visto]

**Para que serve:** resumo das comissões de vendas por colaborador, com quantidade de
itens e valores. Confirma o que se supunha antes de a tela abrir: é o resumo por
colaborador do analítico (2.2), como o par 2.6 / 2.7 é para a OS.

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Colaborador | `id_colaborador` | lupa `pessoa_colaborador` | — |
| Status | `status` | lista | **Vendas (`1`, padrão)** · Orçamentos (`0`) · Canceladas (`2`) · Todos |

**O que deve mostrar [deduzido]:** uma linha por colaborador, com quantidade de itens,
valor vendido (base) e valor da comissão.

**Regras**

- [visto] O padrão é só vendas concluídas: a comissão "por venda" (competência).
- [deduzido] O filtro "Orçamentos" dá a **comissão prevista** do que ainda não fechou. O
  filtro "Canceladas" serve para conferir estornos.
- Não tem filtro de Cliente nem de Produto (o analítico tem).

### 2.4 `/relatorios/comissoes-servicos` — Comissões de serviços (OS) [visto]

**Para que serve:** mostra a comissão "geral" sobre os serviços lançados nas OS: o
colaborador, o serviço, o percentual e o valor.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Cliente | lupa | — |
| Serviço | lupa | — |
| Status OS | lista | Todos (padrão) · Aberta (`0`) · Fechada (`1`) · Cancelada (`2`) |
| Nº OS | texto | número da OS |

**Regras que a tela deixa ver**

- Serviço é um cadastro próprio, separado de Produto (`/servicos`, ver 14), e é
  escolhido pela lupa. O cadastro de serviços tem uma coluna **Comissão %**, e a Central
  tem o relatório `servicos-cadastrados` ("serviços com valor e % de comissão", ver 19).
- A palavra "geral" sugere um percentual padrão (do serviço ou do colaborador) aplicado
  aos serviços. Ele seria diferente da comissão item a item da tela 2.6 [a verificar].
- Também entram OS abertas e canceladas. O sistema não separa sozinho a comissão
  "prevista" da "realizada": quem decide é quem escolhe os filtros.

### 2.5 `/relatorios/comissoes-vendas-pecas-os` — Comissões vendas + peças OS [visto]

**Para que serve:** num só relatório, a comissão de vendas e a das **peças** lançadas em
OS, com origem, colaborador, percentual e valor.

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Colaborador | `id_colaborador` | lupa `pessoa_colaborador` | — |
| Cliente | `id_cliente` | lupa `pessoa` | — |
| Origem | `origem` | lista | **Vendas e peças OS (padrão, vazio)** · Somente vendas (`venda`) · Somente peças OS (`peca_os`) |

**Regras**

- [deduzido] Peça vendida pela OS e produto vendido no balcão pagam comissão do mesmo
  modo, porque os dois são "produto". O serviço de OS fica de fora: tem relatório
  próprio (2.4).
- [visto] Este relatório **não tem filtro de status**, ao contrário de todos os outros
  de comissão. [a verificar] Se entram vendas canceladas, orçamentos e OS abertas ou
  canceladas.

### 2.6 `/relatorios/comissoes-os-analitico` — Comissões de OS — analítico [visto]

**Para que serve:** mostra a comissão de cada item das OS, tanto peças como serviços, com
o colaborador, o percentual e o valor. É o destino do botão "Comissões" de `/os-admin`
(ver 14).

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Cliente | lupa | — |
| Tipo | lista | Peças e serviços (padrão) · Somente peças (`peca`) · Somente serviços (`servico`) |
| Nº OS | texto | — |
| Status OS | lista | Todos (padrão) · Aberta · Fechada · Cancelada |

**Regras que a tela deixa ver:** cada item da OS é uma peça ou um serviço, tem um
colaborador e guarda o seu percentual e o seu valor de comissão. No formulário da OS
(ver 14), cada linha de peça e de serviço tem a coluna "Colaborador".

### 2.7 `/relatorios/comissoes-os-colaborador` — Comissões de OS — por colaborador [visto]

**Para que serve:** é o resumo da tela 2.6. Mostra o total de comissão de cada
colaborador, com peças e serviços separados.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Colaborador | lupa | — |
| Tipo | lista | Peças e serviços (padrão) · Somente peças · Somente serviços |
| Status OS | lista | Todos (padrão) · Aberta · Fechada · Cancelada |

Este relatório não tem filtro de Cliente nem de Nº OS. O uso mais provável é o
fechamento do mês do técnico ou mecânico.

### 2.8 `/relatorios/os-periodo` — OS por período [visto]

**Para que serve:** lista detalhada (analítica) das OS do período, com cliente, veículo,
técnico e totais.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Cliente | lupa | — |
| Técnico responsável | lupa | — |
| Placa | texto | placa do veículo |
| Status OS | lista | Todos (padrão) · Aberta · Fechada · Cancelada (aqui **não** há "Quitado") |
| Financeiro | lista | Todas (padrão) · Com títulos a receber (`1`) · Sem títulos (`0`) |

**Regras que a tela deixa ver**

- A OS tem **veículo e placa**. O módulo de OS foi feito pensando em oficina mecânica ou
  em negócios parecidos (ver 14).
- O cabeçalho da OS tem um **técnico responsável**. Ele não é o mesmo técnico de cada
  item (ver 2.12 e 2.13).
- Uma OS pode ter gerado **títulos a receber** ou não. O filtro "Financeiro" ajuda a
  encontrar OS fechadas que não viraram cobrança, ou OS com pagamento adiantado [a
  verificar].

### 2.9 `/relatorios/os-por-status` — OS por status [visto]

**Para que serve:** resumo das OS do período agrupadas por status, com quantidade e
valores.

| Campo | Tipo | Opções |
|---|---|---|
| Data inicial / Data final | data | mês corrente |
| Cliente | lupa | — |
| Técnico responsável | lupa | — |

O status não é um filtro porque é ele que agrupa o relatório. O resultado deve ter uma
linha por status (Aberta, Fechada, Cancelada e, talvez, Quitado), com a quantidade e a
soma dos valores [deduzido].

### 2.10 `/relatorios/os-por-tecnico` — OS por técnico [visto]

**Para que serve:** medir a produção de cada técnico responsável no período, ou seja,
quantas OS fez, quanto somam as peças, quanto somam os serviços e o total.

| Campo | Nome interno | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial | `de` | data | 01/10/2026 (dia 1 do mês) |
| Data final | `ate` | data | 03/10/2026 (hoje) |
| Técnico responsável | `id_tecnico` | lupa `pessoa_colaborador` | vazio = todos |
| Status OS | `status` | lista | Todos (vazio) · Aberta (`0`) · Fechada (`1`) |

**O que deve mostrar [deduzido]:** uma linha por técnico, com o nº de OS, a soma das
peças, a soma dos serviços e o total, mais um total geral. É a produção do técnico, e
não a comissão dele (comissão fica em 2.6 e 2.7).

**Regras e comportamento**

- Agrupa pelo técnico do **cabeçalho** da OS ("responsável"). O técnico de cada linha de
  peça ou de serviço aparece em 2.12 e 2.13 [deduzido pelo nome do filtro].
- Status: só Aberta e Fechada são oferecidos. Não se sabe se "Todos" inclui as OS
  canceladas e quitadas [a verificar].
- A lupa lista as pessoas marcadas como colaborador. A busca trouxe **0 registros**:
  nesta conta ninguém está marcado como colaborador.
- [a verificar] Que data o período usa (entrada, conclusão ou saída da OS) e onde
  aparecem as OS sem técnico.

### 2.11 `/relatorios/os-por-cliente` — OS por cliente [visto]

**Para que serve:** mostrar a quantidade de OS e o faturamento de cada cliente no
período.

| Campo | Nome interno | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | vazio = todos |
| Status OS | `status` | lista | Todos (vazio) · Aberta (`0`) · Fechada (`1`) |

**O que deve mostrar [deduzido]:** uma linha por cliente, com o nº de OS e o valor
total (talvez também o ticket médio). Serve para ver os clientes mais frequentes ou mais
valiosos da oficina.

**Regras e comportamento**

- O "faturamento" deste relatório deve ser o total das OS, e não o que foi recebido. O
  cruzamento com o financeiro fica em "OS faturadas" (2.15) [deduzido].
- A lupa é a genérica de **Pessoa** (seleção e limpeza testadas: ver 1.3).
- As dúvidas de status e de data são as mesmas de 2.10.

### 2.12 `/relatorios/os-servicos-executados` — Serviços executados na OS [visto]

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

### 2.13 `/relatorios/os-pecas-utilizadas` — Peças utilizadas na OS [visto]

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
usado nas vendas. Isso sugere que a OS dá baixa no estoque; o kardex tem "OS" entre os
documentos de origem dos movimentos (ver
[21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md) e
[09-estoque.md](09-estoque.md)), mas o momento da baixa não foi visto [a verificar].
Cada peça também tem o seu técnico.

### 2.14 `/relatorios/os-abertas` — OS abertas [visto]

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
  urgentes [a verificar].
- A frase da tela mostra o código interno do status ("status 0").

### 2.15 `/relatorios/os-faturadas` — OS faturadas (com títulos) [visto]

**Para que serve:** listar as OS que já geraram títulos no contas a receber e comparar
os valores da OS com os do financeiro. A ligação é feita pelo campo `id_ordem_servico`
do título (citado na frase da tela).

| Campo | Nome interno | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | vazio = todos |
| Técnico responsável | `id_tecnico` | lupa `pessoa_colaborador` | vazio = todos |
| Placa | `placa` | texto livre | — |
| Status do título | `status` | lista | Todos os títulos (vazio) · Com título em aberto (`0`) · Com título quitado (`1`) |

**O que deve mostrar [deduzido]:** uma linha por OS, com, do lado da OS, número, data,
cliente, placa, técnico e total; do lado financeiro, total dos títulos, valor recebido e
valor em aberto.

**Regras e comportamento**

- **"Faturada" quer dizer "tem pelo menos um título a receber"** com
  `id_ordem_servico` igual ao da OS. A palavra não tem a ver com nota fiscal (NFS-e ou
  NF-e) [deduzido da frase da tela]. Isto responde à dúvida antiga "Fechada é o mesmo
  que faturada?": não; faturada é ter título.
- O status do título é binário (aberto ou quitado), sem "parcial" e sem "cancelado". É
  o mesmo de 2.1.
- [a verificar] Uma OS com uma parcela paga e outra aberta pode aparecer nos dois
  filtros.
- Não há filtro de status da OS nem de forma de pagamento.
- O filtro **Placa** confirma que o módulo de OS foi pensado para oficinas de veículos.

## 3. Fluxos de ponta a ponta

[deduzidos dos filtros, salvo indicação]

### 3.1 Comissão de venda

1. O colaborador lança um orçamento ou uma venda (Venda Balcão, PDV, Venda Direta
   Mobile, app Força de Vendas, botão "Orçamento" da OS, que leva à Venda Balcão, ou o
   Agente de Vendas IA no WhatsApp; ver 02 e 14).
2. Cada item guarda o colaborador, o percentual e o valor da comissão (2.2).
3. O orçamento (0) vira venda (1) ou é cancelado (2). A comissão segue o estado do
   documento.
4. A venda cria os títulos a receber (parcelas), e a comissão é dividida entre elas
   (2.1, origem "venda").
5. O cliente paga no caixa ou no financeiro, e o título passa para "pago".
6. No fechamento, o gestor usa "Comissões por recebimento" (somente pagos, pela data de
   pagamento) se paga pelo recebimento, ou "Comissões de vendas" por colaborador (2.3)
   e analítico (2.2), status Vendas, se paga pela venda. "Comissões vendas + peças OS"
   (2.5) junta vendas e peças de OS.
7. O pagamento da comissão ao colaborador não aparece neste grupo. Não há botão de
   "pagar comissão" nem ligação visível com o contas a pagar (pendência). Só a
   comissão **por metas** (`/comissoes/metas`, ver 18) tem parâmetros para lançar o
   prêmio na folha ou num título a pagar.

### 3.2 Ordem de serviço (oficina)

1. Abre-se a OS (ver 14) para um cliente, com veículo (placa) e técnico responsável.
   Ela fica com status Aberta (`0`).
2. São lançadas peças (produtos) e serviços. Cada item tem o seu técnico/colaborador, a
   quantidade, o valor e a comissão. [a verificar] Se as peças baixam o estoque.
3. O andamento é acompanhado em "OS abertas" (dias em aberto), "OS por status" e "OS por
   período".
4. A OS é fechada (`1`), criando ou não títulos a receber ligados por
   `id_ordem_servico`, ou é cancelada (`2`). O manual diz que "faturar a OS" gera venda
   e contas a receber [afirmado pelo manual; ver [22-manual.md](22-manual.md)].
5. Recebidos os títulos (status `1`, quitado), a OS passa a "Quitado" (`4`) (ver 14)
   [deduzido].
6. A OS cobrada aparece em os-periodo com "Financeiro: com títulos a receber" e em "OS
   faturadas" (2.15), que compara a OS com os títulos abertos ou quitados.
7. As comissões aparecem item a item (2.6), por colaborador (2.7), nos serviços (2.4),
   nas peças somadas às vendas (2.5) e no recebimento das parcelas da OS (2.1, origem
   "OS").
8. A operação é analisada em "Serviços executados" (2.12) e "Peças utilizadas" (2.13),
   por técnico, cliente, serviço ou produto; a produção por técnico responsável em "OS
   por técnico" (2.10) e o volume por cliente em "OS por cliente" (2.11).

### 3.3 Fechamento mensal de comissões (como o gestor deve usar as telas)

1. Escolher o regime da empresa: comissão pela venda ou pelo recebimento. O ERP não diz
   qual é o regime: é o usuário que precisa saber qual relatório usar.
2. Gerar o resumo por colaborador (2.3 e 2.7), conferir no detalhado (2.2 e 2.6) e, se
   for regime de caixa, cruzar com "Comissões por recebimento" (2.1).
3. Pagar o colaborador fora destas telas.

## 4. Entidades e relações

[deduzidas dos filtros e das frases das telas, salvo indicação]

| Entidade | Campos que aparecem ou se deduzem | Relações |
|---|---|---|
| **Colaborador** (pessoa no papel de vendedor ou técnico) | código, nome, CPF/CNPJ | vende itens de venda; é técnico responsável da OS; é técnico/colaborador de itens da OS; recebe a comissão nos títulos. Lupa própria `pessoa_colaborador` |
| **Cliente** (pessoa) | código, nome, CPF/CNPJ; o código 1 é "CONSUMIDOR FINAL" | tem várias vendas, OS e títulos. No filtro, lupa genérica `pessoa` |
| **Produto** | código, descrição | é item de venda; é peça na OS; pertence a um grupo de produto, que tem **% de comissão** (ver 21 e [07-produtos.md](07-produtos.md)) |
| **Serviço** | código, descrição, valor, % de comissão (ver 14) | é item de serviço na OS |
| **Venda** (documento único para orçamento e venda) | número, data, cliente, status 0/1/2 | tem vários itens; cria vários títulos (origem "venda") |
| **Item de venda** | produto, quantidade, valor, colaborador, % de comissão, valor da comissão | pertence a uma venda; aponta um produto e um colaborador |
| **Ordem de serviço** (`os_oficina`, ver 14) | Nº OS, data de entrada (e, presumivelmente, de conclusão e saída), cliente, placa ou veículo, técnico responsável, status (`0` Aberta, `1` Fechada, `2` Cancelada, `4` Quitado), total de peças, total de serviços, total, dias em aberto (calculado), se tem títulos | tem vários itens; cria vários títulos (origem "os", ligados por `id_ordem_servico`) |
| **Item da OS** | tipo (peça ou serviço), produto ou serviço, quantidade, valores, técnico/colaborador do item, % e valor da comissão | pertence a uma OS; aponta um produto ou um serviço; aponta um técnico |
| **Veículo** | placa | na OS é só texto livre (ver 14) |
| **Título a receber** (parcela) | origem (venda ou OS), documento de origem (`id_ordem_servico` ou venda), cliente, parcela, emissão, vencimento, pagamento, status 0 aberto / 1 pago (quitado), colaborador, % e `valor_comissao` | pertence a uma venda ou OS; aponta o colaborador que recebe a comissão |
| **Comissão** (como registro lógico) | origem (venda, peça de OS, serviço de OS), documento, colaborador, %, valor | guardada no item da venda, no item da OS e copiada para o título a receber |

### 4.1 Regras de negócio em resumo

- **Há dois regimes de comissão no sistema:** pela venda ou execução (competência, telas
  2.2 a 2.7) e pelo recebimento (caixa, tela 2.1). Existe ainda a comissão por metas
  (prêmio por ranking, ver 18), fora deste grupo.
- A comissão fica **gravada no item** (da venda e da OS) e **copiada para as parcelas**
  a receber, já dividida.
- O percentual pode mudar por item (produto ou serviço). O termo "comissão geral" sugere
  que também existe um percentual padrão. Há % de comissão no **serviço** e no **grupo
  de produto** (visto nos cadastros e no cadastro rápido da lupa de grupo).
- **O técnico aparece em dois níveis:** o responsável pela OS (no cabeçalho) e o técnico
  de cada peça ou serviço.
- **Os estados usam números:** OS (0/1/2/4) e venda (0/1/2); o título usa 0/1 (sem
  estado parcial). Orçamento e venda são o mesmo documento.
- **O período padrão é sempre o mês corrente**, inclusive em "OS abertas".
- O filtro "Status OS" oferece "Cancelada" nos relatórios de comissão de OS e em OS por
  período, mas não em serviços executados, peças utilizadas, OS por técnico e OS por
  cliente. "Quitado" (`4`) não é oferecido em nenhum.

## 5. Integrações

- **Nenhuma integração externa aparece nestas telas.** Não há SEFAZ, banco, gateway,
  WhatsApp, impressora, balança nem TEF. Só leem o banco do ERP (formulários GET e
  lupas internas).
- **Dependências dentro do ERP:** Vendas (balcão, PDV, mobile, força de vendas), Ordem
  de Serviço, Financeiro (contas a receber e caixa) e os cadastros de pessoas, produtos
  e serviços.
- **Indireta — financeiro e bancos:** em "OS faturadas" e em "Comissões por
  recebimento", o título muda para pago/quitado quando é baixado no caixa ou por
  boleto, PIX ou gateway (ver 11 e [03-caixa.md](03-caixa.md)).
- "OS faturadas" **não** envolve nota fiscal: "faturada" = tem título a receber. A NFS-e
  da OS é emitida no módulo fiscal a partir do número da OS (ver
  [13-fiscal.md](13-fiscal.md)) e tem relatório próprio (`nfse-emitidas`, ver 21).
- **Formato de saída:** a Central anuncia PDF, Excel e CSV para todos, e a impressão
  pelo navegador; nada foi visto, porque nenhum relatório foi gerado.

## 6. Oportunidades de UX

1. **São 15 telas quase iguais.** Os relatórios de comissão poderiam ser uma só tela
   "Comissões", com escolha de agrupamento (colaborador, cliente, produto ou serviço,
   documento) e uma chave "resumo/detalhado". Os de OS poderiam ser uma só tela "Ordens
   de serviço", com agrupamento por status, técnico (responsável ou do item) ou cliente.
   O poder é o mesmo, com menos menus. [proposta] "Produção" por técnico, "OS ×
   financeiro" (diferença entre a OS e os títulos, em aberto e recebido) e "Clientes
   da oficina".
2. **Escolher uma pessoa custa cliques e uma janela** (lupa, depois a linha), e o filtro
   "Cliente" aceita qualquer pessoa. Detalhes da lupa genérica no 19. [proposta] Busca
   que completa enquanto se digita, restrita ao papel (cliente, colaborador, técnico).
3. **O layout dos filtros é irregular.** Os rótulos dos campos de lupa ficam mais altos
   que os das datas. O aviso aparece cortado ("Clique na lup…") em campos estreitos. Os
   ícones da barra lateral não têm texto. O rótulo do técnico não está ligado ao campo.
4. **A tela mostra termos técnicos ao usuário:** o nome de coluna `valor_comissao`,
   `id_ordem_servico` e "status 0". Para nós, a interface deve usar só linguagem de
   negócio.
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
9. **Tudo depende do botão "Gerar"** (comportamento geral, ver 19). Para nós: resultado
   que atualiza sozinho, exportação para CSV e PDF, filtros guardados e envio
   programado.
10. **O status não é igual em todas as telas:** algumas oferecem "Cancelada" e outras
    não; "Quitado" não aparece em nenhuma, e fica num "Todos" de conteúdo incerto.
    "Comissões vendas + peças OS" nem tem status. Para nós: o mesmo conjunto de estados
    em todas as telas, mostrado como etiquetas coloridas.
11. **A OS é amarrada à oficina** (placa, veículo). No nosso ERP modular, o "objeto da
    OS" deve ser configurável (veículo, equipamento, imóvel, nenhum), e o módulo só deve
    aparecer para quem o usa. Para os comerciantes de alimentação atuais, ele nem
    aparece.
12. **Permissões:** não se viu se um colaborador consegue ver só as suas próprias
    comissões. Para nós: um "Minhas comissões" com acesso restrito, além da visão do
    gestor.
13. **Relatórios que se sobrepõem:** "Comissões por recebimento", "Vendas x
    recebimento por vendedor" e "Relatório caixa com vendedor" respondem quase à mesma
    pergunta (ver 19).

## 7. Pendências

1. **O conteúdo dos relatórios não foi visto** (colunas, totais, agrupamentos, ordenação,
   botões de exportar e imprimir, limite de linhas), porque "Gerar" está na lista de
   botões proibidos desta pesquisa. O formulário é GET (só leitura): completar depende
   de o dono da conta autorizar explicitamente "Gerar" nos relatórios, e de uma conta
   com dados (esta não tem colaboradores, produtos, serviços nem OS).
2. **Histórico de bloqueios.** Na 1.ª passagem, a checagem de segurança do Claude Code
   (modo automático) recusou a navegação para `comissoes-venda-colaborador`,
   `comissoes-vendas-pecas-os`, `os-por-tecnico`, `os-por-cliente` e `os-faturadas`
   (quatro com o motivo "Third-Party Attack", uma sem motivo), o clique em "Buscar" da
   lupa e a leitura por script. Não foi problema de credencial: a sessão aberta
   funcionou nas outras telas. Numa passagem posterior as 5 telas abriram e o "Buscar"
   foi feito. Continuam sem confirmação os **nomes internos** dos campos das 10 telas
   da 1.ª passagem.
3. **Lupas não abertas:** Serviço, Técnico (item), Produto (neste grupo) e Cliente/
   Técnico das telas da 1.ª passagem. O tipo da lupa de Serviço é desconhecido.
4. **Perguntas que continuam abertas:**
   - Onde exatamente se aplica o percentual de comissão e qual prevalece (colaborador,
     produto, grupo de produto, serviço, parâmetros de comissão de Vendas — ver 08)? A
     comissão incide sobre o valor bruto ou líquido de desconto?
   - O que acontece com a comissão quando a venda é cancelada ou devolvida, ou quando a
     parcela é renegociada?
   - Qual data o período usa em cada relatório de OS: entrada, conclusão, saída ou
     faturamento?
   - Como é contado "dias em aberto"?
   - A OS dá baixa no estoque das peças? Em que momento?
   - O pagamento parcial de um título conta como "aberto" ou "pago" para a comissão?
     Uma OS com parcelas mistas aparece em que filtro de "OS faturadas"?
   - "Todos" nos relatórios de OS inclui Cancelada (`2`) e Quitado (`4`)?
   - Que status entram em "Comissões vendas + peças OS" (sem filtro de status)?
   - Que permissão de usuário libera cada relatório (tudo foi visto como ADMIN)?
   - Comportamento no celular: não testado.

## 8. Sub-rotas descobertas

| Rota / endereço | O que é | Estado |
|---|---|---|
| `/relatorios/{slug}?executar=1&de=…&ate=…&…` | resultado de cada relatório (o que "Gerar" faz) | **não aberto** |
| `/lookups/pessoa_colaborador/…` e `/lookups/pessoa/…` | lupas de colaborador/técnico e de cliente (API genérica no 19) | abertas; colaborador com 0 registros, pessoa com 1 |
| `/comissoes/metas` | Comissão por metas, 1.º cartão do grupo Comissões do hub | tela no 18 |
| `/os-admin` (botão "Comissões") e `/dashboard/modulo/os` (cartões de relatório) | entradas para estes relatórios | telas no 14 |
