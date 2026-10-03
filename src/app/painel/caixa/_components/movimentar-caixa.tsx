'use client'

import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useTransition, type FormEvent } from 'react'
import { useAprovacaoGerente } from '@/components/ui/aprovacao-gerente'
import { movimentarCaixaAction } from '../actions'
import { AvisoCaixa, BOTAO_CAIXA, CAMPO_CAIXA, lerValorCaixa, PRIMARIO_CAIXA } from './apresentacao'

export function MovimentarCaixa({ sessaoId }: { sessaoId: string }) {
  const roteador = useRouter()
  const { solicitar, dialogo } = useAprovacaoGerente()
  const id = useId()
  const enviando = useRef(false)
  const [tipo, definirTipo] = useState<'suprimento' | 'sangria' | null>(null)
  const [valor, definirValor] = useState('')
  const [motivo, definirMotivo] = useState('')
  const [erro, definirErro] = useState<string | null>(null)
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [sucesso, definirSucesso] = useState<string | null>(null)
  const [incerto, definirIncerto] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  function escolher(proximo: 'suprimento' | 'sangria') {
    definirTipo(proximo)
    definirValor('')
    definirMotivo('')
    definirErro(null)
    definirErros({})
    definirSucesso(null)
  }

  function registrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!tipo || enviando.current || incerto) return
    const quantia = lerValorCaixa(valor)
    if (quantia === null || quantia <= 0) {
      definirErro('Informe um valor maior que zero.')
      definirErros({ valor: 'Use um valor em reais, como 50,00.' })
      return
    }
    if (motivo.trim().length < 3) {
      definirErro('Escreva o motivo da movimentação.')
      definirErros({ motivo: 'O motivo precisa ter pelo menos 3 caracteres.' })
      return
    }
    const entrada = { sessaoId, tipo, valor: quantia, motivo: motivo.trim() }
    let respostaIncerta = false
    definirErro(null)
    definirErros({})
    async function registrarMovimento(pinGerente?: string) {
      if (respostaIncerta)
        return { ok: false as const, erro: 'Atualize e confira os movimentos antes de tentar de novo.' }
      enviando.current = true
      try {
        const resposta = await movimentarCaixaAction({ ...entrada, pinGerente })
        if (!resposta.ok) {
          if (!resposta.precisaGerente) definirErro(resposta.erro)
          definirErros(resposta.porCampo ?? {})
          return resposta
        }
        definirSucesso(
          entrada.tipo === 'suprimento'
            ? 'Suprimento registrado. O dinheiro entrou no caixa.'
            : 'Sangria registrada. A retirada foi anotada.',
        )
        definirTipo(null)
        definirValor('')
        definirMotivo('')
        roteador.refresh()
        return resposta
      } catch {
        respostaIncerta = true
        definirIncerto(true)
        const mensagem =
          'A conexão caiu durante o registro. Atualize e confira os movimentos antes de tentar de novo.'
        definirErro(mensagem)
        return { ok: false as const, erro: mensagem }
      } finally {
        enviando.current = false
      }
    }
    iniciarTransicao(async () => {
      const resposta = await registrarMovimento()
      if (!resposta.ok && 'precisaGerente' in resposta && resposta.precisaGerente) {
        solicitar((pinGerente) => registrarMovimento(pinGerente), resposta.erro)
      }
    })
  }

  return (
    <section aria-label="Entradas e retiradas de dinheiro" className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className={BOTAO_CAIXA}
          disabled={pendente || incerto}
          onClick={() => escolher('suprimento')}
          aria-expanded={tipo === 'suprimento'}
          aria-controls={`${id}-formulario`}
        >
          <ArrowDownLeft aria-hidden="true" className="size-5 shrink-0" />
          Suprimento
        </button>
        <button
          type="button"
          className={BOTAO_CAIXA}
          disabled={pendente || incerto}
          onClick={() => escolher('sangria')}
          aria-expanded={tipo === 'sangria'}
          aria-controls={`${id}-formulario`}
        >
          <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
          Sangria
        </button>
      </div>
      {sucesso && <AvisoCaixa>{sucesso}</AvisoCaixa>}
      {tipo && (
        <form
          id={`${id}-formulario`}
          onSubmit={registrar}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape' && !pendente && !incerto) definirTipo(null)
          }}
          className="space-y-4 rounded-xl border border-areia bg-branco p-4 sm:p-5"
          aria-busy={pendente}
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {tipo === 'suprimento' ? 'Adicionar dinheiro à gaveta' : 'Retirar dinheiro da gaveta'}
              </h2>
              <p className="mt-1 text-sm text-carvao">
                {tipo === 'suprimento'
                  ? 'Reforço de troco ou outra entrada em dinheiro.'
                  : 'Retirada para depósito, despesa ou outro destino.'}
              </p>
            </div>
            <button
              type="button"
              className="flex size-12 shrink-0 items-center justify-center rounded-lg hover:bg-papel-2"
              aria-label="Fechar formulário de movimentação"
              onClick={() => definirTipo(null)}
              disabled={pendente || incerto}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>
          {erro && <AvisoCaixa erro>{erro}</AvisoCaixa>}
          <div className="space-y-2">
            <label className="block text-sm font-bold" htmlFor={`${id}-valor`}>
              Valor (R$)
            </label>
            <input
              id={`${id}-valor`}
              name="valor"
              autoFocus
              inputMode="decimal"
              autoComplete="off"
              required
              maxLength={16}
              className={CAMPO_CAIXA}
              value={valor}
              onChange={(evento) => definirValor(evento.target.value)}
              disabled={pendente || incerto}
              aria-invalid={Boolean(erros.valor)}
              aria-describedby={erros.valor ? `${id}-erro-valor` : undefined}
              placeholder="0,00"
            />
            {erros.valor && (
              <p id={`${id}-erro-valor`} className="text-sm text-[#a82a1a]">
                {erros.valor}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold" htmlFor={`${id}-motivo`}>
              Motivo
            </label>
            <textarea
              id={`${id}-motivo`}
              name="motivo"
              required
              minLength={3}
              maxLength={200}
              rows={2}
              className={`${CAMPO_CAIXA} resize-y`}
              value={motivo}
              onChange={(evento) => definirMotivo(evento.target.value)}
              disabled={pendente || incerto}
              aria-invalid={Boolean(erros.motivo)}
              aria-describedby={erros.motivo ? `${id}-erro-motivo` : undefined}
              placeholder={tipo === 'sangria' ? 'Ex.: retirada para depósito' : 'Ex.: reforço de troco'}
            />
            {erros.motivo && (
              <p id={`${id}-erro-motivo`} className="text-sm text-[#a82a1a]">
                {erros.motivo}
              </p>
            )}
          </div>
          {incerto ? (
            <button type="button" onClick={() => window.location.reload()} className={BOTAO_CAIXA}>
              Atualizar e conferir movimentos
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="submit" className={PRIMARIO_CAIXA} disabled={pendente}>
                {pendente ? 'Registrando…' : `Confirmar ${tipo}`}
              </button>
              <button
                type="button"
                className={BOTAO_CAIXA}
                onClick={() => definirTipo(null)}
                disabled={pendente}
              >
                Voltar
              </button>
            </div>
          )}
        </form>
      )}
      {dialogo}
    </section>
  )
}
