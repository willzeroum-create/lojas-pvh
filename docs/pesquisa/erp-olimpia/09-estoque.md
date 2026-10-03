# 09 — Estoque (ERP Olímpia)

> Cobre o módulo de estoque: o lançador do módulo, as entradas por XML e manuais,
> as saídas manuais, as transferências entre filiais, os balanços e o histórico de
> movimentos (kardex). Exploração de 2026-10-03, conta de teste "Boi Criolo" (plano
> Full), perfil ADMIN, sessão já aberta no navegador embutido. A conta quase não tem
> dados (nenhuma entrada, saída, produto ou movimento), por isso as telas de detalhe
> dos documentos não puderam ser vistas.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual], [código]
> (lido no HTML/JS da página), [proposta]; "a verificar" = pergunta aberta.
> Nada foi gravado, enviado, importado ou alterado no ERP.

## 1. Visão geral

### 1.1 Onde fica

- **Menu [visto]:** secção "Operações" do menu lateral (Cadastros, Sinuca, Estoque,
  Produção, Compras). O módulo Estoque tem **12 itens** no menu: Entrada de XML,
  Entrada Manual, Saída, Troca de produto, Transferência, Balanço, Log estoque,
  Etiquetas, Pedido de venda, Faturamento de vendas, Balcão entrega e Romaneio de carga
  (os mesmos 12 cartões do lançador, 2.1). A busca de telas (Ctrl+K) encontra
  "Entrada Manual" (Estoque) quando se procura "manual".
- **Plano [visto]:** "Estoque & Entradas" é um dos 36 módulos do plano Full (lista de
  módulos em [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).
- **Manual [afirmado pelo manual]:** o cartão "Estoque & Entradas" (`mod-estoque`) tem
  3 passos: entrada pelo XML da NF-e do fornecedor; saídas automáticas em vendas e PDV;
  balanço e ajuste de inventário. Não tem botão "Abrir módulo". É coerente com o menu
  (ver [22-manual.md](22-manual.md)).
- **Cartões do lançador que vivem noutros documentos:** `/troca-produto`, `/vendas`,
  `/financeiro/faturamento`, `/balcao-entrega` e `/romaneios` ficam em
  [02-vendas-pdv.md](02-vendas-pdv.md); `/etiquetas` em
  [07-produtos.md](07-produtos.md); `/manifestacao-nfe` (ligada às entradas por XML) em
  [13-fiscal.md](13-fiscal.md). Os relatórios de estoque e de entradas ficam em
  [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md).

### 1.2 Como o estoque funciona

- **Documentos de movimento [visto]:** entrada por XML, entrada manual, saída manual,
  troca de produto, transferência entre filiais e balanço. Todos nascem com status
  **Pendente** e passam a **Concluído** ou **Cancelado** (a troca é confirmada direto).
- **Códigos de status [visto nos relatórios]:** `0`, `1`, `2`. Nas telas de operação
  chamam-se Pendente, Concluído e Cancelado; nos relatórios de entrada e saída o `0`
  chama-se **"Aberta"** e o `1` "Concluída". Nos relatórios de transferências:
  Pendente (0), Concluída (1), Cancelada (2). No relatório de balanço só aparecem
  Pendente (0) e Concluído (1). Sentido [deduzido]: Pendente/Aberta = lançada, mas
  ainda sem efeito no saldo; Concluída = efetivada, com estoque (e, na entrada, custo)
  atualizados; Cancelada.
- **Operação fiscal [visto]:** entradas e saídas usam a **mesma lista de 41
  operações** (compra, devolução, bonificação, perda, remessa, transferência...). É
  ela que diz o "porquê" do movimento. Lista completa em 1.3.
- **Locais de estoque [código]:** G = Geral, P = Prateleira, R = Reserva, E = Entrega
  futura. As colunas de local e de grade só aparecem se a empresa usar prateleira ou
  grade (parâmetros da empresa; o campo "Usa grade (tamanho/cor)" fica no cadastro da
  empresa, ver [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)).
- **Saldo [deduzido]:** produto × empresa × local (G/P/R/E) × grade. O estoque é **por
  filial** (a empresa ativa, escolhida no topo da tela). Clientes e produtos são
  compartilhados entre filiais; o que muda nas telas de estoque ao trocar de empresa
  ativa está por verificar.
- **Kardex [visto nas frases da Central de Relatórios]:** uma só tabela (`estoque`)
  para todos os movimentos, com os tipos `E` (entrada), `S` (saída) e `B` (balanço).
  Cada movimento guarda o saldo antes e depois e o documento de origem (entrada,
  saída, OS, venda, balanço). Geram linha `E` [deduzido]: a entrada concluída (XML ou
  manual), a devolução de venda, o produto devolvido numa troca e, talvez, a
  transferência recebida e o cancelamento de venda (a verificar). Geram linha `S`
  [deduzido]: vendas (balcão, PDV, delivery, loja virtual), peças baixadas numa OS,
  saídas manuais, o produto entregue numa troca e a transferência enviada. O ajuste
  de estoque feito na ficha do produto ("Estoque no cadastro",
  `ajuste_estoque_cadastro`) aparece como ação no log de alterações (ver
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).
- **Momento da baixa da venda [visto nos parâmetros]:** na finalização da venda ou no
  balcão de entrega (parâmetro de Vendas).
- **Origem do sistema [visto]:** quase toda tela mostra o nome do formulário do sistema
  desktop antigo (`FrmEntrada`, `FrmEntrada_Manual`, `FrmSaida_Manual`,
  `FrmEstoque_Transferencia`, `FrmBalanco`, `FrmEstoque_LOG`).
- **Sem indicadores:** o lançador do módulo só tem atalhos (2.1).

### 1.3 As 41 operações (entrada e saída) [visto]

A mesma lista em entradas e saídas, na ordem da tela; a grafia do sistema foi mantida:

1. ENTRADA
2. COMPRA
3. IMPORTAÇÃO
4. RETORNO DE CONSERTO
5. RETORNO DE DEMONSTRAÇÃO
6. RETORNO DE ENTREGA FUTURA
7. RETORNO DE CONSIGNAÇÃO
8. RETORNO DE SIMPLES REMESSA
9. NF COMPLEMENTAR
10. EXTORNO DE NFE
11. ENTRADA XML
12. DEVOLUÇÃO DE VENDA
13. CRÉDITO CIAP
14. DEVOLUÇÃO COMODATO
15. DEVOLUÇÃO EXPORTAÇÃO
16. DEVOLUÇÃO BONIFICAÇÃO
17. DEVOLUÇÃO CONSUMO
18. DEVOLUÇÃO IMOBILIZADO
19. ENTRADA DE NOTA FISCAL
20. DEVOLUÇÃO DE REVENDA
21. DEVOLUÇÃO DE VENDA DO PDV ON
22. VENDA
23. ENTREGA FUTURA
24. REVENDA
25. BONIFICAÇÃO
26. VENDA EM CONSIGNAÇÃO
27. EXPORTÇÃO
28. DEMONSTRAÇÃO
29. CONSUMO
30. VENDA IMOBILIZADO
31. CONSERTO
32. TRANSFERÊNCIA
33. SIMPLES REMESSA
34. EXTRAVIO / PERDA
35. DEVOLUÇÃO COMPRA
36. VENDA PDV OFF
37. COMODATO
38. NFE COMPLEMENTAR
39. ORDER DE SERVIÇOS
40. SAÍDA DE ICMS
41. VENDA PDV ON

Na tela de notas fiscais a lista de operações inclui TRANSFERÊNCIA e DEVOLUÇÃO
COMPRA, e a nota pode nascer de um registro de **saída** (não só de uma venda); na
devolução de compra, a chave da NF-e do fornecedor vai na aba de nota referenciada
(ver [13-fiscal.md](13-fiscal.md)).

### 1.4 Parâmetros da empresa que mexem no estoque (síntese)

A aba "Parâmetros" do cadastro da empresa (cerca de 420 opções) fica descrita em
[08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md). O que toca o estoque
[visto; rótulos interpretados quando eram nomes de coluna]:

- **Grupo Estoque (13 opções):** controle de lote/validade; almoxarifado e "estoque
  prateleira" (são os locais G/P/R/E); a entrada atualiza o preço de compra (ligado)
  e, opcionalmente, o cadastro do produto; a entrada pode pedir conta do plano e tipo
  de documento; a produção lança estoque na entrada (ligado) e pode lançar sobra;
  transferir estoque online; alterar o preço de venda na transferência; senha para
  saída de estoque.
- **Vendas:** momento da baixa de estoque (finalização da venda ou balcão de
  entrega); bloquear venda com estoque negativo.
- **Tela Pesquisa:** opção sobre saldo negativo na pesquisa de produtos.
- **Produtos:** saldo editável no cadastro do produto.
- **Fiscal / Manifestação:** ciência automática ao sincronizar (ligada), consulta
  automática DistDFe (ligada), importar XML como entrada automaticamente (desligada;
  o padrão é desligado); lançar contas a pagar a partir da NF-e de entrada (ligado).
- **App Força de Vendas:** incluir produtos com saldo zero (ligado).

### 1.5 Padrões de tela dos documentos com itens [visto]

- Painel lateral **"Lançamento"** para incluir ou editar itens, duplo clique para
  editar, tecla Del (ou lixeira) para excluir e rodapé com totais. É uma cópia da tela
  desktop.
- Lupa de produto em modal (Código, Descrição, Ref., UN); nesta conta volta vazia.
  Os padrões gerais de lista, formulário e lupa ("Pesquisar — X", "Cadastrar novo",
  barra "Dados complementares") estão em
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md).
- Listas com filtros De / Até / Status (Todos, Pendente, Concluído, Cancelado) e
  busca livre.

### 1.6 Rotas e estado

Numa primeira tentativa do dia, a navegação para `/dashboard/modulo/estoque` e, noutra
passagem, para `/transferencias` foi recusada pelo classificador do modo automático do
Claude Code ("Third-Party Attack"). Uma passagem posterior abriu e leu todas as rotas
abaixo.

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/estoque` | Lançador do estoque | lida |
| `/entradas-xml` | Entrada de XML (NF-e) — lista | lida |
| `/entradas-xml/create` | Importar NF-e (XML), aba "Arquivo XML" | lida (importar não clicado) |
| `/entradas-xml/create?aba=manifestadas` | aba "Notas manifestadas SEFAZ" | lida (sincronizar não clicado) |
| `/entradas-xml/relatorio-geral` | Relatório geral do período (PDF) | falhou ("denied or failed"); não repetida |
| `/entradas-manual` | Entrada manual — lista | lida |
| `/entradas-manual/create` | Nova entrada manual | lida (com lupa de produto) |
| `/entradas-manual/relatorio-geral` | Relatório geral (PDF) | não tentada |
| `/saidas-manual` | Saída manual — lista | lida |
| `/saidas-manual/create` | Nova saída manual | lida |
| `/transferencias` | Transferência entre filiais — lista | lida |
| `/transferencias/create` | Nova transferência | lida |
| `/balancos` | Balanço de estoque — lista | lida |
| `/balancos/create` | Novo balanço | lida |
| `/estoque-log` | Movimentação de estoque (log) | lida (lista vazia) |

## 2. Telas

### 2.1 `/dashboard/modulo/estoque` — Lançador do estoque [visto]

| Bloco | Cartão | Rota |
| --- | --- | --- |
| Movimentações | Entrada de XML | `/entradas-xml` |
| Movimentações | Entrada manual | `/entradas-manual` |
| Movimentações | Saída | `/saidas-manual` |
| Movimentações | Troca de produto | `/troca-produto` (ver 02) |
| Movimentações | Transferência | `/transferencias` |
| Inventário & Controle | Balanço | `/balancos` |
| Inventário & Controle | Log estoque | `/estoque-log` |
| Inventário & Controle | Etiquetas | `/etiquetas` (ver 07) |
| Expedição & Vendas | Pedido de venda | `/vendas` (ver 02) |
| Expedição & Vendas | Faturamento de vendas | `/financeiro/faturamento` (ver 02) |
| Expedição & Vendas | Balcão entrega | `/balcao-entrega` (ver 02) |
| Expedição & Vendas | Romaneio de carga | `/romaneios` (ver 02) |

- Cada cartão tem o botão "Adicionar aos atalhos" (fixar no menu lateral). **Não
  clicado.**
- **Não há indicadores:** nem valor em estoque, nem itens abaixo do mínimo, nem notas
  para importar.
- O "Faturamento de vendas" fica neste menu ("Estoque · Expedição & Vendas") apesar da
  URL `/financeiro/...`.

### 2.2 `/entradas-xml` — Entrada de XML (NF-e) [visto]

#### Lista (nota "FrmEntrada")

- **Ações:**
  - "Notas SEFAZ" (`/entradas-xml/create?aba=manifestadas`);
  - "Importar XML" (`/entradas-xml/create`);
  - link "Relatório geral do período" (`/entradas-xml/relatorio-geral`). Não abriu no
    navegador embutido; deve ser um PDF em nova aba, como o da entrada manual
    [deduzido].
- **Filtros:** De, Até, Status (Todos, Pendente, Concluído, Cancelado) e a busca "ID,
  chave ou fornecedor".
- **Colunas:** ID, Data, NF, Chave, Fornecedor, Total, Status, Ações. Lista vazia.

#### `/entradas-xml/create` — "Importar NF-e (XML)"

- Links para "Manifestação" (`/manifestacao-nfe`, ver 13) e "Entradas".
- **Indicadores:**
  - Notas SEFAZ (prontas ou quase prontas);
  - Com XML (podem ser importadas agora);
  - Auto sync: **ON, a cada 5 min**;
  - Ciência auto: **NÃO**, apresentado como "parâmetro da empresa". **Contradiz** o
    parâmetro "Ciência automática ao sincronizar NF-e", que está **ligado** na aba
    Parâmetros da empresa (1.4). A confirmar qual vale.
- **Aba "Arquivo XML":**
  - Envio de **um** arquivo `.xml` (obrigatório) e o botão "Importar arquivo" (não
    clicado; envia para `/entradas-xml/import` [código]).
  - **Regras ditas na tela:** o sistema cadastra o fornecedor se preciso, converte o
    CFOP (do CFOP de saída do fornecedor para um de entrada [deduzido]) e tenta ligar
    cada item a um produto pelo **GTIN** ou pela **referência**.

#### `/entradas-xml/create?aba=manifestadas` — aba "Notas manifestadas SEFAZ"

- Bloco "Sincronizar com SEFAZ": consulta a distribuição de documentos (DistDFe), dá
  ciência, baixa o XML e cria **entradas pendentes**. A rotina automática só roda com o
  parâmetro "Consulta automática" ligado.
- Botão "Sincronizar agora": **não clicado** (envia para
  `/entradas-xml/sync-manifestacao` [código]).
- Tabela "Notas da distribuição": Emitente, NF-e, Emissão, Valor, XML, Status e ação.
  Vazia.
- O ciclo de manifestação (ciência, confirmação, desconhecimento, operação não
  realizada), o NSU e o "Monitor SEFAZ" ficam na tela `/manifestacao-nfe`, descrita em
  [13-fiscal.md](13-fiscal.md). Lá também se avisa que o XML não vira entrada sozinho
  (é preciso importar nota a nota) salvo com "importação auto" ligada.

#### Critério XML × manual [deduzido das frases dos relatórios]

A entrada "XML" é a que tem **chave de NF-e** preenchida; com a chave vazia é manual.
As notas só manifestadas ou baixadas, que ainda não viraram entrada, não contam como
entrada.

#### Detalhe de uma entrada importada — não visto

A conta não tem nenhuma entrada para abrir. A verificar: conferência item a item;
ligação de produto não encontrado (e se o vínculo fica lembrado para as próximas notas;
se dá para cadastrar o produto a partir da nota); conversão de unidade e fator por
item; custo com ou sem IPI, ST, frete e desconto; lote e validade; preço de venda e
markup; geração de contas a pagar a partir das duplicatas (há o parâmetro "lançar
contas a pagar a partir da NF-e de entrada", ligado); onde fica o "Concluir";
cancelamento e estorno.

### 2.3 `/entradas-manual` — Entrada manual [visto]

#### Lista (nota "FrmEntrada_Manual")

- Ações: "Inserir" e o ícone "Relatório geral" (PDF em nova aba,
  `/entradas-manual/relatorio-geral`, não aberto).
- Filtros: De, Até, Status (Todos, Pendente, Concluído, Cancelado), Fornecedor (lupa)
  e a busca "ID ou fornecedor".
- Colunas: ID, Data, Fornecedor, NF, Emissão, **Venda**, Finalidade, Total, Status,
  Ações.

#### `/entradas-manual/create` — "Nova Entrada Manual"

| Campo | Tipo | Obrigatório | Opções / regra |
| --- | --- | --- | --- |
| Data entrada | data | sim | padrão: hoje |
| Fornecedor / Cliente | lupa | sim | aceita cliente, por causa da devolução [deduzido]; a lupa é a genérica de Pessoa |
| Operação | lista | sim | as 41 operações (1.3); padrão: ENTRADA |
| Status | só leitura | — | "Pendente" |
| NF nº / Série | texto | não | — |
| Emissão NF | data | não | — |
| Finalidade | lista | não | 0 Normal, 1 Complementar, 2 Ajuste, 3 Devolução |
| Nº venda (devolução) | número | não | importa os itens de uma venda |
| Observações | texto longo | não | — |

- **Itens:**
  - Grade com ITM, Cód., Descrição, Qtde, Unitário e Total, mais o rodapé com o total
    de quantidade (4 casas) e de valor.
  - Duplo clique edita a linha; a tecla Del ou o ícone de lixeira remove.
- **Painel "Lançamento":**
  - ITM (automático), Produto (lupa com Código, Descrição, Ref. e UN; busca em
    `/lookups/produto/search` [código]) e Descrição (só leitura);
  - Quantidade (padrão 1) e Unitário;
  - Total (só leitura) e os botões "Lançar item" e "Limpar". O Enter passa da
    quantidade ao unitário e lança o item.
- **Regras [código]:**
  - O produto é obrigatório e a quantidade tem de ser maior que zero.
  - O **custo unitário é sugerido pelo servidor** a partir do produto, da finalidade e
    do fornecedor (consulta `/entradas-manual/produto/{id}`).
  - Cada item guarda também a **grade** (padrão "UN") e o **local de estoque** (padrão
    G). Esses campos só aparecem se a empresa usar grade ou prateleira.
  - Finalidade "Devolução" troca a operação, sozinha, para 12 (DEVOLUÇÃO DE VENDA).
  - A importação dos itens de uma venda (Enter no campo nº da venda) **só funciona
    depois de a entrada estar salva**.
- Botões "Salvar" (não clicado) e "Voltar".
- A entrada manual não é só "compra sem nota": aqui caem também as devoluções de venda
  (finalidade 3, operação 12), as notas complementares e os ajustes [deduzido].
- A verificar: como a entrada passa de Pendente a Concluído (botão no registro?), se
  gera contas a pagar e lançamento financeiro, se atualiza o custo médio ou o último
  custo, estorno.

### 2.4 `/saidas-manual` — Saída manual [visto]

#### Lista (nota "FrmSaida_Manual")

- Ação: "Inserir". Filtros: De, Até, Status (Todos, Pendente, Concluído, Cancelado) e a
  busca "ID ou pessoa".
- Colunas: ID, Data, Pessoa, NF, Emissão, Finalidade, Total, Status. **Não há
  relatório**, ao contrário da entrada.

#### `/saidas-manual/create` — "Nova Saída Manual"

| Campo | Tipo | Obrigatório | Opções / regra |
| --- | --- | --- | --- |
| ID | só leitura | — | — |
| Data saída | data | sim | padrão: hoje |
| Pessoa / Fornecedor | lupa | sim | aceita qualquer pessoa (o fornecedor numa devolução de compra) |
| Operação | lista | sim | as mesmas 41; **padrão: ENTRADA**, estranho numa saída |
| Status | só leitura | — | "Pendente" |
| NF nº / Série / Emissão NF | texto/data | não | — |
| Finalidade | lista | não | Normal, Complementar, Ajuste, Devolução |
| Observações | texto longo | não | — |

- **Itens:** grade com ITM, Cód., Produto, Qtde, Unitário, Acrés., Desc.%, Desc.R$ e
  Total, mais o total geral.
- **Painel "Lançamento":** Produto, Descrição, Quantidade, Unitário (sugerido pelo
  servidor, `/saidas-manual/produto/{id}` [código]), Desc. %, Desc. R$, Acréscimo e
  Total líquido.
- **Cálculo [código]:** total líquido = quantidade × unitário − desconto em R$ −
  (bruto × desconto %) + acréscimo, arredondado em 2 casas.
- [código] Cada item guarda: produto, descrição, quantidade, **valor vendido**, grade,
  desconto %, desconto R$, acréscimos e valor líquido. A saída é tratada como uma
  "quase venda" [deduzido].
- **Não há campo "motivo"** nem justificativa: o motivo é a operação (EXTRAVIO / PERDA,
  CONSUMO, BONIFICAÇÃO, DEVOLUÇÃO COMPRA, SIMPLES REMESSA, TRANSFERÊNCIA...).
- **Não há local de estoque** na saída (na entrada há).
- A saída pode levar NF (número, série, emissão), e a NF-e pode nascer de uma saída
  (ver [13-fiscal.md](13-fiscal.md)). É a porta para devolução de compra, remessa e
  perda com nota [deduzido]. Vendas e OS não entram como "saídas manuais/fiscais":
  geram saída no kardex, mas não este documento [deduzido].
- Existe o parâmetro "senha para saída de estoque" (1.4).
- A verificar: que custo serve de base ao "unitário sugerido" (custo médio? último
  custo? preço de venda?); quem pode lançar; como se conclui; estorno.

### 2.5 `/transferencias` — Transferência entre filiais [visto]

- Nota "FrmEstoque_Transferencia".
- **Lista:**
  - Filtros: De, Até, Status (Todos, Pendente, Concluído, Cancelado) e ID.
  - Colunas: ID, Data, Origem, Destino, Status, Ações.
- **Formulário (`/transferencias/create`):**
  - Data (obrigatória).
  - **Origem:** a empresa ativa, bloqueada.
  - **Destino:** lista das outras filiais (obrigatório; vazia nesta conta, que só tem
    uma empresa).
  - Status "Pendente".
- **Itens** (botão "+ Item"):
  - Produto, digitado **pelo número do ID** (obrigatório);
  - Saldo origem (só leitura);
  - Qtde transferir (obrigatória);
  - Grade.
- É transferência **entre empresas/filiais** do mesmo cliente; não se viu
  transferência entre locais (depósitos) da mesma empresa.
- Os parâmetros de estoque falam em "transferir estoque online" e "alterar preço de
  venda na transferência" (1.4).
- A verificar: se a conclusão gera NF-e de transferência (existe a operação 32,
  TRANSFERÊNCIA; CFOP 5152/6152) quando o CNPJ muda; se "Pendente" é mercadoria em
  trânsito e se há confirmação de recebimento no destino (e quem confirma);
  cancelamento e estorno.

### 2.6 `/balancos` — Balanço de estoque [visto]

- Nota "FrmBalanco".
- **Lista:**
  - Filtros: De, Até e Status.
  - Colunas: ID, Data, Motivo, Usuário, Status.
- **Formulário (`/balancos/create`):**
  - **Cabeçalho:**
    - ID, Data (obrigatória), Empresa, Status "Pendente" e Usuário;
    - **Estoque** (local): Geral, Prateleira, Reserva ou Entrega futura. Muda o local
      dos itens lançados.
    - **Motivo:** "Acerto de estoque" ou "Final de ano".
    - Observações.
  - **Busca rápida de produto:** por descrição, ID, GTIN ou referência; o Enter
    localiza. Uma nota diz que a multisseleção virá numa versão futura.
  - **Itens:** ITM, Cód., Produto, Saldo novo, Estoque (local).
  - **Painel "Lançamento":**
    - Produto e Descrição;
    - **Saldo anterior** (do sistema, só leitura; consulta `/balancos/produto/{id}`
      [código]);
    - **Saldo novo (contagem)**;
    - **Total (custo)** = saldo novo × preço de compra [código].
- [deduzido] Conta-se o saldo absoluto (não a diferença), produto a produto, num local
  por vez. O saldo anterior fica guardado no item na hora da contagem, por isso a
  diferença não muda com movimentos posteriores.
- O log tem o tipo "Balanço" (`B` no kardex): ao concluir, o ajuste deve virar
  movimento de estoque [deduzido].
- A verificar: se concluir ajusta o estoque na hora e a que custo a diferença é
  valorizada; se existe balanço parcial por grupo ou categoria (hoje só se vê o recorte
  por local); se o saldo é congelado no início da contagem; contagem por leitor,
  coletor ou planilha; quem pode finalizar; se há "Cancelado" (o relatório só tem
  Pendente e Concluído); se há relatório de inventário para fins fiscais.

### 2.7 `/estoque-log` — Movimentação de estoque [visto]

- Nota "Consulta do log — FrmEstoque_LOG".
- **Filtros:** De, Até, Produto (lupa) e Tipo (Todos, Entrada, Saída, Balanço).
- **Colunas:** ID, Data, Tipo, Produto, Qtde, Saldo ant., Saldo atual, Entrada, Saída,
  OS, Venda, Balanço (documento de origem), Operação, Usuário, Grade.
- Sem exportação visível. Lista vazia.
- Não há filtro por operação, local, grade, usuário, documento ou empresa.
- A verificar: se dá para abrir o documento de origem a partir da linha; se as
  transferências e as trocas aparecem com tipo próprio ou como Entrada/Saída.

## 3. Fluxos de ponta a ponta

Passos marcados **(obs.)** foram vistos; os outros são o encadeamento mais provável,
a verificar.

1. **Compra com NF-e (XML):**
   1. A SEFAZ é consultada a cada 5 min (DistDFe), se o parâmetro estiver ligado
      **(obs.)**; a moldura do ERP avisa "Nova NF-e para manifestar" (ver 13).
   2. Ciência automática ou manual → download do XML **(obs.)**.
   3. Entrada pendente (status `0`) criada pela sincronização ou pelo "Importar" de
      cada nota **(obs.)**. Também dá para enviar o arquivo XML **(obs.)**.
   4. O fornecedor é cadastrado, o CFOP convertido e os itens ligados por GTIN ou
      referência **(obs.)**.
   5. Conferência dos itens → concluir (status `1`; onde fica o botão, a verificar).
   6. Linhas `E` no kardex; preço de compra atualizado (parâmetro **obs.**); contas a
      pagar a partir das duplicatas (parâmetro "lançar a pagar" **obs.**; a Central de
      Relatórios tem "Entradas × contas a pagar") → log.
   7. Confirmação da operação na manifestação, dentro do prazo **(obs.)**, ver 13.
   8. Onde a compra aparece: relatórios "Entradas XML", "Entradas — itens", kardex de
      entradas, "Compras por período", "Entradas × contas a pagar" (ver 21).
   9. Cancelamento: status `2`; se o kardex é estornado com uma linha `S`, a verificar.
2. **Entrada manual / devolução de venda:**
   1. Cabeçalho (fornecedor ou cliente, operação, NF, finalidade) **(obs.)**.
   2. Itens com custo sugerido **(obs.)** → salvar (Pendente) **(obs.)** → concluir →
      linhas `E`.
   3. Na devolução: finalidade 3 → operação 12 **(obs.)** → salvar → número da venda →
      importar os itens da venda **(obs.)** → crédito ou estorno ao cliente.
3. **Saída manual (perda, consumo, bonificação, devolução de compra, remessa):**
   1. Pessoa e operação **(obs.)**.
   2. Itens com desconto e acréscimo **(obs.)** → salvar (Pendente) → concluir →
      linhas `S`.
   3. Se for preciso, NF-e a partir da saída (ver 13).
4. **Transferência entre filiais:**
   1. Origem = empresa ativa → destino → itens com saldo da origem **(obs.)** → salvar
      (Pendente).
   2. Concluir → baixa na origem e entrada no destino; NF-e de transferência quando o
      CNPJ muda. Também pode ser cancelada.
5. **Balanço (inventário):**
   1. Cabeçalho com local e motivo **(obs.)**.
   2. Contar produto a produto (saldo novo × saldo anterior, custo pelo preço de
      compra) **(obs.)**.
   3. Concluir → ajustes → log do tipo Balanço **(obs.: o tipo existe no filtro)**.
6. **Vendas, OS, trocas e transferências no kardex:** mexem no kardex com linhas `S`
   ou `E`, aparecem no `/estoque-log` e nos relatórios de kardex, mas não nos
   relatórios de documento [deduzido].
7. **Análise e ação [deduzido]:** relatórios de valor por grupo e de estoque sem
   movimento (ver 21) → mudar preço, devolver ao fornecedor (saída "DEVOLUÇÃO
   COMPRA"), dar baixa por perda ("EXTRAVIO / PERDA"), inativar o produto ou contar de
   novo no balanço.

## 4. Entidades e relações

| Entidade | Campos principais | Relações |
| --- | --- | --- |
| Operação | código 1–41, descrição | usada por entrada, saída e NF-e |
| Entrada (XML ou manual) | id, data de entrada, pessoa (fornecedor ou cliente), **chave NF-e** (preenchida = XML, vazia = manual), NF nº, série, emissão, operação, finalidade, nº da venda (devolução), total, obs, status (`0` Pendente/Aberta, `1` Concluído, `2` Cancelado) | N:1 Pessoa; 1:N Item de entrada; 1:N movimentos `E`; 0..1 Venda (devolução); 0..1 DF-e recebido (ver 13); 0..N títulos a pagar [deduzido] |
| Item de entrada | nº do item, produto, descrição, quantidade de entrada, custo unitário, total, grade, local | N:1 Entrada; N:1 Produto (ligado por GTIN/referência no XML) |
| Saída manual | id, data, pessoa, operação, NF, série, emissão, finalidade, obs, total, status (`0`, `1`, `2`) | 1:N Item de saída; 1:N movimentos `S`; 0..1 NF-e |
| Item de saída | produto, descrição, quantidade, valor vendido (unitário), grade, desc. %, desc. R$, acréscimos, líquido | N:1 Saída; N:1 Produto |
| Transferência | data, empresa origem, empresa destino, status (`0` Pendente, `1` Concluída, `2` Cancelada) | 1:N Item (produto, saldo na origem, quantidade transferida, grade) |
| Balanço | data, empresa, usuário, local, motivo, obs, status (`0` Pendente, `1` Concluído) | 1:N Item (produto, saldo anterior, saldo novo, local, grade, custo) |
| Movimento de estoque (kardex, tabela `estoque`) | id, data, tipo (`E`, `S`, `B`), produto, quantidade, saldo antes, saldo depois, ids de origem (entrada, saída, OS, venda, balanço), operação, usuário, grade | N:1 Produto; N:1 documento de origem; N:1 Empresa |
| Saldo de estoque [deduzido] | produto × empresa × local (G/P/R/E) × grade | atualizado pelos documentos acima |

A troca de produto (entrada + saída + crédito ou título) está em
[02-vendas-pdv.md](02-vendas-pdv.md); o DF-e recebido e a manifestação, em
[13-fiscal.md](13-fiscal.md).

## 5. Integrações

- **SEFAZ:** DistDFe (notas destinadas, a cada 5 min) com ciência e download do XML,
  que alimenta a entrada por XML; a NF-e de saída pode nascer de uma saída manual ou
  de uma transferência (a verificar). Tudo com o certificado A1 único da empresa (ver
  08 e 13).
- **Contas a pagar:** parâmetro para lançar contas a pagar a partir da NF-e de entrada
  (ligado); ver [11-financeiro-bancos.md](11-financeiro-bancos.md).
- **Etiquetas e balança:** tela de etiquetas em 07; balança nos parâmetros do PDV
  (ver 18).
- **Exportação:** as listas não têm exportação visível; os relatórios gerais de
  entrada são PDF em nova aba.

## 6. Oportunidades de UX

**O que é confuso ou fraco**

1. **O estoque não tem painel.** O lançador só tem atalhos: nada de valor em estoque,
   itens abaixo do mínimo ou notas da SEFAZ esperando. **[proposta]** Um painel com
   alertas e um botão "conferir notas novas".
2. **Operações fiscais em excesso.** Há 41 opções iguais para entrada e saída, com
   erros de grafia ("EXPORTÇÃO", "ORDER DE SERVIÇOS", "EXTORNO"). **[proposta]**
   Filtrar pela direção e esconder o fiscal de quem não emite nota; usar motivos
   simples na saída (perda, consumo, doação, validade).
3. **Padrões errados:** a saída manual nasce com a operação **ENTRADA**; a "Ciência
   auto" aparece diferente na tela de importação e nos parâmetros.
4. **Fluxos em dois tempos.** Na devolução, é preciso salvar a entrada antes de
   importar a venda. Na transferência, o produto é digitado pelo número do ID. O
   relatório geral é só PDF, em nova aba. **[proposta]** Escolher a venda e devolver
   itens dela num passo só, buscar produto por nome ou código de barras e exportar CSV.
5. **Dependências escondidas.** A rotina automática da SEFAZ depende de um parâmetro de
   outra tela, e a manifestação fica "Ignorada" quando falta a série da NF-e (ver 13).
   **[proposta]** Um checklist de prontidão fiscal antes de ligar a SEFAZ.
6. **Senha guardada como parâmetro** para a saída de estoque. **[proposta]**
   Permissões por papel e aprovação do gerente com o login dele.
7. **Nomes inconsistentes:** "Pendente" nas telas e "Aberta" nos relatórios para o
   mesmo estado `0`.
8. **Kardex pobre em filtros:** sem filtro por operação, local, grade, usuário ou
   documento, e sem link para a origem.
9. **Nome técnico à vista:** "FrmXxx" debaixo do título de cada tela.

**O que vale copiar**

- KPIs da importação de XML (notas na SEFAZ, com XML, sincronização automática).
- Ligação automática dos itens da nota por GTIN ou referência, com cadastro automático
  do fornecedor.
- Custo sugerido pelo servidor ao lançar o item.
- Saldo anterior guardado no item do balanço.
- Baixa de estoque configurável: na finalização da venda ou na entrega.
- Log com saldo antes e depois e documento de origem.

## 7. Pendências

- **Detalhe dos documentos:** conferência, conclusão, cancelamento e estorno de entrada
  XML, entrada manual, saída, transferência e balanço; efeito no custo (médio ou
  último); geração de contas a pagar. Não houve como ver: a conta de teste não tem
  nenhum registro, e criar um seria gravar.
- **Relatórios em PDF:** `/entradas-xml/relatorio-geral` não abriu ("denied or
  failed"); `/entradas-manual/relatorio-geral` não foi tentado.
- **Ciência automática:** qual dos dois valores vale (tela de importação × parâmetro).
- **Perguntas gerais ainda sem resposta:**
  - se o estoque pode ficar negativo fora da venda (há "bloquear venda com estoque
    negativo" e uma opção de saldo negativo na pesquisa) e se isso é configurável por
    operação;
  - controle de lote e validade na prática (o parâmetro existe; nenhum campo de lote foi
    visto nas telas), número de série, venda por peso;
  - ficha técnica ou receita que baixe insumos ao vender (importante para
    alimentação); o parâmetro de produção só fala em lançar estoque na entrada e sobra;
  - custo médio ou último custo;
  - unidades de medida e conversão (ex.: caixa com 12);
  - estoque mínimo/máximo e alertas (a Central tem o relatório "estoque abaixo do
    mínimo", ver 21);
  - que permissões controlam cada ação (tudo foi visto como ADMIN);
  - como se troca a empresa ativa e o que muda nas telas de estoque.
- **Transferência, balanço e log:** perguntas em 2.5, 2.6 e 2.7.
- **Data de referência dos filtros:** data de entrada ou de emissão da NF; data da
  saída ou de emissão.
- **Bloqueio:** algumas tentativas do dia foram recusadas pelo classificador do modo
  automático do Claude Code ("Third-Party Attack"); não foi problema de credencial, e
  nada foi gravado ou clicado no ERP. Completar o que falta depende de o dono da conta
  autorizar a leitura (e, para ver detalhes, de uma conta com dados).

## 8. Sub-rotas descobertas

| Rota / endpoint | O que é | Estado |
| --- | --- | --- |
| `/entradas-xml/create`, `/entradas-xml/create?aba=manifestadas` | importação de XML e notas da SEFAZ | lidas |
| `/entradas-xml/relatorio-geral`, `/entradas-manual/relatorio-geral` | relatórios gerais em PDF | não abertos |
| `/entradas-manual/create`, `/saidas-manual/create`, `/transferencias/create`, `/balancos/create` | formulários "Novo" | lidos, sem salvar |
| POST `/entradas-xml/import` | envio do arquivo XML | visto na estrutura; não usado |
| POST `/entradas-xml/sync-manifestacao` | "Sincronizar agora" | visto na estrutura; não usado |
| GET `/lookups/produto/search` | busca da lupa de produto | visto no código |
| GET `/entradas-manual/produto/{id}`, `/saidas-manual/produto/{id}`, `/balancos/produto/{id}` | dados do produto ao lançar o item (custo/unitário sugerido, saldo) | visto no código; não chamado à mão |
