import { AGENCIA, linkWhatsappAgencia } from '@/lib/config/agencia'
import Revelar from './Revelar'
import estilos from './landing.module.css'

type ModeloPlano = { nome: string; preco: string; texto: string }
type ConteudoPlanos = {
  mostrarPrecos: boolean
  mensal: ModeloPlano
  compra: ModeloPlano
  semPreco: string
}

/** A publicação dos valores é uma decisão do conteúdo, independente da apresentação. */
export default function Planos({ planos }: { planos: ConteudoPlanos }) {
  return (
    <div>
      <div className={estilos.planos}>
        {[planos.mensal, planos.compra].map((plano, indice) => (
          <Revelar key={plano.nome} atraso={indice * 90} className={estilos.plano}>
            <span className={estilos.indicePlano}>
              0{indice + 1}
              <span aria-hidden="true">↗</span>
            </span>
            <h3>{plano.nome}</h3>
            {planos.mostrarPrecos && <p className={estilos.precoPlano}>{plano.preco}</p>}
            <p>{plano.texto}</p>
            <a href={linkWhatsappAgencia()} className={estilos.linkClaro}>
              {AGENCIA.hero.ctaPrincipal}
              <span aria-hidden="true">↗</span>
            </a>
          </Revelar>
        ))}
      </div>
      {!planos.mostrarPrecos && <p className={estilos.planosSemPreco}>{planos.semPreco}</p>}
    </div>
  )
}
