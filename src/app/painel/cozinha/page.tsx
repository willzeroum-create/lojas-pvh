import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { filaDaCozinha, listarEstacoes } from '@/lib/dados/cozinha'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { papelFazSemAprovacao } from '@/lib/equipe/papeis'
import { QuadroCozinha } from './_components/quadro-cozinha'

export const metadata: Metadata = { title: 'Cozinha' }

async function consultarFila(...parametros: Parameters<typeof filaDaCozinha>) {
  const cartoes = await filaDaCozinha(...parametros)
  return { cartoes, consultadoEm: Date.now() }
}

export default async function PaginaCozinha() {
  const { supabase, tenantId, equipe } = await exigirModulo('cozinha')
  const [fila, estacoes, loja] = await Promise.all([
    consultarFila(supabase, tenantId),
    listarEstacoes(supabase, tenantId),
    obterLojaPrincipal(supabase, tenantId),
  ])

  return (
    <QuadroCozinha
      cartoes={fila.cartoes}
      estacoes={estacoes}
      lojaNome={loja?.nome ?? 'Cozinha'}
      consultadoEm={fila.consultadoEm}
      cancelamentoExigePin={Boolean(equipe && !papelFazSemAprovacao(equipe.papel, 'cancelar_item'))}
    />
  )
}
