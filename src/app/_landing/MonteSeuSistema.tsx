'use client'

import { useState } from 'react'
import { AGENCIA, linkWhatsappAgencia, mensagemMonteOSeu } from '@/lib/config/agencia'
import { GRUPOS_MODULO, MODULOS, type ModuloModelo } from '@/lib/modulos/catalogo'
import estilos from './monte-seu-sistema.module.css'

const modulos: readonly ModuloModelo[] = MODULOS
const grupos = Object.entries(GRUPOS_MODULO).map(([id, nome]) => ({
  id,
  nome,
  modulos: modulos.filter((modulo) => modulo.grupo === id),
}))

export default function MonteSeuSistema() {
  const [selecionados, definirSelecionados] = useState<Set<string>>(
    () => new Set(modulos.filter((modulo) => modulo.essencial).map((modulo) => modulo.id)),
  )
  const escolhidos = modulos.filter((modulo) => selecionados.has(modulo.id))
  const destino = linkWhatsappAgencia(mensagemMonteOSeu(escolhidos.map((modulo) => modulo.nome)))

  function alternarModulo(modulo: ModuloModelo) {
    if (modulo.essencial) return

    definirSelecionados((anteriores) => {
      const proximos = new Set(anteriores)
      if (proximos.has(modulo.id)) proximos.delete(modulo.id)
      else proximos.add(modulo.id)
      return proximos
    })
  }

  return (
    <div className={estilos.montador}>
      <div className={estilos.grupos}>
        <div className={estilos.cabecalho}>
          <span>Módulos</span>
          <span>{modulos.length.toString().padStart(2, '0')}</span>
        </div>

        {grupos.map((grupo, indice) => {
          const quantidade = grupo.modulos.filter((modulo) => selecionados.has(modulo.id)).length

          return (
            <details className={estilos.grupo} key={grupo.id} open={indice === 0}>
              <summary className={estilos.tituloGrupo}>
                <span className={estilos.numeroGrupo} aria-hidden="true">
                  {(indice + 1).toString().padStart(2, '0')}
                </span>
                <span className={estilos.nomeGrupo}>{grupo.nome}</span>
                <span className={estilos.contagemGrupo}>
                  <span className={estilos.apenasLeitor}>Selecionados: </span>
                  {quantidade}/{grupo.modulos.length}
                </span>
                <span className={estilos.indicadorGrupo} aria-hidden="true" />
              </summary>

              <div className={estilos.opcoes}>
                {grupo.modulos.map((modulo) => (
                  <label
                    key={modulo.id}
                    className={estilos.opcao}
                    data-selecionado={selecionados.has(modulo.id)}
                    data-essencial={Boolean(modulo.essencial)}
                  >
                    <input
                      className={estilos.checkbox}
                      type="checkbox"
                      name="modulos"
                      value={modulo.id}
                      checked={selecionados.has(modulo.id)}
                      disabled={modulo.essencial}
                      onChange={() => alternarModulo(modulo)}
                      aria-label={modulo.nome}
                      aria-describedby={`descricao-modulo-${modulo.id}`}
                    />
                    <span className={estilos.textoOpcao}>
                      <span className={estilos.nomeModulo}>{modulo.nome}</span>
                      <span className={estilos.descricaoModulo} id={`descricao-modulo-${modulo.id}`}>
                        {modulo.descricao}
                      </span>
                      {modulo.essencial && <span className={estilos.incluido}>Já incluído</span>}
                    </span>
                  </label>
                ))}
              </div>
            </details>
          )
        })}
      </div>

      <aside className={estilos.resumo} aria-label="Resumo da seleção">
        <div className={estilos.topoResumo}>
          <span>Sua seleção</span>
          <span className={estilos.marcadorResumo} aria-hidden="true" />
        </div>
        <p className={estilos.contagem} role="status" aria-live="polite" aria-atomic="true">
          <strong>{escolhidos.length.toString().padStart(2, '0')}</strong>
          <span>módulos selecionados</span>
        </p>

        <ul className={estilos.listaEscolhidos}>
          {escolhidos.map((modulo) => (
            <li className={estilos.escolhido} key={modulo.id}>
              <span>{modulo.nome}</span>
              {modulo.essencial ? (
                <span className={estilos.seloIncluido}>Incluído</span>
              ) : (
                <button
                  className={estilos.remover}
                  type="button"
                  onClick={() => alternarModulo(modulo)}
                  aria-label={`Remover ${modulo.nome}`}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="m3 3 8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              )}
            </li>
          ))}
        </ul>

        <a className={estilos.cta} href={destino}>
          <span>{AGENCIA.monteOSeu.cta}</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </a>
      </aside>
    </div>
  )
}
