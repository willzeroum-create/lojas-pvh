# 97 — Lacunas, lote 8: transferências, balanços, histórico de estoque, compras, produção e desossa (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03. Nenhuma das 12 telas
> deste lote abriu. Este arquivo **não descreve o ERP**. Ele explica, bem
> simples, por que parou, diz o que você precisa fazer e deixa pronto o
> roteiro da próxima visita.

## Explicando bem simples

1. **Seu login está certo.** A conta "Boi Criolo" está logada no navegador
   embutido. Você **não** precisa mandar a credencial de novo. E não mande
   senha no chat: o agente não usa senha.
2. **O problema não é a senha. É um "porteiro".** O Claude Code, no modo
   automático, tem um porteiro de segurança. Antes de o Claude abrir um site,
   o porteiro olha e decide: pode ou não pode.
3. **O porteiro disse "não pode" para o site da Olímpia.** O motivo que ele
   deu foi "Third-Party Attack", que quer dizer "isto pode prejudicar outra
   empresa". Ele não sabe que a conta é sua. Ele só vê o Claude vasculhando o
   sistema de outra empresa.
4. **O porteiro não pede senha.** Por isso mandar a senha não muda a resposta
   dele. A página nem chegou a abrir.
5. **O Claude não pode passar por cima do porteiro**, nem pela porta dos
   fundos (outra aba, a sua aba, outro navegador, outra ferramenta). Isso
   seria desobedecer à segurança. Por isso o agente parou.
6. **Só você manda no porteiro.** Você pode dizer a ele "deixa passar". O
   como está logo abaixo.
7. **Prova de que o login funciona:** hoje, em outras tentativas, o porteiro
   deixou abrir algumas telas (arquivos 04, 13, 14 e 20 desta pasta). Ele
   decide caso a caso. Desta vez disse não.

## O que você precisa fazer (3 passos)

1. **Liberar o porteiro.** Escolha A ou B:
   - **A. Aprovar na hora (mais simples).** Desligue o modo automático só
     para esta tarefa e use o modo normal, que pergunta antes de agir. Quando
     o Claude for abrir `erp.olimpiasistemas.com.br`, aparece um pedido de
     permissão. Clique em **Permitir**.
   - **B. Deixar liberado nas configurações.** Crie o arquivo
     `.claude/settings.local.json` na pasta do projeto (hoje ele não existe)
     com este conteúdo:

     ```json
     {
       "permissions": {
         "allow": [
           "mcp__Claude_Browser__navigate",
           "mcp__Claude_Browser__preview_start"
         ]
       }
     }
     ```

     Atenção: esta regra libera o navegador embutido para **qualquer site**,
     não só para a Olímpia. Quando a pesquisa acabar, apague o arquivo.
2. **Fechar as abas que você não usa** no navegador embutido. Há 9 abas
   abertas, duas delas em branco, e o pedido de aba nova falhou. O aviso cita
   "limite de abas atingido" como uma das causas possíveis.
3. **Mandar rodar de novo só o lote 8.** Este arquivo será trocado pelo
   relatório completo.

O agente não faz os passos 1 e 2 sozinho. Permissões e abas são decisão sua.

## O que aconteceu (registro técnico)

- Data: 2026-10-03.
- Pedido de aba própria (`tabs_create`): **falhou** com a mensagem "Could not
  open a new tab (Browser pane gone, gate off, or tab cap reached)". O painel
  do navegador estava aberto e visível.
- Abas abertas no momento (`tabs_context`), 9 no total: `seed`
  (localhost:3000), `tab-1` e `tab-31` (ERP Olímpia), `tab-7` (PagBank para
  desenvolvedores), `tab-26` (site institucional da Olímpia), `tab-28`
  (Facebook para desenvolvedores), `tab-29` (Instagram), `tab-34` e `tab-35`
  (em branco). Nenhuma é deste agente e nenhuma foi tocada.
- Pedido para abrir uma aba nova já na primeira rota (`preview_start` com
  `https://erp.olimpiasistemas.com.br/transferencias`): **recusado** pelo
  classificador do modo automático, motivo "Third-Party Attack". A recusa
  acontece antes da execução: nada carregou e a sessão logada não foi usada.
- A recusa vale para o resultado (abrir o ERP), não só para aquele pedido.
  Por isso não houve outra tentativa: nem as outras 11 rotas, nem outra aba,
  nem outro navegador, nem o manual, nem baixar a página.
- Nada foi clicado, digitado ou gravado no ERP. Nenhuma aba deste agente
  ficou aberta, porque nenhuma chegou a ser criada.

## Rotas do lote

| Rota | Módulo | Estado |
| --- | --- | --- |
| `/transferencias` | Estoque | não aberta: recusada pelo porteiro (classificador) |
| `/balancos` | Estoque | não aberta (mesmo site, não tentada) |
| `/estoque-log` | Estoque | não aberta (mesmo site, não tentada) |
| `/dashboard/modulo/compras` | Compras | não aberta (mesmo site, não tentada) |
| `/compras` | Compras | não aberta (mesmo site, não tentada) |
| `/compras/solicitacoes` | Compras | não aberta (mesmo site, não tentada) |
| `/compras/cotacoes` | Compras | não aberta (mesmo site, não tentada) |
| `/compras/pedidos` | Compras | não aberta (mesmo site, não tentada) |
| `/dashboard/modulo/producao` | Produção | não aberta (mesmo site, não tentada) |
| `/producao/ordens` | Produção | não aberta (mesmo site, não tentada) |
| `/producao/desossas/nova` | Produção / desossa | não aberta (mesmo site, não tentada) |
| `/producao/desossas` | Produção / desossa | não aberta (mesmo site, não tentada) |

Sub-rotas descobertas: nenhuma.

## O que a pesquisa já sabe sobre estas telas

Quase nada. Os arquivos destes módulos também pararam no porteiro:
`09-estoque.md` (transferências, balanços, histórico), `10-compras-producao.md`
(compras, produção, desossa) e `21-relatorios-estoque-compras-fiscal.md`
(relatórios de estoque e compras).

O pouco que foi visto no ERP veio de outra tela, a de notas fiscais
(arquivo `13-fiscal.md`):

- A nota pode nascer de um registro de **saída** (não só de uma venda), e a
  lista de operações fiscais inclui **TRANSFERÊNCIA** e **DEVOLUÇÃO COMPRA**.
  Na devolução de compra, a chave da NF-e do fornecedor vai na aba de nota
  referenciada. Se a tela de transferências gera ela própria essa nota
  **ainda está por verificar**.
- O menu tem uma rota de produção para o SPED: `/producao/sped-bloco-k`.
- O menu de Estoque → Movimentações tem Entrada de XML (`/entradas-xml`) e
  Entrada Manual (`/entradas-manual`).

## Seções do relatório que ficam vazias

Visão geral dos módulos, telas (listas, colunas, filtros, formulários e
opções), regras de negócio, fluxos de ponta a ponta, entidades e relações,
integrações e observações de UX: **sem dados**. Nada disso pode ser escrito
sem abrir as telas, e este arquivo não inventa.

## Roteiro da próxima visita

As perguntas detalhadas já estão em `09-estoque.md` (transferências,
balanços, histórico) e em `10-compras-producao.md` (compras, produção,
desossa). Em cada tela: abrir a lista, os filtros e o "Novo", ler todos os
campos e as opções de cada lista e fechar **sem gravar**. Pontos a mais
deste lote:

- `/transferencias`: origem e destino (depósito ou filial); se gera NF-e com a
  operação TRANSFERÊNCIA quando o CNPJ muda; se existe estoque "em trânsito" e
  confirmação de recebimento no destino; estados e estorno.
- `/balancos`: balanço total ou parcial; como se conta (digitação, leitor,
  coletor, planilha); comparação contado × sistema; ajuste automático;
  estados e quem finaliza.
- `/estoque-log`: que movimentos aparecem; colunas (saldo antes e depois,
  usuário, documento de origem); filtros; exportação.
- `/dashboard/modulo/compras`: cartões, indicadores e itens de menu do módulo.
- `/compras`: se é painel ou lista, e como se liga a solicitações, cotações e
  pedidos.
- `/compras/solicitacoes`: quem pede, itens, aprovação, estados, se vira
  cotação.
- `/compras/cotacoes`: fornecedores consultados, preço por item, comparação,
  escolha do vencedor (por item ou pelo total), se vira pedido.
- `/compras/pedidos`: fornecedor, itens, prazo e condição de pagamento,
  estados; ligação com a Entrada de XML, o estoque e o contas a pagar.
- `/dashboard/modulo/producao`: cartões e menu do módulo (se inclui o SPED
  bloco K).
- `/producao/ordens`: produto e quantidade; ficha técnica ou receita; baixa
  dos insumos; perdas; custo; estados.
- `/producao/desossas/nova`: peça de entrada (carcaça ou quarto, peso, custo,
  lote, fornecedor); cortes de saída com peso; uso de balança; rendimento (%)
  e rateio do custo por corte; ossos, sebo e aparas. Só ler, sem salvar.
- `/producao/desossas`: colunas, filtros, totais, estados e o que mostra ao
  abrir um registro.

## Pendências

1. Liberar o porteiro (opção A ou B acima). Só o usuário pode fazer isso.
2. Fechar as abas sem uso no navegador embutido.
3. Rodar de novo o lote 8 e substituir este arquivo pelo relatório completo.
4. Opcional: conferir se os termos de uso da conta Olímpia permitem esta
   análise. É o tipo de risco que o porteiro aponta.
5. Outros arquivos desta pasta também estão como não explorados (03, 05, 06,
   08, 09, 10, 11, 12, 15, 16, 17, 19, 21, 22, 90 e 91). Liberar o porteiro
   uma vez deve destravar todos.
