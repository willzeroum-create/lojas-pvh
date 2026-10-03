'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, Check, Maximize, Minimize, Users } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Mensagem } from '@/components/ui/mensagem'
import { TecladoPin } from '@/components/ui/teclado-pin'
import type { PessoaNoRelogio } from '@/lib/dados/ponto'
import { ROTULO_BATIDA, type TipoBatida } from '@/lib/dominio/ponto'
import { baterPontoAction, pessoasNoRelogioAction } from '../actions'
import { BOTAO_PONTO, horaPonto } from './apresentacao'

type Sucesso = { nome: string; rotulo: string; momento: string; comFoto: boolean }
type Localizacao = { latitude?: number; longitude?: number; precisao?: number }

function localizar(): Promise<Localizacao> {
  return new Promise((resolver) => {
    if (!navigator.geolocation) return resolver({})
    let terminou = false
    const finalizar = (local: Localizacao) => {
      if (terminou) return
      terminou = true
      window.clearTimeout(limite)
      resolver(local)
    }
    // Alguns aparelhos mantêm a permissão aberta: o limite também vale nesse caso.
    const limite = window.setTimeout(() => finalizar({}), 5_000)
    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => finalizar({ latitude: coords.latitude, longitude: coords.longitude, precisao: coords.accuracy }),
        () => finalizar({}),
        { timeout: 5_000, maximumAge: 60_000, enableHighAccuracy: false },
      )
    } catch { finalizar({}) }
  })
}

function capturarFoto(video: HTMLVideoElement | null) {
  if (!video || video.readyState < 2 || !video.videoWidth) return undefined
  const canvas = document.createElement('canvas')
  canvas.width = Math.min(480, video.videoWidth)
  canvas.height = Math.round(video.videoHeight * canvas.width / video.videoWidth)
  const contexto = canvas.getContext('2d')
  if (!contexto) return undefined
  contexto.drawImage(video, 0, 0, canvas.width, canvas.height)
  // Mantém margem abaixo dos 512 KB, inclusive contando a representação base64.
  for (const qualidade of [0.7, 0.55, 0.4]) {
    const foto = canvas.toDataURL('image/jpeg', qualidade)
    if (foto.length < 512 * 1024) return foto
  }
  return undefined
}

function Marcacao({ pessoa, voltar, concluir }: { pessoa: PessoaNoRelogio; voltar: () => void; concluir: (sucesso: Sucesso, pessoas: PessoaNoRelogio[]) => void }) {
  const [tipo, definirTipo] = useState<TipoBatida | null>(null)
  const [pin, definirPin] = useState('')
  const [camera, definirCamera] = useState<'abrindo' | 'pronta' | 'indisponivel'>('abrindo')
  const [ocupado, definirOcupado] = useState(false)
  const [erro, definirErro] = useState('')
  const video = useRef<HTMLVideoElement>(null)
  const fluxo = useRef<MediaStream | null>(null)
  const enviando = useRef(false)
  const ativo = useRef(true)
  const formulario = useRef<HTMLFormElement>(null)

  useEffect(() => {
    ativo.current = true
    let cancelado = false
    function parar() {
      fluxo.current?.getTracks().forEach((faixa) => faixa.stop())
      fluxo.current = null
    }
    async function abrir() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Câmera indisponível')
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false })
        if (cancelado) {
          stream.getTracks().forEach((faixa) => faixa.stop())
          return
        }
        fluxo.current = stream
        if (video.current) {
          video.current.srcObject = stream
          await video.current.play()
        }
        if (!cancelado) definirCamera('pronta')
      } catch {
        parar()
        if (!cancelado) definirCamera('indisponivel')
      }
    }
    void abrir()
    window.addEventListener('pagehide', parar)
    return () => {
      cancelado = true
      ativo.current = false
      parar()
      window.removeEventListener('pagehide', parar)
    }
  }, [])

  useEffect(() => {
    if (tipo) formulario.current?.querySelector<HTMLElement>('[data-teclado-pin]')?.focus()
  }, [tipo])

  async function confirmar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!tipo || !/^\d{4,6}$/.test(pin) || enviando.current) return
    enviando.current = true
    definirOcupado(true)
    definirErro('')
    try {
      const foto = capturarFoto(video.current)
      const local = await localizar()
      if (!ativo.current) return
      const resultado = await baterPontoAction({ membroId: pessoa.id, pin, tipo, foto, ...local, dispositivo: navigator.userAgent.slice(0, 200) })
      if (!ativo.current) return
      if (resultado.ok) {
        fluxo.current?.getTracks().forEach((faixa) => faixa.stop())
        concluir(resultado, resultado.pessoas)
      } else {
        definirErro(resultado.erro)
        definirPin('')
        formulario.current?.querySelector<HTMLElement>('[data-teclado-pin]')?.focus()
      }
    } catch {
      if (ativo.current) definirErro('Não foi possível confirmar. Confira a conexão e o último registro antes de tentar de novo.')
    } finally {
      enviando.current = false
      if (ativo.current) definirOcupado(false)
    }
  }

  return (
    <div className="space-y-5">
      <button type="button" onClick={voltar} disabled={ocupado} className={BOTAO_PONTO}><ArrowLeft aria-hidden className="size-5" /> Trocar pessoa / cancelar</button>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-4">
          <div><p className="text-base text-carvao">Seu registro de agora</p><h2 className="mt-1 text-3xl font-bold break-words sm:text-4xl">{pessoa.nome}</h2></div>
          <div className="relative overflow-hidden rounded-xl bg-tinta">
            <video ref={video} muted autoPlay playsInline aria-label="Prévia espelhada da câmera" className="aspect-[4/3] max-h-60 w-full -scale-x-100 object-cover md:max-h-none" />
            {camera !== 'pronta' && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center text-papel"><Camera aria-hidden className="size-8" /><p>{camera === 'abrindo' ? 'Abrindo câmera…' : 'Câmera indisponível'}</p></div>}
          </div>
          <p aria-live="polite" className="text-sm leading-relaxed text-carvao">{camera === 'pronta' ? 'A foto será capturada ao confirmar seu ponto.' : camera === 'abrindo' ? 'Se a câmera não abrir, você pode registrar sem foto.' : 'Você pode registrar normalmente, sem foto.'}</p>
        </div>
        <div className="min-w-0 space-y-4">
          <div><p className="mb-3 text-lg font-bold">1. O que você vai registrar?</p><div className="grid gap-3">{pessoa.proximas.map((opcao, indice) => <button key={opcao} type="button" disabled={ocupado} aria-pressed={tipo === opcao} onClick={() => { definirTipo(opcao); definirErro(''); definirPin('') }} className={`flex min-h-20 items-center justify-between gap-3 rounded-xl border-2 p-4 text-left text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:opacity-50 ${tipo === opcao ? 'border-tinta bg-tinta text-papel' : indice === 0 ? 'border-tangerina bg-tangerina/10 text-tinta' : 'border-areia bg-branco'}`}><span>{ROTULO_BATIDA[opcao]}{indice === 0 && <span className={`mt-1 block text-sm font-medium ${tipo === opcao ? 'text-papel-3' : 'text-carvao'}`}>Próximo registro sugerido</span>}</span>{tipo === opcao ? <Check aria-hidden className="size-6 shrink-0" /> : <ArrowRight aria-hidden className="size-6 shrink-0" />}</button>)}</div></div>
          {tipo && <form ref={formulario} onSubmit={confirmar} className="space-y-4"><TecladoPin valor={pin} onChange={definirPin} desabilitado={ocupado} rotulo="2. Digite seu PIN" />{erro && <Mensagem tipo="erro">{erro}</Mensagem>}<Botao type="submit" cheio tamanho="lg" carregando={ocupado} disabled={pin.length < 4}>Confirmar {ROTULO_BATIDA[tipo].toLowerCase()}</Botao><p role="status" aria-live="polite" className="text-sm text-carvao">{ocupado ? 'Registrando seu ponto. Aguarde…' : 'Horário de Porto Velho. A localização é opcional.'}</p></form>}
          {!pessoa.proximas.length && <Mensagem tipo="info">Nenhum registro disponível. Atualize a lista ou peça ajuda ao gerente.</Mensagem>}
        </div>
      </div>
    </div>
  )
}

export function RelogioPonto({ pessoasIniciais, gestao, agoraInicial, empresa }: { pessoasIniciais: PessoaNoRelogio[]; gestao: boolean; agoraInicial: string; empresa: string }) {
  const [pessoas, definirPessoas] = useState(pessoasIniciais)
  const [pessoa, definirPessoa] = useState<PessoaNoRelogio | null>(null)
  const [agora, definirAgora] = useState(agoraInicial)
  const [sucesso, definirSucesso] = useState<Sucesso | null>(null)
  const [aviso, definirAviso] = useState('')
  const [telaCheia, definirTelaCheia] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const versao = useRef(0)

  useEffect(() => {
    const relogio = window.setInterval(() => definirAgora(new Date().toISOString()), 1_000)
    let ativo = true
    let consultando = false
    const atualizar = window.setInterval(async () => {
      if (consultando) return
      const atual = versao.current
      consultando = true
      try {
        const resultado = await pessoasNoRelogioAction()
        if (ativo && atual === versao.current) {
          if (resultado.ok) { definirPessoas(resultado.pessoas); definirAviso('') }
          else definirAviso(resultado.erro)
        }
      } catch {
        if (ativo) definirAviso('A lista não atualizou. Confira a conexão; tentaremos novamente em instantes.')
      } finally { consultando = false }
    }, 30_000)
    const aoTelaCheia = () => definirTelaCheia(document.fullscreenElement === raiz.current)
    document.addEventListener('fullscreenchange', aoTelaCheia)
    return () => { ativo = false; window.clearInterval(relogio); window.clearInterval(atualizar); document.removeEventListener('fullscreenchange', aoTelaCheia) }
  }, [])

  useEffect(() => {
    if (!sucesso) return
    const retorno = window.setTimeout(() => definirSucesso(null), 4_000)
    return () => window.clearTimeout(retorno)
  }, [sucesso])

  async function alternarTelaCheia() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (raiz.current?.requestFullscreen) await raiz.current.requestFullscreen()
      else definirAviso('Este navegador não permite tela cheia. O relógio continua funcionando.')
    } catch { definirAviso('Não foi possível abrir a tela cheia neste aparelho.') }
  }

  return (
    <div ref={raiz} className="min-w-0 space-y-6 bg-papel [&:fullscreen]:min-h-dvh [&:fullscreen]:overflow-y-auto [&:fullscreen]:p-5 sm:[&:fullscreen]:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-areia pb-5">
        <div><p className="text-sm font-bold tracking-widest text-carvao uppercase">Ponto eletrônico</p><h1 className="mt-2 text-3xl font-bold">{empresa}</h1><p className="mt-1 text-base text-carvao">Horário de Porto Velho</p></div>
        <div className="flex flex-wrap gap-2">{gestao && <Link href="/painel/ponto/equipe" className={BOTAO_PONTO}><Users aria-hidden className="size-5" /> Gerenciar ponto</Link>}<button type="button" onClick={alternarTelaCheia} className={BOTAO_PONTO}>{telaCheia ? <Minimize aria-hidden className="size-5" /> : <Maximize aria-hidden className="size-5" />}{telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}</button></div>
      </header>
      {!pessoa && !sucesso && <div className="py-1"><p className="text-[clamp(4.5rem,14vw,8rem)] leading-none font-bold tracking-tighter tabular-nums" aria-label={`Agora, ${horaPonto(agora)}`}>{horaPonto(agora)}</p><p className="mt-3 text-lg text-carvao">{new Date(agora).toLocaleDateString('pt-BR', { timeZone: 'America/Porto_Velho', weekday: 'long', day: 'numeric', month: 'long' })}</p></div>}
      {aviso && <Mensagem tipo="info">{aviso}</Mensagem>}
      {sucesso ? <section role="status" aria-live="assertive" className="flex min-h-[55dvh] flex-col items-center justify-center rounded-2xl border border-verde/30 bg-verde-clara p-6 text-center text-[#176b3a]"><Check aria-hidden className="mb-5 size-16" /><h2 className="text-3xl leading-tight font-bold sm:text-5xl">{sucesso.rotulo} registrada</h2><p className="mt-5 text-6xl font-bold tabular-nums sm:text-8xl">{horaPonto(sucesso.momento)}</p><p className="mt-5 text-3xl font-bold break-words">{sucesso.nome}</p><p className="mt-4 text-base">{sucesso.comFoto ? 'Registro com foto.' : 'Registro sem foto.'} Tudo certo.</p><p className="mt-2 text-base">Voltando ao relógio…</p></section> : pessoa ? <Marcacao key={pessoa.id} pessoa={pessoa} voltar={() => definirPessoa(null)} concluir={(resultado, atualizadas) => { versao.current++; definirPessoas(atualizadas); definirPessoa(null); definirSucesso(resultado); definirAviso('') }} /> : <section aria-labelledby="escolha-pessoa"><h2 id="escolha-pessoa" className="mb-4 text-2xl font-bold">Toque no seu nome para bater o ponto.</h2>{pessoas.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{pessoas.map((item) => <button key={item.id} type="button" onClick={() => definirPessoa(item)} className="flex min-h-32 items-center justify-between gap-3 rounded-xl border border-areia bg-branco p-5 text-left hover:border-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"><span className="min-w-0"><span className="block text-2xl font-bold break-words">{item.nome}</span><span className={`mt-3 flex items-start gap-2 text-base font-semibold ${item.situacao === 'trabalhando' ? 'text-[#176b3a]' : item.situacao === 'intervalo' ? 'text-[#805000]' : 'text-carvao'}`}><span aria-hidden className={`mt-1.5 size-2.5 shrink-0 rounded-full ${item.situacao === 'trabalhando' ? 'bg-verde' : item.situacao === 'intervalo' ? 'bg-ambar' : 'bg-cinza'}`} />{item.situacao === 'fora' ? 'Fora do trabalho' : `${item.situacao === 'trabalhando' ? 'Trabalhando' : 'Em intervalo'}${item.desde ? ` desde ${horaPonto(item.desde)}` : ''}`}</span></span><ArrowRight aria-hidden className="size-6 shrink-0" /></button>)}</div> : <div className="rounded-xl border border-dashed border-areia p-6"><h3 className="text-xl font-bold">Nenhuma pessoa configurada para bater ponto.</h3><p className="mt-2 text-base text-carvao">Peça ao gerente para habilitar o registro de ponto na equipe.</p></div>}</section>}
    </div>
  )
}
