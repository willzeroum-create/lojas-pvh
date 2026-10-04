import type { Metadata } from 'next'
import { AGENCIA } from '@/lib/config/agencia'
import Chamada from '../_componentes/Chamada'
import estilos from '../site.module.css'

export const metadata: Metadata = {
  title: 'Serviços',
  description: 'Sistema de gestão, cardápio e catálogo com pedido no WhatsApp, sites, vídeos, ponto eletrônico e Pix integrado.',
}

export default function Servicos() {
  return (
    <>
      <header className={estilos.cabecaAba}>
        <div className={estilos.conteudo}>
          <h1 className={estilos.tituloAba}>O que a gente monta.</h1>
          <p className={estilos.leadAba}>
            Do balcão ao site, numa peça só. Você escolhe por onde começar e o resto se liga depois, sem trocar de sistema.
          </p>
        </div>
      </header>

      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-label="Serviços">
        <ul className={estilos.servicos}>
          {AGENCIA.servicos.map((s) => (
            <li key={s.id} className={estilos.servico}>
              <h2 className={estilos.servicoTitulo}>{s.titulo}</h2>
              <p className={estilos.servicoTexto}>{s.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-labelledby="titulo-processo">
        <div className={estilos.cabecalho}>
          <h2 id="titulo-processo" className={estilos.tituloSecao}>
            Do primeiro café ao sistema no ar.
          </h2>
          <p className={estilos.leadSecao}>
            Em Porto Velho a visita é presencial. Fora daqui, cada passo acontece por chamada de vídeo.
          </p>
        </div>
        <ol className={estilos.passos}>
          {AGENCIA.processo.map((p) => (
            <li key={p.titulo} className={estilos.passo}>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-labelledby="titulo-video">
        <div className={estilos.cabecalho}>
          <h2 id="titulo-video" className={estilos.tituloSecao}>
            {AGENCIA.video.titulo}
          </h2>
          <p className={estilos.leadSecao}>{AGENCIA.video.descricao}</p>
        </div>
        <video
          src={AGENCIA.video.src}
          poster={AGENCIA.video.poster}
          controls
          playsInline
          preload="none"
          style={{ width: '100%', maxWidth: 420, borderRadius: 24, border: '1px solid var(--linha)', background: 'var(--noite-2)' }}
        />
      </section>

      <Chamada />
    </>
  )
}
