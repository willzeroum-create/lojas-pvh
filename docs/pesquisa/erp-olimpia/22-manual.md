# 22 — Manual do sistema e elementos globais (ERP Olímpia)

> Cobre o módulo Manual (`/dashboard/modulo/manual` e `/manual`): o conteúdo de
> cada um dos 22 cartões, o que o manual revela sobre o sistema, os módulos que
> ele não cobre, os botões "Abrir módulo" (com ponteiros para os documentos de
> cada módulo) e os elementos globais da moldura do ERP vistos na página do
> manual e nas outras telas. Exploração de 2026-10-03, conta de teste "Boi
> Criolo" (plano Full), sessão já aberta no navegador embutido. Legenda:
> [visto], [visto em parte], [deduzido], [afirmado pelo manual] (é o que a
> Olímpia escreve; não foi testado no ERP), [código] (lido no HTML/JS da
> página), [proposta]; [a verificar] marca hipóteses. Nada foi gravado no ERP.

## 1. Visão geral

**Resumo:**

1. O "Manual" é uma página só, sem busca, imagens nem vídeos. São 22 cartões,
   um por área do sistema, cada um com 3 a 5 passos curtos (76 passos no
   total).
2. É mais um mapa do sistema do que um manual de uso: diz "o que existe" e
   "onde fica", mas quase nunca explica "como fazer" ou "por quê".
3. 11 cartões têm o botão "Abrir módulo", que abre outra aba e em geral leva ao
   app público da área (PWA de loja, cardápio, garçom, entregador, ponto,
   colaborador, cliente, técnico), e não à tela de gestão.
4. A melhor ajuda do ERP não está no Manual: está na página "Documentação" da
   integração com o Mercado Livre (passo a passo, diagrama do fluxo, tabela de
   problemas e checklist de lançamento; descrita no
   [06](06-loja-virtual-mercado-livre.md)).
5. O manual está desatualizado em vários pontos (nomes de abas e caminhos de
   menu que não existem mais; lista em 6.1).
6. O manual conta regras que as telas não mostram (rotinas automáticas do
   Mercado Livre a cada 5 e a cada 10 minutos, "job" diário da cobrança, baixa
   de boletos pelo arquivo de retorno do banco, NFC-e automática no PDV). São
   afirmações da Olímpia, não testadas.
7. O texto foi escrito para técnicos: cita nomes internos ("FrmEmpresa",
   "status 1", nomes de tabela e um comando de servidor).

**Onde fica [visto]:**

- No menu lateral, o Manual é o último item da seção "SISTEMA", depois de
  Mensalidades, Parâmetros e Utilitários (esses no
  [18](18-parametros-plano-comissoes.md)). A chave do módulo é `manual`.
- O submenu tem "Ver todos" (`/dashboard/modulo/manual`), o grupo
  "Documentação" e um único item, "Manual Completo" (`/manual`).
- Como os outros módulos, tem o botão "Fixar manual", que fixa o módulo no
  menu.

**O que é [visto]:** uma página estática, montada no servidor, com um
cabeçalho escuro, uma barra de 22 atalhos ("pílulas") que levam a âncoras e 22
cartões (`article.manual-card`), cada um com id `mod-{chave}`, ícone, título,
subtítulo, lista numerada de passos e, às vezes, o botão "Abrir módulo". Ícones
da biblioteca Bootstrap Icons; idioma da página `pt-BR`; título da aba "Manual
do Sistema".

**Sinais de como o manual é feito [deduzido]:**

- As chaves das âncoras coincidem em parte com as chaves dos módulos do menu
  (`mercado_livre`, `cardapio`, `os`, `bi`, `cobranca`, `cliente`, `loja`,
  `delivery`, `ponto`, `folha`, `colaborador`, `compras`, `financeiro`,
  `fiscal`). Outras só existem no manual (`erp`, `vendas`, `pdv`, `bancos`,
  `estoque`, `garcom`, `assinatura`, `forca-vendas`).
- Conclusão: o manual é uma lista escrita à mão, e não gerada a partir do
  cadastro de módulos. Por isso está desatualizado em relação ao menu.
- Há alguma personalização por empresa: dois botões "Abrir módulo" já trazem o
  identificador da empresa no endereço (`/colaborador/v/boi-criolo/app` e
  `/os/v/boi-criolo/tecnico/app`), enquanto o texto cita a forma genérica
  (`/colaborador/app`, `/os/tecnico/app`).
- [a verificar] Se o manual esconde cartões de módulos que a empresa não
  contratou. Com o plano Full aparecem os 22; não houve como testar outro
  plano.

### 1.1 O que o manual revela sobre o sistema [afirmado pelo manual, salvo indicação]

- **Várias empresas e filiais:** o login pede empresa, usuário e senha, e a
  filial se escolhe no topo. A tela de login do PWA do garçom confirma o
  padrão: tem uma lista de empresas antes de usuário e senha [visto].
- **Sistema desktop antigo:** o texto cita o formulário "FrmEmpresa" e diz
  "como no sistema legado"; a tela da empresa repete a nota "equivalente a
  FrmEmpresa" [visto]. (Visão geral da migração Delphi → web no
  [18](18-parametros-plano-comissoes.md).)
- **Base técnica:** a documentação do Mercado Livre cita o comando de servidor
  `php artisan ml:sync-automatico` → backend em PHP com Laravel [deduzido].
- **Rotinas agendadas:** Mercado Livre a cada 5 min (pedidos) e a cada 10 min
  (estoque), webhook do Mercado Livre, "job" diário da cobrança e baixa por
  arquivo de retorno do banco.
- **PWAs por empresa:** cada app público tem endereço próprio no formato
  `/{app}/v/{slug-da-empresa}/...` [visto nos redirecionamentos].
- **BI com Chart.js**, com dados "em tempo real".
- **App Android nativo** (Força de Vendas), com pedidos feitos sem internet e
  enviados depois.
- **"13 bancos" no financeiro:** a lista de provedores de boleto tem 13 bancos
  e fintechs, mais Tecnospeed, CredSIS e CNAB em arquivo [visto; lista no
  [11](11-financeiro-bancos.md)].

### 1.2 Moldura e padrões de interface do sistema (todas as telas)

Descrição única da moldura comum a todas as telas do ERP e dos padrões de
interface que se repetem de módulo para módulo. Vista na página do manual e, de
passagem, em todas as outras telas; os documentos de módulo só guardam o que é
próprio de cada um e apontam para aqui. Fora desta secção:

- arquitetura e tecnologia (migração Delphi → web, Laravel, Bootstrap,
  SweetAlert2, Cloudflare, banco por cliente, horário, bloqueio por plano):
  [18](18-parametros-plano-comissoes.md#11-o-que-estas-telas-revelam-sobre-a-arquitetura-do-sistema);
- janela de pesquisa (lupa) e a sua API `/lookups/...`:
  [19](19-relatorios-vendas-financeiro.md#15-janela-de-pesquisa-lupa-e-a-api-por-trás-dela);
- moldura própria das telas de relatório (cartão de filtros, "Gerar", "←
  Central"): [19](19-relatorios-vendas-financeiro.md), secções 1.3, 1.4 e 1.6.

**Cabeçalho (barra de cima)**

- **Conteúdo [visto]:** nome da empresa ("BOI CRIOLO"); campo "Buscar telas"
  (Ctrl+K); atalhos de módulos; botão "Novidades" (nome acessível "Melhorias e
  ajustes do sistema", leva a `/sistema-melhorias`, ver
  [18](18-parametros-plano-comissoes.md)); escolha de tema visual (paletas
  nomeadas); notificações (sino); menu do usuário ("ADMIN"; mostra usuário,
  colaborador, grupo, empresa e "sair").
- **Tema visual [visto; código]:** paletas nomeadas, aplicadas por um script
  próprio da moldura [código, visto nas telas de relatório]. Não confundir com
  as "skins" da aba Skin de `/parametros-sistema`, que valem só para o cliente
  desktop (ver [18](18-parametros-plano-comissoes.md)).
- **Seletor de empresa [código]:** existe na moldura um seletor que troca a
  empresa (filial) da sessão. Financeiro, vendas e relatórios usam a empresa
  ativa, escolhida no topo (ver [08](08-pessoas-empresa-acessos.md) e
  [19](19-relatorios-vendas-financeiro.md)). O uso do seletor na tela não foi
  visto.

**Menu lateral [visto]**

- Tem "Fixados", "Atalhos rápidos", o Dashboard e **27 módulos em 7 seções**.
- "Atalhos rápidos" tem quatro grupos: **Operação do dia** (Venda Balcão, Venda
  PDV, Venda Direta Mobile, Caixa, Ordem de Serviço, Mensalidades),
  **Cadastros frequentes** (Produtos, Clientes, Consulta Cliente), **Canais
  digitais** e **Pessoas** (o conteúdo destes dois últimos não foi anotado).
- Cada módulo tem "Fixar" (ex.: "Fixar manual", "Fixar fiscal"), que o põe em
  "Fixados", e "Expandir". O menu pode ficar preso aberto (preferência guardada
  no navegador).

| Seção | Módulos |
| --- | --- |
| Visão Geral | BI Executivo, Consultoria, Relatórios |
| Vendas & Atendimento | Ordem de Serviço, CRM, Cashback, Cobrança, Portal Cliente |
| Canais Digitais | Loja Virtual, Mercado Livre, Cardápio Digital, Painel TV, Delivery |
| Operações | Cadastros, Sinuca, Estoque, Produção, Compras |
| Financeiro & Fiscal | Financeiro, Fiscal |
| Pessoas & RH | Ponto, Folha, Portal Colaborador |
| Sistema | Mensalidades, Parâmetros, Utilitários, Manual |

- **Catálogo do menu [código]:** `/erp/navigation`, guardado no navegador (na
  sessão) por 5 minutos. É dele que saem o menu e a busca Ctrl+K. Foi lido uma
  vez nesta pesquisa, para tirar a lista de relatórios do menu (ver
  [19](19-relatorios-vendas-financeiro.md)).

**Barra de atalhos só com ícones [visto]** (coluna à esquerda, sem rótulo
visível), com 15 atalhos nesta conta: Venda Balcão (`/vendas`), Venda PDV
(`/pdv`), Venda Direta Mobile (`/garcom/mobile-venda`), Caixa
(`/financeiro/recebimento`), Ordem de Serviço (`/dashboard/modulo/os`),
Mensalidades (`/minha-assinatura`), Produtos (`/produtos`), Clientes
(`/pessoas?tipo=cliente`), Consulta Cliente (`/consulta-cliente`), Gestão Loja
Virtual (`/dashboard/modulo/loja`), Cardápio Digital
(`/dashboard/modulo/cardapio`), Comanda Garçom (`/garcom-admin/link`), API Força
de Vendas (`/forca-vendas/api`), Visitas de rota (`/rota-visitas`), Ponto
Eletrônico (`/ponto/dashboard`). Os nove primeiros são, pela mesma ordem, os
grupos "Operação do dia" e "Cadastros frequentes" do menu: a barra deve ser a
lista dos "Atalhos rápidos" em forma de ícones [deduzido]. Não foi verificado
se a lista é fixa ou configurável.

**Hubs de módulo** (`/dashboard/modulo/{modulo}`) [visto]: página de cartões
agrupados por tema, com o link "Voltar ao dashboard"; cada cartão tem uma
estrela "Adicionar aos atalhos" (fixa a tela na barra pessoal do usuário;
nunca clicada).

**Busca de telas (Ctrl+K) [visto]:** procura **só nomes de telas do menu** (e
módulos e atalhos); guarda "Recentes"; mostra o grupo de cada tela (ex.:
"Relatórios · Comissões"); atalhos de teclado (setas, Enter para abrir, F para
favoritar). "manual" dá 3 resultados ("Manual — Ver todos", "Manual Completo" e
"Entrada Manual", do Estoque); "certificado" não acha nada e responde com
"verifique suas permissões". **O conteúdo do manual não é pesquisável**, nem a
documentação do Mercado Livre. A busca também lista atalhos de módulos fora do
plano (ex.: "MCP / Conector IA").

**Celular [visto]:** o menu vira "hambúrguer" e aparece uma barra inferior com
Início, Buscar, Menu e Novidades. O botão flutuante do assistente fica por cima
do item "Novidades" (ver 2.2).

**Assistente Olimpia [visto]** (botão flutuante "Abrir assistente", canto
inferior direito):

- o painel mostra "Online · pronto pra ajudar" e uma saudação informal;
- diz que responde sobre vendas, PDV, OS, NF-e/NFC-e/NFS-e e parâmetros;
- tem um campo de pergunta (exemplo: "como emitir NFS-e?") e um botão de
  enviar; **nenhuma pergunta foi enviada**;
- a tela do IA Advisor chama-lhe "Hermes" e separa-o do consultor de gestão
  (ver [17](17-consultoria-ia.md));
- [a verificar] se usa o conteúdo do manual e se responde com links para as
  telas.

**Notificações e avisos por sondagem [código, salvo indicação]**

- **Sondagem (polling):** todas as páginas, mesmo sem o módulo em uso,
  consultam o servidor de tempos em tempos, por canal, em
  `/erp/notificacoes/{canal}/poll`. São 7 frentes: `whatsapp` (Agente de Vendas
  IA), `loja`, `cardapio`, `os`, `ml` (Mercado Livre), `manifestacao` (NF-e a
  manifestar) e `boleto-baixa`. Os intervalos variam por canal: cerca de 10 s
  no WhatsApp, 20 s na loja e 30 s nos boletos (os outros não foram anotados).
- **Sem repetir avisos:** cada canal guarda na sessão do navegador o último
  número já visto, e a primeira consulta vai marcada como "bootstrap", para não
  despejar avisos antigos (no WhatsApp: `bootstrap=1` e depois
  `apos={último id}`; ver [17](17-consultoria-ia.md)).
- **Outros endereços:** listar (`/erp/notificacoes/ml`), marcar uma como lida
  (POST `/erp/notificacoes/ml/{id}/lida`), marcar todas e confirmar o
  recebimento de um pedido do WhatsApp (POST
  `/erp/notificacoes/whatsapp/{id}/confirmar`). **Nenhum destes endereços foi
  chamado nesta pesquisa.**
- **Sino [visto]:** 4 seções, cada uma com "Marcar lidas" e um link: Loja
  virtual (vendas online), Cardápio digital (painel da cozinha), Ordem de
  serviço e Mercado Livre. O contador soma as seções.
- **Janelas (modais) de aviso, presentes em todas as páginas [visto]:**
  - "Nova venda — Loja virtual" e "Nova venda — Mercado Livre" (o que mostram:
    ver [06](06-loja-virtual-mercado-livre.md));
  - "Cardápio digital": chamado do salão (mesa, data/hora, detalhes), que
    **toca um som** (ver [04](04-cardapio-comanda-cozinha.md));
  - "Assinatura de OS": o cliente assinou eletronicamente uma OS, com link de
    comprovante (ver [14](14-os-forca-vendas.md));
  - "Novo pedido WhatsApp", registrado pelo "Agente de Vendas IA": tipo
    (orçamento ou venda), cliente, WhatsApp, total, "Confirmar recebimento"
    (detalhe e fila no [17](17-consultoria-ia.md)).
- **Avisos flutuantes ("toast"):** "Nova NF-e para manifestar" (emitente, data,
  valor e link "Abrir Manifestação"; some em 10 s e espera enquanto o mouse
  está em cima; ver [13](13-fiscal.md)) e "Boletos liquidados" (baixa
  automática; ver [11](11-financeiro-bancos.md)).
- **Efeito colateral [visto]:** em `/parametros-sistema`, o link "Fechar"
  (voltar à página anterior) aponta para `/erp/notificacoes/whatsapp/poll`: o
  "voltar" foi capturado por uma destas consultas (ver
  [18](18-parametros-plano-comissoes.md)).

**Maiúsculas automáticas [código]:** um script da moldura converte para
MAIÚSCULAS o que se digita nos campos de texto, exceto e-mail, URL, senha,
número, data e chaves de integração. Efeitos nos módulos: nome da loja
("LOJA VIRTUAL", [06](06-loja-virtual-mercado-livre.md)), nomes de bairro
([05](05-delivery.md)), descrições de cadastros.

**Padrões de lista e de formulário (cadastros) [visto]**

- **Lista padrão:** faixa de filtros (Parâmetro + Valor + Status + Ordem +
  Pesquisar + limpar); grade com o link "Alterar"; debaixo do título, o nome
  do formulário do sistema desktop ("Equivalente a FrmXxx"; exemplos e origem
  no [18](18-parametros-plano-comissoes.md)).
- **"Dados complementares" (mestre-detalhe):** barra fixa no rodapé da lista
  que mostra, em pares chave: valor, os dados da linha selecionada e liga o
  botão **Alterar** ao endereço de edição dessa linha. A primeira linha é
  selecionada sozinha quando a página carrega; com a lista vazia, pede para
  selecionar um registro e o "Alterar" fica sem destino. Visto em Empresa,
  Municípios, Carga horária, Pessoas e Grupos tributários
  ([08](08-pessoas-empresa-acessos.md)) e em Projetos, Problemas e Plano
  30/60/90 ([17](17-consultoria-ia.md)).
- **Formulário padrão:** título "Novo X" ou "Alterar X" e a frase "Preencha os
  campos abaixo..."; bloco "Dados cadastrais" com rótulos em maiúsculas;
  rodapé "Revise os dados antes de salvar", com Cancelar e Salvar. Grava no
  servidor (POST seguido de redirecionamento; ver
  [18](18-parametros-plano-comissoes.md)).
- **Documentos com itens:** painel lateral "Lançamento" para incluir ou editar
  itens, duplo clique para editar, Del para excluir e rodapé com totais. É uma
  cópia da tela desktop (ver [09](09-estoque.md)).
- **Campos com lupa:** campo só de leitura, com a lupa ao lado e o botão de
  limpar, que abre o modal "Pesquisar — X" (busca, paginação, seleção
  múltipla, "Cadastrar novo" com cadastro rápido). Descrição completa e API no
  [19](19-relatorios-vendas-financeiro.md#15-janela-de-pesquisa-lupa-e-a-api-por-trás-dela).

### 1.3 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/manual` | Hub do Manual | lida |
| `/manual` | Manual Completo | lida por inteiro (texto, árvore de acessibilidade, estrutura e capturas em computador e celular) |
| `/manual#mod-{chave}` (22 âncoras) | atalhos da barra "Módulos" | lidas (um atalho clicado para testar a âncora) |

Numa primeira tentativa, a navegação para `/dashboard/modulo/manual` foi
recusada pela trava do modo automático do Claude Code ("Third-Party Attack");
noutra passagem, depois de uma recusa noutra tela, o hub não chegou a ser
tentado. Uma passagem posterior abriu e leu as duas rotas normalmente.

## 2. Telas

### 2.1 `/dashboard/modulo/manual` — Hub do Manual [visto]

- **Objetivo:** porta de entrada do módulo, no mesmo modelo dos hubs dos
  outros módulos.
- **Conteúdo:** cabeçalho "Manual do Sistema" com o link "Voltar ao
  dashboard"; um grupo, "Documentação", com um único cartão, "MANUAL COMPLETO"
  (ícone de livro), que leva a `/manual`.
- **Ação extra:** a estrela "Adicionar aos atalhos" no cartão (não clicada).
- Não há lista, filtro nem formulário. É um clique a mais sem ganho, porque o
  módulo tem só uma tela.

### 2.2 `/manual` — Manual Completo [visto]

**Objetivo:** guia rápido de todas as áreas do ERP, com um atalho para os
apps.

**Estrutura:**

1. **Cabeçalho:** título "Manual do Olimpia ERP" e uma frase que promete um
   guia de 22 módulos, PWAs e fluxos integrados (fiscal, financeiro com 13
   bancos, delivery, RH e BI).
2. **Barra "Módulos":** 22 atalhos com ícone, um por cartão
   (`href="#mod-..."`).
3. **22 cartões**, cada um com ícone colorido, título e subtítulo de uma
   linha, 3 a 5 passos numerados (uma frase cada) e, às vezes, o botão "Abrir
   módulo".

**Lista / filtros / formulário:** não há. As únicas ações são os 22 atalhos de
âncora e os 11 botões "Abrir módulo".

**Comportamento [visto]:**

- O atalho rola a página com animação até o cartão (margem de 80 px para o
  cabeçalho fixo). O endereço ganha `#mod-...`, e o atalho fica destacado
  enquanto tiver o foco.
- A barra de atalhos **não é fixa**: depois de rolar, para trocar de seção é
  preciso voltar ao topo. Não há botão "voltar ao topo".
- "Abrir módulo" abre **outra aba** (`target=_blank`, `rel=noopener`).
- Não existem: busca dentro do manual; impressão ou PDF; data de atualização
  ou versão; imagens, vídeos ou links para telas específicas.

**Medidas [visto]:**

- No computador (cerca de 1.100 px de largura), a página tem perto de 7.500 px
  de altura.
- No celular (375 px): a barra de atalhos ocupa **812 px**, uma tela inteira;
  o primeiro cartão só começa por volta de 1.180 px; a página chega a cerca de
  11.000 px; não há rolagem horizontal; o botão flutuante do assistente fica
  por cima da barra inferior do celular (item "Novidades").

#### 2.2.1 Conteúdo de cada cartão (resumo com palavras nossas)

"Onde fica hoje" vem do menu lateral, lido na mesma sessão. Legenda: ✅
coerente; ⚠️ diferente do sistema atual.

| # | Cartão (id) | Passos | O que o manual diz (resumo) | "Abrir módulo" → | Onde fica hoje no menu | Coerência |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ERP Core & Dashboard (`mod-erp`) | 4 | entrar com empresa, usuário e senha; escolher a filial no topo; usar o menu agrupado por área; ver as novidades em Utilitários → Melhorias e Ajustes | — | Utilitários › Melhorias e Ajustes (`/sistema-melhorias`) e botão "Novidades" no topo | ✅ (os exemplos de grupos do menu não batem com os nomes reais das seções) |
| 2 | Vendas & Orçamentos (`mod-vendas`) | 4 | pedido com cliente e produtos; orçamento convertido em venda faturada; estoque e contas a receber automáticos; NF-e ou NFC-e conforme a operação | — | **não existe módulo "Vendas"**: "Venda Balcão" (`/vendas`) nos atalhos; "Pedido de Venda" e "Faturamento de Vendas" dentro de Estoque › Expedição & Vendas; orçamentos não têm item próprio no menu (aparecem num relatório e, pelo BI, levam a Faturamento de Vendas) | ⚠️ |
| 3 | PDV / Frente de Caixa (`mod-pdv`) | 4 | entrar pelo "menu Vendas"; abrir o caixa, com sangrias e reforços; vários meios de pagamento e TEF; NFC-e automática quando configurada | — | atalho "Venda PDV" (`/pdv`); TEF em Financeiro › TEF | ⚠️ ("menu Vendas" não existe) |
| 4 | Documentos Fiscais (`mod-fiscal`) | 4 | séries em "Empresa → Documentos fiscais"; enviar o .pfx na aba "Logo / Certificado"; emitir por vendas, PDV ou módulo fiscal; consultar a situação na SEFAZ e reenviar em contingência | — | séries em **Fiscal › Séries** (`/fiscal-series`, ver [13](13-fiscal.md)); certificado na aba **"Logo / QR PIX"** de Cadastros › Empresa (ver [08](08-pessoas-empresa-acessos.md)) | ⚠️ (dois caminhos errados) |
| 5 | Financeiro (`mod-financeiro`) | 4 | títulos gerados pelas vendas; baixa manual ou por retorno bancário; fechamento de caixa ligado ao PDV; relatórios de fluxo e posição | — | Financeiro (22 itens) | ✅ |
| 6 | Integração Bancária (`mod-bancos`) | 5 | Cadastros → Empresa → aba Integração Bancária; escolher o provedor de boleto e/ou PIX e preencher só o que ele pede; A1 na aba "Logo / Certificado"; marcar "Gerar QRCode PIX" no Tipo de Recebimento para o caixa e o PDV; remessa CNAB em Boletos e retorno para baixa automática | `/financeiro/integracao-bancaria` → **redireciona** para `/empresa/1#tab-integracao` | Financeiro › Bancos › Integração Bancária; Financeiro › Tipo de Recebimento; Financeiro › Boleto; Financeiro › Monitor de baixas | ✅ (menos o nome da aba do certificado) |
| 7 | Estoque & Entradas (`mod-estoque`) | 3 | entrada pelo XML da NF-e do fornecedor; saídas automáticas em vendas e PDV; balanço e ajuste de inventário | — | Estoque (12 itens: XML, entrada e saída manual, troca, transferência, balanço, log, etiquetas...) | ✅ |
| 8 | Loja Virtual (`mod-loja`) | 3 | produtos e frete em loja-admin; o cliente compra no PWA `/loja`; o pedido vira venda sozinho | `/loja/app` → `/loja/v/{slug}/app` | Canais Digitais › Loja Virtual (9 itens) | ✅ ([a verificar] se o frete fica mesmo em loja-admin; o Delivery tem "Configuração de entrega" própria) |
| 9 | Integração Mercado Livre (`mod-mercado_livre`) | 5 | criar o app no portal de desenvolvedores do ML e ligar por OAuth; vincular anúncios a produtos (SKU = código ou ID de integração); webhook + rotina de 5 min importam os pedidos pagos; estoque enviado ao ML depois de cada venda e a cada 10 min; documentação completa no ERP | `/integracoes/mercado-livre/documentacao` | Canais Digitais › Mercado Livre (5 itens) | ⚠️ leve (o manual fala em grupo "Integrações", que não existe) |
| 10 | Cardápio Digital & Comanda (`mod-cardapio`) | 3 | mesas e QR codes no admin; o cliente abre o cardápio pelo QR; cozinha e PDV recebem em tempo real | `/cardapio/app` (app **do cliente**) | Canais Digitais › Cardápio Digital (Painel Cozinha, Pedidos Online, Links e QR Codes, Mesas, Atendimento Tablet, Banners do Tablet, PWA, Configurações) | ✅ (o botão leva ao app do cliente, não à gestão) |
| 11 | Garçom PWA (`mod-garcom`) | 3 | abrir `/garcom/app` no celular; instalar como app; lançar itens na mesa e acompanhar a cozinha | `/garcom/app` → `/garcom/v/{slug}/login` | atalhos "Comanda Garçom" (`/garcom-admin/link`) e "Venda Direta Mobile" (`/garcom/mobile-venda`) | ✅ |
| 12 | Delivery Próprio (`mod-delivery`) | 3 | sincronizar pedidos em delivery-admin; cadastrar entregadores e atribuir corridas; entregador com GPS e prova de entrega em `/delivery/app` | `/delivery/app` | Canais Digitais › Delivery (Dashboard, Pedidos, Entregadores, Configuração de entrega) | ✅ |
| 13 | Ponto Eletrônico (`mod-ponto`) | 3 | batida pelo `/ponto/app`; o gestor aprova justificativas; o fechamento mensal exporta eventos para a folha | `/ponto/app` → `/ponto/v/{slug}/app` | Pessoas & RH › Ponto (12 itens) | ✅ |
| 14 | Folha de Pagamento (`mod-folha`) | 3 | competência e eventos de proventos e descontos; processar e conferir holerites; gerar pagamentos em contas a pagar (o subtítulo cita CNAB 240) | — | Pessoas & RH › Folha (12 itens) | ✅ |
| 15 | Portal do Colaborador (`mod-colaborador`) | 3 | entrar em `/colaborador/app` com CPF e senha do portal; holerites e pedidos de férias ou abono | `/colaborador/v/boi-criolo/app` | Pessoas & RH › Portal Colaborador | ✅ |
| 16 | Portal do Cliente (`mod-cliente`) | 3 | `/cliente-portal/app`; ver títulos e baixar boletos; acompanhar pedidos e abrir chamados (o subtítulo cita PIX, NF-e e OS) | `/cliente-portal/app` (abertura recusada pela trava) | Vendas & Atendimento › Portal Cliente (PWA e Links de Acesso) | ✅ |
| 17 | Ordem de Serviço (`mod-os`) | 4 | criar OS ou converter chamado em os-admin; atribuir técnico e agendar; técnico usa o PWA; faturar gera venda e contas a receber | `/os/v/boi-criolo/tecnico/app` | Vendas & Atendimento › Ordem de Serviço (14 itens) | ✅ |
| 18 | Assinatura Eletrônica (`mod-assinatura`) | 3 | criar o documento em assinatura-admin; signatários na ordem; ligada a OS, entregas, RH e contratos (o subtítulo cita IP, geolocalização, hash e auditoria) | — | **Pessoas & RH › Portal Colaborador › Assinatura › Documentos Assinatura** (`/assinatura-admin`) | ⚠️ (escondida num módulo de RH, embora sirva OS, entregas e contratos) |
| 19 | Compras e Suprimentos (`mod-compras`) | 3 | solicitação com itens; cotação com fornecedores; recebimento ligado à entrada da NF e ao financeiro (o subtítulo descreve solicitação → cotação → aprovação → pedido → recebimento) | — | Operações › Compras (Dashboard, Solicitações, Cotações, Pedidos de Compra) | ⚠️ (não há tela própria de aprovação nem de recebimento no menu) |
| 20 | Cobrança Automática (`mod-cobranca`) | 3 | réguas com etapas (lembrete, cobrança); um job diário executa; links de pagamento para clientes | — | Vendas & Atendimento › Cobrança (Dashboard, Réguas, Links, Gateways) | ✅ |
| 21 | BI Executivo (`mod-bi`) | 3 | painel em `/bi`; filtrar por período **e empresa**; gráficos Chart.js em tempo real | `/bi` | Visão Geral › BI Executivo | ⚠️ (a tela só tem filtro de período) |
| 22 | Força de Vendas (Android) (`mod-forca-vendas`) | 3 | instalar o app Android; sincronizar catálogo e clientes; pedidos sem internet, enviados quando houver conexão | — | atalho e Parâmetros › "API Força de Vendas" (`/forca-vendas/api`); "Visitas de rota" (`/rota-visitas`) | ✅ |

Total: 76 passos; 11 cartões com "Abrir módulo" (bancos, loja, ML, cardápio,
garçom, delivery, ponto, colaborador, cliente, OS e BI).

#### 2.2.2 Módulos do menu que o manual não cobre [visto no menu]

Dos 27 módulos do menu (tabela em 1.2), ficam **sem cartão** no manual:

- Consultoria (Gestão 360°, IA Advisor) — ver [17](17-consultoria-ia.md);
- Relatórios (a Central tem 132 relatórios) — ver
  [19](19-relatorios-vendas-financeiro.md);
- CRM e Cashback — ver [12](12-cobranca-crm-cashback-portal.md);
- Painel TV — ver [01](01-dashboard-bi-tv.md);
- Cadastros (29 itens) — ver [08](08-pessoas-empresa-acessos.md);
- Sinuca — ver [04](04-cardapio-comanda-cozinha.md);
- Produção (9 itens) — ver [10](10-compras-producao.md);
- Mensalidades — ver [18](18-parametros-plano-comissoes.md);
- Parâmetros (cerca de 420 opções na aba Parâmetros da empresa, ver
  [08](08-pessoas-empresa-acessos.md); parâmetros do sistema no
  [18](18-parametros-plano-comissoes.md));
- comissões e metas — ver [18](18-parametros-plano-comissoes.md) e
  [20](20-relatorios-comissoes-os.md);
- dentro do Financeiro: Portal do Contador, TEF/POS, Controle de cartões e
  Conciliação — ver [11](11-financeiro-bancos.md).

Ou seja, **justamente as partes mais difíceis de configurar não têm ajuda.**

### 2.3 Botões "Abrir módulo": ponteiros

As telas abertas por estes botões estão descritas nos documentos dos
respectivos módulos.

| Cartão | Botão leva a | Destino final | Estado nesta passagem | Documento |
| --- | --- | --- | --- | --- |
| Integração Bancária | `/financeiro/integracao-bancaria` | redireciona para `/empresa/1#tab-integracao` (aba Integração Bancária da empresa nº 1, a Matriz) | lida, sem gravar | [11](11-financeiro-bancos.md) |
| Loja Virtual | `/loja/app` | `/loja/v/{slug}/app` → vitrine `/loja/v/{slug}` | lida | [06](06-loja-virtual-mercado-livre.md) |
| Integração Mercado Livre | `/integracoes/mercado-livre/documentacao` | — | lida, com acordeões abertos | [06](06-loja-virtual-mercado-livre.md) |
| Cardápio Digital & Comanda | `/cardapio/app` | `/cardapio/v/{slug}/app` → `/cardapio/v/{slug}` → `/cardapio/v/{slug}/sem-mesa` | lida | [04](04-cardapio-comanda-cozinha.md) |
| Garçom PWA | `/garcom/app` | `/garcom/v/{slug}/login` | lida (login) | [04](04-cardapio-comanda-cozinha.md) |
| Delivery Próprio | `/delivery/app` | — (sem slug da empresa) | lida (login) | [05](05-delivery.md) |
| Ponto Eletrônico | `/ponto/app` | `/ponto/v/{slug}/app` | lida (login) | [15](15-ponto.md) |
| Portal do Colaborador | `/colaborador/v/boi-criolo/app` | — | não reaberta | [16](16-folha-colaborador.md) |
| Portal do Cliente | `/cliente-portal/app` | — | **recusada** pela trava | [12](12-cobranca-crm-cashback-portal.md) |
| Ordem de Serviço | `/os/v/boi-criolo/tecnico/app` | — | não reaberta | [14](14-os-forca-vendas.md) |
| BI Executivo | `/bi` | — | lida (período 30d) | [01](01-dashboard-bi-tv.md) |

Destinos reais dos caminhos citados no texto do manual (pelo menu), não
abertos a partir do manual: `/sistema-melhorias` (18), `/fiscal-series` (13),
`/assinatura-admin` (16), `/forca-vendas/api` (14),
`/financeiro/tipo-recebimentos`, `/financeiro/boletos` e
`/financeiro/boletos-liquidados` (11).

## 3. Fluxos de ponta a ponta

Os fluxos abaixo são **o que o manual afirma** (os cartões encadeados). Os
trechos confirmados por tela estão marcados [visto]; o detalhe de cada um fica
no documento do módulo.

- **A. Venda balcão ou pedido:** pedido com cliente e produtos → orçamento
  convertido em venda faturada → baixa automática de estoque e título em
  contas a receber → NF-e ou NFC-e conforme a operação → baixa do título
  (manual ou por retorno bancário) → o resultado aparece no BI (faturamento,
  ticket, top produtos) [BI visto]. Ver [02](02-vendas-pdv.md) e
  [01](01-dashboard-bi-tv.md).
- **B. Mercado Livre** (o mais detalhado; vem da documentação da integração):
  criar o app no portal do ML → Client ID e Secret no ERP → OAuth → webhook →
  vincular anúncios a produtos (à mão ou por SKU) → "Integração ativa" → no
  pagamento, o ERP importa o pedido como venda confirmada, cria/atualiza o
  cliente pelo CPF/CNPJ, baixa o estoque, avisa no sino, devolve o saldo aos
  anúncios e, se ativo, emite a NF-e → rotinas de 5 min (recuperar pedidos) e
  10 min (saldo). Ver [06](06-loja-virtual-mercado-livre.md).
- **C. PDV:** abrir o caixa → sangrias e reforços → venda com vários meios de
  pagamento e TEF → NFC-e automática → baixa de estoque → fechamento de caixa
  ligado ao financeiro. Ver [02](02-vendas-pdv.md) e [03](03-caixa.md).
- **D. Boleto e PIX:** escolher o provedor na aba Integração Bancária da
  empresa → certificado A1 quando o banco exige → testar a autenticação ou o
  QR de teste [botões vistos] → marcar "Gerar QRCode PIX" na forma de
  recebimento → PIX no caixa e no PDV → boleto por remessa CNAB (ou API) →
  retorno com baixa automática; no Sicredi por API, baixa por consulta
  periódica [ajuda vista]. Ver [11](11-financeiro-bancos.md).
- **E. Cardápio, comanda e cozinha:** mesas e QR no admin → o cliente escaneia
  e abre o cardápio da mesa (sem QR, só pede para escanear [visto]) → pedido
  em tempo real para cozinha e PDV → garçom lança itens pelo PWA, com login do
  ERP [visto]. Ver [04](04-cardapio-comanda-cozinha.md).
- **F. Delivery próprio:** pedidos dos canais reunidos no delivery-admin →
  entregadores → atribuir corridas → entregador no PWA com telefone e PIN
  [visto], GPS e prova de entrega. Ver [05](05-delivery.md).
- **G. Loja virtual:** produtos e frete no admin → o cliente compra pela
  vitrine instalável [vista] → o pedido vira venda sozinho. Ver
  [06](06-loja-virtual-mercado-livre.md).
- **H. Ponto e folha:** batida no PWA com código e senha [visto] → gestor
  aprova justificativas → fechamento mensal → exportação de eventos para a
  folha → competência e eventos → processamento e holerites → pagamentos em
  contas a pagar (CNAB 240) → o colaborador vê holerites e pede férias ou
  abono no portal. Ver [15](15-ponto.md) e [16](16-folha-colaborador.md).
- **I. Ordem de serviço:** chamado do portal do cliente ou OS direta →
  técnico e agenda → técnico no PWA (checklist) → faturar gera venda e
  contas a receber → assinatura eletrônica do cliente, quando usada. Ver
  [14](14-os-forca-vendas.md).
- **J. Compras:** solicitação → cotação → aprovação (sem tela própria no menu)
  → pedido de compra → recebimento pela entrada da NF (XML) → estoque e contas
  a pagar. Ver [10](10-compras-producao.md).
- **K. Cobrança automática:** régua com etapas (lembrete, cobrança) → job
  diário aplica as etapas aos títulos → links de pagamento (PIX, boleto) pelos
  gateways → o cliente paga. Ver [12](12-cobranca-crm-cashback-portal.md).
- **L. Força de vendas:** instalar o app Android → sincronizar catálogo e
  clientes → pedido sem internet → envio quando houver conexão → o pedido
  entra no ERP. Ver [14](14-os-forca-vendas.md).
- **M. Assinatura eletrônica:** documento no admin → signatários em ordem →
  cada um assina com registro de IP, geolocalização e hash → trilha de
  auditoria → documento ligado a OS, entrega, RH ou contrato. Ver
  [16](16-folha-colaborador.md).

## 4. Entidades e relações

Só as entidades próprias do manual e as transversais; as de cada módulo citadas
pelo manual ficam nos documentos dos módulos.

| Entidade | Campos | Relações |
| --- | --- | --- |
| **Seção do manual** | chave (`mod-...`), ícone, título, subtítulo, passos (3 a 5), link "Abrir módulo" | 1 cartão por área; ligação fraca (escrita à mão) com os módulos do menu |
| **Módulo de menu** | chave (`os`, `mercado_livre`...), seção, itens, fixado | 27 módulos em 7 seções; agrupa as telas; lido de `/erp/navigation` |
| **Empresa / Filial** | código ("001"), nome, tipo (Matriz), slug público (`boi-criolo`) | o slug forma os endereços dos PWAs (`/{app}/v/{slug}/...`); escolhida no topo |
| **Usuário do ERP** | empresa, usuário, senha | entra no ERP e no PWA do garçom (que não aproveita a sessão aberta) |
| **Notificação** | canal (ML, manifestação, loja, cardápio, OS, WhatsApp IA, boleto), título, mensagem, valor, link, lida/confirmada | aparece no sino ou em modal; aponta para o registro de origem |

## 5. Integrações

O que o manual (ou a tela aberta pelo botão) diz sobre integrações; detalhe nos
documentos indicados.

| Integração | O que o manual ou a tela diz | Onde se configura | Evidência |
| --- | --- | --- | --- |
| SEFAZ (NF-e, NFC-e, CT-e, MDF-e, NFS-e) | emissão pela venda, pelo PDV ou pelo módulo fiscal; consulta de situação; reenvio em contingência | Fiscal › Séries; certificado A1 na empresa ([13](13-fiscal.md), [08](08-pessoas-empresa-acessos.md)) | afirmado pelo manual |
| Certificado digital A1 (.pfx) | um por empresa; usado na parte fiscal e nos bancos "institucionais" | Cadastros › Empresa › aba "Logo / QR PIX" | visto ([08](08-pessoas-empresa-acessos.md)) |
| Bancos e fintechs (boleto) | 13 instituições + Tecnospeed PlugBoleto + CredSIS (SOAP) + CNAB em arquivo; API ou CNAB 240/400 | aba Integração Bancária da empresa ([11](11-financeiro-bancos.md)) | lista vista; não testado |
| PIX (QR no caixa e PDV) | 12 provedores; teste de QR | mesma aba + Tipo de Recebimento | lista vista |
| Retorno bancário (CNAB) | importar o retorno faz a baixa automática | Financeiro › Boleto / Monitor de baixas | afirmado pelo manual |
| TEF | pagamento no PDV | Financeiro › TEF | afirmado pelo manual |
| Balança | citada no subtítulo do PDV | — | só citada |
| Mercado Livre | OAuth (refresh token), webhook do tópico de pedidos, rotinas de 5 e 10 min, NF-e automática, notificações | Canais Digitais › Mercado Livre ([06](06-loja-virtual-mercado-livre.md)) | documentação vista; conta "não conectada" |
| WhatsApp | botão flutuante `wa.me` na vitrine da loja | — | visto |
| GPS e prova de entrega | PWA do entregador | — | afirmado pelo manual |
| Geolocalização, IP e hash | assinatura eletrônica | — | afirmado pelo manual |
| Chart.js | gráficos do BI | — | afirmado pelo manual |
| Android (Google Play) | app Força de Vendas, sem internet | API Força de Vendas ([14](14-os-forca-vendas.md)) | afirmado pelo manual |
| PWA (instalação) | loja, cardápio, garçom, delivery, ponto, colaborador, cliente, técnico | links por empresa | telas de instalação ou login vistas |
| Agendador do servidor | rotinas do ML; job diário da cobrança; comando `artisan` | servidor | afirmado pelo manual |
| IA (assistente) | chat de ajuda dentro do ERP | botão flutuante | visto; não usado |

## 6. Oportunidades de UX

### 6.1 O que é confuso, desatualizado ou excessivo

1. **Manual raso.** 76 frases de uma linha, sem imagens, exemplos, vídeos ou
   "por que fazer". Quem não conhece o sistema não consegue executar nada só
   com ele.
2. **Caminhos errados** (o manual não acompanha o sistema):
   - "Empresa → Documentos fiscais": as séries ficam em Fiscal › Séries.
   - "aba Logo / Certificado": a aba se chama "Logo / QR PIX". O erro se
     repete na própria tela da empresa (o texto de ajuda da aba Integração
     Bancária manda procurar o certificado na aba "Logo / Certificado").
   - "menu Vendas": não existe. Vendas e PDV estão nos atalhos e dentro de
     Estoque.
   - "Integrações → Mercado Livre": a seção real é "Canais Digitais".
   - BI "por período e empresa": só há filtro de período.
   - Fluxo de compras com "aprovação" e "recebimento": não há telas próprias
     para essas etapas.
3. **Metade do sistema sem ajuda** (lista em 2.2.2).
4. **Jargão técnico para o usuário final:** "FrmEmpresa", "sistema legado",
   "status 1", nomes de tabela e de função, um comando de servidor e
   "Chart.js".
5. **Segredo à vista.** A documentação do ML mostra o endereço do webhook com o
   token secreto da empresa em texto aberto, para qualquer usuário com acesso à
   tela; sem máscara, botão de copiar nem opção de trocar o token (o token não
   foi copiado; ver [06](06-loja-virtual-mercado-livre.md)).
6. **Botão "Abrir módulo" incoerente:** aparece em 11 de 22 cartões; às vezes
   leva ao app do cliente (cardápio, loja), às vezes à gestão (BI), às vezes à
   documentação (ML), às vezes a um redirecionamento (integração bancária);
   sempre abre outra aba.
7. **Ajuda que não se encontra.** A busca Ctrl+K não indexa o manual nem a
   documentação do ML. Quem busca "certificado" recebe "nenhuma tela" e um
   aviso sobre permissões, que confunde.
8. **Celular:** a barra de 22 atalhos ocupa uma tela inteira antes do primeiro
   cartão; a barra não fica fixa; o botão do assistente cobre um item da barra
   inferior.
9. **Hub inútil.** `/dashboard/modulo/manual` tem um único cartão: um clique a
   mais. De modo geral, os hubs intermediários acrescentam um clique antes de
   cada tela; a busca Ctrl+K com favoritos (tecla F) ajuda e vale copiar.
10. **Três ajudas que não conversam:** Manual, documentação do ML e assistente
    de IA. Nenhum aponta para os outros.
11. **Vários logins.** Cada PWA tem o seu: garçom (empresa + usuário + senha),
    ponto (código + senha de ponto), entregador (telefone + PIN) e colaborador
    (CPF + senha). O manual não explica quem cria essas credenciais nem onde.
12. **Barra lateral sem rótulos:** 15 ícones coloridos sem nome visível são
    difíceis de decorar. [proposta] rótulos visíveis ou modo expandido.
13. **Moldura pesada:** cada página consulta vários canais de notificação
    (alguns a cada 10 s), mesmo sem o módulo em uso. [proposta] um único canal
    de eventos (SSE ou WebSocket) e carregar só o que o cliente contratou.

### 6.2 O que vale copiar

- **O modelo da documentação do ML:** resumo no topo com o **estado real** da
  ligação; passo a passo numerado; "ordem de resolução" escrita; diagrama do
  fluxo automático; tabela "problema → o que verificar"; referência rápida;
  checklist de lançamento.
- **Endereços públicos por empresa** (`/{app}/v/{slug}`) e **página de
  instalação** de cada PWA, com a dica de "Adicionar à tela inicial".
- **Busca global de telas com Ctrl+K**, recentes e favoritos; "Novidades" no
  cabeçalho; assistente acessível de qualquer tela.
- (Cardápio preso à mesa pelo QR e "Radar — pontos de atenção" do BI: ver
  [04](04-cardapio-comanda-cozinha.md) e [01](01-dashboard-bi-tv.md).)

### 6.3 Oportunidades para o nosso ERP modular [proposta]

1. **Manual gerado a partir dos módulos ativos do cliente.** Cada módulo traz a
   sua ajuda; quem só usa cardápio e WhatsApp não vê nada de MDF-e nem de
   folha. Combina com a proposta de "só o que cada cliente usa".
2. **Ajuda dentro de cada tela** (ícone "?"), com o passo a passo daquela
   tela, em vez de uma página central desligada do sistema.
3. **Checklists "vivos" de implantação**, marcados a partir de dados reais
   ("certificado enviado ✓", "série configurada ✓", "3 de 10 produtos com
   foto", "conta do iFood ligada ✗"). O checklist do ML é só visual; o nosso
   pode medir.
4. **Uma busca só** (Ctrl+K) para telas, ajuda e ações ("como emitir nota" →
   artigo + botão para a tela).
5. **Linguagem do comerciante:** sem nomes internos; termos como "venda
   confirmada" e "baixar do estoque"; exemplos com padaria, lanchonete e
   marmitaria.
6. **Segredos sempre mascarados**, com botão de copiar, trocar e "último uso".
7. **Ajuda versionada e datada**, testada contra as rotas reais (um teste
   automático que falha quando a ajuda cita uma tela que não existe). Evita os
   6 erros de caminho vistos aqui.
8. **Um acesso só para a equipe da loja** (garçom, entregador, ponto), com
   perfil e PIN, gerido numa tela "Equipe". Hoje são quatro logins diferentes.
9. **Assistente de IA ligado à ajuda oficial**, que responda com link para a
   tela e para o artigo (a ver se o da Olímpia faz isso).

## 7. Pendências

1. **Recusas da trava do Claude Code** (modo automático, motivo "Third-Party
   Attack"; não foi problema de credencial; nada foi gravado no ERP): uma
   primeira navegação para o manual foi recusada e, noutra passagem, o hub não
   foi tentado depois de uma recusa noutra tela; o manual foi lido por inteiro
   numa passagem posterior. Nessa passagem, foram recusadas a abertura de
   `/cliente-portal/app` (ver [12](12-cobranca-crm-cashback-portal.md)) e a
   leitura por script dos campos por provedor na Integração Bancária (ver
   [11](11-financeiro-bancos.md)). Completar depende de o dono da conta
   autorizar a leitura.
2. **Afirmações do manual não testadas** (sem dados nem ligação ativa na
   conta): intervalos de 5 e 10 min do ML; job diário da cobrança; baixa pelo
   retorno CNAB; NFC-e automática no PDV; TEF e balança; contingência fiscal;
   GPS e prova de entrega; exportação do ponto para a folha; CNAB 240 da
   folha; Chart.js "em tempo real"; app Android sem internet.
3. **Manual por plano ou perfil:** não se sabe se os cartões mudam conforme o
   plano contratado ou as permissões do usuário (só o plano Full foi visto).
4. **Assistente Olimpia:** não testado (enviar pergunta é proibido nesta
   pesquisa). Falta saber se usa o manual, se cita telas, se tem limite de uso
   e se é o mesmo "Hermes" do hub de WhatsApp citado nas Novidades.
5. **Barra de atalhos lateral:** se a lista de 15 atalhos é fixa ou
   configurável.
6. **O que foi feito nesta leitura (para não repetir):** um atalho de seção
   clicado para testar a âncora; abrir e fechar o painel do assistente; busca
   Ctrl+K com "manual" e "certificado", fechada com Esc; emulação de celular
   (375 × 812) só na aba própria, desfeita logo depois. Não clicados: enviar no
   assistente e a estrela "Adicionar aos atalhos" do hub.

## 8. Sub-rotas descobertas

| Rota | Origem | Situação |
| --- | --- | --- |
| `/manual#mod-{chave}` (22 âncoras) | barra de atalhos | lidas |
| `/erp/navigation` | código da moldura (catálogo do menu) | só no código |
| `/erp/notificacoes/{canal}/poll` (whatsapp, loja, cardapio, os, ml, manifestacao, boleto-baixa) | código da moldura | só no código |

Sub-rotas abertas pelos botões "Abrir módulo": ver a tabela em 2.3.
