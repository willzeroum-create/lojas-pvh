'use server'

import { revalidatePath } from 'next/cache'
import { exigirPainel } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { atualizarLoja, fecharLojaAte, obterLojaPrincipal } from '@/lib/dados/lojas'
import { fimDoDiaLocal } from '@/lib/dominio/horario'
import { esquemaLoja } from '@/lib/validacao/loja'
import { deFormData, validar } from '@/lib/validacao/zod'
import type { EstadoFormulario } from '../cardapio/actions'

export async function guardarLoja(
  lojaId: string,
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const campos = deFormData(fd)
  let horarios: unknown = []
  try {
    horarios = typeof campos.horarios_json === 'string' ? JSON.parse(campos.horarios_json) : []
  } catch {
    return { erro: 'Horários inválidos.' }
  }
  const r = validar(esquemaLoja, {
    ...campos,
    horarios,
    endereco: {
      rua: campos.rua,
      numero: campos.numero,
      complemento: campos.complemento,
      bairro: campos.bairro,
      cidade: campos.cidade,
      uf: campos.uf,
      cep: campos.cep,
      referencia: campos.referencia,
    },
  })
  if (!r.ok) return { erro: 'Confira os campos.', porCampo: r.porCampo }

  const { supabase, tenantId } = await exigirPainel()
  try {
    await atualizarLoja(supabase, tenantId, lojaId, r.dados)
  } catch (e) {
    return { erro: e instanceof ErroDados ? e.message : 'Não foi possível guardar a loja.' }
  }
  revalidatePath('/painel/loja')
  return { sucesso: 'Loja guardada.' }
}

/** O botão grande. Fecha até ao fim do dia local; o horário normal volta amanhã sozinho. */
export async function fecharLojaAgora(): Promise<void> {
  const { supabase, tenantId } = await exigirPainel()
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja) return
  await fecharLojaAte(supabase, tenantId, loja.id, fimDoDiaLocal(new Date(), loja.fuso_horario))
  revalidatePath('/painel/loja')
}

export async function reabrirLoja(): Promise<void> {
  const { supabase, tenantId } = await exigirPainel()
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja) return
  await fecharLojaAte(supabase, tenantId, loja.id, null)
  revalidatePath('/painel/loja')
}
