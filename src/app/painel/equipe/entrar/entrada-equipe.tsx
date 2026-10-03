'use client'

import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { TecladoPin } from '@/components/ui/teclado-pin'
import type { MembroEquipe } from '@/lib/dados/equipe'
import { PAPEIS } from '@/lib/equipe/papeis'
import { entrarEquipeAction, sairEquipeAction } from '../actions'
import { ESTILO_BOTAO, ESTILO_PRIMARIO, horarioEquipe, iniciais } from '../_components/apresentacao'
import { FormularioMembro } from '../_components/formulario-membro'

export function EntradaEquipe({
  membros,
  agoraInicial,
  pessoaAtual,
}: {
  membros: MembroEquipe[]
  agoraInicial: number
  pessoaAtual: string | null
}) {
  const roteador = useRouter()
  const [selecionada, definirSelecionada] = useState<string | null>(null)
  const [pin, definirPin] = useState('')
  const [erro, definirErro] = useState('')
  const [erroPin, definirErroPin] = useState('')
  const [agora, definirAgora] = useState(agoraInicial)
  const [pendente, iniciar] = useTransition()
  const tituloPin = useRef<HTMLHeadingElement>(null)
  const pessoa = membros.find((membro) => membro.id === selecionada && membro.ativo)
  const ativas = membros.filter((membro) => membro.ativo)
  const bloqueada = Boolean(pessoa?.bloqueadoAte && new Date(pessoa.bloqueadoAte).getTime() > agora)

  useEffect(() => {
    const intervalo = window.setInterval(() => definirAgora(Date.now()), 1000)
    return () => window.clearInterval(intervalo)
  }, [])
  useEffect(() => {
    if (selecionada) tituloPin.current?.focus()
  }, [selecionada])

  function escolher(id: string | null) {
    definirSelecionada(id)
    definirPin('')
    definirErro('')
    definirErroPin('')
  }

  function entrar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!pessoa || bloqueada || pendente || pin.length < 4) return
    definirErro('')
    definirErroPin('')
    iniciar(async () => {
      try {
        const resultado = await entrarEquipeAction({ membroId: pessoa.id, pin })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          definirErroPin(resultado.porCampo?.pin ?? '')
          definirPin('')
          roteador.refresh()
          return
        }
        definirPin('')
        roteador.push('/painel')
        roteador.refresh()
      } catch {
        definirErro('Não foi possível entrar. Confira sua conexão e tente novamente.')
      }
    })
  }

  function encerrarPessoa() {
    definirErro('')
    iniciar(async () => {
      try {
        await sairEquipeAction()
        escolher(null)
        roteador.refresh()
      } catch {
        definirErro('Não foi possível encerrar o acesso. Tente novamente.')
      }
    })
  }

  return (
    <div className="equipe-area mx-auto flex w-full max-w-4xl flex-col gap-6 py-4 sm:py-8">
      <header className="border-b border-areia pb-6">
        <p className="text-xs font-bold tracking-[0.16em] text-carvao uppercase">Equipe / Acesso ao painel</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Quem está operando?</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-carvao">
          {membros.length === 0
            ? 'Antes de começar, cadastre o primeiro gerente. Essa pessoa poderá organizar a equipe e aprovar operações.'
            : 'Escolha seu nome e digite seu PIN. As operações ficam registradas em seu nome.'}
        </p>
      </header>

      {pessoaAtual && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-areia bg-papel-2 p-4">
          <p className="text-sm text-carvao">
            Operando agora: <strong className="text-tinta">{pessoaAtual}</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/painel" className={ESTILO_BOTAO}>
              Voltar ao painel
            </Link>
            <button type="button" disabled={pendente} onClick={encerrarPessoa} className={ESTILO_BOTAO}>
              Encerrar e trocar
            </button>
          </div>
        </div>
      )}

      {membros.length === 0 ? (
        <section
          className="mx-auto w-full max-w-lg rounded-xl border border-areia bg-branco p-5 sm:p-7"
          aria-labelledby="primeiro-gerente"
        >
          <h2 id="primeiro-gerente" className="mb-5 text-2xl font-bold">
            Seu primeiro gerente
          </h2>
          <FormularioMembro primeiro />
        </section>
      ) : pessoa ? (
        <section
          aria-labelledby="titulo-pin"
          className="mx-auto w-full max-w-md rounded-xl border border-areia bg-branco p-4 sm:p-6"
        >
          <button
            type="button"
            disabled={pendente}
            onClick={() => escolher(null)}
            className={`${ESTILO_BOTAO} mb-5`}
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Escolher outra pessoa
          </button>
          <div className="mb-6 flex min-w-0 items-center gap-4">
            <span
              aria-hidden="true"
              className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-tinta text-2xl font-bold text-papel"
            >
              {iniciais(pessoa.nome)}
            </span>
            <div className="min-w-0">
              <h2 id="titulo-pin" ref={tituloPin} tabIndex={-1} className="text-2xl font-bold break-words">
                {pessoa.nome}
              </h2>
              <p className="mt-1 text-sm text-carvao">{PAPEIS[pessoa.papel]}</p>
            </div>
          </div>
          {bloqueada && pessoa.bloqueadoAte && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-ambar-clara p-4 text-sm leading-relaxed text-[#805000]"
            >
              <strong className="block">PIN temporariamente bloqueado</strong>Tente novamente após{' '}
              {horarioEquipe(pessoa.bloqueadoAte)} (Porto Velho). O acesso é liberado automaticamente.
            </p>
          )}
          <form onSubmit={entrar} className="space-y-5" aria-busy={pendente}>
            <TecladoPin
              id="entrada-pin"
              valor={pin}
              onChange={definirPin}
              desabilitado={pendente || bloqueada}
              rotulo="Seu PIN de acesso"
              erro={erroPin}
            />
            {erro && (
              <p
                role="alert"
                className="rounded-lg bg-vermelho-clara p-4 text-sm font-semibold text-vermelho"
              >
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={pendente || bloqueada || pin.length < 4}
              className={`${ESTILO_PRIMARIO} min-h-16 w-full text-base`}
            >
              {pendente ? 'Entrando…' : 'Entrar no painel'}{' '}
              <ArrowRight aria-hidden="true" className="size-5" />
            </button>
          </form>
          <p className="mt-5 text-xs leading-relaxed text-carvao">
            PIN com 4 a 6 números. Cinco tentativas incorretas bloqueiam o acesso por cinco minutos.
          </p>
        </section>
      ) : (
        <section aria-label="Pessoas ativas da equipe">
          {erro && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-vermelho-clara p-4 text-sm font-semibold text-vermelho"
            >
              {erro}
            </p>
          )}
          {ativas.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {ativas.map((membro) => {
                const bloqueado = membro.bloqueadoAte && new Date(membro.bloqueadoAte).getTime() > agora
                return (
                  <li key={membro.id} className="min-w-0">
                    <button
                      type="button"
                      disabled={pendente}
                      onClick={() => escolher(membro.id)}
                      className="flex min-h-44 w-full flex-col items-start rounded-xl border border-areia bg-branco p-4 text-left transition-colors hover:border-tinta hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:opacity-50"
                    >
                      <span
                        aria-hidden="true"
                        className="mb-5 text-4xl font-extrabold tracking-tight text-tinta"
                      >
                        {iniciais(membro.nome)}
                      </span>
                      <span className="w-full font-bold break-words">{membro.nome}</span>
                      <span className="mt-1 text-sm text-carvao">{PAPEIS[membro.papel]}</span>
                      {bloqueado && (
                        <span className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#805000]">
                          <LockKeyhole aria-hidden="true" className="size-3.5 shrink-0" /> PIN bloqueado
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-areia bg-branco p-6">
              <h2 className="text-xl font-bold">Nenhuma pessoa ativa</h2>
              <p className="mt-2 text-sm leading-relaxed text-carvao">
                Peça ao responsável pela loja ou à equipe de suporte para reativar um gerente.
              </p>
              <button
                type="button"
                disabled={pendente}
                onClick={() => roteador.refresh()}
                className={`${ESTILO_BOTAO} mt-5`}
              >
                Atualizar equipe
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
