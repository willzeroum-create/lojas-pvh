import { sairDaImpersonacao } from '@/app/admin/actions'

export function BannerImpersonacao({ nome }: { nome: string }) {
  return (
    <form
      action={sairDaImpersonacao}
      className="flex items-center justify-between gap-3 bg-tinta px-4 py-2 text-sm text-papel"
    >
      <p>
        Operando como <strong>{nome}</strong>
      </p>
      <button
        type="submit"
        className="h-10 shrink-0 rounded-md bg-papel/15 px-3 font-semibold hover:bg-papel/25"
      >
        Voltar ao console
      </button>
    </form>
  )
}
