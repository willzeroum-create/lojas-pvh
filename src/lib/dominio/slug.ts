/**
 * O slug é o endereço público do comerciante: `/{slug}`. Tem de ser estável,
 * legível e nunca colidir com rotas da aplicação.
 */

/** Rotas de primeiro nível da aplicação. Um tenant nunca pode ter estes slugs. */
export const SLUGS_RESERVADOS = new Set([
  'admin',
  'painel',
  'entrar',
  'entrega',
  'entregador',
  'sair',
  'api',
  'app',
  'static',
  'assets',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'suporte',
  'ajuda',
  'termos',
  'privacidade',
])

/** Espelha a restrição SQL em `tenants.slug`: minúsculas, dígitos e hífens, 3 a 50 caracteres. */
const FORMATO_SLUG = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/

export function slugValido(slug: string): boolean {
  return FORMATO_SLUG.test(slug) && !SLUGS_RESERVADOS.has(slug)
}

/** "Lanchonete da Praça" → "lanchonete-da-praca". */
export function gerarSlug(nome: string): string {
  const base = nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 50)
    .replace(/-+$/g, '')
  return base.length >= 3 ? base : base.padEnd(3, '0')
}
