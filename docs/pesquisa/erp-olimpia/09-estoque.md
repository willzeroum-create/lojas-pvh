# 09 — Estoque (ERP Olímpia)

> **Estado: NÃO EXPLORADO (navegação bloqueada por permissão).** Tentativa em 2026-10-03.
> Nenhuma tela do módulo de estoque chegou a abrir. Este arquivo não descreve o
> ERP: registra só o bloqueio, o que falta para destravar e o que a próxima
> passagem precisa responder. Nada aqui é constatação sobre o sistema.

## Em uma frase

O login não é o problema. Quem barrou foi o próprio Claude Code: a checagem de
segurança do modo automático não deixou o navegador embutido abrir o site
`erp.olimpiasistemas.com.br`.

## O que aconteceu

1. Criei uma aba só minha no navegador embutido. Não usei a aba do usuário.
2. Pedi para abrir a primeira rota do grupo:
   `https://erp.olimpiasistemas.com.br/dashboard/modulo/estoque`.
3. O classificador de permissões do modo automático do Claude Code **recusou**
   a navegação. O motivo informado foi "Third-Party Attack" (ataque a
   terceiros).
4. **Não é problema de senha, login ou credencial.** A página nem chegou a
   carregar, então a sessão já aberta no navegador não foi usada.
5. A recusa vale para o resultado (abrir esse site), não só para aquela
   chamada. Todas as rotas do grupo ficam no mesmo site, então não tentei as
   outras nem outro caminho (outra aba, outro navegador ou outra ferramenta).
6. Fechei a minha aba. No ERP nada foi lido, clicado, digitado ou gravado.

## Rotas do grupo

| Rota | Estado |
| --- | --- |
| `/dashboard/modulo/estoque` | não aberta: navegação recusada pela permissão |
| `/entradas-xml` | não aberta (mesmo site, não tentada) |
| `/entradas-manual` | não aberta (mesmo site, não tentada) |
| `/saidas-manual` | não aberta (mesmo site, não tentada) |
| `/transferencias` | não aberta (mesmo site, não tentada) |
| `/balancos` | não aberta (mesmo site, não tentada) |
| `/estoque-log` | não aberta (mesmo site, não tentada) |

Sub-rotas descobertas: nenhuma.

## Como destravar (decisão do usuário)

Mandar a credencial de novo não resolve, porque ela não é o problema. O que
falta é uma **permissão**, e só o usuário pode dar essa permissão. Escolha uma
das opções abaixo e depois rode de novo o grupo 09:

1. **Aprovar na hora.** Rodar a exploração fora do modo automático, no modo
   normal de permissões. Quando o Claude for abrir o site, aparece um pedido
   de permissão. Basta clicar em "Permitir".
2. **Liberar nas configurações.** Acrescentar nas configurações do Claude Code
   uma regra que permita a ferramenta de navegação do navegador embutido
   (`mcp__Claude_Browser__navigate`). Atenção: essa regra vale para a
   ferramenta inteira, ou seja, para qualquer site, não só para este.

Este agente não muda permissões nem configurações por conta própria.

Quando a exploração for repetida, este arquivo deve ser substituído pelo
relatório completo.

## O que a próxima passagem precisa responder

São perguntas para guiar a exploração. **Não são constatações** sobre o ERP.

### Visão geral do módulo (`/dashboard/modulo/estoque`)

- Que atalhos, cartões e indicadores o painel do módulo mostra (valor em
  estoque, itens abaixo do mínimo, notas a importar etc.) e que itens de menu
  existem.
- O estoque é controlado por empresa, por depósito/local ou pelos dois? Há
  multiempresa?
- O sistema deixa o estoque ficar negativo? Isso é configurável?
- Controla lote, validade, grade (tamanho/cor), número de série ou itens
  vendidos por peso (balança)?
- Existe ficha técnica/receita que baixa os insumos quando um produto é
  vendido? (Importante para alimentação.)
- Como o custo é calculado: custo médio, último custo ou os dois?
- Unidades de medida e conversão (ex.: caixa com 12 unidades).
- Estoque mínimo/máximo e alertas de reposição.
- Que permissões de usuário controlam cada ação do módulo.

### Entradas por XML (`/entradas-xml`)

- Como a nota chega: envio do arquivo XML, digitação da chave de acesso ou
  busca automática na SEFAZ das notas emitidas contra o CNPJ (manifestação do
  destinatário)?
- Se houver manifestação: que eventos aparecem (ciência, confirmação,
  desconhecimento, operação não realizada).
- Como cada item da nota é ligado a um produto interno (código do fornecedor,
  EAN, vínculo lembrado para as próximas notas) e se dá para cadastrar o
  produto a partir da nota.
- Conversão de unidade e fator por item; tratamento de lote e validade.
- O que a importação atualiza: quantidade, custo (com ou sem IPI, ST, frete e
  desconto), preço de venda/markup, cadastro do fornecedor.
- Se gera contas a pagar a partir das duplicatas da nota.
- Estados da entrada (pendente, conferida, lançada, cancelada?) e se dá para
  estornar.
- Colunas, filtros e totais da lista.

### Entrada manual (`/entradas-manual`)

- Campos do cabeçalho (fornecedor, data, número do documento, depósito,
  observação) e dos itens (produto, quantidade, custo).
- Se altera o custo do produto e se gera lançamento financeiro.
- Estados e estorno.

### Saída manual (`/saidas-manual`)

- Motivos disponíveis (perda, quebra, vencimento, consumo interno, doação?) e
  se a justificativa é obrigatória.
- Que valor é usado na saída (custo médio? último custo?).
- Quem pode lançar, estados e estorno.

### Transferências (`/transferencias`)

- Entre depósitos da mesma empresa, entre filiais ou as duas coisas.
- Se emite nota fiscal de transferência quando o CNPJ muda.
- Se tem etapa de envio e de recebimento (estoque "em trânsito") e quem
  confirma no destino.
- Campos, estados e estorno.

### Balanços (`/balancos`)

- Como se cria um balanço: total ou parcial (por grupo, categoria ou local).
- Como se conta: digitação, leitor de código de barras, coletor ou importação
  de planilha; se o saldo é congelado no início da contagem.
- Como compara contado × sistema e como gera o ajuste (entradas e saídas
  automáticas).
- Estados (aberto, em contagem, finalizado, cancelado?) e quem pode finalizar.
- Se existe relatório de inventário para fins fiscais.

### Histórico de estoque (`/estoque-log`)

- Que movimentos ficam registrados (venda, cancelamento, entradas, saídas,
  transferências, balanços, produção/ficha técnica).
- Colunas (data, produto, tipo, quantidade, saldo antes e depois, usuário,
  documento de origem) e filtros (período, produto, tipo, usuário, depósito).
- Se dá para abrir o documento de origem e exportar a lista.

## Seções que o relatório completo deve ter

Visão geral do módulo; uma seção por tela (rota, objetivo, lista com colunas,
filtros e ações; formulário com campos, tipos, obrigatórios e opções; regras e
comportamento); fluxos de ponta a ponta; entidades e relações; integrações;
observações de UX; pendências.
