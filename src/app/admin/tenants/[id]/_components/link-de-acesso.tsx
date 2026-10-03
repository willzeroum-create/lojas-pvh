'use client'

import { Check, Copy, Link2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Botao } from '@/components/ui/botao'
import { gerarLinkDeAcesso } from '../../../actions'

/** Gera um link de entrada sem senha para o dono. Copiar e enviar por WhatsApp. */
export function LinkDeAcesso({ tenantId, userId }: { tenantId: string; userId: string }) {
  const [link, setLink] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [aGerar, iniciar] = useTransition()

  const gerar = () =>
    iniciar(async () => {
      setErro(null)
      const r = await gerarLinkDeAcesso(tenantId, userId)
      if (r.ok) setLink(r.url)
      else setErro(r.erro)
    })

  const copiar = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {link ? (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="h-9 min-w-0 flex-1 rounded-md border border-areia bg-papel-2 px-2 text-xs"
            onFocus={(e) => e.target.select()}
          />
          <Botao
            tamanho="sm"
            variante="secundario"
            onClick={copiar}
            icone={copiado ? <Check className="size-4 text-verde" /> : <Copy className="size-4" />}
          >
            {copiado ? 'Copiado' : 'Copiar'}
          </Botao>
        </div>
      ) : (
        <Botao
          tamanho="sm"
          variante="secundario"
          onClick={gerar}
          carregando={aGerar}
          icone={<Link2 className="size-4" />}
        >
          Gerar link de acesso
        </Botao>
      )}
      <p className="text-xs text-cinza">
        {link
          ? 'Vale uma vez, por uma hora. Envie por WhatsApp; abre o painel já com sessão.'
          : 'Entrada sem senha, para enviar ao dono.'}
      </p>
      {erro && <p className="text-xs text-vermelho">{erro}</p>}
    </div>
  )
}
