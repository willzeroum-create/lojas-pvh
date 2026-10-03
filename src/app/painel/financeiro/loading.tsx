export default function CarregandoFinanceiro() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <p className="text-sm font-semibold text-carvao">Carregando seu financeiro…</p>
      <div aria-hidden="true" className="grid gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-44 rounded-xl border border-areia bg-papel-2" />
        ))}
      </div>
      <div aria-hidden="true" className="h-64 rounded-xl border border-areia bg-papel-2" />
    </div>
  )
}
