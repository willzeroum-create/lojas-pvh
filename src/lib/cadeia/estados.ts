/**
 * Estados de uma etapa da cadeia de produção. O diagnóstico responde "já
 * tinha?"; a execução avança de pendente para concluído.
 */

export const ESTADOS = [
  'nao_avaliado',
  'ja_tinha',
  'pendente',
  'em_curso',
  'concluido',
  'nao_aplica',
] as const
export type EstadoEtapa = (typeof ESTADOS)[number]

export const ROTULO_ESTADO: Record<EstadoEtapa, string> = {
  nao_avaliado: 'Não avaliado',
  ja_tinha: 'Já tinha',
  pendente: 'Pendente',
  em_curso: 'Em curso',
  concluido: 'Concluído',
  nao_aplica: 'Não se aplica',
}

export const DESCRICAO_ESTADO: Record<EstadoEtapa, string> = {
  nao_avaliado: 'Ainda não perguntámos nem verificámos.',
  ja_tinha: 'A empresa já tinha isto antes de nós.',
  pendente: 'Falta fazer; ninguém pegou ainda.',
  em_curso: 'Alguém da equipa está a tratar.',
  concluido: 'Feito e entregue.',
  nao_aplica: 'Não faz sentido para este negócio.',
}

/** Tom visual de cada estado, para etiquetas e pontinhos. */
export const TOM_ESTADO: Record<EstadoEtapa, 'neutro' | 'verde' | 'ambar' | 'vermelho' | 'marca' | 'tinta'> =
  {
    nao_avaliado: 'neutro',
    ja_tinha: 'tinta',
    pendente: 'vermelho',
    em_curso: 'ambar',
    concluido: 'verde',
    nao_aplica: 'neutro',
  }

/** A etapa está resolvida: ou já existia, ou fizemos, ou não se aplica. */
export function estaAtendida(estado: EstadoEtapa): boolean {
  return estado === 'ja_tinha' || estado === 'concluido' || estado === 'nao_aplica'
}

export function estaAvaliada(estado: EstadoEtapa): boolean {
  return estado !== 'nao_avaliado'
}

/** Há trabalho a fazer ou em andamento. */
export function estaAberta(estado: EstadoEtapa): boolean {
  return estado === 'pendente' || estado === 'em_curso'
}
