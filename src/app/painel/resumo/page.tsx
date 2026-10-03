import type { Metadata } from 'next'
import { NumeroGrande } from '@/components/ui/cartao'
import { exigirModulo } from '@/lib/auth/guardas'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { listarPedidosDaSemana } from '@/lib/dados/pedidos'
import { formatarBRL } from '@/lib/dominio/moeda'
import { calcularResumo } from '@/lib/dominio/resumo'
import { ResumoWhatsapp } from './_components/resumo-whatsapp'

export const metadata: Metadata = { title: 'Resumo' }

/** Números grandes e uma lista. Nada de gráficos. */
export default async function PaginaResumo() {
  const { supabase, tenantId } = await exigirModulo('resumo')
  const [pedidos, loja] = await Promise.all([
    listarPedidosDaSemana(supabase, tenantId),
    obterLojaPrincipal(supabase, tenantId),
  ])
  const resumo = calcularResumo(pedidos, new Date(), loja?.fuso_horario ?? 'America/Sao_Paulo')

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <h1 className="text-2xl font-bold">Resumo</h1>

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-wider text-cinza uppercase">Hoje</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumeroGrande rotulo="Faturamento" valor={formatarBRL(resumo.hoje.faturacao)} />
          <NumeroGrande rotulo="Pedidos" valor={String(resumo.hoje.pedidos)} />
          <NumeroGrande rotulo="Ticket médio" valor={formatarBRL(resumo.hoje.ticketMedio)} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-wider text-cinza uppercase">Últimos 7 dias</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <NumeroGrande rotulo="Faturamento" valor={formatarBRL(resumo.semana.faturacao)} />
          <NumeroGrande rotulo="Pedidos" valor={String(resumo.semana.pedidos)} />
          <NumeroGrande rotulo="Ticket médio" valor={formatarBRL(resumo.semana.ticketMedio)} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-bold tracking-wider text-cinza uppercase">
          Mais vendidos na semana
        </h2>
        {resumo.maisVendidos.length === 0 ? (
          <p className="text-sm text-cinza">Ainda não há pedidos nesta semana.</p>
        ) : (
          <ol className="divide-y divide-areia/60 rounded-lg border border-areia/70 bg-branco shadow-cartao">
            {resumo.maisVendidos.map((p, i) => (
              <li key={p.produtoId ?? p.nome} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 font-display text-lg font-bold text-nevoa">{i + 1}</span>
                <span className="flex-1 font-semibold">{p.nome}</span>
                <span className="font-display text-lg font-bold tabular-nums">{p.quantidade}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
      <p className="text-xs text-cinza">Conta pedidos não cancelados, pelo horário da loja.</p>
      <ResumoWhatsapp />
    </div>
  )
}
