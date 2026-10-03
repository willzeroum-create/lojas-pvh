/**
 * Delivery próprio: taxa por bairro, estados da entrega e acerto do
 * entregador. Lógica pura.
 */
import { arredondar } from './moeda'

export type ZonaEntrega = { id: string; nome: string; chave: string; taxa: number; tempoMin: number }

/** "Jardim  América " e "jardim america" são o mesmo bairro. */
export function chaveBairro(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Zona do bairro do cliente. Sem zonas cadastradas vale a taxa única da loja;
 * com zonas, um bairro fora da lista não recebe entrega (o dono decide onde vai).
 */
export function zonaDoBairro(
  zonas: ZonaEntrega[],
  bairro: string | undefined | null,
): { ok: true; zona: ZonaEntrega | null } | { ok: false; erro: string } {
  if (zonas.length === 0) return { ok: true, zona: null }
  const chave = chaveBairro(bairro ?? '')
  if (!chave) return { ok: false, erro: 'Informe o bairro para calcular a entrega.' }
  const zona = zonas.find((z) => z.chave === chave)
  return zona ? { ok: true, zona } : { ok: false, erro: `Ainda não entregamos no bairro ${bairro!.trim()}. Escolha retirada ou fale com a loja no WhatsApp.` }
}

export type EstadoEntrega = 'aguardando' | 'em_rota' | 'entregue' | 'nao_entregue'

export const ROTULO_ENTREGA: Record<EstadoEntrega, string> = {
  aguardando: 'Aguardando entregador',
  em_rota: 'Saiu para entrega',
  entregue: 'Entregue',
  nao_entregue: 'Não entregue',
}

/** Transições permitidas (a base confere o mesmo num gatilho). */
export const PROXIMOS_ESTADOS: Record<EstadoEntrega, EstadoEntrega[]> = {
  aguardando: ['em_rota'],
  em_rota: ['entregue', 'nao_entregue', 'aguardando'],
  nao_entregue: ['em_rota', 'aguardando'],
  entregue: [],
}

export type EntregaParaAcerto = { repasse: number; estado: EstadoEntrega; acertadoEm: string | null }

/** O que se deve ao entregador: entregas concluídas ainda não acertadas. */
export function aAcertar(entregas: EntregaParaAcerto[]): { quantidade: number; valor: number } {
  const pendentes = entregas.filter((e) => e.estado === 'entregue' && !e.acertadoEm)
  return { quantidade: pendentes.length, valor: arredondar(pendentes.reduce((s, e) => s + e.repasse, 0)) }
}
