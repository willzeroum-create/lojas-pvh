import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AGENCIA } from '@/lib/config/agencia'
import Chamada from '../_componentes/Chamada'
import estilos from '../site.module.css'

export const metadata: Metadata = {
  title: 'Segmentos',
  description: 'O que montamos para restaurantes, stands de carros e lojas.',
}

export default function Segmentos() {
  return (
    <>
      <header className={estilos.cabecaAba}>
        <div className={estilos.conteudo}>
          <h1 className={estilos.tituloAba}>Restaurantes. Stands. Lojas.</h1>
          <p className={estilos.leadAba}>
            Cada negócio tem o seu balcão. A gente monta o sistema e o site em volta dele, e não o contrário.
          </p>
        </div>
      </header>

      <div className={estilos.conteudo}>
        {AGENCIA.segmentos.map((s) => {
          const exemplo = s.exemplo ? AGENCIA.portfolio.find((p) => p.nome === s.exemplo) : null
          return (
            <section key={s.id} id={s.id} className={estilos.segmento} aria-labelledby={`titulo-${s.id}`}>
              <div>
                <h2 id={`titulo-${s.id}`} className={estilos.segmentoNome}>
                  {s.nome}
                </h2>
                <p className={estilos.segmentoFrase}>{s.frase}</p>
                <p className={estilos.leadSecao} style={{ marginTop: 22 }}>
                  {s.texto}
                </p>
                <ul className={estilos.entregas} aria-label={`O que entregamos para ${s.nome.toLowerCase()}`}>
                  {s.entregas.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
              {exemplo?.imagem ? (
                <Link href="/trabalhos" className={estilos.trabalho} style={{ textDecoration: 'none', alignSelf: 'center' }}>
                  <div className={estilos.trabalhoCapa}>
                    <Image src={exemplo.imagem} alt={exemplo.nome} fill sizes="(max-width: 860px) 100vw, 640px" />
                    <span className={estilos.trabalhoLocal}>{exemplo.tipo}</span>
                  </div>
                  <div className={estilos.trabalhoTexto}>
                    <h3>{exemplo.nome}</h3>
                    <p>{exemplo.descricao}</p>
                  </div>
                </Link>
              ) : (
                <Link href="/lanchonete-da-praca" className={estilos.mundo} style={{ alignSelf: 'center', minHeight: 320 }}>
                  <h3 className={estilos.mundoNome}>Veja um cardápio de verdade</h3>
                  <div style={{ display: 'grid', gap: 14 }}>
                    <p className={estilos.mundoFrase}>
                      A Lanchonete da Praça é a nossa loja de demonstração: escolha, monte o pedido e veja ele chegar pronto no
                      WhatsApp.
                    </p>
                    <span className={estilos.mundoIr}>Abrir o cardápio</span>
                  </div>
                </Link>
              )}
            </section>
          )
        })}
      </div>

      <Chamada titulo="O seu negócio não está aqui?" />
    </>
  )
}
