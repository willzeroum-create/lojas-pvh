export default function CarregandoFidelidade() {
  return (
    <section role="status" aria-live="polite" aria-busy="true" className="space-y-5">
      <p className="text-xl font-bold">Carregando o cashback…</p>
      <div aria-hidden="true" className="h-40 rounded-xl bg-papel-3" />
      <div aria-hidden="true" className="h-60 rounded-xl border border-areia bg-branco" />
    </section>
  )
}
