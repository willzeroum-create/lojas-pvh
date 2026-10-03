import { Plus } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { ouErro } from '@/lib/dados/erros'
import { CabecalhoEstoque, PRIMARIO } from '../_components/apresentacao'
import { ListaInsumos } from './_components/lista-insumos'

export const metadata: Metadata = { title: 'Insumos' }

export default async function PaginaInsumos({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const ctx = await exigirModulo('estoque')
  await exigirModulo('producao')
  const insumos = ouErro(
    await ctx.supabase.from('insumos').select('*').eq('tenant_id', ctx.tenantId).order('nome'),
    'Não foi possível carregar os insumos',
  )
  const parametros = await searchParams
  return (
    <>
      <CabecalhoEstoque
        titulo="Insumos da produção"
        descricao="Ingredientes e materiais que entram nas fichas dos produtos. Acompanhe saldos e mantenha os cadastros em dia."
      >
        <Link href="/painel/estoque/insumos/novo" className={PRIMARIO}>
          <Plus aria-hidden="true" className="size-4" /> Novo insumo
        </Link>
      </CabecalhoEstoque>
      {parametros.salvo === '1' && (
        <p
          role="status"
          className="rounded-lg border border-verde/20 bg-verde-clara p-4 text-sm font-semibold text-[#176b3a]"
        >
          Insumo salvo. O cadastro já está atualizado.
        </p>
      )}
      <ListaInsumos insumos={insumos} />
    </>
  )
}
