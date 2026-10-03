# 914 — Lacunas, lote 15: benefícios e configurações da folha, Portal do Colaborador, assinatura eletrônica e Consultoria Gestão 360° (ERP Olímpia)

> **Estado: explorado (12 de 12 rotas abertas e lidas).** Data: 2026-10-03.
> Conta de teste "Boi Criolo" (plano Full), com a sessão já aberta no navegador
> embutido.
>
> - **Limite principal:** a conta não tem nenhum registo nestes módulos. São 0
>   benefícios, 0 comunicados, 0 solicitações, 0 documentos para assinatura,
>   0 projetos, 0 diagnósticos e 0 problemas. Por isso as listas só foram vistas
>   vazias. Colunas de ação, telas de detalhe e mudanças de estado não puderam
>   ser vistas, porque criar registos de teste é proibido.
> - **Uma leitura extra, fora do lote, foi recusada.** Ao tentar ler a estrutura
>   de `/consultoria/acoes` (rota irmã, não listada), a trava automática do
>   Claude Code recusou a ação. Motivo indicado: "Third-Party Attack". A
>   exploração parou aí, sem nova tentativa. As outras rotas irmãs também não
>   foram abertas.
>
> Marcação usada: **[visto]** apareceu na tela, na estrutura da página ou no
> script da própria página; **[deduzido]** conclusão direta do que foi visto;
> **[a verificar]** hipótese ou conhecimento geral, não confirmado no ERP.

## Em palavras simples

1. **As 12 telas pedidas abriram, já logadas.** Deu para ler todos os campos,
   botões, filtros e opções.
2. **As telas estão vazias nesta conta de teste.** Não há benefícios,
   comunicados, pedidos de colaboradores, documentos para assinar nem projetos
   de consultoria. Por isso não deu para ver, por exemplo, o botão "aprovar"
   de uma solicitação: ele só aparece quando há uma solicitação na lista.
3. **O app do colaborador pede login (CPF ou código e senha).** Não foi digitada
   nenhuma senha. As telas que ficam depois do login foram descritas a partir do
   próprio código público da página, que mostra o que o app exibe (holerites,
   espelho de ponto, pedidos e avisos).
4. **No fim, a trava de segurança do Claude Code disse "não" uma vez.** Foi numa
   tela extra (Plano 30/60/90), fora da lista deste lote. Quando a trava diz
   "não", o agente para. Por isso as telas Reuniões, IA Advisor e Relatório
   executivo ficaram por abrir. Liberar ou não é decisão sua.
5. **Nada foi gravado, enviado ou alterado no ERP.**

## Registo técnico

- Aba própria no navegador embutido (`tab-47`). A aba do utilizador e as outras
  abas não foram tocadas. A `tab-47` foi fechada no fim.
- Leitura feita com o texto da página, a árvore de acessibilidade e a inspeção
  do DOM (formulários, nomes de campos, obrigatoriedade, limites e opções de
  cada select).
- No Portal do Colaborador (`/colaborador/app`) também foram lidos o script
  público da própria página (`/js/colaborador-pwa.js`) e o `manifest.json`.
  Assim deu para entender as telas que só aparecem depois do login. Nenhum
  endpoint de dados foi chamado diretamente e não houve login.
- **Não foram clicados:** "Salvar benefício", "Atribuir", "Salvar
  configurações", "Entrar" (PWA), "Publicar", "Criar documento", "Novo
  diagnóstico" (botão que cria o registo na hora, sem formulário), "Salvar" dos
  formulários de projeto e problema, nem os botões "Adicionar aos atalhos" dos
  lançadores.
- Os formulários "Novo projeto" e "Novo problema" foram abertos pela URL
  `/criar` e abandonados sem gravar.
- Os valores de conta bancária, CNPJ e token de segurança da página não foram
  registados. Do bloco bancário só se anotou se o campo estava preenchido.
  A exceção é o código do banco (341), que é público.
- **Recusa:** leitura por script dos formulários e links de `/consultoria/acoes`
  (rota irmã, fora do lote). Antes da recusa só se tinha lido o texto visível
  da página. Esse texto entra na secção 2.13, sem aprofundar.

---

## 1. Visão geral

Este lote junta três blocos que, no ERP, ficam em grupos de menu diferentes.

### 1.1 Folha / RH: as duas telas que faltavam

- **Benefícios [visto]:** cadastro de regras de vale (VT, VR, VA ou outro) e
  atribuição a cada colaborador. A própria tela avisa que o desconto
  percentual entra sozinho na folha mensal.
- **Configurações da folha [visto]:** um registo por empresa. Guarda sindicato
  e convenção, piso salarial, percentuais de hora extra e de adicional noturno,
  dia de pagamento, regras ligadas ao ponto (descontar faltas e atrasos,
  integrar banco de horas), ligação ao financeiro e dados da remessa bancária
  CNAB 240 para pagar salários.
- **Menu lateral do grupo "Folha" [visto]:** Dashboard, Processamento,
  Competências, Holerites, Relatórios, Ficha Financeira, Férias e 13º, Rescisão,
  Eventos da Folha, Departamentos / CC, Benefícios e Configurações.

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
  Solicitações RH e Documentos Assinatura.
- **Outro app, outro menu [visto]:** o grupo do Ponto tem um item "App
  Colaborador (PWA)" que leva a `/ponto/link`. Ou seja, há dois PWAs para o
  colaborador: o do ponto e o deste portal.

### 1.3 Consultoria: Gestão 360°

- **O que é [deduzido]:** a metodologia de consultoria da própria Olímpia,
  embutida no ERP. O projeto tem um "produto" com três opções comerciais
  (Diagnóstico, Gestão 90 dias e Gestão contínua) e as "3 dores" do cliente.
- **Ciclo [visto + deduzido]:** projeto → diagnóstico IOG (questionário por
  área, ou primeira análise feita pela IA "Advisor" com os dados do ERP) →
  problemas priorizados por impacto, urgência e facilidade → plano de ação
  30/60/90 com metas → reuniões → relatório executivo. Um painel junta KPIs do
  ERP, o IOG por área e o andamento do plano.
- **IA [visto]:** a análise automática exige uma chave da OpenAI cadastrada no
  "Super Admin" (Integrações → OpenAI Advisor). É uma configuração da
  plataforma, não da empresa cliente.
- **Menu lateral "Consultoria" [visto]:** Painel Gestão 360°, Projeto,
  Diagnóstico IOG, Problemas, Plano 30/60/90, Reuniões, IA Advisor e Relatório
  executivo.

### 1.4 Elementos globais vistos de passagem

- **Barra superior [visto]:** busca de telas (Ctrl+K), atalhos de módulos,
  "Melhorias e ajustes do sistema", escolha de tema, notificações, menu do
  utilizador e um botão "Abrir assistente" (assistente de IA, não explorado).
- **Modais globais de aviso, presentes em todas as páginas [visto]:**
  - novo pedido registado pelo "Agente de Vendas IA" no WhatsApp;
  - nova venda da loja virtual;
  - notificação do cardápio digital (mesa);
  - cliente assinou eletronicamente uma OS, com link de comprovante;
  - nova venda do Mercado Livre.
  O aviso do cardápio funciona por consulta periódica e toca um som.
- **Componente de pesquisa reutilizável [visto]:** modal "Pesquisar" com busca,
  paginação, seleção múltipla e "Cadastrar novo", mais um modal de "Cadastro
  rápido" que já devolve o registo selecionado. É usado no campo "Responsável
  interno" do projeto (tipo `pessoa_colaborador`).
- **Tecnologia [visto]:** Laravel (nomes de rota como
  `folha.beneficios.index` e `colaborador.admin.solicitacoes.index`, token CSRF
  e `_method=PUT`), Bootstrap 5 com Bootstrap Icons, formulários renderizados no
  servidor (POST seguido de redirecionamento) e Cloudflare.

---

## 2. Telas

### 2.1 `/folha/beneficios` — Benefícios VT / VR / VA [visto]

**Objetivo:** cadastrar tipos de vale e ligá-los aos colaboradores, para o
desconto cair na folha mensal.

**Indicadores no topo (4 cartões):** Benefícios, Ativos, Atribuições e Valor
médio (R$ padrão). Todos estavam a 0.

**Layout:** uma tela só, com quatro cartões: formulário de novo benefício,
formulário de atribuição, tabela "Cadastro" e lista "Atribuições ativas" (com
contador). Não há filtros nem busca.

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
  mensal. Logo, o processamento da folha lê as atribuições ativas.
- **Padrão de 6% [deduzido]:** coincide com o teto legal de desconto do
  vale-transporte (6% do salário-base, Lei 7.418/1985) [a verificar]. A tela
  não diz sobre que base o percentual incide (salário ou valor do benefício),
  nem se há limite ao valor do benefício.
- **Valor por colaborador [visto]:** a atribuição pode ter valor próprio.
  Senão, herda o padrão.
- **Ativo / inativo [deduzido]:** o KPI "Ativos" e o título "Atribuições
  ativas" indicam que benefícios e atribuições podem ser desativados. Os
  controlos para isso não apareceram com a lista vazia.
- **Sem cálculo de VT por dias úteis [visto: ausência]:** não há campos de dias,
  viagens ou tarifa. O valor é fixo.

### 2.2 `/folha/config` — Configurações da folha [visto]

**Objetivo:** parametrizar a folha de cada empresa. É um formulário único
(PUT `/folha/config`), sem lista. Nenhum campo é obrigatório.

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
| Agência (`cnab_agencia`) + Díg. (`cnab_agencia_digito`) | texto; dígito com 1 carácter | — |
| Conta (`cnab_conta`) + Díg. (`cnab_conta_digito`) | texto; dígito com 1 carácter | — |
| Convênio (`cnab_convenio`) | texto | — |
| CNPJ empresa (remessa) (`cnab_cnpj`) | texto | sem máscara nem validação no cliente |
| Sequencial arquivo (`cnab_sequencial`) | número, mínimo 1 | 1 |

Botão: "Salvar configurações".

**Regras e comportamento:**

- **Ligação ao ponto [deduzido]:** as três caixas de seleção dizem que o cálculo
  da folha lê o ponto eletrônico (faltas, atrasos e saldo do banco de horas).
- **Percentuais de HE e adicional noturno por empresa [visto]:** os padrões
  (50%, 100% e 20%) batem com os mínimos legais e o costume [a verificar].
  Servem de base para os eventos de hora extra e adicional noturno.
- **Dia de pagamento de 1 a 28 [visto]:** o teto 28 garante que o dia existe em
  todos os meses. É um dia do calendário, não o "5º dia útil" da CLT
  [deduzido].
- **Integração com o financeiro [deduzido]:** ao fechar a folha, o sistema deve
  lançar contas a pagar para o "fornecedor salários", classificadas nas contas
  de salários e de encargos.
- **CNAB 240 [deduzido]:** a remessa paga cada colaborador por crédito em conta.
  O "Sequencial arquivo" numera as remessas e deve subir a cada arquivo gerado.
  O botão que gera a remessa não está nesta tela (provavelmente em
  Processamento ou Holerites) [a verificar].
- **O que não está aqui [visto: ausência]:** tabelas de INSS, IRRF e
  salário-família, salário mínimo, dados do eSocial/FGTS Digital e
  sindicalização por colaborador. Não se sabe onde vivem (talvez em "Eventos da
  Folha") [a verificar].

### 2.3 `/dashboard/modulo/colaborador` — lançador do Portal do Colaborador [visto]

- Título "Portal do Colaborador" e link "Voltar ao dashboard".
- **Grupo "Acesso":** PWA Colaborador (`/colaborador/app`), Comunicados
  (`/colaborador-admin/comunicados`) e Solicitações RH
  (`/colaborador-admin/solicitacoes`).
- **Grupo "Assinatura":** Documentos Assinatura (`/assinatura-admin`).
- Cada atalho tem um botão "Adicionar aos atalhos", que fixa a tela na barra
  pessoal do utilizador (não foi clicado).

### 2.4 `/colaborador/app` — PWA do colaborador [visto]

**Endereço:** redireciona para `/colaborador/v/boi-criolo/app`. Cada empresa
tem um slug no caminho. Título da página: "Portal Colaborador".

**PWA [visto]:**

- `manifest.json` próprio por empresa: nome "Portal Colaborador", nome curto
  "Colaborador", abre em ecrã cheio (standalone), na vertical, em pt-BR, com
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

**Regras do login [visto no script]:**

- Envia `login`, `senha`, `id_empresa`, mais o navegador do aparelho
  (`dispositivo`, até 180 caracteres) e a `plataforma`. Ou seja, o sistema
  guarda de que aparelho o colaborador entrou.
- Recebe um token e os dados do colaborador e guarda os dois no armazenamento
  local do navegador. As chamadas seguintes usam "Bearer token".
- Se a API responder "Sessão" ou "Token", volta à tela de login.
- "Sair" chama o logout na API e limpa o armazenamento local.
- Não há "esqueci a senha" nem primeiro acesso nesta tela. Não se sabe quem
  cria a senha do colaborador [a verificar].

**API usada pelo PWA [visto no script]** (base
`/api/colaborador/v1/v/{slug}`):

| Método e caminho | Para quê |
| --- | --- |
| GET `/empresas` | lista de empresas para o login |
| POST `/login`, POST `/logout` | sessão |
| GET `/dashboard` | resumo da tela inicial |
| GET `/holerites`, GET `/holerites/{id}` | lista e detalhe de holerites |
| GET `/espelho?mes=&ano=` | espelho de ponto do mês |
| GET `/solicitacoes`, POST `/solicitacoes` | pedidos ao RH |
| GET `/comunicados`, POST `/comunicados/{id}/lido` | avisos e confirmação de leitura |

**Navegação depois do login (barra inferior) [visto no DOM e no script]:**
Início, Holerites, Espelho, Solicitações e Avisos. O cabeçalho mostra o nome do
colaborador, o CPF e o botão Sair.

**Início (resumo do mês):**

- Saudação com o primeiro nome e o mês de referência.
- **Ponto:** 4 indicadores (horas trabalhadas, faltas no mês, horas extras e
  banco de horas). As faltas ficam em vermelho e as extras em amarelo quando há.
  Se o ponto não existir, aparece um aviso de indisponibilidade.
- **Holerites:** valor líquido do último holerite, mais até 3 recentes e o
  botão "Ver todos (n)".
- **Vales / adiantamentos:** valor disponível e valor pendente, mais os
  movimentos recentes (descrição, data, valor e selo Pendente ou Baixado). Isto
  indica que existe um limite de adiantamento por colaborador e um fluxo de
  baixa [deduzido].
- **Jornada do mês:** previsto, realizado, atraso e faltas, com link "Espelho
  completo".
- **Acesso rápido:** 4 botões com contadores (avisos não lidos, solicitações
  pendentes, holerites disponíveis e espelho do mês). Se houver, aparece também
  uma linha "n documento(s) disponível(is)".

**Holerites:**

- Lista com a referência (mês) e o líquido.
- O detalhe mostra uma tabela com as linhas de proventos e depois as de
  descontos (descrição e valor), mais o líquido no fim, e o botão "Voltar".
- Não há cabeçalhos a separar proventos de descontos, nem sinal nos valores.
  Também não há PDF para baixar, nem confirmação de recebimento ou assinatura
  do holerite.

**Espelho de ponto:**

- Seletores de mês (01 a 12) e de ano (o atual e os 2 anteriores), mais o
  botão "Consultar". Ao abrir, consulta logo o mês atual.
- O resumo mostra a referência, as horas realizadas, as horas extras (só horas
  inteiras), as faltas e o saldo do banco de horas.
- Por dia: data, selo "Falta" (vermelho) ou o dia da semana, e entrada → saída.
  Só há um par entrada/saída por dia; o intervalo não aparece.

**Solicitações:**

- Botão "Nova solicitação" e a lista dos pedidos (tipo, selo de status,
  período e motivo). Os selos: pendente em amarelo, aprovado em verde e o resto
  em vermelho.
- O tipo e o status aparecem com o código cru (por exemplo `ajuste_ponto`).

**Modal "Nova solicitação":**

| Campo | Tipo | Obrig. (no cliente) | Opções |
| --- | --- | --- | --- |
| Tipo (`tipo`) | select | — | Férias `ferias`, Folga `folga`, Atestado `atestado`, Ajuste de ponto `ajuste_ponto`, Outro `outro` |
| Data início (`data_inicio`) | data | não | — |
| Data fim (`data_fim`) | data | não | — |
| Motivo (`motivo`) | texto longo | não | — |

Botão "Enviar". Depois de enviar, aparece um aviso e a lista recarrega. **Não
há anexo**: um atestado não leva o ficheiro do atestado. Também não há validação
de datas no cliente.

**Avisos (comunicados):**

- Lista com título, selo "Novo" se ainda não foi lido, data de publicação,
  prioridade e conteúdo completo.
- Tocar num aviso não lido regista a leitura (uma vez só) e tira o selo.

### 2.5 `/colaborador-admin/comunicados` — Comunicados [visto]

**Objetivo:** publicar avisos que aparecem no PWA.

**Topo:** título e botão "Abrir PWA" (abre o PWA da empresa noutra aba).

**Formulário "Novo comunicado"** (POST `/colaborador-admin/comunicados`):

| Campo | Tipo | Obrig. | Opções / padrão |
| --- | --- | --- | --- |
| Título (`titulo`) | texto, até 300 caracteres | sim | — |
| Prioridade (`prioridade`) | select | não | Baixa, Normal (padrão), Alta, Urgente |
| Conteúdo (`conteudo`) | texto longo | sim | texto simples, sem editor |
| Publicar imediatamente (`publicar`) | caixa de seleção | não | marcada por padrão |

Botão: "Publicar".

**Lista:** Título, Prioridade, Publicado em. Vazia: "Nenhum comunicado
publicado."

**Regras e comportamento:**

- **Público [visto: ausência]:** não se escolhe para quem vai (setor, cargo ou
  pessoa). O aviso vai para todos os colaboradores da empresa [deduzido].
- **Rascunho [deduzido]:** sem "Publicar imediatamente", o aviso fica gravado
  sem publicação. Não há data de agendamento.
- **Leitura [visto no PWA]:** o sistema guarda quem leu, mas a lista do gestor
  não mostra contagem nem lista de leituras (pelo menos nas colunas vazias).
- **Sem canal externo [visto: ausência]:** não há opção de enviar também por
  push, e-mail ou WhatsApp.

### 2.6 `/colaborador-admin/solicitacoes` — Solicitações RH [visto]

**Objetivo:** tratar os pedidos que os colaboradores enviam pelo PWA. O gestor
não cria pedidos aqui.

- **Topo:** título e botão "Abrir PWA".
- **Filtro:** Status (Todos, Pendente, Aprovado, Rejeitado). Ao mudar o valor,
  a página recarrega sozinha (GET `?status=`).
- **Tabela:** Colaborador, Tipo, Período, Status, Motivo e uma última coluna
  sem título, que deve ter os botões de aprovar e rejeitar [deduzido; vazia,
  não visto].
- **Estados [visto]:** pendente → aprovado | rejeitado.
- **Não se sabe [a verificar]:**
  - se aprovar férias ou um ajuste de ponto mexe sozinho no ponto ou nas
    férias;
  - se há campo para o motivo da rejeição;
  - se o colaborador é avisado (ele só vê o selo no PWA).

### 2.7 `/assinatura-admin` — Assinatura eletrônica [visto]

**Objetivo:** criar documentos para assinatura eletrônica e acompanhar o estado.
Segundo o subtítulo, cada assinatura guarda IP, geolocalização e hash.

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

Botão: "Criar documento".

**Regras e comportamento:**

- **Sem ficheiro [visto]:** o formulário não tem campo de upload (é um
  formulário simples, não multipart). O PDF deve ser anexado depois, no detalhe
  do documento, ou então o documento é só texto [a verificar].
- **Um signatário na criação [visto]:** o estado "Parcialmente assinado" mostra
  que um documento pode ter vários signatários. Os outros devem ser
  acrescentados no detalhe [deduzido].
- **Estados [visto]:** pendente → parcial → concluído; e cancelado.
- **Entrega ao signatário [a verificar]:** o e-mail sugere envio de link por
  e-mail. O PWA só mostra um contador de "documentos disponíveis" e não tem
  tela para assinar.
- **Motor reutilizado [deduzido]:** o aviso global "o cliente assinou
  eletronicamente a OS", com link para o comprovante, mostra que a Ordem de
  Serviço já usa uma assinatura eletrônica semelhante.

### 2.8 `/dashboard/modulo/consultoria` — lançador da Consultoria [visto]

- Título "Consultoria — Gestão 360°" e link "Voltar ao dashboard".
- **Grupo "Gestão 360°", com 8 atalhos:**
  - Painel Gestão 360° (`/consultoria`)
  - Projeto (`/consultoria/projetos`)
  - Diagnóstico IOG (`/consultoria/diagnosticos`)
  - Problemas (`/consultoria/problemas`)
  - Plano 30/60/90 (`/consultoria/acoes`)
  - Reuniões (`/consultoria/reunioes`)
  - IA Advisor (`/consultoria/advisor`)
  - Relatório executivo (`/consultoria/relatorios`)
- Cada atalho tem o botão "Adicionar aos atalhos".

### 2.9 `/consultoria` — Painel Gestão 360° [visto]

- **Cabeçalho:** "Gestão 360°", com o projeto ativo no subtítulo (aqui "Sem
  projeto ativo"). Ao lado, o aviso de que a análise automática precisa da chave
  da OpenAI no Super Admin, e os botões "Diagnóstico" e "IA Advisor".
- **8 KPIs vindos do ERP:** Faturamento, Margem, Ticket médio, Qtd. vendas,
  Valor em estoque, Estoque parado, Inadimplência e Receber vencido. Estavam
  todos a zero. A tela não diz o período [a verificar: talvez o do projeto ou o
  do mês].
- **IOG por área:** sem dados. O texto diz que o Advisor pode montar a primeira
  análise com os dados do ERP.
- **Histórico IOG:** tabela com Data, IOG e Classe. Só entram diagnósticos
  finalizados.
- **Plano de ação:** Total, Abertas, Atrasadas, Concluídas e a distribuição
  30/60/90, mais o botão "Abrir plano" (`/consultoria/acoes`).

### 2.10 `/consultoria/projetos` — Projetos de consultoria [visto]

**Objetivo:** registar o ciclo de consultoria da empresa: produto comercial,
período, responsável e as 3 dores principais.

- **Filtros (GET):** Busca (`q`) e Status (Todos, Ativo, Encerrado), mais o
  botão "Filtrar".
- **Tabela:** Nome, Produto, Status, Início. Vazia: "Nenhum projeto."
- **Painel lateral "Dados complementares":** pede para selecionar um registo e
  tem um link "Alterar" (inativo sem seleção). É um padrão mestre-detalhe que se
  repete em Problemas e no Plano.
- **"Novo"** leva a `/consultoria/projetos/criar`.

**Formulário "Novo projeto"** (POST `/consultoria/projetos`):

| Campo | Tipo | Obrig. | Opções / padrão |
| --- | --- | --- | --- |
| Nome (`nome`) | texto | sim | — |
| Produto (`produto`) | select | não | Diagnóstico `diagnostico` (padrão), Gestão 90 dias `gestao_90`, Gestão contínua `continua` |
| Segmento (`segmento`) | texto livre | não | — |
| Início (`data_inicio`) / Fim (`data_fim`) | data | não | — |
| Responsável interno (`id_responsavel`) | pesquisa por lupa, tipo `pessoa_colaborador` | não | modal com busca, paginação e cadastro rápido |
| Status (`status`) | select | não | Ativo (padrão), Encerrado |
| Dor 1, Dor 2, Dor 3 (`dor_1`, `dor_2`, `dor_3`) | texto | não | — |
| Observação (`observacao`) | texto longo | não | — |

Botões: "Salvar" e "Voltar".

**Regras [deduzido]:**

- O painel e os diagnósticos falam sempre de "o" projeto ativo, no singular.
  Parece haver um único projeto ativo de cada vez.
- O Advisor cria um projeto sozinho na primeira análise, se não houver nenhum.

### 2.11 `/consultoria/diagnosticos` — Diagnósticos IOG [visto]

- **Subtítulo:** questionário por área, com a pontuação Sim = 10, Parcial = 5 e
  Não = 0. Em alternativa, a primeira análise pode ser feita pelo Advisor.
- **Aviso da chave OpenAI** (o mesmo do painel).
- **"Novo diagnóstico" é um botão que grava na hora** (POST sem campos). Estava
  **desativado**, porque não há projeto ativo. Nenhuma dica explica porquê; só
  um parágrafo abaixo diz que falta um projeto.
- **Tabela:** Data, Status, IOG, Classe e uma coluna de ações. Vazia.
- **Questionário não visto:** perguntas, áreas, fórmula do IOG e faixas de
  classe ficaram por ver. Para os ver seria preciso criar um diagnóstico.
- **Fórmula provável [a verificar]:** o IOG deve ser a percentagem de pontos
  obtidos sobre o máximo, por área e no total, com uma "classe" por faixa. As 8
  áreas devem ser as mesmas da tela de Problemas (secção 2.12). A sigla IOG não
  aparece por extenso.

### 2.12 `/consultoria/problemas` — Problemas e matriz de prioridade [visto]

- **Subtítulo:** cada problema recebe impacto, urgência e facilidade de 1 a 5;
  quanto maior a pontuação, mais cedo deve ser atacado.
- **Tabela:** Prioridade, Título, Gravidade, I, U, F, Status. Vazia. Não há
  filtros nem coluna de área.
- **Painel "Dados complementares"** com "Alterar".
- **"Novo problema"** leva a `/consultoria/problemas/criar`.

**Formulário "Novo problema"** (POST `/consultoria/problemas`):

| Campo | Tipo | Obrig. | Opções / padrão |
| --- | --- | --- | --- |
| `id_project`, `id_diagnostic` | ocultos | — | 0 quando criado à mão |
| Título (`titulo`) | texto | sim | — |
| Área (`id_area`) | select | não | — (0), 1 Estratégia e governança, 2 Comercial e vendas, 3 Financeiro e fluxo de caixa, 4 Estoque e compras, 5 Operações e processos, 6 Pessoas e liderança, 7 Indicadores e informação, 8 Cliente e pós-venda |
| Descrição / evidência textual (`descricao`) | texto longo | não | — |
| Gravidade (`gravidade`) | select | não | Baixa, Media (padrão), Alta, Critica (sem acento na tela) |
| Impacto, Urgência, Facilidade (`impacto`, `urgencia`, `facilidade`) | número de 1 a 5 | não | 3 cada |
| Impacto (texto) (`impacto_texto`) | texto longo | não | — |
| Recomendação (`recomendacao`) | texto longo | não | — |
| Status (`status`) | select | não | `aberto` (padrão), `em_acao`, `resolvido` (aparecem com o código cru) |

Botões: "Salvar" e "Voltar".

**Regras:**

- **Pontuação [deduzido]:** o "×" do subtítulo indica prioridade = impacto ×
  urgência × facilidade, de 1 a 125. A lista ordena por essa pontuação.
- **Origem [deduzido]:** os campos ocultos mostram que um problema pode nascer
  de um diagnóstico (ou do Advisor), já ligado ao projeto e ao diagnóstico.
- **Estados [visto]:** aberto → em ação → resolvido.

### 2.13 `/consultoria/acoes` — Plano 30/60/90 (rota irmã, fora do lote; só o texto visível) [visto em parte]

Só se leu o texto visível. A leitura da estrutura (campos, links e destinos)
foi recusada pela trava automática e não foi refeita.

- **Contadores no topo:** Atrasadas, Abertas e Concluídas.
- **Botão "Nova ação".**
- **Filtros:** Fase (30, 60 ou 90 dias) e Status (`aberta`, `atrasada`,
  `concluida`, com o código cru), mais "Filtrar".
- **Tabela:** Fase, Ação, Responsável, Prazo, Indicador, Status.
- **Secção "Metas"** com o botão "Incluir" (vazia).
- **Painel "Dados complementares".**
- Ficaram por ver o formulário da ação, o formulário da meta e se "atrasada" é
  calculado pelo prazo.

---

## 3. Fluxos de ponta a ponta

### 3.1 Benefício até ao holerite

1. O gestor ajusta as Configurações da folha (dia de pagamento, regras do
   ponto, ligação ao financeiro e banco da remessa).
2. Cadastra o benefício: tipo, nome, valor padrão e % de desconto (6% por
   padrão).
3. Atribui o benefício a cada colaborador, com valor próprio ou o padrão.
4. No processamento mensal, a folha lança o desconto do benefício ativo
   [visto: aviso da tela; mecânica a verificar].
5. Lança também HE, adicional noturno, faltas, atrasos e banco de horas vindos
   do ponto.
6. O holerite fica disponível no PWA, com proventos, descontos e líquido.
7. O financeiro recebe contas a pagar (fornecedor de salários, contas de
   salários e encargos) e a remessa CNAB 240 paga cada conta [deduzido].

### 3.2 Comunicado

1. O gestor escreve o comunicado (título, prioridade e conteúdo) e publica, ou
   guarda sem publicar.
2. O colaborador vê o aviso no PWA, com selo "Novo" e contador na tela inicial.
3. Ao tocar no aviso, a leitura fica registada.

### 3.3 Solicitação ao RH

1. O colaborador entra no PWA (empresa, CPF ou código e senha).
2. Em "Nova solicitação" escolhe o tipo (férias, folga, atestado, ajuste de
   ponto ou outro), as datas e o motivo, e envia.
3. O pedido aparece como pendente em `/colaborador-admin/solicitacoes`.
4. O gestor aprova ou rejeita.
5. O colaborador vê o novo estado no PWA. O efeito noutros módulos (ponto,
   férias) fica por confirmar.

### 3.4 Assinatura eletrônica

1. O gestor cria o documento (título, tipo, descrição e primeiro signatário).
2. No detalhe, anexa o ficheiro e mais signatários [a verificar].
3. O signatário recebe um link (provavelmente por e-mail) e assina. Ficam
   guardados IP, geolocalização e hash.
4. O estado passa de pendente a parcial e depois a concluído. O documento pode
   ser cancelado.

### 3.5 Consultoria Gestão 360°

1. Cria-se o projeto (produto, período, responsável e 3 dores). Em alternativa,
   o Advisor cria-o na primeira análise.
2. Faz-se o diagnóstico IOG: questionário por área (Sim 10 / Parcial 5 /
   Não 0), ou primeira análise da IA com os dados do ERP. Sai um IOG por área,
   o total e uma classe.
3. Registam-se os problemas, ligados à área e ao diagnóstico, com gravidade e
   pontuação I × U × F, e por isso priorizados.
4. Monta-se o plano de ação 30/60/90 (ação, responsável, prazo, indicador e
   estado) e as metas.
5. Seguem-se as reuniões de acompanhamento e o relatório executivo (não
   abertos).
6. O painel acompanha os KPIs do ERP, a evolução do IOG e o andamento do plano.

---

## 4. Entidades e relações

| Entidade | Campos vistos | Relações |
| --- | --- | --- |
| **Benefício** | tipo (vt, vr, va, outro), nome, valor_padrao, pct_desconto_colaborador, ativo [deduzido] | pertence à empresa; tem várias atribuições |
| **Atribuição de benefício** | id_pessoa, id_beneficio, valor (opcional), ativa [deduzido] | liga Pessoa (colaborador) a Benefício; lida pelo processamento da folha |
| **Configuração da folha** | sindicato, convencao_coletiva, piso_salarial, he_percentual_50, he_percentual_100, adicional_noturno_pct, dia_pagamento, descontar_faltas, descontar_atrasos, integrar_banco_horas, id_fornecedor_salarios, id_pcontas_salarios, id_pcontas_encargos, cnab_banco, cnab_nome_banco, cnab_agencia(+dígito), cnab_conta(+dígito), cnab_convenio, cnab_cnpj, cnab_sequencial | uma por empresa; aponta para Pessoa (fornecedor) e Plano de contas; usa o Ponto |
| **Acesso do colaborador (sessão do PWA)** | login (CPF ou ID), senha, id_empresa, dispositivo, plataforma, token | pertence a Pessoa (colaborador) e Empresa |
| **Holerite** | referencia, liquido, proventos[] e descontos[] (descrição, valor), totais | gerado pela folha; visto pelo colaborador |
| **Espelho de ponto (consulta)** | referencia, dias[] (data, dia_semana, entrada, saida, falta), totais (realizado_min, extras_min, faltas), banco_horas.saldo | vem do módulo Ponto |
| **Vale / adiantamento** | descricao, data, valor, status (pendente, baixado); disponível; total pendente | ligado ao colaborador e, provavelmente, ao financeiro e à folha |
| **Comunicado** | titulo, prioridade (baixa, normal, alta, urgente), conteudo, publicado, publicado_em | pertence à empresa; tem leituras |
| **Leitura de comunicado** | id_comunicado, colaborador, lido | liga Comunicado a colaborador |
| **Solicitação** | tipo (ferias, folga, atestado, ajuste_ponto, outro), data_inicio, data_fim, motivo, status (pendente, aprovado, rejeitado) | criada pelo colaborador; tratada pelo gestor |
| **Documento de assinatura** | titulo, tipo (texto livre), descricao, status (pendente, parcial, concluido, cancelado) | tem um ou mais signatários |
| **Signatário** | nome, email, cpf, id_pessoa (opcional); evidências: IP, geolocalização, hash [visto no subtítulo] | pertence a Documento; pode apontar para Pessoa |
| **Projeto de consultoria** | nome, produto (diagnostico, gestao_90, continua), segmento, data_inicio, data_fim, id_responsavel, status (ativo, encerrado), dor_1..3, observacao | responsável = Pessoa (colaborador); tem diagnósticos, problemas e ações |
| **Diagnóstico IOG** | data, status, IOG, classe; respostas por área (Sim, Parcial, Não) [deduzido] | pertence a Projeto; dá origem a Problemas |
| **Área de gestão** | 8 áreas fixas (IDs 1 a 8) | classifica problemas e, provavelmente, perguntas do IOG |
| **Problema** | id_project, id_diagnostic, titulo, id_area, descricao, gravidade, impacto, urgencia, facilidade, impacto_texto, recomendacao, status (aberto, em_acao, resolvido); prioridade calculada | pertence a Projeto e, opcionalmente, a Diagnóstico e Área |
| **Ação do plano** | fase (30, 60, 90), ação, responsável, prazo, indicador, status (aberta, atrasada, concluida) [visto em parte] | pertence a Projeto; provavelmente ligada a Problema [a verificar] |
| **Meta** | não vista (só a secção com "Incluir") | pertence ao Plano / Projeto |

---

## 5. Integrações

| Integração | Onde aparece | Estado |
| --- | --- | --- |
| **Bancos: CNAB 240 de pagamento de salários** | Configurações da folha (banco, agência, conta, convênio, CNPJ, sequencial; padrão 341) | campos vistos; a geração do arquivo não está nestas telas |
| **Financeiro interno** | Configurações da folha (fornecedor de salários e plano de contas de salários e encargos) | campos vistos; lançamento a verificar |
| **Ponto eletrônico interno** | Configurações da folha (faltas, atrasos, banco de horas); PWA (espelho, banco de horas, jornada) | visto |
| **PWA** (service worker, manifest, token Bearer, cor por empresa) | Portal do Colaborador | visto |
| **OpenAI ("OpenAI Advisor")** | Painel, Diagnósticos (análise automática); chave no Super Admin da plataforma | aviso visto; Advisor não aberto |
| **E-mail ao signatário** | Assinatura eletrônica (campo e-mail) | a verificar |
| **Geolocalização do navegador e hash do documento** | Assinatura eletrônica (subtítulo) | anunciado; não visto em ação |
| **Assinatura eletrônica da OS** | aviso global "cliente assinou a OS" com comprovante | visto só o aviso |
| **Notificações globais** (Agente de Vendas IA no WhatsApp, loja virtual, cardápio, Mercado Livre) | modais presentes em todas as páginas | vistos só os modais |
| **eSocial, FGTS Digital, DCTFWeb, push, e-mail ou WhatsApp para o colaborador** | — | **não aparecem** nestas telas |

---

## 6. Observações de UX (oportunidades para nós)

### Folha

1. **IDs crus onde devia haver pesquisa.** "ID fornecedor salários", os dois
   "Plano contas" e o "ID pessoa" da assinatura pedem o número interno do
   registo. Para nós: campo de pesquisa com nome e código, igual ao do
   "Responsável interno".
2. **Tabelas legais escondidas ou ausentes.** INSS, IRRF e salário-família não
   estão nas configurações. Para nós: uma tela única de "tabelas legais
   vigentes", com data de vigência e atualização centralizada pela
   plataforma.
3. **"% desconto" sem base.** Não se diz se incide sobre o salário ou sobre o
   valor do vale, nem se há teto. Para nós: explicar a regra na própria tela
   (ex.: VT = até 6% do salário-base, limitado ao custo do vale) e calcular o VT
   por dias úteis × viagens × tarifa.
4. **Seletor de colaborador vazio, sem explicação.** Na atribuição de
   benefícios, o select vem vazio e nada diz porquê. Para nós: um estado vazio
   que diga o que falta (ex.: "cadastre colaboradores com salário") com link
   direto.
5. **Dia de pagamento como dia fixo.** A lei fala em 5º dia útil. Para nós: a
   opção "N-ésimo dia útil", com feriados.
6. **Visual inconsistente.** Benefícios tem um layout novo (cartões com ícones
   e KPIs); Configurações é Bootstrap simples. Sinal de módulo montado em fases.

### Portal do colaborador

7. **Holerite pobre.** Proventos e descontos estão na mesma tabela, sem
   separação nem sinal. Não há PDF nem "li e concordo". Para nós: holerite com
   blocos, bases (INSS, FGTS, IRRF), PDF e aceite com data e hora (substitui a
   assinatura em papel).
8. **Pedido sem anexo.** Um atestado sem foto do atestado obriga a outro canal.
   Para nós: anexo por foto, validação de datas e campos condicionais por tipo
   (ex.: o ajuste de ponto pede a batida certa).
9. **Códigos crus no app.** O colaborador vê `ajuste_ponto`, `pendente` etc.
   Para nós: rótulos sempre traduzidos.
10. **Comunicados sem público nem relatório de leitura.** Não dá para mandar só
    a um setor, agendar, anexar ou ver quem leu (embora o sistema registe a
    leitura). Para nós: público por setor, cargo ou pessoa; agendamento;
    contagem "lido por X de Y"; push no PWA e WhatsApp opcional.
11. **Conteúdo do comunicado tratado como HTML.** O PWA insere o conteúdo sem
    tratamento. Na nossa versão: guardar o conteúdo como texto ou Markdown
    seguro.
12. **Dois PWAs para o mesmo colaborador** (o do Ponto e o deste Portal). Para
    nós: um app só, com bater ponto, holerite, pedidos e avisos.
13. **Login sem recuperação.** Não há "esqueci a senha" nem primeiro acesso.
    Para nós: primeiro acesso por link ou código enviado pelo gestor (WhatsApp
    ou e-mail) e recuperação simples.

### Assinatura eletrônica

14. **Documento sem ficheiro na criação, tipo em texto livre e um só
    signatário.** Para nós:
    - criar o documento já com PDF e vários signatários (com ordem);
    - tipo numa lista;
    - envio do link por WhatsApp ou e-mail;
    - lembrete automático;
    - certificado final com as evidências (IP, data e hora, geolocalização,
      hash).

### Consultoria

15. **IA dependente do dono da plataforma.** Sem a chave OpenAI no Super Admin,
    o cliente vê o aviso repetido em várias telas. Para nós: a IA incluída no
    plano, sem configuração pelo cliente; se não houver, esconder o recurso em
    vez de mostrar o aviso.
16. **Botão desativado sem motivo.** "Novo diagnóstico" fica cinzento; só um
    parágrafo abaixo explica. Para nós: um botão que guie ("Criar projeto
    primeiro").
17. **Códigos crus e falta de acentos** (`em_acao`, `concluida`, "Media",
    "Critica"). Para nós: rótulos revistos.
18. **Mestre-detalhe com link "Alterar" ativo sem seleção.** Para nós: abrir o
    detalhe ao clicar na linha e mostrar a ação só quando faz sentido.
19. **KPIs sem período.** O painel mostra faturamento e margem sem dizer de
    quando. Para nós: período explícito e comparação com o anterior.
20. **Valor do módulo para nós [deduzido]:** é um produto de consultoria
    vendido junto com o ERP (Diagnóstico, Gestão 90 dias e Gestão contínua).
    Uma versão nossa pode ser mais simples: um diagnóstico guiado, a matriz de
    prioridade e o plano 30/60/90 ligados aos números reais do ERP.

---

## 7. Pendências

1. **Recusa da trava automática do Claude Code** (motivo "Third-Party Attack")
   ao ler a estrutura de `/consultoria/acoes`, rota irmã fora deste lote. A
   exploração parou aí, sem nova tentativa. **Liberar ou não é decisão do
   utilizador.**
2. **Não abertas (fora do lote, depois da recusa):** `/consultoria/reunioes`,
   `/consultoria/advisor` e `/consultoria/relatorios`. O Plano 30/60/90 foi lido
   só em parte (texto visível).
3. **Sem dados na conta**, ficaram por ver:
   - coluna de ações e botões de aprovar ou rejeitar em Solicitações;
   - edição, desativação e exclusão em Benefícios e Comunicados;
   - detalhe do documento, anexo, vários signatários e página pública de
     assinatura;
   - detalhe e edição de projeto e problema;
   - questionário do IOG, fórmula e classes.
4. **"Novo diagnóstico" grava na hora** e estava desativado (sem projeto
   ativo). As perguntas do questionário IOG não foram vistas.
5. **PWA visto sem login:** as telas internas foram descritas a partir do
   script público da página. Falta vê-las com dados reais (holerite, espelho,
   vales).
6. **Seletor "Colaborador" vazio em Benefícios:** não foi confirmado se faltam
   colaboradores cadastrados ou se há um filtro (ex.: só quem tem salário ou
   contrato na folha).
7. **Regras de cálculo por confirmar:** base do % de desconto dos benefícios;
   onde ficam as tabelas de INSS, IRRF e FGTS; como e onde se gera a remessa
   CNAB 240; se a aprovação de férias ou ajuste de ponto mexe noutros módulos;
   como a folha lança os títulos no financeiro.
8. **Como se cria ou recupera a senha** do colaborador no PWA.
