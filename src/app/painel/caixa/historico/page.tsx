import { ArrowRight, History } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { historicoCaixas } from '@/lib/dados/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import { BOTAO_CAIXA, dataCaixa, DiferencaCaixa, EstadoDoCaixa } from '../_components/apresentacao'

export const metadata: Metadata = { title: 'Histórico de caixas' }

export default async function HistoricoCaixa() {
  const { supabase, tenantId } = await exigirModulo('caixa')
  const sessoes = await historicoCaixas(supabase, tenantId)
  return (
    <>
      <header className="border-b border-areia pb-6">
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">Caixa / Histórico</p>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Cada turno, registrado.</h1>
        <p className="mt-2 text-sm text-carvao">
          Aberturas, fechamentos e diferenças · horário de Porto Velho
        </p>
      </header>
      {sessoes.length ? (
        <section
          aria-label="Histórico de caixas"
          className="overflow-hidden rounded-xl border border-areia bg-branco"
        >
          <ul className="divide-y divide-areia">
            {sessoes.map((sessao) => (
              <li key={sessao.id}>
                <Link
                  href={sessao.estado === 'aberta' ? '/painel/caixa' : `/painel/caixa/${sessao.id}`}
                  className="group grid min-h-12 gap-4 px-4 py-5 hover:bg-papel-2/50 sm:px-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] xl:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold tabular-nums">{dataCaixa(sessao.aberta_em)}</p>
                      <EstadoDoCaixa estado={sessao.estado} />
                    </div>
                    <p className="mt-2 text-sm break-words text-carvao">Operador: {sessao.operador_nome}</p>
                  </div>
                  <div className="text-sm text-carvao">
                    <p>
                      Fundo:{' '}
                      <strong className="text-tinta tabular-nums">
                        {formatarBRL(Number(sessao.fundo_troco))}
                      </strong>
                    </p>
                    <p className="mt-1">
                      {sessao.fechada_em
                        ? `Fechado em ${dataCaixa(sessao.fechada_em)}`
                        : 'Turno em andamento'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="mb-1 text-xs text-carvao">Diferença no fechamento</p>
                      {sessao.diferencaTotal === null ? (
                        <p className="text-sm font-semibold">Aguardando contagem</p>
                      ) : (
                        <DiferencaCaixa valor={sessao.diferencaTotal} />
                      )}
                    </div>
                    <ArrowRight className="size-5 shrink-0 text-carvao" aria-hidden="true" />
                    <span className="sr-only">Ver caixa de {sessao.operador_nome}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <p className="border-t border-areia bg-papel-2/50 px-5 py-3 text-xs text-carvao">
            {sessoes.length === 60
              ? 'Mostrando os 60 caixas mais recentes.'
              : `${sessoes.length} ${sessoes.length === 1 ? 'caixa registrado' : 'caixas registrados'}.`}
          </p>
        </section>
      ) : (
        <section className="rounded-xl border border-areia bg-branco p-6 sm:p-8">
          <History aria-hidden="true" className="mb-4 size-8 text-carvao" />
          <h2 className="text-xl font-bold">Seu histórico começa na abertura.</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
            Cada caixa aberto fica registrado aqui, com operador, horários e conferência.
          </p>
          <Link href="/painel/caixa" className={`${BOTAO_CAIXA} mt-5`}>
            Ir ao caixa
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </section>
      )}
    </>
  )
}
