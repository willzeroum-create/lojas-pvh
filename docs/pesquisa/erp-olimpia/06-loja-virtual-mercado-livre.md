# 06 — Loja virtual e Mercado Livre (ERP Olímpia)

> Cobre a Loja Virtual (hub, pedidos, link, configuração, cupons, avaliações,
> PWA, vitrine pública e API) e a integração com o Mercado Livre (hub, pedidos,
> anúncios, configuração, documentação, OAuth e webhook), além da camada global
> de avisos que estes canais usam. Exploração de 2026-10-03, conta de teste "Boi
> Criolo" (plano Full, perfil ADMIN). Legenda de certeza: [visto], [visto em
> parte], [deduzido], [afirmado pelo manual], [código] (lido no HTML/JS da
> página), [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

Dois "canais digitais" do ERP:

1. **Loja Virtual** (e-commerce próprio, inspirado em marketplaces): hub
   `/dashboard/modulo/loja` ("Gestão Loja Virtual") com 4 blocos (Pedidos,
   Vitrine & Acesso, Catálogo, Configurações). A loja vive no domínio do ERP com
   um endereço amigável por empresa (`/loja/v/{slug}`; na conta de teste o slug é
   `boi-criolo`, derivado do nome da empresa), tem versão PWA instalável e uma
   API REST v1 pública. O frete usa a configuração do Delivery Próprio (ver
   [05-delivery.md](05-delivery.md)).
2. **Mercado Livre**: hub `/dashboard/modulo/mercado_livre` com vendas, anúncios
   vinculados, produtos, conexão/parâmetros e documentação. Vendas do ML entram
   no ERP como vendas confirmadas, com número próprio e o número do pedido ML.

**Onde fica no menu [visto].** Seção **Canais Digitais**: Loja Virtual (9 itens,
a mesma estrutura do hub) e Mercado Livre (5 itens). Cada módulo pode ser fixado
("Fixar loja", "Fixar mercado_livre").

**Catálogo único [visto no menu].** "Produtos" (o mesmo `/produtos`) aparece como
"Produtos na Loja", "Produtos no Cardápio" e "Produtos" (ML); "Grupos de Produto"
aparece no menu da Loja Virtual, do Cardápio Digital, do Painel TV e de
Cadastros. Todos os canais usam o mesmo cadastro. As telas de produtos, grupos
(com comissão % e ordem) e subgrupos (com foto) estão em
[07-produtos.md](07-produtos.md).

**Plano [visto em parte].** O plano Premium (R$ 499,90, 25 módulos) é resumido
como "omnicanal: loja, cardápio, Mercado Livre, delivery, força de vendas,
CT-e/MDF-e". Ver [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md).

**Manual.** Os cartões "Loja Virtual" (`mod-loja`) e "Integração Mercado Livre"
(`mod-mercado_livre`) estão resumidos em [22-manual.md](22-manual.md); os fatos
que afirmam sobre estas telas foram trazidos para cada seção, marcados
[afirmado pelo manual]. A melhor ajuda do ERP é a documentação do ML (seção
2.14), não o manual.

**Relatórios** "Pedidos loja virtual" (`/relatorios/loja-pedidos`), "Pedidos
Mercado Livre" (`/relatorios/ml-pedidos`) e "Anúncios ML"
(`/relatorios/ml-anuncios`), em Relatórios › Fiscal e canais: ver
[21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md).
O BI tem o indicador "Pedidos loja + app" e o gráfico "pedidos por canal" (ver
[01-dashboard-bi-tv.md](01-dashboard-bi-tv.md)).

### 1.1 Origem e tecnologia [visto; deduzido]

A origem Delphi (telas "equivalentes" a formulários `FrmXxx`) e a tecnologia
(Laravel/Blade, Bootstrap 5, SweetAlert2) estão em
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md#11-o-que-estas-telas-revelam-sobre-a-arquitetura-do-sistema). Próprio destes canais: a documentação
do ML cita o comando `php artisan ml:sync-automatico` [afirmado pelo manual].

### 1.2 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/loja` | Gestão Loja Virtual (hub) | lida |
| `/loja-admin/pedidos` | Vendas Online | parcial (lista vazia) |
| `/loja-admin/link` | Abrir Loja (links) | lida |
| `/loja-admin/config` | Configurações Gerais | lida |
| `/loja-admin/cupons` | Cupons de Desconto | lida (lista vazia) |
| `/loja-admin/avaliacoes` | Avaliações | parcial (lista vazia) |
| `/loja/app` → `/loja/v/{slug}/app` | PWA Loja (instalação) | só login (primeira tentativa recusada; aberta numa passagem posterior) |
| `/loja/v/{slug}` | Vitrine pública | lida (vazia) |
| `/api/loja/v1/v/{slug}` | API REST v1 da loja | não aberta |
| `/dashboard/modulo/mercado_livre` | Mercado Livre (hub) | lida |
| `/integracoes/mercado-livre/pedidos` | Vendas Mercado Livre | recusada (duas passagens) |
| `/integracoes/mercado-livre/anuncios` | Anúncios vinculados | não aberta |
| `/integracoes/mercado-livre/config` | Conexão e parâmetros | não aberta |
| `/integracoes/mercado-livre/documentacao` | Documentação | lida (acordeões abertos) |
| `/integracoes/mercado-livre/oauth/callback` | Retorno do OAuth | não aberta (citada na documentação) |
| `/api/webhooks/mercado-livre/{slug}?webhook_token=…` | Webhook por empresa | não aberta (citada na documentação) |

Fora deste documento: `/produtos`, `/produto-grupos`, `/produto-sub-grupos` (ver
[07](07-produtos.md)); relatórios `loja-pedidos`, `ml-pedidos`, `ml-anuncios`
(ver [21](21-relatorios-estoque-compras-fiscal.md)).

### 1.3 Elementos globais vistos de passagem

A moldura comum (menu, hubs, busca Ctrl+K, sino, avisos por sondagem em 7 canais,
maiúsculas automáticas, menu do usuário, assistente) está em
[22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas); a lupa, em
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md#15-janela-de-pesquisa-lupa-e-a-api-por-trás-dela). Próprio da loja e do Mercado
Livre [visto, salvo indicação]:

- **Sino:** seções "Loja virtual" (link para as vendas online) e "Mercado Livre",
  cada uma com "Marcar lidas"; contam no total do sino.
- **Pop-ups de venda nova** (modais):
  - "Nova venda — Loja virtual": cliente, data/hora, nº da venda (6 dígitos),
    total, botão "Ver pedido"; fechar o pop-up marca a notificação como lida;
  - "Nova venda — Mercado Livre": o mesmo + nº do pedido ML.
- **Canais de aviso [código]:** `loja` (consulta a cada cerca de 20 s) e `ml`, este
  com listar (`/erp/notificacoes/ml`) e marcar como lida (POST
  `/erp/notificacoes/ml/{id}/lida`).
- **Maiúsculas automáticas:** por causa da regra global, o nome da loja aparece
  como "LOJA VIRTUAL".

## 2. Telas

### 2.1 `/dashboard/modulo/loja` — Gestão Loja Virtual (hub) [visto]

Porta de entrada do módulo, com "Voltar ao dashboard".

| Bloco | Cartão | Destino |
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

Cada cartão tem "Adicionar aos atalhos". O menu lateral repete exatamente a
mesma estrutura (Canais Digitais › Loja Virtual).

### 2.2 `/loja-admin/pedidos` — Vendas Online [visto em parte]

**Objetivo:** acompanhar os pedidos feitos na loja virtual.

**Filtros** (pesquisa por GET, não grava nada):

| Filtro | Tipo | Opções |
| --- | --- | --- |
| Buscar (`q`) | texto | nº do pedido ou nome do cliente |
| Status do pedido (`status`) | select | Todos · `pendente` = Aguardando confirmação · `saiu_entrega` = Saiu para entrega · `entregue` = Entregue · `cancelado` = Cancelado |

Botão "Filtrar".

**Lista:** cartão "Pedidos da loja virtual" com contador (0). Colunas: Pedido,
Data, Cliente, Total, Status pedido, **Pagamento**, Ações. Sem pedidos na conta:
não foi possível ver as ações de cada linha nem o detalhe.

**Regras e comportamento:**

- [visto] O estado do pedido e o estado do pagamento são colunas separadas.
- [deduzido] Ciclo do pedido: Aguardando confirmação → Saiu para entrega →
  Entregue, com Cancelado como saída. Não há "em preparo", "pronto" nem
  "retirada no local". "Aguardando confirmação" sugere que o lojista aceita o
  pedido manualmente.
- [visto] Cada pedido novo gera o pop-up "Nova venda — Loja virtual" com o nº da
  **venda** e um item na seção "Loja virtual" do sino.
- [deduzido] O pedido online é gravado como uma **venda** do ERP (usa
  `id_venda`), na mesma tabela de vendas do balcão/PDV, com efeito em estoque e
  financeiro. [afirmado pelo manual] "O pedido vira venda sozinho".
- [deduzido, pela descrição do relatório] O pedido guarda o valor do frete e o
  cupom usado.

### 2.3 `/loja-admin/link` — Abrir Loja (links) [visto]

**Objetivo:** mostrar e copiar os endereços públicos da loja.

- Aviso: a loja usa o domínio compartilhado do ERP com um caminho amigável por
  empresa (slug derivado do nome da empresa).
- Três itens, cada um com campo só de leitura + botão "Copiar":
  - **Vitrine** (página principal da loja): `/loja/v/{slug}`, com botão "Abrir"
    (nova aba);
  - **PWA** (aplicativo web instalável): `/loja/v/{slug}/app`, com "Abrir";
  - **API** (REST v1 para apps e parceiros): `/api/loja/v1/v/{slug}`, só copiar.
- **Não há:** domínio próprio, edição do slug, QR code, botão de compartilhar no
  WhatsApp. (O Cardápio Digital tem uma tela "Links e QR Codes"; a loja não.)

### 2.4 `/loja-admin/config` — Configurações Gerais da loja [visto]

**Objetivo:** aparência da loja (a tela diz inspirar-se em marketplaces), cores,
frete e banners da vitrine.

**Formulário** (uma página longa, um botão de gravar no fim):

| Seção | Campo | Tipo | Valor atual / regras |
| --- | --- | --- | --- |
| Identidade | Nome da loja | texto | "LOJA VIRTUAL" (maiúsculas pela regra global) |
| Identidade | Empresa / filial da loja | lookup (lupa + limpar) | "BOI CRIOLO"; a loja fica vinculada a uma empresa/filial |
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
| Banner principal (carrossel) | Slides 1, 2 e 3 | cada um: imagem (arquivo), título (opcional), link (opcional, URL) | até 3; recomendado 1200×400 px |
| Banners promocionais | Banners 1 e 2 | cada um: imagem (arquivo), título, link (URL) | até 2, abaixo do carrossel; recomendado 600×200 px |

Botões: "Salvar configurações" (não clicado) e "Abrir vitrine" (`/loja/v/{slug}`).

**Regras e comportamento:**

- [visto] A seção de frete diz para usar a mesma configuração do Delivery
  Próprio, e os valores mostrados são os mesmos de `/delivery-admin/configuracao`
  (ver [05](05-delivery.md)). [deduzido, não confirmado] É o mesmo registro
  (gravar numa tela muda a outra). [afirmado pelo manual] "Produtos e frete em
  loja-admin" — a confirmar onde o frete realmente se grava.
- [visto] Cores padrão parecidas com as do Mercado Livre.
- **Não há nesta tela:** logotipo/favicon (talvez venha do cadastro da empresa),
  horário de funcionamento, pedido mínimo, formas de pagamento, WhatsApp/contato
  (embora a vitrine tenha botão de WhatsApp, seção 2.8), retirada no local,
  políticas (troca, privacidade), redes sociais, pixel de anúncios,
  pré-visualização das cores.

### 2.5 `/loja-admin/cupons` — Cupons de Desconto [visto]

**Formulário "Novo cupom"** (cartão à esquerda, na própria página):

| Campo | Tipo | Opções / regras |
| --- | --- | --- |
| Código | texto | exemplo no placeholder em maiúsculas (estilo "VERAO2026") |
| Tipo | select | `percentual` = Percentual (%) · `fixo` = Valor fixo (R$) |
| Valor | número | percentual ou reais, conforme o tipo |
| Validade até | data | data final |

Botão "Criar cupom" (não clicado).

**Lista "Cupons cadastrados"** (cartão à direita, contador 0): colunas Código,
Tipo, Valor, Validade, Status. Nenhum cupom; não deu para ver se há
editar/desativar por linha.

- [deduzido] O Status vem da validade (ativo/expirado) ou de um interruptor.
- **Não há:** data de início, pedido mínimo, limite de usos (total e por
  cliente), restrição a produtos/grupos, primeira compra, cupom de frete grátis,
  regra de acumular com outras promoções.

### 2.6 `/loja-admin/avaliacoes` — Avaliações [visto em parte]

**Objetivo:** moderar avaliações de produtos feitas pelos clientes.

**Lista "Pendentes de moderação"** (contador 0): colunas Data, Produto, Cliente,
Nota, Comentário, Ações. Sem filtros, sem abas.

- [visto] Só aparecem as **pendentes**. Não há histórico de aprovadas ou
  rejeitadas.
- [deduzido] A avaliação só aparece na vitrine depois de aprovada; as ações devem
  ser aprovar/rejeitar. Não se sabe se só quem comprou pode avaliar, nem se o
  lojista pode responder.

### 2.7 `/loja/app` → `/loja/v/{slug}/app` — PWA da loja (instalação) [só login]

Na primeira passagem, a navegação para `/loja/app` foi recusada pelo
classificador do modo automático; numa passagem posterior abriu pelo botão
"Abrir módulo" do manual.

- `/loja/app` redireciona para `/loja/v/{slug}/app` [visto].
- Página de instalação: nome da loja, convite para instalar o app ou abrir a
  vitrine, botão "Abrir loja" e a dica de usar "Adicionar à tela inicial" no
  celular [visto].
- [afirmado pelo manual] O cliente compra no PWA `/loja`.

### 2.8 `/loja/v/{slug}` — Vitrine pública [visto]

Aberta pelo botão "Abrir loja". Vitrine vazia (a conta não tem produtos).

- Busca de produtos.
- Links para categorias (`/categorias`), favoritos (`/conta/favoritos`),
  carrinho (`/carrinho`) e login do cliente (`/login`), sufixos do endereço da
  vitrine; não abertos.
- Blocos "Ofertas que você vai amar" (destaques) e "Lançamentos", ambos vazios,
  com instrução ao lojista para marcar produtos em destaque [deduzido: o produto
  tem um sinal de "destaque", ver [07](07-produtos.md)].
- Aviso para configurar banners em Loja Virtual → Configurações.
- Botão flutuante de WhatsApp, que abre `wa.me` com uma mensagem pronta (número
  da empresa omitido aqui; não clicado).
- [deduzido] Os avisos para o lojista aparecem na vitrine pública que o cliente
  final vê.
- [deduzido] O login do cliente é opcional para navegar (a vitrine abriu sem
  login).

### 2.9 `/api/loja/v1/v/{slug}` — API REST v1 da loja [não aberta]

Mostrada em `/loja-admin/link` como "REST v1 para apps e parceiros" (só copiar).
Não foi aberta (mesmo tipo de rota das `/app` recusadas). **Perguntas:**
endpoints (catálogo, pedidos, clientes), autenticação, se é só leitura.

### 2.10 `/dashboard/modulo/mercado_livre` — Mercado Livre (hub) [visto]

| Bloco | Cartão | Destino |
| --- | --- | --- |
| Pedidos | Vendas Mercado Livre | `/integracoes/mercado-livre/pedidos` |
| Catálogo | Anúncios vinculados | `/integracoes/mercado-livre/anuncios` |
| Catálogo | Produtos | `/produtos` (catálogo geral) |
| Configurações | Conexão e parâmetros | `/integracoes/mercado-livre/config` |
| Configurações | Documentação | `/integracoes/mercado-livre/documentacao` |

- [visto] O hub **não mostra** se a conta ML está conectada, nem a última
  sincronização, nem erros (a documentação, sim: seção 2.14).
- [visto] Venda nova do ML gera pop-up com cliente, **nº do pedido ML**,
  data/hora, **nº da venda** no ERP e total, e um item na seção "Mercado Livre" do
  sino.

### 2.11 `/integracoes/mercado-livre/pedidos` — Vendas Mercado Livre [recusada]

Recusada pelo classificador do modo automático em duas passagens. A tela não foi
vista. O que a documentação afirma sobre ela [afirmado pelo manual]:

- Os pedidos chegam sozinhos: webhook do ML (tópico `orders_v2`) e, se o
  webhook falhar, uma rotina a cada 5 min busca os pedidos pagos recentes e
  reprocessa os webhooks pendentes com falha.
- Só entram pedidos **pagos ou confirmados**, sem duplicar (controle pelo ID do
  pedido no ML). Cada um cria uma **venda confirmada** (status de venda "1") com
  o canal "Mercado Livre", o frete e os totais do ML e a observação "Venda
  Mercado Livre #ID".
- O cliente da venda é criado ou atualizado pelo CPF/CNPJ do comprador.
- O estoque baixa pelo mesmo motor das vendas internas.
- **Pedido com item sem vínculo a produto não é importado.**
- NF-e automática (se ativa): a situação aparece em Pedidos ML (emitida / erro /
  ignorado); também há emissão manual na tela do pedido.
- A importação manual de pedidos existe só para testes ou para recuperar um caso
  pontual.
- A venda aparece também no menu Vendas, com o selo do canal.

**Perguntas ainda sem resposta:** colunas e filtros (número, data, comprador,
itens, valor, frete, tarifa do ML, situação do pagamento e do envio); se a nota
volta para o ML; impressão da etiqueta de envio (PDF ou térmica); como aparecem
cancelamento, devolução e reclamação e o que fazem no estoque e no financeiro;
se gera conta a receber (com que data e com a tarifa descontada); valores
aceitos no status ML (o relatório `ml-pedidos` usa texto livre; na API do ML os
status vêm em inglês, como `paid` e `cancelled` [domínio]).

### 2.12 `/integracoes/mercado-livre/anuncios` — Anúncios vinculados [não aberta]

O que a documentação afirma [afirmado pelo manual]:

- Vincular anúncio ↔ produto à mão nesta tela, ou pelo botão "Importar anúncios
  ML", que vincula sozinho quando o SKU bate.
- Ordem de resolução do produto de cada item: (1) a tabela de vínculos (anúncio
  "MLB..." → produto); (2) o SKU do anúncio igual ao "ID integração" ou ao
  código do produto.
- O estoque vai do ERP para o ML: após cada venda (se a opção estiver ligada) e a
  cada 10 min, só para anúncios com sincronização ativa. Botão "Sincronizar
  estoque" força a atualização de todos os anúncios. Envia a quantidade
  disponível do saldo da empresa configurada.
- [deduzido] **O preço não é sincronizado:** o texto só fala da quantidade.

**Perguntas ainda sem resposta:** colunas (código, título, preço, estoque,
situação, tipo de anúncio, produto ligado, status de sincronização); se dá para
publicar um produto do ERP como anúncio novo (categoria, atributos, condição,
fotos, garantia, frete) ou só ligar anúncios que já existem; se a grade (cor ×
tamanho) vira variações; preço próprio para o ML; ações em massa (pausar,
reativar).

### 2.13 `/integracoes/mercado-livre/config` — Conexão e parâmetros [não aberta]

Campos e passos segundo a documentação [afirmado pelo manual]:

- Empresa, Client ID e Client Secret (do aplicativo criado no portal de
  desenvolvedores do ML).
- Operação de venda, operação de estoque, portador e forma de pagamento padrão.
- Vendedor ou usuário padrão (quem aparece como responsável pela venda
  importada).
- "Integração ativa".
- Opções: atualizar o estoque no ML depois de cada venda (recomendado: ligado);
  emitir NF-e sozinho (só com certificado A1 e dados fiscais do cliente
  corretos).
- Conectar a conta (autorização OAuth no ML); salvar e registrar o webhook
  automaticamente (ou conferir a URL no painel do ML).
- Token OAuth com renovação automática pelo refresh token; se expirar,
  reconectar resolve.
- [deduzido] Uma integração por empresa (credenciais ligadas à "Empresa"); não
  há sinal de várias contas do ML por empresa.

**Perguntas ainda sem resposta:** se a tela mostra a situação da ligação
(conectado, último sincronismo, erros); filial, depósito, tabela de preço e série
fiscal usados; se o token do webhook pode ser trocado.

### 2.14 `/integracoes/mercado-livre/documentacao` — Documentação da integração [visto]

Aberta pelo botão "Abrir módulo" do cartão do ML no manual. É o manual próprio da
integração, e a ajuda mais completa do ERP.

**Estrutura da página:**

- **Cabeçalho** com dois botões: "Configuração" (→ `/integracoes/mercado-livre/config`)
  e "Pedidos" (→ `/integracoes/mercado-livre/pedidos`).
- **Faixa "Resumo"** com um selo do estado da ligação: aqui, "Conta não
  conectada" (cinza). A documentação mostra a situação real da conta.
- **7 atalhos de seção** (âncoras `#ml-visao` … `#ml-problemas`): Visão geral,
  Configuração, Produtos e anúncios, Fluxo automático, Funcionalidades, Telas do
  ERP e Solução de problemas.
- **Coluna lateral "Referência rápida":** URL do webhook da empresa, **com o
  token secreto em texto aberto (omitido aqui)**; URL de retorno do OAuth;
  intervalos das rotinas (5 e 10 min); comando de servidor para rodar a
  sincronização à mão (`php artisan ml:sync-automatico`).
- **Coluna lateral "Checklist de go-live":** 6 itens, só visuais (não há caixas
  de marcar de verdade).

**Conteúdo (resumo com palavras nossas) [afirmado pelo manual]:**

1. **Visão geral:** quando o comprador paga no ML, o ERP importa o pedido como
   venda confirmada, baixa o estoque pela mesma regra das vendas internas, avisa
   no sino, devolve o saldo aos anúncios vinculados e, se a opção estiver ativa,
   emite a NF-e. A venda fica marcada com o canal "Mercado Livre".
2. **Configuração:**
   - no portal do ML: criar o aplicativo (produção ou teste) e anotar Client ID
     e Client Secret; cadastrar o endereço de retorno do OAuth (fixo do ERP);
     cadastrar a URL de notificações (própria de cada empresa, com token); ligar
     o tópico de pedidos (`orders_v2`);
   - no ERP (Mercado Livre → Conexão e parâmetros): ver seção 2.13;
   - opções recomendadas: ver seção 2.13.
3. **Vincular produtos e anúncios:** ordem de resolução e formas de vincular,
   ver seção 2.12. Pedido com item sem vínculo não é importado.
4. **Fluxo automático:** com diagrama; ver seção 3, fluxo 4.
5. **Funcionalidades** (4 acordeões, abertos nesta leitura): importação de
   pedidos; baixa e sincronização de estoque; NF-e automática; notificações
   (janela a cada venda nova, seção "Mercado Livre" no sino, link direto para o
   pedido). Detalhes nas seções 2.11 e 2.12.
6. **Telas do ERP:** tabela com Configuração, Pedidos, Anúncios e o menu Vendas
   (onde a venda aparece com o selo do canal).
7. **Solução de problemas:** tabela "problema → o que verificar" com 5 casos:
   pedido não importou; estoque não baixou; o ML não atualizou a quantidade;
   NF-e com erro; token expirado (reconectar resolve; a renovação é automática
   pelo refresh token).

**Regras que só aparecem aqui [afirmado pelo manual]:** status de venda "1" =
venda confirmada; o texto cita pelos nomes internos a tabela de controle de
pedidos do ML e a função de baixa de estoque; cliente criado/atualizado pelo
CPF/CNPJ; rotina de 5 min de recuperação; sincronização de 10 min só para
anúncios com sincronização ativa; importação manual só para testes.

**O que o manual diz do ML [afirmado pelo manual]:** cartão de 5 passos (criar o
app no portal e ligar por OAuth; vincular anúncios a produtos com SKU = código ou
ID de integração; webhook + rotina de 5 min importam os pedidos pagos; estoque
enviado ao ML após cada venda e a cada 10 min; documentação completa no ERP). O
cartão fala num grupo de menu "Integrações", que não existe: a seção real é
"Canais Digitais".

### 2.15 `/integracoes/mercado-livre/oauth/callback` e `/api/webhooks/mercado-livre/{slug}?webhook_token=…` — OAuth e webhook [não abertas]

Endereços citados na documentação (não abertos):

- **Retorno do OAuth:** `/integracoes/mercado-livre/oauth/callback`, fixo do ERP,
  cadastrado no aplicativo do ML.
- **Webhook por empresa:** `/api/webhooks/mercado-livre/{slug}?webhook_token=…`,
  com o slug da empresa e um token secreto na query string (token omitido). O
  ERP pode registrá-lo sozinho ao salvar a configuração.
- [visto] **Falha de segurança:** o token aparece em texto aberto na
  documentação, para qualquer usuário com acesso à tela; sem máscara, botão de
  copiar nem opção de trocar.

## 3. Fluxos de ponta a ponta

1. **Montar a loja** [visto + deduzido]: Configurações gerais (nome, empresa,
   textos SEO, cores, banners, frete) → catálogo (grupos, subgrupos e produtos do
   cadastro geral, ver [07](07-produtos.md); marcar produtos em destaque) → cupons
   → "Abrir Loja" para copiar o link da vitrine/PWA e divulgar → marcar "Loja
   ativa".
2. **Pedido na loja** [deduzido, salvo o indicado]: cliente entra na vitrine ou
   no PWA [vistos] → escolhe produtos → frete calculado pela regra da empresa (km
   com mínimo e frete grátis, ou valor fixo por bairro) → aplica cupom →
   finaliza → o ERP grava uma **venda** ([afirmado pelo manual] "vira venda
   sozinho") → [visto] pop-up "Nova venda — Loja virtual" + sino → lojista abre
   "Vendas Online" → confirma → "Saiu para entrega" → "Entregue" (ou
   "Cancelado"). O pagamento tem estado próprio. A relação com os entregadores do
   Delivery não foi vista.
3. **Avaliação** [deduzido]: cliente avalia um produto → fica "pendente de
   moderação" → o lojista decide em "Avaliações" → a aprovada aparece na vitrine.
4. **Mercado Livre** [afirmado pelo manual, salvo indicação]:
   1. Configuração inicial: criar o app no portal do ML; informar Client ID e
      Secret no ERP; autorizar por OAuth; registrar o webhook.
   2. Vincular anúncios a produtos (à mão ou por SKU).
   3. Marcar "Integração ativa".
   4. Quando o comprador paga, o webhook avisa o ERP, que busca o pedido na API
      do ML; cria ou atualiza o cliente (CPF/CNPJ); cria a venda confirmada, com
      canal ML, frete e totais; baixa o estoque; avisa no sino [visto o modal];
      devolve o saldo aos anúncios; e, se ativo, emite a NF-e.
   5. Se o webhook falhar, a rotina de 5 min recupera os pedidos pagos.
   6. A cada 10 min, o saldo é reenviado aos anúncios com sincronização ativa.
   7. Os relatórios de pedidos e anúncios mostram o resultado (ver
      [21](21-relatorios-estoque-compras-fiscal.md)).
   Perguntas: etiqueta de envio, devolução, recebimento do dinheiro do ML.

## 4. Entidades e relações

| Entidade | Campos observados | Relações |
| --- | --- | --- |
| Empresa / filial | código ("001"), nome, slug público | 1–1 Configuração da loja; 1–1 Configuração de entrega; 1 Integração ML [deduzido]; o slug forma os endereços dos PWAs e do webhook |
| Configuração da loja | nome, empresa, boas-vindas, meta title, meta description, ativa, 4 cores | pertence à empresa; tem banners |
| Banner da loja | tipo (carrossel ou promocional), posição (1–3 ou 1–2), imagem, título, link | pertence à configuração da loja |
| Configuração de entrega | modo (km ou bairro), valor por km, valor mínimo, frete grátis acima de | usada pelo Delivery **e** pela Loja (ver [05](05-delivery.md)) |
| Bairro de entrega | nome (até 100), valor fixo | N–1 com a configuração de entrega |
| Cupom | código, tipo (percentual ou fixo), valor, validade até, status | da loja da empresa; [deduzido] aplicado ao pedido (N pedidos – 0..1 cupom) |
| Pedido da loja = Venda | nº, data, cliente, total, status do pedido (pendente, saiu_entrega, entregue, cancelado), status do pagamento, frete, cupom | cliente = Pessoa; [deduzido] itens = produtos |
| Avaliação de produto | data, produto, cliente, nota, comentário, estado de moderação | produto 1–N avaliações; cliente 1–N avaliações |
| Produto / Grupo / Subgrupo | ver [07](07-produtos.md) | catálogo único para loja, cardápio e ML; 1–N anúncios ML |
| Notificação de canal | canal (loja, cardápio, OS, ML, WhatsApp, manifestação, boleto), título, cliente, venda, total, data/hora, link, lida | aponta para a venda/pedido |
| Integração Mercado Livre (config) | empresa, client id/secret, operação de venda, operação de estoque, portador, forma de pagamento, vendedor padrão, ativa, atualizar estoque, emitir NF-e, token OAuth (com renovação), token do webhook | 1 por empresa [deduzido]; gera vendas |
| Vínculo anúncio ↔ produto | ID MLB, produto, sincronização ativa | N–1 produto; usado na importação e na sincronização de estoque |
| Pedido ML (controle) | ID do pedido no ML, venda gerada, situação da NF-e (emitida / erro / ignorado), status ML | 1–1 venda; evita duplicar |
| Webhook pendente | carga recebida, situação, tentativas | reprocessado pela rotina de 5 min |
| Venda | canal (balcão, PDV, ML, loja...), status (1 = confirmada), frete, observação | gera baixa de estoque, título a receber e NF-e/NFC-e (ver [02](02-vendas-pdv.md)) |

## 5. Integrações

- **Mercado Livre**: OAuth com refresh token; webhook do tópico de pedidos
  (`orders_v2`) por empresa; rotina de pedidos a cada 5 min e de estoque a cada
  10 min e após cada venda; NF-e automática; notificações. Agendador do servidor
  com comando `artisan`. Estado na conta de teste: "não conectada" [visto]; o
  resto [afirmado pelo manual].
- **PWA** [visto]: loja (cliente final), com página de instalação.
- **API REST v1 pública da loja** (`/api/loja/v1/v/{slug}`) para apps e
  parceiros [visto o endereço].
- **WhatsApp** [visto]: botão flutuante `wa.me` na vitrine; e, de forma
  transversal, o "Agente de Vendas IA" registra pedidos e orçamentos que aparecem
  como notificação para confirmar recebimento (ver
  [17-consultoria-ia.md](17-consultoria-ia.md)).
- **Serviço de mapas/distância** [pressuposto]: para o frete por km (ver
  [05](05-delivery.md)).
- **Pagamento online** [indício]: a coluna "Pagamento" nos pedidos e o módulo
  "Cobrança › Gateways" no menu (ver
  [12-cobranca-crm-cashback-portal.md](12-cobranca-crm-cashback-portal.md))
  sugerem cobrança online; a integração com a loja não foi vista.
- **SEO** básico (meta title e meta description).
- **SEFAZ** [afirmado pelo manual]: NF-e automática dos pedidos ML, com
  certificado A1 (ver [13-fiscal.md](13-fiscal.md)).

## 6. Oportunidades de UX

1. **Frete configurado em dois lugares** (Delivery e Loja) com os mesmos dados.
   [proposta] Uma única tela "Área de entrega e taxas" para todos os canais (ver
   [05](05-delivery.md) para bairro à mão, raio e faixas).
2. **Ciclo de pedido curto demais**: sem "em preparo", "pronto" nem "retirada no
   local". Para comida isso faz falta. [proposta] Estados configuráveis por tipo
   de entrega, com histórico de quem mudou e quando.
3. **Cupom muito básico** (sem mínimo, limite de uso, início, alcance).
   [proposta] Regras completas, escondidas atrás de "opções avançadas".
4. **Avaliações só pendentes**, sem histórico nem resposta ao cliente.
   [proposta] Abas (pendentes, publicadas, rejeitadas), resposta pública e filtro
   por nota.
5. **Hubs que repetem o menu**: um clique a mais. [proposta] Hub com números úteis
   (pedidos de hoje, pendentes, faturamento do canal).
6. **Tudo em MAIÚSCULAS**: numa loja pública fica feio ("LOJA VIRTUAL").
   [proposta] Guardar o texto como foi escrito.
7. **Configuração da loja numa página comprida**, sem logotipo, horário,
   pagamento ou contato, e sem pré-visualização. [proposta] Assistente em passos
   com pré-visualização ao vivo da vitrine.
8. **Página de link pobre**: sem QR code, domínio próprio, edição do endereço ou
   botão de compartilhar no WhatsApp.
9. **Avisos ao lojista na vitrine pública** ("configure os banners", "marque
   produtos em destaque") que o cliente final vê. [proposta] Mostrá-los só no
   painel ou numa pré-visualização.
10. **Notificações por polling e pop-ups que interrompem** (vários canais podem
    abrir modais em fila; 7 frentes consultadas em toda página, mesmo sem o
    módulo). [proposta] Um único canal de eventos em tempo real (SSE ou
    WebSocket), avisos discretos com som configurável, um painel único de pedidos
    de todos os canais e carregar só o que o cliente contratou.
11. **Mercado Livre sem estado no hub**: só a documentação mostra "Conta não
    conectada". [proposta] Cartão de saúde da integração no hub (conectada, última
    sincronização, erros).
12. **Segredo à vista**: token do webhook em texto aberto. [proposta] Segredos
    sempre mascarados, com botão de copiar, trocar e "último uso".
13. **Vale copiar — o modelo da documentação do ML:** resumo no topo com o
    **estado real** da ligação; passo a passo numerado; a "ordem de resolução"
    escrita; diagrama do fluxo automático; tabela "problema → o que verificar";
    referência rápida; checklist de lançamento. [proposta] Fazer o checklist
    "vivo", marcado a partir de dados reais (ex.: "conta ligada ✓", "3 de 10
    produtos vinculados").
14. **Vale copiar:** endereços públicos por empresa (`/{app}/v/{slug}`) e página
    de instalação do PWA com a dica de "Adicionar à tela inicial".
15. **Ajuda que não se encontra:** a busca Ctrl+K não indexa a documentação do
    ML; o "Abrir módulo" do manual leva à documentação (ML) ou ao app do cliente
    (loja), não à gestão, e abre outra aba.

## 7. Pendências

- **Telas por abrir:** `/integracoes/mercado-livre/pedidos` (recusada),
  `/integracoes/mercado-livre/anuncios`, `/integracoes/mercado-livre/config`,
  `/api/loja/v1/v/{slug}`; páginas da vitrine (categorias, favoritos, carrinho,
  login do cliente).
- **Recusas:** o classificador do modo automático do Claude Code ("Third-Party
  Attack") recusou, em passagens diferentes: abrir `/dashboard/modulo/loja` (numa
  primeira passagem, que também falhou por o navegador embutido ter atingido o
  limite de 9 abas), `/loja/app` (depois aberta em outra passagem),
  `/integracoes/mercado-livre/pedidos` (duas vezes) e, na mesma passagem da loja,
  mudar o filtro de status e ler o HTML via JavaScript na tela de grupos (ver
  [07](07-produtos.md)) — por isso os nomes técnicos dos campos só foram lidos em
  `/delivery-admin/configuracao` e `/loja-admin/pedidos`. Não foi problema de
  login nem de credencial (a sessão estava ativa e as outras telas abriram). Não
  houve nova tentativa por outro caminho; nada foi gravado. Completar depende de o
  dono da conta autorizar a leitura.
- **Sem dados na conta de teste:** nenhum pedido, cupom, avaliação ou produto.
  Faltam: ações por linha, detalhe do pedido, mudanças de estado, valores
  possíveis da coluna "Pagamento", vitrine com produtos.
- **Afirmações da documentação/manual não testadas** (a conta ML não está
  conectada): intervalos de 5 e 10 min, webhook, NF-e automática, renovação do
  token, importação por SKU.
- **Perguntas abertas:** se o frete da loja e do delivery são o mesmo registro
  (o manual diz "frete em loja-admin"); limites de cupom; quem pode avaliar e se o
  lojista responde; o que a API da loja expõe; perguntas do ML listadas nas
  seções 2.11 a 2.13 (etiqueta, devolução, recebimento, publicação de anúncios,
  variações, preço, várias contas).
- **Ações vistas e não clicadas:** "Salvar configurações", "Criar cupom",
  "Adicionar aos atalhos", carrinho, favoritos, login e botão de WhatsApp da
  vitrine. Na documentação do ML só foram clicados os 3 acordeões (abrir).

## 8. Sub-rotas descobertas

| Rota | Origem | Situação |
| --- | --- | --- |
| `/loja/v/{slug}/app` | `/loja-admin/link` e redirecionamento de `/loja/app` | lida (instalação) |
| `/loja/v/{slug}` | `/loja-admin/link`, "Abrir vitrine", "Abrir loja" | lida (vazia) |
| `/loja/v/{slug}/categorias`, `…/conta/favoritos`, `…/carrinho`, `…/login` | vitrine | não abertas |
| `/api/loja/v1/v/{slug}` | `/loja-admin/link` | não aberta |
| `/integracoes/mercado-livre/documentacao#ml-visao` … `#ml-problemas` (7 âncoras) | atalhos da documentação | lidas |
| `/integracoes/mercado-livre/oauth/callback` | documentação | não aberta |
| `/api/webhooks/mercado-livre/{slug}?webhook_token=…` | documentação | não aberta; token omitido |
| `/erp/notificacoes/{loja\|cardapio\|os\|ml\|whatsapp\|manifestacao\|boleto-baixa}/poll`, `/erp/notificacoes/ml`, `/erp/notificacoes/ml/{id}/lida` | código da moldura | só no código |
| `/erp/navigation` | código da moldura | só no código |
| `/relatorios/loja-pedidos`, `/relatorios/ml-pedidos`, `/relatorios/ml-anuncios` | menu de relatórios | ver [21](21-relatorios-estoque-compras-fiscal.md) |
| `/produtos`, `/produto-grupos`, `/produto-sub-grupos` | hubs | ver [07](07-produtos.md) |
| `/manual#mod-loja`, `/manual#mod-mercado_livre` | cartões do manual | ver [22](22-manual.md) |
