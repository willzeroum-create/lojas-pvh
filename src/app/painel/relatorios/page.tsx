import { ArrowDownToLine, CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Botao } from '@/components/ui/botao'
import { exigirModulo } from '@/lib/auth/guardas'
import { relatorioDoPeriodo } from '@/lib/dados/relatorios'
import { formatarBRL } from '@/lib/dominio/moeda'
import { diaLocal } from '@/lib/dominio/ponto'
import { lerIntervalo } from '@/lib/dominio/relatorios'
import {
  CurvaAbc,
  dataRelatorio,
  Distribuicao,
  FOCO_RELATORIO,
  LINK_RELATORIO,
  numeroRelatorio,
  Variacao,
} from './_components/apresentacao'
import { HorariosDePico, VendasPorDia } from './_components/graficos'

export const metadata: Metadata = { title: 'Relatórios de vendas' }

export default async function PaginaRelatorios({
  searchParams,
}: {
  searchParams: Promise<{ de?: string | string[]; ate?: string | string[] }>
}) {
  const { supabase, tenantId } = await exigirModulo('relatorios')
  const sp = await searchParams
  const { de, ate } = lerIntervalo(sp.de, sp.ate, diaLocal(new Date()))
  const relatorio = await relatorioDoPeriodo(supabase, tenantId, de, ate)
  const { vendas, anterior, produtos } = relatorio
  const hoje = diaLocal(new Date())
  const inicioMes = `${hoje.slice(0, 7)}-01`
  const fimMesPassado = new Date(Date.parse(inicioMes) - 86_400_000).toISOString().slice(0, 10)
  const diasAtras = (quantidade: number) =>
    new Date(Date.parse(hoje) - quantidade * 86_400_000).toISOString().slice(0, 10)
  const atalhos = [
    { rotulo: 'Hoje', de: hoje, ate: hoje },
    { rotulo: '7 dias', de: diasAtras(6), ate: hoje },
    { rotulo: '30 dias', de: diasAtras(29), ate: hoje },
    { rotulo: 'Este mês', de: inicioMes, ate: hoje },
    { rotulo: 'Mês passado', de: `${fimMesPassado.slice(0, 7)}-01`, ate: fimMesPassado },
  ]
  const intervalo = new URLSearchParams({ de, ate }).toString()

  return (
    <div className="min-w-0 space-y-6 [&_h1]:font-sans [&_h2]:font-sans [&_h3]:font-sans">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seu negócio / Relatórios
          </p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
            Como estão as vendas?
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-carvao">
            O que vende mais, os melhores horários e o resultado do período.
          </p>
        </div>
        <a
          href={`/painel/relatorios/exportar?tipo=vendas&${intervalo}`}
          className={`${LINK_RELATORIO} w-full sm:w-auto`}
        >
          <ArrowDownToLine aria-hidden="true" className="size-4 shrink-0" />
          Exportar vendas (Excel)
        </a>
      </header>

      <section
        aria-labelledby="titulo-periodo"
        className="rounded-xl border border-areia bg-papel-2/60 p-4 sm:p-5"
      >
        <h2 id="titulo-periodo" className="flex items-center gap-2 text-sm font-bold">
          <CalendarDays aria-hidden="true" className="size-4" />
          Escolha o período
        </h2>
        <nav aria-label="Atalhos de período" className="mt-4 flex flex-wrap gap-2">
          {atalhos.map((atalho) => {
            const selecionado = atalho.de === de && atalho.ate === ate
            return (
              <Link
                key={atalho.rotulo}
                href={`/painel/relatorios?${new URLSearchParams({ de: atalho.de, ate: atalho.ate })}`}
                scroll={false}
                prefetch={false}
                aria-current={selecionado ? 'page' : undefined}
                className={`inline-flex min-h-12 items-center justify-center rounded-lg border px-4 text-sm font-bold ${FOCO_RELATORIO} ${selecionado ? 'border-tinta bg-tinta text-papel' : 'border-areia bg-branco hover:bg-papel'}`}
              >
                {atalho.rotulo}
              </Link>
            )
          })}
        </nav>
        <form
          action="/painel/relatorios"
          method="get"
          key={intervalo}
          className="mt-5 grid items-end gap-3 min-[480px]:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]"
        >
          <label className="min-w-0 space-y-2 text-sm font-semibold">
            <span className="block">De</span>
            <input
              type="date"
              name="de"
              defaultValue={de}
              max={hoje}
              required
              className={`block min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 text-base ${FOCO_RELATORIO}`}
            />
          </label>
          <label className="min-w-0 space-y-2 text-sm font-semibold">
            <span className="block">Até</span>
            <input
              type="date"
              name="ate"
              defaultValue={ate}
              max={hoje}
              required
              className={`block min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 text-base ${FOCO_RELATORIO}`}
            />
          </label>
          <Botao type="submit" className="min-[480px]:col-span-2 xl:col-span-1">
            Ver relatório
          </Botao>
        </form>
        <p className="mt-3 text-sm text-carvao">Até 92 dias por consulta. Datas no horário de Porto Velho.</p>
      </section>

      <section aria-labelledby="titulo-resumo" className="space-y-4">
        <div>
          <h2 id="titulo-resumo" className="text-lg font-bold">
            {dataRelatorio(de, true)} a {dataRelatorio(ate, true)}
          </h2>
          <p className="mt-1 text-sm text-carvao">
            Comparado a {dataRelatorio(anterior.de, true)}–{dataRelatorio(anterior.ate, true)} · somente
            vendas concluídas
          </p>
        </div>
        <div className="grid min-w-0 gap-3 lg:grid-cols-3">
          <div className="min-w-0 rounded-xl bg-tinta p-5 text-papel sm:p-6">
            <p className="text-sm font-semibold text-areia">Faturamento</p>
            <p className="mt-3 text-[clamp(1.8rem,4vw,2.5rem)] leading-tight font-bold tracking-tight break-words tabular-nums">
              {formatarBRL(vendas.faturamento)}
            </p>
            <Variacao atual={vendas.faturamento} anterior={anterior.faturamento} destaque />
          </div>
          <div className="min-w-0 rounded-xl border border-areia bg-branco p-5 sm:p-6">
            <p className="text-sm font-semibold text-carvao">Vendas concluídas</p>
            <p className="mt-3 text-4xl leading-tight font-bold tracking-tight break-words tabular-nums">
              {numeroRelatorio(vendas.vendas)}
            </p>
            <Variacao atual={vendas.vendas} anterior={anterior.vendas} />
          </div>
          <div className="min-w-0 rounded-xl border border-areia bg-branco p-5 sm:p-6">
            <p className="text-sm font-semibold text-carvao">Ticket médio</p>
            <p className="mt-3 text-[clamp(1.8rem,4vw,2.5rem)] leading-tight font-bold tracking-tight break-words tabular-nums">
              {formatarBRL(vendas.ticketMedio)}
            </p>
            <Variacao atual={vendas.ticketMedio} anterior={anterior.ticketMedio} />
          </div>
        </div>
        <dl className="flex flex-wrap gap-x-8 gap-y-4 rounded-xl border border-areia px-5 py-4 text-sm">
          <div>
            <dt className="text-carvao">Descontos concedidos</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums">{formatarBRL(vendas.descontos)}</dd>
          </div>
          <div>
            <dt className="text-carvao">Taxas de entrega</dt>
            <dd className="mt-1 text-lg font-bold tabular-nums">{formatarBRL(vendas.taxasEntrega)}</dd>
          </div>
        </dl>
      </section>

      {vendas.vendas === 0 ? (
        <section className="rounded-xl border border-areia bg-branco px-5 py-10 sm:px-8">
          <p className="text-xs font-bold tracking-widest text-carvao uppercase">Nenhuma venda concluída</p>
          <h2 className="mt-3 text-2xl font-bold">Este período ainda está em branco.</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-carvao">
            Escolha outras datas acima para consultar as vendas. Pedidos em andamento e cancelados não entram
            no relatório.
          </p>
        </section>
      ) : (
        <>
          <VendasPorDia dias={vendas.porDia} de={de} ate={ate} />
          <HorariosDePico horas={vendas.porHora} />
          <div className="grid min-w-0 items-start gap-4 xl:grid-cols-2">
            <Distribuicao id="titulo-canais" titulo="Por canal de venda" fatias={vendas.porCanal} />
            <Distribuicao id="titulo-formas" titulo="Por forma de pagamento" fatias={vendas.porForma} />
          </div>
          <CurvaAbc produtos={produtos} />
        </>
      )}

      <footer className="flex flex-col gap-4 rounded-xl border border-areia bg-papel-2/60 p-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold">Leve os números com você.</p>
          <p className="mt-1 text-sm text-carvao">Exporte os dados do período selecionado.</p>
        </div>
        <a href={`/painel/relatorios/exportar?tipo=produtos&${intervalo}`} className={LINK_RELATORIO}>
          <ArrowDownToLine aria-hidden="true" className="size-4 shrink-0" />
          Exportar produtos
        </a>
      </footer>
    </div>
  )
}
