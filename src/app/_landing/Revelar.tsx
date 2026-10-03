'use client'

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import estilos from './revelar.module.css'

type PropriedadesRevelar = {
  children: ReactNode
  className?: string
  /** Intervalo entre etiquetas, em milissegundos. */
  atraso?: number
}

export default function Revelar({ children, className = '', atraso = 0 }: PropriedadesRevelar) {
  const elemento = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bloco = elemento.current
    if (!bloco || !('IntersectionObserver' in window)) return

    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    let observador: IntersectionObserver | undefined

    function revelar() {
      if (bloco) bloco.dataset.revelacao = 'visivel'
      observador?.disconnect()
    }

    function atualizarPreferencia() {
      if (preferencia.matches) revelar()
    }

    // O HTML já chega visível; só preparamos elementos ainda fora da tela.
    const abaixoDaTela = bloco.getBoundingClientRect().top >= window.innerHeight
    if (!preferencia.matches && abaixoDaTela && !bloco.contains(document.activeElement)) {
      bloco.dataset.revelacao = 'aguardando'
      observador = new IntersectionObserver(
        (entradas) => {
          if (entradas.some((entrada) => entrada.isIntersecting)) revelar()
        },
        { threshold: 0, rootMargin: '0px 0px -24px 0px' },
      )
      observador.observe(bloco)
    }

    preferencia.addEventListener('change', atualizarPreferencia)
    return () => {
      observador?.disconnect()
      preferencia.removeEventListener('change', atualizarPreferencia)
    }
  }, [])

  return (
    <div
      ref={elemento}
      className={`${estilos.revelar} ${className}`}
      style={{ '--atraso-revelacao': `${Math.max(0, Math.min(atraso, 600))}ms` } as CSSProperties}
      onFocusCapture={() => {
        if (elemento.current) elemento.current.dataset.revelacao = 'visivel'
      }}
    >
      {children}
    </div>
  )
}
