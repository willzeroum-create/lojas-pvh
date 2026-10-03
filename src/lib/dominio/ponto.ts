/**
 * Ponto eletrónico: das batidas às jornadas, horas trabalhadas, intervalo,
 * adicional noturno e saldo do dia. Lógica pura, sem base de dados.
 *
 * Referências (CLT): art. 58 §1 (tolerância de 5 min por marcação, até 10 por
 * dia), art. 59 (até 2 h extras por dia), art. 71 (intervalo de 1 h acima de
 * 6 h de trabalho, 15 min entre 4 h e 6 h), art. 73 (noturno das 22 h às 5 h,
 * hora noturna de 52 min 30 s).
 *
 * Não é um REP-P certificado (Portaria 671/2021): serve ao controlo de
 * jornada de quem tem até 20 empregados, que a lei não obriga a registar.
 */

export type TipoBatida = 'entrada' | 'saida_intervalo' | 'volta_intervalo' | 'saida'

export const ROTULO_BATIDA: Record<TipoBatida, string> = {
  entrada: 'Entrada',
  saida_intervalo: 'Saída para intervalo',
  volta_intervalo: 'Volta do intervalo',
  saida: 'Saída',
}

export type Batida = { id?: string; tipo: TipoBatida; momento: string }

/** Rondônia não tem horário de verão: UTC−4 o ano todo. */
export const FUSO_PORTO_VELHO_MIN = -240

const MIN = 60_000
const DIA = 86_400_000
const inicia = (t: TipoBatida) => t === 'entrada' || t === 'volta_intervalo'

/** Que batidas fazem sentido a seguir à última; a primeira é a sugerida. */
export function batidasPossiveis(ultima: TipoBatida | null, intervaloJaFeito = false): TipoBatida[] {
  switch (ultima) {
    case 'entrada':
      return intervaloJaFeito ? ['saida', 'saida_intervalo'] : ['saida_intervalo', 'saida']
    case 'volta_intervalo':
      return ['saida', 'saida_intervalo']
    case 'saida_intervalo':
      return ['volta_intervalo']
    default:
      return ['entrada']
  }
}

/** Dia local (AAAA-MM-DD) de um instante. */
export function diaLocal(momento: string | Date, fusoMin = FUSO_PORTO_VELHO_MIN): string {
  return new Date(new Date(momento).getTime() + fusoMin * MIN).toISOString().slice(0, 10)
}

/** Minutos de [inicio, fim) que caem entre as 22 h e as 5 h locais. */
export function minutosNoturnos(inicio: Date, fim: Date, fusoMin = FUSO_PORTO_VELHO_MIN): number {
  const a = inicio.getTime() + fusoMin * MIN
  const b = fim.getTime() + fusoMin * MIN
  if (b <= a) return 0
  let total = 0
  for (let d = Math.floor(a / DIA) - 1; d <= Math.floor(b / DIA); d++) {
    const ini = d * DIA + 22 * 3_600_000
    const fimJanela = d * DIA + 29 * 3_600_000
    total += Math.max(0, Math.min(b, fimJanela) - Math.max(a, ini))
  }
  return Math.round(total / MIN)
}

export type Jornada = { dia: string; batidas: Batida[] }

/**
 * Agrupa as batidas em jornadas: cada `entrada` abre uma. Uma jornada que
 * passa da meia-noite pertence ao dia em que começou.
 */
export function agruparJornadas(batidas: Batida[], fusoMin = FUSO_PORTO_VELHO_MIN): Jornada[] {
  const ordenadas = [...batidas].sort((x, y) => x.momento.localeCompare(y.momento))
  const jornadas: Jornada[] = []
  for (const b of ordenadas) {
    const atual = jornadas.at(-1)
    if (!atual || b.tipo === 'entrada' || atual.batidas.at(-1)?.tipo === 'saida') {
      jornadas.push({ dia: diaLocal(b.momento, fusoMin), batidas: [b] })
    } else {
      atual.batidas.push(b)
    }
  }
  return jornadas
}

export type CalculoJornada = {
  dia: string
  batidas: Batida[]
  trabalhadoMin: number
  intervaloMin: number
  noturnoMin: number
  /** Minutos noturnos convertidos em hora noturna (×60/52,5). */
  noturnoFictoMin: number
  /** Trabalhado − jornada prevista; zero dentro da tolerância de 10 min. */
  saldoMin: number
  emAndamento: boolean
  inconsistencias: string[]
}

/** Uma jornada calculada. `agora` conta o período em curso de quem ainda não saiu. */
export function calcularJornada(
  j: Jornada,
  jornadaPrevistaMin: number,
  agora: Date = new Date(),
  fusoMin = FUSO_PORTO_VELHO_MIN,
): CalculoJornada {
  const inconsistencias: string[] = []
  let trabalhado = 0
  let intervalo = 0
  let noturno = 0
  let inicioPeriodo = null as Date | null
  let inicioIntervalo = null as Date | null
  let foraDeOrdem = false

  j.batidas.forEach((b, i) => {
    const t = new Date(b.momento)
    if (i === 0 && b.tipo !== 'entrada') foraDeOrdem = true
    if (inicia(b.tipo)) {
      if (inicioPeriodo) foraDeOrdem = true
      if (b.tipo === 'volta_intervalo') {
        if (inicioIntervalo) intervalo += (t.getTime() - inicioIntervalo.getTime()) / MIN
        else foraDeOrdem = true
        inicioIntervalo = null
      }
      inicioPeriodo = t
    } else {
      if (!inicioPeriodo) {
        foraDeOrdem = true
      } else {
        trabalhado += (t.getTime() - inicioPeriodo.getTime()) / MIN
        noturno += minutosNoturnos(inicioPeriodo, t, fusoMin)
      }
      inicioPeriodo = null
      inicioIntervalo = b.tipo === 'saida_intervalo' ? t : null
    }
  })

  const ultima = j.batidas.at(-1)
  let emAndamento = false
  if (ultima && ultima.tipo !== 'saida') {
    const desde = inicioPeriodo ?? inicioIntervalo
    const aberta = desde ? (agora.getTime() - desde.getTime()) / MIN : 0
    if (aberta > 16 * 60) {
      inconsistencias.push('Jornada sem saída registada')
    } else {
      emAndamento = true
      if (inicioPeriodo) {
        trabalhado += aberta
        noturno += minutosNoturnos(inicioPeriodo, agora, fusoMin)
      }
    }
  }
  if (foraDeOrdem) inconsistencias.push('Marcações fora de ordem')

  trabalhado = Math.round(trabalhado)
  intervalo = Math.round(intervalo)
  if (!emAndamento) {
    if (trabalhado > 6 * 60 && intervalo < 60) inconsistencias.push('Intervalo menor que 1 hora')
    else if (trabalhado > 4 * 60 && trabalhado <= 6 * 60 && intervalo < 15) inconsistencias.push('Intervalo menor que 15 minutos')
    if (trabalhado > jornadaPrevistaMin + 120) inconsistencias.push('Mais de 2 horas extras no dia')
  }

  const diferenca = trabalhado - jornadaPrevistaMin
  return {
    dia: j.dia,
    batidas: j.batidas,
    trabalhadoMin: trabalhado,
    intervaloMin: intervalo,
    noturnoMin: noturno,
    noturnoFictoMin: Math.round((noturno * 60) / 52.5),
    saldoMin: emAndamento || Math.abs(diferenca) <= 10 ? 0 : diferenca,
    emAndamento,
    inconsistencias,
  }
}

export type Espelho = {
  dias: CalculoJornada[]
  totais: { trabalhadoMin: number; saldoMin: number; noturnoMin: number; noturnoFictoMin: number; diasTrabalhados: number; inconsistencias: number }
}

/** Espelho de ponto de um período (só dias com batidas; folgas não entram). */
export function espelhoDePonto(batidas: Batida[], jornadaPrevistaMin: number, agora: Date = new Date(), fusoMin = FUSO_PORTO_VELHO_MIN): Espelho {
  const dias = agruparJornadas(batidas, fusoMin).map((j) => calcularJornada(j, jornadaPrevistaMin, agora, fusoMin))
  const soma = (f: (d: CalculoJornada) => number) => dias.reduce((s, d) => s + f(d), 0)
  return {
    dias,
    totais: {
      trabalhadoMin: soma((d) => d.trabalhadoMin),
      saldoMin: soma((d) => d.saldoMin),
      noturnoMin: soma((d) => d.noturnoMin),
      noturnoFictoMin: soma((d) => d.noturnoFictoMin),
      diasTrabalhados: new Set(dias.map((d) => d.dia)).size,
      inconsistencias: soma((d) => d.inconsistencias.length),
    },
  }
}

/** 440 → "7h20"; −15 → "−0h15". */
export function formatarMinutos(min: number): string {
  const sinal = min < 0 ? '−' : ''
  const a = Math.abs(Math.round(min))
  return `${sinal}${Math.floor(a / 60)}h${String(a % 60).padStart(2, '0')}`
}
