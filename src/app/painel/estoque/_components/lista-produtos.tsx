'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ProdutoLinha } from '@/lib/supabase/tipos'
import { CampoEstoque, SelecaoEstoque, quantidade } from './apresentacao'

export function ListaProdutosEstoque({
  produtos,
}: {
  produtos: Pick<
    ProdutoLinha,
    'id' | 'nome' | 'controla_estoque' | 'unidade' | 'estoque_atual' | 'vendido_por_peso'
  >[]
}) {
  const [busca, definirBusca] = useState('')
  const [filtro, definirFiltro] = useState('todos')
  const encontrados = produtos.filter(
    (produto) =>
      produto.nome.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')) &&
      (filtro === 'todos' || produto.controla_estoque === (filtro === 'controlados')),
  )
  return (
    <section className="space-y-4" aria-label="Configuração dos produtos">
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
        <CampoEstoque
          name="busca-produto-estoque"
          rotulo="Buscar produto"
          type="search"
          value={busca}
          onChange={(e) => definirBusca(e.target.value)}
        />
        <SelecaoEstoque
          name="filtro-produto-estoque"
          rotulo="Controle de estoque"
          value={filtro}
          onChange={(e) => definirFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="controlados">Controlados</option>
          <option value="sem-controle">Sem controle</option>
        </SelecaoEstoque>
      </div>
      <p role="status" className="text-sm text-carvao">
        {encontrados.length} produtos encontrados
      </p>
      {encontrados.length ? (
        <ul className="divide-y divide-areia rounded-xl border border-areia bg-branco">
          {encontrados.map((produto) => (
            <li key={produto.id}>
              <Link
                href={`/painel/estoque/produtos/${produto.id}`}
                className="flex min-h-24 flex-wrap items-center justify-between gap-3 p-4 hover:bg-papel-2"
              >
                <div className="min-w-0 flex-1 basis-40">
                  <p className="font-bold">{produto.nome}</p>
                  <p className="mt-1 text-sm text-carvao">
                    {produto.controla_estoque ? 'Estoque controlado' : 'Sem controle de estoque'}
                    {produto.vendido_por_peso ? ' · vendido por peso' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold tabular-nums">
                    {produto.controla_estoque
                      ? `${quantidade(produto.estoque_atual)} ${produto.unidade}`
                      : '—'}
                  </p>
                  <span className="text-sm font-semibold underline">Configurar</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-areia p-6 text-sm text-carvao">
          Nenhum produto encontrado. Os produtos cadastrados no cardápio aparecem aqui.
        </p>
      )}
    </section>
  )
}
