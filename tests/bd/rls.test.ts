/**
 * Critério de aceitação 6 do brief: dois tenants diferentes não conseguem ver
 * dados um do outro em nenhuma query. Estes testes aplicam as migrações reais
 * e provam-no tabela a tabela, com o utilizador de cada tenant, com anon e
 * com um operador.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { BaseDeTeste } from './harness'

const TABELAS_COM_TENANT = [
  'lojas',
  'categorias',
  'produtos',
  'grupos_opcao',
  'opcoes',
  'pedidos',
  'itens_pedido',
  'insumos',
  'fichas',
] as const

type Cenario = {
  bd: BaseDeTeste
  tenantA: string
  tenantB: string
  donoA: string
  donoB: string
  operador: string
  lojaA: string
  lojaB: string
  produtoA: string
  produtoB: string
}

let c: Cenario

async function criarTenantCompleto(bd: BaseDeTeste, slug: string, sufixo: string) {
  const { db } = bd
  const tenant = (
    await db.query<{ id: string }>(
      `insert into public.tenants (slug, nome_fantasia, whatsapp, status) values ($1, $2, '5569999990000', 'ativo') returning id`,
      [slug, `Tenant ${sufixo}`],
    )
  ).rows[0]!.id
  const loja = (
    await db.query<{ id: string }>(
      `insert into public.lojas (tenant_id, nome) values ($1, 'Principal') returning id`,
      [tenant],
    )
  ).rows[0]!.id
  const categoria = (
    await db.query<{ id: string }>(
      `insert into public.categorias (tenant_id, nome) values ($1, 'Lanches') returning id`,
      [tenant],
    )
  ).rows[0]!.id
  const produto = (
    await db.query<{ id: string }>(
      `insert into public.produtos (tenant_id, categoria_id, nome, preco) values ($1, $2, $3, 10) returning id`,
      [tenant, categoria, `Produto ${sufixo}`],
    )
  ).rows[0]!.id
  const grupo = (
    await db.query<{ id: string }>(
      `insert into public.grupos_opcao (tenant_id, produto_id, nome) values ($1, $2, 'Ponto') returning id`,
      [tenant, produto],
    )
  ).rows[0]!.id
  await db.query(`insert into public.opcoes (tenant_id, grupo_id, nome) values ($1, $2, 'Ao ponto')`, [
    tenant,
    grupo,
  ])
  const pedido = (
    await db.query<{ id: string }>(
      `insert into public.pedidos (tenant_id, loja_id, canal, tipo_entrega, subtotal, total, forma_pagamento, cliente_nome)
       values ($1, $2, 'cardapio', 'retirada', 10, 10, 'pix', $3) returning id`,
      [tenant, loja, `Cliente ${sufixo}`],
    )
  ).rows[0]!.id
  await db.query(
    `insert into public.itens_pedido (tenant_id, pedido_id, produto_id, nome, quantidade, preco_unitario, total)
     values ($1, $2, $3, 'Item', 1, 10, 10)`,
    [tenant, pedido, produto],
  )
  const etapa = (
    await db.query<{ id: string }>(
      `insert into public.cadeia_etapas (tenant_id, frente, chave, titulo, ordem, estado)
       values ($1, 'lancamento', 'cadastro', 'Cadastro', 1, 'concluido') returning id`,
      [tenant],
    )
  ).rows[0]!.id
  await db.query(
    `insert into public.cadeia_registos (tenant_id, etapa_id, autor_nome, tipo, de, para)
     values ($1, $2, 'Equipa', 'estado', 'pendente', 'concluido')`,
    [tenant, etapa],
  )
  await db.query(
    `insert into public.notas_internas (tenant_id, autor_nome, titulo, conteudo) values ($1, 'Equipa', 'Briefing', '# Olá')`,
    [tenant],
  )
  await db.query(
    `insert into public.arquivos (tenant_id, pasta, nome, caminho, tipo, tamanho) values ($1, 'Fachada', 'fachada.webp', $2 || '/fachada/fachada.webp', 'image/webp', 1234)`,
    [tenant, tenant],
  )
  const insumo = (
    await db.query<{ id: string }>(
      `insert into public.insumos (tenant_id, nome, unidade) values ($1, 'Pão', 'un') returning id`,
      [tenant],
    )
  ).rows[0]!.id
  await db.query(
    `insert into public.fichas (tenant_id, produto_id, insumo_id, quantidade) values ($1, $2, $3, 1)`,
    [tenant, produto, insumo],
  )
  return { tenant, loja, produto }
}

beforeAll(async () => {
  const bd = await BaseDeTeste.criar()
  const a = await criarTenantCompleto(bd, 'tenant-a', 'A')
  const b = await criarTenantCompleto(bd, 'tenant-b', 'B')
  const donoA = await bd.criarUtilizador('dono-a@teste.local')
  const donoB = await bd.criarUtilizador('dono-b@teste.local')
  const operador = await bd.criarUtilizador('operador@teste.local')
  await bd.db.query(`insert into public.membros (user_id, tenant_id, papel) values ($1, $2, 'dono')`, [
    donoA,
    a.tenant,
  ])
  await bd.db.query(`insert into public.membros (user_id, tenant_id, papel) values ($1, $2, 'dono')`, [
    donoB,
    b.tenant,
  ])
  await bd.db.query(`insert into public.operadores (user_id, nome) values ($1, 'Equipa')`, [operador])
  c = {
    bd,
    tenantA: a.tenant,
    tenantB: b.tenant,
    donoA,
    donoB,
    operador,
    lojaA: a.loja,
    lojaB: b.loja,
    produtoA: a.produto,
    produtoB: b.produto,
  }
})

afterAll(async () => {
  await c.bd.fechar()
})

describe('isolamento entre tenants (authenticated)', () => {
  it('o dono do tenant A vê só o tenant A em `tenants`', async () => {
    const linhas = await c.bd.consultar<{ id: string }>(
      { tipo: 'utilizador', id: c.donoA },
      'select id from public.tenants',
    )
    expect(linhas.map((l) => l.id)).toEqual([c.tenantA])
  })

  for (const tabela of TABELAS_COM_TENANT) {
    it(`em \`${tabela}\` cada dono vê apenas o próprio tenant`, async () => {
      const deA = await c.bd.consultar<{ tenant_id: string }>(
        { tipo: 'utilizador', id: c.donoA },
        `select tenant_id from public.${tabela}`,
      )
      const deB = await c.bd.consultar<{ tenant_id: string }>(
        { tipo: 'utilizador', id: c.donoB },
        `select tenant_id from public.${tabela}`,
      )
      expect(deA.length).toBeGreaterThan(0)
      expect(deB.length).toBeGreaterThan(0)
      expect(new Set(deA.map((l) => l.tenant_id))).toEqual(new Set([c.tenantA]))
      expect(new Set(deB.map((l) => l.tenant_id))).toEqual(new Set([c.tenantB]))
    })
  }

  it('um dono não consegue inserir linhas noutro tenant', async () => {
    await expect(
      c.bd.consultar(
        { tipo: 'utilizador', id: c.donoA },
        `insert into public.categorias (tenant_id, nome) values ($1, 'Intrusa')`,
        [c.tenantB],
      ),
    ).rejects.toThrow(/row-level security/)
  })

  it('um dono não consegue mover uma linha sua para outro tenant', async () => {
    await expect(
      c.bd.consultar(
        { tipo: 'utilizador', id: c.donoA },
        `update public.produtos set tenant_id = $1 where id = $2`,
        [c.tenantB, c.produtoA],
      ),
    ).rejects.toThrow()
  })

  it('um update num produto alheio afecta zero linhas, sem erro', async () => {
    const antes = await c.bd.consultar<{ nome: string }>(
      { tipo: 'servidor' },
      'select nome from public.produtos where id = $1',
      [c.produtoB],
    )
    await c.bd.consultar(
      { tipo: 'utilizador', id: c.donoA },
      `update public.produtos set nome = 'Hackeado' where id = $1`,
      [c.produtoB],
    )
    const depois = await c.bd.consultar<{ nome: string }>(
      { tipo: 'servidor' },
      'select nome from public.produtos where id = $1',
      [c.produtoB],
    )
    expect(depois[0]!.nome).toBe(antes[0]!.nome)
  })

  it('um dono só vê a própria ligação em `membros`', async () => {
    const linhas = await c.bd.consultar<{ user_id: string }>(
      { tipo: 'utilizador', id: c.donoA },
      'select user_id from public.membros',
    )
    expect(linhas.map((l) => l.user_id)).toEqual([c.donoA])
  })

  it('um dono não consegue alterar o status do próprio tenant (coluna sem grant)', async () => {
    await expect(
      c.bd.consultar(
        { tipo: 'utilizador', id: c.donoA },
        `update public.tenants set status = 'ativo' where id = $1`,
        [c.tenantA],
      ),
    ).rejects.toThrow(/permission denied/)
  })

  it('um dono consegue alterar os próprios dados de contacto', async () => {
    await c.bd.consultar(
      { tipo: 'utilizador', id: c.donoA },
      `update public.tenants set telefone = '11999990000' where id = $1`,
      [c.tenantA],
    )
    const linhas = await c.bd.consultar<{ telefone: string }>(
      { tipo: 'servidor' },
      'select telefone from public.tenants where id = $1',
      [c.tenantA],
    )
    expect(linhas[0]!.telefone).toBe('11999990000')
  })
})

describe('operador', () => {
  it('vê todos os tenants', async () => {
    const linhas = await c.bd.consultar<{ id: string }>(
      { tipo: 'utilizador', id: c.operador },
      'select id from public.tenants order by slug',
    )
    expect(new Set(linhas.map((l) => l.id))).toEqual(new Set([c.tenantA, c.tenantB]))
  })

  it('vê pedidos de todos os tenants', async () => {
    const linhas = await c.bd.consultar<{ tenant_id: string }>(
      { tipo: 'utilizador', id: c.operador },
      'select tenant_id from public.pedidos',
    )
    expect(new Set(linhas.map((l) => l.tenant_id))).toEqual(new Set([c.tenantA, c.tenantB]))
  })

  it('um dono comum não é operador', async () => {
    const linhas = await c.bd.consultar<{ e: boolean }>(
      { tipo: 'utilizador', id: c.donoA },
      'select app.e_operador() as e',
    )
    expect(linhas[0]!.e).toBe(false)
  })
})

describe('cadeia de produção e notas (só operadores)', () => {
  for (const tabela of ['cadeia_etapas', 'cadeia_registos', 'notas_internas', 'arquivos'] as const) {
    it(`um dono não vê nada em \`${tabela}\`, nem do próprio tenant`, async () => {
      const linhas = await c.bd.consultar(
        { tipo: 'utilizador', id: c.donoA },
        `select tenant_id from public.${tabela}`,
      )
      expect(linhas).toHaveLength(0)
    })
  }

  it('um dono não consegue escrever notas internas', async () => {
    await expect(
      c.bd.consultar(
        { tipo: 'utilizador', id: c.donoA },
        `insert into public.notas_internas (tenant_id, titulo) values ($1, 'Intrusa')`,
        [c.tenantA],
      ),
    ).rejects.toThrow(/row-level security/)
  })

  it('o operador vê e escreve a cadeia de todos os tenants', async () => {
    const etapas = await c.bd.consultar<{ tenant_id: string }>(
      { tipo: 'utilizador', id: c.operador },
      'select tenant_id from public.cadeia_etapas',
    )
    expect(new Set(etapas.map((e) => e.tenant_id))).toEqual(new Set([c.tenantA, c.tenantB]))

    const [nova] = await c.bd.consultar<{ id: string; estado: string }>(
      { tipo: 'utilizador', id: c.operador },
      `insert into public.cadeia_etapas (tenant_id, frente, chave, titulo, personalizada)
       values ($1, 'canais', 'feira', 'Barraca na feira', true) returning id, estado`,
      [c.tenantB],
    )
    expect(nova!.estado).toBe('nao_avaliado')
    await c.bd.consultar(
      { tipo: 'utilizador', id: c.operador },
      `insert into public.cadeia_registos (tenant_id, etapa_id, autor_id, autor_nome, tipo, texto)
       values ($1, $2, $3, 'Equipa', 'criacao', 'Barraca na feira')`,
      [c.tenantB, nova!.id, c.operador],
    )
    const registos = await c.bd.consultar<{ n: number }>(
      { tipo: 'utilizador', id: c.operador },
      'select count(*)::int as n from public.cadeia_registos where etapa_id = $1',
      [nova!.id],
    )
    expect(registos[0]!.n).toBe(1)
  })

  it('rejeita links que não sejam http(s) e chaves fora do padrão', async () => {
    await expect(
      c.bd.consultar(
        { tipo: 'servidor' },
        `insert into public.cadeia_etapas (tenant_id, frente, chave, titulo, url) values ($1, 'canais', 'x1', 'X', 'javascript:alert(1)')`,
        [c.tenantA],
      ),
    ).rejects.toThrow(/check constraint/)
    await expect(
      c.bd.consultar(
        { tipo: 'servidor' },
        `insert into public.cadeia_etapas (tenant_id, frente, chave, titulo) values ($1, 'Canais', 'ok', 'X')`,
        [c.tenantA],
      ),
    ).rejects.toThrow(/check constraint/)
  })
})

describe('página pública (anon)', () => {
  it('lê o catálogo de um tenant activo', async () => {
    const linhas = await c.bd.consultar<{ nome: string }>(
      { tipo: 'anon' },
      'select nome from public.produtos where tenant_id = $1',
      [c.tenantA],
    )
    expect(linhas.map((l) => l.nome)).toEqual(['Produto A'])
  })

  it('não vê pedidos nem membros', async () => {
    await expect(c.bd.consultar({ tipo: 'anon' }, 'select * from public.pedidos')).rejects.toThrow(
      /permission denied/,
    )
    await expect(c.bd.consultar({ tipo: 'anon' }, 'select * from public.membros')).rejects.toThrow(
      /permission denied/,
    )
  })

  it('não vê colunas privadas de `tenants`', async () => {
    await expect(c.bd.consultar({ tipo: 'anon' }, 'select cnpj from public.tenants')).rejects.toThrow(
      /permission denied/,
    )
  })

  it('não consegue criar pedidos directamente, nem pela função', async () => {
    await expect(
      c.bd.consultar(
        { tipo: 'anon' },
        `insert into public.pedidos (tenant_id, loja_id, canal, tipo_entrega, subtotal, total, forma_pagamento) values ($1, $2, 'cardapio', 'retirada', 1, 1, 'pix')`,
        [c.tenantA, c.lojaA],
      ),
    ).rejects.toThrow(/permission denied/)
    await expect(c.bd.consultar({ tipo: 'anon' }, `select public.criar_pedido('{}'::jsonb)`)).rejects.toThrow(
      /permission denied/,
    )
  })

  it('um tenant suspenso continua visível; um cancelado desaparece', async () => {
    await c.bd.consultar(
      { tipo: 'servidor' },
      `update public.tenants set status = 'suspenso' where id = $1`,
      [c.tenantA],
    )
    const suspenso = await c.bd.consultar<{ status: string }>(
      { tipo: 'anon' },
      'select status from public.tenants where id = $1',
      [c.tenantA],
    )
    expect(suspenso[0]?.status).toBe('suspenso')

    await c.bd.consultar(
      { tipo: 'servidor' },
      `update public.tenants set status = 'cancelado' where id = $1`,
      [c.tenantA],
    )
    const cancelado = await c.bd.consultar({ tipo: 'anon' }, 'select id from public.tenants where id = $1', [
      c.tenantA,
    ])
    const produtos = await c.bd.consultar(
      { tipo: 'anon' },
      'select id from public.produtos where tenant_id = $1',
      [c.tenantA],
    )
    expect(cancelado).toHaveLength(0)
    expect(produtos).toHaveLength(0)

    await c.bd.consultar({ tipo: 'servidor' }, `update public.tenants set status = 'ativo' where id = $1`, [
      c.tenantA,
    ])
  })
})

describe('função criar_pedido (servidor)', () => {
  it('insere pedido e itens numa transacção e numera por dia', async () => {
    const pedido = {
      tenant_id: c.tenantB,
      loja_id: c.lojaB,
      canal: 'cardapio',
      cliente_nome: 'Maria',
      cliente_telefone: '69999991111',
      tipo_entrega: 'entrega',
      endereco: { rua: 'Rua X', numero: '1' },
      subtotal: 20,
      taxa_entrega: 5,
      total: 25,
      forma_pagamento: 'dinheiro',
      troco_para: 50,
      itens: [
        {
          produto_id: c.produtoB,
          nome: 'Produto B',
          quantidade: 2,
          preco_unitario: 10,
          total: 20,
          opcoes: [{ grupo: 'Ponto', nome: 'Ao ponto', preco_adicional: 0 }],
        },
      ],
    }
    const [criado] = await c.bd.consultar<{ id: string; numero: number; total: string }>(
      { tipo: 'servidor' },
      'select id, numero, total from public.criar_pedido($1::jsonb)',
      [JSON.stringify(pedido)],
    )
    expect(criado!.numero).toBe(2) // o cenário já tinha um pedido de hoje no tenant B
    expect(Number(criado!.total)).toBe(25)

    const itens = await c.bd.consultar<{ nome: string; quantidade: number }>(
      { tipo: 'utilizador', id: c.donoB },
      'select nome, quantidade from public.itens_pedido where pedido_id = $1',
      [criado!.id],
    )
    expect(itens).toEqual([{ nome: 'Produto B', quantidade: 2 }])
  })

  it('rejeita pedido sem itens', async () => {
    await expect(
      c.bd.consultar({ tipo: 'servidor' }, `select public.criar_pedido($1::jsonb)`, [
        JSON.stringify({
          tenant_id: c.tenantB,
          loja_id: c.lojaB,
          tipo_entrega: 'retirada',
          subtotal: 0,
          total: 0,
          forma_pagamento: 'pix',
          itens: [],
        }),
      ]),
    ).rejects.toThrow(/sem itens/)
  })
})

describe('integridade entre tenants', () => {
  it('um grupo de opção não pode apontar para um produto de outro tenant', async () => {
    await expect(
      c.bd.consultar(
        { tipo: 'servidor' },
        `insert into public.grupos_opcao (tenant_id, produto_id, nome) values ($1, $2, 'Cruzado')`,
        [c.tenantA, c.produtoB],
      ),
    ).rejects.toThrow(/foreign key/)
  })
})

describe('seed de demonstração', () => {
  it('aplica-se sobre as migrações e fica visível para anon', async () => {
    const bd = await BaseDeTeste.criar({ seed: true })
    try {
      const tenants = await bd.consultar<{ slug: string }>(
        { tipo: 'anon' },
        'select slug from public.tenants',
      )
      expect(tenants.map((t) => t.slug)).toEqual(['lanchonete-da-praca'])
      const produtos = await bd.consultar<{ n: number }>(
        { tipo: 'anon' },
        'select count(*)::int as n from public.produtos',
      )
      expect(produtos[0]!.n).toBe(6)
      const cadeia = await bd.consultar<{ n: number }>(
        { tipo: 'servidor' },
        'select count(*)::int as n from public.cadeia_etapas',
      )
      expect(cadeia[0]!.n).toBe(8)
      const notas = await bd.consultar<{ titulo: string }>(
        { tipo: 'servidor' },
        'select titulo from public.notas_internas',
      )
      expect(notas.map((n) => n.titulo)).toEqual(['Briefing inicial'])
    } finally {
      await bd.fechar()
    }
  })
})
