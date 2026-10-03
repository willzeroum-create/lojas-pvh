import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Etiqueta } from '@/components/ui/etiqueta'
import { exigirConsole } from '@/lib/auth/guardas'
import { ROTULO_ESTADO, TOM_ESTADO } from '@/lib/cadeia/estados'
import { frenteDoModelo } from '@/lib/cadeia/modelo'
import { listarEtapasAbertas } from '@/lib/dados/holding'
import { cn } from '@/lib/utils/cn'

export const metadata: Metadata = { title: 'Cadeia de produção' }

function dataCurta(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(
    new Date(`${iso}T12:00:00`),
  )
}

/** O que a equipa tem em mãos em todas as empresas: pendente e em curso, com prazos. É a janela por trás de "Etapas em aberto". */
export default async function PaginaCadeiaHolding() {
  const { supabase } = await exigirConsole()
  const grupos = await listarEtapasAbertas(supabase)
  const hoje = new Date().toISOString().slice(0, 10)
  const totalAbertas = grupos.reduce((n, g) => n + g.etapas.length, 0)
  const totalPorAvaliar = grupos.reduce((n, g) => n + g.porAvaliar, 0)

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Cadeia de produção</h1>
        <p className="text-sm text-cinza">
          {totalAbertas} etapa{totalAbertas === 1 ? '' : 's'} em aberto em{' '}
          {grupos.filter((g) => g.etapas.length).length} empresa
          {grupos.filter((g) => g.etapas.length).length === 1 ? '' : 's'} · {totalPorAvaliar} por avaliar
        </p>
      </header>

      {grupos.length === 0 && (
        <div className="rounded-lg border border-dashed border-areia px-6 py-14 text-center text-carvao">
          <p className="text-lg font-semibold">Nada em aberto</p>
          <p className="mt-1 text-sm">
            Quando uma etapa ficar pendente ou em curso em qualquer empresa, aparece aqui.
          </p>
        </div>
      )}

      {grupos.map((g) => (
        <section key={g.tenantId} className="rounded-lg border border-areia/70 bg-branco shadow-cartao">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia/60 px-4 py-3">
            <Link
              href={`/admin/tenants/${g.tenantId}/cadeia`}
              className="inline-flex min-h-10 items-center font-display text-lg font-bold hover:underline"
            >
              {g.nome}
            </Link>
            <p className="text-sm text-cinza">
              {g.etapas.length} em aberto · {g.porAvaliar} por avaliar
            </p>
          </header>
          {g.etapas.length === 0 ? (
            <p className="px-4 py-3 text-sm text-cinza">Só falta avaliar.</p>
          ) : (
            <ul className="divide-y divide-areia/60">
              {g.etapas.map((e) => {
                const atrasada = e.prevista_em !== null && e.prevista_em < hoje
                return (
                  <li key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-2.5">
                    <Etiqueta tom={TOM_ESTADO[e.estado]}>{ROTULO_ESTADO[e.estado]}</Etiqueta>
                    <Link
                      href={`/admin/tenants/${g.tenantId}/cadeia#${e.frente}`}
                      className="min-w-0 flex-1 hover:underline"
                    >
                      <span className="font-semibold">{e.titulo}</span>
                      <span className="text-sm text-cinza">
                        {' '}
                        · {frenteDoModelo(e.frente)?.titulo ?? e.frente}
                      </span>
                    </Link>
                    {e.responsavel && <span className="text-sm text-carvao">{e.responsavel}</span>}
                    {e.prevista_em && (
                      <span
                        className={cn(
                          'text-sm tabular-nums',
                          atrasada ? 'font-bold text-vermelho' : 'text-cinza',
                        )}
                      >
                        {atrasada ? 'atrasada · ' : ''}
                        {dataCurta(e.prevista_em)}
                      </span>
                    )}
                    {e.url && (
                      <a
                        href={e.url}
                        target="_blank"
                        rel="noopener"
                        aria-label="Abrir link"
                        className="text-cinza hover:text-tinta"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
