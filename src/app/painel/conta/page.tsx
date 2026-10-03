import { ExternalLink, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UploadFoto } from '@/components/upload-foto'
import { Botao } from '@/components/ui/botao'
import { exigirPainel } from '@/lib/auth/guardas'
import { MARCA, urlPublica } from '@/lib/config/marca'
import { obterTenant } from '@/lib/dados/tenants'
import type { Endereco } from '@/lib/dominio/endereco'
import { nomeDeUtilizador } from '@/lib/dominio/identificador'
import { FormularioConta } from './_components/formulario-conta'
import { guardarLogo } from './actions'

export const metadata: Metadata = { title: 'Conta' }

function dataPt(iso: string | null) {
  return iso
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${iso}T12:00:00`))
    : '—'
}

export default async function PaginaConta() {
  const { supabase, tenantId, sessao } = await exigirPainel()
  const tenant = await obterTenant(supabase, tenantId)
  if (!tenant) notFound()
  const link = urlPublica(tenant.slug)

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <h1 className="text-2xl font-bold">Conta</h1>

      <section className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao">
        <p className="text-xs font-bold tracking-wider text-cinza uppercase">Sua página</p>
        <a
          href={link}
          target="_blank"
          rel="noopener"
          className="mt-1 inline-flex min-h-10 items-center gap-1.5 font-semibold break-all underline underline-offset-4"
        >
          {link.replace(/^https?:\/\//, '')} <ExternalLink className="size-4 shrink-0" />
        </a>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-cinza">Plano</dt>
            <dd className="font-semibold capitalize">{tenant.plano}</dd>
          </div>
          <div>
            <dt className="text-cinza">Renovação</dt>
            <dd className="font-semibold">{dataPt(tenant.renovacao_em)}</dd>
          </div>
        </dl>
      </section>

      <UploadFoto
        caminho={`${tenantId}/logo.webp`}
        urlAtual={tenant.logo_url}
        onGuardar={guardarLogo}
        formato="redondo"
        rotulo="Logo"
      />

      <FormularioConta tenant={{ ...tenant, endereco: (tenant.endereco ?? {}) as Endereco }} />

      <section className="flex flex-col gap-3 border-t border-areia pt-6">
        {MARCA.whatsappSuporte && (
          <a
            href={`https://wa.me/${MARCA.whatsappSuporte}`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-verde-clara font-semibold text-verde"
          >
            <MessageCircle className="size-4" /> Suporte pelo WhatsApp
          </a>
        )}
        <form action="/sair" method="post">
          <Botao type="submit" variante="secundario" cheio>
            Sair{sessao.email ? ` (${nomeDeUtilizador(sessao.email)})` : ''}
          </Botao>
        </form>
      </section>
    </div>
  )
}
