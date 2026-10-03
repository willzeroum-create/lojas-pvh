import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarItensEstoque, obterEntrada } from '@/lib/dados/estoque'
import { uuid } from '@/lib/validacao/zod'
import { ConferenciaEntrada } from '../_components/conferencia-entrada'
import { BOTAO_ENTRADA } from '../_components/apresentacao'

export const metadata: Metadata = { title: 'Conferência da entrada' }

export default async function PaginaConferencia({ params }: { params: Promise<{ id: string }> }) {
  const [ctx, { id }] = await Promise.all([exigirModulo('estoque'), params])
  if (!uuid.safeParse(id).success) notFound()
  const [entrada, itens] = await Promise.all([
    obterEntrada(ctx.supabase, ctx.tenantId, id),
    listarItensEstoque(ctx.supabase, ctx.tenantId),
  ])
  if (!entrada) notFound()
  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6">
      <Link href="/painel/estoque/entradas" className={`${BOTAO_ENTRADA} border-0 bg-transparent px-0`}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Entradas
      </Link>
      <ConferenciaEntrada
        key={entrada.id}
        entrada={entrada}
        catalogo={itens.filter((item) => item.tipo === 'produto' || ctx.modulos.has('producao'))}
        financeiroAtivo={ctx.modulos.has('financeiro')}
      />
    </div>
  )
}
