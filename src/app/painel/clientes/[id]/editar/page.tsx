import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { obterFichaPessoa } from '@/lib/dados/clientes'
import { FormularioPessoa } from '../../_components/formulario-pessoa'

export const metadata: Metadata = { title: 'Editar cadastro' }

export default async function EditarCliente({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, tenantId } = await exigirModulo('clientes')
  const { id } = await params
  const ficha = await obterFichaPessoa(supabase, tenantId, id)
  if (!ficha) notFound()

  return (
    <div className="clientes-area mx-auto max-w-5xl pb-4">
      <Link
        href={`/painel/clientes/${id}`}
        className="mb-5 inline-flex min-h-12 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-carvao hover:text-tinta"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Voltar à ficha
      </Link>
      <header className="mb-7">
        <p className="mb-2 text-xs font-extrabold tracking-[0.16em] text-carvao uppercase">Editar cadastro</p>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight break-words sm:text-4xl">
          {ficha.pessoa.nome}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-carvao">
          Mantenha os contatos e as preferências em dia para o próximo atendimento.
        </p>
      </header>
      {ficha.pessoa.anonimizado_em ? (
        <div className="rounded-2xl border border-areia bg-papel-2 p-6">
          <h2 className="font-sans text-lg font-bold">Este cadastro foi anonimizado</h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            Os dados pessoais foram removidos e não podem ser editados. Os pedidos continuam disponíveis na
            ficha.
          </p>
        </div>
      ) : (
        <FormularioPessoa
          key={ficha.pessoa.id}
          pessoa={ficha.pessoa}
          enderecoPrincipal={ficha.enderecos.find((endereco) => endereco.principal)}
          consentimentoMarketing={ficha.consentimentos.marketing}
        />
      )}
    </div>
  )
}
