import type { Metadata } from 'next'
import { exigirConsole } from '@/lib/auth/guardas'
import { listarOperadores } from '@/lib/dados/operadores'
import { nomeDeUtilizador } from '@/lib/dominio/identificador'
import { clienteAdmin } from '@/lib/supabase/server'
import { FormularioOperador } from './_components/formulario-operador'
import { removerOperador } from '../actions'

export const metadata: Metadata = { title: 'Equipa' }

function quando(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

/** Quem tem acesso ao console. Operadores vêem todas as empresas e podem entrar em qualquer painel. */
export default async function PaginaEquipa() {
  const { sessao } = await exigirConsole()
  const operadores = await listarOperadores(clienteAdmin())

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Equipa</h1>
        <p className="text-sm text-cinza">
          Quem entra no console. Cada operador vê todas as empresas e pode entrar em qualquer painel sem senha
          do cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-areia/70 bg-branco shadow-cartao">
          <ul className="divide-y divide-areia/60">
            {operadores.map((o) => {
              const souEu = o.user_id === sessao.userId
              return (
                <li key={o.user_id} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {o.nome}
                      {souEu && <span className="ml-2 text-xs font-bold text-cinza uppercase">você</span>}
                    </p>
                    <p className="truncate text-sm text-cinza">
                      {nomeDeUtilizador(o.email) || o.user_id} · desde {quando(o.criado_em)}
                    </p>
                  </div>
                  {!souEu && (
                    <form action={removerOperador.bind(null, o.user_id)}>
                      <button
                        type="submit"
                        className="h-10 rounded-md px-3 text-sm font-semibold text-vermelho hover:bg-vermelho-clara"
                      >
                        Remover acesso
                      </button>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
          <h2 className="text-lg font-bold">Novo operador</h2>
          <p className="mb-3 text-sm text-cinza">
            Um nome de usuário (ex.: “will”) chega. Se o e-mail já existir no Auth, a senha é substituída e o
            acesso ligado.
          </p>
          <FormularioOperador />
        </section>
      </div>
    </div>
  )
}
