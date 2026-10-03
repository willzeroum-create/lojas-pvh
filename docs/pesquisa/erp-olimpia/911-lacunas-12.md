# 911 — Lacunas, lote 12: cashback, portal do cliente e telas fiscais (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03. Nenhuma das 12 telas
> deste lote abriu. Este arquivo **não descreve o ERP**. Ele registra o
> bloqueio, diz o que você pode fazer e deixa as perguntas prontas para a
> próxima visita.

## Explicando bem simples

1. **Sua credencial está certa.** A conta "Boi Criolo" continua logada no
   navegador embutido. Não precisa mandar de novo. E não mande senha no chat:
   o agente não usa senha.
2. **Quem barrou não foi o ERP. Foi o próprio Claude Code.** No modo
   automático, o Claude Code tem um filtro de segurança. Ele olha cada ação
   antes de ela acontecer e decide: pode ou não pode.
3. **O filtro disse "não pode".** O motivo foi "Third-Party Attack", que quer
   dizer "isto pode prejudicar outra empresa" (aqui, a Olímpia). Ele vê o
   Claude vasculhando, tela por tela, o sistema de outra empresa para copiar
   as funções. Estar logado não muda isso: o que ele avalia é o efeito sobre a
   outra empresa, não a senha.
4. **Por isso mandar a credencial não muda nada.** A página nem chegou a
   carregar.
5. **O Claude não pode passar por cima do filtro.** Nem por outra aba, nem
   pela sua aba, nem por outro navegador, nem por outra ferramenta. Seria
   desobedecer à segurança. Por isso parei.
6. **Desta vez o filtro barrou até as anotações antigas.** Tentei trazer para
   cá o que outros arquivos desta pasta já sabiam sobre estas telas. O filtro
   recusou também, pelo mesmo motivo. Por isso este arquivo não traz esse
   resumo.
7. **O login funciona.** Hoje, em outras tentativas, algumas telas abriram já
   logadas (arquivos `13-fiscal.md` e `14-os-forca-vendas.md`). O filtro
   decide caso a caso.

## O que você pode fazer

Só você decide. O agente não mexe em permissões.

1. **Conferir os termos de uso da Olímpia.** Veja se eles permitem usar a
   conta para estudar o sistema e construir um produto concorrente. É
   exatamente o risco que o filtro aponta.
2. **Se decidir seguir, liberar no Claude Code** (não no ERP). O próprio aviso
   do Claude Code diz que você pode criar uma regra de permissão nas
   configurações. A outra forma é rodar o lote sem o modo automático e clicar
   em **Permitir** quando o pedido aparecer. O passo a passo já escrito está em
   `97-lacunas-8.md` ("O que você precisa fazer").
3. **Mandar rodar de novo só o lote 12.** Este arquivo será trocado pelo
   relatório completo.

## O que aconteceu (registro técnico)

- Data: 2026-10-03.
- Abas abertas no navegador embutido no início (4): `seed` (localhost:3000),
  `tab-1` e `tab-38` (ERP Olímpia) e `tab-7` (outro site). Nenhuma foi tocada.
- Criei a minha própria aba (`tab-39`).
- Pedi para abrir `https://erp.olimpiasistemas.com.br/dashboard/modulo/cashback`
  na `tab-39`: **recusado** pelo classificador do modo automático, motivo
  "Third-Party Attack". A recusa acontece antes da execução: nada carregou.
- A recusa vale para o resultado (ler o ERP), não só para aquele comando. Por
  isso não tentei as outras 11 rotas, nem outra aba, nem outro navegador, nem
  o manual, nem baixar páginas.
- Fechei a `tab-39`.
- Depois tentei ler trechos de outros arquivos desta pasta (09, 21, 90, 93 e
  95) para juntar aqui o que já se sabia sobre estas telas: **também
  recusado**, mesmo motivo. Não insisti.
- No ERP nada foi lido, clicado, digitado ou gravado.

## Rotas do lote

| Rota | Assunto (pelo nome da rota) | Estado |
|---|---|---|
| `/dashboard/modulo/cashback` | cashback | **recusada** pelo filtro |
| `/cashback-admin` | cashback | não aberta (mesma recusa) |
| `/dashboard/modulo/cliente` | portal do cliente | não aberta (mesma recusa) |
| `/cliente-portal/app` | portal do cliente | não aberta (mesma recusa) |
| `/cliente-portal-admin/link` | portal do cliente | não aberta (mesma recusa) |
| `/manifestacao-nfe` | fiscal | não aberta (mesma recusa) |
| `/mdfe` | fiscal | não aberta (mesma recusa) |
| `/cte` | fiscal | não aberta (mesma recusa) |
| `/producao/sped-bloco-k` | fiscal / produção | não aberta (mesma recusa) |
| `/cfops` | tabelas fiscais | não aberta (mesma recusa) |
| `/cfop-conversoes` | tabelas fiscais | não aberta (mesma recusa) |
| `/fiscal-series` | tabelas fiscais | não aberta (mesma recusa) |

Sub-rotas descobertas: nenhuma.

As mesmas rotas já estavam como não abertas em
`12-cobranca-crm-cashback-portal.md` (cashback e portal) e em `13-fiscal.md`,
seção 2.3 (as fiscais).

## Seções do relatório

Visão geral do módulo, telas (listas, colunas, filtros, formulários e
opções), regras de negócio, fluxos de ponta a ponta, entidades e relações,
integrações e observações de UX: **sem dados**. Nada disso pode ser escrito
sem abrir as telas, e este arquivo não inventa.

## Perguntas para a próxima visita

São perguntas de conhecimento geral do varejo e do fiscal brasileiro.
**Nada disto foi visto no ERP.** Em cada tela: abrir lista, filtros e "Novo",
ler os campos e as opções de cada lista e fechar **sem gravar**.

- **Cashback** (`/dashboard/modulo/cashback`, `/cashback-admin`): como o
  cliente ganha (percentual da venda, por produto, por faixa de valor); prazo
  de validade do saldo; valor mínimo e limite de uso por compra; se o saldo
  vira forma de pagamento no Caixa ou no PDV; extrato por cliente; o que
  acontece quando a venda é cancelada; se o cliente é avisado (WhatsApp,
  e-mail).
- **Portal do cliente** (`/dashboard/modulo/cliente`, `/cliente-portal/app`,
  `/cliente-portal-admin/link`): como o cliente entra (CPF, senha, link); o
  que ele vê (compras, notas, boletos, OS, saldo de cashback); se abre chamado
  de OS por ali (hipótese levantada no arquivo 14); o que o comerciante
  configura; como o link é divulgado (QR, WhatsApp). **Não fazer login no app
  do cliente.**
- **Fiscais** (`/manifestacao-nfe`, `/mdfe`, `/cte`, `/producao/sped-bloco-k`,
  `/cfops`, `/cfop-conversoes`, `/fiscal-series`): a lista de perguntas já
  está em `13-fiscal.md`, seção 7.3. **Não clicar em Manifestar, Emitir,
  Transmitir, Encerrar, Gerar nem Baixar.**

## Pendências

1. **Decidir se libera a navegação** (ver "O que você pode fazer"). Só você
   pode fazer isso.
2. **Conferir os termos de uso da Olímpia.**
3. **Rodar de novo o lote 12** e trocar este arquivo pelo relatório completo.
4. Os arquivos 12 e 13 têm estas mesmas rotas pendentes. Uma liberação serve
   para todos.
