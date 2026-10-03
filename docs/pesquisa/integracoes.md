# Integrações pré-funcionais

Data-base: **03/10/2026**. Tarifas e regras mudam; reconfira a fonte antes de
contratar ou de pôr um valor numa proposta.

**Pré-funcional** é a maturidade do catálogo de módulos
([`src/lib/modulos/catalogo.ts`](../../src/lib/modulos/catalogo.ts)) para o
que já tem código pronto e só espera a credencial do cliente (campo
`ativacao`). Este documento diz, para cada integração: quem fornece e quanto
custa, o que o cliente tem de entregar, o que a lei exige, os riscos e como
desenhar o adaptador para que ligar um cliente novo seja só preencher
credenciais e passar pela homologação.

Marcações: **(não confirmado)** = relevante mas sem fonte oficial conferida;
"cálculo nosso" = conta feita por nós a partir de preços públicos.

---

## Mapa

| Integração | Módulo (`id`) | Começar com | Custo de referência | O cliente fornece | Quando |
| --- | --- | --- | --- | --- | --- |
| [Nota fiscal](#1-nota-fiscal-nfc-e-nf-e-e-nfs-e) | `fiscal` | Focus NFe; NFE.io como segunda opção | R$ 59,90 a R$ 89,90 por CNPJ/mês + excedentes | Certificado A1, IE, CSC, regime, cadastro fiscal dos produtos | Para vender a restaurante e padaria |
| [Consulta cadastral](#2-consulta-cadastral-cnpj-cep-ie-e-simples) | `clientes` e console | BrasilAPI + ViaCEP; CNPJá comercial quando precisar de IE | Grátis; com IE, 50 consultas/mês grátis e depois a partir de R$ 24,99/mês | Nada | Já (e corrigir o CNPJ alfanumérico) |
| [Bancos e Pix](#3-bancos-pix-boletos-e-conciliação) | `bancos`, `cobranca` | Efí, Asaas, Inter ou Cora Pro | Pix de 0% a 1,19% (ou R$ 1,99 fixo no Asaas); boleto de R$ 1,90 a R$ 3,45 | Conta PJ no PSP, credenciais e certificado da API | Depois do caixa |
| [WhatsApp](#4-whatsapp) | `ia_whatsapp` | Cloud API oficial, número da agência | ~R$ 1 por cliente/mês no resumo diário | Número do dono e aceite | Já (resumo sem IA) |
| [Ponto](#5-ponto-eletrônico) | `ponto` | Facial no navegador; REP-P só se decidido | INPI R$ 210 (uma vez) + certificado ICP-Brasil | Colaboradores, jornadas, aviso de privacidade | Sob decisão |
| [Maquininhas e TEF](#6-maquininhas-e-tef) | `pdv` | Mercado Pago Point e Stone Connect (nuvem) | Taxas da adquirente | Conta e terminal compatível, token | Com o PDV |
| [Periféricos](#7-periféricos-impressora-gaveta-balança-e-leitor) | `pdv` | Impressão pelo navegador → Web Serial → agente local | QZ Tray ou agente próprio | Modelos dos equipamentos, Chrome ou Edge | Com o PDV |
| [iFood e Open Delivery](#8-ifood-99food-e-keeta) | `marketplaces` | iFood Merchant API + adaptador Open Delivery | APIs gratuitas | Autorização da loja em cada canal | Fase 3 do brief |
| [IA](#9-ia-e-crédito-de-ia) | `ia_whatsapp`, `relatorios` | Modelo com limite mensal por cliente | Não levantado | Nada | Depois do resumo sem IA |

---

## 0. Padrões comuns a todas as integrações

O projeto já tem as peças de base: o catálogo com `pre_funcional` e
`ativacao`, a interface de adaptador de canal em
[`src/lib/canais/tipos.ts`](../../src/lib/canais/tipos.ts) e o campo `canal`
em todo pedido. O que falta é o mesmo para cada domínio.

### 0.1 Onde ficam as credenciais

- **Nunca** em `tenant_modulos.configuracao`: os membros do tenant leem essa
  coluna (ver o comentário da migração 0008).
- Segredos (certificado .pfx e senha, client secret, tokens) no **Supabase
  Vault** (criptografia autenticada, chave fora do banco), lidos só no
  servidor. [supabase-vault]
- Uma tabela de estado que o console e o painel podem ler sem ver segredo.

### 0.2 Estados de ativação

```
aguardando_credenciais → em_homologacao → em_producao
                                   ↘ com_erro (último erro visível no console)
em_producao → suspensa (cliente desligou ou atrasou)
```

O console mostra o estado na ficha do tenant, ao lado dos módulos, com o que
falta o cliente entregar (o texto de `ativacao`). Um módulo pré-funcional
pode ser ligado antes da credencial: ele aparece no painel com o aviso
"falta ligar à sua conta X".

### 0.3 Modelo de dados proposto

Migração nova (as migrações só se acrescentam; depois `pnpm sql:completo` e
atualizar `src/lib/supabase/tipos.ts`):

```
integracoes          tenant_id, dominio, provedor, ambiente ('homologacao'|'producao'),
                     estado, ultimo_erro, verificado_em, atualizado_em
integracoes_segredos tenant_id, dominio, nome, vault_secret_id   -- só service_role
webhooks_recebidos   id, provedor, evento_id (único por provedor), tenant_id,
                     payload jsonb, assinatura_ok, recebido_em, processado_em, erro
```

RLS: operadores leem e alteram tudo; membros leem só `integracoes` do
próprio tenant; `integracoes_segredos` sem acesso para `authenticated`.

### 0.4 Uma interface por domínio, provedores plugáveis

```
src/lib/integracoes/
  fiscal/       tipos.ts · focus.ts · nfeio.ts · sefin-nacional.ts
  pix/          tipos.ts · efi.ts · asaas.ts · inter.ts
  mensagens/    tipos.ts · whatsapp-cloud.ts
  delivery/     (ou continuar em lib/canais: ifood.ts · open-delivery.ts)
  ...
```

A regra é a mesma de `lib/canais`: o resto do sistema só conhece a interface
do domínio; trocar de fornecedor é escrever outro arquivo. Regras puras
(cálculo de taxa, montagem do texto do resumo, validação de CNPJ) ficam em
`lib/dominio`, com testes.

### 0.5 Saída: idempotência e fila

- Toda operação que cria algo do outro lado leva uma **chave de idempotência**
  nossa (id do pedido, id do documento, `txid` do Pix). Se a chamada expirar,
  consulta-se pela chave em vez de repetir.
- A intenção é gravada primeiro e processada por uma fila com novas
  tentativas (**Supabase Queues**, que usa `pgmq` e garante a entrega).
  [supabase-queues]

### 0.6 Entrada: caixa de webhooks

- Grava o corpo bruto, valida a assinatura, deduplica por `(provedor,
  evento_id)` e responde 2xx rápido; o processamento vai para a fila.
- **Consulta de segurança** periódica (Supabase Cron, que agenda até de
  segundo em segundo; recomenda até 8 jobs simultâneos de até 10 min) para
  recuperar eventos perdidos. [supabase-cron]
- **Limite da Vercel:** a plataforma **não valida certificado de cliente
  (mTLS) em conexões de entrada**. Bancos que exigem webhook com mTLS (Banco do
  Brasil, Bradesco) precisam de proxy com mTLS (Cloudflare, CloudFront) ou de
  outro serviço só para esse endpoint. Preferir provedores que aceitam outra
  forma de autenticação. [vercel-mtls]

### 0.7 Homologação

Cada fornecedor tem ambiente de teste. Para cada integração, um roteiro curto
de homologação (o que emitir, cancelar, receber) roda antes de mudar o
estado para produção. Só um operador muda o ambiente.

---

## 1. Nota fiscal (NFC-e, NF-e e NFS-e)

**Para quê.** NFC-e na venda a consumidor final (presencial ou delivery);
NF-e na venda a empresas; NFS-e para quem presta serviço (oficina, salão, a
própria agência). Regra do domínio: **não construir emissor; integrar
parceiro.**

### Fornecedores e custos

| Fornecedor | Plano | Valor | Observação |
| --- | --- | --- | --- |
| Focus NFe | Retail (NFC-e) | R$ 59,90/mês por CNPJ: 500 NFC-e + 100 NF-e; extra R$ 0,05 (NFC-e) e R$ 0,15 (NF-e) | **Não inclui NFS-e** |
| Focus NFe | Solo | R$ 89,90: 1 CNPJ, 100 notas de qualquer tipo; extra R$ 0,10 | Inclui NFS-e |
| Focus NFe | Start | R$ 113,90: 3 CNPJs com 100 notas cada; +R$ 37,90 por CNPJ | |
| Focus NFe | Growth / Retail+ | R$ 548 (CNPJs ilimitados, 4.000 notas) / R$ 629,90 (9.000 NFC-e + 1.000 NF-e) | Para quando tivermos muitos clientes |
| NFE.io | NF-e ou NFS-e | R$ 190 / R$ 265 / R$ 375 (250 / 500 / 1.000 notas) | Planos anuais com desconto |
| NFE.io | NFC-e | R$ 220 (2.000 notas) / R$ 410 (5.000); anual R$ 1.056 (700/mês, 2 CNPJs) | Bom para volume de NFC-e |
| WebmaniaBR | — | A partir de R$ 249,90 | O plano de R$ 69,90 citado antes não foi encontrado |
| Brasil NFe | — | R$ 49,90: NF-e e NFC-e ilimitadas, 1 CNPJ | |
| Transmitenota | — | R$ 49,90 (até 50 notas) a R$ 429,90 (mais de 1.000); implantação R$ 199,90; NFS-e R$ 15 por CNPJ no mês em que usar | |
| PlugNotas (TecnoSpeed) | — | Sob consulta | Voltado a software houses |
| Nuvem Fiscal | — | Não confirmado | **Os domínios não resolviam em 03/10/2026.** Não adotar sem confirmar que opera |
| Bibliotecas abertas (sped-nfe, NFeWizard, ACBr) | — | Sem licença | Contraria a regra do domínio: a manutenção das mudanças de leiaute fica conosco |

Exemplo (cálculo nosso): uma lanchonete com 3.000 cupons no mês, na Focus
Retail, custa R$ 59,90 + 2.500 × R$ 0,05 = **R$ 184,90/mês**.

**Recomendação:** começar pela Focus NFe (preço por CNPJ, token por empresa,
API para cadastrar o emitente com A1 e CSC, operação idempotente, avisos por
webhook, servidores no Brasil). NFE.io como segundo fornecedor se faltar
volume de NFC-e ou para redundância. [focus-precos] [focus-docs] [nfeio]

### O que o cliente fornece

- Certificado **e-CNPJ A1** (.pfx) e a senha. Custa de R$ 180 a R$ 280 por ano
  e vence em 1 ano. [certificado]
- **Inscrição estadual** regular e **credenciamento** como emissor de NFC-e no
  Portal do Contribuinte da SEFIN-RO (online, liberado na hora).
- **Id do CSC e CSC.** Em Rondônia o mesmo CSC vale para homologação e
  produção; gerar CSCs à toa causa erro. [sefin-faq]
- **Regime tributário** (CRT 1, 2, 3 ou 4; o 4 é o MEI) e, no Simples, o anexo.
- **Série e próximo número**, se vier de outro sistema.
- **Cadastro fiscal dos produtos:** NCM, CFOP, CST/CSOSN e, para a reforma,
  `cClassTrib`. Revisar com o contador na implantação.
- **NFS-e:** inscrição municipal, código de tributação nacional, NBS e
  alíquota de ISS. Empresa do **Simples**: emissão pelo Ambiente Nacional, com
  o certificado da própria empresa, a partir de 01/11/2026. Empresa **fora do
  Simples** em Porto Velho: token gerado no portal da prefeitura (emissor do
  fornecedor E&L), informado como senha. [focus-pvh] [focus-nfsen]

### Requisitos legais e calendário

| Tema | O que vale |
| --- | --- |
| Regras da SEFIN-RO para NFC-e | Sem homologação do software; contingência **só offline**, transmitindo em até 24 h; cancelamento em até 24 h se a mercadoria não saiu; sem carta de correção; inutilização até o dia 10 do mês seguinte; qualquer impressora, menos ECF e matricial; NFC-e só para venda presencial ou delivery a consumidor final. O FAQ não tem data e se apoia numa instrução de 2014: conferir no portal [sefin-faq] |
| DANFE pelo WhatsApp | O DANFE NFC-e pode ser enviado por meio eletrônico (link ou chave) se o consumidor aceitar, se identificar por CPF ou CNPJ e a nota não for de contingência (Ajuste SINIEF 20/2023) [sinief-20] |
| QR Code v3 (NT 2025.001) | Em produção desde 03/11/2025; **obrigatório na NFC-e emitida em contingência**; dispensa o CSC [qr-v3] |
| CNPJ alfanumérico | Novas inscrições com letras desde 31/07/2026 (IN RFB 2.229/2024); validação nos documentos fiscais em produção desde 06/07/2026 [cnpj-alfa] |
| Reforma tributária: campos de IBS/CBS | NF-e e NFC-e do regime normal desde 03/08/2026; NFS-e em 01/10/2026 e 01/12/2026 (casos específicos); **Simples Nacional em 01/01/2027**. A rejeição por falta dos campos foi adiada sem data, mas a obrigação vale. Alíquotas-teste de 2026: CBS 0,9% e IBS 0,1% [ato-4-2026] [cgibs] |
| Reforma em 2027 | CBS cobrada de fato e fim do PIS/Cofins para Lucro Presumido e Real. O Simples pode optar por recolher IBS/CBS no regime regular, por semestre (para jul–dez/2027, de 1 a 31/03/2027) [rfb-simples] [cbs-2027] |
| NFS-e nacional | Municípios no padrão nacional desde 01/01/2026 (LC 214/2025, art. 62). **Empresas do Simples só pelo Emissor Nacional a partir de 01/11/2026** (Res. CGSN 191/2026), em qualquer município; MEI desde 2023 [cgsn-191] |
| MEI | CRT 4 obrigatório desde 01/04/2025; não precisa emitir nota a pessoa física, só a empresas (LC 123/2006, art. 26, § 6º, II) [crt4] [lc123] |
| NF-e que referencia NFC-e | Prática do CFOP 5929 vedada a partir de 14/12/2026 (Ajuste SINIEF 29/2026) [sinief-29] |
| Rondônia | Manifestação do destinatário obrigatória desde 01/04/2019; EFD (SPED Fiscal) dispensada para Simples e MEI [qive-ro] [sefin-tate] |

### Riscos

- **Leiaute muda o tempo todo** (2025, 2026, 2027). Comprar a API passa esse
  trabalho ao fornecedor; construir emissor nos prende a ele.
- **Internet da loja cai:** uma API em nuvem fica inalcançável. Vender offline
  exige assinar a NFC-e no próprio PDV com certificado local e QR v3.
  Proposta: na primeira versão, contingência só para queda da SEFAZ (o
  fornecedor resolve); venda offline como módulo à parte, se pedirem.
- **Certificado vencido** para a emissão: alertar com 30, 15 e 7 dias.
- **Cadastro fiscal errado** gera rejeição em série: revisar na implantação.
- **Fornecedor sai do ar** (caso Nuvem Fiscal): a interface única permite
  trocar.
- **Custo por volume:** definir franquia de notas no plano e cobrar excedente.

### Desenho do adaptador

```ts
// proposta: src/lib/integracoes/fiscal/tipos.ts
export type EstadoDocumento =
  | 'enfileirado' | 'processando' | 'autorizado' | 'rejeitado'
  | 'denegado' | 'cancelado' | 'contingencia'

export interface EmissorFiscal {
  readonly provedor: 'focus' | 'nfeio' | 'sefin_nacional'
  /** `chave` é nossa chave de idempotência: o id do pedido ou do documento. */
  emitir(documento: DocumentoFiscal, chave: string): Promise<ResultadoEmissao>
  consultar(chave: string): Promise<ResultadoEmissao>
  cancelar(chave: string, justificativa: string): Promise<ResultadoEmissao>
  inutilizar(serie: number, de: number, ate: number, justificativa: string): Promise<void>
  baixarXml(chave: string): Promise<string>
  baixarDanfe(chave: string): Promise<Uint8Array>
}
```

- **Idempotência:** na Focus, o parâmetro `ref` = id do pedido (reenviar não
  duplica). Na NFS-e nacional, o id da DPS é composto (código IBGE do
  município, tipo de inscrição, CNPJ/CPF, série e número): se o envio expirar,
  `GET /dps/{id}` recupera a nota, mas só com o certificado do próprio
  emitente. [sefin-nacional-api]
- **Síncrono e assíncrono:** NFC-e responde na hora; NF-e entra em fila e o
  resultado chega por aviso (gatilho) ou consulta.
- **Eventos internos:** `documento.autorizado`, `documento.rejeitado`,
  `documento.cancelado`, `documento.contingencia`.
- **Fluxo no nosso sistema:** pedido concluído → se o módulo `fiscal` estiver
  ligado, emite NFC-e → se o cliente informou CPF, manda o link do DANFE na
  mensagem do WhatsApp.
- **Homologação:** tokens separados por ambiente; ambiente de homologação da
  SEFAZ para NFC-e e produção restrita do ADN para NFS-e; roteiro: emitir,
  cancelar, inutilizar, forçar uma rejeição de NCM e simular contingência.

---

## 2. Consulta cadastral (CNPJ, CEP, IE e Simples)

### O que é a "integração com a Receita"

O dono citou a "integração com a Receita Federal" da Olímpia. Em público, ela
é só a **consulta automática do CNPJ no cadastro** (preenche razão social,
endereço, CNAE e situação). Na prática, "integração com a Receita" são quatro
coisas diferentes:

1. **Autopreencher** cliente ou fornecedor pelo CNPJ (dados públicos).
2. **Inscrição estadual e situação** (CCC/SINTEGRA, webservice de consulta de
   cadastro da SEFAZ).
3. **Baixar as notas emitidas contra o CNPJ** (distribuição de DF-e no Ambiente
   Nacional, com A1; ADN para NFS-e) e fazer a manifestação.
4. **Serviços do e-CAC por API** (Integra Contador do Serpro: DAS, PGDAS-D).

### Fornecedores e custos

| Fornecedor | O que dá | Custo |
| --- | --- | --- |
| BrasilAPI | CNPJ, CEP, bancos | Grátis, sem SLA, em beta; pede que não haja extração em massa [brasilapi] |
| ViaCEP | CEP com **código IBGE** (usado na NF-e) | Grátis; uso massivo pode bloquear [viacep] |
| CNPJá (pública) | Receita, Simples/MEI, SUFRAMA, **sem IE**; até 45 dias de defasagem | Grátis, 5 consultas/min por IP [cnpja-open] |
| CNPJá (comercial) | Inclui IE; 1 crédito por consulta online, cache não gasta | Conta grátis com 50 créditos/mês; 1.000 créditos R$ 24,99; 2.500 R$ 39,99; 5.000 R$ 59,99; 10.000 R$ 99,99; 25.000 R$ 224,99; 100.000 R$ 824,99 [cnpja-pricing] |
| ReceitaWS | Pública com 3 consultas/min (só CNPJs em cache) | Comercial por cerca de R$ 149/mês (não confirmado) |
| Serpro Consulta CNPJ (oficial) | Básica / QSA (inclui Simples e MEI) / Empresa (inclui sócios) | Até 999 consultas/mês: R$ 0,6591 / R$ 0,8683 / R$ 1,1717 por consulta; contratação com e-CNPJ [serpro-cnpj] |
| Serpro Integra Contador | API do e-CAC (Simples, MEI, DCTFWeb, parcelamento, caixa postal…) | Consulta R$ 0,24 a R$ 0,06; emissão R$ 0,32 a R$ 0,08; declaração R$ 0,40 a R$ 0,12 por chamada, conforme a faixa do mês; exige e-CNPJ e procuração [integra-contador] |

### O que o cliente fornece

Nada para consultar CNPJ e CEP. Para guias do Simples (Integra Contador),
e-CNPJ e procuração eletrônica.

### Legal e riscos

- Dados de pessoa jurídica são públicos, mas o quadro de sócios traz
  **pessoas físicas**: tratar como dado pessoal (LGPD) e não guardar sem
  necessidade.
- Respeitar os termos das APIs gratuitas: só consultas sob demanda, nunca em
  lote.
- **Não expor dado de cliente antes do login.** A tela de login da Olímpia
  busca a lista de filiais pelo código da empresa antes de autenticar
  (observado no código público); não repetir isso.

### Problema já presente no nosso código: CNPJ alfanumérico

- O banco recusa: `tenants.cnpj` tem `check (cnpj ~ '^[0-9]{14}$')` em
  [`0001_esquema.sql`](../../supabase/migrations/0001_esquema.sql).
- A validação recusa: em
  [`src/lib/validacao/tenant.ts`](../../src/lib/validacao/tenant.ts) o CNPJ
  perde tudo o que não é dígito e precisa ter 14 dígitos.
- **Efeito:** uma empresa aberta depois de 31/07/2026 com letras no CNPJ não
  pode ser cadastrada. O nosso público são justamente negócios que estão se
  formalizando agora.
- **Correção:** migração nova que aceite 12 caracteres alfanuméricos + 2
  dígitos verificadores, validação do dígito no formato novo em
  `lib/dominio` (com testes), máscara aceitando letras, SQL completo
  regenerado e script de atualização para o Supabase já em produção.

### Desenho do adaptador

```ts
// proposta: src/lib/integracoes/cadastro/tipos.ts
export interface ConsultaCadastral {
  cnpj(cnpj: string): Promise<DadosEmpresa | null>  // valida o DV localmente antes
  cep(cep: string): Promise<Endereco | null>         // com código IBGE
}
```

- Cadeia de fornecedores com fallback: BrasilAPI → CNPJá pública →
  ReceitaWS; CNPJá comercial só quando a IE for necessária para emitir nota.
- Cache por CNPJ e CEP com validade de 7 a 30 dias; limite de taxa por
  fornecedor.
- **Ganho rápido:** autopreencher o cadastro de tenant no console ("novo
  tenant") pelo CNPJ. Ajuda a meta de página no ar em menos de 30 minutos.

---

## 3. Bancos, Pix, boletos e conciliação

**Para quê.** Pix com baixa automática no caixa, extrato no sistema,
boletos e links de pagamento, e Pix Automático para mensalidades (dos
clientes do comerciante e as nossas).

### Como funciona a API Pix

O padrão do Banco Central (com variações por banco) usa OAuth 2.0 com TLS
mútuo (mTLS) e recursos padronizados: cobrança imediata (`/cob`), com
vencimento (`/cobv`), consulta e devolução (`/pix`) e webhook por chave
(`/webhook/{chave}`). Uma interface comum cobre a maioria dos bancos; o que
muda é a autenticação e o endereço. [pix-api]

### Fornecedores e custos

| PSP | Tarifas | API e webhook |
| --- | --- | --- |
| **Efí** | Pix recebido 1,19%; Pix Automático R$ 3,50; boleto pago R$ 3,45 (emitir e cancelar é grátis); cartão 3,49% à vista, 3,99% em 2 a 6 parcelas, 4,39% em 7 a 12; sem mensalidade [efi-tarifas] | Webhook com mTLS ou, sem mTLS, com cabeçalho próprio + IP de origem fixo + hash na URL: **funciona na Vercel**. Até 9 novas tentativas (cerca de 6h20); reenvio manual até 30 dias; responder 2xx em até 60 s [efi-webhook] |
| **Asaas** | Pix ou boleto R$ 1,99 (R$ 0,99 nos 3 primeiros meses); crédito à vista R$ 0,49 + 2,99%; débito R$ 0,35 + 1,89%; aviso por WhatsApp R$ 0,55; NFS-e R$ 0,49; 30 Pix enviados grátis por mês; sem mensalidade [asaas] | API com cobrança, boleto, Pix e cartão. Tarifa fixa: boa para ticket alto, cara para lanche |
| **Banco Inter** | Integração da API grátis para PJ; tarifas de recebimento **não publicadas** (fonte secundária: 0,9% a 0,99% com teto, Pix Automático R$ 0,50 — não confirmado) [inter-api] | Cob, CobV, Pix Automático, webhook; certificado da API vale 1 ano |
| **Cora** | API só no plano **Cora Pro (R$ 44,90/mês)**; 100 boletos compensados grátis por mês, depois R$ 1,90 [cora-pro] | Boleto com QR Pix, pagamentos, webhooks |
| **Mercado Pago** | Pix por QR: 0% para a maioria; débito 1,99%; crédito 4,98% na hora ou 3,98% em 30 dias [mp-qr] | API Orders com Pix online (QR e copia-e-cola, expiração de 30 min a 30 dias) |
| **Stone** | Pix recebido na conta PJ sem tarifa (segundo a Stone) | API com QR dinâmico e webhooks; acesso de parceiros pelo time de parcerias (não confirmado se é aberto) |
| **PagBank** | Tarifa de Pix de 2026 não confirmada | API de pedidos com homologação obrigatória |
| **Sicoob** | Tarifa por cooperativa | API Pix para cooperados; relevante em RO |
| **PagHiper** (usada pela Sirrus) | Boleto pago R$ 2,79 a R$ 1,99 conforme o volume; Pix a partir de R$ 0,99; dinheiro em 2 dias [paghiper] | — |

**Open Finance** (extrato de qualquer banco num só lugar): caro para pequena
empresa. Pluggy cobra a partir de R$ 2.500/mês no plano de dados e R$ 500/mês
no de pagamentos; um relato cita Belvo em torno de R$ 6 mil/mês. **Não agora.**
A conciliação "por webhook" que prometemos sai mais barata integrando direto
com o PSP de cada cliente, com importação de OFX como alternativa.
[pluggy]

Por dentro, a cobrança automática da Olímpia configura Asaas, Efí e Mercado
Pago, com campos marcados como "stub"
([910](erp-olimpia/910-lacunas-11.md)).

### O que o cliente fornece

- Conta PJ no PSP escolhido.
- Client ID e client secret da API.
- Certificado da API (.p12, ou .crt e .key) quando o PSP exigir.
- Chave Pix cadastrada e autorização para registrarmos o webhook.
- Para **Pix Automático como recebedor:** CNPJ ativo há **pelo menos seis
  meses** e sem indício de fraude (Res. BCB 482/2025, art. 11-T, § 1º).
  [bcb-482]

### Requisitos legais

- **Pix Automático** (desde 16/06/2025): o pagador autoriza uma vez; as
  instruções de pagamento saem entre 10 e 2 dias antes da data; nova
  tentativa no mesmo dia, das 18h às 21h, é obrigatória; tentativas por até 7
  dias só se a autorização previr; o recebedor pode cancelar até a véspera;
  **é proibido cobrar tarifa do pagador**; a automação entre o PSP e o
  recebedor é feita só pela API Pix padrão (`/rec`, `/cobr`) ou por arquivo
  padronizado, então **um adaptador serve para todos os PSPs**. [bcb-faq]
- O débito automático por boleto entre bancos acabou em 01/01/2026 (Res. BCB
  505/2025); a migração é para o Pix Automático.
- **MED 2.0** (devolução por fraude rastreada em cadeia): obrigatório desde
  02/02/2026 e em produção plena desde 11/05/2026. Um Pix recebido pode ser
  bloqueado ou devolvido depois. Número de camadas, valor mínimo e prazo de
  contestação citados em matérias **não foram confirmados** na norma.
  [bcb-493] [med-infomoney]

### Riscos

- **Vercel sem mTLS de entrada** (ver 0.6): Banco do Brasil e Bradesco pedem
  proxy. Preferir Efí, Asaas, Inter ou Cora.
- Webhook perdido: consulta de segurança por período, diária.
- Certificados da API vencem (Inter: 1 ano).
- Devolução e bloqueio pelo MED mudam o caixa depois do fato: a conciliação
  tem de aceitar estorno.
- Tarifas negociáveis: o que está na tabela pode não ser o do cliente.

### Desenho do adaptador

```ts
// proposta: src/lib/integracoes/pix/tipos.ts
export interface ProvedorPix {
  readonly provedor: 'efi' | 'asaas' | 'inter' | 'cora' | 'mercadopago'
  criarCobranca(txid: string, valor: number, expiraEmSeg: number): Promise<CobrancaPix> // QR + copia-e-cola
  consultar(txid: string): Promise<CobrancaPix>
  devolver(endToEndId: string, valor: number): Promise<void>
  registrarWebhook(url: string): Promise<void>
  listarRecebidos(de: Date, ate: Date): Promise<PixRecebido[]> // reconciliação
}

export interface ProvedorRecorrencia {
  criarAutorizacao(contrato: ContratoRecorrente): Promise<{ qrCode: string }> // Pix Automático
  agendarCobranca(idRecorrencia: string, vencimento: Date, valor: number): Promise<void>
  cancelarCobranca(idCobranca: string): Promise<void>
}
```

- Idempotência pelo `txid` (nosso) e deduplicação dos webhooks pelo
  `endToEndId`.
- Eventos internos: `pix.recebido`, `pix.devolvido`, `pix.bloqueado`,
  `boleto.pago`, `recorrencia.autorizada`, `recorrencia.falhou`.
- Homologação no sandbox de cada PSP (a Efí tem cadeia de certificados de
  homologação própria).
- **Para a agência:** receber a nossa própria mensalidade por Pix Automático
  reduz inadimplência e dispensa cartão. O FAQ do BCB só exige CNPJ ativo; a
  exigência de mais de seis meses de CNPJ aparece numa leitura da Res. BCB 482
  (Finsiders) e pode ser política do PSP **(não confirmado)**: perguntar ao PSP
  escolhido.

---

## 4. WhatsApp

### Onde estamos

A Fase 1 usa link `wa.me` (o cliente final abre o WhatsApp com a mensagem do
pedido pronta). Não precisa de aprovação e não custa nada. A API oficial só
entra quando há algo que o link não faz: mandar mensagem sem o cliente
clicar.

### O desenho que mais simplifica: resumo pelo número da agência

O resumo diário vai **para o dono**, que é **nosso cliente**. Então pode sair
de **um único número oficial da agência** (WhatsApp Business Platform nossa),
como template de utilidade. Não é preciso conectar o número de cada
comerciante para isso. O cliente só informa o número do dono e aceita
receber. Conectar o número do comerciante (Embedded Signup e coexistência) só
é necessário quando a mensagem vai para o cliente final dele: status do
pedido, bot de atendimento, campanhas.

| Uso | Número que envia | O que exige |
| --- | --- | --- |
| Resumo diário ao dono; avisos ao dono (caixa aberto, estoque baixo) | Da agência | Uma conta oficial nossa; templates de utilidade aprovados; aceite do dono |
| Status do pedido ao cliente final | Do comerciante | Embedded Signup como Tech Provider; coexistência com o app |
| Bot de atendimento e pedidos | Do comerciante | Idem, mais a política de IA da Meta |
| Campanhas | Do comerciante | Idem, mais consentimento e descadastro |

### Custos (Brasil, 03/10/2026)

| Item | Valor |
| --- | --- |
| Marketing | R$ 0,3217 por mensagem entregue (US$ 0,0625) |
| Utilidade e autenticação | R$ 0,035 por mensagem (US$ 0,0068), sem impostos (~R$ 0,04 com impostos) |
| Serviço (respostas na janela de 24 h) | **Cobrado desde 01/10/2026**: 1.000 grátis por número por mês, depois R$ 0,035, sem desconto por volume |
| Template de utilidade dentro da janela | Também cobrado desde 01/10/2026 e **fora** da franquia de 1.000 |
| Conversa vinda de anúncio Click-to-WhatsApp | 72 h grátis |
| IA nativa da Meta (Business Agent) | US$ 2 por milhão de tokens desde 01/08/2026, cerca de US$ 0,04 a 0,05 por resposta |
| Faturamento em reais | Desde 01/07/2026 para contas com faturamento no Brasil; migração obrigatória até 30/06/2027 |

Sem meio de pagamento cadastrado, a Meta só entrega as mensagens da
franquia gratuita. [meta-pricing] [meta-servico] [zappy]

Estimativas (cálculo nosso, sem o custo de IA):

- **Resumo diário:** ~30 templates de utilidade por mês = **~R$ 1,05 por
  cliente/mês**.
- **Bot de pedidos** com ~5 mensagens por pedido em 1.000 pedidos = ~5.000
  mensagens: ~R$ 140/mês se forem respostas de serviço (depois das 1.000
  grátis) ou ~R$ 175 se forem templates.

### Como conectar o número do comerciante

- **Embedded Signup como Tech Provider:** o cliente fica dono da conta e paga
  a Meta com o próprio meio de pagamento. Limite de 10 clientes novos a cada 7
  dias; 200 depois da verificação do negócio e das revisões da Meta. [embedded]
- **Coexistência:** o comerciante continua usando o app WhatsApp Business no
  mesmo número. Exige app 2.24.17 ou mais novo. Limites: 20 mensagens por
  segundo; mensagens temporárias, de visualização única e localização em tempo
  real desligadas; listas de transmissão só leitura; grupos não sincronizam;
  histórico de até 180 dias sincronizado em 24 h; o app precisa ser aberto a
  cada ~14 dias. Um requisito de "7 dias de uso" citado por terceiros não está
  na documentação da Meta (não confirmado). [coexistencia] [360-coexistencia]
- **BSPs** (intermediários): 360dialog cobra cerca de €49 por número/mês sem
  acréscimo por mensagem; Twilio e Bird somam cerca de US$ 0,005 por mensagem.
  O empate fica perto de 10 mil mensagens/mês. Ir direto na Cloud API como
  Tech Provider dispensa intermediário. [bsp-precos]

### Regras que mudam o produto

- **IA:** a Meta proíbe na API assistentes de IA de uso geral (todos desde
  15/01/2026). **No Brasil**, depois da medida do CADE contra essa proibição,
  a Meta aceita esses provedores e cobra cada mensagem sem template desde
  11/03/2026 (a disputa na Justiça continua). Um bot
  ligado ao negócio (pedidos, resumo, status) é permitido em qualquer cenário
  e é cobrado como mensagem de serviço. É proibido usar dados do WhatsApp para
  treinar modelos de terceiros. Vender o bot como assistente do comerciante,
  nunca como "um ChatGPT no WhatsApp". [ai-providers] [cade]
- **Nome de usuário:** desde jun/2026 quem usa nome de usuário pode esconder o
  telefone; os webhooks trazem um identificador por empresa (BSUID). Cadastro
  de cliente vindo da API não pode depender só do número. [twilio-bsuid]
- **Conectores não oficiais** (Z-API, R$ 99,99 por instância; Evolution API no
  modo WhatsApp Web; o Atendimentos da Olímpia): violam os termos do
  WhatsApp (mensagens automáticas e acesso automatizado não autorizados) e
  arriscam banir o número do cliente. Se um dia oferecermos, só com aceite
  expresso do risco em contrato. [whatsapp-termos] [zapi]
- **Consentimento:** campanhas só com aceite e com descadastro por
  palavra-chave ("SAIR", "PARAR"), como a Sirrus já faz.
- **Confiança:** 77% dos brasileiros se preocupam com a coleta de dados por IA
  e 61% não se sentem à vontade para mandar dado sensível pelo WhatsApp.
  Nunca pedir documento ou senha por lá. [opinionbox]

### Desenho do adaptador

```ts
// proposta: src/lib/integracoes/mensagens/tipos.ts
export interface CanalMensagens {
  enviarTemplate(para: string, template: string, categoria: 'utilidade' | 'marketing' | 'autenticacao',
                 variaveis: string[]): Promise<{ idMensagem: string }>
  enviarSessao(para: string, texto: string): Promise<{ idMensagem: string }> // só dentro da janela de 24 h
}
// webhooks: mensagem recebida, status (enviada, entregue, lida, falhou)
```

- Registrar a janela de 24 h por contato, a categoria e o custo estimado de
  cada envio, com **teto mensal por tenant**.
- **Resumo diário, versão 1:** job do Supabase Cron na hora escolhida pelo dono
  (no fuso da loja), monta o texto com os números do painel (faturamento,
  pedidos, ticket médio, mais vendidos; caixa e ponto quando esses módulos
  existirem) e envia um template de utilidade pelo número da agência. **Não
  precisa de IA.**
- Homologação com o número de teste da Meta; produção depois da verificação
  do negócio.

---

## 5. Ponto eletrônico

### Antes de construir: é obrigatório?

- **Só acima de 20 trabalhadores por estabelecimento** (CLT, art. 74, § 2º,
  desde a Lei 13.874/2019); abaixo disso, o ponto é controle e prova, não
  obrigação. Há também o ponto por exceção, por acordo escrito. A maioria dos
  nossos clientes tem de 1 a 3 funcionários. [clt]
- Para valer como **registro eletrônico oficial** (Portaria MTP 671/2021), o
  sistema tem de ser REP-C (equipamento certificado), REP-A (exige acordo
  coletivo) ou **REP-P** (programa em nuvem). [portaria-671]

### O que o REP-P exige (texto compilado em 21/07/2026)

| Requisito | Detalhe |
| --- | --- |
| Registro do programa no INPI | Certificado de registro de programa de computador (art. 91). Taxa de R$ 210 (código 730) [inpi] |
| Comprovante ao trabalhador | PDF assinado (padrão PAdES) com NSR, empregador, nº do INPI e hash SHA-256 (arts. 79–80). Pode ficar disponível eletronicamente, com acesso às marcações das últimas 48 h |
| AFD | Arquivo Fonte de Dados (art. 81), assinado pelo desenvolvedor do REP-P (CAdES, arquivo .p7s separado) |
| AEJ | Arquivo Eletrônico de Jornada (art. 83), gerado pelo programa de tratamento do ponto; substituiu AFDT e ACJEF |
| Espelho de ponto | Art. 84 |
| Atestado Técnico e Termo de Responsabilidade | Art. 89; assinado por pessoas físicas (responsável técnico e representante legal) da software house, para cada cliente. Uma fonte secundária diz que o REP-P dispensa o atestado; prevalece o FAQ do Ministério [mte-faq] |
| Certificado ICP-Brasil | Da software house, A1 ou A3, para as assinaturas |
| Armazenamento | Repositório com redundância e alta disponibilidade; marcações só por inserção |
| Offline e celular | Marcação offline **não** é obrigatória; marcação pelo celular (e, portanto, pelo navegador) é aceita |
| Biometria | **Não é exigida** |

Nenhum concorrente mostra esses elementos em público: a Olímpia diz atender a
Portaria 671 sem mostrar nº do INPI, AFD ou AEJ (por dentro há o rótulo
"REP-P" e validação facial, sem esses arquivos); a Sirrus ainda fala em AFDT
e ACJEF.

### Biometria e LGPD

- Biometria (facial ou digital) é **dado pessoal sensível** (LGPD, art. 5º,
  II). Bases do art. 11 usadas em ponto: cumprimento de obrigação legal (fraca
  abaixo de 20 funcionários), exercício regular de direitos em contrato e
  prevenção à fraude na identificação. Consentimento é frágil na relação de
  emprego. [lgpd]
- Fazer o **relatório de impacto (RIPD)** antes de implantar; oferecer
  **marcação alternativa sem biometria**; documentar finalidade, local de
  armazenamento, retenção e compartilhamento; responder pedidos do titular.
- Um caso recente no TRT-10 (set/2026) envolveu uma empregada que recusou o
  cadastro facial e pediu transparência sobre o armazenamento. [trt10]
- A ANPD publicou estudo e fez consulta pública sobre biometria; o
  regulamento específico previsto para 2026 não foi encontrado. Acompanhar.
  [anpd-radar]

### Tecnologia e custos

| Opção | Custo | Observação |
| --- | --- | --- |
| Reconhecimento facial **no navegador** (biblioteca Human, licença MIT; MediaPipe Face Landmarker, Apache) | Grátis | Prova de vida por piscar ou virar o rosto; o dado biométrico nem sai do aparelho, o que ajuda na LGPD [human] [mediapipe] |
| AWS Rekognition | ~US$ 0,001 por comparação; US$ 0,015 por prova de vida (região dos EUA) | Sem tabela para São Paulo: dado biométrico no exterior entra no RIPD [aws-rekognition] |
| Azure Face | — | Identificação só com aprovação da Microsoft |
| Leitor de digital (ex.: HID DigitalPersona) | Hardware + SDK | Não existe API web padrão; exige agente local. Deixar opcional |

Preços-âncora para o cliente: Stone cobra **R$ 7,99 por funcionário/mês**
(R$ 4,99 no combo) com ponto facial na maquininha e AEJ; Olímpia, R$ 90/mês
ou R$ 45 para até 5 pessoas; mercado de R$ 5 a mais de R$ 30 por
colaborador. [stone-ponto]

### O que o cliente fornece

Lista de colaboradores (nome e CPF), jornadas e escalas, locais permitidos
(cerca geográfica), acordo coletivo se for REP-A, o aviso de privacidade
assinado e o aparelho de marcação (webcam, tablet ou celular).

### Desenho

```ts
// proposta: src/lib/integracoes/ponto/tipos.ts
export interface RegistradorPonto {
  registrar(marcacao: { colaboradorId: string; origem: 'webcam' | 'celular' | 'manual';
                        fotoValidada: boolean; local?: { lat: number; lng: number } }): Promise<{ nsr: number }>
  gerarAfd(de: Date, ate: Date): Promise<Uint8Array>   // assinado (CAdES)
  gerarAej(de: Date, ate: Date): Promise<Uint8Array>
  comprovante(nsr: number): Promise<Uint8Array>        // PDF assinado (PAdES)
}
```

- Marcação só por inserção, NSR sequencial por empregador, horário do
  servidor.
- Guardar o descritor facial, não a foto; criptografado; com prazo de
  retenção.
- O resumo diário do dono mostra quem bateu ponto.
- **Decisão anterior a tudo:** vender "controle de jornada" (sem valor de REP,
  para quem tem até 20 pessoas) ou investir no REP-P (INPI, certificado,
  atestado e arquivos assinados). Ver [README](README.md#decisões-para-o-dono).

---

## 6. Maquininhas e TEF

| Caminho | Como funciona | Serve para sistema web? |
| --- | --- | --- |
| **Mercado Pago Point** (API Orders) | O sistema lista os terminais, cria a ordem com o terminal escolhido e ela aparece na maquininha (Point Smart 1 e 2, Point Pro 2). Status por notificação. A integração antiga será descontinuada [mp-point] | **Sim**, tudo em nuvem |
| **Stone Connect 2.0** | Liga o sistema às POS Stone (S920, V240M, Q92): pré-transação, consulta, recibo e **impressão do DANFE na própria POS**, extrato e webhooks [stone-connect] | **Sim**, em nuvem |
| **Cielo Smart** | Integração por deeplink de app Android; **WebView proibido**; o SDK da LIO foi descontinuado [cielo] | Só com app Android nosso |
| **PagBank** | PlugPag por Bluetooth (Moderninha Pro e Wifi); biblioteca Android dentro da Moderninha Smart [pagbank] | Só com app nativo |
| **TEF dedicado (SiTef)** | Biblioteca nativa chamada pelo PDV; preço não público [sitef] | Só com agente local |
| Getnet | Não levantado | — |

Custos de referência: Pix por QR no Mercado Pago 0% (débito 1,99%, crédito
4,98%); Pix na conta Stone sem tarifa; concorrentes cobram pela integração
(Olímpia TEF R$ 100/mês; Consumer R$ 21 por ponto de TEF adicional; Olist R$
50 por maquininha adicional).

**O cliente fornece:** conta na adquirente, terminal compatível, token de
acesso e qual terminal fica em qual caixa.

**Legal (PAT, vale-refeição e alimentação):** taxa máxima de 3,6% e repasse em
até 15 dias desde 10/02/2026; arranjo aberto desde 10/05/2026 para as
operadoras grandes; interoperabilidade plena (qualquer cartão em qualquer
maquininha) em nov/2026. Liminares derrubadas no TRF-3 em 24/02/2026; ação no
STF sem decisão. Guardar taxa e prazo por bandeira de voucher. [pat]

**Riscos:** o cliente já tem maquininha de outra adquirente (temos de aceitar
a dele, não impor a nossa); a Cielo proíbe rodar o nosso sistema web dentro
da maquininha.

**Desenho:**

```ts
export interface TerminalPagamento {
  listarTerminais(): Promise<Terminal[]>
  cobrar(valor: number, terminalId: string, idPedido: string): Promise<{ idCobranca: string }> // idPedido = idempotência
  cancelar(idCobranca: string): Promise<void>
}
// webhook: cobranca.aprovada, cobranca.recusada, cobranca.cancelada
```

Versão 1 com Mercado Pago e Stone (só nuvem); Cielo e PagBank numa segunda
fase, com app Android.

---

## 7. Periféricos: impressora, gaveta, balança e leitor

| Nível | Como | Limites |
| --- | --- | --- |
| 1. Universal | Cupom de 80 mm em HTML e CSS pelo diálogo de impressão do navegador | Não é silencioso e não abre a gaveta |
| 2. Navegador com acesso ao dispositivo | WebUSB ou Web Serial mandando ESC/POS; gaveta pelo comando `ESC p` da impressora | WebUSB só em navegadores Chromium; **no Windows o driver da impressora toma o dispositivo** (trocar por WinUSB). Web Serial no Chrome e Edge 89+, Opera e Firefox 151+; não no Safari [webusb] [webserial] |
| 3. Agente local | QZ Tray (código aberto; licença com suporte por cerca de US$ 599/ano, não confirmado) ou agente próprio | Impressão silenciosa, impressora de rede, balança, TEF; manutenção do agente fica conosco [qz] |

- **Balança:** a Toledo Prix fala serial (RS-232, protocolo P05A, 2400 baud).
  Alternativa sem integração: balança etiquetadora com código EAN-13
  começando por 2 (código do produto + peso ou preço), lido pelo leitor de
  código de barras, que funciona como teclado.
- **Gaveta:** liga no conector da impressora e abre com `ESC p` enviado junto
  com o cupom.
- **Concorrência:** por dentro, a Olímpia usa exatamente este desenho: um
  agente desktop com pareamento por token e Web Serial para a balança no PDV
  web ([915](erp-olimpia/915-lacunas-16.md)).
- **O cliente fornece:** os modelos de impressora, balança e leitor; um PC com
  Chrome ou Edge; permissão para instalar o agente.
- **Desenho:** uma camada `PerifericosLoja` que detecta o que está disponível
  e cai de nível sozinha (agente → Web Serial → impressão do navegador).

---

## 8. iFood, 99Food e Keeta

Fase 3 do [brief](../brief.md). O modelo já está preparado: `canal` com
`ifood` e `99food`, `canal_pedido_id` para deduplicar e formato canônico
Open Delivery em [`tipos.ts`](../../src/lib/canais/tipos.ts).

### iFood (Merchant API)

- **Grátis**, mas exige conta com **CNPJ** (não aceita CPF), **CNAE de
  tecnologia** e um app completo para homologação (cerca de uma semana; os
  ajustes somam 10% a 15% ao projeto). [ifood-dev]
- Tipos de app: **centralizado** (um app nosso para várias lojas, com
  webhook) ou distribuído (instalado na loja, sem webhook).
- **Eventos por polling** a cada 30 s (o polling também mantém a loja
  online); limite de 6.000 requisições por minuto por token; desde
  02/04/2026, 100 eventos sem confirmação bloqueiam o polling por 5 min;
  eventos guardados até 8 h depois da entrega do pedido; confirmação em lote
  (o guia fala em 2.000 ids; a referência, em 10.000); eventos podem vir
  duplicados e fora de ordem; até 100 lojas por requisição. [ifood-polling]
- **Webhook** (app centralizado): resposta em até 5 s, novas tentativas por
  15 min, assinatura HMAC-SHA256, uma URL por app. [ifood-webhook]
- **Mudanças recentes:** marcar "pronto para retirada" passou a ser
  obrigatório em todos os pedidos (08/09/2026); os endpoints de pizza do
  catálogo antigo estão sendo descontinuados (25/09/2026). [ifood-changelog]
- **A permissão** é dada no portal do parceiro por um usuário com perfil de
  dono; se esse usuário for desativado, a integração para (ver
  [dominio-produto](../../.claude/skills/dominio-produto/SKILL.md)).

### Open Delivery (99Food e Keeta)

- Padrão aberto da Abrasel. **99Food e Keeta concluíram a integração em
  07/11/2025**; o iFood participa da governança, mas não aderiu. [open-delivery]
- Na Keeta: polling de eventos e confirmação (resposta 202); autenticação
  OAuth2 ou assinatura no cabeçalho; 13 tipos de evento. [keeta]
- Na 99Food, **uma loja só aceita um integrador ativo**: vender para quem já
  usa outro sistema exige que ele desligue o atual.

### Porto Velho

O iFood opera com certeza. 99Food: há indício (um restaurante de rede em
Porto Velho anunciou pedidos pela 99Food em ago/2026), mas as listas de
expansão não citam a cidade (não confirmado). Keeta e aiqfome não
confirmados. **Confirmar com restaurantes locais antes de investir no
adaptador Open Delivery.**

### Custo para o comerciante (o argumento do cardápio próprio)

iFood: plano Básico 12% + 3,2% no pagamento online + R$ 110/mês; plano
Entrega 23% + 3,2% + R$ 150/mês; mensalidade só acima de R$ 1.800 faturados
no mês. Num pedido de R$ 50 no Básico o restaurante recebe R$ 42,40. Mil
pedidos de R$ 50 no mês custam cerca de R$ 7.600 + R$ 110 (cálculo nosso,
supondo pagamento online em todos). [ifood-taxas]

### Desenho

```ts
// em lib/canais, ao lado do adaptador do cardápio
export interface ProvedorDelivery {
  puxarEventos(): Promise<EventoPedido[]>
  confirmarEventos(ids: string[]): Promise<void>
  aceitar(idPedidoCanal: string): Promise<void>
  marcarPronto(idPedidoCanal: string): Promise<void>      // obrigatório no iFood desde 08/09/2026
  despachar(idPedidoCanal: string): Promise<void>
  cancelar(idPedidoCanal: string, motivo: string): Promise<void>
  sincronizarCatalogo(catalogo: CatalogoCanonico): Promise<void>
}
```

Poller no Supabase Cron a cada 30 s; grava cada evento com chave única
(canal + id do evento) **antes** de confirmar; processamento pela fila;
webhook quando formos app centralizado no iFood. Homologar no ambiente de
teste do iFood antes de liberar a qualquer loja.

---

## 9. IA e "crédito de IA"

- O custo de modelos de linguagem por cliente **não foi levantado** nesta
  pesquisa. O projeto já usa a API da Anthropic no importador de cardápio por
  foto; consultar a tabela oficial antes de fixar o "crédito de IA incluso".
- Concorrentes: Bling dá de 25 a 1.000 créditos de IA por mês conforme o
  plano; Olist, de 10 a 40; Conta Azul inclui IA sem custo extra. A Olímpia
  usa um modelo rodando no próprio servidor, com OpenAI ou Gemini como opção
  (no Atendimentos).
- **Recomendação:** o resumo diário sai sem IA (números num modelo de
  mensagem). A IA entra para alertas e perguntas em linguagem natural, com
  limite mensal por cliente e medição de uso por tenant. A Meta oferece IA
  própria no WhatsApp a US$ 2 por milhão de tokens; comparar antes de
  escolher.

---

## Fontes

[supabase-vault]: https://supabase.com/docs/guides/database/vault
[supabase-queues]: https://supabase.com/docs/guides/queues
[supabase-cron]: https://supabase.com/docs/guides/cron
[vercel-mtls]: https://community.vercel.com/t/mtls-de-entrada/29186
[focus-precos]: https://focusnfe.com.br/precos/
[focus-docs]: https://doc.focusnfe.com.br/
[focus-pvh]: https://focusnfe.com.br/guides/nfse/municipios-integrados/porto-velho-ro/
[focus-nfsen]: https://focusnfe.com.br/guides/nfse/municipios-integrados/municipios-da-nfse-nacional/
[nfeio]: https://nfe.io/precos/emissao-nfce/
[certificado]: https://www.omie.com.br/blog/qual-e-o-valor-do-certificado-digital-a1-e-a3-em-2026/
[sefin-faq]: https://www.sefin.ro.gov.br/portalsefin/downloads/PERGUNTAS-FREQUENTES-NFCE-FINAL.pdf
[sinief-20]: https://www.legisweb.com.br/legislacao/?id=448464
[qr-v3]: https://notagateway.com.br/blog/atualizacoes-na-nota-tecnica-2025-001-v1-03-foco-nas-mudancas-recentes-para-nfc-e-e-nf-e/
[cnpj-alfa]: https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/cnpj-alfanumerico
[ato-4-2026]: https://www.legisweb.com.br/legislacao/?id=498712
[cgibs]: https://www.cgibs.gov.br/receita-federal-e-comite-gestor-do-ibs-esclarecem-adiamento-das-regras-de-validacao-dos-documentos-fiscais-eletronicos
[rfb-simples]: https://www8.receita.fazenda.gov.br/simplesnacional/Noticias/NoticiaCompleta.aspx?id=e595d010-1e04-4c3b-95d9-185fc58594b5
[cbs-2027]: https://taxcel.com.br/reforma-tributaria-2027-cbs-fim-pis-cofins-imposto-seletivo
[cgsn-191]: https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/simples-nacional-nfs-e-nacional-sera-obrigatoria-para-me-e-epp-a-partir-de-1o-de-novembro-de-2026
[crt4]: https://blog.tecnospeed.com.br/nf-e-e-nfc-e-nota-tecnica-2024-001-crt-4/
[lc123]: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
[sinief-29]: https://www.contabeis.com.br/noticias/79411/empresas-ganham-novo-prazo-para-adequar-emissao-de-nf-e-e-nfc-e/
[qive-ro]: https://qive.com.br/blog/manifestacao-do-destinatario-obrigacao-rondonia-mf
[sefin-tate]: https://tate.sefin.ro.gov.br/storage/2024/10/20222700100190-1.pdf
[sefin-nacional-api]: https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-emissor-publico-api-sistema-nacional-nfs-e-v1-2-out2025.pdf/@@download/file
[brasilapi]: https://github.com/BrasilAPI/BrasilAPI
[viacep]: https://viacep.com.br/
[cnpja-open]: https://cnpja.com/api/open
[cnpja-pricing]: https://cnpja.com/pricing
[serpro-cnpj]: https://loja.serpro.gov.br/consultacnpj
[integra-contador]: https://loja.serpro.gov.br/integracontador
[pix-api]: https://banco.bradesco/pix/assets/docs/api_pix_200.pdf
[efi-tarifas]: https://sejaefi.com.br/tarifas
[efi-webhook]: https://dev.efipay.com.br/en/docs/api-pix/webhooks/
[asaas]: https://www.asaas.com/precos-e-taxas
[inter-api]: https://inter.co/empresas/api-pix/
[cora-pro]: https://www.cora.com.br/conta-pj/cora-pro/
[mp-qr]: https://www.mercadopago.com.br/blog/quanto-custa-receber-pagamentos-via-pix-e-codigo-qr
[paghiper]: https://www.paghiper.com/taxas-e-tarifas/
[pluggy]: https://www.pluggy.ai/precos
[bcb-482]: https://www.bcb.gov.br/api/conteudo/app/normativos/exibenormativo?p1=Resolu%C3%A7%C3%A3o%20BCB&p2=482
[bcb-faq]: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/pix-automatico-FAQ-participantes.pdf
[bcb-493]: https://www.bcb.gov.br/api/conteudo/app/normativos/exibenormativo?p1=Resolu%C3%A7%C3%A3o%20BCB&p2=493
[med-infomoney]: https://www.infomoney.com.br/minhas-financas/med-2-0-passa-a-ser-obrigatorio-em-todas-as-plataformas-que-oferecem-pix/
[meta-pricing]: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
[meta-servico]: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages
[zappy]: https://www.zappy.chat/whatsapp-business-api-brasil-outubro-2026/
[embedded]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview/
[coexistencia]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users
[360-coexistencia]: https://docs.360dialog.com/partner/onboarding/whatsapp-coexistence
[bsp-precos]: https://ezcontact.ai/en/blog/whatsapp-api-pricing-comparison-meta-twilio-360dialog-ezcontact/
[ai-providers]: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers
[cade]: https://sitepd.org.br/2026/03/05/cade-mantem-veto-a-nova-politica-do-whatsapp/
[twilio-bsuid]: https://www.twilio.com/en-us/changelog/whatsapp-usernames--new-business-scoped-user-id--bsuid--field-re
[whatsapp-termos]: https://www.whatsapp.com/legal/terms-of-service
[zapi]: https://blog.cubosuite.com.br/z-api-guia-completo/
[opinionbox]: https://materiais.opinionbox.com/pesquisa-whatsapp-no-brasil
[clt]: https://findes.com.br/wp-content/uploads/2020/03/Informe-Estrategico-%E2%80%93-Registro-de-ponto-1.pdf
[portaria-671]: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/legislacao/portarias-1/portarias-vigentes-3/WORDPortarian671de8denovembrode2021compilada21.07.2026.pdf
[inpi]: https://www.gov.br/inpi/pt-br/servicos/custos-e-pagamento/NovaTabeladeRetribuiesINPI_SOFTWARE_Final_20_dez_25.pdf
[mte-faq]: https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/fiscalizacao-do-trabalho/Perguntas%20e%20Respostas%20REP
[lgpd]: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
[trt10]: https://www.correiobraziliense.com.br/cbradar/ponto-reconhecimento-facial-lgpd-dado-biometrico/
[anpd-radar]: https://www.gov.br/anpd/pt-br/centrais-de-conteudo/documentos-tecnicos-orientativos/radar-tecnologico-biometria-anpd-1.pdf/@@display-file/file
[human]: https://github.com/vladmandic/human
[mediapipe]: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js
[aws-rekognition]: https://aws.amazon.com/rekognition/pricing/
[stone-ponto]: https://conteudo.stone.com.br/bate-ponto-stone/
[mp-point]: https://www.mercadopago.com.br/developers/en/news/2025/07/16/Transform-your-point-of-sale-with-the-new-integration-between-Point-and-the-Orders-API
[stone-connect]: https://connect.stone.com.br/docs
[cielo]: https://github.com/DeveloperCielo/LIO-SDK-Sample-Integracao-Local
[pagbank]: https://github.com/pagseguro/pagseguro-sdk-plugpagservicewrapper
[sitef]: https://dev.softwareexpress.com.br/en/docs/clisitef/apresentacao
[pat]: https://agenciabrasil.ebc.com.br/economia/noticia/2026-02/novas-regras-para-vales-alimentacao-e-refeicao-entram-em-vigor
[webusb]: https://github.com/NielsLeenheer/WebUSBReceiptPrinter
[webserial]: https://caniuse.com/web-serial
[qz]: https://qz.io/docs/licensing
[ifood-dev]: https://developer.ifood.com.br/pt-BR
[ifood-polling]: https://developer.ifood.com.br/pt-BR/docs/food/guides/modules/events/polling-overview
[ifood-webhook]: https://developer.ifood.com.br/pt-BR/docs/food/guides/modules/events/webhook-request
[ifood-changelog]: https://developer.ifood.com.br/pt-BR/docs/guides
[open-delivery]: https://abrasel.com.br/noticias/noticias/99food-e-keeta-concluem-integracao-ao-open-delivery/
[keeta]: https://api-docs.mykeeta.com/apis/opendelivery/orderspolling/pollingacknowledgment.md
[ifood-taxas]: https://blog-parceiros.ifood.com.br/taxas-ifood/
