# 90 — Lacunas, lote 1: dashboard, BI, Painel TV, vendas, PDV, venda mobile, balcão de entrega, faturamento e romaneios (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03. Nenhuma das 12 rotas
> deste lote foi aberta. Este arquivo registra o bloqueio, aponta o que o
> repositório já tem sobre estas telas e lista as perguntas para a próxima
> passagem. **Não traz nenhum fato novo sobre o ERP.**

## Em palavras simples

1. **A credencial não é o problema.** O login já está feito no navegador
   embutido. O agente nem chegou a usá-lo. Mandar a senha de novo não muda
   nada, e o agente não deve receber nem digitar senha.
2. **Quem barrou foi uma trava de segurança do próprio Claude Code**, o
   "classificador do modo automático". Ela confere cada ação antes de ela
   acontecer. Quando o agente pediu para abrir
   `https://erp.olimpiasistemas.com.br/dashboard`, ela disse **não**, com o
   motivo "Third-Party Attack" (ação que pode prejudicar um terceiro; aqui, o
   site da Olímpia).
3. **A trava não pergunta pela senha. Ela decide se o agente pode abrir o
   site.** Por isso dizer no chat que a credencial já está lá não a libera.
4. **O agente não pode desligar nem contornar essa trava.** A recusa vale para
   o objetivo (ler as telas da Olímpia), não só para aquele pedido. Tentar por
   outra aba, pela sua aba, por outro navegador ou por outra ferramenta seria
   fazer exatamente o que ela proibiu. Por isso o agente parou.
5. **Só você pode liberar.** Escolha uma opção:
   - **Opção A, aprovar na hora:** rodar este lote com o modo automático
     desligado (modo normal de permissões). Quando o Claude for abrir uma
     página da Olímpia, aparece um pedido de permissão. Você clica em
     "Permitir".
   - **Opção B, liberar nas configurações:** criar no Claude Code uma regra de
     permissão para as ferramentas do navegador embutido que abrem páginas
     (`mcp__Claude_Browser__navigate` e `mcp__Claude_Browser__preview_start`).
     Atenção: essa regra vale para qualquer site, não só para a Olímpia.
6. **Feche no navegador embutido as abas que não está usando.** Havia 9 abas
   abertas e o pedido de aba nova falhou com um aviso que inclui "limite de
   abas atingido" entre as causas possíveis.
7. Depois, rode de novo só este lote. Este arquivo será substituído pelo
   relatório completo.

## O que aconteceu (registro técnico)

- Data: 2026-10-03.
- Pedido de aba própria (`tabs_create`): **falhou** com a mensagem "Could not
  open a new tab (Browser pane gone, gate off, or tab cap reached)". O painel
  do navegador estava aberto, com 9 abas.
- Pedido para abrir uma aba nova já em `/dashboard` (`preview_start` com a
  URL): **recusado pelo classificador do modo automático**, motivo
  "Third-Party Attack". A recusa acontece antes da execução: nenhuma página
  carregou e a sessão logada não foi usada.
- Não houve nova tentativa por outro caminho (outra aba, a aba `tab-1` do
  usuário, outro navegador, outra ferramenta, outro endereço como o manual),
  porque a recusa vale para o resultado.
- Nenhuma aba deste agente ficou aberta: nenhuma chegou a ser criada. Nada foi
  clicado, digitado ou gravado no ERP.
- Durante a execução apareceu uma aba `tab-31` já na Olímpia. Não foi criada
  por este agente (o pedido dele foi recusado antes de executar) e não foi
  tocada. Deve ser do usuário ou de outro agente em paralelo.

## Rotas do lote: estado

A coluna "Nome visto antes" só usa nomes que outro relatório deste repositório
viu na tela. Onde está "—", nem o nome da tela é conhecido.

| Rota | Nome visto antes (fonte) | Estado |
| --- | --- | --- |
| `/dashboard` | destino de "Voltar ao dashboard" nos hubs (doc 18) | tentada; recusada pelo classificador |
| `/dashboard/modulo/bi` | — | não aberta (mesmo bloqueio) |
| `/bi` | — | não aberta |
| `/dashboard/modulo/painel-tv` | "Painel TV", grupo "Canais Digitais" do menu (doc 04) | não aberta |
| `/painel-tv-admin/link` | — | não aberta |
| `/painel-tv-admin/config` | — | não aberta |
| `/vendas` | "Venda Balcão" (docs 14 e 18) | não aberta |
| `/pdv` | "Venda PDV" (doc 18) | não aberta |
| `/garcom/mobile-venda` | "Venda Direta Mobile", seção "Operação do dia" (docs 04 e 18) | não aberta |
| `/balcao-entrega` | — | não aberta |
| `/financeiro/faturamento` | — | não aberta |
| `/romaneios` | — | não aberta |

Sub-rotas descobertas: **nenhuma** (nenhuma tela foi aberta).

## O que o repositório já tem sobre estas telas (só ponteiros)

Nada abaixo foi visto nesta passagem. São referências a relatórios anteriores,
para a próxima passagem não repetir trabalho.

- `18-parametros-plano-comissoes.md`: barra lateral com atalhos para Venda
  Balcão (`/vendas`), Venda PDV (`/pdv`) e Venda Direta Mobile
  (`/garcom/mobile-venda`); link "Voltar ao dashboard" (`/dashboard`) nos hubs
  de módulo; cabeçalho com busca de telas (Ctrl+K), novidades, notificações e
  assistente flutuante.
- `04-cardapio-comanda-cozinha.md`: "Painel TV" no grupo "Canais Digitais" do
  menu lateral, junto com Loja Virtual, Mercado Livre, Cardápio Digital e
  Delivery; "Venda Direta Mobile" na seção "Operação do dia".
- `14-os-forca-vendas.md`: o botão "Orçamento" da OS leva para `/vendas`; a
  entidade Rota serve à entrega (romaneio) e à força de vendas; o sistema
  antigo tinha a tela `FrmRomaneio_Rota`.
- `19-relatorios-vendas-financeiro.md`: relatórios de faturamento (lotes,
  vendas, por vendedor), bloqueados e não vistos.
- `21-relatorios-estoque-compras-fiscal.md`: relatório `estoque-romaneio`,
  bloqueado e não visto.
- `03-caixa.md` e `05-delivery.md`: caixa e delivery, prováveis vizinhos de
  `/pdv` e `/balcao-entrega`, também bloqueados.

## Visão geral, telas, fluxos, entidades, integrações e UX

**Sem constatações.** Nenhuma tela foi aberta, então não há colunas, filtros,
campos, regras, fluxos, entidades, integrações nem observações de UX para
registrar. Para não inventar, estas seções ficam vazias até a próxima
passagem. As perguntas abaixo dizem o que observar.

## Perguntas para a próxima passagem (não são fatos)

### `/dashboard`
- Que indicadores aparecem (vendas do dia, ticket médio, contas a pagar e a
  receber, estoque baixo, pedidos em aberto) e de que período.
- Se muda por perfil de usuário ou por empresa/filial, e se o usuário escolhe
  os blocos.
- Que avisos aparecem (certificado digital a vencer, mensalidade, notas
  rejeitadas, novidades).
- O que no menu é fixo e o que é configurável (seção "Fixados").

### `/dashboard/modulo/bi` e `/bi`
- Que painéis existem (vendas, margem, curva ABC, financeiro, estoque) e de
  que módulos vêm os dados.
- Filtros (período, filial, vendedor, categoria), comparação entre períodos,
  metas.
- Se o BI é próprio ou embutido de outra ferramenta; se exporta (PDF, Excel)
  ou agenda envio.
- Diferença entre o hub (`/dashboard/modulo/bi`) e a tela `/bi`.

### `/dashboard/modulo/painel-tv`, `/painel-tv-admin/link`, `/painel-tv-admin/config`
- O que a TV mostra: senhas ou pedidos prontos, cardápio, promoções, ranking.
- Como a TV se liga: link público, QR Code ou código de pareamento; se o link
  expira e se pode ser trocado ou revogado (só olhar, sem gerar).
- Opções de configuração: tempo de rotação, tema, mídias, som de chamada,
  quais setores ou pedidos entram.
- Ligação com cozinha, balcão de entrega e delivery.

### `/vendas` (Venda Balcão)
- Lista: colunas, filtros, estados (orçamento, pedido, faturado, cancelado) e
  totais.
- Formulário: cliente, vendedor, tabela de preço, condição e forma de
  pagamento, desconto (limite e liberação por senha ou perfil), frete,
  observações; itens com quantidade, preço e desconto.
- Transições: orçamento para venda; venda para nota (NF-e ou NFC-e); venda
  para contas a receber; reserva e baixa de estoque; comissão.
- Impressão (A4, cupom) e envio por WhatsApp.

### `/pdv` (Venda PDV)
- Se exige caixa aberto; atalhos de teclado; leitor de código de barras;
  balança.
- Formas de pagamento (dinheiro com troco, cartão por TEF ou POS, PIX com QR
  Code, crediário, vale, cashback) e pagamento dividido.
- NFC-e (contingência offline?), CPF na nota, cancelamento e permissão de
  supervisor.
- Sangria e suprimento dentro do PDV; tela cheia ou modo quiosque.

### `/garcom/mobile-venda` (Venda Direta Mobile)
- O que muda em relação ao PDV e à comanda do garçom.
- Se cobra no próprio celular, se emite NFC-e, se imprime em impressora
  remota, se usa mesa ou comanda.

### `/balcao-entrega`
- Se é a fila de pedidos prontos para retirada ou entrega; que estados tem e
  quem os muda.
- Ligação com cozinha, delivery, Painel TV e aviso ao cliente por WhatsApp.

### `/financeiro/faturamento`
- O que se fatura (vendas, pedidos, OS, mensalidades) e se é feito em lote.
- O que o faturamento gera: NF-e ou NFS-e, títulos a receber, boletos ou PIX;
  agrupamento por cliente; vencimentos; estados do lote.
- Relação com os relatórios de faturamento (lotes, vendas, por vendedor).

### `/romaneios`
- Como se monta um romaneio: pedidos ou vendas por rota, veículo, motorista e
  data; peso e volume; ordem de entrega.
- Estados (aberto, em rota, entregue, devolvido), baixa da entrega, acerto com
  o motorista, impressão; se emite MDF-e.
- Ligação com a Rota da força de vendas e com o relatório `estoque-romaneio`.
