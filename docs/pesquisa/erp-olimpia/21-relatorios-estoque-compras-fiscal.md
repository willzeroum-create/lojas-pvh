# 21 — Relatórios de estoque, produtos, compras, fiscal, Mercado Livre e loja (ERP Olímpia)

> Os 35 relatórios da Central sobre estoque (kardex, entradas, saídas, análise,
> movimentação interna), produtos, compras, documentos fiscais e apuração, Mercado Livre
> e loja virtual. Exploração só de leitura em 2026-10-03, na conta de teste "Boi Criolo"
> (plano Full, perfil ADMIN), em várias passagens. Na primeira tentativa nada abriu; nas
> seguintes, **30 telas foram lidas** (filtros, opções, lupas e, na maioria, nomes
> internos), 1 abriu mas a leitura foi recusada, 2 tiveram a abertura recusada e 2 não
> foram tentadas. **Nenhum relatório foi gerado** ("Gerar" está na lista de proibidos): colunas
> e totais são deduzidos da frase da tela, do cartão da Central e das telas de operação.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual], [código] (lido
> no HTML/JS da página), [proposta]; [a verificar] marca dúvida em aberto; [domínio] é
> regra fiscal ou do Mercado Livre conhecida fora do ERP, que não aparece na tela e deve
> ser confirmada com um contador ou na documentação oficial. Nada foi gravado no ERP.

## 1. Visão geral

**O que o grupo faz.** São relatórios só de consulta: nenhum cria ou altera registros.
Os dados vêm de outros módulos:

- **Estoque** (kardex, entradas XML e manuais, saídas manuais, balanços,
  transferências): [09-estoque.md](09-estoque.md);
- **Expedição** (romaneios de carga): [02-vendas-pdv.md](02-vendas-pdv.md);
- **Compras** (solicitações, cotações, pedidos): [10-compras-producao.md](10-compras-producao.md);
- **Produtos** (cadastro, grupos, fabricantes, subgrupos, cores): [07-produtos.md](07-produtos.md);
- **Fiscal** (NF-e modelo 55 com o código devolvido pela SEFAZ, MDF-e, CT-e,
  manifestação, NFS-e, SPED): [13-fiscal.md](13-fiscal.md);
- **Mercado Livre e loja virtual**: [06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md).

**Moldura e comportamento comum.** Estas telas usam a moldura comum a todos os
relatórios (cabeçalho com título, frase e "← Central"; um cartão de filtros que é um
formulário GET para a própria rota, com `executar=1`; período `de`/`ate` com padrão do
dia 1 do mês até hoje; lupas; um único botão "Gerar" com ícone de lupa; nenhum campo
obrigatório; nada de exportar ou imprimir antes de gerar). Essa moldura, a janela de
pesquisa (lupa) e a sua API (`/lookups/...`), a rota genérica `relatorios.show`, a
Central (132 relatórios, catálogo completo) e os Processamentos estão descritos em
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md); o seletor de
empresa e as notificações da moldura, em [22-manual.md](22-manual.md). Aqui fica só o
que é próprio deste grupo.

**Onde se chega a estas telas [visto]:**

- **Central de Relatórios** (`/relatorios`, ver 19), por categoria:
  - **Movimentações** (1): `movimentacoes-gerais`, sozinho na categoria.
  - **Estoque** (13): os 10 deste documento (`estoque-entradas`, `estoque-saidas`,
    `estoque-sem-movimento`, `estoque-valor-grupo`, `estoque-balanco`, `estoque-giro`,
    `estoque-transferencias`, `estoque-romaneio`, `saidas-periodo`, `saidas-itens`) e
    três que só existem na Central e não foram abertos (`estoque-posicao`,
    `estoque-abaixo-minimo`, `estoque-curva-abc`; ver o catálogo no 19).
  - **Compras** (11): os 9 deste documento (`compras-periodo`,
    `compras-por-fornecedor`, `compras-por-produto`, `compras-pedidos`,
    `compras-evolucao-custos`, `entradas-vs-pagar`, `entradas-itens`, `entradas-xml`,
    `entradas-manual`) e `compras-cotacoes` e `compras-solicitacoes` (só Central, ver
    19). **Os relatórios de entrada ficam em Compras, e não em Estoque.**
  - **Produtos** (5): `produtos-cadastro` e `produtos-lista-precos` (os outros, no 19).
  - **Fiscal** (17): os 10 deste documento e mais `nfce-emitidas`, `nfe-emitidas`,
    `fiscal-cancelados`, `nfce-tributos`, `nfce-itens-fiscal`,
    `produtos-tributacao-nfe` e `produtos-tributacao-nfce` (só Central, ver 19; os dois
    de tributação já citam IBS e CBS, da reforma tributária).
  - **Canais digitais** (5): `ml-pedidos`, `ml-anuncios`, `loja-pedidos` (os de
    cardápio e delivery, no 19).
- **Hub de relatórios** (`/dashboard/modulo/relatorios`, ver 19): grupo "Estoque e
  entradas/saídas" (17 cartões, inclui 3 de compras); grupo "Fiscal e canais" (9: NF-e,
  MDF-e, CT-e, manifestação, Mercado Livre, loja virtual — `loja-pedidos` está aqui);
  grupo "Vendas extras" (12), que mistura liberações, trocas e orçamentos com NFS-e,
  SPED, ICMS, anúncios do Mercado Livre e lista de preços. "Produtos — estoque e
  valores" aparece duas vezes (Estoque e Vendas extras).
- **Menu lateral:** nomes como "Pedidos Mercado Livre" e "Anúncios ML".
- Os relatórios com "Menu: sim" na Central (todos os deste documento, menos
  `movimentacoes-gerais`, `compras-periodo` e `entradas-vs-pagar`, que são "só
  Central") também estão no hub e no menu.

**Padrões e pistas deste grupo:**

- **Status padrão muda de tela para tela [visto]:** "Concluída" nas entradas, saídas,
  compras por fornecedor e evolução de custos; "Todos" em compras por período,
  balanço, transferências, romaneio, pedidos de compra, MDF-e e manifestação;
  "Autorizada" (100) nos relatórios de NF-e; "Ativos" em produtos.
- **Pistas de implementação nas frases [visto]:** "kardex (tabela estoque, tipo
  E/S)"; "movimentações registradas na tabela estoque (entradas, saídas, balanço)";
  "Delphi FrmRelatorio"; "estilo Delphi"; "chave NF-e preenchida". Ou seja, o ERP web
  refaz relatórios do sistema desktop em Delphi e lê as mesmas tabelas [deduzido].
- **Uma fonte só [deduzido]:** em todas as telas abertas, o título e a explicação são
  iguais aos do cartão da Central, e o nº de filtros anunciado na Central bate com os
  campos do formulário (as duas datas contadas em separado). Catálogo e telas saem da
  mesma definição de relatório.
- **Sem script próprio [código]:** os 7 relatórios fiscais lidos por completo e
  `ml-pedidos` são formulários desenhados pelo servidor, sem comportamento extra. Os
  filtros têm o id `f-<nome>` no HTML e enviam `<nome>`.
- **Escopo:** tudo é da empresa (filial) logada; nenhum relatório deixa escolher a
  filial nem o local de estoque [visto nos filtros].
- **Layout:** grade Bootstrap (`col-md-3 col-lg-2`); no computador os filtros ficam
  numa linha; no celular devem empilhar [deduzido; não testado].

### 1.1 Rotas e estado

| # | Rota | Título na tela | Central: categoria (filtros) | Estado | Filtros (além do período, quando há) |
|---|---|---|---|---|---|
| 2.1 | `/relatorios/movimentacoes-gerais` | Movimentações de estoque | Movimentações (4) — só Central | lida de passagem (filtros) | Produto, Tipo |
| 2.2 | `/relatorios/estoque-entradas` | Entradas de estoque (kardex) | Estoque (5) | lida (filtros, nomes internos; lupas de Produto, Grupo e Fabricante abertas) | Produto, Grupo, Fabricante |
| 2.3 | `/relatorios/estoque-saidas` | Saídas de estoque (kardex) | Estoque (5) | lida (filtros, nomes internos) | Produto, Grupo, Fabricante |
| 2.4 | `/relatorios/entradas-itens` | Entradas de estoque — itens | Compras (6) | lida | Fornecedor, Produto, Status entrada, Origem |
| 2.5 | `/relatorios/entradas-xml` | Entradas XML (NF-e) | Compras (4) | lida | Fornecedor, Status |
| 2.6 | `/relatorios/entradas-manual` | Entradas manuais | Compras (4) | lida | Fornecedor, Status |
| 2.7 | `/relatorios/compras-periodo` | Compras por período | Compras (4) — só Central | lida de passagem (filtros) | Fornecedor, Status |
| 2.8 | `/relatorios/entradas-vs-pagar` | Entradas × contas a pagar (pela Central) | Compras (4) — só Central | **recusada** (navegação) | não vistos |
| 2.9 | `/relatorios/saidas-periodo` | Saídas manuais/fiscais — período | Estoque (4) | lida | Cliente, Status |
| 2.10 | `/relatorios/saidas-itens` | Saídas — itens | Estoque (5) | lida | Cliente, Produto, Status saída |
| 2.11 | `/relatorios/estoque-sem-movimento` | Estoque sem movimento | Estoque (4) | lida | **sem período**: Dias sem movimento, Grupo, Fabricante, Saldo |
| 2.12 | `/relatorios/estoque-valor-grupo` | Estoque valorizado por grupo | Estoque (2) | lida | **sem período**: Grupo, Saldo |
| 2.13 | `/relatorios/estoque-balanco` | Balanço / inventário | Estoque (4) | lida (+ estrutura) | Status, Produto |
| 2.14 | `/relatorios/estoque-giro` | Giro de estoque | Estoque (4) | lida (+ estrutura) | Produto, Grupo |
| 2.15 | `/relatorios/estoque-transferencias` | Transferências entre filiais | Estoque (4) | lida (+ estrutura) | Status, Produto |
| 2.16 | `/relatorios/estoque-romaneio` | Romaneios / cargas | Estoque (4) | lida (+ estrutura) | Status, Rota |
| 2.17 | `/relatorios/produtos-cadastro` | Produtos — estoque e valores | Produtos (7) | lida (+ estrutura) | **sem período**: Grupo, Fabricante, Subgrupo, Cor, Status, Estoque > 0, Somente serviço |
| 2.18 | `/relatorios/produtos-lista-precos` | Lista de preços (pela Central) | Produtos (4) | **não tentada** | não vistos |
| 2.19 | `/relatorios/compras-por-fornecedor` | Compras por fornecedor | Compras (4) | lida (+ estrutura) | Fornecedor, Status da entrada |
| 2.20 | `/relatorios/compras-por-produto` | Compras por produto | Compras (5) | **abriu, mas a leitura foi recusada** | não lidos |
| 2.21 | `/relatorios/compras-pedidos` | Pedidos de compra | Compras (4) | lida (texto e árvore) | Fornecedor, Status |
| 2.22 | `/relatorios/compras-evolucao-custos` | Evolução de custos de compra | Compras (5) | lida (texto e árvore) | Fornecedor, Produto, Status da entrada |
| 2.23 | `/relatorios/nfe-rejeitadas` | NF-e rejeitadas / denegadas | Fiscal (3) | lida (texto e árvore) | Cliente |
| 2.24 | `/relatorios/nfe-tributos` | NF-e — tributos | Fiscal (3) | lida (texto e árvore) | Status |
| 2.25 | `/relatorios/nfe-por-cfop` | NF-e por CFOP | Fiscal (3) | lida (texto e árvore) | Status |
| 2.26 | `/relatorios/nfe-itens-fiscal` | NF-e itens — CFOP / CST / NCM | Fiscal (4) | lida por completo | Produto, Status NF |
| 2.27 | `/relatorios/mdfe-periodo` | MDF-e emitidos | Fiscal (3) | lida por completo | Status |
| 2.28 | `/relatorios/cte-periodo` | CT-e emitidos | Fiscal (3) | lida por completo | Status (texto livre) |
| 2.29 | `/relatorios/fiscal-manifestacao-nfe` | Manifestação DF-e | Fiscal (3) | lida por completo | Situação DF-e |
| 2.30 | `/relatorios/nfse-emitidas` | NFS-e emitidas | Fiscal (4) | lida por completo | Cliente, Status NFS-e (texto livre) |
| 2.31 | `/relatorios/sped-resumo-periodo` | SPED — resumo fiscal do período | Fiscal (2) | lida por completo | só período |
| 2.32 | `/relatorios/icms-mensal` | ICMS — créditos e débitos do mês | Fiscal (2) | lida por completo | só período |
| 2.33 | `/relatorios/ml-pedidos` | Pedidos Mercado Livre | Canais digitais (3) | lida por completo | Status ML (texto livre) |
| 2.34 | `/relatorios/ml-anuncios` | Anúncios Mercado Livre (pela Central) | Canais digitais (2) | **abertura recusada** | não vistos |
| 2.35 | `/relatorios/loja-pedidos` | Pedidos loja virtual (pela Central) | Canais digitais (3) | **não tentada** | não vistos |

- "+ estrutura" e "lida por completo": além do texto, o formulário foi lido por dentro
  (nomes internos dos campos e tipo de cada lupa) [código].
- "texto e árvore": depois de uma recusa de script, só o texto da página e a árvore de
  acessibilidade foram lidos. Os nomes internos seguem o mesmo padrão, mas não foram
  confirmados.
- "lida" sem qualificação (2.4 a 2.12): filtros, opções, nomes internos e lupas lidos
  pelo HTML do formulário e pelas respostas das lupas.
- Em **todas**, o resultado do relatório não foi visto.

### 1.2 Códigos e parâmetros deste grupo [visto]

| Conceito | Parâmetro | Valores |
|---|---|---|
| Período | `de`, `ate` | AAAA-MM-DD; padrão do dia 1 do mês até hoje |
| Status do documento de entrada ou de saída | `status` | `todos` · `0` Aberta · `1` Concluída · `2` Cancelada. Nas telas de operação os nomes são Pendente, Concluído e Cancelado |
| Origem da entrada (entradas-itens) | `modo` | vazio = Todas · `xml` · `manual` |
| Tipo de movimento no kardex (movimentacoes-gerais) | `status` (!) | `todos` · `E` Entrada · `S` Saída · `B` Balanço |
| Saldo (estoque parado e valor por grupo) | `modo` (!) | `com_saldo` (padrão) · `todos` |
| Dias sem movimento | `dias_sem_movimento` | inteiro ≥ 1; padrão 90 |
| Status do balanço | `status` | Todos (padrão) · `0` Pendente · `1` Concluído |
| Status da transferência | `status` | Todos (padrão) · `0` Pendente · `1` Concluída · `2` Cancelada |
| Status do romaneio (relatório) | `status` | Todos (padrão) · `0` Aberto · `1` Finalizado (a tela de trabalho os chama de Pendente/Concluído e tem ainda `2` Cancelado) |
| Status do produto | `status` | `1` Ativos (padrão) · `todos` · `0` Inativos |
| Caixas de produtos | `estoque_maior_zero`, `somente_servico` | `1` quando marcadas |
| Status do pedido de compra | — | vazio = Todos · `aberto` · `parcial` · `recebido` · `cancelado` (texto, não número) |
| Status da NF-e (= código SEFAZ) | `status` | `100` Autorizada · `101` Cancelada · `todos` |
| Status do MDF-e | `status` | `todos` · `0` Pendente · `1` Autorizado · `2` Encerrado · `3` Cancelado |
| Situação DF-e (manifestação) | `status` | vazio = Todos · `F` Pendente · `P` Ciência · `T` Finalizada |
| Status do CT-e, da NFS-e e do pedido do Mercado Livre | `status` | **texto livre**, sem dica nem lista |
| Pessoas e cadastros | `id_cliente`, `id_fornecedor`, `id_produto`, `id_grupo`, `id_fabricante`, `id_sub_grupo`, `id_cor`, `id_rota` | ID escolhido pela lupa |

(!) O mesmo nome de parâmetro tem sentidos diferentes conforme a tela: `status` é às
vezes um estado e às vezes um tipo; `modo` é às vezes a origem e às vezes o saldo. E
os valores misturam tipos: números (0, 1, 2), letras (E/S/B, F/P/T), texto (`aberto`,
`parcial`) e códigos da SEFAZ (100, 101).

### 1.3 Lupas usadas neste grupo [visto]

A janela e a sua API são as genéricas (ver 19). A configuração de cada tipo vem do
servidor (`/lookups/{tipo}/config`):

| Tipo | Título da janela | Colunas | Cadastro rápido | Usado como | Registros na conta |
|---|---|---|---|---|---|
| `pessoa` | Pessoa | Código, Nome, CPF/CNPJ | não | **Cliente** (saidas-periodo, saidas-itens, nfse-emitidas; nfe-rejeitadas, tipo não confirmado) e **Fornecedor** (entradas-itens, entradas-xml, entradas-manual, compras-periodo, compras-por-fornecedor, compras-pedidos, compras-evolucao-custos) | 1 ("CONSUMIDOR FINAL", código 1, sem documento) |
| `produto` | Produto | Código, Descrição, Ref. (`ref_fabrica`), UN (`unidade`) | o botão não apareceu | Produto (movimentacoes-gerais, estoque-entradas, estoque-saidas, entradas-itens, saidas-itens, estoque-balanco, estoque-giro, estoque-transferencias, compras-evolucao-custos, nfe-itens-fiscal) | 0 |
| `produto_grupo` | Grupo de Produto | Código, Descrição | **sim:** só a Descrição (obrigatória, em maiúsculas); padrões status 1, comissão 0 e ordem 0; código pela sequência `PRODUTO_GRUPO` | Grupo (estoque-entradas, estoque-saidas, estoque-sem-movimento, estoque-valor-grupo, estoque-giro, produtos-cadastro) | 0 |
| `fabricante` | Fabricante | Código, Descrição, Status | **sim:** Descrição (obrigatória, em maiúsculas); padrão status 1; sequência `FABRICANTE` | Fabricante (estoque-entradas, estoque-saidas, estoque-sem-movimento, produtos-cadastro) | 1 ("PADRAO", com o status mostrado como "0") |
| `produto_sub_grupo` | Subgrupo de Produto | Código, Descrição, Status | sim | Subgrupo (produtos-cadastro) | 1 ("PADRAO") |
| `produto_cor` | Cor | Código, Descrição, Status | sim | Cor (produtos-cadastro) | 1 ("PADRAO") |
| `rota` | não aberta | — | — | Rota (estoque-romaneio) | nenhuma rota (pela tela de romaneios) |

- **O que a configuração do cadastro rápido revela [deduzido]:** o grupo de produto
  guarda descrição, status, **% de comissão** e ordem de exibição; os códigos vêm de
  **sequências com nome** (`PRODUTO_GRUPO`, `FABRICANTE`), no estilo dos geradores do
  sistema antigo em Delphi.
- "Fornecedor" e "Cliente" usam a mesma lupa genérica de Pessoa, sem filtrar o papel:
  a janela "Pesquisar — Pessoa" lista **todas** as pessoas, clientes incluídos.
- "Cadastrar novo" (Grupo, Fabricante, Subgrupo, Cor) **não foi clicado**; os campos
  só são conhecidos pela configuração da lupa.
- Seleção múltipla na lupa de Pessoa [a verificar]: o botão de seleção múltipla não
  tinha a classe que o esconde em `nfse-emitidas`; não ficou claro se aceita vários.
- Um clique na lupa logo depois de fechar outra janela foi ignorado (a anterior ainda
  estava fechando); no segundo clique, abriu.
- **Acessibilidade [código]:** o rótulo visível (ex.: "Produto") fica fora do
  componente; o rótulo de dentro existe, mas está vazio.

### 1.4 Dados existentes na conta

A conta de teste não tem produtos, grupos de produto, colaboradores, entradas, saídas,
movimentos de estoque, pedidos de compra, romaneios nem rotas. A única pessoa é o
registro padrão "CONSUMIDOR FINAL", e fabricante, subgrupo e cor só têm o "PADRAO"
criado com a conta. Mesmo gerados, os relatórios sairiam vazios.

## 2. Telas

Todas seguem a moldura comum (ver 19): formulário GET, nenhum campo obrigatório, botão
"Gerar" (não clicado) e link "← Central". As seções registram só o que é próprio de
cada uma. Ordem: kardex (2.1–2.3); documentos de entrada e compras (2.4–2.8); saídas
(2.9–2.10); análise de estoque (2.11–2.14); movimentação interna (2.15–2.16); produtos
(2.17–2.18); compras (2.19–2.22); NF-e (2.23–2.26); outros documentos fiscais
(2.27–2.30); apuração (2.31–2.32); canais digitais (2.33–2.35).

### 2.1 `/relatorios/movimentacoes-gerais` — Movimentações de estoque [visto]

- Fica sozinho na categoria "Movimentações" e só se chega a ele pela Central. A
  explicação diz que mostra o que está na tabela `estoque`: entradas, saídas e balanço.
- **Filtros:** período, Produto (lupa `produto`) e **Tipo**, num parâmetro chamado
  `status`: Todos (`todos`, padrão) · Entrada (`E`) · Saída (`S`) · Balanço (`B`).
- É a prova dos três tipos do kardex. Os relatórios 2.2 e 2.3 são este mesmo, com o tipo
  fixo e mais os filtros de grupo e fabricante.

### 2.2 `/relatorios/estoque-entradas` — Entradas de estoque (kardex) [visto]

**Objetivo:** listar os movimentos de **entrada** gravados no kardex. A frase da tela
diz que a fonte é a tabela `estoque`, com tipo `E`.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Produto | `id_produto` | lupa `produto` | vazio = todos |
| Grupo | `id_grupo` | lupa `produto_grupo` (com "Cadastrar novo") | vazio = todos |
| Fabricante | `id_fabricante` | lupa `fabricante` (com "Cadastrar novo") | vazio = todos |

**O que deve mostrar [deduzido]:** as colunas do log de estoque (`/estoque-log`, ver
09): data, produto, quantidade, saldo anterior e atual, documento de origem (entrada,
saída, OS, venda ou balanço), operação, usuário e grade.

**Regras e comportamento**

- **O kardex é uma tabela só** para todos os movimentos, com os tipos `E` (entrada),
  `S` (saída) e `B` (balanço) (ver 2.1).
- Este relatório é o kardex filtrado por `E`. Os acertos de balanço (`B`) ficam de fora
  [deduzido].
- Geram linha `E` [deduzido]: a entrada concluída, por XML ou manual; a devolução de
  venda; o produto devolvido numa troca; talvez a transferência recebida e o
  cancelamento de venda [a verificar].
- Os filtros de grupo e de fabricante confirmam que cada produto tem um grupo e um
  fabricante.
- Não há filtro por operação, local de estoque, grade, usuário ou documento.

### 2.3 `/relatorios/estoque-saidas` — Saídas de estoque (kardex) [visto]

**Objetivo:** listar os movimentos de **saída** do kardex (tabela `estoque`, tipo `S`).

**Filtros:** os mesmos de 2.2 (período, Produto, Grupo, Fabricante; parâmetros `de`,
`ate`, `id_produto`, `id_grupo`, `id_fabricante`).

**O que deve mostrar [deduzido]:** as mesmas colunas de 2.2, só com as linhas `S`.

**Regras e comportamento**

- Geram linha `S` [deduzido]: as vendas (balcão, PDV, delivery, loja virtual); as peças
  baixadas numa OS; as saídas manuais; o produto entregue numa troca; a transferência
  enviada.
- Como não há filtro por operação, este relatório **não separa venda de perda ou de
  consumo**. "Saídas manuais/fiscais" (2.9) também não tem esse filtro.

### 2.4 `/relatorios/entradas-itens` — Entradas de estoque — itens [visto]

**Objetivo:** listar os itens das entradas de mercadoria (por nota ou compra) no
período, com produto, quantidade, custo e fornecedor. Na Central, fica em **Compras**.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Fornecedor | `id_fornecedor` | lupa `pessoa` | vazio = todos |
| Produto | `id_produto` | lupa `produto` | vazio = todos |
| Status entrada | `status` | lista | Todos (`todos`) · Aberta (`0`) · **Concluída (`1`, padrão)** · Cancelada (`2`) |
| Origem | `modo` | lista | Todas (vazio, padrão) · Somente XML (`xml`) · Somente manual (`manual`) |

**O que deve mostrar [deduzido]:** uma linha por item, com data, nº da entrada, NF,
fornecedor, produto, quantidade, custo unitário e total, mais o total geral.

**Regras e comportamento**

- É a visão **por documento** (as entradas das telas `/entradas-xml` e
  `/entradas-manual`, ver 09), e não o kardex. Com o status "Aberta", mostra itens que
  ainda não mexeram no estoque [deduzido].
- O documento de entrada tem três estados: `0` Aberta, `1` Concluída e `2` Cancelada (nas
  telas de operação: Pendente, Concluído e Cancelado). O padrão "Concluída" faz o
  relatório mostrar só o que de fato entrou.
- **XML × manual:** pelas frases de 2.5 e 2.6, o critério é a **chave da NF-e**. Chave
  preenchida = XML; chave vazia = manual.
- É a matéria-prima para "custo de compra por produto" e "evolução de custos"
  [deduzido]. Sobrepõe-se a `estoque-entradas` (2.2) e a `compras-por-produto` (2.20).

### 2.5 `/relatorios/entradas-xml` — Entradas XML (NF-e) [visto]

**Objetivo:** listar os cabeçalhos das entradas importadas por XML, ou seja, as que têm
chave de NF-e. Na Central, fica em Compras.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Fornecedor | `id_fornecedor` | lupa `pessoa` | vazio = todos |
| Status | `status` | lista | `todos` · `0` Aberta · **`1` Concluída (padrão)** · `2` Cancelada |

**O que deve mostrar [deduzido pelas colunas de `/entradas-xml`, ver 09]:** ID, data,
NF, chave, fornecedor, total e status.

**Regras e comportamento**

- O XML chega por upload do arquivo `.xml` ou pela consulta à SEFAZ (distribuição DF-e,
  com ciência e download) (ver 09 e 13).
- As notas que só foram manifestadas ou baixadas, e que ainda não viraram entrada, não
  aparecem aqui. Elas ficam na tela de manifestação e no relatório 2.29 [deduzido].

### 2.6 `/relatorios/entradas-manual` — Entradas manuais [visto]

**Objetivo:** listar os cabeçalhos das entradas lançadas à mão, sem chave de NF-e. Na
Central, fica em Compras.

**Filtros:** os mesmos de 2.5 (período, Fornecedor `id_fornecedor`, Status com padrão
"Concluída").

**O que deve mostrar [deduzido pelas colunas de `/entradas-manual`, ver 09]:** ID, data,
fornecedor, NF, emissão, venda de origem, finalidade, total e status.

**Regras e comportamento**

- Aqui também caem as devoluções de venda (finalidade "Devolução", operação 12), as
  notas complementares e os ajustes. A entrada manual não é só "compra sem nota"
  [deduzido]. As devoluções têm ainda relatório próprio (`devolucoes-venda`, ver 19).
- No documento, o campo "Fornecedor / Cliente" aceita qualquer pessoa (o cliente, numa
  devolução). A lupa do filtro também é a genérica de Pessoa.

### 2.7 `/relatorios/compras-periodo` — Compras por período [visto]

- Fica em Compras e só se chega a ele pela Central. Mostra as entradas de mercadoria no
  período, com fornecedor e totais.
- **Filtros:** período, Fornecedor (lupa `pessoa`) e Status (**`todos` como padrão** ·
  `0` · `1` · `2`).
- A fonte é a mesma de 2.5 + 2.6, mas aqui o padrão é "Todos", e não "Concluída". Se o
  usuário não mexer no status, a soma de "Entradas XML" com "Entradas manuais" não bate
  com "Compras por período" [deduzido].

### 2.8 `/relatorios/entradas-vs-pagar` — Entradas × contas a pagar [não aberta]

- Está na Central, em Compras ("só Central", 4 filtros): entradas com o total da NF e os
  títulos a pagar ligados a elas.
- **Não foi aberta:** a checagem de permissões do Claude Code (modo automático) recusou
  a navegação, e ela não foi repetida.
- O cartão já indica que a entrada pode gerar títulos a pagar [deduzido] (contas a
  pagar: ver 11).
- **Perguntas:** que filtros tem (provavelmente período, fornecedor e status); se
  mostra a diferença entre a NF e o que foi lançado no contas a pagar; se mostra as
  entradas sem título.

### 2.9 `/relatorios/saidas-periodo` — Saídas manuais/fiscais — período [visto]

**Objetivo:** listar os cabeçalhos das saídas lançadas à mão ou com nota ("fiscais") no
período, com destinatário e totais. Na Central, fica em Estoque.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | vazio = todos |
| Status | `status` | lista | `todos` · `0` Aberta · **`1` Concluída (padrão)** · `2` Cancelada |

**O que deve mostrar [deduzido pelas colunas de `/saidas-manual`, ver 09]:** ID, data,
destinatário, NF, emissão, finalidade, total, status e, talvez, a operação.

**Regras e comportamento**

- "Fiscal" indica que a saída pode levar NF (número, série e emissão) e que dela pode
  nascer a NF-e de devolução de compra, de remessa ou de perda (ver 09 e 13) [deduzido].
- O filtro chama o destinatário de "Cliente", mas a saída aceita qualquer pessoa, como
  o fornecedor numa devolução de compra.
- **Vendas e OS não entram aqui.** Elas geram saída no kardex (2.3), mas não são
  "saídas manuais/fiscais" [deduzido].
- Falta o filtro mais útil para a gestão: a **operação** (perda, consumo, bonificação,
  devolução de compra, remessa...).

### 2.10 `/relatorios/saidas-itens` — Saídas — itens [visto]

**Objetivo:** listar os itens das saídas manuais ou fiscais no período. Na Central, fica
em Estoque.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | vazio = todos |
| Produto | `id_produto` | lupa `produto` | vazio = todos |
| Status saída | `status` | lista | `todos` · `0` Aberta · **`1` Concluída (padrão)** · `2` Cancelada |

**O que deve mostrar [deduzido pelos campos do item de saída, ver 09]:** produto,
quantidade, unitário, desconto em %, desconto em R$, acréscimo e valor líquido, junto
com o documento e o destinatário.

**Regras e comportamento:** as mesmas de 2.9. Com o filtro Produto, responde à pergunta
"para onde foi este produto fora das vendas?" [deduzido].

### 2.11 `/relatorios/estoque-sem-movimento` — Estoque sem movimento [visto]

**Objetivo:** listar os produtos com saldo que estão há X dias sem nenhum movimento no
kardex. Na Central, fica em Estoque.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Dias sem movimento | `dias_sem_movimento` | número | mínimo 1; padrão **90** |
| Grupo | `id_grupo` | lupa `produto_grupo` | vazio = todos |
| Fabricante | `id_fabricante` | lupa `fabricante` | vazio = todos |
| Saldo | `modo` | lista | Somente com saldo (`com_saldo`, padrão) · Todos (`todos`) |

Não há período. A data de referência é hoje [deduzido]. O número de dias é configurável
a cada consulta.

**O que deve mostrar [deduzido]:** produto, grupo, saldo, data do último movimento,
dias parado e, talvez, o valor parado a custo.

**Regras e comportamento**

- "Parado" = o último movimento do produto no kardex tem mais de X dias.
- [a verificar] Se o balanço (`B`) conta como movimento. Se contar, uma contagem anual
  "renova" todos os itens parados e esconde o problema.
- [a verificar] Se entram os produtos que nunca tiveram nenhum movimento.
- "Todos" inclui os produtos com saldo zero, o que ajuda a limpar o cadastro.

### 2.12 `/relatorios/estoque-valor-grupo` — Estoque valorizado por grupo [visto]

**Objetivo:** somar o saldo e o valor do estoque (a custo) por grupo de produto. Na
Central, fica em Estoque.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Grupo | `id_grupo` | lupa `produto_grupo` | vazio = todos |
| Saldo | `modo` | lista | Somente com saldo (`com_saldo`, padrão) · Todos (`todos`) |

Não há data: é a foto do estoque **agora** [deduzido].

**O que deve mostrar [deduzido]:** por grupo, o nº de produtos, a quantidade em estoque
e o valor a custo, mais o total geral.

**Regras e comportamento**

- Valor = saldo × custo do produto. O balanço usa o "preço de compra" como custo (ver
  09), e o mais provável é que aqui seja igual [deduzido].
- Não há escolha da base de valor (custo médio, último custo ou preço de venda). A
  valorização a preço de venda existe em "Produtos — estoque e valores" (2.17).
- O escopo é a empresa logada. A Central diz isso do relatório "Posição de estoque"
  [deduzido].
- [a verificar] Onde entram os produtos sem grupo e os saldos negativos.
- Não há posição numa data passada (por exemplo, no fechamento do mês), nem visão por
  fabricante ou por local de estoque.

### 2.13 `/relatorios/estoque-balanco` — Balanço / inventário [visto]

**Objetivo:** listar os itens dos balanços (contagens de inventário) com o saldo
anterior, a quantidade contada e a diferença.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | 01/10/2026 a 03/10/2026 |
| Status | `status` | lista | **Todos** (padrão) · Pendente (`0`) · Concluído (`1`) |
| Produto | `id_produto` | lupa `produto` | vazio = todos |

**O que deve mostrar [deduzido]:** por item, o balanço (número e data), o produto, o
saldo anterior, o contado e a diferença (contado − anterior); talvez também a diferença
em valor a custo; totais de sobras e de faltas.

**Regras e comportamento**

- O balanço é inventário com contagem e diferenças, não só a foto do estoque numa
  data. Tem dois estados [deduzido]: **Pendente** (a contagem está aberta e ainda não
  mexeu no saldo) e **Concluído** (a contagem foi aplicada).
- O saldo anterior fica guardado no item na hora da contagem. Assim a diferença não
  muda com movimentos posteriores [deduzido].
- A Central diz que o kardex registra entradas, saídas **e balanço**. Logo, ao
  concluir, o ajuste vira um movimento de estoque (`B`) [deduzido].
- A tela de trabalho é `/balancos` (+ `/balancos/create`), descrita no 09.

### 2.14 `/relatorios/estoque-giro` — Giro de estoque [visto]

**Objetivo:** comparar a quantidade vendida no período com o saldo atual. A própria
tela chama o resultado de "giro aproximado".

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Produto | `id_produto` | lupa `produto` | vazio = todos |
| Grupo | `id_grupo` | lupa `produto_grupo` | vazio = todos |

**O que deve mostrar [deduzido]:** por produto, a quantidade vendida no período, o saldo
atual e o índice (vendido ÷ saldo). Talvez também os dias de cobertura.

**Regras e comportamento**

- É "aproximado" porque usa o saldo de **hoje**, e não o estoque médio do período. Num
  período passado, o índice compara momentos diferentes.
- Conta só **vendas**: consumo interno, perdas e produção ficam de fora [deduzido de
  "quantidade vendida"].

### 2.15 `/relatorios/estoque-transferencias` — Transferências entre filiais [visto]

**Objetivo:** listar as transferências de estoque entre empresas ou filiais do mesmo
cliente, com itens e quantidades.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Status | `status` | lista | **Todos** (padrão) · Pendente (`0`) · Concluída (`1`) · Cancelada (`2`) |
| Produto | `id_produto` | lupa `produto` | vazio = todos |

**O que deve mostrar [deduzido]:** por transferência, a data, a filial de origem, a
filial de destino, o status e os itens (produto, quantidade, talvez custo).

**Regras e comportamento**

- Estados: Pendente → Concluída ou Cancelada. "Pendente" deve ser mercadoria que saiu e
  ainda não chegou, ou seja, em trânsito [deduzido].
- **Não há filtro** por filial de origem nem de destino.
- A tela de trabalho é `/transferencias` (+ `/transferencias/create`), descrita no 09.

### 2.16 `/relatorios/estoque-romaneio` — Romaneios / cargas [visto]

**Objetivo:** listar os romaneios de carga do período com motorista, rota, valor e
status.

| Campo | Parâmetro | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Status | `status` | lista | **Todos** (padrão) · Aberto (`0`) · Finalizado (`1`) |
| Rota | `id_rota` | lupa `rota` | vazio = todas |

**O que deve mostrar [deduzido da tela de trabalho `/romaneios`, descrita no 02]:** por
romaneio, o número, a data e a hora, o motorista, o veículo, a rota, o valor, o peso,
os volumes, o número de NF-e e o status.

**Regras e comportamento**

- O romaneio deste ERP é a **lista de carga para entrega** (vendas de uma rota, com
  motorista e veículo), e não uma lista de separação de depósito; a tela de trabalho
  imprime também a lista de separação e o itinerário (ver 02).
- **Os nomes dos estados não batem com a tela de trabalho.** O relatório diz
  "Aberto/Finalizado". A tela `/romaneios` usa os mesmos códigos com os nomes
  "Pendente/Concluído" e tem ainda "Cancelado" (`2`), que **não existe no filtro do
  relatório**. Com "Todos", os cancelados devem entrar sem que dê para separá-los
  [deduzido].
- A rota é a mesma do cadastro `/rotas` (ver 08), usada também na força de vendas (ver
  14).

### 2.17 `/relatorios/produtos-cadastro` — Produtos — estoque e valores [visto]

**Objetivo:** mostrar a situação atual dos produtos da filial: preço de venda, preço de
compra e valor do estoque a custo e a preço de venda. A frase da tela cita o
"FrmRelatorio" do Delphi, ou seja, é uma cópia de um relatório do desktop ("layout do
sistema antigo", segundo a Central).

**Filtros** (7). **Não há período:** o relatório mostra a situação de agora.

| Filtro | Tipo | Nome interno | Opções / padrão |
|---|---|---|---|
| Grupo | lupa `produto_grupo` | `id_grupo` | vazio = todos |
| Fabricante | lupa `fabricante` | `id_fabricante` | vazio = todos |
| Subgrupo | lupa `produto_sub_grupo` | `id_sub_grupo` | vazio = todos |
| Cor | lupa `produto_cor` | `id_cor` | vazio = todos |
| Status | lista | `status` | **Ativos** (`1`, padrão) · Todos (`todos`) · Inativos (`0`) |
| Estoque maior que 0 | caixa "Sim" | `estoque_maior_zero` = 1 | desmarcada |
| Somente serviço | caixa "Sim" | `somente_servico` = 1 | desmarcada |

**O que deve mostrar [deduzido]:** uma linha por produto (código, descrição, unidade,
saldo na filial, preço de venda, preço de compra, saldo × preço de compra e saldo ×
preço de venda) e os totais a custo e a venda. A diferença entre os dois é a margem que
o estoque ainda pode dar.

**Regras e comportamento**

- O estoque é **por filial** (a empresa logada). A tela não deixa escolher a filial.
- Serviço é um produto marcado como serviço, no mesmo cadastro. Por isso existe o filtro
  "Somente serviço" (o botão "Migrar produtos-serviço" de `/servicos` passa esses
  produtos para o cadastro de serviços; ver 14).
- "Estoque maior que 0" tira os produtos zerados e, se houver, os negativos [deduzido].
- **Como o produto se classifica:** grupo → subgrupo, mais fabricante e cor. A cor é
  herança de um cadastro genérico de grade. O cadastro rápido mostra que o grupo tem
  **comissão %** e **ordem**.
- A conta nasce com "PADRAO" em fabricante, subgrupo e cor, mas sem nenhum grupo.
- Não se viu se saem colunas fiscais do cadastro (NCM, CEST, código de barras) [a
  verificar].

### 2.18 `/relatorios/produtos-lista-precos` — Lista de preços [não aberta]

- **Não foi tentada**, depois de uma recusa na tela 2.34 (abri-la seria repetir a ação
  recusada com outro endereço).
- **O que a Central diz:** o cadastro de produtos com preço de compra, preço de venda,
  margem e saldo; 4 filtros; PDF, Excel e CSV; fica no bloco Produtos. No hub, está no
  grupo "Vendas extras".
- **Conclusão [deduzido]:** a margem é calculada a partir dos dois preços; o saldo é o
  estoque atual.
- **Perguntas:** a margem é sobre o custo (markup) ou sobre a venda? Quais são os 4
  filtros? Há várias tabelas de preço (varejo, atacado, por cliente)? Os parâmetros da
  empresa citam "tabela de preço" e preços por forma de pagamento e por modalidade (ver
  08), mas não se sabe se este relatório os mostra.

### 2.19 `/relatorios/compras-por-fornecedor` — Compras por fornecedor [visto]

**Objetivo:** somar as entradas de mercadoria (compras) do período, agrupadas por
fornecedor.

| Filtro | Tipo | Nome interno | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | data | `de` / `ate` | mês corrente |
| Fornecedor | lupa `pessoa` | `id_fornecedor` | a janela "Pesquisar — Pessoa" lista **todas** as pessoas, clientes incluídos |
| Status entrada | lista | `status` | Todos (`todos`) · Aberta (`0`) · **Concluída (`1`, padrão)** · Cancelada (`2`) |

**O que deve mostrar [deduzido]:** por fornecedor, a quantidade de entradas e o valor
total. Talvez também a participação em %.

**Regras e comportamento**

- Aqui "compras" quer dizer **entradas** (notas de compra lançadas), e não pedidos.
- Estados da entrada: **Aberta** (lançada, mas ainda não efetivada); **Concluída**
  (efetivada, com estoque e custo atualizados); **Cancelada**. O padrão "Concluída"
  mostra só o que de fato entrou.
- O fornecedor é uma **Pessoa** com o papel de fornecedor. A Central tem "Fornecedores
  cadastrados" (as pessoas marcadas como fornecedor, ver 19). Mesmo assim, a lupa não
  filtra por esse papel.

### 2.20 `/relatorios/compras-por-produto` — Compras por produto [visto em parte]

- A navegação funcionou e a aba mostrou o título "Compras por produto".
- A **leitura da página foi recusada** pela checagem de segurança do Claude Code (modo
  automático, motivo "Third-Party Attack"). Não houve nova tentativa nem outro caminho.
- O pouco que se sabe vem do cartão da Central: itens de entrada somados por produto
  (quantidade e custo) no período, com 5 filtros e saída em PDF, Excel e CSV. Está no
  menu.
- **Perguntas:** os 5 filtros (provavelmente período, fornecedor, produto e status da
  entrada, como em 2.22) [a verificar]; se agrupa por produto com custo médio do
  período.

### 2.21 `/relatorios/compras-pedidos` — Pedidos de compra [visto]

**Objetivo:** listar os pedidos de compra com fornecedor, status, previsão de entrega e
valor.

| Filtro | Tipo | Opções / padrão |
|---|---|---|
| Data inicial / Data final | data | mês corrente (visto na imagem) |
| Fornecedor | lupa | janela "Pesquisar — Pessoa" (Código, Nome, CPF/CNPJ); só "Consumidor final" |
| Status | lista | **Todos** (padrão, valor vazio) · Aberto (`aberto`) · Parcial (`parcial`) · Recebido (`recebido`) · Cancelado (`cancelado`) |

**O que deve mostrar [deduzido]:** por pedido, o número, a data, o fornecedor, o status,
o total e a previsão (as colunas da lista `/compras/pedidos`, ver 10). Talvez também
totais por status.

**Regras e comportamento**

- Os estados são guardados como **texto** (`aberto`, `parcial`...), e não como números
  (0, 1, 2) como nos outros relatórios. Isso sugere que o módulo de pedidos é mais novo,
  feito para a web, e não herdado do Delphi [deduzido].
- **Parcial** = parte dos itens já chegou; **Recebido** = o pedido chegou completo
  [deduzido].
- Não se sabe qual data o período usa: a da emissão ou a da previsão.

### 2.22 `/relatorios/compras-evolucao-custos` — Evolução de custos de compra [visto]

**Objetivo:** mostrar o histórico do preço de compra de cada produto nas entradas do
período.

| Filtro | Tipo | Opções / padrão |
|---|---|---|
| Data inicial / Data final | data | mês corrente (visto na imagem) |
| Fornecedor | lupa (Pessoa) | — |
| Produto | lupa | janela "Pesquisar — Produto" (Código, Descrição, Ref., UN); a conta não tem produtos |
| Status entrada | lista | Todos (`todos`) · Aberta (`0`) · **Concluída (`1`, padrão)** · Cancelada (`2`) |

**O que deve mostrar [deduzido]:** para cada produto, uma linha por entrada (data,
fornecedor, documento, custo unitário). Talvez também a variação em relação à compra
anterior.

**Regras e comportamento**

- O custo vem do item da entrada: cada compra grava o custo daquele momento.
- Não se sabe se o custo inclui frete, IPI, ST e descontos rateados, nem se o relatório
  tem gráfico ou variação em %.
- A tecla Esc para fechar a janela de Produto foi recusada pela checagem de segurança;
  a janela foi descartada quando a aba passou à tela seguinte, sem nada escolhido.

### 2.23 `/relatorios/nfe-rejeitadas` — NF-e rejeitadas / denegadas [visto]

**Objetivo:** listar as NF-e (modelo 55) que não estão nem autorizadas nem canceladas:
rejeitadas, denegadas e pendentes.

| Filtro | Tipo | Opções / padrão |
|---|---|---|
| Data inicial / Data final | data | não confirmado |
| Cliente | lupa | tipo da lupa não confirmado |

Não há filtro de status: o próprio relatório já é "tudo o que não deu certo".

**O que deve mostrar [deduzido]:** por nota, o número e a série, a data, o cliente, o
valor e o código e o motivo devolvidos pela SEFAZ.

**Regras e comportamento**

- O status da NF-e é guardado com o **código de retorno da SEFAZ** (cStat): 100 =
  autorizada e 101 = cancelada (ver os filtros de 2.24 a 2.26). Este relatório mostra
  todos os outros códigos.
- É uma fila de problemas em forma de relatório. A tela não tem atalho para corrigir nem
  para reenviar a nota.

### 2.24 `/relatorios/nfe-tributos` — NF-e: tributos [visto]

**Objetivo:** somar ICMS, PIS, COFINS, IPI e ICMS-ST das NF-e do período.

| Filtro | Tipo | Opções / padrão |
|---|---|---|
| Data inicial / Data final | data | não confirmado |
| Status | lista | **Autorizada (`100`, padrão)** · Todos (`todos`) · Cancelada (`101`) |

**O que deve mostrar [deduzido]:** a base e o valor de cada tributo, no total e talvez
nota a nota.

**Regras e comportamento**

- Os valores devem vir dos totais gravados na própria NF-e [deduzido].
- "Todos" junta notas autorizadas e canceladas, e talvez também as rejeitadas. Esse
  total não tem sentido fiscal.
- Cobre só a NF-e. A NFC-e tem relatório próprio (`nfce-tributos`, só na Central, ver
  19).
- A frase não cita FCP, DIFAL, IBS nem CBS, embora os relatórios de tributação de
  produtos já citem IBS e CBS.

### 2.25 `/relatorios/nfe-por-cfop` — NF-e por CFOP [visto]

**Objetivo:** resumir as NF-e do período agrupadas por CFOP.

| Filtro | Tipo | Opções / padrão |
|---|---|---|
| Data inicial / Data final | data | não confirmado |
| Status | lista | **Autorizada (`100`, padrão)** · Todos (`todos`); não há "Cancelada" |

**O que deve mostrar [deduzido]:** por CFOP, a quantidade de notas ou de itens, o valor
contábil, a base e o ICMS.

**Regras e comportamento**

- O CFOP fica no item da NF-e. Uma nota com dois CFOPs aparece em dois grupos
  [deduzido].
- Não há filtro para separar entradas de saídas nem para escolher um CFOP. O primeiro
  dígito do CFOP já diz o tipo: 1, 2 e 3 são entradas; 5, 6 e 7 são saídas [domínio].
- É quase igual a `sped-resumo-periodo` (2.31), que junta NF-e e NFC-e por CFOP.

### 2.26 `/relatorios/nfe-itens-fiscal` — NF-e itens — CFOP / CST / NCM [visto]

**Para que serve.** Listar os itens das NF-e (modelo 55) com a classificação fiscal de
cada um (CFOP, CST ou CSOSN, NCM) e os valores dos tributos (cartão da Central). É o
relatório de auditoria da tributação por item.

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial | `de` | data | dia 1 do mês |
| Data final | `ate` | data | hoje |
| Produto | `id_produto` | lupa (Produto) | — |
| Status NF | `status` | lista | **Autorizada** (`100`, padrão) · Todos · Cancelada (`101`) |
| — | `executar` | oculto | sempre `1` |

Ações: Pesquisar e Limpar (da lupa), **Gerar** (não clicado) e o link "Central".

**Visual [visto na captura]:** um cartão de filtros numa linha só (Data inicial, Data
final, Produto, Status NF e o botão escuro "Gerar"); abaixo, a página fica vazia. A dica
da lupa aparece cortada ("Clique na lup…").

**Regras e comportamento**

- **Por padrão, só notas autorizadas** [visto]. As canceladas ficam fora, o que é o
  certo para conferir tributos.
- **Filtro por produto** [visto]. Mostra como um mesmo produto saiu tributado em notas
  diferentes. Serve para achar erro de cadastro, como NCM ou CFOP errado [deduzido].
- **CST ou CSOSN** (Central). O relatório mostra um ou outro conforme o regime: CST no
  regime normal e CSOSN no Simples Nacional [domínio].
- **Só NF-e** [deduzido]. Existe um relatório irmão para NFC-e (`nfce-itens-fiscal`, só
  na Central, ver 19).
- **Data usada no período** (emissão ou autorização): não aparece [a verificar].

**O que o resultado deve mostrar [deduzido; não visto]:** uma linha por item (nota,
número e série, data, destinatário, produto, NCM, CFOP, CST/CSOSN, quantidade e valor);
os tributos (base e valor de ICMS, ICMS-ST, IPI, PIS e COFINS); totais no fim.

### 2.27 `/relatorios/mdfe-periodo` — MDF-e emitidos [visto]

**Para que serve.** Listar os manifestos de carga (MDF-e) do período (Central).

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Status | `status` | lista | **Todos** (padrão) · Pendente (`0`) · Autorizado (`1`) · Encerrado (`2`) · Cancelado (`3`) |
| — | `executar` | oculto | `1` |

**Regras e comportamento**

- **Ciclo de vida do MDF-e** [visto nos status]: nasce **Pendente**; passa a
  **Autorizado** na SEFAZ; termina **Encerrado** (fim da viagem) ou **Cancelado**.
- **Regras legais** [domínio; confirmar]: o MDF-e acompanha a carga e precisa ser
  encerrado quando a viagem acaba; um manifesto esquecido em aberto pode impedir a
  emissão do próximo para o mesmo veículo; o cancelamento só vale num prazo curto depois
  da autorização e antes de a viagem começar.
- **Uso prático** [deduzido]: filtrar "Autorizado" mostra os manifestos que ainda não
  foram encerrados, a principal pendência operacional deste documento. O relatório não
  destaca isso: o usuário tem de lembrar de filtrar.

**O que o resultado deve mostrar [deduzido; não visto]:** número, série, emissão, UF de
carga e de descarga, veículo, condutor, quantidade de documentos, peso, valor da carga e
status.

### 2.28 `/relatorios/cte-periodo` — CT-e emitidos [visto]

**Para que serve.** Listar os conhecimentos de transporte (CT-e) **emitidos** no período
(Central). O CT-e é o documento do frete; quem o emite é quem presta o serviço de
transporte [domínio].

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Status | `status` | **texto livre** | vazio, sem dica nem lista |
| — | `executar` | oculto | `1` |

**Regras e comportamento**

- **Status em texto livre** [código]: o MDF-e, que é parecido, tem lista; o CT-e não. O
  usuário não sabe o que escrever. Provavelmente o relatório foi configurado sem a lista
  de opções [deduzido].

**O que o resultado deve mostrar [deduzido; não visto]:** número, série, emissão,
tomador, remetente, destinatário, valor da prestação, ICMS do frete e status.

### 2.29 `/relatorios/fiscal-manifestacao-nfe` — Manifestação DF-e [visto]

**Para que serve.** Acompanhar as notas de compra emitidas contra o CNPJ da empresa e a
fase da manifestação de cada uma: ciência, confirmação ou desconhecimento (Central).

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Situação DF-e | `status` | lista | **Todos** (vazio, padrão) · Pendente (`F`) · Ciência (`P`) · Finalizada (`T`) |
| — | `executar` | oculto | `1` |

**Regras e comportamento**

- **Três fases** [visto], as mesmas dos indicadores da tela `/manifestacao-nfe` (ver
  13): **Pendente** (a nota chegou pela SEFAZ e ainda não teve nenhum evento);
  **Ciência** (a empresa avisou que conhece a nota, o que libera o XML completo, mas
  não encerra o ciclo); **Finalizada** (houve um evento conclusivo: confirmação,
  desconhecimento ou operação não realizada).
- **O filtro não separa os eventos finais** [deduzido]. "Finalizada" junta uma compra
  confirmada e uma nota desconhecida (possível fraude). Para o comerciante, são
  situações bem diferentes.
- **Letras sem sentido aparente** (`F`, `P`, `T`) [código]. Parecem um código interno
  herdado [a verificar].
- **Origem dos dados** [deduzido]: a consulta automática à SEFAZ (Distribuição DF-e,
  ver 13) traz as notas, e a moldura avisa cada nota nova ("Nova NF-e para manifestar",
  ver 5).

**O que o resultado deve mostrar [deduzido; não visto]:** chave, número, emitente (nome
e CNPJ), emissão, valor, situação, último evento e data do evento. Falta saber se mostra
o prazo que resta para manifestar [a verificar].

### 2.30 `/relatorios/nfse-emitidas` — NFS-e emitidas [visto]

**Para que serve.** Listar as notas de serviço (NFS-e) emitidas no período (Central).

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa (Pessoa) | — |
| Status NFS-e | `status` | **texto livre** | vazio, sem dica |
| — | `executar` | oculto | `1` |

Ações: Pesquisar e Limpar (da lupa), **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **A NFS-e nasce da ordem de serviço.** "Gerar NFS-e" pede o número da OS (ver 13). O
  relatório deve trazer a OS de origem [a verificar].
- **Filtro por cliente** com a lupa genérica de Pessoa [código]: o título da janela é
  "Pessoa", não "Cliente"; pode listar também fornecedores e colaboradores [a
  verificar].
- **Status em texto livre** [código], como no CT-e.
- No hub, está no grupo "Vendas extras".

**O que o resultado deve mostrar [deduzido; não visto]:** número da NFS-e e do RPS,
data, tomador, serviço, valor, ISS (retido ou não) e status. Não se sabe de que
prefeitura nem de que padrão.

### 2.31 `/relatorios/sped-resumo-periodo` — SPED — resumo fiscal do período [visto]

**Para que serve.** Consolidar, por CFOP, as NF-e e NFC-e autorizadas do período, como
base para o SPED (Central).

**Filtros:** só o período (`de` e `ate`, do dia 1 do mês até hoje) e o oculto
`executar=1`.

**Regras e comportamento**

- **Só documentos autorizados, com dois modelos juntos** (55 e 65) (Central).
- **Agrupamento por CFOP** (Central). Equivale ao resumo analítico que o arquivo da EFD
  ICMS/IPI pede para cada documento, por CST, CFOP e alíquota [domínio].
- **Serve para conferir antes de gerar o arquivo** [deduzido]. O relatório só mostra:
  o arquivo é gerado noutra tela, o atalho "SPED Fiscal / Contribuições", que leva a
  `/producao/sped-bloco-k` (ver 13).
- **Entradas** [a verificar]. A descrição só fala das notas emitidas. Não se sabe se as
  notas de compra entram.
- No hub, está no grupo "Vendas extras".

**O que o resultado deve mostrar [deduzido; não visto]:** por CFOP, valor contábil, base
de ICMS, ICMS, base e valor de ST, IPI e outros, com total geral.

### 2.32 `/relatorios/icms-mensal` — ICMS — créditos e débitos do mês [visto]

**Para que serve.** Somar as notas de entrada e de saída do período, com os créditos e
débitos de ICMS de cada lado (Central). É uma prévia da apuração do ICMS; só mostra, não
gera arquivo nem guia [deduzido].

**Filtros:** só o período (`de` e `ate`) e o oculto `executar=1`.

**Regras e comportamento**

- **Conta da apuração** [domínio]: débitos (saídas) menos créditos (entradas) dão o ICMS
  a recolher ou o saldo credor.
- **O nome diz "do mês", mas o filtro aceita qualquer intervalo** [visto]. Não há
  seletor de mês. Dá para misturar meses sem querer [deduzido].
- **Faltam itens de uma apuração completa** [deduzido; a verificar no resultado]. Não
  aparecem como filtro nem na descrição: o saldo credor do mês anterior, os ajustes, a
  substituição tributária (ST) e o diferencial de alíquota.
- **Pouco útil no Simples Nacional** [domínio]: nesse regime, o ICMS é pago dentro do
  DAS e, em regra, não há crédito; a maioria dos pequenos comércios de alimentação está
  nele; o relatório serve mais ao regime normal.
- No hub, está no grupo "Vendas extras".

### 2.33 `/relatorios/ml-pedidos` — Pedidos Mercado Livre [visto]

**Para que serve.** Listar os pedidos que vieram do Mercado Livre, com o status no
Mercado Livre, o comprador e a nota fiscal automática (Central).

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Status ML | `status` | **texto livre** | vazio, sem dica |
| — | `executar` | oculto | `1` |

**Regras e comportamento**

- **Pedidos importados** (Central). Chegam pela integração; ninguém os digita. A moldura
  avisa cada venda nova do Mercado Livre [código] (ver 5). Segundo a documentação da
  integração (ver 06), o webhook e uma rotina a cada 5 minutos importam os **pedidos
  pagos** e criam uma venda confirmada no ERP, com canal ML, frete e totais, e baixam o
  estoque [afirmado pelo manual].
- **O status é o do Mercado Livre, não o do ERP** (Central): na API do Mercado Livre os
  status de pedido vêm em inglês (por exemplo, `paid` e `cancelled`) [domínio]; com
  texto livre, o usuário não sabe se escreve em português ou em inglês [a verificar].
- **"NF automática"** (Central): o ERP emite a NF-e a partir do pedido quando a opção
  "emitir NF-e" da integração está ligada (ver 06) [afirmado pelo manual]; o controle do
  pedido guarda a situação da NF-e (emitida, erro ou ignorado) e o relatório deve
  mostrar se a nota saiu [deduzido]. Falta saber com que operação e série, e se a nota
  é enviada de volta ao Mercado Livre [a verificar].
- **Sem filtro de conta** [visto]. Se a empresa tiver mais de uma conta no Mercado
  Livre, o relatório mistura tudo [a verificar].
- Está no hub (grupo "Fiscal e canais") e no menu ("Pedidos Mercado Livre").

**O que o resultado deve mostrar [deduzido; não visto]:** número do pedido no Mercado
Livre, data, comprador, itens, total, tarifa, frete, status, venda gerada no ERP e
número da nota.

### 2.34 `/relatorios/ml-anuncios` — Anúncios Mercado Livre [não aberta]

- **A abertura foi recusada** pela trava automática do Claude Code ("Third-Party
  Attack"). A tela não foi vista. No menu chama-se "Anúncios ML"; no hub, está no grupo
  "Vendas extras".
- **O que a Central diz:** lista os anúncios do Mercado Livre ligados a produtos do ERP,
  com o status de sincronização; tem 2 filtros e sai em PDF, Excel e CSV.
- **Conclusão** [deduzido]: cada anúncio fica ligado a um produto (vínculo pelo ID MLB,
  à mão ou por SKU, com marca "sincronização ativa", ver 06); o status de sincronização
  indica se a última atualização deu certo.
- **O que a documentação da integração responde** (ver 06) [afirmado pelo manual]: o
  **estoque** vai do ERP para o Mercado Livre depois de cada venda e a cada 10 minutos,
  para todos os anúncios com sincronização ativa; o **preço** não aparece como
  sincronizado.
- **Perguntas:** quais são os 2 filtros (provavelmente status e produto); se mostra a
  data da última sincronização e o erro.

### 2.35 `/relatorios/loja-pedidos` — Pedidos loja virtual [não aberta]

- **Não foi tentada**, depois da recusa em 2.34.
- **O que a Central diz:** pedidos da loja virtual, com frete, cupom e status; 3 filtros;
  PDF, Excel e CSV. No hub, fica no grupo "Fiscal e canais".
- **Conclusão** [deduzido]: o pedido da loja guarda o valor do frete e o cupom de
  desconto usado; os 3 filtros devem ser o período (2) e o status [a verificar].
- O pedido online é gravado como uma **venda** do ERP (usa `id_venda`; a notificação
  "Nova venda — Loja virtual" traz o nº da venda), com efeito em estoque e financeiro
  [deduzido; ver 06]; o manual diz que "o pedido vira venda sozinho" [afirmado pelo
  manual].
- **Perguntas:** estados do pedido; forma de pagamento e gateway.

## 3. Fluxos de ponta a ponta

[deduzidos dos filtros, das descrições e das telas de operação, salvo indicação]

### 3.1 Compra: do pedido à nota, ao estoque e aos relatórios

1. Alguém pede a compra (solicitação, com itens e quantidades) (ver 10).
2. Faz-se a cotação com um ou mais fornecedores (valor total, prazo, status).
3. A aprovação da cotação gera o **pedido** (aberto, com previsão de entrega). O manual
   descreve "solicitação → cotação → aprovação → pedido → recebimento", mas não há tela
   própria de aprovação nem de recebimento no menu (ver 10 e 22).
4. No recebimento, a nota do fornecedor entra pelo XML da NF-e (com chave; upload ou
   consulta automática à SEFAZ, DistDFe, que dá ciência e baixa o arquivo) ou à mão, e
   vira uma **entrada**. Em `/entradas-xml` (ver 09) a importação cria a entrada com
   status `0` (Aberta ou "Pendente"), cadastra o fornecedor se preciso, converte o CFOP
   e liga cada item a um produto pelo GTIN ou pela referência. Se faltar mercadoria, o
   pedido fica "parcial"; se vier tudo, "recebido".
5. Conferência e conclusão: o status passa a `1` (Concluída) [a verificar onde fica o
   botão]. Na conclusão, provavelmente: nascem as linhas `E` no kardex; são criados os
   títulos a pagar (2.8); o custo do produto é atualizado, se o parâmetro "entrada
   atualiza custo" estiver ligado (ver 08).
6. Onde a compra aparece: "Entradas XML" (cabeçalho); "Entradas — itens", origem XML
   (itens); "Entradas de estoque (kardex)" (movimento); "Compras por período"; "Compras
   por fornecedor"; "Compras por produto"; "Evolução de custos"; "Entradas × contas a
   pagar"; e "Pedidos de compra" para o estado do pedido.
7. Cancelamento: o status passa a `2`. [a verificar] Se o kardex é estornado com uma
   linha `S`.

### 3.2 Compra com manifestação

1. A SEFAZ entrega a nota emitida contra o CNPJ (Distribuição DF-e).
2. A moldura mostra o aviso "Nova NF-e para manifestar".
3. Na tela de manifestação (ver 13), a empresa dá ciência, o que libera o XML.
4. A nota é importada como entrada e entra no estoque (3.1).
5. A empresa confirma (ou registra desconhecimento ou operação não realizada).
6. O relatório 2.29 passa a mostrar "Finalizada".

### 3.3 Entrada manual e devolução de venda

1. Em `/entradas-manual` (ver 09), o usuário informa data, pessoa, operação (41
   opções), finalidade (Normal, Complementar, Ajuste ou Devolução) e itens com o custo
   sugerido pelo sistema.
2. Com a finalidade "Devolução", a operação muda sozinha para "Devolução de venda" e dá
   para puxar os itens de uma venda.
3. Ao concluir, nascem as linhas `E` no kardex.
4. Relatórios: "Entradas manuais", "Entradas — itens" (origem manual) e o kardex de
   entradas; fora deste grupo, "Devoluções de venda" (ver 19).

### 3.4 Saída manual ou fiscal

1. Em `/saidas-manual` (ver 09), o usuário informa a pessoa, a operação (perda,
   consumo, bonificação, devolução de compra, remessa...) e os itens, com desconto e
   acréscimo.
2. A saída pode levar NF, e a NF-e pode ser emitida a partir dela, no módulo fiscal
   [deduzido].
3. Ao concluir, nascem as linhas `S` no kardex.
4. Relatórios: "Saídas manuais/fiscais — período", "Saídas — itens" e o kardex de saídas.

### 3.5 Vendas, OS, trocas e transferências no kardex

Vendas (balcão, PDV, delivery, loja, Mercado Livre), peças de OS, trocas e
transferências também mexem no kardex, com linhas `S` ou `E`. Elas aparecem nos
relatórios de kardex (2.1 a 2.3), mas não nos relatórios de documento (2.4 a 2.10)
[deduzido]. O saldo é guardado por filial.

### 3.6 Análise do estoque e ação

1. "Produtos — estoque e valores" mostra a situação de hoje, a custo e a venda;
   "Estoque valorizado por grupo" mostra onde está o dinheiro empatado.
2. "Estoque sem movimento" (padrão de 90 dias) mostra o que não gira; "Giro de estoque"
   compara o que se vendeu no período com o saldo atual.
3. Ações possíveis no próprio ERP [deduzido]: mudar o preço ou fazer promoção; devolver
   ao fornecedor (saída com a operação "Devolução compra"); dar baixa por perda
   ("Extravio / Perda"); inativar o produto; contar de novo no balanço.

### 3.7 Inventário (balanço)

1. Abre-se um balanço (Pendente) e contam-se os produtos. O sistema guarda o saldo
   anterior de cada um.
2. Ao concluir, a diferença vira ajuste de estoque (movimento `B`) [deduzido].
3. `estoque-balanco` mostra sobras e faltas por período e por produto.

### 3.8 Transferência entre filiais

1. A filial de origem cria a transferência (Pendente), com os itens.
2. Ao concluir, a mercadoria sai da origem e entra no destino. Também pode ser cancelada
   [deduzido].
3. `estoque-transferencias` lista as transferências por período, status e produto.

### 3.9 Expedição (romaneio de carga)

1. As vendas dos clientes de uma rota, com ou sem NF-e, ficam prontas para entrega.
2. No novo romaneio (ver 02), escolhem-se o motorista, o veículo e a rota. "Adicionar
   vendas" traz as vendas da rota. O sistema põe as entregas em ordem (distância, tempo,
   "rota otimizada") e soma o valor, o peso e os volumes.
3. Imprimem-se a lista de separação (para montar a carga), o romaneio (para o motorista)
   e o itinerário.
4. Depois da entrega, o romaneio é concluído (fica registrado quem fechou) ou cancelado.
5. `estoque-romaneio` lista os romaneios por período, status e rota.

### 3.10 NF-e → SEFAZ → relatórios fiscais; fechamento fiscal do mês (regime normal)

1. Durante o mês: as vendas geram NFC-e ou NF-e (a NF-e é emitida a partir da venda ou
   da saída); as ordens de serviço geram NFS-e; o transporte gera CT-e ou MDF-e.
2. A SEFAZ devolve um código: 100 = autorizada; 101 = cancelada; os outros são
   rejeição, denegação ou pendência.
3. Compras: a SEFAZ entrega as notas emitidas contra o CNPJ, a moldura avisa, a empresa
   dá ciência, importa o XML como entrada e confirma (3.2).
4. Conferência por item ("NF-e itens"): NCM, CFOP e CST/CSOSN de cada produto. Um erro
   vira correção no cadastro do produto ou na tributação.
5. Pendências a resolver: notas rejeitadas (`nfe-rejeitadas`); manifestações em
   "Pendente" ou "Ciência"; MDF-e ainda "Autorizado" (não encerrado).
6. Totais: `nfe-tributos` (soma dos impostos destacados), `nfe-por-cfop` e
   `sped-resumo-periodo` (resumo por CFOP, base para conferir o SPED com o contador) e
   `icms-mensal` (créditos contra débitos).
7. Gerar o arquivo SPED noutra tela e entregar ao contador. Não se viu envio direto ao
   contador.

### 3.11 Transporte com MDF-e

1. A NF-e da carga é emitida.
2. O MDF-e nasce "Pendente" e passa a "Autorizado".
3. A viagem acontece e o MDF-e é encerrado ("Encerrado").
4. Se der errado antes de sair, o MDF-e é cancelado ("Cancelado").
5. O relatório filtrado por "Autorizado" mostra os que faltam encerrar.
6. [hipótese] O romaneio guarda as chaves das NF-e da carga, que é o que o MDF-e
   precisa; não se viu ligação direta.

### 3.12 Serviço com NFS-e

1. A OS é concluída (ver 14).
2. "Gerar NFS-e" usa o número da OS (ver 13).
3. A nota vai para a prefeitura.
4. O relatório mostra as notas por cliente e status.

### 3.13 Mercado Livre

1. A conta do Mercado Livre é ligada ao ERP (ver 06).
2. Cada venda paga vira um pedido importado, com aviso no sino.
3. O pedido vira venda no ERP, com NF automática se a opção estiver ativa.
4. O relatório de pedidos mostra tudo isso.
5. Em paralelo, os anúncios ligados a produtos recebem o estoque, e o relatório de
   anúncios mostra o status de sincronização.

### 3.14 Loja virtual

1. O pedido chega com frete e cupom e é gravado como venda.
2. O status muda ao longo do atendimento.
3. O relatório lista os pedidos.

## 4. Entidades e relações

[vistas ou deduzidas; os campos "prováveis" não foram vistos]

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| **Movimento de estoque (kardex, tabela `estoque`)** | id, data, tipo (`E`, `S`, `B`), produto, quantidade, saldo anterior, saldo atual, grade, operação, usuário, filial, documento de origem (entrada, saída, OS, venda, balanço) | N:1 Produto; N:1 documento de origem; N:1 Empresa/filial; gerado por vendas, entradas, saídas, balanços, transferências e OS |
| **Produto** | id, código, descrição, referência de fábrica, unidade, status (ativo/inativo), marca de serviço, grupo, subgrupo, fabricante, cor, preço de venda, preço de compra (custo), margem, saldo por filial, peso bruto e líquido [deduzido do romaneio] | N:1 Grupo, Subgrupo, Fabricante, Cor; 1:N Movimentos; itens de venda, entrada, saída, balanço, transferência e NF-e; 1:N Anúncio do Mercado Livre |
| **Grupo de produto** | id (sequência `PRODUTO_GRUPO`), descrição (maiúsculas), status, % de comissão, ordem | 1:N Produtos |
| **Subgrupo, Fabricante, Cor** | código (fabricante: sequência `FABRICANTE`), descrição (maiúsculas), status | 1:N Produtos; "PADRAO" criado junto com a conta |
| **Entrada (documento)** | id, data de entrada, pessoa (fornecedor ou cliente), **chave NF-e** (preenchida = XML, vazia = manual), NF nº, série, emissão, operação, finalidade, venda de origem (devolução), total, status (`0` Aberta, `1` Concluída, `2` Cancelada) | N:1 Pessoa; 1:N Itens de entrada; 1:N Movimentos `E`; 0..N Títulos a pagar [deduzido]; 0..1 Pedido de compra; 0..1 DF-e recebido |
| **Item de entrada** | produto, quantidade, custo unitário, total, grade, local | N:1 Entrada; N:1 Produto |
| **Saída (documento manual ou fiscal)** | id, data, pessoa, operação, finalidade, NF nº, série, emissão, total, status (`0`, `1`, `2`) | N:1 Pessoa; 1:N Itens de saída; 1:N Movimentos `S`; 0..1 NF-e [deduzido] |
| **Item de saída** | produto, quantidade, valor unitário, desconto %, desconto R$, acréscimo, líquido | N:1 Saída; N:1 Produto |
| **Balanço** | data, status (`0` Pendente, `1` Concluído) | 1:N itens (produto, saldo anterior, contado, diferença); gera movimentos `B` |
| **Transferência** | data, filial de origem, filial de destino, status (`0` Pendente, `1` Concluída, `2` Cancelada) | 1:N itens (produto, quantidade) |
| **Romaneio de carga** | id, data, hora, status (`0`, `1`, `2`), usuário de abertura e de fechamento, motorista, veículo, rota padrão; totais de valor, peso bruto, peso líquido, volumes e nº de NF-e | N:N vendas (ordem, distância, tempo, NF-e e chave, valor, pesos, volumes, rota, forma de pagamento) |
| **Rota, Motorista, Veículo** | lupas não abertas | rota: clientes da rota, romaneios e visitas da força de vendas |
| **Pessoa** | id, código, nome ou razão social, CPF/CNPJ; papéis cliente, fornecedor, colaborador; o registro 1 é "CONSUMIDOR FINAL" | fornecedor das entradas e dos pedidos; cliente/destinatário das saídas, NF-e e NFS-e; tomador |
| **Solicitação de compra / Cotação / Pedido de compra** | solicitação (itens, quantidades, status); cotação (fornecedor, valor total, prazo, status); pedido (número, fornecedor, status `aberto`/`parcial`/`recebido`/`cancelado`, total, previsão) | solicitação → cotação → (aprovada) pedido → uma ou mais entradas |
| **Documento fiscal (NF-e 55 / NFC-e 65)** | número, série, chave, data, status = código SEFAZ (100, 101 ou outro), destinatário, totais de ICMS, ST, IPI, PIS e COFINS | N:1 Pessoa; 1:N Item do documento; nasce de uma venda ou saída; N:N MDF-e (carga) |
| **Item do documento fiscal** | produto, NCM, CFOP, CST ou CSOSN, quantidade, valor, base e valor de ICMS, ST, IPI, PIS, COFINS | N:1 Documento; N:1 Produto |
| **MDF-e** | número, série, data, status (`0` Pendente, `1` Autorizado, `2` Encerrado, `3` Cancelado); prováveis: UFs, veículo, condutor | N:N NF-e e CT-e transportados |
| **CT-e** | número, série, data, status (texto); prováveis: tomador, remetente, destinatário, valor do frete, ICMS | N:1 Pessoa, em vários papéis |
| **DF-e recebido (manifestação)** | chave, emitente, emissão, valor, situação (`F` Pendente, `P` Ciência, `T` Finalizada) | 1:N Evento de manifestação; 1:0..1 Entrada por XML |
| **NFS-e** | número, data, status (texto); prováveis: RPS, serviço, valor, ISS | N:1 Pessoa (cliente); N:1 OS |
| **Pedido do Mercado Livre** | número no Mercado Livre, data, status ML (texto), comprador, NF automática (situação emitida/erro/ignorado) | 1:0..1 Venda; 1:0..1 Documento fiscal; N:1 Conta do Mercado Livre (provável) |
| **Anúncio do Mercado Livre** | ID MLB, status de sincronização, sincronização ativa | N:1 Produto |
| **Pedido da loja virtual** | data, frete, cupom, status | é uma Venda (`id_venda`); N:1 Cliente; N:0..1 Cupom |
| **Empresa / filial** | — | estoque por filial; transferências entre filiais; relatórios sempre da empresa logada |

## 5. Integrações

| Integração | Onde aparece neste grupo | Evidência |
|---|---|---|
| SEFAZ — NF-e de entrada (upload do XML ou DistDFe com manifestação) | alimenta "Entradas XML" e "Entradas — itens"; relatório e aviso de manifestação | [visto] filtros; [código] aviso |
| SEFAZ — NF-e e NFC-e emitidas | status 100/101 nos filtros; rejeitadas; resumo do SPED; a NF-e de saída pode nascer de uma saída fiscal | [código] e Central |
| SEFAZ — MDF-e | ciclo Pendente → Autorizado → Encerrado ou Cancelado | [código] |
| SEFAZ — CT-e | relatório de CT-e emitidos | Central |
| Prefeitura — NFS-e | relatório de NFS-e emitidas | Central |
| SPED EFD ICMS/IPI | resumo "base SPED" por CFOP; o arquivo sai noutra tela (ver 13) | Central |
| Mercado Livre — pedidos | pedidos importados, aviso de venda nova (`/erp/notificacoes/ml/poll`; janela de "nova venda"; marcar como lido por POST em `/erp/notificacoes/ml/{id}/lida`), NF automática | Central e [código] |
| Mercado Livre — anúncios | anúncios ligados a produtos, status de sincronização; estoque enviado ao ML (ver 06) | Central; [afirmado pelo manual] |
| Loja virtual própria | pedidos com frete e cupom | Central |
| Mapas e roteirização | o romaneio tem distância e tempo por entrega e "Ver rota otimizada" (ver 02) | [deduzido] |
| MDF-e × romaneio | o romaneio guarda as chaves das NF-e da carga | [hipótese] |
| Impressão | romaneio, separação e itinerário (tela de trabalho); não se sabe se usa a impressão do navegador ou o agente local "Bridge" | [visto] botões |
| Sistema Delphi antigo | as telas citam "FrmRelatorio" e "FrmRomaneio_Carga"; o ERP web lê as mesmas tabelas | [visto] |
| Exportação | PDF, Excel e CSV gerados na hora no servidor, mais impressão; fila assíncrona só prometida (ver 19) | Central; não visto |

- O aviso de manifestação (`/erp/notificacoes/manifestacao/poll`) mostra "Nova NF-e
  para manifestar", com emitente, data, valor e o link "Abrir Manifestação"; some
  sozinho em 10 segundos e espera enquanto o mouse está em cima [código]. Os outros
  canais de aviso da moldura estão no 19.
- **Não há** nestas telas: bancos, TEF, balança, impressora térmica, WhatsApp nem
  e-mail. Os relatórios só leem o banco do ERP (formulários GET e lupas internas).

## 6. Oportunidades de UX

### 6.1 O que é confuso, lento ou excessivo

1. **Relatório às cegas, lupa lenta, jargão, Central pesada e "Processamentos"
   inacabado** são problemas de todos os relatórios (ver 19). Neste grupo pesam em
   especial: as frases citam a tabela `estoque`, o "tipo E", "chave NF-e preenchida",
   "Delphi FrmRelatorio" e "FrmRomaneio_Carga".
2. **Relatórios demais e repetidos.** "Kardex de entradas", "kardex de saídas" e
   "Movimentações de estoque" são o mesmo relatório com o tipo fixo; "Entradas XML",
   "Entradas manuais", "Compras por período", "Entradas — itens" e "Compras por
   produto" usam a mesma fonte com recortes diferentes; `nfe-por-cfop` e
   `sped-resumo-periodo` quase coincidem; o bloco Fiscal tem 17 relatórios, vários
   repetidos para NF-e e NFC-e. *Para nós:* poucos relatórios configuráveis (tipo,
   origem, nível documento ou item, agrupamento por fornecedor, produto ou período).
3. **Padrões escondidos que mudam os totais.** O status vem como "Concluída" nas
   entradas e como "Todos" em "Compras por período"; NF-e abre em "Autorizada" e
   Produtos em "Ativos". Os totais deixam de bater sem que o usuário perceba. *Para
   nós:* padrões coerentes e os filtros ativos como etiquetas no topo do resultado e no
   PDF.
4. **Status sem padrão e em texto livre.** Números (0, 1, 2), letras (E/S/B, F/P/T),
   texto (`aberto`, `parcial`) e códigos da SEFAZ (100, 101); em CT-e, NFS-e e Mercado
   Livre o usuário tem de adivinhar o valor. O romaneio é "Pendente/Concluído/
   Cancelado" na tela de trabalho e "Aberto/Finalizado" no relatório, que nem tem
   "Cancelado"; as entradas são "Aberta" nos relatórios e "Pendente" nas telas de
   operação; o tipo do movimento vai num parâmetro chamado `status`. *Para nós:* uma
   lista única de estados por entidade (para documento fiscal: rascunho, enviando,
   autorizado, rejeitado, denegado, cancelado, encerrado, inutilizado), com nome em
   português, seleção múltipla e a mesma etiqueta colorida na lista, no detalhe e no
   relatório; o código e a mensagem da SEFAZ num campo à parte.
5. **"Todos" soma o que não devia.** Em `nfe-tributos`, "Todos" junta notas autorizadas
   e canceladas. *Para nós:* uma coluna por status e nunca somar canceladas nos
   impostos.
6. **"Fornecedor" e "Cliente" aceitam qualquer pessoa**, e as lupas de Grupo, Fabricante,
   Subgrupo e Cor oferecem "Cadastrar novo" numa tela de consulta, com risco de lixo no
   cadastro. *Para nós:* filtrar pelo papel; relatório só lê.
7. **Filtros de um valor só.** Um produto, um grupo, um fabricante por vez. *Para nós:*
   escolher vários e poder excluir.
8. **Período sem atalhos.** Só há datas soltas. Faltam "ontem", "últimos 7 dias", "mês
   passado" e a comparação com o período anterior. "ICMS do mês" não tem seletor de mês.
   *Para nós:* escolher a competência (mês e ano) onde fizer sentido.
9. **Valor do estoque sem data e sem base.** Sai só "agora" e só a custo, o que não
   serve para o fechamento do mês. *Para nós:* posição numa data e escolha da base
   (custo médio, último custo, preço de venda).
10. **Kardex sem os filtros que importam.** Não dá para filtrar por operação, local,
    grade, usuário ou documento, e não há link para o documento de origem.
11. **Não dá para escolher a filial.** Para ver outra, é preciso trocar de empresa; as
    transferências não filtram origem nem destino; nada consolida as filiais. *Para
    nós:* uma filial, várias ou todas juntas em qualquer relatório de estoque.
12. **Giro "aproximado".** A conta usa o saldo de hoje. *Para nós:* giro = saídas ÷
    estoque médio do período, mais a cobertura em dias, com a fórmula explicada na tela.
13. **Pendências do dia a dia tratadas como relatório.** NF-e rejeitada, MDF-e por
    encerrar, nota por manifestar e pedido sem nota só aparecem se alguém lembrar de
    gerar o relatório certo, com o filtro certo. *Para nós:* uma fila de pendências
    fiscais no painel, com alerta ("3 notas de compra esperando confirmação", "1 MDF-e
    por encerrar") e ação ("corrigir e reenviar").
14. **A manifestação junta eventos diferentes em "Finalizada".** *Para nós:* mostrar o
    evento (confirmada, desconhecida, não realizada) e o prazo que resta.
15. **Sem filtros guardados, agendamento ou envio ao contador.** O link GET ajuda, mas
    não há "meus relatórios". *Para nós:* um "pacote do contador" mensal (XMLs, resumo
    por CFOP, ICMS e SPED), enviado sozinho por e-mail ou link.
16. **Pouco do bloco fiscal serve ao nosso público.** O pequeno comércio de alimentação
    costuma estar no Simples Nacional e emitir NFC-e. MDF-e, CT-e, apuração de ICMS e
    boa parte da manifestação são casos de nicho. *Para nós:* módulo opcional, ligado só
    para quem usa.
17. **Categorias desencontradas.** No hub, "Vendas extras" mistura NFS-e, SPED, ICMS,
    anúncios do ML e lista de preços com liberações e trocas; "Produtos — estoque e
    valores" aparece em dois grupos; os relatórios de entrada estão em Compras na
    Central.

### 6.2 O que vale copiar

- Formulário GET, com URL que dá para guardar e compartilhar; período padrão do mês.
- Um único componente de lupa, configurado pelo servidor (colunas e cadastro rápido
  declarados).
- PDF, Excel e CSV em todos os relatórios.
- Por padrão, só notas autorizadas nos relatórios fiscais.
- Os avisos de nota nova e de venda nova chegam sem precisar abrir a tela.
- O romaneio, com ordem de entrega, peso e volumes, lista de separação e itinerário.
  Serve aos comerciantes de alimentação que entregam por rota (distribuidoras, padarias
  que revendem, marmitarias).

### 6.3 Proposta de reconstrução (resumo) [proposta]

- **Estoque, em poucos relatórios:** "Kardex" (tipo, operação, documento, local e
  grade, com link para a origem); "Entradas" (nível documento ou item, origem XML ou
  manual); "Saídas" (por operação); "Estoque parado" (dias e valor parado); "Valor do
  estoque" (agrupar por grupo, fabricante ou local, com base de custo e data).
- **Fiscal:** um explorador único de documentos fiscais, com filtro de modelo (NFC-e,
  NF-e, NFS-e, CT-e, MDF-e) e as visões "por documento", "por item" e "por CFOP".
- **Compras:** permitir pedido direto, sem cotação, para o pequeno comerciante.
- Catálogo declarativo por módulo, filiais com consolidação e fila assíncrona para
  volume grande (estrutura geral no 19).

## 7. Pendências

1. **Telas não lidas:** `/relatorios/entradas-vs-pagar` (navegação recusada),
   `/relatorios/ml-anuncios` (abertura recusada), `/relatorios/compras-por-produto`
   (abriu, mas a leitura foi recusada), `/relatorios/produtos-lista-precos` e
   `/relatorios/loja-pedidos` (não tentadas depois da recusa). As recusas vieram da
   checagem de segurança do Claude Code (modo automático, motivo "Third-Party Attack");
   não foi problema de credencial (a sessão aberta funcionou nas outras telas) e não
   houve nova tentativa nem outro caminho. Na primeira tentativa deste grupo, nenhuma
   tela abriu pelo mesmo motivo. Completar depende de o dono da conta autorizar a
   leitura.
2. **O resultado dos relatórios não foi visto:** colunas, agrupamento, totais,
   ordenação, paginação, botões de PDF, Excel, CSV e impressão, e o limite de linhas.
   "Gerar" está na lista de proibidos; o formulário é GET (só leitura) e o dono pode
   autorizar de forma explícita gerar relatórios. Mesmo assim, esta conta não tem
   movimento: seria preciso uma conta com dados.
3. **Detalhes por confirmar nas telas lidas só por texto e árvore** (2.21 a 2.25): os
   nomes internos dos campos, o tipo da lupa "Cliente" em `nfe-rejeitadas` e as datas
   padrão das 3 telas de NF-e (2.23 a 2.25).
4. **Lupas não abertas:** Rota, Cliente (NF-e), Motorista e Veículo. Fabricante,
   Subgrupo e Cor só foram vistos pela configuração e pela contagem. O formulário
   "Cadastrar novo" de Grupo, Fabricante, Subgrupo e Cor não foi aberto.
5. **Data de referência dos filtros:** entradas (data de entrada ou emissão da NF?);
   saídas (data da saída ou emissão?); pedidos de compra (emissão ou previsão?);
   documentos fiscais (emissão, autorização ou data do pedido?).
6. **Estoque:** a base de custo usada em "Estoque valorizado por grupo", "Estoque sem
   movimento" e "Produtos — estoque e valores" ("P. Compra" é o último custo ou o custo
   médio?); se o balanço (`B`) conta como movimento e se entram os produtos nunca
   movimentados; onde entram os produtos sem grupo e os saldos negativos; se a entrada
   recalcula o custo (custo médio ou último custo); se "Saídas manuais/fiscais" inclui
   NF-e emitidas noutros módulos ou só o que nasce em `/saidas-manual`; se as saídas
   mostram custo e margem.
7. **Balanço:** concluir ajusta o estoque na hora? A diferença é valorizada a que custo?
   Existe balanço parcial (por grupo, por exemplo)?
8. **Transferência:** emite NF-e de transferência (CFOP 5152/6152)? "Pendente" é
   mercadoria em trânsito? Quem confirma a chegada no destino?
9. **Romaneio:** como calcula a distância, o tempo e a rota otimizada (que serviço de
   mapas)? O que é "Emb."? Gera MDF-e? Baixa estoque ou só organiza a entrega? O que
   muda ao concluir? (tela no 02)
10. **Compras:** como o recebimento parcial do pedido se liga às entradas; se o custo da
    evolução inclui frete, IPI, ST e descontos; se mostra variação em %.
11. **Fiscal:** se `nfe-rejeitadas` mostra o código e o motivo da SEFAZ e inclui notas
    em contingência; se `nfe-tributos` inclui FCP, DIFAL, IBS e CBS; se o resumo do SPED
    inclui notas de entrada; se o ICMS do mês inclui ST, diferencial de alíquota, saldo
    anterior e ajustes; o significado das letras `F`, `P` e `T` da manifestação e se há
    aviso de prazo; de que prefeitura e padrão é a NFS-e.
12. **Valores aceitos nos filtros de texto livre** (status do CT-e, da NFS-e e do
    Mercado Livre): desconhecidos. Dá para descobrir nas telas `/cte`, `/nfce` (aba
    NFS-e) e `/integracoes/mercado-livre/pedidos`, ou num relatório gerado.
13. **NF automática do Mercado Livre:** com que operação e série, e se volta para o
    Mercado Livre.
14. **Lupa de Pessoa:** se lista só clientes ou todas as pessoas nos filtros "Cliente"
    fiscais, e se aceita seleção múltipla.
15. **Permissões** por relatório ou por grupo de usuários: não vistas (o usuário ADMIN
    abriu todos). **Celular:** comportamento não testado.
16. Na passagem que leu 2.13 a 2.25, a leitura das notas locais sobre `/balancos` e
    `/transferencias` foi recusada pela mesma checagem, e os relatórios não foram
    cruzados com elas na hora. As telas de trabalho estão no 09; falta conferir se os
    estados e colunas de lá batem com os destes relatórios.

## 8. Sub-rotas descobertas

| Rota / endereço | O que é | Estado |
|---|---|---|
| `/relatorios/{slug}?executar=1&de=…&ate=…&status=…` | resultado de um relatório (o que "Gerar" faz) | **não aberto** |
| `/lookups/{tipo}/config`, `/lookups/{tipo}/search?q=&page=`, `/lookups/{tipo}/{id}` | API das lupas (genérica, ver 19); lida para `produto`, `pessoa`, `produto_grupo`, `fabricante`, `produto_sub_grupo`, `produto_cor` | lida / usada só para contar |
| `/erp/notificacoes/ml/poll`, `/erp/notificacoes/ml`, `/erp/notificacoes/ml/{id}/lida` (POST) | avisos de venda nova do Mercado Livre | só no código da moldura |
| `/erp/notificacoes/manifestacao/poll` | avisos de NF-e para manifestar | só no código |
| `/romaneios`, `/romaneios/create` | tela de trabalho do romaneio (fonte de 2.16) | lidas; descritas no 02 |
| `/compras`, `/compras/pedidos` | painel de compras e lista de pedidos (fonte de 2.21) | lidas; descritas no 10 |
| `/entradas-xml`, `/entradas-manual`, `/saidas-manual`, `/balancos`, `/transferencias`, `/estoque-log`, `/manifestacao-nfe` | telas de operação que alimentam estes relatórios | descritas no 09 e no 13 |
| `/producao/sped-bloco-k` | onde se gera o arquivo SPED | descrita no 13 |
