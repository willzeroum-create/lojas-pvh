'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

export type OpcaoEditavel = { nome: string; preco_adicional: number; disponivel: boolean }
export type GrupoEditavel = {
  nome: string
  min: number
  max: number
  obrigatorio: boolean
  opcoes: OpcaoEditavel[]
}

/** Sem largura: cada uso diz se ocupa a linha toda ou uma fatia (o nome da opção e o preço partilham a linha). */
const CAMPO =
  'h-11 min-w-0 rounded-md border border-areia bg-branco px-3 text-[15px] focus:border-tinta focus:outline-none'

/**
 * Grupos de opção do produto ("Ponto da carne", "Adicionais"). O estado vive
 * aqui e vai para o servidor num campo escondido em JSON, junto com o resto
 * do formulário.
 */
export function EditorGrupos({ iniciais }: { iniciais: GrupoEditavel[] }) {
  const [grupos, setGrupos] = useState<GrupoEditavel[]>(iniciais)

  const alterar = (i: number, patch: Partial<GrupoEditavel>) =>
    setGrupos((g) => g.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  const alterarOpcao = (i: number, j: number, patch: Partial<OpcaoEditavel>) =>
    setGrupos((g) =>
      g.map((x, k) =>
        k === i ? { ...x, opcoes: x.opcoes.map((o, m) => (m === j ? { ...o, ...patch } : o)) } : x,
      ),
    )

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <input type="hidden" name="grupos_json" value={JSON.stringify(grupos)} />
      <legend className="mb-1 flex w-full items-center justify-between">
        <span className="text-sm font-semibold text-carvao">Grupos de opção</span>
        <button
          type="button"
          onClick={() =>
            setGrupos((g) => [
              ...g,
              {
                nome: '',
                min: 0,
                max: 1,
                obrigatorio: false,
                opcoes: [{ nome: '', preco_adicional: 0, disponivel: true }],
              },
            ])
          }
          className="inline-flex h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold text-carvao hover:bg-papel-2"
        >
          <Plus className="size-4" /> Grupo
        </button>
      </legend>
      {grupos.length === 0 && (
        <p className="text-sm text-cinza">
          Ex.: “Ponto da carne” (obrigatório, escolha 1) ou “Adicionais” (até 3).
        </p>
      )}

      {grupos.map((g, i) => (
        <div key={i} className="rounded-lg border border-areia bg-papel-2 p-3">
          <div className="flex gap-2">
            <input
              aria-label="Nome do grupo"
              className={cn(CAMPO, 'w-full')}
              placeholder="Nome do grupo"
              value={g.nome}
              onChange={(e) => alterar(i, { nome: e.target.value })}
              required
            />
            <button
              type="button"
              aria-label="Remover grupo"
              onClick={() => setGrupos((x) => x.filter((_, k) => k !== i))}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-vermelho hover:bg-vermelho-clara"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-cinza">Mínimo</span>
              <input
                type="number"
                min={0}
                className={cn(CAMPO, 'w-full')}
                value={g.min}
                onChange={(e) => alterar(i, { min: Number(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-cinza">Máximo</span>
              <input
                type="number"
                min={1}
                className={cn(CAMPO, 'w-full')}
                value={g.max}
                onChange={(e) => alterar(i, { max: Number(e.target.value) })}
              />
            </label>
            <label className="flex items-end gap-2 pb-2.5">
              <input
                type="checkbox"
                checked={g.obrigatorio}
                onChange={(e) => alterar(i, { obrigatorio: e.target.checked })}
                className="size-5 accent-tinta"
              />
              <span className="font-semibold">Obrigatório</span>
            </label>
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {g.opcoes.map((o, j) => (
              <li key={j} className="flex items-center gap-2">
                <input
                  aria-label="Nome da opção"
                  className={cn(CAMPO, 'flex-1')}
                  placeholder="Opção"
                  value={o.nome}
                  onChange={(e) => alterarOpcao(i, j, { nome: e.target.value })}
                  required
                />
                <input
                  aria-label="Preço adicional"
                  className={cn(CAMPO, 'w-24 shrink-0')}
                  inputMode="decimal"
                  placeholder="+ R$"
                  value={o.preco_adicional === 0 ? '' : String(o.preco_adicional).replace('.', ',')}
                  onChange={(e) =>
                    alterarOpcao(i, j, { preco_adicional: Number(e.target.value.replace(',', '.')) || 0 })
                  }
                />
                <button
                  type="button"
                  aria-label="Remover opção"
                  onClick={() => alterar(i, { opcoes: g.opcoes.filter((_, m) => m !== j) })}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-cinza hover:bg-papel-3"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              alterar(i, { opcoes: [...g.opcoes, { nome: '', preco_adicional: 0, disponivel: true }] })
            }
            className="mt-2 inline-flex h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold text-carvao hover:bg-papel-3"
          >
            <Plus className="size-4" /> Opção
          </button>
        </div>
      ))}
    </fieldset>
  )
}
