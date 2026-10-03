import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { acompanhamentoPublico } from '@/lib/dados/delivery'
import { AtualizarSozinho } from './atualizar-sozinho'

export const metadata: Metadata = { title: 'Acompanhe sua entrega', robots: { index: false, follow: false } }

const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Porto_Velho' })

export default async function PaginaAcompanhamento({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params
  const a = await acompanhamentoPublico(codigo)
  if (!a) notFound()

  const cancelado = a.pedidoStatus === 'cancelado'
  const passos = [
    { rotulo: 'Pedido recebido', feito: true, quando: a.criadoEm },
    { rotulo: a.entregador ? `Saiu para entrega com ${a.entregador}` : 'Saiu para entrega', feito: !!a.saiuEm, quando: a.saiuEm },
    { rotulo: 'Entregue', feito: a.estado === 'entregue', quando: a.entregueEm },
  ]
  const titulo = cancelado
    ? 'Pedido cancelado'
    : a.estado === 'entregue'
      ? 'Pedido entregue. Bom apetite!'
      : a.estado === 'em_rota'
        ? 'Seu pedido está a caminho'
        : a.estado === 'nao_entregue'
          ? 'Não conseguimos entregar'
          : 'Preparando seu pedido'

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-papel px-4 py-10 text-tinta">
      {!cancelado && a.estado !== 'entregue' && <AtualizarSozinho />}
      <p className="text-sm font-bold tracking-[0.16em] text-carvao uppercase">{a.loja.nome}</p>
      <h1 className="mt-2 text-3xl leading-tight font-bold tracking-tight">{titulo}</h1>
      <p className="mt-2 text-carvao">Pedido #{a.numero ?? ''}</p>

      {!cancelado && (
        <ol className="mt-8 space-y-0" aria-label="Andamento da entrega">
          {passos.map((p, i) => (
            <li key={p.rotulo} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`mt-1 flex size-6 items-center justify-center rounded-full border-2 ${p.feito ? 'border-verde bg-verde' : 'border-areia bg-branco'}`}
                  aria-hidden
                />
                {i < passos.length - 1 && <span className={`w-0.5 flex-1 ${passos[i + 1]!.feito ? 'bg-verde' : 'bg-areia'}`} aria-hidden />}
              </div>
              <div className="pb-8">
                <p className={`font-semibold ${p.feito ? '' : 'text-cinza'}`}>{p.rotulo}</p>
                {p.feito && p.quando && <p className="text-sm text-cinza">{hora.format(new Date(p.quando))}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {a.estado === 'nao_entregue' && !cancelado && (
        <p className="mt-2 rounded-lg bg-ambar-clara p-4 text-sm text-[#8a5806]">A loja vai entrar em contato para combinar uma nova tentativa.</p>
      )}

      <a
        href={`https://wa.me/${a.loja.whatsapp}?text=${encodeURIComponent(`Olá! Sobre o meu pedido #${a.numero ?? ''}`)}`}
        className="mt-8 flex h-14 items-center justify-center rounded-xl bg-tinta text-base font-semibold text-papel hover:bg-carvao"
      >
        Falar com a loja no WhatsApp
      </a>
      <p className="mt-4 text-center text-xs text-cinza">Esta página se atualiza sozinha.</p>
    </main>
  )
}
