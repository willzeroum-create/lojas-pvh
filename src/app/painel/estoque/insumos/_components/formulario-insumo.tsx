'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import type { InsumoLinha } from '@/lib/supabase/tipos'
import { salvarInsumoAction } from '../../actions'
import { BOTAO, CampoEstoque, PRIMARIO, SelecaoEstoque, UNIDADES } from '../../_components/apresentacao'

export function FormularioInsumo({ insumo }: { insumo?: InsumoLinha }) {
  const roteador = useRouter()
  const [nome, definirNome] = useState(insumo?.nome ?? '')
  const [unidade, definirUnidade] = useState(insumo?.unidade ?? 'un')
  const [minimo, definirMinimo] = useState(String(insumo?.quantidade_minima ?? 0))
  const [codigoBarras, definirCodigo] = useState(insumo?.codigo_barras ?? '')
  const [ativo, definirAtivo] = useState(insumo?.ativo ?? true)
  const [erro, definirErro] = useState('')
  const [porCampo, definirPorCampo] = useState<Record<string, string>>({})
  const [pendente, iniciar] = useTransition()
  const resumoErro = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    if (erro) resumoErro.current?.focus()
  }, [erro])

  function salvar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (pendente) return
    definirErro('')
    definirPorCampo({})
    iniciar(async () => {
      try {
        const resultado = await salvarInsumoAction({
          id: insumo?.id,
          nome,
          unidade,
          minimo,
          codigoBarras,
          ativo,
        })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          definirPorCampo(resultado.porCampo ?? {})
          return
        }
        roteador.push('/painel/estoque/insumos?salvo=1')
        roteador.refresh()
      } catch {
        definirErro('Não foi possível salvar o insumo. Confira sua conexão e tente novamente.')
      }
    })
  }

  return (
    <form
      onSubmit={salvar}
      aria-busy={pendente}
      className="w-full max-w-3xl space-y-5 rounded-xl border border-areia bg-branco p-4 sm:p-6"
    >
      <div>
        <h2 className="text-xl font-bold">Dados do insumo</h2>
        <p className="mt-2 text-sm leading-relaxed text-carvao">
          O mínimo ajuda a identificar quando repor. Saldo e custo são atualizados pelos movimentos de
          estoque.
        </p>
      </div>
      {erro && (
        <p
          ref={resumoErro}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-vermelho/30 bg-vermelho-clara p-4 text-sm font-semibold text-vermelho"
        >
          {erro}
        </p>
      )}
      <fieldset disabled={pendente} className="min-w-0 space-y-5">
        <CampoEstoque
          name="nome"
          rotulo="Nome do insumo"
          required
          maxLength={80}
          value={nome}
          onChange={(evento) => definirNome(evento.target.value)}
          erro={porCampo.nome}
          autoComplete="off"
        />
        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <SelecaoEstoque
            name="unidade"
            rotulo="Unidade de estoque"
            value={unidade}
            onChange={(evento) => definirUnidade(evento.target.value)}
            erro={porCampo.unidade}
          >
            {UNIDADES.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </SelecaoEstoque>
          <CampoEstoque
            name="minimo"
            rotulo={`Estoque mínimo (${unidade})`}
            type="number"
            inputMode="decimal"
            min="0"
            max="999999"
            step="any"
            value={minimo}
            onChange={(evento) => definirMinimo(evento.target.value)}
            erro={porCampo.minimo}
          />
        </div>
        {insumo && (
          <p className="rounded-lg bg-papel p-4 text-sm leading-relaxed text-carvao">
            Ao mudar a unidade, as quantidades já registradas permanecem iguais. Confira a unidade usada nas
            fichas e nas próximas entradas.
          </p>
        )}
        <CampoEstoque
          name="codigoBarras"
          rotulo="Código de barras (opcional)"
          maxLength={30}
          value={codigoBarras}
          onChange={(evento) => definirCodigo(evento.target.value)}
          erro={porCampo.codigoBarras}
          autoComplete="off"
        />
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-areia bg-papel p-4">
          <input
            type="checkbox"
            name="ativo"
            checked={ativo}
            onChange={(evento) => definirAtivo(evento.target.checked)}
            aria-invalid={Boolean(porCampo.ativo)}
            aria-describedby={porCampo.ativo ? 'insumo-ativo-erro' : undefined}
            className="size-5 shrink-0 accent-tinta"
          />
          <span>
            <span className="block text-sm font-bold">Insumo ativo</span>
            <span className="mt-1 block text-sm leading-relaxed text-carvao">
              Disponível nas listas de estoque e nas novas fichas.
            </span>
          </span>
        </label>
        {porCampo.ativo && (
          <p id="insumo-ativo-erro" className="text-sm text-vermelho">
            {porCampo.ativo}
          </p>
        )}
      </fieldset>
      <div className="flex flex-col gap-2 border-t border-areia pt-5 min-[440px]:flex-row">
        <button type="submit" disabled={pendente} className={PRIMARIO}>
          {pendente ? 'Salvando…' : insumo ? 'Salvar alterações' : 'Cadastrar insumo'}
        </button>
        {!pendente && (
          <Link href="/painel/estoque/insumos" className={BOTAO}>
            Cancelar
          </Link>
        )}
      </div>
    </form>
  )
}
