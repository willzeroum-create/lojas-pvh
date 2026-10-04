import Image from 'next/image'
import type { ItemPortfolio } from '@/lib/config/agencia'
import Revelar from './Revelar'
import estilos from './landing.module.css'

export default function Portfolio({ itens }: { itens: readonly ItemPortfolio[] }) {
  return (
    <div className={estilos.portfolio}>
      {itens.map((item, indice) => {
        const conteudo = (
          <>
            <div className={`${estilos.capaPortfolio} ${estilos[`capaPortfolio${indice % 4}`]}`}>
              <span className={estilos.indicePortfolio}>
                {String(indice + 1).padStart(2, '0')}
                <span>{item.tipo}</span>
              </span>
              {item.imagem ? (
                <Image
                  src={item.imagem}
                  alt={item.nome}
                  fill
                  sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1399px) 45vw, 620px"
                  className={estilos.imagemPortfolio}
                />
              ) : (
                <span className={estilos.nomePortfolio}>{item.nome}</span>
              )}
              <span className={estilos.gradePortfolio} aria-hidden="true" />
              {item.url && (
                <span className={estilos.abrirPortfolio} aria-hidden="true">
                  ↗
                </span>
              )}
            </div>
            <div className={estilos.descricaoPortfolio}>
              <h3>{item.nome}</h3>
              <p>{item.descricao}</p>
            </div>
          </>
        )
        return (
          <Revelar key={item.nome} atraso={(indice % 2) * 80}>
            <article>
              {item.url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={estilos.linkPortfolio}
                  aria-label={`Abrir ${item.nome} em nova aba`}
                >
                  {conteudo}
                </a>
              ) : (
                conteudo
              )}
            </article>
          </Revelar>
        )
      })}
    </div>
  )
}
