import {
  ArrowDownLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import type { Metadata } from 'next'
import Form from 'next/form'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarPessoas, POR_PAGINA } from '@/lib/dados/clientes'
import { formatarDocumento } from '@/lib/dominio/documento'
import { formatarTelefone, normalizarWhatsapp } from '@/lib/dominio/telefone'
import { esquemaBuscaPessoas, type BuscaPessoas } from '@/lib/validacao/clientes'
import { validar } from '@/lib/validacao/zod'

export const metadata: Metadata = { title: 'Clientes e fornecedores' }

const PAPEIS = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'clientes', rotulo: 'Clientes' },
  { valor: 'fornecedores', rotulo: 'Fornecedores' },
] as const

function enderecoDaLista(filtro: BuscaPessoas, pagina = 1) {
  const parametros = new URLSearchParams()
  if (filtro.busca) parametros.set('busca', filtro.busca)
  if (filtro.papel !== 'todos') parametros.set('papel', filtro.papel)
  if (pagina > 1) parametros.set('pagina', String(pagina))
  const consulta = parametros.toString()
  return `/painel/clientes${consulta ? `?${consulta}` : ''}`
}

export default async function PaginaClientes({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { supabase, tenantId } = await exigirModulo('clientes')
  const validacao = validar(esquemaBuscaPessoas, await searchParams)
  const filtro: BuscaPessoas = validacao.ok ? validacao.dados : { papel: 'todos', pagina: 1 }
  const { itens, total } = await listarPessoas(supabase, tenantId, filtro)
  const paginas = Math.max(1, Math.min(1000, Math.ceil(total / POR_PAGINA)))
  const filtrado = Boolean(filtro.busca) || filtro.papel !== 'todos'
  const foraDaPagina = filtro.pagina > paginas
  const numero = new Intl.NumberFormat('pt-BR')

  return (
    <div className="clientes-area mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-areia pb-6">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seu negócio / Cadastros
          </p>
          <h1 className="max-w-xl text-3xl leading-tight font-bold tracking-tight lg:text-4xl">
            Clientes e fornecedores
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
            Quem compra de você. Quem abastece seu negócio.
          </p>
        </div>
        <Link
          href="/painel/clientes/novo"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-tangerina px-5 py-3 text-sm font-bold text-tinta transition-colors hover:bg-tangerina-clara min-[440px]:w-auto"
        >
          <Plus aria-hidden="true" className="size-5" /> Novo cliente
        </Link>
      </header>

      {!validacao.ok && (
        <p role="status" className="rounded-lg border border-areia bg-papel-2 p-4 text-sm text-carvao">
          Não foi possível usar os filtros deste endereço. Mostramos todos os cadastros; faça uma nova busca
          abaixo.
        </p>
      )}

      <section aria-label="Buscar e filtrar cadastros" className="flex flex-col gap-4">
        <Form
          key={`${filtro.busca ?? ''}-${filtro.papel}`}
          action="/painel/clientes"
          className="flex flex-col gap-2 min-[440px]:flex-row"
          role="search"
        >
          <input type="hidden" name="papel" value={filtro.papel} />
          <div className="relative min-w-0 flex-1">
            <label htmlFor="busca-pessoas" className="sr-only">
              Buscar por nome, CPF/CNPJ ou WhatsApp
            </label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-3.5 left-4 size-5 text-carvao"
            />
            <input
              id="busca-pessoas"
              name="busca"
              type="search"
              defaultValue={filtro.busca ?? ''}
              maxLength={80}
              placeholder="Nome, CPF/CNPJ ou WhatsApp"
              className="h-12 w-full min-w-0 rounded-lg border border-areia bg-branco pr-4 pl-11 text-base text-tinta placeholder:text-carvao"
            />
          </div>
          <button
            type="submit"
            className="min-h-12 shrink-0 rounded-lg bg-tinta px-6 text-sm font-bold text-papel hover:bg-carvao"
          >
            Buscar
          </button>
        </Form>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <nav
            aria-label="Filtrar por papel"
            className="flex max-w-full rounded-lg border border-areia bg-papel-2 p-1"
          >
            {PAPEIS.map((papel) => (
              <Link
                key={papel.valor}
                href={enderecoDaLista({ ...filtro, papel: papel.valor })}
                aria-current={filtro.papel === papel.valor ? 'page' : undefined}
                className={`inline-flex min-h-12 items-center justify-center rounded-md px-3 text-sm font-semibold transition-colors ${filtro.papel === papel.valor ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3'}`}
              >
                {papel.rotulo}
              </Link>
            ))}
          </nav>
          {filtrado && (
            <Link
              href="/painel/clientes"
              className="inline-flex min-h-12 items-center rounded-md px-2 text-sm font-semibold text-carvao underline underline-offset-4"
            >
              Limpar filtros
            </Link>
          )}
        </div>
      </section>

      <section
        aria-labelledby="titulo-resultados"
        className="overflow-hidden rounded-xl border border-areia bg-branco"
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia bg-papel-2/60 px-4 py-4 lg:px-6">
          <h2 id="titulo-resultados" className="font-semibold">
            <span role="status" aria-atomic="true" className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{numero.format(total)}</span>
              <span className="text-sm text-carvao">
                {total === 1 ? 'cadastro' : 'cadastros'}
                {filtrado ? (total === 1 ? ' encontrado' : ' encontrados') : ''}
              </span>
            </span>
          </h2>
          <span className="text-xs text-carvao">Em ordem alfabética</span>
        </header>

        {itens.length === 0 ? (
          <div className="flex flex-col items-start px-5 py-10 sm:px-8 sm:py-14">
            <Users aria-hidden="true" className="mb-5 size-9 text-carvao" strokeWidth={1.5} />
            <h3 className="text-xl font-bold">
              {foraDaPagina
                ? 'Esta página está vazia'
                : filtrado
                  ? 'Nenhum cadastro encontrado'
                  : 'O próximo contato começa aqui'}
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
              {foraDaPagina
                ? 'A lista mudou e esta página não tem mais cadastros. Volte para o início da lista.'
                : filtrado
                  ? 'Tente outro nome, CPF/CNPJ ou WhatsApp, ou limpe os filtros para ver todos os cadastros.'
                  : 'Clientes que fazem pedidos pelo cardápio aparecem aqui automaticamente. Você também pode cadastrar clientes e fornecedores agora.'}
            </p>
            <Link
              href={
                foraDaPagina
                  ? enderecoDaLista(filtro)
                  : filtrado
                    ? '/painel/clientes'
                    : '/painel/clientes/novo'
              }
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-tinta px-5 py-3 text-sm font-bold text-papel hover:bg-carvao"
            >
              {foraDaPagina
                ? 'Voltar à primeira página'
                : filtrado
                  ? 'Ver todos os cadastros'
                  : 'Cadastrar primeiro contato'}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-5 border-b border-areia px-6 py-3 text-xs font-bold tracking-wide text-carvao uppercase xl:grid"
            >
              <span>Nome e documento</span>
              <span>WhatsApp</span>
              <span>Relação e etiquetas</span>
            </div>
            <ul className="divide-y divide-areia">
              {itens.map((pessoa) => {
                const whatsapp = pessoa.whatsapp ? normalizarWhatsapp(pessoa.whatsapp) : null
                return (
                  <li
                    key={pessoa.id}
                    className="grid min-w-0 gap-x-5 gap-y-3 px-4 py-5 transition-colors hover:bg-papel/70 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] xl:items-center xl:px-6"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/painel/clientes/${pessoa.id}`}
                        className="group flex min-h-12 items-center justify-between gap-3 rounded-md py-1"
                      >
                        <span className="min-w-0">
                          <span className="block text-base leading-snug font-bold break-words group-hover:underline group-hover:underline-offset-4">
                            {pessoa.nome}
                          </span>
                          {pessoa.nome_fantasia && pessoa.nome_fantasia !== pessoa.nome && (
                            <span className="mt-0.5 block text-sm break-words text-carvao">
                              {pessoa.nome_fantasia}
                            </span>
                          )}
                          <span className="mt-1 block text-sm text-carvao tabular-nums">
                            {pessoa.documento
                              ? formatarDocumento(pessoa.documento)
                              : 'Documento não informado'}
                          </span>
                        </span>
                        <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-carvao" />
                      </Link>
                      {pessoa.origem === 'pedido' && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-carvao">
                          <ArrowDownLeft aria-hidden="true" className="size-3.5" />
                          Veio pelo cardápio
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      {whatsapp ? (
                        <a
                          href={`https://wa.me/${whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Abrir WhatsApp de ${pessoa.nome} (nova aba)`}
                          className="inline-flex min-h-12 max-w-full items-center gap-2 rounded-lg border border-areia px-3 text-sm font-semibold text-tinta tabular-nums hover:bg-papel-2"
                        >
                          <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
                          {formatarTelefone(pessoa.whatsapp!)}
                        </a>
                      ) : (
                        <span className="text-sm text-carvao">
                          {pessoa.whatsapp ? formatarTelefone(pessoa.whatsapp) : 'WhatsApp não informado'}
                        </span>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                      {pessoa.e_cliente && (
                        <span className="rounded-md bg-papel-3 px-2.5 py-1 text-xs font-semibold text-carvao">
                          Cliente
                        </span>
                      )}
                      {pessoa.e_fornecedor && (
                        <span className="rounded-md bg-papel-3 px-2.5 py-1 text-xs font-semibold text-carvao">
                          Fornecedor
                        </span>
                      )}
                      {pessoa.etiquetas.map((etiqueta) => (
                        <span
                          key={etiqueta}
                          className="max-w-full rounded-md border border-areia px-2.5 py-1 text-xs break-words text-carvao"
                        >
                          {etiqueta}
                        </span>
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>

      {total > 0 && !foraDaPagina && (
        <nav
          aria-label="Paginação de cadastros"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <p className="text-sm text-carvao tabular-nums">
            {numero.format((filtro.pagina - 1) * POR_PAGINA + 1)}–
            {numero.format(Math.min(filtro.pagina * POR_PAGINA, total))} de {numero.format(total)}
          </p>
          <div className="flex items-center gap-2">
            {filtro.pagina > 1 ? (
              <Link
                href={enderecoDaLista(filtro, filtro.pagina - 1)}
                aria-label="Página anterior"
                className="inline-flex size-12 items-center justify-center rounded-lg border border-areia bg-branco hover:bg-papel-2"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-label="Página anterior indisponível"
                className="inline-flex size-12 items-center justify-center rounded-lg border border-areia text-carvao/40"
              >
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
            )}
            <span className="px-2 text-sm font-semibold tabular-nums">
              {filtro.pagina} / {paginas}
            </span>
            {filtro.pagina < paginas ? (
              <Link
                href={enderecoDaLista(filtro, filtro.pagina + 1)}
                aria-label="Próxima página"
                className="inline-flex size-12 items-center justify-center rounded-lg border border-areia bg-branco hover:bg-papel-2"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </Link>
            ) : (
              <button
                type="button"
                disabled
                aria-label="Próxima página indisponível"
                className="inline-flex size-12 items-center justify-center rounded-lg border border-areia text-carvao/40"
              >
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            )}
          </div>
        </nav>
      )}
      <p className="flex items-start gap-2 text-xs leading-relaxed text-carvao">
        <ArrowDownLeft aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        Os clientes do cardápio entram automaticamente nesta lista.
      </p>
    </div>
  )
}
