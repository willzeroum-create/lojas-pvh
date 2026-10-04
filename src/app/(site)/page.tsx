import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { AGENCIA } from '@/lib/config/agencia'
import Chamada from './_componentes/Chamada'
import Comparador from './_componentes/Comparador'
import Heroi from './_componentes/Heroi'
import estilos from './site.module.css'

export const metadata: Metadata = {
  title: { absolute: `${AGENCIA.nome} · Sistemas e sites para lojas, stands e restaurantes` },
  description:
    'Sistema de gestão, cardápio, site e loja virtual montados para o seu negócio. De Porto Velho para clientes no Brasil, Portugal, Espanha e Países Baixos.',
  openGraph: { locale: 'pt_BR', type: 'website' },
}

export default function Inicio() {
  const destaques = AGENCIA.portfolio.filter((p) => p.imagem).slice(0, 3)
  return (
    <>
      <Heroi />

      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-labelledby="titulo-antes">
        <div className={estilos.cabecalho}>
          <h2 id="titulo-antes" className={estilos.tituloSecao}>
            Sai o caderno. Entra o balcão que trabalha sozinho.
          </h2>
          <p className={estilos.leadSecao}>
            Arraste a linha e veja o que muda no dia a dia de quem atende, cobra e repõe o estoque.
          </p>
        </div>
        <Comparador antes={AGENCIA.antesDepois.antes} depois={AGENCIA.antesDepois.depois} />
      </section>

      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-labelledby="titulo-mundos">
        <div className={estilos.cabecalho}>
          <h2 id="titulo-mundos" className={estilos.tituloSecao}>
            Três mundos. Um sistema para cada um.
          </h2>
          <p className={estilos.leadSecao}>
            Não é o mesmo pacote com outra cor. Cada negócio recebe só o que usa, e o resto entra quando precisar.
          </p>
        </div>
        <div className={estilos.mundos}>
          {AGENCIA.segmentos.map((s) => (
            <Link key={s.id} href={`/segmentos#${s.id}`} className={estilos.mundo}>
              <span className={estilos.mundoMarca} aria-hidden="true">
                {s.nome.charAt(0)}
              </span>
              <h3 className={estilos.mundoNome}>{s.nome}</h3>
              <ul className={estilos.mundoEntregas}>
                {s.entregas.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <div style={{ display: 'grid', gap: 14 }}>
                <p className={estilos.mundoFrase}>{s.frase}</p>
                <span className={estilos.mundoIr}>Ver o que montamos</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-labelledby="titulo-trabalhos">
        <div className={estilos.cabecalho}>
          <h2 id="titulo-trabalhos" className={estilos.tituloSecao}>
            {AGENCIA.presenca.titulo}
          </h2>
          <p className={estilos.leadSecao}>{AGENCIA.presenca.texto}</p>
        </div>
        <div className={estilos.trabalhos}>
          {destaques.map((p, i) => (
            <Link key={p.nome} href="/trabalhos" className={estilos.trabalho} style={{ textDecoration: 'none', gridColumn: i === 0 ? '1 / -1' : undefined }}>
              <div className={estilos.trabalhoCapa}>
                <Image src={p.imagem!} alt={p.nome} fill sizes={i === 0 ? '(max-width: 860px) 100vw, 1360px' : '(max-width: 860px) 100vw, 680px'} priority={i === 0} />
                <span className={estilos.trabalhoLocal}>{p.tipo}</span>
              </div>
              <div className={estilos.trabalhoTexto}>
                <h3>{p.nome}</h3>
                <p>{p.descricao}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className={estilos.numeros} style={{ marginTop: 'clamp(60px, 8vw, 100px)' }}>
          {AGENCIA.numeros.map((n) => (
            <div key={n.rotulo} className={estilos.numero}>
              <span className={estilos.numeroValor}>{n.valor}</span>
              <span className={estilos.numeroRotulo}>{n.rotulo}</span>
            </div>
          ))}
        </div>
      </section>

      <Chamada />
    </>
  )
}
