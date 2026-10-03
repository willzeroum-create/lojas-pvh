# 94 — Lacunas, lote 5: Mercado Livre, produtos e cadastros de apoio (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03.
> Nenhuma das 12 telas deste lote abriu. O Claude Code recusou a navegação já
> na primeira rota. Este arquivo **não descreve o ERP**: registra o que
> aconteceu, o que só você pode decidir e o que a próxima passagem precisa
> responder. Nada aqui foi visto no sistema da Olímpia.

## Em palavras simples

1. **A credencial está certa. Não precisa mandar de novo.** O problema não é
   login, senha nem sessão. A página nem chegou a carregar, então a sessão que
   você deixou aberta no navegador nem foi usada.
2. **Quem barrou foi uma trava de segurança do próprio Claude Code.** No modo
   automático, um verificador confere cada ação antes de ela acontecer. Ele
   recusou abrir a página da Olímpia com o motivo "Third-Party Attack" (ação
   contra um terceiro). Ou seja: ele entendeu que levantar a fundo o sistema de
   outra empresa, para reconstruí-lo, pode prejudicar essa empresa.
3. **O agente não pode desligar nem contornar essa trava.** Abrir a mesma coisa
   por outra aba, outro navegador ou outra ferramenta seria fazer exatamente o
   que ela proibiu. Por isso parei na primeira recusa.
4. **Só você decide se libera.** As opções estão em "Como destravar". Depois,
   basta rodar este lote de novo.

## O que aconteceu, passo a passo

1. O navegador embutido estava com 9 abas abertas, que é o limite. Várias eram
   de outros agentes rodando ao mesmo tempo. Esperei abrir uma vaga, sem mexer
   em nenhuma aba de outra pessoa, e criei a minha própria aba.
2. Mandei abrir a primeira rota do lote:
   `https://erp.olimpiasistemas.com.br/integracoes/mercado-livre/pedidos`.
3. O verificador do modo automático do Claude Code **recusou** a navegação, com
   o motivo "Third-Party Attack". A recusa vale para o objetivo (levantar o
   sistema da Olímpia), não só para aquela página.
4. Por isso não tentei as outras 11 rotas, não usei as abas de outras pessoas e
   não tentei nenhum outro caminho.
5. Fechei a minha aba. No ERP nada foi lido, clicado, digitado ou gravado.

## Como destravar (decisão sua)

Mandar a credencial de novo **não resolve**, porque ela não é o problema. O que
falta é uma **permissão**, e só você pode dar. Se decidir seguir, escolha uma
opção e rode o lote de novo:

- **Opção A, aprovar na hora:** rodar este lote com o modo automático
  desligado (modo normal de permissões). Quando o Claude for abrir uma página
  da Olímpia, aparece um pedido de permissão. Você clica em "Permitir".
- **Opção B, regra nas configurações:** acrescentar nas configurações do
  Claude Code uma regra que permita a ferramenta de navegação do navegador
  embutido (`mcp__Claude_Browser__navigate`). Atenção: essa regra vale para
  qualquer site, não só para a Olímpia.

A conta é sua, mas o sistema é da Olímpia. Se houver dúvida sobre o que é
permitido, os termos de uso dela dizem. Este agente não muda permissões nem
configurações por conta própria.

**Dica de operação:** o navegador embutido aceita no máximo 9 abas. Quando
vários lotes rodam ao mesmo tempo, eles disputam vaga e alguns falham ao criar
a aba. Rodar menos lotes em paralelo evita isso.

## Rotas do lote

A coluna do meio é só o que o nome da rota sugere. **Não foi confirmado na
tela.**

| Rota | O que o nome sugere | Estado |
| --- | --- | --- |
| `/integracoes/mercado-livre/pedidos` | pedidos vindos do Mercado Livre | **recusada** pelo verificador ("Third-Party Attack") |
| `/integracoes/mercado-livre/anuncios` | anúncios no Mercado Livre | não aberta (mesma recusa) |
| `/integracoes/mercado-livre/config` | ligação e padrões da integração | não aberta (mesma recusa) |
| `/integracoes/mercado-livre/documentacao` | ajuda da integração | não aberta (mesma recusa) |
| `/produtos` | cadastro de produtos | não aberta (mesma recusa) |
| `/produtos/gerenciamento` | gestão de produtos (talvez em massa) | não aberta (mesma recusa) |
| `/fabricantes` | cadastro de fabricantes | não aberta (mesma recusa) |
| `/produto-cores` | cadastro de cores | não aberta (mesma recusa) |
| `/grades` | grades de tamanho | não aberta (mesma recusa) |
| `/ncms` | tabela de NCM (classificação fiscal) | não aberta (mesma recusa) |
| `/golas` | tipos de gola (vestuário) | não aberta (mesma recusa) |
| `/mangas` | tipos de manga (vestuário) | não aberta (mesma recusa) |

**Sub-rotas descobertas:** nenhuma (nenhuma tela abriu).

---

## Visão geral do módulo

**Não observado.** Pelo nome das rotas, o lote junta dois assuntos:

1. a integração com o **Mercado Livre** (pedidos, anúncios, configuração e
   ajuda);
2. o **cadastro de produtos** e as tabelas de apoio dele (fabricantes, cores,
   grades, NCM, golas e mangas). Golas e mangas apontam para roupa/confecção,
   o que destoa do foco em alimentação. Falta confirmar para que servem.

O que outros relatórios desta pasta já registraram sobre estas rotas (vistos
em passagens anteriores, não nesta):

- `04-cardapio-comanda-cozinha.md`: no hub do Cardápio Digital, o cartão
  "Produtos no Cardápio" leva para `/produtos`. Aquele relatório deduz que o
  cardápio usa o mesmo cadastro de produtos do ERP.
- `13-fiscal.md`: o menu lista NCM (`/ncms`) entre os cadastros com impacto
  fiscal.
- `18-parametros-plano-comissoes.md`: a barra lateral tem atalho "Produtos"
  para `/produtos`, e existe uma tela de campos obrigatórios
  (`/parametros/campos-obrigatorios`, não aberta).
- `21-relatorios-estoque-compras-fiscal.md`: há relatórios de produtos e de
  Mercado Livre no menu (`/relatorios/produtos-cadastro`,
  `/relatorios/produtos-lista-precos`, `/relatorios/ml-pedidos`,
  `/relatorios/ml-anuncios`), também não visitados.
- `06-loja-virtual-mercado-livre.md`: as mesmas 4 rotas do Mercado Livre já
  estavam pendentes.

## Telas: o que a próxima passagem precisa responder

São **perguntas**, não constatações. Servem de roteiro para quando a navegação
for liberada.

### `/integracoes/mercado-livre/pedidos`

- Como os pedidos chegam: sozinhos (aviso do Mercado Livre), sincronização de
  tempos em tempos ou botão manual? Quanto demoram?
- Colunas e filtros: número do pedido, data, comprador, itens, valor, frete,
  tarifa do Mercado Livre, situação do pagamento e do envio, conta (se houver
  mais de uma).
- O pedido vira venda no ERP? Sozinho ou com um clique? Quando baixa o
  estoque? O que acontece se o item não estiver ligado a um produto?
- Emite NF-e a partir do pedido? Manda a nota de volta para o Mercado Livre?
- Imprime a etiqueta de envio? Em que formato (PDF ou impressora térmica)?
- Como aparecem cancelamento, devolução e reclamação, e o que fazem no estoque
  e no financeiro?
- Gera conta a receber? Com que data (liberação do dinheiro) e com a tarifa
  descontada?

### `/integracoes/mercado-livre/anuncios`

- Colunas: código do anúncio, título, preço, estoque, situação (ativo,
  pausado, encerrado), tipo de anúncio, produto do ERP ligado.
- Dá para publicar um produto do ERP como anúncio novo ou só ligar anúncios
  que já existem?
- Campos ao publicar: categoria, atributos exigidos pela categoria, condição
  (novo/usado), fotos, garantia, frete.
- A grade do ERP (cor × tamanho) vira variações do anúncio?
- Preço e estoque sincronizam sozinhos? Em que sentido? Existe preço próprio
  para o Mercado Livre (acréscimo em %)?
- Ações em massa: pausar, reativar, atualizar preço e estoque.

### `/integracoes/mercado-livre/config`

- Como se liga a conta: autorização no site do Mercado Livre? Aceita mais de
  uma conta?
- Padrões usados na importação: cliente, vendedor, filial, depósito de
  estoque, tabela de preço, operação fiscal e série, forma de pagamento.
- Interruptores: importar pedidos sozinho, baixar estoque, emitir nota,
  sincronizar preço e estoque.
- Mostra a situação da ligação (conectado, último sincronismo, erros)?

### `/integracoes/mercado-livre/documentacao`

- É um manual dentro do ERP? Que passos e limites descreve (o que a integração
  faz e o que não faz)?

### `/produtos`

- Lista: colunas, busca (nome, código, código de barras), filtros (grupo,
  subgrupo, fabricante, ativo/inativo, com/sem estoque, canal), ações por linha
  e em massa, exportação, impressão de etiquetas.
- Formulário "Novo": quais abas e campos existem? Por exemplo dados gerais
  (descrição, código, código de barras, unidade, grupo, fabricante), preços
  (custo, margem, preço de venda, promoção, atacado), estoque (mínimo, máximo,
  lote/validade, produto de balança), fiscal (NCM, CEST, origem, CST/CSOSN,
  CFOP, PIS/COFINS, IPI), grade (cor × tamanho), fotos, canais (loja virtual,
  cardápio, Mercado Livre), ficha técnica, adicionais do cardápio, comissão.
- Quais campos são obrigatórios? A tela `/parametros/campos-obrigatorios`
  controla isso?
- Regras: como preço e margem se calculam um a partir do outro, geração de
  código de barras interno, validação do NCM, bloqueio de código repetido.
- Que sub-rotas existem (página de novo produto, página de detalhe/edição)?

### `/produtos/gerenciamento`

- O que é: alteração em massa (preço, NCM, grupo, ativo/inativo), reajuste em
  %, importação ou exportação por planilha?
- Mostra uma prévia antes de aplicar? Guarda histórico de quem mudou o quê?

### `/fabricantes`

- Que campos tem (nome, CNPJ, contato)? Serve só para filtro e relatório ou
  aparece na nota e no anúncio (marca)?

### `/produto-cores`

- Que campos tem (nome, código, amostra da cor)? Onde a cor é usada: grade do
  produto, variações do Mercado Livre, loja virtual?

### `/grades`

- O que é uma grade: uma lista de tamanhos (P, M, G; 36 a 44)? Combina com as
  cores para formar cada variação vendável?
- Cada variação tem código de barras, estoque e preço próprios?
- Dá para trocar a grade de um produto que já tem estoque?

### `/ncms`

- A tabela vem pronta (oficial) ou a empresa cadastra? Que campos tem (código
  de 8 dígitos, descrição, CEST, percentuais aproximados de imposto para
  mostrar na nota)?
- Valida o código contra a tabela oficial? Atualiza sozinha?
- O NCM é obrigatório no produto para emitir NF-e e NFC-e?

### `/golas` e `/mangas`

- São cadastros simples (só nome)? Onde entram: no produto, no pedido
  personalizado ou na ordem de produção (confecção de uniformes)?
- Mudam o preço (por exemplo, manga longa mais cara)?

## Fluxos de ponta a ponta

**Não observados.** Perguntas a responder:

- Mercado Livre: pedido chega → vira venda → baixa estoque → nota fiscal →
  etiqueta → recebimento. Quais passos são automáticos e quais são manuais?
- Catálogo: cadastrar produto → definir grade e cores → publicar ou ligar
  anúncio → manter preço e estoque iguais nos dois lados.

## Entidades e relações

**Não observadas.** Perguntas a responder:

- O produto se liga a fabricante, cor, grade, NCM, gola e manga? Com quantos de
  cada (um ou vários)?
- Como o anúncio e o pedido do Mercado Livre se ligam ao produto e à venda do
  ERP?

## Integrações

**Não observadas.** O nome das rotas mostra uma integração com o Mercado Livre.
O NCM é exigido nas notas fiscais (SEFAZ). Como cada integração funciona por
dentro ainda está por ver.

## Observações de UX

Nenhuma: nenhuma tela foi vista.

## Pendências

1. **As 12 rotas do lote** estão por visitar. A primeira foi recusada pelo
   verificador do modo automático do Claude Code ("Third-Party Attack"). As
   outras 11 não foram tentadas, porque a recusa vale para o objetivo inteiro.
2. **Decisão do dono da conta:** liberar ou não a navegação no site da Olímpia
   (opções em "Como destravar"). Mandar a credencial de novo não muda nada.
3. **Limite de 9 abas** no navegador embutido: com muitos lotes em paralelo, os
   agentes disputam vaga. Convém rodar menos lotes ao mesmo tempo.
4. Quando a navegação for liberada, este arquivo deve ser substituído pelo
   relatório completo, seguindo as perguntas acima.
