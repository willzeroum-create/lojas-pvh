'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AGENCIA, linkWhatsappAgencia } from '@/lib/config/agencia'
import estilos from '../site.module.css'

// O 3D só existe no browser e carrega depois do texto.
const Cena3D = dynamic(() => import('./Cena3D'), { ssr: false })

const relogio = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Porto_Velho' })

export default function Heroi() {
  const [abrindo, definirAbrindo] = useState(true)
  const [hora, definirHora] = useState('')
  const fps = useRef<HTMLElement>(null)

  useEffect(() => {
    // A abertura aparece uma vez por visita e nunca mais de 1,6 s.
    let vista = false
    try {
      vista = sessionStorage.getItem('pvh-abertura') === '1'
      sessionStorage.setItem('pvh-abertura', '1')
    } catch {}
    const t = setTimeout(() => definirAbrindo(false), vista ? 0 : 1600)
    const tique = () => definirHora(relogio.format(new Date()))
    tique()
    const r = setInterval(tique, 1000)
    return () => {
      clearTimeout(t)
      clearInterval(r)
    }
  }, [])

  return (
    <section className={estilos.heroi} aria-labelledby="titulo-heroi">
      <div className={`${estilos.abertura} ${abrindo ? '' : estilos.aberturaFora}`} aria-hidden="true">
        <span className={estilos.aberturaMarca}>{AGENCIA.nome}</span>
        <span className={estilos.aberturaBarra}>
          <i />
        </span>
        <span className={estilos.aberturaTexto}>MONTANDO O BALCÃO</span>
      </div>

      <Cena3D
        className={estilos.canvas}
        aoMedir={(v) => {
          if (fps.current) fps.current.textContent = `${v}`
        }}
      />

      <span className={`${estilos.cantoneira} ${estilos.cantoneiraA}`} aria-hidden="true" />
      <span className={`${estilos.cantoneira} ${estilos.cantoneiraB}`} aria-hidden="true" />
      <span className={`${estilos.cantoneira} ${estilos.cantoneiraC}`} aria-hidden="true" />
      <span className={`${estilos.cantoneira} ${estilos.cantoneiraD}`} aria-hidden="true" />
      <div className={`${estilos.hud} ${estilos.hudSuperior}`} aria-hidden="true">
        <span className={estilos.hudLinha}>
          <b>PVH-01</b> RONDÔNIA
        </span>
        <span>8.761 S / 63.900 W</span>
      </div>
      <div className={`${estilos.hud} ${estilos.hudEsquerdo}`} aria-hidden="true">
        <span className={estilos.hudLinha}>
          <b>{hora || '--:--:--'}</b> EM PORTO VELHO
        </span>
      </div>
      <div className={`${estilos.hud} ${estilos.hudInferior}`} aria-hidden="true">
        <span className={estilos.hudLinha}>
          <span>
            <b ref={fps}>--</b> FPS
          </span>
          <span>WEBGL2</span>
        </span>
      </div>

      <div className={estilos.heroiTexto}>
        <span className={estilos.selo}>
          <span className={estilos.pontoVivo} aria-hidden="true" />
          Lojas, stands e restaurantes
        </span>
        <h1 id="titulo-heroi" className={estilos.tituloHeroi}>
          Sistema e site que dá vontade <em>de tocar.</em>
        </h1>
        <p className={estilos.subtituloHeroi}>
          O pedido entra, o estoque baixa, o caixa fecha e o cliente volta. Tudo montado para o seu balcão, de Porto
          Velho para o mundo.
        </p>
        <div className={estilos.acoes}>
          <a href={linkWhatsappAgencia()} className={estilos.botaoSol}>
            {AGENCIA.planos.cta}
          </a>
          <Link href="/trabalhos" className={estilos.botaoContorno}>
            Ver trabalhos
          </Link>
        </div>
        <span className={estilos.dica}>Pode mexer: arraste um objeto.</span>
      </div>
    </section>
  )
}
