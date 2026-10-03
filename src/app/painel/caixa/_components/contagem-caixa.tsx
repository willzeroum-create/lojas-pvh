'use client'

import { ArrowRight, LockKeyhole } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition, type FormEvent } from 'react'
import { FORMAS_RECEBIMENTO, ROTULO_FORMA } from '@/lib/dominio/caixa'
import { AvisoCaixa, BOTAO_CAIXA, CAMPO_CAIXA, lerValorCaixa, PRIMARIO_CAIXA } from './apresentacao'

export function ContagemCaixa({ sessaoId, erroInicial }: { sessaoId: string; erroInicial?: string }) {
  const id = useId()
  const roteador = useRouter()
  const [erro, definirErro] = useState(erroInicial ?? '')
  const [campoInvalido, definirCampoInvalido] = useState('')
  const [pendente, iniciarTransicao] = useTransition()

  function continuar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (pendente) return
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    const parametros = new URLSearchParams({ etapa: 'conferencia', sessao: sessaoId })
    for (const forma of FORMAS_RECEBIMENTO) {
      const valor = lerValorCaixa(String(dados.get(forma) ?? ''))
      if (valor === null) {
        definirErro(
          `Informe o total contado em ${ROTULO_FORMA[forma].toLocaleLowerCase('pt-BR')}. Quando não houver, digite 0.`,
        )
        definirCampoInvalido(forma)
        formulario.querySelector<HTMLInputElement>(`[name="${forma}"]`)?.focus()
        return
      }
      parametros.set(forma, valor.toFixed(2))
    }
    definirErro('')
    definirCampoInvalido('')
    iniciarTransicao(() => roteador.replace(`/painel/caixa?${parametros.toString()}`, { scroll: true }))
  }

  return (
    <section className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-areia bg-branco">
      <div className="border-b border-areia bg-papel-2 p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-carvao uppercase">
          <LockKeyhole className="size-4" aria-hidden="true" />
          Passo 1 de 2 · Contagem
        </p>
        <h2 className="mt-3 text-2xl font-bold">Quanto você contou?</h2>
        <p className="mt-2 text-sm leading-relaxed text-carvao">
          Conte a gaveta e consulte os comprovantes de cada forma. Inclua o fundo de troco no dinheiro. Os
          valores esperados só aparecem depois desta etapa.
        </p>
      </div>
      <form onSubmit={continuar} className="space-y-5 p-5 sm:p-6" aria-busy={pendente}>
        {erro && <AvisoCaixa erro>{erro}</AvisoCaixa>}
        <div className="grid gap-4 sm:grid-cols-2">
          {FORMAS_RECEBIMENTO.map((forma, indice) => (
            <div key={forma} className={indice === 0 ? 'space-y-2 sm:col-span-2' : 'space-y-2'}>
              <label htmlFor={`${id}-${forma}`} className="block text-sm font-bold">
                {ROTULO_FORMA[forma]} (R$)
              </label>
              <input
                id={`${id}-${forma}`}
                name={forma}
                autoFocus={indice === 0}
                autoComplete="off"
                inputMode="decimal"
                required
                maxLength={16}
                placeholder="Digite o contado"
                className={`${CAMPO_CAIXA} font-bold tabular-nums ${indice === 0 ? 'text-2xl' : ''}`}
                disabled={pendente}
                aria-invalid={campoInvalido === forma}
                aria-describedby={`${id}-instrucao`}
              />
            </div>
          ))}
        </div>
        <p id={`${id}-instrucao`} className="text-sm text-carvao">
          Preencha todas as formas. Digite 0 onde não houve recebimento.
        </p>
        <p className="border-t border-areia pt-4 text-sm leading-relaxed text-carvao">
          Finalize as vendas antes de continuar. A próxima etapa mostra a conferência; o caixa só será fechado
          na confirmação final.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className={PRIMARIO_CAIXA} disabled={pendente}>
            {pendente ? 'Conferindo…' : 'Conferir valores contados'}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <Link href="/painel/caixa" className={BOTAO_CAIXA}>
            Voltar ao caixa
          </Link>
        </div>
      </form>
    </section>
  )
}
