# 19 — Relatórios de vendas, financeiro, faturamento e bancos (ERP Olímpia)

> **Estado: NÃO EXPLORADO** (2026-10-03). Nenhuma tela deste grupo foi aberta.
> Este arquivo não traz nada sobre o ERP. Ele explica o bloqueio, como
> destravar e o que olhar na próxima tentativa.

## Resumo em 3 linhas

1. O login no ERP **não** é o problema. Nenhuma senha foi pedida e o site nem
   chegou a carregar.
2. Quem bloqueou foi o **sistema de permissões do Claude Code** (modo
   automático), antes de a página abrir.
3. Só você pode liberar. Os jeitos estão em "Como destravar".

## O que aconteceu, passo a passo

1. Pedi ao navegador embutido uma aba nova, só para este trabalho. Ele
   respondeu que não conseguia criar a aba e deu três causas possíveis:
   painel fechado, função desligada ou limite de abas. Havia 8 abas abertas
   nessa hora.
2. Tentei abrir a aba já no endereço do primeiro relatório
   (`/dashboard/modulo/relatorios`). Dessa vez o modo automático do Claude Code
   recusou, com o motivo "Third-Party Attack" (ataque de terceiros).
3. Essa recusa vale para o objetivo inteiro (abrir o ERP), não só para aquele
   comando. Por isso parei. Não tentei outra aba, outro navegador nem outra
   ferramenta, e não li as abas do ERP que já estavam abertas (não são minhas).
4. No ERP, não cliquei, não digitei e não gravei nada.

## Por que colocar a credencial de novo não resolve

Imagine duas portas:

- **Porta 1 — o login no ERP.** Já está aberta: a conta está logada no
  navegador embutido.
- **Porta 2 — a licença do Claude Code para o navegador visitar esse site.**
  Essa está fechada.

A porta 2 tem um porteiro automático. A ordem de abrir o ERP chegou por um
script de workflow, e a sua mensagem que veio junto não cita o site nem diz que
ele pode ser aberto. Para o porteiro, isso parece um golpe comum: um texto de
fora mandando o Claude entrar num site. Então ele barra. (É o motivo mais
provável; a recusa só mostra o rótulo "Third-Party Attack".)

A credencial é a chave da porta 1. Ela não abre a porta 2.

## Como destravar (só você pode fazer)

Escolha **um** destes caminhos e depois mande repetir este grupo:

1. **Autorizar por escrito.** A mensagem que dispara o workflow precisa dizer o
   site e o limite, com todas as letras. Exemplo: "Autorizo o navegador
   embutido do Claude a abrir erp.olimpiasistemas.com.br, só para leitura, para
   a pesquisa do ERP Olímpia."
2. **Liberar nas configurações do Claude Code** as ferramentas do navegador
   embutido (as que começam com `mcp__Claude_Browser__`, como `navigate`,
   `preview_start` e `tabs_create`), com uma regra de permissão.
3. **Rodar esta pesquisa fora do modo automático.** Assim o Claude pede a sua
   aprovação na tela antes de abrir cada página, e você aprova.

Antes de repetir, feche as abas antigas do navegador embutido que você não usa
mais. A criação da aba própria também falhou, e uma das causas possíveis é o
limite de abas. Se o workflow rodar muitos grupos ao mesmo tempo, cada um abre
uma aba e o limite chega rápido.

## Rotas deste grupo

| Rota | Estado |
|---|---|
| `/dashboard/modulo/relatorios` | não visitada (bloqueada) |
| `/relatorios` | não visitada (bloqueada) |
| `/relatorios/processamentos` | não visitada (bloqueada) |
| `/relatorios/produtos-vendidos` | não visitada (bloqueada) |
| `/relatorios/vendas-por-vendedor-produto` | não visitada (bloqueada) |
| `/relatorios/vendas-vendedor-modalidade` | não visitada (bloqueada) |
| `/relatorios/vendas-canceladas` | não visitada (bloqueada) |
| `/relatorios/positivacao-mix-produtos` | não visitada (bloqueada) |
| `/relatorios/vendas-recebimento-por-vendedor` | não visitada (bloqueada) |
| `/relatorios/clientes-sem-compra` | não visitada (bloqueada) |
| `/relatorios/rota-visitas` | não visitada (bloqueada) |
| `/relatorios/receber-por-cliente` | não visitada (bloqueada) |
| `/relatorios/receber-aging` | não visitada (bloqueada) |
| `/relatorios/pagar-por-fornecedor` | não visitada (bloqueada) |
| `/relatorios/pagar-pagamentos-periodo` | não visitada (bloqueada) |
| `/relatorios/pagar-aging` | não visitada (bloqueada) |
| `/relatorios/pagar-por-plano-contas` | não visitada (bloqueada) |
| `/relatorios/previsao-financeira` | não visitada (bloqueada) |
| `/relatorios/faturamento-lotes` | não visitada (bloqueada) |
| `/relatorios/faturamento-vendas` | não visitada (bloqueada) |
| `/relatorios/faturamento-por-vendedor` | não visitada (bloqueada) |
| `/relatorios/banco-movimentacao` | não visitada (bloqueada) |
| `/relatorios/boletos-periodo` | não visitada (bloqueada) |
| `/relatorios/pix-recebidos` | não visitada (bloqueada) |
| `/relatorios/vendas-liberacoes` | não visitada (bloqueada) |
| `/relatorios/vendas-trocas` | não visitada (bloqueada) |
| `/relatorios/devolucoes-venda` | não visitada (bloqueada) |
| `/relatorios/vendas-orcamentos` | não visitada (bloqueada) |
| `/relatorios/cliente-creditos` | não visitada (bloqueada) |

Sub-rotas descobertas: nenhuma.

## O que olhar quando a exploração for repetida

São perguntas para guiar a próxima passagem. **Não são constatações.**

- **Central de relatórios** (`/dashboard/modulo/relatorios`, `/relatorios`,
  `/relatorios/processamentos`): como os relatórios são agrupados; se saem na
  hora ou entram numa fila de processamento (e onde se baixa o resultado
  depois); formatos de saída (tela, PDF, planilha); filtros comuns (empresa,
  período, vendedor).
- **Vendas** (produtos vendidos, vendedor x produto, vendedor x modalidade,
  canceladas, positivação e mix, venda x recebimento por vendedor, clientes sem
  compra, rota de visitas): o que cada relatório soma (quantidade, valor,
  custo, margem, ticket médio); como a positivação é calculada; se há meta por
  vendedor; de onde vem a rota de visitas (cadastro do cliente, dia da semana).
- **Contas a receber** (por cliente, aging): faixas de atraso do aging; se entram
  juros e multa; se separa por forma de recebimento.
- **Contas a pagar** (por fornecedor, pagamentos no período, aging, por plano de
  contas) e **previsão financeira**: como a previsão é montada (receber menos
  pagar, por data); se parte do saldo bancário; se o plano de contas aparece em
  árvore.
- **Faturamento** (lotes, vendas, por vendedor): o que é um lote de faturamento;
  ligação com nota fiscal (NF-e/NFC-e) e SEFAZ; faturado x não faturado.
- **Bancos** (movimentação, boletos no período, PIX recebidos): de que banco ou
  gateway vêm os dados; se há conciliação; que estados um boleto pode ter.
- **Pós-venda** (liberações, trocas, devoluções, orçamentos, créditos de
  cliente): quem libera uma venda travada e por quê (limite de crédito,
  desconto); como troca e devolução viram crédito do cliente; como o orçamento
  vira venda.
