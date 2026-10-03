# ERP Olímpia: Compras, produção e desossa

> **Estado: NÃO EXPLORADO.** Nenhuma tela deste grupo chegou a abrir.
> Tudo o que este arquivo deveria trazer (telas, campos, regras, fluxos,
> entidades, integrações) depende de ver o ERP, por isso nada aqui está
> escrito como fato.

## O que aconteceu (2026-10-03)

1. Abri uma aba só minha no navegador embutido do Claude. A aba do usuário
   não foi tocada.
2. Mandei abrir a primeira rota do grupo:
   `https://erp.olimpiasistemas.com.br/dashboard/modulo/compras`.
3. O sistema de permissões do Claude Code (modo automático) **recusou a
   navegação** para o site `erp.olimpiasistemas.com.br`, com o motivo
   "Third-Party Attack".
4. **O login não tem nada a ver com isso.** A página nem começou a carregar:
   a recusa acontece antes, na permissão da ferramenta de navegação do
   Claude. A credencial que já está no navegador continua valendo e não
   precisa ser enviada de novo.
5. A recusa vale para o site inteiro. Por isso não tentei as outras 13 rotas
   nem outros caminhos (outro navegador, baixar a página etc.). Fechei a
   minha aba e parei.

É o mesmo bloqueio registrado no grupo de delivery (`05-delivery.md`).
Enquanto a permissão não for dada, todos os grupos desta pesquisa vão parar
no mesmo ponto.

## Rotas do grupo (todas por visitar)

| Rota | Parte do módulo | Estado |
| --- | --- | --- |
| `/dashboard/modulo/compras` | Compras | não visitada: navegação recusada pela permissão |
| `/compras` | Compras | não visitada |
| `/compras/solicitacoes` | Compras | não visitada |
| `/compras/cotacoes` | Compras | não visitada |
| `/compras/pedidos` | Compras | não visitada |
| `/dashboard/modulo/producao` | Produção | não visitada |
| `/producao/ordens` | Produção | não visitada |
| `/producao/desossas/nova` | Desossa | não visitada |
| `/producao/desossas` | Desossa | não visitada |
| `/producao/desossa-fichas` | Desossa | não visitada |
| `/producao/desossas-relatorios` | Desossa | não visitada |
| `/producao/desossas-produtos-derivados` | Desossa | não visitada |
| `/producao/desossas-rendimentos` | Desossa | não visitada |
| `/producao/desossa-config` | Desossa | não visitada |

Nenhuma sub-rota foi descoberta, porque nenhuma página carregou.

## O que é preciso para continuar

Quem resolve é o dono da conta, **nas permissões do Claude Code** (não no
ERP e não no login do navegador):

- **Opção A:** rodar este grupo fora do modo automático e, quando o Claude
  pedir para navegar em `erp.olimpiasistemas.com.br`, clicar em permitir.
- **Opção B:** acrescentar nas configurações do Claude Code uma regra de
  permissão que libere a ferramenta de navegação do navegador embutido
  (`mcp__Claude_Browser__navigate`) para este trabalho.

Depois disso, rodar este grupo de novo. As regras de só leitura do pedido
original continuam valendo.

## Perguntas a responder quando a exploração for possível

Não são observações. São o que a próxima visita precisa esclarecer para dar
para reconstruir o módulo:

- **Compras:** a solicitação vira cotação e a cotação vira pedido? Há
  aprovação no meio, e de quem? Como se comparam fornecedores numa cotação e
  quem escolhe o vencedor? O pedido de compra se liga à entrada de nota
  (XML da NF-e), ao estoque e ao contas a pagar?
- **Ordens de produção:** de onde vem a receita ou ficha técnica, como os
  insumos saem do estoque, como se registra perda e quais são os estados da
  ordem?
- **Desossa:** como se informa a peça de entrada (carcaça ou quarto, peso,
  custo, lote, fornecedor)? Os pesos dos cortes vêm de balança ou são
  digitados? Como se calcula o rendimento de cada corte e o custo de cada
  corte (rateio por peso ou por valor de venda)? O que é uma "ficha" de
  desossa e o que fica na configuração? Como entram ossos, sebo e aparas
  (produtos derivados ou perda)? Os relatórios comparam o rendimento real
  com o esperado, por fornecedor ou por lote?
