import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { obterFicha } from '@/lib/dados/estoque'
import { uuid } from '@/lib/validacao/zod'
import { BOTAO, CabecalhoEstoque } from '../../_components/apresentacao'
import { EditorFicha } from '../../_components/editor-ficha'

export const metadata: Metadata = { title: 'Ficha técnica' }

export default async function PaginaFicha({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await exigirModulo('estoque')
  if (!ctx.modulos.has('producao')) redirect('/painel/estoque')
  const { id } = await params
  if (!uuid.safeParse(id).success) notFound()
  const [ficha, consulta] = await Promise.all([
    obterFicha(ctx.supabase, ctx.tenantId, id),
    ctx.supabase
      .from('insumos')
      .select('id, nome, unidade, custo_unitario, ativo')
      .eq('tenant_id', ctx.tenantId)
      .order('nome'),
  ])
  if (consulta.error) throw new Error('Não foi possível carregar os insumos da ficha.')
  if (!ficha) notFound()
  const insumos = consulta.data.map((insumo) => ({
    id: insumo.id,
    nome: insumo.nome,
    unidade: insumo.unidade,
    custoUnitario: Number(insumo.custo_unitario),
    ativo: insumo.ativo,
  }))
  return (
    <>
      <CabecalhoEstoque
        titulo={ficha.produto.nome}
        descricao="Ficha técnica por unidade vendida. Use a unidade cadastrada de cada insumo para informar o consumo."
      >
        <Link href="/painel/estoque/custos" className={BOTAO}>
          Voltar aos custos
        </Link>
      </CabecalhoEstoque>
      <EditorFicha key={ficha.produto.id} ficha={ficha} insumos={insumos} />
    </>
  )
}
