# 03 — Caixa e recebimento (ERP Olímpia)

> **Estado: não explorado.** Nenhuma rota deste grupo chegou a ser aberta.
> Este ficheiro regista só o bloqueio e o que falta fazer. Não contém
> constatações sobre o ERP.

## O que aconteceu

- Data: 2026-10-03.
- Abri uma aba própria no navegador embutido, sem mexer nas abas do
  utilizador, e tentei abrir a primeira rota (`/financeiro/caixa`).
- O classificador de permissões do modo automático do Claude Code recusou a
  navegação. O motivo indicado foi "Third-Party Attack".
- **Não foi problema de login nem de credencial.** A sessão já aberta no
  navegador nem chegou a ser usada: a recusa aconteceu antes de a página
  carregar.
- A recusa vale para o resultado (abrir o ERP), não só para aquela chamada.
  Por isso não tentei outro caminho: nem outra aba, nem outro navegador, nem
  outra ferramenta. Fechei a aba que tinha criado. Não cliquei, não escrevi e
  não gravei nada no ERP.

## Rotas do grupo

| Rota | Estado |
|---|---|
| `/financeiro/recebimento` | não visitada (navegação bloqueada) |
| `/financeiro/caixa` | não visitada (navegação bloqueada) |
| `/relatorios/caixa-vendas-por-vendedor` | não visitada (navegação bloqueada) |
| `/relatorios/caixa-conferencia-cega` | não visitada (navegação bloqueada) |
| `/relatorios/caixa-historico` | não visitada (navegação bloqueada) |
| `/relatorios/caixa-suprimentos` | não visitada (navegação bloqueada) |
| `/relatorios/caixa-sangrias` | não visitada (navegação bloqueada) |

Sub-rotas descobertas: nenhuma.

## Para desbloquear

Só o utilizador pode decidir. Há duas saídas:

1. Na conversa principal, autorizar de forma explícita que o navegador
   embutido abra `erp.olimpiasistemas.com.br` para esta pesquisa, só de
   leitura, e depois mandar repetir este grupo.
2. Ou acrescentar, nas definições do Claude Code, uma regra de permissão para
   a ferramenta de navegação do navegador embutido nesse domínio, e depois
   repetir o grupo.

Quando a exploração for repetida, este ficheiro deve ser substituído pelo
relatório completo.

## O que responder quando a exploração for repetida

São perguntas para orientar a próxima passagem. Não são constatações.

### `/financeiro/caixa`
- Como se abre e fecha um caixa: saldo inicial, quem pode operar, se há mais
  de um caixa ou terminal ao mesmo tempo.
- Que movimentos existem (venda, recebimento, suprimento, sangria, troco,
  estorno) e como cada um afecta o saldo.
- Como funciona o fecho: valor contado por forma de pagamento, diferença
  (sobra/falta), se o fecho é cego e quem aprova.
- Que estados um caixa pode ter (aberto, fechado, conferido, reaberto?) e que
  transições são permitidas.

### `/financeiro/recebimento`
- Se é uma baixa de contas a receber (crediário, fiado, boletos) ou um ecrã de
  recebimento no balcão.
- Como se escolhe o cliente ou o título, se aceita pagamento parcial, juros,
  multa e desconto, e se o recebimento entra no caixa aberto.
- Que formas de pagamento aceita e se pressupõe TEF, PIX ou maquininha
  integrada.

### Relatórios (`/relatorios/caixa-*`)
- Filtros de cada relatório (período, caixa, operador, vendedor, forma de
  pagamento) e as colunas e totais que mostra.
- Na conferência cega: o que o operador informa, o que o sistema compara e
  como a diferença aparece.
- Em suprimentos e sangrias: campos de cada lançamento (valor, motivo,
  responsável, destino) e se há comprovante para impressora.
- No histórico: que eventos ficam guardados (abertura, fecho, reabertura) e
  com que detalhe.
