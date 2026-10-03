import { exigirModulo } from '@/lib/auth/guardas'
import { ouErro } from '@/lib/dados/erros'
import { CabecalhoEstoque } from '../_components/apresentacao'
import { ListaProdutosEstoque } from '../_components/lista-produtos'

export default async function PaginaProdutosEstoque() {
  const ctx = await exigirModulo('estoque')
  const produtos = ouErro(
    await ctx.supabase
      .from('produtos')
      .select('id, nome, controla_estoque, unidade, estoque_atual, vendido_por_peso')
      .eq('tenant_id', ctx.tenantId)
      .order('nome'),
    'Não foi possível ler os produtos',
  )
  return (
    <>
      <CabecalhoEstoque
        titulo="Estoque dos produtos"
        descricao="Escolha quais produtos controlar e como medir cada unidade vendida."
      />
      <ListaProdutosEstoque
        produtos={produtos.map((produto) => ({ ...produto, estoque_atual: Number(produto.estoque_atual) }))}
      />
    </>
  )
}
