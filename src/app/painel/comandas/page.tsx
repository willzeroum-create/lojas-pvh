import type { Metadata } from 'next'
import { exigirModulo } from '@/lib/auth/guardas'
import { comandasAvulsas, mapaDeMesas } from '@/lib/dados/comandas'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { AvisoComanda } from './_components/apresentacao'
import { MapaComandas } from './_components/mapa-comandas'

export const metadata: Metadata = { title: 'Mesas e comandas' }

function instanteDaConsulta() {
  return Date.now()
}

export default async function PaginaComandas() {
  const { supabase, tenantId, modulos } = await exigirModulo('comandas')
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja)
    return (
      <AvisoComanda erro>
        Não foi possível localizar a loja principal. Confira a conexão e o cadastro da loja.
      </AvisoComanda>
    )
  const [mesas, avulsas] = await Promise.all([
    mapaDeMesas(supabase, tenantId, loja.id),
    comandasAvulsas(supabase, tenantId),
  ])
  return (
    <MapaComandas
      mesas={mesas}
      avulsas={avulsas.map(({ id, identificador, pessoas, estado, aberta_em, total }) => ({
        id,
        identificador,
        pessoas,
        estado,
        aberta_em,
        total,
      }))}
      agoraInicial={instanteDaConsulta()}
      temCozinha={modulos.has('cozinha')}
    />
  )
}
