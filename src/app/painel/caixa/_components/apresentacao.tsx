import type { ReactNode } from 'react'
import { ROTULO_FORMA, type LinhaConferencia } from '@/lib/dominio/caixa'
import { formatarBRL, interpretarBRL } from '@/lib/dominio/moeda'
import type { EstadoCaixa } from '@/lib/supabase/tipos'

const FOCO = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta'
export const BOTAO_CAIXA = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-areia bg-papel px-4 py-3 text-sm font-bold text-tinta hover:bg-papel-2 disabled:cursor-not-allowed disabled:opacity-60 ${FOCO}`
export const PRIMARIO_CAIXA = `inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tangerina px-5 py-3 text-sm font-bold text-tinta hover:bg-tangerina-clara disabled:cursor-not-allowed disabled:opacity-60 ${FOCO}`
export const CAMPO_CAIXA =
  'min-h-12 w-full min-w-0 rounded-xl border border-areia bg-branco px-3.5 py-3 text-base text-tinta placeholder:text-carvao/70 focus:border-tinta focus:outline-2 focus:outline-offset-2 focus:outline-tinta disabled:opacity-60 aria-[invalid=true]:border-vermelho'

export function dataCaixa(valor: string, somenteHora = false) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Porto_Velho',
    ...(somenteHora ? {} : ({ day: '2-digit', month: '2-digit', year: 'numeric' } as const)),
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(valor))
}

/** Um campo vazio nunca equivale a uma contagem de zero. */
export function lerValorCaixa(texto: string): number | null {
  const limpo = texto.trim()
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(limpo) && !/^\d+(?:\.\d{1,2})?$/.test(limpo))
    return null
  const normalizado = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(limpo) ? limpo.replace(/\./g, '') : limpo
  const valor = interpretarBRL(normalizado)
  return valor !== null && valor <= 99_999_999.99 ? valor : null
}

export function EstadoDoCaixa({ estado }: { estado: EstadoCaixa }) {
  const estilo =
    estado === 'aberta'
      ? 'bg-verde-clara text-[#176b3a]'
      : estado === 'conferida'
        ? 'bg-papel-2 text-carvao'
        : 'bg-ambar-clara text-[#805000]'
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${estilo}`}>
      {estado === 'aberta' ? 'Aberto' : estado === 'conferida' ? 'Conferido' : 'A conferir'}
    </span>
  )
}

export function DiferencaCaixa({ valor, grande = false }: { valor: number; grande?: boolean }) {
  const estilo = valor < 0 ? 'text-[#a82a1a]' : valor > 0 ? 'text-[#805000]' : 'text-[#176b3a]'
  return (
    <span className={`font-bold tabular-nums ${estilo} ${grande ? 'text-2xl sm:text-3xl' : 'text-sm'}`}>
      {valor < 0 ? 'Falta ' : valor > 0 ? 'Sobra ' : ''}
      {formatarBRL(Math.abs(valor))}
      {valor === 0 && <span className="ml-2 text-xs font-semibold">Sem diferença</span>}
    </span>
  )
}

export function AvisoCaixa({ children, erro = false }: { children: ReactNode; erro?: boolean }) {
  return (
    <div
      role={erro ? 'alert' : 'status'}
      className={`rounded-xl border p-4 text-sm leading-relaxed ${erro ? 'border-vermelho/30 bg-vermelho-clara text-[#a82a1a]' : 'border-areia bg-papel-2 text-carvao'}`}
    >
      {children}
    </div>
  )
}

export function TabelaConferencia({ linhas }: { linhas: LinhaConferencia[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-areia bg-branco">
      <div
        className="hidden grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] gap-3 border-b border-areia bg-papel-2 px-5 py-3 text-xs font-bold text-carvao uppercase md:grid"
        aria-hidden="true"
      >
        <span>Forma</span>
        <span className="text-right">Esperado</span>
        <span className="text-right">Contado</span>
        <span className="text-right">Diferença</span>
      </div>
      {linhas.length ? (
        <ul className="divide-y divide-areia">
          {linhas.map((linha) => (
            <li
              key={linha.forma}
              className="grid gap-3 px-4 py-4 sm:px-5 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:items-center"
            >
              <p className="text-sm font-bold">{ROTULO_FORMA[linha.forma]}</p>
              <p className="flex justify-between gap-3 text-sm tabular-nums md:block md:text-right">
                <span className="text-carvao md:sr-only">Esperado </span>
                {formatarBRL(linha.esperado)}
              </p>
              <p className="flex justify-between gap-3 text-sm font-bold tabular-nums md:block md:text-right">
                <span className="font-normal text-carvao md:sr-only">Contado </span>
                {formatarBRL(linha.informado)}
              </p>
              <p className="flex justify-between gap-3 md:block md:text-right">
                <span className="text-sm text-carvao md:sr-only">Diferença </span>
                <DiferencaCaixa valor={linha.diferenca} />
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-6 text-sm text-carvao">Nenhum valor a conferir neste caixa.</p>
      )}
    </div>
  )
}
