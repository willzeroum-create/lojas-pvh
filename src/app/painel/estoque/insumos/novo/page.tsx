import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { BOTAO, CabecalhoEstoque } from '../../_components/apresentacao'
import { FormularioInsumo } from '../_components/formulario-insumo'

export const metadata: Metadata = { title: 'Novo insumo' }

export default async function PaginaNovoInsumo() {
  await exigirModulo('estoque')
  await exigirModulo('producao')
  return (
    <>
      <CabecalhoEstoque
        titulo="Novo insumo"
        descricao="Escolha a unidade usada na contagem e nas fichas de produção."
      >
        <Link href="/painel/estoque/insumos" className={BOTAO}>
          <ArrowLeft aria-hidden="true" className="size-4" /> Insumos
        </Link>
      </CabecalhoEstoque>
      <FormularioInsumo />
    </>
  )
}
