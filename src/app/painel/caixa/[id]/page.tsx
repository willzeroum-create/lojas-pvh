import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { detalheCaixa } from '@/lib/dados/caixa'
import type { LinhaConferencia } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import {
  AvisoCaixa,
  BOTAO_CAIXA,
  dataCaixa,
  DiferencaCaixa,
  EstadoDoCaixa,
  TabelaConferencia,
} from '../_components/apresentacao'
import { ConferirCaixa } from '../_components/conferir-caixa'
import { MovimentosCaixa } from '../_components/movimentos-caixa'

export const metadata: Metadata = { title: 'Detalhe do caixa' }

export default async function DetalheDoCaixa({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { supabase, tenantId } = await exigirModulo('caixa')
  const { id } = await params
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound()
  const atual = await detalheCaixa(supabase, tenantId, id)
  if (!atual) notFound()
  // Um caixa aberto nunca revela o esperado por esta rota alternativa.
  if (atual.sessao.estado === 'aberta') redirect('/painel/caixa')
  const parametros = await searchParams
  const linhas: LinhaConferencia[] = atual.conferencias.map((linha) => ({
    forma: linha.forma,
    esperado: Number(linha.esperado),
    informado: Number(linha.informado),
    diferenca: Number(linha.diferenca),
  }))
  const diferencaTotal = Math.round(linhas.reduce((soma, linha) => soma + linha.diferenca * 100, 0)) / 100
  const bate = linhas.every((linha) => linha.diferenca === 0)

  return (
    <>
      <header className="space-y-4 border-b border-areia pb-6">
        <Link
          href="/painel/caixa/historico"
          className="inline-flex min-h-12 items-center gap-2 rounded-lg text-sm font-bold text-carvao"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Histórico de caixas
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
              Caixa / Detalhe do turno
            </p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Caixa de {dataCaixa(atual.sessao.aberta_em)}
            </h1>
          </div>
          <EstadoDoCaixa estado={atual.sessao.estado} />
        </div>
      </header>
      {(parametros.fechamento === 'financeiro' || parametros.fechamento === 'sem-financeiro') && (
        <AvisoCaixa>
          {parametros.fechamento === 'financeiro'
            ? 'Caixa fechado. As vendas foram lançadas no Financeiro.'
            : 'Caixa fechado. Não houve lançamento automático das vendas no Financeiro.'}
        </AvisoCaixa>
      )}
      <section
        aria-label="Dados deste turno"
        className="grid gap-4 rounded-xl border border-areia bg-branco p-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <p className="text-xs font-bold text-carvao uppercase">Operador</p>
          <p className="mt-2 font-bold break-words">{atual.sessao.operador_nome}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-carvao uppercase">Fundo inicial</p>
          <p className="mt-2 text-xl font-bold tabular-nums">
            {formatarBRL(Number(atual.sessao.fundo_troco))}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-carvao uppercase">Vendido</p>
          <p className="mt-2 text-xl font-bold tabular-nums">{formatarBRL(atual.vendas.total)}</p>
          <p className="mt-1 text-xs text-carvao">
            {atual.vendas.quantidade} {atual.vendas.quantidade === 1 ? 'venda' : 'vendas'}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-carvao uppercase">Fechado em</p>
          <p className="mt-2 text-sm font-bold tabular-nums">
            {atual.sessao.fechada_em ? dataCaixa(atual.sessao.fechada_em) : 'Não registrado'}
          </p>
          <p className="mt-1 text-xs text-carvao">Horário de Porto Velho</p>
        </div>
      </section>
      <section aria-labelledby="titulo-conferencia-detalhe" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="titulo-conferencia-detalhe" className="text-xl font-bold">
              Conferência do fechamento
            </h2>
            <p className="mt-1 text-sm text-carvao">
              {bate
                ? 'Valores contados e esperados coincidem.'
                : 'Diferenças registradas por forma de recebimento.'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-carvao">Diferença total</p>
            <DiferencaCaixa valor={diferencaTotal} grande />
          </div>
        </div>
        <TabelaConferencia linhas={linhas} />
        {!bate && diferencaTotal === 0 && (
          <AvisoCaixa>O total se compensa, mas existem diferenças entre as formas de recebimento.</AvisoCaixa>
        )}
        {atual.sessao.justificativa && (
          <div className="rounded-xl border border-areia bg-papel-2 p-5">
            <h3 className="text-sm font-bold">Justificativa / observação</h3>
            <p className="mt-2 text-sm break-words whitespace-pre-wrap text-carvao">
              {atual.sessao.justificativa}
            </p>
          </div>
        )}
      </section>
      {atual.sessao.estado === 'fechada' ? (
        <ConferirCaixa sessaoId={atual.sessao.id} />
      ) : (
        <AvisoCaixa>
          Conferido por {atual.sessao.conferida_por ?? 'operador'}
          {atual.sessao.conferida_em ? ` em ${dataCaixa(atual.sessao.conferida_em)}` : ''}.
        </AvisoCaixa>
      )}
      <MovimentosCaixa movimentos={atual.movimentos} />
      <Link href="/painel/caixa" className={`${BOTAO_CAIXA} self-start`}>
        Ir ao caixa atual
      </Link>
    </>
  )
}
