# Brief de construção — Plataforma para o pequeno comerciante de alimentação

Mercado: Brasil. Modelo: híbrido (setup pago + mensalidade).
Documento para entregar ao Claude Code como briefing do projeto.
Nome do produto: a definir.

---

## 0. Como usar este documento

1. No Claude Code, instalar o plugin **frontend-design**.
2. Colocar este ficheiro em `docs/brief.md` e o de domínio em
   `.claude/skills/dominio-produto/SKILL.md`.
3. Primeiro pedido:

> Lê `docs/brief.md`. Implementa **apenas a Fase 1**. Antes de escrever código,
> apresenta o modelo de dados, a estrutura de ficheiros e o plano de design.
> Não implementes nada das fases 2, 3 ou 4, mas deixa o modelo de dados
> preparado para elas.

A instrução mais importante é a última linha. Sem ela, o Claude vai tentar
construir as quatro fases de uma vez e nenhuma vai ficar boa.

---

## 1. O produto em uma frase

Um sistema que tira o pequeno comerciante de alimentação do zero digital e o
mantém a operar: presença própria, cardápio com pedido direto, controlo de
stock e, por fim, os aplicativos de delivery — tudo alimentado por um único
catálogo de produtos.

**Quem é o cliente.** Lanchonete, pastelaria, marmitaria, açaí, pizzaria de
bairro. Um a três funcionários. Não tem site, não tem CNPJ organizado no
digital, gere o stock de cabeça e anota pedido em papel. Não é o restaurante
que já usa Saipos ou Sischef.

**Quem opera.** Você faz o setup pago. O cliente usa o painel depois. Isto tem
uma consequência de produto que a maior parte das pessoas ignora: nesta fase, o
**console interno de operador vale mais do que o painel do cliente**. Você vai
usá-lo em todas as vendas; o cliente entra no dele uma vez por semana.

---

## 2. A ordem das fases, e por que é esta

O instinto é começar pela integração com o iFood. É o erro.

A integração está bloqueada por coisas que não dependem de código: conta com
CNPJ, CNAE de tecnologia, aplicativo completo e funcional para submeter, e o
processo de homologação. Além disso, a 99Food limita cada loja a **um único
parceiro de integração**, o que significa que vender integração a quem já usa
outro sistema exige convencê-lo a desligar o que tem. É a venda mais difícil
possível para quem está a começar.

A ordem abaixo põe o dinheiro primeiro e o obstáculo por último.

| Fase  | O que é                                             | Por que aqui                                                                  |
| ----- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| **1** | Presença digital + cardápio com pedido por WhatsApp | Vendável e entregável já. Quase não tem software. Financia o resto.           |
| **2** | Catálogo e stock central                            | É a espinha de que tudo o resto depende. Não precisa de aprovação de ninguém. |
| **3** | Integração iFood + 99Food                           | Gated por homologação e por CNPJ. Precisa de base instalada antes.            |
| **4** | Análise unificada de vendas                         | Só faz sentido quando há dados de mais de um canal.                           |

Regra: **nenhuma fase começa antes de a anterior ter cinco clientes reais a
pagar.** O produto tem de ser validado por dinheiro, não por funcionalidade.

---

## 3. A decisão de arquitetura que sustenta tudo

**Um produto é cadastrado uma vez e publicado em todos os canais.**

```
                    ┌──────────────────────┐
                    │  CATÁLOGO CENTRAL    │
                    │  produto, preço,     │
                    │  foto, stock         │
                    └──────────┬───────────┘
                               │
        ┌──────────┬───────────┼───────────┬────────────┐
        ▼          ▼           ▼           ▼            ▼
   Site/perfil  Cardápio    iFood      99Food      Instagram
                digital    (adapter)  (Open Del.)   (export)
        F1          F1         F3          F3           F1
```

Todos os canais são **adaptadores** sobre o mesmo catálogo. O formato canónico
interno segue o **Open Delivery**, porque é o padrão que a 99Food já usa e
poupa uma tradução inteira mais à frente. O iFood ganha o seu próprio adaptador.

Isto significa que a Fase 1 já tem de guardar produto, preço, foto, categoria e
disponibilidade com a estrutura completa, mesmo que só publique no cardápio.
Não construir agora um modelo simplificado que será refeito na Fase 3.

**Multi-tenant desde o primeiro dia.** Toda a query filtra por `tenant_id`.
Reescrever isto depois é reescrever o sistema.

---

## 4. Modelo de dados (núcleo)

```ts
Tenant        // o comerciante
  id, nome_fantasia, razao_social, cnpj, telefone, whatsapp,
  endereco, slug, plano, status, criado_em

Loja          // um tenant pode ter mais de uma unidade
  id, tenant_id, nome, endereco, horarios[], raio_entrega,
  taxa_entrega, pedido_minimo, ativo

Categoria     id, tenant_id, nome, ordem, ativo

Produto
  id, tenant_id, categoria_id, nome, descricao, preco,
  preco_promocional?, foto_url, sku?, disponivel,
  tempo_preparo_min, ordem

GrupoOpcao    // "escolha o ponto", "adicionais"
  id, produto_id, nome, min, max, obrigatorio

Opcao         id, grupo_id, nome, preco_adicional, disponivel

Insumo        // Fase 2
  id, tenant_id, nome, unidade, quantidade_atual,
  quantidade_minima, custo_unitario

Ficha         // Fase 2 — quanto de cada insumo sai por produto vendido
  produto_id, insumo_id, quantidade

Pedido
  id, tenant_id, loja_id, canal, canal_pedido_id?, cliente_nome,
  cliente_telefone, endereco?, itens[], subtotal, taxa_entrega,
  total, forma_pagamento, status, criado_em

Canal         'cardapio' | 'whatsapp' | 'balcao' | 'ifood' | '99food'
```

O campo `canal` em `Pedido` existe desde a Fase 1 mesmo com um só valor
possível. É ele que torna a Fase 4 trivial em vez de dolorosa.

---

## 5. Fase 1 — o que se constrói agora

### 5.1 Página pública do comerciante — `/{slug}`

Uma página, não um site de cinco separadores. Mobile-first agressivo: o cliente
final chega por link do Instagram, no telemóvel, com uma mão.

Ordem: nome e logo · estado aberto/fechado calculado do horário real ·
botão de WhatsApp · cardápio por categorias com foto, nome, descrição e preço ·
endereço com link para o mapa · horário em tabela.

O carrinho é um painel deslizante. Ao finalizar, monta uma mensagem de WhatsApp
já formatada com os itens, o total, o endereço e a forma de pagamento, e
regista o pedido no sistema antes de abrir o WhatsApp.

Não construir: checkout com pagamento online, conta de utilizador final,
avaliações, cupões, chat. Na Fase 1 o pagamento acontece fora do sistema.

### 5.2 Painel do comerciante — `/painel`

Cinco ecrãs, mais nada:

1. **Pedidos do dia** — lista em tempo real, botões para aceitar, marcar pronto
   e concluir. Som ao entrar pedido novo.
2. **Cardápio** — CRUD de categorias, produtos e grupos de opções. Interruptor
   de disponibilidade em cada produto, acessível num toque.
3. **Loja** — horários, taxa e raio de entrega, pedido mínimo, botão grande de
   `Fechar loja agora`.
4. **Resumo** — faturação do dia e da semana, número de pedidos, ticket médio,
   dez produtos mais vendidos. Sem gráficos elaborados; números grandes e uma
   lista.
5. **Conta** — dados, plano, ligação para suporte por WhatsApp.

O painel é usado num telemóvel apoiado no balcão, com as mãos ocupadas.
Alvos de toque de 48px, contraste alto, zero menus escondidos.

### 5.3 Console do operador — `/admin`

Este é o seu ecrã. É onde a operação híbrida acontece.

- Lista de tenants com estado do onboarding em etapas visíveis:
  `cadastro → cardápio carregado → fotos → página publicada → Google → cobrança ativa`
- Criar tenant e entrar no painel dele por impersonation, para fazer o setup
  sem pedir a senha do cliente
- **Importador de cardápio**: recebe uma foto do cardápio de papel ou uma
  planilha e produz produtos, categorias e preços em bloco. É a tarefa mais
  demorada do setup e a que mais vale automatizar
- Ficha de cliente com o que foi entregue, o que falta e a data de renovação

---

## 6. Fases seguintes — especificação resumida

**Fase 2 — Catálogo e stock.** Insumos com unidade e custo. Ficha técnica que
liga produto a insumos. Baixa automática de stock a cada pedido concluído.
Alerta de mínimo. Custo por produto e margem real, que é o número que o
comerciante nunca sabe. Inventário periódico com registo de quebra.

**Fase 3 — Delivery.**
_iFood:_ registo no portal do desenvolvedor (dá loja e app de teste), desenvolver
os módulos de merchant, catálogo e pedidos, submeter a homologação com um
aplicativo completo e funcional, criar o app de produção, pedir permissão a cada
loja. A permissão é aceite no portal do parceiro por um utilizador com perfil de
dono; se esse utilizador for desativado, a integração para e é preciso reenviar.
_99Food:_ Open Delivery. O gestor cria o link de integração, o cliente autoriza,
obtém-se o `AppShopID` por loja. **Uma loja só pode ter um integrador ativo.**
Ambos: reconciliação de taxas e repasses, e sincronização de disponibilidade nos
dois sentidos.

**Fase 4 — Análise.** Vendas por canal, produto e hora. Curva ABC. Margem por
canal depois das comissões, que é o relatório que justifica a mensalidade
sozinho. Comparação entre canal próprio e marketplace.

---

## 7. Restrições externas a respeitar desde já

- **CNPJ e CNAE de tecnologia** são obrigatórios para a homologação do iFood.
  Contas de pessoa física não são aceites. Resolver antes da Fase 3.
- **Fiscal (NFC-e).** Não construir emissor fiscal. Integrar um parceiro na
  Fase 2 ou 3. É um projeto inteiro e regulado.
- **Pagamentos.** Não construir. Pix e cartão via provedor, e só quando o
  checkout online entrar. Na Fase 1 o dinheiro não passa pelo sistema.
- **LGPD.** Dados de cliente final (nome, telefone, endereço) são dados
  pessoais. Retenção definida, consentimento no formulário, e o comerciante é
  controlador, você é operador. Isso vai no contrato.
- **WhatsApp.** A Fase 1 usa link `wa.me`, que não precisa de aprovação. A API
  oficial do WhatsApp Business só quando houver volume para justificar.

---

## 8. Stack

Next.js (App Router) + TypeScript + Tailwind. Postgres com Row Level Security
por `tenant_id`. Supabase ou Neon para acelerar auth e storage. Uploads de
imagem com redimensionamento automático, porque as fotos vêm do telemóvel do
comerciante e pesam 5 MB cada.

Adaptadores de canal em `lib/canais/`, um ficheiro por canal, todos com a mesma
interface. `lib/canais/cardapio.ts` na Fase 1; `ifood.ts` e `open-delivery.ts`
entram na Fase 3 sem tocar no resto.

Não funcionais: página pública abaixo de 1,5 s em 4G, porque é a única coisa que
o cliente final vê. Painel funcional em ecrã de 360px. Pedidos em tempo real via
websocket ou polling curto. Backup diário.

---

## 9. O que o modelo comercial exige do software

Setup pago mais mensalidade significa que o sistema tem de saber a diferença
entre um cliente em onboarding e um cliente ativo.

- Estado do tenant: `onboarding` · `ativo` · `suspenso` · `cancelado`
- Suspensão por falta de pagamento **não apaga a página**; mostra uma versão
  reduzida com o telefone. Derrubar a página do comerciante é como se perde um
  cliente para sempre e ganha uma avaliação péssima.
- Checklist de onboarding no console, porque o setup é o produto que você vende
  e tem de ser entregue igual todas as vezes
- Exportação completa dos dados do cliente a pedido dele. Faz o discurso de
  venda ser honesto e reduz o medo de aderir.

Faixas indicativas a validar com clientes reais, não a fixar agora: os sistemas
concorrentes de gestão anunciam mensalidades a partir de valores baixos, mas
atendem quem já tem operação montada. O seu setup vale mais do que a sua
mensalidade nesta fase, porque é onde está o trabalho.

---

## 10. Critérios de aceitação da Fase 1

1. Criar um tenant novo no console e ter a página pública no ar em menos de
   trinta minutos, incluindo o cardápio.
2. Um cliente final consegue montar um pedido e chegar ao WhatsApp em menos de
   um minuto no telemóvel, sem criar conta.
3. O pedido aparece no painel do comerciante com som, antes de a mensagem de
   WhatsApp ser respondida.
4. Marcar um produto como esgotado no painel remove-o da página pública em
   menos de cinco segundos.
5. O modelo de dados suporta `canal`, grupos de opções e multi-loja, mesmo sem
   nenhum deles estar em uso.
6. Dois tenants diferentes não conseguem ver dados um do outro em nenhuma query.
