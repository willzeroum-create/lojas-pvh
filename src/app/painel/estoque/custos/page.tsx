import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { custosDosProdutos } from '@/lib/dados/estoque'
import { CabecalhoEstoque } from '../_components/apresentacao'
import { ListaCustos } from '../_components/lista-custos'

export const metadata: Metadata = { title: 'Custos e margens' }

export default async function PaginaCustos() {
  const ctx = await exigirModulo('estoque')
  if (!ctx.modulos.has('producao')) redirect('/painel/estoque')
  const produtos = await custosDosProdutos(ctx.supabase, ctx.tenantId)
  return (
    <>
      <CabecalhoEstoque
        titulo="Custos e margens"
        descricao="Quanto custa produzir, quanto sobra em cada venda. Comece pelos produtos que ainda não têm ficha."
      />
      <ListaCustos produtos={produtos} />
    </>
  )
}
