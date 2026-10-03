import { MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Etiqueta } from '@/components/ui/etiqueta'
import { exigirConsole } from '@/lib/auth/guardas'
import { listarPedidosDaHolding } from '@/lib/dados/holding'
import { formatarBRL } from '@/lib/dominio/moeda'
import { ROTULO_STATUS, type StatusPedido } from '@/lib/dominio/pedido'
import { PERIODOS, periodoValido, ROTULO_PERIODO } from '@/lib/dominio/periodo'
import { formatarTelefone } from '@/lib/dominio/telefone'
import { ROTULO_PAGAMENTO } from '@/lib/dominio/whatsapp'
import { cn } from '@/lib/utils/cn'
import { entrarComoTenant } from '../actions'

export const metadata: Metadata = { title: 'Pedidos' }

const TOM: Record<StatusPedido, 'marca' | 'ambar' | 'verde' | 'neutro' | 'vermelho'> = {
  novo: 'marca',
  aceite: 'ambar',
  pronto: 'verde',
  concluido: 'neutro',
  cancelado: 'vermelho',
}

function quando(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** Todos os pedidos de todas as empresas, por período, agrupados por empresa. É a janela por trás de "Pedidos hoje". */
export default async function PaginaPedidosHolding(props: { searchParams: Promise<{ periodo?: string }> }) {
  const { periodo: bruto } = await props.searchParams
  const periodo = periodoValido(bruto)
  const { supabase } = await exigirConsole()
  const { grupos, quantidade, faturacao } = await listarPedidosDaHolding(supabase, periodo)

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-cinza">
            {quantidade} pedido{quantidade === 1 ? '' : 's'} · {formatarBRL(faturacao)} em {grupos.length}{' '}
            empresa
            {grupos.length === 1 ? '' : 's'}, sem os cancelados
          </p>
        </div>
        <nav
          className="-mx-4 sem-scrollbar flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
          aria-label="Período"
        >
          {PERIODOS.map((p) => (
            <Link
              key={p}
              href={p === 'hoje' ? '/admin/pedidos' : `/admin/pedidos?periodo=${p}`}
              className={cn(
                'h-10 shrink-0 rounded-full px-3.5 text-sm leading-10 font-semibold',
                periodo === p ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3',
              )}
            >
              {ROTULO_PERIODO[p]}
            </Link>
          ))}
        </nav>
      </header>

      {grupos.length === 0 && (
        <div className="rounded-lg border border-dashed border-areia px-6 py-14 text-center text-carvao">
          <p className="text-lg font-semibold">Nenhum pedido neste período</p>
          <p className="mt-1 text-sm">Os pedidos das páginas públicas de todas as empresas aparecem aqui.</p>
        </div>
      )}

      {grupos.map((g) => (
        <section key={g.tenantId} className="rounded-lg border border-areia/70 bg-branco shadow-cartao">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia/60 px-4 py-3">
            <div>
              <Link
                href={`/admin/tenants/${g.tenantId}`}
                className="inline-flex min-h-10 items-center font-display text-lg font-bold hover:underline"
              >
                {g.nome}
              </Link>
              <p className="text-sm text-cinza">
                {g.pedidos.length} pedido{g.pedidos.length === 1 ? '' : 's'} · {formatarBRL(g.faturacao)} ·{' '}
                {g.abertos} em aberto
              </p>
            </div>
            <form action={entrarComoTenant.bind(null, g.tenantId)}>
              <button
                type="submit"
                className="h-10 rounded-md border border-areia bg-branco px-3.5 text-sm font-semibold hover:bg-papel-2"
              >
                Abrir painel
              </button>
            </form>
          </header>
          <ul className="divide-y divide-areia/60">
            {g.pedidos.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1.4fr)_7rem_7rem] md:items-center"
              >
                <div>
                  <p className="font-display text-lg font-bold">#{p.numero ?? '—'}</p>
                  <p className="text-xs text-cinza tabular-nums">{quando(p.criado_em)}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.cliente_nome ?? 'Cliente'}</p>
                  {p.cliente_telefone && (
                    <a
                      href={`https://wa.me/55${p.cliente_telefone}`}
                      className="inline-flex h-9 items-center gap-1 text-xs text-verde hover:underline"
                    >
                      <MessageCircle className="size-3" /> {formatarTelefone(p.cliente_telefone)}
                    </a>
                  )}
                </div>
                <p
                  className="truncate text-sm text-carvao"
                  title={p.itens_pedido.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')}
                >
                  {p.itens_pedido.map((i) => `${i.quantidade}× ${i.nome}`).join(', ')}
                  {p.observacoes && <span className="text-vermelho"> · {p.observacoes}</span>}
                </p>
                <div className="text-sm">
                  <p className="font-semibold tabular-nums">{formatarBRL(Number(p.total))}</p>
                  <p className="text-xs text-cinza">
                    {p.tipo_entrega === 'entrega' ? 'Entrega' : 'Retirada'} ·{' '}
                    {ROTULO_PAGAMENTO[p.forma_pagamento]}
                  </p>
                </div>
                <div className="md:text-right">
                  <Etiqueta tom={TOM[p.status]}>{ROTULO_STATUS[p.status]}</Etiqueta>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
