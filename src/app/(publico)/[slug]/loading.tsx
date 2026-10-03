/** Esqueleto da página pública enquanto o cardápio chega. */
export default function Carregando() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-5 pt-8" aria-busy>
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-papel-3" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-2/3 rounded bg-papel-3" />
          <div className="h-4 w-1/3 rounded bg-papel-3" />
        </div>
      </div>
      <div className="mt-8 flex gap-2">
        {[80, 96, 72].map((w) => (
          <div key={w} className="h-10 rounded-full bg-papel-3" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-8 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-1/2 rounded bg-papel-3" />
              <div className="h-4 w-4/5 rounded bg-papel-3" />
              <div className="h-4 w-1/4 rounded bg-papel-3" />
            </div>
            <div className="size-22 rounded-lg bg-papel-3" />
          </div>
        ))}
      </div>
    </div>
  )
}
