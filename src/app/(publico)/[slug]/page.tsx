import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { apenasDisponiveis } from '@/lib/canais/cardapio'
import { obterCatalogo } from '@/lib/dados/cardapio'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { moduloLigado } from '@/lib/dados/modulos'
import { estadoLoja } from '@/lib/dominio/horario'
import { clienteAnonimo } from '@/lib/supabase/server'
import { CabecalhoLoja } from './_components/cabecalho-loja'
import { LojaInterativa } from './_components/loja-interativa'
import { PaginaReduzida } from './_components/pagina-reduzida'
import { RodapeLoja } from './_components/rodape-loja'
import { tenantPublicoDoSlug } from './_dados'

/**
 * A página do comerciante. Dinâmica de propósito: um produto marcado como
 * esgotado no painel desaparece daqui no pedido seguinte (critério 4).
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata(props: PageProps<'/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const tenant = await tenantPublicoDoSlug(slug)
  if (!tenant) return { title: 'Não encontrado' }
  return {
    title: { absolute: `${tenant.nome_fantasia} · Cardápio` },
    description: `Veja o cardápio de ${tenant.nome_fantasia} e faça seu pedido pelo WhatsApp.`,
    robots: tenant.status === 'ativo' ? undefined : { index: false, follow: false },
    openGraph: { title: tenant.nome_fantasia, images: tenant.logo_url ? [tenant.logo_url] : undefined },
  }
}

export default async function PaginaPublica(props: PageProps<'/[slug]'>) {
  const { slug } = await props.params
  const tenant = await tenantPublicoDoSlug(slug)
  if (!tenant) notFound()

  const supabase = clienteAnonimo()
  const [loja, catalogo, comCardapio] = await Promise.all([
    obterLojaPrincipal(supabase, tenant.id),
    obterCatalogo(supabase, tenant.id),
    moduloLigado(supabase, tenant.id, 'cardapio'),
  ])

  // Sem o módulo do cardápio (ou suspensa) a empresa continua encontrável: nome, contacto e endereço.
  if (tenant.status === 'suspenso' || !loja || !comCardapio) {
    return <PaginaReduzida tenant={tenant} loja={loja} />
  }

  const estado = estadoLoja(loja, new Date())
  const visivel = apenasDisponiveis(catalogo)

  return (
    <div
      style={tenant.cor_marca ? ({ '--cor-marca': tenant.cor_marca } as React.CSSProperties) : undefined}
      className="min-h-dvh"
    >
      <CabecalhoLoja tenant={tenant} loja={loja} estado={estado} />
      <LojaInterativa
        tenant={{
          id: tenant.id,
          slug: tenant.slug,
          nome_fantasia: tenant.nome_fantasia,
          whatsapp: tenant.whatsapp,
        }}
        loja={{
          id: loja.id,
          taxaEntrega: loja.taxa_entrega,
          pedidoMinimo: loja.pedido_minimo,
          aceitaEntrega: loja.aceita_entrega,
          aceitaRetirada: loja.aceita_retirada,
        }}
        catalogo={visivel}
        aberta={estado.aberta}
      />
      <RodapeLoja tenant={tenant} loja={loja} />
    </div>
  )
}
