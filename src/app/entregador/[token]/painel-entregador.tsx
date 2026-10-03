'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, MapPin, MessageCircle, Phone, X } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { AreaTexto } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { PainelDoEntregador } from '@/lib/dados/delivery'
import { formatarEndereco, urlMapa } from '@/lib/dominio/endereco'
import { formatarBRL } from '@/lib/dominio/moeda'
import { normalizarWhatsapp } from '@/lib/dominio/telefone'
import { atualizarPainelEntregadorAction, marcarEntregaAction } from './actions'

const PAGAMENTO: Record<string, string> = { pix: 'Pago no Pix', dinheiro: 'Receber em dinheiro', cartao: 'Receber no cartão' }

export function PainelEntregador({ token, inicial }: { token: string; inicial: PainelDoEntregador }) {
  const [painel, definirPainel] = useState(inicial)
  const [erro, definirErro] = useState('')
  const [falha, definirFalha] = useState<string | null>(null)
  const [motivo, definirMotivo] = useState('')
  const [pendente, iniciar] = useTransition()

  useEffect(() => {
    const id = window.setInterval(async () => {
      if (document.hidden) return
      const r = await atualizarPainelEntregadorAction(token)
      if (r.ok) definirPainel(r.painel)
    }, 30_000)
    return () => window.clearInterval(id)
  }, [token])

  function marcar(entregaId: string, entregue: boolean, ocorrencia: string | null) {
    iniciar(async () => {
      definirErro('')
      const r = await marcarEntregaAction({ token, entregaId, entregue, ocorrencia })
      if (!r.ok) definirErro(r.erro)
      else {
        if (r.painel) definirPainel(r.painel)
        definirFalha(null)
        definirMotivo('')
      }
    })
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md bg-papel px-4 py-6 text-tinta">
      <header className="mb-5">
        <p className="text-sm font-bold tracking-[0.16em] text-carvao uppercase">{painel.loja}</p>
        <h1 className="mt-1 text-2xl font-bold">Olá, {painel.entregador.nome.split(' ')[0]}</h1>
        <p className="mt-2 text-sm text-carvao">
          Hoje: {painel.hoje.entregues} {painel.hoje.entregues === 1 ? 'entrega' : 'entregas'} · a receber{' '}
          <strong>{formatarBRL(painel.hoje.aAcertar.valor)}</strong>
        </p>
      </header>

      <Mensagem tipo="erro">{erro}</Mensagem>

      {painel.entregas.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-areia p-6 text-center text-carvao">
          Nenhuma entrega com você agora. Esta tela se atualiza sozinha.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {painel.entregas.map((e) => {
            const p = e.pedido
            const telefone = p.clienteTelefone ? normalizarWhatsapp(p.clienteTelefone) : null
            return (
              <li key={e.id} className="rounded-xl border border-areia bg-branco p-4">
                <p className="text-lg font-bold">
                  #{p.numero ?? '—'} · {p.clienteNome ?? 'Cliente'}
                </p>
                {p.endereco && (
                  <a href={urlMapa(p.endereco)} target="_blank" rel="noreferrer" className="mt-3 flex items-start gap-2 rounded-lg bg-papel-2 p-3 hover:bg-papel-3">
                    <MapPin className="mt-0.5 size-5 shrink-0" aria-hidden />
                    <span>
                      {formatarEndereco(p.endereco)}
                      {p.endereco.referencia && <span className="block text-sm text-cinza">Ref.: {p.endereco.referencia}</span>}
                      <span className="mt-1 block text-sm font-semibold underline">Abrir no mapa</span>
                    </span>
                  </a>
                )}
                <p className="mt-3 text-base">
                  <strong className="tabular-nums">{formatarBRL(p.total)}</strong> · {PAGAMENTO[p.formaPagamento] ?? p.formaPagamento}
                  {p.trocoPara ? ` · levar troco para ${formatarBRL(p.trocoPara)}` : ''}
                </p>
                {telefone && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a href={`tel:+${telefone}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-areia font-semibold hover:bg-papel-2">
                      <Phone className="size-4" aria-hidden /> Ligar
                    </a>
                    <a
                      href={`https://wa.me/${telefone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-areia font-semibold hover:bg-papel-2"
                    >
                      <MessageCircle className="size-4" aria-hidden /> WhatsApp
                    </a>
                  </div>
                )}

                {falha === e.id ? (
                  <form
                    className="mt-4 space-y-3"
                    onSubmit={(ev) => {
                      ev.preventDefault()
                      marcar(e.id, false, motivo)
                    }}
                  >
                    <AreaTexto name="motivo" rotulo="O que aconteceu?" value={motivo} onChange={(ev) => definirMotivo(ev.target.value)} maxLength={200} required autoFocus />
                    <div className="grid grid-cols-2 gap-2">
                      <Botao type="button" variante="secundario" onClick={() => definirFalha(null)} disabled={pendente}>
                        Voltar
                      </Botao>
                      <Botao type="submit" variante="perigo" carregando={pendente} disabled={!motivo.trim()}>
                        Registrar
                      </Botao>
                    </div>
                  </form>
                ) : (
                  <div className="mt-4 grid grid-cols-[2fr_1fr] gap-2">
                    <Botao variante="sucesso" tamanho="lg" carregando={pendente} onClick={() => marcar(e.id, true, null)} icone={<Check className="size-5" aria-hidden />}>
                      Entreguei
                    </Botao>
                    <Botao variante="secundario" tamanho="lg" disabled={pendente} onClick={() => definirFalha(e.id)} icone={<X className="size-5" aria-hidden />}>
                      Não deu
                    </Botao>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
