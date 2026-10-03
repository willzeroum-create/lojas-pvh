# 920 — Lacunas, lote 21: relatórios de produtos, estoque, compras e NF-e

> Exploração **só de leitura** feita em 2026-10-03 na conta de teste "Boi Criolo"
> (plano Full), numa aba própria do navegador embutido, fechada no fim. Nada foi
> gravado, gerado, exportado, baixado ou enviado.
>
> - O botão **Gerar** dos relatórios **não foi clicado**, porque está na lista de
>   proibidos. Por isso o **conteúdo** de cada relatório (colunas e totais) foi
>   **deduzido** da frase da própria tela e da Central de Relatórios. Os filtros, as
>   opções e os códigos internos foram **vistos**.
> - **11 das 12 rotas foram lidas.** Uma (`compras-por-produto`) abriu, mas a
>   checagem de segurança do Claude Code recusou a leitura (ver Pendências).
> - Os textos da interface foram resumidos com palavras próprias. Não apareceram
>   dados pessoais: a conta só tem o cadastro genérico "Consumidor final".
>
> Este lote refaz rotas que tinham ficado bloqueadas em
> `21-relatorios-estoque-compras-fiscal.md`.

Legenda: **[visto]** = observado na tela ou no código da página; **[deduzido]** =
inferido do texto, dos estados ou do fluxo; **[hipótese]** = palpite a confirmar.

## Estado das rotas

| Rota | Título na tela | Estado | Filtros |
| --- | --- | --- | --- |
| `/relatorios/produtos-cadastro` | Produtos — estoque e valores | lida (+ estrutura) | Grupo, Fabricante, Subgrupo, Cor, Status, Estoque > 0, Somente serviço |
| `/relatorios/estoque-balanco` | Balanço / inventário | lida (+ estrutura) | Período, Status, Produto |
| `/relatorios/estoque-giro` | Giro de estoque | lida (+ estrutura) | Período, Produto, Grupo |
| `/relatorios/estoque-transferencias` | Transferências entre filiais | lida (+ estrutura) | Período, Status, Produto |
| `/relatorios/estoque-romaneio` | Romaneios / cargas | lida (+ estrutura) | Período, Status, Rota |
| `/relatorios/compras-por-fornecedor` | Compras por fornecedor | lida (+ estrutura) | Período, Fornecedor, Status da entrada |
| `/relatorios/compras-por-produto` | Compras por produto | **falhou**: a página abriu, mas a leitura foi recusada | não lidos (a Central fala em 5) |
| `/relatorios/compras-pedidos` | Pedidos de compra | lida (texto e árvore) | Período, Fornecedor, Status |
| `/relatorios/compras-evolucao-custos` | Evolução de custos de compra | lida (texto e árvore) | Período, Fornecedor, Produto, Status da entrada |
| `/relatorios/nfe-rejeitadas` | NF-e rejeitadas / denegadas | lida (texto e árvore) | Período, Cliente |
| `/relatorios/nfe-tributos` | NF-e — tributos | lida (texto e árvore) | Período, Status |
| `/relatorios/nfe-por-cfop` | NF-e por CFOP | lida (texto e árvore) | Período, Status |

- **"+ estrutura"**: além do texto, li o formulário por dentro (nomes internos dos
  campos e o tipo de cada lupa).
- **"texto e árvore"**: depois da recusa, usei só o texto da página e a árvore de
  acessibilidade, sem script. Nessas telas os nomes internos dos campos seguem o
  mesmo padrão, mas não foram confirmados.

### Sub-rotas e endpoints descobertos

| Rota / endpoint | O que é | Estado |
| --- | --- | --- |
| `/relatorios` | Central de Relatórios (catálogo) | lida |
| `/relatorios/processamentos` | Fila de relatórios assíncronos (ainda não existe) | lida |
| `/romaneios` | Tela de trabalho do romaneio de carga | lida (lista vazia) |
| `/romaneios/create` | Formulário "Novo romaneio de carga" | lido; **Salvar não clicado** |
| `/compras` | Painel do módulo de compras | lido |
| `/compras/pedidos` | Lista de pedidos de compra | lida (vazia) |
| GET `/lookups/{tipo}/config` | Configuração da lupa: título, colunas e cadastro rápido | lido para 4 tipos |
| GET `/lookups/{tipo}/search?q=&page=` | Busca paginada da lupa | usado só para contar registros |
| GET `/lookups/{tipo}/{id}` | Devolve o rótulo de um valor já escolhido | visto no código |
| GET `/erp/notificacoes/{canal}/poll` | Sondagem de notificações feita em todas as telas | visto no código |

---

## Visão geral do módulo

O lote junta 12 relatórios de quatro áreas: produtos (1), estoque (4), compras (4)
e NF-e (3). Todos são **só de consulta**: nenhum cria ou altera registos. Os dados
vêm de outros módulos:

- **Estoque**: kardex, balanços e transferências.
- **Expedição**: romaneios de carga.
- **Compras**: pedidos e entradas de mercadoria.
- **Fiscal**: NF-e modelo 55, com o código devolvido pela SEFAZ.

### Central de Relatórios (`/relatorios`) [visto]

- **Cabeçalho:** a frase promete consultas gerenciais com filtros, totais, PDF,
  Excel e impressão. Há um link **Processamentos** e um filtro de categoria com
  botão **Filtrar**.
- **17 categorias no filtro:** Visão geral, Movimentações, Vendas, Caixa,
  Financeiro, Estoque, Compras, Clientes, Fornecedores, Produtos, CRM, Fiscal,
  Comissões, Ordem de Serviço, Canais digitais, Produção e Auditoria.
- **Cada relatório é um cartão** com título, *slug* (o mesmo da URL), frase
  curta, número de filtros, formatos "PDF · Excel · CSV" e o botão **Abrir
  relatório**.
- **Contei 132 relatórios em 16 secções** ("Visão geral" não mostrou nenhum
  cartão):

  | Secção | Relatórios | Secção | Relatórios |
  | --- | --- | --- | --- |
  | Vendas | 19 | Fiscal | 17 |
  | Caixa | 8 | Canais digitais | 5 |
  | Financeiro | 28 | Produção | 2 |
  | Estoque | 13 | CRM | 1 |
  | Compras | 11 | Auditoria | 1 |
  | Clientes | 5 | Movimentações | 1 |
  | Fornecedores | 1 | Comissões | 7 |
  | Produtos | 5 | Ordem de Serviço | 8 |

- **Onde ficam os 12 deste lote:** Produtos (`produtos-cadastro`); Estoque
  (balanço, giro, transferências, romaneio); Compras (os 4 de compras); Fiscal
  (os 3 de NF-e).
- **Pistas de implementação nas frases dos cartões:**
  - "kardex (tabela estoque, tipo E/S)";
  - "movimentações registradas na tabela estoque (entradas, saídas, balanço)";
  - "status 0" e "tipo_forma = 1";
  - "estilo Delphi" e "Delphi FrmRelatorio".

  Ou seja, o ERP web refaz relatórios de um sistema desktop em Delphi e lê as
  mesmas tabelas.
- **Relatórios vizinhos que completam este lote** (só vistos como cartão):
  - **Compras:** `compras-periodo`, `compras-cotacoes`, `compras-solicitacoes`,
    `entradas-vs-pagar`, `entradas-itens`, `entradas-xml` e `entradas-manual`.
  - **Estoque:** `estoque-posicao`, `estoque-abaixo-minimo`, `estoque-curva-abc`,
    `estoque-valor-grupo` e `movimentacoes-gerais`.
  - **Fiscal:** `nfe-emitidas`, `fiscal-cancelados`, `nfe-itens-fiscal`,
    `sped-resumo-periodo`, `icms-mensal` e `mdfe-periodo`.
  - **Tributação de produtos:** `produtos-tributacao-nfe` e
    `produtos-tributacao-nfce`. Estes dois já citam IBS e CBS (reforma
    tributária).

### O que todas as telas de relatório têm [visto]

1. **Uma rota só para todos os relatórios.** A rota Laravel `relatorios.show`
   recebe o *slug* no parâmetro `report`. É um motor genérico com uma definição
   por relatório.
2. **Cabeçalho:** título, uma frase de explicação e o botão **← Central**.
3. **Cartão de filtros:** um formulário **GET** (`form-relatorio-filtros`) que
   envia para a própria URL, com o campo oculto `executar=1`. Por isso o
   resultado aparece na mesma página e os filtros ficam na URL. Dá para guardar
   o relatório nos favoritos ou partilhar o link [deduzido do formulário].
4. **Período:** "Data inicial" (`de`) e "Data final" (`ate`), no campo de data
   do navegador.
   - O padrão é do dia 1.º do mês até hoje (01/10/2026 a 03/10/2026).
   - Confirmado em 7 telas. Nas 3 de NF-e o valor não pôde ser confirmado.
5. **Status:** uma lista com "Todos" e os estados do documento. O padrão muda de
   tela para tela: "Todos", "Concluída", "Autorizada" ou "Ativos".
6. **Lupas** para escolher cadastros (explicadas abaixo).
7. **Um único botão, Gerar** (não clicado).
   - Nenhum campo é obrigatório.
   - Antes de gerar, a tela não oferece exportar, imprimir, limpar ou guardar
     filtros. Segundo a Central, o resultado sai em PDF, Excel e CSV.
8. **Moldura global igual ao resto do ERP:**
   - busca de telas (Ctrl+K), Novidades, tema, notificações, menu ADMIN e
     assistente;
   - uma barra de ícones à esquerda;
   - no código há um seletor de empresa que troca a empresa da sessão;
   - todas as páginas consultam periodicamente **7 canais de notificação**:
     WhatsApp, loja virtual, cardápio, OS, Mercado Livre, manifestação de NF-e e
     baixa de boleto.

### Lupa: o componente de pesquisa [visto]

**Como o campo funciona**

- É uma caixa só de leitura ("Clique na lupa para pesquisar..."), com o botão da
  lupa e um botão **X (Limpar)**. O X só aparece depois de escolher um valor.
- Clicar no texto também abre a lupa.
- O id escolhido vai para um campo oculto (`id_grupo`, `id_produto`,
  `id_fornecedor` etc.).

**A janela "Pesquisar — {cadastro}"**

- Busca por código ou descrição, com **Buscar** ou Enter.
- Tabela com paginação "Página X de Y (N registros)" e os botões
  Anterior/Próximo.
- Botão **Cadastrar novo** quando o tipo permite cadastro rápido, e **Fechar**.
- **Carrega a primeira página sozinha ao abrir.** Isto corrige o lote 20, que
  achou que a janela abria vazia: lá apenas não havia registos.
- Existe um modo de seleção múltipla (caixas de seleção e "Adicionar
  selecionados"). Não é usado nestes relatórios.

**Configuração de cada tipo, vinda do servidor**

| Tipo | Título da janela | Colunas | Cadastro rápido | Registos na conta |
| --- | --- | --- | --- | --- |
| `produto_grupo` | Grupo de Produto | Código, Descrição | sim (ver nota 1) | 0 |
| `fabricante` | Fabricante | Código, Descrição, Status | sim: só descrição, status 1 | 1 ("PADRAO") |
| `produto_sub_grupo` | Subgrupo de Produto | Código, Descrição, Status | sim | 1 ("PADRAO") |
| `produto_cor` | Cor | Código, Descrição, Status | sim | 1 ("PADRAO") |
| `produto` | Produto | Código, Descrição, Ref., UN | o botão não apareceu | 0 |
| `pessoa` (usada como "Fornecedor") | Pessoa | Código, Nome, CPF/CNPJ | o botão não apareceu | 1 ("Consumidor final", código 1) |
| `rota` | não aberta | — | — | nenhuma rota (pela tela de romaneios) |

Nota 1: no grupo, o cadastro rápido pede só a descrição (obrigatória, em
maiúsculas). O resto vem preenchido: status 1, comissão 0 e ordem 0. O código sai
da sequência `PRODUTO_GRUPO`.

### Processamentos (`/relatorios/processamentos`) [visto]

- A tela promete uma fila para relatórios muito grandes e um histórico de
  exportações, e está marcada como "em evolução".
- Hoje as exportações são geradas na hora, até um limite em cada relatório.
- O único botão é **Voltar à Central**.

---

## Telas

### 1. `/relatorios/produtos-cadastro` — Produtos: estoque e valores

**Objetivo:** mostrar a situação atual dos produtos da filial: preço de venda,
preço de compra e valor do estoque a custo e a preço de venda. A frase da tela
cita o "FrmRelatorio" do Delphi, ou seja, é uma cópia de um relatório do desktop.

**Filtros** (7). **Não há período:** o relatório mostra a situação de agora.

| Filtro | Tipo | Nome interno | Opções / padrão |
| --- | --- | --- | --- |
| Grupo | lupa `produto_grupo` | `id_grupo` | vazio = todos |
| Fabricante | lupa `fabricante` | `id_fabricante` | vazio = todos |
| Subgrupo | lupa `produto_sub_grupo` | `id_sub_grupo` | vazio = todos |
| Cor | lupa `produto_cor` | `id_cor` | vazio = todos |
| Status | lista | `status` | **Ativos** (1, padrão), Todos (`todos`), Inativos (0) |
| Estoque maior que 0 | caixa "Sim" | `estoque_maior_zero` = 1 | desmarcada |
| Somente serviço | caixa "Sim" | `somente_servico` = 1 | desmarcada |

**Ações:** Gerar (não clicado) e ← Central.

**O que o relatório deve mostrar [deduzido]:**

- Uma linha por produto: código, descrição, unidade, saldo na filial, preço de
  venda, preço de compra, saldo × preço de compra e saldo × preço de venda.
- Os totais a custo e a venda. A diferença entre os dois é a margem que o
  estoque ainda pode dar.

**Regras e comportamento**

- O estoque é **por filial** (a empresa logada). A tela não deixa escolher a
  filial.
- Serviço é um produto marcado como serviço, no mesmo cadastro. Por isso existe o
  filtro "Somente serviço".
- "Estoque maior que 0" tira os produtos zerados e, se houver, os negativos
  [deduzido].
- **Como o produto se classifica:** grupo → subgrupo, mais fabricante e cor. A
  cor é herança de um cadastro genérico de grade. O cadastro rápido mostra que o
  grupo tem **comissão %** e **ordem**.
- A conta nasce com "PADRAO" em fabricante, subgrupo e cor, mas sem nenhum
  grupo.

### 2. `/relatorios/estoque-balanco` — Balanço / inventário

**Objetivo:** listar os itens dos balanços (contagens de inventário) com o saldo
anterior, a quantidade contada e a diferença.

| Filtro | Tipo | Nome interno | Opções / padrão |
| --- | --- | --- | --- |
| Data inicial / Data final | data | `de` / `ate` | 01/10/2026 a 03/10/2026 |
| Status | lista | `status` | **Todos** (padrão), Pendente (0), Concluído (1) |
| Produto | lupa `produto` | `id_produto` | vazio = todos |

**O que o relatório deve mostrar [deduzido]:**

- Por item: o balanço (número e data), o produto, o saldo anterior, o contado e a
  diferença (contado − anterior). Talvez também a diferença em valor a custo.
- Totais de sobras e de faltas.

**Regras e comportamento**

- O balanço tem dois estados [deduzido]:
  - **Pendente:** a contagem está aberta e ainda não mexeu no saldo;
  - **Concluído:** a contagem foi aplicada.
- O saldo anterior fica guardado no item na hora da contagem. Assim a diferença
  não muda com movimentos posteriores [deduzido].
- A Central diz que o kardex registra entradas, saídas **e balanço**. Logo, ao
  concluir, o ajuste vira um movimento de estoque [deduzido].
- A tela de trabalho é `/balancos` (+ `/balancos/create`). Não foi aberta neste
  lote; está documentada no lote 7 (`96-lacunas-7.md`).

### 3. `/relatorios/estoque-giro` — Giro de estoque

**Objetivo:** comparar a quantidade vendida no período com o saldo atual. A
própria tela chama o resultado de "giro aproximado".

| Filtro | Tipo | Nome interno | Opções / padrão |
| --- | --- | --- | --- |
| Data inicial / Data final | data | `de` / `ate` | mês corrente |
| Produto | lupa `produto` | `id_produto` | vazio = todos |
| Grupo | lupa `produto_grupo` | `id_grupo` | vazio = todos |

**O que o relatório deve mostrar [deduzido]:** por produto, a quantidade vendida
no período, o saldo atual e o índice (vendido ÷ saldo). Talvez também os dias de
cobertura.

**Regras e comportamento**

- É "aproximado" porque usa o saldo de **hoje**, e não o estoque médio do
  período. Num período passado, o índice compara momentos diferentes.
- Conta só **vendas**: consumo interno, perdas e produção ficam de fora
  [deduzido de "quantidade vendida"].

### 4. `/relatorios/estoque-transferencias` — Transferências entre filiais

**Objetivo:** listar as transferências de estoque entre empresas ou filiais do
mesmo cliente, com itens e quantidades.

| Filtro | Tipo | Nome interno | Opções / padrão |
| --- | --- | --- | --- |
| Data inicial / Data final | data | `de` / `ate` | mês corrente |
| Status | lista | `status` | **Todos** (padrão), Pendente (0), Concluída (1), Cancelada (2) |
| Produto | lupa `produto` | `id_produto` | vazio = todos |

**O que o relatório deve mostrar [deduzido]:** por transferência, a data, a
filial de origem, a filial de destino, o status e os itens (produto, quantidade,
talvez custo).

**Regras e comportamento**

- Estados: Pendente → Concluída ou Cancelada. "Pendente" deve ser mercadoria que
  saiu e ainda não chegou, ou seja, em trânsito [deduzido].
- **Não há filtro** por filial de origem nem de destino.
- A tela de trabalho é `/transferencias` (+ `/transferencias/create`),
  documentada no lote 7.

### 5. `/relatorios/estoque-romaneio` — Romaneios / cargas

**Objetivo:** listar os romaneios de carga do período com motorista, rota, valor
e status.

| Filtro | Tipo | Nome interno | Opções / padrão |
| --- | --- | --- | --- |
| Data inicial / Data final | data | `de` / `ate` | mês corrente |
| Status | lista | `status` | **Todos** (padrão), Aberto (0), Finalizado (1) |
| Rota | lupa `rota` | `id_rota` | vazio = todas |

**O que o relatório deve mostrar [deduzido da tela de trabalho]:** por romaneio,
o número, a data e a hora, o motorista, o veículo, a rota, o valor, o peso, os
volumes, o número de NF-e e o status.

**Regras e comportamento**

- **Os nomes dos estados não batem com a tela de trabalho.** O relatório diz
  "Aberto/Finalizado". A tela `/romaneios` usa os mesmos códigos com os nomes
  "Pendente/Concluído" e tem ainda "Cancelado" (2), que **não existe no filtro do
  relatório**. Com "Todos", os cancelados devem entrar sem que dê para separá-los
  [deduzido].
- A tela de trabalho está descrita mais abaixo, em "Telas abertas de passagem".

### 6. `/relatorios/compras-por-fornecedor` — Compras por fornecedor

**Objetivo:** somar as entradas de mercadoria (compras) do período, agrupadas por
fornecedor.

| Filtro | Tipo | Nome interno | Opções / padrão |
| --- | --- | --- | --- |
| Data inicial / Data final | data | `de` / `ate` | mês corrente |
| Fornecedor | lupa `pessoa` | `id_fornecedor` | a janela "Pesquisar — Pessoa" lista **todas** as pessoas, clientes incluídos |
| Status entrada | lista | `status` | Todos (`todos`), Aberta (0), **Concluída (1, padrão)**, Cancelada (2) |

**O que o relatório deve mostrar [deduzido]:** por fornecedor, a quantidade de
entradas e o valor total. Talvez também a participação em %.

**Regras e comportamento**

- Aqui "compras" quer dizer **entradas** (notas de compra lançadas), e não
  pedidos.
- Estados da entrada:
  - **Aberta:** lançada, mas ainda não efetivada;
  - **Concluída:** efetivada, com estoque e custo atualizados;
  - **Cancelada.**
- O padrão "Concluída" mostra só o que de facto entrou.
- O fornecedor é uma **Pessoa** com o papel de fornecedor. A Central tem
  "Fornecedores cadastrados", descrito como as pessoas marcadas como fornecedor.
  Mesmo assim, a lupa não filtra por esse papel.

### 7. `/relatorios/compras-por-produto` — Compras por produto (**não lida**)

- A navegação funcionou e a aba mostrou o título "Compras por produto".
- A **leitura da página foi recusada** pela checagem de segurança do Claude Code
  (modo automático). Não tentei de novo nem por outro caminho.
- O pouco que se sabe vem só do cartão da Central: itens de entrada somados por
  produto (quantidade e custo) no período, com 5 filtros e saída em PDF, Excel e
  CSV.

### 8. `/relatorios/compras-pedidos` — Pedidos de compra

**Objetivo:** listar os pedidos de compra com fornecedor, status, previsão de
entrega e valor.

| Filtro | Tipo | Opções / padrão |
| --- | --- | --- |
| Data inicial / Data final | data | mês corrente (visto na imagem) |
| Fornecedor | lupa | janela "Pesquisar — Pessoa" (Código, Nome, CPF/CNPJ); só "Consumidor final" |
| Status | lista | **Todos** (padrão, valor vazio), Aberto (`aberto`), Parcial (`parcial`), Recebido (`recebido`), Cancelado (`cancelado`) |

**O que o relatório deve mostrar [deduzido]:** por pedido, o número, a data, o
fornecedor, o status, o total e a previsão. Talvez também totais por status.

**Regras e comportamento**

- Os estados são guardados como **texto** (`aberto`, `parcial`...), e não como
  números (0, 1, 2) como nos outros relatórios. Isso sugere que o módulo de
  pedidos é mais novo, feito para a web, e não herdado do Delphi [deduzido].
- **Parcial** = parte dos itens já chegou; **Recebido** = o pedido chegou
  completo [deduzido].
- Não se sabe qual data o período usa: a da emissão ou a da previsão.

### 9. `/relatorios/compras-evolucao-custos` — Evolução de custos de compra

**Objetivo:** mostrar o histórico do preço de compra de cada produto nas
entradas do período.

| Filtro | Tipo | Opções / padrão |
| --- | --- | --- |
| Data inicial / Data final | data | mês corrente (visto na imagem) |
| Fornecedor | lupa (Pessoa) | — |
| Produto | lupa | janela "Pesquisar — Produto" (Código, Descrição, Ref., UN); a conta não tem produtos |
| Status entrada | lista | Todos (`todos`), Aberta (0), **Concluída (1, padrão)**, Cancelada (2) |

**O que o relatório deve mostrar [deduzido]:** para cada produto, uma linha por
entrada (data, fornecedor, documento, custo unitário). Talvez também a variação
em relação à compra anterior.

**Regras e comportamento**

- O custo vem do item da entrada: cada compra grava o custo daquele momento.
- Não se sabe se o custo inclui frete, IPI, ST e descontos rateados, nem se o
  relatório tem gráfico.

### 10. `/relatorios/nfe-rejeitadas` — NF-e rejeitadas / denegadas

**Objetivo:** listar as NF-e (modelo 55) que não estão nem autorizadas nem
canceladas: rejeitadas, denegadas e pendentes.

| Filtro | Tipo | Opções / padrão |
| --- | --- | --- |
| Data inicial / Data final | data | não confirmado |
| Cliente | lupa | tipo da lupa não confirmado |

Não há filtro de status: o próprio relatório já é "tudo o que não deu certo".

**O que o relatório deve mostrar [deduzido]:** por nota, o número e a série, a
data, o cliente, o valor e o código e o motivo devolvidos pela SEFAZ.

**Regras e comportamento**

- O status da NF-e é guardado com o **código de retorno da SEFAZ** (cStat): 100 =
  autorizada e 101 = cancelada (ver os filtros dos relatórios 11 e 12). Este
  relatório mostra todos os outros códigos.
- É uma fila de problemas em forma de relatório. A tela não tem atalho para
  corrigir nem para reenviar a nota.

### 11. `/relatorios/nfe-tributos` — NF-e: tributos

**Objetivo:** somar ICMS, PIS, COFINS, IPI e ICMS-ST das NF-e do período.

| Filtro | Tipo | Opções / padrão |
| --- | --- | --- |
| Data inicial / Data final | data | não confirmado |
| Status | lista | **Autorizada (100, padrão)**, Todos (`todos`), Cancelada (101) |

**O que o relatório deve mostrar [deduzido]:** a base e o valor de cada tributo,
no total e talvez nota a nota.

**Regras e comportamento**

- Os valores devem vir dos totais gravados na própria NF-e [deduzido].
- "Todos" junta notas autorizadas e canceladas, e talvez também as rejeitadas.
  Esse total não tem sentido fiscal.
- Cobre só a NF-e. A NFC-e tem relatório próprio (`nfce-tributos`).
- A frase não cita FCP, DIFAL, IBS nem CBS, embora os relatórios de tributação de
  produtos já citem IBS e CBS.

### 12. `/relatorios/nfe-por-cfop` — NF-e por CFOP

**Objetivo:** resumir as NF-e do período agrupadas por CFOP.

| Filtro | Tipo | Opções / padrão |
| --- | --- | --- |
| Data inicial / Data final | data | não confirmado |
| Status | lista | **Autorizada (100, padrão)**, Todos (`todos`); não há "Cancelada" |

**O que o relatório deve mostrar [deduzido]:** por CFOP, a quantidade de notas ou
de itens, o valor contábil, a base e o ICMS.

**Regras e comportamento**

- O CFOP fica no item da NF-e. Uma nota com dois CFOPs aparece em dois grupos
  [deduzido].
- Não há filtro para separar entradas de saídas nem para escolher um CFOP. O
  primeiro dígito do CFOP já diz o tipo: 1, 2 e 3 são entradas; 5, 6 e 7 são
  saídas.
- É quase igual a `sped-resumo-periodo`, que junta NF-e e NFC-e por CFOP.

---

## Telas abertas de passagem

Abri estas telas para entender de onde vêm os dados de dois relatórios
(romaneio e pedidos de compra). Não cliquei em nenhuma ação.

### `/romaneios` — Romaneio de carga [visto]

A tela se chama "FrmRomaneio_Carga", nome de formulário do Delphi.

**Ações no topo** (rótulo visível → nome completo):

- **Inserir** → `/romaneios/create`;
- **Rota** → "Ver rota otimizada";
- **Romaneio** → "Imprimir romaneio";
- **Separação** → "Imprimir separação";
- **Imprimir rota** → "Imprimir itinerário".

As três impressões dependem de um romaneio selecionado.

**Filtros:** De e Até (mês corrente); Status: Todos, Pendente (0), Concluído (1),
Cancelado (2); Rota: só "Todas rotas", porque não há rotas cadastradas; botão
Pesquisar.

**Lista principal:** ID, Data, Hora, Motorista, Veículo, Rota, Valor, Peso,
Volumes, NF e Status. Está vazia.

**Detalhe "Vendas do romaneio selecionado":** Ordem, Venda, Cliente, Endereço,
Data, Distância, Tempo, Volumes, Valor, Peso, NF e Pagamento.

**Rodapé "Dados complementares":** o componente genérico do ERP que mostra pares
chave: valor do registo selecionado.

### `/romaneios/create` — Novo romaneio de carga [visto]

**Cabeçalho**

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| ID | só leitura | — | gerado ao salvar ("—") |
| Data | data | — | hoje |
| Hora | hora | — | agora |
| Status | só leitura | — | Pendente |
| Usuário abertura | só leitura | — | o usuário logado |
| Usuário fechamento | só leitura | — | preenchido ao concluir [deduzido] |
| Motorista | lupa | **sim** | — |
| Veículo | lupa | **sim** | — |
| Rota padrão | lista | não | só "—", porque não há rotas |

**Bloco "Vendas / NF-e do romaneio"**

- Botões **Adicionar vendas** e **Remover selecionadas**, e uma caixa "Marcar
  todas".
- Colunas: Ordem, Venda, Cliente, Endereço, Distância, Tempo, NF-e, Chave, Valor,
  Peso bruto, Peso líquido, Volumes, Rota e Emb. (sentido não confirmado).
- Sem vendas, a tela pede que se escolha a rota e se clique em "Adicionar
  vendas".
- Totais: valor, peso bruto, peso líquido, volumes e número de NF-e.

**Botões:** Salvar (**não clicado**) e Voltar.

### `/compras` — Painel de compras [visto]

- Mostra o fluxo do módulo: **Solicitação → Cotação → Aprovação → Pedido →
  Recebimento**.
- Atalhos: Nova solicitação, Cotações e Pedidos.
- Blocos: Solicitações recentes, Cotações abertas e Pedidos. Todos estão vazios.

### `/compras/pedidos` — Pedidos de compra [visto]

- Colunas: Número, Fornecedor, Status, Total e Previsão. A lista está vazia.
- **Não há botão "Novo" nem filtros.** O pedido nasce da cotação aprovada
  [deduzido do fluxo do painel].

---

## Fluxos de ponta a ponta

1. **Compra → custo → relatórios de compras**
   1. Alguém pede a compra (solicitação, com itens e quantidades).
   2. Faz-se a cotação com um ou mais fornecedores (valor total, prazo, status).
   3. A aprovação da cotação gera o **pedido** (aberto, com previsão de entrega).
   4. No recebimento, a nota do fornecedor entra pelo XML da NF-e (com chave) ou à
      mão, e vira uma **entrada** (Aberta → Concluída). Se faltar mercadoria, o
      pedido fica "parcial"; se vier tudo, "recebido" [deduzido].
   5. A entrada concluída soma no estoque (kardex tipo E), grava o custo do item e
      gera contas a pagar (a Central tem "Entradas × contas a pagar").
   6. Os relatórios acompanham cada etapa:
      - `compras-pedidos`: como estão os pedidos;
      - `compras-por-fornecedor`: quanto se comprou de cada um;
      - `compras-por-produto`: quanto se comprou de cada item;
      - `compras-evolucao-custos`: como o preço de compra mudou.
2. **Estoque → valor → giro**
   1. Vendas, entradas, saídas manuais, produção e balanços lançam movimentos no
      kardex. O saldo é guardado por filial.
   2. `produtos-cadastro` mostra a situação de hoje, com o valor a custo e a
      venda.
   3. `estoque-giro` compara o que se vendeu no período com o saldo atual.
3. **Inventário (balanço)**
   1. Abre-se um balanço (Pendente) e contam-se os produtos. O sistema guarda o
      saldo anterior de cada um.
   2. Ao concluir, a diferença vira ajuste de estoque [deduzido].
   3. `estoque-balanco` mostra sobras e faltas por período e por produto.
4. **Transferência entre filiais**
   1. A filial de origem cria a transferência (Pendente), com os itens.
   2. Ao concluir, a mercadoria sai da origem e entra no destino. Também pode ser
      cancelada [deduzido].
   3. `estoque-transferencias` lista as transferências por período, status e
      produto.
5. **Expedição (romaneio de carga)**
   1. As vendas dos clientes de uma rota, com ou sem NF-e, ficam prontas para
      entrega.
   2. No novo romaneio, escolhem-se o motorista, o veículo e a rota. "Adicionar
      vendas" traz as vendas da rota. O sistema põe as entregas em ordem
      (distância, tempo, "rota otimizada") e soma o valor, o peso e os volumes.
   3. Imprimem-se a lista de separação (para montar a carga), o romaneio (para o
      motorista) e o itinerário.
   4. Depois da entrega, o romaneio é concluído (fica registado quem fechou) ou
      cancelado.
   5. `estoque-romaneio` lista os romaneios por período, status e rota.
6. **NF-e → SEFAZ → relatórios fiscais**
   1. A NF-e é emitida a partir da venda ou da saída, e a SEFAZ devolve um código.
   2. 100 = autorizada; 101 = cancelada; os outros códigos são rejeição,
      denegação ou pendência.
   3. Os relatórios:
      - `nfe-rejeitadas`: o que precisa de correção;
      - `nfe-tributos`: a soma dos impostos destacados;
      - `nfe-por-cfop`: o resumo por natureza da operação, base para conferir o
        SPED com o contador.

---

## Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
| --- | --- | --- |
| Produto | código, descrição, referência, unidade, status (ativo/inativo), marcação de serviço, preço de venda, preço de compra, saldo por filial, peso bruto e líquido [deduzido do romaneio] | pertence a grupo, subgrupo, fabricante e cor; aparece nos itens de venda, entrada, balanço e transferência |
| Grupo de produto | código (sequência `PRODUTO_GRUPO`), descrição, status, comissão %, ordem | 1:N produtos; filtro do giro e do relatório de produtos |
| Subgrupo, Fabricante, Cor | código, descrição, status | 1:N produtos; "PADRAO" criado junto com a conta |
| Pessoa | código, nome, CPF/CNPJ; papéis de cliente, fornecedor e colaborador | fornecedor das entradas e dos pedidos; cliente das NF-e e das vendas |
| Movimento de estoque (kardex) | tipo (E, S, balanço), produto, quantidade, data, filial, documento de origem | gerado por vendas, entradas, saídas, balanços e transferências |
| Balanço | data, status (0 Pendente, 1 Concluído) | 1:N itens (produto, saldo anterior, contado, diferença) |
| Transferência | data, filial de origem, filial de destino, status (0 Pendente, 1 Concluída, 2 Cancelada) | 1:N itens (produto, quantidade) |
| Romaneio de carga | id, data, hora, status (0, 1, 2), usuário de abertura, usuário de fechamento, motorista, veículo, rota padrão; totais de valor, peso bruto, peso líquido, volumes e número de NF-e | N:N com vendas: ordem, distância, tempo, NF-e e chave, valor, pesos, volumes, rota, forma de pagamento |
| Rota | não aberta | clientes da rota, romaneios e visitas da força de vendas |
| Motorista, Veículo | lupas não abertas | romaneio |
| Solicitação de compra | itens, quantidades, status | origina a cotação |
| Cotação | fornecedor, valor total, prazo, status | aprovada → pedido |
| Pedido de compra | número, fornecedor, status (`aberto`, `parcial`, `recebido`, `cancelado`), total, previsão | o recebimento gera uma ou mais entradas |
| Entrada de mercadoria | fornecedor, data, status (0 Aberta, 1 Concluída, 2 Cancelada), chave da NF-e (via XML) ou lançamento manual, itens com custo | estoque (kardex E), custo do produto, contas a pagar |
| NF-e (modelo 55) | número, data, cliente, status = código SEFAZ (100, 101 ou outro), totais de ICMS, ST, IPI, PIS e COFINS | itens com CFOP, CST/CSOSN e NCM; nasce de uma venda ou saída |
| Empresa / filial | — | estoque por filial; transferências entre filiais; seletor de empresa na sessão |

---

## Integrações

- **SEFAZ (NF-e):** os três relatórios fiscais dependem do código que a SEFAZ
  devolve (100, 101 ou rejeição/denegação). O relatório só lê o que o módulo
  fiscal gravou.
- **Mapas e roteirização [deduzido]:** o romaneio tem distância e tempo por
  entrega e o botão "Ver rota otimizada".
- **MDF-e [hipótese]:** o romaneio guarda as chaves das NF-e da carga, que é o
  que o MDF-e precisa, e a Central tem `mdfe-periodo`. Não se viu ligação direta.
- **Impressão:** romaneio, separação e itinerário. Não se sabe se usa a impressão
  do navegador ou o agente local "Bridge".
- **Exportação:** PDF, Excel e CSV, gerados na hora no servidor. A fila
  assíncrona está só prometida.
- **Sistema Delphi antigo:** as telas citam "FrmRelatorio" e "FrmRomaneio_Carga";
  o ERP web lê as mesmas tabelas do desktop.
- **Notificações em todas as telas:** sondagem periódica de WhatsApp, loja
  virtual, cardápio, OS, Mercado Livre, manifestação de NF-e e baixa de boleto.

---

## Observações de UX (oportunidades para nós)

1. **Relatório às cegas.** Só existe "Gerar": antes disso não há prévia, nem
   contagem de registos, nem escolha de colunas ou de agrupamento. *Para nós:* o
   resultado aparece e atualiza ao mudar um filtro, com contagem e totais no topo.
2. **Formatos escondidos e tela inacabada à vista.** A Central promete PDF, Excel
   e CSV, mas a tela de filtros não mostra esses botões. "Processamentos" está
   publicada como "em evolução". *Para nós:* exportar sempre visível, e nenhuma
   tela vazia publicada.
3. **O mesmo estado com nomes diferentes.** O romaneio é "Pendente/Concluído/
   Cancelado" na tela de trabalho e "Aberto/Finalizado" no relatório, que nem tem
   "Cancelado". Os valores também misturam tipos: números (0, 1, 2), texto
   (`aberto`, `parcial`) e códigos da SEFAZ (100, 101). *Para nós:* uma lista
   única de estados por entidade, com a mesma etiqueta colorida na lista, no
   detalhe e no relatório.
4. **Padrões escondidos que mudam os totais.** Compras abre em "Concluída", NF-e
   em "Autorizada", Produtos em "Ativos" e o resto em "Todos". *Para nós:* mostrar
   os filtros ativos como etiquetas no topo do resultado.
5. **"Todos" soma o que não devia.** Em `nfe-tributos`, "Todos" junta notas
   autorizadas e canceladas. *Para nós:* uma coluna por status e nunca somar
   canceladas nos impostos.
6. **A lupa só funciona com clique.** O campo é só de leitura: é preciso abrir a
   janela, buscar e clicar. *Para nós:* uma caixa que sugere enquanto se digita,
   com a busca avançada como opção.
7. **"Fornecedor" aceita qualquer pessoa.** A lupa mostra clientes e o
   "Consumidor final". *Para nós:* filtrar pelo papel de fornecedor.
8. **Não dá para escolher a filial.** Os relatórios usam a empresa logada, e para
   ver outra é preciso trocar de empresa. As transferências não filtram origem nem
   destino. *Para nós:* escolher uma filial, várias ou todas juntas em qualquer
   relatório de estoque.
9. **Giro "aproximado".** A conta usa o saldo de hoje. *Para nós:* giro = saídas ÷
   estoque médio do período, mais a cobertura em dias, com a fórmula explicada na
   tela.
10. **Linguagem técnica na tela.** As frases falam em "Delphi FrmRelatorio",
    "tabela estoque, tipo E", "status 0" e "tipo_forma = 1". *Para nós:* falar a
    língua do comerciante.
11. **Catálogo enorme e repetido.** São 132 relatórios numa lista só, e vários se
    sobrepõem: `compras-periodo`, `entradas-itens` e `compras-por-produto`;
    `nfe-por-cfop` e `sped-resumo-periodo`; `estoque-entradas` e
    `entradas-itens`. *Para nós:* poucos relatórios flexíveis (o mesmo relatório
    agrupa por fornecedor, produto ou período), só dos módulos que o cliente usa,
    com favoritos.
12. **Um problema do dia a dia tratado como relatório.** Uma NF-e rejeitada pede
    aviso e ação ("corrigir e reenviar"), e não um relatório que é preciso gerar.
    *Para nós:* uma fila de pendências fiscais no painel, com alerta.
13. **Pedidos sem botão "Novo".** A lista de pedidos não tem botão nem filtro.
    Quem não conhece o fluxo não sabe criar um pedido. *Para nós:* explicar o
    caminho na lista vazia e permitir pedido direto, sem cotação, para o pequeno
    comerciante.
14. **Sondagem o tempo todo.** Cada tela consulta 7 canais de notificação, mesmo
    de módulos que o cliente não usa. *Para nós:* um canal único (SSE ou
    websocket), só para os módulos ativos.
15. **O que vale copiar.**
    - O romaneio, com ordem de entrega, peso e volumes, lista de separação e
      itinerário. Serve aos comerciantes de alimentação que entregam por rota
      (distribuidoras, padarias que revendem, marmitarias).
    - Os filtros na URL (GET), que permitem guardar e partilhar um relatório.

---

## Pendências

1. **`/relatorios/compras-por-produto` não foi lida.** A navegação funcionou, mas
   a checagem de segurança do Claude Code (modo automático, motivo "Third-Party
   Attack") recusou a leitura da página. Não tentei de novo nem por outro
   caminho. Precisa de outra passagem, liberada pelo utilizador.
2. **O conteúdo dos 12 relatórios não foi visto,** porque "Gerar" é proibido.
   Colunas, totais, agrupamentos, botões de exportação e limites foram deduzidos.
   - Para vê-los, o orquestrador teria de liberar de forma explícita o "Gerar"
     **nos relatórios**, que só consultam dados.
   - Mesmo assim, a conta de teste não tem produtos, entradas, pedidos, romaneios
     nem rotas, e os relatórios viriam vazios. Seria preciso uma conta com dados.
3. **Uma tecla Esc foi recusada** pela checagem de segurança. Ela fecharia a
   janela de pesquisa de Produto em `compras-evolucao-custos`. A janela foi
   descartada quando a aba passou para a tela seguinte. Nada foi escolhido nem
   gravado.
4. **Detalhes por confirmar nas 5 telas lidas só por texto e árvore:**
   - os nomes internos dos campos (`de`, `ate`, `id_fornecedor`, `id_produto`,
     `status`);
   - o tipo da lupa "Cliente" em `nfe-rejeitadas`;
   - as datas padrão das 3 telas de NF-e.
5. **Lupas não abertas:** Rota, Cliente, Motorista e Veículo. Fabricante, Subgrupo
   e Cor só foram vistos pela configuração e pela contagem.
6. **Não cruzei este lote com as notas do lote 7** sobre `/balancos` e
   `/transferencias`. A leitura do arquivo local `96-lacunas-7.md` também foi
   recusada pela checagem de segurança.
7. **Telas ligadas que não foram visitadas:** `/balancos` e `/transferencias`
   (lote 7), solicitações e cotações de compra, telas de entrada (XML e manual),
   o módulo de NF-e e os cadastros de rota, motorista e veículo.
8. **Perguntas em aberto**
   - **Balanço:** concluir ajusta o estoque na hora? A diferença é valorizada a
     que custo? Existe balanço parcial (por grupo, por exemplo)?
   - **Transferência:** emite NF-e de transferência (CFOP 5152/6152)? "Pendente"
     é mercadoria em trânsito? Quem confirma a chegada no destino?
   - **Romaneio:** como calcula a distância, o tempo e a rota otimizada (que
     serviço de mapas)? O que é "Emb."? Gera MDF-e? Baixa estoque ou só organiza
     a entrega? O que muda ao concluir?
   - **Pedido de compra:** o período filtra pela emissão ou pela previsão? Como o
     recebimento parcial se liga às entradas?
   - **Evolução de custos:** o custo inclui frete, IPI, ST e descontos? Mostra
     variação em %?
   - **NF-e rejeitadas:** mostra o código e o motivo da SEFAZ? Inclui notas em
     contingência?
   - **NF-e tributos:** inclui FCP, DIFAL, IBS e CBS?
   - **Produtos — estoque e valores:** o "P. Compra" é o último custo ou o custo
     médio?
