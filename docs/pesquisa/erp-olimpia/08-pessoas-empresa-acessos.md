# 08 — Pessoas, empresa, acessos e cadastros gerais (ERP Olímpia)

> Módulo Cadastros: pessoas (clientes, colaboradores, fornecedores...), consulta
> do cliente, cargos, carga horária, formas de pagamento, usuários e grupos de
> permissão, empresa/filiais (com os ~420 parâmetros), plano de contas,
> municípios, zonas, bairros, veículos, rotas e o checklist de migração.
> Exploração de 2026-10-03, conta de teste "Boi Criolo" (plano Full), perfil
> ADMIN. Parte das telas abriu e foi lida; outra parte foi recusada (ver 1.6).
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual],
> [código] (lido no HTML/JS da página), [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

### 1.1 Onde fica no menu

- O menu lateral tem **27 módulos em 7 secções**; **Cadastros** fica na secção
  "Operações" (com Sinuca, Estoque, Produção e Compras) e tem **29 itens**
  [visto]. O manual não tem cartão para Cadastros (ver [22-manual.md](22-manual.md)).
- A barra lateral tem "Atalhos rápidos" (Operação do dia, **Cadastros
  frequentes**, Canais digitais, **Pessoas**) [visto]. "Cadastros frequentes"
  traz Produtos, Clientes (`/pessoas?tipo=cliente`) e Consulta Cliente
  (`/consulta-cliente`).
- A carga horária aparece também no menu do Ponto ("Pessoas & RH" → Ponto →
  "Cadastros & App" → Carga Horária), fora do prefixo `/ponto` (ver
  [15-ponto.md](15-ponto.md)).
- `/financeiro/integracao-bancaria` redireciona para `/empresa/1#tab-integracao`,
  a aba Integração Bancária do cadastro da empresa nº 1 (ver
  [11-financeiro-bancos.md](11-financeiro-bancos.md)).
- O hub `/dashboard/modulo/cadastros` não abriu (ver 2.1).

### 1.2 Cadastros-base ("Empresa & Rotas") [visto]

- **Empresa/filiais:** várias empresas (matriz e filiais) no mesmo ambiente.
  **Clientes e produtos são compartilhados** entre as filiais; **financeiro e
  vendas filtram pela empresa ativa**, escolhida no topo da tela. No código da
  moldura há um seletor de empresa que troca a empresa da sessão [código]. O
  login pede empresa, usuário e senha, e a filial se escolhe no topo [afirmado
  pelo manual; o login do PWA do garçom confirma a lista de empresas antes de
  usuário e senha].
- **Plano de contas:** árvore com código automático em blocos de 3 dígitos e uma
  tela de lançamentos (crédito ou débito) por conta.
- **Municípios:** tabela com código IBGE, país e UF, usada nos lookups de
  empresa, pessoas e veículos.
- **Zonas, bairros e rotas:** base de entrega e de visitas. O bairro tem tarifa e
  zona. A rota tem zona, região (texto livre) e valor.
- **Veículos:** cadastro pensado para o MDF-e (tipo rodoviário, carroceria,
  carreta, proprietário com RNTRC).
- **Checklist de cadastros:** painel interno da migração do sistema antigo
  (Delphi) para a web, com o mapa dos 26 cadastros e as rotas de cada um.
- "Empresa" é o centro de configuração do sistema inteiro: além do cadastro da
  filial, ali ficam o certificado digital, as integrações com bancos (boleto e
  PIX) e cerca de **420 parâmetros** que ligam e desligam regras de vendas,
  caixa, PDV, fiscal, estoque, OS e outros módulos.

### 1.3 Pessoa: cadastro único com papéis [visto]

- Os tipos de pessoa são **Cliente, Colaborador, Fornecedor, Transportador e
  Produtor rural**, e uma pessoa pode ter vários. Não há cadastro separado de
  vendedor nem de técnico: são pessoas com o papel de colaborador.
- O **registro 1 é o padrão "CONSUMIDOR FINAL"** (sem documento). É a única
  pessoa da conta de teste.
- A pessoa é a mesma em todo o ERP: o "ID pessoa" (`id_pessoa`) é o código usado
  no ponto (espelho, auditoria, login do app), na folha e nos seletores de
  colaborador (ver [15-ponto.md](15-ponto.md) e
  [16-folha-colaborador.md](16-folha-colaborador.md)).
- As lupas usam tipos diferentes conforme o papel [código]: `pessoa` (genérica),
  `pessoa_cliente` (telas operacionais como Boletos e Consulta Cliente),
  `pessoa_colaborador` ("Colaborador / Vendedor") e `usuario` ("Operador"). Nos
  relatórios, o filtro "Cliente" usa a pessoa genérica, e por isso aceita uma
  pessoa que não é cliente.

### 1.4 Acessos: modelo de permissão duplo [visto no checklist; deduzido]

- O checklist diz, sobre Usuários: "permissões operacionais no usuário; acesso às
  telas pelo grupo". Ou seja: as **telas** são liberadas pelo grupo de permissão,
  e as **ações operacionais** pelo usuário.
- O menu do usuário (topo) mostra usuário, colaborador, grupo, empresa e Sair
  [visto]: o usuário liga-se a um colaborador e a um grupo.
- Senhas operacionais também existem como **parâmetros da empresa** (sangria,
  cancelar item, cancelar venda, saída de estoque) e como "senha de liberação"
  do usuário supervisor (ver 2.8).

### 1.5 Padrões de interface vistos de passagem [visto]

Os padrões comuns de lista (filtros, "Alterar", barra "Dados complementares",
"Equivalente a FrmXxx"), de formulário, de documento com itens, as maiúsculas
automáticas, o cabeçalho e os avisos globais estão em
[22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas); a lupa (modal "Pesquisar — X", cadastro rápido,
endpoints `/lookups/{tipo}/...`) em
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md#15-janela-de-pesquisa-lupa-e-a-api-por-trás-dela). Próprio destes cadastros:

- **Código de "Ativo" invertido entre telas** [visto]: vale 0 no grupo
  tributário e 1 na carga horária e em pessoas.

### 1.6 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/cadastros` | Hub de Cadastros | recusada (navegação negada) |
| `/pessoas` | Pessoas (lista) | não aberta |
| `/pessoas/create` | Nova pessoa | parcial (tipos e aba Colaborador lidos, sem salvar) |
| `/pessoas?tipo=colaborador` | Colaboradores | parcial (só a contagem: 0) |
| `/pessoas?tipo=cliente` | Clientes | não aberta |
| `/pessoas/{id}/edit` | Alterar pessoa | não aberta (link visto) |
| `/consulta-cliente` | Consulta Cliente | lida |
| `/consulta-cliente/{id}` | Painel do cliente | lida (cliente 1) |
| `/colaborador-cargos` | Cargos | não aberta |
| `/carga-horarias` | Carga horária | lida |
| `/carga-horarias/create` | Nova carga horária | lida (modelo testado na tela, sem salvar) |
| `/forma-pagamentos` | Formas de pagamento | não aberta |
| `/usuarios` | Usuários | não aberta |
| `/usuario-grupos` | Grupos de permissão | não aberta |
| `/empresa` | Empresas / Filiais | lida |
| `/empresa/nova` | Nova filial | lida |
| `/empresa/{id}` | Cadastro da empresa (4 abas) | lida (`/empresa/1`) |
| `/plano-contas` | Plano de contas | lida |
| `/plano-contas/create` | Nova conta | lida (`?placement=raiz`) |
| `/plano-contas/apuracao` | Consultar / Lançar | lida (com o modal de lançamento) |
| `/plano-contas/apuracao/imprimir` | Impressão da apuração | não aberta |
| `/municipios` | Municípios | lida (lista, novo, edição) |
| `/zonas` | Zonas | lida (lista, novo) |
| `/bairros` | Bairros | lida (lista, novo, lookup de zona) |
| `/veiculos` | Veículos | lida (lista, novo com 3 abas) |
| `/rotas` | Rotas | lida (lista, novo) |
| `/cadastros/checklist` | Checklist da migração | lida |

## 2. Telas

### 2.1 `/dashboard/modulo/cadastros` — Hub de Cadastros [recusada]

- **Já se sabe:** os módulos do ERP têm uma página de entrada em
  `/dashboard/modulo/<nome>`, com cartões de atalho agrupados e sem indicadores
  (Fiscal em [13-fiscal.md](13-fiscal.md), Parâmetros em
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)), cada
  cartão com "Adicionar aos atalhos". Cadastros deve seguir o mesmo padrão
  [deduzido]. O menu tem 29 itens em Cadastros; o checklist lista 26 cadastros.
  "Grupos de Produto" está no menu de Cadastros.
- **Perguntas:** quais cartões existem e para que rotas levam (é o mapa do
  módulo; abrir primeiro na próxima passagem).

### 2.2 `/pessoas` — Pessoas [lista não aberta]

- **Já se sabe:**
  - Cadastro único com tipos (ver 1.3). No checklist: "Pessoas" completo, com a
    nota "prévia de documento legado". Os "padrões globais" do checklist citam
    **consulta de CNPJ e CEP em Pessoas**, envio de foto e documentos e
    grades-filhas (documentos...).
  - Lista com o rodapé "Dados complementares" [visto em parte].
  - **Campos do cliente** revelados pelos campos obrigatórios configuráveis (ver
    [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)):
    sempre obrigatórios Nome / Razão social e Status; Identificação: CPF/CNPJ (✔
    ligado; necessário para NF-e/NFC-e identificada), RG / Inscrição estadual,
    Apelido / Fantasia; Contato: Telefone, E-mail; Endereço: CEP ✔, Endereço ✔,
    Número ✔, Complemento, Bairro ✔, Município ✔ (código IBGE); Comercial:
    Vendedor padrão, Rota. A escolha vale também para o cadastro rápido feito
    durante a venda.
  - O cliente tem telefone, bairro e rota (`id_rota`) (ver
    [14-os-forca-vendas.md](14-os-forca-vendas.md)); na OS, cliente é obrigatório.
  - **Produtor rural** [visto no registro de mudanças, ver 18]: se o cliente for
    produtor rural, a NF-e vai com ele como não contribuinte e consumidor final,
    mantendo a inscrição estadual; vale nas vendas, nas OS e nas entradas e
    saídas manuais.
  - **Parâmetros da empresa ligados à pessoa** (ver 2.12): aviso de pessoa
    duplicada; avisos de aniversário e de clientes sem comprar; dias para
    bloquear cliente; bloquear cliente inadimplente (ligado na conta); listar na
    venda só os clientes do vendedor; vendedor automático a partir do cadastro do
    cliente; limite de compra; no app Força de Vendas, só as formas de pagamento
    do cliente e a tabela de preço do cliente.
  - A pesquisa genérica tem "Cadastrar novo", que abre um cadastro rápido
    ("Salvar e selecionar") sem sair da tela (ver [13-fiscal.md](13-fiscal.md)).
    Nas lupas de pessoa lidas, porém, o botão não apareceu.
- **Perguntas:** validação de CPF e CNPJ; preenchimento automático pela Receita
  e pelo CEP (o checklist diz que existe); contribuinte de ICMS; limite de
  crédito, condição de pagamento e tabela de preço; vários endereços (entrega) e
  contatos; campo de WhatsApp; ligação com cashback e portal do cliente (ver
  [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md));
  consentimento da LGPD.

#### `/pessoas/create` — Nova pessoa [visto em parte]

- Tipos (caixas, vários ao mesmo tempo): Cliente, Colaborador, Fornecedor,
  Transportador, Produtor rural.
- Marcar **Colaborador** abre a aba de mesmo nome, com duas sub-abas:
  - **Geral:** comissão sobre produto, serviço e geral (%); salário; admissão e
    demissão; tipo de contrato (CLT, PJ ou Temporário); horas mensais; cargo e
    carga horária (busca com lupa); CTPS, título de eleitor e PIS; **senha do
    ponto**; CNH (número, categoria, vencimento); anotações.
  - **Financeiro:** limite de convênio ou de compras no PDV (R$). É obrigatório
    quando a forma de pagamento "gera convênio colaborador".
- A senha do ponto é definida pelo gestor no cadastro; com o ID da pessoa, é o
  login do app do colaborador (PWA do ponto) (ver [15-ponto.md](15-ponto.md)). O
  portal do colaborador aceita CPF ou ID colaborador (ver
  [16-folha-colaborador.md](16-folha-colaborador.md)).
- A folha trata o colaborador como pessoa com situação ativo, afastado ou
  demitido; a rescisão aplicada tira o colaborador dos ativos (ver 16).
- Os campos foram preenchidos só na tela para ver o comportamento; nada foi
  salvo.

#### `/pessoas?tipo=colaborador` [visto em parte]

- A conta tem **0 colaboradores**. A lupa "Colaborador / Vendedor" também volta
  vazia.

### 2.3 `/pessoas?tipo=cliente` — Clientes [não aberta]

- **Já se sabe:** é o atalho "Clientes" da barra lateral. Sugere a tabela única
  de pessoas filtrada por tipo.
- **Perguntas:** colunas e filtros próprios do cliente; em que difere de
  `/crm/clientes` (segmentos, etiquetas, estágio de funil, último pedido, total
  gasto; ver [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md)).

### 2.4 `/consulta-cliente` — Consulta Cliente [visto]

- Atalho fixo na barra lateral e em "Cadastros frequentes".
- A tela de busca é um formulário GET com a lupa `pessoa_cliente` e o botão
  "Analisar".
- **Responde à dúvida antiga:** não é consulta de crédito externa (SPC/Serasa);
  é uma ficha 360° do cliente dentro do ERP.

#### `/consulta-cliente/{id}` — Painel do cliente [visto]

Visto com o cliente padrão "CONSUMIDOR FINAL" (cód. 1); tudo estava vazio.

- **Cabeçalho:** cidade e UF, selo "Ativo" e atalhos:
  - Cadastro (`/pessoas/1/edit`);
  - Receber (`/financeiro/recebimento?filtro=cliente&consulta=1`);
  - Títulos (`/financeiro/receber?id_cliente=1`);
  - Vendas (`/vendas?id_cliente=1`).
- **Score de pagamento** (50, "sem histórico").
- **Indicadores:** Em aberto, Vencido, **Crédito**, Total comprado, Ticket médio
  (12 meses), Última compra, Frequência, Total pago e Cliente desde.
- **Gráficos:** vendas mensais de 12 meses, histórico de pagamentos, média de
  atraso de 6 meses e produtos mais comprados.
- **Abas:**
  - Vendas (#, Data, Vendedor, Forma pag., Valor);
  - A receber (#, Venc., Parc., Valor);
  - Pagos (#, Venc., Pago em, Valor);
  - **Créditos** (Data, Descrição, Crédito, Débito).
- **Linha do tempo.**
- O crédito do cliente entra por troca, devolução ou acerto e é usado numa venda
  como forma de pagamento [deduzido]; o relatório "Créditos de cliente" está em
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).
- **Perguntas:** como o score é calculado; se mostra limite usado e disponível;
  se bloqueia a venda.

### 2.5 `/colaborador-cargos` — Cargos [não aberta]

- **Já se sabe:** o cargo é escolhido por lupa na aba Colaborador da pessoa. A
  folha tem departamentos e centros de custo **sem cargos** (ver
  [16-folha-colaborador.md](16-folha-colaborador.md)). O colaborador recebe
  comissão (ver [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md)),
  mas o percentual fica na própria pessoa (comissão sobre produto, serviço e
  geral) e no grupo de produto.
- **Perguntas:** campos (nome do cargo, código CBO, salário base, comissão
  padrão)? Um cargo para vários colaboradores? Liga com folha e ponto?

### 2.6 `/carga-horarias` — Carga horária [visto]

- **Subtítulo:** jornada semanal dos colaboradores, seguida do nome de formulário
  legado (`FrmPessoa_Colaborador_Carga_horaria`).
- **Inserir** → `/carga-horarias/create`.
- **Filtro:** campo (Descrição ou Código), status (Ativo, Inativo, Todos) e
  Pesquisar.
- **Colunas:** ID, Descrição, Hrs/sem, Noturno, Status e Ações. Vazia. Tem o
  rodapé "Dados complementares".
- Atalho também no painel do Ponto (ver [15-ponto.md](15-ponto.md)).

#### `/carga-horarias/create` — Nova carga horária [visto]

| Campo | Tipo | Obrig. | Observação |
|---|---|---|---|
| Descrição | texto | sim | ex.: "COMERCIAL PADRÃO" |
| Status | lista | — | Ativo, Inativo |
| Hrs semanais | texto | — | "Auto": calculado ao preencher a grade; parece continuar editável (a verificar) |
| Adicional noturno | caixa | — | marca a jornada como noturna |
| Grade semanal | 7 linhas (segunda a domingo) × 4 horários | — | Entrada, Saída almoço, Retorno almoço, Saída. O total do dia é calculado, e o dia vazio aparece como "Folga" |

- **Modelos rápidos:** Comercial padrão (segunda a sexta, 08–12 e 14–18, mais
  sábado 08–12); Seg–Sex sem sábado; Sábado meio período; Copiar segunda → terça
  a sexta. Há também o botão Limpar horários.
- **Teste sem salvar:** "Comercial padrão" preencheu 8 h por dia útil e 4 h no
  sábado, num total de **44,00 h/semana**, e pôs 44.00 em "Hrs semanais". Depois
  a grade foi limpa e a tela fechada sem gravar.
- **Modelo de jornada:** uma **semana fixa com um intervalo**. Não há escala
  12x36, revezamento, jornada flexível, tolerância, banco de horas nem intervalo
  pré-assinalado. Essas regras (tolerância, noturno, banco) ficam na
  configuração do ponto (ver 15).

### 2.7 `/forma-pagamentos` — Formas de pagamento [não aberta]

- **Já se sabe:**
  - No checklist: "Formas de Pagamento" completo.
  - A OS exige uma forma de pagamento, escolhida por lupa; a forma tem código e
    nome (ver [14-os-forca-vendas.md](14-os-forca-vendas.md)).
  - A forma pode ter a marcação "**gera convênio colaborador**" (exige limite de
    convênio na pessoa; ver 2.2).
  - **Gerar QRCode PIX:** o texto da aba Integração Bancária manda marcar "Gerar
    QRCode PIX" **na forma de pagamento** desejada para o PIX em produção [visto];
    o manual manda marcar no **"Tipo de Recebimento"** [afirmado pelo manual]. Há
    também a tela `/financeiro/tipo-recebimentos` (ver
    [11-financeiro-bancos.md](11-financeiro-bancos.md)). A diferença entre "forma
    de pagamento" e "tipo de recebimento" está **a confirmar**.
  - Parâmetros da empresa que usam a forma de pagamento: forma de pagamento
    padrão do PDV (lookup); preços e juros por forma de pagamento; comissão por
    forma de pagamento (e base da comissão por recebimento); fechamento cego por
    forma de pagamento, com opções para não totalizar PIX, crédito, débito e
    crédito loja/convênio; no app Força de Vendas, só as formas de pagamento do
    cliente (o cliente tem formas de pagamento ligadas [deduzido]).
  - Aparece também: na aba Vendas da Consulta Cliente (coluna "Forma pag."), nos
    itens do romaneio, na configuração da integração do Mercado Livre e numa
    regra do faturamento em lote ("exigir forma de pagamento").
- **Perguntas:**
  - Tipo: dinheiro, PIX, cartão de crédito, cartão de débito, boleto, crediário,
    cheque, vale?
  - Código da forma de pagamento na NF-e e na NFC-e (tabela da SEFAZ, ex.: 01
    dinheiro, 03 crédito, 04 débito, 15 boleto, 17 PIX). Conhecimento de
    domínio, não visto no ERP.
  - Parcelas e prazos, taxa da operadora, prazo para o dinheiro cair, conta
    bancária de destino; gera conta a receber? exige cliente identificado?
  - Abre maquininha (TEF) ou QR de PIX? Em que canais aparece? Permite troco?

### 2.8 `/usuarios` — Usuários [não aberta]

- **Já se sabe:**
  - Checklist: "Usuários" completo, com a nota "permissões operacionais no
    usuário; acesso às telas pelo grupo".
  - O menu do topo mostra o perfil "ADMIN" e, no menu do usuário: usuário,
    colaborador, grupo, empresa, Sair.
  - O usuário tem ID, nome e login (ex.: "ADMIN"); faz aceites, alterações e
    cancelamentos (registros de log; ver 18).
  - A lupa `usuario` abre "Pesquisar — Operador", com as colunas Código e
    Operador; a conta tem 1 registro.
  - **Senha de liberação:** a janela "Liberação de supervisor" pede Usuário (lista;
    só "ADMIN") e "Senha de liberação"; há também a liberação remota (ver
    [02-vendas-pdv.md](02-vendas-pdv.md)). [deduzido] O usuário tem senha de
    liberação e uma permissão de gestor.
  - O usuário do ERP entra também no PWA do garçom (empresa, usuário, senha) (ver
    [04-cardapio-comanda-cozinha.md](04-cardapio-comanda-cozinha.md)). O app do
    técnico (ver 14), o ponto (ID da pessoa + senha do ponto) e o portal do
    colaborador têm login próprio.
  - A força de vendas libera aparelhos, com limite pelo plano (ver 14).
  - O romaneio guarda usuário de abertura e de fechamento; o Bridge envia o
    cabeçalho `X-Bridge-Usuario` (ver 17).
- **Perguntas:** campos (nome, login ou e-mail, grupo, filiais permitidas,
  ligação com colaborador ou vendedor, caixa padrão, desconto máximo, ativo);
  o plano limita o número de usuários? troca de senha, verificação em duas
  etapas, horário de acesso, registro de acessos? se a senha de liberação é
  diferente da senha de login.

### 2.9 `/usuario-grupos` — Grupos de permissão [não aberta]

- **Já se sabe:** no checklist chama-se "Grupos de Permissão" (completo). O acesso
  às telas é dado pelo grupo (ver 1.4).
- **Perguntas:** permissões por tela ou por ação (ver, criar, editar, excluir)?
  Permissões especiais (desconto, cancelar venda, sangria, liberar crédito) e
  ligação com `/financeiro/liberacoes` (ver 02)? Um usuário pode estar em mais de
  um grupo? O que um operador comum vê e que ações pedem senha (tudo foi visto
  como ADMIN)?

### 2.10 `/empresa` — Empresas / Filiais [visto]

- **Objetivo:** listar as empresas do ambiente (matriz e filiais).
- **Texto de apoio:** clientes e produtos são compartilhados; financeiro e vendas
  filtram pela empresa ativa no topo.
- **Ações:** "Nova filial" (`/empresa/nova`); "Alterar" em cada linha
  (`/empresa/{id}`). **Não há botão de excluir.**
- **Filtro:** um só campo, "Razão, fantasia ou CNPJ", e o botão Pesquisar.
- **Colunas:** ID, Fantasia, Razão social, CNPJ, Município, Tipo (selo "Matriz"),
  Ações.
- **Barra "Dados complementares":** fantasia, razão, CNPJ, município, tipo e
  **"Ativa na sessão: Sim/Não"**, com o link Alterar.
- **Dados da conta:** 1 empresa (ID 1, Boi Criolo, Matriz, Porto Velho/RO), com o
  código "001" (o login mostra "001 - BOI CRIOLO") e o slug público `boi-criolo`,
  que forma os endereços dos PWAs e da loja (`/{app}/v/{slug}/...`).

### 2.11 `/empresa/nova` — Nova filial [visto]

**Passo 1: consulta do CNPJ**

- Campo "CNPJ da filial" com máscara. A consulta dispara sozinha com os 14
  dígitos, com Enter ou com o botão "Buscar".
- [código] A consulta vai a um endpoint do próprio ERP
  (`/empresa/consulta/cnpj/{cnpj}`) e preenche: razão social, fantasia, CNPJ,
  telefone, e-mail, CEP, endereço, número, bairro, CNAE, município e inscrição
  estadual. A mensagem de sucesso diz que os dados vieram da Receita Federal.
- **Várias inscrições estaduais:** abre um modal para escolher uma; cada opção
  mostra a IE, a UF e se está ativa.
- Erros previstos: CNPJ com menos de 14 dígitos, CNPJ não encontrado, falha na
  consulta.
- Link "Preencher manualmente sem consultar CNPJ" (clicado: só mostra o
  formulário) e botão "Outro CNPJ" (limpa tudo e volta ao passo 1).

**Passo 2: formulário**

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Razão social | texto | **sim** (único obrigatório) | — |
| Nome fantasia | texto | não | — |
| CNPJ | texto | **não** | sem validação visível no formulário |
| Insc. Estadual | texto | não | — |
| Insc. Municipal | texto | não | — |
| Telefone | texto | não | — |
| WhatsApp | texto | não | — |
| E-mail | e-mail | não | — |
| CEP | texto | não | — |
| Endereço | texto | não | — |
| Número | texto | não | — |
| Bairro | texto | não | texto livre, não usa o cadastro de bairros |
| Município | lookup (lupa) | não | modal "Pesquisar — Município" |
| CNAE | texto | não | — |
| Gerente | texto | não | — |
| Site | texto | não | — |
| Usa grade (tamanho/cor) | caixa (Sim/Não) | não | padrão: Não |
| Observações | texto longo | não | — |

- Botões "Salvar filial" (não clicado) e "Cancelar".
- **Lookup de município:** colunas Código, Descrição, IBGE e UF; 5.426 registros,
  15 por página.

### 2.12 `/empresa/{id}` — Cadastro da empresa [visto]

Cabeçalho "Empresa #1", com a nota "equivalente a FrmEmpresa", o selo "Matriz" e
o link "Todas as filiais". Quatro abas: **Cadastro**, **Logo / QR PIX**,
**Integração Bancária** e **Parâmetros**.

[visto na estrutura] Há dois formulários: o principal (envio com arquivos, botão
"Salvar") e outro só para a Integração Bancária (botão "Salvar integração
bancária"). [deduzido] O "Salvar" principal grava juntos Cadastro, Logo e
Parâmetros. Os Parâmetros do Sistema têm um atalho "Empresa (CRT / tributos)" que
leva a `/empresa/1` (ver 18).

#### Aba Cadastro

Os mesmos campos da nova filial, mais dois:

- **Ramo — Categoria:** Comércio, Serviços, Saúde, Educação, Agronegócio,
  Construção Civil.
- **Ramo — Subcategoria** (depende da categoria) [código]:
  - Comércio: Supermercado, Farmácia, Açougue, Casa de Carnes, Mercado, Loja de
    Roupas, Material de Construção, Auto Peças, Revenda/Compra e Venda de
    Veículos, Outros.
  - Serviços: Oficina Mecânica, Restaurante, Contabilidade, Lavanderia, Outros.
  - Saúde: Clínica Médica, Odontologia, Farmácia de Manipulação, Outros.
  - Educação: Escola, Curso Livre, Outros.
  - Agronegócio: Fazenda, Cooperativa, Outros.
  - Construção Civil: Construtora, Empreiteira, Outros.
- Nada na tela indica se o ramo muda menus, parâmetros-padrão ou relatórios (a
  verificar).

#### Aba Logo / QR PIX

O manual e o texto de ajuda da aba Integração Bancária chamam esta aba de "Logo /
Certificado", nome que não existe na tela.

| Bloco | Campos | O que a tela explica |
| --- | --- | --- |
| Logo da empresa | arquivo de imagem | guardada no banco, como binário |
| QR Code PIX | imagem do QR estático + "Chave PIX" (CPF, CNPJ, e-mail, telefone ou chave aleatória) | os dois saem na impressão da venda |
| Certificado digital A1 | arquivo .pfx + senha | certificado **único da empresa**, usado em NF-e, NFC-e, MDF-e, CT-e, NFS-e e nos gateways bancários; a senha fica gravada no banco |

- [código] Existe uma ação "Baixar certificado A1", que pede a senha do .pfx antes
  de liberar o download.
- Os textos de ajuda mostram nomes internos de tabela e coluna e revelam que o
  banco é PostgreSQL (tipo `bytea`).
- O conteúdo dos campos de senha não foi lido.

#### Aba Integração Bancária

É a mesma tela de `/financeiro/integracao-bancaria` (que redireciona para
`/empresa/1#tab-integracao`): descrita em
[11-financeiro-bancos.md](11-financeiro-bancos.md).

#### Aba Parâmetros (cerca de 420 opções)

Instrução no topo: marcado = Sim, desmarcado = Não. Os grupos ficam em botões tipo
"pílula", e cada opção é um cartão com caixa de seleção. Muitas opções têm como
rótulo **o nome cru da coluna** do banco (por exemplo, "Venda bloq frete",
"Caixa permirtiracresimo"). Só algumas têm descrição.

| Grupo | Nº de campos | O que controla (principais) |
| --- | --- | --- |
| Comissões por metas | 2 | ao fechar a meta, lançar o prêmio na folha (provento) e/ou gerar um título a pagar por colaborador |
| Vendas | 62 | baixa de estoque, comissão, impressão, bloqueios, preços (detalhe abaixo) |
| Estoque | 13 | lote/validade, almoxarifado, prateleira, entrada atualiza custo, produção, transferência online, senha para saída |
| Caixa / PIX | 27 | caixa cego, caixa central, pré-fechamento, NFC-e no recebimento, recibo, parcelas de cartão/cheque, tarifas POS |
| Financeiro | 23 | juros, multa, tolerância, remessa automática de boleto, controle de cartão, percentuais TEF, cashback, bloqueio de cliente |
| Fiscal / NF-e | 129 | 8 seções: Definições, Serviço (NFS-e nacional), ISS no PDV, Simples Nacional, Acesso prefeitura (legado), Impressão, Manifestação, Outros |
| PDV | 58 | cliente e forma de pagamento padrão, descontos, atalhos de teclado, balança, couvert, taxa de serviço, senhas |
| Força de vendas | 5 | o que vai na "carga geral" do app |
| Ordem de Serviço | 14 | modelo A4, comissão, bloqueios, condutor, foto, petshop |
| E-mails | 30 | 3 contas SMTP (notas, venda, contador), e-mails automáticos, e-mails da gerência |
| Condomínio | 6 | módulo condomínio e percentuais de retenção (INSS, IRPJ, ISS, DARF) |
| Confecção | 16 | etapas (bordado, fábrica, pintura, sublimação) e campos visíveis (gola, manga, punho, ribana...) |
| Tela Pesquisa | 7 | busca por início ou qualquer parte, ordem ID/GTIN, saldo negativo, limite de itens |
| Consulta / Diversos | 11 | avisos (aniversário, clientes sem comprar, vacina petshop, lotes), impressão agrupada de mesas, credenciais do "Olimpia Comanda" |
| Produtos | 4 | saldo editável no cadastro, bloqueio de preço e de alteração |
| Outros | 17 | pessoa duplicada, integrações com cartório, cupom de troca, cashback, liberação online |

**Regras de negócio que os parâmetros revelam** [visto; os rótulos foram
interpretados quando eram nomes de coluna]:

- **Vendas**
  - Momento da baixa de estoque: na finalização da venda ou no balcão de entrega.
  - Tipo de comissão: nenhuma, por produto, por vendedor, por recebimento, por
    forma de pagamento ou por vendedor/produtos. Na comissão por recebimento, a
    base é a forma de pagamento, o vendedor ou o produto.
  - Ordem dos itens na impressão (ID, descrição ou item), separada para
    romaneio/separação, espelho, nota fiscal, orçamento e venda.
  - Desconto máximo (%) e controle de desconto por vendedor/usuário: acima do
    limite, pede liberação com senha.
  - Na venda, listar só os clientes do vendedor; vendedor automático a partir do
    cadastro do cliente.
  - Bloquear alterações sensíveis (reabrir venda finalizada, cancelar
    orçamento...).
  - Bloquear venda com estoque negativo e bloquear cliente inadimplente (este está
    ligado na conta).
  - Preços por forma de pagamento, preços de cartão crédito/débito no produto e
    preços por modalidade da venda (loja, retirada...); tabela de preço;
    atacado/varejo (tipo e valor); juros por forma de pagamento.
  - Impressão: canhoto de assinatura, conferência de mercadoria (conferentes),
    ocultar foto, ocultar dados da empresa.
  - Outros: gamificação, gerar boleto automático, tarifa do entregador, limite de
    compra, comissão da plataforma, percentuais de ICMS/ST.
- **Estoque**
  - Controle de lote/validade.
  - Almoxarifado e "estoque prateleira" (são os locais G/P/R/E; ver
    [09-estoque.md](09-estoque.md)).
  - A entrada atualiza o preço de compra (ligado) e, opcionalmente, o cadastro do
    produto.
  - A entrada pode pedir conta do plano e tipo de documento.
  - A produção lança estoque na entrada (ligado) e pode lançar sobra.
  - Transferir estoque online; alterar o preço de venda na transferência.
  - Senha para saída de estoque.
- **Caixa**
  - Fechamento cego (conferência por forma de pagamento), com opções para não
    totalizar PIX (ligado), crédito, débito e crédito loja/convênio.
  - Caixa central, pré-fechamento, senha no fechamento.
  - Emitir NFC-e no recebimento (ligado).
  - Enviar o fechamento por e-mail.
  - Gerar parcelas de cartão e cheque no caixa.
  - "Controle POS": aplica as tarifas de cartão no PDV.
  - Transferir o saldo do caixa anterior.
- **Financeiro**
  - Juros, multa e dias de tolerância.
  - Gerar remessa de boleto automaticamente (ligado).
  - Número de autorização do cartão (ligado).
  - Percentuais TEF (crédito à vista, crédito parcelado, débito).
  - Cashback (ativo, %, tipo).
  - Dias para bloquear cliente.
  - Ligação banco × caixa com conta do plano e tipo de documento para pagar,
    receber e POS.
- **Fiscal**
  - Regime: 0 Nenhum, 1 Simples, 2 Simples com excesso, 3 Regime normal.
  - Versão da NF-e (4.0 ou 3.10) e do QR Code da NFC-e (100 ou 200; as opções
    aparecem duplicadas).
  - SPED: atividade (industrial ou outros) e perfil A, B ou C.
  - NFS-e no PDV no lugar de NFC-e para serviços.
  - Responsável técnico (grupo do XML com a Olímpia como desenvolvedora).
  - Último e máximo NSU; e-mail de envio dos XML ao contador; transportadora e
    cedente padrão.
  - NFS-e nacional: regime especial (0 a 6), item da lista, código NBS, códigos
    de tributação municipal e nacional, alíquota de ISS, lote, CNAE, data de
    competência.
  - ISS no PDV para **cartório** (assinatura, notas, registro civil, RTD).
  - Simples Nacional: percentuais de aproveitamento de ICMS, PIS e COFINS;
    alíquotas de IRPJ e CSLL.
  - Cerca de 70 opções de impressão do DANFE (NFC-e e NF-e em dobro): preview,
    logo, margens, casas decimais, cópias, impressora, pasta do PDF...
  - Manifestação: ciência automática ao sincronizar (ligada), consulta automática
    DistDFe (ligada), importar XML como entrada automaticamente (desligada; o
    padrão é desligado).
  - Lançar contas a pagar a partir da NF-e de entrada (ligado).
- **PDV**
  - Cliente padrão e forma de pagamento padrão (lookups).
  - Desconto geral (ligado) e desconto por item.
  - Pedir vendedor ao abrir; pedir CPF no cupom; escolher cliente no início.
  - Atalhos Ctrl+M, Ctrl+P, End, Esc e F2 a F11, cada um pode ser desligado
    (todos ligados).
  - Usa balança (ligado) e código de pesagem.
  - Comanda; extrato de mesa no fechamento.
  - Couvert (valor) e taxa de serviço (%).
  - TEF: autoemissão da NFC-e (ligado); forçar NFC-e em venda com cartão.
  - Senhas para sangria, cancelar item e cancelar venda. São campos de senha
    dentro dos parâmetros; o conteúdo não foi lido.
- **App Força de Vendas**
  - Listar vendedores no app.
  - Mandar só os clientes do vendedor e só as formas de pagamento do cliente.
  - Usar a tabela de preço do cliente.
  - Incluir produtos com saldo zero (ligado).
- **E-mails:** três contas SMTP separadas (notas, venda, contador), cada uma com
  remetente, host, porta, usuário, senha, autenticação, SSL e TLS. Também: e-mail
  automático da OS, e-mail no fechamento de caixa, resumo de vendas semanal e
  mensal, e dois e-mails da gerência.
- **Inconsistência vista:** aqui "Ciência automática ao sincronizar NF-e" está
  **ligada**, mas a tela de importação de XML mostra "Ciência auto: NÃO" como
  parâmetro da empresa (ver [09-estoque.md](09-estoque.md)).

### 2.13 `/plano-contas` — Plano de contas [visto]

**Lista**

- Cabeçalho: "Estrutura hierárquica por código", nota "equivalente a
  FrmPlano_Contas" e o contador "0 conta(s)".
- Ações:
  - "Consultar Lançamentos": abre `/plano-contas/apuracao` já com o mês atual (do
    dia 1 ao último dia).
  - "Nova conta raiz" (`/plano-contas/create?placement=raiz`).
  - "Nova subconta" (`?placement=filho`).
- Filtros: Parâmetro (Descrição, Código ou ID); Valor; Status (Todos, Ativo ou
  Inativo); Ordem (Código (árvore) ou Descrição); botões Pesquisar e Limpar
  filtros, e Expandir/Recolher da árvore.
- Colunas: Conta, Código, ID, Ativo, Ações. Lista vazia: "Nenhuma conta
  localizada", com o atalho "Criar primeira conta raiz".

#### `/plano-contas/create` — Nova conta do plano

| Campo | Tipo | Obrigatório | Opções / regra |
| --- | --- | --- | --- |
| Posição na árvore | cartões de escolha | sim | "Nova conta raiz" (grupo de nível superior) ou "Subconta" (filho direto) |
| Conta pai | lista | sim, se subconta | só aparece para subconta; cada conta já traz o próximo código filho |
| Código gerado | somente leitura | — | prévia; a primeira raiz seria `001.` |
| Descrição | texto | sim | — |
| Status | lista | não | Ativo, Inativo |

- **Regras explicadas na tela** (resumo):
  - O código é feito de blocos de 3 dígitos por nível (ex.: `004.001.025.`).
  - A raiz recebe o próximo código livre de nível superior.
  - A subconta herda o prefixo do pai e ganha o próximo número do nível.
  - Na edição, o código não muda: só a descrição e o status.
- [código] Escolher subconta sem conta pai bloqueia o envio e marca o campo.
- **Não existem os campos** tipo (receita/despesa), natureza (devedora/credora) e
  conta sintética/analítica [visto: ausentes].

#### `/plano-contas/apuracao` — "Consultar / Lançar"

- Ações: voltar ao plano, "Novo lançamento" (modal) e "Imprimir"
  (`/plano-contas/apuracao/imprimir?de=&ate=`, não aberto).
- Filtros: De e Até (obrigatórios) e Conta (opcional, lookup).
- Indicadores: contas com movimento, quantidade de lançamentos, total de
  créditos, total de débitos.
- Colunas: ID, Data, Histórico, Vlr Cred, Vlr Deb, Saldo, Ações.
- **Modal "Lançamento":** Conta do plano (lookup, obrigatória), Data
  (obrigatória), Vlr crédito, Vlr débito e Histórico (obrigatório); **regra:
  informar crédito ou débito, nunca os dois.** Botão "Gravar": não clicado.

**Onde o plano é usado:**

- O checklist diz que os lançamentos e relatórios do plano "ficam no Financeiro".
- Os parâmetros sugerem que caixa, entradas, OS, saídas e financeiro podem pedir
  ou alimentar uma conta do plano [deduzido dos nomes dos parâmetros].
- O título a pagar tem conta do plano; o relatório "Despesas por plano de contas"
  está em [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).
- A lupa `plano_contas` aparece no "Novo lançamento" da movimentação bancária e as
  regras de conciliação apontam para uma conta do plano (ver
  [11-financeiro-bancos.md](11-financeiro-bancos.md)).
- A configuração da folha guarda os planos de salários e de encargos como ID cru
  (ver [16-folha-colaborador.md](16-folha-colaborador.md)).

### 2.14 `/municipios` — Municípios [visto]

- Nota "Equivalente a FrmMuncipio" (com o erro de grafia do sistema antigo).
- **Lista:**
  - "Inserir" leva a `/municipios/create`.
  - Filtros: Parâmetro (Descrição ou ID), Valor e Ordem (Descrição ou ID). Não há
    filtro de UF.
  - Colunas: ID, Descrição, País, UF, IBGE, Ações ("Alterar" →
    `/municipios/{id}/edit`).
  - **5.426 registros**, 15 por página (362 páginas). Exemplo: Porto Velho tem ID
    3713, IBGE 1100205, UF RO.
  - A barra "Dados complementares" mostra ID, descrição, IBGE, país e UF.
- **Formulário (novo e edição):**

| Campo | Tipo | Obrigatório | Limite |
| --- | --- | --- | --- |
| Descrição | texto | sim | 100 |
| Código IBGE | texto | **não** | 10 |
| País | lookup | sim | — |
| UF | lookup | sim | — |

- Botões Salvar e Cancelar. Não há botão de excluir.
- **A verificar:** se a tabela é a mesma para todos os clientes do ERP (editar um
  município afetaria os outros?); o IBGE lista cerca de 5.570 municípios e a base
  tem 5.426, por isso podem faltar municípios.

### 2.15 `/zonas` — Zonas [visto]

- Nota "Equivalente a FrmZona". "Inserir" leva a `/zonas/create`.
- Filtros: Parâmetro (Descrição ou ID), Valor, Status (Todos, Ativo ou Inativo) e
  Ordem.
- Colunas: ID, Descrição, Status, Ações. Lista vazia.
- **Formulário "Novo Zona"** (com o erro de gênero do sistema): Descrição
  (obrigatória, até 100 caracteres) e Status (Ativo ou Inativo).
- **O status já vem marcado como "Inativo"** num registro novo [visto: é a opção
  marcada por padrão]. Provável defeito.
- A zona pode ser criada sem sair da tela, pelo "Cadastrar novo" do lookup (ver
  bairros e o checklist).

### 2.16 `/bairros` — Bairros [visto]

- Nota "Equivalente a FrmBairro". Filtros iguais aos das zonas.
- Colunas: ID, Descrição, Zona, Tarifa, Status, Ações.
- **Formulário:**

| Campo | Tipo | Obrigatório | Observação |
| --- | --- | --- | --- |
| Descrição | texto | sim | até 100 |
| Tarifa inicial | valor (texto) | não | taxa de entrega do bairro [deduzido] |
| Zona | lookup | não | o modal tem "Cadastrar novo" (criação rápida) |
| Status | lista | não | **vem "Inativo" por padrão** |

- **O bairro não tem cidade nem UF** [visto: campo ausente]. Também não tem CEP,
  raio ou mapa.
- A configuração de entrega do Delivery (e da Loja) tem **outra lista de bairros**,
  em texto livre (nome + valor), sem ligação visível com este cadastro (ver
  [05-delivery.md](05-delivery.md)). O endereço da empresa também grava o bairro
  como texto.

### 2.17 `/veiculos` — Veículos [visto]

- Visual diferente das outras listas: botões "Filtrar" e "Novo", e não
  "Pesquisar" e "Inserir".
- Filtro: Placa, Descrição ou ID, mais o valor.
- Colunas: ID, Placa, Descrição, Marca/Modelo, Transportador. Lista vazia.
- **Formulário "Novo veículo"**, com três abas:

**Aba Veículo**

| Campo | Tipo | Obrigatório | Opções / limite |
| --- | --- | --- | --- |
| Placa | texto | sim | 8 |
| Descrição | texto | não | 100 |
| Município | lookup | não | — |
| Transportador | lookup | não | pessoa transportadora [deduzido] |
| Ano fab. / Ano mod. | número | não | — |
| Marca / Modelo / Cor | texto | não | 50 cada |
| Renavam / Chassi | texto | não | 50 cada |
| Combustível | lista | não | Gasolina, Álcool, Diesel |
| Tipo rodoviário MDF-e | lista | não | 01 Caminhão, 02 Caminhão-trator, 03 Caminhonete, 04 Utilitário, 05 Outros, 06 Veículo leve |
| Carroceria MDF-e | lista | não | 00 Não aplicável, 01 Aberta, 02 Fechada/Baú, 03 Refrigerada, 04 Sider, 05 Porta-contêiner |
| Cap. carga | número | não | — |

**Aba Carreta:** placa da carreta (8), município da carreta (texto, 40), UF (2),
capacidade em m³, tara (kg).

**Aba Proprietário:** Nome/razão (60), CPF/CNPJ (18) e IE (14); veículo próprio
(Não ou Sim) e estado do proprietário (lookup de UF); tipo do proprietário (TAC
agregado, TAC independente ou Outros); RNTRC (8).

Também há um campo Observações.

- [deduzido] O proprietário segue o grupo de proprietário do MDF-e (TAC
  agregado/independente, RNTRC).
- **A verificar:** os códigos de tipo rodoviário e de carroceria **não batem** com
  as tabelas oficiais do MDF-e conhecidas (tipo rodoviário: Truck, Toco, Cavalo
  mecânico, VAN, Utilitário, Outros; carroceria 03 = Granelera, 04 =
  Porta-contêiner, 05 = Sider). Se o código vai direto para o XML, pode haver
  erro. A tara aparece só na aba Carreta; o MDF-e pede a tara também do veículo de
  tração.
- O veículo é escolhido por lupa no romaneio de carga (com o motorista; ver
  [02-vendas-pdv.md](02-vendas-pdv.md)) e usado no MDF-e (ver
  [13-fiscal.md](13-fiscal.md)).

### 2.18 `/rotas` — Rotas [visto]

- Nota "Equivalente a FrmRomaneio_Rota". "Inserir" leva a `/rotas/create`.
- Filtros: Parâmetro (Descrição ou ID), Valor e Ordem. **Sem filtro de status.**
- Colunas: ID, Descrição, Zona, Região, Valor, Ações.
- **Formulário "Novo Rota":** Descrição (obrigatória, até 100); Valor (texto);
  Região (texto livre, até 50); Zona (lookup). **Não há status.**
- A lupa `rota` tem as colunas Código, Descrição e Região, **sem** cadastro
  rápido; a conta não tem nenhuma rota [código].
- Uso [deduzido]: a rota serve ao romaneio de carga (rota padrão do romaneio e
  rota de cada venda; ver 02) e à força de vendas (o cliente tem uma rota,
  `id_rota`; o relatório de visitas mede a cobertura; ver
  [14-os-forca-vendas.md](14-os-forca-vendas.md)). "Valor" deve ser frete ou taxa
  da rota (a verificar).

### 2.19 `/cadastros/checklist` — Checklist da migração de cadastros [visto]

- **O que é:** painel interno da equipe da Olímpia, aberto ao cliente. Acompanha a
  migração dos cadastros do sistema Delphi para a web.
- **Indicadores:** Total 26, Completos 26, Parciais 0, Pendentes 0.
- **"Padrões globais"**, todos marcados como prontos:
  - lookup em modal (pesquisa por ID e descrição);
  - criação rápida dentro do modal, para grupo, subgrupo, fabricante, cor e zona;
  - abas "Consulta/Cadastro" no estilo Delphi;
  - painel de prévia da linha selecionada;
  - grades-filhas (documentos, série, medidas, preços, kit, grupos tributários,
    metas de CRM);
  - consulta de CNPJ e CEP (em Pessoas);
  - envio de foto e documentos;
  - sequência de IDs própria.
- **Tabela:** Módulo, formulário Delphi, Status, Ajustes pendentes e o link
  "Abrir". As 26 linhas e as rotas:

| Módulo | Rota | Nota de ajuste |
| --- | --- | --- |
| Zonas | `/zonas` | — |
| Bairros | `/bairros` | — |
| Fabricantes | `/fabricantes` | — |
| Cores | `/produto-cores` | — |
| Grades | `/grades` | — |
| Subgrupos | `/produto-sub-grupos` | — |
| Status Confecção | `/confeccao-status` | — |
| Golas | `/golas` | — |
| Mangas | `/mangas` | — |
| Tecidos | `/tecidos` | — |
| Rotas | `/rotas` | — |
| Municípios | `/municipios` | — |
| Plano de Contas | `/plano-contas` | lançamentos e relatórios ficam no Financeiro |
| Bancos | `/bancos` | — |
| Conta Corrente | `/banco-contas` | — |
| Cedente | `/cedentes` | — |
| Grupos de Produto | `/produto-grupos` | — |
| Formas de Pagamento | `/forma-pagamentos` | — |
| Veículos | `/veiculos` | — |
| Pessoas | `/pessoas` | prévia de documento legado |
| Produto | `/produtos` | série/similar e formação de preço contábil na fase 2; complementos de food na aba "Food/Pizza" |
| Empresa | `/empresa` | — |
| Usuários | `/usuarios` | permissões operacionais no usuário; acesso às telas pelo grupo |
| Grupos de Permissão | `/usuario-grupos` | — |
| CRM Markup | `/crm-markup` | — |
| Rota Vendedor | `/rota-visitas` | cobertura visitado/não visitado e relatório |

- Os cadastros de produto ficam em [07-produtos.md](07-produtos.md); bancos,
  contas e cedentes em [11-financeiro-bancos.md](11-financeiro-bancos.md); CRM
  Markup em [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md);
  Rota Vendedor em [14-os-forca-vendas.md](14-os-forca-vendas.md).
- [deduzido] Duas coisas úteis para nós: o **modelo de permissão é duplo** (telas
  pelo grupo, ações operacionais pelo usuário) e o cadastro de produto tem uma aba
  própria de **food/pizza**.

## 3. Fluxos de ponta a ponta

Passos marcados **(obs.)** foram vistos. Os outros são o encadeamento mais
provável e estão **a verificar**.

1. **Abrir uma filial:**
   1. "Nova filial" → CNPJ (dados da Receita Federal) **(obs.)**.
   2. Se houver várias inscrições estaduais, escolher uma **(obs.)**.
   3. Completar e salvar.
   4. Na edição: logo, QR PIX e certificado A1 com senha **(obs.)**; integração
      de boleto e PIX, com teste **(obs.; ver 11)**; parâmetros por módulo
      **(obs.)**.
   5. Escolher a empresa ativa no topo. Financeiro e vendas filtram por ela;
      clientes e produtos são compartilhados **(obs.)**.
2. **Base de entrega e de rota:**
   1. Zona → bairro (tarifa e zona) **(obs.)** → taxa de entrega na venda ou no
      delivery.
   2. Zona → rota (região e valor) **(obs.)** → cliente com rota (ver 14) →
      romaneio de carga e visitas da força de vendas.
   3. Veículo (transportador, carroceria, proprietário) **(obs.)** → romaneio e
      MDF-e.
3. **Plano de contas:**
   1. Criar a raiz e as subcontas, com código automático **(obs.)**.
   2. Os módulos podem pedir ou alimentar uma conta do plano (parâmetros de caixa,
      entrada, OS, saída e financeiro) **(obs. só os nomes dos parâmetros)**.
   3. Apuração por período, com créditos, débitos e saldo, e lançamento manual de
      crédito ou débito **(obs.)** → impressão.
4. **Acesso:** grupo de permissão (telas) → usuário (ações operacionais, senha de
   liberação, ligado a um colaborador) → entrada no ERP com empresa, usuário e
   senha → só as telas liberadas.
5. **Pessoas:** cadastro da pessoa com tipos **(obs.)** → aparece nas lupas por
   papel (cliente, colaborador/vendedor, fornecedor) **(obs.)** → Consulta Cliente
   com score, crédito e histórico **(obs.)**.
6. **RH:** cargo + carga horária **(obs. a grade)** → pessoa com o tipo
   Colaborador (contrato, PIS, senha do ponto) **(obs.)** → ponto eletrônico →
   fechamento → folha (ver [15-ponto.md](15-ponto.md) e
   [16-folha-colaborador.md](16-folha-colaborador.md)).
7. **Pagamento:** forma de pagamento → venda, OS ou caixa → conta a receber e
   conta bancária → código da forma de pagamento na nota fiscal; PIX dinâmico
   quando a forma (ou o tipo de recebimento) tem "Gerar QRCode PIX".

## 4. Entidades e relações

| Entidade | Campos principais | Relações |
| --- | --- | --- |
| Empresa (matriz/filial) | código ("001"), razão, fantasia, CNPJ, IE, IM, telefone, WhatsApp, e-mail, endereço (bairro em texto), município, CNAE, ramo (categoria/sub), gerente, site, usa grade, obs, tipo (Matriz), slug público, logo, QR PIX + chave PIX, certificado A1 + senha | 1:1 Parâmetros da empresa (~420 chaves); 1:1 Integração bancária (ver 11); N:1 Município; **compartilha** pessoas e produtos com as outras filiais |
| Pessoa | código (ID pessoa), nome/razão, CPF/CNPJ, RG/IE, apelido/fantasia, telefone, e-mail, endereço (CEP, número, complemento, bairro, município IBGE), vendedor padrão, rota, status, tipos (cliente, colaborador, fornecedor, transportador, produtor rural) | N:1 Rota; N:1 Município; registro 1 = "CONSUMIDOR FINAL"; cliente de vendas, OS, boletos e créditos; fornecedor das entradas; transportador dos veículos |
| Colaborador (papel da pessoa) | comissões (produto, serviço, geral), salário, admissão, demissão, tipo de contrato (CLT/PJ/Temporário), horas mensais, cargo, carga horária, CTPS, título de eleitor, PIS, senha do ponto, CNH (nº, categoria, vencimento), anotações, limite de convênio | N:1 Cargo; N:1 Carga horária; batidas, justificativas e fechamentos do ponto (ver 15); folha (ver 16) |
| Cargo | não visto | 1:N Colaborador |
| Carga horária | id, descrição, status, horas semanais (calculadas), adicional noturno, grade de 7 dias × (entrada, saída almoço, retorno almoço, saída) | 1:N Colaborador |
| Forma de pagamento | código, nome; marcação "gera convênio colaborador"; possivelmente "Gerar QRCode PIX" | usada na venda, PDV, OS, caixa, romaneio, ML; ligada ao cliente (Força de Vendas) |
| Usuário | ID, nome, login, grupo, colaborador, empresa, senha de liberação, permissão de gestor [deduzido] | N:1 Grupo de permissão; 0..1 Colaborador; pede ou aprova liberações; abre e fecha romaneios |
| Grupo de permissão | não visto | 1:N Usuário; libera as telas |
| Crédito do cliente (lançamento) | data, descrição, crédito, débito; saldo | do cliente; mostrado na Consulta Cliente |
| Município | descrição, IBGE, país, UF | N:1 País, N:1 UF; usado por empresa, pessoa e veículo |
| Zona | descrição, status | 1:N Bairro, 1:N Rota |
| Bairro | descrição, tarifa inicial, zona, status | N:1 Zona (sem cidade) |
| Rota | descrição, valor, região (texto), zona | N:1 Zona; 1:N Cliente (`id_rota`); romaneio e visitas |
| Veículo | placa, descrição, município, transportador, anos, marca, modelo, cor, Renavam, chassi, combustível, tipo rodoviário, carroceria, capacidade, carreta (placa, município, UF, m³, tara), proprietário (nome, CPF/CNPJ, IE, UF, tipo TAC, RNTRC, próprio), obs | N:1 Pessoa (transportador); usado no romaneio e no MDF-e |
| Conta do plano | código hierárquico, descrição, ativo, conta pai | árvore (pai 1:N filhas); 1:N Lançamento do plano; usada por títulos a pagar, banco, conciliação, folha |
| Lançamento do plano | conta, data, valor crédito **ou** débito, histórico | N:1 Conta do plano |

## 5. Integrações

- **Receita Federal (CNPJ):** consulta pelo próprio ERP no cadastro de filial
  (`/empresa/consulta/cnpj/{cnpj}`). O fornecedor do serviço não aparece (a
  verificar). A consulta de CEP e CNPJ existe em Pessoas (checklist).
- **SEFAZ:** NF-e, NFC-e e QR Code; DistDFe e manifestação; MDF-e (dados do
  veículo); NFS-e nacional (DPS) e prefeituras antigas (usuário e senha);
  responsável técnico no XML. Tudo com **um certificado A1 por empresa**. Os
  detalhes estão em [13-fiscal.md](13-fiscal.md).
- **Bancos e gateways** (boleto e PIX dinâmico, configurados na aba Integração
  Bancária): ver [11-financeiro-bancos.md](11-financeiro-bancos.md).
- **E-mail SMTP:** três contas (notas, vendas, contador). XML ao contador,
  fechamento de caixa e resumos de vendas.
- **Periféricos e meios de pagamento** (parâmetros): TEF/POS (percentuais,
  autoemissão da NFC-e); balança (código de pesagem); impressoras (DANFE
  NFC-e/NF-e, cupom, A4).
- **Apps e canais:** app Força de Vendas ("carga geral"), Olimpia Comanda (e-mail
  e senha nos parâmetros), loja virtual, cardápio digital, Mercado Livre e Agente
  de Vendas IA no WhatsApp (notificações). Os PWAs usam o slug da empresa.
- **Outros:** integração com cartórios (assinatura, notas, registro civil, RTD) e
  folha de pagamento (prêmio de meta).
- **Pressupostas, não vistas:** busca de CEP; SEFAZ para dados fiscais da pessoa
  (IE); código da forma de pagamento nas notas; maquininha (TEF) e PIX nas formas
  de pagamento; ponto eletrônico na carga horária (ver 15); WhatsApp como contato
  do cliente.

## 6. Oportunidades de UX

1. **Parâmetros demais, numa tela só.**
   - Cerca de 420 opções misturam segmentos que um restaurante nunca usa
     (condomínio, confecção, cartório, petshop).
   - Muitos rótulos são nomes de coluna, alguns com erro de digitação.
   - [proposta] Mostrar só os ajustes dos módulos contratados, em linguagem
     simples, com padrões prontos por segmento (o ramo "Restaurante" já
     escolheria os valores certos).
2. **Senhas operacionais guardadas como parâmetro** (sangria, cancelar item ou
   venda, saída de estoque) e **senhas de SMTP e de prefeitura no mesmo
   formulário** da empresa. [proposta] Permissões por papel, aprovação do gerente
   com o login dele (e não com uma senha única guardada) e segredos num cofre
   separado.
3. **Padrões errados:** zona e bairro novos nascem **Inativos**; o QR Code da
   NFC-e tem opções duplicadas; a "Ciência auto" aparece diferente em duas telas.
4. **O nome técnico atrapalha:** "Equivalente a FrmXxx" em quase toda tela; nomes
   de tabela e coluna nas ajudas; o checklist interno de migração aberto ao
   cliente; tradução faltando no paginador ("pagination.next"); "Novo Zona",
   "Novo Rota"; a aba "Logo / QR PIX" chamada "Logo / Certificado" no manual e na
   ajuda. [proposta] Linguagem do comerciante, sem jargão.
5. **A geografia é pobre:** o bairro não tem cidade; a região da rota é texto
   livre; faltam municípios na base (5.426 contra cerca de 5.570); o endereço da
   empresa grava o bairro como texto; o Delivery tem uma segunda lista de bairros.
   [proposta] Base IBGE completa e bairro ligado à cidade, com taxa por bairro,
   faixa de CEP ou raio no mapa (o que importa para delivery), numa só tabela.
6. **O plano de contas é só uma árvore de nomes:** não há tipo (receita/despesa)
   nem natureza; o lançamento manual aceita crédito ou débito soltos. [proposta]
   Categorias prontas por segmento que montam sozinhas um resultado gerencial
   (DRE simples).
7. **Carga horária:** os modelos rápidos e o total semanal calculado são bons e
   vale copiar. Mas só cobre semana fixa (sem 12x36, escala, folga alternada,
   jornada flexível), e o campo "Hrs semanais" parece aceitar digitação: se
   aceitar, o total digitado pode desmentir a grade.
8. **Senha do ponto definida pelo gestor** no cadastro da pessoa (o gestor conhece
   a senha). [proposta] Convite individual e senha criada pelo próprio
   colaborador no primeiro acesso (ver 15).
9. **Escolher uma pessoa custa vários passos** (lupa, Buscar, clicar na linha), a
   caixa é só de leitura e o filtro "Cliente" dos relatórios aceita qualquer
   pessoa. [proposta] Campo único com sugestões enquanto se digita, restrito ao
   papel certo.
10. **Barra lateral só com ícones:** "Clientes" e "Consulta Cliente" são dois
    ícones com funções parecidas (a verificar se confunde).
11. **Código de "Ativo" invertido** entre telas (0 num lado, 1 noutro): falta de
    padrão no modelo de dados. [proposta] Status com nome explícito.
12. **O que vale copiar:**
    - consulta do CNPJ que preenche tudo e trata várias IEs;
    - lookup com "Cadastrar novo" (criação rápida) dentro dos formulários;
    - um certificado único reaproveitado por todos os documentos;
    - fechamento de caixa cego configurável por forma de pagamento;
    - baixa de estoque na finalização ou na entrega;
    - Consulta Cliente com score, crédito e linha do tempo numa tela só;
    - modelo de permissão duplo (telas pelo grupo, ações pelo usuário).
13. **Ideias nossas** [proposta]: um cadastro de pessoa com vários papéis (como o
    deles), em vez de cadastros separados; perfis de acesso prontos (dono, caixa,
    garçom, cozinha) em vez de uma grade enorme de permissões.

## 7. Pendências

- **Recusas e telas não abertas.** O classificador do modo automático do Claude
  Code recusou, com o motivo "Third-Party Attack", a navegação para
  `/dashboard/modulo/cadastros` numa passagem e para `/tecidos` (primeira rota)
  noutra; as rotas seguintes dessas passagens não foram tentadas (`/pessoas`,
  `/pessoas?tipo=cliente`, `/colaborador-cargos`, `/forma-pagamentos`,
  `/usuarios`, `/usuario-grupos`). Não foi problema de credencial. Nada foi lido,
  clicado ou gravado nessas passagens. Completar depende de o dono da conta
  autorizar a leitura. Começar pelo hub de Cadastros (mapa do módulo) e por
  `/pessoas`.
- **Pessoas:** lista, formulário completo (abas além de Colaborador), validações
  de CPF/CNPJ, preenchimento pela Receita e pelo CEP, dados fiscais e de crédito,
  endereços e contatos; diferença entre `/pessoas?tipo=cliente` e `/crm/clientes`.
- **Consulta Cliente:** cálculo do score; limite usado e disponível; bloqueio de
  venda (a conta só tem o "CONSUMIDOR FINAL").
- **Cargos, formas de pagamento, usuários, grupos de permissão:** telas inteiras;
  diferença entre forma de pagamento e tipo de recebimento; onde se marca "Gerar
  QRCode PIX".
- **Permissões:** tudo foi visto como ADMIN. Não se sabe o que um operador comum
  vê nem quais ações pedem senha.
- **Empresa ativa:** como se troca a empresa ativa no topo (há um seletor no
  código, não identificado com certeza na tela) e o que muda nas telas de estoque.
- **Ramo da empresa:** se a categoria e a subcategoria alteram menus ou padrões.
- **Municípios:** se a tabela é a mesma para todos os clientes do ERP e se um
  cliente pode alterá-la para os outros.
- **Veículos:** confirmar os códigos de tipo rodoviário e carroceria que vão para
  o XML do MDF-e, e onde fica a tara do veículo de tração.
- **Plano de contas:** se soma subtotais por nível; a impressão da apuração
  (`/plano-contas/apuracao/imprimir`) não foi aberta.
- **Carga horária:** se "Hrs semanais" aceita digitação.
- **Ações vistas e não clicadas:** Salvar (pessoa, carga horária, empresa), Salvar
  filial, Salvar integração bancária, Testar conexão, Testar geração QR Code,
  Gravar (lançamento contábil), "Adicionar aos atalhos".

## 8. Sub-rotas descobertas

- `/empresa/nova`, `/empresa/{id}` (lido `/empresa/1`), `/empresa/1#tab-integracao`.
- `/plano-contas/create?placement=raiz` e `?placement=filho`;
  `/plano-contas/apuracao?de=…&ate=…`; `/plano-contas/apuracao/imprimir?de=&ate=`.
- `/municipios/create`, `/municipios/{id}/edit` (lido `/municipios/3713/edit`).
- `/zonas/create`, `/bairros/create`, `/veiculos/create`, `/rotas/create`.
- `/carga-horarias/create`.
- `/pessoas/create`, `/pessoas?tipo=colaborador`, `/pessoas/{id}/edit`.
- `/consulta-cliente/{id}` (lido `/consulta-cliente/1`) e os atalhos dele:
  `/financeiro/recebimento?filtro=cliente&consulta={id}`,
  `/financeiro/receber?id_cliente={id}`, `/vendas?id_cliente={id}`.
- Endpoints vistos na estrutura e não usados: `/empresa/consulta/cnpj/{cnpj}`;
  envio do formulário da integração em `/empresa/1/integracao-bancaria` e teste
  em `/empresa/{id}/integracao-bancaria/testar-pix` (ver 11).
- Lupas ligadas a estas telas: `pessoa`, `pessoa_cliente`, `pessoa_colaborador`,
  `usuario`, `rota`, `plano_contas`, município, zona.
