'use client'

import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { FORMAS_RECEBIMENTO, ROTULO_FORMA } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import { dividirConta, distribuirPagamentos, taxaServico, type FormaRecebimento } from '@/lib/dominio/pdv'
import { fecharComandaAction } from '../../actions'
import { escreverNumero, lerNumero, type ExecutarComanda } from './campos-comanda'

type Recebimento = { chave: number; forma: FormaRecebimento; valor: string }

export function FecharConta({
  comandaId,
  subtotal,
  pessoas,
  descontoInicial,
  revisao,
  caixaEstaAberto,
  itensEmPreparo,
  ocupado,
  executar,
  aoFechar,
}: {
  comandaId: string
  subtotal: number
  pessoas: number
  descontoInicial: number
  revisao: string
  caixaEstaAberto: boolean
  itensEmPreparo: number
  ocupado: boolean
  executar: ExecutarComanda
  aoFechar: (resumo: { total: number; troco: number }) => void
}) {
  const [incluirServico, definirIncluirServico] = useState(true)
  const [percentual, definirPercentual] = useState('10')
  const [desconto, definirDesconto] = useState(descontoInicial ? escreverNumero(descontoInicial) : '')
  const [divisao, definirDivisao] = useState(String(pessoas))
  const [recebimentos, definirRecebimentos] = useState<Recebimento[]>([])
  const [forma, definirForma] = useState<FormaRecebimento>('pix')
  const [valorNovo, definirValorNovo] = useState('')
  const [revisaoAceita, definirRevisaoAceita] = useState(revisao)
  const [erro, definirErro] = useState('')
  const sequencia = useRef(0)
  const descontoValor = lerNumero(desconto)
  const descontoValido = Number.isFinite(descontoValor) && descontoValor >= 0 && descontoValor <= subtotal
  const percentualValor = lerNumero(percentual)
  const percentualValido =
    !incluirServico ||
    (percentual.trim() !== '' &&
      Number.isFinite(percentualValor) &&
      percentualValor >= 0 &&
      percentualValor <= 100)
  const servico = incluirServico && percentualValido ? taxaServico(subtotal, percentualValor) : 0
  const total =
    descontoValido && percentualValido
      ? (Math.max(Math.round(subtotal * 100) - Math.round(descontoValor * 100), 0) +
          Math.round(servico * 100)) /
        100
      : null
  const numeroPessoas = lerNumero(divisao, 0)
  const divisaoValida = Number.isInteger(numeroPessoas) && numeroPessoas >= 1 && numeroPessoas <= 99
  const cotas = divisaoValida && total !== null ? dividirConta(total, numeroPessoas) : []
  const pagamentos = recebimentos.map((pagamento) => ({
    forma: pagamento.forma,
    valor: lerNumero(pagamento.valor),
  }))
  const pagamentosInvalidos = pagamentos.some(
    (pagamento) => !Number.isFinite(pagamento.valor) || pagamento.valor <= 0,
  )
  const calculo = total !== null && !pagamentosInvalidos ? distribuirPagamentos(total, pagamentos) : null
  const pago = pagamentosInvalidos
    ? null
    : pagamentos.reduce((soma, pagamento) => soma + Math.round(pagamento.valor * 100), 0) / 100
  const falta =
    total !== null && pago !== null
      ? Math.max(0, Math.round(total * 100) - Math.round(pago * 100)) / 100
      : null
  const contaMudou = revisao !== revisaoAceita
  const podeFechar =
    total !== null &&
    total > 0 &&
    calculo?.ok &&
    !contaMudou &&
    !ocupado &&
    caixaEstaAberto &&
    !itensEmPreparo

  function adicionarPagamento() {
    if (ocupado || contaMudou || total === null) return
    const valor = lerNumero(valorNovo)
    if (!Number.isFinite(valor) || valor <= 0) {
      definirErro('Informe o valor recebido, com até duas casas decimais.')
      return
    }
    if (recebimentos.length >= 20) {
      definirErro('O limite é de 20 pagamentos por conta. Agrupe os valores na mesma forma, se necessário.')
      return
    }
    const chave = ++sequencia.current
    definirRecebimentos((atuais) => [...atuais, { chave, forma, valor: escreverNumero(valor) }])
    definirValorNovo('')
    definirErro('')
  }

  return (
    <section aria-labelledby="fechar-conta-titulo" className="space-y-5">
      <header>
        <p className="text-xs font-bold tracking-widest text-carvao uppercase">Acerto da mesa</p>
        <h2 id="fechar-conta-titulo" className="mt-1 text-2xl font-bold">
          Fechar conta
        </h2>
        <p className="mt-1 text-sm text-carvao">
          Confira o consumo, combine a divisão e registre o recebimento.
        </p>
      </header>
      {!caixaEstaAberto && (
        <div role="status" className="rounded-xl border border-ambar bg-ambar-clara p-4 text-[#774800]">
          <strong>O caixa está fechado.</strong>
          <p className="mt-1 text-sm">Abra o caixa para confirmar o recebimento desta conta.</p>
          <Link href="/painel/caixa" className="pdv-botao mt-3">
            Ir para o caixa
          </Link>
        </div>
      )}
      {itensEmPreparo > 0 && (
        <p role="status" className="rounded-xl border border-ambar bg-ambar-clara p-4 text-sm text-[#774800]">
          {itensEmPreparo === 1 ? 'Há um item' : `Há ${itensEmPreparo} itens`} na fila ou em preparo. Aguarde
          a cozinha concluir para fechar a conta.
        </p>
      )}
      {contaMudou && (
        <div role="alert" className="rounded-xl border border-ambar bg-ambar-clara p-4 text-[#774800]">
          <strong>O consumo desta comanda foi atualizado.</strong>
          <p className="mt-1 text-sm">
            Revise os itens e o novo total antes de preparar os pagamentos novamente.
          </p>
          <button
            type="button"
            disabled={ocupado}
            className="pdv-botao mt-3"
            onClick={() => {
              definirRevisaoAceita(revisao)
              definirRecebimentos([])
              definirValorNovo('')
              definirErro('')
            }}
          >
            Usar a conta atualizada
          </button>
        </div>
      )}
      <fieldset
        disabled={ocupado}
        className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
      >
        <div className="min-w-0 space-y-5">
          <section className="rounded-xl border border-areia bg-branco p-4 sm:p-5">
            <h3 className="text-lg font-bold">Consumo e serviço</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt>Consumo</dt>
                <dd className="font-bold tabular-nums">{formatarBRL(subtotal)}</dd>
              </div>
            </dl>
            <label className="mt-4 flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border border-areia p-3">
              <input
                type="checkbox"
                className="mt-1 size-5 shrink-0 accent-tangerina"
                checked={incluirServico}
                onChange={(evento) => definirIncluirServico(evento.target.checked)}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">
                  Incluir taxa de serviço <span className="font-normal">· opcional</span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-carvao">
                  O cliente decide. Desmarque se ele não quiser pagar.
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold tabular-nums">{formatarBRL(servico)}</span>
            </label>
            {incluirServico && (
              <div className="mt-3">
                <label htmlFor="percentual-servico" className="mb-1 block text-sm font-bold">
                  Serviço (%)
                </label>
                <input
                  id="percentual-servico"
                  inputMode="decimal"
                  className="pdv-campo max-w-32 tabular-nums"
                  value={percentual}
                  onChange={(evento) => definirPercentual(evento.target.value)}
                  aria-invalid={!percentualValido}
                  maxLength={6}
                />
                {!percentualValido && (
                  <p className="mt-2 text-sm text-vermelho">
                    Informe um percentual entre 0 e 100, com até duas casas decimais.
                  </p>
                )}
              </div>
            )}
            <label htmlFor="desconto-comanda" className="mt-4 mb-1 block text-sm font-bold">
              Desconto (R$)
            </label>
            <input
              id="desconto-comanda"
              className="pdv-campo text-lg tabular-nums"
              inputMode="decimal"
              value={desconto}
              onChange={(evento) => definirDesconto(evento.target.value)}
              placeholder="0,00"
              aria-invalid={!descontoValido}
              aria-describedby={!descontoValido ? 'erro-desconto-comanda' : undefined}
            />
            {!descontoValido && (
              <p id="erro-desconto-comanda" className="mt-2 text-sm text-vermelho">
                Use um desconto entre zero e {formatarBRL(subtotal)}, com até duas casas decimais.
              </p>
            )}
            <div className="mt-5 rounded-xl bg-tinta p-4 text-papel" aria-live="polite" aria-atomic="true">
              <p className="text-sm font-semibold">Total a receber</p>
              <p className="mt-1 text-4xl font-extrabold tabular-nums">
                {total === null ? '—' : formatarBRL(total)}
              </p>
              <p className="mt-2 text-xs">
                {incluirServico
                  ? `Serviço de ${percentualValido ? percentual : '—'}% sobre o consumo.`
                  : 'Sem taxa de serviço.'}
              </p>
            </div>
            {total === 0 && (
              <p className="pdv-erro mt-3">
                O total está zerado. Revise o desconto antes de fechar: o recebimento exige um valor maior que
                zero.
              </p>
            )}
          </section>
          <section className="rounded-xl border border-areia bg-branco p-4 sm:p-5">
            <h3 className="text-lg font-bold">Dividir a conta</h3>
            <label htmlFor="pessoas-divisao" className="mt-3 mb-1 block text-sm font-bold">
              Número de pessoas
            </label>
            <input
              id="pessoas-divisao"
              className="pdv-campo max-w-32 text-xl tabular-nums"
              inputMode="numeric"
              maxLength={2}
              value={divisao}
              onChange={(evento) => definirDivisao(evento.target.value)}
              aria-invalid={!divisaoValida}
            />
            {!divisaoValida && <p className="mt-2 text-sm text-vermelho">Informe de 1 a 99 pessoas.</p>}
            {cotas.length > 0 && (
              <div className="mt-4 space-y-2" aria-live="polite">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{cotas.length === 1 ? 'Por pessoa' : 'Primeira pessoa'}</span>
                  <strong className="text-xl tabular-nums">{formatarBRL(cotas[0] ?? 0)}</strong>
                </div>
                {cotas.length > 1 && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      {cotas.length - 1} {cotas.length === 2 ? 'pessoa' : 'pessoas'}
                    </span>
                    <strong className="tabular-nums">{formatarBRL(cotas[1] ?? 0)} cada</strong>
                  </div>
                )}
                <p className="pt-1 text-xs leading-relaxed text-carvao">
                  A soma fecha exatamente. Os centavos restantes ficam na primeira cota.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    className="pdv-botao text-sm"
                    onClick={() => {
                      definirValorNovo(escreverNumero(cotas[0] ?? 0))
                      document.getElementById('novo-pagamento-comanda')?.focus()
                    }}
                  >
                    Usar {cotas.length > 1 ? '1ª cota' : 'esta cota'}
                  </button>
                  {cotas.length > 1 && (
                    <button
                      type="button"
                      className="pdv-botao text-sm"
                      onClick={() => {
                        definirValorNovo(escreverNumero(cotas[1] ?? 0))
                        document.getElementById('novo-pagamento-comanda')?.focus()
                      }}
                    >
                      Usar outra cota
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
        <section className="min-w-0 self-start rounded-xl border border-areia bg-branco p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold">Pagamentos</h3>
            <span className="text-xs font-bold tabular-nums">{recebimentos.length}/20</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-carvao">
            Combine formas e valores. Eles serão registrados juntos ao confirmar o fechamento.
          </p>
          <div
            className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3"
            role="group"
            aria-label="Forma do próximo pagamento"
          >
            {FORMAS_RECEBIMENTO.map((opcao) => (
              <button
                key={opcao}
                type="button"
                aria-pressed={forma === opcao}
                className={`pdv-botao text-sm ${forma === opcao ? 'border-tinta! bg-tinta! text-papel!' : ''}`}
                onClick={() => definirForma(opcao)}
              >
                {ROTULO_FORMA[opcao]}
              </button>
            ))}
          </div>
          <label htmlFor="novo-pagamento-comanda" className="mt-4 mb-1 block text-sm font-bold">
            {ROTULO_FORMA[forma]} · valor recebido (R$)
          </label>
          <div className="flex gap-2">
            <input
              id="novo-pagamento-comanda"
              className="pdv-campo min-w-0 flex-1 text-xl tabular-nums"
              value={valorNovo}
              inputMode="decimal"
              onChange={(evento) => {
                definirValorNovo(evento.target.value)
                definirErro('')
              }}
              onKeyDown={(evento) => {
                if (evento.key === 'Enter') {
                  evento.preventDefault()
                  adicionarPagamento()
                }
              }}
              placeholder="0,00"
            />
            <button
              type="button"
              className="pdv-botao"
              disabled={falta === null || falta <= 0}
              onClick={() => definirValorNovo(escreverNumero(falta ?? 0))}
            >
              Falta pagar
            </button>
          </div>
          <button
            type="button"
            className="pdv-botao mt-3 w-full"
            disabled={recebimentos.length >= 20 || !valorNovo.trim() || contaMudou || total === null}
            onClick={adicionarPagamento}
          >
            Adicionar pagamento em {ROTULO_FORMA[forma]}
          </button>
          {erro && (
            <p role="alert" className="pdv-erro mt-3">
              {erro}
            </p>
          )}
          {recebimentos.length > 0 && (
            <ol className="mt-5 space-y-3 border-t border-areia pt-4">
              {recebimentos.map((recebimento, indice) => (
                <li key={recebimento.chave} className="flex items-end gap-2">
                  <label
                    className="min-w-0 flex-1 text-sm font-bold"
                    htmlFor={`recebimento-comanda-${recebimento.chave}`}
                  >
                    {indice + 1}. {ROTULO_FORMA[recebimento.forma]} (R$)
                    <input
                      id={`recebimento-comanda-${recebimento.chave}`}
                      className="pdv-campo mt-1 text-lg tabular-nums"
                      value={recebimento.valor}
                      inputMode="decimal"
                      aria-invalid={
                        !Number.isFinite(lerNumero(recebimento.valor)) || lerNumero(recebimento.valor) <= 0
                      }
                      onChange={(evento) =>
                        definirRecebimentos((atuais) =>
                          atuais.map((item) =>
                            item.chave === recebimento.chave ? { ...item, valor: evento.target.value } : item,
                          ),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="pdv-icone shrink-0 border border-areia"
                    aria-label={`Remover pagamento ${indice + 1} em ${ROTULO_FORMA[recebimento.forma]}`}
                    onClick={() =>
                      definirRecebimentos((atuais) =>
                        atuais.filter((item) => item.chave !== recebimento.chave),
                      )
                    }
                  >
                    <Trash2 aria-hidden className="size-5" />
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div
            aria-live="polite"
            aria-atomic="true"
            className={`mt-5 rounded-xl p-4 ${calculo?.ok ? 'bg-tinta text-papel' : 'bg-papel-2 text-tinta'}`}
          >
            {calculo?.ok ? (
              <>
                <p className="text-sm font-bold">Troco em dinheiro</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums">
                  {formatarBRL(calculo.valor.troco)}
                </p>
                <p className="mt-2 text-xs">
                  Recebido: {formatarBRL(calculo.valor.pago)}. Pagamento completo.
                </p>
              </>
            ) : pagamentosInvalidos ? (
              <p className="font-bold">Revise o valor de cada pagamento.</p>
            ) : calculo && !calculo.ok && !calculo.falta && recebimentos.length ? (
              <p className="font-bold">{calculo.erro}</p>
            ) : (
              <>
                <p className="text-sm font-bold">Falta receber</p>
                <p className="mt-1 text-3xl font-extrabold tabular-nums">
                  {falta === null ? '—' : formatarBRL(falta)}
                </p>
              </>
            )}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-carvao">
            Confira o recebimento de Pix e cartão antes de confirmar. O fechamento encerra a comanda e libera
            a mesa.
          </p>
          <button
            type="button"
            disabled={!podeFechar}
            className="pdv-botao pdv-primario mt-4 min-h-14! w-full text-base"
            onClick={async () => {
              if (!podeFechar) return
              await executar(async () => {
                const resposta = await fecharComandaAction({
                  comandaId,
                  taxaServico: servico,
                  desconto: descontoValor,
                  pagamentos,
                })
                if (resposta.ok) aoFechar({ total: resposta.total, troco: resposta.troco })
                return resposta
              }, 'Conta fechada e recebimento registrado.')
            }}
          >
            {ocupado ? 'Fechando conta…' : 'Confirmar e fechar conta'}
          </button>
        </section>
      </fieldset>
    </section>
  )
}
