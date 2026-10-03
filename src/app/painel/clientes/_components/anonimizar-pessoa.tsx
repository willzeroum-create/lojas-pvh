'use client'

import { ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { anonimizarPessoaAction } from '../actions'

export function AnonimizarPessoa({ id, nome }: { id: string; nome: string }) {
  const roteador = useRouter()
  const identificador = useId()
  const dialogo = useRef<HTMLDialogElement>(null)
  const cancelar = useRef<HTMLButtonElement>(null)
  const abrir = useRef<HTMLButtonElement>(null)
  const [aberto, definirAberto] = useState(false)
  const [confirmou, confirmar] = useState(false)
  const [erro, definirErro] = useState<string | null>(null)
  const [pendente, iniciarTransicao] = useTransition()

  useEffect(() => {
    if (!aberto) return
    const corpo = document.body
    const rolagemAnterior = corpo.style.overflow
    corpo.style.overflow = 'hidden'
    return () => {
      corpo.style.overflow = rolagemAnterior
    }
  }, [aberto])

  function abrirConfirmacao() {
    confirmar(false)
    definirErro(null)
    dialogo.current?.showModal()
    definirAberto(true)
    cancelar.current?.focus()
  }

  function anonimizar() {
    if (!confirmou || pendente) return
    definirErro(null)
    iniciarTransicao(async () => {
      try {
        const resultado = await anonimizarPessoaAction(id)
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        dialogo.current?.close()
        roteador.replace('/painel/clientes')
        roteador.refresh()
      } catch {
        definirErro('Não foi possível concluir agora. Tente novamente.')
      }
    })
  }

  return (
    <section className="rounded-xl border border-areia p-5" aria-labelledby={`${identificador}-secao`}>
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-carvao" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h2 id={`${identificador}-secao`} className="font-sans text-base font-bold">
            Privacidade dos dados
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-carvao">
            Atenda a um pedido de anonimização sem perder o histórico financeiro da loja.
          </p>
        </div>
      </div>
      <button
        ref={abrir}
        type="button"
        onClick={abrirConfirmacao}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={`${identificador}-dialogo`}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-vermelho/35 px-4 py-3 text-center text-sm font-bold text-vermelho transition-colors hover:bg-vermelho-clara sm:w-auto"
      >
        Anonimizar dados (LGPD)
      </button>

      <dialog
        ref={dialogo}
        id={`${identificador}-dialogo`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${identificador}-titulo`}
        aria-describedby={`${identificador}-descricao`}
        onCancel={(evento) => {
          if (pendente) evento.preventDefault()
        }}
        onClose={() => {
          definirAberto(false)
          abrir.current?.focus()
        }}
        className="clientes-area fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto overscroll-contain rounded-xl border border-areia bg-papel p-5 text-tinta shadow-flutuante backdrop:bg-tinta/60 sm:p-7"
      >
        <p className="mb-3 text-xs font-bold tracking-[0.12em] text-vermelho uppercase">Ação irreversível</p>
        <h2 id={`${identificador}-titulo`} className="font-sans text-2xl font-bold tracking-tight">
          Anonimizar este cadastro?
        </h2>
        <div id={`${identificador}-descricao`} className="mt-4 space-y-3 text-sm leading-relaxed text-carvao">
          <p className="break-words">
            Os dados pessoais de <strong className="text-tinta">{nome}</strong> serão removidos. Não será
            possível recuperá-los.
          </p>
          <p>
            Os pedidos e seus valores serão mantidos no histórico financeiro. O cadastro deixará de aparecer
            na lista de clientes e fornecedores.
          </p>
        </div>
        <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-areia bg-papel-2 p-4 text-sm leading-relaxed font-semibold">
          <input
            type="checkbox"
            checked={confirmou}
            onChange={(evento) => confirmar(evento.target.checked)}
            disabled={pendente}
            className="mt-0.5 size-5 shrink-0 accent-vermelho"
          />
          Entendo que esta ação é irreversível e quero anonimizar os dados.
        </label>
        {erro && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-vermelho-clara p-3 text-sm font-semibold text-vermelho"
          >
            {erro}
          </p>
        )}
        <p aria-live="polite" className="sr-only">
          {pendente ? 'Anonimizando os dados. Aguarde.' : ''}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            ref={cancelar}
            type="button"
            disabled={pendente}
            onClick={() => dialogo.current?.close()}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold hover:bg-papel-2 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!confirmou || pendente}
            aria-busy={pendente}
            onClick={anonimizar}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-vermelho px-4 py-3 text-sm font-bold text-branco hover:bg-[#a82a1a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pendente ? 'Anonimizando…' : 'Anonimizar dados'}
          </button>
        </div>
      </dialog>
    </section>
  )
}
