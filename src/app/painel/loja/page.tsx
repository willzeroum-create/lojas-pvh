import type { Metadata } from 'next'
import { PastilhaEstado } from '@/app/(publico)/[slug]/_components/cabecalho-loja'
import { Botao } from '@/components/ui/botao'
import { exigirPainel } from '@/lib/auth/guardas'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { estadoLoja } from '@/lib/dominio/horario'
import { FormularioLoja } from './_components/formulario-loja'
import { fecharLojaAgora, reabrirLoja } from './actions'

export const metadata: Metadata = { title: 'Loja' }

export default async function PaginaLoja() {
  const { supabase, tenantId } = await exigirPainel()
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja) {
    return <p className="text-carvao">Nenhuma loja configurada. Fale com a equipe.</p>
  }
  const estado = estadoLoja(loja, new Date())
  const fechadaManualmente = estado.aberta === false && estado.motivo === 'fechada_manualmente'

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-bold">Loja</h1>

      <section className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold">Agora</p>
          <PastilhaEstado estado={estado} />
        </div>
        <form action={fechadaManualmente ? reabrirLoja : fecharLojaAgora} className="mt-4">
          {fechadaManualmente ? (
            <Botao type="submit" variante="sucesso" tamanho="lg" cheio>
              Reabrir loja
            </Botao>
          ) : (
            <Botao type="submit" variante="perigo" tamanho="lg" cheio>
              Fechar loja agora
            </Botao>
          )}
        </form>
        <p className="mt-2 text-sm text-cinza">
          {fechadaManualmente
            ? 'A loja volta ao horário normal amanhã, ou quando reabrir.'
            : 'Fecha até o fim do dia, ignorando o horário. Útil quando acabou o gás ou a matéria-prima.'}
        </p>
      </section>

      <FormularioLoja loja={loja} />
    </div>
  )
}
