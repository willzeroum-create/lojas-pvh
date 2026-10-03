# 03 — Caixa e recebimento (ERP Olímpia)

> Cobre o recebimento (atalho "Caixa"), a tela `/financeiro/caixa` e os cinco
> relatórios de caixa do menu. Exploração de 2026-10-03, só de leitura, na conta de
> teste "Boi Criolo" (plano Full, perfil ADMIN). **Nenhuma rota deste documento
> abriu**: o que segue vem do que outras telas, os parâmetros, a Central de
> Relatórios e o manual dizem sobre o caixa. Legenda: [visto], [visto em parte],
> [deduzido], [afirmado pelo manual], [código], [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

- **Onde fica:**
  - o atalho **"Caixa"** da seção "Operação do dia" (barra lateral) leva a
    `/financeiro/recebimento`, e **não** a `/financeiro/caixa` [visto; ver
    [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)]. A tela
    que o ERP chama de "Caixa" no dia a dia parece ser a de recebimento [deduzido];
    o papel de `/financeiro/caixa` continua desconhecido;
  - o atalho "Receber" da Consulta Cliente abre
    `/financeiro/recebimento?filtro=cliente&consulta={id}` [visto como link; ver
    [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)]. O recebimento
    aceita filtrar por cliente, o que indica que também dá baixa em títulos a
    receber do cliente, e não só em vendas do balcão [deduzido];
  - os relatórios de caixa ficam no grupo **"Caixa"** do hub Relatórios (5 cartões:
    caixa com vendedor, conferência cega, histórico, suprimentos e sangrias) e na
    categoria "Caixa" da Central [visto; ver
    [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)].
- **Plano:** os módulos "Financeiro (Contas a Pagar/Receber, Caixa)" e "PDV /
  Frente de Caixa" fazem parte dos 36 do plano Full [visto em `/meu-plano`].
- **Manual** [afirmado pelo manual; ver [22-manual.md](22-manual.md)]:
  - PDV: abrir o caixa, com sangrias e **reforços**; o fechamento de caixa está
    ligado ao financeiro;
  - Financeiro: "fechamento de caixa ligado ao PDV";
  - Integração bancária: marcar "Gerar QRCode PIX" no Tipo de Recebimento faz o
    PIX aparecer **no caixa e no PDV** (ver
    [11-financeiro-bancos.md](11-financeiro-bancos.md)).
  - "Reforço" (manual) e "suprimento" (relatório) devem ser a mesma coisa:
    entrada manual de dinheiro no caixa [deduzido].
- **Sinais noutras telas do Financeiro** (ver
  [11-financeiro-bancos.md](11-financeiro-bancos.md)):
  - a Conciliação bancária mostra o selo **"Sem caixa — baixa em modo direto"**:
    existe uma configuração que decide se as baixas passam por uma sessão de caixa
    ou entram direto na conta [deduzido, a verificar onde se configura];
  - a Movimentação bancária tem a coluna **"Caixa"** em cada lançamento [visto];
  - os boletos são gerados **a partir do recebimento**, com o cedente padrão (aviso da
    lista vazia de `/financeiro/boletos`) [visto];
  - o "Desfazer faturamento" bloqueia vendas que já têm recebimento (ver
    [02-vendas-pdv.md](02-vendas-pdv.md)) [visto no texto].

### 1.1 O que os parâmetros da empresa revelam sobre o caixa

A aba Parâmetros do cadastro da empresa tem um grupo **"Caixa / PIX" com 27
opções** (a aba inteira está em
[08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)). Muitos rótulos são
nomes crus de coluna, alguns com erro (ex.: "Caixa permirtiracresimo"). Síntese
[visto; rótulos interpretados]:

- **Fechamento cego** (conferência por forma de pagamento), com opções para **não
  totalizar** PIX (ligado), crédito, débito e crédito loja/convênio;
- **caixa central**, **pré-fechamento** e **senha no fechamento**;
- **emitir NFC-e no recebimento** (ligado);
- recibo; **enviar o fechamento por e-mail** (os e-mails têm também a opção
  "e-mail no fechamento de caixa");
- gerar parcelas de cartão e cheque no caixa;
- **"Controle POS"**: aplica as tarifas de cartão no PDV; tarifas POS;
- **transferir o saldo do caixa anterior**.

Noutros grupos:
- **PDV:** senha para **sangria** (campo de senha dentro dos parâmetros; o conteúdo
  não foi lido);
- **Financeiro:** juros, multa e dias de tolerância; número de autorização do
  cartão (ligado); percentuais TEF (crédito à vista, crédito parcelado, débito);
  **ligação banco × caixa** com conta do plano e tipo de documento para pagar,
  receber e POS (ver [11-financeiro-bancos.md](11-financeiro-bancos.md)).

### 1.2 Relatórios de caixa: o que se sabe e o que a moldura comum implica

A Central de Relatórios tem **8 relatórios na categoria "Caixa"**; 5 estão no menu
(e neste documento) e 3 só se acham pela Central [visto]:

| Slug | Filtros (Central) | O que mostra (cartão da Central) | Menu |
|---|---|---|---|
| `caixa-vendas-por-vendedor` | 4 | vendas recebidas por colaborador: quantidade, subtotal, descontos, bruto e ticket médio | sim ("caixa com vendedor") |
| `caixa-conferencia-cega` | 4 | fechamento cego por forma de pagamento: sistema, informado e diferença | sim |
| `caixa-historico` | 4 | linha do tempo de abertura e fechamento | sim |
| `caixa-suprimentos` | 3 | suprimentos (entradas manuais no caixa) | sim |
| `caixa-sangrias` | 3 | sangrias: operador, valor, motivo e quem autorizou | sim |
| `caixa-movimentacao` | 5 | créditos e débitos do caixa, com forma e usuário | só Central |
| `caixa-fechamento` | 3 | caixas fechados, com totais e operador | só Central |
| `caixa-cheques` | 3 | lançamentos de caixa em cheque | só Central |

Os três "só Central" são catalogados em
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md). Todos os
cartões dizem sair em PDF, Excel e CSV [visto].

**O que a moldura comum implica** [deduzido; a moldura está descrita em
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)]. Todos os
relatórios lidos até hoje seguem o mesmo molde; os de caixa devem seguir também:

- título, frase de explicação e "← Central";
- um cartão de filtros que é um formulário GET para a própria rota, com
  `executar=1` (o relatório filtrado vira um link que se pode guardar);
- período "Data inicial" (`de`) e "Data final" (`ate`), padrão do dia 1 do mês até
  hoje; **a contagem de filtros da Central conta as duas datas em separado**, logo
  os relatórios com 3 filtros têm o período e mais 1 filtro, e os com 4 têm o
  período e mais 2;
- lupas (campo só de leitura, "Pesquisar" e "Limpar", id num campo oculto) para
  pessoas e usuários: o operador do caixa deve ser escolhido pela lupa `usuario`
  ("Pesquisar — Operador") e o vendedor pela `pessoa_colaborador` [deduzido];
- listas de status ou texto livre; nenhum campo obrigatório; texto em maiúsculas;
- um único botão "Gerar"; exportar e imprimir só depois de gerar;
- exportação na hora, até um limite por relatório; a fila de "Processamentos" ainda
  não funciona.

### 1.3 Rotas e estado

| Rota | Nome | Estado |
|---|---|---|
| `/financeiro/recebimento` | Caixa (atalho) / recebimento | não aberta |
| `/financeiro/caixa` | não conhecido | recusada (primeira rota tentada; navegação negada) |
| `/relatorios/caixa-vendas-por-vendedor` | caixa com vendedor | não aberta (só o cartão da Central) |
| `/relatorios/caixa-conferencia-cega` | conferência cega | não aberta (só o cartão da Central) |
| `/relatorios/caixa-historico` | histórico | não aberta (só o cartão da Central) |
| `/relatorios/caixa-suprimentos` | suprimentos | não aberta (só o cartão da Central) |
| `/relatorios/caixa-sangrias` | sangrias | não aberta (só o cartão da Central) |

Sub-rotas descobertas: só `/financeiro/recebimento?filtro=cliente&consulta={id}`
(link da Consulta Cliente).

## 2. Telas

### 2.1 `/financeiro/recebimento` — Recebimento (atalho "Caixa") [não aberta]

- **O que se sabe:** é o destino do atalho "Caixa" e do "Receber" da Consulta
  Cliente (com `filtro=cliente&consulta={id}`); os boletos nascem aqui, com o
  cedente padrão; o parâmetro "emitir NFC-e no recebimento" está ligado; o PIX por
  QR aparece no caixa quando o tipo de recebimento tem "Gerar QRCode PIX" (seção
  1). Uma venda com recebimento já não pode ser devolvida a orçamento.
- **Perguntas a responder:**
  - se é uma baixa de contas a receber (crediário, fiado, boletos), uma tela de
    recebimento no balcão, ou as duas coisas;
  - o que aparece para receber: vendas do balcão, comandas, pedidos do cardápio,
    contas a receber, OS;
  - como se escolhe o cliente ou o título; se aceita pagamento parcial, juros,
    multa e desconto em parcelas atrasadas;
  - formas de pagamento, pagamento dividido, troco, maquininha/TEF, PIX com QR,
    cashback;
  - se exige caixa aberto e a que caixa e operador o recebimento é atribuído (e o
    que muda no modo "sem caixa — baixa em modo direto");
  - emissão de NFC-e ao receber; geração do boleto (que campos pede).

### 2.2 `/financeiro/caixa` — Caixa [não aberta]

- **O que se sabe:** nada da tela. Pelo manual e pelos parâmetros, o caixa tem
  abertura, sangria, reforço (suprimento) e fechamento, com fechamento cego por
  forma de pagamento, caixa central, pré-fechamento, senha no fechamento e
  transferência do saldo do caixa anterior (seção 1.1). O relatório
  `caixa-historico` fala de abertura e fechamento; `caixa-fechamento`, de caixas
  fechados com totais e operador.
- **Perguntas a responder:**
  - **abertura:** saldo inicial, operador, terminal; quem pode operar; se há mais
    de um caixa ou terminal ao mesmo tempo; o que é o "caixa central";
  - **movimentos:** venda, recebimento, suprimento, sangria, troco, estorno, cheque;
    como cada um afeta o saldo;
  - **fechamento:** valor contado por forma de pagamento; diferença (sobra ou
    falta); se o fechamento é cego e quem aprova; o que é o "pré-fechamento";
  - **estados** (aberto, pré-fechado, fechado, conferido, reaberto?) e transições
    permitidas;
  - se é esta tela que abre e fecha o caixa usado pelo PDV, ou se é outra coisa
    (por exemplo, a lista de caixas ou contas-caixa da empresa).

### 2.3 `/relatorios/caixa-vendas-por-vendedor` — Caixa com vendedor [não aberto]

- **Cartão da Central:** vendas recebidas por colaborador, com quantidade,
  subtotal, descontos, bruto e ticket médio; 4 filtros (período + 2) [visto].
- No hub, o cartão se chama "caixa com vendedor"; noutra passagem o nome visto foi
  "Relatório caixa com vendedor" [visto].
- **Contradição de fontes:** o catálogo da Central (coluna "Menu") e o grupo
  "Caixa" do hub dizem que este relatório **está no menu**; uma lista de sub-rotas
  feita noutra passagem o colocou entre os "só na Central". A primeira leitura é a mais
  detalhada (cartão a cartão); **a confirmar**.
- É um de pelo menos seis relatórios que mostram "vendas por vendedor" (ver
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)) [visto].
- **Perguntas a responder:** quais são os 2 filtros além do período (vendedor?
  operador? forma de pagamento?); diferença entre "vendedor" e "operador do caixa";
  se "recebidas" quer dizer pagas no caixa ou também títulos baixados depois.

### 2.4 `/relatorios/caixa-conferencia-cega` — Conferência cega [não aberto]

- **Cartão da Central:** fechamento cego por forma de pagamento, com o valor do
  sistema, o valor informado e a diferença; 4 filtros (período + 2) [visto].
- Está ligado aos parâmetros de fechamento cego, que podem deixar de fora do total
  PIX (ligado), crédito, débito e crédito loja/convênio [visto nos parâmetros].
- **Perguntas a responder:** o que o operador informa sem ver o valor esperado; o
  que o sistema compara; como mostra a diferença por forma de pagamento; quem vê o
  valor esperado e quem aprova a diferença; quais os 2 filtros além do período
  (caixa? operador?).

### 2.5 `/relatorios/caixa-historico` — Histórico do caixa [não aberto]

- **Cartão da Central:** linha do tempo de abertura e fechamento; 4 filtros
  (período + 2) [visto].
- **Perguntas a responder:** colunas (operador, abertura, fechamento, saldo
  inicial e final, diferença); que eventos ficam guardados (abertura, fechamento,
  reabertura, pré-fechamento) e com que detalhe; filtros; se dá para reabrir um
  caixa ou só consultar.

### 2.6 `/relatorios/caixa-suprimentos` — Suprimentos [não aberto]

- **Cartão da Central:** suprimentos, isto é, entradas manuais no caixa; 3 filtros
  (período + 1) [visto].
- **Perguntas a responder:** campos de cada lançamento (valor, motivo ou
  categoria, quem fez, quem autorizou, origem do dinheiro); qual é o filtro além do
  período; se imprime comprovante.

### 2.7 `/relatorios/caixa-sangrias` — Sangrias [não aberto]

- **Cartão da Central:** sangrias com operador, valor, motivo e **quem autorizou**;
  3 filtros (período + 1) [visto].
- A sangria pede senha no PDV (parâmetro "senha para sangria") [visto nos
  parâmetros]; o "quem autorizou" do relatório deve vir daí [deduzido].
- **Perguntas a responder:** destino do dinheiro (cofre, banco); se a sangria gera
  lançamento no financeiro ou na conta bancária; se imprime comprovante; qual é o
  filtro além do período.

## 3. Fluxos de ponta a ponta

Nenhum fluxo foi observado dentro destas telas. Os encadeamentos abaixo vêm do
manual, dos parâmetros e dos relatórios e estão **a verificar**.

1. **Ciclo do caixa** [afirmado pelo manual + parâmetros]:
   1. Abrir o caixa (saldo inicial; talvez transferido do caixa anterior).
   2. Vendas no PDV e recebimentos (NFC-e no recebimento, se ligado; PIX por QR;
      TEF/POS com tarifas).
   3. Suprimentos (reforços) e sangrias (com senha).
   4. Pré-fechamento (se ligado).
   5. Fechamento cego: o operador informa os valores por forma de pagamento; o
      sistema compara e mostra a diferença; senha no fechamento (se ligada).
   6. Fechamento enviado por e-mail (se ligado) e ligado ao financeiro.
   7. Relatórios: conferência cega, histórico, suprimentos, sangrias, fechamento,
      movimentação.
2. **Recebimento de títulos:** Consulta Cliente → "Receber" (recebimento filtrado
   pelo cliente) → baixa da parcela → o título passa a pago (`1`); numa OS, ela
   passa a "Quitado" (ver [14-os-forca-vendas.md](14-os-forca-vendas.md) e
   [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md)). Pode também
   gerar boleto (com o cedente padrão) ou cobrança PIX.
3. **Venda → recebimento → vendedor:** o que é recebido alimenta "caixa com
   vendedor", "Vendas x recebimento por vendedor" e a comissão por recebimento (ver
   19 e 20).
4. **Do pedido ao caixa** (hipótese a confirmar): pedido (balcão, comanda ou
   cardápio online) → cozinha → recebimento no caixa → fechamento com conferência
   cega → relatórios de caixa. Também: venda travada → liberação → recebimento;
   troca → estoque e crédito do cliente → caixa (ver
   [02-vendas-pdv.md](02-vendas-pdv.md)).

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| Caixa (sessão) | abertura, saldo inicial, operador, pré-fechamento, fechamento, totais [afirmado pelo manual / cartões da Central] | recebe as vendas do PDV e os recebimentos; ligado ao financeiro e talvez a uma conta (ligação banco × caixa) |
| Movimento de caixa | crédito ou débito, forma de pagamento, usuário, valor, data [cartão `caixa-movimentacao`] | pertence a um caixa |
| Suprimento (reforço) | valor, operador, data; motivo [a verificar] | movimento de entrada manual |
| Sangria | operador, valor, motivo, quem autorizou [cartão da Central] | movimento de saída; pede senha no PDV |
| Conferência cega | forma de pagamento, valor do sistema, valor informado, diferença [cartão da Central] | uma por fechamento e forma |
| Lançamento em cheque | — [cartão `caixa-cheques`] | movimento de caixa |
| Recebimento | cliente, título(s) ou venda, forma de pagamento, valor | baixa parcelas a receber; pode gerar boleto, PIX e NFC-e |
| Tipo de recebimento | marca "Gerar QRCode PIX" | liga o PIX ao caixa e ao PDV (ver 11) |

## 5. Integrações

- **TEF / POS:** percentuais TEF e "Controle POS" com tarifas de cartão; gaveta,
  impressora e balança pelo PDV (ver [02-vendas-pdv.md](02-vendas-pdv.md)) [visto
  nos parâmetros].
- **PIX por QR** no caixa e no PDV, pelo provedor escolhido na integração bancária
  [afirmado pelo manual; ver 11]. O relatório de PIX fala em cobranças com "txid",
  o que indica PIX dinâmico gerado por um provedor (no PDV, no caixa ou em link de
  pagamento) [deduzido; ver 19].
- **SEFAZ:** NFC-e emitida no recebimento (parâmetro ligado) [visto nos
  parâmetros].
- **Boletos:** gerados a partir do recebimento, com o cedente padrão [visto no
  aviso].
- **E-mail:** envio do fechamento de caixa [visto nos parâmetros].

## 6. Oportunidades de UX

1. **Nomes trocados:** o atalho "Caixa" abre o recebimento, e existe outra tela em
   `/financeiro/caixa`. Se forem funções diferentes com nomes parecidos, confunde o
   operador [visto / a verificar].
2. **Jargão:** o selo "Sem caixa — baixa em modo direto" não diz o que muda nem
   onde se troca; parâmetros com nome de coluna e erros de digitação ("Caixa
   permirtiracresimo") [visto].
3. **Relatórios espalhados:** dos 8 relatórios de caixa, 3 só se acham pela Central
   (o de fechamento de caixa, útil para comércio de alimentação, é um deles); "caixa
   com vendedor" repete o que outros cinco relatórios de "vendas por vendedor" já
   mostram [visto].
4. **Senha única para sangria** guardada nos parâmetros [visto]. **[proposta]**
   Aprovação do gerente com o próprio login e registro de quem autorizou.
5. **Vale copiar:** o fechamento de caixa **cego e configurável por forma de
   pagamento** (podendo deixar PIX de fora, porque o PIX já é conferido pelo banco),
   o pré-fechamento e o envio do fechamento por e-mail [visto nos parâmetros].
6. **[proposta]** Para o pequeno comerciante de alimentação: uma única tela "Caixa"
   (abrir, receber, sangria/suprimento, fechar às cegas) com o resumo do dia, PIX
   conferido automaticamente pelo aviso do banco e um só relatório de caixa com
   "agrupar por" (operador, forma, dia).

## 7. Pendências

- **Bloqueio:** a primeira rota tentada (`/financeiro/caixa`) foi recusada pela
  trava do modo automático do Claude Code (motivo "Third-Party Attack"), antes de a
  página carregar. Noutra passagem, a primeira rota da lista (que não era deste
  documento) teve a mesma recusa e as rotas de caixa ficaram por tentar. **Não foi
  problema de login nem de credencial:** a sessão aberta nem chegou a ser usada.
  Não houve nova tentativa por outro caminho; a aba criada foi fechada; nada foi
  clicado, digitado ou gravado. Completar depende de o dono da conta autorizar a
  leitura.
- **Todas as 7 rotas** estão por abrir. Começar por `/financeiro/recebimento` e
  `/financeiro/caixa`: os relatórios dependem deles.
- **Perguntas abertas:** as das seções 2.1 a 2.7; o significado e o lugar de
  configuração do selo "Sem caixa — baixa em modo direto"; o que é o "caixa
  central"; se o cashback vira forma de pagamento no caixa (ver
  [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md)); como
  funciona o recebimento com maquininha (a tela `/financeiro/tef` também não abriu;
  ver 11).
- **Contradição a confirmar:** se `caixa-vendas-por-vendedor` está no menu ou só na
  Central (2.3).
- **Conteúdo dos relatórios:** mesmo abertos, "Gerar" está proibido nesta pesquisa
  e a conta não tem movimento; colunas e totais teriam de ser vistos numa conta com
  dados e com autorização para gerar.
- **Permissões:** quem pode abrir e fechar caixa, fazer sangria e ver o valor
  esperado na conferência cega (tudo foi visto como ADMIN; ver 08).
