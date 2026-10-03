import { ArrowLeft, History } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { ouErro } from '@/lib/dados/erros'
import { formatarBRL } from '@/lib/dominio/moeda'
import { uuid } from '@/lib/validacao/zod'
import { BOTAO, CabecalhoEstoque, quantidade } from '../../_components/apresentacao'
import { FormularioInsumo } from '../_components/formulario-insumo'

export const metadata: Metadata = { title: 'Editar insumo' }

export default async function PaginaEditarInsumo({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await exigirModulo('estoque')
  await exigirModulo('producao')
  const { id } = await params
  if (!uuid.safeParse(id).success) notFound()
  const [insumo] = ouErro(
    await ctx.supabase.from('insumos').select('*').eq('tenant_id', ctx.tenantId).eq('id', id).limit(1),
    'Não foi possível carregar o insumo',
  )
  if (!insumo) notFound()
  return (
    <>
      <CabecalhoEstoque
        titulo={insumo.nome}
        descricao="Cadastro do insumo e referência para as próximas entradas e fichas."
      >
        <Link href="/painel/estoque/insumos" className={BOTAO}>
          <ArrowLeft aria-hidden="true" className="size-4" /> Insumos
        </Link>
      </CabecalhoEstoque>
      <section aria-label="Posição atual do insumo" className="grid gap-3 min-[480px]:grid-cols-2">
        <div className="rounded-xl bg-tinta p-5 text-papel">
          <p className="text-sm">Saldo atual</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {quantidade(insumo.quantidade_atual)}{' '}
            <span className="text-base font-medium">{insumo.unidade}</span>
          </p>
        </div>
        <div className="rounded-xl border border-areia bg-branco p-5">
          <p className="text-sm text-carvao">Custo por {insumo.unidade}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{formatarBRL(insumo.custo_unitario)}</p>
        </div>
      </section>
      {insumo.ativo && (
        <Link href={`/painel/estoque/itens/insumo/${insumo.id}`} className={`${BOTAO} self-start`}>
          <History aria-hidden="true" className="size-4" /> Ver movimentos do estoque
        </Link>
      )}
      <FormularioInsumo key={insumo.id} insumo={insumo} />
    </>
  )
}
