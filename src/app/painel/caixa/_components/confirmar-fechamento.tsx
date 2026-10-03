'use client'

import { Check, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useTransition, type FormEvent } from 'react'
import { useAprovacaoGerente } from '@/components/ui/aprovacao-gerente'
import type { LinhaConferencia } from '@/lib/dominio/caixa'
import type { FormaRecebimento } from '@/lib/dominio/pdv'
import { fecharCaixaAction } from '../actions'
import {
  AvisoCaixa,
  BOTAO_CAIXA,
  CAMPO_CAIXA,
  DiferencaCaixa,
  PRIMARIO_CAIXA,
  TabelaConferencia,
} from './apresentacao'

type Propriedades = {
  sessaoId: string
  informado: Record<FormaRecebimento, number>
  conferencia: { linhas: LinhaConferencia[]; diferencaTotal: number; bate: boolean }
}

export function ConfirmarFechamento({ sessaoId, informado, conferencia }: Propriedades) {
  const roteador = useRouter()
  const { solicitar, dialogo } = useAprovacaoGerente()
  const id = useId()
  const enviando = useRef(false)
  const [justificativa, definirJustificativa] = useState('')
  const [erro, definirErro] = useState<string | null>(null)
  const [erroJustificativa, definirErroJustificativa] = useState<string | undefined>()
  const [incerto, definirIncerto] = useState(false)
  const [fechado, definirFechado] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  function fechar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current || incerto || fechado) return
    if (!conferencia.bate && !justificativa.trim()) {
      definirErro('Explique a diferença antes de confirmar o fechamento.')
      definirErroJustificativa('A justificativa é obrigatória quando há diferença em qualquer forma.')
      return
    }
    const entrada = {
      sessaoId,
      informado: { ...informado },
      justificativa: justificativa.trim() || undefined,
    }
    let respostaIncerta = false
    definirErro(null)
    definirErroJustificativa(undefined)
    async function confirmarFechamento(pinGerente?: string) {
      if (respostaIncerta)
        return { ok: false as const, erro: 'Consulte a situação do caixa antes de fazer outra tentativa.' }
      enviando.current = true
      try {
        const resposta = await fecharCaixaAction({ ...entrada, pinGerente })
        if (!resposta.ok) {
          if (!resposta.precisaGerente) definirErro(resposta.erro)
          definirErroJustificativa(resposta.porCampo?.justificativa)
          if (!resposta.precisaGerente) roteador.refresh()
          return resposta
        }
        definirFechado(true)
        roteador.replace(
          `/painel/caixa/${sessaoId}?fechamento=${resposta.fechamento.lancadoNoFinanceiro ? 'financeiro' : 'sem-financeiro'}`,
        )
        return resposta
      } catch {
        respostaIncerta = true
        definirIncerto(true)
        const mensagem =
          'A conexão caiu durante o fechamento. Consulte a situação do caixa antes de fazer outra tentativa.'
        definirErro(mensagem)
        return { ok: false as const, erro: mensagem }
      } finally {
        enviando.current = false
      }
    }
    iniciarTransicao(async () => {
      const resposta = await confirmarFechamento()
      if (!resposta.ok && 'precisaGerente' in resposta && resposta.precisaGerente) {
        solicitar((pinGerente) => confirmarFechamento(pinGerente), resposta.erro)
      }
    })
  }

  return (
    <section className="space-y-5" aria-labelledby="titulo-conferencia">
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-carvao uppercase">
          <LockKeyhole className="size-4" aria-hidden="true" />
          Passo 2 de 2 · Conferência
        </p>
        <h2 id="titulo-conferencia" className="text-2xl font-bold">
          Confira e feche o caixa.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-carvao">
          Esta é a comparação com a contagem que você informou. Nenhum fechamento foi gravado ainda.
        </p>
      </header>
      <div
        className={`flex flex-col gap-3 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between ${conferencia.bate ? 'border-verde/30 bg-verde-clara' : 'border-ambar/40 bg-ambar-clara'}`}
      >
        <div>
          <p className="flex items-center gap-2 font-bold">
            {conferencia.bate && <Check className="size-5 text-[#176b3a]" aria-hidden="true" />}
            {conferencia.bate ? 'Tudo certo, forma por forma.' : 'Há diferença na conferência.'}
          </p>
          <p className="mt-1 text-sm text-carvao">
            {conferencia.bate
              ? 'Os valores contados coincidem com os registros.'
              : 'Veja as linhas abaixo e explique o que aconteceu.'}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold text-carvao">Diferença total</p>
          <DiferencaCaixa valor={conferencia.diferencaTotal} grande />
          {!conferencia.bate && conferencia.diferencaTotal === 0 && (
            <p className="mt-1 text-xs font-bold text-[#805000]">As diferenças entre formas se compensam.</p>
          )}
        </div>
      </div>
      <TabelaConferencia linhas={conferencia.linhas} />
      <form
        onSubmit={fechar}
        className="space-y-5 rounded-xl border border-areia bg-branco p-4 sm:p-6"
        aria-busy={pendente}
      >
        {erro && (
          <AvisoCaixa erro>
            {erro}
            <Link href={`/painel/caixa/${sessaoId}`} className={`${BOTAO_CAIXA} mt-3`}>
              Consultar situação do caixa
            </Link>
          </AvisoCaixa>
        )}
        {fechado && <AvisoCaixa>Caixa fechado. Abrindo o resumo…</AvisoCaixa>}
        <div className="space-y-2">
          <label htmlFor={`${id}-justificativa`} className="block text-sm font-bold">
            {conferencia.bate
              ? 'Observação do fechamento (opcional)'
              : 'Justificativa da diferença (obrigatória)'}
          </label>
          <textarea
            id={`${id}-justificativa`}
            name="justificativa"
            required={!conferencia.bate}
            maxLength={500}
            rows={3}
            value={justificativa}
            onChange={(evento) => definirJustificativa(evento.target.value)}
            className={`${CAMPO_CAIXA} resize-y`}
            disabled={pendente || incerto || fechado}
            aria-invalid={Boolean(erroJustificativa)}
            aria-describedby={`${id}-ajuda`}
          />
          <p id={`${id}-ajuda`} className={`text-sm ${erroJustificativa ? 'text-[#a82a1a]' : 'text-carvao'}`}>
            {erroJustificativa ?? 'Até 500 caracteres. O texto fica registrado com o fechamento.'}
          </p>
        </div>
        <p className="text-sm leading-relaxed text-carvao">
          Ao confirmar, este caixa para de receber vendas. Os valores serão conferidos novamente com os
          movimentos mais recentes.
        </p>
        {incerto ? (
          <Link href={`/painel/caixa/${sessaoId}`} className={BOTAO_CAIXA}>
            Consultar situação do caixa
          </Link>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              className={PRIMARIO_CAIXA}
              disabled={pendente || fechado || (!conferencia.bate && !justificativa.trim())}
            >
              {pendente || fechado ? 'Fechando caixa…' : 'Confirmar fechamento do caixa'}
            </button>
            <Link href="/painel/caixa" className={BOTAO_CAIXA}>
              Voltar sem fechar
            </Link>
          </div>
        )}
      </form>
      {dialogo}
    </section>
  )
}
