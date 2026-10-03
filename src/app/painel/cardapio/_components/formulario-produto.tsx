'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { UploadFoto } from '@/components/upload-foto'
import { Botao } from '@/components/ui/botao'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { AreaTexto, Campo, Seleccao } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { GrupoOpcaoLinha, OpcaoLinha, ProdutoLinha } from '@/lib/supabase/tipos'
import { apagarProduto, guardarFotoProduto, guardarProduto, type EstadoFormulario } from '../actions'
import { EditorGrupos, type GrupoEditavel } from './editor-grupos'

type ProdutoCompleto = ProdutoLinha & { grupos: Array<GrupoOpcaoLinha & { opcoes: OpcaoLinha[] }> }

type Props = {
  tenantId: string
  produto: ProdutoCompleto | null
  categorias: Array<{ id: string; nome: string }>
  categoriaInicial?: string
  acabouDeCriar?: boolean
}

export function FormularioProduto({ tenantId, produto, categorias, categoriaInicial, acabouDeCriar }: Props) {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(
    guardarProduto.bind(null, produto?.id ?? null),
    {},
  )
  const gruposIniciais: GrupoEditavel[] = (produto?.grupos ?? []).map((g) => ({
    nome: g.nome,
    min: g.min,
    max: g.max,
    obrigatorio: g.obrigatorio,
    opcoes: g.opcoes.map((o) => ({
      nome: o.nome,
      preco_adicional: Number(o.preco_adicional),
      disponivel: o.disponivel,
    })),
  }))

  return (
    <div className="mx-auto max-w-lg">
      <Link
        href="/painel/cardapio"
        className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
      >
        ← Cardápio
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{produto ? 'Editar produto' : 'Novo produto'}</h1>

      {acabouDeCriar && (
        <Mensagem tipo="sucesso" className="mt-4">
          Produto criado. Agora pode adicionar a foto.
        </Mensagem>
      )}

      {produto ? (
        <div className="mt-6">
          <UploadFoto
            caminho={`${tenantId}/produtos/${produto.id}.webp`}
            urlAtual={produto.foto_url}
            onGuardar={guardarFotoProduto.bind(null, produto.id)}
            rotulo="Foto do produto"
          />
        </div>
      ) : (
        <p className="mt-4 text-sm text-cinza">Guarde o produto primeiro para poder adicionar a foto.</p>
      )}

      <form action={accao} className="mt-6 flex flex-col gap-4">
        <Campo
          rotulo="Nome"
          name="nome"
          defaultValue={produto?.nome}
          required
          maxLength={100}
          erro={estado.porCampo?.nome}
        />
        <Seleccao
          rotulo="Categoria"
          name="categoria_id"
          defaultValue={produto?.categoria_id ?? categoriaInicial}
          required
          erro={estado.porCampo?.categoria_id}
        >
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Seleccao>
        <AreaTexto
          rotulo="Descrição"
          name="descricao"
          defaultValue={produto?.descricao ?? ''}
          maxLength={300}
          placeholder="Ingredientes, tamanho, o que vem junto…"
          erro={estado.porCampo?.descricao}
        />
        <div className="grid grid-cols-2 gap-3">
          <Campo
            rotulo="Preço (R$)"
            name="preco"
            inputMode="decimal"
            defaultValue={produto ? Number(produto.preco).toFixed(2).replace('.', ',') : ''}
            placeholder="18,00"
            required
            erro={estado.porCampo?.preco}
          />
          <Campo
            rotulo="Preço promocional"
            name="preco_promocional"
            inputMode="decimal"
            defaultValue={
              produto?.preco_promocional != null
                ? Number(produto.preco_promocional).toFixed(2).replace('.', ',')
                : ''
            }
            placeholder="opcional"
            erro={estado.porCampo?.preco_promocional}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo
            rotulo="Preparo (min)"
            name="tempo_preparo_min"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={produto?.tempo_preparo_min ?? ''}
            erro={estado.porCampo?.tempo_preparo_min}
          />
          <Campo
            rotulo="Ordem"
            name="ordem"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={produto?.ordem ?? 0}
            erro={estado.porCampo?.ordem}
          />
        </div>
        <label className="flex min-h-12 items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            name="disponivel"
            defaultChecked={produto?.disponivel ?? true}
            className="size-5 accent-tinta"
          />
          Disponível para pedido
        </label>

        <EditorGrupos iniciais={gruposIniciais} />

        {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
        {estado.sucesso && <Mensagem tipo="sucesso">{estado.sucesso}</Mensagem>}

        <BotaoSubmeter tamanho="lg" cheio>
          Guardar produto
        </BotaoSubmeter>
        {produto && (
          <Botao
            type="button"
            variante="perigo"
            onClick={() => {
              if (confirm(`Apagar “${produto.nome}”?`)) void apagarProduto(produto.id)
            }}
          >
            Apagar produto
          </Botao>
        )}
      </form>
    </div>
  )
}
