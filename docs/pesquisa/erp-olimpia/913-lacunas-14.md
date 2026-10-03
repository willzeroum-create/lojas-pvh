# 913 — Lacunas, lote 14: relógio de ponto e módulo Folha de Pagamento (ERP Olímpia)

> **Estado: explorado (só leitura) em 2026-10-03**, conta de teste "Boi Criolo",
> plano Full, no navegador embutido, em aba própria (fechada no fim).
> As **12 rotas do lote abriram**. A empresa de teste **não tem colaboradores
> nem folha processada**: as listas estão vazias, mas os formulários, as opções
> de cada campo, os indicadores e os textos de ajuda foram lidos.
> Nada foi gravado. Algumas leituras extras (o código da página do relógio, um
> evento existente aberto em edição, o filtro de eventos, as telas Benefícios
> e Configurações) foram **barradas pelo filtro de permissões do Claude Code**
> e estão em [Pendências](#pendências).
>
> Este arquivo responde, para as telas acima, às perguntas deixadas em
> `16-folha-colaborador.md` (grupo bloqueado) e à parte "Relógio" de
> `15-ponto.md`.

---

## Visão geral do módulo

**Folha de Pagamento** é um módulo da área "Pessoas", ao lado do **Ponto
Eletrônico**, do qual depende. Em resumo:

- **Hub** (`/dashboard/modulo/folha`) com dois grupos de atalhos:
  - **Gestão:** Dashboard, Processamento, Competências, Holerites,
    Relatórios, Ficha financeira, Férias e 13º, Rescisão.
  - **Cadastros:** Eventos da folha, Departamentos/CC, Benefícios,
    Configurações.
- **Colaborador = pessoa.** Todos os seletores de colaborador usam o campo
  `id_pessoa`. O colaborador é uma ficha do cadastro único de Pessoas com o
  papel de colaborador (ativo, afastado ou demitido). Não existe tela de
  cadastro de colaborador dentro da Folha.
- **O mês de folha chama-se competência.** Processar uma competência importa
  dados do Ponto (fechamento **aprovado**, banco de horas, faltas, horas
  extras) e de "vales/adiantamentos", e calcula **INSS, IRRF e FGTS**.
- **Saídas:** holerites para ver e imprimir, relatórios (analítico,
  sintético, custos, Excel), arquivo **eSocial S-1200** e remessa bancária
  **CNAB 240** para pagar salários. Também a ficha financeira anual por
  colaborador.
- **Rotinas especiais em telas próprias:** férias (com 1/3 e abono), 13º
  (adiantamento e parcela final) e rescisão (que pode gerar folha e demitir).
- **Rubricas pré-carregadas:** cerca de 200 eventos seguindo a tabela de
  naturezas de rubricas do eSocial, mas com a classificação errada (ver tela
  11).
- **Encargos = só FGTS** no painel. Isso combina com empresas do Simples
  Nacional (anexos I a III), onde a contribuição patronal vai no DAS, não na
  folha. É o público dos pequenos comerciantes de alimentação.
- **Tecnologia percebida:** páginas renderizadas no servidor, formulários
  POST com token CSRF (`_token`) e rotas de recurso (`/create`,
  `/{id}/edit`). O padrão é típico de Laravel com Bootstrap e Bootstrap
  Icons. O relógio de ponto é uma página à parte, escura e em tela cheia.

---

## Telas

### 1. Relógio de ponto — `/ponto/relogio`

- **Redirecionamento:** `/ponto/relogio` vai para
  **`/ponto/v/boi-criolo/relogio`**. Cada empresa tem um endereço próprio do
  terminal, identificado pelo seu *slug*.
- **Objetivo:** modo quiosque (tablet na entrada da loja). O colaborador se
  identifica e bate o ponto com foto.
- **Layout:** tela escura, **sem o menu do ERP**. Barra superior com título,
  subtítulo indicando o modo "terminal tablet", que a foto fica guardada no
  banco de dados, e o nome da empresa. À direita, relógio grande ao vivo
  (HH:MM:SS) e data por extenso.

**Etapa 1 — Identificação** (painel visível)

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Código do colaborador | número (teclado numérico), placeholder "Ex.: 1234" | sim (implícito) | código curto, não CPF |
| Senha de ponto | senha numérica (PIN) | sim (implícito) | senha própria do ponto, separada do login do ERP |
| Continuar | botão | — | valida código e senha e passa para a câmera |

Rodapé: depois de registrar, a tela volta sozinha para o próximo colaborador.

**Etapa 2 — Registrar batida** (painel oculto até a identificação)

- Crachá com o **nome e o código** do colaborador identificado e o botão
  **Cancelar** (volta para a identificação).
- Instrução para posicionar o rosto num círculo e confirmar a foto.
- Caixa de câmera: vídeo ao vivo, aviso "Iniciando câmera…", **anel de
  enquadramento do rosto** e uma área de captura (a foto tirada).
- Botão **"Registrar ponto com foto"**, **desabilitado até a câmera
  ficar pronta**. Não há outro botão: sem câmera, não há batida.

**Etapa 3 — Confirmação:** tela cheia de sucesso ("Ponto registrado!") com a
hora da marcação. Um aviso flutuante (*toast*) mostra erros.

**Regras e comportamento observados ou inferidos pela interface**

- Identificação por **código + PIN**. Não há crachá, QR nem leitura de CPF.
- **Foto obrigatória** em cada batida, guardada no banco. O subtítulo sugere
  que o local de armazenamento é configurável (provavelmente em
  `/ponto/config`).
- **O tipo de batida não aparece** (entrada, saída, intervalo). O sistema
  deve deduzir a sequência sozinho.
- Na tela, o comprovante é só a mensagem de sucesso com a hora. Não se viu
  comprovante para baixar ou receber.
- Não se viu modo offline nem fila de sincronização.
- O anel sugere validação ou cadastro facial. **Não confirmado.**
- **Não testado:** não foram digitados código nem senha (proibido) e a câmera
  não foi aberta.

### 2. Hub do módulo — `/dashboard/modulo/folha`

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

### 3. Dashboard da folha — `/folha`

- **Objetivo:** visão da competência (mês/ano) selecionada. Por padrão,
  abre no mês atual. O subtítulo mostra "Competência MM/AAAA".
- **Ações no topo:**
  - **Processar folha:** link para
    `/folha/processamento?mes=10&ano=2026`, já com a competência.
  - **Eventos:** link para `/folha/eventos`.
- **Filtro (GET):** Mês (lista 01 a 12), Ano (número) e Filtrar. A URL fica
  `/folha?mes=9&ano=2026`.
- **Indicadores (8):**

| Indicador | Unidade | Origem provável |
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
  Relatórios, Configurações e **Fechamento de ponto** (`/ponto/fechamento`,
  no módulo Ponto).
- **Na conta de teste:** tudo zerado em 10/2026 e 09/2026.

### 4. Assistente de processamento — `/folha/processamento`

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
    exemplo, processada → fechada). Os estados reais não foram vistos (sem
    dados).
  - Mensal, férias, 13º e rescisão **não se escolhem aqui**. Cada um tem a
    sua tela.
- Aceita `?mes=&ano=` na URL para vir pré-selecionado (é o link do dashboard).
  A pré-seleção não foi conferida (ver Pendências).

### 5. Competências — `/folha/competencias`

- **Objetivo:** histórico dos processamentos mensais.
- **Ação:** **Nova competência**, que leva a `/folha/processamento`. Abrir
  uma competência é o mesmo que processá-la; não existe "abrir mês" vazio.
- **Colunas:** Competência, Status, Colaboradores, Proventos, Descontos,
  Líquido, Encargos e uma coluna de ações (sem rótulo).
- **Estado vazio:** nenhuma competência processada.
- **Não visto (sem dados):** valores de status, ações por linha (ver,
  reabrir, fechar, excluir?), detalhe da competência.

### 6. Holerites — `/folha/holerites`

- **Objetivo:** ver e imprimir os holerites de uma competência.
- **Filtro (GET):** um campo **Competência** (lista obrigatória que **envia
  sozinha ao mudar**, parâmetro `competencia`). As opções são só as
  competências processadas; na conta, apenas "Selecione...".
- **Não visto:** o holerite em si, impressão em lote, PDF, envio ao
  colaborador (portal, WhatsApp, e-mail) e confirmação ou assinatura de
  recebimento. Nesta tela **não há nenhum botão de envio**.

### 7. Relatórios da folha — `/folha/relatorios`

- **Objetivo:** relatórios da competência. O subtítulo promete: **analítico,
  sintético, custos, Excel, eSocial S-1200 e CNAB 240**.
- **Ações no topo:** Ficha financeira anual
  (`/folha/relatorios/ficha-financeira`) e Dashboard (`/folha`).
- **Estado vazio:** sem competência processada, a tela só manda processar a
  folha primeiro. Não há relatório oculto na página.
- **Integrações pressupostas:**
  - **eSocial S-1200:** evento periódico de remuneração do trabalhador.
    Provavelmente gera um arquivo para enviar; não se viu transmissão
    direta nem certificado digital.
  - **CNAB 240:** layout FEBRABAN de remessa de pagamentos, para crédito de
    salários em conta.
  - **Excel:** exportação.

### 8. Ficha financeira — `/folha/relatorios/ficha-financeira`

- **Objetivo:** histórico anual de proventos, descontos, encargos e líquido
  de um colaborador.
- **Filtro (GET):**

| Campo | Tipo | Obrigatório | Opções / padrão |
| --- | --- | --- | --- |
| Colaborador | lista (`id_pessoa`) | sim | colaboradores; vazio na conta |
| Ano | número | — | padrão: ano atual; mínimo 2000, máximo 2100 |
| Consultar | botão | — | — |

- **Resultado (descrito no estado vazio):** consolidado **mês a mês** de
  proventos, descontos e encargos.
- Link de volta a **Relatórios**.

### 9. Férias e 13º — `/folha/ferias`

- **Objetivo:** programar férias (gozo e abono), acompanhar períodos
  aquisitivos e processar o pagamento com 1/3. Também processa o 13º.
- **Atalhos:** Processamento e Holerites.
- **Indicadores:** Colaboradores (ativos), Programadas (aguardando folha),
  Já pagas (processadas), Saldo médio (dias disponíveis).

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
  Parcela (lista: **Adiantamento** | **Parcela final**; padrão
  Adiantamento) e o botão Processar 13º.

**Listas**

- **Programações:** Colaborador, Período, Dias, Status. Vazia.
- **Períodos aquisitivos:** Colaborador, Aquisitivo, Saldo, Status. Vazia,
  com a dica de que os períodos **surgem só ao programar a primeira férias**.

**Regras percebidas**

- Ciclo da programação: **programada** ("aguardando folha") → **paga**
  ("processada") quando se processam as férias do mês.
- Abono limitado a 10 dias, coerente com 1/3 de 30 dias (CLT art. 143).
- O 1/3 aparece como **opcional**, mas é obrigatório pela Constituição
  (art. 7º, XVII). Uma caixa que o usuário pode desmarcar é risco de erro.
- O período aquisitivo é criado **sob demanda**, não a partir da data de
  admissão. O sistema não avisa de férias a vencer (dobra, CLT art. 137).
- 13º em duas parcelas (Lei 4.749/1965: 1ª até 30/11, 2ª até 20/12). A tela
  só escolhe a parcela e não mostra prazos.
- **Não visto:** aviso de férias (30 dias antes, CLT art. 135), recibo,
  fracionamento em até 3 períodos (CLT art. 134 §1º), pagamento 2 dias antes
  (CLT art. 145), férias coletivas, 13º proporcional de admitidos no ano.

### 10. Rescisão — `/folha/rescisao`

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

- Dois estados: **calculada** (simulação) e **aplicada** (gerou folha e
  marcou o colaborador como demitido). Uma rescisão aplicada tira o
  colaborador dos ativos e o leva para "Afastados/demitidos" no dashboard.
- Com o padrão marcado, **um clique calcula e já demite**. Não há etapa de
  conferência antes de aplicar.
- Os motivos cobrem os casos principais: acordo (CLT art. 484-A, multa de 20%
  e metade do aviso), término de contrato e pedido de demissão.
- **Não visto:** dias de aviso proporcional (Lei 12.506/2011), aviso
  trabalhado com data de início, saldo do FGTS para a multa de 40%/20%,
  termo de rescisão (TRCT), guias, prazo de 10 dias para pagar (CLT art. 477
  §6º) e evento eSocial S-2299.

### 11. Eventos da folha (rubricas) — `/folha/eventos`

**Lista**

- **Ação:** **Novo evento**, que leva a `/folha/eventos/create`.
- **Filtro (GET):** Natureza (Todas naturezas, Provento, Desconto, Base de
  cálculo, Informativo) e Filtrar. A URL fica `?natureza=`.
- **Colunas:** Cód., Nome, Natureza, Cálculo, Ponto, INSS, IRRF, FGTS,
  Status e a ação **Editar**, que leva a `/folha/eventos/{id}/edit`.
- **Volume:** **202 eventos**, sem paginação e sem busca.
- **Catálogo pré-carregado:** segue a tabela de naturezas de rubricas do
  eSocial (códigos 1000 a 9989). Inclui salário, DSR, horas extras, férias e
  abonos, adicionais (insalubridade, periculosidade, noturno, quebra de
  caixa), gorjetas, comissões, PLR, auxílios, ajuda de custo, diárias,
  alimentação/PAT, transporte, pró-labore, 13º, adiantamentos, verbas de
  rescisão (aviso, multas dos arts. 477, 479 e 480), descontos (INSS, IRRF,
  faltas, atrasos, DSR, pensão alimentícia, vale-transporte, consignado,
  convênios, contribuição sindical), bases de cálculo e informativos.
  Também tem dois eventos próprios: "SALARIO BASE" (cód. 1) e "INSS FOLHA"
  (cód. 903).
- **Problemas de dados visíveis:**
  - **Todos os 202 estão como "Provento" e "Valor fixo"**, até descontos
    (IRRF, faltas, vale-transporte), bases (base do INSS, FGTS, IRRF) e
    informativos.
  - Incidências quase todas vazias. Só uns poucos marcam INSS ou FGTS, e
    "Desconto judicial" aparece como provento com INSS e FGTS.
  - **Dois registros com código 0 e nome vazio.**
  - **Acentos corrompidos** nos nomes (maiúsculas mal convertidas) e nomes
    **cortados em 50 caracteres**.
  - Nomes repetidos ("Vestuário e equipamentos" duas vezes; "Assistência
    médica" em dois códigos).
  - Coluna **Ponto vazia em todos**: nenhum evento está ligado a um código do
    ponto. A importação de HE e faltas fica sem rubrica.
- O resultado do filtro por natureza não foi lido (ver Pendências).

**Formulário "Novo evento"** (`/folha/eventos/create` → POST `/folha/eventos`)

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

- **Ordem de cálculo** define a sequência (proventos → bases → impostos).
- **Código ponto** liga a rubrica a uma ocorrência do Ponto (HE50, FALTA)
  para importar automaticamente.
- O tipo **"Fórmula" não tem campo de fórmula** no formulário. Não se sabe
  onde a fórmula é escrita.
- Não há campo de status (Ativo/Inativo) no "Novo", embora a lista tenha
  coluna Status. Deve ser alterado na edição (não vista).
- A incidência DSR existe no formulário, mas não aparece como coluna na
  lista.

### 12. Departamentos e centros de custo — `/folha/rh/organizacao`

- **Objetivo:** estrutura da empresa para ligar colaboradores, fazer rateio e
  agrupar relatórios de folha.
- **Indicadores:** Departamentos, Ativos, Centros de custo, CC ativos.
- **Painel Departamentos:** formulário na própria lista (POST
  `/folha/rh/departamentos`) com **Nome do departamento** (obrigatório,
  placeholder "Ex.: Operações") e o botão Incluir. Lista vazia.
- **Painel Centros de custo:** formulário na própria lista (POST
  `/folha/rh/centros-custo`) com **Código** (obrigatório, placeholder
  "CC01"), **Nome** (obrigatório, placeholder "Administrativo") e o botão
  Incluir. Lista vazia.
- **Regras percebidas:** existe flag ativo/inativo (indicadores separados),
  sem campo no cadastro. Departamento e CC são **listas planas e
  independentes**: sem hierarquia, sem ligação entre si e sem cargos. A
  ligação ao colaborador não está nesta tela (deve estar na ficha da
  pessoa). Editar e excluir não aparecem com as listas vazias.

---

## Fluxos de ponta a ponta

1. **Preparação (uma vez):** cadastrar departamentos e centros de custo →
   cadastrar colaboradores em Pessoas (salário, departamento, CC, código e
   senha de ponto, foto/rosto; fora destas telas) → revisar as rubricas
   (natureza, incidências, código do ponto, ordem) → configurar tabelas e
   benefícios (`/folha/config` e `/folha/beneficios`, não vistas).
2. **Dia a dia (Ponto):** colaborador no tablet → código + PIN → foto →
   "Ponto registrado" → a tela volta para o próximo. As marcações vão para o
   espelho do Ponto e, no fim do mês, para o **fechamento de ponto aprovado**.
3. **Folha mensal:** Dashboard (competência) → **Processar folha** → escolher
   mês/ano e colaboradores → importar ponto aprovado, banco de horas e
   vales/adiantamentos → calcular INSS, IRRF e FGTS → a competência aparece
   em **Competências** com totais → conferência e fechamento → **Holerites**
   (ver e imprimir) → **Relatórios** (analítico, sintético, custos, Excel) →
   **eSocial S-1200** → **CNAB 240** para o banco pagar → **Ficha
   financeira** anual por colaborador.
4. **Férias:** programar (colaborador, início, fim, abono, 1/3) → o período
   aquisitivo é criado e abatido → "Férias do mês: Processar" põe as verbas
   na folha → a programação passa a "paga".
5. **13º salário:** escolher o ano e a parcela (adiantamento até novembro,
   final em dezembro) → Processar 13º.
6. **Rescisão:** escolher colaborador, data, motivo e aviso indenizado →
   calcular (simulação) **ou** calcular + gerar folha + aplicar demissão (o
   padrão) → o colaborador sai dos ativos → aparece em "Últimas rescisões" e
   em "Afastados/demitidos" → eSocial (via Relatórios).

---

## Entidades e relações

| Entidade | Campos vistos ou inferidos | Relações |
| --- | --- | --- |
| Empresa (tenant) | nome, slug (no endereço do relógio) | tem colaboradores, competências, eventos, departamentos, CCs |
| Colaborador (Pessoa com papel colaborador) | `id_pessoa`, nome, código de ponto, senha de ponto (PIN), foto/rosto, situação (ativo, afastado, demitido), departamento e CC (inferido) | pertence à empresa; tem batidas, folhas, férias, períodos aquisitivos, rescisões |
| Batida de ponto | colaborador, data/hora, foto, terminal | entra no espelho e no fechamento do Ponto |
| Fechamento de ponto | competência, estado (aprovado) | fonte de HE, faltas e horas para a folha |
| Banco de horas | colaborador, saldo | importado no processamento |
| Vale/adiantamento | colaborador, valor, data (inferido) | descontado no processamento |
| Competência | mês, ano, status, nº colaboradores, proventos, descontos, líquido, encargos | tem muitas folhas de colaborador |
| Folha do colaborador / holerite | competência, colaborador, itens (evento, referência, valor), totais | itens apontam para eventos |
| Evento (rubrica) | código, nome, natureza, tipo de cálculo, percentual, código ponto, descrição, ordem, código eSocial, incide INSS/IRRF/FGTS/DSR, status | usado nos itens da folha; ligado a ocorrências do Ponto pelo código |
| Programação de férias | colaborador, início, fim, dias, dias de abono, pagar 1/3, status (programada, paga) | consome saldo de um período aquisitivo; gera itens na folha |
| Período aquisitivo | colaborador, início–fim, saldo de dias, status | criado na primeira programação |
| Processamento de 13º | ano, parcela (adiantamento, final) | gera itens na folha de cada colaborador |
| Rescisão | colaborador, data, motivo, aviso indenizado, gerar folha, líquido, status (calculada, aplicada) | muda a situação do colaborador; gera folha |
| Departamento | nome, ativo | agrupa colaboradores (inferido) |
| Centro de custo | código, nome, ativo | rateio e relatórios de custo |
| Benefício, Configuração da folha | não vistos | — |

---

## Integrações

- **Módulo Ponto (interno):** fechamento aprovado, banco de horas, faltas e
  HE. É a base do processamento.
- **Câmera do dispositivo:** foto obrigatória em cada batida no relógio;
  imagem guardada no banco.
- **eSocial:** S-1200 (remuneração) nos relatórios; campo "código eSocial"
  nas rubricas; botão "eSocial" na rescisão. **Envio direto não
  observado.** Parece geração de arquivo.
- **Bancos — CNAB 240:** remessa para pagar salários.
- **Excel:** exportação de relatórios.
- **Não aparecem nestas telas:** FGTS Digital, DCTFWeb, exportação para o
  contador, holerite por WhatsApp ou e-mail, assinatura eletrônica,
  reconhecimento facial de terceiros, REP físico.

---

## Observações de UX (oportunidades para nós)

1. **Assistente que não assiste.** As 7 etapas são só texto. O
   processamento é um único botão sem prévia. Nós: um passo a passo de
   verdade, com **simulação**, diferenças por colaborador, alertas (ponto não
   aprovado, colaborador sem salário) e só então "fechar competência", com a
   opção de reabrir com motivo.
2. **Rescisão em um clique.** "Gerar folha e aplicar demissão" vem marcado.
   Nós: separar **Simular** de **Efetivar**, mostrar o memorial de cálculo
   (aviso proporcional, 13º e férias proporcionais, multa do FGTS) e pedir
   confirmação explícita.
3. **1/3 de férias opcional** confunde e permite erro legal. Nós: 1/3 sempre
   aplicado. Aviso de férias e recibo gerados juntos.
4. **Períodos aquisitivos sob demanda.** Nós: calcular a partir da admissão,
   com alertas de férias a vencer ou em dobro.
5. **202 rubricas mal classificadas, sem busca.** Nós: um conjunto pequeno e
   correto para comércio de alimentação (cerca de 25 a 30 rubricas: salário,
   HE 50%/100%, adicional noturno, DSR, faltas, atrasos, VT, adiantamento,
   INSS, IRRF, FGTS, 13º, férias, 1/3, rescisórias), com o catálogo eSocial
   completo como opção, busca, agrupamento por natureza e validação do
   código eSocial.
6. **"Fórmula" sem campo de fórmula** e "Percentual" sempre visível. Nós:
   campos que aparecem conforme o tipo de cálculo e um editor simples com
   variáveis nomeadas (salário, horas, base).
7. **Indicadores crus:** "Horas extras (min)" em minutos. Nós: mostrar em
   hh:mm e em R$. O painel deve dizer o estado da competência ("ponto
   aprovado? folha calculada? paga?") como lista de pendências do mês.
8. **Holerites sem entrega.** Só ver e imprimir. Nós: holerite digital no
   portal do colaborador e pelo **WhatsApp** (canal que o nosso público já
   usa), com confirmação de leitura.
9. **Relógio:** o código usa campo `number` (com setinhas, e zeros à
   esquerda somem). Não há teclado numérico na tela, tipo de batida,
   comprovante nem alternativa se a câmera falhar. Nós: teclado grande na tela, mostrar a
   última batida e a próxima esperada, **comprovante** por QR, e-mail ou
   WhatsApp (a Portaria MTP 671/2021 exige comprovante disponível ao
   trabalhador; confirmar o formato com o jurídico) e fila offline.
10. **Telas soltas:** férias, 13º e rescisão têm cada uma o seu "Processar",
    fora da competência. Nós: tudo como "tipos de cálculo" dentro da
    competência, com um histórico só.
11. **Acabamento:** no cartão de 13º, o botão quebra o texto e a lista
    "Parcela" aparece cortada. O botão "Salvar programação" parece ficar
    parcialmente escondido na borda do cartão, numa janela de cerca de
    1100 px.
12. **Organização rasa:** departamentos e CCs sem hierarquia, sem cargos e
    sem edição visível. Nós: departamento → cargo → colaborador, com CC
    opcional e rateio percentual.
13. **Encargos só FGTS:** serve ao Simples Nacional, mas não ao Lucro
    Presumido/Real nem ao Anexo IV. Nós: o regime tributário da empresa
    define os encargos mostrados.

---

## Pendências

- **Sem dados na conta de teste:** não houve como ver holerite, ficha
  financeira preenchida, estados e ações das competências, relatórios
  (analítico, sintético, custos, Excel, S-1200, CNAB 240) nem listas de
  programações, períodos aquisitivos e rescisões com registros.
- **Relógio:** só a tela de identificação foi vista. Não foram digitados
  código e senha (proibido) nem aberta a câmera. Não estão confirmados:
  reconhecimento facial, tipo de batida, comprovante, modo offline e se o
  endereço `/ponto/v/{slug}/relogio` funciona sem login no tablet.
- **Bloqueios do filtro de permissões do Claude Code** (motivo "Third-Party
  Attack") nesta sessão. Foram respeitados, sem contorno:
  - leitura do código da página do relógio (comportamento interno);
  - leitura da lista de eventos filtrada por natureza;
  - abertura de um evento existente em edição (`/folha/eventos/{id}/edit`);
  - abertura de `/folha/beneficios`;
  - abertura de `/folha/processamento?mes=9&ano=2026` (pré-seleção pela
    URL).
  Depois disso, `/folha/config` não foi tentada. Destravar depende de uma
  decisão do usuário sobre as permissões.
- **Não vistas (fora da lista do lote, ainda sem nenhum arquivo):**
  `/folha/beneficios` e `/folha/config`. Ali devem estar as tabelas de
  INSS, IRRF e salário-família, os dados do empregador e o dia de pagamento.
- **Onde se cadastra o colaborador** (salário, cargo, departamento, CC,
  código e senha de ponto, foto de referência): não aparece nestas telas.
  Provavelmente em Pessoas ou Ponto.
- **Origem dos "vales/adiantamentos"** importados: não identificada
  (Financeiro? portal do colaborador?).
- **eSocial:** não se sabe se há transmissão direta (certificado A1) ou só
  geração de arquivo.
