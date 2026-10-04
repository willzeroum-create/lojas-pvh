'use client'

import { useState } from 'react'
import estilos from '../site.module.css'

/** Antes e depois com cortina: arrastar (ou setas do teclado) revela o painel. */
export default function Comparador({ antes, depois }: { antes: readonly string[]; depois: readonly string[] }) {
  const [corte, definirCorte] = useState(52)
  return (
    <div className={estilos.comparador} style={{ '--corte': `${corte}%` } as React.CSSProperties}>
      <div className={estilos.ladoAntes}>
        <span className={estilos.rotuloLado}>Antes: caderno e calculadora</span>
        <ul className={estilos.listaAntes}>
          {antes.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <div className={estilos.ladoDepois}>
        <span className={estilos.rotuloLado} style={{ justifySelf: 'end' }}>
          Depois: o sistema montado para você
        </span>
        <ul className={estilos.listaDepois}>
          {depois.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <span className={estilos.alca} aria-hidden="true" />
      <input
        className={estilos.deslizador}
        type="range"
        min={4}
        max={96}
        value={corte}
        onChange={(e) => definirCorte(Number(e.target.value))}
        aria-label="Comparar antes e depois"
      />
    </div>
  )
}
