'use client'

import { ArrowRight, Pencil, Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import type { MembroEquipe } from '@/lib/dados/equipe'
import { PAPEIS } from '@/lib/equipe/papeis'
import { sairEquipeAction, salvarMembroAction } from '../actions'
import {
  ESTILO_BOTAO,
  ESTILO_CAMPO,
  ESTILO_PRIMARIO,
  GuiaPapeis,
  horarioEquipe,
  iniciais,
} from './apresentacao'
import { FormularioMembro } from './formulario-membro'

export function GestaoEquipe({
  membros,
  podeGerir,
  pessoaAtual,
  agora,
}: {
  membros: MembroEquipe[]
  podeGerir: boolean
  pessoaAtual: string | null
  agora: number
}) {
  const roteador = useRouter()
  const [edicao, definirEdicao] = useState<MembroEquipe | 'nova' | null>(null)
  const [busca, definirBusca] = useState('')
  const [erro, definirErro] = useState('')
  const [aviso, definirAviso] = useState('')
  const [pendente, iniciar] = useTransition()
  const botaoNovo = useRef<HTMLButtonElement>(null)
  const ativas = membros.filter((membro) => membro.ativo)
  const filtrados = membros.filter((membro) =>
    `${membro.nome} ${PAPEIS[membro.papel]}`
      .toLocaleLowerCase('pt-BR')
      .includes(busca.toLocaleLowerCase('pt-BR')),
  )

  function trocarPessoa() {
    definirErro('')
    iniciar(async () => {
      try {
        await sairEquipeAction()
        roteador.push('/painel/equipe/entrar')
        roteador.refresh()
      } catch {
        definirErro('Não foi possível trocar de pessoa. Tente novamente.')
      }
    })
  }

  function alternarAtivo(membro: MembroEquipe) {
    definirErro('')
    definirAviso('')
    iniciar(async () => {
      try {
        const resultado = await salvarMembroAction({
          id: membro.id,
          nome: membro.nome,
          papel: membro.papel,
          ativo: !membro.ativo,
        })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        definirAviso(`${membro.nome} ${membro.ativo ? 'desativado' : 'ativado'} na equipe.`)
        roteador.refresh()
      } catch {
        definirErro('Não foi possível alterar o acesso. Tente novamente.')
      }
    })
  }

  function fecharFormulario() {
    definirEdicao(null)
    botaoNovo.current?.focus()
  }

  return (
    <div className="equipe-area mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-carvao uppercase">Seu negócio / Pessoas</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight lg:text-4xl">Equipe</h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
            Um PIN por pessoa. Cada operação com o nome de quem fez.
          </p>
        </div>
        <button type="button" disabled={pendente} onClick={trocarPessoa} className={ESTILO_BOTAO}>
          Trocar de pessoa <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </header>

      <section aria-label="Resumo da equipe" className="grid gap-3 min-[480px]:grid-cols-3">
        <div className="rounded-xl bg-tinta p-5 text-papel">
          <p className="text-sm">Pessoas ativas</p>
          <p className="mt-2 text-4xl font-bold tabular-nums">{ativas.length}</p>
        </div>
        <div className="rounded-xl border border-areia bg-branco p-5">
          <p className="text-sm text-carvao">Gerentes ativos</p>
          <p className="mt-2 text-4xl font-bold tabular-nums">
            {ativas.filter((membro) => membro.papel === 'gerente').length}
          </p>
        </div>
        <Link
          href="/painel/equipe/auditoria"
          className="flex min-h-28 flex-col justify-between gap-4 rounded-xl border border-areia bg-papel-2 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
        >
          <span className="text-sm text-carvao">Histórico de operações</span>
          <span className="flex items-center justify-between gap-2 text-lg font-bold">
            Ver auditoria <ArrowRight aria-hidden="true" className="size-5 shrink-0" />
          </span>
        </Link>
      </section>
      {erro && (
        <p
          role="alert"
          className="rounded-lg border border-vermelho/30 bg-vermelho-clara p-4 text-sm font-semibold text-vermelho"
        >
          {erro}
        </p>
      )}
      {aviso && (
        <p role="status" className="rounded-lg bg-verde-clara p-4 text-sm font-semibold text-[#176b3a]">
          {aviso}
        </p>
      )}

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <div className="min-w-0 space-y-5">
          <section
            aria-labelledby="lista-equipe"
            className="overflow-hidden rounded-xl border border-areia bg-branco"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia bg-papel-2/50 p-4 sm:p-5">
              <h2 id="lista-equipe" className="text-xl font-bold">
                Pessoas da equipe
              </h2>
              {podeGerir && (
                <button
                  ref={botaoNovo}
                  type="button"
                  disabled={pendente}
                  onClick={() => {
                    definirEdicao('nova')
                    definirAviso('')
                  }}
                  className={ESTILO_PRIMARIO}
                >
                  <Plus aria-hidden="true" className="size-4" /> Nova pessoa
                </button>
              )}
            </header>
            <div className="border-b border-areia p-4">
              <label htmlFor="busca-equipe" className="sr-only">
                Buscar por nome ou papel
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-3.5 left-3 size-5 text-carvao"
                />
                <input
                  id="busca-equipe"
                  type="search"
                  value={busca}
                  onChange={(evento) => definirBusca(evento.target.value)}
                  placeholder="Buscar por nome ou papel"
                  className={`${ESTILO_CAMPO} pl-11`}
                />
              </div>
            </div>
            <p role="status" className="sr-only">
              {filtrados.length} pessoas encontradas.
            </p>
            {filtrados.length ? (
              <ul className="divide-y divide-areia">
                {filtrados.map((membro) => (
                  <li key={membro.id} className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
                    <span
                      aria-hidden="true"
                      className={`flex size-12 shrink-0 items-center justify-center rounded-lg text-lg font-extrabold ${membro.ativo ? 'bg-papel-3 text-tinta' : 'bg-papel text-carvao'}`}
                    >
                      {iniciais(membro.nome)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold break-words">
                        {membro.nome}{' '}
                        {membro.id === pessoaAtual && (
                          <span className="text-xs font-medium text-carvao">(você)</span>
                        )}
                      </p>
                      <p className="mt-1 text-sm text-carvao">
                        {PAPEIS[membro.papel]} <span aria-hidden="true">·</span>{' '}
                        <span className={membro.ativo ? 'font-semibold text-[#176b3a]' : 'text-carvao'}>
                          {membro.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </p>
                      {membro.bloqueadoAte && new Date(membro.bloqueadoAte).getTime() > agora && (
                        <p className="mt-2 text-xs font-semibold text-[#805000]">
                          PIN bloqueado até {horarioEquipe(membro.bloqueadoAte)}
                        </p>
                      )}
                    </div>
                    {podeGerir && (
                      <div className="flex w-full gap-2 min-[500px]:w-auto">
                        <button
                          type="button"
                          disabled={pendente}
                          onClick={() => {
                            definirEdicao(membro)
                            definirAviso('')
                          }}
                          className={`${ESTILO_BOTAO} flex-1`}
                          aria-label={`Editar ${membro.nome}`}
                        >
                          <Pencil aria-hidden="true" className="size-4" /> Editar
                        </button>
                        <button
                          type="button"
                          disabled={pendente}
                          onClick={() => alternarAtivo(membro)}
                          className={`${ESTILO_BOTAO} flex-1`}
                          aria-label={`${membro.ativo ? 'Desativar' : 'Ativar'} ${membro.nome}`}
                        >
                          {membro.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6">
                <Users aria-hidden="true" className="mb-3 size-8 text-carvao" />
                <p className="font-bold">{busca ? 'Nenhuma pessoa encontrada' : 'Sua equipe começa aqui'}</p>
                <p className="mt-2 text-sm text-carvao">
                  {busca
                    ? 'Tente outro nome ou papel.'
                    : 'Cadastre o primeiro gerente para organizar os acessos.'}
                </p>
              </div>
            )}
          </section>
          {podeGerir && edicao && (
            <section
              aria-labelledby="editar-equipe"
              className="rounded-xl border border-areia bg-branco p-4 sm:p-6"
            >
              <h2 id="editar-equipe" className="mb-5 text-2xl font-bold">
                {edicao === 'nova' ? 'Nova pessoa' : `Editar ${edicao.nome}`}
              </h2>
              <FormularioMembro
                key={edicao === 'nova' ? 'nova' : edicao.id}
                membro={edicao === 'nova' ? undefined : edicao}
                primeiro={membros.length === 0}
                aoCancelar={fecharFormulario}
                aoSalvar={() => {
                  fecharFormulario()
                  definirAviso('Pessoa salva. O acesso já está atualizado.')
                }}
              />
            </section>
          )}
          {!podeGerir && (
            <p className="text-sm text-carvao">
              Somente um gerente pode alterar a equipe. Para entrar com outra pessoa, use “Trocar de pessoa”.
            </p>
          )}
        </div>
        <GuiaPapeis />
      </div>
    </div>
  )
}
