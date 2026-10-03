# 918 — Lacunas, lote 19: relatórios de faturamento, bancos, pós-venda e comissões (ERP Olímpia)

> **Estado: 12 de 12 rotas abertas e lidas.** Data: 2026-10-03. Conta de teste
> "Boi Criolo" (plano Full), perfil ADMIN, sessão já aberta no navegador embutido.
>
> - Em cada tela foram lidos o título, a frase de explicação, todos os filtros (tipo,
>   nome interno, opções e valor padrão) e as janelas de pesquisa (lupa).
> - **Nenhum relatório foi gerado.** A única ação de cada tela é o botão "Gerar", que
>   está na lista de proibidos desta pesquisa. Por isso, o que cada relatório mostra
>   (colunas e totais) foi **deduzido** da frase da tela, da Central de Relatórios e das
>   telas operacionais que alimentam cada relatório.
> - Para entender o funcionamento, foram abertas também (só leitura) a Central de
>   Relatórios, a tela de Processamentos e quatro telas operacionais ligadas a estes
>   relatórios: Faturamento de Vendas, Liberações, Movimentação Bancária e Boletos. Também
>   foi aberta a Consulta Cliente, com o cliente padrão "CONSUMIDOR FINAL".
> - Ao tentar abrir o relatório irmão `/relatorios/faturamento-lotes`, que não está na
>   lista, o verificador de segurança do Claude Code (modo automático) **recusou** com o
>   motivo "Third-Party Attack". A exploração **parou aí**. Depois disso não houve mais
>   nenhuma navegação no ERP: só o fecho da aba.
>
> Legenda: **[visto]** = observado na tela ou na estrutura da página; **[deduzido]** =
> conclusão a partir do que se viu; **[a verificar]** = pergunta para a próxima visita.

## Em uma frase

Os 12 relatórios são consultas do tipo "filtros + Gerar". Nenhum deles cria ou altera
dados. Juntos, cobrem quatro cadeias do ERP:

- o **faturamento em lote** de orçamentos (vendas do lote, faturamento por vendedor e
  orçamentos);
- o **dinheiro que entra pelo banco** (movimentação bancária, boletos e PIX);
- o **pós-venda** (liberações de supervisor, trocas, devoluções e créditos do cliente);
- as **comissões** (por colaborador, e vendas somadas a peças de OS).

---

## 1. Visão geral do módulo

### 1.1 Onde fica e como se chega

- Todas as telas ficam em `/relatorios/<slug>` [visto]. Há três caminhos para chegar a
  elas:
  - o menu lateral "Relatórios";
  - a **Central de Relatórios** (`/relatorios`);
  - a busca de telas (Ctrl+K). A busca guarda "Recentes", permite favoritar (tecla F) e
    mostra o grupo de cada tela, por exemplo "Relatórios · Comissões" [visto].
- Cada relatório tem o botão "← Central", que volta a `/relatorios` [visto].

### 1.2 Central de Relatórios (`/relatorios`) [visto, como contexto]

- A frase da tela promete consultas gerenciais com dados reais, filtros, totais e saída
  em PDF, Excel e impressão.
- **Filtro da Central:** busca livre (`q`) e uma lista "categoria" com 17 opções: Visão
  geral, Movimentações, Vendas, Caixa, Financeiro, Estoque, Compras, Clientes,
  Fornecedores, Produtos, CRM, Fiscal, Comissões, Ordem de Serviço, Canais digitais,
  Produção e Auditoria. O botão "Filtrar" aplica a escolha.
- **Cartões:** cada relatório aparece num cartão com título, slug, frase de explicação,
  "N filtros · PDF · Excel · CSV" e o botão "Abrir relatório".
- Foram contados **132 relatórios**. Todos dizem sair em PDF, Excel e CSV.
- Algumas frases deixam ver a origem do sistema e detalhes internos: "estilo Delphi",
  "Delphi FrmRelatorio", "status 0", "tipo_forma = 1" e nomes de colunas do banco de
  dados.

### 1.3 Processamentos (`/relatorios/processamentos`) [visto]

- A tela ainda não funciona: diz que está "em evolução".
- Ela anuncia uma fila assíncrona para relatórios muito grandes.
- Hoje, segundo a própria tela, as exportações saem **na hora**, até um limite de volume
  que cada relatório define.

### 1.4 Moldura comum dos 12 relatórios [visto]

1. Título, frase de explicação e o botão "← Central".
2. **Um único cartão de filtros**, em linha, que é um formulário **GET** para a própria
   rota, com um campo oculto `executar=1`.
   - O "Gerar" monta uma URL com os filtros, por exemplo
     `/relatorios/x?executar=1&de=…&ate=…`. [deduzido] Um relatório filtrado pode ser
     guardado ou partilhado como link.
3. **Período:** "Data inicial" (`de`) e "Data final" (`ate`), com o seletor de data do
   próprio navegador. O padrão vai do dia 1 do mês até hoje (01/10/2026 a 03/10/2026)
   em todas as 12 telas.
4. **Lupas** (Cliente, Vendedor, Colaborador, Solicitante). Cada uma tem:
   - um campo oculto com o id (`id_cliente`, `id_vendedor`, `id_colaborador`,
     `id_usuario`);
   - uma caixa só de leitura com o aviso "Clique na lupa para pesquisar…";
   - o botão "Pesquisar" (abre a janela);
   - o botão "Limpar", que fica escondido até haver uma escolha.
5. **Listas** e, em dois relatórios, **texto livre** para o status.
6. O botão **"Gerar"** (submit). Antes de gerar não aparecem exportar, imprimir, guardar
   filtro nem agendar.
7. **Nenhum campo é obrigatório** (não há marca nem validação na página).
8. **Caixa alta:** um script da moldura passa para maiúsculas o que se digita nos campos
   de texto.

### 1.5 Janela de pesquisa (lupa) [visto]

É a mesma janela para todos os cadastros (`erpLookupModal`), aberta com o tipo de
cadastro de cada campo:

| Tipo de lupa | Usada em | Título da janela | Colunas | Registros nesta conta |
|---|---|---|---|---|
| `pessoa` | Cliente (7 relatórios) | "Pesquisar — Pessoa" | Código, Nome, CPF/CNPJ | 1 ("CONSUMIDOR FINAL", cód. 1) |
| `pessoa_colaborador` | Vendedor e Colaborador | "Pesquisar — Colaborador / Vendedor" | Código, Nome, CPF/CNPJ | 0 |
| `usuario` | Solicitante (liberações) | "Pesquisar — Operador" | Código, Operador | 1 |

- Nesta visita a janela **já abriu com a lista carregada**, sem precisar clicar em
  "Buscar". O relatório 20 tinha registrado o contrário noutra tela.
- Tem uma busca "por código ou descrição", o botão "Buscar" e paginação ("Página X de Y
  (N registros)", Anterior e Próximo).
- Também tem os botões "Cadastrar novo" e "Adicionar selecionados", escondidos neste
  modo de escolha única. O primeiro abre o "Cadastro rápido"; o segundo serve à
  multisseleção de outras telas (ver relatório 96).
- **Diferença:** nos relatórios, o filtro "Cliente" usa a pessoa genérica (`pessoa`).
  Nas telas operacionais (Boletos, Consulta Cliente), a lupa de cliente usa
  `pessoa_cliente`. Assim, no relatório dá para escolher como "cliente" uma pessoa que
  não é cliente.

### 1.6 Onde cada relatório aparece

| # | Rota | Título na tela | Nome e grupo no menu | Categoria na Central | Filtros (Central) |
|---|---|---|---|---|---|
| 1 | `/relatorios/faturamento-vendas` | Faturamento — vendas do lote | "Faturamento — vendas" (Financeiro) | Financeiro | 6 |
| 2 | `/relatorios/faturamento-por-vendedor` | Faturamento por vendedor | mesmo nome (Financeiro) | Financeiro | 3 |
| 3 | `/relatorios/banco-movimentacao` | Movimentação bancária | mesmo nome (Financeiro) | Financeiro | 3 |
| 4 | `/relatorios/boletos-periodo` | Boletos emitidos | "Boletos" (Financeiro) | Financeiro | 4 |
| 5 | `/relatorios/pix-recebidos` | PIX recebidos | mesmo nome (Financeiro) | Financeiro | 3 |
| 6 | `/relatorios/vendas-liberacoes` | Liberações de venda | "Liberações" (Vendas extras) | Vendas | 4 |
| 7 | `/relatorios/vendas-trocas` | Trocas de produto | mesmo nome (Vendas extras) | Vendas | 3 |
| 8 | `/relatorios/devolucoes-venda` | Devoluções de venda | "Devoluções" (Vendas extras) | Vendas | 3 |
| 9 | `/relatorios/vendas-orcamentos` | Orçamentos | mesmo nome (Vendas extras) | Vendas | 4 |
| 10 | `/relatorios/cliente-creditos` | Créditos de cliente | mesmo nome (Vendas extras) | **Financeiro** | 3 |
| 11 | `/relatorios/comissoes-venda-colaborador` | Comissões de vendas — por colaborador | "Vendas — por colaborador" (Comissões) | Comissões | 4 |
| 12 | `/relatorios/comissoes-vendas-pecas-os` | Comissões vendas + peças OS | "Vendas + peças OS" (Comissões) | Comissões | 5 |

A contagem de filtros da Central conta as duas datas em separado. Ela bate com o que se
viu em todas as telas.

### 1.7 Códigos internos que as telas deixam ver [visto]

| Conceito | Valores |
|---|---|
| Status da venda | `0` Orçamento · `1` Venda (padrão nas comissões) · `2` Cancelada · `todos` |
| Status da liberação | `0` Pendente · `1` Liberado · `2` Negado · `todos` (iguais no relatório e na fila operacional) |
| Tipo de lançamento bancário | `C` Crédito · `D` Débito (vazio = todos) |
| Financeiro processado (venda do lote) | `1` Sim · `0` Não (vazio = todos) |
| Origem da comissão | `venda` · `peca_os` (vazio = as duas) |
| Status do boleto (tela operacional) | `0` Remessa pendente · `1` Remessa gerada · `2` Liquidado · `3` Cancelado |

---

## 2. Telas

### 2.1 Faturamento — vendas do lote — `/relatorios/faturamento-vendas`

- **Objetivo:** listar as vendas que entraram em lotes de faturamento, com cliente,
  vendedor e as marcas de "estoque processado" e "financeiro processado" de cada venda.
- **Filtros [visto]:**

| Campo | Nome interno | Tipo | Obrigatório | Opções / padrão |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | mês corrente |
| Cliente | `id_cliente` | lupa `pessoa` | não | — |
| Vendedor | `id_vendedor` | lupa `pessoa_colaborador` | não | — |
| Nº lote | **`id_os`** | texto | não | — |
| Financeiro processado | `modo` | lista | não | Todos (padrão) · Sim (1) · Não (0) |

- **Ação:** Gerar (não clicado).
- **O que deve mostrar [deduzido]:** uma linha por venda do lote, com nº do lote,
  venda, data, cliente, vendedor, total e as duas marcas.
- **Regras e comportamento:**
  - [visto] O campo "Nº lote" usa o nome interno `id_os`, o mesmo do "Nº OS" dos
    relatórios de OS. A tela parece ter sido copiada de um modelo de OS.
  - [deduzido] As marcas existem porque cada venda gerada pelo lote movimenta o estoque
    e cria as parcelas a receber. Se uma das duas etapas falha ou fica para depois, a
    marca fica em "Não". Filtrar por "Financeiro processado = Não" serve para achar
    vendas do lote sem parcelas.
  - [deduzido] Confirma o aviso da tela "Desfazer faturamento" (2.13): parcelas e
    estoque "ainda não movimentados" são estornados.

### 2.2 Faturamento por vendedor — `/relatorios/faturamento-por-vendedor`

- **Objetivo:** resumo do faturamento feito em lotes, agrupado por vendedor no período.
- **Filtros [visto]:** Data inicial e Data final (mês corrente) e Vendedor (lupa
  `pessoa_colaborador`).
- **Ação:** Gerar (não clicado).
- **O que deve mostrar [deduzido]:** quantidade de vendas e total faturado por vendedor.
  A tela operacional `/financeiro/faturamento` tem um quadro "Resumo de faturamento no
  período" com as colunas Qtde, Vendedor e Total [visto]. O relatório deve ser a versão
  exportável desse quadro.
- **Regra [deduzido]:** só conta o que passou pelo faturamento em lote. Vendas feitas
  direto no balcão ou no PDV ficam de fora; para elas há "Vendas por vendedor", noutra
  categoria.

### 2.3 Movimentação bancária — `/relatorios/banco-movimentacao`

- **Objetivo:** lançamentos nas contas bancárias no período (créditos e débitos).
- **Filtros [visto]:**

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Tipo | `tipo` | lista | Todos (padrão) · Crédito (C) · Débito (D) |

- **Ação:** Gerar (não clicado).
- **Falta:** não há filtro de **conta bancária** nem de **tipo de documento**, que a tela
  operacional tem [visto]. Sem eles não se tira o extrato de uma conta só.
- **O que deve mostrar [deduzido]:** data, conta, tipo C/D, descrição, valor e saldo,
  como a lista da tela operacional (2.15).
- **Regra [deduzido]:** a tela operacional grava o valor com sinal (positivo = entrada,
  negativo = saída). O relatório traduz o sinal em C/D.

### 2.4 Boletos emitidos — `/relatorios/boletos-periodo`

- **Objetivo:** boletos bancários do período com pagador, vencimento, valor e status.
- **Filtros [visto]:**

| Campo | Nome interno | Tipo | Observação |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente; [a verificar] se é emissão ou vencimento |
| Cliente | `id_cliente` | lupa `pessoa` | — |
| Status (texto) | `status` | **texto livre** | não há lista de opções |

- **Ação:** Gerar (não clicado).
- **O que deve mostrar [deduzido]:** pagador, vencimento, valor e status. Talvez também
  nosso número e cedente, que a lista operacional mostra.
- **Regras e comportamento:**
  - [visto] Na tela operacional `/financeiro/boletos`, o status é uma lista com códigos
    (0 a 3). No relatório é texto livre: o usuário tem de adivinhar o que escrever
    ("LIQUIDADO"? "2"?). [a verificar] Se a busca é exata ou parcial.
  - [visto] O texto digitado vira maiúsculas.

### 2.5 PIX recebidos — `/relatorios/pix-recebidos`

- **Objetivo:** cobranças PIX **geradas ou pagas** no período, com txid, valor e status.
- **Filtros [visto]:** Data inicial e Data final (mês corrente) e Status (`status`,
  **texto livre**).
- **Ação:** Gerar (não clicado).
- **Regras e comportamento:**
  - [visto] O título fala em "recebidos", mas a frase inclui cobranças só geradas. Sem
    filtrar o status, o relatório mistura PIX pago com PIX pendente ou expirado
    [deduzido].
  - [visto] Não há filtro de cliente nem de origem (PDV, link de pagamento, boleto
    híbrido).
  - [deduzido] O "txid" indica PIX dinâmico (cobrança com QR gerado por um provedor),
    e não chave estática. O provedor não aparece nesta tela. O relatório 910 registra
    Asaas, Efí e Mercado Pago nos gateways de cobrança.

### 2.6 Liberações de venda — `/relatorios/vendas-liberacoes`

- **Objetivo:** pedidos de liberação feitos por operadores (desconto, limite e outros),
  com status aprovado, negado ou pendente.
- **Filtros [visto]:**

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Status | `status` | lista | Todos (padrão) · Pendente (0) · Liberado (1) · Negado (2) |
| Solicitante | `id_usuario` | lupa `usuario` ("Pesquisar — Operador": Código, Operador) | — |

- **Ação:** Gerar (não clicado).
- **O que deve mostrar [deduzido]:** as mesmas colunas da fila operacional (2.14): nº,
  data e hora, solicitante, código, contexto, tela de origem, status e gestor.
- **Regras [deduzido]:**
  - O solicitante é um **usuário do sistema** (operador), e não um colaborador.
  - O gestor que aprova também fica gravado. Mas o relatório não filtra por gestor
    [visto: não há esse filtro].
  - A frase do relatório fala em "desconto/limite". A fila operacional fala em
    "estoque, preço, limite e trocas". Os tipos são mais do que o relatório diz.

### 2.7 Trocas de produto — `/relatorios/vendas-trocas`

- **Objetivo:** trocas de produto com o valor devolvido, o valor entregue e a diferença.
- **Filtros [visto]:** Data inicial e Data final (mês corrente) e Cliente (lupa
  `pessoa`).
- **Ação:** Gerar (não clicado).
- **Fonte:** a tela `/troca-produto`, já descrita em parte no relatório 96. Lá:
  - o cliente é obrigatório;
  - há uma grade de produtos devolvidos (entram no estoque) e outra de produtos
    entregues (saem);
  - a diferença vira crédito no caixa ou título a receber.
- **O que deve mostrar [deduzido]:** data, cliente, total devolvido, total entregue e
  diferença (positiva ou negativa).
- **Falta [visto]:** não há filtro de produto, de usuário nem de "tipo de acerto"
  (crédito ou título).

### 2.8 Devoluções de venda — `/relatorios/devolucoes-venda`

- **Objetivo:** entradas de devolução ligadas a vendas (a "operação de devolução").
- **Filtros [visto]:** Data inicial e Data final (mês corrente) e Cliente (lupa
  `pessoa`).
- **Ação:** Gerar (não clicado).
- **Fonte [deduzido, com base no relatório 96]:** a Entrada manual. Nela, a finalidade
  "3 Devolução" troca sozinha a operação para "12 DEVOLUÇÃO DE VENDA". O campo "Nº venda
  (devolução)" importa os itens da venda de origem.
- **O que deve mostrar [deduzido]:** entrada, data, cliente, venda de origem, itens ou
  total e status da entrada.
- **Diferença para Trocas [deduzido]:**
  - A **troca** devolve e entrega no mesmo ato.
  - A **devolução** só devolve, por uma entrada de estoque.
  - O ERP guarda as duas em tabelas diferentes, e por isso há dois relatórios.

### 2.9 Orçamentos — `/relatorios/vendas-orcamentos`

- **Objetivo:** orçamentos do período com cliente, vendedor e totais.
- **Filtros [visto]:** Data inicial e Data final (mês corrente), Cliente (lupa `pessoa`)
  e Vendedor (lupa `pessoa_colaborador`).
- **Ação:** Gerar (não clicado).
- **Regras:**
  - [visto] A frase diz "status 0". O orçamento é uma **venda no estado 0**: o mesmo
    documento muda para 1 (venda) ou 2 (cancelada).
  - [deduzido] O relatório mostra só os orçamentos **ainda abertos**. Um orçamento que
    virou venda (no balcão ou no faturamento em lote) sai da lista, porque o status
    muda. Não há como medir a taxa de conversão orçamento → venda.
  - Origens possíveis de um orçamento, segundo outros relatórios: Venda Balcão
    (`/vendas`), o botão "Orçamento" da OS (relatório 14), o app Força de Vendas e o
    Agente de Vendas IA no WhatsApp (relatório 915).

### 2.10 Créditos de cliente — `/relatorios/cliente-creditos`

- **Objetivo:** lançamentos de crédito e de débito na "conta" de crédito do cliente no
  período.
- **Filtros [visto]:** Data inicial e Data final (mês corrente) e Cliente (lupa
  `pessoa`).
- **Ação:** Gerar (não clicado).
- **Fonte [visto na Consulta Cliente, 2.17]:**
  - O painel do cliente mostra um indicador **"Crédito"** (saldo em R$).
  - Tem também uma aba **"Créditos"** com as colunas Data, Descrição, Crédito e Débito.
    O relatório deve ser a mesma lista para vários clientes.
- **Regras [deduzido]:**
  - O crédito funciona como uma **conta corrente do cliente**: entra por troca,
    devolução ou outro acerto, e sai quando é usado numa venda.
  - O uso em venda tem um relatório próprio na Central ("Créditos usados em vendas",
    `cliente-creditos-venda`, fora deste lote).
  - [a verificar] Se há lançamento manual de crédito, validade do crédito e uso parcial.

### 2.11 Comissões de vendas — por colaborador — `/relatorios/comissoes-venda-colaborador`

- **Objetivo:** resumo das comissões de vendas por colaborador, com quantidade de itens
  e valores.
- **Filtros [visto]:**

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Colaborador | `id_colaborador` | lupa `pessoa_colaborador` | — |
| Status | `status` | lista | **Vendas (1, padrão)** · Orçamentos (0) · Canceladas (2) · Todos |

- **Ação:** Gerar (não clicado).
- **O que deve mostrar [deduzido]:** uma linha por colaborador, com quantidade de itens,
  valor vendido (base) e valor da comissão. É o resumo do "Comissões de vendas —
  analítico" (relatório 20).
- **Regras:**
  - [visto] O padrão é só vendas concluídas: a comissão "por venda" (competência).
  - [deduzido] O filtro "Orçamentos" dá a **comissão prevista** do que ainda não
    fechou. O filtro "Canceladas" serve para conferir estornos.

### 2.12 Comissões vendas + peças OS — `/relatorios/comissoes-vendas-pecas-os`

- **Objetivo:** num só relatório, a comissão de vendas e a das **peças** lançadas em OS,
  com origem, colaborador, percentual e valor.
- **Filtros [visto]:**

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Colaborador | `id_colaborador` | lupa `pessoa_colaborador` | — |
| Cliente | `id_cliente` | lupa `pessoa` | — |
| Origem | `origem` | lista | **Vendas e peças OS (padrão, vazio)** · Somente vendas (`venda`) · Somente peças OS (`peca_os`) |

- **Ação:** Gerar (não clicado).
- **Regras:**
  - [deduzido] Peça vendida pela OS e produto vendido no balcão pagam comissão do mesmo
    modo, porque os dois são "produto". Serviço de OS fica de fora: tem relatório
    próprio ("Comissões de serviços").
  - [visto] Este relatório **não tem filtro de status**, ao contrário de todos os outros
    de comissão. [a verificar] Se entram vendas canceladas, orçamentos e OS abertas ou
    canceladas.

### 2.13 Contexto — Faturamento de Vendas — `/financeiro/faturamento` [visto]

É a tela que **cria** os lotes que os relatórios 2.1 e 2.2 leem. Fica no menu "Estoque ·
Expedição & Vendas" e não no Financeiro, apesar da URL.

- **Objetivo:** transformar em vendas, de uma vez, os orçamentos de um vendedor,
  conferindo estoque, preços e regras.
- **Assistente em 3 passos:** 1 Vendedor → 2 Seleção → 3 Conferir & Gerar.
  - **Passo 1:**
    - Vendedor (lupa `pessoa_colaborador`, obrigatório; o rótulo mostra dois
      asteriscos, "Vendedor * *").
    - De e Até (padrão: hoje).
    - Chave "Só enviados pelo app" (**ligada por padrão**).
    - Botão "Buscar". O aviso diz que a busca dos orçamentos é automática depois de
      escolher o vendedor.
  - **Orçamentos pendentes:** lista dos orçamentos do vendedor ("0 registro(s)"; vazia,
    porque a conta não tem vendedores).
  - **Passo 3 [visto na estrutura da página, não exibido]:**
    - Cartão "Conferência de estoque, preços e regras".
    - Caixa "Conferi e aprovo as divergências apresentadas".
    - Botão "Aprovar bloqueios com senha".
    - Botão **"Gerar vendas e imprimir"**, que envia para `/financeiro/faturamento/gerar`
      (POST).
    - Dois campos ocultos: `analise_hash`, que garante que o lote gerado é o mesmo que
      foi conferido [deduzido], e `aprovar_divergencias` (0/1).
- **Regras da geração** (botões "Configurar regras" e "Nova regra", janela "Regras
  personalizadas da geração") [visto na estrutura da página]:
  - São regras **adicionais**. A tela avisa que as validações obrigatórias do ERP
    (estoque, preço, limite) não podem ser desligadas.
  - **Formulário da regra:**

| Campo | Tipo | Obrigatório | Opções |
|---|---|---|---|
| Nome da regra | texto | sim | — |
| O que conferir | lista | sim | 24 tipos (abaixo) |
| Limite | número | depende do tipo | — |
| Quando não for atendida | rádio | — | **Avisar** (deixa aprovar) · **Bloquear** (impede gerar) |
| Usar esta regra na geração | caixa | — | desmarcada = guarda a regra como modelo, sem aplicar |

  - **Os 24 tipos de regra:**
    - **Valor do pedido:** valor mínimo e valor máximo.
    - **Desconto:** máximo em %, máximo em R$, máximo por item e proibir qualquer
      desconto.
    - **Preço:** divergência máxima em % e em R$ contra o cadastro, preço abaixo do
      cadastro, proibir preço zero, valor unitário mínimo e valor líquido mínimo por
      item.
    - **Estoque:** saldo mínimo depois do lote e estoque insuficiente no lote.
    - **Quantidades:** máximo e mínimo por item, total máximo do pedido, mínimo e máximo
      de itens.
    - **Acréscimo:** acréscimo máximo.
    - **Origem e dados:** só pedidos do Força de Vendas, exigir observação, exigir forma
      de pagamento e exigir cliente identificado.
  - **35 modelos prontos**, cada um com tipo, valor e nível. Exemplos: "bloquear
    desconto acima de 10%", "avisar preço divergente acima de 5%" e "pedido mínimo de
    R$ 200 (bloqueia)".
- **Liberação de supervisor** (janela) [visto na estrutura da página]:
  - Campos: Usuário (lista; aqui só "ADMIN") e "Senha de liberação".
  - Botão **"Solicitar remota"**: manda o pedido para o gestor aprovar em Financeiro →
    Liberações. Enquanto isso, a janela mostra "aguardando liberação" e o número da
    solicitação.
  - Botões Cancelar e Liberar.
- **Desfazer faturamento** (janela) [visto na estrutura da página]:
  - As vendas voltam a ser orçamentos.
  - O estoque e as parcelas ainda não movimentados são estornados.
  - Ficam **bloqueadas** as vendas que já têm nota fiscal, recebimento, cartão, boleto,
    entrega ou troca.
  - O motivo é obrigatório e fica gravado para sempre no histórico.
- **Quadros da tela:**
  - "Resumo de faturamento no período" (Qtde, Vendedor, Total).
  - "Histórico de faturamentos" (Lote, Data e hora, Usuário, Vendas, Total, Status,
    Ações), com os últimos lotes. Estava vazio.

### 2.14 Contexto — Liberação de Vendas — `/financeiro/liberacoes` [visto]

É a fila que **produz** os dados do relatório 2.6.

- **Objetivo:** fila em que o gestor aprova ou nega pedidos de estoque, preço, limite e
  trocas.
- **Indicadores:** "Pendentes" e "No filtro", com o selo **"Ao vivo · 5s"** (a lista se
  atualiza sozinha a cada 5 segundos [deduzido]).
- **Abas:** Pendentes, Liberados, Negados e Todos. São links com `status=0|1|2|todos`,
  `de`, `ate` e `filiais[]=1`, ou seja, há filtro por filial.
- **Filtros:** De e Até (padrão: **últimos 7 dias**), "Localizar" e "Atualizar".
- **Colunas:** Nº, Data/Hora, Solicitante, Código, Contexto da solicitação, Tela, Status,
  Gestor, Ações. A lista estava vazia.
- O aviso da tela diz que o pedido aparece aqui sozinho quando um operador pede
  liberação na venda ou no PDV.

### 2.15 Contexto — Movimentação Bancária — `/financeiro/banco-movimentacao` [visto]

- **Indicadores:** Lançamentos, Entradas, Saídas e Líquido.
- **Filtros:** Conta (só "Todas as contas": a conta não tem conta bancária cadastrada),
  Tipo documento (Todos, PADRAO), De, Até, Localizar e "Limpar filtros".
- **Colunas:** ID, Data, Conta, Tipo, Descrição, Valor, Saldo ant., Saldo e **Caixa**.
  Há paginação.
- **"Novo lançamento"** (janela lida na estrutura da página, sem abrir e sem gravar):

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Conta | lista | sim | contas bancárias (nenhuma nesta conta) |
| Tipo documento | lista | sim | PADRAO |
| Data | data | sim | padrão: hoje |
| Valor (+ / −) | número | sim | positivo = entrada; negativo = saída |
| Plano de contas | lupa `plano_contas` | não | — |
| Descrição | texto | sim | — |

### 2.16 Contexto — Boletos — `/financeiro/boletos` [visto]

- **Cabeçalho "Cobrança bancária":**
  - "Integração" leva a `/empresa/1#tab-integracao`.
  - "Gerar remessa" e "Importar retorno" (não clicados) enviam para
    `/financeiro/boletos/remessa` e `/financeiro/boletos/retorno` (POST).
- **Indicadores:** total na lista, pendentes prontos para remessa e registrados/pagos.
- **Aviso:** na integração por **API**, o boleto é registrado direto no banco, sem
  arquivo de remessa. A baixa chega por API ou webhook.
- **Filtros:** Cliente (lupa `pessoa_cliente`), Cedente, Status (lista de 0 a 3) e
  Vencimento de/até.
- **Ação em lote:** selecionar títulos **do mesmo cedente** e gerar a remessa.
- **Colunas:** ID, Cliente, Cedente, Venc., Valor, Nosso nº, Remessa, Status, **Canal da
  baixa**, Pagamento, Ações.
- O aviso de lista vazia diz que os boletos se geram a partir do recebimento, com o
  cedente padrão.

### 2.17 Contexto — Consulta Cliente — `/consulta-cliente` e `/consulta-cliente/{id}` [visto]

- A tela de busca é um formulário GET com a lupa `pessoa_cliente` e o botão "Analisar".
- O painel do cliente padrão "CONSUMIDOR FINAL" (cód. 1) mostra:
  - **Cabeçalho:** cidade e UF, selo "Ativo" e atalhos:
    - Cadastro (`/pessoas/1/edit`);
    - Receber (`/financeiro/recebimento?filtro=cliente&consulta=1`);
    - Títulos (`/financeiro/receber?id_cliente=1`);
    - Vendas (`/vendas?id_cliente=1`).
  - **Score de pagamento** (50, "sem histórico").
  - **Indicadores:** Em aberto, Vencido, **Crédito**, Total comprado, Ticket médio
    (12 meses), Última compra, Frequência, Total pago e Cliente desde.
  - **Gráficos:** vendas mensais de 12 meses, histórico de pagamentos, média de atraso
    de 6 meses e produtos mais comprados.
  - **Abas:**
    - Vendas (#, Data, Vendedor, Forma pag., Valor);
    - A receber (#, Venc., Parc., Valor);
    - Pagos (#, Venc., Pago em, Valor);
    - **Créditos** (Data, Descrição, Crédito, Débito).
  - **Linha do tempo.**
  - Tudo estava vazio.

---

## 3. Fluxos de ponta a ponta

Passos marcados **(obs.)** foram vistos. Os outros são o encadeamento mais provável
e estão **a verificar**.

1. **Rodar um relatório**
   1. Central ou menu → abrir o relatório **(obs.)**.
   2. Ajustar os filtros (período padrão: mês corrente) **(obs.)**.
   3. "Gerar" faz um GET com `executar=1` **(obs.)**.
   4. A mesma tela mostra o resultado com totais.
   5. PDF, Excel, CSV ou impressão, como promete a Central.
   6. Volumes grandes irão um dia para a fila de Processamentos, que ainda não funciona
      **(obs.)**.
2. **Orçamento → faturamento em lote → relatórios de faturamento**
   1. O orçamento (venda com status 0) nasce no app Força de Vendas, na Venda Balcão,
      na OS ou no agente de WhatsApp.
   2. Em Faturamento de Vendas: escolher o vendedor, o período e "só do app"
      **(obs.)**.
   3. Selecionar os orçamentos.
   4. Conferir estoque, preço e as regras (avisos e bloqueios) **(obs. na estrutura)**.
   5. Marcar "conferi e aprovo" e, se houver bloqueio aprovável, pedir senha de
      supervisor ou liberação remota **(obs. na estrutura)**.
   6. "Gerar vendas e imprimir" **(obs. na estrutura)**.
   7. As vendas passam a status 1. O estoque e o financeiro são processados e marcados
      em cada venda.
   8. O lote entra no histórico **(obs.)**.
   9. Os relatórios "Faturamento — lotes", "— vendas do lote" e "por vendedor" mostram
      o resultado.
3. **Desfazer um lote**
   1. Ação no histórico → motivo obrigatório **(obs. na estrutura)**.
   2. As vendas voltam a orçamento. O estoque e as parcelas ainda não movimentados são
      estornados **(obs. no texto)**.
   3. Vendas com nota, recebimento, cartão, boleto, entrega ou troca são bloqueadas
      **(obs. no texto)**.
   4. Os orçamentos voltam a aparecer no relatório "Orçamentos".
4. **Liberação de supervisor**
   1. O operador esbarra num bloqueio (desconto, preço, limite, estoque, troca) na
      venda, no PDV ou no faturamento.
   2. Há dois caminhos **(obs.)**:
      - liberação **local**: o supervisor escolhe o usuário e digita a senha de
        liberação ali mesmo;
      - liberação **remota**: o operador clica em "Solicitar remota", o pedido entra na
        fila `/financeiro/liberacoes` (atualizada a cada 5 s) e o gestor aprova ou nega.
   3. A tela do operador continua quando o pedido é aprovado.
   4. O relatório "Liberações de venda" lista os pedidos por status e solicitante.
5. **Troca de produto**
   1. Em `/troca-produto`: cliente, itens devolvidos (entram no estoque) e itens
      entregues (saem) (relatório 96).
   2. A diferença vira crédito do cliente ou título a receber.
   3. Talvez peça liberação: a fila cita "trocas".
   4. Relatórios "Trocas de produto" e "Créditos de cliente".
6. **Devolução de venda**
   1. Entrada manual com finalidade "Devolução" (operação 12) e o nº da venda, que
      importa os itens (relatório 96).
   2. Concluir a entrada → estoque (+).
   3. Crédito ou estorno ao cliente.
   4. Relatórios "Devoluções de venda" e talvez "Créditos de cliente".
7. **Crédito do cliente**
   1. Entra por troca, devolução ou acerto.
   2. O saldo aparece na Consulta Cliente **(obs.)**.
   3. É usado numa venda como forma de pagamento.
   4. Relatórios "Créditos de cliente" (lançamentos) e "Créditos usados em vendas".
8. **Banco**
   1. Lançamento manual com valor positivo ou negativo, conta, tipo de documento e
      plano de contas **(obs. na estrutura)**.
   2. Ou lançamento automático, vindo da baixa de títulos e da conciliação OFX
      (relatório 99).
   3. O saldo anterior e o saldo são calculados por conta.
   4. Relatório "Movimentação bancária" (C/D).
9. **Boleto**
   1. No recebimento, gerar o boleto com o cedente padrão.
   2. Registro no banco: por remessa CNAB (selecionar títulos do mesmo cedente → gerar
      remessa → status "Remessa gerada") ou direto por API **(obs.)**.
   3. Pagamento → arquivo de retorno ou webhook → "Liquidado", com o canal da baixa
      **(obs.)**.
   4. A baixa do título cai no caixa ou no banco.
   5. Relatório "Boletos emitidos".
10. **PIX**
    1. Cobrança gerada com txid (no PDV, no caixa ou em link de pagamento).
    2. O cliente paga.
    3. A confirmação chega do provedor.
    4. Baixa.
    5. Relatório "PIX recebidos" (geradas e pagas).
11. **Comissão**
    1. Venda ou OS com colaborador.
    2. Cada item (produto, peça ou serviço) guarda o percentual e o valor da comissão
       (relatório 20).
    3. Relatórios por colaborador (2.11) e combinado vendas + peças (2.12).
    4. Para pagar no regime de caixa: "Comissões por recebimento" (relatório 20).

---

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| Relatório (catálogo) | slug, título, categoria (17), descrição, filtros, formatos (PDF, Excel, CSV) | estático; a Central lista e filtra |
| Venda | nº, data, status (0 orçamento, 1 venda, 2 cancelada), cliente, vendedor, forma de pagamento, origem (app, balcão, WhatsApp), observação, totais, desconto, acréscimo | tem itens; pode pertencer a um lote; gera parcelas a receber, nota e movimento de estoque |
| Item de venda | produto, quantidade, unitário, desconto, acréscimo, % e valor de comissão, colaborador | pertence a uma venda |
| Lote de faturamento | nº, data e hora, usuário, vendedor, nº de vendas, total, status, motivo do desfazimento | tem N vendas; usa as regras de geração ativas |
| Venda do lote | lote, venda, estoque processado (s/n), financeiro processado (s/n) | liga o lote à venda |
| Regra de geração | nome, tipo (24), limite, nível (aviso ou erro), usar na geração | da empresa; 35 modelos prontos |
| Solicitação de liberação | nº, data e hora, solicitante (usuário), código, contexto, tela de origem, status (0, 1, 2), gestor, filial | nasce numa venda, PDV, faturamento ou troca |
| Usuário / operador | código, nome, senha de liberação, permissão de gestor | pede ou aprova liberações; gera lotes |
| Pessoa | código, nome, CPF/CNPJ; papéis cliente e colaborador/vendedor | cliente de vendas, boletos e créditos; colaborador de comissões |
| Conta bancária | nome | tem movimentos |
| Movimento bancário | id, data, conta, tipo de documento, descrição, valor com sinal (C/D), saldo anterior, saldo, caixa, plano de contas | pertence a uma conta; pode vir de baixa ou de conciliação |
| Boleto | id, cliente, cedente, vencimento, valor, nosso nº, remessa, status (0 a 3), canal da baixa, data de pagamento | pertence a um título a receber e a um cedente; entra numa remessa ou é registrado por API |
| Cedente / remessa / retorno | cedente padrão; arquivos CNAB | 1 remessa = N boletos do mesmo cedente |
| Cobrança PIX | txid, valor, status, datas | ligada a um título ou venda [a verificar]; criada por um provedor |
| Troca de produto | cliente, observação, itens devolvidos, itens entregues, totais, diferença | gera entrada e saída de estoque e crédito ou título |
| Devolução de venda | entrada manual com finalidade 3 e operação 12, nº da venda, itens | aponta para a venda de origem; estoque (+) |
| Crédito do cliente (lançamento) | data, descrição, crédito, débito; saldo | do cliente; usado em vendas |
| Comissão | origem (venda ou peça de OS), documento, colaborador, %, valor | guardada no item da venda, no item da OS e no título a receber |

---

## 5. Integrações que as telas pressupõem

| Integração | Onde aparece | Estado |
|---|---|---|
| Bancos — boleto CNAB (remessa e retorno) | `/financeiro/boletos` | visto (botões e formulários POST) |
| Bancos — boleto por API e webhook | aviso em `/financeiro/boletos` | visto (texto) |
| Provedor PIX (cobrança com txid) | relatório PIX recebidos | deduzido; provedores do relatório 910: Asaas, Efí, Mercado Pago |
| Extrato OFX / conciliação | relatório irmão `banco-conciliacao` (Central) | visto como cartão; tela no relatório 99 |
| App Força de Vendas (mobile) | "Só enviados pelo app" e regra "somente pedidos do app" | visto |
| Agente de Vendas IA (WhatsApp, MCP) | janela global "Novo pedido WhatsApp" na moldura | visto (estrutura da página); relatório 915 |
| Impressão | "Gerar vendas e imprimir"; impressão de relatórios | visto (botão); formato a verificar |
| Exportação PDF, Excel, CSV | cartões da Central | visto (texto); não exercitado |
| SEFAZ (NF-e, NFC-e) | bloqueio do desfazimento para vendas com nota | visto (texto) |
| TEF / cartão | bloqueio do desfazimento para vendas com cartão; relatório irmão `tef-operacoes` | visto (texto) |

Observação técnica [visto]: a moldura usa Bootstrap 5.3.3 e SweetAlert2. Tem scripts
próprios para lupa, menu e tema, e o Cloudflare Insights. Formulários com token CSRF
indicam um backend MVC (estilo Laravel) [deduzido].

---

## 6. Observações de UX (oportunidades para nós)

1. **Gerar às cegas.**
   - Todos os relatórios abrem vazios e pedem "Gerar", mesmo com os filtros padrão.
   - Não há prévia, filtro salvo, agendamento nem envio por e-mail ou WhatsApp.
   - Exportar só existe depois de gerar.
   - **Nós:** mostrar o resultado do período padrão logo ao abrir, com exportar sempre
     à vista e "salvar visão".
2. **Status em texto livre** (Boletos, PIX), quando a tela operacional tem lista com
   códigos. O usuário tem de adivinhar o texto. **Nós:** lista fixa igual à da tela
   operacional, com escolha múltipla.
3. **Extrato bancário sem filtro de conta.** O relatório não filtra conta nem tipo de
   documento; a tela operacional filtra. **Nós:** a conta é o primeiro filtro, com saldo
   inicial e final.
4. **Nomes que não batem.**
   - "Boletos" (menu), "Boletos emitidos" (tela) e "boletos-periodo" (rota).
   - "PIX recebidos" inclui PIX não pago.
   - "Liberações" fala de desconto e limite, mas a fila também cobre estoque, preço e
     trocas.
   - **Nós:** um nome só por relatório, que diga exatamente o que entra.
5. **Categorias desencontradas.**
   - "Créditos de cliente" está em Financeiro na Central e em "Vendas extras" no menu.
   - "Vendas extras" mistura liberações e trocas com SPED, ICMS, NFS-e, anúncios do
     Mercado Livre e lista de preços.
   - "Produtos — estoque e valores" aparece em dois grupos.
   - "Faturamento de Vendas" está em Estoque, mas a URL é `/financeiro/...`.
6. **Jargão técnico para o usuário final.** Frases com "status 0", "tipo_forma = 1",
   "estilo Delphi" e "FrmRelatorio". O nome interno `id_os` no campo "Nº lote" mostra
   uma tela copiada de outra (risco de erro).
7. **Lupa obrigatória para escolher.**
   - A caixa é só de leitura: não se digita o nome direto. O aviso fica cortado ("Clique
     na lup…") e os rótulos das lupas desalinham dos rótulos das datas.
   - O filtro "Cliente" aceita qualquer pessoa.
   - **Nós:** campo com sugestão enquanto se digita, restrito ao papel certo (cliente,
     vendedor).
8. **Falta de filtros que um gestor pede:**
   - por gestor nas liberações;
   - por produto nas trocas;
   - por origem (PDV, link) e por cliente no PIX;
   - por status no relatório de comissões vendas + peças, que deixa em aberto se entram
     cancelados.
9. **Período padrão muda de tela para tela:** mês corrente (relatórios), 7 dias
   (liberações), hoje (faturamento).
10. **Orçamentos sem conversão.** O relatório só mostra o que ainda está em status 0.
    Não dá para ver quanto foi convertido, perdido ou expirou. **Nós:** um funil
    orçamento → venda com motivo de perda.
11. **Faturamento em lote: poderoso, mas pesado.**
    - São 24 tipos de regra, 35 modelos, dois níveis, aprovação por senha ou remota e
      hash da conferência. Serve a distribuidoras.
    - Para o nosso público (pequeno comerciante de alimentação) é **excessivo**.
    - **Nós:** só ligar se o cliente tiver vendedores externos, com 3 ou 4 regras
      essenciais (desconto máximo, estoque, pedido mínimo) e o resto escondido.
12. **Fila de liberações por consulta a cada 5 s.** **Nós:** aviso em tempo real (push
    ou realtime) para o celular do gestor, com aprovar ou negar num toque.
13. **Moldura pesada:** cada tela carrega as janelas globais de notificação (loja
    virtual, cardápio, OS, Mercado Livre, WhatsApp IA), mesmo sem o módulo em uso.
    **Nós:** carregar só o que o cliente contratou (ERP modular).
14. **Pontos positivos a copiar:**
    - URL com filtros (dá para guardar e partilhar);
    - busca de telas com Ctrl+K, recentes e favoritos;
    - Consulta Cliente com score, crédito e linha do tempo numa tela só;
    - desfazimento de lote com motivo obrigatório e bloqueios de segurança.

---

## 7. Pendências

1. **Conteúdo real dos 12 relatórios** (colunas, totais, agrupamentos, aparência do PDF,
   Excel e CSV, limite de linhas). "Gerar" é proibido nesta pesquisa. Pede autorização
   explícita para gerar relatórios, ou capturas feitas pelo dono da conta.
2. **`/relatorios/faturamento-lotes`** (fora da lista, aberto como contexto): **recusado**
   pelo verificador do modo automático ("Third-Party Attack"). A exploração parou aí e
   nada mais foi tentado.
3. **Status em texto livre** (Boletos, PIX): busca exata ou parcial; por código ou por
   texto; que valores existem no PIX.
4. **Qual data cada relatório usa** no período: emissão, vencimento ou pagamento
   (boletos); geração ou pagamento (PIX); data do lote ou da venda (faturamento).
5. **Movimentação bancária:** se o relatório junta todas as contas e o caixa (a tela
   operacional tem a coluna "Caixa"); se mostra saldo.
6. **PIX:** de onde vêm as cobranças (PDV, caixa, link de pagamento, boleto híbrido),
   qual provedor e se a baixa é automática.
7. **Troca e devolução:** a regra entre crédito e título; se a troca exige liberação; se
   a devolução gera crédito sozinha; prazo de troca.
8. **Créditos de cliente:** se há lançamento manual, validade, uso parcial e quem pode
   lançar.
9. **Comissões vendas + peças:** que status entram; base de cálculo (bruto ou líquido de
   desconto); onde se configura o percentual (produto, colaborador ou serviço). A tela
   `/comissoes/metas` não foi aberta.
10. **Faturamento em lote:** os passos 2 e 3 não foram vistos em funcionamento (a conta
    não tem vendedor nem orçamento); estados possíveis do lote; o que "imprimir"
    imprime; quando as marcas de estoque e financeiro ficam em "Não".
11. **Liberações:** o que é o campo "Código"; se o pedido expira; como o gestor é
    avisado; se a senha de liberação é diferente da senha de login.
12. **Permissões:** tudo foi visto como ADMIN. Não se sabe quem pode abrir cada
    relatório nem aprovar liberações.

---

## 8. Registro técnico

- Aba própria `tab-51`, criada no início e fechada no fim. A aba do usuário não foi
  usada.
- **12 rotas da lista:** todas abertas e lidas pelo texto da página, pela lista de
  elementos interativos e por scripts de leitura da estrutura (formulários, opções e
  tipo de lupa).
- **Janelas de pesquisa abertas e fechadas com Esc:** Cliente e Vendedor (em
  faturamento-vendas) e Solicitante (em vendas-liberacoes). Nada foi escolhido.
- **Busca de telas (Ctrl+K):** termos "faturamento", "crédito" e "devolu", só para achar
  as telas ligadas. Fechada com Esc.
- **Telas de contexto abertas (só leitura):** `/relatorios`,
  `/relatorios/processamentos`, `/financeiro/faturamento`, `/financeiro/liberacoes`,
  `/financeiro/banco-movimentacao`, `/financeiro/boletos`, `/consulta-cliente` e
  `/consulta-cliente/1`.
- As janelas "Regras", "Liberação de supervisor", "Desfazer faturamento" e "Novo
  lançamento" foram lidas **na estrutura da página, sem abrir**.
- **Não foi clicado:** Gerar, Salvar regra, Gerar vendas e imprimir, Aprovar, Liberar,
  Solicitar remota, Desfazer lote, Gravar, Gerar remessa, Importar retorno. Nada foi
  digitado em campos de senha.
- **Recusa:** a navegação para `/relatorios/faturamento-lotes` foi negada pelo
  verificador do modo automático. Depois dela não houve mais nenhuma navegação.
- **Dados pessoais:** só apareceram o cliente padrão "CONSUMIDOR FINAL" e o usuário
  "ADMIN". O nome do operador na lupa de solicitante não foi registrado. Tokens da
  página não foram registrados.

### Rotas e sub-rotas

| Rota | Estado |
|---|---|
| `/relatorios/faturamento-vendas` | visitada |
| `/relatorios/faturamento-por-vendedor` | visitada |
| `/relatorios/banco-movimentacao` | visitada |
| `/relatorios/boletos-periodo` | visitada |
| `/relatorios/pix-recebidos` | visitada |
| `/relatorios/vendas-liberacoes` | visitada |
| `/relatorios/vendas-trocas` | visitada |
| `/relatorios/devolucoes-venda` | visitada |
| `/relatorios/vendas-orcamentos` | visitada |
| `/relatorios/cliente-creditos` | visitada |
| `/relatorios/comissoes-venda-colaborador` | visitada |
| `/relatorios/comissoes-vendas-pecas-os` | visitada |
| `/relatorios` (Central) | sub-rota visitada |
| `/relatorios/processamentos` | sub-rota visitada (em construção) |
| `/relatorios/faturamento-lotes` | **recusada** pelo verificador |
| `/financeiro/faturamento` | contexto visitado |
| `/financeiro/faturamento/gerar` (POST) | ação; não visitada (grava) |
| `/financeiro/liberacoes?status=0\|1\|2\|todos&de&ate&filiais[]` | contexto visitado |
| `/financeiro/banco-movimentacao` | contexto visitado |
| `/financeiro/boletos` | contexto visitado |
| `/financeiro/boletos/remessa`, `/financeiro/boletos/retorno` (POST) | ações; não visitadas |
| `/consulta-cliente`, `/consulta-cliente/{id}` | contexto visitado |
| `/empresa/1#tab-integracao`, `/pessoas/{id}/edit`, `/financeiro/recebimento?filtro=cliente&consulta={id}`, `/financeiro/receber?id_cliente={id}`, `/vendas?id_cliente={id}` | links vistos; não abertos |
| `/troca-produto`, `/comissoes/metas`, `/dashboard/modulo/relatorios` | links do menu; não abertos |
