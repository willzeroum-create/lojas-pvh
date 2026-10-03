'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import { useAprovacaoGerente } from '@/components/ui/aprovacao-gerente'
import { Botao } from '@/components/ui/botao'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import type { ExtratoCashback } from '@/lib/dados/fidelidade'
import { formatarBRL } from '@/lib/dominio/moeda'
import { ajustarCashbackAction, extratoCashbackAction } from '../actions'

const ROTULOS: Record<ExtratoCashback['movimentos'][number]['tipo'], string> = {
  credito: 'Cashback da compra',
  devolucao: 'Devolução de cashback',
  resgate: 'Usado na compra',
  estorno: 'Estorno',
  ajuste: 'Ajuste manual',
}
const dataHora = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Porto_Velho',
})
const dataCurta = (data: string) => data.slice(0, 10).split('-').reverse().join('/')
const CAMPO =
  'mt-2 min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta'

export function DialogoExtrato({
  pessoaId,
  fechar,
  podeVerCadastro,
}: {
  pessoaId: string
  fechar: () => void
  podeVerCadastro: boolean
}) {
  const router = useRouter()
  const aprovacao = useAprovacaoGerente()
  const [extrato, definirExtrato] = useState<ExtratoCashback | null>(null)
  const [carregando, definirCarregando] = useState(true)
  const [erroConsulta, definirErroConsulta] = useState('')
  const [tentativa, definirTentativa] = useState(0)
  const [ajustando, definirAjustando] = useState(false)
  const [direcao, definirDirecao] = useState('adicionar')
  const [valor, definirValor] = useState('')
  const [motivo, definirMotivo] = useState('')
  const [erro, definirErro] = useState('')
  const [sucesso, definirSucesso] = useState('')
  const [ocupado, definirOcupado] = useState(false)
  const enviando = useRef(false)

  useEffect(() => {
    let cancelado = false
    extratoCashbackAction(pessoaId)
      .then((resultado) => {
        if (cancelado) return
        if (resultado.ok) definirExtrato(resultado.extrato)
        else definirErroConsulta(resultado.erro)
      })
      .catch(() => {
        if (!cancelado)
          definirErroConsulta('Não foi possível abrir o extrato. Confira sua conexão e tente novamente.')
      })
      .finally(() => {
        if (!cancelado) definirCarregando(false)
      })
    return () => {
      cancelado = true
    }
  }, [pessoaId, tentativa])

  function atualizar() {
    definirCarregando(true)
    definirErroConsulta('')
    definirTentativa((atual) => atual + 1)
  }

  async function ajustar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current || !extrato) return
    const valorNumerico = (Math.round(Number(valor) * 100) / 100) * (direcao === 'retirar' ? -1 : 1)
    if (!Number.isFinite(valorNumerico) || valorNumerico === 0 || motivo.trim().length < 5) {
      definirErro('Informe um valor maior que zero e um motivo com pelo menos 5 caracteres.')
      return
    }
    const entrada = { pessoaId, valor: valorNumerico, motivo: motivo.trim() }
    const executar = async (pinGerente?: string) => {
      const resultado = await ajustarCashbackAction({ ...entrada, pinGerente })
      if (resultado.ok) {
        definirAjustando(false)
        definirValor('')
        definirMotivo('')
        definirErro('')
        definirSucesso(`Ajuste de ${formatarBRL(valorNumerico)} registrado.`)
        atualizar()
        router.refresh()
      }
      return resultado
    }
    enviando.current = true
    definirOcupado(true)
    definirErro('')
    definirSucesso('')
    try {
      const resultado = await executar()
      if (!resultado.ok) {
        if (resultado.precisaGerente) {
          aprovacao.solicitar(
            executar,
            `Aprovar ajuste de ${formatarBRL(valorNumerico)} no cashback de ${extrato.pessoa.nome}. Motivo: ${entrada.motivo}`,
          )
        } else definirErro(resultado.erro)
      }
    } catch {
      definirErro('Não foi possível confirmar o ajuste. Confira os movimentos antes de tentar novamente.')
    } finally {
      enviando.current = false
      definirOcupado(false)
    }
  }

  return (
    <>
      {!aprovacao.dialogo && (
        <DialogoOperacao titulo="Extrato de cashback" fechar={fechar} ocupado={ocupado}>
          <div className="space-y-5">
            {sucesso && (
              <Mensagem tipo="sucesso" className="text-[#176b3a]!">
                {sucesso}
              </Mensagem>
            )}
            {carregando && (
              <p role="status" aria-live="polite" className="rounded-lg bg-papel-2 p-5 font-semibold">
                Atualizando o extrato…
              </p>
            )}
            {erroConsulta && (
              <div className="space-y-3">
                <Mensagem tipo="erro">{erroConsulta}</Mensagem>
                <Botao type="button" variante="secundario" cheio onClick={atualizar}>
                  Tentar novamente
                </Botao>
              </div>
            )}
            {extrato && (
              <>
                <section
                  aria-label="Saldo do cliente"
                  aria-live="polite"
                  aria-busy={carregando}
                  className="rounded-xl bg-tinta p-5 text-papel"
                >
                  <p className="text-lg font-bold break-words">{extrato.pessoa.nome}</p>
                  <p className="mt-4 text-sm text-papel-3">
                    Saldo disponível{carregando ? ' · atualizando' : ''}
                  </p>
                  <p className="mt-1 text-4xl font-bold tracking-tight break-words tabular-nums">
                    {formatarBRL(extrato.saldo)}
                  </p>
                  {extrato.aVencer30 > 0 && (
                    <p className="mt-3 text-sm font-semibold text-[#ffce7a]">
                      {formatarBRL(extrato.aVencer30)} vencem nos próximos 30 dias.
                    </p>
                  )}
                  {extrato.proximoVencimento && (
                    <p className="mt-2 text-sm text-papel-3">
                      Próximo vencimento: {dataCurta(extrato.proximoVencimento)}
                    </p>
                  )}
                </section>

                {podeVerCadastro && (
                  <Link
                    href={`/painel/clientes/${extrato.pessoa.id}`}
                    className="flex min-h-12 items-center justify-between gap-2 rounded-lg border border-areia px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
                  >
                    Abrir ficha do cliente <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                )}

                <Botao
                  type="button"
                  variante="secundario"
                  cheio
                  disabled={ocupado || carregando || Boolean(erroConsulta)}
                  aria-expanded={ajustando}
                  aria-controls="ajuste-cashback"
                  icone={<SlidersHorizontal aria-hidden="true" className="size-4" />}
                  onClick={() => {
                    definirAjustando(!ajustando)
                    definirErro('')
                    definirSucesso('')
                  }}
                >
                  {ajustando ? 'Fechar ajuste' : 'Ajustar saldo'}
                </Botao>

                {ajustando && (
                  <form
                    id="ajuste-cashback"
                    onSubmit={ajustar}
                    className="space-y-4 rounded-xl border border-areia bg-papel-2 p-4"
                  >
                    <h3 className="text-lg font-bold">Ajuste manual</h3>
                    <fieldset
                      disabled={ocupado || carregando || Boolean(erroConsulta)}
                      className="min-w-0 space-y-4"
                    >
                      <legend className="sr-only">Dados do ajuste</legend>
                      <label className="block text-sm font-semibold">
                        O que fazer
                        <select
                          value={direcao}
                          onChange={(evento) => definirDirecao(evento.target.value)}
                          className={CAMPO}
                        >
                          <option value="adicionar">Adicionar saldo</option>
                          <option value="retirar">Retirar saldo</option>
                        </select>
                      </label>
                      <label className="block text-sm font-semibold">
                        Valor (R$)
                        <input
                          type="number"
                          inputMode="decimal"
                          required
                          min="0.01"
                          max="10000"
                          step="0.01"
                          value={valor}
                          onChange={(evento) => definirValor(evento.target.value)}
                          className={CAMPO}
                        />
                      </label>
                      <label className="block text-sm font-semibold">
                        Motivo
                        <textarea
                          required
                          minLength={5}
                          maxLength={200}
                          rows={3}
                          value={motivo}
                          onChange={(evento) => definirMotivo(evento.target.value)}
                          className={`${CAMPO} py-3`}
                          placeholder="Explique a correção ou o bônus"
                        />
                      </label>
                      <p className="text-sm leading-relaxed text-carvao">
                        O valor e o motivo ficam no histórico. A operação pode pedir o PIN do gerente.
                      </p>
                    </fieldset>
                    {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
                    <Botao
                      type="submit"
                      cheio
                      carregando={ocupado}
                      disabled={carregando || Boolean(erroConsulta)}
                    >
                      {direcao === 'retirar' ? 'Confirmar retirada' : 'Confirmar crédito'}
                    </Botao>
                  </form>
                )}

                <section aria-labelledby="movimentos-cashback">
                  <h3 id="movimentos-cashback" className="text-lg font-bold">
                    Movimentos
                  </h3>
                  <p className="mt-1 text-sm text-carvao">Mais recentes primeiro · horário de Porto Velho</p>
                  {extrato.movimentos.length === 0 ? (
                    <p className="mt-4 rounded-lg border border-areia p-4 text-sm leading-relaxed text-carvao">
                      Ainda não há movimentos. As compras, resgates e ajustes aparecerão aqui.
                    </p>
                  ) : (
                    <ol className="mt-4 divide-y divide-areia">
                      {extrato.movimentos.map((movimento) => (
                        <li key={movimento.id} className="py-4 first:pt-0">
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <p className="font-bold">{ROTULOS[movimento.tipo]}</p>
                            <p
                              className={`text-xl font-bold tabular-nums ${movimento.valor < 0 ? 'text-vermelho' : 'text-[#176b3a]'}`}
                            >
                              {movimento.valor > 0 ? '+ ' : ''}
                              {formatarBRL(movimento.valor)}
                            </p>
                          </div>
                          <time dateTime={movimento.criadoEm} className="mt-1 block text-sm text-carvao">
                            {dataHora.format(new Date(movimento.criadoEm))}
                          </time>
                          {movimento.expiraEm && (
                            <p className="mt-1 text-sm text-carvao">
                              Validade: {dataCurta(movimento.expiraEm)}
                            </p>
                          )}
                          {movimento.motivo && (
                            <p className="mt-2 text-sm leading-relaxed break-words">{movimento.motivo}</p>
                          )}
                          {movimento.autor && (
                            <p className="mt-1 text-sm break-words text-carvao">Por {movimento.autor}</p>
                          )}
                          {movimento.pedidoId && (
                            <p className="mt-1 text-sm text-carvao">
                              Pedido: {movimento.pedidoId.slice(0, 8)}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                  {extrato.movimentos.length === 500 && (
                    <p className="mt-3 text-sm text-carvao">Mostrando os 500 movimentos mais recentes.</p>
                  )}
                </section>
              </>
            )}
          </div>
        </DialogoOperacao>
      )}
      {aprovacao.dialogo}
    </>
  )
}
