import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { painelDoEntregador } from '@/lib/dados/delivery'
import { PainelEntregador } from './painel-entregador'

export const metadata: Metadata = { title: 'Minhas entregas', robots: { index: false, follow: false } }

export default async function PaginaEntregador({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const painel = await painelDoEntregador(token)
  if (!painel) notFound()
  return <PainelEntregador token={token} inicial={painel} />
}
