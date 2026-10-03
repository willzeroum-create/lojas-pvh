# 96 — Lacunas, lote 7: empresa e filiais, plano de contas, cadastros de logística, checklist de cadastros e estoque (entradas e saídas) — ERP Olímpia

> **Estado: explorado (12 de 12 rotas da lista), mais 5 sub-rotas do estoque.**
> Data: 2026-10-03. Conta de teste "Boi Criolo" (plano Full), sessão já aberta
> no navegador embutido, perfil ADMIN.
>
> - As 12 rotas abriram e foram lidas: lista, filtros, formulário "Novo/Inserir"
>   e, quando havia registro, a tela de edição (só para leitura).
> - Também foram lidas sub-rotas do mesmo módulo de estoque:
>   `/manifestacao-nfe`, `/transferencias`, `/balancos`, `/estoque-log` e
>   `/troca-produto`.
> - **A exploração parou na tela de troca de produto.** Ao tentar ler a lógica
>   dessa tela, a trava de segurança do Claude Code (o classificador do modo
>   automático) recusou, com o motivo "Third-Party Attack". Depois disso não
>   houve nenhuma outra ação no ERP, e a aba foi fechada.
> - **Nada foi gravado, enviado, importado ou alterado.** O conteúdo dos campos
>   de senha, token e chave não foi lido.
> - A conta de teste quase não tem dados: nenhuma entrada, saída, zona, bairro,
>   rota, veículo ou conta contábil, e o lookup de produtos volta vazio. Por
>   isso as telas de detalhe dos documentos (conferir, concluir, estornar) não
>   puderam ser vistas.
>
> Marcação usada: **[visto]** apareceu na tela ou na estrutura da página
> carregada (campos escondidos, opções de listas, scripts da própria página);
> **[deduzido]** é conclusão direta do que foi visto; **[a verificar]** é
> hipótese ou conhecimento geral, não confirmado no ERP.

## Em palavras simples

1. **Desta vez as telas abriram.** As 12 rotas do lote foram lidas, já logadas.
2. **"Empresa" é o centro de configuração do sistema inteiro.** Além do cadastro
   da filial, é ali que ficam o certificado digital, as integrações com bancos
   (boleto e PIX) e cerca de **420 parâmetros** que ligam e desligam regras de
   vendas, caixa, PDV, fiscal, estoque, OS e outros módulos.
3. **O estoque trabalha com documentos.** Entrada, saída, transferência e
   balanço nascem como "Pendente" e depois passam a "Concluído" ou
   "Cancelado". O saldo pode ser separado por local (Geral, Prateleira, Reserva,
   Entrega futura) e por grade (tamanho/cor).
4. **A compra por XML conversa com a SEFAZ.** O sistema busca as notas emitidas
   contra o CNPJ a cada 5 minutos, faz a manifestação do destinatário e
   transforma o XML em entrada de estoque.
5. **Os cadastros de logística são simples.** Zona → bairro (com tarifa de
   entrega) e zona → rota (com valor). O bairro não está ligado a uma cidade.
6. **A trava de segurança parou o trabalho no fim** (troca de produto). O que
   faltou está em [Pendências](#8-pendências).

## O que aconteceu (registro técnico)

- Aba própria criada no navegador embutido (`tab-46`). A aba do usuário
  (`tab-1`) não foi tocada. A `tab-46` foi fechada no fim.
- Navegação por URL e leitura do texto e da estrutura das páginas.
- Cliques feitos (todos sem efeito gravado):
  - "Preencher manualmente sem consultar CNPJ", que só mostra o formulário;
  - lupas de pesquisa (abrem o modal de lookup), fechadas com Esc;
  - aba "Parâmetros" do cadastro da empresa;
  - campo de pesquisa de produto da entrada manual.
- `/entradas-xml/relatorio-geral` é um PDF que abre em nova aba. A navegação
  falhou ("denied or failed") e não foi repetida.
- **Recusa:** leitura, por script, da lógica da tela `/troca-produto` (cálculo
  da diferença entre devolvido e entregue). A recusa vale para o objetivo, e
  por isso a exploração parou aí, sem tentar outro caminho.
- Botões **não** clicados: Salvar, Salvar filial, Salvar integração bancária,
  Testar conexão, Testar geração QR Code, Importar arquivo, Sincronizar agora,
  Consultar SEFAZ, Zerar NSU, Desligar consulta automática, Ligar importação
  auto, Manifestar, Gravar (lançamento contábil), Confirmar troca, Adicionar aos
  atalhos.

---

## 1. Visão geral

### 1.1 Cadastros-base ("Empresa & Rotas")

- **Empresa/filiais** [visto]: várias empresas (matriz e filiais) no mesmo
  ambiente. **Clientes e produtos são compartilhados** entre as filiais;
  **financeiro e vendas filtram pela empresa ativa**, escolhida no topo da tela.
- **Plano de contas** [visto]: árvore com código automático em blocos de 3
  dígitos e uma tela de lançamentos (crédito ou débito) por conta.
- **Municípios** [visto]: tabela com código IBGE, país e UF, usada nos lookups
  de empresa, pessoas e veículos.
- **Zonas, bairros e rotas** [visto]: base de entrega e de visitas. O bairro tem
  tarifa e zona. A rota tem zona, região (texto livre) e valor.
- **Veículos** [visto]: cadastro pensado para o MDF-e (tipo rodoviário,
  carroceria, carreta, proprietário com RNTRC).
- **Checklist de cadastros** [visto]: painel interno da migração do sistema
  antigo (Delphi) para a web. Mostra o mapa dos 26 cadastros e as rotas de cada
  um.

### 1.2 Estoque

- **Lançador do módulo** com três blocos: Movimentações, Inventário & Controle,
  Expedição & Vendas.
- **Documentos de movimento** [visto]: entrada por XML, entrada manual, saída
  manual, troca de produto, transferência entre filiais, balanço. Todos com
  status Pendente, Concluído ou Cancelado (a troca é confirmada direto).
- **Operação fiscal** [visto]: entradas e saídas usam a **mesma lista de 41
  operações** (compra, devolução, bonificação, perda, remessa, transferência...).
  É ela que diz o "porquê" do movimento.
- **Locais de estoque** [visto no script da página]: G = Geral, P = Prateleira,
  R = Reserva, E = Entrega futura. As colunas de local e de grade só aparecem se
  a empresa usar prateleira ou grade (parâmetros).
- **Histórico (log)** [visto]: cada movimento guarda o saldo antes e depois e o
  documento de origem (entrada, saída, OS, venda, balanço).
- **Origem do sistema** [visto]: quase toda tela mostra o nome do formulário do
  sistema desktop antigo (`FrmEntrada`, `FrmSaida_Manual`, `FrmBalanco`...).

---

## 2. Telas

### 2.1 `/empresa` — Empresas / Filiais [visto]

- **Objetivo:** listar as empresas do ambiente (matriz e filiais).
- **Texto de apoio:** clientes e produtos são compartilhados; financeiro e
  vendas filtram pela empresa ativa no topo.
- **Ações:** "Nova filial" (`/empresa/nova`); "Alterar" em cada linha
  (`/empresa/{id}`). **Não há botão de excluir.**
- **Filtro:** um só campo, "Razão, fantasia ou CNPJ", e o botão Pesquisar.
- **Colunas:** ID, Fantasia, Razão social, CNPJ, Município, Tipo (selo
  "Matriz"), Ações.
- **Barra "Dados complementares"** (rodapé fixo): fantasia, razão, CNPJ,
  município, tipo e **"Ativa na sessão: Sim/Não"**, com o link Alterar.
- **Dados da conta:** 1 empresa (ID 1, Boi Criolo, Matriz, Porto Velho/RO). O
  CNPJ foi omitido aqui.

### 2.2 `/empresa/nova` — Nova filial [visto]

**Passo 1: consulta do CNPJ**

- Campo "CNPJ da filial" com máscara. A consulta dispara sozinha quando os 14
  dígitos são digitados, ou com Enter, ou com o botão "Buscar".
- [visto no script] A consulta vai a um endpoint do próprio ERP
  (`/empresa/consulta/cnpj/{cnpj}`) e preenche: razão social, fantasia, CNPJ,
  telefone, e-mail, CEP, endereço, número, bairro, CNAE, município e inscrição
  estadual. A mensagem de sucesso diz que os dados vieram da Receita Federal.
- **Várias inscrições estaduais:** abre um modal para escolher uma. Cada opção
  mostra a IE, a UF e se está ativa.
- Erros previstos: CNPJ com menos de 14 dígitos, CNPJ não encontrado, falha na
  consulta.
- Link "Preencher manualmente sem consultar CNPJ" e botão "Outro CNPJ" (limpa
  tudo e volta ao passo 1).

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
- **Lookup de município:** colunas Código, Descrição, IBGE e UF; 5.426
  registros, 15 por página.

### 2.3 `/empresa/{id}` — Cadastro da empresa (4 abas) [visto]

Cabeçalho "Empresa #1", com a nota "equivalente a FrmEmpresa", o selo "Matriz"
e o link "Todas as filiais". São quatro abas: **Cadastro**, **Logo / QR PIX**,
**Integração Bancária** e **Parâmetros**.

[visto na estrutura] Há dois formulários: o principal (envio com arquivos,
botão "Salvar") e outro só para a Integração Bancária (botão "Salvar
integração bancária"). [deduzido] O "Salvar" principal grava juntos Cadastro,
Logo e Parâmetros.

#### Aba Cadastro

Os mesmos campos da nova filial, mais dois:

- **Ramo — Categoria:** Comércio, Serviços, Saúde, Educação, Agronegócio,
  Construção Civil.
- **Ramo — Subcategoria** (depende da categoria) [visto no script]:
  - Comércio: Supermercado, Farmácia, Açougue, Casa de Carnes, Mercado, Loja de
    Roupas, Material de Construção, Auto Peças, Revenda/Compra e Venda de
    Veículos, Outros.
  - Serviços: Oficina Mecânica, Restaurante, Contabilidade, Lavanderia, Outros.
  - Saúde: Clínica Médica, Odontologia, Farmácia de Manipulação, Outros.
  - Educação: Escola, Curso Livre, Outros.
  - Agronegócio: Fazenda, Cooperativa, Outros.
  - Construção Civil: Construtora, Empreiteira, Outros.
- [a verificar] Se o ramo muda menus, parâmetros-padrão ou relatórios. Nada na
  tela indica isso.

#### Aba Logo / QR PIX (em outras telas chamada "Logo / Certificado")

| Bloco | Campos | O que a tela explica |
| --- | --- | --- |
| Logo da empresa | arquivo de imagem | guardada no banco, como binário |
| QR Code PIX | imagem do QR estático + "Chave PIX" (CPF, CNPJ, e-mail, telefone ou chave aleatória) | os dois saem na impressão da venda |
| Certificado digital A1 | arquivo .pfx + senha | certificado **único da empresa**, usado em NF-e, NFC-e, MDF-e, CT-e, NFS-e e nos gateways bancários; a senha fica gravada no banco |

- [visto no script] Existe uma ação "Baixar certificado A1", que pede a senha
  do .pfx antes de liberar o download.
- [visto] Os textos de ajuda mostram nomes internos de tabela e coluna. Isso
  revela que o banco é PostgreSQL (tipo `bytea`).

#### Aba Integração Bancária

Três blocos: "Gateway boleto / remessa", "Gateway PIX (caixa / PDV)" e "Teste
PIX — QR Code".

- **Provedores de boleto** (16, mais "Não utilizar"): Tecnospeed PlugBoleto,
  CredSIS Cobrança (SOAP), Banco do Brasil, Itaú, Bradesco, Santander, Caixa
  Econômica, Sicredi, Sicoob, Banrisul, Banco Inter, Efí (Gerencianet), Asaas,
  C6 Bank, BTG Pactual, CNAB legado (arquivo).
- **Provedores de PIX** (12, mais "Não utilizar"): Tecnospeed PlugBoleto, Itaú,
  Bradesco, Santander, Caixa, Sicredi, Sicoob, Banco Inter, Efí, Asaas, C6 Bank,
  BTG Pactual.
- **Campos do boleto** (aparecem conforme o provedor) [visto na estrutura]:
  - cedente (lista, padrão "Padrão") e conta bancária (opcional);
  - Token/API Key, Client ID, Client Secret e x-api-key (token do portal);
  - convênio (CredSIS) e código de acesso do internet banking (Sicredi);
  - layout, formato (PDF ou HTML), layout da remessa (API bancária, CNAB 240
    ou CNAB 400);
  - ambiente (Produção ou Validação/sandbox; para o C6, Produção ou Sandbox);
  - Customer ID do Asaas (opcional), URL base (opcional) e timeout em segundos.
- **Campos do PIX:**
  - cedente e conta bancária;
  - chave PIX de recebimento;
  - Token/API Key, Client ID e Client Secret;
  - ambiente (C6), URL base e timeout.
- **Teste PIX:** campo numérico (valor do teste [deduzido]), botão "Testar
  geração QR Code" e saída "PIX copia e cola" com o botão Copiar.
- **Regras explicadas na tela** (resumo):
  - Sicredi: API híbrida. O boleto é registrado e impresso na hora, e a baixa
    automática consulta os pagamentos no banco a cada poucos minutos.
  - CredSIS: API SOAP, com registro online e consulta de liquidação.
  - Bancos "institucionais" exigem o certificado A1.
  - Para o PIX em produção, é preciso marcar "Gerar QRCode PIX" na forma de
    pagamento desejada.
  - Comece em sandbox e só depois passe para produção.
  - A cobrança de teste não deve ser paga.
- Botões "Testar conexão (autenticação)" e "Salvar integração bancária": **não
  clicados**.

#### Aba Parâmetros (cerca de 420 opções)

Instrução no topo: marcado = Sim, desmarcado = Não. Os grupos ficam em botões
tipo "pílula", e cada opção é um cartão com caixa de seleção. Muitas opções têm
como rótulo **o nome cru da coluna** do banco (por exemplo, "Venda bloq frete",
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
  - Momento da baixa de estoque: na finalização da venda ou no balcão de
    entrega.
  - Tipo de comissão: nenhuma, por produto, por vendedor, por recebimento, por
    forma de pagamento ou por vendedor/produtos. Na comissão por recebimento,
    a base é a forma de pagamento, o vendedor ou o produto.
  - Ordem dos itens na impressão (ID, descrição ou item), separada para
    romaneio/separação, espelho, nota fiscal, orçamento e venda.
  - Desconto máximo (%) e controle de desconto por vendedor/usuário: acima do
    limite, pede liberação com senha.
  - Na venda, listar só os clientes do vendedor; vendedor automático a partir
    do cadastro do cliente.
  - Bloquear alterações sensíveis (reabrir venda finalizada, cancelar
    orçamento...).
  - Bloquear venda com estoque negativo e bloquear cliente inadimplente (este
    está ligado na conta).
  - Preços por forma de pagamento, preços de cartão crédito/débito no produto e
    preços por modalidade da venda (loja, retirada...); tabela de preço;
    atacado/varejo (tipo e valor); juros por forma de pagamento.
  - Impressão: canhoto de assinatura, conferência de mercadoria (conferentes),
    ocultar foto, ocultar dados da empresa.
  - Outros: gamificação, gerar boleto automático, tarifa do entregador, limite
    de compra, comissão da plataforma, percentuais de ICMS/ST.
- **Estoque**
  - Controle de lote/validade.
  - Almoxarifado e "estoque prateleira" (são os locais G/P/R/E).
  - A entrada atualiza o preço de compra (ligado) e, opcionalmente, o
    cadastro do produto.
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
  - NFS-e nacional: regime especial (0 a 6), item da lista, código NBS,
    códigos de tributação municipal e nacional, alíquota de ISS, lote, CNAE,
    data de competência.
  - ISS no PDV para **cartório** (assinatura, notas, registro civil, RTD).
  - Simples Nacional: percentuais de aproveitamento de ICMS, PIS e COFINS;
    alíquotas de IRPJ e CSLL.
  - Cerca de 70 opções de impressão do DANFE (NFC-e e NF-e em dobro): preview,
    logo, margens, casas decimais, cópias, impressora, pasta do PDF...
  - Manifestação: ciência automática ao sincronizar (ligada), consulta
    automática DistDFe (ligada), importar XML como entrada automaticamente
    (desligada, e o padrão é desligado).
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
    dentro dos parâmetros, e o conteúdo não foi lido.
- **App Força de Vendas**
  - Listar vendedores no app.
  - Mandar só os clientes do vendedor e só as formas de pagamento do cliente.
  - Usar a tabela de preço do cliente.
  - Incluir produtos com saldo zero (ligado).
- **E-mails:** três contas SMTP separadas (notas, venda, contador), cada uma com
  remetente, host, porta, usuário, senha, autenticação, SSL e TLS. Também:
  e-mail automático da OS, e-mail no fechamento de caixa, resumo de vendas
  semanal e mensal, e dois e-mails da gerência.
- **Inconsistência vista:** aqui "Ciência automática ao sincronizar NF-e" está
  **ligada**, mas a tela de importação de XML mostra "Ciência auto: NÃO" como
  parâmetro da empresa (ver 2.12).

### 2.4 `/plano-contas` — Plano de contas [visto]

**Lista**

- Cabeçalho: "Estrutura hierárquica por código", nota "equivalente a
  FrmPlano_Contas" e o contador "0 conta(s)".
- Ações:
  - "Consultar Lançamentos": abre `/plano-contas/apuracao` já com o mês atual
    (do dia 1 ao último dia).
  - "Nova conta raiz" (`/plano-contas/create?placement=raiz`).
  - "Nova subconta" (`?placement=filho`).
- Filtros:
  - Parâmetro: Descrição, Código ou ID;
  - Valor;
  - Status: Todos, Ativo ou Inativo;
  - Ordem: Código (árvore) ou Descrição;
  - botões Pesquisar e Limpar filtros, e Expandir/Recolher da árvore.
- Colunas: Conta, Código, ID, Ativo, Ações. Lista vazia: "Nenhuma conta
  localizada", com o atalho "Criar primeira conta raiz".

**Formulário "Nova conta do plano"**

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
- [visto no script] Escolher subconta sem conta pai bloqueia o envio e marca o
  campo.
- **Não existem os campos** tipo (receita/despesa), natureza (devedora/credora)
  e conta sintética/analítica [visto: ausentes].

**`/plano-contas/apuracao` — "Consultar / Lançar"** (sub-rota)

- Ações: voltar ao plano, "Novo lançamento" (modal) e "Imprimir"
  (`/plano-contas/apuracao/imprimir?de=&ate=`, não aberto).
- Filtros: De e Até (obrigatórios) e Conta (opcional, lookup).
- Indicadores: contas com movimento, quantidade de lançamentos, total de
  créditos, total de débitos.
- Colunas: ID, Data, Histórico, Vlr Cred, Vlr Deb, Saldo, Ações.
- **Modal "Lançamento":**
  - campos: Conta do plano (lookup, obrigatória), Data (obrigatória), Vlr
    crédito, Vlr débito e Histórico (obrigatório);
  - **regra: informar crédito ou débito, nunca os dois.**
  - Botão "Gravar": **não clicado**.
- O checklist de migração diz que os lançamentos e relatórios do plano "ficam
  no Financeiro". Os parâmetros sugerem que caixa, entradas, OS, saídas e
  financeiro podem pedir ou alimentar uma conta do plano [deduzido dos nomes
  dos parâmetros].

### 2.5 `/municipios` — Municípios [visto]

- Nota "Equivalente a FrmMuncipio" (com o erro de grafia do sistema antigo).
- **Lista:**
  - "Inserir" leva a `/municipios/create`.
  - Filtros: Parâmetro (Descrição ou ID), Valor e Ordem (Descrição ou ID). Não
    há filtro de UF.
  - Colunas: ID, Descrição, País, UF, IBGE, Ações ("Alterar" →
    `/municipios/{id}/edit`).
  - **5.426 registros**, 15 por página (362 páginas). Exemplo: Porto Velho tem
    ID 3713, IBGE 1100205, UF RO.
  - A barra "Dados complementares" mostra ID, descrição, IBGE, país e UF.
- **Formulário (novo e edição):**

| Campo | Tipo | Obrigatório | Limite |
| --- | --- | --- | --- |
| Descrição | texto | sim | 100 |
| Código IBGE | texto | **não** | 10 |
| País | lookup | sim | — |
| UF | lookup | sim | — |

- Botões Salvar e Cancelar. Não há botão de excluir.
- [a verificar]
  - Se a tabela é a mesma para todos os clientes do ERP: editar um município
    afetaria os outros?
  - O IBGE lista cerca de 5.570 municípios, e a base tem 5.426: podem faltar
    municípios.

### 2.6 `/zonas` — Zonas [visto]

- Nota "Equivalente a FrmZona". "Inserir" leva a `/zonas/create`.
- Filtros: Parâmetro (Descrição ou ID), Valor, Status (Todos, Ativo ou Inativo)
  e Ordem.
- Colunas: ID, Descrição, Status, Ações. Lista vazia.
- **Formulário "Novo Zona"** (com o erro de gênero do sistema): Descrição
  (obrigatória, até 100 caracteres) e Status (Ativo ou Inativo).
- **O status já vem marcado como "Inativo"** num registro novo [visto: é a
  opção marcada por padrão]. Provável defeito.
- A zona pode ser criada sem sair da tela, pelo "Cadastrar novo" do lookup (ver
  bairros e o checklist).

### 2.7 `/bairros` — Bairros [visto]

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

### 2.8 `/veiculos` — Veículos [visto]

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

**Aba Proprietário:**

- Nome/razão (60), CPF/CNPJ (18) e IE (14).
- Veículo próprio (Não ou Sim) e estado do proprietário (lookup de UF).
- Tipo do proprietário: TAC agregado, TAC independente ou Outros.
- RNTRC (8).

Também há um campo Observações.

- [deduzido] O proprietário segue o grupo de proprietário do MDF-e (TAC
  agregado/independente, RNTRC).
- [a verificar] Os códigos de tipo rodoviário e de carroceria **não batem** com
  as tabelas oficiais do MDF-e que conheço (tipo rodoviário: Truck, Toco,
  Cavalo mecânico, VAN, Utilitário, Outros; carroceria 03 = Granelera,
  04 = Porta-contêiner, 05 = Sider). Se o código vai direto para o XML, pode
  haver erro.
- [a verificar] A tara aparece só na aba Carreta. O MDF-e pede a tara também do
  veículo de tração.

### 2.9 `/rotas` — Rotas [visto]

- Nota "Equivalente a FrmRomaneio_Rota". "Inserir" leva a `/rotas/create`.
- Filtros: Parâmetro (Descrição ou ID), Valor e Ordem. **Sem filtro de
  status.**
- Colunas: ID, Descrição, Zona, Região, Valor, Ações.
- **Formulário "Novo Rota":**
  - Descrição (obrigatória, até 100);
  - Valor (texto);
  - Região (texto livre, até 50);
  - Zona (lookup).
  - **Não há status.**
- Uso [deduzido, junto com o arquivo 14]: a rota serve ao romaneio de carga e à
  força de vendas (o cliente tem uma rota; o relatório de visitas mede a
  cobertura). "Valor" deve ser frete ou taxa da rota [a verificar].

### 2.10 `/cadastros/checklist` — Checklist da migração de cadastros [visto]

- **O que é:** painel interno da equipe da Olímpia, aberto ao cliente. Acompanha
  a migração dos cadastros do sistema Delphi para a web.
- **Indicadores:** Total 26, Completos 26, Parciais 0, Pendentes 0.
- **"Padrões globais"**, todos marcados como prontos:
  - lookup em modal (pesquisa por ID e descrição);
  - criação rápida dentro do modal, para grupo, subgrupo, fabricante, cor e
    zona;
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

- [deduzido] Duas coisas úteis para nós:
  - O **modelo de permissão é duplo**: as telas são liberadas pelo grupo, e as
    ações operacionais pelo usuário.
  - O cadastro de produto tem uma aba própria de **food/pizza**.

### 2.11 `/dashboard/modulo/estoque` — Lançador do estoque [visto]

| Bloco | Cartão | Rota |
| --- | --- | --- |
| Movimentações | Entrada de XML | `/entradas-xml` |
| Movimentações | Entrada manual | `/entradas-manual` |
| Movimentações | Saída | `/saidas-manual` |
| Movimentações | Troca de produto | `/troca-produto` |
| Movimentações | Transferência | `/transferencias` |
| Inventário & Controle | Balanço | `/balancos` |
| Inventário & Controle | Log estoque | `/estoque-log` |
| Inventário & Controle | Etiquetas | `/etiquetas` |
| Expedição & Vendas | Pedido de venda | `/vendas` |
| Expedição & Vendas | Faturamento de vendas | `/financeiro/faturamento` |
| Expedição & Vendas | Balcão entrega | `/balcao-entrega` |
| Expedição & Vendas | Romaneio de carga | `/romaneios` |

- Cada cartão tem o botão "Adicionar aos atalhos" (fixar no menu lateral).
  **Não clicado.**
- **Não há indicadores:** nem valor em estoque, nem itens abaixo do mínimo, nem
  notas para importar.

### 2.12 `/entradas-xml` — Entrada de XML (NF-e) [visto]

**Lista** (nota "FrmEntrada")

- Ações:
  - "Notas SEFAZ" (`/entradas-xml/create?aba=manifestadas`);
  - "Importar XML" (`/entradas-xml/create`);
  - link "Relatório geral do período" (`/entradas-xml/relatorio-geral`). Não
    abriu no navegador embutido; deve ser um PDF em nova aba, como o da
    entrada manual [deduzido].
- Filtros: De, Até, Status (Todos, Pendente, Concluído, Cancelado) e a busca
  "ID, chave ou fornecedor".
- Colunas: ID, Data, NF, Chave, Fornecedor, Total, Status, Ações. Lista vazia.

**`/entradas-xml/create` — "Importar NF-e (XML)"**

- Links para "Manifestação" (`/manifestacao-nfe`) e "Entradas".
- **Indicadores:**
  - Notas SEFAZ (prontas ou quase prontas);
  - Com XML (podem ser importadas agora);
  - Auto sync: **ON, a cada 5 min**;
  - Ciência auto: **NÃO**, como "parâmetro da empresa". Contradiz o parâmetro,
    que está ligado (ver 2.3).
- **Aba "Arquivo XML":**
  - Envio de **um** arquivo `.xml` (obrigatório) e o botão "Importar arquivo"
    (não clicado).
  - **Regras ditas na tela:** o sistema cadastra o fornecedor se preciso,
    converte o CFOP (do CFOP de saída do fornecedor para um de entrada
    [deduzido]) e tenta ligar cada item a um produto pelo GTIN ou pela
    referência.
- **Aba "Notas manifestadas SEFAZ"**
  (`/entradas-xml/create?aba=manifestadas`):
  - Bloco "Sincronizar com SEFAZ". Ele consulta a distribuição de documentos
    (DistDFe), dá ciência, baixa o XML e cria entradas pendentes. A rotina
    automática só roda com o parâmetro "Consulta automática" ligado.
  - Botão "Sincronizar agora": **não clicado**.
  - Tabela "Notas da distribuição": Emitente, NF-e, Emissão, Valor, XML, Status
    e ação. Vazia.
- [a verificar] A tela de uma entrada XML importada: conferência item a item,
  ligação de produto não encontrado, conversão de unidade, custo com
  IPI/ST/frete, lote e validade, geração de contas a pagar, e o "Concluir". Não
  há nenhuma entrada na conta para abrir.

### 2.13 `/entradas-manual` — Entrada manual [visto]

**Lista** (nota "FrmEntrada_Manual")

- Ações: "Inserir" e o ícone "Relatório geral" (PDF em nova aba, não aberto).
- Filtros: De, Até, Status (Todos, Pendente, Concluído, Cancelado), Fornecedor
  (lookup) e a busca "ID ou fornecedor".
- Colunas: ID, Data, Fornecedor, NF, Emissão, **Venda**, Finalidade, Total,
  Status, Ações.

**Formulário "Nova Entrada Manual"**

| Campo | Tipo | Obrigatório | Opções / regra |
| --- | --- | --- | --- |
| Data entrada | data | sim | padrão: hoje |
| Fornecedor / Cliente | lookup | sim | aceita cliente, por causa da devolução [deduzido] |
| Operação | lista | sim | 41 operações (lista abaixo); padrão: ENTRADA |
| Status | só leitura | — | "Pendente" |
| NF nº / Série | texto | não | — |
| Emissão NF | data | não | — |
| Finalidade | lista | não | 0 Normal, 1 Complementar, 2 Ajuste, 3 Devolução |
| Nº venda (devolução) | número | não | importa os itens de uma venda |
| Observações | texto longo | não | — |

- **Itens:**
  - Grade com ITM, Cód., Descrição, Qtde, Unitário e Total, mais o rodapé com o
    total de quantidade (4 casas) e de valor.
  - Duplo clique edita a linha; a tecla Del ou o ícone de lixeira remove.
- **Painel "Lançamento":**
  - ITM (automático), Produto (lookup com Código, Descrição, Ref. e UN) e
    Descrição (só leitura);
  - Quantidade (padrão 1) e Unitário;
  - Total (só leitura) e os botões "Lançar item" e "Limpar". O Enter passa da
    quantidade ao unitário e lança o item.
- **Regras** [visto no script]:
  - O produto é obrigatório e a quantidade tem de ser maior que zero.
  - O **custo unitário é sugerido pelo servidor** a partir do produto, da
    finalidade e do fornecedor.
  - Cada item guarda também a **grade** (padrão "UN") e o **local de estoque**
    (padrão G). Esses campos só aparecem se a empresa usar grade ou prateleira.
  - Finalidade "Devolução" troca a operação, sozinha, para 12 (devolução de
    venda).
  - A importação dos itens de uma venda (Enter no campo nº da venda) **só
    funciona depois de a entrada estar salva**.
- Botões "Salvar" (não clicado) e "Voltar".
- [a verificar] Como a entrada passa de Pendente a Concluído (botão no
  registro?), se gera contas a pagar e se atualiza o custo médio ou o último
  custo.

**Lista das 41 operações** (a mesma em entradas e saídas, na ordem da tela; a
grafia do sistema foi mantida):

1. ENTRADA
2. COMPRA
3. IMPORTAÇÃO
4. RETORNO DE CONSERTO
5. RETORNO DE DEMONSTRAÇÃO
6. RETORNO DE ENTREGA FUTURA
7. RETORNO DE CONSIGNAÇÃO
8. RETORNO DE SIMPLES REMESSA
9. NF COMPLEMENTAR
10. EXTORNO DE NFE
11. ENTRADA XML
12. DEVOLUÇÃO DE VENDA
13. CRÉDITO CIAP
14. DEVOLUÇÃO COMODATO
15. DEVOLUÇÃO EXPORTAÇÃO
16. DEVOLUÇÃO BONIFICAÇÃO
17. DEVOLUÇÃO CONSUMO
18. DEVOLUÇÃO IMOBILIZADO
19. ENTRADA DE NOTA FISCAL
20. DEVOLUÇÃO DE REVENDA
21. DEVOLUÇÃO DE VENDA DO PDV ON
22. VENDA
23. ENTREGA FUTURA
24. REVENDA
25. BONIFICAÇÃO
26. VENDA EM CONSIGNAÇÃO
27. EXPORTÇÃO
28. DEMONSTRAÇÃO
29. CONSUMO
30. VENDA IMOBILIZADO
31. CONSERTO
32. TRANSFERÊNCIA
33. SIMPLES REMESSA
34. EXTRAVIO / PERDA
35. DEVOLUÇÃO COMPRA
36. VENDA PDV OFF
37. COMODATO
38. NFE COMPLEMENTAR
39. ORDER DE SERVIÇOS
40. SAÍDA DE ICMS
41. VENDA PDV ON

### 2.14 `/saidas-manual` — Saída manual [visto]

**Lista** (nota "FrmSaida_Manual")

- Ação: "Inserir". Filtros: De, Até, Status (Todos, Pendente, Concluído,
  Cancelado) e a busca "ID ou pessoa".
- Colunas: ID, Data, Pessoa, NF, Emissão, Finalidade, Total, Status. **Não há
  relatório**, ao contrário da entrada.

**Formulário "Nova Saída Manual"**

| Campo | Tipo | Obrigatório | Opções / regra |
| --- | --- | --- | --- |
| ID | só leitura | — | — |
| Data saída | data | sim | padrão: hoje |
| Pessoa / Fornecedor | lookup | sim | — |
| Operação | lista | sim | as mesmas 41; **padrão: ENTRADA**, estranho numa saída |
| Status | só leitura | — | "Pendente" |
| NF nº / Série / Emissão NF | texto/data | não | — |
| Finalidade | lista | não | Normal, Complementar, Ajuste, Devolução |
| Observações | texto longo | não | — |

- **Itens:** grade com ITM, Cód., Produto, Qtde, Unitário, Acrés., Desc.%,
  Desc.R$ e Total, mais o total geral.
- **Painel "Lançamento":** Produto, Descrição, Quantidade, Unitário (sugerido),
  Desc. %, Desc. R$, Acréscimo e Total líquido.
- **Cálculo** [visto no script]: total líquido = quantidade × unitário − desconto
  em R$ − (bruto × desconto %) + acréscimo, arredondado em 2 casas.
- [visto na estrutura] Cada item guarda: produto, descrição, quantidade,
  **valor vendido**, grade, desconto %, desconto R$, acréscimos e valor líquido.
  A saída é tratada como uma "quase venda" [deduzido].
- **Não há campo "motivo":** o motivo é a operação (EXTRAVIO / PERDA, CONSUMO,
  BONIFICAÇÃO, DEVOLUÇÃO COMPRA, SIMPLES REMESSA, TRANSFERÊNCIA...).
- **Não há local de estoque** na saída. Na entrada há [visto: ausente].
- Pelo arquivo `13-fiscal.md`, a NF-e pode nascer de uma "saída". Esta é a
  porta para devolução de compra, remessa e perda com nota [deduzido].

### 2.15 Sub-rotas do estoque lidas fora da lista

#### `/manifestacao-nfe` — Manifestação de NF-e (DistDFe) [visto]

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
- **"Regras da consulta"** (resumo, em palavras minhas):
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

#### `/transferencias` — Transferência entre filiais [visto]

- Nota "FrmEstoque_Transferencia".
- **Lista:**
  - Filtros: De, Até, Status (Todos, Pendente, Concluído, Cancelado) e ID.
  - Colunas: ID, Data, Origem, Destino, Status, Ações.
- **Formulário (`/transferencias/create`):**
  - Data (obrigatória).
  - **Origem:** a empresa ativa, bloqueada.
  - **Destino:** lista das outras filiais (obrigatório; vazia nesta conta, que
    só tem uma empresa).
  - Status "Pendente".
- **Itens** (botão "+ Item"):
  - Produto, digitado **pelo número do ID** (obrigatório);
  - Saldo origem (só leitura);
  - Qtde transferir (obrigatória);
  - Grade.
- [a verificar] Se a conclusão gera NF-e de transferência (existe a operação 32,
  TRANSFERÊNCIA) e se há estoque "em trânsito" com confirmação no destino. Os
  parâmetros de estoque falam em "transferir estoque online" e "alterar preço
  de venda na transferência".

#### `/balancos` — Balanço de estoque [visto]

- Nota "FrmBalanco".
- **Lista:**
  - Filtros: De, Até e Status.
  - Colunas: ID, Data, Motivo, Usuário, Status.
- **Formulário (`/balancos/create`):**
  - **Cabeçalho:**
    - ID, Data (obrigatória), Empresa, Status "Pendente" e Usuário;
    - **Estoque** (local): Geral, Prateleira, Reserva ou Entrega futura. Muda o
      local dos itens lançados.
    - **Motivo:** "Acerto de estoque" ou "Final de ano".
    - Observações.
  - **Busca rápida de produto:** por descrição, ID, GTIN ou referência; o Enter
    localiza. Uma nota diz que a multisseleção virá numa versão futura.
  - **Itens:** ITM, Cód., Produto, Saldo novo, Estoque (local).
  - **Painel "Lançamento":**
    - Produto e Descrição;
    - **Saldo anterior** (do sistema, só leitura);
    - **Saldo novo (contagem)**;
    - **Total (custo)** = saldo novo × preço de compra [visto no script].
- [deduzido] Conta-se o saldo absoluto (não a diferença), produto a produto,
  num local por vez.
- [a verificar] A conclusão gera os ajustes. O log tem o tipo "Balanço".

#### `/estoque-log` — Movimentação de estoque [visto]

- Nota "Consulta do log — FrmEstoque_LOG".
- Filtros: De, Até, Produto (lookup) e Tipo (Todos, Entrada, Saída, Balanço).
- **Colunas:** ID, Data, Tipo, Produto, Qtde, Saldo ant., Saldo atual, Entrada,
  Saída, OS, Venda, Balanço (documento de origem), Operação, Usuário, Grade.
- Sem exportação visível. Lista vazia.

#### `/troca-produto` — Troca de produto [visto em parte]

- Objetivo dito na tela: a devolução **entra** no estoque, o produto novo
  **sai**, e a diferença vira **crédito no caixa** ou **título a receber**.
- Campos: Cliente (lookup, obrigatório) e Observação (opcional).
- Duas grades, cada uma com "Adicionar" e as colunas Produto, Qtd, Unit. e
  Total:
  - "Produtos devolvidos" (entrada no estoque);
  - "Produtos entregues" (saída do estoque).
- Totais: devolvido, entregue e a diferença (com o texto "valores equivalentes"
  quando zera).
- Botão "Confirmar troca": **não clicado**.
- **Pendente:** a regra que decide entre crédito e título, e o que acontece
  quando o cliente devolve mais do que leva. Foi aqui que a trava de segurança
  recusou e a exploração parou.

---

## 3. Padrões de interface que se repetem [visto]

- **Lista padrão:**
  - Faixa de filtros (Parâmetro + Valor + Status + Ordem + Pesquisar + limpar).
  - Grade com o link "Alterar".
  - **Barra fixa "Dados complementares"** no rodapé, com os dados da linha
    selecionada.
  - O nome do formulário Delphi aparece debaixo do título.
- **Formulário padrão:**
  - Título "Novo X" ou "Alterar X" e a frase "Preencha os campos abaixo...".
  - Bloco "Dados cadastrais" com rótulos em maiúsculas.
  - Rodapé "Revise os dados antes de salvar", com Cancelar e Salvar.
- **Lookup em modal** ("Pesquisar — X"):
  - busca por código ou descrição;
  - tabela paginada "Página x de y (n registros)";
  - "Cadastrar novo", que abre o modal "Cadastro rápido" e já seleciona o
    registro criado;
  - em alguns lookups, multisseleção ("Adicionar selecionados").
  - O campo fica só leitura com a lupa ao lado e o botão de limpar.
- **Documentos com itens:** painel lateral "Lançamento" para incluir ou editar
  itens, duplo clique para editar, Del para excluir e rodapé com totais. É uma
  cópia da tela desktop.
- **Notificações globais** [visto no script]: o sistema consulta de tempos em
  tempos novidades da loja virtual, do cardápio digital, de OS assinada, do
  Mercado Livre e do "Agente de Vendas IA" no WhatsApp. Cada novidade abre um
  modal; a do cardápio também toca um som.
- **Cabeçalho:**
  - nome da empresa;
  - "Buscar telas" (Ctrl+K);
  - "Novidades", tema visual, notificações e o menu do usuário;
  - botão flutuante "Abrir assistente".

---

## 4. Fluxos de ponta a ponta

Passos marcados **(obs.)** foram vistos. Os outros são o encadeamento mais
provável e estão **a verificar**.

1. **Abrir uma filial:**
   1. "Nova filial" → CNPJ (dados da Receita Federal) **(obs.)**.
   2. Se houver várias inscrições estaduais, escolher uma **(obs.)**.
   3. Completar e salvar.
   4. Na edição: logo, QR PIX e certificado A1 com senha **(obs.)**;
      integração de boleto e PIX, com teste **(obs.)**; parâmetros por módulo
      **(obs.)**.
   5. Escolher a empresa ativa no topo. Financeiro e vendas filtram por ela;
      clientes e produtos são compartilhados **(obs.)**.
2. **Base de entrega e de rota:**
   1. Zona → bairro (tarifa e zona) **(obs.)** → taxa de entrega na venda ou no
      delivery.
   2. Zona → rota (região e valor) **(obs.)** → cliente com rota (arquivo 14) →
      romaneio de carga e visitas da força de vendas.
   3. Veículo (transportador, carroceria, proprietário) **(obs.)** → romaneio e
      MDF-e.
3. **Plano de contas:**
   1. Criar a raiz e as subcontas, com código automático **(obs.)**.
   2. Os módulos podem pedir ou alimentar uma conta do plano (parâmetros de
      caixa, entrada, OS, saída e financeiro) **(obs. só os nomes dos
      parâmetros)**.
   3. Apuração por período, com créditos, débitos e saldo, e lançamento manual
      de crédito ou débito **(obs.)** → impressão.
4. **Compra com NF-e (XML):**
   1. A SEFAZ é consultada a cada 5 min (DistDFe), se o parâmetro estiver
      ligado **(obs.)**.
   2. Ciência automática ou manual → download do XML **(obs.)**.
   3. Entrada pendente criada pela sincronização ou pelo "Importar" de cada nota
      **(obs.)**. Também dá para enviar o arquivo XML **(obs.)**.
   4. O fornecedor é cadastrado, o CFOP convertido e os itens ligados por GTIN
      ou referência **(obs.)**.
   5. Conferência dos itens → concluir.
   6. Estoque (+), preço de compra atualizado (parâmetro **obs.**), contas a
      pagar a partir das duplicatas (parâmetro "lançar a pagar" **obs.**) →
      log.
   7. Confirmação da operação na manifestação, dentro do prazo **(obs.)**.
5. **Entrada manual / devolução de venda:**
   1. Cabeçalho (fornecedor ou cliente, operação, NF, finalidade) **(obs.)**.
   2. Itens com custo sugerido **(obs.)** → salvar (Pendente) **(obs.)** →
      concluir → estoque (+).
   3. Na devolução: finalidade 3 → operação 12 **(obs.)** → salvar → número da
      venda → importar os itens da venda **(obs.)** → crédito ou estorno ao
      cliente.
6. **Saída manual (perda, consumo, bonificação, devolução de compra,
   remessa):**
   1. Pessoa e operação **(obs.)**.
   2. Itens com desconto e acréscimo **(obs.)** → salvar (Pendente) → concluir
      → estoque (−).
   3. Se for preciso, NF-e a partir da saída (arquivo 13).
7. **Troca no balcão:**
   1. Cliente → itens devolvidos (+) e itens entregues (−) **(obs.)**.
   2. A diferença vira crédito no caixa ou título a receber **(obs., regra
      exata pendente)**.
8. **Transferência entre filiais:**
   1. Origem = empresa ativa → destino → itens com saldo da origem **(obs.)** →
      salvar (Pendente).
   2. Concluir → baixa na origem e entrada no destino; NF-e de transferência
      quando o CNPJ muda.
9. **Balanço (inventário):**
   1. Cabeçalho com local e motivo **(obs.)**.
   2. Contar produto a produto (saldo novo × saldo anterior, custo pelo preço de
      compra) **(obs.)**.
   3. Concluir → ajustes → log do tipo Balanço **(obs.: o tipo existe no
      filtro)**.

---

## 5. Entidades e relações

| Entidade | Campos principais [visto] | Relações |
| --- | --- | --- |
| Empresa (matriz/filial) | razão, fantasia, CNPJ, IE, IM, telefone, WhatsApp, e-mail, endereço (bairro em texto), município, CNAE, ramo (categoria/sub), gerente, site, usa grade, obs, tipo (Matriz), logo, QR PIX, certificado A1 + senha | 1:1 Parâmetros da empresa (~420 chaves); 1:1 Integração bancária (boleto e PIX); N:1 Município; **compartilha** pessoas e produtos com as outras filiais |
| Integração bancária | provedor, cedente, conta bancária, credenciais, ambiente, layout de remessa (API/CNAB 240/400), formato, timeout | N:1 Cedente, N:1 Conta bancária (`/cedentes`, `/banco-contas`) |
| Município | descrição, IBGE, país, UF | N:1 País, N:1 UF; usado por empresa, pessoa e veículo |
| Zona | descrição, status | 1:N Bairro, 1:N Rota |
| Bairro | descrição, tarifa inicial, zona, status | N:1 Zona (sem cidade) |
| Rota | descrição, valor, região (texto), zona | N:1 Zona; 1:N Cliente (id da rota, arquivo 14); romaneio e visitas |
| Veículo | placa, descrição, município, transportador, anos, marca, modelo, cor, Renavam, chassi, combustível, tipo rodoviário, carroceria, capacidade, carreta (placa, município, UF, m³, tara), proprietário (nome, CPF/CNPJ, IE, UF, tipo TAC, RNTRC, próprio) | N:1 Pessoa (transportador); usado no romaneio e no MDF-e |
| Conta do plano | código hierárquico, descrição, ativo, conta pai | árvore (pai 1:N filhas); 1:N Lançamento do plano |
| Lançamento do plano | conta, data, valor crédito **ou** débito, histórico | N:1 Conta do plano |
| Operação | código 1–41, descrição | usada por entrada, saída e NF-e |
| DF-e recebido (manifestação) | NSU, chave, emitente, emissão, valor, status de manifestação, XML | 1:0..1 Entrada XML |
| Entrada XML | data, NF, chave, fornecedor, total, status | N:1 Pessoa (fornecedor); itens ligados a produtos (GTIN/referência) |
| Entrada manual | data, fornecedor/cliente, operação, status, NF nº, série, emissão, finalidade, nº da venda, obs | 1:N Item (nº do item, produto, descrição, qtde de entrada, unitário, grade, local); 0..1 Venda (devolução) |
| Saída manual | data, pessoa, operação, status, NF, série, emissão, finalidade, obs | 1:N Item (produto, descrição, qtde, valor vendido, grade, desc. %, desc. R$, acréscimos, líquido); 0..1 NF-e |
| Troca | cliente, obs, devolvidos[], entregues[], diferença | gera entrada, saída e crédito ou título a receber |
| Transferência | data, empresa origem, empresa destino, status | 1:N Item (produto, qtde origem, qtde transferida, grade) |
| Balanço | data, empresa, usuário, local, motivo, obs, status | 1:N Item (produto, saldo anterior, saldo novo, local, grade, custo) |
| Log de estoque | data, tipo, produto, qtde, saldo antes, saldo depois, ids de origem (entrada, saída, OS, venda, balanço), operação, usuário, grade | N:1 Produto; N:1 documento de origem |
| Saldo de estoque [deduzido] | produto × empresa × local (G/P/R/E) × grade | atualizado pelos documentos acima |

---

## 6. Integrações

- **Receita Federal (CNPJ):** consulta pelo próprio ERP no cadastro de filial.
  O fornecedor do serviço não aparece [a verificar]. A consulta de CEP existe
  em Pessoas (checklist).
- **SEFAZ:**
  - NF-e, NFC-e e QR Code;
  - DistDFe (notas destinadas, a cada 5 min) e manifestação do destinatário
    (4 eventos);
  - MDF-e (dados do veículo);
  - NFS-e nacional (DPS) e prefeituras antigas (usuário e senha);
  - responsável técnico no XML.
  - Tudo com **um certificado A1 por empresa**.
- **Bancos e gateways:** boleto (16 opções, incluindo arquivo CNAB 240/400 e API
  dos bancos) e PIX dinâmico (12 opções), com teste de conexão e de QR Code.
  Retorno de pagamento por consulta periódica (Sicredi).
- **E-mail SMTP:** três contas (notas, vendas, contador). XML ao contador,
  fechamento de caixa e resumos de vendas.
- **Periféricos e meios de pagamento:**
  - TEF/POS (percentuais, autoemissão da NFC-e);
  - balança (código de pesagem);
  - impressoras (DANFE NFC-e/NF-e, cupom, A4);
  - etiquetas (tela não aberta).
- **Apps e canais:** app Força de Vendas ("carga geral"), Olimpia Comanda
  (e-mail e senha nos parâmetros), loja virtual, cardápio digital, Mercado
  Livre e Agente de Vendas IA no WhatsApp (notificações).
- **Outros:** integração com cartórios (assinatura, notas, registro civil, RTD)
  e folha de pagamento (prêmio de meta).

---

## 7. Observações de UX (oportunidades para nós)

1. **Parâmetros demais, numa tela só.**
   - Cerca de 420 opções misturam segmentos que um restaurante nunca usa
     (condomínio, confecção, cartório, petshop).
   - Muitos rótulos são nomes de coluna, alguns com erro de digitação.
   - **Para nós:** mostrar só os ajustes dos módulos contratados, em linguagem
     simples, com padrões prontos por segmento (o ramo "Restaurante" já
     escolheria os valores certos).
2. **Senhas operacionais guardadas como parâmetro** (sangria, cancelar item ou
   venda, saída de estoque) e **senhas de SMTP e de prefeitura no mesmo
   formulário** da empresa.
   - **Para nós:** permissões por papel, aprovação do gerente com o login
     dele (e não com uma senha única guardada) e segredos num cofre separado.
3. **Padrões errados:**
   - Zona e bairro novos nascem **Inativos**.
   - A saída manual nasce com a operação **ENTRADA**.
   - O QR Code da NFC-e tem opções duplicadas.
   - A "Ciência auto" aparece diferente em duas telas.
4. **O nome técnico atrapalha.**
   - "Equivalente a FrmXxx" em quase toda tela.
   - Nomes de tabela e coluna nas ajudas.
   - O checklist interno de migração aberto ao cliente.
   - Tradução faltando no paginador ("pagination.next").
   - "Novo Zona", "Novo Rota".
   - **Para nós:** linguagem do comerciante, sem jargão.
5. **A geografia é pobre.**
   - O bairro não tem cidade.
   - A região da rota é texto livre.
   - Faltam municípios na base (5.426 contra cerca de 5.570).
   - O endereço da empresa grava o bairro como texto.
   - **Para nós:** base IBGE completa e bairro ligado à cidade, com taxa por
     bairro, faixa de CEP ou raio no mapa (o que importa para delivery).
6. **O plano de contas é só uma árvore de nomes.**
   - Não há tipo (receita/despesa) nem natureza.
   - O lançamento manual aceita crédito ou débito soltos.
   - **Para nós:** categorias prontas por segmento que montam sozinhas um
     resultado gerencial (DRE simples).
7. **O estoque não tem painel.**
   - O lançador só tem atalhos: nada de valor em estoque, itens abaixo do
     mínimo ou notas da SEFAZ esperando.
   - **Para nós:** um painel com alertas e um botão "conferir notas novas".
8. **Operações fiscais em excesso.**
   - Há 41 opções iguais para entrada e saída, com erros de grafia
     ("EXPORTÇÃO", "ORDER DE SERVIÇOS", "EXTORNO").
   - **Para nós:** filtrar pela direção e esconder o fiscal de quem não emite
     nota; usar motivos simples na saída (perda, consumo, doação, validade).
9. **Fluxos em dois tempos.**
   - Na devolução, é preciso salvar a entrada antes de importar a venda.
   - Na transferência, o produto é digitado pelo número do ID.
   - O relatório geral é só PDF, em nova aba.
   - **Para nós:** escolher a venda e devolver itens dela num passo só, buscar
     produto por nome ou código de barras e exportar CSV.
10. **Dependências escondidas.**
    - A manifestação fica "Ignorada" porque falta a série da NF-e.
    - A rotina automática depende de um parâmetro de outra tela.
    - **Para nós:** um checklist de prontidão fiscal antes de ligar a SEFAZ.
11. **O que vale copiar:**
    - consulta do CNPJ que preenche tudo e trata várias IEs;
    - lookup com "Cadastrar novo" (criação rápida);
    - regras da manifestação explicadas na tela, com prazos;
    - KPIs da importação de XML (com XML, pendentes, sincronização);
    - um certificado único reaproveitado por todos os documentos;
    - fechamento de caixa cego configurável por forma de pagamento;
    - baixa de estoque na finalização ou na entrega.

---

## 8. Pendências

- **Detalhe dos documentos:**
  - conferência, conclusão, cancelamento e estorno de entrada XML, entrada
    manual, saída, transferência e balanço;
  - efeito no custo (médio ou último);
  - geração de contas a pagar.
  - Não houve como ver: a conta de teste não tem nenhum registro, e criar um
    seria gravar.
- **Troca de produto:** a regra de crédito × título e a devolução maior que a
  entrega. Pendente porque a **leitura da lógica da tela foi recusada pelo
  classificador do modo automático do Claude Code ("Third-Party Attack")**. A
  exploração parou nesse ponto. Para continuar, o usuário precisa decidir se
  libera esse tipo de ação (por exemplo, rodando fora do modo automático e
  aprovando na hora).
- **Relatórios em PDF:**
  - `/entradas-xml/relatorio-geral` não abriu no navegador embutido (navegação
    "denied or failed"; parece ser o PDF em nova aba);
  - `/entradas-manual/relatorio-geral` e `/plano-contas/apuracao/imprimir` não
    foram tentados.
- **Rotas vistas como link e não abertas:**
  - `/etiquetas`, `/vendas`, `/financeiro/faturamento`, `/balcao-entrega` e
    `/romaneios`;
  - os cadastros do checklist que não estão neste lote (fabricantes, cores,
    grades, subgrupos, golas, mangas, tecidos, bancos, contas, cedentes, grupos
    de produto, CRM markup).
- **Integração bancária:** quais campos aparecem para cada provedor (a tela
  mostra só os do provedor escolhido; foi lida a lista completa, sem a ligação
  campo × provedor). Os botões de teste não foram usados.
- **Municípios:** saber se a tabela é a mesma para todos os clientes do ERP e se
  um cliente pode alterá-la para os outros.
- **Veículos:** confirmar os códigos de tipo rodoviário e carroceria que vão
  para o XML do MDF-e, e onde fica a tara do veículo de tração.
- **Permissões:** tudo foi visto como ADMIN. Não se sabe o que um operador
  comum vê nem quais ações pedem senha.
- **Empresa ativa:** como se troca a empresa ativa no topo (o seletor não foi
  identificado com certeza) e o que muda nas telas de estoque.
- **Ramo da empresa:** se a categoria e a subcategoria alteram menus ou
  padrões.

---

## 9. Rotas: estado

| Rota | Estado |
| --- | --- |
| `/empresa` | lida (lista, nova filial, edição com 4 abas) |
| `/plano-contas` | lida (lista, nova conta, apuração e modal de lançamento) |
| `/municipios` | lida (lista, novo, edição) |
| `/zonas` | lida (lista, novo) |
| `/bairros` | lida (lista, novo, lookup de zona) |
| `/veiculos` | lida (lista, novo com 3 abas) |
| `/rotas` | lida (lista, novo) |
| `/cadastros/checklist` | lida |
| `/dashboard/modulo/estoque` | lida |
| `/entradas-xml` | lida (lista, importar arquivo, notas da SEFAZ); relatório em PDF não abriu |
| `/entradas-manual` | lida (lista, novo, lookup de produto) |
| `/saidas-manual` | lida (lista, novo) |

**Sub-rotas lidas:**

- `/empresa/nova` e `/empresa/1`;
- `/plano-contas/create?placement=raiz` e
  `/plano-contas/apuracao?de=…&ate=…`;
- `/municipios/create` e `/municipios/3713/edit`;
- `/zonas/create`, `/bairros/create`, `/veiculos/create` e `/rotas/create`;
- `/entradas-xml/create` e `/entradas-xml/create?aba=manifestadas`;
- `/entradas-manual/create` e `/saidas-manual/create`;
- `/manifestacao-nfe`;
- `/transferencias` e `/transferencias/create`;
- `/balancos` e `/balancos/create`;
- `/estoque-log`;
- `/troca-produto` (em parte).

**Endereços de ação vistos na estrutura e não usados:**

- envio de formulário: `/empresa/1/integracao-bancaria`, `/entradas-xml/import`,
  `/entradas-xml/sync-manifestacao`;
- manifestação: `/manifestacao-nfe/consultar`, `/manifestacao-nfe/zerar-nsu`,
  `/manifestacao-nfe/consulta-automatica`,
  `/manifestacao-nfe/importar-entrada-auto`;
- consultas internas: `/empresa/consulta/cnpj/{cnpj}`,
  `/lookups/produto/search`, `/entradas-manual/produto/{id}`,
  `/saidas-manual/produto/{id}`, `/balancos/produto/{id}`.
