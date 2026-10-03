import Link from 'next/link'
import { BOTAO_CAIXA } from '../_components/apresentacao'

export default function CaixaNaoEncontrado() {
  return (
    <section className="rounded-xl border border-areia bg-branco p-6">
      <h1 className="text-2xl font-bold">Caixa não encontrado</h1>
      <p className="mt-2 text-sm text-carvao">
        Este caixa não está disponível para consulta. Volte ao histórico para localizar o turno.
      </p>
      <Link href="/painel/caixa/historico" className={`${BOTAO_CAIXA} mt-5`}>
        Ver histórico
      </Link>
    </section>
  )
}
