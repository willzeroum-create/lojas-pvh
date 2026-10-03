'use client'

import { useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Mensagem } from '@/components/ui/mensagem'
import { resumoDoDiaAction } from '../actions'

export function ResumoWhatsapp() {
  const [resumo, definirResumo] = useState<{ texto: string; url: string } | null>(null)
  const [erro, definirErro] = useState('')
  const [ocupado, definirOcupado] = useState(false)
  const enviando = useRef(false)
  async function gerar() {
    if (enviando.current) return
    enviando.current = true
    definirOcupado(true)
    definirErro('')
    try {
      const resultado = await resumoDoDiaAction()
      if (resultado.ok) definirResumo(resultado)
      else {
        definirResumo(null)
        definirErro(resultado.erro)
      }
    } catch {
      definirResumo(null)
      definirErro('Não foi possível carregar o resumo. Tente novamente.')
    } finally {
      enviando.current = false
      definirOcupado(false)
    }
  }
  return (
    <section
      aria-labelledby="titulo-resumo-whatsapp"
      className="resumo-whatsapp-area min-w-0 rounded-xl border border-areia bg-papel-2 p-4 sm:p-6"
    >
      <h2 id="titulo-resumo-whatsapp" className="flex items-start gap-3 text-xl font-bold">
        <MessageCircle aria-hidden="true" className="mt-1 size-5 shrink-0" />
        Resumo do dia no WhatsApp
      </h2>
      <p className="mt-2 mb-5 text-sm text-carvao">
        Confira os números de hoje antes de enviar para o seu WhatsApp.
      </p>
      {erro && (
        <Mensagem tipo="erro" className="mb-4">
          {erro}
        </Mensagem>
      )}
      {resumo && (
        <div
          aria-label="Pré-visualização da mensagem"
          className="mb-5 rounded-xl rounded-tr-none border border-verde/25 bg-verde-clara p-4 text-sm leading-relaxed wrap-anywhere whitespace-pre-wrap text-tinta"
        >
          {resumo.texto
            .split(/(\*[^*\n]+\*)/g)
            .map((trecho, indice) =>
              trecho.startsWith('*') && trecho.endsWith('*') ? (
                <strong key={indice}>{trecho.slice(1, -1)}</strong>
              ) : (
                trecho
              ),
            )}
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Botao
          type="button"
          variante={resumo ? 'secundario' : 'primario'}
          onClick={gerar}
          carregando={ocupado}
        >
          {resumo ? 'Atualizar prévia' : 'Preparar resumo de hoje'}
        </Botao>
        {resumo && !ocupado && (
          <a
            href={resumo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[#176b3a] px-5 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
          >
            Enviar no meu WhatsApp<span className="sr-only"> (abre em nova aba)</span>
          </a>
        )}
      </div>
    </section>
  )
}
