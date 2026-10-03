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
| Ponto eletrônico | funcional | Relógio no tablet: PIN + foto da webcam + local; batidas imutáveis (só se anulam, com motivo e PIN do gerente); espelho do mês com intervalo, extras, noturno (hora de 52min30) e inconsistências CLT; impressão | 0019, 0020 |
| Relatórios | funcional | Vendas por dia, hora, canal e pagamento, comparação com o período anterior, curva ABC, exportação CSV para Excel | — |
| Delivery próprio | funcional | Taxa por bairro no cardápio (fora dos bairros não se entrega), entrega criada sozinha, quadro com despacho, link do entregador no celular (sem senha), acompanhamento para o cliente na mensagem do WhatsApp, acerto do repasse | 0022 |
| Fidelidade (cashback) | funcional | % de volta em cada compra de cliente identificado (balcão ou cardápio), validade FIFO, uso no PDV na mesma transacção da venda, estorno e devolução ao cancelar, ajuste com PIN | 0021 |
| Resumo diário no WhatsApp | pré-funcional | Envio manual já funciona; automático às 22h precisa da API oficial (abaixo) | — |
| Nota fiscal (NFC-e) | pré-funcional | Emissão pela Focus NFe a partir da venda, DANFE, cancelamento, dados fiscais por produto; falta o contrato e o certificado A1 de cada cliente (§6) | 0016 |
| Pix (Bancos) | pré-funcional | QR dinâmico do Mercado Pago no PDV, avulso e nas contas a receber; baixa automática pelo webhook; falta a conta Mercado Pago de cada cliente (§6) | 0017 |
| Cobrança, OS, Loja virtual, Marketplaces | planejado | No catálogo, visíveis no console como "em construção" | — |

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
     `supabase/atualizacao-0008.sql` … `atualizacao-0022.sql`;
   - **projeto novo**: `supabase/instalacao-completa.sql` e depois `supabase/seed.sql`.
3. Demonstração: `supabase/demo-erp.sql` liga todos os módulos prontos na
   Lanchonete da Praça, com mesas, estações, ficha técnica, estoque inicial,
   cashback de 5 % e o gerente **Demo Gerente, PIN 2580** (que também bate ponto).
4. `pnpm tipos` regenera `src/lib/supabase/tipos.ts` a partir do projeto (os
   tipos foram escritos à mão enquanto a base estava fora; conferir o diff).
5. Variáveis novas (ver `.env.example` e `pnpm env:verificar`):
   `NEXT_PUBLIC_WHATSAPP_COMERCIAL`, `PVH_SEGREDO_EQUIPE` (opcional),
   `PVH_CHAVE_SEGREDOS` e `PVH_SEGREDO_WEBHOOKS` (opcionais, mas fixe-os antes
   de guardar o primeiro token de cliente), `CRON_SECRET` e `WHATSAPP_*`
   (só para o resumo automático).
6. Storage: a migração 0020 cria o bucket privado `ponto` (fotos das batidas);
   conferir em Storage que existe e não é público.

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
12. **Ponto**: no relógio, Demo Gerente → Entrada → PIN 2580 → foto; bater de
    novo logo a seguir é recusado ("espere um minuto"); Saída para intervalo,
    Volta, Saída; no espelho, ver horas, intervalo e foto; lançar uma batida
    manual e anular outra (pedem PIN do gerente; ficam na auditoria); imprimir.
13. **Cashback**: no PDV, procurar a cliente do pedido do cardápio → vender
    R$ 100 → ela ganha R$ 5; numa segunda venda usar o cashback (aparece o
    saldo e o máximo); cancelar essa venda → o cashback usado volta.
14. **Relatórios**: últimos 7 dias com as vendas acima; curva ABC; exportar
    vendas e abrir no Excel (acentos e vírgula decimal certos).
15. **Delivery**: em Entregas → Bairros e entregadores, cadastrar "Centro" (R$ 5)
    e um entregador; no cardápio público, pedido de entrega → o bairro é pedido
    no carrinho e a taxa aparece; a mensagem do WhatsApp traz o link de
    acompanhamento; no painel, Saiu → abrir o link do entregador no celular →
    Entreguei → o pedido fica concluído e o link do cliente mostra "entregue";
    Acertar o repasse.
16. **Pix e Nota** (só com as contas de teste do §6): console → Integrações →
    tokens de homologação; no PDV gerar o QR e pagar no app de teste; emitir a
    NFC-e de uma venda e abrir o DANFE.

## 4. Resumo automático no WhatsApp (pré-funcional)

O código está pronto (`src/app/api/cron/resumo-diario`, `vercel.json` às 02:00
UTC = 22:00 em Porto Velho). Para ligar: conta WhatsApp Business Platform da
agência (Tech Provider), número verificado, modelo `resumo_diario` aprovado
com 3 parâmetros de corpo (empresa, dia, linha de números), e as variáveis
`CRON_SECRET`, `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`,
`WHATSAPP_TEMPLATE_RESUMO` na Vercel. Custo estimado na pesquisa: ~R$ 1 por
cliente por mês.

## 5. Próximos módulos (ordem do catálogo)

Cobrança (boleto e lembretes), Ordens de serviço, Loja virtual e Marketplaces
(iFood e 99Food pelo formato Open Delivery; exigem homologação com CNPJ).

## 6. Integrações de cada cliente (pré-funcionais)

**Nota fiscal (Focus NFe).** Por cliente: conta na Focus (a agência pode ser
revenda), certificado digital A1 da empresa enviado à Focus, CSC da NFC-e
gerado na SEFAZ-RO, inscrição estadual. No console → ficha → Integrações:
CNPJ, IE, regime, token de homologação; colar a URL de aviso nos gatilhos da
Focus. Testar em homologação (sem valor fiscal) e só depois produção. Em cada
produto vendido: NCM (8 dígitos), CFOP 5102 e CSOSN 102 servem para quase
todo o Simples.

**Pix (Mercado Pago).** Por cliente: conta Mercado Pago da empresa → Suas
integrações → criar aplicação → token de acesso (APP_USR-…); em Webhooks,
evento "Pagamentos", colar a URL de aviso do console e copiar a assinatura
secreta para o campo da chave. QR dinâmico sem mTLS, funciona na Vercel.

**Ponto.** Não é REP-P certificado (Portaria 671/2021): serve ao controlo
interno de quem tem até 20 empregados, que a CLT não obriga a registar
(art. 74 §2). Acima disso, só com REP-P registado — decisão comercial.
