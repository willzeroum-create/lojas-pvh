/**
 * Papéis da equipe e o que cada um pode fazer. O painel fica aberto com a
 * conta da loja (o dono entra uma vez no tablet); cada pessoa da equipe se
 * identifica com o seu PIN, e o papel decide os separadores que vê e as
 * ações que faz sem pedir o PIN do gerente. Lógica pura.
 */
import type { ModuloId } from '@/lib/modulos/catalogo'

export const PAPEIS = {
  gerente: 'Gerente',
  caixa: 'Caixa',
  garcom: 'Garçom',
  cozinha: 'Cozinha',
  atendente: 'Atendente',
} as const

export type Papel = keyof typeof PAPEIS

/** Módulos que cada papel abre. `null` = todos os ligados na empresa. */
const MODULOS_DO_PAPEL: Record<Papel, readonly ModuloId[] | null> = {
  gerente: null,
  caixa: ['pdv', 'caixa', 'comandas', 'pedidos', 'clientes', 'loja', 'ponto', 'conta'],
  garcom: ['comandas', 'cozinha', 'pedidos', 'ponto', 'conta'],
  cozinha: ['cozinha', 'pedidos', 'ponto', 'conta'],
  atendente: ['pedidos', 'cardapio', 'clientes', 'comandas', 'loja', 'ponto', 'conta'],
}

export const ACOES_SENSIVEIS = {
  cancelar_venda: 'Cancelar venda',
  sangria: 'Sangria',
  desconto_alto: 'Desconto acima do limite',
  cancelar_item: 'Cancelar item já na cozinha',
  diferenca_caixa: 'Fechar caixa com diferença',
  estornar_estoque: 'Estornar movimento de estoque',
  ajustar_ponto: 'Ajustar batida de ponto',
} as const

export type AcaoSensivel = keyof typeof ACOES_SENSIVEIS

/** Ações que o papel faz sem aprovação. O gerente faz todas. */
const ACOES_DO_PAPEL: Record<Papel, readonly AcaoSensivel[]> = {
  gerente: Object.keys(ACOES_SENSIVEIS) as AcaoSensivel[],
  caixa: [],
  garcom: [],
  cozinha: ['cancelar_item'],
  atendente: [],
}

/** Desconto máximo (% do total) que o papel dá sem aprovação. */
export const LIMITE_DESCONTO: Record<Papel, number> = { gerente: 100, caixa: 10, garcom: 0, cozinha: 0, atendente: 5 }

export function papelAbreModulo(papel: Papel, modulo: ModuloId): boolean {
  const lista = MODULOS_DO_PAPEL[papel]
  return lista === null || lista.includes(modulo)
}

export function papelFazSemAprovacao(papel: Papel, acao: AcaoSensivel): boolean {
  return ACOES_DO_PAPEL[papel].includes(acao)
}

/** O desconto pedido precisa da aprovação do gerente? */
export function descontoPrecisaAprovacao(papel: Papel, desconto: number, total: number): boolean {
  if (desconto <= 0) return false
  if (total <= 0) return true
  return (desconto / total) * 100 > LIMITE_DESCONTO[papel] + 1e-9
}

/** PIN de 4 a 6 dígitos, sem sequências óbvias. */
export function pinAceitavel(pin: string): { ok: true } | { ok: false; motivo: string } {
  if (!/^\d{4,6}$/.test(pin)) return { ok: false, motivo: 'O PIN tem de ter 4 a 6 números.' }
  if (/^(\d)\1+$/.test(pin)) return { ok: false, motivo: 'Evite números repetidos (ex.: 1111).' }
  const sobe = '0123456789'
  const desce = '9876543210'
  if (sobe.includes(pin) || desce.includes(pin)) return { ok: false, motivo: 'Evite sequências (ex.: 1234).' }
  return { ok: true }
}

/** Espelho de ponto, batidas manuais e anulações: só o dono (sem PIN de equipe) ou um gerente. */
export function podeGerirPonto(equipe: { papel: Papel } | null): boolean {
  return !equipe || equipe.papel === 'gerente'
}
