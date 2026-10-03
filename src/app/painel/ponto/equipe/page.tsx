import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Clock3 } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { resumoPontoDoMes } from '@/lib/dados/ponto'
import { formatarMinutos } from '@/lib/dominio/ponto'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { BOTAO_PONTO, mesValido, NavegacaoMes, nomeMes, saldoPonto } from '../_components/apresentacao'

export const metadata: Metadata = { title: 'Ponto da equipe' }

export default async function PaginaEquipePonto({ searchParams }: { searchParams: Promise<{ mes?: string | string[] }> }) {
  const ctx = await exigirModulo('ponto')
  if (!donoOuGerente(ctx.equipe)) notFound()
  const mes = mesValido((await searchParams).mes)
  const pessoas = await resumoPontoDoMes(ctx.supabase, ctx.tenantId, mes)
  const pendencias = pessoas.reduce((total, pessoa) => total + pessoa.totais.inconsistencias, 0)
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-5"><div><p className="text-sm font-bold tracking-widest text-carvao uppercase">Ponto / Gestão</p><h1 className="mt-2 text-3xl font-bold">A jornada da equipe.</h1><p className="mt-2 text-base text-carvao capitalize">{nomeMes(mes)}</p></div><Link href="/painel/ponto" className={BOTAO_PONTO}><ArrowLeft aria-hidden className="size-5" /> Voltar ao relógio</Link></header>
      <NavegacaoMes mes={mes} caminho="/painel/ponto/equipe" />
      <section aria-label="Resumo da equipe" className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-tinta p-5 text-papel"><p className="text-base">Pessoas que batem ponto</p><p className="mt-3 text-4xl font-bold tabular-nums">{pessoas.length}</p></div><div className="rounded-xl border border-areia bg-branco p-5"><p className="text-base text-carvao">Horas trabalhadas</p><p className="mt-3 text-4xl font-bold tabular-nums">{formatarMinutos(pessoas.reduce((total, pessoa) => total + pessoa.totais.trabalhadoMin, 0))}</p></div><div className={`rounded-xl border p-5 ${pendencias ? 'border-ambar/40 bg-ambar-clara text-[#805000]' : 'border-areia bg-branco'}`}><p className="text-base">Marcações para conferir</p><p className="mt-3 text-4xl font-bold tabular-nums">{pendencias}</p></div></section>
      {pessoas.length ? <section aria-label="Ponto por pessoa" className="grid gap-4 xl:grid-cols-2">{pessoas.map(({ membro, totais, emAndamento }) => <Link key={membro.id} href={`/painel/ponto/${membro.id}?mes=${mes}`} className="rounded-xl border border-areia bg-branco p-5 hover:border-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="text-2xl font-bold break-words">{membro.nome}</h2><p className="mt-2 text-sm text-carvao">Jornada de {formatarMinutos(membro.jornadaMinutos)} por dia · {totais.diasTrabalhados} dias trabalhados</p></div><ArrowUpRight aria-hidden className="size-6 shrink-0" /></div><dl className="mt-5 grid grid-cols-2 gap-4"><div><dt className="text-sm text-carvao">Trabalhado</dt><dd className="mt-1 text-3xl font-bold tabular-nums">{formatarMinutos(totais.trabalhadoMin)}</dd></div><div><dt className="text-sm text-carvao">Saldo</dt><dd className={`mt-1 text-3xl font-bold tabular-nums ${totais.saldoMin < 0 ? 'text-vermelho' : 'text-[#176b3a]'}`}>{saldoPonto(totais.saldoMin)}</dd></div><div><dt className="text-sm text-carvao">Noturno</dt><dd className="mt-1 text-lg font-bold">{formatarMinutos(totais.noturnoMin)}</dd></div><div><dt className="text-sm text-carvao">Noturno convertido</dt><dd className="mt-1 text-lg font-bold">{formatarMinutos(totais.noturnoFictoMin)}</dd></div></dl><div className="mt-4 flex flex-wrap gap-2">{emAndamento && <span className="inline-flex items-center gap-2 rounded-md bg-verde-clara px-3 py-2 text-sm font-semibold text-[#176b3a]"><Clock3 aria-hidden className="size-4" /> Jornada em andamento</span>}{totais.inconsistencias > 0 && <span className="rounded-md bg-ambar-clara px-3 py-2 text-sm font-bold text-[#805000]">{totais.inconsistencias} {totais.inconsistencias === 1 ? 'pendência para conferir' : 'pendências para conferir'}</span>}</div><p className="mt-4 flex min-h-12 items-center border-t border-areia pt-3 text-base font-bold">Abrir espelho e ajustar jornada</p></Link>)}</section> : <section className="rounded-xl border border-dashed border-areia p-6"><h2 className="text-xl font-bold">Ninguém com ponto habilitado.</h2><p className="mt-2 text-base text-carvao">Ative “Bate ponto” no cadastro da equipe para começar.</p><Link href="/painel/equipe" className={`${BOTAO_PONTO} mt-4`}>Abrir equipe</Link></section>}
      <p className="text-sm text-carvao">Os totais incluem jornadas em andamento. Abra o espelho para conferir as marcações.</p>
    </div>
  )
}
