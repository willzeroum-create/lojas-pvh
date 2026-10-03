import type { SemanaFluxo } from '@/lib/dominio/financeiro'
import { formatarBRL } from '@/lib/dominio/moeda'
import { formatarDataFinanceira } from './apresentacao'

function Grafico({ semanas, compacto }: { semanas: SemanaFluxo[]; compacto: boolean }) {
  const largura = compacto ? 350 : 760
  const esquerda = compacto ? 52 : 68
  const direita = largura - 12
  const topo = 18
  const base = 206
  const valores = semanas.flatMap((s) => [s.entradas, s.saidas, s.saldoFinal])
  const minimo = Math.min(0, ...valores)
  const maximo = Math.max(1, ...valores)
  const amplitude = maximo - minimo || 1
  const y = (valor: number) => base - ((valor - minimo) / amplitude) * (base - topo)
  const passo = (direita - esquerda) / Math.max(1, semanas.length)
  const x = (indice: number) => esquerda + passo * (indice + 0.5)
  const barra = compacto ? 9 : 17
  // Preserva o zero e afasta os rótulos quando o menor saldo fica perto dele.
  const marcas = [0, minimo, maximo, (minimo + maximo) / 2].reduce<number[]>((aceitas, marca) => {
    if (aceitas.every((anterior) => Math.abs(y(anterior) - y(marca)) >= 22)) aceitas.push(marca)
    return aceitas
  }, [])
  const abreviar = (valor: number) =>
    new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(valor)
  const pontos = semanas.map((s, i) => `${x(i)},${y(s.saldoFinal)}`).join(' ')

  return (
    <svg
      viewBox={`0 0 ${largura} 244`}
      className={`w-full ${compacto ? 'financeiro-grafico-compacto' : 'financeiro-grafico-amplo'}`}
      role="img"
      aria-label="Fluxo previsto: barras verdes de entradas, barras cinza de saídas e linha do saldo final. Valores detalhados logo abaixo."
    >
      {marcas.map((marca) => (
        <g key={marca}>
          <line
            x1={esquerda}
            x2={direita}
            y1={y(marca)}
            y2={y(marca)}
            stroke={marca === 0 ? '#7a7266' : '#dfd5c2'}
            strokeDasharray={marca === 0 ? undefined : '3 5'}
          />
          <text
            x={esquerda - 8}
            y={y(marca) + 4}
            textAnchor="end"
            fontSize={compacto ? 14 : 12}
            fill="#3d3730"
          >
            {abreviar(marca)}
          </text>
        </g>
      ))}
      {semanas.map((semana, indice) => (
        <g key={semana.inicio}>
          <rect
            x={x(indice) - barra - 2}
            y={y(semana.entradas)}
            width={barra}
            height={Math.max(0, y(0) - y(semana.entradas))}
            rx="2"
            fill="#1f8a4c"
          />
          <rect
            x={x(indice) + 2}
            y={y(semana.saidas)}
            width={barra}
            height={Math.max(0, y(0) - y(semana.saidas))}
            rx="2"
            fill="#7a7266"
          />
          <text x={x(indice)} y="230" textAnchor="middle" fontSize={compacto ? 14 : 12} fill="#3d3730">
            {compacto ? indice + 1 : formatarDataFinanceira(semana.inicio).slice(0, 5)}
          </text>
        </g>
      ))}
      <polyline points={pontos} stroke="#171410" fill="none" strokeWidth="2.5" strokeLinejoin="round" />
      {semanas.map((semana, indice) => (
        <circle
          key={semana.inicio}
          cx={x(indice)}
          cy={y(semana.saldoFinal)}
          r="4"
          fill={semana.saldoFinal < 0 ? '#c8321f' : '#171410'}
          stroke="#faf6ee"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

export function FluxoCaixa({ semanas }: { semanas: SemanaFluxo[] }) {
  const negativa = semanas.find((s) => s.saldoFinal < 0)
  const menorSaldo = Math.min(...semanas.map((s) => s.saldoFinal))
  return (
    <section
      aria-labelledby="titulo-fluxo"
      className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-areia p-5 sm:px-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-carvao uppercase">O que vem pela frente</p>
          <h2 id="titulo-fluxo" className="mt-1 text-xl font-bold">
            Caixa nas próximas 8 semanas
          </h2>
        </div>
        <span className="rounded-md bg-papel-2 px-3 py-1 text-xs font-semibold text-carvao">
          Previsão por vencimento
        </span>
      </div>
      <div className="space-y-5 p-4 sm:p-6">
        {negativa && (
          <p
            role="status"
            className="rounded-lg border border-vermelho/30 bg-vermelho-clara p-4 text-sm leading-relaxed text-[#a82a1a]"
          >
            <strong className="block">Atenção: o caixa previsto fica negativo.</strong> A partir da semana de{' '}
            {formatarDataFinanceira(negativa.inicio)}. O menor saldo previsto é {formatarBRL(menorSaldo)}.
            Revise os recebimentos e os vencimentos a pagar.
          </p>
        )}
        <ul
          aria-label="Legenda do gráfico"
          className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-carvao"
        >
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-verde" />
            Entradas
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-3 w-3 rounded-sm bg-cinza" />
            Saídas
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-0.5 w-5 bg-tinta" />
            Saldo final
          </li>
        </ul>
        <figure className="financeiro-grafico">
          <p className="mb-2 text-xs text-carvao">Valores em R$ · 8 semanas, com a primeira começando hoje</p>
          <Grafico semanas={semanas} compacto />
          <Grafico semanas={semanas} compacto={false} />
          <figcaption className="mt-2 text-xs leading-relaxed text-carvao">
            Considera as contas em aberto. Os valores já vencidos entram na primeira semana; a previsão
            depende de receber e pagar essas contas.
          </figcaption>
        </figure>
        <details className="border-t border-areia">
          <summary className="flex min-h-12 cursor-pointer items-center py-3 text-sm font-bold underline decoration-areia underline-offset-4">
            Consultar valores por semana
          </summary>
          <ol className="grid gap-3 pt-2 sm:grid-cols-2 xl:grid-cols-4">
            {semanas.map((semana, indice) => (
              <li key={semana.inicio} className="min-w-0 rounded-lg border border-areia bg-papel p-3">
                <h3 className="text-sm font-bold">Semana {indice + 1}</h3>
                <p className="mt-1 text-xs text-carvao">
                  {formatarDataFinanceira(semana.inicio).slice(0, 5)} a {formatarDataFinanceira(semana.fim)}
                </p>
                <dl className="mt-3 space-y-2 text-xs tabular-nums">
                  <div className="flex flex-wrap justify-between gap-1">
                    <dt>Entradas</dt>
                    <dd className="font-semibold text-[#176b3a]">{formatarBRL(semana.entradas)}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1">
                    <dt>Saídas</dt>
                    <dd>{formatarBRL(semana.saidas)}</dd>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1 border-t border-areia pt-2 font-bold">
                    <dt>Saldo final</dt>
                    <dd className={semana.saldoFinal < 0 ? 'text-vermelho' : 'text-tinta'}>
                      {formatarBRL(semana.saldoFinal)}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </details>
      </div>
    </section>
  )
}
