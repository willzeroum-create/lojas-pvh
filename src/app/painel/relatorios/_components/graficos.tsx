import { formatarBRL } from '@/lib/dominio/moeda'
import type { RelatorioVendas } from '@/lib/dominio/relatorios'
import { dataRelatorio, FOCO_RELATORIO, numeroRelatorio } from './apresentacao'

export function VendasPorDia({
  dias,
  de,
  ate,
}: {
  dias: RelatorioVendas['porDia']
  de: string
  ate: string
}) {
  const mapa = new Map(dias.map((dia) => [dia.dia, dia]))
  const quantidadeDias = Math.round((Date.parse(ate) - Date.parse(de)) / 86_400_000) + 1
  // Exibe também os dias sem venda para manter a escala do período.
  const linhas = Array.from({ length: quantidadeDias }, (_, indice) => {
    const dia = new Date(Date.parse(de) + indice * 86_400_000).toISOString().slice(0, 10)
    return mapa.get(dia) ?? { dia, valor: 0, vendas: 0 }
  })
  const maior = Math.max(1, ...linhas.map((dia) => dia.valor))
  const melhor = dias.reduce<RelatorioVendas['porDia'][number] | null>(
    (atual, dia) => (!atual || dia.valor > atual.valor ? dia : atual),
    null,
  )

  return (
    <section
      aria-labelledby="titulo-vendas-dia"
      className="min-w-0 rounded-xl border border-areia bg-branco p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="titulo-vendas-dia" className="text-xl font-bold">
            Faturamento por dia
          </h2>
          <p className="mt-1 text-sm text-carvao">Dias sem venda também aparecem.</p>
        </div>
        {melhor && (
          <p className="rounded-lg bg-papel-2 px-3 py-2 text-sm leading-relaxed">
            Melhor dia: <strong>{dataRelatorio(melhor.dia)}</strong>
            <br />
            <strong className="tabular-nums">{formatarBRL(melhor.valor)}</strong>
          </p>
        )}
      </div>
      <p className="mt-5 text-xs font-semibold text-carvao">
        Escala até {formatarBRL(maior)} · deslize para ver o período
      </p>
      <div
        role="region"
        aria-label="Gráfico de faturamento por dia, com rolagem horizontal"
        tabIndex={0}
        className={`mt-3 overflow-x-auto rounded-md pb-2 ${FOCO_RELATORIO}`}
      >
        <div
          aria-hidden="true"
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${linhas.length}, minmax(44px, 1fr))` }}
        >
          {linhas.map((dia) => (
            <div
              key={dia.dia}
              title={`${dataRelatorio(dia.dia, true)}: ${formatarBRL(dia.valor)}, ${numeroRelatorio(dia.vendas)} vendas`}
            >
              <div className="flex h-40 items-end justify-center border-b border-areia bg-papel/70 px-2">
                <div
                  className={`w-full max-w-12 rounded-t-sm ${dia.dia === melhor?.dia ? 'bg-tangerina' : dia.valor > 0 ? 'bg-carvao' : 'bg-areia'}`}
                  style={{ height: dia.valor > 0 ? `${Math.max(1, (dia.valor / maior) * 100)}%` : '2px' }}
                />
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-carvao tabular-nums">
                {dataRelatorio(dia.dia)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <details className="mt-4 border-t border-areia pt-2">
        <summary className={`min-h-12 cursor-pointer rounded-md py-3 text-sm font-bold ${FOCO_RELATORIO}`}>
          Ver valores de cada dia
        </summary>
        <ul className="divide-y divide-areia">
          {linhas.map((dia) => (
            <li key={dia.dia} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>
                <time dateTime={dia.dia} className="font-bold">
                  {dataRelatorio(dia.dia, true)}
                </time>
                <span className="mt-1 block text-carvao">
                  {numeroRelatorio(dia.vendas)} {dia.vendas === 1 ? 'venda' : 'vendas'}
                </span>
              </span>
              <strong className="tabular-nums">{formatarBRL(dia.valor)}</strong>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}

export function HorariosDePico({ horas }: { horas: RelatorioVendas['porHora'] }) {
  const maior = Math.max(1, ...horas.map((hora) => hora.vendas))
  const destaques = [...horas]
    .filter((hora) => hora.vendas > 0)
    .sort((a, b) => b.vendas - a.vendas || a.hora - b.hora)
    .slice(0, 3)
  const horaFormatada = (hora: number) => `${String(hora).padStart(2, '0')}h`

  return (
    <section
      aria-labelledby="titulo-pico"
      className="min-w-0 rounded-xl border border-areia bg-branco p-5 sm:p-6"
    >
      <h2 id="titulo-pico" className="text-xl font-bold">
        Horários de pico
      </h2>
      <p className="mt-1 text-sm text-carvao">Quantidade de vendas · horário de Porto Velho</p>
      <ol className="mt-5 grid gap-2 sm:grid-cols-3">
        {destaques.map((hora, indice) => (
          <li
            key={hora.hora}
            className={`flex flex-wrap items-baseline justify-between gap-2 rounded-lg px-4 py-3 ${indice === 0 ? 'bg-tinta text-papel' : 'bg-papel-2'}`}
          >
            <span className="text-xl font-bold tabular-nums">
              {horaFormatada(hora.hora)}–{horaFormatada(hora.hora + 1)}
            </span>
            <span className={`text-sm ${indice === 0 ? 'text-areia' : 'text-carvao'}`}>
              {numeroRelatorio(hora.vendas)} {hora.vendas === 1 ? 'venda' : 'vendas'}
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs font-semibold text-carvao">
        Escala até {numeroRelatorio(maior)} vendas · deslize para ver as 24 horas
      </p>
      <div
        role="region"
        aria-label="Gráfico das 24 horas, com rolagem horizontal"
        tabIndex={0}
        className={`mt-3 overflow-x-auto rounded-md pb-2 ${FOCO_RELATORIO}`}
      >
        <div
          aria-hidden="true"
          className="grid gap-2"
          style={{ gridTemplateColumns: 'repeat(24, minmax(32px, 1fr))' }}
        >
          {horas.map((hora) => (
            <div
              key={hora.hora}
              title={`${horaFormatada(hora.hora)}: ${numeroRelatorio(hora.vendas)} vendas, ${formatarBRL(hora.valor)}`}
            >
              <div className="flex h-28 items-end justify-center border-b border-areia bg-papel/70 px-1">
                <div
                  className={`w-full max-w-8 rounded-t-sm ${hora.vendas === maior ? 'bg-tangerina' : hora.vendas > 0 ? 'bg-carvao' : 'bg-areia'}`}
                  style={{ height: hora.vendas > 0 ? `${Math.max(1, (hora.vendas / maior) * 100)}%` : '2px' }}
                />
              </div>
              <p className="mt-3 text-center text-xs font-semibold text-carvao tabular-nums">
                {horaFormatada(hora.hora)}
              </p>
            </div>
          ))}
        </div>
      </div>
      <details className="mt-4 border-t border-areia pt-2">
        <summary className={`min-h-12 cursor-pointer rounded-md py-3 text-sm font-bold ${FOCO_RELATORIO}`}>
          Ver vendas e valores por hora
        </summary>
        <ul className="grid divide-y divide-areia">
          {horas.map((hora) => (
            <li key={hora.hora} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
              <span>
                <strong>
                  {horaFormatada(hora.hora)}–{horaFormatada(hora.hora + 1)}
                </strong>
                <span className="mt-1 block text-carvao">
                  {numeroRelatorio(hora.vendas)} {hora.vendas === 1 ? 'venda' : 'vendas'}
                </span>
              </span>
              <strong className="tabular-nums">{formatarBRL(hora.valor)}</strong>
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
