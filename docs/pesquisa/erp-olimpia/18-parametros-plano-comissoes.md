# 18 — Parâmetros, plano e mensalidades, utilitários e comissões (ERP Olímpia)

> **Estado: PARCIAL. Quase tudo está pendente.** Tentativa em 2026-10-03.
> Só a tela de entrada do módulo Parâmetros (`/dashboard/modulo/parametros`)
> foi lida. Ao abrir a segunda rota (`/parametros-sistema`), o Claude Code
> recusou a navegação. As outras rotas não foram abertas.
> A seção "O que foi visto" traz só o que apareceu na tela. A seção "Perguntas
> para a próxima passagem" traz perguntas, não fatos sobre o ERP.

## Em palavras simples

1. **O login está funcionando.** A primeira página abriu já logada na conta
   "Boi Criolo". **Não precisa mandar a credencial de novo.**
2. **Quem barrou foi uma trava de segurança do próprio Claude Code**, o
   "classificador do modo automático". Ela confere cada ação antes de ela
   acontecer e decide sozinha se deixa ou não. Ela deixou abrir a primeira
   página e barrou a segunda, com o motivo "Third-Party Attack" (ação contra
   um terceiro; aqui, o site da Olímpia).
3. **O agente não pode desligar nem contornar essa trava.** Abrir as outras
   páginas por outro caminho seria fazer exatamente o que ela proibiu.
4. **Só você pode liberar.** Escolha uma opção:
   - **Opção A, aprovar na hora:** rodar este grupo com o modo automático
     desligado (modo normal de permissões). Quando o Claude for abrir uma
     página da Olímpia, aparece um aviso pedindo permissão. Clique em
     "Permitir".
   - **Opção B, liberar nas configurações:** adicionar nas configurações do
     Claude Code uma regra de permissão para a ferramenta de navegação do
     navegador embutido (`mcp__Claude_Browser__navigate`). Atenção: essa regra
     vale para qualquer site, não só para a Olímpia.
5. Depois, rode de novo só o grupo 18. Este arquivo será substituído pelo
   relatório completo.

## Rotas do grupo: estado

| Rota | Estado |
| --- | --- |
| `/dashboard/modulo/parametros` | **lida** (grade de atalhos, ver abaixo) |
| `/parametros-sistema` | **recusada** pelo classificador do modo automático ("Third-Party Attack") |
| `/parametros/campos-obrigatorios` | não aberta (a recusa vale para o objetivo, não só para aquela página) |
| `/dashboard/modulo/mensalidades` | não aberta |
| `/minha-assinatura` | não aberta |
| `/meu-plano` | não aberta |
| `/meus-termos` | não aberta |
| `/dashboard/modulo/utilitarios` | não aberta |
| `/sistema-melhorias` | não aberta |
| `/sistema-log-alteracoes` | não aberta |
| `/comissoes/metas` | não aberta |

Sub-rotas descobertas (vistas como links, não abertas): `/bridge`, `/mcp`,
`/mcp/monitor`, `/forca-vendas/api`.

## O que foi visto

### `/dashboard/modulo/parametros`: entrada do módulo Parâmetros

**Objetivo:** é uma página de atalhos (hub). Não tem lista, filtros, totais nem
formulário. Só leva para as telas de configuração, de conta e de integrações.

**Layout:** faixa escura com o título "Parâmetros" e o link "Voltar ao
dashboard" (`/dashboard`). Abaixo, uma grade de 9 cartões (4 por linha no
desktop). Cada cartão tem um ícone e um rótulo em maiúsculas, sem texto de
descrição.

| Cartão | Destino | Está na lista deste grupo? |
| --- | --- | --- |
| Parâmetros do sistema | `/parametros-sistema` | sim (recusada) |
| Campos obrigatórios | `/parametros/campos-obrigatorios` | sim (não aberta) |
| Olimpia Bridge | `/bridge` | não: sub-rota descoberta |
| MCP / Conector IA | `/mcp` | não: sub-rota descoberta |
| Monitor WhatsApp IA | `/mcp/monitor` | não: sub-rota descoberta |
| Meu plano | `/meu-plano` | sim (não aberta) |
| Mensalidades | `/minha-assinatura` | sim (não aberta) |
| Termos de uso | `/meus-termos` | sim (não aberta) |
| API Força de Vendas | `/forca-vendas/api` | não: sub-rota descoberta |

**O que dá para afirmar só por esta tela:**

- O cartão "Mensalidades" deste módulo leva para `/minha-assinatura`, e não
  para `/dashboard/modulo/mensalidades`. O atalho "Mensalidades" da barra
  lateral também leva para `/minha-assinatura`. Falta confirmar se as duas
  rotas tratam da mesma coisa.
- O mesmo módulo junta quatro assuntos: ajustes do sistema (parâmetros, campos
  obrigatórios), conta com o fornecedor (plano, mensalidades), documento legal
  (termos de uso) e integrações (Bridge, MCP/IA, monitor de WhatsApp com IA,
  API de força de vendas).
- Pelos nomes e pelas URLs, o ERP oferece um conector de IA por MCP (Model
  Context Protocol) e um monitor de WhatsApp com IA, os dois sob `/mcp`. Só o
  nome e o endereço foram vistos; o funcionamento não foi verificado.

### Elementos globais vistos nesta tela

- **Cabeçalho:** nome da empresa ("BOI CRIOLO"); campo "Buscar telas" com
  atalho Ctrl+K; botão "Novidades", cujo nome acessível é "Melhorias e ajustes
  do sistema" e que leva para `/sistema-melhorias` (rota deste grupo); escolha
  de tema visual; notificações; menu do usuário ("ADMIN").
- **Botão flutuante "Abrir assistente"** no canto inferior direito.
- **Barra lateral** só com ícones coloridos, sem rótulo visível, com 15
  atalhos: Venda Balcão (`/vendas`), Venda PDV (`/pdv`), Venda Direta Mobile
  (`/garcom/mobile-venda`), Caixa (`/financeiro/recebimento`), Ordem de Serviço
  (`/dashboard/modulo/os`), Mensalidades (`/minha-assinatura`), Produtos
  (`/produtos`), Clientes (`/pessoas?tipo=cliente`), Consulta Cliente
  (`/consulta-cliente`), Gestão Loja Virtual (`/dashboard/modulo/loja`),
  Cardápio Digital (`/dashboard/modulo/cardapio`), Comanda Garçom
  (`/garcom-admin/link`), API Força de Vendas (`/forca-vendas/api`), Visitas de
  rota (`/rota-visitas`), Ponto Eletrônico (`/ponto/dashboard`). Não foi
  verificado se a lista é fixa ou configurável.

## Fluxos de ponta a ponta

Só um fluxo foi observado: Dashboard → módulo Parâmetros (grade de cartões) →
cartão → tela de destino.

Ficam pendentes os fluxos reais: configurar parâmetros, tornar um campo
obrigatório, consultar plano e mensalidades, ler e aceitar termos, definir
metas e apurar comissões, consultar melhorias e o log de alterações.

## Entidades e relações

Constatado: só a empresa (tenant "Boi Criolo") e o usuário logado (perfil
"ADMIN") aparecem no cabeçalho. Nenhum formulário foi aberto, então não há
campos nem relações a registrar. As hipóteses estão nas perguntas abaixo.

## Integrações

Vistas só pelo nome do cartão, sem abrir: conector de IA por MCP (`/mcp`),
monitor de WhatsApp com IA (`/mcp/monitor`), "Olimpia Bridge" (`/bridge`) e
API de força de vendas (`/forca-vendas/api`).

## Observações de UX (só sobre o que foi visto)

- **Cartões sem descrição.** Só ícone e rótulo em maiúsculas. Nomes como
  "Olimpia Bridge" e "MCP / Conector IA" não dizem ao comerciante para que
  servem. Oportunidade: uma frase por cartão dizendo o que resolve, e um estado
  ("ligado", "falta configurar").
- **Módulo misturado.** Ajustes do sistema, conta com o fornecedor, termos e
  integrações técnicas ficam no mesmo lugar. Oportunidade: separar
  "Configurações", "Minha conta e plano" e "Integrações".
- **Nome ambíguo.** "Mensalidades" aparece como cartão e como atalho lateral,
  sempre levando para `/minha-assinatura`, mas também existe a rota
  `/dashboard/modulo/mensalidades`. Falta confirmar se são coisas diferentes.
- **Barra lateral sem rótulos.** 15 ícones coloridos sem nome visível são
  difíceis de decorar. Oportunidade: rótulos visíveis ou modo expandido.
- **Para copiar:** busca global de telas com Ctrl+K; "Novidades" no cabeçalho;
  assistente acessível de qualquer tela.

## Perguntas para a próxima passagem

São perguntas para guiar a exploração. **Não são fatos** sobre o ERP.

### `/parametros-sistema`

- Como as configurações estão organizadas (abas ou seções por área: vendas,
  PDV, fiscal, estoque, financeiro, impressão)?
- Que tipos de parâmetro existem (liga/desliga, número, texto, lista) e quais
  mudam o comportamento de outros módulos (ex.: estoque negativo, desconto
  máximo, casas decimais, arredondamento, impressão automática)?
- Valem por empresa/filial ou para a conta inteira? Exigem permissão própria?
  Ficam registrados no log de alterações?

### `/parametros/campos-obrigatorios`

- Em que cadastros dá para tornar campos obrigatórios (cliente, produto,
  fornecedor, venda)?
- A regra vale só na tela ou também em importações e na API? Por empresa ou
  por usuário/grupo?

### `/dashboard/modulo/mensalidades`

- É cobrança recorrente dos clientes do comerciante (contratos, planos,
  geração de boleto/PIX) ou a assinatura do próprio comerciante com a Olímpia?
- Que telas o módulo tem?

### `/minha-assinatura` e `/meu-plano`

- Que dados mostram (plano atual, módulos incluídos, limites de usuários,
  empresas ou notas, valor, vencimento, faturas, forma de pagamento)?
- Como os módulos são ligados e desligados conforme o plano? (Importante para
  a nossa ideia de entregar só o que cada cliente usa.)
- O que acontece com atraso (aviso, bloqueio parcial, só leitura)?

### `/meus-termos`

- Que documentos existem (termos de uso, privacidade/LGPD, contrato), com
  versão, data e registro de aceite (quem, quando, IP)?
- O aceite é obrigatório para continuar usando o sistema?

### `/dashboard/modulo/utilitarios`

- Que ferramentas existem (importar/exportar, backup, reprocessamentos,
  limpeza de dados, etiquetas)?

### `/sistema-melhorias`

- É só o histórico de novidades do fornecedor (data, categoria, módulo) ou
  também recebe sugestões dos clientes (votação, estado)?

### `/sistema-log-alteracoes`

- É a auditoria do cliente (quem alterou o quê, valor antes e depois, data,
  IP) ou o histórico de versões do sistema?
- Filtros (usuário, tela, período, tipo de ação) e exportação.

### `/comissoes/metas`

- Metas por vendedor, por equipe ou por empresa; período (mês, semana); tipo
  (faturamento, quantidade, margem, produto ou categoria).
- Como a comissão é calculada (percentual fixo, faixas por atingimento da
  meta, por produto ou categoria, sobre a venda ou sobre o recebimento) e o
  que acontece com devoluções e cancelamentos.
- Acompanhamento (realizado × meta, ranking) e pagamento da comissão (gera
  conta a pagar?).

### Sub-rotas descobertas

- `/bridge`: o que é o Olimpia Bridge (programa instalado no computador da
  loja para impressora, balança, TEF ou certificado?) e como se liga à conta.
- `/mcp`: que dados e ações o conector de IA expõe, como autentica e com que
  permissões.
- `/mcp/monitor`: o que o monitor de WhatsApp com IA mostra (conversas,
  pedidos, atendimentos automáticos?) e que número ou provedor de WhatsApp usa.
- `/forca-vendas/api`: o que a API permite (catálogo, clientes, pedidos de
  vendedores externos) e como autentica.

## Pendências

- 10 rotas do grupo sem exploração: 1 recusada (`/parametros-sistema`) e 9 não
  tentadas por causa da recusa.
- 4 sub-rotas descobertas não abertas: `/bridge`, `/mcp`, `/mcp/monitor`,
  `/forca-vendas/api`.
- Falta a decisão do usuário (opção A ou B, no início deste arquivo).
- Nota de operação: o navegador embutido estava com 8 abas abertas (de outras
  sessões ou agentes). A primeira tentativa de criar uma aba falhou por limite;
  a segunda funcionou (tab-21). Rodar muitos grupos em paralelo pode esbarrar
  nesse limite.
- A aba deste grupo (tab-21) foi fechada no fim. Nenhuma outra aba foi usada.
  No ERP nada foi clicado, digitado, salvo ou alterado.
