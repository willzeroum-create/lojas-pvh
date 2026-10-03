# 98 — Lacunas, lote 9: desossa (fichas, relatórios, derivados, rendimentos, configuração), financeiro e bancos (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03. Nenhuma das 12 telas
> deste lote abriu. Este arquivo **não descreve o ERP**. Ele registra o
> bloqueio, junta o pouco que outros arquivos desta pasta já viram sobre estes
> assuntos (sempre com a origem) e deixa pronto o roteiro da próxima visita.

## Em poucas linhas

- **A credencial está certa. Não precisa mandar nada.** O login não teve
  nenhum papel aqui: a página nem chegou a carregar.
- **Quem barrou foi o modo automático do Claude Code.** Ele recusou abrir
  `erp.olimpiasistemas.com.br` com o motivo "Third-Party Attack", ou seja,
  ação que pode prejudicar outra empresa (aqui, a Olímpia).
- **Esse filtro não pede senha. Ele decide se o Claude pode abrir o site.**
  Por isso avisar no chat que o login está feito não muda a resposta dele.
- **O agente não pode contornar a recusa** (nem por outra aba, outro
  navegador ou outra ferramenta). Por isso parou na primeira tela.
- **Liberar é decisão sua, no Claude Code** (não no ERP). Escolha um caminho:
  1. **Aprovar na hora:** rodar o lote 9 com o modo automático desligado.
     Quando o Claude for abrir uma página da Olímpia, aparece um pedido de
     permissão e você clica em **Permitir**.
  2. **Regra de permissão:** liberar o navegador embutido nas configurações.
     O passo a passo está em `97-lacunas-8.md` ("O que você precisa fazer").
     A regra vale para qualquer site; apague quando a pesquisa acabar.
- Depois, é só mandar rodar o lote 9 de novo. Este arquivo será substituído
  pelo relatório completo.

## O que aconteceu (registro técnico)

- Abas abertas no navegador embutido no início (5): `seed` (localhost:3000),
  `tab-1` (ERP Olímpia, do usuário), `tab-7` (PagBank para desenvolvedores),
  `tab-31` e `tab-35` (ERP Olímpia, do usuário ou de outros agentes). Nenhuma
  foi tocada.
- Criei a minha própria aba (`tab-36`). Desta vez a criação funcionou: não
  houve problema de limite de abas.
- Pedi para abrir `https://erp.olimpiasistemas.com.br/producao/desossa-fichas`
  na `tab-36`: **recusado** pelo classificador do modo automático, motivo
  "Third-Party Attack". A recusa acontece antes da execução: nada carregou e a
  sessão logada nem foi usada.
- A mensagem de recusa diz que ela vale para o resultado (ler o ERP), não só
  para aquele comando. Por isso não tentei as outras 11 rotas, nem as abas que
  já estavam no ERP, nem outro navegador, nem o manual, nem baixar páginas.
- Fechei a `tab-36`. No ERP nada foi lido, clicado, digitado ou gravado.

## Rotas do lote

A coluna do meio é só o que o nome da rota sugere. **Não foi confirmado na
tela.**

| Rota | O que o nome sugere | Estado |
|---|---|---|
| `/producao/desossa-fichas` | modelos de desossa: cortes e rendimento esperados por tipo de peça | **recusada** pelo classificador |
| `/producao/desossas-relatorios` | relatórios das desossas feitas | não aberta (mesma recusa) |
| `/producao/desossas-produtos-derivados` | produtos que saem de cada peça (cortes, osso, sebo, apara) | não aberta (mesma recusa) |
| `/producao/desossas-rendimentos` | rendimento dos cortes, talvez real × esperado | não aberta (mesma recusa) |
| `/producao/desossa-config` | parâmetros da desossa (custo, estoque, balança, etiqueta) | não aberta (mesma recusa) |
| `/dashboard/modulo/financeiro` | página inicial do módulo financeiro | não aberta (mesma recusa) |
| `/financeiro/receber` | contas a receber | não aberta (mesma recusa) |
| `/financeiro/pagar` | contas a pagar | não aberta (mesma recusa) |
| `/financeiro/pagar-baixa` | baixa (pagamento) de contas a pagar, talvez em lote | não aberta (mesma recusa) |
| `/bancos` | cadastro de bancos | não aberta (mesma recusa) |
| `/banco-contas` | contas bancárias e caixas da empresa | não aberta (mesma recusa) |
| `/financeiro/banco-movimentacao` | lançamentos e extrato das contas | não aberta (mesma recusa) |

Sub-rotas descobertas: nenhuma.

## 1. Visão geral do módulo

**Nada observado neste lote.** O que outros arquivos desta pasta viram no ERP,
em outras telas, e que toca estes assuntos:

- **Menu:** o menu lateral tem um grupo "Financeiro & Fiscal", com o Fiscal e
  o Portal do Contador (`13-fiscal.md`). O atalho "Caixa" da barra lateral
  leva a `/financeiro/recebimento` (`18-parametros-plano-comissoes.md`).
- **Contas a receber é um só para vendas e OS.** Os filtros dos relatórios de
  comissão mostram a origem do título (`venda` ou `os`) e indicam que cada
  parcela guarda documento de origem, cliente, datas de emissão, vencimento e
  pagamento, status e a comissão do colaborador (percentual e valor)
  (`20-relatorios-comissoes-os.md`).
- **O título só tem dois estados nos filtros:** `0` aberto e `1` pago. Não
  aparece "parcial" nem "cancelado" (`20`).
- **Filtro por tipo de data:** movimento (padrão, mistura pagamento,
  vencimento e emissão), pagamento, vencimento ou emissão (`20`).
- **OS e financeiro:** a OS exige forma de pagamento, tem campo de
  adiantamento e tem o status "Quitado (4)", que pode ser escolhido à mão; os
  relatórios filtram OS "com" ou "sem títulos a receber" (`14-os-forca-vendas.md`).
- **Desossa:** nada foi visto em nenhum arquivo. As rotas vizinhas
  `/producao/desossas/nova` e `/producao/desossas` também estão pendentes
  (`97-lacunas-8.md`). O menu tem uma rota de SPED dentro de produção,
  `/producao/sped-bloco-k` (`13-fiscal.md`).
- **Rotas vizinhas conhecidas só pelo nome** (lista de rotas da pesquisa, em
  `11-financeiro-bancos.md` e `19-relatorios-vendas-financeiro.md`):
  `/financeiro/conciliacao`, `/cedentes`, `/financeiro/boletos`,
  `/financeiro/boletos-liquidados`, `/financeiro/integracao-bancaria`,
  `/financeiro/tipo-recebimentos`, `/financeiro/tipo-documentos`,
  `/financeiro/tef`, `/financeiro/pos-operadoras`, `/financeiro/cartoes` e os
  relatórios de receber por cliente, aging, pagar por fornecedor, pagamentos
  no período, pagar por plano de contas, previsão financeira, movimentação
  bancária, boletos e PIX recebidos. Os nomes **sugerem** plano de contas,
  fornecedor, tipo de documento, tipo de recebimento e cedente (conta de
  cobrança de boleto). Nada disso foi visto.

## 2. Telas

Nenhuma abriu. Para cada uma, o que ler na próxima visita. Sempre só leitura:
abrir lista, filtros e "Novo", ler os campos e as opções de cada lista e
fechar **sem gravar**.

### 2.1 `/producao/desossa-fichas` — fichas de desossa

- Lista: colunas, filtros, ativo/inativo.
- Formulário: peça de entrada (produto; carcaça, quarto dianteiro ou
  traseiro, peça), cortes esperados com rendimento (%) e tolerância, ordem dos
  cortes, observações.
- Regras: a soma dos percentuais precisa fechar 100% (contando a perda)? A
  ficha preenche a desossa nova? Existe versão ou histórico da ficha?

### 2.2 `/producao/desossas-relatorios`

- Que relatórios existem; filtros (período, fornecedor, lote, ficha, peça,
  operador); saída (tela, PDF, planilha).
- O que somam: peso de entrada, peso dos cortes, perda (quebra), rendimento
  real × esperado, custo por kg de cada corte, margem.

### 2.3 `/producao/desossas-produtos-derivados`

- Liga a peça de entrada aos produtos de saída? Campos: produto de origem,
  produto derivado, percentual esperado, se recebe custo, se entra no estoque.
- Como trata osso, sebo, apara e quebra: subproduto com valor, sem valor ou
  perda.

### 2.4 `/producao/desossas-rendimentos`

- É cadastro (rendimento padrão de cada corte) ou relatório (rendimento real
  por desossa, fornecedor ou lote)?
- Fórmulas que aparecem; alerta quando o rendimento foge do esperado.

### 2.5 `/producao/desossa-config`

- Parâmetros: método de custo dos cortes (rateio pelo peso ou pelo valor de
  venda), local de estoque de entrada e de saída, movimento de estoque
  automático, balança, etiqueta (peso, validade, lote, código de barras),
  numeração de lote, tolerância de perda.
- Só ler. Não mudar nenhum interruptor.

### 2.6 `/dashboard/modulo/financeiro`

- Se segue o padrão do Fiscal (só atalhos em blocos, sem indicadores; ver
  `13-fiscal.md`) ou se mostra saldos e vencimentos do dia.
- Lista completa dos atalhos e rotas, para conferir com a lista de
  `11-financeiro-bancos.md`.

### 2.7 `/financeiro/receber` — contas a receber

- Lista: colunas; totais (aberto, vencido, recebido); filtros (cliente,
  origem, status, tipo de data, forma, vendedor, filial).
- "Novo" título manual: todos os campos (cliente, documento, tipo de
  documento, emissão, vencimento, valor, parcelas e intervalo, plano de
  contas, centro de custo, forma de recebimento, conta).
- Ações por título (receber, estornar, renegociar ou agrupar, boleto, PIX,
  recibo, cobrança por WhatsApp): só ver o que existe, sem clicar.
- Regras: juros e multa automáticos; desconto; recebimento parcial (os
  filtros só têm aberto e pago); se um título vindo de venda pode ser editado
  ou excluído.

### 2.8 `/financeiro/pagar` — contas a pagar

- O mesmo roteiro do receber, mais: fornecedor, plano de contas, centro de
  custo, código de barras ou linha digitável, anexo, recorrência (conta fixa
  mensal), aprovação.
- De onde vêm os títulos: lançamento manual, compra, entrada de XML da NF-e,
  comissão?

### 2.9 `/financeiro/pagar-baixa` — baixa de contas a pagar

- Seleção de vários títulos; data, conta de saída, forma, juros, multa,
  desconto, pagamento parcial; total da baixa.
- Se gera movimento na conta bancária e se dá para estornar. **Não clicar em
  baixar.**

### 2.10 `/bancos` — bancos

- Tabela fixa (código do banco e nome) ou cadastro livre? Campos extras
  (ISPB, layout de boleto ou CNAB).

### 2.11 `/banco-contas` — contas bancárias

- Campos: banco, agência, conta e dígitos, tipo (corrente, poupança, caixa
  interno, aplicação), descrição, filial, saldo inicial e data, ativa, chave
  PIX, ligação com cedente (boleto).
- Se o saldo atual é calculado e onde aparece.

### 2.12 `/financeiro/banco-movimentacao` — movimentação bancária

- Extrato por conta: colunas (data, histórico, documento, entrada, saída,
  saldo, conciliado, origem), filtros, totais (saldo anterior, entradas,
  saídas, saldo final).
- Ações: lançamento manual, transferência entre contas, estorno, importação
  de extrato. **Não clicar em Importar.**
- Ligação com a baixa de títulos e com a conciliação (`/financeiro/conciliacao`).

## 3. Fluxos de ponta a ponta

**Visto em outros arquivos (não neste lote):**

- Venda ou OS → títulos a receber em parcelas, já com a comissão gravada →
  pagamento no Caixa ou no financeiro → título passa a pago (`1`); a OS tem o
  status "Quitado" (`14`, `20`). O que acontece dentro das telas do
  financeiro não foi visto.

**A confirmar na próxima visita (perguntas, não fatos):**

- Desossa: ficha → desossa nova (peça de entrada com peso e custo) → cortes e
  derivados pesados → rendimento e custo de cada corte → entrada no estoque →
  relatórios e rendimentos.
- Contas a pagar: lançamento manual ou vindo de compra / entrada de XML →
  baixa individual ou em lote → saída na conta bancária → conciliação.
- Bancos: banco → conta bancária → movimentos (manuais, transferências e
  baixas) → saldo → conciliação.

## 4. Entidades e relações

**Já vistas em outros arquivos:**

| Entidade | Campos | Relações | Fonte |
|---|---|---|---|
| Título a receber (parcela) | origem (venda/os), documento de origem, cliente, parcela, emissão, vencimento, pagamento, status 0/1, colaborador, % e valor da comissão | pertence a uma venda ou OS; aponta cliente e colaborador | `20` (deduzido dos filtros) |
| Ordem de serviço (parte financeira) | forma de pagamento (obrigatória), adiantamento, status com "Quitado (4)" | gera títulos a receber | `14` |
| Forma de pagamento | código, nome | usada na OS | `14` |

**Candidatas, só pelo nome das rotas (nada visto):** ficha de desossa,
desossa, produto derivado, rendimento (cadastro ou relatório), configuração
de desossa, título a pagar, banco, conta bancária, movimento bancário, plano
de contas, fornecedor, tipo de documento, tipo de recebimento, cedente.

## 5. Integrações

Nenhuma observada neste lote. A verificar: balança e impressora de etiquetas
(desossa), SPED bloco K (produção e estoque), boleto (cedentes, remessa e
retorno), integração bancária, PIX, importação de extrato, TEF e POS.

## 6. Observações de UX

Nenhuma tela deste lote foi vista. O que outros arquivos já mostram e vale
para o financeiro do nosso produto:

- **Status em códigos numéricos** (0, 1, 2, 4) nas telas e relatórios (`14`,
  `20`). Para nós: rótulos claros.
- **"Quitado" mistura o andamento da OS com o pagamento** e pode ser
  escolhido à mão (`14`). Para nós: separar o estado do documento do estado
  financeiro, e o financeiro sair dos recebimentos registrados.
- **Título sem estado "parcial"** nos filtros (`20`). Para nós: aceitar
  recebimento e pagamento parcial, com saldo do título.
- **Nomes de formulários do sistema antigo aparecem na tela** (`13`). Para
  nós: vocabulário do comerciante.
- **Só pela lista de rotas:** a desossa ocupa 7 rotas (nova, lista, fichas,
  relatórios, derivados, rendimentos, configuração) e o financeiro mais de 15.
  Se forem telas soltas, o usuário pula muito entre elas. Para nós: um fluxo
  único de desossa (escolher ficha → pesar → ver rendimento e custo →
  confirmar) e uma visão única de contas a receber e a pagar. **A confirmar
  quando as telas abrirem.**

## 7. Pendências

1. **Liberar a navegação no Claude Code** (caminho 1 ou 2, no topo). Só o
   usuário pode fazer.
2. **Rodar de novo o lote 9** e substituir este arquivo pelo relatório
   completo.
3. **Opcional:** conferir nos termos de uso da Olímpia se esta análise é
   permitida. É o tipo de risco que o filtro aponta.
4. Os arquivos 03, 05, 06, 08, 09, 10, 11, 12, 15, 16, 17, 19, 21, 22, 90,
   91, 94 e 97 pararam no mesmo bloqueio. Com a regra do caminho 2, uma
   liberação vale para todos; no caminho 1, você aprova cada pedido.
