'use client'

export default function ErroPdv({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <section role="alert" className="pdv-area rounded-xl border border-areia bg-branco p-6">
      <h1 className="text-2xl font-bold">Não foi possível carregar o PDV</h1>
      <p className="mt-2 text-carvao">
        Verifique a conexão e tente novamente para consultar o caixa e os produtos.
      </p>
      <button type="button" onClick={retry} className="pdv-botao pdv-primario mt-5">
        Tentar novamente
      </button>
    </section>
  )
}
