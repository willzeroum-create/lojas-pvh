export default function CarregandoPix() {
  return (
    <div role="status" aria-live="polite" className="pix-area space-y-6">
      <p className="text-sm font-semibold text-carvao">Carregando o Pix e suas cobranças…</p>
      <div aria-hidden="true" className="h-28 rounded-xl border border-areia bg-papel-2" />
      <div aria-hidden="true" className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-xl border border-areia bg-branco" />
        <div className="h-80 rounded-xl border border-areia bg-papel-2" />
      </div>
    </div>
  )
}
