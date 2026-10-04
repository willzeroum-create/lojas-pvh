'use client'

import { useState } from 'react'
import { linkWhatsappAgencia, mensagemMonteOSeu } from '@/lib/config/agencia'
import { GRUPOS_MODULO, MODULOS, type ModuloModelo } from '@/lib/modulos/catalogo'
import estilos from '../site.module.css'

const modulos: readonly ModuloModelo[] = MODULOS
const grupos = Object.entries(GRUPOS_MODULO)
  .map(([id, nome]) => ({ id, nome, modulos: modulos.filter((m) => m.grupo === id) }))
  .filter((g) => g.modulos.length > 0)

/** Escolher módulos e mandar a lista pelo WhatsApp para pedir a cotação. */
export default function Configurador() {
  const [escolhidos, definirEscolhidos] = useState<Set<string>>(() => new Set(modulos.filter((m) => m.essencial).map((m) => m.id)))
  const lista = modulos.filter((m) => escolhidos.has(m.id))
  const opcionais = lista.filter((m) => !m.essencial)
  const destino = linkWhatsappAgencia(mensagemMonteOSeu(lista.map((m) => m.nome)))

  const alternar = (m: ModuloModelo) => {
    if (m.essencial) return
    definirEscolhidos((antes) => {
      const depois = new Set(antes)
      if (depois.has(m.id)) depois.delete(m.id)
      else depois.add(m.id)
      return depois
    })
  }

  return (
    <div className={estilos.configurador}>
      <div>
        {grupos.map((g) => (
          <fieldset key={g.id} className={estilos.grupoModulos}>
            <legend>{g.nome}</legend>
            <div className={estilos.modulos}>
              {g.modulos.map((m) => (
                <label key={m.id} className={estilos.modulo} title={m.descricao}>
                  <input type="checkbox" checked={escolhidos.has(m.id)} disabled={m.essencial} onChange={() => alternar(m)} />
                  {m.nome}
                  {m.essencial && <span style={{ fontSize: 12, opacity: 0.7 }}>incluído</span>}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <aside className={estilos.resumo} aria-live="polite">
        <h2 className={estilos.resumoTitulo}>
          {opcionais.length === 0 ? 'Comece escolhendo' : `${opcionais.length} ${opcionais.length === 1 ? 'módulo escolhido' : 'módulos escolhidos'}`}
        </h2>
        {opcionais.length === 0 ? (
          <p className={estilos.vazioResumo}>Toque nos módulos que a sua empresa usa. Loja e conta já vêm incluídas.</p>
        ) : (
          <ul className={estilos.resumoLista}>
            {opcionais.map((m) => (
              <li key={m.id}>{m.nome}</li>
            ))}
          </ul>
        )}
        <a href={destino} className={estilos.botaoSol}>
          Mandar esta lista no WhatsApp
        </a>
        <p className={estilos.nota}>A cotação chega no WhatsApp. Sem compromisso.</p>
      </aside>
    </div>
  )
}
