# 915 — Lacunas, lote 16: Consultoria (ações, reuniões, Advisor, relatórios), MCP, Bridge, Parâmetros e Assinatura

> Exploração **só de leitura** feita em 2026-10-03 na conta de teste "Boi Criolo"
> (plano Full), numa aba própria do navegador embutido. Nada foi gravado,
> gerado, baixado, pago ou enviado. CNPJ, IP, tokens e nomes de pessoas foram
> omitidos. Os textos da interface estão resumidos com palavras próprias.
>
> Este lote cobre rotas que tinham ficado por abrir nos ficheiros
> `17-consultoria-ia.md` e `18-parametros-plano-comissoes.md`. Desta vez as
> páginas abriram normalmente.

## Estado das rotas

| Rota | Estado | O que é |
| --- | --- | --- |
| `/consultoria/acoes` | lida (lista, filtros, "Nova ação", metas) | Plano de ação 30/60/90 |
| `/consultoria/reunioes` | lida (lista e "Nova reunião") | Reuniões de gestão com ata e tarefas |
| `/consultoria/advisor` | lida (chat desativado: sem chave OpenAI) | Consultor de gestão com IA |
| `/consultoria/relatorios` | lida (vazia; "Gerar agora" não clicado) | Relatório executivo |
| `/mcp` | **bloqueada pelo plano** ("função não está no seu plano") | MCP / Conector IA |
| `/mcp/monitor` | **bloqueada pelo plano** | Monitor do agente de vendas IA no WhatsApp |
| `/bridge` | lida | Agente desktop para hardware local |
| `/parametros-sistema` | lida (8 abas) | Parâmetros de hardware, PDV, TEF, balança |
| `/parametros/campos-obrigatorios` | lida (2 abas) | Campos obrigatórios em cliente e produto |
| `/dashboard/modulo/mensalidades` | lida | Hub da assinatura (3 atalhos) |
| `/minha-assinatura` | lida | Créditos, próxima mensalidade e faturas |
| `/meu-plano` | lida | Plano atual, módulos e troca de plano |

Rotas abertas de passagem para entender as relações (não estavam na lista):
`/dashboard/modulo/consultoria`, `/consultoria`, `/consultoria/projetos`,
`/consultoria/projetos/criar`, `/consultoria/problemas`,
`/consultoria/problemas/criar`, `/consultoria/diagnosticos`,
`/consultoria/acoes/criar`, `/consultoria/reunioes/criar`,
`/dashboard/modulo/parametros`, `/meus-termos` e `/meus-termos/{uuid}`.

## Visão geral

O lote junta três blocos que, no ERP da Olímpia, estão espalhados por menus
diferentes:

1. **Consultoria / Gestão 360°.** Um método de consultoria de gestão embutido
   no ERP. O ciclo é: projeto de consultoria → diagnóstico IOG por área →
   problemas priorizados → plano de ação em 30/60/90 dias com metas → reuniões
   de acompanhamento → relatório executivo. Uma IA (OpenAI), o "Olimpia
   Advisor", lê os indicadores do tenant e responde perguntas de gestão. As
   quatro telas de consultoria deste lote são etapas desse ciclo. É o último
   módulo da lista do plano Full ("Consultoria / Gestão 360°").
2. **Integrações técnicas.** O "Olimpia Bridge" é um programa instalado no PC
   da loja que expõe impressora, gaveta, balança, leitor e certificado ao
   navegador por uma API local. O "MCP / Conector IA" e o "Monitor WhatsApp IA"
   estão **fora do plano Full** e não abriram. Pelo código global das páginas
   dá para saber que existe um **agente de vendas com IA no WhatsApp** que
   registra vendas e orçamentos no ERP.
3. **Parâmetros e conta.** Os parâmetros de hardware e PDV são herdados de um
   sistema desktop em Delphi. A tela chama-se "FrmParametros_INI" e grava na
   mesma tabela `parametros_ini` usada pelo cliente desktop. Também entram aqui
   os campos obrigatórios configuráveis e a assinatura, que funciona por
   **créditos**: cada pagamento soma 30 dias de acesso. Há ainda planos com
   módulos e termos de uso com aceite eletrônico auditável.

Indícios técnicos vistos de passagem: rotas com nome no estilo Laravel
(`consultoria.acoes.index`, `mcp.index`, `bridge.index`), `_token` CSRF e
`_method=PUT/PATCH` nos formulários, caminhos `storage/app/...`, Bootstrap 5 e
SweetAlert2. Um componente genérico de pesquisa ("lupa") serve para escolher
registos relacionados.

---

## Telas

### 1. `/consultoria/acoes` — Plano 30 / 60 / 90

**Objetivo:** lista e acompanha as ações do plano de melhoria, divididas em três
horizontes: 30, 60 e 90 dias. Cada ação pode nascer de um problema
diagnosticado.

**Cabeçalho:** título "Plano 30 / 60 / 90" e contadores "Atrasadas · Abertas ·
Concluídas". O botão **Nova ação** leva a `/consultoria/acoes/criar`.

**Filtros:** formulário GET. Os parâmetros ficam na URL, por exemplo
`?fase=30&status=atrasada`.

| Filtro | Tipo | Opções |
| --- | --- | --- |
| Fase | select | (todas), 30 dias, 60 dias, 90 dias |
| Status | select | (todos), aberta, atrasada, concluida |

Botão **Filtrar**. O filtro não tem a opção "cancelada", embora o formulário a
tenha.

**Colunas da lista:** Fase · Ação · Responsável · Prazo · Indicador · Status.
Sem registos aparece "Nenhuma ação.".

**Rodapé "Dados complementares":** é um componente genérico do ERP que também
aparece em Projetos e Problemas. Ao clicar numa linha, mostra pares
chave: valor do registo e liga o botão **Alterar** ao endereço de edição dessa
linha. A primeira linha é selecionada sozinha quando a página carrega.

**Bloco "Metas"** (na mesma página): formulário em linha que envia um POST para
`/consultoria/acoes/metas`. Por baixo fica a lista de metas, hoje "Sem metas.".

| Campo | Tipo | Obrigatório |
| --- | --- | --- |
| Meta (`titulo`) | texto | sim |
| Indicador | texto | não |
| Valor (`valor_meta`) | número | não |
| Prazo | data | não |

Botão **Incluir** (não clicado).

**Formulário "Nova ação"** (`/consultoria/acoes/criar` → POST `/consultoria/acoes`):

| Campo | Tipo | Obrigatório | Opções / observação |
| --- | --- | --- | --- |
| `id_project` | oculto | — | vale 0 quando não há projeto ativo |
| Título | texto | sim | — |
| Fase | select | — | 30 dias (padrão), 60 dias, 90 dias |
| Problema de origem | select | não | "—" + problemas cadastrados (hoje só "—") |
| Responsável | pesquisa (lupa) | não | modal "Pesquisar — Colaborador / Vendedor" |
| Prazo | data | não | — |
| Indicador | texto | não | texto livre (não liga a um KPI) |
| Meta | texto | não | texto livre |
| Descrição | área de texto | não | — |
| Status | select | — | aberta (padrão), atrasada, concluida, cancelada |

Botões **Salvar** (não clicado) e **Voltar**.

**Modal de pesquisa (lupa):** campo de busca por "código ou descrição", botão
Buscar, colunas Código · Nome · CPF/CNPJ, paginação "Página X de Y (N
registros)" com Anterior/Próximo, botão **Cadastrar novo** (cadastro rápido) e
uma barra de seleção múltipla ("Adicionar selecionados"), escondida no modo de
escolha única. Ao abrir, mostrou 0 registos antes de qualquer busca.

**Regras observadas**

- "Atrasada" é um status que o utilizador escolhe à mão. Não ficou claro se o
  sistema também o calcula pelo prazo.
- Uma ação liga-se ao projeto ativo (campo oculto) e, se quiser, a um problema.
- As tarefas marcadas numa reunião viram ações (ver Reuniões).
- O Painel 360° resume o plano: total, abertas, atrasadas, concluídas e a
  divisão 30/60/90.

### 2. `/consultoria/reunioes` — Reuniões de gestão

**Lista:** título "Reuniões de gestão" e botão **Nova reunião**
(`/consultoria/reunioes/criar`). Colunas: Data · Título · Status. Não há
filtros nem busca. Sem registos aparece "Nenhuma reunião.".

**Formulário "Nova reunião"** (POST `/consultoria/reunioes`):

| Campo | Tipo | Obrigatório | Opções / observação |
| --- | --- | --- | --- |
| Título | texto | sim | — |
| Data/hora | data e hora | não | — |
| Participantes | texto | não | texto livre, sem ligação a utilizadores |
| Status | select | — | agendada (padrão), realizada, cancelada |
| Ata | área de texto | não | — |
| Próximos passos | área de texto | não | — |
| Tarefas da reunião | 3 linhas fixas | não | cada linha: Tarefa (texto), Prazo (data) e a caixa **"Criar ação 30/60/90"** |

Há também um bloco escondido, "pauta do Advisor", que serve para mostrar uma
pauta sugerida pela IA. Nesta página nenhum script o preenche. Provavelmente só
aparece quando a reunião é aberta a partir do Advisor, com a IA ativa.

**Regras observadas**

- Cada tarefa com a caixa marcada vira uma ação no Plano 30/60/90 quando a
  reunião é salva.
- O formulário tem só 3 linhas de tarefa e nenhum botão para acrescentar mais.

### 3. `/consultoria/advisor` — Olimpia Advisor

**Objetivo:** um consultor de gestão com IA (OpenAI) que lê o IOG, os KPIs, os
problemas e as ações do tenant e responde perguntas. A própria tela separa o
Advisor do "Hermes", o assistente de uso do ERP que fica no botão flutuante
"Assistente Olimpia" e responde dúvidas de vendas, PDV, OS, notas fiscais e
parâmetros.

**Estado na conta de teste:** aparece um aviso de que falta a chave OpenAI. Quem
a cadastra é o **Super Admin da plataforma**, em "Integrações → OpenAI
Advisor". O cliente não consegue ativar sozinho. O campo de pergunta fica
desativado.

**Interface:** uma área de conversa (log) e um campo de pergunta (até 4000
caracteres) com exemplos no placeholder, como "onde está o capital parado?" e
"quais ações atrasaram?". Botão **Enviar**.

**Funcionamento (lido no script da página)**

- Envia um POST JSON para `/consultoria/advisor/chat` com `message`,
  `session_id` e `history` (as últimas 8 mensagens). A resposta vem em
  `reply`.
- O `session_id` junta tenant, empresa e utilizador no formato
  `advisor-t{tenant}-e{empresa}-u{usuario}`.
- O histórico vive só na memória da página e perde-se ao recarregar.
- Em caso de erro, mostra um alerta (SweetAlert).

Noutras telas do módulo, o Advisor também faz a "primeira análise" (o
diagnóstico IOG automático). Se não houver projeto, cria um sozinho.

### 4. `/consultoria/relatorios` — Relatórios executivos

**Lista:** colunas Período · Título · (coluna de ações). Hoje mostra "Nenhum
relatório.". Não há filtros.

**Ação:** o botão **Gerar agora** envia um POST para
`/consultoria/relatorios/gerar`. **Não foi clicado.** Não há escolha de período
nem pré-visualização. O conteúdo do relatório ficou por ver.

### 5. Contexto do módulo Consultoria (visto de passagem)

- **`/dashboard/modulo/consultoria`:** hub com 8 atalhos: Painel Gestão 360°,
  Projeto, Diagnóstico IOG, Problemas, Plano 30/60/90, Reuniões, IA Advisor e
  Relatório executivo.
- **`/consultoria` (Painel Gestão 360°):** indica "Sem projeto ativo" e tem
  botões Diagnóstico e IA Advisor. Mostra estes KPIs: **Faturamento, Margem,
  Ticket médio, Qtd. vendas, Valor em estoque, Estoque parado, Inadimplência e
  Receber vencido**. Tem ainda o "IOG por área", o "Histórico IOG" (Data · IOG
  · Classe) e o resumo do plano de ação com o botão "Abrir plano".
- **`/consultoria/projetos`:** filtros Busca e Status (Todos, Ativo,
  Encerrado); colunas Nome · Produto · Status · Início. O formulário tem: Nome
  (obrigatório), Produto (Diagnóstico, Gestão 90 dias, Gestão contínua),
  Segmento, Início, Fim, Responsável interno (lupa), Status (Ativo, Encerrado),
  Dor 1, Dor 2, Dor 3 e Observação.
- **`/consultoria/diagnosticos`:** um questionário por área, com pontuação
  Sim 10, Parcial 5 e Não 0, ou então a primeira análise feita pelo Advisor.
  Colunas Data · Status · IOG · Classe. O botão "Novo diagnóstico" é um POST
  que cria o registo na hora (não clicado).
- **`/consultoria/problemas`:** "matriz de prioridade" Impacto × Urgência ×
  Facilidade, cada um de 1 a 5; o maior score é atacado primeiro. Colunas
  Prioridade · Título · Gravidade · I · U · F · Status. O formulário tem:
  Título (obrigatório), Área, Descrição/evidência, Gravidade (Baixa, Média,
  Alta, Crítica), Impacto, Urgência e Facilidade (de 1 a 5, padrão 3), Impacto
  em texto, Recomendação e Status (aberto, em_acao, resolvido). Os campos
  ocultos `id_project` e `id_diagnostic` ligam o problema ao projeto e ao
  diagnóstico.
- **As 8 áreas de gestão** (as mesmas do IOG): Estratégia e governança;
  Comercial e vendas; Financeiro e fluxo de caixa; Estoque e compras; Operações
  e processos; Pessoas e liderança; Indicadores e informação; Cliente e
  pós-venda.

### 6. `/mcp` — MCP / Conector IA (bloqueada)

A página abre, mas mostra "Esta função não está no seu plano — Plano: Full — o
módulo necessário não está disponível". Há um único botão, "Ir ao dashboard".
O nome interno da rota é `mcp.index`. Mesmo assim, o atalho aparece no hub de
Parâmetros e na busca rápida (Ctrl+K), descrito como "MCP / Conector IA". A
tela do Bridge diz que a configuração do MCP passou para esta tela própria. O
MCP **não consta** da lista de 36 módulos do plano Full, por isso parece ser um
adicional vendido à parte.

### 7. `/mcp/monitor` — Monitor WhatsApp IA (bloqueada)

Mostra o mesmo bloqueio de plano (rota `mcp.monitor`). Não foi possível ver a
tela, mas o **layout global do ERP** revela o que ela monitora:

- Todas as páginas consultam `/erp/notificacoes/whatsapp/poll` a cada 10
  segundos. Na primeira consulta o parâmetro é `bootstrap=1`; depois é
  `apos={último id}`, e o último id fica guardado na sessão do navegador.
- Quando chega uma notificação, abre-se o modal **"Novo pedido WhatsApp"**,
  com o aviso de que o "Agente de Vendas IA" registrou uma nova operação. O
  modal mostra: Tipo (Orçamento ou Venda), Cliente, WhatsApp, Total e
  Data/hora. Tem os botões **Ver operação** e **Confirmar recebimento**; este
  último envia um POST para `/erp/notificacoes/whatsapp/{id}/confirmar`.
- As notificações formam uma fila. Se o operador fechar o modal sem confirmar,
  a notificação volta para a fila.

Conclusão (inferência): existe um agente de IA que atende clientes no WhatsApp
e, através do conector MCP, cria vendas e orçamentos no ERP. A equipe da loja
recebe o aviso e confirma.

### 8. `/bridge` — Olimpia Bridge

**Objetivo:** configurar e testar o agente desktop que faz impressão, gaveta,
balança, leitor e certificados no computador da loja.

**Topo:** botão **Baixar para Windows 64-bit** (`/bridge/download/win`, não
clicado) e botão **Verificar atualização**, que consulta a versão publicada.

**Cartão "Status"**

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

**Cartão "Pareamento":** um campo de token (tipo senha, só leitura), um botão
de copiar e o botão **Gerar token**, que envia um POST para `/bridge/token`
(não clicado). Pela instrução da tela: o utilizador cola o token nas
configurações do Bridge; o Bridge valida o token no ERP e preenche
tenant/empresa sozinho. O navegador fala com `localhost:9876` e o servidor do
ERP nunca acessa USB ou serial.

**Cartão "Testes rápidos":** Testar conexão (ping e status), Imprimir teste
(texto curto), Abrir gaveta e Ler balança (peso em kg). O resultado aparece
num bloco de saída. Nenhum foi clicado.

**Cartão "MCP / Conector IA":** só tem um link para `/mcp`.

**API local do Bridge** (lida no script cliente público da página):

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

**Regras do cliente JS**

- O estado "online" fica em cache por 8 segundos.
- Há 3 modos: 0 = desligado, 1 = sempre Bridge, 2 = automático (usa o Bridge
  se estiver online).
- Etiquetas em ZPL, EPL ou ESC-POS vão **uma por job**, com 250 ms de
  intervalo, porque a Elgin L42 enche o buffer.
- Uma folha de etiquetas em grade é montada como um único SVG, convertido em
  PNG (300 dpi por padrão) e enviado num job só. Os parâmetros são colunas,
  largura e altura em mm, espaçamentos e margens.
- Documentos do ERP são impressos preferindo PDF (`?pdf=1`). Documentos
  fiscais (DANFE/DANFC-e) **só aceitam PDF**, sem alternativa. Os demais, se
  não houver PDF, saem como texto extraído do HTML.
- Os documentos fiscais vão para a "impressora NFC-e"; o resto vai para a
  impressora padrão.

### 9. `/parametros-sistema` — Parâmetros do Sistema

**Objetivo:** parâmetros de hardware, PDV, TEF, balança e leitor. São
partilhados com o cliente desktop Delphi: o subtítulo da tela diz que a origem
é o FrmParametros_INI e que tudo grava em `parametros_ini`. O formulário é
único (PUT `/parametros-sistema`) e tem 8 abas.

**Aba Geral** (nota da aba: séries fiscais e certificado ficam em Fiscal →
Séries e no cadastro da empresa)

| Campo | Tipo | Opções / observação |
| --- | --- | --- |
| Caminho layouts (DANFE/DANFCe) | texto + botão pasta | o botão preenche a sugestão `storage/app/parametros-ini/` |
| Impressora NFC-e / DANFC-e (PDF) | texto com sugestões | — |
| Impressora de etiquetas (Elgin L42 / Bridge) | texto com sugestões | — |
| Reenviar NFC-e automaticamente | select | Não / Sim |
| Fazer backup ao fechar o sistema | select | Não / Sim (só faz sentido no desktop) |
| Travar login empresa | select | Não / Sim |
| Loja travada | select | lista de empresas; **só fica ativo com "Travar login = Sim"** |

As sugestões de impressora são uma lista fixa, sem deteção: Microsoft Print to
PDF, XPS, EPSON TM-T20, EPSON TM-T88, Bematech MP-4200 TH, Elgin i9 e Daruma
DR800.

**Aba Balança**

- Configuração serial:
  - Modelo: Nenhuma, Filizola, Toledo.
  - Porta serial: COM1 a COM8.
  - Baud rate: 110 a 57600.
  - Data bits: 5 a 8.
  - Paridade: none, odd, even, mark, space.
  - Stop bits: 1, 1,5, 2.
  - Handshaking: Nenhum, XON/XOFF, RTS/CTS, DTR/DSR.
- Teste da balança: botões Ativar, Desativar e Ler peso, mais os campos "Peso
  lido" e "Resposta". Os botões enviam um POST para
  `/parametros-sistema/serial` com `acao` igual a `balanca_ativar`,
  `balanca_desativar` ou `balanca_ler_peso`.
- Nota da tela: o PDV web (Chrome/Edge) lê a balança pela **Web Serial API**
  com estes parâmetros. Na primeira vez, escolhe-se a porta USB no PDV (F9 →
  Porta USB). O teste com ACBrBAL continua só no cliente desktop.

**Aba Etiqueta / Carga**

- Etiqueta da balança:
  - Modelo: Filizola, Toledo.
  - Tipo de leitura: Peso ou Valor.
  - Dígitos da balança e dígitos do produto (números).
  - Exportar automaticamente: Não / Sim.

  Isto define como o PDV interpreta o código de barras impresso pela balança.
- Carga da balança:
  - Caminho dos arquivos (texto).
  - Modelo: Filizola, Toledo MGV7, Toledo MGV5, Urano, Urano S, Urano URF32.
  - Botão **Exporta**: envia um POST para
    `/parametros-sistema/exportar-balanca` com caminho e modelo, mostra uma
    barra de progresso e baixa um ZIP (`carga-balanca.zip`). Não foi clicado.
- Nota para o MGV7: extrair o ZIP, importar o arquivo de itens no software da
  balança e remover antes os arquivos antigos.

**Aba Gaveta**

- Modelo: Epson, Bematech, Sweda, Elgin.
- Conexão USB: Não / Sim.
- Porta da gaveta: texto com sugestões de impressora.
- Botão **Testar gaveta**: envia um POST para
  `/parametros-sistema/testar-gaveta`.

**Aba PDV**

- Cores do PDV, cada uma com seletor de cor e campo `#RRGGBB`: Descritivos,
  Painel lateral, Painel topo, Painel rodapé, Texto.
- Opções do PDV (Não / Sim):
  - Bloquear pesquisa por descrição.
  - Imprimir CP/NF direto (ficha bar).
  - Abrir tela de mesas automaticamente.
- TEF DIAL:
  - TEF ativo (Não / Sim).
  - Time sleep (ms) e Time status (números).
  - Auto ativar G.P. (gerenciador padrão).
  - Múltiplos cartões.
  - Auto finalizar cupom.
  - CHQ em gerencial.

**Aba Leitor / Busca preço**

- Leitor serial (ACBrLCB):
  - Usar leitor serial: Não / Sim.
  - Porta: COM1 a COM5, LPT1 a LPT3.
  - Baud rate: 1200 a 19200.
  - Data bits.
  - Sufixo e Excluir sufixo.
  - Handshake.
  - Hardware flow e Software flow.
  - Paridade e Stop bits.
  - Botões Ativar, Desativar e Emulador, com o estado "ACBrLCB — DESATIVADO".
    Também usam `/parametros-sistema/serial`.
- Busca preço: um campo com o caminho do arquivo de busca de preço e o botão
  **Enviar**. Este envia um POST para `/parametros-sistema/busca-preco`, que
  gera e baixa o arquivo para o terminal consulta-preço.

**Aba Olimpia Bridge**

- Hardware no PDV:
  - Desligado (padrão atual): Web Serial no navegador e gaveta pelo servidor.
  - Olimpia Bridge: hardware local através do agente.
  - Automático: usa o Bridge se estiver online; senão, o modo padrão.
- Impressora Bridge (opcional).
- Cartão de download:
  - Windows 64-bit (105 MB).
  - Linux AppImage ("em breve").
  - macOS Intel (104 MB).
  - macOS Apple Silicon (100 MB).
  - A tela sugere o sistema detetado e diz que não é preciso Node.js.
- Link "Configuração completa do Bridge" (`/bridge`).

**Aba Skin:** temas Office2019 (Colorful, White, Black, DarkGray), DevExpress
Style, DevExpress Dark Style, The Asphalt World, Liquid Sky e London Liquid
Sky. Segundo a tela, valem **só para o cliente desktop Delphi/DevExpress**.

**Rodapé**

- **Gravar** (não clicado).
- **Fechar**: o link aponta para `/erp/notificacoes/whatsapp/poll`, um
  endpoint JSON de polling. É um bug: o "voltar para a página anterior" foi
  apanhado por um pedido em segundo plano.
- Atalhos: Cadastro de séries (`/fiscal-series`), NF-e | NFC-e (`/nfce`) e
  Empresa (CRT / tributos) (`/empresa/1`).

### 10. `/parametros/campos-obrigatorios` — Campos obrigatórios

**Objetivo:** cada tenant escolhe que campos são obrigatórios no cadastro de
**cliente** e de **produto**. A escolha vale também para o cadastro rápido
feito durante a venda.

**Estrutura:** duas abas, Cliente e Produto. Cada aba é um formulário próprio
(PUT, com `entidade` oculta igual a `cliente` ou `produto`), com interruptores
em forma de "pílula" agrupados por tema. O botão é **Salvar cliente** ou
**Salvar produto**. A mensagem da tela diz que um campo marcado impede salvar
quando está vazio. Os itens marcados com ✔ abaixo estavam ligados na conta de
teste; alguns trazem uma ajuda sobre a NF-e.

| Entidade | Sempre obrigatórios | Grupo | Campos configuráveis |
| --- | --- | --- | --- |
| Cliente | Nome / Razão social, Status | Identificação | CPF/CNPJ ✔ (necessário para NF-e/NFC-e identificada), RG / Inscrição estadual, Apelido / Fantasia |
| | | Contato | Telefone, E-mail |
| | | Endereço | CEP ✔, Endereço ✔, Número ✔, Complemento, Bairro ✔, Município ✔ (código IBGE) |
| | | Comercial | Vendedor padrão, Rota |
| Produto | Descrição, Status | Identificação | GTIN/EAN, Referência fábrica, Referência loja, Unidade de medida ✔, Descrição reduzida |
| | | Classificação | Grupo, Subgrupo, Fabricante, Cor |
| | | Fiscal | NCM ✔ (necessário para NF-e/NFC-e), CEST |
| | | Dimensões | Peso líquido, Peso bruto |

### 11. `/dashboard/modulo/mensalidades` — Hub de Mensalidades

Página de atalhos com 3 cartões: **Minhas faturas** (`/minha-assinatura`),
**Meu Plano** (`/meu-plano`) e **Termos de Uso** (`/meus-termos`). Cada cartão
tem uma estrela para fixar nos favoritos do menu (não clicada). O atalho
"Mensalidades" da barra lateral salta este hub e vai direto para
`/minha-assinatura`. Por isso, as duas rotas não são a mesma coisa: uma é o
hub e a outra é a tela de faturas.

### 12. `/minha-assinatura` — Mensalidade

- **Cabeçalho:** diz que a mensalidade se paga por PIX ou boleto e mostra o dia
  de pagamento (05) e o valor (R$ 799,00/mês). Tem o botão "Ver meu plano".
- **Cartão "Situação da assinatura":** barra de créditos (47%, cerca de 14 de
  30 dias), o texto "14 dias de crédito restantes · válido até 17/10/2026" e o
  plano atual (Full).
- **Alerta amarelo** com os dias restantes e a data de vencimento.
- **Cartão "Próxima mensalidade":** explica que a cobrança só é gerada quando o
  cliente quiser pagar adiantado. O botão **Pagar próxima mensalidade** envia
  um POST para `/minha-assinatura/proxima/pagar` (não clicado).
- **Tabela "Minhas faturas"** (com contador de registos): Mensalidade ·
  Vencimento · Valor · Status · Forma · Ação. Hoje está vazia, com a mensagem
  de que não há mensalidade disponível para pagamento.

### 13. `/meu-plano` — Meu plano

- **Regra:** só o administrador do sistema pode trocar o plano.
- **Créditos de uso:** cada pagamento soma 30 dias de acesso e os créditos
  descem um por dia. Há uma barra, os dias restantes e o botão
  "Mensalidade / faturas".
- **Plano atual:** Full ("plataforma completa: RH, OS, portais, compras,
  cobrança automática, BI e Gestão 360°, com suporte Olímpia"). Tipo Pago,
  valor R$ 799,00/mês, créditos até 17/10/2026, lista de módulos (abaixo).
- **Trocar plano:** PATCH `/meu-plano` com o rádio `plano_id`.

| Plano | id | Preço/mês | Módulos | Resumo na tela |
| --- | --- | --- | --- | --- |
| Profissional | 2 | R$ 299,90 | 17 | PME: NF-e, NFC-e, bancos, PIX, TEF e CRM/markup; até 20 utilizadores |
| Premium | 4 | R$ 499,90 | 25 | Omnicanal: loja, cardápio, Mercado Livre, delivery, força de vendas, CT-e/MDF-e |
| Full (atual) | 5 | R$ 799,00 | 36 | Tudo, incluindo RH, OS, portais, compras, cobrança automática, BI e Gestão 360° |

- O botão **Contratar plano selecionado** (não clicado) abre um `confirm()`
  nativo. O aviso diz que planos pagos exigem pagamento imediato para liberar
  créditos e que planos trial ou gratuitos são aplicados na hora. Os planos
  pagos redirecionam para PIX ou boleto. Faltam os ids 1 e 3: provavelmente
  são planos trial ou gratuitos, escondidos.
- **Os 36 módulos do Full**, pela ordem da tela: ERP (Dashboard), Cadastros,
  Parâmetros & Empresa, Vendas, Financeiro (Contas a Pagar/Receber, Caixa),
  Estoque & Entradas, PDV / Frente de Caixa, Cashback, Relatórios, Balcão de
  Entrega, Painel de Preços, Emissão NF-e, Emissão NFC-e, Bancos (contas,
  movimentação, conciliação, boletos), PIX, TEF, CRM / Markup, sinuca, Emissão
  CT-e, Emissão MDF-e, Loja Virtual, Comanda Digital / Cardápio, Mercado Livre,
  Delivery Próprio, Força de Vendas (Android), Produção, Ponto Eletrônico,
  Folha de Pagamento, Portal do Colaborador, Ordem de Serviço, Portal do
  Cliente, Assinatura Eletrônica, Compras e Suprimentos, Cobrança Automática,
  BI Executivo, Consultoria / Gestão 360°.
- **Hipótese (não confirmada):** a ordem bate com os escalões. Os 17 primeiros,
  até "CRM / Markup", seriam o Profissional. Os 8 seguintes, até "Força de
  Vendas", completariam o Premium (25). Os 11 últimos seriam exclusivos do
  Full. MCP e WhatsApp IA não estão em nenhum plano.

### 14. `/meus-termos` e `/meus-termos/{uuid}` — Termos de Uso (sub-rota do hub)

- **Termo vigente:** versão 1.1, publicada em 07/08/2026, com o selo "ACEITO".
- **"Aceites registrados":** colunas Versão · Data do aceite · Responsável ·
  CNPJ registrado · Status · Ações (Ver, Imprimir → `/meus-termos/{uuid}/imprimir`,
  esta última não aberta).
- **Detalhe do aceite:** registo eletrônico com Empresa, Nome fantasia, CNPJ
  na época, Responsável, Utilizador/login, Data e hora, IP, Versão (com o
  estado "vigente"), UUID e **hash SHA-256**, seguido do **conteúdo exato
  aceito** (markdown da versão).
- **Conteúdo do termo:** 38 secções. As mais ligadas a este lote dizem que:
  - a mensalidade é recorrente e o valor pode variar por plano, utilizadores,
    empresas, módulos, terminais, armazenamento, integrações e volume;
  - a inadimplência pode levar a restrição de funções, suspensão ou
    cancelamento, e a reativação depende de pagar;
  - resultados de IA podem ter erros e devem ser conferidos;
  - após o cancelamento, os dados ficam guardados pelo prazo legal e depois são
    apagados ou anonimizados;
  - uma nova versão do termo pode exigir novo aceite.

---

## Fluxos de ponta a ponta

1. **Ciclo de consultoria (Gestão 360°)**
   1. Criar o projeto: produto Diagnóstico, Gestão 90 dias ou Gestão contínua;
      segmento, datas, responsável interno e as 3 dores.
   2. Fazer o diagnóstico IOG: questionário por área (Sim 10 / Parcial 5 /
      Não 0) ou primeira análise pelo Advisor, que cria o projeto se faltar.
      O resultado é um IOG por área, uma classe e o histórico.
   3. Registar problemas: área, gravidade e notas I, U, F, cujo produto dá a
      prioridade; há também recomendação e status.
   4. Montar o plano 30/60/90: ações ligadas ao problema de origem, com
      responsável, prazo, indicador e meta, mais as metas numéricas.
   5. Fazer reuniões de gestão: ata, próximos passos e tarefas, que podem
      virar ações.
   6. Usar o Advisor para tirar dúvidas sobre KPIs e ações.
   7. Gerar o relatório executivo sob demanda.
   8. Acompanhar tudo no Painel 360° (KPIs, IOG, resumo do plano).
2. **Hardware local com o Bridge**
   1. Baixar e instalar o agente no PC da loja.
   2. Em `/bridge`, gerar um token e colá-lo no agente, que valida o token e
      preenche tenant e empresa.
   3. Em Parâmetros → aba Olimpia Bridge, escolher o modo (desligado, Bridge
      ou automático) e, se quiser, a impressora.
   4. O PDV e as telas de etiquetas e documentos chamam
      `127.0.0.1:9876`.
   5. Os testes rápidos confirmam impressora, gaveta e balança.
3. **Balança de pesagem**
   1. Configurar a etiqueta da balança (modelo, peso ou valor, dígitos). O PDV
      passa a decodificar o código de barras pesado.
   2. Para a carga de itens: escolher o modelo (MGV5, MGV7, Filizola,
      Urano), exportar o ZIP e importá-lo no software da balança.
4. **Assinatura por créditos**
   1. O plano define o valor.
   2. Cada pagamento soma 30 dias.
   3. Os créditos descem um por dia e aparece um alerta com os dias restantes.
   4. "Pagar próxima mensalidade" gera uma cobrança PIX ou boleto adiantada,
      que aparece em "Minhas faturas".
   5. Para trocar de plano (só o administrador): um plano pago exige
      pagamento imediato; um trial ou gratuito vale na hora.
5. **Termos de uso**
   1. A plataforma publica uma versão.
   2. O cliente aceita eletronicamente e fica registado quem aceitou, quando,
      de que IP, com UUID e hash.
   3. Esse histórico pode ser consultado e impresso.
6. **Agente de vendas IA no WhatsApp (inferido)**
   1. Um cliente conversa no WhatsApp com o agente de IA.
   2. O agente registra uma venda ou orçamento no ERP através do MCP.
   3. As páginas do ERP fazem polling a cada 10 s e mostram o modal "Novo
      pedido WhatsApp".
   4. O operador clica em "Ver operação" e depois em "Confirmar recebimento".
7. **Campos obrigatórios**
   1. O administrador liga os campos que quer obrigar.
   2. A partir daí, salvar um cliente ou produto (completo ou rápido, na
      venda) é bloqueado se esses campos estiverem vazios.

## Entidades e relações

| Entidade | Campos principais | Relações |
| --- | --- | --- |
| Projeto de consultoria | nome, produto (diagnostico, gestao_90, continua), segmento, data_inicio, data_fim, id_responsavel, status (ativo, encerrado), dor_1..3, observacao | 1 projeto ativo por tenant/empresa; tem diagnósticos, problemas, ações, metas |
| Diagnóstico IOG | data, status, IOG, classe, respostas por área | pertence ao projeto; origina problemas |
| Área de gestão | 8 áreas fixas | classifica perguntas do IOG e problemas |
| Problema | titulo, id_area, descricao, gravidade, impacto, urgencia, facilidade, impacto_texto, recomendacao, status (aberto, em_acao, resolvido); prioridade = I×U×F | projeto, diagnóstico; origina ações |
| Ação (plano) | titulo, fase (30/60/90), id_problem, id_responsavel, prazo, indicador, meta, descricao, status (aberta, atrasada, concluida, cancelada) | projeto, problema, colaborador; pode vir de tarefa de reunião |
| Meta | titulo, indicador, valor_meta, prazo | provável ligação ao projeto ativo |
| Reunião de gestão | titulo, data_hora, participantes (texto), status (agendada, realizada, cancelada), ata, proximos_passos | tem tarefas |
| Tarefa de reunião | titulo, prazo, criar_acao | gera ação ao salvar |
| Relatório executivo | período, título, conteúdo | gerado a partir de KPIs, IOG e ações (provável) |
| Sessão do Advisor | session_id (tenant + empresa + utilizador), histórico de até 8 mensagens no navegador | lê KPIs, IOG, problemas, ações |
| Integração OpenAI | chave | nível plataforma (Super Admin), não do tenant |
| Pareamento Bridge | tenant (slug), empresa, utilizador, token, versão, hostname, última conexão | por PC; usado por PDV, etiquetas, documentos |
| Parâmetros INI | ~60 chaves (layouts, impressoras, balança, etiqueta, gaveta, cores, TEF, leitor, busca preço, modo Bridge, skin, travar login) | partilhado com o cliente desktop Delphi; referencia empresa ("loja travada") |
| Campo obrigatório | entidade (cliente, produto), campo, obrigatório (bool) | valida cadastros de cliente e produto |
| Plano | id, nome, descrição, valor mensal, tipo (pago, trial, gratuito), limite de utilizadores, módulos | N:N com módulos |
| Módulo | nome (36 no Full; MCP fora) | habilita rotas; rota fora do plano mostra o bloqueio |
| Assinatura | tenant, plano, dia de pagamento, valor, créditos até, dias restantes | tem faturas |
| Mensalidade / fatura | referência, vencimento, valor, status, forma (PIX, boleto) | pertence à assinatura |
| Versão de termo | versão, publicado_em, conteúdo (markdown) | tem aceites |
| Aceite de termo | uuid, versão, empresa, CNPJ na época, utilizador/login, data e hora, IP, navegador, SHA-256, status | empresa, utilizador, versão |
| Notificação WhatsApp IA | id, tipo (venda, orçamento), cliente_nome, telefone_whatsapp, total, data_hora, url, confirmada | aponta para a venda ou orçamento criado pelo agente |

## Integrações

- **OpenAI**: o Advisor (chat e primeira análise IOG). A chave é gerida pelo
  Super Admin da plataforma.
- **MCP (Model Context Protocol)**: o conector de IA, adicional fora do plano
  Full.
- **WhatsApp**: o agente de vendas IA; o ERP recebe as operações por polling
  de notificações.
- **Olimpia Bridge**: agente desktop para Windows e macOS, com Linux "em
  breve", e API HTTP em `127.0.0.1:9876`. Cobre:
  - impressoras térmicas: Epson TM-T20/T88, Bematech MP-4200 TH, Elgin i9,
    Daruma DR800;
  - etiquetadora Elgin L42 (ZPL/EPL);
  - gaveta: Epson, Bematech, Sweda, Elgin;
  - balança, leitor e certificados.
- **Web Serial API** (Chrome/Edge): balança no PDV web quando o Bridge está
  desligado.
- **Balanças**: Filizola, Toledo (MGV5, MGV7) e Urano (S, URF32), com carga de
  itens por arquivo e etiqueta com peso ou valor no código de barras.
- **TEF Dial** (gerenciador padrão) no PDV.
- **Terminal consulta-preço**: arquivo de busca de preço.
- **SEFAZ / NFC-e**: reenvio automático, layouts DANFE/DANFC-e e impressora
  própria para NFC-e.
- **Cliente desktop Delphi** (componentes ACBr: ACBrBAL, ACBrLCB; skins
  DevExpress): partilha `parametros_ini`.
- **Cobrança da assinatura**: PIX e boleto, com gateway não identificado.

## Observações de UX (oportunidades para nós)

1. **Funções fora do plano aparecem no menu.** O MCP e o Monitor WhatsApp IA
   têm atalho no hub de Parâmetros e na busca, mas o clique termina numa página
   de bloqueio que não diz qual módulo falta, quanto custa nem como contratar.
   No nosso ERP modular: esconder o que não foi contratado, ou mostrar uma
   oferta clara com preço e um botão de contratar.
2. **O "Fechar" de Parâmetros está quebrado.** Aponta para um endpoint JSON de
   polling. Nunca usar "URL anterior" quando há pedidos em segundo plano.
3. **Parâmetros mistura desktop e web.** Skin DevExpress, "backup ao fechar o
   sistema", testes ACBr e portas COM e LPT convivem com o PDV web. Há também
   jargão (Time sleep, G.P., CHQ em gerencial, handshaking). Para nós:
   - parâmetros **por terminal** e com assistente ("conecte a balança →
     detectamos");
   - lista de impressoras vinda do agente, não uma lista fixa.
4. **O Advisor está "no plano" mas não funciona.** Depende de uma chave que só
   a plataforma cadastra, e o aviso fala em "Super Admin → Integrações", que o
   cliente não acessa. O histórico do chat perde-se ao recarregar. Para nós: IA
   ligada de fábrica, histórico guardado e respostas com links para a ação
   sugerida.
5. **Status "atrasada" é manual.** Deveria ser calculado pelo prazo. O filtro de
   status não tem "cancelada".
6. **Reuniões limitadas.** Há só 3 tarefas fixas e os participantes são texto
   livre, sem ligação a utilizadores, sem convite e sem lembrete. Oportunidade:
   participantes vinculados, convite por WhatsApp ou e-mail, e tarefas
   ilimitadas que viram ações.
7. **As metas ficam soltas na tela de ações**, sem dizer de que projeto são.
   Indicador e meta são texto livre: não ligam a um KPI real nem medem o
   progresso sozinhos.
8. **"Gerar agora" não tem período nem pré-visualização.** O cliente não sabe o
   que vai receber.
9. **Dois prazos que confundem.** A assinatura mostra "dia de pagamento 05" e
   também "válido até 17/10", porque o modelo é de créditos. Para nós: um único
   conceito ("seu acesso vai até X; renove") com a renovação automática
   opcional.
10. **A troca de plano usa `confirm()` nativo** e mostra só a *quantidade* de
    módulos por plano, sem uma tabela que compare o que cada um inclui.
11. **Boas práticas para copiar:**
    - aceite de termos com UUID, hash SHA-256, IP e conteúdo exato da versão;
    - campos obrigatórios configuráveis em pílulas, com ajuda sobre a
      exigência fiscal e sem poder desligar os campos essenciais;
    - um agente local único (Bridge) com pareamento por token e testes
      rápidos;
    - impressão fiscal só em PDF.
12. **Polling em excesso.** Cada página consulta vários canais de notificação
    (loja, cardápio, OS, Mercado Livre, manifestação de NF-e, baixa de boleto,
    WhatsApp IA), alguns a cada 10 s. Para nós: um único canal de eventos
    (SSE ou WebSocket).
13. **Hubs intermediários** (`/dashboard/modulo/...`) acrescentam um clique antes
    de cada tela. A busca Ctrl+K com favoritos (tecla F) ajuda e vale a pena
    copiar.

## Pendências

1. **`/mcp` e `/mcp/monitor`:** abriram, mas mostraram "Esta função não está no
   seu plano (Full)". O conteúdo real (configuração do conector, autenticação,
   ferramentas expostas, monitor de conversas) não foi visto. Só se sabe o que
   o modal global de notificações mostra. Explorar exige um plano ou adicional
   que inclua o módulo.
2. **Consultoria sem dados:** não há ações, reuniões, metas, relatórios,
   problemas nem projetos. Por isso ficaram por ver as telas de
   detalhe/edição, o conteúdo do relatório executivo, o questionário IOG (o
   "Novo diagnóstico" cria o registo direto por POST) e o cálculo e as faixas
   da "Classe" do IOG.
3. **Advisor sem chave OpenAI:** não foi possível ver respostas, a pauta
   sugerida para reuniões nem a "primeira análise".
4. **Bridge offline nesta máquina:** os testes (conexão, impressão, gaveta,
   balança) não foram executados de propósito. A leitura direta do endpoint de
   versão publicada foi recusada pelo classificador de permissões do Claude
   Code e não foi repetida. A tela já mostra "Versão disponível 1.0.19".
5. **Lupa "Colaborador / Vendedor":** devolveu 0 registos sem busca. Falta
   confirmar se lista utilizadores ou pessoas do tipo colaborador.
6. **Assinatura:** "Pagar próxima mensalidade", "Contratar plano selecionado",
   as faturas (vazias) e o gateway PIX/boleto ficaram por observar. A divisão
   dos módulos por plano é uma hipótese baseada na ordem da lista.
7. **Não abertos:** `/meus-termos/{uuid}/imprimir`, os downloads do Bridge
   (`/bridge/download/win|linux|mac|mac_arm`) e os atalhos `/fiscal-series`,
   `/nfce` e `/empresa/1` (fora do lote).
8. **Escopo dos parâmetros:** não ficou claro se `parametros_ini` é por
   empresa ou por terminal. A tela não indica o terminal.
