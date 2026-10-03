export default function CarregandoCaixa() {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <p className="text-sm font-bold text-carvao">Carregando caixa…</p>
      <div className="h-12 max-w-sm rounded-xl bg-papel-3" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-48 rounded-xl border border-areia bg-papel-2" />
        <div className="h-48 rounded-xl border border-areia bg-papel-2" />
      </div>
      <div className="h-60 rounded-xl border border-areia bg-papel-2" />
    </div>
  )
}
