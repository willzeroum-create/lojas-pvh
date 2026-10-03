import Link from 'next/link'

export default function NaoEncontrado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-7xl font-bold text-areia">404</p>
      <h1 className="mt-2 text-2xl font-bold">Essa página não existe</h1>
      <p className="mt-2 max-w-sm text-carvao">
        Confira o endereço. Se veio de um link do Instagram, peça o link atualizado ao estabelecimento.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center text-sm font-semibold underline underline-offset-4"
      >
        Voltar ao início
      </Link>
    </main>
  )
}
