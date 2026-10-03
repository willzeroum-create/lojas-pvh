'use client'

import { ArrowRight, Clock3, Plus, RefreshCw, Settings2, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react'
import type { MesaMapa } from '@/lib/dados/comandas'
import { formatarBRL } from '@/lib/dominio/moeda'
import { DialogoPdv } from '../../pdv/_components/dialogo-pdv'
import { abrirComandaAction } from '../actions'
import { AvisoComanda, BOTAO_COMANDA, CAMPO_COMANDA, PRIMARIO_COMANDA, tempoAberto } from './apresentacao'

type Avulsa = {
  id: string
  identificador: string | null
  pessoas: number
  estado: string
  aberta_em: string
  total: number
}
const ESTADOS = {
  livre: {
    nome: 'Livre',
    estilo: 'border-verde/50 bg-verde-clara/60',
    etiqueta: 'bg-verde-clara text-[#176b3a]',
  },
  ocupada: {
    nome: 'Ocupada',
    estilo: 'border-tangerina/60 bg-tangerina-clara/45',
    etiqueta: 'bg-tangerina-clara text-[#a6350c]',
  },
  conta: {
    nome: 'Conta pedida',
    estilo: 'border-ambar/60 bg-ambar-clara/65',
    etiqueta: 'bg-ambar-clara text-[#805000]',
  },
} as const

export function MapaComandas({
  mesas,
  avulsas,
  agoraInicial,
  temCozinha,
}: {
  mesas: MesaMapa[]
  avulsas: Avulsa[]
  agoraInicial: number
  temCozinha: boolean
}) {
  const router = useRouter()
  const [agora, definirAgora] = useState(agoraInicial)
  const [area, definirArea] = useState('')
  const [estado, definirEstado] = useState('todos')
  const [abrindo, definirAbrindo] = useState<string | null>(null)
  const [atualizando, atualizar] = useTransition()
  const operacionais = mesas.filter((mesa) => mesa.ativa || mesa.comanda)
  const areas = [...new Set(operacionais.map((mesa) => mesa.area || 'Sem área'))]
  const visiveis = operacionais.filter(
    (mesa) => (!area || (mesa.area || 'Sem área') === area) && (estado === 'todos' || mesa.estado === estado),
  )
  const selecionada = mesas.find((mesa) => mesa.id === abrindo)
  const total =
    operacionais.reduce((soma, mesa) => soma + (mesa.comanda?.total ?? 0), 0) +
    avulsas.reduce((soma, avulsa) => soma + avulsa.total, 0)
  const pessoas =
    operacionais.reduce((soma, mesa) => soma + (mesa.comanda?.pessoas ?? 0), 0) +
    avulsas.reduce((soma, avulsa) => soma + avulsa.pessoas, 0)

  useEffect(() => {
    const relogio = window.setInterval(() => definirAgora(Date.now()), 1000)
    const recarregar = () => {
      if (document.visibilityState === 'visible') atualizar(() => router.refresh())
    }
    const consulta = window.setInterval(recarregar, 10000)
    document.addEventListener('visibilitychange', recarregar)
    return () => {
      window.clearInterval(relogio)
      window.clearInterval(consulta)
      document.removeEventListener('visibilitychange', recarregar)
    }
  }, [router])

  return (
    <div className="comandas-area mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seu negócio / Atendimento
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mesas e comandas</h1>
          <p className="mt-2 text-sm text-carvao">Da primeira rodada ao fechamento da conta.</p>
        </div>
        <button type="button" onClick={() => definirAbrindo('avulsa')} className={PRIMARIO_COMANDA}>
          <Plus aria-hidden className="size-5" />
          Nova comanda avulsa
        </button>
      </header>

      <section aria-label="Resumo do atendimento" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 rounded-xl bg-tinta p-5 text-papel lg:col-span-1">
          <p className="text-xs font-bold tracking-wide uppercase">Em atendimento</p>
          <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{formatarBRL(total)}</p>
          <p className="mt-2 text-xs text-papel-3">Total das contas abertas</p>
        </div>
        <Resumo
          valor={String(operacionais.filter((mesa) => mesa.estado === 'livre').length)}
          rotulo="Mesas livres"
        />
        <Resumo
          valor={String(
            operacionais.filter((mesa) => mesa.estado === 'conta').length +
              avulsas.filter((avulsa) => avulsa.estado === 'conta').length,
          )}
          rotulo="Contas pedidas"
        />
        <div className="col-span-2 lg:col-span-1">
          <Resumo valor={String(pessoas)} rotulo="Pessoas em atendimento" />
        </div>
      </section>

      <section aria-labelledby="mapa-titulo" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="mapa-titulo" className="text-xl font-bold">
            Salão <span className="ml-2 text-sm font-normal text-carvao">{operacionais.length} mesas</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={atualizando}
              onClick={() => atualizar(() => router.refresh())}
              className={BOTAO_COMANDA}
              aria-label="Atualizar mesas e comandas"
            >
              <RefreshCw aria-hidden className="size-4" />
              {atualizando ? 'Atualizando…' : 'Atualizar'}
            </button>
            <Link href="/painel/comandas/mesas" className={BOTAO_COMANDA}>
              <Settings2 aria-hidden className="size-4" />
              Gerir mesas
            </Link>
            {temCozinha && (
              <Link href="/painel/cozinha" className={BOTAO_COMANDA}>
                Cozinha
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div
            className="flex max-w-full gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label="Filtrar mesas por estado"
          >
            {(['todos', 'livre', 'ocupada', 'conta'] as const).map((valor) => (
              <button
                key={valor}
                type="button"
                aria-pressed={estado === valor}
                onClick={() => definirEstado(valor)}
                className={`${BOTAO_COMANDA} shrink-0 ${estado === valor ? '!border-tinta !bg-tinta !text-papel' : ''}`}
              >
                {valor === 'todos' ? 'Todas' : ESTADOS[valor].nome}
              </button>
            ))}
          </div>
          {(areas.length > 1 || area) && (
            <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm font-semibold sm:max-w-60">
              Área
              <select
                className={CAMPO_COMANDA}
                value={area}
                onChange={(evento) => definirArea(evento.target.value)}
              >
                <option value="">Todas as áreas</option>
                {areas.map((nome) => (
                  <option key={nome}>{nome}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        {visiveis.length ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {visiveis.map((mesa) => (
              <li key={mesa.id} className="min-w-0">
                {mesa.comanda ? (
                  <Link
                    href={`/painel/comandas/${mesa.comanda.id}`}
                    className={`comanda-mesa ${ESTADOS[mesa.estado].estilo}`}
                  >
                    <ConteudoMesa mesa={mesa} agora={agora} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => definirAbrindo(mesa.id)}
                    className={`comanda-mesa ${ESTADOS[mesa.estado].estilo}`}
                    aria-haspopup="dialog"
                  >
                    <ConteudoMesa mesa={mesa} agora={agora} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-areia bg-branco p-6 sm:p-10">
            <h3 className="text-lg font-bold">
              {operacionais.length ? 'Nenhuma mesa neste filtro' : 'Prepare o salão para receber'}
            </h3>
            <p className="mt-2 text-sm text-carvao">
              {operacionais.length
                ? 'Escolha outra área ou estado para ver as mesas.'
                : 'Cadastre as mesas com número, área e quantidade de lugares.'}
            </p>
            {operacionais.length ? (
              <button
                className={`${BOTAO_COMANDA} mt-5`}
                onClick={() => {
                  definirArea('')
                  definirEstado('todos')
                }}
              >
                Limpar filtros
              </button>
            ) : (
              <Link href="/painel/comandas/mesas" className={`${BOTAO_COMANDA} mt-5`}>
                Cadastrar mesas
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            )}
          </div>
        )}
        <p className="text-xs text-carvao">
          Atualização automática a cada 10 segundos. Toque em uma mesa livre para abrir a comanda.
        </p>
      </section>

      <section aria-labelledby="avulsas-titulo" className="space-y-4 border-t border-areia pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="avulsas-titulo" className="text-xl font-bold">
              Comandas avulsas <span className="ml-2 text-sm font-normal text-carvao">{avulsas.length}</span>
            </h2>
            <p className="mt-1 text-sm text-carvao">Cartão, pulseira ou atendimento sem mesa.</p>
          </div>
          <button className={BOTAO_COMANDA} onClick={() => definirAbrindo('avulsa')} aria-haspopup="dialog">
            <Plus aria-hidden className="size-4" />
            Nova avulsa
          </button>
        </div>
        {avulsas.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {avulsas.map((avulsa) => (
              <li key={avulsa.id}>
                <Link
                  href={`/painel/comandas/${avulsa.id}`}
                  className="flex h-full min-h-32 flex-col gap-3 rounded-xl border border-areia bg-branco p-4 hover:border-tinta"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="text-lg font-bold">{avulsa.identificador || 'Comanda avulsa'}</span>
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-bold ${ESTADOS[avulsa.estado === 'conta' ? 'conta' : 'ocupada'].etiqueta}`}
                    >
                      {avulsa.estado === 'conta' ? 'Conta pedida' : 'Aberta'}
                    </span>
                  </div>
                  <span className="text-sm text-carvao">
                    {avulsa.pessoas} {avulsa.pessoas === 1 ? 'pessoa' : 'pessoas'} ·{' '}
                    {tempoAberto(avulsa.aberta_em, agora)}
                  </span>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-xl font-bold tabular-nums">{formatarBRL(avulsa.total)}</span>
                    <ArrowRight aria-hidden className="size-5" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-areia bg-branco p-5 text-sm text-carvao">
            Nenhuma comanda avulsa aberta.
          </p>
        )}
      </section>
      {abrindo && (
        <AbrirComanda
          key={abrindo}
          mesa={selecionada}
          mesaId={abrindo === 'avulsa' ? undefined : abrindo}
          fechar={() => definirAbrindo(null)}
        />
      )}
    </div>
  )
}

function Resumo({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <div className="h-full rounded-xl border border-areia bg-branco p-5">
      <p className="text-xs font-bold tracking-wide text-carvao uppercase">{rotulo}</p>
      <p className="mt-3 text-3xl font-bold tabular-nums">{valor}</p>
    </div>
  )
}

function ConteudoMesa({ mesa, agora }: { mesa: MesaMapa; agora: number }) {
  return (
    <>
      <span className={`self-start rounded-md px-2 py-1 text-xs font-bold ${ESTADOS[mesa.estado].etiqueta}`}>
        {ESTADOS[mesa.estado].nome}
      </span>
      <span className="mt-3 text-xs font-bold tracking-wider text-carvao uppercase">Mesa</span>
      <span className="text-4xl leading-none font-bold tracking-tight tabular-nums sm:text-5xl">
        {mesa.numero}
      </span>
      <span className="mt-2 text-xs text-carvao">
        {mesa.area || 'Sem área'}
        {!mesa.ativa ? ' · Inativa' : ''}
      </span>
      <span className="mt-4 flex items-center gap-1.5 text-sm">
        <Users aria-hidden className="size-4 shrink-0" />
        {mesa.comanda
          ? `${mesa.comanda.pessoas} ${mesa.comanda.pessoas === 1 ? 'pessoa' : 'pessoas'}`
          : `${mesa.lugares} lugares`}
      </span>
      {mesa.comanda ? (
        <>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-carvao">
            <Clock3 aria-hidden className="size-3.5 shrink-0" />
            {tempoAberto(mesa.comanda.abertaEm, agora)}
          </span>
          <span className="mt-3 border-t border-current/15 pt-3 text-lg font-bold tabular-nums sm:text-xl">
            {formatarBRL(mesa.comanda.total)}
          </span>
        </>
      ) : (
        <span className="mt-auto flex min-h-12 items-center justify-between gap-1 border-t border-verde/20 pt-3 text-sm font-bold text-[#176b3a]">
          Abrir mesa
          <Plus aria-hidden className="size-4" />
        </span>
      )}
    </>
  )
}

function AbrirComanda({ mesa, mesaId, fechar }: { mesa?: MesaMapa; mesaId?: string; fechar: () => void }) {
  const router = useRouter()
  const [pessoas, definirPessoas] = useState('1')
  const [identificador, definirIdentificador] = useState('')
  const [erro, definirErro] = useState('')
  const [campos, definirCampos] = useState<Record<string, string>>({})
  const [respostaIncerta, definirRespostaIncerta] = useState(false)
  const [pendente, iniciar] = useTransition()
  const trava = useRef(false)
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (trava.current || respostaIncerta || mesa?.comanda || (mesaId && !mesa?.ativa)) return
    trava.current = true
    definirErro('')
    definirCampos({})
    iniciar(async () => {
      try {
        const resultado = await abrirComandaAction({
          mesaId: mesa?.id,
          identificador: mesa ? undefined : identificador,
          pessoas: Number(pessoas),
        })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          definirCampos(resultado.porCampo ?? {})
          return
        }
        router.push(`/painel/comandas/${resultado.comandaId}`)
        fechar()
      } catch {
        definirErro('Não foi possível confirmar a abertura. Atualize o mapa antes de tentar novamente.')
        definirRespostaIncerta(true)
      } finally {
        trava.current = false
      }
    })
  }
  return (
    <DialogoPdv
      titulo={mesa ? `Abrir mesa ${mesa.numero}` : mesaId ? 'Mesa indisponível' : 'Nova comanda avulsa'}
      fechar={fechar}
      ocupado={pendente}
    >
      <form onSubmit={enviar} className="comandas-area space-y-5">
        {erro && <AvisoComanda erro>{erro}</AvisoComanda>}
        {respostaIncerta ? (
          <button
            type="button"
            className={`${BOTAO_COMANDA} w-full`}
            onClick={() => {
              router.refresh()
              fechar()
            }}
          >
            Atualizar e conferir comandas
          </button>
        ) : mesa?.comanda ? (
          <AvisoComanda>
            Esta mesa acabou de ser ocupada.{' '}
            <Link
              href={`/painel/comandas/${mesa.comanda.id}`}
              className="inline-flex min-h-12 items-center font-bold underline"
            >
              Abrir a comanda existente
            </Link>
          </AvisoComanda>
        ) : mesaId && !mesa?.ativa ? (
          <AvisoComanda>
            Esta mesa foi desativada ou não está mais disponível. Volte ao mapa e escolha outra mesa.
          </AvisoComanda>
        ) : (
          <>
            {mesa ? (
              <p className="text-sm text-carvao">
                {mesa.area || 'Sem área'} · {mesa.lugares} lugares. A comanda fica vinculada a esta mesa.
              </p>
            ) : (
              <label className="flex flex-col gap-2 text-sm font-bold" htmlFor="abrir-identificador">
                Número ou identificação
                <input
                  id="abrir-identificador"
                  data-foco-inicial
                  className={CAMPO_COMANDA}
                  placeholder="Ex.: Cartão 24"
                  value={identificador}
                  onChange={(evento) => definirIdentificador(evento.target.value)}
                  required
                  maxLength={30}
                  disabled={pendente}
                  aria-invalid={Boolean(campos.identificador)}
                  aria-describedby={campos.identificador ? 'erro-identificador' : undefined}
                />
                {campos.identificador && (
                  <span id="erro-identificador" className="text-[#a82a1a]">
                    {campos.identificador}
                  </span>
                )}
              </label>
            )}
            <label className="flex flex-col gap-2 text-sm font-bold" htmlFor="abrir-pessoas">
              Quantas pessoas?
              <input
                id="abrir-pessoas"
                data-foco-inicial={mesa ? true : undefined}
                className={CAMPO_COMANDA}
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                step={1}
                required
                value={pessoas}
                onChange={(evento) => definirPessoas(evento.target.value)}
                disabled={pendente}
                aria-invalid={Boolean(campos.pessoas)}
                aria-describedby={campos.pessoas ? 'erro-pessoas' : undefined}
              />
              {campos.pessoas && (
                <span id="erro-pessoas" className="text-[#a82a1a]">
                  {campos.pessoas}
                </span>
              )}
            </label>
            <button
              type="submit"
              className={`${PRIMARIO_COMANDA} w-full`}
              disabled={pendente}
              aria-busy={pendente}
            >
              {pendente ? 'Abrindo…' : 'Abrir e lançar pedidos'}
              <ArrowRight aria-hidden className="size-4" />
            </button>
          </>
        )}
      </form>
    </DialogoPdv>
  )
}
