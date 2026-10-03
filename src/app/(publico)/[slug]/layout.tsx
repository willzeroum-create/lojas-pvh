import { notFound } from 'next/navigation'
import { tenantPublicoDoSlug } from './_dados'

/**
 * Decide o 404 antes de a página começar a ser enviada. Como a página tem
 * um esqueleto (`loading.tsx`), se a decisão ficasse lá dentro o servidor já
 * teria respondido 200 quando descobrisse que o slug não existe.
 */
export default async function LayoutLoja(props: LayoutProps<'/[slug]'>) {
  const { slug } = await props.params
  if (!(await tenantPublicoDoSlug(slug))) notFound()
  return props.children
}
