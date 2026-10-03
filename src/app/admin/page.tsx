import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Etiqueta } from '@/components/ui/etiqueta'
import { exigirConsole } from '@/lib/auth/guardas'
import { estaAtendida, ROTULO_ESTADO } from '@/lib/cadeia/estados'
import { pontosLancamento } from '@/lib/cadeia/progresso'
import { urlPublica } from '@/lib/config/marca'
import { listarTenants } from '@/lib/dados/tenants'
import { obterVisaoGeral } from '@/lib/dados/visao-geral'
import type { TenantStatus } from '@/lib/supabase/tipos'
import { cn } from '@/lib/utils/cn'
import { ResumoConsole } from './_components/resumo-console'
import { entrarComoTenant } from './actions'

export const metadata: Metadata = { title: 'Console' }

const TOM: Record<TenantStatus, 'ambar' | 'verde' | 'vermelho' | 'neutro'> = {
  onboarding: 'ambar',
  ativo: 'verde',
  suspenso: 'vermelho',
  cancelado: 'neutro',
}
const ROTULO: Record<TenantStatus, string> = {
  onboarding: 'Onboarding',
  ativo: 'Ativo',
  suspenso: 'Suspenso',
  cancelado: 'Cancelado',
}
const FILTROS: Array<{ valor: TenantStatus | 'todos'; rotulo: string }> = [
  { valor: 'todos', rotulo: 'Todos' },
  { valor: 'onboarding', rotulo: 'Onboarding' },
  { valor: 'ativo', rotulo: 'Ativos' },
  { valor: 'suspenso', rotulo: 'Suspensos' },
  { valor: 'cancelado', rotulo: 'Cancelados' },
]

function dataCurta(iso: string | null) {
  return iso
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(
        new Date(iso.length === 10 ? `${iso}T12:00:00` : iso),
      )
    : '—'
}

export default async function PaginaConsole(props: PageProps<'/admin'>) {
  const { status } = await props.searchParams
  const { supabase } = await exigirConsole()
  const todos = await listarTenants(supabase)
  const visao = await obterVisaoGeral(supabase, todos)
  const filtro = FILTROS.some((f) => f.valor === status) ? (status as TenantStatus | 'todos') : 'todos'
  const tenants = filtro === 'todos' ? todos : todos.filter((t) => t.status === filtro)
  const contagem = (s: TenantStatus) => todos.filter((t) => t.status === s).length
  const hoje = new Date().toISOString().slice(0, 10)

  return (
    <div className="flex flex-col gap-6">
      <ResumoConsole visao={visao} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-sm text-cinza">
            {contagem('ativo')} ativos · {contagem('onboarding')} em onboarding · {contagem('suspenso')}{' '}
            suspensos
          </p>
        </div>
        <Link
          href="/admin/tenants/novo"
          className="inline-flex h-10 items-center rounded-lg bg-tinta px-4 text-sm font-semibold text-papel hover:bg-carvao"
        >
          Novo tenant
        </Link>
      </div>

      <nav
        className="-mx-4 sem-scrollbar flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        aria-label="Filtrar por estado"
      >
        {FILTROS.map((f) => (
          <Link
            key={f.valor}
            href={f.valor === 'todos' ? '/admin' : `/admin?status=${f.valor}`}
            className={cn(
              'h-10 shrink-0 rounded-full px-3.5 text-sm leading-10 font-semibold',
              filtro === f.valor ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3',
            )}
          >
            {f.rotulo}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-lg border border-areia/70 bg-branco shadow-cartao">
        <table className="w-full text-sm">
          <thead className="bg-papel-2 text-left text-xs font-bold tracking-wider text-cinza uppercase">
            <tr>
              <th className="px-4 py-3">Comerciante</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Lançamento</th>
              <th className="hidden px-4 py-3 lg:table-cell">Plano</th>
              <th className="hidden px-4 py-3 md:table-cell">Renovação</th>
              <th className="hidden px-4 py-3 xl:table-cell">Criado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-areia/60">
            {tenants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-cinza">
                  Nenhum tenant neste filtro.
                </td>
              </tr>
            )}
            {tenants.map((t) => {
              const pontos = pontosLancamento(t.cadeia_etapas)
              const feitas = pontos.filter((p) => estaAtendida(p.estado)).length
              const proxima = pontos.find((p) => !estaAtendida(p.estado))
              const renovacaoAtrasada =
                t.renovacao_em !== null && t.renovacao_em < hoje && t.status === 'ativo'
              return (
                <tr key={t.id} className="hover:bg-papel/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/tenants/${t.id}`} className="font-semibold hover:underline">
                      {t.nome_fantasia}
                    </Link>
                    <a
                      href={urlPublica(t.slug)}
                      target="_blank"
                      rel="noopener"
                      className="ml-2 inline-flex min-h-9 items-center gap-1 text-xs text-cinza hover:text-carvao"
                    >
                      /{t.slug} <ExternalLink className="size-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <Etiqueta tom={TOM[t.status]}>{ROTULO[t.status]}</Etiqueta>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tenants/${t.id}/cadeia`}
                      className="flex min-h-9 items-center gap-1"
                      title={proxima ? `Próxima: ${proxima.titulo}` : 'Lançamento completo'}
                    >
                      {pontos.map((p) => (
                        <span
                          key={p.chave}
                          className={cn(
                            'size-2.5 rounded-full',
                            estaAtendida(p.estado)
                              ? 'bg-verde'
                              : p.estado === 'em_curso'
                                ? 'bg-ambar'
                                : 'bg-areia',
                          )}
                          aria-label={`${p.titulo}: ${ROTULO_ESTADO[p.estado]}`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs text-cinza">
                        {feitas}/{pontos.length}
                      </span>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 capitalize lg:table-cell">{t.plano}</td>
                  <td
                    className={cn(
                      'hidden px-4 py-3 tabular-nums md:table-cell',
                      renovacaoAtrasada && 'font-semibold text-vermelho',
                    )}
                  >
                    {dataCurta(t.renovacao_em)}
                  </td>
                  <td className="hidden px-4 py-3 text-cinza tabular-nums xl:table-cell">
                    {dataCurta(t.criado_em)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={entrarComoTenant.bind(null, t.id)} className="inline">
                      <button
                        type="submit"
                        className="h-9 rounded-md border border-areia bg-branco px-2.5 text-xs font-semibold whitespace-nowrap hover:bg-papel-2"
                      >
                        Entrar como
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
