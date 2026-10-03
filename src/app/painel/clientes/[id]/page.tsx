import { ArrowLeft, ArrowUpRight, MessageCircle, Pencil, TriangleAlert } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import { obterFichaPessoa } from '@/lib/dados/clientes'
import { formatarDocumento } from '@/lib/dominio/documento'
import { formatarBRL } from '@/lib/dominio/moeda'
import { formatarTelefone, normalizarWhatsapp } from '@/lib/dominio/telefone'
import type { CanalPedido, ConsentimentoLinha, PedidoStatus } from '@/lib/supabase/tipos'
import { AnonimizarPessoa } from '../_components/anonimizar-pessoa'

export const metadata: Metadata = { title: 'Ficha do cadastro' }

const ESTADOS: Record<PedidoStatus, { rotulo: string; classe: string }> = {
  novo: { rotulo: 'Novo', classe: 'bg-ambar-clara text-[#805008]' },
  aceite: { rotulo: 'Em preparo', classe: 'bg-papel-3 text-carvao' },
  pronto: { rotulo: 'Pronto', classe: 'bg-verde-clara text-[#17683a]' },
  concluido: { rotulo: 'Concluído', classe: 'bg-verde-clara text-[#17683a]' },
  cancelado: { rotulo: 'Cancelado', classe: 'bg-vermelho-clara text-vermelho' },
}

const CANAIS: Record<CanalPedido, string> = {
  cardapio: 'Cardápio',
  whatsapp: 'WhatsApp',
  balcao: 'Balcão',
  ifood: 'iFood',
  '99food': '99Food',
  mesa: 'Mesa',
}

const FINALIDADES: Record<ConsentimentoLinha['finalidade'], string> = {
  marketing: 'Promoções pelo WhatsApp',
  pedidos: 'Comunicações sobre pedidos',
  aniversario: 'Mensagens de aniversário',
}

const ORIGENS_CONSENTIMENTO: Record<ConsentimentoLinha['origem'], string> = {
  cardapio: 'cardápio',
  balcao: 'balcão',
  painel: 'painel',
  importacao: 'importação',
}

const dataCompleta = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Porto_Velho',
})
const dataPedido = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Porto_Velho',
})
const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

export default async function PaginaFichaPessoa({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, tenantId } = await exigirModulo('clientes')
  const { id } = await params
  const ficha = await obterFichaPessoa(supabase, tenantId, id)
  if (!ficha) notFound()

  const { pessoa, compras, ultimosPedidos, enderecos, consentimentos } = ficha
  const whatsapp = pessoa.whatsapp ? normalizarWhatsapp(pessoa.whatsapp) : null
  const dias = compras.diasSemComprar
  const intervalo = compras.intervaloMedioDias
  const semCompras = compras.quantidade === 0
  const anonimizado = Boolean(pessoa.anonimizado_em)

  return (
    <div className="clientes-area mx-auto max-w-6xl space-y-6 pb-2">
      <Link
        href="/painel/clientes"
        className="inline-flex min-h-12 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-carvao hover:text-tinta"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Clientes e fornecedores
      </Link>

      <header className="flex flex-col gap-5 border-b border-areia pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold">
            {pessoa.e_cliente && (
              <span className="rounded-md bg-tinta px-2.5 py-1.5 text-papel">Cliente</span>
            )}
            {pessoa.e_fornecedor && (
              <span className="rounded-md border border-areia bg-papel-2 px-2.5 py-1.5">Fornecedor</span>
            )}
            {pessoa.origem === 'pedido' && (
              <span className="rounded-md bg-tangerina-clara px-2.5 py-1.5 text-[#9a320c]">
                Veio pelo cardápio
              </span>
            )}
          </div>
          <h1 className="font-sans text-3xl leading-tight font-bold tracking-tight break-words lg:text-4xl">
            {pessoa.nome}
          </h1>
          {pessoa.nome_fantasia && (
            <p className="mt-1 text-lg break-words text-carvao">{pessoa.nome_fantasia}</p>
          )}
          <p className="mt-3 text-sm text-carvao">
            {pessoa.documento
              ? `${pessoa.tipo === 'pj' ? 'CNPJ' : 'CPF'} ${formatarDocumento(pessoa.documento)}`
              : 'CPF/CNPJ não informado'}
          </p>
          {pessoa.etiquetas.length > 0 && (
            <ul aria-label="Etiquetas" className="mt-3 flex flex-wrap gap-2">
              {pessoa.etiquetas.map((etiqueta) => (
                <li
                  key={etiqueta}
                  className="max-w-full rounded-md border border-areia px-2.5 py-1 text-xs font-medium break-words text-carvao"
                >
                  {etiqueta}
                </li>
              ))}
            </ul>
          )}
        </div>
        {!anonimizado && (
          <div className="flex flex-wrap items-center gap-2 lg:max-w-[20rem] lg:justify-end">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Abrir conversa com ${pessoa.nome} no WhatsApp (nova aba)`}
                className="inline-flex min-h-12 grow items-center justify-center gap-2 rounded-lg bg-tangerina px-4 py-3 text-sm font-bold text-tinta hover:bg-[#e84910] lg:grow-0"
              >
                <MessageCircle className="size-5 shrink-0" aria-hidden="true" /> Abrir conversa{' '}
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </a>
            )}
            <Link
              href={`/painel/clientes/${id}/editar`}
              className="inline-flex min-h-12 grow items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold hover:bg-papel-2 lg:grow-0"
            >
              <Pencil className="size-4" aria-hidden="true" /> Editar
            </Link>
          </div>
        )}
      </header>

      {anonimizado && (
        <p
          role="status"
          className="rounded-lg border border-areia bg-papel-2 p-4 text-sm leading-relaxed text-carvao"
        >
          Os dados pessoais deste cadastro foram anonimizados. Os pedidos e valores foram preservados.
        </p>
      )}

      <section aria-labelledby="compras-titulo" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="compras-titulo" className="font-sans text-lg font-bold">
            Relacionamento em números
          </h2>
          <p className="text-xs text-carvao">Pedidos cancelados não entram nos totais</p>
        </div>
        <dl className="grid grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] gap-3 lg:grid-cols-[1.3fr_1fr_1fr]">
          <div className="col-span-2 min-w-0 rounded-xl bg-tinta p-5 text-papel lg:col-span-1 lg:p-6">
            <dt className="text-sm font-medium text-papel-3">Total gasto</dt>
            <dd className="mt-2 text-3xl font-bold tracking-tight break-words tabular-nums lg:text-4xl">
              {formatarBRL(compras.totalGasto)}
              <span className="mt-3 block text-xs font-normal tracking-normal text-papel-3">
                {compras.primeiraCompra
                  ? `Cliente desde ${dataCompleta.format(new Date(compras.primeiraCompra))}`
                  : 'Ainda sem compras registradas'}
              </span>
            </dd>
          </div>
          <div className="min-w-0 rounded-xl border border-areia bg-branco p-4 lg:p-6">
            <dt className="text-sm font-medium text-carvao">Pedidos</dt>
            <dd className="mt-2 text-3xl font-bold tracking-tight break-words tabular-nums lg:text-4xl">
              {numero.format(compras.quantidade)}
              <span className="mt-3 block text-xs font-normal tracking-normal text-carvao">No histórico</span>
            </dd>
          </div>
          <div className="min-w-0 rounded-xl border border-areia bg-branco p-4 lg:p-6">
            <dt className="text-sm font-medium text-carvao">Ticket médio</dt>
            <dd className="mt-2 text-2xl leading-tight font-bold tracking-tight break-words tabular-nums lg:text-3xl">
              {formatarBRL(compras.ticketMedio)}
              <span className="mt-3 block text-xs font-normal tracking-normal text-carvao">Por pedido</span>
            </dd>
          </div>
        </dl>
        <dl className="grid gap-4 rounded-xl border border-areia bg-papel-2 p-5 md:grid-cols-2 md:gap-6">
          <div className="min-w-0">
            <dt className="text-sm text-carvao">Última compra</dt>
            <dd className="mt-1 text-xl font-bold">
              {dias === null
                ? 'Ainda não comprou'
                : dias === 0
                  ? 'Hoje'
                  : dias === 1
                    ? 'Há 1 dia'
                    : `Há ${numero.format(dias)} dias`}
              {compras.ultimaCompra && (
                <span className="mt-1 block text-xs font-normal text-carvao">
                  {dataCompleta.format(new Date(compras.ultimaCompra))}
                </span>
              )}
            </dd>
          </div>
          <div className="min-w-0 border-t border-areia pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <dt className="text-sm text-carvao">Frequência</dt>
            <dd className="mt-1 text-xl font-bold">
              {intervalo === null
                ? 'Em formação'
                : intervalo < 1
                  ? 'Compra mais de uma vez ao dia'
                  : `Compra a cada ${numero.format(intervalo)} ${intervalo === 1 ? 'dia' : 'dias'}`}
              <span className="mt-1 block text-xs font-normal text-carvao">
                {intervalo === null
                  ? 'Disponível a partir de 2 compras.'
                  : 'Média de tempo entre as compras.'}
              </span>
            </dd>
          </div>
        </dl>
        {compras.sumido && (
          <div className="flex items-start gap-3 rounded-xl border border-ambar/40 bg-ambar-clara p-4 text-[#754b0b]">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Sumido</p>
              <p className="mt-1 text-sm leading-relaxed">
                Já passou do intervalo habitual de compra. Confira o consentimento abaixo antes de enviar uma
                promoção.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <section
            aria-labelledby="pedidos-titulo"
            className="overflow-hidden rounded-xl border border-areia bg-branco"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-areia px-5 py-4">
              <h2 id="pedidos-titulo" className="font-sans text-lg font-bold">
                Últimos pedidos
              </h2>
              <span className="text-xs text-carvao">
                {ultimosPedidos.length === 10
                  ? '10 mais recentes'
                  : `${ultimosPedidos.length} ${ultimosPedidos.length === 1 ? 'pedido' : 'pedidos'}`}
              </span>
            </div>
            {ultimosPedidos.length === 0 ? (
              <div className="px-5 py-8">
                <p className="font-semibold">O histórico começa na primeira compra.</p>
                <p className="mt-2 text-sm leading-relaxed text-carvao">
                  Os pedidos vinculados a este cadastro aparecerão aqui automaticamente.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-areia">
                {ultimosPedidos.map((pedido) => (
                  <li
                    key={pedido.id}
                    className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-bold break-words">Pedido #{pedido.numero}</p>
                      <p className="mt-1 text-xs text-carvao">{CANAIS[pedido.canal]}</p>
                    </div>
                    <p className="text-right text-base font-bold tabular-nums">
                      {formatarBRL(Number(pedido.total))}
                    </p>
                    <time dateTime={pedido.criado_em} className="self-center text-xs text-carvao">
                      {dataPedido.format(new Date(pedido.criado_em))}
                    </time>
                    <span
                      className={`justify-self-end rounded-md px-2 py-1 text-xs font-semibold ${ESTADOS[pedido.status].classe}`}
                    >
                      {ESTADOS[pedido.status].rotulo}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {semCompras && ultimosPedidos.length > 0 && (
              <p className="border-t border-areia px-5 py-3 text-xs text-carvao">
                Todos os pedidos deste cadastro foram cancelados.
              </p>
            )}
          </section>

          <section
            aria-labelledby="enderecos-titulo"
            className="rounded-xl border border-areia bg-branco p-5"
          >
            <h2 id="enderecos-titulo" className="font-sans text-lg font-bold">
              Endereços
            </h2>
            {enderecos.length === 0 ? (
              <p className="mt-3 text-sm text-carvao">Nenhum endereço cadastrado.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {enderecos.map((endereco) => (
                  <li
                    key={endereco.id}
                    className="min-w-0 border-t border-areia pt-4 first:border-0 first:pt-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold break-words">{endereco.rotulo}</p>
                      {endereco.principal && (
                        <span className="rounded bg-papel-2 px-2 py-1 text-xs font-semibold text-carvao">
                          Principal
                        </span>
                      )}
                    </div>
                    <address className="mt-2 space-y-1 text-sm leading-relaxed break-words text-carvao not-italic">
                      {(endereco.rua || endereco.numero) && (
                        <p>{[endereco.rua, endereco.numero].filter(Boolean).join(', ')}</p>
                      )}
                      {endereco.complemento && <p>{endereco.complemento}</p>}
                      {(endereco.bairro || endereco.cidade || endereco.uf) && (
                        <p>
                          {[endereco.bairro, [endereco.cidade, endereco.uf].filter(Boolean).join(' / ')]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                      {endereco.cep && <p>CEP {endereco.cep.replace(/^(\d{5})(\d{3})$/, '$1-$2')}</p>}
                      {endereco.referencia && <p className="pt-1">Referência: {endereco.referencia}</p>}
                    </address>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="observacoes-titulo"
            className="rounded-xl border border-areia bg-papel-2 p-5"
          >
            <h2 id="observacoes-titulo" className="font-sans text-lg font-bold">
              Observações
            </h2>
            <p className="mt-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-carvao">
              {pessoa.observacoes || 'Nenhuma observação registrada.'}
            </p>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section aria-labelledby="contato-titulo" className="rounded-xl border border-areia bg-branco p-5">
            <h2 id="contato-titulo" className="font-sans text-lg font-bold">
              Dados de contato
            </h2>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-xs font-medium text-carvao">WhatsApp</dt>
                <dd className="mt-1 text-sm font-semibold break-words">
                  {whatsapp ? (
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${formatarTelefone(pessoa.whatsapp!)} (nova aba)`}
                      className="-my-1 inline-flex min-h-12 items-center gap-2 underline decoration-areia underline-offset-4 hover:decoration-tinta"
                    >
                      {formatarTelefone(pessoa.whatsapp!)}
                      <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                    </a>
                  ) : pessoa.whatsapp ? (
                    formatarTelefone(pessoa.whatsapp)
                  ) : (
                    'Não informado'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-carvao">E-mail</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {pessoa.email ? (
                    <a
                      href={`mailto:${pessoa.email}`}
                      className="-my-1 inline-block min-h-12 max-w-full py-3 break-all underline decoration-areia underline-offset-4 hover:decoration-tinta"
                    >
                      {pessoa.email}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-carvao">Aniversário</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {pessoa.nascimento ? pessoa.nascimento.split('-').reverse().join('/') : 'Não informado'}
                </dd>
              </div>
              <div className="border-t border-areia pt-4">
                <dt className="text-xs font-medium text-carvao">Cadastro criado em</dt>
                <dd className="mt-1 text-sm font-semibold">
                  {dataCompleta.format(new Date(pessoa.criado_em))}
                </dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="consentimentos-titulo"
            className="rounded-xl border border-areia bg-branco p-5"
          >
            <h2 id="consentimentos-titulo" className="font-sans text-lg font-bold">
              Consentimentos atuais
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-carvao">
              A escolha mais recente para cada finalidade.
            </p>
            <ul className="mt-4 divide-y divide-areia">
              {(Object.keys(FINALIDADES) as ConsentimentoLinha['finalidade'][]).map((finalidade) => {
                const consentimento = consentimentos[finalidade]
                return (
                  <li key={finalidade} className="py-4 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold">{FINALIDADES[finalidade]}</p>
                    <span
                      className={`mt-2 inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${!consentimento ? 'bg-papel-2 text-carvao' : consentimento.concedido ? 'bg-verde-clara text-[#17683a]' : 'bg-papel-3 text-carvao'}`}
                    >
                      {!consentimento
                        ? 'Não informado'
                        : consentimento.concedido
                          ? 'Autorizado'
                          : 'Não autorizado'}
                    </span>
                    {consentimento && (
                      <p className="mt-2 text-xs leading-relaxed text-carvao">
                        Registrado em {dataCompleta.format(new Date(consentimento.registado_em))} ·{' '}
                        {ORIGENS_CONSENTIMENTO[consentimento.origem]}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          {!anonimizado && <AnonimizarPessoa id={pessoa.id} nome={pessoa.nome} />}
        </div>
      </div>
    </div>
  )
}
