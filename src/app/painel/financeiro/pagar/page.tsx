import type { Metadata } from 'next'
import { ListaParcelas } from '../_components/lista-parcelas'

export const metadata: Metadata = { title: 'Contas a pagar' }

export default async function PaginaPagar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <ListaParcelas tipo="pagar" parametros={await searchParams} />
}
