# Módulos de ERP para pequenas e médias empresas

Data-base: **03/10/2026**. Taxonomia de módulos montada a partir de ~20
sistemas (Saipos, Consumer, Goomer, Cardápio Web, Sischef, Colibri, OPDV,
Yooga, Bling, Olist, Omie, Conta Azul, GestãoClick, MarketUP, Stone, Booksy e
a Olímpia), cruzada com o que o nosso projeto já tem.

Para que serve:

1. dizer, módulo a módulo, o **mínimo** sem o qual o cliente não compra e o
   **diferencial** que ganha a venda;
2. mostrar onde a Olímpia já está (coluna **Olímpia tem?**);
3. mostrar onde nós estamos (coluna **Nosso projeto**) e qual é o `id` do
   módulo no catálogo do código ([`src/lib/modulos/catalogo.ts`](../../src/lib/modulos/catalogo.ts)).

> **Use a Olímpia como lista de conferência, não como molde.** O plano do
> dono é partir dela e enxugar por cliente. Copiar a amplitude dela recria o
> "pacote com tudo" que queremos combater; copiar textos ou telas cria risco
> legal. O que serve é saber o que o cliente local já espera encontrar.

## Como ler as colunas

| Coluna | Valores | Critério |
| --- | --- | --- |
| Mínimo | texto | O que a maioria dos concorrentes entrega e o cliente espera. Sem isso, perdemos a venda |
| Diferencial | texto | O que poucos têm e decide a escolha |
| Olímpia tem? | **sim** / **não** / **não visto** | Só pesquisa pública (sites, ERP antes do login, lojas de apps, redes). "Não visto" = nenhuma página pública mostra; não prova que não exista |
| Nosso projeto | **sim** / **parcial** / **não** | Estado do código em 03/10/2026. Sim = cobre o mínimo; parcial = cobre parte do mínimo ou só o modelo de dados; não = nada |
| `id` | catálogo | `funcional` (pronto), `pre_funcional` (pronto, falta credencial do cliente) ou `planejado` (no roteiro). "Fora do catálogo" = ainda não previsto |

> **A coluna "Olímpia tem?" ainda vai ser completada pela exploração por
> dentro do ERP** (conta de teste, pasta [`erp-olimpia/`](erp-olimpia/)). Ela
> começou em 03/10/2026, mas muitas telas foram bloqueadas pela trava de
> permissões do Claude Code. O [mapa no fim deste documento](#mapa-da-exploração-por-dentro)
> diz que arquivo cobre cada módulo e em que estado está. O próximo passo é
> reler esses arquivos e trocar "não visto" por "sim" ou "não" onde houver
> evidência.

## Resumo em números

São **43 módulos** em 10 grupos (os 9 grupos do catálogo mais "Plataforma").

| | sim | parcial | não visto | não |
| --- | --- | --- | --- | --- |
| Olímpia (público) | 39 | — | 3 | 1 (iFood) |
| Nosso projeto | 2 | 15 | — | 26 |

Leitura honesta: hoje somos um **cardápio digital com pedido por WhatsApp,
painel e console**, com o modelo preparado para crescer. Para vender ERP a um
restaurante ou a uma padaria faltam caixa, PDV, fiscal, comandas e cozinha.
O diferencial que temos de fato (módulos por empresa, importação de cardápio
por foto, página que não cai se o cliente atrasar, exportação dos dados) é de
plataforma, não de tela.

---

## 1. Vendas e atendimento

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Central de pedidos · `pedidos` (funcional) | Pedidos de todos os canais num lugar; aceite e mudança de estado; aviso sonoro; impressão automática | iFood e 99Food na mesma fila; tempo em cada estado | **sim** (balcão de entrega com status em tempo real; pedidos online) | **parcial**: tempo real, estados novo → aceite → pronto → concluído e som, para cardápio e WhatsApp; sem impressão e sem outros canais |
| PDV / frente de caixa · `pdv` (planejado) | Venda rápida no balcão por código de barras ou atalho; vários meios na mesma venda; Pix com QR; TEF/POS sem redigitar; NFC-e; balança; desconto limitado por perfil; cancelamento com senha | Vender sem internet e sincronizar depois; PDV na maquininha smart; preço por horário | **sim** (TEF, balança, Pix; desktop legado e versão web; a web não declara modo offline) | **não** (o canal `balcao` já existe no modelo de pedidos) |
| Mesas e comandas · `comandas` (planejado) | Mapa de mesas; comanda por número ou cartão; adicionais e observações; transferir e juntar; dividir conta; taxa de serviço configurável; fechamento com caixa e NFC-e | QR na mesa para pedir e fechar; fiado; crédito pré-pago | **sim** (Comanda Digital R$ 100; conta parcial e gorjeta; QR na mesa no Premium) | **não** |
| App do garçom · `comandas` (planejado) | Celular ou tablet; lança itens e manda à cozinha por setor; login por garçom | Lançar e cobrar na maquininha; relatório por garçom | **sim** (garçom em PWA) | **não** |
| Atendimento no WhatsApp com bot · fora do catálogo | Resposta automática com link do cardápio, horário e status; passar para humano; API oficial | IA que entende texto e áudio e monta o pedido; campanhas de reativação com consentimento | **sim**, fora do ERP (Olimpia Atendimentos, via WhatsApp Web não oficial); no ERP, "em breve" | **não** (o pedido abre o WhatsApp por link `wa.me` com a mensagem formatada) |
| Totem e tablet de mesa · fora do catálogo | Para fast food com fila: cardápio visual, pagamento integrado, senha | Painel de chamada; self-checkout | **não visto** | **não** |
| Painel de TV de preços e ofertas · fora do catálogo | Produtos e preços em loop na TV da loja | Atualização à distância | **sim** (R$ 100/mês; painel de preços para padaria) | **não** |
| Força de vendas externa · fora do catálogo | Pedidos e orçamentos no celular, offline, com sincronização | Rotas de visita | **sim** (Android e iOS) | **não** |

Notas:

- Regras de consumidor que o módulo de mesas tem de respeitar (Idec): taxa de
  serviço é opcional e aparece com percentual e valor; consumação mínima é
  considerada ilegal; couvert só com aceite; multa por comanda perdida só se
  avisada antes. [idec]
- Na Consumer, comanda mobile só a partir do plano de R$ 179,90 (anual); no
  Goomer, a cozinha só a partir do plano de R$ 184,90. [consumer-loja] [goomer]
- Abrasel (mar/2025): 63% dos bares e restaurantes vendem pelo WhatsApp, 38%
  já usam alguma automação no atendimento e 17% operam só com IA. [abrasel-whatsapp]

## 2. Operação

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Loja: horários e funcionamento · `loja` (funcional, essencial) | Horário por dia; aberto/fechado calculado; fechar agora; entrega e retirada; pedido mínimo | Várias lojas; fuso por loja; página reduzida quando o cliente está suspenso | **sim** (multiempresa e filiais) | **sim** (inclui "fechar loja agora", fuso por loja e página reduzida em suspensão) |
| Cozinha (KDS) e painel de senhas · `cozinha` (planejado) | Envio por setor (cozinha, bar) para impressora ou tela; fila por chegada com a origem; observações em destaque; estados; cronômetro | Alertas por cor quando atrasa; filas separadas para salão e delivery; painel de senhas | **sim** (fila, prioridade, tempo, alertas e impressão na cozinha) | **parcial**: o painel de pedidos serve de fila única; sem tela por setor nem impressão |
| Delivery e entregas · `delivery` (planejado) | Taxa por bairro, raio ou km; cadastro de entregadores, despacho e acerto; status para o cliente | App do entregador com rota e GPS; roteirização; link de rastreio; logística sob demanda | **sim** (delivery próprio com PWA do entregador, GPS e prova de entrega) | **parcial**: entrega/retirada, raio, taxa fixa e pedido mínimo; sem entregadores, taxa por bairro nem status ao cliente |
| Ordens de serviço · `ordens_servico` (planejado) | OS com cliente e equipamento; orçamento de peças e serviços; aprovação; estados; baixa de peças; faturamento com NFS-e | Agenda; técnico em campo com checklist; assinatura digital; área do cliente | **sim** (R$ 50/mês; técnico em PWA no Full) | **não** |
| Agenda e reservas · fora do catálogo | Agenda por profissional; agendamento online 24 h; lembretes; comissão | Proteção contra falta; pacotes; pesquisa de satisfação | **sim** (página de salões; SalonPro em subdomínio próprio) | **não** |

Notas:

- Abrasel (ago/2026, 1.710 empresários): **69% não usam ferramenta digital
  para organizar a produção** e 78% não separam a produção do salão da do
  delivery. Cozinha com filas separadas é diferencial fácil de demonstrar.
  [abrasel-cozinha]
- Por dentro, o delivery da Olímpia calcula frete por km ou por bairro
  ([93](erp-olimpia/93-lacunas-4.md)). A Sirrus também tem taxa por bairro e
  por km. Para nós, taxa por bairro é o próximo passo natural do cardápio.

## 3. Estoque e compras

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Estoque · `estoque` (planejado) | Saldo em tempo real com baixa na venda; unidades e conversões; entradas, saídas e ajustes; mínimo com alerta; inventário; perdas; custo médio; curva ABC | Vários locais com transferência; estoque unificado entre CNPJs; compra sugerida pelo giro | **sim** (entrada por XML, transferências, inventário, curva ABC, lote e validade) | **parcial**: tabela `insumos` com unidade, mínimo e custo, com RLS; nenhuma tela |
| Ficha técnica e CMV · `producao` (planejado) | Ficha que liga produto a insumos com baixa automática; custo por produto e margem | CMV teórico × real por prato e por canal; simulador de preço | **sim** (ficha técnica, CMV e perdas nas páginas de restaurante e padaria) | **parcial**: tabela `fichas` pronta com RLS; nenhuma tela |
| Compras e entrada por XML · `compras` (planejado) | Pedido de compra; entrada pelo XML da NF-e com vínculo de códigos e conversão; contas a pagar geradas; histórico por fornecedor | Busca das notas na SEFAZ e manifestação do destinatário; cotação com aprovação | **sim** (solicitação → cotação → pedido → entrada no Full; importação de XML; manifestação) | **não** |
| Produção · `producao` (planejado) | Ordem de produção que baixa insumos e dá entrada no produto com custo; rendimento e perdas | Receitas intermediárias; etiquetas; desossa | **sim** (produção de padaria) | **não** |

Notas:

- A Saipos vende o CMV automático como o seu maior diferencial (diz ser a
  única; o Sischef também anuncia CMV por prato). Para restaurante, ficha
  técnica com custo real é o argumento financeiro mais forte do segmento.
  [saipos-restaurante] [sischef-recursos]
- Em Rondônia, a manifestação do destinatário é obrigatória para todas as NF-e
  recebidas desde 01/04/2019 (Decreto 23.260/2018): confirmação em até 20 dias,
  desconhecimento em até 10. Se o MEI é dispensado não foi confirmado.
  [qive-ro]
- O modelo já previu insumos e fichas na Fase 1
  ([`0001_esquema.sql`](../../supabase/migrations/0001_esquema.sql)); falta a
  Fase 2 do [brief](../brief.md): telas, baixa automática e alerta de mínimo.

## 4. Financeiro

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Caixa · `caixa` (planejado) | Abertura com fundo de troco; sangria e suprimento com motivo; fechamento por forma de pagamento; vários caixas; relatório por turno e operador; reabertura só com permissão | Conferência cega com tolerância; fechamento enviado ao dono | **sim** (turno com sangria por operador nas páginas de varejo) | **não** |
| Pagamentos, recebíveis e taxas · `pdv` e `bancos` (planejados) | TEF/POS sem redigitar; Pix com QR dinâmico e baixa; taxas e prazos por bandeira e voucher; previsão de recebíveis | Conciliação automática de cartões; conferência das regras do PAT (vale-refeição) | **sim** (TEF R$ 100, Pix no PDV R$ 50, taxas de cartão R$ 80; Mercado Pago, InfinitePay, Stone) | **não** (o pedido só registra a forma de pagamento e o troco) |
| Financeiro · `financeiro` (planejado) | Contas a pagar e a receber com plano de contas e centro de custo; recorrências; fluxo de caixa realizado e previsto; DRE gerencial; inadimplência | Conciliação diária automática; IA que transforma comprovante em lançamento; alertas | **sim** (DRE, fluxo, inadimplência; conciliação R$ 80) | **não** |
| Bancos e Pix · `bancos` (planejado; será pré-funcional) | Extrato no sistema; Pix com baixa por webhook; boletos | Pix Automático; vários bancos | **sim** (14 "drivers" bancários com CNAB, Pix e webhooks a partir do Profissional) | **não** |
| Cobrança e contratos · `cobranca` (planejado; será pré-funcional) | Boleto e Pix com baixa automática; lembretes de vencimento; contratos recorrentes que geram cobrança e nota; crediário/fiado | Pix Automático; régua de cobrança; contrato com assinatura digital | **sim** (Boletos R$ 50; régua de cobrança e links no Full) | **não** |

Notas:

- **PAT (vale-refeição e alimentação):** desde 10/02/2026 a taxa máxima cobrada
  do estabelecimento é 3,6% e o repasse é em até 15 dias; arranjo aberto desde
  10/05/2026 para operadoras grandes; interoperabilidade plena em nov/2026. As
  liminares das operadoras foram derrubadas no TRF-3 (24/02/2026) e há ação no
  STF sem decisão. O módulo de recebíveis deve guardar taxa e prazo de cada
  voucher. [pat-agencia-brasil] [pat-bloomberg]
- Conta Azul inclui IA que lê comprovantes enviados por WhatsApp e concilia o
  extrato todos os dias, sem custo extra nos planos pagos: é a referência do
  "financeiro com IA". [contaazul-ia]
- Bancos, Pix, boletos e Pix Automático estão detalhados em
  [integracoes.md](integracoes.md#3-bancos-pix-boletos-e-conciliação).

## 5. Fiscal

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Nota fiscal · `fiscal` (planejado; será pré-funcional) | NFC-e e NF-e com certificado A1; NFS-e no padrão nacional; cancelamento, inutilização, contingência; XML para o contador; regras por produto; campos de IBS/CBS | Manifestação e busca de notas de entrada; acesso do contador; MDF-e e CT-e; IA que aponta erros antes de transmitir | **sim** (NF-e, NFC-e, NFS-e nacional, CT-e, MDF-e, SPED, SAT; nenhuma menção a IBS/CBS) | **não** (regra do domínio: integrar parceiro, não construir emissor) |

Notas:

- O calendário fiscal que afeta o produto (NFS-e nacional obrigatória para o
  Simples em 01/11/2026, IBS/CBS no Simples em 01/01/2027, CNPJ alfanumérico,
  QR Code v3) está em [integracoes.md](integracoes.md#1-nota-fiscal-nfc-e-nf-e-e-nfs-e).
- SPED Fiscal (EFD) não interessa ao comerciante do Simples em Rondônia, que é
  dispensado; a Olímpia cobra R$ 500/mês por ele. [sefin-tate]
- O MEI não precisa emitir nota em venda a pessoa física (LC 123/2006, art.
  26, § 6º, II). Isso permite um plano de entrada sem fiscal. [lc123]

## 6. Equipe

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Ponto e jornada · `ponto` (planejado) | Se for registro oficial: REP-P com registro no INPI, comprovante assinado, AFD e AEJ assinados, atestado técnico. Sempre: espelho, banco de horas, extras, escalas, exportação para o contador | Reconhecimento facial com prova de vida; GPS falso detectado; funcionar offline; ponto na maquininha | **sim** (selfie + GPS, espelho, banco de horas; R$ 90 ou R$ 45 no RH) | **não** |
| Comissões, gorjeta, folha e portal do colaborador · fora do catálogo | Comissões de vendedores e garçons; exportação para o contador | Folha com holerite; portal do colaborador; rateio da taxa de serviço | **sim** (folha, portal e comissões no Full) | **não** |

Notas:

- **Ponto só é obrigatório acima de 20 trabalhadores por estabelecimento**
  (CLT, art. 74, § 2º). A maioria dos nossos clientes não é obrigada: o
  módulo é controle e prova trabalhista, não obrigação. [clt]
- Biometria facial é dado pessoal sensível (LGPD). Requisitos técnicos e
  legais do REP-P em [integracoes.md](integracoes.md#5-ponto-eletrônico).
- Preço-âncora: Stone cobra R$ 7,99 por funcionário com ponto facial na
  maquininha. [stone-ponto]
- **Lei da Gorjeta (13.419/2017):** a taxa de serviço é remuneração; a
  empresa pode reter até 20% (Simples) ou 33% (demais regimes) para encargos e
  repassa o resto; o rateio é definido em acordo coletivo ou assembleia. O
  módulo de mesas deve separar a taxa de serviço do faturamento e gerar o
  relatório de rateio. [gorjeta]

## 7. Clientes e relacionamento

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Clientes e CRM · `clientes` (planejado) | Cadastro com histórico de pedidos, frequência e ticket médio; inativos e aniversariantes; campanhas por WhatsApp | Consulta de CNPJ e CEP; funil para venda B2B | **sim** (CRM de markup; a própria tabela comparativa dá nota "fraco" ao funil) | **não** (os pedidos guardam nome e telefone, mas não há cadastro de clientes) |
| Fidelidade, cashback e campanhas · `fidelidade` (planejado) | Cupons; pontos ou cashback | Campanhas segmentadas; promoções com consentimento no checkout e descadastro por palavra-chave | **não visto** | **não** |
| Portal do cliente · fora do catálogo | — | Boletos, pedidos, notas e chamados num só lugar | **sim** (Full) | **não** |

Notas:

- A Sirrus já pede consentimento no checkout do delivery para mandar
  promoções por WhatsApp e publica uma política com descadastro ("SAIR",
  "PARAR"). Se fizermos campanhas, esse é o mínimo. [sirrus-promo-politica]
- Desde jun/2026 o WhatsApp pode esconder o telefone de quem usa nome de
  usuário: o cadastro de clientes não pode depender só do número quando
  houver integração por API. [twilio-bsuid]

## 8. Canais de venda

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Cardápio digital com pedido no WhatsApp · `cardapio` (funcional) | Link e QR; fotos, categorias e complementos; horário e pausa de itens; taxa de entrega automática; pedido na central e no WhatsApp; pagamento online; cupons; agendamento; sem comissão | Venda sugestiva; produto por horário; pixel e analytics; app com a marca do cliente; promoções com consentimento | **sim** (cardápio por QR e loja virtual; no SaaS, só no Premium) | **parcial**: o núcleo funciona (link, fotos, categorias, grupos de opção, aberto/fechado pelo horário real, pausa de item, entrega ou retirada, troco, pedido no painel e no WhatsApp, sem comissão, importação por foto). Faltam pagamento online, cupons, agendamento, taxa por bairro ou km e status do pedido para o cliente |
| Loja virtual (catálogo com variações) · `loja_virtual` (planejado) | Catálogo ligado ao estoque; variações de cor e tamanho; checkout | Frete e etiquetas de envio | **sim** (loja virtual PWA, R$ 50/mês) | **parcial**: o cardápio já funciona como catálogo simples e os grupos de opção cobrem tamanho e cor, sem estoque por variação |
| iFood, 99Food e Keeta · `marketplaces` (planejado) | Integração nativa com o iFood; hub para 99Food e Keeta (Open Delivery) | Disponibilidade sincronizada nos dois sentidos; conciliação de repasses | **não** (nenhuma menção) | **parcial**: o modelo está pronto (`canal` com `ifood` e `99food`, `canal_pedido_id`, formato canônico Open Delivery em [`tipos.ts`](../../src/lib/canais/tipos.ts)); nenhum adaptador |
| Mercado Livre e marketplaces de varejo · `marketplaces` (planejado) | Anúncios, pedidos e estoque sincronizados | Vários marketplaces | **sim** (Mercado Livre no Premium; Shopee, Tray e outros só em páginas de SEO) | **não** |

Notas:

- A lista de funções do Sirrus Delivery (lida no código público) é o
  "mínimo para não ficar atrás" no cardápio: envio ao WhatsApp opcional ou
  direto ao sistema, status do pedido, "CPF na nota", cupom, troco, taxa por
  bairro ou km, pedido mínimo, agendamento, vários links, pixel, pagamento
  online, pizza por sabores. Ver [concorrentes.md](concorrentes.md#32-produtos).
- O iFood cobra 12% (plano Básico) ou 23% (plano Entrega) por pedido, mais
  3,2% no pagamento online e R$ 110 ou R$ 150 de mensalidade acima de
  R$ 1.800 faturados. Cardápio próprio sem comissão é o argumento de venda
  mais concreto que temos. [ifood-taxas]

## 9. Relatórios e inteligência

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Resumo de vendas e relatórios · `resumo` (funcional) e `relatorios` (planejado) | Painel do dia por canal, pagamento e hora; ticket médio; mais vendidos; por garçom ou vendedor; estoque e financeiro; exportação; no celular do dono | Tempo por estado da cozinha; API de dados | **sim** (Relatórios Gerenciais R$ 100; mais de 37 relatórios) | **parcial**: faturamento do dia e da semana, número de pedidos, ticket médio e 10 mais vendidos ([`resumo.ts`](../../src/lib/dominio/resumo.ts)); console com pedidos de todas as empresas; sem exportação |
| BI e IA analítica · `relatorios` (planejado) | Gráficos de receita, despesa, caixa, vendas e estoque | Perguntas em linguagem natural; agentes que agem no ERP; alertas automáticos | **sim** (BI no Full; IA só no Advisor da consultoria; a tabela da própria Olímpia diz "não" para IA nativa) | **não** |
| Resumo diário no WhatsApp do dono · `ia_whatsapp` (planejado) | — (ninguém entrega) | Mensagem diária ao dono com vendas, caixa e ponto, incluída no preço | **não visto** | **não** |

Notas:

- IA dentro do ERP já é padrão nacional: créditos mensais no Bling (25 a
  1.000) e na Olist (10 a 40), IA inclusa na Conta Azul, agentes na Omie,
  assistente no Sischef e na GestãoClick. **Ter IA não diferencia; o que
  diferencia é o que ela entrega.** [bling] [omie-agentes]
- O resumo diário não precisa de IA para existir: são números do dia num
  modelo de mensagem. A IA entra depois (alertas, perguntas). Custo e desenho
  em [integracoes.md](integracoes.md#4-whatsapp).

## 10. Plataforma (transversal)

| Módulo · `id` | Mínimo | Diferencial | Olímpia tem? | Nosso projeto |
| --- | --- | --- | --- | --- |
| Cadastros-base | Clientes PF/PJ, fornecedores, colaboradores com função, produtos e serviços com dados fiscais (NCM, CFOP, CST/CSOSN), tabelas de preço, importação por planilha | Campos extras; grade de variações; importação por foto com revisão; consulta de CNPJ e CEP | **sim** (cadastros, grades e permissões; consulta do CNPJ no cadastro da empresa) | **parcial**: produtos, categorias e grupos de opção com foto; importador por foto e planilha com revisão humana; sem clientes, fornecedores nem dados fiscais do produto |
| Módulos por empresa | Ligar só o que o cliente usa | Telas por segmento; dependências resolvidas sozinhas | **sim** (módulos avulsos no site; escada de planos no SaaS) | **sim**: catálogo, tabela `tenant_modulos` com RLS, guarda por módulo nas rotas e painel só com os separadores ligados |
| Multiempresa, usuários e permissões | Perfis por função (caixa, garçom, gerente) com permissões; várias lojas e CNPJs | Franquias e redes; usuários ilimitados | **sim** (filiais com CNPJ e série próprios; permissão por tela; limites de usuários por plano) | **parcial**: multi-tenant com isolamento testado, várias lojas no modelo, papéis dono e funcionário, operadores e impersonação; sem permissão por tela |
| Auditoria, segurança, LGPD e continuidade | Registro de ações sensíveis (cancelamento, desconto, reabertura de caixa, preço); backup diário; política de privacidade; guarda dos XML | Funcionar offline; dados do cliente exportáveis | **sim** para auditoria e backup (declarados); LGPD não vista nas páginas públicas | **parcial**: RLS provada em teste, histórico da cadeia, anonimização de pedidos antigos, exportação completa dos dados, aviso no checkout; sem registro de ações sensíveis; backup diário só no plano Pro do Supabase ([operacao.md](../operacao.md)) |
| Integrações e API | iFood, adquirentes/TEF, bancos, contabilidade, API documentada | Hub de delivery; loja de extensões | **sim** (API REST sem documentação pública; webhooks bancários e do Mercado Livre) | **parcial**: interface de adaptador de canal; nenhum adaptador externo; sem API pública |
| Implantação e importação | Importação de produtos, clientes e saldos; treinamento por perfil | Cardápio importado de uma foto; fotos tratadas; checklist de implantação igual para todos | **sim** (implantação assistida por etapas; R$ 1.200 no site) | **parcial**: importação de cardápio por foto (IA) ou planilha com revisão; biblioteca de fotos e documentos por empresa; cadeia de produção como checklist. Sem clientes e saldos porque esses módulos não existem |
| Consultoria e diagnóstico | — | Diagnóstico com índice, plano de ação e acompanhamento | **sim** (Gestão 360°, paga à parte ou no Full) | **parcial**: a cadeia de produção faz o diagnóstico digital de cada empresa (Instagram, site, Google, iFood…), mas só a equipe vê |
| Periféricos: impressora, gaveta, balança, leitor · fora do catálogo (parte do `pdv`) | Cupom e pedido impressos; gaveta; balança; leitor de código | Impressão silenciosa; agente local; balança por etiqueta | **sim** (balança, impressão na cozinha, pinpad) | **não** |

---

## Perfis por segmento

O argumento "telas do seu ramo" só convence se cada perfil abrir com outro
painel. Sugestão de perfis, montados a partir das páginas de segmento da
Olímpia e da Sirrus e do levantamento de mercado. No código, isto pode virar
uma lista de perfis ao lado do catálogo, que liga de uma vez os módulos do
segmento.

| Perfil | Módulos (`id`) | O que justifica |
| --- | --- | --- |
| Lanchonete, açaí, marmitaria (1 a 3 pessoas, o cliente do brief) | `pedidos`, `cardapio`, `loja`, `resumo`, `ia_whatsapp`; opcionais `caixa`, `delivery`; `fiscal` só se emitir NFC-e | WhatsApp é 26% do faturamento de delivery (Abrasel); MEI não precisa de nota para pessoa física |
| Restaurante com salão | + `comandas`, `cozinha`, `caixa`, `pdv`, `fiscal`, `estoque`, `producao`, `marketplaces` | Oferta padrão da Olímpia (Olimpia Food) e da Sirrus (Cook); CMV como argumento; cozinha desorganizada em 69% dos casos |
| Padaria | `pdv` (balança e etiqueta), `caixa`, `fiscal`, `producao` (receita, rendimento, perdas), `estoque` (validade), `cardapio` para encomendas; TV de preços | "Combo Padaria" da Olímpia; padaria é o segmento em que ela mais faz SEO em RO |
| Mercado e conveniência | `pdv` (leitor, balança, vários caixas), `caixa` (turnos e sangria), `estoque` (validade, perdas, curva ABC), `compras` (XML), `fiscal`, `bancos`, `clientes` (crediário) | Páginas de supermercado, atacarejo e conveniência da Olímpia |
| Serviços e oficina | `ordens_servico`, `clientes`, `fiscal` (NFS-e nacional), `cobranca`; agenda | NFS-e nacional obrigatória para o Simples em 01/11/2026 |
| Moda e catálogo (o caso do vídeo de referência) | `cardapio` ou `loja_virtual` com variações, `pedidos`, `estoque` (grade), `clientes` | Catálogo com cor e tamanho e pedido no WhatsApp |
| Salão e estética | agenda, `clientes`, `fidelidade`, comissões | SalonPro da Olímpia; Booksy a R$ 99,99 + R$ 20 por agenda |

## Prioridades sugeridas (para decisão)

O [brief](../brief.md) manda não começar uma fase antes de a anterior ter
cinco clientes pagando. A pesquisa sugere esta ordem, se o dono decidir
vender ERP para restaurante e padaria:

1. **Já, sem esperar:** aceitar CNPJ alfanumérico (hoje o banco e a validação
   só aceitam 14 dígitos; ver [integracoes.md](integracoes.md#2-consulta-cadastral-cnpj-cep-ie-e-simples));
   no cardápio, taxa por bairro, status do pedido para o cliente, cupom e
   agendamento; o resumo diário no WhatsApp, primeiro sem IA.
2. **Para vender a restaurante e padaria:** caixa, PDV simples, fiscal por
   parceiro (NFC-e), comandas e cozinha. É a paridade mínima com Olímpia e
   Sirrus.
3. **Depois:** estoque e ficha técnica com CMV (as tabelas já existem),
   bancos e Pix, financeiro.
4. **Fase 3 do brief:** iFood e Open Delivery (99Food, Keeta).
5. **Sob decisão:** ponto (controle interno ou REP-P oficial), OS e agenda
   (outros segmentos), loja virtual com estoque por variação.

## Referências de preço por módulo

Valores mensais. Servem para precificar módulos avulsos ou justificar o que
está incluído na mensalidade.

| Módulo | Olímpia (site) | Outros |
| --- | --- | --- |
| Comandas e mesas | R$ 100 | GrandChef +R$ 30 ou +R$ 20 (não confirmado); Cardápio Web Mesas R$ 169,99 |
| Cozinha (KDS) | incluída no food | Goomer: só a partir de R$ 184,90 |
| Delivery e entregas | Romaneio R$ 100 (carga) | Cardápio Web Gestão de Entregas R$ 54,99 |
| Estoque | Balanço R$ 50 | Cardápio Web Estoque Avançado R$ 29,99 |
| Financeiro | Conciliação R$ 80; Relatórios R$ 100 | Cardápio Web Financeiro R$ 69,99 |
| Cobrança | Boletos R$ 50 | GestãoClick: boletos a partir do Prata |
| Fiscal | NFS-e R$ 100; MDF-e R$ 100; SPED R$ 500 | Cardápio Web Fiscal R$ 69,99; custo de API para nós: R$ 59,90 a R$ 89,90 por CNPJ (Focus NFe) |
| Pagamentos | TEF R$ 100; Pix no PDV R$ 50; taxas de cartão R$ 80 | Consumer TEF adicional R$ 21; Olist R$ 50 por integração de maquininha adicional |
| Ponto | R$ 90; RH R$ 45 (5 pessoas) | Stone R$ 7,99 por funcionário; mercado de R$ 5 a mais de R$ 30 por colaborador |
| Ordem de serviço | R$ 50 | GestãoClick: em todos os planos |
| Loja virtual / Força de vendas / Etiquetas | R$ 50 cada | — |
| TV de ofertas | R$ 100 | — |
| Agenda | — | Booksy R$ 99,99 + R$ 20 por agenda |
| Consultoria | Gestão 360°: R$ 1.500 a 12.000 por projeto ou R$ 1.500 a 5.000/mês | — |

## Mapa da exploração por dentro

Arquivos da pasta [`erp-olimpia/`](erp-olimpia/) por assunto, com o estado em
03/10/2026. "Bloqueado" = a trava de permissões do Claude Code recusou a
navegação; o login funcionava.

| Assunto | Arquivos | Estado |
| --- | --- | --- |
| Dashboard, BI, PDV, vendas, balcão, romaneios | [90](erp-olimpia/90-lacunas-1.md) | bloqueado |
| Caixa | [03](erp-olimpia/03-caixa.md), [91](erp-olimpia/91-lacunas-2.md) | bloqueado |
| Cardápio, comanda, cozinha, tablet | [04](erp-olimpia/04-cardapio-comanda-cozinha.md), [91](erp-olimpia/91-lacunas-2.md) | só a tela inicial do módulo |
| Delivery e loja virtual | [05](erp-olimpia/05-delivery.md), [06](erp-olimpia/06-loja-virtual-mercado-livre.md), [93](erp-olimpia/93-lacunas-4.md) | parcial: configuração do frete e telas da loja lidas; apps do entregador e da loja não abertos |
| Mercado Livre e produtos | [94](erp-olimpia/94-lacunas-5.md), [921](erp-olimpia/921-lacunas-22.md) | parcial: relatório de pedidos do Mercado Livre lido |
| Cadastros, empresa, usuários | [08](erp-olimpia/08-pessoas-empresa-acessos.md), [95](erp-olimpia/95-lacunas-6.md), [96](erp-olimpia/96-lacunas-7.md) | parcial: empresa, filiais, plano de contas e logística lidos |
| Estoque | [09](erp-olimpia/09-estoque.md), [96](erp-olimpia/96-lacunas-7.md), [97](erp-olimpia/97-lacunas-8.md), [919](erp-olimpia/919-lacunas-20.md), [920](erp-olimpia/920-lacunas-21.md) | parcial: entradas, saídas, transferências, balanços e relatórios lidos |
| Compras, produção, desossa | [10](erp-olimpia/10-compras-producao.md), [97](erp-olimpia/97-lacunas-8.md), [98](erp-olimpia/98-lacunas-9.md), [920](erp-olimpia/920-lacunas-21.md) | relatórios lidos; telas de operação bloqueadas |
| Financeiro e bancos | [11](erp-olimpia/11-financeiro-bancos.md), [98](erp-olimpia/98-lacunas-9.md), [99](erp-olimpia/99-lacunas-10.md), [917](erp-olimpia/917-lacunas-18.md), [918](erp-olimpia/918-lacunas-19.md) | parcial: tela principal da conciliação e relatórios de faturamento e bancos |
| Cobrança, CRM, cashback, portal do cliente | [12](erp-olimpia/12-cobranca-crm-cashback-portal.md), [910](erp-olimpia/910-lacunas-11.md), [911](erp-olimpia/911-lacunas-12.md) | cobrança automática completa; CRM só o lançador; cashback e portal bloqueados |
| Fiscal | [13](erp-olimpia/13-fiscal.md), [912](erp-olimpia/912-lacunas-13.md), [921](erp-olimpia/921-lacunas-22.md) | parcial: 2 de 10 telas, grupo tributário e relatórios fiscais |
| OS e força de vendas | [14](erp-olimpia/14-os-forca-vendas.md), [20](erp-olimpia/20-relatorios-comissoes-os.md), [919](erp-olimpia/919-lacunas-20.md) | telas lidas numa conta sem registros |
| Ponto | [15](erp-olimpia/15-ponto.md), [912](erp-olimpia/912-lacunas-13.md), [913](erp-olimpia/913-lacunas-14.md) | explorado: painel, configuração e relógio |
| Folha, portal do colaborador, assinatura | [16](erp-olimpia/16-folha-colaborador.md), [913](erp-olimpia/913-lacunas-14.md), [914](erp-olimpia/914-lacunas-15.md) | explorado, com listas vazias |
| Consultoria, IA, MCP, agente local | [17](erp-olimpia/17-consultoria-ia.md), [914](erp-olimpia/914-lacunas-15.md), [915](erp-olimpia/915-lacunas-16.md) | consultoria e agente local lidos; MCP e Monitor WhatsApp IA bloqueados pelo plano |
| Parâmetros, plano, comissões, termos | [18](erp-olimpia/18-parametros-plano-comissoes.md), [915](erp-olimpia/915-lacunas-16.md), [916](erp-olimpia/916-lacunas-17.md) | lidos (lista dos 36 módulos do Full; termos de uso) |
| Relatórios | [19](erp-olimpia/19-relatorios-vendas-financeiro.md), [20](erp-olimpia/20-relatorios-comissoes-os.md), [21](erp-olimpia/21-relatorios-estoque-compras-fiscal.md), [917](erp-olimpia/917-lacunas-18.md) a [921](erp-olimpia/921-lacunas-22.md) | filtros lidos na maioria; nenhum relatório gerado |
| Manual | [22](erp-olimpia/22-manual.md), [922](erp-olimpia/922-lacunas-23.md) | lido |

O que essa exploração já mudou na leitura pública está resumido em
[concorrentes.md](concorrentes.md#22-produtos-e-linhas).

## Fontes

[idec]: https://idec.org.br/consultas/dicas-e-direitos/cuidado-com-as-cobrancas-indevidas-e-pegadinhas-em-restaurantes
[consumer-loja]: https://loja.consumer.com.br/
[goomer]: https://goomer.com.br/planos
[abrasel-whatsapp]: https://abrasel.com.br/noticias/noticias/whatsapp-representa-26-do-faturamento-delivery-bares-restaurantes/
[abrasel-cozinha]: https://www.editorialbrasil.com.br/2026/09/aplicativos-geram-58-das-vendas-por.html
[saipos-restaurante]: https://saipos.com/sistema/restaurante
[sischef-recursos]: https://sischef.com/recursos-funcionalidades/
[qive-ro]: https://qive.com.br/blog/manifestacao-do-destinatario-obrigacao-rondonia-mf
[pat-agencia-brasil]: https://agenciabrasil.ebc.com.br/economia/noticia/2026-02/novas-regras-para-vales-alimentacao-e-refeicao-entram-em-vigor
[pat-bloomberg]: https://www.bloomberglinea.com.br/negocios/justica-derruba-liminares-e-abre-caminho-para-novas-regras-a-empresas-de-vale-refeicao/
[contaazul-ia]: https://contaazul.com/funcionalidades/conta-azul-ia/
[sefin-tate]: https://tate.sefin.ro.gov.br/storage/2024/10/20222700100190-1.pdf
[lc123]: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
[clt]: https://findes.com.br/wp-content/uploads/2020/03/Informe-Estrategico-%E2%80%93-Registro-de-ponto-1.pdf
[stone-ponto]: https://conteudo.stone.com.br/bate-ponto-stone/
[gorjeta]: https://www.aasp.org.br/?p=30671
[sirrus-promo-politica]: https://sirrus-bot-politicas-promocionais-4daf2a.gitlab.io/
[twilio-bsuid]: https://www.twilio.com/en-us/changelog/whatsapp-usernames--new-business-scoped-user-id--bsuid--field-re
[ifood-taxas]: https://blog-parceiros.ifood.com.br/taxas-ifood/
[bling]: https://www.bling.com.br/planos-e-precos
[omie-agentes]: https://ajuda.omie.com.br/pt-BR/articles/15961691-conhecendo-os-agentes-de-ia-da-omie

Outras fontes usadas na taxonomia: páginas da Olímpia
([ERP](https://erp.olimpiasistemas.com.br/),
[restaurante](https://olimpiasistemas.com.br/sistema-para-restaurante.php),
[padaria](https://olimpiasistemas.com.br/sistema-para-panificadoras.php),
[supermercado](https://olimpiasistemas.com.br/sistema-para-supermercado.php),
[salão](https://olimpiasistemas.com.br/sistema-para-salao-de-beleza.php),
[ponto](https://olimpiasistemas.com.br/sistema-de-ponto.php),
[integrações](https://olimpiasistemas.com.br/integracoes.php)),
[Sirrus food](https://www.sirrus.com.br/segmentos/area-alimenticia),
[Bling funcionalidades](https://www.bling.com.br/funcionalidades),
[Omie funcionalidades](https://www.omie.com.br/funcionalidades/),
[GestãoClick funcionalidades](https://gestaoclick.com.br/funcionalidades/),
[Colibri](https://colibri.com.br/solucoes),
[Cardápio Web](https://ajuda.cardapioweb.com/boas-vindas/planos-funcionalidades-e-modulos-adicionais),
[conferência cega (Alterdata)](https://ajuda.alterdata.com.br/shop/vendas-aba-do-shop/conferencia-cega-shop),
[Booksy](https://biz.booksy.com/pt-br/precos).
