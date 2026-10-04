'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Bike, Check, MapPin, MessageCircle, RotateCcw, Settings2, X } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { AreaTexto, Seleccao } from '@/components/ui/campo'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import type { EntregaNoPainel } from '@/lib/dados/delivery'
import { ROTULO_ENTREGA } from '@/lib/dominio/delivery'
import { formatarEndereco, urlMapa } from '@/lib/dominio/endereco'
import { formatarBRL } from '@/lib/dominio/moeda'
import { normalizarWhatsapp } from '@/lib/dominio/telefone'
import { concluirEntregaAction, despacharAction, devolverEntregaAction, quadroDeEntregasAction } from '../actions'

const hora = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Porto_Velho' })
const PAGAMENTO: Record<string, string> = { pix: 'Pix', dinheiro: 'Dinheiro', cartao: 'Cartão na entrega' }

function minutosDesde(iso: string, agora: number) {
  return Math.max(0, Math.round((agora - new Date(iso).getTime()) / 60_000))
}

export function QuadroEntregas({
  entregasIniciais,
  entregadores,
  podeGerir,
  nomeLoja,
  base,
}: {
  entregasIniciais: EntregaNoPainel[]
  entregadores: Array<{ id: string; nome: string }>
  podeGerir: boolean
  nomeLoja: string
  base: string
}) {
  const [entregas, definirEntregas] = useState(entregasIniciais)
  const [erro, definirErro] = useState('')
  const [agora, definirAgora] = useState(() => Date.now())
  const [naoEntregue, definirNaoEntregue] = useState<EntregaNoPainel | null>(null)

  // Actualiza sozinho: pedidos novos do cardápio e o que os entregadores marcam no celular.
  useEffect(() => {
    let vivo = true
    const tique = async () => {
      definirAgora(Date.now())
      if (document.hidden) return
      const r = await quadroDeEntregasAction()
      if (vivo && r.ok) definirEntregas(r.entregas)
    }
    const id = window.setInterval(tique, 20_000)
    return () => {
      vivo = false
      window.clearInterval(id)
    }
  }, [])

  async function recarregar() {
    const r = await quadroDeEntregasAction()
    if (r.ok) definirEntregas(r.entregas)
  }

  const colunas: Array<{ titulo: string; itens: EntregaNoPainel[]; vazio: string }> = [
    {
      titulo: 'Para sair',
      itens: entregas.filter((e) => e.estado === 'aguardando' || e.estado === 'nao_entregue'),
      vazio: 'Nenhuma entrega esperando.',
    },
    { titulo: 'Em rota', itens: entregas.filter((e) => e.estado === 'em_rota'), vazio: 'Ninguém na rua agora.' },
    { titulo: 'Entregues (24 h)', itens: entregas.filter((e) => e.estado === 'entregue').reverse(), vazio: 'Ainda nada hoje.' },
  ]

  return (
    <div className="min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">Operação / Delivery</p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-4xl">Entregas</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-carvao">
            Pedidos de entrega entram aqui sozinhos. Escolha o entregador, e ele marca a entrega pelo celular.
          </p>
        </div>
        {podeGerir && (
          <Link
            href="/painel/delivery/configuracao"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-areia bg-branco px-4 text-sm font-bold hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
          >
            <Settings2 className="size-4" aria-hidden />
            Bairros e entregadores
          </Link>
        )}
      </header>

      {entregadores.length === 0 && (
        <Mensagem tipo="info">
          Cadastre pelo menos um entregador {podeGerir ? 'em “Bairros e entregadores”' : '(peça ao gerente)'} para despachar.
        </Mensagem>
      )}
      <Mensagem tipo="erro">{erro}</Mensagem>

      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {colunas.map((coluna) => (
          <section key={coluna.titulo} aria-label={coluna.titulo} className="min-w-0 space-y-3">
            <h2 className="flex items-center justify-between text-sm font-bold tracking-wide text-carvao uppercase">
              {coluna.titulo}
              <span className="rounded-md bg-papel-3 px-2 py-0.5 text-xs tabular-nums">{coluna.itens.length}</span>
            </h2>
            {coluna.itens.length === 0 ? (
              <p className="rounded-xl border border-dashed border-areia p-5 text-sm text-cinza">{coluna.vazio}</p>
            ) : (
              coluna.itens.map((e) => (
                <CartaoEntrega
                  key={e.id}
                  entrega={e}
                  entregadores={entregadores}
                  agora={agora}
                  nomeLoja={nomeLoja}
                  base={base}
                  aoErro={definirErro}
                  aoMudar={recarregar}
                  aoNaoEntregue={() => definirNaoEntregue(e)}
                />
              ))
            )}
          </section>
        ))}
      </div>

      {naoEntregue && (
        <DialogoNaoEntregue
          entrega={naoEntregue}
          fechar={() => definirNaoEntregue(null)}
          aoConcluir={async () => {
            definirNaoEntregue(null)
            await recarregar()
          }}
        />
      )}
    </div>
  )
}

function CartaoEntrega({
  entrega: e,
  entregadores,
  agora,
  nomeLoja,
  base,
  aoErro,
  aoMudar,
  aoNaoEntregue,
}: {
  entrega: EntregaNoPainel
  entregadores: Array<{ id: string; nome: string }>
  agora: number
  nomeLoja: string
  base: string
  aoErro: (m: string) => void
  aoMudar: () => Promise<void>
  aoNaoEntregue: () => void
}) {
  const [escolhido, definirEscolhido] = useState(e.entregador?.id ?? entregadores[0]?.id ?? '')
  const [pendente, iniciar] = useTransition()
  const p = e.pedido
  const espera = minutosDesde(p.criadoEm, agora)
  const atrasado = e.estado !== 'entregue' && espera >= 45
  const telefone = p.clienteTelefone ? normalizarWhatsapp(p.clienteTelefone) : null
  const linkCliente = `${base}/entrega/${e.codigo}`
  const avisar = telefone
    ? `https://wa.me/${telefone}?text=${encodeURIComponent(`Olá${p.clienteNome ? `, ${p.clienteNome.split(' ')[0]}` : ''}! Seu pedido #${p.numero ?? ''} da ${nomeLoja} saiu para entrega. Acompanhe: ${linkCliente}`)}`
    : null

  function executar(acao: () => Promise<{ ok: boolean; erro?: string }>) {
    iniciar(async () => {
      aoErro('')
      const r = await acao()
      if (!r.ok) aoErro(r.erro ?? 'Não foi possível concluir.')
      await aoMudar()
    })
  }

  return (
    <article
      className={`rounded-xl border bg-branco p-4 ${atrasado ? 'border-ambar' : 'border-areia'} ${p.status === 'cancelado' ? 'opacity-60' : ''}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold">
            #{p.numero ?? '—'} <span className="font-semibold text-carvao">{p.clienteNome ?? 'Cliente'}</span>
          </p>
          <p className={`text-sm ${atrasado ? 'font-bold text-[#8a5806]' : 'text-cinza'}`}>
            Pedido às {hora.format(new Date(p.criadoEm))} · há {espera} min
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-papel-2 px-2 py-1 text-xs font-bold text-carvao">{ROTULO_ENTREGA[e.estado]}</span>
      </header>

      {p.status === 'cancelado' && <Mensagem tipo="erro" className="mt-3">Pedido cancelado — não sai para entrega.</Mensagem>}

      {p.endereco && (
        <a
          href={urlMapa(p.endereco)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-start gap-2 rounded-lg bg-papel-2 p-3 text-sm hover:bg-papel-3"
        >
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            {formatarEndereco(p.endereco)}
            {p.endereco.referencia && <span className="block text-cinza">Ref.: {p.endereco.referencia}</span>}
          </span>
        </a>
      )}

      <p className="mt-3 text-sm">
        <strong className="text-base tabular-nums">{formatarBRL(p.total)}</strong> · {PAGAMENTO[p.formaPagamento] ?? p.formaPagamento}
        {p.trocoPara ? ` · troco para ${formatarBRL(p.trocoPara)}` : ''}
      </p>
      {e.entregador && (
        <p className="mt-1 flex items-center gap-1.5 text-sm text-carvao">
          <Bike className="size-4" aria-hidden />
          {e.entregador.nome}
          {e.saiuEm && ` · saiu ${hora.format(new Date(e.saiuEm))}`}
          {e.entregueEm && ` · entregue ${hora.format(new Date(e.entregueEm))}`}
        </p>
      )}
      {e.ocorrencia && <p className="mt-2 rounded-lg bg-vermelho-clara px-3 py-2 text-sm text-vermelho">{e.ocorrencia}</p>}

      {p.status !== 'cancelado' && e.estado !== 'entregue' && (
        <div className="mt-4 space-y-2">
          {(e.estado === 'aguardando' || e.estado === 'nao_entregue') && entregadores.length > 0 && (
            <div className="flex gap-2">
              <Seleccao
                aria-label="Entregador"
                className="min-w-0 flex-1"
                value={escolhido}
                onChange={(ev) => definirEscolhido(ev.target.value)}
              >
                {entregadores.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.nome}
                  </option>
                ))}
              </Seleccao>
              <Botao carregando={pendente} disabled={!escolhido} onClick={() => executar(() => despacharAction(e.id, escolhido))} icone={<Bike className="size-4" aria-hidden />}>
                Saiu
              </Botao>
            </div>
          )}
          {e.estado === 'em_rota' && (
            <div className="grid grid-cols-2 gap-2">
              <Botao
                variante="sucesso"
                carregando={pendente}
                onClick={() => executar(() => concluirEntregaAction({ entregaId: e.id, entregue: true, ocorrencia: null }))}
                icone={<Check className="size-4" aria-hidden />}
              >
                Entregue
              </Botao>
              <Botao variante="secundario" disabled={pendente} onClick={aoNaoEntregue} icone={<X className="size-4" aria-hidden />}>
                Não entregue
              </Botao>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {e.estado !== 'aguardando' && (
              <Botao variante="fantasma" tamanho="sm" disabled={pendente} onClick={() => executar(() => devolverEntregaAction(e.id))} icone={<RotateCcw className="size-4" aria-hidden />}>
                Voltar para a fila
              </Botao>
            )}
            {avisar && e.estado === 'em_rota' && (
              <a
                href={avisar}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-md px-3.5 text-sm font-semibold text-carvao hover:bg-papel-2"
              >
                <MessageCircle className="size-4" aria-hidden />
                Avisar o cliente
              </a>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function DialogoNaoEntregue({ entrega, fechar, aoConcluir }: { entrega: EntregaNoPainel; fechar: () => void; aoConcluir: () => Promise<void> }) {
  const [motivo, definirMotivo] = useState('')
  const [erro, definirErro] = useState('')
  const [pendente, iniciar] = useTransition()
  const sugestoes = ['Cliente não atendeu', 'Endereço não encontrado', 'Cliente recusou', 'Problema com o pagamento']
  return (
    <DialogoOperacao titulo={`Pedido #${entrega.pedido.numero ?? ''} não entregue`} fechar={fechar} ocupado={pendente}>
      <form
        className="space-y-4"
        onSubmit={(ev) => {
          ev.preventDefault()
          iniciar(async () => {
            const r = await concluirEntregaAction({ entregaId: entrega.id, entregue: false, ocorrencia: motivo })
            if (!r.ok) definirErro(r.erro)
            else await aoConcluir()
          })
        }}
      >
        <div className="flex flex-wrap gap-2">
          {sugestoes.map((s) => (
            <button key={s} type="button" onClick={() => definirMotivo(s)} className="rounded-full border border-areia bg-branco px-3 py-2 text-sm hover:bg-papel-2">
              {s}
            </button>
          ))}
        </div>
        <AreaTexto name="ocorrencia" rotulo="O que aconteceu?" value={motivo} onChange={(ev) => definirMotivo(ev.target.value)} maxLength={200} required />
        <Mensagem tipo="erro">{erro}</Mensagem>
        <Botao type="submit" cheio carregando={pendente} disabled={!motivo.trim()}>
          Registrar
        </Botao>
      </form>
    </DialogoOperacao>
  )
}
