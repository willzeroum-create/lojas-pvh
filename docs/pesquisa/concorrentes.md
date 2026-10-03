# Concorrentes: Olímpia, Sirrus, agências locais e referências nacionais

Data-base: **03/10/2026**. Preços, telas e números mudam com frequência:
reconfira a fonte antes de citar qualquer valor numa proposta.

Como ler este documento:

- Tudo o que está aqui passou por uma pesquisa e por uma verificação cética.
  Quando a verificação corrigiu a pesquisa, vale a correção.
- **(não confirmado)** marca o que é relevante mas não foi possível conferir.
- "Cálculo nosso" marca contas feitas por nós a partir de preços públicos.
- Os textos dos concorrentes foram resumidos com palavras nossas. Não copie
  frases deles para a nossa landing ou propostas.
- O que foi visto **por dentro** do ERP da Olímpia (numa conta de teste) está
  na pasta [`erp-olimpia/`](erp-olimpia/) e só aparece aqui quando muda uma
  conclusão pública. Essa exploração está incompleta: muitas telas foram
  bloqueadas pela trava de permissões do Claude Code.

---

## 1. Mapa rápido

| Concorrente | Quem é | Porte real (o que dá para provar) | Preço público? | Força principal | Fraqueza principal |
| --- | --- | --- | --- | --- | --- |
| **Olímpia** (Olimpia Software Serviços de Informática Ltda) | ERP + software house de Porto Velho | Microempresa no Simples; LinkedIn indica 2 a 10 pessoas; em vídeo de 2025 a própria empresa fala em cerca de 450 clientes atendidos por 4 pessoas | Sim, em duas tabelas que se contradizem | Amplitude de módulos, preço aberto, SEO agressivo, desenvolvimento rápido em 2026 | Credibilidade: números que não batem, depoimentos ilustrativos, páginas legais genéricas |
| **Sirrus** (Work Soft Comércio de Informática e Serviços Ltda) | Automação comercial desde 2004; é, muito provavelmente, o "Sirius" citado pelo dono | ~2 mil clientes ativos declarados (5 mil no histórico), ~25 pessoas, filial em Florianópolis | Não | Reputação de suporte humano, oferta de food completa, hardware, iFood | Núcleo desktop Windows, preço opaco, nenhuma IA |
| **NossoERP** (Obter Soluções Tecnológicas Ltda) | ERP de Porto Velho, ativo desde 2016 | Microempresa | Não | PDV que vende sem internet, IA própria | Site com cara de template, depoimentos não verificáveis |
| **Agências locais** (ex.: Clica.se) | Marketing, sites e vídeo | Pequenas | Não | Proximidade | Quase sem vitrine na web, sem portfólio publicado |
| **Nacionais** (Saipos, Consumer, Goomer, Cardápio Web, Bling, Conta Azul, Omie, GestãoClick…) | SaaS remoto | Grandes | Sim | Preço de entrada baixo, teste grátis, produto maduro | Atendimento só à distância; nenhum caso local |

---

## 2. Olímpia

### 2.1 Quem é de fato

- **Empresa:** Olimpia Software Serviços de Informática Ltda, CNPJ
  32.616.546/0001-68, aberta em 31/01/2019 (foi MEI até 31/03/2019),
  microempresa, no Simples Nacional desde 01/01/2024, capital de R$ 90 mil,
  CNAE principal 6202-3/00 (licenciamento de software customizável), um único
  sócio-administrador desde 2021. [olimpia-cnpj]
- **Idade:** LinkedIn e a página "Sobre" antiga dão fundação em 2018; o
  domínio foi registrado em 23/11/2017. A página de números do site diz
  "mais de 15 anos de mercado", o que **não se sustenta**. [olimpia-numeros]
  [olimpia-linkedin] [olimpia-rdap]
- **Equipe:** LinkedIn com porte de 2 a 10 pessoas e 2 perfis vinculados. Num
  vídeo de 17/06/2025 a empresa diz atender 450 clientes com 4 pessoas. O
  fundador é também o desenvolvedor principal; na App Store os apps são
  publicados em nome de pessoa física (no Google Play a conta aparece como
  "Olimpia Sistemas"). A única vaga pública recente (jun/2026) é para vendas.
  [olimpia-video-equipe] [olimpia-vaga]
- **Clientes declarados:** 300+ (página de 2024), 450 (2025), 500+ (2026).
  Nada disso é verificável. O único app próprio nas lojas, o de força de
  vendas, tem 46 instalações no Android e 1 avaliação no iOS.
  [olimpia-play] [olimpia-ios]
- **Endereço:** o da Receita e do site (bairro Igarapé) não é o do Google Maps
  (Nova Porto Velho). Há dois WhatsApps em uso em canais diferentes.
- **Ecossistema:** passou pelo HUB RO, foi a eventos com apoio do Sebrae RO e
  foi **indicada** (não premiada) ao ranking 100 Open Startups 2025. O site se
  diz "a mais premiada da Região Norte" sem nomear prêmio algum. [olimpia-100os]

### 2.2 Produtos e linhas

| Linha | O que é | Onde |
| --- | --- | --- |
| Site institucional | ERP Base com implantação + 18 módulos avulsos; software house; CRM e atendimento por WhatsApp; loja virtual; ponto; programa de revenda | [olimpia-home] |
| ERP SaaS | Laravel 11 + PostgreSQL por empresa (declarado). 11 grupos, 37 módulos mais o WhatsApp Business "em breve" (38 cards). Cadastro self-service com consulta automática do CNPJ; login com código da empresa, filial, usuário e senha, sem recuperação de senha visível | [olimpia-erp] [olimpia-cadastro] [olimpia-login] |
| Ponto (RH) | SaaS separado, com login próprio por e-mail. Plano Bronze para até 5 colaboradores, 30 dias grátis | [olimpia-rh] |
| Olimpia Atendimentos | Central de WhatsApp com tickets, CRM, **bot e IA**. Conecta o número por QR Code (WhatsApp Web, via biblioteca não oficial). IA padrão rodando num servidor próprio, com OpenAI ou Gemini como opção; agente que consulta boleto e status de pedido; transcrição de áudio; campanhas. 292 entradas de changelog entre 24/05 e 17/08/2026. Não está claro se é vendido a clientes ou só usado internamente | [olimpia-chat] [olimpia-chat-js] |
| Prospecção automatizada | No mesmo app: busca na base aberta da Receita por UF, cidade e segmento (com atalhos para Mercado, Padaria e Restaurante), captação de leads no Google Maps e no Instagram, campanhas por WhatsApp e e-mail com mensagem gerada por IA para cada contato, enviadas com intervalos de 5 a 45 s | [olimpia-chat-js] |
| Gestão 360° | Consultoria acoplada ao ERP: diagnóstico em 8 áreas, índice de 0 a 100, plano 30/60/90 dias, "Advisor" com IA. Incluída no plano Full e vendida à parte | [olimpia-360] |
| Outros subdomínios | SalonPro (salões, com agenda e teste de 30 dias), gestor de tarefas, painel de "agente", gerenciador de arquivos, sites de clientes (uma concessionária de motos e um escritório de advocacia) | [olimpia-certs] |
| Olimpia Bank | Conta PJ integrada ao ERP anunciada em 17/07/2026 como "em breve". Sem página, sem instituição financeira identificada | [olimpia-bank] |
| Legado desktop | PDV e ERP Windows operados por teclas F, mostrados em tutorial de 2025 (nome de janela típico de Delphi). Em 2026 a empresa passou a vender a versão web como "o sistema que evoluiu" | [olimpia-video-pdv] |

**O que a exploração por dentro já mostrou** (conta de teste, só leitura; ver
[`erp-olimpia/`](erp-olimpia/)):

- O ponto tem foto e **validação facial** em cada batida, GPS, cerca
  geográfica e o rótulo "REP-P / Portaria 671", mas nenhuma tela mostrou AFD,
  AEJ ou comprovante. [912](erp-olimpia/912-lacunas-13.md)
- Existem um "MCP / Conector IA" e um "Monitor WhatsApp IA" (agente de vendas
  no WhatsApp que cria vendas e orçamentos no ERP), como adicionais fora de
  todos os planos. [915](erp-olimpia/915-lacunas-16.md)
- Há um agente desktop ("Bridge", Windows e macOS) para impressora, balança e
  gaveta, com pareamento por token, e Web Serial para balança no PDV web.
  [915](erp-olimpia/915-lacunas-16.md)
- Há Termos de Uso versão 1.1 (07/08/2026) com aceite registrado após o login
  (IP e hash). [915](erp-olimpia/915-lacunas-16.md)
- A cobrança automática configura Asaas, Efí e Mercado Pago, com campos
  marcados como "stub". [910](erp-olimpia/910-lacunas-11.md)

### 2.3 Preços públicos

**Site institucional** [olimpia-home]

| Item | Valor |
| --- | --- |
| ERP Base (cadastros, PDV, NF-e, financeiro básico, relatórios, suporte) | R$ 1.200 de implantação + R$ 200/mês |
| Balanço de Estoque, Boletos, Etiquetas, Força de Vendas, Loja Virtual, Ordem de Serviço, Pix no PDV | R$ 50/mês cada |
| Conciliação Bancária, Controle de Taxas de Cartão | R$ 80/mês cada |
| Sistema de Ponto (selfie + GPS) | R$ 90/mês |
| Comanda Digital, MDF-e, NFS-e, Relatórios Gerenciais, Romaneio, TEF, Painel TV de Ofertas | R$ 100/mês cada |
| SPED Fiscal | R$ 500/mês (só interessa a Lucro Real/Presumido; em Rondônia o Simples e o MEI são dispensados da EFD) [sefin-tate] |

**ERP SaaS** (sem taxa de implantação, sem cartão, cancelamento livre) [olimpia-erp]

| Plano | Valor | O que destrava |
| --- | --- | --- |
| MEI | Grátis | Cadastros, vendas, PDV, estoque e financeiro. **Não emite NF-e nem NFC-e** |
| Starter | Não publicado | Relatórios, balcão de entrega, gerenciamento em massa, importação de XML |
| Profissional | R$ 299,90/mês | NF-e, NFC-e, bancos, boletos, Pix, TEF, CRM/markup. 20 usuários, 2 empresas |
| Premium | R$ 499,90/mês | Loja virtual, cardápio e comanda, garçom, delivery, Mercado Livre, força de vendas, CT-e/MDF-e. 50 usuários, 3 empresas |
| Full | R$ 799/mês | Ponto, folha, portais, OS, assinatura eletrônica, compras, cobrança automática, BI, Gestão 360°, suporte incluso. 100 usuários |

**Outros:** Ponto RH Bronze R$ 45 (até 5 colaboradores; a página não diz se é
mensal) [olimpia-rh-registro]. Gestão 360°: diagnóstico R$ 1.500 a 3.000;
programa de 90 dias R$ 4.000 a 12.000; acompanhamento contínuo R$ 1.500 a
5.000/mês [olimpia-360].

**Contradições entre as tabelas:** implantação de R$ 1.200 contra "sem taxa";
NF-e no Base de R$ 200 contra só a partir de R$ 299,90; ponto a R$ 90, a R$ 45
ou só no Full; suporte só aparece como incluso no Full.

### 2.4 Pegada externa

| Canal | Situação em 03/10/2026 |
| --- | --- |
| Google (Perfil da Empresa) | Nota 5,0 com 61 avaliações. Um grupo de avaliações curtas e recentes de perfis com poucas avaliações (não confirmado) [olimpia-maps] |
| Reclame Aqui | Sem perfil [reclameaqui-olimpia] |
| Imprensa | Nenhuma cobertura encontrada |
| Instagram | 677 seguidores, segue 1.050, 27 posts; posts de 2026 com 1 a 12 curtidas. O link do rodapé do site leva a um perfil antigo indisponível [olimpia-instagram] |
| Facebook / LinkedIn / YouTube | 211 seguidores / 111 seguidores / 1 inscrito e 7 vídeos [olimpia-facebook] [olimpia-youtube] |
| Mídia local | Post patrocinado ou parceiro num perfil de notícias de Porto Velho com cerca de 103 mil seguidores (2024) |
| Medição | Só Google Analytics 4 e um evento de clique no WhatsApp. Sem Google Ads e sem pixel da Meta: a aquisição parece depender de SEO e indicação |
| SEO | 3.345 URLs no sitemap, todas com data de 17/06/2026: ~1.297 páginas de nota fiscal por cidade do Brasil, 50 de PDV com Pix e **50 de padaria por município de Rondônia**, 50 de oficina, 370 de "sistema para…", 61 tutoriais genéricos, páginas de "integração" com Shopee, Tray, Nuvemshop, PagSeguro e outros que não descrevem integração nenhuma [olimpia-sitemap] [olimpia-sitemap-outros] |

### 2.5 Forças

- Amplitude real: fiscal completo (NF-e, NFC-e, NFS-e no padrão nacional, CT-e,
  MDF-e, SPED), 14 "drivers" bancários com CNAB, Pix e webhooks, PDV com TEF e
  balança, food completo (comanda, garçom, cozinha, QR na mesa), delivery com
  app do entregador, Mercado Livre, OS, ponto, folha, BI.
- Preço publicado e implantação sem taxa no SaaS. Plano MEI grátis como porta
  de entrada.
- SEO local que domina buscas por sistema em Porto Velho e no interior de RO.
- Máquina de aquisição barata: SEO, prospecção automatizada por CNPJ e Google
  Maps, revenda com contadores, vaga para vendedores.
- Desenvolvimento ativo em 2026: cadastro passou de 4 para 5 etapas no próprio
  dia 03/10/2026, app iOS em julho, Mercado Livre e NFS-e como novidades. Os
  erros do site tendem a ser corrigidos; quem apostar só em "o site deles tem
  erros" vai perder o argumento.
- Consultoria (Gestão 360°) para subir ticket e fidelizar.

### 2.6 Fraquezas que dá para provar

- **Credibilidade:** "15+ anos" contra fundação em 2018; 19, 33 ou 37 módulos
  conforme a página; 37+ e 132+ relatórios na mesma landing; 4, 5 ou 6 estados;
  "suporte 24h" contra seg–sex 8h–18h; "premiada" sem prêmio; logos de eventos
  (Sebrae, Mercopar, South Summit) apresentados como empresas que confiam nela.
- **Prova social fraca:** depoimentos da home são declaradamente ilustrativos
  e só com iniciais; os "depoimentos em vídeo" não têm vídeo; no ERP, os
  depoimentos são de outros estados e a página avisa que os casos virão
  depois; clientes mudam de segmento de uma página para outra; casos sem
  nenhum número de resultado. [olimpia-cases]
- **Execução:** notas internas de redação publicadas na home, variáveis de
  template visíveis ({region}, {label}) em 18 de ~30 páginas amostradas, persona
  interna de compra exposta na página de padarias, código PHP vazado nos dados
  estruturados do ERP, mockup do RH com imagem de outra empresa, quatro
  grafias do próprio nome, CTAs finais do ERP sem link, site institucional que
  não leva ao login nem ao cadastro do ERP.
- **Legal:** sem CNPJ nos sites; URLs de "privacidade" e "termos" do sitemap
  são páginas de SEO; existe uma política genérica em
  `/politica_privacidade.php` (2025) sem menção à LGPD, encarregado, bases
  legais ou retenção, e sem link no rodapé [olimpia-privacidade]; o cadastro
  público do ERP não pede aceite de termos (o aceite aparece só depois do
  login, ver 2.2).
- **Segurança (observado no código, não testado):** a tela de login busca a
  lista de filiais pelo código da empresa antes de autenticar. Se os códigos
  forem sequenciais, nomes de filiais ficam expostos. Lição para nós: não
  mostrar dado de cliente antes do login. [olimpia-login]
- **Planos em escada:** no SaaS, quem quer cardápio e comanda paga o Premium
  (R$ 499,90) com Mercado Livre, CT-e e força de vendas juntos; ponto, OS e BI
  pelo SaaS só no Full (R$ 799). Ponto e OS podem ser comprados à parte no
  institucional ou no RH, o que alivia a escada mas confunde o cliente.
- **Suporte com equipe mínima** para a base declarada, sem central de ajuda
  real (os "tutoriais" do site são texto de SEO; o YouTube tem um tutorial).

### 2.7 Queixas de clientes

**Nenhuma queixa pública foi encontrada** (Reclame Aqui sem perfil, Google
5,0, Facebook, Indeed e Glassdoor sem relatos negativos). Os pontos de dor
abaixo são inferências a partir do que é observável, não relatos de clientes:

- confusão entre duas tabelas de preço e obrigação de subir de plano;
- clientes do PDV desktop em migração para a versão web;
- risco de demora no suporte com uma equipe tão pequena.

### 2.8 Lacunas de produto (com as correções da verificação)

| Lacuna citada no início da pesquisa | Situação real |
| --- | --- |
| "Não tem bot nem IA no WhatsApp" | **Errado.** O Atendimentos tem bot e IA (fora do ERP, por WhatsApp Web não oficial) e, por dentro, há um agente de vendas no WhatsApp como adicional. No ERP, o WhatsApp Business segue "em breve" |
| "Não tem resumo diário" | Continua válido. O "resumo do dia" do Atendimentos é um painel para atendentes; nenhum produto manda resumo ao dono |
| "IA só na consultoria" | Válido para o ERP: a própria tabela comparativa dá "não" para IA nativa; o Advisor fica na Gestão 360° (Full ou pago à parte) |
| "Ponto sem biometria" | Público: selfie + GPS. Por dentro: validação facial. Nenhum dos dois mostra nº INPI, AFD, AEJ ou comprovante |
| "Força de vendas só Android" | **Errado.** Há app iOS desde 24/07/2026 |
| "Sem iFood" | Válido: nenhuma menção em ~100 páginas e nas 3.345 URLs. Fazem integrações sob medida, então não dá para afirmar que nunca fizeram |
| "PDV sem modo offline" | O PDV web não declara modo offline (só a contingência da NFC-e). Um post de 2025 anuncia o PDV desktop funcionando offline (não confirmado) |
| "Sem política de privacidade" | Existe uma política genérica não linkada (ver 2.6) |
| "Sem integração com a Receita" | A "integração com a Receita" citada pelo dono é a consulta automática do CNPJ no cadastro (razão social, endereço, CNAE, situação) |
| Reforma tributária | Nenhuma página fala de IBS/CBS |

Afirmações do dono que **não aparecem em nenhuma página pública**: cobrança à
parte por fotos (não confirmado) e o formato de código da empresa tipo
T000108 com link `/acesso/{slug}` (não confirmado publicamente; o login mostra
o exemplo "OLIMPIA01").

### 2.9 Clientes declarados em alimentação (lista de prospecção)

Clientes que a própria Olímpia exibe, sem métricas; **o vínculo atual não foi
confirmado** e, fora do site, só a churrascaria foi encontrada: [olimpia-cases]

- Padarias: Norte Nordeste, Canaã (com o "Combo Padaria"), Imperial, Vitória,
  Bom Pão, Rover Atacarejo.
- Restaurantes: Ponto Certo Churrascaria, Paradizzi, Restaurante Capixaba,
  Restaurante Norte Nordeste.
- Mercados e conveniência: Pague Menos, Tiozinho, Nascimento, Budega
  Cearence, Nevada, Super 50.

### 2.10 O que a Olímpia ameaça

- Plano MEI grátis para quem não emite nota.
- Domínio do Google em "sistema" + município de RO, inclusive padaria.
- Prospecção em massa por WhatsApp no mesmo público que o nosso (com risco de
  LGPD e bloqueio do lado deles).
- Olimpia Bank e agente de vendas no WhatsApp, se forem lançados de fato.
- Consultoria com IA e imagem de "ecossistema de startups".

---

## 3. Sirrus (o "Sirius" citado pelo dono)

> **Confirmar com o dono.** Não existe software house "Sirius" em Rondônia. A
> Sirrus bate com a descrição (Porto Velho, vermelho e preto, sistema desktop
> antigo), mas a ligação é inferência. Nos vídeos de 2024 a 2026 a equipe usa
> camisa cinza com friso vermelho; a "farda preta e vermelha" não foi
> encontrada (não confirmado).

### 3.1 Quem é

- **Empresa atual:** Work Soft Comércio de Informática e Serviços Ltda (nome
  fantasia Sirrus Soft), CNPJ 10.692.111/0001-60, aberta em 16/03/2009,
  microempresa no Simples desde 2014, capital de R$ 72.400, um sócio, CNAE
  principal de treinamento gerencial. Av. Campos Sales, 3071, Olaria, Porto
  Velho. [sirrus-cnpj]
- **Origem:** Infosirrus (CNPJ 06.906.436/0001-20), de 11/08/2004 a
  20/11/2018 (liquidação voluntária). Daí o "desde 2004". [infosirrus-cnpj]
- **Filial formal em Florianópolis/SC** desde 03/04/2024 e operação declarada
  em Maceió (WhatsApp com DDD 82 e cliente local). A meta declarada é crescer
  no Nordeste e no Sul. [sirrus-filial] [sirrus-20anos]
- **Setor público:** o Portal da Transparência registra R$ 122.777,39
  recebidos do Governo Federal. [sirrus-transparencia]
- **Porte:** o site mostra "+5.000 clientes", mas isso é o total histórico de
  atendidos. A base atual declarada é "+2.200 empresas" (2024) e "+2 mil
  negócios" (2026). Equipe de 25 a 26 pessoas; 22 perfis no LinkedIn; 16
  estados declarados. [sirrus-home] [sirrus-indique] [sirrus-linkedin]
- **Marca:** reposicionamento com nova identidade em julho de 2024. Produtos
  antigos ainda usam cores próprias (o Delivery é verde-água).

### 3.2 Produtos

- **Sirrus Completo:** ERP instalado no Windows, com versão web para gerir
  lojas à distância, mais de 200 relatórios, vários CNPJs, backup diário em
  nuvem. [sirrus-automacao]
- **Sirrus Cook (food):** mapa de mesas, comanda com código de barras,
  cardápio por QR e tablet, garçom mobile, POS móvel com Stone, totem,
  delivery próprio com taxa por bairro, iFood, robô de atendimento, app do
  entregador, ficha técnica, painel de cozinha, TEF/Pix, fiscal.
  [sirrus-alimenticia]
- **Sirrus Delivery:** cardápio/catálogo em nuvem com pedido no WhatsApp, em
  três versões (restaurante, comércio, moda). Pelo código público: envio ao
  WhatsApp que se liga ou desliga (ou pedido direto ao sistema), status do
  pedido, cliente convidado, "CPF na nota", cupom, troco, taxa por bairro ou
  por km, pedido mínimo, agendamento (até com a loja fechada), vários links,
  pixel da Meta, pagamento online pelo Mercado Pago, pizza por sabores, três
  idiomas, opt-in para promoções por WhatsApp com política de descadastro.
  A personalização visual se limita a logo, cores e textos.
  [sirrus-cook-js] [sirrus-promo-politica]
- **Ponto:** gerenciador desktop + app com reconhecimento facial, cerca
  geográfica e modo offline; relógios REP e catracas Control iD. A página
  ainda cita AFDT/ACJEF (arquivos do regime antigo, trocados pelo AEJ) e a
  regra antiga de obrigatoriedade. [sirrus-ponto]
- **Outros:** Smart Pay (pedido e cobrança na maquininha Stone/Gertec), totem,
  filas (Queue), sistemas para odonto, clínicas, academias, hotéis,
  embarcações (bilhete, carga, MDF-e/CT-e), eventos, controle de acesso;
  revenda de hardware e de certificado digital. [sirrus-administrativo]
  [sirrus-acesso]
- **Fiscal e financeiro:** NF-e, NFC-e, NFS-e (inclusive avulsa), MDF-e,
  CT-e, manifestação, SPED, XML em nuvem para o contador; caixa cego,
  comissões, DRE; conciliação **só por importação de OFX**; boleto e Pix pela
  PagHiper com baixa automática. [sirrus-fiscais]

### 3.3 Preços

Nenhum valor público de mensalidade, licença ou implantação. O que se deduz:

| Componente | Evidência |
| --- | --- |
| Manutenção mensal | O programa de indicação isenta uma mensalidade de manutenção |
| Implantação | Promoção de jul/2024 deu R$ 1.000 de desconto na implantação do combo automação + ponto |
| Licença por módulo | Ponto Mobile com 50% de desconto para quem contrata um sistema (2026) |
| Hardware | Vendido à parte pela própria Sirrus |
| Incluído, segundo a Sirrus | Suporte, treinamento, backup diário em nuvem, integrações, customizações simples e relatórios simples personalizados [sirrus-custos] |
| Indique e Ganhe | **Até** R$ 200 por indicação fechada (Pix em 2026) + isenção de uma mensalidade para o cliente que indica [sirrus-indique] |
| Boleto e Pix (PagHiper) | Boleto pago de R$ 2,79 (até 50/mês) a R$ 1,99 (6.001 a 8.000/mês); Pix a partir de R$ 0,99; dinheiro em 2 dias [paghiper] |

A Sirrus publica um texto que ensina o cliente a desconfiar de pacotes
baratos e diz que sistemas "baratos" acabam custando 4 a 5 vezes o preço
inicial. Quem anunciar preço baixo sem dizer o que inclui perde nessa conta.

### 3.4 Pegada externa

| Canal | Situação |
| --- | --- |
| Google | Nota e número de avaliações **não confirmados** (a pesquisa citou 5,0 com 503). Indícios: 150+ avaliações com 4,9 em ago/2024; "+400 avaliações 5 estrelas" no LinkedIn em 2026. As avaliações elogiam técnicos pelo nome, rapidez e paciência [sirrus-maps] |
| YouTube | 802 inscritos, 398 vídeos, 328 mil visualizações; vídeos de 2026 com 18 a 134 visualizações [sirrus-youtube] |
| Instagram / Facebook | ~5,2 mil seguidores / ~4,7 mil e 96% de recomendação (não confirmado: exigem login) |
| TikTok / LinkedIn | 63 seguidores / 150 seguidores [sirrus-tiktok] |
| Mídia paga | Google Tag Manager, pixel da Meta e Google Ads ativos no site |
| Site | Next.js; mesmo título em todas as páginas, sitemap com 7 URLs, robots.txt com erro, três números diferentes de WhatsApp comercial em canais diferentes |

### 3.5 Forças

- 22 anos de mercado, suporte humano presencial e por AnyDesk, central de
  chamados no WhatsApp, centenas de tutoriais em vídeo.
- Oferta de food mais completa da cidade, com iFood, totem, POS e delivery.
- Hardware e certificado digital no mesmo fornecedor.
- Ponto facial e REP físico, catracas.
- Discurso que valoriza gente ("não deixar o cliente falando com robô").
- Já vende personalização e diz não cobrar à parte por ajustes simples.

### 3.6 Fraquezas que dá para provar

- **Núcleo desktop Windows:** tutorial só para corrigir o "erro 12007" (típico
  de programa Windows) tem 2.850 visualizações. [sirrus-erro12007]
- **Dependência da rede local no salão:** o garçom mobile funciona por link
  na Wi-Fi da casa. O Delivery e a gestão remota, porém, rodam em nuvem; a
  crítica "tudo depende de um PC servidor" não vale para tudo.
- **Web secundária envelhecida:** painel do Delivery em Laravel com AdminLTE,
  DataTables de 2018, Firebase de 2020, Google Analytics Universal (já
  descontinuado), meta tags de modelo sem preencher e mensagens de depuração
  de CPF em produção. [sirrus-cloud] [sirrus-cook-app]
- **Conciliação manual** (OFX) e **nenhuma IA** no produto (a única menção a IA
  é de marketing).
- **Preço opaco:** o painel de "atendimento comercial" abre sozinho em todas
  as páginas. Correção da verificação: há botão de WhatsApp direto, então o
  formulário não é obrigatório. [sirrus-layout-js]
- **Ponto com terminologia antiga** e sem menção a REP-P ou registro no INPI
  nas descrições dos apps.

### 3.7 Queixas de clientes

- App Sirrus Ponto com nota 4,2 no Google Play (13 avaliações) e 3,7 na App
  Store (3 avaliações); uma queixa de marcações presas aguardando aprovação.
  [sirrus-play-ponto] [sirrus-appstore-ponto]
- Reclame Aqui: nenhum perfil encontrado (não confirmado: a busca foi
  bloqueada).
- Cerca de 8 processos ligados à razão social, sobretudo no TJRO e no TRT14
  (não confirmado: o Jusbrasil bloqueou a leitura). [sirrus-jusbrasil]

### 3.8 Clientes citados

Restaurante Bacarat, Tênis Clube Porto Velho, Porto do Sol Mirante, Oca Wine,
Deleite e Arigó (Porto Velho); Sushi Brandão (Maceió).

---

## 4. NossoERP

- Obter Soluções Tecnológicas Ltda, CNPJ 26.182.885/0001-80, Porto Velho,
  ativa desde 16/09/2016, microempresa. [nossoerp-cnpj]
- Fiscal, estoque, financeiro, vendas e **PDV que vende sem internet** e
  sincroniza depois; IA própria chamada NIA; migração de dados e treinamento
  inclusos; implantação assistida; sem preços. [nossoerp]
- O site tem quase todas as marcas de template gerado por IA: grade de fundo,
  palavra final do título em gradiente, chips flutuantes com métricas
  fictícias, recursos numerados 01/02/03, contadores que mostram zero sem
  JavaScript e depoimentos com iniciais e empresas genéricas.

---

## 5. Agências locais e quem disputa a busca em Porto Velho

- **Clica.se:** marketing, tráfego pago, sites, design, vídeo e aluguel de
  estúdio. Site de uma página com foto real do escritório (ponto positivo),
  sem portfólio, casos ou preços, e com um selo de "mensagem não lida"
  permanente no botão do WhatsApp. [clicase]
- **Buscas por "agência" ou "criação de sites" em Porto Velho** trazem
  sobretudo páginas de SEO de agências de outros estados (Wys, Atual
  Interativa, Ribnet, KL Marketing, HELPU, GTW, Trilion), com WhatsApp de outro
  DDD e nenhum caso da cidade. [wys] [atual] [kl] [trilion]
- **Agências tradicionais** (NDA Comunicação, Pajé Branding) aparecem em
  diretórios, sem site com portfólio indexado. Uma lista de "5 melhores
  agências de Porto Velho" num blog parece gerada automaticamente (não
  confirmado).
- **Nenhuma agência de Rondônia** entre as premiadas do Prêmio Colunistas
  Norte-Nordeste 2025. [colunistas]
- **ERPs e software houses de fora com página para Porto Velho:** Xpertus
  (Cuiabá, a partir de R$ 99/mês, 14 dias de teste; a página chama o fisco de
  "SEFAZ RO", quando em Rondônia é a SEFIN) [xpertus]; Bradata (Brasília, ERP
  sob medida remoto, com reuniões presenciais quando o projeto exige; faixas de
  orçamento a partir de "até R$ 50 mil") [bradata]; a página "ERP Porto Velho"
  da GestãoClick hoje redireciona para a página nacional.
- **Food-techs nacionais com SEO local:** Saipos (páginas de delivery e
  cardápio para Porto Velho, com números de restaurantes sem fonte) e
  Consumer (página de integração com 99Food para Porto Velho). [saipos-pvh]

Conclusão: **não existe hoje uma agência local com vitrine digital forte**. O
espaço de "estúdio de melhor acabamento da cidade" está livre, mas a busca é
disputada por páginas de SEO de fora.

---

## 6. Tabela de preços públicos encontrados

Valores mensais salvo indicação. "Anual" = valor mensal equivalente no plano
anual. Fontes nos links ao fim.

### 6.1 Locais

| Empresa | Oferta | Valor |
| --- | --- | --- |
| Olímpia (institucional) | ERP Base | R$ 1.200 implantação + R$ 200/mês; módulos de R$ 50 a R$ 500 |
| Olímpia (SaaS) | MEI / Starter / Profissional / Premium / Full | Grátis / não publicado / R$ 299,90 / R$ 499,90 / R$ 799 |
| Olímpia (RH) | Ponto Bronze, até 5 colaboradores | R$ 45 (periodicidade não informada) |
| Olímpia | Gestão 360° | R$ 1.500–3.000; R$ 4.000–12.000; R$ 1.500–5.000/mês |
| Sirrus | Tudo | Não publicado; indicação até R$ 200 |
| NossoERP | Tudo | Não publicado |
| Xpertus (página para PVH) | ERP | A partir de R$ 99 |

### 6.2 Food service nacional

| Empresa | Oferta | Valor |
| --- | --- | --- |
| Saipos | Sistema | A partir de R$ 240,79 (mensal, página oficial) [saipos-precos] |
| Saipos | Cliente Fiel (cardápio, app com a marca, WhatsApp) | R$ 175 (250 pedidos), R$ 250 (500), R$ 325 (1.000), R$ 400 (ilimitado) [saipos-cliente-fiel] |
| Consumer | Grátis / Essencial / Profissional / Alta Performance | R$ 0 até 200 pedidos; R$ 59,90 / R$ 179,90 / R$ 269,90 (anual); implantação grátis; TEF adicional R$ 21 [consumer-loja] |
| Goomer | Grátis / Básico / Automatizar / Integrar | R$ 0 até 30 pedidos (+R$ 1,39 por pedido); R$ 99,90 / R$ 184,90 / R$ 299,90 (anual: R$ 59,94 / R$ 138,68 / R$ 224,92) [goomer] |
| Cardápio Web | Mesas / Delivery / Premium | R$ 169,99 / R$ 209,99 / R$ 269,99; módulos de R$ 29,99 a R$ 69,99; FAQ fala em R$ 169,99 a R$ 624,93 [cardapioweb] |
| OPDV (iFood) | Starter | A partir de R$ 189 [opdv] |
| Yooga | Clube (tudo incluído) | R$ 257 (anual R$ 205), segundo post de 2025; o site atual não mostra preço [yooga] |
| Anota AI (iFood) | Start / Gestão Avançada | R$ 219,99 a R$ 299,99 / R$ 399,99 (não confirmado; pode ter passado a cobrar por volume de pedidos desde set/2026) [anota-rei] [anota-botai] |
| Sischef | Implantação | R$ 499,90 (EAD) a R$ 1.500; mensalidade não pública [sischef] |
| GrandChef | Lite / Pro | R$ 89,90 / R$ 129,90 (não confirmado) [grandchef] |
| iFood (marketplace) | Básico / Entrega | 12% / 23% de comissão + 3,2% no pagamento online + R$ 110 / R$ 150 por mês (só acima de R$ 1.800 de faturamento no mês) [ifood-taxas] |

### 6.3 ERPs gerais nacionais

| Empresa | Oferta | Valor |
| --- | --- | --- |
| Bling | Cobalto / Titânio / Diamante / Elite | R$ 60 / R$ 120 / R$ 650 / a partir de R$ 1.250 (os R$ 96 e R$ 357,50 exibidos eram promoção só da 1ª mensalidade); implantação guiada R$ 300 por 2h [bling] |
| Olist ERP | Avance / Construa / Impulsione / Domine | R$ 66 / R$ 177 / R$ 390 / R$ 948 [olist] |
| Omie | ERP / Multivarejo | A partir de R$ 309 / R$ 419, por faixa de faturamento, usuários ilimitados [omie] |
| Conta Azul | Essencial / Controle / Avançado / Performance | Anual: R$ 179,90 / R$ 349,90 / R$ 439,90 / R$ 799,90. Trimestral: R$ 269,90 / R$ 499,90 / R$ 579,90 / R$ 929,90. Plano definido pelo faturamento [contaazul] |
| GestãoClick | Bronze / Prata / Ouro / Platina | Anual: R$ 119 / R$ 199 / R$ 289 / R$ 379. Mensal: R$ 183,08 / R$ 306,15 / R$ 444,62 / R$ 583,08 [gestaoclick] |
| MarketUP | ERP / MarketUP+ / ULTRA | Grátis / R$ 149,99 / R$ 999 [marketup] |

### 6.4 Outros que servem de âncora

| Empresa | Oferta | Valor |
| --- | --- | --- |
| Stone | Bate Ponto (facial na maquininha) | R$ 7,99 por funcionário (R$ 4,99 no combo), 3 meses grátis [stone-ponto] |
| Booksy | Agenda online | R$ 99,99 + R$ 20 por agenda [booksy] |
| Mercado (Cronoshare) | Sites | Simples R$ 400–2.000; completo R$ 2.500–10.000; landing R$ 800–2.000; manutenção R$ 150–400/mês [cronoshare] |
| Mercado (Hostinger) | Sites | Site personalizado simples R$ 1.000–10.000; projetos complexos de R$ 10 mil a R$ 100 mil ou mais [hostinger-custo] |

---

## 7. Cenários comparados (cálculo nosso)

| Cenário | Olímpia institucional | Olímpia SaaS | Nacionais | Nós (referência do dono) |
| --- | --- | --- | --- | --- |
| Restaurante com comanda, Pix e TEF | R$ 450/mês + R$ 1.200 → **R$ 6.600 no 1º ano** | Premium R$ 499,90 → **≈ R$ 6.000 no 1º ano** | Saipos a partir de R$ 240,79; Consumer Alta Performance R$ 269,90 (anual) | R$ 400/mês → **R$ 4.800 no 1º ano** (+ implantação, se cobrarmos) |
| Restaurante "completo" (base, comanda, TEF, Pix, conciliação, taxas de cartão, relatórios) | R$ 710/mês + R$ 1.200 | Premium ou Full | — | ? |
| Restaurante com comanda e ponto | R$ 390/mês (R$ 440 com Pix) + R$ 1.200 | Premium + RH ≈ R$ 544,90 (se o R$ 45 for mensal) ou Full R$ 799 | Ponto Stone: R$ 7,99 por funcionário | ? |
| Padaria (Pix, etiquetas, painel TV, loja virtual) | R$ 450/mês + R$ 1.200 | Premium | — | ? |
| MEI que vende a pessoa física e não precisa de nota | — | MEI grátis | Consumer grátis até 200 pedidos; Goomer grátis até 30 | R$ 400 fica **muito acima** |
| Lanchonete que só quer cardápio com pedido no WhatsApp | Base R$ 200 + Loja Virtual R$ 50 (+ R$ 1.200 de implantação) | Premium | Goomer R$ 59,94 a R$ 99,90; Consumer R$ 59,90; Cardápio Web R$ 169,99 | R$ 400 fica **acima de todos** |

Leitura: os ~R$ 400 competem bem com a Olímpia no restaurante com salão e na
padaria, mas não servem para o MEI nem para quem só quer cardápio. Pela lei, o
MEI não precisa emitir nota em venda a pessoa física (LC 123/2006, art. 26,
§ 6º, II) [lc123], então o plano grátis da Olímpia resolve o caso dele.

---

## 8. Onde ganhamos (e onde não)

| Argumento | Contra a Olímpia | Contra a Sirrus | Contra os nacionais | Como provar |
| --- | --- | --- | --- | --- |
| Telas enxutas do ramo do cliente | Ela já diz "pague só o que usa"; as páginas por segmento são do mesmo molde e o cadastro só oferece 7 segmentos | Mais de 40 soluções, 200+ relatórios, centenas de tutoriais | "Por ramo" costuma ser só texto de marketing | Demonstração com as telas reais de cada perfil (ver [modulos-erp.md](modulos-erp.md)) |
| Preço fechado por cenário, com o que está incluído | Publica, mas em duas tabelas que se contradizem | Não publica | Publicam, sem implantação presencial | Uma tabela só, igual na landing, no WhatsApp e na proposta |
| Resumo do dia no WhatsApp do dono, incluído | Não visto em nenhum produto | Não tem IA | A Conta Azul recebe documentos pelo WhatsApp e manda alertas; a Omie opera o ERP pelo WhatsApp. Um resumo diário de vendas, caixa e ponto não foi visto (não confirmado nos nacionais) | Print real do resumo de um cliente (com autorização) |
| API oficial do WhatsApp | O Atendimentos usa WhatsApp Web não oficial (risco de banimento) | Robô de roteiro | Parecido | Dizer qual API usamos e por quê |
| Nuvem e celular | Paridade (ERP web) | Vantagem: núcleo desktop e garçom preso à Wi-Fi | Paridade | Sistema abrindo no celular do dono, na visita |
| Pedido sem comissão (contra o iFood) | Tem cardápio e loja virtual, sem iFood | Tem cardápio e iFood | Paridade | Simulador da conta do iFood com as taxas oficiais |
| Conformidade que dá para conferir | Sem CNPJ, termos ou LGPD públicos | Ponto com termos do regime antigo | Variável | CNPJ no rodapé, política real, termos, nº INPI se fizermos REP-P |
| Acabamento visual, vídeo e motion | Três identidades visuais diferentes | Marca nova, produtos antigos | Bom acabamento | Portfólio com mídia real |
| Atendimento presencial | **Paridade** (ela também vai ao cliente) | **Paridade** (técnicos externos) | Vantagem nossa | Rostos, endereço e prazo de visita na landing |

**Onde não ganhamos (hoje):** amplitude (fiscal completo, 14 bancos, folha),
tempo de mercado e reputação no Google (Sirrus), hardware e revenda, base
instalada, preço de entrada (planos grátis), SEO local, e prova social: ainda
não temos clientes de sistema para mostrar, só os quatro sites do portfólio.

---

## Fontes

[olimpia-home]: https://olimpiasistemas.com.br/
[olimpia-erp]: https://erp.olimpiasistemas.com.br/
[olimpia-cadastro]: https://erp.olimpiasistemas.com.br/cadastro
[olimpia-login]: https://erp.olimpiasistemas.com.br/login
[olimpia-rh]: https://rh.olimpiasistemas.com.br/
[olimpia-rh-registro]: https://rh.olimpiasistemas.com.br/register
[olimpia-360]: https://erp.olimpiasistemas.com.br/gestao-360
[olimpia-numeros]: https://olimpiasistemas.com.br/olimpia-em-numeros.php
[olimpia-cases]: https://olimpiasistemas.com.br/cases.php
[olimpia-sitemap]: https://olimpiasistemas.com.br/sitemap.xml
[olimpia-sitemap-outros]: https://olimpiasistemas.com.br/sitemap-outros.xml
[olimpia-privacidade]: https://olimpiasistemas.com.br/politica_privacidade.php
[olimpia-chat]: https://chat.olimpiasistemas.com.br/
[olimpia-chat-js]: https://chat.olimpiasistemas.com.br/assets/index-iHo6jNPi.js
[olimpia-certs]: https://api.certspotter.com/v1/issuances?domain=olimpiasistemas.com.br&include_subdomains=true&expand=dns_names
[olimpia-cnpj]: https://brasilapi.com.br/api/cnpj/v1/32616546000168
[olimpia-linkedin]: https://br.linkedin.com/company/olimpia-software-servi%C3%A7os
[olimpia-rdap]: https://rdap.registro.br/domain/olimpiasistemas.com.br
[olimpia-video-equipe]: https://www.youtube.com/watch?v=I0CPptXs7AM
[olimpia-video-pdv]: https://www.youtube.com/watch?v=j5RpXN32b3M
[olimpia-ios]: https://apps.apple.com/br/app/olimpia-for%C3%A7a-de-vendas/id6596727706
[olimpia-play]: https://play.google.com/store/apps/details?id=com.olimpiasistemas.olimpia_mobile
[olimpia-bank]: https://www.instagram.com/olimpiasistemas/p/Da64nhsJ65A/
[olimpia-vaga]: https://www.instagram.com/olimpiasistemas/p/DaLZhP_xRug/
[olimpia-instagram]: https://www.instagram.com/olimpiasistemas/
[olimpia-facebook]: https://www.facebook.com/Olimpiasistemas
[olimpia-youtube]: https://www.youtube.com/@olimpiasistemas
[olimpia-maps]: https://www.google.com/maps/place/Olimpia+Sistemas+Tecnologia+e+Desenvolvimento+de+Aplicativos+e+Sistemas/@-8.7634321,-63.8778443,17z
[olimpia-100os]: https://pt.linkedin.com/posts/olimpia-software-servi%C3%A7os_olimpiasistemas-100openstartups-openinnovation-activity-7340457040634437634-W0Jc
[reclameaqui-olimpia]: https://www.reclameaqui.com.br/empresa/olimpia-sistemas/
[sefin-tate]: https://tate.sefin.ro.gov.br/storage/2024/10/20222700100190-1.pdf
[lc123]: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
[sirrus-home]: https://www.sirrus.com.br/
[sirrus-alimenticia]: https://www.sirrus.com.br/segmentos/area-alimenticia
[sirrus-ponto]: https://www.sirrus.com.br/segmentos/controle-de-ponto
[sirrus-fiscais]: https://www.sirrus.com.br/segmentos/fiscais
[sirrus-automacao]: https://www.sirrus.com.br/segmentos/automacao-comercial
[sirrus-administrativo]: https://www.sirrus.com.br/segmentos/administrativo
[sirrus-acesso]: https://www.sirrus.com.br/segmentos/acesso
[sirrus-custos]: https://www.sirrus.com.br/blog-post/como_escolher_um_sistema_completo_e_sem_surpresas_indesejadas_para_o_seu_negocio
[sirrus-indique]: https://www.sirrus.com.br/blog-post/indique_e_ganhe_sirrus
[sirrus-20anos]: https://www.sirrus.com.br/blog-post/prestes_a_completar_20_anos%2C_a_sirrus_sistemas_inicia_inovador_reposicionamento_de_mercado.
[sirrus-cnpj]: https://brasilapi.com.br/api/cnpj/v1/10692111000160
[sirrus-filial]: https://brasilapi.com.br/api/cnpj/v1/10692111000240
[infosirrus-cnpj]: https://brasilapi.com.br/api/cnpj/v1/06906436000120
[sirrus-transparencia]: https://portaldatransparencia.gov.br/licitacoes/29048246/pessoa-juridica/10692111000160
[sirrus-cook-app]: https://sirruscook.app
[sirrus-cook-js]: https://sirruscook.app/static/js/app.2c8bcc2faf6b3e3e2228.js
[sirrus-cloud]: https://cloud.sirruscook.app/login
[sirrus-promo-politica]: https://sirrus-bot-politicas-promocionais-4daf2a.gitlab.io/
[sirrus-layout-js]: https://www.sirrus.com.br/_next/static/chunks/app/layout-e7f5b82c0e2aa35e.js
[sirrus-erro12007]: https://www.youtube.com/watch?v=uUEx3mz4ZOw
[sirrus-youtube]: https://www.youtube.com/@sirrus_sistemas/about
[sirrus-tiktok]: https://www.tiktok.com/@sirrus_sistemas
[sirrus-linkedin]: https://www.linkedin.com/company/sirrus-sistemas/
[sirrus-play-ponto]: https://play.google.com/store/apps/details?id=com.sirrus.sirrusponto
[sirrus-appstore-ponto]: https://apps.apple.com/br/app/sirrus-ponto/id1622281766
[sirrus-maps]: https://www.google.com/maps/place/Sirrus+Sistemas+e+Automa%C3%A7%C3%A3o+Comercial/@-8.7581616,-63.9028702,17z
[sirrus-jusbrasil]: https://www.jusbrasil.com.br/processos/nome/196739144/work-soft-comercio-de-informatica-e-servicos-eireli-me
[paghiper]: https://www.paghiper.com/taxas-e-tarifas/
[nossoerp]: https://www.nossoerp.com.br
[nossoerp-cnpj]: https://brasilapi.com.br/api/cnpj/v1/26182885000180
[clicase]: https://clicase.com.br/
[wys]: https://agenciawys.com.br/agencia-de-marketing-em-porto-velho/
[atual]: https://www.atualint.com.br/criacao-de-sites-em-porto-velho/
[kl]: https://klmarketing.com.br/agencia-de-marketing-digital-em-porto-velho/
[trilion]: https://trilion.com.br/cidade/porto-velho
[colunistas]: https://nossomeio.com.br/premio-colunistas-norte-nordeste-revela-vencedores-da-edicao-2025/
[xpertus]: https://xpertus.com.br/sistema-erp/porto-velho-ro
[bradata]: https://www.bradata.com.br/erp-sob-medida/porto-velho
[saipos-pvh]: https://saipos.com/sistema/restaurante/ro/porto-velho
[saipos-precos]: https://saipos.com/planos-e-precos
[saipos-cliente-fiel]: https://saipos.com/cardapio-digital/cliente-fiel
[consumer-loja]: https://loja.consumer.com.br/
[goomer]: https://goomer.com.br/planos
[cardapioweb]: https://ajuda.cardapioweb.com/boas-vindas/planos-funcionalidades-e-modulos-adicionais
[opdv]: https://opdv.com.br/planos/
[yooga]: https://blog.yooga.com.br/clube-yooga/
[anota-rei]: https://reidodelivery.com.br/blog/anota-ai-vale-a-pena
[anota-botai]: https://botaihub.com.br/ferramentas/anota-ai/
[sischef]: https://sischef.com/planos/
[grandchef]: https://help.grandchef.com.br/controle-de-mesas-para-restaurante/
[ifood-taxas]: https://blog-parceiros.ifood.com.br/taxas-ifood/
[bling]: https://www.bling.com.br/planos-e-precos
[olist]: https://olist.com/planos/
[omie]: https://www.omie.com.br/precos/
[contaazul]: https://contaazul.com/planos/
[gestaoclick]: https://gestaoclick.com.br/planos/
[marketup]: https://marketup.com/
[stone-ponto]: https://conteudo.stone.com.br/bate-ponto-stone/
[booksy]: https://biz.booksy.com/pt-br/precos
[cronoshare]: https://www.cronoshare.com.br/quanto-custa/criar-site
[hostinger-custo]: https://www.hostinger.com/br/tutoriais/quanto-custa-fazer-um-site/
