---
name: dominio-produto
description: Regras de negócio, vocabulário e restrições da plataforma para pequeno comerciante de alimentação (Brasil). Usar em qualquer tarefa de modelo de dados, API, painel, integração de canal ou copy deste projeto.
---

# Domínio — plataforma para pequeno comerciante de alimentação

Mercado: Brasil. Cliente: lanchonete, marmitaria, pastelaria, açaí, pizzaria de
bairro, com um a três funcionários e sem presença digital. Operação híbrida:
o setup é feito pela equipa, o cliente usa o painel depois.

## Regras invioláveis

1. **Um catálogo, muitos canais.** Um produto é cadastrado uma vez e publicado
   em todos os canais por adaptadores. Nunca duplicar produto por canal.
2. **Multi-tenant sempre.** Toda a query filtra por `tenant_id`. Row Level
   Security ativa. Dois tenants nunca veem dados um do outro.
3. **Formato canónico interno = Open Delivery.** É o padrão que a 99Food usa.
   O iFood tem adaptador próprio que traduz de e para o canónico.
4. **O campo `canal` existe em todo pedido**, desde o primeiro dia, mesmo com um
   único valor possível.
5. **Suspensão por falta de pagamento nunca apaga a página pública.** Mostra
   versão reduzida com telefone e endereço.
6. **Não construir: emissor fiscal, gateway de pagamento, entregador.**
   Integrar parceiros.

## Vocabulário (usar exatamente estes termos)

| Termo          | Significado                                                 |
| -------------- | ----------------------------------------------------------- |
| Tenant         | O comerciante, a conta                                      |
| Loja           | Unidade física de um tenant                                 |
| Canal          | Origem do pedido: cardapio, whatsapp, balcao, ifood, 99food |
| Insumo         | Matéria-prima com unidade e custo                           |
| Ficha          | Quanto de cada insumo sai por produto vendido               |
| Grupo de opção | "Escolha o ponto", "adicionais"                             |
| Console        | Área interna de operador (`/admin`)                         |
| Painel         | Área do comerciante (`/painel`)                             |

Não usar: "restaurante" (nem todos são), "usuário" para o comerciante,
"marketplace" quando se quer dizer "canal".

## Restrições externas

- **iFood.** APIs gratuitas. Exigem conta com CNPJ (CPF não aceite) e CNAE de
  tecnologia. Fluxo: cadastro no portal do desenvolvedor (dá loja e app de
  teste) → desenvolver → homologação com app completo e funcional → app de
  produção → pedir permissão a cada loja. A permissão é aceite no portal do
  parceiro por utilizador com perfil de dono; se esse utilizador for desativado,
  a integração para.
- **99Food.** Integração por Open Delivery. O gestor cria link de integração, o
  cliente autoriza, obtém-se `AppShopID` por loja. **Uma loja aceita apenas um
  parceiro de integração ativo.**
- **LGPD.** Dados de cliente final são dados pessoais. O comerciante é
  controlador, a plataforma é operadora.
- **WhatsApp.** Fase 1 usa link `wa.me`, sem aprovação. API oficial só com
  volume.

## Contexto de uso — decide o design

A página pública é vista pelo cliente final no telemóvel, vinda de um link do
Instagram. Tem de carregar abaixo de 1,5 s em 4G.

O painel é usado num telemóvel apoiado no balcão, com as mãos ocupadas e
pressa. Alvos de toque de 48px, contraste alto, sem menus escondidos, som ao
entrar pedido. Nada de dashboard denso com gráficos: números grandes e listas.

O console é usado pela equipa interna, no computador, dezenas de vezes por
semana. Aqui a densidade é bem-vinda.

## Teste para qualquer decisão de produto

Se não encurta o caminho entre um cliente final e um pedido concluído, ou não
poupa tempo no setup de um novo tenant, não entra nesta fase.
