'use client'

import { useCallback, useEffect, useReducer } from 'react'
import { chaveItem, type ItemCarrinho } from '@/lib/dominio/carrinho'

export type LinhaCarrinho = ItemCarrinho & { chave: string }

type Accao =
  | { tipo: 'carregar'; itens: LinhaCarrinho[] }
  | { tipo: 'adicionar'; item: ItemCarrinho }
  | { tipo: 'quantidade'; chave: string; quantidade: number }
  | { tipo: 'remover'; chave: string }
  | { tipo: 'limpar' }

function reduzir(estado: LinhaCarrinho[], accao: Accao): LinhaCarrinho[] {
  switch (accao.tipo) {
    case 'carregar':
      return accao.itens
    case 'adicionar': {
      const chave = chaveItem(accao.item)
      const existente = estado.find((l) => l.chave === chave)
      if (existente) {
        return estado.map((l) =>
          l.chave === chave ? { ...l, quantidade: Math.min(99, l.quantidade + accao.item.quantidade) } : l,
        )
      }
      return [...estado, { ...accao.item, chave }]
    }
    case 'quantidade':
      return accao.quantidade <= 0
        ? estado.filter((l) => l.chave !== accao.chave)
        : estado.map((l) =>
            l.chave === accao.chave ? { ...l, quantidade: Math.min(99, accao.quantidade) } : l,
          )
    case 'remover':
      return estado.filter((l) => l.chave !== accao.chave)
    case 'limpar':
      return []
  }
}

/**
 * Carrinho persistido em localStorage por tenant. Começa vazio no servidor e
 * carrega no browser, para a hidratação bater sempre.
 */
export function useCarrinho(slug: string) {
  const chaveArmazenamento = `pvh:carrinho:${slug}`
  const [itens, despachar] = useReducer(reduzir, [])

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(chaveArmazenamento)
      if (guardado) {
        const lista = JSON.parse(guardado) as LinhaCarrinho[]
        if (Array.isArray(lista)) despachar({ tipo: 'carregar', itens: lista })
      }
    } catch {
      // armazenamento indisponível: o carrinho vive só em memória
    }
  }, [chaveArmazenamento])

  useEffect(() => {
    try {
      if (itens.length === 0) localStorage.removeItem(chaveArmazenamento)
      else localStorage.setItem(chaveArmazenamento, JSON.stringify(itens))
    } catch {
      // idem
    }
  }, [itens, chaveArmazenamento])

  const adicionar = useCallback((item: ItemCarrinho) => despachar({ tipo: 'adicionar', item }), [])
  const definirQuantidade = useCallback(
    (chave: string, quantidade: number) => despachar({ tipo: 'quantidade', chave, quantidade }),
    [],
  )
  const remover = useCallback((chave: string) => despachar({ tipo: 'remover', chave }), [])
  const limpar = useCallback(() => despachar({ tipo: 'limpar' }), [])

  return { itens, adicionar, definirQuantidade, remover, limpar }
}
