/**
 * Tipos da base de dados para o cliente Supabase.
 *
 * Escritos à mão a partir de `supabase/migrations`, com dois ajudantes para
 * não repetir cada tabela três vezes. Quando o projecto estiver ligado ao
 * Supabase, `pnpm tipos` regenera este ficheiro automaticamente; até lá, se
 * uma migração mudar uma coluna, muda-se aqui a linha correspondente.
 */

export type Json = string | number | boolean | null | { [chave: string]: Json | undefined } | Json[]

/** Insert: as colunas com default ou nullable ficam opcionais. */
type Inserir<Linha, Opcionais extends keyof Linha> = Omit<Linha, Opcionais> & Partial<Pick<Linha, Opcionais>>

type Relacao = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

type Tabela<Linha, Opcionais extends keyof Linha, Relacoes extends Relacao[] = []> = {
  Row: Linha
  Insert: Inserir<Linha, Opcionais>
  Update: Partial<Linha>
  Relationships: Relacoes
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export type TenantStatus = 'onboarding' | 'ativo' | 'suspenso' | 'cancelado'
export type PapelMembro = 'dono' | 'funcionario'
export type CanalPedido = 'cardapio' | 'whatsapp' | 'balcao' | 'ifood' | '99food' | 'mesa'
export type EstadoPreparo = 'aguardando' | 'em_preparo' | 'pronto' | 'entregue' | 'cancelado'
export type EstadoComanda = 'aberta' | 'conta' | 'fechada' | 'cancelada'
export type PedidoStatus = 'novo' | 'aceite' | 'pronto' | 'concluido' | 'cancelado'
export type TipoEntrega = 'entrega' | 'retirada'
export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao'
export type TipoPessoa = 'pf' | 'pj'
export type CadeiaEstado = 'nao_avaliado' | 'ja_tinha' | 'pendente' | 'em_curso' | 'concluido' | 'nao_aplica'

// ---------------------------------------------------------------------------
// Linhas
// ---------------------------------------------------------------------------
export type TenantLinha = {
  id: string
  slug: string
  nome_fantasia: string
  razao_social: string | null
  cnpj: string | null
  telefone: string | null
  whatsapp: string
  logo_url: string | null
  cor_marca: string | null
  endereco: Json
  plano: string
  status: TenantStatus
  renovacao_em: string | null
  publicado_em: string | null
  criado_em: string
  atualizado_em: string
}

export type LojaLinha = {
  id: string
  tenant_id: string
  nome: string
  endereco: Json
  fuso_horario: string
  horarios: Json
  aceita_entrega: boolean
  aceita_retirada: boolean
  raio_entrega_km: number | null
  taxa_entrega: number
  pedido_minimo: number
  fechada_ate: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export type CategoriaLinha = {
  id: string
  tenant_id: string
  nome: string
  ordem: number
  ativo: boolean
}

export type ProdutoLinha = {
  id: string
  tenant_id: string
  categoria_id: string
  nome: string
  descricao: string | null
  preco: number
  preco_promocional: number | null
  foto_url: string | null
  sku: string | null
  codigo_barras: string | null
  vendido_por_peso: boolean
  disponivel: boolean
  tempo_preparo_min: number | null
  ordem: number
  criado_em: string
  atualizado_em: string
}

export type GrupoOpcaoLinha = {
  id: string
  tenant_id: string
  produto_id: string
  nome: string
  min: number
  max: number
  obrigatorio: boolean
  ordem: number
}

export type OpcaoLinha = {
  id: string
  tenant_id: string
  grupo_id: string
  nome: string
  preco_adicional: number
  disponivel: boolean
  ordem: number
}

export type PedidoLinha = {
  id: string
  tenant_id: string
  loja_id: string
  cliente_id: string | null
  canal: CanalPedido
  canal_pedido_id: string | null
  numero: number | null
  cliente_nome: string | null
  cliente_telefone: string | null
  tipo_entrega: TipoEntrega
  endereco: Json | null
  observacoes: string | null
  subtotal: number
  desconto: number
  taxa_entrega: number
  total: number
  forma_pagamento: FormaPagamento
  troco_para: number | null
  taxa_servico: number
  status: PedidoStatus
  cancelado_motivo: string | null
  caixa_sessao_id: string | null
  anonimizado_em: string | null
  criado_em: string
  atualizado_em: string
}

export type ItemPedidoLinha = {
  id: string
  tenant_id: string
  pedido_id: string
  produto_id: string | null
  nome: string
  quantidade: number
  preco_unitario: number
  desconto: number
  opcoes: Json
  observacao: string | null
  total: number
  estacao_id: string | null
  preparo: EstadoPreparo | null
  preparo_iniciado_em: string | null
  pronto_em: string | null
  entregue_em: string | null
  cancelado_motivo: string | null
  criado_em: string
}

export type MembroLinha = {
  user_id: string
  tenant_id: string
  papel: PapelMembro
  criado_em: string
}

export type OperadorLinha = {
  user_id: string
  nome: string
  criado_em: string
}

export type CadeiaEtapaLinha = {
  id: string
  tenant_id: string
  frente: string
  chave: string
  titulo: string
  descricao: string | null
  ordem: number
  estado: CadeiaEstado
  notas: string | null
  url: string | null
  responsavel: string | null
  prevista_em: string | null
  concluida_em: string | null
  personalizada: boolean
  criado_em: string
  atualizado_em: string
}

export type CadeiaRegistoLinha = {
  id: string
  tenant_id: string
  etapa_id: string
  autor_id: string | null
  autor_nome: string | null
  tipo: 'estado' | 'nota' | 'criacao'
  de: string | null
  para: string | null
  texto: string | null
  criado_em: string
}

export type NotaInternaLinha = {
  id: string
  tenant_id: string
  autor_id: string | null
  autor_nome: string | null
  titulo: string
  conteudo: string
  fixada: boolean
  criado_em: string
  atualizado_em: string
}

export type ArquivoLinha = {
  id: string
  tenant_id: string
  pasta: string
  nome: string
  caminho: string
  tipo: string
  tamanho: number
  autor_id: string | null
  autor_nome: string | null
  criado_em: string
}

export type InsumoLinha = {
  id: string
  tenant_id: string
  nome: string
  unidade: string
  quantidade_atual: number
  quantidade_minima: number
  custo_unitario: number
}

export type FichaLinha = {
  tenant_id: string
  produto_id: string
  insumo_id: string
  quantidade: number
}

export type PessoaLinha = {
  id: string
  tenant_id: string
  tipo: TipoPessoa
  nome: string
  nome_fantasia: string | null
  documento: string | null
  whatsapp: string | null
  email: string | null
  nascimento: string | null
  observacoes: string | null
  e_cliente: boolean
  e_fornecedor: boolean
  etiquetas: string[]
  origem: 'manual' | 'pedido' | 'importacao'
  anonimizado_em: string | null
  criado_em: string
  atualizado_em: string
}

export type PessoaEnderecoLinha = {
  id: string
  tenant_id: string
  pessoa_id: string
  rotulo: string
  cep: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  referencia: string | null
  principal: boolean
  criado_em: string
}

export type ConsentimentoLinha = {
  id: string
  tenant_id: string
  pessoa_id: string
  finalidade: 'pedidos' | 'marketing' | 'aniversario'
  concedido: boolean
  origem: 'cardapio' | 'balcao' | 'painel' | 'importacao'
  registado_em: string
}

export type TipoTitulo = 'receber' | 'pagar'
export type EstadoParcela = 'aberta' | 'parcial' | 'paga' | 'cancelada'
export type TipoCarteira = 'caixa' | 'banco' | 'pix' | 'cartao' | 'outra'
export type LinhaResultado =
  | 'receita_vendas'
  | 'outras_receitas'
  | 'impostos'
  | 'custo_mercadoria'
  | 'despesa_variavel'
  | 'pessoal'
  | 'despesa_fixa'
  | 'outras_despesas'

export type CarteiraLinha = {
  id: string
  tenant_id: string
  nome: string
  tipo: TipoCarteira
  saldo_inicial: number
  ativa: boolean
  criado_em: string
}

export type CategoriaFinanceiraLinha = {
  id: string
  tenant_id: string
  nome: string
  tipo: TipoTitulo
  linha: LinhaResultado
  ativa: boolean
}

export type TituloLinha = {
  id: string
  tenant_id: string
  tipo: TipoTitulo
  descricao: string
  pessoa_id: string | null
  categoria_id: string
  origem: 'manual' | 'pedido' | 'compra' | 'recorrente' | 'caixa'
  origem_id: string | null
  competencia: string
  documento: string | null
  observacoes: string | null
  cancelado_em: string | null
  criado_em: string
}

export type ParcelaLinha = {
  id: string
  tenant_id: string
  titulo_id: string
  numero: number
  vencimento: string
  valor: number
  valor_pago: number
  estado: EstadoParcela
  pago_em: string | null
}

export type BaixaLinha = {
  id: string
  tenant_id: string
  parcela_id: string
  carteira_id: string
  data: string
  valor: number
  juros: number
  multa: number
  desconto: number
  forma: 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'boleto' | 'transferencia' | 'outro'
  observacao: string | null
  estornada_em: string | null
  criado_em: string
}

export type FormaRecebimento = 'dinheiro' | 'pix' | 'cartao_debito' | 'cartao_credito' | 'outro'
export type EstadoCaixa = 'aberta' | 'fechada' | 'conferida'
export type TipoMovimentoCaixa = 'venda' | 'suprimento' | 'sangria' | 'estorno'

export type CaixaSessaoLinha = {
  id: string
  tenant_id: string
  loja_id: string
  operador_id: string | null
  operador_nome: string
  fundo_troco: number
  estado: EstadoCaixa
  aberta_em: string
  fechada_em: string | null
  justificativa: string | null
  conferida_por: string | null
  conferida_em: string | null
}

export type CaixaMovimentoLinha = {
  id: string
  tenant_id: string
  sessao_id: string
  tipo: TipoMovimentoCaixa
  forma: FormaRecebimento
  valor: number
  motivo: string | null
  pedido_id: string | null
  autor_nome: string | null
  criado_em: string
}

export type CaixaConferenciaLinha = {
  tenant_id: string
  sessao_id: string
  forma: FormaRecebimento
  esperado: number
  informado: number
  diferenca: number
}

export type PagamentoPedidoLinha = {
  id: string
  tenant_id: string
  pedido_id: string
  forma: FormaRecebimento
  valor: number
  troco: number
  criado_em: string
}

export type EstacaoLinha = {
  id: string
  tenant_id: string
  nome: string
  ordem: number
  alerta_min: number
  ativa: boolean
}

export type EstacaoCategoriaLinha = { tenant_id: string; categoria_id: string; estacao_id: string }

export type MesaLinha = {
  id: string
  tenant_id: string
  loja_id: string
  numero: number
  area: string | null
  lugares: number
  ativa: boolean
}

export type ComandaLinha = {
  id: string
  tenant_id: string
  loja_id: string
  mesa_id: string | null
  pedido_id: string
  identificador: string | null
  pessoas: number
  garcom_nome: string | null
  estado: EstadoComanda
  aberta_em: string
  fechada_em: string | null
}

export type TenantModuloLinha = {
  tenant_id: string
  modulo: string
  ativo: boolean
  configuracao: Json
  ativado_em: string | null
  criado_em: string
  atualizado_em: string
}

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------
export type Database = {
  public: {
    Tables: {
      tenants: Tabela<
        TenantLinha,
        | 'id'
        | 'razao_social'
        | 'cnpj'
        | 'telefone'
        | 'logo_url'
        | 'cor_marca'
        | 'endereco'
        | 'plano'
        | 'status'
        | 'renovacao_em'
        | 'publicado_em'
        | 'criado_em'
        | 'atualizado_em'
      >
      lojas: Tabela<
        LojaLinha,
        | 'id'
        | 'nome'
        | 'endereco'
        | 'fuso_horario'
        | 'horarios'
        | 'aceita_entrega'
        | 'aceita_retirada'
        | 'raio_entrega_km'
        | 'taxa_entrega'
        | 'pedido_minimo'
        | 'fechada_ate'
        | 'ativo'
        | 'criado_em'
        | 'atualizado_em',
        [
          {
            foreignKeyName: 'lojas_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      categorias: Tabela<
        CategoriaLinha,
        'id' | 'ordem' | 'ativo',
        [
          {
            foreignKeyName: 'categorias_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      produtos: Tabela<
        ProdutoLinha,
        | 'id'
        | 'descricao'
        | 'preco_promocional'
        | 'foto_url'
        | 'sku'
        | 'codigo_barras'
        | 'vendido_por_peso'
        | 'disponivel'
        | 'tempo_preparo_min'
        | 'ordem'
        | 'criado_em'
        | 'atualizado_em',
        [
          {
            foreignKeyName: 'produtos_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'produtos_categoria_id_tenant_id_fkey'
            columns: ['categoria_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'categorias'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      grupos_opcao: Tabela<
        GrupoOpcaoLinha,
        'id' | 'min' | 'max' | 'obrigatorio' | 'ordem',
        [
          {
            foreignKeyName: 'grupos_opcao_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'grupos_opcao_produto_id_tenant_id_fkey'
            columns: ['produto_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      opcoes: Tabela<
        OpcaoLinha,
        'id' | 'preco_adicional' | 'disponivel' | 'ordem',
        [
          {
            foreignKeyName: 'opcoes_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'opcoes_grupo_id_tenant_id_fkey'
            columns: ['grupo_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'grupos_opcao'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      pedidos: Tabela<
        PedidoLinha,
        | 'id'
        | 'cliente_id'
        | 'canal_pedido_id'
        | 'numero'
        | 'cliente_nome'
        | 'cliente_telefone'
        | 'endereco'
        | 'observacoes'
        | 'taxa_entrega'
        | 'troco_para'
        | 'taxa_servico'
        | 'status'
        | 'desconto'
        | 'cancelado_motivo'
        | 'caixa_sessao_id'
        | 'anonimizado_em'
        | 'criado_em'
        | 'atualizado_em',
        [
          {
            foreignKeyName: 'pedidos_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'pedidos_loja_id_tenant_id_fkey'
            columns: ['loja_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'lojas'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      itens_pedido: Tabela<
        ItemPedidoLinha,
        | 'id'
        | 'produto_id'
        | 'opcoes'
        | 'observacao'
        | 'desconto'
        | 'estacao_id'
        | 'preparo'
        | 'preparo_iniciado_em'
        | 'pronto_em'
        | 'entregue_em'
        | 'cancelado_motivo'
        | 'criado_em',
        [
          {
            foreignKeyName: 'itens_pedido_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'itens_pedido_pedido_id_tenant_id_fkey'
            columns: ['pedido_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id', 'tenant_id']
          },
          {
            foreignKeyName: 'itens_pedido_produto_id_tenant_id_fkey'
            columns: ['produto_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      membros: Tabela<
        MembroLinha,
        'papel' | 'criado_em',
        [
          {
            foreignKeyName: 'membros_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      operadores: Tabela<OperadorLinha, 'criado_em'>
      cadeia_etapas: Tabela<
        CadeiaEtapaLinha,
        | 'id'
        | 'descricao'
        | 'ordem'
        | 'estado'
        | 'notas'
        | 'url'
        | 'responsavel'
        | 'prevista_em'
        | 'concluida_em'
        | 'personalizada'
        | 'criado_em'
        | 'atualizado_em',
        [
          {
            foreignKeyName: 'cadeia_etapas_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      cadeia_registos: Tabela<
        CadeiaRegistoLinha,
        'id' | 'autor_id' | 'autor_nome' | 'de' | 'para' | 'texto' | 'criado_em',
        [
          {
            foreignKeyName: 'cadeia_registos_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cadeia_registos_etapa_id_fkey'
            columns: ['etapa_id']
            isOneToOne: false
            referencedRelation: 'cadeia_etapas'
            referencedColumns: ['id']
          },
        ]
      >
      notas_internas: Tabela<
        NotaInternaLinha,
        'id' | 'autor_id' | 'autor_nome' | 'conteudo' | 'fixada' | 'criado_em' | 'atualizado_em',
        [
          {
            foreignKeyName: 'notas_internas_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      arquivos: Tabela<
        ArquivoLinha,
        'id' | 'pasta' | 'autor_id' | 'autor_nome' | 'criado_em',
        [
          {
            foreignKeyName: 'arquivos_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      insumos: Tabela<
        InsumoLinha,
        'id' | 'quantidade_atual' | 'quantidade_minima' | 'custo_unitario',
        [
          {
            foreignKeyName: 'insumos_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      fichas: Tabela<
        FichaLinha,
        never,
        [
          {
            foreignKeyName: 'fichas_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'fichas_produto_id_tenant_id_fkey'
            columns: ['produto_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'produtos'
            referencedColumns: ['id', 'tenant_id']
          },
          {
            foreignKeyName: 'fichas_insumo_id_tenant_id_fkey'
            columns: ['insumo_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'insumos'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      pessoas: Tabela<
        PessoaLinha,
        | 'id'
        | 'tipo'
        | 'nome_fantasia'
        | 'documento'
        | 'whatsapp'
        | 'email'
        | 'nascimento'
        | 'observacoes'
        | 'e_cliente'
        | 'e_fornecedor'
        | 'etiquetas'
        | 'origem'
        | 'anonimizado_em'
        | 'criado_em'
        | 'atualizado_em',
        [
          {
            foreignKeyName: 'pessoas_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      pessoa_enderecos: Tabela<
        PessoaEnderecoLinha,
        | 'id'
        | 'rotulo'
        | 'cep'
        | 'rua'
        | 'numero'
        | 'complemento'
        | 'bairro'
        | 'cidade'
        | 'uf'
        | 'referencia'
        | 'principal'
        | 'criado_em',
        [
          {
            foreignKeyName: 'pessoa_enderecos_pessoa_id_tenant_id_fkey'
            columns: ['pessoa_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'pessoas'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      consentimentos: Tabela<
        ConsentimentoLinha,
        'id' | 'registado_em',
        [
          {
            foreignKeyName: 'consentimentos_pessoa_id_tenant_id_fkey'
            columns: ['pessoa_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'pessoas'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      carteiras: Tabela<
        CarteiraLinha,
        'id' | 'saldo_inicial' | 'ativa' | 'criado_em',
        [
          {
            foreignKeyName: 'carteiras_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      categorias_financeiras: Tabela<
        CategoriaFinanceiraLinha,
        'id' | 'ativa',
        [
          {
            foreignKeyName: 'categorias_financeiras_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      titulos: Tabela<
        TituloLinha,
        'id' | 'pessoa_id' | 'origem' | 'origem_id' | 'documento' | 'observacoes' | 'cancelado_em' | 'criado_em',
        [
          {
            foreignKeyName: 'titulos_pessoa_id_tenant_id_fkey'
            columns: ['pessoa_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'pessoas'
            referencedColumns: ['id', 'tenant_id']
          },
          {
            foreignKeyName: 'titulos_categoria_id_tenant_id_fkey'
            columns: ['categoria_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'categorias_financeiras'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      parcelas: Tabela<
        ParcelaLinha,
        'id' | 'valor_pago' | 'estado' | 'pago_em',
        [
          {
            foreignKeyName: 'parcelas_titulo_id_tenant_id_fkey'
            columns: ['titulo_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'titulos'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      baixas: Tabela<
        BaixaLinha,
        'id' | 'juros' | 'multa' | 'desconto' | 'forma' | 'observacao' | 'estornada_em' | 'criado_em',
        [
          {
            foreignKeyName: 'baixas_parcela_id_tenant_id_fkey'
            columns: ['parcela_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'parcelas'
            referencedColumns: ['id', 'tenant_id']
          },
          {
            foreignKeyName: 'baixas_carteira_id_tenant_id_fkey'
            columns: ['carteira_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'carteiras'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      caixa_sessoes: Tabela<
        CaixaSessaoLinha,
        'id' | 'operador_id' | 'fundo_troco' | 'estado' | 'aberta_em' | 'fechada_em' | 'justificativa' | 'conferida_por' | 'conferida_em',
        [
          {
            foreignKeyName: 'caixa_sessoes_loja_id_tenant_id_fkey'
            columns: ['loja_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'lojas'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      caixa_movimentos: Tabela<
        CaixaMovimentoLinha,
        'id' | 'forma' | 'motivo' | 'pedido_id' | 'autor_nome' | 'criado_em',
        [
          {
            foreignKeyName: 'caixa_movimentos_sessao_id_tenant_id_fkey'
            columns: ['sessao_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'caixa_sessoes'
            referencedColumns: ['id', 'tenant_id']
          },
          {
            foreignKeyName: 'caixa_movimentos_pedido_id_tenant_id_fkey'
            columns: ['pedido_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      caixa_conferencias: Tabela<
        CaixaConferenciaLinha,
        'diferenca',
        [
          {
            foreignKeyName: 'caixa_conferencias_sessao_id_tenant_id_fkey'
            columns: ['sessao_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'caixa_sessoes'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      pagamentos_pedido: Tabela<
        PagamentoPedidoLinha,
        'id' | 'troco' | 'criado_em',
        [
          {
            foreignKeyName: 'pagamentos_pedido_pedido_id_tenant_id_fkey'
            columns: ['pedido_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      estacoes: Tabela<
        EstacaoLinha,
        'id' | 'ordem' | 'alerta_min' | 'ativa',
        [
          {
            foreignKeyName: 'estacoes_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
      estacao_categorias: Tabela<
        EstacaoCategoriaLinha,
        never,
        [
          {
            foreignKeyName: 'estacao_categorias_estacao_id_tenant_id_fkey'
            columns: ['estacao_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'estacoes'
            referencedColumns: ['id', 'tenant_id']
          },
          {
            foreignKeyName: 'estacao_categorias_categoria_id_tenant_id_fkey'
            columns: ['categoria_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'categorias'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      mesas: Tabela<
        MesaLinha,
        'id' | 'area' | 'lugares' | 'ativa',
        [
          {
            foreignKeyName: 'mesas_loja_id_tenant_id_fkey'
            columns: ['loja_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'lojas'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      comandas: Tabela<
        ComandaLinha,
        'id' | 'mesa_id' | 'identificador' | 'pessoas' | 'garcom_nome' | 'estado' | 'aberta_em' | 'fechada_em',
        [
          {
            foreignKeyName: 'comandas_mesa_id_tenant_id_fkey'
            columns: ['mesa_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'mesas'
            referencedColumns: ['id', 'tenant_id']
          },
          {
            foreignKeyName: 'comandas_pedido_id_tenant_id_fkey'
            columns: ['pedido_id', 'tenant_id']
            isOneToOne: false
            referencedRelation: 'pedidos'
            referencedColumns: ['id', 'tenant_id']
          },
        ]
      >
      tenant_modulos: Tabela<
        TenantModuloLinha,
        'ativo' | 'configuracao' | 'ativado_em' | 'criado_em' | 'atualizado_em',
        [
          {
            foreignKeyName: 'tenant_modulos_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
        ]
      >
    }
    Views: { [_ in never]: never }
    Functions: {
      criar_pedido: { Args: { p: Json }; Returns: PedidoLinha }
      anonimizar_pedidos: { Args: { dias: number }; Returns: number }
      anonimizar_pessoa: { Args: { p_tenant: string; p_pessoa: string }; Returns: undefined }
      financeiro_padrao: { Args: { p_tenant: string }; Returns: undefined }
      registar_venda_balcao: { Args: { p: Json }; Returns: PedidoLinha }
      abrir_comanda: {
        Args: { p_tenant: string; p_loja: string; p_mesa: string | null; p_identificador: string | null; p_pessoas: number; p_garcom: string }
        Returns: ComandaLinha
      }
      fechar_comanda: { Args: { p: Json }; Returns: PedidoLinha }
      juntar_comandas: { Args: { p_tenant: string; p_destino: string; p_origem: string }; Returns: undefined }
      cozinha_padrao: { Args: { p_tenant: string }; Returns: undefined }
      cancelar_venda_balcao: {
        Args: { p_tenant: string; p_pedido: string; p_motivo: string; p_autor: string }
        Returns: undefined
      }
    }
    Enums: {
      tenant_status: TenantStatus
      papel_membro: PapelMembro
      canal_pedido: CanalPedido
      pedido_status: PedidoStatus
      tipo_entrega: TipoEntrega
      forma_pagamento: FormaPagamento
      cadeia_estado: CadeiaEstado
      tipo_pessoa: TipoPessoa
      tipo_titulo: TipoTitulo
      estado_parcela: EstadoParcela
      tipo_carteira: TipoCarteira
      linha_resultado: LinhaResultado
      forma_recebimento: FormaRecebimento
      estado_caixa: EstadoCaixa
      tipo_movimento_caixa: TipoMovimentoCaixa
      estado_preparo: EstadoPreparo
      estado_comanda: EstadoComanda
    }
    CompositeTypes: { [_ in never]: never }
  }
}
