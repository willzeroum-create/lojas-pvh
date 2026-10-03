import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarCategoriasComProdutos } from '@/lib/dados/cardapio'
import { listarEstacoes } from '@/lib/dados/cozinha'
import { ConfigurarEstacoes } from '../_components/configurar-estacoes'

export const metadata: Metadata = { title: 'Estações da cozinha' }

export default async function PaginaEstacoes() {
  const { supabase, tenantId } = await exigirModulo('cozinha')
  const [estacoes, categorias] = await Promise.all([
    listarEstacoes(supabase, tenantId),
    listarCategoriasComProdutos(supabase, tenantId),
  ])
  return (
    <ConfigurarEstacoes
      estacoes={estacoes}
      categorias={categorias.map(({ id, nome, ativo }) => ({ id, nome, ativo }))}
    />
  )
}
