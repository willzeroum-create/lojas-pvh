import type { Metadata } from 'next'
import { AGENCIA } from '@/lib/config/agencia'
import Configurador from '../_componentes/Configurador'
import estilos from '../site.module.css'

export const metadata: Metadata = {
  title: 'Monte o seu',
  description: 'Escolha os módulos que a sua empresa usa e peça a cotação pelo WhatsApp.',
}

export default function MonteOSeu() {
  return (
    <>
      <header className={estilos.cabecaAba}>
        <div className={estilos.conteudo}>
          <h1 className={estilos.tituloAba}>{AGENCIA.monteOSeu.titulo}.</h1>
          <p className={estilos.leadAba}>{AGENCIA.monteOSeu.texto}</p>
        </div>
      </header>
      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-label="Módulos">
        <Configurador />
      </section>
    </>
  )
}
