import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatarBRL } from '@/lib/dominio/moeda'
import type { Fatia, LinhaAbc } from '@/lib/dominio/relatorios'

export const FOCO_RELATORIO =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta'

export const LINK_RELATORIO = `inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold hover:bg-papel-2 ${FOCO_RELATORIO}`

export function dataRelatorio(dia: string, ano = false): string {
  return new Date(`${dia}T12:00:00Z`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    ...(ano ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  })
}

export function numeroRelatorio(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 3 })
}

export function percentualRelatorio(valor: number): string {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}

export function Variacao({
  atual,
  anterior,
  destaque = false,
}: {
  atual: number
  anterior: number
  destaque?: boolean
}) {
  if (anterior === 0 && atual > 0) {
    return (
      <p className={`mt-4 text-sm ${destaque ? 'text-areia' : 'text-carvao'}`}>
        Sem base no período anterior
      </p>
    )
  }
  const diferenca = anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0
  const Icone = diferenca > 0 ? ArrowUpRight : diferenca < 0 ? ArrowDownRight : Minus
  const cor = destaque
    ? diferenca < 0
      ? 'text-[#ffb4a7]'
      : diferenca > 0
        ? 'text-[#a8e3ba]'
        : 'text-areia'
    : diferenca < 0
      ? 'text-vermelho'
      : diferenca > 0
        ? 'text-[#176b3a]'
        : 'text-carvao'

  return (
    <p className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${cor}`}>
      <span className="inline-flex items-center gap-1 font-bold tabular-nums">
        <Icone aria-hidden="true" className="size-4" />
        {diferenca === 0
          ? 'Sem mudança'
          : `${diferenca > 0 ? '+' : '−'}${percentualRelatorio(Math.abs(diferenca))}`}
      </span>
      {diferenca !== 0 && <span>vs. período anterior</span>}
    </p>
  )
}

export function Distribuicao({ titulo, id, fatias }: { titulo: string; id: string; fatias: Fatia[] }) {
  return (
    <section aria-labelledby={id} className="min-w-0 rounded-xl border border-areia bg-branco p-5 sm:p-6">
      <h2 id={id} className="text-xl font-bold">
        {titulo}
      </h2>
      <p className="mt-1 text-sm text-carvao">Participação no valor vendido</p>
      {fatias.length === 0 ? (
        <p className="mt-6 text-sm text-carvao">Nenhum valor neste período.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {fatias.map((fatia, indice) => (
            <li key={fatia.chave}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-bold break-words">{fatia.rotulo}</span>
                <span className="text-sm font-bold tabular-nums">
                  {percentualRelatorio(fatia.participacao)}
                </span>
              </div>
              <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-papel-2">
                <div
                  className={`h-full rounded-full ${indice === 0 ? 'bg-tangerina' : 'bg-carvao'}`}
                  style={{ width: `${Math.max(0, Math.min(100, fatia.participacao))}%` }}
                />
              </div>
              <p className="mt-2 text-base font-semibold tabular-nums">{formatarBRL(fatia.valor)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function CurvaAbc({ produtos }: { produtos: LinhaAbc[] }) {
  return (
    <section
      aria-labelledby="titulo-abc"
      className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
    >
      <header className="border-b border-areia p-5 sm:p-6">
        <p className="text-xs font-bold tracking-widest text-carvao uppercase">
          Produtos que sustentam as vendas
        </p>
        <h2 id="titulo-abc" className="mt-2 text-2xl font-bold">
          Curva ABC
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-carvao">
          A = produtos que fazem 80% do faturamento. B completa até 95%; C é o restante.
        </p>
      </header>
      {produtos.length === 0 ? (
        <p className="p-6 text-sm text-carvao">Nenhum produto vendido neste período.</p>
      ) : (
        <>
          <p className="px-5 pt-4 text-sm text-carvao lg:hidden">
            Deslize a tabela para ver todos os valores.
          </p>
          <div
            role="region"
            aria-label="Produtos da curva ABC, tabela com rolagem horizontal"
            tabIndex={0}
            className={`overflow-x-auto ${FOCO_RELATORIO}`}
          >
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Produtos por faturamento, do maior para o menor. Classe, quantidade, valor, participação e
                participação acumulada.
              </caption>
              <thead className="border-b border-areia bg-papel-2/50 text-carvao">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">
                    Produto
                  </th>
                  <th scope="col" className="px-3 py-4 text-center font-semibold">
                    Classe
                  </th>
                  <th scope="col" className="px-3 py-4 text-right font-semibold">
                    Qtd.
                  </th>
                  <th scope="col" className="px-3 py-4 text-right font-semibold">
                    Faturamento
                  </th>
                  <th scope="col" className="px-3 py-4 text-right font-semibold">
                    Participação
                  </th>
                  <th scope="col" className="px-5 py-4 text-right font-semibold">
                    Acumulado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-areia">
                {produtos.map((produto) => (
                  <tr
                    key={produto.chave}
                    className={produto.classe === 'A' ? 'bg-tangerina-clara/40' : undefined}
                  >
                    <th scope="row" className="max-w-72 px-5 py-5 font-bold break-words">
                      {produto.nome}
                    </th>
                    <td className="px-3 py-5 text-center">
                      <span
                        className={`inline-flex size-8 items-center justify-center rounded-md font-bold ${produto.classe === 'A' ? 'bg-tinta text-papel' : 'bg-papel-2 text-carvao'}`}
                      >
                        {produto.classe}
                      </span>
                    </td>
                    <td className="px-3 py-5 text-right tabular-nums">
                      {numeroRelatorio(produto.quantidade)}
                    </td>
                    <td className="px-3 py-5 text-right font-bold whitespace-nowrap tabular-nums">
                      {formatarBRL(produto.total)}
                    </td>
                    <td className="px-3 py-5 text-right tabular-nums">
                      {percentualRelatorio(produto.participacao)}
                    </td>
                    <td className="px-5 py-5 text-right tabular-nums">
                      {percentualRelatorio(produto.acumulado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
