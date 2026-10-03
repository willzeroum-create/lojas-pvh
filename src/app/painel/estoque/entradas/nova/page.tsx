import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarItensEstoque } from '@/lib/dados/estoque'
import { listarPessoas } from '@/lib/dados/clientes'
import { NovaEntrada } from '../_components/nova-entrada'
import { BOTAO_ENTRADA } from '../_components/apresentacao'

export const metadata: Metadata = { title: 'Nova entrada de estoque' }

export default async function PaginaNovaEntrada({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [ctx, parametros] = await Promise.all([exigirModulo('estoque'), searchParams])
  const busca = typeof parametros.fornecedor === 'string' ? parametros.fornecedor.trim().slice(0, 80) : ''
  const [itens, fornecedores] = await Promise.all([
    listarItensEstoque(ctx.supabase, ctx.tenantId),
    listarPessoas(ctx.supabase, ctx.tenantId, { papel: 'fornecedores', busca, pagina: 1 }),
  ])
  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 space-y-6">
      <Link href="/painel/estoque/entradas" className={`${BOTAO_ENTRADA} border-0 bg-transparent px-0`}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Entradas
      </Link>
      <header>
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
          Estoque / Compra recebida
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Nova entrada</h1>
        <p className="mt-2 text-sm leading-relaxed text-carvao">
          Primeiro os dados da compra. Depois a conferência e a entrada no saldo.
        </p>
      </header>
      <NovaEntrada
        itens={itens.filter((item) => item.tipo === 'produto' || ctx.modulos.has('producao'))}
        fornecedores={fornecedores.itens.map(({ id, nome, nome_fantasia }) => ({
          id,
          nome: nome_fantasia || nome,
        }))}
        totalFornecedores={fornecedores.total}
        buscaInicial={busca}
      />
    </div>
  )
}
