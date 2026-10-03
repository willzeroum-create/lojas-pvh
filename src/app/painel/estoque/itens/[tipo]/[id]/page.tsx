import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { historicoItem, listarItensEstoque, MOTIVOS_SAIDA } from '@/lib/dados/estoque'
import { papelFazSemAprovacao } from '@/lib/equipe/papeis'
import { uuid } from '@/lib/validacao/zod'
import { CabecalhoEstoque, BOTAO } from '../../../_components/apresentacao'
import { HistoricoEstoque } from '../../../_components/historico-estoque'

export default async function PaginaItemEstoque({
  params,
}: {
  params: Promise<{ tipo: string; id: string }>
}) {
  const ctx = await exigirModulo('estoque')
  const { tipo, id } = await params
  if (!uuid.safeParse(id).success) notFound()
  if (tipo !== 'produto' && tipo !== 'insumo') notFound()
  if (tipo === 'insumo' && !ctx.modulos.has('producao')) notFound()
  const item = (await listarItensEstoque(ctx.supabase, ctx.tenantId)).find(
    (item) => item.tipo === tipo && item.id === id,
  )
  if (!item) notFound()
  const movimentos = await historicoItem(ctx.supabase, ctx.tenantId, { tipo, id })
  return (
    <>
      <CabecalhoEstoque
        titulo={item.nome}
        descricao={`${tipo === 'produto' ? 'Produto' : 'Insumo'} · Entradas, saídas e ajustes, com quem registrou cada movimento.`}
      >
        <Link
          className={BOTAO}
          href={tipo === 'produto' ? `/painel/estoque/produtos/${id}` : `/painel/estoque/insumos/${id}`}
        >
          Configurar item
        </Link>
      </CabecalhoEstoque>
      <HistoricoEstoque
        item={item}
        movimentos={movimentos}
        motivos={MOTIVOS_SAIDA}
        exigePin={!!ctx.equipe && !papelFazSemAprovacao(ctx.equipe.papel, 'estornar_estoque')}
      />
    </>
  )
}
