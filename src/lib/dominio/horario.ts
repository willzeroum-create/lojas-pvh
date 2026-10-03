/**
 * Estado aberto/fechado de uma loja, calculado do horário real e do fuso da
 * loja. Suporta intervalos que atravessam a meia-noite (sexta 17:00 → 01:00)
 * e o botão "Fechar loja agora" (`fechada_ate`).
 *
 * Tudo aqui é puro: recebe `agora` e nunca lê o relógio do sistema.
 */

export type IntervaloHorario = {
  /** 0 = domingo … 6 = sábado, como em `Date.getDay()`. */
  dia: number
  /** "HH:MM" em hora local da loja. */
  abre: string
  /** "HH:MM". Se for menor ou igual a `abre`, fecha no dia seguinte. */
  fecha: string
}

export type DadosHorario = {
  horarios: IntervaloHorario[]
  fechada_ate: string | null
  fuso_horario: string
}

export type EstadoLoja =
  | { aberta: true; fechaAs: string }
  | {
      aberta: false
      motivo: 'fechada_manualmente' | 'fora_do_horario' | 'sem_horario'
      abreAs: string | null
    }

export const NOMES_DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'] as const
export const NOMES_DIAS_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'] as const

const MINUTOS_DIA = 24 * 60
const DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function paraMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** Dia da semana e minutos desde a meia-noite, no fuso indicado. */
export function momentoLocal(agora: Date, fuso: string): { dia: number; minutos: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: fuso,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(agora)
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ''
  const dia = DIAS_EN.indexOf(valor('weekday'))
  const hora = Number(valor('hour')) % 24
  return { dia: dia < 0 ? 0 : dia, minutos: hora * 60 + Number(valor('minute')) }
}

/**
 * Explode cada intervalo em janelas `[inicio, fim)` medidas em minutos desde a
 * meia-noite de domingo, numa semana de 7 × 1440 minutos. Um intervalo que
 * atravessa a meia-noite vira uma janela contínua que passa para o dia seguinte.
 */
function janelasSemana(horarios: IntervaloHorario[]): Array<{ inicio: number; fim: number; fecha: string }> {
  return horarios.map((h) => {
    const abre = paraMinutos(h.abre)
    let fecha = paraMinutos(h.fecha)
    if (fecha <= abre) fecha += MINUTOS_DIA
    const inicio = h.dia * MINUTOS_DIA + abre
    return { inicio, fim: inicio + (fecha - abre), fecha: h.fecha }
  })
}

function rotuloAbertura(agoraSemana: number, inicioJanela: number, abre: string): string {
  const diaAgora = Math.floor(agoraSemana / MINUTOS_DIA)
  const diaJanela = Math.floor((inicioJanela % (7 * MINUTOS_DIA)) / MINUTOS_DIA)
  const diferenca = (diaJanela - diaAgora + 7) % 7
  if (diferenca === 0 && inicioJanela >= agoraSemana) return `hoje às ${abre}`
  if (diferenca === 1) return `amanhã às ${abre}`
  return `${NOMES_DIAS[diaJanela]} às ${abre}`
}

export function estadoLoja(dados: DadosHorario, agora: Date): EstadoLoja {
  if (dados.fechada_ate && new Date(dados.fechada_ate).getTime() > agora.getTime()) {
    return { aberta: false, motivo: 'fechada_manualmente', abreAs: null }
  }
  if (dados.horarios.length === 0) {
    return { aberta: false, motivo: 'sem_horario', abreAs: null }
  }

  const { dia, minutos } = momentoLocal(agora, dados.fuso_horario)
  const agoraSemana = dia * MINUTOS_DIA + minutos
  const janelas = janelasSemana(dados.horarios)
  const semana = 7 * MINUTOS_DIA

  // Uma janela pode começar no sábado e acabar no domingo; testamos também deslocada uma semana atrás.
  for (const j of janelas) {
    for (const deslocamento of [0, -semana]) {
      const inicio = j.inicio + deslocamento
      const fim = j.fim + deslocamento
      if (agoraSemana >= inicio && agoraSemana < fim) {
        return { aberta: true, fechaAs: j.fecha }
      }
    }
  }

  // Próxima abertura: a janela com o menor início à frente de agora, contando a volta da semana.
  let proxima: { distancia: number; inicio: number; abre: string } | null = null
  for (const [indice, j] of janelas.entries()) {
    const abre = dados.horarios[indice]!.abre
    const distancia = (((j.inicio - agoraSemana) % semana) + semana) % semana
    if (!proxima || distancia < proxima.distancia) proxima = { distancia, inicio: j.inicio, abre }
  }

  return {
    aberta: false,
    motivo: 'fora_do_horario',
    abreAs: proxima ? rotuloAbertura(agoraSemana, agoraSemana + proxima.distancia, proxima.abre) : null,
  }
}

/** Fim do dia local (23:59:59) no fuso da loja, para o botão "Fechar loja agora". */
export function fimDoDiaLocal(agora: Date, fuso: string): Date {
  const { minutos } = momentoLocal(agora, fuso)
  const restantes = MINUTOS_DIA - minutos
  const fim = new Date(agora.getTime() + restantes * 60_000)
  fim.setUTCSeconds(0, 0)
  return new Date(fim.getTime() - 1000)
}

/** Agrupa os intervalos por dia para a tabela de horários da página pública. */
export function horariosPorDia(
  horarios: IntervaloHorario[],
): Array<{ dia: number; nome: string; intervalos: string[] }> {
  return NOMES_DIAS.map((nome, dia) => ({
    dia,
    nome,
    intervalos: horarios
      .filter((h) => h.dia === dia)
      .sort((a, b) => paraMinutos(a.abre) - paraMinutos(b.abre))
      .map((h) => `${h.abre} – ${h.fecha}`),
  }))
}
