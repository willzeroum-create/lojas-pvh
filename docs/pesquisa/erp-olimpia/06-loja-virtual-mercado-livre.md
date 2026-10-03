# ERP Olímpia: Loja virtual e Mercado Livre

> **Estado: NÃO EXPLORADO.** Este arquivo ainda não tem nenhum dado visto no ERP.
> Nada do que se espera desta seção (telas, campos, regras, fluxos, integrações)
> foi observado, então nada foi escrito aqui como fato.

## O que aconteceu (2026-10-03)

1. Tentei criar uma aba própria no navegador embutido do Claude. **Não deu**: o
   navegador respondeu que não podia abrir mais abas (já havia 9 abas abertas,
   provavelmente o limite).
2. Tentei abrir a primeira rota do grupo direto numa aba nova
   (`https://erp.olimpiasistemas.com.br/dashboard/modulo/loja`). O sistema de
   permissões do Claude Code (modo automático) **bloqueou** essa ação,
   classificando-a como "Third-Party Attack". O bloqueio foi na permissão, não no
   login: a credencial que já está no navegador não tem nada a ver com isso.
3. O bloqueio vale para o resultado (abrir o ERP), não só para aquele comando.
   Por isso não tentei outras rotas, não usei as abas de outras pessoas ou de
   outros agentes e não tentei outro navegador.
4. Nenhuma aba minha ficou aberta (nenhuma chegou a ser criada). Nada foi
   clicado, alterado ou gravado na conta "Boi Criolo".

## Rotas do grupo (todas por visitar)

| Rota | Estado |
| --- | --- |
| `/dashboard/modulo/loja` | não visitada: abertura bloqueada pela permissão |
| `/loja-admin/pedidos` | não visitada |
| `/loja-admin/link` | não visitada |
| `/loja/app` | não visitada |
| `/produto-grupos` | não visitada |
| `/produto-sub-grupos` | não visitada |
| `/loja-admin/config` | não visitada |
| `/loja-admin/cupons` | não visitada |
| `/loja-admin/avaliacoes` | não visitada |
| `/dashboard/modulo/mercado_livre` | não visitada |
| `/integracoes/mercado-livre/pedidos` | não visitada |
| `/integracoes/mercado-livre/anuncios` | não visitada |
| `/integracoes/mercado-livre/config` | não visitada |
| `/integracoes/mercado-livre/documentacao` | não visitada |

## O que é preciso para continuar

Duas coisas, as duas na mão do dono da conta:

1. **Liberar espaço para uma aba nova** no navegador embutido: fechar algumas
   abas que não estejam em uso (o limite foi atingido).
2. **Autorizar o Claude a abrir** `erp.olimpiasistemas.com.br` no navegador
   embutido. Por exemplo: rodar este grupo fora do modo automático e aprovar
   quando o Claude pedir, ou acrescentar nas configurações do Claude Code uma
   regra que permita as ferramentas do navegador embutido para esse site.

Depois disso, basta rodar este grupo de novo. As regras de só leitura do pedido
original continuam valendo.
