# 19 — Relatórios: Central, moldura comum, vendas, financeiro, faturamento e bancos (ERP Olímpia)

> Cobre o módulo Relatórios no que é comum a todos os relatórios (hub, Central de
> Relatórios com o catálogo dos 132 relatórios, Processamentos, rota genérica, moldura,
> lupa, códigos internos) e os 26 relatórios de vendas, contas a receber e a pagar,
> faturamento em lote, bancos e pós-venda. Exploração só de leitura em 2026-10-03, na
> conta de teste "Boi Criolo" (plano Full, perfil ADMIN), com a sessão já aberta no
> navegador embutido. **Nenhum relatório foi gerado** ("Gerar" estava na lista de
> proibidos): filtros, opções e nomes internos foram vistos; colunas e totais são
> deduzidos. Nada foi gravado no ERP.
> Legenda: **[visto]** na tela ou na árvore de acessibilidade; **[visto em parte]**;
> **[código]** lido no HTML/JS da página; **[Central]** lido no cartão do relatório na
> Central; **[deduzido]**; **[afirmado pelo manual]**; **[a verificar]** hipótese;
> **[proposta]** sugestão para o nosso produto.

Relatórios de outros grupos: `caixa-*` em [03-caixa.md](03-caixa.md); `comissoes-*` e
`os-*` em [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md); estoque,
compras, fiscal, Mercado Livre, loja e lista de preços em
[21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md).
Aqui eles aparecem só no catálogo da Central (2.2.1).

---

## 1. Visão geral

### 1.1 O que o módulo faz e onde fica

- **Módulo "Relatórios"** [visto]: no menu lateral fica na seção "Visão Geral", junto
  de BI Executivo e Consultoria. São consultas sem gravação: nenhuma tela de relatório
  cria ou altera registros. Os dados vêm de Vendas, Financeiro, Estoque, Fiscal, OS,
  canais digitais etc.
- **Três caminhos até um relatório** [visto]:
  - o menu lateral "Relatórios" (que mostra 78 relatórios, os mesmos do hub);
  - a **Central de Relatórios** (`/relatorios`), com os 132;
  - a busca de telas (Ctrl+K), que guarda "Recentes", permite favoritar (tecla F) e
    mostra o grupo de cada tela (ex.: "Relatórios · Comissões").
- **Todas as telas de relatório** ficam em `/relatorios/{slug}` e têm o botão
  "← Central", que volta a `/relatorios`. O título da aba do navegador é
  "{Título} - Relatórios" [visto].
- **Hub do módulo** (`/dashboard/modulo/relatorios`, 2.1): 80 cartões em 8 grupos, com
  atalhos para a Central e para Processamentos no topo.
- **O manual do sistema não tem cartão para Relatórios** [visto; ver
  [22-manual.md](22-manual.md)]. O BI tem um ponto de atenção "produtos abaixo do
  estoque mínimo" cujo link leva, genericamente, à Central de Relatórios (ver
  [01-dashboard-bi-tv.md](01-dashboard-bi-tv.md)).
- **Origem no sistema desktop** [visto]: o ERP web é uma migração de um ERP em Delphi.
  Vários cartões dizem "estilo Delphi" (layout do sistema antigo) e um cita a tela
  antiga "Delphi FrmRelatorio". Os relatórios web leem as mesmas tabelas do desktop
  [deduzido].
- **"Comissão por metas"** (`/comissoes/metas`) é o 1.º cartão do grupo Comissões do
  hub e do menu, mas não é relatório: é um cadastro com apuração, descrito em
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md).

### 1.2 Rotas e estado

Uma primeira passagem não abriu nenhuma tela deste grupo (a criação da aba própria
falhou e a navegação foi recusada pela trava do modo automático do Claude Code, motivo
"Third-Party Attack"). As passagens seguintes abriram as telas abaixo. As recusas nunca
foram problema de login: a sessão funcionou nas outras telas.

| Rota | Nome | Estado |
|---|---|---|
| `/dashboard/modulo/relatorios` | hub Relatórios | lida |
| `/relatorios` | Central de Relatórios | lida (várias passagens; busca e categoria testadas) |
| `/relatorios?categoria=overview` | Central, categoria "Visão geral" | lida (vazia) |
| `/relatorios/processamentos` | Processamentos de relatórios | lida (página sem conteúdo) |
| `/relatorios/{slug}` | rota genérica dos 132 relatórios | formulário lido em dezenas de relatórios; resultado (`?executar=1`) nunca aberto |
| `/relatorios/produtos-vendidos` | Produtos vendidos | lida (filtros e nomes internos) |
| `/relatorios/vendas-por-vendedor-produto` | Vendas por vendedor e produto | parcial (filtros pela árvore; nomes internos não confirmados: leitura por script recusada) |
| `/relatorios/vendas-vendedor-modalidade` | Vendas por vendedor e modalidade | lida |
| `/relatorios/vendas-canceladas` | Cancelamentos de vendas | lida |
| `/relatorios/positivacao-mix-produtos` | Positivação por mix de produtos | lida (filtros, mix, lupas e script) |
| `/relatorios/vendas-recebimento-por-vendedor` | Vendas x recebimento por vendedor | lida |
| `/relatorios/clientes-sem-compra` | Clientes sem comprar | lida |
| `/relatorios/rota-visitas` | Visitas de rota (cobertura) | parcial (filtros lidos numa passagem; noutra a leitura da estrutura foi recusada) |
| `/relatorios/receber-por-cliente` | Contas a receber por cliente | recusada (abertura) |
| `/relatorios/receber-aging` | Aging contas a receber | não aberta (só cartão da Central) |
| `/relatorios/pagar-por-fornecedor` | Contas a pagar por fornecedor | não aberta (só cartão da Central) |
| `/relatorios/pagar-pagamentos-periodo` | Pagamentos efetuados (CP) | não aberta (só cartão da Central) |
| `/relatorios/pagar-aging` | Aging contas a pagar | não aberta (só cartão da Central) |
| `/relatorios/pagar-por-plano-contas` | Despesas por plano de contas | não aberta (só cartão da Central) |
| `/relatorios/previsao-financeira` | Previsão financeira (a vencer) | não aberta (só cartão da Central) |
| `/relatorios/faturamento-lotes` | Faturamento — lotes | recusada (abertura; numa passagem anterior nem foi tentada) |
| `/relatorios/faturamento-vendas` | Faturamento — vendas do lote | lida |
| `/relatorios/faturamento-por-vendedor` | Faturamento por vendedor | lida |
| `/relatorios/banco-movimentacao` | Movimentação bancária | lida |
| `/relatorios/boletos-periodo` | Boletos emitidos | lida |
| `/relatorios/pix-recebidos` | PIX recebidos | lida |
| `/relatorios/vendas-liberacoes` | Liberações de venda | lida (lupa de solicitante aberta) |
| `/relatorios/vendas-trocas` | Trocas de produto | lida |
| `/relatorios/devolucoes-venda` | Devoluções de venda | lida |
| `/relatorios/vendas-orcamentos` | Orçamentos | lida |
| `/relatorios/cliente-creditos` | Créditos de cliente | lida |

Telas operacionais que alimentam estes relatórios (só ponteiros): `/financeiro/faturamento`
e `/financeiro/liberacoes` em [02-vendas-pdv.md](02-vendas-pdv.md);
`/financeiro/banco-movimentacao` e `/financeiro/boletos` em
[11-financeiro-bancos.md](11-financeiro-bancos.md); `/consulta-cliente` em
[08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md); `/rota-visitas` em
[14-os-forca-vendas.md](14-os-forca-vendas.md); `/troca-produto` em
[02-vendas-pdv.md](02-vendas-pdv.md).

### 1.3 Como cada relatório funciona por dentro [código]

- **Uma rota genérica, um motor só.** A página de qualquer relatório se identifica como
  a rota Laravel `relatorios.show`, com o parâmetro `report` igual ao slug (ex.:
  `nfe-itens-fiscal`). No catálogo do menu, o nome interno da rota é o mesmo para todos.
  Ou seja: um catálogo de relatórios servido por um único controlador, que escolhe o
  relatório pelo slug, com uma definição por relatório [deduzido].
- **Uma fonte só para a Central e para a tela** [deduzido]: em todas as telas lidas, o
  título e a explicação são iguais aos do cartão da Central, e o número de filtros
  anunciado no cartão bate com os campos do formulário (a contagem conta as duas datas
  em separado).
- **Formulário GET para a própria rota** (`form-relatorio-filtros`), com o campo oculto
  `executar=1` e os filtros. "Gerar" recarrega a mesma URL com os filtros na query
  (ex.: `/relatorios/{slug}?executar=1&de=…&ate=…&status=…`) e o servidor desenha o
  resultado na mesma página [deduzido]. Consequências:
  - gerar é só leitura e não grava nada;
  - um relatório filtrado pode ir para os favoritos do navegador ou ser enviado por
    link.
- **Filtros:** cada campo tem o identificador `f-<nome>` no HTML e envia `<nome>`.
  Tipos: período (`de`/`ate`), lupa, lista, texto livre e número.
- **Período padrão:** do dia 1 do mês até hoje (01/10/2026 a 03/10/2026), em formato
  AAAA-MM-DD, em todas as telas onde foi possível confirmar.
- **Nenhum campo é obrigatório** (sem `required`, sem marca, sem limite de data). Nada
  impede, no navegador, uma data inicial maior que a final; a validação no servidor
  está [a verificar].
- **Quase todas as telas não têm script próprio**: são formulários desenhados pelo
  servidor. A exceção vista é a positivação (2.9), com o script do mix.
- **Exportação**: todos os cartões da Central anunciam PDF, Excel e CSV, e a Central
  promete também impressão. Hoje a exportação é gerada na hora, até um limite de linhas
  por relatório que não aparece em lugar nenhum (ver 2.3) [visto no aviso; limite
  deduzido].

### 1.4 Moldura comum das telas de relatório [visto]

1. **Cabeçalho:** título, uma linha de explicação e o botão "← Central". A explicação
   muitas vezes cita nomes de tabela ou de campo do banco.
2. **Um único cartão de filtros**, em linha, numa grade Bootstrap (`col-md-3 col-lg-2`).
   No computador os filtros ficam numa linha; no celular devem empilhar [deduzido; não
   testado].
3. **Período:** "Data inicial" (`de`) e "Data final" (`ate`), no seletor de data do
   próprio navegador.
4. **Lupas** para cadastros (cliente, vendedor, colaborador, solicitante, produto,
   fabricante, grupo, subgrupo, rota etc.), descritas em 1.5.
5. **Listas** de opções (status, modalidade, tipo, origem). O padrão muda de tela para
   tela: "Todos", "1 — Venda", "Concluída", "Autorizada" ou "Ativos" (ver 1.6).
6. **Texto livre** em alguns filtros (status de boleto, de PIX, de CT-e, de NFS-e e do
   Mercado Livre; "Nº lote"; "Placa"; "Nº OS") e **número** em outros ("Dias sem
   comprar", "Dias sem movimento").
7. **Caixa alta:** um script da moldura passa para maiúsculas o que se digita nos campos
   de texto.
8. **Um único botão, "Gerar"** (escuro, com o mesmo ícone de lupa dos campos de
   pesquisa). Antes de gerar não aparece nada abaixo do cartão: nem prévia, nem
   contagem, nem exportar, imprimir, limpar, guardar filtros ou agendar. Os botões de
   PDF, Excel, CSV e impressão devem aparecer junto do resultado [deduzido].
9. **Visual** [visto nas capturas]: os rótulos das lupas ficam desalinhados em relação
   aos das datas (cada lupa tem um rótulo interno vazio e o rótulo visível fica fora do
   componente); a dica da lupa aparece cortada ("Clique na lup…"); listas como
   "Visualização" cortam o texto em larguras médias.

### 1.5 Janela de pesquisa (lupa) e a API por trás dela

Descrição única do componente de pesquisa para todo o ERP (relatórios, cadastros,
operação); os outros documentos apontam para aqui e só guardam que tipos de lupa usam.

**O campo** [código]:

- Um bloco `erp-lookup-field` com `data-lookup-type` (tipo de cadastro) e
  `data-lookup-name` (parâmetro enviado). Script: `/js/erp-lookup.js`.
- Um campo oculto com o ID escolhido (`id_cliente`, `id_vendedor`, `id_colaborador`,
  `id_usuario`, `id_produto`, `id_fabricante`, `id_grupo`, `id_sub_grupo`, `id_rota`,
  `id_fornecedor`, `id_tecnico`…).
- Um campo visível só de leitura (`{nome}-display`), com a dica "Clique na lupa para
  pesquisar...". Clicar no texto também abre a lupa. Não se digita o nome no campo.
- O botão **Pesquisar** (lupa) e o botão **Limpar** (X), escondido até haver escolha;
  o X apaga o ID e o nome.
- **Acessibilidade:** o rótulo visível ("Cliente", "Técnico responsável"…) aponta para um
  ID que não existe (`f-id_…`); o campo de verdade tem rótulo vazio. Um leitor de tela
  anuncia só a dica.

**A janela** (`erpLookupModal`, a mesma para todos os cadastros) [visto]:

- Título "Pesquisar — {cadastro}".
- Busca "por código ou descrição", com **Buscar** ou Enter.
- Tabela de resultados, rodapé "Página X de Y (N registros)", Anterior, Próximo e
  **Fechar** (ou Esc).
- **Já abre com a primeira página carregada.** Uma leitura anterior, no filtro
  Colaborador de um relatório de comissões, achou que a janela "abria vazia" até clicar
  em "Buscar"; as leituras seguintes mostraram que ela só fica vazia quando o cadastro
  está vazio (era o caso dos colaboradores).
- **Seleção única:** um clique na linha preenche o ID e o nome, fecha a janela e mostra
  o X (testado no filtro Cliente, sem enviar nada).
- **Seleção múltipla** (só em alguns usos, como o mix da positivação): caixas de marcar,
  uma caixa para marcar a página toda, o contador "N item(ns) selecionado(s) nesta
  pesquisa" e o botão "Adicionar selecionados". Na lupa de Pessoa de um relatório
  fiscal, o botão de seleção múltipla não tinha a classe que o esconde; não ficou claro
  se aceita vários clientes [a verificar]. No modo de escolha única, a barra de seleção
  múltipla existe na janela, mas fica escondida (visto no campo "Responsável" da
  Consultoria, [17](17-consultoria-ia.md)).
- **Cadastro rápido:** quando o tipo tem essa configuração, aparece "Cadastrar novo",
  que abre o modal "Cadastro rápido", grava (POST) e já seleciona o registro criado.
  **Nunca foi clicado.** Além dos tipos da tabela abaixo, a lupa de **zona** (no
  cadastro de bairros) também tem "Cadastrar novo", e o checklist de migração cita a
  criação rápida dentro do modal para grupo, subgrupo, fabricante, cor e zona (ver
  [08](08-pessoas-empresa-acessos.md)).
- Um clique logo depois de fechar outra janela foi ignorado uma vez (provavelmente a
  anterior ainda estava fechando); no segundo clique abriu.

**A API** [código]:

| Endereço | Para quê |
|---|---|
| GET `/lookups/{tipo}/config` | título, colunas e, quando há, configuração do cadastro rápido |
| GET `/lookups/{tipo}/search?q=&page=` | pesquisa paginada; a janela chama `page=1` ao abrir |
| GET `/lookups/{tipo}/{id}` | rótulo de um valor já escolhido (ao reabrir uma URL com filtros) |
| POST `/lookups/{tipo}/quick` | cadastro rápido (não chamado) |
| `/lookup/produto/{id}` (singular) | usado só pelo script da positivação; existência a verificar |

Formato da resposta da pesquisa: `items[]`, cada um com `id`, `label` e `cells` (uma
célula por coluna), e `meta` com `current_page`, `last_page` e `total`.

**Tipos de lupa vistos nos relatórios** [código, configuração lida]:

| Tipo | Título da janela | Colunas | Cadastro rápido | Registros nesta conta |
|---|---|---|---|---|
| `pessoa` | Pessoa | Código, Nome, CPF/CNPJ | não | 1 ("CONSUMIDOR FINAL", código 1, sem documento) |
| `pessoa_colaborador` | Colaborador / Vendedor | Código, Nome, CPF/CNPJ | não | 0 |
| `usuario` | Operador | Código, Operador | não | 1 |
| `produto` | Produto | Código, Descrição, Ref. (`ref_fabrica`), UN (`unidade`) | não | 0 |
| `fabricante` | Fabricante | Código, Descrição, Status | sim: só Descrição (obrigatória, em maiúsculas); nasce com status 1; código da sequência `FABRICANTE` | 1 ("PADRAO", status mostrado como "0") |
| `produto_grupo` | Grupo de Produto | Código, Descrição | sim: só Descrição (obrigatória, em maiúsculas); nasce com status 1, **comissão 0** e **ordem 0**; sequência `PRODUTO_GRUPO` | 0 |
| `produto_sub_grupo` | Subgrupo de Produto | Código, Descrição, Status | sim: só Descrição; nasce com status 1 | 1 ("PADRAO") |
| `produto_cor` | Cor | Código, Descrição, Status | sim | 1 ("PADRAO"); usada em `produtos-cadastro` (ver 21) |
| `rota` | Rota | Código, Descrição, Região | não | 0 |

- **Cliente com lupa genérica:** nos relatórios, o filtro "Cliente" (e também
  "Fornecedor") usa `pessoa`, que lista qualquer pessoa. Nas telas operacionais (Boletos,
  Consulta Cliente) a lupa de cliente é `pessoa_cliente`. Assim, num relatório dá para
  escolher como "cliente" quem não é cliente [visto].
- **Vendedor = pessoa com papel de colaborador** (`pessoa_colaborador`); não há cadastro
  separado de vendedor. O **solicitante** de liberações é um **usuário** do sistema
  (`usuario`), não um colaborador [deduzido].
- O cadastro rápido revela que o **grupo de produto** guarda descrição, status,
  **% de comissão** e ordem de exibição, e que os códigos vêm de sequências com nome, no
  estilo dos geradores do Delphi [deduzido].
- **Usos fora dos relatórios** (tipos e detalhes nos documentos indicados): cadastros
  (zona em Bairros e outros, [08](08-pessoas-empresa-acessos.md)); produtos
  ([07](07-produtos.md)); produto no estoque ([09](09-estoque.md)); vendedor, rota,
  motorista e veículo nas vendas ([02](02-vendas-pdv.md)); cliente `pessoa_cliente` em
  Boletos e Consulta Cliente ([11](11-financeiro-bancos.md),
  [08](08-pessoas-empresa-acessos.md)); Responsável `pessoa_colaborador` na Consultoria
  ([17](17-consultoria-ia.md)).

### 1.6 Códigos internos e parâmetros que as telas revelam [visto/código]

As listas carregam o valor enviado ao servidor; esses valores mostram como o sistema
guarda os estados.

**Gerais e deste documento**

| Conceito | Parâmetro | Valores | Onde |
|---|---|---|---|
| Disparo do relatório | `executar` | `1` (oculto) | todos |
| Período | `de`, `ate` | AAAA-MM-DD; padrão do dia 1 do mês até hoje | quase todos |
| Busca e categoria da Central | `q`, `categoria` | `overview`, `movimentacoes`, `vendas`, `caixa`, `financeiro`, `estoque`, `compras`, `clientes`, `fornecedores`, `produtos`, `crm`, `fiscal`, `comissoes`, `os`, `canais`, `producao`, `auditoria` | Central |
| Status da venda | `status` | `1` Venda (padrão) · `0` Orçamento · `2` Cancelada · `todos`. O rótulo muda: "1 — Venda", "Venda", "Vendas"; "Cancelado", "Cancelada", "Canceladas" | produtos-vendidos, vendas-por-vendedor-produto, vendas-vendedor-modalidade, vendas-recebimento-por-vendedor; também nos de comissão (ver 20) |
| Modalidade da venda | `modalidade` | Todas (padrão, vazio) · `retirada` Retirada na loja · `entrega` Entrega · `loja` Loja / PDV | vendas-vendedor-modalidade |
| Visualização da positivação | `modo` | `ranking` Ranking por vendedor (padrão) · `detalhe` Detalhe por cliente | positivacao-mix-produtos |
| Mix de produtos | `id_produtos` | lista de IDs separados por vírgula (oculto) | positivacao-mix-produtos |
| Dias sem comprar | `dias_sem_compra` | inteiro, mínimo 1, padrão 15 | clientes-sem-compra |
| Financeiro processado (venda do lote) | `modo` | Todos (vazio) · `1` Sim · `0` Não | faturamento-vendas |
| Nº do lote | `id_os` (!) | texto livre | faturamento-vendas |
| Tipo de lançamento bancário | `tipo` | Todos (vazio) · `C` Crédito · `D` Débito | banco-movimentacao |
| Status do boleto | `status` | texto livre no relatório; na tela operacional é lista: `0` Remessa pendente · `1` Remessa gerada · `2` Liquidado · `3` Cancelado | boletos-periodo |
| Status do PIX | `status` | texto livre | pix-recebidos |
| Status da liberação | `status` | `todos` (padrão) · `0` Pendente · `1` Liberado · `2` Negado (iguais na fila operacional) | vendas-liberacoes |

**De outros grupos de relatórios** (detalhe nos documentos indicados)

| Conceito | Parâmetro | Valores | Onde |
|---|---|---|---|
| Status da OS | `status` | vazio = Todos · `0` Aberta · `1` Fechada · `2` Cancelada (em alguns); `4` Quitado existe na OS, mas não é oferecido | relatórios de OS (20) |
| Status do título a receber | `status` | `0` aberto · `1` pago/quitado (sem "parcial" nem "cancelado") | comissões e OS faturadas (20) |
| Origem do título / da comissão | `origem` | `venda` · `os` · `peca_os` (vazio = todas) | comissões (20) |
| Data usada para filtrar títulos | — | `movimento` (padrão) · `pagamento` · `vencimento` · `emissao` | comissões (20) |
| Tipo de item da OS | — | `peca` · `servico` | comissões de OS (20) |
| Situação financeira da OS | — | `1` com títulos a receber · `0` sem títulos | os-periodo (20) |
| Status do documento de entrada ou saída | `status` | `todos` · `0` Aberta · `1` Concluída (padrão em várias) · `2` Cancelada (nas telas de operação: Pendente, Concluído, Cancelado) | entradas e saídas (21) |
| Origem da entrada | `modo` (!) | vazio = Todas · `xml` · `manual` | entradas-itens (21) |
| Tipo de movimento do kardex | `status` (!) | `todos` · `E` Entrada · `S` Saída · `B` Balanço | movimentacoes-gerais (21) |
| Saldo | `modo` (!) | `com_saldo` (padrão) · `todos` | estoque parado e valor por grupo (21) |
| Dias sem movimento | `dias_sem_movimento` | inteiro ≥ 1; padrão 90 | estoque-sem-movimento (21) |
| Placa | `placa` | texto livre | OS (20) |
| NF-e | `status` | `100` Autorizada (padrão) · `101` Cancelada · `todos` (código de retorno da SEFAZ) | nfe-itens-fiscal (21) |
| MDF-e | `status` | `todos` · `0` Pendente · `1` Autorizado · `2` Encerrado · `3` Cancelado | mdfe-periodo (21) |
| Manifestação DF-e | `status` | vazio = Todos · `F` Pendente · `P` Ciência · `T` Finalizada | fiscal-manifestacao-nfe (21) |
| CT-e, NFS-e, pedido do Mercado Livre | `status` | texto livre, sem dica | 21 |
| Pedido de compra | `status` | `aberto` · `parcial` · `recebido` · `cancelado` (texto) | compras-pedidos (21) |

(!) O mesmo nome de parâmetro muda de sentido conforme a tela: `status` é às vezes um
estado e às vezes um tipo; `modo` é a visualização, a marca de financeiro, a origem ou o
saldo; o "Nº lote" usa `id_os`. Cada documento tem a sua convenção de estado (números,
letras, códigos da SEFAZ, texto), o que sugere tabelas herdadas de sistemas diferentes e
relatórios configurados um a um [deduzido].

### 1.7 Elementos globais da moldura do ERP, vistos nas telas de relatório

A moldura comum a todas as telas (cabeçalho, barra de ícones, menu e o catálogo
`/erp/navigation`, busca Ctrl+K, seletor de empresa, assistente e avisos por sondagem
em 7 canais) está descrita no [22](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas); a tecnologia (Laravel, Bootstrap 5.3.3,
SweetAlert2, jsDelivr, Cloudflare e Cloudflare Insights) no [18](18-parametros-plano-comissoes.md#11-o-que-estas-telas-revelam-sobre-a-arquitetura-do-sistema). Aqui fica só o
que é próprio das telas de relatório:

- **Empresa** [código]: os relatórios usam a empresa logada.
- **Catálogo do menu** [código]: a lista de relatórios do menu saiu de uma leitura
  (autorizada) do catálogo de menu que o ERP guarda na sessão do navegador —
  provavelmente o mesmo `/erp/navigation` [deduzido]. Uma segunda consulta a esse
  catálogo, à procura do manual e de telas de prêmios e comissões, foi recusada pela
  trava do modo automático.

### 1.8 Dados da conta de teste

A conta quase não tem dados [visto pelas lupas, sem texto de busca]: 0 produtos, 0
colaboradores/vendedores, 0 rotas, 0 grupos de produto, 0 vendas, 0 metas, nenhuma conta
bancária; só o cliente padrão "CONSUMIDOR FINAL" (código 1), o fabricante, o subgrupo e a
cor padrão "PADRAO" e o usuário "ADMIN". Mesmo que "Gerar" fosse permitido, os
relatórios viriam vazios.

---

## 2. Telas

### 2.1 `/dashboard/modulo/relatorios` — hub Relatórios [visto]

- Faixa escura "Relatórios" com "Voltar ao dashboard". No topo, atalhos para "Central de
  Relatórios" e "Processamentos".
- **8 grupos, 80 cartões:**

| Grupo | Cartões | Conteúdo |
|---|---|---|
| Vendas e clientes | 8 | inclui "Clientes sem comprar" e "Visitas de rota"; pela contagem, são os 8 relatórios de vendas deste documento (2.5 a 2.12) [deduzido] |
| Financeiro | 13 | receber, pagar, previsão, faturamento por lotes, banco, boletos, PIX; pela contagem, os 13 de 2.13 a 2.25 [deduzido] |
| Caixa | 5 | caixa com vendedor, conferência cega, histórico, suprimentos, sangrias (ver 03) |
| Estoque e entradas/saídas | 17 | inclui 3 relatórios de compras (ver 21) |
| Fiscal e canais | 9 | NF-e, MDF-e, CT-e, manifestação, Mercado Livre, loja virtual (ver 21) |
| Vendas extras | 12 | mistura liberações, trocas, devoluções, orçamentos e créditos de cliente (2.26 a 2.30) com NFS-e, SPED, ICMS, anúncios do ML, lista de preços e "Produtos — estoque e valores" |
| Comissões | 8 | o 1.º é "Comissão por metas" (`/comissoes/metas`, ver 18); os outros 7 em 20 |
| Ordem de Serviço | 8 | ver 20 |

- "Produtos — estoque e valores" (`produtos-cadastro`) aparece duas vezes (Estoque e
  Vendas extras). Tirando a repetição e a Comissão por metas, sobram **78 relatórios
  distintos**, os mesmos do menu lateral. A Central tem 132: **54 só se acham pela
  Central**.
- Nomes no menu que diferem do título da tela [visto]: "Cancelamentos e motivos"
  (vendas-canceladas), "Faturamento — vendas" (faturamento-vendas), "Boletos"
  (boletos-periodo), "Liberações" (vendas-liberacoes), "Devoluções" (devolucoes-venda),
  "Vendas — por colaborador" e "Vendas + peças OS" (comissões, ver 20).
- Os cartões dos hubs de módulo têm uma estrela "Adicionar aos atalhos" (favoritos do
  menu), não clicada [visto no hub Utilitários; neste hub, a confirmar].

### 2.2 `/relatorios` — Central de Relatórios [visto]

- **Subtítulo:** consultas gerenciais com os dados reais da empresa, com filtros,
  totais, PDF, Excel e impressão. Botão **Processamentos** no canto direito.
- **Barra de filtros** (formulário GET `/relatorios?q=&categoria=`):
  - **"Buscar relatório..."** (`q`): procura no nome e na descrição. Teste com
    "vendedor": 12 relatórios de quatro categorias (Vendas, Caixa, Financeiro,
    Clientes). Uma das leituras registrou que "não há busca por nome dentro da Central,
    só o Ctrl+K"; as outras três viram o campo e uma o testou, portanto ele existe.
  - **Categoria** (`categoria`): "Todas as categorias" (padrão) e 17 opções — Visão
    geral (`overview`), Movimentações, Vendas, Caixa, Financeiro, Estoque, Compras,
    Clientes, Fornecedores, Produtos, CRM, Fiscal, Comissões, Ordem de Serviço (`os`),
    Canais digitais (`canais`), Produção e Auditoria. Teste com "Comissões": só os 7 de
    comissão.
  - Botão "Filtrar".
- **"Visão geral"** existe na lista mas não tem relatório: filtrada sozinha
  (`?categoria=overview`), a tela diz que nada foi encontrado.
- **A ordem das categorias na lista é diferente da ordem na página.** Na página:
  Vendas (19), Caixa (8), Financeiro (28), Estoque (13), Compras (11), Clientes (5),
  Fornecedores (1), Produtos (5), Fiscal (17), Canais digitais (5), Produção (2), CRM
  (1), Auditoria (1), Movimentações (1), Comissões (7), Ordem de Serviço (8) =
  **132 relatórios em 16 seções**.
- **Cartões**, numa grade de 2 colunas separada por seções: nome do relatório; slug num
  selo (ex.: `vendas-analiticas`); descrição de uma linha; "N filtros · PDF · Excel ·
  CSV" (os 132 anunciam os mesmos três formatos); botão "Abrir relatório", que leva a
  `/relatorios/{slug}`.
- **Não há** favoritos, relatórios recentes, filtros guardados nem agendamento.
- **Pistas técnicas nas descrições:** "estilo Delphi", "Delphi FrmRelatorio",
  "status 0", "tipo_forma = 1", "tabela estoque, tipo E/S", "movimentações registradas
  na tabela estoque (entradas, saídas, balanço)", `valor_comissao`, `id_ordem_servico`.

#### 2.2.1 Catálogo da Central (132 relatórios)

Coluna **Menu**: "sim" quando o relatório também está no hub e no menu lateral; "só
Central" quando só se chega a ele pela Central. Coluna **Doc**: documento onde o
relatório está detalhado; "—" quando só é conhecido por este cartão (nunca aberto). As
descrições foram resumidas com palavras nossas.

**Vendas (19)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `vendas-analiticas` | 7 | uma linha por venda: totais, cliente, vendedor, pagamento e documento fiscal | só Central | — |
| `vendas-por-item` | 6 | uma linha por item vendido | só Central | — |
| `vendas-por-periodo` | 4 | faturamento e nº de vendas por dia, semana ou mês | só Central | — |
| `vendas-por-cliente` | 4 | totais por cliente | só Central | — |
| `vendas-por-vendedor` | 4 | totais por vendedor | só Central | — |
| `vendas-por-produto` | 4 | quantidade e faturamento por produto | só Central | — |
| `produtos-vendidos` | 8 | quantidade e total por produto no período (layout do sistema antigo) | sim | 19 (2.5) |
| `vendas-por-vendedor-produto` | 8 | quantidade e total por vendedor e produto (layout do sistema antigo) | sim | 19 (2.6) |
| `vendas-vendedor-modalidade` | 5 | conferência por vendedor: retirada na loja e entrega | sim | 19 (2.7) |
| `positivacao-mix-produtos` | 9 | ranking de vendedores por clientes que compraram o mix de uma ação; cada cliente conta uma vez | sim | 19 (2.9) |
| `vendas-recebimento-por-vendedor` | 4 | valor vendido e % já recebido, com subtotal por vendedor | sim | 19 (2.10) |
| `rota-visitas` | 6 | clientes da rota visitados e não visitados (app de força de vendas) | sim | 19 (2.12) |
| `vendas-por-forma-pagamento` | 4 | totais por forma de pagamento | só Central | — |
| `vendas-canceladas` | 4 | cancelamentos com motivo, usuário, vendedor, cliente, data e valores | sim | 19 (2.8) |
| `vendas-lucratividade` | 6 | lucro e margem por venda e por item, pelo custo gravado no item | só Central | — |
| `vendas-liberacoes` | 4 | pedidos de liberação (desconto ou limite): aprovado, negado ou pendente | sim | 19 (2.26) |
| `vendas-trocas` | 3 | trocas: valor devolvido, valor entregue e diferença | sim | 19 (2.27) |
| `devolucoes-venda` | 3 | entradas de devolução ligadas a vendas | sim | 19 (2.28) |
| `vendas-orcamentos` | 4 | orçamentos (status 0) com cliente, vendedor e totais | sim | 19 (2.29) |

**Caixa (8)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `caixa-movimentacao` | 5 | créditos e débitos do caixa, com forma e usuário | só Central | — |
| `caixa-vendas-por-vendedor` | 4 | vendas recebidas por colaborador: quantidade, subtotal, descontos, bruto e ticket médio | sim | 03 |
| `caixa-fechamento` | 3 | caixas fechados, com totais e operador | só Central | — |
| `caixa-sangrias` | 3 | sangrias: operador, valor, motivo e quem autorizou | sim | 03 |
| `caixa-conferencia-cega` | 4 | fechamento cego por forma de pagamento: sistema, informado e diferença | sim | 03 |
| `caixa-historico` | 4 | linha do tempo de abertura e fechamento | sim | 03 |
| `caixa-suprimentos` | 3 | suprimentos (entradas manuais no caixa) | sim | 03 |
| `caixa-cheques` | 3 | lançamentos de caixa em cheque | só Central | — |

**Financeiro (28)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `receber-titulos` | 5 | parcelas a receber, com status | só Central | — |
| `receber-vencidas` | 4 | parcelas a receber já vencidas | só Central | — |
| `receber-inadimplencia` | 2 | vencidos somados por cliente | só Central | — |
| `receber-recebimentos-periodo` | 3 | parcelas quitadas no período | só Central | — |
| `receber-por-cliente` | 5 | saldo a receber por cliente | sim | 19 (2.13) |
| `receber-aging` | 2 | pendentes por faixa de atraso: a vencer, 1–30, 31–60, 61–90 e mais de 90 dias | sim | 19 (2.14) |
| `pagar-titulos` | 5 | parcelas a pagar, com status | só Central | — |
| `pagar-vencidas` | 3 | parcelas a pagar já vencidas | só Central | — |
| `pagar-por-fornecedor` | 4 | saldo a pagar por fornecedor | sim | 19 (2.15) |
| `pagar-pagamentos-periodo` | 3 | pagamentos feitos no período, com histórico | sim | 19 (2.16) |
| `pagar-aging` | 1 | contas a pagar por faixa de atraso | sim | 19 (2.17) |
| `fluxo-caixa` | 2 | entradas e saídas realizadas, por dia | só Central | — |
| `pagar-por-plano-contas` | 4 | despesas por conta do plano de contas | sim | 19 (2.18) |
| `previsao-financeira` | 3 | receber e pagar pendentes, por vencimento | sim | 19 (2.19) |
| `faturamento-lotes` | 4 | lotes de faturamento de orçamentos (força de vendas ou ERP) | sim | 19 (2.20) |
| `faturamento-vendas` | 6 | vendas de cada lote, com marcas de baixa de estoque e de financeiro | sim | 19 (2.21) |
| `faturamento-por-vendedor` | 3 | faturamento dos lotes por vendedor | sim | 19 (2.22) |
| `banco-movimentacao` | 3 | lançamentos nas contas bancárias | sim | 19 (2.23) |
| `banco-conciliacao` | 3 | movimentos de extrato OFX e se foram casados | só Central | — |
| `boletos-periodo` | 4 | boletos com pagador, vencimento, valor e status | sim | 19 (2.24) |
| `pix-recebidos` | 3 | cobranças PIX geradas e pagas (txid, valor e status) | sim | 19 (2.25) |
| `tef-operacoes` | 3 | operações de cartão ligadas a vendas (NSU, bandeira, parcelas) | só Central | — |
| `cliente-creditos` | 3 | créditos e débitos na conta do cliente | sim | 19 (2.30) |
| `cliente-creditos-venda` | 3 | créditos de cliente usados em vendas | só Central | — |
| `pagar-quitados-periodo` | 3 | contas pagas, com juros, multa e desconto | só Central | — |
| `cobranca-execucoes` | 5 | ações da régua de cobrança: canal e status | só Central | — |
| `financeiro-remessas` | 3 | arquivos de remessa bancária gerados | só Central | — |
| `financeiro-retornos` | 3 | arquivos de retorno bancário processados | só Central | — |

**Estoque (13)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `estoque-posicao` | 5 | saldo atual por produto e grade | só Central | — |
| `estoque-abaixo-minimo` | 1 | produtos abaixo do estoque mínimo | só Central | — |
| `estoque-curva-abc` | 3 | curva ABC pelo faturamento no período | só Central | — |
| `estoque-entradas` | 5 | entradas no kardex | sim | 21 |
| `estoque-saidas` | 5 | saídas no kardex | sim | 21 |
| `estoque-sem-movimento` | 4 | produtos com saldo e sem movimento há X dias | sim | 21 |
| `estoque-valor-grupo` | 2 | saldo e valor a custo por grupo | sim | 21 |
| `estoque-balanco` | 4 | balanço: saldo anterior, contado e diferença | sim | 21 |
| `estoque-giro` | 4 | quantidade vendida comparada com o saldo | sim | 21 |
| `estoque-transferencias` | 4 | transferências entre filiais | sim | 21 |
| `estoque-romaneio` | 4 | romaneios de carga: motorista, rota, valor e status | sim | 21 |
| `saidas-periodo` | 4 | saídas manuais ou fiscais no período | sim | 21 |
| `saidas-itens` | 5 | itens das saídas manuais ou fiscais | sim | 21 |

**Compras (11)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `compras-periodo` | 4 | entradas de mercadoria no período | só Central | 21 |
| `compras-por-fornecedor` | 4 | compras por fornecedor | sim | 21 |
| `compras-por-produto` | 5 | compras por produto (quantidade e custo) | sim | 21 |
| `compras-pedidos` | 4 | pedidos de compra: status, previsão e valor | sim | 21 |
| `compras-evolucao-custos` | 5 | histórico do preço de compra por produto | sim | 21 |
| `compras-cotacoes` | 4 | cotações por fornecedor: valor, prazo e status | só Central | — |
| `compras-solicitacoes` | 4 | solicitações de compra | só Central | — |
| `entradas-vs-pagar` | 4 | entradas comparadas com as contas a pagar ligadas a elas | só Central | 21 |
| `entradas-itens` | 6 | itens das entradas | sim | 21 |
| `entradas-xml` | 4 | entradas importadas por XML de NF-e | sim | 21 |
| `entradas-manual` | 4 | entradas digitadas à mão | sim | 21 |

**Clientes (5), Fornecedores (1) e Produtos (5)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `clientes-cadastrados` | 3 | lista de clientes | só Central | — |
| `clientes-sem-compra` | 3 | clientes sem comprar há X dias, por vendedor e rota | sim | 19 (2.11) |
| `colaboradores-cadastrados` | 2 | lista de colaboradores | só Central | — |
| `compras-colaboradores` | 5 | compras de convênio dos funcionários e se já foram baixadas | só Central | — |
| `convenio-colaboradores-geral` | 4 | convênio somado por colaborador | só Central | — |
| `fornecedores-cadastrados` | 3 | lista de fornecedores | só Central | — |
| `produtos-mais-vendidos` | 4 | ranking por quantidade ou faturamento | só Central | — |
| `produtos-lista-precos` | 4 | preços de compra e venda, margem e saldo | sim | 21 |
| `produtos-cadastro` | 7 | preços e valor do estoque a custo e a venda (layout do sistema antigo) | sim | 21 |
| `servicos-cadastrados` | 2 | serviços com valor e % de comissão | só Central | — |
| `produtos-composicao` | 1 | composição (ficha técnica) dos produtos compostos | só Central | — |

**Fiscal (17)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `nfce-emitidas` | 4 | NFC-e emitidas, ligadas à venda | só Central | — |
| `nfe-emitidas` | 4 | NF-e (modelo 55) emitidas | só Central | — |
| `fiscal-cancelados` | 3 | NFC-e e NF-e canceladas na SEFAZ | só Central | — |
| `nfe-rejeitadas` | 3 | NF-e rejeitadas, denegadas ou pendentes | sim | 21 |
| `nfe-tributos` | 3 | totais de ICMS, PIS, COFINS, IPI e ST | sim | 21 |
| `nfe-por-cfop` | 3 | NF-e autorizadas por CFOP | sim | 21 |
| `nfe-itens-fiscal` | 4 | itens com CFOP, CST/CSOSN, NCM e tributos | sim | 21 |
| `mdfe-periodo` | 3 | MDF-e emitidos | sim | 21 |
| `cte-periodo` | 3 | CT-e emitidos | sim | 21 |
| `fiscal-manifestacao-nfe` | 3 | manifestação do destinatário (ciência, confirmação, desconhecimento) | sim | 21 |
| `nfce-tributos` | 3 | totais de tributos das NFC-e | só Central | — |
| `nfce-itens-fiscal` | 4 | itens de NFC-e com CFOP, CST/CSOSN e NCM | só Central | — |
| `nfse-emitidas` | 4 | NFS-e emitidas | sim | 21 |
| `sped-resumo-periodo` | 2 | resumo por CFOP (base do SPED) | sim | 21 |
| `icms-mensal` | 2 | créditos e débitos de ICMS do mês | sim | 21 |
| `produtos-tributacao-nfe` | 3 | tributação dos produtos na NF-e (inclui IBS e CBS) | só Central | — |
| `produtos-tributacao-nfce` | 3 | tributação dos produtos na NFC-e (inclui IBS e CBS) | só Central | — |

**Canais digitais (5), Produção (2), CRM (1), Auditoria (1) e Movimentações (1)**

| Slug | Filtros | O que mostra | Menu | Doc |
|---|---|---|---|---|
| `ml-pedidos` | 3 | pedidos do Mercado Livre: status, comprador e NF automática | sim | 21 |
| `ml-anuncios` | 2 | anúncios do ML ligados a produtos e status de sincronização | sim | 21 |
| `loja-pedidos` | 3 | pedidos da loja virtual: frete, cupom e status | sim | 21 |
| `cardapio-pedidos` | 4 | pedidos do cardápio digital (mesa ou delivery) | só Central | — |
| `delivery-pedidos` | 4 | pedidos de delivery: origem, frete e status | só Central | — |
| `producao-ordens` | 4 | ordens de produção | só Central | — |
| `producao-insumos` | 3 | insumos previstos e consumidos | só Central | — |
| `crm-meta-markup` | 1 | metas de markup por grupo de produto | só Central | — |
| `auditoria-alteracoes` | 4 | o log de alterações em forma de relatório (a tela do log está em 18) | só Central | — |
| `movimentacoes-gerais` | 4 | todas as movimentações de estoque (tabela `estoque`: entradas, saídas, balanço) | só Central | 21 |

**Comissões (7) e Ordem de Serviço (8)** — todos estão no menu e detalhados em
[20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md) (entre parênteses, o nº de
filtros):

- Comissões: `comissoes-venda-analitico` (6), `comissoes-venda-colaborador` (4),
  `comissoes-os-analitico` (7), `comissoes-os-colaborador` (5), `comissoes-servicos` (7),
  `comissoes-vendas-pecas-os` (5), `comissoes-por-recebimento` (7).
- OS: `os-periodo` (7), `os-por-status` (4), `os-por-tecnico` (4), `os-por-cliente` (4),
  `os-servicos-executados` (7), `os-pecas-utilizadas` (7), `os-abertas` (5),
  `os-faturadas` (6).

#### 2.2.2 Relevantes para comércio de alimentação e só achados pela Central

Vendas por período, por forma de pagamento, por produto e analíticas; lucratividade por
item; curva ABC; estoque abaixo do mínimo; fluxo de caixa; fechamento de caixa; pedidos
do cardápio digital e do delivery; ficha técnica (composição).

### 2.3 `/relatorios/processamentos` — Processamentos de relatórios [visto]

- Título "Processamentos de relatórios". Apresenta-se como o lugar dos relatórios
  assíncronos e do histórico de exportações, e está marcada como **"em evolução"**.
- Só tem um aviso: a fila para relatórios muito grandes **ainda vai ser ligada**; hoje
  as exportações saem na hora, até o limite de volume de cada relatório.
- Só o link "Voltar à Central". Sem lista, histórico, filtros nem botões.
- [deduzido] Hoje não existe fila nem histórico de exportações; cada relatório tem um
  teto de linhas para exportar que não aparece na tela. Acima dele, não há saída.

### 2.4 `/relatorios/{slug}` — rota genérica e o resultado de um relatório [código; resultado não visto]

- Uma só rota (`relatorios.show`, parâmetro `report`) serve os 132 relatórios; a tela de
  filtros segue a moldura de 1.4 e as lupas de 1.5.
- O resultado é a mesma URL com `executar=1` e os filtros
  (`/relatorios/{slug}?executar=1&de=…&ate=…&…`). **Nunca foi aberto.** Pela Central e
  pelo subtítulo, deve mostrar uma tabela com totais e os botões PDF, Excel, CSV e
  impressão [deduzido].
- Não se sabe: colunas, agrupamentos, ordenação, paginação, o limite de linhas, a
  aparência do PDF/Excel/CSV e se há permissão por relatório (tudo foi visto como
  ADMIN).

### 2.5 `/relatorios/produtos-vendidos` — Produtos vendidos [visto]

- **Central:** Vendas, 8 filtros, PDF · Excel · CSV; layout do sistema antigo ("estilo
  Delphi"). No menu: grupo Vendas e clientes.
- **Objetivo:** produtos vendidos no período, com quantidade e total.

| Filtro | Nome interno | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial | `de` | data | 01/10/2026 |
| Data final | `ate` | data | 03/10/2026 |
| Cliente | `id_cliente` | lupa `pessoa` | vazio |
| Vendedor | `id_vendedor` | lupa `pessoa_colaborador` | vazio |
| Produto | `id_produto` | lupa `produto` | vazio |
| Fabricante | `id_fabricante` | lupa `fabricante` | vazio |
| Grupo | `id_grupo` | lupa `produto_grupo` | vazio |
| Status | `status` | lista | **1 — Venda** (padrão), 0 — Orçamento, 2 — Cancelado, Todos (`todos`) |

- **Ação:** Gerar (não clicado).
- **Resultado esperado** [deduzido da descrição]: uma linha por produto, com quantidade
  e total do período.

### 2.6 `/relatorios/vendas-por-vendedor-produto` — Vendas por vendedor e produto [visto em parte]

- **Central:** Vendas, 8 filtros; layout do sistema antigo. Menu: Vendas e clientes.
- **Objetivo:** quantidade e total vendidos, agrupados por vendedor e, dentro de cada
  vendedor, por produto.
- **Filtros** [visto na árvore de acessibilidade]: os mesmos 8 de 2.5 — Data inicial,
  Data final, Cliente, Vendedor, Produto, Fabricante, Grupo e Status, com as mesmas
  opções e o padrão "1 — Venda". Os nomes internos não foram confirmados (a leitura por
  script foi recusada); devem seguir o padrão de 2.5 [deduzido].
- **Ação:** Gerar (não clicado).
- **Resultado esperado** [deduzido]: um grupo por vendedor, com os seus produtos e o
  subtotal de cada vendedor.

### 2.7 `/relatorios/vendas-vendedor-modalidade` — Vendas por vendedor e modalidade [visto]

- **Central:** Vendas, 5 filtros. Menu: Vendas e clientes.
- **Objetivo:** conferir vendas, quantidades e valores por vendedor e pela forma de
  entrega ao cliente (retirada na loja ou entrega).

| Filtro | Nome interno | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial | `de` | data | 1.º dia do mês |
| Data final | `ate` | data | hoje |
| Vendedor | `id_vendedor` | lupa | vazio |
| Status | `status` | lista | **Vendas** (`1`, padrão), Orçamentos (`0`), Canceladas (`2`), Todos |
| Modalidade | `modalidade` | lista | **Todas** (padrão), Retirada na loja (`retirada`), Entrega (`entrega`), Loja / PDV (`loja`) |

- **Ação:** Gerar (não clicado).
- **Regra de negócio** [deduzido]: cada venda guarda uma "modalidade" de atendimento —
  retirada na loja, entrega ou balcão/PDV. É o mesmo conceito de "canal de atendimento"
  que usamos para comércio de alimentação.

### 2.8 `/relatorios/vendas-canceladas` — Cancelamentos de vendas [visto]

- **Central:** Vendas, 4 filtros. No menu o nome é **"Cancelamentos e motivos"**; na
  página, "Cancelamentos de vendas".
- **Objetivo:** listar os cancelamentos de vendas com motivo, usuário, vendedor,
  cliente, data e valores.

| Filtro | Nome interno | Tipo | Padrão |
|---|---|---|---|
| Data inicial | `de` | data | 1.º dia do mês |
| Data final | `ate` | data | hoje |
| Cliente | `id_cliente` | lupa | vazio |
| Vendedor | `id_vendedor` | lupa | vazio |

- **Ação:** Gerar (não clicado).
- **Regra de negócio** [deduzido]: cancelar uma venda exige um motivo e registra o
  usuário que cancelou e a data. O cancelamento é um evento auditável, separado do
  vendedor da venda.

### 2.9 `/relatorios/positivacao-mix-produtos` — Positivação por mix de produtos [visto]

- **Central:** Vendas, 9 filtros. Menu: Vendas e clientes.
- **Para que serve:** medir uma **ação comercial** sobre um conjunto de produtos, o
  "mix". Conta quantos **clientes diferentes** cada vendedor fez comprar pelo menos um
  produto do mix no período. A tela avisa que cada cliente conta uma vez só, mesmo que
  tenha comprado vários sabores ou embalagens. No jargão de distribuição, "positivar" um
  cliente é vender para ele no período.

**Filtros (cartão de cima)**

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial | `de` | data | dia 1 do mês |
| Data final | `ate` | data | hoje |
| Fabricante | `id_fabricante` | lupa `fabricante` | — |
| Grupo | `id_grupo` | lupa `produto_grupo` | — |
| Subgrupo | `id_sub_grupo` | lupa `produto_sub_grupo` | — |
| Visualização | `modo` | lista | **Ranking por vendedor** (`ranking`, padrão) · Detalhe por cliente (`detalhe`) |
| Vendedor | `id_vendedor` | lupa `pessoa_colaborador` | — |
| Rota | `id_rota` | lupa `rota` | — |
| (mix) | `id_produtos` | oculto | IDs separados por vírgula |
| — | `executar` | oculto | sempre `1` |

Ações: **Gerar** (não clicado) e o link "Central".

**Painel "Produtos da ação (opcional)"** (dentro do mesmo formulário):

- **Aviso da tela:** todos os filtros são opcionais; dá para usar só o período, só o
  fabricante, só o mix ou combinações.
- **Adicionar produtos:** lupa de Produto **com seleção múltipla**; marcam-se vários e
  "Adicionar selecionados" os põe no mix. O teste foi só até abrir a janela e buscar (a
  conta não tem produtos, "0 registros").
- **Incluir do fabricante/grupo:** deveria trazer para o mix todos os produtos do
  fabricante, do grupo ou do subgrupo escolhidos acima. Pede a lista a
  `/relatorios/positivacao-mix/produtos?id_fabricante=&id_grupo=&id_sub_grupo=`, que
  responde em JSON com código e descrição de cada produto (chamado uma vez com o
  fabricante "PADRAO": lista vazia). Sem nenhum dos três campos, mostra um aviso para
  preencher fabricante, grupo ou subgrupo.
- **Limpar mix:** esvazia a lista na hora, sem confirmação.
- **Mix:** cada produto vira uma etiqueta "#código descrição", com um × para tirar. Com o
  mix vazio, a tela explica as duas formas de montá-lo.

**Regras e comportamento**

- O indicador é o número de **clientes distintos** que compraram algo do mix, não a
  quantidade de itens [visto no texto].
- **Duas visões:** ranking de vendedores ou detalhe por cliente [visto].
- Fabricante, grupo e subgrupo servem como filtro direto ou para encher o mix
  [deduzido].
- **O mix não é gravado** [deduzido]: a ação não tem nome; não há botão para guardar
  nem para reabrir um mix; o mix só existe na URL do relatório gerado. Ao reabrir essa
  URL, o script remonta as etiquetas e pede o nome de cada produto, um por um.
- **Defeito provável no "Incluir do fabricante/grupo"** [código; não testado com
  clique]: o script procura os campos pelos IDs `f-id_fabricante`, `f-id_grupo` e
  `f-id_sub_grupo`, mas na página eles se chamam `id_fabricante`, `id_grupo` e
  `id_sub_grupo`. O botão deve achar os três vazios e mostrar sempre o aviso, mesmo com o
  fabricante escolhido. Os rótulos "Fabricante", "Grupo" e "Subgrupo" apontam para os
  mesmos IDs inexistentes (atrapalha leitores de tela).
- **Possível segundo defeito** [a verificar]: para remontar os nomes do mix, o script
  usa `/lookup/produto/{id}` (singular); o resto do sistema usa `/lookups/…`.
- Esta é a única tela de relatório vista com script próprio.

**O que o resultado deve mostrar** [deduzido; não visto]

- **Ranking:** cada vendedor, com o nº de clientes positivados no mix, em ordem
  decrescente; talvez também valor e quantidade vendidos do mix.
- **Detalhe:** cliente, vendedor, rota e o que o cliente comprou do mix.
- **Em aberto:** se mostra a % de positivação sobre a carteira (clientes da rota ou do
  vendedor) e se há meta por vendedor. A tela não tem campo de meta.

**Visual** [visto na captura]: rótulos das lupas desalinhados (cada lupa tem um rótulo
vazio por dentro), dicas cortadas ("Clique na lup") e a lista "Visualização" corta o
texto.

### 2.10 `/relatorios/vendas-recebimento-por-vendedor` — Vendas x recebimento por vendedor [visto]

- **Central:** Vendas, 4 filtros. Menu: Vendas e clientes.
- **Para que serve:** ver, venda a venda, quanto já foi recebido, em valor e em %,
  agrupado por vendedor, com subtotal por vendedor e total geral. Serve para cobrar da
  equipe a qualidade da venda (vender e receber) e para conferir a comissão paga só sobre
  o que entrou.

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | do dia 1 do mês até hoje |
| Vendedor | `id_vendedor` | lupa `pessoa_colaborador` | — |
| Status da venda | `status` | lista | **Venda** (`1`, padrão) · Orçamento (`0`) · Cancelado (`2`) · Todos |

Ações: Pesquisar e Limpar (da lupa), **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- Orçamento, venda e venda cancelada são **o mesmo documento** em estados diferentes (o
  mesmo se vê nos relatórios de comissão, ver 20).
- O "% recebido" deve ser a soma das parcelas a receber já pagas dividida pelo valor da
  venda [deduzido]. Não se sabe se conta pagamento parcial de uma parcela nem se entra o
  que foi pago na hora, no caixa [a verificar].
- O filtro deixa escolher "Orçamento", que nunca tem recebimento; a opção parece vir de
  um componente comum.
- O período deve ser o da data da venda, não o do recebimento [a verificar].

**Resultado esperado** [Central + deduzido]: por venda — número, data, cliente, valor,
valor recebido e % recebido; subtotal por vendedor e total geral.

### 2.11 `/relatorios/clientes-sem-compra` — Clientes sem comprar [visto]

- **Central:** categoria **Clientes**, 3 filtros; descrito como "estilo Delphi" (versão
  web de um relatório do sistema antigo). No hub e no menu fica em Vendas e clientes.
- **Para que serve:** listar os clientes que não compram há mais de X dias, por
  vendedor e por rota, para tentar reativá-los.

| Campo | Nome enviado | Tipo | Opções / padrão |
|---|---|---|---|
| Vendedor | `id_vendedor` | lupa `pessoa_colaborador` | — |
| Rota | `id_rota` | lupa `rota` | — |
| Dias sem comprar | `dias_sem_compra` | número | padrão **15**, mínimo 1 |

Ações: Pesquisar e Limpar (das lupas), **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **Não tem período.** O sistema deve medir a distância entre hoje e a última compra e
  comparar com X [deduzido].
- **A mesma pergunta aparece em três lugares:** este relatório, o filtro "Sem comprar
  (dias)" do painel `/rota-visitas` (ver 14) e o do relatório de visitas (2.12).
- **Em aberto** [a verificar]: se entram clientes que nunca compraram; se o "vendedor" é
  o do cadastro do cliente ou o da última venda; se clientes inativos ficam de fora; se
  orçamentos e vendas canceladas contam como compra.

**Resultado esperado** [deduzido das colunas do painel `/rota-visitas`]: código,
cliente, telefone, bairro, rota, vendedor, data da última compra e dias sem compra.

### 2.12 `/relatorios/rota-visitas` — Visitas de rota (cobertura) [visto em parte]

- **Central:** Vendas, 6 filtros. Mostra os clientes da rota visitados e não visitados
  no período, com dados do app de força de vendas. Menu: Vendas e clientes.
- **Filtros** [visto numa passagem anterior, junto com o painel de visitas]:
  - Data inicial e Data final;
  - Vendedor e Rota (lupas);
  - Situação: Todos, Somente visitados, Somente não visitados;
  - Sem comprar (dias).

  São 6, o mesmo número da Central. Botão "Gerar" (não clicado) e link "Central".
- Numa segunda passagem a página abriu, mas a leitura da estrutura foi recusada pela
  trava do modo automático; os nomes internos dos filtros não foram confirmados.
- **Ligação:** é o relatório do painel `/rota-visitas` (ver
  [14-os-forca-vendas.md](14-os-forca-vendas.md)), que tem os indicadores clientes na
  rota, visitados, não visitados e % de cobertura, um mapa da rota e um botão
  "Relatório" que leva a esta tela. O painel abre com o período "hoje"; o relatório, com o
  mês.
- **Resultado esperado** [deduzido das colunas do painel]: código, cliente, telefone,
  bairro, rota, vendedor, situação, última compra, dias sem compra, data e hora da
  visita, observação.

### 2.13 `/relatorios/receber-por-cliente` — Contas a receber por cliente [Central; abertura recusada]

- **Central:** Financeiro, 5 filtros, PDF · Excel · CSV: saldo dos títulos a receber
  agrupado por cliente, com o valor pendente e os totais. Menu: Financeiro.
- A abertura foi recusada pela trava do modo automático.
- **Filtros prováveis** [a verificar]: período (vencimento ou emissão), cliente, origem
  (venda ou OS) e status. Nos relatórios de comissão (ver 20) o título a receber tem
  origem (venda ou OS) e só dois estados (aberto ou pago).
- **O que olhar:** se o saldo inclui juros e multa; se separa o vencido do que vai
  vencer; se dá para abrir os títulos de um cliente a partir do relatório.

### 2.14 `/relatorios/receber-aging` — Aging contas a receber [Central; não aberta]

- **Central:** Financeiro, 2 filtros: títulos pendentes por faixa de atraso — **a
  vencer, 1–30, 31–60, 61–90 e mais de 90 dias**. Menu: Financeiro.
- **Filtros prováveis** [a verificar]: data-base do cálculo e cliente.
- **Vizinhos com perguntas parecidas** (só Central): "Receber vencidas"
  (`receber-vencidas`, títulos pendentes já vencidos) e "Inadimplência por cliente"
  (`receber-inadimplencia`, vencidos e pendentes somados por cliente). O BI tem um
  gráfico "receber em aberto por faixa de atraso" (ver 01).

### 2.15 `/relatorios/pagar-por-fornecedor` — Contas a pagar por fornecedor [Central; não aberta]

- **Central:** Financeiro, 4 filtros: saldo dos títulos a pagar agrupado por
  fornecedor. Menu: Financeiro.
- **Filtros prováveis** [a verificar]: período, fornecedor e status.

### 2.16 `/relatorios/pagar-pagamentos-periodo` — Pagamentos efetuados (CP) [Central; não aberta]

- **Central:** Financeiro, 3 filtros: títulos a pagar quitados no período, com
  fornecedor, valores e histórico. Menu: Financeiro.
- **Filtros prováveis** [a verificar]: período e fornecedor.
- **Quase igual a outro relatório**, "Contas pagas no período"
  (`pagar-quitados-periodo`, só Central, 3 filtros: títulos quitados com valores, juros,
  multa e desconto). São dois relatórios para a mesma pergunta.

### 2.17 `/relatorios/pagar-aging` — Aging contas a pagar [Central; não aberta]

- **Central:** Financeiro, **1 só filtro** (provavelmente a data-base [a verificar]):
  títulos a pagar pendentes por faixa de atraso. Menu: Financeiro.
- As faixas devem ser as mesmas do aging a receber [deduzido].

### 2.18 `/relatorios/pagar-por-plano-contas` — Despesas por plano de contas [Central; não aberta]

- **Central:** Financeiro, 4 filtros: títulos a pagar agrupados ou listados por conta
  do plano de contas. Menu: Financeiro.
- **Contexto** (cadastro do plano de contas, ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)): o plano é uma árvore só
  de nomes; o código tem blocos de 3 dígitos por nível (ex.: `001.002.`); não existe o
  tipo receita ou despesa. O relatório deve agrupar pelo código da árvore [deduzido].
  Falta ver se soma os níveis de cima (subtotais por grupo).
- **Filtros prováveis** [a verificar]: período, conta do plano, status e o modo
  "agrupado" ou "listado".

### 2.19 `/relatorios/previsao-financeira` — Previsão financeira (a vencer) [Central; não aberta]

- **Central:** Financeiro, 3 filtros: títulos a receber e a pagar ainda pendentes, pela
  data de vencimento no período — uma previsão de caixa. Menu: Financeiro.
- **Filtros prováveis** [a verificar]: período e tipo (receber, pagar ou os dois).
- **O que olhar:** se parte do saldo atual dos bancos e do caixa; se mostra o saldo
  acumulado dia a dia; se inclui títulos vencidos e não pagos.
- **Vizinhos:** "Fluxo de caixa" (`fluxo-caixa`, só Central) mostra o realizado (o que
  foi recebido e pago em cada dia). O BI tem "fluxo de caixa previsto das próximas 8
  semanas" e o ponto de atenção "saldo previsto (receber − pagar)" (ver 01).

### 2.20 `/relatorios/faturamento-lotes` — Faturamento — lotes [Central; abertura recusada]

- **Central:** Financeiro, 4 filtros: lotes de faturamento de **orçamentos**, vindos da
  força de vendas ou do próprio ERP, com quantidade e valor. Menu: Financeiro.
- Numa passagem não foi tentada; noutra, a abertura foi recusada pela trava do modo
  automático e a exploração parou ali.
- **O que a Central e a tela de origem revelam do processo** [deduzido]:
  1. O vendedor faz **orçamentos** (venda com status 0), no app ou no ERP.
  2. Um operador junta vários orçamentos num **lote** e fatura o lote de uma vez, na tela
     `/financeiro/faturamento` ("Faturamento de Vendas", no menu Estoque › Expedição &
     Vendas, apesar da URL; ver [02-vendas-pdv.md](02-vendas-pdv.md)). Essa tela tem um
     quadro "Histórico de faturamentos" com as colunas Lote, Data e hora, Usuário,
     Vendas, Total, Status e Ações [visto lá] — provavelmente a base deste relatório.
  3. Cada venda do lote recebe marcas de estoque e de financeiro (2.21).
  4. Há também o resumo por vendedor (2.22).
- **O que olhar:** os estados do lote; se o lote emite NF-e; se pode ser estornado (a
  tela de origem tem "Desfazer faturamento", ver 02); se há ligação com o romaneio de
  carga (rota e motorista).

### 2.21 `/relatorios/faturamento-vendas` — Faturamento — vendas do lote [visto]

- **Central:** Financeiro, 6 filtros. No menu: "Faturamento — vendas" (Financeiro).
- **Objetivo:** listar as vendas que entraram em lotes de faturamento, com cliente,
  vendedor e as marcas de "estoque processado" e "financeiro processado" de cada venda.

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Cliente | `id_cliente` | lupa `pessoa` | — |
| Vendedor | `id_vendedor` | lupa `pessoa_colaborador` | — |
| Nº lote | **`id_os`** | texto | — |
| Financeiro processado | `modo` | lista | Todos (padrão) · Sim (`1`) · Não (`0`) |

- **Ação:** Gerar (não clicado). Lupas de Cliente e Vendedor abertas e fechadas com Esc.
- **Resultado esperado** [deduzido]: uma linha por venda do lote — nº do lote, venda,
  data, cliente, vendedor, total e as duas marcas.
- **Regras:**
  - [visto] "Nº lote" usa o nome interno `id_os`, o mesmo do "Nº OS" dos relatórios de
    OS: a tela parece copiada de um modelo de OS.
  - [deduzido] As marcas existem porque cada venda gerada pelo lote movimenta o estoque
    e cria as parcelas a receber. Se uma etapa falha ou fica para depois, a marca fica
    "Não". Filtrar "Financeiro processado = Não" serve para achar vendas do lote sem
    parcelas.
  - [deduzido] Combina com o aviso de "Desfazer faturamento" na tela de origem (ver 02):
    parcelas e estoque "ainda não movimentados" são estornados.

### 2.22 `/relatorios/faturamento-por-vendedor` — Faturamento por vendedor [visto]

- **Central:** Financeiro, 3 filtros. Menu: Financeiro.
- **Objetivo:** resumo do faturamento feito em lotes, agrupado por vendedor no período.
- **Filtros:** Data inicial e Data final (mês corrente) e Vendedor (lupa
  `pessoa_colaborador`).
- **Ação:** Gerar (não clicado).
- **Resultado esperado** [deduzido]: quantidade de vendas e total faturado por vendedor.
  A tela `/financeiro/faturamento` (ver 02) tem o quadro "Resumo de faturamento no
  período" com Qtde, Vendedor e Total [visto lá]; o relatório deve ser a versão
  exportável desse quadro.
- **Regra** [deduzido]: só conta o que passou pelo faturamento em lote. Vendas feitas
  direto no balcão ou no PDV ficam de fora; para elas há "Vendas por vendedor"
  (`vendas-por-vendedor`, só Central).

### 2.23 `/relatorios/banco-movimentacao` — Movimentação bancária [visto]

- **Central:** Financeiro, 3 filtros. Menu: Financeiro.
- **Objetivo:** lançamentos nas contas bancárias no período (créditos e débitos).

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Tipo | `tipo` | lista | Todos (padrão) · Crédito (`C`) · Débito (`D`) |

- **Ação:** Gerar (não clicado).
- **Falta:** filtro de **conta bancária** e de **tipo de documento**, que a tela
  operacional `/financeiro/banco-movimentacao` tem (ver 11). Sem eles não se tira o
  extrato de uma conta só.
- **Resultado esperado** [deduzido]: data, conta, tipo C/D, descrição, valor e saldo,
  como a lista da tela operacional (que tem ID, Data, Conta, Tipo, Descrição, Valor,
  Saldo ant., Saldo e Caixa).
- **Regra** [deduzido]: a tela operacional grava o valor com sinal (positivo = entrada,
  negativo = saída); o relatório traduz o sinal em C/D.

### 2.24 `/relatorios/boletos-periodo` — Boletos emitidos [visto]

- **Central:** Financeiro, 4 filtros. No menu: "Boletos" (Financeiro).
- **Objetivo:** boletos bancários do período com pagador, vencimento, valor e status.

| Campo | Nome interno | Tipo | Observação |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente; se é emissão ou vencimento [a verificar] |
| Cliente | `id_cliente` | lupa `pessoa` | — |
| Status (texto) | `status` | **texto livre** | sem lista de opções |

- **Ação:** Gerar (não clicado).
- **Resultado esperado** [deduzido]: pagador, vencimento, valor e status; talvez nosso
  número e cedente, que a lista operacional mostra.
- **Regras:**
  - [visto] Na tela operacional `/financeiro/boletos` (ver 11) o status é uma lista com
    códigos (`0` Remessa pendente, `1` Remessa gerada, `2` Liquidado, `3` Cancelado). No
    relatório é texto livre: o usuário tem de adivinhar o que escrever ("LIQUIDADO"?
    "2"?). Se a busca é exata ou parcial [a verificar].
  - [visto] O texto digitado vira maiúsculas.

### 2.25 `/relatorios/pix-recebidos` — PIX recebidos [visto]

- **Central:** Financeiro, 3 filtros. Menu: Financeiro.
- **Objetivo:** cobranças PIX **geradas ou pagas** no período, com txid, valor e status.
- **Filtros:** Data inicial e Data final (mês corrente) e Status (`status`, **texto
  livre**).
- **Ação:** Gerar (não clicado).
- **Regras:**
  - [visto] O título fala em "recebidos", mas a frase inclui cobranças só geradas. Sem
    filtrar o status, o relatório mistura PIX pago com PIX pendente ou expirado
    [deduzido].
  - [visto] Não há filtro de cliente nem de origem (PDV, link de pagamento, boleto
    híbrido).
  - [deduzido] O txid indica PIX dinâmico (cobrança com QR gerado por um provedor), não
    chave estática. O provedor não aparece nesta tela; os gateways de cobrança vistos no
    ERP são Asaas, Efí e Mercado Pago (ver
    [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md)).

### 2.26 `/relatorios/vendas-liberacoes` — Liberações de venda [visto]

- **Central:** Vendas, 4 filtros (pedidos de liberação de desconto ou limite: aprovado,
  negado ou pendente). No menu: "Liberações" (Vendas extras).
- **Objetivo:** pedidos de liberação feitos por operadores, com status.

| Campo | Nome interno | Tipo | Opções / padrão |
|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | mês corrente |
| Status | `status` | lista | Todos (padrão) · Pendente (`0`) · Liberado (`1`) · Negado (`2`) |
| Solicitante | `id_usuario` | lupa `usuario` ("Pesquisar — Operador": Código, Operador; 1 registro) | — |

- **Ação:** Gerar (não clicado). A lupa de Solicitante foi aberta e fechada com Esc.
- **Resultado esperado** [deduzido]: as colunas da fila operacional
  `/financeiro/liberacoes` (ver 02) — Nº, Data/Hora, Solicitante, Código, Contexto da
  solicitação, Tela, Status, Gestor.
- **Regras** [deduzido]:
  - O solicitante é um **usuário do sistema** (operador), não um colaborador.
  - O gestor que aprova fica gravado, mas o relatório não filtra por gestor [visto: não
    há esse filtro].
  - A Central fala em "desconto/limite"; a fila operacional fala em "estoque, preço,
    limite e trocas". Os tipos são mais do que o relatório diz.
  - A fila operacional filtra por filial (`filiais[]`) e abre nos últimos 7 dias; o
    relatório não tem filial e abre no mês.

### 2.27 `/relatorios/vendas-trocas` — Trocas de produto [visto]

- **Central:** Vendas, 3 filtros. Menu: "Trocas de produto" (Vendas extras).
- **Objetivo:** trocas de produto com o valor devolvido, o valor entregue e a diferença.
- **Filtros:** Data inicial e Data final (mês corrente) e Cliente (lupa `pessoa`).
- **Ação:** Gerar (não clicado).
- **Fonte:** a tela `/troca-produto` (ver 02): cliente obrigatório; uma grade de
  produtos devolvidos (entram no estoque) e outra de entregues (saem); a diferença vira
  crédito no caixa ou título a receber.
- **Resultado esperado** [deduzido]: data, cliente, total devolvido, total entregue e
  diferença (positiva ou negativa).
- **Falta** [visto]: filtro de produto, de usuário e de "tipo de acerto" (crédito ou
  título).

### 2.28 `/relatorios/devolucoes-venda` — Devoluções de venda [visto]

- **Central:** Vendas, 3 filtros (entradas de devolução ligadas a vendas). No menu:
  "Devoluções" (Vendas extras).
- **Filtros:** Data inicial e Data final (mês corrente) e Cliente (lupa `pessoa`).
- **Ação:** Gerar (não clicado).
- **Fonte** [deduzido]: a Entrada manual (`/entradas-manual`, ver
  [09-estoque.md](09-estoque.md)). Nela, a finalidade "3 Devolução" troca sozinha a
  operação para "12 DEVOLUÇÃO DE VENDA", e o campo "Nº venda (devolução)" importa os
  itens da venda de origem.
- **Resultado esperado** [deduzido]: entrada, data, cliente, venda de origem, itens ou
  total e status da entrada.
- **Diferença para Trocas** [deduzido]: a troca devolve e entrega no mesmo ato; a
  devolução só devolve, por uma entrada de estoque. O ERP guarda as duas em tabelas
  diferentes, por isso há dois relatórios.

### 2.29 `/relatorios/vendas-orcamentos` — Orçamentos [visto]

- **Central:** Vendas, 4 filtros (orçamentos "status 0" com cliente, vendedor e
  totais). Menu: "Orçamentos" (Vendas extras).
- **Filtros:** Data inicial e Data final (mês corrente), Cliente (lupa `pessoa`) e
  Vendedor (lupa `pessoa_colaborador`).
- **Ação:** Gerar (não clicado).
- **Regras:**
  - [visto] A frase diz "status 0": o orçamento é uma **venda no estado 0**; o mesmo
    documento passa a 1 (venda) ou 2 (cancelada).
  - [deduzido] Mostra só os orçamentos **ainda abertos**. Um orçamento que virou venda
    (no balcão ou no faturamento em lote) sai da lista, porque o status muda. Não dá para
    medir a conversão orçamento → venda.
  - Origens de um orçamento: Venda Balcão (`/vendas`, ver 02), o botão "Orçamento" da OS
    (ver 14), o app Força de Vendas (ver 14) e o Agente de Vendas IA no WhatsApp (ver
    [17-consultoria-ia.md](17-consultoria-ia.md)).
  - Os orçamentos não têm item próprio no menu: aparecem neste relatório e, no BI, no
    indicador "Orçamentos pendentes" e no ponto de atenção "orçamentos aguardando
    faturamento", que levam a Faturamento de Vendas (ver 01 e 02).

### 2.30 `/relatorios/cliente-creditos` — Créditos de cliente [visto]

- **Central:** categoria **Financeiro**, 3 filtros. No menu fica em **Vendas extras**.
- **Objetivo:** lançamentos de crédito e de débito na "conta" de crédito do cliente no
  período.
- **Filtros:** Data inicial e Data final (mês corrente) e Cliente (lupa `pessoa`).
- **Ação:** Gerar (não clicado).
- **Fonte** [visto na Consulta Cliente, ver 08]: o painel do cliente mostra o indicador
  **"Crédito"** (saldo em R$) e uma aba **"Créditos"** com Data, Descrição, Crédito e
  Débito. O relatório deve ser a mesma lista para vários clientes.
- **Regras** [deduzido]:
  - O crédito funciona como uma **conta corrente do cliente**: entra por troca,
    devolução ou outro acerto e sai quando é usado numa venda.
  - O uso em venda tem relatório próprio, "Créditos usados em vendas"
    (`cliente-creditos-venda`, só Central).
  - [a verificar] Lançamento manual de crédito, validade, uso parcial e quem pode lançar.

---

## 3. Fluxos de ponta a ponta

Passos marcados **(obs.)** foram vistos; os outros são o encadeamento mais provável.

1. **Rodar qualquer relatório**
   1. Hub, menu, Ctrl+K ou Central → na Central, buscar por texto (`q`) ou categoria →
      "Abrir relatório" **(obs.)**.
   2. Ajustar os filtros: o período já vem com o mês; lupas; situação **(obs.)**.
   3. "Gerar" faz um GET com `executar=1` e os filtros na URL **(obs. no código)**.
   4. A mesma tela mostra o resultado com totais; exportação em PDF, Excel, CSV ou
      impressão, como promete a Central (não visto).
   5. Acima do limite de volume de cada relatório não há saída: a fila de
      "Processamentos" ainda não existe **(obs.)**.
2. **Ciclo da venda que aparece nos relatórios** [visto nas opções e descrições]
   Orçamento (status 0) → venda finalizada (1) → cancelada (2), com motivo e usuário.
   Ainda: liberação de desconto ou limite (pendente → liberado ou negado); troca ou
   devolução que vira crédito do cliente; orçamentos da força de vendas faturados em
   lotes, com marcas de estoque e de financeiro.
3. **Ação de mix (trade marketing)**
   1. A empresa combina com um fabricante uma ação sobre certos produtos.
   2. O gestor abre a positivação, escolhe o período e monta o mix, produto a produto
      (lupa com caixas de marcar) ou pelo fabricante, grupo ou subgrupo.
   3. Pode limitar a um vendedor ou a uma rota.
   4. Gera o ranking de vendedores (clientes distintos que compraram) ou o detalhe por
      cliente e exporta.
   5. Para repetir na semana seguinte, precisa remontar o mix ou guardar a URL do
      relatório gerado.
4. **Reativação da carteira (força de vendas)**
   1. Os clientes têm uma rota no cadastro.
   2. O gestor gera "Clientes sem comprar" (padrão: mais de 15 dias), por vendedor ou
      rota.
   3. O vendedor visita os clientes com o app Android, e a visita sincroniza.
   4. O gestor acompanha a cobertura no painel `/rota-visitas` (ver 14) e no relatório
      de visitas, e mede a positivação das ações.
5. **Da venda ao recebimento, por vendedor**
   1. A venda (status 1) gera parcelas a receber.
   2. O cliente paga e a parcela fica paga.
   3. "Vendas x recebimento por vendedor" mostra o % recebido de cada venda.
   4. A comissão por recebimento (ver 20) usa as mesmas parcelas.
6. **Do orçamento ao faturamento em lote**
   1. O orçamento nasce no app Força de Vendas, na Venda Balcão, na OS ou no agente de
      WhatsApp.
   2. Em Faturamento de Vendas (ver 02): vendedor, período e "só enviados pelo app"
      **(obs.)**; seleção dos orçamentos; conferência de estoque, preço e regras, com
      avisos, bloqueios e liberação de supervisor **(obs. na estrutura da página)**;
      "Gerar vendas e imprimir".
   3. As vendas passam a status 1; estoque e financeiro são processados e marcados em
      cada venda; o lote entra no histórico **(obs.)**.
   4. Relatórios: "Faturamento — lotes", "— vendas do lote" e "por vendedor".
   5. **Desfazer um lote** (ver 02): motivo obrigatório; as vendas voltam a orçamento;
      estoque e parcelas ainda não movimentados são estornados; vendas com nota,
      recebimento, cartão, boleto, entrega ou troca ficam bloqueadas **(obs. no texto)**.
      Os orçamentos voltam a aparecer no relatório "Orçamentos".
7. **Das contas a pagar à previsão** [deduzido da Central]
   1. O título a pagar tem fornecedor e conta do plano de contas; é lançado à mão ou vem
      de uma entrada de mercadoria (relatório "Entradas × contas a pagar", ver 21).
   2. Acompanhamento: por fornecedor, por faixa de atraso (aging) e por conta do plano.
   3. Pagamento: "Pagamentos efetuados" e "Contas pagas no período".
   4. Previsão: o que há a receber e a pagar, por vencimento.
8. **Liberação de supervisor**
   1. O operador esbarra num bloqueio (desconto, preço, limite, estoque, troca) na venda,
      no PDV ou no faturamento.
   2. Liberação local (o supervisor escolhe o usuário e digita a senha de liberação) ou
      remota ("Solicitar remota" → fila `/financeiro/liberacoes`, atualizada a cada 5 s →
      o gestor aprova ou nega) **(obs.; ver 02)**.
   3. A tela do operador continua quando o pedido é aprovado.
   4. O relatório "Liberações de venda" lista os pedidos por status e solicitante.
9. **Troca, devolução e crédito do cliente**
   1. Troca em `/troca-produto` (ver 02): cliente, itens devolvidos (entram) e entregues
      (saem); a diferença vira crédito do cliente ou título a receber; talvez peça
      liberação (a fila cita "trocas").
   2. Devolução: entrada manual com finalidade "Devolução" (operação 12) e o nº da
      venda, que importa os itens (ver 09); ao concluir, estoque (+); crédito ou estorno
      ao cliente.
   3. O saldo de crédito aparece na Consulta Cliente **(obs.)** e é usado numa venda
      como forma de pagamento.
   4. Relatórios: "Trocas de produto", "Devoluções de venda", "Créditos de cliente"
      (lançamentos) e "Créditos usados em vendas".
10. **Dinheiro que entra pelo banco** (telas operacionais em 11)
    1. **Banco:** lançamento manual com valor positivo ou negativo, conta, tipo de
       documento e plano de contas **(obs. na estrutura)**, ou automático (baixa de
       títulos, conciliação OFX); saldo anterior e saldo por conta → relatório
       "Movimentação bancária" (C/D).
    2. **Boleto:** gerado no recebimento com o cedente padrão; registrado por remessa
       CNAB (títulos do mesmo cedente) ou direto por API; pagamento → retorno ou webhook
       → "Liquidado", com o canal da baixa **(obs.)** → relatório "Boletos emitidos".
    3. **PIX:** cobrança com txid (PDV, caixa ou link de pagamento) → o cliente paga → o
       provedor confirma → baixa → relatório "PIX recebidos" (geradas e pagas).

---

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| **Relatório (catálogo)** | slug, nome, categoria (16 com itens + "Visão geral" vazia), descrição, filtros (quantos e quais), formatos (PDF, Excel, CSV), limite de exportação [deduzido] | a Central e o formulário de cada tela saem da mesma definição [deduzido]; 1:N filtros |
| **Processamento de relatório** (futuro) | fila assíncrona, histórico de exportações | N:1 Relatório; N:1 Usuário; ainda não existe |
| **Configuração de lupa** | tipo, título, colunas, cadastro rápido (campos, padrões, sequência) | uma por tipo (`pessoa`, `pessoa_colaborador`, `usuario`, `produto`, `fabricante`, `produto_grupo`, `produto_sub_grupo`, `produto_cor`, `rota`…) |
| **Venda / orçamento** | nº, data, status (0 orçamento, 1 venda, 2 cancelada), cliente, vendedor, modalidade (retirada, entrega, loja/PDV), forma de pagamento, origem (app, balcão, WhatsApp), observação, totais, desconto, acréscimo, documento fiscal | N:1 Pessoa (cliente); N:1 Pessoa (vendedor); 1:N Itens; 0:1 Cancelamento; 0..1 Lote; 1:N Títulos a receber |
| **Cancelamento de venda** | motivo, usuário, data, valores | 1:1 Venda |
| **Item de venda** | produto, quantidade, unitário, desconto, acréscimo, custo gravado (lucratividade), % e valor de comissão, colaborador | N:1 Venda; N:1 Produto |
| **Lote de faturamento** | nº, data e hora, usuário, vendedor [a verificar], nº de vendas, total, status [a verificar], motivo do desfazimento | 1:N Vendas do lote (ver 02) |
| **Venda do lote** | lote, venda, estoque processado (s/n), financeiro processado (s/n) | liga o lote à venda |
| **Solicitação de liberação** | nº, data e hora, solicitante (usuário), código, contexto, tela de origem, status (0, 1, 2), gestor, filial | nasce numa venda, PDV, faturamento ou troca (ver 02) |
| **Usuário / operador** | código, nome, login, senha de liberação, permissão de gestor | pede ou aprova liberações; gera lotes; cancela vendas |
| **Pessoa** | código, nome, CPF/CNPJ, telefone, bairro, rota (`id_rota`); papéis cliente, colaborador/vendedor, fornecedor; o código 1 é "CONSUMIDOR FINAL" | cliente de vendas, boletos e créditos; vendedor de vendas, lotes e visitas; fornecedor de títulos a pagar |
| **Rota** | código, descrição, região (texto), zona, valor | 1:N clientes; usada na força de vendas e no romaneio |
| **Visita de rota** | cliente, vendedor, data, hora, observação | N:1 cliente; N:1 vendedor; vem do app |
| **Produto / Fabricante / Grupo / Subgrupo** | produto: código, descrição, ref. de fábrica, unidade; grupo: status, % de comissão, ordem; fabricante e subgrupo: status | produto N:1 fabricante, grupo e subgrupo (ligação subgrupo–grupo a verificar) |
| **Mix de positivação** | lista de produtos | **não é gravado**: só existe na URL do relatório |
| **Título a receber** | cliente, origem (venda ou OS), vencimento, valor, status (aberto ou pago), data de pagamento, comissão | N:1 Venda ou OS; N:1 Cliente; 0..1 Boleto |
| **Título a pagar** | fornecedor, vencimento, valor, status, data de pagamento, juros, multa, desconto, histórico | N:1 Fornecedor; N:1 Conta do plano; 0..1 Entrada de mercadoria |
| **Conta do plano de contas** | código em árvore (3 dígitos por nível), descrição, status | árvore pai/filho; 1:N títulos a pagar e movimentos bancários |
| **Conta bancária / Movimento bancário** | movimento: id, data, conta, tipo de documento, descrição, valor com sinal (C/D), saldo anterior, saldo, caixa, plano de contas | movimento N:1 conta; pode vir de baixa ou de conciliação (ver 11) |
| **Boleto** | id, cliente, cedente, vencimento, valor, nosso nº, remessa, status (0 a 3), canal da baixa, pagamento | N:1 título a receber; N:1 cedente; remessa ou API (ver 11) |
| **Cobrança PIX** | txid, valor, status, datas | ligada a um título ou venda [a verificar]; criada por um provedor |
| **Troca de produto** | cliente, observação, itens devolvidos, itens entregues, totais, diferença | entrada e saída de estoque; crédito ou título |
| **Devolução de venda** | entrada manual com finalidade 3 e operação 12, nº da venda, itens | aponta para a venda de origem; estoque (+) |
| **Lançamento de crédito do cliente** | data, descrição, crédito, débito; saldo | N:1 cliente; usado em vendas |

---

## 5. Integrações

- **Nenhuma integração externa é acionada nas telas de relatório** [visto]: elas leem o
  banco do ERP por formulários GET e lupas internas (`/lookups/...`). Exportam PDF,
  Excel e CSV gerados no servidor e usam a impressão do navegador (anunciados, não
  vistos). A fila assíncrona ainda não existe.
- **Pressupostas pelo catálogo e pelas telas** [visto nas descrições e filtros]:
  - App Android "Olimpia Força de Vendas": visitas de rota, orçamentos que viram lotes
    de faturamento ("só enviados pelo app") (ver 14);
  - Agente de Vendas IA no WhatsApp: orçamentos (ver 17);
  - bancos: boletos (remessa e retorno CNAB, registro por API e webhook), extrato OFX
    para conciliação (ver 11);
  - provedor PIX (cobrança com txid): Asaas, Efí ou Mercado Pago (ver 12) [deduzido];
  - TEF e POS: NSU, bandeira (relatório `tef-operacoes`);
  - SEFAZ: NF-e, NFC-e, NFS-e, MDF-e, CT-e, manifestação; bloqueio do desfazimento de
    lote para vendas com nota (ver 02 e 21);
  - Mercado Livre, loja virtual, cardápio digital, delivery, régua de cobrança com
    vários canais, SPED (ver 21, 04, 05, 12).
- **Moldura** [código]: sondagem de 7 canais de aviso (ver [22](22-manual.md));
  Bootstrap 5.3.3, SweetAlert2 (CDN jsDelivr), Cloudflare Insights; backend Laravel
  (ver [18](18-parametros-plano-comissoes.md)).
- Estas telas não usam balança, impressora térmica nem e-mail.

---

## 6. Oportunidades de UX

**O que é confuso, lento ou excessivo**

1. **Dois catálogos que não batem.** O hub e o menu têm 80 cartões (78 relatórios) em 8
   grupos; a Central tem 132 em 16 categorias. Há 54 só na Central — inclusive os mais
   úteis para comida (vendas por período, por forma de pagamento, curva ABC,
   lucratividade, fluxo de caixa, pedidos do cardápio e do delivery). "Produtos —
   estoque e valores" aparece duas vezes. "Vendas extras" mistura liberações e trocas
   com NFS-e, SPED, ICMS, anúncios do ML e lista de preços. "Créditos de cliente" está
   em Financeiro na Central e em Vendas extras no menu. A ordem das categorias na lista
   não é a da página e "Visão geral" está vazia. A Central é uma página longa com 132
   cartões, sem favoritos.
2. **Relatórios demais, quase iguais.** Pelo menos 6 jeitos de ver "vendas por
   vendedor" (por vendedor; por vendedor e produto; por vendedor e modalidade; caixa com
   vendedor; faturamento por vendedor; vendas x recebimento). Outros pares: "Pagamentos
   efetuados" e "Contas pagas no período"; "Receber vencidas", "Inadimplência por
   cliente" e "Aging a receber"; "Clientes sem comprar", o filtro "sem comprar" de
   Visitas de rota e o painel `/rota-visitas`; "Vendas x recebimento", "Relatório caixa
   com vendedor" e "Comissões por recebimento"; kardex de entradas/saídas e
   "Movimentações de estoque"; `nfe-por-cfop` e `sped-resumo-periodo`.
3. **Relatório às cegas.** Tudo abre vazio e depende de "Gerar", mesmo com os filtros
   padrão: sem prévia, contagem, resumo, escolha de colunas ou de agrupamento; exportar
   só depois de gerar; a exportação é síncrona e tem um limite que não é mostrado; o
   contador "N filtros" do cartão não ajuda a decidir.
4. **Linguagem técnica para o comerciante.** O slug aparece em destaque; as descrições
   citam "status 0", "tipo_forma = 1", "tabela estoque, tipo E", `valor_comissao`,
   `id_ordem_servico`, "estilo Delphi" e "Delphi FrmRelatorio". As listas mostram o
   código ("1 — Venda") e o nome muda de um relatório para outro ("1 — Venda",
   "Vendas", "Venda"; "Cancelado" e "Canceladas"). O "Nº lote" usa `id_os` (tela copiada
   de outra, risco de erro).
5. **Status sem padrão e em texto livre.** Boletos e PIX (e CT-e, NFS-e, ML) pedem texto
   livre, quando a tela operacional tem lista com códigos; o usuário tem de adivinhar.
   Há números, letras, códigos da SEFAZ e texto para o mesmo conceito de "estado".
6. **Padrões escondidos que mudam totais.** O status padrão varia ("1 — Venda",
   "Concluída", "Autorizada", "Ativos", "Todos"); o período padrão varia entre telas
   (mês corrente nos relatórios, 7 dias nas liberações, hoje no faturamento e no painel
   de visitas). Sem um resumo dos filtros aplicados, os totais deixam de bater sem que o
   usuário perceba.
7. **Lupa lenta e genérica.** Campo só de leitura: é preciso abrir a janela, buscar e
   clicar. Dica cortada, rótulo desligado do campo (acessibilidade), cliques ignorados
   logo depois de fechar outra janela. "Cliente" e "Fornecedor" aceitam qualquer pessoa.
   Filtros de um valor só (um produto, um grupo, um vendedor por vez).
8. **Cadastro dentro de filtro.** As lupas de fabricante, grupo e subgrupo oferecem
   "Cadastrar novo" num relatório — risco de lixo no cadastro.
9. **Faltam filtros que um gestor pede:** conta bancária e tipo de documento na
   movimentação bancária; gestor nas liberações; produto, usuário e tipo de acerto nas
   trocas; cliente e origem no PIX; filial em todos; atalhos de período ("ontem",
   "últimos 7 dias", "mês passado") e comparação com o período anterior.
10. **Filtros sem sentido e nomes que não batem.** "Vendas x recebimento" oferece
    "Orçamento", que nunca tem recebimento. "Boletos" (menu), "Boletos emitidos" (tela)
    e `boletos-periodo` (rota). "PIX recebidos" inclui PIX não pago. "Liberações" fala de
    desconto e limite, mas a fila cobre também estoque, preço e trocas.
11. **Positivação sem campanha, sem meta e com botão com defeito** (2.9).
12. **"Clientes sem comprar" com regra fixa (15 dias) e sem ação.**
13. **Orçamentos sem conversão.** Só aparece o que está em status 0; não se vê quanto foi
    convertido, perdido ou expirou.
14. **Pendências tratadas como relatório.** O que pede ação (título vencido, MDF-e por
    encerrar, nota por manifestar) só aparece se alguém lembrar de gerar o relatório
    certo com o filtro certo.
15. **Tela inacabada à vista.** "Processamentos" está publicada "em evolução".
16. **Moldura pesada.** Cada tela sonda 7 canais de aviso e carrega janelas globais
    (loja, cardápio, OS, ML, WhatsApp IA), mesmo de módulos que o cliente não usa.
17. **Sem ajuda.** O manual não tem cartão para Relatórios.

**O que vale copiar**

- O motor de relatórios: catálogo servido por uma rota genérica, uma definição por
  relatório, filtros na URL (dá para guardar e partilhar), período padrão do mês,
  exportação em três formatos.
- Um único componente de lupa, configurado pelo servidor (colunas e cadastro rápido
  declarados).
- Busca de telas com Ctrl+K, recentes e favoritos.
- Por padrão, só entram vendas concluídas e notas autorizadas.
- Avisos de nota nova e venda nova que chegam sem abrir a tela.

**Proposta para o nosso produto** [proposta]

- **Um catálogo declarativo por módulo**: o cliente só vê os relatórios dos módulos que
  contratou, com favoritos. Cada definição tem fonte (consulta sempre com `tenantId`
  explícito), filtros tipados (período com atalhos, entidade filtrada pelo papel, lista
  de opções com nomes em português e seleção múltipla, número), colunas, agrupamentos,
  totais, ordenação padrão e permissão.
- **Poucos relatórios flexíveis** com "agrupar por" e visões que se trocam: ex.: um
  relatório de vendas com agrupar por período, vendedor, produto, cliente, forma de
  pagamento ou canal, e situação; contas a pagar "por fornecedor", "por conta" ou "por
  faixa de atraso".
- **Resultado imediato**: abrir já com o período padrão, tabela paginada com contagem e
  totais no topo, atualizar ao mudar filtro, exportar (CSV, XLSX, PDF) e imprimir sempre
  à vista; resumo dos filtros ativos como etiquetas no resultado e no PDF.
- **Visões salvas** por usuário, lembrar os últimos filtros, link para partilhar, envio
  agendado por e-mail ou WhatsApp.
- **Volume grande:** exportação em segundo plano, com aviso quando o arquivo estiver
  pronto. Não publicar telas vazias.
- **Autocompletar no próprio campo**, filtrado pelo papel (cliente, vendedor,
  fornecedor), com rótulos corretos; os filtros só filtram (sem cadastro).
- **Vocabulário único de estados** por entidade, definido no domínio, com a mesma
  etiqueta colorida na lista, no detalhe e no relatório.
- **Descrições em linguagem do comerciante**, com a pergunta que o relatório responde
  ("Quem deixou de comprar?").
- **Campanhas** com nome, período e produtos; meta de clientes positivados por vendedor
  e % sobre a carteira; acompanhamento no painel e no app do vendedor.
- **Reativação pelo ciclo de compra** de cada cliente ("compra a cada 7 dias e está há 12
  sem comprar"), com botões para chamar no WhatsApp ou incluir na rota do dia seguinte.
- **Funil orçamento → venda** com motivo de perda.
- **Extrato bancário** com a conta como primeiro filtro e saldo inicial e final.
- **Alertas no painel** para pendências, em vez de relatórios a gerar.
- **Moldura modular**: carregar só os avisos dos módulos ativos, por um canal único
  (SSE ou websocket).

---

## 7. Pendências

1. **Resultado de todos os relatórios não visto**: colunas, totais, agrupamentos,
   ordenação, paginação, botões e formato de PDF/Excel/CSV, impressão e limite de linhas.
   "Gerar" estava proibido nesta pesquisa (o formulário é GET, só leitura; o dono pode
   autorizar numa próxima passagem). Mesmo assim, a conta de teste não tem movimento: é
   preciso uma conta com dados.
2. **Recusas da trava do modo automático do Claude Code** (motivo "Third-Party Attack";
   não foi problema de credencial; nada foi gravado nem clicado além do descrito):
   - `/relatorios/receber-por-cliente` e `/relatorios/faturamento-lotes`: abertura
     recusada;
   - `/relatorios/rota-visitas`: leitura da estrutura recusada (filtros já conhecidos);
   - `/relatorios/vendas-por-vendedor-produto`: leitura por script dos nomes internos
     recusada.
   - Depois de cada recusa a exploração daquele objetivo parou; completar depende de o
     dono da conta autorizar a leitura. Numa das passagens, depois da recusa, uma leitura
     de texto pedida ao mesmo tempo caiu na página que continuava aberta
     (`rota-visitas`) e só repetiu os filtros já descritos.
3. **Não abertos** (nunca tentados): `receber-aging`, `pagar-por-fornecedor`,
   `pagar-pagamentos-periodo`, `pagar-aging`, `pagar-por-plano-contas`,
   `previsao-financeira`. Os 54 relatórios "só Central" também nunca foram abertos.
4. **Datas de referência**: que data cada relatório usa no período — emissão, vencimento
   ou pagamento (boletos, contas); geração ou pagamento (PIX); data do lote ou da venda
   (faturamento); data da venda ou do recebimento (vendas x recebimento).
5. **Status em texto livre** (boletos, PIX): busca exata ou parcial; por código ou texto;
   que valores existem no PIX.
6. **Regras a confirmar**: cálculo do % recebido; se "Clientes sem comprar" inclui quem
   nunca comprou e qual vendedor usa; faixas e data-base dos agings; se a previsão parte
   do saldo bancário; se o plano de contas soma subtotais por nível; estados e efeitos do
   lote (NF-e, estoque, financeiro) e quando as marcas ficam "Não"; se a movimentação
   bancária junta todas as contas e o caixa e se mostra saldo.
7. **PIX**: origem das cobranças (PDV, caixa, link, boleto híbrido), provedor e se a baixa
   é automática.
8. **Troca, devolução e créditos**: regra entre crédito e título; se a troca exige
   liberação; se a devolução gera crédito sozinha; prazo de troca; lançamento manual,
   validade, uso parcial e quem pode lançar crédito.
9. **Liberações**: o que é o campo "Código"; se o pedido expira; como o gestor é avisado;
   se a senha de liberação difere da de login.
10. **Positivação**: confirmar com clique (num fabricante com produtos) o defeito do
    "Incluir do fabricante/grupo"; verificar se `/lookup/produto/{id}` existe.
11. **Validação no servidor** do período (data inicial maior que a final).
12. **Permissões**: tudo foi visto como ADMIN; não se sabe quem pode abrir cada relatório
    nem aprovar liberações.
13. **Celular**: o comportamento das telas de relatório não foi testado.
14. **Lupa de Pessoa**: se aceita seleção múltipla em algum relatório.
15. **Ações vistas e NÃO clicadas**: "Gerar" (em todas as telas), "Cadastrar novo" (nas
    lupas), "Adicionar selecionados", "Incluir do fabricante/grupo", "Limpar mix",
    "Adicionar aos atalhos" (estrela dos cartões).

---

## 8. Sub-rotas descobertas

| Endereço | O que é | Estado |
|---|---|---|
| `/relatorios?q=&categoria=` | Central filtrada por texto e por categoria | testada ("vendedor"; "Comissões"; `overview`) |
| `/relatorios/{slug}` | rota genérica dos 132 relatórios (`relatorios.show`, parâmetro `report`) | formulários lidos |
| `/relatorios/{slug}?executar=1&de=…&ate=…&…` | resultado de um relatório (o que "Gerar" faz) | **não aberto** |
| `/relatorios/positivacao-mix/produtos?id_fabricante=&id_grupo=&id_sub_grupo=` | lista JSON de produtos para o mix | chamada uma vez, só leitura; veio vazia |
| GET `/lookups/{tipo}/config` | configuração da lupa | lida para vários tipos |
| GET `/lookups/{tipo}/search?q=&page=` | pesquisa paginada da lupa | usada; resultados vazios ou só registros padrão |
| GET `/lookups/{tipo}/{id}` | rótulo de um item escolhido | visto no código |
| POST `/lookups/{tipo}/quick` | cadastro rápido pela lupa | visto no código; **não chamado** |
| `/lookup/produto/{id}` | nome de um produto do mix (singular) | visto no código; existência a verificar |
| `/js/erp-lookup.js` | script da lupa | visto |
| `/erp/notificacoes/{canal}/poll` (`ml`, `manifestacao`, `boleto-baixa`, `loja`, `cardapio`, `os`, `whatsapp`), `/erp/notificacoes/ml`, POST `/erp/notificacoes/ml/{id}/lida` | avisos da moldura | só no código; não chamados |
| `/erp/navigation` | catálogo do menu, guardado no navegador por 5 minutos | só no código (lido uma vez na sessão) |
| 54 relatórios "só Central" | ver coluna "Menu" em 2.2.1 | não abertos |
