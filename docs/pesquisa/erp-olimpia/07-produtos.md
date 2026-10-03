# 07 — Produtos e cadastros de apoio (ERP Olímpia)

> Cadastro de produtos (`/produtos`, incluindo o painel "Grupo tributário" do
> formulário), gerenciamento de produtos, grupos, subgrupos, fabricantes, cores,
> grades, NCM, cadastros de confecção (golas, mangas, tecidos, status de
> confecção) e etiquetas. Exploração de 2026-10-03, conta de teste "Boi Criolo"
> (plano Full), perfil ADMIN. A maior parte destas telas **não abriu**; o que se
> sabe vem das telas que abriram, das lupas, do checklist de migração e dos
> parâmetros da empresa.
> Legenda: [visto], [visto em parte], [deduzido], [afirmado pelo manual],
> [código] (lido no HTML/JS da página), [proposta]. Nada foi gravado no ERP.

## 1. Visão geral

- **Catálogo único** [visto no menu]. O mesmo `/produtos` aparece como "Produtos
  na Loja" (hub da Loja Virtual, bloco Catálogo), "Produtos no Cardápio" (hub do
  Cardápio Digital) e "Produtos" (hub do Mercado Livre, bloco Catálogo). "Grupos
  de Produto" aparece no menu da Loja Virtual, do Cardápio Digital, do Painel TV
  e de Cadastros. Todos os canais usam o mesmo cadastro (ver
  [04-cardapio-comanda-cozinha.md](04-cardapio-comanda-cozinha.md) e
  [06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md)).
- **Atalho fixo** [visto]: a secção "Cadastros frequentes" da barra lateral tem
  "Produtos" (`/produtos`), ao lado de Clientes e Consulta Cliente.
- **Classificação do produto** [visto nos filtros e lupas; ligação
  grupo→subgrupo deduzida]: grupo → subgrupo, mais fabricante e cor. A grade
  (tamanho/cor) é opcional por empresa: o cadastro da empresa tem a caixa "Usa
  grade (tamanho/cor)", padrão Não (ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)). Serviço é um
  produto marcado como serviço, no mesmo cadastro (há o filtro "Somente serviço"
  no relatório de produtos).
- **A conta nasce com "PADRAO"** em fabricante, subgrupo e cor, e **sem nenhum
  grupo** [visto pelas lupas]. Não há nenhum produto na conta de teste.
- **Confecção de roupas** [visto nos nomes e nos parâmetros]: golas, mangas,
  tecidos e status de confecção indicam uma parte do ERP para confecção. O grupo
  de parâmetros "Confecção" da empresa (16 opções) fala em etapas (bordado,
  fábrica, pintura, sublimação) e em campos visíveis (gola, manga, punho,
  ribana...). Destoa do foco em alimentação.
- **Origem Delphi** [visto]: as telas de grupos e subgrupos dizem ser
  "equivalentes" a `FrmProduto_Grupo` e `FrmProduto_Sub_Grupo`. É uma migração
  tela a tela do sistema desktop antigo.
- **Checklist de migração** (`/cadastros/checklist`, ver
  [08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)) [visto]: marca
  como completos Fabricantes (`/fabricantes`), Cores (`/produto-cores`), Grades
  (`/grades`), Subgrupos (`/produto-sub-grupos`), Status Confecção
  (`/confeccao-status`), Golas (`/golas`), Mangas (`/mangas`), Tecidos
  (`/tecidos`), Grupos de Produto (`/produto-grupos`) e Produto (`/produtos`, com
  a nota: série/similar e formação de preço contábil ficam para a fase 2;
  complementos de food na aba "Food/Pizza"). NCM e Etiquetas não estão no
  checklist.
- **Etiquetas** ficam no lançador do Estoque, bloco "Inventário & Controle", e no
  menu Estoque (12 itens) [visto] (ver [09-estoque.md](09-estoque.md)).

### 1.1 O que as lupas revelam sobre estes cadastros [código]

A janela de pesquisa (lupa) é a mesma em todo o ERP; o componente está descrito
em [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md). A
configuração que o servidor devolve para cada tipo (`/lookups/{tipo}/config`)
mostra os campos destes cadastros:

| Tipo de lupa | Título da janela | Colunas | Cadastro rápido ("Cadastrar novo") | Registros na conta |
| --- | --- | --- | --- | --- |
| `produto` | Produto | Código, Descrição, Ref. (`ref_fabrica`), UN (`unidade`) | o botão não apareceu (no mix de positivação, há seleção múltipla) | 0 |
| `produto_grupo` | Grupo de Produto | Código, Descrição | sim: só Descrição (obrigatória, em maiúsculas); o resto vem preenchido: status 1, comissão 0, ordem 0; código da sequência `PRODUTO_GRUPO` | 0 |
| `produto_sub_grupo` | Subgrupo de Produto | Código, Descrição, Status | sim: só Descrição; nasce com status 1 | 1 ("PADRAO") |
| `produto_cor` | Cor | Código, Descrição, Status | sim | 1 ("PADRAO") |
| `fabricante` | Fabricante | Código, Descrição, Status | sim: só Descrição (obrigatória, em maiúsculas); nasce com status 1; código da sequência `FABRICANTE` | 1 ("PADRAO") |

- O cadastro rápido grava por POST em `/lookups/{tipo}/quick` (não chamado).
- O checklist de migração confirma o padrão "criação rápida dentro do modal"
  para grupo, subgrupo, fabricante, cor e zona.
- **Status do "PADRAO" contraditório** [visto]: em várias telas a lupa mostrou o
  fabricante e o subgrupo "PADRAO" com status **"0"**, enquanto o cadastro rápido
  cria com status **1**. Noutras partes do ERP o código de "Ativo" é invertido
  entre telas (0 no grupo tributário, 1 na carga horária e em pessoas). Se 0 é
  ativo ou inativo nestes cadastros, fica **a confirmar**.
- Os códigos vêm de **sequências com nome** (`PRODUTO_GRUPO`, `FABRICANTE`), no
  estilo dos geradores do Delphi [deduzido].
- Grupo, subgrupo, fabricante e cor servem de filtro em vários relatórios
  (estoque, giro, produtos, positivação de mix): ver
  [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)
  e [19-relatorios-vendas-financeiro.md](19-relatorios-vendas-financeiro.md).

### 1.2 Parâmetros da empresa que mexem no produto [visto]

Ficam na aba Parâmetros de `/empresa/{id}` (lista completa em
[08-pessoas-empresa-acessos.md](08-pessoas-empresa-acessos.md)). Os que tocam
estes cadastros:

- **Produtos (4 opções):** saldo editável no cadastro, bloqueio de preço e
  bloqueio de alteração.
- **Vendas:** preços por forma de pagamento; preços de cartão crédito/débito no
  produto; preços por modalidade da venda (loja, retirada...); tabela de preço;
  atacado/varejo (tipo e valor); percentuais de ICMS/ST; tipo de comissão (por
  produto, entre outros).
- **Estoque:** controle de lote/validade; prateleira; a entrada atualiza o preço
  de compra (ligado) e, opcionalmente, o cadastro do produto.
- **Tela Pesquisa (7):** busca por início ou por qualquer parte; ordem por ID ou
  GTIN; mostrar saldo negativo; limite de itens.
- **Confecção (16):** etapas (bordado, fábrica, pintura, sublimação) e campos
  visíveis (gola, manga, punho, ribana...).
- **Empresa → Cadastro:** "Usa grade (tamanho/cor)", padrão Não. As colunas de
  grade e de local de estoque só aparecem nos documentos de estoque quando a
  empresa usa grade ou prateleira (ver [09-estoque.md](09-estoque.md)).

### 1.3 Campos obrigatórios do produto (configuráveis) [visto]

A tela `/parametros/campos-obrigatorios` (descrita em
[18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)) deixa cada
empresa escolher os campos obrigatórios do produto, o que também revela campos
do cadastro:

- **Sempre obrigatórios:** Descrição, Status.
- **Identificação:** GTIN/EAN, Referência fábrica, Referência loja, Unidade de
  medida (✔ ligado na conta), Descrição reduzida.
- **Classificação:** Grupo, Subgrupo, Fabricante, Cor.
- **Fiscal:** NCM (✔ ligado; necessário para NF-e/NFC-e), CEST.
- **Dimensões:** Peso líquido, Peso bruto.

A escolha vale também para o cadastro rápido feito durante a venda.

### 1.4 Rotas e estado

| Rota | Nome | Estado |
| --- | --- | --- |
| `/produtos` | Produtos (lista) | não aberta (passagem recusada; ver Pendências) |
| `/produtos/create` | Novo produto | parcial (só o painel "Grupo tributário" do bloco "Preços e tributação" foi lido) |
| `/produtos/gerenciamento` | Gerenciamento de produtos | não aberta |
| `/produto-grupos` | Grupos de Produto | lida (lista vazia, só com o filtro padrão "Ativo") |
| `/produto-grupos/create` | Novo grupo | recusada |
| `/produto-sub-grupos` | Subgrupos de Produto | lida (lista vazia) |
| `/produto-sub-grupos/create` | Novo subgrupo | não aberta (não tentada depois da recusa nos grupos) |
| `/fabricantes` | Fabricantes | não aberta (conhecida pela lupa) |
| `/produto-cores` | Cores | não aberta (conhecida pela lupa) |
| `/grades` | Grades | não aberta |
| `/ncms` | NCM | não aberta |
| `/golas` | Golas | não aberta |
| `/mangas` | Mangas | não aberta |
| `/tecidos` | Tecidos | recusada (primeira rota de uma passagem) |
| `/confeccao-status` | Status de confecção | não aberta |
| `/etiquetas` | Etiquetas | não aberta (vista como link no lançador do Estoque) |

## 2. Telas

### 2.1 `/produtos` — Produtos [não aberta]

- **Já se sabe** [visto em outras telas]:
  - É o destino de "Produtos na Loja", "Produtos no Cardápio", "Produtos" (ML) e
    do atalho "Produtos" da barra lateral.
  - Pelos relatórios e lupas, o produto tem: código, descrição, referência de
    fábrica (`ref_fabrica`), referência da loja, unidade, status
    (ativo/inativo), marcação de serviço, preço de venda, preço de compra, saldo
    por filial, GTIN, NCM, CEST, pesos bruto e líquido, grupo, subgrupo,
    fabricante e cor.
  - O estoque é **por filial** (empresa logada) e, se a empresa usar, por local
    (Geral, Prateleira, Reserva, Entrega futura) e por grade (ver
    [09-estoque.md](09-estoque.md)).
  - Na integração com o Mercado Livre, o SKU do anúncio é comparado com o "ID
    integração" ou com o código do produto [afirmado pelo manual] (ver
    [06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md)). Ou seja,
    o produto tem um campo "ID integração".
  - O lookup de produto busca em `/lookups/produto/search`; o balanço procura
    por descrição, ID, GTIN ou referência; a entrada por XML liga cada item a um
    produto pelo GTIN ou pela referência (ver [09-estoque.md](09-estoque.md)).
- **Perguntas para a próxima passagem:**
  - Lista: colunas, busca (nome, código, código de barras), filtros (grupo,
    subgrupo, fabricante, ativo/inativo, com/sem estoque, canal), ações por linha
    e em massa, exportação, impressão de etiquetas.
  - Regras: como preço e margem se calculam um a partir do outro; geração de
    código de barras interno; validação do NCM; bloqueio de código repetido.
  - Que outras sub-rotas existem (detalhe/edição).

#### `/produtos/create` — Novo produto [visto em parte]

- **Bloco "Preços e tributação" → painel "Grupo tributário: documento ·
  movimento · tipo de operação"** [visto]:
  - busca "Filtrar grupo…";
  - contador de grupos marcados;
  - lista com caixas de marcar, agrupada por documento e movimento (ex.: NF-e ·
    Saída) e depois por operação (ex.: Venda, Venda PDV ON);
  - em cada item, a descrição do grupo e um resumo da CST e da alíquota de ICMS.
    De propósito, os valores desse resumo não foram copiados (a leitura dos
    valores do grupo tributário foi recusada noutra tela).
  - **Um produto marca vários grupos** (relação N:N). [deduzido] Na emissão vale o
    grupo do produto que casa com o documento e a operação escolhidos.
  - O cadastro dos grupos (`/grupos-tributarios`) está em
    [13-fiscal.md](13-fiscal.md).
- **Aba "Food/Pizza"** [visto no checklist]: complementos de food. Não vista.
- **Perguntas:** que abas e campos existem além disso (dados gerais, preços com
  custo/margem/promoção/atacado, estoque com mínimo/máximo/lote/validade/produto
  de balança, grade, fotos, canais, ficha técnica, adicionais do cardápio,
  comissão por produto, campos de confecção).

### 2.2 `/produtos/gerenciamento` — Gerenciamento de produtos [não aberta]

- **Já se sabe:** só que a rota existe (vista como sub-rota).
- **Perguntas:** é alteração em massa (preço, NCM, grupo, ativo/inativo),
  reajuste em %, importação ou exportação por planilha? Mostra prévia antes de
  aplicar? Guarda histórico de quem mudou o quê?

### 2.3 `/produto-grupos` — Grupos de Produto [visto]

- **Objetivo:** consultar e cadastrar grupos de produto, a classificação
  compartilhada por todos os canais.
- **Cabeçalho:** "equivalente a `FrmProduto_Grupo`". Botão "Novo" →
  `/produto-grupos/create`.
- **Filtros** (GET):

| Filtro | Tipo | Opções |
| --- | --- | --- |
| Parâmetro | lista | Descrição · ID |
| Valor | texto | valor a procurar |
| Status | lista | Todos · Ativo (padrão) · Inativo |
| Ordem | lista | Descrição · ID · Ordem |

  Botões "Pesquisar" e "Limpar filtros".
- **Colunas:** ID, Descrição, **Comissão %**, **Ordem**, Status, Ações. Com o
  filtro padrão (Ativo) não há nenhum registro.
- **Regras:**
  - O grupo tem **percentual de comissão**: a comissão do vendedor pode ser
    definida por grupo de produto [visto].
  - O grupo tem **Ordem**; [deduzido] serve para ordenar as categorias na
    vitrine, no cardápio e no painel TV.
  - Ativo/Inativo em vez de apagar; a lista abre só com os ativos.
  - Pelo cadastro rápido da lupa, o grupo guarda descrição, status, comissão % e
    ordem; o código sai da sequência `PRODUTO_GRUPO`.
- **Formulário "Novo": não lido** (abertura recusada). Mudar o filtro de status
  para "Todos" também foi recusado.

### 2.4 `/produto-sub-grupos` — Subgrupos de Produto [visto]

- **Cabeçalho:** "equivalente a `FrmProduto_Sub_Grupo`". Botão "Novo" →
  `/produto-sub-grupos/create`.
- **Filtros** (GET, parâmetros `parametro`, `valor`, `status`, `ordem`):
  Parâmetro (Descrição · ID), Valor (texto), Status (Todos · Ativo [padrão] ·
  Inativo), Ordem (Descrição · ID). Botões "Pesquisar", "Limpar filtros" e "Novo".
- **Colunas:** ID, **Foto**, Descrição, Status, Ações. Nenhum subgrupo ativo na
  lista (a lupa, porém, mostra o "PADRAO"; ver 1.1).
- **Regras:**
  - O subgrupo tem **foto**; [deduzido] é a imagem da categoria na vitrine ou no
    cardápio.
  - A lista **não mostra o grupo pai**. Não dá para afirmar se o subgrupo
    pertence a um grupo ou se é uma segunda classificação independente.
- **Formulário "Novo": não aberto.**

### 2.5 `/fabricantes` — Fabricantes [não aberta; conhecida pela lupa]

- **Já se sabe** [código]: código (sequência `FABRICANTE`), descrição (em
  maiúsculas), status. Cadastro rápido pela lupa. A conta tem só o "PADRAO".
- **Perguntas:** a tela tem mais campos (CNPJ, contato)? O fabricante serve só
  para filtro e relatório ou vai para a nota e para o anúncio (marca)?

### 2.6 `/produto-cores` — Cores [não aberta; conhecida pela lupa]

- **Já se sabe** [código]: lupa `produto_cor`, colunas Código, Descrição,
  Status, com cadastro rápido. A conta tem só a "PADRAO". O checklist chama este
  cadastro de "Cores".
- **Perguntas:** tem amostra da cor? Onde a cor é usada: grade do produto,
  variações do Mercado Livre, loja virtual?

### 2.7 `/grades` — Grades [não aberta]

- **Já se sabe:** a empresa liga a grade com "Usa grade (tamanho/cor)"; os itens
  de entrada, saída, transferência, balanço e o log de estoque guardam a grade
  (padrão "UN") [visto, ver [09-estoque.md](09-estoque.md)]. O checklist lista
  "grades-filhas" (documentos, série, medidas, preços, kit...) como padrão global,
  mas isso é outra coisa (sub-tabelas do formulário).
- **Perguntas:** uma grade é uma lista de tamanhos (P, M, G; 36 a 44)? Combina
  com as cores para formar cada variação vendável? Cada variação tem código de
  barras, estoque e preço próprios? Dá para trocar a grade de um produto com
  estoque?

### 2.8 `/ncms` — NCM [não aberta]

- **Já se sabe:** o menu Fiscal lista NCM (`/ncms`) entre os cadastros com
  impacto fiscal (ver [13-fiscal.md](13-fiscal.md)). O NCM é campo do produto e
  está ligado como obrigatório na conta ("necessário para NF-e/NFC-e"). Os itens
  da NF-e trazem o NCM (relatório de itens fiscais, ver
  [21-relatorios-estoque-compras-fiscal.md](21-relatorios-estoque-compras-fiscal.md)).
- **Perguntas:** a tabela vem pronta (oficial) ou a empresa cadastra? Campos
  (código de 8 dígitos, descrição, CEST, percentuais aproximados de imposto)?
  Valida contra a tabela oficial? Atualiza sozinha?

### 2.9 `/golas` — Golas [não aberta]

- **Já se sabe:** está no checklist como completo. O parâmetro "Confecção" tem a
  gola entre os campos visíveis.
- **Perguntas:** cadastro simples (só nome)? Entra no produto, no pedido
  personalizado ou na ordem de produção (uniformes)? Muda o preço?

### 2.10 `/mangas` — Mangas [não aberta]

- **Já se sabe:** está no checklist como completo. O parâmetro "Confecção" tem a
  manga entre os campos visíveis.
- **Perguntas:** as mesmas das golas (ex.: manga longa mais cara?).

### 2.11 `/tecidos` — Tecidos [recusada]

- **Já se sabe:** está no checklist como completo. Foi a primeira rota de uma
  passagem e a navegação foi recusada antes de a página carregar.
- **Perguntas:**
  - Campos: código, descrição, composição (ex.: algodão e poliéster), gramatura,
    largura, cor ou estampa, fornecedor, unidade (metro ou quilo), custo,
    estoque mínimo?
  - O tecido é um produto do estoque (insumo) ou um cadastro à parte?
  - Liga com compras (fornecedor, entrada de nota) e com a ficha técnica da peça
    (quanto tecido cada peça gasta)?

### 2.12 `/confeccao-status` — Status de confecção [não aberta]

- **Já se sabe:** está no checklist ("Status Confecção") como completo. O
  parâmetro "Confecção" cita etapas de bordado, fábrica, pintura e sublimação.
- **Perguntas:**
  - É uma lista de etapas montada pelo cliente (corte, costura, acabamento,
    passadoria, embalagem)? Tem ordem, cor, etapa final?
  - O que muda o status: alguém da produção, um leitor de código de barras?
  - Liga com ordem de produção, OS ou pedido de venda?
  - Existe etapa feita fora (oficina terceirizada, a "facção"), com envio e
    retorno de peças?
  - A etapa final dá entrada do produto pronto no estoque?

### 2.13 `/etiquetas` — Etiquetas [não aberta]

- **Já se sabe:**
  - Cartão "Etiquetas" no lançador do Estoque, bloco "Inventário & Controle"
    [visto] (ver [09-estoque.md](09-estoque.md)).
  - **Impressão pelo Olimpia Bridge** [código, lido no script do Bridge; ver
    [17-consultoria-ia.md](17-consultoria-ia.md) e
    [18-parametros-plano-comissoes.md](18-parametros-plano-comissoes.md)]: as telas
    de etiquetas chamam o agente local (`127.0.0.1:9876`). Etiquetas em ZPL, EPL ou
    ESC-POS vão **uma por job**, com 250 ms de intervalo (a Elgin L42 enche o
    buffer). Uma folha de etiquetas em grade é montada como um único SVG,
    convertido em PNG (300 dpi por padrão) e enviado num job só, com colunas,
    largura e altura em mm, espaçamentos e margens. Os Parâmetros do Sistema têm o
    campo "Impressora de etiquetas (Elgin L42 / Bridge)".
  - A etiqueta da **balança** (modelo, peso ou valor, dígitos) é outra coisa e
    fica nos Parâmetros do Sistema (ver 18).
- **Perguntas:**
  - É impressão de etiquetas de produto (código de barras, preço, tamanho, cor) ou
    cadastro de modelos (layout)?
  - Inclui a etiqueta têxtil obrigatória (composição, cuidados de lavagem, CNPJ,
    país de origem, tamanho)? Isto é conhecimento das regras do Inmetro, não visto
    no ERP.
  - De onde vêm os itens: produto avulso, entrada de nota, grade, ordem de
    produção?

## 3. Fluxos de ponta a ponta

Nenhum foi visto funcionando. Encadeamentos prováveis, **a verificar**:

1. **Montar o catálogo** [visto em parte]: grupos (com comissão e ordem) e
   subgrupos (com foto) → fabricante, cor e grade → produto (com grupos
   tributários marcados) → aparece na loja, no cardápio e no Mercado Livre. Grupo,
   subgrupo, fabricante e cor podem ser criados de dentro das lupas, sem sair da
   tela.
2. **Regras fiscais do produto** [visto em parte; ver [13-fiscal.md](13-fiscal.md)]:
   cadastrar os grupos tributários → no produto, marcar os grupos que valem → na
   venda, no PDV ou na OS, a operação (ex.: VENDA, VENDA PDV ON) e o documento
   (NF-e ou NFC-e) apontam o grupo → CFOP, CST e alíquotas vão para a nota.
3. **Mercado Livre** (ver [06-loja-virtual-mercado-livre.md](06-loja-virtual-mercado-livre.md)):
   cadastrar produto → definir grade e cores → publicar ou vincular anúncio (SKU =
   código ou ID integração) → manter preço e estoque iguais nos dois lados.
4. **Confecção** (hipótese): tecido (insumo) → peça em produção → status por
   etapa → produto pronto no estoque → etiqueta → venda.
5. **Compra e custo** (ver [09-estoque.md](09-estoque.md)): a entrada atualiza o
   preço de compra e, se o parâmetro mandar, o cadastro do produto.

## 4. Entidades e relações

| Entidade | Campos vistos ou deduzidos | Relações |
| --- | --- | --- |
| Produto | código, descrição, descrição reduzida, ref. fábrica, ref. loja, GTIN/EAN, unidade, status, marcação de serviço, preço de venda, preço de compra, saldo por filial (e por local e grade), NCM, CEST, pesos bruto e líquido, ID integração | N:1 Grupo, Subgrupo, Fabricante, Cor; **N:N Grupo tributário**; 1:N itens de venda, entrada, saída, balanço, transferência; 0..N vínculos com anúncios do ML |
| Grupo de produto | código (sequência `PRODUTO_GRUPO`), descrição (maiúsculas), comissão %, ordem, status | 1:N Produtos; compartilhado por loja, cardápio e painel TV |
| Subgrupo de produto | código, foto, descrição, status | 1:N Produtos; ligação com o grupo a confirmar |
| Fabricante | código (sequência `FABRICANTE`), descrição (maiúsculas), status | 1:N Produtos |
| Cor | código, descrição, status | 1:N Produtos; [deduzido] parte da grade |
| Grade | não vista | itens de estoque guardam a grade (padrão "UN") |
| NCM | não visto | N:1 a partir do Produto |
| Gola, Manga, Tecido, Status de confecção | não vistos | uso a confirmar (produto, pedido ou produção) |
| Etiqueta (ou modelo de etiqueta) | não vista | impressa pelo Bridge |
| Grupo tributário | ver [13-fiscal.md](13-fiscal.md) | N:N Produto |

"PADRAO" em fabricante, subgrupo e cor é criado junto com a conta.

## 5. Integrações

- **Canais próprios:** Loja Virtual e Cardápio Digital usam o mesmo cadastro (ver
  04 e 06).
- **Mercado Livre:** vínculo anúncio ↔ produto por tabela de vínculos ou por SKU
  (ver 06).
- **SEFAZ:** NCM e CEST no item da nota; grupo tributário por produto (ver 13).
- **Impressora de etiquetas** (Elgin L42, ZPL/EPL) e folhas em grade, pelo Olimpia
  Bridge (ver 17 e 18).

## 6. Oportunidades de UX

1. **Listas com 4 controles para filtrar** (parâmetro, valor, status, ordem) e
   filtro padrão "Ativo" que esconde o resto. [proposta] Uma caixa de busca única,
   ordenação no cabeçalho e um seletor de status visível.
2. **Nomes internos à mostra** ("equivalente a FrmProduto_Grupo"): ruído para o
   usuário. Não repetir.
3. **Subgrupo sem grupo pai visível** na lista: não se percebe a hierarquia.
   [proposta] Categoria → subcategoria explícita, com foto e ordem nas duas.
4. **Cadastro dentro de filtro:** as lupas de fabricante, grupo e subgrupo deixam
   cadastrar um item novo a partir de um filtro de relatório, o que pode criar
   cadastros sem querer. [proposta] Os filtros só filtram.
5. **Status "0" no PADRAO contra status 1 do cadastro rápido**: falta padrão no
   código de ativo. [proposta] Status com nome explícito.
6. **Vale copiar:** o cadastro rápido dentro da lupa nos formulários (não nos
   filtros); a comissão e a ordem no próprio grupo; um catálogo único para todos
   os canais.
7. **Confecção para todos:** golas, mangas, tecidos e etapas aparecem num ERP que
   também atende restaurantes. [proposta] Só mostrar a parte de confecção para
   quem é confecção (módulo opcional).

## 7. Pendências

- **Recusas e telas não abertas.** O classificador do modo automático do Claude
  Code recusou, com o motivo "Third-Party Attack": a primeira rota de uma passagem
  (o que impediu `/produtos`, `/produtos/gerenciamento`, `/fabricantes`,
  `/produto-cores`, `/grades`, `/ncms`, `/golas` e `/mangas`); a rota `/tecidos`
  (o que impediu também `/confeccao-status` e `/etiquetas`); o formulário
  `/produto-grupos/create`; mudar o filtro de status para "Todos"; e a leitura do
  HTML por script a partir da tela de grupos. Não foi problema de credencial: a
  sessão estava ativa. Nada foi gravado nem clicado no ERP. Completar depende de o
  dono da conta autorizar a leitura.
- **Formulários "Novo"** de grupo e subgrupo (o subgrupo tem grupo pai?).
- **Formulário completo do produto:** abas, campos, regras de preço e margem,
  código de barras interno, aba "Food/Pizza", campos de confecção.
- **Valores dos grupos tributários** no painel do produto (recusado na tela de
  edição do grupo; ver 13).
- **Status "0" do PADRAO**: se 0 é ativo ou inativo.
- **Grade:** estrutura (tamanhos × cores), código de barras e preço por variação.
- **Confecção:** em que menu ficam tecidos, status de confecção e etiquetas; para
  que servem golas e mangas; como se liga à produção.
- **Sem dados na conta:** nenhum produto nem grupo; ações por linha não vistas.

## 8. Sub-rotas descobertas

- `/produtos/create` (painel "Grupo tributário" no bloco "Preços e tributação").
- `/produtos/gerenciamento`.
- `/produto-grupos/create`, `/produto-sub-grupos/create`.
- `/produto-sub-grupos?parametro=…&valor=…&status=…&ordem=…` (filtro por GET).
- Endpoints de lupa: `/lookups/{tipo}/config`, `/lookups/{tipo}/search?q=&page=`,
  `/lookups/{tipo}/{id}`, `/lookups/{tipo}/quick` (POST), para `produto`,
  `produto_grupo`, `produto_sub_grupo`, `produto_cor` e `fabricante`;
  `/lookups/produto/search`.
