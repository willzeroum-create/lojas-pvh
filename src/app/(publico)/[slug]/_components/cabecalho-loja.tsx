import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import type { Loja } from '@/lib/dados/lojas'
import type { TenantPublico } from '@/lib/dados/tenants'
import { enderecoVazio, formatarEndereco } from '@/lib/dominio/endereco'
import type { EstadoLoja } from '@/lib/dominio/horario'
import { cn } from '@/lib/utils/cn'

export function Iniciais({ nome, className }: { nome: string; className?: string }) {
  const letras = nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-marca font-display font-bold text-branco',
        className,
      )}
      aria-hidden
    >
      {letras}
    </div>
  )
}

export function PastilhaEstado({ estado }: { estado: EstadoLoja }) {
  if (estado.aberta) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-verde-clara px-2.5 py-1 text-xs font-bold text-verde">
        <span className="size-1.5 rounded-full bg-verde" /> Aberto · fecha às {estado.fechaAs}
      </span>
    )
  }
  const detalhe =
    estado.motivo === 'fechada_manualmente'
      ? 'fechado agora'
      : estado.motivo === 'sem_horario'
        ? 'horário não informado'
        : estado.abreAs
          ? `abre ${estado.abreAs}`
          : ''
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-papel-3 px-2.5 py-1 text-xs font-bold text-carvao">
      <span className="size-1.5 rounded-full bg-nevoa" /> Fechado{detalhe && ` · ${detalhe}`}
    </span>
  )
}

export function CabecalhoLoja({
  tenant,
  loja,
  estado,
}: {
  tenant: TenantPublico
  loja: Loja
  estado: EstadoLoja
}) {
  const endereco = enderecoVazio(loja.endereco) ? tenant.endereco : loja.endereco
  return (
    <header className="relative overflow-hidden">
      {/* Faixa de cor do tenant, suave, atrás do cabeçalho. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-marca opacity-[0.12]" aria-hidden />
      <div className="mx-auto max-w-2xl px-5 pt-10 pb-5">
        <div className="flex items-end gap-4">
          {tenant.logo_url ? (
            <Image
              src={tenant.logo_url}
              alt=""
              width={80}
              height={80}
              priority
              className="size-20 rounded-full border-4 border-papel object-cover shadow-cartao"
            />
          ) : (
            <Iniciais
              nome={tenant.nome_fantasia}
              className="size-20 border-4 border-papel text-2xl shadow-cartao"
            />
          )}
          <div className="min-w-0 pb-1">
            <h1 className="text-[1.7rem] leading-tight font-bold tracking-tight">{tenant.nome_fantasia}</h1>
            <div className="mt-1.5">
              <PastilhaEstado estado={estado} />
            </div>
          </div>
        </div>
        {!enderecoVazio(endereco) && <p className="mt-4 text-sm text-carvao">{formatarEndereco(endereco)}</p>}
        <a
          href={`https://wa.me/${tenant.whatsapp}`}
          className="mt-4 inline-flex h-11 items-center gap-2 rounded-full border border-verde/30 bg-verde-clara px-4 text-sm font-bold text-verde"
        >
          <MessageCircle className="size-4" aria-hidden />
          Chamar no WhatsApp
        </a>
      </div>
    </header>
  )
}
