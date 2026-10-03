# 910 — Lacunas, lote 11: cobrança automática e CRM (ERP Olímpia)

> **Estado: explorado em parte (6 de 12 rotas).** Data: 2026-10-03. Conta de
> teste "Boi Criolo" (plano Full), sessão já aberta no navegador embutido.
>
> - **Cobrança automática: completa.** As 5 rotas abriram e foram lidas
>   (lançador, painel, réguas, links de pagamento e gateways).
> - **CRM: só o lançador.** A tela `/dashboard/modulo/crm` abriu e deu para ler
>   os nomes dos 6 atalhos. Logo depois, a trava de segurança do Claude Code
>   recusou continuar. As outras 6 rotas do CRM **não foram abertas**.
>
> Marcação usada: **[visto]** apareceu na tela ou na estrutura da página
> carregada; **[deduzido]** conclusão direta do que foi visto; **[a verificar]**
> hipótese ou conhecimento geral, não visto no ERP.

## Em palavras simples

1. **A senha está certa. Não precisa mandar de novo.** Desta vez as páginas
   abriram já logadas: 6 telas foram lidas.
2. **Quem parou a pesquisa foi o próprio Claude Code, não a Olímpia.** Ele tem
   uma trava automática (a do "modo automático"). Ela confere cada ação antes
   de a ação acontecer.
3. **A trava disse "não" duas vezes**, com o motivo "Third-Party Attack" (ação
   que pode prejudicar outra empresa):
   - quando o agente tentou consultar direto a busca de clientes do sistema;
   - quando o agente só ia ler os atalhos da página do CRM.
4. **Quando a trava diz "não", o agente tem de parar.** Tentar por outra aba,
   outra ferramenta ou outro caminho seria desobedecer à segurança. Por isso o
   CRM ficou por fazer.
5. **A senha não muda nada nisso.** A trava não pede senha. Ela decide se o
   agente pode continuar a levantar o sistema de outra empresa.
6. **Só você decide se libera.** Veja "Como continuar", no fim. Depois, basta
   rodar de novo só as 6 rotas do CRM.

## O que aconteceu (registro técnico)

- Aba própria criada no navegador embutido (`tab-38`). A aba do usuário
  (`tab-1`) e as outras abas abertas não foram tocadas. A `tab-38` foi fechada
  no fim.
- As 5 rotas da cobrança e o lançador do CRM abriram normalmente, já logados.
- Em `/cobranca/links`, o modal de busca foi aberto, foi feita uma busca de
  cliente com 2 letras (resultado: nenhum cliente encontrado) e o modal foi
  fechado no botão "Fechar".
- **Recusa 1:** consulta direta (por script) à busca de clientes desse modal.
  Nada foi obtido.
- **Recusa 2:** leitura (por script) dos links da página `/dashboard/modulo/crm`.
- A recusa vale para o objetivo (continuar a levantar o ERP), não só para o
  comando. Por isso a exploração parou aí, sem tentar outro caminho.
- **Nada foi gravado, enviado ou alterado no ERP.** Não foram clicados
  "Executar réguas", "Salvar" nem "Gerar link". O conteúdo dos campos de chave
  de API não foi lido.

---

## 1. Visão geral do módulo de cobrança

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
  **título a receber (parcela)** do contas a receber, o mesmo usado por vendas
  e OS (arquivo `20-relatorios-comissoes-os.md`).
- **Maturidade [deduzido]:** etapas fixas, só e-mail e um campo chamado
  "API Key (stub)". O módulo parece uma primeira versão: a estrutura existe,
  mas quase nada é configurável.
- **Navegação [visto]:** no menu lateral há o grupo "Cobrança" com Dashboard,
  Réguas de Cobrança, Links de Pagamento e Gateways. O painel repete atalhos
  para Réguas, Links e Gateways no topo.

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
    Se também há uma rotina automática (diária, por exemplo) não aparece na tela
    [a verificar].
  - [a verificar] Valores de "Status" (enviado, falhou, pendente...): não há
    nenhuma execução para ver.
  - [a verificar] Se o botão pede confirmação ou mostra prévia antes de disparar.

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

- [visto na estrutura da página] As etapas vão junto com o nome, como campos
  escondidos. Cada etapa tem 3 atributos: dias relativos (inteiro com sinal;
  negativo é antes do vencimento), ação (`lembrete`, `aviso`, `cobranca`) e
  canal (`email`).
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
  vencimento, valor e cliente [visto no script da página].
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
  - Teste feito: busca com 2 letras devolveu "Nenhum cliente encontrado". Não se
    insistiu (ver recusa 1).

### 2.5 `/cobranca/gateway` — gateways de pagamento [visto]

- **Objetivo:** ligar e configurar os provedores que geram PIX, boleto e
  cartão.
- Três cartões lado a lado, cada um com o mesmo formulário:

| Provedor | Ativo (estado atual) | Sandbox (estado atual) |
| --- | --- | --- |
| Asaas | desmarcado | marcado |
| Efí (antiga Gerencianet) | desmarcado | marcado |
| Mercado Pago | desmarcado | marcado |

- **Campos de cada cartão:**

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Ativo | caixa de seleção | não | liga o provedor |
| API Key (stub) | texto simples, sem máscara | não | um só campo de credencial |
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
  recusa. Depois da recusa 2, nada mais foi lido nesta tela.

### 2.7 Telas do CRM não abertas (o que verificar na próxima vez)

| Rota | O que a próxima passagem precisa responder |
| --- | --- |
| `/crm` | Que indicadores mostra (clientes ativos e inativos, recompra, ticket médio, aniversariantes)? Tem filtro de período? |
| `/crm/aniversarios` | Calendário por mês? De onde vem a data (cadastro de pessoas)? Tem ação de mensagem, cupom ou cashback de aniversário? |
| `/crm/clientes` | Em que difere do cadastro de clientes (`/pessoas?tipo=cliente`)? Tem segmentos, etiquetas, estágio de funil, último pedido, total gasto? |
| `/crm/operacao` | É uma fila de contatos ou tarefas do dia? Quem atende? Como se registra o resultado do contato? |
| `/crm/gestao` | Como se cria uma campanha: público, canal, mensagem, agendamento, métricas? |
| `/crm-markup` | O nome não deixa claro se é cálculo de margem (markup de preço) ou um CRM à parte. A rota fora do padrão `/crm/...` sugere uma peça acoplada depois [deduzido]. |

---

## 3. Fluxos de ponta a ponta

### 3.1 Cobrança automática por régua

1. **Uma vez:** configurar o gateway (marcar Ativo, preencher a chave, tirar do
   Sandbox quando for para produção) [visto: campos].
2. **Criar a régua:** nome e "Ativa". Ela nasce com as 3 etapas padrão (−3
   lembrete, 0 aviso, +5 cobrança, todas por e-mail) [visto].
3. **Vendas e OS geram títulos a receber** em parcelas com vencimento [visto no
   arquivo 20].
4. **Execução:** o botão "Executar réguas" (ou uma rotina automática [a
   verificar]) percorre as parcelas em aberto. Para cada etapa cujo dia bate com
   a distância entre hoje e o vencimento, envia a mensagem pelo canal da etapa
   [deduzido].
5. **Registro:** cada envio vira uma linha em "Últimas execuções" (título, ação,
   canal, status, quando) [visto: colunas].
6. **Fim:** parcela paga sai da régua [a verificar].

### 3.2 Link de pagamento avulso

1. Abrir Links de pagamento. Digitar o ID da parcela ou usar a lupa: cliente →
   parcela em aberto (com dias de atraso) → Selecionar [visto].
2. Escolher PIX, Boleto ou Cartão e clicar "Gerar link". [deduzido] O gateway
   ativo cria a cobrança e devolve a URL.
3. O link entra na lista com título, tipo, valor, URL e status [visto: colunas].
4. Envio ao cliente: não há botão de envio na tela [visto, com lista vazia];
   copiar ou mandar por WhatsApp [a verificar].
5. Pagamento confirmado pelo gateway → baixa da parcela [a verificar]. O
   arquivo `93-lacunas-4.md` registra um aviso de "boletos liquidados
   automaticamente", o que indica baixa automática por retorno do banco ou
   gateway [indício].

### 3.3 CRM

Não visto (só os nomes das telas).

## 4. Entidades e relações

| Entidade | Campos vistos | Relações |
| --- | --- | --- |
| Gateway de pagamento | provedor (`asaas`, `efi`, `mercadopago`), ativo, chave de API, sandbox | um por provedor e por empresa [deduzido]; usado para gerar links [deduzido] |
| Régua de cobrança | nome, ativa | 1–N etapas; vale para títulos a receber [deduzido] |
| Etapa da régua | dias relativos ao vencimento (inteiro com sinal), ação (`lembrete`, `aviso`, `cobranca`), canal (`email`) | pertence a 1 régua |
| Execução da régua (histórico) | título, ação, canal, status, quando | liga 1 etapa a 1 título a receber [deduzido] |
| Link de pagamento | título (parcela), tipo (`pix`, `boleto`, `cartao`), valor, URL, status | pertence a 1 título a receber; gerado por 1 gateway [deduzido] |
| Título a receber (parcela) | ID, nº da parcela, vencimento, valor total, histórico, dias de atraso (calculado), situação aberta ou paga | pertence a 1 cliente; nasce de venda ou OS (arquivo 20) |
| Cliente | código, nome, CPF/CNPJ | 1–N títulos a receber |
| CRM (não visto) | — | campanhas, aniversários e "clientes do CRM" sugerem segmentação sobre o cadastro de clientes [a verificar] |

## 5. Integrações

| Integração | O que a tela mostra | Situação |
| --- | --- | --- |
| Asaas, Efí, Mercado Pago | um cartão de configuração cada (ativo, chave, sandbox) | [visto]; funcionamento real não verificado; rótulo "stub" |
| E-mail | único canal das etapas da régua | [visto]; servidor, remetente e modelos de mensagem não aparecem |
| PIX, boleto, cartão | tipos de link | [visto]; emissão pelo gateway [deduzido] |
| WhatsApp, SMS | **não aparecem** na cobrança | [visto: ausentes] |
| Retorno de pagamento (webhook) e baixa automática | nada na tela | [a verificar]; indício no arquivo 93 |
| CRM | — | não visto |

## 6. Observações de UX — oportunidades para nós

- **Régua engessada.** As etapas são fixas e nem aparecem como editáveis. Para
  nós: editor simples de etapas (dia, canal, texto da mensagem), com linha do
  tempo visual e prévia da mensagem.
- **Só e-mail.** O nosso público (pequeno comerciante de alimentação) cobra por
  WhatsApp. Para nós: WhatsApp como canal padrão, e-mail como opção.
- **Disparo sem prévia.** "Executar réguas" fica em destaque no painel e não
  mostra antes quantas mensagens vai mandar nem para quem. Risco de disparo em
  massa por engano. Para nós: rotina automática visível ("próxima execução
  hoje às 9h") e prévia "X mensagens serão enviadas" antes de qualquer envio
  manual.
- **Painel sem números.** Não mostra valor em atraso, valor recuperado, taxa de
  pagamento após a mensagem. Para nós: 3 ou 4 indicadores simples no topo.
- **Link exige um ID técnico.** O campo principal pede o "ID receber"; a busca
  amigável fica escondida atrás de uma lupa. Para nós: gerar o link a partir
  da própria parcela (no contas a receber ou na ficha do cliente), com botões
  "copiar", "mandar no WhatsApp" e QR code PIX.
- **Gateway confuso e inseguro.** Um campo genérico "API Key (stub)", em texto
  visível, sem webhook nem teste. Para nós: assistente por provedor, campos
  mascarados, botão "testar conexão", endereço de webhook mostrado e um
  provedor padrão por tipo de pagamento.
- **Validação com aviso do navegador** (busca com menos de 2 letras). Para nós:
  mensagem dentro do próprio campo.
- **Tela de réguas sem estado vazio útil.** A coluna da direita fica em branco
  quando não há réguas. Para nós: estado vazio que explica o que é uma régua e
  sugere um modelo pronto.
- **CRM partido em 6 telas** (painel, aniversários, clientes, operação,
  campanhas, markup), além de "Clientes" e "Consulta Cliente" no menu. Provável
  sobreposição [a verificar]. Para nós: uma ficha única do cliente, com
  aniversário, histórico de compras e campanhas no mesmo lugar.
- **"CRM Markup" com nome ambíguo** e rota fora do padrão. Para nós: nomes que
  digam o que a tela faz.

## 7. Pendências

1. **6 rotas do CRM não abertas** por recusa do Claude Code: `/crm`,
   `/crm/aniversarios`, `/crm/clientes`, `/crm/operacao`, `/crm/gestao`,
   `/crm-markup`. O lançador `/dashboard/modulo/crm` só foi lido em parte.
2. Cobrança, ainda por confirmar:
   - se há rotina automática das réguas, além do botão manual;
   - status possíveis das execuções e dos links;
   - lista, edição, desativação e exclusão de réguas existentes;
   - modelos (texto) dos e-mails de cada etapa e remetente;
   - qual gateway gera o link quando há mais de um ativo; expiração do link;
   - baixa automática da parcela após o pagamento (webhook);
   - o que "stub" significa na prática (integração real ou não).
3. A busca de clientes com 2 letras não achou ninguém. Não se confirmou se a
   conta de teste tem clientes ou parcelas em aberto (não se insistiu, por
   causa da recusa 1).

## Como continuar (decisão sua)

- O agente **não** muda permissões nem configurações. Só você.
- **Opção A:** rodar este lote fora do modo automático e clicar em "Permitir"
  quando o Claude Code pedir.
- **Opção B:** criar uma regra de permissão para as ferramentas do navegador
  embutido nas configurações do Claude Code (exemplo e cuidados no arquivo
  `97-lacunas-8.md`, seção "O que você precisa fazer").
- Antes de liberar, vale confirmar que os termos de uso da Olímpia permitem
  este levantamento.
- Depois, mandar rodar de novo **só** as 6 rotas do CRM listadas acima.
