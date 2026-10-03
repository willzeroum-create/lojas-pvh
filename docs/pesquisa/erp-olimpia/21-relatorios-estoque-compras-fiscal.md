# 21 — Relatórios de estoque, compras, fiscal, Mercado Livre e loja (ERP Olímpia)

> **Estado: NÃO EXPLORADO** (2026-10-03). Nenhuma tela deste grupo foi aberta.
> Este arquivo não traz nada sobre o ERP. Ele explica o bloqueio, como
> destravar e o que olhar na próxima tentativa.

## Resumo em 3 linhas

1. O login no ERP **não** é o problema. Nenhuma senha foi pedida e a página
   nem chegou a carregar.
2. Quem bloqueou foi o **sistema de permissões do Claude Code** (modo
   automático), na hora de abrir a primeira página.
3. Só você pode liberar. Os jeitos estão em "Como destravar".

## O que aconteceu, passo a passo

1. Criei uma aba nova no navegador embutido, só para este trabalho. Isso
   funcionou.
2. Mandei essa aba abrir o primeiro relatório da lista
   (`/relatorios/estoque-entradas`). O modo automático do Claude Code recusou,
   com o motivo "Third-Party Attack" (ataque de terceiros).
3. Essa recusa vale para o objetivo inteiro (abrir o ERP), não só para aquele
   comando. Por isso parei. Não tentei outra aba, outro navegador nem outra
   ferramenta, e não mexi nas abas do ERP que já estavam abertas (não são
   minhas).
4. Fechei a minha aba. No ERP, não cliquei, não digitei e não gravei nada.

O grupo 19 (`19-relatorios-vendas-financeiro.md`) bateu no mesmo bloqueio. É o
mesmo problema, não um defeito deste grupo.

## Por que colocar a credencial de novo não resolve

Pense em duas portas:

- **Porta 1 — o login no ERP.** Já está aberta: a conta está logada no
  navegador embutido. Foi isso que você resolveu ao pôr a credencial.
- **Porta 2 — a licença do Claude Code para o navegador entrar nesse site.**
  Essa está fechada.

A porta 2 tem um porteiro automático. A ordem de abrir o ERP chegou por um
script de workflow. A sua mensagem que veio junto fala da credencial, mas não
diz o nome do site nem que ele pode ser aberto. Para o porteiro, isso parece um
golpe comum: um texto de fora mandando o Claude entrar num site. Então ele
barra. (É o motivo mais provável; a recusa só mostra o rótulo.)

A credencial é a chave da porta 1. Ela não abre a porta 2.

## Como destravar (só você pode fazer)

Escolha **um** destes caminhos e depois mande repetir este grupo (21):

1. **Autorizar por escrito.** A mensagem que dispara o workflow precisa dizer o
   site e o limite, com todas as letras. Exemplo: "Autorizo o navegador
   embutido do Claude a abrir erp.olimpiasistemas.com.br, só para leitura, para
   a pesquisa do ERP Olímpia."
2. **Liberar nas configurações do Claude Code** as ferramentas do navegador
   embutido (as que começam com `mcp__Claude_Browser__`, como `navigate` e
   `tabs_create`), com uma regra de permissão.
3. **Rodar esta pesquisa fora do modo automático.** Assim o Claude pede a sua
   aprovação na tela antes de abrir cada página, e você aprova.

## Rotas deste grupo

A coluna "Área" foi deduzida só pelo nome da rota.

| Rota | Área | Estado |
|---|---|---|
| `/relatorios/estoque-entradas` | Estoque — entradas | não visitada (bloqueada) |
| `/relatorios/estoque-saidas` | Estoque — saídas | não visitada (bloqueada) |
| `/relatorios/entradas-itens` | Estoque — entradas | não visitada (bloqueada) |
| `/relatorios/entradas-xml` | Estoque — entradas | não visitada (bloqueada) |
| `/relatorios/entradas-manual` | Estoque — entradas | não visitada (bloqueada) |
| `/relatorios/saidas-periodo` | Estoque — saídas | não visitada (bloqueada) |
| `/relatorios/saidas-itens` | Estoque — saídas | não visitada (bloqueada) |
| `/relatorios/estoque-sem-movimento` | Estoque — análise | não visitada (bloqueada) |
| `/relatorios/estoque-valor-grupo` | Estoque — análise | não visitada (bloqueada) |
| `/relatorios/produtos-cadastro` | Produtos | não visitada (bloqueada) |
| `/relatorios/estoque-balanco` | Estoque — análise | não visitada (bloqueada) |
| `/relatorios/estoque-giro` | Estoque — análise | não visitada (bloqueada) |
| `/relatorios/estoque-transferencias` | Estoque — movimentação interna | não visitada (bloqueada) |
| `/relatorios/estoque-romaneio` | Estoque — movimentação interna | não visitada (bloqueada) |
| `/relatorios/compras-por-fornecedor` | Compras | não visitada (bloqueada) |
| `/relatorios/compras-por-produto` | Compras | não visitada (bloqueada) |
| `/relatorios/compras-pedidos` | Compras | não visitada (bloqueada) |
| `/relatorios/compras-evolucao-custos` | Compras | não visitada (bloqueada) |
| `/relatorios/nfe-rejeitadas` | Fiscal — NF-e | não visitada (bloqueada) |
| `/relatorios/nfe-tributos` | Fiscal — NF-e | não visitada (bloqueada) |
| `/relatorios/nfe-por-cfop` | Fiscal — NF-e | não visitada (bloqueada) |
| `/relatorios/nfe-itens-fiscal` | Fiscal — NF-e | não visitada (bloqueada) |
| `/relatorios/mdfe-periodo` | Fiscal — outros documentos | não visitada (bloqueada) |
| `/relatorios/cte-periodo` | Fiscal — outros documentos | não visitada (bloqueada) |
| `/relatorios/fiscal-manifestacao-nfe` | Fiscal — outros documentos | não visitada (bloqueada) |
| `/relatorios/nfse-emitidas` | Fiscal — outros documentos | não visitada (bloqueada) |
| `/relatorios/sped-resumo-periodo` | Fiscal — apuração | não visitada (bloqueada) |
| `/relatorios/icms-mensal` | Fiscal — apuração | não visitada (bloqueada) |
| `/relatorios/ml-pedidos` | Mercado Livre | não visitada (bloqueada) |
| `/relatorios/ml-anuncios` | Mercado Livre | não visitada (bloqueada) |
| `/relatorios/loja-pedidos` | Loja virtual | não visitada (bloqueada) |
| `/relatorios/produtos-lista-precos` | Produtos | não visitada (bloqueada) |

Sub-rotas descobertas: nenhuma.

Telas, fluxos, entidades, integrações e observações de UX: **nada a registrar**,
porque nenhuma tela foi vista.

## O que olhar quando a exploração for repetida

São perguntas para guiar a próxima passagem. **Não são constatações** — nada
disto foi visto no ERP.

- **Em todos os relatórios:** como se escolhe empresa/filial, depósito e
  período; se o relatório sai na hora ou entra numa fila de processamento (e
  onde se baixa depois); formatos de saída (tela, PDF, planilha); se dá para
  guardar filtros.
- **Entradas de estoque** (`estoque-entradas`, `entradas-itens`,
  `entradas-xml`, `entradas-manual`): o que separa entrada por XML de entrada
  manual; de onde vem o XML (upload do arquivo do fornecedor ou download da
  SEFAZ); que dados aparecem (fornecedor, número da nota, CFOP, custo, frete,
  impostos); se a entrada recalcula o custo do produto (custo médio ou último
  custo).
- **Saídas de estoque** (`estoque-saidas`, `saidas-periodo`, `saidas-itens`):
  que tipos de saída existem (venda, perda, consumo, transferência,
  devolução); se mostra custo e margem; visão por documento ou por item.
- **Análise de estoque** (`estoque-sem-movimento`, `estoque-valor-grupo`,
  `estoque-balanco`, `estoque-giro`): quantos dias contam como "sem
  movimento" e se isso é configurável; que valor é usado para valorizar o
  estoque (custo médio, último custo, preço de venda); se "balanço" é
  inventário com contagem e diferenças ou só a foto do estoque numa data;
  como o giro é calculado (saídas sobre estoque médio, cobertura em dias).
- **Movimentação interna** (`estoque-transferencias`, `estoque-romaneio`):
  entre o quê se transfere (depósitos, filiais, empresas); o que é o romaneio
  neste ERP (lista de separação ou de carga para entrega) e se liga ao MDF-e.
- **Produtos** (`produtos-cadastro`, `produtos-lista-precos`): que colunas do
  cadastro saem (NCM, CEST, unidade, código de barras, grupo); se há várias
  tabelas de preço (varejo, atacado, por cliente).
- **Compras** (`compras-por-fornecedor`, `compras-por-produto`,
  `compras-pedidos`, `compras-evolucao-custos`): estados de um pedido de
  compra; ligação entre pedido e nota de entrada; como a evolução de custos é
  mostrada (tabela, gráfico, variação em %).
- **NF-e** (`nfe-rejeitadas`, `nfe-tributos`, `nfe-por-cfop`,
  `nfe-itens-fiscal`): se a rejeição mostra código e motivo da SEFAZ e se há
  atalho para corrigir e reenviar; que tributos são somados (ICMS, ICMS-ST,
  FCP, IPI, PIS, COFINS, DIFAL); se separa entradas e saídas; filtros por
  CFOP, CST/CSOSN e NCM.
- **Outros documentos fiscais** (`mdfe-periodo`, `cte-periodo`,
  `fiscal-manifestacao-nfe`, `nfse-emitidas`): estados do MDF-e (autorizado,
  encerrado, cancelado); se o CT-e é emitido ou só recebido; que eventos de
  manifestação aparecem (ciência, confirmação, desconhecimento, operação não
  realizada) e se há aviso de prazo; NFS-e de qual prefeitura e padrão.
- **Apuração** (`sped-resumo-periodo`, `icms-mensal`): qual SPED (EFD
  ICMS/IPI, EFD Contribuições) e o que o resumo mostra; se a apuração do ICMS
  traz débitos, créditos e saldo; se gera arquivo ou guia, ou só mostra.
- **Mercado Livre** (`ml-pedidos`, `ml-anuncios`): estados de pedido e de
  anúncio; se mostra tarifa, frete e valor líquido; se o estoque do anúncio
  acompanha o do ERP; quando foi a última sincronização.
- **Loja virtual** (`loja-pedidos`): estados do pedido; forma de pagamento e
  gateway; se o pedido baixa estoque e vira venda ou nota.

## Pendências

- As 32 rotas acima. Destravar por um dos caminhos de "Como destravar" e
  repetir este grupo.
