'use server'

import { revalidatePath } from 'next/cache'
import { exigirPainel } from '@/lib/auth/guardas'
import { garantir } from '@/lib/dados/erros'
import { ErroDados } from '@/lib/dados/erros'
import { atualizarContaTenant } from '@/lib/dados/tenants'
import { esquemaContaTenant } from '@/lib/validacao/tenant'
import { deFormData, validar } from '@/lib/validacao/zod'
import type { EstadoFormulario } from '../cardapio/actions'

export async function guardarConta(_anterior: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const campos = deFormData(fd)
  const r = validar(esquemaContaTenant, {
    ...campos,
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

  const { supabase, tenantId, tenant } = await exigirPainel()
  try {
    await atualizarContaTenant(supabase, tenantId, r.dados)
  } catch (e) {
    return { erro: e instanceof ErroDados ? e.message : 'Não foi possível guardar.' }
  }
  revalidatePath('/painel')
  revalidatePath(`/${tenant.slug}`)
  return { sucesso: 'Dados guardados.' }
}

export async function guardarLogo(url: string | null): Promise<void> {
  const { supabase, tenantId, tenant } = await exigirPainel()
  garantir(
    await supabase.from('tenants').update({ logo_url: url }).eq('id', tenantId),
    'Não foi possível guardar o logo',
  )
  revalidatePath('/painel/conta')
  revalidatePath(`/${tenant.slug}`)
}
