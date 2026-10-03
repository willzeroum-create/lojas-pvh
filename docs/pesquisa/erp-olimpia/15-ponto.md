# 15 — Ponto eletrônico (ERP Olímpia)

> Cobre o módulo Ponto Eletrônico: lançador, painel do gestor, espelho, mapa,
> auditoria de batidas, fechamento mensal, justificativas, configurações,
> feriados, locais (geofence), links dos apps, relógio tablet, PWA "Olimpia
> Ponto" e a API do app Android. Exploração de 2026-10-03, conta de teste
> "Boi Criolo" (plano Full), sessão já aberta no navegador embutido, em aba
> própria fechada no fim. **A conta não tem dados de ponto** (0 colaboradores,
> nenhuma batida, justificativa, feriado ou local): as telas foram vistas vazias.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual],
> [código] (lido no HTML/JS da página), [proposta], [a verificar] (hipótese ou
> conhecimento geral do domínio, como CLT e Portaria MTP 671/2021, não visto no
> ERP). Nada foi gravado no ERP.

## 1. Visão geral

**O que é [visto].** Um ponto por programa: o próprio painel se apresenta como
"REP-P / Portaria 671". Os blocos do módulo são:

- **Três canais de batida:**
  - **App Colaborador (PWA)** "Olimpia Ponto", no navegador do celular, com
    localização (GPS);
  - **Relógio de ponto (tablet)**, terminal compartilhado com código, senha e
    foto;
  - **app Android "Olimpia"**, configurado ao ler um QR code (fala com a API
    REST `/api/ponto/v1/v/{slug}`).
- **Cerca virtual (geofence):** locais com latitude, longitude e raio. O modo é
  desligado, só aviso ou bloqueio do registro.
- **Foto e validação facial** de cada batida, numa tela de auditoria. As fotos
  ficam guardadas no próprio banco de dados.
- **Jornada:** a "Carga horária" é uma grade semanal ligada ao cadastro do
  colaborador em Pessoas (ver 1.3).
- **Feriados:** cadastro manual e geração automática dos nacionais.
- **Justificativas:** o colaborador envia pelo app e o gestor aprova ou rejeita.
- **Fechamento mensal:** consolida HE 50%/100%, noturno, DSR, faltas, atrasos e
  banco de horas, "para exportar à folha".

**Onde fica [visto].** No menu lateral, secção **"Pessoas & RH" → "Ponto"**
(12 itens). No mesmo grupo de menu, logo abaixo, ficam o módulo **Folha**
(`/folha`, `/folha/processamento`, `/folha/competencias`, `/folha/holerites`…),
destino declarado do fechamento do ponto, e o **Portal Colaborador**. Ambos
estão em [16-folha-colaborador.md](16-folha-colaborador.md).

**Navegação [visto].** Para o mesmo módulo há três caminhos: o lançador
`/dashboard/modulo/ponto`, o painel `/ponto/dashboard` com atalhos e o menu
lateral (que, em cada página, traz todos os módulos do ERP, com centenas de
links).

**Padrões do módulo [visto].**

- O colaborador é sempre identificado pelo **ID da pessoa** (número digitado),
  no espelho, na auditoria e no login do PWA (no relógio, o "código do
  colaborador" é [deduzido] o mesmo número).
- Filtros por competência com **mês e ano numéricos**.
- Botões que gravam aparecem soltos e repetidos ("Gerar feriados" seis vezes
  entre o painel e a tela de feriados; "Processar" no fechamento).
- Páginas renderizadas no servidor (Laravel, Bootstrap, Bootstrap Icons); o
  relógio tablet é uma página à parte, escura e em tela cheia, sem o menu do
  ERP. O subtítulo da auditoria cita "BYTEA" (tipo de coluna binária do
  PostgreSQL) para as fotos.
- Endereços públicos por empresa no formato `/{app}/v/{slug}/...` (aqui o slug
  é `boi-criolo`); `/ponto/relogio` e `/ponto/app` redirecionam para a forma
  com slug.

**O que o manual afirma [afirmado pelo manual].** O cartão "Ponto Eletrônico"
(`mod-ponto`, 3 passos) do Manual diz: a batida é feita pelo `/ponto/app`; o
gestor aprova as justificativas; o fechamento mensal exporta eventos para a
folha. O botão "Abrir módulo" leva a `/ponto/app` → `/ponto/v/{slug}/app`. O
caminho de menu citado (Pessoas & RH › Ponto, 12 itens) bate com o sistema
atual. A exportação do ponto para a folha não foi testada. Conteúdo completo
do manual em [22-manual.md](22-manual.md).

**Plano [visto em outro módulo].** "Ponto Eletrônico" aparece na lista dos 36
módulos do plano Full; pela ordem da tela, a hipótese é que esteja entre os
módulos exclusivos do Full (ver
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).

**No BI [visto em outro módulo].** O painel executivo `/bi` tem o indicador
"Colaboradores no ponto" e o gráfico "horas extras do ponto em 30 dias" (ver
[01-dashboard-bi-tv.md](01-dashboard-bi-tv.md)).

### 1.1 Mapa do módulo (menu lateral e lançador) [visto]

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
| Cadastros & App | Carga Horária | `/carga-horarias` (fora do prefixo `/ponto`; tela no 08) |
| Cadastros & App | App Colaborador (PWA) | `/ponto/link` |
| Cadastros & App | Relógio de Ponto (Tablet) | `/ponto/relogio` |

### 1.2 Rotas e estado

| Rota | Nome | Estado |
|---|---|---|
| `/dashboard/modulo/ponto` | Lançador "Ponto Eletrônico" | lida |
| `/ponto/dashboard` (= `/ponto`) | Dashboard gestor | lida (sem dados) |
| `/ponto/espelho` | Espelho de ponto | parcial (filtro lido; consulta com ID 1 deu 404; grade não vista) |
| `/ponto/mapa` | Mapa de batidas | lida (sem marcadores) |
| `/ponto/auditoria` | Auditoria de batidas | lida (sem dados) |
| `/ponto/fechamento` | Fechamento mensal | lida (sem dados; "Processar" não clicado) |
| `/ponto/justificativas` | Justificativas | lida (sem dados) |
| `/ponto/config` | Configurações do ponto | lida, com os valores atuais |
| `/ponto/feriados` | Feriados | lida (sem dados) |
| `/ponto/locais` | Locais / geofence | lida (sem dados) |
| `/ponto/link` | Links dos apps (Android, relógio, PWA) | lida |
| `/ponto/relogio` → `/ponto/v/{slug}/relogio` | Relógio de ponto (tablet) | parcial: numa primeira passagem não foi aberto de propósito (câmera e risco de batida real); numa passagem posterior abriu e só a etapa de identificação foi vista; a leitura do código da página foi recusada |
| `/ponto/app` → `/ponto/v/{slug}/app` | PWA "Olimpia Ponto" | só login (o resto visto só na estrutura da página) |
| `/api/ponto/v1/v/{slug}` | API REST do app Android | não aberta (não é tela) |
| `/carga-horarias` (+`/create`) | Carga horária | lida — fica no 08 |
| `/pessoas/create` (aba Colaborador) | Cadastro do colaborador | lida — fica no 08 |

Recusas do filtro de segurança automático do Claude Code ("Third-Party
Attack"): ver [7. Pendências](#7-pendências).

### 1.3 Dependências em Pessoas (telas no 08) — resumo mínimo

As telas abaixo vivem em
[08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md). Aqui fica só o
necessário para entender o ponto [visto]:

- **Colaborador = pessoa.** O colaborador do ponto é a mesma pessoa do cadastro
  geral de Pessoas, com o tipo "Colaborador" marcado (uma pessoa pode ter vários
  tipos). O **"ID pessoa"** é o código usado no espelho, na auditoria e no login
  do PWA. Na aba Colaborador ficam, entre outros, tipo de contrato
  (CLT, PJ, Temporário), horas mensais, cargo e **carga horária** (lupas), PIS e
  a **senha do ponto** (definida pelo gestor no cadastro). Em
  `/pessoas?tipo=colaborador` a conta tem **0 colaboradores**.
- **Carga horária** (`/carga-horarias`, legado
  `FrmPessoa_Colaborador_Carga_horaria`): grade semanal de 7 dias × 4 horários
  (entrada, saída almoço, retorno almoço, saída), total do dia calculado, dia
  vazio = "Folga", "Hrs semanais" calculado (o modelo "Comercial padrão" dá
  44,00 h), caixa "Adicional noturno". Só modela **semana fixa com um
  intervalo**: não há 12x36, revezamento, jornada flexível nem intervalo
  pré-assinalado.

## 2. Telas

### 2.1 `/dashboard/modulo/ponto` — lançador do módulo [visto]

- Cabeçalho "Ponto Eletrônico" com "Voltar ao dashboard".
- Dois blocos de cartões, "Gestão" e "Cadastros & App", com os 12 itens da
  tabela 1.1.
- Não mostra indicadores.

### 2.2 `/ponto/dashboard` (= `/ponto`) — painel do gestor [visto]

- **Cabeçalho:** "Ponto Eletrônico", com o subtítulo "Dashboard gestor · REP-P /
  Portaria 671 · {mês/ano}" e a data de hoje.
- **Botões do cabeçalho:**
  - **Gerar feriados do ano** (envia formulário; não clicado);
  - **App colaborador** → `/ponto/link`;
  - **Relógio tablet** → `/ponto/relogio`;
  - **Espelho** → `/ponto/espelho`.
- **Alerta amarelo** quando o ano não tem feriados: avisa que, sem eles, o
  cálculo da jornada fica errado. Tem o botão **Gerar agora** (não clicado).
- **Filtro:** Competência (janeiro a dezembro), Ano (número) e Filtrar.
- **Quatro indicadores:** colaboradores ativos, batidas hoje, fora da geofence
  hoje e justificativas pendentes. Todos em 0.
- **"Últimas batidas":** vazia, com o botão "Ver no mapa". O rodapé mostra as
  horas extras do mês (em minutos) e quantos feriados o ano tem.
- **Atalhos:** Configurações, Mapa de batidas, Fechamento mensal,
  Justificativas, Feriados, Locais/Geofence e Carga horária.
- **Cartão "Feriados nacionais":** importa os feriados fixos e os móveis
  (Carnaval, Sexta-feira Santa, Corpus Christi) do ano informado. Tem campo de
  ano, botão **Gerar** (não clicado) e o link "Gerenciar feriados manualmente".
- `/ponto/dashboard` e `/ponto` mostram a mesma tela; o lançador
  `/dashboard/modulo/ponto` é outra coisa (só cartões).

### 2.3 `/ponto/espelho` — espelho de ponto [visto em parte]

- **Subtítulo:** o espelho junta as batidas do app e os ajustes de folga ou
  troca de escala; o colaborador bate o ponto normalmente.
- **Filtro:**
  - Colaborador: o **ID da pessoa**, número digitado (não há busca por nome);
  - Mês e Ano (números);
  - **Consultar**, que faz um GET com `?id_pessoa=&mes=&ano=`.
- **Teste com o ID 1:** a resposta foi uma página crua "404 NOT FOUND", porque a
  conta não tem colaborador. Não há mensagem amigável.
- **Não visto:** a grade do mês (colunas por dia, totais), os ajustes de folga
  ou troca de escala (como se incluem, desconsideram ou abonam marcações; se a
  marcação original continua guardada), assinatura do espelho pelo
  colaborador, impressão e exportação (PDF, planilha).
- A versão do espelho que o colaborador vê no PWA do Portal do Colaborador (um
  par entrada/saída por dia) está em
  [16-folha-colaborador.md](16-folha-colaborador.md).

### 2.4 `/ponto/mapa` — mapa de batidas [visto]

- **Filtro:** Início e Fim (datas; o padrão vai do dia 1 do mês até hoje) e
  Filtrar. Não há filtro por colaborador nem por local.
- **Mapa:** Leaflet com zoom + e −, sobre um mapa-base estilo OpenStreetMap
  (fornecedor não identificado), aberto sobre a América do Sul, sem marcadores
  (não há dados).
- **Não visto:** se desenha a cerca (raio) dos locais, se destaca batidas fora
  do local, o que aparece ao clicar num ponto.

### 2.5 `/ponto/auditoria` — auditoria de batidas [visto]

O menu chama a tela de "Auditoria de Fotos"; o título é "Auditoria de batidas".

- **Subtítulo técnico:** diz que as fotos ficam no próprio banco de dados (cita
  "BYTEA"), que as origens são o relógio tablet e o app, e mostra o período.
- **Botões:** Dashboard e Mapa GPS.
- **Quatro indicadores:** total no período, com foto, facial OK ("validação
  biométrica") e fora da geofence ("requer atenção").
- **Filtros:** De, Até, Colaborador (ID; vazio = todos), Origem (Todas, Relógio
  tablet, App PWA, Legado), a caixa "Somente com foto" e Filtrar.
- **Lista "Registros auditáveis"** (N batidas, página x de y): Data/hora,
  Colaborador, Origem, Foto, Facial, GPS e uma coluna de ação. Vazia.
- **Natureza da tela:** audita as **batidas** (prova de presença). Não é um
  histórico de alterações; o módulo **não tem tela de "quem alterou o quê"**
  (inclusão, desconsideração, abono, fechamento, reabertura, mudança de
  configuração).

### 2.6 `/ponto/fechamento` — fechamento mensal [visto]

- **Objetivo declarado:** consolidar HE 50%/100%, noturno, DSR, faltas e
  atrasos para exportar à folha.
- **Filtro:** Mês e Ano (números) e Filtrar. O botão **Processar** não foi
  clicado.
- **Tabela "Totais por colaborador":** Colaborador, Trabalhadas, HE 50%,
  HE 100%, Noturno, DSR, Faltas, Atrasos, Banco e Status. Vazia, com o aviso
  "Processe o fechamento para ver totais".
- **Não aparecem:** botão de exportar, de aprovar, de travar ou reabrir o
  período, nem os arquivos AFD/AEJ.
- **Ligação com a folha [visto em outro módulo]:** o assistente de
  processamento da folha só importa ponto de **fechamento aprovado** (ver
  [16-folha-colaborador.md](16-folha-colaborador.md)). Esta tela tem a coluna
  Status, mas nenhum botão de aprovação apareceu (sem dados). Não se sabe como
  o fechamento passa a "aprovado".
- O dashboard da folha (`/folha`) tem um atalho "Fechamento de ponto" para esta
  tela e mostra "Horas extras (min)" e "Faltas no mês" vindos do fechamento.

### 2.7 `/ponto/justificativas` — justificativas [visto]

- **Filtro de status:** Pendente (padrão), Aprovado, Rejeitado, Todos.
- **Colunas:** Colaborador, Data, Tipo, Motivo, Status e Ação. Vazia.
- **Origem:** o colaborador envia pelo PWA do ponto (aba "Justificar", com data,
  tipo Falta/Atraso/Ajuste/Outro e motivo). Nenhum campo de anexo (atestado)
  foi visto.
- **Estados:** pendente → aprovado ou rejeitado.
- As ações de aprovar ou rejeitar não foram vistas (não havia nenhuma
  justificativa).
- [deduzido] Há um segundo canal parecido: as "Solicitações RH" do Portal do
  Colaborador têm o tipo "Ajuste de ponto" e "Atestado" (ver
  [16-folha-colaborador.md](16-folha-colaborador.md)). Não se sabe se os dois se
  comunicam.

### 2.8 `/ponto/config` — configurações do ponto [visto, com os valores atuais]

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

- O botão "Salvar configurações" não foi clicado. A configuração é **única por
  empresa**.
- **Não existem nesta tela:** percentuais de hora extra; regra de DSR;
  tolerância para saída antecipada; regra dos 5/10 minutos por marcação;
  prazo de compensação do banco de horas; intervalo mínimo; descanso mínimo
  entre jornadas; local de armazenamento das fotos.
- **Onde estão os percentuais [visto em outro módulo]:** HE 50%, HE 100% e
  adicional noturno (padrão 20%), além de "descontar faltas", "descontar
  atrasos" e "integrar banco de horas", estão nas Configurações da folha
  (`/folha/config`, ver [16-folha-colaborador.md](16-folha-colaborador.md)).
- O subtítulo do relógio tablet sugere que o local de armazenamento da foto é
  configurável, mas esta tela não tem esse campo (a confirmar).

### 2.9 `/ponto/feriados` — feriados [visto]

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
- Não se sabe se o cálculo dos móveis é interno ou vem de um serviço externo.

### 2.10 `/ponto/locais` — locais e geofence [visto]

- **Formulário lateral:** Descrição (texto), Latitude (número), Longitude
  (número), Raio em metros (número, padrão 200) e Cadastrar (não clicado).
- **Lista:** Descrição, Lat, Lng, Raio e uma ação. Vazia.
- **Limitações:** as coordenadas são digitadas à mão, sem mapa, sem busca de
  endereço e sem "usar minha localização". Não há ligação visível entre local e
  colaborador.
- O raio existe em dois lugares (padrão em `/ponto/config` e um por local), sem
  dizer qual vale.

### 2.11 `/ponto/link` — links dos apps [visto]

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

- **O link é um só por empresa** (pelo slug). Não há como gerar, renovar ou
  revogar o link, nem link individual por colaborador.
- [deduzido] O app Android parece servir a vários módulos (o QR leva o campo
  `module`).
- No menu, este item chama-se "App Colaborador (PWA)". Não confundir com o PWA
  do **Portal do Colaborador** (`/colaborador/app`, no 16): são dois apps
  diferentes para a mesma pessoa.

### 2.12 `/ponto/relogio` → `/ponto/v/{slug}/relogio` — relógio de ponto (tablet) [visto em parte]

- **Redirecionamento:** `/ponto/relogio` vai para `/ponto/v/boi-criolo/relogio`.
  Cada empresa tem um endereço próprio do terminal, pelo slug.
- **Objetivo:** modo quiosque (tablet na entrada da loja). O colaborador se
  identifica e bate o ponto com foto.
- **Layout:** tela escura, **sem o menu do ERP**. Barra superior com título,
  subtítulo indicando o modo "terminal tablet", que a foto fica guardada no
  banco de dados, e o nome da empresa. À direita, relógio grande ao vivo
  (HH:MM:SS) e data por extenso.

**Etapa 1 — Identificação** (painel visível)

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Código do colaborador | número (`type=number`), placeholder "Ex.: 1234" | sim (implícito) | código curto, não CPF ([deduzido] o mesmo ID da pessoa do PWA) |
| Senha de ponto | senha numérica (PIN) | sim (implícito) | senha própria do ponto, separada do login do ERP |
| Continuar | botão | — | valida código e senha e passa para a câmera |

Rodapé: depois de registrar, a tela volta sozinha para o próximo colaborador.

**Etapa 2 — Registrar batida** (painel oculto até a identificação; visto só na
estrutura da página)

- Crachá com o **nome e o código** do colaborador identificado e o botão
  **Cancelar** (volta para a identificação).
- Instrução para posicionar o rosto num círculo e confirmar a foto.
- Caixa de câmera: vídeo ao vivo, aviso "Iniciando câmera…", **anel de
  enquadramento do rosto** e uma área de captura (a foto tirada).
- Botão **"Registrar ponto com foto"**, **desabilitado até a câmera ficar
  pronta**. Não há outro botão: sem câmera, não há batida.

**Etapa 3 — Confirmação:** tela cheia de sucesso ("Ponto registrado!") com a
hora da marcação. Um aviso flutuante (*toast*) mostra erros.

**Regras e comportamento observados ou deduzidos pela interface**

- Identificação por **código + PIN**. Não há crachá, QR nem leitura de CPF.
- **Foto obrigatória** em cada batida, guardada no banco.
- **O tipo de batida não aparece** (entrada, saída, intervalo). [deduzido] O
  sistema deduz a sequência sozinho.
- Na tela, o comprovante é só a mensagem de sucesso com a hora. Não se viu
  comprovante para baixar ou receber.
- Não se viu modo offline nem fila de sincronização.
- O anel sugere validação ou cadastro facial. **Não confirmado.**
- O campo de código é `number`: aparecem setinhas e zeros à esquerda somem.
  Não há teclado numérico desenhado na tela.
- **Não testado:** não foram digitados código nem senha e a câmera não foi
  aberta. A leitura do código da página (comportamento interno) foi recusada
  pelo filtro do Claude Code.

### 2.13 `/ponto/app` → `/ponto/v/{slug}/app` — PWA "Olimpia Ponto" [visto em parte]

- **Redirecionamento [visto]:** `/ponto/app` (destino do botão "Abrir módulo"
  do Manual) vai para `/ponto/v/{slug}/app`.
- **Tela de entrada [visto]:** Código colaborador (número), Senha ponto (senha)
  e Entrar. Não foi feito login (vista duas vezes, em passagens diferentes, com
  o mesmo resultado).
- **O que vem depois do login** aparece na estrutura já carregada da página
  [código] (não usado):
  - nome do colaborador e Sair;
  - abas **Ponto, Espelho, Banco e Justificar**;
  - relógio ao vivo com a data e o botão **Registrar ponto**;
  - aviso "Obtendo localização…" (usa o GPS do aparelho);
  - "Espelho do mês";
  - "Banco de horas", com saldo em minutos;
  - formulário de justificativa: data, tipo (Falta, Atraso, Ajuste, Outro),
    motivo e Enviar.
- Nenhum elemento de câmera apareceu na estrutura. Pode surgir na hora da
  batida (a verificar), sobretudo com "Facial obrigatório" ligado.
- Não há "esqueci a senha" nem primeiro acesso: a senha é a que o gestor grava
  no cadastro da pessoa.

### 2.14 `/api/ponto/v1/v/{slug}` — API REST do app Android [deduzido]

- Não é tela e não foi aberta. Só se conhece pela tela `/ponto/link`: é a URL
  que o app Android "Olimpia" recebe no QR (junto com `pwa`, `relogio`,
  `tenant`, `codigo` e `nome`).
- Endpoints, autenticação e formato: não vistos.

## 3. Fluxos de ponta a ponta

Os passos marcados [deduzido] não foram vistos funcionando, porque a conta não
tem dados.

1. **Implantação do ponto (gestor).**
   - Configurações: fuso, modo da geofence, raio, tolerância, faixa noturna,
     GPS e facial obrigatórios.
   - Locais: latitude, longitude e raio.
   - Carga horária: grade semanal (ver 08).
   - Pessoas: marcar o tipo Colaborador e preencher contrato, PIS, carga
     horária e senha do ponto (ver 08).
   - Feriados: gerar os nacionais e cadastrar os municipais e os da empresa.
   - Links: enviar o link ou QR do PWA ao colaborador, deixar o relógio em tela
     cheia num tablet, ou configurar o app Android pelo QR.
2. **Batida pelo celular (PWA).**
   - O colaborador abre o link e entra com código e senha [visto: tela de
     login].
   - Na aba Ponto, toca em Registrar ponto e o app obtém a localização.
   - [deduzido] O servidor compara a posição com o raio dos locais. No modo
     aviso, registra e marca "fora da geofence"; no modo bloqueio, recusa.
   - [deduzido] Com "facial obrigatório", tira foto e faz validação facial.
   - A batida aparece em "Últimas batidas", no mapa, na auditoria (origem "App
     PWA") e no espelho.
3. **Batida no relógio (tablet).** O tablet fica fixo com a URL do relógio. O
   colaborador digita código e PIN → a câmera abre → foto → "Ponto
   registrado!" → a tela volta para o próximo. A batida entra com origem
   "Relógio tablet" e vai para o espelho e, no fim do mês, para o fechamento.
4. **Ocorrência (falta, atraso ou ajuste).**
   - O colaborador envia a justificativa no PWA do ponto.
   - Ela aparece como pendente no painel e em Justificativas.
   - O gestor aprova ou rejeita [afirmado pelo manual: "o gestor aprova
     justificativas"].
   - [deduzido] A aprovação abona ou ajusta o dia no espelho e no fechamento.
5. **Fechamento do mês.**
   - O gestor confere o espelho de cada colaborador (ID, mês e ano) e ajusta
     folgas e trocas de escala (a verificar).
   - Em Fechamento, escolhe mês e ano e clica em Processar.
   - Saem os totais por colaborador: trabalhadas, HE 50%/100%, noturno, DSR,
     faltas, atrasos, banco e status.
   - O fechamento **aprovado** é importado pelo processamento da folha, junto
     com o banco de horas (ver 16) [visto na folha; afirmado pelo manual:
     "exporta eventos para a folha"; mecânica não testada].
   - Na folha, as rubricas ligam-se às ocorrências do ponto pelo campo "Código
     ponto" (ex.: HE50, FALTA); na conta, nenhuma rubrica tem esse código
     preenchido (ver 16).

## 4. Entidades e relações

| Entidade | Campos observados | Relações |
|---|---|---|
| Pessoa / Colaborador (tela no 08) | ID pessoa; tipo colaborador; tipo de contrato; horas mensais; cargo; carga horária; PIS; senha do ponto; situação (ativo, afastado, demitido — vista na folha) | N:1 Carga horária; 1:N Batida; 1:N Justificativa; 1:N Fechamento |
| Carga horária (tela no 08) | descrição; status; horas semanais (calculadas); adicional noturno; grade de 7 dias × (entrada, saída almoço, retorno almoço, saída) | 1:N Colaborador |
| Configuração do ponto | fuso horário; modo da geofence; raio padrão; tolerância de atraso; limite do banco/mês; início e fim do noturno; GPS obrigatório; facial obrigatório; calcular adicional noturno | 1:1 Empresa |
| Local (geofence) | descrição; latitude; longitude; raio (m) | N:1 Empresa; [deduzido] cada batida é comparada com os locais |
| Feriado | data; descrição; tipo (nacional/municipal/empresa); recorrente anual | N:1 Empresa; entra no cálculo (HE 100%, DSR — a verificar) |
| Batida (marcação) | data/hora; colaborador; origem (relógio tablet, App PWA, legado); foto (guardada no banco); resultado facial; GPS; fora da geofence | N:1 Colaborador; [deduzido] N:1 Local |
| Justificativa | colaborador; data; tipo (falta/atraso/ajuste/outro); motivo; status (pendente/aprovado/rejeitado) | N:1 Colaborador; decidida por um gestor |
| Ajuste do espelho | folga; troca de escala (citados no subtítulo) | N:1 Colaborador × dia (a verificar) |
| Fechamento mensal | colaborador; competência (mês/ano); trabalhadas; HE 50%; HE 100%; noturno; DSR; faltas; atrasos; banco; status (a folha só importa o "aprovado") | N:1 Colaborador; alimenta a Folha (ver 16) |
| Banco de horas | saldo em minutos; limite mensal | por colaborador; aparece no PWA e no fechamento; importado pela folha |
| Tenant (empresa) | slug; código "T000…"; nome | dá a base das URLs do PWA, do relógio e da API e o conteúdo do QR |

## 5. Integrações

| Integração | Onde aparece | Situação |
|---|---|---|
| Leaflet e um mapa-base estilo OpenStreetMap | mapa de batidas | [visto]; fornecedor dos mapas não identificado |
| GPS do aparelho (geolocalização do navegador) | PWA ("Obtendo localização…"), "GPS obrigatório" | [visto] |
| Câmera e reconhecimento facial | relógio (foto obrigatória), auditoria ("Facial OK"), "Facial obrigatório" | serviço de reconhecimento não identificado; fotos guardadas no próprio banco |
| App Android "Olimpia" com API REST `/api/ponto/v1` | `/ponto/link` (QR com JSON) | [visto]; o app parece servir a vários módulos |
| QR code e PWA instalável | `/ponto/link` | [visto] |
| Módulo Folha (interno) | fechamento "para exportar à folha"; folha importa fechamento aprovado e banco de horas; `/folha/config` tem percentuais de HE e noturno e regras de faltas/atrasos | [visto] dos dois lados; a passagem de dados não foi testada (ver 16) |
| BI executivo | indicador "Colaboradores no ponto" e gráfico de horas extras em 30 dias (ver 01) | [visto] |
| Calendário de feriados móveis | gerar feriados | cálculo interno ou serviço externo: a verificar |
| **Não vistos** | AFD e AEJ (Portaria 671), comprovante da marcação, eSocial, envio por e-mail ou WhatsApp, relógio físico (REP-C) com importação de AFD, modo offline | a verificar |

## 6. Oportunidades de UX

1. **O espelho exige digitar o ID numérico da pessoa** e devolve uma página "404"
   crua quando o ID não serve.
   [proposta] Lista de colaboradores com busca por nome, foto e situação do dia,
   e estado vazio explicativo.
2. **Locais sem mapa:** latitude e longitude digitadas à mão.
   [proposta] Escolher no mapa ou por endereço, com o círculo do raio desenhado e
   "usar minha localização atual".
3. **Raio em dois lugares** (padrão nas configurações e um por local), sem dizer
   qual vale.
4. **"Auditoria de Fotos" (menu) e "Auditoria de batidas" (título) são a mesma
   tela**, e não é auditoria de alterações. Não existe trilha de quem incluiu,
   desconsiderou ou abonou uma marcação.
   [proposta] Guardar sempre a marcação original e um histórico de cada
   tratamento, com motivo e autor. Pela Portaria 671 (conhecimento geral, a
   verificar) a marcação original não pode ser alterada.
5. **O painel diz "REP-P / Portaria 671"**, mas nenhuma tela mostrou AFD, AEJ,
   comprovante de marcação ou atestado técnico.
   [proposta] Se formos fazer ponto, tratar a conformidade como parte do
   produto, não como etiqueta.
6. **Botões que gravam, repetidos e diretos.** "Gerar feriados" aparece três
   vezes no painel e outras três na tela de feriados. "Processar" fica solto no
   fechamento. Não foram clicados, por isso não se sabe se pedem confirmação.
   [proposta] Uma lista de implantação (configurar → locais → jornada →
   colaboradores → feriados → links) com progresso, e uma prévia antes de
   fechar o mês.
7. **Fechamento opaco.** Não diz que regra gera HE 50% ou 100% nem como calcula
   DSR e banco (a configuração do ponto não tem percentuais nem prazos; os
   percentuais estão noutro módulo, na folha). Também não mostra como exportar,
   aprovar, travar ou reabrir.
   [proposta] Regras visíveis e configuráveis num só lugar, prévia por
   colaborador, travamento com reabertura auditada e exportação clara para a
   folha.
8. **Configurações rasas e unidades confusas.** O "limite do banco de horas por
   mês" está em minutos com casas decimais, o fuso é texto livre e não há regras
   de intervalo, interjornada, 5/10 minutos nem compensação.
9. **Justificativa sem anexo:** não há foto do atestado e só existem 4 tipos.
   [proposta] Anexo, motivos configuráveis (abona ou não) e cuidado de LGPD com
   atestados (dado de saúde, dado pessoal sensível — LGPD art. 5º, II).
10. **Feriados sem o tipo estadual** e sem ligação a filial.
    [proposta] Carregar sozinho os nacionais, os de RO e os de Porto Velho, e
    permitir feriado por loja.
11. **Carga horária (no 08): ponto positivo.** Os modelos rápidos e o total
    semanal calculado são bons e vale copiar. Mas só cobre semana fixa.
12. **Acesso do colaborador frágil e técnico.**
    - O link é um só por empresa; o login é um código numérico e uma senha
      definida **pelo gestor** no cadastro (o gestor conhece a senha).
    - Não há renovar ou revogar o link.
    - A tela de links mostra JSON e URL de API para um dono de restaurante.

    [proposta] Convite individual (WhatsApp) e senha criada pelo próprio
    colaborador no primeiro acesso, com limite de tentativas, aparelho
    autorizado e QR sem jargão.
13. **Vários logins e dois apps para a mesma pessoa.** Cada PWA do ERP tem o seu
    login: ponto (código + senha de ponto), Portal do Colaborador (CPF + senha),
    garçom (empresa + usuário + senha), entregador (telefone + PIN). O manual não
    explica quem cria essas credenciais nem onde.
    [proposta] Um acesso só para a equipe da loja (garçom, entregador, ponto),
    com perfil e PIN, gerido numa tela "Equipe"; um app só do colaborador com
    bater ponto, holerite, pedidos e avisos.
14. **Relógio tablet:** campo `number` para o código (setinhas, zeros à esquerda
    somem), sem teclado numérico na tela, sem tipo de batida, sem comprovante e
    sem alternativa se a câmera falhar.
    [proposta] Teclado grande na tela, mostrar a última batida e a próxima
    esperada, **comprovante** por QR, e-mail ou WhatsApp (a Portaria MTP
    671/2021 exige comprovante disponível ao trabalhador; confirmar o formato
    com o jurídico) e fila offline.
15. **Navegação duplicada.** Lançador, painel com atalhos e menu lateral com
    todos os módulos do ERP.
    [proposta] Menu montado só com os módulos que o cliente usa.
16. **Detalhe técnico útil para o nosso modelo.** O código de "Ativo" é
    invertido entre telas do ERP: vale 0 no grupo tributário (ver
    [13-fiscal.md](13-fiscal.md)) e 1 na carga horária e em pessoas. Mostra falta
    de padrão no modelo de dados.
    [proposta] Status com enum e nome explícito.
17. **Biometria (rosto) é dado pessoal sensível** (LGPD art. 5º, II): nenhuma
    tela vista pede consentimento ou informa a finalidade.

## 7. Pendências

**Recusas e limites desta exploração.** Todas as rotas da secção 1.2 abriram
com a sessão já ativa (não foi problema de credencial). O filtro de segurança
automático do Claude Code (classificador do modo automático, motivo
"Third-Party Attack") recusou a **leitura do código da página do relógio
tablet**; a recusa foi respeitada, sem outro caminho. Numa tentativa anterior
do mesmo dia, o filtro tinha recusado abrir `/ponto/dashboard` e nenhuma rota
foi aberta; isso ficou superado pelas passagens seguintes. Completar o que
falta depende de o dono da conta autorizar a leitura. Nada foi gravado,
clicado em ações que gravam, ou enviado no ERP.

**Ações vistas e NÃO clicadas (gravam algo):**

- Salvar configurações (ponto);
- Gerar feriados do ano, Gerar agora e Gerar (feriados);
- Cadastrar (feriado, local);
- Processar (fechamento);
- Enviar e Registrar ponto (PWA); Continuar e "Registrar ponto com foto"
  (relógio);
- aprovar ou rejeitar justificativa (não havia nenhuma).

**O que ficou por ver:**

1. **O ponto com dados.** A conta tem 0 colaboradores e nenhuma batida,
   justificativa, feriado ou local. Ficaram sem ver: a grade do espelho, os
   marcadores do mapa, as linhas da auditoria (foto, facial, GPS), os totais do
   fechamento e as ações de aprovar ou rejeitar justificativa. Criar dados de
   teste seria gravar. Para ver, alguém precisa cadastrar um colaborador de
   teste e algumas batidas.
2. **Relógio tablet depois da identificação:** câmera, reconhecimento facial,
   tipo de batida, comprovante, modo offline, e se
   `/ponto/v/{slug}/relogio` funciona sem login do ERP no tablet.
3. **PWA depois do login:** as abas só foram vistas na estrutura da página. Se
   a câmera aparece na batida.
4. **API `/api/ponto/v1/v/{slug}`:** endpoints e autenticação.
5. **Regras de cálculo a confirmar:**
   - o que define HE 50% e HE 100% (domingo? feriado? passou de X horas?);
   - como calcula o DSR;
   - se aplica a hora noturna reduzida de 52min30s (CLT art. 73) e o
     adicional;
   - como funciona o limite do banco de horas e o prazo de compensação (CLT
     art. 59: no mesmo mês, até 6 meses por acordo individual escrito, até 1 ano
     por acordo ou convenção coletiva — conhecimento geral);
   - se a tolerância de 5 minutos vale por marcação ou por dia (CLT art. 58,
     §1º: 5 por marcação, no máximo 10 por dia — conhecimento geral);
   - se há alertas de interjornada menor que 11 h (CLT art. 66) e de intervalo
     fora das regras do art. 71;
   - se a geofence usa o raio do local ou o padrão; se o colaborador fica
     preso a um local;
   - quem faz o reconhecimento facial;
   - se o relógio funciona sem internet;
   - como o fechamento passa a "aprovado" e como é a exportação para a Folha
     (formato);
   - se existem AFD, AEJ e comprovante;
   - como um feriado muda o cálculo (trabalho em feriado sem folga
     compensatória é pago em dobro — Lei 605/1949, art. 9º, conhecimento geral).
6. **Conformidade com a Portaria 671 (perguntas):** se a marcação original fica
   guardada e visível depois de um ajuste; se o sistema restringe a marcação,
   marca automaticamente ou exige autorização prévia para hora extra (vedado
   pela portaria — conhecimento geral); se mostra registro do programa no INPI,
   atestado técnico ou termo de responsabilidade.
7. **Perfis de acesso:** que perfis aparecem (dono, gestor, RH, o próprio
   colaborador) e o que cada um vê ou muda; quem consegue ver fotos e
   (futuros) anexos de atestado.
8. **Espelho:** assinatura do espelho pelo colaborador, impressão e exportação.
9. **Justificativas × Solicitações RH:** se os dois canais (PWA do ponto e Portal
   do Colaborador) se ligam.
10. **Comprovante da marcação:** como o colaborador recebe (tela, e-mail,
    WhatsApp, download).

## 8. Sub-rotas descobertas

| Rota | Origem | Situação |
|---|---|---|
| `/ponto` | igual a `/ponto/dashboard` | lida |
| `/ponto/espelho?id_pessoa=&mes=&ano=` | botão Consultar | testada com ID 1 → 404 cru |
| `/ponto/v/{slug}/relogio` | redirecionamento de `/ponto/relogio`; cartão em `/ponto/link` | identificação vista |
| `/ponto/v/{slug}/app` | redirecionamento de `/ponto/app`; cartão em `/ponto/link`; Manual | login visto |
| `/api/ponto/v1/v/{slug}` | cartão "Conectar app Android" | não aberta |
| `/carga-horarias`, `/carga-horarias/create` | item do menu do ponto | lidas — ver 08 |
