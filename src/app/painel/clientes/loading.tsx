export default function CarregandoClientes() {
  return (
    <div
      className="clientes-area mx-auto max-w-6xl space-y-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-sm font-semibold text-carvao">Carregando cadastros…</p>
      <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse">
        <div className="h-10 w-3/4 max-w-md rounded-lg bg-papel-3" />
        <div className="h-12 rounded-lg border border-areia bg-branco" />
        <div className="divide-y divide-areia overflow-hidden rounded-xl border border-areia bg-branco">
          {[0, 1, 2, 3].map((linha) => (
            <div key={linha} className="space-y-3 p-5">
              <div className="h-5 w-2/3 max-w-xs rounded bg-papel-3" />
              <div className="h-4 w-1/2 max-w-48 rounded bg-papel-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
