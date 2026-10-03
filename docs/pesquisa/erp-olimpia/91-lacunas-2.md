# 91 — Lacunas, lote 2: liberações, troca de produto, caixa, relatórios de caixa e cardápio (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03. Nenhuma das 12 telas
> deste lote abriu. Este arquivo **não descreve o ERP**: explica o bloqueio em
> palavras simples, diz como destravar e deixa pronto o roteiro da próxima
> passagem. O pouco que aparece como "já se sabe" vem de outros arquivos desta
> pesquisa e está marcado com a origem.

## Em palavras simples

1. **A senha não é o problema.** A conta "Boi Criolo" já está logada no
   navegador embutido. Em outras passagens do mesmo dia as páginas abriram já
   logadas (arquivos 13, 14 e 20). Mandar a credencial de novo não muda nada.
2. **Quem bloqueia é o próprio Claude Code.** No modo automático existe um
   filtro de segurança que decide sozinho o que pode ser feito. Ele recusou
   abrir o site da Olímpia. O motivo informado foi "Third-Party Attack". Pelo
   nome, o filtro entende que vasculhar o sistema de outra empresa pode
   prejudicar essa empresa.
3. **Repetir o mesmo pedido dá o mesmo resultado.** A recusa vale para o
   objetivo (abrir o ERP), não só para aquele clique. Por isso não tentei outra
   aba, outro navegador nem outra ferramenta.
4. **Só você pode destravar**, nas configurações do Claude Code (ver "Como
   destravar"). Eu não posso mexer nessas configurações.

## O que aconteceu

1. Criei uma aba só minha no navegador embutido (tab-30). A aba do usuário não
   foi tocada.
2. Tentei abrir a primeira rota:
   `https://erp.olimpiasistemas.com.br/financeiro/liberacoes`.
3. O filtro do modo automático recusou antes de a página carregar.
4. Fechei a minha aba e parei. Nenhuma página do ERP carregou. Nada foi
   clicado, digitado ou gravado.

## Como destravar (só o usuário pode fazer)

Escolha **um** dos caminhos e depois mande repetir este lote:

1. **Aprovar na mão.** Trocar o modo de permissão da sessão de "automático"
   para o modo que pergunta antes de cada ação. Assim, a cada página do ERP
   aparece um pedido de permissão e você mesmo clica em permitir.
2. **Regra de permissão.** A própria mensagem de recusa diz que uma regra de
   permissão nas configurações do Claude Code libera esse tipo de ação. A regra
   deve permitir as ferramentas de leitura do navegador embutido:
   `mcp__Claude_Browser__navigate`, `mcp__Claude_Browser__get_page_text`,
   `mcp__Claude_Browser__read_page` e `mcp__Claude_Browser__find`. A ferramenta
   de cliques (`mcp__Claude_Browser__computer`) é necessária para abrir filtros
   e janelas, mas dá mais poder (clica em qualquer site): só liberar se aceitar
   esse risco.

Sem um desses dois passos, a próxima tentativa vai ser recusada do mesmo jeito.

## Rotas do lote

| # | Rota | Nome conhecido (origem) | Estado |
|---|---|---|---|
| 1 | `/financeiro/liberacoes` | não conhecido | não visitada: navegação recusada |
| 2 | `/troca-produto` | não conhecido | não tentada (mesma recusa) |
| 3 | `/financeiro/recebimento` | "Caixa", atalho da barra lateral (arquivos 13 e 18) | não tentada (mesma recusa) |
| 4 | `/financeiro/caixa` | não conhecido | não tentada (mesma recusa) |
| 5 | `/relatorios/caixa-vendas-por-vendedor` | não conhecido | não tentada (mesma recusa) |
| 6 | `/relatorios/caixa-conferencia-cega` | não conhecido | não tentada (mesma recusa) |
| 7 | `/relatorios/caixa-historico` | não conhecido | não tentada (mesma recusa) |
| 8 | `/relatorios/caixa-suprimentos` | não conhecido | não tentada (mesma recusa) |
| 9 | `/relatorios/caixa-sangrias` | não conhecido | não tentada (mesma recusa) |
| 10 | `/cardapio-admin/cozinha` | "Painel Cozinha", hub do Cardápio Digital (arquivo 04) | não tentada (mesma recusa) |
| 11 | `/cardapio-admin/pedidos-online` | "Pedidos Online", hub do Cardápio Digital (arquivo 04) | não tentada (mesma recusa) |
| 12 | `/cardapio-admin/link` | "Links e QR Codes", hub do Cardápio Digital (arquivo 04) | não tentada (mesma recusa) |

Sub-rotas descobertas nesta passagem: nenhuma.

Estas rotas já tinham ficado de fora nos grupos 03 (caixa) e 04 (cardápio),
pelo mesmo bloqueio.

## Visão geral do módulo

Não observada nesta passagem. Pistas de outras passagens (não foram revistas
agora):

- O atalho "Caixa" da barra lateral, na seção "Operação do dia", leva a
  `/financeiro/recebimento`, e não a `/financeiro/caixa` (arquivos 13 e 18).
  A tela que o ERP chama de "Caixa" no dia a dia parece ser a de recebimento.
  O papel de `/financeiro/caixa` continua desconhecido.
- As três rotas do cardápio são blocos do hub "Cardápio Digital"
  (`/dashboard/modulo/cardapio`): "Painel Cozinha" e "Pedidos Online" na seção
  Operação, "Links e QR Codes" na seção Acesso (arquivo 04).
- Em todas as páginas do ERP existem janelas de aviso globais, entre elas
  "Novo pedido WhatsApp" (com um botão "Confirmar recebimento") e "Cardápio
  digital" (arquivo 13). Podem ser a forma como os pedidos online chegam ao
  operador; não confirmado.
- Existem relatórios de pós-venda com nomes ligados a este lote:
  `/relatorios/vendas-liberacoes` e `/relatorios/vendas-trocas` (arquivo 19,
  também não visitados).

## Telas

Nenhuma tela foi vista. Em cada uma ficam só as perguntas que a próxima
passagem deve responder. **São perguntas, não constatações.**

### 1. `/financeiro/liberacoes`
- O que precisa de liberação: venda acima do limite de crédito, cliente em
  atraso, desconto acima do permitido, venda abaixo do custo, venda a prazo?
- Quem libera (perfil ou permissão), se pede senha de supervisor e se fica
  registrado quem liberou e quando.
- Estados do pedido de liberação (pendente, liberado, negado, expirado?) e se
  a venda fica travada até a decisão.
- Se quem libera recebe aviso na hora.
- Ligação com o relatório `/relatorios/vendas-liberacoes`.

### 2. `/troca-produto`
- Como se acha a venda de origem (número, cliente, nota) e se dá para trocar
  sem venda de origem.
- O que volta ao estoque (e para qual depósito) e o que sai no lugar.
- Diferença de valor: cobra a mais, gera crédito ou vale para o cliente, ou
  devolve dinheiro.
- Prazo de troca, motivo obrigatório, quem autoriza.
- Parte fiscal: se gera nota de devolução ou entrada (SEFAZ).
- Ligação com `/relatorios/vendas-trocas` e com créditos de cliente.

### 3. `/financeiro/recebimento` (atalho "Caixa")
- O que aparece para receber: vendas do balcão, comandas, pedidos do
  cardápio, contas a receber, OS?
- Formas de pagamento, pagamento dividido, troco, maquininha/TEF, PIX com QR.
- Se exige caixa aberto e a que caixa e operador o recebimento é atribuído.
- Juros, multa e desconto em parcelas atrasadas; emissão de NFC-e ao receber.

### 4. `/financeiro/caixa`
- Abertura: saldo inicial, operador, terminal; mais de um caixa ao mesmo
  tempo.
- Movimentos (venda, recebimento, suprimento, sangria, estorno) e efeito de
  cada um no saldo.
- Fechamento: contagem por forma de pagamento, diferença (sobra ou falta),
  quem aprova.

### 5. `/relatorios/caixa-vendas-por-vendedor`
- Filtros (período, caixa, operador, vendedor, forma de pagamento), colunas e
  totais.
- Diferença entre "vendedor" e "operador do caixa".

### 6. `/relatorios/caixa-conferencia-cega`
- O que o operador informa sem ver o valor esperado, o que o sistema compara e
  como mostra a diferença por forma de pagamento.
- Quem vê o valor esperado e quem aprova a diferença.

### 7. `/relatorios/caixa-historico`
- Colunas (operador, abertura, fechamento, saldo inicial e final, diferença),
  filtros e se dá para reabrir um caixa ou só consultar.

### 8. `/relatorios/caixa-suprimentos` e 9. `/relatorios/caixa-sangrias`
- Campos de cada lançamento: valor, motivo ou categoria, quem fez, quem
  autorizou, destino do dinheiro (cofre, banco).
- Se a sangria gera lançamento no financeiro ou na conta bancária e se imprime
  comprovante.

### 10. `/cardapio-admin/cozinha` (Painel Cozinha)
- Como os pedidos aparecem (cartão por pedido ou por item), estados (novo, em
  preparo, pronto, entregue) e quem muda o estado.
- Separação por setor (cozinha, bar, chapa), tempo de preparo, alerta de
  atraso, aviso sonoro.
- Impressão automática do pedido e tipo de impressora.
- De onde vêm os pedidos: comanda do garçom, cardápio digital, tablet,
  delivery, PDV.

### 11. `/cardapio-admin/pedidos-online` (Pedidos Online)
- Ciclo do pedido (recebido, aceito, em preparo, saiu para entrega, entregue,
  cancelado) e quem aceita.
- Como o cliente é avisado (WhatsApp?) e ligação com a janela global "Novo
  pedido WhatsApp".
- Pagamento online (gateway, PIX) ou na entrega; taxa de entrega; ligação com
  o módulo Delivery.
- Se o pedido vira venda e NFC-e sozinho e se entra no caixa.

### 12. `/cardapio-admin/link` (Links e QR Codes)
- Link público do cardápio, QR geral ou por mesa, personalização (logo,
  cores), domínio próprio.
- Diferença entre link de mesa (consumo no local) e link de entrega ou
  retirada.

## Fluxos de ponta a ponta

Não observados. A próxima passagem deve confirmar ou desmentir estes caminhos:

- pedido (balcão, comanda ou cardápio online) → cozinha → recebimento no caixa
  → fechamento com conferência cega → relatórios de caixa;
- venda travada → liberação → recebimento;
- troca → estoque e crédito do cliente → caixa.

## Entidades e relações

Não observadas nesta passagem.

## Integrações

Não observadas. A verificar: maquininha/TEF e PIX no recebimento; impressora
da cozinha; WhatsApp nos pedidos online; SEFAZ (NFC-e na venda, nota de
devolução na troca).

## Observações de UX

Nenhuma observação nova, porque nada foi visto. Única pista de outras
passagens: o atalho chamado "Caixa" abre `/financeiro/recebimento`, enquanto
existe outra tela em `/financeiro/caixa`. Se forem nomes parecidos para
funções diferentes, isso confunde o operador. A verificar.

## Pendências

- As 12 rotas do lote (tabela acima) estão todas pendentes.
- Destravar a permissão (seção "Como destravar") e repetir o lote. Sem isso,
  a recusa se repete.
- Na próxima passagem, começar por `/financeiro/recebimento` e
  `/financeiro/caixa`: os relatórios de caixa dependem deles.
- Confirmar a ligação de `/financeiro/liberacoes` com
  `/relatorios/vendas-liberacoes` e de `/troca-produto` com
  `/relatorios/vendas-trocas`.
- Quando a exploração for feita, substituir este arquivo pelo relatório
  completo.
