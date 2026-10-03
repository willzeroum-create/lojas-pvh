# 16 — Folha de pagamento, portal do colaborador e assinatura eletrônica (ERP Olímpia)

> Cobre o módulo Folha de Pagamento (hub, dashboard, processamento,
> competências, holerites, relatórios, ficha financeira, férias e 13º, rescisão,
> eventos, departamentos/CC, benefícios, configurações), o Portal do
> Colaborador (lançador, PWA e a sua API, comunicados, solicitações RH) e a
> assinatura eletrônica (`/assinatura-admin`). Exploração de 2026-10-03, conta
> de teste "Boi Criolo" (plano Full), sessão já aberta no navegador embutido,
> em aba própria fechada no fim. **A conta não tem colaboradores nem folha
> processada** (0 benefícios, comunicados, solicitações e documentos): as listas
> foram vistas vazias, mas formulários, opções, indicadores e textos de ajuda
> foram lidos. Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo
> manual], [código] (lido no HTML/JS da página), [proposta], [a verificar]
> (hipótese ou conhecimento geral, não visto no ERP). Nada foi gravado no ERP.

## 1. Visão geral

### 1.1 Folha de pagamento

**Onde fica [visto].** Módulo da secção **"Pessoas & RH"** do menu lateral, ao
lado do **Ponto Eletrônico** (do qual depende; ver [15-ponto.md](15-ponto.md))
e do **Portal Colaborador**. O menu lateral do grupo "Folha" tem 12 itens:
Dashboard, Processamento, Competências, Holerites, Relatórios, Ficha
Financeira, Férias e 13º, Rescisão, Eventos da Folha, Departamentos / CC,
Benefícios e Configurações.

**Em resumo [visto, salvo marcação]:**

- **Hub** (`/dashboard/modulo/folha`) com dois grupos de atalhos: **Gestão**
  (Dashboard, Processamento, Competências, Holerites, Relatórios, Ficha
  financeira, Férias e 13º, Rescisão) e **Cadastros** (Eventos da folha,
  Departamentos/CC, Benefícios, Configurações).
- **Colaborador = pessoa.** Todos os seletores de colaborador usam o campo
  `id_pessoa`. O colaborador é uma ficha do cadastro único de Pessoas com o
  papel de colaborador (situação ativo, afastado ou demitido). Não existe tela
  de cadastro de colaborador dentro da Folha: salário, cargo, carga horária,
  tipo de contrato, CTPS, PIS, senha do ponto e limite de convênio ficam na aba
  Colaborador de `/pessoas/create` (ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)).
- **O mês de folha chama-se competência.** Processar uma competência importa
  dados do Ponto (fechamento **aprovado**, banco de horas, faltas, horas
  extras) e de "vales/adiantamentos", e calcula **INSS, IRRF e FGTS**.
- **Saídas:** holerites para ver e imprimir, relatórios (analítico,
  sintético, custos, Excel), arquivo **eSocial S-1200** e remessa bancária
  **CNAB 240** para pagar salários; ficha financeira anual por colaborador.
- **Rotinas especiais em telas próprias:** férias (com 1/3 e abono), 13º
  (adiantamento e parcela final) e rescisão (que pode gerar folha e demitir).
- **Rubricas pré-carregadas:** 202 eventos seguindo a tabela de naturezas de
  rubricas do eSocial, mas com a classificação errada (ver 2.10).
- **Benefícios (VT, VR, VA, outro)** com desconto percentual que entra sozinho
  na folha mensal; **Configurações** com um registro por empresa (sindicato,
  convenção, piso, percentuais de HE e de adicional noturno, dia de pagamento,
  regras ligadas ao ponto, ligação ao financeiro e dados da remessa CNAB 240).
- **Encargos = só FGTS** no painel. [deduzido] Combina com empresas do Simples
  Nacional (anexos I a III), onde a contribuição patronal vai no DAS, não na
  folha — o público dos pequenos comerciantes de alimentação.

**O que o manual afirma [afirmado pelo manual].** Cartão "Folha de Pagamento"
(`mod-folha`, 3 passos, sem "Abrir módulo"): competência e eventos de
proventos e descontos; processar e conferir holerites; gerar pagamentos em
contas a pagar (o subtítulo cita CNAB 240). Caminho no menu: Pessoas & RH ›
Folha (12 itens) — coerente. O CNAB 240 da folha não foi testado. Conteúdo do
manual em [22-manual.md](22-manual.md).

### 1.2 Portal do Colaborador e assinatura eletrônica

- **Lado do colaborador [visto]:** um PWA (app web instalável) com endereço
  próprio por empresa (`/colaborador/v/{slug}/app`). Tem login próprio, com CPF
  ou código e senha. Mostra holerites, espelho de ponto, banco de horas,
  vales/adiantamentos, pedidos ao RH e avisos.
- **Lado do gestor [visto]:** duas telas, uma para publicar comunicados e outra
  para tratar as solicitações enviadas pelo PWA.
- **Assinatura eletrônica [visto]:** cadastro de documentos para assinar, com
  signatário e trilha de auditoria (IP, geolocalização e hash), e estados
  pendente, parcial, concluído e cancelado.
- **Menu lateral "Portal Colaborador" [visto]:** PWA Colaborador, Comunicados,
  Solicitações RH e Documentos Assinatura. A assinatura fica em **Pessoas & RH
  › Portal Colaborador › Assinatura › Documentos Assinatura**, embora o manual
  diga que serve também OS, entregas e contratos.
- **Dois apps para o colaborador [visto]:** o grupo do Ponto tem um item "App
  Colaborador (PWA)" que leva a `/ponto/link` (PWA "Olimpia Ponto", ver 15). O
  Portal do Colaborador é outro PWA, com outro login.
- **O que o manual afirma [afirmado pelo manual]:**
  - Cartão "Portal do Colaborador" (`mod-colaborador`, 3 passos): entrar em
    `/colaborador/app` com CPF e senha do portal; holerites e pedidos de férias
    ou abono. O botão "Abrir módulo" já leva ao endereço com o slug da empresa
    (`/colaborador/v/boi-criolo/app`), enquanto o texto cita a forma genérica —
    sinal de alguma personalização por empresa. Caminho no menu coerente.
  - Cartão "Assinatura Eletrônica" (`mod-assinatura`, 3 passos, sem "Abrir
    módulo"): criar o documento em assinatura-admin; signatários **na ordem**;
    ligada a OS, entregas, RH e contratos (o subtítulo cita IP, geolocalização,
    hash e auditoria).
  - [deduzido] O manual fala em pedido de "abono", mas o PWA não tem esse tipo
    de solicitação (tem férias, folga, atestado, ajuste de ponto e outro).

### 1.3 Ligações com outros módulos

- **Ponto (15):** fechamento aprovado, banco de horas, faltas, atrasos e HE são
  a base do processamento; o dashboard da folha tem atalho para
  `/ponto/fechamento`; os percentuais de HE e adicional noturno e as regras
  "descontar faltas/atrasos" e "integrar banco de horas" estão em
  `/folha/config`, não em `/ponto/config`.
- **Parâmetros da empresa (aba Parâmetros, ver 08):** entre as cerca de 420
  opções **não há grupo de ponto, folha ou RH**. O único ponto de contato é o
  grupo "Comissões por metas" (2 campos): ao fechar uma meta, lançar o prêmio
  na folha como provento e/ou gerar um título a pagar por colaborador. A tela
  `/comissoes/metas` avisa que "Financeiro e Folha" são definidos no cadastro
  da empresa (ver
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).
- **Plano (18):** "Folha de Pagamento", "Portal do Colaborador" e "Assinatura
  Eletrônica" aparecem na lista dos 36 módulos do plano Full ("plataforma
  completa: RH, OS, portais…"); pela ordem da tela, a hipótese é que estejam
  entre os exclusivos do Full.
- **Relatórios da Central (19):** há relatórios de colaboradores fora deste
  módulo — `colaboradores-cadastrados`, `compras-colaboradores` (compras de
  convênio dos funcionários) e `convenio-colaboradores-geral` (ver
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)). A
  lupa "Pesquisar — Colaborador / Vendedor" (tipo `pessoa_colaborador`) dos
  relatórios e da OS lista as pessoas marcadas como colaborador (0 nesta
  conta).
- **OS (14):** o aviso global "cliente assinou eletronicamente a OS" indica que
  a OS usa uma assinatura eletrônica parecida (ver
  [14-os-forca-vendas.md](14-os-forca-vendas.md)).

### 1.4 Elementos globais vistos de passagem

A barra superior, os modais globais de aviso (WhatsApp, loja virtual, cardápio,
OS assinada, Mercado Livre) e o botão "Adicionar aos atalhos" dos lançadores
estão em [22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas); o componente de pesquisa (lupa), em
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md#15-janela-de-pesquisa-lupa-e-a-api-por-trás-dela); a tecnologia (Laravel, Bootstrap 5,
Cloudflare; inclui os nomes de rota `folha.beneficios.index` e
`colaborador.admin.solicitacoes.index` vistos aqui), em
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md#11-o-que-estas-telas-revelam-sobre-a-arquitetura-do-sistema).

### 1.5 Rotas e estado

| Rota | Nome | Estado |
|---|---|---|
| `/dashboard/modulo/folha` | Hub "Folha de Pagamento" | lida |
| `/folha` | Dashboard da folha | lida (zerado em 09 e 10/2026) |
| `/folha/processamento` | Assistente de processamento | lida; a variante com `?mes=9&ano=2026` foi recusada |
| `/folha/competencias` | Competências | lida (vazia) |
| `/folha/holerites` | Holerites | lida (sem competência) |
| `/folha/relatorios` | Relatórios da folha | lida (estado vazio) |
| `/folha/relatorios/ficha-financeira` | Ficha financeira | lida (sem colaborador) |
| `/folha/ferias` | Férias e 13º | lida (vazia) |
| `/folha/rescisao` | Rescisão | lida (vazia) |
| `/folha/eventos` | Eventos da folha (lista) | lida (202 eventos); o filtro por natureza não foi lido (recusado) |
| `/folha/eventos/create` | Novo evento | lida (sem gravar) |
| `/folha/eventos/{id}/edit` | Editar evento | recusada |
| `/folha/rh/organizacao` | Departamentos e centros de custo | lida (vazia) |
| `/folha/beneficios` | Benefícios VT/VR/VA | lida numa passagem posterior (a primeira tentativa foi recusada) |
| `/folha/config` | Configurações da folha | lida numa passagem posterior (antes não tentada) |
| `/dashboard/modulo/colaborador` | Lançador "Portal do Colaborador" | lida |
| `/colaborador/app` → `/colaborador/v/{slug}/app` | PWA "Portal Colaborador" | só login (telas internas lidas no script público da página) |
| `/api/colaborador/v1/v/{slug}` | API do PWA | só conhecida pelo script; nenhum endpoint chamado |
| `/colaborador-admin/comunicados` | Comunicados | lida (vazia) |
| `/colaborador-admin/solicitacoes` | Solicitações RH | lida (vazia) |
| `/assinatura-admin` | Documentos para assinatura | lida (vazia) |

Recusas do filtro do Claude Code: ver [7. Pendências](#7-pendências).

## 2. Telas

### 2.1 `/dashboard/modulo/folha` — hub do módulo [visto]

- Cabeçalho "Folha de Pagamento" com "Voltar ao dashboard".
- Cartões com ícone e rótulo em dois grupos:
  - **Gestão:** Dashboard (`/folha`), Processamento
    (`/folha/processamento`), Competências, Holerites, Relatórios, Ficha
    financeira, Férias e 13º, Rescisão.
  - **Cadastros:** Eventos da folha (`/folha/eventos`), Departamentos/CC
    (`/folha/rh/organizacao`), Benefícios (`/folha/beneficios`),
    Configurações (`/folha/config`).
- Sem indicadores, sem estado da competência atual, sem pendências. É só um
  menu.

### 2.2 `/folha` — dashboard da folha [visto]

- **Objetivo:** visão da competência (mês/ano) selecionada. Por padrão, abre no
  mês atual. O subtítulo mostra "Competência MM/AAAA".
- **Ações no topo:**
  - **Processar folha:** link para `/folha/processamento?mes=10&ano=2026`, já
    com a competência;
  - **Eventos:** link para `/folha/eventos`.
- **Filtro (GET):** Mês (lista 01 a 12), Ano (número) e Filtrar. A URL fica
  `/folha?mes=9&ano=2026`.
- **Indicadores (8):**

| Indicador | Unidade | Origem provável [deduzido] |
| --- | --- | --- |
| Total da folha | R$ | soma dos proventos da competência |
| Total líquido | R$ | proventos − descontos |
| Encargos (FGTS) | R$ | FGTS da competência (só FGTS) |
| Colaboradores ativos | qtd | cadastro de pessoas/colaboradores |
| Processados na competência | qtd | folhas calculadas no mês |
| Horas extras (min) | minutos | fechamento do Ponto |
| Faltas no mês | qtd | fechamento do Ponto |
| Afastados/demitidos | qtd | situação do colaborador (rescisão, afastamento) |

- **Atalhos:** Assistente de processamento, Competências, Holerites,
  Relatórios, Configurações e **Fechamento de ponto** (`/ponto/fechamento`, no
  módulo Ponto).
- **Na conta de teste:** tudo zerado em 10/2026 e 09/2026.

### 2.3 `/folha/processamento` — assistente de processamento [visto]

- **Objetivo:** calcular a folha de uma competência com a importação
  automática de ponto, banco de horas e vales.
- **Painel "Etapas"** (lista fixa e informativa, não é um passo a passo
  navegável):
  1. Selecionar competência
  2. Selecionar colaboradores
  3. Importar ponto (**fechamento aprovado**)
  4. Importar banco de horas
  5. Importar vales/adiantamentos
  6. Calcular folha (INSS, IRRF, FGTS)
  7. Conferência e fechamento
- **Formulário** (POST `/folha/processamento`, com token CSRF):

| Campo | Tipo | Obrigatório | Opções / padrão |
| --- | --- | --- | --- |
| Mês | lista | sim | 01 a 12; padrão: mês atual |
| Ano | número | sim | padrão: ano atual |
| Colaboradores | lista de seleção múltipla + "Marcar todos" | — (implícito: pelo menos um) | só os colaboradores **ativos**. Vazio na conta: "nenhum colaborador ativo nesta empresa" |
| Processar folha | botão (envio) | — | **não clicado** |

- **Regras que a tela deixa ver:**
  - Só importa ponto de período **fechado e aprovado** no módulo Ponto.
  - Dá para processar só parte dos colaboradores (seleção individual).
  - O cálculo é feito num clique. **Não há prévia nem simulação** antes de
    gravar.
  - "Conferência e fechamento" indica que a competência tem estados (por
    exemplo, processada → fechada) [deduzido]. Os estados reais não foram
    vistos (sem dados).
  - Mensal, férias, 13º e rescisão **não se escolhem aqui**. Cada um tem a sua
    tela.
- Aceita `?mes=&ano=` na URL para vir pré-selecionado (é o link do dashboard).
  A pré-seleção não foi conferida: abrir `/folha/processamento?mes=9&ano=2026`
  foi recusado pelo filtro do Claude Code.

### 2.4 `/folha/competencias` — competências [visto]

- **Objetivo:** histórico dos processamentos mensais.
- **Ação:** **Nova competência**, que leva a `/folha/processamento`. Abrir uma
  competência é o mesmo que processá-la; não existe "abrir mês" vazio.
- **Colunas:** Competência, Status, Colaboradores, Proventos, Descontos,
  Líquido, Encargos e uma coluna de ações (sem rótulo).
- **Estado vazio:** nenhuma competência processada.
- **Não visto (sem dados):** valores de status, ações por linha (ver, reabrir,
  fechar, excluir?), detalhe da competência.

### 2.5 `/folha/holerites` — holerites [visto]

- **Objetivo:** ver e imprimir os holerites de uma competência.
- **Filtro (GET):** um campo **Competência** (lista obrigatória que **envia
  sozinha ao mudar**, parâmetro `competencia`). As opções são só as
  competências processadas; na conta, apenas "Selecione...".
- **Não visto:** o holerite em si, impressão em lote, PDF, envio ao colaborador
  e confirmação ou assinatura de recebimento. Nesta tela **não há nenhum botão
  de envio**. O holerite chega ao colaborador pelo PWA do Portal (ver 2.15),
  sem PDF nem aceite.

### 2.6 `/folha/relatorios` — relatórios da folha [visto]

- **Objetivo:** relatórios da competência. O subtítulo promete: **analítico,
  sintético, custos, Excel, eSocial S-1200 e CNAB 240**.
- **Ações no topo:** Ficha financeira anual
  (`/folha/relatorios/ficha-financeira`) e Dashboard (`/folha`).
- **Estado vazio:** sem competência processada, a tela só manda processar a
  folha primeiro. Não há relatório oculto na página.
- **Integrações pressupostas:**
  - **eSocial S-1200:** evento periódico de remuneração do trabalhador.
    [deduzido] Gera um arquivo para enviar; não se viu transmissão direta nem
    certificado digital.
  - **CNAB 240:** layout FEBRABAN de remessa de pagamentos, para crédito de
    salários em conta.
  - **Excel:** exportação.
- O botão "eSocial" da rescisão só leva a esta tela.

### 2.7 `/folha/relatorios/ficha-financeira` — ficha financeira [visto]

- **Objetivo:** histórico anual de proventos, descontos, encargos e líquido de
  um colaborador.
- **Filtro (GET):**

| Campo | Tipo | Obrigatório | Opções / padrão |
| --- | --- | --- | --- |
| Colaborador | lista (`id_pessoa`) | sim | colaboradores; vazio na conta |
| Ano | número | — | padrão: ano atual; mínimo 2000, máximo 2100 |
| Consultar | botão | — | — |

- **Resultado (descrito no estado vazio):** consolidado **mês a mês** de
  proventos, descontos e encargos.
- Link de volta a **Relatórios**.

### 2.8 `/folha/ferias` — férias e 13º [visto]

- **Objetivo:** programar férias (gozo e abono), acompanhar períodos aquisitivos
  e processar o pagamento com 1/3. Também processa o 13º.
- **Atalhos:** Processamento e Holerites.
- **Indicadores:** Colaboradores (ativos), Programadas (aguardando folha), Já
  pagas (processadas), Saldo médio (dias disponíveis).

**Cartão "Programar férias"** (POST `/folha/ferias`)

| Campo | Tipo | Obrigatório | Opções / padrão |
| --- | --- | --- | --- |
| Colaborador | lista (`id_pessoa`) | sim | colaboradores ativos |
| Início | data | sim | — |
| Fim | data | sim | — |
| Dias de abono pecuniário | número | não | padrão 0; mínimo 0; **máximo 10** |
| Pagar 1/3 constitucional | caixa de seleção | não | **marcada por padrão** |
| Salvar programação | botão | — | não clicado |

**Cartão "Processar na folha"**

- **Férias do mês** (POST `/folha/ferias/processar`): Mês (número 1 a 12,
  obrigatório, padrão mês atual), Ano (obrigatório) e o botão Processar.
- **13º salário** (POST `/folha/ferias/processar-13`): Ano (obrigatório),
  Parcela (lista: **Adiantamento** | **Parcela final**; padrão Adiantamento) e o
  botão Processar 13º.

**Listas**

- **Programações:** Colaborador, Período, Dias, Status. Vazia.
- **Períodos aquisitivos:** Colaborador, Aquisitivo, Saldo, Status. Vazia, com a
  dica de que os períodos **surgem só ao programar a primeira férias**.

**Regras percebidas**

- Ciclo da programação: **programada** ("aguardando folha") → **paga**
  ("processada") quando se processam as férias do mês.
- Abono limitado a 10 dias, coerente com 1/3 de 30 dias (CLT art. 143).
- O 1/3 aparece como **opcional**, mas é obrigatório pela Constituição (art. 7º,
  XVII). Uma caixa que o usuário pode desmarcar é risco de erro.
- O período aquisitivo é criado **sob demanda**, não a partir da data de
  admissão. O sistema não avisa de férias a vencer (dobra, CLT art. 137).
- 13º em duas parcelas (Lei 4.749/1965: 1ª até 30/11, 2ª até 20/12). A tela só
  escolhe a parcela e não mostra prazos.
- **Não visto:** aviso de férias (30 dias antes, CLT art. 135), recibo,
  fracionamento em até 3 períodos (CLT art. 134 §1º), pagamento 2 dias antes
  (CLT art. 145), férias coletivas, 13º proporcional de admitidos no ano.
- **Acabamento:** no cartão de 13º, o botão quebra o texto e a lista "Parcela"
  aparece cortada; o botão "Salvar programação" parece ficar parcialmente
  escondido na borda do cartão, numa janela de cerca de 1100 px.

### 2.9 `/folha/rescisao` — rescisão [visto]

- **Objetivo:** calcular as verbas rescisórias, gerar a folha e registrar a
  demissão, mostrando os valores para conferência.
- **Atalhos:** Férias (`/folha/ferias`) e **eSocial** (que só leva a
  `/folha/relatorios`).
- **Indicadores:** Ativos (podem ser desligados), Rescisões (histórico
  recente), Aplicadas (com folha/demissão), Líquido médio (R$ por rescisão).

**Formulário "Calcular demissão"** (POST `/folha/rescisao`)

| Campo | Tipo | Obrigatório | Opções / padrão |
| --- | --- | --- | --- |
| Colaborador | lista (`id_pessoa`) | sim | ativos |
| Data da demissão | data | sim | padrão: hoje |
| Motivo | lista | sim | Sem justa causa (padrão), Justa causa, Pedido, Acordo, Término |
| Aviso prévio indenizado | caixa de seleção | não | desmarcada |
| Gerar folha e aplicar demissão | caixa de seleção | não | **marcada por padrão** |
| Calcular rescisão | botão | — | **não clicado** |

**Lista "Últimas rescisões":** Colaborador, Data, Motivo, Líquido, Status.
Vazia.

**Regras percebidas**

- Dois estados: **calculada** (simulação) e **aplicada** (gerou folha e marcou
  o colaborador como demitido). Uma rescisão aplicada tira o colaborador dos
  ativos e o leva para "Afastados/demitidos" no dashboard.
- Com o padrão marcado, **um clique calcula e já demite**. Não há etapa de
  conferência antes de aplicar.
- Os motivos cobrem os casos principais: acordo (CLT art. 484-A, multa de 20% e
  metade do aviso), término de contrato e pedido de demissão.
- **Não visto:** dias de aviso proporcional (Lei 12.506/2011), aviso trabalhado
  com data de início, saldo do FGTS para a multa de 40%/20%, termo de rescisão
  (TRCT), guias, prazo de 10 dias para pagar (CLT art. 477 §6º) e evento eSocial
  S-2299.

### 2.10 `/folha/eventos` — eventos da folha (rubricas) [visto]

**Lista**

- **Ação:** **Novo evento**, que leva a `/folha/eventos/create`.
- **Filtro (GET):** Natureza (Todas naturezas, Provento, Desconto, Base de
  cálculo, Informativo) e Filtrar. A URL fica `?natureza=`. O resultado do
  filtro não foi lido (recusado).
- **Colunas:** Cód., Nome, Natureza, Cálculo, Ponto, INSS, IRRF, FGTS, Status e a
  ação **Editar**, que leva a `/folha/eventos/{id}/edit` (abertura recusada).
- **Volume:** **202 eventos**, sem paginação e sem busca.
- **Catálogo pré-carregado:** segue a tabela de naturezas de rubricas do eSocial
  (códigos 1000 a 9989). Inclui salário, DSR, horas extras, férias e abonos,
  adicionais (insalubridade, periculosidade, noturno, quebra de caixa),
  gorjetas, comissões, PLR, auxílios, ajuda de custo, diárias,
  alimentação/PAT, transporte, pró-labore, 13º, adiantamentos, verbas de
  rescisão (aviso, multas dos arts. 477, 479 e 480), descontos (INSS, IRRF,
  faltas, atrasos, DSR, pensão alimentícia, vale-transporte, consignado,
  convênios, contribuição sindical), bases de cálculo e informativos. Também
  tem dois eventos próprios: "SALARIO BASE" (cód. 1) e "INSS FOLHA" (cód. 903).
- **Problemas de dados visíveis:**
  - **Todos os 202 estão como "Provento" e "Valor fixo"**, até descontos (IRRF,
    faltas, vale-transporte), bases (base do INSS, FGTS, IRRF) e informativos.
  - Incidências quase todas vazias. Só uns poucos marcam INSS ou FGTS, e
    "Desconto judicial" aparece como provento com INSS e FGTS.
  - **Dois registros com código 0 e nome vazio.**
  - **Acentos corrompidos** nos nomes (maiúsculas mal convertidas) e nomes
    **cortados em 50 caracteres**.
  - Nomes repetidos ("Vestuário e equipamentos" duas vezes; "Assistência
    médica" em dois códigos).
  - Coluna **Ponto vazia em todos**: nenhum evento está ligado a um código do
    ponto. A importação de HE e faltas fica sem rubrica.

#### `/folha/eventos/create` — novo evento (POST `/folha/eventos`) [visto]

| Campo | Tipo | Obrigatório | Opções / padrão |
| --- | --- | --- | --- |
| Código | número | sim | — |
| Nome | texto (até 255) | sim | — |
| Natureza | lista | sim | Provento (padrão), Desconto, Base de cálculo, Informativo |
| Tipo de cálculo | lista | sim | Valor fixo (padrão), Percentual, Fórmula, Importado (ponto/vale), Calculado pelo sistema |
| Percentual | número (4 casas decimais) | não | sempre visível, mesmo com "Valor fixo" |
| Código ponto | texto | não | exemplos no placeholder: HE50, FALTA |
| Descrição | texto (até 500) | não | — |
| Ordem cálculo | número | não | padrão 100 |
| Código eSocial | texto livre | não | sem lista nem validação |
| Incide INSS | caixa de seleção | não | desmarcada |
| Incide IRRF | caixa de seleção | não | desmarcada |
| Incide FGTS | caixa de seleção | não | desmarcada |
| Incide DSR | caixa de seleção | não | desmarcada |
| Salvar / Cancelar | botão / link | — | Salvar não clicado; Cancelar volta à lista |

**Regras percebidas**

- **Ordem de cálculo** define a sequência (proventos → bases → impostos)
  [deduzido].
- **Código ponto** liga a rubrica a uma ocorrência do Ponto (HE50, FALTA) para
  importar automaticamente.
- O tipo **"Fórmula" não tem campo de fórmula** no formulário. Não se sabe onde
  a fórmula é escrita.
- Não há campo de status (Ativo/Inativo) no "Novo", embora a lista tenha coluna
  Status. [deduzido] Deve ser alterado na edição (não vista).
- A incidência DSR existe no formulário, mas não aparece como coluna na lista.

### 2.11 `/folha/rh/organizacao` — departamentos e centros de custo [visto]

- **Objetivo:** estrutura da empresa para ligar colaboradores, fazer rateio e
  agrupar relatórios de folha.
- **Indicadores:** Departamentos, Ativos, Centros de custo, CC ativos.
- **Painel Departamentos:** formulário na própria lista (POST
  `/folha/rh/departamentos`) com **Nome do departamento** (obrigatório,
  placeholder "Ex.: Operações") e o botão Incluir. Lista vazia.
- **Painel Centros de custo:** formulário na própria lista (POST
  `/folha/rh/centros-custo`) com **Código** (obrigatório, placeholder "CC01"),
  **Nome** (obrigatório, placeholder "Administrativo") e o botão Incluir. Lista
  vazia.
- **Regras percebidas:** existe flag ativo/inativo (indicadores separados), sem
  campo no cadastro. Departamento e CC são **listas planas e independentes**:
  sem hierarquia, sem ligação entre si e sem cargos (os cargos são outra tela,
  `/colaborador-cargos`, no 08). A ligação ao colaborador não está nesta tela e
  também não apareceu na aba Colaborador de Pessoas. Editar e excluir não
  aparecem com as listas vazias.

### 2.12 `/folha/beneficios` — benefícios VT / VR / VA [visto]

**Objetivo:** cadastrar tipos de vale e ligá-los aos colaboradores, para o
desconto cair na folha mensal.

**Indicadores no topo (4 cartões):** Benefícios, Ativos, Atribuições e Valor
médio (R$ padrão). Todos a 0.

**Layout:** uma tela só, com quatro cartões: formulário de novo benefício,
formulário de atribuição, tabela "Cadastro" e lista "Atribuições ativas" (com
contador). Não há filtros nem busca. Layout mais novo (cartões com ícones e
KPIs) que o de Configurações.

**Formulário "Novo benefício"** (POST `/folha/beneficios`):

| Campo | Tipo | Obrig. | Opções / padrão |
| --- | --- | --- | --- |
| Tipo (`tipo`) | select | sim | Vale Transporte (VT) `vt` (padrão), Vale Refeição (VR) `vr`, Vale Alimentação (VA) `va`, Outro `outro` |
| Nome (`nome`) | texto | sim | exemplo no placeholder: "VT Urbano" |
| Valor padrão (`valor_padrao`) | número, 2 casas | sim | — |
| % desconto colaborador (`pct_desconto_colaborador`) | número, 2 casas | não | **padrão 6** |

Botão: "Salvar benefício".

**Formulário "Atribuir a colaborador"** (POST `/folha/beneficios/atribuir`):

| Campo | Tipo | Obrig. | Observação |
| --- | --- | --- | --- |
| Colaborador (`id_pessoa`) | select | sim | **vazio** nesta conta: só "Selecione…" |
| Benefício (`id_beneficio`) | select | sim | vazio, porque não há benefícios |
| Valor (opcional) (`valor`) | número, 2 casas | não | se ficar vazio, usa o valor padrão do benefício |

Botão: "Atribuir".

**Tabela "Cadastro":** Nome, Tipo, Valor, % Desc. Quando vazia, convida a
cadastrar o primeiro benefício ao lado.

**Regras e comportamento:**

- **Desconto automático [visto]:** a tela diz que o percentual entra na folha
  mensal. [deduzido] O processamento da folha lê as atribuições ativas.
- **Padrão de 6% [deduzido]:** coincide com o teto legal de desconto do
  vale-transporte (6% do salário-base, Lei 7.418/1985) [a verificar]. A tela
  não diz sobre que base o percentual incide (salário ou valor do benefício),
  nem se há limite ao valor do benefício.
- **Valor por colaborador [visto]:** a atribuição pode ter valor próprio. Senão,
  herda o padrão.
- **Ativo / inativo [deduzido]:** o KPI "Ativos" e o título "Atribuições ativas"
  indicam que benefícios e atribuições podem ser desativados. Os controles não
  apareceram com a lista vazia.
- **Sem cálculo de VT por dias úteis [visto: ausência]:** não há campos de dias,
  viagens ou tarifa. O valor é fixo.

### 2.13 `/folha/config` — configurações da folha [visto]

**Objetivo:** parametrizar a folha de cada empresa. É um formulário único (PUT
`/folha/config`), sem lista. Nenhum campo é obrigatório. Bootstrap simples.

**Bloco geral:**

| Campo | Tipo | Padrão nesta conta |
| --- | --- | --- |
| Sindicato (`sindicato`) | texto | vazio |
| Convenção coletiva (`convencao_coletiva`) | texto | vazio |
| Piso salarial (`piso_salarial`) | número, 2 casas | 0 |
| HE 50% (`he_percentual_50`) | número, 2 casas | 50 |
| HE 100% (`he_percentual_100`) | número, 2 casas | 100 |
| Adicional noturno % (`adicional_noturno_pct`) | número, 2 casas | 20,00 |
| Dia pagamento (`dia_pagamento`) | número de 1 a 28 | 5 |
| Descontar faltas (`descontar_faltas`) | caixa de seleção | marcada |
| Descontar atrasos (`descontar_atrasos`) | caixa de seleção | marcada |
| Integrar banco de horas (`integrar_banco_horas`) | caixa de seleção | marcada |

**Bloco "Integração financeira":**

| Campo | Tipo | Observação |
| --- | --- | --- |
| ID fornecedor salários (`id_fornecedor_salarios`) | número | ID cru do cadastro de pessoas, sem pesquisa |
| Plano contas salários (`id_pcontas_salarios`) | número | ID cru do plano de contas |
| Plano contas encargos (`id_pcontas_encargos`) | número | ID cru do plano de contas |

**Bloco "CNAB 240 — pagamento por colaborador":**

| Campo | Tipo | Observação |
| --- | --- | --- |
| Cód. banco (`cnab_banco`) | texto | preenchido com **341** (Itaú) |
| Nome banco (`cnab_nome_banco`) | texto | — |
| Agência (`cnab_agencia`) + Díg. (`cnab_agencia_digito`) | texto; dígito com 1 caractere | — |
| Conta (`cnab_conta`) + Díg. (`cnab_conta_digito`) | texto; dígito com 1 caractere | — |
| Convênio (`cnab_convenio`) | texto | — |
| CNPJ empresa (remessa) (`cnab_cnpj`) | texto | sem máscara nem validação no cliente |
| Sequencial arquivo (`cnab_sequencial`) | número, mínimo 1 | 1 |

Botão: "Salvar configurações". Os valores de conta, CNPJ e token da página não
foram registrados; do bloco bancário só se anotou se o campo estava preenchido
(exceto o código público do banco).

**Regras e comportamento:**

- **Ligação ao ponto [deduzido]:** as três caixas de seleção dizem que o cálculo
  da folha lê o ponto eletrônico (faltas, atrasos e saldo do banco de horas).
- **Percentuais de HE e adicional noturno por empresa [visto]:** os padrões
  (50%, 100% e 20%) batem com os mínimos legais e o costume [a verificar].
  Servem de base para os eventos de hora extra e adicional noturno. A
  configuração do ponto não tem esses percentuais (ver 15).
- **Dia de pagamento de 1 a 28 [visto]:** o teto 28 garante que o dia existe em
  todos os meses. [deduzido] É um dia do calendário, não o "5º dia útil" da CLT.
- **Integração com o financeiro [deduzido]:** ao fechar a folha, o sistema deve
  lançar contas a pagar para o "fornecedor salários", classificadas nas contas
  de salários e de encargos. O manual afirma que a folha "gera pagamentos em
  contas a pagar" [afirmado pelo manual].
- **CNAB 240 [deduzido]:** a remessa paga cada colaborador por crédito em conta.
  O "Sequencial arquivo" numera as remessas e deve subir a cada arquivo gerado.
  O botão que gera a remessa não está nesta tela (provavelmente em Relatórios,
  que promete "CNAB 240") [a verificar].
- **O que não está aqui [visto: ausência]:** tabelas de INSS, IRRF e
  salário-família, salário mínimo, dados do empregador, dados do
  eSocial/FGTS Digital e sindicalização por colaborador. Não se sabe onde vivem
  [a verificar].

### 2.14 `/dashboard/modulo/colaborador` — lançador do Portal do Colaborador [visto]

- Título "Portal do Colaborador" e link "Voltar ao dashboard".
- **Grupo "Acesso":** PWA Colaborador (`/colaborador/app`), Comunicados
  (`/colaborador-admin/comunicados`) e Solicitações RH
  (`/colaborador-admin/solicitacoes`).
- **Grupo "Assinatura":** Documentos Assinatura (`/assinatura-admin`).
- Cada atalho tem o botão "Adicionar aos atalhos" (não clicado).

### 2.15 `/colaborador/app` → `/colaborador/v/{slug}/app` — PWA do colaborador [visto em parte]

**Endereço [visto]:** redireciona para `/colaborador/v/boi-criolo/app`. Cada
empresa tem um slug no caminho. Título da página: "Portal Colaborador". Só a
tela de login foi vista; as telas internas foram descritas a partir do script
público da página (`/js/colaborador-pwa.js`) e do `manifest.json` [código].
Nenhum endpoint de dados foi chamado e não houve login.

**PWA [código]:**

- `manifest.json` próprio por empresa: nome "Portal Colaborador", nome curto
  "Colaborador", abre em tela cheia (standalone), na vertical, em pt-BR, com
  ícones de 192 e 512 px (incluindo maskable).
- Service worker por empresa (`/colaborador/v/{slug}/sw.js`).
- Cor primária configurável por empresa. Aqui era um azul-escuro.

**Tela de login [visto]:**

| Campo | Tipo | Observação |
| --- | --- | --- |
| Empresa | select | vem da API (`/empresas`); rótulo "código - nome", aqui "001 - BOI CRIOLO" |
| CPF ou ID colaborador | texto | aceita CPF ou o código interno |
| Senha | senha | — |

Botão "Entrar" (não usado).

**Regras do login [código]:**

- Envia `login`, `senha`, `id_empresa`, mais o navegador do aparelho
  (`dispositivo`, até 180 caracteres) e a `plataforma`. Ou seja, o sistema
  guarda de que aparelho o colaborador entrou.
- Recebe um token e os dados do colaborador e guarda os dois no armazenamento
  local do navegador. As chamadas seguintes usam "Bearer token".
- Se a API responder "Sessão" ou "Token", volta à tela de login.
- "Sair" chama o logout na API e limpa o armazenamento local.
- Não há "esqueci a senha" nem primeiro acesso nesta tela. Não se sabe quem cria
  a senha do colaborador [a verificar]. (O PWA do ponto usa outra senha, a
  "senha do ponto" do cadastro da pessoa.)

#### API `/api/colaborador/v1/v/{slug}` [código]

| Método e caminho | Para quê |
| --- | --- |
| GET `/empresas` | lista de empresas para o login |
| POST `/login`, POST `/logout` | sessão |
| GET `/dashboard` | resumo da tela inicial |
| GET `/holerites`, GET `/holerites/{id}` | lista e detalhe de holerites |
| GET `/espelho?mes=&ano=` | espelho de ponto do mês |
| GET `/solicitacoes`, POST `/solicitacoes` | pedidos ao RH |
| GET `/comunicados`, POST `/comunicados/{id}/lido` | avisos e confirmação de leitura |

#### Telas depois do login [código]

**Navegação (barra inferior):** Início, Holerites, Espelho, Solicitações e
Avisos. O cabeçalho mostra o nome do colaborador, o CPF e o botão Sair.

**Início (resumo do mês):**

- Saudação com o primeiro nome e o mês de referência.
- **Ponto:** 4 indicadores (horas trabalhadas, faltas no mês, horas extras e
  banco de horas). As faltas ficam em vermelho e as extras em amarelo quando há.
  Se o ponto não existir, aparece um aviso de indisponibilidade.
- **Holerites:** valor líquido do último holerite, mais até 3 recentes e o botão
  "Ver todos (n)".
- **Vales / adiantamentos:** valor disponível e valor pendente, mais os
  movimentos recentes (descrição, data, valor e selo Pendente ou Baixado).
  [deduzido] Existe um limite de adiantamento por colaborador e um fluxo de
  baixa.
- **Jornada do mês:** previsto, realizado, atraso e faltas, com link "Espelho
  completo".
- **Acesso rápido:** 4 botões com contadores (avisos não lidos, solicitações
  pendentes, holerites disponíveis e espelho do mês). Se houver, aparece também
  uma linha "n documento(s) disponível(is)" (único sinal de assinatura no PWA;
  não há tela para assinar).

**Holerites:**

- Lista com a referência (mês) e o líquido.
- O detalhe mostra uma tabela com as linhas de proventos e depois as de
  descontos (descrição e valor), mais o líquido no fim, e o botão "Voltar".
- Não há cabeçalhos a separar proventos de descontos, nem sinal nos valores.
  Também não há PDF para baixar, nem confirmação de recebimento ou assinatura do
  holerite.

**Espelho de ponto:**

- Seletores de mês (01 a 12) e de ano (o atual e os 2 anteriores), mais o botão
  "Consultar". Ao abrir, consulta logo o mês atual.
- O resumo mostra a referência, as horas realizadas, as horas extras (só horas
  inteiras), as faltas e o saldo do banco de horas.
- Por dia: data, selo "Falta" (vermelho) ou o dia da semana, e entrada → saída.
  Só há um par entrada/saída por dia; o intervalo não aparece.

**Solicitações:**

- Botão "Nova solicitação" e a lista dos pedidos (tipo, selo de status, período
  e motivo). Os selos: pendente em amarelo, aprovado em verde e o resto em
  vermelho.
- O tipo e o status aparecem com o código cru (por exemplo `ajuste_ponto`).

**Modal "Nova solicitação":**

| Campo | Tipo | Obrig. (no cliente) | Opções |
| --- | --- | --- | --- |
| Tipo (`tipo`) | select | — | Férias `ferias`, Folga `folga`, Atestado `atestado`, Ajuste de ponto `ajuste_ponto`, Outro `outro` |
| Data início (`data_inicio`) | data | não | — |
| Data fim (`data_fim`) | data | não | — |
| Motivo (`motivo`) | texto longo | não | — |

Botão "Enviar". Depois de enviar, aparece um aviso e a lista recarrega. **Não
há anexo**: um atestado não leva o arquivo do atestado. Também não há validação
de datas no cliente.

**Avisos (comunicados):**

- Lista com título, selo "Novo" se ainda não foi lido, data de publicação,
  prioridade e conteúdo completo.
- Tocar num aviso não lido registra a leitura (uma vez só) e tira o selo.
- O conteúdo do comunicado é inserido no app como HTML, sem tratamento.

### 2.16 `/colaborador-admin/comunicados` — comunicados [visto]

**Objetivo:** publicar avisos que aparecem no PWA.

**Topo:** título e botão "Abrir PWA" (abre o PWA da empresa noutra aba).

**Formulário "Novo comunicado"** (POST `/colaborador-admin/comunicados`):

| Campo | Tipo | Obrig. | Opções / padrão |
| --- | --- | --- | --- |
| Título (`titulo`) | texto, até 300 caracteres | sim | — |
| Prioridade (`prioridade`) | select | não | Baixa, Normal (padrão), Alta, Urgente |
| Conteúdo (`conteudo`) | texto longo | sim | texto simples, sem editor |
| Publicar imediatamente (`publicar`) | caixa de seleção | não | marcada por padrão |

Botão: "Publicar" (não clicado).

**Lista:** Título, Prioridade, Publicado em. Vazia: "Nenhum comunicado
publicado."

**Regras e comportamento:**

- **Público [visto: ausência]:** não se escolhe para quem vai (setor, cargo ou
  pessoa). [deduzido] O aviso vai para todos os colaboradores da empresa.
- **Rascunho [deduzido]:** sem "Publicar imediatamente", o aviso fica gravado
  sem publicação. Não há data de agendamento.
- **Leitura [código, no PWA]:** o sistema guarda quem leu, mas a lista do gestor
  não mostra contagem nem lista de leituras (pelo menos nas colunas vazias).
- **Sem canal externo [visto: ausência]:** não há opção de enviar também por
  push, e-mail ou WhatsApp.
- Edição, desativação e exclusão não apareceram (lista vazia).

### 2.17 `/colaborador-admin/solicitacoes` — solicitações RH [visto]

**Objetivo:** tratar os pedidos que os colaboradores enviam pelo PWA. O gestor
não cria pedidos aqui.

- **Topo:** título e botão "Abrir PWA".
- **Filtro:** Status (Todos, Pendente, Aprovado, Rejeitado). Ao mudar o valor, a
  página recarrega sozinha (GET `?status=`).
- **Tabela:** Colaborador, Tipo, Período, Status, Motivo e uma última coluna sem
  título, que [deduzido] deve ter os botões de aprovar e rejeitar (vazia, não
  vista).
- **Estados [visto]:** pendente → aprovado | rejeitado.
- **Não se sabe [a verificar]:**
  - se aprovar férias ou um ajuste de ponto mexe sozinho no ponto (ver as
    Justificativas do 15, canal parecido) ou nas férias;
  - se há campo para o motivo da rejeição;
  - se o colaborador é avisado (ele só vê o selo no PWA).

### 2.18 `/assinatura-admin` — assinatura eletrônica [visto]

**Objetivo:** criar documentos para assinatura eletrônica e acompanhar o
estado. Segundo o subtítulo, cada assinatura guarda IP, geolocalização e hash.

- **Filtro:** Status (Todos, Pendente, Parcialmente assinado `parcial`,
  Concluído `concluido`, Cancelado `cancelado`), com recarga automática.
- **Tabela:** Documento, Status, Signatários e uma coluna de ações sem título.
  Vazia: "Nenhum documento cadastrado."

**Formulário "Novo documento"** (POST `/assinatura-admin`):

| Campo | Tipo | Obrig. | Observação |
| --- | --- | --- | --- |
| Título (`titulo`) | texto, até 300 | sim | — |
| Tipo (`tipo`) | texto livre, até 60 | sim | o placeholder sugere contrato, termo ou holerite |
| Descrição (`descricao`) | texto longo | não | — |
| Signatário (`signatario_nome`) | texto, até 200 | sim | — |
| E-mail (`signatario_email`) | e-mail, até 200 | não | — |
| CPF (`signatario_cpf`) | texto, até 20 | não | sem máscara |
| ID pessoa (opcional) (`signatario_id_pessoa`) | número, mínimo 0 | não | ID cru do cadastro de pessoas |

Botão: "Criar documento" (não clicado).

**Regras e comportamento:**

- **Sem arquivo [visto]:** o formulário não tem campo de upload (é um
  formulário simples, não multipart). O PDF deve ser anexado depois, no detalhe
  do documento, ou então o documento é só texto [a verificar].
- **Um signatário na criação [visto]:** o estado "Parcialmente assinado" mostra
  que um documento pode ter vários signatários. [deduzido] Os outros devem ser
  acrescentados no detalhe. O manual afirma que os signatários seguem uma
  **ordem** [afirmado pelo manual].
- **Estados [visto]:** pendente → parcial → concluído; e cancelado.
- **Entrega ao signatário [a verificar]:** o e-mail sugere envio de link por
  e-mail. O PWA do colaborador só mostra um contador de "documentos
  disponíveis" e não tem tela para assinar.
- **Uso fora do RH [afirmado pelo manual]:** ligada a OS, entregas, RH e
  contratos. [deduzido] O aviso global "o cliente assinou eletronicamente a OS",
  com link para o comprovante, mostra que a OS já usa um motor semelhante (ver
  14).
- Não confundir com a "assinatura" (mensalidade) do próprio ERP, que fica no 18.

## 3. Fluxos de ponta a ponta

1. **Preparação (uma vez).**
   - Configurações da folha: dia de pagamento, regras do ponto, ligação ao
     financeiro e banco da remessa.
   - Cadastrar departamentos e centros de custo.
   - Cadastrar colaboradores em Pessoas (salário, cargo, carga horária, código e
     senha de ponto; ver 08). Onde se ligam departamento, CC e foto de
     referência não foi visto.
   - Revisar as rubricas (natureza, incidências, código do ponto, ordem).
   - Cadastrar benefícios e atribuí-los.
2. **Dia a dia (Ponto, ver 15).** Batidas no relógio tablet ou no PWA → espelho
   do Ponto → no fim do mês, **fechamento de ponto aprovado**.
3. **Folha mensal.** Dashboard (competência) → **Processar folha** → escolher
   mês/ano e colaboradores → importar ponto aprovado, banco de horas e
   vales/adiantamentos → calcular INSS, IRRF e FGTS → a competência aparece em
   **Competências** com totais → conferência e fechamento → **Holerites** (ver
   e imprimir) → **Relatórios** (analítico, sintético, custos, Excel) →
   **eSocial S-1200** → **CNAB 240** para o banco pagar → **Ficha financeira**
   anual por colaborador.
   - [visto: aviso da tela; mecânica a verificar] O desconto do benefício ativo
     entra na folha; HE, adicional noturno, faltas, atrasos e banco de horas vêm
     do ponto conforme `/folha/config`.
   - [deduzido; afirmado pelo manual] O financeiro recebe contas a pagar
     (fornecedor de salários, contas de salários e encargos) e a remessa CNAB 240
     paga cada conta.
   - O holerite fica disponível no PWA do colaborador, com proventos, descontos
     e líquido.
   - [afirmado pelo manual] Fluxo "ponto e folha": batida no PWA → gestor aprova
     justificativas → fechamento mensal → exportação de eventos para a folha →
     competência e eventos → processamento e holerites → pagamentos em contas a
     pagar (CNAB 240) → o colaborador vê os holerites e pede férias ou abono no
     portal.
4. **Férias.** Programar (colaborador, início, fim, abono, 1/3) → o período
   aquisitivo é criado e abatido → "Férias do mês: Processar" põe as verbas na
   folha → a programação passa a "paga".
5. **13º salário.** Escolher o ano e a parcela (adiantamento até novembro, final
   em dezembro) → Processar 13º.
6. **Rescisão.** Escolher colaborador, data, motivo e aviso indenizado →
   calcular (simulação) **ou** calcular + gerar folha + aplicar demissão (o
   padrão) → o colaborador sai dos ativos → aparece em "Últimas rescisões" e em
   "Afastados/demitidos" → eSocial (via Relatórios).
7. **Comunicado.** O gestor escreve (título, prioridade e conteúdo) e publica,
   ou guarda sem publicar → o colaborador vê o aviso no PWA, com selo "Novo" e
   contador na tela inicial → ao tocar no aviso, a leitura fica registrada.
8. **Solicitação ao RH.** O colaborador entra no PWA (empresa, CPF ou código e
   senha) → "Nova solicitação": tipo (férias, folga, atestado, ajuste de ponto
   ou outro), datas e motivo → o pedido aparece como pendente em
   `/colaborador-admin/solicitacoes` → o gestor aprova ou rejeita → o
   colaborador vê o novo estado no PWA. O efeito noutros módulos (ponto, férias)
   fica por confirmar.
9. **Assinatura eletrônica.** O gestor cria o documento (título, tipo, descrição
   e primeiro signatário) → [a verificar] no detalhe, anexa o arquivo e mais
   signatários (em ordem, segundo o manual) → o signatário recebe um link
   (provavelmente por e-mail) e assina; ficam guardados IP, geolocalização e hash
   → o estado passa de pendente a parcial e depois a concluído; o documento pode
   ser cancelado → [afirmado pelo manual] trilha de auditoria; o documento fica
   ligado a uma OS, entrega, documento de RH ou contrato.

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
| --- | --- | --- |
| Empresa (tenant) | nome, código ("001"), slug (no endereço dos PWAs) | tem colaboradores, competências, eventos, departamentos, CCs, benefícios, configuração da folha, comunicados, documentos |
| Colaborador (Pessoa com papel colaborador; tela no 08) | `id_pessoa`, nome, CPF, código e senha de ponto, salário, cargo, carga horária, situação (ativo, afastado, demitido), departamento e CC [deduzido] | pertence à empresa; tem batidas (15), folhas, férias, períodos aquisitivos, rescisões, atribuições de benefício, solicitações, leituras de comunicado |
| Fechamento de ponto (15) | competência, estado (aprovado) | fonte de HE, faltas e horas para a folha |
| Banco de horas (15) | colaborador, saldo | importado no processamento |
| Vale / adiantamento | descrição, data, valor, status (pendente, baixado); disponível; total pendente | ligado ao colaborador; descontado no processamento; origem não identificada (financeiro? portal?) |
| Competência | mês, ano, status, nº colaboradores, proventos, descontos, líquido, encargos | tem muitas folhas de colaborador |
| Folha do colaborador / holerite | competência (referência), colaborador, itens (evento, referência, valor), proventos[] e descontos[] (descrição, valor), líquido, totais | itens apontam para eventos; visto pelo colaborador no PWA |
| Evento (rubrica) | código, nome, natureza, tipo de cálculo, percentual, código ponto, descrição, ordem, código eSocial, incide INSS/IRRF/FGTS/DSR, status | usado nos itens da folha; ligado a ocorrências do Ponto pelo código |
| Programação de férias | colaborador, início, fim, dias, dias de abono, pagar 1/3, status (programada, paga) | consome saldo de um período aquisitivo; gera itens na folha |
| Período aquisitivo | colaborador, início–fim, saldo de dias, status | criado na primeira programação |
| Processamento de 13º | ano, parcela (adiantamento, final) | gera itens na folha de cada colaborador |
| Rescisão | colaborador, data, motivo, aviso indenizado, gerar folha, líquido, status (calculada, aplicada) | muda a situação do colaborador; gera folha |
| Departamento | nome, ativo | agrupa colaboradores [deduzido] |
| Centro de custo | código, nome, ativo | rateio e relatórios de custo |
| Benefício | tipo (vt, vr, va, outro), nome, valor_padrao, pct_desconto_colaborador, ativo [deduzido] | pertence à empresa; tem várias atribuições |
| Atribuição de benefício | id_pessoa, id_beneficio, valor (opcional), ativa [deduzido] | liga Pessoa (colaborador) a Benefício; lida pelo processamento da folha |
| Configuração da folha | sindicato, convencao_coletiva, piso_salarial, he_percentual_50, he_percentual_100, adicional_noturno_pct, dia_pagamento, descontar_faltas, descontar_atrasos, integrar_banco_horas, id_fornecedor_salarios, id_pcontas_salarios, id_pcontas_encargos, cnab_banco, cnab_nome_banco, cnab_agencia(+dígito), cnab_conta(+dígito), cnab_convenio, cnab_cnpj, cnab_sequencial | uma por empresa; aponta para Pessoa (fornecedor) e Plano de contas; usa o Ponto |
| Acesso do colaborador (sessão do PWA) | login (CPF ou ID), senha, id_empresa, dispositivo, plataforma, token | pertence a Pessoa (colaborador) e Empresa |
| Espelho de ponto (consulta do PWA) | referencia, dias[] (data, dia_semana, entrada, saida, falta), totais (realizado_min, extras_min, faltas), banco_horas.saldo | vem do módulo Ponto |
| Comunicado | titulo, prioridade (baixa, normal, alta, urgente), conteudo, publicado, publicado_em | pertence à empresa; tem leituras |
| Leitura de comunicado | id_comunicado, colaborador, lido | liga Comunicado a colaborador |
| Solicitação | tipo (ferias, folga, atestado, ajuste_ponto, outro), data_inicio, data_fim, motivo, status (pendente, aprovado, rejeitado) | criada pelo colaborador; tratada pelo gestor |
| Documento de assinatura | titulo, tipo (texto livre), descricao, status (pendente, parcial, concluido, cancelado) | tem um ou mais signatários; ligado a OS, entrega, RH ou contrato [afirmado pelo manual] |
| Signatário | nome, email, cpf, id_pessoa (opcional), ordem [afirmado pelo manual]; evidências: IP, geolocalização, hash [visto no subtítulo] | pertence a Documento; pode apontar para Pessoa |
| Meta de comissão (18) | prêmios de ranking | [a verificar] pode lançar o prêmio na folha como provento (parâmetro "Comissões por metas") |

## 5. Integrações

| Integração | Onde aparece | Estado |
| --- | --- | --- |
| **Módulo Ponto (interno)** | processamento (fechamento aprovado, banco de horas), `/folha/config` (faltas, atrasos, banco), dashboard (HE, faltas), eventos (código ponto), PWA (espelho, banco de horas, jornada) | [visto]; passagem de dados não testada |
| **eSocial** | S-1200 nos relatórios; campo "código eSocial" nas rubricas; botão "eSocial" na rescisão | [visto]; envio direto não observado — [deduzido] geração de arquivo |
| **Bancos: CNAB 240 de pagamento de salários** | Relatórios (prometido); Configurações da folha (banco, agência, conta, convênio, CNPJ, sequencial; banco 341) | campos vistos; a geração do arquivo não foi vista |
| **Financeiro interno** | Configurações da folha (fornecedor de salários, plano de contas de salários e encargos); manual: "gerar pagamentos em contas a pagar" | campos vistos; lançamento a verificar |
| **Excel** | exportação de relatórios | prometido no subtítulo |
| **PWA** (service worker, manifest, token Bearer, cor por empresa) | Portal do Colaborador | [código] |
| **E-mail ao signatário** | Assinatura eletrônica (campo e-mail) | a verificar |
| **Geolocalização do navegador, IP e hash do documento** | Assinatura eletrônica (subtítulo e manual) | anunciado; não visto em ação |
| **Assinatura eletrônica da OS** | aviso global "cliente assinou a OS" com comprovante | visto só o aviso |
| **Notificações globais** (Agente de Vendas IA no WhatsApp, loja virtual, cardápio, Mercado Livre) | modais presentes em todas as páginas | vistos só os modais |
| **Não aparecem** | FGTS Digital, DCTFWeb, exportação para o contador, holerite por WhatsApp ou e-mail, push, e-mail ou WhatsApp para o colaborador, assinatura do holerite | — |

## 6. Oportunidades de UX

### Folha

1. **Assistente que não assiste.** As 7 etapas são só texto. O processamento é
   um único botão sem prévia.
   [proposta] Um passo a passo de verdade, com **simulação**, diferenças por
   colaborador, alertas (ponto não aprovado, colaborador sem salário) e só então
   "fechar competência", com a opção de reabrir com motivo.
2. **Rescisão em um clique.** "Gerar folha e aplicar demissão" vem marcado.
   [proposta] Separar **Simular** de **Efetivar**, mostrar o memorial de cálculo
   (aviso proporcional, 13º e férias proporcionais, multa do FGTS) e pedir
   confirmação explícita.
3. **1/3 de férias opcional** confunde e permite erro legal.
   [proposta] 1/3 sempre aplicado. Aviso de férias e recibo gerados juntos.
4. **Períodos aquisitivos sob demanda.**
   [proposta] Calcular a partir da admissão, com alertas de férias a vencer ou
   em dobro.
5. **202 rubricas mal classificadas, sem busca.**
   [proposta] Um conjunto pequeno e correto para comércio de alimentação (cerca
   de 25 a 30 rubricas: salário, HE 50%/100%, adicional noturno, DSR, faltas,
   atrasos, VT, adiantamento, INSS, IRRF, FGTS, 13º, férias, 1/3, rescisórias),
   com o catálogo eSocial completo como opção, busca, agrupamento por natureza e
   validação do código eSocial.
6. **"Fórmula" sem campo de fórmula** e "Percentual" sempre visível.
   [proposta] Campos que aparecem conforme o tipo de cálculo e um editor simples
   com variáveis nomeadas (salário, horas, base).
7. **Indicadores crus:** "Horas extras (min)" em minutos.
   [proposta] Mostrar em hh:mm e em R$. O painel deve dizer o estado da
   competência ("ponto aprovado? folha calculada? paga?") como lista de
   pendências do mês.
8. **Holerites sem entrega.** Só ver e imprimir.
   [proposta] Holerite digital no portal do colaborador e pelo **WhatsApp**
   (canal que o nosso público já usa), com confirmação de leitura.
9. **Telas soltas:** férias, 13º e rescisão têm cada uma o seu "Processar", fora
   da competência.
   [proposta] Tudo como "tipos de cálculo" dentro da competência, com um
   histórico só.
10. **Acabamento** do cartão de 13º e de "Salvar programação" (ver 2.8).
11. **Organização rasa:** departamentos e CCs sem hierarquia, sem cargos e sem
    edição visível.
    [proposta] Departamento → cargo → colaborador, com CC opcional e rateio
    percentual.
12. **Encargos só FGTS:** serve ao Simples Nacional, mas não ao Lucro
    Presumido/Real nem ao Anexo IV.
    [proposta] O regime tributário da empresa define os encargos mostrados.
13. **IDs crus onde devia haver pesquisa.** "ID fornecedor salários", os dois
    "Plano contas" e o "ID pessoa" da assinatura pedem o número interno do
    registro.
    [proposta] Campo de pesquisa com nome e código, igual ao do "Responsável
    interno".
14. **Tabelas legais escondidas ou ausentes.** INSS, IRRF e salário-família não
    estão nas configurações.
    [proposta] Uma tela única de "tabelas legais vigentes", com data de vigência
    e atualização centralizada pela plataforma.
15. **"% desconto" sem base.** Não se diz se incide sobre o salário ou sobre o
    valor do vale, nem se há teto.
    [proposta] Explicar a regra na própria tela (ex.: VT = até 6% do
    salário-base, limitado ao custo do vale) e calcular o VT por dias úteis ×
    viagens × tarifa.
16. **Seletor de colaborador vazio, sem explicação** (atribuição de benefícios).
    [proposta] Estado vazio que diga o que falta (ex.: "cadastre colaboradores
    com salário") com link direto.
17. **Dia de pagamento como dia fixo.** A lei fala em 5º dia útil.
    [proposta] Opção "N-ésimo dia útil", com feriados.
18. **Visual inconsistente.** Benefícios tem layout novo (cartões com ícones e
    KPIs); Configurações é Bootstrap simples. Sinal de módulo montado em fases.

### Portal do colaborador

19. **Holerite pobre.** Proventos e descontos na mesma tabela, sem separação nem
    sinal. Não há PDF nem "li e concordo".
    [proposta] Holerite com blocos, bases (INSS, FGTS, IRRF), PDF e aceite com
    data e hora (substitui a assinatura em papel).
20. **Pedido sem anexo.** Um atestado sem foto do atestado obriga a outro canal.
    [proposta] Anexo por foto, validação de datas e campos condicionais por tipo
    (ex.: o ajuste de ponto pede a batida certa).
21. **Códigos crus no app.** O colaborador vê `ajuste_ponto`, `pendente` etc.
    [proposta] Rótulos sempre traduzidos.
22. **Comunicados sem público nem relatório de leitura.** Não dá para mandar só a
    um setor, agendar, anexar ou ver quem leu (embora o sistema registre a
    leitura).
    [proposta] Público por setor, cargo ou pessoa; agendamento; contagem "lido
    por X de Y"; push no PWA e WhatsApp opcional.
23. **Conteúdo do comunicado tratado como HTML** sem tratamento no PWA.
    [proposta] Guardar o conteúdo como texto ou Markdown seguro.
24. **Dois PWAs para o mesmo colaborador** (o do Ponto e o deste Portal), com
    logins diferentes (código + senha de ponto; CPF ou ID + senha do portal).
    [proposta] Um app só, com bater ponto, holerite, pedidos e avisos.
25. **Login sem recuperação.** Não há "esqueci a senha" nem primeiro acesso.
    [proposta] Primeiro acesso por link ou código enviado pelo gestor (WhatsApp
    ou e-mail) e recuperação simples.

### Assinatura eletrônica

26. **Documento sem arquivo na criação, tipo em texto livre e um só
    signatário**, escondida dentro do Portal do Colaborador embora sirva OS,
    entregas e contratos.
    [proposta]
    - criar o documento já com PDF e vários signatários (com ordem);
    - tipo numa lista;
    - envio do link por WhatsApp ou e-mail;
    - lembrete automático;
    - certificado final com as evidências (IP, data e hora, geolocalização,
      hash);
    - menu próprio ou transversal, não dentro do RH.

## 7. Pendências

**Recusas e limites desta exploração.** Todas as rotas abriram com a sessão já
ativa (não foi problema de credencial). O filtro de segurança automático do
Claude Code (classificador do modo automático, motivo "Third-Party Attack")
recusou: a leitura da lista de eventos filtrada por natureza; a abertura de um
evento existente em edição (`/folha/eventos/{id}/edit`); a abertura de
`/folha/processamento?mes=9&ano=2026`; e, numa primeira passagem,
`/folha/beneficios` (depois lida noutra passagem, junto com `/folha/config`).
Numa tentativa ainda anterior do mesmo dia, o filtro tinha recusado abrir
`/dashboard/modulo/folha` e nenhuma rota do grupo foi aberta; isso ficou
superado pelas passagens seguintes. As recusas foram respeitadas, sem outro
caminho. Completar o que falta depende de o dono da conta autorizar a leitura.
Nada foi gravado no ERP.

**Ações vistas e NÃO clicadas (gravam algo):** Processar folha; Salvar
programação; Processar (férias do mês); Processar 13º; Calcular rescisão;
Salvar (evento); Incluir (departamento, CC); Salvar benefício; Atribuir; Salvar
configurações; Entrar (PWA); Publicar (comunicado); Criar documento;
"Adicionar aos atalhos".

**O que ficou por ver:**

1. **Sem dados na conta de teste:** holerite real, ficha financeira preenchida,
   estados e ações das competências, relatórios (analítico, sintético, custos,
   Excel, S-1200, CNAB 240), listas de programações, períodos aquisitivos e
   rescisões com registros; coluna de ações e botões de aprovar ou rejeitar em
   Solicitações; edição, desativação e exclusão em Benefícios e Comunicados;
   detalhe do documento de assinatura, anexo, vários signatários e página
   pública de assinatura.
2. **PWA do colaborador visto sem login:** as telas internas foram descritas a
   partir do script público. Falta vê-las com dados reais (holerite, espelho,
   vales).
3. **Seletor "Colaborador" vazio em Benefícios:** não confirmado se faltam
   colaboradores cadastrados (a conta tem 0) ou se há um filtro (ex.: só quem
   tem salário ou contrato na folha).
4. **Regras de cálculo por confirmar:** base do % de desconto dos benefícios;
   onde ficam as tabelas de INSS, IRRF, FGTS, salário-família e salário mínimo e
   os dados do empregador; como e onde se gera a remessa CNAB 240; como a folha
   lança os títulos no financeiro; como a folha usa os eventos de "Código ponto"
   se nenhum está preenchido; onde se escreve a fórmula do tipo "Fórmula".
5. **eSocial:** se há transmissão direta (certificado A1) ou só geração de
   arquivo; FGTS Digital e DCTFWeb.
6. **Vales/adiantamentos:** origem dos valores importados (Financeiro? portal do
   colaborador?) e onde se define o limite disponível.
7. **Colaborador:** onde se ligam departamento, CC e foto de referência; como se
   cria ou recupera a senha do PWA do Portal (diferente da senha do ponto).
8. **Solicitações:** se aprovar férias ou ajuste de ponto mexe noutros módulos;
   motivo da rejeição; aviso ao colaborador.
9. **Assinatura:** como o signatário assina (link por e-mail? tela no PWA?);
   se é serviço próprio ou de terceiros; se a ordem dos signatários é imposta.
10. **Comissões por metas:** se o prêmio entra mesmo na folha como provento e
    com que rubrica (ver 18).

## 8. Sub-rotas descobertas

| Rota | Origem | Situação |
|---|---|---|
| `/folha?mes=&ano=` | filtro do dashboard | lida (09 e 10/2026) |
| `/folha/processamento?mes=&ano=` | botão "Processar folha" | recusada |
| `/folha/holerites?competencia=` | filtro | sem opções |
| `/folha/eventos?natureza=` | filtro | recusada |
| `/folha/eventos/create`, `/folha/eventos/{id}/edit` | Novo evento, Editar | create lida; edit recusada |
| POST `/folha/ferias`, `/folha/ferias/processar`, `/folha/ferias/processar-13` | formulários de férias e 13º | não acionados |
| POST `/folha/rescisao` | Calcular demissão | não acionado |
| POST `/folha/rh/departamentos`, `/folha/rh/centros-custo` | formulários de organização | não acionados |
| POST `/folha/beneficios`, `/folha/beneficios/atribuir` | formulários de benefícios | não acionados |
| PUT `/folha/config` | Salvar configurações | não acionado |
| `/colaborador/v/{slug}/app`, `/colaborador/v/{slug}/sw.js`, `manifest.json`, `/js/colaborador-pwa.js` | redirecionamento de `/colaborador/app` | lidos (sem login) |
| `/api/colaborador/v1/v/{slug}/...` | script do PWA | não chamados |
| `/colaborador-admin/solicitacoes?status=` | filtro | lida (vazia) |
| POST `/colaborador-admin/comunicados`, POST `/assinatura-admin` | formulários | não acionados |
