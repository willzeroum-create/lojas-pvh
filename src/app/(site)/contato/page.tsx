import type { Metadata } from 'next'
import { AGENCIA } from '@/lib/config/agencia'
import FormularioCotacao from '../_componentes/FormularioCotacao'
import estilos from '../site.module.css'

export const metadata: Metadata = {
  title: 'Contato',
  description: 'Peça a cotação do seu sistema ou site pelo WhatsApp.',
}

export default function Contato() {
  return (
    <>
      <header className={estilos.cabecaAba}>
        <div className={estilos.conteudo}>
          <h1 className={estilos.tituloAba}>{AGENCIA.contato.titulo}</h1>
          <p className={estilos.leadAba}>{AGENCIA.contato.texto}</p>
        </div>
      </header>
      <section className={`${estilos.conteudo} ${estilos.secao}`} aria-label="Pedir cotação e perguntas">
        <div className={estilos.contatoGrade}>
          <FormularioCotacao />
          <div>
            <h2 className={estilos.tituloSecao} style={{ fontSize: 'clamp(34px, 4vw, 52px)', marginBottom: 24 }}>
              Antes de chamar
            </h2>
            <div className={estilos.perguntas}>
              {AGENCIA.perguntas.map((p) => (
                <details key={p.pergunta} className={estilos.pergunta}>
                  <summary>{p.pergunta}</summary>
                  <p>{p.resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
