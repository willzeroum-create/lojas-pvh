'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ItemEstoque } from '@/lib/dados/estoque'
import { formatarBRL } from '@/lib/dominio/moeda'
import { CampoEstoque, SelecaoEstoque, quantidade } from './apresentacao'

export function ListaEstoque({ itens, producao }: { itens: ItemEstoque[]; producao: boolean }) {
  const [busca, definirBusca] = useState('')
  const [tipo, definirTipo] = useState('todos')
  const [situacao, definirSituacao] = useState('todos')
  const encontrados = itens.filter(
    (item) =>
      (tipo === 'todos' || item.tipo === tipo) &&
      (situacao === 'todos' || (situacao === 'baixo' ? item.abaixoDoMinimo : item.saldo <= 0)) &&
      `${item.nome} ${item.codigoBarras ?? ''}`
        .toLocaleLowerCase('pt-BR')
        .includes(busca.toLocaleLowerCase('pt-BR')),
  )
  return (
    <section className="space-y-4" aria-label="Itens em estoque">
      <div className="grid items-end gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <CampoEstoque
          name="busca-estoque"
          rotulo="Buscar item ou código de barras"
          type="search"
          value={busca}
          onChange={(e) => definirBusca(e.target.value)}
        />
        <SelecaoEstoque
          name="tipo-estoque"
          rotulo="Tipo"
          value={tipo}
          onChange={(e) => definirTipo(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="produto">Produtos</option>
          {producao && <option value="insumo">Insumos</option>}
        </SelecaoEstoque>
        <SelecaoEstoque
          name="situacao-estoque"
          rotulo="Situação"
          value={situacao}
          onChange={(e) => definirSituacao(e.target.value)}
        >
          <option value="todos">Todos os saldos</option>
          <option value="baixo">No mínimo ou abaixo</option>
          <option value="zerado">Zerados ou negativos</option>
        </SelecaoEstoque>
      </div>
      <p role="status" className="text-sm text-carvao">
        {encontrados.length} itens encontrados
      </p>
      {encontrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-areia p-6">
          <h2 className="font-bold">Nenhum item nesta lista</h2>
          <p className="mt-2 text-sm text-carvao">
            Ajuste os filtros ou ative o controle de estoque em Produtos.
          </p>
          <Link
            href="/painel/estoque/produtos"
            className="mt-3 inline-flex min-h-12 items-center font-bold underline"
          >
            Configurar produtos
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-areia rounded-xl border border-areia bg-branco">
          {encontrados.map((item) => (
            <li key={`${item.tipo}-${item.id}`}>
              <Link
                href={`/painel/estoque/itens/${item.tipo}/${item.id}`}
                className="flex min-h-24 flex-wrap items-center gap-4 p-4 hover:bg-papel-2 sm:p-5"
              >
                <div className="min-w-0 flex-1 basis-36">
                  <p className="font-bold">{item.nome}</p>
                  <p className="mt-1 text-xs text-carvao">
                    {item.tipo === 'produto' ? 'Produto' : 'Insumo'} · mínimo {quantidade(item.minimo)}{' '}
                    {item.unidade}
                  </p>
                </div>
                <div
                  className={`text-right ${item.saldo <= 0 ? 'text-vermelho' : item.abaixoDoMinimo ? 'text-[#805000]' : 'text-[#176b3a]'}`}
                >
                  <p className="text-2xl font-bold tabular-nums">
                    {quantidade(item.saldo)} <span className="text-sm">{item.unidade}</span>
                  </p>
                  <p className="text-xs font-semibold">
                    {item.saldo <= 0
                      ? 'Sem saldo disponível'
                      : item.abaixoDoMinimo
                        ? 'Reposição necessária'
                        : 'Saldo disponível'}
                  </p>
                </div>
                <p className="w-full text-sm text-carvao sm:w-28 sm:text-right">{formatarBRL(item.valor)}</p>
                <ArrowRight className="hidden size-5 sm:block" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
