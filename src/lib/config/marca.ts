/**
 * Identidade da plataforma. O nome do produto ainda está por definir (brief
 * §0); muda-se aqui e propaga-se a todo o lado.
 */
export const MARCA = {
  nome: 'PVH',
  descricao: 'Cardápio digital com pedido por WhatsApp para o pequeno comerciante.',
  /** WhatsApp do suporte, só dígitos com DDI. Aparece no ecrã "Conta" do painel. */
  whatsappSuporte: process.env.NEXT_PUBLIC_WHATSAPP_SUPORTE ?? '',
} as const

/**
 * Endereço público da plataforma. Na Vercel, sem `NEXT_PUBLIC_URL_BASE`
 * definido, usa o domínio de produção do projecto que a própria Vercel
 * fornece; no computador, o localhost.
 */
export function urlBase(): string {
  const configurado = process.env.NEXT_PUBLIC_URL_BASE
  if (configurado) return configurado.replace(/\/$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

export function urlPublica(slug: string): string {
  return `${urlBase()}/${slug}`
}
