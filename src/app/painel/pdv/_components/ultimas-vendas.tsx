'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from 'react'
import { useAprovacaoGerente } from '@/components/ui/aprovacao-gerente'
import type { VendaDoCaixa } from '@/lib/dados/pdv'
import { ROTULO_FORMA } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import { cancelarVendaAction } from '../../caixa/actions'

const ESTILO_BOTAO =
  'inline-flex min-h-12 items-center justify-center rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold transition-colors hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta disabled:cursor-not-allowed disabled:opacity-60'

const horario = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Porto_Velho',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

function LinhaVenda({ venda }: { venda: VendaDoCaixa }) {
  const roteador = useRouter()
  const { solicitar, dialogo } = useAprovacaoGerente()
  const identificador = useId()
  const botaoAbrir = useRef<HTMLButtonElement>(null)
  const campoMotivo = useRef<HTMLTextAreaElement>(null)
  const resumoSucesso = useRef<HTMLParagraphElement>(null)
  const enviando = useRef(false)
  const [aberto, definirAberto] = useState(false)
  const [motivo, definirMotivo] = useState('')
  const [erro, definirErro] = useState<string | null>(null)
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [concluido, definirConcluido] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()
  const cancelada = venda.status === 'cancelado' || concluido
  const numero = venda.numero === null ? 'sem número' : `#${venda.numero}`

  useEffect(() => {
    if (aberto) campoMotivo.current?.focus()
  }, [aberto])

  useEffect(() => {
    if (concluido) resumoSucesso.current?.focus()
  }, [concluido])

  function manterVenda() {
    if (enviando.current || pendente) return
    definirAberto(false)
    definirErro(null)
    definirErros({})
    botaoAbrir.current?.focus()
  }

  function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current || pendente || cancelada) return
    const texto = motivo.trim()
    if (texto.length < 3 || texto.length > 200) {
      definirErros({ motivo: 'Escreva um motivo entre 3 e 200 caracteres.' })
      campoMotivo.current?.focus()
      return
    }
    const entrada = { pedidoId: venda.id, motivo: texto }
    let respostaIncerta = false
    definirErro(null)
    definirErros({})
    async function cancelarVenda(pinGerente?: string) {
      if (respostaIncerta)
        return { ok: false as const, erro: 'Atualize as vendas antes de tentar novamente.' }
      enviando.current = true
      try {
        const resultado = await cancelarVendaAction({ ...entrada, pinGerente })
        if (!resultado.ok) {
          if (!resultado.precisaGerente) definirErro(resultado.erro)
          definirErros(resultado.porCampo ?? {})
          if (!pinGerente && !resultado.precisaGerente) campoMotivo.current?.focus()
          return resultado
        }
        definirConcluido(true)
        definirAberto(false)
        roteador.refresh()
        return resultado
      } catch {
        respostaIncerta = true
        const mensagem =
          'Não foi possível confirmar o cancelamento. Confira a conexão e atualize as vendas antes de tentar novamente.'
        definirErro(mensagem)
        return { ok: false as const, erro: mensagem }
      } finally {
        enviando.current = false
      }
    }
    iniciarTransicao(async () => {
      const resultado = await cancelarVenda()
      if (!resultado.ok && 'precisaGerente' in resultado && resultado.precisaGerente) {
        solicitar((pinGerente) => cancelarVenda(pinGerente), resultado.erro)
      }
    })
  }

  return (
    <li className="min-w-0 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1 basis-40">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3 className="font-sans text-base font-bold">Venda {numero}</h3>
            {cancelada && (
              <span className="rounded-md bg-vermelho-clara px-2 py-1 text-xs font-bold text-vermelho">
                Cancelada
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-carvao">
            <time dateTime={venda.criadoEm}>{horario.format(new Date(venda.criadoEm))}</time>
            {' · '}
            {venda.itens} {venda.itens === 1 ? 'item' : 'itens'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-carvao">
            {venda.formas.map((forma) => ROTULO_FORMA[forma]).join(' + ') || 'Sem pagamento registrado'}
          </p>
        </div>
        <p
          className={`text-xl font-bold tabular-nums ${cancelada ? 'text-carvao line-through' : 'text-tinta'}`}
        >
          {formatarBRL(venda.total)}
        </p>
        {!cancelada && (
          <button
            ref={botaoAbrir}
            type="button"
            disabled={pendente}
            aria-label={`Cancelar venda ${numero}`}
            aria-expanded={aberto}
            aria-controls={`${identificador}-confirmacao`}
            onClick={() => {
              definirErro(null)
              definirErros({})
              definirAberto(true)
            }}
            className={`${ESTILO_BOTAO} text-vermelho hover:border-vermelho/40 hover:bg-vermelho-clara`}
          >
            Cancelar venda
          </button>
        )}
      </div>

      {aberto && !cancelada && (
        <form
          data-pdv-operacao
          id={`${identificador}-confirmacao`}
          aria-labelledby={`${identificador}-titulo`}
          aria-busy={pendente}
          noValidate
          onSubmit={confirmar}
          onKeyDown={(evento) => {
            if (evento.key !== 'Escape') return
            evento.preventDefault()
            evento.stopPropagation()
            manterVenda()
          }}
          className="mt-4 rounded-xl border border-vermelho/40 bg-vermelho-clara p-4"
        >
          <h4 id={`${identificador}-titulo`} className="font-bold">
            Cancelar a venda {numero} de {formatarBRL(venda.total)}?
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            A venda continuará no histórico como cancelada e seu valor será estornado nos movimentos do caixa.
          </p>
          <label htmlFor={`${identificador}-motivo`} className="mt-4 block text-sm font-bold">
            Motivo do cancelamento <span className="font-normal">(obrigatório)</span>
          </label>
          <textarea
            ref={campoMotivo}
            id={`${identificador}-motivo`}
            name="motivo"
            required
            minLength={3}
            maxLength={200}
            rows={2}
            value={motivo}
            disabled={pendente}
            aria-invalid={Boolean(erros.motivo)}
            aria-describedby={`${identificador}-ajuda${erros.motivo ? ` ${identificador}-erro-motivo` : ''}`}
            onChange={(evento) => definirMotivo(evento.target.value)}
            className="mt-2 min-h-24 w-full resize-y rounded-lg border border-areia bg-branco px-3 py-3 text-base text-tinta outline-none focus:border-tinta focus:ring-2 focus:ring-tinta/20 disabled:opacity-60"
          />
          <p id={`${identificador}-ajuda`} className="mt-1 text-xs text-carvao">
            De 3 a 200 caracteres. {motivo.length}/200.
          </p>
          {erros.motivo && (
            <p
              id={`${identificador}-erro-motivo`}
              role="alert"
              className="mt-2 text-sm font-semibold text-vermelho"
            >
              {erros.motivo}
            </p>
          )}
          {Object.entries(erros)
            .filter(([campo]) => campo !== 'motivo')
            .map(([campo, mensagem]) => (
              <p key={campo} role="alert" className="mt-2 text-sm font-semibold text-vermelho">
                {mensagem}
              </p>
            ))}
          {erro && (
            <p role="alert" className="mt-3 text-sm font-bold text-vermelho">
              {erro}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={pendente} onClick={manterVenda} className={ESTILO_BOTAO}>
              Manter venda
            </button>
            <button
              type="submit"
              disabled={pendente || motivo.trim().length < 3}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-vermelho px-4 py-3 text-sm font-bold text-branco hover:bg-[#a82a1a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendente ? 'Cancelando…' : 'Confirmar cancelamento'}
            </button>
          </div>
        </form>
      )}
      <p
        ref={resumoSucesso}
        tabIndex={-1}
        role="status"
        className={concluido ? 'mt-3 text-sm font-semibold text-[#176b3a]' : 'sr-only'}
      >
        {concluido
          ? `Venda ${numero} cancelada. Valores do caixa atualizados.`
          : pendente
            ? 'Cancelando a venda. Aguarde.'
            : ''}
      </p>
      {dialogo}
    </li>
  )
}

export function UltimasVendas({ vendas }: { vendas: VendaDoCaixa[] }) {
  const [limite, definirLimite] = useState(8)
  const visiveis = vendas.slice(0, limite)

  return (
    <section
      aria-labelledby="pdv-ultimas-vendas-titulo"
      className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-areia bg-papel-2 px-4 py-4 sm:px-5">
        <h2 id="pdv-ultimas-vendas-titulo" className="font-sans text-lg font-bold">
          Vendas deste caixa
        </h2>
        <p className="text-xs font-semibold text-carvao">Horário de Porto Velho</p>
      </header>
      {vendas.length === 0 ? (
        <p className="px-5 py-7 text-sm text-carvao">
          Nenhuma venda neste caixa. As vendas concluídas aparecerão aqui.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-areia">
            {visiveis.map((venda) => (
              <LinhaVenda key={venda.id} venda={venda} />
            ))}
          </ul>
          {vendas.length > limite && (
            <div className="border-t border-areia px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => definirLimite((atual) => atual + 8)}
                className={`${ESTILO_BOTAO} w-full`}
              >
                Ver mais vendas ({vendas.length - limite} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
