# ERP Olímpia: mapa da exploração

> Consolidação da exploração **só de leitura** do ERP da Olímpia Ecossistemas,
> concorrente local em Porto Velho (RO). A exploração foi feita em 2026-10-03 na
> conta de teste "Boi Criolo" (uma casa de carnes), no plano Full e com perfil
> ADMIN. Este mapa serve de base ao [catálogo funcional](catalogo-funcional.md)
> do nosso ERP modular.
>
> - Os textos da interface estão resumidos com palavras nossas.
> - Nenhum CNPJ, token, senha, segredo ou dado pessoal foi copiado.
> - Nada foi gravado, enviado, gerado ou alterado no ERP.

## Como ler este mapa

**Estado de cada rota**

| Marca | Significado |
| --- | --- |
| **lida** | a tela abriu e foi lida (lista, filtros, formulário "Novo" quando existia) |
| **parcial** | a tela abriu, mas só parte foi lida, ou a conta não tinha dados para ver o resto |
| **só login** | app público (PWA) visto só até a tela de entrada ou de instalação |
| **bloqueada pelo plano** | a tela abriu com o aviso de que a função não está no plano Full |
| **recusada** | o Claude Code (verificação do modo automático) recusou abrir ou ler a tela |
| **não aberta** | ninguém chegou a abrir a tela |

**Números entre parênteses** apontam para o arquivo de detalhe desta pasta.
Por exemplo, (96) é [96-lacunas-7.md](96-lacunas-7.md). A lista completa está
na [seção 6](#6-arquivos-desta-pasta).

**Grau de certeza.** Os arquivos de detalhe separam o que foi **visto** na tela,
o que foi **deduzido** e o que o manual da Olímpia **afirma** sem que tenha sido
testado. Este mapa herda essas marcas quando a diferença importa.

---

## 1. Resumo

1. **Um ERP grande, migrado de um sistema desktop em Delphi.** São 27 módulos no
   menu, em 7 seções, e cerca de 36 "módulos comerciais" nos planos. Quase toda
   tela mostra o nome do formulário antigo (por exemplo "FrmEmpresa"). A
   tecnologia percebida é PHP com Laravel, Bootstrap 5 e PostgreSQL.
2. **Tudo é por empresa e filial.** O login pede empresa, usuário e senha. Os
   clientes e os produtos são compartilhados entre filiais; financeiro e vendas
   filtram pela empresa ativa.
3. **Catálogo único.** O mesmo cadastro de produtos serve à loja virtual, ao
   cardápio, ao painel de TV e ao Mercado Livre. É a mesma decisão que tomamos.
4. **Documentos com estado.** Venda, OS, entrada, saída, balanço e transferência
   nascem "pendentes" (ou "abertos") e passam a "concluídos" ou "cancelados". Os
   estados são guardados como números, letras ou textos, e cada tela usa uma
   convenção diferente.
5. **Configuração pesada.** O cadastro da empresa reúne cerca de 420
   parâmetros, o certificado A1, a integração com 16 provedores de boleto e 12
   de Pix. Os parâmetros de hardware e PDV vêm do sistema desktop.
6. **132 relatórios num motor genérico.** Todos seguem o mesmo molde: filtros e
   um botão "Gerar", com saída em PDF, Excel e CSV. Muitos se repetem.
7. **Apps públicos por empresa.** Loja, cardápio, garçom, entregador, ponto,
   colaborador, técnico e cliente têm cada um o seu endereço
   (`/{app}/v/{slug}`) e o seu login.
8. **Integrações relevantes:** SEFAZ (NF-e, NFC-e, MDF-e, CT-e, distribuição
   DF-e e manifestação), prefeitura (NFS-e), bancos e gateways (boleto, Pix,
   conciliação OFX), Mercado Livre, app Android de força de vendas, agente
   desktop (Bridge) para impressora, gaveta e balança, OpenAI no consultor de
   gestão e um agente de vendas com IA no WhatsApp, vendido à parte.
9. **Ausências que importam para nós:** não aparece integração com iFood nem
   com 99Food; o cardápio digital só abre a partir do QR de uma mesa; o pedido
   da loja virtual não tem os estados "em preparo" e "pronto".
10. **Cobertura da pesquisa:** pouco mais da metade das telas do menu foi lida,
    pelo menos em parte (contagem aproximada: 110 de cerca de 195). Dos 132
    relatórios, cerca de 60 tiveram os filtros lidos; todos são conhecidos pelo
    cartão da Central de relatórios. Ficaram de fora sobretudo as telas
    operacionais do dia a dia: venda balcão, PDV, caixa, painel da cozinha,
    mesas, delivery, contas a receber e a pagar, produção e desossa. Ver a
    [seção 7](#7-cobertura-e-rotas-que-continuam-sem-leitura).

---

## 2. Planos e preços

Lidos na tela "Meu plano" e na assinatura da conta de teste (915, 916).

| Plano | Preço por mês | Módulos | Resumo na tela |
| --- | --- | --- | --- |
| Profissional | R$ 299,90 | 17 | pequena e média empresa: NF-e, NFC-e, bancos, Pix, TEF, CRM e markup; até 20 usuários |
| Premium | R$ 499,90 | 25 | omnicanal: loja virtual, cardápio, Mercado Livre, delivery, força de vendas, CT-e e MDF-e |
| Full | R$ 799,00 | 36 | tudo: RH, OS, portais, compras, cobrança automática, BI e Gestão 360° |

**Como a cobrança funciona**

- **Crédito pré-pago.** Cada pagamento (Pix ou boleto) soma 30 dias de acesso, e
  o crédito desce um dia por vez. A tela mostra dois prazos ao mesmo tempo: o
  dia de pagamento e o "válido até".
- **Pagamento adiantado.** A cobrança da próxima mensalidade só é gerada quando
  o cliente pede.
- **Troca de plano.** Só o administrador troca. Um plano pago exige pagamento
  na hora; um plano gratuito ou de teste vale na hora. Os planos com id 1 e 3
  não aparecem na lista (provavelmente de teste ou gratuitos).
- **Implantação.** Segundo as Novidades, quando se contrata um plano pago o
  sistema cria uma fatura de implantação com o valor da primeira mensalidade e
  bloqueia a operação até ela ser paga (916).
- **Termos de uso.** O aceite eletrônico guarda versão, data e hora, usuário,
  IP, navegador, CNPJ da época, cópia do texto e hash SHA-256. Os termos preveem
  preço modular (por plano, usuários, empresas, módulos, terminais, volume) e
  restrição, suspensão ou cancelamento por falta de pagamento (915, 916).
- **Adicionais fora do Full.** O conector de IA por MCP e o monitor do agente
  de vendas no WhatsApp abrem com o aviso "função não está no seu plano" (915).

**Os 36 módulos do Full, na ordem da tela:** ERP (Dashboard), Cadastros,
Parâmetros & Empresa, Vendas, Financeiro (Contas a Pagar/Receber, Caixa),
Estoque & Entradas, PDV / Frente de Caixa, Cashback, Relatórios, Balcão de
Entrega, Painel de Preços, Emissão NF-e, Emissão NFC-e, Bancos (contas,
movimentação, conciliação, boletos), PIX, TEF, CRM / Markup, Sinuca, Emissão
CT-e, Emissão MDF-e, Loja Virtual, Comanda Digital / Cardápio, Mercado Livre,
Delivery Próprio, Força de Vendas (Android), Produção, Ponto Eletrônico, Folha
de Pagamento, Portal do Colaborador, Ordem de Serviço, Portal do Cliente,
Assinatura Eletrônica, Compras e Suprimentos, Cobrança Automática, BI
Executivo, Consultoria / Gestão 360°.

**Hipótese não confirmada sobre a divisão por plano (915).** A ordem da lista
parece seguir os escalões:

- os 17 primeiros, até "CRM / Markup", formariam o Profissional;
- os 8 seguintes, até "Força de Vendas", completariam o Premium;
- os 11 últimos, de "Produção" a "Consultoria", seriam exclusivos do Full.

Um ponto a notar: TEF e cashback estariam já no plano mais barato, e o
cardápio e o delivery só a partir do Premium.

---

## 3. O que se repete em todas as telas

**Cabeçalho**

- nome da empresa ativa e seletor de empresa (filial);
- busca de telas (Ctrl+K), com recentes e favoritos (tecla F). Procura só nomes
  de telas; o conteúdo da ajuda não é pesquisável (922);
- botão "Novidades", que leva à lista de mudanças (`/sistema-melhorias`);
- escolha de tema visual, sino de notificações e menu do usuário;
- botão flutuante "Abrir assistente" (assistente de ajuda com IA, não testado).

**Barra lateral.** Seção "Fixados", "Atalhos rápidos" e o menu completo, com
"Fixar" em cada módulo. Os atalhos rápidos (18, 13):

- Operação do dia: Venda Balcão (`/vendas`), Venda PDV (`/pdv`), Venda Direta
  Mobile (`/garcom/mobile-venda`), Caixa (`/financeiro/recebimento`), Ordem de
  Serviço (`/dashboard/modulo/os`), Mensalidades (`/minha-assinatura`);
- Cadastros frequentes: Produtos (`/produtos`), Clientes
  (`/pessoas?tipo=cliente`), Consulta Cliente (`/consulta-cliente`);
- Canais digitais: Gestão Loja Virtual (`/dashboard/modulo/loja`), Cardápio
  Digital (`/dashboard/modulo/cardapio`), Comanda Garçom (`/garcom-admin/link`);
- Outros: API Força de Vendas (`/forca-vendas/api`), Visitas de rota
  (`/rota-visitas`), Ponto Eletrônico (`/ponto/dashboard`).

No celular, o menu vira "hambúrguer" e aparece uma barra inferior com Início,
Buscar, Menu e Novidades.

**Hubs de módulo.** Cada módulo tem uma página de entrada
`/dashboard/modulo/{chave}` com cartões de atalho, sem números nem alertas. Cada
cartão tem "Adicionar aos atalhos".

**Avisos globais (por consulta periódica ao servidor).** Cada tela pergunta ao
servidor, de 10 em 10 a 30 em 30 segundos, se há novidade em sete frentes, e
abre uma janela modal quando há (93, 915, 921):

| Frente | Aviso |
| --- | --- |
| WhatsApp | "Novo pedido WhatsApp" criado pelo agente de vendas com IA, com o botão "Confirmar recebimento" |
| Loja virtual | nova venda, com cliente, número e total |
| Mercado Livre | nova venda, com o número do pedido no Mercado Livre |
| Cardápio digital | chamado do salão (mesa), com som |
| Ordem de serviço | cliente assinou a OS, com link do comprovante |
| Manifestação | NF-e nova para manifestar (aviso flutuante) |
| Boletos | boletos liquidados automaticamente |

Endereços internos: `/erp/notificacoes/{canal}/poll`, `/lookups/{tipo}/config`,
`/lookups/{tipo}/search`, `/lookups/{tipo}/{id}`, `/lookups/{tipo}/quick` (cadastro
rápido) e `/erp/navigation` (catálogo do menu guardado no navegador).

**Componentes comuns**

- **Lupa de pesquisa:** campo só de leitura com uma lupa que abre uma janela de
  busca paginada, com "Cadastrar novo" em alguns cadastros e seleção múltipla em
  outros (96, 919).
- **Barra "Dados complementares":** rodapé fixo que mostra o registro
  selecionado na lista (padrão mestre-detalhe herdado do desktop).
- **Maiúsculas automáticas:** o texto digitado vira MAIÚSCULAS, exceto e-mail,
  URL, senha, números e chaves (93).

---

## 4. Árvore do menu com as rotas

O menu lateral tem **27 módulos em 7 seções**, mais o Dashboard e os atalhos
(922). Abaixo, cada módulo com as suas rotas, o estado de leitura e o arquivo de
detalhe. Rotas de ação (POST) e sub-rotas só aparecem quando ajudam a entender o
fluxo.

### 4.0 Dashboard

- `/dashboard`: página inicial e destino de "Voltar ao dashboard" em todos os
  hubs. **não aberta** (90).

### 4.1 Visão Geral

**BI Executivo**

- `/dashboard/modulo/bi`: hub. **não aberta** (90).
- `/bi` (`?periodo=7d|30d|90d|12m`): painel executivo. **lida** (922).
  - 12 indicadores com link para a tela de ação: faturamento, quantidade de
    vendas, ticket médio, clientes atendidos, recebido, a receber, receber
    vencido, a pagar, valor em estoque, orçamentos pendentes, pedidos da loja e
    do app, colaboradores no ponto.
  - "Radar" de 5 pontos de atenção e 11 gráficos ou listas (vendas, fluxo
    previsto de 8 semanas, atraso, top produtos, clientes e vendedores, formas
    de pagamento, canais, 12 meses, horas extras).
  - Só tem filtro de período e comparação com o período anterior; não filtra
    por empresa.

**Consultoria / Gestão 360°** (914, 915; o 17 está superado)

- `/dashboard/modulo/consultoria`: hub com 8 atalhos. **lida**.
- `/consultoria`: Painel Gestão 360° (8 KPIs do ERP, IOG por área, histórico,
  resumo do plano). **lida**.
- `/consultoria/projetos` e `/consultoria/projetos/criar`: projeto com produto
  (Diagnóstico, Gestão 90 dias, Gestão contínua), responsável e 3 "dores".
  **lida**.
- `/consultoria/diagnosticos`: questionário IOG por área (Sim 10, Parcial 5,
  Não 0) ou primeira análise pela IA. **parcial** (o questionário não foi visto).
- `/consultoria/problemas` e `/consultoria/problemas/criar`: matriz Impacto ×
  Urgência × Facilidade em 8 áreas de gestão. **lida**.
- `/consultoria/acoes` e `/consultoria/acoes/criar` (POST `/consultoria/acoes/metas`):
  plano 30/60/90 e metas. **lida**.
- `/consultoria/reunioes` e `/consultoria/reunioes/criar`: ata e até 3 tarefas
  que viram ações. **lida**.
- `/consultoria/advisor`: chat de gestão com OpenAI. **lida** (desativado: falta
  a chave, que só o Super Admin da plataforma cadastra).
- `/consultoria/relatorios` (POST `/consultoria/relatorios/gerar`): relatório
  executivo. **lida** (sem relatórios).

**Relatórios** (916 a 921, 20)

- `/dashboard/modulo/relatorios`: hub com 80 cartões em 8 grupos (78
  relatórios distintos). **lida** (916).
- `/relatorios` (`?q=&categoria=`): Central com 132 relatórios em 16
  categorias, todos em PDF, Excel e CSV. **lida** (916, 917, 919).
- `/relatorios/processamentos`: fila assíncrona anunciada, ainda não
  funciona. **lida**.
- `/relatorios/{slug}`: rota genérica de todos os relatórios (formulário GET
  com `executar=1`). Cerca de 60 abertos (só os filtros; "Gerar" não foi
  clicado). Catálogo completo em 916, seção 2.7.1.
- `/comissoes/metas`: comissão por metas com prêmios para os 3 primeiros do
  ranking. **lida** (916).

### 4.2 Vendas & Atendimento

**Ordem de Serviço** (14 itens no menu; 14, 20, 919)

- `/dashboard/modulo/os`: hub. **lida**.
- `/os-admin`: consulta de OS (indicadores, filtros, lista). **lida**.
- `/os-admin/nova`: formulário com 6 abas (Geral, Veículo, Peças, Serviços,
  Valores, Observações). **lida**.
- `/os-admin/chamados`: chamados vindos do portal do cliente. **lida**.
- `/os/tecnico/app` → `/os/v/{slug}/tecnico/app`: PWA do técnico (agenda,
  chegada e saída com GPS, laudo, fotos). **só login**.
- `/servicos`: catálogo de serviços com % de comissão. **lida**
  (`/servicos/create` **recusada**).
- `/os-admin/checklists`: modelos de checklist (veículo, peças, manutenção).
  **lida** (`/os-admin/checklists/nova` **recusada**).
- Relatórios de OS: `os-periodo`, `os-abertas`, `os-por-status`,
  `os-servicos-executados`, `os-pecas-utilizadas` **lidos** (20);
  `os-por-tecnico`, `os-por-cliente`, `os-faturadas` **lidos** (919).
- Relatórios de comissão: `comissoes-por-recebimento`,
  `comissoes-venda-analitico`, `comissoes-servicos`, `comissoes-os-analitico`,
  `comissoes-os-colaborador` **lidos** (20); `comissoes-venda-colaborador`,
  `comissoes-vendas-pecas-os` **lidos** (918).

**CRM** (910)

- `/dashboard/modulo/crm`: hub com 6 atalhos. **parcial**.
- `/crm`, `/crm/aniversarios`, `/crm/clientes`, `/crm/operacao`, `/crm/gestao`,
  `/crm-markup`: **não abertas** (a leitura do hub foi recusada no meio).

**Cashback** (12, 911)

- `/dashboard/modulo/cashback` (**recusada**), `/cashback-admin` (**não
  aberta**).

**Cobrança** (4 itens; 910)

- `/dashboard/modulo/cobranca`: hub. **lida**.
- `/cobranca`: painel com réguas ativas, últimas execuções e o botão "Executar
  réguas". **lida**.
- `/cobranca/reguas`: nova régua com 3 etapas fixas por e-mail (−3, 0, +5 dias).
  **lida**.
- `/cobranca/links`: link de pagamento (Pix, boleto, cartão) por parcela.
  **lida**.
- `/cobranca/gateway`: Asaas, Efí e Mercado Pago, cada um com "API Key (stub)"
  e Sandbox. **lida**.

**Portal Cliente** (2 itens: PWA e Links de Acesso)

- `/dashboard/modulo/cliente`, `/cliente-portal-admin/link`: **não abertas**.
- `/cliente-portal/app`: **recusada** (922).

### 4.3 Canais Digitais

**Loja Virtual** (9 itens; 93, 922; o 06 está superado)

- `/dashboard/modulo/loja`: hub (Pedidos, Vitrine & Acesso, Catálogo,
  Configurações). **lida**.
- `/loja-admin/pedidos`: vendas online com estado do pedido e do pagamento.
  **lida** (sem pedidos).
- `/loja-admin/link`: links da vitrine, do PWA e da API. **lida**.
- `/loja/app` → `/loja/v/{slug}/app`: página de instalação do PWA. **lida**.
- `/loja/v/{slug}`: vitrine pública. **lida** (vazia).
- `/api/loja/v1/v/{slug}`: API REST pública da loja. **não aberta**.
- `/produtos`: catálogo geral. **não aberta** (ver Cadastros).
- `/produto-grupos`: grupos com comissão % e ordem. **lida**
  (`/produto-grupos/create` **recusada**).
- `/produto-sub-grupos`: subgrupos com foto. **lida**.
- `/loja-admin/config`: nome, SEO, 4 cores, frete (o mesmo do delivery),
  carrossel e banners. **lida**.
- `/loja-admin/cupons`: percentual ou valor fixo, com validade. **lida**.
- `/loja-admin/avaliacoes`: só as pendentes de moderação. **lida**.

**Mercado Livre** (5 itens; 93, 922; o 94 está superado em parte)

- `/dashboard/modulo/mercado_livre`: hub. **lida**.
- `/integracoes/mercado-livre/pedidos`: **recusada**.
- `/integracoes/mercado-livre/anuncios`, `/integracoes/mercado-livre/config`:
  **não abertas**.
- `/integracoes/mercado-livre/documentacao`: documentação completa da
  integração, com o estado real da ligação. **lida**.
- Endereços citados: retorno do OAuth (`/integracoes/mercado-livre/oauth/callback`)
  e webhook por empresa (`/api/webhooks/mercado-livre/{slug}?webhook_token=…`).

**Cardápio Digital** (8 itens; 04, 922, 91)

- `/dashboard/modulo/cardapio`: hub com 10 blocos. **lida**.
- `/cardapio-admin/cozinha` (Painel Cozinha): **recusada**.
- `/cardapio-admin/pedidos-online`: **recusada**.
- `/cardapio-admin/link` (Links e QR Codes), `/cardapio-admin/mesas`,
  `/atendimento-tablet-admin/link`, `/atendimento-tablet-admin/banners`,
  `/cardapio-admin/config`: **não abertas**.
- `/cardapio/app` → `/cardapio/v/{slug}/app` → `/cardapio/v/{slug}` →
  `/cardapio/v/{slug}/sem-mesa`: sem o QR de uma mesa, o cardápio pede para
  escanear. **lida**.
- Fora do hub, nos atalhos: Comanda Garçom `/garcom-admin/link` (**não
  aberta**); `/garcom/app` → `/garcom/v/{slug}/login` (**só login**, com o
  usuário do ERP); Venda Direta Mobile `/garcom/mobile-venda` (**não aberta**).

**Painel TV** (90)

- `/dashboard/modulo/painel-tv`, `/painel-tv-admin/link`,
  `/painel-tv-admin/config`: **não abertas**.

**Delivery** (4 itens: Dashboard, Pedidos, Entregadores, Configuração de
entrega; 93, 922; o 05 está superado)

- `/dashboard/modulo/delivery`, `/delivery-admin`, `/delivery-admin/pedidos`,
  `/delivery-admin/entregadores`: **não abertas**.
- `/delivery-admin/configuracao`: frete por km (com mínimo e frete grátis) ou
  por bairro digitado à mão. **lida**.
- `/delivery/app`: app do entregador com telefone e PIN, sem o slug da empresa
  no endereço. **só login**.

### 4.4 Operações

**Cadastros** (29 itens; 96, 95, 912, 918, 93)

- `/dashboard/modulo/cadastros`: hub. **não aberta**.
- `/cadastros/checklist`: painel interno da migração Delphi → web, aberto ao
  cliente, com o mapa dos 26 cadastros. **lida** (96).
- Pessoas:
  - `/pessoas`: cadastro único com papéis (cliente, colaborador, fornecedor,
    transportador, produtor rural). **parcial**: só a aba "Colaborador" do
    `/pessoas/create` foi vista (912).
  - `/pessoas?tipo=cliente` (atalho "Clientes"): **não aberta**.
  - `/consulta-cliente` e `/consulta-cliente/{id}`: ficha do cliente com score,
    crédito, gráficos e linha do tempo. **lida** (918).
  - `/colaborador-cargos`: **não aberta**. `/carga-horarias` (+`/create`):
    **lida** (912).
- Empresa e geografia:
  - `/empresa`, `/empresa/nova`, `/empresa/{id}` (abas Cadastro, Logo / QR PIX,
    Integração Bancária, Parâmetros): **lida** (96).
  - `/municipios` (base com 5.426 municípios), `/zonas`, `/bairros` (tarifa,
    sem cidade), `/rotas` (zona, região, valor), `/veiculos` (dados do MDF-e):
    **lidas** (96).
- Produtos e tabelas de apoio:
  - `/produtos`, `/produtos/gerenciamento`: **não abertas**. O painel de grupos
    tributários do `/produtos/create` foi visto (912).
  - `/produto-grupos`, `/produto-sub-grupos`: **lidas** (93).
  - `/fabricantes`, `/produto-cores`: **não abertas** (só a configuração da
    lupa foi lida; 919, 920).
  - `/grades`, `/ncms`, `/golas`, `/mangas`, `/tecidos`, `/confeccao-status`,
    `/etiquetas`: **não abertas** (golas, mangas e tecidos servem a confecção
    de roupas).
  - `/servicos`: **lida** (14).
- Financeiro de apoio: `/forma-pagamentos`, `/bancos`, `/banco-contas`: **não
  abertas**; `/cedentes`: **recusada**; `/plano-contas` (+`/create`,
  `/apuracao`): **lida** (96).
- Acesso: `/usuarios`, `/usuario-grupos`: **não abertas**. Pelo checklist, as
  telas são liberadas pelo grupo e as ações operacionais pelo usuário (96).
- Outros: `/crm-markup` (**não aberta**), `/rota-visitas` (**lida**, 14).

**Sinuca** (04)

- `/dashboard/modulo/sinuca`, `/sinuca` ("Controle de mesas e leituras"):
  **não abertas**.

**Estoque** (12 itens; 96, 918, 920; os 09 e 97 estão superados)

- `/dashboard/modulo/estoque`: hub com 3 blocos (Movimentações, Inventário &
  Controle, Expedição & Vendas). **lida**.
- `/entradas-xml` (+`/create`, `?aba=manifestadas`): importação de XML e
  notas da SEFAZ. **lida** (o relatório geral em PDF não abriu).
- `/manifestacao-nfe`: distribuição DF-e e manifestação em lote. **lida**.
- `/entradas-manual` (+`/create`): **lida**.
- `/saidas-manual` (+`/create`): **lida**.
- `/troca-produto`: **parcial** (a regra de crédito × título não foi lida).
- `/transferencias` (+`/create`), `/balancos` (+`/create`), `/estoque-log`:
  **lidas**.
- `/etiquetas`: **não aberta**.
- Expedição & Vendas: `/vendas` (Pedido de venda, **não aberta**);
  `/financeiro/faturamento` (Faturamento de vendas em lote, **lida**, 918);
  `/balcao-entrega` (**não aberta**); `/romaneios` (+`/create`, **lida**, 920).

**Produção** (9 itens; 10, 97, 98)

- `/dashboard/modulo/producao`, `/producao/ordens`: **não abertas**.
- Desossa: `/producao/desossas/nova`, `/producao/desossas`,
  `/producao/desossa-fichas` (**recusada**), `/producao/desossas-relatorios`,
  `/producao/desossas-produtos-derivados`, `/producao/desossas-rendimentos`,
  `/producao/desossa-config`: **não abertas**.
- `/producao/sped-bloco-k` (atalho "SPED Fiscal / Contribuições" do Fiscal):
  **não aberta**.

**Compras** (4 itens: Dashboard, Solicitações, Cotações, Pedidos; 920)

- `/dashboard/modulo/compras`: **não aberta**.
- `/compras`: painel com o fluxo solicitação → cotação → aprovação → pedido →
  recebimento. **lida**.
- `/compras/solicitacoes`, `/compras/cotacoes`: **não abertas**.
- `/compras/pedidos`: lista sem botão "Novo" (o pedido nasce da cotação).
  **lida**.

### 4.5 Financeiro & Fiscal

**Financeiro** (22 itens; 99, 918, 922, 96; os 11 e 98 estão superados em
parte)

- `/dashboard/modulo/financeiro`: **não aberta**.
- `/financeiro/recebimento` (atalho "Caixa"), `/financeiro/caixa`: **não
  abertas**.
- `/financeiro/receber`, `/financeiro/pagar`, `/financeiro/pagar-baixa`:
  **não abertas**.
- `/bancos`, `/banco-contas`: **não abertas**.
- `/financeiro/banco-movimentacao`: lançamento com valor positivo ou negativo,
  conta, tipo de documento e plano de contas. **lida** (918).
- `/financeiro/conciliacao`: conciliação por OFX, regras por descrição.
  **parcial** (99).
- `/cedentes`: **recusada**.
- `/financeiro/boletos`: cobrança bancária com remessa CNAB ou API. **lida**
  (918). `/financeiro/boletos-liquidados`: **não aberta**.
- `/financeiro/integracao-bancaria`: redireciona para a aba Integração Bancária
  da empresa 1 (`/empresa/1#tab-integracao`). **lida** (922, 96).
- `/financeiro/tipo-recebimentos`, `/financeiro/tipo-documentos`,
  `/financeiro/tef`, `/financeiro/pos-operadoras`, `/financeiro/cartoes`:
  **não abertas**.
- `/financeiro/liberacoes`: fila de liberações de supervisor, atualizada a cada
  5 s. **lida** (918).
- `/financeiro/faturamento`: faturamento em lote (fica no menu de Estoque).
  **lida** (918).
- `/contador-admin`, `/contador-admin/link` (Portal do Contador): **não
  abertas**.
- "Monitor de baixas": item de menu citado no manual, rota não identificada
  (922).

**Fiscal** (13, 912, 96, 921)

- `/dashboard/modulo/fiscal`: hub com 9 atalhos em 3 blocos (Notas &
  Documentos, SPED, Tabelas Fiscais). **lida**.
- `/nfce` (`?tipo=nfce|nfe|nfse`): gestor único de NFC-e, NF-e e NFS-e.
  **parcial**: a aba NFC-e e as janelas de emissão, CC-e, cancelamento, NFS-e,
  e-mail e DANFE foram lidas; a aba NF-e foi **recusada**; a aba NFS-e não foi
  aberta.
- `/manifestacao-nfe`: **lida** (96).
- `/mdfe`, `/cte`: **não abertas**.
- `/producao/sped-bloco-k`: **não aberta**.
- `/cfops`, `/cfop-conversoes`, `/fiscal-series`: **não abertas**.
- `/grupos-tributarios` (+`/create`): matriz fiscal com cerca de 150 campos,
  já com IBS, CBS e Imposto Seletivo. **lida** (912). Os valores de um grupo
  existente (`/{id}/edit`) foram **recusados**.
- `/ncms`: **não aberta**.

### 4.6 Pessoas & RH

**Ponto** (12 itens; 912, 913; o 15 está superado)

- `/dashboard/modulo/ponto` e `/ponto/dashboard` (= `/ponto`): **lidas**.
- `/ponto/espelho` (`?id_pessoa=&mes=&ano=`), `/ponto/mapa`,
  `/ponto/auditoria`, `/ponto/fechamento`, `/ponto/justificativas`,
  `/ponto/config`, `/ponto/feriados`, `/ponto/locais`, `/ponto/link`:
  **lidas** (sem dados de batida).
- `/carga-horarias`: jornada semanal com modelos rápidos. **lida**.
- `/ponto/relogio` → `/ponto/v/{slug}/relogio`: quiosque em tablet com código,
  PIN e foto obrigatória. **parcial**: só a identificação (913).
- `/ponto/app` → `/ponto/v/{slug}/app`: PWA do colaborador. **só login**.
- `/api/ponto/v1/v/{slug}`: API do app Android "Olimpia", configurado por QR.

**Folha** (12 itens; 913, 914; o 16 está superado)

- `/dashboard/modulo/folha`, `/folha`, `/folha/processamento`,
  `/folha/competencias`, `/folha/holerites`, `/folha/relatorios`,
  `/folha/relatorios/ficha-financeira`, `/folha/ferias`, `/folha/rescisao`,
  `/folha/eventos` (+`/create`), `/folha/rh/organizacao`: **lidas** (913).
- `/folha/beneficios`, `/folha/config`: **lidas** (914).

**Portal Colaborador** (914)

- `/dashboard/modulo/colaborador`: **lida**.
- `/colaborador/app` → `/colaborador/v/{slug}/app`: **só login**. As telas
  internas foram descritas a partir do script público da página. API em
  `/api/colaborador/v1/v/{slug}`.
- `/colaborador-admin/comunicados`, `/colaborador-admin/solicitacoes`:
  **lidas**.
- `/assinatura-admin` (Assinatura eletrônica): **lida**.

### 4.7 Sistema

**Mensalidades** (915, 916)

- `/dashboard/modulo/mensalidades`: hub com 3 cartões. **lida**.
- `/minha-assinatura`: créditos, próxima mensalidade e faturas. **lida**.
- `/meu-plano`: plano atual, módulos e troca de plano. **lida**.
- `/meus-termos`, `/meus-termos/{uuid}`, `/meus-termos/{uuid}/imprimir`:
  **lidas**.

**Parâmetros** (18, 915)

- `/dashboard/modulo/parametros`: hub com 9 cartões. **lida**.
- `/parametros-sistema`: 8 abas herdadas do desktop (geral, balança,
  etiqueta e carga de balança, gaveta, PDV e TEF, leitor e busca-preço, Bridge,
  skin). **lida**.
- `/parametros/campos-obrigatorios`: campos obrigatórios de cliente e produto.
  **lida**.
- `/bridge`: agente desktop com API local em `127.0.0.1:9876`. **lida**.
- `/mcp`, `/mcp/monitor`: **bloqueadas pelo plano**.
- `/forca-vendas/api`: URL da API mobile, QR, liberação de aparelhos. **lida**
  (14).
- Os cartões "Meu plano", "Mensalidades" e "Termos de uso" levam às telas de
  Mensalidades.
- Os cerca de 420 parâmetros de negócio ficam na aba "Parâmetros" da empresa
  (`/empresa/{id}`, 96).

**Utilitários** (916)

- `/dashboard/modulo/utilitarios`, `/sistema-melhorias` (Novidades),
  `/sistema-log-alteracoes` (+`/{id}`): **lidas**.

**Manual** (922; o 22 está superado)

- `/dashboard/modulo/manual`, `/manual` (22 cartões, 76 passos curtos):
  **lidas**.

### 4.8 Apps públicos e APIs

| App ou API | Endereço | Como entra | Estado |
| --- | --- | --- | --- |
| Vitrine da loja | `/loja/v/{slug}` | sem login (login do cliente opcional) | lida (922) |
| PWA da loja | `/loja/v/{slug}/app` | — | lida (922) |
| Cardápio | `/cardapio/v/{slug}` | só com o QR da mesa | lida (922) |
| Garçom | `/garcom/v/{slug}/login` | empresa + usuário + senha do ERP | só login (922) |
| Entregador | `/delivery/app` | telefone + PIN | só login (922) |
| Ponto (colaborador) | `/ponto/v/{slug}/app` | código + senha do ponto | só login (912) |
| Relógio de ponto | `/ponto/v/{slug}/relogio` | código + PIN + foto | parcial (913) |
| Portal do colaborador | `/colaborador/v/{slug}/app` | empresa + CPF ou código + senha | só login (914) |
| Técnico de OS | `/os/v/{slug}/tecnico/app` | empresa + usuário + senha | só login (14) |
| Portal do cliente | `/cliente-portal/app` | (CPF + senha, segundo o manual) | recusada (922) |
| App Força de Vendas | Android (Google Play) + `/api/mobile?codigo_acesso=…` | código da empresa na URL e aparelho liberado | lado do ERP lido (14) |
| API da loja | `/api/loja/v1/v/{slug}` | — | não aberta (93) |
| API do ponto | `/api/ponto/v1/v/{slug}` | QR com JSON | não aberta (912) |
| API do colaborador | `/api/colaborador/v1/v/{slug}` | token Bearer | vista no script (914) |
| Webhook Mercado Livre | `/api/webhooks/mercado-livre/{slug}` | token na URL | citado na documentação (922) |
| Bridge (local) | `http://127.0.0.1:9876` | token de pareamento | lido no script (915) |

---

## 5. Os 36 módulos do plano Full, um a um

Cada parágrafo diz o que o módulo faz na Olímpia, até onde foi visto e onde
está o detalhe. A correspondência com os nossos módulos está no
[catálogo funcional](catalogo-funcional.md#2-tabela-resumo).

1. **ERP (Dashboard).** É a página inicial e a moldura comum: menu de 27
   módulos, atalhos rápidos, busca de telas, novidades, notificações e
   assistente. A página `/dashboard` em si não foi aberta. A moldura foi vista
   em todas as outras telas (seção 3). Detalhe: (18), (93), (922).

2. **Cadastros.** Reúne o cadastro único de pessoas com papéis, a empresa e as
   filiais, o plano de contas, municípios (base IBGE), zonas, bairros com tarifa
   de entrega, rotas, veículos com dados do MDF-e, produtos e as tabelas de
   apoio (grupos com comissão e ordem, subgrupos com foto, fabricantes, cores,
   grades, NCM e cadastros de confecção como golas, mangas e tecidos), serviços,
   formas de pagamento, usuários e grupos de permissão. Vistos a empresa, o
   plano de contas, a geografia, veículos, grupos, subgrupos, carga horária e a
   consulta do cliente; o cadastro de produtos e o de pessoas ficaram quase
   todos por ver. Detalhe: (96), (93), (912), (918), (95).

3. **Parâmetros & Empresa.** O cadastro da empresa tem quatro abas: dados com
   consulta do CNPJ na Receita (e escolha da inscrição estadual), logo e QR do
   Pix, certificado A1 único para todos os documentos fiscais e bancos,
   integração bancária e cerca de 420 parâmetros em 16 grupos (vendas, estoque,
   caixa, financeiro, fiscal, PDV, OS, e-mails, condomínio, confecção...). Há
   ainda os parâmetros de hardware herdados do desktop, os campos obrigatórios
   de cliente e produto e o agente Bridge. Detalhe: (96), (915), (18).

4. **Vendas.** O orçamento, a venda e a venda cancelada são o mesmo documento,
   com os estados 0, 1 e 2. Há venda balcão, venda pelo celular, faturamento em
   lote de orçamentos (com 24 tipos de regra, 35 modelos, aprovação por senha
   ou remota e "desfazer lote" com motivo), liberação de supervisor (local ou
   remota, numa fila ao vivo), trocas e devoluções que geram crédito do
   cliente. A tela de venda balcão (`/vendas`) não foi aberta. Detalhe: (918),
   (96), (916), (20).

5. **Financeiro (Contas a Pagar/Receber, Caixa).** As contas a receber, a pagar
   e o caixa não foram abertos. Pelos relatórios e por outras telas sabe-se
   que: vendas e OS geram parcelas a receber com a comissão gravada em cada
   uma; a parcela só tem os estados "aberta" e "paga"; o plano de contas é uma
   árvore só de nomes; existem previsão financeira, aging e fluxo de caixa; o
   caixa tem fechamento cego configurável por forma de pagamento. Detalhe:
   (20), (96), (98), (917), (918).

6. **Estoque & Entradas.** Movimenta por documentos com estado (pendente,
   concluído, cancelado) e com uma lista de 41 operações fiscais comum à
   entrada e à saída. O saldo pode ser separado por local (geral, prateleira,
   reserva, entrega futura) e por grade. Tem entrada por XML com busca
   automática das notas na SEFAZ a cada 5 minutos e manifestação do
   destinatário, entrada e saída manuais, troca, transferência entre filiais,
   balanço por contagem, histórico com saldo antes e depois e romaneio de
   carga. Detalhe: (96), (919), (920).

7. **PDV / Frente de Caixa.** A tela `/pdv` não foi aberta. Pelos parâmetros, o
   PDV tem atalhos de teclado (F2 a F11), balança (Web Serial no navegador ou
   pelo Bridge), código de pesagem, couvert e taxa de serviço, cliente e forma
   de pagamento padrão, TEF Dial, NFC-e automática com cartão e senhas para
   sangria e cancelamentos. Detalhe: (96), (915), (922).

8. **Cashback.** As telas não foram abertas. Pelos parâmetros há cashback
   ativo, percentual e tipo; a Central tem relatórios de créditos do cliente e
   de créditos usados em vendas. Detalhe: (911), (96), (916).

9. **Relatórios.** Um motor genérico (uma rota, uma definição por relatório,
   filtros na URL) serve 132 relatórios em 16 categorias, todos em PDF, Excel e
   CSV. O hub mostra só 78 deles. Nenhum foi gerado; os filtros de cerca de 60
   foram lidos. A fila para relatórios grandes ainda não existe. Detalhe:
   (916), (917), (918), (919), (920), (921), (20).

10. **Balcão de Entrega.** A tela `/balcao-entrega` não foi aberta. Um
    parâmetro de vendas permite baixar o estoque na finalização da venda ou na
    entrega no balcão. Detalhe: (96), (90).

11. **Painel de Preços.** Provavelmente é o "Painel TV" do menu (Canais
    Digitais), com link e configuração; não foi aberto. Detalhe: (90), (04).

12. **Emissão NF-e.** Um gestor único (`/nfce`) emite NFC-e, NF-e e NFS-e. A
    nota nasce sempre de um registro existente (venda, saída de estoque ou OS)
    digitado pelo número, com uma "operação" (grupo tributário) que define
    CFOP, CST e alíquotas. Tem pré-visualização sem envio, carta de correção,
    cancelamento com justificativa, nota referenciada (a chave da NFC-e entra
    sozinha na NF-e posterior), consulta por chave e estado da SEFAZ. Detalhe:
    (13), (912).

13. **Emissão NFC-e.** Usa o mesmo gestor e a mesma janela de emissão. Os
    estados são os códigos da SEFAZ (100 autorizada, 101 cancelada, 102
    inutilizada, 999 contingência); as operações "VENDA PDV ON" e "OFF"
    indicam emissão em contingência no PDV. Detalhe: (13).

14. **Bancos.** Contas bancárias, movimentação, conciliação por arquivo OFX
    (com regras por texto e sem duplicar na reimportação) e boletos com 16
    provedores, por API ou arquivo CNAB 240/400. As telas de bancos e contas
    não foram abertas. Detalhe: (99), (918), (96), (922).

15. **PIX.** Configurado na integração bancária da empresa, com 12 provedores e
    um teste de geração de QR. Para o Pix aparecer no caixa e no PDV, marca-se
    "gerar QR Code Pix" na forma de recebimento. O relatório "PIX recebidos"
    lista cobranças com txid (Pix dinâmico). Detalhe: (96), (922), (918).

16. **TEF.** A tela `/financeiro/tef` não foi aberta. Os parâmetros falam em
    TEF Dial, percentuais por modalidade e autoemissão da NFC-e; a Central tem
    um relatório de operações de cartão (NSU, bandeira, parcelas). Detalhe:
    (915), (96), (99).

17. **CRM / Markup.** Só o hub foi lido: painel, calendário de aniversários,
    clientes do CRM, operação, campanhas e "CRM Markup". Pela Central, o markup
    é uma meta de markup por grupo de produto. Detalhe: (910), (916).

18. **Sinuca.** Uma tela "Controle de mesas e leituras", para cobrar mesas de
    bilhar por tempo. Não foi aberta. Detalhe: (04).

19. **Emissão CT-e.** A tela não foi aberta; o relatório de CT-e emitidos usa
    um filtro de estado em texto livre. Detalhe: (13), (921).

20. **Emissão MDF-e.** A tela não foi aberta. O relatório mostra o ciclo
    pendente → autorizado → encerrado ou cancelado. O cadastro de veículos já
    traz os campos do MDF-e (tipo, carroceria, carreta, proprietário com
    RNTRC). Detalhe: (921), (96).

21. **Loja Virtual.** E-commerce com endereço próprio por empresa, PWA e API
    pública. Configura nome, SEO, quatro cores, carrossel e banners e usa o
    mesmo frete do delivery. Tem cupons simples (percentual ou fixo, com
    validade) e avaliações que passam por moderação. O pedido vira venda do ERP
    e tem estado do pedido e do pagamento separados. Detalhe: (93), (922).

22. **Comanda Digital / Cardápio.** O hub tem painel da cozinha, pedidos online,
    links e QR, mesas, tablet de autoatendimento com banners, PWA e
    configurações; o catálogo é o geral. O cardápio público só abre a partir do
    QR de uma mesa. O garçom usa um PWA com o login do ERP. Só o hub e as
    páginas de entrada dos apps foram vistos. Detalhe: (04), (922).

23. **Mercado Livre.** Liga a conta por OAuth, recebe os pedidos pagos por
    webhook (com uma rotina de recuperação a cada 5 minutos), vincula anúncios a
    produtos pelo SKU, devolve o saldo de estoque aos anúncios depois de cada
    venda e a cada 10 minutos e pode emitir a NF-e sozinha. A documentação
    interna é a melhor ajuda do ERP. Detalhe: (93), (922).

24. **Delivery Próprio.** Só a configuração do frete foi lida: por quilômetro
    (com mínimo e frete grátis) ou por bairro digitado à mão. O app do
    entregador entra com telefone e PIN; pelo manual, tem GPS e prova de
    entrega. Pedidos e entregadores não foram abertos. Detalhe: (93), (922).

25. **Força de Vendas (Android).** O app Android é separado e fala com uma API
    mobile cujo endereço leva o código da empresa. No ERP ficam a liberação de
    aparelhos (com limite por plano), a cobertura de visitas por rota com mapa,
    os clientes sem comprar, a positivação de um mix de produtos e o
    faturamento em lote dos orçamentos. Detalhe: (14), (917), (918).

26. **Produção.** Nenhuma tela foi aberta: ordens de produção, sete telas de
    desossa (nova, lista, fichas, relatórios, derivados, rendimentos,
    configuração) e o SPED bloco K. A Central tem relatórios de ordens, de
    insumos e de composição (ficha técnica). Detalhe: (10), (97), (98).

27. **Ponto Eletrônico.** Ponto por programa (o painel diz "REP-P / Portaria
    671"): batida pelo celular com GPS, em tablet com código, PIN e foto, ou
    pelo app Android; cerca virtual em modo aviso ou bloqueio; auditoria de foto
    e facial; justificativas; feriados nacionais gerados; fechamento com horas
    extras, noturno, DSR e banco "para a folha". Não aparecem os arquivos AFD e
    AEJ nem o comprovante. Detalhe: (912), (913).

28. **Folha de Pagamento.** Competências, processamento num clique (importa o
    ponto aprovado, banco de horas e vales; calcula INSS, IRRF e FGTS),
    holerites para imprimir, relatórios (eSocial S-1200 como arquivo, CNAB 240
    de salários), ficha financeira, férias, 13º, rescisão, cerca de 200 rubricas
    da tabela do eSocial, benefícios e configurações. Detalhe: (913), (914).

29. **Portal do Colaborador.** PWA por empresa com holerites, espelho, banco de
    horas, vales, solicitações (férias, folga, atestado, ajuste de ponto) e
    avisos com confirmação de leitura; no lado do gestor, comunicados e
    solicitações. É um app diferente do app do ponto. Detalhe: (914).

30. **Ordem de Serviço.** Pensada para oficina mecânica: veículo em texto
    livre, peças do estoque e serviços do cadastro (cada linha com o seu
    colaborador), deslocamento e guincho, descontos em seis campos, observação
    para o cliente separada da interna, chamados vindos do portal, app do
    técnico com GPS, laudo e fotos, checklists, 12 relatórios e comissões.
    Detalhe: (14), (20), (919).

31. **Portal do Cliente.** Não foi aberto. Pelo manual, o cliente vê títulos e
    boletos, acompanha pedidos e abre chamados de OS. Detalhe: (922), (14).

32. **Assinatura Eletrônica.** Documento com signatário, estados (pendente,
    parcial, concluído, cancelado) e evidências (IP, geolocalização, hash). Fica
    dentro do Portal do Colaborador, embora sirva também à OS e a contratos.
    Detalhe: (914), (922).

33. **Compras e Suprimentos.** O painel mostra o fluxo solicitação → cotação →
    aprovação → pedido → recebimento. A lista de pedidos tem os estados aberto,
    parcial, recebido e cancelado e não tem botão "Novo". Solicitações e
    cotações não foram abertas. Detalhe: (920).

34. **Cobrança Automática.** Réguas com três etapas fixas por e-mail (3 dias
    antes, no dia e 5 dias depois do vencimento), links de pagamento por
    parcela e três gateways (Asaas, Efí, Mercado Pago) com um único campo de
    chave marcado "stub". Detalhe: (910).

35. **BI Executivo.** Ver o item `/bi` na [seção 4.1](#41-visão-geral): 12
    indicadores com link para agir, radar de atenção e 11 gráficos. Detalhe:
    (922).

36. **Consultoria / Gestão 360°.** A metodologia de consultoria da própria
    Olímpia dentro do ERP: projeto, diagnóstico por área, problemas
    priorizados, plano 30/60/90 com metas, reuniões, relatório executivo e um
    consultor de IA que depende de uma chave da plataforma. Detalhe: (914),
    (915).

**Fora da lista dos 36, mas presentes no ERP**

- **Comissões e metas:** comissão por item de venda e de OS, regimes "pela
  venda" e "pelo recebimento", sete relatórios e uma meta com prêmios para os
  três primeiros. Detalhe: (20), (916), (918).
- **Mensalidades, Utilitários e Manual:** assinatura e termos; novidades e log
  de alterações; manual de 22 cartões. Detalhe: (915), (916), (922).
- **MCP / Conector IA e Monitor WhatsApp IA:** adicionais fora do Full. O
  agente de vendas com IA atende no WhatsApp e cria vendas e orçamentos no ERP.
  Detalhe: (915).
- **Olimpia Bridge:** agente desktop para impressora, gaveta, balança, leitor e
  certificado. Detalhe: (915).

---

## 6. Arquivos desta pasta

| Arquivo | Assunto | Estado | Substituído por |
| --- | --- | --- | --- |
| [03-caixa.md](03-caixa.md) | caixa e recebimento | não explorado | — (continua sem leitura) |
| [04-cardapio-comanda-cozinha.md](04-cardapio-comanda-cozinha.md) | cardápio, comanda, mesas, cozinha, tablet, sinuca | só o hub | 922 (apps públicos) |
| [05-delivery.md](05-delivery.md) | delivery | não explorado | 93, 922 (em parte) |
| [06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md) | loja e Mercado Livre | não explorado | 93, 922 |
| [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md) | pessoas, empresa, acessos | não explorado | 96, 912, 918 (em parte) |
| [09-estoque.md](09-estoque.md) | estoque | não explorado | 96 |
| [10-compras-producao.md](10-compras-producao.md) | compras, produção, desossa | não explorado | 920 (compras, em parte) |
| [11-financeiro-bancos.md](11-financeiro-bancos.md) | financeiro, bancos, TEF, contador | não explorado | 99, 918, 922 (em parte) |
| [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md) | cobrança, CRM, cashback, portal | não explorado | 910 (cobrança) |
| [13-fiscal.md](13-fiscal.md) | fiscal | parcial (2 de 10 rotas) | completado em parte por 912, 96, 921 |
| [14-os-forca-vendas.md](14-os-forca-vendas.md) | OS, técnico, força de vendas, rotas | explorado (conta sem dados) | — |
| [15-ponto.md](15-ponto.md) | ponto | não explorado | 912, 913 |
| [16-folha-colaborador.md](16-folha-colaborador.md) | folha, portal do colaborador, assinatura | não explorado | 913, 914 |
| [17-consultoria-ia.md](17-consultoria-ia.md) | consultoria, IA, MCP | não explorado | 914, 915 |
| [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md) | parâmetros, plano, utilitários, comissões | só o hub | 915, 916 |
| [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md) | relatórios de vendas e financeiro | não explorado | 916, 917, 918 |
| [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md) | relatórios de comissões e OS | parcial (10 de 15) | 918, 919 completam |
| [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md) | relatórios de estoque, compras, fiscal | não explorado | 919, 920, 921 |
| [22-manual.md](22-manual.md) | manual | não explorado | 922 |
| [90-lacunas-1.md](90-lacunas-1.md) | dashboard, BI, TV, vendas, PDV, romaneios | não explorado | 918, 920, 922 (em parte) |
| [91-lacunas-2.md](91-lacunas-2.md) | liberações, troca, caixa, cardápio | não explorado | 918, 96 (em parte) |
| [93-lacunas-4.md](93-lacunas-4.md) | delivery (frete), loja virtual, ML (hub) | explorado (10 de 12) | — |
| [94-lacunas-5.md](94-lacunas-5.md) | Mercado Livre, produtos, tabelas de apoio | não explorado | 922 (documentação ML) |
| [95-lacunas-6.md](95-lacunas-6.md) | confecção, pessoas, usuários, formas de pagamento | não explorado | 912, 918 (em parte) |
| [96-lacunas-7.md](96-lacunas-7.md) | empresa, plano de contas, geografia, estoque | explorado | — |
| [97-lacunas-8.md](97-lacunas-8.md) | transferências, balanços, compras, desossa | não explorado | 96, 920 (em parte) |
| [98-lacunas-9.md](98-lacunas-9.md) | desossa, financeiro, bancos | não explorado | — (continua sem leitura) |
| [99-lacunas-10.md](99-lacunas-10.md) | conciliação, boletos, TEF, contador | parcial (1 de 12) | 918, 922 (em parte) |
| [910-lacunas-11.md](910-lacunas-11.md) | cobrança automática e CRM | parcial (6 de 12) | — |
| [911-lacunas-12.md](911-lacunas-12.md) | cashback, portal do cliente, telas fiscais | não explorado | — |
| [912-lacunas-13.md](912-lacunas-13.md) | grupo tributário e ponto | explorado | — |
| [913-lacunas-14.md](913-lacunas-14.md) | relógio de ponto e folha | explorado | — |
| [914-lacunas-15.md](914-lacunas-15.md) | benefícios, portal do colaborador, assinatura, consultoria | explorado | — |
| [915-lacunas-16.md](915-lacunas-16.md) | consultoria, MCP, Bridge, parâmetros, assinatura do ERP | explorado | — |
| [916-lacunas-17.md](916-lacunas-17.md) | termos, utilitários, comissão por metas, Central | explorado | — |
| [917-lacunas-18.md](917-lacunas-18.md) | relatórios de força de vendas, receber, pagar | parcial (3 de 12) | — |
| [918-lacunas-19.md](918-lacunas-19.md) | faturamento, bancos, pós-venda, comissões | explorado | — |
| [919-lacunas-20.md](919-lacunas-20.md) | relatórios de OS e estoque | explorado | — |
| [920-lacunas-21.md](920-lacunas-21.md) | relatórios de produtos, estoque, compras, NF-e; romaneio | explorado (11 de 12) | — |
| [921-lacunas-22.md](921-lacunas-22.md) | relatórios fiscais e de canais | parcial (8 de 12) | — |
| [922-lacunas-23.md](922-lacunas-23.md) | manual, BI, documentação ML, apps públicos | explorado | — |

Os arquivos "não explorado" foram mantidos como estão: registram o bloqueio e as
perguntas para uma próxima passagem. Onde houver um arquivo que os substitui,
vale este último.

---

## 7. Cobertura e rotas que continuam sem leitura

Na consolidação chegou uma lista de 131 rotas sem cobertura. Os lotes de
lacunas mais recentes (912 a 922) já cobriram 25 delas, total ou parcialmente.
Sobram 106 rotas sem leitura.

### 7.1 Rotas da lista que lotes posteriores cobriram

| Rota | Estado | Arquivo |
| --- | --- | --- |
| `/bi` | lida | 922 |
| `/financeiro/faturamento` | lida | 918 |
| `/romaneios` | lida | 920 |
| `/financeiro/liberacoes` | lida | 918 |
| `/troca-produto` | parcial | 96 |
| `/cardapio/app` | lida (instalação e "sem mesa") | 922 |
| `/delivery/app` | só login | 922 |
| `/loja/app` | lida | 922 |
| `/integracoes/mercado-livre/documentacao` | lida | 922 |
| `/pessoas` | parcial (aba Colaborador do formulário) | 912 |
| `/consulta-cliente` | lida | 918 |
| `/carga-horarias` | lida | 912 |
| `/transferencias`, `/balancos`, `/estoque-log` | lidas | 96 |
| `/compras`, `/compras/pedidos` | lidas | 920 |
| `/financeiro/banco-movimentacao`, `/financeiro/boletos` | lidas | 918 |
| `/financeiro/integracao-bancaria` | lida (redireciona para a empresa) | 922, 96 |
| `/manifestacao-nfe` | lida | 96 |
| `/mcp`, `/mcp/monitor` | bloqueadas pelo plano | 915 |
| `/relatorios/rota-visitas` | parcial (filtros conhecidos) | 14, 917 |
| `/dashboard/modulo/manual` | lida | 922 |

### 7.2 Rotas que continuam sem leitura

Agrupadas por módulo. Onde há uma informação indireta (cartão da Central, menu,
manual ou parâmetro), ela aparece entre parênteses.

| Módulo | Rotas sem leitura |
| --- | --- |
| Dashboard e BI | `/dashboard`, `/dashboard/modulo/bi` |
| Painel TV | `/dashboard/modulo/painel-tv`, `/painel-tv-admin/link`, `/painel-tv-admin/config` |
| Vendas e PDV | `/vendas`, `/pdv`, `/garcom/mobile-venda`, `/balcao-entrega` (parâmetros do PDV e de vendas em 96) |
| Caixa | `/financeiro/recebimento`, `/financeiro/caixa`, `/relatorios/caixa-vendas-por-vendedor`, `/relatorios/caixa-conferencia-cega`, `/relatorios/caixa-historico`, `/relatorios/caixa-suprimentos`, `/relatorios/caixa-sangrias` (cartões da Central em 916) |
| Cardápio, mesas e cozinha | `/cardapio-admin/cozinha`, `/cardapio-admin/pedidos-online`, `/cardapio-admin/link`, `/cardapio-admin/mesas`, `/atendimento-tablet-admin/link`, `/atendimento-tablet-admin/banners`, `/cardapio-admin/config`, `/garcom-admin/link` |
| Sinuca | `/dashboard/modulo/sinuca`, `/sinuca` |
| Delivery | `/dashboard/modulo/delivery`, `/delivery-admin`, `/delivery-admin/pedidos`, `/delivery-admin/entregadores` (manual em 922) |
| Mercado Livre | `/integracoes/mercado-livre/pedidos`, `/integracoes/mercado-livre/anuncios`, `/integracoes/mercado-livre/config` (documentação em 922) |
| Produtos e tabelas de apoio | `/produtos`, `/produtos/gerenciamento`, `/fabricantes`, `/produto-cores`, `/grades`, `/ncms`, `/golas`, `/mangas`, `/tecidos`, `/confeccao-status`, `/etiquetas` (configuração das lupas em 919 e 920; campos obrigatórios em 915) |
| Cadastros e acessos | `/dashboard/modulo/cadastros`, `/pessoas?tipo=cliente`, `/colaborador-cargos`, `/forma-pagamentos`, `/usuarios`, `/usuario-grupos` |
| Compras | `/dashboard/modulo/compras`, `/compras/solicitacoes`, `/compras/cotacoes` |
| Produção e desossa | `/dashboard/modulo/producao`, `/producao/ordens`, `/producao/desossas/nova`, `/producao/desossas`, `/producao/desossa-fichas`, `/producao/desossas-relatorios`, `/producao/desossas-produtos-derivados`, `/producao/desossas-rendimentos`, `/producao/desossa-config` |
| Financeiro | `/dashboard/modulo/financeiro`, `/financeiro/receber`, `/financeiro/pagar`, `/financeiro/pagar-baixa`, `/bancos`, `/banco-contas`, `/cedentes`, `/financeiro/boletos-liquidados`, `/financeiro/tipo-recebimentos`, `/financeiro/tipo-documentos`, `/financeiro/tef`, `/financeiro/pos-operadoras`, `/financeiro/cartoes`, `/contador-admin`, `/contador-admin/link` |
| CRM | `/crm`, `/crm/aniversarios`, `/crm/clientes`, `/crm/operacao`, `/crm/gestao`, `/crm-markup` (hub em 910) |
| Cashback | `/dashboard/modulo/cashback`, `/cashback-admin` |
| Portal do cliente | `/dashboard/modulo/cliente`, `/cliente-portal/app`, `/cliente-portal-admin/link` (manual em 922) |
| Fiscal | `/mdfe`, `/cte`, `/producao/sped-bloco-k`, `/cfops`, `/cfop-conversoes`, `/fiscal-series` (relatórios fiscais em 921) |
| Relatórios | `/relatorios/receber-por-cliente`, `/relatorios/receber-aging`, `/relatorios/pagar-por-fornecedor`, `/relatorios/pagar-pagamentos-periodo`, `/relatorios/pagar-aging`, `/relatorios/pagar-por-plano-contas`, `/relatorios/previsao-financeira`, `/relatorios/faturamento-lotes`, `/relatorios/compras-por-produto`, `/relatorios/ml-anuncios`, `/relatorios/loja-pedidos`, `/relatorios/produtos-lista-precos` (todos com cartão da Central em 916 e 917) |

**Telas lidas, mas com detalhe faltando** (a conta não tinha dados, ou uma
leitura foi recusada): formulário de serviço e de checklist da OS, grupo de
produto ("Novo"), valores de um grupo tributário, abas NF-e e NFS-e do `/nfce`,
janelas de importação OFX e de regras da conciliação, campos por provedor da
integração bancária, questionário IOG da consultoria, telas internas dos apps
(garçom, entregador, ponto, colaborador, técnico) e o resultado de todos os
relatórios.

---

## 8. Pendências gerais

1. **As telas do dia a dia de comida e varejo continuam sem leitura.** Venda
   balcão, PDV, caixa, painel da cozinha, pedidos online, mesas, comanda do
   garçom, delivery (pedidos e entregadores), contas a receber e a pagar,
   produção e desossa. O catálogo funcional cobre essas áreas com conhecimento
   do domínio e com o que os parâmetros, os relatórios e o manual revelam,
   marcando o que é dedução.
2. **A conta de teste não tem movimento.** Não há vendas, produtos,
   colaboradores, batidas, OS, títulos nem notas. Por isso não se viram ações
   por linha, mudanças de estado, cálculos (OS, folha, ponto, comissão),
   impressões nem o resultado de nenhum relatório.
3. **"Gerar" relatórios ficou proibido** em toda a pesquisa. As colunas e os
   totais dos relatórios são deduzidos da frase de cada tela e do cartão da
   Central.
4. **A navegação foi recusada várias vezes pela verificação de segurança do
   Claude Code** (modo automático, motivo "Third-Party Attack"). Ela parou
   vários lotes no meio e não foi contornada. Completar a pesquisa depende de
   uma decisão do dono da conta: autorizar a leitura de forma explícita (por
   exemplo, aprovando cada página fora do modo automático) e, antes disso,
   confirmar que os termos de uso da Olímpia permitem esse levantamento com a
   conta de teste.
5. **Confirmações legais e fiscais antes de construir.** Prazos de
   cancelamento e contingência da NFC-e em Rondônia, obrigatoriedade da NFC-e
   por atividade, requisitos do ponto por programa (Portaria MTP 671/2021:
   comprovante, AFD, AEJ, registro do programa), regras da taxa de serviço e da
   gorjeta, validade da assinatura eletrônica por tipo de documento. Ver com o
   contador e o jurídico.
6. **Inconsistências da Olímpia a confirmar, se houver nova passagem:**
   - "ciência automática" da manifestação aparece ligada nos parâmetros e
     desligada na tela de importação (96);
   - o frete da loja virtual e o do delivery parecem ser o mesmo registro (93,
     922);
   - o atalho da integração bancária abre sempre a empresa 1, mesmo com
     filiais (922);
   - os códigos de tipo de veículo e de carroceria do cadastro de veículos não
     batem com a tabela oficial do MDF-e (96);
   - o botão que puxa os produtos de um fabricante para o mix da positivação
     não deve funcionar (917).
7. **Arquivos antigos a atualizar.** Os arquivos 15, 16, 17 e 22 continuam a
   dizer "não explorado", embora o conteúdo esteja agora em 912 a 922. Não
   foram alterados nesta consolidação; a tabela da [seção 6](#6-arquivos-desta-pasta)
   indica o arquivo que vale.
8. **Segredos vistos de passagem não foram copiados.** A documentação do
   Mercado Livre mostra o token do webhook em texto aberto, e a API da força de
   vendas leva o código da empresa no endereço. Nada disso foi registrado; os
   dois casos entram como oportunidades de segurança no catálogo.
