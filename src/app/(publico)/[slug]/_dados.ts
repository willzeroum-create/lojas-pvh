import { cache } from 'react'
import { obterTenantPublicoPorSlug } from '@/lib/dados/tenants'
import { slugValido } from '@/lib/dominio/slug'
import { clienteAnonimo } from '@/lib/supabase/server'

/**
 * O tenant da página pública, lido uma vez por pedido e partilhado entre o
 * layout (que decide o 404), os metadados e a página.
 *
 * Um endereço que nunca pode ser slug (ex.: `/favicon.ico`, que o browser pede
 * em cada visita) dá 404 sem ir à base.
 */
export const tenantPublicoDoSlug = cache(async (slug: string) =>
  slugValido(slug) ? obterTenantPublicoPorSlug(clienteAnonimo(), slug) : null,
)
