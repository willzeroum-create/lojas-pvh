import { MapPin } from 'lucide-react'
import { MARCA } from '@/lib/config/marca'
import type { Loja } from '@/lib/dados/lojas'
import type { TenantPublico } from '@/lib/dados/tenants'
import { enderecoVazio, formatarEndereco, urlMapa } from '@/lib/dominio/endereco'
import { horariosPorDia } from '@/lib/dominio/horario'

export function RodapeLoja({ tenant, loja }: { tenant: TenantPublico; loja: Loja }) {
  const endereco = enderecoVazio(loja.endereco) ? tenant.endereco : loja.endereco
  const tabela = horariosPorDia(loja.horarios)
  const hoje = new Date().getDay()

  return (
    <footer className="mx-auto max-w-2xl px-5 pt-10 pb-36">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        {!enderecoVazio(endereco) && (
          <section>
            <h2 className="text-lg font-bold">Endereço</h2>
            <p className="mt-2 text-carvao">{formatarEndereco(endereco)}</p>
            {endereco.referencia && <p className="text-sm text-cinza">Ref.: {endereco.referencia}</p>}
            <a
              href={urlMapa(endereco)}
              target="_blank"
              rel="noopener"
              className="mt-3 inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-carvao underline underline-offset-4"
            >
              <MapPin className="size-4" aria-hidden /> Abrir no mapa
            </a>
          </section>
        )}
        <section>
          <h2 className="text-lg font-bold">Horário</h2>
          <table className="mt-2 w-full text-sm">
            <tbody>
              {tabela.map((d) => (
                <tr key={d.dia} className={d.dia === hoje ? 'font-bold text-tinta' : 'text-carvao'}>
                  <th scope="row" className="font-inherit py-1 pr-4 text-left capitalize">
                    {d.nome}
                  </th>
                  <td className="py-1 tabular-nums">
                    {d.intervalos.length ? d.intervalos.join(' · ') : 'Fechado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <p className="mt-12 text-center text-xs text-nevoa">Cardápio digital por {MARCA.nome}</p>
    </footer>
  )
}
