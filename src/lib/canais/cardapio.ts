/**
 * Adaptador do canal "cardapio" — a página pública do comerciante.
 *
 * Entrada: as linhas da base. Saída: o catálogo canónico e, a partir dele, o
 * formato que o carrinho usa para calcular preços. A página pública nunca lê
 * as linhas da base directamente; passa sempre por aqui.
 */
import type { ProdutoCatalogo } from '@/lib/dominio/carrinho'
import type { CategoriaLinha, GrupoOpcaoLinha, OpcaoLinha, ProdutoLinha } from '@/lib/supabase/tipos'
import type { AdaptadorCanal, CatalogoCanonico, ItemCanonico } from './tipos'

export type LinhasCardapio = {
  categorias: CategoriaLinha[]
  produtos: ProdutoLinha[]
  grupos: GrupoOpcaoLinha[]
  opcoes: OpcaoLinha[]
}

const porOrdem = <T extends { ordem: number; nome: string }>(a: T, b: T) =>
  a.ordem - b.ordem || a.nome.localeCompare(b.nome)

export function paraCatalogoCanonico(tenantId: string, linhas: LinhasCardapio): CatalogoCanonico {
  const opcoesPorGrupo = new Map<string, OpcaoLinha[]>()
  for (const o of linhas.opcoes)
    opcoesPorGrupo.set(o.grupo_id, [...(opcoesPorGrupo.get(o.grupo_id) ?? []), o])

  const gruposPorProduto = new Map<string, GrupoOpcaoLinha[]>()
  for (const g of linhas.grupos)
    gruposPorProduto.set(g.produto_id, [...(gruposPorProduto.get(g.produto_id) ?? []), g])

  const produtosPorCategoria = new Map<string, ProdutoLinha[]>()
  for (const p of linhas.produtos)
    produtosPorCategoria.set(p.categoria_id, [...(produtosPorCategoria.get(p.categoria_id) ?? []), p])

  const itemDe = (p: ProdutoLinha): ItemCanonico => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: {
      valor: Number(p.preco_promocional ?? p.preco),
      valorOriginal: p.preco_promocional == null ? undefined : Number(p.preco),
      moeda: 'BRL',
    },
    imagemUrl: p.foto_url,
    status: p.disponivel ? 'AVAILABLE' : 'UNAVAILABLE',
    tempoPreparoMin: p.tempo_preparo_min,
    ordem: p.ordem,
    gruposOpcao: (gruposPorProduto.get(p.id) ?? []).sort(porOrdem).map((g) => ({
      id: g.id,
      nome: g.nome,
      min: g.min,
      max: g.max,
      obrigatorio: g.obrigatorio,
      ordem: g.ordem,
      opcoes: (opcoesPorGrupo.get(g.id) ?? []).sort(porOrdem).map((o) => ({
        id: o.id,
        nome: o.nome,
        preco: { valor: Number(o.preco_adicional), moeda: 'BRL' },
        status: o.disponivel ? 'AVAILABLE' : 'UNAVAILABLE',
        ordem: o.ordem,
      })),
    })),
  })

  return {
    tenantId,
    categorias: [...linhas.categorias].sort(porOrdem).map((c) => ({
      id: c.id,
      nome: c.nome,
      ordem: c.ordem,
      itens: (produtosPorCategoria.get(c.id) ?? []).sort(porOrdem).map(itemDe),
    })),
  }
}

/** O que a página pública mostra: só categorias com itens disponíveis. */
export function apenasDisponiveis(catalogo: CatalogoCanonico): CatalogoCanonico {
  return {
    ...catalogo,
    categorias: catalogo.categorias
      .map((c) => ({ ...c, itens: c.itens.filter((i) => i.status === 'AVAILABLE') }))
      .filter((c) => c.itens.length > 0),
  }
}

/** Formato que `calcularPedido` consome, tanto no browser como no servidor. */
export function paraCatalogoCarrinho(catalogo: CatalogoCanonico): ProdutoCatalogo[] {
  return catalogo.categorias.flatMap((c) =>
    c.itens.map((i) => ({
      id: i.id,
      nome: i.nome,
      preco: i.preco.valorOriginal ?? i.preco.valor,
      preco_promocional: i.preco.valorOriginal === undefined ? null : i.preco.valor,
      disponivel: i.status === 'AVAILABLE',
      grupos: i.gruposOpcao.map((g) => ({
        id: g.id,
        nome: g.nome,
        min: g.min,
        max: g.max,
        obrigatorio: g.obrigatorio,
        opcoes: g.opcoes.map((o) => ({
          id: o.id,
          nome: o.nome,
          preco_adicional: o.preco.valor,
          disponivel: o.status === 'AVAILABLE',
        })),
      })),
    })),
  )
}

export const adaptadorCardapio: AdaptadorCanal<CatalogoCanonico> = {
  canal: 'cardapio',
  exportarCatalogo: apenasDisponiveis,
}
