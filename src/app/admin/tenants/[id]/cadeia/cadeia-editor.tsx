'use client'

import { ChevronDown, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Markdown } from '@/components/markdown'
import { Botao } from '@/components/ui/botao'
import { Etiqueta } from '@/components/ui/etiqueta'
import { Mensagem } from '@/components/ui/mensagem'
import { DESCRICAO_ESTADO, ESTADOS, ROTULO_ESTADO, TOM_ESTADO, type EstadoEtapa } from '@/lib/cadeia/estados'
import { resumirEtapas, type EtapaVista, type FrenteVista } from '@/lib/cadeia/progresso'
import { cn } from '@/lib/utils/cn'
import { adicionarEtapa, guardarEtapa, mudarEstadoEtapa, removerEtapa } from '../../../actions'

const CAMPO =
  'h-10 w-full rounded-md border border-areia bg-branco px-3 text-sm focus:border-tinta focus:outline-none'
const COR_PONTO: Record<EstadoEtapa, string> = {
  nao_avaliado: 'bg-areia',
  ja_tinha: 'bg-tinta',
  pendente: 'bg-vermelho',
  em_curso: 'bg-ambar',
  concluido: 'bg-verde',
  nao_aplica: 'bg-nevoa',
}

type Props = { tenantId: string; frentesIniciais: FrenteVista[] }

/**
 * Editor da cadeia. Estado local com actualização optimista; cada mudança vai
 * ao servidor e, se falhar, volta atrás com a mensagem à vista.
 */
export function CadeiaEditor({ tenantId, frentesIniciais }: Props) {
  const [frentes, setFrentes] = useState(frentesIniciais)
  const [erro, setErro] = useState<string | null>(null)

  const substituirEtapa = (etapaId: string, patch: Partial<EtapaVista>) =>
    setFrentes((fs) =>
      fs.map((f) => {
        if (!f.etapas.some((e) => e.id === etapaId)) return f
        const etapas = f.etapas.map((e) => (e.id === etapaId ? { ...e, ...patch } : e))
        return { ...f, etapas, resumo: resumirEtapas(etapas) }
      }),
    )

  const mudarEstado = async (etapa: EtapaVista, estado: EstadoEtapa) => {
    if (!etapa.id) return
    const anterior = etapa.estado
    setErro(null)
    substituirEtapa(etapa.id, { estado })
    const r = await mudarEstadoEtapa({ tenantId, etapaId: etapa.id, estado })
    if (!r.ok) {
      substituirEtapa(etapa.id, { estado: anterior })
      setErro(r.erro)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
      {frentes.map((f) => (
        <section key={f.chave} className="rounded-lg border border-areia/70 bg-branco shadow-cartao">
          <header className="border-b border-areia/60 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold">{f.titulo}</h2>
              <span className="shrink-0 text-sm whitespace-nowrap text-cinza">
                {f.resumo.atendidas}/{f.resumo.total} · {f.resumo.percentagem}%
              </span>
            </div>
            <p className="text-sm text-cinza">{f.descricao}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-papel-3" aria-hidden>
              <div
                className="h-full bg-verde transition-[width]"
                style={{ width: `${f.resumo.percentagem}%` }}
              />
            </div>
          </header>
          <ul className="divide-y divide-areia/60">
            {f.etapas.map((e) => (
              <LinhaEtapa
                key={e.id ?? `${e.frente}/${e.chave}`}
                tenantId={tenantId}
                etapa={e}
                onEstado={(estado) => mudarEstado(e, estado)}
                onDetalhes={(patch) => e.id && substituirEtapa(e.id, patch)}
                onRemover={() =>
                  setFrentes((fs) =>
                    fs.map((x) => {
                      const etapas = x.etapas.filter((y) => y.id !== e.id)
                      return etapas.length === x.etapas.length
                        ? x
                        : { ...x, etapas, resumo: resumirEtapas(etapas) }
                    }),
                  )
                }
                onErro={setErro}
              />
            ))}
          </ul>
          <NovaEtapa
            tenantId={tenantId}
            frente={f.chave}
            onCriada={(etapa) =>
              setFrentes((fs) =>
                fs.map((x) => {
                  if (x.chave !== f.chave) return x
                  const etapas = [...x.etapas, etapa]
                  return { ...x, etapas, resumo: resumirEtapas(etapas) }
                }),
              )
            }
            onErro={setErro}
          />
        </section>
      ))}
    </div>
  )
}

type PropsLinha = {
  tenantId: string
  etapa: EtapaVista
  onEstado: (estado: EstadoEtapa) => void
  onDetalhes: (patch: Partial<EtapaVista>) => void
  onRemover: () => void
  onErro: (erro: string | null) => void
}

function LinhaEtapa({ tenantId, etapa, onEstado, onDetalhes, onRemover, onErro }: PropsLinha) {
  const [aberta, setAberta] = useState(false)
  const [preview, setPreview] = useState(false)
  const [notas, setNotas] = useState(etapa.notas ?? '')
  const [url, setUrl] = useState(etapa.url ?? '')
  const [responsavel, setResponsavel] = useState(etapa.responsavel ?? '')
  const [prevista, setPrevista] = useState(etapa.prevista_em ?? '')
  const [aGuardar, iniciar] = useTransition()
  const semId = etapa.id === null

  const guardar = () => {
    if (!etapa.id) return
    onErro(null)
    iniciar(async () => {
      const r = await guardarEtapa({
        tenantId,
        etapaId: etapa.id,
        notas,
        url,
        responsavel,
        prevista_em: prevista,
      })
      if (!r.ok) {
        onErro(r.erro)
        return
      }
      onDetalhes({
        notas: notas || null,
        url: url || null,
        responsavel: responsavel || null,
        prevista_em: prevista || null,
      })
      setAberta(false)
    })
  }

  const remover = () => {
    if (!etapa.id || !confirm(`Apagar a etapa “${etapa.titulo}”?`)) return
    iniciar(async () => {
      const r = await removerEtapa(tenantId, etapa.id!)
      if (!r.ok) onErro(r.erro)
      else onRemover()
    })
  }

  return (
    <li>
      <div className="flex items-center gap-3 px-4 py-2.5">
        <span className={cn('size-2.5 shrink-0 rounded-full', COR_PONTO[etapa.estado])} aria-hidden />
        <button
          type="button"
          onClick={() => setAberta((a) => !a)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={aberta}
        >
          <span className="min-w-0">
            <span className="block font-semibold sm:truncate">{etapa.titulo}</span>
            <span className="block truncate text-xs text-cinza">
              {etapa.pergunta ?? etapa.descricao ?? ''}
            </span>
          </span>
          {etapa.fase && (
            <Etiqueta tom="neutro" className="shrink-0 whitespace-nowrap">
              Fase {etapa.fase}
            </Etiqueta>
          )}
          {etapa.personalizada && (
            <Etiqueta tom="marca" className="shrink-0 whitespace-nowrap">
              Própria
            </Etiqueta>
          )}
          <ChevronDown
            className={cn('ml-auto size-4 shrink-0 text-nevoa transition-transform', aberta && 'rotate-180')}
          />
        </button>
        <span className="hidden w-28 truncate text-xs text-cinza md:block" title={etapa.responsavel ?? ''}>
          {etapa.responsavel ?? ''}
        </span>
        <span className="hidden w-20 text-xs text-cinza tabular-nums md:block">
          {etapa.prevista_em ? etapa.prevista_em.slice(8, 10) + '/' + etapa.prevista_em.slice(5, 7) : ''}
        </span>
        {etapa.url && (
          <a
            href={etapa.url}
            target="_blank"
            rel="noopener"
            aria-label="Abrir link"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-cinza hover:bg-papel-2 hover:text-tinta"
          >
            <ExternalLink className="size-4" />
          </a>
        )}
        <select
          aria-label={`Estado de ${etapa.titulo}`}
          value={etapa.estado}
          disabled={semId}
          onChange={(ev) => onEstado(ev.target.value as EstadoEtapa)}
          title={DESCRICAO_ESTADO[etapa.estado]}
          className={cn(
            'h-10 w-32 shrink-0 rounded-md border border-areia bg-branco px-2 text-sm font-semibold focus:border-tinta focus:outline-none sm:w-36',
            TOM_ESTADO[etapa.estado] === 'verde' && 'text-verde',
            TOM_ESTADO[etapa.estado] === 'vermelho' && 'text-vermelho',
            TOM_ESTADO[etapa.estado] === 'ambar' && 'text-[#8a5806]',
          )}
        >
          {ESTADOS.map((s) => (
            <option key={s} value={s}>
              {ROTULO_ESTADO[s]}
            </option>
          ))}
        </select>
      </div>

      {aberta && (
        <div className="border-t border-areia/40 bg-papel-2/60 px-4 py-4">
          {etapa.descricao && <p className="mb-3 text-sm text-carvao">{etapa.descricao}</p>}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-semibold text-cinza md:col-span-1">
              Link
              <input
                className={CAMPO}
                placeholder="https://…"
                value={url}
                onChange={(ev) => setUrl(ev.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-cinza">
              Responsável
              <input
                className={CAMPO}
                placeholder="Quem trata"
                value={responsavel}
                onChange={(ev) => setResponsavel(ev.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-cinza">
              Previsto para
              <input
                type="date"
                className={CAMPO}
                value={prevista}
                onChange={(ev) => setPrevista(ev.target.value)}
              />
            </label>
          </div>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-cinza">Notas (Markdown)</span>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="text-xs font-semibold text-carvao underline underline-offset-4"
              >
                {preview ? 'Editar' : 'Pré-visualizar'}
              </button>
            </div>
            {preview ? (
              <div className="min-h-24 rounded-md border border-areia bg-branco px-3 py-2">
                <Markdown texto={notas} />
                {!notas.trim() && <p className="text-sm text-nevoa">Nada escrito ainda.</p>}
              </div>
            ) : (
              <textarea
                className="min-h-28 w-full rounded-md border border-areia bg-branco px-3 py-2 font-mono text-sm leading-relaxed focus:border-tinta focus:outline-none"
                placeholder={'Acessos, decisões, o que falta…\n\n- [ ] tarefa\n- [x] feita'}
                value={notas}
                onChange={(ev) => setNotas(ev.target.value)}
              />
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Botao tamanho="sm" onClick={guardar} carregando={aGuardar} disabled={semId}>
              Guardar
            </Botao>
            <Botao tamanho="sm" variante="fantasma" onClick={() => setAberta(false)}>
              Fechar
            </Botao>
            {etapa.personalizada && (
              <Botao
                tamanho="sm"
                variante="perigo"
                icone={<Trash2 className="size-4" />}
                onClick={remover}
                className="ml-auto"
              >
                Apagar etapa
              </Botao>
            )}
          </div>
        </div>
      )}
    </li>
  )
}

function NovaEtapa({
  tenantId,
  frente,
  onCriada,
  onErro,
}: {
  tenantId: string
  frente: string
  onCriada: (etapa: EtapaVista) => void
  onErro: (erro: string | null) => void
}) {
  const [aberto, setAberto] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [aCriar, iniciar] = useTransition()

  const criar = () => {
    if (!titulo.trim()) return
    onErro(null)
    iniciar(async () => {
      const r = await adicionarEtapa({ tenantId, frente, titulo, descricao })
      if (!r.ok) {
        onErro(r.erro)
        return
      }
      onCriada({
        id: r.id,
        frente,
        chave: '',
        titulo: titulo.trim(),
        descricao: descricao.trim() || null,
        ordem: 999,
        estado: 'pendente',
        notas: null,
        url: null,
        responsavel: null,
        prevista_em: null,
        concluida_em: null,
        personalizada: true,
        pergunta: null,
        fase: null,
      })
      setTitulo('')
      setDescricao('')
      setAberto(false)
    })
  }

  if (!aberto) {
    return (
      <div className="px-4 py-2">
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="inline-flex h-10 items-center gap-1 rounded-md px-2 text-sm font-semibold text-carvao hover:bg-papel-2"
        >
          <Plus className="size-4" /> Etapa só desta empresa
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-end gap-2 border-t border-areia/40 bg-papel-2/60 px-4 py-3">
      <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs font-semibold text-cinza">
        Título
        <input
          className={CAMPO}
          value={titulo}
          onChange={(ev) => setTitulo(ev.target.value)}
          autoFocus
          placeholder="Ex.: Barraca na feira de domingo"
        />
      </label>
      <label className="flex min-w-48 flex-[2] flex-col gap-1 text-xs font-semibold text-cinza">
        Descrição
        <input
          className={CAMPO}
          value={descricao}
          onChange={(ev) => setDescricao(ev.target.value)}
          placeholder="opcional"
        />
      </label>
      <Botao tamanho="sm" onClick={criar} carregando={aCriar} disabled={!titulo.trim()}>
        Criar
      </Botao>
      <Botao tamanho="sm" variante="fantasma" onClick={() => setAberto(false)}>
        Cancelar
      </Botao>
    </div>
  )
}
