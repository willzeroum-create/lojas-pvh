import type { Metadata } from 'next'
import { ListaParcelas } from '../_components/lista-parcelas'

export const metadata: Metadata = { title: 'Contas a receber' }

export default async function PaginaReceber({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <ListaParcelas tipo="receber" parametros={await searchParams} />
}
