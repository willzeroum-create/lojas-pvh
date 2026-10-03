'use client'

import { ArrowRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatarBRL } from '@/lib/dominio/moeda'
import type { InsumoLinha } from '@/lib/supabase/tipos'
import { BOTAO, CAMPO, quantidade } from '../../_components/apresentacao'

const FILTROS = [
  { id: 'todos', nome: 'Todos' },
  { id: 'ativos', nome: 'Ativos' },
  { id: 'inativos', nome: 'Inativos' },
] as const

export function ListaInsumos({ insumos }: { insumos: InsumoLinha[] }) {
  const [busca, definirBusca] = useState('')
  const [situacao, definirSituacao] = useState<'todos' | 'ativos' | 'inativos'>('todos')
  const filtrados = insumos.filter(
    (insumo) =>
      (situacao === 'todos' || (situacao === 'ativos' ? insumo.ativo : !insumo.ativo)) &&
      `${insumo.nome} ${insumo.codigo_barras ?? ''}`
        .toLocaleLowerCase('pt-BR')
        .includes(busca.trim().toLocaleLowerCase('pt-BR')),
  )
  return (
    <>
      <section aria-label="Buscar e filtrar insumos" className="space-y-4">
        <div className="relative">
          <label htmlFor="busca-insumos" className="sr-only">
            Buscar por nome ou código de barras
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-3.5 left-4 size-5 text-carvao"
          />
          <input
            id="busca-insumos"
            type="search"
            value={busca}
            onChange={(evento) => definirBusca(evento.target.value)}
            placeholder="Nome ou código de barras"
            className={`${CAMPO} pl-12`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Situação do cadastro"
            className="flex rounded-lg border border-areia bg-papel-2 p-1"
          >
            {FILTROS.map((filtro) => (
              <button
                key={filtro.id}
                type="button"
                aria-pressed={situacao === filtro.id}
                onClick={() => definirSituacao(filtro.id)}
                className={`min-h-12 rounded-md px-4 text-sm font-bold ${situacao === filtro.id ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3'}`}
              >
                {filtro.nome}
              </button>
            ))}
          </div>
          <p role="status" className="text-sm text-carvao">
            <strong className="text-xl text-tinta tabular-nums">{filtrados.length}</strong>{' '}
            {filtrados.length === 1 ? 'insumo' : 'insumos'}
          </p>
        </div>
      </section>
      <section
        aria-label="Lista de insumos"
        className="overflow-hidden rounded-xl border border-areia bg-branco"
      >
        {filtrados.length ? (
          <ul className="divide-y divide-areia">
            {filtrados.map((insumo) => {
              const zerado = insumo.quantidade_atual <= 0
              const baixo = insumo.quantidade_atual <= insumo.quantidade_minima
              return (
                <li
                  key={insumo.id}
                  className="grid min-w-0 items-center gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                      <h2 className="font-sans text-lg font-bold break-words">{insumo.nome}</h2>
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-bold ${insumo.ativo ? 'bg-verde-clara text-[#176b3a]' : 'bg-papel-2 text-carvao'}`}
                      >
                        {insumo.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {insumo.codigo_barras && (
                      <p className="mt-2 text-xs break-all text-carvao">Código: {insumo.codigo_barras}</p>
                    )}
                    <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                      <div>
                        <dt className="text-xs text-carvao">Saldo atual</dt>
                        <dd
                          className={`mt-1 text-xl font-bold tabular-nums ${zerado ? 'text-vermelho' : baixo ? 'text-[#805000]' : 'text-tinta'}`}
                        >
                          {quantidade(insumo.quantidade_atual)}{' '}
                          <span className="text-sm font-medium">{insumo.unidade}</span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-carvao">Mínimo</dt>
                        <dd className="mt-1 text-base font-semibold tabular-nums">
                          {quantidade(insumo.quantidade_minima)} {insumo.unidade}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-carvao">Custo por {insumo.unidade}</dt>
                        <dd className="mt-1 text-base font-semibold tabular-nums">
                          {formatarBRL(insumo.custo_unitario)}
                        </dd>
                      </div>
                    </dl>
                    {insumo.ativo && baixo && (
                      <p className={`mt-3 text-xs font-bold ${zerado ? 'text-vermelho' : 'text-[#805000]'}`}>
                        {zerado ? 'Sem saldo disponível' : 'No mínimo ou abaixo: precisa repor'}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/painel/estoque/insumos/${insumo.id}`}
                    className={BOTAO}
                    aria-label={`Editar ${insumo.nome}`}
                  >
                    Editar insumo <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold">
              {insumos.length ? 'Nenhum insumo com esse filtro' : 'Cadastre seu primeiro insumo'}
            </h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
              {insumos.length
                ? 'Tente outro nome ou veja todas as situações de cadastro.'
                : 'Comece pelos ingredientes e materiais usados nos produtos. O saldo será registrado nas entradas de estoque.'}
            </p>
            {insumos.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  definirBusca('')
                  definirSituacao('todos')
                }}
                className={`${BOTAO} mt-5`}
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </section>
    </>
  )
}
