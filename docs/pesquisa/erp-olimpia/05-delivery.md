# 05 — Delivery próprio e app do entregador (ERP Olímpia)

> Cobre o módulo "Delivery" (hub, painel, pedidos, entregadores, configuração de
> entrega/frete) e o PWA do entregador. Exploração de 2026-10-03, conta de teste
> "Boi Criolo" (plano Full, perfil ADMIN). Legenda de certeza: [visto], [visto em
> parte], [deduzido], [afirmado pelo manual], [código] (lido no HTML/JS da
> página), [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

**O que o módulo faz.** Entrega com equipe própria: [visto] configurar como o
frete é calculado (por km ou por bairro); [afirmado pelo manual] reunir os
pedidos dos canais no `delivery-admin`, cadastrar entregadores, atribuir corridas
e acompanhar o entregador, que usa um PWA com GPS e prova de entrega.

**Onde fica no menu [visto].** Seção **Canais Digitais** › Delivery (junto com
Loja Virtual, Mercado Livre, Cardápio Digital e Painel TV), com os itens
"Dashboard", "Pedidos Delivery", "Entregadores", "Configuração de entrega" e
"PWA Entregador". [deduzido] Os itens correspondem a `/delivery-admin`,
`/delivery-admin/pedidos`, `/delivery-admin/entregadores`,
`/delivery-admin/configuracao` e `/delivery/app`; a tela de configuração tem o
link "Voltar para o delivery", que leva a `/delivery-admin`.

**Frete compartilhado com a Loja Virtual [visto].** A tela de configuração da loja
mostra o mesmo bloco de frete (mesmas opções e valores) e diz para usar a
configuração do Delivery Próprio. Ver
[06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md).

**Plano [visto em parte].** O plano Premium (R$ 499,90) é resumido como
"omnicanal: loja, cardápio, Mercado Livre, delivery..."; "Delivery Próprio" está
entre os 36 módulos do Full. Ver
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md).

**Outros pontos do ERP que tocam a entrega [visto; detalhe em outros documentos]:**

- **Cadastro de bairros** (`/bairros`, ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)): cada bairro
  tem "Tarifa inicial" (taxa de entrega do bairro [deduzido]) e zona, mas não tem
  cidade, CEP nem raio. [deduzido] A tabela de bairros da configuração do
  delivery (seção 2.5) é outra lista, digitada à mão; não se sabe se as duas se
  falam.
- **Parâmetros** (ver [18](18-parametros-plano-comissoes.md) e
  [08](08-pessoas-empresa-acessos.md)): "tarifa do entregador" (grupo Vendas),
  uma opção com o rótulo cru "Venda bloq frete" e preços por modalidade da venda
  (loja, retirada...).
- **Modalidade da venda** (relatório `vendas-vendedor-modalidade`, ver
  [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md)): a
  venda guarda a modalidade Retirada na loja (`retirada`), Entrega (`entrega`) ou
  Loja / PDV (`loja`).
- **Relatório `delivery-pedidos`** (4 filtros, "pedidos de delivery: origem,
  frete e status"), que existe só na Central de relatórios, não no menu; catálogo
  em [19](19-relatorios-vendas-financeiro.md).
- O manual tem o cartão "Delivery Próprio" (`mod-delivery`), resumido em
  [22-manual.md](22-manual.md).

### 1.1 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/dashboard/modulo/delivery` | Delivery (hub) | recusada |
| `/delivery-admin` | Dashboard do delivery | não aberta |
| `/delivery-admin/pedidos` | Pedidos Delivery | não aberta |
| `/delivery-admin/entregadores` | Entregadores | não aberta |
| `/delivery-admin/configuracao` | Configuração de entrega | lida |
| `/delivery/app` | PWA Entregador | só login (primeira tentativa recusada; aberta numa passagem posterior) |

## 2. Telas

### 2.1 `/dashboard/modulo/delivery` — Delivery (hub) [recusada]

A primeira navegação do grupo foi recusada pelo classificador do modo automático
do Claude Code ("Third-Party Attack"). Pelo padrão dos outros hubs, deve ser uma
página de cartões com "Adicionar aos atalhos" [deduzido]. Nada visto.

### 2.2 `/delivery-admin` — Dashboard do delivery [não aberta]

Destino do link "Voltar para o delivery" da tela de configuração.

**Perguntas a responder:** que indicadores mostra (pedidos do dia, em rota,
atrasados, tempo médio, entregadores ativos); se tem mapa.

### 2.3 `/delivery-admin/pedidos` — Pedidos Delivery [não aberta]

**O que se sabe:** [afirmado pelo manual] os pedidos dos canais são
"sincronizados"/reunidos no delivery-admin. O relatório `delivery-pedidos` fala
em "origem, frete e status".

**Perguntas a responder:** de que canais vêm (loja virtual, cardápio, balcão,
WhatsApp, Mercado Livre?); estados do pedido; como se atribui o entregador;
taxa de entrega cobrada; se o pedido é a mesma venda do ERP (como na loja) ou um
registro à parte; ligação com o "Balcão de entrega" (`/balcao-entrega`, ver
[02-vendas-pdv.md](02-vendas-pdv.md)) e com o Painel TV.

### 2.4 `/delivery-admin/entregadores` — Entregadores [não aberta]

**O que se sabe:** [visto no PWA] o entregador entra com telefone e PIN.
[afirmado pelo manual] Os entregadores são cadastrados e recebem corridas.

**Perguntas a responder:** campos (nome, telefone, PIN, veículo, ativo); se o
entregador é uma Pessoa/colaborador do ERP ou um cadastro à parte; como se
calcula e paga a "tarifa do entregador" (parâmetro); acerto de corridas.

### 2.5 `/delivery-admin/configuracao` — Configuração de entrega [visto]

**Objetivo:** definir como o Delivery Próprio calcula o frete **desta empresa**.
Link "Voltar para o delivery" (→ `/delivery-admin`).

**Formulário** (um só; gravação por PUT na mesma URL [código]):

| Campo | Tipo | Obrigatório | Opções / regras |
| --- | --- | --- | --- |
| Calcular entrega por (`modo`) | select | sim | `km` = Quilômetro (valor por km) · `bairro` = Bairro (valor fixo por bairro). Ajuda: só uma forma vale para os **novos** pedidos |
| Valor por km | número (R$) | não | mínimo 0, passo 0,01. Atual: 0,00 |
| Valor mínimo da entrega | número (R$) | não | mínimo 0, passo 0,01. Atual: 0,00 |
| Frete grátis acima de | número (R$) | não | mínimo 0, passo 0,01; zero desliga. Atual: 0,00 |
| Bairros (tabela) | linhas repetíveis | não | cada linha: **Nome do bairro** (texto, até 100 caracteres) + **Valor da entrega** (número ≥ 0, passo 0,01) + botão remover. Botão "Adicionar bairro" cria linha nova |

Botão "Salvar configuração" (não clicado).

**Regras e comportamento:**

- [visto] Trocar o select só alterna o cartão que aparece ("Cobrança por
  quilômetro" ou "Cobrança por bairro"); nada é gravado até salvar.
- [visto] "Valor mínimo" e "Frete grátis acima de" só existem no cartão do modo
  km. No modo bairro há só nome + valor fixo.
- [visto] A busca do bairro do cliente na tabela **ignora maiúsculas e
  minúsculas** (texto de ajuda). Nada indica tratamento de acentos ou erros de
  digitação.
- [visto] A lista de bairros começa vazia, com mensagem pedindo para adicionar.
- [deduzido] Modo km: frete = distância × valor por km, nunca abaixo do mínimo;
  zera quando o pedido passa do limite de frete grátis.
- [a verificar] Bairro não encontrado: bloqueia o pedido? cobra zero?
- [visto] Os campos de texto do ERP passam para MAIÚSCULAS automaticamente
  (regra global, ver 22), o que afeta os nomes de bairro digitados.
- **Não há nesta tela:** endereço de origem, raio máximo de entrega, faixas de
  km, taxa por CEP, tempo estimado, horários, simulador de frete. [deduzido] A
  distância deve vir do endereço da empresa e de algum serviço de mapas (não
  visto).
- [visto] A Loja Virtual mostra o mesmo bloco de frete com os mesmos valores.
  [deduzido, não confirmado] É o mesmo registro (gravar numa tela muda a outra).
  O manual diz que o frete da loja se configura em "loja-admin" (ver 06).

### 2.6 `/delivery/app` — PWA do entregador [só login]

Na primeira passagem, a navegação foi recusada pelo classificador do modo
automático; numa passagem posterior abriu pelo botão "Abrir módulo" do manual.

- Login do entregador com **telefone** (máscara de celular) e **PIN**; botão
  "Entrar" (não clicado) [visto].
- O endereço **não tem o identificador da empresa** (`{slug}`), ao contrário dos
  outros PWAs [visto].
- [a verificar] Se o entregador é único entre empresas, identificado pelo
  telefone.
- [afirmado pelo manual] O entregador usa GPS e prova de entrega no app.
- Telas internas não vistas (exigem credenciais, que não foram usadas).

## 3. Fluxos de ponta a ponta

1. **Delivery próprio [afirmado pelo manual, salvo indicação]:**
   1. Configurar o frete (por km ou por bairro) [visto, seção 2.5].
   2. Os pedidos dos canais são reunidos no delivery-admin.
   3. Cadastrar os entregadores.
   4. Atribuir as corridas.
   5. O entregador entra no PWA com telefone e PIN [visto] e usa GPS e prova de
      entrega.
2. **Pedido com frete na loja virtual** [deduzido]: o frete do pedido da loja é
   calculado pela mesma regra (km com mínimo e frete grátis, ou valor fixo por
   bairro). A relação entre o pedido da loja e os entregadores do Delivery não
   foi vista (ver [06](06-loja-virtual-mercado-livre.md)).
3. **Pedidos do cardápio para entrega** [a verificar]: o relatório
   `cardapio-pedidos` fala em pedidos "mesa ou delivery" (ver
   [04-cardapio-comanda-cozinha.md](04-cardapio-comanda-cozinha.md)).

## 4. Entidades e relações

| Entidade | Campos (vistos ou prováveis) | Relações |
| --- | --- | --- |
| Configuração de entrega | modo (km ou bairro), valor por km, valor mínimo, frete grátis acima de [visto] | 1–1 com a empresa; usada pelo Delivery **e** pela Loja [deduzido] |
| Bairro de entrega | nome (até 100), valor fixo [visto] | N–1 com a configuração de entrega; não ligado ao cadastro `/bairros` [a verificar] |
| Entregador | telefone, PIN [visto no login]; GPS [afirmado pelo manual] | 1–N corridas; sem empresa no endereço do app |
| Corrida | prova de entrega [afirmado pelo manual] | ligada a um pedido |
| Pedido de delivery | origem, frete, status (pela descrição do relatório) | [a verificar] é uma venda do ERP com modalidade "entrega" |
| Venda | modalidade (retirada, entrega, loja/PDV) [visto no filtro de relatório] | ver [02](02-vendas-pdv.md) |

## 5. Integrações

- **Serviço de mapas/distância** [pressuposto]: necessário para o frete por km;
  nenhuma chave nem endereço de origem aparece nas telas vistas.
- **GPS e prova de entrega** [afirmado pelo manual], no PWA do entregador.
- **PWA (instalação)** [visto]: app do entregador.
- [deduzido] Não aparece integração com iFood nem 99Food em nenhuma tela vista
  nem no manual.

## 6. Oportunidades de UX

1. **Frete configurado em dois lugares** (Delivery e Loja) com os mesmos dados,
   e ainda um cadastro de bairros com tarifa em Cadastros. Confunde.
   [proposta] Uma única tela "Área de entrega e taxas" usada por todos os
   canais, com exceções por canal só se fizer falta.
2. **Bairro escrito à mão**, comparado só ignorando maiúsculas e minúsculas:
   frágil com acentos, abreviações e erros de digitação. [proposta] Lista de
   bairros da cidade (base IBGE, bairro ligado à cidade), faixas de CEP ou desenho
   da área no mapa, com **simulador de frete** na própria tela.
3. **Modo km sem raio máximo nem faixas**, e mínimo/frete grátis só no modo km.
   [proposta] Faixas de distância, raio máximo, pedido mínimo e frete grátis
   válidos para qualquer modo.
4. **App do entregador sem empresa no endereço** e com login próprio (telefone +
   PIN), diferente do garçom, do ponto e do colaborador. [proposta] Um acesso só
   para a equipe da loja, com perfil e PIN, gerido numa tela "Equipe".
5. **Tudo em MAIÚSCULAS** nos nomes de bairro. [proposta] Guardar como foi
   escrito.

## 7. Pendências

- **Telas por abrir:** hub (recusado), `/delivery-admin`,
  `/delivery-admin/pedidos`, `/delivery-admin/entregadores`; interior do PWA do
  entregador.
- **Recusas:** o classificador do modo automático do Claude Code ("Third-Party
  Attack") recusou `/dashboard/modulo/delivery` numa passagem e `/delivery/app`
  em outra. Não foi problema de login nem de credencial (outras telas abriram com a
  mesma sessão). Não houve nova tentativa por outro caminho; nada foi clicado nem
  gravado. Completar depende de o dono da conta autorizar a leitura.
- **Afirmações do manual não testadas:** GPS e prova de entrega; reunião dos
  pedidos dos canais no delivery-admin; atribuição de corridas.
- **Perguntas abertas:** como a distância é calculada (origem, serviço de mapas);
  se o frete grátis vale no modo bairro; o que acontece com bairro não
  cadastrado; se o frete da loja e do delivery são o mesmo registro; se o
  entregador é único entre empresas; ligação com `/bairros`, com a "tarifa do
  entregador" e com o balcão de entrega.
- **Ações vistas e não clicadas:** "Salvar configuração", "Adicionar bairro",
  "Entrar" no PWA.

## 8. Sub-rotas descobertas

| Rota | Origem | Situação |
| --- | --- | --- |
| `/delivery-admin` | link "Voltar para o delivery" | não aberta |
| `/delivery-admin/pedidos`, `/delivery-admin/entregadores` | menu | não abertas |
| `/manual#mod-delivery` | cartão do manual | ver [22](22-manual.md) |
| `/relatorios/delivery-pedidos` | Central de relatórios | ver [19](19-relatorios-vendas-financeiro.md) |
