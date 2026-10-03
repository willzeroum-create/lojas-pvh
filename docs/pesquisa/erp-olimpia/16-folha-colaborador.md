# 16 — Folha de pagamento, portal do colaborador e assinatura eletrônica

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03. Nenhuma tela deste grupo
> abriu. Este arquivo não descreve o ERP Olímpia: nada aqui foi visto no sistema
> e nada foi inventado. As perguntas no fim são só um roteiro para a próxima vez.

## Em palavras simples

1. **O seu login está certo.** Você não precisa mandar a credencial de novo.
   A conta "Boi Criolo" continua logada no navegador embutido.
2. **Quem barrou foi o filtro de segurança automático do Claude Code** (o modo
   de permissões "Auto"). Ele não deixou o navegador abrir o site da Olímpia.
3. O filtro deu o motivo **"Third-Party Attack"** (algo como "ataque a
   terceiro"). Quer dizer: ele achou que abrir e vasculhar o sistema de outra
   empresa, por ordem de um script, pode prejudicar essa empresa ou não ter sido
   pedido diretamente por você.
4. Quando esse filtro diz "não", o Claude não pode tentar por outro caminho
   (outra aba, outro navegador, outra ferramenta). Por isso parei.
5. Mandar a credencial de novo ou repetir a mensagem não muda nada: o bloqueio
   não é do login, é da permissão.

## O que aconteceu, passo a passo

1. Abri uma aba só minha no navegador embutido. A sua aba não foi tocada.
2. Mandei abrir a primeira rota do grupo: `/dashboard/modulo/folha`.
3. O filtro recusou antes de a página carregar.
4. As outras 17 rotas não foram tentadas, porque a recusa vale para o site
   inteiro, e não só para aquela página.
5. Fechei a minha aba. No ERP nada foi lido, clicado, digitado ou gravado.
6. Conferi as configurações do Claude Code: hoje não existe nenhuma regra que
   libere o navegador embutido. Por isso o filtro decide sozinho, e decidiu "não".

## Como destravar (você escolhe UMA)

### Jeito 1: você aprova na hora (o mais simples)

1. Perto da caixa onde você escreve para o Claude, troque o modo de permissões
   de **"Auto"** para o modo que **pergunta antes de agir**. (No terminal,
   `Shift+Tab` troca o modo.)
2. Peça para rodar de novo o grupo 16.
3. Quando aparecer o pedido para abrir `erp.olimpiasistemas.com.br`, clique em
   **"Permitir"**. Se aparecer a opção de permitir sempre nesta sessão, escolha
   essa, para não ter de clicar em cada tela.

### Jeito 2: liberar de uma vez nas configurações

1. Digite `/permissions` na conversa.
2. Na lista **"Allow"** (permitir), adicione a regra `mcp__Claude_Browser`
   (vale para todas as ferramentas do navegador embutido).
3. Peça para rodar de novo o grupo 16.

Atenção: o jeito 2 deixa o Claude usar o navegador embutido em **qualquer
site** sem perguntar, e não só na Olímpia. Depois do levantamento, dá para
apagar a regra.

Antes de liberar, vale confirmar que os termos de uso da Olímpia permitem esse
tipo de levantamento feito com a sua conta.

## Rotas deste grupo

| Rota | Estado |
| --- | --- |
| `/dashboard/modulo/folha` | tentada; recusada pelo filtro antes de abrir |
| `/folha` | não tentada (mesmo bloqueio) |
| `/folha/processamento` | não tentada (mesmo bloqueio) |
| `/folha/competencias` | não tentada (mesmo bloqueio) |
| `/folha/holerites` | não tentada (mesmo bloqueio) |
| `/folha/relatorios` | não tentada (mesmo bloqueio) |
| `/folha/relatorios/ficha-financeira` | não tentada (mesmo bloqueio) |
| `/folha/ferias` | não tentada (mesmo bloqueio) |
| `/folha/rescisao` | não tentada (mesmo bloqueio) |
| `/folha/eventos` | não tentada (mesmo bloqueio) |
| `/folha/rh/organizacao` | não tentada (mesmo bloqueio) |
| `/folha/beneficios` | não tentada (mesmo bloqueio) |
| `/folha/config` | não tentada (mesmo bloqueio) |
| `/dashboard/modulo/colaborador` | não tentada (mesmo bloqueio) |
| `/colaborador/app` | não tentada (mesmo bloqueio) |
| `/colaborador-admin/comunicados` | não tentada (mesmo bloqueio) |
| `/colaborador-admin/solicitacoes` | não tentada (mesmo bloqueio) |
| `/assinatura-admin` | não tentada (mesmo bloqueio) |

## O que a próxima exploração precisa responder

São perguntas, não respostas. Nada abaixo foi visto no ERP.

### Folha de pagamento

- **Hub do módulo:** que telas aparecem e em que ordem o sistema sugere o
  trabalho do mês?
- **Competências:** como se abre e se fecha um mês de folha? Que estados existem
  (aberta, calculada, fechada)? Dá para reabrir um mês fechado?
- **Processamento:** que tipos de cálculo existem (mensal, adiantamento, 13º
  salário, férias, rescisão)? Calcula um colaborador, um setor ou todos? Mostra
  uma prévia antes de gravar?
- **Eventos (rubricas):** que campos tem cada evento (código, nome, provento ou
  desconto, valor fixo, percentual ou fórmula, incidência de INSS, FGTS e IRRF)?
  Vem uma lista padrão pronta?
- **Holerites:** como são gerados e entregues (PDF, portal do colaborador,
  WhatsApp, e-mail)? Há confirmação de recebimento ou assinatura?
- **Relatórios e ficha financeira:** que relatórios existem (resumo da folha,
  encargos, líquido por banco)? A ficha financeira mostra o acumulado do ano por
  evento e por colaborador?
- **Férias:** controla período aquisitivo e concessivo, venda de dias (abono),
  adicional de 1/3, aviso e recibo?
- **Rescisão:** que tipos de desligamento existem? Calcula aviso prévio, verbas
  rescisórias e multa do FGTS? Gera os documentos da rescisão?
- **RH / organização:** departamentos, cargos, centros de custo, hierarquia?
  Como isso se liga ao cadastro de colaboradores e cargos (grupo 08)?
- **Benefícios:** que tipos existem (vale-transporte, vale-refeição ou
  alimentação, plano de saúde)? O desconto entra sozinho na folha?
- **Configurações:** onde ficam as tabelas de INSS, IRRF, salário-família e
  salário mínimo, os dados do empregador, o sindicato e o dia de pagamento?
- **Integrações:** há envio ao eSocial, FGTS Digital ou DCTFWeb? Arquivo do banco
  para pagar salários? Exportação para o contador?

### Portal do colaborador

- **Hub e app (`/colaborador/app`):** como o colaborador entra (link, CPF,
  senha, app instalável)? O que ele vê (holerites, férias, comunicados,
  solicitações)?
- **Comunicados:** quem envia, para quem (todos, um setor, uma pessoa)? Há
  confirmação de leitura?
- **Solicitações:** que pedidos o colaborador pode fazer (férias, adiantamento,
  atestado, troca de dados)? Quem aprova e que estados o pedido percorre?

### Assinatura eletrônica

- **`/assinatura-admin`:** que documentos se assinam (holerite, contrato, aviso
  de férias, rescisão)? Quem assina? Que estados o documento tem? Guarda prova
  da assinatura (data, IP, localização, foto)? É um serviço próprio ou de
  terceiros?

## Pendências

- Todo o grupo 16 (18 rotas) está por explorar.
- Para destravar é preciso uma decisão sua sobre as permissões do Claude Code
  (jeito 1 ou jeito 2 acima). A credencial e o login já estão certos.
- Depois de destravar, rodar de novo só o grupo 16 e substituir este arquivo
  pelo resultado real.
