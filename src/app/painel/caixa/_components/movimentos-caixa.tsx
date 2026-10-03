import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { ROTULO_FORMA } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import type { CaixaMovimentoLinha } from '@/lib/supabase/tipos'
import { dataCaixa } from './apresentacao'

const ROTULOS = { venda: 'Venda', suprimento: 'Suprimento', sangria: 'Sangria', estorno: 'Estorno de venda' }

export function MovimentosCaixa({ movimentos }: { movimentos: CaixaMovimentoLinha[] }) {
  return (
    <section
      aria-labelledby="titulo-movimentos"
      className="overflow-hidden rounded-xl border border-areia bg-branco"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-areia bg-papel-2/50 px-4 py-4 sm:px-5">
        <h2 id="titulo-movimentos" className="font-bold">
          Movimentos do caixa
        </h2>
        <p className="text-xs text-carvao">{movimentos.length} registros · mais recentes primeiro</p>
      </header>
      {movimentos.length ? (
        <ul className="divide-y divide-areia">
          {[...movimentos].reverse().map((movimento) => {
            const entrada = movimento.tipo === 'venda' || movimento.tipo === 'suprimento'
            return (
              <li key={movimento.id} className="flex min-w-0 items-start gap-3 px-4 py-4 sm:px-5">
                {entrada ? (
                  <ArrowDownLeft aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#176b3a]" />
                ) : (
                  <ArrowUpRight aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#a82a1a]" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <p className="text-sm font-bold">
                      {ROTULOS[movimento.tipo]}{' '}
                      <span className="font-normal text-carvao">· {ROTULO_FORMA[movimento.forma]}</span>
                    </p>
                    <p
                      className={`text-base font-bold tabular-nums ${entrada ? 'text-[#176b3a]' : 'text-[#a82a1a]'}`}
                    >
                      <span className="sr-only">{entrada ? 'Entrada de ' : 'Saída de '}</span>
                      {entrada ? '+' : '−'} {formatarBRL(Number(movimento.valor))}
                    </p>
                  </div>
                  {movimento.motivo && (
                    <p className="mt-1 text-sm break-words text-carvao">{movimento.motivo}</p>
                  )}
                  <p className="mt-2 text-xs text-carvao">
                    {dataCaixa(movimento.criado_em)}
                    {movimento.autor_nome ? ` · ${movimento.autor_nome}` : ''}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="px-5 py-8 text-sm text-carvao">
          Nenhum movimento registrado. As vendas, entradas e retiradas aparecem aqui.
        </p>
      )}
    </section>
  )
}
