'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search } from 'lucide-react'
import type { ClienteComCashback } from '@/lib/dados/fidelidade'
import type { ConfigCashback } from '@/lib/dominio/fidelidade'
import { formatarBRL } from '@/lib/dominio/moeda'
import { ConfiguracaoCashback } from './configuracao-cashback'
import { DialogoExtrato } from './dialogo-extrato'

const dataCompra = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Porto_Velho',
})
const BOTAO_LINK =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 text-sm font-bold hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta'

export function PainelFidelidade({
  config,
  clientes,
  podeConfigurar,
  podeVerCadastros,
  clienteInicial,
}: {
  config: ConfigCashback
  clientes: ClienteComCashback[]
  podeConfigurar: boolean
  podeVerCadastros: boolean
  clienteInicial: string | null
}) {
  const router = useRouter()
  const [busca, definirBusca] = useState('')
  const [soVencendo, definirSoVencendo] = useState(false)
  const [cliente, definirCliente] = useState<string | null>(clienteInicial)
  const vencendo = clientes.filter((pessoa) => pessoa.aVencer30 > 0)
  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
  const visiveis = clientes.filter(
    (pessoa) =>
      (!soVencendo || pessoa.aVencer30 > 0) && normalizar(pessoa.nome).includes(normalizar(busca.trim())),
  )

  function fecharExtrato() {
    definirCliente(null)
    if (clienteInicial) router.replace('/painel/fidelidade', { scroll: false })
  }

  return (
    <div className="fidelidade-area min-w-0 space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seus clientes / Fidelidade
          </p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
            Cashback que traz de volta.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-carvao">
            Consulte os saldos e veja quem tem crédito perto de vencer.
          </p>
        </div>
        <span
          role="status"
          className={`rounded-lg px-4 py-3 text-sm font-bold ${config.ativo ? 'bg-verde-clara text-[#176b3a]' : 'bg-papel-3 text-carvao'}`}
        >
          {config.ativo ? 'Programa ativo' : 'Programa pausado'}
        </span>
      </header>

      <section aria-label="Regras atuais do cashback" className="rounded-xl bg-tinta p-5 text-papel sm:p-6">
        <p className="text-sm text-papel-3">
          {config.ativo ? 'A cada compra identificada' : 'Regras salvas · programa pausado'}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">
          {new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(config.percentual)}%{' '}
          <span className="text-xl font-medium">de volta</span>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-papel-3">
          Validade de {config.validadeDias} dias · use a partir de {formatarBRL(config.resgateMinimo)} de
          saldo · até {config.limiteResgatePct}% da compra.
        </p>
        {!config.ativo && (
          <p className="mt-3 text-sm font-semibold">
            Novas compras não geram cashback e os resgates ficam pausados.
          </p>
        )}
      </section>

      <div
        className={`grid min-w-0 items-start gap-6 ${podeConfigurar ? 'xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]' : ''}`}
      >
        <section aria-labelledby="clientes-cashback" className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="clientes-cashback" className="text-xl font-bold">
                Clientes com saldo
              </h2>
              <p className="mt-1 text-sm text-carvao">
                {clientes.length}
                {clientes.length === 100
                  ? ' maiores saldos'
                  : clientes.length === 1
                    ? ' cliente'
                    : ' clientes'}
                . Toque para abrir o extrato.
              </p>
            </div>
            {podeVerCadastros && (
              <Link href="/painel/clientes" className={BOTAO_LINK}>
                Cadastros <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            )}
          </div>

          {vencendo.length > 0 && (
            <div className="rounded-xl border border-ambar/40 bg-ambar-clara p-4 text-[#754b0b]">
              <p className="font-bold">
                {vencendo.length} {vencendo.length === 1 ? 'cliente tem' : 'clientes têm'} saldo a vencer em
                30 dias.
              </p>
              <p className="mt-1 text-sm leading-relaxed">Uma boa hora para lembrar da próxima visita.</p>
            </div>
          )}

          {clientes.length > 0 ? (
            <>
              <label className="block text-sm font-semibold">
                Buscar nesta lista
                <span className="relative mt-2 block">
                  <Search
                    className="pointer-events-none absolute top-4 left-3 size-5 text-carvao"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={busca}
                    onChange={(evento) => definirBusca(evento.target.value)}
                    placeholder="Nome do cliente"
                    className="min-h-13 w-full min-w-0 rounded-lg border border-areia bg-branco pr-3 pl-10 text-base font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
                  />
                </span>
              </label>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={soVencendo}
                  onChange={(evento) => definirSoVencendo(evento.target.checked)}
                  className="size-5 accent-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
                />
                Só saldo a vencer em 30 dias
              </label>
              <p className="sr-only" aria-live="polite">
                {visiveis.length} clientes na lista.
              </p>
              {visiveis.length > 0 ? (
                <ul className="divide-y divide-areia overflow-hidden rounded-xl border border-areia bg-branco">
                  {visiveis.map((pessoa) => (
                    <li key={pessoa.id}>
                      <button
                        type="button"
                        onClick={() => definirCliente(pessoa.id)}
                        aria-label={`Ver extrato de ${pessoa.nome}, saldo ${formatarBRL(pessoa.saldo)}`}
                        className="flex min-h-24 w-full min-w-0 items-center gap-3 p-4 text-left hover:bg-papel-2 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-tinta sm:p-5"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-lg font-bold break-words">{pessoa.nome}</span>
                          <span className="mt-1 block text-sm text-carvao">
                            {pessoa.ultimaCompra
                              ? `Última compra: ${dataCompra.format(new Date(pessoa.ultimaCompra))}`
                              : 'Sem compra registrada'}
                          </span>
                          <span className="mt-3 block text-2xl font-bold tracking-tight tabular-nums">
                            {formatarBRL(pessoa.saldo)}
                          </span>
                          {pessoa.aVencer30 > 0 && (
                            <span className="mt-2 inline-block rounded-md bg-ambar-clara px-2 py-1 text-sm font-semibold text-[#754b0b]">
                              {formatarBRL(pessoa.aVencer30)} vencem em até 30 dias
                            </span>
                          )}
                        </span>
                        <ArrowRight aria-hidden="true" className="size-5 shrink-0 text-carvao" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-areia bg-branco p-6">
                  <p className="font-bold">Nenhum cliente neste filtro.</p>
                  <p className="mt-2 text-sm text-carvao">
                    Tente outro nome ou desmarque o filtro de vencimento.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-areia bg-branco p-6">
              <p className="text-lg font-bold">O primeiro saldo começa na próxima compra.</p>
              <p className="mt-2 text-sm leading-relaxed text-carvao">
                Com o programa ativo, escolha um cliente cadastrado no PDV. O cashback aparece aqui depois da
                compra concluída.
              </p>
              {podeVerCadastros && (
                <p className="mt-3 text-sm leading-relaxed text-carvao">
                  Para consultar ou ajustar um cliente sem saldo, abra o cashback na ficha dele em Cadastros.
                </p>
              )}
            </div>
          )}
        </section>
        {podeConfigurar && <ConfiguracaoCashback config={config} />}
      </div>
      {cliente && (
        <DialogoExtrato
          key={cliente}
          pessoaId={cliente}
          fechar={fecharExtrato}
          podeVerCadastro={podeVerCadastros}
        />
      )}
    </div>
  )
}
