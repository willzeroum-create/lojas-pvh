import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarEquipe } from '@/lib/dados/equipe'
import { GestaoEquipe } from './_components/gestao-equipe'

export const metadata: Metadata = { title: 'Equipe' }

export default async function PaginaEquipe() {
  const ctx = await exigirModulo('equipe')
  const membros = await listarEquipe(ctx.supabase, ctx.tenantId)
  return (
    <GestaoEquipe
      membros={membros}
      podeGerir={Boolean(ctx.sessao.operador) || ctx.equipe?.papel === 'gerente'}
      pessoaAtual={ctx.equipe?.id ?? null}
      agora={new Date().getTime()}
    />
  )
}
