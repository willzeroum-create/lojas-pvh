import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { estadoFiscal, listarDocumentosFiscais, vendasSemNota } from '@/lib/dados/fiscal'
import { LINK_FISCAL, SituacaoFiscal } from './_components/apresentacao'
import { PainelNotas } from './_components/painel-notas'

export const metadata: Metadata = { title: 'Nota fiscal' }

export default async function PaginaFiscal() {
  const ctx = await exigirModulo('fiscal')
  const [integracao, documentos, vendas] = await Promise.all([
    estadoFiscal(ctx.supabase, ctx.tenantId),
    listarDocumentosFiscais(ctx.supabase, ctx.tenantId),
    vendasSemNota(ctx.supabase, ctx.tenantId),
  ])
  const podeEmitir = !!integracao && !['aguardando_credenciais', 'suspensa'].includes(integracao.estado)

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seu negócio / Fiscal
          </p>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">Nota fiscal, sem sair do balcão.</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-carvao">
            Escolha a venda, informe o CPF se o cliente pedir e emita a nota.
          </p>
        </div>
        <Link href="/painel/fiscal/produtos" className={LINK_FISCAL}>
          Dados dos produtos <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
        </Link>
      </header>
      <SituacaoFiscal integracao={integracao} />
      <PainelNotas vendas={vendas} documentos={documentos} podeEmitir={podeEmitir} />
    </>
  )
}
