/**
 * Cálculo de um pedido a partir do carrinho e do catálogo.
 *
 * O browser envia apenas ids e quantidades. Os preços vêm sempre do catálogo
 * carregado no servidor, nunca do cliente. Esta função corre nos dois lados:
 * no browser para mostrar o total, no servidor para gravar o pedido.
 */
import { arredondar } from './moeda'

export type OpcaoCatalogo = { id: string; nome: string; preco_adicional: number; disponivel: boolean }
export type GrupoCatalogo = {
  id: string
  nome: string
  min: number
  max: number
  obrigatorio: boolean
  opcoes: OpcaoCatalogo[]
}
export type ProdutoCatalogo = {
  id: string
  nome: string
  preco: number
  preco_promocional: number | null
  disponivel: boolean
  grupos: GrupoCatalogo[]
}

export type ItemCarrinho = {
  produtoId: string
  quantidade: number
  opcoesIds: string[]
  observacao?: string
}

export type OpcaoEscolhida = { grupo: string; nome: string; preco_adicional: number }

export type ItemCalculado = {
  produtoId: string
  nome: string
  quantidade: number
  precoUnitario: number
  opcoes: OpcaoEscolhida[]
  observacao?: string
  total: number
}

export type RegrasLoja = {
  taxaEntrega: number
  pedidoMinimo: number
  aceitaEntrega: boolean
  aceitaRetirada: boolean
}

export type TipoEntrega = 'entrega' | 'retirada'

export type ResultadoPedido =
  | { ok: true; itens: ItemCalculado[]; subtotal: number; taxaEntrega: number; total: number }
  | { ok: false; erros: string[] }

export function precoEfetivo(produto: Pick<ProdutoCatalogo, 'preco' | 'preco_promocional'>): number {
  return produto.preco_promocional ?? produto.preco
}

export type ResultadoItem = { ok: true; item: ItemCalculado } | { ok: false; erro: string }

export function calcularItem(item: ItemCarrinho, produto: ProdutoCatalogo | undefined): ResultadoItem {
  if (!produto) return { ok: false, erro: 'Um dos itens já não existe no cardápio.' }
  if (!produto.disponivel) return { ok: false, erro: `"${produto.nome}" está esgotado.` }
  if (!Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 99) {
    return { ok: false, erro: `Quantidade inválida em "${produto.nome}".` }
  }

  const escolhidas: OpcaoEscolhida[] = []
  const restantes = new Set(item.opcoesIds)

  for (const grupo of produto.grupos) {
    const doGrupo = grupo.opcoes.filter((o) => restantes.has(o.id))
    for (const o of doGrupo) restantes.delete(o.id)

    const indisponivel = doGrupo.find((o) => !o.disponivel)
    if (indisponivel) return { ok: false, erro: `"${indisponivel.nome}" está esgotado em "${produto.nome}".` }

    const minimo = grupo.obrigatorio ? Math.max(1, grupo.min) : grupo.min
    if (doGrupo.length < minimo) {
      return {
        ok: false,
        erro: `Escolha ${minimo === 1 ? 'uma opção' : `${minimo} opções`} em "${grupo.nome}" (${produto.nome}).`,
      }
    }
    if (doGrupo.length > grupo.max) {
      return {
        ok: false,
        erro: `"${grupo.nome}" aceita no máximo ${grupo.max} ${grupo.max === 1 ? 'opção' : 'opções'} (${produto.nome}).`,
      }
    }
    for (const o of doGrupo)
      escolhidas.push({ grupo: grupo.nome, nome: o.nome, preco_adicional: o.preco_adicional })
  }

  if (restantes.size > 0) return { ok: false, erro: `Opção desconhecida em "${produto.nome}".` }

  const precoUnitario = arredondar(
    precoEfetivo(produto) + escolhidas.reduce((s, o) => s + o.preco_adicional, 0),
  )
  return {
    ok: true,
    item: {
      produtoId: produto.id,
      nome: produto.nome,
      quantidade: item.quantidade,
      precoUnitario,
      opcoes: escolhidas,
      observacao: item.observacao?.trim() || undefined,
      total: arredondar(precoUnitario * item.quantidade),
    },
  }
}

export function calcularPedido(
  itens: ItemCarrinho[],
  catalogo: ProdutoCatalogo[],
  regras: RegrasLoja,
  tipoEntrega: TipoEntrega,
): ResultadoPedido {
  const erros: string[] = []
  if (itens.length === 0) erros.push('O carrinho está vazio.')
  if (tipoEntrega === 'entrega' && !regras.aceitaEntrega) erros.push('Esta loja não faz entrega.')
  if (tipoEntrega === 'retirada' && !regras.aceitaRetirada) erros.push('Esta loja não aceita retirada.')

  const porId = new Map(catalogo.map((p) => [p.id, p]))
  const calculados: ItemCalculado[] = []
  for (const item of itens) {
    const r = calcularItem(item, porId.get(item.produtoId))
    if (r.ok) calculados.push(r.item)
    else erros.push(r.erro)
  }

  const subtotal = arredondar(calculados.reduce((s, i) => s + i.total, 0))
  if (erros.length === 0 && subtotal < regras.pedidoMinimo) {
    erros.push(`O pedido mínimo é de ${formatarMinimo(regras.pedidoMinimo)}.`)
  }
  if (erros.length > 0) return { ok: false, erros }

  const taxaEntrega = tipoEntrega === 'entrega' ? arredondar(regras.taxaEntrega) : 0
  return { ok: true, itens: calculados, subtotal, taxaEntrega, total: arredondar(subtotal + taxaEntrega) }
}

function formatarMinimo(valor: number): string {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`
}

/** Dois itens iguais (mesmo produto, mesmas opções, mesma observação) podem ser somados no carrinho. */
export function chaveItem(item: ItemCarrinho): string {
  return [item.produtoId, [...item.opcoesIds].sort().join(','), item.observacao?.trim() ?? ''].join('|')
}

export function quantidadeTotal(itens: ItemCarrinho[]): number {
  return itens.reduce((s, i) => s + i.quantidade, 0)
}
