import Link from 'next/link'
import { BOTAO_ENTRADA } from '../_components/apresentacao'

export default function EntradaNaoEncontrada() {
  return (
    <div className="space-y-4 rounded-xl border border-areia bg-branco p-6">
      <h1 className="text-2xl font-bold">Entrada não encontrada</h1>
      <p className="text-sm text-carvao">Confira o endereço ou abra a entrada pela lista do seu estoque.</p>
      <Link href="/painel/estoque/entradas" className={BOTAO_ENTRADA}>
        Voltar às entradas
      </Link>
    </div>
  )
}
