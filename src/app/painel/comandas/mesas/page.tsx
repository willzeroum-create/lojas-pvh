import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { mapaDeMesas } from '@/lib/dados/comandas'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { AvisoComanda } from '../_components/apresentacao'
import { CadastroMesas } from './_components/cadastro-mesas'

export const metadata: Metadata = { title: 'Cadastro de mesas' }

export default async function PaginaMesas() {
  const { supabase, tenantId } = await exigirModulo('comandas')
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja)
    return (
      <AvisoComanda erro>
        Não foi possível localizar a loja principal. Confira a conexão e o cadastro da loja.
      </AvisoComanda>
    )
  const mesas = await mapaDeMesas(supabase, tenantId, loja.id)
  return <CadastroMesas mesas={mesas} />
}
