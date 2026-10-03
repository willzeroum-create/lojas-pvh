'use client'

import { useActionState, useState } from 'react'
import { Markdown } from '@/components/markdown'
import { Botao } from '@/components/ui/botao'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { NotaInternaLinha } from '@/lib/supabase/tipos'
import { apagarNota, guardarNota, type EstadoFormulario } from '../../../../actions'

const MODELO_NOVA = `## Contexto

## Combinado

## Acessos

| Serviço | Login | Onde está |
|---|---|---|
|  |  |  |

## Próximos passos

- [ ] `

/** Editor lado a lado: Markdown à esquerda, resultado à direita. */
export function EditorNota({ tenantId, nota }: { tenantId: string; nota: NotaInternaLinha | null }) {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(
    guardarNota.bind(null, tenantId, nota?.id ?? null),
    {},
  )
  const [conteudo, setConteudo] = useState(nota?.conteudo ?? MODELO_NOVA)

  return (
    <form action={accao} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Campo
          rotulo="Título"
          name="titulo"
          defaultValue={nota?.titulo ?? ''}
          required
          maxLength={120}
          className="min-w-64 flex-1"
          erro={estado.porCampo?.titulo}
          autoFocus={!nota}
        />
        <label className="flex h-12 items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="fixada"
            defaultChecked={nota?.fixada ?? false}
            className="size-5 accent-tinta"
          />
          Fixar no topo
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-carvao">Markdown</span>
          <textarea
            name="conteudo"
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="min-h-[60dvh] w-full rounded-lg border border-areia bg-branco px-3.5 py-3 font-mono text-sm leading-relaxed focus:border-tinta focus:outline-none"
            spellCheck={false}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-carvao">Pré-visualização</span>
          <div className="min-h-[60dvh] rounded-lg border border-areia/70 bg-branco px-5 py-4">
            <Markdown texto={conteudo} />
            {!conteudo.trim() && <p className="text-sm text-nevoa">Nada escrito ainda.</p>}
          </div>
        </div>
      </div>

      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}

      <div className="flex items-center gap-2">
        <BotaoSubmeter>{nota ? 'Guardar nota' : 'Criar nota'}</BotaoSubmeter>
        {nota && (
          <Botao
            type="button"
            variante="perigo"
            className="ml-auto"
            onClick={() => {
              if (confirm(`Apagar a nota “${nota.titulo}”?`)) void apagarNota(tenantId, nota.id)
            }}
          >
            Apagar
          </Botao>
        )}
      </div>
    </form>
  )
}
