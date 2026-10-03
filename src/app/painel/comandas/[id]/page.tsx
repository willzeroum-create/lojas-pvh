import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { caixaAberto } from '@/lib/dados/caixa'
import { comandasAvulsas, mapaDeMesas, obterComanda } from '@/lib/dados/comandas'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { produtosDoPdv } from '@/lib/dados/pdv'
import { papelFazSemAprovacao } from '@/lib/equipe/papeis'
import { uuid } from '@/lib/validacao/zod'
import { AtendimentoComanda } from './_components/atendimento-comanda'

export const metadata: Metadata = { title: 'Atender comanda' }

export default async function PaginaComanda({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, tenantId, equipe } = await exigirModulo('comandas')
  const { id } = await params
  if (!uuid.safeParse(id).success) notFound()
  const [loja, comanda] = await Promise.all([
    obterLojaPrincipal(supabase, tenantId),
    obterComanda(supabase, tenantId, id),
  ])
  if (!comanda) notFound()
  if (!loja)
    return (
      <section className="pdv-area rounded-xl border border-areia bg-branco p-6">
        <h1 className="text-2xl font-bold">Loja não encontrada</h1>
        <p className="mt-2 text-carvao">Confira o cadastro da loja para continuar o atendimento.</p>
        <Link href="/painel/comandas" className="pdv-botao mt-5">
          Voltar às mesas
        </Link>
      </section>
    )
  const aberta = comanda.estado === 'aberta' || comanda.estado === 'conta'
  const [produtos, mesas, avulsas, caixa] = await Promise.all([
    aberta ? produtosDoPdv(supabase, tenantId) : Promise.resolve([]),
    aberta ? mapaDeMesas(supabase, tenantId, loja.id) : Promise.resolve([]),
    aberta ? comandasAvulsas(supabase, tenantId) : Promise.resolve([]),
    aberta ? caixaAberto(supabase, tenantId, loja.id) : Promise.resolve(null),
  ])
  const outrasComandas = [
    ...mesas.flatMap((mesa) =>
      mesa.comanda ? [{ id: mesa.comanda.id, rotulo: `Mesa ${mesa.numero}`, total: mesa.comanda.total }] : [],
    ),
    ...avulsas.map((avulsa) => ({
      id: avulsa.id,
      rotulo: avulsa.identificador || 'Comanda avulsa',
      total: avulsa.total,
    })),
  ].filter((outra) => outra.id !== comanda.id)
  return (
    <AtendimentoComanda
      key={comanda.id}
      comanda={comanda}
      produtos={produtos}
      mesasLivres={mesas.filter((mesa) => mesa.ativa && mesa.estado === 'livre')}
      outrasComandas={outrasComandas}
      caixaEstaAberto={Boolean(caixa)}
      cancelamentoExigePin={Boolean(equipe && !papelFazSemAprovacao(equipe.papel, 'cancelar_item'))}
    />
  )
}
