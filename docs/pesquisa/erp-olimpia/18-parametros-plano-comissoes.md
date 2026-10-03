# 18 — Parâmetros do sistema, campos obrigatórios, plano e mensalidades, termos de uso, utilitários e comissão por metas (ERP Olímpia)

> Cobre os módulos Parâmetros (hub, parâmetros de hardware/PDV, campos
> obrigatórios), Mensalidades (faturas, plano, termos de uso com aceite
> eletrônico), Utilitários (Novidades e Log de alterações) e a tela "Comissão
> por metas"; traz também o que estas telas revelam sobre a arquitetura do
> sistema. Exploração de 2026-10-03, conta de teste "Boi Criolo" (plano Full),
> sessão já aberta no navegador embutido. Legenda: [visto], [visto em parte],
> [deduzido], [afirmado pelo manual], [código] (lido no HTML/JS da página),
> [proposta]; [a verificar] marca hipóteses. Nada foi gravado no ERP.

## 1. Visão geral

**Onde fica [visto]:** no menu lateral, seção "SISTEMA": Mensalidades,
Parâmetros, Utilitários e Manual (este último no
[22](22-manual.md)). A "Comissão por metas" fica no módulo Relatórios, grupo
"Comissões" (é o primeiro cartão do grupo), mas não é um relatório: é um
cadastro com apuração.

**Quatro assuntos juntos [visto]:**

1. **Ajustes do sistema:** parâmetros de hardware, PDV, TEF, balança e leitor
   (`/parametros-sistema`) e campos obrigatórios configuráveis em cliente e
   produto. Os cerca de 420 parâmetros de negócio da aba "Parâmetros" do
   cadastro da empresa **não** estão aqui: ficam no
   [08](08-pessoas-empresa-acessos.md).
2. **Conta com a Olímpia:** assinatura por **créditos** (cada pagamento soma 30
   dias de acesso), faturas, plano com módulos e termos de uso com aceite
   eletrônico auditável.
3. **Suporte e auditoria (Utilitários):** Novidades (changelog publicado pela
   Olímpia) e Log de alterações (auditoria genérica com antes e depois em
   JSON).
4. **Integrações técnicas** (atalhos no hub de Parâmetros): Olimpia Bridge,
   MCP / Conector IA e Monitor WhatsApp IA (telas no
   [17](17-consultoria-ia.md)) e API Força de Vendas (tela no
   [14](14-os-forca-vendas.md)).

**Padrões vistos:** hubs `/dashboard/modulo/...` com cartões e estrela
"Adicionar aos atalhos"; formulários renderizados no servidor com `_token`
CSRF e `_method=PUT/PATCH`; `confirm()` nativo e SweetAlert2; textos de ajuda
ligados à NF-e nos campos obrigatórios. Os elementos globais da moldura
(cabeçalho, busca Ctrl+K, botão "Novidades", assistente, barra de atalhos
lateral, avisos) estão descritos no [22](22-manual.md).

### 1.1 O que estas telas revelam sobre a arquitetura do sistema

Descrição única da arquitetura e da tecnologia do ERP; os outros documentos
apontam para aqui. A moldura de interface (cabeçalho, menu, Ctrl+K, avisos) está
no [22](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas).

- **O ERP web é uma migração de um ERP desktop feito em Delphi [visto].**
  - `/parametros-sistema` diz que a origem é o formulário "FrmParametros_INI"
    e grava na mesma tabela `parametros_ini` usada pelo cliente desktop; tem
    abas que só valem no desktop (Skin DevExpress, "backup ao fechar o
    sistema", testes ACBr).
  - A tela de Novidades chama-se "changelog da migração web" e cita ajustes
    feitos para ficar igual ao código Delphi.
  - Há relatórios descritos como "estilo Delphi" e um que cita "Delphi
    FrmRelatorio" (ver [19](19-relatorios-vendas-financeiro.md)). O manual
    também cita "FrmEmpresa" e "sistema legado" (ver [22](22-manual.md)).
  - As telas de cadastro e de operação mostram, debaixo do título, o
    formulário desktop "equivalente": por exemplo `FrmEmpresa`, `FrmZona`,
    `FrmBairro` ([08](08-pessoas-empresa-acessos.md)), `FrmProduto_Grupo` e
    `FrmProduto_Sub_Grupo` ([07](07-produtos.md)), `FrmRomaneio_Carga`
    ([02](02-vendas-pdv.md)), `FrmFiscal_GerenciarNFCe`,
    `FrmFiscal_Grupo_Tributario` e outros ([13](13-fiscal.md)). É uma migração
    tela a tela. O checklist `/cadastros/checklist` acompanha a migração dos 26
    cadastros (ver [08](08-pessoas-empresa-acessos.md)).
- **Provável banco de dados por cliente (tenant) [deduzido].** Os registros de
  Novidades trazem `id_empresa: 1`, mas o aceite dos termos registra o "código
  da empresa" 54. Os registros de Novidades são gravados pelo próprio sistema
  (usuário "WEB", IP 127.0.0.1) e aparecem no log de auditoria desta conta.
  Isso sugere que cada cliente tem o seu banco e que as Novidades são copiadas
  para cada um a cada atualização.
- **Banco PostgreSQL [deduzido].** O subtítulo da auditoria do ponto cita
  "BYTEA", tipo de coluna binária do PostgreSQL (ver [15](15-ponto.md)).
- **Horário [visto].** O banco guarda o horário em UTC (15:24:50 no registro)
  e a tela mostra o horário local, UTC−4, de Porto Velho (11:24:50).
- **Tecnologia [visto; código].**
  - Backend PHP com **Laravel** e páginas Blade: nomes de rota como
    `mcp.index`, `mcp.monitor`, `bridge.index`, `consultoria.acoes.index`
    ([17](17-consultoria-ia.md)), `relatorios.show`
    ([19](19-relatorios-vendas-financeiro.md)), `folha.beneficios.index` e
    `colaborador.admin.solicitacoes.index` ([16](16-folha-colaborador.md));
    token CSRF `_token`; `_method=PUT/PATCH`; rotas de recurso `/create` e
    `/{id}/edit`; caminhos `storage/app/...`. A documentação do Mercado Livre
    cita o comando `php artisan ml:sync-automatico` (ver
    [06](06-loja-virtual-mercado-livre.md)).
  - Formulários renderizados no servidor (POST seguido de redirecionamento);
    filtros por GET (parâmetros na URL).
  - **Bootstrap 5** (versão 5.3.3 lida nas telas de relatório) com Bootstrap
    Icons; bibliotecas pela CDN jsDelivr; scripts próprios para a lupa
    (`/js/erp-lookup.js`), o menu e o tema. Segundo o manual, o BI usa
    Chart.js (ver [01](01-dashboard-bi-tv.md)).
  - Alertas e confirmações em janelas próprias com **SweetAlert2**, em vez dos
    alertas do navegador ([06](06-loja-virtual-mercado-livre.md),
    [17](17-consultoria-ia.md), [19](19-relatorios-vendas-financeiro.md));
    nas telas deste documento também aparece o `confirm()` nativo do
    navegador.
  - **Cloudflare** e Cloudflare Insights.
- **Motor de relatórios genérico** (rota única `/relatorios/{slug}`, catálogo
  de 132 relatórios): descrito no [19](19-relatorios-vendas-financeiro.md).
- **Planos e módulos [visto]:** uma rota de módulo fora do plano abre, mas
  mostra "Esta função não está no seu plano" (ex.: `/mcp`, ver
  [17](17-consultoria-ia.md)). A busca Ctrl+K continua a listar atalhos desses
  módulos (ver [22](22-manual.md)).

### 1.2 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/parametros` | Hub Parâmetros (9 cartões) | lida |
| `/parametros-sistema` | Parâmetros do Sistema (8 abas) | lida (numa passagem anterior a navegação foi recusada; lida numa passagem posterior) |
| `/parametros/campos-obrigatorios` | Campos obrigatórios (2 abas) | lida |
| `/dashboard/modulo/mensalidades` | Hub Mensalidades (3 cartões) | lida |
| `/minha-assinatura` | Mensalidade / Minhas faturas | lida |
| `/meu-plano` | Meu plano | lida |
| `/meus-termos` | Termos de Uso | lida |
| `/meus-termos/{uuid}` | Detalhe do aceite | lida |
| `/meus-termos/{uuid}/imprimir` | Comprovante para impressão | lida pelo HTML (GET, sem abrir a impressão) |
| `/dashboard/modulo/utilitarios` | Hub Utilitários (2 cartões) | lida |
| `/sistema-melhorias` | Melhorias e Ajustes (Novidades) | parcial (texto visível; leitura do filtro por script recusada) |
| `/sistema-log-alteracoes` | Log de Alterações | lida |
| `/sistema-log-alteracoes/{id}` | Detalhe do log | lida (#13) |
| `/comissoes/metas` | Controle de comissão por metas | lida (lista vazia; "Criar meta" não clicado) |

## 2. Telas

### 2.1 `/dashboard/modulo/parametros` — Hub Parâmetros [visto]

**Objetivo:** página de atalhos. Não tem lista, filtros, totais nem
formulário.

**Layout:** faixa escura com o título "Parâmetros" e o link "Voltar ao
dashboard" (`/dashboard`). Abaixo, uma grade de 9 cartões (4 por linha no
desktop). Cada cartão tem um ícone e um rótulo em maiúsculas, sem texto de
descrição.

| Cartão | Destino | Documento |
| --- | --- | --- |
| Parâmetros do sistema | `/parametros-sistema` | este (2.2) |
| Campos obrigatórios | `/parametros/campos-obrigatorios` | este (2.3) |
| Olimpia Bridge | `/bridge` | [17](17-consultoria-ia.md) |
| MCP / Conector IA | `/mcp` | [17](17-consultoria-ia.md) (bloqueada pelo plano) |
| Monitor WhatsApp IA | `/mcp/monitor` | [17](17-consultoria-ia.md) (bloqueada pelo plano) |
| Meu plano | `/meu-plano` | este (2.6) |
| Mensalidades | `/minha-assinatura` | este (2.5) |
| Termos de uso | `/meus-termos` | este (2.7) |
| API Força de Vendas | `/forca-vendas/api` | [14](14-os-forca-vendas.md) |

- O cartão "Mensalidades" leva para `/minha-assinatura` (as faturas), e não
  para o hub `/dashboard/modulo/mensalidades`. O atalho "Mensalidades" da
  barra lateral também salta o hub (ver 2.4).

### 2.2 `/parametros-sistema` — Parâmetros do Sistema [visto]

**Objetivo:** parâmetros de hardware, PDV, TEF, balança e leitor,
compartilhados com o cliente desktop Delphi. O subtítulo diz que a origem é o
FrmParametros_INI e que tudo grava em `parametros_ini`. Formulário único (PUT
`/parametros-sistema`) com 8 abas. A tela não indica terminal nem empresa: não
ficou claro se os parâmetros são por empresa ou por terminal.

#### Aba Geral

Nota da aba: séries fiscais e certificado ficam em Fiscal → Séries e no
cadastro da empresa.

| Campo | Tipo | Opções / observação |
| --- | --- | --- |
| Caminho layouts (DANFE/DANFCe) | texto + botão pasta | o botão preenche a sugestão `storage/app/parametros-ini/` |
| Impressora NFC-e / DANFC-e (PDF) | texto com sugestões | — |
| Impressora de etiquetas (Elgin L42 / Bridge) | texto com sugestões | — |
| Reenviar NFC-e automaticamente | select | Não / Sim |
| Fazer backup ao fechar o sistema | select | Não / Sim (só faz sentido no desktop) |
| Travar login empresa | select | Não / Sim |
| Loja travada | select | lista de empresas; **só fica ativo com "Travar login = Sim"** |

As sugestões de impressora são uma lista fixa, sem detecção: Microsoft Print to
PDF, XPS, EPSON TM-T20, EPSON TM-T88, Bematech MP-4200 TH, Elgin i9 e Daruma
DR800.

#### Aba Balança

- Configuração serial:
  - Modelo: Nenhuma, Filizola, Toledo.
  - Porta serial: COM1 a COM8.
  - Baud rate: 110 a 57600.
  - Data bits: 5 a 8.
  - Paridade: none, odd, even, mark, space.
  - Stop bits: 1, 1,5, 2.
  - Handshaking: Nenhum, XON/XOFF, RTS/CTS, DTR/DSR.
- Teste da balança: botões Ativar, Desativar e Ler peso, mais os campos "Peso
  lido" e "Resposta". Os botões enviam POST para `/parametros-sistema/serial`
  com `acao` igual a `balanca_ativar`, `balanca_desativar` ou
  `balanca_ler_peso` (não clicados).
- Nota da tela: o PDV web (Chrome/Edge) lê a balança pela **Web Serial API**
  com estes parâmetros. Na primeira vez, escolhe-se a porta USB no PDV (F9 →
  Porta USB). O teste com ACBrBAL continua só no cliente desktop.

#### Aba Etiqueta / Carga

- Etiqueta da balança (define como o PDV interpreta o código de barras
  impresso pela balança):
  - Modelo: Filizola, Toledo.
  - Tipo de leitura: Peso ou Valor.
  - Dígitos da balança e dígitos do produto (números).
  - Exportar automaticamente: Não / Sim.
- Carga da balança:
  - Caminho dos arquivos (texto).
  - Modelo: Filizola, Toledo MGV7, Toledo MGV5, Urano, Urano S, Urano URF32.
  - Botão **Exporta**: POST para `/parametros-sistema/exportar-balanca` com
    caminho e modelo, mostra uma barra de progresso e baixa um ZIP
    (`carga-balanca.zip`). Não clicado.
- Nota para o MGV7: extrair o ZIP, importar o arquivo de itens no software da
  balança e remover antes os arquivos antigos.

#### Aba Gaveta

- Modelo: Epson, Bematech, Sweda, Elgin.
- Conexão USB: Não / Sim.
- Porta da gaveta: texto com sugestões de impressora.
- Botão **Testar gaveta**: POST para `/parametros-sistema/testar-gaveta` (não
  clicado).

#### Aba PDV

- Cores do PDV, cada uma com seletor de cor e campo `#RRGGBB`: Descritivos,
  Painel lateral, Painel topo, Painel rodapé, Texto.
- Opções do PDV (Não / Sim): Bloquear pesquisa por descrição; Imprimir CP/NF
  direto (ficha bar); Abrir tela de mesas automaticamente.
- TEF DIAL: TEF ativo (Não / Sim); Time sleep (ms) e Time status (números);
  Auto ativar G.P. (gerenciador padrão); Múltiplos cartões; Auto finalizar
  cupom; CHQ em gerencial.

#### Aba Leitor / Busca preço

- Leitor serial (ACBrLCB):
  - Usar leitor serial: Não / Sim.
  - Porta: COM1 a COM5, LPT1 a LPT3.
  - Baud rate: 1200 a 19200.
  - Data bits; Sufixo e Excluir sufixo; Handshake; Hardware flow e Software
    flow; Paridade e Stop bits.
  - Botões Ativar, Desativar e Emulador, com o estado "ACBrLCB — DESATIVADO".
    Também usam `/parametros-sistema/serial`.
- Busca preço: campo com o caminho do arquivo de busca de preço e botão
  **Enviar** (POST `/parametros-sistema/busca-preco`), que gera e baixa o
  arquivo para o terminal consulta-preço. Não clicado.

#### Aba Olimpia Bridge

- Hardware no PDV:
  - Desligado (padrão atual): Web Serial no navegador e gaveta pelo servidor.
  - Olimpia Bridge: hardware local através do agente.
  - Automático: usa o Bridge se estiver online; senão, o modo padrão.
- Impressora Bridge (opcional).
- Cartão de download: Windows 64-bit (105 MB); Linux AppImage ("em breve");
  macOS Intel (104 MB); macOS Apple Silicon (100 MB). A tela sugere o sistema
  detectado e diz que não é preciso Node.js.
- Link "Configuração completa do Bridge" (`/bridge`, ver
  [17](17-consultoria-ia.md)).

#### Aba Skin

Temas Office2019 (Colorful, White, Black, DarkGray), DevExpress Style,
DevExpress Dark Style, The Asphalt World, Liquid Sky e London Liquid Sky.
Segundo a tela, valem **só para o cliente desktop Delphi/DevExpress**.

#### Rodapé

- **Gravar** (não clicado).
- **Fechar**: o link aponta para `/erp/notificacoes/whatsapp/poll`, um
  endpoint JSON de polling. É um defeito: o "voltar para a página anterior"
  foi capturado por um pedido em segundo plano.
- Atalhos: Cadastro de séries (`/fiscal-series`), NF-e | NFC-e (`/nfce`) e
  Empresa (CRT / tributos) (`/empresa/1`) — telas no
  [13](13-fiscal.md) e no [08](08-pessoas-empresa-acessos.md).

### 2.3 `/parametros/campos-obrigatorios` — Campos obrigatórios [visto]

**Objetivo:** cada tenant escolhe que campos são obrigatórios no cadastro de
**cliente** e de **produto**. A escolha vale também para o cadastro rápido
feito durante a venda.

**Estrutura:** duas abas, Cliente e Produto. Cada aba é um formulário próprio
(PUT, com `entidade` oculta igual a `cliente` ou `produto`), com interruptores
em forma de "pílula" agrupados por tema. Botões **Salvar cliente** e **Salvar
produto** (não clicados). A mensagem da tela diz que um campo marcado impede
salvar quando está vazio. Os itens com ✔ abaixo estavam ligados na conta de
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

Não há outras entidades (fornecedor, venda) nesta tela. Não se sabe se a regra
vale também em importações e na API.

### 2.4 `/dashboard/modulo/mensalidades` — Hub Mensalidades [visto]

Página de atalhos com 3 cartões: **Minhas faturas** (`/minha-assinatura`),
**Meu Plano** (`/meu-plano`) e **Termos de Uso** (`/meus-termos`). Cada cartão
tem a estrela para fixar nos favoritos do menu (não clicada). O atalho
"Mensalidades" da barra lateral e o cartão "Mensalidades" do hub de Parâmetros
saltam este hub e vão direto para `/minha-assinatura`. As duas rotas não são a
mesma coisa: uma é o hub e a outra é a tela de faturas. O módulo trata da
assinatura do próprio comerciante com a Olímpia, não de cobrança recorrente
aos clientes do comerciante [deduzido; essa cobrança fica no módulo Cobrança,
ver [12](12-cobranca-crm-cashback-portal.md)].

### 2.5 `/minha-assinatura` — Mensalidade (Minhas faturas) [visto]

- **Cabeçalho:** diz que a mensalidade se paga por PIX ou boleto e mostra o
  dia de pagamento (05) e o valor (R$ 799,00/mês). Botão "Ver meu plano".
- **Cartão "Situação da assinatura":** barra de créditos (47%, cerca de 14 de
  30 dias), o texto "14 dias de crédito restantes · válido até 17/10/2026" e o
  plano atual (Full).
- **Alerta amarelo** com os dias restantes e a data de vencimento.
- **Cartão "Próxima mensalidade":** explica que a cobrança só é gerada quando
  o cliente quiser pagar adiantado. O botão **Pagar próxima mensalidade** envia
  POST para `/minha-assinatura/proxima/pagar` (não clicado).
- **Tabela "Minhas faturas"** (com contador de registros): Mensalidade ·
  Vencimento · Valor · Status · Forma · Ação. Vazia, com a mensagem de que não
  há mensalidade disponível para pagamento.
- O gateway de PIX/boleto não foi identificado.

### 2.6 `/meu-plano` — Meu plano [visto]

- **Regra:** só o administrador do sistema pode trocar o plano.
- **Créditos de uso:** cada pagamento soma 30 dias de acesso e os créditos
  descem um por dia. Barra, dias restantes e botão "Mensalidade / faturas".
- **Plano atual:** Full ("plataforma completa: RH, OS, portais, compras,
  cobrança automática, BI e Gestão 360°, com suporte Olímpia"). Tipo Pago,
  R$ 799,00/mês, créditos até 17/10/2026, lista de módulos.
- **Trocar plano:** PATCH `/meu-plano` com o rádio `plano_id`.

| Plano | id | Preço/mês | Módulos | Resumo na tela |
| --- | --- | --- | --- | --- |
| Profissional | 2 | R$ 299,90 | 17 | PME: NF-e, NFC-e, bancos, PIX, TEF e CRM/markup; até 20 usuários |
| Premium | 4 | R$ 499,90 | 25 | Omnicanal: loja, cardápio, Mercado Livre, delivery, força de vendas, CT-e/MDF-e |
| Full (atual) | 5 | R$ 799,00 | 36 | Tudo, incluindo RH, OS, portais, compras, cobrança automática, BI e Gestão 360° |

- O botão **Contratar plano selecionado** (não clicado) abre um `confirm()`
  nativo. O aviso diz que planos pagos exigem pagamento imediato para liberar
  créditos e que planos trial ou gratuitos são aplicados na hora. Os planos
  pagos redirecionam para PIX ou boleto. Faltam os ids 1 e 3: provavelmente
  planos trial ou gratuitos, escondidos [deduzido].
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
- **Hipótese [a verificar]:** a ordem bate com os escalões. Os 17 primeiros,
  até "CRM / Markup", seriam o Profissional; os 8 seguintes, até "Força de
  Vendas", completariam o Premium (25); os 11 últimos seriam exclusivos do
  Full. MCP e WhatsApp IA não estão em nenhum plano.
- **Implantação [visto nas Novidades]:** ao contratar um plano pago, o sistema
  cria uma fatura de implantação com o mesmo valor da primeira mensalidade e
  bloqueia a operação até essa fatura ser paga.

### 2.7 `/meus-termos` — Termos de Uso [visto]

**Objetivo:** mostrar o histórico dos Termos de Uso e Licença que a empresa
aceitou eletronicamente. Só consulta: sem filtros, paginação nem botão "Novo".
Fica no hub Mensalidades e também é um cartão do hub Parâmetros.

**Layout:**

- Título "Termos de Uso" e uma frase explicando a tela.
- **Cartão "Termo vigente":** versão (1.1), data e hora da publicação
  (07/08/2026 16:42:26) e um selo verde "ACEITO".
- **Tabela "Aceites registrados":**

| Coluna | Conteúdo visto |
| --- | --- |
| Versão | 1.1 |
| Data do aceite | 03/10/2026 10:08:45 |
| Responsável | ADMIN |
| CNPJ registrado | CNPJ da conta, só números, sem máscara (omitido aqui) |
| Status | selo "ACEITO" |
| Ações | "Ver" (detalhe) e "Imprimir" (abre noutra aba, `/meus-termos/{uuid}/imprimir`) |

**Regras e comportamento:**

- Uma linha por aceite e por versão. O cartão do topo mostra se a versão em
  vigor já foi aceita [visto]. Se sair uma versão nova sem aceite, o selo deve
  mudar para algo como "pendente" [a verificar].
- O aceite foi feito no mesmo dia desta pesquisa, às 10:08. Isso indica que o
  sistema pede o aceite no acesso, antes do uso [deduzido; a tela de aceite
  não foi vista porque a conta já tinha aceitado].
- O aceite não aparece no Log de alterações: fica na sua própria tabela
  [visto].

#### `/meus-termos/{uuid}` — Detalhe do aceite [visto]

- Título "Detalhe do aceite", com os botões "Imprimir" (nova aba) e "Voltar".
- **Cartão "Registro eletrônico do aceite":** empresa (razão social), nome
  fantasia, "CNPJ (na época)", responsável, usuário/login, data e hora com
  segundos, IP (IPv6), versão com o selo "ACEITO (vigente)", UUID do aceite e
  hash SHA-256.
- **Cartão "Conteúdo exato aceito":** o texto inteiro dos termos (cerca de 22
  mil caracteres, 38 cláusulas), escrito em Markdown e mostrado formatado numa
  caixa com rolagem. No fim do texto há um bloco preenchido automaticamente no
  momento do aceite: empresa, CNPJ, código interno da empresa, responsável,
  login, ID do usuário, data, hora, IP, navegador e dispositivo (user agent),
  versão, "hash do termo" e ID único do aceite, além dos dados da Olímpia.
- **Duas impressões digitais diferentes [visto]:** o SHA-256 do cartão de
  registro é diferente do "hash do termo" escrito no texto. O mais provável é
  que um seja do modelo da versão e o outro do texto já preenchido com os
  dados do aceite [deduzido].
- O campo "CNPJ (na época)" guarda o CNPJ do momento do aceite, para o
  comprovante não mudar se o cadastro da empresa mudar depois [deduzido].

#### `/meus-termos/{uuid}/imprimir` — Comprovante para impressão [visto pelo HTML]

- Página sem o menu do ERP, com dois botões: "Imprimir" (abre a impressão do
  navegador) e "Fechar" (fecha a janela). A impressão não começa sozinha.
- Mostra um título de comprovante, a identificação da Olímpia, os mesmos dados
  do registro (empresa, CNPJ, responsável, usuário, data e hora, IP, versão,
  UUID e SHA-256) e o texto aceito.
- **Defeito:** o texto aceito aparece em Markdown cru, dentro de um bloco de
  texto pré-formatado. O papel sai com os símbolos `#` e `**` à mostra.

#### O que os termos dizem (resumo com palavras nossas)

As 38 cláusulas tratam de: identificação das partes, objeto, licença de uso (o
cliente não compra o software) e propriedade intelectual; o aceite e o seu
registro; assinatura mensal, serviços extras e inadimplência;
responsabilidades do cliente (dados, parte fiscal e tributária, documentos
fiscais, certificado digital, usuários e senhas, funcionários, equipamentos e
internet); integrações de terceiros, disponibilidade, backup, LGPD, suporte,
atualizações, IA e automações, uso proibido, responsabilidades e limites de
responsabilidade, resultados do negócio; cancelamento, dados após o
cancelamento, mudança de planos e preços, customizações, confidencialidade,
alteração dos termos, contratos específicos e lei aplicável.

Pontos que importam para o nosso produto:

- **Como se aceita:** o usuário marca uma opção de "li e aceito" e confirma.
  Ao aceitar, declara que tem poderes para aceitar em nome da empresa.
- **O que fica registrado:** razão social, CNPJ, código interno da empresa,
  identificação, nome e login do usuário, data e hora, IP, navegador e
  dispositivo, versão, texto integral, identificador único e hash de
  integridade.
- **Novas versões:** cada versão tem identificação própria. Uma mudança
  relevante pode exigir novo aceite, e o histórico das versões anteriores é
  mantido.
- **Preço:** a mensalidade é recorrente e pode variar por plano, número de
  usuários, empresas, módulos, terminais, funções, armazenamento,
  integrações, volume de uso e serviços extras. O preço é modular, como
  queremos.
- **Inadimplência:** pode levar a aviso de cobrança, restrição de funções,
  suspensão do acesso ou da licença e cancelamento. Para reativar, é preciso
  pagar o que está em atraso.
- **Backup e cancelamento:** o backup não substitui a obrigação legal do
  cliente de guardar os seus documentos fiscais. Antes de encerrar, o cliente
  deve exportar os seus dados, "quando houver recurso". Depois do prazo legal,
  os dados podem ser apagados ou anonimizados.
- **IA e automações:** os resultados podem ter erros e o cliente deve
  conferir antes de decidir.

### 2.8 `/dashboard/modulo/utilitarios` — Hub Utilitários [visto]

- Página de atalhos: faixa escura com o título "Utilitários" e o link "Voltar
  ao dashboard". Sem lista, filtros nem formulário.
- Um único painel, "Suporte & Auditoria", com 2 cartões:

| Cartão | Destino | Ícone |
| --- | --- | --- |
| Melhorias e Ajustes | `/sistema-melhorias` | estrelas |
| Log de Alterações | `/sistema-log-alteracoes` | diário |

- Cada cartão tem a estrela "Adicionar aos atalhos" (não clicada).
- Este módulo **não** tem importação, exportação, backup, reprocessamento,
  limpeza de dados nem etiquetas: são só estas duas telas (as etiquetas ficam
  no [07](07-produtos.md)).

### 2.9 `/sistema-melhorias` — Melhorias e Ajustes (Novidades) [visto em parte]

Leitura só do texto visível; a leitura do filtro por script foi recusada pela
trava do Claude Code e não foi refeita.

**Objetivo:** registro de mudanças (changelog) que a Olímpia publica:
recursos novos, melhorias, ajustes e correções. O subtítulo diz que é o
changelog da migração web e que os registros são automáticos. Chega-se aqui
pelo botão "Novidades" do cabeçalho (nome acessível "Melhorias e ajustes do
sistema"), pelo hub Utilitários e, no celular, pelo item "Novidades" da barra
inferior. O manual (cartão "ERP Core & Dashboard") manda ver as novidades em
Utilitários → Melhorias e Ajustes.

**Filtros [visto no texto]:** "De" e "Até" (datas); "Tipo" (Todos, Novo
recurso, Melhoria, Ajuste, Correção); "Módulo"; "Busca"; botão "Filtrar". Não
foi confirmado se "Módulo" e "Busca" são texto livre ou lista, nem se há
paginação.

**Lista (cartões em linha do tempo):** cada cartão tem selo do tipo (Correção,
Melhoria, Ajuste); etiqueta do módulo (vistos: INTERFACE, CADASTRO, PDV,
SISTEMA, PESSOA, FISCAL); versão no formato ano.mês (v2026.10); data e autor
(todos "03/10/2026 · MIGRAÇÃO"); título e descrição, tudo em maiúsculas.

**Campos do registro [visto no detalhe do log, 2.10]:** `id`, `id_empresa`,
`tipo` (ex.: `correcao`), `modulo`, `titulo`, `descricao`, `versao`, `autor`,
`status`, `data`, `data_hora`.

**Comportamento:**

- Na primeira visita havia 13 registros, todos de 03/10/2026, entre 08:58 e
  11:24. No fim da sessão o log já mostrava 15 (dois entraram às 11:33 e às
  11:36). A Olímpia publica várias mudanças por dia, gravadas pelo próprio
  sistema a cada atualização [visto/deduzido].
- Para o cliente, a tela é só de leitura. Não há botão para sugerir melhoria,
  votar ou comentar [visto]. Não é um canal de pedidos dos clientes.

**O que as 13 entradas revelam do produto (resumo):**

- **Cadastro público (autoatendimento), 7 entradas:** validação por código de
  uso único (OTP), primeiro por e-mail (SMTP) e depois por WhatsApp. O
  telefone é validado como celular brasileiro, com +55, e aceito com ou sem o
  nono dígito. Dá para editar os contatos e reenviar o código em cada etapa. O
  WhatsApp sai pela API do "Olimpia Atendimentos" e pelo hub "Hermes".
- **Implantação:** ao contratar um plano pago, é criada uma fatura de
  implantação com o mesmo valor da primeira mensalidade, e a operação fica
  bloqueada até ela ser paga (ver 2.6).
- **Hub de WhatsApp "Hermes":** usa qualquer linha conectada, alterna entre
  elas e, se uma cair, passa para outra sozinho. (Na tela do Advisor, "Hermes"
  é o nome do assistente de uso do ERP; ver [17](17-consultoria-ia.md).)
- **Olimpia Bridge:** converte o PDF da NFC-e para ESC/POS (detalhe no
  [17](17-consultoria-ia.md)).
- **Super Admin:** existe uma tela interna da Olímpia que lista os clientes
  (tenants) pela data de instalação.
- **Produtor rural (fiscal):** se o cliente estiver marcado como produtor
  rural, a NF-e vai com ele como não contribuinte e consumidor final, mantendo
  a inscrição estadual. A marcação vale nas vendas, nas OS e nas entradas e
  saídas manuais (regra fiscal; ver [13](13-fiscal.md)).

### 2.10 `/sistema-log-alteracoes` — Log de Alterações [visto]

**Objetivo:** auditoria do sistema web (do cliente, não histórico de versões):
inclusões, alterações, inativações e outras ações, com o antes e o depois de
cada registro.

**Filtros:**

| Campo | Tipo | Padrão / opções |
| --- | --- | --- |
| De | data | hoje menos 7 dias (26/09/2026) |
| Até | data | hoje |
| Módulo | texto livre | exemplo no campo: "Produto" |
| Tabela | texto livre | exemplo no campo: "produto" |
| Ação | lista | Todas; Inclusão (`create`); Alteração (`update`); Estoque no cadastro (`ajuste_estoque_cadastro`); Inativação (`inactivate`); Exclusão (`delete`); Lançamento (`lancamento`); Baixa (`baixa`) |
| ID | texto | número do log |

Botão "Filtrar". Nenhum campo obrigatório. Não há filtro por usuário nem botão
de exportar nesta tela.

**Colunas:** ID, Data/Hora, Ação, Módulo, Registro (ID do registro alterado),
Descrição, Usuário, Ver (ícone que abre o detalhe).

**Dados desta conta:** 15 linhas, todas "Inclusão" do módulo `SISTEMAMELHORIA`
(uma por entrada das Novidades), com usuário "—". Com a data inicial recuada
para 01/01/2025, não apareceu mais nada: não há outras alterações auditadas
nesta conta.

#### `/sistema-log-alteracoes/{id}` — Detalhe do log [visto]

Título "Log de alteração #N", a descrição e o botão "Voltar". Campos:

- Data/Hora (com segundos), Ação, Módulo, Tabela (ex.: `SISTEMA_MELHORIA`),
  ID registro;
- Usuário ("WEB" quando foi o próprio sistema), IP (127.0.0.1 quando foi um
  processo do servidor), Rota (endereço da página que fez a mudança; aqui,
  "/");
- **Antes:** o registro em JSON (`null` numa inclusão);
- **Depois:** o registro completo em JSON.

**Regras [deduzido]:**

- A auditoria é genérica, por tabela: guarda uma foto do registro antes e
  depois, em JSON.
- As ações "Estoque no cadastro", "Lançamento" e "Baixa" mostram que também
  são auditados o ajuste de estoque feito na ficha do produto e os lançamentos
  e baixas do financeiro.
- A Central de relatórios tem o relatório "Auditoria de alterações"
  (`auditoria-alteracoes`, 4 filtros, PDF, Excel e CSV, só na Central): é o
  mesmo log em forma exportável (ver [19](19-relatorios-vendas-financeiro.md)).

### 2.11 `/comissoes/metas` — Controle de comissão por metas [visto]

**Objetivo:** segundo o subtítulo, a tela apura as vendas finalizadas, dá
prêmios por faixa e monta o ranking dos colaboradores. Fica no menu
Relatórios, grupo Comissões (primeiro item), mas é um cadastro com apuração.

**Avisos fixos na faixa do título:**

- as faixas padrão seguem "a planilha de agosto";
- "Financeiro e Folha" são definidos no cadastro da empresa.

**Formulário "Nova meta" (POST `/comissoes/metas`):**

| Campo | Nome técnico | Tipo | Obrigatório | Valor que já vem preenchido |
| --- | --- | --- | --- | --- |
| Nome | `nome` | texto | sim | "Meta de vendas" |
| Início | `data_ini` | data | sim | 1º dia do mês (01/10/2026) |
| Fim | `data_fim` | data | sim | último dia do mês (31/10/2026) |
| Prêmio do 1º lugar | `premio_1` | número com centavos (passo 0,01) | não | 300 |
| Prêmio do 2º lugar | `premio_2` | número com centavos (passo 0,01) | não | 200 |
| Prêmio do 3º lugar | `premio_3` | número com centavos (passo 0,01) | não | 100 |

Os três prêmios ficam numa linha só, sob o rótulo "Prêmios do ranking (1º, 2º
e 3º)". Botão "Criar meta" (não clicado). Não há campo para faixas,
colaboradores, produtos, lojas ou tipo de meta.

**Lista "Metas cadastradas":** colunas Meta, Período, Status, Faturamento,
Total prêmios e uma coluna de ações sem título. Vazia ("Nenhuma meta
criada").

**Ligação com a empresa [visto no cadastro da empresa]:** a aba Parâmetros de
`/empresa/{id}` tem o grupo "Comissões por metas", com 2 opções: ao fechar a
meta, lançar o prêmio na folha (provento) e/ou gerar um título a pagar por
colaborador (ver [08](08-pessoas-empresa-acessos.md)). É a isto que o aviso
"Financeiro e Folha" se refere [deduzido].

**Funcionamento provável [a verificar, nada pôde ser visto]:**

- uma meta é só um período com nome e três prêmios de ranking;
- o sistema soma o faturamento das vendas finalizadas (status 1) de cada
  colaborador no período;
- aplica as "faixas padrão" (fixas, vindas da planilha de um cliente) para
  calcular o prêmio de cada um;
- os três primeiros do ranking ganham os prêmios do 1º, do 2º e do 3º lugar;
- ao fechar a meta, o prêmio vai para a folha e/ou para contas a pagar,
  conforme os parâmetros da empresa.

**Leitura de negócio [deduzido]:** a frase sobre "a planilha de agosto" mostra
que a função foi feita sob medida para um cliente e liberada para todos, sem
as faixas poderem ser configuradas na criação.

Os relatórios de comissão (7, na categoria "Comissões" da Central) ficam no
[20](20-relatorios-comissoes-os.md).

## 3. Fluxos de ponta a ponta

1. **Balança de pesagem.** Configurar a etiqueta da balança (modelo, peso ou
   valor, dígitos) → o PDV passa a decodificar o código de barras pesado. Para
   a carga de itens: escolher o modelo (MGV5, MGV7, Filizola, Urano), exportar
   o ZIP e importá-lo no software da balança.
2. **Hardware local:** escolher o modo na aba Olimpia Bridge (desligado,
   Bridge ou automático); pareamento e testes em `/bridge` (fluxo completo no
   [17](17-consultoria-ia.md)).
3. **Campos obrigatórios.** O administrador liga os campos que quer obrigar →
   salvar um cliente ou produto (completo ou rápido, na venda) é bloqueado se
   esses campos estiverem vazios.
4. **Entrada do cliente na plataforma e aceite dos termos.** Cadastro público
   com código por e-mail e depois por WhatsApp → contratação de plano pago →
   fatura de implantação (do valor da primeira mensalidade) que bloqueia a
   operação até ser paga → no acesso, aceite eletrônico dos termos (marcar "li
   e aceito" e confirmar) → o sistema grava empresa, CNPJ da época, usuário,
   data e hora, IP, navegador, versão, texto integral e hash → consulta em
   `/meus-termos`, com detalhe e comprovante para impressão → uma versão nova
   dos termos pode exigir novo aceite, guardado como outra linha. [cadastro e
   implantação vistos nas Novidades; o resto, no aceite; o momento exato do
   pedido de aceite está a verificar]
5. **Assinatura por créditos.** O plano define o valor → cada pagamento soma
   30 dias → os créditos descem um por dia e aparece um alerta com os dias
   restantes → "Pagar próxima mensalidade" gera uma cobrança PIX ou boleto
   adiantada, que aparece em "Minhas faturas" → para trocar de plano (só o
   administrador): um plano pago exige pagamento imediato; um trial ou
   gratuito vale na hora. Em atraso, os termos preveem restrição, suspensão e
   cancelamento.
6. **Publicação de novidades.** A Olímpia atualiza o sistema → um registro
   entra automaticamente na tabela de melhorias (autor "MIGRAÇÃO") → aparece
   em "Novidades" → o mesmo registro aparece no log de auditoria como
   "Inclusão", feita pelo usuário "WEB" a partir de 127.0.0.1
   [visto/deduzido].
7. **Auditoria.** Uma inclusão, alteração, inativação, exclusão, ajuste de
   estoque no cadastro, lançamento ou baixa → uma linha no log, com antes e
   depois em JSON, usuário, IP e rota → consulta por período, módulo, tabela,
   ação ou ID → detalhe → a mesma base pode ser exportada pelo relatório
   "Auditoria de alterações" [visto/deduzido].
8. **Comissão por metas.** Criar a meta (nome, período, prêmios do 1º ao 3º
   lugar) → o sistema soma as vendas finalizadas de cada colaborador no
   período → aplica as faixas padrão → monta o ranking → calcula o total de
   prêmios (coluna da lista) → ao fechar, lança o prêmio na folha e/ou em
   contas a pagar, conforme os parâmetros da empresa [só o formulário, a lista
   vazia e os nomes dos parâmetros foram vistos; o resto está a verificar].

## 4. Entidades e relações

| Entidade | Campos | Relações |
| --- | --- | --- |
| **Parâmetros INI** | ~60 chaves (layouts, impressoras, balança, etiqueta, gaveta, cores, TEF, leitor, busca preço, modo Bridge, skin, travar login) | compartilhado com o cliente desktop Delphi; referencia empresa ("loja travada"); escopo empresa/terminal a verificar |
| **Campo obrigatório** | entidade (cliente, produto), campo, obrigatório (bool) | valida cadastros de cliente e produto (inclusive o rápido) |
| **Plano** | id, nome, descrição, valor mensal, tipo (pago, trial, gratuito), limite de usuários, módulos | N:N com módulos |
| **Módulo** | nome (36 no Full; MCP fora) | habilita rotas; rota fora do plano mostra o bloqueio |
| **Assinatura** | tenant, plano, dia de pagamento, valor, créditos até, dias restantes | tem faturas |
| **Mensalidade / fatura** | referência, vencimento, valor, status, forma (PIX, boleto); fatura de implantação | pertence à assinatura |
| **TermoUso (versão)** | versão, data de publicação, texto em Markdown, hash do modelo, vigente (sim/não) | 1:N AceiteTermo |
| **AceiteTermo** | UUID, empresa (razão social e fantasia), CNPJ na época, código da empresa, usuário (ID, nome, login), data e hora, IP, navegador/dispositivo, versão, texto exato aceito (cópia), SHA-256, status (ACEITO, vigente) | N:1 TermoUso; N:1 Empresa; N:1 Usuário |
| **SistemaMelhoria (Novidade)** | id, id_empresa, tipo (novo recurso, melhoria, ajuste, correção), módulo, título, descrição, versão (ano.mês), autor, status, data, data_hora (UTC) | gera LogAlteracao (inclusão) |
| **LogAlteracao** | id, data e hora, ação (create, update, ajuste_estoque_cadastro, inactivate, delete, lancamento, baixa), módulo, tabela, ID do registro, descrição, usuário, IP, rota, antes (JSON), depois (JSON) | aponta para qualquer tabela auditada (genérico); N:1 Usuário |
| **MetaComissao** | nome, data_ini, data_fim, premio_1, premio_2, premio_3, status, faturamento apurado, total de prêmios | 1:N resultado por colaborador [a verificar]; usa FaixaComissao padrão; lê Venda (status 1); prêmio vai à folha e/ou a contas a pagar conforme parâmetros da Empresa |
| **FaixaComissao (padrão)** | faixas de prêmio "da planilha de agosto" (valores não vistos) | N:1 MetaComissao ou fixa no sistema [a verificar] |

## 5. Integrações

| Integração | Onde aparece | Estado |
| --- | --- | --- |
| **Web Serial API** (Chrome/Edge) | balança no PDV web quando o Bridge está desligado | nota da tela |
| **Balanças** Filizola, Toledo (MGV5, MGV7) e Urano (S, URF32) | carga de itens por arquivo; etiqueta com peso ou valor no código de barras | campos vistos; exportação não executada |
| **TEF Dial** (gerenciador padrão) | aba PDV | campos vistos |
| **Terminal consulta-preço** | arquivo de busca de preço | botão não clicado |
| **SEFAZ / NFC-e** | reenvio automático, layouts DANFE/DANFC-e, impressora própria para NFC-e | campos vistos |
| **Cliente desktop Delphi** (ACBr: ACBrBAL, ACBrLCB; skins DevExpress) | compartilha `parametros_ini` | visto |
| **Olimpia Bridge** | aba Olimpia Bridge (modo, impressora, downloads) | ver [17](17-consultoria-ia.md) |
| **Cobrança da assinatura** (PIX e boleto) | `/minha-assinatura`, `/meu-plano` | gateway não identificado |
| **E-mail (SMTP) e WhatsApp** ("Olimpia Atendimentos", hub "Hermes") | códigos de validação do cadastro público | visto nas Novidades |
| **Impressão do navegador** | comprovante do aceite | visto |
| **Folha e contas a pagar** | prêmio da comissão por metas (parâmetros da empresa) | nomes dos parâmetros vistos |

## 6. Oportunidades de UX

1. **Hub de Parâmetros com cartões sem descrição.** Só ícone e rótulo em
   maiúsculas; nomes como "Olimpia Bridge" e "MCP / Conector IA" não dizem ao
   comerciante para que servem. [proposta] uma frase por cartão dizendo o que
   resolve e um estado ("ligado", "falta configurar").
2. **Módulo misturado.** Ajustes do sistema, conta com o fornecedor, termos e
   integrações técnicas ficam no mesmo hub. [proposta] separar
   "Configurações", "Minha conta e plano" e "Integrações".
3. **"Mensalidades" em três lugares com destinos diferentes** (hub do módulo,
   cartão do hub de Parâmetros e atalho lateral, os dois últimos saltando o
   hub).
4. **Parâmetros mistura desktop e web.** Skin DevExpress, "backup ao fechar o
   sistema", testes ACBr e portas COM e LPT convivem com o PDV web; há jargão
   (Time sleep, G.P., CHQ em gerencial, handshaking). [proposta] parâmetros
   **por terminal**, com assistente ("conecte a balança → detectamos") e lista
   de impressoras vinda do agente, não uma lista fixa.
5. **O "Fechar" de Parâmetros está quebrado** (aponta para um endpoint JSON de
   polling). Nunca usar "URL anterior" quando há pedidos em segundo plano.
6. **Dois prazos que confundem.** A assinatura mostra "dia de pagamento 05" e
   também "válido até 17/10", porque o modelo é de créditos. [proposta] um
   único conceito ("seu acesso vai até X; renove") com renovação automática
   opcional.
7. **Troca de plano com `confirm()` nativo**, mostrando só a *quantidade* de
   módulos por plano, sem tabela que compare o que cada um inclui.
8. **Termos: boa base com acabamento fraco.** A trilha de prova é boa e vale
   copiar (versão, cópia do texto aceito, hash, IP, navegador e "CNPJ na
   época"). Mas a impressão sai em Markdown cru, os dois hashes diferentes não
   são explicados, não há PDF para baixar e o CNPJ aparece sem máscara.
9. **Novidades técnicas demais.** Tudo em maiúsculas, com nomes de classes e
   campos, detalhes internos (tela de Super Admin, código Delphi) e várias
   entradas por dia. [proposta] notas de versão curtas, em linguagem simples
   ("o que muda para você"), só dos módulos que o cliente usa, com selo de
   "novo" no menu. Vale copiar o botão "Novidades" no cabeçalho e os filtros
   por tipo e módulo.
10. **Log de alterações para técnico.** Para filtrar é preciso saber o nome
    interno do módulo ou da tabela (`SISTEMAMELHORIA`, `SISTEMA_MELHORIA`); o
    antes e o depois aparecem em JSON cru; não há filtro por usuário nem
    exportação na tela. [proposta] mostrar só o que mudou ("campo: antes →
    depois"), filtros por usuário e por tipo de registro em listas, e destaque
    para ações sensíveis (cancelamento, desconto, sangria, ajuste de estoque).
11. **Um módulo inteiro para dois links.** "Utilitários" só tem Novidades e
    Log. [proposta] Novidades no cabeçalho e Auditoria em Configurações →
    Segurança.
12. **Comissão por metas pouco transparente.** As faixas não aparecem antes
    de criar a meta e vêm "da planilha de agosto" de um cliente; o prêmio de
    ranking vale só para os 3 primeiros; a configuração fica longe
    ("Financeiro e Folha" no cadastro da empresa). [proposta] mostrar e editar
    as faixas na própria meta, simular antes de salvar, barra de progresso por
    vendedor e lançamento do prêmio no financeiro com um clique.
13. **Boas práticas para copiar:** aceite de termos com UUID, hash SHA-256, IP
    e conteúdo exato da versão; campos obrigatórios configuráveis em pílulas,
    com ajuda sobre a exigência fiscal e sem poder desligar os campos
    essenciais.

## 7. Pendências

1. **Recusas da trava do Claude Code** (modo automático, motivo "Third-Party
   Attack"; não foi problema de credencial; nada foi gravado nem clicado no
   ERP): numa primeira passagem, a navegação para `/parametros-sistema` foi
   recusada (lida numa passagem posterior); a leitura por script do filtro de
   `/sistema-melhorias` foi recusada; uma segunda consulta ao catálogo de menu
   guardado na sessão do navegador (à procura do manual e de telas sobre
   prêmios e comissões) foi recusada. Completar depende de o dono da conta
   autorizar a leitura.
2. **`/parametros-sistema`:** se `parametros_ini` é por empresa ou por
   terminal; se exige permissão própria; se as mudanças entram no log de
   alterações.
3. **Campos obrigatórios:** se a regra vale também em importações e na API;
   se pode variar por usuário ou grupo.
4. **Assinatura:** "Pagar próxima mensalidade", "Contratar plano selecionado",
   as faturas (vazias) e o gateway PIX/boleto ficaram por observar. A divisão
   dos módulos por plano é uma hipótese baseada na ordem da lista. Planos de
   id 1 e 3 não vistos.
5. **Termos de uso:** a tela onde o aceite é pedido e o fluxo de uma versão
   nova não foram vistos (a conta já tinha aceitado a versão vigente).
6. **`/sistema-melhorias`:** tipo dos campos "Módulo" e "Busca", paginação e
   links da tela não confirmados.
7. **Log de alterações:** não há alterações de negócio nesta conta. Não deu
   para ver uma "Alteração" com antes e depois preenchidos, nem as ações de
   estoque, lançamento e baixa.
8. **Comissão por metas:** sem metas cadastradas. Não foram vistos as faixas,
   o detalhe de uma meta, os estados, a apuração, o ranking nem o lançamento
   do prêmio. Também falta saber se há metas por equipe ou empresa e por
   produto ou categoria; o percentual de comissão por venda ou OS é
   configurado noutros lugares (ver [08](08-pessoas-empresa-acessos.md) e
   [20](20-relatorios-comissoes-os.md)).
9. **Não clicados:** "Gravar" e todos os testes/exportações de
   `/parametros-sistema` (serial, gaveta, exportar balança, busca preço),
   "Salvar cliente/produto", "Pagar próxima mensalidade", "Contratar plano
   selecionado", "Imprimir" do comprovante, "Criar meta", estrelas "Adicionar
   aos atalhos". Não abertos: os atalhos `/fiscal-series`, `/nfce` e
   `/empresa/1` do rodapé de Parâmetros (outros grupos).
10. **Nota de operação:** numa passagem, o navegador embutido estava com 8 abas
    abertas por outras sessões; a primeira tentativa de criar uma aba falhou
    por limite. Rodar muitos grupos em paralelo pode esbarrar nesse limite.
    Dados omitidos de propósito: CNPJ da conta, IP e navegador de quem aceitou
    os termos, UUID e hashes do aceite; um token anti-CSRF que veio sem
    intenção numa listagem de scripts do detalhe do aceite não foi registrado
    nem usado.

## 8. Sub-rotas descobertas

| Rota / endereço | O que é | Estado |
| --- | --- | --- |
| `/parametros-sistema/serial` (POST) | ativar, desativar e ler balança e leitor (`acao`) | não acionada |
| `/parametros-sistema/exportar-balanca` (POST) | ZIP de carga da balança | não acionada |
| `/parametros-sistema/testar-gaveta` (POST) | teste de gaveta | não acionada |
| `/parametros-sistema/busca-preco` (POST) | arquivo do terminal consulta-preço | não acionada |
| `/minha-assinatura/proxima/pagar` (POST) | gerar cobrança adiantada | não acionada |
| `/meu-plano` (PATCH, `plano_id`) | trocar plano | não acionada |
| `/meus-termos/{uuid}` | detalhe do aceite | aberta |
| `/meus-termos/{uuid}/imprimir` | comprovante para impressão | lida pelo HTML |
| `/sistema-log-alteracoes/{id}` | detalhe de um registro de auditoria | aberta (#13) |
| `/comissoes/metas` (POST) | criar meta | não acionada |
