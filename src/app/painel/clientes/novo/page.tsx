import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { FormularioPessoa } from '../_components/formulario-pessoa'

export const metadata: Metadata = { title: 'Novo cadastro' }

export default async function NovoCliente() {
  await exigirModulo('clientes')

  return (
    <div className="clientes-area mx-auto max-w-5xl pb-4">
      <Link
        href="/painel/clientes"
        className="mb-5 inline-flex min-h-12 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-carvao hover:text-tinta"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Clientes e fornecedores
      </Link>
      <header className="mb-7">
        <p className="mb-2 text-xs font-extrabold tracking-[0.16em] text-carvao uppercase">Novo cadastro</p>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight sm:text-4xl">
          Novo cliente ou fornecedor
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-carvao">
          Cadastre um cliente, um fornecedor ou os dois. Nome e papel no negócio são obrigatórios.
        </p>
      </header>
      <FormularioPessoa />
    </div>
  )
}
