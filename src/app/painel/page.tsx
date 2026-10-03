import { redirect } from 'next/navigation'
import { exigirPainel } from '@/lib/auth/guardas'
import { separadoresDoPainel } from '@/lib/modulos/catalogo'

/** O início do painel é o primeiro separador dos módulos ligados (Loja e Conta estão sempre). */
export default async function Painel() {
  const { modulos } = await exigirPainel()
  redirect(separadoresDoPainel(modulos)[0]?.href ?? '/painel/conta')
}
