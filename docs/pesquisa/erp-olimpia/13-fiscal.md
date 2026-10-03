# 13 — Fiscal: NF-e, NFC-e, NFS-e, MDF-e, CT-e, SPED, CFOP e tributação (ERP Olímpia)

> Cobre o módulo Fiscal: o lançador, o gestor de documentos (`/nfce`), a
> manifestação do destinatário, MDF-e, CT-e, SPED e as tabelas fiscais (CFOP,
> conversão de CFOP, séries e grupo tributário). Exploração de 2026-10-03, conta
> de teste "Boi Criolo" (plano Full), sessão já aberta no navegador embutido.
> Lidas: lançador, `/nfce` (em parte), `/manifestacao-nfe` e grupo tributário;
> 6 rotas não abriram. Legenda: [visto], [visto em parte], [deduzido],
> [afirmado pelo manual], [código] (lido no HTML/JS da página), [proposta];
> [a verificar] marca hipótese ou conhecimento geral do domínio fiscal
> brasileiro, **não** visto no ERP. Nada foi gravado no ERP.

---

## 1. Visão geral

O módulo Fiscal é uma **tela-lançador** com três blocos de atalhos [visto]:

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

- **O coração do módulo** é **um gestor único de documentos fiscais** (NFC-e,
  NF-e e NFS-e na mesma tela, separados por abas). Nesse gestor, **a nota nasce
  sempre de um registro que já existe**: uma venda, uma "saída" (outras saídas
  de estoque) ou uma ordem de serviço [visto].
- **A tributação de cada item** vem de um **grupo tributário / operação**
  escolhido na emissão [visto]. O grupo tributário é a **matriz de regras
  fiscais**: para cada tipo de movimento (entrada ou saída), operação (venda,
  venda PDV, devolução, remessa…) e documento (NF-e, NFC-e, MDF-e, CT-e,
  NFS-e), diz qual CFOP, CST/CSOSN e alíquotas usar. Essas regras mudam
  conforme o destino (estadual, interestadual ou internacional) e o regime da
  empresa (Simples ou Normal). A tela já traz os campos da **Reforma
  Tributária** (IBS, CBS e Imposto Seletivo) [visto].
- **O produto liga-se a vários grupos**, num painel do cadastro de produto (ver
  [07-produtos.md](07-produtos.md)). Na emissão, o documento e a operação
  escolhidos decidem qual desses grupos vale [deduzido].
- **As compras entram pela manifestação:** o ERP consulta a SEFAZ (DistDFe) à
  procura das notas emitidas contra o CNPJ, faz a manifestação do destinatário
  e leva o XML para a Entrada de XML do estoque (ver
  [09-estoque.md](09-estoque.md)) [visto].
- **Menu [visto]:** o Fiscal fica no grupo **"Financeiro & Fiscal"** do menu
  lateral, junto com o Financeiro e o **Portal do Contador** (ver
  [11-financeiro-bancos.md](11-financeiro-bancos.md)). Tem botão para fixar o
  módulo no topo do menu ("Fixar fiscal").
- **Origem do sistema [visto]:** as telas exibem **nomes internos de
  formulários de um sistema desktop antigo** (por exemplo
  `FrmFiscal_GerenciarNFCe`, `FrmFiscal_View`, `ECTransportador`,
  `FrmNFe_Referenciar`, `FrmFiscal_Grupo_Tributario`). Indica que o ERP web é
  uma migração de um ERP desktop (Delphi, segundo o checklist de migração) e
  que ainda carrega esse vocabulário técnico na interface.
- **Plano [visto em `/meu-plano`, ver
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)]:** o
  Profissional cita NF-e e NFC-e; o Premium cita CT-e/MDF-e. Na lista dos 36
  módulos do Full aparecem "Emissão NF-e", "Emissão NFC-e", "Emissão CT-e" e
  "Emissão MDF-e" como módulos separados.
- **O que o manual afirma [afirmado pelo manual, ver
  [22-manual.md](22-manual.md)]:** cartão "Documentos Fiscais" com 4 passos:
  séries em "Empresa → Documentos fiscais"; enviar o .pfx na aba "Logo /
  Certificado"; emitir por vendas, PDV ou módulo fiscal; consultar a situação
  na SEFAZ e reenviar em contingência. **Dois caminhos estão errados:** as
  séries ficam em Fiscal › Séries (`/fiscal-series`) e a aba do certificado
  chama-se "Logo / QR PIX". O manual também afirma NF-e ou NFC-e "conforme a
  operação" na venda e NFC-e automática no PDV quando configurada.

### 1.1 Elementos globais vistos de passagem

A casca comum a todas as telas (barra superior, assistente, menu lateral com
"Fixados" e "Atalhos rápidos", janelas de aviso globais, sondagem por canal) está
em [22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas). Próprio do fiscal:

- **Aviso de nota para manifestar [código]:** a moldura consulta de tempos em
  tempos `/erp/notificacoes/manifestacao/poll`. Quando há nota nova emitida
  contra o CNPJ, mostra um aviso flutuante "Nova NF-e para manifestar", com
  emitente, data e valor e o link "Abrir Manifestação". O aviso some sozinho em
  10 segundos e espera enquanto o mouse está em cima.
- **Busca Ctrl+K [visto]:** "certificado" não acha nada e responde com
  "verifique suas permissões".
- **Assistente [visto]:** diz responder sobre NF-e/NFC-e/NFS-e, com o exemplo
  "como emitir NFS-e?" (nenhuma pergunta foi enviada).

### 1.2 Onde se configura o fiscal fora deste módulo

| O quê | Onde fica | Documento |
|---|---|---|
| Certificado digital A1 (.pfx + senha), **único da empresa**, usado em NF-e, NFC-e, MDF-e, CT-e, NFS-e e nos gateways bancários; ação "Baixar certificado A1" pede a senha | aba "Logo / QR PIX" de `/empresa/{id}` (o manual e outras telas chamam-lhe "Logo / Certificado") | [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md) |
| Parâmetros fiscais da empresa (129 campos) | aba "Parâmetros" de `/empresa/{id}`; síntese em 1.3 | [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md) |
| Impressora NFC-e / DANFC-e (PDF), caminho dos layouts DANFE/DANFCe, "Reenviar NFC-e automaticamente" (Não/Sim); a tela avisa que séries e certificado ficam em Fiscal → Séries e no cadastro da empresa, e tem atalhos para `/fiscal-series`, `/nfce` e "Empresa (CRT / tributos)" (`/empresa/1`) | `/parametros-sistema` | [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md) |
| Impressão térmica do DANFC-e (o Bridge converte o PDF da NFC-e para ESC/POS; documentos fiscais só aceitam PDF e vão para a "impressora NFC-e"); o Bridge também expõe certificados ao navegador | `/bridge` | [17-consultoria-ia.md](17-consultoria-ia.md) |
| Painel "Grupo tributário" do produto (N:N) e NCM (`/ncms`) | cadastro de produto | [07-produtos.md](07-produtos.md) |
| Veículos (tipo rodoviário, carroceria, carreta, proprietário com RNTRC), pensados para o MDF-e | `/veiculos` | [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md) |
| Entrada de XML e Entrada Manual (`/entradas-xml`, `/entradas-manual`); saída manual, que origina NF-e de outras saídas | Estoque | [09-estoque.md](09-estoque.md) |
| Serviços (`/servicos`), base da NFS-e; ordem de serviço | OS | [14-os-forca-vendas.md](14-os-forca-vendas.md) |
| Portal do Contador (`/contador-admin`, `/contador-admin/link`) | Financeiro & Fiscal | [11-financeiro-bancos.md](11-financeiro-bancos.md) |
| Relatórios fiscais (`nfe-rejeitadas`, `nfe-tributos`, `nfe-por-cfop`, `nfe-itens-fiscal`, `mdfe-periodo`, `cte-periodo`, `fiscal-manifestacao-nfe`, `nfse-emitidas`, `sped-resumo-periodo`, `icms-mensal`, `entradas-xml`) | Central de relatórios | [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md) |
| Relatórios fiscais só da Central (`nfce-emitidas`, `fiscal-cancelados`, `nfce-tributos`, `nfce-itens-fiscal`, `produtos-tributacao-nfe`, `produtos-tributacao-nfce`, estes dois já com IBS e CBS) | catálogo da Central | [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md) |

### 1.3 Parâmetros fiscais da empresa (síntese)

A aba "Parâmetros" de `/empresa/{id}` (cerca de 420 opções) está descrita por
inteiro em [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md). O
grupo **"Fiscal / NF-e" tem 129 campos em 8 secções**: Definições, Serviço
(NFS-e nacional), ISS no PDV, Simples Nacional, Acesso prefeitura (legado),
Impressão, Manifestação e Outros. O que interessa a este módulo [visto; rótulos
interpretados quando eram nomes de coluna]:

- **Regime:** 0 Nenhum, 1 Simples, 2 Simples com excesso, 3 Regime normal.
- **Versões:** NF-e 4.0 ou 3.10; QR Code da NFC-e 100 ou 200 (as opções
  aparecem duplicadas).
- **SPED:** atividade (industrial ou outros) e perfil A, B ou C.
- **NFS-e no PDV** no lugar de NFC-e para serviços.
- **Responsável técnico** (grupo do XML com a Olímpia como desenvolvedora).
- **Último e máximo NSU** (da distribuição DF-e); e-mail de envio dos XML ao
  contador; transportadora e cedente padrão.
- **NFS-e nacional:** regime especial (0 a 6), item da lista, código NBS,
  códigos de tributação municipal e nacional, alíquota de ISS, lote, CNAE,
  data de competência. "Acesso prefeitura (legado)" guarda usuário e senha das
  prefeituras antigas.
- **ISS no PDV para cartório** (assinatura, notas, registro civil, RTD).
- **Simples Nacional:** percentuais de aproveitamento de ICMS, PIS e COFINS;
  alíquotas de IRPJ e CSLL.
- **Impressão:** cerca de 70 opções do DANFE (NFC-e e NF-e em dobro): preview,
  logo, margens, casas decimais, cópias, impressora, pasta do PDF...
- **Manifestação:** ciência automática ao sincronizar (**ligada**), consulta
  automática DistDFe (**ligada**), importar XML como entrada automaticamente
  (**desligada**, e o padrão é desligado).
- **Lançar contas a pagar a partir da NF-e de entrada** (ligado).
- **Noutros grupos:**
  - Caixa / PIX: emitir **NFC-e no recebimento** (ligado);
  - PDV: TEF com **autoemissão da NFC-e** (ligado), forçar NFC-e em venda com
    cartão, pedir CPF no cupom;
  - Vendas: percentuais de ICMS/ST; ordem dos itens na impressão da nota
    fiscal;
  - E-mails: uma das três contas SMTP é a das **notas** e outra a do
    **contador**.
- **Inconsistência [visto]:** nos parâmetros, "Ciência automática ao
  sincronizar NF-e" está **ligada**; mas a tela de importação de XML
  (`/entradas-xml/create`, ver [09-estoque.md](09-estoque.md)) mostra "Ciência
  auto: NÃO" como "parâmetro da empresa". As duas telas dizem coisas opostas
  sobre o mesmo ajuste.
- **Séries e contingência** não aparecem nesta síntese dos parâmetros: as
  séries ficam em `/fiscal-series`; a contingência só aparece como status
  (999) no gestor de notas e no manual.

### 1.4 Rotas e estado

| Rota | Nome | Estado |
|---|---|---|
| `/dashboard/modulo/fiscal` | Lançador do Fiscal | lida |
| `/nfce` | Gestor NF-e \| NFC-e \| NFS-e | parcial (aba NFC-e e janelas lidas; aba NF-e **recusada**; aba NFS-e não aberta) |
| `/manifestacao-nfe` | Manifestação de NF-e (DistDFe) | lida (aberta a partir do estoque) |
| `/mdfe` | MDF-e | não aberta |
| `/cte` | CT-e | não aberta |
| `/producao/sped-bloco-k` | SPED Fiscal / Contribuições | não aberta |
| `/cfops` | CFOP | não aberta |
| `/cfop-conversoes` | Conversão CFOP | não aberta |
| `/fiscal-series` | Séries | não aberta |
| `/grupos-tributarios` | Grupo tributário (lista) | lida |
| `/grupos-tributarios/create` | Novo grupo tributário | lida |
| `/grupos-tributarios/{id}/edit` | Alterar grupo | parcial (abriu; leitura dos valores **recusada**) |

---

## 2. Telas

### 2.1 `/dashboard/modulo/fiscal` — Lançador do módulo [visto]

- **Objetivo:** ponto de entrada do módulo. Só tem atalhos, sem indicadores.
- **Conteúdo:** cabeçalho "Fiscal" com o link "Voltar ao dashboard" e três
  cartões-bloco (ícone + rótulo em caixa alta), conforme a tabela da secção 1.
- **Não tem:** contadores (notas rejeitadas, pendentes, em contingência),
  alertas (validade do certificado digital, série a acabar, SEFAZ fora do ar)
  nem atalho de "emitir agora".

### 2.2 `/nfce` — Gestor de documentos fiscais (NFC-e / NF-e / NFS-e) [visto em parte]

Título da página: "NF-e | NFC-e | NFS-e". Subtítulo: nome interno do formulário
(`FrmFiscal_GerenciarNFCe`) + "documentos fiscais eletrônicos".

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

**Códigos de status no resto do ERP [código, pelos relatórios; ver
[21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)]:**
a NF-e guarda o próprio código de retorno da SEFAZ como status (100 autorizada,
101 cancelada; as rejeitadas têm relatório próprio). O filtro de status da
NFS-e nos relatórios é **texto livre**, sem lista; os valores aceites podem ser
descobertos na aba NFS-e desta tela.

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
reenviar por e-mail [deduzido]. **A verificar:** download do XML, inutilização
de numeração e reenvio de nota rejeitada ou em contingência (o manual afirma
"reenviar em contingência").

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

- **As 20 opções são as operações de saída** do grupo tributário (secção 2.10);
  as 41 operações do sistema (21 de entrada + 20 de saída) são a mesma lista
  usada nas entradas e saídas manuais do estoque (ver
  [09-estoque.md](09-estoque.md)) [visto].
- **Regra mostrada na tela:** se a operação é de venda, o sistema procura o
  registro na tabela de **vendas**. Nas outras saídas procura na tabela de
  **saídas**. Ou seja, o mesmo campo "Registro" aponta para entidades
  diferentes conforme a operação.
- **Caixa "Pré-visualizar (não grava nem envia)":** gera a pré-visualização do
  documento sem gravar nem transmitir.
- **Botões:** "Fechar" e "Enviar nota" (grava e transmite).
- **Contexto escondido no formulário [código]:** modelo, id da venda, origem do
  registro, id do transportador e um indicador de **retorno ao caixa**. Isto
  mostra que a mesma janela é chamada também a partir do fluxo de venda/caixa e
  depois volta para ele.

Abas internas:

| Aba | Conteúdo |
|---|---|
| Observação | texto livre das observações da nota (campo de informações complementares, "infCpl") |
| Transportador | pesquisa de pessoa transportadora (lupa + limpar; nome interno `ECTransportador`). Regra: **escolher primeiro a modalidade de frete** e só depois o transportador |
| Produtos | grade só de leitura com It · Produto · CFOP · CST · Grupo · Valor. Fica vazia até informar o registro |
| Destinatário | carregado a partir do registro ("informe o registro para carregar o destinatário") |
| Dados entrega | Qtd. de volumes, espécie, marca, peso líquido, peso bruto, valor do frete e total da nota (só leitura) |
| NF referenciada | (`FrmNFe_Referenciar`) uma ou várias chaves de 44 dígitos coladas num campo de texto e separadas automaticamente. Usa-se em devolução ou quando o grupo tributário tem a opção "Referenciar nota". **Regra automática:** uma NF-e de venda emitida sobre uma venda que já tem NFC-e autorizada inclui sozinha a chave dessa NFC-e |

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

#### O que ficou por ver nesta tela

- Abas **NF-e** e **NFS-e**: indicadores, colunas e filtros podem mudar (por
  exemplo, filtro por OS na NFS-e; a URL já tem `id_os`), e os valores do
  status da NFS-e.
- Ações por linha (a conta não tem notas).
- Conteúdo dinâmico da janela de emissão: série e próximo número, ambiente
  produção/homologação, itens com CFOP/CST.
- Resposta do botão "Status SEFAZ".

### 2.3 `/manifestacao-nfe` — Manifestação de NF-e (DistDFe) [visto]

Aberta a partir do estoque (atalho na tela de importação de XML). Também há um
link de volta, "Entrada XML".

- **Ações no topo** (não clicadas): "Consultar SEFAZ", "Zerar NSU" e o link
  "Entrada XML".
- **Cartão "Última sincronização":**
  - Aviso: **"Série NF-e não configurada"**, com a orientação de cadastrar em
    Fiscal → Séries e a etiqueta "Ignorado". A falta da série trava a
    sincronização [deduzido].
  - Contadores: consultas, documentos recebidos, notas novas, ciências/XMLs,
    NSU consultado (de → até) e situação da fila na SEFAZ.
- **Indicadores:** Pendentes (aguardando manifestação), Ciência (XML pode ser
  baixado), Finalizadas (ciclo encerrado), Valor pendente (soma das notas em
  aberto).
- **"Monitor SEFAZ":**
  - consulta automática ligada, última consulta "Nunca", último NSU, NSU máximo
    e XML baixados;
  - botões "Desligar consulta automática" e "Ligar importação auto" (não
    clicados);
  - aviso: o XML não vira entrada sozinho; é preciso importar nota a nota.
- **"Regras da consulta"** (resumo, com palavras nossas):
  - Sem NSU pendente, é preciso esperar 60 minutos entre consultas completas.
    Se ainda faltam documentos (último NSU menor que o máximo), dá para
    consultar antes.
  - No erro 589 da SEFAZ (NSU acima do permitido), o sistema zera o NSU e
    consulta de novo. "Zerar NSU" força isso.
  - A ciência libera o download do XML completo. Ela é opcional.
  - Confirmação, desconhecimento e "operação não realizada" encerram o ciclo.
  - "Operação não realizada" exige justificativa de pelo menos 15 caracteres.
  - A tela cita prazos de 10 dias (ciência) e 20 dias (confirmação) [visto na
    tela; a regra legal está por verificar].
- **Abas** "Pendentes" e "Manifestadas", com contagem. Filtros: De, Até e
  "Emitente / chave" (nome, CNPJ ou chave).
- **Colunas:** seleção, NF-e, Emissão, Emitente, Valor, Status, XML.
- **Ação em lote "Manifestar selecionadas":** Ciência da operação, Confirmação
  da operação, Desconhecimento da operação e Operação não realizada (abre um
  modal com a justificativa).
- **Códigos da situação [código, pelo relatório "Manifestação DF-e", ver
  [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)]:**
  as três fases dos indicadores (Pendente, Ciência, Finalizada) são guardadas
  como `F`, `P` e `T`. "Finalizada" junta confirmação, desconhecimento e
  operação não realizada.
- **Rotina automática [visto em `/entradas-xml/create`, ver
  [09-estoque.md](09-estoque.md)]:** "Auto sync: ON, a cada 5 min"; a rotina
  consulta a distribuição (DistDFe), dá ciência, baixa o XML e cria entradas
  pendentes, e só roda com o parâmetro "Consulta automática" ligado.
- **Inconsistência da ciência automática:** ver secção 1.3 (ligada nos
  parâmetros, "NÃO" na tela de importação).
- **Endereços de ação [código]** (não usados): `/manifestacao-nfe/consultar`,
  `/manifestacao-nfe/zerar-nsu`, `/manifestacao-nfe/consulta-automatica`,
  `/manifestacao-nfe/importar-entrada-auto`.

### 2.4 `/mdfe` — MDF-e [não aberta]

- **Já se sabe:**
  - [código, pelo relatório "MDF-e emitidos", ver
    [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)]
    o status é numérico: `0` Pendente, `1` Autorizado, `2` Encerrado, `3`
    Cancelado. Ciclo: nasce Pendente → Autorizado na SEFAZ → Encerrado (fim da
    viagem) ou Cancelado.
  - [visto] o cadastro de veículos (`/veiculos`, ver
    [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)) é pensado
    para o MDF-e: tipo rodoviário, carroceria, carreta, proprietário com RNTRC.
  - [a verificar] o romaneio de carga guarda as chaves das NF-e da carga, que é
    o que o MDF-e precisa; não se viu ligação direta (ver
    [02-vendas-pdv.md](02-vendas-pdv.md)).
  - O grupo tributário tem "MDF-e" como tipo de DF-e [visto].
- **Perguntas a responder** (checklist do domínio, **não visto no ERP**): UF de
  carga e descarga, percurso, veículo/reboque, condutor, documentos vinculados
  (chaves), encerramento, inclusão de condutor, cancelamento; que códigos de
  tipo rodoviário e carroceria vão para o XML; se a tela destaca os manifestos
  autorizados ainda por encerrar. [a verificar, domínio] o MDF-e precisa ser
  encerrado ao fim da viagem; um manifesto esquecido em aberto pode impedir o
  próximo para o mesmo veículo; o cancelamento só vale num prazo curto e antes
  de a viagem começar.

### 2.5 `/cte` — CT-e [não aberta]

- **Já se sabe:** [código, pelo relatório "CT-e emitidos", ver
  [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)]
  o filtro de status é **texto livre**, sem lista; os valores aceites podem ser
  descobertos nesta tela. O grupo tributário tem "CT-e" como tipo de DF-e
  [visto].
- **Perguntas a responder** (checklist do domínio, **não visto no ERP**):
  tomador, remetente/destinatário/expedidor/recebedor, componentes do frete,
  ICMS do frete, documentos transportados, valores de status.

### 2.6 `/producao/sped-bloco-k` — SPED Fiscal / Contribuições [não aberta]

- **Já se sabe:**
  - [visto] o atalho "SPED Fiscal / Contribuições" do Fiscal aponta para uma
    rota dentro de **produção** chamada **bloco K** (o bloco do SPED que trata
    de produção e estoque). Ou a tela junta a geração do SPED e o Bloco K, ou o
    rótulo engana. **A verificar.**
  - [visto] os parâmetros fiscais têm a atividade do SPED (industrial ou
    outros) e o perfil (A, B ou C).
  - [deduzido] o relatório "SPED — resumo fiscal do período" consolida por
    CFOP as NF-e e NFC-e autorizadas para conferir antes de gerar o arquivo; o
    arquivo em si deve ser gerado nesta tela (ver
    [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)).
  - [a verificar] se o lançador da Produção (`/dashboard/modulo/producao`, ver
    [10-compras-producao.md](10-compras-producao.md)) também tem um cartão
    para o SPED bloco K.
- **Perguntas a responder** (checklist do domínio, **não visto no ERP**):
  período, perfil, blocos gerados, EFD ICMS/IPI vs Contribuições, Bloco K
  (produção e estoque), validação e download do arquivo; se há envio direto ao
  contador.

### 2.7 `/cfops` — CFOP [não aberta]

- **Já se sabe:** [visto] no grupo tributário o CFOP é **digitado** (texto
  livre, sem lista nem validação visível), e esta conta usa 5102, 5403 e 5405
  nos grupos de venda (secção 2.10).
- **Perguntas a responder** (checklist do domínio, **não visto no ERP**):
  código, descrição, entrada/saída, dentro/fora do estado/exterior, e
  indicadores (movimenta estoque, gera financeiro); se a tabela é usada para
  validar o CFOP digitado no grupo tributário.

### 2.8 `/cfop-conversoes` — Conversão CFOP [não aberta]

- **Já se sabe:** [visto em `/entradas-xml/create`, ver
  [09-estoque.md](09-estoque.md)] a importação do XML "converte o CFOP" (do
  CFOP de saída do fornecedor para um de entrada [deduzido]), além de
  cadastrar o fornecedor se preciso e ligar os itens a produtos pelo GTIN ou
  pela referência.
- **Perguntas a responder:** CFOP de origem → CFOP de destino; se a conversão
  depende do fornecedor, do produto ou da UF; o que acontece quando não há
  regra.

### 2.9 `/fiscal-series` — Séries [não aberta]

- **Já se sabe:**
  - [visto] a manifestação mostra "Série NF-e não configurada", com
    orientação para cadastrar em Fiscal → Séries e a etiqueta "Ignorado".
    [deduzido] Esta conta não tem série de NF-e cadastrada e a falta trava a
    sincronização da manifestação.
  - [visto] `/parametros-sistema` avisa que as séries ficam em Fiscal → Séries
    e tem um atalho para esta rota.
  - [afirmado pelo manual] o manual manda configurar as séries em "Empresa →
    Documentos fiscais", caminho que não existe.
- **Perguntas a responder** (checklist do domínio, **não visto no ERP**):
  modelo, série, próximo número, filial, ambiente (produção/homologação).

### 2.10 `/grupos-tributarios` — Grupo tributário [visto]

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
  conjunto que já vem pronto na conta nova [a verificar].
- **Detalhe técnico [código]:** o código de "Ativo" vale 0 no grupo tributário
  (e 1 na carga horária e em pessoas).

#### `/grupos-tributarios/create` — Novo grupo tributário [visto]

É um formulário único com cerca de 150 campos. Os botões **Gravar** e
**Cancelar** não foram clicados.

**Cabeçalho**

| Campo | Tipo | Obrig. | Opções / observações |
|---|---|---|---|
| ID | texto só leitura | — | "—" num registro novo |
| Empresa | texto só leitura | — | a empresa logada: o grupo pertence à empresa |
| Descrição | texto | sim | |
| Entrada / Saída | lista | sim | Entrada, Saída. Ao trocar, a lista "Operação" é recarregada do servidor (`/grupos-tributarios/operacoes?tipo=0` ou `?tipo=1`, devolve JSON com id e descrição) [código] |
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
- cliente não contribuinte do AM ("Cli. não cont. AM");
- derivado de petróleo;
- referenciar nota (obriga a chave de uma nota referenciada; é a aba "NF
  referenciada" da emissão, secção 2.2);
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
| Sub-aba Regime Normal | alíquota ECF; CST do ICMS; cBenef; modalidade da base do ICMS; alíquota do ICMS; desoneração do ICMS (dois campos, um deles "ICMS deson. liq."); ST: modalidade da base, alíquota, redução, margem (MVA); "ICMS 40": modalidade da base e alíquota |
| Sub-aba Reforma Tributária | IBS: CST, cClassTrib, alíquota, % de redução, modalidade da base, cCredPres, indicador de doação; CBS: alíquota, % de redução, modalidade da base |

Conta rápida: são 3 destinos com cerca de 39 campos cada, mais uns 30 no
cabeçalho.

**Regras observadas**

- São obrigatórios a descrição, a operação e o tipo de movimento.
- As operações são filtradas pelo tipo de movimento (lista vinda do servidor).
- Nenhum campo fiscal oferece lista de valores ou validação visível: CFOP, CST,
  CSOSN e cClassTrib são digitados.
- A empresa é fixa (a do login), por isso os grupos são por empresa ou filial.
- Há nomes técnicos à vista na tela (`FrmFiscal_Grupo_Tributario`,
  `produto_empresa`).
- [a verificar] Não aparecem indicadores de "movimenta estoque" nem de "gera
  financeiro" no grupo.

#### `/grupos-tributarios/{id}/edit` — Alterar grupo [visto em parte]

A página do grupo nº 1 abriu (título "Grupo #1"), mas a leitura dos valores
gravados (CFOP, CST e alíquotas de cada aba) foi recusada pelo classificador do
Claude Code. O painel do produto mostra um resumo desses valores (CST e
alíquota de ICMS por grupo); de propósito, não foi copiado.

---

## 3. Fluxos de ponta a ponta

Os passos marcados com **(obs.)** foram vistos. Os outros são o encadeamento
mais provável, **a verificar**.

1. **Regras fiscais (grupo tributário).**
   - Cadastrar os grupos: movimento, operação, documento, destino e regime
     **(obs.)**.
   - No produto, marcar os grupos que valem para ele **(obs.: painel do
     produto, ver [07-produtos.md](07-produtos.md))**.
   - Na venda, no PDV ou na OS, a operação (ex.: VENDA, VENDA PDV ON) e o
     documento (NF-e ou NFC-e) apontam o grupo [deduzido].
   - CFOP, CST e alíquotas vão para a nota, que segue para a SEFAZ.
   - Com a reforma, a caixa "usar reforma tributária" e a vigência ligam os
     campos de IBS, CBS e IS [deduzido].
2. **Venda → NFC-e.** Venda no balcão/PDV **(obs.: a janela de emissão tem
   indicador de retorno ao caixa)** → "Gerar documento" com modelo NFC-e →
   registro da venda + operação (ex.: VENDA, VENDA PDV ON/OFF) + CPF opcional
   **(obs.)** → itens com CFOP/CST/grupo vindos do grupo tributário **(obs.)** →
   pré-visualizar (opcional) **(obs.)** → "Enviar nota" → SEFAZ → status 100
   (autorizada) ou 0 (não autorizada, aparece no relatório "NF-e rejeitadas") →
   DANFE para imprimir **(obs.)** e/ou e-mail **(obs.)**.
   - Variantes pelos parâmetros **(obs.: só os parâmetros)**: NFC-e emitida no
     recebimento do caixa, autoemissão da NFC-e com TEF, NFC-e forçada em venda
     com cartão. O manual afirma NFC-e automática no PDV [afirmado pelo
     manual].
3. **Venda → NF-e (cliente identificado).** Igual ao anterior, com o modelo
   NF-e, mas antes é preciso **identificar o cliente (obs.)** → frete e
   transportador (frete primeiro) **(obs.)** → volumes e pesos **(obs.)** →
   envio.
4. **NFC-e já emitida e o cliente pede NF-e.** A NF-e de venda inclui sozinha a
   chave da NFC-e autorizada como nota referenciada **(obs.)**.
5. **Outras saídas** (bonificação, remessa, transferência, comodato, conserto,
   demonstração, perda, consignação, entrega futura). Registro de **saída**
   (não de venda) **(obs.)**, criado na saída manual do estoque (ver
   [09-estoque.md](09-estoque.md)) → NF-e com a operação correspondente.
6. **Devolução de compra.** Operação "DEVOLUÇÃO COMPRA" + chave da NF-e do
   fornecedor na aba "NF referenciada" **(obs.)**.
7. **Nota complementar.** Operação "NFE COMPLEMENTAR" + chave referenciada.
   **A verificar.**
8. **Pós-emissão.** CC-e com texto obrigatório **(obs.)**; cancelamento com
   justificativa obrigatória → status 101 **(obs.)**; inutilização → status 102
   **(obs.: existe o status)**; contingência → status 999 **(obs.: existe o
   status)**; reenvio em contingência [afirmado pelo manual].
9. **Serviço → NFS-e.** Ordem de serviço concluída → "Gerar NFS-e" com o número
   da OS **(obs.)** → prefeitura (NFS-e nacional ou prefeitura antiga, pelos
   parâmetros) → relatório "NFS-e emitidas" (ver 21).
10. **Compra com manifestação.**
    1. A SEFAZ entrega a nota pela Distribuição DF-e; a consulta automática
       corre a cada 5 min se o parâmetro estiver ligado **(obs.)**.
    2. A moldura mostra o aviso "Nova NF-e para manifestar" **(obs.: no
       código)**.
    3. Na manifestação, a empresa dá ciência (automática ou manual), o que
       libera o XML **(obs.)**.
    4. A nota vira entrada pendente, pela sincronização ou pelo "Importar" de
       cada nota; o fornecedor é cadastrado, o CFOP convertido e os itens
       ligados por GTIN ou referência **(obs., ver
       [09-estoque.md](09-estoque.md))**.
    5. Conferência e conclusão da entrada → estoque e contas a pagar (parâmetro
       "lançar a pagar" ligado).
    6. Confirmação da operação (ou desconhecimento, ou operação não realizada
       com justificativa) dentro do prazo **(obs.)** → situação "Finalizada".
11. **Transporte com MDF-e.** A NF-e da carga é emitida → o MDF-e nasce
    "Pendente" e passa a "Autorizado" → a viagem acontece e o MDF-e é encerrado
    ("Encerrado") → se der errado antes de sair, é cancelado ("Cancelado")
    **(obs.: só os status, pelo relatório)**.
12. **Fechamento do mês.** Durante o mês, vendas geram NFC-e/NF-e, OS geram
    NFS-e e o transporte gera CT-e/MDF-e. No fim: resolver pendências
    (manifestações em "Pendente" ou "Ciência", MDF-e ainda "Autorizado", notas
    rejeitadas) → conferir os relatórios por item, por CFOP e de ICMS (ver 21)
    → gerar o SPED (EFD ICMS/IPI e Contribuições) em
    `/producao/sped-bloco-k` → entregar ao contador (Portal do Contador ou
    e-mail de XML ao contador dos parâmetros). **A verificar.**

---

## 4. Entidades e relações

| Entidade | Campos | Relações |
|---|---|---|
| DocumentoFiscal (NFC-e 65 / NF-e 55 / NFS-e) | modelo, movimento (entrada/saída), número, série, data, filial emitente, origem (venda, saída ou OS) + ID do registro de origem, cliente/destinatário, CPF/CNPJ do consumidor, operação/grupo tributário, modalidade de frete, transportador, volumes (qtd., espécie, marca), pesos (líquido/bruto), valor do frete, total, observações, chave de acesso (44 dígitos), status (0/100/101/102/999; o código da SEFAZ), e-mail de envio [visto] | 1:N ItemDocumentoFiscal; N:N DocumentoReferenciado; 1:N EventoFiscal; N:1 Pessoa; N:1 Filial |
| ItemDocumentoFiscal | nº do item, produto, CFOP, CST, grupo, valor [visto]; NCM, CSOSN e tributos pelos relatórios | N:1 Documento; N:1 Produto |
| DocumentoReferenciado | chaves de 44 dígitos (NF-e/NFC-e) [visto] | N:N Documento |
| EventoFiscal | CC-e (texto) e cancelamento (justificativa) [visto]; inutilização a verificar | N:1 Documento |
| GrupoTributário | empresa; descrição; tipo (entrada/saída); status (Ativo = 0); operação; tipo DF-e; alíquota ECF; mensagem da NF; 12 indicadores (incl. "Referenciar nota"); parâmetros da reforma (modelo de apuração, categoria IVA, categoria IS, vigência, créditos IBS/CBS, IS incide, usar reforma); para cada destino (estadual, interestadual, internacional): campos comuns, Simples (CSOSN), Normal (CST, ICMS, ST, desoneração) e Reforma (IBS, CBS) [visto] | pertence a uma Empresa; N:1 Operação fiscal; N:N Produto |
| Operação fiscal | id (1 a 41); descrição; tipo (entrada/saída) [visto] | lista do sistema (21 de entrada, 20 de saída); 1:N GrupoTributário; escolhida na emissão e nas entradas/saídas do estoque |
| Produto (parte fiscal) | grupos tributários marcados; NCM [visto, ver 07] | N:N GrupoTributário |
| Venda, Saída e OrdemDeServiço | registros que originam a nota [visto] | 1 registro → 0..N documentos (uma venda pode ter NFC-e e depois NF-e) |
| Pessoa | cliente, consumidor, transportadora (cadastro único de pessoas, com tipos) [visto] | papéis no documento |
| Filial | emitente; as listas filtram por filial [visto] | 1:N Documento |
| DF-e recebido (manifestação) | NSU, chave, emitente, emissão, valor, situação (`F` Pendente, `P` Ciência, `T` Finalizada), XML [visto e código] | 1:N Evento de manifestação; 1:0..1 Entrada XML (ver 09) |
| Controle da distribuição | último NSU, NSU máximo, última consulta, consulta automática, importação automática [visto] | por empresa |
| MDF-e | número, série, data, status (0 Pendente, 1 Autorizado, 2 Encerrado, 3 Cancelado) [código]; prováveis: UFs, veículo, condutor | N:N NF-e e CT-e transportados; N:1 Veículo [deduzido] |
| CT-e | número, série, data, status (texto) [código]; prováveis: tomador, remetente, destinatário, valor do frete, ICMS | N:1 Pessoa, em vários papéis |
| SérieFiscal (`/fiscal-series`), CFOP (`/cfops`), ConversãoCFOP (`/cfop-conversoes`), ArquivoSPED | não vistos | tabelas de apoio |
| Certificado A1 | arquivo .pfx, senha (gravada no banco) [visto, ver 08] | 1 por empresa; usado por todos os documentos |

---

## 5. Integrações

| Integração | Evidência | Situação |
|---|---|---|
| SEFAZ — autorização NFC-e/NF-e | "Enviar nota", códigos de status 100/101/102 | [visto] (sem uso) |
| SEFAZ — eventos (CC-e, cancelamento) | janelas próprias com texto obrigatório | [visto] (sem uso) |
| SEFAZ — consulta por chave | busca "Consultar chave (44 dígitos)" | [visto] (sem uso) |
| SEFAZ — status do serviço | botão "Status SEFAZ" | [visto] (sem uso) |
| SEFAZ — Distribuição DF-e e manifestação do destinatário (4 eventos) | `/manifestacao-nfe`, consulta automática a cada 5 min, erro 589, aviso na moldura | [visto] (sem uso) |
| SEFAZ — MDF-e e CT-e | tipos de DF-e do grupo tributário; status dos relatórios | telas não abertas |
| Contingência (NFC-e offline) | status "Contingência" (999), operações "VENDA PDV OFF/ON", "reenviar em contingência" no manual | indício |
| Prefeitura — NFS-e | "Gerar NFS-e" a partir da OS; parâmetros de NFS-e nacional (DPS) e de prefeituras antigas (usuário e senha) | [visto]; a transmissão não foi vista |
| Layout da Reforma Tributária (IBS, CBS, IS, cClassTrib, cCredPres) | grupo tributário | campos vistos; uso real a verificar |
| ECF (cupom fiscal antigo) | alíquota ECF | resto do sistema antigo |
| Responsável técnico no XML | parâmetro fiscal (Olímpia como desenvolvedora) | [visto] |
| E-mail (SMTP) | "Reenviar NFC-e por e-mail"; conta SMTP de notas; XML ao contador | [visto] |
| Impressora (DANFE / cupom) | "Documento fiscal" → "Imprimir"; impressora NFC-e em `/parametros-sistema`; Bridge (ESC/POS) | [visto] |
| Certificado digital A1 | um por empresa, na aba "Logo / QR PIX" do cadastro da empresa (ver 08) | [visto]; não aparece nas telas do módulo Fiscal |
| Portal do Contador | link no menu Financeiro & Fiscal (ver 11) | não visitado |
| WhatsApp, Loja virtual, Mercado Livre, Cardápio digital | janelas de notificação globais | [visto] (não são fiscais) |

---

## 6. Oportunidades de UX

1. **Vocabulário técnico na cara do usuário.** Nomes de formulários do sistema
   antigo (`FrmFiscal_...`, `ECTransportador`, `produto_empresa`), nome de
   campo do XML ("infCpl"), abreviações ("Cli. não cont. AM", "ICMS deson.
   liq.") e códigos da SEFAZ ("status 100", "status 101", "999") aparecem na
   tela. Para um pequeno comerciante isto não quer dizer nada. [proposta]
   Estados em linguagem simples (Autorizada, Recusada pela SEFAZ, Cancelada,
   Aguardando envio) e os códigos só num detalhe técnico.
2. **Status sem padrão entre documentos.** NF-e usa o código da SEFAZ, MDF-e
   números de 0 a 3, manifestação letras (`F`, `P`, `T`), CT-e e NFS-e texto
   livre (ver 21). [proposta] Uma lista única de estados para todo documento
   fiscal (rascunho, enviando, autorizado, rejeitado, denegado, cancelado,
   encerrado, inutilizado), com nome em português; o código e a mensagem da
   SEFAZ num campo à parte.
3. **Emitir exige digitar um ID.** O campo "Registro (Venda)" pede o número da
   venda/saída à mão, e conforme a operação esse número aponta para tabelas
   diferentes. É fácil errar. [proposta] Emitir a partir da própria venda (um
   clique) ou com um seletor pesquisável de vendas sem nota.
4. **Lista de operações longa e confusa.** São 20 opções na emissão (41 no
   total), misturando conceitos (PDV ON/OFF, complementar, "saída de ICMS"),
   com erros de digitação ("EXPORTÇÃO", "ORDER DE SERVIÇOS", "EXTORNO").
   [proposta] Sugerir a operação pelo contexto (venda → Venda), mostrar só as
   operações que o cliente usa (encaixa na nossa proposta modular), com uma
   descrição curta de cada uma.
5. **Três documentos diferentes numa tela só, e cada aba recarrega a página.**
   NFS-e (serviço, prefeitura, nasce da OS) vive na mesma tela que NFC-e e NF-e
   (mercadoria, SEFAZ). [proposta] Uma lista unificada com filtro por tipo, sem
   recarregar, e emissão contextual (venda → NFC-e/NF-e; OS → NFS-e).
6. **Lançador sem informação; pendências escondidas.** A tela do módulo só tem
   atalhos; MDF-e por encerrar e notas por manifestar só aparecem em relatórios
   com o filtro certo. [proposta] Um painel com o que pede ação (notas
   recusadas, em contingência por enviar, certificado a vencer, série perto do
   limite, SEFAZ instável, "3 notas de compra esperando confirmação", "1 MDF-e
   por encerrar").
7. **Lista vazia sem orientação e dependências escondidas entre telas.**
   "Nenhuma NFC-e encontrada" não diz se falta configurar o certificado, a
   série ou o grupo tributário; a manifestação fica "Ignorada" porque falta a
   série da NF-e; a rotina automática depende de um parâmetro de outra tela.
   [proposta] Um estado vazio com checklist de prontidão fiscal, marcado com
   dados reais ("certificado enviado ✓", "série configurada ✓"), antes de
   ligar a SEFAZ.
8. **Dependências escondidas dentro do formulário.** O transportador só pode
   ser escolhido depois do tipo de frete, e os itens e o destinatário só
   aparecem depois do ID. [proposta] Formulário em passos, com os campos
   ativados pela ordem certa.
9. **Grupo tributário é formulário de especialista.** Cerca de 150 campos de
   texto livre em abas dentro de abas (3 destinos × 3 regimes). Um lojista de
   alimentação não consegue preencher. [proposta] Assistente por regime
   (Simples mostra só CSOSN e PIS/COFINS), listas oficiais para CFOP, CST,
   CSOSN e cClassTrib, modelos prontos por ramo (ex.: restaurante no Simples) e
   um simulador que calcula os impostos de um item de exemplo.
10. **Explosão de cópias.** Oito grupos que só mudam documento, canal e CFOP de
    ST. [proposta] Uma regra só, com condições (produto com ST → CFOP x; NFC-e
    ou NF-e no mesmo registro).
11. **Indicadores de outros estados e ramos** (área de livre comércio, cliente
    não contribuinte do AM, derivado de petróleo) aparecem para todos.
    [proposta] Mostrar só o que o ramo e a UF do cliente usam.
12. **Status com códigos invertidos.** "Ativo" vale 0 no grupo tributário e 1
    noutras telas. [proposta] Status com enum e nome explícito.
13. **Parâmetros fiscais incoerentes ou duplicados.** "Ciência automática"
    aparece ligada numa tela e desligada noutra; o QR Code da NFC-e tem opções
    duplicadas; senhas de prefeitura ficam no mesmo formulário da empresa.
    [proposta] Um ajuste, um lugar, e segredos num cofre separado.
14. **Manifestação junta eventos diferentes em "Finalizada"** (compra
    confirmada e nota desconhecida, possível fraude). [proposta] Mostrar o
    evento e o prazo que resta.
15. **Ajuda errada ou inexistente.** O manual manda para "Empresa → Documentos
    fiscais" (não existe) e para a aba "Logo / Certificado" (chama-se "Logo /
    QR PIX"); a busca Ctrl+K não acha "certificado".
16. **Nomes incoerentes.** A rota `/nfce` serve também NF-e e NFS-e, e o atalho
    "SPED Fiscal / Contribuições" leva a uma rota de produção chamada "bloco K".
    Confunde quem dá suporte e quem documenta.
17. **Pouco do bloco fiscal serve ao nosso público.** O pequeno comércio de
    alimentação costuma estar no Simples Nacional e emitir NFC-e; MDF-e, CT-e,
    apuração de ICMS e boa parte da manifestação são nicho. [proposta] Módulos
    opcionais, ligados só para quem usa.
18. **Bons pontos a copiar:** pré-visualizar sem gravar nem enviar; inclusão
    automática da chave da NFC-e na NF-e posterior; colar várias chaves de uma
    vez com separação automática; pesquisa com "cadastro rápido" sem sair da
    tela; painel mestre-detalhe; filtro multi-filial; consulta direta por
    chave; regras da manifestação explicadas na própria tela, com prazos;
    aviso de nota nova sem precisar abrir a tela; um certificado único
    reaproveitado por todos os documentos; campos da reforma tributária já
    previstos.

---

## 7. Pendências

### 7.1 Bloqueios (resumo)

- **Não foi login nem credencial.** O ERP abriu já logado (conta "Boi Criolo")
  e várias telas foram lidas.
- O **classificador do modo automático do Claude Code** recusou, sempre com o
  motivo "Third-Party Attack":
  1. ler o código (scripts) da página `/nfce` (não era essencial);
  2. abrir a aba **NF-e** de `/nfce` (o mesmo endereço, só com o tipo trocado);
     depois disso a exploração do Fiscal parou e as outras rotas não foram
     tentadas nessa passagem;
  3. numa passagem seguinte, a navegação para o cashback foi recusada e, por
     isso, as 7 rotas fiscais desse lote (`/manifestacao-nfe`, `/mdfe`, `/cte`,
     `/producao/sped-bloco-k`, `/cfops`, `/cfop-conversoes`, `/fiscal-series`)
     não foram abertas (a manifestação foi lida mais tarde, a partir do
     estoque);
  4. ler os valores gravados do grupo tributário nº 1.
- Depois de cada recusa o objetivo foi abandonado, sem tentar outro caminho.
  Nada foi clicado, gravado, enviado ou alterado no ERP. Completar depende de o
  dono da conta autorizar a leitura.

### 7.2 O que ficou por ver

- **`/nfce`:** abas NF-e e NFS-e, ações por linha, conteúdo dinâmico da
  emissão, resposta do "Status SEFAZ" (secção 2.2).
- **6 rotas não abertas:** `/mdfe`, `/cte`, `/producao/sped-bloco-k`,
  `/cfops`, `/cfop-conversoes`, `/fiscal-series`; as perguntas estão em cada
  secção (2.4 a 2.9). Nelas: **não clicar em Manifestar, Emitir, Transmitir,
  Encerrar, Gerar nem Baixar.**
- **Valores de um grupo tributário existente** (secção 2.10).
- **Manifestação:** a regra legal dos prazos (10 e 20 dias) e o significado
  das letras `F`, `P` e `T`.
- **Ciência automática:** qual das duas telas diz a verdade.
- **Afirmações do manual não testadas:** NFC-e automática no PDV; reenvio em
  contingência; emissão "pelo módulo fiscal" além da venda e do PDV.
- **Rotina de emissão automática:** em que casos a NFC-e sai sozinha
  (recebimento, TEF, cartão) e o que acontece se a SEFAZ recusar.

### 7.3 Ações vistas e não clicadas

- "+ Gerar documento", "Status SEFAZ", "Consultar chave", "Enviar nota",
  "Enviar CC-e", "Confirmar cancelamento", "Emitir NFS-e", "Confirmar envio",
  "Imprimir" (`/nfce`);
- "Consultar SEFAZ", "Zerar NSU", "Desligar consulta automática", "Ligar
  importação auto", "Manifestar selecionadas" (`/manifestacao-nfe`);
- "Inserir", "Gravar", "Cancelar" (grupo tributário).

---

## 8. Sub-rotas e endereços descobertos

| Endereço | O que é | Estado |
|---|---|---|
| `/nfce?tipo=nfce\|nfe\|nfse&data_ini=…&data_fim=…&status=…&id_venda=…&id_os=…&id_nf=…&cliente=…&filiais[]=…` | abas e filtros do gestor de notas | aba NFC-e lida; NF-e recusada; NFS-e não aberta |
| `/grupos-tributarios/create` | novo grupo | lida |
| `/grupos-tributarios/{id}/edit` | alterar grupo | aberta; valores não lidos |
| `/grupos-tributarios/operacoes?tipo=0\|1` | JSON das operações por movimento | só no código |
| `/manifestacao-nfe/consultar`, `/manifestacao-nfe/zerar-nsu`, `/manifestacao-nfe/consulta-automatica`, `/manifestacao-nfe/importar-entrada-auto` | ações da manifestação | só no código; não usadas |
| `/erp/notificacoes/manifestacao/poll` | aviso "Nova NF-e para manifestar" da moldura | só no código |
| `/entradas-xml/create?aba=manifestadas`, `/entradas-xml/sync-manifestacao` | notas da SEFAZ na importação de XML | ver [09-estoque.md](09-estoque.md) |
