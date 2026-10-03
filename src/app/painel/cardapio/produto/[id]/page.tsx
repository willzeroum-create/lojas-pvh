import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { obterProdutoComGrupos } from '@/lib/dados/cardapio'
import { FormularioProduto } from '../../_components/formulario-produto'

export const metadata: Metadata = { title: 'Produto' }

export default async function PaginaProduto(props: PageProps<'/painel/cardapio/produto/[id]'>) {
  const [{ id }, { categoria, criado }] = await Promise.all([props.params, props.searchParams])
  const { supabase, tenantId } = await exigirModulo('cardapio')
  const { data: categorias } = await supabase
    .from('categorias')
    .select('id, nome')
    .eq('tenant_id', tenantId)
    .order('ordem')
    .order('nome')

  if (id === 'novo') {
    return (
      <FormularioProduto
        tenantId={tenantId}
        produto={null}
        categorias={categorias ?? []}
        categoriaInicial={typeof categoria === 'string' ? categoria : undefined}
      />
    )
  }

  const produto = await obterProdutoComGrupos(supabase, tenantId, id)
  if (!produto) notFound()
  return (
    <FormularioProduto
      tenantId={tenantId}
      produto={produto}
      categorias={categorias ?? []}
      acabouDeCriar={criado === '1'}
    />
  )
}
