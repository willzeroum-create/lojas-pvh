'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from 'react'
import type { Carteira } from '@/lib/dados/financeiro'
import { valorMovimentado, type TipoTitulo } from '@/lib/dominio/financeiro'
import { formatarBRL, interpretarBRL } from '@/lib/dominio/moeda'
import { registarPagamentoAction } from '../actions'
import {
  CampoFinanceiro,
  ESTILO_BOTAO,
  ESTILO_PRIMARIO,
  FORMAS_PAGAMENTO,
  formatarDataFinanceira,
  SelecaoFinanceira,
  TextoFinanceiro,
} from './apresentacao'

type Propriedades = {
  parcela: { id: string; saldo: number; numero: number; vencimento: string }
  tipo: TipoTitulo
  descricao: string
  carteiras: Carteira[]
  hoje: string
}

export function PagamentoParcela({ parcela, tipo, descricao, carteiras, hoje }: Propriedades) {
  const roteador = useRouter()
  const identificador = useId()
  const dialogo = useRef<HTMLDialogElement>(null)
  const botaoAbrir = useRef<HTMLButtonElement>(null)
  const formulario = useRef<HTMLFormElement>(null)
  const resumoErro = useRef<HTMLDivElement>(null)
  const resumoSucesso = useRef<HTMLParagraphElement>(null)
  const enviando = useRef(false)
  const [aberto, definirAberto] = useState(false)
  const [pendente, iniciarTransicao] = useTransition()
  const [erro, definirErro] = useState<string | null>(null)
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [sucesso, definirSucesso] = useState(false)
  const [envioIncerto, definirEnvioIncerto] = useState(false)
  const [saldoRegistrado, definirSaldoRegistrado] = useState<number | null>(null)
  const [valores, definirValores] = useState({ valor: '', juros: '', multa: '', desconto: '' })
  const carteirasAtivas = carteiras.filter((carteira) => carteira.ativa)
  const acao = tipo === 'receber' ? 'Receber' : 'Pagar'
  const aguardandoSaldo = saldoRegistrado === parcela.saldo
  const indisponivel = parcela.saldo <= 0 || carteirasAtivas.length === 0 || aguardandoSaldo || envioIncerto
  const principal = interpretarBRL(valores.valor)
  const movimento = valorMovimentado({
    valor: principal ?? 0,
    juros: interpretarBRL(valores.juros) ?? 0,
    multa: interpretarBRL(valores.multa) ?? 0,
    desconto: interpretarBRL(valores.desconto) ?? 0,
  })

  useEffect(() => {
    if (!aberto) return
    dialogo.current?.showModal()
    formulario.current?.querySelector<HTMLInputElement>('[name="valor"]')?.focus()
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = anterior
    }
  }, [aberto])

  useEffect(() => {
    if (erro) resumoErro.current?.focus()
  }, [erro])

  useEffect(() => {
    if (sucesso && !aberto) resumoSucesso.current?.focus()
  }, [sucesso, aberto])

  function abrir() {
    if (indisponivel || enviando.current) return
    definirErro(null)
    definirErros({})
    definirSucesso(false)
    definirValores({ valor: parcela.saldo.toFixed(2).replace('.', ','), juros: '', multa: '', desconto: '' })
    definirAberto(true)
  }

  function alterarValor(campo: keyof typeof valores, valor: string) {
    definirValores((anteriores) => ({ ...anteriores, [campo]: valor }))
    definirErros((anteriores) => ({ ...anteriores, [campo]: '' }))
  }

  function registrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current || pendente || indisponivel) return
    const dados = new FormData(evento.currentTarget)
    definirErro(null)
    definirErros({})
    if (principal !== null && principal > parcela.saldo) {
      definirErros({ valor: `Informe até ${formatarBRL(parcela.saldo)}, o saldo desta parcela.` })
      definirErro('Confira o valor que será quitado nesta parcela.')
      return
    }
    if (movimento < 0) {
      definirErros({ desconto: 'O desconto não pode superar o valor com juros e multa.' })
      definirErro('Confira o desconto antes de registrar o pagamento.')
      return
    }
    enviando.current = true
    iniciarTransicao(async () => {
      try {
        const resultado = await registarPagamentoAction({
          parcelaId: parcela.id,
          carteiraId: dados.get('carteiraId'),
          data: dados.get('data'),
          valor: valores.valor,
          juros: valores.juros || '0',
          multa: valores.multa || '0',
          desconto: valores.desconto || '0',
          forma: dados.get('forma'),
          observacao: dados.get('observacao'),
        })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          definirErros(resultado.porCampo ?? {})
          return
        }
        definirSaldoRegistrado(parcela.saldo)
        definirSucesso(true)
        dialogo.current?.close()
        roteador.refresh()
      } catch {
        definirEnvioIncerto(true)
        definirErro(
          'A conexão foi interrompida e não foi possível confirmar o resultado. O pagamento pode ter sido registrado. Recarregue a tela e confira o saldo e o histórico antes de tentar novamente.',
        )
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <div className="min-w-0">
      <button
        ref={botaoAbrir}
        type="button"
        onClick={abrir}
        disabled={indisponivel || pendente}
        aria-label={`${acao} parcela ${parcela.numero} de ${descricao}`}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        aria-controls={`${identificador}-dialogo`}
        aria-describedby={indisponivel ? `${identificador}-indisponivel` : undefined}
        className={`${ESTILO_BOTAO} w-full sm:w-auto`}
      >
        {acao}
      </button>
      {indisponivel && (
        <p id={`${identificador}-indisponivel`} className="mt-2 max-w-56 text-xs leading-relaxed text-carvao">
          {parcela.saldo <= 0
            ? 'Parcela quitada.'
            : carteirasAtivas.length === 0
              ? 'Nenhuma carteira ativa disponível para registrar o pagamento.'
              : envioIncerto
                ? 'Confira se o pagamento foi registrado antes de tentar novamente.'
                : 'Pagamento registrado. Atualizando saldo…'}
        </p>
      )}
      {envioIncerto && !aberto && (
        <div
          role="alert"
          className="mt-3 max-w-md rounded-xl border border-ambar/40 bg-ambar-clara p-4 text-sm leading-relaxed text-carvao"
        >
          <p>{erro}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={`${ESTILO_BOTAO} mt-3 w-full`}
          >
            Recarregar e conferir
          </button>
        </div>
      )}
      <p
        ref={resumoSucesso}
        tabIndex={-1}
        role="status"
        className={sucesso ? 'mt-2 text-sm font-semibold text-[#17683a]' : 'sr-only'}
      >
        {sucesso ? 'Pagamento registrado.' : pendente ? 'Registrando pagamento. Aguarde.' : ''}
      </p>

      <dialog
        ref={dialogo}
        id={`${identificador}-dialogo`}
        aria-labelledby={`${identificador}-titulo`}
        aria-describedby={`${identificador}-descricao`}
        aria-modal="true"
        onCancel={(evento) => {
          if (enviando.current || pendente) evento.preventDefault()
        }}
        onClose={() => {
          definirAberto(false)
          botaoAbrir.current?.focus()
        }}
        className="financeiro-area fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto overscroll-contain rounded-xl border border-areia bg-papel p-5 text-tinta shadow-flutuante backdrop:bg-tinta/60 sm:p-7"
      >
        {aberto && (
          <>
            <header className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold tracking-[0.12em] text-carvao uppercase">
                  Parcela {parcela.numero}
                </p>
                <h2
                  id={`${identificador}-titulo`}
                  className="mt-2 font-sans text-2xl font-bold tracking-tight"
                >
                  {tipo === 'receber' ? 'Registrar recebimento' : 'Registrar pagamento'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dialogo.current?.close()}
                disabled={pendente}
                aria-label="Fechar registro de pagamento"
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-lg border border-areia bg-branco hover:bg-papel-2 disabled:opacity-50"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>
            <div
              id={`${identificador}-descricao`}
              className="mt-4 rounded-xl border border-areia bg-papel-2 p-4"
            >
              <p className="font-semibold break-words">{descricao}</p>
              <p className="mt-1 text-sm text-carvao">
                Vencimento: {formatarDataFinanceira(parcela.vencimento)}
              </p>
              <p className="mt-3 text-sm text-carvao">Saldo da parcela</p>
              <p className="mt-1 text-3xl font-bold tracking-tight break-words tabular-nums">
                {formatarBRL(parcela.saldo)}
              </p>
            </div>

            <form ref={formulario} onSubmit={registrar} noValidate className="mt-5 space-y-5">
              <fieldset disabled={pendente || envioIncerto} className="min-w-0 space-y-5 disabled:opacity-65">
                <legend className="sr-only">Dados do pagamento</legend>
                <CampoFinanceiro
                  id={`${identificador}-valor`}
                  name="valor"
                  rotulo="Valor da parcela a quitar (R$)"
                  inputMode="decimal"
                  autoComplete="off"
                  value={valores.valor}
                  onChange={(evento) => alterarValor('valor', evento.target.value)}
                  required
                  erro={erros.valor}
                  ajuda="Para pagamento parcial, informe apenas a parte que está sendo quitada."
                />
                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <SelecaoFinanceira
                    id={`${identificador}-carteira`}
                    name="carteiraId"
                    rotulo="Carteira"
                    defaultValue={carteirasAtivas[0]?.id ?? ''}
                    required
                    erro={erros.carteiraId}
                  >
                    <option value="">Selecione a carteira</option>
                    {carteirasAtivas.map((carteira) => (
                      <option key={carteira.id} value={carteira.id}>
                        {carteira.nome}
                      </option>
                    ))}
                  </SelecaoFinanceira>
                  <CampoFinanceiro
                    id={`${identificador}-data`}
                    name="data"
                    rotulo="Data do pagamento"
                    type="date"
                    defaultValue={hoje}
                    required
                    erro={erros.data}
                  />
                </div>
                <SelecaoFinanceira
                  id={`${identificador}-forma`}
                  name="forma"
                  rotulo="Forma de pagamento"
                  defaultValue="pix"
                  required
                  erro={erros.forma}
                >
                  {FORMAS_PAGAMENTO.map((forma) => (
                    <option key={forma.valor} value={forma.valor}>
                      {forma.rotulo}
                    </option>
                  ))}
                </SelecaoFinanceira>
                <div className="border-t border-areia pt-5">
                  <p className="text-sm font-bold">Ajustes do pagamento</p>
                  <p className="mt-1 text-sm leading-relaxed text-carvao">
                    Opcionais. Mudam o valor na carteira, sem alterar o valor quitado da parcela.
                  </p>
                  <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-3">
                    {(
                      [
                        ['juros', 'Juros (R$)'],
                        ['multa', 'Multa (R$)'],
                        ['desconto', 'Desconto (R$)'],
                      ] as const
                    ).map(([campo, rotulo]) => (
                      <CampoFinanceiro
                        key={campo}
                        id={`${identificador}-${campo}`}
                        name={campo}
                        rotulo={rotulo}
                        inputMode="decimal"
                        placeholder="0,00"
                        autoComplete="off"
                        value={valores[campo]}
                        onChange={(evento) => alterarValor(campo, evento.target.value)}
                        erro={erros[campo]}
                      />
                    ))}
                  </div>
                </div>
                <TextoFinanceiro
                  id={`${identificador}-observacao`}
                  name="observacao"
                  rotulo="Observação (opcional)"
                  rows={2}
                  maxLength={300}
                  erro={erros.observacao}
                />
              </fieldset>
              <dl
                className="space-y-3 rounded-xl bg-tinta p-4 text-papel"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <dt className="text-sm text-papel-3">
                    {tipo === 'receber' ? 'Entrada na carteira' : 'Saída da carteira'}
                  </dt>
                  <dd className="text-2xl font-bold break-words tabular-nums">{formatarBRL(movimento)}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-papel/20 pt-3 text-sm">
                  <dt>Saldo restante da parcela</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatarBRL(Math.max(0, Math.round((parcela.saldo - (principal ?? 0)) * 100) / 100))}
                  </dd>
                </div>
              </dl>
              {erro && (
                <div
                  ref={resumoErro}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-xl border border-vermelho/40 bg-vermelho-clara p-4 text-sm leading-relaxed text-vermelho"
                >
                  <p className="font-bold">
                    {envioIncerto ? 'Confira o resultado do pagamento' : 'Pagamento não registrado'}
                  </p>
                  <p className="mt-1">{erro}</p>
                  {envioIncerto && (
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className={`${ESTILO_BOTAO} mt-3 w-full`}
                    >
                      Recarregar e conferir
                    </button>
                  )}
                  {erros.parcelaId && (
                    <p className="mt-1">A parcela não está disponível. Atualize a página.</p>
                  )}
                </div>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-areia pt-5 sm:flex-row">
                <button
                  type="button"
                  disabled={pendente}
                  onClick={() => dialogo.current?.close()}
                  className={`${ESTILO_BOTAO} flex-1`}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={pendente || indisponivel}
                  aria-busy={pendente}
                  className={`${ESTILO_PRIMARIO} flex-1`}
                >
                  {pendente
                    ? 'Registrando…'
                    : tipo === 'receber'
                      ? 'Confirmar recebimento'
                      : 'Confirmar pagamento'}
                </button>
              </div>
              <p role="status" className="sr-only">
                {pendente ? 'Registrando pagamento. Aguarde.' : ''}
              </p>
            </form>
          </>
        )}
      </dialog>
    </div>
  )
}
