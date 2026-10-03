'use client'

import { Copy, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { NOMES_DIAS, type IntervaloHorario } from '@/lib/dominio/horario'

const CAMPO_HORA =
  'h-11 rounded-md border border-areia bg-branco px-2 text-[15px] tabular-nums focus:border-tinta focus:outline-none'
const ORDEM_DIAS = [1, 2, 3, 4, 5, 6, 0]

/** Um bloco por dia, com os intervalos. "Copiar para todos" poupa o setup mais comum. */
export function EditorHorarios({ iniciais }: { iniciais: IntervaloHorario[] }) {
  const [horarios, setHorarios] = useState<IntervaloHorario[]>(iniciais)

  const doDia = (dia: number) => horarios.map((h, i) => ({ ...h, indice: i })).filter((h) => h.dia === dia)
  const adicionar = (dia: number) => setHorarios((h) => [...h, { dia, abre: '18:00', fecha: '23:00' }])
  const remover = (indice: number) => setHorarios((h) => h.filter((_, i) => i !== indice))
  const alterar = (indice: number, campo: 'abre' | 'fecha', valor: string) =>
    setHorarios((h) => h.map((x, i) => (i === indice ? { ...x, [campo]: valor } : x)))
  const copiarParaTodos = (dia: number) => {
    const modelo = horarios.filter((h) => h.dia === dia)
    setHorarios(ORDEM_DIAS.flatMap((d) => modelo.map((m) => ({ ...m, dia: d }))))
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="horarios_json" value={JSON.stringify(horarios)} />
      {ORDEM_DIAS.map((dia) => {
        const intervalos = doDia(dia)
        return (
          <div key={dia} className="flex flex-col gap-2 rounded-lg border border-areia bg-papel-2 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold capitalize">{NOMES_DIAS[dia]}</span>
              <div className="flex gap-1">
                {intervalos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => copiarParaTodos(dia)}
                    className="inline-flex h-10 items-center gap-1 rounded-md px-2 text-xs font-semibold text-carvao hover:bg-papel-3"
                    title="Usar este horário em todos os dias"
                  >
                    <Copy className="size-3.5" /> Todos os dias
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => adicionar(dia)}
                  aria-label={`Adicionar horário em ${NOMES_DIAS[dia]}`}
                  className="inline-flex size-10 items-center justify-center rounded-md text-carvao hover:bg-papel-3"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            {intervalos.length === 0 ? (
              <p className="text-sm text-cinza">Fechado</p>
            ) : (
              intervalos.map((h) => (
                <div key={h.indice} className="flex items-center gap-2">
                  <input
                    type="time"
                    aria-label="Abre"
                    className={CAMPO_HORA}
                    value={h.abre}
                    onChange={(e) => alterar(h.indice, 'abre', e.target.value)}
                    required
                  />
                  <span className="text-cinza">até</span>
                  <input
                    type="time"
                    aria-label="Fecha"
                    className={CAMPO_HORA}
                    value={h.fecha}
                    onChange={(e) => alterar(h.indice, 'fecha', e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => remover(h.indice)}
                    aria-label="Remover horário"
                    className="ml-auto inline-flex size-10 items-center justify-center rounded-md text-cinza hover:bg-papel-3"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )
      })}
      <p className="text-xs text-cinza">
        Se fecha depois da meia-noite (ex.: 18:00 até 01:00), basta pôr a hora: o sistema entende.
      </p>
    </div>
  )
}
