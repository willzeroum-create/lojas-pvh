# Catálogo funcional do ERP modular

> O que construir, módulo a módulo, para o nosso ERP modular: cada comerciante
> recebe só os módulos que usa, com design próprio e mensalidade personalizada
> (por volta de R$ 400). Público: pequenos e médios negócios de Porto Velho
> (lanchonetes, restaurantes, açougues, bares, padarias, varejo, serviços e
> oficinas).
>
> - **Fonte:** a exploração do ERP da Olímpia Ecossistemas resumida no
>   [mapa](00-mapa.md) e nos arquivos de detalhe desta pasta, mais o que o nosso
>   produto já tem (README, `docs/plano-fase-1.md`, `src/lib/modulos/catalogo.ts`
>   e a skill `dominio-produto`).
> - **Data:** 2026-10-03.
> - Nenhum texto da Olímpia foi copiado. Onde citamos o que eles fazem, é um
>   resumo nosso, com o arquivo de origem entre parênteses, por exemplo (96).

## Como usar este catálogo

- **Cada módulo tem uma ficha** (seção 4) com: id, nome, objetivo,
  funcionalidades (mínimo e diferencial), entidades e relações, fluxos
  principais, regras de negócio, integrações e o que o comerciante fornece para
  ativar, dependências, segmentos, prioridade e maturidade alvo.
- **O id** é o mesmo que usamos (ou devemos usar) em
  `src/lib/modulos/catalogo.ts`. Quando o módulo já existe lá, a ficha diz.
- **Prioridade**
  - **P0:** base de qualquer cliente.
  - **P1:** o que lanchonetes, restaurantes, açougues, bares, padarias e o
    varejo de Porto Velho mais pedem.
  - **P2:** segmentos específicos (oficinas, distribuidoras, confeitarias,
    açougues com desossa, varejo online...).
  - **P3:** depois; fica no roteiro.
- **Maturidade alvo** (os mesmos três estados do código)
  - **funcional:** 100% nosso; pode ser ligado sem nada do comerciante.
  - **pre_funcional:** o código fica pronto, mas para funcionar falta uma
    credencial ou integração do comerciante (certificado, conta no banco,
    autorização no iFood...). A ficha diz qual.
  - **planejado:** fica no roteiro; aparece no console mas não liga. Os módulos
    P3 ficam assim até haver demanda paga. A ficha diz a maturidade que terão
    quando forem construídos.
- **"Mínimo" e "diferencial".** O mínimo é o que precisa existir para o módulo
  valer a mensalidade. O diferencial é o que nos separa da Olímpia e dos outros
  concorrentes; entra depois do mínimo.
- **Grau de certeza.** Regras legais e fiscais citadas aqui são conhecimento
  geral e estão marcadas "confirmar" quando dependem do contador ou do
  jurídico. O que a Olímpia faz está marcado com o arquivo de origem; o que não
  foi visto lá está dito.

---

## 1. Princípios

São as regras do produto (skill `dominio-produto` e brief) aplicadas a um ERP
modular, mais as lições da Olímpia.

1. **Um catálogo, muitos canais.** O produto é cadastrado uma vez e publicado em
   todos os canais por adaptadores (formato canônico Open Delivery). A Olímpia
   faz o mesmo e acerta nisso (93).
2. **Multi-tenant sempre.** Toda leitura passa por `src/lib/dados/*` com
   `tenantId` explícito; a RLS é a rede de segurança.
3. **O campo `canal` existe em todo pedido**, desde o primeiro dia.
4. **Não construímos emissor fiscal, gateway de pagamento nem rede de
   entregadores.** Integramos parceiros. Os módulos `fiscal`, `bancos`,
   `cobranca` e `cartoes` são integrações; o `delivery` gere os entregadores
   do próprio comerciante.
5. **Só aparece o que o cliente usa.** O menu, os relatórios, a ajuda, as
   configurações e os avisos saem dos módulos ligados. A Olímpia mostra os 27
   módulos a todos, com cerca de 420 parâmetros de segmentos alheios, e leva a
   uma página de bloqueio quando o módulo não está no plano (96, 915).
6. **Linguagem do comerciante.** Sem nomes internos, códigos da SEFAZ como
   estado, maiúsculas forçadas ou JSON na tela (13, 916, 919).
7. **Estados com nome e regras.** Cada entidade tem um conjunto fechado de
   estados, com o mesmo rótulo e a mesma cor em todas as telas, e transições
   controladas. O estado financeiro é calculado dos pagamentos, nunca escolhido
   à mão (14, 20, 921).
8. **Tempo real, não consulta periódica.** Avisos por Supabase Realtime, um
   canal só e apenas para os módulos ligados. A Olímpia consulta sete canais a
   cada 10 a 30 segundos em todas as telas (915, 920).
9. **Segredos no cofre.** Certificado, senhas de API e tokens nunca aparecem em
   texto aberto nem vão no endereço. `tenant_modulos.configuracao` nunca guarda
   segredos (plano-fase-1, §11).
10. **Celular primeiro no balcão, densidade no console.** O painel funciona a
    360 px com alvos de 48 px; o console da equipe pode ser denso.
11. **Suspensão não derruba a página pública** e o comerciante pode exportar os
    seus dados a qualquer momento.

---

## 2. Tabela-resumo

43 módulos. "No código" diz se o id já existe em `src/lib/modulos/catalogo.ts`
e com que maturidade.

| id | Nome | Prioridade | Maturidade alvo | Depende de | Na Olímpia | No código |
| --- | --- | --- | --- | --- | --- | --- |
| `conta` | Conta, empresa e assinatura | P0 | funcional | — | Parâmetros & Empresa (cadastro), Mensalidades, Novidades | sim, essencial, funcional |
| `equipe` | Equipe, acessos e auditoria | P0 | funcional | — | Usuários, Grupos, Cargos, Liberações, Log de alterações | não (há `membros` com papel) |
| `catalogo` | Catálogo de produtos | P0 | funcional | — | Produtos, Grupos, Subgrupos, NCM, Grades, Campos obrigatórios, Etiquetas | dentro de `cardapio` |
| `clientes` | Clientes e fornecedores | P0 | funcional | — | Pessoas, Consulta Cliente, Créditos de cliente | sim, planejado |
| `pedidos` | Central de pedidos | P0 | funcional | `catalogo` | Vendas, Vendas Online, Pedidos Online, Balcão de Entrega | sim, funcional |
| `loja` | Loja, horários e entrega | P0 | funcional | — | Empresa/filiais, Zonas, Bairros, Configuração de entrega | sim, essencial, funcional |
| `financeiro` | Financeiro | P0 | funcional | `clientes` | Financeiro (receber, pagar, plano de contas, previsão) | sim, planejado |
| `resumo` | Painel do dono | P0 | funcional | `pedidos` | ERP (Dashboard), BI Executivo | sim, funcional |
| `relatorios` | Relatórios | P0 | funcional | — | Relatórios (Central, 132 relatórios) | sim, planejado |
| `cardapio` | Cardápio digital e vitrine | P1 | funcional | `pedidos`, `catalogo` | Comanda Digital / Cardápio | sim, funcional |
| `pdv` | PDV / frente de caixa | P1 | funcional | `caixa`, `catalogo`, `pedidos` | PDV, Venda Balcão, Venda Direta Mobile, trocas | sim, planejado |
| `caixa` | Caixa | P1 | funcional | `financeiro` | Caixa, relatórios de caixa | sim, planejado |
| `comandas` | Mesas e comandas | P1 | funcional | `pedidos`, `caixa` | Comanda Garçom, Mesas, Tablet, Sinuca | sim, planejado |
| `cozinha` | Cozinha e expedição | P1 | funcional | `pedidos` | Painel Cozinha, Balcão de Entrega | sim, planejado |
| `delivery` | Delivery próprio | P1 | funcional | `pedidos` | Delivery Próprio, app do entregador | sim, planejado |
| `estoque` | Estoque | P1 | funcional | `catalogo` | Estoque & Entradas | sim, planejado |
| `producao` | Produção, fichas técnicas e custo | P1 | funcional | `estoque` | Produção, composição, CRM Markup | sim, planejado |
| `perifericos` | Impressoras, balança e gaveta | P1 | funcional | — | Olimpia Bridge, Parâmetros do sistema | não |
| `fiscal` | Nota fiscal | P1 | pre_funcional | `catalogo`, `clientes` | Emissão NF-e, NFC-e, NFS-e, Portal do Contador | sim, planejado |
| `bancos` | Bancos e Pix | P1 | pre_funcional | `financeiro` | Bancos, PIX, conciliação | sim, planejado |
| `cobranca` | Cobrança, fiado e links de pagamento | P1 | pre_funcional | `financeiro`, `clientes` | Cobrança Automática, boletos | sim, planejado |
| `marketplaces` | Apps de delivery (iFood, 99Food) | P1 | pre_funcional | `pedidos`, `catalogo` | não aparece no menu nem nos planos | sim, planejado (inclui o Mercado Livre) |
| `ia_whatsapp` | Assistente com IA no WhatsApp | P1 | pre_funcional | `resumo` | Agente de Vendas IA (adicional), Advisor | sim, planejado |
| `encomendas` | Encomendas e orçamentos | P2 | funcional | `pedidos`, `clientes` | orçamento como venda em estado 0 | não |
| `desossa` | Desossa e cortes | P2 | funcional | `producao`, `estoque` | Produção > Desossa | não (citada em `producao`) |
| `compras` | Compras e fornecedores | P2 | funcional | `estoque`, `financeiro` | Compras e Suprimentos | sim, planejado |
| `cartoes` | Cartões e maquininhas (TEF/POS) | P2 | pre_funcional | `financeiro` | TEF, operadoras de POS, cartões | não |
| `fidelidade` | Fidelidade e cashback | P2 | funcional | `clientes`, `pedidos` | Cashback | sim, planejado |
| `crm` | Relacionamento e campanhas | P2 | pre_funcional | `clientes` | CRM | não |
| `loja_virtual` | Loja virtual | P2 | funcional | `pedidos`, `catalogo` | Loja Virtual | sim, planejado |
| `mercado_livre` | Mercado Livre | P2 | pre_funcional | `pedidos`, `catalogo`, `estoque` | Mercado Livre | dentro de `marketplaces` |
| `painel_tv` | Painel de TV (preços e senhas) | P2 | funcional | `catalogo` | Painel TV / Painel de Preços | não |
| `ordens_servico` | Ordens de serviço | P2 | funcional | `clientes`, `catalogo` | Ordem de Serviço | sim, planejado |
| `comissoes` | Comissões e metas | P2 | funcional | `pedidos`, `financeiro` | relatórios de comissão, comissão por metas | não |
| `forca_vendas` | Força de vendas, rotas e expedição | P2 | funcional | `clientes`, `catalogo`, `pedidos` | Força de Vendas, visitas de rota, faturamento em lote, romaneio | não |
| `ponto` | Ponto eletrônico | P2 | funcional | `equipe` | Ponto Eletrônico | sim, planejado |
| `portal_cliente` | Portal do cliente | P2 | funcional | `clientes` | Portal do Cliente | não |
| `folha` | Pré-folha e folha de pagamento | P3 | planejado | `ponto`, `financeiro` | Folha de Pagamento | não |
| `portal_colaborador` | App da equipe | P3 | planejado | `equipe` | Portal do Colaborador | não |
| `assinatura` | Assinatura eletrônica | P3 | planejado | — | Assinatura Eletrônica | não |
| `fiscal_transporte` | MDF-e e CT-e | P3 | planejado | `fiscal` | Emissão MDF-e e CT-e | não |
| `consultoria` | Diagnóstico e plano de gestão | P3 | planejado | `resumo`, `relatorios` | Consultoria / Gestão 360° | não (a cadeia de produção do console é a semente) |
| `api_integracoes` | API, webhooks e conector de IA | P3 | planejado | — | APIs públicas, MCP / Conector IA | não |

**Como os 36 módulos da Olímpia se encaixam:** Sinuca vira "mesa por tempo"
dentro de `comandas`; Balcão de Entrega fica em `cozinha` e `pedidos`; PIX vai
para `bancos`; TEF vira `cartoes`; CRM / Markup se divide entre `crm` e o
"preço por markup" de `producao`; BI Executivo é o diferencial de `resumo`;
Parâmetros & Empresa se espalham por `conta` e pela configuração de cada
módulo; as duas emissões de transporte (MDF-e, CT-e) se juntam em
`fiscal_transporte`.

**Mudanças propostas no código:**

- separar `catalogo` de `cardapio` (o cadastro é de todos os canais, a página
  pública é só um canal);
- tirar o Mercado Livre de `marketplaces` e criar `mercado_livre` (outro
  público, o varejo, e outra prioridade);
- criar os ids novos da tabela;
- usar os grupos que já existem em `GRUPOS_MODULO` (cada ficha diz o grupo);
- acrescentar ao enum `canal_pedido` os canais novos (`loja_virtual`,
  `mercado_livre`) numa migração nova, quando esses módulos entrarem; hoje o
  enum tem `cardapio`, `whatsapp`, `balcao`, `ifood` e `99food`.

---

## 3. Pacotes por segmento

Sugestão de módulos ligados por tipo de negócio, para montar a mensalidade
personalizada. Todos recebem o P0 (`conta`, `equipe`, `catalogo`, `clientes`,
`pedidos`, `loja`, `financeiro`, `resumo`, `relatorios`).

| Segmento | Módulos além do P0 | Opcionais comuns |
| --- | --- | --- |
| Lanchonete, açaí, pizzaria de delivery (1 a 3 pessoas) | `cardapio`, `delivery`, `caixa`, `bancos` (Pix), `marketplaces`, `ia_whatsapp` | `pdv`, `cozinha`, `fidelidade`, `perifericos` (impressora) |
| Restaurante ou bar com salão | `cardapio` (QR da mesa), `comandas`, `cozinha`, `caixa`, `pdv`, `perifericos`, `estoque`, `producao`, `fiscal`, `bancos`, `ia_whatsapp` | `ponto`, `painel_tv`, `marketplaces`, `delivery` |
| Açougue ou casa de carnes | `pdv`, `caixa`, `perifericos` (balança e etiquetas), `estoque`, `producao`, `desossa`, `fiscal`, `cobranca` (fiado), `ia_whatsapp` | `painel_tv` (preços), `encomendas` (churrasco), `delivery`, `compras` |
| Padaria ou confeitaria | `pdv`, `caixa`, `perifericos` (balança), `estoque`, `producao`, `encomendas`, `fiscal`, `ia_whatsapp` | `cardapio` (encomenda online), `painel_tv`, `ponto` |
| Mercearia ou minimercado | `pdv`, `caixa`, `perifericos`, `estoque`, `compras`, `fiscal`, `cobranca` (fiado), `bancos` | `cartoes`, `fidelidade`, `delivery` |
| Varejo (roupas, presentes, material, autopeças) | `pdv`, `caixa`, `estoque`, `compras`, `fiscal`, `cardapio` como vitrine ou `loja_virtual` | `comissoes`, `crm`, `fidelidade`, `mercado_livre`, `cartoes` |
| Oficina ou assistência técnica | `ordens_servico`, `estoque`, `fiscal` (NFS-e e NF-e de peças), `cobranca`, `portal_cliente` | `comissoes`, `assinatura`, `ponto` |
| Distribuidora de alimentos ou bebidas | `forca_vendas`, `estoque`, `compras`, `fiscal`, `cobranca`, `bancos` | `comissoes`, `fiscal_transporte`, `crm` |

**Custos de terceiros.** Alguns módulos têm custo variável que não é nosso: o
emissor fiscal (por nota ou por CNPJ), a API oficial do WhatsApp (por uso), a
IA (por volume) e os mapas (por consulta). Esses módulos precisam
de uma franquia incluída na mensalidade ou de repasse; os valores ficam por
definir.

---

## 4. Fichas dos módulos

Cada ficha começa com uma linha de resumo: prioridade, maturidade alvo, como o
módulo é ligado (essencial = sempre ligado; padrão = ligado numa empresa nova;
opcional), grupo em `GRUPOS_MODULO`, segmentos, dependências e situação no
código.

### 4.1 P0: base de qualquer cliente

#### `conta` — Conta, empresa e assinatura

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | essencial | `operacao` | todos | — | sim (essencial, funcional) |

**Na Olímpia:** cadastro da empresa com consulta do CNPJ e escolha da inscrição
estadual, logo e QR do Pix; Mensalidades (faturas, plano, termos de uso com
aceite auditável); Novidades (96, 915, 916).

**Objetivo.** Guardar quem é a empresa, que plano e módulos tem, como paga a
mensalidade e o que aceitou.

**Funcionalidades**

- *Mínimo:*
  - dados da empresa: razão social, fantasia, CNPJ ou CPF, inscrições,
    regime tributário, endereço, WhatsApp, logo e cor da marca;
  - consulta do CNPJ que preenche o cadastro (e escolha da inscrição estadual
    quando há mais de uma);
  - plano atual e módulos ligados, cada um com uma frase sobre o que faz;
  - faturas da mensalidade (Pix ou boleto) com estado;
  - aceite eletrônico dos termos, com registro da versão, data e hora,
    usuário, IP, navegador, cópia do texto e hash;
  - exportação completa dos dados;
  - contato com o suporte por WhatsApp.
- *Diferencial:*
  - comparar módulos com preço e pedir um módulo novo pelo painel;
  - "Novidades" só dos módulos ligados, em linguagem simples;
  - comprovante do aceite em PDF legível;
  - renovação automática opcional (Pix Automático ou cartão);
  - histórico do que foi entregue na implantação (vem da cadeia de produção
    do console).

**Entidades e relações**

- `Tenant` 1–N `Loja`; `Tenant` 1–1 `Assinatura` (plano, valor personalizado,
  dia de vencimento, situação `onboarding`, `ativo`, `suspenso`, `cancelado`)
  1–N `Fatura`.
- `Tenant` N–N `Modulo` por `tenant_modulos` (ligado, configuração sem
  segredos).
- `VersaoTermo` 1–N `AceiteTermo` (N–1 usuário).
- `Novidade` (módulo, tipo, data, texto).

**Fluxos principais**

1. Implantação: o console cria o tenant → cadeia de produção → liga os módulos
   e define a mensalidade → o comerciante aceita os termos no primeiro acesso →
   página publicada.
2. Mensalidade: fatura gerada antes do vencimento → Pix ou boleto → baixa
   automática por webhook → em atraso: avisos → restrição gradual → suspensão.
3. Mudança de plano: a equipe ajusta módulos e valor → próxima fatura com o
   novo valor.

**Regras de negócio**

- A suspensão nunca apaga a página pública: mostra a versão reduzida com
  telefone e endereço.
- Depois do cancelamento, os dados ficam guardados pelo prazo legal e podem ser
  exportados.
- Um termo novo e relevante exige novo aceite; o histórico fica guardado.
- Só o dono altera dados fiscais e vê as faturas.
- Certificado e chaves não ficam nesta tela: ficam no cofre do módulo que os
  usa.

**Integrações e ativação.** Consulta de CNPJ (BrasilAPI ou similar, serviço
público) e o gateway da plataforma para cobrar a mensalidade (credencial
nossa). O comerciante fornece só os dados cadastrais.

**Da Olímpia:** copiar a trilha do aceite (versão, hash, CNPJ na época) e a
consulta do CNPJ com escolha da inscrição. Evitar o crédito de 30 dias com dois
prazos na mesma tela, a troca de plano por uma confirmação nativa do navegador,
bloquear toda a operação até pagar a implantação e mostrar módulos não
contratados como página de bloqueio (915, 916).

---

#### `equipe` — Equipe, acessos e auditoria

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | essencial | `pessoas` | todos | — | não (há a tabela `membros` com papel `dono` ou `funcionario`) |

**Na Olímpia:** usuários e grupos de permissão (as telas pelo grupo, as ações
pelo usuário), cargos, senhas de sangria e de cancelamento guardadas nos
parâmetros, fila de liberações de supervisor, log de alterações com antes e
depois em JSON (96, 916, 918).

**Objetivo.** Dizer quem trabalha na loja, o que cada um pode fazer e guardar o
registro do que foi feito.

**Funcionalidades**

- *Mínimo:*
  - membros com papéis prontos: dono, gerente, caixa, atendente ou garçom,
    cozinha, entregador, técnico;
  - permissões por ação: desconto acima de X%, cancelar item ou venda, sangria,
    ajuste de estoque, ver o financeiro;
  - convite por WhatsApp ou e-mail com link de acesso;
  - PIN curto para quem usa o balcão, o app do garçom, o app do entregador e o
    ponto;
  - aprovação do gerente: no próprio aparelho (o gerente digita o PIN dele) ou
    remota (o pedido aparece no celular do gerente para aprovar ou negar);
  - registro de auditoria legível ("campo: antes → depois"), com destaque para
    ações sensíveis.
- *Diferencial:*
  - aprovação remota em tempo real com contexto (quem, o quê, valor);
  - limites por papel e horário de acesso;
  - aparelhos autorizados e encerramento remoto de sessão;
  - relatório de ações sensíveis por período (cancelamentos, descontos,
    sangrias, ajustes).

**Entidades e relações**

- `Usuario` N–N `Tenant` por `Membro` (papel, PIN cifrado, lojas permitidas,
  ativo).
- `Papel` 1–N `Permissao` (código da ação, limite).
- `PedidoAprovacao` (solicitante, ação, contexto, valor, estado `pendente`,
  `aprovado`, `negado`, `expirado`, aprovador, data).
- `RegistroAuditoria` (tabela, id do registro, ação, antes, depois, usuário,
  data, origem). Só cresce.

**Fluxos principais**

1. Convidar membro → aceita o convite → cria o PIN.
2. Operador tenta uma ação acima do limite → pede aprovação → gerente aprova
   (local ou remota) → a ação segue e fica no registro.

**Regras de negócio**

- Nenhuma senha compartilhada guardada como parâmetro.
- PIN bloqueia depois de algumas tentativas erradas.
- O dono só sai se transferir a propriedade.
- A auditoria não se edita nem se apaga.

**Integrações e ativação.** Nenhuma. Os convites usam link `wa.me` ou e-mail.

**Da Olímpia:** copiar a fila de liberações (o pedido remoto) e a auditoria por
tabela. Evitar senhas operacionais nos parâmetros, permissões em duas camadas
pouco claras, quatro logins diferentes para os apps (garçom, ponto, entregador,
colaborador) e JSON cru no log (96, 916, 922).

---

#### `catalogo` — Catálogo de produtos

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | essencial | `vendas` | todos | — | dentro de `cardapio` (categorias, produtos, grupos de opção, fotos, importador) |

**Na Olímpia:** cadastro geral de produtos usado por todos os canais, grupos
com comissão e ordem, subgrupos com foto, fabricantes, cores, grades, NCM,
cadastros de confecção, campos obrigatórios configuráveis, etiquetas, lista de
preços, metas de markup por grupo (93, 915, 919, 920).

**Objetivo.** Cadastrar cada produto uma vez e publicá-lo em todos os canais.

**Funcionalidades**

- *Mínimo:*
  - categorias com ordem;
  - produto com nome, descrição, foto (redimensionada no navegador), preço,
    preço promocional, unidade (un, kg, l), código interno e código de barras,
    tempo de preparo e disponibilidade com interruptor de um toque;
  - grupos de opção ("escolha o ponto", "adicionais") com mínimo, máximo e
    obrigatório, e opções com preço adicional;
  - visibilidade por canal;
  - importador por foto do cardápio (IA) ou planilha, com revisão antes de
    gravar (já existe);
  - alteração em massa com prévia (preço +%, categoria, disponibilidade).
- *Diferencial:*
  - preço por canal (por exemplo +15% no iFood) e por loja;
  - variações (grade cor × tamanho) para o varejo, cada uma com código e
    estoque;
  - combos e kits;
  - produto pesável com código de balança;
  - etiquetas de gôndola;
  - dados fiscais (NCM, CEST, origem, perfil tributário), que só aparecem com
    `fiscal` ligado;
  - campos obrigatórios configuráveis por empresa;
  - custo e margem (com `producao`);
  - criar produtos a partir do XML da nota de compra;
  - histórico de preço.

**Entidades e relações**

- `Categoria` 1–N `Produto`; `Produto` 1–N `GrupoOpcao` 1–N `Opcao` (já
  existem).
- `Produto` 1–N `Variacao`; `Produto` 1–N `CodigoBarras`.
- `Produto` N–N `Canal` por `PublicacaoCanal` (visível, preço do canal, id
  externo).
- `Produto` 0–1 `PerfilFiscal`; `Produto` 0–N `Ficha` (de `producao`).
- `HistoricoPreco`.

**Fluxos principais**

1. Cadastrar (à mão ou pelo importador) → publicar nos canais ligados.
2. Esgotar ou desativar → some de todos os canais em menos de 5 segundos.
3. Reajuste em massa → prévia → confirmar.

**Regras de negócio**

- Nunca duplicar um produto por canal; o formato interno é o Open Delivery.
- O texto fica como foi escrito (sem maiúsculas forçadas).
- Produto com histórico não se apaga: inativa.
- Código de barras único por tenant.

**Integrações e ativação.** IA de visão para o importador (chave da
plataforma). Opcional: base pública de códigos de barras para preencher o
produto (avaliar custo). O comerciante fornece o cardápio ou a lista de
produtos e as fotos.

**Da Olímpia:** copiar o catálogo único para todos os canais, a ordem no grupo,
o cadastro rápido dentro da busca e os campos obrigatórios com aviso fiscal.
Evitar maiúsculas automáticas, listas com quatro controles de filtro,
cadastros de confecção para todos e serviço tratado como "produto marcado como
serviço" (14, 93, 915).

---

#### `clientes` — Clientes e fornecedores

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | padrão | `relacionamento` | todos | — | sim (`clientes`, planejado) |

**Na Olímpia:** cadastro único de pessoas com papéis (cliente, colaborador,
fornecedor, transportador, produtor rural), Consulta Cliente (score de
pagamento, crédito, total comprado, frequência, gráficos, linha do tempo),
conta de crédito do cliente alimentada por trocas e devoluções (912, 918).

**Objetivo.** Ter um cadastro único de pessoas e a ficha completa de cada
cliente.

**Funcionalidades**

- *Mínimo:*
  - pessoa física ou jurídica, com papéis (cliente, fornecedor; o colaborador
    vem de `equipe`);
  - nome, WhatsApp, e-mail, CPF ou CNPJ validado (com consulta do CNPJ),
    endereços com CEP (consulta), aniversário e observações;
  - consentimento LGPD com finalidade e data;
  - cliente criado sozinho a partir do pedido (o telefone é a chave), com
    junção de duplicados;
  - ficha do cliente: pedidos, total gasto, ticket, última compra, frequência.
- *Diferencial:*
  - conta corrente do cliente (crédito e fiado), com limite, bloqueio por
    atraso e extrato;
  - score simples de pagamento;
  - ciclo de compra ("compra a cada 7 dias e está há 12 sem comprar");
  - etiquetas e segmentos;
  - dados fiscais (inscrição estadual, contribuinte, produtor rural) quando
    `fiscal` está ligado;
  - anonimização a pedido e por prazo.

**Entidades e relações**

- `Pessoa` (PF ou PJ, documento, nome, contatos) 1–N `PapelPessoa`.
- `Pessoa` 1–N `Endereco`; `Pessoa` 1–N `Consentimento`.
- `Pessoa` 1–N `LancamentoCredito` (crédito ou débito; origem troca,
  devolução, venda fiado, pagamento) → saldo.
- `Pedido` N–1 `Pessoa`.

**Fluxos principais**

1. Pedido do cardápio → cria ou atualiza o cliente pelo telefone.
2. Venda fiado → débito na conta do cliente → cobrança (`cobranca`) →
   pagamento → crédito.
3. Pedido de exclusão (LGPD) → anonimiza e mantém os valores fiscais.

**Regras de negócio**

- Telefone guardado só com dígitos e DDI.
- CPF ou CNPJ único por tenant, quando informado.
- "Consumidor final" é um registro do sistema, não editável.
- O comerciante é o controlador dos dados e a plataforma é a operadora.
- Venda fiado acima do limite pede aprovação.

**Integrações e ativação.** Consultas de CEP e CNPJ em serviços públicos
(ViaCEP, BrasilAPI). Nada do comerciante.

**Da Olímpia:** copiar a Consulta Cliente (tudo numa tela) e o cadastro único
com papéis. Evitar a lupa genérica de Pessoa que mistura papéis nos filtros e
"Clientes" e "Consulta Cliente" como dois atalhos diferentes (918, 919). O
formulário de pessoas deles não foi visto por inteiro; não se sabe se pede
consentimento.

---

#### `pedidos` — Central de pedidos

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | padrão | `vendas` | todos que vendem | `catalogo` | sim (funcional: tempo real, som, aceitar, pronto, concluir) |

**Na Olímpia:** orçamento, venda e venda cancelada como o mesmo documento
(estados 0, 1 e 2), "modalidade" da venda (retirada, entrega, loja), vendas
online da loja com estado do pedido e do pagamento separados, avisos de pedido
novo por consulta periódica e janela modal (93, 915, 916, 918).

**Objetivo.** Ver os pedidos de todos os canais num lugar só, em tempo real.

**Funcionalidades**

- *Mínimo:*
  - lista do dia em tempo real, com som e vibração;
  - estados: novo → aceito → em preparo → pronto → saiu para entrega ou
    retirado → concluído; cancelado com motivo;
  - tipo de entrega: entrega, retirada, consumo no local;
  - canal em todo pedido (cardápio, WhatsApp, balcão, iFood, 99Food, loja
    virtual...);
  - itens com opções e observação, com os preços guardados no pedido;
  - forma de pagamento e troco, e estado do pagamento separado;
  - impressão do pedido (com `perifericos` ou pelo navegador);
  - aviso ao cliente por WhatsApp (link).
- *Diferencial:*
  - estados configuráveis por tipo de entrega;
  - tempo estimado e alerta de atraso;
  - pedido agendado (com `encomendas`);
  - mensagem automática de estado ao cliente (com a API do WhatsApp);
  - histórico de quem mudou o quê;
  - pedido rápido por telefone ou WhatsApp, lançado pelo painel.

**Entidades e relações**

- `Pedido` (tenant, loja, canal, `canal_pedido_id`, número do dia, cliente,
  tipo de entrega, endereço, totais, forma de pagamento, estado) 1–N
  `ItemPedido` (cópia dos preços).
- `Pedido` 1–N `EventoPedido` (estado, quem, quando); `Pedido` 0–1 `Pessoa`.

**Fluxos principais**

1. Entrada pelo canal → pedido novo → som → aceitar → cozinha (`cozinha`) →
   pronto → entregar ou retirar → concluir.
2. Ao concluir: baixa de estoque (`estoque`) e lançamento no caixa ou no
   financeiro.

**Regras de negócio**

- Os preços são recalculados no servidor; o navegador não manda preço.
- `canal` é obrigatório; o número é sequencial por tenant e por dia.
- Cancelar um pedido pago exige motivo e estorno.
- Pedido concluído não muda: correção é devolução.

**Integrações e ativação.** Nenhuma. Os canais externos entram pelos seus
módulos (`marketplaces`, `mercado_livre`, `loja_virtual`).

**Da Olímpia:** copiar o estado do pagamento separado e a "modalidade" no
pedido. Evitar a consulta periódica de vários canais, as janelas modais em
fila que interrompem o trabalho e um ciclo sem "em preparo" e "pronto" (93,
915, 916).

---

#### `loja` — Loja, horários e entrega

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | essencial | `operacao` | todos | — | sim (essencial, funcional) |

**Na Olímpia:** empresa e filiais com empresa ativa na sessão; configuração do
frete por km (com mínimo e frete grátis) ou por bairro digitado à mão,
repetida no delivery e na loja virtual; zonas, bairros com tarifa e rotas
(93, 96).

**Objetivo.** Dizer como e quando cada unidade atende.

**Funcionalidades**

- *Mínimo:*
  - horários por dia da semana, com fuso, e "fechar agora" com reabertura;
  - aceita entrega, retirada e consumo no local;
  - pedido mínimo;
  - **área de entrega única para todos os canais**: por raio ou faixas de
    distância, por bairro (lista de bairros da cidade, não texto livre) ou por
    CEP, com taxa e tempo;
  - simulador de frete.
- *Diferencial:*
  - várias lojas por tenant, com cardápio e estoque por loja;
  - feriados e horários especiais;
  - frete grátis acima de um valor, em qualquer modo;
  - área desenhada no mapa;
  - pausar só um canal (por exemplo, fechar só o iFood).

**Entidades e relações**

- `Loja` (tenant, endereço, coordenadas, fuso, horários, aceita entrega e
  retirada) 1–N `AreaEntrega` (tipo, taxa, tempo, mínimo).
- `Bairro` (cidade, nome) da base IBGE; `HorarioEspecial`.

**Fluxos principais**

1. O cliente informa o endereço → área encontrada → taxa e tempo.
2. Endereço fora da área → recusa clara, com a opção de retirada.

**Regras de negócio**

- Aberto ou fechado é calculado do horário real e do fechamento manual.
- Uma configuração vale para todos os canais; exceção por canal só se for
  preciso.

**Integrações e ativação.** Geocodificação e distância por um serviço de mapas
(chave da plataforma).

**Da Olímpia:** evitar o frete configurado em dois lugares, o bairro sem cidade
e digitado à mão, o modo km sem raio máximo e uma base de municípios incompleta
(93, 96).

---

#### `financeiro` — Financeiro

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | padrão | `financeiro` | todos | `clientes` | sim (planejado) |

**Na Olímpia:** contas a receber e a pagar (as telas não foram abertas);
parcela com origem em venda ou OS e só dois estados (aberta, paga); comissão
gravada em cada parcela; plano de contas em árvore só de nomes, com apuração e
lançamento de crédito ou débito; previsão financeira, aging, fluxo de caixa;
contas a pagar criadas pela nota de entrada (20, 96, 98, 917).

**Objetivo.** Saber quanto entra, quanto sai e quanto sobra.

**Funcionalidades**

- *Mínimo:*
  - contas a receber e a pagar em parcelas (vencimento, valor, juros, multa,
    desconto);
  - recebimento e pagamento parcial, com saldo da parcela;
  - contas recorrentes (aluguel, luz, internet);
  - categorias prontas por segmento, com tipo (receita ou despesa), que formam
    um resultado simples do mês (DRE gerencial);
  - carteiras: caixa da loja, banco, Pix, cartão a receber;
  - fluxo realizado e previsto (8 semanas);
  - alertas de vencidos e anexos (boleto, nota).
- *Diferencial:*
  - conciliação (com `bancos`);
  - centro de custo opcional;
  - contas a pagar criadas pela entrada de nota (`estoque`), pelas comissões e
    pela pré-folha;
  - leitura do código de barras do boleto;
  - previsão a partir do saldo real dos bancos;
  - fechamento do mês enviado ao contador.

**Entidades e relações**

- `ContaFinanceira` (carteira).
- `Titulo` (receber ou pagar, pessoa, origem, categoria, centro de custo) 1–N
  `Parcela` (vencimento, valor, saldo, estado `aberta`, `parcial`, `paga`,
  `cancelada`) 1–N `Baixa` (data, valor, juros, multa, desconto, conta, forma).
- `Categoria` (tipo, linha do resultado); `Transferencia`.

**Fluxos principais**

1. Venda a prazo ou fiado → título a receber → cobrança → baixa.
2. Compra → título a pagar → pagamento → saída da conta.
3. Fim do mês → resultado simples e envio ao contador.

**Regras de negócio**

- O estado da parcela é calculado das baixas; ninguém o escolhe à mão.
- Correção é estorno, nunca apagar.
- Competência (data do fato) e caixa (data do pagamento) aparecem separados.

**Integrações e ativação.** Nenhuma obrigatória.

**Da Olímpia:** copiar a previsão (receber menos pagar, por data) e o aging.
Evitar parcela sem estado "parcial", plano de contas sem tipo, a OS marcada
como "Quitado" à mão e campos de configuração que pedem o número interno de um
cadastro (14, 20, 96, 914, 917).

---

#### `resumo` — Painel do dono

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | padrão | `inteligencia` | todos | `pedidos` | sim (funcional: números do dia e do período, top produtos) |

**Na Olímpia:** página inicial (não aberta) e BI Executivo: 12 indicadores com
link para agir, um "radar" de pontos de atenção e 11 gráficos, com filtro de
período e comparação com o período anterior (922).

**Objetivo.** Dar ao dono a visão do negócio em números grandes, no celular.

**Funcionalidades**

- *Mínimo:*
  - faturamento do dia, da semana e do mês; número de pedidos; ticket médio;
    top 10 produtos; vendas por canal;
  - comparação com o período anterior.
- *Diferencial:*
  - radar de atenção com ação: receber vencido → cobrar; estoque baixo →
    comprar; nota recusada → corrigir; caixa com diferença → ver;
  - vendas por hora e por dia da semana;
  - margem por canal depois das comissões dos apps (fase 4 do brief);
  - previsão de caixa;
  - cada bloco só aparece se o módulo estiver ligado.

**Entidades e relações.** Lê pedidos, financeiro, estoque e ponto. Cache de
indicadores opcional.

**Fluxos principais.** Abrir o painel → escolher o período → tocar num número →
lista filtrada.

**Regras de negócio.** Período sempre explícito; números só do tenant;
funciona a 360 px, sem gráficos densos.

**Integrações e ativação.** Nenhuma.

**Da Olímpia:** copiar o radar com link para agir e a comparação com o período
anterior. Evitar indicadores sem período (Gestão 360°) e o painel denso de
computador (914, 922).

---

#### `relatorios` — Relatórios

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P0 | funcional | padrão | `inteligencia` | todos | — | sim (planejado) |

**Na Olímpia:** motor genérico com 132 relatórios em 16 categorias, uma rota
para todos, filtros na URL, saída em PDF, Excel e CSV; o hub mostra só 78;
tudo depende do botão "Gerar"; a fila para relatórios grandes ainda não existe
(916 a 921).

**Objetivo.** Responder às perguntas de gestão com poucos relatórios
flexíveis.

**Funcionalidades**

- *Mínimo:*
  - catálogo declarativo: cada módulo registra os seus relatórios, e só
    aparecem os dos módulos ligados;
  - cada relatório se apresenta pela pergunta que responde ("Quem deixou de
    comprar?");
  - resultado já ao abrir (período padrão: o mês) e a cada filtro;
  - "agrupar por" (período, produto, categoria, canal, forma de pagamento,
    vendedor, cliente) e totais;
  - exportar CSV, XLSX e PDF;
  - filtros na URL, para guardar e compartilhar.
- *Diferencial:*
  - visões salvas por usuário;
  - envio agendado por WhatsApp ou e-mail (por exemplo, segunda às 8h);
  - exportação grande em segundo plano, com aviso quando ficar pronta;
  - consolidação de várias lojas;
  - "pacote do contador" no fim do mês.

**Entidades e relações**

- `DefinicaoRelatorio` (código, módulo, pergunta, filtros tipados, colunas,
  agrupamentos, permissão), no código.
- `VisaoSalva` (usuário, filtros); `Agendamento`; `ExportacaoAssincrona`.

**Fluxos principais.** Escolher a pergunta → ajustar os filtros → ver →
exportar ou agendar.

**Regras de negócio**

- Toda consulta leva o `tenantId`.
- Os estados têm os mesmos nomes das telas de trabalho.
- Filtro só filtra (nada de cadastrar dentro de um filtro).
- Documentos cancelados nunca entram em totais de impostos.

**Integrações e ativação.** Nenhuma. O envio por WhatsApp usa o mesmo canal do
`ia_whatsapp` ou um link.

**Da Olímpia:** copiar o motor genérico (uma rota, uma definição por
relatório, filtros na URL, três formatos). Evitar 132 relatórios repetidos,
dois catálogos que não batem, "Gerar" às cegas, estado em texto livre e uma
tela "em evolução" publicada (916, 917, 919, 921).

---

### 4.2 P1: food service e varejo de Porto Velho

#### `cardapio` — Cardápio digital e vitrine

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | padrão | `canais` | lanchonetes, pizzarias, açaí, marmitarias, restaurantes, bares, padarias; varejo como vitrine | `pedidos`, `catalogo` | sim (funcional) |

**Na Olímpia:** hub com painel da cozinha, pedidos online, links e QR, mesas,
tablet de autoatendimento com banners, PWA e configurações. O cardápio público
só abre a partir do QR de uma mesa; sem ele, pede para escanear (04, 922).

**Objetivo.** A página do comerciante onde o cliente final escolhe e pede, sem
criar conta.

**Funcionalidades**

- *Mínimo (já construído):*
  - página pública `/{slug}` que carrega em menos de 1,5 s em 4G, com estado
    aberto ou fechado, categorias, fotos e opções;
  - carrinho e checkout num passo (nome, telefone, entrega ou retirada,
    endereço, pagamento) → pedido registrado → WhatsApp com a mensagem pronta;
  - link e QR para divulgar no Instagram;
  - versão reduzida quando o tenant está suspenso.
- *Diferencial:*
  - QR por mesa: o pedido vai para a comanda e para a cozinha, e o cliente
    pode chamar o garçom;
  - modo tablet ou totem de autoatendimento;
  - PWA instalável;
  - Pix na hora (com `bancos`);
  - banners e destaques; domínio próprio; SEO local;
  - repetir o último pedido; cupom (com `fidelidade` ou `crm`).

**Entidades e relações.** Lê `Catalogo` e `Loja`. Usa `Mesa` e `TokenQR` (com
`comandas`) e `ConfiguracaoVitrine` (cores, banners, textos).

**Fluxos principais**

1. Instagram → página → carrinho → WhatsApp, e o pedido toca no painel.
2. QR da mesa → pedido → cozinha → conta na mesa.

**Regras de negócio**

- Os preços são recalculados no servidor.
- Produto esgotado some em menos de 5 segundos.
- O público (`anon`) só lê tenants públicos.
- Não há conta de cliente final.

**Integrações e ativação.** Nenhuma (link `wa.me`).

**Da Olímpia:** copiar o endereço por empresa com página de instalação do PWA e
o cardápio preso à mesa no salão. Evitar avisos de configuração dentro da
vitrine pública, texto todo em maiúsculas, página de link sem QR nem botão de
compartilhar, e configuração longa sem pré-visualização (93, 922).

---

#### `pdv` — PDV / frente de caixa

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `vendas` | lanchonetes, padarias, açougues, mercearias, bares, varejo | `caixa`, `catalogo`, `pedidos` | sim (planejado) |

**Na Olímpia:** a tela do PDV não foi aberta. Pelos parâmetros: atalhos de
teclado, balança pelo navegador ou pelo agente, código de pesagem, couvert,
taxa de serviço, cliente e forma de pagamento padrão, TEF, NFC-e automática e
senhas para sangria e cancelamento. Há também venda balcão, venda pelo
celular, trocas e devoluções com crédito do cliente e liberação de supervisor
(96, 915, 918).

**Objetivo.** Vender no balcão depressa, por toque, teclado ou leitor.

**Funcionalidades**

- *Mínimo:*
  - busca por nome, código ou código de barras;
  - produto pesável (lido da balança ou da etiqueta da balança);
  - quantidade e desconto, com limite por papel e aprovação do gerente;
  - várias formas de pagamento, pagamento dividido e troco;
  - cliente opcional e CPF na nota;
  - comprovante não fiscal ou NFC-e (com `fiscal`);
  - cancelar item ou venda com motivo e aprovação;
  - atalhos de teclado; funciona em tablet e PC;
  - modo sem internet com fila.
- *Diferencial:*
  - Pix com QR na tela e confirmação automática (com `bancos`);
  - maquininha integrada (com `cartoes`);
  - trocas e devoluções com vale-troca ou crédito do cliente;
  - venda pelo celular (feira, ambulante, evento);
  - orçamento que vira venda;
  - preço por forma de pagamento;
  - consulta de preço para o cliente.

**Entidades e relações**

- A venda do PDV é um `Pedido` com canal `balcao`.
- `Pagamento` (forma, valor, troco, NSU, txid) N–1 `Pedido`.
- `SessaoCaixa` (de `caixa`).
- `Troca` (itens devolvidos e entregues; a diferença vira crédito ou cobrança).

**Fluxos principais**

1. Abrir o caixa → vender → receber → (NFC-e) → imprimir → baixa de estoque →
   fechar o caixa.
2. Troca: achar a venda de origem → devolver itens → entregar os novos →
   acertar a diferença.

**Regras de negócio**

- Só vende com sessão de caixa aberta.
- Desconto acima do limite do papel pede aprovação.
- Cancelar depois da NFC-e segue o prazo da SEFAZ (ver `fiscal`).
- Sem internet: numeração local e sincronização sem duplicar.

**Integrações e ativação.** Hardware por `perifericos`, maquininha por
`cartoes`, NFC-e por `fiscal`. O PDV em si não pede nada do comerciante.

**Da Olímpia:** copiar o código de pesagem da balança, couvert e taxa de
serviço, e "desfazer" com motivo. Evitar senhas guardadas nos parâmetros, 58
opções de PDV com jargão e o faturamento em lote para quem não tem vendedor
externo (96, 915, 918).

---

#### `caixa` — Caixa

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `financeiro` | todos com balcão | `financeiro` | sim (planejado) |

**Na Olímpia:** as telas de caixa não foram abertas. Pelos parâmetros e pelos
relatórios: fechamento cego por forma de pagamento (com opção de não totalizar
o Pix), caixa central, pré-fechamento, senha no fechamento, NFC-e no
recebimento, transferência do saldo do caixa anterior; relatórios de
conferência cega, histórico, sangrias, suprimentos e caixa por vendedor (96,
916).

**Objetivo.** Controlar o dinheiro da gaveta e fechar o dia sem diferença.

**Funcionalidades**

- *Mínimo:*
  - abrir a sessão com o fundo de troco;
  - suprimento e sangria com motivo (sangria acima de um valor pede
    aprovação);
  - recebimentos por forma de pagamento;
  - fechamento cego por forma de pagamento (o operador conta sem ver o valor
    esperado);
  - diferença (sobra ou falta) com justificativa e aprovação do gerente;
  - histórico e comprovantes.
- *Diferencial:*
  - vários caixas e terminais; cofre (caixa central);
  - fechamento enviado ao dono no WhatsApp (`ia_whatsapp`);
  - recebimento de fiado e de contas no caixa;
  - valor líquido das vendas no cartão, com as taxas.

**Entidades e relações**

- `Terminal`.
- `SessaoCaixa` (terminal, operador, abertura, fechamento, estado `aberta`,
  `fechada`, `conferida`) 1–N `MovimentoCaixa` (tipo venda, recebimento,
  suprimento, sangria ou estorno; forma, valor, motivo, aprovador).
- `Conferencia` (por forma: esperado, informado, diferença).

**Fluxos principais.** Abrir → movimentar → sangria → fechar às cegas →
conferir → aprovar → lançamentos no `financeiro`.

**Regras de negócio**

- Um operador por sessão.
- Não fecha com venda pendente.
- A diferença registrada nunca some; reabrir exige aprovação e fica na
  auditoria.

**Integrações e ativação.** Nenhuma.

**Da Olímpia:** copiar o fechamento cego configurável por forma de pagamento.
Evitar o atalho "Caixa" que abre outra tela ("recebimento") e um selo de modo
de baixa sem explicação (91, 96, 99).

---

#### `comandas` — Mesas e comandas

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `vendas` | restaurantes, bares, lanchonetes com salão, pizzarias | `pedidos`, `caixa` | sim (planejado) |

**Na Olímpia:** comanda do garçom num PWA que pede empresa, usuário e senha do
ERP; mesas e QR codes; tablet de autoatendimento; "Sinuca", para cobrar mesas
por tempo; extrato de mesa no fechamento. Nenhuma tela interna foi vista (04,
922, 96).

**Objetivo.** Atender o salão do pedido do garçom até a conta fechada.

**Funcionalidades**

- *Mínimo:*
  - mapa de mesas (livre, ocupada, conta pedida);
  - comanda por mesa ou por cliente;
  - o garçom lança pelo celular (app da equipe com PIN), com observações e
    opções;
  - envio à cozinha por setor;
  - conta parcial; transferir e juntar mesas;
  - dividir a conta (por pessoa ou por itens);
  - taxa de serviço opcional e couvert;
  - fechamento no caixa (`caixa` ou `pdv`).
- *Diferencial:*
  - o cliente pede pelo QR da mesa e o garçom aprova;
  - chamar o garçom pelo QR;
  - mesa por tempo (sinuca, bilhar, quadra) com cobrança por hora;
  - comanda individual (cartão ou pulseira) em bares;
  - pré-conta no WhatsApp do cliente.

**Entidades e relações**

- `Mesa` (número, área, capacidade, estado).
- `Comanda` (mesa, garçom, pessoas, estado `aberta`, `conta`, `fechada`) 1–N
  itens (os itens do pedido).
- `UsoMesaTempo` (início, fim, tarifa), para mesas por tempo.

**Fluxos principais.** Abrir a mesa → lançar itens → cozinha → pré-conta →
dividir → pagar → fechar → mesa livre.

**Regras de negócio**

- Item já enviado à cozinha só sai por cancelamento com motivo.
- A taxa de serviço é opcional para o cliente; o rateio entre a equipe segue a
  lei da gorjeta (Lei 13.419/2017; confirmar com o contador).
- Comanda fechada não muda.

**Integrações e ativação.** Impressoras por `perifericos`.

**Da Olímpia:** copiar o extrato de mesa e a mesa por tempo. Evitar a operação
de salão espalhada em quatro lugares do menu e o garçom entrando com o login
do ERP (04, 922).

---

#### `cozinha` — Cozinha e expedição

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `operacao` | restaurantes, lanchonetes, pizzarias, bares, marmitarias | `pedidos` | sim (planejado) |

**Na Olímpia:** "Painel Cozinha" e "Balcão de Entrega" existem no menu, mas não
foram abertos (04, 90).

**Objetivo.** A cozinha vê o que fazer e em que ordem, e avisa quando está
pronto.

**Funcionalidades**

- *Mínimo:*
  - tela da cozinha (tablet ou TV) com cartões por pedido e por estação
    (cozinha, bar, chapa);
  - tempo desde a entrada e alerta de atraso;
  - "em preparo" e "pronto" com um toque; som;
  - impressão por setor como alternativa à tela.
- *Diferencial:*
  - itens enviados à estação certa (bebida vai para o bar);
  - tempo médio de preparo por produto;
  - fila de expedição (pronto → retirado ou saiu);
  - chamada no painel de senhas (`painel_tv`);
  - aviso "pronto para retirar" no WhatsApp do cliente.

**Entidades e relações.** `Estacao` (nome, categorias ou produtos); estado de
preparo em cada `ItemPedido`; `EventoPreparo`.

**Fluxos principais.** Pedido aceito → itens nas estações → preparo → pronto →
expedição → entregue.

**Regras de negócio**

- Item cancelado depois de começado vira perda no estoque.
- A tela funciona sem toque (modo TV) e com toque.

**Integrações e ativação.** Impressoras de cozinha por `perifericos`.

**Da Olímpia:** nada a copiar, porque as telas não foram vistas. Evitar o
modelo de consulta periódica com janelas modais (91, 915).

---

#### `delivery` — Delivery próprio

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `operacao` | lanchonetes, pizzarias, marmitarias, açaí, açougues e mercearias que entregam | `pedidos` | sim (planejado) |

**Na Olímpia:** configuração do frete (por km ou por bairro); o app do
entregador entra com telefone e PIN e, segundo o manual, tem GPS e prova de
entrega; a tela de pedidos e a de entregadores não foram abertas (93, 922).

**Objetivo.** Despachar e acompanhar as entregas feitas pelos entregadores do
próprio comerciante.

**Funcionalidades**

- *Mínimo:*
  - fila de pedidos para entrega;
  - cadastro de entregadores (próprios ou avulsos) com PIN;
  - atribuir um ou mais pedidos a um entregador;
  - app do entregador: lista, endereço com link para o mapa, ligar ou chamar o
    cliente no WhatsApp, "saiu" e "entregue";
  - taxa por entrega e acerto do dia (entregas, taxas e dinheiro recebido na
    rua).
- *Diferencial:*
  - agrupar entregas por região e sugerir a ordem;
  - link de acompanhamento para o cliente;
  - prova de entrega (foto ou assinatura);
  - tempo médio de entrega;
  - chamar entregador de parceiro sob demanda, onde houver serviço em Porto
    Velho.

**Entidades e relações**

- `Entregador` (pessoa, telefone, PIN, veículo, taxa padrão).
- `Entrega` (pedido, entregador, saída, entrega, distância, taxa, prova,
  estado).
- `AcertoEntregador` (período, entregas, taxas, valores recebidos, pago).

**Fluxos principais.** Pedido pronto → atribuir → saiu (o cliente é avisado) →
entregue (prova) → acerto no fim do dia → conta a pagar ao entregador
(`financeiro`).

**Regras de negócio**

- O dinheiro que o entregador recebe entra no caixa no acerto.
- Não somos uma rede de entregadores: o módulo gere os do comerciante e
  integra parceiros.

**Integrações e ativação.** Mapas (rota e distância) com chave da plataforma.
Parceiros de entrega são opcionais e usam a conta do comerciante.

**Da Olímpia:** copiar o app do entregador com telefone e PIN. Evitar o frete
configurado em dois lugares e um ciclo de pedido sem "pronto" (93, 922).

---

#### `estoque` — Estoque

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `estoque` | açougues, mercearias, padarias, varejo, restaurantes (insumos) | `catalogo` | sim (planejado) |

**Na Olímpia:** documentos com estado (pendente, concluído, cancelado), 41
operações fiscais iguais para entrada e saída, locais (geral, prateleira,
reserva, entrega futura) e grade; entrada por XML com busca automática das
notas na SEFAZ a cada 5 minutos e manifestação em lote; entrada manual com
custo sugerido; saída com desconto e acréscimo; troca; transferência entre
filiais; balanço por contagem; histórico com saldo antes e depois (96, 919,
920).

**Objetivo.** Saber quanto há, quanto vale e para onde foi.

**Funcionalidades**

- *Mínimo:*
  - saldo por produto e por insumo, em cada loja;
  - entrada manual e por XML da NF-e (envio do arquivo): liga os itens pelo
    código ou pelo código de barras, lembra o vínculo para a próxima nota e
    converte a unidade (caixa com 12 → 12 unidades);
  - saídas com motivos simples: perda, consumo interno, validade, doação,
    ajuste;
  - baixa automática na venda (e pelos insumos da ficha técnica, com
    `producao`);
  - inventário pelo celular, com leitor de código e contagem cega opcional,
    gerando o ajuste;
  - estoque mínimo e alerta;
  - histórico de movimentos com link para o documento de origem;
  - custo médio.
- *Diferencial:*
  - lote e validade (alimentos);
  - transferência entre lojas com confirmação de recebimento;
  - notas de compra chegando sozinhas da SEFAZ (com `fiscal`);
  - contas a pagar criadas pelas duplicatas da nota;
  - estoque parado e curva ABC;
  - valor do estoque numa data passada;
  - sugestão de compra.

**Entidades e relações**

- Item de estoque: `Produto` ou `Insumo` (unidade, mínimo, custo médio).
- `Local` (loja ou depósito); `Saldo` (item × local × lote).
- `Movimento` (tipo entrada, saída ou ajuste; motivo; quantidade; custo;
  documento de origem; usuário). Não se edita.
- `Entrada` (fornecedor, NF, chave, itens, estado `pendente`, `concluida`,
  `cancelada`); `Inventario` (itens contados, diferença); `Transferencia`.

**Fluxos principais**

1. Compra → XML → conferir os itens → concluir → saldo, custo e contas a pagar.
2. Venda → baixa. Perda → saída com motivo.
3. Inventário do mês → ajuste.

**Regras de negócio**

- Estoque negativo configurável (bloquear ou só avisar).
- Movimento nunca é editado: corrige-se com estorno.
- O custo médio é recalculado em cada entrada.
- A conversão de unidade é lembrada por fornecedor e produto.

**Integrações e ativação.** O envio do XML não pede nada. A busca automática na
SEFAZ e a manifestação dependem do certificado A1 do comerciante (ficam em
`fiscal`).

**Da Olímpia:** copiar os documentos com estado, o histórico com saldo antes e
depois, as regras da manifestação explicadas na tela e o custo sugerido.
Evitar as 41 operações fiscais na mesma lista para entrada e saída, a saída
que nasce com a operação "ENTRADA", o produto digitado pelo número na
transferência, salvar antes de importar a venda numa devolução e um hub sem
indicadores (96, 919, 920).

---

#### `producao` — Produção, fichas técnicas e custo

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `estoque` | restaurantes, lanchonetes, padarias, confeitarias, marmitarias, pizzarias, açaí | `estoque` | sim (planejado; as tabelas `insumos` e `fichas` já existem, sem telas) |

**Na Olímpia:** as telas de produção não foram abertas. Na Central há
relatórios de ordens de produção, de insumos e de composição (ficha técnica), e
o "CRM Markup" guarda metas de markup por grupo de produto (10, 916).

**Objetivo.** Saber o custo real de cada produto e baixar os insumos certos.
É "o número que o comerciante nunca sabe", segundo o brief.

**Funcionalidades**

- *Mínimo:*
  - insumos com unidade de compra, unidade de uso e custo;
  - ficha técnica por produto e por opção ou adicional: quantidade de cada
    insumo, rendimento e perda;
  - custo do produto e margem (CMV), atualizados quando o custo do insumo muda;
  - preço sugerido a partir de um markup alvo por categoria;
  - baixa dos insumos quando o pedido é concluído.
- *Diferencial:*
  - ordens de produção (padaria, cozinha central, marmitaria): produzir N
    unidades consome os insumos e dá entrada no produto pronto, com lote e
    validade;
  - pré-preparos (molho, massa) como ficha dentro de ficha;
  - produção planejada a partir das encomendas do dia;
  - etiqueta de manipulação e validade (seguir as regras da Anvisa para
    serviços de alimentação; confirmar);
  - ficha de preparo com foto e modo de fazer.

**Entidades e relações**

- `Insumo` (existe); `Ficha` (existe: produto × insumo × quantidade), mais
  rendimento, perda e versão.
- `OrdemProducao` (produto, quantidade, estado `planejada`, `em_producao`,
  `concluida`, consumo real, perda).
- `CustoProduto` (histórico).

**Fluxos principais**

1. Cadastrar insumos (de preferência pela nota de compra) → montar a ficha →
   ver CMV e margem → ajustar o preço.
2. Venda concluída → baixa dos insumos.
3. Ordem de produção → baixa dos insumos → entrada do produto pronto.

**Regras de negócio**

- A ficha tem versão: mudar a ficha não altera o custo das vendas antigas.
- Unidade de compra × unidade de uso com fator de conversão.
- O custo usa o custo médio do insumo.

**Integrações e ativação.** Nenhuma.

**Da Olímpia:** lá a composição e o markup ficam escondidos em relatórios e
cadastros soltos; aqui CMV e margem ficam no centro da tela do produto (10,
916).

---

#### `perifericos` — Impressoras, balança e gaveta

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | funcional | opcional | `operacao` | todos com balcão ou cozinha; açougues e padarias (balança) | — | não |

**Na Olímpia:** o "Olimpia Bridge", um programa instalado no PC da loja (Windows
e macOS) com uma API local que imprime (texto, ESC/POS, ZPL, imagem, PDF), abre
a gaveta, lê a balança e lista as impressoras, pareado por um token gerado no
ERP; os parâmetros do sistema configuram balança (porta serial ou Web Serial no
navegador), etiqueta e carga das balanças Toledo, Filizola e Urano, gaveta e
leitor (915).

**Objetivo.** Ligar o navegador ao hardware da loja sem complicação.

**Funcionalidades**

- *Mínimo:*
  - impressão de pedidos e comprovantes em impressora térmica (ESC/POS) e
    impressão por setor (cozinha, bar);
  - abrir a gaveta;
  - ler o peso da balança no PDV e interpretar a etiqueta da balança (peso ou
    preço dentro do código de barras);
  - teste de cada aparelho;
  - agente local leve, pareado por código de uso único; quando possível, Web
    Serial ou WebUSB direto do navegador.
- *Diferencial:*
  - carga de itens e preços para balanças etiquetadoras, gerada do catálogo;
  - impressoras detectadas pelo agente (sem lista fixa);
  - fila de impressão com reenvio;
  - impressão remota: o pedido do cardápio sai na cozinha sem ninguém tocar;
  - configuração por terminal.

**Entidades e relações**

- `Terminal` (loja, nome, agente pareado, impressora por função).
- `Agente` (versão, último contato, token revogável).
- `ConfiguracaoBalanca` (modelo, formato da etiqueta, dígitos).
- `TrabalhoImpressao` (destino, conteúdo, estado).

**Fluxos principais.** Instalar o agente → parear com o código → escolher a
impressora de cada função → testar.

**Regras de negócio**

- O servidor nunca acessa USB nem porta serial; só o agente ou o navegador.
- Pareamento revogável a qualquer momento.
- Nota fiscal impressa a partir do PDF ou do layout do emissor.

**Integrações e ativação.** O agente é nosso (Windows primeiro). O comerciante
fornece o PC ou tablet com o agente e os aparelhos.

**Da Olímpia:** copiar o agente único com pareamento por token, os testes
rápidos e a carga de balança. Evitar levar para a web os parâmetros do desktop
(temas de interface, portas COM e LPT, backup ao fechar), a lista fixa de
impressoras e um botão "Fechar" que leva a um endereço técnico (915).

---

#### `fiscal` — Nota fiscal (NFC-e, NF-e, NFS-e)

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | pre_funcional | opcional | `fiscal` | varejo, food com balcão, açougues, padarias; oficinas (NFS-e) | `catalogo`, `clientes` | sim (planejado) |

**Na Olímpia:** gestor único de NFC-e, NF-e e NFS-e; a nota nasce de uma venda,
de uma saída ou de uma OS digitada pelo número, com uma "operação" que traz
CFOP, CST e alíquotas de um grupo tributário de cerca de 150 campos de texto
livre (já com IBS, CBS e Imposto Seletivo); pré-visualização sem envio, carta
de correção, cancelamento, nota referenciada, consulta por chave; manifestação
e busca das notas de compra na SEFAZ; séries, CFOP, conversão de CFOP, SPED;
17 relatórios fiscais; portal do contador (não aberto) (13, 912, 96, 921).

**Objetivo.** Emitir a nota certa num clique, a partir da venda, sem o
comerciante precisar entender de tributação.

**Funcionalidades**

- *Mínimo:*
  - NFC-e a partir do pedido ou da venda do PDV, com CPF opcional;
  - NF-e para cliente identificado (venda a empresa, devolução);
  - perfis tributários prontos por regime (Simples Nacional primeiro) e por
    segmento, ligados à categoria ou ao produto;
  - estados em português: rascunho, enviando, autorizada, recusada (com o
    motivo explicado), cancelada, inutilizada, em contingência;
  - cancelamento e carta de correção;
  - DANFE ou cupom impresso, por e-mail ou no WhatsApp;
  - XML guardado;
  - pendências fiscais no painel (nota recusada, contingência por enviar,
    certificado a vencer);
  - pacote mensal para o contador (XMLs e resumo).
- *Diferencial:*
  - NFS-e a partir da OS (padrão nacional ou de Porto Velho, a confirmar);
  - notas de compra que chegam sozinhas (distribuição DF-e) e manifestação;
  - contingência offline da NFC-e;
  - NF-e de devolução e de transferência;
  - checagem do cadastro antes de emitir (NCM, CEST, CPF ou CNPJ);
  - Reforma Tributária (IBS, CBS) pelo emissor parceiro;
  - acesso do contador por link.

**Entidades e relações**

- `ConfiguracaoFiscal` (regime, IE, IM, CSC da NFC-e, séries, ambiente;
  certificado no cofre).
- `PerfilTributario` (CFOP, CST ou CSOSN, alíquotas), mantido pela
  plataforma.
- `DocumentoFiscal` (modelo, série, número, chave, origem pedido, OS ou saída,
  estado, protocolo, motivo, XML, PDF) 1–N `EventoFiscal` (cancelamento,
  carta de correção); `DocumentoReferenciado`.

**Fluxos principais**

1. Concluir a venda → emitir a NFC-e (sozinha ou por botão) → emissor parceiro
   → SEFAZ → autorizada (imprime ou envia) ou recusada (pendência com
   explicação e correção).
2. Cancelamento dentro do prazo.
3. Fim do mês → pacote para o contador.

**Regras de negócio**

- Não construímos emissor (regra do produto): usamos um parceiro homologado.
- Prazos de cancelamento e de contingência seguem a SEFAZ de Rondônia
  (confirmar com o contador).
- Nota não se apaga.
- Os dados fiscais do produto só são obrigatórios com este módulo ligado.
- Certificado e CSC ficam no cofre, nunca em texto aberto.

**Integrações e ativação.** Emissor parceiro (por exemplo Focus NFe, PlugNotas
da Tecnospeed, NFe.io ou WebmaniaBR; escolher um), SEFAZ de Rondônia e
prefeitura de Porto Velho (NFS-e). O comerciante fornece:

- certificado digital A1 (arquivo .pfx e senha);
- inscrição estadual (e municipal, para NFS-e);
- CSC e id do token da NFC-e, gerados no portal da SEFAZ;
- credenciamento como emissor;
- regime tributário e a orientação do seu contador.

**Da Olímpia:** copiar a pré-visualização sem envio, a chave da NFC-e
referenciada sozinha na NF-e seguinte, a consulta por chave e as regras da
manifestação explicadas na tela. Evitar o grupo tributário de 150 campos livres,
a lista de 20 operações com erros de digitação, digitar o número da venda para
emitir, os códigos da SEFAZ como estado e a NFS-e misturada na mesma tela da
NFC-e (13, 912, 921).

---

#### `bancos` — Bancos e Pix

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | pre_funcional | opcional | `financeiro` | todos | `financeiro` | sim (planejado; ativação: conta num banco com API Pix e webhook) |

**Na Olímpia:** integração bancária no cadastro da empresa com 16 provedores de
boleto (API ou arquivo CNAB 240 e 400) e 12 de Pix, teste de conexão e de
geração de QR; Pix no caixa e no PDV ao marcar a forma de recebimento;
movimentação bancária; conciliação por arquivo OFX com regras por descrição e
sem duplicar na reimportação; baixa por arquivo de retorno ou por consulta
periódica (Sicredi) (96, 99, 918, 922).

**Objetivo.** Receber por Pix com confirmação automática e conhecer o saldo
real.

**Funcionalidades**

- *Mínimo:*
  - contas bancárias;
  - Pix dinâmico (QR e copia-e-cola) no PDV, no cardápio e no link de
    cobrança, com baixa automática pelo webhook do banco, sem conferir o
    extrato;
  - extrato e saldo;
  - importação de OFX sem duplicar e conciliação assistida.
- *Diferencial:*
  - **webhooks bancários em tempo real:** o Pix pago aparece no caixa e no
    painel na hora;
  - conciliação automática por regras que aprendem com o uso;
  - Pix Automático (recorrência) para clientes que pagam todo mês;
  - leitura do extrato pelo Open Finance, quando viável;
  - várias contas e bancos.

**Entidades e relações**

- `ContaBancaria` (banco, agência, conta, chave Pix, provedor; credenciais no
  cofre).
- `CobrancaPix` (txid, valor, vencimento, estado `criada`, `paga`, `expirada`,
  `devolvida`, origem pedido ou parcela).
- `EventoWebhook` (provedor, conteúdo, assinatura verificada, processado).
- `MovimentoBancario` (data, valor com sinal, descrição, identificador do OFX,
  estado `pendente`, `conciliado`, `ignorado`); `RegraConciliacao`.

**Fluxos principais**

1. Gerar o Pix → o cliente paga → webhook verificado → baixa da parcela ou do
   pedido → caixa e financeiro atualizados → aviso.
2. OFX → conciliar → pendências.

**Regras de negócio**

- Webhook idempotente (pelo txid ou pelo identificador da transação) e com
  assinatura ou certificado verificado.
- Nunca baixar sem a confirmação do banco.
- Devolução de Pix gera estorno.
- Credenciais só no cofre.

**Integrações e ativação.** APIs Pix de bancos e intermediários (Banco do
Brasil, Sicoob, Sicredi, Inter, Itaú, Bradesco, Santander, Efí, Asaas, Mercado
Pago, PagBank...), escolhidos pela demanda em Porto Velho. O comerciante
fornece: conta PJ no banco ou intermediário, chave Pix, credenciais de API
(id e segredo do cliente), certificado quando o banco exige e a autorização do
webhook.

**Da Olímpia:** copiar a importação de OFX sem cadastro prévio, sem duplicar,
com regras por descrição, e o teste de geração de QR. Evitar depender só de
arquivo de retorno ou de consulta periódica, e mostrar chaves em texto aberto
(96, 99, 910).

---

#### `cobranca` — Cobrança, fiado e links de pagamento

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | pre_funcional | opcional | `financeiro` | mercearias, açougues e padarias (fiado), varejo, distribuidoras, oficinas | `financeiro`, `clientes` | sim (planejado; ativação: conta num gateway) |

**Na Olímpia:** réguas com três etapas fixas e só por e-mail (3 dias antes, no
dia e 5 dias depois do vencimento), botão "Executar réguas" sem prévia, links
de pagamento (Pix, boleto, cartão) por parcela, três gateways (Asaas, Efí,
Mercado Pago) com um único campo de chave marcado "stub"; boletos com remessa e
retorno (910, 918).

**Objetivo.** Receber o que é devido sem constrangimento e sem trabalho
manual.

**Funcionalidades**

- *Mínimo:*
  - link de pagamento (Pix, boleto, cartão) gerado a partir da parcela ou da
    ficha do cliente, com o botão "mandar no WhatsApp";
  - régua editável (dias, canal, texto da mensagem), com o WhatsApp como canal
    padrão;
  - prévia antes de qualquer envio em massa;
  - baixa automática pelo gateway (webhook);
  - fiado ou caderneta, com extrato que o cliente recebe.
- *Diferencial:*
  - boleto com Pix (híbrido) e carnê;
  - juros e multa automáticos;
  - negociação e parcelamento de dívida;
  - indicadores: em atraso, recuperado, taxa de pagamento depois da mensagem;
  - rotina automática visível ("próxima execução às 9h").

**Entidades e relações**

- `Gateway` (provedor, ambiente, credenciais no cofre, webhook).
- `LinkPagamento` (parcela, tipo, valor, endereço, validade, estado).
- `Regua` 1–N `EtapaRegua` (dias em relação ao vencimento, canal, modelo de
  mensagem); `ExecucaoRegua` (parcela, etapa, canal, estado, data).
- `Boleto` (nosso número, linha digitável, estado).

**Fluxos principais.** Venda a prazo ou fiado → parcela → a régua manda o
lembrete → o cliente paga pelo link → webhook → baixa → a régua para.

**Regras de negócio**

- Só cobra parcela em aberto.
- Envio manual em massa sempre com prévia ("X mensagens serão enviadas").
- Respeitar horário comercial, opt-out e as regras do WhatsApp.
- O valor do link é o da parcela mais os encargos.

**Integrações e ativação.** Gateway (Asaas, Efí, Mercado Pago, PagBank, Cora,
Inter...). O comerciante fornece conta no gateway e chave de API. Para a régua
mandar WhatsApp sozinha, um número com a API oficial; sem ela, o envio é feito
por link, um a um.

**Da Olímpia:** copiar a escolha da parcela em aberto com os dias de atraso
visíveis. Evitar a régua fixa só por e-mail, o disparo sem prévia, o número
interno da parcela como campo principal e o gateway com um único campo genérico
(910).

---

#### `marketplaces` — Apps de delivery (iFood, 99Food)

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | pre_funcional | opcional | `canais` | lanchonetes, pizzarias, açaí, restaurantes, marmitarias | `pedidos`, `catalogo` | sim (planejado; hoje inclui o Mercado Livre) |

**Na Olímpia:** não aparece integração com iFood nem com 99Food, nem no menu
nem nos planos. É a maior lacuna deles para o food service (00-mapa).

**Objetivo.** Ter os pedidos dos apps no mesmo painel e o catálogo
sincronizado, sem um tablet por app.

**Funcionalidades**

- *Mínimo:*
  - receber os pedidos do app e confirmá-los no nosso painel;
  - mudar o estado no app a partir do nosso painel;
  - disponibilidade sincronizada (esgotar no catálogo pausa o item no app);
  - preço por canal;
  - canal gravado em cada pedido.
- *Diferencial:*
  - catálogo enviado do nosso cadastro (Open Delivery);
  - conciliação de taxas e repasses;
  - margem por canal no `resumo`;
  - pausar a loja só num app;
  - avaliações e mensagens, se a API permitir.

**Entidades e relações**

- `ConexaoCanal` (canal, loja, id do lojista ou `AppShopID`, estado; tokens no
  cofre).
- Pedido externo → `Pedido` (`canal_pedido_id`).
- `MapeamentoProduto` (produto ↔ id no app); `Repasse` (período, bruto, taxas,
  líquido).

**Fluxos principais.** Autorizar a loja → enviar ou importar o catálogo → os
pedidos entram com som → aceitar → estados sincronizados → repasse
conciliado.

**Regras de negócio**

- Formato interno Open Delivery; o iFood tem adaptador próprio.
- A 99Food aceita só um integrador ativo por loja.
- A homologação do iFood exige app completo e funcional e conta com CNPJ e
  CNAE de tecnologia (obrigação nossa).
- A permissão é aceita no portal do parceiro por um usuário dono da loja; se
  esse usuário for desativado, a integração para.

**Integrações e ativação.** API do iFood e Open Delivery (99Food). O comerciante
fornece a loja ativa no app e o aceite da integração no portal do parceiro.

**Da Olímpia:** não há o que copiar; é aqui que ganhamos o food service.

---

#### `ia_whatsapp` — Assistente com IA no WhatsApp

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | pre_funcional | opcional | `inteligencia` | todos (o dono) | `resumo` | sim (planejado; ativação: número do dono e, para envio próprio, a API oficial) |

**Na Olímpia:** um agente de vendas com IA atende clientes no WhatsApp e cria
vendas ou orçamentos no ERP (adicional fora do plano Full; a equipe confirma o
recebimento numa janela); o consultor "Advisor" usa a OpenAI, mas fica
desativado sem uma chave que só o Super Admin da plataforma cadastra; o
assistente de ajuda flutuante não foi testado (915, 914, 922).

**Objetivo.** O dono acompanha e pergunta sobre o negócio pelo WhatsApp, sem
abrir o sistema.

**Funcionalidades**

- *Mínimo:*
  - **resumo diário** no horário escolhido, conforme os módulos ligados:
    vendas por canal, ticket, top produtos, caixa e diferenças, contas a pagar
    e a receber do dia, estoque baixo, ponto (quem faltou ou atrasou);
  - alertas: caixa com diferença, nota recusada, Pix alto recebido, pedido
    parado;
  - perguntas em linguagem natural ("quanto vendi ontem no iFood?"), com
    resposta só com os dados do próprio tenant;
  - opt-in do dono e de cada destinatário.
- *Diferencial:*
  - atendente de vendas para o cliente final: responde dúvidas, monta o
    pedido a partir do cardápio, manda o link de pagamento e cria o pedido para
    a equipe confirmar;
  - comandos ("fechar a loja agora", "esgotar a coxinha") com confirmação;
  - resumo semanal com comparação e sugestões;
  - mensagens de voz.

**Entidades e relações**

- `DestinatarioResumo` (pessoa, número, horário, módulos, opt-in).
- `MensagemEnviada` (modelo, estado).
- `ConversaIA` (pergunta, resposta, ferramentas usadas, custo).
- Ferramentas da IA: consultas permitidas por módulo, só de leitura.

**Fluxos principais.** Ativar → confirmar o número com um código → escolher o
horário → receber todo dia → perguntar → a IA consulta só o tenant → responde.

**Regras de negócio**

- A IA só lê; qualquer ação exige confirmação.
- Dados sensíveis (salários, atestados) ficam de fora.
- Conversas registradas e custo limitado por tenant.
- Mensagens proativas usam modelos aprovados pela Meta.

**Integrações e ativação.** WhatsApp Business Platform (Cloud API): número da
plataforma para os resumos ao dono, ou número próprio do comerciante; modelo
de linguagem com chave da plataforma. O comerciante fornece o número do dono
(e da equipe) com consentimento. Para o atendente do cliente final, um número
próprio com a API oficial e verificação da Meta.

**Da Olímpia:** lá a IA de vendas é um adicional e o consultor depende de uma
chave que o cliente não controla. O nosso vem incluído na mensalidade, a IA é
configurada por nós e o assistente fala com o dono (915, 914).

---

### 4.3 P2: segmentos específicos

#### `encomendas` — Encomendas e orçamentos

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `vendas` | confeitarias, padarias, salgaderias, buffets, marmitarias com contrato, açougues (churrasco) | `pedidos`, `clientes` | não |

**Na Olímpia:** o orçamento é uma venda em estado 0 que vira venda ou é
cancelada; o relatório de orçamentos mostra só os abertos, sem funil; o botão
"Orçamento" da OS leva para a venda balcão (918, 14).

**Objetivo.** Vender sob encomenda, com data marcada, sinal e aprovação do
cliente.

**Funcionalidades**

- *Mínimo:*
  - encomenda com data e hora de entrega ou retirada, itens com
    personalização (sabor, tema, texto do bolo), sinal e saldo;
  - orçamento enviado por link ou WhatsApp para o cliente aprovar;
  - agenda de produção do dia;
  - lembrete ao cliente; a encomenda vira pedido no dia.
- *Diferencial:*
  - foto de referência anexada;
  - produção planejada a partir das encomendas (`producao`);
  - limite de encomendas por dia;
  - motivo de perda do orçamento (funil);
  - termo simples para eventos.

**Entidades e relações**

- `Encomenda` (pedido agendado: data prevista, sinal, saldo, estado
  `orcamento`, `aprovada`, `em_producao`, `pronta`, `entregue`, `cancelada`).
- `Orcamento` (validade, link, aceite com data e IP).
- `Personalizacao` (campos livres por produto).

**Fluxos principais.** Orçamento → aprovação pelo link → sinal (Pix) →
produção na data → retirada ou entrega → saldo.

**Regras de negócio**

- O sinal entra no financeiro como adiantamento do cliente.
- Cancelamento segue uma política configurável (devolve ou retém o sinal).

**Integrações e ativação.** Nenhuma obrigatória; Pix por `bancos`.

**Da Olímpia:** evitar o orçamento sem funil e sem aprovação pelo cliente (918,
14).

---

#### `desossa` — Desossa e cortes

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `estoque` | açougues, casas de carnes, pequenos frigoríficos | `producao`, `estoque` | não (citada na descrição de `producao`) |

**Na Olímpia:** sete telas de desossa (nova, lista, fichas, relatórios,
derivados, rendimentos, configuração); nenhuma foi aberta. A conta de teste é
uma casa de carnes (10, 97, 98).

**Objetivo.** Transformar a peça comprada em cortes com custo e rendimento
reais.

**Funcionalidades**

- *Mínimo:*
  - ficha de desossa por tipo de peça (traseiro, dianteiro, carcaça), com os
    cortes esperados e o rendimento de cada um em %;
  - desossa: peso de entrada (da balança), custo da peça (da nota de compra),
    pesagem de cada corte, osso, sebo, aparas e quebra;
  - rendimento real × esperado;
  - rateio do custo entre os cortes, pelo valor de venda (padrão) ou pelo
    peso;
  - entrada dos cortes no estoque, com lote e data;
  - etiqueta com peso, preço e validade.
- *Diferencial:*
  - rendimento comparado por fornecedor e por lote;
  - alerta de quebra acima da tolerância;
  - preços mandados para a balança etiquetadora;
  - margem por corte;
  - rastreio do lote do fornecedor até os cortes vendidos.

**Entidades e relações**

- `FichaDesossa` (peça, cortes esperados em %, tolerância, versão).
- `Desossa` (data, peça de entrada, fornecedor, lote, peso, custo, estado) 1–N
  `CorteDesossa` (produto, peso, % real, custo rateado).
- Subprodutos e perdas.

**Fluxos principais.** Compra da peça (entrada) → nova desossa com a ficha →
pesar os cortes → conferir o rendimento → concluir (sai a peça, entram os
cortes) → etiquetas.

**Regras de negócio**

- Peso dos cortes mais perdas é igual ao peso de entrada, dentro da tolerância.
- O rateio conserva o custo total da peça.
- A ficha tem versão.

**Integrações e ativação.** Balança por `perifericos`.

**Da Olímpia:** lá são sete telas soltas; aqui um fluxo só (escolher a ficha →
pesar → ver rendimento e custo → confirmar) (98).

---

#### `compras` — Compras e fornecedores

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `estoque` | mercearias, varejo, restaurantes, distribuidoras | `estoque`, `financeiro` | sim (planejado) |

**Na Olímpia:** fluxo solicitação → cotação → aprovação → pedido → recebimento;
a lista de pedidos tem os estados aberto, parcial, recebido e cancelado e não
tem botão "Novo" (o pedido nasce da cotação); a aprovação não tem tela própria;
há relatórios por fornecedor, por produto e de evolução de custos (920, 922).

**Objetivo.** Comprar o necessário, do fornecedor certo, sem esquecer nada.

**Funcionalidades**

- *Mínimo:*
  - lista de compras sugerida (abaixo do mínimo, pelo consumo médio);
  - pedido de compra direto ao fornecedor, enviado por WhatsApp ou PDF;
  - recebimento contra o pedido (XML ou manual), com as diferenças;
  - histórico de preço por fornecedor.
- *Diferencial:*
  - cotação com vários fornecedores por link, comparação e escolha;
  - aprovação por valor;
  - compra recorrente (o pão de todo dia);
  - evolução de custos;
  - contas a pagar criadas sozinhas.

**Entidades e relações**

- Fornecedor = `Pessoa` com o papel de fornecedor.
- `PedidoCompra` (fornecedor, previsão, estado `aberto`, `parcial`,
  `recebido`, `cancelado`) 1–N `ItemPedidoCompra`.
- `Cotacao` 1–N `RespostaCotacao`.
- O recebimento gera uma `Entrada` em `estoque`.

**Fluxos principais.** Sugestão → pedido → envio → recebimento (XML) → estoque,
custo e contas a pagar.

**Regras de negócio**

- A cotação é opcional: o pequeno comerciante compra direto.
- Recebimento parcial mantém o saldo do pedido em aberto.

**Integrações e ativação.** Nenhuma obrigatória.

**Da Olímpia:** copiar os estados do pedido em texto claro e a evolução de
custos. Evitar a lista sem "Novo" e uma etapa de aprovação sem tela (920).

---

#### `cartoes` — Cartões e maquininhas (TEF/POS)

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | pre_funcional | opcional | `financeiro` | varejo, food com balcão, mercearias | `financeiro` | não |

**Na Olímpia:** TEF, operadoras de maquininha e controle de cartões no
Financeiro (não abertos); TEF Dial e percentuais por modalidade nos parâmetros;
relatório de operações de cartão com NSU, bandeira e parcelas (915, 96, 99,
916).

**Objetivo.** Receber no cartão sem digitar o valor duas vezes e saber quando o
dinheiro cai.

**Funcionalidades**

- *Mínimo:*
  - maquininhas e adquirentes com taxa e prazo por modalidade (débito, crédito
    à vista, parcelado);
  - pagamento registrado com bandeira, NSU e parcelas;
  - recebíveis previstos (valor líquido e data) no `financeiro`;
  - conciliação com o extrato da adquirente (arquivo ou API).
- *Diferencial:*
  - TEF integrado ao PDV (o valor vai direto para a maquininha);
  - app nosso dentro da maquininha Android (POS inteligente);
  - simulação de antecipação;
  - alerta de taxa cobrada acima da contratada.

**Entidades e relações**

- `Adquirente` (taxas e prazos por modalidade).
- `TransacaoCartao` (pedido, NSU, autorização, bandeira, modalidade, parcelas,
  bruto, taxa, líquido, data prevista, estado).
- `Recebivel`.

**Fluxos principais.** Venda no cartão → transação → recebível → crédito na
conta → conciliação.

**Regras de negócio**

- Com maquininha integrada, a NFC-e leva os dados da credenciadora (confirmar
  com o emissor).
- Recebível só baixa com o crédito confirmado.

**Integrações e ativação.** TEF (por exemplo SiTef ou PayGo) ou APIs das
adquirentes (Stone, PagBank, Cielo, Rede, GetNet, Mercado Pago Point). O
comerciante fornece o contrato com a adquirente, os códigos de loja e de
terminal e um equipamento compatível.

**Da Olímpia:** as telas não foram vistas; o que apareceu (TEF Dial nos
parâmetros) é herança do desktop (915).

---

#### `fidelidade` — Fidelidade e cashback

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `relacionamento` | açaí, lanchonetes, padarias, cafeterias, varejo | `clientes`, `pedidos` | sim (planejado) |

**Na Olímpia:** módulo de cashback (não aberto) e parâmetros de cashback
(ativo, %, tipo) (911, 96).

**Objetivo.** Fazer o cliente voltar.

**Funcionalidades**

- *Mínimo:*
  - cashback em % por compra, ou cartão de selos (a cada N compras, uma
    grátis);
  - validade do saldo;
  - uso como forma de pagamento no PDV e no cardápio;
  - extrato que o cliente consulta por WhatsApp ou link;
  - estorno quando a venda é cancelada.
- *Diferencial:*
  - regras por produto, categoria ou dia ("terça do açaí");
  - bônus de aniversário;
  - níveis;
  - campanhas com `crm`.

**Entidades e relações**

- `ProgramaFidelidade` (tipo cashback ou selos, regras, validade).
- `ContaFidelidade` (cliente, saldo) 1–N `MovimentoFidelidade` (ganho, uso,
  expiração, estorno, pedido).

**Fluxos principais.** Compra concluída → ganha saldo → aviso → a próxima
compra usa o saldo → o que não for usado expira.

**Regras de negócio**

- Saldo só nasce de pedido concluído e pago.
- O uso é limitado a uma parte do pedido.
- O saldo em aberto aparece no financeiro como compromisso.

**Integrações e ativação.** Nenhuma.

**Da Olímpia:** telas não vistas (911).

---

#### `crm` — Relacionamento e campanhas

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | pre_funcional | opcional | `relacionamento` | varejo, food, distribuidoras | `clientes` | não (os aniversários estão em `clientes`) |

**Na Olímpia:** CRM com painel, aniversários, clientes do CRM, operação,
campanhas e "CRM Markup" (só o hub foi lido); "clientes sem comprar há X dias"
aparece em três lugares; positivação de um mix de produtos por vendedor, sem
gravar a campanha (910, 917).

**Objetivo.** Falar com o cliente certo, na hora certa.

**Funcionalidades**

- *Mínimo:*
  - segmentos: sem comprar há X dias (pelo ciclo de cada cliente),
    aniversariantes do mês, melhores clientes, clientes novos;
  - ação rápida: WhatsApp com mensagem pronta, um a um, por link;
  - campanha com cupom e resultado (quantos voltaram e quanto compraram).
- *Diferencial:*
  - envio em massa pela API oficial, só a quem consentiu;
  - funil de orçamentos e encomendas;
  - tarefas de contato para a equipe;
  - segmentação por recência, frequência e valor.

**Entidades e relações**

- `Segmento` (regra).
- `Campanha` (segmento, mensagem, cupom, canal, período, resultado).
- `Cupom` (mínimo, limite de uso, validade, alcance).
- `ContatoCliente` (tarefa, resultado).

**Fluxos principais.** Escolher o segmento → mensagem e cupom → enviar → medir o
retorno.

**Regras de negócio**

- Só envia a quem consentiu, com opt-out em toda mensagem.
- Limite de frequência por cliente.

**Integrações e ativação.** WhatsApp Business Platform para envio em massa (com
o número do comerciante). Sem ela, o envio é manual por link.

**Da Olímpia:** copiar "clientes sem comprar" e a positivação, mas com ação e
campanha gravada. Evitar o CRM partido em seis telas, além de "Clientes" e
"Consulta Cliente", e o nome ambíguo "CRM Markup" (910, 917).

---

#### `loja_virtual` — Loja virtual

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `canais` | varejo (roupas, calçados, presentes, material de construção, autopeças), empórios | `pedidos`, `catalogo` | sim (planejado) |

**Na Olímpia:** vitrine com endereço por empresa, PWA e API pública; nome, SEO,
quatro cores, carrossel e banners; frete igual ao do delivery; cupons simples;
avaliações só pendentes de moderação; pedido com estado e pagamento separados,
gravado como venda (93, 922).

**Objetivo.** Vender online, com pagamento e entrega, para quem é varejo. (Para
quem é comida, o `cardapio` já faz esse papel.)

**Funcionalidades**

- *Mínimo:*
  - vitrine com busca, categorias e variações (grade);
  - carrinho; frete pela área da `loja` e retirada;
  - pagamento online (Pix ou cartão, pelo gateway de `cobranca`) ou pedido
    por WhatsApp;
  - cupons com regras;
  - estado do pedido avisado ao cliente;
  - SEO e domínio próprio.
- *Diferencial:*
  - avaliações com moderação e resposta da loja;
  - conta do cliente opcional e favoritos;
  - recuperação de carrinho por WhatsApp;
  - frete por transportadora para fora de Porto Velho;
  - catálogo para Instagram e Facebook.

**Entidades e relações**

- `ConfiguracaoLoja` (tema, banners, domínio, SEO).
- `Cupom`; `Avaliacao` (produto, cliente, nota, texto, estado, resposta).
- Pedido online = `Pedido` com canal `loja_virtual` e pagamento online.

**Fluxos principais.** Navega → carrinho → frete → paga → pedido no painel →
separação → envio ou entrega → avaliação.

**Regras de negócio**

- O estoque fica reservado quando o pagamento é confirmado.
- Cancelamento estorna o pagamento e o estoque.

**Integrações e ativação.** Gateway (pelo `cobranca`) e frete por
transportadora, ambos opcionais. O comerciante fornece a conta no gateway e,
se enviar por transportadora, o contrato de frete.

**Da Olímpia:** copiar o endereço por empresa com PWA. Evitar as mesmas cores
"de marketplace" para todos, texto em maiúsculas, avaliações só pendentes, o
cupom sem regras e avisos de configuração na vitrine pública (93, 922).

---

#### `mercado_livre` — Mercado Livre

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | pre_funcional | opcional | `canais` | varejo | `pedidos`, `catalogo`, `estoque` | dentro de `marketplaces` |

**Na Olímpia:** conta ligada por OAuth; pedidos pagos recebidos por webhook,
com uma rotina de recuperação a cada 5 minutos; anúncios vinculados a produtos
pelo SKU; saldo devolvido ao anúncio depois de cada venda e a cada 10 minutos;
NF-e automática opcional; documentação interna com o estado real da ligação e
uma tabela de problemas. A mesma documentação mostra o token do webhook em
texto aberto (93, 922).

**Objetivo.** Vender no Mercado Livre sem controlar o estoque em dois lugares.

**Funcionalidades**

- *Mínimo:*
  - ligar a conta (OAuth);
  - vincular anúncios a produtos (sozinho quando o SKU bate);
  - importar os pedidos pagos como pedidos do canal `mercado_livre`;
  - baixar o estoque e devolver o saldo ao anúncio;
  - estado da ligação sempre visível (ligada, última sincronização, erros).
- *Diferencial:*
  - NF-e automática (com `fiscal`);
  - etiqueta de envio;
  - repasses e tarifas;
  - publicar um anúncio a partir do produto;
  - preço próprio para o canal.

**Entidades e relações**

- `ConexaoML` (conta, tokens no cofre, estado).
- `VinculoAnuncio` (anúncio, produto ou variação, sincronizar sim ou não).
- Pedido ML → `Pedido`; fila de webhooks com tentativas.

**Fluxos principais.** Ligar → vincular → venda → webhook → pedido → estoque →
anúncio atualizado.

**Regras de negócio**

- Pedido com item sem vínculo fica pendente para resolver (não some).
- Um pedido nunca entra duas vezes (o id do pedido no Mercado Livre é a chave).
- O token do webhook nunca aparece na tela.

**Integrações e ativação.** API do Mercado Livre (o aplicativo é nosso). O
comerciante fornece a conta de vendedor e a autorização OAuth.

**Da Olímpia:** copiar a documentação com o estado real e a tabela de
problemas, a ordem de vínculo pelo SKU e a rotina de recuperação. Evitar o
segredo à vista (922).

---

#### `painel_tv` — Painel de TV (preços e senhas)

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `operacao` | açougues, padarias, lanchonetes, praças de alimentação | `catalogo` | não |

**Na Olímpia:** "Painel TV" no menu (link e configuração) e "Painel de Preços"
no plano; não foi aberto (90).

**Objetivo.** Mostrar preços ou o cardápio e chamar senhas numa TV, sem cartaz
de papel.

**Funcionalidades**

- *Mínimo:*
  - link para abrir na smart TV ou num navegador;
  - tabela de preços por categoria (no açougue, R$ por kg) ou cardápio com
    fotos;
  - atualização sozinha quando o preço muda;
  - rotação de promoções;
  - chamada de senhas ou de pedidos prontos, com som (com `cozinha`).
- *Diferencial:*
  - vários painéis por loja;
  - programação por horário (café da manhã, almoço);
  - vídeos e banners;
  - ligação da TV por código.

**Entidades e relações.** `Painel` (loja, tipo preços, senhas ou promoções,
layout, categorias, token de acesso revogável).

**Fluxos principais.** Criar o painel → abrir o link na TV → atualiza sozinho.

**Regras de negócio.** Link revogável; o painel só lê o catálogo público.

**Integrações e ativação.** Nenhuma.

**Da Olímpia:** tela não vista (90).

---

#### `ordens_servico` — Ordens de serviço

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `operacao` | oficinas de carros e motos, assistência técnica (celular, eletrônicos), refrigeração e manutenção | `clientes`, `catalogo` | sim (planejado) |

**Na Olímpia:** OS de oficina mecânica com veículo em texto livre em cada OS;
peças do estoque e serviços do cadastro, cada linha com o seu colaborador;
deslocamento, guincho e outros; descontos em seis campos; observação para o
cliente separada da interna; estados Aberta, Fechada, Cancelada e Quitado,
escolhidos à mão; orçamento feito na venda balcão; chamados vindos do portal;
app do técnico com GPS, laudo e fotos; checklists sem ligação com a OS; 12
relatórios e comissões (14, 20, 919).

**Objetivo.** Controlar o serviço do orçamento à entrega, com o cliente a
acompanhar.

**Funcionalidades**

- *Mínimo:*
  - objeto do serviço configurável por ramo: veículo (placa, km), aparelho
    (IMEI ou série), equipamento; com histórico por objeto;
  - entrada com checklist e fotos de avarias;
  - orçamento enviado por link ou WhatsApp e aprovado pelo cliente;
  - peças (do estoque) e serviços (do catálogo de serviços), com técnico por
    item;
  - estados do trabalho (orçamento → aprovado → em execução → aguardando peça
    → concluído → entregue) separados do estado financeiro, que é calculado;
  - impressão ou PDF da OS, com observação ao cliente e observação interna
    separadas.
- *Diferencial:*
  - app do técnico: agenda, chegada e saída com GPS, laudo, fotos, assinatura
    do cliente;
  - garantia com prazo;
  - lembrete de revisão (por km ou por tempo);
  - NFS-e e NF-e das peças (`fiscal`);
  - chamados pelo portal (`portal_cliente`);
  - comissões (`comissoes`).

**Entidades e relações**

- `ObjetoServico` (cliente, tipo, campos do tipo).
- `OrdemServico` (objeto, defeito relatado, técnico responsável, estado,
  prazo, garantia) 1–N `ItemOS` (peça ou serviço, técnico, quantidade, valor,
  desconto).
- `ChecklistModelo` e `ChecklistResposta` (com fotos).
- `AprovacaoOrcamento` (link, data, IP); `Atendimento` (chegada e saída com
  GPS, laudo).

**Fluxos principais.** Chamado ou entrada → checklist → orçamento → aprovação →
execução (baixa das peças) → conclusão → entrega e pagamento → NFS-e →
garantia.

**Regras de negócio**

- O estado financeiro nunca é escolhido à mão.
- A peça sai do estoque quando é aplicada.
- OS entregue não muda; reabrir exige motivo.
- A observação interna nunca é impressa.

**Integrações e ativação.** NFS-e por `fiscal`; GPS do celular.

**Da Olímpia:** copiar a observação para o cliente separada da interna, o
lançamento avulso de peça e de serviço, a chegada e a saída com GPS. Evitar o
veículo em texto livre, o "Quitado" escolhido à mão, o orçamento noutro
módulo, o checklist desligado da OS, 12 relatórios parecidos e outro login para
o técnico (14, 20).

---

#### `comissoes` — Comissões e metas

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `pessoas` | varejo com vendedores, distribuidoras, oficinas | `pedidos`, `financeiro` | não |

**Na Olímpia:** comissão gravada em cada item de venda e de OS e copiada para
as parcelas a receber; dois regimes ("pela venda" e "pelo recebimento") que o
usuário tem de saber escolher em sete relatórios; % de comissão no grupo de
produto e no serviço; meta com prêmios para os três primeiros do ranking e
faixas fixas que não se configuram; nenhum fechamento nem pagamento da
comissão (20, 916, 918).

**Objetivo.** Calcular e pagar comissões sem planilha.

**Funcionalidades**

- *Mínimo:*
  - regra por vendedor, categoria, produto ou serviço (% ou valor fixo);
  - regime escolhido uma vez (pela venda ou pelo recebimento);
  - extrato do colaborador e "Minhas comissões" no app da equipe;
  - fechamento do período que trava os valores e gera a conta a pagar (ou o
    evento da pré-folha);
  - estorno quando a venda é cancelada ou devolvida.
- *Diferencial:*
  - metas com faixas configuráveis, simulação e barra de progresso;
  - ranking;
  - rateio da taxa de serviço entre a equipe (seguir a lei da gorjeta;
    confirmar);
  - campanhas por produto (positivação).

**Entidades e relações**

- `RegraComissao` (escopo, percentual, prioridade).
- `LancamentoComissao` (colaborador, item de origem, base, %, valor, regime,
  estado `prevista`, `liberada`, `paga`, `estornada`).
- `Meta` (período, faixas, prêmios); `FechamentoComissao` (período,
  colaborador, total, título a pagar).

**Fluxos principais.** Venda → comissão prevista → (recebimento) → liberada →
fechamento → pagamento.

**Regras de negócio**

- A base padrão é o valor com desconto (configurável).
- A comissão segue o estado do documento de origem.
- Período fechado não muda.

**Integrações e ativação.** Nenhuma.

**Da Olímpia:** evitar obrigar o gestor a escolher entre sete relatórios,
faixas escondidas que vêm "da planilha" de um cliente e um ciclo que nunca
chega ao pagamento (20, 916).

---

#### `forca_vendas` — Força de vendas, rotas e expedição

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `vendas` | distribuidoras de alimentos e bebidas, atacarejos, açougues e padarias que fornecem a outros negócios | `clientes`, `catalogo`, `pedidos` | não |

**Na Olímpia:** app Android separado, ligado a uma API cujo endereço leva o
código da empresa; aparelhos liberados com limite por plano; visitas de rota
com cobertura, mapa e "clientes sem comprar"; positivação de um mix de produtos
por vendedor; faturamento em lote dos orçamentos com 24 tipos de regra, 35
modelos, aprovação por senha ou remota e "desfazer lote" com motivo; romaneio
de carga com motorista, veículo, ordem de entrega, peso, volumes, separação e
itinerário (14, 917, 918, 920).

**Objetivo.** Vender fora da loja e entregar por rota.

**Funcionalidades**

- *Mínimo:*
  - app do vendedor (PWA que funciona sem internet) com a carteira de
    clientes, o catálogo com preço e estoque, pedidos e orçamentos que
    sincronizam quando houver sinal;
  - rota do dia e registro de visita (GPS, motivo de não venda);
  - clientes sem comprar;
  - aprovação e faturamento dos pedidos com três ou quatro regras essenciais
    (desconto máximo, estoque, pedido mínimo).
- *Diferencial:*
  - romaneio de carga (motorista, veículo, ordem de entrega, peso e volumes,
    lista de separação, itinerário);
  - campanhas com meta de positivação;
  - mapa de cobertura;
  - tabela de preço por cliente;
  - comissões.

**Entidades e relações**

- `Rota` (dias, clientes, vendedor); `Visita` (cliente, vendedor, data e
  hora, GPS, resultado, motivo).
- `AparelhoVendedor` (pareamento por token de uso único, aprovado pelo
  gestor).
- `LoteFaturamento` (pedidos, regras avaliadas, estado, motivo do
  desfazimento).
- `Romaneio` (motorista, veículo, rota, entregas em ordem, estado).

**Fluxos principais.** Sincronizar → visitar → pedido sem internet → sincroniza
→ aprovação e faturamento → separação → romaneio → entrega → baixa.

**Regras de negócio**

- Aparelho pareado com token de uso único e aprovação; nada de código da
  empresa no endereço.
- Não se desfaz um lote que já tem nota ou recebimento.

**Integrações e ativação.** Mapas (chave da plataforma); MDF-e por
`fiscal_transporte`, se a carga sair do município.

**Da Olímpia:** copiar a cobertura de rota, a positivação, o romaneio com
separação e itinerário e o "desfazer" com motivo. Evitar o código da empresa no
endereço da API, 24 tipos de regra para quem é pequeno e o mix de produtos que
não se grava (14, 917, 918, 920).

---

#### `ponto` — Ponto eletrônico

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `pessoas` | restaurantes, padarias, supermercados, oficinas: qualquer negócio com equipe registrada | `equipe` | sim (planejado: "batida por webcam ou celular com foto, local e espelho de ponto") |

**Na Olímpia:** o painel diz "REP-P / Portaria 671". Batida pelo celular com
GPS, num tablet com código, PIN e foto obrigatória, ou pelo app Android
configurado por QR; cerca virtual em modo aviso ou bloqueio; auditoria de foto
e reconhecimento facial; justificativas sem anexo; feriados nacionais gerados
(sem o tipo estadual); jornada semanal com modelos rápidos; fechamento com
horas extras, noturno, DSR e banco de horas "para a folha". Não aparecem AFD,
AEJ nem comprovante de marcação; o espelho pede o número da pessoa e devolve
uma página de erro crua; a senha do ponto é definida pelo gestor (912, 913).

**Objetivo.** Registrar a jornada de forma legal e simples, sem relógio de
parede.

**Funcionalidades**

- *Mínimo:*
  - **batida pela webcam** do PC ou do tablet da loja (modo quiosque) e pelo
    celular, com foto, data e hora do servidor e localização (cerca virtual em
    modo aviso ou bloqueio);
  - identificação pelo PIN pessoal;
  - comprovante de cada marcação (na tela e no WhatsApp ou e-mail);
  - jornadas (semana fixa, 12x36, escala) com a tolerância legal;
  - espelho do mês por colaborador, com busca pelo nome;
  - justificativas com anexo (atestado) e aprovação;
  - banco de horas;
  - feriados nacionais, de Rondônia e de Porto Velho já carregados;
  - tratamento sem apagar a marcação original (inclusão ou desconsideração com
    motivo e autor);
  - fechamento do mês com prévia e exportação (AFD, AEJ e planilha para o
    contador).
- *Diferencial:*
  - reconhecimento facial opcional, com consentimento explícito (biometria é
    dado sensível);
  - quiosque que funciona sem internet e sincroniza depois;
  - alertas (falta, atraso, descanso entre jornadas menor que 11 horas,
    intervalo);
  - troca de turno entre colegas;
  - resumo do ponto no WhatsApp do dono (`ia_whatsapp`).

**Entidades e relações**

- `Jornada` ou `Escala`; o colaborador vem de `equipe` (PIS, contrato,
  jornada, local).
- `Marcacao` (data e hora do servidor, origem quiosque ou celular, foto, GPS,
  dentro da cerca, hash). Imutável.
- `Tratamento` (marcação incluída ou desconsiderada, motivo, autor).
- `Justificativa` (anexo, estado); `Feriado` (nacional, estadual, municipal
  ou da loja); `Fechamento` (período, totais, estado `aberto`, `fechado`,
  `reaberto`, arquivos); `Comprovante`.

**Fluxos principais.** Configurar (locais, jornadas, feriados) → convidar o
colaborador → bater o ponto → comprovante → justificativas → espelho →
fechamento → exportar ao contador.

**Regras de negócio** (confirmar com o jurídico)

- Portaria MTP 671/2021, ponto por programa: a marcação não pode ser alterada
  nem apagada; o colaborador recebe comprovante; o sistema gera AFD e AEJ; o
  programa precisa de registro e atestado técnico (obrigação nossa como
  fornecedor).
- CLT: tolerância de 5 minutos por marcação e 10 por dia (art. 58, §1º), banco
  de horas (art. 59), descanso de 11 horas entre jornadas (art. 66),
  intervalo (art. 71), hora noturna reduzida (art. 73).
- LGPD: foto e biometria com finalidade e consentimento; atestado é dado de
  saúde, com acesso restrito.

**Integrações e ativação.** Câmera e localização do navegador;
reconhecimento facial opcional pela plataforma. O comerciante fornece a lista
de colaboradores com CPF ou PIS e jornadas, um PC ou tablet com webcam na loja
e o consentimento dos colaboradores.

**Da Olímpia:** copiar os modelos rápidos de jornada com o total semanal
calculado e a cerca virtual com modo aviso. Evitar o "REP-P" só no rótulo,
o espelho pelo número da pessoa, coordenadas digitadas à mão, a senha criada
pelo gestor e dois apps diferentes para o colaborador (912, 913).

---

#### `portal_cliente` — Portal do cliente

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P2 | funcional | opcional | `relacionamento` | oficinas, distribuidoras, quem vende fiado, assinaturas (marmita mensal) | `clientes` | não |

**Na Olímpia:** não foi aberto. Pelo manual: o cliente entra com CPF e senha,
vê títulos e boletos, acompanha pedidos e abre chamados de OS (922, 14).

**Objetivo.** O cliente resolve sozinho: segunda via, pedidos, notas, OS.

**Funcionalidades**

- *Mínimo:*
  - acesso por link mágico no WhatsApp, sem senha;
  - histórico de pedidos e "repetir pedido";
  - contas em aberto, com Pix ou boleto;
  - notas fiscais (PDF e XML);
  - saldo do fiado e do cashback.
- *Diferencial:*
  - acompanhar a OS e aprovar o orçamento;
  - abrir chamado;
  - assinar documentos (`assinatura`);
  - assinatura recorrente (por exemplo, marmita do mês).

**Entidades e relações.** `AcessoCliente` (token de uso único, validade,
aparelho); `Chamado` (assunto, prioridade, estado → OS).

**Fluxos principais.** Link no WhatsApp → portal → paga, baixa a nota ou
aprova o orçamento.

**Regras de negócio.** O link expira; o cliente só vê os próprios dados (RLS
por cliente).

**Integrações e ativação.** Nenhuma; usa `bancos` e `cobranca` se estiverem
ligados.

**Da Olímpia:** evitar mais um login com senha (922).

---

### 4.4 P3: depois

Os módulos P3 ficam `planejado` até haver demanda paga. Cada ficha diz a
maturidade que terão quando forem construídos.

#### `folha` — Pré-folha e folha de pagamento

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | planejado (depois: funcional na pré-folha; pre_funcional no eSocial) | opcional | `pessoas` | negócios com equipe registrada | `ponto`, `financeiro` | não |

**Na Olímpia:** competências; processamento num clique, sem prévia, que
importa o ponto aprovado, o banco de horas e os vales e calcula INSS, IRRF e
FGTS; cerca de 200 rubricas da tabela do eSocial, todas marcadas como
"provento, valor fixo"; férias com o 1/3 como opção desmarcável; 13º; rescisão
que, por padrão, já demite; benefícios VT, VR e VA com desconto automático;
CNAB 240 de salários; eSocial S-1200 como arquivo (913, 914).

**Objetivo.** Entregar ao contador o mês pronto e o holerite ao colaborador,
sem refazer a folha.

**Por que P3.** No pequeno comércio de Porto Velho a folha é feita pelo
escritório contábil. O que vale para nós é a pré-folha e o holerite digital;
um motor de folha completo é um projeto regulado e grande.

**Funcionalidades (quando construído)**

- *Mínimo:*
  - pré-folha: fechamento do ponto, horas extras, faltas, adicionais, vales e
    adiantamentos, comissões e benefícios, exportados para o contador;
  - holerite digital (o PDF do contador ou o nosso) entregue no app da equipe,
    com confirmação de leitura;
  - controle de vales e adiantamentos.
- *Diferencial (longo prazo):*
  - cálculo completo com tabelas legais mantidas pela plataforma;
  - férias, 13º e rescisão com memorial de cálculo e simulação antes de
    efetivar;
  - eSocial, FGTS Digital e DCTFWeb por um parceiro;
  - CNAB de salários.

**Entidades e relações.** `Competencia` (estado `aberta`, `conferida`,
`fechada`); `EventoFolha` (rubrica, natureza, incidências, código do eSocial);
`LancamentoFolha`; `Holerite`; `Beneficio` e `AtribuicaoBeneficio`; `Vale`.

**Regras de negócio.** O 1/3 de férias é sempre aplicado; simular antes de
efetivar; tabelas legais com data de vigência; salário só visível para quem
pode.

**Integrações e ativação.** eSocial, FGTS Digital e DCTFWeb por parceiro;
bancos (CNAB 240). O comerciante fornece o contador responsável, os dados de
contrato e a convenção coletiva.

**Da Olímpia:** copiar os benefícios com desconto automático na folha. Evitar o
processamento sem prévia, a rescisão em um clique e as rubricas mal
classificadas (913, 914).

---

#### `portal_colaborador` — App da equipe

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | planejado (depois: funcional) | opcional | `pessoas` | negócios com equipe | `equipe` | não |

**Na Olímpia:** um PWA por empresa (CPF ou código e senha) com holerites,
espelho, banco de horas, vales, solicitações sem anexo e avisos com
confirmação de leitura; comunicados sem escolha de público; é outro app,
diferente do app do ponto (914).

**Objetivo.** Um app só para o colaborador.

**Funcionalidades (quando construído)**

- *Mínimo:*
  - entrar por convite no WhatsApp e PIN;
  - bater o ponto (com `ponto`), espelho e banco de horas;
  - holerites (com `folha`);
  - comunicados com público (todos, setor, pessoa) e confirmação de leitura;
  - solicitações (férias, folga, atestado com foto, ajuste de ponto) com
    aprovação.
- *Diferencial:* escala da semana; troca de turno; documentos para assinar
  (`assinatura`); "Minhas comissões".

**Entidades e relações.** `Comunicado` (título, prioridade, conteúdo, público)
1–N `Leitura`; `Solicitacao` (tipo, datas, motivo, anexo, estado).

**Regras de negócio.** Atestado é dado de saúde, com acesso restrito; o
comunicado é texto simples ou Markdown seguro, nunca HTML.

**Integrações e ativação.** Nenhuma.

**Da Olímpia:** evitar dois apps para o mesmo colaborador, pedido sem anexo,
comunicado sem público e códigos crus na tela (914).

---

#### `assinatura` — Assinatura eletrônica

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | planejado (depois: funcional) | opcional | `operacao` | oficinas (OS), equipes (contratos), encomendas e eventos | — | não |

**Na Olímpia:** documento criado sem arquivo, com um só signatário e tipo em
texto livre; evidências (IP, geolocalização, hash); estados pendente, parcial,
concluído e cancelado; fica dentro do Portal do Colaborador, embora sirva à OS
(914, 922).

**Objetivo.** Colher a assinatura com prova, pelo celular.

**Funcionalidades (quando construído)**

- *Mínimo:*
  - documento em PDF ou gerado pelo sistema (OS, termo, contrato), com vários
    signatários em ordem;
  - envio por WhatsApp ou e-mail;
  - assinatura com nome, CPF, aceite ou desenho, IP, data e hora,
    geolocalização e hash do documento;
  - certificado final com as evidências; lembretes.
- *Diferencial:* selfie do signatário; certificado ICP-Brasil por parceiro.

**Entidades e relações.** `DocumentoAssinatura` (arquivo, hash, estado) 1–N
`Signatario` (ordem, contato, evidências, data).

**Regras de negócio.** Assinatura eletrônica aceita entre as partes (MP
2.200-2/2001, art. 10, §2º; Lei 14.063/2020); confirmar o tipo exigido para
cada documento. Documento assinado não muda.

**Integrações e ativação.** Nenhuma obrigatória.

**Da Olímpia:** evitar esconder a assinatura num módulo de RH (914).

---

#### `fiscal_transporte` — MDF-e e CT-e

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | planejado (depois: pre_funcional) | opcional | `fiscal` | distribuidoras e quem leva carga para outros municípios ou estados; transportadoras (CT-e) | `fiscal` | não |

**Na Olímpia:** emissão de MDF-e e CT-e (telas não abertas); relatório do MDF-e
com os estados pendente, autorizado, encerrado e cancelado; cadastro de
veículos com os campos do MDF-e, com códigos que não parecem bater com a
tabela oficial (921, 96).

**Objetivo.** Emitir os documentos de transporte quando a operação exigir.

**Por que P3.** É raro no público-alvo (comida e varejo urbano em Porto Velho).

**Funcionalidades (quando construído)**

- *Mínimo:* MDF-e a partir do romaneio (chaves das notas, veículo, condutor,
  UFs, percurso), com encerramento e alerta de manifesto ainda aberto; CT-e
  para quem presta frete.
- *Diferencial:* inclusão de condutor; integração com o romaneio da
  `forca_vendas`.

**Entidades e relações.** `Veiculo` (com as tabelas oficiais), `Condutor`,
`MDFe` (documentos vinculados, estado), `CTe`.

**Regras de negócio.** Encerrar o MDF-e ao fim da viagem; manifesto aberto pode
impedir o próximo para o mesmo veículo (confirmar).

**Integrações e ativação.** Emissor parceiro (MDF-e e CT-e). O comerciante
fornece o certificado A1, o RNTRC quando se aplica, os veículos e os
condutores.

**Da Olímpia:** usar as tabelas oficiais do MDF-e no cadastro de veículos (96).

---

#### `consultoria` — Diagnóstico e plano de gestão

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | planejado (depois: funcional) | opcional | `inteligencia` | todos (venda de serviço) | `resumo`, `relatorios` | não; a cadeia de produção do console (`src/lib/cadeia`) já faz o diagnóstico de presença digital, só para a equipe |

**Na Olímpia:** "Gestão 360°": projeto com produto (Diagnóstico, Gestão 90 dias,
Gestão contínua) e três dores; diagnóstico por área (Sim, Parcial, Não) em 8
áreas de gestão; problemas priorizados por Impacto × Urgência × Facilidade;
plano 30/60/90 com metas; reuniões cujas tarefas viram ações; relatório
executivo; consultor de IA que depende de uma chave da plataforma (914, 915).

**Objetivo.** Transformar a nossa implantação e a nossa consultoria num
produto que o comerciante vê.

**Funcionalidades (quando construído)**

- *Mínimo:*
  - diagnóstico guiado: a presença digital (já existe no console) mais a
    gestão (caixa, estoque, margem, equipe), com nota por área;
  - problemas priorizados;
  - plano de ação com responsáveis e prazos; "atrasada" calculada pelo prazo;
  - indicadores ligados aos números reais do ERP;
  - relatório mensal ao dono.
- *Diferencial:* IA que sugere ações a partir dos números; reuniões com
  convite e ata; ligação direta com a cadeia de produção.

**Entidades e relações.** `Diagnostico` (áreas, respostas, nota);
`Problema` (área, prioridade); `Acao` (fase, responsável, prazo, indicador,
estado); `Meta` (indicador real, alvo, prazo). Liga-se a `cadeia_etapas`.

**Regras de negócio.** Só a equipe edita o diagnóstico; o comerciante vê e
comenta.

**Integrações e ativação.** Modelo de linguagem com chave da plataforma.

**Da Olímpia:** copiar a matriz de prioridade e o plano 30/60/90. Evitar a IA
que depende de uma chave fora do alcance do cliente, o "atrasada" manual e as
metas soltas, sem indicador real (914, 915).

---

#### `api_integracoes` — API, webhooks e conector de IA

| Prioridade | Maturidade alvo | Ligação | Grupo | Segmentos | Depende de | No código |
| --- | --- | --- | --- | --- | --- | --- |
| P3 | planejado (depois: funcional) | opcional | `operacao` | parceiros, contadores, redes com sistemas próprios | — | não (há o formato Open Delivery em `src/lib/canais`) |

**Na Olímpia:** API REST da loja, API do app de força de vendas (com o código da
empresa no endereço), APIs do ponto e do colaborador, conector de IA por MCP e
monitor do agente de WhatsApp (adicionais fora do Full); a tela da API de
força de vendas oferece um texto pronto com a especificação para colar num
assistente de IA (14, 915, 922).

**Objetivo.** Deixar terceiros, e assistentes de IA, usarem os dados do
comerciante com permissão.

**Funcionalidades (quando construído)**

- *Mínimo:*
  - tokens por tenant, com escopos e validade;
  - API REST documentada (pedidos, catálogo, clientes, estoque);
  - webhooks de saída assinados (pedido criado, pago, cancelado; estoque
    baixo);
  - registro das chamadas;
  - conector MCP só de leitura no início.
- *Diferencial:* especificação pronta para assistentes de IA; painel de uso.

**Entidades e relações.** `TokenApi` (escopos, validade, revogado);
`AssinaturaWebhook` (eventos, URL, segredo); `ChamadaApi` (registro).

**Regras de negócio.** Nunca segredo no endereço; revogação imediata; limites
de uso; a plataforma é operadora dos dados (LGPD).

**Integrações e ativação.** As que o parceiro fizer.

**Da Olímpia:** copiar a especificação pronta para IA. Evitar código de acesso
no endereço e token de webhook à vista (14, 922).

---

## 5. Dependências e ordem de construção

### 5.1 Dependências

Cada linha diz de que módulos o módulo da esquerda precisa para funcionar. Os
essenciais (`conta`, `equipe`, `catalogo`, `loja`) estão sempre ligados e não
aparecem como dependência, salvo quando a ligação é central para entender o
módulo.

| Módulo | Depende de |
| --- | --- |
| `pedidos` | `catalogo` |
| `financeiro` | `clientes` |
| `resumo` | `pedidos` |
| `cardapio` | `pedidos`, `catalogo` |
| `pdv` | `caixa`, `catalogo`, `pedidos` |
| `caixa` | `financeiro` |
| `comandas` | `pedidos`, `caixa` |
| `cozinha`, `delivery` | `pedidos` |
| `estoque` | `catalogo` |
| `producao` | `estoque` |
| `desossa` | `producao`, `estoque` |
| `compras` | `estoque`, `financeiro` |
| `fiscal` | `catalogo`, `clientes` |
| `fiscal_transporte` | `fiscal` |
| `bancos`, `cartoes` | `financeiro` |
| `cobranca` | `financeiro`, `clientes` |
| `marketplaces`, `loja_virtual` | `pedidos`, `catalogo` |
| `mercado_livre` | `pedidos`, `catalogo`, `estoque` |
| `ia_whatsapp` | `resumo` |
| `encomendas` | `pedidos`, `clientes` |
| `fidelidade` | `clientes`, `pedidos` |
| `crm`, `portal_cliente` | `clientes` |
| `painel_tv` | `catalogo` |
| `ordens_servico` | `clientes`, `catalogo` |
| `comissoes` | `pedidos`, `financeiro` |
| `forca_vendas` | `clientes`, `catalogo`, `pedidos` |
| `ponto`, `portal_colaborador` | `equipe` |
| `folha` | `ponto`, `financeiro` |
| `consultoria` | `resumo`, `relatorios` |

Ligações fracas (enriquecem, mas não são obrigatórias): `pdv` com `fiscal`,
`bancos`, `cartoes` e `perifericos`; `cozinha` com `painel_tv` e
`perifericos`; `estoque` com `fiscal` (notas de compra da SEFAZ);
`ordens_servico` com `estoque`, `fiscal`, `portal_cliente`, `comissoes` e
`assinatura`; `ponto` com `ia_whatsapp`.

### 5.2 Ordem de construção sugerida

A regra do brief continua valendo: **nenhuma fase começa antes de a anterior
ter cinco clientes reais a pagar.** A ordem abaixo é uma proposta, não um
compromisso.

1. **Fundação ERP (P0).** `equipe` (papéis, PIN, aprovação, auditoria),
   separar `catalogo` de `cardapio`, `clientes`, `financeiro` simples,
   `relatorios` (o motor) e o radar no `resumo`. Muito disso já existe ou
   estende o que existe.
2. **Balcão de comida (P1).** `caixa` → `pdv` → `perifericos` (impressora e
   balança) → `cozinha` → `comandas`. Com `bancos` (Pix com webhook) e
   `ia_whatsapp` (resumo diário) como diferenciais de venda logo no início.
3. **Custo e estoque (P1).** `estoque` → `producao` (CMV). É a fase 2 do
   brief.
4. **Canais (P1).** `delivery` e `marketplaces` (iFood e 99Food, presos à
   homologação). É a fase 3 do brief.
5. **Fiscal e cobrança (P1, pre_funcional).** `fiscal` com o emissor parceiro
   e `cobranca`. Entram quando houver clientes que exigem nota ou que vendem
   fiado.
6. **Segmentos (P2), por demanda paga.** `desossa` e `painel_tv` (açougues),
   `encomendas` (padarias e confeitarias), `ponto` (equipes maiores),
   `ordens_servico` e `portal_cliente` (oficinas), `forca_vendas` e
   `comissoes` (distribuidoras), `loja_virtual`, `mercado_livre`, `crm` e
   `fidelidade` (varejo).
7. **Depois (P3).** `folha` (pré-folha primeiro), `portal_colaborador`,
   `assinatura`, `fiscal_transporte`, `consultoria`, `api_integracoes`.

---

## 6. O que a Olímpia faz mal (oportunidades de UX)

Agrupado por tema. Cada item diz o problema, onde foi visto e o que fazemos
diferente.

### 6.1 Navegação e "template com tudo"

1. **Tudo para todos.** O menu traz os 27 módulos e centenas de links a quem
   quer que entre; os parâmetros da empresa têm cerca de 420 opções, inclusive
   de condomínio, confecção, cartório e petshop; o MCP e o monitor de WhatsApp
   aparecem no menu e terminam numa página de bloqueio sem preço nem botão de
   contratar (96, 915, 922). **Nós:** o menu, as configurações, os relatórios, a
   ajuda e os avisos saem dos módulos ligados. Um módulo não contratado ou não
   aparece, ou aparece como oferta clara.
2. **Hubs que só repetem o menu.** Cada módulo tem uma página de cartões sem
   números, que custa um clique a mais (o manual tem um hub com um só cartão)
   (13, 922). **Nós:** a página de cada módulo mostra o que pede ação (pedidos de
   hoje, notas recusadas, estoque baixo).
3. **Barra lateral só de ícones.** Quinze ícones coloridos sem nome (18, 20).
   **Nós:** rótulos visíveis e, no celular, a barra inferior com os separadores
   do painel.
4. **Coisas no lugar errado e nomes que não batem.** O atalho "Caixa" abre o
   "recebimento"; `/nfce` serve também NF-e e NFS-e; o faturamento de vendas
   fica no menu de estoque com endereço de financeiro; o SPED está dentro de
   "produção"; a assinatura eletrônica fica no portal do colaborador; a
   operação de salão se espalha por quatro lugares do menu (04, 13, 914, 918).
   **Nós:** um módulo por assunto, com o nome do que faz.

### 6.2 Linguagem

5. **Herança técnica à vista.** Nome do formulário antigo em quase toda tela,
   nomes de tabela e coluna nas ajudas, códigos da SEFAZ como estado, JSON cru
   no log de alterações, "estilo Delphi" nos relatórios, comando de servidor
   no manual (13, 916, 919, 922). **Nós:** linguagem do comerciante; códigos só
   num detalhe técnico.
6. **Maiúsculas forçadas e erros de grafia.** Todo texto vira maiúsculas, até
   na vitrine pública; operações como "EXPORTÇÃO", "ORDER DE SERVIÇOS" e
   "EXTORNO"; "Novo Zona"; tradução faltando no paginador; códigos crus no app
   do colaborador (93, 96, 914). **Nós:** o texto fica como foi escrito, e a
   revisão de texto faz parte do "pronto".

### 6.3 Formulários e cadastros

7. **Lupa em janela para tudo.** Escolher um cliente, um produto ou um técnico
   pede abrir uma janela, buscar e clicar; o campo não aceita digitação; o aviso
   fica cortado ("Clique na lup…"); a lupa de "Pessoa" mistura clientes,
   fornecedores e colaboradores (20, 919, 920). **Nós:** busca com sugestões
   enquanto se digita, filtrada pelo papel certo.
8. **Números internos no lugar de nomes.** O link de pagamento pede o número da
   parcela; o espelho de ponto pede o número da pessoa (e devolve uma página
   de erro crua); as configurações da folha pedem o número do fornecedor e do
   plano de contas; a transferência pede o número do produto (96, 910, 912,
   914). **Nós:** sempre pela busca por nome.
9. **Padrões errados.** Zona e bairro nascem inativos; a saída de estoque nasce
   com a operação "ENTRADA"; o 1/3 de férias é uma caixa que se desmarca; a
   rescisão vem marcada para já demitir (96, 913). **Nós:** padrões seguros, e
   ações graves com simulação e confirmação.
10. **Formulários de especialista.** Grupo tributário com cerca de 150 campos
    de texto livre em abas dentro de abas; 58 opções só de PDV; regras de
    faturamento com 24 tipos (912, 96, 918). **Nós:** modelos prontos por
    segmento e por regime, assistente em passos e "opções avançadas" escondidas.
11. **Dependências escondidas.** O transportador só depois do frete; a
    manifestação fica "ignorada" porque falta a série da NF-e, configurada
    noutra tela; o botão "Novo diagnóstico" fica cinzento sem dizer porquê (13,
    96, 914). **Nós:** checklists de prontidão e botões que dizem o que falta.
12. **Geografia pobre.** Bairro sem cidade e digitado à mão; região da rota em
    texto livre; base com 5.426 municípios (o IBGE tem cerca de 5.570);
    coordenadas de local digitadas sem mapa (93, 96, 912). **Nós:** base
    oficial, bairro ligado à cidade, área de entrega e cerca desenhadas no
    mapa.

### 6.4 Estados e regras

13. **Estados sem padrão.** Números (0, 1, 2, 4), letras (F, P, T), textos e
    códigos da SEFAZ; "Ativo" vale 0 numa tela e 1 noutra; "Aberta" no
    relatório e "Pendente" na tela; o romaneio com nomes diferentes no
    relatório e sem "Cancelado" (912, 919, 920, 921). **Nós:** um conjunto
    fechado de estados por entidade, com o mesmo rótulo e a mesma cor em todo o
    sistema.
14. **Estado do trabalho misturado com o do dinheiro.** A OS pode nascer
    "Quitada" ou "Cancelada"; a parcela não tem "parcial"; a ação do plano fica
    "atrasada" à mão (14, 20, 915). **Nós:** o estado financeiro é calculado dos
    pagamentos e os atrasos são calculados pelo prazo.
15. **Padrões que escondem problemas.** "OS abertas" filtra pelo mês corrente e
    esconde as mais antigas; "Todos" soma notas canceladas aos impostos; o
    mesmo relatório abre em "Concluída" numa tela e em "Todos" noutra, e os
    totais não batem (20, 919, 920). **Nós:** pendência mostra tudo o que está
    pendente; o resultado mostra os filtros ativos.

### 6.5 Relatórios

16. **Muitos, repetidos e às cegas.** 132 relatórios, dois catálogos que não
    batem (78 no hub, 132 na Central), seis jeitos de ver "vendas por
    vendedor", tudo atrás do botão "Gerar", estado em texto livre, filtros de um
    valor só, sem visões salvas nem agendamento, e uma tela de fila "em
    evolução" publicada (916 a 921). **Nós:** poucos relatórios por pergunta,
    com "agrupar por", resultado imediato, exportação sempre visível e envio
    agendado.
17. **Problema do dia tratado como relatório.** Nota recusada, MDF-e por
    encerrar e nota por manifestar só aparecem se alguém lembrar de gerar o
    relatório certo (920, 921). **Nós:** pendências no painel, com alerta e ação.

### 6.6 Tempo real e avisos

18. **Consulta periódica e janelas que interrompem.** Cada tela pergunta ao
    servidor por sete frentes, algumas a cada 10 segundos, e abre janelas
    modais em fila; a fila de liberações se atualiza a cada 5 segundos (915,
    918, 920). **Nós:** tempo real por um só canal, só dos módulos ligados, com
    aviso discreto e som configurável.

### 6.7 Segurança e configuração

19. **Segredos à vista ou no lugar errado.** Senhas de sangria e cancelamento
    guardadas nos parâmetros; senhas de e-mail e de prefeitura no mesmo
    formulário da empresa; token do webhook do Mercado Livre em texto aberto;
    código da empresa no endereço da API móvel; chave de gateway em campo de
    texto visível (96, 910, 14, 922). **Nós:** cofre de segredos, aprovação com
    o login do gerente e pareamento por token de uso único.
20. **Desktop dentro da web.** Temas de interface do Delphi, portas COM e LPT,
    "backup ao fechar o sistema"; um botão "Fechar" que leva a um endereço
    técnico (915). **Nós:** só o que faz sentido no navegador, com configuração
    por terminal.

### 6.8 Acesso das equipes e dos clientes

21. **Um login por app.** Garçom (empresa, usuário e senha do ERP), ponto
    (código e senha do ponto, criada pelo gestor), entregador (telefone e PIN),
    colaborador (CPF e senha), técnico (empresa, usuário e senha) e cliente
    (CPF e senha); dois apps diferentes para o mesmo colaborador (912, 914,
    922). **Nós:** um app da equipe com PIN pessoal e convite pelo WhatsApp; link
    mágico para o cliente.

### 6.9 Fluxos que não fecham

22. **Cobrança:** régua fixa só por e-mail, disparo sem prévia, gateways
    "stub" (910).
23. **Comissão:** calcula, mas não fecha nem paga; faixas escondidas (20, 916).
24. **Positivação:** a campanha não se grava e o botão que puxa produtos de um
    fabricante não deve funcionar (917).
25. **Orçamento:** fica fora da OS, sem aprovação do cliente nem funil (14,
    918).
26. **Checklist:** existe, mas não se liga à OS (14).
27. **Folha:** processa sem prévia e a rescisão demite em um clique (913).

**Nós:** cada fluxo termina numa ação (pagar, cobrar, aprovar) e tem prévia
antes de gravar.

### 6.10 Ajuda e celular

28. **Ajuda rasa e desatualizada.** O manual tem 76 frases curtas, seis
    caminhos errados, metade do sistema sem cartão e não é pesquisável; três
    ajudas (manual, documentação do Mercado Livre e assistente de IA) que não se
    conversam (922). **Nós:** ajuda dentro de cada tela, gerada pelos módulos
    ligados e testada contra as rotas reais; uma busca só para telas, ajuda e
    ações.
29. **Celular de segunda.** A barra de 22 atalhos do manual ocupa uma tela
    inteira; o botão do assistente cobre a barra inferior; textos cortados;
    rótulos não ligados aos campos (922, 14, 919). **Nós:** painel pensado para
    360 px e alvos de 48 px.

### 6.11 Comida em segundo plano

30. **O food service não é o centro.** Não há iFood nem 99Food; o pedido da
    loja não tem "em preparo" nem "pronto"; o cardápio só abre com o QR de uma
    mesa; o frete é configurado em dois lugares; não há modelos fiscais prontos
    para lanchonete ou restaurante no Simples (93, 922, 912). **Nós:** o food
    service é o nosso centro, e os outros segmentos entram como módulos.

---

## 7. Extras nossos que a Olímpia não tem

| Extra | O que a Olímpia tem hoje | O que oferecemos | Módulo |
| --- | --- | --- | --- |
| **IA no WhatsApp com resumo diário** | agente de vendas no WhatsApp como adicional fora do Full; consultor de IA que depende de uma chave do Super Admin; nenhum resumo enviado ao dono (915, 914) | resumo diário do negócio no WhatsApp do dono, alertas (caixa, Pix, nota recusada) e perguntas em linguagem natural, com a IA configurada por nós; depois, atendente de vendas para o cliente final | `ia_whatsapp` |
| **Ponto por webcam** | relógio em tablet com foto obrigatória, app do colaborador e app Android; sem AFD, AEJ nem comprovante visíveis (912, 913) | batida pela webcam do PC ou do tablet que já está na loja, sem relógio de parede; comprovante no WhatsApp; marcação original preservada; AFD e AEJ; feriados de Rondônia e de Porto Velho carregados | `ponto` |
| **Webhooks bancários** | baixa por arquivo de retorno, por consulta periódica (Sicredi) ou por gateways "stub" (96, 910, 922) | Pix e boleto confirmados em tempo real pelo webhook do banco ou do gateway, com verificação e sem duplicar; o caixa e o painel atualizam na hora | `bancos`, `cobranca` |
| iFood e 99Food no mesmo painel | não aparecem | pedidos dos apps no painel, catálogo e disponibilidade sincronizados (Open Delivery) | `marketplaces` |
| Pedido pelo WhatsApp sem conta do cliente | cardápio só a partir do QR da mesa (922) | página pública rápida (menos de 1,5 s em 4G), carrinho e WhatsApp com a mensagem pronta (já construído) | `cardapio` |
| Tempo real de verdade | consulta periódica de sete frentes em todas as telas (915) | Supabase Realtime, só para os módulos ligados (já usado nos pedidos) | `pedidos` e todos |
| Só o que o cliente usa | o mesmo menu e os mesmos parâmetros para todos | módulos ligados por empresa, com dependências e maturidade (já em `src/lib/modulos`) | todos |
| Implantação pela nossa equipe | sem equivalente visível | console com cadeia de produção, impersonação e importador de cardápio por foto com IA (já construído) | `conta`, `catalogo` |
| Custo e margem no centro | composição e markup escondidos em relatórios | CMV e margem por produto e por canal, preço sugerido por markup | `producao`, `resumo` |
| Encomendas com aprovação por link | orçamento sem aprovação nem funil | orçamento por WhatsApp, sinal por Pix, agenda de produção | `encomendas` |
| Um app para a equipe | um login diferente por app | app único com PIN pessoal, convite por WhatsApp | `equipe`, `portal_colaborador` |
| Página nunca derrubada e dados exportáveis | inadimplência leva a restrição e suspensão; exportação "quando houver recurso" (916) | suspensão mantém a página pública reduzida; exportação completa a qualquer momento | `conta` |

---

## 8. Lacunas que afetam este catálogo

1. **Telas da Olímpia que não foram vistas.** PDV, venda balcão, caixa e
   recebimento, painel da cozinha, pedidos online, mesas e comanda (por
   dentro), pedidos e entregadores do delivery, produção e desossa, contas a
   receber e a pagar, bancos, cedentes, TEF e cartões, portal do contador,
   CRM, cashback, portal do cliente, painel de TV, sinuca, cadastro completo de
   produtos e de pessoas, usuários e grupos, MDF-e, CT-e, SPED, CFOP e séries.
   As fichas desses módulos se apoiam em conhecimento do domínio e no que os
   parâmetros, os relatórios e o manual revelam (ver [mapa](00-mapa.md#7-cobertura-e-rotas-que-continuam-sem-leitura)).
2. **Conta de teste sem movimento.** Não se viram transições de estado, ações
   por linha, cálculos (OS, folha, ponto, comissões), impressões nem o
   resultado de relatórios. As regras de cálculo das fichas são nossas.
3. **Confirmações legais e fiscais** antes de construir: prazos de
   cancelamento e contingência da NFC-e em Rondônia; NFS-e de Porto Velho
   (padrão nacional ou municipal); Portaria 671 (ponto por programa); lei da
   gorjeta (taxa de serviço); tipo de assinatura eletrônica exigido para cada
   documento; regras da Anvisa para etiquetas de manipulação.
4. **Custos de terceiros por levantar:** emissor fiscal, API oficial do
   WhatsApp, modelo de IA, mapas e geocodificação, TEF e adquirentes. Eles
   definem a franquia de cada módulo na mensalidade.
5. **Demanda real por segmento.** As prioridades P2 e P3 são hipóteses; validar
   com clientes pagantes em Porto Velho antes de construir, como manda o brief.
6. **Pesquisa incompleta por bloqueio.** A verificação de segurança do Claude
   Code recusou várias navegações. Completar exige uma decisão do dono da conta
   e, antes, confirmar que os termos de uso da Olímpia permitem o levantamento.
