/**
 * O catálogo de módulos: o que cada empresa pode ter no painel. É o nosso
 * diferencial contra o "template com tudo": a equipa liga para cada cliente
 * só os módulos que ele usa, e o painel mostra só esses.
 *
 * Vive no código, como a cadeia de produção, para ser versionado e revisto
 * como qualquer decisão de produto. O que cada tenant tem ligado vive na
 * tabela `tenant_modulos` (ver `dados/modulos.ts`).
 *
 * Maturidade:
 *   funcional      pronto e 100% nosso; pode ser ligado já.
 *   pre_funcional  código pronto; para funcionar falta o cliente fornecer uma
 *                  credencial ou integração (ver `ativacao`). Pode ser ligado.
 *   planejado      no roteiro; aparece no console mas não pode ser ligado.
 *
 * Lógica pura: sem React nem Supabase.
 */

export const GRUPOS_MODULO = {
  vendas: 'Vendas e atendimento',
  operacao: 'Operação',
  estoque: 'Estoque e compras',
  financeiro: 'Financeiro',
  fiscal: 'Fiscal',
  pessoas: 'Equipe',
  relacionamento: 'Clientes e relacionamento',
  canais: 'Canais de venda',
  inteligencia: 'Relatórios e inteligência',
} as const

export type GrupoModulo = keyof typeof GRUPOS_MODULO
export type Maturidade = 'funcional' | 'pre_funcional' | 'planejado'

/** Ícones dos separadores do painel; o componente de navegação traduz o nome. */
export type IconeModulo = 'fiscal' | 'pix' | 'ponto' | 'equipe' | 'estoque' | 'pdv' | 'caixa' | 'comandas' | 'cozinha' | 'pedidos' | 'cardapio' | 'clientes' | 'financeiro' | 'loja' | 'resumo' | 'conta'

export type ModuloModelo = {
  id: string
  nome: string
  descricao: string
  grupo: GrupoModulo
  maturidade: Maturidade
  /** Sempre ligado; não aparece como opção no console. */
  essencial?: boolean
  /** Ligado por defeito numa empresa nova. */
  padrao?: boolean
  /** Módulos que têm de estar ligados para este funcionar. */
  requer?: readonly string[]
  /** Separador no painel do comerciante. */
  painel?: { href: string; rotulo: string; icone: IconeModulo; ordem: number }
  /** O que o cliente tem de fornecer para o módulo funcionar (pré-funcionais). */
  ativacao?: string
}

export const MODULOS = [
  // ---- Base: o que já existe no painel ----------------------------------
  {
    id: 'pedidos',
    nome: 'Pedidos',
    descricao: 'Pedidos em tempo real com som, do cardápio digital e do WhatsApp.',
    grupo: 'vendas',
    maturidade: 'funcional',
    padrao: true,
    painel: { href: '/painel/pedidos', rotulo: 'Pedidos', icone: 'pedidos', ordem: 10 },
  },
  {
    id: 'cardapio',
    nome: 'Cardápio digital',
    descricao: 'Página pública com cardápio, carrinho e pedido pelo WhatsApp.',
    grupo: 'canais',
    maturidade: 'funcional',
    padrao: true,
    requer: ['pedidos'],
    painel: { href: '/painel/cardapio', rotulo: 'Cardápio', icone: 'cardapio', ordem: 20 },
  },
  {
    id: 'loja',
    nome: 'Loja',
    descricao: 'Horários, entrega, retirada e fechar a loja na hora.',
    grupo: 'operacao',
    maturidade: 'funcional',
    essencial: true,
    painel: { href: '/painel/loja', rotulo: 'Loja', icone: 'loja', ordem: 30 },
  },
  {
    id: 'resumo',
    nome: 'Resumo de vendas',
    descricao: 'Números do dia e do período, e os produtos que mais saem.',
    grupo: 'inteligencia',
    maturidade: 'funcional',
    padrao: true,
    requer: ['pedidos'],
    painel: { href: '/painel/resumo', rotulo: 'Resumo', icone: 'resumo', ordem: 40 },
  },
  {
    id: 'conta',
    nome: 'Conta',
    descricao: 'Dados da empresa, contacto e acesso.',
    grupo: 'operacao',
    maturidade: 'funcional',
    essencial: true,
    painel: { href: '/painel/conta', rotulo: 'Conta', icone: 'conta', ordem: 90 },
  },

  // ---- Roteiro ERP: entram à medida que são construídos -------------------
  {
    id: 'pdv',
    nome: 'PDV / Frente de caixa',
    descricao: 'Venda no balcão por busca, leitor ou etiqueta da balança, com pagamento dividido e troco.',
    grupo: 'vendas',
    maturidade: 'funcional',
    requer: ['caixa'],
    painel: { href: '/painel/pdv', rotulo: 'PDV', icone: 'pdv', ordem: 5 },
  },
  {
    id: 'caixa',
    nome: 'Caixa',
    descricao: 'Abertura com fundo de troco, sangria, suprimento e fechamento cego com conferência.',
    grupo: 'financeiro',
    maturidade: 'funcional',
    painel: { href: '/painel/caixa', rotulo: 'Caixa', icone: 'caixa', ordem: 8 },
  },
  {
    id: 'comandas',
    nome: 'Comandas e mesas',
    descricao: 'Mapa de mesas, comanda pelo celular, cozinha na hora, conta dividida e taxa de serviço.',
    grupo: 'vendas',
    maturidade: 'funcional',
    requer: ['pedidos', 'caixa'],
    painel: { href: '/painel/comandas', rotulo: 'Mesas', icone: 'comandas', ordem: 7 },
  },
  {
    id: 'cozinha',
    nome: 'Painel da cozinha',
    descricao: 'Pedidos na tela da cozinha por estação, com tempo de espera, alerta de atraso e pronto num toque.',
    grupo: 'operacao',
    maturidade: 'funcional',
    requer: ['pedidos'],
    painel: { href: '/painel/cozinha', rotulo: 'Cozinha', icone: 'cozinha', ordem: 12 },
  },
  {
    id: 'delivery',
    nome: 'Delivery próprio',
    descricao: 'Entregadores, rotas, taxas por bairro e acompanhamento.',
    grupo: 'operacao',
    maturidade: 'planejado',
    requer: ['pedidos'],
  },
  {
    id: 'estoque',
    nome: 'Estoque',
    descricao: 'Entrada pelo XML da nota, saídas com motivo, baixa automática pela venda, inventário e alerta de mínimo.',
    grupo: 'estoque',
    maturidade: 'funcional',
    painel: { href: '/painel/estoque', rotulo: 'Estoque', icone: 'estoque', ordem: 50 },
  },
  {
    id: 'compras',
    nome: 'Compras',
    descricao: 'Pedidos de compra, cotações e fornecedores.',
    grupo: 'estoque',
    maturidade: 'planejado',
    requer: ['estoque'],
  },
  {
    id: 'producao',
    nome: 'Produção e fichas técnicas',
    descricao: 'Ficha técnica com custo real (CMV), margem e preço sugerido; baixa dos insumos na venda.',
    grupo: 'estoque',
    maturidade: 'funcional',
    requer: ['estoque'],
  },
  {
    id: 'financeiro',
    nome: 'Financeiro',
    descricao: 'Contas a pagar e a receber em parcelas, carteiras, fluxo de caixa e resultado do mês.',
    grupo: 'financeiro',
    maturidade: 'funcional',
    painel: { href: '/painel/financeiro', rotulo: 'Financeiro', icone: 'financeiro', ordem: 35 },
  },
  {
    id: 'bancos',
    nome: 'Bancos e Pix',
    descricao: 'Pix com QR na tela e baixa automática: no PDV, na mesa e nas contas a receber.',
    grupo: 'financeiro',
    maturidade: 'pre_funcional',
    requer: ['financeiro'],
    ativacao: 'Conta Mercado Pago da empresa (Pix por QR sem tarifa): token de acesso e chave do webhook.',
    painel: { href: '/painel/pix', rotulo: 'Pix', icone: 'pix', ordem: 47 },
  },
  {
    id: 'cobranca',
    nome: 'Cobrança',
    descricao: 'Boletos, links de pagamento e lembretes automáticos.',
    grupo: 'financeiro',
    maturidade: 'planejado',
    requer: ['financeiro'],
    ativacao: 'Conta num gateway de pagamento (credenciais do cliente).',
  },
  {
    id: 'fiscal',
    nome: 'Nota fiscal',
    descricao: 'NFC-e da venda em um toque, por emissor parceiro (Focus NFe), com DANFE e cancelamento.',
    grupo: 'fiscal',
    maturidade: 'pre_funcional',
    painel: { href: '/painel/fiscal', rotulo: 'Notas', icone: 'fiscal', ordem: 45 },
    ativacao: 'Certificado digital A1, inscrição estadual/municipal e CSC da NFC-e.',
  },
  {
    id: 'clientes',
    nome: 'Clientes e fornecedores',
    descricao: 'Cadastro com consulta de CNPJ e CEP, histórico de compras e consentimento LGPD.',
    grupo: 'relacionamento',
    maturidade: 'funcional',
    painel: { href: '/painel/clientes', rotulo: 'Clientes', icone: 'clientes', ordem: 25 },
  },
  {
    id: 'fidelidade',
    nome: 'Fidelidade e cashback',
    descricao: 'Pontos ou cashback por compra, com extrato para o cliente.',
    grupo: 'relacionamento',
    maturidade: 'planejado',
    requer: ['clientes'],
  },
  {
    id: 'ordens_servico',
    nome: 'Ordens de serviço',
    descricao: 'OS com checklist, peças, serviços, técnico e aprovação do cliente.',
    grupo: 'operacao',
    maturidade: 'planejado',
    requer: ['clientes'],
  },
  {
    id: 'equipe',
    nome: 'Equipe e PIN',
    descricao: 'Cada pessoa entra com o seu PIN; o papel decide o que vê; o gerente aprova cancelamentos e descontos; tudo na auditoria.',
    grupo: 'pessoas',
    maturidade: 'funcional',
    painel: { href: '/painel/equipe', rotulo: 'Equipe', icone: 'equipe', ordem: 85 },
  },
  {
    id: 'ponto',
    nome: 'Ponto eletrônico',
    descricao: 'Batida com PIN e foto da webcam, localização, espelho do mês, horas extras e adicional noturno.',
    grupo: 'pessoas',
    maturidade: 'funcional',
    requer: ['equipe'],
    painel: { href: '/painel/ponto', rotulo: 'Ponto', icone: 'ponto', ordem: 72 },
  },
  {
    id: 'ia_whatsapp',
    nome: 'Resumo diário no WhatsApp',
    descricao: 'Todo fim de dia o dono recebe vendas por canal, caixa e diferenças, contas a vencer e estoque baixo.',
    grupo: 'inteligencia',
    maturidade: 'pre_funcional',
    requer: ['resumo'],
    ativacao: 'Envio manual já funciona. Automático às 22h: conta WhatsApp Business da agência com o modelo resumo_diario aprovado.',
  },
  {
    id: 'relatorios',
    nome: 'Relatórios',
    descricao: 'Vendas, financeiro, estoque e equipe, com exportação.',
    grupo: 'inteligencia',
    maturidade: 'planejado',
  },
  {
    id: 'loja_virtual',
    nome: 'Loja virtual',
    descricao: 'Catálogo com variações (cor, tamanho), cupons e pedido online.',
    grupo: 'canais',
    maturidade: 'planejado',
    requer: ['pedidos'],
  },
  {
    id: 'marketplaces',
    nome: 'iFood e marketplaces',
    descricao: 'Pedidos do iFood, 99Food e Mercado Livre no mesmo painel.',
    grupo: 'canais',
    maturidade: 'planejado',
    requer: ['pedidos'],
    ativacao: 'Autorização da loja no portal de cada canal.',
  },
] as const satisfies readonly ModuloModelo[]

export type ModuloId = (typeof MODULOS)[number]['id']

const POR_ID = new Map<string, ModuloModelo>(MODULOS.map((m) => [m.id, m]))

export function eModuloId(valor: string): valor is ModuloId {
  return POR_ID.has(valor)
}

export function moduloPorId(id: string): ModuloModelo | undefined {
  return POR_ID.get(id)
}

/** Os módulos que uma empresa nova recebe ligados (além dos essenciais). */
export function modulosPadrao(): ModuloId[] {
  return MODULOS.filter((m: ModuloModelo) => m.padrao && !m.essencial).map((m) => m.id)
}

/**
 * Conjunto efectivo de módulos activos a partir do que está ligado na base:
 * junta os essenciais, ignora ids desconhecidos e módulos ainda planejados, e
 * desliga em cascata o que perdeu uma dependência.
 */
export function resolverAtivos(ligados: Iterable<string>): Set<ModuloId> {
  const ativos = new Set<ModuloId>()
  for (const m of MODULOS as readonly ModuloModelo[]) {
    if (m.essencial) ativos.add(m.id as ModuloId)
  }
  for (const id of ligados) {
    const m = POR_ID.get(id)
    if (m && m.maturidade !== 'planejado') ativos.add(m.id as ModuloId)
  }
  let mudou = true
  while (mudou) {
    mudou = false
    for (const id of [...ativos]) {
      const m = POR_ID.get(id)!
      if (!m.essencial && (m.requer ?? []).some((r) => !ativos.has(r as ModuloId))) {
        ativos.delete(id)
        mudou = true
      }
    }
  }
  return ativos
}

export type Verificacao = { ok: true } | { ok: false; motivo: string }

/** Pode ligar `id` numa empresa que já tem `ativos`? */
export function podeLigar(id: string, ativos: ReadonlySet<string>): Verificacao {
  const m = POR_ID.get(id)
  if (!m) return { ok: false, motivo: 'Módulo desconhecido.' }
  if (m.essencial) return { ok: false, motivo: 'Este módulo está sempre ligado.' }
  if (m.maturidade === 'planejado') return { ok: false, motivo: 'Este módulo ainda está em construção.' }
  const faltam = (m.requer ?? []).filter((r) => !ativos.has(r))
  if (faltam.length > 0) {
    const nomes = faltam.map((r) => POR_ID.get(r)?.nome ?? r).join(', ')
    return { ok: false, motivo: `Ligue primeiro: ${nomes}.` }
  }
  return { ok: true }
}

/** Pode desligar `id`? Não, se for essencial ou se outro módulo ligado depender dele. */
export function podeDesligar(id: string, ativos: ReadonlySet<string>): Verificacao {
  const m = POR_ID.get(id)
  if (!m) return { ok: false, motivo: 'Módulo desconhecido.' }
  if (m.essencial) return { ok: false, motivo: 'Este módulo está sempre ligado.' }
  const dependentes = (MODULOS as readonly ModuloModelo[]).filter(
    (d) => ativos.has(d.id) && (d.requer ?? []).includes(id),
  )
  if (dependentes.length > 0) {
    return { ok: false, motivo: `Desligue antes: ${dependentes.map((d) => d.nome).join(', ')}.` }
  }
  return { ok: true }
}

export type Separador = { href: string; rotulo: string; icone: IconeModulo }

/** Separadores do painel para os módulos activos, pela ordem definida no catálogo. */
export function separadoresDoPainel(ativos: ReadonlySet<string>): Separador[] {
  return (MODULOS as readonly ModuloModelo[])
    .filter((m) => m.painel && ativos.has(m.id))
    .sort((a, b) => a.painel!.ordem - b.painel!.ordem)
    .map((m) => ({ href: m.painel!.href, rotulo: m.painel!.rotulo, icone: m.painel!.icone }))
}
