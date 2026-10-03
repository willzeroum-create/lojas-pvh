# 13 — Fiscal: NF-e, NFC-e, NFS-e, MDF-e, CT-e, SPED, CFOP e tributação (ERP Olímpia)

> **Estado: explorado em parte (2 de 10 rotas).** Data: 2026-10-03.
> Conta de teste "Boi Criolo" (plano Full), sessão já aberta no navegador embutido.
>
> **O login funcionou.** As páginas abriram já logadas. O problema foi outro:
> no meio da exploração, o **filtro de segurança automático do Claude Code**
> (o classificador do "modo automático") passou a recusar as ações no site, com o
> motivo "Third-Party Attack". A recusa vale para o objetivo inteiro, e por isso
> parei de navegar no ERP. Detalhes e como desbloquear: seção
> [7. Pendências](#7-pendências).
>
> Tudo o que está marcado como **observado** foi visto na tela ou na estrutura
> da página já carregada. Tudo o que está marcado como **a verificar** é
> conhecimento geral do domínio fiscal brasileiro e **não** foi visto no ERP.

---

## 1. Visão geral do módulo

O módulo Fiscal é uma **tela-lançador** com três blocos de atalhos:

| Bloco | Atalho | Rota |
|---|---|---|
| Notas & Documentos | NF-e \| NFC-e \| NFS-e | `/nfce` |
| Notas & Documentos | Manifestação NF-e | `/manifestacao-nfe` |
| Notas & Documentos | MDF-e | `/mdfe` |
| Notas & Documentos | CT-e | `/cte` |
| SPED | SPED Fiscal / Contribuições | `/producao/sped-bloco-k` |
| Tabelas Fiscais | CFOP | `/cfops` |
| Tabelas Fiscais | Conversão CFOP | `/cfop-conversoes` |
| Tabelas Fiscais | Séries | `/fiscal-series` |
| Tabelas Fiscais | Grupo Tributário | `/grupos-tributarios` |

Pelo que foi visto, o coração do módulo é **um gestor único de documentos
fiscais** (NFC-e, NF-e e NFS-e na mesma tela, separados por abas). Nesse gestor,
**a nota nasce sempre de um registro que já existe**: uma venda, uma "saída"
(outras saídas de estoque) ou uma ordem de serviço. A tributação de cada item
vem de um **grupo tributário / operação** escolhido na emissão.

No menu lateral, o Fiscal fica dentro do grupo **"Financeiro & Fiscal"**, junto
com o **Portal do Contador**. Tem botão para fixar o módulo no topo do menu
("Fixar fiscal").

Há um detalhe que mostra a origem do sistema: as telas exibem **nomes internos
de formulários de um sistema desktop antigo** (por exemplo
`FrmFiscal_GerenciarNFCe`, `FrmFiscal_View`, `ECTransportador`,
`FrmNFe_Referenciar`). Indica que o ERP web é uma migração de um ERP desktop
(provavelmente Delphi) e que ainda carrega esse vocabulário técnico na
interface.

---

## 2. Telas

### 2.1 `/dashboard/modulo/fiscal` — Lançador do módulo (observado)

- **Objetivo:** ponto de entrada do módulo. Só tem atalhos, sem indicadores.
- **Conteúdo:** cabeçalho "Fiscal" com o link "Voltar ao dashboard" e três
  cartões-bloco (ícone + rótulo em caixa alta), conforme a tabela da seção 1.
- **Não tem:** contadores (notas rejeitadas, pendentes, em contingência),
  alertas (validade do certificado digital, série a acabar, SEFAZ fora do ar)
  nem atalho de "emitir agora".
- **Estrutura comum a todas as telas (casca do ERP):**
  - barra superior com o nome do cliente ("BOI CRIOLO"), busca de telas
    (Ctrl+K), botão "Novidades", seletor de tema visual, sino de notificações,
    menu do usuário ("ADMIN") e botão "Abrir assistente" (chat);
  - menu lateral com "Fixados", "Atalhos rápidos" (Operação do dia: Venda
    Balcão, Venda PDV, Venda Direta Mobile, Caixa, Ordem de Serviço,
    Mensalidades; Cadastros frequentes: Produtos, Clientes, Consulta Cliente) e
    os módulos;
  - janelas de notificação globais presentes em todas as páginas: "Novo pedido
    WhatsApp" (com "Confirmar recebimento"), "Nova venda — Loja virtual",
    "Nova venda — Mercado Livre", "Cardápio digital" e "Assinatura de OS".

### 2.2 `/nfce` — Gestor de documentos fiscais (NFC-e / NF-e / NFS-e) (observado em parte)

Título da página: "NF-e | NFC-e | NFS-e". Subtítulo: nome interno do formulário
+ "documentos fiscais eletrônicos".

Vi **só a aba NFC-e**. A conta de teste **não tem nenhuma NFC-e** (procurei de
01/01/2020 a 03/10/2026), por isso a lista estava vazia e não deu para ver as
ações por linha nem o painel de detalhe preenchido. A abertura da aba NF-e foi
recusada pelo classificador (ver Pendências).

#### Cabeçalho

| Botão | O que faz (pelo rótulo e pela página) |
|---|---|
| **+ Gerar documento** | Abre a janela "Emissão fiscal" já com o modelo da aba ativa. Não cliquei: li os campos da janela na estrutura da página. |
| **Status SEFAZ** | Consulta se o serviço da SEFAZ está disponível. Não cliquei. |

#### Abas

**NFC-e | NF-e | NFS-e.** Cada aba é um link que **recarrega a página**, com o
tipo e os filtros na URL: `tipo` (nfce/nfe/nfse), `data_ini`, `data_fim`,
`status`, `id_venda`, `id_os`, `id_nf`, `cliente` e `filiais[]`. O filtro de
filial vem por padrão na filial 1, o que mostra que a tela é **multi-filial**.

#### Indicadores (aba NFC-e)

| Cartão | Conteúdo |
|---|---|
| NFC-e no período | quantidade + valor em R$ |
| Autorizadas | quantidade + valor em R$ |
| Canceladas | quantidade (a legenda mostra o código "status 101") |
| Total autorizado | valor em R$ (legenda: emitidas com status 100) |

#### Filtros

| Campo | Tipo | Detalhe |
|---|---|---|
| De | data | por padrão, hoje − 30 dias |
| Até | data | por padrão, hoje |
| Status | lista | Todos · Não autorizada (0) · Autorizada (100) · Cancelada (101) · Inutilizada (102) · Contingência (999) |
| Venda | texto | número da venda de origem |
| Nº NFC-e | texto | número do documento |
| Cliente | texto | nome do cliente |
| (botão) Pesquisar | — | aplica os filtros (recarrega) |

Ao lado dos filtros há uma **busca rápida "Consultar chave (44 dígitos)"** com o
botão "Consultar chave".

#### Lista

Colunas: **NFC-e** (número) · **Série** · **Data** · **Origem** · **ID** ·
**Cliente** · **Total** · **Status** · **Ações**.
Lista vazia: "Nenhuma NFC-e encontrada."

No rodapé fica um **painel fixo "Dados complementares"**, que pede para
selecionar um registro da lista. É um padrão mestre-detalhe: clicar numa linha
mostra os dados complementares dessa nota abaixo.

#### Ações por linha

Não as vi (a lista estava vazia). Pelas janelas que a página traz, as ações
devem ser: ver/imprimir o documento (DANFE), carta de correção, cancelar e
reenviar por e-mail. **A verificar:** download do XML, inutilização de
numeração e reenvio de nota rejeitada ou em contingência.

#### Janelas (modais) da página

Li estas janelas na estrutura da página já carregada, **sem as abrir e sem
clicar em nada**. O conteúdo que é carregado na hora (itens, destinatário,
séries) não aparece.

**A) "Emissão fiscal"** (nome interno `FrmFiscal_View`). É o formulário de
emissão, comum a NFC-e e NF-e.

Cabeçalho do formulário:

| Campo | Tipo | Obrig. | Opções / regra |
|---|---|---|---|
| Movimento | lista | — | Saída · Entrada |
| Modelo | lista | — | NFC-e · NF-e |
| Frete | lista | — | 0 - Emitente · 1 - Destinatário · 2 - Terceiros · 9 - Sem frete (são os códigos oficiais de modalidade de frete) |
| Registro (Venda) | número | **sim** | ID do registro de origem, que tem de ser digitado |
| CPF/CNPJ consumidor | texto | não | identifica o consumidor na NFC-e |
| Grupo de tributação / Operação | lista | **sim** | 20 opções nesta conta: VENDA, ENTREGA FUTURA, REVENDA, BONIFICAÇÃO, VENDA EM CONSIGNAÇÃO, "EXPORTÇÃO" (assim, com erro), DEMONSTRAÇÃO, CONSUMO, VENDA IMOBILIZADO, CONSERTO, TRANSFERÊNCIA, SIMPLES REMESSA, EXTRAVIO / PERDA, DEVOLUÇÃO COMPRA, VENDA PDV OFF, COMODATO, NFE COMPLEMENTAR, "ORDER DE SERVIÇOS" (assim), SAÍDA DE ICMS, VENDA PDV ON |

- **Regra mostrada na tela:** se a operação é de venda, o sistema procura o
  registro na tabela de **vendas**. Nas outras saídas procura na tabela de
  **saídas**. Ou seja, o mesmo campo "Registro" aponta para entidades
  diferentes conforme a operação.
- **Caixa "Pré-visualizar (não grava nem envia)":** gera a pré-visualização do
  documento sem gravar nem transmitir.
- **Botões:** "Fechar" e "Enviar nota" (grava e transmite).
- **Contexto escondido no formulário:** modelo, id da venda, origem do registro,
  id do transportador e um indicador de **retorno ao caixa**. Isto mostra que a
  mesma janela é chamada também a partir do fluxo de venda/caixa e depois volta
  para ele.

Abas internas:

| Aba | Conteúdo |
|---|---|
| Observação | texto livre das observações da nota (campo de informações complementares) |
| Transportador | pesquisa de pessoa transportadora (lupa + limpar). Regra: **escolher primeiro a modalidade de frete** e só depois o transportador |
| Produtos | grade só de leitura com It · Produto · CFOP · CST · Grupo · Valor. Fica vazia até informar o registro |
| Destinatário | carregado a partir do registro ("informe o registro para carregar o destinatário") |
| Dados entrega | Qtd. de volumes, espécie, marca, peso líquido, peso bruto, valor do frete e total da nota (só leitura) |
| NF referenciada | uma ou várias chaves de 44 dígitos coladas num campo de texto e separadas automaticamente. Usa-se em devolução ou quando o grupo tributário tem a opção "Referenciar nota". **Regra automática:** uma NF-e de venda emitida sobre uma venda que já tem NFC-e autorizada inclui sozinha a chave dessa NFC-e |

**B) "Identificar cliente da NF-e".** Campo Cliente (obrigatório, por pesquisa)
e os botões "Cancelar" e "Continuar". O "Continuar" fica desativado até haver
cliente. **Regra:** a NF-e exige destinatário identificado; a NFC-e aceita só o
CPF/CNPJ, e ele é opcional.

**C) "Carta de Correção (CC-e)".** Um campo de texto obrigatório para descrever
a correção que fica registrada na SEFAZ. Botões "Fechar" e "Enviar CC-e".

**D) "Cancelar NFC-e".** Justificativa obrigatória (texto). Botões "Fechar" e
"Confirmar cancelamento".

**E) "Gerar NFS-e".** Um único campo obrigatório: **número da OS** (ordem de
serviço). Botões "Fechar" e "Emitir NFS-e". **Regra:** a NFS-e nasce da OS e
não de uma venda.

**F) "Reenviar NFC-e por e-mail".** Campo de e-mail do destinatário. Botões
"Cancelar" e "Confirmar envio".

**G) "Documento fiscal".** Visualizador do DANFE com os botões "Imprimir" e
"Fechar".

**H) Pesquisa genérica ("Pesquisar") + "Cadastro rápido".** Componente
reutilizado em todo o ERP. Pesquisa por código ou descrição, com paginação
(Anterior/Próximo), seleção múltipla ("Adicionar selecionados") e "Cadastrar
novo". O "Cadastrar novo" abre um cadastro rápido ("Salvar e selecionar") sem
sair da tela.

### 2.3 Rotas não visitadas (bloqueadas)

| Rota | Estado |
|---|---|
| `/manifestacao-nfe` | não visitada (bloqueio do classificador) |
| `/mdfe` | não visitada |
| `/cte` | não visitada |
| `/producao/sped-bloco-k` | não visitada |
| `/cfops` | não visitada |
| `/cfop-conversoes` | não visitada |
| `/fiscal-series` | não visitada |
| `/grupos-tributarios` | não visitada |

Única observação sobre elas: o atalho "SPED Fiscal / Contribuições" aponta para
uma rota dentro de **produção** chamada **bloco K** (o bloco do SPED que trata
de produção e estoque). Ou a tela junta a geração do SPED e o Bloco K, ou o
rótulo engana. **A verificar.**

### 2.4 Rotas relacionadas, vistas no menu lateral (não visitadas)

- **Relatórios "Fiscal e canais":** NF-e rejeitadas
  (`/relatorios/nfe-rejeitadas`), NF-e tributos (`/relatorios/nfe-tributos`),
  NF-e por CFOP (`/relatorios/nfe-por-cfop`), NF-e CFOP/CST/NCM
  (`/relatorios/nfe-itens-fiscal`), MDF-e (`/relatorios/mdfe-periodo`), CT-e
  (`/relatorios/cte-periodo`), Manifestação DF-e
  (`/relatorios/fiscal-manifestacao-nfe`).
- **Outros relatórios:** NFS-e emitidas (`/relatorios/nfse-emitidas`), SPED
  resumo (`/relatorios/sped-resumo-periodo`), ICMS — créditos e débitos
  (`/relatorios/icms-mensal`), Entradas XML (`/relatorios/entradas-xml`).
- **Cadastros com impacto fiscal:** NCM (`/ncms`), Serviços (`/servicos`, base
  da NFS-e).
- **Estoque → Movimentações:** Entrada de XML (`/entradas-xml`), Entrada Manual
  (`/entradas-manual`).
- **Financeiro & Fiscal:** Portal do Contador (`/contador-admin`) e Link Portal
  Contador (`/contador-admin/link`).

---

## 3. Fluxos de ponta a ponta

Os passos marcados com **(obs.)** foram vistos. Os outros são o encadeamento
mais provável, **a verificar**.

1. **Venda → NFC-e.** Venda no balcão/PDV **(obs.: a janela de emissão tem
   indicador de retorno ao caixa)** → "Gerar documento" com modelo NFC-e →
   registro da venda + operação (ex.: VENDA, VENDA PDV ON/OFF) + CPF opcional
   **(obs.)** → itens com CFOP/CST/grupo vindos do grupo tributário **(obs.)** →
   pré-visualizar (opcional) **(obs.)** → "Enviar nota" → SEFAZ → status 100
   (autorizada) ou 0 (não autorizada, aparece no relatório "NF-e rejeitadas") →
   DANFE para imprimir **(obs.)** e/ou e-mail **(obs.)**.
2. **Venda → NF-e (cliente identificado).** Igual ao anterior, com o modelo
   NF-e, mas antes é preciso **identificar o cliente (obs.)** → frete e
   transportador (frete primeiro) **(obs.)** → volumes e pesos **(obs.)** →
   envio.
3. **NFC-e já emitida e o cliente pede NF-e.** A NF-e de venda inclui sozinha a
   chave da NFC-e autorizada como nota referenciada **(obs.)**.
4. **Outras saídas** (bonificação, remessa, transferência, comodato, conserto,
   demonstração, perda, consignação, entrega futura). Registro de **saída**
   (não de venda) **(obs.)** → NF-e com a operação correspondente.
5. **Devolução de compra.** Operação "DEVOLUÇÃO COMPRA" + chave da NF-e do
   fornecedor na aba "NF referenciada" **(obs.)**.
6. **Nota complementar.** Operação "NFE COMPLEMENTAR" + chave referenciada.
   **A verificar.**
7. **Pós-emissão.** CC-e com texto obrigatório **(obs.)**; cancelamento com
   justificativa obrigatória → status 101 **(obs.)**; inutilização → status 102
   **(obs.: existe o status)**; contingência → status 999 **(obs.: existe o
   status)**.
8. **Serviço → NFS-e.** Ordem de serviço → "Gerar NFS-e" com o número da OS
   **(obs.)** → prefeitura → relatório "NFS-e emitidas" (visto no menu).
9. **Compras → entrada fiscal.** XML do fornecedor → Entrada de XML (estoque) →
   provável uso da Conversão CFOP para trocar o CFOP de saída do fornecedor pelo
   CFOP de entrada. **A verificar.** A Manifestação NF-e deve alimentar este
   fluxo com as notas emitidas contra o CNPJ da empresa. **A verificar.**
10. **Fechamento do mês.** SPED (EFD ICMS/IPI e Contribuições) + relatório de ICMS
    créditos/débitos + Portal do Contador para entregar ao contador.
    **A verificar.**

---

## 4. Entidades e relações (inferidas do que foi visto)

- **DocumentoFiscal** (NFC-e / NF-e / NFS-e): modelo, movimento
  (entrada/saída), número, série, data, filial emitente, origem (venda, saída
  ou OS) + ID do registro de origem, cliente/destinatário, CPF/CNPJ do
  consumidor, operação/grupo tributário, modalidade de frete, transportador,
  volumes (qtd., espécie, marca), pesos (líquido/bruto), valor do frete, total,
  observações, chave de acesso (44 dígitos), status (0/100/101/102/999),
  e-mail de envio.
  - 1:N **ItemDocumentoFiscal**: nº do item, produto, CFOP, CST, grupo, valor.
  - N:N **DocumentoReferenciado**: chaves de 44 dígitos (NF-e/NFC-e).
  - 1:N **EventoFiscal**: CC-e (texto) e cancelamento (justificativa);
    inutilização a verificar.
- **GrupoTributário / Operação**: nome e indicador "Referenciar nota"
  (observado). Provavelmente também movimento, CFOP, CST e alíquotas
  (a verificar). Define a tributação dos itens.
- **Venda**, **Saída** e **OrdemDeServiço**: registros que originam a nota
  (1 registro → 0..N documentos; uma venda pode ter NFC-e e depois NF-e).
- **Pessoa**: cliente, consumidor e transportadora (cadastro único de pessoas,
  com tipos).
- **Filial**: emitente. As listas filtram por filial.
- **SérieFiscal** (`/fiscal-series`), **CFOP** (`/cfops`),
  **ConversãoCFOP** (`/cfop-conversoes`), **NCM** (`/ncms`), **Serviço**
  (`/servicos`): tabelas de apoio, não visitadas.
- **MDF-e**, **CT-e**, **ManifestaçãoDF-e**, **ArquivoSPED**: existem como
  telas, mas não foram visitadas.

---

## 5. Integrações pressupostas

| Integração | Evidência | Situação |
|---|---|---|
| SEFAZ — autorização NFC-e/NF-e | "Enviar nota", códigos de status 100/101/102 | observada (sem uso) |
| SEFAZ — eventos (CC-e, cancelamento) | janelas próprias com texto obrigatório | observada (sem uso) |
| SEFAZ — consulta por chave | busca "Consultar chave (44 dígitos)" | observada (sem uso) |
| SEFAZ — status do serviço | botão "Status SEFAZ" | observada (sem uso) |
| Contingência (NFC-e offline) | status "Contingência" e operações "VENDA PDV OFF/ON" | observada (indício) |
| Prefeitura — NFS-e | "Gerar NFS-e" a partir da OS | observada. Padrão (municipal ou nacional) a verificar |
| E-mail (SMTP) | "Reenviar NFC-e por e-mail" | observada |
| Impressora (DANFE / cupom) | "Documento fiscal" → "Imprimir" | observada |
| Certificado digital A1 | necessário para tudo acima | **não** visto na tela (a verificar onde se configura) |
| Portal do Contador | link no menu Financeiro & Fiscal | não visitado |
| WhatsApp, Loja virtual, Mercado Livre, Cardápio digital | janelas de notificação globais | observadas (não são fiscais) |

---

## 6. Observações de UX (oportunidades para nós)

1. **Vocabulário técnico na cara do usuário.** Nomes de formulários do
   sistema antigo (`FrmFiscal_...`, `ECTransportador`), nome de campo do XML
   ("infCpl") e códigos da SEFAZ ("status 100", "status 101", "999") aparecem
   na tela. Para um pequeno comerciante isto não quer dizer nada. **Nós:**
   estados em linguagem simples (Autorizada, Recusada pela SEFAZ, Cancelada,
   Aguardando envio) e os códigos só num detalhe técnico.
2. **Emitir exige digitar um ID.** O campo "Registro (Venda)" pede o número da
   venda/saída à mão, e conforme a operação esse número aponta para tabelas
   diferentes. É fácil errar. **Nós:** emitir a partir da própria venda (um
   clique) ou com um seletor pesquisável de vendas sem nota.
3. **Lista de operações longa e confusa.** São 20 opções numa lista só,
   misturando conceitos (PDV ON/OFF, complementar, "saída de ICMS"), com erros
   de digitação ("EXPORTÇÃO", "ORDER DE SERVIÇOS"). **Nós:** sugerir a operação
   pelo contexto (venda → Venda), mostrar só as operações que o cliente usa
   (encaixa na nossa proposta modular) e uma descrição curta de cada uma.
4. **Três documentos diferentes numa tela só, e cada aba recarrega a página.**
   NFS-e (serviço, prefeitura, nasce da OS) vive na mesma tela que NFC-e e NF-e
   (mercadoria, SEFAZ). **Nós:** uma lista unificada com filtro por tipo, sem
   recarregar, e emissão contextual (venda → NFC-e/NF-e; OS → NFS-e).
5. **Lançador sem informação.** A tela do módulo só tem atalhos. **Nós:** um
   painel com o que pede ação (notas recusadas, em contingência por enviar,
   certificado a vencer, série perto do limite, SEFAZ instável).
6. **Lista vazia sem orientação.** "Nenhuma NFC-e encontrada" não diz se falta
   configurar o certificado, a série ou o grupo tributário. **Nós:** um estado
   vazio com checklist de configuração fiscal.
7. **Dependências escondidas.** O transportador só pode ser escolhido depois do
   tipo de frete, e os itens e o destinatário só aparecem depois do ID. **Nós:**
   formulário em passos, com os campos ativados pela ordem certa.
8. **Bons pontos a copiar:** pré-visualizar sem gravar nem enviar; inclusão
   automática da chave da NFC-e na NF-e posterior; colar várias chaves de uma
   vez com separação automática; pesquisa com "cadastro rápido" sem sair da
   tela; painel mestre-detalhe; filtro multi-filial; consulta direta por chave.
9. **Nomes incoerentes.** A rota `/nfce` serve também NF-e e NFS-e, e o atalho
   "SPED Fiscal / Contribuições" leva a uma rota de produção chamada "bloco K".
   Confunde quem dá suporte e quem documenta.

---

## 7. Pendências

### 7.1 O que bloqueou (explicado de forma simples)

- **Não foi login nem credencial.** O ERP abriu já logado (conta "Boi Criolo"),
  e vi o lançador do Fiscal e a tela de notas sem problema.
- **Quem bloqueou foi o filtro de segurança automático do Claude Code.** No
  modo automático, um classificador analisa cada ação antes de ela acontecer.
  Ele recusou duas ações, ambas com o motivo "Third-Party Attack":
  1. ler o código (scripts) da página de notas. Não era essencial, e desisti;
  2. abrir a aba **NF-e** da tela de notas (o mesmo endereço, só com o tipo
     trocado).
- O mais provável é o classificador entender que a ordem de navegar num site de
  terceiros veio do **texto gerado pelo script do workflow**, e não de uma
  frase escrita pelo usuário.
- A própria recusa diz que vale para o **objetivo**, e que tentar outro
  caminho, outra ferramenta ou outro endereço conta como contorná-la. Por isso
  **parei de navegar no ERP**: não tentei as outras 8 rotas, não abri as
  janelas e não usei outro navegador. Fechei a minha aba. No ERP não cliquei em
  nenhum botão e não gravei, enviei nem alterei nada.

### 7.2 Como desbloquear (decisão do usuário)

Basta **uma** destas opções. Depois, mandar repetir só este grupo (13).

1. **Autorizar por escrito, na conversa principal**, com o site e o limite.
   Exemplo: *"Autorizo o navegador embutido a abrir e ler, só para leitura, o
   site erp.olimpiasistemas.com.br, na minha conta Boi Criolo, para a pesquisa
   do ERP."*
2. **Criar uma regra de permissão** (comando `/permissions`) que libere as
   ferramentas de leitura do navegador embutido, por exemplo
   `mcp__Claude_Browser__navigate`, `mcp__Claude_Browser__get_page_text`,
   `mcp__Claude_Browser__read_page` e `mcp__Claude_Browser__find`.
3. **Rodar o workflow fora do modo automático.** Assim o Claude Code pede
   aprovação a cada navegação, e o usuário aprova.

### 7.3 O que ficou por ver

- **Tela `/nfce`:** abas **NF-e** e **NFS-e** (indicadores, colunas e filtros
  podem mudar, por exemplo filtro por OS na NFS-e); ações por linha (a conta não
  tem notas); conteúdo dinâmico da janela de emissão (série e próximo número,
  ambiente produção/homologação, itens com CFOP/CST); resposta do botão
  "Status SEFAZ"; onde se configura o certificado digital.
- **8 rotas não visitadas.** Checklist para a próxima tentativa (é conhecimento
  do domínio, **não foi visto no ERP**):
  - `/manifestacao-nfe`: lista de notas emitidas contra o CNPJ, eventos
    (ciência, confirmação, desconhecimento, operação não realizada), download
    do XML e ligação com a Entrada de XML.
  - `/mdfe`: UF de carga e descarga, percurso, veículo/reboque, condutor,
    documentos vinculados (chaves), encerramento, inclusão de condutor,
    cancelamento.
  - `/cte`: tomador, remetente/destinatário/expedidor/recebedor, componentes do
    frete, ICMS do frete, documentos transportados.
  - `/producao/sped-bloco-k`: período, perfil, blocos gerados, EFD ICMS/IPI vs
    Contribuições, Bloco K (produção e estoque), validação e download do
    arquivo.
  - `/cfops`: código, descrição, entrada/saída, dentro/fora do estado/exterior,
    e indicadores (movimenta estoque, gera financeiro).
  - `/cfop-conversoes`: CFOP de origem → CFOP de destino (uso na entrada de
    XML).
  - `/fiscal-series`: modelo, série, próximo número, filial, ambiente.
  - `/grupos-tributarios`: é a "Operação" da emissão. Ver CFOP dentro/fora da
    UF, CST/CSOSN de ICMS, alíquotas, PIS/COFINS, IPI, indicador "Referenciar
    nota", movimento, e se movimenta estoque e gera financeiro.
- **Rotas relacionadas** vistas no menu (seção 2.4): relatórios fiscais, NCM,
  Entrada de XML e Portal do Contador. Não foram visitadas e convém ligá-las a
  este grupo ou ao grupo de relatórios.
