# ERP modular — o que existe e como pôr a funcionar

> Construído a partir da exploração do ERP da Olímpia
> ([pesquisa/erp-olimpia/catalogo-funcional.md](pesquisa/erp-olimpia/catalogo-funcional.md))
> e da pesquisa de mercado ([pesquisa/README.md](pesquisa/README.md)).
> Diferencial: cada cliente recebe **só os módulos que usa**; a equipa liga e
> desliga na ficha do tenant no console (`/admin/tenants/{id}`, secção
> "Módulos do cliente").

## 1. Módulos

| Módulo | Estado | O que faz | Migração |
| --- | --- | --- | --- |
| Pedidos, Cardápio, Loja, Resumo, Conta | funcional | Fase 1: cardápio público, pedido no WhatsApp, painel | 0001–0008 |
| Clientes e fornecedores | funcional | Cadastro único, CPF/CNPJ (inclui alfanumérico), consulta CNPJ/CEP, ficha com histórico, LGPD | 0009, 0011 |
| Financeiro | funcional | Contas a pagar/receber em parcelas, baixas (estado calculado), estorno, carteiras, fluxo de 8 semanas, DRE do mês | 0010 |
| Caixa | funcional | Abertura com fundo, sangria/suprimento, fechamento cego, diferença registada, lança vendas no financeiro | 0012 |
| PDV | funcional | Venda de balcão por busca, leitor e etiqueta de balança, pagamento dividido, troco, comprovante, cancelamento | 0012 |
| Cozinha | funcional | KDS por estação, preparo por item, alerta de atraso, pedido pronto sozinho | 0013 |
| Mesas e comandas | funcional | Mapa de mesas, comanda no celular, juntar/transferir, conta com serviço opcional e divisão | 0013 |
| Estoque | funcional | Entrada pelo XML da NF-e (vínculo lembrado, fator CX12→12), saídas, estorno, inventário, mínimo, baixa automática na venda | 0014 |
| Produção / ficha técnica | funcional | Insumos, ficha por produto, CMV, margem e preço sugerido; baixa dos insumos na venda | 0014 |
| Equipe e PIN | funcional | PIN por pessoa no tablet da loja, papéis, aprovação do gerente, auditoria | 0015 |
| Resumo diário no WhatsApp | pré-funcional | Envio manual já funciona; automático às 22h precisa da API oficial (abaixo) | — |
| Fiscal, Bancos/Pix, Cobrança, Delivery, Fidelidade, OS, Ponto, Relatórios, Loja virtual, Marketplaces | planejado | No catálogo, visíveis no console como "em construção" | — |

Regras que atravessam tudo: dados sempre por `tenant_id` com RLS (provado em
`tests/bd/*.test.ts`); dinheiro nunca se apaga (estorno/cancelamento);
estados calculados pela base (parcela, caixa, preparo, saldo de estoque);
preços sempre do catálogo no servidor; ações sensíveis com PIN do gerente e
auditoria quando a equipe está ligada.

## 2. Pôr no ar (quando o Supabase voltar)

1. Projeto Supabase activo (Restore project, ou um novo — ver
   [operacao.md](operacao.md) §1).
2. Base de dados — uma das duas:
   - **projeto que já tinha 0001–0007**: correr por ordem no SQL Editor
     `supabase/atualizacao-0008.sql` … `atualizacao-0015.sql`;
   - **projeto novo**: `supabase/instalacao-completa.sql` e depois `supabase/seed.sql`.
3. Demonstração: `supabase/demo-erp.sql` liga todos os módulos prontos na
   Lanchonete da Praça, com mesas, estações, ficha técnica, estoque inicial e
   o gerente **Demo Gerente, PIN 2580**.
4. `pnpm tipos` regenera `src/lib/supabase/tipos.ts` a partir do projeto (os
   tipos foram escritos à mão enquanto a base estava fora; conferir o diff).
5. Variáveis novas (ver `.env.example` e `pnpm env:verificar`):
   `NEXT_PUBLIC_WHATSAPP_COMERCIAL`, `PVH_SEGREDO_EQUIPE` (opcional),
   `CRON_SECRET` e `WHATSAPP_*` (só para o resumo automático).

## 3. Roteiro de teste de ponta a ponta

Com `pnpm dev` (entra-se sem login em localhost) e a demonstração aplicada:

1. **Console** → ficha da Lanchonete → Módulos: ligar/desligar e ver o painel mudar.
2. **Equipe**: o painel pede "quem está operando?" → Demo Gerente, PIN 2580.
3. **Caixa**: abrir com R$ 100 de troco.
4. **PDV**: vender 2 refrigerantes (código 7894900011517) e um X-Salada; pagar
   parte em Pix, parte em dinheiro com troco → comprovante.
5. **Cozinha**: o X-Salada aparece na estação Cozinha → começar → pronto.
6. **Mesas**: abrir a mesa 3 → lançar itens → cozinha → fechar conta com 10%
   e dividir por 2.
7. **Estoque**: refrigerante desceu de 48 para 46; insumos do X-Salada baixaram;
   importar um XML de NF-e de compra → ligar itens → concluir → contas a pagar.
8. **Caixa**: fechar às cegas com R$ 2 a menos → pede justificativa e PIN do
   gerente → diferença no histórico → vendas lançadas no Financeiro.
9. **Financeiro**: ver as contas a receber já recebidas do caixa e as contas a
   pagar da nota; registar um pagamento parcial; estornar.
10. **Clientes**: o cliente do pedido do cardápio aparece sozinho; consultar
    um CNPJ; anonimizar.
11. **Resumo**: "Enviar no meu WhatsApp" com o texto do dia.

## 4. Resumo automático no WhatsApp (pré-funcional)

O código está pronto (`src/app/api/cron/resumo-diario`, `vercel.json` às 02:00
UTC = 22:00 em Porto Velho). Para ligar: conta WhatsApp Business Platform da
agência (Tech Provider), número verificado, modelo `resumo_diario` aprovado
com 3 parâmetros de corpo (empresa, dia, linha de números), e as variáveis
`CRON_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_TEMPLATE_RESUMO` na Vercel. Custo estimado na pesquisa: ~R$ 1 por
cliente por mês.

## 5. Próximos módulos (ordem do catálogo)

Fiscal com emissor parceiro (Focus NFe/NFE.io), Bancos e Pix com webhook
(Efí, Asaas, Inter ou Cora), Delivery próprio, Relatórios (motor único),
Fidelidade, Ordens de serviço, Ponto (controlo interno primeiro; REP-P só com
decisão — ver pesquisa/integracoes.md).
