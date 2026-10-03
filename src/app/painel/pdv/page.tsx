import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { caixaAberto } from '@/lib/dados/caixa'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { produtosDoPdv, vendasDoCaixa } from '@/lib/dados/pdv'
import { AbrirCaixa } from '../caixa/_components/abrir-caixa'
import { FrenteDeCaixa } from './_components/frente-de-caixa'

export const metadata: Metadata = { title: 'Frente de caixa' }

export default async function PaginaPdv() {
  const { supabase, tenantId, sessao, modulos } = await exigirModulo('pdv')
  await exigirModulo('caixa')
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja)
    return (
      <section className="pdv-area rounded-xl border border-areia bg-branco p-6">
        <h1 className="text-2xl font-bold">Não foi possível localizar a loja</h1>
        <p className="mt-2 text-carvao">Confira a conexão e o cadastro da loja para iniciar o atendimento.</p>
        <Link href="/painel/loja" className="pdv-botao mt-5">
          Ir para a loja
        </Link>
      </section>
    )
  const caixa = await caixaAberto(supabase, tenantId, loja.id)
  if (!caixa)
    return (
      <div className="caixa-area">
        <AbrirCaixa
          titulo="Abra o caixa para vender"
          descricao="Informe o dinheiro disponível para troco no início do atendimento."
        />
      </div>
    )
  const [produtos, vendas] = await Promise.all([
    produtosDoPdv(supabase, tenantId),
    vendasDoCaixa(supabase, tenantId, caixa.sessao.id),
  ])
  return (
    <FrenteDeCaixa
      key={caixa.sessao.id}
      produtos={produtos}
      vendas={vendas}
      lojaNome={loja.nome}
      operador={sessao.operador?.nome ?? sessao.email ?? 'Operador'}
      pixAtivo={modulos.has('bancos')}
    />
  )
}
