'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, useTransition } from 'react'
import { formatarBRL } from '@/lib/dominio/moeda'
import { cancelarContaAction, estornarPagamentoAction } from '../actions'
import { ESTILO_BOTAO } from './apresentacao'

function ConfirmacaoFinanceira({
  id,
  acao,
  titulo,
  descricao,
}: {
  id: string
  acao: 'estornar' | 'cancelar'
  titulo: string
  descricao: string
}) {
  const roteador = useRouter()
  const identificador = useId()
  const botao = useRef<HTMLButtonElement>(null)
  const voltar = useRef<HTMLButtonElement>(null)
  const resumoSucesso = useRef<HTMLParagraphElement>(null)
  const enviando = useRef(false)
  const [aberto, definirAberto] = useState(false)
  const [erro, definirErro] = useState<string | null>(null)
  const [concluido, definirConcluido] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()

  useEffect(() => {
    if (aberto) voltar.current?.focus()
  }, [aberto])

  useEffect(() => {
    if (concluido) resumoSucesso.current?.focus()
  }, [concluido])

  function confirmar() {
    if (enviando.current || pendente || concluido) return
    enviando.current = true
    definirErro(null)
    iniciarTransicao(async () => {
      try {
        const resultado =
          acao === 'estornar' ? await estornarPagamentoAction(id) : await cancelarContaAction(id)
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        definirConcluido(true)
        definirAberto(false)
        roteador.refresh()
      } catch {
        definirErro('Não foi possível concluir agora. Confira sua conexão e tente novamente.')
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <div className="min-w-0">
      {!concluido && (
        <button
          ref={botao}
          type="button"
          disabled={pendente}
          aria-expanded={aberto}
          aria-controls={`${identificador}-confirmacao`}
          onClick={() => {
            definirErro(null)
            definirAberto(true)
          }}
          className={`${ESTILO_BOTAO} border-vermelho/40 text-vermelho hover:bg-vermelho-clara`}
        >
          {acao === 'estornar' ? 'Estornar' : 'Cancelar conta'}
        </button>
      )}
      {aberto && (
        <section
          id={`${identificador}-confirmacao`}
          aria-labelledby={`${identificador}-titulo`}
          className="mt-3 rounded-xl border border-vermelho/35 bg-vermelho-clara p-4"
        >
          <h3 id={`${identificador}-titulo`} className="font-sans text-base font-bold text-tinta">
            {titulo}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-carvao">{descricao}</p>
          {erro && (
            <p role="alert" className="mt-3 text-sm font-semibold text-vermelho">
              {erro}
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              ref={voltar}
              type="button"
              disabled={pendente}
              onClick={() => {
                definirAberto(false)
                botao.current?.focus()
              }}
              className={ESTILO_BOTAO}
            >
              {acao === 'estornar' ? 'Manter pagamento' : 'Manter conta'}
            </button>
            <button
              type="button"
              disabled={pendente}
              aria-busy={pendente}
              onClick={confirmar}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-vermelho px-4 py-3 text-sm font-bold text-branco hover:bg-[#a82a1a] disabled:cursor-wait disabled:opacity-60"
            >
              {pendente
                ? 'Confirmando…'
                : acao === 'estornar'
                  ? 'Confirmar estorno'
                  : 'Confirmar cancelamento'}
            </button>
          </div>
        </section>
      )}
      <p
        ref={resumoSucesso}
        tabIndex={-1}
        role="status"
        className={concluido ? 'mt-3 text-sm font-semibold text-[#17683a]' : 'sr-only'}
      >
        {concluido
          ? acao === 'estornar'
            ? 'Pagamento estornado. Atualizando os valores…'
            : 'Conta cancelada. Atualizando os valores…'
          : pendente
            ? 'Salvando alteração. Aguarde.'
            : ''}
      </p>
    </div>
  )
}

export function EstornarPagamento({
  baixaId,
  valor,
  carteira,
  contaCancelada,
}: {
  baixaId: string
  valor: number
  carteira: string
  contaCancelada: boolean
}) {
  return (
    <ConfirmacaoFinanceira
      id={baixaId}
      acao="estornar"
      titulo="Estornar este pagamento?"
      descricao={`O movimento de ${formatarBRL(valor)} será desfeito na carteira ${carteira || 'do pagamento'} e continuará no histórico como estornado. ${contaCancelada ? 'A conta continuará cancelada.' : 'O valor quitado voltará ao saldo da parcela.'}`}
    />
  )
}

export function CancelarConta({ tituloId, temPagamentos }: { tituloId: string; temPagamentos: boolean }) {
  return (
    <section className="rounded-xl border border-areia p-5" aria-labelledby="cancelar-conta-titulo">
      <h2 id="cancelar-conta-titulo" className="font-sans text-lg font-bold">
        Cancelar esta conta
      </h2>
      <p className="mt-2 mb-4 text-sm leading-relaxed text-carvao">
        A conta permanece no histórico e suas parcelas deixam de entrar nas previsões do caixa.
      </p>
      <ConfirmacaoFinanceira
        id={tituloId}
        acao="cancelar"
        titulo="Confirmar o cancelamento da conta?"
        descricao={`Todas as parcelas serão marcadas como canceladas. Esta conta não poderá receber novos pagamentos. ${temPagamentos ? 'Os pagamentos já registrados e seus movimentos nas carteiras serão mantidos. Para desfazê-los, estorne cada pagamento no histórico.' : 'Nenhum movimento será feito nas carteiras.'}`}
      />
    </section>
  )
}
