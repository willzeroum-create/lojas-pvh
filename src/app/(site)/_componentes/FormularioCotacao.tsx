'use client'

import { useState } from 'react'
import { AGENCIA, linkWhatsappAgencia } from '@/lib/config/agencia'
import estilos from '../site.module.css'

/**
 * Pedido de cotação: monta a mensagem e abre o WhatsApp. Nada é guardado no
 * site; a conversa continua no WhatsApp.
 */
export default function FormularioCotacao() {
  const [segmento, definirSegmento] = useState<string>(AGENCIA.segmentos[0]!.nome)
  const [copiado, definirCopiado] = useState(false)
  const temNumero = !!AGENCIA.whatsapp

  function mensagem(fd: FormData) {
    const v = (k: string) => String(fd.get(k) ?? '').trim()
    return [
      `Olá! Quero uma cotação.`,
      v('nome') && `Nome: ${v('nome')}`,
      v('empresa') && `Empresa: ${v('empresa')}`,
      `Segmento: ${segmento}`,
      v('cidade') && `Cidade/país: ${v('cidade')}`,
      v('precisa') && `O que preciso: ${v('precisa')}`,
    ]
      .filter(Boolean)
      .join('\n')
  }

  return (
    <form
      className={estilos.formulario}
      onSubmit={async (e) => {
        e.preventDefault()
        const texto = mensagem(new FormData(e.currentTarget))
        if (temNumero) {
          window.open(linkWhatsappAgencia(texto), '_blank', 'noopener')
        } else {
          try {
            await navigator.clipboard.writeText(texto)
            definirCopiado(true)
          } catch {
            definirCopiado(false)
          }
        }
      }}
    >
      <label className={estilos.campo}>
        Seu nome
        <input name="nome" autoComplete="name" required maxLength={60} />
      </label>
      <label className={estilos.campo}>
        Nome da empresa
        <input name="empresa" autoComplete="organization" maxLength={80} />
      </label>
      <fieldset className={estilos.grupoModulos} style={{ margin: 0 }}>
        <legend>Segmento</legend>
        <div className={estilos.opcoesSegmento}>
          {[...AGENCIA.segmentos.map((s) => s.nome), 'Outro'].map((nome) => (
            <label key={nome} className={estilos.modulo}>
              <input type="radio" name="segmento" checked={segmento === nome} onChange={() => definirSegmento(nome)} />
              {nome}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={estilos.campo}>
        Cidade e país
        <input name="cidade" placeholder="Porto Velho, Brasil" maxLength={60} />
      </label>
      <label className={estilos.campo}>
        O que a sua empresa precisa?
        <textarea name="precisa" placeholder="Ex.: cardápio digital com pedido no WhatsApp e controle de estoque" maxLength={600} />
      </label>
      <button type="submit" className={estilos.botaoSol}>
        {temNumero ? AGENCIA.planos.cta : 'Copiar o pedido de cotação'}
      </button>
      <p className={estilos.nota} aria-live="polite">
        {temNumero
          ? 'Abre o WhatsApp com a mensagem pronta. Resposta no mesmo dia.'
          : copiado
            ? 'Mensagem copiada. O WhatsApp comercial entra no ar em breve.'
            : 'O WhatsApp comercial entra no ar em breve.'}
      </p>
    </form>
  )
}
