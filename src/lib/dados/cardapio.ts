import { paraCatalogoCanonico, type LinhasCardapio } from '@/lib/canais/cardapio'
import type { CatalogoCanonico } from '@/lib/canais/tipos'
import type { Cliente } from '@/lib/supabase/server'
import type { CategoriaLinha, ProdutoLinha } from '@/lib/supabase/tipos'
import type { DadosCategoria, DadosGrupoOpcao, DadosProduto, LinhaImportacao } from '@/lib/validacao/cardapio'
import { garantir, ouErro } from './erros'

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

/** Quatro leituras em paralelo, todas filtradas por tenant, montadas no adaptador. */
export async function lerLinhasCardapio(supabase: Cliente, tenantId: string): Promise<LinhasCardapio> {
  const [categorias, produtos, grupos, opcoes] = await Promise.all([
    supabase.from('categorias').select('*').eq('tenant_id', tenantId).eq('ativo', true),
    supabase.from('produtos').select('*').eq('tenant_id', tenantId),
    supabase.from('grupos_opcao').select('*').eq('tenant_id', tenantId),
    supabase.from('opcoes').select('*').eq('tenant_id', tenantId),
  ])
  return {
    categorias: ouErro(categorias, 'categorias'),
    produtos: ouErro(produtos, 'produtos'),
    grupos: ouErro(grupos, 'grupos de opção'),
    opcoes: ouErro(opcoes, 'opções'),
  }
}

export async function obterCatalogo(supabase: Cliente, tenantId: string): Promise<CatalogoCanonico> {
  return paraCatalogoCanonico(tenantId, await lerLinhasCardapio(supabase, tenantId))
}

/** Para o painel: todas as categorias (activas ou não) com os produtos, sem esconder esgotados. */
export async function listarCategoriasComProdutos(
  supabase: Cliente,
  tenantId: string,
): Promise<Array<CategoriaLinha & { produtos: ProdutoLinha[] }>> {
  const [categorias, produtos] = await Promise.all([
    supabase.from('categorias').select('*').eq('tenant_id', tenantId).order('ordem').order('nome'),
    supabase.from('produtos').select('*').eq('tenant_id', tenantId).order('ordem').order('nome'),
  ])
  const lista = ouErro(produtos, 'produtos')
  return ouErro(categorias, 'categorias').map((c) => ({
    ...c,
    produtos: lista.filter((p) => p.categoria_id === c.id),
  }))
}

export async function obterProdutoComGrupos(supabase: Cliente, tenantId: string, produtoId: string) {
  const [produto, grupos, opcoes] = await Promise.all([
    supabase.from('produtos').select('*').eq('tenant_id', tenantId).eq('id', produtoId).maybeSingle(),
    supabase
      .from('grupos_opcao')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('produto_id', produtoId)
      .order('ordem'),
    supabase.from('opcoes').select('*').eq('tenant_id', tenantId).order('ordem'),
  ])
  if (!produto.data) return null
  const listaOpcoes = ouErro(opcoes, 'opções')
  return {
    ...produto.data,
    grupos: ouErro(grupos, 'grupos').map((g) => ({
      ...g,
      opcoes: listaOpcoes.filter((o) => o.grupo_id === g.id),
    })),
  }
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export async function criarCategoria(
  supabase: Cliente,
  tenantId: string,
  dados: DadosCategoria,
): Promise<string> {
  const linha = ouErro(
    await supabase
      .from('categorias')
      .insert({ tenant_id: tenantId, ...dados })
      .select('id')
      .single(),
    'Não foi possível criar a categoria',
  )
  return linha.id
}

export async function atualizarCategoria(
  supabase: Cliente,
  tenantId: string,
  id: string,
  dados: DadosCategoria,
): Promise<void> {
  garantir(
    await supabase.from('categorias').update(dados).eq('tenant_id', tenantId).eq('id', id),
    'Não foi possível guardar a categoria',
  )
}

export async function eliminarCategoria(supabase: Cliente, tenantId: string, id: string): Promise<void> {
  garantir(
    await supabase.from('categorias').delete().eq('tenant_id', tenantId).eq('id', id),
    'Não foi possível apagar a categoria',
  )
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

export async function criarProduto(
  supabase: Cliente,
  tenantId: string,
  dados: DadosProduto,
): Promise<string> {
  const linha = ouErro(
    await supabase
      .from('produtos')
      .insert({
        tenant_id: tenantId,
        categoria_id: dados.categoria_id,
        nome: dados.nome,
        descricao: dados.descricao ?? null,
        preco: dados.preco,
        preco_promocional: dados.preco_promocional ?? null,
        sku: dados.sku ?? null,
        disponivel: dados.disponivel,
        tempo_preparo_min: dados.tempo_preparo_min ?? null,
        ordem: dados.ordem,
      })
      .select('id')
      .single(),
    'Não foi possível criar o produto',
  )
  return linha.id
}

export async function atualizarProduto(
  supabase: Cliente,
  tenantId: string,
  id: string,
  dados: DadosProduto,
): Promise<void> {
  garantir(
    await supabase
      .from('produtos')
      .update({
        categoria_id: dados.categoria_id,
        nome: dados.nome,
        descricao: dados.descricao ?? null,
        preco: dados.preco,
        preco_promocional: dados.preco_promocional ?? null,
        sku: dados.sku ?? null,
        disponivel: dados.disponivel,
        tempo_preparo_min: dados.tempo_preparo_min ?? null,
        ordem: dados.ordem,
      })
      .eq('tenant_id', tenantId)
      .eq('id', id),
    'Não foi possível guardar o produto',
  )
}

/** O interruptor do painel. Uma linha, um toque. */
export async function definirDisponibilidade(
  supabase: Cliente,
  tenantId: string,
  id: string,
  disponivel: boolean,
): Promise<void> {
  garantir(
    await supabase.from('produtos').update({ disponivel }).eq('tenant_id', tenantId).eq('id', id),
    'Não foi possível mudar a disponibilidade',
  )
}

export async function definirFotoProduto(
  supabase: Cliente,
  tenantId: string,
  id: string,
  fotoUrl: string | null,
): Promise<void> {
  garantir(
    await supabase.from('produtos').update({ foto_url: fotoUrl }).eq('tenant_id', tenantId).eq('id', id),
    'Não foi possível guardar a foto',
  )
}

export async function eliminarProduto(supabase: Cliente, tenantId: string, id: string): Promise<void> {
  garantir(
    await supabase.from('produtos').delete().eq('tenant_id', tenantId).eq('id', id),
    'Não foi possível apagar o produto',
  )
}

/** Substitui todos os grupos de opção do produto. Mais simples e previsível do que editar um a um. */
export async function substituirGruposDoProduto(
  supabase: Cliente,
  tenantId: string,
  produtoId: string,
  grupos: DadosGrupoOpcao[],
): Promise<void> {
  garantir(
    await supabase.from('grupos_opcao').delete().eq('tenant_id', tenantId).eq('produto_id', produtoId),
    'Não foi possível limpar os grupos',
  )
  for (const [i, g] of grupos.entries()) {
    const grupo = ouErro(
      await supabase
        .from('grupos_opcao')
        .insert({
          tenant_id: tenantId,
          produto_id: produtoId,
          nome: g.nome,
          min: g.min,
          max: g.max,
          obrigatorio: g.obrigatorio,
          ordem: i,
        })
        .select('id')
        .single(),
      'Não foi possível criar o grupo',
    )
    garantir(
      await supabase.from('opcoes').insert(
        g.opcoes.map((o, j) => ({
          tenant_id: tenantId,
          grupo_id: grupo.id,
          nome: o.nome,
          preco_adicional: o.preco_adicional,
          disponivel: o.disponivel,
          ordem: j,
        })),
      ),
      'Não foi possível criar as opções',
    )
  }
}

// ---------------------------------------------------------------------------
// Importação em bloco (console)
// ---------------------------------------------------------------------------

/** Cria categorias em falta e todos os produtos. Categorias com o mesmo nome (sem acentos/maiúsculas) são reaproveitadas. */
export async function importarCardapio(
  supabase: Cliente,
  tenantId: string,
  linhas: LinhaImportacao[],
): Promise<{ produtos: number; categorias: number }> {
  const existentes = ouErro(
    await supabase.from('categorias').select('id, nome, ordem').eq('tenant_id', tenantId),
    'categorias',
  )
  const chave = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  const porNome = new Map(existentes.map((c) => [chave(c.nome), c.id]))
  let proximaOrdem = existentes.reduce((m, c) => Math.max(m, c.ordem), 0) + 1
  let categoriasCriadas = 0

  for (const nome of new Set(linhas.map((l) => l.categoria))) {
    if (porNome.has(chave(nome))) continue
    const id = await criarCategoria(supabase, tenantId, { nome, ordem: proximaOrdem++, ativo: true })
    porNome.set(chave(nome), id)
    categoriasCriadas++
  }

  const contagemPorCategoria = new Map<string, number>()
  garantir(
    await supabase.from('produtos').insert(
      linhas.map((l) => {
        const categoriaId = porNome.get(chave(l.categoria))!
        const ordem = (contagemPorCategoria.get(categoriaId) ?? 0) + 1
        contagemPorCategoria.set(categoriaId, ordem)
        return {
          tenant_id: tenantId,
          categoria_id: categoriaId,
          nome: l.nome,
          descricao: l.descricao ?? null,
          preco: l.preco,
          ordem,
        }
      }),
    ),
    'Não foi possível importar os produtos',
  )

  return { produtos: linhas.length, categorias: categoriasCriadas }
}

export async function contarProdutos(
  supabase: Cliente,
  tenantId: string,
): Promise<{ total: number; comFoto: number }> {
  const [total, comFoto] = await Promise.all([
    supabase.from('produtos').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .not('foto_url', 'is', null),
  ])
  return { total: total.count ?? 0, comFoto: comFoto.count ?? 0 }
}
