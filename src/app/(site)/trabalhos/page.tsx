import type { Metadata } from 'next'
import Image from 'next/image'
import { AGENCIA } from '@/lib/config/agencia'
import Chamada from '../_componentes/Chamada'
import estilos from '../site.module.css'

export const metadata: Metadata = {
  title: 'Trabalhos',
  description: 'Sites, lojas e sistemas que montamos para clientes no Brasil, em Portugal, na Espanha e nos Países Baixos.',
}

export default function Trabalhos() {
  return (
    <>
      <header className={estilos.cabecaAba}>
        <div className={estilos.conteudo}>
          <h1 className={estilos.tituloAba}>{AGENCIA.presenca.titulo}</h1>
          <p className={estilos.leadAba}>{AGENCIA.presenca.texto}</p>
          <ul className={estilos.paises} aria-label="Países com clientes">
            {AGENCIA.presenca.paises.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </header>

      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-label="Projetos">
        <div className={estilos.trabalhos}>
          {AGENCIA.portfolio.map((p, i) => (
            <article key={p.nome} className={estilos.trabalho}>
              <div className={estilos.trabalhoCapa}>
                {p.imagem ? (
                  <Image src={p.imagem} alt={p.nome} fill sizes="(max-width: 860px) 100vw, 680px" priority={i < 2} />
                ) : (
                  <span className={estilos.trabalhoSemImagem}>{p.nome}</span>
                )}
                <span className={estilos.trabalhoLocal}>{p.tipo}</span>
              </div>
              <div className={estilos.trabalhoTexto}>
                <h2 style={{ margin: 0, font: '750 26px/1.05 var(--titulo)', fontStretch: '82%' }}>{p.nome}</h2>
                <p>{p.descricao}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Chamada titulo="O próximo pode ser o seu." />
    </>
  )
}
