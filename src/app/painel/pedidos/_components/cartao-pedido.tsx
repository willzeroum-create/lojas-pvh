'use client'

import { MessageCircle } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Etiqueta } from '@/components/ui/etiqueta'
import type { PedidoComItens } from '@/lib/dados/pedidos'
import { formatarEndereco, type Endereco } from '@/lib/dominio/endereco'
import { formatarBRL } from '@/lib/dominio/moeda'
import {
  ACAO_PARA,
  podeTransitar,
  proximoStatus,
  ROTULO_STATUS,
  type StatusPedido,
} from '@/lib/dominio/pedido'
import { formatarTelefone } from '@/lib/dominio/telefone'
import { ROTULO_PAGAMENTO } from '@/lib/dominio/whatsapp'
import type { OpcaoEscolhida } from '@/lib/dominio/carrinho'
import { cn } from '@/lib/utils/cn'

const TOM: Record<StatusPedido, 'marca' | 'ambar' | 'verde' | 'neutro' | 'vermelho'> = {
  novo: 'marca',
  aceite: 'ambar',
  pronto: 'verde',
  concluido: 'neutro',
  cancelado: 'vermelho',
}

function hora(iso: string, fuso: string) {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: fuso, hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

type Props = {
  pedido: PedidoComItens
  fuso: string
  onMudar: (id: string, status: StatusPedido) => void
  compacto?: boolean
}

/** Um pedido, legível de relance: número, hora, cliente, itens, total e um botão grande para o próximo passo. */
export function CartaoPedido({ pedido, fuso, onMudar, compacto }: Props) {
  const proximo = proximoStatus(pedido.status)
  const endereco = pedido.endereco as Endereco | null
  const telefone = pedido.cliente_telefone

  return (
    <article
      className={cn(
        'rounded-lg border bg-branco p-4 shadow-cartao',
        pedido.status === 'novo' ? 'animate-pulsar border-marca' : 'border-areia/70',
        compacto && 'opacity-80',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl leading-none font-bold">#{pedido.numero ?? '—'}</p>
          <p className="mt-1 text-sm text-cinza">
            {hora(pedido.criado_em, fuso)} · {pedido.tipo_entrega === 'entrega' ? 'Entrega' : 'Retirada'} ·{' '}
            {ROTULO_PAGAMENTO[pedido.forma_pagamento]}
            {pedido.troco_para ? ` (troco p/ ${formatarBRL(Number(pedido.troco_para))})` : ''}
          </p>
        </div>
        <Etiqueta tom={TOM[pedido.status]}>{ROTULO_STATUS[pedido.status]}</Etiqueta>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="font-semibold">{pedido.cliente_nome ?? 'Cliente'}</span>
        {telefone && (
          <a
            href={`https://wa.me/55${telefone}`}
            className="inline-flex h-9 items-center gap-1 font-semibold text-verde"
          >
            <MessageCircle className="size-4" /> {formatarTelefone(telefone)}
          </a>
        )}
      </div>
      {pedido.tipo_entrega === 'entrega' && endereco && (
        <p className="mt-1 text-sm text-carvao">
          {formatarEndereco(endereco)}
          {endereco.referencia && <span className="text-cinza"> · Ref.: {endereco.referencia}</span>}
        </p>
      )}

      {!compacto && (
        <ul className="mt-3 divide-y divide-areia/60 border-y border-areia/60">
          {pedido.itens_pedido.map((item) => {
            const opcoes = (Array.isArray(item.opcoes) ? item.opcoes : []) as OpcaoEscolhida[]
            return (
              <li key={item.id} className="flex gap-3 py-2">
                <span className="w-8 shrink-0 font-display text-lg font-bold tabular-nums">
                  {item.quantidade}×
                </span>
                <div className="min-w-0 flex-1">
                  <p className="leading-snug font-semibold">{item.nome}</p>
                  {opcoes.length > 0 && (
                    <p className="text-sm text-carvao">{opcoes.map((o) => o.nome).join(', ')}</p>
                  )}
                  {item.observacao && (
                    <p className="text-sm font-semibold text-vermelho">Obs: {item.observacao}</p>
                  )}
                </div>
                <span className="text-sm text-carvao tabular-nums">{formatarBRL(Number(item.total))}</span>
              </li>
            )
          })}
        </ul>
      )}
      {pedido.observacoes && (
        <p className="mt-2 text-sm font-semibold text-vermelho">📝 {pedido.observacoes}</p>
      )}

      <footer className="mt-3 flex items-center justify-between gap-3">
        <p className="font-display text-xl font-bold tabular-nums">{formatarBRL(Number(pedido.total))}</p>
        <div className="flex gap-2">
          {podeTransitar(pedido.status, 'cancelado') && (
            <Botao
              variante="perigo"
              tamanho="md"
              onClick={() => {
                if (confirm(`Cancelar o pedido #${pedido.numero}?`)) onMudar(pedido.id, 'cancelado')
              }}
            >
              Cancelar
            </Botao>
          )}
          {proximo && (
            <Botao
              variante={proximo === 'concluido' ? 'sucesso' : 'primario'}
              tamanho="lg"
              onClick={() => onMudar(pedido.id, proximo)}
            >
              {ACAO_PARA[proximo]}
            </Botao>
          )}
        </div>
      </footer>
    </article>
  )
}
