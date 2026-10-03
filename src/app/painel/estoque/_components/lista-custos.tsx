'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { custosDosProdutos } from '@/lib/dados/estoque'
import { formatarBRL } from '@/lib/dominio/moeda'
import { BOTAO, CampoEstoque, SeloMargem } from './apresentacao'

type ProdutoCusto = Awaited<ReturnType<typeof custosDosProdutos>>[number]
type Filtro = 'todos' | 'sem_ficha' | 'atencao'
const percentual = (valor: number | null) =>
  valor === null ? '—' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

export function ListaCustos({ produtos }: { produtos: ProdutoCusto[] }) {
  const [busca, definirBusca] = useState('')
  const [filtro, definirFiltro] = useState<Filtro>('todos')
  const semFicha = produtos.filter((produto) => !produto.temFicha).length
  const atencao = produtos.filter(
    (produto) => produto.temFicha && produto.margem.situacao !== 'saudavel',
  ).length
  const encontrados = produtos
    .filter(
      (produto) =>
        produto.nome.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR')) &&
        (filtro === 'todos' ||
          (filtro === 'sem_ficha'
            ? !produto.temFicha
            : produto.temFicha && produto.margem.situacao !== 'saudavel')),
    )
    .sort(
      (primeiro, segundo) =>
        Number(primeiro.temFicha) - Number(segundo.temFicha) ||
        primeiro.nome.localeCompare(segundo.nome, 'pt-BR'),
    )

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { titulo: 'Produtos', valor: produtos.length },
          { titulo: 'Sem ficha técnica', valor: semFicha },
          { titulo: 'Margens para revisar', valor: atencao },
        ].map((indicador) => (
          <div key={indicador.titulo} className="rounded-xl border border-areia bg-branco p-5">
            <p className="text-sm font-bold text-carvao">{indicador.titulo}</p>
            <p className="mt-2 text-4xl font-bold tabular-nums">{indicador.valor}</p>
          </div>
        ))}
      </div>
      {semFicha > 0 && (
        <p className="rounded-lg border border-ambar/40 bg-ambar-clara p-4 text-sm text-[#805000]">
          {semFicha} {semFicha === 1 ? 'produto ainda não tem' : 'produtos ainda não têm'} ficha. Cadastre os
          insumos para conhecer o custo e a margem.
        </p>
      )}
      <CampoEstoque
        name="busca-custos"
        rotulo="Buscar produto"
        type="search"
        placeholder="Nome do produto"
        value={busca}
        onChange={(evento) => definirBusca(evento.target.value)}
      />
      <div role="group" aria-label="Filtrar custos" className="flex flex-wrap gap-2">
        {(
          [
            { id: 'todos', nome: 'Todos' },
            { id: 'sem_ficha', nome: 'Sem ficha' },
            { id: 'atencao', nome: 'Revisar margem' },
          ] as const
        ).map((opcao) => (
          <button
            key={opcao.id}
            type="button"
            aria-pressed={filtro === opcao.id}
            onClick={() => definirFiltro(opcao.id)}
            className={`${BOTAO} ${filtro === opcao.id ? 'border-tinta! bg-tinta! text-papel!' : ''}`}
          >
            {opcao.nome}
          </button>
        ))}
      </div>
      <section
        className="overflow-hidden rounded-xl border border-areia bg-branco"
        aria-label="Custo dos produtos"
      >
        <header className="border-b border-areia bg-papel-2 px-4 py-4 sm:px-5">
          <p role="status" className="text-sm font-semibold">
            {encontrados.length} {encontrados.length === 1 ? 'produto' : 'produtos'}
          </p>
        </header>
        {encontrados.length === 0 ? (
          <p className="p-6 text-sm text-carvao">
            {produtos.length
              ? 'Nenhum produto encontrado. Ajuste a busca ou os filtros.'
              : 'Os produtos cadastrados aparecerão aqui para você montar as fichas.'}
          </p>
        ) : (
          <ul className="divide-y divide-areia">
            {encontrados.map((produto) => (
              <li
                key={produto.id}
                className="grid min-w-0 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <h2 className="font-sans text-lg font-bold break-words">{produto.nome}</h2>
                  <div className="mt-2">
                    {produto.temFicha ? (
                      <SeloMargem situacao={produto.margem.situacao} />
                    ) : (
                      <span className="inline-flex rounded-md bg-ambar-clara px-2.5 py-1 text-xs font-bold text-[#805000]">
                        Sem ficha técnica
                      </span>
                    )}
                  </div>
                  {produto.temFicha && produto.custo === 0 && (
                    <p className="mt-2 text-xs text-[#805000]">
                      Custo zerado: confira as entradas dos insumos.
                    </p>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                  {[
                    ['Preço de venda', formatarBRL(produto.preco)],
                    ['Custo', produto.temFicha ? formatarBRL(produto.custo) : '—'],
                    ['CMV', produto.temFicha ? percentual(produto.margem.cmvPercentual) : '—'],
                    ['Margem bruta', produto.temFicha ? percentual(produto.margem.margemPercentual) : '—'],
                  ].map(([rotulo, valor]) => (
                    <div key={rotulo}>
                      <dt className="text-xs text-carvao">{rotulo}</dt>
                      <dd className="mt-1 font-bold tabular-nums">{valor}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={`/painel/estoque/fichas/${produto.id}`}
                  className={BOTAO}
                  aria-label={`${produto.temFicha ? 'Editar' : 'Montar'} ficha de ${produto.nome}`}
                >
                  {produto.temFicha ? 'Editar ficha' : 'Montar ficha'}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-xs leading-relaxed text-carvao">
        CMV é o custo dos insumos em relação ao preço de venda. A margem bruta ainda não desconta taxas,
        equipe e outras despesas.
      </p>
    </div>
  )
}
