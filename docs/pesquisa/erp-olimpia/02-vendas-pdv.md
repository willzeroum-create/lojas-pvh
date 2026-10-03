# 02 — Vendas, PDV, faturamento, liberações, trocas e romaneios (ERP Olímpia)

> Cobre as telas de venda (balcão, PDV, venda direta pelo celular, balcão de
> entrega), o faturamento em lote de orçamentos, a fila de liberações de
> supervisor, a troca de produto e o romaneio de carga. Exploração de 2026-10-03,
> só de leitura, na conta de teste "Boi Criolo" (plano Full, perfil ADMIN).
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual], [código]
> (lido no HTML/JS da página), [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

**Não existe um módulo "Vendas" no menu** [visto]. As telas de venda estão
espalhadas:

- **Atalhos rápidos → "Operação do dia"** (barra lateral): Venda Balcão (`/vendas`),
  Venda PDV (`/pdv`), Venda Direta Mobile (`/garcom/mobile-venda`) e Caixa
  (`/financeiro/recebimento`, ver [03-caixa.md](03-caixa.md)), além de Ordem de
  Serviço e Mensalidades [visto; lista completa em
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)].
- **Lançador do Estoque** (`/dashboard/modulo/estoque`, ver
  [09-estoque.md](09-estoque.md)) [visto]:
  - bloco **Expedição & Vendas**: "Pedido de venda" (`/vendas`), "Faturamento de
    vendas" (`/financeiro/faturamento`), "Balcão entrega" (`/balcao-entrega`) e
    "Romaneio de carga" (`/romaneios`);
  - bloco **Movimentações**: "Troca de produto" (`/troca-produto`), ao lado das
    entradas, saídas e transferências.
  - Cada cartão tem "Adicionar aos atalhos" (não clicado).
- **Financeiro → Liberações** (`/financeiro/liberacoes`): a fila do gestor
  [visto no texto da tela de faturamento].
- A mesma tela `/vendas` tem dois nomes: "Venda Balcão" nos atalhos e "Pedido de
  venda" no lançador do Estoque [visto]. O manual a chama de "Pedido de Venda".
- O "Faturamento de Vendas" fica no menu de Estoque, mas a URL é `/financeiro/...`
  [visto].
- Os orçamentos não têm item próprio no menu: aparecem num relatório e, pelo BI
  ("Orçamentos pendentes" → "Faturar"), levam ao Faturamento de Vendas [visto; ver
  [01-dashboard-bi-tv.md](01-dashboard-bi-tv.md)].

**Plano:** os 36 módulos do plano Full incluem "Vendas", "PDV / Frente de Caixa" e
"Balcão de Entrega". Pela hipótese da ordem dos escalões (não confirmada), os três
já viriam no plano Profissional [visto em `/meu-plano`; ver
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)].

**Manual** (cartões "Vendas & Orçamentos" e "PDV / Frente de Caixa"; ver
[22-manual.md](22-manual.md)) [afirmado pelo manual]:
- venda: pedido com cliente e produtos; orçamento convertido em venda faturada;
  estoque e contas a receber automáticos; NF-e ou NFC-e conforme a operação;
- PDV: entrar pelo "menu Vendas" (que não existe); abrir o caixa, com sangrias e
  reforços; vários meios de pagamento e TEF; NFC-e automática quando configurada;
  o subtítulo cita balança.

### 1.1 Códigos e estados que as telas deixam ver [visto]

| Conceito | Valores |
|---|---|
| Status da venda | `0` Orçamento · `1` Venda (finalizada) · `2` Cancelada |
| Modalidade da venda (filtro de relatório) | `retirada` Retirada na loja · `entrega` Entrega · `loja` Loja / PDV |
| Status da liberação | `0` Pendente · `1` Liberado · `2` Negado · `todos` (iguais na fila e no relatório) |
| Financeiro processado (venda do lote) | `1` Sim · `0` Não |
| Status do romaneio (tela de trabalho) | `0` Pendente · `1` Concluído · `2` Cancelado |
| Status do romaneio (relatório) | `0` Aberto · `1` Finalizado (sem "Cancelado") |

- **Orçamento, venda e venda cancelada são o mesmo documento** em estados
  diferentes [visto nos filtros de relatório]. Um orçamento que vira venda muda de
  estado; não nasce outro documento [deduzido].
- **Cancelar uma venda** exige um motivo e registra o usuário e a data: o
  cancelamento é um evento auditável [deduzido do relatório de cancelamentos; ver
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)].

### 1.2 O que os parâmetros da empresa revelam sobre estas telas

A aba Parâmetros do cadastro da empresa tem cerca de 420 opções (a tabela
completa está em [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)).
Muitas usam o nome cru da coluna do banco como rótulo (ex.: "Venda bloq frete").
O que toca as telas deste documento [visto; rótulos interpretados quando eram nomes
de coluna]:

- **Vendas (62 opções):**
  - momento da baixa de estoque: na finalização da venda **ou no balcão de
    entrega**;
  - desconto máximo (%) e controle de desconto por vendedor/usuário: acima do
    limite, pede **liberação com senha**;
  - listar só os clientes do vendedor; vendedor automático a partir do cadastro do
    cliente;
  - bloquear alterações sensíveis (reabrir venda finalizada, cancelar orçamento...);
  - bloquear venda com estoque negativo; bloquear cliente inadimplente (**ligado**
    nesta conta);
  - preços por forma de pagamento, preços de cartão crédito/débito no produto,
    preços por modalidade da venda (loja, retirada...), tabela de preço,
    atacado/varejo (tipo e valor), juros por forma de pagamento;
  - ordem dos itens na impressão (ID, descrição ou item), separada para
    romaneio/separação, espelho, nota fiscal, orçamento e venda;
  - impressão com canhoto de assinatura, conferência de mercadoria (conferentes),
    ocultar foto, ocultar dados da empresa;
  - tipo de comissão (nenhuma, por produto, por vendedor, por recebimento, por forma
    de pagamento, por vendedor/produtos; ver
    [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md));
  - outros: gamificação, gerar boleto automático, tarifa do entregador, limite de
    compra, comissão da plataforma, percentuais de ICMS/ST.
- **PDV (58 opções):**
  - cliente padrão e forma de pagamento padrão (lupas);
  - desconto geral (ligado) e desconto por item;
  - pedir vendedor ao abrir; pedir CPF no cupom; escolher cliente no início;
  - atalhos Ctrl+M, Ctrl+P, End, Esc e F2 a F11, cada um pode ser desligado (todos
    ligados);
  - usa balança (ligado) e código de pesagem;
  - comanda; extrato de mesa no fechamento; couvert (valor) e taxa de serviço (%);
  - TEF: autoemissão da NFC-e (ligado); forçar NFC-e em venda com cartão;
  - senhas para sangria, cancelar item e cancelar venda, guardadas como campos de
    senha dentro dos parâmetros (o conteúdo não foi lido).
- **Fiscal:** NFS-e no PDV no lugar de NFC-e para serviços; ISS no PDV para
  cartório (ver [13-fiscal.md](13-fiscal.md)).
- **Tela Pesquisa (7):** busca por início ou qualquer parte do nome, ordem por
  ID/GTIN, mostrar saldo negativo, limite de itens. Deve valer para a busca de
  produto na venda e no PDV [deduzido].
- **Outros (17):** inclui **cupom de troca** e **liberação online** (se ligam à
  troca e à fila de liberações) e cashback.
- **E-mails:** conta SMTP própria de "venda" e resumo de vendas semanal e mensal.
- Os parâmetros de **Caixa / PIX** estão em [03-caixa.md](03-caixa.md); os de
  Força de vendas em [14-os-forca-vendas.md](14-os-forca-vendas.md).

**Parâmetros do Sistema** (`/parametros-sistema`, hardware herdado do desktop; ver
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)) [visto]:
- o PDV web (Chrome/Edge) lê a balança pela **Web Serial API**; na primeira vez
  se escolhe a porta USB no próprio PDV (**F9 → Porta USB**); a etiqueta da balança
  (peso ou valor, dígitos) define como o PDV decodifica o código de barras pesado;
- aba PDV: cores do PDV (Descritivos, Painel lateral, Painel topo, Painel rodapé,
  Texto); "Bloquear pesquisa por descrição"; "Imprimir CP/NF direto (ficha bar)";
  "Abrir tela de mesas automaticamente"; TEF DIAL (ativo, time sleep, time status,
  auto ativar gerenciador padrão, múltiplos cartões, auto finalizar cupom, CHQ em
  gerencial);
- aba Olimpia Bridge: hardware no PDV "Desligado" (Web Serial no navegador e gaveta
  pelo servidor, padrão), "Olimpia Bridge" (agente local em `127.0.0.1:9876`) ou
  "Automático"; gaveta Epson, Bematech, Sweda ou Elgin; reenvio automático de NFC-e
  e impressora própria da NFC-e.

**Fiscal:** o grupo tributário tem as operações de saída "Venda", "Venda PDV ON" e
"Venda PDV OFF", e a de entrada "Devolução de venda do PDV ON" [visto; ver
[13-fiscal.md](13-fiscal.md)]. Indica um PDV com modo online e offline [deduzido,
a confirmar]. A conta tem 8 grupos "VENDA" (NF-e ou NFC-e × Venda ou Venda PDV
ON × com ou sem ST), que parecem vir prontos numa conta nova (a verificar).

**Pessoas:** o colaborador tem um "limite de convênio ou de compras no PDV (R$)",
obrigatório quando a forma de pagamento "gera convênio colaborador" [visto; ver
[08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)].

### 1.3 Rotas e estado

| Rota | Nome | Estado |
|---|---|---|
| `/vendas` | Venda Balcão / Pedido de venda | não aberta (vista só como link) |
| `/pdv` | Venda PDV | não aberta |
| `/garcom/mobile-venda` | Venda Direta Mobile | não aberta |
| `/balcao-entrega` | Balcão entrega | não aberta (vista só como link) |
| `/financeiro/faturamento` | Faturamento de Vendas | lida (janelas lidas na estrutura da página, sem abrir) |
| `/romaneios` | Romaneio de carga (FrmRomaneio_Carga) | lida (lista vazia) |
| `/romaneios/create` | Novo romaneio de carga | lida; "Salvar" não clicado |
| `/financeiro/liberacoes` | Liberação de Vendas | lida (lista vazia) |
| `/troca-produto` | Troca de produto | parcial (a leitura da lógica da tela foi recusada) |

## 2. Telas

### 2.1 `/vendas` — Venda Balcão / Pedido de venda [não aberta]

- **O que se sabe:**
  - atalho "Venda Balcão" em "Operação do dia" e cartão "Pedido de venda" no
    lançador do Estoque [visto];
  - o botão "Orçamento" da OS leva a esta tela: o orçamento não é feito na OS
    [visto; ver [14-os-forca-vendas.md](14-os-forca-vendas.md)];
  - links com filtro na URL: `/vendas?id_cliente={id}` (atalho "Vendas" da Consulta
    Cliente) e `/vendas?status=1` (indicadores do BI) [visto como link];
  - origens de um orçamento (venda em status 0): esta tela, o botão "Orçamento" da
    OS, o app Força de Vendas e o "Agente de Vendas IA" no WhatsApp, que cria
    vendas ou orçamentos pelo conector MCP e avisa o operador com a janela "Novo
    pedido WhatsApp" (Tipo Orçamento ou Venda, Cliente, WhatsApp, Total,
    Data/hora; botões "Ver operação" e "Confirmar recebimento") [visto na
    moldura; ver [17-consultoria-ia.md](17-consultoria-ia.md)];
  - a venda guarda modalidade (retirada, entrega, loja/PDV), cliente, vendedor,
    forma de pagamento, totais, desconto, acréscimo, documento fiscal e itens com
    custo gravado e % e valor de comissão [deduzido dos relatórios];
  - pedidos da loja virtual e do Mercado Livre também viram vendas na mesma tabela
    [deduzido; ver [06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md)].
- **Perguntas a responder:**
  - lista: colunas, filtros, estados e totais;
  - formulário: cliente, vendedor, tabela de preço, condição e forma de pagamento,
    desconto (limite e liberação por senha ou perfil), frete, observações; itens com
    quantidade, preço e desconto;
  - transições: orçamento → venda; venda → nota (NF-e ou NFC-e); venda → contas a
    receber; reserva e baixa de estoque; comissão;
  - impressão (A4, cupom) e envio por WhatsApp.

### 2.2 `/pdv` — Venda PDV [não aberta]

- **O que se sabe:** atalho "Venda PDV" [visto]; tudo o resto vem dos parâmetros
  (1.2) e do manual: atalhos de teclado F2 a F11, Ctrl+M, Ctrl+P, End e Esc; F9 →
  Porta USB para a balança; balança e código de pesagem; cliente e forma de
  pagamento padrão; couvert e taxa de serviço; comanda e extrato de mesa; abrir a
  tela de mesas automaticamente; TEF Dial; NFC-e automática (forçada em venda com
  cartão); senhas para sangria e cancelamentos; PIX por QR quando o tipo de
  recebimento tem "Gerar QRCode PIX" (ver [11-financeiro-bancos.md](11-financeiro-bancos.md)).
  Um operador pode pedir **liberação** a partir do PDV (2.7). O "Assistente
  Olimpia" diz responder dúvidas de PDV [visto]. O TEF é configurado em
  Financeiro › TEF (ver 11). Os Parâmetros do Sistema têm ainda o leitor serial de
  código de barras (ACBrLCB) e o arquivo para o terminal consulta-preço (ver 18).
- **Perguntas a responder:**
  - se exige caixa aberto (ver [03-caixa.md](03-caixa.md)); tela cheia ou modo
    quiosque;
  - formas de pagamento (dinheiro com troco, cartão por TEF ou POS, PIX com QR,
    crediário, vale, cashback, convênio do colaborador) e pagamento dividido;
  - NFC-e em contingência offline (operações "PDV ON/OFF"), CPF na nota,
    cancelamento e permissão de supervisor;
  - sangria e suprimento dentro do PDV.

### 2.3 `/garcom/mobile-venda` — Venda Direta Mobile [não aberta]

- **O que se sabe:** atalho em "Operação do dia"; usa o prefixo do garçom, mas com
  outro nome [visto]. O PWA do garçom (`/garcom/app` → `/garcom/v/{slug}/login`)
  pede empresa, usuário e senha do ERP (ver
  [04-cardapio-comanda-cozinha.md](04-cardapio-comanda-cozinha.md)).
- **Perguntas a responder:** o que muda em relação ao PDV e à comanda do garçom; se
  cobra no próprio celular; se emite NFC-e; se imprime em impressora remota; se usa
  mesa ou comanda.

### 2.4 `/balcao-entrega` — Balcão de entrega [não aberta]

- **O que se sabe:** cartão "Balcão entrega" no bloco Expedição & Vendas do
  Estoque [visto]; módulo "Balcão de Entrega" no plano [visto]; um parâmetro de
  vendas permite **baixar o estoque na entrega no balcão** em vez de na finalização
  da venda [visto]. Daí: a venda pode ser finalizada num momento e a mercadoria
  entregue (e baixada) noutro [deduzido].
- **Perguntas a responder:** se é a fila de pedidos prontos para retirada ou
  entrega; que estados tem e quem os muda; ligação com cozinha, delivery, Painel TV
  e aviso ao cliente por WhatsApp.

### 2.5 `/financeiro/faturamento` — Faturamento de Vendas [visto]

- **Objetivo:** transformar em vendas, de uma vez, os orçamentos de um vendedor,
  conferindo estoque, preços e regras. É a tela que **cria** os lotes que os
  relatórios de faturamento leem (ver
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)). Fica
  no menu "Estoque · Expedição & Vendas", e não no Financeiro, apesar da URL.
- **Assistente em 3 passos:** 1 Vendedor → 2 Seleção → 3 Conferir & Gerar.
  - **Passo 1:**
    - Vendedor (lupa `pessoa_colaborador`, obrigatório; o rótulo mostra dois
      asteriscos, "Vendedor * *");
    - De e Até (padrão: hoje);
    - chave "Só enviados pelo app" (**ligada por padrão**);
    - botão "Buscar"; o aviso diz que a busca dos orçamentos é automática depois de
      escolher o vendedor.
  - **Orçamentos pendentes:** lista dos orçamentos do vendedor ("0 registro(s)";
    vazia, porque a conta não tem vendedores).
  - **Passo 3** [visto na estrutura da página, não exibido]:
    - cartão "Conferência de estoque, preços e regras";
    - caixa "Conferi e aprovo as divergências apresentadas";
    - botão "Aprovar bloqueios com senha";
    - botão **"Gerar vendas e imprimir"**, que envia para
      `/financeiro/faturamento/gerar` (POST);
    - campos ocultos `analise_hash` (garante que o lote gerado é o mesmo que foi
      conferido [deduzido]) e `aprovar_divergencias` (0/1).
- **Regras da geração** (botões "Configurar regras" e "Nova regra", janela "Regras
  personalizadas da geração") [visto na estrutura da página]:
  - são regras **adicionais**; a tela avisa que as validações obrigatórias do ERP
    (estoque, preço, limite) não podem ser desligadas;
  - formulário da regra:

| Campo | Tipo | Obrigatório | Opções |
|---|---|---|---|
| Nome da regra | texto | sim | — |
| O que conferir | lista | sim | 24 tipos (abaixo) |
| Limite | número | depende do tipo | — |
| Quando não for atendida | rádio | — | **Avisar** (deixa aprovar) · **Bloquear** (impede gerar) |
| Usar esta regra na geração | caixa | — | desmarcada = guarda a regra como modelo, sem aplicar |

  - **os 24 tipos de regra:**
    - valor do pedido: mínimo e máximo;
    - desconto: máximo em %, máximo em R$, máximo por item e proibir qualquer
      desconto;
    - preço: divergência máxima em % e em R$ contra o cadastro, preço abaixo do
      cadastro, proibir preço zero, valor unitário mínimo e valor líquido mínimo
      por item;
    - estoque: saldo mínimo depois do lote e estoque insuficiente no lote;
    - quantidades: máximo e mínimo por item, total máximo do pedido, mínimo e
      máximo de itens;
    - acréscimo: acréscimo máximo;
    - origem e dados: só pedidos do Força de Vendas, exigir observação, exigir
      forma de pagamento e exigir cliente identificado.
  - **35 modelos prontos**, cada um com tipo, valor e nível. Exemplos: "bloquear
    desconto acima de 10%", "avisar preço divergente acima de 5%" e "pedido mínimo
    de R$ 200 (bloqueia)".
- **Liberação de supervisor** (janela) [visto na estrutura da página]:
  - campos Usuário (lista; aqui só "ADMIN") e "Senha de liberação";
  - botão **"Solicitar remota"**: manda o pedido para o gestor aprovar em
    Financeiro → Liberações (2.7); enquanto isso, a janela mostra "aguardando
    liberação" e o número da solicitação;
  - botões Cancelar e Liberar.
- **Desfazer faturamento** (janela) [visto na estrutura da página]:
  - as vendas voltam a ser orçamentos;
  - o estoque e as parcelas ainda não movimentados são estornados;
  - ficam **bloqueadas** as vendas que já têm nota fiscal, recebimento, cartão,
    boleto, entrega ou troca;
  - o motivo é obrigatório e fica gravado para sempre no histórico.
- **Quadros da tela:**
  - "Resumo de faturamento no período" (Qtde, Vendedor, Total); o relatório
    "Faturamento por vendedor" deve ser a versão exportável deste quadro
    [deduzido];
  - "Histórico de faturamentos" (Lote, Data e hora, Usuário, Vendas, Total, Status,
    Ações), com os últimos lotes. Estava vazio.
- **Marcas por venda do lote** [visto no relatório "vendas do lote"]: "estoque
  processado" e "financeiro processado". Cada venda gerada pelo lote movimenta o
  estoque e cria as parcelas a receber; se uma etapa falha ou fica para depois, a
  marca fica em "Não" [deduzido].
- **Não clicados:** Gerar vendas e imprimir, Salvar regra, Aprovar, Liberar,
  Solicitar remota, Desfazer lote. Nada foi digitado em campos de senha.

### 2.6 `/romaneios` — Romaneio de carga [visto]

A tela mostra o nome "FrmRomaneio_Carga", formulário do sistema Delphi. O sistema
antigo tinha também uma tela `FrmRomaneio_Rota` (ver
[14-os-forca-vendas.md](14-os-forca-vendas.md)).

- **Ações no topo** (rótulo visível → nome completo):
  - **Inserir** → `/romaneios/create`;
  - **Rota** → "Ver rota otimizada";
  - **Romaneio** → "Imprimir romaneio";
  - **Separação** → "Imprimir separação";
  - **Imprimir rota** → "Imprimir itinerário".
  - As três impressões dependem de um romaneio selecionado.
- **Filtros:** De e Até (mês corrente); Status: Todos, Pendente (0), Concluído (1),
  Cancelado (2); Rota: só "Todas rotas", porque não há rotas cadastradas; botão
  Pesquisar.
- **Lista principal:** ID, Data, Hora, Motorista, Veículo, Rota, Valor, Peso,
  Volumes, NF e Status. Está vazia.
- **Detalhe "Vendas do romaneio selecionado":** Ordem, Venda, Cliente, Endereço,
  Data, Distância, Tempo, Volumes, Valor, Peso, NF e Pagamento.
- **Rodapé "Dados complementares":** o componente genérico do ERP que mostra pares
  chave: valor do registro selecionado.
- O relatório `estoque-romaneio` usa os mesmos códigos com outros nomes
  ("Aberto/Finalizado") e não tem "Cancelado" (ver
  [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)).

#### `/romaneios/create` — Novo romaneio de carga [visto]

**Cabeçalho**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| ID | só leitura | — | gerado ao salvar ("—") |
| Data | data | — | hoje |
| Hora | hora | — | agora |
| Status | só leitura | — | Pendente |
| Usuário abertura | só leitura | — | o usuário logado |
| Usuário fechamento | só leitura | — | preenchido ao concluir [deduzido] |
| Motorista | lupa | **sim** | — |
| Veículo | lupa | **sim** | — |
| Rota padrão | lista | não | só "—", porque não há rotas |

**Bloco "Vendas / NF-e do romaneio"**

- botões **Adicionar vendas** e **Remover selecionadas**, e uma caixa "Marcar
  todas";
- colunas: Ordem, Venda, Cliente, Endereço, Distância, Tempo, NF-e, Chave, Valor,
  Peso bruto, Peso líquido, Volumes, Rota e Emb. (sentido não confirmado);
- sem vendas, a tela pede que se escolha a rota e se clique em "Adicionar vendas";
- totais: valor, peso bruto, peso líquido, volumes e número de NF-e.

**Botões:** Salvar (**não clicado**) e Voltar.

- Rota, Veículo (com os dados do MDF-e) e o cadastro de pessoas (motorista) estão
  em [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md). As lupas de
  Rota, Motorista e Veículo não foram abertas.

### 2.7 `/financeiro/liberacoes` — Liberação de Vendas [visto]

- **Objetivo:** fila em que o gestor aprova ou nega pedidos de **estoque, preço,
  limite e trocas**. É a fila que produz os dados do relatório "Liberações de
  venda" (ver [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)).
- **Indicadores:** "Pendentes" e "No filtro", com o selo **"Ao vivo · 5s"** (a lista
  se atualiza sozinha a cada 5 segundos [deduzido]).
- **Abas:** Pendentes, Liberados, Negados e Todos. São links com
  `status=0|1|2|todos`, `de`, `ate` e `filiais[]=1`: há filtro por filial.
- **Filtros:** De e Até (padrão: **últimos 7 dias**), "Localizar" e "Atualizar".
- **Colunas:** Nº, Data/Hora, Solicitante, Código, Contexto da solicitação, Tela,
  Status, Gestor, Ações. A lista estava vazia.
- O aviso da tela diz que o pedido aparece aqui sozinho quando um operador pede
  liberação na venda ou no PDV.
- **Regras [deduzido]:** o solicitante é um usuário do sistema (operador), não um
  colaborador; o gestor que decide também fica gravado; o pedido nasce numa venda,
  no PDV, no faturamento em lote ("Solicitar remota") ou numa troca. Os parâmetros
  "liberação online" e "controle de desconto por vendedor/usuário" (1.2) se ligam
  a esta fila.
- Nenhuma ação foi clicada (a lista estava vazia).

### 2.8 `/troca-produto` — Troca de produto [visto em parte]

- **Objetivo dito na tela:** a devolução **entra** no estoque, o produto novo
  **sai**, e a diferença vira **crédito no caixa** ou **título a receber**.
- **Campos:** Cliente (lupa, obrigatório) e Observação (opcional). **Não há campo
  de venda de origem**: a troca se liga ao cliente, e não a uma venda [visto; que dê
  para trocar sem venda de origem é dedução].
- **Duas grades**, cada uma com "Adicionar" e as colunas Produto, Qtd, Unit. e
  Total:
  - "Produtos devolvidos" (entrada no estoque);
  - "Produtos entregues" (saída do estoque).
- **Totais:** devolvido, entregue e a diferença (com o texto "valores equivalentes"
  quando zera).
- **Botão "Confirmar troca": não clicado.** Ao contrário das entradas, saídas e
  transferências, a troca não tem estado Pendente: é confirmada direto [visto].
- No histórico de estoque, o produto entregue gera uma linha de saída e o devolvido
  uma de entrada [deduzido; ver [09-estoque.md](09-estoque.md)].
- A troca é diferente da **devolução de venda**, que só devolve e é feita por uma
  entrada manual com finalidade "Devolução" (ver [09-estoque.md](09-estoque.md)).
  O ERP guarda as duas em tabelas diferentes e tem um relatório para cada uma
  [deduzido].
- Uma venda que já teve troca não pode ser "desfeita" no faturamento em lote
  (2.5) [visto no texto].
- **Pendente:** a regra que decide entre crédito e título, e o que acontece quando
  o cliente devolve mais do que leva. Foi aqui que a trava de segurança recusou a
  leitura e a exploração parou.

## 3. Fluxos de ponta a ponta

Passos marcados **(obs.)** foram vistos; os outros são o encadeamento mais provável
e estão a verificar.

1. **Venda balcão ou pedido** [afirmado pelo manual]: pedido com cliente e produtos
   → orçamento convertido em venda faturada → baixa automática de estoque e título
   em contas a receber → NF-e ou NFC-e conforme a operação (grupo tributário, ver
   [13-fiscal.md](13-fiscal.md)) → baixa do título (manual ou por retorno
   bancário) → resultado no BI **(BI obs.)**.
2. **PDV** [afirmado pelo manual]: abrir o caixa → vendas com vários meios de
   pagamento e TEF → NFC-e automática → baixa de estoque → sangrias e reforços →
   fechamento de caixa ligado ao financeiro (o ciclo do caixa está em
   [03-caixa.md](03-caixa.md)).
3. **Orçamento → faturamento em lote**
   1. O orçamento (venda com status 0) nasce no app Força de Vendas, na Venda
      Balcão, na OS ou no agente de WhatsApp.
   2. Em Faturamento de Vendas: escolher o vendedor, o período e "só do app"
      **(obs.)**.
   3. Selecionar os orçamentos.
   4. Conferir estoque, preço e as regras (avisos e bloqueios) **(obs. na
      estrutura)**.
   5. Marcar "conferi e aprovo" e, se houver bloqueio aprovável, pedir senha de
      supervisor ou liberação remota **(obs. na estrutura)**.
   6. "Gerar vendas e imprimir" **(obs. na estrutura)**.
   7. As vendas passam a status 1; o estoque e o financeiro são processados e
      marcados em cada venda.
   8. O lote entra no histórico **(obs.)**; os relatórios de faturamento mostram o
      resultado (ver 19).
4. **Desfazer um lote:** ação no histórico → motivo obrigatório **(obs. na
   estrutura)** → as vendas voltam a orçamento e o estoque e as parcelas ainda não
   movimentados são estornados **(obs. no texto)** → vendas com nota, recebimento,
   cartão, boleto, entrega ou troca ficam bloqueadas **(obs. no texto)** → os
   orçamentos voltam a aparecer no relatório "Orçamentos".
5. **Liberação de supervisor**
   1. O operador esbarra num bloqueio (desconto, preço, limite, estoque, troca) na
      venda, no PDV ou no faturamento.
   2. Dois caminhos **(obs.)**: liberação **local** (o supervisor escolhe o usuário
      e digita a senha de liberação ali mesmo) ou **remota** ("Solicitar remota" →
      o pedido entra na fila `/financeiro/liberacoes`, atualizada a cada 5 s → o
      gestor aprova ou nega).
   3. A tela do operador continua quando o pedido é aprovado.
   4. O relatório "Liberações de venda" lista os pedidos por status e solicitante.
6. **Troca de produto:** cliente → itens devolvidos (+ estoque) e itens entregues
   (− estoque) **(obs.)** → a diferença vira crédito do cliente ou título a
   receber **(obs., regra exata pendente)** → talvez peça liberação (a fila cita
   "trocas") → relatórios "Trocas de produto" e "Créditos de cliente".
7. **Crédito do cliente:** entra por troca, devolução ou acerto → saldo visível na
   Consulta Cliente **(obs.; ver 08)** → usado numa venda como forma de pagamento →
   relatórios "Créditos de cliente" e "Créditos usados em vendas".
8. **Expedição (romaneio de carga)**
   1. As vendas dos clientes de uma rota, com ou sem NF-e, ficam prontas para
      entrega.
   2. No novo romaneio: motorista, veículo e rota **(obs.)**; "Adicionar vendas"
      traz as vendas da rota; o sistema ordena as entregas (distância, tempo, "rota
      otimizada") e soma valor, peso e volumes.
   3. São impressas a lista de separação (para montar a carga), o romaneio (para o
      motorista) e o itinerário **(botões obs.)**.
   4. Depois da entrega, o romaneio é concluído (fica registrado quem fechou) ou
      cancelado.
   5. O relatório `estoque-romaneio` lista os romaneios por período, status e rota
      (ver 21).
9. **Entrega no balcão:** se o parâmetro "baixa no balcão de entrega" estiver
   ligado, a venda é finalizada e a baixa de estoque só acontece quando a
   mercadoria é entregue em `/balcao-entrega` [deduzido do parâmetro].

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| Venda / Orçamento | nº, data, status (0, 1, 2), cliente, vendedor, modalidade (retirada, entrega, loja/PDV), canal/origem (balcão, PDV, app, WhatsApp, loja, ML), forma de pagamento, observação, totais, desconto, acréscimo, frete, documento fiscal | 1:N itens; pode pertencer a um lote; gera parcelas a receber, nota e movimento de estoque; 0..1 cancelamento; N:N romaneios |
| Item de venda | produto, quantidade, unitário, desconto, acréscimo, custo gravado, % e valor de comissão, colaborador | pertence a uma venda |
| Cancelamento de venda | motivo, usuário, data, valores | 1:1 venda |
| Lote de faturamento | nº, data e hora, usuário, vendedor, nº de vendas, total, status, motivo do desfazimento | 1:N vendas do lote; usa as regras de geração ativas |
| Venda do lote | lote, venda, estoque processado (s/n), financeiro processado (s/n) | liga o lote à venda |
| Regra de geração | nome, tipo (24), limite, nível (avisar ou bloquear), usar na geração | da empresa; 35 modelos prontos |
| Solicitação de liberação | nº, data e hora, solicitante (usuário), código, contexto, tela de origem, status (0, 1, 2), gestor, filial | nasce numa venda, PDV, faturamento ou troca |
| Usuário / operador | código, nome, senha de liberação, permissão de gestor | pede ou aprova liberações; gera lotes; abre e fecha romaneios |
| Troca de produto | cliente, observação, itens devolvidos, itens entregues, totais, diferença | gera entrada e saída de estoque e crédito ou título a receber |
| Devolução de venda | entrada manual com finalidade 3 e operação 12, nº da venda, itens | aponta para a venda de origem; estoque (+) (ver 09) |
| Crédito do cliente (lançamento) | data, descrição, crédito, débito; saldo | do cliente; alimentado por troca e devolução; usado em vendas |
| Romaneio de carga | id, data, hora, status (0, 1, 2), usuário de abertura, usuário de fechamento, motorista, veículo, rota padrão; totais de valor, peso bruto, peso líquido, volumes e nº de NF-e | N:N vendas (ordem, distância, tempo, NF-e e chave, valor, pesos, volumes, rota, forma de pagamento) |
| Rota, Motorista, Veículo | ver 08 | romaneio; rota também na força de vendas |

## 5. Integrações

| Integração | Onde aparece | Estado |
|---|---|---|
| App Força de Vendas (Android) | "Só enviados pelo app" e regra "só pedidos do Força de Vendas" no faturamento | visto |
| Agente de Vendas IA (WhatsApp, MCP) | janela global "Novo pedido WhatsApp" | visto na moldura (ver 17) |
| SEFAZ (NF-e, NFC-e) | venda, PDV, bloqueio do desfazimento para vendas com nota; operações PDV ON/OFF | visto (texto) / afirmado pelo manual |
| TEF / cartão | PDV (TEF Dial); bloqueio do desfazimento para vendas com cartão | parâmetros vistos; uso afirmado pelo manual |
| PIX por QR no PDV | tipo de recebimento "Gerar QRCode PIX" | afirmado pelo manual (ver 11) |
| Balança, gaveta, impressora térmica | PDV web por Web Serial ou pelo agente Bridge (`127.0.0.1:9876`) | parâmetros vistos (ver 18) |
| Impressão | "Gerar vendas e imprimir"; romaneio, separação e itinerário | botões vistos; formato e via (navegador ou Bridge) a verificar |
| Mapas / roteirização | distância, tempo e "Ver rota otimizada" no romaneio | deduzido; serviço desconhecido |
| MDF-e | o romaneio guarda as chaves das NF-e da carga | hipótese; ligação direta não vista |
| Sistema Delphi antigo | "FrmRomaneio_Carga"; o ERP web lê as mesmas tabelas do desktop | visto / deduzido |

## 6. Oportunidades de UX

1. **Vendas espalhadas e com nomes duplos.** Não há módulo "Vendas"; a mesma tela
   é "Venda Balcão" e "Pedido de venda"; o Faturamento fica em Estoque com URL de
   Financeiro; o manual manda entrar pelo "menu Vendas", que não existe [visto].
   **[proposta]** Um módulo "Vendas" com balcão, PDV, pedidos e orçamentos juntos.
2. **Orçamento sem lugar próprio.** Só se chega aos orçamentos pelo relatório ou
   pelo BI. O relatório só mostra os ainda abertos, então não há taxa de conversão.
   **[proposta]** Funil orçamento → venda com motivo de perda.
3. **Faturamento em lote: poderoso, mas pesado.** São 24 tipos de regra, 35
   modelos, dois níveis, aprovação por senha ou remota e hash da conferência. Serve
   a distribuidoras; para o pequeno comerciante de alimentação é excessivo.
   **[proposta]** Só ligar quando há vendedores externos, com 3 ou 4 regras
   essenciais (desconto máximo, estoque, pedido mínimo) e o resto escondido.
4. **Fila de liberações por consulta a cada 5 s.** **[proposta]** Aviso em tempo
   real (push) no celular do gestor, com aprovar ou negar num toque.
5. **Senhas operacionais guardadas como parâmetro** (sangria, cancelar item ou
   venda) e uma "senha de liberação" escolhida numa lista de usuários.
   **[proposta]** Permissões por papel e aprovação do gerente com o próprio login;
   perfis prontos (dono, caixa, garçom, cozinha).
6. **Período padrão muda de tela para tela:** hoje (faturamento), 7 dias
   (liberações), mês corrente (romaneios e relatórios) [visto].
7. **O mesmo estado com nomes diferentes:** romaneio "Pendente/Concluído/Cancelado"
   na tela e "Aberto/Finalizado" no relatório, sem "Cancelado" [visto].
   **[proposta]** Uma lista única de estados por entidade, com a mesma etiqueta na
   lista, no detalhe e no relatório.
8. **Nome "Liberações" estreito:** o relatório fala em desconto e limite, a fila
   cobre também estoque, preço e trocas [visto].
9. **Parâmetros de PDV misturam desktop e web** (skins, portas COM, "Time sleep",
   "CHQ em gerencial") e há 420 opções numa tela [visto]. **[proposta]**
   Parâmetros por terminal, com assistente de ligação do hardware, e só os ajustes
   dos módulos contratados.
10. **Vale copiar:**
    - baixa de estoque na finalização **ou** na entrega no balcão;
    - desfazimento de lote com motivo obrigatório e bloqueios de segurança;
    - liberação local ou remota, com fila ao vivo;
    - o romaneio com ordem de entrega, peso e volumes, lista de separação e
      itinerário (serve a quem entrega por rota: distribuidoras, padarias que
      revendem, marmitarias);
    - a "modalidade" da venda (retirada, entrega, balcão), que é o mesmo conceito de
      canal de atendimento que usamos;
    - filtros na URL (`/vendas?status=1`, `?id_cliente=`), que permitem guardar e
      compartilhar uma lista.

## 7. Pendências

- **Não abertas:** `/vendas`, `/pdv`, `/garcom/mobile-venda` e `/balcao-entrega`.
  Na passagem que as tinha na lista, a primeira navegação (`/dashboard`) foi
  recusada pela trava do modo automático do Claude Code (motivo "Third-Party
  Attack") e as outras ficaram por tentar; não foi problema de credencial e nada
  foi clicado nem gravado. Depois, só apareceram como links noutras telas. Completar depende de o dono da conta autorizar a
  leitura. Perguntas nas seções 2.1 a 2.4.
- **`/financeiro/liberacoes`** foi recusada numa primeira tentativa e lida numa
  passagem posterior. Falta saber: o que é o campo "Código"; se o pedido expira;
  como o gestor é avisado; se a senha de liberação é diferente da senha de login;
  quem pode aprovar.
- **`/troca-produto`:** a leitura da lógica da tela foi recusada pela mesma trava;
  a exploração parou aí. Falta: a regra entre crédito e título; devolução maior do
  que a entrega; se a troca exige liberação; prazo de troca; motivo obrigatório;
  quem autoriza; se gera nota de devolução/entrada; para que depósito volta o
  produto; como funciona o "cupom de troca" dos parâmetros.
- **Faturamento em lote:** os passos 2 e 3 não foram vistos em funcionamento (a
  conta não tem vendedor nem orçamento); estados possíveis do lote; se o lote emite
  NF-e; o que "imprimir" imprime; quando as marcas de estoque e financeiro ficam em
  "Não"; se há ligação com o romaneio (rota e motorista).
- **Romaneio:** como calcula distância, tempo e rota otimizada (que serviço de
  mapas); o que é "Emb."; se gera MDF-e; se baixa estoque ou só organiza a entrega;
  o que muda ao concluir; acerto com o motorista e baixa da entrega. As lupas de
  Rota, Motorista e Veículo não foram abertas; a conta não tem romaneios.
- **Venda Direta Mobile:** diferença para o PDV e para a comanda do garçom.
- **Cashback** como forma de pagamento na venda e no PDV (ver
  [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md)).
- **Permissões:** tudo foi visto como ADMIN. Não se sabe que perfis podem dar
  desconto, cancelar venda, liberar crédito ou aprovar liberações (ver 08).
- **Afirmações do manual não testadas:** NFC-e automática no PDV, TEF, balança.

## 8. Sub-rotas descobertas

| Rota | O que é | Estado |
|---|---|---|
| `/financeiro/faturamento/gerar` (POST) | gera as vendas do lote | não chamada (grava) |
| `/financeiro/liberacoes?status=0\|1\|2\|todos&de=&ate=&filiais[]=` | abas da fila | lida |
| `/romaneios/create` | novo romaneio | lida; Salvar não clicado |
| `/vendas?id_cliente={id}` | atalho "Vendas" da Consulta Cliente | link visto; não aberto |
| `/vendas?status=1` | indicadores do BI | link visto; não aberto |
| `/lookups/{tipo}/config`, `/lookups/{tipo}/search?q=&page=`, `/lookups/{tipo}/{id}` | lupas (vendedor, rota, motorista, veículo) | visto no código |
