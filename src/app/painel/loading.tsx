/** Esqueleto das páginas do painel enquanto os dados chegam. */
export default function CarregandoPainel() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse" aria-busy>
      <div className="h-8 w-40 rounded bg-papel-3" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-lg bg-papel-3" />
        ))}
      </div>
    </div>
  )
}
