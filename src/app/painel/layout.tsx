import Link from 'next/link'
import { exigirPainel } from '@/lib/auth/guardas'
import { Etiqueta } from '@/components/ui/etiqueta'
import { PAPEIS } from '@/lib/equipe/papeis'
import { separadoresDoPainel } from '@/lib/modulos/catalogo'
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
 * Painel do comerciante: cabeçalho fino, conteúdo, barra com um separador por
 * módulo ligado, fixa em baixo (no computador passa para o lado). Sem menus
 * escondidos.
 */
export default async function LayoutPainel({ children }: { children: React.ReactNode }) {
  // semEquipe: a tela "quem está operando?" vive dentro deste layout; as páginas exigem a pessoa.
  const { sessao, tenant, modulos, equipe, aguardandoEquipe } = await exigirPainel({ semEquipe: true })

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      {!aguardandoEquipe && <NavPainel separadores={separadoresDoPainel(modulos)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        {sessao.impersonando && <BannerImpersonacao nome={tenant.nome_fantasia} />}
        {tenant.status === 'suspenso' && (
          <p className="bg-vermelho px-4 py-2 text-center text-sm font-semibold text-branco">
            Conta suspensa: a página pública está em modo reduzido e não recebe pedidos. Fale com a equipe.
          </p>
        )}
        <header className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
          <p className="truncate font-display text-lg font-bold">{tenant.nome_fantasia}</p>
          <div className="flex items-center gap-2">
            {equipe && (
              <Link
                href="/painel/equipe/entrar"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-areia bg-branco px-3 text-sm font-semibold hover:bg-papel-2"
                title="Trocar quem está operando"
              >
                {equipe.nome} <span className="text-cinza">· {PAPEIS[equipe.papel]}</span>
              </Link>
            )}
            <Etiqueta tom={TOM_STATUS[tenant.status]} ponto>
              {ROTULO_STATUS[tenant.status]}
            </Etiqueta>
          </div>
        </header>
        <main className="flex-1 px-4 pt-4 pb-28 sm:px-8 sm:pb-10">{children}</main>
      </div>
    </div>
  )
}
