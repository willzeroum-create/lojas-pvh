import { ArrowLeft, FileCheck2, QrCode } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Etiqueta } from '@/components/ui/etiqueta'
import { Mensagem } from '@/components/ui/mensagem'
import { exigirConsole } from '@/lib/auth/guardas'
import { estadoFiscal, urlAvisoFiscal } from '@/lib/dados/fiscal'
import type { EstadoFiscal } from '@/lib/dados/fiscal'
import { estadoPix, urlAvisoPix } from '@/lib/dados/pix'
import { obterTenant } from '@/lib/dados/tenants'
import type { Cliente } from '@/lib/supabase/server'
import { FormularioFiscal, FormularioPix } from './_components/formularios-integracoes'
import { AtualizarIntegracoes, UrlAviso } from './_components/url-aviso'

export const metadata: Metadata = { title: 'Integrações' }

const ESTADOS = {
  aguardando_credenciais: { texto: 'Aguardando credenciais', tom: 'ambar' },
  em_homologacao: { texto: 'Ambiente de teste', tom: 'ambar' },
  em_producao: { texto: 'Em produção', tom: 'verde' },
  com_erro: { texto: 'Requer atenção', tom: 'vermelho' },
  suspensa: { texto: 'Suspensa', tom: 'neutro' },
} as const

function EstadoIntegracao({ estado }: { estado?: EstadoFiscal['estado'] }) {
  const etiqueta = estado ? ESTADOS[estado] : { texto: 'Não configurada', tom: 'neutro' as const }
  return (
    <Etiqueta tom={etiqueta.tom} ponto>
      {etiqueta.texto}
    </Etiqueta>
  )
}

function CarregandoIntegracao() {
  return (
    <div role="status" aria-live="polite" className="space-y-5 py-5">
      <p className="text-sm text-carvao">Carregando configuração…</p>
      <div aria-hidden className="grid grid-cols-2 gap-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-16 rounded-lg bg-papel-2 motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function FalhaIntegracao({ nome }: { nome: string }) {
  return (
    <div className="space-y-4 py-5">
      <Mensagem tipo="erro">{`Não foi possível carregar ${nome}. Tente novamente.`}</Mensagem>
      <AtualizarIntegracoes />
    </div>
  )
}

async function ConfiguracaoFiscal({ supabase, tenantId }: { supabase: Cliente; tenantId: string }) {
  let estado
  let url
  try {
    estado = await estadoFiscal(supabase, tenantId)
    url = urlAvisoFiscal(tenantId)
  } catch {
    return <FalhaIntegracao nome="a integração fiscal" />
  }

  return (
    <div className="space-y-5 pt-5">
      <EstadoIntegracao estado={estado?.estado} />
      {!estado && <Mensagem>Configure a empresa e o token da Focus para ligar a emissão de NFC-e.</Mensagem>}
      {estado?.ambiente === 'homologacao' && (
        <p className="text-sm font-semibold text-[#8a5806]">Ambiente de teste (sem valor fiscal)</p>
      )}
      {estado?.ultimoErro && <Mensagem tipo="erro">{estado.ultimoErro}</Mensagem>}
      <FormularioFiscal tenantId={tenantId} estado={estado} />
      <div className="space-y-3 border-t border-areia pt-5">
        <h3 className="font-sans text-sm font-bold">Avisos da Focus</h3>
        <p className="text-sm leading-relaxed text-carvao">
          No painel da Focus, abra os gatilhos (webhooks) da empresa e cole esta URL.
        </p>
        <UrlAviso id="url-aviso-fiscal" url={url} nome="Focus" />
      </div>
    </div>
  )
}

async function ConfiguracaoPix({ supabase, tenantId }: { supabase: Cliente; tenantId: string }) {
  let estado
  let url
  try {
    estado = await estadoPix(supabase, tenantId)
    url = estado?.urlAviso ?? urlAvisoPix(tenantId)
  } catch {
    return <FalhaIntegracao nome="a integração Pix" />
  }

  return (
    <div className="space-y-5 pt-5">
      <EstadoIntegracao estado={estado?.estado} />
      {!estado && <Mensagem>Ligue a conta Mercado Pago da empresa para receber por QR Pix.</Mensagem>}
      {estado?.ultimoErro && <Mensagem tipo="erro">{estado.ultimoErro}</Mensagem>}
      <FormularioPix tenantId={tenantId} estado={estado} />
      <div className="space-y-3 border-t border-areia pt-5">
        <h3 className="font-sans text-sm font-bold">Avisos do Mercado Pago</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-carvao">
          <li>Abra Suas integrações → Webhooks e selecione o evento “Pagamentos”.</li>
          <li>Cole esta URL no ambiente correspondente.</li>
          <li>Copie a “assinatura secreta” para o campo da chave acima e salve.</li>
        </ol>
        <UrlAviso id="url-aviso-pix" url={url} nome="Mercado Pago" />
      </div>
    </div>
  )
}

export default async function PaginaIntegracoes({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await exigirConsole()
  const { id } = await params
  const tenant = await obterTenant(supabase, id)
  if (!tenant) notFound()

  return (
    <div className="integracoes-area flex max-w-6xl flex-col gap-6">
      <header>
        <Link
          href={`/admin/tenants/${id}`}
          className="inline-flex min-h-12 items-center gap-2 rounded-md text-sm font-semibold text-carvao underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tinta"
        >
          <ArrowLeft className="size-4" aria-hidden /> Ficha do cliente
        </Link>
        <p className="mt-2 text-sm font-semibold text-carvao">{tenant.nome_fantasia}</p>
        <h1 className="mt-1 text-3xl font-bold">Integrações</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-carvao">
          Configure a emissão de notas e os recebimentos por Pix desta empresa.
        </p>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="titulo-fiscal"
          className="min-w-0 rounded-lg border border-areia bg-branco p-4 shadow-cartao sm:p-6"
        >
          <header className="flex items-start gap-3 border-b border-areia pb-4">
            <FileCheck2 className="mt-0.5 size-6 shrink-0 text-carvao" aria-hidden />
            <div>
              <h2 id="titulo-fiscal" className="text-xl font-bold">
                Nota fiscal
              </h2>
              <p className="mt-1 text-sm text-carvao">NFC-e · Focus NFe</p>
            </div>
          </header>
          <Suspense fallback={<CarregandoIntegracao />}>
            <ConfiguracaoFiscal supabase={supabase} tenantId={id} />
          </Suspense>
        </section>

        <section
          aria-labelledby="titulo-pix"
          className="min-w-0 rounded-lg border border-areia bg-branco p-4 shadow-cartao sm:p-6"
        >
          <header className="flex items-start gap-3 border-b border-areia pb-4">
            <QrCode className="mt-0.5 size-6 shrink-0 text-carvao" aria-hidden />
            <div>
              <h2 id="titulo-pix" className="text-xl font-bold">
                Pix com QR
              </h2>
              <p className="mt-1 text-sm text-carvao">Mercado Pago</p>
            </div>
          </header>
          <Suspense fallback={<CarregandoIntegracao />}>
            <ConfiguracaoPix supabase={supabase} tenantId={id} />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
