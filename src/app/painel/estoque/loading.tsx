export default function CarregandoEstoque() {
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <p className="text-sm font-bold text-carvao">Carregando estoque…</p>
      <div aria-hidden="true" className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((indice) => (
          <div key={indice} className="h-36 rounded-xl border border-areia bg-papel-2" />
        ))}
      </div>
    </div>
  )
}
