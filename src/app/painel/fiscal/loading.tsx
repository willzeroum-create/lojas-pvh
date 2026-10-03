export default function CarregandoFiscal() {
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <p className="text-sm font-semibold text-carvao">Carregando dados fiscais…</p>
      <div aria-hidden="true" className="h-36 rounded-xl border border-areia bg-papel-2" />
      <div aria-hidden="true" className="grid gap-4 lg:grid-cols-2">
        {[1, 2].map((item) => (
          <div key={item} className="h-64 rounded-xl border border-areia bg-papel-2" />
        ))}
      </div>
    </div>
  )
}
