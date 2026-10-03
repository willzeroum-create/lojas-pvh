'use client'

import { ArrowRight, Banknote } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useTransition, type FormEvent } from 'react'
import { abrirCaixaAction } from '../actions'
import { AvisoCaixa, BOTAO_CAIXA, CAMPO_CAIXA, lerValorCaixa, PRIMARIO_CAIXA } from './apresentacao'

export function AbrirCaixa({
  titulo = 'Abra o caixa para começar',
  descricao = 'Conte o dinheiro que ficará na gaveta para dar troco.',
}: {
  titulo?: string
  descricao?: string
}) {
  const roteador = useRouter()
  const id = useId()
  const enviando = useRef(false)
  const [valor, definirValor] = useState('')
  const [erro, definirErro] = useState<string | null>(null)
  const [campoErro, definirCampoErro] = useState<string | undefined>()
  const [incerto, definirIncerto] = useState(false)
  const [aberto, definirAberto] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  function abrir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current || incerto || aberto) return
    const fundoTroco = lerValorCaixa(valor)
    if (fundoTroco === null) {
      definirErro('Informe o fundo de troco. Se não houver dinheiro, digite 0.')
      definirCampoErro('Use um valor em reais, como 100,00.')
      return
    }
    enviando.current = true
    definirErro(null)
    definirCampoErro(undefined)
    iniciarTransicao(async () => {
      try {
        const resposta = await abrirCaixaAction({ fundoTroco })
        if (!resposta.ok) {
          definirErro(resposta.erro)
          definirCampoErro(resposta.porCampo?.fundoTroco)
          return
        }
        definirAberto(true)
        roteador.refresh()
      } catch {
        definirIncerto(true)
        definirErro(
          'A conexão caiu durante a abertura. Atualize a página para conferir se o caixa foi aberto.',
        )
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-areia bg-branco"
    >
      <div className="border-b border-areia bg-papel-2 p-5 sm:p-8">
        <Banknote aria-hidden="true" className="mb-6 size-8 text-carvao" />
        <p className="text-xs font-bold tracking-[0.15em] text-carvao uppercase">
          Balcão / Abertura do caixa
        </p>
        <h1 id={`${id}-titulo`} className="mt-3 text-3xl leading-tight font-bold tracking-tight">
          {titulo}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-carvao">{descricao}</p>
      </div>
      <form onSubmit={abrir} className="space-y-5 p-5 sm:p-8" aria-busy={pendente}>
        {erro && <AvisoCaixa erro>{erro}</AvisoCaixa>}
        {aberto && <AvisoCaixa>Caixa aberto. Carregando o balcão…</AvisoCaixa>}
        <div className="space-y-2">
          <label htmlFor={`${id}-fundo`} className="block text-sm font-bold">
            Fundo de troco (R$)
          </label>
          <input
            id={`${id}-fundo`}
            name="fundoTroco"
            autoFocus
            inputMode="decimal"
            autoComplete="off"
            required
            maxLength={16}
            value={valor}
            onChange={(evento) => definirValor(evento.target.value)}
            placeholder="0,00"
            className={`${CAMPO_CAIXA} text-2xl font-bold tabular-nums`}
            disabled={pendente || incerto || aberto}
            aria-invalid={Boolean(campoErro)}
            aria-describedby={`${id}-ajuda`}
          />
          <p id={`${id}-ajuda`} className={`text-sm ${campoErro ? 'text-[#a82a1a]' : 'text-carvao'}`}>
            {campoErro ?? 'Informe apenas o dinheiro inicial da gaveta. Sem fundo? Digite 0.'}
          </p>
        </div>
        {incerto ? (
          <button type="button" className={BOTAO_CAIXA} onClick={() => window.location.reload()}>
            Atualizar e conferir caixa
          </button>
        ) : (
          <button type="submit" className={`${PRIMARIO_CAIXA} w-full`} disabled={pendente || aberto}>
            {pendente || aberto ? 'Abrindo caixa…' : 'Abrir caixa'}
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        )}
      </form>
    </section>
  )
}
