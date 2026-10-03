import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarCarteiras, obterTitulo } from '@/lib/dados/financeiro'
import { formatarBRL } from '@/lib/dominio/moeda'
import { CancelarConta, EstornarPagamento } from '../../_components/acoes-conta'
import { FORMAS_PAGAMENTO, formatarDataFinanceira, SeloSituacao } from '../../_components/apresentacao'
import { PagamentoParcela } from '../../_components/pagamento-parcela'

export const metadata: Metadata = { title: 'Detalhe da conta' }

export default async function PaginaDetalheConta({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, tenantId } = await exigirModulo('financeiro')
  const { id } = await params
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Porto_Velho' })
  const [conta, carteiras] = await Promise.all([
    obterTitulo(supabase, tenantId, id, hoje),
    listarCarteiras(supabase, tenantId),
  ])
  if (!conta) notFound()

  const recebendo = conta.tipo === 'receber'
  const total = conta.parcelas.reduce((soma, parcela) => soma + Math.round(parcela.valor * 100), 0) / 100
  const quitado =
    conta.parcelas.reduce((soma, parcela) => soma + Math.round(parcela.valorPago * 100), 0) / 100
  const saldo = conta.cancelado
    ? 0
    : conta.parcelas.reduce((soma, parcela) => soma + Math.round(parcela.saldo * 100), 0) / 100
  const pagamentosAtivos = conta.baixas.filter((baixa) => !baixa.estornada)

  return (
    <div className="min-w-0 space-y-6">
      <Link
        href={`/painel/financeiro/${conta.tipo}`}
        className="inline-flex min-h-12 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-carvao hover:text-tinta"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />{' '}
        {recebendo ? 'Contas a receber' : 'Contas a pagar'}
      </Link>
      <header className="min-w-0 border-b border-areia pb-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <span
            className={`rounded-md px-2.5 py-1.5 text-xs font-bold ${recebendo ? 'bg-verde-clara text-[#17683a]' : 'bg-tinta text-papel'}`}
          >
            {recebendo ? 'A receber' : 'A pagar'}
          </span>
          {conta.cancelado && <SeloSituacao situacao="cancelada" />}
          {!conta.cancelado && saldo === 0 && <SeloSituacao situacao="paga" />}
        </div>
        <h1 className="font-sans text-3xl leading-tight font-bold tracking-tight break-words lg:text-4xl">
          {conta.descricao}
        </h1>
        <p className="mt-3 text-sm break-words text-carvao">
          {conta.pessoa?.nome || (recebendo ? 'Sem cliente vinculado' : 'Sem fornecedor vinculado')} ·{' '}
          {conta.categoria || 'Sem categoria'}
        </p>
      </header>

      {conta.cancelado && (
        <p
          role="status"
          className="rounded-xl border border-areia bg-papel-2 p-4 text-sm leading-relaxed text-carvao"
        >
          Conta cancelada. As parcelas não entram mais nas previsões. Pagamentos registrados continuam nas
          carteiras até serem estornados.
        </p>
      )}

      <dl className="grid min-w-0 gap-3 md:grid-cols-3">
        <div className="min-w-0 rounded-xl bg-tinta p-5 text-papel">
          <dt className="text-sm font-medium text-papel-3">
            {conta.cancelado ? 'Saldo em aberto' : recebendo ? 'Falta receber' : 'Falta pagar'}
          </dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight break-words tabular-nums">
            {formatarBRL(saldo)}
            <span className="mt-3 block text-xs font-normal tracking-normal text-papel-3">
              {conta.cancelado
                ? 'Conta fora da previsão'
                : `${conta.parcelas.length} ${conta.parcelas.length === 1 ? 'parcela no total' : 'parcelas no total'}`}
            </span>
          </dd>
        </div>
        <div className="min-w-0 rounded-xl border border-areia bg-branco p-5">
          <dt className="text-sm font-medium text-carvao">Valor da conta</dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight break-words tabular-nums">
            {formatarBRL(total)}
            <span className="mt-3 block text-xs font-normal tracking-normal text-carvao">
              Sem juros, multa ou desconto
            </span>
          </dd>
        </div>
        <div className="min-w-0 rounded-xl border border-areia bg-branco p-5">
          <dt className="text-sm font-medium text-carvao">Valor quitado</dt>
          <dd className="mt-2 text-3xl font-bold tracking-tight break-words text-[#17683a] tabular-nums">
            {formatarBRL(quitado)}
            <span className="mt-3 block text-xs font-normal tracking-normal text-carvao">
              Pagamentos válidos sobre as parcelas
            </span>
          </dd>
        </div>
      </dl>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <section
            className="overflow-hidden rounded-xl border border-areia bg-branco"
            aria-labelledby="parcelas-titulo"
          >
            <div className="border-b border-areia px-5 py-4">
              <h2 id="parcelas-titulo" className="font-sans text-lg font-bold">
                Parcelas da conta
              </h2>
              <p className="mt-1 text-sm text-carvao">Confira cada vencimento e registre os pagamentos.</p>
            </div>
            <ul className="divide-y divide-areia">
              {conta.parcelas.map((parcela) => (
                <li key={parcela.id} className="min-w-0 space-y-4 p-5">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-sans text-base font-bold">
                        Parcela {parcela.numero} de {conta.parcelas.length}
                      </h3>
                      <p className="mt-1 text-sm text-carvao">
                        Vence em{' '}
                        <time dateTime={parcela.vencimento}>
                          {formatarDataFinanceira(parcela.vencimento)}
                        </time>
                      </p>
                    </div>
                    <SeloSituacao situacao={parcela.situacao} />
                  </div>
                  <dl className="grid min-w-0 grid-cols-2 gap-4 sm:grid-cols-3">
                    <div className="min-w-0">
                      <dt className="text-xs text-carvao">Valor</dt>
                      <dd className="mt-1 text-sm font-semibold break-words tabular-nums">
                        {formatarBRL(parcela.valor)}
                      </dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-xs text-carvao">Quitado</dt>
                      <dd className="mt-1 text-sm font-semibold break-words tabular-nums">
                        {formatarBRL(parcela.valorPago)}
                      </dd>
                    </div>
                    <div className="col-span-2 min-w-0 sm:col-span-1">
                      <dt className="text-xs text-carvao">
                        {parcela.situacao === 'cancelada' ? 'Não quitado (cancelado)' : 'Saldo'}
                      </dt>
                      <dd
                        className={`mt-1 text-xl font-bold break-words tabular-nums ${parcela.situacao === 'vencida' ? 'text-vermelho' : ''}`}
                      >
                        {formatarBRL(parcela.saldo)}
                      </dd>
                    </div>
                  </dl>
                  {!conta.cancelado && parcela.situacao !== 'cancelada' && parcela.saldo > 0 && (
                    <PagamentoParcela
                      parcela={parcela}
                      tipo={conta.tipo}
                      descricao={conta.descricao}
                      carteiras={carteiras}
                      hoje={hoje}
                    />
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section
            className="overflow-hidden rounded-xl border border-areia bg-branco"
            aria-labelledby="historico-titulo"
          >
            <div className="border-b border-areia px-5 py-4">
              <h2 id="historico-titulo" className="font-sans text-lg font-bold">
                Histórico de pagamentos
              </h2>
              <p className="mt-1 text-sm text-carvao">
                Valores que movimentaram as carteiras, com os ajustes.
              </p>
            </div>
            {conta.baixas.length === 0 ? (
              <div className="p-5 py-8">
                <p className="font-semibold">Nenhum pagamento registrado.</p>
                <p className="mt-2 text-sm leading-relaxed text-carvao">
                  Os pagamentos e eventuais estornos aparecerão aqui.
                </p>
              </div>
            ) : (
              <ol className="divide-y divide-areia">
                {[...conta.baixas].reverse().map((baixa) => (
                  <li
                    key={baixa.id}
                    className={`min-w-0 space-y-4 p-5 ${baixa.estornada ? 'bg-papel-2/50' : ''}`}
                  >
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                      <div
                        className={`min-w-0 ${baixa.estornada ? 'line-through decoration-carvao/65' : ''}`}
                      >
                        <p className="text-base font-bold">Parcela {baixa.parcelaNumero}</p>
                        <p className="mt-1 text-sm text-carvao">
                          <time dateTime={baixa.data}>{formatarDataFinanceira(baixa.data)}</time> ·{' '}
                          {FORMAS_PAGAMENTO.find((forma) => forma.valor === baixa.forma)?.rotulo ??
                            'Outra forma'}
                        </p>
                        <p className="mt-1 text-sm break-words text-carvao">
                          {baixa.carteira || 'Carteira não informada'}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xl font-bold break-words tabular-nums ${baixa.estornada ? 'text-carvao line-through' : recebendo ? 'text-[#17683a]' : 'text-tinta'}`}
                        >
                          {formatarBRL(baixa.movimentado)}
                        </p>
                        <p className="mt-1 text-xs text-carvao">
                          {baixa.estornada
                            ? 'Estornado'
                            : recebendo
                              ? 'Entrou na carteira'
                              : 'Saiu da carteira'}
                        </p>
                      </div>
                    </div>
                    {baixa.movimentado !== baixa.valor && (
                      <p className={`text-xs text-carvao ${baixa.estornada ? 'line-through' : ''}`}>
                        {formatarBRL(baixa.valor)} quitados da parcela; diferença referente aos ajustes.
                      </p>
                    )}
                    {!baixa.estornada && (
                      <EstornarPagamento
                        baixaId={baixa.id}
                        valor={baixa.movimentado}
                        carteira={baixa.carteira}
                        contaCancelada={conta.cancelado}
                      />
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-6" aria-label="Informações da conta">
          <section
            className="rounded-xl border border-areia bg-branco p-5"
            aria-labelledby="dados-conta-titulo"
          >
            <h2 id="dados-conta-titulo" className="font-sans text-lg font-bold">
              Dados da conta
            </h2>
            <dl className="mt-4 space-y-4">
              {[
                [recebendo ? 'Cliente' : 'Fornecedor', conta.pessoa?.nome ?? 'Não vinculado'],
                ['Categoria', conta.categoria || 'Não informada'],
                ['Competência', formatarDataFinanceira(conta.competencia)],
                ['Documento', conta.documento || 'Não informado'],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="min-w-0">
                  <dt className="text-xs text-carvao">{rotulo}</dt>
                  <dd className="mt-1 text-sm font-semibold break-words">{valor}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section
            className="rounded-xl border border-areia bg-papel-2 p-5"
            aria-labelledby="observacoes-conta-titulo"
          >
            <h2 id="observacoes-conta-titulo" className="font-sans text-lg font-bold">
              Observações
            </h2>
            <p className="mt-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-carvao">
              {conta.observacoes || 'Nenhuma observação registrada.'}
            </p>
          </section>
          {!conta.cancelado && (
            <CancelarConta tituloId={conta.id} temPagamentos={pagamentosAtivos.length > 0} />
          )}
        </aside>
      </div>
    </div>
  )
}
