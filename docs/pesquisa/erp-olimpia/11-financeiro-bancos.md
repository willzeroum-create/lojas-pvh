# 11 — Financeiro, bancos, boletos, TEF, cartões e portal do contador (ERP Olímpia)

> Cobre o módulo Financeiro: contas a receber e a pagar, bancos e contas bancárias,
> movimentação bancária, conciliação por OFX, cedentes e boletos, integração bancária
> (boleto e PIX), tabelas de apoio, TEF, maquininhas, cartões e o portal do contador.
> Exploração de 2026-10-03, conta de teste "Boi Criolo" (plano Full), perfil ADMIN,
> sessão já aberta no navegador embutido. A conta não tem conta bancária, extrato,
> boleto nem título. Só 4 telas foram lidas (duas de passagem); as outras ficaram
> bloqueadas.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual], [código]
> (lido no HTML/JS da página), [proposta]; "a verificar" = pergunta aberta.
> Nada foi gravado, importado ou enviado no ERP.

## 1. Visão geral

### 1.1 Onde fica

- **Menu [visto]:** secção "Financeiro & Fiscal" do menu lateral (Financeiro e
  Fiscal). O módulo Financeiro tem **22 itens**. Caminhos de menu conhecidos:
  Financeiro › Bancos › Integração Bancária; Financeiro › Tipo de Recebimento;
  Financeiro › Boleto; Financeiro › **Monitor de baixas**; Financeiro › TEF; e, dentro
  do Financeiro, Portal do Contador, Link Portal Contador, TEF/POS, Controle de cartões
  e Conciliação. A lista completa dos 22 itens não foi lida.
- **Atalho "Caixa"** da barra lateral/superior leva a `/financeiro/recebimento`, que
  fica em [03-caixa.md](03-caixa.md) (com `/financeiro/caixa`). `/financeiro/faturamento`
  e `/financeiro/liberacoes` (fila onde o gestor aprova pedidos, "Financeiro →
  Liberações") ficam em [02-vendas-pdv.md](02-vendas-pdv.md); a cobrança automática
  (réguas, links de pagamento e os **gateways de cobrança** próprios, onde aparecem
  Asaas, Efí e Mercado Pago) em
  [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md); os
  relatórios financeiros em
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).
- **Plano [visto]:** o Profissional já inclui "bancos, PIX, TEF"; a lista dos 36
  módulos do Full tem "Financeiro (Contas a Pagar/Receber, Caixa)", "Bancos (contas,
  movimentação, conciliação, boletos)", "PIX" e "TEF" (ver
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).
- **Manual [afirmado pelo manual]:**
  - Cartão "Financeiro" (`mod-financeiro`, 4 passos): títulos gerados pelas vendas;
    baixa manual ou por retorno bancário; fechamento de caixa ligado ao PDV;
    relatórios de fluxo e posição.
  - Cartão "Integração Bancária" (`mod-bancos`, 5 passos): Cadastros → Empresa → aba
    Integração Bancária; escolher o provedor de boleto e/ou PIX e preencher só o que
    ele pede; certificado A1 na aba "Logo / Certificado" (nome antigo da aba "Logo / QR
    PIX"); marcar "Gerar QRCode PIX" no Tipo de Recebimento para o caixa e o PDV;
    remessa CNAB em Boletos e retorno para baixa automática. O botão "Abrir módulo" vai
    a `/financeiro/integracao-bancaria`.
  - O cabeçalho do manual fala num "financeiro com 13 bancos" (a lista de provedores de
    boleto tem 13 bancos e fintechs, mais Tecnospeed, CredSIS e CNAB em arquivo).
  - **Sem cartão no manual:** Portal do Contador, TEF/POS, Controle de cartões e
    Conciliação. Ver [22-manual.md](22-manual.md).
- **Checklist de migração [visto]:** os cadastros "Bancos" (`/bancos`), "Conta
  Corrente" (`/banco-contas`) e "Cedente" (`/cedentes`) aparecem como **completos** na
  migração do sistema Delphi para a web. O plano de contas é cadastro (ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)); a nota do
  checklist diz que os lançamentos e relatórios do plano "ficam no Financeiro".
- **Empresa ativa [visto]:** financeiro e vendas filtram pela empresa ativa, escolhida
  no topo da tela; clientes e produtos são compartilhados entre filiais.

### 1.2 Padrões e regras gerais

- **Selo de modo de baixa [visto]:** a conciliação mostra "Sem caixa — baixa em modo
  direto". Indica uma configuração que decide se as baixas passam por uma sessão de
  caixa ou entram direto na conta [deduzido]. Onde se configura: a verificar.
- **Título a receber [visto nos filtros de relatórios de comissão e OS, ver
  [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md) e
  [14-os-forca-vendas.md](14-os-forca-vendas.md)]:**
  - É um só contas a receber para vendas e OS: cada parcela guarda a origem (`venda`
    ou `os`), o documento de origem, cliente, datas de emissão, vencimento e
    pagamento, status e a comissão do colaborador (percentual e valor).
  - Só dois estados nos filtros: `0` aberto e `1` pago (sem "parcial" nem
    "cancelado").
  - Filtro por tipo de data: movimento (padrão; mistura pagamento, vencimento e
    emissão), pagamento, vencimento ou emissão.
  - A OS exige forma de pagamento, tem campo de adiantamento e o status "Quitado (4)",
    que pode ser escolhido à mão; os relatórios filtram OS "com" ou "sem títulos a
    receber".
- **Auditoria [visto]:** o log de alterações tem as ações "Lançamento" (`lancamento`)
  e "Baixa" (`baixa`), ou seja, lançamentos e baixas do financeiro são auditados com
  foto antes/depois (ver
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).
- **Aviso de baixa de boleto [código]:** todas as telas consultam periodicamente o
  servidor por novidades em 7 canais, entre eles a **baixa de boletos**
  (`/erp/notificacoes/boleto-baixa/poll`, cerca de 30 s). Aparece um aviso tipo
  "toast" de "Boletos liquidados" (baixa automática).

### 1.3 Parâmetros da empresa que mexem no financeiro (síntese)

A aba "Parâmetros" da empresa (cerca de 420 opções) está em
[08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md). O que toca o
financeiro [visto; rótulos interpretados quando eram nomes de coluna]:

- **Financeiro (23 opções):** juros, multa e dias de tolerância; gerar remessa de
  boleto automaticamente (ligado); número de autorização do cartão (ligado);
  percentuais TEF (crédito à vista, crédito parcelado, débito); cashback (ativo, %,
  tipo); dias para bloquear cliente; ligação banco × caixa com conta do plano e tipo de
  documento para pagar, receber e POS; controle de cartão.
- **Caixa / PIX:** gerar parcelas de cartão e cheque no caixa; "Controle POS" (aplica
  as tarifas de cartão no PDV); emitir NFC-e no recebimento (ligado). O resto do caixa
  está em [03-caixa.md](03-caixa.md).
- **Vendas:** gerar boleto automático; bloquear cliente inadimplente (ligado); juros
  por forma de pagamento.
- **Estoque:** a entrada pode pedir conta do plano e tipo de documento.
- **Fiscal:** lançar contas a pagar a partir da NF-e de entrada (ligado); cedente
  padrão; e-mail de envio dos XML ao contador.
- **Comissões por metas:** ao fechar a meta, gerar um título a pagar por colaborador
  (e/ou lançar o prêmio na folha).
- **PDV:** TEF com autoemissão da NFC-e (ligado); forçar NFC-e em venda com cartão.
- **E-mails:** uma das três contas SMTP é a do "contador".

Os parâmetros de hardware do TEF (TEF DIAL) ficam em `/parametros-sistema` (ver
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).

### 1.4 Rotas e estado

As recusas foram do classificador do modo automático do Claude Code ("Third-Party
Attack"), sem relação com a credencial.

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/financeiro` | Lançador do financeiro | não aberta: navegação recusada |
| `/financeiro/receber` | Contas a receber | não aberta |
| `/financeiro/pagar` | Contas a pagar | não aberta |
| `/financeiro/pagar-baixa` | Baixa de contas a pagar | não aberta |
| `/bancos` | Bancos | não aberta |
| `/banco-contas` | Contas bancárias ("Conta Corrente") | não aberta |
| `/financeiro/banco-movimentacao` | Movimentação bancária | lida (de passagem, durante os relatórios); janela "Novo lançamento" lida na estrutura |
| `/financeiro/conciliacao` | Conciliação bancária (OFX) | lida em parte: tela principal; janelas internas não lidas por inteiro |
| `/cedentes` | Cedentes | **recusada** |
| `/financeiro/boletos` | Boletos ("Cobrança bancária") | lida (de passagem, durante os relatórios) |
| `/financeiro/boletos-liquidados` | Boletos liquidados | não aberta |
| "Monitor de baixas" | item de menu citado no manual | rota não identificada |
| `/financeiro/integracao-bancaria` | Integração bancária | lida: redireciona para `/empresa/1#tab-integracao` (aba lida em duas passagens) |
| `/financeiro/tipo-recebimentos` | Tipos de recebimento | não aberta |
| `/financeiro/tipo-documentos` | Tipos de documento | não aberta |
| `/financeiro/tef` | TEF | não aberta |
| `/financeiro/pos-operadoras` | Operadoras de POS | não aberta |
| `/financeiro/cartoes` | Cartões | não aberta |
| `/contador-admin` | Portal do Contador | não aberta |
| `/contador-admin/link` | Link Portal Contador | não aberta |

## 2. Telas

### 2.1 `/dashboard/modulo/financeiro` — Lançador do financeiro [não aberta]

- **Ver:** se segue o padrão dos outros lançadores (só atalhos em blocos, sem
  indicadores, como Fiscal e Estoque) ou se mostra saldos e vencimentos do dia; a
  lista completa dos 22 atalhos e rotas, para conferir com este documento.

### 2.2 `/financeiro/receber` — Contas a receber [não aberta]

- **Já se sabe:** o que está em 1.2 (origem venda/OS, dois estados, tipo de data,
  comissão na parcela). A Consulta Cliente tem o atalho "Títulos" para
  `/financeiro/receber?id_cliente={id}` (a rota aceita filtrar por cliente pela URL;
  ver [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)). A cobrança
  (réguas e links de pagamento) trabalha sobre estas parcelas, pelo "ID receber" (ver
  12).
- **Ver na próxima visita:**
  - Lista: colunas; totais (aberto, vencido, recebido); filtros (cliente, origem,
    status, tipo de data, forma, vendedor, filial).
  - "Novo" título manual: todos os campos (cliente, documento, tipo de documento,
    emissão, vencimento, valor, parcelas e intervalo, plano de contas, centro de custo,
    forma de recebimento, conta).
  - Ações por título (receber, estornar, renegociar ou agrupar, boleto, PIX, recibo,
    cobrança por WhatsApp): só ver o que existe, sem clicar.
  - Regras: juros e multa automáticos (há parâmetros); desconto; recebimento parcial
    (os filtros só têm aberto e pago); se um título vindo de venda pode ser editado ou
    excluído.

### 2.3 `/financeiro/pagar` — Contas a pagar [não aberta]

- **Já se sabe [deduzido da Central de Relatórios]:** o título a pagar tem fornecedor,
  vencimento, valor, status, data de pagamento, juros, multa, desconto, histórico e
  conta do plano de contas; é lançado à mão ou vem de uma entrada de mercadoria
  (relatório "Entradas × contas a pagar"; parâmetro "lançar contas a pagar a partir da
  NF-e de entrada", ligado). Outras origens prováveis: comissão por metas (parâmetro
  "gerar título a pagar por colaborador") e folha (ao fechar a folha, contas a pagar
  para o "fornecedor salários", nas contas de salários e encargos, pagas por CNAB 240
  [deduzido], ver [16-folha-colaborador.md](16-folha-colaborador.md)).
- **Ver:** o mesmo roteiro do receber, mais fornecedor, plano de contas, centro de
  custo, código de barras ou linha digitável, anexo, recorrência (conta fixa mensal),
  aprovação; de onde vêm os títulos (manual, compra, entrada de XML, comissão, folha).

### 2.4 `/financeiro/pagar-baixa` — Baixa de contas a pagar [não aberta]

- **Ver:** seleção de vários títulos; data, conta de saída, forma, juros, multa,
  desconto, pagamento parcial; total da baixa; se gera movimento na conta bancária e se
  dá para estornar. **Não clicar em baixar.**

### 2.5 `/bancos` — Bancos [não aberta]

- **Já se sabe:** cadastro marcado como completo no checklist de migração; na
  conciliação, o banco vem do código do banco no OFX e é **criado** se não existir.
- **Ver:** tabela fixa (código e nome) ou cadastro livre; campos extras (ISPB, layout
  de boleto ou CNAB).

### 2.6 `/banco-contas` — Contas bancárias ("Conta Corrente") [não aberta]

- **Já se sabe:** cadastro "Conta Corrente" completo no checklist; a conta é criada
  pelo OFX se não existir (banco, agência, número); a conta bancária aparece como lista
  na movimentação, na conciliação e na integração bancária (opcional); nesta conta não
  há nenhuma.
- **Ver:** campos (banco, agência, conta e dígitos, tipo — corrente, poupança, caixa
  interno, aplicação —, descrição, filial, saldo inicial e data, ativa, chave PIX,
  ligação com cedente); se o saldo atual é calculado e onde aparece.

### 2.7 `/financeiro/banco-movimentacao` — Movimentação bancária [visto]

- **Indicadores:** Lançamentos, Entradas, Saídas e Líquido.
- **Filtros:** Conta (só "Todas as contas": não há conta bancária cadastrada), Tipo
  documento (Todos, PADRAO), De, Até, Localizar e "Limpar filtros".
- **Colunas:** ID, Data, Conta, Tipo, Descrição, Valor, Saldo ant., Saldo e **Caixa**.
  Há paginação.
- **"Novo lançamento"** (janela lida na estrutura da página, sem abrir e sem gravar):

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Conta | lista | sim | contas bancárias (nenhuma nesta conta) |
| Tipo documento | lista | sim | PADRAO |
| Data | data | sim | padrão: hoje |
| Valor (+ / −) | número | sim | positivo = entrada; negativo = saída |
| Plano de contas | lupa `plano_contas` | não | — |
| Descrição | texto | sim | — |

- **Regras [deduzido]:** o valor é gravado com sinal; o saldo anterior e o saldo são
  calculados por conta; a coluna "Caixa" sugere ligação com a sessão de caixa. O
  relatório irmão traduz o sinal em C/D e não tem filtro de conta (ver 19).
- **Ver:** transferência entre contas, estorno, importação de extrato (**não clicar em
  Importar**); ligação com a baixa de títulos e com a conciliação.

### 2.8 `/financeiro/conciliacao` — Conciliação bancária [visto em parte]

**Objetivo [visto]:** importar o extrato do banco em arquivo OFX e casar cada movimento
do extrato com um lançamento do ERP. Banco, conta e movimentos nascem do próprio
arquivo. Os casamentos de alta confiança são conciliados sozinhos. A tela foi desenhada
com o **OFX em primeiro lugar**: não é preciso cadastrar banco nem conta antes.

**Cabeçalho e ações [visto]**

| Elemento | Tipo | O que faz |
| --- | --- | --- |
| Selo "Sem caixa — baixa em modo direto" | informativo | mostra o modo de baixa em vigor (1.2) |
| Como usar | botão (alterna) | mostra ou esconde o mini tutorial; vem ligado |
| Importar OFX | botão | abre a janela de importação |
| Regras | botão | abre a janela de regras de conciliação |
| Fechar | link | volta ao painel geral (`/dashboard`), não ao módulo Financeiro |
| Ocultar | botão | esconde o mini tutorial |

**Mini tutorial embutido [visto, resumido]**

1. Importar o arquivo; o sistema reconhece banco e conta.
2. Conferir período e totais numa etapa de conferência e confirmar; banco e conta
   inexistentes são criados nessa hora.
3. Os movimentos de alta confiança são conciliados sozinhos; o resto fica pendente.
4. Revisar: extrato à esquerda, candidatos do ERP à direita; para cada movimento dá
   para associar, ignorar ou criar um lançamento.
5. Cadastrar regras por texto (o exemplo é uma conta de energia), com pessoa e plano
   de contas, para as próximas importações.

Dois avisos fixos: (a) não é preciso escolher banco ou conta antes, porque o OFX traz o
código do banco, a agência e a conta; (b) reimportar o mesmo arquivo não duplica nada,
porque cada movimento tem um identificador único no OFX (FITID) e os já importados são
ignorados.

**Filtros [visto]**

| Campo | Tipo | Obrigatório | Opções / comportamento |
| --- | --- | --- | --- |
| Conta bancária | lista | não | só "— Selecione —" nesta conta (nenhuma conta cadastrada) |
| Status | lista | não | Pendentes (padrão), Conciliados, Ignorados, Todos |
| Localizar | botão | — | aplica o filtro; os valores vão no endereço da página |

**Lista (não vista).** Sem extrato importado, a tela mostra só um estado vazio
("importe o OFX para começar") com um segundo botão "Importar OFX". Colunas, totais e o
desenho da revisão lado a lado: a verificar.

**Janela "Importar OFX" [código; vista só em parte, sem abrir]:** campo de arquivo que
aceita `.ofx` (e também `.txt`), botão "Conferir", que leva à etapa de conferência antes
de confirmar, e botão "Fechar". A etapa de conferência **não** foi vista: só aparece
depois de enviar um arquivo, e importar é proibido nesta pesquisa.

**Janela "Regras" [código; vista só em parte, sem abrir]**

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Se descrição contém | texto | a verificar | trecho procurado na descrição do movimento |
| Pessoa | campo numérico (código) | a verificar | pede o código da pessoa; não se viu busca por nome |
| Plano de contas | lista | a verificar | opções não lidas |
| Salvar | botão | — | **não clicado** |

A regra parece poder ficar presa a uma conta bancária (sem conta escolhida, vale como
geral). A lista de regras já cadastradas, a edição e a exclusão: a verificar. A leitura
completa das duas janelas por script foi recusada pelo classificador.

**Regras de negócio [visto]**

- Importação idempotente: o identificador único (FITID) de cada movimento impede
  duplicar.
- Banco e conta reconhecidos pelo arquivo e criados se não existirem.
- Conciliação automática só para casamentos de alta confiança; o resto fica pendente.
- Três estados por movimento do extrato: **pendente**, **conciliado**, **ignorado**.
- Regra "descrição contém X" → pessoa + plano de contas, para classificar movimentos
  repetidos.
- A Central de Relatórios tem o relatório `banco-conciliacao` (movimentos do extrato
  OFX e se foram casados; só na Central, ver 19).

**A verificar**

- Critério de "alta confiança": valor exato? data com tolerância de dias? documento ou
  nome?
- Se um movimento pode casar com vários títulos (e vários movimentos com um título).
- Se "criar lançamento" gera um título já baixado ou um movimento bancário avulso; se
  conciliar faz a baixa do título a receber ou a pagar.
- Se dá para desfazer uma conciliação ou tirar um movimento de "ignorado".
- Tarifas bancárias; saldo do extrato comparado com o saldo da conta no ERP.
- Ligação com `/bancos`, `/banco-contas` e `/financeiro/banco-movimentacao`.

### 2.9 `/cedentes` — Cedentes [recusada]

- **Já se sabe:** cadastro "Cedente" completo no checklist de migração; a integração
  bancária e os boletos têm um campo "Cedente" (lista, padrão "Padrão"); existe um
  "cedente padrão" nos parâmetros fiscais; os boletos são gerados com o cedente
  padrão; a remessa junta títulos do mesmo cedente.
- **Ver:** o que é um cedente aqui (provável: conta bancária + convênio de cobrança);
  campos (banco, agência, conta, convênio, carteira, variação, código do beneficiário,
  espécie do documento, aceite, juros, multa, desconto, protesto, baixa automática,
  instruções, faixa e próximo "nosso número", layout CNAB 240 ou 400, sequencial de
  remessa); se há credenciais de API do banco (só observar, **nunca digitar**); um ou
  vários cedentes por conta.

### 2.10 `/financeiro/boletos` — Boletos ("Cobrança bancária") [visto]

- **Cabeçalho "Cobrança bancária":**
  - "Integração" leva a `/empresa/1#tab-integracao` (2.13).
  - "Gerar remessa" e "Importar retorno" (não clicados) enviam para
    `/financeiro/boletos/remessa` e `/financeiro/boletos/retorno` (POST).
- **Indicadores:** total na lista, pendentes prontos para remessa e registrados/pagos.
- **Aviso:** na integração por **API**, o boleto é registrado direto no banco, sem
  arquivo de remessa. A baixa chega por API ou webhook.
- **Filtros:** Cliente (lupa `pessoa_cliente`), Cedente, Status (lista de 0 a 3) e
  Vencimento de/até.
- **Status do boleto:** `0` Remessa pendente · `1` Remessa gerada · `2` Liquidado ·
  `3` Cancelado.
- **Ação em lote:** selecionar títulos **do mesmo cedente** e gerar a remessa.
- **Colunas:** ID, Cliente, Cedente, Venc., Valor, Nosso nº, Remessa, Status, **Canal
  da baixa**, Pagamento, Ações.
- O aviso de lista vazia diz que os boletos se geram **a partir do recebimento**, com
  o cedente padrão.
- O relatório "Boletos emitidos" (`/relatorios/boletos-periodo`) usa texto livre para o
  status, ao contrário desta lista (ver 19).
- **Ver:** origem do boleto (título a receber, venda, OS, mensalidade); ações por linha
  (imprimir, segunda via, envio por e-mail ou WhatsApp, cancelar); estados e
  transições; Pix no boleto (QR); boleto em lote; carnê.

### 2.11 `/financeiro/boletos-liquidados` — Boletos liquidados [não aberta]

- **Já se sabe:** a liquidação pode vir do arquivo de retorno CNAB ("Importar retorno",
  baixa automática segundo o manual) ou da API/webhook do banco; no Sicredi a baixa
  consulta o banco de poucos em poucos minutos; o boleto liquidado guarda o **canal da
  baixa**; o ERP avisa "Boletos liquidados" pela notificação de baixa (1.2).
- **Ver:** colunas (data de pagamento e de crédito, valor pago, juros, multa,
  desconto, tarifa); se baixa sozinho o título a receber; ligação com a conciliação.

### 2.12 "Monitor de baixas" [rota não identificada]

- **Já se sabe:** é um item do menu Financeiro citado pelo cartão "Integração
  Bancária" do manual, junto com "Boleto"; o manual liga o retorno CNAB à baixa
  automática em "Financeiro › Boleto / Monitor de baixas" [afirmado pelo manual].
- Entre os destinos reais dos caminhos do manual estão `/financeiro/boletos` e
  `/financeiro/boletos-liquidados`; o mais provável é que "Monitor de baixas" seja
  `/financeiro/boletos-liquidados` [deduzido; a confirmar].
- **Ver:** a rota; se acompanha baixas automáticas (retorno, API, webhook, consulta
  periódica) com falhas e reprocessamento.

### 2.13 `/financeiro/integracao-bancaria` → aba "Integração Bancária" de `/empresa/{id}` [visto]

- **Não tem tela própria [visto].** O item de menu e o botão do manual redirecionam
  para `/empresa/1#tab-integracao`, a aba "Integração Bancária" do cadastro da
  **empresa nº 1** (a Matriz). A verificar: numa conta com filiais, se o atalho abre
  sempre a empresa 1.
- **Contexto:** cabeçalho "Empresa #1" com a nota "equivalente a FrmEmpresa", o selo
  "Matriz" e o link "Todas as filiais"; abas Cadastro, Logo / QR PIX, Integração
  Bancária e Parâmetros (as outras abas ficam em
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)). O texto de ajuda
  desta aba manda procurar o certificado na aba "Logo / Certificado", que hoje se chama
  "Logo / QR PIX".
- **Formulário próprio [código]:** a aba tem um formulário separado do principal,
  com o botão "Salvar integração bancária" (envio para
  `/empresa/1/integracao-bancaria`). O "Salvar" principal grava Cadastro, Logo e
  Parâmetros [deduzido].
- **Três blocos:** "Gateway boleto / remessa", "Gateway PIX (caixa / PDV)" e "Teste
  PIX — QR Code".
- **Provedores de boleto (16 + "Não utilizar"), com o código interno:** Tecnospeed
  PlugBoleto `tecnospeed`, CredSIS Cobrança (SOAP) `credsis`, Banco do Brasil
  `banco_brasil`, Itaú `itau`, Bradesco `bradesco`, Santander `santander`, Caixa
  Econômica `caixa`, Sicredi `sicredi`, Sicoob `sicoob`, Banrisul `banrisul`, Banco
  Inter `inter`, Efí (Gerencianet) `efi`, Asaas `asaas`, C6 Bank `c6_bank`, BTG Pactual
  `btg_pactual`, CNAB legado (arquivo) `legacy_cnab`.
- **Provedores de PIX (12 + "Não utilizar"):** os mesmos, menos CredSIS, Banco do
  Brasil, Banrisul e CNAB legado (Tecnospeed PlugBoleto, Itaú, Bradesco, Santander,
  Caixa, Sicredi, Sicoob, Banco Inter, Efí, Asaas, C6 Bank, BTG Pactual).
- **Campos do boleto** (aparecem conforme o provedor; no HTML nenhum é obrigatório)
  [código]:

| Campo | Tipo |
| --- | --- |
| Cedente | lista, padrão "Padrão" |
| Conta bancária | lista, opcional |
| Token / API Key | senha |
| Convênio CredSIS | texto |
| Layout | texto, já preenchido |
| Formato | PDF ou HTML |
| Client ID | texto |
| Client Secret | senha |
| x-api-key (Access Token do portal) | senha |
| Ambiente da API C6 Bank | Produção ou Sandbox |
| Código de Acesso (Internet Banking) — Sicredi | senha |
| Ambiente da API | Produção ou Validação (sandbox/homologação) |
| Layout remessa | API bancária, CNAB 240 ou CNAB 400 |
| Customer ID Asaas | opcional |
| URL base | opcional |
| Timeout (s) | já preenchido |

- **Campos do PIX:**

| Campo | Tipo |
| --- | --- |
| Cedente | lista |
| Conta bancária | lista |
| Chave PIX (recebimento) | texto; exemplo: CPF, CNPJ, e-mail, telefone ou chave aleatória |
| Token / API Key | senha |
| Client ID | texto |
| Ambiente da API C6 Bank | Produção ou Sandbox |
| Client Secret | senha |
| URL base | opcional |
| Timeout (s) | número |

- **Teste PIX:** campo numérico (valor do teste [deduzido]), botão "Testar geração QR
  Code" (usa `/empresa/{id}/integracao-bancaria/testar-pix`) e saída "PIX copia e
  cola" numa janela, com o botão Copiar e o aviso para não pagar a cobrança de teste.
- **Botões (nenhum clicado):** "Testar conexão (autenticação)", que chama um teste por
  provedor (`/financeiro/integracao-bancaria/{driver}/testar`); "Testar geração QR
  Code"; "Salvar integração bancária".
- **Regras explicadas na tela (resumo):**
  - Sicredi: API "híbrida"; pede as credenciais do app, o token de acesso e um código
    gerado no internet banking. O boleto é registrado e impresso na hora, e a baixa
    automática consulta os pagamentos no banco a cada poucos minutos.
  - CredSIS: API SOAP, com registro online e consulta de liquidação.
  - Bancos "institucionais" exigem o certificado A1 (o mesmo certificado único da
    empresa, usado também na parte fiscal; ver 08).
  - Para o PIX em produção, é preciso marcar "Gerar QRCode PIX" na forma/tipo de
    recebimento desejada.
  - C6 e Sicredi têm ambiente de teste: começar em sandbox e só depois passar para
    produção.
  - A cobrança de teste não deve ser paga.
- **Não determinado:** quais campos cada provedor mostra (a tela mostra só os do
  provedor escolhido; leu-se a lista completa sem a ligação campo × provedor). A
  leitura por script com esse objetivo foi recusada pelo classificador, e não se tentou
  outro caminho. O conteúdo dos campos de senha, token e chave não foi lido.

### 2.14 `/financeiro/tipo-recebimentos` — Tipos de recebimento [não aberta]

- **Já se sabe:** é aqui (menu "Financeiro › Tipo de Recebimento") que se marca "Gerar
  QRCode PIX" para o PIX aparecer no caixa e no PDV [afirmado pelo manual]; a OS exige
  uma forma de pagamento; existe também `/forma-pagamentos` (cadastro, ver 08).
- **Ver:** diferença entre "tipo de recebimento" e "forma de pagamento"; campos
  (descrição, código da forma de pagamento na nota fiscal, se gera conta a receber,
  prazo para o dinheiro cair, taxa, conta de destino, se usa TEF ou POS, a marca "Gerar
  QRCode PIX").

### 2.15 `/financeiro/tipo-documentos` — Tipos de documento [não aberta]

- **Já se sabe:** a movimentação bancária tem "Tipo documento" com a opção PADRAO; os
  parâmetros ligam banco × caixa a uma conta do plano e a um tipo de documento; a
  entrada de estoque pode pedir tipo de documento.
- **Ver:** lista de tipos (nota, duplicata, boleto, recibo, cheque, carnê?); campos;
  onde aparecem (contas a pagar e a receber, boletos, movimentação).

### 2.16 `/financeiro/tef` — TEF [não aberta]

- **Já se sabe:** o manual cita TEF no PDV ("Financeiro › TEF") [afirmado pelo
  manual]; os parâmetros da empresa têm percentuais TEF e autoemissão da NFC-e com
  TEF; `/parametros-sistema` tem o bloco TEF DIAL (TEF ativo, tempos, gerenciador
  padrão, múltiplos cartões, auto finalizar cupom; ver 18); a Central de Relatórios tem
  `tef-operacoes` (operações de cartão ligadas a vendas: NSU, bandeira, parcelas; só na
  Central, ver 19).
- **Ver:** se é configuração (provedor, loja, terminal) ou registro de transações
  (número, autorização, bandeira, parcelas, estado, cancelamento); se exige programa
  instalado no computador do caixa. **Nunca digitar** códigos ou senhas de TEF.

### 2.17 `/financeiro/pos-operadoras` — Operadoras de POS [não aberta]

- **Já se sabe:** o parâmetro "Controle POS" aplica as tarifas de cartão no PDV; os
  parâmetros ligam POS a conta do plano e tipo de documento.
- **Ver:** campos da operadora (nome; CNPJ da credenciadora, que a NFC-e pede quando o
  pagamento é em cartão — conhecimento de domínio, não visto), taxas por modalidade
  (débito, crédito à vista, parcelado), prazo de recebimento, antecipação, conta de
  crédito.

### 2.18 `/financeiro/cartoes` — Cartões ("Controle de cartões") [não aberta]

- **Já se sabe:** parâmetros "controle de cartão", "número de autorização do cartão"
  (ligado) e "gerar parcelas de cartão e cheque no caixa".
- **Ver:** se é cadastro de bandeiras ou controle de recebíveis de cartão (venda,
  taxa, data prevista, baixa quando o dinheiro cai); se concilia com o extrato da
  operadora.

### 2.19 `/contador-admin` — Portal do Contador [não aberta]

- **Já se sabe:** "Portal do Contador" aparece no grupo "Financeiro & Fiscal" do menu
  lateral (ver [13-fiscal.md](13-fiscal.md)); o manual não o cobre; os parâmetros têm
  e-mail de envio dos XML ao contador e uma conta SMTP "contador".
- **Ver:** o que o contador vê e baixa (XML de NF-e, NFC-e e NFS-e, SPED, relatórios),
  por período e em lote; cadastro do contador; registro de acessos.

### 2.20 `/contador-admin/link` — Link Portal Contador [não aberta]

- **Já se sabe:** "Link Portal Contador" aparece no mesmo grupo do menu.
- **Ver:** se gera um link de acesso sem login para o contador; validade, revogação e
  permissões. **Não clicar em "Gerar".**

## 3. Fluxos de ponta a ponta

1. **Conciliação por OFX [visto pela tela e pelo tutorial].** Baixar o OFX no internet
   banking → "Importar OFX" → etapa de conferência (período e totais; banco e conta
   criados se não existirem) → confirmar → conciliação automática dos casamentos
   fortes → revisão dos pendentes (associar, ignorar ou criar lançamento) → cadastrar
   regras para os textos que se repetem → próxima importação já sai mais classificada.
   Reimportar o mesmo arquivo não duplica.
2. **Banco.** Lançamento manual com valor positivo ou negativo, conta, tipo de
   documento e plano de contas **(obs. na estrutura)**; ou lançamento automático, vindo
   da baixa de títulos e da conciliação OFX [a verificar] → saldo anterior e saldo por
   conta → relatório "Movimentação bancária" (C/D).
3. **Boleto [parte vista, parte afirmada pelo manual].** Escolher o provedor na aba
   Integração Bancária (certificado A1 quando o banco exige; testar a autenticação)
   **(obs.)** → no recebimento, gerar o boleto com o cedente padrão **(obs. no aviso)**
   → registro no banco: por remessa CNAB (selecionar títulos do mesmo cedente → gerar
   remessa → status "Remessa gerada") ou direto por API **(obs.)** → pagamento →
   arquivo de retorno ou webhook/consulta periódica → "Liquidado", com o canal da baixa
   **(obs.)** → baixa automática do título [afirmado pelo manual] → crédito no caixa ou
   no banco → conciliação pelo OFX → relatório "Boletos emitidos".
4. **PIX [parte vista].** Provedor PIX na aba Integração Bancária e teste de QR
   **(obs.)** → marcar "Gerar QRCode PIX" no tipo de recebimento [afirmado pelo
   manual] → cobrança com txid gerada no caixa, no PDV ou em link de pagamento → o
   cliente paga → confirmação do provedor → baixa [a verificar] → relatório "PIX
   recebidos" (geradas e pagas).
5. **Venda ou OS → receber [visto em outros módulos].** A venda ou a OS gera títulos a
   receber em parcelas, já com a comissão gravada → pagamento no caixa ou no financeiro
   → título passa a pago (`1`); a OS tem o status "Quitado". O que acontece dentro das
   telas do financeiro não foi visto.
6. **Contas a pagar [a verificar].** Lançamento manual ou vindo de entrada de XML,
   compra, comissão ou folha → baixa individual ou em lote (`/financeiro/pagar-baixa`)
   → saída na conta bancária → conciliação → relatórios de pagar e previsão (ver 19).
7. **Ciclo do cartão [a verificar].** Venda no cartão (TEF integrado ou maquininha
   avulsa) → recebível por operadora, com taxa e prazo → crédito na conta →
   conciliação.
8. **Fechamento com o contador [a verificar].** Fim do mês → portal ou link do contador
   → o contador baixa XMLs e relatórios.

## 4. Entidades e relações

| Entidade | Campos vistos ou indicados | Relações |
| --- | --- | --- |
| Banco | código do banco (vem do OFX) | tem contas bancárias; criado pelo OFX se não existir |
| Conta bancária | banco, agência, número da conta, nome | pertence a um banco; recebe movimentos e extratos; filtro de telas; pode limitar uma regra; opcional na integração bancária |
| Movimento bancário | id, data, conta, tipo de documento, descrição, valor com sinal (C/D), saldo anterior, saldo, caixa, plano de contas | pertence a uma conta; pode vir de baixa ou de conciliação |
| Importação OFX | arquivo, período, totais | gera movimentos do extrato numa conta |
| Movimento do extrato | identificador único (FITID), data, valor, descrição, estado (pendente, conciliado, ignorado) | pertence a uma conta; casa com um lançamento do ERP (campos do candidato não vistos; pode ser criado na revisão) |
| Regra de conciliação | texto contido na descrição, pessoa (código), plano de contas, conta bancária (opcional) | aponta para Pessoa e Plano de contas; aplicada nas importações |
| Integração bancária (gateway da empresa) | provedor de boleto, provedor de PIX, cedente, conta bancária, credenciais (token, client id/secret, x-api-key, código de acesso), ambiente, layout de remessa (API/CNAB 240/400), formato (PDF/HTML), convênio, customer ID, chave PIX, URL base, timeout | 1 por empresa (um bloco de boleto e outro de PIX); N:1 Cedente; N:1 Conta bancária; usa o certificado A1 da empresa |
| Cedente | cedente padrão; demais campos não vistos | 1 remessa = N boletos do mesmo cedente |
| Boleto | id, cliente, cedente, vencimento, valor, nosso nº, remessa, status (0 a 3), canal da baixa, data de pagamento | pertence a um título a receber e a um cedente; entra numa remessa ou é registrado por API |
| Remessa / Retorno CNAB | arquivo, títulos | retorno → baixa automática dos títulos [afirmado pelo manual] |
| Cobrança PIX | txid, valor, status, datas | ligada a um título ou venda [a verificar]; criada por um provedor |
| Título a receber (parcela) | origem (venda/OS), documento de origem, cliente, parcela, emissão, vencimento, pagamento, status 0/1, colaborador, % e valor da comissão | N:1 venda ou OS; N:1 cliente |
| Título a pagar [deduzido da Central] | fornecedor, vencimento, valor, status, data de pagamento, juros, multa, desconto, histórico | N:1 fornecedor (pessoa); N:1 conta do plano; 0..1 entrada de mercadoria |
| Tipo de recebimento | marca "Gerar QRCode PIX"; demais campos não vistos | liga o PIX ao caixa e ao PDV |
| Tipo de documento | PADRAO (único visto) | usado na movimentação bancária e nos parâmetros |
| Forma de pagamento | código, nome | usada na OS (cadastro em 08) |

**Prováveis, a verificar:** operadora de POS, transação TEF, recebível de cartão,
contador e link de acesso.

## 5. Integrações

| Integração | Onde | Estado |
| --- | --- | --- |
| Extrato OFX (arquivo baixado do banco) | Conciliação → Importar OFX | **visto**: envio manual de arquivo, sem ligação direta com o banco |
| Bancos — boleto por remessa e retorno CNAB 240/400 | `/financeiro/boletos`, integração bancária (`legacy_cnab` e layouts) | visto (botões e formulários POST); importar o retorno faz a baixa automática [afirmado pelo manual] |
| Bancos — boleto por API e webhook | aviso em `/financeiro/boletos`; provedores da integração bancária com "API bancária" como layout de remessa | visto (texto e lista); Sicredi com consulta periódica dos liquidados; CredSIS por SOAP |
| PIX dinâmico (QR no caixa e PDV) | integração bancária (12 provedores) + tipo de recebimento | lista e teste vistos; funcionamento não testado |
| Certificado digital A1 | bancos "institucionais" | visto (ajuda da tela) |
| Notificação de baixa de boleto | moldura de todas as telas (`/erp/notificacoes/boleto-baixa/poll`) | visto no código |
| TEF | `/financeiro/tef`, parâmetros, PDV | a verificar |
| Maquininhas (POS) | `/financeiro/pos-operadoras`, `/financeiro/cartoes` | a verificar |
| Portal do contador | `/contador-admin` | a verificar |
| Gateways de cobrança (links de pagamento) | módulo Cobrança | ver 12 |

## 6. Oportunidades de UX

**Bom na Olímpia (vale copiar a ideia, não o desenho)**

- Tutorial curto dentro da própria tela de conciliação, que pode ser escondido.
- Importar o extrato sem cadastrar banco e conta antes; reimportar sem medo de
  duplicar.
- Conciliação automática do que é óbvio e regras que aprendem com o uso.
- Lista de boletos com "canal da baixa" e remessa por cedente.
- Teste de autenticação e de QR PIX antes de ir para produção, com recomendação de
  começar em sandbox.

**Confuso ou fraco**

- O selo "Sem caixa — baixa em modo direto" é jargão: não diz o que muda nem onde se
  troca.
- A lista de contas bancárias vazia não explica como cadastrar uma conta (só se deduz
  que o OFX cria).
- A regra de conciliação pede a pessoa pelo código numérico, não por busca pelo nome.
- O filtro só se aplica ao clicar em "Localizar"; "Fechar" leva ao painel geral, não
  ao módulo Financeiro.
- **Integração bancária escondida no cadastro da empresa** (o item de menu é só um
  redirecionamento, sempre para a empresa 1), com credenciais e segredos no mesmo
  formulário da empresa e o nome errado da aba do certificado na ajuda.
- **Status em códigos numéricos** (0, 1, 2, 4) nas telas e relatórios; o relatório de
  boletos pede o status em texto livre, a lista usa códigos.
- **"Quitado" mistura o andamento da OS com o pagamento** e pode ser escolhido à mão.
- **Título sem estado "parcial"** nos filtros.
- **Metade da retaguarda sem ajuda:** Portal do Contador, TEF/POS, Controle de cartões
  e Conciliação não têm cartão no manual.
- **Muitas telas soltas:** mais de 20 rotas no financeiro [só pela lista de rotas; a
  confirmar quando as telas abrirem].

**Oportunidades para o nosso ERP [proposta]**

- Para o pequeno comerciante de alimentação, o recebimento que mais importa é **Pix**:
  conciliação automática pelo aviso do banco, sem OFX. O OFX fica como plano B.
- Ligação direta com o banco (Open Finance ou API) além do arquivo; arrastar e soltar
  o arquivo.
- Mostrar o grau de confiança de cada casamento e o motivo (valor, data, nome); casar
  um movimento com vários títulos (e o contrário); propor uma regra a partir de uma
  conciliação manual; desfazer conciliação; saldo do extrato e do ERP lado a lado.
- Rótulos claros em vez de códigos; separar o estado do documento (OS, venda) do
  estado financeiro, que sai dos recebimentos registrados; aceitar recebimento e
  pagamento parcial, com saldo do título.
- Uma visão única de contas a receber e a pagar.
- Segredos sempre mascarados, num cofre separado, com botão de copiar, trocar e
  "último uso".
- Boletos, TEF e POS como **módulos opcionais**, ligados só para quem usa.

## 7. Pendências

1. **Telas não abertas:** `/dashboard/modulo/financeiro`, `/financeiro/receber`,
   `/financeiro/pagar`, `/financeiro/pagar-baixa`, `/bancos`, `/banco-contas`,
   `/cedentes` (recusada), `/financeiro/boletos-liquidados`,
   `/financeiro/tipo-recebimentos`, `/financeiro/tipo-documentos`, `/financeiro/tef`,
   `/financeiro/pos-operadoras`, `/financeiro/cartoes`, `/contador-admin`,
   `/contador-admin/link`; e a rota do "Monitor de baixas". Em cada tela: abrir lista,
   filtros e "Novo", ler os campos e as opções e fechar sem gravar.
2. **Conciliação:** ler por inteiro as janelas "Importar OFX" e "Regras" (opções do
   plano de contas, obrigatoriedade, lista de regras); a etapa de conferência e a
   revisão lado a lado só aparecem com um OFX importado (importar é proibido nesta
   pesquisa; seria preciso uma conta com extrato ou o dono importar um arquivo de
   teste).
3. **Selo "Sem caixa — baixa em modo direto":** o que significa e onde se configura
   (ver também `/financeiro/recebimento`, em 03).
4. **Movimentação bancária:** transferência entre contas, estorno, importação, ligação
   com baixas e conciliação; o que é a coluna "Caixa".
5. **Integração bancária:** quais campos aparecem para cada provedor (leitura recusada);
   se o atalho abre sempre a empresa 1 numa conta com filiais.
6. **Boletos e baixas:** baixa automática pelo retorno CNAB e por webhook (afirmações
   do manual, não testadas); origem dos boletos; o que é o "Monitor de baixas".
7. **PIX:** de onde vêm as cobranças (PDV, caixa, link de pagamento, boleto híbrido),
   qual provedor e se a baixa é automática.
8. **Receber e pagar:** recebimento e pagamento parcial; juros e multa automáticos;
   recorrência; aprovação; origens dos títulos a pagar.
9. **Permissões:** tudo foi visto como ADMIN.
10. **Bloqueio:** as recusas foram do classificador do modo automático do Claude Code
    ("Third-Party Attack"); não foi problema de credencial (a conciliação abriu já
    logada), e nada foi clicado, digitado, importado ou gravado no ERP. Completar
    depende de o dono da conta autorizar a leitura. Opcional: conferir se os termos de
    uso da Olímpia permitem esta análise.

## 8. Sub-rotas descobertas

| Rota / endpoint | O que é | Estado |
| --- | --- | --- |
| `/financeiro/integracao-bancaria` → `/empresa/1#tab-integracao` | redirecionamento para a aba da empresa | lido |
| POST `/empresa/1/integracao-bancaria` | "Salvar integração bancária" | visto na estrutura; não usado |
| `/financeiro/integracao-bancaria/{driver}/testar` | "Testar conexão" por provedor | não acionado |
| `/empresa/{id}/integracao-bancaria/testar-pix` | "Testar geração QR Code" | não acionado |
| POST `/financeiro/boletos/remessa`, POST `/financeiro/boletos/retorno` | gerar remessa, importar retorno | não acionados |
| `/financeiro/receber?id_cliente={id}` | contas a receber filtradas por cliente (atalho da Consulta Cliente) | link visto; não aberto |
| GET `/erp/notificacoes/boleto-baixa/poll` | aviso de boletos liquidados | visto no código |
