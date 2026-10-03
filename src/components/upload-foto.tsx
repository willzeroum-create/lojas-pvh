'use client'

import { Camera, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'
import { redimensionarParaWebp } from '@/lib/imagem/redimensionar'
import { clienteBrowser } from '@/lib/supabase/browser'
import { cn } from '@/lib/utils/cn'
import { Girante } from './ui/botao'

type Props = {
  /** Caminho no bucket `fotos`, por exemplo `{tenantId}/produtos/{produtoId}.webp`. */
  caminho: string
  urlAtual: string | null
  /** Server Action que grava o URL (ou null) na linha certa. */
  onGuardar: (url: string | null) => Promise<void>
  formato?: 'quadrado' | 'redondo'
  rotulo?: string
}

/** Escolhe, redimensiona, envia para o Storage e grava o URL. Tudo num toque. */
export function UploadFoto({ caminho, urlAtual, onGuardar, formato = 'quadrado', rotulo = 'Foto' }: Props) {
  const [url, setUrl] = useState(urlAtual)
  const [erro, setErro] = useState<string | null>(null)
  const [aEnviar, iniciar] = useTransition()
  const entrada = useRef<HTMLInputElement>(null)

  const enviar = (ficheiro: File) => {
    setErro(null)
    iniciar(async () => {
      try {
        const blob = await redimensionarParaWebp(ficheiro)
        const supabase = clienteBrowser()
        const { error } = await supabase.storage
          .from('fotos')
          .upload(caminho, blob, { upsert: true, contentType: 'image/webp', cacheControl: '31536000' })
        if (error) throw new Error(error.message)
        const publico = `${supabase.storage.from('fotos').getPublicUrl(caminho).data.publicUrl}?v=${Date.now()}`
        await onGuardar(publico)
        setUrl(publico)
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Não foi possível enviar a foto.')
      }
    })
  }

  const remover = () => {
    iniciar(async () => {
      await clienteBrowser().storage.from('fotos').remove([caminho])
      await onGuardar(null)
      setUrl(null)
    })
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => entrada.current?.click()}
        disabled={aEnviar}
        aria-label={url ? `Trocar ${rotulo.toLowerCase()}` : `Adicionar ${rotulo.toLowerCase()}`}
        className={cn(
          'relative flex size-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-areia bg-papel-2 text-cinza transition-colors hover:border-carvao',
          formato === 'redondo' ? 'rounded-full' : 'rounded-lg',
        )}
      >
        {url ? (
          <Image src={url} alt="" fill sizes="96px" className="object-cover" unoptimized />
        ) : (
          <Camera className="size-7" />
        )}
        {aEnviar && (
          <span className="absolute inset-0 flex items-center justify-center bg-papel/70">
            <Girante className="size-6" />
          </span>
        )}
      </button>
      <div className="flex flex-col gap-1.5 text-sm">
        <p className="font-semibold">{rotulo}</p>
        <p className="text-cinza">Pode tirar com a câmera. A foto é reduzida antes de enviar.</p>
        {url && (
          <button
            type="button"
            onClick={remover}
            disabled={aEnviar}
            className="inline-flex h-9 items-center gap-1 self-start font-semibold text-vermelho"
          >
            <Trash2 className="size-4" /> Remover
          </button>
        )}
        {erro && <p className="text-vermelho">{erro}</p>}
      </div>
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) enviar(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
