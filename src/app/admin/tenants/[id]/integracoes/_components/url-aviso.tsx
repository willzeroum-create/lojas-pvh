'use client'

import { Check, Copy, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition } from 'react'
import { Botao } from '@/components/ui/botao'

export function UrlAviso({ id, url, nome }: { id: string; url: string; nome: string }) {
  const campo = useRef<HTMLTextAreaElement>(null)
  const [copiado, definirCopiado] = useState(false)
  const [erro, definirErro] = useState('')

  async function copiar() {
    definirErro('')
    try {
      await navigator.clipboard.writeText(url)
      definirCopiado(true)
    } catch {
      definirCopiado(false)
      campo.current?.focus()
      campo.current?.select()
      definirErro('Não foi possível copiar automaticamente. A URL foi selecionada para você copiar.')
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold text-carvao">
        URL de aviso · {nome}
      </label>
      <textarea
        id={id}
        ref={campo}
        value={url}
        readOnly
        rows={4}
        spellCheck={false}
        className="block w-full resize-y rounded-lg border border-areia bg-papel px-3 py-3 font-mono text-xs leading-relaxed break-all text-carvao focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
      />
      <Botao
        type="button"
        variante="secundario"
        onClick={copiar}
        aria-label={`Copiar URL de aviso do ${nome}`}
        icone={copiado ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      >
        {copiado ? 'URL copiada' : 'Copiar URL'}
      </Botao>
      <p aria-live="polite" role="status" className="text-sm text-carvao empty:hidden">
        {erro || (copiado ? 'URL copiada para a área de transferência.' : '')}
      </p>
    </div>
  )
}

export function AtualizarIntegracoes() {
  const navegador = useRouter()
  const [atualizando, iniciarTransicao] = useTransition()

  return (
    <Botao
      type="button"
      variante="secundario"
      carregando={atualizando}
      icone={<RefreshCw className="size-4" aria-hidden />}
      onClick={() => iniciarTransicao(() => navegador.refresh())}
    >
      {atualizando ? 'Carregando…' : 'Tentar novamente'}
    </Botao>
  )
}
