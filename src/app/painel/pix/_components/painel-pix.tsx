'use client'

import { ArrowUpRight, Plus, QrCode, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, type FormEvent } from 'react'
import { gerarPixAction } from '@/app/painel/pix/actions'
import { Botao } from '@/components/ui/botao'
import { Campo } from '@/components/ui/campo'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import type { CobrancaPix } from '@/lib/dados/pix'
import { formatarBRL, interpretarBRL } from '@/lib/dominio/moeda'
import { QrPix } from './qr-pix'

const ESTADOS: Record<CobrancaPix['estado'], { rotulo: string; estilo: string }> = {
  pendente: { rotulo: 'Aguardando pagamento', estilo: 'bg-ambar-clara text-[#805000]' },
  pago: { rotulo: 'Pago', estilo: 'bg-verde-clara text-[#176b3a]' },
  expirado: { rotulo: 'Expirado', estilo: 'bg-papel-2 text-carvao' },
  cancelado: { rotulo: 'Cancelado', estilo: 'bg-papel-2 text-carvao' },
  devolvido: { rotulo: 'Devolvido', estilo: 'bg-papel-2 text-carvao' },
  erro: { rotulo: 'Erro na cobrança', estilo: 'bg-vermelho-clara text-[#a82a1a]' },
}

function formatarData(valor: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Porto_Velho',
  }).format(new Date(valor))
}

export function PainelPix({ cobrancas, podeGerar }: { cobrancas: CobrancaPix[]; podeGerar: boolean }) {
  const router = useRouter()
  const [valor, definirValor] = useState('')
  const [descricao, definirDescricao] = useState('')
  const [erro, definirErro] = useState('')
  const [erroValor, definirErroValor] = useState('')
  const [gerando, definirGerando] = useState(false)
  const [atualizando, iniciarAtualizacao] = useTransition()
  const [selecionada, definirSelecionada] = useState<CobrancaPix | null>(null)
  const enviando = useRef(false)
  const campoValor = useRef<HTMLInputElement>(null)

  function atualizarLista() {
    iniciarAtualizacao(() => router.refresh())
  }

  async function gerar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current) return
    definirErro('')
    definirErroValor('')
    const numero = interpretarBRL(valor)
    if (numero === null || numero <= 0) {
      definirErroValor('Informe um valor maior que zero.')
      campoValor.current?.focus()
      return
    }
    if (!descricao.trim()) {
      definirErro('Informe uma descrição para identificar a cobrança.')
      return
    }
    enviando.current = true
    definirGerando(true)
    try {
      const resultado = await gerarPixAction({ valor: numero, descricao: descricao.trim(), origem: 'manual' })
      if (!resultado.ok) {
        definirErro(resultado.erro)
        return
      }
      definirSelecionada(resultado.cobranca)
      definirValor('')
      definirDescricao('')
      atualizarLista()
    } catch {
      definirErro(
        'Não foi possível confirmar a criação. Atualize a lista antes de tentar novamente para evitar outra cobrança.',
      )
    } finally {
      enviando.current = false
      definirGerando(false)
    }
  }

  return (
    <div
      className={`grid min-w-0 items-start gap-6 ${podeGerar ? 'xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : ''}`}
    >
      {podeGerar && (
        <section
          aria-labelledby="titulo-gerar-pix"
          className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
        >
          <header className="border-b border-areia bg-papel-2/50 p-5 sm:p-6">
            <p className="text-xs font-bold tracking-[0.16em] text-carvao uppercase">Na hora de receber</p>
            <h2 id="titulo-gerar-pix" className="mt-2 text-2xl font-bold">
              Gerar cobrança Pix
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-carvao">
              Digite o valor e mostre o QR ao cliente.
            </p>
          </header>
          <form
            onSubmit={(evento) => void gerar(evento)}
            className="space-y-5 p-5 sm:p-6"
            aria-busy={gerando}
          >
            <div>
              <label htmlFor="valor-pix" className="text-sm font-semibold text-carvao">
                Valor da cobrança
              </label>
              <div
                className={`mt-2 flex min-h-20 min-w-0 items-center gap-3 rounded-xl border bg-papel px-4 focus-within:ring-2 focus-within:ring-tinta ${erroValor ? 'border-vermelho' : 'border-areia'}`}
              >
                <span aria-hidden="true" className="shrink-0 text-xl font-bold whitespace-nowrap text-carvao">
                  R$
                </span>
                <input
                  ref={campoValor}
                  id="valor-pix"
                  name="valor"
                  value={valor}
                  onChange={(evento) => definirValor(evento.target.value)}
                  inputMode="decimal"
                  autoComplete="off"
                  maxLength={15}
                  placeholder="0,00"
                  disabled={gerando}
                  required
                  aria-invalid={!!erroValor}
                  aria-describedby={erroValor ? 'erro-valor-pix' : 'ajuda-valor-pix'}
                  className="min-h-20 w-full min-w-0 bg-transparent text-4xl font-bold tracking-tight tabular-nums placeholder:text-carvao/60 focus:outline-none"
                />
              </div>
              {erroValor ? (
                <p id="erro-valor-pix" className="mt-2 text-sm text-vermelho">
                  {erroValor}
                </p>
              ) : (
                <p id="ajuda-valor-pix" className="mt-2 text-sm text-carvao">
                  Em reais. Ex.: 25,50
                </p>
              )}
            </div>
            <Campo
              id="descricao-pix"
              name="descricao"
              rotulo="Descrição"
              placeholder="Ex.: Pedido no balcão"
              value={descricao}
              onChange={(evento) => definirDescricao(evento.target.value)}
              maxLength={140}
              required
              disabled={gerando}
            />
            {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
            <Botao
              type="submit"
              cheio
              tamanho="lg"
              carregando={gerando}
              icone={<QrCode aria-hidden="true" className="size-5" />}
            >
              Gerar QR Pix
            </Botao>
            <p className="text-xs leading-relaxed text-carvao">
              O pagamento será confirmado automaticamente nesta tela.
            </p>
          </form>
        </section>
      )}
      <section
        aria-labelledby="titulo-cobrancas-pix"
        className="min-w-0 rounded-xl border border-areia bg-branco"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia p-5">
          <div>
            <h2 id="titulo-cobrancas-pix" className="text-xl font-bold">
              Últimas cobranças
            </h2>
            <p className="mt-1 text-xs text-carvao">Horário de Porto Velho</p>
          </div>
          <Botao
            type="button"
            variante="secundario"
            carregando={atualizando}
            onClick={atualizarLista}
            icone={<RefreshCw aria-hidden="true" className="size-4" />}
          >
            Atualizar
          </Botao>
        </header>
        {cobrancas.length ? (
          <ul className="divide-y divide-areia">
            {cobrancas.map((cobranca) => {
              const estado = ESTADOS[cobranca.estado]
              return (
                <li key={cobranca.id} className="min-w-0 p-5">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 basis-36 text-base font-bold break-words">
                      {cobranca.descricao}
                    </h3>
                    <p className="text-2xl font-bold tabular-nums">{formatarBRL(cobranca.valor)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${estado.estilo}`}>
                      {estado.rotulo}
                    </span>
                    {cobranca.pagoEm ? (
                      <span className="text-xs text-carvao">Pago em {formatarData(cobranca.pagoEm)}</span>
                    ) : cobranca.expiraEm ? (
                      <span className="text-xs text-carvao">Prazo: {formatarData(cobranca.expiraEm)}</span>
                    ) : null}
                  </div>
                  <Botao
                    type="button"
                    variante="secundario"
                    cheio
                    className="mt-4"
                    onClick={() => definirSelecionada(cobranca)}
                    icone={
                      cobranca.estado === 'pendente' ? (
                        <QrCode aria-hidden="true" className="size-4" />
                      ) : (
                        <ArrowUpRight aria-hidden="true" className="size-4" />
                      )
                    }
                  >
                    {cobranca.estado === 'pendente' ? 'Ver QR Pix' : 'Ver cobrança'}
                  </Botao>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="p-6 py-10">
            <Plus aria-hidden="true" className="mb-4 size-7 text-carvao" />
            <p className="text-lg font-bold">Nenhuma cobrança por aqui.</p>
            <p className="mt-2 text-sm leading-relaxed text-carvao">
              {podeGerar
                ? 'Gere o primeiro QR Pix. As cobranças do PDV e de contas a receber também aparecem aqui.'
                : 'Assim que o Pix estiver ligado, suas cobranças aparecerão nesta lista.'}
            </p>
          </div>
        )}
      </section>
      {selecionada && (
        <DialogoOperacao
          titulo="Cobrança Pix"
          fechar={() => {
            definirSelecionada(null)
            atualizarLista()
          }}
        >
          <QrPix
            cobranca={selecionada}
            onAtualizar={(cobranca) => {
              definirSelecionada(cobranca)
              atualizarLista()
            }}
          />
          {selecionada.estado !== 'pendente' && (
            <Botao
              type="button"
              cheio
              variante="secundario"
              className="mt-5"
              onClick={() => definirSelecionada(null)}
            >
              Fechar cobrança
            </Botao>
          )}
        </DialogoOperacao>
      )}
    </div>
  )
}
