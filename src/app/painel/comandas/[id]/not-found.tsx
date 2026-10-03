import Link from 'next/link'

export default function ComandaNaoEncontrada() {
  return (
    <section className="pdv-area rounded-xl border border-areia bg-branco p-6">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Comandas</p>
      <h1 className="mt-2 text-2xl font-bold">Comanda não encontrada</h1>
      <p className="mt-2 text-carvao">Volte ao mapa e selecione a mesa ou o número da comanda.</p>
      <Link href="/painel/comandas" className="pdv-botao mt-5">
        Voltar às mesas
      </Link>
    </section>
  )
}
