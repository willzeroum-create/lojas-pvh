import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { VisaoGeral } from '@/lib/dados/visao-geral'
import { formatarBRL } from '@/lib/dominio/moeda'

function dataCurta(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
    new Date(`${iso}T12:00:00`),
  )
}

/** Um número grande que é também uma porta: clicar abre a lista por trás. */
function Cartao({
  href,
  rotulo,
  valor,
  detalhe,
}: {
  href: string
  rotulo: string
  valor: string
  detalhe: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-carvao hover:shadow-flutuante active:translate-y-0"
    >
      <p className="flex items-center justify-between text-xs font-bold tracking-wider text-cinza uppercase">
        {rotulo}
        <ArrowUpRight className="size-4 text-nevoa transition-colors group-hover:text-tinta" aria-hidden />
      </p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight text-tinta tabular-nums sm:text-4xl">
        {valor}
      </p>
      <p className="mt-1 text-sm text-cinza">{detalhe}</p>
    </Link>
  )
}

/** A vista de holding: números de todas as empresas, no topo do console. Tudo clicável. */
export function ResumoConsole({ visao }: { visao: VisaoGeral }) {
  const { empresas, pedidosHoje, cadeia, renovacoes } = visao
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Cartao
        href="/admin?status=ativo"
        rotulo="Empresas ativas"
        valor={String(empresas.ativo)}
        detalhe={`${empresas.onboarding} em onboarding · ${empresas.suspenso} suspensas`}
      />
      <Cartao
        href="/admin/pedidos"
        rotulo="Pedidos hoje"
        valor={String(pedidosHoje.total)}
        detalhe={`${formatarBRL(pedidosHoje.faturacao)} · ${pedidosHoje.abertos} em aberto`}
      />
      <Cartao
        href="/admin/cadeia"
        rotulo="Etapas em aberto"
        valor={String(cadeia.abertas)}
        detalhe={`${cadeia.porAvaliar} por avaliar em todas as cadeias`}
      />
      <div className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
        <p className="text-xs font-bold tracking-wider text-cinza uppercase">Renovações em 15 dias</p>
        {renovacoes.length === 0 ? (
          <p className="mt-2 text-sm text-cinza">Nenhuma.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {renovacoes.slice(0, 4).map((r) => (
              <li key={r.id} className="flex justify-between gap-2">
                <Link href={`/admin/tenants/${r.id}`} className="truncate font-semibold hover:underline">
                  {r.nome_fantasia}
                </Link>
                <span className={r.atrasada ? 'font-bold text-vermelho' : 'text-carvao'}>
                  {dataCurta(r.renovacao_em)}
                </span>
              </li>
            ))}
            {renovacoes.length > 4 && (
              <li>
                <Link href="/admin?status=ativo" className="text-xs text-cinza hover:underline">
                  + {renovacoes.length - 4} na lista
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
