'use client'

import { Bell, BellOff } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { PedidoComItens } from '@/lib/dados/pedidos'
import { estaFechado, STATUS_ABERTOS, type StatusPedido } from '@/lib/dominio/pedido'
import { clienteBrowser } from '@/lib/supabase/browser'
import { desbloquearSom, tocarCampainha } from '@/lib/utils/som'
import { cn } from '@/lib/utils/cn'
import { listarPedidos, mudarStatus, obterPedido } from '../actions'
import { CartaoPedido } from './cartao-pedido'

const CHAVE_SOM = 'pvh:som'
const INTERVALO_POLLING_MS = 20_000

type Props = { inicial: PedidoComItens[]; tenantId: string; fuso: string }

/**
 * Lista em tempo real. Realtime do Supabase primeiro; polling de 20 s como
 * reserva. Som e vibração ao entrar pedido novo, se o comerciante activou.
 */
export function ListaPedidos({ inicial, tenantId, fuso }: Props) {
  const [pedidos, setPedidos] = useState(inicial)
  const [som, setSom] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  // O callback do Realtime é criado uma vez; lê o estado do som por esta ref.
  const somRef = useRef(som)
  useEffect(() => {
    somRef.current = som
  }, [som])

  useEffect(() => {
    try {
      if (localStorage.getItem(CHAVE_SOM) === '1') desbloquearSom().then((ok) => setSom(ok))
    } catch {
      // sem armazenamento
    }
  }, [])

  const alternarSom = async () => {
    const novo = !som
    if (novo) {
      const ok = await desbloquearSom()
      if (!ok) return
      tocarCampainha()
    }
    setSom(novo)
    try {
      localStorage.setItem(CHAVE_SOM, novo ? '1' : '0')
    } catch {
      // sem armazenamento
    }
  }

  /** Insere ou substitui; se for novo, toca. */
  const incorporar = useCallback((lista: PedidoComItens[], anunciar: boolean) => {
    setPedidos((atual) => {
      const porId = new Map(atual.map((p) => [p.id, p]))
      let houveNovo = false
      for (const p of lista) {
        if (!porId.has(p.id)) houveNovo = true
        porId.set(p.id, p)
      }
      if (houveNovo && anunciar && somRef.current) tocarCampainha()
      return [...porId.values()].sort((a, b) => b.criado_em.localeCompare(a.criado_em))
    })
  }, [])

  useEffect(() => {
    const supabase = clienteBrowser()
    const canal = supabase
      .channel(`pedidos:${tenantId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pedidos', filter: `tenant_id=eq.${tenantId}` },
        async (evento) => {
          const id = (evento.new as { id: string }).id
          const completo = await obterPedido(id)
          if (completo) incorporar([completo], true)
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `tenant_id=eq.${tenantId}` },
        (evento) => {
          const linha = evento.new as PedidoComItens
          setPedidos((atual) =>
            atual.map((p) => (p.id === linha.id ? { ...p, ...linha, itens_pedido: p.itens_pedido } : p)),
          )
        },
      )
      .subscribe()

    const temporizador = setInterval(async () => {
      try {
        incorporar(await listarPedidos(), true)
      } catch {
        // a próxima volta tenta outra vez
      }
    }, INTERVALO_POLLING_MS)

    return () => {
      clearInterval(temporizador)
      supabase.removeChannel(canal)
    }
  }, [tenantId, incorporar])

  const mudar = async (pedidoId: string, status: StatusPedido) => {
    const anterior = pedidos
    setPedidos((atual) => atual.map((p) => (p.id === pedidoId ? { ...p, status } : p)))
    const r = await mudarStatus({ pedidoId, status })
    if (!r.ok) {
      setPedidos(anterior)
      setErro(r.erro)
    }
  }

  const abertos = STATUS_ABERTOS.map((s) => ({ status: s, lista: pedidos.filter((p) => p.status === s) }))
  const fechados = pedidos.filter((p) => estaFechado(p.status))
  const totalAbertos = abertos.reduce((n, g) => n + g.lista.length, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Pedidos <span className="text-cinza">· {totalAbertos} em aberto</span>
        </h1>
        <button
          type="button"
          onClick={alternarSom}
          aria-pressed={som}
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
            som ? 'border-verde/30 bg-verde-clara text-verde' : 'border-areia bg-branco text-carvao',
          )}
        >
          {som ? <Bell className="size-4" /> : <BellOff className="size-4" />}
          {som ? 'Som ligado' : 'Ligar som'}
        </button>
      </div>

      {erro && (
        <p role="alert" className="rounded-lg bg-vermelho-clara px-4 py-3 text-sm text-vermelho">
          {erro}
        </p>
      )}

      {totalAbertos === 0 && (
        <div className="rounded-lg border border-dashed border-areia px-6 py-14 text-center text-carvao">
          <p className="text-lg font-semibold">Nenhum pedido em aberto</p>
          <p className="mt-1 text-sm">
            Os pedidos da página aparecem aqui na hora, com som se estiver ligado.
          </p>
        </div>
      )}

      {abertos.map(
        ({ status, lista }) =>
          lista.length > 0 && (
            <section key={status} className="flex flex-col gap-3">
              <h2 className="text-xs font-bold tracking-wider text-cinza uppercase">
                {status === 'novo' ? 'Novos' : status === 'aceite' ? 'Em preparo' : 'Prontos'} ·{' '}
                {lista.length}
              </h2>
              {lista.map((p) => (
                <CartaoPedido key={p.id} pedido={p} fuso={fuso} onMudar={mudar} />
              ))}
            </section>
          ),
      )}

      {fechados.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer py-2 text-xs font-bold tracking-wider text-cinza uppercase select-none">
            Finalizados nas últimas 24 h · {fechados.length}
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {fechados.map((p) => (
              <CartaoPedido key={p.id} pedido={p} fuso={fuso} onMudar={mudar} compacto />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
