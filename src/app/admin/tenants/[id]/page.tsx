import { Download, ExternalLink, FileUp, Images, ListChecks, LogIn, NotebookPen } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Etiqueta } from '@/components/ui/etiqueta'
import { Mensagem } from '@/components/ui/mensagem'
import { exigirConsole } from '@/lib/auth/guardas'
import { resumirCadeia } from '@/lib/cadeia/progresso'
import { urlPublica } from '@/lib/config/marca'
import { contarArquivos } from '@/lib/dados/arquivos'
import { contarNotas, obterCadeia } from '@/lib/dados/cadeia'
import { contarProdutos } from '@/lib/dados/cardapio'
import { listarMembros, obterTenant } from '@/lib/dados/tenants'
import { clienteAdmin } from '@/lib/supabase/server'
import type { TenantStatus } from '@/lib/supabase/tipos'
import { cn } from '@/lib/utils/cn'
import { entrarComoTenant } from '../../actions'
import { FormularioFicha } from './_components/formulario-ficha'
import { FormularioSenha } from './_components/formulario-senha'
import { LinkDeAcesso } from './_components/link-de-acesso'

export const metadata: Metadata = { title: 'Ficha do tenant' }

const TOM: Record<TenantStatus, 'ambar' | 'verde' | 'vermelho' | 'neutro'> = {
  onboarding: 'ambar',
  ativo: 'verde',
  suspenso: 'vermelho',
  cancelado: 'neutro',
}

const BOTAO =
  'inline-flex h-10 items-center gap-1.5 rounded-lg border border-areia bg-branco px-3.5 text-sm font-semibold hover:bg-papel-2'

export default async function PaginaFichaTenant(props: PageProps<'/admin/tenants/[id]'>) {
  const [{ id }, { criado }] = await Promise.all([props.params, props.searchParams])
  const { supabase } = await exigirConsole()
  const tenant = await obterTenant(supabase, id)
  if (!tenant) notFound()

  const [frentes, membros, produtos, totalNotas, totalArquivos] = await Promise.all([
    obterCadeia(supabase, id),
    listarMembros(clienteAdmin(), id),
    contarProdutos(supabase, id),
    contarNotas(supabase, id),
    contarArquivos(supabase, id),
  ])
  const geral = resumirCadeia(frentes)

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      {criado === '1' && (
        <Mensagem tipo="sucesso">
          Tenant criado. Próximo passo: o diagnóstico na cadeia de produção e o cardápio.
        </Mensagem>
      )}

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center text-sm font-semibold text-carvao underline underline-offset-4"
          >
            ← Tenants
          </Link>
          <h1 className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xl font-bold">
            {tenant.nome_fantasia}
            <Etiqueta tom={TOM[tenant.status]}>{tenant.status}</Etiqueta>
          </h1>
          <a
            href={urlPublica(tenant.slug)}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-9 max-w-full items-center gap-1 text-sm text-cinza hover:text-carvao"
          >
            <span className="truncate">{urlPublica(tenant.slug)}</span>{' '}
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={entrarComoTenant.bind(null, tenant.id)}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-tinta px-3.5 text-sm font-semibold text-papel hover:bg-carvao"
            >
              <LogIn className="size-4" /> Entrar como
            </button>
          </form>
          <Link href={`/admin/tenants/${tenant.id}/cadeia`} className={BOTAO}>
            <ListChecks className="size-4" /> Cadeia
          </Link>
          <Link href={`/admin/tenants/${tenant.id}/notas`} className={BOTAO}>
            <NotebookPen className="size-4" /> Notas{totalNotas > 0 && ` (${totalNotas})`}
          </Link>
          <Link href={`/admin/tenants/${tenant.id}/arquivos`} className={BOTAO}>
            <Images className="size-4" /> Arquivos{totalArquivos > 0 && ` (${totalArquivos})`}
          </Link>
          <Link href={`/admin/tenants/${tenant.id}/importar`} className={BOTAO}>
            <FileUp className="size-4" /> Importar cardápio
          </Link>
          <a href={`/admin/tenants/${tenant.id}/exportar`} className={BOTAO}>
            <Download className="size-4" /> Exportar dados
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="flex flex-col gap-4">
          <div className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-bold">Cadeia de produção</h2>
              <span className="text-sm text-cinza">
                {geral.atendidas}/{geral.total}
              </span>
            </div>
            <p className="mb-3 text-sm text-cinza">
              {geral.total - geral.avaliadas > 0
                ? `${geral.total - geral.avaliadas} etapas por avaliar · ${geral.abertas} em aberto`
                : geral.abertas > 0
                  ? `${geral.abertas} em aberto`
                  : 'Tudo atendido.'}
            </p>
            <ul className="flex flex-col gap-3">
              {frentes.map((f) => (
                <li key={f.chave}>
                  <Link href={`/admin/tenants/${tenant.id}/cadeia#${f.chave}`} className="group block">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold group-hover:underline">{f.titulo}</span>
                      <span className="text-xs text-cinza tabular-nums">
                        {f.resumo.atendidas}/{f.resumo.total}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-papel-3" aria-hidden>
                      <div className="h-full bg-verde" style={{ width: `${f.resumo.percentagem}%` }} />
                    </div>
                    <p className={cn('mt-1 text-xs', f.resumo.proxima ? 'text-carvao' : 'text-cinza')}>
                      {f.resumo.proxima ? `Próxima: ${f.resumo.proxima.titulo}` : 'Completa'}
                      {f.chave === 'lancamento' &&
                        ` · ${produtos.total} produto${produtos.total === 1 ? '' : 's'}, ${produtos.comFoto} com foto`}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
            <h2 className="text-lg font-bold">Acesso ao painel</h2>
            {membros.length === 0 ? (
              <p className="mt-2 text-sm text-cinza">Nenhum utilizador ligado.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-4">
                {membros.map((m) => (
                  <li key={m.user_id}>
                    <p className="text-sm">
                      <span className="font-semibold">{m.email ?? m.user_id}</span>{' '}
                      <span className="text-cinza">· {m.papel}</span>
                    </p>
                    <FormularioSenha tenantId={tenant.id} userId={m.user_id} />
                    <LinkDeAcesso tenantId={tenant.id} userId={m.user_id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
          <h2 className="text-lg font-bold">Ficha</h2>
          <FormularioFicha tenant={tenant} />
        </section>
      </div>
    </div>
  )
}
