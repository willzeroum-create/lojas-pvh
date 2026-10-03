'use client'

import { ArrowLeft, ArrowRight, Check, Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useTransition, type FormEvent } from 'react'
import type { Estacao } from '@/lib/dados/cozinha'
import { definirEstacaoDaCategoriaAction, salvarEstacaoAction } from '../actions'

const BOTAO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold text-tinta hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tangerina disabled:cursor-wait disabled:opacity-50'
const PRIMARIO = `${BOTAO} border-tangerina! bg-tangerina! text-tinta! hover:bg-[#ff6935]!`
const CAMPO =
  'min-h-12 w-full rounded-lg border border-areia bg-branco px-3 py-3 text-base text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tangerina disabled:opacity-50 aria-[invalid=true]:border-vermelho'

function FormularioEstacao({
  estacao,
  ordemInicial,
  aoFechar,
}: {
  estacao?: Estacao
  ordemInicial: number
  aoFechar: () => void
}) {
  const roteador = useRouter()
  const id = useId()
  const enviando = useRef(false)
  const [nome, definirNome] = useState(estacao?.nome ?? '')
  const [ordem, definirOrdem] = useState(String(estacao?.ordem ?? ordemInicial))
  const [alerta, definirAlerta] = useState(String(estacao?.alertaMin ?? 15))
  const [ativa, definirAtiva] = useState(estacao?.ativa ?? true)
  const [erro, definirErro] = useState<string | null>(null)
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [pendente, iniciarTransicao] = useTransition()
  const [incerto, definirIncerto] = useState(false)

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current || incerto) return
    enviando.current = true
    definirErro(null)
    definirErros({})
    iniciarTransicao(async () => {
      try {
        const resposta = await salvarEstacaoAction({
          id: estacao?.id,
          nome: nome.trim(),
          ordem: Number(ordem),
          alertaMin: Number(alerta),
          ativa,
        })
        if (!resposta.ok) {
          definirErro(resposta.erro)
          definirErros(resposta.porCampo ?? {})
          return
        }
        roteador.refresh()
        aoFechar()
      } catch {
        definirIncerto(true)
        definirErro(
          'A conexão caiu durante o salvamento. Atualize e confira a lista antes de tentar novamente.',
        )
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <form
      onSubmit={salvar}
      aria-busy={pendente}
      className="space-y-5 rounded-xl border border-areia bg-branco p-5 sm:p-6"
    >
      <h2 className="text-2xl font-bold">{estacao ? `Editar ${estacao.nome}` : 'Nova estação'}</h2>
      {erro && (
        <p role="alert" className="rounded-lg bg-vermelho-clara p-3 text-sm text-[#982315]">
          {erro}
        </p>
      )}
      <div className="space-y-2">
        <label htmlFor={`${id}-nome`} className="block text-sm font-bold">
          Nome da estação
        </label>
        <input
          id={`${id}-nome`}
          autoFocus
          required
          maxLength={40}
          value={nome}
          disabled={pendente || incerto}
          onChange={(evento) => definirNome(evento.target.value)}
          className={CAMPO}
          placeholder="Ex.: Chapa, cozinha ou bar"
          aria-invalid={Boolean(erros.nome)}
          aria-describedby={erros.nome ? `${id}-erro-nome` : undefined}
        />
        {erros.nome && (
          <p id={`${id}-erro-nome`} className="text-sm text-vermelho">
            {erros.nome}
          </p>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={`${id}-ordem`} className="block text-sm font-bold">
            Ordem na cozinha
          </label>
          <input
            id={`${id}-ordem`}
            type="number"
            inputMode="numeric"
            min={0}
            max={99}
            step={1}
            required
            value={ordem}
            disabled={pendente || incerto}
            onChange={(evento) => definirOrdem(evento.target.value)}
            className={CAMPO}
            aria-invalid={Boolean(erros.ordem)}
            aria-describedby={erros.ordem ? `${id}-erro-ordem` : undefined}
          />
          {erros.ordem && (
            <p id={`${id}-erro-ordem`} className="text-sm text-vermelho">
              {erros.ordem}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor={`${id}-alerta`} className="block text-sm font-bold">
            Alerta após quantos minutos?
          </label>
          <input
            id={`${id}-alerta`}
            type="number"
            inputMode="numeric"
            min={1}
            max={240}
            step={1}
            required
            value={alerta}
            disabled={pendente || incerto}
            onChange={(evento) => definirAlerta(evento.target.value)}
            className={CAMPO}
            aria-invalid={Boolean(erros.alertaMin)}
            aria-describedby={erros.alertaMin ? `${id}-erro-alerta` : `${id}-ajuda-alerta`}
          />
          {erros.alertaMin ? (
            <p id={`${id}-erro-alerta`} className="text-sm text-vermelho">
              {erros.alertaMin}
            </p>
          ) : (
            <p id={`${id}-ajuda-alerta`} className="text-sm text-carvao">
              Âmbar nesse limite; vermelho no dobro.
            </p>
          )}
        </div>
      </div>
      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg bg-papel-2 p-4">
        <input
          type="checkbox"
          checked={ativa}
          disabled={pendente || incerto}
          onChange={(evento) => definirAtiva(evento.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-tinta"
        />
        <span>
          <span className="block font-bold">Estação ativa</span>
          <span className="mt-1 block text-sm text-carvao">
            Recebe novos itens das categorias vinculadas. Desativar mantém os itens que já estão na fila.
          </span>
        </span>
      </label>
      <div className="flex flex-wrap gap-2">
        {incerto ? (
          <button type="button" className={BOTAO} onClick={() => window.location.reload()}>
            Atualizar e conferir estações
          </button>
        ) : (
          <button type="submit" className={PRIMARIO} disabled={pendente}>
            <Check aria-hidden="true" className="size-4" />
            {pendente ? 'Salvando…' : 'Salvar estação'}
          </button>
        )}
        <button type="button" className={BOTAO} disabled={pendente} onClick={aoFechar}>
          Voltar
        </button>
      </div>
    </form>
  )
}

function DestinoCategoria({
  categoria,
  estacoes,
}: {
  categoria: { id: string; nome: string; ativo: boolean }
  estacoes: Estacao[]
}) {
  const roteador = useRouter()
  const id = useId()
  const destinoAtual = estacoes.find((estacao) => estacao.categorias.includes(categoria.id))?.id ?? ''
  const [destino, definirDestino] = useState(destinoAtual)
  const [erro, definirErro] = useState<string | null>(null)
  const [sucesso, definirSucesso] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()
  const enviando = useRef(false)

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current) return
    enviando.current = true
    definirErro(null)
    definirSucesso(false)
    iniciarTransicao(async () => {
      try {
        const resposta = await definirEstacaoDaCategoriaAction({
          categoriaId: categoria.id,
          estacaoId: destino || null,
        })
        if (!resposta.ok) {
          definirErro(resposta.erro)
          return
        }
        definirSucesso(true)
        roteador.refresh()
      } catch {
        definirErro(
          'Não foi possível confirmar a alteração. Atualize a página para conferir o destino desta categoria.',
        )
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <form
      onSubmit={salvar}
      className="grid gap-3 border-t border-areia py-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,1fr)_auto] lg:items-start"
      aria-busy={pendente}
    >
      <label htmlFor={`${id}-destino`} className="min-w-0 lg:pt-3">
        <span className="block font-bold break-words">{categoria.nome}</span>
        <span className="text-xs text-carvao">
          {categoria.ativo ? 'Categoria do cardápio' : 'Categoria inativa'}
        </span>
      </label>
      <div className="space-y-2">
        <select
          id={`${id}-destino`}
          className={CAMPO}
          value={destino}
          disabled={pendente}
          onChange={(evento) => {
            definirDestino(evento.target.value)
            definirSucesso(false)
          }}
        >
          <option value="">Não passa pela cozinha</option>
          {estacoes.map((estacao) => (
            <option key={estacao.id} value={estacao.id}>
              {estacao.nome}
              {estacao.ativa ? '' : ' (inativa)'}
            </option>
          ))}
        </select>
        {destino && estacoes.find((estacao) => estacao.id === destino)?.ativa === false && (
          <p className="text-sm text-[#805006]">Esta estação está inativa e não recebe novos itens.</p>
        )}
        {erro && (
          <p role="alert" className="text-sm text-vermelho">
            {erro}
          </p>
        )}
        {sucesso && (
          <p role="status" className="text-sm font-bold text-verde">
            Destino salvo.
          </p>
        )}
      </div>
      <button
        type="submit"
        className={BOTAO}
        disabled={pendente || destino === destinoAtual}
        aria-label={`Salvar destino de ${categoria.nome}`}
      >
        {pendente ? 'Salvando…' : 'Salvar'}
        <ArrowRight aria-hidden="true" className="size-4" />
      </button>
    </form>
  )
}

export function ConfigurarEstacoes({
  estacoes,
  categorias,
}: {
  estacoes: Estacao[]
  categorias: Array<{ id: string; nome: string; ativo: boolean }>
}) {
  const [edicao, definirEdicao] = useState<string | null>(null)
  const estacao = estacoes.find((item) => item.id === edicao)
  return (
    <div className="cozinha-configuracao space-y-6">
      <Link
        href="/painel/cozinha"
        className="inline-flex min-h-12 items-center gap-2 text-sm font-bold text-carvao hover:text-tinta"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Voltar à cozinha
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-carvao uppercase">Cozinha / Organização</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Cada item no seu lugar.</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-carvao">
            Organize as estações e escolha para onde vai cada categoria do cardápio.
          </p>
        </div>
        {edicao === null && (
          <button type="button" className={PRIMARIO} onClick={() => definirEdicao('nova')}>
            <Plus aria-hidden="true" className="size-5" />
            Nova estação
          </button>
        )}
      </header>
      {edicao !== null && (
        <FormularioEstacao
          key={edicao}
          estacao={estacao}
          ordemInicial={Math.min(99, estacoes.reduce((maior, item) => Math.max(maior, item.ordem), -1) + 1)}
          aoFechar={() => definirEdicao(null)}
        />
      )}
      <section aria-labelledby="cozinha-estacoes-titulo">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="cozinha-estacoes-titulo" className="text-xl font-bold">
            Estações de trabalho
          </h2>
          <span className="text-sm text-carvao">{estacoes.filter((item) => item.ativa).length} ativas</span>
        </div>
        {!estacoes.length ? (
          <p className="rounded-xl border border-dashed border-areia p-6 text-carvao">
            Nenhuma estação cadastrada. Comece pela chapa, cozinha ou bar.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {estacoes.map((item) => (
              <article key={item.id} className="rounded-xl border border-areia bg-branco p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-bold tracking-wider text-carvao uppercase">
                    Ordem {item.ordem.toString().padStart(2, '0')}
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-bold ${item.ativa ? 'bg-verde-clara text-[#176637]' : 'bg-papel-3 text-carvao'}`}
                  >
                    {item.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-bold break-words">{item.nome}</h3>
                <p className="mt-2 text-sm text-carvao">
                  Alerta em <strong className="text-tinta">{item.alertaMin} min</strong> ·{' '}
                  {item.categorias.length} categorias
                </p>
                <button
                  type="button"
                  className={`${BOTAO} mt-5 w-full`}
                  disabled={edicao !== null}
                  onClick={() => definirEdicao(item.id)}
                  aria-label={`Editar estação ${item.nome}`}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Editar estação
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      <section
        aria-labelledby="cozinha-categorias-titulo"
        className="rounded-xl border border-areia bg-branco p-5 sm:p-6"
      >
        <h2 id="cozinha-categorias-titulo" className="text-2xl font-bold">
          Destino das categorias
        </h2>
        <p className="mt-2 mb-5 max-w-2xl text-sm leading-relaxed text-carvao">
          As alterações valem para os próximos itens lançados. Itens já recebidos continuam na estação
          original. Produtos que não precisam de preparo podem ficar fora da cozinha.
        </p>
        {!categorias.length ? (
          <p className="text-sm text-carvao">O cardápio ainda não tem categorias cadastradas.</p>
        ) : (
          categorias.map((categoria) => (
            <DestinoCategoria
              key={`${categoria.id}-${estacoes.find((item) => item.categorias.includes(categoria.id))?.id ?? 'sem-estacao'}`}
              categoria={categoria}
              estacoes={estacoes}
            />
          ))
        )}
      </section>
    </div>
  )
}
