# 919 — Lacunas, lote 20: relatórios de OS e de estoque (kardex, entradas, saídas, análise)

> Exploração **só de leitura** feita em 2026-10-03 na conta de teste "Boi Criolo"
> (plano Full), numa aba própria do navegador embutido (`tab-52`, fechada no
> fim). A aba do usuário não foi tocada.
>
> - **As 12 telas da lista abriram.** Nos arquivos `20-relatorios-comissoes-os.md`
>   e `21-relatorios-estoque-compras-fiscal.md` elas tinham ficado bloqueadas.
> - **Nenhum relatório foi gerado.** As 12 telas seguem o modelo "filtros +
>   Gerar", e o botão "Gerar" está na lista de proibidos desta pesquisa. Filtros,
>   opções, nomes de parâmetros e lupas foram **vistos**. O conteúdo de cada
>   relatório (colunas e totais) foi **deduzido** da frase de explicação da tela,
>   do catálogo da Central de Relatórios e das telas de operação já documentadas
>   nesta pasta.
> - Nada foi gravado, gerado, exportado ou enviado. Os únicos registros que
>   apareceram são padrões do sistema (a pessoa "CONSUMIDOR FINAL" e o fabricante
>   "PADRAO"). Este arquivo não traz dados pessoais.
>
> Marcadores: **[visto]** na tela, no HTML do formulário ou na resposta de uma
> lupa; **[deduzido]** a partir da descrição, dos filtros ou de outros arquivos
> desta pasta; **[a verificar]** dúvida em aberto; **[proposta]** sugestão para o
> nosso ERP.

## Em uma frase

Os 12 relatórios são consultas, sem gravação, sobre dois assuntos:

- **Ordens de serviço:** produção por técnico, volume por cliente e OS que já
  viraram títulos a receber.
- **Estoque:** o kardex (movimentos de entrada e de saída), os documentos de
  entrada (XML e manual, por cabeçalho e por item), as saídas manuais ou fiscais
  (por cabeçalho e por item), o estoque parado e o valor do estoque por grupo.

Nenhuma destas telas cria ou altera registros.

---

## Estado das rotas

| # | Rota | Título na tela | Estado |
|---|---|---|---|
| 1 | `/relatorios/os-por-tecnico` | OS por técnico | lida (filtros; lupa de técnico aberta e pesquisada) |
| 2 | `/relatorios/os-por-cliente` | OS por cliente | lida (filtros; lupa de cliente aberta, seleção e limpeza testadas) |
| 3 | `/relatorios/os-faturadas` | OS faturadas (com títulos) | lida (filtros) |
| 4 | `/relatorios/estoque-entradas` | Entradas de estoque (kardex) | lida (filtros; lupas de Produto, Grupo e Fabricante abertas) |
| 5 | `/relatorios/estoque-saidas` | Saídas de estoque (kardex) | lida (filtros) |
| 6 | `/relatorios/entradas-itens` | Entradas de estoque — itens | lida (filtros) |
| 7 | `/relatorios/entradas-xml` | Entradas XML (NF-e) | lida (filtros) |
| 8 | `/relatorios/entradas-manual` | Entradas manuais | lida (filtros) |
| 9 | `/relatorios/saidas-periodo` | Saídas manuais/fiscais — período | lida (filtros) |
| 10 | `/relatorios/saidas-itens` | Saídas — itens | lida (filtros) |
| 11 | `/relatorios/estoque-sem-movimento` | Estoque sem movimento | lida (filtros) |
| 12 | `/relatorios/estoque-valor-grupo` | Estoque valorizado por grupo | lida (filtros) |

Em todas as 12, o resultado do relatório **não foi visto**, porque "Gerar" não foi
clicado.

**Abertas de passagem** (fora da lista, dentro do módulo):

- `/relatorios`: Central de Relatórios, aberta pela primeira vez nesta pesquisa;
- `/relatorios?categoria=overview`: categoria "Visão geral", vazia;
- `/relatorios/processamentos`;
- `/relatorios/movimentacoes-gerais`;
- `/relatorios/compras-periodo`.

**Recusada:** `/relatorios/entradas-vs-pagar`. A checagem de permissões do Claude
Code (modo automático) recusou a navegação, e ela não foi repetida.

### Registro técnico

- Navegação por URL. Leitura do texto e da estrutura das páginas. Leitura, por
  script e sem alterar nada, do HTML do formulário de filtros e das respostas
  GET das lupas.
- **Cliques feitos (nenhum grava nada):**
  - abrir as lupas de Técnico, Cliente, Produto, Grupo e Fabricante;
  - "Buscar" na lupa de colaborador (0 resultados);
  - selecionar "CONSUMIDOR FINAL" no filtro Cliente e depois limpar com o X
    (mexe só no estado local do filtro);
  - Esc para fechar as janelas.
- **Não clicados:** "Gerar" (nas 12 telas) e "Cadastrar novo" (lupas de Grupo e
  de Fabricante).

---

## 1. Visão geral do módulo

### 1.1 Onde ficam estas telas

- Todas ficam em `/relatorios/<slug>`. O título da aba do navegador é
  "<Título> - Relatórios".
- Cada tela tem o botão **"← Central"**, que leva a `/relatorios` (ver 3.1).
- Na Central, as 12 estão em três categorias:
  - **Ordem de Serviço:** os-por-tecnico, os-por-cliente e os-faturadas.
  - **Estoque:** estoque-entradas, estoque-saidas, saidas-periodo, saidas-itens,
    estoque-sem-movimento e estoque-valor-grupo.
  - **Compras:** entradas-itens, entradas-xml e entradas-manual. Os relatórios de
    *entrada* ficam em Compras, e não em Estoque.
- A moldura é a mesma do resto do ERP (barra de cima com Ctrl+K, Novidades,
  tema, notificações e "ADMIN"; coluna de ícones à esquerda; balão do
  assistente). Ela está descrita no arquivo 20.

### 1.2 Anatomia de uma tela de relatório (igual nas 12) [visto]

1. **Cabeçalho:** título, uma linha de explicação e o botão "← Central". A
   explicação muitas vezes cita nomes de tabela ou de campo do banco.
2. **Cartão de filtros:** um único formulário (`form-relatorio-filtros`) com
   **método GET**, que envia para a própria rota e leva o campo escondido
   `executar=1`. Consequências [deduzido]:
   - o servidor desenha o resultado na mesma URL;
   - a URL com os filtros pode ir para os favoritos ou ser compartilhada;
   - gerar é só leitura e não grava nada no banco. Mesmo assim, não foi
     clicado, por causa da regra desta pesquisa.
3. **Tipos de campo:**
   - período `de` / `ate` (campo de data do navegador; padrão do dia 1 do mês
     até hoje, ou seja, 01/10/2026 a 03/10/2026);
   - lupas;
   - listas;
   - texto livre (Placa);
   - número (Dias sem movimento).
4. **Sem validação visível.** Nenhum campo tem `required` nem limite de data.
   Nada impede, no navegador, uma data inicial maior do que a final. A validação
   no servidor está [a verificar].
5. **Um único botão, "Gerar".** Antes de gerar não há exportar, imprimir,
   guardar filtros nem agendar. A Central promete PDF, Excel, CSV e impressão em
   todos os relatórios. Esses botões devem aparecer junto do resultado
   [deduzido]. O ícone do "Gerar" é a mesma lupa usada nos campos de pesquisa.
6. **Uma fonte só [deduzido].** Em todas as 12 telas, o título e a explicação
   são iguais aos do cartão da Central, e o nº de filtros anunciado na Central
   bate com os campos do formulário. Ou seja, catálogo e telas saem da mesma
   definição de relatório.
7. **Layout:** grade Bootstrap (`col-md-3 col-lg-2`). No computador, os filtros
   ficam numa linha. No celular devem empilhar [deduzido; não testado].

### 1.3 A lupa (componente de pesquisa) e a API por trás dela [visto]

- **Estrutura do campo:**
  - um bloco `erp-lookup-field` com `data-lookup-type` (tipo de cadastro) e
    `data-lookup-name` (parâmetro enviado);
  - um campo escondido com o ID;
  - um campo visível só de leitura, com a dica "Clique na lupa para
    pesquisar...";
  - o botão **Pesquisar** (lupa) e o botão **Limpar** (X), que só aparece
    depois de escolhido um valor.
  - O script é `/js/erp-lookup.js`.
- **Ao abrir**, a janela faz duas chamadas GET:
  - `/lookups/{tipo}/config`: título, colunas e, quando há, a configuração de
    cadastro rápido;
  - `/lookups/{tipo}/search?q=&page=1`: a primeira página.

  A janela "Pesquisar — {título}" **já abre com a primeira página carregada**.
  Isso corrige a impressão do arquivo 20 de que ela "abre vazia": só fica vazia
  quando o cadastro está vazio.
- **Formato da resposta:** `items[]`, cada um com `id`, `label` e `cells` (uma
  célula por coluna), e `meta` com `current_page`, `last_page` e `total`.
- **Pesquisa e páginas:**
  - campo "por código ou descrição" e botão "Buscar" (nova chamada com `q`);
  - rodapé "Página X de Y (N registros)", com Anterior e Próximo;
  - "Fechar" ou Esc para sair.
- **Seleção:** um único clique na linha preenche o ID escondido e o nome
  visível, fecha a janela e mostra o X. O X apaga os dois. Testado no filtro
  Cliente; nada foi enviado.
- **Cadastro rápido:** "Cadastrar novo" aparece quando o tipo tem essa
  configuração (Grupo de Produto e Fabricante). Não foi clicado.
- **Detalhe de acessibilidade:** o rótulo visível ("Técnico responsável",
  "Cliente"...) aponta para um ID que não existe (`f-id_tecnico`). O campo de
  verdade (`id_tecnico-display`) tem um rótulo vazio. Um leitor de tela anuncia
  só a dica "Clique na lupa...".

| Tipo | Título da janela | Colunas | Cadastro rápido | Usado como | Registros na conta |
|---|---|---|---|---|---|
| `pessoa` | Pessoa | Código, Nome, CPF/CNPJ | não | **Cliente** (os-por-cliente, os-faturadas, saidas-periodo, saidas-itens) e **Fornecedor** (entradas-itens, entradas-xml, entradas-manual) | 1 (o registro padrão "CONSUMIDOR FINAL", código 1, sem documento) |
| `pessoa_colaborador` | Colaborador / Vendedor | Código, Nome, CPF/CNPJ | não | **Técnico responsável** (os-por-tecnico, os-faturadas) | 0 |
| `produto` | Produto | Código, Descrição, Ref. (`ref_fabrica`), UN (`unidade`) | não | Produto (estoque-entradas, estoque-saidas, entradas-itens, saidas-itens) | 0 |
| `produto_grupo` | Grupo de Produto | Código, Descrição | **sim:** Descrição (obrigatória, em maiúsculas); padrões status 1, comissão 0 e ordem 0; sequência `PRODUTO_GRUPO` | Grupo (estoque-entradas, estoque-saidas, estoque-sem-movimento, estoque-valor-grupo) | 0 |
| `fabricante` | Fabricante | Código, Descrição, Status | **sim:** Descrição (obrigatória, em maiúsculas); padrão status 1; sequência `FABRICANTE` | Fabricante (estoque-entradas, estoque-saidas, estoque-sem-movimento) | 1 ("PADRAO", com o status mostrado como "0") |

O que a configuração do cadastro rápido revela [deduzido]:

- O **grupo de produto** guarda descrição, status, **% de comissão** e ordem de
  exibição.
- Os códigos vêm de **sequências com nome** (`PRODUTO_GRUPO`, `FABRICANTE`), no
  estilo dos geradores do sistema antigo em Delphi.

### 1.4 Códigos e parâmetros que as telas revelam [visto]

| Conceito | Parâmetro | Valores |
|---|---|---|
| Disparo do relatório | `executar` | `1` (campo escondido) |
| Período | `de`, `ate` | AAAA-MM-DD; padrão: do dia 1 do mês até hoje |
| Status da OS (relatórios deste lote) | `status` | vazio = Todos · `0` Aberta · `1` Fechada. Cancelada (`2`) e Quitado (`4`) existem na OS (arquivo 14), mas não são oferecidos aqui |
| Status do título a receber (os-faturadas) | `status` | vazio = Todos os títulos · `0` com título em aberto · `1` com título quitado |
| Status do documento de entrada ou de saída | `status` | `todos` · `0` Aberta · `1` Concluída · `2` Cancelada. Nas telas de operação os nomes são Pendente, Concluído e Cancelado |
| Origem da entrada (entradas-itens) | `modo` | vazio = Todas · `xml` · `manual` |
| Tipo de movimento no kardex (movimentacoes-gerais) | `status` (!) | `todos` · `E` Entrada · `S` Saída · `B` Balanço |
| Saldo (estoque parado e valor por grupo) | `modo` (!) | `com_saldo` (padrão) · `todos` |
| Dias sem movimento | `dias_sem_movimento` | inteiro ≥ 1; padrão 90 |
| Pessoas e cadastros | `id_cliente`, `id_fornecedor`, `id_tecnico`, `id_produto`, `id_grupo`, `id_fabricante` | ID escolhido pela lupa |
| Placa | `placa` | texto livre |
| Categoria da Central | `categoria` | `overview`, `movimentacoes`, `vendas`, `caixa`, `financeiro`, `estoque`, `compras`, `clientes`, `fornecedores`, `produtos`, `crm`, `fiscal`, `comissoes`, `os`, `canais`, `producao`, `auditoria` |

(!) O mesmo nome de parâmetro tem sentidos diferentes conforme a tela: `status`
é às vezes um estado e às vezes um tipo; `modo` é às vezes a origem e às vezes o
saldo.

### 1.5 Dados existentes na conta

A conta de teste não tem produtos, grupos de produto, colaboradores, entradas
nem movimentos de estoque. Também não tem pessoas além do registro padrão
"CONSUMIDOR FINAL", e o único fabricante é o padrão "PADRAO". Mesmo gerados, os
relatórios sairiam vazios.

### 1.6 Mapa das 12 telas

| # | Rota | Categoria na Central | Filtros anunciados | Filtros (além do período, quando há) | Status padrão |
|---|---|---|---|---|---|
| 1 | os-por-tecnico | Ordem de Serviço | 4 | Técnico responsável, Status OS | Todos |
| 2 | os-por-cliente | Ordem de Serviço | 4 | Cliente, Status OS | Todos |
| 3 | os-faturadas | Ordem de Serviço | 6 | Cliente, Técnico responsável, Placa, Status do título | Todos os títulos |
| 4 | estoque-entradas | Estoque | 5 | Produto, Grupo, Fabricante | — |
| 5 | estoque-saidas | Estoque | 5 | Produto, Grupo, Fabricante | — |
| 6 | entradas-itens | Compras | 6 | Fornecedor, Produto, Status entrada, Origem | **Concluída** |
| 7 | entradas-xml | Compras | 4 | Fornecedor, Status | **Concluída** |
| 8 | entradas-manual | Compras | 4 | Fornecedor, Status | **Concluída** |
| 9 | saidas-periodo | Estoque | 4 | Cliente, Status | **Concluída** |
| 10 | saidas-itens | Estoque | 5 | Cliente, Produto, Status saída | **Concluída** |
| 11 | estoque-sem-movimento | Estoque | 4 | **sem período**: Dias sem movimento, Grupo, Fabricante, Saldo | — |
| 12 | estoque-valor-grupo | Estoque | 2 | **sem período**: Grupo, Saldo | — |

---

## 2. Telas

Todas as telas têm **o mesmo comportamento comum**: formulário GET, nenhum
campo obrigatório, botão "Gerar" (não clicado) e link "Central". Por isso, as
seções abaixo só registram o que é próprio de cada uma.

### 2.1 OS por técnico — `/relatorios/os-por-tecnico`

**Objetivo:** medir a produção de cada técnico responsável no período, ou seja,
quantas OS fez, quanto somam as peças, quanto somam os serviços e o total.

**Filtros** [visto]

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial | `de` | data | não | 01/10/2026 (dia 1 do mês) |
| Data final | `ate` | data | não | 03/10/2026 (hoje) |
| Técnico responsável | `id_tecnico` | lupa `pessoa_colaborador` | não | vazio = todos |
| Status OS | `status` | lista | não | Todos (vazio) · Aberta (`0`) · Fechada (`1`) |

**O que deve mostrar [deduzido]:** uma linha por técnico, com o nº de OS, a
soma das peças, a soma dos serviços e o total, mais um total geral. É a
produção do técnico, e não a comissão dele (comissão fica em "Comissões de OS",
no arquivo 20).

**Regras e comportamento**

- Agrupa pelo técnico do **cabeçalho** da OS ("responsável"). O técnico de cada
  linha de peça ou de serviço aparece noutros relatórios ("Serviços executados"
  e "Peças utilizadas", no arquivo 20) [deduzido pelo nome do filtro].
- Status: só Aberta e Fechada são oferecidos. Não se sabe se "Todos" inclui as
  OS canceladas e quitadas [a verificar].
- A lupa lista as pessoas marcadas como colaborador. A busca trouxe
  **0 registros**: nesta conta ninguém está marcado como colaborador, e por isso
  não haveria técnico para escolher.
- [a verificar] Que data o período usa (entrada, conclusão ou saída da OS) e
  onde aparecem as OS sem técnico.

### 2.2 OS por cliente — `/relatorios/os-por-cliente`

**Objetivo:** mostrar a quantidade de OS e o faturamento de cada cliente no
período.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | não | vazio = todos |
| Status OS | `status` | lista | não | Todos (vazio) · Aberta (`0`) · Fechada (`1`) |

**O que deve mostrar [deduzido]:** uma linha por cliente, com o nº de OS e o
valor total (talvez também o ticket médio). Serve para ver os clientes mais
frequentes ou mais valiosos da oficina.

**Regras e comportamento**

- O "faturamento" deste relatório deve ser o total das OS, e não o que foi
  recebido. O cruzamento com o financeiro fica em "OS faturadas" (2.3)
  [deduzido].
- A lupa é a genérica de **Pessoa**. Ela mistura clientes, fornecedores e
  colaboradores, e o título da janela é "Pesquisar — Pessoa", e não "Cliente".
- **Teste feito:**
  1. Um clique em "CONSUMIDOR FINAL" preencheu o filtro: ID 1 no campo
     escondido e o nome no campo visível.
  2. A janela fechou e apareceu o X.
  3. O X limpou os dois campos.

  Nada foi enviado.
- As dúvidas de status e de data são as mesmas do 2.1.

### 2.3 OS faturadas (com títulos) — `/relatorios/os-faturadas`

**Objetivo:** listar as OS que já geraram títulos no contas a receber e comparar
os valores da OS com os do financeiro. A ligação é feita pelo campo
`id_ordem_servico` do título.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | não | vazio = todos |
| Técnico responsável | `id_tecnico` | lupa `pessoa_colaborador` | não | vazio = todos |
| Placa | `placa` | texto livre | não | — |
| Status do título | `status` | lista | não | Todos os títulos (vazio) · Com título em aberto (`0`) · Com título quitado (`1`) |

**O que deve mostrar [deduzido]:** uma linha por OS, com:

- do lado da OS: número, data, cliente, placa, técnico e total;
- do lado financeiro: total dos títulos, valor recebido e valor em aberto.

**Regras e comportamento**

- **"Faturada" quer dizer "tem pelo menos um título a receber"** com
  `id_ordem_servico` igual ao da OS. A palavra não tem a ver com nota fiscal
  (NFS-e ou NF-e) [deduzido da frase da tela].
- O status do título é binário (aberto ou quitado), sem "parcial" e sem
  "cancelado". É o mesmo que aparece em "Comissões por recebimento" (arquivo 20).
- [a verificar] Uma OS com uma parcela paga e outra aberta pode aparecer nos
  dois filtros.
- Não há filtro de status da OS nem de forma de pagamento.
- O filtro **Placa** confirma que o módulo de OS foi pensado para oficinas de
  veículos.

### 2.4 Entradas de estoque (kardex) — `/relatorios/estoque-entradas`

**Objetivo:** listar os movimentos de **entrada** gravados no kardex. A frase da
tela diz que a fonte é a tabela `estoque`, com tipo `E`.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Produto | `id_produto` | lupa `produto` | não | vazio = todos |
| Grupo | `id_grupo` | lupa `produto_grupo` (com "Cadastrar novo") | não | vazio = todos |
| Fabricante | `id_fabricante` | lupa `fabricante` (com "Cadastrar novo") | não | vazio = todos |

**O que deve mostrar [deduzido]:** as colunas do log de estoque (`/estoque-log`,
arquivo 96). São elas: data, produto, quantidade, saldo anterior e atual,
documento de origem (entrada, OS, venda ou balanço), operação, usuário e grade.

**Regras e comportamento**

- **O kardex é uma tabela só** para todos os movimentos, com os tipos `E`
  (entrada), `S` (saída) e `B` (balanço). Os três aparecem no filtro "Tipo" de
  "Movimentações de estoque" (3.3).
- Este relatório é o kardex filtrado por `E`. Os acertos de balanço (`B`) ficam
  de fora [deduzido].
- Geram linha `E` [deduzido]:
  - a entrada concluída, por XML ou manual;
  - a devolução de venda;
  - o produto devolvido numa troca;
  - talvez a transferência recebida e o cancelamento de venda [a verificar].
- Os filtros de grupo e de fabricante confirmam que cada produto tem um grupo e
  um fabricante.
- Não há filtro por operação, local de estoque, grade, usuário ou documento.

### 2.5 Saídas de estoque (kardex) — `/relatorios/estoque-saidas`

**Objetivo:** listar os movimentos de **saída** do kardex (tabela `estoque`,
tipo `S`).

**Filtros:** os mesmos do 2.4 (período, Produto, Grupo, Fabricante).

**O que deve mostrar [deduzido]:** as mesmas colunas do 2.4, só com as linhas
`S`.

**Regras e comportamento**

- Geram linha `S` [deduzido]:
  - as vendas (balcão, PDV, delivery, loja virtual);
  - as peças baixadas numa OS;
  - as saídas manuais;
  - o produto entregue numa troca;
  - a transferência enviada.
- Como não há filtro por operação, este relatório **não separa venda de perda
  ou de consumo**. "Saídas manuais/fiscais" (2.9) também não tem esse filtro.

### 2.6 Entradas de estoque — itens — `/relatorios/entradas-itens`

**Objetivo:** listar os itens das entradas de mercadoria (por nota ou compra) no
período, com produto, quantidade, custo e fornecedor. Na Central, fica em
**Compras**.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Fornecedor | `id_fornecedor` | lupa `pessoa` | não | vazio = todos |
| Produto | `id_produto` | lupa `produto` | não | vazio = todos |
| Status entrada | `status` | lista | não | Todos (`todos`) · Aberta (`0`) · **Concluída (`1`, padrão)** · Cancelada (`2`) |
| Origem | `modo` | lista | não | Todas (vazio, padrão) · Somente XML (`xml`) · Somente manual (`manual`) |

**O que deve mostrar [deduzido]:** uma linha por item, com data, nº da entrada,
NF, fornecedor, produto, quantidade, custo unitário e total, mais o total geral.

**Regras e comportamento**

- É a visão **por documento** (as entradas das telas `/entradas-xml` e
  `/entradas-manual`), e não o kardex. Com o status "Aberta", mostra itens que
  ainda não mexeram no estoque [deduzido].
- O documento de entrada tem três estados: `0` Aberta, `1` Concluída e
  `2` Cancelada. As telas de operação chamam os mesmos estados de Pendente,
  Concluído e Cancelado.
- O padrão "Concluída" faz o relatório mostrar só o que de fato entrou.
- **XML × manual:** pelas frases dos relatórios 2.7 e 2.8, o critério é a
  **chave da NF-e**. Chave preenchida = XML; chave vazia = manual.
- É a matéria-prima para "custo de compra por produto" e "evolução de custos"
  [deduzido].

### 2.7 Entradas XML (NF-e) — `/relatorios/entradas-xml`

**Objetivo:** listar os cabeçalhos das entradas importadas por XML, ou seja, as
que têm chave de NF-e. Na Central, fica em Compras.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Fornecedor | `id_fornecedor` | lupa `pessoa` | não | vazio = todos |
| Status | `status` | lista | não | `todos` · `0` Aberta · **`1` Concluída (padrão)** · `2` Cancelada |

**O que deve mostrar [deduzido pelas colunas de `/entradas-xml`, arquivo 96]:**
ID, data, NF, chave, fornecedor, total e status.

**Regras e comportamento**

- O XML chega por upload do arquivo `.xml` ou pela consulta à SEFAZ
  (distribuição DF-e, com ciência e download), descritos no arquivo 96.
- As notas que só foram manifestadas ou baixadas, e que ainda não viraram
  entrada, não aparecem aqui. Elas ficam na tela de manifestação [deduzido].

### 2.8 Entradas manuais — `/relatorios/entradas-manual`

**Objetivo:** listar os cabeçalhos das entradas lançadas à mão, sem chave de
NF-e. Na Central, fica em Compras.

**Filtros:** os mesmos do 2.7 (período, Fornecedor, Status com padrão
"Concluída").

**O que deve mostrar [deduzido pelas colunas de `/entradas-manual`]:** ID,
data, fornecedor, NF, emissão, venda de origem, finalidade, total e status.

**Regras e comportamento**

- Aqui também caem as devoluções de venda (finalidade "Devolução", operação 12),
  as notas complementares e os ajustes. A entrada manual não é só "compra sem
  nota" [deduzido].
- No documento, o campo "Fornecedor / Cliente" aceita qualquer pessoa (o
  cliente, numa devolução). A lupa do filtro também é a genérica de Pessoa.

### 2.9 Saídas manuais/fiscais — período — `/relatorios/saidas-periodo`

**Objetivo:** listar os cabeçalhos das saídas lançadas à mão ou com nota
("fiscais") no período, com destinatário e totais. Na Central, fica em Estoque.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | não | vazio = todos |
| Status | `status` | lista | não | `todos` · `0` Aberta · **`1` Concluída (padrão)** · `2` Cancelada |

**O que deve mostrar [deduzido pelas colunas de `/saidas-manual`]:** ID, data,
destinatário, NF, emissão, finalidade, total, status e, talvez, a operação.

**Regras e comportamento**

- "Fiscal" indica que a saída pode levar NF (número, série e emissão) e que dela
  pode nascer a NF-e de devolução de compra, de remessa ou de perda (arquivos 13
  e 96) [deduzido].
- O filtro chama o destinatário de "Cliente", mas a saída aceita qualquer
  pessoa, como o fornecedor numa devolução de compra.
- **Vendas e OS não entram aqui.** Elas geram saída no kardex (2.5), mas não são
  "saídas manuais/fiscais" [deduzido].
- Falta o filtro mais útil para a gestão: a **operação** (perda, consumo,
  bonificação, devolução de compra...).

### 2.10 Saídas — itens — `/relatorios/saidas-itens`

**Objetivo:** listar os itens das saídas manuais ou fiscais no período. Na
Central, fica em Estoque.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa `pessoa` | não | vazio = todos |
| Produto | `id_produto` | lupa `produto` | não | vazio = todos |
| Status saída | `status` | lista | não | `todos` · `0` Aberta · **`1` Concluída (padrão)** · `2` Cancelada |

**O que deve mostrar [deduzido pelos campos do item de saída, arquivo 96]:**
produto, quantidade, unitário, desconto em %, desconto em R$, acréscimo e valor
líquido, junto com o documento e o destinatário.

**Regras e comportamento:** as mesmas do 2.9. Com o filtro Produto, responde à
pergunta "para onde foi este produto fora das vendas?" [deduzido].

### 2.11 Estoque sem movimento — `/relatorios/estoque-sem-movimento`

**Objetivo:** listar os produtos com saldo que estão há X dias sem nenhum
movimento no kardex. Na Central, fica em Estoque.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Dias sem movimento | `dias_sem_movimento` | número | não | mínimo 1; padrão **90** |
| Grupo | `id_grupo` | lupa `produto_grupo` | não | vazio = todos |
| Fabricante | `id_fabricante` | lupa `fabricante` | não | vazio = todos |
| Saldo | `modo` | lista | não | Somente com saldo (`com_saldo`, padrão) · Todos (`todos`) |

Não há período. A data de referência é hoje [deduzido].

**O que deve mostrar [deduzido]:** produto, grupo, saldo, data do último
movimento, dias parado e, talvez, o valor parado a custo.

**Regras e comportamento**

- "Parado" = o último movimento do produto no kardex tem mais de X dias.
- [a verificar] Se o balanço (`B`) conta como movimento. Se contar, uma contagem
  anual "renova" todos os itens parados e esconde o problema.
- [a verificar] Se entram os produtos que nunca tiveram nenhum movimento.
- "Todos" inclui os produtos com saldo zero, o que ajuda a limpar o cadastro.

### 2.12 Estoque valorizado por grupo — `/relatorios/estoque-valor-grupo`

**Objetivo:** somar o saldo e o valor do estoque (a custo) por grupo de produto.
Na Central, fica em Estoque.

| Campo | Parâmetro | Tipo | Obrigatório | Padrão / opções |
|---|---|---|---|---|
| Grupo | `id_grupo` | lupa `produto_grupo` | não | vazio = todos |
| Saldo | `modo` | lista | não | Somente com saldo (`com_saldo`, padrão) · Todos (`todos`) |

Não há data: é a foto do estoque **agora** [deduzido].

**O que deve mostrar [deduzido]:** por grupo, o nº de produtos, a quantidade em
estoque e o valor a custo, mais o total geral.

**Regras e comportamento**

- Valor = saldo × custo do produto. O balanço usa o "preço de compra" como custo
  (arquivo 96), e o mais provável é que aqui seja igual [deduzido].
- Não há escolha da base de valor (custo médio, último custo ou preço de venda).
  A valorização a preço de venda existe noutro relatório, "Produtos — estoque e
  valores".
- O escopo é a empresa logada. A Central diz isso do relatório "Posição de
  estoque" [deduzido].
- [a verificar] Onde entram os produtos sem grupo e os saldos negativos.
- Não há posição numa data passada (por exemplo, no fechamento do mês), nem
  visão por fabricante ou por local de estoque.

---

## 3. Sub-rotas lidas de passagem

### 3.1 Central de Relatórios — `/relatorios` [visto]

- Uma frase no topo apresenta a tela: consultas de gestão com os dados reais da
  empresa, com filtros, totais, PDF, Excel e impressão.
- O botão **Processamentos** leva a `/relatorios/processamentos` (3.2).
- **Filtro por categoria:** uma lista (`categoria`) e o botão "Filtrar", por
  GET.
  - Opções, na ordem da lista: Todas (padrão), Visão geral, Movimentações,
    Vendas, Caixa, Financeiro, Estoque, Compras, Clientes, Fornecedores,
    Produtos, CRM, Fiscal, Comissões, Ordem de Serviço, Canais digitais,
    Produção e Auditoria.
  - Não há busca por nome dentro da Central; só a busca global (Ctrl+K).
- **Cartões:** cada relatório mostra o nome, o **slug técnico** (por exemplo,
  `estoque-sem-movimento`), uma descrição curta, a linha "N filtros · PDF ·
  Excel · CSV" e o botão "Abrir relatório".
- **São 132 relatórios.** A página os mostra nesta ordem:

| Categoria | Relatórios |
|---|---|
| Vendas | 19 |
| Caixa | 8 |
| Financeiro | 28 |
| Estoque | 13 |
| Compras | 11 |
| Clientes | 5 |
| Fornecedores | 1 |
| Produtos | 5 |
| Fiscal | 17 |
| Canais digitais | 5 |
| Produção | 2 |
| CRM | 1 |
| Auditoria | 1 |
| Movimentações | 1 |
| Comissões | 7 |
| Ordem de Serviço | 8 |
| **Total** | **132** |

- A categoria **"Visão geral"** (`?categoria=overview`) não tem nenhum
  relatório. A tela diz que nada foi encontrado.
- A ordem das categorias na lista é diferente da ordem na página.
- Algumas descrições dizem "estilo Delphi" ou citam um formulário do Delphi. São
  relatórios trazidos do sistema antigo.
- **Relatórios vizinhos destas 12 telas** (não abertos; * = deste lote):
  - Estoque: estoque-posicao, estoque-abaixo-minimo, estoque-curva-abc,
    estoque-entradas*, estoque-saidas*, estoque-sem-movimento*,
    estoque-valor-grupo*, estoque-balanco, estoque-giro,
    estoque-transferencias, estoque-romaneio, saidas-periodo*, saidas-itens*.
  - Compras: compras-periodo (3.4), compras-por-fornecedor,
    compras-por-produto, compras-pedidos, compras-evolucao-custos,
    compras-cotacoes, compras-solicitacoes, entradas-vs-pagar (3.5),
    entradas-itens*, entradas-xml*, entradas-manual*.
  - Ordem de Serviço: os-periodo, os-por-status, os-por-tecnico*,
    os-por-cliente*, os-servicos-executados, os-pecas-utilizadas, os-abertas,
    os-faturadas*.

### 3.2 Processamentos — `/relatorios/processamentos` [visto]

- Título "Processamentos de relatórios". A tela se apresenta como o lugar dos
  relatórios assíncronos e do histórico de exportações, e está marcada como
  "em evolução".
- Um aviso diz que a fila para relatórios muito grandes ainda vai ser ligada.
  Hoje, as exportações saem na hora, até um limite de volume por relatório.
- Só tem o link "Voltar à Central". Não há lista nem histórico.
- [deduzido] Cada relatório tem um teto de linhas para exportar, e esse valor
  não aparece na tela.

### 3.3 Movimentações de estoque — `/relatorios/movimentacoes-gerais` [visto]

- Fica sozinho na categoria "Movimentações". A explicação diz que mostra o que
  está na tabela `estoque`: entradas, saídas e balanço.
- **Filtros:** período, Produto (lupa) e **Tipo**, num parâmetro chamado
  `status`: Todos (`todos`, padrão) · Entrada (`E`) · Saída (`S`) · Balanço
  (`B`).
- É a prova dos três tipos do kardex. Os relatórios 2.4 e 2.5 são este mesmo,
  com o tipo fixo e mais os filtros de grupo e fabricante.

### 3.4 Compras por período — `/relatorios/compras-periodo` [visto]

- Fica em Compras. Mostra as entradas de mercadoria no período, com fornecedor e
  totais.
- **Filtros:** período, Fornecedor (lupa `pessoa`) e Status (**`todos` como
  padrão** · `0` · `1` · `2`).
- A fonte é a mesma de 2.7 + 2.8, mas aqui o padrão é "Todos", e não
  "Concluída". Se o usuário não mexer no status, a soma de "Entradas XML" com
  "Entradas manuais" não bate com "Compras por período" [deduzido].

### 3.5 Entradas × contas a pagar — `/relatorios/entradas-vs-pagar` (não aberta)

- Está listado na Central, em Compras: entradas com o total da NF e os títulos a
  pagar ligados a elas.
- **Não foi aberto.** A checagem de permissões do Claude Code (modo automático)
  recusou a navegação, e ela não foi repetida.
- O cartão já indica que a entrada pode gerar títulos a pagar [deduzido].

---

## 4. Fluxos de ponta a ponta

### 4.1 Compra com nota → estoque → relatórios

1. O fornecedor emite a NF-e. O XML chega por upload ou pela consulta automática
   à SEFAZ (DistDFe), que dá ciência e baixa o arquivo (arquivo 96).
2. Em `/entradas-xml`, a importação cria a entrada com status `0` (Aberta ou
   "Pendente"). Nesse passo, o sistema:
   - cadastra o fornecedor, se preciso;
   - converte o CFOP;
   - liga cada item a um produto pelo GTIN ou pela referência.
3. Vêm a conferência e a conclusão, e o status passa a `1` (Concluída) [a
   verificar onde fica o botão]. Na conclusão, provavelmente [deduzido]:
   - nascem as linhas `E` no kardex;
   - são criados os títulos a pagar (3.5);
   - o custo do produto é atualizado, se o parâmetro "entrada atualiza custo"
     estiver ligado (arquivo 96).
4. Onde a compra aparece:
   - "Entradas XML" (cabeçalho);
   - "Entradas — itens", com origem XML (itens);
   - "Entradas de estoque (kardex)" (movimento);
   - "Compras por período";
   - "Entradas × contas a pagar".
5. Cancelamento: o status passa a `2`. [a verificar] Se o kardex é estornado com
   uma linha `S`.

### 4.2 Entrada manual e devolução de venda

1. Em `/entradas-manual`, o usuário informa data, pessoa, operação (41 opções),
   finalidade (Normal, Complementar, Ajuste ou Devolução) e itens com o custo
   sugerido pelo sistema.
2. Com a finalidade "Devolução", a operação muda sozinha para "Devolução de
   venda" e dá para puxar os itens de uma venda.
3. Ao concluir, nascem as linhas `E` no kardex.
4. Relatórios: "Entradas manuais", "Entradas — itens" (origem manual) e o kardex
   de entradas. Fora deste lote, também "Devoluções de venda".

### 4.3 Saída manual ou fiscal

1. Em `/saidas-manual`, o usuário informa a pessoa, a operação (perda, consumo,
   bonificação, devolução de compra, remessa...) e os itens, com desconto e
   acréscimo.
2. A saída pode levar NF, e a NF-e pode ser emitida a partir dela, no módulo
   fiscal [deduzido].
3. Ao concluir, nascem as linhas `S` no kardex.
4. Relatórios: "Saídas manuais/fiscais — período", "Saídas — itens" e o kardex
   de saídas.

### 4.4 Vendas, OS, trocas e transferências no kardex

Vendas (balcão, PDV, delivery, loja), peças de OS, trocas e transferências
também mexem no kardex, com linhas `S` ou `E`. Elas aparecem nos relatórios de
kardex (2.4, 2.5 e 3.3), mas não nos relatórios de documento (2.6 a 2.10)
[deduzido].

### 4.5 Análise do estoque e ação

1. "Estoque valorizado por grupo" mostra onde está o dinheiro empatado.
2. "Estoque sem movimento" (padrão de 90 dias) mostra o que não gira.
3. Ações possíveis no próprio ERP [deduzido]:
   - mudar o preço ou fazer promoção;
   - devolver ao fornecedor (saída com a operação "Devolução compra");
   - dar baixa por perda ("Extravio / Perda");
   - inativar o produto;
   - contar de novo no balanço.

### 4.6 OS, do balcão ao recebimento

1. A OS é aberta (`0`) com cliente, técnico responsável e veículo (placa).
2. Peças e serviços são lançados, cada um com o seu técnico. [a verificar] Se as
   peças baixam o estoque.
3. A OS fechada (`1`) gera títulos a receber ligados por `id_ordem_servico`
   (arquivo 14).
4. Recebidos os títulos (status `1`, quitado), a OS passa a "Quitado" (`4`).
5. Relatórios:
   - "OS por técnico": produção;
   - "OS por cliente": volume e valor;
   - "OS faturadas": OS × títulos, abertos ou quitados.

### 4.7 Uso de um relatório

1. Central → escolher a categoria → "Abrir relatório".
2. Ajustar os filtros (o período já vem com o mês) e usar as lupas.
3. "Gerar" → resultado com totais e exportação em PDF, Excel, CSV ou impressão.
   O resultado não foi visto.
4. Acima do limite de volume, hoje não há saída: a fila de "Processamentos"
   ainda não existe.

---

## 5. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| **Relatório (catálogo)** | slug, nome, categoria, descrição, filtros (quantos e quais), formatos (PDF, Excel, CSV), limite de exportação [deduzido] | 132 relatórios em 16 categorias com itens, mais a "Visão geral", vazia; a Central e o formulário de cada tela saem da mesma definição [deduzido] |
| **Processamento de relatório** [futuro] | fila assíncrona, histórico de exportações | N:1 Relatório; ainda não existe |
| **Configuração de lupa** | tipo, título, colunas, cadastro rápido (sequência, campos, padrões) | uma por tipo de cadastro (`pessoa`, `pessoa_colaborador`, `produto`, `produto_grupo`, `fabricante`) |
| **Movimento de estoque (kardex, tabela `estoque`)** | id, data, tipo (`E`, `S`, `B`), produto, quantidade, saldo anterior, saldo atual, grade, operação, usuário, documento de origem (entrada, saída, OS, venda, balanço) | N:1 Produto; N:1 documento de origem; N:1 Empresa |
| **Produto** | id, descrição, ref. de fábrica, unidade, grupo, fabricante, custo (preço de compra), saldo | N:1 Grupo; N:1 Fabricante; 1:N Movimentos |
| **Grupo de produto** | id (sequência `PRODUTO_GRUPO`), descrição (maiúsculas), status, % de comissão, ordem | 1:N Produtos |
| **Fabricante** | id (sequência `FABRICANTE`), descrição (maiúsculas), status | 1:N Produtos |
| **Entrada (documento)** | id, data de entrada, pessoa (fornecedor ou cliente), **chave NF-e** (preenchida = XML, vazia = manual), NF nº, série, emissão, operação, finalidade, venda de origem (devolução), total, status (`0` Aberta, `1` Concluída, `2` Cancelada) | N:1 Pessoa; 1:N Itens de entrada; 1:N Movimentos `E`; 0..N Títulos a pagar [deduzido] |
| **Item de entrada** | produto, quantidade, custo unitário, total, grade, local | N:1 Entrada; N:1 Produto |
| **Saída (documento manual ou fiscal)** | id, data, pessoa, operação, finalidade, NF nº, série, emissão, total, status (`0`, `1`, `2`) | N:1 Pessoa; 1:N Itens de saída; 1:N Movimentos `S`; 0..1 NF-e [deduzido] |
| **Item de saída** | produto, quantidade, valor unitário, desconto %, desconto R$, acréscimo, líquido | N:1 Saída; N:1 Produto |
| **Pessoa** | id, nome ou razão social, CPF/CNPJ, papéis (cliente, fornecedor, colaborador) | papel de cliente na OS e na saída; de fornecedor na entrada; de técnico na OS. O registro 1 é o padrão "CONSUMIDOR FINAL" |
| **Ordem de serviço** (`os_oficina`, arquivo 14) | id, cliente, técnico responsável, placa ou veículo, status (`0` Aberta, `1` Fechada, `2` Cancelada, `4` Quitado), total de peças, total de serviços, total | N:1 Pessoa (cliente); N:1 Pessoa colaborador (técnico); 1:N Títulos a receber |
| **Título a receber** | id, `id_ordem_servico` (ou venda), valor, vencimento, pagamento, status (`0` aberto, `1` quitado), comissão | N:1 OS ou N:1 Venda |

---

## 6. Integrações

- **Nenhuma integração externa direta nestas 12 telas** [visto]. Elas só leem o
  banco do ERP: formulários GET e lupas internas (`/lookups/...`).
- **Indiretas** (de onde os dados vêm):
  - **SEFAZ:** a NF-e de entrada (upload do XML ou DistDFe com manifestação)
    alimenta "Entradas XML" e "Entradas — itens". A NF-e de saída pode nascer de
    uma saída fiscal [deduzido].
  - **Financeiro e bancos:** em "OS faturadas", o título muda para quitado
    quando é pago no caixa ou baixado por boleto, PIX ou gateway (arquivos 11
    e 910).
- **Exportação:** PDF, Excel e CSV gerados no servidor, mais impressão pelo
  navegador (anunciados na Central, não vistos). A fila assíncrona ainda não
  existe.
- **Não há** WhatsApp, TEF, balança, impressora térmica, Mercado Livre nem
  e-mail nestas telas.

---

## 7. Observações de UX e oportunidades

### 7.1 O que é confuso, lento ou excessivo

1. **Relatório às cegas.** Tudo depende de "Gerar": não há prévia nem contagem,
   e não dá para exportar antes. *Para nós:* o resultado aparece na própria tela
   e se atualiza ao mudar o filtro, com o botão de exportar sempre à vista.
2. **Relatórios demais e repetidos.** A Central tem 132 cartões. Só neste lote:
   - "kardex de entradas", "kardex de saídas" e "Movimentações de estoque" são o
     mesmo relatório com o tipo fixo;
   - "Entradas XML", "Entradas manuais", "Compras por período" e "Entradas —
     itens" usam a mesma fonte com recortes diferentes.

   *Para nós:* poucos relatórios configuráveis (tipo, origem, nível documento ou
   item, agrupamento).
3. **Padrões diferentes para a mesma coisa.** O status vem como "Concluída" em
   cinco telas e como "Todos" em "Compras por período". Os totais deixam de
   bater sem que o usuário perceba. *Para nós:* padrões coerentes e um resumo
   dos filtros aplicados no topo do resultado e no PDF.
4. **Nomes inconsistentes.**
   - "Aberta" nos relatórios e "Pendente" nas telas de operação.
   - O tipo do movimento vai num parâmetro chamado `status`.
   - `modo` quer dizer origem numa tela e saldo noutra.

   *Para nós:* um vocabulário único, definido no domínio.
5. **Jargão técnico para o comerciante.** As explicações citam a tabela
   `estoque`, o "tipo E", `id_ordem_servico`, "chave NF-e preenchida" e "estilo
   Delphi". A Central mostra o slug de cada relatório. *Para nós:* linguagem de
   comerciante.
6. **Lupa lenta e genérica.**
   - O campo não aceita digitação: é preciso abrir a janela.
   - A dica fica cortada nas colunas estreitas ("Clique na lup").
   - Fornecedor e Cliente usam a mesma lupa "Pessoa", sem filtrar o papel.
   - O Fabricante mostra o status como "0".
   - O rótulo não está ligado ao campo (problema de acessibilidade).
   - Um clique logo depois de fechar outra janela foi ignorado, provavelmente
     porque a anterior ainda estava fechando. No segundo clique, abriu.

   *Para nós:* autocompletar no próprio campo, filtrado pelo papel, com rótulos
   corretos.
7. **Cadastro dentro do relatório.** As lupas de Grupo e de Fabricante oferecem
   "Cadastrar novo" numa tela de consulta, com risco de lixo no cadastro.
   *Para nós:* relatório só lê.
8. **Filtros de um valor só.** Um produto, um grupo, um fabricante e um técnico
   por vez. *Para nós:* escolher vários e poder excluir.
9. **Período sem atalhos.** Só há datas soltas (padrão: o mês até hoje). Faltam
   "ontem", "últimos 7 dias", "mês passado" e a comparação com o período
   anterior.
10. **Status de OS ambíguo.** Os relatórios de OS só oferecem Aberta e Fechada.
    Cancelada e Quitado ficam num "Todos" de conteúdo incerto.
11. **Valor do estoque sem data e sem base.** O valor sai só "agora" e só a
    custo, o que não serve para o fechamento do mês. *Para nós:* posição numa
    data e escolha da base (custo médio, último custo, preço de venda).
12. **Kardex sem os filtros que importam.** Não dá para filtrar por operação,
    local, grade, usuário ou documento, e não há link para o documento de
    origem.
13. **Sem filial.** Tudo é da empresa logada, e nada consolida as filiais.
14. **Central pesada e com sobras.**
    - Uma página longa com 132 cartões.
    - A categoria "Visão geral" está vazia.
    - A ordem das categorias na lista não é a da página.
    - Não há busca por nome nem favoritos.
15. **Tela inacabada à vista.** "Processamentos" é uma tela vazia, marcada como
    "em evolução".
16. **O que vale copiar:**
    - formulário GET, com URL que dá para compartilhar;
    - período padrão do mês;
    - um único componente de lupa, configurado pelo servidor (colunas e cadastro
      rápido declarados);
    - PDF, Excel e CSV em todos os relatórios.

### 7.2 Proposta de reconstrução (resumo) [proposta]

- **Catálogo declarativo por módulo.** O cliente só vê os relatórios dos módulos
  que usa.
- **Uma definição por relatório:**
  - fonte (consulta sempre com `tenantId`);
  - filtros tipados: período com atalhos, entidade filtrada pelo papel, lista de
    opções, número;
  - colunas, agrupamentos, totais e ordenação padrão;
  - permissão.
- **Uma tela de resultado:** tabela paginada com totais, gráfico simples quando
  ajudar, exportar CSV, XLSX e PDF, e imprimir.
- **Visões salvas** (filtros favoritos), link para compartilhar e envio agendado
  por e-mail ou WhatsApp.
- **Estoque, em poucos relatórios:**
  - "Kardex": tipo, operação, documento, local e grade, com link para a origem;
  - "Entradas": nível documento ou item, origem XML ou manual;
  - "Saídas": por operação;
  - "Estoque parado": dias e valor parado;
  - "Valor do estoque": agrupar por grupo, fabricante ou local, com base de
    custo e data.
- **OS:**
  - "Produção": por técnico responsável ou por técnico do item;
  - "OS × financeiro": diferença entre a OS e os títulos, em aberto e recebido;
  - "Clientes da oficina".
- **Filiais:** escolher uma ou várias e consolidar.
- **Volume grande:** fila assíncrona, com aviso quando o arquivo estiver pronto.

---

## 8. Pendências

1. **O resultado dos 12 relatórios não foi visto:** colunas, agrupamento,
   totais, ordenação, paginação, botões de PDF, Excel, CSV e impressão, e o
   limite de linhas. "Gerar" está na lista de proibidos. O formulário é GET (só
   leitura), e o dono pode autorizar de forma explícita gerar relatórios numa
   próxima passagem. Mesmo assim, esta conta não tem movimento, então seria
   preciso uma conta com dados para ver linhas.
2. **Data de referência dos filtros:**
   - OS: entrada, conclusão ou saída?
   - Entradas: data de entrada ou emissão da NF?
   - Saídas: data da saída ou emissão?
3. Se "Todos" nos relatórios de OS inclui Cancelada (`2`) e Quitado (`4`).
4. A base de custo usada em "Estoque valorizado por grupo" e em "Estoque sem
   movimento".
5. Se o balanço (`B`) conta como movimento, e se entram os produtos nunca
   movimentados.
6. Se "Saídas manuais/fiscais" inclui NF-e emitidas em outros módulos ou só o
   que nasce em `/saidas-manual`.
7. "OS faturadas" com parcelas mistas (uma aberta, outra quitada): em que filtro
   a OS aparece.
8. Onde entram os produtos sem grupo e os saldos negativos no valor por grupo.
9. `/relatorios/entradas-vs-pagar`: navegação recusada pela checagem de
   permissões do Claude Code (modo automático), sem nova tentativa. Fica para o
   usuário decidir se libera.
10. Permissões por relatório ou por grupo de usuários: não vistas (o usuário
    ADMIN abriu todos).
11. O formulário "Cadastrar novo" das lupas de Grupo e de Fabricante não foi
    aberto. Os campos só são conhecidos pela configuração da lupa.
12. O comportamento no celular não foi testado.
