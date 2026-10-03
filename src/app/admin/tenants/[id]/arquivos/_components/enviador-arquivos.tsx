'use client'

import { CheckCircle2, CloudUpload, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Girante } from '@/components/ui/botao'
import { redimensionarParaWebp } from '@/lib/imagem/redimensionar'
import { gerarSlug } from '@/lib/dominio/slug'
import { clienteBrowser } from '@/lib/supabase/browser'
import { PASTAS_SUGERIDAS } from '@/lib/validacao/arquivos'
import { cn } from '@/lib/utils/cn'
import { guardarArquivo } from '../../../../actions'

const BUCKET = 'arquivos'
const LIMITE = 25 * 1024 * 1024

type Envio = { nome: string; estado: 'a_enviar' | 'ok' | 'erro'; erro?: string }

type Props = { tenantId: string; pastasExistentes: string[]; pastaInicial?: string }

/**
 * Escolher a pasta, largar os ficheiros. Fotos passam pelo redimensionador
 * (WebP até 2000 px) para não pesarem; o resto sobe como está. Cada ficheiro
 * vai direto do browser para o bucket e depois é registado no índice.
 */
export function EnviadorArquivos({ tenantId, pastasExistentes, pastaInicial }: Props) {
  const router = useRouter()
  const [pasta, setPasta] = useState(pastaInicial ?? pastasExistentes[0] ?? PASTAS_SUGERIDAS[0])
  const [envios, setEnvios] = useState<Envio[]>([])
  const [arrastando, setArrastando] = useState(false)
  const entrada = useRef<HTMLInputElement>(null)
  const sugestoes = [...new Set([...pastasExistentes, ...PASTAS_SUGERIDAS])]

  const atualizar = (nome: string, patch: Partial<Envio>) =>
    setEnvios((lista) => lista.map((e) => (e.nome === nome ? { ...e, ...patch } : e)))

  const enviar = async (ficheiros: File[]) => {
    const pastaLimpa = pasta.trim() || 'Geral'
    setEnvios((lista) => [...ficheiros.map((f) => ({ nome: f.name, estado: 'a_enviar' as const })), ...lista])
    const supabase = clienteBrowser()

    for (const [i, ficheiro] of ficheiros.entries()) {
      try {
        if (ficheiro.size > LIMITE) throw new Error('Acima de 25 MB.')
        const imagemReduzivel =
          ficheiro.type.startsWith('image/') && !['image/gif', 'image/svg+xml'].includes(ficheiro.type)
        const corpo = imagemReduzivel ? await redimensionarParaWebp(ficheiro, 2000, 0.85) : ficheiro
        const tipo = imagemReduzivel ? 'image/webp' : ficheiro.type || 'application/octet-stream'
        const base = ficheiro.name.replace(/\.[^.]+$/, '')
        const extensao = imagemReduzivel
          ? 'webp'
          : (ficheiro.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? 'bin')
        const nome = `${base}.${extensao}`
        const caminho = `${tenantId}/${gerarSlug(pastaLimpa)}/${Date.now()}-${i}-${gerarSlug(base)}.${extensao}`

        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(caminho, corpo, { contentType: tipo, cacheControl: '3600' })
        if (error) throw new Error(error.message)
        const r = await guardarArquivo({
          tenantId,
          pasta: pastaLimpa,
          nome,
          caminho,
          tipo,
          tamanho: corpo.size,
        })
        if (!r.ok) throw new Error(r.erro)
        atualizar(ficheiro.name, { estado: 'ok' })
      } catch (e) {
        atualizar(ficheiro.name, { estado: 'erro', erro: e instanceof Error ? e.message : 'Falha no envio.' })
      }
    }
    router.refresh()
  }

  return (
    <section className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-semibold text-cinza">
          Pasta
          <input
            list="pastas-sugeridas"
            value={pasta}
            onChange={(e) => setPasta(e.target.value)}
            maxLength={60}
            className="h-10 rounded-md border border-areia bg-branco px-3 text-[15px] font-normal text-tinta focus:border-tinta focus:outline-none"
            placeholder="Ex.: Fotos de produtos"
          />
          <datalist id="pastas-sugeridas">
            {sugestoes.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-tinta px-4 text-sm font-semibold text-papel hover:bg-carvao"
        >
          <CloudUpload className="size-4" /> Escolher ficheiros
        </button>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setArrastando(true)
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault()
          setArrastando(false)
          void enviar([...e.dataTransfer.files])
        }}
        onClick={() => entrada.current?.click()}
        className={cn(
          'mt-3 flex min-h-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-4 text-center text-sm transition-colors',
          arrastando ? 'border-tinta bg-papel-2 text-tinta' : 'border-areia text-cinza hover:border-carvao',
        )}
      >
        Largue aqui fotos, PDFs ou planilhas, ou clique para escolher. Pode enviar vários de uma vez.
      </div>
      <input
        ref={entrada}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void enviar([...e.target.files])
          e.target.value = ''
        }}
      />

      {envios.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {envios.map((e, i) => (
            <li key={`${e.nome}-${i}`} className="flex items-center gap-2">
              {e.estado === 'a_enviar' && <Girante className="size-4 text-cinza" />}
              {e.estado === 'ok' && <CheckCircle2 className="size-4 text-verde" />}
              {e.estado === 'erro' && <XCircle className="size-4 text-vermelho" />}
              <span className="truncate">{e.nome}</span>
              {e.erro && <span className="text-vermelho">· {e.erro}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
