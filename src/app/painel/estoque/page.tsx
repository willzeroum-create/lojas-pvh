import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { listarItensEstoque, resumirEstoque } from '@/lib/dados/estoque'
import { formatarBRL } from '@/lib/dominio/moeda'
import { CabecalhoEstoque, PRIMARIO } from './_components/apresentacao'
import { ListaEstoque } from './_components/lista-estoque'

export default async function PaginaEstoque() {
  const ctx = await exigirModulo('estoque')
  const producao = ctx.modulos.has('producao')
  const itens = (await listarItensEstoque(ctx.supabase, ctx.tenantId)).filter(
    (item) => producao || item.tipo === 'produto',
  )
  const resumo = resumirEstoque(itens)
  return (
    <>
      <CabecalhoEstoque
        titulo="Estoque sob controle"
        descricao="O que está na prateleira, o que precisa chegar e cada movimento registrado."
      >
        <Link href="/painel/estoque/entradas/nova" className={PRIMARIO}>
          Entrada de nota
        </Link>
      </CabecalhoEstoque>
      <section aria-label="Situação do estoque" className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-tinta p-5 text-papel">
          <p className="text-sm">Valor do estoque</p>
          <p className="mt-3 text-3xl font-bold tabular-nums">{formatarBRL(resumo.valorTotal)}</p>
          <p className="mt-2 text-sm text-areia">{resumo.itens} itens controlados · custo médio</p>
        </div>
        <div className="rounded-xl border border-ambar/40 bg-ambar-clara p-5 text-[#805000]">
          <p className="text-sm font-bold">No mínimo ou abaixo</p>
          <p className="mt-3 text-4xl font-bold tabular-nums">{resumo.abaixoDoMinimo}</p>
          <p className="mt-2 text-sm">Confira o que precisa repor.</p>
        </div>
        <div className="rounded-xl border border-vermelho/30 bg-vermelho-clara p-5 text-vermelho">
          <p className="text-sm font-bold">Zerados ou negativos</p>
          <p className="mt-3 text-4xl font-bold tabular-nums">{resumo.zerados}</p>
          <p className="mt-2 text-sm">Prioridade na próxima entrada.</p>
        </div>
      </section>
      <ListaEstoque itens={itens} producao={producao} />
    </>
  )
}
