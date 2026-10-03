import { exigirPainel } from '@/lib/auth/guardas'
import { Etiqueta } from '@/components/ui/etiqueta'
import { BannerImpersonacao } from './_components/banner-impersonacao'
import { NavPainel } from './_components/nav-painel'

const TOM_STATUS = { onboarding: 'ambar', ativo: 'verde', suspenso: 'vermelho', cancelado: 'neutro' } as const
const ROTULO_STATUS = {
  onboarding: 'Em configuração',
  ativo: 'Ativo',
  suspenso: 'Suspenso',
  cancelado: 'Cancelado',
} as const

/** Área autenticada: lê cookies em cada pedido, nunca é pré-renderizada. */
export const dynamic = 'force-dynamic'

/**
 * Painel do comerciante: cabeçalho fino, conteúdo, barra de cinco separadores
 * fixa em baixo (no computador passa para o lado). Sem menus escondidos.
 */
export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  const { sessao, tenant } = await exigirPainel()

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      <NavPainel />
      <div className="flex min-w-0 flex-1 flex-col">
        {sessao.impersonando && <BannerImpersonacao nome={tenant.nome_fantasia} />}
        {tenant.status === 'suspenso' && (
          <p className="bg-vermelho px-4 py-2 text-center text-sm font-semibold text-branco">
            Conta suspensa: a página pública está em modo reduzido e não recebe pedidos. Fale com a equipe.
          </p>
        )}
        <header className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
          <p className="truncate font-display text-lg font-bold">{tenant.nome_fantasia}</p>
          <Etiqueta tom={TOM_STATUS[tenant.status]} ponto>
            {ROTULO_STATUS[tenant.status]}
          </Etiqueta>
        </header>
        <main className="flex-1 px-4 pt-4 pb-28 sm:px-8 sm:pb-10">{children}</main>
      </div>
    </div>
  )
}
