# 922 — Lacunas, lote 23: Manual do sistema (`/manual`) (ERP Olímpia)

> **Estado: explorado.** A rota `/manual` abriu com a sessão já ativa e foi lida
> inteira: texto, árvore de acessibilidade, estrutura da página e capturas de tela
> (computador e celular). Data: 2026-10-03. Conta de teste "Boi Criolo" (plano Full).
>
> - Também foram abertas **9 sub-rotas**: o hub do módulo e 8 destinos dos botões
>   "Abrir módulo" do manual. Vários deles redirecionam para outro endereço.
> - **A trava do Claude Code (modo automático) recusou 2 ações**, sempre com o motivo
>   "Third-Party Attack":
>   1. uma leitura por script, na aba Integração Bancária do cadastro da empresa, para
>      saber quais campos cada provedor bancário mostra;
>   2. abrir o PWA do Portal do Cliente (`/cliente-portal/app`).
>
>   Depois de cada recusa, aquele objetivo foi abandonado. Não houve nova tentativa por
>   outro caminho.
> - O arquivo `22-manual.md` registra só um bloqueio antigo e não tem conteúdo do
>   manual. **Para o manual, a fonte é este arquivo.** O `22-manual.md` não foi alterado,
>   porque esta tarefa só permite criar este arquivo.
>
> Marcação usada:
> - **[visto]**: apareceu na tela, na árvore de acessibilidade ou na estrutura da página;
> - **[afirmado pelo manual]**: é o que a Olímpia escreve. Não foi testado no ERP;
> - **[deduzido]**: conclusão direta do que foi visto;
> - **[a verificar]**: hipótese.

## Em palavras simples

1. **O "Manual" é uma página só.** Ela não tem busca, imagens nem vídeos. São 22
   cartões, um por área do sistema. Cada cartão tem de 3 a 5 passos curtos, num total
   de 76 passos.
2. **É mais um mapa do sistema do que um manual de uso.** Ele diz "o que existe" e
   "onde fica", mas quase nunca explica "como fazer" ou "por que".
3. **11 cartões têm o botão "Abrir módulo".** O botão abre outra aba. Em geral leva ao
   app público da área (PWA: loja, cardápio, garçom, entregador, ponto, colaborador,
   cliente, técnico), e não à tela de gestão.
4. **A melhor ajuda do ERP não está no Manual.** Ela está na página "Documentação" da
   integração com o Mercado Livre, que tem passo a passo, diagrama do fluxo, tabela de
   problemas e checklist de lançamento. É o modelo que vale copiar.
5. **O manual está desatualizado em vários pontos.** Há nomes de abas e caminhos de
   menu que não existem mais (lista na secção 6.1).
6. **O manual conta regras que as telas não mostram.** Exemplos: rotinas automáticas do
   Mercado Livre a cada 5 e a cada 10 minutos, "job" diário da cobrança, baixa de
   boletos pelo arquivo de retorno do banco e NFC-e automática no PDV. São afirmações
   da Olímpia, não testadas aqui.
7. **O texto foi escrito para técnicos.** Ele cita nomes internos ("FrmEmpresa",
   "status 1", nomes de tabela e um comando de servidor). Isso não serve ao nosso
   público, que é o pequeno comerciante.
8. **Falha de segurança na documentação do Mercado Livre.** A página mostra, em texto
   aberto e para qualquer usuário que a abra, o endereço do webhook com o token secreto
   da empresa. O token **não** foi copiado para este arquivo.
9. **Nada foi gravado, enviado ou alterado no ERP.**

## Registro técnico

- Aba própria no navegador embutido (`tab-55`), fechada no fim. Nenhuma outra aba foi
  usada.
- Navegações (só leitura): `/manual`, `/dashboard/modulo/manual`,
  `/integracoes/mercado-livre/documentacao`, `/financeiro/integracao-bancaria`,
  `/bi`, `/loja/app`, `/loja/v/boi-criolo`, `/cardapio/app`,
  `/cardapio/v/boi-criolo`, `/garcom/app`, `/delivery/app`, `/ponto/app`. A navegação
  para `/cliente-portal/app` foi recusada.
- Cliques feitos:
  - um atalho de secção do manual, para testar a âncora;
  - 3 acordeões da documentação do Mercado Livre;
  - abrir e fechar o painel do "Assistente Olimpia";
  - abrir a busca de telas (Ctrl+K), digitar "manual" e depois "certificado", e fechar
    com Esc.
- Emulação de celular (375 × 812) só na aba própria, desfeita logo depois.
- Leituras por script, só de estrutura: cartões do manual (ids, ícones, número de
  passos, links e destino dos links), estilo da barra de atalhos, posição do Manual no
  menu, lista de módulos e alguns submenus do menu lateral, acordeões, selos e tabelas
  da documentação do Mercado Livre, campos e botões da aba Integração Bancária (nome,
  tipo, rótulo, opções) e texto do painel do assistente.
- **Valores não lidos:** os campos de senha, token e segredo e o token anti-CSRF dos
  formulários. Do formulário, só se registrou se o campo estava vazio ou preenchido.
- **Não foram clicados:**
  - "Salvar integração bancária", "Testar conexão (autenticação)" e "Testar geração
    QR Code";
  - "Atualizar dados" e "Imprimir painel", no BI;
  - "Entrar", nos PWAs;
  - o botão de enviar do assistente;
  - a estrela "Adicionar aos atalhos", no hub;
  - carrinho, favoritos e login da vitrine;
  - o botão de WhatsApp.
- **Dados omitidos:** token do webhook do Mercado Livre, telefone de WhatsApp da
  empresa e CNPJ.

---

## 1. Visão geral do módulo

**Onde fica [visto]:**
- No menu lateral, o Manual é o último item da secção "SISTEMA", depois de
  Mensalidades, Parâmetros e Utilitários. A chave do módulo é `manual`.
- O submenu tem "Ver todos" (`/dashboard/modulo/manual`), o grupo "Documentação" e um
  único item, "Manual Completo" (`/manual`).
- Como os outros módulos, tem o botão "Fixar manual", que fixa o módulo no menu.

**O que é [visto]:**
- Uma página estática, montada no servidor, com:
  - um cabeçalho escuro;
  - uma barra de 22 atalhos ("pílulas") que levam a âncoras;
  - 22 cartões (`article.manual-card`), cada um com id `mod-{chave}`, ícone, título,
    subtítulo, lista numerada de passos e, às vezes, o botão "Abrir módulo".
- Os ícones são da biblioteca Bootstrap Icons. O idioma da página é `pt-BR` e o título
  da aba é "Manual do Sistema".

**Sinais de como o manual é feito [deduzido]:**
- As chaves das âncoras coincidem em parte com as chaves dos módulos do menu
  (`mercado_livre`, `cardapio`, `os`, `bi`, `cobranca`, `cliente`, `loja`, `delivery`,
  `ponto`, `folha`, `colaborador`, `compras`, `financeiro`, `fiscal`).
- Outras chaves só existem no manual (`erp`, `vendas`, `pdv`, `bancos`, `estoque`,
  `garcom`, `assinatura`, `forca-vendas`).
- Conclusão: o manual é uma lista escrita à mão, e não gerada a partir do cadastro de
  módulos. Por isso está desatualizado em relação ao menu.
- Há alguma personalização por empresa. Dois botões "Abrir módulo" já trazem o
  identificador da empresa no endereço (`/colaborador/v/boi-criolo/app` e
  `/os/v/boi-criolo/tecnico/app`), enquanto o texto do manual cita a forma genérica
  (`/colaborador/app`, `/os/tecnico/app`).
- [a verificar] Se o manual esconde cartões de módulos que a empresa não contratou.
  Com o plano Full aparecem os 22, e não houve como testar outro plano.

### 1.1 O que o manual revela sobre o sistema [afirmado pelo manual, salvo indicação]

- **Várias empresas e filiais:** o login pede empresa, usuário e senha, e a filial se
  escolhe no topo. A tela de login do PWA do garçom confirma o padrão: tem uma lista
  de empresas antes de usuário e senha [visto].
- **Sistema desktop antigo:** a migração aparece no texto, que cita o formulário
  "FrmEmpresa" e diz "como no sistema legado". A tela da empresa repete a nota
  "equivalente a FrmEmpresa" [visto].
- **Base técnica:** a documentação do Mercado Livre cita o comando de servidor
  `php artisan ml:sync-automatico`. [deduzido] O backend é PHP com Laravel.
- **Rotinas agendadas:** Mercado Livre a cada 5 min (pedidos) e a cada 10 min
  (estoque), webhook do Mercado Livre, "job" diário da cobrança e baixa por arquivo de
  retorno do banco.
- **PWAs por empresa:** cada app público tem endereço próprio no formato
  `/{app}/v/{slug-da-empresa}/...` [visto nos redirecionamentos].
- **BI com Chart.js**, com dados "em tempo real".
- **App Android nativo** (Força de Vendas), com pedidos feitos sem internet e enviados
  depois.
- **"13 bancos" no financeiro:** a lista de provedores de boleto tem 13 bancos e
  fintechs, mais Tecnospeed, CredSIS e CNAB em arquivo [visto, secção 2.3.2].

---

## 2. Telas

### 2.1 `/dashboard/modulo/manual`: hub do módulo [visto]

- **Objetivo:** é a porta de entrada do módulo, no mesmo modelo dos hubs dos outros
  módulos.
- **Conteúdo:**
  - cabeçalho "Manual do Sistema" com o link "Voltar ao dashboard";
  - um grupo, "Documentação", com um único cartão, "MANUAL COMPLETO" (ícone de livro),
    que leva a `/manual`.
- **Ação extra:** a estrela "Adicionar aos atalhos" no cartão (não clicada).
- Não há lista, filtro nem formulário.
- **Comportamento:** é um clique a mais sem ganho, porque o módulo tem só uma tela.

### 2.2 `/manual`: Manual Completo [visto]

**Objetivo:** guia rápido de todas as áreas do ERP, com um atalho para os apps.

**Estrutura:**
1. **Cabeçalho:** título "Manual do Olimpia ERP" e uma frase que promete um guia de
   22 módulos, PWAs e fluxos integrados (fiscal, financeiro com 13 bancos, delivery, RH
   e BI).
2. **Barra "Módulos":** 22 atalhos com ícone, um por cartão (`href="#mod-..."`).
3. **22 cartões.** Cada um tem:
   - ícone colorido;
   - título e subtítulo de uma linha;
   - de 3 a 5 passos numerados, com uma frase cada;
   - às vezes, o botão "Abrir módulo".

**Lista / filtros / formulário:** não há. As únicas ações são os 22 atalhos de âncora e
os 11 botões "Abrir módulo".

**Comportamento [visto]:**
- O atalho rola a página com animação até o cartão (margem de 80 px para o
  cabeçalho fixo). O endereço ganha `#mod-...`, e o atalho fica destacado enquanto
  tiver o foco.
- A barra de atalhos **não é fixa**: depois de rolar, para trocar de secção é preciso
  voltar ao topo. Não há botão "voltar ao topo".
- "Abrir módulo" abre **outra aba** do navegador (`target=_blank`, `rel=noopener`).
- Não existem:
  - busca dentro do manual;
  - impressão ou PDF;
  - data de atualização ou versão;
  - imagens, vídeos ou links para telas específicas.

**Medidas [visto]:**
- No computador (cerca de 1.100 px de largura), a página tem perto de 7.500 px de
  altura.
- No celular (375 px):
  - a barra de atalhos ocupa **812 px**, ou seja, uma tela inteira;
  - o primeiro cartão só começa por volta de 1.180 px;
  - a página chega a cerca de 11.000 px;
  - não há rolagem horizontal;
  - o botão flutuante do assistente fica por cima da barra inferior do celular (item
    "Novidades").

#### 2.2.1 Conteúdo de cada cartão (resumo com palavras nossas)

"Onde fica hoje" vem do menu lateral, lido na mesma sessão. Legenda: ✅ coerente;
⚠️ diferente do sistema atual.

| # | Cartão (id) | Passos | O que o manual diz (resumo) | "Abrir módulo" → | Onde fica hoje no menu | Coerência |
|---|---|---|---|---|---|---|
| 1 | ERP Core & Dashboard (`mod-erp`) | 4 | entrar com empresa, usuário e senha; escolher a filial no topo; usar o menu agrupado por área; ver as novidades em Utilitários → Melhorias e Ajustes | — | Utilitários › Melhorias e Ajustes (`/sistema-melhorias`) e botão "Novidades" no topo | ✅ (os exemplos de grupos do menu não batem com os nomes reais das secções) |
| 2 | Vendas & Orçamentos (`mod-vendas`) | 4 | pedido com cliente e produtos; orçamento convertido em venda faturada; estoque e contas a receber automáticos; NF-e ou NFC-e conforme a operação | — | **não existe módulo "Vendas"**: "Venda Balcão" (`/vendas`) nos atalhos; "Pedido de Venda" e "Faturamento de Vendas" dentro de Estoque › Expedição & Vendas; orçamentos não têm item próprio no menu (aparecem num relatório e, pelo BI, levam a Faturamento de Vendas) | ⚠️ |
| 3 | PDV / Frente de Caixa (`mod-pdv`) | 4 | entrar pelo "menu Vendas"; abrir o caixa, com sangrias e reforços; vários meios de pagamento e TEF; NFC-e automática quando configurada | — | atalho "Venda PDV" (`/pdv`); TEF em Financeiro › TEF | ⚠️ ("menu Vendas" não existe) |
| 4 | Documentos Fiscais (`mod-fiscal`) | 4 | séries em "Empresa → Documentos fiscais"; enviar o .pfx na aba "Logo / Certificado"; emitir por vendas, PDV ou módulo fiscal; consultar a situação na SEFAZ e reenviar em contingência | — | séries em **Fiscal › Séries** (`/fiscal-series`); certificado na aba **"Logo / QR PIX"** de Cadastros › Empresa (ver `96-lacunas-7.md`) | ⚠️ (dois caminhos errados) |
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

Total: 76 passos. 11 cartões com "Abrir módulo" (bancos, loja, ML, cardápio, garçom,
delivery, ponto, colaborador, cliente, OS e BI).

#### 2.2.2 Módulos do menu que o manual não cobre [visto no menu]

O menu lateral tem **27 módulos em 7 secções**:

| Secção | Módulos |
|---|---|
| Visão Geral | BI Executivo, Consultoria, Relatórios |
| Vendas & Atendimento | Ordem de Serviço, CRM, Cashback, Cobrança, Portal Cliente |
| Canais Digitais | Loja Virtual, Mercado Livre, Cardápio Digital, Painel TV, Delivery |
| Operações | Cadastros, Sinuca, Estoque, Produção, Compras |
| Financeiro & Fiscal | Financeiro, Fiscal |
| Pessoas & RH | Ponto, Folha, Portal Colaborador |
| Sistema | Mensalidades, Parâmetros, Utilitários, Manual |

O menu também tem o Dashboard e os "Atalhos rápidos".

Ficam **sem cartão** no manual:
- Consultoria (Gestão 360°, IA Advisor);
- Relatórios (a Central tem 132 relatórios, ver `916-lacunas-17.md`);
- CRM e Cashback;
- Painel TV;
- Cadastros (29 itens);
- Sinuca;
- Produção (9 itens);
- Mensalidades;
- Parâmetros (cerca de 420 opções, ver `96-lacunas-7.md`);
- comissões e metas;
- dentro do Financeiro: Portal do Contador, TEF/POS, Controle de cartões e
  Conciliação.

Ou seja, **justamente as partes mais difíceis de configurar não têm ajuda.**

### 2.3 Sub-rotas abertas pelos botões "Abrir módulo"

#### 2.3.1 `/integracoes/mercado-livre/documentacao`: Documentação da integração Mercado Livre [visto]

**Objetivo:** manual próprio da integração. Explica como configurar, como vincular
produtos e o que acontece sozinho depois.

**Estrutura da página:**
- **Cabeçalho** com dois botões: "Configuração" (→ `/integracoes/mercado-livre/config`)
  e "Pedidos" (→ `/integracoes/mercado-livre/pedidos`).
- **Faixa "Resumo"** com um selo de estado da ligação: aqui, "Conta não conectada"
  (cinza). Ou seja, a documentação mostra a situação real da conta.
- **7 atalhos de secção:** Visão geral, Configuração, Produtos e anúncios, Fluxo
  automático, Funcionalidades, Telas do ERP e Solução de problemas.
- **Coluna lateral "Referência rápida":**
  - URL do webhook da empresa, **com o token secreto em texto aberto (omitido aqui)**;
  - URL de retorno do OAuth;
  - intervalos das rotinas (5 min e 10 min);
  - comando de servidor para rodar a sincronização à mão.
- **Coluna lateral "Checklist de go-live":** 6 itens, só visuais (não há caixas de
  marcar de verdade).

**Conteúdo (resumo com palavras nossas):**

1. **Visão geral:** quando o comprador paga no ML, o ERP:
   - importa o pedido como venda confirmada;
   - baixa o estoque pela mesma regra das vendas internas;
   - avisa no sino;
   - devolve o saldo aos anúncios vinculados;
   - e, se a opção estiver ativa, emite a NF-e.

   A venda fica marcada com o canal "Mercado Livre".
2. **Configuração:**
   - **No portal do ML:**
     - criar o aplicativo (produção ou teste) e anotar o Client ID e o Client Secret;
     - cadastrar o endereço de retorno do OAuth, que é fixo do ERP;
     - cadastrar a URL de notificações, que é própria de cada empresa e leva um
       token;
     - ligar o tópico de pedidos (`orders_v2`).
   - **No ERP** (Mercado Livre → Conexão e parâmetros):
     - informar Empresa, Client ID e Client Secret;
     - escolher operação de venda, operação de estoque, portador e forma de pagamento
       padrão;
     - marcar "Integração ativa";
     - conectar a conta (autorização no ML);
     - salvar e registrar o webhook automaticamente (ou conferir a URL no painel do
       ML).
   - **Opções recomendadas:**
     - atualizar o estoque no ML depois de cada venda: ligado;
     - emitir NF-e sozinho: só com certificado A1 e dados fiscais do cliente corretos;
     - vendedor ou usuário padrão: define quem aparece como responsável pela venda
       importada.
3. **Vincular produtos e anúncios.** Para descobrir o produto de cada item, o ERP
   procura nesta ordem:
   1. a tabela de vínculos (anúncio "MLB..." → produto);
   2. o SKU do anúncio igual ao "ID integração" ou ao código do produto.

   Há duas formas de vincular:
   - à mão, na tela Anúncios vinculados;
   - pelo botão "Importar anúncios ML", que vincula sozinho quando o SKU bate.

   **Pedido com item sem vínculo não é importado.**
4. **Fluxo automático:** ver a secção 3, fluxo B.
5. **Funcionalidades** (4 acordeões):
   - **Importação de pedidos:** só pedidos pagos ou confirmados; sem duplicar (controle
     pelo ID do pedido no ML); cria a venda confirmada com o frete e os totais do ML,
     e com a observação "Venda Mercado Livre #ID".
   - **Baixa e sincronização de estoque:** usa o mesmo motor de baixa das vendas
     internas e o saldo da empresa configurada na integração. Envia ao ML a
     quantidade disponível. Tem o botão "Sincronizar estoque", que força a
     atualização de todos os anúncios.
   - **NF-e automática:** emite logo depois de importar, com a operação de venda da
     integração. A situação aparece em Pedidos ML (emitida / erro / ignorado). Há
     também emissão manual na tela do pedido.
   - **Notificações:** janela automática a cada venda nova, secção "Mercado Livre" no
     sino do topo e link direto para o pedido.
6. **Telas do ERP:** tabela com Configuração, Pedidos, Anúncios e o menu Vendas, onde
   a venda aparece com o selo do canal.
7. **Solução de problemas:** tabela "problema → o que verificar" com 5 casos:
   - pedido não importou;
   - estoque não baixou;
   - o ML não atualizou a quantidade;
   - NF-e com erro;
   - token expirado. Aqui o texto diz que reconectar resolve e que a renovação é
     automática, pelo refresh token.

**Regras de negócio que só aparecem aqui [afirmado pelo manual]:**
- O status de venda "1" significa venda confirmada. O texto cita a tabela de controle
  de pedidos do ML e a função de baixa de estoque pelos nomes internos.
- O cliente da venda é criado ou atualizado pelo CPF/CNPJ do comprador.
- Se o webhook falhar, uma rotina de 5 min busca os pedidos pagos recentes e reprocessa
  os webhooks pendentes com falha.
- A sincronização de estoque a cada 10 min vale só para anúncios com sincronização
  ativa.
- [deduzido] **O preço não é sincronizado:** o texto só fala da quantidade disponível.
- A importação manual de pedidos existe só para testes ou para recuperar um caso
  pontual.
- [deduzido] Uma integração por empresa (Client ID e Secret ficam no cadastro da
  integração, ligados à "Empresa"). Não há sinal de várias contas do ML por empresa.

#### 2.3.2 `/financeiro/integracao-bancaria` → `/empresa/1#tab-integracao` [visto]

- **O item de menu e o botão do manual não têm tela própria.** Eles redirecionam para
  a aba "Integração Bancária" do cadastro da **empresa nº 1** (a Matriz).
  - [a verificar] Numa conta com filiais, se o atalho abre sempre a empresa 1.
- **Cabeçalho:** "Empresa #1", com a nota de equivalência ao formulário antigo e o
  selo "Matriz".
- **Abas:** link "Todas as filiais", Cadastro, **Logo / QR PIX**, Integração Bancária
  e Parâmetros. Repare que o próprio texto de ajuda desta aba manda procurar o
  certificado na aba "Logo / Certificado", que tem outro nome.
- **Conteúdo:** confirma o que o `96-lacunas-7.md` já descreveu. Novidades desta
  passagem:
  - **Provedores de boleto (16 + "Não utilizar"), com o código interno:**
    - Tecnospeed PlugBoleto `tecnospeed`
    - CredSIS (SOAP) `credsis`
    - Banco do Brasil `banco_brasil`
    - Itaú `itau`
    - Bradesco `bradesco`
    - Santander `santander`
    - Caixa `caixa`
    - Sicredi `sicredi`
    - Sicoob `sicoob`
    - Banrisul `banrisul`
    - Inter `inter`
    - Efí `efi`
    - Asaas `asaas`
    - C6 Bank `c6_bank`
    - BTG Pactual `btg_pactual`
    - CNAB legado (arquivo) `legacy_cnab`
  - **Provedores de PIX (12 + "Não utilizar"):** os mesmos, menos CredSIS, Banco do
    Brasil, Banrisul e CNAB legado.
  - **Campos do boleto** (no HTML, nenhum é obrigatório; aparecem conforme o
    provedor):

    | Campo | Tipo |
    |---|---|
    | Cedente | lista, padrão "Padrão" |
    | Conta bancária | lista, opcional |
    | Token / API Key | senha |
    | Convênio CredSIS | texto |
    | Layout | texto, já preenchido |
    | Formato | PDF ou HTML |
    | Client ID | texto |
    | Client Secret | senha |
    | x-api-key (Access Token do portal) | senha |
    | Ambiente da API C6 Bank | Produção ou Sandbox |
    | Código de Acesso (Internet Banking) | senha |
    | Ambiente da API | Produção ou Validação (sandbox/homologação) |
    | Layout remessa | API bancária, CNAB 240 ou CNAB 400 |
    | Customer ID Asaas | opcional |
    | URL base | opcional |
    | Timeout (s) | já preenchido |

  - **Campos do PIX:**

    | Campo | Tipo |
    |---|---|
    | Cedente | lista |
    | Conta bancária | lista |
    | Chave PIX (recebimento) | texto; exemplo: CPF, CNPJ, e-mail, telefone ou chave aleatória |
    | Token / API Key | senha |
    | Client ID | texto |
    | Ambiente da API C6 Bank | Produção ou Sandbox |
    | Client Secret | senha |
    | URL base | opcional |
    | Timeout (s) | número |

  - **Botões (nenhum clicado):**
    - "Testar conexão (autenticação)": chama um teste por provedor
      (`/financeiro/integracao-bancaria/{driver}/testar`);
    - "Testar geração QR Code": usa um valor de teste
      (`/empresa/{id}/integracao-bancaria/testar-pix`) e abre uma janela com o "PIX
      copia e cola", o botão Copiar e o aviso para não pagar a cobrança de teste;
    - "Salvar integração bancária": é um formulário separado do "Salvar" principal da
      empresa.
  - **Ajudas da tela (resumo):**
    - CredSIS funciona por SOAP, com registro online e consulta de liquidação.
    - Sicredi é "híbrido": pede as credenciais do app, o token de acesso e um código
      gerado no internet banking. O boleto sai registrado na hora e a baixa consulta o
      banco de poucos em poucos minutos.
    - C6 e Sicredi têm ambiente de teste e a recomendação é começar por ele.
    - Os bancos "institucionais" exigem o certificado A1.
    - O PIX em produção também exige marcar "Gerar QRCode PIX" na forma de recebimento.
- **Não determinado:** quais campos cada provedor mostra. A leitura por script com esse
  objetivo foi recusada pela trava do Claude Code. A mesma informação não foi
  procurada por outro caminho (por exemplo, trocando o provedor na lista).

#### 2.3.3 `/bi`: Painel Executivo [visto]

- **Período:** links `?periodo=7d`, `30d` (padrão), `90d` e `12m`. O cabeçalho mostra
  as datas do período e avisa que os números são comparados com o período anterior.
  **Não há filtro de empresa**, ao contrário do que diz o manual.
- **Botões:** "Atualizar dados" e "Imprimir painel" (não clicados).
- **12 indicadores**, com links:
  - Faturamento e Qtd. de vendas (→ `/vendas?status=1`);
  - Ticket médio;
  - Clientes atendidos;
  - Recebido no período (→ Contas a receber);
  - A receber ("Abrir") e Receber vencido ("Cobrar"), que levam a
    `/financeiro/receber`;
  - A pagar (→ `/financeiro/pagar`);
  - Valor em estoque;
  - Orçamentos pendentes ("Faturar" → `/financeiro/faturamento`);
  - Pedidos loja + app;
  - Colaboradores no ponto.
- **"Radar — pontos de atenção"** (5 itens):
  - receber vencido;
  - pagar vencido;
  - orçamentos aguardando faturamento;
  - produtos abaixo do estoque mínimo (link genérico para a Central de Relatórios);
  - saldo previsto (receber − pagar).
- **11 gráficos ou listas:**
  - vendas no período (valor e quantidade);
  - fluxo de caixa previsto das próximas 8 semanas;
  - receber em aberto por faixa de atraso;
  - top 10 produtos;
  - top 10 clientes;
  - top vendedores;
  - vendas por forma de pagamento;
  - receber × pagar em aberto;
  - pedidos por canal;
  - evolução mensal em 12 meses;
  - horas extras do ponto em 30 dias.
- Tudo está zerado ou "Sem dados no período", porque a conta não tem movimento.
- [deduzido] O BI mistura vendas, financeiro, estoque, canais e RH numa tela só. É a
  "visão do dono".

#### 2.3.4 `/loja/app` → `/loja/v/{slug}/app` → vitrine `/loja/v/{slug}` [visto]

- **Página de instalação:** nome da loja, convite para instalar o app ou abrir a
  vitrine, botão "Abrir loja" e a dica de usar "Adicionar à tela inicial" no celular.
- **Vitrine:**
  - busca de produtos;
  - categorias (`/categorias`), favoritos (`/conta/favoritos`), carrinho
    (`/carrinho`) e login do cliente (`/login`);
  - blocos "Ofertas que você vai amar" (destaques) e "Lançamentos", ambos vazios, com
    instrução ao lojista para marcar produtos em destaque;
  - aviso para configurar banners em Loja Virtual → Configurações;
  - botão flutuante de WhatsApp, que abre `wa.me` com uma mensagem pronta (número da
    empresa omitido aqui).
- [deduzido] Os avisos para o lojista aparecem na vitrine pública que o cliente final
  vê.

#### 2.3.5 `/cardapio/app` → `/cardapio/v/{slug}/app` → `/cardapio/v/{slug}` → `/cardapio/v/{slug}/sem-mesa` [visto]

- A página de instalação tem o botão "Abrir cardápio".
- Sem o QR de uma mesa, o cardápio redireciona para "sem-mesa", que pede para escanear
  o QR da mesa.
- [deduzido] **O cardápio só funciona dentro do contexto de uma mesa** (identificada
  pelo QR). Não há navegação livre "para viagem" por esse endereço. Os pedidos externos
  aparecem no admin como "Pedidos Online", por outro caminho [a verificar].

#### 2.3.6 `/garcom/app` → `/garcom/v/{slug}/login` [visto]

- Login próprio com: Empresa (lista com "001 - BOI CRIOLO"), Usuário, Senha e "Entrar".
- Usa o **usuário do ERP**, mas não aproveita a sessão já aberta no ERP.

#### 2.3.7 `/delivery/app` [visto]

- Login do entregador com **telefone** (máscara de celular) e **PIN**.
- O endereço **não tem o identificador da empresa**.
- [a verificar] Se o entregador é único entre empresas, identificado pelo telefone.

#### 2.3.8 `/ponto/app` → `/ponto/v/{slug}/app` [visto]

- Login com "Código colaborador" (numérico) e "Senha ponto". Não foi possível ver a
  tela de batida.

#### 2.3.9 Não reabertas ou recusadas

- `/colaborador/v/boi-criolo/app`: não reaberta. Já descrita no `914-lacunas-15.md`
  (login com CPF, app por empresa).
- `/os/v/boi-criolo/tecnico/app`: não reaberta. Já descrita no
  `14-os-forca-vendas.md` (redirecionamento por empresa e login).
- `/cliente-portal/app`: **recusada pela trava do Claude Code.**

### 2.4 Elementos globais vistos na página do manual

- **Assistente Olimpia** (botão flutuante no canto inferior direito):
  - o painel mostra "Online · pronto pra ajudar" e uma saudação informal;
  - diz que responde sobre vendas, PDV, OS, NF-e/NFC-e/NFS-e e parâmetros;
  - tem um campo de pergunta (exemplo: "como emitir NFS-e?") e um botão de enviar;
  - **nenhuma pergunta foi enviada.**
  - [a verificar] Se o assistente usa o conteúdo do manual e se responde com links
    para as telas.
- **Busca de telas (Ctrl+K):**
  - procura **só nomes de telas do menu**;
  - "manual" dá 3 resultados: "Manual — Ver todos", "Manual Completo" e "Entrada
    Manual" (Estoque);
  - "certificado" não acha nada e responde com "verifique suas permissões";
  - tem atalhos de teclado: setas, Enter para abrir e F para favoritar.
  - **Conclusão: o conteúdo do manual não é pesquisável.**
- **Menu lateral:** 27 módulos em 7 secções (tabela em 2.2.2), cada um com "Fixar" e
  "Expandir". No celular, o menu vira "hambúrguer" e aparece uma barra inferior com
  Início, Buscar, Menu e Novidades.

---

## 3. Fluxos de ponta a ponta

Os fluxos abaixo são **o que o manual afirma**. Os trechos confirmados por tela estão
marcados.

**A. Venda balcão ou pedido**
1. Pedido com cliente e produtos.
2. Orçamento convertido em venda faturada.
3. Baixa automática de estoque e título em contas a receber.
4. NF-e ou NFC-e conforme a operação.
5. Baixa do título (manual ou por retorno bancário).
6. O resultado aparece no BI: faturamento, ticket e top produtos [BI visto].

**B. Mercado Livre** (o mais detalhado do manual)
1. Configuração inicial:
   - criar o app no portal do ML;
   - informar Client ID e Secret no ERP;
   - autorizar por OAuth;
   - registrar o webhook.
2. Vincular anúncios a produtos: à mão ou por SKU.
3. Marcar "Integração ativa".
4. Quando o comprador paga, o webhook avisa o ERP, que:
   - busca o pedido na API do ML;
   - cria ou atualiza o cliente (CPF/CNPJ);
   - cria a venda confirmada, com canal ML, frete e totais;
   - baixa o estoque;
   - avisa no sino;
   - devolve o saldo aos anúncios;
   - e, se a opção estiver ativa, emite a NF-e.
5. Se o webhook falhar, a rotina de 5 min recupera os pedidos pagos.
6. A cada 10 min, o saldo é reenviado a todos os anúncios com sincronização ativa.

**C. PDV**
1. Abrir o caixa.
2. Sangrias e reforços.
3. Venda com vários meios de pagamento e TEF.
4. NFC-e automática.
5. Baixa de estoque.
6. Fechamento de caixa ligado ao financeiro.

**D. Boleto e PIX**
1. Escolher o provedor na aba Integração Bancária da empresa.
2. Certificado A1, quando o banco exige.
3. Testar a autenticação ou o QR de teste [botões vistos].
4. Na forma de recebimento, marcar "Gerar QRCode PIX".
5. O PIX aparece no caixa e no PDV.
6. Boleto: gerar a remessa CNAB (ou registrar por API).
7. Importar o retorno, o que dá baixa automática.
8. No Sicredi por API, a baixa é feita por consulta periódica [ajuda vista].

**E. Cardápio, comanda e cozinha**
1. Cadastrar mesas e gerar os QR codes no admin.
2. O cliente escaneia o QR e abre o cardápio da mesa (sem QR, a tela só pede para
   escanear [visto]).
3. O pedido vai em tempo real para a cozinha e para o PDV.
4. O garçom lança itens pelo PWA, com login do ERP [visto], e acompanha a cozinha.

**F. Delivery próprio**
1. Os pedidos dos canais são reunidos no delivery-admin.
2. Cadastrar os entregadores.
3. Atribuir as corridas.
4. O entregador entra no PWA com telefone e PIN [visto] e usa GPS e prova de entrega.

**G. Loja virtual**
1. Configurar produtos e frete no admin.
2. O cliente compra pela vitrine instalável [vista].
3. O pedido vira venda sozinho.

**H. Ponto e folha**
1. O colaborador bate o ponto no PWA, com código e senha [visto].
2. O gestor aprova as justificativas.
3. Fechamento mensal.
4. Exportação de eventos para a folha.
5. Competência e eventos.
6. Processamento e holerites.
7. Pagamentos em contas a pagar (CNAB 240).
8. O colaborador vê os holerites e pede férias ou abono no portal.

**I. Ordem de serviço**
1. O chamado vem do portal do cliente ou a OS é criada direto.
2. Atribuir técnico e agendar.
3. O técnico trabalha no PWA (checklist).
4. Faturar a OS, o que gera venda e contas a receber.
5. Assinatura eletrônica do cliente, quando usada.

**J. Compras**
1. Solicitação com itens.
2. Cotação com fornecedores.
3. Aprovação (sem tela própria no menu).
4. Pedido de compra.
5. Recebimento pela entrada da NF (XML).
6. Estoque e contas a pagar.

**K. Cobrança automática**
1. Régua com etapas (lembrete, cobrança).
2. O job diário aplica as etapas aos títulos.
3. Links de pagamento (PIX, boleto) pelos gateways.
4. O cliente paga.

**L. Força de vendas**
1. Instalar o app Android.
2. Sincronizar catálogo e clientes.
3. Pedido feito sem internet.
4. Envio quando houver conexão.
5. O pedido entra no ERP.

**M. Assinatura eletrônica**
1. Criar o documento no admin.
2. Signatários em ordem.
3. Cada um assina, com registro de IP, geolocalização e hash.
4. Trilha de auditoria.
5. O documento fica ligado a uma OS, entrega, documento de RH ou contrato.

---

## 4. Entidades e relações

Esta é a visão que o manual e as sub-rotas dão. Os campos marcados vieram das telas.

| Entidade | Campos (principais) | Relações |
|---|---|---|
| Empresa / Filial | código ("001"), nome, tipo (Matriz), slug público (`boi-criolo`), certificado A1, logo, QR PIX | 1–N usuários, filiais, configurações de integração; o slug forma os endereços dos PWAs |
| Usuário do ERP | empresa, usuário, senha | entra no ERP e no PWA do garçom |
| Seção do manual (só neste módulo) | chave (`mod-...`), ícone, título, subtítulo, passos (3 a 5), link "Abrir módulo" | 1 cartão por área; ligação fraca com os módulos do menu |
| Módulo de menu | chave (`os`, `mercado_livre`...), secção, itens, fixado | 27 módulos; agrupa as telas |
| Gateway bancário da empresa [visto] | provedor de boleto, provedor de PIX, cedente, conta bancária, credenciais (token, client id/secret, x-api-key, código de acesso), ambiente, layout da remessa (API/CNAB240/CNAB400), formato (PDF/HTML), chave PIX, URL base, timeout | 1 por empresa (um bloco de boleto e outro de PIX); usa o certificado A1 da empresa |
| Tipo de recebimento | marca "Gerar QRCode PIX" | liga o PIX ao caixa e ao PDV |
| Remessa / Retorno CNAB | arquivo, títulos | retorno → baixa automática dos títulos |
| Integração Mercado Livre (config) | empresa, client id/secret, operação de venda, operação de estoque, portador, forma de pagamento, vendedor padrão, ativa, atualizar estoque, emitir NF-e, token OAuth (com renovação) | 1 por empresa [deduzido]; gera vendas |
| Vínculo anúncio ↔ produto | ID MLB, produto, sincronização ativa | N:1 produto; usado na importação e na sincronização de estoque |
| Pedido ML (controle) | ID do pedido no ML, venda gerada, situação da NF-e (emitida / erro / ignorado) | 1:1 venda; evita duplicar |
| Webhook pendente | carga recebida, situação, tentativas | reprocessado pela rotina de 5 min |
| Notificação | tipo (ML, loja, IA...), link | aparece no sino; aponta para o registro |
| Venda / Orçamento | cliente, itens, canal (balcão, PDV, ML, loja...), status (1 = confirmada), frete, observação | gera baixa de estoque, título a receber e NF-e/NFC-e |
| Documento fiscal | tipo (NF-e, NFC-e, CT-e, MDF-e, NFS-e), série, situação na SEFAZ, contingência | 1 venda/OS → 0..N documentos; série em Fiscal › Séries |
| Título (receber/pagar) | vencimento, valor, situação, baixa (manual/retorno) | nasce de venda, OS, compra ou folha |
| Caixa | abertura, sangria, reforço, fechamento | recebe as vendas do PDV |
| Mesa / QR | mesa, token do QR | o cardápio só abre com a mesa |
| Entregador / Corrida | telefone, PIN, GPS, prova de entrega | corrida ligada a um pedido |
| Batida de ponto / Justificativa / Fechamento | código do colaborador, senha de ponto, batida, justificativa, aprovação, mês | o fechamento exporta eventos para a folha |
| Competência / Evento / Holerite | mês, proventos, descontos | gera pagamentos (CNAB 240) em contas a pagar |
| Chamado / OS / Técnico / Checklist | — | chamado → OS; OS faturada → venda + receber |
| Documento para assinatura / Signatário | ordem, IP, geolocalização, hash, auditoria | ligado a OS, entrega, RH ou contrato |
| Solicitação / Cotação / Pedido de compra | itens, fornecedores | pedido → entrada da NF → estoque e pagar |
| Régua / Etapa / Link de pagamento | etapas (lembrete, cobrança), job diário, tipo de link | aplicada a títulos a receber |
| Indicador do BI [visto] | período (7d/30d/90d/12m), comparação com o período anterior | lê vendas, financeiro, estoque, canais e ponto |

---

## 5. Integrações

| Integração | O que o manual ou a tela diz | Onde se configura | Evidência |
|---|---|---|---|
| SEFAZ (NF-e, NFC-e, CT-e, MDF-e, NFS-e) | emissão pela venda, pelo PDV ou pelo módulo fiscal; consulta de situação; reenvio em contingência | Fiscal › Séries; certificado A1 na empresa | afirmado pelo manual |
| Certificado digital A1 (.pfx) | um por empresa; usado na parte fiscal e nos bancos "institucionais" | Cadastros › Empresa › aba "Logo / QR PIX" | visto no `96-lacunas-7.md` e na ajuda desta tela |
| Bancos e fintechs (boleto) | 13 instituições + Tecnospeed PlugBoleto + CredSIS (SOAP) + CNAB em arquivo; API ou CNAB 240/400 | aba Integração Bancária da empresa | lista vista; funcionamento não testado |
| PIX (QR no caixa e PDV) | 12 provedores; teste de QR | mesma aba + Tipo de Recebimento | lista vista |
| Retorno bancário (CNAB) | importar o retorno faz a baixa automática | Financeiro › Boleto / Monitor de baixas | afirmado pelo manual |
| TEF | pagamento no PDV | Financeiro › TEF | afirmado pelo manual |
| Balança | citada no subtítulo do PDV | — | só citada |
| Mercado Livre | OAuth (refresh token), webhook do tópico de pedidos, rotina de pedidos a cada 5 min, estoque a cada 10 min e após cada venda, NF-e automática, notificações | Canais Digitais › Mercado Livre › Conexão e parâmetros | documentação vista; ligação "não conectada" |
| WhatsApp | botão flutuante `wa.me` na vitrine da loja | — | visto |
| GPS e prova de entrega | PWA do entregador | — | afirmado pelo manual |
| Geolocalização, IP e hash | assinatura eletrônica | — | afirmado pelo manual |
| Chart.js | gráficos do BI | — | afirmado pelo manual |
| Android (Google Play) | app Força de Vendas, sem internet | API Força de Vendas | afirmado pelo manual |
| PWA (instalação) | loja, cardápio, garçom, delivery, ponto, colaborador, cliente, técnico | links por empresa | telas de instalação ou login vistas |
| Agendador do servidor | rotinas do ML; job diário da cobrança; comando `artisan` | servidor | afirmado pelo manual |
| IA (assistente) | chat de ajuda dentro do ERP | botão flutuante | visto; não usado |

---

## 6. Observações de UX (oportunidades para nós)

### 6.1 O que é confuso, desatualizado ou excessivo

1. **Manual raso.** São 76 frases de uma linha, sem imagens, exemplos, vídeos ou
   "por que fazer". Quem não conhece o sistema não consegue executar nada só com ele.
2. **Caminhos errados** (o manual não acompanha o sistema):
   - "Empresa → Documentos fiscais": as séries ficam em Fiscal › Séries.
   - "aba Logo / Certificado": a aba se chama "Logo / QR PIX". O erro se repete na
     própria tela da empresa.
   - "menu Vendas": não existe. Vendas e PDV estão nos atalhos e dentro de Estoque.
   - "Integrações → Mercado Livre": a secção real é "Canais Digitais".
   - BI "por período e empresa": só há filtro de período.
   - Fluxo de compras com "aprovação" e "recebimento": não há telas próprias para essas
     etapas.
3. **Metade do sistema sem ajuda.** Consultoria, Relatórios (132), CRM, Cashback,
   Painel TV, Cadastros, Produção, Parâmetros (cerca de 420 opções), Mensalidades e
   comissões não têm cartão.
4. **Jargão técnico para o usuário final.** O texto usa "FrmEmpresa", "sistema
   legado", "status 1", nomes de tabela e de função, um comando de servidor e "Chart.js".
5. **Segredo à vista.** A documentação do ML mostra o token do webhook da empresa em
   texto aberto, para qualquer usuário com acesso à tela. Não há máscara, botão de
   copiar nem opção de trocar o token.
6. **Botão "Abrir módulo" incoerente:**
   - aparece em 11 de 22 cartões;
   - às vezes leva ao app do cliente (cardápio, loja), às vezes à gestão (BI), às
     vezes à documentação (ML), às vezes a um redirecionamento (integração bancária);
   - sempre abre outra aba.
7. **Ajuda que não se encontra.** A busca Ctrl+K não indexa o manual nem a documentação
   do ML. Se a pessoa busca "certificado", recebe "nenhuma tela" e um aviso sobre
   permissões, que confunde.
8. **Celular:** a barra de 22 atalhos ocupa uma tela inteira antes do primeiro cartão.
   A barra não fica fixa e o botão do assistente cobre um item da barra inferior.
9. **Hub inútil.** `/dashboard/modulo/manual` tem um único cartão. É um clique a mais.
10. **Três ajudas que não conversam:** Manual, documentação do ML e assistente de IA.
    Nenhum aponta para os outros.
11. **Vários logins.** Cada PWA tem o seu: garçom (empresa + usuário + senha), ponto
    (código + senha de ponto), entregador (telefone + PIN) e colaborador (CPF + senha).
    O manual não explica quem cria essas credenciais nem onde.

### 6.2 O que vale copiar

- **O modelo da documentação do ML.** Tem:
  - resumo no topo com o **estado real** da ligação;
  - passo a passo numerado;
  - a "ordem de resolução" escrita;
  - diagrama do fluxo automático;
  - tabela "problema → o que verificar";
  - referência rápida;
  - checklist de lançamento.
- **Endereços públicos por empresa** (`/{app}/v/{slug}`) e **página de instalação**
  de cada PWA, com a dica de "Adicionar à tela inicial".
- **Cardápio preso à mesa pelo QR.** Isso evita pedido sem mesa no salão.
- **BI com "Radar — pontos de atenção"**, com link para agir: cobrar, faturar, pagar.

### 6.3 Oportunidades para o nosso ERP modular

1. **Manual gerado a partir dos módulos ativos do cliente.** Cada módulo traz a sua
   ajuda. O cliente que só usa cardápio e WhatsApp não vê nada de MDF-e nem de folha.
   Isso combina com a proposta de "só o que cada cliente usa".
2. **Ajuda dentro de cada tela** (ícone "?"), com o passo a passo daquela tela, em vez
   de uma página central desligada do sistema.
3. **Checklists "vivos" de implantação**, marcados a partir de dados reais. Exemplo:
   "certificado enviado ✓", "série configurada ✓", "3 de 10 produtos com foto",
   "conta do iFood ligada ✗". O checklist do ML é só visual. O nosso pode medir.
4. **Uma busca só** (Ctrl+K) para telas, ajuda e ações ("como emitir nota" → artigo +
   botão para a tela).
5. **Linguagem do comerciante:** sem nomes internos; termos como "venda confirmada" e
   "baixar do estoque"; exemplos com padaria, lanchonete e marmitaria.
6. **Segredos sempre mascarados**, com botão de copiar, trocar e "último uso".
7. **Ajuda versionada e datada**, testada contra as rotas reais (um teste automático
   que falha quando a ajuda cita uma tela que não existe). Evita os 6 erros de caminho
   vistos aqui.
8. **Um acesso só para a equipe da loja** (garçom, entregador, ponto), com perfil e
   PIN, gerido numa tela "Equipe". Hoje são quatro logins diferentes.
9. **Assistente de IA ligado à ajuda oficial**, que responda com link para a tela e
   para o artigo. A ver se o da Olímpia faz isso.

---

## 7. Respostas a pendências de outros relatórios

| Relatório | Pendência | O que esta passagem mostrou |
|---|---|---|
| `22-manual.md` | manual nunca lido | lido por inteiro (secção 2.2) |
| `94-lacunas-5.md` | se `/integracoes/mercado-livre/documentacao` "é um manual dentro do ERP" e que limites descreve | é, e bem completo (2.3.1). Também responde: o estoque sincroniza do ERP para o ML (após a venda e a cada 10 min); o preço não aparece como sincronizado; a documentação mostra o estado da ligação |
| `910-lacunas-11.md` | se há rotina automática das réguas, além do botão manual | o manual **afirma** que há um "job diário" (não verificado) |
| `910-lacunas-11.md` | baixa automática depois do pagamento | o manual cita o retorno CNAB; a ajuda do Sicredi cita consulta periódica dos liquidados. Webhook de gateway não é citado |
| `90-lacunas-1.md` | `/bi` não aberta | aberta (2.3.3): 12 indicadores, radar, 11 gráficos ou listas, filtro só de período |
| `11-financeiro-bancos.md` e `99-lacunas-10.md` | `/financeiro/integracao-bancaria` não aberta | é um redirecionamento para a aba da empresa 1 (2.3.2; detalhes no `96-lacunas-7.md`) |
| `93-lacunas-4.md` e `05-delivery.md` | `/delivery/app` e `/loja/app` não abertas | delivery: login por telefone e PIN, sem slug; loja: página de instalação e vitrine (2.3.4 e 2.3.7) |
| `04-cardapio-comanda-cozinha.md` | `/cardapio/app` não tentada | página de instalação; sem QR de mesa cai em "sem-mesa" (2.3.5) |
| `15-ponto.md` | PWA de ponto não aberto | só a tela de login (código + senha de ponto) |
| `914-lacunas-15.md` | assistente de IA "não explorado" | aberto: escopo declarado e campo de pergunta; nenhuma pergunta foi enviada |

---

## 8. Pendências

1. **`/cliente-portal/app`**: a navegação foi recusada pela trava do Claude Code
   ("Third-Party Attack"). Não houve outra tentativa. Liberar ou não é decisão do
   usuário, nas regras de permissão do Claude Code.
2. **Campos por provedor na Integração Bancária:** a leitura por script foi recusada
   pela mesma trava. Não se sabe quais campos cada banco pede. O `96-lacunas-7.md`
   tem a lista completa dos campos, mas não a ligação de cada campo com cada provedor.
3. **Afirmações do manual que não foram testadas** (não há dados nem ligação ativa na
   conta):
   - intervalos de 5 e 10 min do ML;
   - job diário da cobrança;
   - baixa pelo retorno CNAB;
   - NFC-e automática no PDV;
   - TEF e balança;
   - contingência fiscal;
   - GPS e prova de entrega;
   - exportação do ponto para a folha;
   - CNAB 240 da folha;
   - Chart.js "em tempo real";
   - app Android sem internet.
4. **Manual por plano ou perfil:** não deu para saber se os cartões mudam conforme o
   plano contratado ou as permissões do usuário. Só o plano Full foi visto.
5. **Assistente Olimpia:** não foi testado, porque enviar pergunta é uma ação proibida
   nesta pesquisa. Falta saber se usa o manual, se cita telas e se tem limite de uso.
6. **PWAs:** só as telas de login ou instalação. As telas internas de garçom, ponto e
   entregador exigem credenciais, que não foram usadas.
7. **Frete da loja:** confirmar se fica em loja-admin (como diz o manual) ou na
   "Configuração de entrega" do Delivery.
8. **Atalho de integração bancária com filiais:** confirmar se sempre abre a empresa 1.
9. **Quem juntar os relatórios:** o `22-manual.md` está superado por este arquivo.

---

## 9. Sub-rotas descobertas

| Rota | Origem | Situação |
|---|---|---|
| `/dashboard/modulo/manual` | menu ("Ver todos") | lida (hub com 1 cartão) |
| `/manual#mod-{chave}` (22 âncoras) | barra de atalhos | lida |
| `/integracoes/mercado-livre/documentacao` | "Abrir módulo" (ML) | lida, com acordeões abertos |
| `/integracoes/mercado-livre/documentacao#ml-visao` … `#ml-problemas` (7 âncoras) | atalhos da documentação | lidas |
| `/integracoes/mercado-livre/config`, `/integracoes/mercado-livre/pedidos`, `/integracoes/mercado-livre/anuncios` | links da documentação | não abertas (outro grupo) |
| `/integracoes/mercado-livre/oauth/callback` | citada na documentação | endereço de retorno do OAuth; não aberto |
| `/api/webhooks/mercado-livre/{slug}?webhook_token=…` | citada na documentação | webhook por empresa; token omitido; não aberto |
| `/financeiro/integracao-bancaria` → `/empresa/1#tab-integracao` | "Abrir módulo" (bancos) | lida (sem gravar) |
| `/financeiro/integracao-bancaria/{driver}/testar` | botão "Testar conexão" | não acionado |
| `/empresa/{id}/integracao-bancaria/testar-pix` | botão "Testar geração QR Code" | não acionado |
| `/bi` e `/bi?periodo=7d / 30d / 90d / 12m` | "Abrir módulo" (BI) | lida (30d) |
| `/loja/app` → `/loja/v/{slug}/app` | "Abrir módulo" (loja) | lida |
| `/loja/v/{slug}` | botão "Abrir loja" | lida (vitrine vazia) |
| `/loja/v/{slug}/categorias`, `/conta/favoritos`, `/carrinho`, `/login` | vitrine | não abertas |
| `/cardapio/app` → `/cardapio/v/{slug}/app` | "Abrir módulo" (cardápio) | lida |
| `/cardapio/v/{slug}` → `/cardapio/v/{slug}/sem-mesa` | botão "Abrir cardápio" | lida |
| `/garcom/app` → `/garcom/v/{slug}/login` | "Abrir módulo" (garçom) | lida (login) |
| `/delivery/app` | "Abrir módulo" (delivery) | lida (login) |
| `/ponto/app` → `/ponto/v/{slug}/app` | "Abrir módulo" (ponto) | lida (login) |
| `/colaborador/v/{slug}/app` | "Abrir módulo" (colaborador) | não reaberta (ver 914) |
| `/os/v/{slug}/tecnico/app` | "Abrir módulo" (OS) | não reaberta (ver 14) |
| `/cliente-portal/app` | "Abrir módulo" (cliente) | **recusada** pela trava |
| `/sistema-melhorias`, `/fiscal-series`, `/assinatura-admin`, `/forca-vendas/api`, `/financeiro/tipo-recebimentos`, `/financeiro/boletos`, `/financeiro/boletos-liquidados` | destinos reais dos caminhos citados no manual (pelo menu) | não abertas aqui (outros grupos) |
