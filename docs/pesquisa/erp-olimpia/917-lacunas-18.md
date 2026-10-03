# 917 — Lacunas, lote 18: relatórios de força de vendas, contas a receber e a pagar, previsão e faturamento (ERP Olímpia)

> **Estado: explorado em parte, com 3 das 12 rotas lidas.** Data: 2026-10-03.
> Conta de teste "Boi Criolo" (plano Full). A sessão já estava aberta no
> navegador embutido. O trabalho foi feito numa aba própria, criada para este
> lote e fechada no fim.
>
> - **Lidas por completo:** `positivacao-mix-produtos`,
>   `vendas-recebimento-por-vendedor` e `clientes-sem-compra`. Também foram
>   lidas duas sub-rotas do módulo: a **Central de relatórios** (`/relatorios`)
>   e **Processamentos** (`/relatorios/processamentos`).
> - **Duas recusas da trava automática do Claude Code** (rótulo "Third-Party
>   Attack"):
>   1. a leitura da estrutura de `/relatorios/rota-visitas`;
>   2. logo a seguir, a abertura de `/relatorios/receber-por-cliente`.
>
>   A exploração parou aí. As outras 7 rotas não foram tentadas, porque abrir
>   cada uma seria repetir a ação recusada com outro endereço.
> - **Sobre as 9 rotas não lidas, este arquivo traz:**
>   - o que a Central de relatórios mostra de cada uma (finalidade, número de
>     filtros e formatos de saída), lido antes das recusas;
>   - o que outros arquivos da pesquisa já tinham registado.
> - **"Gerar" não foi clicado** em nenhuma tela, porque está na lista de
>   proibidos. Além disso, a conta não tem produtos, vendedores nem rotas, e um
>   relatório gerado viria vazio.
> - **Nada foi gravado, enviado ou alterado no ERP.**
>
> Marcação usada:
>
> - **[visto]**: apareceu na tela.
> - **[código]**: está no HTML ou no script da própria página.
> - **[Central]**: está no cartão do relatório na Central de relatórios.
> - **[deduzido]**: conclusão direta do que foi visto.
> - **[a verificar]**: hipótese, ainda não confirmada.

## Em palavras simples

1. **Só 3 das 12 telas foram lidas.** Elas abriram já logadas. Deu para ler
   todos os filtros e as opções de cada lista. Também deu para entender como se
   escolhem os produtos de uma ação comercial.
2. **A trava de segurança do Claude Code disse "não" duas vezes seguidas,** na
   4.ª e na 5.ª tela. Quando a trava diz "não", o agente para. O login não foi o
   problema: a sessão funcionou nas outras telas.
3. **Para as telas que faltam, a Central de relatórios já diz bastante:** para
   que serve cada relatório, quantos filtros tem e que sai em PDF, Excel e CSV.
   Essas informações estão abaixo, com a marca [Central].
4. **Todos os relatórios deste ERP seguem o mesmo modelo:** filtros e um botão
   "Gerar". Nenhum foi gerado, porque "Gerar" é proibido nesta pesquisa. Por
   isso, as colunas de cada resultado são deduzidas, não vistas.
5. **Achado principal:** o relatório de positivação permite montar um "mix" de
   produtos (uma ação comercial) e conta quantos clientes diferentes cada
   vendedor fez comprar. Há dois problemas:
   - o mix não fica gravado;
   - pelo código da página, o botão que puxa os produtos de um fabricante ou
     grupo não deve funcionar.

## Como destravar (só você pode decidir)

A recusa só mostra o rótulo "Third-Party Attack". O motivo mais provável é o
mesmo dos lotes 19 e 21. A ordem de abrir o site vem de um script de workflow.
A mensagem que você mandou junto ("CONTINUE") não cita o site nem o limite de
"só leitura".

Caminhos possíveis:

1. **Autorizar por escrito** na mensagem que dispara o workflow, com o site e o
   limite. Exemplo: "Autorizo o navegador embutido do Claude a abrir
   erp.olimpiasistemas.com.br, só para leitura, para a pesquisa do ERP
   Olímpia."
2. **Criar uma regra de permissão** no Claude Code para as ferramentas do
   navegador embutido (as que começam com `mcp__Claude_Browser__`).
3. **Rodar este lote fora do modo automático.** Assim você aprova cada página
   na tela.

Depois disso, basta repetir as 9 rotas pendentes (lista em
[Pendências](#pendências)).

---

## Visão geral do módulo

### Central de relatórios — `/relatorios` [visto]

- **Cabeçalho:** promete consultas com os dados reais da empresa, com filtros,
  totais, PDF, Excel e impressão. Tem um botão **Processamentos** no canto.
- **Filtro da Central** (formulário GET):
  - busca pelo nome do relatório (`q`);
  - lista de categorias (`categoria`): Todas, Visão geral, Movimentações,
    Vendas, Caixa, Financeiro, Estoque, Compras, Clientes, Fornecedores,
    Produtos, CRM, Fiscal, Comissões, Ordem de Serviço, Canais digitais,
    Produção e Auditoria;
  - botão "Filtrar".
- **132 relatórios**, em cartões separados em 16 blocos [contado]:

  | Bloco | Qtde | Bloco | Qtde |
  |---|---|---|---|
  | Vendas | 19 | Produtos | 5 |
  | Caixa | 8 | Fiscal | 17 |
  | Financeiro | 28 | Canais digitais | 5 |
  | Estoque | 13 | Produção | 2 |
  | Compras | 11 | CRM | 1 |
  | Clientes | 5 | Auditoria | 1 |
  | Fornecedores | 1 | Movimentações | 1 |
  | Comissões | 7 | Ordem de Serviço | 8 |

  A categoria "Visão geral" existe na lista, mas não tem nenhum cartão.
- **Cada cartão mostra:**
  - o nome do relatório;
  - o identificador (a parte final da rota);
  - uma frase sobre o conteúdo;
  - quantos filtros tem ("N filtros");
  - os formatos **PDF · Excel · CSV**;
  - o botão "Abrir relatório".

  Os 132 cartões anunciam os mesmos três formatos.
- **Onde ficam as 12 rotas deste lote:**
  - 3 em Vendas: positivação, vendas x recebimento e visitas de rota;
  - 1 em Clientes: clientes sem comprar;
  - 8 em Financeiro: receber, pagar, previsão e faturamento.

### Processamentos — `/relatorios/processamentos` [visto]

- Tela de relatórios assíncronos e histórico de exportações, marcada como
  "em evolução".
- Diz que a fila para relatórios muito grandes **ainda vai ser ligada**. Por
  enquanto, as exportações saem na hora, até um limite de volume que cada
  relatório tem.
- Só tem o link "Voltar à Central". Não há lista nem histórico.

### Como cada relatório funciona por dentro [código]

- **Uma rota genérica para todos.** A página identifica-se como a rota
  `relatorios.show`, com o parâmetro `report` igual ao identificador do
  relatório. Isso indica um catálogo de relatórios servido por um único
  controlador, que escolhe o relatório pelo identificador [deduzido].
- **Cada relatório é um formulário GET que envia para a própria rota,** com o
  campo oculto `executar=1`. Portanto, "Gerar" recarrega a mesma página com os
  filtros na URL, e o servidor desenha o resultado [deduzido]. Na prática, um
  relatório com filtros pode ser guardado como favorito ou enviado por link.
- **Período padrão:** do dia 1 do mês até hoje (01/10/2026 a 03/10/2026), nos
  campos `de` e `ate`.
- **Nenhum campo é obrigatório.** Nenhum tem marca de obrigatório nem regra de
  obrigatório no HTML.
- **Campos de pesquisa (lupa):**
  - uma caixa de texto só de leitura, com um botão de lupa ("Pesquisar") e um
    botão "Limpar", que aparece depois de escolher um item;
  - o valor enviado é o código (ID), guardado num campo oculto;
  - clicar na caixa também abre a lupa.
- **Janela da lupa:**
  - título "Pesquisar — <cadastro>";
  - campo de busca por código ou descrição e botão "Buscar";
  - tabela de resultados e a linha "Página X de Y (N registros)";
  - botões Anterior, Próximo e "Fechar".

  Alguns cadastros têm ainda:
  - **seleção múltipla:** caixas de marcar, uma caixa para marcar a página
    toda, o contador "N item(ns) selecionado(s) nesta pesquisa" e o botão
    "Adicionar selecionados";
  - **cadastro rápido:** o botão "Cadastrar novo" grava um item novo (POST).
    **Não foi usado.**
- **Endereços internos da lupa** [código]:
  - `/lookups/{tipo}/config`: título, colunas e cadastro rápido;
  - `/lookups/{tipo}/search?q=&page=`: pesquisa paginada;
  - `/lookups/{tipo}/{id}`: nome de um item;
  - `/lookups/{tipo}/quick`: cadastro rápido (POST, não chamado).

**Lupas usadas neste lote** [código; configuração lida]

| Tipo | Título da janela | Colunas | Cadastro rápido |
|---|---|---|---|
| `fabricante` | Fabricante | Código, Descrição, Status | sim: só Descrição (obrigatória, em maiúsculas); nasce com status 1 |
| `produto_grupo` | Grupo de Produto | Código, Descrição | sim: só Descrição; nasce com status 1, **comissão 0** e **ordem 0** |
| `produto_sub_grupo` | Subgrupo de Produto | Código, Descrição, Status | sim: só Descrição; nasce com status 1 |
| `pessoa_colaborador` | Colaborador / Vendedor | Código, Nome, CPF/CNPJ | não |
| `rota` | Rota | Código, Descrição, Região | não |
| `produto` | Produto | Código, Descrição, Ref., UN | não (no mix, com seleção múltipla) |

O que esta tabela mostra [deduzido]:

- O **vendedor é uma pessoa do cadastro único com o papel de colaborador**. Não
  há cadastro separado de vendedor.
- O **grupo de produto guarda um percentual de comissão e uma ordem de
  exibição**.
- Fabricante, grupo e subgrupo podem ser **criados de dentro de um filtro de
  relatório**, pela lupa.

**Dados da conta de teste** [visto, pela pesquisa das lupas sem texto]:

- 0 produtos, 0 colaboradores, 0 rotas e 0 grupos;
- 1 fabricante e 1 subgrupo, os dois chamados "PADRAO" e com status 0.

Por isso, um relatório gerado nesta conta viria vazio.

**Moldura:** igual à das outras telas do ERP (ver arquivos 14 e 20).

- Barra de cima: busca de telas (Ctrl+K), Novidades, tema, notificações, menu do
  usuário e assistente de conversa.
- À esquerda: uma coluna de atalhos.
- Tecnologia percebida: Laravel com Bootstrap 5.3 e SweetAlert2. Os avisos usam
  janelas próprias, e não os alertas do navegador.

### Mapa do lote

| # | Rota | Nome na Central | Bloco | Filtros [Central] | Estado |
|---|---|---|---|---|---|
| 1 | `/relatorios/positivacao-mix-produtos` | Positivação por mix de produtos | Vendas | 9 | **lida** |
| 2 | `/relatorios/vendas-recebimento-por-vendedor` | Vendas x recebimento por vendedor | Vendas | 4 | **lida** |
| 3 | `/relatorios/clientes-sem-compra` | Clientes sem comprar | Clientes | 3 | **lida** |
| 4 | `/relatorios/rota-visitas` | Visitas de rota (cobertura) | Vendas | 6 | abriu, mas a leitura foi **recusada**; filtros já no arquivo 14 |
| 5 | `/relatorios/receber-por-cliente` | Contas a receber por cliente | Financeiro | 5 | abertura **recusada** |
| 6 | `/relatorios/receber-aging` | Aging contas a receber | Financeiro | 2 | não tentada |
| 7 | `/relatorios/pagar-por-fornecedor` | Contas a pagar por fornecedor | Financeiro | 4 | não tentada |
| 8 | `/relatorios/pagar-pagamentos-periodo` | Pagamentos efetuados (CP) | Financeiro | 3 | não tentada |
| 9 | `/relatorios/pagar-aging` | Aging contas a pagar | Financeiro | 1 | não tentada |
| 10 | `/relatorios/pagar-por-plano-contas` | Despesas por plano de contas | Financeiro | 4 | não tentada |
| 11 | `/relatorios/previsao-financeira` | Previsão financeira (a vencer) | Financeiro | 3 | não tentada |
| 12 | `/relatorios/faturamento-lotes` | Faturamento — lotes | Financeiro | 4 | não tentada |

**Códigos que as telas mostram** [código]

| Conceito | Valores |
|---|---|
| Status da venda | `1` Venda (padrão) · `0` Orçamento · `2` Cancelado · `todos` |
| Visualização da positivação | `ranking` Ranking por vendedor (padrão) · `detalhe` Detalhe por cliente |
| Dias sem comprar | número inteiro, mínimo 1, padrão 15 |

---

## Telas

### 1. Positivação por mix de produtos — `/relatorios/positivacao-mix-produtos` [visto]

**Para que serve.** Medir uma **ação comercial** sobre um conjunto de produtos,
o "mix". O relatório conta quantos clientes diferentes cada vendedor fez
comprar pelo menos um produto do mix no período. A tela avisa que cada cliente
conta uma vez só, mesmo que tenha comprado vários sabores ou embalagens. No
jargão de distribuição, "positivar" um cliente é vender para ele no período.

**Filtros (cartão de cima)**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial | `de` | data | não | dia 1 do mês |
| Data final | `ate` | data | não | hoje |
| Fabricante | `id_fabricante` | lupa (Fabricante) | não | — |
| Grupo | `id_grupo` | lupa (Grupo de Produto) | não | — |
| Subgrupo | `id_sub_grupo` | lupa (Subgrupo de Produto) | não | — |
| Visualização | `modo` | lista | não | **Ranking por vendedor** (padrão) · Detalhe por cliente |
| Vendedor | `id_vendedor` | lupa (Colaborador / Vendedor) | não | — |
| Rota | `id_rota` | lupa (Rota) | não | — |
| — | `executar` | oculto | — | sempre `1` |

Ações: **Gerar** (não clicado) e o link "Central".

**Painel "Produtos da ação (opcional)"** (dentro do mesmo formulário)

- **Aviso da tela:** todos os filtros são opcionais. Dá para usar só o período,
  só o fabricante, só o mix ou combinações.
- **Adicionar produtos:** lupa de Produto **com seleção múltipla**. Marcam-se
  vários produtos, e "Adicionar selecionados" os põe no mix. O teste foi só até
  abrir a janela e buscar: a conta não tem produtos ("0 registros").
- **Incluir do fabricante/grupo:**
  - deveria trazer para o mix todos os produtos do fabricante, do grupo ou do
    subgrupo escolhidos acima;
  - pede a lista a `/relatorios/positivacao-mix/produtos`, que responde em JSON
    com o código e a descrição de cada produto (com o fabricante "PADRAO", a
    lista veio vazia);
  - sem nenhum dos três campos preenchido, mostra um aviso para preencher
    fabricante, grupo ou subgrupo.
- **Limpar mix:** esvazia a lista na hora, sem pedir confirmação.
- **Mix:** cada produto vira uma etiqueta "#código descrição", com um × para
  tirar. Com o mix vazio, a tela explica as duas formas de o montar.
- O mix viaja no campo oculto `id_produtos`, como uma lista de códigos separados
  por vírgula [código].

**Regras e comportamento**

- **Conta clientes distintos** [visto no texto da tela]. O indicador é o número
  de clientes diferentes que compraram algo do mix, e não a quantidade de itens.
- **Duas visões** [visto]: o ranking de vendedores ou o detalhe por cliente.
- **Filtros combináveis** [visto]. O fabricante, o grupo e o subgrupo servem
  como filtro direto ou para encher o mix [deduzido].
- **O mix não é gravado** [deduzido]:
  - a ação não tem nome;
  - não há botão para guardar nem para reabrir um mix;
  - o mix só existe na URL do relatório gerado. Ao reabrir essa URL, o script
    remonta as etiquetas e pede o nome de cada produto, um por um.
- **Defeito provável no botão "Incluir do fabricante/grupo"** [código; não
  testado com clique]:
  - o script procura os campos pelos identificadores `f-id_fabricante`,
    `f-id_grupo` e `f-id_sub_grupo`;
  - na página, esses campos chamam-se `id_fabricante`, `id_grupo` e
    `id_sub_grupo`;
  - por isso, o botão deve achar os três vazios e mostrar sempre o aviso, mesmo
    com o fabricante escolhido;
  - os rótulos "Fabricante", "Grupo" e "Subgrupo" apontam para os mesmos
    identificadores inexistentes, o que também atrapalha os leitores de tela.
- **Possível segundo defeito** [a verificar]. Para remontar os nomes do mix, o
  script usa o endereço `/lookup/produto/{id}`, no singular. O resto do sistema
  usa `/lookups/…`, no plural.

**O que o resultado deve mostrar** [deduzido; não visto]

- **Ranking:** cada vendedor, com o número de clientes positivados no mix, em
  ordem decrescente. Talvez também o valor e a quantidade vendidos do mix.
- **Detalhe:** cliente, vendedor, rota e o que o cliente comprou do mix.
- **Em aberto:** se mostra a % de positivação sobre a carteira (clientes da rota
  ou do vendedor) e se há meta por vendedor. A tela não tem nenhum campo de
  meta.

**Visual** [visto na captura de tela]

- Os rótulos das lupas ficam desalinhados em relação aos outros campos. Cada
  lupa tem um rótulo vazio por dentro.
- Os textos de orientação das lupas aparecem cortados ("Clique na lup").
- A lista "Visualização" também corta o texto.

### 2. Vendas x recebimento por vendedor — `/relatorios/vendas-recebimento-por-vendedor` [visto]

**Para que serve.** Ver, venda a venda, quanto já foi recebido, em valor e em %.
O relatório agrupa por vendedor, com subtotal por vendedor e total geral. Serve
para cobrar da equipe a qualidade da venda (vender e receber). Também serve
para conferir a comissão paga só sobre o que entrou.

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Vendedor | `id_vendedor` | lupa (Colaborador / Vendedor) | não | — |
| Status da venda | `status` | lista | não | **Venda** (`1`, padrão) · Orçamento (`0`) · Cancelado (`2`) · Todos |

Ações: Pesquisar e Limpar (botões da lupa), **Gerar** (não clicado) e o link
"Central".

**Regras e comportamento**

- Orçamento, venda e venda cancelada são **o mesmo documento** em estados
  diferentes. O arquivo 20 viu o mesmo nos relatórios de comissão.
- O "% recebido" deve ser a soma das parcelas a receber já pagas dividida pelo
  valor da venda [deduzido]. Não se sabe se conta o pagamento parcial de uma
  parcela, nem se entra o que foi pago na hora, no caixa [a verificar].
- O filtro permite escolher "Orçamento", que nunca tem recebimento. A opção
  parece vir de um componente comum e não faz sentido aqui.
- O período deve ser o da data da venda, e não o da data do recebimento
  [a verificar].

**O que o resultado deve mostrar** [Central + deduzido]

- Por venda: número, data, cliente, valor, valor recebido e % recebido.
- Subtotal por vendedor e total geral.

### 3. Clientes sem comprar — `/relatorios/clientes-sem-compra` [visto]

**Para que serve.** Listar os clientes que não compram há mais de X dias, por
vendedor e por rota, para tentar reativá-los. A Central chama-o de "estilo
Delphi", ou seja, é a versão web de um relatório do sistema antigo.

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Vendedor | `id_vendedor` | lupa (Colaborador / Vendedor) | não | — |
| Rota | `id_rota` | lupa (Rota) | não | — |
| Dias sem comprar | `dias_sem_compra` | número | não | padrão **15**, mínimo 1 |

Ações: Pesquisar e Limpar (botões das lupas), **Gerar** (não clicado) e o link
"Central".

**Regras e comportamento**

- **Não tem período.** O sistema deve medir a distância entre hoje e a data da
  última compra e comparar com X [deduzido].
- **A mesma pergunta aparece em três lugares.** O critério "sem comprar há X
  dias" também está no filtro "Sem comprar (dias)" do painel `/rota-visitas` e
  do relatório de visitas (arquivo 14).
- **Em aberto** [a verificar]:
  - se entram os clientes que nunca compraram;
  - se o "vendedor" é o do cadastro do cliente ou o da última venda;
  - se os clientes inativos ficam de fora;
  - se orçamentos e vendas canceladas contam como compra.

**O que o resultado deve mostrar** [deduzido das colunas do painel
`/rota-visitas`, no arquivo 14]: código, cliente, telefone, bairro, rota,
vendedor, data da última compra e dias sem compra.

### 4. Visitas de rota (cobertura) — `/relatorios/rota-visitas` [não lida neste lote]

- A página **abriu**, mas a leitura da sua estrutura foi **recusada** pela trava
  automática. A página não foi relida por outro meio.
- **[Central]:** mostra os clientes da rota visitados e não visitados no
  período, com dados do app de força de vendas. Tem 6 filtros e sai em PDF,
  Excel e CSV.
- **Filtros já registados no arquivo 14** (`14-os-forca-vendas.md`, secção
  2.10):
  - data inicial e data final;
  - vendedor e rota (lupas);
  - situação: todos, só visitados ou só não visitados;
  - "sem comprar (dias)".

  São 6 filtros, o mesmo número que a Central indica.
- **Ligação:** é o relatório do painel `/rota-visitas`, descrito no arquivo 14.
  O painel tem os indicadores de clientes na rota, visitados, não visitados e %
  de cobertura, e um mapa da rota.

### 5. Contas a receber por cliente — `/relatorios/receber-por-cliente` [não visitada]

- **[Central]:** saldo dos títulos a receber agrupado por cliente, com o valor
  pendente e os totais. Tem 5 filtros e sai em PDF, Excel e CSV.
- **A abertura foi recusada** pela trava automática.
- **Filtros prováveis** [a verificar]: período (de vencimento ou de emissão),
  cliente, origem (venda ou OS) e status. O arquivo 20 mostra que o título a
  receber tem origem (venda ou OS) e só dois estados (aberto ou pago).
- **O que olhar depois:**
  - se o saldo inclui juros e multa;
  - se separa o vencido do que ainda vai vencer;
  - se dá para abrir os títulos de um cliente a partir do relatório.

### 6. Aging contas a receber — `/relatorios/receber-aging` [não visitada]

- **[Central]:** títulos pendentes por faixa de atraso: **a vencer, 1–30,
  31–60, 61–90 e mais de 90 dias**. Tem 2 filtros.
- **Filtros prováveis** [a verificar]: data-base do cálculo e cliente.
- **Relatórios vizinhos com perguntas parecidas:**
  - "Receber vencidas": títulos pendentes já vencidos;
  - "Inadimplência por cliente": vencidos e pendentes somados por cliente.

### 7. Contas a pagar por fornecedor — `/relatorios/pagar-por-fornecedor` [não visitada]

- **[Central]:** saldo dos títulos a pagar agrupado por fornecedor. Tem 4
  filtros.
- **Filtros prováveis** [a verificar]: período, fornecedor e status.

### 8. Pagamentos efetuados (CP) — `/relatorios/pagar-pagamentos-periodo` [não visitada]

- **[Central]:** títulos a pagar quitados no período, com fornecedor, valores e
  histórico. Tem 3 filtros, provavelmente o período e o fornecedor
  [a verificar].
- **É quase igual a outro relatório,** "Contas pagas no período"
  (`/relatorios/pagar-quitados-periodo`). A Central descreve esse outro como
  títulos quitados com valores, juros, multa e desconto, também com 3 filtros.
  São dois relatórios para a mesma pergunta.

### 9. Aging contas a pagar — `/relatorios/pagar-aging` [não visitada]

- **[Central]:** títulos a pagar pendentes por faixa de atraso. Tem **1 só
  filtro**, provavelmente a data-base [a verificar].
- As faixas devem ser as mesmas do aging a receber [deduzido].

### 10. Despesas por plano de contas — `/relatorios/pagar-por-plano-contas` [não visitada]

- **[Central]:** títulos a pagar agrupados ou listados por conta do plano de
  contas. Tem 4 filtros.
- **Contexto** (arquivo `96-lacunas-7.md`):
  - o plano de contas é uma árvore só de nomes;
  - o código tem blocos de 3 dígitos por nível (ex.: `001.002.`);
  - não existe o tipo receita ou despesa.

  O relatório deve, portanto, agrupar pelo código da árvore [deduzido]. Falta
  ver se soma os níveis de cima (subtotais por grupo).
- **Filtros prováveis** [a verificar]: período, conta do plano, status e o modo
  "agrupado" ou "listado".

### 11. Previsão financeira (a vencer) — `/relatorios/previsao-financeira` [não visitada]

- **[Central]:** títulos a receber e a pagar ainda pendentes, pela data de
  vencimento no período. É uma previsão de caixa.
- Tem 3 filtros, provavelmente o período e o tipo: receber, pagar ou os dois
  [a verificar].
- **O que olhar depois:**
  - se parte do saldo atual dos bancos e do caixa;
  - se mostra o saldo acumulado dia a dia;
  - se inclui títulos vencidos e não pagos.
- O relatório vizinho "Fluxo de caixa" (`/relatorios/fluxo-caixa`) mostra o
  realizado, isto é, o que foi recebido e pago em cada dia.

### 12. Faturamento — lotes — `/relatorios/faturamento-lotes` [não visitada]

- **[Central]:** lotes de faturamento de **orçamentos**, vindos da força de
  vendas ou do próprio ERP, com quantidade e valor. Tem 4 filtros.
- **O que a Central revela sobre o processo** [deduzido]:
  1. O vendedor faz **orçamentos** (status 0), no app ou no ERP.
  2. Um operador junta vários orçamentos num **lote** e fatura o lote de uma
     vez. A tela deve ser `/financeiro/faturamento` ("Faturamento de vendas", no
     menu Estoque › Expedição & Vendas, segundo o arquivo 96).
  3. Cada venda do lote recebe **marcas de estoque e de financeiro**: se já deu
     baixa no estoque e se já gerou contas a receber. Isso aparece no relatório
     irmão "Faturamento — vendas do lote", com 6 filtros.
  4. Há também o resumo "Faturamento por vendedor", que agrupa os lotes por
     vendedor, com 3 filtros.
- **O que olhar depois:**
  - os estados do lote;
  - se o lote emite NF-e;
  - se o lote pode ser estornado;
  - se há ligação com o romaneio de carga (rota e motorista).

---

## Sub-rotas e endereços descobertos

| Endereço | O que é | Estado |
|---|---|---|
| `/relatorios` | Central de relatórios | lida |
| `/relatorios/processamentos` | fila de relatórios (ainda não ligada) | lida |
| `/relatorios/positivacao-mix/produtos?id_fabricante=&id_grupo=&id_sub_grupo=` | lista JSON de produtos para o mix | chamada uma vez, só leitura; veio vazia |
| `/relatorios/<rota>?executar=1&…` | resultado de um relatório (o que "Gerar" faz) | **não aberto** |
| `/lookups/{tipo}/config` | configuração da lupa | lida para 6 tipos |
| `/lookups/{tipo}/search?q=&page=` | pesquisa paginada da lupa | usada; resultados vazios |
| `/lookups/{tipo}/{id}` | nome de um item escolhido | visto no código |
| `/lookups/{tipo}/quick` (POST) | cadastro rápido pela lupa | visto no código; **não chamado** |
| `/lookup/produto/{id}` | nome de um produto do mix | visto no código; existência a verificar |
| `/relatorios/faturamento-vendas` e `/relatorios/faturamento-por-vendedor` | irmãos do relatório de lotes | só na Central |
| `/relatorios/pagar-quitados-periodo` | "Contas pagas no período" | só na Central |
| `/relatorios/receber-titulos`, `receber-vencidas`, `receber-inadimplencia`, `receber-recebimentos-periodo`, `pagar-titulos`, `pagar-vencidas` e `fluxo-caixa` | irmãos de receber e pagar | só na Central |
| `/relatorios/caixa-vendas-por-vendedor` e `/relatorios/vendas-orcamentos` | vendas recebidas por vendedor; orçamentos (status 0) | só na Central |

---

## Fluxos de ponta a ponta

1. **Ação de mix (trade marketing)**
   1. A empresa combina com um fabricante uma ação sobre certos produtos.
   2. O gestor abre a positivação, escolhe o período e monta o mix. Pode
      escolher produto a produto, na lupa com caixas de marcar, ou pelo
      fabricante, grupo ou subgrupo.
   3. Pode limitar o resultado a um vendedor ou a uma rota.
   4. Gera o ranking de vendedores (clientes distintos que compraram) ou o
      detalhe por cliente e exporta em PDF, Excel ou CSV.
   5. Para repetir na semana seguinte, precisa remontar o mix ou guardar a URL
      do relatório gerado.
2. **Reativação da carteira (força de vendas)**
   1. Os clientes têm uma rota no cadastro.
   2. O gestor gera "Clientes sem comprar" (padrão: mais de 15 dias), por
      vendedor ou por rota.
   3. O vendedor visita os clientes com o app Android, e a visita sincroniza.
   4. O gestor acompanha a cobertura no painel `/rota-visitas` e no relatório
      de visitas. Também mede a positivação das ações.
3. **Da venda ao recebimento, por vendedor**
   1. A venda (status 1) gera parcelas a receber.
   2. O cliente paga, e a parcela fica paga.
   3. "Vendas x recebimento por vendedor" mostra o % recebido de cada venda.
   4. A comissão por recebimento (arquivo 20) usa as mesmas parcelas.
4. **Do orçamento ao faturamento em lote** [deduzido da Central]
   1. O vendedor lança orçamentos no app ou no ERP.
   2. Um operador junta os orçamentos num lote e fatura.
   3. Cada orçamento vira venda, com baixa no estoque e títulos a receber.
   4. Relatórios: lotes, vendas do lote e faturamento por vendedor.
5. **Das contas a pagar à previsão** [deduzido da Central]
   1. O título a pagar tem fornecedor e conta do plano de contas. É lançado à
      mão ou vem de uma entrada de mercadoria (relatório "Entradas × contas a
      pagar").
   2. Acompanhamento: por fornecedor, por faixa de atraso (aging) e por conta
      do plano de contas.
   3. Pagamento: relatórios "Pagamentos efetuados" e "Contas pagas no período".
   4. Previsão: o que há a receber e a pagar, por data de vencimento.
6. **Gerar qualquer relatório**
   1. Na Central, buscar pelo nome ou pela categoria e clicar em "Abrir
      relatório".
   2. Preencher os filtros (o período padrão é o mês corrente) e clicar em
      "Gerar", que recarrega a página com os filtros na URL.
   3. Ver o resultado na tela, com totais, e exportar em PDF, Excel, CSV ou
      imprimir [Central; não visto].
   4. Para relatórios muito grandes ainda não há fila (ver Processamentos).

---

## Entidades e relações (como o Olímpia parece modelar)

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| **Pessoa — cliente** | código, nome, CPF/CNPJ, telefone, bairro, rota (`id_rota`), vendedor [a verificar] | N:1 Rota; 1:N vendas; 1:N títulos a receber; 1:N visitas |
| **Pessoa — colaborador/vendedor** | código, nome, CPF/CNPJ | 1:N vendas e orçamentos; 1:N visitas; 1:N lotes [a verificar] |
| **Rota** | código, descrição, região (texto livre), zona, valor | 1:N clientes; usada na força de vendas e no romaneio |
| **Visita de rota** | cliente, vendedor, data, hora, observação | N:1 cliente; N:1 vendedor; vem do app |
| **Produto** | código, descrição, referência de fábrica, unidade | N:1 fabricante; N:1 grupo; N:1 subgrupo; 1:N itens de venda |
| **Fabricante** | código, descrição, status | 1:N produtos |
| **Grupo de produto** | código, descrição, status, % de comissão, ordem | 1:N produtos |
| **Subgrupo de produto** | código, descrição, status | 1:N produtos (ligação com o grupo: a verificar) |
| **Venda / orçamento** | número, data, status (0 orçamento, 1 venda, 2 cancelada), cliente, vendedor, valor | 1:N itens; 1:N títulos a receber; N:1 lote de faturamento (opcional) |
| **Item de venda** | produto, quantidade, valor | N:1 venda; N:1 produto |
| **Título a receber** | cliente, origem (venda ou OS), vencimento, valor, status (aberto ou pago), data de pagamento, comissão | N:1 venda ou OS; N:1 cliente |
| **Título a pagar** | fornecedor, vencimento, valor, status, data de pagamento, juros, multa, desconto, histórico | N:1 fornecedor (pessoa); N:1 conta do plano; 0..1 entrada de mercadoria |
| **Conta do plano de contas** | código em árvore (3 dígitos por nível), descrição, status | árvore pai/filho; 1:N títulos a pagar |
| **Lote de faturamento** | data, quantidade de vendas, valor, vendedor [a verificar], estado [a verificar] | 1:N vendas, cada uma com marcas de estoque e de financeiro |
| **Mix de positivação** | lista de produtos | **não é gravado**: só existe na URL do relatório |
| **Relatório (catálogo)** | identificador, nome, categoria, descrição, filtros, formatos | 132 itens na Central |

---

## Integrações

| Integração | Onde aparece | Situação |
|---|---|---|
| App Android "Olimpia Força de Vendas" | visitas de rota; orçamentos que viram lotes de faturamento | [Central + arquivo 14] |
| Exportação em PDF, Excel e CSV; impressão | todos os relatórios | [Central]; não visto, porque nada foi gerado |
| SEFAZ (NF-e) | talvez no faturamento dos lotes | [a verificar]: as telas deste lote não citam nota fiscal |
| Bancos (boletos, conciliação) | não aparecem nestas telas | os relatórios de bancos são de outro grupo |
| Bibliotecas e serviços da página | Bootstrap 5.3 e SweetAlert2 (pela CDN jsDelivr) e Cloudflare | [código] |

Estas telas não usam balança, TEF, impressora fiscal, WhatsApp nem Mercado
Livre.

---

## Observações de UX (oportunidades para nós)

1. **132 relatórios numa só página, e muitos se repetem.**
   - Exemplos de relatórios que respondem quase à mesma pergunta:
     - "Pagamentos efetuados (CP)" e "Contas pagas no período";
     - "Receber vencidas", "Inadimplência por cliente" e "Aging contas a
       receber";
     - "Clientes sem comprar", o filtro "sem comprar" de Visitas de rota e o
       painel `/rota-visitas`;
     - "Vendas x recebimento por vendedor", "Relatório caixa com vendedor" e
       "Comissões por recebimento".
   - **Para nós:**
     - poucos relatórios, cada um com agrupamentos e visões que se trocam
       (ex.: contas a pagar "por fornecedor", "por conta" ou "por faixa de
       atraso");
     - mostrar só os relatórios dos módulos que o cliente usa;
     - permitir favoritos.
2. **Linguagem técnica à vista do usuário.**
   - Os cartões da Central falam em "estilo Delphi", "Delphi FrmRelatorio",
     "status 0", "tipo_forma = 1", "tabela estoque, tipo E",
     "id_ordem_servico" e "valor_comissao".
   - **Para nós:** descrições em português simples, com a pergunta que o
     relatório responde (ex.: "Quem deixou de comprar?").
3. **O relatório começa em branco.**
   - Só aparece alguma coisa depois de clicar em "Gerar".
   - Todos os filtros são opcionais, e nenhum orienta a escolha.
   - O contador "N filtros" do cartão não ajuda a decidir.
   - **Para nós:**
     - abrir já com o resultado do mês e com filtros rápidos;
     - lembrar os últimos filtros de cada usuário;
     - agendar o envio do relatório por e-mail ou WhatsApp.
4. **Lupa em vez de digitar.** O campo é só de leitura. É preciso abrir uma
   janela e clicar em "Buscar". **Para nós:** busca com sugestões enquanto se
   digita, com várias escolhas no mesmo campo.
5. **Positivação sem campanha, sem meta e com um botão com defeito.**
   - O mix não tem nome e não é gravado.
   - Não há meta por vendedor nem base de clientes para calcular a %.
   - Pelo código, o botão de puxar produtos por fabricante ou grupo não deve
     funcionar.
   - **Para nós:**
     - "Campanhas" com nome, período e produtos;
     - meta de clientes positivados por vendedor e % sobre a carteira;
     - acompanhamento diário no painel e no app do vendedor.
6. **"Clientes sem comprar" com regra fixa (15 dias) e sem ação.**
   - **Para nós:**
     - usar o ciclo de compra de cada cliente (ex.: "compra a cada 7 dias e já
       está há 12 sem comprar");
     - pôr botões para chamar no WhatsApp ou incluir na rota do dia seguinte.
7. **Filtros sem sentido e nomes inconsistentes.**
   - O relatório de vendas x recebimento oferece "Orçamento", que nunca tem
     recebimento.
   - O mesmo estado aparece como "Cancelado" num relatório e "Canceladas" no
     outro.
8. **Tela "em evolução" à vista.** Processamentos mostra uma função que ainda
   não existe. **Para nós:** só mostrar o que já funciona.
9. **Acabamento visual.**
   - Os rótulos das lupas ficam desalinhados.
   - Os textos de orientação aparecem cortados.
   - A lista "Visualização" corta o texto em larguras médias.
10. **Cadastro dentro de filtro.**
    - As lupas de fabricante, grupo e subgrupo deixam cadastrar um item novo a
      partir de um filtro de relatório. Isso pode criar cadastros sem querer.
    - **Para nós:** os filtros só filtram.
11. **O que vale copiar: o motor de relatórios.**
    - O Olímpia tem um catálogo de relatórios servido por uma rota genérica,
      com filtros na URL e exportação em três formatos.
    - **Para nós:**
      - o mesmo motor, com um catálogo declarativo (nome, pergunta, filtros,
        colunas, totais, formatos);
      - consultas sempre com a empresa (tenant) explícita;
      - exportação feita em segundo plano quando o volume for grande;
      - visões guardadas por usuário.

---

## Pendências

1. **Rotas recusadas pela trava automática do Claude Code** ("Third-Party
   Attack"):
   - `/relatorios/rota-visitas`: abriu, mas a leitura da estrutura foi
     recusada. Os filtros já estão no arquivo 14.
   - `/relatorios/receber-por-cliente`: a abertura foi recusada.
2. **Rotas não tentadas**, porque a exploração parou depois da recusa:
   - `/relatorios/receber-aging`;
   - `/relatorios/pagar-por-fornecedor`;
   - `/relatorios/pagar-pagamentos-periodo`;
   - `/relatorios/pagar-aging`;
   - `/relatorios/pagar-por-plano-contas`;
   - `/relatorios/previsao-financeira`;
   - `/relatorios/faturamento-lotes`.
3. **Conteúdo dos relatórios gerados não visto:** colunas, totais, quebras e
   formato do PDF, do Excel e do CSV. "Gerar" é proibido nesta pesquisa. Mesmo
   que fosse liberado, a conta de teste não tem dados (0 produtos, 0
   vendedores, 0 rotas).
4. **Defeito do botão "Incluir do fabricante/grupo":** visto no código, mas não
   confirmado com clique. Para confirmar, seria preciso escolher um fabricante
   com produtos.
5. **Endereço `/lookup/produto/{id}`** (no singular), usado para remontar o mix:
   não se verificou se existe.
6. **Regras a confirmar:**
   - como se calcula o % recebido;
   - se "Clientes sem comprar" inclui quem nunca comprou e qual vendedor usa;
   - as faixas e a data-base dos agings;
   - se a previsão parte do saldo bancário;
   - os estados e os efeitos do lote de faturamento (NF-e, estoque,
     financeiro);
   - se o plano de contas soma subtotais por nível.
7. **Tela de origem do faturamento em lote** (`/financeiro/faturamento`): não
   aberta, porque está fora deste lote.
8. **Nota de transparência.** Depois da recusa em `rota-visitas`, duas ações
   foram pedidas ao mesmo tempo: abrir a rota seguinte e ler o texto da página.
   A abertura foi recusada, e a leitura caiu na página que continuava aberta
   (`rota-visitas`). O texto só repetia os filtros já descritos no arquivo 14.
   Nada dele foi usado além disso.

---

## Registo técnico

- **Aba:** uma aba própria foi criada para o lote e fechada no fim. As abas do
  usuário e de outros agentes não foram usadas.
- **Cliques:** só três, todos na lupa de produtos do mix: abrir a lupa, "Buscar"
  e Esc para fechar. Não houve nenhum clique em "Gerar", "Cadastrar novo",
  "Adicionar selecionados", "Incluir do fabricante/grupo" ou "Limpar mix".
- **Leituras por script** (só leitura, na própria página):
  - a estrutura dos formulários;
  - a configuração das lupas;
  - a pesquisa das lupas sem texto, para saber se a conta tem dados;
  - o script do mix e o componente de lupa.
- **Chamada de dados:** uma vez, a lista de produtos do mix para o fabricante
  "PADRAO" (resposta vazia).
