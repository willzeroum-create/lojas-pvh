import { exigirConsole } from '@/lib/auth/guardas'
import { nomeDeUtilizador } from '@/lib/dominio/identificador'
import { NavConsole } from './_components/nav-console'

/** Área autenticada: lê cookies em cada pedido, nunca é pré-renderizada. */
export const dynamic = 'force-dynamic'

/**
 * Console do operador. No computador, coluna de navegação à esquerda e
 * densidade bem-vinda; no telemóvel, barra no topo e o mesmo conteúdo a
 * toda a largura.
 */
export default async function LayoutConsole({ children }: { children: React.ReactNode }) {
  const { sessao } = await exigirConsole()

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <NavConsole nome={sessao.operador?.nome} email={nomeDeUtilizador(sessao.email)} />
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">{children}</main>
    </div>
  )
}
