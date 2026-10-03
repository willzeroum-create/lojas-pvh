import { MessageCircle, Phone } from 'lucide-react'
import type { Loja } from '@/lib/dados/lojas'
import type { TenantPublico } from '@/lib/dados/tenants'
import { enderecoVazio, formatarEndereco } from '@/lib/dominio/endereco'
import { formatarTelefone } from '@/lib/dominio/telefone'
import { Iniciais } from './cabecalho-loja'

/**
 * Versão reduzida: tenant suspenso ou sem loja configurada. A página nunca
 * cai (brief §9): mostra nome, telefone e endereço.
 */
export function PaginaReduzida({ tenant, loja }: { tenant: TenantPublico; loja: Loja | null }) {
  const endereco = loja && !enderecoVazio(loja.endereco) ? loja.endereco : tenant.endereco
  const telefone = tenant.telefone ?? tenant.whatsapp
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <Iniciais nome={tenant.nome_fantasia} className="size-20 text-2xl" />
      <h1 className="mt-5 text-3xl font-bold">{tenant.nome_fantasia}</h1>
      {!enderecoVazio(endereco) && <p className="mt-2 text-carvao">{formatarEndereco(endereco)}</p>}
      <p className="mt-6 text-sm text-cinza">
        O cardápio online está temporariamente indisponível. Peça pelo telefone ou WhatsApp.
      </p>
      <div className="mt-6 flex w-full flex-col gap-3">
        <a
          href={`https://wa.me/${tenant.whatsapp}`}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-verde font-semibold text-branco"
        >
          <MessageCircle className="size-4" aria-hidden /> WhatsApp
        </a>
        {telefone && (
          <a
            href={`tel:+${telefone.length <= 11 ? '55' + telefone : telefone}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco font-semibold text-tinta"
          >
            <Phone className="size-4" aria-hidden /> {formatarTelefone(telefone)}
          </a>
        )}
      </div>
    </main>
  )
}
