# 17 — Consultoria (Gestão 360°), IA Advisor, MCP / Monitor WhatsApp IA e Olimpia Bridge (ERP Olímpia)

> Cobre o módulo Consultoria / Gestão 360° (hub, painel, projetos, diagnóstico
> IOG, problemas, plano 30/60/90 com metas, reuniões, IA Advisor, relatório
> executivo), o conector de IA por MCP com o monitor do agente de vendas no
> WhatsApp, e o agente local Olimpia Bridge. Exploração de 2026-10-03, conta de
> teste "Boi Criolo" (plano Full), sessão já aberta no navegador embutido.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual],
> [código] (lido no HTML/JS da página), [proposta]; [a verificar] marca
> hipóteses. Nada foi gravado no ERP.

## 1. Visão geral

**O que é [deduzido]:** a metodologia de consultoria de gestão da própria
Olímpia, embutida no ERP. É o último módulo da lista de 36 módulos do plano Full
("Consultoria / Gestão 360°") [visto em `/meu-plano`, ver
[18](18-parametros-plano-comissoes.md)]. O projeto de consultoria tem um
"produto" com três opções comerciais (Diagnóstico, Gestão 90 dias e Gestão
contínua) e as "3 dores" do cliente.

**Onde fica [visto]:** no menu lateral, seção "Visão Geral" (junto de BI
Executivo e Relatórios). O submenu lateral "Consultoria" tem: Painel Gestão
360°, Projeto, Diagnóstico IOG, Problemas, Plano 30/60/90, Reuniões, IA Advisor
e Relatório executivo. O manual do sistema **não tem cartão** para este módulo
(ver [22](22-manual.md)).

**MCP, Monitor WhatsApp IA e Bridge [visto]:** não estão no menu Consultoria.
Os atalhos ficam no hub do módulo Parâmetros ("Olimpia Bridge", "MCP / Conector
IA", "Monitor WhatsApp IA"; ver [18](18-parametros-plano-comissoes.md)) e na
busca de telas (Ctrl+K). A aba "Olimpia Bridge" de `/parametros-sistema` também
fica no 18.

### 1.1 Ciclo da Gestão 360° [visto + deduzido]

Projeto de consultoria → diagnóstico IOG (questionário por área, ou "primeira
análise" feita pela IA Advisor com os dados do ERP) → problemas priorizados por
impacto, urgência e facilidade → plano de ação 30/60/90 com metas → reuniões de
acompanhamento (com tarefas que viram ações) → relatório executivo. O Painel
Gestão 360° junta KPIs do ERP, o IOG por área e o andamento do plano.

### 1.2 IA no módulo [visto]

- A IA é da OpenAI ("Olimpia Advisor"). A análise automática e o chat exigem
  uma chave da OpenAI cadastrada pelo **Super Admin da plataforma**, em
  "Integrações → OpenAI Advisor". É uma configuração da plataforma, não da
  empresa cliente: o cliente não consegue ativar sozinho.
- Nesta conta a chave não está cadastrada, e o aviso aparece no Painel, nos
  Diagnósticos e no Advisor.
- O Advisor é diferente do assistente de uso do ERP (botão flutuante
  "Assistente Olimpia"; ver [22](22-manual.md)). A própria tela do Advisor faz
  essa separação.

### 1.3 Padrões do módulo [visto]

Os padrões comuns do ERP estão descritos uma só vez: "Dados complementares",
hubs com "Adicionar aos atalhos" e a moldura em
[22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas); a lupa em
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md#15-janela-de-pesquisa-lupa-e-a-api-por-trás-dela); formulários renderizados no
servidor, nomes de rota Laravel e SweetAlert2 em
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md#11-o-que-estas-telas-revelam-sobre-a-arquitetura-do-sistema). Como aparecem neste módulo:

- **"Dados complementares"** em Projetos, Problemas e Plano; com as listas vazias
  desta conta, pede para selecionar um registro e o "Alterar" fica sem destino.
- **Lupa do campo "Responsável":** colunas Código · Nome · CPF/CNPJ; no projeto o
  tipo é `pessoa_colaborador`; no plano o título do modal é "Pesquisar —
  Colaborador / Vendedor". Ao abrir, mostrou 0 registros antes de qualquer busca
  (a conta não tem colaboradores).
- **Formulários e filtros:** POST seguido de redirecionamento; filtros por GET.
  Nomes de rota deste módulo: `consultoria.acoes.index`, `mcp.index`,
  `mcp.monitor`, `bridge.index`.
- **Códigos crus e falta de acentos** nos selects e status (`em_acao`,
  `concluida`, `aberto`).

### 1.4 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/consultoria` | Lançador "Consultoria — Gestão 360°" | lida |
| `/consultoria` | Painel Gestão 360° | lida |
| `/consultoria/projetos` (+`/criar`) | Projetos de consultoria | lida; formulário aberto e abandonado sem gravar |
| `/consultoria/diagnosticos` | Diagnósticos IOG | lida ("Novo diagnóstico" desativado e não clicado) |
| `/consultoria/problemas` (+`/criar`) | Problemas e matriz de prioridade | lida; formulário aberto e abandonado sem gravar |
| `/consultoria/acoes` (+`/criar`, metas) | Plano 30/60/90 | lida (numa passagem anterior só o texto visível; a leitura por script foi recusada; numa passagem posterior foi lida por inteiro) |
| `/consultoria/reunioes` (+`/criar`) | Reuniões de gestão | lida |
| `/consultoria/advisor` | Olimpia Advisor | lida (chat desativado: sem chave OpenAI) |
| `/consultoria/relatorios` | Relatório executivo | lida (vazia; "Gerar agora" não clicado) |
| `/mcp` | MCP / Conector IA | **bloqueada pelo plano** ("função não está no seu plano") |
| `/mcp/monitor` | Monitor WhatsApp IA | **bloqueada pelo plano** |
| `/bridge` | Olimpia Bridge | lida |

Numa primeira tentativa, a navegação para `/dashboard/modulo/consultoria` foi
recusada pela trava do modo automático do Claude Code ("Third-Party Attack");
passagens posteriores abriram todas as rotas normalmente (ver Pendências).

**Limite principal [visto]:** a conta não tem nenhum registro neste módulo (0
projetos, diagnósticos, problemas, ações, metas, reuniões e relatórios). As
listas só foram vistas vazias; colunas de ação, detalhes e mudanças de estado
não puderam ser vistos, porque criar registros de teste é proibido.

## 2. Telas

### 2.1 `/dashboard/modulo/consultoria` — Lançador da Consultoria [visto]

- Título "Consultoria — Gestão 360°" e link "Voltar ao dashboard".
- Grupo "Gestão 360°", com 8 atalhos:
  - Painel Gestão 360° (`/consultoria`)
  - Projeto (`/consultoria/projetos`)
  - Diagnóstico IOG (`/consultoria/diagnosticos`)
  - Problemas (`/consultoria/problemas`)
  - Plano 30/60/90 (`/consultoria/acoes`)
  - Reuniões (`/consultoria/reunioes`)
  - IA Advisor (`/consultoria/advisor`)
  - Relatório executivo (`/consultoria/relatorios`)
- Cada atalho tem o botão "Adicionar aos atalhos" (não clicado).

### 2.2 `/consultoria` — Painel Gestão 360° [visto]

- **Cabeçalho:** "Gestão 360°", com o projeto ativo no subtítulo (aqui "Sem
  projeto ativo"). Ao lado, o aviso de que a análise automática precisa da
  chave da OpenAI no Super Admin, e os botões **Diagnóstico** e **IA Advisor**.
- **8 KPIs vindos do ERP:** Faturamento, Margem, Ticket médio, Qtd. vendas,
  Valor em estoque, Estoque parado, Inadimplência e Receber vencido. Todos a
  zero. A tela não diz o período [a verificar: talvez o do projeto ou o do
  mês].
- **IOG por área:** sem dados. O texto diz que o Advisor pode montar a
  primeira análise com os dados do ERP.
- **Histórico IOG:** tabela Data · IOG · Classe. Só entram diagnósticos
  finalizados.
- **Plano de ação:** Total, Abertas, Atrasadas, Concluídas e a distribuição
  30/60/90, mais o botão "Abrir plano" (`/consultoria/acoes`).

### 2.3 `/consultoria/projetos` — Projetos de consultoria [visto]

**Objetivo:** registrar o ciclo de consultoria da empresa: produto comercial,
período, responsável e as 3 dores principais.

- **Filtros (GET):** Busca (`q`) e Status (Todos, Ativo, Encerrado), botão
  "Filtrar".
- **Tabela:** Nome · Produto · Status · Início. Vazia: "Nenhum projeto."
- **Painel "Dados complementares"** com "Alterar" (ver 1.3).
- **"Novo"** leva a `/consultoria/projetos/criar`.

#### `/consultoria/projetos/criar` — Novo projeto (POST `/consultoria/projetos`)

| Campo | Tipo | Obrig. | Opções / padrão |
| --- | --- | --- | --- |
| Nome (`nome`) | texto | sim | — |
| Produto (`produto`) | select | não | Diagnóstico `diagnostico` (padrão), Gestão 90 dias `gestao_90`, Gestão contínua `continua` |
| Segmento (`segmento`) | texto livre | não | — |
| Início (`data_inicio`) / Fim (`data_fim`) | data | não | — |
| Responsável interno (`id_responsavel`) | lupa, tipo `pessoa_colaborador` | não | modal com busca, paginação e cadastro rápido |
| Status (`status`) | select | não | Ativo (padrão), Encerrado |
| Dor 1, Dor 2, Dor 3 (`dor_1`, `dor_2`, `dor_3`) | texto | não | — |
| Observação (`observacao`) | texto longo | não | — |

Botões "Salvar" (não clicado) e "Voltar".

**Regras [deduzido]:**

- O painel e os diagnósticos falam sempre de "o" projeto ativo, no singular:
  parece haver um único projeto ativo de cada vez (por tenant/empresa).
- O Advisor cria um projeto sozinho na primeira análise, se não houver nenhum.

### 2.4 `/consultoria/diagnosticos` — Diagnósticos IOG [visto]

- **Subtítulo:** questionário por área, com pontuação Sim = 10, Parcial = 5 e
  Não = 0. Em alternativa, a primeira análise pode ser feita pelo Advisor.
- **Aviso da chave OpenAI** (o mesmo do painel).
- **"Novo diagnóstico" é um botão que grava na hora** (POST sem campos, sem
  formulário). Estava **desativado**, porque não há projeto ativo. Nenhuma dica
  no botão explica porquê; só um parágrafo abaixo diz que falta um projeto. Não
  foi clicado.
- **Tabela:** Data · Status · IOG · Classe e uma coluna de ações. Vazia.
- **Não visto:** perguntas, áreas do questionário, fórmula do IOG e faixas da
  "Classe" (seria preciso criar um diagnóstico).
- **Fórmula provável [a verificar]:** o IOG deve ser a porcentagem de pontos
  obtidos sobre o máximo, por área e no total, com uma "classe" por faixa. As
  8 áreas devem ser as mesmas da tela de Problemas (2.5). A sigla IOG não
  aparece por extenso.

### 2.5 `/consultoria/problemas` — Problemas e matriz de prioridade [visto]

- **Subtítulo:** "matriz de prioridade"; cada problema recebe impacto,
  urgência e facilidade de 1 a 5; o maior score é atacado primeiro.
- **Tabela:** Prioridade · Título · Gravidade · I · U · F · Status. Vazia. Não
  há filtros nem coluna de área.
- **Painel "Dados complementares"** com "Alterar".
- **"Novo problema"** leva a `/consultoria/problemas/criar`.

#### `/consultoria/problemas/criar` — Novo problema (POST `/consultoria/problemas`)

| Campo | Tipo | Obrig. | Opções / padrão |
| --- | --- | --- | --- |
| `id_project`, `id_diagnostic` | ocultos | — | 0 quando criado à mão |
| Título (`titulo`) | texto | sim | — |
| Área (`id_area`) | select | não | — (0); 1 Estratégia e governança; 2 Comercial e vendas; 3 Financeiro e fluxo de caixa; 4 Estoque e compras; 5 Operações e processos; 6 Pessoas e liderança; 7 Indicadores e informação; 8 Cliente e pós-venda |
| Descrição / evidência textual (`descricao`) | texto longo | não | — |
| Gravidade (`gravidade`) | select | não | Baixa, Média (padrão), Alta, Crítica — uma passagem registrou os rótulos sem acento ("Media", "Critica"), outra com acento: a confirmar |
| Impacto, Urgência, Facilidade (`impacto`, `urgencia`, `facilidade`) | número de 1 a 5 | não | 3 cada |
| Impacto (texto) (`impacto_texto`) | texto longo | não | — |
| Recomendação (`recomendacao`) | texto longo | não | — |
| Status (`status`) | select | não | `aberto` (padrão), `em_acao`, `resolvido` (aparecem com o código cru) |

Botões "Salvar" (não clicado) e "Voltar".

**Regras:**

- **Pontuação [deduzido]:** o "×" do subtítulo indica prioridade = impacto ×
  urgência × facilidade, de 1 a 125. A lista ordena por essa pontuação.
- **Origem [deduzido]:** os campos ocultos mostram que um problema pode nascer
  de um diagnóstico (ou do Advisor), já ligado ao projeto e ao diagnóstico.
- **Estados [visto]:** aberto → em ação → resolvido.
- **As 8 áreas de gestão** são as mesmas do IOG [deduzido].

### 2.6 `/consultoria/acoes` — Plano 30 / 60 / 90 [visto]

**Objetivo:** listar e acompanhar as ações do plano de melhoria, divididas em
três horizontes (30, 60 e 90 dias). Cada ação pode nascer de um problema
diagnosticado.

- **Cabeçalho:** título "Plano 30 / 60 / 90" e contadores "Atrasadas · Abertas
  · Concluídas". Botão **Nova ação** → `/consultoria/acoes/criar`.
- **Filtros (GET, parâmetros na URL, ex.: `?fase=30&status=atrasada`):**

| Filtro | Tipo | Opções |
| --- | --- | --- |
| Fase | select | (todas), 30 dias, 60 dias, 90 dias |
| Status | select | (todos), `aberta`, `atrasada`, `concluida` (código cru) |

  Botão **Filtrar**. O filtro não tem "cancelada", embora o formulário a tenha.
- **Colunas:** Fase · Ação · Responsável · Prazo · Indicador · Status. Vazia:
  "Nenhuma ação."
- **Rodapé "Dados complementares"** (ver 1.3).

#### Bloco "Metas" (na mesma página; POST `/consultoria/acoes/metas`)

Formulário em linha, com a lista de metas por baixo (hoje "Sem metas.").

| Campo | Tipo | Obrigatório |
| --- | --- | --- |
| Meta (`titulo`) | texto | sim |
| Indicador | texto | não |
| Valor (`valor_meta`) | número | não |
| Prazo | data | não |

Botão **Incluir** (não clicado).

#### `/consultoria/acoes/criar` — Nova ação (POST `/consultoria/acoes`)

| Campo | Tipo | Obrigatório | Opções / observação |
| --- | --- | --- | --- |
| `id_project` | oculto | — | vale 0 quando não há projeto ativo |
| Título | texto | sim | — |
| Fase | select | — | 30 dias (padrão), 60 dias, 90 dias |
| Problema de origem | select | não | "—" + problemas cadastrados (hoje só "—") |
| Responsável | lupa | não | modal "Pesquisar — Colaborador / Vendedor" (ver 1.3) |
| Prazo | data | não | — |
| Indicador | texto | não | texto livre (não liga a um KPI) |
| Meta | texto | não | texto livre |
| Descrição | área de texto | não | — |
| Status | select | — | aberta (padrão), atrasada, concluida, cancelada |

Botões **Salvar** (não clicado) e **Voltar**.

**Regras observadas:**

- "Atrasada" é um status que o usuário escolhe à mão. Não ficou claro se o
  sistema também o calcula pelo prazo.
- Uma ação liga-se ao projeto ativo (campo oculto) e, opcionalmente, a um
  problema.
- As tarefas marcadas numa reunião viram ações (2.7).
- O Painel 360° resume o plano: total, abertas, atrasadas, concluídas e a
  divisão 30/60/90.

### 2.7 `/consultoria/reunioes` — Reuniões de gestão [visto]

- **Lista:** título "Reuniões de gestão" e botão **Nova reunião**
  (`/consultoria/reunioes/criar`). Colunas Data · Título · Status. Sem filtros
  nem busca. Vazia: "Nenhuma reunião."

#### `/consultoria/reunioes/criar` — Nova reunião (POST `/consultoria/reunioes`)

| Campo | Tipo | Obrigatório | Opções / observação |
| --- | --- | --- | --- |
| Título | texto | sim | — |
| Data/hora | data e hora | não | — |
| Participantes | texto | não | texto livre, sem ligação a usuários |
| Status | select | — | agendada (padrão), realizada, cancelada |
| Ata | área de texto | não | — |
| Próximos passos | área de texto | não | — |
| Tarefas da reunião | 3 linhas fixas | não | cada linha: Tarefa (texto), Prazo (data) e a caixa **"Criar ação 30/60/90"** |

- Há um bloco escondido, "pauta do Advisor", para mostrar uma pauta sugerida
  pela IA. Nesta página nenhum script o preenche. Provavelmente só aparece
  quando a reunião é aberta a partir do Advisor, com a IA ativa [deduzido].
- Cada tarefa com a caixa marcada vira uma ação no Plano 30/60/90 quando a
  reunião é salva.
- Só há 3 linhas de tarefa e nenhum botão para acrescentar mais.

### 2.8 `/consultoria/advisor` — Olimpia Advisor [visto + código]

**Objetivo:** consultor de gestão com IA (OpenAI) que lê o IOG, os KPIs, os
problemas e as ações do tenant e responde perguntas. A tela separa o Advisor
do "Hermes", o assistente de uso do ERP que fica no botão flutuante
"Assistente Olimpia" e responde dúvidas de vendas, PDV, OS, notas fiscais e
parâmetros. (Nas Novidades do sistema, "Hermes" também é o nome do hub de
WhatsApp que envia códigos de validação; ver
[18](18-parametros-plano-comissoes.md). Se é o mesmo produto: a confirmar.)

**Estado nesta conta:** aviso de que falta a chave OpenAI (Super Admin →
Integrações → OpenAI Advisor). O campo de pergunta fica desativado.

**Interface:** área de conversa (log) e campo de pergunta (até 4000
caracteres) com exemplos no placeholder, como "onde está o capital parado?" e
"quais ações atrasaram?". Botão **Enviar**.

**Funcionamento [código]:**

- POST JSON para `/consultoria/advisor/chat` com `message`, `session_id` e
  `history` (as últimas 8 mensagens). A resposta vem em `reply`.
- `session_id` no formato `advisor-t{tenant}-e{empresa}-u{usuario}` (tenant +
  empresa + usuário).
- O histórico vive só na memória da página e perde-se ao recarregar.
- Em caso de erro, mostra um alerta (SweetAlert).

Noutras telas do módulo, o Advisor também faz a "primeira análise" (o
diagnóstico IOG automático) e, se não houver projeto, cria um sozinho.

### 2.9 `/consultoria/relatorios` — Relatórios executivos [visto]

- **Lista:** colunas Período · Título · (coluna de ações). Hoje "Nenhum
  relatório.". Sem filtros.
- **Ação:** botão **Gerar agora**, POST para `/consultoria/relatorios/gerar`.
  **Não foi clicado.** Não há escolha de período nem pré-visualização.
- O conteúdo do relatório ficou por ver. Provavelmente é montado a partir dos
  KPIs, do IOG e das ações [deduzido].

### 2.10 `/mcp` — MCP / Conector IA (bloqueada pelo plano) [visto em parte]

- A página abre, mas mostra "Esta função não está no seu plano — Plano: Full —
  o módulo necessário não está disponível", com um único botão, "Ir ao
  dashboard". Nome interno da rota: `mcp.index`.
- Mesmo assim, o atalho aparece no hub de Parâmetros e na busca rápida
  (Ctrl+K), descrito como "MCP / Conector IA".
- A tela do Bridge diz que a configuração do MCP passou para esta tela
  própria (o cartão "MCP / Conector IA" de `/bridge` só tem um link para cá).
- O MCP **não consta** da lista de 36 módulos do plano Full, nem de nenhum
  outro plano listado em `/meu-plano`: parece ser um adicional vendido à parte
  [deduzido].
- Pelo nome e pelo endereço, é um conector de IA por MCP (Model Context
  Protocol). Ficaram por ver: que dados e ações expõe, como autentica, com que
  permissões.

### 2.11 `/mcp/monitor` — Monitor WhatsApp IA (bloqueada pelo plano) [visto em parte + código]

Mostra o mesmo bloqueio de plano (rota `mcp.monitor`). A tela não foi vista,
mas o **código global das páginas do ERP** revela o que ela monitora:

- Todas as páginas consultam `/erp/notificacoes/whatsapp/poll` a cada 10
  segundos. Na primeira consulta o parâmetro é `bootstrap=1`; depois é
  `apos={último id}`, guardado na sessão do navegador.
- Quando chega uma notificação, abre-se o modal **"Novo pedido WhatsApp"**,
  com o aviso de que o "Agente de Vendas IA" registrou uma nova operação. O
  modal mostra Tipo (Orçamento ou Venda), Cliente, WhatsApp, Total e
  Data/hora, com os botões **Ver operação** e **Confirmar recebimento** (POST
  `/erp/notificacoes/whatsapp/{id}/confirmar`).
- As notificações formam uma fila. Se o operador fechar o modal sem confirmar,
  a notificação volta para a fila.

**Conclusão [deduzido]:** existe um agente de IA que atende clientes no
WhatsApp e, através do conector MCP, cria vendas e orçamentos no ERP; a equipe
da loja recebe o aviso e confirma. Os orçamentos criados pelo agente aparecem
entre as origens possíveis de orçamento (ver
[19](19-relatorios-vendas-financeiro.md)). Ficaram por ver: o que o monitor
mostra (conversas, pedidos, atendimentos automáticos) e que número ou provedor
de WhatsApp usa.

### 2.12 `/bridge` — Olimpia Bridge [visto + código]

**Objetivo:** configurar e testar o agente desktop que faz impressão, gaveta,
balança, leitor e certificados no computador da loja, expondo esse hardware ao
navegador por uma API local.

- **Topo:** botão **Baixar para Windows 64-bit** (`/bridge/download/win`, não
  clicado) e botão **Verificar atualização**, que consulta a versão publicada.

**Cartão "Status":**

| Item | Valor visto |
| --- | --- |
| Online | Offline (selo; fica verde quando o agente responde) |
| Versão Bridge | — |
| Computador | — (nome da máquina, quando online) |
| Última conexão | — |
| Empresa | nome fantasia da empresa |
| Tenant | identificador curto do tenant (slug) |
| API local | `http://127.0.0.1:9876` |
| Versão disponível | 1.0.19 |

**Cartão "Pareamento":** campo de token (tipo senha, só leitura), botão de
copiar e botão **Gerar token** (POST `/bridge/token`, não clicado). Pela
instrução da tela: o usuário cola o token nas configurações do Bridge; o
Bridge valida o token no ERP e preenche tenant/empresa sozinho. O navegador
fala com `localhost:9876`; o servidor do ERP nunca acessa USB ou serial.

**Cartão "Testes rápidos":** Testar conexão (ping e status), Imprimir teste
(texto curto), Abrir gaveta e Ler balança (peso em kg). O resultado aparece
num bloco de saída. Nenhum foi clicado.

**Cartão "MCP / Conector IA":** só um link para `/mcp`.

**API local do Bridge [código]** (script cliente público da página):

| Método e caminho | Uso |
| --- | --- |
| GET `/status` | online, pareado, versão, nome da máquina |
| POST `/ping` | teste autenticado |
| POST `/drawer/open` | abre a gaveta (impressora, comando hex, modelo) |
| POST `/balance/read` | lê o peso (timeout, porta, modelo, protocolo, baud, bits, paridade, stop) |
| POST `/printer/print` | imprime em modo `text`, `raw` (ZPL/EPL/ESC-POS), `image` (PNG em base64) ou `pdf` (base64), com corte opcional |
| GET `/printers` | lista as impressoras do PC |

Os pedidos levam os cabeçalhos `X-Bridge-Tenant`, `X-Bridge-Empresa`,
`X-Bridge-Usuario` e, quando existe, `X-Bridge-Token`.

**Regras do cliente JS [código]:**

- O estado "online" fica em cache por 8 segundos.
- 3 modos: 0 = desligado, 1 = sempre Bridge, 2 = automático (usa o Bridge se
  estiver online). O modo escolhe-se na aba "Olimpia Bridge" de
  `/parametros-sistema` (ver [18](18-parametros-plano-comissoes.md)).
- Etiquetas em ZPL, EPL ou ESC-POS vão **uma por job**, com 250 ms de
  intervalo, porque a Elgin L42 enche o buffer.
- Uma folha de etiquetas em grade é montada como um único SVG, convertido em
  PNG (300 dpi por padrão) e enviado num job só. Parâmetros: colunas, largura
  e altura em mm, espaçamentos e margens.
- Documentos do ERP são impressos preferindo PDF (`?pdf=1`). Documentos
  fiscais (DANFE/DANFC-e) **só aceitam PDF**, sem alternativa. Os demais, se
  não houver PDF, saem como texto extraído do HTML.
- Os documentos fiscais vão para a "impressora NFC-e"; o resto vai para a
  impressora padrão.
- Segundo as Novidades do sistema, o Bridge converte o PDF da NFC-e para
  ESC/POS (linguagem das impressoras térmicas), mantendo as margens do cupom
  (DANFC-e) [visto em `/sistema-melhorias`].

**Downloads [visto na aba Bridge de `/parametros-sistema`]:** Windows 64-bit,
macOS Intel, macOS Apple Silicon e Linux AppImage "em breve" (tamanhos no 18).
Rotas de download: `/bridge/download/win|linux|mac|mac_arm` (não abertas).

## 3. Fluxos de ponta a ponta

### 3.1 Ciclo de consultoria (Gestão 360°)

1. Criar o projeto: produto (Diagnóstico, Gestão 90 dias ou Gestão contínua),
   segmento, datas, responsável interno e as 3 dores. Em alternativa, o
   Advisor cria-o na primeira análise.
2. Fazer o diagnóstico IOG: questionário por área (Sim 10 / Parcial 5 / Não
   0) ou primeira análise pela IA com os dados do ERP. Sai um IOG por área, o
   total, uma classe e o histórico.
3. Registrar os problemas, ligados à área e ao diagnóstico, com gravidade e
   notas I, U, F (o produto dá a prioridade), recomendação e status.
4. Montar o plano 30/60/90: ações ligadas ao problema de origem, com
   responsável, prazo, indicador e meta; mais as metas numéricas.
5. Fazer reuniões de gestão: ata, próximos passos e tarefas, que podem virar
   ações.
6. Usar o Advisor para tirar dúvidas sobre KPIs e ações.
7. Gerar o relatório executivo sob demanda.
8. Acompanhar tudo no Painel 360° (KPIs do ERP, evolução do IOG, resumo do
   plano).

Só os formulários e as listas vazias foram vistos; o resto é encadeamento
deduzido.

### 3.2 Hardware local com o Bridge

1. Baixar e instalar o agente no PC da loja.
2. Em `/bridge`, gerar um token e colá-lo no agente, que valida o token e
   preenche tenant e empresa.
3. Em Parâmetros → aba Olimpia Bridge, escolher o modo (desligado, Bridge ou
   automático) e, se quiser, a impressora (ver 18).
4. O PDV e as telas de etiquetas e documentos chamam `127.0.0.1:9876`.
5. Os testes rápidos confirmam impressora, gaveta e balança.

### 3.3 Agente de vendas IA no WhatsApp [deduzido]

1. Um cliente conversa no WhatsApp com o agente de IA.
2. O agente registra uma venda ou orçamento no ERP através do MCP.
3. As páginas do ERP fazem polling a cada 10 s e mostram o modal "Novo pedido
   WhatsApp".
4. O operador clica em "Ver operação" e depois em "Confirmar recebimento".

## 4. Entidades e relações

| Entidade | Campos | Relações |
| --- | --- | --- |
| **Projeto de consultoria** | nome, produto (`diagnostico`, `gestao_90`, `continua`), segmento, data_inicio, data_fim, id_responsavel, status (ativo, encerrado), dor_1..3, observacao | 1 projeto ativo por tenant/empresa [deduzido]; responsável = Pessoa (colaborador); tem diagnósticos, problemas, ações e metas |
| **Diagnóstico IOG** | data, status, IOG, classe; respostas por área (Sim, Parcial, Não) [deduzido] | pertence ao projeto; origina problemas |
| **Área de gestão** | 8 áreas fixas (IDs 1 a 8) | classifica problemas e, provavelmente, perguntas do IOG |
| **Problema** | id_project, id_diagnostic, titulo, id_area, descricao, gravidade, impacto, urgencia, facilidade, impacto_texto, recomendacao, status (aberto, em_acao, resolvido); prioridade = I × U × F | projeto e, opcionalmente, diagnóstico e área; origina ações |
| **Ação do plano** | titulo, fase (30/60/90), id_problem, id_responsavel, prazo, indicador, meta, descricao, status (aberta, atrasada, concluida, cancelada) | projeto, problema, colaborador; pode vir de tarefa de reunião |
| **Meta** | titulo, indicador, valor_meta, prazo | provável ligação ao projeto ativo (a tela não diz) |
| **Reunião de gestão** | titulo, data_hora, participantes (texto), status (agendada, realizada, cancelada), ata, proximos_passos | tem tarefas |
| **Tarefa de reunião** | titulo, prazo, criar_acao | gera ação ao salvar |
| **Relatório executivo** | período, título, conteúdo | gerado a partir de KPIs, IOG e ações (provável) |
| **Sessão do Advisor** | session_id (tenant + empresa + usuário), histórico de até 8 mensagens no navegador | lê KPIs, IOG, problemas e ações |
| **Integração OpenAI** | chave | nível plataforma (Super Admin), não do tenant |
| **Pareamento Bridge** | tenant (slug), empresa, usuário, token, versão, hostname, última conexão | por PC; usado pelo PDV, etiquetas e documentos |
| **Notificação WhatsApp IA** | id, tipo (venda, orçamento), cliente_nome, telefone_whatsapp, total, data_hora, url, confirmada | aponta para a venda ou orçamento criado pelo agente |

## 5. Integrações

| Integração | Onde aparece | Estado |
| --- | --- | --- |
| **OpenAI ("OpenAI Advisor")** | Advisor (chat) e primeira análise IOG; chave no Super Admin da plataforma | aviso visto; IA inativa nesta conta |
| **MCP (Model Context Protocol)** | `/mcp`; conector de IA | adicional fora do plano Full; não visto |
| **WhatsApp — Agente de Vendas IA** | modal global "Novo pedido WhatsApp" (polling) e `/mcp/monitor` | só o modal (código) |
| **Olimpia Bridge** | agente desktop para Windows e macOS (Linux "em breve"), API HTTP em `127.0.0.1:9876` | tela vista; agente offline nesta máquina |
| Hardware pelo Bridge | impressoras térmicas (sugestões: Epson TM-T20/T88, Bematech MP-4200 TH, Elgin i9, Daruma DR800), etiquetadora Elgin L42 (ZPL/EPL), gaveta (Epson, Bematech, Sweda, Elgin), balança, leitor e certificados | testes não executados |

## 6. Oportunidades de UX

1. **IA dependente do dono da plataforma.** Sem a chave OpenAI no Super Admin,
   o cliente vê o aviso repetido em várias telas, e o aviso fala em "Super
   Admin → Integrações", que o cliente não acessa. O Advisor está "no plano"
   mas não funciona. [proposta] IA incluída no plano, ligada de fábrica, sem
   configuração pelo cliente; se não houver, esconder o recurso em vez de
   mostrar o aviso.
2. **Histórico do Advisor perde-se ao recarregar.** [proposta] histórico
   guardado e respostas com links para a ação sugerida.
3. **Botão desativado sem motivo.** "Novo diagnóstico" fica cinzento; só um
   parágrafo abaixo explica. [proposta] um botão que guie ("Criar projeto
   primeiro").
4. **Códigos crus e falta de acentos** (`em_acao`, `concluida`, "Media",
   "Critica"). [proposta] rótulos revistos.
5. **Mestre-detalhe com "Alterar" visível sem seleção.** [proposta] abrir o
   detalhe ao clicar na linha e mostrar a ação só quando faz sentido.
6. **KPIs sem período** no painel. [proposta] período explícito e comparação
   com o anterior.
7. **Status "atrasada" é manual.** Deveria ser calculado pelo prazo. O filtro
   de status não tem "cancelada".
8. **Reuniões limitadas:** só 3 tarefas fixas; participantes em texto livre,
   sem ligação a usuários, sem convite e sem lembrete. [proposta]
   participantes vinculados, convite por WhatsApp ou e-mail e tarefas
   ilimitadas que viram ações.
9. **Metas soltas na tela de ações**, sem dizer de que projeto são. Indicador
   e meta são texto livre: não ligam a um KPI real nem medem o progresso
   sozinhos.
10. **"Gerar agora" sem período nem pré-visualização:** o cliente não sabe o
    que vai receber.
11. **Funções fora do plano aparecem no menu.** MCP e Monitor WhatsApp IA têm
    atalho no hub de Parâmetros e na busca, mas o clique termina numa página
    de bloqueio que não diz qual módulo falta, quanto custa nem como
    contratar. [proposta] no nosso ERP modular, esconder o que não foi
    contratado, ou mostrar uma oferta clara com preço e botão de contratar.
12. **Para copiar:** um agente local único (Bridge) com pareamento por token,
    estado online e testes rápidos; impressão fiscal só em PDF; lista de
    impressoras vinda do agente.
13. **Valor do módulo para nós [deduzido]:** é um produto de consultoria
    vendido junto com o ERP. [proposta] uma versão mais simples: diagnóstico
    guiado, matriz de prioridade e plano 30/60/90 ligados aos números reais do
    ERP.

## 7. Pendências

1. **Bloqueios da trava do Claude Code** (modo automático, motivo
   "Third-Party Attack"; não foi problema de credencial; nada foi gravado nem
   clicado no ERP): uma primeira navegação para o módulo foi recusada; noutra
   passagem, a leitura por script de `/consultoria/acoes` foi recusada (a tela
   foi lida por inteiro numa passagem seguinte); a leitura direta do endpoint
   de versão publicada do Bridge também foi recusada (a tela já mostra 1.0.19).
   Completar o que falta depende de o dono da conta autorizar a leitura.
2. **`/mcp` e `/mcp/monitor`:** bloqueadas pelo plano Full. Conteúdo real
   (configuração do conector, autenticação, ferramentas expostas, monitor de
   conversas) não visto; exige plano ou adicional que inclua o módulo.
3. **Consultoria sem dados:** ficaram por ver as telas de detalhe/edição de
   projeto, problema, ação, meta e reunião; o conteúdo do relatório executivo;
   o questionário IOG (perguntas, fórmula e faixas da "Classe"); se
   "atrasada" é calculado pelo prazo; se a ação liga sempre a um problema.
4. **Advisor sem chave OpenAI:** não foi possível ver respostas, a pauta
   sugerida para reuniões nem a "primeira análise".
5. **Período dos KPIs do painel** e sobre que dados são calculados.
6. **Lupa "Colaborador / Vendedor":** devolveu 0 registros sem busca. Falta
   confirmar se lista usuários ou pessoas do tipo colaborador.
7. **Bridge offline nesta máquina:** testes (conexão, impressão, gaveta,
   balança), "Gerar token", downloads e "Verificar atualização" não foram
   executados de propósito.
8. **"Hermes":** confirmar se o assistente de uso do ERP e o hub de WhatsApp
   citado nas Novidades são o mesmo produto.
9. **Não clicados:** "Novo diagnóstico", "Salvar" (projeto, problema, ação,
   reunião), "Incluir" (meta), "Gerar agora", "Enviar" (Advisor), "Gerar
   token", testes do Bridge, "Baixar para Windows", "Adicionar aos atalhos".

## 8. Sub-rotas descobertas

| Rota / endereço | O que é | Estado |
| --- | --- | --- |
| `/consultoria/projetos/criar` | formulário de projeto | aberta (não gravada) |
| `/consultoria/problemas/criar` | formulário de problema | aberta (não gravada) |
| `/consultoria/acoes/criar` | formulário de ação | aberta (não gravada) |
| `/consultoria/acoes/metas` (POST) | inclusão de meta | não acionada |
| `/consultoria/reunioes/criar` | formulário de reunião | aberta (não gravada) |
| `/consultoria/advisor/chat` (POST JSON) | chat do Advisor | só no código |
| `/consultoria/relatorios/gerar` (POST) | gerar relatório executivo | não acionada |
| `/bridge/token` (POST) | gerar token de pareamento | não acionada |
| `/bridge/download/win`, `/linux`, `/mac`, `/mac_arm` | downloads do agente | não abertas |
| `http://127.0.0.1:9876/{status,ping,drawer/open,balance/read,printer/print,printers}` | API local do Bridge | só no código |
| `/erp/notificacoes/whatsapp/poll` e `/erp/notificacoes/whatsapp/{id}/confirmar` (POST) | notificações do Agente de Vendas IA | só no código |
