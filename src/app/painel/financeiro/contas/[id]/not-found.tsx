import Link from 'next/link'
import { ESTILO_BOTAO } from '../../_components/apresentacao'

export default function ContaNaoEncontrada() {
  return (
    <section className="rounded-xl border border-areia bg-branco p-6 sm:p-8">
      <p className="text-xs font-bold tracking-[0.12em] text-carvao uppercase">Financeiro</p>
      <h1 className="mt-3 font-sans text-2xl font-bold tracking-tight">Conta não encontrada</h1>
      <p className="mt-3 text-sm leading-relaxed text-carvao">
        Confira o endereço ou volte ao financeiro para localizar a conta.
      </p>
      <Link href="/painel/financeiro" className={`${ESTILO_BOTAO} mt-6`}>
        Voltar ao financeiro
      </Link>
    </section>
  )
}
