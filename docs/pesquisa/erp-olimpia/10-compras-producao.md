# 10 — Compras, produção e desossa (ERP Olímpia)

> Cobre os módulos Compras (painel, solicitações, cotações, pedidos), Produção (painel e
> ordens) e as sete telas de desossa. Exploração de 2026-10-03, conta de teste "Boi
> Criolo" (plano Full), perfil ADMIN. Só duas telas de compras foram vistas, de
> passagem, durante a leitura dos relatórios; o resto ficou bloqueado. Por isso grande
> parte deste documento são perguntas, marcadas como tal.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual], [código]
> (lido no HTML/JS da página), [proposta]; "a verificar" = pergunta aberta.
> Nada foi gravado no ERP.

## 1. Visão geral

### 1.1 Onde fica

- **Menu [visto]:** secção "Operações" do menu lateral (Cadastros, Sinuca, Estoque,
  Produção, Compras).
  - **Compras** tem os itens Dashboard, Solicitações, Cotações e Pedidos de Compra.
    Não há item de aprovação nem de recebimento.
  - **Produção** tem **9 itens**. As rotas conhecidas do grupo são `/producao/ordens`,
    as 7 de desossa e `/producao/sped-bloco-k`, que somam 9 [deduzido; a lista exata
    dos itens não foi lida]. O SPED bloco K ("SPED Fiscal / Contribuições") fica em
    [13-fiscal.md](13-fiscal.md).
- **Plano [visto]:** "Produção" e "Compras e Suprimentos" estão entre os 36 módulos do
  plano Full; o resumo do Full cita "compras" entre o que só ele tem (planos em
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).
- **Manual [afirmado pelo manual]:** o cartão "Compras e Suprimentos" (`mod-compras`,
  3 passos) diz: solicitação com itens; cotação com fornecedores; recebimento ligado à
  entrada da NF e ao financeiro. O subtítulo descreve solicitação → cotação → aprovação
  → pedido → recebimento. **Produção não tem cartão** no manual. Ver
  [22-manual.md](22-manual.md).
- **Contexto do ramo [visto]:** o cadastro da empresa oferece as subcategorias
  "Açougue" e "Casa de Carnes" (ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)), o público natural da
  desossa.

### 1.2 O que se sabe por outras telas

- **Compras = entradas nos relatórios [visto].** Nos relatórios "Compras por
  fornecedor", "Compras por período" e "Evolução de custos", "compras" quer dizer
  **entradas de mercadoria** (notas lançadas em `/entradas-xml` e `/entradas-manual`,
  ver [09-estoque.md](09-estoque.md)), não pedidos.
- **Estados do pedido de compra [visto no relatório "Pedidos de compra"]:** `aberto`,
  `parcial`, `recebido`, `cancelado`, guardados como **texto**, e não como números
  (0, 1, 2) como nos documentos herdados do Delphi. Isso sugere que o módulo de
  pedidos é mais novo, feito para a web [deduzido]. Parcial = parte dos itens já
  chegou; Recebido = chegou completo [deduzido].
- **Relatórios só na Central [visto como cartão]:** `compras-cotacoes` (cotações por
  fornecedor: valor, prazo e status; 4 filtros), `compras-solicitacoes` (solicitações
  de compra; 4 filtros), `producao-ordens` (ordens de produção; 4 filtros) e
  `producao-insumos` (insumos previstos e consumidos; 3 filtros). O último indica que a
  ordem de produção tem insumos **previstos** e **consumidos** [deduzido]. A categoria
  "Produção" da Central tem só estes 2 relatórios. Catálogo em
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md) e relatórios
  de compras em
  [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md).
- **Parâmetro de produção [visto]:** na aba Parâmetros da empresa, grupo Estoque, "a
  produção lança estoque na entrada" (ligado) e pode "lançar sobra" (ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)).
- **Desossa:** nada foi visto em nenhuma tela.

### 1.3 Rotas e estado

As recusas foram do classificador do modo automático do Claude Code ("Third-Party
Attack"); não houve problema de credencial.

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/compras` | Lançador de compras | não aberta: navegação recusada |
| `/compras` | Painel de compras | lida (de passagem, durante os relatórios) |
| `/compras/solicitacoes` | Solicitações de compra | não aberta |
| `/compras/cotacoes` | Cotações | não aberta |
| `/compras/pedidos` | Pedidos de compra | lida (de passagem; lista vazia) |
| `/dashboard/modulo/producao` | Lançador de produção | não aberta |
| `/producao/ordens` | Ordens de produção | não aberta |
| `/producao/desossas/nova` | Nova desossa | não aberta |
| `/producao/desossas` | Desossas (lista) | não aberta |
| `/producao/desossa-fichas` | Fichas de desossa | **recusada** pelo classificador |
| `/producao/desossas-relatorios` | Relatórios de desossa | não aberta |
| `/producao/desossas-produtos-derivados` | Produtos derivados | não aberta |
| `/producao/desossas-rendimentos` | Rendimentos | não aberta |
| `/producao/desossa-config` | Configuração da desossa | não aberta |

## 2. Telas

### 2.1 `/dashboard/modulo/compras` — Lançador de compras [não aberta]

- **Já se sabe:** o menu de Compras tem Dashboard, Solicitações, Cotações e Pedidos de
  Compra.
- **Ver na próxima visita:** cartões, indicadores e itens de menu; se é o mesmo que
  `/compras`.

### 2.2 `/compras` — Painel de compras [visto]

- Mostra o fluxo do módulo: **Solicitação → Cotação → Aprovação → Pedido →
  Recebimento**.
- Atalhos: Nova solicitação, Cotações e Pedidos.
- Blocos: Solicitações recentes, Cotações abertas e Pedidos. Todos vazios.
- A verificar: se há indicadores com dados reais; para onde leva "Nova solicitação".

### 2.3 `/compras/solicitacoes` — Solicitações de compra [não aberta]

- **Já se sabe:** a solicitação tem itens e quantidades e origina a cotação (painel e
  manual); existe o relatório `compras-solicitacoes` (só na Central).
- **Ver:** quem pede; itens; aprovação; estados; se vira cotação e como.

### 2.4 `/compras/cotacoes` — Cotações [não aberta]

- **Já se sabe:** cotação com fornecedores (manual); o relatório `compras-cotacoes`
  mostra cotações por fornecedor com valor, prazo e status; a aprovação da cotação gera
  o pedido [deduzido do painel].
- **Ver:** fornecedores consultados; preço por item; comparação; escolha do vencedor
  (por item ou pelo total) e quem escolhe; onde fica a "Aprovação" (não há tela própria
  no menu); se vira pedido.

### 2.5 `/compras/pedidos` — Pedidos de compra [visto]

- **Colunas:** Número, Fornecedor, Status, Total e Previsão. Lista vazia.
- **Não há botão "Novo" nem filtros.** O pedido nasce da cotação aprovada [deduzido do
  fluxo do painel].
- Estados (pelo relatório): aberto, parcial, recebido, cancelado (1.2).
- A verificar: prazo e condição de pagamento; detalhe do pedido; como o recebimento
  (parcial ou total) se liga às entradas (XML da NF-e ou manual), ao estoque e ao
  contas a pagar; o manual afirma que o recebimento é ligado à entrada da NF e ao
  financeiro.

### 2.6 `/dashboard/modulo/producao` — Lançador de produção [não aberta]

- **Já se sabe:** o menu de Produção tem 9 itens (1.1), incluindo o SPED bloco K.
- **Ver:** cartões e menu completos; se há indicadores.

### 2.7 `/producao/ordens` — Ordens de produção [não aberta]

- **Já se sabe:** existe o relatório `producao-ordens` e o `producao-insumos` (insumos
  previstos e consumidos); o parâmetro "a produção lança estoque na entrada" e "lançar
  sobra".
- **Ver:** produto e quantidade; de onde vem a receita ou ficha técnica; como os
  insumos saem do estoque (baixa); perdas; custo; estados da ordem.

### 2.8 `/producao/desossas/nova` — Nova desossa [não aberta]

- **Ver (só ler, sem salvar):** peça de entrada (carcaça ou quarto, peso, custo, lote,
  fornecedor); cortes de saída com peso; uso de balança ou digitação; rendimento (%) e
  rateio do custo por corte (por peso ou por valor de venda); ossos, sebo e aparas
  (produtos derivados ou perda); se a ficha preenche a desossa.

### 2.9 `/producao/desossas` — Desossas (lista) [não aberta]

- **Ver:** colunas, filtros, totais, estados e o que mostra ao abrir um registro.

### 2.10 `/producao/desossa-fichas` — Fichas de desossa [recusada]

O nome sugere modelos de desossa (cortes e rendimento esperados por tipo de peça); não
confirmado.

- **Ver:** lista (colunas, filtros, ativo/inativo); formulário: peça de entrada
  (produto; carcaça, quarto dianteiro ou traseiro, peça), cortes esperados com
  rendimento (%) e tolerância, ordem dos cortes, observações.
- **Regras a confirmar:** se a soma dos percentuais tem de fechar 100% (contando a
  perda); se a ficha preenche a desossa nova; se existe versão ou histórico da ficha.

### 2.11 `/producao/desossas-relatorios` — Relatórios de desossa [não aberta]

- **Ver:** que relatórios existem; filtros (período, fornecedor, lote, ficha, peça,
  operador); saída (tela, PDF, planilha).
- O que somam: peso de entrada, peso dos cortes, perda (quebra), rendimento real ×
  esperado, custo por kg de cada corte, margem; comparação por fornecedor ou por lote.

### 2.12 `/producao/desossas-produtos-derivados` — Produtos derivados [não aberta]

O nome sugere os produtos que saem de cada peça (cortes, osso, sebo, apara).

- **Ver:** se liga a peça de entrada aos produtos de saída; campos (produto de origem,
  produto derivado, percentual esperado, se recebe custo, se entra no estoque); como
  trata osso, sebo, apara e quebra (subproduto com valor, sem valor ou perda).

### 2.13 `/producao/desossas-rendimentos` — Rendimentos [não aberta]

- **Ver:** se é cadastro (rendimento padrão de cada corte) ou relatório (rendimento
  real por desossa, fornecedor ou lote); fórmulas; alerta quando o rendimento foge do
  esperado.

### 2.14 `/producao/desossa-config` — Configuração da desossa [não aberta]

- **Ver (só ler, sem mudar interruptores):** método de custo dos cortes (rateio pelo
  peso ou pelo valor de venda); local de estoque de entrada e de saída; movimento de
  estoque automático; balança; etiqueta (peso, validade, lote, código de barras);
  numeração de lote; tolerância de perda.

## 3. Fluxos de ponta a ponta

1. **Compra [painel visto; resto deduzido ou afirmado pelo manual]:**
   1. Alguém pede a compra (solicitação, com itens e quantidades).
   2. Cotação com um ou mais fornecedores (valor total, prazo, status).
   3. Aprovação (sem tela própria no menu) → **pedido** (aberto, com previsão de
      entrega).
   4. Recebimento: a nota do fornecedor entra pelo XML da NF-e (com chave) ou à mão e
      vira uma **entrada** (Pendente/Aberta → Concluída), ver 09. Se faltar
      mercadoria, o pedido fica "parcial"; se vier tudo, "recebido".
   5. A entrada concluída soma no estoque (kardex tipo E), grava o custo do item e gera
      contas a pagar (a Central tem "Entradas × contas a pagar"; ver 11).
   6. Relatórios: pedidos, compras por fornecedor, por produto, evolução de custos
      (ver 21).
2. **Produção [a verificar]:** ordem de produção → baixa dos insumos (previstos ×
   consumidos) → entrada do produto pronto no estoque (parâmetro "lança estoque na
   entrada") e, se houver, da sobra.
3. **Desossa [a verificar; perguntas, não factos]:** ficha → desossa nova (peça de
   entrada com peso e custo, vinda de uma compra) → cortes e derivados pesados →
   rendimento e custo de cada corte → entrada no estoque → relatórios e rendimentos.

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
| --- | --- | --- |
| Solicitação de compra | itens, quantidades, status [deduzido] | origina a cotação |
| Cotação | fornecedor, valor total, prazo, status [deduzido da Central] | aprovada → pedido |
| Pedido de compra | número, fornecedor, status (`aberto`, `parcial`, `recebido`, `cancelado`), total, previsão [visto] | o recebimento gera uma ou mais entradas (ver 09) [deduzido] |
| Ordem de produção | insumos previstos e consumidos [deduzido da Central] | baixa insumos; dá entrada no produto (parâmetro) |

**Candidatas, só pelo nome das rotas (nada visto):** ficha de desossa, desossa
(com cortes), produto derivado, rendimento (cadastro ou relatório), configuração de
desossa.

## 5. Integrações

- Nenhuma observada nestas telas.
- A verificar: balança e impressora de etiquetas (desossa); SPED bloco K (produção e
  estoque, ver 13); ligação do pedido de compra com a entrada por XML da NF-e (ver 09)
  e com o contas a pagar (ver 11).

## 6. Oportunidades de UX

- **Pedidos sem botão "Novo" nem filtros.** Quem não conhece o fluxo não sabe criar
  um pedido. **[proposta]** Explicar o caminho na lista vazia e permitir pedido direto,
  sem cotação, para o pequeno comerciante.
- **Fluxo prometido sem telas.** O painel e o manual falam em "Aprovação" e
  "Recebimento", mas não há itens de menu para essas etapas.
- **Produção sem ajuda.** O manual não cobre Produção (9 itens).
- **Estados em formatos diferentes:** texto no pedido (`aberto`, `parcial`) e números
  nos documentos de estoque. **[proposta]** Uma lista única de estados por entidade.
- **Desossa espalhada [só pela lista de rotas; a confirmar].** Sete rotas (nova,
  lista, fichas, relatórios, derivados, rendimentos, configuração). Se forem telas
  soltas, o utilizador pula muito entre elas. **[proposta]** Um fluxo único de desossa:
  escolher a ficha → pesar → ver rendimento e custo → confirmar.

## 7. Pendências

1. **Telas não abertas:** `/dashboard/modulo/compras`, `/compras/solicitacoes`,
   `/compras/cotacoes`, `/dashboard/modulo/producao`, `/producao/ordens` e as 7 de
   desossa (`/producao/desossa-fichas` foi recusada; as outras não foram tentadas
   depois da recusa). Em cada tela: abrir a lista, os filtros e o "Novo", ler os campos
   e as opções e fechar sem gravar.
2. **Compras:** quem aprova e onde; como se comparam fornecedores; como o pedido se liga
   à entrada (XML ou manual), ao estoque e ao contas a pagar; se o período do relatório
   de pedidos filtra pela emissão ou pela previsão; como o recebimento parcial se liga
   às entradas.
3. **Produção e desossa:** todas as perguntas das secções 2.6 a 2.14.
4. **Bloqueio:** as recusas foram do classificador do modo automático do Claude Code
   ("Third-Party Attack"), antes de qualquer página carregar; não foi problema de
   credencial e nada foi lido, clicado ou gravado nessas telas. Completar depende de o
   dono da conta autorizar a leitura. Opcional: conferir se os termos de uso da Olímpia
   permitem esta análise.
