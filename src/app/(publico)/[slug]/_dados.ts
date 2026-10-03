import { cache } from 'react'
import { obterTenantPublicoPorSlug } from '@/lib/dados/tenants'
import { clienteAnonimo } from '@/lib/supabase/server'

/**
 * O tenant da página pública, lido uma vez por pedido e partilhado entre o
 * layout (que decide o 404), os metadados e a página.
 */
export const tenantPublicoDoSlug = cache((slug: string) => obterTenantPublicoPorSlug(clienteAnonimo(), slug))
