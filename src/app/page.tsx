import Link from 'next/link'
import { MARCA } from '@/lib/config/marca'

/** Página inicial da plataforma. Quem chega aqui é a equipa ou um comerciante à procura do painel. */
export default function PaginaInicial() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-bold tracking-[0.3em] text-cinza uppercase">{MARCA.nome}</p>
      <h1 className="mt-4 max-w-2xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl">
        O cardápio do seu negócio, <span className="marca">com pedido no WhatsApp.</span>
      </h1>
      <p className="mt-5 max-w-md text-lg text-balance text-carvao">{MARCA.descricao}</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/entrar"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-tinta px-6 font-semibold text-papel hover:bg-carvao"
        >
          Entrar no painel
        </Link>
        {MARCA.whatsappSuporte && (
          <a
            href={`https://wa.me/${MARCA.whatsappSuporte}`}
            className="inline-flex h-12 items-center justify-center rounded-lg border border-areia bg-branco px-6 font-semibold text-tinta hover:bg-papel-2"
          >
            Falar com a equipe
          </a>
        )}
      </div>
    </main>
  )
}
