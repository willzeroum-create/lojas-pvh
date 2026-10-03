'use client'

import { useState } from 'react'
import { Check, Search } from 'lucide-react'
import type { ItemEstoque } from '@/lib/dados/estoque'
import { BOTAO_ENTRADA, CAMPO_ENTRADA } from './apresentacao'

export function chaveItem(item: Pick<ItemEstoque, 'tipo' | 'id'>) {
  return `${item.tipo}:${item.id}`
}

export function SeletorItem({
  id,
  itens,
  valor,
  aoMudar,
  disabled,
  erro,
  podeLimpar = true,
}: {
  id: string
  itens: ItemEstoque[]
  valor: string
  aoMudar: (valor: string) => void
  disabled?: boolean
  erro?: string
  podeLimpar?: boolean
}) {
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(!valor)
  const selecionado = itens.find((item) => chaveItem(item) === valor)
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const encontrados = itens.filter((item) =>
    `${item.nome} ${item.codigoBarras ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo),
  )
  return (
    <div className="min-w-0 space-y-2">
      <span id={`${id}-rotulo`} className="block text-sm font-semibold text-carvao">
        Item no estoque
      </span>
      {selecionado && (
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-areia bg-papel px-3 py-2">
          <p className="min-w-0 text-sm">
            <strong className="block break-words">{selecionado.nome}</strong>
            <span className="text-carvao">
              {selecionado.tipo === 'insumo' ? 'Insumo' : 'Produto'} · {selecionado.unidade}
            </span>
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setAberto(!aberto)}
            className="min-h-12 rounded-md px-3 text-sm font-bold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-tinta"
          >
            {aberto ? 'Fechar busca' : 'Trocar'}
          </button>
        </div>
      )}
      {valor && !selecionado && (
        <p className="rounded-lg bg-ambar-clara p-3 text-sm text-[#7b4b00]">
          O item vinculado não está disponível no estoque atual. Escolha outro item.
        </p>
      )}
      {(aberto || !selecionado) && (
        <div className="space-y-2">
          <label htmlFor={`${id}-busca`} className="sr-only">
            Buscar produto ou insumo pelo nome ou código de barras
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-4 right-3 size-4 text-carvao"
            />
            <input
              id={`${id}-busca`}
              type="search"
              autoComplete="off"
              value={busca}
              disabled={disabled}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Nome ou código de barras"
              className={`${CAMPO_ENTRADA} pr-10`}
              aria-describedby={erro ? `${id}-erro` : undefined}
              aria-invalid={!!erro}
            />
          </div>
          <div
            className="max-h-60 overflow-y-auto rounded-lg border border-areia"
            aria-labelledby={`${id}-rotulo`}
          >
            {encontrados.slice(0, 20).map((item) => (
              <button
                key={chaveItem(item)}
                type="button"
                disabled={disabled}
                aria-pressed={chaveItem(item) === valor}
                onClick={() => {
                  aoMudar(chaveItem(item))
                  setAberto(false)
                  setBusca('')
                }}
                className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-areia px-3 py-3 text-left last:border-0 hover:bg-papel-2 focus-visible:bg-papel-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tinta disabled:opacity-50"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-bold break-words">{item.nome}</span>
                  <span className="text-xs text-carvao">
                    {item.tipo === 'insumo' ? 'Insumo' : 'Produto'} · {item.unidade}
                    {item.codigoBarras ? ` · ${item.codigoBarras}` : ''}
                  </span>
                </span>
                {chaveItem(item) === valor && (
                  <Check aria-hidden="true" className="size-4 shrink-0 text-verde" />
                )}
              </button>
            ))}
            {!encontrados.length && (
              <p className="p-3 text-sm text-carvao">
                Nenhum item encontrado. Tente outro nome ou confira se o controle de estoque está ativado.
              </p>
            )}
          </div>
          {encontrados.length > 20 && (
            <p className="text-xs text-carvao">
              20 de {encontrados.length} itens. Refine a busca para encontrar os demais.
            </p>
          )}
        </div>
      )}
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-vermelho">
          {erro}
        </p>
      )}
      {podeLimpar && valor && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            aoMudar('')
            setAberto(true)
          }}
          className={`${BOTAO_ENTRADA} w-full`}
        >
          Remover ligação
        </button>
      )}
    </div>
  )
}
