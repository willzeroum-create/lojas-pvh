import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { produtosFiscais } from '@/lib/dados/fiscal'
import { ListaProdutosFiscais } from '../_components/lista-produtos-fiscais'

export const metadata: Metadata = { title: 'Dados fiscais dos produtos' }

export default async function PaginaProdutosFiscais() {
  const ctx = await exigirModulo('fiscal')
  const produtos = await produtosFiscais(ctx.supabase, ctx.tenantId)
  return (
    <>
      <header className="border-b border-areia pb-6">
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">Seu negócio / Fiscal</p>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Dados fiscais dos produtos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-carvao">
          Preencha os códigos confirmados pela sua contabilidade. Sem NCM, a nota é recusada.
        </p>
      </header>
      <ListaProdutosFiscais produtos={produtos} />
    </>
  )
}
