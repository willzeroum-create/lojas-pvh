# 921 — Lacunas, lote 22: relatórios fiscais, canais digitais, lista de preços e manual (ERP Olímpia)

> **Estado: explorado em parte, com 8 das 12 rotas lidas.** Data: 2026-10-03.
> Conta de teste "Boi Criolo" (plano Full). A sessão já estava aberta no
> navegador embutido. O trabalho foi feito numa aba própria, criada para este
> lote e fechada no fim.
>
> - **Lidas por completo** (filtros, nomes técnicos, opções e lupas): os 7
>   relatórios fiscais (`nfe-itens-fiscal`, `mdfe-periodo`, `cte-periodo`,
>   `fiscal-manifestacao-nfe`, `nfse-emitidas`, `sped-resumo-periodo` e
>   `icms-mensal`) e `ml-pedidos`. A Central de relatórios (`/relatorios`)
>   também foi lida. Dela vêm o nome, a descrição e o número de filtros das 11
>   telas de relatório do lote.
> - **Uma recusa da trava automática do Claude Code** (rótulo "Third-Party
>   Attack"), na abertura de `/relatorios/ml-anuncios`. A exploração no ERP
>   parou aí. `loja-pedidos`, `produtos-lista-precos` e
>   `/dashboard/modulo/manual` não foram tentadas, porque abri-las seria repetir
>   a ação recusada com outro endereço.
> - **Uma segunda recusa, com o mesmo rótulo,** numa busca nos outros arquivos
>   desta pasta. A busca queria cruzar o que já se sabia dessas 4 telas. Não foi
>   repetida.
> - **"Gerar" não foi clicado** em nenhuma tela, porque está na lista de
>   proibidos. Nenhum resultado foi visto. As colunas descritas abaixo são
>   deduzidas. A conta também não tem produtos e só tem o cliente padrão, então
>   um relatório gerado viria vazio.
> - **Nada foi gravado, enviado ou alterado no ERP.** Só foram abertas (e
>   fechadas com Esc) as janelas de pesquisa de Produto e de Pessoa.
>
> Marcação usada:
>
> - **[visto]**: apareceu na tela.
> - **[código]**: está no HTML ou no script da própria página.
> - **[Central]**: está no cartão do relatório na Central de relatórios.
> - **[deduzido]**: conclusão direta do que foi visto.
> - **[domínio]**: regra fiscal ou do Mercado Livre conhecida fora do ERP. Não
>   aparece na tela. Deve ser confirmada com um contador ou na documentação
>   oficial.
> - **[a verificar]**: hipótese, ainda não confirmada.

## Em palavras simples

1. **Os 8 relatórios abertos são iguais por dentro:** um cartão de filtros
   (período e mais um ou dois campos) e um botão "Gerar". Nada aparece antes
   de gerar.
2. **O achado principal é a falta de padrão nos "status".** Cada documento usa
   um código diferente:
   - NF-e: o próprio código de retorno da SEFAZ (100 autorizada, 101
     cancelada);
   - MDF-e: números de 0 a 3;
   - manifestação: letras (F, P, T);
   - CT-e, NFS-e e pedidos do Mercado Livre: um campo de texto livre, sem dizer
     o que se pode escrever.

   Para nós: um vocabulário único de estados para todos os documentos, sempre
   numa lista com nomes em português. O código da SEFAZ fica guardado à parte.
3. **Os relatórios mostram o que o ERP guarda:**
   - itens da NF-e com NCM, CFOP, CST/CSOSN e tributos;
   - MDF-e com encerramento;
   - a manifestação das notas de compra, em 3 fases;
   - NFS-e por cliente;
   - um resumo por CFOP para o SPED;
   - uma apuração simples de ICMS (crédito das entradas contra débito das
     saídas);
   - pedidos do Mercado Livre com nota fiscal automática.
4. **Faltam 4 telas:** anúncios do Mercado Livre, pedidos da loja, lista de
   preços e manual. Para as três primeiras, este arquivo traz só o cartão da
   Central. Do manual não há nada.

## Como continuar (decisão do usuário)

- A recusa só mostra o rótulo "Third-Party Attack".
- O login não foi o problema: a sessão funcionou nas 8 telas anteriores.
- Tentar de novo por outro caminho seria contornar a trava. Isso não foi
  feito.
- Para concluir as 4 rotas, a decisão é do usuário:
  1. autorizar de forma explícita a navegação, só de leitura, em
     `erp.olimpiasistemas.com.br`. Por exemplo, aprovando cada página quando o
     Claude pedir, fora do modo automático;
  2. depois, rodar de novo só as rotas listadas em
     [Pendências](#pendências).

---

## Visão geral do módulo

### O que este lote cobre

O lote junta telas que sobraram de lotes anteriores. Quase todas são
relatórios da Central:

- **Fiscal (7):** itens de NF-e, MDF-e, CT-e, manifestação do destinatário,
  NFS-e, resumo para o SPED e ICMS do mês.
- **Canais digitais (3):** pedidos e anúncios do Mercado Livre e pedidos da
  loja virtual.
- **Produtos (1):** lista de preços.
- **Manual (1):** o hub `/dashboard/modulo/manual`.

### Mapa do lote

| # | Rota | Nome na Central | Bloco | Filtros [Central] | Estado |
|---|---|---|---|---|---|
| 1 | `/relatorios/nfe-itens-fiscal` | NF-e itens — CFOP / CST / NCM | Fiscal | 4 | **lida** |
| 2 | `/relatorios/mdfe-periodo` | MDF-e emitidos | Fiscal | 3 | **lida** |
| 3 | `/relatorios/cte-periodo` | CT-e emitidos | Fiscal | 3 | **lida** |
| 4 | `/relatorios/fiscal-manifestacao-nfe` | Manifestação DF-e | Fiscal | 3 | **lida** |
| 5 | `/relatorios/nfse-emitidas` | NFS-e emitidas | Fiscal | 4 | **lida** |
| 6 | `/relatorios/sped-resumo-periodo` | SPED — resumo fiscal do período | Fiscal | 2 | **lida** |
| 7 | `/relatorios/icms-mensal` | ICMS — créditos e débitos do mês | Fiscal | 2 | **lida** |
| 8 | `/relatorios/ml-pedidos` | Pedidos Mercado Livre | Canais digitais | 3 | **lida** |
| 9 | `/relatorios/ml-anuncios` | Anúncios Mercado Livre | Canais digitais | 2 | abertura **recusada** |
| 10 | `/relatorios/loja-pedidos` | Pedidos loja virtual | Canais digitais | 3 | não tentada |
| 11 | `/relatorios/produtos-lista-precos` | Lista de preços | Produtos | 4 | não tentada |
| 12 | `/dashboard/modulo/manual` | (hub do manual) | — | — | não tentada |

Os 11 cartões da Central anunciam os mesmos formatos de saída: PDF, Excel e
CSV.

### Como cada relatório funciona por dentro [código]

Estas 8 telas confirmam o modelo já descrito no lote 18
(`917-lacunas-18.md`):

- **Uma rota genérica.** A página se identifica como `relatorios.show`, com o
  parâmetro `report` igual ao identificador (por exemplo, `nfe-itens-fiscal`).
- **Formulário GET para a própria rota** (`form-relatorio-filtros`), com o
  campo oculto `executar=1`:
  - "Gerar" recarrega a página com os filtros na URL [deduzido];
  - um relatório filtrado pode ser guardado como favorito ou mandado por link.
- **Período padrão:** do dia 1 do mês até hoje (01/10/2026 a 03/10/2026), nos
  campos `de` e `ate`.
- **Nenhum campo é obrigatório.** Não há marca nem regra de obrigatório.
- **Os outros filtros** têm o identificador `f-<nome>` no HTML e enviam
  `<nome>`. São de três tipos: lista, texto livre ou lupa.
- **Nenhuma das 8 telas tem script próprio.** São formulários desenhados pelo
  servidor, sem comportamento extra. A positivação do lote 18 era diferente.
- **Botão "Gerar":** tem o ícone de lupa. Não foi clicado.
- **Link "← Central"**, de volta para `/relatorios`.

**Lupas usadas neste lote** [visto: janela aberta e fechada sem escolher nada]

| Tipo | Campo enviado | Título da janela | Colunas | Registros nesta conta |
|---|---|---|---|---|
| `produto` | `id_produto` | Pesquisar — Produto | Código, Descrição, Ref., UN | 0 |
| `pessoa` | `id_cliente` | Pesquisar — Pessoa | Código, Nome, CPF/CNPJ | 1 (código 1, "Consumidor final") |

- **A janela tem:** o campo "código ou descrição", o botão Buscar, a tabela, a
  linha "Página X de Y (N registros)", Anterior, Próximo e Fechar.
- **"Cadastrar novo" e "Adicionar selecionados"** existem na janela, mas não
  apareceram para estes dois tipos [visto].
- **Seleção múltipla na lupa de Pessoa** [a verificar]. O botão de seleção
  múltipla não tinha a classe que o esconde. Não ficou claro se a lupa aceita
  vários clientes.
- **O filtro "Cliente" da NFS-e usa a lupa genérica de Pessoa** [código]:
  - o título da janela é "Pessoa", não "Cliente";
  - pode listar também fornecedores e colaboradores [a verificar];
  - no lote 18, os colaboradores tinham uma lupa própria
    (`pessoa_colaborador`).

### Códigos de status que as telas mostram [código]

| Documento | Filtro (nome enviado) | Valores | Padrão |
|---|---|---|---|
| NF-e (itens) | Status NF (`status`) | `100` Autorizada · `todos` Todos · `101` Cancelada | `100` |
| MDF-e | Status (`status`) | `todos` Todos · `0` Pendente · `1` Autorizado · `2` Encerrado · `3` Cancelado | `todos` |
| Manifestação DF-e | Situação DF-e (`status`) | vazio = Todos · `F` Pendente · `P` Ciência · `T` Finalizada | Todos |
| CT-e | Status (`status`) | texto livre, sem dica | vazio |
| NFS-e | Status NFS-e (`status`) | texto livre, sem dica | vazio |
| Pedido do Mercado Livre | Status ML (`status`) | texto livre, sem dica | vazio |

O que esta tabela mostra:

- **A NF-e guarda o código de retorno da SEFAZ como status** [deduzido]:
  - 100 e 101 são os códigos oficiais de "uso autorizado" e de "cancelamento
    homologado" [domínio];
  - notas rejeitadas ou denegadas ficam fora deste filtro. Elas têm um
    relatório próprio (`nfe-rejeitadas`, segundo o lote 17).
- **Cada documento tem a sua convenção.** Isso sugere tabelas separadas,
  herdadas de sistemas diferentes, e relatórios configurados um a um
  [deduzido].
- **Três filtros pedem texto livre.** O usuário precisa adivinhar o valor
  guardado no banco [a verificar]:
  - é um número ou uma palavra?
  - no caso do Mercado Livre, em português ou em inglês?

### A moldura e os avisos ligados a este lote [código]

A moldura de todas as páginas (já descrita nos lotes 15 a 17) consulta o
servidor de tempos em tempos, à procura de novidades. Dois desses avisos tocam
neste lote:

- **Mercado Livre:**
  - pergunta por vendas novas (`/erp/notificacoes/ml/poll`);
  - quando há, abre uma janela de "nova venda" e soma o número no sino, junto
    com loja, cardápio e OS;
  - cada aviso pode ser marcado como lido (POST para
    `/erp/notificacoes/ml/{id}/lida`).
- **Manifestação:**
  - pergunta por notas novas emitidas contra o CNPJ
    (`/erp/notificacoes/manifestacao/poll`);
  - mostra um aviso flutuante "Nova NF-e para manifestar", com emitente, data
    e valor, e o link "Abrir Manifestação";
  - o aviso some sozinho em 10 segundos e espera enquanto o mouse está em cima.
- **Outros avisos da moldura:** baixa automática de boletos ("Boletos
  liquidados"), pedidos via WhatsApp (com botão de confirmar), loja virtual,
  cardápio e OS.
- **Como evitam repetir avisos:**
  - cada canal guarda, na sessão do navegador, o último número já visto;
  - a primeira consulta vai marcada como "bootstrap", para não despejar avisos
    antigos.

### Visual [visto na captura de `nfe-itens-fiscal`]

- **Um cartão de filtros numa linha só:** Data inicial, Data final, Produto
  (lupa), Status NF e o botão escuro "Gerar". Abaixo, a página fica vazia.
- **Texto cortado:** a orientação da lupa aparece como "Clique na lup…", como
  no lote 18.
- **Rótulo da lupa fora do componente:** o rótulo "Produto" fica fora. O rótulo
  de dentro existe, mas está vazio, o que atrapalha leitores de tela
  [código].

---

## Telas

### 1. NF-e itens — CFOP / CST / NCM — `/relatorios/nfe-itens-fiscal` [visto]

**Para que serve.** Listar os itens das NF-e (modelo 55) com a classificação
fiscal de cada um (CFOP, CST ou CSOSN, NCM) e os valores dos tributos
[Central]. É o relatório de auditoria da tributação por item.

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial | `de` | data | não | dia 1 do mês |
| Data final | `ate` | data | não | hoje |
| Produto | `id_produto` | lupa (Produto) | não | — |
| Status NF | `status` | lista | não | **Autorizada** (`100`, padrão) · Todos · Cancelada (`101`) |
| — | `executar` | oculto | — | sempre `1` |

Ações: Pesquisar e Limpar (da lupa), **Gerar** (não clicado) e o link
"Central".

**Regras e comportamento**

- **Por padrão, só notas autorizadas** [visto]. As canceladas ficam fora, o que
  é o certo para conferir tributos.
- **Filtro por produto** [visto]. Mostra como um mesmo produto saiu tributado
  em notas diferentes. Serve para achar erro de cadastro, como NCM ou CFOP
  errado [deduzido].
- **CST ou CSOSN** [Central]. O relatório mostra um ou outro conforme o regime:
  CST no regime normal e CSOSN no Simples Nacional [domínio].
- **Só NF-e** [deduzido]. Existe um relatório irmão para NFC-e
  (`nfce-itens-fiscal`, só na Central, segundo o lote 17).
- **Data usada no período** (emissão ou autorização): não aparece [a
  verificar].

**O que o resultado deve mostrar** [deduzido; não visto]

- Uma linha por item: nota (número e série), data, destinatário, produto, NCM,
  CFOP, CST/CSOSN, quantidade e valor.
- Os tributos: base e valor de ICMS, ICMS-ST, IPI, PIS e COFINS.
- Totais no fim.

### 2. MDF-e emitidos — `/relatorios/mdfe-periodo` [visto]

**Para que serve.** Listar os manifestos de carga (MDF-e) do período
[Central].

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Status | `status` | lista | não | **Todos** (padrão) · Pendente (`0`) · Autorizado (`1`) · Encerrado (`2`) · Cancelado (`3`) |
| — | `executar` | oculto | — | `1` |

Ações: **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **Ciclo de vida do MDF-e** [visto nos status]:
  1. nasce **Pendente**;
  2. passa a **Autorizado** na SEFAZ;
  3. termina **Encerrado** (fim da viagem) ou **Cancelado**.
- **Regras legais** [domínio; confirmar]:
  - o MDF-e acompanha a carga e precisa ser encerrado quando a viagem acaba;
  - um manifesto esquecido em aberto pode impedir a emissão do próximo para o
    mesmo veículo;
  - o cancelamento só vale num prazo curto depois da autorização e antes de a
    viagem começar.
- **Uso prático** [deduzido]:
  - filtrar "Autorizado" mostra os manifestos que ainda não foram encerrados;
  - essa é a principal pendência operacional deste documento;
  - o relatório não destaca isso. O usuário tem de lembrar de filtrar.

**O que o resultado deve mostrar** [deduzido; não visto]: número, série,
emissão, UF de carga e de descarga, veículo, condutor, quantidade de
documentos, peso, valor da carga e status.

### 3. CT-e emitidos — `/relatorios/cte-periodo` [visto]

**Para que serve.** Listar os conhecimentos de transporte (CT-e) emitidos no
período [Central]. O CT-e é o documento do frete. Quem o emite é quem presta o
serviço de transporte [domínio].

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Status | `status` | **texto livre** | não | vazio, sem dica nem lista |
| — | `executar` | oculto | — | `1` |

Ações: **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **Status em texto livre** [código]:
  - o MDF-e, que é parecido, tem lista; o CT-e não;
  - o usuário não sabe o que escrever;
  - provavelmente o relatório foi configurado sem a lista de opções
    [deduzido].

**O que o resultado deve mostrar** [deduzido; não visto]: número, série,
emissão, tomador, remetente, destinatário, valor da prestação, ICMS do frete e
status.

### 4. Manifestação DF-e — `/relatorios/fiscal-manifestacao-nfe` [visto]

**Para que serve.** Acompanhar as notas de compra emitidas contra o CNPJ da
empresa e a fase da manifestação de cada uma: ciência, confirmação ou
desconhecimento [Central].

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Situação DF-e | `status` | lista | não | **Todos** (vazio, padrão) · Pendente (`F`) · Ciência (`P`) · Finalizada (`T`) |
| — | `executar` | oculto | — | `1` |

Ações: **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **Três fases** [visto]. São as mesmas dos indicadores da tela
  `/manifestacao-nfe`, lida no lote 7:
  1. **Pendente:** a nota chegou pela SEFAZ e ainda não teve nenhum evento.
  2. **Ciência:** a empresa avisou que conhece a nota. Isso libera o XML
     completo, mas não encerra o ciclo.
  3. **Finalizada:** houve um evento conclusivo (confirmação, desconhecimento
     ou operação não realizada).
- **O filtro não separa os eventos finais** [deduzido]. "Finalizada" junta uma
  compra confirmada e uma nota desconhecida (possível fraude). Para o
  comerciante, são situações bem diferentes.
- **Letras sem sentido aparente** (`F`, `P`, `T`) [código]. Parecem um código
  interno herdado [a verificar].
- **Origem dos dados** [deduzido; ver lote 7]: a consulta automática à SEFAZ
  (Distribuição DF-e) traz as notas, e a moldura avisa cada nota nova.

**O que o resultado deve mostrar** [deduzido; não visto]: chave, número,
emitente (nome e CNPJ), emissão, valor, situação, último evento e data do
evento. Falta saber se mostra o prazo que resta para manifestar [a verificar].

### 5. NFS-e emitidas — `/relatorios/nfse-emitidas` [visto]

**Para que serve.** Listar as notas de serviço (NFS-e) emitidas no período
[Central].

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Cliente | `id_cliente` | lupa (Pessoa) | não | — |
| Status NFS-e | `status` | **texto livre** | não | vazio, sem dica |
| — | `executar` | oculto | — | `1` |

Ações: Pesquisar e Limpar (da lupa), **Gerar** (não clicado) e o link
"Central".

**Regras e comportamento**

- **A NFS-e nasce da ordem de serviço.** No lote 13, "Gerar NFS-e" pede o
  número da OS. O relatório deve trazer a OS de origem [a verificar].
- **Filtro por cliente** com a lupa genérica de Pessoa [código].
- **Status em texto livre** [código], como no CT-e.

**O que o resultado deve mostrar** [deduzido; não visto]: número da NFS-e e do
RPS, data, tomador, serviço, valor, ISS (retido ou não) e status.

### 6. SPED — resumo fiscal do período — `/relatorios/sped-resumo-periodo` [visto]

**Para que serve.** Consolidar, por CFOP, as NF-e e NFC-e autorizadas do
período, como base para o SPED [Central].

**Filtros:** só o período (`de` e `ate`, do dia 1 do mês até hoje) e o oculto
`executar=1`. Ações: **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **Só documentos autorizados, com dois modelos juntos** (55 e 65) [Central].
- **Agrupamento por CFOP** [Central]. Equivale ao resumo analítico que o
  arquivo da EFD ICMS/IPI pede para cada documento, por CST, CFOP e alíquota
  [domínio].
- **Serve para conferir antes de gerar o arquivo** [deduzido]. O arquivo é
  gerado em outra tela: o atalho "SPED Fiscal / Contribuições", que leva a
  `/producao/sped-bloco-k`, segundo o lote 13.
- **Entradas** [a verificar]. A descrição só fala das notas emitidas. Não se
  sabe se as notas de compra entram.

**O que o resultado deve mostrar** [deduzido; não visto]: por CFOP, valor
contábil, base de ICMS, ICMS, base e valor de ST, IPI e outros, com total
geral.

### 7. ICMS — créditos e débitos do mês — `/relatorios/icms-mensal` [visto]

**Para que serve.** Somar as notas de entrada e de saída do período, com os
créditos e débitos de ICMS de cada lado [Central]. É uma prévia da apuração do
ICMS.

**Filtros:** só o período (`de` e `ate`) e o oculto `executar=1`. Ações:
**Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **Conta da apuração** [domínio]: débitos (saídas) menos créditos (entradas)
  dão o ICMS a recolher ou o saldo credor.
- **O nome diz "do mês", mas o filtro aceita qualquer intervalo** [visto]. Não
  há seletor de mês. Dá para misturar meses sem querer [deduzido].
- **Faltam itens de uma apuração completa** [deduzido; a verificar no
  resultado]. Não aparecem como filtro nem na descrição:
  - o saldo credor do mês anterior;
  - os ajustes;
  - a substituição tributária (ST);
  - o diferencial de alíquota.
- **Pouco útil no Simples Nacional** [domínio]:
  - nesse regime, o ICMS é pago dentro do DAS e, em regra, não há crédito;
  - a maioria dos pequenos comércios de alimentação está nele;
  - o relatório serve mais ao regime normal.

### 8. Pedidos Mercado Livre — `/relatorios/ml-pedidos` [visto]

**Para que serve.** Listar os pedidos que vieram do Mercado Livre, com o status
no Mercado Livre, o comprador e a nota fiscal automática [Central].

**Filtros**

| Campo | Nome enviado | Tipo | Obrig. | Opções / padrão |
|---|---|---|---|---|
| Data inicial / Data final | `de` / `ate` | data | não | do dia 1 do mês até hoje |
| Status ML | `status` | **texto livre** | não | vazio, sem dica |
| — | `executar` | oculto | — | `1` |

Ações: **Gerar** (não clicado) e o link "Central".

**Regras e comportamento**

- **Pedidos importados** [Central]. Chegam pela integração; ninguém os digita.
  A moldura avisa cada venda nova do Mercado Livre [código].
- **O status é o do Mercado Livre, não o do ERP** [Central]:
  - na API do Mercado Livre, os status de pedido vêm em inglês (por exemplo,
    `paid` e `cancelled`) [domínio];
  - com texto livre, o usuário não sabe se escreve em português ou em inglês
    [a verificar].
- **"NF automática"** [Central]:
  - o ERP emite (ou pode emitir) a nota fiscal sozinho a partir do pedido;
  - o relatório mostra se a nota saiu [deduzido];
  - falta saber quando ela é emitida, com que operação e se é enviada de volta
    ao Mercado Livre [a verificar].
- **Sem filtro de conta** [visto]. Se a empresa tiver mais de uma conta no
  Mercado Livre, o relatório mistura tudo [a verificar].

**O que o resultado deve mostrar** [deduzido; não visto]: número do pedido no
Mercado Livre, data, comprador, itens, total, tarifa, frete, status, venda
gerada no ERP e número da nota.

### 9. Anúncios Mercado Livre — `/relatorios/ml-anuncios` [Central; tela não aberta]

- **A abertura foi recusada** pela trava automática do Claude Code
  ("Third-Party Attack"). A tela não foi vista.
- **O que a Central diz** (lido antes da recusa):
  - lista os anúncios do Mercado Livre ligados a produtos do ERP, com o status
    de sincronização;
  - tem 2 filtros e sai em PDF, Excel e CSV.
- **Conclusão** [deduzido]:
  - cada anúncio fica ligado a um produto;
  - o ERP sincroniza dados com o Mercado Livre, provavelmente estoque e preço
    [a verificar];
  - o status de sincronização indica se a última atualização deu certo.

### 10. Pedidos loja virtual — `/relatorios/loja-pedidos` [Central; não tentada]

- Não foi tentada, depois da recusa na tela 9.
- **O que a Central diz:**
  - pedidos da loja virtual, com frete, cupom e status;
  - tem 3 filtros e sai em PDF, Excel e CSV.
- **Conclusão** [deduzido]:
  - o pedido da loja guarda o valor do frete e o cupom de desconto usado;
  - os 3 filtros devem ser o período (2) e o status [a verificar].

### 11. Lista de preços — `/relatorios/produtos-lista-precos` [Central; não tentada]

- Não foi tentada, depois da recusa na tela 9.
- **O que a Central diz:**
  - o cadastro de produtos com preço de compra, preço de venda, margem e saldo;
  - tem 4 filtros e sai em PDF, Excel e CSV;
  - fica no bloco Produtos.
- **Conclusão** [deduzido]:
  - a margem é calculada a partir dos dois preços;
  - o saldo é o estoque atual;
  - não se sabe se a margem é sobre o custo (markup) ou sobre a venda [a
    verificar].

### 12. Manual — `/dashboard/modulo/manual` [não tentada]

- Não foi tentada, depois da recusa na tela 9.
- Não há nenhuma informação nova sobre o manual neste lote.

---

## Fluxos de ponta a ponta

[deduzido dos filtros e das descrições, com apoio dos lotes 7, 13 e 17]

1. **Fechamento fiscal do mês (regime normal)**
   1. Durante o mês:
      - as vendas geram NFC-e ou NF-e;
      - as ordens de serviço geram NFS-e;
      - o transporte gera CT-e ou MDF-e.
   2. Compras:
      - a SEFAZ entrega as notas emitidas contra o CNPJ, e a moldura avisa;
      - a empresa dá ciência, importa o XML como entrada e confirma.
   3. Conferência por item ("NF-e itens"): NCM, CFOP e CST/CSOSN de cada
      produto. Um erro vira correção no cadastro do produto ou na tributação.
   4. Pendências a resolver:
      - manifestações em "Pendente" ou "Ciência";
      - MDF-e ainda "Autorizado" (não encerrado);
      - notas rejeitadas (outro relatório).
   5. Totais: resumo por CFOP (base do SPED) e ICMS, créditos contra débitos.
   6. Gerar o arquivo SPED em outra tela e entregar ao contador. Não se viu
      envio direto ao contador.
2. **Compra com manifestação**
   1. A SEFAZ entrega a nota (Distribuição DF-e).
   2. A moldura mostra o aviso "Nova NF-e para manifestar".
   3. Na tela de manifestação, a empresa dá ciência, o que libera o XML.
   4. A nota entra no estoque.
   5. A empresa confirma (ou registra desconhecimento ou operação não
      realizada).
   6. O relatório passa a mostrar "Finalizada".
3. **Transporte com MDF-e**
   1. A NF-e da carga é emitida.
   2. O MDF-e nasce "Pendente" e passa a "Autorizado".
   3. A viagem acontece e o MDF-e é encerrado ("Encerrado").
   4. Se der errado antes de sair, o MDF-e é cancelado ("Cancelado").
   5. O relatório filtrado por "Autorizado" mostra os que faltam encerrar.
4. **Serviço**
   1. A OS é concluída.
   2. "Gerar NFS-e" usa o número da OS.
   3. A nota vai para a prefeitura.
   4. O relatório mostra as notas por cliente e status.
5. **Mercado Livre**
   1. A conta do Mercado Livre é ligada ao ERP.
   2. Cada venda vira um pedido importado, com aviso no sino.
   3. O pedido vira venda no ERP, com NF automática.
   4. O relatório de pedidos mostra tudo isso.
   5. Em paralelo, os anúncios ligados a produtos são sincronizados, e o
      relatório de anúncios mostra o status.
6. **Loja virtual**
   1. O pedido chega com frete e cupom.
   2. O status muda ao longo do atendimento.
   3. O relatório lista os pedidos.

---

## Entidades e relações

[deduzido dos filtros, dos códigos e das descrições; os campos marcados como
"provável" não foram vistos]

| Entidade | Campos (vistos ou prováveis) | Relações |
|---|---|---|
| Documento fiscal (NF-e 55 / NFC-e 65) | número, série, chave, data, status = código da SEFAZ (100, 101…), destinatário, totais | N:1 Pessoa; 1:N Item do documento; N:N MDF-e (carga) |
| Item do documento fiscal | produto, NCM, CFOP, CST ou CSOSN, quantidade, valor, base e valor de ICMS, ST, IPI, PIS, COFINS | N:1 Documento; N:1 Produto |
| MDF-e | número, série, data, status (0 Pendente, 1 Autorizado, 2 Encerrado, 3 Cancelado); prováveis: UFs, veículo, condutor | N:N NF-e e CT-e transportados |
| CT-e | número, série, data, status (texto); prováveis: tomador, remetente, destinatário, valor do frete, ICMS | N:1 Pessoa, em vários papéis |
| DF-e recebido (manifestação) | chave, emitente, emissão, valor, situação (F Pendente, P Ciência, T Finalizada) | 1:N Evento de manifestação; 1:0..1 Entrada por XML |
| NFS-e | número, data, status (texto); prováveis: RPS, serviço, valor, ISS | N:1 Pessoa (cliente); N:1 OS |
| Pedido do Mercado Livre | número no Mercado Livre, data, status ML (texto), comprador, NF automática | 1:0..1 Venda; 1:0..1 Documento fiscal; N:1 Conta do Mercado Livre (provável) |
| Anúncio do Mercado Livre | número no Mercado Livre, status de sincronização | N:1 Produto |
| Pedido da loja virtual | data, frete, cupom, status | N:1 Cliente; N:0..1 Cupom |
| Produto | código, descrição, referência, unidade, preço de compra, preço de venda, margem, saldo | 1:N Item fiscal; 1:N Anúncio do Mercado Livre |
| Pessoa | código, nome, CPF/CNPJ; o código 1 é "Consumidor final" | papéis: cliente, tomador, destinatário |
| Relatório (catálogo) | identificador, nome, bloco, descrição, filtros, formatos (PDF, Excel, CSV) | 1:N Filtro |
| Aviso (notificação) | canal (Mercado Livre, manifestação, loja, cardápio, OS, WhatsApp, boleto), título, mensagem, valor, link, lido | aponta para o registro de origem |

---

## Integrações

| Integração | Onde aparece neste lote | Evidência |
|---|---|---|
| SEFAZ — NF-e e NFC-e | status 100/101 no filtro de itens; resumo do SPED | [código] |
| SEFAZ — MDF-e | ciclo Pendente → Autorizado → Encerrado ou Cancelado | [código] |
| SEFAZ — CT-e | relatório de CT-e emitidos | [Central] |
| SEFAZ — Distribuição DF-e e manifestação do destinatário | relatório e aviso "Nova NF-e para manifestar" | [código] |
| Prefeitura — NFS-e | relatório de NFS-e emitidas | [Central] |
| SPED EFD ICMS/IPI | resumo "base SPED" por CFOP | [Central] |
| Mercado Livre — pedidos | pedidos importados, aviso de venda nova, NF automática | [Central] e [código] |
| Mercado Livre — anúncios | anúncios ligados a produtos, status de sincronização | [Central] |
| Loja virtual própria | pedidos com frete e cupom | [Central] |
| Exportação | PDF, Excel e CSV em todos os cartões | [Central] |

Neste lote não apareceu nada sobre bancos, TEF, balança ou impressora.

---

## Observações de UX (oportunidades para nós)

1. **Status sem padrão e em texto livre.**
   - Há quatro convenções diferentes em 6 filtros. Em 3 deles, o usuário
     precisa adivinhar o valor.
   - **Para nós:** uma lista única de estados para todo documento fiscal
     (rascunho, enviando, autorizado, rejeitado, denegado, cancelado,
     encerrado, inutilizado), sempre com nome em português e seleção
     múltipla. O código e a mensagem da SEFAZ ficam num campo à parte, para
     consulta.
2. **Tudo atrás do botão "Gerar".**
   - Não há prévia, contagem nem resumo antes de gerar.
   - **Para nós:** o resultado aparece ao abrir, com o período padrão, e
     atualiza a cada filtro.
3. **Fragmentação.**
   - O bloco Fiscal tem 17 relatórios, vários repetidos para NF-e e NFC-e.
   - **Para nós:** um explorador único de documentos fiscais, com filtro de
     modelo (NFC-e, NF-e, NFS-e, CT-e, MDF-e) e as visões "por documento", "por
     item" e "por CFOP".
4. **Pendências escondidas em relatórios.**
   - MDF-e por encerrar, nota por manifestar e pedido sem nota só aparecem se
     alguém lembrar de gerar o relatório certo, com o filtro certo.
   - **Para nós:** alertas no painel, como "3 notas de compra esperando
     confirmação" ou "1 MDF-e por encerrar".
5. **"ICMS do mês" sem seletor de mês.**
   - **Para nós:** escolher a competência (mês e ano), não duas datas.
6. **A manifestação junta eventos diferentes em "Finalizada".**
   - **Para nós:** mostrar o evento (confirmada, desconhecida, não realizada) e
     o prazo que resta.
7. **Lupa em janela para escolher um único produto ou cliente.**
   - São vários cliques. O texto de orientação aparece cortado e o rótulo
     interno vem vazio.
   - **Para nós:** busca com autocompletar no próprio campo.
8. **Sem filtros guardados, agendamento ou envio ao contador.**
   - O link GET ajuda, mas não há "meus relatórios".
   - **Para nós:** um "pacote do contador" mensal (XMLs, resumo por CFOP, ICMS
     e SPED), enviado sozinho por e-mail ou link.
9. **Pouco do bloco fiscal serve ao nosso público.**
   - O pequeno comércio de alimentação costuma estar no Simples Nacional e
     emitir NFC-e. MDF-e, CT-e, apuração de ICMS e boa parte da manifestação
     são casos de nicho.
   - **Para nós:** tudo isso vira módulo opcional, ligado só para quem usa.
10. **O que vale copiar:**
    - a URL do relatório guarda os filtros (dá para mandar por link);
    - o período padrão é o mês corrente;
    - por padrão, só entram notas autorizadas;
    - todas as telas usam o mesmo molde;
    - os avisos de nota nova e de venda nova chegam sem precisar abrir a tela.

---

## Pendências

1. **`/relatorios/ml-anuncios`:** abertura recusada pela trava automática do
   Claude Code ("Third-Party Attack"). Não houve nova tentativa. Depende de
   decisão do usuário.
2. **`/relatorios/loja-pedidos`, `/relatorios/produtos-lista-precos` e
   `/dashboard/modulo/manual`:** não foram tentadas depois da recusa.
3. **Busca nos outros arquivos desta pasta** sobre essas 4 telas: recusada com
   o mesmo rótulo. Não foi repetida. Quem juntar os lotes pode cruzar depois.
4. **Resultado de todos os relatórios:** não visto, porque "Gerar" é proibido
   nesta pesquisa e a conta não tem movimento. Falta ver:
   - colunas, totais, agrupamentos e ordenação;
   - o limite de linhas;
   - o formato do PDF, do Excel e do CSV.
5. **Valores aceitos nos filtros de texto livre** (status do CT-e, da NFS-e e
   do Mercado Livre): desconhecidos. Dá para descobrir nas telas `/cte`,
   `/nfce` (aba NFS-e) e `/integracoes/mercado-livre/pedidos`, ou num
   relatório gerado.
6. **Que data cada relatório usa** (emissão, autorização ou data do pedido):
   desconhecido.
7. **SPED e ICMS:**
   - se o resumo do SPED inclui notas de entrada;
   - se o ICMS do mês inclui ST, diferencial de alíquota, saldo anterior e
     ajustes.
8. **NF automática do Mercado Livre:** quando é emitida, com que operação e
   série, e se volta para o Mercado Livre.
9. **Lupa de Pessoa:** se lista só clientes ou todas as pessoas, e se aceita
   seleção múltipla.
10. **Significado das letras `F`, `P` e `T`** da manifestação.

## Sub-rotas e endereços descobertos

| Endereço | O que é | Estado |
|---|---|---|
| `/relatorios` | Central de relatórios (catálogo) | lida (cartões das 11 telas de relatório do lote) |
| `/relatorios/{identificador}?executar=1&de=…&ate=…&status=…` | resultado de um relatório (o que "Gerar" faz) | **não aberto** |
| janela de lupa `produto` (`/lookups/produto/…`, padrão do lote 18) | pesquisa de produto | aberta e fechada (0 registros) |
| janela de lupa `pessoa` (`/lookups/pessoa/…`, padrão do lote 18) | pesquisa de pessoa | aberta e fechada (1 registro) |
| `/erp/notificacoes/ml/poll`, `/erp/notificacoes/ml` e `/erp/notificacoes/ml/{id}/lida` (POST) | avisos de venda nova do Mercado Livre | só no código da moldura |
| `/erp/notificacoes/manifestacao/poll` | avisos de NF-e para manifestar | só no código |
| `/erp/notificacoes/boleto-baixa/poll` | avisos de baixa automática de boletos | só no código |
| `/erp/notificacoes/loja/…`, `/erp/notificacoes/cardapio/…`, `/erp/notificacoes/os/…` e `/erp/notificacoes/whatsapp/…` | outros avisos da moldura | só no código |
| `/erp/navigation` | catálogo do menu, guardado no navegador por 5 minutos | só no código |
