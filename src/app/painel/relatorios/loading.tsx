export default function CarregandoRelatorios() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-6">
      <p className="text-base font-semibold text-carvao">Carregando as vendas do período…</p>
      <div aria-hidden="true" className="h-52 rounded-xl border border-areia bg-papel-2" />
      <div aria-hidden="true" className="grid gap-3 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-44 rounded-xl border border-areia bg-papel-2" />
        ))}
      </div>
      <div aria-hidden="true" className="h-72 rounded-xl border border-areia bg-papel-2" />
    </div>
  )
}
