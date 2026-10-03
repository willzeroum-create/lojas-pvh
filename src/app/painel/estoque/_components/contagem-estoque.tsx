'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ItemEstoque } from '@/lib/dados/estoque'
import { Mensagem } from '@/components/ui/mensagem'
import { aplicarInventarioAction } from '../actions'
import { BOTAO, CampoEstoque, PRIMARIO, quantidade } from './apresentacao'

export function ContagemEstoque({ itens }: { itens: ItemEstoque[] }) {
  const router = useRouter()
  const [contagens, definirContagens] = useState<Record<string, string>>({})
  const [descricao, definirDescricao] = useState('')
  const [cega, definirCega] = useState(true)
  const [busca, definirBusca] = useState('')
  const [revisao, definirRevisao] = useState(false)
  const [ocupado, definirOcupado] = useState(false)
  const [erro, definirErro] = useState('')
  const [campos, definirCampos] = useState<Record<string, string>>({})
  const [sucesso, definirSucesso] = useState('')
  const enviando = useRef(false)
  const chave = (item: ItemEstoque) => `${item.tipo}-${item.id}`
  const contados = itens.filter((item) => (contagens[chave(item)] ?? '').trim() !== '')
  const encontrados = itens.filter((item) =>
    item.nome.toLocaleLowerCase('pt-BR').includes(busca.toLocaleLowerCase('pt-BR')),
  )
  const invalidos = contados.filter((item) => {
    const valor = Number(contagens[chave(item)])
    return (
      !Number.isFinite(valor) ||
      valor < 0 ||
      valor > 999999 ||
      Math.abs(valor * 1000 - Math.round(valor * 1000)) > 0.00001
    )
  })
  if (!itens.length)
    return (
      <div className="rounded-xl border border-areia bg-branco p-6">
        <h2 className="font-bold">Não há itens para contar</h2>
        <p className="mt-2 text-sm text-carvao">Ative o controle de estoque de um produto para começar.</p>
        <Link href="/painel/estoque/produtos" className={`${BOTAO} mt-4`}>
          Configurar produtos
        </Link>
      </div>
    )
  return (
    <form
      className="space-y-5"
      onSubmit={async (evento) => {
        evento.preventDefault()
        if (enviando.current) return
        definirErro('')
        definirCampos({})
        definirSucesso('')
        if (!contados.length || contados.length > 2000 || invalidos.length) {
          definirErro(
            invalidos.length
              ? 'Revise as quantidades: de 0 a 999.999, com até 3 casas decimais.'
              : contados.length > 2000
                ? 'Conte no máximo 2.000 itens por inventário.'
                : 'Preencha a contagem de pelo menos um item.',
          )
          return
        }
        if (!revisao) {
          definirRevisao(true)
          return
        }
        const contagem = contados.map((item) => ({
          tipo: item.tipo,
          id: item.id,
          contado: Number(contagens[chave(item)]),
        }))
        enviando.current = true
        definirOcupado(true)
        try {
          const resultado = await aplicarInventarioAction({ descricao, contagem })
          if (resultado.ok) {
            definirSucesso(`Inventário aplicado a ${contagem.length} itens. Saldos atualizados.`)
            definirContagens({})
            definirRevisao(false)
            definirDescricao('')
            router.refresh()
          } else {
            definirErro(resultado.erro)
            definirCampos(resultado.porCampo ?? {})
          }
        } catch {
          definirErro('Não foi possível confirmar o inventário. Confira os saldos antes de tentar novamente.')
        } finally {
          enviando.current = false
          definirOcupado(false)
        }
      }}
    >
      {sucesso && (
        <Mensagem tipo="sucesso" className="text-[#176b3a]!">
          {sucesso}
        </Mensagem>
      )}
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      <fieldset disabled={ocupado} className="space-y-5">
        <CampoEstoque
          name="descricao"
          rotulo="Descrição do inventário"
          placeholder="Ex.: Conferência de fim de semana"
          value={descricao}
          onChange={(e) => definirDescricao(e.target.value)}
          maxLength={80}
          erro={campos.descricao}
          readOnly={revisao}
        />
        {!revisao ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-areia bg-papel-2 p-4">
              <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-bold">
                <input
                  type="checkbox"
                  className="size-5 accent-tinta"
                  checked={cega}
                  onChange={(e) => definirCega(e.target.checked)}
                />
                Contagem cega · esconder saldo atual
              </label>
              <p className="text-sm text-carvao">
                {contados.length} de {itens.length} itens contados
              </p>
            </div>
            <CampoEstoque
              name="busca-inventario"
              rotulo="Buscar item para contar"
              type="search"
              value={busca}
              onChange={(e) => definirBusca(e.target.value)}
            />
            <p className="text-sm leading-relaxed text-carvao">
              Deixe em branco o que não foi contado. Digite 0 para um item que acabou. A busca não apaga as
              contagens já preenchidas.
            </p>
            <ul className="divide-y divide-areia rounded-xl border border-areia bg-branco">
              {encontrados.map((item) => (
                <li key={chave(item)} className="grid items-center gap-4 p-4 sm:grid-cols-[1fr_12rem]">
                  <div>
                    <p className="font-bold">{item.nome}</p>
                    <p className="mt-1 text-sm text-carvao">
                      {item.tipo === 'produto' ? 'Produto' : 'Insumo'} · {item.unidade}
                      {!cega && ` · saldo ${quantidade(item.saldo)}`}
                    </p>
                  </div>
                  <CampoEstoque
                    name={`contagem-${chave(item)}`}
                    rotulo={`Contado (${item.unidade})`}
                    aria-label={`Quantidade contada de ${item.nome} em ${item.unidade}`}
                    type="number"
                    min="0"
                    max="999999"
                    step="0.001"
                    inputMode="decimal"
                    value={contagens[chave(item)] ?? ''}
                    onChange={(e) =>
                      definirContagens((atuais) => ({ ...atuais, [chave(item)]: e.target.value }))
                    }
                    erro={
                      invalidos.includes(item)
                        ? 'Use uma quantidade válida com até 3 casas decimais.'
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>
            {!encontrados.length && (
              <p className="text-sm text-carvao">Nenhum item encontrado. Ajuste a busca.</p>
            )}
          </>
        ) : (
          <section aria-labelledby="titulo-diferencas" className="space-y-3">
            <h2 id="titulo-diferencas" className="text-xl font-bold">
              Confira as diferenças
            </h2>
            <p className="text-sm text-carvao">
              {contados.length} itens serão atualizados. Os {itens.length - contados.length} itens em branco
              mantêm seus saldos.
            </p>
            <ul className="divide-y divide-areia rounded-xl border border-areia bg-branco">
              {contados.map((item, indice) => {
                const contado = Number(contagens[chave(item)])
                const diferenca = contado - item.saldo
                return (
                  <li key={chave(item)} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-bold">{item.nome}</p>
                      <p className="mt-1 text-sm text-carvao">
                        Saldo {quantidade(item.saldo)} → contado {quantidade(contado)} {item.unidade}
                      </p>
                      {campos[`contagem.${indice}.contado`] && (
                        <p className="mt-1 text-sm text-vermelho">{campos[`contagem.${indice}.contado`]}</p>
                      )}
                    </div>
                    <p
                      className={`text-xl font-bold tabular-nums ${diferenca < 0 ? 'text-vermelho' : diferenca > 0 ? 'text-[#176b3a]' : 'text-carvao'}`}
                    >
                      {diferenca > 0 ? '+' : ''}
                      {quantidade(diferenca)} {item.unidade}
                      <span className="mt-1 block text-xs">
                        {diferenca === 0
                          ? 'Sem diferença'
                          : diferenca > 0
                            ? 'Ajuste de entrada'
                            : 'Ajuste de saída'}
                      </span>
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
        <div className="flex flex-wrap gap-3">
          {revisao && (
            <button type="button" className={BOTAO} onClick={() => definirRevisao(false)}>
              Voltar à contagem
            </button>
          )}
          <button type="submit" className={PRIMARIO} disabled={!contados.length || ocupado}>
            {ocupado ? 'Aplicando inventário…' : revisao ? 'Aplicar inventário' : 'Conferir diferenças'}
          </button>
        </div>
      </fieldset>
    </form>
  )
}
