# 912 — Lacunas, lote 13: Grupo tributário e Ponto eletrônico (ERP Olímpia)

> **Estado: explorado (as 12 rotas do lote abriram).** Data: 2026-10-03.
> Conta de teste "Boi Criolo" (plano Full), sessão já aberta no navegador
> embutido, numa aba própria (fechada no fim).
>
> - **Observado** = visto na tela ou na estrutura da página já carregada.
> - **Inferido / a verificar** = dedução ou conhecimento geral do domínio (CLT,
>   Portaria MTP 671/2021, legislação fiscal). **Não** foi visto no ERP.
> - **Nada foi gravado.** Não cliquei em gravar, gerar, processar, cadastrar,
>   aprovar nem enviar. Em dois formulários "Novo" preenchi campos só na tela,
>   para ver o comportamento, e saí sem salvar: o modelo rápido da carga horária
>   e o tipo "Colaborador" no cadastro de pessoa.
> - **Uma leitura foi recusada** pelo filtro de segurança automático do Claude
>   Code: os valores de um grupo tributário já existente, na tela de edição. Não
>   insisti. Detalhes em [7. Pendências](#7-pendências).
> - **A conta não tem dados de ponto.** Não há colaboradores, batidas,
>   justificativas, feriados nem locais, por isso as telas do ponto foram vistas
>   vazias. Várias regras de cálculo ficam como "a verificar".

---

## 1. Visão geral

Este lote junta duas áreas que não têm relação entre si.

### 1.1 Grupo tributário (módulo Fiscal → Tabelas Fiscais)

O grupo tributário é a **matriz de regras fiscais**. Para cada tipo de movimento
(entrada ou saída), operação (venda, venda PDV, devolução, remessa…) e documento
(NF-e, NFC-e, MDF-e, CT-e, NFS-e), ele diz qual CFOP, CST/CSOSN e alíquotas usar.
Essas regras mudam conforme o destino (estadual, interestadual ou internacional)
e o regime da empresa (Simples ou Normal). A tela também já traz os campos da
**Reforma Tributária** (IBS, CBS e Imposto Seletivo).

O produto liga-se a **vários** grupos, num painel do cadastro de produto. Na
emissão, o documento e a operação escolhidos decidem qual desses grupos vale
(ver `13-fiscal.md`).

### 1.2 Ponto eletrônico (menu "Pessoas & RH" → "Ponto")

É um ponto por programa: o próprio painel se apresenta como "REP-P / Portaria
671". Os blocos são:

- **Três canais de batida:**
  - **App Colaborador (PWA)**, no navegador do celular, com localização;
  - **Relógio de ponto (tablet)**, terminal compartilhado com código, senha e
    foto;
  - **app Android "Olimpia"**, configurado ao ler um QR code.
- **Cerca virtual (geofence):** locais com latitude, longitude e raio. O modo é
  desligado, só aviso ou bloqueio do registro.
- **Foto e validação facial** de cada batida, numa tela de auditoria.
- **Jornada:** a "Carga horária" é uma grade semanal ligada ao cadastro do
  colaborador em Pessoas.
- **Feriados:** cadastro manual e geração automática dos nacionais.
- **Justificativas:** o colaborador envia pelo app e o gestor aprova ou rejeita.
- **Fechamento mensal:** consolida HE 50%/100%, noturno, DSR, faltas, atrasos e
  banco de horas, "para exportar à folha".

Mapa do módulo (menu lateral e lançador `/dashboard/modulo/ponto`, observado):

| Bloco | Item | Rota |
|---|---|---|
| Gestão | Dashboard | `/ponto/dashboard` (também `/ponto`) |
| Gestão | Espelho de Ponto | `/ponto/espelho` |
| Gestão | Mapa de Batidas | `/ponto/mapa` |
| Gestão | Auditoria de Fotos | `/ponto/auditoria` |
| Gestão | Fechamento Mensal | `/ponto/fechamento` |
| Gestão | Justificativas | `/ponto/justificativas` |
| Cadastros & App | Configurações | `/ponto/config` |
| Cadastros & App | Feriados | `/ponto/feriados` |
| Cadastros & App | Locais / Geofence | `/ponto/locais` |
| Cadastros & App | Carga Horária | `/carga-horarias` (fora do prefixo `/ponto`) |
| Cadastros & App | App Colaborador (PWA) | `/ponto/link` |
| Cadastros & App | Relógio de Ponto (Tablet) | `/ponto/relogio` |

No mesmo grupo de menu, logo abaixo, fica o módulo **Folha**: `/folha`,
`/folha/processamento`, `/folha/competencias` e `/folha/holerites`. É o destino
declarado do fechamento do ponto. Este lote não abriu essas telas.

---

## 2. Telas

### 2.1 `/grupos-tributarios`: lista de grupos tributários (observado)

**Objetivo:** cadastrar as regras fiscais por operação.

- **Cabeçalho:** título e, logo abaixo, o nome do formulário do sistema antigo
  (`FrmFiscal_Grupo_Tributario`). O botão **Inserir** leva a
  `/grupos-tributarios/create`.
- **Filtro:** campo de busca (Descrição ou ID), texto livre e botão
  **Pesquisar**.
- **Colunas:** ID, Descrição, Tipo (Entrada/Saída), DFE, Operação, CFOP Est.
  (o CFOP da operação estadual), Status e a ação **Alterar**
  (`/grupos-tributarios/{id}/edit`). Não há botão de excluir na lista.
- **Rodapé fixo "Dados complementares":** mostra um resumo da linha selecionada
  (ID, descrição, tipo e DF-e, operação, CFOP estadual, status) com o atalho
  Alterar. O mesmo rodapé aparece em outras listas do ERP (Carga horária,
  Pessoas).
- **Dados da conta:** 8 grupos, todos com a descrição "VENDA", de saída e
  ativos. São as combinações de:
  - **DF-e:** NF-e ou NFC-e;
  - **operação:** VENDA ou VENDA PDV ON;
  - **CFOP:** 5102 (venda de mercadoria de terceiros, sem substituição
    tributária) ou um CFOP de substituição tributária (5403 nos grupos de
    NF-e, 5405 nos de NFC-e).

  Cada caso de venda tem um grupo para produto sem ST e outro para produto com
  ST, e tudo isso se repete por documento e por canal (balcão e PDV). Parece um
  conjunto que já vem pronto na conta nova (a verificar).

### 2.2 `/grupos-tributarios/create`: novo grupo tributário (observado)

É um formulário único com cerca de 150 campos. Os botões **Gravar** e
**Cancelar** não foram clicados.

**Cabeçalho**

| Campo | Tipo | Obrig. | Opções / observações |
|---|---|---|---|
| ID | texto só leitura | — | "—" num registro novo |
| Empresa | texto só leitura | — | a empresa logada: o grupo pertence à empresa |
| Descrição | texto | sim | |
| Entrada / Saída | lista | sim | Entrada, Saída. Ao trocar, a lista "Operação" é recarregada do servidor (`/grupos-tributarios/operacoes?tipo=0` ou `?tipo=1`, devolve JSON com id e descrição) |
| Status | lista | — | Ativo, Inativo |
| Operação | lista | sim | depende de Entrada/Saída (ver abaixo) |
| Tipo DF-e | lista | — | NF-e, NFC-e, MDF-e, CT-e, NFS-e |
| Alíq. ECF | texto | — | resto do antigo cupom fiscal (ECF) |
| Mensagem NF | texto | — | texto impresso na nota |

**Operações de entrada (21):**

- compra;
- crédito CIAP;
- devoluções: bonificação, comodato, consumo, revenda, venda, venda do PDV ON,
  exportação, imobilizado;
- entrada, entrada de nota fiscal, entrada XML;
- estorno de NF-e (escrito "extorno");
- importação;
- NF complementar;
- retornos: conserto, consignação, demonstração, entrega futura, simples
  remessa.

**Operações de saída (20):**

- venda, venda PDV ON, venda PDV OFF, venda em consignação, venda de
  imobilizado;
- revenda;
- bonificação, comodato, conserto, consumo, demonstração;
- devolução de compra;
- entrega futura;
- exportação (escrito errado);
- extravio/perda;
- NF-e complementar;
- ordem de serviços (escrito "order");
- saída de ICMS;
- simples remessa;
- transferência.

**Indicadores (caixas de marcar), 12 ao todo:**

- calcular área de livre comércio;
- calcular substituição tributária;
- industrializado;
- isento;
- imprimir mensagem de ST;
- órgão público;
- cliente não contribuinte do AM;
- derivado de petróleo;
- referenciar nota (obriga a chave de uma nota referenciada; ver
  `13-fiscal.md`);
- gera IPI na devolução;
- somar IPI na base (NF-e);
- somar IPI na base (NFC-e).

**Bloco "Reforma Tributária: parâmetros gerais"**

| Campo | Tipo | Opções |
|---|---|---|
| Modelo apuração | lista | Transição, Antigo, Novo |
| Categoria IVA | lista | Padrão, Reduzida, Zero, Isenta, Específica |
| IS categoria | texto | |
| Vigência início / fim | datas | |
| Permite crédito IBS, Permite crédito CBS, IS incide, Usar reforma tributária | caixas | |

**Abas por destino: Estadual, Interestadual e Internacional.** Cada aba repete o
mesmo conjunto de campos, todos de **texto livre**:

| Bloco | Campos |
|---|---|
| Campos comuns (a tela avisa que é "uma única gravação no banco") | CFOP; % de redução da base do ICMS; origem da mercadoria; IPI (CST, alíquota, código de enquadramento); PIS (CST, alíquota); COFINS (CST, alíquota); FCP; FCP ST; FCP CST retido; alíquota de ISS |
| Sub-aba Regime Simples | CSOSN; alíquota do CSOSN (crédito do Simples) |
| Sub-aba Regime Normal | alíquota ECF; CST do ICMS; cBenef; modalidade da base do ICMS; alíquota do ICMS; desoneração do ICMS (dois campos); ST: modalidade da base, alíquota, redução, margem (MVA); "ICMS 40": modalidade da base e alíquota |
| Sub-aba Reforma Tributária | IBS: CST, cClassTrib, alíquota, % de redução, modalidade da base, cCredPres, indicador de doação; CBS: alíquota, % de redução, modalidade da base |

Conta rápida: são 3 destinos com cerca de 39 campos cada, mais uns 30 no
cabeçalho.

**Regras observadas**

- São obrigatórios a descrição, a operação e o tipo de movimento.
- As operações são filtradas pelo tipo de movimento (lista vinda do servidor).
- Nenhum campo fiscal oferece lista de valores ou validação visível: CFOP, CST,
  CSOSN e cClassTrib são digitados.
- A empresa é fixa (a do login), por isso os grupos são por empresa ou filial.

### 2.3 `/grupos-tributarios/{id}/edit`: alterar grupo (aberta, valores não lidos)

A página do grupo nº 1 abriu (título "Grupo #1"), mas a leitura dos valores
gravados foi recusada pelo filtro de segurança do Claude Code. Ver Pendências.

### 2.4 Cadastro de produto → painel "Grupo tributário" (observado, contexto)

Em `/produtos/create`, no bloco "Preços e tributação", há um painel "Grupo
tributário: documento · movimento · tipo de operação". Ele tem:

- busca "Filtrar grupo…";
- contador de grupos marcados;
- lista com caixas de marcar, agrupada por documento e movimento (ex.: NF-e ·
  Saída) e depois por operação (ex.: Venda, Venda PDV ON);
- em cada item, a descrição e um resumo da CST e da alíquota de ICMS.

**Um produto marca vários grupos** (relação N:N). Inferido: na emissão vale o
grupo do produto que casa com o documento e a operação escolhidos.

### 2.5 `/dashboard/modulo/ponto`: lançador do módulo (observado)

Tem o cabeçalho "Ponto Eletrônico" com "Voltar ao dashboard" e dois blocos de
cartões, "Gestão" e "Cadastros & App", com os 12 itens da tabela da seção 1. Não
mostra indicadores.

### 2.6 `/ponto/dashboard` (= `/ponto`): painel do gestor (observado)

- **Cabeçalho:** "Ponto Eletrônico", com o subtítulo "Dashboard gestor · REP-P /
  Portaria 671 · {mês/ano}" e a data de hoje.
- **Botões do cabeçalho:**
  - **Gerar feriados do ano** (envia formulário; não clicado);
  - **App colaborador** → `/ponto/link`;
  - **Relógio tablet** → `/ponto/relogio`;
  - **Espelho** → `/ponto/espelho`.
- **Alerta amarelo** quando o ano não tem feriados: avisa que sem eles o cálculo
  da jornada fica errado. Tem o botão **Gerar agora** (não clicado).
- **Filtro:** Competência (janeiro a dezembro), Ano (número) e Filtrar.
- **Quatro indicadores:** colaboradores ativos, batidas hoje, fora da geofence
  hoje e justificativas pendentes. Todos estavam em 0.
- **"Últimas batidas":** vazia, com o botão "Ver no mapa". O rodapé mostra as
  horas extras do mês (em minutos) e quantos feriados o ano tem.
- **Atalhos:** Configurações, Mapa de batidas, Fechamento mensal,
  Justificativas, Feriados, Locais/Geofence e Carga horária.
- **Cartão "Feriados nacionais":** importa os feriados fixos e os móveis
  (Carnaval, Sexta-feira Santa, Corpus Christi) do ano informado. Tem campo de
  ano, botão **Gerar** (não clicado) e link "Gerenciar feriados manualmente".

### 2.7 `/ponto/espelho`: espelho de ponto (observado em parte)

- **Subtítulo:** o espelho junta as batidas do app e os ajustes de folga ou troca
  de escala, e o colaborador bate o ponto normalmente.
- **Filtro:**
  - Colaborador: o **ID da pessoa**, número digitado (não há busca por nome);
  - Mês e Ano (números);
  - **Consultar**, que faz um GET com `?id_pessoa=&mes=&ano=`.
- **Teste com o ID 1:** a resposta foi uma página crua "404 NOT FOUND", porque a
  conta não tem colaborador. Não há mensagem amigável.
- **Não visto:** a grade do mês, os totais, os ajustes de folga ou troca de
  escala, a assinatura, a impressão e a exportação.

### 2.8 `/ponto/mapa`: mapa de batidas (observado)

- **Filtro:** Início e Fim (datas; o padrão vai do dia 1 do mês até hoje) e
  Filtrar. Não há filtro por colaborador nem por local.
- **Mapa:** Leaflet com zoom + e −, aberto sobre a América do Sul, sem marcadores
  (não há dados). Não dá para ver se desenha a cerca dos locais.

### 2.9 `/ponto/auditoria`: auditoria de batidas (observado)

O menu chama a tela de "Auditoria de Fotos"; o título é "Auditoria de batidas".

- **Subtítulo técnico:** diz que as fotos ficam no próprio banco de dados (cita
  "BYTEA"), que as origens são o relógio tablet e o app, e mostra o período.
- **Botões:** Dashboard e Mapa GPS.
- **Quatro indicadores:** total no período, com foto, facial OK ("validação
  biométrica") e fora da geofence ("requer atenção").
- **Filtros:** De, Até, Colaborador (ID; vazio = todos), Origem (Todas, Relógio
  tablet, App PWA, Legado), a caixa "Somente com foto" e Filtrar.
- **Lista "Registros auditáveis"** (N batidas, página x de y): Data/hora,
  Colaborador, Origem, Foto, Facial, GPS e uma coluna de ação.
- **Natureza da tela:** audita as **batidas** (prova de presença). Não é um
  histórico de alterações, e o módulo não tem tela de "quem alterou o quê".

### 2.10 `/ponto/fechamento`: fechamento mensal (observado)

- **Objetivo declarado:** consolidar HE 50%/100%, noturno, DSR, faltas e atrasos
  para exportar à folha.
- **Filtro:** Mês e Ano (números) e Filtrar. O botão **Processar** não foi
  clicado.
- **Tabela "Totais por colaborador":** Colaborador, Trabalhadas, HE 50%,
  HE 100%, Noturno, DSR, Faltas, Atrasos, Banco e Status. Vazia, com o aviso
  "Processe o fechamento para ver totais".
- **Não aparecem:** botão de exportar, travar ou reabrir o período, nem os
  arquivos AFD/AEJ.

### 2.11 `/ponto/justificativas`: justificativas (observado)

- **Filtro de status:** Pendente (padrão), Aprovado, Rejeitado, Todos.
- **Colunas:** Colaborador, Data, Tipo, Motivo, Status e Ação. Vazia.
- **Origem:** o colaborador envia pelo app (aba "Justificar", com data, tipo
  Falta/Atraso/Ajuste/Outro e motivo). Nenhum campo de anexo (atestado) foi
  visto.
- **Estados:** pendente → aprovado ou rejeitado.

### 2.12 `/ponto/config`: configurações do ponto (observado, com os valores atuais)

| Campo | Tipo | Valor atual / opções |
|---|---|---|
| Timezone | texto livre | America/Porto_Velho |
| Geofence | lista | Desligado, **Somente aviso** (atual), Bloquear registro |
| Raio geofence (m) | número | 200 |
| Tolerância atraso (min) | número | 5 |
| Limite banco horas/mês (min) | número com decimais | 0,00 |
| Início noturno / Fim noturno | hora | 22:00 / 05:00 |
| GPS obrigatório | caixa | marcada |
| Facial obrigatório | caixa | desmarcada |
| Calcular adicional noturno | caixa | marcada |

O botão "Salvar configurações" não foi clicado. A configuração é única por
empresa.

**Não existem nesta tela:**

- percentuais de hora extra;
- regra de DSR;
- tolerância para saída antecipada;
- regra dos 5/10 minutos por marcação;
- prazo de compensação do banco de horas;
- intervalo mínimo;
- descanso mínimo entre jornadas.

### 2.13 `/ponto/feriados`: feriados (observado)

- **Cartão "Novo feriado":**
  - Data (data);
  - Descrição (texto; o exemplo sugere "aniversário da cidade");
  - Tipo: Nacional, Municipal ou Empresa;
  - "Recorrente anual (mesmo dia/mês)" (caixa);
  - Cadastrar (não clicado).
- **Cartão "Importação rápida":** ano e Gerar (fixos e móveis).
- **Topo:** botão "Gerar feriados do ano" e Voltar. A mesma ação de gerar
  aparece três vezes nesta tela (topo, importação rápida e lista vazia) e
  outras três no painel.
- **Lista "Feriados cadastrados"** (N registros): Data, Descrição, Tipo e uma
  ação. Vazia, com o link "Gerar feriados de {ano}".
- **Faltam:** o tipo **Estadual** (Rondônia tem feriados estaduais) e a ligação
  do feriado a um local ou filial.

### 2.14 `/ponto/locais`: locais e geofence (observado)

- **Formulário lateral:** Descrição (texto), Latitude (número), Longitude
  (número), Raio em metros (número, padrão 200) e Cadastrar (não clicado).
- **Lista:** Descrição, Lat, Lng, Raio e uma ação. Vazia.
- **Limitações:** as coordenadas são digitadas à mão, sem mapa, sem busca de
  endereço e sem "usar minha localização". Não há ligação visível entre local e
  colaborador.

### 2.15 `/ponto/link`: links dos apps (observado)

A tela tem três cartões.

1. **Conectar app Android.** O colaborador abre o app "Olimpia" no celular e
   lê o QR, que leva a URL da API e o tenant. O cartão mostra:
   - a URL da API REST (`/api/ponto/v1/v/{slug}`), com Copiar;
   - o "payload do QR" em JSON, com Copiar JSON. As chaves são `olimpia`, `v`,
     `module` (= "ponto"), `api`, `pwa`, `relogio`, `tenant` (= slug), `codigo`
     (o código do tenant, no formato "T000…") e `nome` (o nome da empresa);
   - uma linha com empresa, slug e código;
   - a imagem do QR.
2. **Relógio de Ponto (Tablet).** Terminal compartilhado (código, senha e foto)
   para parede ou balcão. Mostra a URL `/ponto/v/{slug}/relogio` com Copiar,
   "Abrir em tela cheia" e o QR.
3. **App Colaborador (PWA).** Funciona no navegador do celular e oferece
   espelho, banco de horas e batida. Mostra a URL `/ponto/v/{slug}/app` com
   Copiar e o QR. O login é o ID da pessoa mais a senha definida em Pessoas →
   Colaborador.

**O link é um só por empresa** (pelo slug). Não há como gerar, renovar ou
revogar o link, nem link individual por colaborador.

### 2.16 Sub-rotas descobertas

#### `/carga-horarias`: carga horária (observado)

- **Subtítulo:** jornada semanal dos colaboradores, seguida do nome de
  formulário legado (`FrmPessoa_Colaborador_Carga_horaria`).
- **Inserir** → `/carga-horarias/create`.
- **Filtro:** campo (Descrição ou Código), status (Ativo, Inativo, Todos) e
  Pesquisar.
- **Colunas:** ID, Descrição, Hrs/sem, Noturno, Status e Ações. Vazia. Tem o
  mesmo rodapé "Dados complementares".

#### `/carga-horarias/create`: nova carga horária (observado)

| Campo | Tipo | Obrig. | Observação |
|---|---|---|---|
| Descrição | texto | sim | ex.: "COMERCIAL PADRÃO" |
| Status | lista | — | Ativo, Inativo |
| Hrs semanais | texto | — | "Auto": calculado ao preencher a grade; parece continuar editável (a verificar) |
| Adicional noturno | caixa | — | marca a jornada como noturna |
| Grade semanal | 7 linhas (segunda a domingo) × 4 horários | — | Entrada, Saída almoço, Retorno almoço, Saída. O total do dia é calculado, e o dia vazio aparece como "Folga" |

- **Modelos rápidos:**
  - Comercial padrão: segunda a sexta, 08–12 e 14–18, mais sábado 08–12;
  - Seg–Sex sem sábado;
  - Sábado meio período;
  - Copiar segunda → terça a sexta.

  Há também o botão Limpar horários.
- **Teste sem salvar:** o modelo "Comercial padrão" preencheu 8 h por dia útil e
  4 h no sábado, num total de **44,00 h/semana**, e pôs 44.00 em "Hrs
  semanais". Depois limpei a grade e saí sem gravar.
- **Modelo de jornada:** uma **semana fixa com um intervalo**. Não há escala
  12x36, revezamento, jornada flexível nem intervalo pré-assinalado.

#### `/pessoas/create` → tipo "Colaborador" (observado, contexto)

Os tipos de cadastro de pessoa são Cliente, Colaborador, Fornecedor,
Transportador e Produtor rural, e uma pessoa pode ter vários. Marcar Colaborador
abre a aba de mesmo nome, com duas sub-abas.

- **Geral:**
  - comissão sobre produto, serviço e geral (%);
  - salário;
  - admissão e demissão;
  - tipo de contrato: CLT, PJ ou Temporário;
  - horas mensais;
  - cargo e carga horária (busca com lupa);
  - CTPS, título de eleitor e PIS;
  - **senha do ponto**;
  - CNH (número, categoria, vencimento);
  - anotações.
- **Financeiro:** limite de convênio ou de compras no PDV (R$). É obrigatório
  quando a forma de pagamento "gera convênio colaborador".

A pessoa do ponto é a mesma do cadastro geral de pessoas, e o "ID pessoa" é o
código usado no espelho, na auditoria e no login do app. Em
`/pessoas?tipo=colaborador` a conta tem **0 colaboradores**.

#### `/ponto/v/{slug}/app`: app do colaborador, PWA "Olimpia Ponto" (observada só a entrada)

- **Tela de entrada:** Código colaborador (número), Senha ponto (senha) e
  Entrar. Não fiz login.
- **O que vem depois do login** aparece na estrutura já carregada da página (não
  usei):
  - nome do colaborador e Sair;
  - abas **Ponto, Espelho, Banco e Justificar**;
  - relógio ao vivo com a data e o botão **Registrar ponto**;
  - aviso "Obtendo localização…" (usa o GPS do aparelho);
  - "Espelho do mês";
  - "Banco de horas", com saldo em minutos;
  - formulário de justificativa: data, tipo (Falta, Atraso, Ajuste, Outro),
    motivo e Enviar.
- Nenhum elemento de câmera apareceu na estrutura. Ele pode surgir na hora da
  batida (a verificar).

#### Não abertas de propósito

- `/ponto/relogio` e `/ponto/v/{slug}/relogio` (relógio tablet): para não
  disparar pedido de câmera nem arriscar uma batida real. O que se sabe vem de
  `/ponto/link`.
- `/api/ponto/v1/v/{slug}`: é a API do app Android, não uma tela.

---

## 3. Fluxos de ponta a ponta

Os passos marcados como inferido não foram vistos funcionando, porque a conta
não tem dados.

1. **Implantação do ponto (gestor).**
   - Configurações: fuso, modo da geofence, raio, tolerância, faixa noturna,
     GPS e facial obrigatórios.
   - Locais: latitude, longitude e raio.
   - Carga horária: grade semanal.
   - Pessoas: marcar o tipo Colaborador e preencher contrato, PIS, carga
     horária e senha do ponto.
   - Feriados: gerar os nacionais e cadastrar os municipais e os da empresa.
   - Links: enviar o link ou QR do PWA ao colaborador, deixar o relógio em tela
     cheia num tablet, ou configurar o app Android pelo QR.
2. **Batida pelo celular (PWA).**
   - O colaborador abre o link e entra com código e senha.
   - Na aba Ponto, toca em Registrar ponto e o app obtém a localização.
   - O servidor compara a posição com o raio dos locais (inferido). No modo
     aviso, registra e marca "fora da geofence"; no modo bloqueio, recusa
     (inferido).
   - Com "facial obrigatório", tira foto e faz validação facial (inferido).
   - A batida aparece em "Últimas batidas", no mapa, na auditoria (origem "App
     PWA") e no espelho.
3. **Batida no relógio (tablet).** O tablet fica fixo com a URL do relógio. O
   colaborador digita código e senha, a foto é tirada e a batida entra com
   origem "Relógio tablet".
4. **Ocorrência (falta, atraso ou ajuste).**
   - O colaborador envia a justificativa no app.
   - Ela aparece como pendente no painel e em Justificativas.
   - O gestor aprova ou rejeita.
   - Inferido: a aprovação abona ou ajusta o dia no espelho e no fechamento.
5. **Fechamento do mês.**
   - O gestor confere o espelho de cada colaborador (ID, mês e ano) e ajusta
     folgas e trocas de escala (a verificar).
   - Em Fechamento, escolhe mês e ano e clica em Processar.
   - Saem os totais por colaborador: trabalhadas, HE 50%/100%, noturno, DSR,
     faltas, atrasos, banco e status.
   - Exporta para o módulo Folha (competências, processamento, holerites).
     Inferido pela descrição da tela.
6. **Regras fiscais (grupo tributário).**
   - Cadastrar os grupos: movimento, operação, documento, destino e regime.
   - No produto, marcar os grupos que valem para ele.
   - Na venda, no PDV ou na OS, a operação (ex.: VENDA, VENDA PDV ON) e o
     documento (NF-e ou NFC-e) apontam o grupo.
   - CFOP, CST e alíquotas vão para a nota, que segue para a SEFAZ.
   - Com a reforma, a caixa "usar reforma tributária" e a vigência ligam os
     campos de IBS, CBS e IS (inferido).

---

## 4. Entidades e relações

| Entidade | Campos observados | Relações |
|---|---|---|
| Grupo tributário | empresa; descrição; tipo (entrada/saída); status; operação; tipo DF-e; alíquota ECF; mensagem da NF; 12 indicadores; parâmetros da reforma (modelo de apuração, categoria IVA, categoria IS, vigência, créditos IBS/CBS, IS incide, usar reforma); para cada destino (estadual, interestadual, internacional): campos comuns, Simples (CSOSN), Normal (CST, ICMS, ST, desoneração) e Reforma (IBS, CBS) | pertence a uma Empresa; N:1 Operação fiscal; N:N Produto |
| Operação fiscal | id; descrição; tipo (entrada/saída) | lista do sistema (21 de entrada, 20 de saída); 1:N Grupo tributário; escolhida na emissão |
| Produto (parte fiscal) | grupos tributários marcados | N:N Grupo tributário |
| Pessoa / Colaborador | ID pessoa; tipos (cliente, colaborador…); comissões (%); salário; admissão; demissão; tipo de contrato (CLT/PJ/Temporário); horas mensais; cargo; carga horária; CTPS; título de eleitor; PIS; senha do ponto; CNH (nº, categoria, vencimento); anotações; limite de convênio | N:1 Cargo; N:1 Carga horária; 1:N Batida; 1:N Justificativa; 1:N Fechamento |
| Carga horária | id; descrição; status; horas semanais (calculadas); adicional noturno; grade de 7 dias × (entrada, saída almoço, retorno almoço, saída) | 1:N Colaborador |
| Configuração do ponto | fuso horário; modo da geofence; raio padrão; tolerância de atraso; limite do banco/mês; início e fim do noturno; GPS obrigatório; facial obrigatório; calcular adicional noturno | 1:1 Empresa |
| Local (geofence) | descrição; latitude; longitude; raio (m) | N:1 Empresa; inferido: cada batida é comparada com os locais |
| Feriado | data; descrição; tipo (nacional/municipal/empresa); recorrente anual | N:1 Empresa; entra no cálculo (HE 100%, DSR — a verificar) |
| Batida (marcação) | data/hora; colaborador; origem (relógio, PWA, legado); foto (guardada no banco); resultado facial; GPS; fora da geofence | N:1 Colaborador; inferido: N:1 Local |
| Justificativa | colaborador; data; tipo (falta/atraso/ajuste/outro); motivo; status (pendente/aprovado/rejeitado) | N:1 Colaborador; decidida por um gestor (inferido) |
| Ajuste do espelho | folga; troca de escala (citados no subtítulo) | N:1 Colaborador × dia (a verificar) |
| Fechamento mensal | colaborador; competência (mês/ano); trabalhadas; HE 50%; HE 100%; noturno; DSR; faltas; atrasos; banco; status | N:1 Colaborador; alimenta a Folha |
| Banco de horas | saldo em minutos; limite mensal | por colaborador; aparece no app e no fechamento |
| Tenant (empresa) | slug; código "T000…"; nome | dá a base das URLs do PWA, do relógio e da API e o conteúdo do QR |

---

## 5. Integrações pressupostas

| Integração | Onde aparece | Situação |
|---|---|---|
| SEFAZ (NF-e, NFC-e, MDF-e, CT-e) e prefeituras (NFS-e) | tipo DF-e do grupo tributário | observado no formulário; a transmissão é de outras telas |
| Layout da Reforma Tributária (IBS, CBS, IS, cClassTrib, cCredPres) | grupo tributário | campos observados; uso real a verificar |
| ECF (cupom fiscal antigo) | alíquota ECF | resto do sistema antigo |
| Leaflet e um mapa-base estilo OpenStreetMap | mapa de batidas | observado; o fornecedor dos mapas não foi identificado |
| GPS do aparelho (geolocalização do navegador) | PWA ("Obtendo localização…"), GPS obrigatório | observado |
| Câmera e reconhecimento facial | relógio (foto), auditoria ("Facial OK"), facial obrigatório | serviço de reconhecimento não identificado; fotos guardadas no próprio banco |
| App Android "Olimpia" com API REST `/api/ponto/v1` | `/ponto/link` (QR com JSON) | observado; o app parece servir a vários módulos (o QR leva o campo "module") |
| QR code e PWA instalável | `/ponto/link` | observado |
| Módulo Folha (interno) | fechamento "para exportar à folha" | inferido |
| Calendário de feriados móveis | gerar feriados | cálculo interno ou serviço externo: a verificar |
| **Não vistos** | AFD e AEJ (Portaria 671), comprovante da marcação, eSocial, envio por e-mail ou WhatsApp, relógio físico (REP-C) com importação de AFD | a verificar |

---

## 6. Observações de UX (oportunidades para nós)

### 6.1 Grupo tributário

1. **Formulário de especialista.** São cerca de 150 campos de texto livre em
   abas dentro de abas (3 destinos × 3 regimes), com abreviações difíceis ("Cli.
   não cont. AM", "ICMS deson. liq."). Um lojista de alimentação não consegue
   preencher.
   **Nós:** um assistente por regime (Simples mostra só CSOSN e PIS/COFINS),
   listas oficiais para CFOP, CST, CSOSN e cClassTrib, modelos prontos por
   ramo (ex.: restaurante no Simples) e um simulador que calcula os impostos de
   um item de exemplo.
2. **Explosão de cópias.** Oito grupos que só mudam documento, canal e CFOP de
   ST.
   **Nós:** uma regra só, com condições (produto com ST → CFOP x; NFC-e ou NF-e
   no mesmo registro).
3. **Erros de escrita** nas operações ("EXPORTÇÃO", "ORDER DE SERVIÇOS",
   "EXTORNO") e **nomes técnicos à vista** (`FrmFiscal_Grupo_Tributario`,
   `produto_empresa`).
4. **Indicadores de outros estados e ramos** (área de livre comércio, cliente
   não contribuinte do AM, derivado de petróleo) aparecem para todos.
   **Nós:** mostrar só o que o ramo e a UF do cliente usam.

### 6.2 Ponto

1. **O espelho exige digitar o ID numérico da pessoa** e devolve uma página "404"
   crua quando o ID não serve.
   **Nós:** lista de colaboradores com busca por nome, foto e situação do dia,
   e estado vazio explicativo.
2. **Locais sem mapa:** latitude e longitude digitadas à mão.
   **Nós:** escolher no mapa ou por endereço, com o círculo do raio desenhado e
   "usar minha localização atual".
3. **Raio em dois lugares** (padrão nas configurações e um por local), sem dizer
   qual vale.
4. **"Auditoria de Fotos" (menu) e "Auditoria de batidas" (título) são a mesma
   tela**, e não é auditoria de alterações. Não existe trilha de quem incluiu,
   desconsiderou ou abonou uma marcação.
   **Nós:** guardar sempre a marcação original e um histórico de cada
   tratamento, com motivo e autor. Pela Portaria 671 (conhecimento geral, a
   verificar) a marcação original não pode ser alterada.
5. **O painel diz "REP-P / Portaria 671"**, mas nenhuma tela mostrou AFD, AEJ,
   comprovante de marcação ou atestado técnico.
   **Nós:** se formos fazer ponto, tratar a conformidade como parte do produto,
   não como etiqueta.
6. **Botões que gravam, repetidos e diretos.** "Gerar feriados" aparece três
   vezes no painel e outras três na tela de feriados. "Processar" fica solto no
   fechamento. Não cliquei, por isso não sei se pedem confirmação.
   **Nós:** uma lista de implantação (configurar → locais → jornada →
   colaboradores → feriados → links) com progresso, e uma prévia antes de
   fechar o mês.
7. **Fechamento opaco.** Não diz que regra gera HE 50% ou 100% nem como calcula
   DSR e banco, porque a configuração não tem percentuais nem prazos. Também não
   mostra como exportar, travar ou reabrir.
   **Nós:** regras visíveis e configuráveis, prévia por colaborador, travamento
   com reabertura auditada e exportação clara para a folha.
8. **Configurações rasas e unidades confusas.** O "limite do banco de horas por
   mês" está em minutos com casas decimais, o fuso é texto livre e não há regras
   de intervalo, interjornada, 5/10 minutos nem compensação.
9. **Justificativa sem anexo:** não há foto do atestado e só existem 4 tipos.
   **Nós:** anexo, motivos configuráveis (abona ou não) e cuidado de LGPD com
   atestados (dado de saúde).
10. **Feriados sem o tipo estadual** e sem ligação a filial.
    **Nós:** carregar sozinho os nacionais, os de RO e os de Porto Velho, e
    permitir feriado por loja.
11. **Carga horária: ponto positivo.** Os modelos rápidos e o total semanal
    calculado são bons e vale copiar. Mas só cobre semana fixa: não tem 12x36,
    escala, folga alternada nem jornada flexível. O campo "Hrs semanais" é
    calculado, mas parece aceitar digitação (a verificar); se aceitar, o total
    digitado pode desmentir a grade.
12. **Acesso do colaborador frágil e técnico.**
    - O link é um só por empresa; o login é um código numérico e uma senha
      definida **pelo gestor** no cadastro (o gestor conhece a senha).
    - Não há renovar ou revogar o link.
    - A tela mostra JSON e URL de API para um dono de restaurante.

    **Nós:** convite individual (WhatsApp) e senha criada pelo próprio
    colaborador no primeiro acesso, com limite de tentativas, aparelho
    autorizado e QR sem jargão.
13. **Navegação duplicada.** Para o mesmo módulo há lançador, painel com atalhos
    e menu lateral. O menu lateral de cada página traz todos os módulos do ERP
    (centenas de links).
    **Nós:** menu montado só com os módulos que o cliente usa.

### 6.3 Detalhe técnico, útil para o nosso modelo

O código de "Ativo" é invertido entre telas: vale 0 no grupo tributário e 1 na
carga horária e em pessoas. Isso mostra falta de padrão no modelo de dados
deles. **Nós:** status com enum e nome explícito.

---

## 7. Pendências

### 7.1 O que foi recusado, explicado de forma simples

1. A tela de edição do grupo tributário nº 1 abriu normalmente.
2. Ao tentar ler os valores gravados nela (CFOP, CST e alíquotas de cada aba),
   o **filtro de segurança automático do Claude Code** (o classificador do modo
   automático) recusou a ação, com o motivo "Third-Party Attack". Quem barrou
   foi o Claude Code, não o ERP.
3. Respeitei a recusa: não tentei de outro jeito e não li esses valores por
   outro caminho. No painel do produto aparece um resumo desses valores; de
   propósito, não o copiei para este relatório.
4. As demais telas foram lidas normalmente.
5. A decisão sobre essa leitura é sua. O aviso do Claude Code diz que é possível
   criar uma regra de permissão nas configurações. Eu não mudo permissões.

### 7.2 O que ficou por ver

1. **Valores de um grupo tributário existente** (seção 7.1).
2. **O ponto com dados.** A conta tem 0 colaboradores e nenhuma batida,
   justificativa, feriado ou local. Ficaram sem ver: a grade do espelho, os
   marcadores do mapa, as linhas da auditoria (foto, facial, GPS), os totais do
   fechamento e as ações de aprovar ou rejeitar justificativa. Criar dados de
   teste seria gravar, o que este lote não permite. Para ver, alguém precisa
   cadastrar um colaborador de teste e algumas batidas.
3. **Relógio tablet** (`/ponto/relogio` e `/ponto/v/{slug}/relogio`): não
   aberto de propósito (câmera e risco de batida real).
4. **App PWA depois do login:** não fiz login. As abas só foram vistas na
   estrutura da página.
5. **Regras de cálculo a confirmar:**
   - o que define HE 50% e HE 100% (domingo? feriado? passou de X horas?);
   - como calcula o DSR;
   - se aplica a hora noturna reduzida;
   - como funciona o limite do banco de horas;
   - se a tolerância de 5 minutos vale por marcação ou por dia;
   - se a geofence usa o raio do local ou o padrão;
   - se o colaborador fica preso a um local;
   - quem faz o reconhecimento facial;
   - se o relógio funciona sem internet;
   - como é a exportação para a Folha (formato);
   - se existem AFD, AEJ e comprovante.
6. **Telas vizinhas não abertas neste lote:** o módulo Folha (`/folha…`) e
   Cargos (a busca de cargo no cadastro do colaborador).
7. **O arquivo `15-ponto.md` continua dizendo "não explorado".** Não o alterei,
   porque a tarefa proíbe mexer em outros arquivos. Sugestão para o orquestrador:
   apontar dele para este relatório.

### 7.3 Ações que vi e **não** cliquei (gravam algo)

- Gravar (grupo tributário);
- Salvar (carga horária, pessoa);
- Salvar configurações (ponto);
- Gerar feriados do ano, Gerar agora e Gerar (feriados);
- Cadastrar (feriado, local);
- Processar (fechamento);
- Enviar e Registrar ponto (no app);
- aprovar ou rejeitar justificativa (não havia nenhuma).
