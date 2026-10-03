# 12 — Cobrança automática, CRM, cashback e portal do cliente (ERP Olímpia)

> Cobre os módulos Cobrança Automática (réguas, links de pagamento, gateways),
> CRM, Cashback e Portal do Cliente. Exploração de 2026-10-03, conta de teste
> "Boi Criolo" (plano Full), sessão já aberta no navegador embutido. A cobrança
> foi lida por inteiro; do CRM só o lançador; cashback e portal não abriram.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual],
> [código] (lido no HTML/JS da página), [proposta]; [a verificar] marca
> hipótese ou conhecimento geral, não visto no ERP. Nada foi gravado no ERP.

## 1. Visão geral

### 1.1 Onde ficam no menu e no plano

- **Menu lateral [visto]:** os quatro módulos ficam na secção "Vendas &
  Atendimento", junto com a Ordem de Serviço: Ordem de Serviço, CRM, Cashback,
  Cobrança e Portal Cliente.
  - Grupo "Cobrança": Dashboard, Réguas de Cobrança, Links de Pagamento e
    Gateways.
  - Grupo "CRM": os 6 itens do lançador (secção 2.6).
  - Grupo "Portal Cliente": 2 itens, "PWA" e "Links de Acesso".
- **Plano [visto em `/meu-plano`, ver
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)]:**
  - o resumo do plano Profissional cita "CRM/markup";
  - o resumo do Full cita "portais" e "cobrança automática";
  - na lista dos 36 módulos do Full aparecem, por esta ordem, Cashback (8.º),
    CRM / Markup (17.º), Portal do Cliente (31.º) e Cobrança Automática (34.º).
  - [a verificar] Se a ordem da lista seguir os escalões (hipótese registada no
    18), Cashback e CRM / Markup já estariam no Profissional, e Portal do
    Cliente e Cobrança Automática seriam exclusivos do Full.
- **Manual [visto, ver [22-manual.md](22-manual.md)]:** tem cartões para
  "Cobrança Automática" e "Portal do Cliente". **CRM e Cashback não têm
  cartão.**

### 1.2 Cobrança automática (síntese)

- **Para que serve [visto]:** o subtítulo do painel resume em três peças:
  réguas, links PIX/boleto e gateways.
  - **Réguas de cobrança:** sequência de mensagens automáticas, marcadas em
    dias contados a partir do vencimento da parcela.
  - **Links de pagamento:** link PIX, boleto ou cartão gerado para uma parcela
    em aberto.
  - **Gateways:** configuração de três provedores de pagamento (Asaas, Efí e
    Mercado Pago).
  - **Painel:** réguas ativas, histórico de execuções e um botão para rodar as
    réguas na hora.
- **Base de tudo [deduzido]:** o módulo não cria dívidas. Ele age sobre o
  **título a receber (parcela)** do contas a receber (ver
  [11-financeiro-bancos.md](11-financeiro-bancos.md)), o mesmo usado por vendas
  e OS (ver [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md)).
- **Maturidade [deduzido]:** etapas fixas, só e-mail e um campo chamado
  "API Key (stub)". O módulo parece uma primeira versão: a estrutura existe,
  mas quase nada é configurável.
- **Navegação [visto]:** além do menu lateral, o painel repete atalhos para
  Réguas, Links e Gateways no topo.
- **O que o manual afirma [afirmado pelo manual]:** réguas com etapas
  (lembrete, cobrança); um **"job" diário** executa as réguas; links de
  pagamento (PIX, boleto) para os clientes, gerados pelos gateways; o cliente
  paga. O cartão do manual não tem botão "Abrir módulo".

### 1.3 CRM, cashback e portal do cliente (o pouco que se sabe)

- **CRM [visto em parte]:** só o lançador foi lido, com 6 atalhos (painel,
  calendário de aniversários, clientes do CRM, operação, campanhas e "CRM
  Markup"). Pistas indiretas sobre o "CRM Markup" na secção 2.12.
- **Cashback [não visto]:** as telas não abriram. Os parâmetros da empresa têm
  cashback (ativo, %, tipo) no grupo Financeiro e outra entrada "cashback" no
  grupo Outros (secção 1.4).
- **Portal do Cliente [afirmado pelo manual]:** o cartão do manual diz que o
  cliente entra em `/cliente-portal/app`, vê os títulos e baixa boletos,
  acompanha pedidos e abre chamados; o subtítulo do cartão cita PIX, NF-e e OS.
  A tela de chamados da OS tem uma coluna "Origem" que aponta para o portal
  (ver [14-os-forca-vendas.md](14-os-forca-vendas.md)).

### 1.4 Parâmetros da empresa ligados a estas áreas (síntese)

A aba "Parâmetros" do cadastro da empresa (cerca de 420 opções) fica descrita
por inteiro em [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md).
O que toca estes módulos [visto; rótulos interpretados quando eram nomes de
coluna]:

- **Financeiro (23 campos):** juros, multa e dias de tolerância; **cashback
  (ativo, %, tipo)**; dias para bloquear cliente; remessa automática de boleto
  (ligada).
- **Outros (17 campos):** cupom de troca, **cashback**, pessoa duplicada,
  liberação online.
- **Consulta / Diversos (11 campos):** avisos de **aniversário** e de
  **clientes sem comprar** (entre outros). [deduzido] Sobrepõe-se ao que o CRM
  promete (calendário de aniversários).
- **Vendas:** "bloquear cliente inadimplente" está ligado na conta.
- [a verificar] Se o cashback dos parâmetros é o mesmo que se configura em
  `/cashback-admin`, ou se a tela do módulo substitui estes campos.

### 1.5 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/cobranca` | Cobrança Automática (lançador) | lida (uma primeira tentativa, no mesmo dia, foi recusada; numa passagem posterior abriu) |
| `/cobranca` | Painel da cobrança | lida |
| `/cobranca/reguas` | Réguas de cobrança | lida |
| `/cobranca/links` | Links de pagamento | lida (modal de busca aberto e fechado) |
| `/cobranca/gateway` | Gateways | lida (conteúdo das chaves não lido) |
| `/dashboard/modulo/crm` | CRM (lançador) | parcial (leitura dos links recusada a meio) |
| `/crm` | Dashboard CRM | não aberta |
| `/crm/aniversarios` | Calendário de aniversários | não aberta |
| `/crm/clientes` | Clientes do CRM | não aberta |
| `/crm/operacao` | Operação CRM | não aberta |
| `/crm/gestao` | Gestão de campanhas | não aberta |
| `/crm-markup` | CRM Markup | não aberta |
| `/dashboard/modulo/cashback` | Cashback (lançador) | recusada |
| `/cashback-admin` | Cashback (gestão) | não aberta |
| `/dashboard/modulo/cliente` | Portal do Cliente (lançador) | não aberta |
| `/cliente-portal/app` | PWA do Portal do Cliente | recusada |
| `/cliente-portal-admin/link` | Links de acesso do portal | não aberta |

---

## 2. Telas

### 2.1 `/dashboard/modulo/cobranca` — lançador do módulo [visto]

- **Objetivo:** porta de entrada. Título "Cobrança Automática" e link "Voltar
  ao dashboard".
- Um bloco "Gestão" com 4 cartões (ícone e nome):

| Cartão | Rota |
| --- | --- |
| Dashboard | `/cobranca` |
| Réguas de cobrança | `/cobranca/reguas` |
| Links de pagamento | `/cobranca/links` |
| Gateways | `/cobranca/gateway` |

- Sem números nem contadores nos cartões.

### 2.2 `/cobranca` — painel da cobrança [visto]

- **Objetivo:** ver que réguas estão ligadas e o que foi disparado.
- **Ações no topo:**
  - **Executar réguas**: botão de formulário que manda o servidor rodar as
    réguas agora. É ação de envio. **Não clicado.**
  - Atalhos Réguas, Links e Gateways.
- **Cartão "Réguas ativas":** lista das réguas ligadas. Vazio: "Nenhuma régua."
- **Cartão "Últimas execuções":** tabela com as colunas Título, Ação, Canal,
  Status e Quando. Vazio: "Sem execuções."
- Sem filtros, sem período, sem totais. Paginação não aparece (lista vazia).
- **Regras e comportamento:**
  - [deduzido] Cada linha do histórico é uma etapa de régua aplicada a um título
    a receber (por exemplo: lembrete por e-mail da parcela X, em tal data).
  - [deduzido] O botão manual indica que a execução pode ser feita sob pedido.
  - **Rotina automática:** a tela não mostra nenhuma. O manual **afirma** que
    há um "job" diário que executa as réguas [afirmado pelo manual; não
    verificado].
  - [a verificar] Valores de "Status" (enviado, falhou, pendente...): não há
    nenhuma execução para ver.
  - [a verificar] Se o botão pede confirmação ou mostra prévia antes de disparar.
- **Relatório irmão:** a Central de relatórios tem `cobranca-execucoes`
  ("ações da régua de cobrança: canal e status", 5 filtros, só na Central, fora
  do menu; ver [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)).
  O catálogo de relatórios pressupõe uma "régua de cobrança com vários canais",
  enquanto a tela de réguas só oferece e-mail [deduzido].

### 2.3 `/cobranca/reguas` — réguas de cobrança [visto]

- **Layout:** duas colunas. À esquerda, o cartão "Nova régua". À direita, área
  vazia [deduzido: onde apareceria a lista de réguas criadas; a conta não tem
  nenhuma].
- **Formulário "Nova régua":**

| Campo | Tipo | Obrigatório | Opções / padrão |
| --- | --- | --- | --- |
| Nome | texto | sim | — |
| Ativa | caixa de seleção | não | marcada por padrão |
| Etapas | fixas, não editáveis | — | 3 etapas padrão (abaixo) |

- **Etapas padrão** (dias contados a partir do vencimento):

| Dias | Ação | Canal |
| --- | --- | --- |
| −3 (3 dias antes) | Lembrete | E-mail |
| 0 (no dia do vencimento) | Aviso | E-mail |
| +5 (5 dias depois) | Cobrança | E-mail |

- [código] As etapas vão junto com o nome, como campos escondidos. Cada etapa
  tem 3 atributos: dias relativos (inteiro com sinal; negativo é antes do
  vencimento), ação (`lembrete`, `aviso`, `cobranca`) e canal (`email`).
- Botão **Salvar**. **Não clicado.**
- **Regras e comportamento:**
  - [visto] Dia 0 é o vencimento; número negativo é antes, positivo é depois.
  - [visto] A tela **não** deixa: mudar os dias, pôr ou tirar etapas, escolher
    canal, editar o texto da mensagem, escolher a que clientes ou títulos a
    régua vale, nem definir horário.
  - [deduzido] Como toda régua nova nasce com as mesmas etapas, ter mais de uma
    régua só faz sentido se for possível editá-la depois (não visto) ou ligá-la
    a um grupo de clientes (não visto).
  - [a verificar] Com duas réguas ativas, o mesmo título recebe as mensagens
    das duas?
  - [a verificar] Editar, desativar e excluir réguas existentes (não há nenhuma
    para abrir).

### 2.4 `/cobranca/links` — links de pagamento [visto]

- **Objetivo:** gerar um link de pagamento para uma parcela a receber.
- **Formulário (topo da tela):**

| Campo | Tipo | Obrigatório | Opções / regra |
| --- | --- | --- | --- |
| ID receber | número | sim | mínimo 1; é o código interno da parcela |
| Lupa "Pesquisar por cliente" | botão | — | abre o modal de seleção |
| Tipo | lista | tem padrão | PIX (padrão), Boleto, Cartão |

- Botão **Gerar link**. **Não clicado.**
- Depois de escolher pelo modal, aparece abaixo do campo um resumo: parcela,
  vencimento, valor e cliente [código].
- **Modal "Selecionar parcela a receber"** (2 passos):
  1. **Cliente:** busca por nome, CPF/CNPJ ou código, com botão "Buscar".
     Exige pelo menos 2 caracteres; com menos, aparece um aviso do navegador.
     Resultado em tabela (Cód., Cliente, CPF/CNPJ); clicar na linha escolhe o
     cliente.
  2. **Parcelas em aberto do cliente:** tabela com ID, Parc., Vencimento,
     Valor, Histórico e botão "Selecionar". Parcela atrasada ganha, ao lado do
     vencimento, um selo amarelo "+N d" (dias de atraso). "Trocar cliente" volta
     ao passo 1.
  - Mensagens de vazio: "Nenhum cliente encontrado." e "Nenhuma parcela em
    aberto para este cliente."
  - Rodapé com "Fechar". O modal não fecha ao clicar fora dele.
- **Lista de links:** tabela com Título, Tipo, Valor, URL e Status. Vazio:
  "Nenhum link." Sem filtros, sem busca. Ações por linha não aparecem (lista
  vazia).
- **Regras e comportamento:**
  - [visto] O modal só mostra parcelas em aberto.
  - [visto] Os dias de atraso são calculados e mostrados.
  - [deduzido] O valor do link vem da parcela: não há campo de valor, juros,
    multa, desconto nem validade do link.
  - [deduzido] O formulário não pergunta o gateway. Qual é usado quando há mais
    de um ativo não aparece [a verificar].
  - [a verificar] Status possíveis do link, expiração, baixa automática do
    título quando o cliente paga, envio do link por WhatsApp ou e-mail.
  - Teste feito: o modal foi aberto, uma busca de cliente com 2 letras devolveu
    "Nenhum cliente encontrado" e o modal foi fechado no botão "Fechar". Não se
    insistiu, porque a consulta seguinte (direta, por script, à busca de
    clientes do modal) foi recusada.
- **Relatório ligado:** "PIX recebidos" (`/relatorios/pix-recebidos`) lista
  cobranças PIX com txid; o txid indica PIX dinâmico gerado por um provedor
  [deduzido], o que casa com os gateways desta área (ver
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)).

### 2.5 `/cobranca/gateway` — gateways de pagamento [visto]

- **Objetivo:** ligar e configurar os provedores que geram PIX, boleto e
  cartão.
- Três cartões lado a lado, cada um com o mesmo formulário:

| Provedor | Código [código] | Ativo (estado atual) | Sandbox (estado atual) |
| --- | --- | --- | --- |
| Asaas | `asaas` | desmarcado | marcado |
| Efí (antiga Gerencianet) | `efi` | desmarcado | marcado |
| Mercado Pago | `mercadopago` | desmarcado | marcado |

- **Campos de cada cartão:**

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Ativo | caixa de seleção | não | liga o provedor |
| API Key (stub) | texto simples, sem máscara | não | um só campo de credencial; o conteúdo não foi lido |
| Sandbox | caixa de seleção | não | modo de testes; marcado por padrão |

- Botão **Salvar** em cada cartão (grava só aquele provedor). **Não clicado.**
- **Regras e comportamento:**
  - [visto] Lista fixa de 3 provedores. Não há como pôr outro.
  - [visto] O próprio rótulo diz "(stub)". [deduzido] A integração parece um
    marcador de lugar, talvez ainda sem funcionar de verdade.
  - [a verificar, conhecimento geral] Os provedores reais pedem mais que uma
    chave: a Efí usa identificador e segredo do cliente e certificado para PIX;
    o Mercado Pago usa token de acesso (e chave pública para cartão); o Asaas
    usa chave de API e webhook. A tela não tem nada disso, nem endereço de
    webhook, chave PIX, regras de boleto (juros, multa, desconto) ou botão
    "testar conexão".
  - [a verificar] Se dois provedores estiverem ativos, qual gera o link.
- **Configuração paralela [visto, ver
  [11-financeiro-bancos.md](11-financeiro-bancos.md) e
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)]:** a aba
  "Integração Bancária" do cadastro da empresa também tem Asaas e Efí como
  provedores de boleto e de PIX (entre 16 e 12 opções), essa sim com Token/API
  Key, Client ID, Client Secret, Customer ID do Asaas, ambiente e botões de
  teste. [deduzido] O mesmo provedor pode ser configurado em dois lugares, sem
  ligação visível entre eles.

### 2.6 `/dashboard/modulo/crm` — lançador do CRM [visto em parte]

- Título "CRM", link "Voltar ao dashboard" e um bloco "Relacionamento" com 6
  cartões:

| Cartão | Rota (segundo o menu lateral) |
| --- | --- |
| Dashboard CRM | `/crm` |
| Calendário de aniversários | `/crm/aniversarios` |
| Clientes do CRM | `/crm/clientes` |
| Operação CRM | `/crm/operacao` |
| Gestão de campanhas | `/crm/gestao` |
| CRM Markup | `/crm-markup` |

- A ligação cartão → rota vem do grupo "CRM" do menu lateral, lido antes da
  recusa. A leitura (por script) dos links desta página foi recusada; depois
  disso nada mais foi lido nesta tela.

### 2.7 `/crm` — Dashboard CRM [não aberta]

- **Perguntas a responder:** que indicadores mostra (clientes ativos e
  inativos, recompra, ticket médio, aniversariantes)? Tem filtro de período?

### 2.8 `/crm/aniversarios` — Calendário de aniversários [não aberta]

- **Já se sabe:** os parâmetros da empresa têm um aviso de aniversário no
  grupo "Consulta / Diversos" (secção 1.4).
- **Perguntas a responder:** calendário por mês? De onde vem a data (cadastro
  de pessoas)? Tem ação de mensagem, cupom ou cashback de aniversário? Qual a
  relação com o aviso de aniversário dos parâmetros?

### 2.9 `/crm/clientes` — Clientes do CRM [não aberta]

- **Perguntas a responder:** em que difere do cadastro de clientes
  (`/pessoas?tipo=cliente`) e da "Consulta Cliente" (`/consulta-cliente`, ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md))? Tem
  segmentos, etiquetas, estágio de funil, último pedido, total gasto?

### 2.10 `/crm/operacao` — Operação CRM [não aberta]

- **Perguntas a responder:** é uma fila de contatos ou tarefas do dia? Quem
  atende? Como se registra o resultado do contato?

### 2.11 `/crm/gestao` — Gestão de campanhas [não aberta]

- **Perguntas a responder:** como se cria uma campanha: público, canal,
  mensagem, agendamento, métricas?

### 2.12 `/crm-markup` — CRM Markup [não aberta]

- **Já se sabe:**
  - [deduzido] A rota fica fora do padrão `/crm/...`, o que sugere uma peça
    acoplada depois.
  - [visto em `/cadastros/checklist`, ver
    [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)] "CRM
    Markup" (`/crm-markup`) é um dos 26 cadastros migrados do sistema Delphi,
    marcado como completo e sem ajuste pendente. Entre os "padrões globais" do
    checklist aparecem "grades-filhas" de "metas de CRM".
  - [visto na Central, ver
    [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)]
    o relatório `crm-meta-markup` (1 filtro, só na Central) mostra "metas de
    markup por grupo de produto". É o único relatório da categoria CRM.
  - [deduzido] Juntando as duas pistas: o "CRM Markup" é provavelmente um
    cadastro de metas de markup (margem) por grupo de produto, e não um CRM de
    relacionamento.
- **Perguntas a responder:** confirmar os campos (grupo de produto, meta de
  markup, período, vendedor?) e onde a meta é usada (vendas, comissões, BI).

### 2.13 `/dashboard/modulo/cashback` — lançador do cashback [recusada]

- A navegação foi recusada logo na primeira tentativa; nada carregou.
- **Já se sabe:** só os parâmetros da empresa (secção 1.4) e a posição no plano
  (secção 1.1).
- **Perguntas a responder:** que cartões e atalhos tem.

### 2.14 `/cashback-admin` — gestão do cashback [não aberta]

- **Perguntas a responder** (conhecimento geral do varejo; nada visto):
  - como o cliente ganha (percentual da venda, por produto, por faixa de
    valor);
  - prazo de validade do saldo;
  - valor mínimo e limite de uso por compra;
  - se o saldo vira forma de pagamento no Caixa ou no PDV (a lista de perguntas
    do PDV também cita o cashback como possível forma de pagamento, ver
    [02-vendas-pdv.md](02-vendas-pdv.md));
  - extrato por cliente;
  - o que acontece quando a venda é cancelada;
  - se o cliente é avisado (WhatsApp, e-mail);
  - se o saldo aparece no cadastro de pessoa ou na "Consulta Cliente" (ver
    [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md));
  - [a verificar] se o saldo é o mesmo "crédito do cliente" dos relatórios
    `cliente-creditos` (créditos e débitos na conta do cliente) e
    `cliente-creditos-venda` (créditos usados em vendas, só na Central), ver
    [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).

### 2.15 `/dashboard/modulo/cliente` — lançador do Portal do Cliente [não aberta]

- **Já se sabe:** o grupo "Portal Cliente" do menu tem 2 itens, "PWA" e "Links
  de Acesso" [visto no menu].
- **Perguntas a responder:** que cartões tem; o que o comerciante configura.

### 2.16 `/cliente-portal/app` — PWA do Portal do Cliente [recusada]

- É o destino do botão "Abrir módulo" do cartão "Portal do Cliente" do manual.
  A navegação foi recusada.
- **O que o manual afirma [afirmado pelo manual]:**
  - o cliente usa `/cliente-portal/app`;
  - vê os títulos e baixa boletos;
  - acompanha pedidos e abre chamados;
  - o subtítulo do cartão cita PIX, NF-e e OS.
- [deduzido] Os outros apps públicos redirecionam para um endereço por empresa
  (`/{app}/v/{slug}/...`); é provável que este também (a verificar).
- **Ligação com a OS [visto em parte, ver
  [14-os-forca-vendas.md](14-os-forca-vendas.md)]:** a tela de chamados da OS
  (`/os-admin/chamados`) não tem botão de novo chamado e tem a coluna "Origem";
  o chamado nasce fora dela, muito provavelmente no portal. O manual descreve o
  fluxo "o chamado vem do portal do cliente ou a OS é criada direto".
- **Perguntas a responder:** como o cliente entra (CPF, senha, link); o que vê
  (compras, notas, boletos, OS, saldo de cashback); se abre chamado de OS por
  ali; como o link é divulgado (QR, WhatsApp). **Não fazer login no app do
  cliente.**

### 2.17 `/cliente-portal-admin/link` — links de acesso do portal [não aberta]

- **Perguntas a responder:** o link é único por empresa ou por cliente? Tem QR
  code? Pode ser renovado ou revogado? Quem cria a senha do cliente?

---

## 3. Fluxos de ponta a ponta

### 3.1 Cobrança automática por régua

1. **Uma vez:** configurar o gateway (marcar Ativo, preencher a chave, tirar do
   Sandbox quando for para produção) [visto: campos].
2. **Criar a régua:** nome e "Ativa". Ela nasce com as 3 etapas padrão (−3
   lembrete, 0 aviso, +5 cobrança, todas por e-mail) [visto].
3. **Vendas e OS geram títulos a receber** em parcelas com vencimento [visto,
   ver [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md)].
4. **Execução:** o botão "Executar réguas" ou o "job" diário [afirmado pelo
   manual] percorre as parcelas em aberto. Para cada etapa cujo dia bate com a
   distância entre hoje e o vencimento, envia a mensagem pelo canal da etapa
   [deduzido].
5. **Registro:** cada envio vira uma linha em "Últimas execuções" (título, ação,
   canal, status, quando) [visto: colunas] e no relatório
   `cobranca-execucoes` [visto na Central].
6. **Fim:** parcela paga sai da régua [a verificar].

### 3.2 Link de pagamento avulso

1. Abrir Links de pagamento. Digitar o ID da parcela ou usar a lupa: cliente →
   parcela em aberto (com dias de atraso) → Selecionar [visto].
2. Escolher PIX, Boleto ou Cartão e clicar "Gerar link". [deduzido] O gateway
   ativo cria a cobrança e devolve a URL.
3. O link entra na lista com título, tipo, valor, URL e status [visto: colunas].
4. Envio ao cliente: não há botão de envio na tela [visto, com lista vazia];
   copiar ou mandar por WhatsApp [a verificar].
5. Pagamento confirmado → baixa da parcela [a verificar]. O que se sabe:
   - a moldura do ERP tem um aviso de "boletos liquidados" (baixa automática),
     consultado de tempos em tempos [código, ver
     [11-financeiro-bancos.md](11-financeiro-bancos.md)];
   - o manual cita a baixa pelo **arquivo de retorno CNAB** e a ajuda do
     Sicredi cita **consulta periódica** dos liquidados;
   - **webhook de gateway não é citado** em lado nenhum.

### 3.3 Chamado pelo portal → OS [afirmado pelo manual]

1. O cliente abre o chamado no Portal do Cliente.
2. O chamado aparece em `/os-admin/chamados` com a origem (ver
   [14-os-forca-vendas.md](14-os-forca-vendas.md)).
3. O atendente converte o chamado em OS.

Nem o portal nem a conversão foram vistos a funcionar.

### 3.4 CRM e cashback

Não vistos (só os nomes das telas do CRM e os parâmetros do cashback).

---

## 4. Entidades e relações

| Entidade | Campos vistos | Relações |
| --- | --- | --- |
| Gateway de pagamento | provedor (`asaas`, `efi`, `mercadopago`), ativo, chave de API, sandbox | um por provedor e por empresa [deduzido]; usado para gerar links [deduzido] |
| Régua de cobrança | nome, ativa | 1–N etapas; vale para títulos a receber [deduzido]; executada por botão ou "job" diário [afirmado pelo manual] |
| Etapa da régua | dias relativos ao vencimento (inteiro com sinal), ação (`lembrete`, `aviso`, `cobranca`), canal (`email`) | pertence a 1 régua |
| Execução da régua (histórico) | título, ação, canal, status, quando | liga 1 etapa a 1 título a receber [deduzido] |
| Link de pagamento | título (parcela), tipo (`pix`, `boleto`, `cartao`), valor, URL, status | pertence a 1 título a receber; gerado por 1 gateway [deduzido] |
| Título a receber (parcela) | ID, nº da parcela, vencimento, valor total, histórico, dias de atraso (calculado), situação aberta ou paga | pertence a 1 cliente; nasce de venda ou OS (ver 11 e 20) |
| Cliente | código, nome, CPF/CNPJ | 1–N títulos a receber |
| Meta de markup ("CRM Markup") [deduzido] | grupo de produto, meta de markup | N:1 Grupo de produto; relatório `crm-meta-markup` |
| Cashback [não visto] | pelos parâmetros: ativo, %, tipo | por empresa; [a verificar] saldo por cliente e uso em vendas |
| Chamado do portal [visto em parte, ver 14] | assunto, cliente, prioridade, status, origem | N:1 Cliente; convertido em OS |
| CRM (não visto) | — | campanhas, aniversários e "clientes do CRM" sugerem segmentação sobre o cadastro de clientes [a verificar] |

---

## 5. Integrações

| Integração | O que a tela mostra | Situação |
| --- | --- | --- |
| Asaas, Efí, Mercado Pago | um cartão de configuração cada (ativo, chave, sandbox) | [visto]; funcionamento real não verificado; rótulo "stub" |
| Asaas e Efí também na Integração Bancária da empresa | boleto e PIX com credenciais completas e teste | [visto, ver 11 e 08]; relação com os gateways da cobrança não aparece |
| E-mail | único canal das etapas da régua | [visto]; servidor, remetente e modelos de mensagem não aparecem |
| PIX, boleto, cartão | tipos de link | [visto]; emissão pelo gateway [deduzido] |
| WhatsApp, SMS | **não aparecem** na cobrança | [visto: ausentes]; o catálogo de relatórios fala em "vários canais" |
| Retorno de pagamento e baixa automática | nada na tela de cobrança | manual: retorno CNAB e "job" diário; aviso "boletos liquidados" na moldura [código]; webhook de gateway não citado |
| Agendador do servidor | "job" diário da cobrança | [afirmado pelo manual] |
| Loja virtual | a coluna "Pagamento" dos pedidos e o grupo "Cobrança > Gateways" do menu sugerem pagamento online | indício (ver [06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md)) |
| PWA do Portal do Cliente | app público | [afirmado pelo manual]; abertura recusada |
| CRM, cashback | — | não vistos |

---

## 6. Oportunidades de UX

- **Régua engessada.** As etapas são fixas e nem aparecem como editáveis.
  [proposta] Editor simples de etapas (dia, canal, texto da mensagem), com
  linha do tempo visual e prévia da mensagem.
- **Só e-mail.** O nosso público (pequeno comerciante de alimentação) cobra por
  WhatsApp. [proposta] WhatsApp como canal padrão, e-mail como opção.
- **Disparo sem prévia.** "Executar réguas" fica em destaque no painel e não
  mostra antes quantas mensagens vai mandar nem para quem. Risco de disparo em
  massa por engano. A rotina diária que o manual cita também não aparece na
  tela. [proposta] Rotina automática visível ("próxima execução hoje às 9h") e
  prévia "X mensagens serão enviadas" antes de qualquer envio manual.
- **Painel sem números.** Não mostra valor em atraso, valor recuperado, taxa de
  pagamento após a mensagem. [proposta] 3 ou 4 indicadores simples no topo.
- **Link exige um ID técnico.** O campo principal pede o "ID receber"; a busca
  amigável fica escondida atrás de uma lupa. [proposta] Gerar o link a partir
  da própria parcela (no contas a receber ou na ficha do cliente), com botões
  "copiar", "mandar no WhatsApp" e QR code PIX.
- **Gateway confuso e inseguro.** Um campo genérico "API Key (stub)", em texto
  visível, sem webhook nem teste, e o mesmo provedor configurável em dois
  sítios (cobrança e integração bancária da empresa). [proposta] Assistente
  por provedor, num lugar só, campos mascarados, botão "testar conexão",
  endereço de webhook mostrado e um provedor padrão por tipo de pagamento.
- **Validação com aviso do navegador** (busca com menos de 2 letras).
  [proposta] Mensagem dentro do próprio campo.
- **Tela de réguas sem estado vazio útil.** A coluna da direita fica em branco
  quando não há réguas. [proposta] Estado vazio que explica o que é uma régua e
  sugere um modelo pronto.
- **CRM partido em 6 telas** (painel, aniversários, clientes, operação,
  campanhas, markup), além de "Clientes", "Consulta Cliente" e dos avisos de
  aniversário e de clientes sem comprar nos parâmetros. Provável sobreposição
  [a verificar]. [proposta] Uma ficha única do cliente, com aniversário,
  histórico de compras, saldo de cashback e campanhas no mesmo lugar.
- **"CRM Markup" com nome ambíguo** e rota fora do padrão; tudo indica que é
  meta de margem por grupo de produto, sem relação com relacionamento.
  [proposta] Nomes que digam o que a tela faz; meta de margem junto de
  preços/produtos.
- **Ajuda em falta.** O manual não tem cartão para CRM nem para Cashback (ver
  [22-manual.md](22-manual.md)).

---

## 7. Pendências

### 7.1 Bloqueios (resumo)

- **Não foi problema de credencial:** a sessão estava aberta e as 5 rotas da
  cobrança e o lançador do CRM abriram já logados.
- O **classificador do modo automático do Claude Code** recusou, com o motivo
  "Third-Party Attack":
  1. numa primeira tentativa, a própria navegação para
     `/dashboard/modulo/cobranca` (mais tarde a mesma rota abriu);
  2. a consulta direta (por script) à busca de clientes do modal de
     `/cobranca/links`;
  3. a leitura (por script) dos links de `/dashboard/modulo/crm`;
  4. a navegação para `/dashboard/modulo/cashback` (por isso não se tentaram
     as outras rotas de cashback e portal);
  5. a navegação para `/cliente-portal/app` (botão do manual).
- Depois de cada recusa o objetivo foi abandonado, sem tentar outro caminho.
  Nada foi gravado, enviado ou alterado no ERP. Completar depende de o dono da
  conta autorizar a leitura (e de confirmar que os termos de uso da Olímpia o
  permitem).

### 7.2 O que ficou por ver

1. **CRM:** as 6 rotas (`/crm`, `/crm/aniversarios`, `/crm/clientes`,
   `/crm/operacao`, `/crm/gestao`, `/crm-markup`); o lançador só foi lido em
   parte. Perguntas em cada secção (2.7 a 2.12).
2. **Cashback e portal:** as 5 rotas (2.13 a 2.17).
3. **Cobrança, ainda por confirmar:**
   - se o "job" diário que o manual afirma existe mesmo, e a que horas corre;
   - status possíveis das execuções e dos links;
   - lista, edição, desativação e exclusão de réguas existentes;
   - modelos (texto) dos e-mails de cada etapa e remetente;
   - qual gateway gera o link quando há mais de um ativo; expiração do link;
   - baixa automática da parcela após o pagamento (webhook do gateway);
   - o que "stub" significa na prática (integração real ou não);
   - se o contas a receber oferece ação de cobrança ou de link por título (ver
     [11-financeiro-bancos.md](11-financeiro-bancos.md)).
4. A busca de clientes com 2 letras não achou ninguém. Não se confirmou se a
   conta de teste tem clientes ou parcelas em aberto.
5. **Plano:** confirmar em que plano entram Cashback, CRM / Markup, Portal do
   Cliente e Cobrança Automática (hoje é hipótese pela ordem da lista).

### 7.3 Ações vistas e não clicadas

- "Executar réguas" (painel);
- "Salvar" (nova régua e cada gateway);
- "Gerar link" (links de pagamento);
- o conteúdo dos campos "API Key (stub)" não foi lido.
