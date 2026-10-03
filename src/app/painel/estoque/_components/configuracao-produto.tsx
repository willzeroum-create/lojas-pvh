'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProdutoLinha } from '@/lib/supabase/tipos'
import { Mensagem } from '@/components/ui/mensagem'
import { configurarEstoqueProdutoAction } from '../actions'
import { CampoEstoque, PRIMARIO, quantidade, SelecaoEstoque, UNIDADES } from './apresentacao'

export function ConfiguracaoProduto({
  produto,
}: {
  produto: Pick<
    ProdutoLinha,
    | 'id'
    | 'nome'
    | 'controla_estoque'
    | 'unidade'
    | 'estoque_minimo'
    | 'estoque_atual'
    | 'codigo_barras'
    | 'vendido_por_peso'
  >
}) {
  const router = useRouter()
  const [ocupado, definirOcupado] = useState(false)
  const [erro, definirErro] = useState('')
  const [sucesso, definirSucesso] = useState('')
  const [campos, definirCampos] = useState<Record<string, string>>({})
  const enviando = useRef(false)
  return (
    <form
      className="max-w-2xl space-y-5 rounded-xl border border-areia bg-branco p-4 sm:p-6"
      onSubmit={async (evento) => {
        evento.preventDefault()
        if (enviando.current) return
        const dados = new FormData(evento.currentTarget)
        enviando.current = true
        definirOcupado(true)
        definirErro('')
        definirSucesso('')
        definirCampos({})
        try {
          const resultado = await configurarEstoqueProdutoAction({
            produtoId: produto.id,
            controla: dados.has('controla'),
            unidade: dados.get('unidade'),
            minimo: dados.get('minimo'),
            codigoBarras: dados.get('codigoBarras'),
            vendidoPorPeso: dados.has('vendidoPorPeso'),
          })
          if (resultado.ok) {
            definirSucesso('Configuração de estoque salva.')
            router.refresh()
          } else {
            definirErro(resultado.erro)
            definirCampos(resultado.porCampo ?? {})
          }
        } catch {
          definirErro('Não foi possível confirmar o salvamento. Tente novamente após conferir a conexão.')
        } finally {
          enviando.current = false
          definirOcupado(false)
        }
      }}
    >
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {sucesso && (
        <Mensagem tipo="sucesso" className="text-[#176b3a]!">
          {sucesso}
        </Mensagem>
      )}
      <fieldset disabled={ocupado} className="space-y-5">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-papel-2 p-4 font-bold">
          <input
            name="controla"
            type="checkbox"
            defaultChecked={produto.controla_estoque}
            className="size-5 accent-tinta"
            aria-invalid={!!campos.controla}
            aria-describedby={campos.controla ? 'controla-erro' : undefined}
          />
          Controlar estoque deste produto
        </label>
        {campos.controla && (
          <p id="controla-erro" className="text-sm text-vermelho">
            {campos.controla}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <SelecaoEstoque
            name="unidade"
            rotulo="Unidade do estoque"
            defaultValue={produto.unidade}
            erro={campos.unidade}
          >
            {UNIDADES.map((unidade) => (
              <option key={unidade}>{unidade}</option>
            ))}
          </SelecaoEstoque>
          <CampoEstoque
            name="minimo"
            rotulo="Estoque mínimo"
            type="number"
            inputMode="decimal"
            min="0"
            max="999999"
            step="0.001"
            defaultValue={produto.estoque_minimo}
            erro={campos.minimo}
          />
        </div>
        <p className="text-sm text-carvao">
          Saldo registrado:{' '}
          <strong>
            {quantidade(produto.estoque_atual)} {produto.unidade}
          </strong>
          . Confira o saldo ao mudar a unidade.
        </p>
        <CampoEstoque
          name="codigoBarras"
          rotulo="Código de barras (opcional)"
          defaultValue={produto.codigo_barras ?? ''}
          maxLength={30}
          minLength={3}
          erro={campos.codigoBarras}
        />
        <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-bold">
          <input
            name="vendidoPorPeso"
            type="checkbox"
            defaultChecked={produto.vendido_por_peso}
            className="size-5 accent-tinta"
            aria-invalid={!!campos.vendidoPorPeso}
            aria-describedby={campos.vendidoPorPeso ? 'peso-erro' : undefined}
          />
          Vendido por peso
        </label>
        {campos.vendidoPorPeso && (
          <p id="peso-erro" className="text-sm text-vermelho">
            {campos.vendidoPorPeso}
          </p>
        )}
        <button type="submit" className={PRIMARIO} disabled={ocupado}>
          {ocupado ? 'Salvando…' : 'Salvar configuração'}
        </button>
      </fieldset>
    </form>
  )
}
