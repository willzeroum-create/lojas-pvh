'use client'

import { ExternalLink, FileText, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Mensagem } from '@/components/ui/mensagem'
import type { Arquivo } from '@/lib/dados/arquivos'
import { formatarTamanho } from '@/lib/dominio/ficheiro'
import { apagarArquivo } from '../../../../actions'

function quando(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

/** Grelha de miniaturas. Imagens mostram-se; o resto é um cartão com o nome. Abrir e apagar num toque. */
export function GaleriaArquivos({ tenantId, arquivos }: { tenantId: string; arquivos: Arquivo[] }) {
  const router = useRouter()
  const [erro, setErro] = useState<string | null>(null)
  const [aApagar, iniciar] = useTransition()

  const apagar = (a: Arquivo) => {
    if (!confirm(`Apagar “${a.nome}”? Não dá para desfazer.`)) return
    iniciar(async () => {
      const r = await apagarArquivo(tenantId, a.id)
      if (!r.ok) setErro(r.erro)
      else router.refresh()
    })
  }

  if (arquivos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-areia px-6 py-14 text-center text-carvao">
        <p className="text-lg font-semibold">Ainda sem arquivos nesta pasta</p>
        <p className="mt-1 text-sm">
          Fotos da fachada, dos produtos, o logo, o cardápio de papel: tudo o que a equipa recolher fica aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {arquivos.map((a) => (
          <li
            key={a.id}
            className="group flex flex-col overflow-hidden rounded-lg border border-areia/70 bg-branco shadow-cartao transition-shadow hover:shadow-flutuante"
          >
            <a
              href={a.url ?? '#'}
              target="_blank"
              rel="noopener"
              className="relative block aspect-square bg-papel-2"
            >
              {a.imagem && a.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- link assinado, temporário
                <img src={a.url} alt={a.nome} className="size-full object-cover" loading="lazy" />
              ) : (
                <span className="flex size-full flex-col items-center justify-center gap-2 text-cinza">
                  <FileText className="size-10" />
                  <span className="px-2 text-center text-xs font-semibold break-all">
                    {a.nome.split('.').pop()?.toUpperCase()}
                  </span>
                </span>
              )}
            </a>
            <div className="flex flex-col gap-1 p-2.5">
              <p className="truncate text-sm font-semibold" title={a.nome}>
                {a.nome}
              </p>
              <p className="truncate text-xs text-cinza">
                {a.pasta} · {formatarTamanho(a.tamanho)}
              </p>
              <p className="truncate text-xs text-cinza">
                {a.autor_nome ?? 'Equipa'} · {quando(a.criado_em)}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <a
                  href={a.url ?? '#'}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex h-9 items-center gap-1 text-xs font-semibold text-carvao hover:underline"
                >
                  <ExternalLink className="size-3.5" /> Abrir
                </a>
                <button
                  type="button"
                  onClick={() => apagar(a)}
                  disabled={aApagar}
                  aria-label={`Apagar ${a.nome}`}
                  className="inline-flex size-9 items-center justify-center rounded-md text-cinza hover:bg-vermelho-clara hover:text-vermelho"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
