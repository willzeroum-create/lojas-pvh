'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Botao } from '@/components/ui/botao'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { CategoriaLinha } from '@/lib/supabase/tipos'
import { apagarCategoria, guardarCategoria, type EstadoFormulario } from '../actions'

export function FormularioCategoria({ categoria }: { categoria: CategoriaLinha | null }) {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(
    guardarCategoria.bind(null, categoria?.id ?? null),
    {},
  )

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/painel/cardapio"
        className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
      >
        ← Cardápio
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{categoria ? 'Editar categoria' : 'Nova categoria'}</h1>
      <form action={accao} className="mt-6 flex flex-col gap-4">
        <Campo
          rotulo="Nome"
          name="nome"
          defaultValue={categoria?.nome}
          required
          maxLength={60}
          erro={estado.porCampo?.nome}
          autoFocus
        />
        <Campo
          rotulo="Ordem"
          name="ordem"
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={categoria?.ordem ?? 0}
          ajuda="Categorias com número menor aparecem primeiro."
          erro={estado.porCampo?.ordem}
        />
        <label className="flex min-h-12 items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            name="ativo"
            defaultChecked={categoria?.ativo ?? true}
            className="size-5 accent-tinta"
          />
          Visível na página pública
        </label>
        {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
        <BotaoSubmeter tamanho="lg" cheio>
          Guardar
        </BotaoSubmeter>
        {categoria && (
          <Botao
            type="button"
            variante="perigo"
            onClick={() => {
              if (confirm(`Apagar “${categoria.nome}” e todos os seus produtos?`))
                void apagarCategoria(categoria.id)
            }}
          >
            Apagar categoria
          </Botao>
        )}
      </form>
    </div>
  )
}
