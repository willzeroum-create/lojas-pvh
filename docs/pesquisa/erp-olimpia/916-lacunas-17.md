# 916 — Lacunas, lote 17: Termos de Uso, Utilitários (Novidades e Log de Alterações), Comissão por metas e Central de Relatórios (ERP Olímpia)

> **Estado: explorado. As 12 rotas foram abertas e lidas; 3 leituras por script foram recusadas.**
> Data: 2026-10-03. Conta de teste "Boi Criolo" (plano Full), com a sessão já aberta no
> navegador embutido.
>
> - **Limite principal: a conta quase não tem dados.** Não há produtos, grupos,
>   vendedores, vendas nem metas. Só existem o cliente padrão "Consumidor final" e o
>   fabricante padrão "PADRAO". Nenhum relatório foi gerado, porque o botão "Gerar" está
>   na lista de proibidos desta pesquisa. Por isso não foi visto o resultado de nenhum
>   relatório (colunas, totais e botões de exportação).
> - **A trava automática do Claude Code (modo automático) recusou 3 leituras por script**,
>   sempre com o motivo "Third-Party Attack":
>   1. em `/sistema-melhorias`: ler os campos e os links do filtro;
>   2. uma segunda consulta ao catálogo de menu que o próprio ERP guarda na sessão do
>      navegador, à procura do manual e de telas sobre prêmios e comissões;
>   3. em `/relatorios/vendas-por-vendedor-produto`: ler os nomes técnicos dos filtros.
>
>   Depois de cada recusa, aquele objetivo foi abandonado e não houve nova tentativa por
>   outro caminho. As três telas já tinham sido lidas antes pelo texto visível (e, nas
>   duas telas de rota, também pela árvore de acessibilidade). Por isso entram neste
>   relatório, com as lacunas indicadas.
>
> Marcação usada: **[visto]** apareceu na tela, na árvore de acessibilidade ou no
> formulário da própria página; **[deduzido]** conclusão direta do que foi visto;
> **[a verificar]** hipótese, não confirmada no ERP.

## Em palavras simples

1. **As 12 telas abriram já logadas.** Não foi preciso login nem senha.
2. **"Termos de Uso"** mostra o contrato que a empresa aceitou dentro do sistema. Ficam
   guardados a data, a hora, o usuário, o IP, o navegador e um código de integridade
   (hash) do texto aceito. É uma boa prática para copiarmos.
3. **"Utilitários" tem só duas telas.** "Novidades" é a lista de mudanças que a Olímpia
   publica no sistema. "Log de alterações" mostra quem mudou o quê, com o antes e o
   depois de cada registro.
4. **"Comissão por metas"** cria uma meta para um período, com prêmios para o 1º, o 2º e
   o 3º colocados. Como não há metas nem vendas, não deu para ver o cálculo.
5. **A "Central de relatórios" tem 132 relatórios.** Todos seguem o mesmo padrão:
   filtros e um botão "Gerar", com saída em PDF, Excel e CSV. A página de entrada do
   módulo e o menu mostram só 78 deles; os outros 54 só se acham pela Central.
6. **"Processamentos" ainda é uma página sem conteúdo.** A Olímpia diz que ali vai
   funcionar uma fila para relatórios grandes.
7. **A trava de segurança do Claude Code disse "não" 3 vezes** a leituras feitas por
   script. O agente respeitou cada recusa e seguiu com as outras telas. Liberar ou não
   é decisão sua (ver "Pendências").
8. **Nada foi gravado, enviado ou alterado no ERP.**

## Registro técnico

- Aba própria no navegador embutido (`tab-49`), fechada no fim. Nenhuma outra aba foi
  usada.
- Leitura feita com o texto da página, a árvore de acessibilidade e capturas de tela.
  Nos Termos de Uso, o conteúdo da página e do detalhe também foi lido por script. Em
  `/comissoes/metas`, `/relatorios/produtos-vendidos`,
  `/relatorios/vendas-vendedor-modalidade` e `/relatorios/vendas-canceladas`, o formulário
  também foi inspecionado por script: ação, método, nomes e obrigatoriedade dos campos.
- O catálogo de menu que o ERP guarda na sessão do navegador foi lido uma vez, com
  permissão. Essa leitura deu a lista de relatórios e os itens dos módulos Parâmetros,
  Mensalidades e Utilitários. A segunda leitura, com outro objetivo, foi recusada (ver
  acima).
- A página de impressão do aceite (`/meus-termos/{uuid}/imprimir`) foi lida pelo HTML,
  com um pedido de leitura (GET), para não abrir a janela de impressão do navegador.
- Filtros usados, sem gravar nada: categoria "Comissões" e busca "vendedor" na Central;
  data inicial recuada para 01/01/2025 no Log de alterações.
- Janelas de pesquisa (lupa) abertas e fechadas com Esc: Pessoa, Colaborador/Vendedor,
  Produto, Fabricante e Grupo de produto.
- **Não foram clicados:** "Gerar" (nos 4 relatórios), "Criar meta", "Cadastrar novo"
  (dentro das janelas de pesquisa), "Adicionar aos atalhos" (estrela dos cartões) e
  "Imprimir" (na página de impressão).
- **Dados omitidos:** CNPJ da conta, IP e navegador de quem aceitou os termos, UUID e
  hashes do aceite. Uma listagem dos scripts da página de detalhe do aceite trouxe, sem
  intenção, um token de segurança da sessão (anti-CSRF) no resultado. Ele não foi
  registrado nem usado.

---

## 1. Visão geral do lote

As 12 rotas formam quatro blocos, que no ERP ficam em lugares diferentes do menu:

| Bloco | Rotas | Onde fica no menu [visto] |
|---|---|---|
| Conta com a Olímpia | `/meus-termos` | módulo "Mensalidades", junto de "Minhas faturas" (`/minha-assinatura`) e "Meu Plano" (`/meu-plano`). Também é um cartão do hub Parâmetros. |
| Utilitários | `/dashboard/modulo/utilitarios`, `/sistema-melhorias`, `/sistema-log-alteracoes` | módulo "Utilitários", grupo "Suporte & Auditoria". "Novidades" também fica no cabeçalho de todas as telas. |
| Comissões | `/comissoes/metas` | módulo "Relatórios", grupo "Comissões" (primeiro item) |
| Relatórios | `/dashboard/modulo/relatorios`, `/relatorios`, `/relatorios/processamentos` e 4 relatórios de vendas | módulo "Relatórios" |

### 1.1 O que este lote revela sobre a arquitetura

- **Motor de relatórios genérico [visto/deduzido].** Todos os relatórios usam a mesma
  rota `/relatorios/{slug}`. No menu, o nome interno da rota é o mesmo para todos
  (`relatorios.show`). Cada relatório tem um formulário de leitura (GET) com um campo
  oculto `executar=1` e os filtros. O período padrão vai do dia 1 do mês até hoje. Os
  132 relatórios estão num catálogo com categoria, descrição, número de filtros e
  formatos de saída.
- **O ERP web é uma migração de um ERP de desktop feito em Delphi [visto].** Há
  relatórios descritos como "estilo Delphi" e um que cita uma tela do sistema antigo
  ("Delphi FrmRelatorio"). A tela de Novidades se chama "changelog da migração web" e
  cita ajustes feitos para ficar igual ao código Delphi.
- **Provável banco de dados por cliente (tenant) [deduzido].** Os registros de Novidades
  trazem `id_empresa: 1`, mas o aceite dos termos registra o "código da empresa" 54. Os
  registros de Novidades são gravados pelo próprio sistema (usuário "WEB", IP 127.0.0.1)
  e aparecem no log de auditoria desta conta. Isso sugere que cada cliente tem o seu
  banco e que as Novidades são copiadas para cada um a cada atualização.
- **Horário [visto].** O banco guarda o horário em UTC (15:24:50 no registro) e a tela
  mostra o horário local, UTC−4, de Porto Velho (11:24:50).
- **Elementos globais [visto].** Os mesmos dos outros lotes: busca de telas (Ctrl+K),
  "Novidades", tema visual, notificações, menu do usuário ("ADMIN") e um assistente de
  conversa. O exemplo de pergunta do assistente é sobre como emitir NFS-e. O código da
  página verifica de tempos em tempos se há avisos novos em 7 frentes: WhatsApp, loja
  virtual, cardápio digital, ordens de serviço, Mercado Livre, manifestação de NF-e e
  baixa de boletos. Nenhum desses endereços foi chamado.

---

## 2. Telas

### 2.1 `/meus-termos`: Termos de Uso

**Objetivo [visto]:** mostrar o histórico dos Termos de Uso e Licença que a empresa
aceitou eletronicamente. A tela é só de consulta: não tem filtros, paginação nem botão
"Novo".

**Layout [visto]:**

- Título "Termos de Uso" e uma frase explicando a tela.
- **Cartão "Termo vigente":** versão (1.1), data e hora da publicação (07/08/2026
  16:42:26) e um selo verde "ACEITO".
- **Tabela "Aceites registrados":**

| Coluna | Conteúdo visto |
|---|---|
| Versão | 1.1 |
| Data do aceite | 03/10/2026 10:08:45 |
| Responsável | ADMIN |
| CNPJ registrado | CNPJ da conta, só números, sem máscara (omitido aqui) |
| Status | selo "ACEITO" |
| Ações | "Ver" (detalhe) e "Imprimir" (abre noutra aba) |

**Regras e comportamento:**

- Há uma linha por aceite e por versão. O cartão do topo mostra se a versão em vigor já
  foi aceita [visto]. Se sair uma versão nova sem aceite, o selo deve mudar para algo
  como "pendente" [a verificar].
- O aceite foi feito no mesmo dia desta pesquisa, às 10:08. Isso indica que o sistema
  pede o aceite no acesso, antes do uso [deduzido; a tela de aceite não foi vista
  porque a conta já tinha aceitado].

#### Sub-rota `/meus-termos/{uuid}`: Detalhe do aceite [visto]

- Título "Detalhe do aceite", com os botões "Imprimir" (nova aba) e "Voltar".
- **Cartão "Registro eletrônico do aceite":** empresa (razão social), nome fantasia,
  "CNPJ (na época)", responsável, usuário/login, data e hora com segundos, IP (IPv6),
  versão com o selo "ACEITO (vigente)", UUID do aceite e hash SHA-256.
- **Cartão "Conteúdo exato aceito":** o texto inteiro dos termos (cerca de 22 mil
  caracteres, 38 cláusulas), escrito em Markdown e mostrado formatado numa caixa com
  rolagem. No fim do texto há um bloco preenchido automaticamente no momento do aceite:
  empresa, CNPJ, código interno da empresa, responsável, login, ID do usuário, data,
  hora, IP, navegador e dispositivo (user agent), versão, "hash do termo" e ID único do
  aceite, além dos dados da Olímpia.
- **Duas impressões digitais diferentes [visto]:** o SHA-256 do cartão de registro é
  diferente do "hash do termo" escrito no texto. O mais provável é que um seja do modelo
  da versão e o outro do texto já preenchido com os dados do aceite [deduzido].
- O campo "CNPJ (na época)" guarda o CNPJ do momento do aceite. Assim, o comprovante não
  muda se o cadastro da empresa mudar depois [deduzido].

#### Sub-rota `/meus-termos/{uuid}/imprimir`: comprovante para impressão [visto pelo HTML]

- Página sem o menu do ERP, com dois botões: "Imprimir" (abre a impressão do navegador)
  e "Fechar" (fecha a janela). A impressão não começa sozinha.
- Mostra um título de comprovante, a identificação da Olímpia, os mesmos dados do
  registro (empresa, CNPJ, responsável, usuário, data e hora, IP, versão, UUID e
  SHA-256) e o texto aceito.
- **Defeito:** o texto aceito aparece em Markdown cru, dentro de um bloco de texto
  pré-formatado. O papel sai com os símbolos `#` e `**` à mostra.

#### O que os termos dizem (resumo com palavras nossas)

As 38 cláusulas tratam de:

- identificação das partes, objeto, licença de uso (o cliente não compra o software) e
  propriedade intelectual;
- o aceite e o seu registro;
- assinatura mensal, serviços extras e inadimplência;
- responsabilidades do cliente: dados, parte fiscal e tributária, documentos fiscais,
  certificado digital, usuários e senhas, funcionários, equipamentos e internet;
- integrações de terceiros, disponibilidade, backup, LGPD, suporte, atualizações, IA e
  automações, uso proibido, responsabilidades e limites de responsabilidade, resultados
  do negócio;
- cancelamento, dados após o cancelamento, mudança de planos e preços, customizações,
  confidencialidade, alteração dos termos, contratos específicos e lei aplicável.

Pontos que importam para o nosso produto:

- **Como se aceita:** o usuário marca uma opção de "li e aceito" e confirma. Ao aceitar,
  declara que tem poderes para aceitar em nome da empresa.
- **O que fica registrado:** razão social, CNPJ, código interno da empresa,
  identificação, nome e login do usuário, data e hora, IP, navegador e dispositivo,
  versão, texto integral, identificador único e hash de integridade.
- **Novas versões:** cada versão tem identificação própria. Uma mudança relevante pode
  exigir novo aceite, e o histórico das versões anteriores é mantido.
- **Preço:** a mensalidade pode variar por plano, número de usuários, empresas, módulos,
  terminais, funções, armazenamento, integrações, volume de uso e serviços extras. O
  preço é modular, como queremos.
- **Inadimplência:** pode levar a aviso de cobrança, restrição de funções, suspensão do
  acesso ou da licença e cancelamento. Para reativar, é preciso pagar o que está em
  atraso.
- **Backup e cancelamento:** o backup não substitui a obrigação legal do cliente de
  guardar os seus documentos fiscais. Antes de encerrar, o cliente deve exportar os seus
  dados, "quando houver recurso". Depois do prazo legal, os dados podem ser apagados ou
  anonimizados.
- **IA e automações:** os resultados podem ter erros e o cliente deve conferir antes de
  decidir.

---

### 2.2 `/dashboard/modulo/utilitarios`: hub Utilitários

**Objetivo [visto]:** página de atalhos do módulo. Não tem lista, filtros nem formulário.

- Faixa escura com o título "Utilitários" e o link "Voltar ao dashboard".
- Um único painel, "Suporte & Auditoria", com 2 cartões:

| Cartão | Destino | Ícone |
|---|---|---|
| Melhorias e Ajustes | `/sistema-melhorias` | estrelas |
| Log de Alterações | `/sistema-log-alteracoes` | diário |

- Cada cartão tem uma estrela "Adicionar aos atalhos" (favoritos do menu). Não foi
  clicada, porque muda uma preferência.
- **Resposta à pergunta do arquivo 18:** este módulo não tem importação, exportação,
  backup, reprocessamento nem limpeza de dados. São só estas duas telas [visto].

---

### 2.3 `/sistema-melhorias`: Melhorias e Ajustes (Novidades)

> Leitura parcial: só o texto visível. A leitura do filtro por script foi recusada pela
> trava de segurança e não foi refeita por outro caminho.

**Objetivo [visto]:** é o registro de mudanças (changelog) que a Olímpia publica:
recursos novos, melhorias, ajustes e correções. O subtítulo diz que é o changelog da
migração web e que os registros são automáticos. O botão "Novidades" do cabeçalho leva
para esta tela.

**Filtros [visto no texto]:** "De" e "Até" (datas); "Tipo", com as opções Todos, Novo
recurso, Melhoria, Ajuste e Correção; "Módulo"; "Busca"; botão "Filtrar". Não foi
confirmado se "Módulo" e "Busca" são texto livre ou lista, nem se há paginação.

**Lista (cartões em linha do tempo) [visto]:** cada cartão tem:

- selo do tipo (Correção, Melhoria, Ajuste);
- etiqueta do módulo (vistos: INTERFACE, CADASTRO, PDV, SISTEMA, PESSOA, FISCAL);
- versão no formato ano.mês (v2026.10);
- data e autor (todos "03/10/2026 · MIGRAÇÃO");
- título e descrição, tudo em maiúsculas.

**Campos do registro [visto no detalhe do log, ver 2.4]:** `id`, `id_empresa`, `tipo`
(ex.: `correcao`), `modulo`, `titulo`, `descricao`, `versao`, `autor`, `status`, `data`,
`data_hora`.

**Comportamento:**

- Na primeira visita havia 13 registros, todos de 03/10/2026, entre 08:58 e 11:24. No fim
  da sessão o log já mostrava 15: dois entraram às 11:33 e às 11:36. A Olímpia publica
  várias mudanças por dia, gravadas pelo próprio sistema a cada atualização [visto/deduzido].
- Para o cliente, a tela é só de leitura. No texto visível não há botão para sugerir uma
  melhoria, votar ou comentar [visto]. Não é um canal de pedidos dos clientes.

**O que as 13 entradas revelam do produto (resumo):**

- **Cadastro público (autoatendimento), 7 entradas:** a validação é feita por código de
  uso único (OTP), primeiro por e-mail (SMTP) e depois por WhatsApp. O telefone é
  validado como celular brasileiro, com +55, e aceito com ou sem o nono dígito. Dá para
  editar os contatos e reenviar o código em cada etapa. O WhatsApp sai pela API do
  "Olimpia Atendimentos" e pelo hub "Hermes".
- **Implantação [visto]:** quando se contrata um plano pago, o sistema cria uma fatura
  de implantação com o mesmo valor da primeira mensalidade e bloqueia a operação até
  essa fatura ser paga.
- **Hub de WhatsApp "Hermes":** usa qualquer linha conectada, alterna entre elas e, se
  uma cair, passa para outra sozinho.
- **Olimpia Bridge (programa local):** converte o PDF da NFC-e para ESC/POS, a linguagem
  das impressoras térmicas, mantendo as margens do cupom (DANFC-e).
- **Super Admin:** existe uma tela interna da Olímpia que lista os clientes (tenants)
  pela data de instalação.
- **Produtor rural (fiscal):** se o cliente estiver marcado como produtor rural, a NF-e
  vai com ele como não contribuinte e consumidor final, mantendo a inscrição estadual.
  A marcação vale nas vendas, nas OS e nas entradas e saídas manuais.

---

### 2.4 `/sistema-log-alteracoes`: Log de Alterações

**Objetivo [visto]:** auditoria do sistema web: inclusões, alterações, inativações e
outras ações, com o antes e o depois de cada registro.

**Filtros [visto]:**

| Campo | Tipo | Padrão / opções |
|---|---|---|
| De | data | hoje menos 7 dias (26/09/2026) |
| Até | data | hoje |
| Módulo | texto livre | exemplo no campo: "Produto" |
| Tabela | texto livre | exemplo no campo: "produto" |
| Ação | lista | Todas; Inclusão (`create`); Alteração (`update`); Estoque no cadastro (`ajuste_estoque_cadastro`); Inativação (`inactivate`); Exclusão (`delete`); Lançamento (`lancamento`); Baixa (`baixa`) |
| ID | texto | número do log |

Botão "Filtrar". Nenhum campo obrigatório. Não há botão de exportar nesta tela.

**Colunas [visto]:** ID, Data/Hora, Ação, Módulo, Registro (ID do registro alterado),
Descrição, Usuário, Ver (ícone que abre o detalhe).

**Dados desta conta [visto]:** 15 linhas, todas "Inclusão" do módulo `SISTEMAMELHORIA`
(uma por entrada das Novidades), com usuário "—". Com a data inicial recuada para
01/01/2025, não apareceu mais nada. Ou seja, não há outras alterações auditadas nesta
conta. O aceite dos termos não aparece no log; ele fica na sua própria tabela.

#### Sub-rota `/sistema-log-alteracoes/{id}`: detalhe do log [visto]

Título "Log de alteração #N", a descrição e o botão "Voltar". Campos mostrados:

- Data/Hora (com segundos), Ação, Módulo, Tabela (ex.: `SISTEMA_MELHORIA`), ID registro;
- Usuário ("WEB" quando foi o próprio sistema), IP (127.0.0.1 quando foi um processo do
  servidor), Rota (endereço da página que fez a mudança; aqui, "/");
- **Antes:** o registro em JSON (`null` numa inclusão);
- **Depois:** o registro completo em JSON.

**Regras [deduzido]:**

- A auditoria é genérica, por tabela: guarda uma foto do registro antes e depois, em
  JSON.
- As ações "Estoque no cadastro", "Lançamento" e "Baixa" mostram que também são
  auditados o ajuste de estoque feito na ficha do produto e os lançamentos e baixas do
  financeiro.
- A Central de relatórios tem um relatório "Auditoria de alterações"
  (`auditoria-alteracoes`, 4 filtros, PDF, Excel e CSV). É o mesmo log em forma de
  relatório exportável [visto no catálogo].

---

### 2.5 `/comissoes/metas`: Controle de comissão por metas

**Objetivo [visto]:** segundo o subtítulo, a tela apura as vendas finalizadas, dá
prêmios por faixa e monta o ranking dos colaboradores. Fica no menu Relatórios, grupo
Comissões, mas não é um relatório: é um cadastro com apuração.

**Avisos fixos na faixa do título [visto]:**

- as faixas padrão seguem "a planilha de agosto";
- "Financeiro e Folha" são definidos no cadastro da empresa.

**Formulário "Nova meta" (envio por POST para `/comissoes/metas`) [visto]:**

| Campo | Nome técnico | Tipo | Obrigatório | Valor que já vem preenchido |
|---|---|---|---|---|
| Nome | `nome` | texto | sim | "Meta de vendas" |
| Início | `data_ini` | data | sim | 1º dia do mês (01/10/2026) |
| Fim | `data_fim` | data | sim | último dia do mês (31/10/2026) |
| Prêmio do 1º lugar | `premio_1` | número com centavos (passo 0,01) | não | 300 |
| Prêmio do 2º lugar | `premio_2` | número com centavos (passo 0,01) | não | 200 |
| Prêmio do 3º lugar | `premio_3` | número com centavos (passo 0,01) | não | 100 |

Na tela, os três prêmios ficam numa linha só, sob o rótulo "Prêmios do ranking (1º, 2º
e 3º)". Botão "Criar meta" (não clicado). Não há campo para faixas, colaboradores,
produtos, lojas ou tipo de meta.

**Lista "Metas cadastradas" [visto]:** colunas Meta, Período, Status, Faturamento,
Total prêmios e uma coluna de ações sem título. Vazia ("Nenhuma meta criada").

**Funcionamento provável [a verificar, nada pôde ser visto]:**

- uma meta é só um período com nome e três prêmios de ranking;
- o sistema soma o faturamento das vendas finalizadas (status 1) de cada colaborador no
  período;
- aplica as "faixas padrão" (fixas, vindas da planilha de um cliente) para calcular o
  prêmio de cada um;
- os três primeiros do ranking ganham os prêmios do 1º, do 2º e do 3º lugar;
- a frase sobre "Financeiro e Folha" indica uma ligação com o cadastro da empresa. Pode
  ser onde o prêmio é lançado (conta a pagar ou folha) ou quem participa. Não foi
  possível confirmar.

**Leitura de negócio [deduzido]:** a frase sobre "a planilha de agosto" mostra que a
função foi feita sob medida para um cliente e liberada para todos, sem as faixas
poderem ser configuradas na criação.

---

### 2.6 `/dashboard/modulo/relatorios`: hub Relatórios

**Objetivo [visto]:** página de atalhos do módulo, com a faixa "Relatórios" e "Voltar
ao dashboard".

- **No topo:** "Central de Relatórios" e "Processamentos".
- **8 grupos de cartões, 80 cartões no total:**

| Grupo | Cartões | Observação |
|---|---|---|
| Vendas e clientes | 8 | inclui "Clientes sem comprar" e "Visitas de rota" |
| Financeiro | 13 | receber, pagar, previsão, faturamento por lotes, banco, boletos, PIX |
| Caixa | 5 | caixa com vendedor, conferência cega, histórico, suprimentos, sangrias |
| Estoque e entradas/saídas | 17 | inclui 3 relatórios de compras |
| Fiscal e canais | 9 | NF-e, MDF-e, CT-e, manifestação, Mercado Livre, loja virtual |
| Vendas extras | 12 | mistura liberações, trocas e orçamentos com NFS-e, SPED, ICMS e anúncios do ML |
| Comissões | 8 | o 1º é "Comissão por metas" (`/comissoes/metas`) |
| Ordem de Serviço | 8 | — |

- "Produtos — estoque e valores" aparece duas vezes, em Estoque e em Vendas extras.
  Tirando a repetição, a Central, os Processamentos e a Comissão por metas, sobram
  **78 relatórios distintos**. A Central tem 132.

---

### 2.7 `/relatorios`: Central de Relatórios

**Objetivo [visto]:** catálogo completo de relatórios. O subtítulo promete consultas com
dados reais, filtros, totais, PDF, Excel e impressão.

**Barra de filtros (formulário GET: `/relatorios?q=&categoria=`) [visto e testado]:**

- **"Buscar relatório..." (`q`):** procura no nome e na descrição. Teste com
  "vendedor": vieram 12 relatórios de quatro categorias (Vendas, Caixa, Financeiro,
  Clientes).
- **Categoria (`categoria`):** Todas as categorias; Visão geral (`overview`);
  Movimentações; Vendas; Caixa; Financeiro; Estoque; Compras; Clientes; Fornecedores;
  Produtos; CRM; Fiscal; Comissões; Ordem de Serviço (`os`); Canais digitais
  (`canais`); Produção; Auditoria. Teste com "Comissões": vieram só os 7 relatórios de
  comissão.
- Botão "Filtrar". No canto direito, o botão "Processamentos".

**Cartões [visto]:** grade de 2 colunas, separada por seções de categoria. Cada cartão
tem:

- nome do relatório;
- nome técnico (slug) num selo, por exemplo `vendas-analiticas`;
- descrição de uma linha;
- "N filtros · PDF · Excel · CSV" (todos os 132 têm os mesmos três formatos);
- botão "Abrir relatório", que leva para `/relatorios/{slug}`.

Não há favoritos, relatórios recentes, filtros guardados nem agendamento [visto: nada
disso aparece]. A categoria "Visão geral" está na lista, mas não tem nenhum relatório
na visão "Todas".

#### 2.7.1 Catálogo da Central (132 relatórios)

Coluna "Menu": **sim** quando o relatório também está no hub e no menu lateral; **só
Central** quando só se chega a ele pela Central. As descrições foram resumidas com
palavras nossas.

**Vendas (19)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `vendas-analiticas` | 7 | uma linha por venda: totais, cliente, vendedor, pagamento e documento fiscal | só Central |
| `vendas-por-item` | 6 | uma linha por item vendido | só Central |
| `vendas-por-periodo` | 4 | faturamento e nº de vendas por dia, semana ou mês | só Central |
| `vendas-por-cliente` | 4 | totais por cliente | só Central |
| `vendas-por-vendedor` | 4 | totais por vendedor | só Central |
| `vendas-por-produto` | 4 | quantidade e faturamento por produto | só Central |
| `produtos-vendidos` | 8 | quantidade e total por produto no período (layout do sistema antigo) | sim |
| `vendas-por-vendedor-produto` | 8 | quantidade e total por vendedor e produto (layout do sistema antigo) | sim |
| `vendas-vendedor-modalidade` | 5 | conferência por vendedor: retirada na loja e entrega | sim |
| `positivacao-mix-produtos` | 9 | ranking de vendedores por clientes que compraram o mix de uma ação; cada cliente conta uma vez | sim |
| `vendas-recebimento-por-vendedor` | 4 | valor vendido e % já recebido, com subtotal por vendedor | sim |
| `rota-visitas` | 6 | clientes da rota visitados e não visitados (app de força de vendas) | sim |
| `vendas-por-forma-pagamento` | 4 | totais por forma de pagamento | só Central |
| `vendas-canceladas` | 4 | cancelamentos com motivo, usuário, vendedor, cliente, data e valores | sim |
| `vendas-lucratividade` | 6 | lucro e margem por venda e por item, pelo custo gravado no item | só Central |
| `vendas-liberacoes` | 4 | pedidos de liberação (desconto ou limite): aprovado, negado ou pendente | sim |
| `vendas-trocas` | 3 | trocas: valor devolvido, valor entregue e diferença | sim |
| `devolucoes-venda` | 3 | entradas de devolução ligadas a vendas | sim |
| `vendas-orcamentos` | 4 | orçamentos (status 0) com cliente, vendedor e totais | sim |

**Caixa (8)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `caixa-movimentacao` | 5 | créditos e débitos do caixa, com forma e usuário | só Central |
| `caixa-vendas-por-vendedor` | 4 | vendas recebidas por colaborador: quantidade, subtotal, descontos, bruto e ticket médio | sim |
| `caixa-fechamento` | 3 | caixas fechados, com totais e operador | só Central |
| `caixa-sangrias` | 3 | sangrias: operador, valor, motivo e quem autorizou | sim |
| `caixa-conferencia-cega` | 4 | fechamento cego por forma de pagamento: sistema, informado e diferença | sim |
| `caixa-historico` | 4 | linha do tempo de abertura e fechamento | sim |
| `caixa-suprimentos` | 3 | suprimentos (entradas manuais no caixa) | sim |
| `caixa-cheques` | 3 | lançamentos de caixa em cheque | só Central |

**Financeiro (28)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `receber-titulos` | 5 | parcelas a receber, com status | só Central |
| `receber-vencidas` | 4 | parcelas a receber já vencidas | só Central |
| `receber-inadimplencia` | 2 | vencidos somados por cliente | só Central |
| `receber-recebimentos-periodo` | 3 | parcelas quitadas no período | só Central |
| `receber-por-cliente` | 5 | saldo a receber por cliente | sim |
| `receber-aging` | 2 | pendentes por faixa de atraso: a vencer, 1–30, 31–60, 61–90 e mais de 90 dias | sim |
| `pagar-titulos` | 5 | parcelas a pagar, com status | só Central |
| `pagar-vencidas` | 3 | parcelas a pagar já vencidas | só Central |
| `pagar-por-fornecedor` | 4 | saldo a pagar por fornecedor | sim |
| `pagar-pagamentos-periodo` | 3 | pagamentos feitos no período, com histórico | sim |
| `pagar-aging` | 1 | contas a pagar por faixa de atraso | sim |
| `fluxo-caixa` | 2 | entradas e saídas realizadas, por dia | só Central |
| `pagar-por-plano-contas` | 4 | despesas por conta do plano de contas | sim |
| `previsao-financeira` | 3 | receber e pagar pendentes, por vencimento | sim |
| `faturamento-lotes` | 4 | lotes de faturamento de orçamentos (força de vendas ou ERP) | sim |
| `faturamento-vendas` | 6 | vendas de cada lote, com marcas de baixa de estoque e de financeiro | sim |
| `faturamento-por-vendedor` | 3 | faturamento dos lotes por vendedor | sim |
| `banco-movimentacao` | 3 | lançamentos nas contas bancárias | sim |
| `banco-conciliacao` | 3 | movimentos de extrato OFX e se foram casados | só Central |
| `boletos-periodo` | 4 | boletos com pagador, vencimento, valor e status | sim |
| `pix-recebidos` | 3 | cobranças PIX geradas e pagas (txid, valor e status) | sim |
| `tef-operacoes` | 3 | operações de cartão ligadas a vendas (NSU, bandeira, parcelas) | só Central |
| `cliente-creditos` | 3 | créditos e débitos na conta do cliente | sim |
| `cliente-creditos-venda` | 3 | créditos de cliente usados em vendas | só Central |
| `pagar-quitados-periodo` | 3 | contas pagas, com juros, multa e desconto | só Central |
| `cobranca-execucoes` | 5 | ações da régua de cobrança: canal e status | só Central |
| `financeiro-remessas` | 3 | arquivos de remessa bancária gerados | só Central |
| `financeiro-retornos` | 3 | arquivos de retorno bancário processados | só Central |

**Estoque (13)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `estoque-posicao` | 5 | saldo atual por produto e grade | só Central |
| `estoque-abaixo-minimo` | 1 | produtos abaixo do estoque mínimo | só Central |
| `estoque-curva-abc` | 3 | curva ABC pelo faturamento no período | só Central |
| `estoque-entradas` | 5 | entradas no kardex | sim |
| `estoque-saidas` | 5 | saídas no kardex | sim |
| `estoque-sem-movimento` | 4 | produtos com saldo e sem movimento há X dias | sim |
| `estoque-valor-grupo` | 2 | saldo e valor a custo por grupo | sim |
| `estoque-balanco` | 4 | balanço: saldo anterior, contado e diferença | sim |
| `estoque-giro` | 4 | quantidade vendida comparada com o saldo | sim |
| `estoque-transferencias` | 4 | transferências entre filiais | sim |
| `estoque-romaneio` | 4 | romaneios de carga: motorista, rota, valor e status | sim |
| `saidas-periodo` | 4 | saídas manuais ou fiscais no período | sim |
| `saidas-itens` | 5 | itens das saídas manuais ou fiscais | sim |

**Compras (11)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `compras-periodo` | 4 | entradas de mercadoria no período | só Central |
| `compras-por-fornecedor` | 4 | compras por fornecedor | sim |
| `compras-por-produto` | 5 | compras por produto (quantidade e custo) | sim |
| `compras-pedidos` | 4 | pedidos de compra: status, previsão e valor | sim |
| `compras-evolucao-custos` | 5 | histórico do preço de compra por produto | sim |
| `compras-cotacoes` | 4 | cotações por fornecedor: valor, prazo e status | só Central |
| `compras-solicitacoes` | 4 | solicitações de compra | só Central |
| `entradas-vs-pagar` | 4 | entradas comparadas com as contas a pagar ligadas a elas | só Central |
| `entradas-itens` | 6 | itens das entradas | sim |
| `entradas-xml` | 4 | entradas importadas por XML de NF-e | sim |
| `entradas-manual` | 4 | entradas digitadas à mão | sim |

**Clientes (5), Fornecedores (1) e Produtos (5)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `clientes-cadastrados` | 3 | lista de clientes | só Central |
| `clientes-sem-compra` | 3 | clientes sem comprar há X dias, por vendedor e rota | sim |
| `colaboradores-cadastrados` | 2 | lista de colaboradores | só Central |
| `compras-colaboradores` | 5 | compras de convênio dos funcionários e se já foram baixadas | só Central |
| `convenio-colaboradores-geral` | 4 | convênio somado por colaborador | só Central |
| `fornecedores-cadastrados` | 3 | lista de fornecedores | só Central |
| `produtos-mais-vendidos` | 4 | ranking por quantidade ou faturamento | só Central |
| `produtos-lista-precos` | 4 | preços de compra e venda, margem e saldo | sim |
| `produtos-cadastro` | 7 | preços e valor do estoque a custo e a venda (layout do sistema antigo) | sim |
| `servicos-cadastrados` | 2 | serviços com valor e % de comissão | só Central |
| `produtos-composicao` | 1 | composição (ficha técnica) dos produtos compostos | só Central |

**Fiscal (17)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `nfce-emitidas` | 4 | NFC-e emitidas, ligadas à venda | só Central |
| `nfe-emitidas` | 4 | NF-e (modelo 55) emitidas | só Central |
| `fiscal-cancelados` | 3 | NFC-e e NF-e canceladas na SEFAZ | só Central |
| `nfe-rejeitadas` | 3 | NF-e rejeitadas, denegadas ou pendentes | sim |
| `nfe-tributos` | 3 | totais de ICMS, PIS, COFINS, IPI e ST | sim |
| `nfe-por-cfop` | 3 | NF-e autorizadas por CFOP | sim |
| `nfe-itens-fiscal` | 4 | itens com CFOP, CST/CSOSN, NCM e tributos | sim |
| `mdfe-periodo` | 3 | MDF-e emitidos | sim |
| `cte-periodo` | 3 | CT-e emitidos | sim |
| `fiscal-manifestacao-nfe` | 3 | manifestação do destinatário (ciência, confirmação, desconhecimento) | sim |
| `nfce-tributos` | 3 | totais de tributos das NFC-e | só Central |
| `nfce-itens-fiscal` | 4 | itens de NFC-e com CFOP, CST/CSOSN e NCM | só Central |
| `nfse-emitidas` | 4 | NFS-e emitidas | sim |
| `sped-resumo-periodo` | 2 | resumo por CFOP (base do SPED) | sim |
| `icms-mensal` | 2 | créditos e débitos de ICMS do mês | sim |
| `produtos-tributacao-nfe` | 3 | tributação dos produtos na NF-e (inclui IBS e CBS) | só Central |
| `produtos-tributacao-nfce` | 3 | tributação dos produtos na NFC-e (inclui IBS e CBS) | só Central |

**Canais digitais (5), Produção (2), CRM (1), Auditoria (1) e Movimentações (1)**

| Slug | Filtros | O que mostra | Menu |
|---|---|---|---|
| `ml-pedidos` | 3 | pedidos do Mercado Livre: status, comprador e NF automática | sim |
| `ml-anuncios` | 2 | anúncios do ML ligados a produtos e status de sincronização | sim |
| `loja-pedidos` | 3 | pedidos da loja virtual: frete, cupom e status | sim |
| `cardapio-pedidos` | 4 | pedidos do cardápio digital (mesa ou delivery) | só Central |
| `delivery-pedidos` | 4 | pedidos de delivery: origem, frete e status | só Central |
| `producao-ordens` | 4 | ordens de produção | só Central |
| `producao-insumos` | 3 | insumos previstos e consumidos | só Central |
| `crm-meta-markup` | 1 | metas de markup por grupo de produto | só Central |
| `auditoria-alteracoes` | 4 | o log de alterações em forma de relatório | só Central |
| `movimentacoes-gerais` | 4 | todas as movimentações de estoque | só Central |

**Comissões (7) e Ordem de Serviço (8):** todos estão no menu. Os filtros já foram
descritos no arquivo `20-relatorios-comissoes-os.md`.

- Comissões: `comissoes-venda-analitico` (6), `comissoes-venda-colaborador` (4),
  `comissoes-os-analitico` (7), `comissoes-os-colaborador` (5), `comissoes-servicos` (7),
  `comissoes-vendas-pecas-os` (5), `comissoes-por-recebimento` (7).
- OS: `os-periodo` (7), `os-por-status` (4), `os-por-tecnico` (4), `os-por-cliente` (4),
  `os-servicos-executados` (7), `os-pecas-utilizadas` (7), `os-abertas` (5),
  `os-faturadas` (6).

**Relevantes para comércio de alimentação e só achados pela Central:** vendas por
período, por forma de pagamento, por produto e analíticas; lucratividade por item;
curva ABC; estoque abaixo do mínimo; fluxo de caixa; fechamento de caixa; pedidos do
cardápio digital e do delivery; ficha técnica (composição).

---

### 2.8 `/relatorios/processamentos`: Processamentos de relatórios

**Objetivo [visto]:** página reservada para relatórios assíncronos e para o histórico
de exportações. Está marcada como "em evolução".

- Só tem um aviso: a fila para relatórios muito grandes vai ser ligada nesta tela. Hoje
  as exportações são geradas na hora, até o limite de linhas de cada relatório.
- Link "Voltar à Central". Não há lista, filtros nem botões.
- **Conclusão [deduzido]:** hoje não existe fila nem histórico de exportações. Cada
  relatório tem um limite de volume, que não aparece na tela.

---

### 2.9 O que as telas de relatório têm em comum

- **Estrutura [visto]:** título; descrição de uma linha; link "← Central"; um cartão de
  filtros; um único botão, "Gerar". Nada aparece antes de gerar: nem prévia, nem
  exportação, nem impressão.
- **Formulário [visto em 3 dos 4 relatórios]:** envio por GET para o próprio endereço do
  relatório, com o campo oculto `executar` e os filtros. Nenhum campo é obrigatório.
- **Período [visto]:** "Data inicial" (`de`) e "Data final" (`ate`), no campo de data do
  navegador. O padrão vai do dia 1 do mês até hoje (01/10/2026 a 03/10/2026).
- **Campos com lupa [visto]:** caixa de texto com o aviso "Clique na lupa para
  pesquisar...", botão "Pesquisar" (lupa) e botão "Limpar". O ID escolhido vai num campo
  oculto (`id_cliente`, `id_vendedor`, `id_produto`, `id_fabricante`, `id_grupo`).
- **Janela de pesquisa (lupa) [visto]:** janela sobreposta com busca por código ou
  descrição, botão "Buscar", tabela de resultados, paginação ("Página X de Y (N
  registros)", "Anterior", "Próximo") e "Fechar":

| Janela | Colunas | Registros nesta conta | "Cadastrar novo" |
|---|---|---|---|
| Pessoa (cliente) | Código, Nome, CPF/CNPJ | 1 ("Consumidor final") | não |
| Colaborador / Vendedor | Código, Nome, CPF/CNPJ | 0 | não |
| Produto | Código, Descrição, Ref., UN | 0 | não visto |
| Fabricante | Código, Descrição, Status | 1 ("PADRAO", status 0) | sim |
| Grupo de Produto | Código, Descrição | 0 | sim |

- **Situação da venda [visto nas opções]:** 0 = orçamento, 1 = venda (finalizada),
  2 = cancelada.

### 2.10 `/relatorios/produtos-vendidos`: Produtos vendidos

**Objetivo [visto]:** produtos vendidos no período, com quantidade e total, no layout
do sistema antigo ("estilo Delphi").

| Filtro | Nome técnico | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial | `de` | data | 01/10/2026 |
| Data final | `ate` | data | 03/10/2026 |
| Cliente | `id_cliente` | lupa (Pessoa) | vazio |
| Vendedor | `id_vendedor` | lupa (Colaborador/Vendedor) | vazio |
| Produto | `id_produto` | lupa (Produto) | vazio |
| Fabricante | `id_fabricante` | lupa (Fabricante) | vazio |
| Grupo | `id_grupo` | lupa (Grupo de produto) | vazio |
| Status | `status` | lista | **1 — Venda** (padrão), 0 — Orçamento, 2 — Cancelado, Todos (`todos`) |

São 8 filtros, como diz o cartão da Central. Botão "Gerar" não clicado. Resultado
esperado: uma linha por produto, com quantidade e total do período [deduzido da
descrição].

### 2.11 `/relatorios/vendas-por-vendedor-produto`: Vendas por vendedor e produto

**Objetivo [visto]:** quantidade e total vendidos, agrupados por vendedor e, dentro de
cada vendedor, por produto (layout do sistema antigo).

**Filtros [visto na árvore de acessibilidade]:** os mesmos 8 do relatório anterior:
Data inicial, Data final, Cliente, Vendedor, Produto, Fabricante, Grupo e Status, com as
mesmas opções e o padrão "1 — Venda". Os nomes técnicos não foram confirmados: a leitura
por script foi recusada. Botão "Gerar" não clicado.

**Resultado esperado [deduzido]:** um grupo por vendedor, com os seus produtos e o
subtotal de cada vendedor.

### 2.12 `/relatorios/vendas-vendedor-modalidade`: Vendas por vendedor e modalidade

**Objetivo [visto]:** conferir vendas, quantidades e valores por vendedor e pela forma
de entrega ao cliente (retirada na loja ou entrega).

| Filtro | Nome técnico | Tipo | Padrão / opções |
|---|---|---|---|
| Data inicial | `de` | data | 1º dia do mês |
| Data final | `ate` | data | hoje |
| Vendedor | `id_vendedor` | lupa | vazio |
| Status | `status` | lista | **Vendas** (`1`, padrão), Orçamentos (`0`), Canceladas (`2`), Todos |
| Modalidade | `modalidade` | lista | **Todas** (padrão), Retirada na loja (`retirada`), Entrega (`entrega`), Loja / PDV (`loja`) |

São 5 filtros. Botão "Gerar" não clicado.

**Regra de negócio [deduzido]:** cada venda guarda uma "modalidade" de atendimento:
retirada na loja, entrega ou venda no balcão/PDV. É o mesmo conceito de "canal de
atendimento" que usamos para comércio de alimentação.

### 2.13 `/relatorios/vendas-canceladas`: Cancelamentos de vendas

**Objetivo [visto]:** listar os cancelamentos de vendas com motivo, usuário, vendedor,
cliente, data e valores. No menu, o nome é "Cancelamentos e motivos"; na página, é
"Cancelamentos de vendas".

| Filtro | Nome técnico | Tipo | Padrão |
|---|---|---|---|
| Data inicial | `de` | data | 1º dia do mês |
| Data final | `ate` | data | hoje |
| Cliente | `id_cliente` | lupa | vazio |
| Vendedor | `id_vendedor` | lupa | vazio |

São 4 filtros. Botão "Gerar" não clicado.

**Regra de negócio [deduzido]:** cancelar uma venda exige um motivo e registra o usuário
que cancelou e a data. O cancelamento é um evento auditável, separado do vendedor da
venda.

---

## 3. Fluxos de ponta a ponta

1. **Entrada do cliente e aceite dos termos.** Cadastro público com código por e-mail e
   depois por WhatsApp → contratação de plano pago → fatura de implantação (do valor da
   primeira mensalidade) que bloqueia a operação até ser paga → no acesso, aceite
   eletrônico dos termos (marcar "li e aceito" e confirmar) → o sistema grava empresa,
   CNPJ da época, usuário, data e hora, IP, navegador, versão, texto integral e hash →
   consulta em `/meus-termos`, com detalhe e comprovante para impressão → uma versão
   nova dos termos pode exigir novo aceite, guardado como outra linha.
   [as etapas de cadastro e implantação foram vistas nas Novidades; o resto, no aceite;
   o momento exato do pedido de aceite está a verificar]
2. **Publicação de novidades.** A Olímpia atualiza o sistema → um registro entra
   automaticamente na tabela de melhorias (autor "MIGRAÇÃO") → aparece em "Novidades"
   (`/sistema-melhorias`) → o mesmo registro aparece no log de auditoria como
   "Inclusão", feita pelo usuário "WEB" a partir de 127.0.0.1 [visto/deduzido].
3. **Auditoria.** Uma inclusão, alteração, inativação, exclusão, ajuste de estoque no
   cadastro, lançamento ou baixa → uma linha no log, com antes e depois em JSON, usuário,
   IP e rota → consulta por período, módulo, tabela, ação ou ID → detalhe → a mesma base
   pode ser exportada pelo relatório "Auditoria de alterações" [visto/deduzido].
4. **Comissão por metas.** Criar a meta (nome, período, prêmios do 1º ao 3º lugar) → o
   sistema soma as vendas finalizadas de cada colaborador no período → aplica as faixas
   padrão → monta o ranking → calcula o total de prêmios (coluna da lista) → possível
   ligação com financeiro e folha pelo cadastro da empresa
   [só o formulário e a lista vazia foram vistos; o resto está a verificar].
5. **Relatórios.** Hub ou Central → busca por texto ou por categoria → "Abrir relatório"
   → filtros (período do mês, lupas, situação) → "Gerar" (GET com `executar=1`) →
   resultado na tela com totais → PDF, Excel, CSV ou impressão → no futuro, fila
   assíncrona e histórico em "Processamentos"
   [até os filtros: visto; do "Gerar" em diante: deduzido].
6. **Ciclo da venda que aparece nos relatórios [visto nas opções e descrições].**
   Orçamento (status 0) → venda finalizada (1) → cancelada (2), com motivo e usuário.
   Ainda: liberação de desconto ou limite (pendente → aprovado ou negado); troca ou
   devolução que vira crédito do cliente; orçamentos da força de vendas faturados em
   lotes, com marcas de estoque e de financeiro.

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
|---|---|---|
| **TermoUso** (versão) | versão, data de publicação, texto em Markdown, hash do modelo, vigente (sim/não) | 1:N AceiteTermo |
| **AceiteTermo** | UUID, empresa (razão social e fantasia), CNPJ na época, código da empresa, usuário (ID, nome, login), data e hora, IP, navegador/dispositivo, versão, texto exato aceito (cópia), SHA-256, status (ACEITO, vigente) | N:1 TermoUso; N:1 Empresa; N:1 Usuário |
| **SistemaMelhoria** (Novidade) | id, id_empresa, tipo (novo recurso, melhoria, ajuste, correção), módulo, título, descrição, versão (ano.mês), autor, status, data, data_hora (UTC) | gera LogAlteracao (inclusão) |
| **LogAlteracao** | id, data e hora, ação (create, update, ajuste_estoque_cadastro, inactivate, delete, lancamento, baixa), módulo, tabela, ID do registro, descrição, usuário, IP, rota, antes (JSON), depois (JSON) | aponta para qualquer tabela auditada (genérico); N:1 Usuário |
| **MetaComissao** | nome, data_ini, data_fim, premio_1, premio_2, premio_3, status, faturamento apurado, total de prêmios | 1:N resultado por colaborador [a verificar]; usa FaixaComissao padrão; lê Venda (status 1); ligação com Financeiro e Folha via Empresa [a verificar] |
| **FaixaComissao** (padrão) | faixas de prêmio "da planilha de agosto" (valores não vistos) | N:1 MetaComissao ou fixa no sistema [a verificar] |
| **RelatorioCatalogo** | slug, nome, descrição, categoria, número de filtros, formatos (PDF, Excel, CSV), limite de volume | 1:N filtros; gera ProcessamentoRelatorio (futuro) |
| **ProcessamentoRelatorio** (futuro) | fila assíncrona e histórico de exportações (ainda não existe) | N:1 RelatorioCatalogo; N:1 Usuário |
| **Venda** | status (0 orçamento, 1 venda, 2 cancelada), data, cliente, vendedor, modalidade (retirada, entrega, loja/PDV), itens, totais, documento fiscal, forma de pagamento | N:1 Pessoa (cliente); N:1 Pessoa (vendedor); 1:N ItemVenda; 0:1 Cancelamento |
| **Cancelamento de venda** | motivo, usuário, data, valores | 1:1 Venda |
| **ItemVenda** | produto, quantidade, valores, custo gravado (para lucratividade) | N:1 Venda; N:1 Produto |
| **Produto** | código, descrição, referência, unidade | N:1 Fabricante; N:1 GrupoProduto |
| **Fabricante** | código, descrição, status (padrão "PADRAO") | 1:N Produto |
| **GrupoProduto** | código, descrição | 1:N Produto |
| **Pessoa** | código, nome, CPF/CNPJ; papéis de cliente, colaborador/vendedor e fornecedor; registro padrão "Consumidor final" | 1:N Venda (como cliente ou vendedor) |
| **Empresa** (tenant) | razão social, fantasia, CNPJ, código interno (54); configurações de "Financeiro e Folha" | 1:N usuários, aceites, metas e dados |
| **Usuário** | ID, nome, login (ex.: "ADMIN") | faz aceites, alterações e cancelamentos |

## 5. Integrações

- **Nenhuma integração externa é acionada diretamente nestas 12 telas.** Elas consultam
  dados internos, exportam arquivos (PDF, Excel, CSV) e usam a impressão do navegador
  [visto].
- **Pressupostas pelas Novidades [visto]:** WhatsApp (hub "Hermes", com várias linhas e
  troca automática; API do "Olimpia Atendimentos" para códigos de validação); e-mail
  (SMTP) para códigos; Olimpia Bridge (programa local que imprime em impressora térmica
  por ESC/POS); SEFAZ (regras de NF-e).
- **Pressupostas pelo catálogo de relatórios [visto nas descrições]:** SEFAZ (NF-e,
  NFC-e, NFS-e, MDF-e, CT-e, manifestação do destinatário); bancos (boletos, remessa e
  retorno, extrato OFX para conciliação); PIX (txid); TEF e POS (NSU, bandeira);
  Mercado Livre (pedidos, anúncios, NF automática); loja virtual; cardápio digital;
  delivery; régua de cobrança com vários canais; app de força de vendas (rota de
  visitas, lotes de faturamento); SPED.
- **Pressupostas pelos Termos [visto]:** certificado digital, integrações de terceiros,
  IA e automações.

## 6. Observações de UX (oportunidades para nós)

1. **Dois catálogos de relatórios que não batem.** O hub tem 80 cartões em 8 grupos; a
   Central tem 132 em 16 categorias. Há 54 relatórios que só se acham pela Central,
   inclusive os mais úteis para comida (vendas por período, por forma de pagamento,
   curva ABC, lucratividade, fluxo de caixa, pedidos do cardápio e do delivery). Há
   repetição ("Produtos — estoque e valores" aparece duas vezes) e o grupo "Vendas
   extras" mistura NFS-e, SPED e ICMS. **Para nós:** um único catálogo, filtrado pelos
   módulos que o cliente contratou.
2. **Relatórios demais, quase iguais.** Há pelo menos 6 jeitos de ver "vendas por
   vendedor" (por vendedor; por vendedor e produto; por vendedor e modalidade; caixa com
   vendedor; faturamento por vendedor; vendas x recebimento por vendedor). **Para nós:**
   um relatório de vendas com "agrupar por" (período, vendedor, produto, cliente, forma
   de pagamento, canal) e "situação", com prévia na hora.
3. **Linguagem técnica para o comerciante.** O slug aparece em destaque nos cartões. As
   descrições citam "status 0", "tipo_forma = 1", "tabela estoque, tipo E",
   `valor_comissao`, `id_ordem_servico`, "estilo Delphi" e "Delphi FrmRelatorio". As
   listas de situação mostram o código ("1 — Venda"), e o nome muda de um relatório para
   outro ("1 — Venda" num, "Vendas" noutro). **Para nós:** só nomes de negócio.
4. **Filtros lentos.** Cada campo com lupa exige abrir uma janela, buscar e escolher.
   Digitar no campo não busca. Algumas janelas oferecem "Cadastrar novo" dentro de um
   filtro de relatório, um lugar estranho para criar cadastro. **Para nós:**
   autocompletar no próprio campo e filtros salvos.
5. **Nada antes de "Gerar".** Não há prévia, favoritos, filtros guardados, agendamento
   nem envio por e-mail ou WhatsApp. A exportação é síncrona e tem um limite que não é
   mostrado. A fila de "Processamentos" ainda não existe. **Para nós:** resultado
   imediato com paginação, exportação em segundo plano e aviso quando o arquivo estiver
   pronto.
6. **Novidades técnicas demais.** Tudo em maiúsculas, com nomes de classes e campos,
   detalhes internos (tela de Super Admin, código Delphi) e várias entradas por dia.
   **Para nós:** notas de versão curtas, em linguagem simples ("o que muda para você"),
   só dos módulos que o cliente usa, com selo de "novo" no menu. Vale copiar o botão
   "Novidades" no cabeçalho e os filtros por tipo e módulo.
7. **Log de alterações para técnico.** Para filtrar, é preciso saber o nome interno do
   módulo ou da tabela (`SISTEMAMELHORIA`, `SISTEMA_MELHORIA`). O antes e o depois
   aparecem em JSON cru. Não há filtro por usuário nem exportação na própria tela.
   **Para nós:** mostrar só o que mudou ("campo: antes → depois"), filtros por usuário e
   por tipo de registro em listas, e destaque para ações sensíveis (cancelamento,
   desconto, sangria, ajuste de estoque).
8. **Termos: boa base com acabamento fraco.** A trilha de prova é boa e vale copiar:
   versão, cópia do texto aceito, hash, IP, navegador e "CNPJ na época". Mas a impressão
   sai em Markdown cru, os dois hashes diferentes não são explicados, não há PDF para
   baixar e o CNPJ aparece sem máscara.
9. **Comissão por metas pouco transparente.** As faixas não aparecem antes de criar a
   meta e vêm "da planilha de agosto" de um cliente. O prêmio de ranking vale só para os
   3 primeiros. A configuração fica longe ("Financeiro e Folha" no cadastro da empresa).
   **Para nós:** mostrar e editar as faixas na própria meta, simular antes de salvar,
   barra de progresso por vendedor e lançamento do prêmio no financeiro com um clique.
10. **Um módulo inteiro para dois links.** "Utilitários" só tem Novidades e Log.
    **Para nós:** Novidades no cabeçalho e Auditoria em Configurações → Segurança.

## 7. Pendências

- **`/sistema-melhorias`:** o tipo dos campos "Módulo" e "Busca", a paginação e os links
  da tela não foram confirmados. A leitura por script foi recusada pela trava do modo
  automático ("Third-Party Attack") e não foi refeita.
- **`/relatorios/vendas-por-vendedor-produto`:** os nomes técnicos dos filtros não
  foram confirmados. A leitura por script foi recusada. Os filtros visíveis foram lidos
  antes, pela árvore de acessibilidade.
- **Catálogo de menu da sessão:** a segunda consulta (procurar o manual e telas sobre
  prêmios e comissões) foi recusada. O manual não foi consultado sobre a comissão por
  metas.
- **Resultado dos 4 relatórios** (colunas, totais, agrupamentos, botões de PDF, Excel e
  CSV, impressão): não visto, porque "Gerar" é proibido. Também não há vendas nesta
  conta para gerar.
- **Comissão por metas:** sem metas cadastradas. Não foram vistos as faixas, o
  detalhe de uma meta, os estados, a apuração, o ranking nem a ligação com financeiro e
  folha. "Criar meta" é proibido.
- **Termos de uso:** a tela onde o aceite é pedido e o fluxo de uma versão nova não
  foram vistos, porque a conta já tinha aceitado a versão vigente.
- **Log de alterações:** não há alterações de negócio nesta conta. Não deu para ver
  uma "Alteração" com antes e depois preenchidos, nem as ações de estoque, lançamento e
  baixa.
- **Processamentos:** página reservada, sem conteúdo. O limite de volume de cada
  relatório não aparece em lugar nenhum.
- **Central, categoria "Visão geral":** não foi filtrada sozinha para ver se tem
  relatórios.
- **Decisão do usuário:** para completar as lacunas por script, é preciso liberar a
  trava do modo automático para o navegador embutido neste site (ou rodar fora do modo
  automático e aprovar cada passo). Gerar relatórios e criar uma meta de teste
  continuam proibidos pelas regras desta pesquisa, e só o dono da conta pode autorizar.

## 8. Sub-rotas descobertas

| Sub-rota | O que é | Estado |
|---|---|---|
| `/meus-termos/{uuid}` | detalhe do aceite dos termos | aberta |
| `/meus-termos/{uuid}/imprimir` | comprovante do aceite para impressão | lida pelo HTML |
| `/sistema-log-alteracoes/{id}` | detalhe de um registro de auditoria | aberta (#13) |
| `/relatorios?q=&categoria=` | Central filtrada por texto e por categoria | testada |
| `/relatorios/{slug}` | rota genérica dos 132 relatórios | 4 abertas neste lote |
| 54 relatórios que só estão na Central | ver a coluna "só Central" em 2.7.1 | não abertos |
