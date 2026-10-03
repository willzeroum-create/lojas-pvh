import Link from 'next/link'
import { BOTAO } from './_components/apresentacao'

export default function ItemNaoEncontrado() {
  return (
    <section className="rounded-xl border border-areia bg-branco p-6">
      <h1 className="text-2xl font-bold">Registro não encontrado</h1>
      <p className="mt-3 text-sm text-carvao">
        Ele pode estar inativo ou não estar disponível no estoque desta empresa.
      </p>
      <Link href="/painel/estoque" className={`${BOTAO} mt-5`}>
        Voltar ao estoque
      </Link>
    </section>
  )
}
