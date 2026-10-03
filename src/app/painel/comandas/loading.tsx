export default function CarregandoComandas() {
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <p className="text-sm font-bold text-carvao">Carregando mesas e comandas…</p>
      <div aria-hidden className="h-16 max-w-md rounded-xl bg-papel-3" />
      <div aria-hidden className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((numero) => (
          <div key={numero} className="h-56 rounded-xl border border-areia bg-papel-2" />
        ))}
      </div>
    </div>
  )
}
