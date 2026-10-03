# 08 — Pessoas, empresa, usuários, permissões e cadastros gerais

> **Estado: NÃO EXPLORADO (bloqueado por permissão).** Tentativa em 2026-10-03.
> Este arquivo não descreve nenhuma tela do ERP Olímpia. Nada aqui foi inventado
> nem deduzido: as telas não chegaram a ser abertas.

## O que aconteceu

1. Abri uma aba própria no navegador embutido do Claude.
2. Ao abrir a primeira rota (`/dashboard/modulo/cadastros`), o Claude Code
   **recusou a navegação**. Quem recusou foi o classificador de permissões do
   modo automático, que tratou o acesso como possível "ataque de terceiros".
   O motivo provável: a ordem de abrir o site externo veio do texto gerado pelo
   script do workflow, e não de uma mensagem digitada diretamente pelo usuário.
3. **O problema não é o login nem a credencial.** A sessão no navegador embutido
   não chegou a ser usada, porque a navegação foi barrada antes.
4. Todas as rotas do grupo estão no mesmo domínio
   (`https://erp.olimpiasistemas.com.br`), então nenhuma foi aberta. Tentar as
   outras uma a uma seria contornar o bloqueio, e isso não foi feito.
5. Fechei a minha aba. No ERP nada foi lido, clicado, digitado ou gravado.

## Rotas pendentes (todas)

| Rota | Estado |
| --- | --- |
| `/dashboard/modulo/cadastros` | não aberta (navegação recusada) |
| `/pessoas` | não aberta |
| `/pessoas?tipo=cliente` | não aberta |
| `/consulta-cliente` | não aberta |
| `/colaborador-cargos` | não aberta |
| `/carga-horarias` | não aberta |
| `/forma-pagamentos` | não aberta |
| `/usuarios` | não aberta |
| `/usuario-grupos` | não aberta |
| `/empresa` | não aberta |
| `/plano-contas` | não aberta |
| `/municipios` | não aberta |
| `/zonas` | não aberta |
| `/bairros` | não aberta |
| `/veiculos` | não aberta |
| `/rotas` | não aberta |
| `/cadastros/checklist` | não aberta |

## Como desbloquear (decisão do usuário)

Escolha **uma** destas opções e depois rode de novo só o grupo 08:

- **Pedir direto na conversa.** Escrever no chat principal algo como
  "explore o grupo 08 do ERP Olímpia no navegador embutido". Assim a ordem vem
  do próprio usuário, e não do script.
- **Aprovar na hora.** Sair do modo automático e voltar ao modo normal de
  permissões. Quando o Claude for abrir o site, aparece um pedido de permissão
  e basta clicar em "Permitir".
- **Liberar de vez.** Adicionar nas configurações do Claude Code uma regra que
  permita a ferramenta de navegação do navegador embutido
  (`mcp__Claude_Browser__navigate`). Só faça isso se quiser liberar a navegação
  para qualquer site, e não apenas para este.

## O que a próxima tentativa precisa preencher

As seções que este arquivo deveria ter, todas ainda vazias:

- Visão geral do módulo de cadastros.
- Uma seção por tela: objetivo, colunas, filtros, ações e o formulário
  "Novo/Editar" (campos, tipos, obrigatórios, opções de cada select, abas
  internas).
- Regras de negócio: permissões por grupo de usuário, validações de CPF/CNPJ,
  estados e transições.
- Fluxos de ponta a ponta, por exemplo usuário → grupo → permissões e
  pessoa → cliente → consulta.
- Entidades e relações.
- Integrações externas que as telas pressupõem.
- Observações de UX, para identificar oportunidades.
- Pendências.
