'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, FileUp, Plus, Search, Trash2 } from 'lucide-react'
import type { ItemEstoque } from '@/lib/dados/estoque'
import { formatarBRL, interpretarBRL } from '@/lib/dominio/moeda'
import { esquemaEntradaManual } from '@/lib/validacao/estoque'
import { validar } from '@/lib/validacao/zod'
import { criarEntradaManualAction, importarXmlAction } from '../../actions'
import { BOTAO_ENTRADA, CAMPO_ENTRADA, CampoEntrada, PRIMARIO_ENTRADA } from './apresentacao'
import { chaveItem, SeletorItem } from './seletor-item'

type Fornecedor = { id: string; nome: string }
type LinhaManual = { chave: number; item: string; descricao: string; quantidade: string; valorTotal: string }

export function NovaEntrada({
  itens,
  fornecedores,
  totalFornecedores,
  buscaInicial,
}: {
  itens: ItemEstoque[]
  fornecedores: Fornecedor[]
  totalFornecedores: number
  buscaInicial: string
}) {
  const roteador = useRouter()
  const [modo, setModo] = useState<'xml' | 'manual'>(buscaInicial ? 'manual' : 'xml')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [ocupado, iniciar] = useTransition()
  const [buscando, iniciarBusca] = useTransition()
  const [navegando, setNavegando] = useState(false)
  const [resultadoIncerto, setResultadoIncerto] = useState(false)
  const [erro, setErro] = useState('')
  const [erros, setErros] = useState<Record<string, string>>({})
  const [linhas, setLinhas] = useState<LinhaManual[]>([])
  const sequencia = useRef(0)
  const resumoErro = useRef<HTMLDivElement>(null)
  const formulario = useRef<HTMLFormElement>(null)
  const [buscaFornecedor, setBuscaFornecedor] = useState(buscaInicial)
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null)
  const [observacoes, setObservacoes] = useState('')
  const bloqueado = ocupado || navegando || resultadoIncerto
  const total =
    linhas.reduce((soma, linha) => soma + Math.round((interpretarBRL(linha.valorTotal) ?? 0) * 100), 0) / 100

  function falhar(mensagem: string, campos: Record<string, string> = {}) {
    setErro(mensagem)
    setErros(campos)
    requestAnimationFrame(() => {
      const primeiro = Object.keys(campos)[0]
      const campo = primeiro && formulario.current?.elements.namedItem(primeiro)
      if (campo instanceof HTMLElement) campo.focus()
      else resumoErro.current?.focus()
    })
  }

  function escolherArquivo(novo?: File) {
    setErro('')
    if (!novo) return
    if (!novo.name.toLowerCase().endsWith('.xml')) {
      setArquivo(null)
      falhar('Escolha o arquivo .xml da NF-e.')
      return
    }
    if (novo.size > 3_000_000) {
      setArquivo(null)
      falhar('O XML deve ter até 3 MB.')
      return
    }
    setArquivo(novo)
  }

  function importar() {
    if (!arquivo || bloqueado) return
    setErro('')
    iniciar(async () => {
      let enviado = false
      try {
        const xml = await arquivo.text()
        enviado = true
        const resultado = await importarXmlAction({ xml })
        if (!resultado.ok) {
          falhar(resultado.erro, resultado.porCampo)
          return
        }
        setNavegando(true)
        roteador.push(`/painel/estoque/entradas/${resultado.entradaId}`)
      } catch {
        setResultadoIncerto(enviado)
        falhar(
          enviado
            ? 'Não recebemos a confirmação. Confira a lista de entradas antes de importar novamente; a nota pode ter sido registrada.'
            : 'Não foi possível ler o arquivo. Escolha o XML novamente.',
        )
      }
    })
  }

  function adicionarLinha() {
    sequencia.current += 1
    setLinhas((atuais) => [
      ...atuais,
      { chave: sequencia.current, item: '', descricao: '', quantidade: '', valorTotal: '' },
    ])
    setErros({})
  }

  function alterarLinha(chave: number, valores: Partial<LinhaManual>) {
    setLinhas((atuais) => atuais.map((linha) => (linha.chave === chave ? { ...linha, ...valores } : linha)))
    setErros({})
  }

  function registrarManual() {
    if (bloqueado) return
    const dados = {
      fornecedorId: fornecedor?.id,
      observacoes,
      itens: linhas.map((linha) => {
        const item = itens.find((opcao) => chaveItem(opcao) === linha.item)
        return {
          tipo: item?.tipo,
          id: item?.id,
          descricao: linha.descricao,
          quantidade: linha.quantidade.trim().replace(',', '.'),
          valorTotal: linha.valorTotal,
        }
      }),
    }
    const validacao = validar(esquemaEntradaManual, dados)
    if (!validacao.ok) {
      falhar('Confira os campos indicados antes de continuar.', validacao.porCampo)
      return
    }
    setErro('')
    setErros({})
    iniciar(async () => {
      try {
        const resultado = await criarEntradaManualAction(validacao.dados)
        if (!resultado.ok) {
          setResultadoIncerto(!resultado.porCampo)
          falhar(
            resultado.porCampo
              ? resultado.erro
              : `${resultado.erro} Confira a lista de entradas antes de criar outra compra.`,
            resultado.porCampo,
          )
          return
        }
        setNavegando(true)
        roteador.push(`/painel/estoque/entradas/${resultado.entradaId}`)
      } catch {
        setResultadoIncerto(true)
        falhar(
          'Não recebemos a confirmação. A compra pode ter sido registrada. Confira a lista de entradas antes de criar outra.',
        )
      }
    })
  }

  return (
    <div className="space-y-5">
      <div
        className="grid grid-cols-2 gap-2 rounded-xl border border-areia bg-papel-2 p-1"
        aria-label="Forma de entrada"
      >
        {(
          [
            { valor: 'xml', rotulo: 'XML da NF-e' },
            { valor: 'manual', rotulo: 'Entrada manual' },
          ] as const
        ).map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            disabled={bloqueado}
            aria-pressed={modo === opcao.valor}
            onClick={() => {
              setModo(opcao.valor)
              setErro('')
              setErros({})
            }}
            className={`min-h-12 rounded-lg px-3 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta ${modo === opcao.valor ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3'}`}
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
      {erro && (
        <div
          ref={resumoErro}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-vermelho/30 bg-vermelho-clara p-4 text-sm text-vermelho focus:outline-2 focus:outline-vermelho"
        >
          {erro}
        </div>
      )}
      {resultadoIncerto && (
        <Link href="/painel/estoque/entradas" className={BOTAO_ENTRADA}>
          Conferir entradas registradas <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      )}
      {modo === 'xml' ? (
        <section
          className="space-y-5 rounded-xl border border-areia bg-branco p-4 sm:p-6"
          aria-labelledby="titulo-xml"
        >
          <div>
            <h2 id="titulo-xml" className="text-xl font-bold">
              Entrada de nota
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-carvao">
              O XML traz o fornecedor, os itens e as duplicatas. Você confere a ligação de cada item com o
              estoque na próxima tela.
            </p>
          </div>
          <label
            htmlFor="xml-nota"
            onDragOver={(evento) => {
              evento.preventDefault()
              if (!bloqueado) setArrastando(true)
            }}
            onDragLeave={() => setArrastando(false)}
            onDrop={(evento) => {
              evento.preventDefault()
              setArrastando(false)
              if (!bloqueado) escolherArquivo(evento.dataTransfer.files[0])
            }}
            className={`flex min-h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-8 text-center focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-tinta ${arrastando ? 'border-tangerina bg-tangerina-clara' : 'border-areia bg-papel'}`}
          >
            <FileUp aria-hidden="true" className="size-9 text-carvao" strokeWidth={1.5} />
            <span className="text-lg font-bold">Arraste o XML para cá</span>
            <span className="text-sm text-carvao">ou escolha o arquivo no seu aparelho · até 3 MB</span>
            <input
              id="xml-nota"
              type="file"
              accept=".xml,text/xml,application/xml"
              disabled={bloqueado}
              onChange={(evento) => escolherArquivo(evento.target.files?.[0])}
              className="block min-h-12 w-full max-w-sm min-w-0 rounded-lg text-sm text-carvao file:mr-3 file:min-h-12 file:rounded-lg file:border file:border-areia file:bg-branco file:px-4 file:font-bold file:text-tinta"
            />
          </label>
          {arquivo && (
            <p role="status" className="rounded-lg bg-papel-2 p-3 text-sm break-all">
              <strong>{arquivo.name}</strong> ·{' '}
              {(arquivo.size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} KB
            </p>
          )}
          <button
            type="button"
            disabled={!arquivo || bloqueado}
            onClick={importar}
            aria-busy={ocupado || navegando}
            className={`${PRIMARIO_ENTRADA} w-full sm:w-auto`}
          >
            {resultadoIncerto
              ? 'Confira a lista de entradas'
              : ocupado || navegando
                ? 'Lendo a nota…'
                : 'Importar e conferir'}
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </section>
      ) : (
        <form
          ref={formulario}
          noValidate
          onSubmit={(evento) => {
            evento.preventDefault()
            registrarManual()
          }}
          className="space-y-5"
        >
          <fieldset
            disabled={bloqueado}
            className="min-w-0 space-y-5 rounded-xl border border-areia bg-branco p-4 sm:p-6"
          >
            <legend className="sr-only">Dados da compra manual</legend>
            <div>
              <h2 className="text-xl font-bold">Compra sem XML</h2>
              <p className="mt-2 text-sm text-carvao">
                Informe a quantidade na unidade do seu estoque e o valor total pago por cada item.
              </p>
            </div>
            <div className="space-y-3 border-b border-areia pb-5">
              <div className="flex flex-col items-end gap-2 sm:flex-row">
                <div className="w-full min-w-0 flex-1">
                  <CampoEntrada
                    id="buscar-fornecedor"
                    rotulo="Fornecedor (opcional)"
                    type="search"
                    value={buscaFornecedor}
                    onChange={(evento) => setBuscaFornecedor(evento.target.value)}
                    onKeyDown={(evento) => {
                      if (evento.key === 'Enter') {
                        evento.preventDefault()
                        iniciarBusca(() =>
                          roteador.replace(
                            `/painel/estoque/entradas/nova?fornecedor=${encodeURIComponent(buscaFornecedor.trim())}`,
                            { scroll: false },
                          ),
                        )
                      }
                    }}
                    placeholder="Buscar pelo nome ou documento"
                  />
                </div>
                <button
                  type="button"
                  disabled={buscando}
                  onClick={() =>
                    iniciarBusca(() =>
                      roteador.replace(
                        `/painel/estoque/entradas/nova?fornecedor=${encodeURIComponent(buscaFornecedor.trim())}`,
                        { scroll: false },
                      ),
                    )
                  }
                  className={`${BOTAO_ENTRADA} w-full sm:w-auto`}
                >
                  <Search aria-hidden="true" className="size-4" />
                  {buscando ? 'Buscando…' : 'Buscar'}
                </button>
              </div>
              <label htmlFor="fornecedorId" className="sr-only">
                Selecionar fornecedor
              </label>
              <select
                id="fornecedorId"
                name="fornecedorId"
                value={fornecedor?.id ?? ''}
                onChange={(evento) =>
                  setFornecedor(
                    fornecedores.find((opcao) => opcao.id === evento.target.value) ??
                      (fornecedor?.id === evento.target.value ? fornecedor : null),
                  )
                }
                className={CAMPO_ENTRADA}
                aria-invalid={!!erros.fornecedorId}
                aria-describedby={erros.fornecedorId ? 'fornecedor-erro' : undefined}
              >
                <option value="">Sem fornecedor</option>
                {fornecedor && !fornecedores.some((opcao) => opcao.id === fornecedor.id) && (
                  <option value={fornecedor.id}>{fornecedor.nome}</option>
                )}
                {fornecedores.map((opcao) => (
                  <option key={opcao.id} value={opcao.id}>
                    {opcao.nome}
                  </option>
                ))}
              </select>
              {erros.fornecedorId && (
                <p id="fornecedor-erro" className="text-sm text-vermelho">
                  {erros.fornecedorId}
                </p>
              )}
              {totalFornecedores > fornecedores.length && (
                <p className="text-xs text-carvao">
                  Mostrando {fornecedores.length} de {totalFornecedores} fornecedores. Use a busca para
                  encontrar os demais.
                </p>
              )}
              {!fornecedores.length && (
                <p className="text-sm text-carvao">
                  Nenhum fornecedor encontrado. Você pode continuar sem informar um.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold">
                Itens da compra <span className="ml-1 text-carvao">({linhas.length})</span>
              </h3>
              <button
                type="button"
                disabled={linhas.length >= 300 || !itens.length}
                onClick={adicionarLinha}
                className={BOTAO_ENTRADA}
              >
                <Plus aria-hidden="true" className="size-4" /> Adicionar item
              </button>
            </div>
            {erros.itens && <p className="text-sm text-vermelho">{erros.itens}</p>}
            {!itens.length && (
              <p className="rounded-lg bg-ambar-clara p-4 text-sm leading-relaxed text-[#7b4b00]">
                Nenhum item com controle de estoque está disponível.{' '}
                <Link
                  href="/painel/estoque"
                  className="inline-flex min-h-12 items-center font-bold underline underline-offset-4"
                >
                  Voltar ao estoque para configurar.
                </Link>
              </p>
            )}
            {!linhas.length && itens.length > 0 && (
              <p className="rounded-lg border border-dashed border-areia p-6 text-sm text-carvao">
                Adicione os produtos ou insumos que chegaram nesta compra.
              </p>
            )}
            {linhas.map((linha, indice) => (
              <section
                key={linha.chave}
                aria-label={`Item ${indice + 1} da compra`}
                className="space-y-4 rounded-xl border border-areia bg-papel/60 p-3 sm:p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-bold">ITEM {String(indice + 1).padStart(2, '0')}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setLinhas((atuais) => atuais.filter((atual) => atual.chave !== linha.chave))
                      setErros({})
                    }}
                    className="inline-flex min-h-12 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-vermelho hover:bg-vermelho-clara focus-visible:outline-2 focus-visible:outline-vermelho"
                    aria-label={`Remover item ${indice + 1}`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" /> Remover
                  </button>
                </div>
                <SeletorItem
                  id={`manual-${linha.chave}`}
                  itens={itens}
                  valor={linha.item}
                  podeLimpar={false}
                  disabled={bloqueado}
                  erro={erros[`itens.${indice}.id`] || erros[`itens.${indice}.tipo`]}
                  aoMudar={(valor) => {
                    const item = itens.find((opcao) => chaveItem(opcao) === valor)
                    alterarLinha(linha.chave, { item: valor, descricao: item?.nome.slice(0, 120) ?? '' })
                  }}
                />
                <CampoEntrada
                  id={`descricao-${linha.chave}`}
                  name={`itens.${indice}.descricao`}
                  rotulo="Descrição da compra"
                  value={linha.descricao}
                  maxLength={120}
                  onChange={(evento) => alterarLinha(linha.chave, { descricao: evento.target.value })}
                  erro={erros[`itens.${indice}.descricao`]}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoEntrada
                    id={`quantidade-${linha.chave}`}
                    name={`itens.${indice}.quantidade`}
                    rotulo={`Quantidade (${itens.find((item) => chaveItem(item) === linha.item)?.unidade ?? 'unidade do estoque'})`}
                    inputMode="decimal"
                    placeholder="Ex.: 12"
                    value={linha.quantidade}
                    onChange={(evento) => alterarLinha(linha.chave, { quantidade: evento.target.value })}
                    erro={erros[`itens.${indice}.quantidade`]}
                  />
                  <CampoEntrada
                    id={`valor-${linha.chave}`}
                    name={`itens.${indice}.valorTotal`}
                    rotulo="Valor total do item (R$)"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={linha.valorTotal}
                    onChange={(evento) => alterarLinha(linha.chave, { valorTotal: evento.target.value })}
                    erro={erros[`itens.${indice}.valorTotal`]}
                  />
                </div>
              </section>
            ))}
            {linhas.length > 0 && (
              <button
                type="button"
                disabled={linhas.length >= 300}
                onClick={adicionarLinha}
                className={`${BOTAO_ENTRADA} w-full`}
              >
                <Plus aria-hidden="true" className="size-4" /> Adicionar outro item
              </button>
            )}
            <div className="space-y-1.5">
              <label htmlFor="observacoes" className="block text-sm font-semibold text-carvao">
                Observações (opcional)
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={observacoes}
                onChange={(evento) => setObservacoes(evento.target.value)}
                maxLength={300}
                rows={3}
                className={`${CAMPO_ENTRADA} py-3`}
                aria-invalid={!!erros.observacoes}
                aria-describedby={erros.observacoes ? 'observacoes-erro' : undefined}
              />
              {erros.observacoes && (
                <p id="observacoes-erro" className="text-sm text-vermelho">
                  {erros.observacoes}
                </p>
              )}
            </div>
          </fieldset>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-tinta p-4 text-papel sm:p-6">
            <div>
              <p className="text-sm text-papel-3">Total da compra</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{formatarBRL(total)}</p>
            </div>
            <button
              type="submit"
              disabled={bloqueado || !linhas.length}
              aria-busy={ocupado || navegando}
              className={`${PRIMARIO_ENTRADA} w-full sm:w-auto`}
            >
              {resultadoIncerto
                ? 'Confira a lista de entradas'
                : ocupado || navegando
                  ? 'Registrando…'
                  : 'Continuar para conferência'}
              <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
