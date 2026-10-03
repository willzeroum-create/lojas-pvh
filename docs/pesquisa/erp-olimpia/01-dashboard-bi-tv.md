# 01 — Dashboard, BI Executivo e Painel TV (ERP Olímpia)

> Cobre a página inicial (`/dashboard`), o BI Executivo (hub e `/bi`) e o Painel TV
> (hub, link e configuração). Exploração de 2026-10-03, só de leitura, na conta de
> teste "Boi Criolo" (plano Full, perfil ADMIN). Só `/bi` foi lida; as outras rotas
> ficaram fechadas. Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo
> manual], [código] (lido no HTML/JS da página), [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

- **Dashboard** é a página inicial do ERP e o destino do link "Voltar ao dashboard"
  que existe no topo de todos os hubs de módulo (`/dashboard/modulo/{modulo}`)
  [visto nos hubs]. A tela `/dashboard` em si nunca abriu: não se sabe que
  indicadores mostra.
- O link "Fechar" da Conciliação bancária também volta a `/dashboard`, e não ao
  módulo Financeiro [visto; ver [11-financeiro-bancos.md](11-financeiro-bancos.md)].
- **BI Executivo** fica na seção "Visão Geral" do menu lateral, junto com
  Consultoria e Relatórios [visto no menu]. O hub `/dashboard/modulo/bi` não foi
  aberto. A tela `/bi` ("Painel Executivo") foi lida a partir do botão "Abrir
  módulo" do cartão "BI Executivo" do manual (ver [22-manual.md](22-manual.md)).
- **Painel TV** fica na seção "Canais Digitais" do menu, junto com Loja Virtual,
  Mercado Livre, Cardápio Digital e Delivery [visto no menu]. Nenhuma das suas
  telas foi aberta. O menu do Painel TV tem o item "Grupos de Produto", o mesmo
  cadastro que aparece nos menus da Loja Virtual, do Cardápio Digital e de
  Cadastros [visto no menu]: o painel usa o catálogo único do ERP [deduzido].
  O grupo de produto tem um campo "Ordem", que deve servir para ordenar as
  categorias na vitrine, no cardápio e no painel TV [deduzido; ver
  [07-produtos.md](07-produtos.md)].
- **Plano:** a lista dos 36 módulos do plano Full inclui "ERP (Dashboard)",
  "Painel de Preços" e "BI Executivo" [visto em `/meu-plano`; ver
  [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)]. Pela
  hipótese da ordem dos escalões (não confirmada), "BI Executivo" é exclusivo do
  Full e "Painel de Preços" já vem no Profissional. "Painel de Preços" é
  provavelmente o "Painel TV" do menu [deduzido, a confirmar; não há módulo com
  esse nome no menu].
- **Manual:** o cartão "BI Executivo" (`mod-bi`) diz que o painel fica em `/bi`,
  que se filtra por período **e empresa** e que os gráficos são feitos com
  Chart.js "em tempo real" [afirmado pelo manual]. A tela só tem filtro de
  período (ver 2.3). O Painel TV **não tem cartão** no manual [visto].

### 1.1 Elementos globais vistos de passagem

A moldura comum a todas as telas (cabeçalho, busca Ctrl+K, menu lateral com
"Fixados" e "Atalhos rápidos", barra inferior no celular, hubs com "Voltar ao
dashboard" e avisos por sondagem) está descrita uma só vez em
[22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas).

### 1.2 Rotas e estado

| Rota | Nome | Estado |
|---|---|---|
| `/dashboard` | página inicial | recusada (a abertura foi negada pela trava do modo automático) |
| `/dashboard/modulo/bi` | hub do BI Executivo | não aberta |
| `/bi` | Painel Executivo | lida (período 30d) |
| `/dashboard/modulo/painel-tv` | hub do Painel TV | não aberta |
| `/painel-tv-admin/link` | link do Painel TV | não aberta |
| `/painel-tv-admin/config` | configuração do Painel TV | não aberta |

## 2. Telas

### 2.1 `/dashboard` — Página inicial [não aberta]

- **O que se sabe:** é o destino de "Voltar ao dashboard" em todos os hubs e do
  "Fechar" da Conciliação bancária [visto nessas telas]. O manual (cartão "ERP Core
  & Dashboard") diz que se entra com empresa, usuário e senha, que a filial se
  escolhe no topo, que o menu é agrupado por área e que as novidades ficam em
  Utilitários → Melhorias e Ajustes [afirmado pelo manual]. Os exemplos de grupos
  do menu citados no manual não batem com os nomes reais das seções [visto].
- A API do Portal do Colaborador também tem um `GET /dashboard` próprio (resumo da
  tela inicial do app), que **não** é esta tela (ver
  [16-folha-colaborador.md](16-folha-colaborador.md)).
- **Perguntas a responder:**
  - que indicadores aparecem (vendas do dia, ticket médio, contas a pagar e a
    receber, estoque baixo, pedidos em aberto) e de que período;
  - se muda por perfil de usuário ou por empresa/filial, e se o usuário escolhe os
    blocos;
  - que avisos aparecem (certificado digital a vencer, mensalidade, notas
    rejeitadas, novidades);
  - o que no menu é fixo e o que é configurável (seção "Fixados").

### 2.2 `/dashboard/modulo/bi` — Hub do BI Executivo [não aberto]

- **O que se sabe:** segue o padrão dos hubs (cartões, "Voltar ao dashboard")
  [deduzido].
- **Perguntas a responder:** que cartões tem além de `/bi`; diferença entre o hub e
  a tela `/bi`; se há outros painéis (vendas, margem, curva ABC, financeiro,
  estoque).

### 2.3 `/bi` — Painel Executivo [visto]

- **Objetivo:** "visão do dono" numa tela só, misturando vendas, financeiro,
  estoque, canais e RH [deduzido].
- **Período:** links `?periodo=7d`, `30d` (padrão), `90d` e `12m`. O cabeçalho
  mostra as datas do período e avisa que os números são comparados com o período
  anterior [visto]. **Não há filtro de empresa** nem de filial, vendedor ou
  categoria, ao contrário do que diz o manual [visto].
- **Botões:** "Atualizar dados" e "Imprimir painel" (não clicados).
- **12 indicadores**, vários com link para a tela de ação [visto]:

| Indicador | Link |
|---|---|
| Faturamento | `/vendas?status=1` |
| Qtd. de vendas | `/vendas?status=1` |
| Ticket médio | — |
| Clientes atendidos | — |
| Recebido no período | Contas a receber |
| A receber ("Abrir") | `/financeiro/receber` |
| Receber vencido ("Cobrar") | `/financeiro/receber` |
| A pagar | `/financeiro/pagar` |
| Valor em estoque | — |
| Orçamentos pendentes ("Faturar") | `/financeiro/faturamento` |
| Pedidos loja + app | — |
| Colaboradores no ponto | — |

- **"Radar — pontos de atenção"** (5 itens) [visto]: receber vencido; pagar
  vencido; orçamentos aguardando faturamento; produtos abaixo do estoque mínimo
  (link genérico para a Central de Relatórios, e não para o relatório certo);
  saldo previsto (receber − pagar).
- **11 gráficos ou listas** [visto]: vendas no período (valor e quantidade); fluxo
  de caixa previsto das próximas 8 semanas; receber em aberto por faixa de atraso;
  top 10 produtos; top 10 clientes; top vendedores; vendas por forma de pagamento;
  receber × pagar em aberto; pedidos por canal; evolução mensal em 12 meses; horas
  extras do ponto em 30 dias.
- **Estado nesta conta:** tudo zerado ou "Sem dados no período", porque a conta não
  tem movimento [visto].
- Os orçamentos não têm item próprio no menu: o caminho que o BI dá para eles é
  "Faturar" → Faturamento de Vendas (ver
  [02-vendas-pdv.md](02-vendas-pdv.md), seção 2.5) [visto].
- Os gráficos são feitos com Chart.js [afirmado pelo manual].
- **Perguntas ainda abertas:** se o BI é só esta tela ou tem outros painéis no hub;
  se exporta (PDF, Excel) ou agenda envio além de "Imprimir painel"; se respeita a
  empresa/filial ativa na sessão; com que frequência "em tempo real" atualiza.

### 2.4 `/dashboard/modulo/painel-tv` — Hub do Painel TV [não aberto]

- **O que se sabe:** é o item "Painel TV" do grupo "Canais Digitais"; o submenu tem
  "Grupos de Produto" [visto no menu]. O nome "Painel de Preços" do plano deve ser
  este módulo [deduzido, a confirmar].
- **Perguntas a responder:**
  - o que a TV mostra: senhas ou pedidos prontos, cardápio, tabela de preços,
    promoções, ranking;
  - ligação com cozinha, balcão de entrega e delivery;
  - quais cartões tem o hub além de link e configuração.

### 2.5 `/painel-tv-admin/link` — Link do Painel TV [não aberto]

- **Perguntas a responder:** como a TV se liga (link público, QR Code ou código de
  pareamento); se o link expira e se pode ser trocado ou revogado (só olhar, sem
  gerar); se segue o padrão `/{app}/v/{slug}` dos outros PWAs.

### 2.6 `/painel-tv-admin/config` — Configuração do Painel TV [não aberto]

- **Perguntas a responder:** tempo de rotação, tema, mídias, som de chamada, quais
  setores, grupos de produto ou pedidos entram; se a ordem dos grupos vem do campo
  "Ordem" do grupo de produto.

## 3. Fluxos de ponta a ponta

1. **Venda → BI** [afirmado pelo manual; BI visto]: a venda (balcão, PDV, canais)
   baixa o estoque e gera o título a receber; o resultado aparece no BI como
   faturamento, ticket médio e top produtos.
2. **Do BI para a ação** [visto]: cada indicador ou ponto do radar leva à tela de
   trabalho: "Cobrar" → contas a receber; "Faturar" → faturamento de orçamentos;
   faturamento → lista de vendas confirmadas (`/vendas?status=1`); estoque mínimo →
   Central de Relatórios (genérico).
3. **Painel TV:** não observado. Caminho a confirmar: grupos e produtos do catálogo
   único → configuração do painel → link aberto numa TV.

## 4. Entidades e relações

| Entidade | Campos (vistos ou deduzidos) | Relações |
|---|---|---|
| Indicador do BI [visto] | período (7d/30d/90d/12m), valor, comparação com o período anterior, link de ação | lê vendas (status 1), orçamentos (status 0), contas a receber e a pagar, estoque, pedidos da loja e do app, ponto |
| Ponto de atenção (radar) [visto] | descrição, valor, link | mesmo conjunto de dados do BI |
| Módulo de menu [visto] | chave, seção, itens, fixado | 27 módulos; o Painel TV e o BI são módulos |
| Grupo de produto [visto noutra tela] | descrição, comissão %, ordem, ativo | compartilhado por loja, cardápio, painel TV e cadastros |

## 5. Integrações

- **Chart.js** nos gráficos do BI [afirmado pelo manual].
- **Dados internos:** vendas, financeiro, estoque, canais (loja e app) e ponto
  eletrônico alimentam o BI [visto pelos indicadores].
- **Notificações por consulta periódica** em todas as telas, inclusive no BI
  [código].
- **Painel TV:** forma de ligação à TV desconhecida.

## 6. Oportunidades de UX

- **Vale copiar:** o "Radar — pontos de atenção" com link direto para agir
  (cobrar, faturar, pagar) e os indicadores clicáveis que levam à lista filtrada
  [visto].
- **Confuso:**
  - o manual promete filtro por empresa, que não existe [visto];
  - o ponto "estoque abaixo do mínimo" leva à Central de Relatórios genérica, e não
    ao relatório certo [visto];
  - o BI junta numa tela só vendas, financeiro, estoque, canais e RH (horas extras),
    o que é muito para quem só usa parte dos módulos [deduzido];
  - os hubs intermediários (`/dashboard/modulo/...`) acrescentam um clique antes de
    cada tela; a busca Ctrl+K com favoritos compensa e vale copiar [visto];
  - o Painel TV não tem ajuda no manual [visto];
  - a moldura é pesada: cada tela carrega as janelas de notificação de todos os
    canais (loja, cardápio, OS, Mercado Livre, WhatsApp IA) e consulta o servidor
    por cada um, mesmo sem o módulo em uso [visto].
- **[proposta]** Moldura e notificações só dos módulos contratados, num canal único
  de eventos (SSE ou WebSocket) em vez de várias consultas periódicas.
- **[proposta]** BI montado só com os módulos contratados, com filtro de
  filial e comparação com o período anterior; ponto de atenção sempre com link
  para a lista exata.

## 7. Pendências

- **`/dashboard`:** a abertura foi recusada pela trava do modo automático do
  Claude Code (motivo "Third-Party Attack"). Não foi problema de credencial: a
  sessão já estava aberta e nem chegou a ser usada. Antes disso, o pedido de aba
  nova falhou (o painel do navegador tinha 9 abas; o aviso incluía "limite de abas
  atingido" entre as causas possíveis). Não houve nova tentativa por outro caminho.
  Nada foi clicado ou gravado. Completar depende de o dono da conta autorizar a
  leitura.
- **Não abertas:** `/dashboard/modulo/bi`, `/dashboard/modulo/painel-tv`,
  `/painel-tv-admin/link` e `/painel-tv-admin/config` (perguntas nas seções 2.1 a
  2.6).
- **No BI, não clicados:** "Atualizar dados" e "Imprimir painel". Não se sabe o
  que a impressão gera.
- **BI com dados:** a conta não tem movimento, por isso não se viu nenhum valor,
  nem a comparação com o período anterior em funcionamento.
- **Confirmar** se "Painel de Preços" (plano) e "Painel TV" (menu) são o mesmo
  módulo.

## 8. Sub-rotas descobertas

| Rota | Origem | Situação |
|---|---|---|
| `/bi?periodo=7d`, `30d`, `90d`, `12m` | links de período do BI | lida (30d) |
| `/vendas?status=1` | indicadores Faturamento e Qtd. de vendas | não aberta (ver 02) |
| `/financeiro/faturamento` | "Faturar" (orçamentos pendentes) | lida noutra passagem (ver 02) |
| `/financeiro/receber`, `/financeiro/pagar` | indicadores do BI | ver 11 |
| `/erp/notificacoes/{canal}/poll` | moldura de todas as telas | visto no código |
