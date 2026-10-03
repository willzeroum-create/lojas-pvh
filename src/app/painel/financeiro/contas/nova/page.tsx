import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarPessoas } from '@/lib/dados/clientes'
import { garantirFinanceiroPadrao, listarCarteiras, listarCategorias } from '@/lib/dados/financeiro'
import { FormularioConta } from '../../_components/formulario-conta'

export const metadata: Metadata = { title: 'Nova conta · Financeiro' }

export default async function NovaConta({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ supabase, tenantId }, parametros] = await Promise.all([exigirModulo('financeiro'), searchParams])
  const tipo = parametros.tipo === 'pagar' ? 'pagar' : 'receber'
  const busca = typeof parametros.busca === 'string' ? parametros.busca.trim().slice(0, 100) : ''
  const papel = tipo === 'receber' ? 'clientes' : 'fornecedores'
  const pessoasPendentes = listarPessoas(supabase, tenantId, { papel, busca, pagina: 1 })
    .then((resultado) => ({ ...resultado, indisponivel: false }))
    .catch(() => ({ itens: [], total: 0, indisponivel: true }))

  await garantirFinanceiroPadrao(supabase, tenantId)
  const [carteiras, categorias, pessoas] = await Promise.all([
    listarCarteiras(supabase, tenantId),
    listarCategorias(supabase, tenantId),
    pessoasPendentes,
  ])

  return (
    <div className="mx-auto w-full max-w-5xl min-w-0 pb-4">
      <Link
        href={`/painel/financeiro/${tipo}`}
        className="mb-5 inline-flex min-h-12 items-center gap-2 rounded-lg pr-3 text-sm font-semibold text-carvao hover:text-tinta"
      >
        <ArrowLeft size={18} aria-hidden="true" />
        Contas a {tipo}
      </Link>
      <header className="mb-7">
        <p className="mb-2 text-xs font-extrabold tracking-[0.16em] text-carvao uppercase">Nova conta</p>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight sm:text-4xl">Conta a {tipo}</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-carvao">
          {tipo === 'receber'
            ? 'Registre uma venda ou outro valor que vai entrar no caixa.'
            : 'Registre uma compra ou despesa para acompanhar os próximos pagamentos.'}
        </p>
      </header>
      <FormularioConta
        key={tipo}
        tipo={tipo}
        hoje={new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Porto_Velho' })}
        carteiras={carteiras.filter((carteira) => carteira.ativa)}
        categorias={categorias.filter((categoria) => categoria.ativa && categoria.tipo === tipo)}
        pessoas={pessoas.itens.map(({ id, nome, nome_fantasia }) => ({
          id,
          nome,
          nomeFantasia: nome_fantasia,
        }))}
        totalPessoas={pessoas.total}
        pessoasIndisponiveis={pessoas.indisponivel}
        buscaInicial={busca}
      />
    </div>
  )
}
