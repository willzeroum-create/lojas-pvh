import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { FormularioCategoria } from '../../_components/formulario-categoria'

export const metadata: Metadata = { title: 'Categoria' }

export default async function PaginaCategoria(props: PageProps<'/painel/cardapio/categoria/[id]'>) {
  const { id } = await props.params
  if (id === 'nova') return <FormularioCategoria categoria={null} />

  const { supabase, tenantId } = await exigirModulo('cardapio')
  const { data } = await supabase
    .from('categorias')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .maybeSingle()
  if (!data) notFound()
  return <FormularioCategoria categoria={data} />
}
