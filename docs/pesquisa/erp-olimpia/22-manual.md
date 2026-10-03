# 22 — Manual completo do sistema (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** O acesso ao site foi bloqueado pelo sistema de permissões do Claude Code antes de qualquer página carregar. Este ficheiro só regista o bloqueio. **Não contém nenhuma informação do manual.**

## O que se tentou fazer

- Rotas pedidas:
  - `/dashboard/modulo/manual`
  - `/manual`
- Base: `https://erp.olimpiasistemas.com.br` (conta de teste "Boi Criolo", já logada no navegador embutido).
- Abriu-se uma aba própria no navegador embutido. A primeira navegação (`/dashboard/modulo/manual`) foi recusada pelo classificador do modo automático, com o motivo "Third-Party Attack".
- Depois da recusa, não se tentou nenhum outro caminho (nem a rota `/manual`, nem outra ferramenta). A aba própria foi fechada. As outras abas não foram tocadas.

## Resultado por secção

| Secção pedida | Estado |
|---|---|
| Visão geral do módulo | Pendente: não houve leitura |
| Telas (rota, objetivo, listas, formulários, regras) | Pendente: não houve leitura |
| Fluxos de ponta a ponta | Pendente: não houve leitura |
| Entidades e relações | Pendente: não houve leitura |
| Integrações (SEFAZ, bancos, gateways, WhatsApp, Mercado Livre, impressoras, balança, TEF) | Pendente: não houve leitura |
| Observações de UX | Pendente: não houve leitura |

## Pendências

1. **Permissão de navegação.** As duas rotas do manual continuam por ler, porque a navegação para `erp.olimpiasistemas.com.br` foi recusada pelo sistema de permissões. A decisão é do utilizador: se quiser que a leitura seja feita, tem de autorizar esse tipo de acção nas regras de permissão do Claude Code e depois voltar a correr esta tarefa.
2. Quando o acesso for autorizado, voltar a correr a tarefa completa deste grupo: ler o manual inteiro (índice, secções e subpáginas) e organizar por módulo as regras de negócio, os fluxos, os estados, os cálculos e as integrações.
3. Atenção a quem juntar os relatórios: **não use este ficheiro como fonte.** A informação do manual tem de vir de uma leitura real. Não pode ser deduzida dos outros relatórios desta pasta.
