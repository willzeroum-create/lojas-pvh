# Landing da agência: estrutura, mensagem e o que evitar

Data-base: **03/10/2026**. Este documento responde às decisões pendentes
anotadas em [`src/lib/config/agencia.ts`](../../src/lib/config/agencia.ts)
(nome e Instagram, publicar ou não os preços, links e imagens do portfólio) e
recomenda a estrutura da página a partir da pesquisa de concorrentes, de
padrões de conversão e do vídeo de referência.

Divisão de trabalho, como no projeto: **texto e dados** mudam em
`agencia.ts` (Claude); **aparência** muda nos componentes de
[`src/app/_landing/`](../../src/app/_landing/) e em
[`src/app/page.tsx`](../../src/app/page.tsx) (Codex), com a identidade
revista pelo designer (Cláudio).

---

## 0. Ponto de partida: a landing que já existe

Ordem atual: cabeçalho → hero → problema e virada → serviços (7) → "Monte o
seu sistema" → como funciona → planos (sem preço) → portfólio (4) → vídeo →
perguntas → contato → rodapé.

### O que já está certo (manter)

- **WhatsApp como ação principal**, com mensagem pronta. Os dados sustentam:
  77% dos brasileiros falam com marcas pelo WhatsApp, 7 em cada 10 já
  compraram por ele e o app está na tela inicial de 64,8% dos celulares.
  [opinionbox] [mobiletime]
- **"Monte o seu sistema"** manda a lista de módulos pelo WhatsApp: qualifica
  o contato sem formulário.
- **Visita presencial** como primeiro passo do processo: é a carta local
  contra os sistemas nacionais, que atendem à distância.
- **Problema → virada**, a linguagem do vídeo de referência.
- **Nada de pop-up, carrossel, contador animado ou depoimento inventado.**
- **Todo o texto num lugar só** (`AGENCIA`): impede preços diferentes em
  páginas diferentes, que é um dos maiores problemas de credibilidade da
  Olímpia.
- Movimento respeita "reduzir movimento" do sistema; vídeo com `preload="none"`
  e capa.

### O que corrigir antes de divulgar

| Problema | Onde | Por que importa | Correção |
| --- | --- | --- | --- |
| A página promete o que ainda não existe | Pergunta "Emite nota fiscal? Sim…"; serviços "Ponto eletrônico com foto", "Banco e Pix dentro do sistema", "Resumo do dia no WhatsApp" | No catálogo, `fiscal`, `ponto`, `bancos` e `ia_whatsapp` estão como `planejado` | Dizer o estado: "pronto", "liga com a sua conta" ou "sob encomenda, com prazo combinado". Ou tirar até existir |
| "Monte o seu sistema" mostra os 25 módulos do catálogo sem dizer quais existem (20 são `planejado`) | `MonteSeuSistema.tsx` | O visitante escolhe "Nota fiscal" achando que está pronto | Mostrar a `maturidade` que já está no catálogo, com três selos |
| "Se paga em menos de dois anos" | `planos.compra.texto` | R$ 15.000 ÷ R$ 400 = **37,5 meses**. Só fica abaixo de dois anos contra uma mensalidade de ~R$ 800 (≈ 19 meses) | Corrigir a conta ou dizer contra o que se compara |
| Mockups desenhados com números do vídeo | `MockupsProduto.tsx`: barra de janela com três bolinhas, "Produto 01", "Pedido #1042 · 3 itens · R$ 529,70" | É o pedido de roupas do vídeo de referência, num site que vende cardápio para alimentação; e mockup desenhado é marca de template | Prints reais do nosso cardápio e do painel, de uma loja de demonstração com dados plausíveis de Porto Velho |
| Vídeo "LojaLink" como peça da agência | Seção de vídeo | Termina convidando a "criar conta grátis, sem cartão", oferta que não temos. Se não foi produzido pela equipe, não pode ser portfólio | Confirmar autoria e direitos; legenda "peça demonstrativa para um produto fictício"; ou trocar por peça própria |

---

## 1. Estrutura recomendada

| # | Seção | O que o visitante precisa entender | CTA | Situação |
| --- | --- | --- | --- | --- |
| 1 | Cabeçalho | Quem é e como falar | WhatsApp; "Entrar" para clientes | Mudar os links para: Sistemas · Cardápio · Sites e vídeo · Preços |
| 2 | Hero | Para quem é, o que entregamos, onde estamos e em quanto tempo | **Chamar no WhatsApp** + "Ver preços" | Ajustar título e trocar o visual por prints reais |
| 3 | Problema → virada | "Você paga por um sistema que não é do seu ramo" | "Monte o seu sistema" | Manter; é o único lugar com animação de texto |
| 4 | Demonstração | O produto funciona hoje | "Abrir a loja de demonstração" | **Acrescentar** |
| 5 | O que fazemos | Quatro frentes: sistema, cardápio, sites, vídeo | WhatsApp com mensagem de cada frente | Reduzir de 7 para 4; IA, ponto e banco viram módulos do sistema, com estado |
| 6 | Monte o seu sistema | Escolher o que a empresa usa | "Mandar esta lista no WhatsApp" | Mostrar o estado de cada módulo |
| 7 | Preços | Quanto custa, o que inclui, o que é à parte | "Quero o preço do meu cenário" | Publicar por cenário (decisão do dono) |
| 8 | Como funciona | Visita → montagem → implantação → evolução, com prazos | WhatsApp ("Marcar visita") | Manter; acrescentar prazos reais e fotos |
| 9 | Portfólio | Trabalhos reais, com mídia e link | Abrir o trabalho | Preencher imagens, links e autorizações |
| 10 | Quem somos | Rostos, endereço, CNPJ, horário | — | **Acrescentar** |
| 11 | Perguntas | As objeções de quem vai assinar | — | Reescrever com as objeções reais |
| 12 | Contato e rodapé | Último convite; dados legais | WhatsApp | Acrescentar CNPJ, endereço, privacidade e termos |

### 1.1 Hero

- **Mensagem:** para quem (comércio de Porto Velho, a começar por
  alimentação), o que (sistema com as telas do seu ramo; cardápio com pedido no
  WhatsApp), como (a gente vai até você, monta e treina) e um prazo verdadeiro
  ("cardápio no ar em um dia", que é o critério de aceitação do produto).
- **Cuidado com o título atual** ("montado só com o que você usa"): a Olímpia
  já usa a ideia de pagar só o que usa. O argumento continua bom, mas precisa
  de prova ao lado (telas por ramo) e não pode ser a única promessa.
- **Visual:** o painel e o cardápio de verdade, numa loja de demonstração de
  um negócio plausível da cidade. Nada de cards flutuando com métricas
  inventadas.
- **CTA principal:** "Chamar no WhatsApp". Secundário: "Ver preços" (âncora).

### 1.2 Problema → virada (a parte "vídeo" da página)

- Etiquetas curtas que entram uma a uma, depois a virada em fundo escuro.
  A frase atual ("Não é falta de sistema. É sistema demais.") repete a
  estrutura do vídeo ("não é falta de venda…") e funciona.
- Melhor ainda com **mensagens reais** que os nossos clientes recebem ou com
  queixas reais ouvidas nas visitas (coletar; não inventar).
- Não atacar concorrente pelo nome.

### 1.3 Demonstração

- Vídeo de 10 a 20 segundos, sem som obrigatório e com legendas: cliente
  monta o pedido no celular → abre o WhatsApp com a mensagem pronta → o
  pedido aparece no painel com som.
- Link para uma **loja de demonstração navegável** (um tenant de exemplo).
  Concorrentes nacionais deixam testar sem vendedor; a Olímpia não mostra
  nenhuma tela na página de restaurante.

### 1.4 O que fazemos

Quatro frentes, cada uma com a sua mensagem de WhatsApp:

| Frente | Mensagem | Estado a mostrar |
| --- | --- | --- |
| Sistema de gestão sob medida | Telas do seu ramo; módulos ligados conforme o uso | Por módulo (ver "Monte o seu") |
| Cardápio e catálogo com pedido no WhatsApp | Um link, foto e preço; o pedido chega pronto no WhatsApp e no painel; sem comissão | Pronto |
| Sites | Rápidos no celular, WhatsApp a um toque | Pronto (portfólio) |
| Vídeo e motion para redes | Peças curtas que explicam o produto em segundos | Pronto, se o vídeo for nosso |

Resumo diário, ponto e banco entram como **módulos do sistema**, cada um com o
seu estado. Quando o resumo diário existir, mostrar um print real dele (é o
diferencial que ninguém mostrou).

### 1.5 Monte o seu sistema

- Três selos tirados do catálogo: **Pronto** (`funcional`), **Liga com a sua
  conta** (`pre_funcional`, com o texto de `ativacao`), **Sob encomenda**
  (`planejado`).
- Antes de abrir o WhatsApp, duas perguntas rápidas que entram na mensagem:
  **ramo** (lanchonete, restaurante, padaria, mercado, serviços, outro) e
  **tamanho da equipe** (só eu, 2 a 5, 6 a 20, mais de 20). A última faixa
  importa: acima de 20 pessoas o ponto é obrigatório por lei.
- Se os preços forem publicados, mostrar a faixa do cenário escolhido.

### 1.6 Como funciona

Manter as quatro etapas. Acrescentar **prazos reais** de cada uma e, quando
houver, fotos da equipe no balcão de um cliente. O comprador local valoriza
gente: a Sirrus construiu a reputação elogiando técnicos pelo nome.

### 1.7 Quem somos

Rostos da equipe, endereço, CNPJ, horário de atendimento, DDD 69. Páginas
"locais" de agências de fora se denunciam pelo DDD e pela falta de caso na
cidade; a nossa vantagem é ser daqui, e isso tem de aparecer.

### 1.8 Perguntas (objeções reais)

Responder, com a verdade de hoje:

- Tem fidelidade? Como cancelo? Como é o reajuste?
- Onde ficam os meus dados? Quem vê? Posso levar tudo se sair? (Temos
  exportação completa: dizer.)
- E se a internet cair? (Dizer o que funciona e o que não funciona.)
- Como é o suporte: horário, presencial, WhatsApp?
- Emite nota fiscal? (Hoje: "sob encomenda, por emissor parceiro"; quando
  existir: o que o cliente precisa e quanto custa.)
- Quanto tempo leva? (Cardápio em um dia; sistema em semanas, com prazo por
  módulo.)
- E a IA, que dados usa? (77% dos brasileiros se preocupam com isso.)
- O meu cardápio continua no ar se eu atrasar a mensalidade? (Sim: a página
  vira uma versão reduzida com telefone e endereço. É regra do produto.)

### 1.9 Contato e rodapé

Último convite com o WhatsApp; no rodapé, CNPJ, endereço, política de
privacidade, termos de uso e Instagram. Nenhum dos sites da Olímpia mostra
CNPJ ou política de privacidade de verdade: é diferença que se vê.

---

## 2. Como usar a linguagem do vídeo de referência

O vídeo (48 s, vertical) segue: **gancho** com uma pergunta ao público →
**caos** reconhecível → detalhe da dor → **virada** em fundo escuro ("não é
X, é Y") → **solução** em passos curtos com o produto → **prova** (o pedido
chega formatado) → objeção de pagamento resolvida → operação pelo celular →
**CTA** em fundo de cor. Visual: fundo claro e quente, laranja como cor de
ação, etiquetas pretas com fonte condensada extra-bold em caixa alta, celulares
com sombra suave, conversas de WhatsApp realistas, cortes de 1 a 2 s.

Como levar isso para a página:

1. **Um só momento de "vídeo" na página:** a sequência problema → virada e a
   demonstração. No resto, leitura calma. Hoje a fonte condensada em caixa
   alta está em todos os títulos e a animação de entrada em quase todos os
   blocos: reservar para a sequência do problema.
2. **Conversas e pedidos do nosso público,** não os do vídeo. O vídeo é de
   catálogo de roupas (cor e tamanho); o nosso primeiro público é
   alimentação. Usar mensagens e pedidos reais da loja de demonstração.
3. **Não copiar a oferta do vídeo** ("crie sua conta grátis, sem cartão"):
   não temos plano grátis.
4. **Produzir versões por segmento** (padaria, lanchonete, oficina) como
   portfólio e como serviço vendido: o vídeo é exemplo do que a agência
   entrega.
5. **Acessibilidade:** legendas (o original depende só de música e texto),
   sem som por padrão, capa, e respeito a "reduzir movimento".
6. **Tensão a resolver com o designer:** a estética do vídeo (areia, laranja,
   etiquetas pretas) é parecida com o "bom gosto padrão" que ferramentas de
   IA produzem (creme com terracota). O que tira a página do genérico é
   fotografia real (equipe, clientes, ruas de Porto Velho), telas reais do
   produto e uma escolha tipográfica com motivo de marca. A paleta atual do
   produto (papel `#faf6ee` e tangerina `#f2541b`) pode continuar, desde que
   acompanhada disso; separar a marca da agência da marca do produto é uma
   decisão do designer.

---

## 3. Portfólio

| Trabalho | O que mostrar | Falta |
| --- | --- | --- |
| One (site) | Gravação de 5 a 10 s do vídeo no topo e da troca do carro em destaque pelo próprio cliente | Autorização, link, imagem |
| Ótica com modelo 3D (loja virtual) | Gravação curta girando o modelo 3D | Autorização, link, imagem |
| São Luís (site) | A simulação de financiamento terminando no WhatsApp do vendedor (é o caso mais próximo do nosso discurso) | Autorização, link, imagem |
| Soundwaves (site) | A identidade aplicada | Autorização, link, imagem |

Regras:

- **Cada trabalho com três linhas:** o problema, o que fizemos, o resultado.
  Resultado só com número real e autorizado; sem número, sem resultado.
- **Mídia real** (gravação de tela ou print), não capa tipográfica genérica.
  Os campos `url` e `imagem` de `AGENCIA.portfolio` já existem; faltam os
  arquivos e as autorizações.
- **Ordem:** primeiro os casos que terminam em WhatsApp ou em venda (São
  Luís); o 3D como impacto visual.
- **Lacuna:** não há caso de sistema nem de cardápio. Até haver, a loja de
  demonstração cobre a prova de produto. Os primeiros clientes de cardápio
  viram casos, com autorização, foto, nome do negócio e bairro. Nunca
  inventar depoimento.

---

## 4. Preços: mensalidade e compra única

### Publicar ou não (`planos.mostrarPrecos`)

**Recomendação: publicar**, como "a partir de" e por cenário típico. Em
compras entre empresas, preço é a informação mais procurada; escondê-lo passa
a impressão de que há algo a esconder e manda o visitante ao concorrente.
Quando o preço varia, a recomendação é mostrar exemplos de pedidos típicos.
[nng-precos] A Olímpia publica (e se contradiz); a Sirrus esconde e ensina o
cliente a desconfiar de preço baixo sem lista do que está incluído. A decisão
é do dono.

### Como apresentar os dois modelos

**Mensal sob medida** (valor de referência do dono: a partir de R$ 400/mês)

- **Inclui** (lista a decidir): suporte presencial e por WhatsApp,
  treinamento, atualizações (inclusive as fiscais), backup, ajustes simples,
  resumo diário no WhatsApp, crédito de IA com limite. A Sirrus já diz incluir
  suporte, treinamento, backup e ajustes simples: se não dissermos o que
  incluímos, perdemos na comparação.
- **À parte:** custos de terceiros por volume (emissor de nota fiscal: de
  R$ 59,90 a R$ 89,90 por CNPJ mais excedentes; mensagens de WhatsApp acima
  da franquia), maquininha, certificado digital (R$ 180 a R$ 280 por ano, do
  cliente).
- **Condições:** fidelidade (ou a falta dela), reajuste, cancelamento e
  exportação dos dados.

**Compra única** (valor de referência do dono: a partir de R$ 15 mil)

- Dizer o que se compra (licença de uso? código? implantação?) e o que
  continua mensal. Hospedagem, atualizações fiscais (a reforma tributária
  muda as notas até 2027 e depois), custos de terceiros e suporte não deixam
  de existir.
- **Conta honesta:** R$ 15.000 equivalem a **37,5 meses** de R$ 400 ou a
  **≈ 19 meses** de R$ 800 (cálculo nosso). A frase atual "se paga em menos de
  dois anos" só vale no segundo caso.

### Cenários para mostrar (valores a definir pelo dono)

| Cenário | Com quem o visitante vai comparar |
| --- | --- |
| Lanchonete com cardápio e pedido no WhatsApp | Goomer (R$ 59,94 a R$ 99,90), Consumer (R$ 59,90, anual), Cardápio Web (R$ 169,99), Saipos Cliente Fiel (R$ 175 a R$ 400). **R$ 400 fica acima de todos**: este cenário precisa de preço próprio |
| Restaurante com salão (comanda, cozinha, caixa, nota) | Olímpia: R$ 450/mês + R$ 1.200 no site, ou R$ 499,90 no SaaS; Saipos a partir de R$ 240,79 |
| Padaria (PDV com balança, produção, nota) | Olímpia: R$ 450/mês + R$ 1.200 |

Fontes e detalhes em [concorrentes.md](concorrentes.md#7-cenários-comparados-cálculo-nosso).

### Simulador "quanto fica com você" (para o cardápio)

Pedido médio × pedidos no mês × comissão do iFood (12% no plano Básico ou
23% no Entrega, mais 3,2% no pagamento online e R$ 110 ou R$ 150 de
mensalidade acima de R$ 1.800 no mês), comparado com o nosso preço. Num
pedido de R$ 50 no plano Básico, o restaurante recebe R$ 42,40. Mostrar a
fonte e a data das taxas. [ifood-taxas]

### Garantia

Quase nenhum ERP ou sistema de food oferece garantia de devolução; seria um
diferencial real. Mas o direito de arrependimento de 7 dias do Código de
Defesa do Consumidor (art. 49) **não vale com segurança** quando uma empresa
compra um sistema para usar no negócio: o STJ só aplica o CDC se ela provar
vulnerabilidade. Se oferecermos garantia, ela tem de estar no contrato.
[cdc] [stj-finalismo]

### Como receber

Pix Automático para a mensalidade (o BCB exige CNPJ ativo; alguns PSPs podem
exigir CNPJ com mais de seis meses, **não confirmado**) ou boleto. Ver
[integracoes.md](integracoes.md#3-bancos-pix-boletos-e-conciliação).

---

## 5. Argumentos contra o "template pronto"

Sem citar concorrente, e sempre com a prova ao lado:

| Argumento | Prova |
| --- | --- |
| As telas do seu ramo, não as de todo mundo | Demonstração de um perfil por segmento ([modulos-erp.md](modulos-erp.md#perfis-por-segmento)) |
| A sua marca inteira, não só logo e cor | Cardápio com as fotos dos seus produtos tratadas na implantação e a cor da sua marca (o template do concorrente troca só logo, cores e textos) |
| Preço publicado por cenário, igual em todo lugar | A seção de preços |
| Sua página não sai do ar se atrasar a mensalidade | Regra do produto: vira uma versão reduzida com telefone e endereço |
| Seus dados são seus | Exportação completa a qualquer momento |
| Pedido sem comissão | Simulador com as taxas oficiais do iFood |
| Função nova com prazo combinado | Só prometer o que a equipe consegue entregar |
| Gente no balcão | Visita, treinamento e primeira semana acompanhada, com rostos na página |
| Conformidade que dá para conferir | CNPJ no rodapé, política de privacidade, termos, API oficial do WhatsApp |

Evitar como gancho principal: "pague só pelo que usa" (a Olímpia já diz),
"o mais completo" (a Sirrus vence) e "IA que substitui atendente" (o
comprador local valoriza gente).

---

## 6. O que evitar para não parecer feito por IA

Lista montada a partir de guias de design de 2026 (inclusive um catálogo de
67 sinais de páginas geradas por IA) e do que se viu nos sites concorrentes.
[ai-slop] [avoid-ai-design]

| Sinal | Na landing atual? | O que fazer |
| --- | --- | --- |
| Numeração decorativa (01/02/03, "05 / Portfólio", "01 — 07") | **Sim** | Tirar; números só onde há sequência de verdade (as etapas do processo) |
| Mockup com três bolinhas de janela | **Sim** | Print real, sem moldura falsa |
| Produtos e números fictícios no herói ("Produto 01", pedido do vídeo) | **Sim** | Loja de demonstração com dados plausíveis |
| Seta "↗" em todo link e cartão | **Sim** | Só em link que abre outro site |
| A mesma animação de entrada em cada bloco | **Sim** | Só na sequência problema → virada |
| Fonte condensada em caixa alta em todos os títulos | **Sim** | Reservar para a sequência do problema e etiquetas |
| Paleta creme + laranja sem fotografia real | **Em parte** | Fotografia real e elementos locais; decisão do designer |
| Prometer módulo que não existe | **Sim** | Estado de cada módulo (seção 0) |
| Ponto "com foto" sem falar de privacidade | **Sim** | Explicar base legal, onde a imagem fica, por quanto tempo e a alternativa sem biometria; ou esperar o módulo existir |
| Página "local" sem nada local | **Em parte** (diz Porto Velho, sem endereço, CNPJ ou rostos) | Seção "Quem somos" |
| Título vago de "transformar o seu negócio" | Não | Manter específico |
| Contadores animados que mostram zero sem JavaScript | Não | Se houver números, escritos direto no HTML e com fonte |
| Depoimentos com iniciais e empresas genéricas | Não | Só depoimento real, com foto, nome, negócio e bairro |
| Logos de eventos ou instituições como se fossem clientes | Não | Só clientes reais, com autorização |
| Emoji no botão; trecho de código decorativo | Não | Manter assim |
| Carrossel no hero; formulário que abre sozinho | Não | Manter assim (carrossel deixa cada mensagem visível pouco tempo) [nng-carrossel] |
| Selo falso de "mensagem não lida" no WhatsApp | Não | Manter assim |
| Percentual de ganho sem fonte | Não | Número só com fonte ou de cliente nomeado |
| Preços diferentes em páginas diferentes | Não | Manter o conteúdo num lugar só |
| IA vendida como substituta de pessoas | Não | Manter a IA como assistente do dono |

---

## 7. SEO local, Google e medição

- **Perfil da Empresa no Google:** o ranking local pesa relevância, distância
  e destaque, e o destaque considera quantidade e nota das avaliações. Pedir
  avaliação aos clientes é permitido; **oferecer qualquer recompensa em troca
  é proibido**, então o programa de indicação não pode ser ligado a avaliar.
  [google-local] [google-avaliacoes]
- **Páginas locais com conteúdo real**, uma por serviço e por segmento ("Cardápio
  digital em Porto Velho", "Sistema para padaria em Porto Velho"), cada uma
  com prova local. Usar os nomes daqui: **SEFIN-RO** (não "SEFAZ RO", erro das
  páginas de fora), bairros, DDD 69. Não fabricar páginas em massa: as 3.345
  páginas da Olímpia, várias com variáveis de template à mostra, são risco de
  penalização, não exemplo.
- **Medição sem pixel:** uma mensagem de WhatsApp diferente por seção já
  mostra de onde veio o contato. Se entrar Google Analytics ou pixel da Meta,
  é preciso **banner de cookies com botão "rejeitar" no primeiro nível**, sem
  opções pré-marcadas (guia da ANPD). [anpd-cookies]
- **Desempenho:** metas do Google para os Core Web Vitals no percentil 75,
  medidas no celular e no computador: LCP até 2,5 s, INP até 200 ms, CLS até
  0,1. O vídeo atual tem 5,4 MB: manter `preload="none"` e considerar uma
  versão mais leve para o celular. [web-vitals]
- **Texto:** curto e simples. Num estudo com landings de software, texto em
  nível de leitura do 5º ao 7º ano converteu 12,9% contra 2,1% do texto
  rebuscado; a faixa recomendada é de 250 a 725 palavras, e 79% das visitas
  vieram do celular. Dados de páginas majoritariamente em inglês: usar como
  direção, não como meta. [unbounce]

---

## 8. Decisões pendentes da landing

| Decisão | Campo | Recomendação |
| --- | --- | --- |
| Nome da agência e Instagram | `MARCA.nome` (hoje "PVH", provisório) e `AGENCIA.instagram` | Definir com o designer antes de publicar |
| Publicar preços | `AGENCIA.planos.mostrarPrecos` | Sim, "a partir de" + cenários + o que inclui |
| Texto da compra única | `AGENCIA.planos.compra.texto` | Corrigir a conta dos dois anos |
| Portfólio | `AGENCIA.portfolio[].url` e `.imagem` | Autorização de cada cliente, gravações e links |
| Vídeo de referência | `AGENCIA.video` | Confirmar autoria e direitos ou trocar |
| Estado dos módulos e respostas da FAQ | `AGENCIA.servicos`, `AGENCIA.perguntas` e `MonteSeuSistema.tsx` | Mostrar o que está pronto e o que é sob encomenda |
| Identidade visual | `globals.css` (tokens) e `_landing/*.module.css` | Revisão do Cláudio; separar ou não a marca da agência da do produto |

---

## Fontes

[opinionbox]: https://materiais.opinionbox.com/pesquisa-whatsapp-no-brasil
[mobiletime]: https://www.mobiletime.com.br/noticias/09/06/2026/whatsapp-super-panorama/
[nng-precos]: https://www.nngroup.com/articles/show-prices-for-common-scenarios/
[nng-carrossel]: https://www.nngroup.com/articles/auto-forwarding/
[ifood-taxas]: https://blog-parceiros.ifood.com.br/taxas-ifood/
[cdc]: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
[stj-finalismo]: https://www.dizerodireito.com.br/2023/12/em-regra-o-cdc-nao-e-aplicado-para-os.html
[ai-slop]: https://www.925studios.co/blog/ai-slop-web-design-guide
[avoid-ai-design]: https://github.com/funboy322/avoid-ai-design
[google-local]: https://support.google.com/business/answer/7091?hl=pt-BR
[google-avaliacoes]: https://support.google.com/contributionpolicy/answer/7400114?hl=pt-br
[anpd-cookies]: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf
[web-vitals]: https://web.dev/articles/vitals
[unbounce]: https://unbounce.com/conversion-benchmark-report/saas-conversion-rate/

Outras referências: [NN/g, fotos reais e confiança](https://www.nngroup.com/articles/photos-as-web-content/);
[tendências de 2026 (Figma)](https://www.figma.com/resource-library/web-design-trends/);
[retrospectiva de 2026 (Graphic Design Junction)](https://graphicdesignjunction.com/2026/08/did-the-2026-web-design-trends-predictions-come-true/);
[movimento reduzido (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).
