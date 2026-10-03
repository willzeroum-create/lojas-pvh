import type { Endereco } from '@/lib/dominio/endereco'
import type { IntervaloHorario } from '@/lib/dominio/horario'
import type { Cliente } from '@/lib/supabase/server'
import type { LojaLinha } from '@/lib/supabase/tipos'
import type { DadosLoja } from '@/lib/validacao/loja'
import { garantir } from './erros'

/** Linha da loja com os jsonb já tipados. */
export type Loja = Omit<LojaLinha, 'endereco' | 'horarios'> & {
  endereco: Endereco
  horarios: IntervaloHorario[]
}

export function tiparLoja(linha: LojaLinha): Loja {
  return {
    ...linha,
    taxa_entrega: Number(linha.taxa_entrega),
    pedido_minimo: Number(linha.pedido_minimo),
    raio_entrega_km: linha.raio_entrega_km == null ? null : Number(linha.raio_entrega_km),
    endereco: (linha.endereco ?? {}) as Endereco,
    horarios: (Array.isArray(linha.horarios) ? linha.horarios : []) as IntervaloHorario[],
  }
}

/** A Fase 1 opera com uma loja por tenant: a primeira activa. */
export async function obterLojaPrincipal(supabase: Cliente, tenantId: string): Promise<Loja | null> {
  const { data } = await supabase
    .from('lojas')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('ativo', true)
    .order('criado_em')
    .limit(1)
    .maybeSingle()
  return data ? tiparLoja(data) : null
}

export async function atualizarLoja(
  supabase: Cliente,
  tenantId: string,
  lojaId: string,
  dados: DadosLoja,
): Promise<void> {
  garantir(
    await supabase
      .from('lojas')
      .update({
        nome: dados.nome,
        endereco: dados.endereco ?? {},
        fuso_horario: dados.fuso_horario,
        horarios: dados.horarios,
        aceita_entrega: dados.aceita_entrega,
        aceita_retirada: dados.aceita_retirada,
        raio_entrega_km: dados.raio_entrega_km ?? null,
        taxa_entrega: dados.taxa_entrega,
        pedido_minimo: dados.pedido_minimo,
      })
      .eq('tenant_id', tenantId)
      .eq('id', lojaId),
    'Não foi possível guardar a loja',
  )
}

/** `ate = null` reabre a loja. */
export async function fecharLojaAte(
  supabase: Cliente,
  tenantId: string,
  lojaId: string,
  ate: Date | null,
): Promise<void> {
  garantir(
    await supabase
      .from('lojas')
      .update({ fechada_ate: ate ? ate.toISOString() : null })
      .eq('tenant_id', tenantId)
      .eq('id', lojaId),
    'Não foi possível mudar o estado da loja',
  )
}
