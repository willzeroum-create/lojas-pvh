import { ArrowDownLeft, ArrowRight, ArrowUpRight, Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarParcelas, painelFinanceiro, type ParcelaLista } from '@/lib/dados/financeiro'
import { formatarBRL } from '@/lib/dominio/moeda'
import {
  ESTILO_BOTAO,
  ESTILO_PRIMARIO,
  formatarDataFinanceira,
  SeloSituacao,
} from './_components/apresentacao'
import { FluxoCaixa } from './_components/fluxo-caixa'
import { ResultadoDoMes } from './_components/resultado-mes'

export const metadata: Metadata = { title: 'Financeiro' }

function ContasPrioritarias({
  parcelas,
  tipo,
  hoje,
}: {
  parcelas: ParcelaLista[]
  tipo: 'receber' | 'pagar'
  hoje: string
}) {
  const receber = tipo === 'receber'
  return (
    <section
      aria-labelledby={`prioridade-${tipo}`}
      className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-areia bg-papel-2/50 px-4 py-4 sm:px-5">
        <div>
          <h3 id={`prioridade-${tipo}`} className="font-bold">
            {receber ? 'A receber' : 'A pagar'}
          </h3>
          <p className="mt-1 text-xs text-carvao">
            {parcelas.length === 500 ? '500 ou mais' : parcelas.length}{' '}
            {parcelas.length === 1 ? 'parcela pendente' : 'parcelas pendentes'}
          </p>
        </div>
        <Link
          href={`/painel/financeiro/${tipo}?situacao=abertas&ate=${hoje}`}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg px-2 text-sm font-bold"
        >
          Ver lista <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </header>
      {parcelas.length ? (
        <ul className="divide-y divide-areia">
          {parcelas.slice(0, 5).map((parcela) => (
            <li key={parcela.id} className="px-4 py-3 sm:px-5">
              <Link
                href={`/painel/financeiro/contas/${parcela.tituloId}`}
                className="flex min-h-12 min-w-0 flex-col gap-2 rounded-md py-1 hover:underline hover:underline-offset-4"
              >
                <span className="flex min-w-0 items-start justify-between gap-3">
                  <span className="min-w-0 text-sm font-bold break-words">{parcela.descricao}</span>
                  <ArrowRight aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                </span>
                <span className="text-xs text-carvao">
                  {parcela.pessoa ? `${parcela.pessoa} · ` : ''}Parcela {parcela.numero}/
                  {parcela.totalParcelas} · {formatarDataFinanceira(parcela.vencimento)}
                </span>
              </Link>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <SeloSituacao situacao={parcela.situacao} />
                <span
                  className={`text-lg font-bold tabular-nums ${parcela.situacao === 'vencida' ? 'text-vermelho' : 'text-tinta'}`}
                >
                  {formatarBRL(parcela.saldo)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5 py-8">
          <p className="text-base font-bold">Nenhuma pendência até hoje.</p>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            As próximas contas {receber ? 'a receber' : 'a pagar'} continuam disponíveis na lista.
          </p>
        </div>
      )}
      {parcelas.length > 5 && (
        <p className="border-t border-areia px-5 py-3 text-xs text-carvao">
          Mostrando as 5 parcelas mais antigas. Abra a lista para consultar as demais.
        </p>
      )}
    </section>
  )
}

export default async function PaginaFinanceiro() {
  const { supabase, tenantId } = await exigirModulo('financeiro')
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Porto_Velho' })
  const [painel, receber, pagar] = await Promise.all([
    painelFinanceiro(supabase, tenantId, hoje),
    listarParcelas(supabase, tenantId, { tipo: 'receber', situacao: 'abertas', ate: hoje }, hoje),
    listarParcelas(supabase, tenantId, { tipo: 'pagar', situacao: 'abertas', ate: hoje }, hoje),
  ])
  const carteirasAtivas = painel.carteiras.filter((carteira) => carteira.ativa)

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seu negócio / Financeiro
          </p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
            Seu dinheiro, à vista.
          </h1>
          <p className="mt-2 text-sm text-carvao">
            Posição de {formatarDataFinanceira(hoje)} · horário de Porto Velho
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 min-[480px]:w-auto min-[480px]:flex-row lg:flex-col xl:flex-row">
          <Link href="/painel/financeiro/contas/nova?tipo=receber" className={ESTILO_PRIMARIO}>
            <Plus aria-hidden="true" className="size-4 shrink-0" />
            Nova conta a receber
          </Link>
          <Link href="/painel/financeiro/contas/nova?tipo=pagar" className={ESTILO_BOTAO}>
            <Plus aria-hidden="true" className="size-4 shrink-0" />
            Nova conta a pagar
          </Link>
        </div>
      </header>

      <section aria-label="Resumo financeiro" className="grid min-w-0 gap-3 lg:grid-cols-3">
        <div className="min-w-0 rounded-xl bg-tinta p-5 text-papel sm:p-6">
          <p className="text-sm font-semibold">Saldo total agora</p>
          <p
            className={`mt-3 text-4xl leading-tight font-bold tracking-tight tabular-nums ${painel.saldoTotal < 0 ? 'text-[#ffac9c]' : ''}`}
          >
            {formatarBRL(painel.saldoTotal)}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-papel-3">
            {carteirasAtivas.length} {carteirasAtivas.length === 1 ? 'carteira ativa' : 'carteiras ativas'} ·
            dinheiro já movimentado
          </p>
          {painel.saldoTotal < 0 && (
            <p className="mt-3 text-sm font-bold text-[#ffac9c]">Saldo atual negativo</p>
          )}
        </div>
        {(
          [
            { tipo: 'receber', titulo: 'Falta receber', dados: painel.aReceber },
            { tipo: 'pagar', titulo: 'Falta pagar', dados: painel.aPagar },
          ] as const
        ).map(({ tipo, titulo, dados }) => (
          <div key={tipo} className="min-w-0 rounded-xl border border-areia bg-branco p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-carvao">{titulo}</p>
              {tipo === 'receber' ? (
                <ArrowDownLeft className="size-5 text-[#176b3a]" aria-hidden="true" />
              ) : (
                <ArrowUpRight className="size-5 text-carvao" aria-hidden="true" />
              )}
            </div>
            <p
              className={`mt-3 text-3xl leading-tight font-bold tracking-tight tabular-nums ${tipo === 'receber' ? 'text-[#176b3a]' : 'text-tinta'}`}
            >
              {formatarBRL(dados.total)}
            </p>
            <Link
              href={`/painel/financeiro/${tipo}?situacao=vencidas`}
              className={`mt-3 flex min-h-12 flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${dados.vencido > 0 ? 'bg-vermelho-clara text-[#a82a1a]' : 'bg-papel text-carvao'}`}
            >
              <span>
                <strong className="tabular-nums">{formatarBRL(dados.vencido)}</strong> vencidos
              </span>
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </section>

      <section
        aria-labelledby="titulo-carteiras"
        className="min-w-0 rounded-xl border border-areia bg-papel-2/50 p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-carteiras" className="text-sm font-bold">
            Saldo por carteira
          </h2>
          <p className="text-xs text-carvao">Só as ativas compõem o saldo total.</p>
        </div>
        {painel.carteiras.length ? (
          <dl className="mt-4 grid gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
            {painel.carteiras.map((carteira) => (
              <div key={carteira.id} className="min-w-0 border-l-2 border-areia py-1 pl-3">
                <dt className="text-sm text-carvao">
                  {carteira.nome}
                  {!carteira.ativa && <span className="ml-2 text-xs">(inativa)</span>}
                </dt>
                <dd
                  className={`mt-1 text-xl font-bold tabular-nums ${carteira.saldo < 0 ? 'text-vermelho' : 'text-tinta'}`}
                >
                  {formatarBRL(carteira.saldo)}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-carvao">
            Nenhuma carteira disponível. Peça à equipe responsável para configurar as carteiras do negócio.
          </p>
        )}
      </section>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <FluxoCaixa semanas={painel.fluxo} />
          <section aria-labelledby="titulo-prioridades" className="space-y-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-carvao uppercase">
                Primeiro, estas contas
              </p>
              <h2 id="titulo-prioridades" className="mt-1 text-xl font-bold">
                Vence hoje e vencidas
              </h2>
              <p className="mt-2 text-sm text-carvao">O saldo que ainda precisa ser recebido ou pago.</p>
            </div>
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <ContasPrioritarias parcelas={receber} tipo="receber" hoje={hoje} />
              <ContasPrioritarias parcelas={pagar} tipo="pagar" hoje={hoje} />
            </div>
          </section>
        </div>
        <ResultadoDoMes resultado={painel.resultadoMes} hoje={hoje} />
      </div>
    </>
  )
}
