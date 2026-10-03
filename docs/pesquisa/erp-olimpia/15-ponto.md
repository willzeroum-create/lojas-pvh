# 15 — Ponto eletrônico (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03.
> Nenhuma tela do módulo de ponto chegou a abrir. Este arquivo **não descreve
> o ERP**. Ele explica o bloqueio em palavras simples, diz como destravar e
> deixa pronta a lista do que olhar quando a exploração for repetida.
> Nada aqui é constatação sobre o sistema do Olímpia.

## O que aconteceu, bem simples

1. **A senha não é o problema.** O login já está feito no navegador. Você
   **não precisa mandar credencial nenhuma**, nem agora nem depois.
2. **Quem barrou foi o próprio Claude Code.** Ele tem um vigia automático (o
   "modo automático") que confere cada ação antes de ela acontecer.
3. Eu pedi ao navegador para abrir
   `https://erp.olimpiasistemas.com.br/ponto/dashboard`. O vigia disse **não**
   antes de a página carregar.
4. O motivo dado por ele foi "Third-Party Attack" (ataque a terceiros). Em
   outras palavras: o site é de **outra empresa** e a tarefa é estudar o
   sistema dela a fundo para construir um parecido. O vigia não aceita isso
   sozinho e quer que **você** decida.
5. Quando o vigia diz não, eu **não posso insistir**: nem tentar de novo, nem
   usar outra aba, outro navegador ou outra ferramenta. Por isso não abri as
   outras 11 rotas, que são todas do mesmo site.
6. Fechei a minha aba. No ERP nada foi lido, clicado, digitado ou gravado.

**Comparação:** a chave do apartamento (o login) está certa. Quem não deixou
entrar foi o porteiro do prédio. Fazer outra chave não adianta. Só o morador
(você) pode dizer ao porteiro "pode deixar subir".

## Como liberar (escolha uma opção)

**Opção 1: aprovar na hora (a mais simples)**

1. Rode de novo a exploração do grupo 15 com o **modo automático desligado**
   (modo normal de permissões).
2. Quando aparecer o pedido para abrir o site `erp.olimpiasistemas.com.br`,
   clique em **Permitir**.

**Opção 2: deixar liberado nas configurações**

1. Nas permissões do Claude Code (comando `/permissions`), acrescente uma regra
   de **permitir** para a ferramenta `mcp__Claude_Browser__navigate`.
2. Atenção: essa regra libera o navegador embutido para **qualquer site**, não
   só para o Olímpia.

Eu não mudo permissões nem configurações por conta própria. A escolha é sua,
incluindo a decisão de estudar o sistema de outra empresa (se tiver dúvida,
vale conferir o que os termos de uso do Olímpia dizem sobre esse uso da conta).

Depois de liberar, rode o grupo 15 de novo. Este arquivo deve então ser
substituído pelo relatório completo.

## Rotas do grupo

| Rota | Estado |
| --- | --- |
| `/ponto/dashboard` | não abriu: o vigia recusou a navegação |
| `/dashboard/modulo/ponto` | não tentada (mesmo site, mesma recusa) |
| `/ponto/espelho` | não tentada (mesmo site, mesma recusa) |
| `/ponto/mapa` | não tentada (mesmo site, mesma recusa) |
| `/ponto/auditoria` | não tentada (mesmo site, mesma recusa) |
| `/ponto/fechamento` | não tentada (mesmo site, mesma recusa) |
| `/ponto/justificativas` | não tentada (mesmo site, mesma recusa) |
| `/ponto/config` | não tentada (mesmo site, mesma recusa) |
| `/ponto/feriados` | não tentada (mesmo site, mesma recusa) |
| `/ponto/locais` | não tentada (mesmo site, mesma recusa) |
| `/ponto/link` | não tentada (mesmo site, mesma recusa) |
| `/ponto/relogio` | não tentada (mesmo site, mesma recusa) |

Sub-rotas descobertas: nenhuma.

## O que a próxima passagem precisa responder

São **perguntas**, não constatações. O "provável objetivo" de cada tela é um
palpite tirado só do nome da rota e precisa ser confirmado na tela.

As referências à lei servem para saber o que procurar. Não dizem nada sobre o
que o Olímpia faz ou deixa de fazer.

### Visão geral (`/dashboard/modulo/ponto` e `/ponto/dashboard`)

- Provável objetivo: página de entrada do módulo e painel do dia.
- Que indicadores o painel mostra (presentes agora, atrasos, faltas, horas
  extras, saldo de banco de horas, marcações pendentes)? Há gráficos? De que
  período?
- Que itens de menu o módulo tem e se existem telas além das 12 desta lista.
- Por que há duas entradas (`/dashboard/modulo/ponto` e `/ponto/dashboard`):
  mostram a mesma coisa ou coisas diferentes?
- Quem é o "colaborador" do ponto: o mesmo cadastro de pessoas/usuários do ERP
  (grupo 08) ou um cadastro próprio? Onde ficam jornada, escala, CPF/PIS,
  departamento e local de trabalho?
- O módulo se apresenta como ponto por programa (REP-P, Portaria MTP nº
  671/2021)? Mostra registro do programa no INPI, atestado técnico ou termo de
  responsabilidade?
- Que perfis de acesso aparecem (dono, gestor, RH, o próprio colaborador) e o
  que cada um pode ver ou mudar.

### Espelho de ponto (`/ponto/espelho`)

- Provável objetivo: folha do período por colaborador, dia a dia.
- Colunas por dia (marcações, horas trabalhadas, extras, noturnas, faltas,
  atrasos, saldo) e totais do período.
- Filtros (colaborador, período, departamento, local).
- Como se corrige um dia: incluir marcação, desconsiderar marcação, abonar.
  A marcação original continua guardada e visível? (A Portaria 671 veda
  alterar ou apagar o que o empregado registrou; ela também veda restringir a
  marcação, marcar automaticamente e exigir autorização prévia para hora
  extra. Conferir como o Olímpia trata cada um desses pontos.)
- Aplica a tolerância de 5 minutos por marcação, com no máximo 10 por dia
  (CLT art. 58, §1º)? É configurável?
- Calcula trabalho noturno (22h às 5h) com hora reduzida de 52min30s e
  adicional (CLT art. 73)?
- Assinatura do espelho pelo colaborador (eletrônica?), impressão e
  exportação (PDF, planilha).
- Que ações existem e quais gravam algo (essas não devem ser clicadas).

### Mapa (`/ponto/mapa`)

- Provável objetivo: mostrar no mapa onde cada marcação foi feita.
- Que serviço de mapa usa; se desenha a cerca (raio) de cada local; se
  destaca marcações feitas fora do local.
- Filtros (data, colaborador, local) e o que aparece ao clicar num ponto.

### Auditoria (`/ponto/auditoria`)

- Provável objetivo: histórico de quem mudou o quê.
- Que eventos ficam registrados (inclusão ou desconsideração de marcação,
  abono, fechamento, reabertura, mudança de configuração, acesso)?
- Colunas (data e hora, usuário, colaborador afetado, valor antes e depois,
  motivo), filtros e exportação.

### Fechamento (`/ponto/fechamento`)

- Provável objetivo: fechar o período (mês) e travar alterações.
- Estados do período (aberto, fechado, reaberto?) e quem pode fechar ou
  reabrir.
- O que o fechamento calcula e produz: totais para a folha, saldo de banco de
  horas, relatórios, arquivos AFD e AEJ (os arquivos que a Portaria 671 exige
  apresentar à fiscalização).
- Exporta para folha de pagamento ou contabilidade? Em que formato ou layout?
- Não clicar em fechar, reabrir, gerar nem exportar.

### Justificativas (`/ponto/justificativas`)

- Provável objetivo: motivos de ausência (atestado, folga, falta justificada)
  e/ou pedidos feitos pelos colaboradores.
- Campos do motivo (nome, abona horas ou não, exige anexo, conta como falta?).
- Se o colaborador envia a justificativa (com foto do atestado) e o gestor
  aprova ou recusa; estados do pedido.
- Atestado médico é dado de saúde, ou seja, dado pessoal sensível pela LGPD
  (art. 5º, II): ver quem consegue abrir os anexos.
- Não aprovar, recusar nem excluir nada.

### Configurações (`/ponto/config`)

- Jornadas e escalas (fixa, 12x36, flexível), intervalo pré-assinalado (CLT
  art. 74, §2º) e tolerâncias.
- Regras de hora extra (percentuais, por exemplo 50% e 100%, e limites) e de
  banco de horas (prazo de compensação: no mesmo mês, até 6 meses por acordo
  individual escrito, até 1 ano por acordo ou convenção coletiva — CLT
  art. 59).
- Alertas de descanso entre jornadas menor que 11 horas (CLT art. 66) e de
  intervalo fora de 1 a 2 horas em jornada acima de 6 horas, ou menor que
  15 minutos entre 4 e 6 horas (CLT art. 71).
- O que se exige na marcação: foto, reconhecimento facial, localização, cerca
  virtual, aparelho autorizado.
- Como o colaborador recebe o comprovante de cada marcação (tela, e-mail,
  WhatsApp, download).
- Ler cada opção de cada select; não mudar nenhum interruptor.

### Feriados (`/ponto/feriados`)

- Lista (data, nome, tipo: nacional, estadual, municipal, ponto facultativo) e
  se vem pré-carregada por UF ou município.
- Se o feriado é ligado a um local ou filial e como muda o cálculo (trabalho
  em feriado sem folga compensatória é pago em dobro — Lei 605/1949, art. 9º).
- Campos do formulário "Novo" (abrir, ler e fechar sem gravar).

### Locais (`/ponto/locais`)

- Provável objetivo: lugares onde o ponto pode ser batido.
- Campos (nome, endereço, latitude e longitude, raio em metros, ativo) e como
  se marca o lugar (mapa, busca de endereço).
- Se o colaborador é ligado a um ou mais locais e o que acontece com marcação
  fora do raio (bloqueia ou só sinaliza).

### Link de ponto (`/ponto/link`)

- Provável objetivo: endereço para o colaborador bater o ponto pelo celular
  ou pelo navegador.
- O link é um só para a empresa ou um por colaborador? Como o colaborador se
  identifica (CPF, PIN, senha, foto)?
- Tem validade? Dá para trocar por outro? Não clicar em gerar, renovar nem
  enviar.
- **Não abrir o link para testar**: pode registrar uma marcação de verdade.

### Relógio (`/ponto/relogio`)

- Provável objetivo: modo quiosque (tablet ou computador na entrada) para
  bater o ponto.
- Como identifica o colaborador (teclado numérico, crachá/QR, rosto)? Usa a
  câmera?
- Mostra comprovante na tela? Funciona sem internet e sincroniza depois?
- **Não bater ponto.** Se o navegador pedir câmera ou localização, recusar.

## Fluxo de ponta a ponta

Não observado. Hipótese para validar tela por tela:

configurar (jornadas, tolerâncias, feriados, locais) → colaborador marca no
relógio ou pelo link → sistema confere local e foto e emite comprovante →
gestor acompanha no painel e no mapa → faltas e atrasos viram justificativas
(abono, aprovação) → espelho do mês consolida → fechamento trava o período e
gera totais e arquivos → auditoria guarda cada alteração.

## Entidades e relações

Nenhuma foi observada. Lista de checagem para a próxima passagem (nomes
provisórios): colaborador, jornada/escala, marcação, comprovante, local
(cerca), aparelho/relógio, link de ponto, feriado, motivo de justificativa,
pedido de justificativa, período/fechamento, banco de horas, registro de
auditoria.

## Integrações

Nenhuma foi observada. Conferir: mapas e localização, câmera e
reconhecimento facial, envio de comprovante (e-mail, WhatsApp), relógios
físicos (importação de AFD), exportação para folha de pagamento ou
contabilidade, geração de AFD e AEJ para a fiscalização.

Biometria (rosto) também é dado pessoal sensível pela LGPD (art. 5º, II):
ver se a tela pede consentimento ou informa a finalidade.

## Observações de UX

Nenhuma: nenhuma tela foi vista.

## Pendências

1. Liberar a navegação para `erp.olimpiasistemas.com.br` (decisão do usuário;
   ver "Como liberar"). Não é preciso mandar senha nem credencial.
2. Depois de liberado, explorar as 12 rotas e as sub-rotas que aparecerem,
   respondendo às perguntas acima.
3. Cuidados na próxima passagem: não bater ponto em `/ponto/relogio` nem pelo
   link de `/ponto/link`; recusar pedidos de câmera e localização; não fechar
   nem reabrir período; não aprovar nem recusar justificativas; não gerar,
   renovar ou enviar link; não gerar nem exportar arquivos; não mudar
   configurações.
4. Substituir este arquivo pelo relatório completo, com as seções: visão
   geral; uma seção por tela; fluxos; entidades e relações; integrações;
   observações de UX; pendências.
