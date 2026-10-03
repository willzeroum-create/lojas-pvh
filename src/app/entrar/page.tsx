import type { Metadata } from 'next'
import { MARCA } from '@/lib/config/marca'
import { FormularioEntrar } from './formulario'

export const metadata: Metadata = { title: 'Entrar' }

const AVISOS: Record<string, string> = {
  'sem-tenant': 'Sua conta ainda não está ligada a nenhum estabelecimento. Fale com a equipe.',
  'link-invalido': 'Esse link de acesso já foi usado ou expirou. Peça um novo à equipe ou entre com a senha.',
}

export default async function PaginaEntrar(props: PageProps<'/entrar'>) {
  const { proximo, erro } = await props.searchParams
  const destino = typeof proximo === 'string' ? proximo : undefined
  const aviso = typeof erro === 'string' ? AVISOS[erro] : undefined

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <p className="text-xs font-bold tracking-[0.3em] text-cinza uppercase">{MARCA.nome}</p>
        <h1 className="mt-2 text-3xl font-bold">Entrar no painel</h1>
        <p className="mt-1 mb-8 text-carvao">
          Use o e-mail (ou o nome de usuário, se for da equipe) e a senha que recebeu.
        </p>
        <FormularioEntrar proximo={destino} avisoInicial={aviso} />
        {MARCA.whatsappSuporte && (
          <p className="mt-8 text-center text-sm text-cinza">
            Esqueceu a senha?{' '}
            <a
              className="font-semibold text-carvao underline underline-offset-4"
              href={`https://wa.me/${MARCA.whatsappSuporte}`}
            >
              Fale com a equipe
            </a>
          </p>
        )}
      </div>
    </main>
  )
}
