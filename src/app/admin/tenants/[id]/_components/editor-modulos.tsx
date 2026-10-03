'use client'

import { useOptimistic, useState, useTransition } from 'react'
import { Etiqueta } from '@/components/ui/etiqueta'
import { Interruptor } from '@/components/ui/interruptor'
import {
  GRUPOS_MODULO,
  MODULOS,
  podeDesligar,
  podeLigar,
  resolverAtivos,
  type GrupoModulo,
  type Maturidade,
  type ModuloModelo,
} from '@/lib/modulos/catalogo'
import { alternarModulo } from '../../../actions'

const MATURIDADE: Record<Maturidade, { texto: string; tom: 'verde' | 'ambar' | 'neutro' }> = {
  funcional: { texto: 'Pronto', tom: 'verde' },
  pre_funcional: { texto: 'Precisa de configuração', tom: 'ambar' },
  planejado: { texto: 'Em construção', tom: 'neutro' },
}

const TEXTOS = { ligado: 'Ligado', desligado: 'Desligado' }

/**
 * O produto montado para o cliente: um interruptor por módulo, agrupados. Os
 * essenciais não aparecem (estão sempre ligados); os em construção aparecem
 * para a equipa saber o que vem aí, mas não ligam.
 */
export function EditorModulos({ tenantId, ligados }: { tenantId: string; ligados: string[] }) {
  const [ativos, mudarOtimista] = useOptimistic(
    resolverAtivos(ligados) as ReadonlySet<string>,
    (atual, { id, ativo }: { id: string; ativo: boolean }) => {
      const novo = new Set(atual)
      if (ativo) novo.add(id)
      else novo.delete(id)
      return novo
    },
  )
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const opcionais = (MODULOS as readonly ModuloModelo[]).filter((m) => !m.essencial)
  const grupos = (Object.keys(GRUPOS_MODULO) as GrupoModulo[])
    .map((g) => ({ grupo: g, modulos: opcionais.filter((m) => m.grupo === g) }))
    .filter((g) => g.modulos.length > 0)
  const totalLigados = opcionais.filter((m) => ativos.has(m.id)).length

  function mudar(m: ModuloModelo, ativo: boolean) {
    setErro(null)
    iniciar(async () => {
      mudarOtimista({ id: m.id, ativo })
      const r = await alternarModulo({ tenantId, modulo: m.id, ativo })
      if (!r.ok) setErro(`${m.nome}: ${r.erro}`)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-cinza">
        {totalLigados} de {opcionais.length} módulos ligados. Loja e Conta estão sempre no painel.
      </p>
      {erro && (
        <p role="alert" className="rounded-md bg-vermelho-clara px-3 py-2 text-sm font-semibold text-vermelho">
          {erro}
        </p>
      )}
      {grupos.map(({ grupo, modulos }) => (
        <section key={grupo}>
          <h3 className="mb-1 text-xs font-bold tracking-wider text-cinza uppercase">{GRUPOS_MODULO[grupo]}</h3>
          <ul className="divide-y divide-areia/70">
            {modulos.map((m) => {
              const ligado = ativos.has(m.id)
              const verificacao = ligado ? podeDesligar(m.id, ativos) : podeLigar(m.id, ativos)
              const maturidade = MATURIDADE[m.maturidade]
              return (
                <li key={m.id} className="flex items-start justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                      {m.nome}
                      {m.maturidade !== 'funcional' && <Etiqueta tom={maturidade.tom}>{maturidade.texto}</Etiqueta>}
                    </p>
                    <p className="text-sm text-carvao">{m.descricao}</p>
                    {m.ativacao && <p className="mt-0.5 text-xs text-cinza">Para activar: {m.ativacao}</p>}
                    {!verificacao.ok && m.maturidade !== 'planejado' && (
                      <p className="mt-0.5 text-xs text-ambar">{verificacao.motivo}</p>
                    )}
                  </div>
                  <Interruptor
                    ligado={ligado}
                    onMudar={(novo) => mudar(m, novo)}
                    rotulo={`${ligado ? 'Desligar' : 'Ligar'} ${m.nome}`}
                    desativado={!verificacao.ok}
                    ocupado={pendente}
                    textos={TEXTOS}
                  />
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
