import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { uuid } from '@/lib/validacao/zod'
import { CabecalhoEstoque, BOTAO } from '../../_components/apresentacao'
import { ConfiguracaoProduto } from '../../_components/configuracao-produto'

export default async function PaginaConfiguracaoProduto({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await exigirModulo('estoque')
  const { id } = await params
  if (!uuid.safeParse(id).success) notFound()
  const resultado = await ctx.supabase
    .from('produtos')
    .select(
      'id, nome, controla_estoque, unidade, estoque_minimo, estoque_atual, codigo_barras, vendido_por_peso',
    )
    .eq('tenant_id', ctx.tenantId)
    .eq('id', id)
    .maybeSingle()
  if (resultado.error) throw new ErroDados('Não foi possível ler o produto.', resultado.error)
  const produto = resultado.data
  if (!produto) notFound()
  return (
    <>
      <CabecalhoEstoque
        titulo={produto.nome}
        descricao="Configure a unidade, o limite de reposição e a identificação no balcão."
      />
      <div className="flex flex-wrap gap-2">
        {produto.controla_estoque && (
          <Link className={BOTAO} href={`/painel/estoque/itens/produto/${produto.id}`}>
            Ver histórico
          </Link>
        )}
        {ctx.modulos.has('producao') && (
          <Link className={BOTAO} href={`/painel/estoque/fichas/${produto.id}`}>
            Ficha técnica e margem
          </Link>
        )}
      </div>
      <ConfiguracaoProduto
        produto={{
          ...produto,
          estoque_minimo: Number(produto.estoque_minimo),
          estoque_atual: Number(produto.estoque_atual),
        }}
      />
    </>
  )
}
