# 14 — Ordem de serviço, app do técnico, força de vendas e rotas (ERP Olímpia)

> **Estado: explorado em parte (2026-10-03).** As 8 rotas do grupo abriram e
> foram lidas, só em leitura, na conta de teste "Boi Criolo". O login já estava
> feito no navegador e funcionou. A conta **não tem nenhum registro neste
> módulo**: 0 OS, 0 chamados, 0 serviços, 0 checklists, 0 aparelhos e 0 rotas.
> Por isso só vi telas vazias, formulários, filtros e modais, e nenhum dado
> real. Algumas ações foram recusadas pelo filtro de permissões do Claude Code
> (modo automático). Essas ações estão na seção 8. Não gravei, não alterei e
> não apaguei nada.

Legenda: **[visto]** = observado na tela. **[inferido]** = dedução a partir do
que se viu, a confirmar.

---

## 1. Visão geral do módulo

- **É uma OS de oficina mecânica vinda de um sistema desktop antigo.** As
  próprias telas dizem que equivalem a formulários do sistema legado (`FrmOS`,
  `FrmRomaneio_Rota`) e citam a tabela `os_oficina` [visto]. Campos como placa,
  chassi, km, motor, guincho e deslocamento mostram o foco automotivo. O rótulo
  "veículo / equipamento" tenta servir também para outros ramos.
- **Três blocos no hub:** Operação (OS, Chamados, app do técnico), Cadastros
  (Serviços, Checklists) e Relatórios (a central mais 8 relatórios no hub; o
  menu lateral tem outros 4, somando 12 relatórios, 4 deles só de
  comissões) [visto]. No total há 15 relatórios de OS e comissões (8 de OS e
  7 de comissões; os outros 3 de comissão ficam no grupo "Comissões" do menu),
  todos descritos em
  [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md).
- **Lugar no menu e no plano.** No menu lateral, o módulo fica em "Vendas &
  Atendimento › Ordem de Serviço" (14 itens) [visto]. Na tela de planos, o
  resumo do Premium cita "força de vendas" e o do Full cita "OS" e "portais"
  (ver [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)).
- **O que o manual diz** (cartões "Ordem de Serviço" e "Força de Vendas
  (Android)", ver [22-manual.md](22-manual.md)) [afirmado pelo manual]:
  - OS: criar a OS ou converter um chamado em `os-admin`; atribuir o técnico e
    **agendar**; o técnico trabalha no PWA (com **checklist**); **faturar** a
    OS gera venda e contas a receber; assinatura eletrônica do cliente, quando
    usada. O botão "Abrir módulo" do cartão leva direto a
    `/os/v/{slug-da-empresa}/tecnico/app`.
  - Força de vendas: instalar o app Android; sincronizar catálogo e clientes;
    fazer pedidos **sem internet** e enviá-los quando houver conexão; o pedido
    entra no ERP.
- **Parâmetros ligados a este módulo:** o grupo "App Força de Vendas" e o
  e-mail automático da OS ficam na aba Parâmetros do cadastro da empresa (ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)).
- **A força de vendas não é uma tela de venda dentro do ERP.** O ERP só
  configura e acompanha um app Android separado ("Olimpia Força de Vendas"),
  que fala com uma API mobile. No ERP ficam a URL e o QR da API, a liberação de
  aparelhos (com limite por plano) e o painel de cobertura de visitas por rota
  [visto].
- **A OS se liga a outros módulos:** produtos e estoque (peças), cadastro de
  serviços, pessoas (cliente, técnico, colaborador), formas de pagamento,
  financeiro (títulos a receber), comissões e portal do cliente (origem dos
  chamados) [visto nos campos e filtros; a integração em si é inferida].
- **Navegação global (igual em todas as telas):** menu lateral, barra superior
  e avisos estão descritos em [22-manual.md](22-manual.md#12-moldura-e-padrões-de-interface-do-sistema-todas-as-telas).

---

## 2. Telas

### 2.1 Hub do módulo — `/dashboard/modulo/os`

**Objetivo:** página de entrada do módulo, com mosaicos (cards) que levam às
telas.

| Bloco | Card | Destino |
|---|---|---|
| Operação | Ordens de serviço | `/os-admin` |
| Operação | Chamados | `/os-admin/chamados` |
| Operação | PWA técnico | `/os/tecnico/app` |
| Cadastros | Serviços | `/servicos` |
| Cadastros | Checklists | `/os-admin/checklists` |
| Relatórios | Central de relatórios | `/relatorios` |
| Relatórios | OS por período | `/relatorios/os-periodo` |
| Relatórios | OS abertas | `/relatorios/os-abertas` |
| Relatórios | Serviços executados | `/relatorios/os-servicos-executados` |
| Relatórios | Peças utilizadas | `/relatorios/os-pecas-utilizadas` |
| Relatórios | Comissões de serviços | `/relatorios/comissoes-servicos` |
| Relatórios | Comissões por recebimento | `/relatorios/comissoes-por-recebimento` |
| Relatórios | Comissões vendas + peças | `/relatorios/comissoes-vendas-pecas-os` |
| Relatórios | Comissões de OS | `/relatorios/comissoes-os-analitico` |

- Cada card tem um botão "Adicionar aos atalhos", que fixa a tela no menu
  pessoal. Não cliquei nele.
- O grupo "Ordem de Serviço" do menu lateral tem ainda 4 relatórios que não
  aparecem no hub: OS por status (`/relatorios/os-por-status`), OS por técnico
  (`/relatorios/os-por-tecnico`), OS por cliente (`/relatorios/os-por-cliente`)
  e OS faturadas (`/relatorios/os-faturadas`).
- Os filtros e o que se sabe de cada relatório estão no
  [20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md); a Central de
  relatórios, no
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).

### 2.2 Consulta de OS — `/os-admin`

**Objetivo:** listar e filtrar as OS da filial e servir de entrada para criar
uma OS.

**Ações no cabeçalho**

| Botão | Destino | Observação |
|---|---|---|
| Orçamento | `/vendas` (Venda Balcão) | O orçamento não é feito na OS: o botão leva ao módulo de vendas. |
| Comissões | `/relatorios/comissoes-os-analitico` | — |
| Chamados | `/os-admin/chamados` | — |
| Nova OS | `/os-admin/nova` | — |

**Indicadores (cards)**

- Total cadastradas: todas as OS da filial (0).
- Em aberto: quantas estão com status Aberta (0).
- Valor em aberto: soma das OS abertas (R$ 0,00).
- Os indicadores são **por filial** e parecem ignorar o filtro de período
  [inferido pelo texto dos cards].

**Filtros**

| Campo | Tipo | Opções / padrão |
|---|---|---|
| Busca | texto | procura por nº da OS, cliente, placa ou veículo |
| Status | seleção | Todos (exceto canceladas) [padrão], Aberta (0), Fechada (1), Cancelada (2), Quitado (4) |
| Incluir canceladas | caixa de seleção | desmarcada |
| De / Até | data | primeiro e último dia do mês corrente |
| Filtrar | botão | aplica o filtro |

- O período vai na URL (`?de=AAAA-MM-DD&ate=AAAA-MM-DD`): o link "Voltar" da
  Nova OS devolve à lista com o mesmo período.
- Os códigos de status saltam do 2 para o 4. O código 3 existe no sistema
  antigo, mas está escondido na tela [inferido].

**Lista:** Nº OS, Cliente, Placa, Veículo, Técnico, Entrada, Status, Total e
Ações. Quando não há resultados, a lista mostra uma mensagem de lista vazia.
Não vi as ações por linha, porque não havia registros.

**Painel "Dados complementares"** abaixo da lista: mostra os detalhes do
registro selecionado (padrão mestre-detalhe herdado do desktop) [visto vazio].

### 2.3 Nova OS — `/os-admin/nova` (sub-rota)

**Objetivo:** criar a OS com cliente, veículo, peças, serviços, valores e
observações. Tem "Salvar" e "Voltar" no cabeçalho e "Cancelar" e "Salvar OS"
no rodapé. **Não gravei.**

Seis abas: **Geral · Veículo · Peças (contador) · Serviços (contador) · Valores
· Observações.** Todos os campos estão no mesmo formulário, e as abas só os
agrupam.

**Aba Geral**

*Vínculos.* Cada campo abre uma pesquisa em modal, pela lupa ou clicando no
campo. Guarda o ID em um campo oculto e tem botão "Limpar".

| Campo | Tipo | Obrigatório |
|---|---|---|
| Cliente (código ou nome) | pesquisa em modal | sim (*) |
| Técnico responsável | pesquisa em modal | não |
| Forma de pagamento (código ou nome) | pesquisa em modal | sim (*) |

*Datas e status.*

| Campo | Tipo | Opções / padrão |
|---|---|---|
| Data entrada | data | hoje |
| Conclusão | data | vazio |
| Saída | data | vazio |
| Status | seleção | Aberta (0) [padrão], Fechada (1), Cancelada (2), Quitado (4) |
| Prioridade | seleção | Normal (0) [padrão], Alta (1), Urgente (2) |
| Nº OS terceiro | número | 0 |
| Nº OS fabricante | número | 0 |

- "Nº OS fabricante" e "Nº OS terceiro" servem para OS de garantia ou de
  serviço feito por terceiros, como em concessionárias e oficinas
  credenciadas [inferido].
- O status pode ser escolhido livremente já na criação: dá para criar uma OS
  como "Quitado" ou "Cancelada" sem passar pelos estados anteriores
  [visto o seletor; a validação no servidor não foi testada].

**Aba Veículo** ("dados do veículo / equipamento"). Todos os campos são texto
livre e não há pesquisa de um veículo já cadastrado.

| Campo | Tipo |
|---|---|
| Veículo / modelo | texto |
| Marca | texto |
| Placa | texto |
| Chassi | texto |
| Cor | texto |
| Ano | número (ex.: 2018) |
| Km | texto (o rótulo não está associado ao campo, uma falha de acessibilidade) |
| Motor | texto |
| Acessórios | texto |
| Observação do veículo | texto longo |

**Aba Peças** ("peças utilizadas")

- Botões "Lançar peça" (produto do cadastro) e "Avulso" (item fora do
  cadastro).
- Tabela: Tipo (cadastro/avulso), Produto, Descrição, Qtd, Vlr unit., Total,
  Colaborador.
- **Modal "Lançar peça / produto":**
  - Pesquisar produto por ID, referência, GTIN ou descrição. Enter pesquisa, e
    um ID exato seleciona o produto sozinho. O resultado mostra Descrição,
    Referência, Preço e **Estoque**.
  - Interruptor "Lançamento avulso", desligado por padrão: com ele desligado a
    peça fica ligada ao cadastro de produtos.
  - Código/ID do produto (Enter ou "Pesquisa modal"), indicador de "nenhum
    produto selecionado" e outro campo de pesquisa de produto com lupa.
  - Descrição na OS (o texto que sai impresso), Quantidade (padrão 1), Valor
    unitário (0,00), Total (0,00, calculado [inferido]).
  - Colaborador: quem lançou ou executou, para a comissão [inferido].
  - Botões Cancelar e "Lançar peça". Este botão só adiciona a linha à OS que
    ainda não foi gravada.

**Aba Serviços** ("serviços executados")

- Botões "Lançar serviço" (do cadastro de serviços) e "Avulso".
- Tabela: Tipo, Serviço, Descrição na OS, Qtd, Vlr unit., Total, Colaborador.
- **Modal "Lançar serviço":** pesquisa por ID ou descrição (o resultado mostra
  Descrição e Valor), interruptor "Lançamento avulso", serviço selecionado (com
  "Pesquisa modal"), Descrição na OS, Quantidade (1), Valor unitário, Total e
  Colaborador ("quem executou o serviço"). Botões Cancelar e "Lançar serviço".

**Aba Valores** ("valores e descontos")

| Campo | Tipo | Padrão |
|---|---|---|
| Adiantamento | número (R$) | 0 |
| Deslocamento | número (R$) | 0 |
| Guincho | número (R$) | 0 |
| Outros | número (R$) | 0 |
| Desc. peças (%) e Desc. peças (R$) | número | 0 |
| Desc. serviços (%) e Desc. serviços (R$) | número | 0 |
| Desc. geral (%) e Desc. geral (R$) | número | 0 |

Resumo calculado: **Peças, Serviços, Descontos, Bruto e Total líquido**.

- A fórmula não foi testada [inferido]. O provável é: Bruto = peças + serviços
  + deslocamento + guincho + outros; Descontos = desconto de peças + desconto de
  serviços + desconto geral, cada um em % ou em R$, sendo que um deve
  recalcular o outro; Líquido = Bruto − Descontos. O adiantamento deve abater
  do valor a receber, e não do total.

**Aba Observações** ("defeito e observações")

| Campo | Tipo | Sai na impressão? |
|---|---|---|
| Defeito / reclamação | texto longo | — |
| Observação geral | texto longo | sim (via do cliente) |
| Observação dos serviços | texto longo | — |
| Observação interna | texto longo | **não**: só aparece no sistema, nem no cupom nem no A4 |

- O texto de ajuda fala em **cupom e A4**: a OS imprime em impressora térmica e
  em folha A4 [visto o texto; a impressão não foi testada].
- **Não há aba de checklist, laudo ou fotos na criação.** Isso aparece no app
  do técnico (seção 2.5). Não ficou claro onde o checklist entra na OS.

### 2.4 Chamados — `/os-admin/chamados`

**Objetivo:** receber pedidos de clientes, sobretudo do portal, e convertê-los
em OS.

- Botões: Nova OS e Consulta OS. Há também um link de voltar para `/os-admin`.
- Indicadores: "Registros" (chamados no sistema) e "Página atual" (quantos
  aparecem nesta página): ambos 0. A lista é paginada.
- Lista: Assunto, Cliente, Prioridade, Status, Origem, Ação. Sem registros, a
  lista mostra só uma mensagem de lista vazia.
- **Não há filtros nem botão de "novo chamado".** O chamado nasce fora desta
  tela. O mais provável é o Portal do Cliente (`/dashboard/modulo/cliente`,
  `/cliente-portal/app`, `/cliente-portal-admin/link`, que estão no menu
  lateral) [inferido pelo campo "Origem" e pelo subtítulo]. A coluna "Ação"
  deve converter o chamado em OS [inferido].
- Nas notificações do ERP (fora do conteúdo principal) há um tipo de aviso
  para quando **o cliente assina eletronicamente a OS** [visto o texto]. A tela
  de assinatura não foi vista. A moldura de todas as telas consulta de tempos
  em tempos o canal de avisos de OS (`/erp/notificacoes/os/…`) e soma as
  novidades no sino, junto com loja virtual, cardápio e Mercado Livre
  [código; mecanismo geral no 19]. A assinatura eletrônica é um módulo à parte,
  `/assinatura-admin`, descrito no
  [16-folha-colaborador.md](16-folha-colaborador.md).

### 2.5 App do técnico (PWA) — `/os/tecnico/app`

- Redireciona para **`/os/v/{slug-da-empresa}/tecnico/app`**, com o nome da
  empresa na URL [visto].
- **Tem login próprio**, separado do ERP: Empresa (seleção, vazia ao abrir),
  Usuário, Senha e "Entrar". A sessão do ERP não serve aqui. **Não fiz login**
  (proibido pelas regras da tarefa).
- Atrás do login, a página já traz a estrutura do app [visto na árvore da
  página, sem dados]:
  - cabeçalho "Técnico" com um botão de menu ou sair;
  - **Minha agenda**: a lista das OS atribuídas ao técnico [inferido];
  - detalhe da OS com:
    - "← Voltar";
    - **Registrar chegada (GPS)**: marca a hora e a localização da chegada;
    - **Registrar saída**;
    - **Laudo técnico** (texto livre) e "Salvar laudo";
    - **Foto**: escolher o arquivo ou a câmera e "Enviar foto";
    - **Concluir OS**.
- Regras inferidas: a agenda é do técnico responsável. A chegada e a saída
  registram a hora e as coordenadas, o que serve para provar a visita e medir o
  tempo de atendimento. Concluir a OS muda o status ou a data de conclusão.

### 2.6 Cadastro de serviços — `/servicos`

**Objetivo:** catálogo de serviços padrão para lançar na OS, com descrição,
valor e % de comissão.

- **"Migrar produtos-serviço"**: botão que grava. Pela dica do botão, os
  produtos marcados como serviço passam para este cadastro e são inativados em
  Produtos. Mostra que antes o serviço era um tipo de produto. Não cliquei.
- **"Novo serviço"** leva a `/servicos/create`. **Não abriu** (ver seção 8).
- Filtros:
  - Parâmetro (Descrição [padrão] ou ID);
  - Valor (texto de busca);
  - Status: Todos, Ativo [padrão], Inativo;
  - "Pesquisar" e "Limpar".
- Lista: ID, Descrição, Valor unitário, Comissão %, Status, Ações. Sem
  registros, mostra uma mensagem de lista vazia.

### 2.7 Checklists — `/os-admin/checklists`

**Objetivo:** modelos de checklist reutilizáveis para usar na OS.

- **Botões de modelo pronto: Veículo, Peças, Manutenção.** Cada um grava logo
  um checklist a partir de um modelo, e a lista vazia sugere começar por eles.
  Não cliquei.
- **"Novo checklist"** leva a `/os-admin/checklists/nova`. **Não abriu** (ver
  seção 8).
- Filtros:
  - Tipo: Todos, Veículo (`veiculo`), Peças (`peca`), Manutenção
    (`manutencao`);
  - Busca: nome ou descrição;
  - Status: Todos, Ativo, Inativo;
  - "Pesquisar".
- Lista: ID, Nome, Tipo, Itens (quantidade), Ativo, Ações.
- Entidade: o modelo de checklist tem tipo e uma lista de itens. Não vi os
  tipos de resposta dos itens (sim/não, texto, foto…).

### 2.8 API Força de Vendas — `/forca-vendas/api`

**Objetivo:** ligar o app Android de força de vendas a esta empresa e controlar
quais aparelhos podem usar a API.

Bloco **"URL da API no aparelho"**

- Campo "Caminho da API", só de leitura, com o botão "Copiar". O formato é
  `https://erp.olimpiasistemas.com.br/api/mobile?codigo_acesso={código da
  empresa}`: o código de acesso da empresa vai **na própria URL** [visto]. Não
  copiei o valor.
- O código de acesso também aparece em texto.
- **"Copiar LLM"** copia um prompt completo, com a especificação da API mobile,
  para colar no Cursor, Claude ou ChatGPT. A API é pensada para integradores,
  inclusive com assistentes de IA.
- QR code da URL da API, para ler no app Android.

Bloco **"Baixar o app Olimpia Força de Vendas"**

- QR e link para o Google Play (pacote `com.olimpiasistemas.olimpia_mobile`).
- iOS: "em breve".

Bloco **"Aparelhos liberados"**

- O app se registra sozinho na primeira conexão, e o administrador libera ou
  bloqueia o aparelho aqui.
- Contador "Liberados 0 de 1" e "1 vaga disponível": há um **limite de
  aparelhos por plano**, ou seja, licença por aparelho.
- Lista: Apelido, Tipo, GUID (identificador do aparelho), CNPJ, Status, Ações
  (liberar ou bloquear [inferido]). Sem registros, a lista explica que basta
  abrir o app no celular.

### 2.9 Visitas de rota — `/rota-visitas`

**Objetivo:** medir a cobertura de visitas dos vendedores, ou seja, quais
clientes da rota foram visitados e quais não, com dados vindos do app de força
de vendas.

**Ações no cabeçalho**

- **Mapa da rota:** abre o modal "Rota do vendedor", com um mapa de marcadores
  numerados na ordem das visitas, uma lista da ordem e o botão "Imprimir mapa".
  A estrutura foi vista na página. Não abri o modal, por isso não sei que
  serviço de mapas usa.
- **Relatório:** leva a `/relatorios/rota-visitas`.
- **Imprimir:** leva a `/rota-visitas/imprimir`. Não abri, para não disparar o
  diálogo de impressão.

**Indicadores:** clientes na rota, visitados, não visitados e **Cobertura (%)**
= visitados ÷ clientes na rota [inferido pela forma].

**Filtros**

| Campo | Tipo | Opções / padrão |
|---|---|---|
| De / Até | data | hoje / hoje |
| Vendedor | pesquisa em modal | — |
| Rota | pesquisa em modal | — |
| Situação | seleção | Todos [padrão], Visitados, Não visitados |
| Sem comprar (dias) | número | ex.: 15 |
| Filtrar | botão | — |

**Lista:** Código, Cliente, Telefone, Bairro, Rota, Vendedor, Situação, Última
compra, Dias sem compra, Data da visita, Hora, Obs.

**Regras visíveis:**

- O cliente só entra na rota se tiver uma rota no cadastro; a mensagem de lista
  vazia cita o campo interno `id_rota`.
- As visitas chegam por sincronização do app.
- "Última compra" e "dias sem compra" vêm das vendas, e servem para ver quem
  deixou de comprar. O mesmo critério "sem comprar há X dias" existe no
  relatório "Clientes sem comprar" (padrão 15 dias, por vendedor e rota) e no
  relatório de visitas (ver
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)).
- O painel de migração de cadastros (`/cadastros/checklist`, ver 08) lista
  esta tela como "Rota Vendedor" → `/rota-visitas` ("cobertura visitado/não
  visitado e relatório") [visto].

### 2.10 Sub-rotas lidas fora da lista

Os três relatórios abaixo foram lidos de passagem nesta exploração. As
seções completas deles ficam nos documentos de relatórios:
`/relatorios/rota-visitas` no
[19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)
(a Central confirma 6 filtros e saída em PDF, Excel e CSV) e
`/relatorios/os-periodo` e `/relatorios/os-abertas` no
[20-relatorios-comissoes-os.md](20-relatorios-comissoes-os.md). O cadastro
`/rotas` fica no 08.

**`/relatorios/rota-visitas`: Visitas de rota (cobertura)**

- Filtros:
  - Data inicial e Data final;
  - Vendedor e Rota (pesquisa em modal);
  - Situação: Todos, Somente visitados, Somente não visitados;
  - Sem comprar (dias).
- Botão "Gerar", que não cliquei, e link "Central" para `/relatorios`.

**`/rotas`: cadastro de rotas** (menu Cadastros › Empresa & Rotas)

- Equivale ao `FrmRomaneio_Rota` do sistema antigo: a mesma rota serve à
  entrega (romaneio) e à força de vendas [inferido].
- "Inserir" leva a `/rotas/create`, que não abri.
- Filtros: Parâmetro (Descrição ou ID), Valor, Ordem (Descrição ou ID),
  "Pesquisar" e um link para limpar.
- Lista: ID, Descrição, Zona, Região, Valor, Ações. "Valor" é provavelmente a
  taxa de entrega ou de frete da rota [inferido].
- Painel "Dados complementares" com o link "Alterar" (mestre-detalhe).

**`/relatorios/os-periodo`: OS por período** (lista analítica com cliente,
veículo, técnico e totais)

- Filtros:
  - Data inicial e Data final;
  - Cliente e Técnico responsável (pesquisa em modal);
  - Placa;
  - Status OS: Todos, Aberta, Fechada, Cancelada (aqui **não** há "Quitado");
  - **Financeiro**: Todas, Com títulos a receber, Sem títulos.
- O filtro "Financeiro" mostra que a OS gera **títulos a receber** no módulo
  financeiro.
- Botão "Gerar" (não cliquei).

**`/relatorios/os-abertas`: OS abertas** (OS com status 0, com dias em aberto e
valores)

- Filtros: Data inicial e Data final, Cliente, Técnico responsável, Placa.
- Botão "Gerar" (não cliquei).

---

## 3. Fluxos de ponta a ponta

1. **OS de oficina, do balcão à entrega.**
   1. Se houver orçamento, é feito na Venda Balcão (`/vendas`).
   2. Nova OS: cliente e forma de pagamento (obrigatórios), técnico, data de
      entrada e prioridade.
   3. Dados do veículo (placa, km…) e o defeito relatado.
   4. Lançar as peças (do estoque ou avulsas) e os serviços (do cadastro ou
      avulsos), cada um com o colaborador.
   5. Adicionais (deslocamento, guincho, outros), descontos por grupo ou geral
      e o adiantamento.
   6. Salvar: a OS fica Aberta.
   7. Execução.
   8. Fechada, com as datas de conclusão e saída.
   9. Quitado quando paga.

   A conversão do orçamento em OS e a baixa de estoque das peças não foram
   vistas [inferido]. O manual descreve o mesmo caminho, acrescentando o
   agendamento do técnico, o checklist no PWA e que "faturar" a OS gera venda e
   contas a receber [afirmado pelo manual].
2. **Chamado → OS.**
   1. O cliente abre o chamado no Portal do Cliente (origem "portal").
   2. O chamado aparece em `/os-admin/chamados`, com a prioridade e o status.
   3. O atendente converte o chamado em OS pela coluna "Ação".

   O portal e a conversão não foram vistos a funcionar [inferido].
3. **Técnico em campo (PWA).**
   1. O técnico entra com empresa, usuário e senha e vê a sua agenda.
   2. Abre a OS e registra a chegada com GPS.
   3. Escreve o laudo e envia fotos.
   4. Registra a saída e conclui a OS.
   5. O cliente pode assinar eletronicamente (há aviso para isso nas
      notificações do ERP).
4. **Fechamento financeiro e comissões.**
   1. A OS fechada gera títulos a receber (filtro "Com títulos a receber").
      Cada título aponta para a OS pelo campo `id_ordem_servico` (citado no
      relatório "OS faturadas"); "OS faturada" quer dizer "OS com pelo menos
      um título", e não "OS com nota fiscal" [visto na frase do relatório;
      ver 20]. O manual diz que faturar a OS gera também uma **venda**
      [afirmado pelo manual; não visto].
   2. Quando a OS é paga (títulos com status 1, quitado), passa a "Quitado"
      (4) [inferido].
   3. As comissões são calculadas por serviço (a % no cadastro de serviços), por
      recebimento (só depois de receber), por "vendas + peças" e de forma
      analítica por OS. O colaborador de cada linha da OS define quem recebe
      [inferido pelos nomes dos relatórios e pelo campo Colaborador].
5. **Implantação da força de vendas.**
   1. O administrador abre `/forca-vendas/api`.
   2. O vendedor instala o app pelo QR do Google Play.
   3. O vendedor lê o QR da URL da API, que já leva o código da empresa.
   4. O app registra o aparelho.
   5. O administrador libera o aparelho, até o limite do plano.
6. **Operação diária da força de vendas (rotas).**
   1. Os clientes são cadastrados com uma rota (zona e região).
   2. O vendedor visita os clientes da rota pelo app.
   3. O app sincroniza a visita (data, hora e observação) e, provavelmente,
      os pedidos.
   4. O gestor vê no ERP a cobertura, o mapa com a ordem das visitas e os
      clientes sem comprar há X dias, e pode imprimir ou gerar o relatório.
   5. Os pedidos feitos no app (também sem internet, segundo o manual) chegam
      ao ERP como orçamentos (venda com status 0). Em Faturamento de Vendas
      (`/financeiro/faturamento`, ver
      [02-vendas-pdv.md](02-vendas-pdv.md)) um operador escolhe o vendedor,
      pode marcar "só enviados pelo app", junta os orçamentos num lote e
      fatura [visto lá; ligação com o app deduzida].
7. **Cadastros de apoio.**
   - Serviços: com % de comissão. Há uma migração única de "produtos-serviço"
     para este cadastro.
   - Checklists: criados a partir de modelos (veículo, peças, manutenção).
   - Rotas: com zona, região e valor.

---

## 4. Entidades e relações (como o Olímpia parece modelar)

| Entidade | Campos observados | Relações |
|---|---|---|
| **OrdemServico** (`os_oficina`) | nº, filial, data entrada/conclusão/saída, status (0 Aberta, 1 Fechada, 2 Cancelada, 4 Quitado), prioridade (0 Normal, 1 Alta, 2 Urgente), nº OS terceiro, nº OS fabricante, veículo (modelo, marca, placa, chassi, cor, ano, km, motor, acessórios, obs.), adiantamento, deslocamento, guincho, outros, descontos (peças, serviços, geral, em % e R$), totais (peças, serviços, descontos, bruto, líquido), defeito, obs. geral (imprime), obs. serviços, obs. interna (não imprime) | N:1 Cliente, N:1 Técnico, N:1 Forma de pagamento, N:1 Filial; 1:N itens de peça; 1:N itens de serviço; 1:N títulos a receber [inferido]; 0..1 Chamado de origem [inferido] |
| **ItemPecaOS** | tipo (cadastro ou avulso), produto, descrição na OS, qtd, valor unit., total, colaborador | N:1 OS, N:1 Produto (opcional se avulso), N:1 Colaborador |
| **ItemServicoOS** | tipo (cadastro ou avulso), serviço, descrição na OS, qtd, valor unit., total, colaborador | N:1 OS, N:1 Serviço (opcional se avulso), N:1 Colaborador |
| **Servico** | id, descrição, valor unitário, comissão %, ativo | 1:N ItemServicoOS |
| **ChecklistModelo** | id, nome, descrição, tipo (veículo, peça, manutenção), ativo, quantidade de itens | 1:N itens do checklist (estrutura não vista); vínculo com a OS não visto |
| **Chamado** | assunto, cliente, prioridade, status, origem | N:1 Cliente; gera 0..1 OS [inferido] |
| **Atendimento do técnico** [inferido] | chegada (data, hora, GPS), saída, laudo, fotos, conclusão | N:1 OS, N:1 Técnico |
| **Produto** (de outro módulo) | ID, referência, GTIN, descrição, preço, estoque, marcador de "é serviço" (legado) | 1:N ItemPecaOS |
| **Pessoa: cliente** | código, nome, telefone, bairro, rota (`id_rota`), última compra (calculada) | N:1 Rota; 1:N OS, chamados, visitas |
| **Pessoa: técnico, colaborador ou vendedor** | código, nome | responsável pela OS, executor do item (comissão), vendedor da rota |
| **FormaPagamento** | código, nome | 1:N OS |
| **Rota** | id, descrição, zona, região, valor | N:1 Zona; 1:N clientes; usada no romaneio e na força de vendas |
| **VisitaRota** | cliente, vendedor, rota, data, hora, observação; situação (visitado ou não, calculada) | N:1 Cliente, Vendedor e Rota; chega pelo app |
| **AparelhoForcaVendas** | apelido, tipo, GUID, CNPJ, status (liberado ou bloqueado) | N:1 Empresa; limitado pelas vagas do plano |
| **Usuário do app técnico** | empresa, usuário, senha | login separado do ERP |
| **TituloReceber** (financeiro) | `id_ordem_servico` (ou venda), valor, vencimento, pagamento, status (0 aberto, 1 quitado), colaborador e comissão (ver 20) | gerado pela OS [inferido pelo filtro "Financeiro"]; N:1 OS pelo `id_ordem_servico` |

---

## 5. Integrações e dependências externas

| Integração | Onde | Observação |
|---|---|---|
| GPS do aparelho | app do técnico | "Registrar chegada (GPS)" |
| Câmera e envio de arquivos | app do técnico | "Enviar foto": exige armazenamento de arquivos |
| PWA (app web instalável) | técnico e portal do cliente | tem login próprio, com escolha de empresa |
| App Android nativo | força de vendas | Google Play (`com.olimpiasistemas.olimpia_mobile`); iOS em breve; segundo o manual, sincroniza catálogo e clientes e faz pedidos sem internet [afirmado pelo manual] |
| API mobile REST | `/api/mobile?codigo_acesso=…` | identifica a empresa pelo código na URL; tem spec técnica e um "prompt para LLM" |
| QR code | força de vendas | QR da URL da API e da loja |
| Serviço de mapas | mapa da rota | marcadores numerados; não identifiquei o serviço |
| Impressão | OS (cupom térmico e A4), mapa e lista de visitas | campos com regra de "imprime" e "não imprime" |
| Assinatura eletrônica | OS | só vi o texto do aviso; não sei se é desenho na tela ou assinatura certificada |
| Módulos internos | estoque, financeiro (títulos), comissões, vendas (orçamento), portal do cliente | — |
| Fiscal (NFS-e ou NF-e) | **não visto** nas telas de OS | "OS faturadas" quer dizer OS com título a receber, não nota (ver 20). A NFS-e é gerada no módulo fiscal a partir do número da OS (ver [13-fiscal.md](13-fiscal.md)) e tem o relatório `nfse-emitidas` (ver [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)) |
| Notificações da moldura | todas as telas | canal de avisos de OS (`/erp/notificacoes/os/…`), contado no sino [código] |
| WhatsApp, TEF, gateways | **não vistos** neste módulo | — |

---

## 6. Observações de UX (oportunidades para nós)

1. **Jargão técnico na tela.** Subtítulos com "FrmOS", "tabela os_oficina",
   "FrmRomaneio_Rota" e "id_rota" não dizem nada ao comerciante. A nossa
   interface não deve mostrar nomes internos.
2. **O orçamento fica em outro módulo.** O botão "Orçamento" leva à Venda Balcão.
   O natural seria o orçamento ser uma OS em estado "orçamento", aprovado pelo
   cliente (de preferência por link ou WhatsApp) e convertido sem redigitar.
3. **Estado da OS sem regras visíveis.** Dá para escolher Fechada, Cancelada ou
   Quitado já na criação, e "Quitado" mistura o estado do pagamento com o
   estado do trabalho. Proposta: separar o estado operacional (orçamento →
   aprovada → em execução → concluída → entregue) do estado financeiro (a
   receber, parcial, pago), com transições controladas.
4. **O veículo é texto livre em cada OS.** Não há cadastro de veículo ou
   equipamento ligado ao cliente, portanto não há histórico por placa nem
   preenchimento automático. Oportunidade: uma entidade "objeto do serviço"
   (veículo, aparelho, equipamento), com campos que mudam conforme o ramo.
5. **Modelo preso à oficina mecânica.** Guincho, chassi e motor não fazem
   sentido em uma assistência técnica de celulares ou em uma manutenção predial.
   Seria bom ter campos e modelos por ramo, ativados por cliente, o que
   combina com a ideia de ERP modular.
6. **Pesquisas em modal em todo lugar.** Cliente, técnico, forma de pagamento
   e colaborador abrem um modal com lupa. Um campo com sugestões enquanto se
   escreve é mais rápido. O modal de peça tem três maneiras de achar o mesmo
   produto (ID com Enter, lupa e tabela de busca): é redundante.
7. **Botões duplicados.** "Salvar" no cabeçalho e "Salvar OS" no rodapé,
   "Voltar" e "Cancelar": um só botão principal fixo bastaria.
8. **Descontos em % e R$ em três níveis** (peças, serviços, geral): são seis
   campos para uma só ideia. Um único campo de desconto com alternância %/R$, e
   o desconto por linha quando for preciso, resolve.
9. **O checklist está desligado da OS.** Há cadastro de checklists, mas o
   formulário da OS não tem onde os aplicar. Na nossa versão o checklist deve
   aparecer na entrada do veículo (com fotos de avarias) e no app do técnico.
10. **O app do técnico pede outro login**, com escolha de empresa. Um link
    mágico ou um QR a partir do ERP, ou o login único, reduz o atrito.
11. **Os chamados não têm filtros nem criação interna.** Um pedido por telefone
    não tem onde ser registrado como chamado.
12. **Relatórios fragmentados.** São 12 relatórios, com 4 variantes de comissão;
    melhor um único relatório de OS com agrupamentos (status, técnico, cliente,
    período) e um de comissões com o critério "por execução" ou "por
    recebimento". Os relatórios também abrem vazios e exigem "Gerar"; melhor
    mostrar logo o mês corrente.
13. **Indicadores misturados.** "Total cadastradas" conta tudo, enquanto a
    lista segue o filtro do mês. Os indicadores devem seguir o filtro ou dizer
    claramente que não seguem.
14. **Acessibilidade.** Há rótulos não associados aos campos (Km na OS, "De" nas
    visitas de rota).
15. **Boas ideias para copiar.**
    - A separação entre a observação que vai para o cliente e a observação
      interna.
    - O "Lançamento avulso" para peças e serviços fora do cadastro.
    - A chegada e a saída com GPS.
    - O indicador de cobertura de rota com o filtro "sem comprar há X dias".
    - A liberação de aparelhos com limite por plano.
    - A spec da API pronta para colar em um assistente de IA.
16. **Segurança da força de vendas.** O código da empresa vai na URL da API,
    que pode ficar em logs ou circular em um QR. No nosso caso o pareamento do
    aparelho deve usar um token de uso único, com aprovação pelo
    administrador.

---

## 7. Sub-rotas descobertas

| Rota | Estado |
|---|---|
| `/os-admin/nova` | lida (formulário completo, sem gravar) |
| `/os/v/{slug-da-empresa}/tecnico/app` | lida até o login (destino de `/os/tecnico/app`) |
| `/servicos/create` | **não abriu**: navegação recusada pelo filtro de permissões |
| `/os-admin/checklists/nova` | **não abriu**: navegação recusada pelo filtro de permissões |
| `/rota-visitas/imprimir` | não aberta (evitar o diálogo de impressão) |
| `/relatorios/rota-visitas` | lida (filtros) |
| `/rotas` | lida |
| `/rotas/create` | não aberta |
| `/relatorios` | não aberta nesta exploração (central de relatórios; lida noutra passagem, ver 19) |
| `/relatorios/os-periodo` | lida (filtros) |
| `/relatorios/os-abertas` | lida (filtros) |
| `/relatorios/os-servicos-executados` | **não abriu** nesta exploração: navegação recusada pelo filtro de permissões; filtros lidos noutra passagem (ver 20) |
| `/relatorios/os-pecas-utilizadas`, `/relatorios/os-por-status`, `/relatorios/os-por-tecnico`, `/relatorios/os-por-cliente`, `/relatorios/os-faturadas` | não abertas nesta exploração; filtros lidos noutras passagens (ver 20) |
| `/relatorios/comissoes-servicos`, `/relatorios/comissoes-por-recebimento`, `/relatorios/comissoes-vendas-pecas-os`, `/relatorios/comissoes-os-analitico` | não abertas nesta exploração; filtros lidos noutras passagens (ver 20) |
| `/erp/notificacoes/os/…` | avisos de OS da moldura (só no código) |
| `/vendas` | destino do botão "Orçamento" (outro grupo) |
| `/dashboard/modulo/cliente`, `/cliente-portal/app`, `/cliente-portal-admin/link` | Portal do Cliente, provável origem dos chamados (outro grupo) |
| `/api/mobile?codigo_acesso={código}` | endpoint da API mobile (não é tela) |

---

## 8. Pendências

**Por que algumas partes não foram vistas.** O login no ERP funcionou: as
páginas abriram já com a conta "Boi Criolo". O que travou algumas ações foi
outra coisa, **o filtro de segurança do Claude Code (modo automático)**. Esse
filtro recusou estas ações com o motivo "Third-Party Attack":

1. abrir o formulário **Novo serviço** (`/servicos/create`);
2. abrir o formulário **Novo checklist** (`/os-admin/checklists/nova`);
3. abrir o relatório **Serviços executados**
   (`/relatorios/os-servicos-executados`); depois disso não tentei os outros
   relatórios de OS e de comissões;
4. clicar de novo na aba "Geral" da Nova OS. Não se perdeu nada: os campos
   dessa aba já tinham sido lidos antes;
5. ler, por script, os detalhes técnicos do formulário de filtro (método e
   ação do formulário);
6. processar no computador a cópia completa da página (o menu lateral
   inteiro).

Respeitei as recusas: não tentei chegar ao mesmo resultado por outro caminho.
Para completar, o dono da conta pode rodar este grupo fora do modo automático
e aprovar quando o Claude pedir, ou adicionar nas configurações do Claude Code
uma permissão para o navegador embutido neste site.

**O que falta ver:**

- **Formulário de serviço:** campos além dos que aparecem na lista (descrição,
  valor, comissão %, status). Pode haver tempo padrão, código de serviço
  municipal ou CNAE para NFS-e, ou outros.
- **Formulário de checklist:** estrutura dos itens (tipos de resposta, foto,
  obrigatoriedade) e como o checklist se aplica a uma OS. O manual diz que o
  técnico usa o checklist no PWA [afirmado pelo manual], mas isso não foi
  visto.
- **App do técnico:** exige login próprio (empresa, usuário e senha), e entrar
  é proibido nesta tarefa. Agenda, detalhe da OS, laudo, fotos, GPS e
  conclusão só foram vistos como estrutura escondida, sem dados.
- **Relatórios de OS e comissões:** nesta exploração só se viram "OS por
  período", "OS abertas" e "Visitas de rota", e só nos filtros, porque "Gerar"
  é proibido. Noutras passagens os filtros dos 15 relatórios de OS e comissões
  foram lidos (ver 20). Falta ver o formato do resultado, os totais e a
  exportação.
- **Sem registros de exemplo**, não vi:
  - as ações por linha (editar, imprimir, excluir, converter chamado em OS);
  - as etiquetas de status;
  - o painel "Dados complementares" preenchido;
  - o cálculo real dos totais e descontos;
  - a impressão da OS (cupom ou A4).
- **Mapa da rota:** não abri o modal, por isso não sei que serviço de mapas
  usa nem como a ordem das visitas é definida.
- **Integrações a confirmar:**
  - quando os títulos a receber são gerados (ao fechar a OS ou numa ação de
    "faturar", como diz o manual?) e se o faturamento cria também uma venda;
  - quando o estoque das peças é baixado (ao lançar ou ao fechar?);
  - se a OS emite NF-e para as peças. Já se sabe que "OS faturadas" não tem a
    ver com nota (é OS com título) e que a NFS-e é gerada no módulo fiscal
    pelo número da OS (ver 13 e 20);
  - como o orçamento da Venda Balcão vira OS;
  - onde e como o cliente assina eletronicamente a OS.
- **Portal do Cliente**, a origem provável dos chamados, pertence a outro grupo
  e não foi visitado.
- **App Força de Vendas (Android):** só foi visto do lado do ERP. As telas do
  app (pedido, catálogo, visita, sincronização offline) não fazem parte do
  ERP web.
