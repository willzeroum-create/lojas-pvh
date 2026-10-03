# Pesquisa de mercado: software house de Porto Velho

Data-base: **03/10/2026**. Consolidação de seis frentes de pesquisa (site da
Olímpia, pegada externa da Olímpia, Sirrus, mercado de ERPs e sistemas para
pequenas empresas, integrações, referências de landing). Cada frente teve uma
pesquisa e uma verificação cética; aqui vale sempre a correção do
verificador. O que é relevante e não pôde ser conferido está marcado
**(não confirmado)**. Contas feitas por nós estão marcadas como
"cálculo nosso".

## Índice

| Arquivo | O que tem |
| --- | --- |
| [concorrentes.md](concorrentes.md) | Olímpia (site e pegada externa), Sirrus, NossoERP, agências locais e nacionais que disputam Porto Velho; tabela de preços públicos; forças, fraquezas e queixas; cenários de custo; onde ganhamos e onde não |
| [modulos-erp.md](modulos-erp.md) | 43 módulos de ERP com o mínimo e o diferencial de cada um, colunas "Olímpia tem?" e "Nosso projeto", `id` no catálogo, perfis por segmento, prioridades e referências de preço por módulo |
| [integracoes.md](integracoes.md) | Nota fiscal, consulta de CNPJ, bancos e Pix, WhatsApp, ponto, maquininhas, periféricos, iFood e Open Delivery, IA: fornecedores e custos, o que o cliente entrega, lei, riscos e desenho do adaptador |
| [landing.md](landing.md) | Estrutura da landing seção a seção, como usar a linguagem do vídeo de referência, portfólio, preços, argumentos contra o "template pronto" e o que evitar para não parecer feito por IA |
| [erp-olimpia/](erp-olimpia/) | Exploração **por dentro** do ERP da Olímpia (conta de teste, só leitura), em curso. Muitas telas foram bloqueadas pela trava de permissões do Claude Code; o mapa de cobertura está no fim de [modulos-erp.md](modulos-erp.md#mapa-da-exploração-por-dentro) |

---

## Resumo executivo: o que mais muda o produto e o preço

1. **"Pague só o que usa" não diferencia.** A Olímpia já usa esse argumento,
   publica 18 módulos avulsos de R$ 50 a R$ 500 e a Sirrus também liga módulos
   por cliente. O que ninguém prova é **tela enxuta por ramo**: precisamos de
   perfis por segmento que se possam demonstrar, não de discurso.
   ([modulos-erp](modulos-erp.md#perfis-por-segmento))

2. **R$ 400/mês compete no restaurante e na padaria, não no micro.** Um
   restaurante com comanda, Pix e TEF paga na Olímpia R$ 450/mês + R$ 1.200 de
   implantação (≈ R$ 6.600 no 1º ano) ou R$ 499,90 no SaaS (≈ R$ 6.000); com
   R$ 400, seriam R$ 4.800 (cálculo nosso). Mas quem só quer cardápio paga de
   R$ 59,94 a R$ 269,99 nos nacionais, e o MEI usa a Olímpia de graça (sem
   nota; o MEI não precisa emitir nota para pessoa física). O cliente do brief
   (1 a 3 funcionários) precisa de **uma oferta de entrada só de cardápio**; o
   ERP de R$ 400 é para quem tem equipe e emite NFC-e.
   ([concorrentes](concorrentes.md#7-cenários-comparados-cálculo-nosso))

3. **Custos de terceiros têm de entrar no preço, inclusive na compra única.**
   Emissor fiscal: R$ 59,90 a R$ 89,90 por CNPJ/mês (3.000 cupons ≈ R$ 184,90).
   WhatsApp: ~R$ 1 por cliente/mês no resumo diário; R$ 140 a R$ 175/mês num
   bot com 1.000 pedidos. A reforma tributária muda as notas até 2027. Uma
   compra única "sem mensalidade" não fecha essa conta, e a frase atual "se
   paga em menos de dois anos" é falsa contra R$ 400: R$ 15 mil são 37,5
   meses (só vale contra ~R$ 800/mês).
   ([integracoes](integracoes.md#mapa), [landing](landing.md#4-preços-mensalidade-e-compra-única))

4. **IA no WhatsApp não é exclusiva; o resumo diário ao dono ainda é.** A
   Olímpia tem bot com IA no "Atendimentos" (por WhatsApp Web, não oficial) e,
   por dentro, um agente de vendas no WhatsApp como adicional; Bling, Conta
   Azul e Omie já têm IA. Ninguém mostrou um resumo diário de vendas, caixa e
   ponto mandado ao dono e incluído no preço. Ele custa ~R$ 1 por cliente/mês,
   pode sair **do número da agência** (sem conectar o número de cada
   comerciante) e **não precisa de IA** na primeira versão.
   ([integracoes](integracoes.md#4-whatsapp))

5. **Ponto com webcam ou biometria é commodity e tem custo de conformidade.**
   Sirrus (app facial), Stone (R$ 7,99 por funcionário, facial na
   maquininha) e Olímpia (selfie + GPS; por dentro, validação facial) já têm.
   O ponto só é obrigatório acima de 20 trabalhadores por estabelecimento.
   Para valer como registro oficial (REP-P): registro do programa no INPI
   (R$ 210), arquivos AFD e AEJ assinados, comprovante assinado e atestado
   técnico. Biometria é dado sensível na LGPD. O diferencial verificável seria
   o nº do INPI, que nenhum concorrente mostra.
   ([integracoes](integracoes.md#5-ponto-eletrônico))

6. **Integração bancária por webhook é paridade, e na nossa hospedagem exige
   cuidado.** A Olímpia tem 14 "drivers" bancários e anunciou um banco
   próprio. A Vercel não valida certificado de cliente (mTLS) na entrada:
   Banco do Brasil e Bradesco pedem proxy. Começar por Efí, Asaas, Inter ou
   Cora. Open Finance custa a partir de R$ 2.500/mês: fora por enquanto. O Pix
   Automático serve para cobrar a nossa mensalidade, se o nosso CNPJ tiver
   pelo menos seis meses. ([integracoes](integracoes.md#3-bancos-pix-boletos-e-conciliação))

7. **Fiscal: comprar, não construir, e o calendário aperta.** Empresas do
   Simples só emitem NFS-e pelo Emissor Nacional a partir de **01/11/2026**;
   IBS/CBS entram nas notas do Simples em **01/01/2027**; QR Code v3 é
   obrigatório na NFC-e de contingência. Começar com a Focus NFe. "Nota pronta
   para a reforma" é argumento que nem Olímpia nem Sirrus usam. O SPED Fiscal
   (R$ 500/mês na Olímpia) não interessa ao Simples em Rondônia.
   ([integracoes](integracoes.md#1-nota-fiscal-nfc-e-nf-e-e-nfs-e))

8. **Há um defeito hoje no nosso cadastro: o CNPJ alfanumérico.** Desde
   31/07/2026 a Receita dá CNPJs com letras. O banco (`^[0-9]{14}$`) e a
   validação (só dígitos) recusam, e o nosso público são negócios que estão se
   formalizando agora. Corrigir com migração nova.
   ([integracoes](integracoes.md#2-consulta-cadastral-cnpj-cep-ie-e-simples))

9. **O cardápio é o nosso produto pronto, e já tem lacunas frente à Sirrus.**
   O Sirrus Delivery tem taxa por bairro ou km, cupom, agendamento, status do
   pedido, pagamento online e aceite para promoções. Nós temos o núcleo,
   importação de cardápio por foto, painel com som e uma página que não cai
   se o cliente atrasar. Próximos itens: taxa por bairro, status para o
   cliente, cupom e agendamento. O argumento de venda é o canal sem comissão:
   o iFood cobra 12% ou 23%, mais 3,2% e mensalidade. ([modulos-erp](modulos-erp.md#8-canais-de-venda))

10. **Para vender ERP a restaurante e padaria faltam caixa, PDV, fiscal,
    comandas e cozinha.** Dos 43 módulos da taxonomia, a Olímpia mostra 39 em
    público; nós cobrimos o mínimo de 2 e parte de 15. Até lá, vender cardápio,
    sites e vídeo, e "sistema sob encomenda" com prazo combinado.
    ([modulos-erp](modulos-erp.md#resumo-em-números))

11. **A Olímpia é frágil em credibilidade, não em produto.** Microempresa
    com 2 a 10 pessoas (ela mesma fala em cerca de 450 clientes atendidos por
    4 pessoas), "15+ anos" contra fundação em 2018, "premiada" sem prêmio,
    depoimentos ilustrativos, sem CNPJ nem LGPD nas páginas públicas. Mas
    desenvolve rápido e tem aquisição barata: 3.345 páginas de SEO (50 só de
    padaria, uma por município de RO) e prospecção automatizada por CNPJ e
    Google Maps. Ganha-se dela com prova (demonstração, casos nomeados,
    transparência), não com "o site deles tem erros". ([concorrentes](concorrentes.md#2-olímpia))

12. **A Sirrus vende gente: é a adversária em reputação.** 22 anos, ~2 mil
    clientes ativos, ~25 pessoas, filial em SC, food completo com iFood,
    suporte presencial e muitas avaliações no Google (número exato não
    confirmado). Fraca em nuvem (núcleo desktop), IA (nenhuma), preço (opaco)
    e conciliação (só OFX). Ela já diz incluir suporte, treinamento, backup e
    ajustes simples: a nossa oferta tem de listar o que inclui.
    ([concorrentes](concorrentes.md#3-sirrus-o-sirius-citado-pelo-dono))

13. **Atendimento presencial só diferencia contra os nacionais.** Olímpia e
    Sirrus também vão ao cliente. Contra elas, os trunfos são produto na
    nuvem e no celular, telas por ramo, preço por cenário publicado, resumo
    diário, API oficial do WhatsApp e conformidade visível. Contra os
    nacionais (o iFood comprou Saipos, Anota AI e OPDV; a TOTVS comprou a
    Linx), a carta é ser local e independente.

14. **A landing acerta o canal e o formato, mas promete o que não existe.** A
    FAQ diz que emitimos nota (módulo planejado), "Monte o seu" mostra 20
    módulos planejados sem aviso, os mockups usam bolinhas de janela e o
    pedido do vídeo de roupas (#1042, R$ 529,70), e há numeração 01/02 em
    tudo. Corrigir antes de divulgar; publicar preço por cenário; usar prints
    reais de uma loja de demonstração; confirmar os direitos do vídeo de
    referência. ([landing](landing.md#0-ponto-de-partida-a-landing-que-já-existe))

15. **Não existe agência local com vitrine forte.** As buscas por agência em
    Porto Velho trazem páginas de SEO de agências de outros estados, e
    nenhuma agência de RO foi premiada no Colunistas Norte-Nordeste 2025. Há
    espaço para sermos a referência de acabamento da cidade, com Perfil da
    Empresa no Google, páginas locais com conteúdo real e avaliações pedidas
    sem incentivo. ([landing](landing.md#7-seo-local-google-e-medição))

---

## O que muda no produto

Ordem sugerida (detalhe em [modulos-erp.md](modulos-erp.md#prioridades-sugeridas-para-decisão)):

1. **Já:** aceitar CNPJ alfanumérico; mostrar o estado de cada módulo na
   landing e no "Monte o seu"; no cardápio, taxa por bairro, status do pedido
   para o cliente, cupom e agendamento; resumo diário no WhatsApp pelo número
   da agência, sem IA; autopreencher o cadastro de tenant pelo CNPJ.
2. **Paridade para restaurante e padaria:** caixa, PDV simples, NFC-e por
   parceiro (Focus NFe), comandas e cozinha.
3. **Depois:** estoque e ficha técnica com CMV (as tabelas já existem),
   bancos e Pix (Efí, Asaas, Inter, Cora), financeiro.
4. **Fase 3 do brief:** iFood e Open Delivery (confirmar antes se 99Food e
   Keeta operam em Porto Velho).
5. **Sob decisão:** ponto (controle interno ou REP-P), outros segmentos (OS,
   agenda), loja virtual com estoque por variação.

Toda integração segue o mesmo padrão: credenciais no Vault, estado de
ativação visível no console, chave de idempotência, caixa de webhooks e
consulta de segurança ([integracoes.md](integracoes.md#0-padrões-comuns-a-todas-as-integrações)).

## O que muda no preço

- **Três ofertas, três preços:** entrada (cardápio com pedido no WhatsApp,
  na faixa dos nacionais: R$ 59,94 a R$ 269,99 no levantamento), sistema
  mensal sob medida (a partir dos R$ 400 do dono) e compra única com
  manutenção definida. Sites e vídeo por projeto (mercado: landing de R$ 800 a
  R$ 2.000; site completo de R$ 2.500 a R$ 10.000; manutenção de R$ 150 a
  R$ 400/mês).
- **Dizer o que inclui e o que é à parte**, com franquia para custos de
  terceiros (notas, mensagens, IA).
- **Implantação:** a Olímpia cobra R$ 1.200 no site e R$ 0 no SaaS; Sischef,
  de R$ 499,90 a R$ 1.500; Bling, R$ 300 por 2 horas; a maioria dos nacionais
  não cobra. Decidir se cobramos, quanto e se as fotos entram.
- **Ponto por funcionário**, com a Stone (R$ 7,99) como âncora, e não um valor
  fixo como os R$ 90 da Olímpia.
- **Publicar "a partir de" e cenários**, iguais em todo lugar.
- **Garantia só por contrato:** o arrependimento de 7 dias do CDC não vale com
  segurança para empresa que compra sistema para o negócio.

## Decisões para o dono

1. Confirmar que o "Sirius" citado é a **Sirrus Sistemas** (Work Soft).
2. **Público de partida:** micro (cardápio, preço de entrada) ou PME com
   equipe que emite NFC-e (ERP de R$ 400). Ou os dois, com ofertas separadas.
3. **Publicar preços** na landing, em que formato e com que cenários.
4. **O que entra nos R$ 400:** suporte presencial, implantação, fotos,
   emissor fiscal, mensagens, crédito de IA; e o que é cobrado à parte.
5. **Taxa de implantação:** cobrar ou não, e quanto.
6. **Compra única de R$ 15 mil:** o que se compra, qual manutenção é
   obrigatória e a correção da frase "se paga em menos de dois anos".
7. **Ponto:** controle interno para até 20 pessoas ou REP-P oficial (INPI,
   certificado ICP-Brasil, atestado técnico, AFD/AEJ, RIPD). Com ou sem
   biometria, e com que base legal.
8. **Fornecedores:** Focus NFe (ou NFE.io) para notas; PSP de referência
   para Pix (Efí, Asaas, Inter, Cora); aceitar ou não BB e Bradesco (exigem
   proxy por causa da Vercel).
9. **Resumo diário:** criar a conta oficial da agência na plataforma do
   WhatsApp Business e assumir ~R$ 1 por cliente/mês.
10. **Garantia** contratual (por exemplo, devolver a implantação em N dias):
    sim ou não.
11. **Vídeo de referência (LojaLink):** confirmar autoria e direitos ou
    trocar por peça própria antes de usar como portfólio.
12. **Marca:** nome da agência e Instagram (hoje "PVH", provisório);
    identidade com o Cláudio; autorização dos quatro clientes do portfólio.
13. **iFood:** antecipar o cadastro no portal do desenvolvedor (exige CNPJ da
    agência com CNAE de tecnologia) ou manter na Fase 3, que o brief só abre
    com cinco clientes pagando.
14. **Exploração por dentro do ERP da Olímpia:** liberar a navegação que a
    trava de permissões bloqueou ou fazer as telas restantes à mão, sem gravar
    dados e sem copiar textos ou telas.

## Limites desta pesquisa

- **Data-base 03/10/2026.** Várias tabelas eram promoções (Bling) ou mudaram
  no próprio dia (cadastro da Olímpia passou de 4 para 5 etapas).
- **Não confirmado e relevante:** número de avaliações da Sirrus no Google;
  preços da Anota AI e do GrandChef; tarifas de Pix do Inter e do PagBank;
  preço do QZ Tray e do plano pago da ReceitaWS; operação de 99Food, Keeta e
  aiqfome em Porto Velho; cobrança à parte por fotos e o formato de código
  "T000108" na Olímpia; a "farda preta e vermelha" da Sirrus; detalhes do MED
  2.0 (camadas, valor mínimo, prazo).
- **Não pesquisado:** custo de modelos de IA por cliente; Sebraetec;
  tributação da própria agência (Simples, Fator R, ISS de Porto Velho);
  preço de vídeo e motion em Porto Velho; Getnet; regulamento da ANPD sobre
  biometria (previsto, não publicado); cronograma do split payment da
  reforma.
- **Método:** nenhum formulário foi enviado e nenhum concorrente foi
  contatado. A exploração por dentro usou uma conta de teste, só em leitura,
  e está incompleta.
- **Dados pessoais:** nomes de sócios e funcionários dos concorrentes foram
  omitidos de propósito; aparecem só razão social, CNPJ e endereço comercial.
