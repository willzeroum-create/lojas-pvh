'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import estilos from './video-agencia.module.css'

type PropriedadesVideoAgencia = {
  video: {
    src: string
    poster: string
    titulo: string
    descricao: string
  }
  className?: string
}

export default function VideoAgencia({ video, className = '' }: PropriedadesVideoAgencia) {
  const elemento = useRef<HTMLVideoElement>(null)
  const visivel = useRef(false)
  const pausaManual = useRef(false)
  const inicioManual = useRef(false)
  const movimentoReduzido = useRef(false)
  const ativo = useRef(true)
  const [reproduzindo, definirReproduzindo] = useState(false)
  const [semSom, definirSemSom] = useState(true)
  const [falha, definirFalha] = useState(false)
  const descricaoId = useId()
  const videoId = useId()

  const preparar = useCallback(() => {
    const reprodutor = elemento.current
    if (reprodutor && reprodutor.getAttribute('src') !== video.src) {
      reprodutor.src = video.src
      reprodutor.load()
    }
    return reprodutor
  }, [video.src])

  const tocar = useCallback(() => {
    if (!visivel.current || document.hidden || pausaManual.current) return
    if (movimentoReduzido.current && !inicioManual.current) return
    const reprodutor = preparar()
    if (!reprodutor) return

    void reprodutor.play().catch((erro: unknown) => {
      // Sair da tela pode interromper um play pendente sem indicar falha.
      if (erro instanceof DOMException && erro.name === 'AbortError') return
      if (ativo.current) {
        definirReproduzindo(false)
        if (inicioManual.current) definirFalha(true)
      }
    })
  }, [preparar])

  useEffect(() => {
    const reprodutor = elemento.current
    if (!reprodutor) return
    ativo.current = true
    const preferencia = window.matchMedia('(prefers-reduced-motion: reduce)')
    movimentoReduzido.current = preferencia.matches

    function sincronizar() {
      if (!visivel.current || document.hidden || pausaManual.current) {
        reprodutor?.pause()
        return
      }
      tocar()
    }

    function atualizarPreferencia() {
      movimentoReduzido.current = preferencia.matches
      if (preferencia.matches) {
        inicioManual.current = false
        reprodutor?.pause()
      } else {
        sincronizar()
      }
    }

    const observador =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            ([entrada]) => {
              if (!entrada) return
              visivel.current = entrada.isIntersecting && entrada.intersectionRatio >= 0.15
              sincronizar()
            },
            { threshold: [0, 0.15] },
          )
        : null

    observador?.observe(reprodutor)
    document.addEventListener('visibilitychange', sincronizar)
    preferencia.addEventListener('change', atualizarPreferencia)
    return () => {
      ativo.current = false
      observador?.disconnect()
      document.removeEventListener('visibilitychange', sincronizar)
      preferencia.removeEventListener('change', atualizarPreferencia)
      reprodutor.pause()
    }
  }, [tocar])

  function alternarReproducao() {
    const reprodutor = elemento.current
    if (!reprodutor) return
    if (!reprodutor.paused) {
      pausaManual.current = true
      reprodutor.pause()
      return
    }
    const limites = reprodutor.getBoundingClientRect()
    visivel.current = limites.bottom > 0 && limites.top < window.innerHeight
    pausaManual.current = false
    inicioManual.current = true
    definirFalha(false)
    tocar()
  }

  function alternarSom() {
    const reprodutor = elemento.current
    if (!reprodutor) return
    reprodutor.muted = !reprodutor.muted
    definirSemSom(reprodutor.muted)
  }

  return (
    <figure className={`${estilos.quadro} ${className}`}>
      <div className={estilos.tela}>
        <video
          ref={elemento}
          id={videoId}
          className={estilos.video}
          poster={video.poster}
          preload="none"
          loop
          muted={semSom}
          playsInline
          width="540"
          height="960"
          aria-label={video.titulo}
          aria-describedby={descricaoId}
          onPlay={() => {
            definirReproduzindo(true)
            definirFalha(false)
          }}
          onPause={() => definirReproduzindo(false)}
          onError={() => definirFalha(true)}
        />
        <span className={estilos.marcaReproducao} aria-hidden="true">
          <span className={reproduzindo ? estilos.indicadorAtivo : estilos.indicador} />
          {reproduzindo ? 'Reproduzindo' : 'Vídeo'}
        </span>
      </div>
      <div className={estilos.controles}>
        <button
          type="button"
          onClick={alternarReproducao}
          aria-controls={videoId}
          aria-label={reproduzindo ? 'Pausar vídeo' : 'Tocar vídeo'}
          className={estilos.botao}
        >
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            {reproduzindo ? (
              <path d="M5 4h3v12H5zm7 0h3v12h-3z" fill="currentColor" />
            ) : (
              <path d="m6 3 11 7L6 17z" fill="currentColor" />
            )}
          </svg>
          {reproduzindo ? 'Pausar' : 'Tocar vídeo'}
        </button>
        <button
          type="button"
          onClick={alternarSom}
          aria-controls={videoId}
          aria-label={semSom ? 'Ligar som' : 'Desligar som'}
          aria-pressed={!semSom}
          className={estilos.botao}
        >
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3 7v6h3l4 3V4L6 7H3Z" strokeLinejoin="round" />
            {semSom ? (
              <path d="m13 7 5 6m0-6-5 6" strokeLinecap="round" />
            ) : (
              <path d="M13 7a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" strokeLinecap="round" />
            )}
          </svg>
          {semSom ? 'Ligar som' : 'Som ligado'}
        </button>
      </div>
      <figcaption id={descricaoId} className={estilos.somenteLeitura}>
        {video.descricao}
      </figcaption>
      {falha && (
        <p className={estilos.erro} role="status">
          Não foi possível tocar. Tente novamente.
        </p>
      )}
    </figure>
  )
}
