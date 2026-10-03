import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { clientesComCashback, obterConfigCashback } from '@/lib/dados/fidelidade'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { PainelFidelidade } from './_components/painel-fidelidade'

export const metadata: Metadata = { title: 'Cashback' }

export default async function PaginaFidelidade({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string | string[] }>
}) {
  const ctx = await exigirModulo('fidelidade')
  const [sp, config, clientes] = await Promise.all([
    searchParams,
    obterConfigCashback(ctx.supabase, ctx.tenantId),
    clientesComCashback(ctx.supabase, ctx.tenantId),
  ])
  const clienteInicial = typeof sp.cliente === 'string' ? sp.cliente : null

  return (
    <PainelFidelidade
      key={clienteInicial ?? 'lista'}
      config={config}
      clientes={clientes}
      podeConfigurar={donoOuGerente(ctx.equipe)}
      podeVerCadastros={ctx.modulos.has('clientes')}
      clienteInicial={clienteInicial}
    />
  )
}
