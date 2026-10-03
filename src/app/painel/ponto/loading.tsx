export default function CarregandoPonto() {
  return <div role="status" className="space-y-5 rounded-xl border border-areia bg-papel p-6"><p className="text-xl font-bold">Carregando o ponto…</p><div className="h-24 rounded-lg bg-papel-2 motion-safe:animate-pulse" /><div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-28 rounded-lg bg-papel-2 motion-safe:animate-pulse" />)}</div></div>
}
