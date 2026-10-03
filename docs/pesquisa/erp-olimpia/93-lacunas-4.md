# ERP Olímpia: telas que faltavam explorar (lote 4)

> Exploração **só de leitura** feita em 2026-10-03 na conta de teste "Boi Criolo"
> (plano Full), já logada no navegador embutido. Nada foi gravado, alterado,
> enviado ou apagado. Usei uma aba própria e fechei no fim.
>
> Legenda: **[visto]** = observado na tela; **[inferido]** = conclusão minha a
> partir do que foi visto, ainda não confirmada.

## Resumo da execução

| Rota | Resultado |
| --- | --- |
| `/delivery-admin/configuracao` | visitada (formulário completo lido) |
| `/delivery/app` | **não aberta**: navegação negada pelo sistema de permissões do Claude Code |
| `/dashboard/modulo/loja` | visitada |
| `/loja-admin/pedidos` | visitada (lista vazia) |
| `/loja-admin/link` | visitada |
| `/loja/app` | **não aberta**: navegação negada pelo sistema de permissões do Claude Code |
| `/produto-grupos` | visitada (lista vazia; formulário "Novo" negado) |
| `/produto-sub-grupos` | visitada (lista vazia) |
| `/loja-admin/config` | visitada (formulário completo lido) |
| `/loja-admin/cupons` | visitada (formulário inline lido; lista vazia) |
| `/loja-admin/avaliacoes` | visitada (lista vazia) |
| `/dashboard/modulo/mercado_livre` | visitada |

O bloqueio **não teve nada a ver com login ou credencial**: a sessão estava ativa e
10 das 12 telas abriram normalmente. Quem bloqueou foi o classificador do modo
automático do Claude Code (motivo informado: "Third-Party Attack"). Ele negou
também: abrir `/produto-grupos/create`, abrir `/integracoes/mercado-livre/pedidos`,
mudar o filtro de status numa lista e ler o HTML da página via JavaScript. Detalhes
em [Pendências](#pendências).

---

## Visão geral do módulo

Este lote cobre três "canais digitais" do ERP e os cadastros que eles compartilham:

1. **Loja Virtual** (e-commerce próprio, estilo marketplace): hub
   `/dashboard/modulo/loja` com 4 blocos (Pedidos, Vitrine & Acesso, Catálogo,
   Configurações). A loja vive no domínio do ERP com um endereço amigável por
   empresa (`/loja/v/{slug}`), tem versão PWA instalável e uma API REST v1 pública.
2. **Delivery Próprio**: configuração do cálculo de frete (por km ou por bairro),
   pedidos, entregadores e um PWA do entregador. A configuração de frete é
   **reaproveitada pela Loja Virtual** (a tela da loja mostra o mesmo bloco e diz
   isso).
3. **Mercado Livre**: hub `/dashboard/modulo/mercado_livre` com vendas, anúncios
   vinculados, produtos, conexão/parâmetros e documentação. Vendas do ML entram no
   ERP como vendas com número próprio e o número do pedido ML.

**Cadastros compartilhados [visto no menu]:** "Grupos de Produto" aparece no menu da
Loja Virtual, do Cardápio Digital, do Painel TV e de Cadastros. "Produtos" (o mesmo
`/produtos`) aparece como "Produtos na Loja", "Produtos no Cardápio" e "Produtos"
(ML). Ou seja: **um catálogo único**, com todos os canais usando o mesmo cadastro.

**Origem do sistema [visto]:** as telas de grupos e subgrupos dizem ser
"equivalentes" a formulários com nomes do tipo `FrmProduto_Grupo` e
`FrmProduto_Sub_Grupo`. Isso indica que o ERP web é uma migração tela-a-tela de um
sistema desktop antigo (padrão de nomes de formulário típico de Delphi).

**Stack aparente [visto no HTML das primeiras telas]:** formulários com token CSRF e
`_method=PUT` (padrão Laravel/Blade), Bootstrap 5 com Bootstrap Icons,
confirmações em modal próprio (estilo SweetAlert) em vez do `confirm` do navegador.

---

## Camada transversal (aparece em todas as telas)

Útil para entender o "esqueleto" que todas as telas deste lote usam.

- **Menu lateral** com seções fixas: "Fixados", "Atalhos rápidos" (Operação do dia,
  Cadastros frequentes, Canais digitais, Pessoas) e o menu completo por módulo. Cada
  módulo pode ser **fixado** ("Fixar loja", "Fixar mercado_livre", ...). O menu pode
  ficar preso aberto (preferência guardada no navegador).
- **Hubs de módulo** (`/dashboard/modulo/{modulo}`): página de "cards" agrupados
  por tema. Cada card tem um botão "Adicionar aos atalhos" (não clicado).
- **Busca rápida (Ctrl+K)**: procura telas, módulos e atalhos; permite favoritar.
- **Centro de notificações (sino)** com 4 seções, cada uma com "Marcar lidas" e um
  link: Loja virtual (vendas online), Cardápio digital (painel cozinha), Ordem de
  serviço e Mercado Livre. O contador do sino soma as seções.
- **Pop-ups de evento** (modais): "Nova venda — Loja virtual" (cliente, data/hora,
  nº da venda com 6 dígitos, total, botão "Ver pedido"); "Nova venda — Mercado
  Livre" (igual + nº do pedido ML); "Cardápio digital" (chamado do salão: mesa,
  data/hora, detalhes); "Assinatura de OS"; "Novo pedido WhatsApp" registrado por um
  "Agente de Vendas IA" (tipo orçamento/venda, cliente, WhatsApp, total, botão de
  confirmar recebimento). Há ainda avisos tipo "toast" para NF-e a manifestar e
  boletos liquidados automaticamente.
- **Como as notificações chegam [visto no script]:** consulta periódica ao servidor
  (polling; cerca de 20 s para a loja, 30 s para boletos), com endpoints por canal
  (`/erp/notificacoes/{canal}/poll`, marcar uma como lida, marcar todas). Fechar o
  pop-up da loja marca a notificação como lida.
- **Modal genérico de pesquisa (lookup)**: busca por código ou descrição, tabela
  paginada, seleção múltipla ("Adicionar selecionados") e "Cadastrar novo", que abre
  um "Cadastro rápido" que já devolve o registro selecionado.
- **Maiúsculas automáticas [visto no script]:** os campos de texto são convertidos
  para MAIÚSCULAS, exceto e-mail, URL, senha, número, data e chaves de integração.
  Por isso o nome da loja aparece como "LOJA VIRTUAL".
- **Outros:** seletor de tema visual com paletas nomeadas, assistente de IA em chat,
  menu do usuário (usuário, colaborador, grupo, empresa, sair), barra inferior
  no celular (Início, Buscar, Menu, Novidades).

---

## Telas

### 1. Configuração de entrega do Delivery — `/delivery-admin/configuracao`

**Objetivo [visto]:** definir como o Delivery Próprio calcula o frete **desta
empresa**. Link "Voltar para o delivery" leva a `/delivery-admin`.

**Formulário** (um só formulário; gravação por PUT na mesma URL):

| Campo | Tipo | Obrigatório | Opções / regras |
| --- | --- | --- | --- |
| Calcular entrega por (`modo`) | select | sim | `km` = Quilômetro (valor por km) · `bairro` = Bairro (valor fixo por bairro). Ajuda: só uma forma vale para os **novos** pedidos |
| Valor por km | número (R$) | não | mínimo 0, passo 0,01. Atual: 0,00 |
| Valor mínimo da entrega | número (R$) | não | mínimo 0, passo 0,01. Atual: 0,00 |
| Frete grátis acima de | número (R$) | não | mínimo 0, passo 0,01; zero desliga. Atual: 0,00 |
| Bairros (tabela) | linhas repetíveis | não | cada linha: **Nome do bairro** (texto, até 100 caracteres) + **Valor da entrega** (número ≥ 0, passo 0,01) + botão remover. Botão "Adicionar bairro" cria linha nova |

Botão "Salvar configuração" (não clicado).

**Regras e comportamento:**

- [visto] Trocar o select só alterna qual cartão aparece ("Cobrança por
  quilômetro" ou "Cobrança por bairro"); nada é gravado até salvar.
- [visto] Os campos "valor mínimo" e "frete grátis acima de" só existem no cartão
  do modo km. No modo bairro só há nome + valor fixo.
- [visto] A busca do bairro do cliente na tabela **ignora maiúsculas e minúsculas**
  (texto de ajuda da tela). Nada indica tratamento de acentos ou erros de digitação.
- [visto] A lista de bairros começa vazia, com uma mensagem pedindo para adicionar.
- [inferido] Modo km: frete = distância × valor por km, nunca abaixo do valor
  mínimo; zera quando o pedido passa do limite de frete grátis.
- [inferido] Bairro não encontrado: comportamento desconhecido (bloqueia o pedido?
  cobra zero?).
- **Não há nesta tela:** endereço de origem, raio máximo de entrega, faixas de km,
  taxa por CEP, tempo estimado, horários, simulador de frete. A distância deve vir
  do endereço da empresa e de algum serviço de mapas (não visto).

### 2. PWA do entregador — `/delivery/app`

**Não aberta.** A navegação foi negada pelo sistema de permissões. No menu aparece
como "PWA Entregador", ao lado de "Dashboard", "Pedidos Delivery", "Entregadores" e
"Configuração de entrega". Ver pendências.

### 3. Hub da Loja Virtual — `/dashboard/modulo/loja`

**Objetivo [visto]:** porta de entrada do módulo "Gestão Loja Virtual", com "Voltar
ao dashboard".

| Bloco | Card | Destino |
| --- | --- | --- |
| Pedidos | Vendas Online | `/loja-admin/pedidos` |
| Vitrine & Acesso | Abrir Loja | `/loja-admin/link` |
| Vitrine & Acesso | PWA Loja | `/loja/app` |
| Catálogo | Produtos na Loja | `/produtos` |
| Catálogo | Grupos de Produto | `/produto-grupos` |
| Catálogo | Subgrupos | `/produto-sub-grupos` |
| Configurações | Configurações Gerais | `/loja-admin/config` |
| Configurações | Cupons de Desconto | `/loja-admin/cupons` |
| Configurações | Avaliações | `/loja-admin/avaliacoes` |

Cada card tem "Adicionar aos atalhos". O menu lateral repete exatamente a mesma
estrutura (Canais Digitais > Loja Virtual).

### 4. Vendas Online — `/loja-admin/pedidos`

**Objetivo [visto]:** acompanhar os pedidos feitos na loja virtual.

**Filtros** (pesquisa por GET, não grava nada):

| Filtro | Tipo | Opções |
| --- | --- | --- |
| Buscar (`q`) | texto | nº do pedido ou nome do cliente |
| Status do pedido (`status`) | select | Todos · `pendente` = Aguardando confirmação · `saiu_entrega` = Saiu para entrega · `entregue` = Entregue · `cancelado` = Cancelado |

Botão "Filtrar".

**Lista:** cartão "Pedidos da loja virtual" com contador (0). Colunas: Pedido,
Data, Cliente, Total, Status pedido, **Pagamento**, Ações. Estado atual: nenhum
pedido, por isso não foi possível ver as ações de cada linha nem o detalhe.

**Regras e comportamento:**

- [visto] O estado do pedido e o estado do pagamento são colunas separadas.
- [inferido] Ciclo do pedido: Aguardando confirmação → Saiu para entrega →
  Entregue, com Cancelado como saída. Não há estado "em preparo", "pronto" nem
  "retirada no local". "Aguardando confirmação" sugere que o lojista aceita o
  pedido manualmente.
- [visto] Cada pedido novo gera notificação: pop-up "Nova venda — Loja virtual"
  com nº da **venda** e item na seção "Loja virtual" do sino.
- [inferido] O pedido online é gravado como uma **venda** do ERP (usa `id_venda`),
  ou seja, entra na mesma tabela de vendas do balcão/PDV, com efeito em estoque e
  financeiro.
- [visto no menu] Existe o relatório "Pedidos loja virtual"
  (`/relatorios/loja-pedidos`) em Relatórios > Fiscal e canais.

### 5. Link da Loja Virtual — `/loja-admin/link`

**Objetivo [visto]:** mostrar e copiar os endereços públicos da loja.

- Aviso: a loja usa o domínio compartilhado do ERP com um caminho amigável por empresa
  (aqui o slug é `boi-criolo`, derivado do nome da empresa).
- Três itens, cada um com campo só de leitura + botão "Copiar":
  - **Vitrine** (página principal da loja): `/loja/v/boi-criolo`, com botão "Abrir"
    (nova aba).
  - **PWA** (aplicativo web instalável): `/loja/v/boi-criolo/app`, com "Abrir".
  - **API** (REST v1 para apps e parceiros): `/api/loja/v1/v/boi-criolo`, só copiar.
- **Não há:** domínio próprio, edição do slug, QR code, botão de compartilhar no
  WhatsApp. (O Cardápio Digital tem uma tela "Links e QR Codes"; a loja não.)

### 6. PWA da loja — `/loja/app`

**Não aberta.** Navegação negada pelo sistema de permissões. No menu: "PWA Loja".
Pelo `/loja-admin/link`, o PWA público da empresa fica em `/loja/v/{slug}/app`.

### 7. Grupos de Produto — `/produto-grupos`

**Objetivo [visto]:** consultar e cadastrar grupos de produto (classificação
compartilhada por todos os canais).

**Filtros** (GET):

| Filtro | Tipo | Opções |
| --- | --- | --- |
| Parâmetro | select | Descrição · ID |
| Valor | texto | valor a procurar |
| Status | select | Todos · Ativo (padrão) · Inativo |
| Ordem | select | Descrição · ID · Ordem |

Botões "Pesquisar" e "Limpar filtros"; botão "Novo" leva a `/produto-grupos/create`.

**Lista:** colunas ID, Descrição, **Comissão %**, **Ordem**, Status, Ações. Com o
filtro padrão (Ativo) não há nenhum registro.

**Regras e comportamento:**

- [visto] O grupo tem **percentual de comissão**: a comissão do vendedor pode ser
  definida por grupo de produto.
- [visto] O grupo tem campo **Ordem**. [inferido] Serve para ordenar as categorias
  na vitrine, no cardápio e no painel TV.
- [visto] Ativo/Inativo em vez de apagar; a lista abre só com os ativos.
- **Formulário "Novo": não lido** (abertura negada pelo sistema de permissões).

### 8. Subgrupos de Produto — `/produto-sub-grupos`

**Objetivo [visto]:** consultar e cadastrar subgrupos de produto.

**Filtros** (GET; parâmetros `parametro`, `valor`, `status`, `ordem`):
Parâmetro (Descrição · ID), Valor (texto), Status (Todos · Ativo [padrão] ·
Inativo), Ordem (Descrição · ID). Botões "Pesquisar", "Limpar filtros" e "Novo"
(`/produto-sub-grupos/create`).

**Lista:** colunas ID, **Foto**, Descrição, Status, Ações. Nenhum subgrupo ativo.

**Regras e comportamento:**

- [visto] O subgrupo tem **foto**. [inferido] É a imagem da categoria na vitrine ou
  no cardápio.
- [visto] A lista **não mostra o grupo pai**. Não dá para afirmar se o subgrupo
  pertence a um grupo ou se é uma segunda classificação independente.
- Formulário "Novo": não aberto (mesmo tipo de ação negada nos grupos).

### 9. Configuração da Loja Virtual — `/loja-admin/config`

**Objetivo [visto]:** aparência da loja (inspirada em marketplaces), cores, frete e
banners da vitrine.

**Formulário** (uma página longa, um botão de gravar no fim):

| Seção | Campo | Tipo | Valor atual / regras |
| --- | --- | --- | --- |
| Identidade | Nome da loja | texto | "LOJA VIRTUAL" (em maiúsculas por causa da regra global) |
| Identidade | Empresa / filial da loja | lookup (lupa + limpar) | "BOI CRIOLO". A loja fica vinculada a uma empresa/filial |
| Identidade | Texto de boas-vindas | texto longo | aparece na home **quando não há banner** |
| Identidade | Meta title | texto | SEO |
| Identidade | Loja ativa | caixa de seleção | marcada |
| Identidade | Meta description | texto longo | SEO |
| Cores do tema | Cor primária (topo e botões) | seletor de cor + campo hex | #1e3a5f (azul escuro) |
| Cores do tema | Cor secundária (destaques) | seletor + hex | #ffe600 (amarelo) |
| Cores do tema | Cor de destaque (ofertas e frete) | seletor + hex | #00a650 (verde) |
| Cores do tema | Cor de fundo da página | seletor + hex | #f4f6f9 (cinza claro) |
| Frete e entrega | Calcular entrega por | select | Quilômetro · Bairro (as mesmas opções do Delivery) |
| Frete e entrega | Valor por km / Valor mínimo / Frete grátis acima de | número (R$) | 0,00 / 0,00 / 0,00; zero desliga o frete grátis |
| Banner principal (carrossel) | Slides 1, 2 e 3 | cada um: imagem (arquivo), título (opcional), link (opcional, URL) | até 3; tamanho recomendado 1200×400 px |
| Banners promocionais | Banners 1 e 2 | cada um: imagem (arquivo), título, link (URL) | até 2, abaixo do carrossel; recomendado 600×200 px |

Botões: "Salvar configurações" (não clicado) e "Abrir vitrine" (`/loja/v/boi-criolo`).

**Regras e comportamento:**

- [visto] A seção de frete diz para usar a mesma configuração do Delivery Próprio,
  e os valores mostrados são os mesmos da tela 1. [inferido] É o mesmo registro
  guardado (gravar numa tela muda a outra). Não confirmado.
- [visto] Cores padrão parecidas com as do Mercado Livre (a própria tela diz que se
  inspira em marketplaces).
- **Não há nesta tela:** logotipo/favicon (talvez venha do cadastro da empresa),
  horário de funcionamento, pedido mínimo, formas de pagamento, WhatsApp/contato,
  retirada no local, políticas (troca, privacidade), redes sociais, pixel de
  anúncios, pré-visualização das cores.

### 10. Cupons — `/loja-admin/cupons`

**Objetivo [visto]:** criar e listar cupons de desconto da loja virtual.

**Formulário "Novo cupom"** (cartão à esquerda, na própria página):

| Campo | Tipo | Opções / regras |
| --- | --- | --- |
| Código | texto | exemplo no placeholder em maiúsculas (estilo "VERAO2026") |
| Tipo | select | `percentual` = Percentual (%) · `fixo` = Valor fixo (R$) |
| Valor | número | percentual ou reais, conforme o tipo |
| Validade até | data | data final |

Botão "Criar cupom" (não clicado).

**Lista "Cupons cadastrados"** (cartão à direita, contador 0): colunas Código, Tipo,
Valor, Validade, Status. Nenhum cupom; não deu para ver se há editar/desativar por
linha.

**Regras e comportamento:**

- [inferido] O Status vem da validade (ativo/expirado) ou de um interruptor.
- **Não há:** data de início, pedido mínimo, limite de usos (total e por cliente),
  restrição a produtos/grupos, primeira compra, cupom de frete grátis, regra de
  acumular com outras promoções.

### 11. Avaliações — `/loja-admin/avaliacoes`

**Objetivo [visto]:** moderar avaliações de produtos feitas pelos clientes.

**Lista "Pendentes de moderação"** (contador 0): colunas Data, Produto, Cliente,
Nota, Comentário, Ações. Sem filtros, sem abas.

**Regras e comportamento:**

- [visto] Só aparecem as **pendentes**. Não há histórico de aprovadas ou rejeitadas.
- [inferido] A avaliação só aparece na vitrine depois de aprovada; as ações devem
  ser aprovar/rejeitar. Não se sabe se só quem comprou pode avaliar, nem se o
  lojista pode responder.

### 12. Hub do Mercado Livre — `/dashboard/modulo/mercado_livre`

**Objetivo [visto]:** porta de entrada da integração com o Mercado Livre.

| Bloco | Card | Destino |
| --- | --- | --- |
| Pedidos | Vendas Mercado Livre | `/integracoes/mercado-livre/pedidos` |
| Catálogo | Anúncios vinculados | `/integracoes/mercado-livre/anuncios` |
| Catálogo | Produtos | `/produtos` (catálogo geral) |
| Configurações | Conexão e parâmetros | `/integracoes/mercado-livre/config` |
| Configurações | Documentação | `/integracoes/mercado-livre/documentacao` |

**Regras e comportamento:**

- [visto] O hub **não mostra** se a conta ML está conectada, nem a última
  sincronização, nem erros.
- [visto] Venda nova do ML gera pop-up com cliente, **nº do pedido ML**, data/hora,
  **nº da venda** no ERP e total, e um item na seção "Mercado Livre" do sino.
  [inferido] O pedido ML é importado como venda do ERP, vinculado ao id do pedido ML.
- [inferido] "Anúncios vinculados" associa cada anúncio do ML a um produto do ERP (para
  estoque e preço).
- [visto no menu] Relatórios "Pedidos Mercado Livre" (`/relatorios/ml-pedidos`) e
  "Anúncios ML" (`/relatorios/ml-anuncios`).
- Sub-telas: a abertura de "Vendas Mercado Livre" foi negada; as outras não foram
  tentadas (ver pendências).

---

## Fluxos de ponta a ponta

1. **Montar a loja** [visto + inferido]: Configurações gerais (nome, empresa,
   textos SEO, cores, banners, frete) → catálogo (grupos com ordem e comissão,
   subgrupos com foto, produtos do cadastro geral) → cupons → "Abrir Loja" para
   copiar o link da vitrine/PWA e divulgar → marcar "Loja ativa".
2. **Pedido na loja** [inferido, salvo o indicado]: cliente entra na vitrine ou no
   PWA → escolhe produtos → frete calculado pela regra da empresa (km com mínimo e
   frete grátis, ou valor fixo por bairro) → aplica cupom → finaliza → o ERP grava
   uma **venda** → [visto] pop-up "Nova venda — Loja virtual" + sino → lojista abre
   "Vendas Online" → confirma → "Saiu para entrega" → "Entregue" (ou "Cancelado").
   O pagamento tem estado próprio. A relação com os entregadores do Delivery não foi
   vista.
3. **Avaliação**: cliente avalia um produto → fica "pendente de moderação" → o
   lojista decide em "Avaliações" → [inferido] a aprovada aparece na vitrine.
4. **Mercado Livre** [inferido a partir do hub e das notificações]: conectar a conta
   (Conexão e parâmetros) → vincular anúncios a produtos → as vendas do ML chegam e
   viram vendas do ERP com o nº do pedido ML → notificação → tratar em "Vendas
   Mercado Livre" → relatórios de pedidos e anúncios.
5. **Delivery Próprio** [parcial]: configurar o frete (tela 1) → pedidos e
   entregadores (`/delivery-admin/...`, fora deste lote) → PWA do entregador (não
   aberto).

---

## Entidades e relações

| Entidade | Campos observados | Relações |
| --- | --- | --- |
| Empresa / filial | nome, slug da loja | 1–1 Configuração da loja; 1–1 Configuração de entrega |
| Configuração da loja | nome, empresa, boas-vindas, meta title, meta description, ativa, 4 cores | pertence à empresa; tem banners |
| Banner da loja | tipo (carrossel ou promocional), posição (1–3 ou 1–2), imagem, título, link | pertence à configuração da loja |
| Configuração de entrega | modo (km ou bairro), valor por km, valor mínimo, frete grátis acima de | pertence à empresa; usada pelo Delivery **e** pela Loja |
| Bairro de entrega | nome (até 100), valor fixo | N para 1 com a configuração de entrega |
| Cupom | código, tipo (percentual ou fixo), valor, validade até, status | da loja da empresa; [inferido] aplicado ao pedido |
| Pedido da loja = Venda | nº, data, cliente, total, status do pedido (pendente, saiu_entrega, entregue, cancelado), status do pagamento | cliente = Pessoa; [inferido] itens = produtos; pode ter cupom e frete |
| Avaliação de produto | data, produto, cliente, nota, comentário, estado de moderação | produto 1–N avaliações; cliente 1–N avaliações |
| Grupo de produto | id, descrição, comissão %, ordem, ativo | [inferido] 1–N produtos; compartilhado por loja, cardápio, painel TV |
| Subgrupo de produto | id, foto, descrição, ativo | relação com o grupo não confirmada |
| Produto | (não visto neste lote) | catálogo único para loja, cardápio e ML |
| Notificação de canal | canal, título, cliente, venda, total, data/hora, lida | aponta para a venda/pedido |
| Conexão Mercado Livre | conta, parâmetros (não vistos) | anúncios ML ↔ produtos; pedido ML (id) ↔ venda |

---

## Integrações

- **Mercado Livre**: conta conectada por "Conexão e parâmetros" (provavelmente OAuth),
  importação de pedidos, anúncios vinculados a produtos, notificações de venda.
- **Serviço de mapas/distância** [pressuposto]: necessário para o frete por km;
  nenhuma chave nem endereço de origem aparece nas telas vistas.
- **PWA**: loja (cliente final) e entregador são aplicações web instaláveis.
- **API REST v1 pública da loja** (`/api/loja/v1/v/{slug}`) para apps e parceiros.
- **Pagamento online** [indício]: a coluna "Pagamento" nos pedidos e o módulo
  "Cobrança > Gateways" no menu sugerem cobrança online; a integração não foi vista.
- **WhatsApp com "Agente de Vendas IA"** (transversal): pedidos e orçamentos
  registrados pelo agente aparecem como notificação para confirmar recebimento.
- **SEO** básico (meta title e meta description).

---

## Observações de UX (oportunidades para nós)

1. **Frete configurado em dois lugares** (Delivery e Loja) com os mesmos dados.
   Confunde. Melhor: uma única tela "Área de entrega e taxas" usada por todos os
   canais, com exceções por canal só se fizer falta.
2. **Bairro escrito à mão**, comparado apenas ignorando maiúsculas e minúsculas:
   frágil com acentos, abreviações e erros de digitação. Melhor: lista de bairros da cidade, faixas de
   CEP ou desenho da área no mapa, com **simulador de frete** na própria tela.
3. **Modo km sem raio máximo nem faixas**, e mínimo/frete grátis só no modo km.
   Melhor: faixas de distância, raio máximo, pedido mínimo e frete grátis válidos
   para qualquer modo.
4. **Ciclo de pedido curto demais**: sem "em preparo", "pronto" nem "retirada no
   local". Para comida isso faz falta. Melhor: estados configuráveis por tipo de
   entrega, com histórico de quem mudou e quando.
5. **Cupom muito básico** (sem mínimo, limite de uso, início, alcance). Melhor:
   regras completas, mas escondidas atrás de "opções avançadas" para não assustar.
6. **Avaliações só pendentes**, sem histórico nem resposta ao cliente. Melhor:
   abas (pendentes, publicadas, rejeitadas), resposta pública e filtro por nota.
7. **Listas com 4 controles para filtrar** (parâmetro, valor, status, ordem) e
   filtro padrão "Ativo" que esconde o resto. Melhor: uma caixa de busca única,
   ordenação clicando no cabeçalho e um seletor de status visível.
8. **Nomes internos à mostra** ("equivalente a FrmProduto_Grupo"): ruído para o
   usuário. Não repetir.
9. **Hubs que repetem o menu**: um clique a mais entre o menu e a tela. Melhor: o
   hub com números úteis (pedidos de hoje, pendentes, faturamento do canal) em vez
   de só cards.
10. **Tudo em MAIÚSCULAS**: numa loja pública isso fica feio ("LOJA VIRTUAL").
    Melhor: guardar o texto como foi escrito.
11. **Configuração da loja numa página comprida**, sem logotipo, horário, pagamento
    ou contato, e sem pré-visualização. Melhor: assistente em passos com
    pré-visualização ao vivo da vitrine.
12. **Página de link pobre**: sem QR code, domínio próprio, edição do endereço ou
    botão de compartilhar no WhatsApp.
13. **Notificações por polling e pop-ups que interrompem** (vários canais podem
    abrir modais em fila). Melhor: tempo real, avisos discretos com som
    configurável e um painel único de pedidos de todos os canais.
14. **Mercado Livre sem estado visível**: o hub não diz se a conta está conectada nem
    se a sincronização falhou. Melhor: cartão de saúde da integração (conectada,
    última sincronização, erros).

---

## Pendências

1. **`/delivery/app` e `/loja/app` não foram abertas.** O classificador do modo
   automático do Claude Code negou a navegação (motivo: "Third-Party Attack"). Não
   tem relação com login: a sessão estava ativa e as outras telas abriram.
2. **Formulário "Novo" dos grupos (`/produto-grupos/create`) foi negado** pelo
   mesmo classificador. Por isso não tentei o "Novo" dos subgrupos. Os campos dos
   dois formulários continuam desconhecidos (por exemplo: o subgrupo tem grupo pai?).
3. **Mudar o filtro de status para "Todos"** (grupos/subgrupos) foi negado. Só
   foram vistos os ativos, e não há nenhum.
4. **Leitura do HTML via JavaScript foi negada** a partir da tela de grupos. Os
   nomes técnicos dos campos só foram lidos nas primeiras telas (configuração de
   entrega e pedidos).
5. **Sub-telas do Mercado Livre**: `/integracoes/mercado-livre/pedidos` foi negada;
   `anuncios`, `config` e `documentacao` não foram tentadas (mesmo tipo de ação).
6. **Vitrine pública, PWA da empresa e API** (`/loja/v/boi-criolo`,
   `/loja/v/boi-criolo/app`, `/api/loja/v1/v/boi-criolo`) não foram abertas: são do
   mesmo tipo das rotas `/app` negadas.
7. **Sem dados na conta de teste**: nenhum pedido, cupom, avaliação, grupo ou
   subgrupo ativo. Faltam ver: ações por linha, detalhe do pedido, mudanças de
   estado, valores possíveis da coluna "Pagamento".
8. **Perguntas em aberto**: como a distância é calculada (origem, serviço de
   mapas); se o frete grátis vale no modo bairro; o que acontece com bairro não
   cadastrado; se frete da loja e do delivery são o mesmo registro; limites de cupom;
   quem pode avaliar.
9. **Fora deste lote mas relacionadas**: `/delivery-admin`, `/delivery-admin/pedidos`,
   `/delivery-admin/entregadores`, `/relatorios/loja-pedidos`,
   `/relatorios/ml-pedidos`, `/relatorios/ml-anuncios`, `/produtos`.

**Para destravar (decisão do dono da conta):** rodar estas rotas fora do modo
automático e aprovar quando o Claude pedir, ou adicionar nas configurações do Claude
Code uma regra que permita as ferramentas do navegador embutido
(`mcp__Claude_Browser__navigate`, `mcp__Claude_Browser__form_input`,
`mcp__Claude_Browser__javascript_tool`) para `erp.olimpiasistemas.com.br`. Depois é
só repetir as rotas pendentes, com as mesmas regras de só leitura.

## Sub-rotas descobertas

- `/dashboard/modulo/delivery`, `/delivery-admin`, `/delivery-admin/pedidos`,
  `/delivery-admin/entregadores`
- `/loja/v/boi-criolo` (vitrine), `/loja/v/boi-criolo/app` (PWA da empresa),
  `/api/loja/v1/v/boi-criolo` (API REST v1)
- `/produtos`, `/produtos/gerenciamento`
- `/produto-grupos/create`, `/produto-sub-grupos/create`
- `/produto-sub-grupos?parametro=…&valor=…&status=…&ordem=…` (filtro por GET)
- `/integracoes/mercado-livre/pedidos`, `/integracoes/mercado-livre/anuncios`,
  `/integracoes/mercado-livre/config`, `/integracoes/mercado-livre/documentacao`
- `/relatorios/loja-pedidos`, `/relatorios/ml-pedidos`, `/relatorios/ml-anuncios`
- `/erp/notificacoes/{loja|cardapio|os|ml}` (endpoints internos de notificação)
