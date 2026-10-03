import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { exigirPainel } from '@/lib/auth/guardas'
import { listarEquipe } from '@/lib/dados/equipe'
import { EntradaEquipe } from './entrada-equipe'

export const metadata: Metadata = { title: 'Quem está operando?' }

export default async function PaginaEntrarEquipe() {
  const ctx = await exigirPainel({ semEquipe: true })
  if (!ctx.equipe && !ctx.modulos.has('equipe')) redirect('/painel')
  const membros = await listarEquipe(ctx.supabase, ctx.tenantId)
  return (
    <EntradaEquipe
      membros={membros}
      agoraInicial={new Date().getTime()}
      pessoaAtual={ctx.equipe?.nome ?? null}
    />
  )
}
