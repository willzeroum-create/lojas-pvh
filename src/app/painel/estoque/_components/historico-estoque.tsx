'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ItemEstoque } from '@/lib/dados/estoque'
import type { EstoqueMovimentoLinha } from '@/lib/supabase/tipos'
import { formatarBRL } from '@/lib/dominio/moeda'
import { useAprovacaoGerente } from '@/components/ui/aprovacao-gerente'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import { estornarMovimentoAction, registarSaidaAction } from '../actions'
import { BOTAO, CampoEstoque, dataHora, PRIMARIO, quantidade, SelecaoEstoque } from './apresentacao'

export function HistoricoEstoque({
  item,
  movimentos,
  motivos,
  exigePin,
}: {
  item: ItemEstoque
  movimentos: EstoqueMovimentoLinha[]
  motivos: readonly string[]
  exigePin: boolean
}) {
  const router = useRouter()
  const aprovacao = useAprovacaoGerente()
  const [saida, definirSaida] = useState(false)
  const [estorno, definirEstorno] = useState<EstoqueMovimentoLinha | null>(null)
  const [erro, definirErro] = useState('')
  const [campos, definirCampos] = useState<Record<string, string>>({})
  const [sucesso, definirSucesso] = useState('')
  const [ocupado, definirOcupado] = useState(false)
  const enviando = useRef(false)
  const estornados = new Set(
    movimentos.flatMap((movimento) => (movimento.estorno_de ? [movimento.estorno_de] : [])),
  )
  async function confirmarEstorno() {
    if (!estorno || enviando.current) return
    const movimentoId = estorno.id
    const executar = async (pinGerente?: string) => {
      const resultado = await estornarMovimentoAction(movimentoId, pinGerente)
      if (resultado.ok) {
        definirEstorno(null)
        definirErro('')
        definirSucesso('Movimento estornado. O saldo foi atualizado.')
        router.refresh()
      }
      return resultado
    }
    definirErro('')
    definirSucesso('')
    if (exigePin) {
      definirEstorno(null)
      aprovacao.solicitar(
        executar,
        `Aprovar estorno de ${quantidade(estorno.quantidade)} ${item.unidade} de ${item.nome}.`,
      )
      return
    }
    enviando.current = true
    definirOcupado(true)
    try {
      const resultado = await executar()
      if (!resultado.ok) {
        if ('precisaGerente' in resultado && resultado.precisaGerente) {
          definirEstorno(null)
          aprovacao.solicitar(executar, resultado.erro)
        } else definirErro(resultado.erro)
      }
    } catch {
      definirErro('Não foi possível confirmar o estorno. Confira o histórico antes de tentar novamente.')
    } finally {
      enviando.current = false
      definirOcupado(false)
    }
  }
  return (
    <>
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Saldo do item">
        <div
          className={`rounded-xl border p-5 ${item.saldo <= 0 ? 'border-vermelho/30 bg-vermelho-clara text-vermelho' : item.abaixoDoMinimo ? 'border-ambar/40 bg-ambar-clara text-[#805000]' : 'border-areia bg-branco'}`}
        >
          <p className="text-sm font-semibold">Saldo atual</p>
          <p className="mt-2 text-4xl font-bold tabular-nums">
            {quantidade(item.saldo)} <span className="text-base">{item.unidade}</span>
          </p>
          <p className="mt-2 text-sm">
            Mínimo: {quantidade(item.minimo)} {item.unidade}
          </p>
        </div>
        <div className="rounded-xl border border-areia bg-branco p-5">
          <p className="text-sm text-carvao">Custo médio por {item.unidade}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{formatarBRL(item.custo)}</p>
        </div>
        <div className="rounded-xl border border-areia bg-branco p-5">
          <p className="text-sm text-carvao">Valor em estoque</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{formatarBRL(item.valor)}</p>
        </div>
      </section>
      {sucesso && (
        <Mensagem tipo="sucesso" className="text-[#176b3a]!">
          {sucesso}
        </Mensagem>
      )}
      {erro && !saida && !estorno && <Mensagem tipo="erro">{erro}</Mensagem>}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">Histórico de movimentos</h2>
            <p className="mt-1 text-sm text-carvao">
              Últimos {movimentos.length} registros · horário de Porto Velho
            </p>
          </div>
          <button
            type="button"
            className={PRIMARIO}
            onClick={() => {
              definirErro('')
              definirCampos({})
              definirSaida(true)
            }}
          >
            Registrar saída
          </button>
        </div>
        {movimentos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-areia p-6 text-carvao">
            Nenhum movimento registrado para este item.
          </p>
        ) : (
          <ol className="divide-y divide-areia rounded-xl border border-areia bg-branco">
            {movimentos.map((movimento) => (
              <li key={movimento.id} className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold">{movimento.motivo}</p>
                    <p className="mt-1 text-sm text-carvao">
                      {movimento.autor_nome ?? 'Autor não informado'} ·{' '}
                      <time dateTime={movimento.criado_em}>{dataHora(movimento.criado_em)}</time>
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-bold tabular-nums ${movimento.quantidade > 0 ? 'text-[#176b3a]' : 'text-vermelho'}`}
                  >
                    {movimento.quantidade > 0 ? '+' : ''}
                    {quantidade(movimento.quantidade)} <span className="text-sm">{item.unidade}</span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-carvao">
                    Saldo: <strong>{quantidade(movimento.saldo_antes)}</strong> →{' '}
                    <strong>
                      {quantidade(movimento.saldo_depois)} {item.unidade}
                    </strong>
                  </p>
                  {movimento.estorno_de ? (
                    <span className="text-sm font-semibold text-carvao">Estorno registrado</span>
                  ) : estornados.has(movimento.id) ? (
                    <span className="text-sm font-semibold text-carvao">Já estornado</span>
                  ) : (
                    <button
                      type="button"
                      className={BOTAO}
                      onClick={() => {
                        definirErro('')
                        definirEstorno(movimento)
                      }}
                      aria-label={`Estornar ${movimento.motivo} de ${dataHora(movimento.criado_em)}`}
                    >
                      Estornar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
      {saida && (
        <DialogoOperacao titulo="Registrar saída" fechar={() => definirSaida(false)} ocupado={ocupado}>
          <form
            className="space-y-4"
            onSubmit={async (evento) => {
              evento.preventDefault()
              if (enviando.current) return
              const dados = new FormData(evento.currentTarget)
              enviando.current = true
              definirOcupado(true)
              definirErro('')
              definirCampos({})
              definirSucesso('')
              try {
                const resultado = await registarSaidaAction({
                  item: { tipo: item.tipo, id: item.id },
                  quantidade: dados.get('quantidade'),
                  motivo: dados.get('motivo'),
                })
                if (resultado.ok) {
                  definirSaida(false)
                  definirSucesso('Saída registrada. O saldo foi atualizado.')
                  router.refresh()
                } else {
                  definirErro(resultado.erro)
                  definirCampos(resultado.porCampo ?? {})
                }
              } catch {
                definirErro(
                  'Não foi possível confirmar a saída. Confira o histórico antes de tentar novamente.',
                )
              } finally {
                enviando.current = false
                definirOcupado(false)
              }
            }}
          >
            <p className="text-sm text-carvao">
              {item.nome} · saldo {quantidade(item.saldo)} {item.unidade}
            </p>
            <fieldset disabled={ocupado} className="space-y-4">
              <CampoEstoque
                name="quantidade"
                rotulo={`Quantidade (${item.unidade})`}
                type="number"
                inputMode="decimal"
                min="0.001"
                max="999999"
                step="0.001"
                required
                erro={campos.quantidade}
              />
              <SelecaoEstoque
                name="motivo"
                rotulo="Motivo da saída"
                defaultValue=""
                required
                erro={campos.motivo}
              >
                <option value="" disabled>
                  Escolha um motivo
                </option>
                {motivos.map((motivo) => (
                  <option key={motivo}>{motivo}</option>
                ))}
              </SelecaoEstoque>
            </fieldset>
            {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
            <button type="submit" disabled={ocupado} className={`${PRIMARIO} w-full`}>
              {ocupado ? 'Registrando…' : 'Confirmar saída'}
            </button>
          </form>
        </DialogoOperacao>
      )}
      {estorno && (
        <DialogoOperacao titulo="Estornar movimento?" fechar={() => definirEstorno(null)} ocupado={ocupado}>
          <p className="mb-4 text-sm leading-relaxed text-carvao">
            {estorno.motivo} · {quantidade(estorno.quantidade)} {item.unidade}. O estorno cria um movimento
            inverso e preserva o histórico.
          </p>
          {erro && (
            <Mensagem tipo="erro" className="mb-4">
              {erro}
            </Mensagem>
          )}
          <div className="flex flex-col gap-2">
            <button type="button" disabled={ocupado} className={PRIMARIO} onClick={confirmarEstorno}>
              {ocupado ? 'Estornando…' : 'Confirmar estorno'}
            </button>
            <button type="button" disabled={ocupado} className={BOTAO} onClick={() => definirEstorno(null)}>
              Voltar
            </button>
          </div>
        </DialogoOperacao>
      )}
      {aprovacao.dialogo}
    </>
  )
}
