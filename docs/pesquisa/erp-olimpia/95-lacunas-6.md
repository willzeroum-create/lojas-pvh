# 95 — Lacunas, lote 6: confecção (tecidos, status, etiquetas), cadastros, pessoas, cargos, carga horária, formas de pagamento, usuários e grupos (ERP Olímpia)

> **Estado: NÃO EXPLORADO.** Tentativa em 2026-10-03. Nenhuma das 12 telas
> deste lote abriu. Este arquivo **não descreve o ERP**. Ele explica, em
> palavras simples, por que a exploração parou e o que fazer para destravar.
> O pouco que aparece como "já se sabe" vem de outros arquivos desta pasta,
> com a origem indicada. Tudo o que está como "pergunta" ou "a verificar"
> **não foi visto**.

## Em palavras simples

1. **A senha está certa. Não precisa mandar de novo.** O site nem chegou a
   abrir, então a senha nem foi usada.
2. **Quem disse "não" foi o Claude Code, não o site da Olímpia.** O Claude
   Code tem uma trava automática (a do "modo automático"). Ela confere cada
   ação antes de acontecer. Para abrir o site da Olímpia, ela respondeu
   **não**, com o motivo "Third-Party Attack". Quer dizer: ela acha que
   vasculhar o sistema de outra empresa pode prejudicar essa empresa.
3. **Eu não consigo desligar essa trava, e não devo passar por cima dela.**
   Tentar por outra aba, outro navegador ou outra ferramenta seria fazer
   justamente o que ela proibiu.
4. **Só você pode liberar.** Veja abaixo. São poucos passos.
5. **Sem liberar, todo lote vai parar no mesmo ponto.** Rodar de novo sem
   mudar nada dá o mesmo "não".

## Como liberar (escolha UMA opção)

**Opção A: aprovar na hora.**

1. Troque o modo de permissão da sessão de **automático** para o modo que
   **pede permissão** (no terminal, a tecla Shift+Tab alterna os modos).
2. Rode este lote de novo.
3. Quando aparecer o pedido para abrir `erp.olimpiasistemas.com.br`, clique
   em **Permitir**.

Ponto fraco: pede um clique seu a cada página e a cada clique do agente. Em
12 telas, são dezenas de pedidos.

**Opção B: liberar nas configurações.**

1. No Claude Code, use o comando `/permissions` e adicione na lista
   **Allow** estas ferramentas do navegador embutido:
   - `mcp__Claude_Browser__navigate` (abrir páginas)
   - `mcp__Claude_Browser__get_page_text` (ler o texto)
   - `mcp__Claude_Browser__read_page` (ler campos e botões)
   - `mcp__Claude_Browser__find` (achar um botão ou campo)
   - `mcp__Claude_Browser__computer` (clicar para abrir filtros e janelas
     "Novo")
2. Rode este lote de novo.

Cuidado: a regra vale para **qualquer site** aberto no navegador embutido,
não só para a Olímpia. A última ferramenta (`computer`) deixa o agente clicar
em qualquer coisa. A própria mensagem de recusa diz que uma regra de
permissão libera esse tipo de ação.

## O que aconteceu (registro técnico)

- Data: 2026-10-03.
- Abri uma aba só minha no navegador embutido (`tab-34`). A aba do usuário
  (`tab-1`) não foi tocada.
- Tentei abrir a primeira rota:
  `https://erp.olimpiasistemas.com.br/tecidos`.
- O classificador do modo automático recusou **antes** de a página carregar.
  Motivo informado: "Third-Party Attack".
- A recusa vale para o objetivo inteiro (ler o ERP da Olímpia), e não só para
  aquela rota. Por isso não tentei as outras 11 rotas, nem outra aba, outro
  navegador ou outra ferramenta.
- Fechei a minha aba (`tab-34`). No ERP nada foi lido, clicado, digitado ou
  gravado.
- No repositório, só este arquivo foi criado.

## Rotas do lote

| # | Rota | Pista sobre a tela (origem) | Estado |
|---|---|---|---|
| 1 | `/tecidos` | só o nome da rota: cadastro de tecidos | **recusada** pela trava |
| 2 | `/confeccao-status` | só o nome da rota: etapas ou estados da confecção | não tentada (mesma recusa) |
| 3 | `/etiquetas` | só o nome da rota: etiquetas | não tentada (mesma recusa) |
| 4 | `/dashboard/modulo/cadastros` | entrada do módulo Cadastros; os módulos Fiscal e Parâmetros têm entrada em forma de grade de atalhos (arquivos 13 e 18) | não tentada (mesma recusa) |
| 5 | `/pessoas` | cadastro de pessoas; o arquivo 13 fala em cadastro único de pessoas, com tipos | não tentada (mesma recusa) |
| 6 | `/pessoas?tipo=cliente` | atalho "Clientes" da barra lateral (arquivos 18 e 20) | não tentada (mesma recusa) |
| 7 | `/consulta-cliente` | atalho "Consulta Cliente" da barra lateral e de "Cadastros frequentes" (arquivos 13, 18 e 20) | não tentada (mesma recusa) |
| 8 | `/colaborador-cargos` | só o nome da rota: cargos dos colaboradores | não tentada (mesma recusa) |
| 9 | `/carga-horarias` | só o nome da rota: carga horária ou jornada | não tentada (mesma recusa) |
| 10 | `/forma-pagamentos` | formas de pagamento; a OS exige uma (arquivo 14) | não tentada (mesma recusa) |
| 11 | `/usuarios` | usuários do ERP; o menu do topo mostra o perfil "ADMIN" (arquivos 13, 18 e 20) | não tentada (mesma recusa) |
| 12 | `/usuario-grupos` | só o nome da rota: grupos de usuários (permissões) | não tentada (mesma recusa) |

Sub-rotas descobertas nesta passagem: nenhuma.

As rotas 4 a 12 já tinham ficado pendentes no grupo 08 (arquivo
`08-pessoas-empresa-acessos.md`), pelo mesmo bloqueio. As rotas 1 a 3 não
aparecem em nenhum outro arquivo desta pesquisa.

## Visão geral do módulo

Não observada. Pistas de outras passagens (não foram revistas agora):

- Os módulos do ERP têm uma página de entrada em `/dashboard/modulo/<nome>`,
  com cartões de atalho e sem indicadores (Fiscal no arquivo 13, Parâmetros no
  arquivo 18). É provável que Cadastros siga o mesmo padrão. **A verificar.**
- O menu lateral tem a seção "Cadastros frequentes" com Produtos, Clientes e
  Consulta Cliente (arquivo 13).
- O atalho "Clientes" abre `/pessoas?tipo=cliente`. Isso sugere uma tabela
  única de pessoas, filtrada por tipo. O arquivo 13 cita pessoa nos papéis de
  cliente, consumidor e transportadora; os arquivos 14 e 20 citam colaborador,
  vendedor e técnico, com código, nome e CPF/CNPJ.
- Tecidos, status de confecção e etiquetas indicam uma parte do ERP para
  **confecção de roupas**. Não se sabe em que módulo ficam (Produção? Estoque?
  Cadastros?).

## Telas

Nenhuma tela foi vista. Em cada uma ficam o que já se sabe (com a origem) e
as perguntas para a próxima passagem. **Perguntas não são constatações.**

### 1. `/tecidos`

- **Já se sabe:** nada.
- **Perguntas:**
  - Campos: código, descrição, composição (ex.: algodão e poliéster),
    gramatura, largura, cor ou estampa, fornecedor, unidade (metro ou quilo),
    custo, estoque mínimo?
  - O tecido é um produto do estoque (insumo) ou um cadastro à parte?
  - Liga com compras (fornecedor, entrada de nota) e com a ficha técnica da
    peça (quanto tecido cada peça gasta)?

### 2. `/confeccao-status`

- **Já se sabe:** nada.
- **Perguntas:**
  - É uma lista de etapas que o próprio cliente monta (ex.: corte, costura,
    acabamento, passadoria, embalagem)? Tem ordem, cor, etapa final?
  - O que muda o status: alguém da produção, um leitor de código de barras?
  - Liga com ordem de produção, com OS ou com pedido de venda?
  - Existe etapa feita fora (oficina terceirizada, a "facção"), com envio e
    retorno de peças?
  - A etapa final dá entrada do produto pronto no estoque?

### 3. `/etiquetas`

- **Já se sabe:** nada. O arquivo 18 levanta a hipótese de etiquetas
  também aparecerem em Utilitários; não confirmado.
- **Perguntas:**
  - É impressão de etiquetas de produto (código de barras, preço, tamanho,
    cor) ou cadastro de modelos de etiqueta (layout)?
  - Inclui a etiqueta têxtil obrigatória (composição, cuidados de lavagem,
    CNPJ, país de origem, tamanho)? Isto é conhecimento das regras do Inmetro,
    **não visto no ERP**.
  - De onde vêm os itens: produto avulso, entrada de nota, grade de
    tamanhos e cores, ordem de produção?
  - Que impressora: térmica (linguagens ZPL ou PPLA), folha A4?

### 4. `/dashboard/modulo/cadastros`

- **Já se sabe:** padrão das outras páginas de entrada (arquivos 13 e 18).
- **Perguntas:**
  - Quais cartões existem e para que rotas levam. Este é o mapa do módulo:
    convém abrir esta tela **primeiro** na próxima passagem.
  - O roteiro do grupo 08 também listava `/empresa`, `/plano-contas`,
    `/municipios`, `/zonas`, `/bairros`, `/veiculos`, `/rotas` e
    `/cadastros/checklist`. Falta confirmar se estão nesta tela.

### 5. `/pessoas` e 6. `/pessoas?tipo=cliente`

- **Já se sabe:**
  - O atalho "Clientes" abre a rota 6 (arquivos 18 e 20).
  - A janela de pesquisa com lupa de Colaborador mostra Código, Nome e
    CPF/CNPJ (arquivo 20).
  - A pesquisa genérica tem "Cadastrar novo", que abre um cadastro rápido
    ("Salvar e selecionar") sem sair da tela (arquivo 13).
  - Na OS, cliente é obrigatório (arquivo 14). Na força de vendas, o cliente
    tem telefone, bairro e rota (arquivo 14).
- **Perguntas:**
  - Que tipos existem (cliente, fornecedor, colaborador, vendedor, técnico,
    transportadora, consumidor)? Uma pessoa pode ter vários tipos ao mesmo
    tempo?
  - Pessoa física e jurídica: validação de CPF e CNPJ, busca do CNPJ na
    Receita para preencher sozinho, busca de endereço pelo CEP.
  - Dados fiscais para a nota: inscrição estadual, contribuinte de ICMS ou
    não.
  - Dados de venda: limite de crédito, bloqueio, condição de pagamento
    padrão, tabela de preço, vendedor, rota, bairro, zona.
  - Vários endereços (entrega) e vários contatos? Campo de WhatsApp?
  - Ligação com cashback e portal do cliente (arquivo 12, não explorado).
  - Consentimento da LGPD?

### 7. `/consulta-cliente`

- **Já se sabe:** é atalho fixo na barra lateral e em "Cadastros
  frequentes" (arquivos 13, 18 e 20).
- **Perguntas:**
  - É uma ficha completa do cliente (compras, contas em aberto, OS, crédito,
    cashback) ou uma consulta de crédito fora do ERP (SPC, Serasa)?
  - Mostra limite usado e disponível? Bloqueia a venda?
  - Por que existe separada do cadastro de clientes (rota 6)?

### 8. `/colaborador-cargos`

- **Já se sabe:** nada sobre a tela. O colaborador recebe comissão
  (arquivo 20).
- **Perguntas:**
  - Campos: nome do cargo, código CBO, salário base, comissão padrão?
  - Liga com folha (arquivo 16), ponto (arquivo 15) e comissões (arquivo 20;
    lá ficou pendente onde se configura o percentual de comissão)?

### 9. `/carga-horarias`

- **Já se sabe:** nada.
- **Perguntas:**
  - Campos: horas por dia e por semana, entrada, saída e intervalo por dia da
    semana, tolerância, escalas (ex.: 12x36), banco de horas?
  - Liga ao colaborador e ao ponto eletrônico (`/ponto/dashboard`, que existe
    na barra lateral; arquivo 18)?

### 10. `/forma-pagamentos`

- **Já se sabe:** a OS exige uma forma de pagamento, escolhida por pesquisa
  com lupa (arquivo 14).
- **Perguntas:**
  - Tipo: dinheiro, PIX, cartão de crédito, cartão de débito, boleto,
    crediário, cheque, vale?
  - Código da forma de pagamento na NF-e e na NFC-e (tabela da SEFAZ, ex.: 01
    dinheiro, 03 crédito, 04 débito, 15 boleto, 17 PIX). Conhecimento de
    domínio, **não visto no ERP**.
  - Parcelas e prazos, taxa da operadora, prazo para o dinheiro cair, conta
    bancária de destino.
  - Gera conta a receber? Exige cliente identificado (crediário)?
  - Abre maquininha (TEF) ou QR de PIX?
  - Em que canais aparece: balcão, PDV, cardápio digital, loja virtual?
    Permite troco?

### 11. `/usuarios`

- **Já se sabe:**
  - O menu do topo mostra o perfil "ADMIN" (arquivos 13, 18 e 20).
  - O app do técnico tem login próprio (empresa, usuário e senha), separado
    do ERP (arquivo 14).
  - A força de vendas libera aparelhos, com limite pelo plano (arquivo 14).
- **Perguntas:**
  - Campos: nome, login ou e-mail, grupo, filiais permitidas, ligação com
    colaborador ou vendedor, caixa padrão, desconto máximo, ativo ou inativo.
  - O plano limita o número de usuários?
  - Troca de senha, verificação em duas etapas, horário de acesso, registro
    de acessos?

### 12. `/usuario-grupos`

- **Já se sabe:** nada.
- **Perguntas:**
  - Como são as permissões: por tela, ou por ação (ver, criar, editar,
    excluir)?
  - Permissões especiais: dar desconto, cancelar venda, fazer sangria, liberar
    crédito. Isto pode ligar com `/financeiro/liberacoes` (lote 2, também não
    explorado).
  - Um usuário pode estar em mais de um grupo?

## Fluxos de ponta a ponta

Nenhum foi observado. Caminhos para a próxima passagem **confirmar ou
desmentir**:

- **Confecção:** tecido (insumo) → peça em produção → status por etapa →
  produto pronto no estoque → etiqueta → venda.
- **Acesso:** grupo de usuários (permissões) → usuário (ligado a um
  colaborador?) → entrada no ERP → só as telas liberadas.
- **Pessoas:** cadastro da pessoa com tipo → aparece nas pesquisas com lupa
  (venda, OS, comissões) → consulta do cliente.
- **RH:** cargo + carga horária → colaborador → ponto eletrônico → folha.
- **Pagamento:** forma de pagamento → venda, OS ou caixa → conta a receber e
  conta bancária → código da forma de pagamento na nota fiscal.

## Entidades e relações

| Entidade | Já se sabe (origem) | A verificar |
|---|---|---|
| Pessoa | código, nome, CPF/CNPJ; papéis de cliente, consumidor e transportadora (arquivo 13), colaborador, vendedor e técnico (arquivos 14 e 20); o cliente tem telefone, bairro e rota (arquivo 14) | se uma pessoa tem vários papéis; endereços; dados fiscais e de crédito |
| Colaborador | pessoa no papel de vendedor ou técnico; recebe comissão (arquivo 20) | ligação com Cargo, Carga horária e Usuário |
| Cargo | — | campos; um cargo para vários colaboradores? |
| Carga horária | — | campos; ligação com o ponto |
| Forma de pagamento | obrigatória na OS (arquivo 14) | tipo, código fiscal, prazos, taxas, conta bancária |
| Usuário | perfil "ADMIN" visível no topo (arquivos 13, 18 e 20) | grupo, filiais, ligação com colaborador |
| Grupo de usuários | — | permissões por tela ou por ação |
| Tecido | — | tudo |
| Status de confecção | — | tudo |
| Etiqueta (ou modelo de etiqueta) | — | tudo |

## Integrações pressupostas (nenhuma vista)

- **Receita Federal:** busca do CNPJ para preencher o cadastro de pessoa
  jurídica.
- **Busca de CEP:** endereço automático.
- **SEFAZ:** dados fiscais da pessoa (inscrição estadual) e código da forma
  de pagamento nas notas. A emissão de NF-e e NFC-e existe (arquivo 13).
- **SPC ou Serasa:** só se "Consulta Cliente" for consulta de crédito.
- **Maquininha (TEF) e PIX:** nas formas de pagamento.
- **Impressora de etiquetas:** nas etiquetas.
- **Ponto eletrônico:** na carga horária (arquivo 15, não explorado).
- **WhatsApp:** contato do cliente. Existem janelas globais de "Novo pedido
  WhatsApp" (arquivo 13).

## Observações de UX

Nada novo foi visto nesta passagem. Observações de outros arquivos que
afetam estas telas:

- **Barra lateral só com ícones, sem nome** (arquivos 18 e 20). "Clientes" e
  "Consulta Cliente" são dois ícones com funções parecidas. A verificar se
  isso confunde.
- **Escolher uma pessoa custa vários passos:** lupa, depois "Buscar", depois
  clicar na linha; a janela abre vazia (arquivo 20). Para nós: campo único
  com sugestões enquanto se digita.
- **"Cadastrar novo" dentro da pesquisa é bom** (arquivo 13): cadastra sem
  sair da tela. Vale manter.
- **Ideias nossas (não são observações do ERP):** um cadastro de pessoa com
  vários papéis, em vez de cadastros separados; perfis de acesso prontos
  (dono, caixa, garçom, cozinha) em vez de uma grade enorme de permissões; a
  parte de confecção só aparece para quem é confecção (módulo opcional).

## Pendências

- **As 12 rotas deste lote**, todas: `/tecidos`, `/confeccao-status`,
  `/etiquetas`, `/dashboard/modulo/cadastros`, `/pessoas`,
  `/pessoas?tipo=cliente`, `/consulta-cliente`, `/colaborador-cargos`,
  `/carga-horarias`, `/forma-pagamentos`, `/usuarios`, `/usuario-grupos`.
- **Falta a decisão do usuário:** opção A ou B (seção "Como liberar"). Sem
  isso, a recusa se repete.
- O grupo 08 tem as rotas 4 a 12 e mais oito rotas de cadastro (ver tela 4),
  todas pendentes. Convém explorar tudo de uma vez.
- Na próxima passagem, começar por `/dashboard/modulo/cadastros` (mapa do
  módulo) e por `/pessoas` (base de clientes, colaboradores e fornecedores).
- Descobrir em que menu ficam tecidos, status de confecção e etiquetas.
- Depois da exploração, substituir este arquivo pelo relatório completo.
