import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { espelhoDoMembro } from '@/lib/dados/ponto'
import { donoOuGerente } from '@/lib/equipe/papeis'
import { mesValido } from '../_components/apresentacao'
import { EspelhoPonto } from '../_components/espelho'

export const metadata: Metadata = { title: 'Espelho de ponto' }

export default async function PaginaEspelho({ params, searchParams }: { params: Promise<{ membroId: string }>; searchParams: Promise<{ mes?: string | string[] }> }) {
  const ctx = await exigirModulo('ponto')
  if (!donoOuGerente(ctx.equipe)) notFound()
  const { membroId } = await params
  const mes = mesValido((await searchParams).mes)
  const dados = await espelhoDoMembro(ctx.supabase, ctx.tenantId, membroId, mes)
  if (!dados) notFound()
  return <EspelhoPonto key={`${membroId}-${mes}`} dados={dados} empresa={ctx.tenant.nome_fantasia} />
}
