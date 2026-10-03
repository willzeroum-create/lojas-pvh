import { ArrowRight, LockKeyhole } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { exigirModulo } from '@/lib/auth/guardas'
import { caixaAberto } from '@/lib/dados/caixa'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { conferir, FORMAS_RECEBIMENTO } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import type { FormaRecebimento } from '@/lib/dominio/pdv'
import { AbrirCaixa } from './_components/abrir-caixa'
import {
  AvisoCaixa,
  BOTAO_CAIXA,
  dataCaixa,
  EstadoDoCaixa,
  lerValorCaixa,
  PRIMARIO_CAIXA,
} from './_components/apresentacao'
import { ConfirmarFechamento } from './_components/confirmar-fechamento'
import { ContagemCaixa } from './_components/contagem-caixa'
import { MovimentarCaixa } from './_components/movimentar-caixa'
import { MovimentosCaixa } from './_components/movimentos-caixa'

export const metadata: Metadata = { title: 'Caixa' }

export default async function PaginaCaixa({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { supabase, tenantId, modulos } = await exigirModulo('caixa')
  const parametros = await searchParams
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja)
    return (
      <AvisoCaixa erro>
        Não foi possível localizar a loja principal. Atualize a página ou peça à equipe responsável para
        verificar o cadastro e a conexão.
      </AvisoCaixa>
    )
  const atual = await caixaAberto(supabase, tenantId, loja.id)

  if (!atual)
    return (
      <div className="space-y-4">
        {parametros.etapa && (
          <AvisoCaixa>
            Não foi possível localizar um caixa aberto para este fechamento. Consulte o histórico para
            verificar a situação do turno.
          </AvisoCaixa>
        )}
        <AbrirCaixa />
      </div>
    )

  if (parametros.etapa === 'contagem' || parametros.etapa === 'conferencia') {
    if (parametros.etapa === 'conferencia') {
      // O esperado permanece apenas no servidor até as cinco contagens serem informadas.
      const informado = {} as Record<FormaRecebimento, number>
      let valido = parametros.sessao === atual.sessao.id
      for (const forma of FORMAS_RECEBIMENTO) {
        const texto = parametros[forma]
        const valor = typeof texto === 'string' ? lerValorCaixa(texto) : null
        if (valor === null) valido = false
        else informado[forma] = valor
      }
      if (valido)
        return (
          <ConfirmarFechamento
            key={`${atual.sessao.id}-${FORMAS_RECEBIMENTO.map((forma) => informado[forma]).join('-')}`}
            sessaoId={atual.sessao.id}
            informado={informado}
            conferencia={conferir(atual.esperado, informado)}
          />
        )
      return (
        <ContagemCaixa
          sessaoId={atual.sessao.id}
          erroInicial={
            parametros.sessao !== atual.sessao.id
              ? 'O caixa aberto mudou. Conte os valores deste caixa antes de continuar.'
              : 'Preencha um valor válido em todas as formas para conferir. Onde não houve recebimento, digite 0.'
          }
        />
      )
    }
    return <ContagemCaixa sessaoId={atual.sessao.id} />
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Seu negócio / Caixa
          </p>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">O turno, sob controle.</h1>
          <p className="mt-2 text-sm text-carvao">Vendas, entradas e retiradas em um só lugar.</p>
        </div>
        <EstadoDoCaixa estado={atual.sessao.estado} />
      </header>
      <section
        aria-label="Resumo do caixa aberto"
        className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
      >
        <div className="rounded-xl bg-tinta p-5 text-papel sm:p-6">
          <p className="text-sm font-semibold">Total vendido neste caixa</p>
          <p className="mt-3 text-4xl leading-tight font-bold tracking-tight tabular-nums sm:text-5xl">
            {formatarBRL(atual.vendas.total)}
          </p>
          <p className="mt-4 text-sm text-papel-3">
            {atual.vendas.quantidade} {atual.vendas.quantidade === 1 ? 'venda' : 'vendas'} · cancelamentos
            descontados
          </p>
          {modulos.has('pdv') && (
            <Link href="/painel/pdv" className={`${PRIMARIO_CAIXA} mt-5`}>
              Continuar vendendo
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </div>
        <dl className="grid gap-5 rounded-xl border border-areia bg-branco p-5 sm:p-6">
          <div>
            <dt className="text-xs font-bold tracking-wider text-carvao uppercase">Operador</dt>
            <dd className="mt-1 text-lg font-bold break-words">{atual.sessao.operador_nome}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wider text-carvao uppercase">
              Aberto em · Porto Velho
            </dt>
            <dd className="mt-1 text-base font-bold tabular-nums">{dataCaixa(atual.sessao.aberta_em)}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wider text-carvao uppercase">Fundo de troco inicial</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">
              {formatarBRL(Number(atual.sessao.fundo_troco))}
            </dd>
          </div>
        </dl>
      </section>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <MovimentarCaixa sessaoId={atual.sessao.id} />
        <section className="rounded-xl border border-areia bg-papel-2/50 p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <LockKeyhole aria-hidden="true" className="size-4" />
            Terminou o turno?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            Conte primeiro; confira depois. O fechamento só acontece com a sua confirmação.
          </p>
          <Link href="/painel/caixa?etapa=contagem" className={`${BOTAO_CAIXA} mt-4 w-full`}>
            Fechar caixa
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </section>
      </div>
      <MovimentosCaixa movimentos={atual.movimentos} />
    </>
  )
}
