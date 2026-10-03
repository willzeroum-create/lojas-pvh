import { ArrowRight, Plus, ReceiptText } from 'lucide-react'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarCarteiras, listarParcelas, type Carteira, type ParcelaLista } from '@/lib/dados/financeiro'
import type { TipoTitulo } from '@/lib/dominio/financeiro'
import { formatarBRL } from '@/lib/dominio/moeda'
import { esquemaFiltroParcelas, type FiltroParcelas } from '@/lib/validacao/financeiro'
import { validar } from '@/lib/validacao/zod'
import {
  ESTILO_BOTAO,
  ESTILO_CAMPO,
  ESTILO_PRIMARIO,
  formatarDataFinanceira,
  SeloSituacao,
} from './apresentacao'
import { PagamentoParcela } from './pagamento-parcela'
import { BotaoCobrarParcelaPix, CobrancasParcelasPix } from './cobrar-parcela-pix'

const SITUACOES = [
  { valor: 'abertas', rotulo: 'Em aberto' },
  { valor: 'vencidas', rotulo: 'Vencidas' },
  { valor: 'pagas', rotulo: 'Pagas' },
  { valor: 'todas', rotulo: 'Todas' },
] as const

const ESTILO_BOTAO_ESCURO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tinta px-4 py-3 text-sm font-bold text-papel transition-colors hover:bg-carvao'

function enderecoDaLista(filtro: FiltroParcelas) {
  const parametros = new URLSearchParams()
  if (filtro.situacao !== 'abertas') parametros.set('situacao', filtro.situacao)
  if (filtro.de) parametros.set('de', filtro.de)
  if (filtro.ate) parametros.set('ate', filtro.ate)
  const consulta = parametros.toString()
  return `/painel/financeiro/${filtro.tipo}${consulta ? `?${consulta}` : ''}`
}

function estaEmAberto(parcela: ParcelaLista) {
  return parcela.situacao !== 'paga' && parcela.situacao !== 'cancelada' && parcela.saldo > 0
}

function somarValores(parcelas: ParcelaLista[], campo: 'valor' | 'saldo' | 'valorPago') {
  return parcelas.reduce((total, parcela) => total + Math.round(parcela[campo] * 100), 0) / 100
}

export async function ListaParcelas({
  tipo,
  parametros,
}: {
  tipo: TipoTitulo
  parametros: Record<string, string | string[] | undefined>
}) {
  const { supabase, tenantId, modulos } = await exigirModulo('financeiro')
  const pixAtivo = tipo === 'receber' && modulos.has('bancos')
  const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Porto_Velho' })
  const validacao = validar(esquemaFiltroParcelas, { ...parametros, tipo })
  const filtro: FiltroParcelas = validacao.ok ? validacao.dados : { tipo, situacao: 'abertas' }
  const errosFiltro: Record<string, string> = validacao.ok ? {} : { ...validacao.porCampo }
  if (filtro.de && filtro.ate && filtro.de > filtro.ate) {
    errosFiltro.ate = 'A data final deve ser igual ou posterior à data inicial.'
  }
  const filtroInvalido = !validacao.ok || Object.keys(errosFiltro).length > 0
  const rota = `/painel/financeiro/${tipo}`
  const novaConta = `/painel/financeiro/contas/nova?tipo=${tipo}`
  const receber = tipo === 'receber'
  const filtrado = filtro.situacao !== 'abertas' || Boolean(filtro.de || filtro.ate)
  let parcelas: ParcelaLista[] = []
  let carteiras: Carteira[] = []
  let erroDados = false

  if (!filtroInvalido) {
    try {
      const [parcelasEncontradas, carteirasEncontradas] = await Promise.all([
        listarParcelas(supabase, tenantId, filtro, hoje),
        listarCarteiras(supabase, tenantId),
      ])
      parcelas = parcelasEncontradas
      carteiras = carteirasEncontradas
    } catch {
      erroDados = true
    }
  }

  const abertas = parcelas.filter(estaEmAberto)
  const vencidas = abertas.filter((parcela) => parcela.situacao === 'vencida')
  const vencemHoje = abertas.filter((parcela) => parcela.vencimento === hoje)
  const totalOriginal = somarValores(parcelas, 'valor')
  const totalAberto = somarValores(abertas, 'saldo')
  const totalVencido = somarValores(vencidas, 'saldo')
  const limiteAtingido = parcelas.length === 500
  const numero = new Intl.NumberFormat('pt-BR')
  const valorDe = typeof parametros.de === 'string' ? parametros.de : ''
  const valorAte = typeof parametros.ate === 'string' ? parametros.ate : ''
  const situacaoSelecionada =
    SITUACOES.find((situacao) => situacao.valor === parametros.situacao)?.valor ?? 'abertas'

  return (
    <CobrancasParcelasPix>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seu negócio / Financeiro
          </p>
          <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
            {receber ? 'Contas a receber' : 'Contas a pagar'}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
            {receber
              ? 'Acompanhe os vencimentos e registre o que entrou.'
              : 'Organize os vencimentos e registre o que saiu.'}
          </p>
        </div>
        <Link href={novaConta} className={`${ESTILO_PRIMARIO} w-full min-[440px]:w-auto`}>
          <Plus aria-hidden="true" className="size-5 shrink-0" />
          Nova conta a {tipo}
        </Link>
      </header>

      <section aria-label="Filtrar parcelas" className="space-y-4">
        <nav
          aria-label="Situação das parcelas"
          className="grid grid-cols-2 gap-1 rounded-lg border border-areia bg-papel-2 p-1 min-[440px]:grid-cols-4"
        >
          {SITUACOES.map((situacao) => (
            <Link
              key={situacao.valor}
              href={enderecoDaLista({ ...filtro, situacao: situacao.valor })}
              aria-current={
                !errosFiltro.situacao && situacaoSelecionada === situacao.valor ? 'page' : undefined
              }
              className={`inline-flex min-h-12 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors ${!errosFiltro.situacao && situacaoSelecionada === situacao.valor ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3'}`}
            >
              {situacao.valor === 'pagas' && receber ? 'Recebidas' : situacao.rotulo}
            </Link>
          ))}
        </nav>
        {errosFiltro.situacao && (
          <p role="alert" className="text-sm font-semibold text-vermelho">
            Escolha uma das situações acima para corrigir este filtro.
          </p>
        )}

        <form
          key={`${situacaoSelecionada}-${valorDe}-${valorAte}`}
          action={rota}
          method="get"
          className="grid min-w-0 gap-3 min-[540px]:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] lg:items-start"
        >
          <input type="hidden" name="situacao" value={situacaoSelecionada} />
          <div className="min-w-0">
            <label htmlFor="vencimento-de" className="mb-1.5 block text-sm font-semibold">
              Vencimento a partir de
            </label>
            <input
              id="vencimento-de"
              name="de"
              type="date"
              defaultValue={valorDe}
              aria-invalid={Boolean(errosFiltro.de)}
              aria-describedby={errosFiltro.de ? 'erro-vencimento-de' : undefined}
              className={ESTILO_CAMPO}
            />
            {errosFiltro.de && (
              <p id="erro-vencimento-de" className="mt-1.5 text-sm text-vermelho">
                Informe uma data inicial válida.
              </p>
            )}
          </div>
          <div className="min-w-0">
            <label htmlFor="vencimento-ate" className="mb-1.5 block text-sm font-semibold">
              Vencimento até
            </label>
            <input
              id="vencimento-ate"
              name="ate"
              type="date"
              defaultValue={valorAte}
              aria-invalid={Boolean(errosFiltro.ate)}
              aria-describedby={errosFiltro.ate ? 'erro-vencimento-ate' : undefined}
              className={ESTILO_CAMPO}
            />
            {errosFiltro.ate && (
              <p id="erro-vencimento-ate" className="mt-1.5 text-sm text-vermelho">
                {validacao.ok ? errosFiltro.ate : 'Informe uma data final válida.'}
              </p>
            )}
          </div>
          <button type="submit" className={`${ESTILO_BOTAO_ESCURO} lg:mt-6.5`}>
            Aplicar período
          </button>
          <Link href={rota} className={`${ESTILO_BOTAO} underline underline-offset-4 lg:mt-6.5`}>
            Limpar filtros
          </Link>
        </form>
        <p className="text-xs leading-relaxed text-carvao">
          O período considera a data de vencimento, inclusive nas parcelas já{' '}
          {receber ? 'recebidas' : 'pagas'}.
        </p>
      </section>

      {filtroInvalido ? (
        <section role="alert" className="rounded-xl border border-vermelho/30 bg-branco p-5">
          <h2 className="text-lg font-bold">Revise os filtros para ver as parcelas</h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            Corrija os campos indicados acima e aplique o período novamente.
          </p>
        </section>
      ) : erroDados ? (
        <section role="alert" className="rounded-xl border border-vermelho/30 bg-branco p-5">
          <h2 className="text-lg font-bold">Não foi possível carregar as contas</h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            Os valores estão indisponíveis no momento. Tente aplicar os filtros novamente em instantes.
          </p>
        </section>
      ) : (
        <>
          {limiteAtingido && (
            <p
              role="status"
              className="rounded-lg border border-ambar/40 bg-ambar-clara p-4 text-sm leading-relaxed text-carvao"
            >
              A lista chegou ao limite de 500 parcelas. Os totais abaixo consideram somente as parcelas
              exibidas. Reduza o período para conferir todos os valores.
            </p>
          )}

          <section aria-label="Totais das parcelas exibidas" className="grid min-w-0 gap-3 md:grid-cols-3">
            <div className="min-w-0 rounded-xl border border-areia bg-branco p-5">
              <p className="text-sm font-semibold text-carvao">
                {filtro.situacao === 'pagas'
                  ? `Total ${receber ? 'recebido' : 'pago'} neste filtro`
                  : `Saldo a ${tipo} neste filtro`}
              </p>
              <p
                className={`mt-3 text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold tracking-tight break-words tabular-nums ${receber ? 'text-[#176b3a]' : 'text-tinta'}`}
              >
                {formatarBRL(filtro.situacao === 'pagas' ? somarValores(parcelas, 'valorPago') : totalAberto)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-carvao">
                {filtro.situacao === 'pagas'
                  ? 'Valor principal, sem juros, multa ou desconto.'
                  : 'Somente parcelas em aberto; canceladas não entram.'}
              </p>
            </div>
            <div
              className={`min-w-0 rounded-xl border p-5 ${totalVencido > 0 ? 'border-vermelho/30 bg-vermelho-clara/40' : 'border-areia bg-branco'}`}
            >
              <p className="text-sm font-semibold text-carvao">Vencido neste filtro</p>
              <p
                className={`mt-3 text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold tracking-tight break-words tabular-nums ${totalVencido > 0 ? 'text-vermelho' : 'text-tinta'}`}
              >
                {formatarBRL(totalVencido)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-carvao">
                {vencidas.length} {vencidas.length === 1 ? 'parcela em atraso' : 'parcelas em atraso'}.
              </p>
            </div>
            <div className="min-w-0 rounded-xl border border-areia bg-branco p-5">
              <p className="text-sm font-semibold text-carvao">Vence hoje neste filtro</p>
              <p className="mt-3 text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold tracking-tight break-words text-tinta tabular-nums">
                {formatarBRL(somarValores(vencemHoje, 'saldo'))}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-carvao">
                {formatarDataFinanceira(hoje)} · Horário de Porto Velho.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="titulo-parcelas"
            className="overflow-hidden rounded-xl border border-areia bg-branco"
          >
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia bg-papel-2/60 px-4 py-4 lg:px-6">
              <h2
                id="titulo-parcelas"
                className="flex items-baseline gap-2 font-semibold"
                role="status"
                aria-atomic="true"
              >
                <span className="text-2xl font-bold tabular-nums">{numero.format(parcelas.length)}</span>
                <span className="text-sm text-carvao">
                  {parcelas.length === 1 ? 'parcela' : 'parcelas'} {limiteAtingido ? 'exibidas' : 'no filtro'}
                </span>
              </h2>
              <p className="text-xs text-carvao">Vencimentos mais antigos primeiro</p>
            </header>

            {parcelas.length === 0 ? (
              <div className="flex flex-col items-start px-5 py-10 sm:px-8 sm:py-14">
                <ReceiptText aria-hidden="true" className="mb-5 size-9 text-carvao" strokeWidth={1.5} />
                <h3 className="text-xl font-bold">
                  {filtrado ? 'Nenhuma parcela neste filtro' : `Nenhuma conta em aberto a ${tipo}`}
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
                  {filtrado
                    ? 'Altere a situação ou o período de vencimento para consultar outras parcelas.'
                    : `Cadastre uma conta a ${tipo} para acompanhar vencimentos e ${receber ? 'recebimentos' : 'pagamentos'} por aqui.`}
                </p>
                <Link href={filtrado ? rota : novaConta} className={`${ESTILO_BOTAO_ESCURO} mt-6`}>
                  {filtrado ? 'Ver contas em aberto' : `Nova conta a ${tipo}`}
                  <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
                </Link>
              </div>
            ) : (
              <>
                <div
                  aria-hidden="true"
                  className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-5 border-b border-areia px-6 py-3 text-xs font-bold tracking-wide text-carvao uppercase xl:grid"
                >
                  <span>Conta e parcela</span>
                  <span>Vencimento</span>
                  <span>Valores</span>
                  <span className={pixAtivo ? 'w-40' : 'w-28'}>Ação</span>
                </div>
                <ul className="divide-y divide-areia">
                  {parcelas.map((parcela) => {
                    const aberta = estaEmAberto(parcela)
                    const cancelada = parcela.situacao === 'cancelada'
                    return (
                      <li
                        key={parcela.id}
                        className="grid min-w-0 gap-x-5 gap-y-4 px-4 py-5 transition-colors hover:bg-papel/70 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center xl:px-6"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/painel/financeiro/contas/${parcela.tituloId}`}
                            className="group flex min-h-12 items-center gap-3 rounded-md py-1"
                          >
                            <span className="min-w-0">
                              <span
                                className={`block text-base leading-snug font-bold break-words group-hover:underline group-hover:underline-offset-4 ${cancelada ? 'text-carvao line-through' : ''}`}
                              >
                                {parcela.descricao}
                              </span>
                              <span className="mt-1 block text-sm break-words text-carvao">
                                {parcela.pessoa ??
                                  (receber ? 'Sem cliente vinculado' : 'Sem fornecedor vinculado')}
                              </span>
                            </span>
                          </Link>
                          <p className="mt-1 text-xs leading-relaxed break-words text-carvao">
                            Parcela {parcela.numero}/{parcela.totalParcelas}
                            {parcela.categoria ? ` · ${parcela.categoria}` : ''}
                          </p>
                        </div>
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 xl:flex-col xl:items-start">
                          <p className="text-sm font-semibold tabular-nums">
                            <span className="mr-1 text-xs font-normal text-carvao xl:sr-only">
                              Vencimento
                            </span>
                            <time dateTime={parcela.vencimento}>
                              {formatarDataFinanceira(parcela.vencimento)}
                            </time>
                          </p>
                          <SeloSituacao situacao={parcela.situacao} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-carvao">
                            {aberta
                              ? `Falta ${tipo}`
                              : cancelada
                                ? 'Valor cancelado'
                                : receber
                                  ? 'Valor recebido'
                                  : 'Valor pago'}
                          </p>
                          <p
                            className={`mt-1 text-xl leading-tight font-bold break-words tabular-nums ${parcela.situacao === 'vencida' ? 'text-vermelho' : cancelada ? 'text-carvao line-through' : receber ? 'text-[#176b3a]' : 'text-tinta'}`}
                          >
                            {formatarBRL(
                              aberta ? parcela.saldo : cancelada ? parcela.valor : parcela.valorPago,
                            )}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed break-words text-carvao">
                            Valor original: {formatarBRL(parcela.valor)}
                          </p>
                          {aberta && parcela.valorPago > 0 && (
                            <p className="mt-1 text-xs leading-relaxed text-carvao">
                              {formatarBRL(parcela.valorPago)} já {receber ? 'recebidos' : 'pagos'}.
                            </p>
                          )}
                        </div>
                        <div className={`min-w-0 space-y-2 ${pixAtivo ? 'xl:w-40' : 'xl:w-28'}`}>
                          {aberta ? (
                            <PagamentoParcela
                              parcela={parcela}
                              tipo={tipo}
                              descricao={parcela.descricao}
                              carteiras={carteiras}
                              hoje={hoje}
                            />
                          ) : (
                            <Link
                              href={`/painel/financeiro/contas/${parcela.tituloId}`}
                              className={`${ESTILO_BOTAO} w-full`}
                            >
                              Ver conta
                            </Link>
                          )}
                          {aberta && pixAtivo && <BotaoCobrarParcelaPix parcela={parcela} />}
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <footer className="border-t border-areia bg-papel-2/60 px-4 py-4 text-xs leading-relaxed text-carvao lg:px-6">
                  Valor original das parcelas exibidas:{' '}
                  <strong className="font-semibold tabular-nums">{formatarBRL(totalOriginal)}</strong>.{' '}
                  {filtro.situacao === 'todas'
                    ? 'Inclui parcelas pagas e canceladas; o saldo em aberto está separado acima.'
                    : 'Os valores da lista são de principal, sem juros, multa ou desconto.'}
                </footer>
              </>
            )}
          </section>
        </>
      )}
    </CobrancasParcelasPix>
  )
}
