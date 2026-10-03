import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarEntradas } from '@/lib/dados/estoque'
import { formatarBRL } from '@/lib/dominio/moeda'
import { BOTAO_ENTRADA, dataEntrada, PRIMARIO_ENTRADA, SeloEntrada } from './_components/apresentacao'

export const metadata: Metadata = { title: 'Entradas de estoque' }

export default async function PaginaEntradas() {
  const { supabase, tenantId } = await exigirModulo('estoque')
  const entradas = await listarEntradas(supabase, tenantId)
  const pendentes = entradas.filter((entrada) => entrada.estado === 'pendente').length
  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-6">
      <Link href="/painel/estoque" className={`${BOTAO_ENTRADA} border-0 bg-transparent px-0`}>
        <ArrowLeft aria-hidden="true" className="size-4" /> Estoque
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">Estoque / Compras</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Entradas de estoque</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-carvao">
            Importe a nota do fornecedor ou registre uma compra manualmente. Confira os itens antes de
            atualizar o saldo.
          </p>
        </div>
        <Link href="/painel/estoque/entradas/nova" className={`${PRIMARIO_ENTRADA} w-full sm:w-auto`}>
          <Plus aria-hidden="true" className="size-5" /> Nova entrada
        </Link>
      </header>
      {pendentes > 0 && (
        <p className="rounded-xl border border-ambar/40 bg-ambar-clara p-4 text-sm text-[#7b4b00]">
          <strong className="mr-2 text-2xl tabular-nums">{pendentes}</strong>
          {pendentes === 1 ? 'entrada aguardando conferência.' : 'entradas aguardando conferência.'} O saldo
          só muda depois da conclusão.
        </p>
      )}
      <section
        className="overflow-hidden rounded-xl border border-areia bg-branco"
        aria-label="Entradas recentes"
      >
        <div className="border-b border-areia bg-papel-2/60 px-4 py-4 sm:px-6">
          <h2 className="font-bold">Últimas entradas</h2>
          <p className="mt-1 text-xs text-carvao">Até 50 entradas, da mais recente para a mais antiga.</p>
        </div>
        {!entradas.length ? (
          <div className="px-5 py-10">
            <h3 className="text-xl font-bold">Sua próxima compra entra aqui.</h3>
            <p className="mt-2 max-w-lg text-sm text-carvao">
              Tenha o XML da NF-e em mãos ou informe os itens da compra.
            </p>
            <Link href="/painel/estoque/entradas/nova" className={`${PRIMARIO_ENTRADA} mt-5`}>
              Registrar primeira entrada <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-areia">
            {entradas.map((entrada) => (
              <li key={entrada.id}>
                <Link
                  href={`/painel/estoque/entradas/${entrada.id}`}
                  className="flex min-h-12 min-w-0 flex-wrap items-center justify-between gap-4 px-4 py-5 hover:bg-papel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tinta sm:px-6"
                >
                  <span className="min-w-0 flex-1 basis-52">
                    <span className="block font-bold break-words">
                      {entrada.fornecedor_nome ??
                        (entrada.numero_nota ? 'Fornecedor da nota' : 'Entrada manual')}
                    </span>
                    <span className="mt-1 block text-sm text-carvao">
                      {entrada.numero_nota ? `NF ${entrada.numero_nota}` : 'Sem nota fiscal'} ·{' '}
                      {dataEntrada(entrada.emitida_em ?? entrada.criado_em)} · {entrada.itens}{' '}
                      {entrada.itens === 1 ? 'item' : 'itens'}
                    </span>
                  </span>
                  <span className="flex w-full items-center justify-between gap-3 sm:w-auto">
                    <SeloEntrada estado={entrada.estado} />
                    <strong className="text-xl tabular-nums">{formatarBRL(entrada.valor_total)}</strong>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
