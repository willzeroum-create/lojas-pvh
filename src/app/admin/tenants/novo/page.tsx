import type { Metadata } from 'next'
import { FormularioNovoTenant } from './formulario'

export const metadata: Metadata = { title: 'Novo tenant' }

export default function PaginaNovoTenant() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Novo tenant</h1>
      <p className="mt-1 text-sm text-cinza">
        Cria a conta, a loja principal, o checklist de onboarding e o acesso do dono. Leva um minuto.
      </p>
      <FormularioNovoTenant />
    </div>
  )
}
