/**
 * Formato canónico do catálogo, alinhado com o Open Delivery (o padrão que a
 * 99Food usa). Todos os canais são adaptadores sobre isto: a página pública
 * na Fase 1, iFood e Open Delivery na Fase 3.
 *
 * Nomes de campos em português para bater com o resto do código; a
 * correspondência com o Open Delivery está nos comentários.
 */
import type { CanalPedido } from '@/lib/supabase/tipos'

/** Open Delivery: `Item.status` */
export type StatusItem = 'AVAILABLE' | 'UNAVAILABLE'

export type PrecoCanonico = {
  /** Open Delivery: `price.value` — o preço em vigor (promocional, se houver). */
  valor: number
  /** Open Delivery: `price.originalValue` — o preço de tabela quando há promoção. */
  valorOriginal?: number
  moeda: 'BRL'
}

export type OpcaoCanonica = {
  id: string
  nome: string
  preco: PrecoCanonico
  status: StatusItem
  ordem: number
}

export type GrupoOpcaoCanonico = {
  id: string
  nome: string
  /** Open Delivery: `minPermitted` / `maxPermitted` */
  min: number
  max: number
  obrigatorio: boolean
  ordem: number
  opcoes: OpcaoCanonica[]
}

export type ItemCanonico = {
  id: string
  nome: string
  descricao: string | null
  preco: PrecoCanonico
  imagemUrl: string | null
  status: StatusItem
  tempoPreparoMin: number | null
  ordem: number
  gruposOpcao: GrupoOpcaoCanonico[]
}

export type CategoriaCanonica = {
  id: string
  nome: string
  ordem: number
  itens: ItemCanonico[]
}

export type CatalogoCanonico = {
  tenantId: string
  /** Open Delivery: um `Menu` por loja. Na Fase 1 há um só. */
  categorias: CategoriaCanonica[]
}

/**
 * Contrato de um canal. Na Fase 1 só o cardápio próprio existe. Na Fase 3,
 * `ifood.ts` e `open-delivery.ts` implementam isto sem tocar no resto.
 */
export interface AdaptadorCanal<Saida> {
  readonly canal: CanalPedido
  /** Traduz o catálogo canónico para o formato que o canal consome. */
  exportarCatalogo(catalogo: CatalogoCanonico): Saida
}
