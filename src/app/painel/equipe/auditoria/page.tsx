import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarAuditoria } from '@/lib/dados/equipe'
import { ESTILO_BOTAO } from '../_components/apresentacao'
import { ListaAuditoria } from './lista-auditoria'

export const metadata: Metadata = { title: 'Auditoria da equipe' }

export default async function PaginaAuditoria() {
  const { supabase, tenantId } = await exigirModulo('equipe')
  const entradas = await listarAuditoria(supabase, tenantId)
  return (
    <div className="equipe-area mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="border-b border-areia pb-6">
        <Link href="/painel/equipe" className={ESTILO_BOTAO}>
          <ArrowLeft aria-hidden="true" className="size-4" /> Equipe
        </Link>
        <p className="mt-5 text-xs font-bold tracking-[0.16em] text-carvao uppercase">Equipe / Histórico</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">Quem fez o quê</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-carvao">
          Entradas no painel, alterações da equipe e operações sensíveis, com o nome de quem aprovou. Horários
          de Porto Velho.
        </p>
      </header>
      <ListaAuditoria entradas={entradas} />
    </div>
  )
}
