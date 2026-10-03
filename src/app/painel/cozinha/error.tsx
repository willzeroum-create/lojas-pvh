'use client'

export default function ErroCozinha({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="rounded-xl bg-tinta p-6 text-papel sm:p-8">
      <p className="text-xs font-bold tracking-widest text-areia uppercase">Cozinha</p>
      <h1 className="mt-3 text-2xl font-bold">Não foi possível carregar a cozinha</h1>
      <p className="mt-3 max-w-xl text-areia">
        Confira a conexão e tente novamente. Se acabou de atualizar ou cancelar um item, confira seu estado
        antes de repetir.
      </p>
      <button type="button" onClick={retry} className="cozinha-botao mt-6">
        Tentar novamente
      </button>
    </section>
  )
}
