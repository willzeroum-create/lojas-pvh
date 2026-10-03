'use client'

import { Check, History } from 'lucide-react'
import { useState } from 'react'
import { ACOES_SENSIVEIS, PAPEIS } from '@/lib/equipe/papeis'
import type { AuditoriaLinha } from '@/lib/supabase/tipos'
import { ESTILO_CAMPO, horarioEquipe } from '../_components/apresentacao'

const ROTULOS: Record<string, string> = {
  ...ACOES_SENSIVEIS,
  entrada: 'Entrada no painel',
  equipe_nova: 'Pessoa cadastrada',
  equipe_alterada: 'Cadastro da equipe alterado',
}
const ROTULOS_PAPEL: Record<string, string> = {
  ...PAPEIS,
  operador: 'Equipe de suporte',
  conta: 'Conta da loja',
}
const rotuloAcao = (acao: string) => ROTULOS[acao] ?? acao.replaceAll('_', ' ')

export function ListaAuditoria({ entradas }: { entradas: AuditoriaLinha[] }) {
  const [acao, definirAcao] = useState('todas')
  const acoes = [...new Set(entradas.map((entrada) => entrada.acao))].sort((a, b) =>
    rotuloAcao(a).localeCompare(rotuloAcao(b), 'pt-BR'),
  )
  const filtradas = entradas.filter((entrada) => acao === 'todas' || entrada.acao === acao)

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-areia bg-papel-2/50 p-4 sm:p-5">
        <div className="w-full space-y-2 sm:w-auto sm:min-w-72">
          <label htmlFor="filtro-auditoria" className="block text-sm font-bold">
            Filtrar por ação
          </label>
          <select
            id="filtro-auditoria"
            value={acao}
            onChange={(evento) => definirAcao(evento.target.value)}
            className={ESTILO_CAMPO}
          >
            <option value="todas">Todas as ações</option>
            {acoes.map((opcao) => (
              <option key={opcao} value={opcao}>
                {rotuloAcao(opcao)}
              </option>
            ))}
          </select>
        </div>
        <p role="status" className="text-sm text-carvao">
          <strong className="text-xl text-tinta tabular-nums">{filtradas.length}</strong>{' '}
          {filtradas.length === 1 ? 'registro' : 'registros'}
          {acao !== 'todas' ? ' com esse filtro' : ''}
        </p>
      </div>
      {entradas.length >= 200 && (
        <p className="text-sm text-carvao">
          Exibindo os 200 registros mais recentes. O filtro se aplica a esse período.
        </p>
      )}
      {filtradas.length ? (
        <ol aria-label="Linha do tempo das operações" className="space-y-3">
          {filtradas.map((entrada) => (
            <li
              key={entrada.id}
              className="relative grid min-w-0 gap-3 rounded-xl border border-areia bg-branco p-4 sm:grid-cols-[145px_minmax(0,1fr)] sm:gap-5 sm:p-5"
            >
              <time dateTime={entrada.criado_em} className="text-sm font-semibold text-carvao tabular-nums">
                {horarioEquipe(entrada.criado_em)}
              </time>
              <div className="min-w-0 border-l-2 border-areia pl-4">
                <p className="text-xs font-bold tracking-wide text-carvao uppercase">
                  {rotuloAcao(entrada.acao)}
                </p>
                <p className="mt-2 font-bold break-words">{entrada.descricao}</p>
                <p className="mt-3 text-sm text-carvao">
                  Por <strong className="text-tinta">{entrada.quem}</strong>
                  {entrada.papel ? ` · ${ROTULOS_PAPEL[entrada.papel] ?? entrada.papel}` : ''}
                </p>
                {entrada.aprovado_por ? (
                  <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-verde-clara px-3 py-2 text-sm text-[#176b3a]">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    <span>
                      Aprovado por <strong>{entrada.aprovado_por}</strong>
                    </span>
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-carvao">Sem aprovação adicional registrada</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <section className="rounded-xl border border-areia bg-branco p-6 sm:p-8">
          <History aria-hidden="true" className="mb-4 size-8 text-carvao" />
          <h2 className="text-xl font-bold">
            Nenhuma operação {acao === 'todas' ? 'registrada' : 'com esse filtro'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            {acao === 'todas'
              ? 'As próximas entradas e operações da equipe aparecerão aqui.'
              : 'Selecione outra ação para consultar o histórico.'}
          </p>
        </section>
      )}
    </>
  )
}
