import type { Metadata } from 'next'
import { Barlow_Condensed } from 'next/font/google'
import Link from 'next/link'
import { AGENCIA, linkWhatsappAgencia } from '@/lib/config/agencia'
import { MODULOS } from '@/lib/modulos/catalogo'
import MonteSeuSistema from './_landing/MonteSeuSistema'
import { MockupCatalogo, MockupPainel } from './_landing/MockupsProduto'
import Portfolio from './_landing/Portfolio'
import Planos from './_landing/Planos'
import Revelar from './_landing/Revelar'
import VideoAgencia from './_landing/VideoAgencia'
import estilos from './_landing/landing.module.css'

const condensada = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-condensada',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { absolute: `${AGENCIA.nome} · ${AGENCIA.hero.sobretitulo}` },
  description: AGENCIA.hero.subtitulo,
  openGraph: {
    title: `${AGENCIA.nome} · ${AGENCIA.hero.titulo}`,
    description: AGENCIA.hero.subtitulo,
    locale: 'pt_BR',
    type: 'website',
  },
}

function Seta() {
  return <span aria-hidden="true">↗</span>
}

function Marca() {
  return (
    <a className={estilos.marca} href="#inicio" aria-label={`${AGENCIA.nome} — Início`}>
      <span className={estilos.simbolo} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {AGENCIA.nome}
      <span className={estilos.pontoMarca} aria-hidden="true">
        .
      </span>
    </a>
  )
}

/** A composição fica no servidor; só seleção, vídeo e revelações precisam de JavaScript. */
export default function PaginaInicial() {
  const whatsapp = linkWhatsappAgencia()
  const separadorTitulo = AGENCIA.hero.titulo.indexOf(',')
  const tituloPrincipal = AGENCIA.hero.titulo.slice(0, separadorTitulo + 1)
  const tituloDestaque = AGENCIA.hero.titulo.slice(separadorTitulo + 1).trim()
  const [sistema, cardapio, ...outrosServicos] = AGENCIA.servicos

  return (
    <div className={`${condensada.variable} ${estilos.landing}`} id="inicio" data-landing-agencia>
      <a className={estilos.pular} href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className={estilos.cabecalho}>
        <div className={`${estilos.container} ${estilos.cabecalhoInterno}`}>
          <Marca />
          <nav className={estilos.navegacao} aria-label="Navegação principal">
            <a href="#servicos">Serviços</a>
            <a href="#sistema">{AGENCIA.monteOSeu.titulo}</a>
            <a href="#portfolio">Portfólio</a>
          </nav>
          <div className={estilos.acessos}>
            <Link href="/entrar" prefetch={false} className={estilos.entrar}>
              Entrar
            </Link>
            <a href={whatsapp} className={`${estilos.botao} ${estilos.botaoCabecalho}`}>
              {AGENCIA.hero.ctaPrincipal}
              <Seta />
            </a>
          </div>
        </div>
      </header>
      <main id="conteudo" tabIndex={-1}>
        <section className={`${estilos.container} ${estilos.hero}`} aria-labelledby="titulo-inicial">
          <div className={estilos.heroTexto}>
            <p className={estilos.sobretitulo}>
              <span className={estilos.marcador} />
              {AGENCIA.hero.sobretitulo}
            </p>
            <h1 id="titulo-inicial" className={estilos.tituloHero}>
              {tituloPrincipal} <span>{tituloDestaque}</span>
            </h1>
            <p className={estilos.descricaoHero}>{AGENCIA.hero.subtitulo}</p>
            <div className={estilos.acoes}>
              <a href={whatsapp} className={estilos.botao}>
                {AGENCIA.hero.ctaPrincipal}
                <Seta />
              </a>
              <a href="#servicos" className={estilos.linkTexto}>
                {AGENCIA.hero.ctaSecundario}
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
          <div className={estilos.heroProduto}>
            <div className={estilos.coordenada} aria-hidden="true">
              {AGENCIA.cidade} / {AGENCIA.uf}
              <span>01 — 07</span>
            </div>
            <div className={estilos.palcoProduto}>
              <div className={estilos.gradeProduto} aria-hidden="true" />
              <div className={estilos.painelHero}>
                <MockupPainel />
              </div>
              <div className={estilos.celularHero}>
                <MockupCatalogo />
              </div>
              <span className={estilos.seloProduto}>{AGENCIA.planos.mensal.nome}</span>
            </div>
            <div className={estilos.legendaProduto}>
              <span>{AGENCIA.nome}</span>
              <span>
                {AGENCIA.cidade} / {AGENCIA.uf}
              </span>
              <Seta />
            </div>
          </div>
          <div className={estilos.indiceHero}>
            {AGENCIA.processo.map((etapa, indice) => (
              <a href="#processo" key={etapa.titulo}>
                <span>0{indice + 1}</span>
                {etapa.titulo}
                <Seta />
              </a>
            ))}
          </div>
        </section>

        <section className={estilos.problema} aria-labelledby="titulo-problema">
          <div className={estilos.container}>
            <div className={estilos.etiquetas}>
              {AGENCIA.problema.etiquetas.map((etiqueta, indice) => (
                <Revelar key={etiqueta} atraso={indice * 90} className={estilos.etiquetaEnvelope}>
                  <span className={estilos.etiquetaProblema}>
                    <span aria-hidden="true">×</span>
                    {etiqueta}
                  </span>
                </Revelar>
              ))}
            </div>
            <div className={estilos.virada}>
              <Revelar>
                <h2 id="titulo-problema" className={estilos.tituloVirada}>
                  {AGENCIA.problema.virada}
                  <span>{AGENCIA.problema.viradaDestaque}</span>
                </h2>
              </Revelar>
              <Revelar atraso={120}>
                <p>{AGENCIA.problema.texto}</p>
                <a href="#sistema" className={estilos.linkClaro}>
                  {AGENCIA.monteOSeu.titulo}
                  <Seta />
                </a>
              </Revelar>
            </div>
          </div>
        </section>

        <section
          id="servicos"
          className={`${estilos.container} ${estilos.secao}`}
          aria-labelledby="titulo-servicos"
        >
          <Revelar className={estilos.cabecalhoSecao}>
            <p className={estilos.indice}>01 / Serviços</p>
            <h2 id="titulo-servicos">{AGENCIA.hero.ctaSecundario}</h2>
          </Revelar>
          <Revelar className={estilos.servicoDestaque}>
            <div className={estilos.servicoTexto}>
              <span className={estilos.numeroServico}>01</span>
              <h3>{sistema.titulo}</h3>
              <p>{sistema.texto}</p>
              <a href="#sistema" className={estilos.linkTexto}>
                {AGENCIA.monteOSeu.titulo}
                <Seta />
              </a>
            </div>
            <div className={estilos.modulosVisuais} aria-hidden="true">
              <div className={estilos.moduloBase}>
                {AGENCIA.nome}
                <Seta />
              </div>
              <div className={estilos.linhasModulos}>
                {['pedidos', 'estoque', 'financeiro', 'fiscal'].map((id) => (
                  <ModuloVisual key={id} id={id} />
                ))}
              </div>
            </div>
          </Revelar>
          <Revelar className={`${estilos.servicoDestaque} ${estilos.servicoCatalogo}`}>
            <div className={estilos.servicoTexto}>
              <span className={estilos.numeroServico}>02</span>
              <h3>{cardapio.titulo}</h3>
              <p>{cardapio.texto}</p>
              <a href="#video" className={estilos.linkTexto}>
                {AGENCIA.video.titulo}
                <Seta />
              </a>
            </div>
            <div className={estilos.catalogoServico}>
              <MockupCatalogo compacto />
              <span aria-hidden="true" className={estilos.conexaoCatalogo}>
                ↗
              </span>
              <div className={estilos.recibo}>
                <span>Pedido</span>
                <strong>#1042</strong>
                <span>3 itens</span>
                <b>R$ 529,70</b>
                <span className={estilos.reciboStatus}>
                  Novo <Seta />
                </span>
              </div>
            </div>
          </Revelar>
          <div className={estilos.outrosServicos}>
            {outrosServicos.map((servico, indice) => (
              <Revelar key={servico.id} className={estilos.linhaServico}>
                <span className={estilos.numeroLinha}>0{indice + 3}</span>
                <h3>{servico.titulo}</h3>
                <p>{servico.texto}</p>
                <span className={estilos.setaLinha} aria-hidden="true">
                  ↗
                </span>
              </Revelar>
            ))}
          </div>
        </section>

        <section id="sistema" className={estilos.secaoSistema} aria-labelledby="titulo-sistema">
          <div className={estilos.container}>
            <Revelar className={estilos.cabecalhoSistema}>
              <div>
                <p className={estilos.indice}>02 / Módulos</p>
                <h2 id="titulo-sistema">{AGENCIA.monteOSeu.titulo}</h2>
              </div>
              <p>{AGENCIA.monteOSeu.texto}</p>
            </Revelar>
            <MonteSeuSistema />
          </div>
        </section>

        <section
          id="processo"
          className={`${estilos.container} ${estilos.secao}`}
          aria-labelledby="titulo-processo"
        >
          <Revelar className={estilos.cabecalhoSecao}>
            <p className={estilos.indice}>03 / Como funciona</p>
            <h2 id="titulo-processo" className={estilos.tituloProcesso}>
              {AGENCIA.processo[0].titulo}
              <span aria-hidden="true"> → </span>
              {AGENCIA.processo[3].titulo}
            </h2>
          </Revelar>
          <div className={estilos.processo}>
            {AGENCIA.processo.map((etapa, indice) => (
              <Revelar key={etapa.titulo} atraso={indice * 70} className={estilos.etapa}>
                <span className={estilos.numeroEtapa}>
                  0{indice + 1}
                  <Seta />
                </span>
                <h3>{etapa.titulo}</h3>
                <p>{etapa.texto}</p>
              </Revelar>
            ))}
          </div>
        </section>

        <section id="planos" className={estilos.secaoPlanos} aria-labelledby="titulo-planos">
          <div className={estilos.container}>
            <Revelar className={estilos.cabecalhoSecao}>
              <p className={estilos.indice}>04 / Planos</p>
              <h2 id="titulo-planos">
                {AGENCIA.planos.mensal.nome}
                <span className={estilos.tituloAlternativo}> / {AGENCIA.planos.compra.nome}</span>
              </h2>
            </Revelar>
            <Planos planos={AGENCIA.planos} />
          </div>
        </section>

        <section
          id="portfolio"
          className={`${estilos.container} ${estilos.secao}`}
          aria-labelledby="titulo-portfolio"
        >
          <Revelar className={estilos.cabecalhoSecao}>
            <p className={estilos.indice}>05 / Portfólio</p>
            <h2 id="titulo-portfolio">Portfólio</h2>
            <span className={estilos.quantidadePortfolio}>
              {String(AGENCIA.portfolio.length).padStart(2, '0')}
            </span>
          </Revelar>
          <Portfolio itens={AGENCIA.portfolio} />
        </section>

        <section id="video" className={estilos.secaoVideo} aria-labelledby="titulo-video">
          <div className={`${estilos.container} ${estilos.videoInterno}`}>
            <Revelar className={estilos.videoTexto}>
              <p className={estilos.indice}>06 / Vídeo</p>
              <h2 id="titulo-video">{AGENCIA.video.titulo}</h2>
              <p>{AGENCIA.video.descricao}</p>
              <a href={whatsapp} className={estilos.botao}>
                {AGENCIA.hero.ctaPrincipal}
                <Seta />
              </a>
              <div className={estilos.marcaVideo} aria-hidden="true">
                {AGENCIA.nome}
                <Seta />
              </div>
            </Revelar>
            <div className={estilos.videoFrame}>
              <VideoAgencia video={AGENCIA.video} />
            </div>
          </div>
        </section>

        <section
          id="perguntas"
          className={`${estilos.container} ${estilos.secao} ${estilos.perguntas}`}
          aria-labelledby="titulo-perguntas"
        >
          <Revelar>
            <p className={estilos.indice}>07 / Perguntas</p>
            <h2 id="titulo-perguntas">Perguntas frequentes</h2>
          </Revelar>
          <div className={estilos.listaPerguntas}>
            {AGENCIA.perguntas.map((item, indice) => (
              <details key={item.pergunta} className={estilos.pergunta}>
                <summary>
                  <span className={estilos.numeroPergunta}>0{indice + 1}</span>
                  {item.pergunta}
                  <span className={estilos.iconePergunta} aria-hidden="true" />
                </summary>
                <p>{item.resposta}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contato" className={estilos.contato} aria-labelledby="titulo-contato">
          <div className={estilos.container}>
            <div className={estilos.contatoLocal}>
              <span className={estilos.marcador} />
              {AGENCIA.cidade} / {AGENCIA.uf}
              <span aria-hidden="true">↘</span>
            </div>
            <Revelar>
              <h2 id="titulo-contato">{AGENCIA.contato.titulo}</h2>
            </Revelar>
            <div className={estilos.contatoBase}>
              <p>{AGENCIA.contato.texto}</p>
              <a href={whatsapp} className={`${estilos.botao} ${estilos.botaoEscuro}`}>
                {AGENCIA.hero.ctaPrincipal}
                <Seta />
              </a>
            </div>
            {AGENCIA.instagram && (
              <a
                className={estilos.linkTexto}
                href={AGENCIA.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
                <Seta />
              </a>
            )}
          </div>
        </section>
      </main>
      <footer className={estilos.rodape}>
        <div className={`${estilos.container} ${estilos.rodapeInterno}`}>
          <Marca />
          <p>
            {AGENCIA.cidade} / {AGENCIA.uf}
          </p>
          <a href="#inicio">
            Voltar ao início <span aria-hidden="true">↑</span>
          </a>
          <Link href="/entrar" prefetch={false}>
            Entrar
          </Link>
        </div>
      </footer>
    </div>
  )
}

function ModuloVisual({ id }: { id: string }) {
  const modulo = MODULOS.find((item) => item.id === id)
  return modulo ? (
    <span className={estilos.moduloVisual}>
      <span>{modulo.nome}</span>
      <i />
    </span>
  ) : null
}
