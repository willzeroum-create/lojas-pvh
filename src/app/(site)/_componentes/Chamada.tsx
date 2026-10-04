import { AGENCIA, linkWhatsappAgencia } from '@/lib/config/agencia'
import estilos from '../site.module.css'

/** Fecho de todas as abas: um pedido só, a cotação. */
export default function Chamada({ titulo = 'Bora montar o seu?' }: { titulo?: string }) {
  return (
    <section className={`${estilos.conteudo} ${estilos.chamada}`} aria-labelledby="titulo-chamada">
      <h2 id="titulo-chamada" className={estilos.chamadaTitulo}>
        {titulo}
      </h2>
      <p className={estilos.leadSecao}>{AGENCIA.contato.texto}</p>
      <a href={linkWhatsappAgencia()} className={estilos.botaoSol}>
        {AGENCIA.planos.cta}
      </a>
    </section>
  )
}
