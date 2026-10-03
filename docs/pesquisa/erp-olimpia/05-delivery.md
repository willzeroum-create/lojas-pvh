# ERP Olímpia: Delivery próprio e app do entregador

> **Estado: NÃO EXPLORADO.** Este ficheiro ainda não tem dados observados no ERP.
> Nada do que se espera desta secção (telas, campos, regras, fluxos) foi visto,
> por isso nada foi escrito aqui como facto.

## O que aconteceu (2026-10-03)

1. Abri uma aba própria no navegador embutido do Claude.
2. Tentei abrir a primeira rota do grupo
   (`https://erp.olimpiasistemas.com.br/dashboard/modulo/delivery`).
3. O sistema de permissões do Claude Code (modo automático) **bloqueou a
   navegação** para o site `erp.olimpiasistemas.com.br`, classificando-a como
   "Third-Party Attack". O bloqueio foi na permissão, não no login: a
   credencial que já está no navegador não teve nada a ver com isto.
4. Como o bloqueio vale para o site inteiro, não tentei outras rotas nem outros
   caminhos (outro navegador, download da página, etc.). Fechei a aba e parei.

## Rotas do grupo (todas por visitar)

| Rota | Estado |
| --- | --- |
| `/dashboard/modulo/delivery` | não visitada: navegação bloqueada pela permissão |
| `/delivery-admin` | não visitada |
| `/delivery-admin/pedidos` | não visitada |
| `/delivery-admin/entregadores` | não visitada |
| `/delivery-admin/configuracao` | não visitada |
| `/delivery/app` | não visitada |

## O que é preciso para continuar

- O dono da conta tem de **autorizar o Claude a navegar** em
  `erp.olimpiasistemas.com.br` no navegador embutido. Por exemplo: correr este
  grupo fora do modo automático e aprovar quando o Claude pedir, ou acrescentar
  nas definições do Claude Code uma regra que permita a ferramenta de navegação
  (`mcp__Claude_Browser__navigate`) para esse site.
- Depois disso, voltar a correr este grupo. As regras de só leitura do pedido
  original continuam a valer.
