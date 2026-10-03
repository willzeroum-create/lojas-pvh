import { CheckCircle2, QrCode } from 'lucide-react'
import type { Metadata } from 'next'
import { Mensagem } from '@/components/ui/mensagem'
import { exigirModulo } from '@/lib/auth/guardas'
import { estadoPix, listarCobrancasPix } from '@/lib/dados/pix'
import { PainelPix } from './_components/painel-pix'

export const metadata: Metadata = { title: 'Pix' }

export default async function PaginaPix() {
  const { supabase, tenantId } = await exigirModulo('bancos')
  const [integracao, cobrancas] = await Promise.all([
    estadoPix(supabase, tenantId),
    listarCobrancasPix(supabase, tenantId),
  ])
  const aguardando = !integracao || integracao.estado === 'aguardando_credenciais'
  const suspensa = integracao?.estado === 'suspensa'
  const comErro = integracao?.estado === 'com_erro'
  const teste = integracao?.ambiente === 'homologacao'

  return (
    <div className="pix-area min-w-0 space-y-6">
      <header className="border-b border-areia pb-6">
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">Seu negócio / Pix</p>
        <h1 className="text-3xl leading-tight font-bold tracking-tight lg:text-4xl">Receba pelo Pix</h1>
        <p className="mt-3 text-sm leading-relaxed text-carvao">
          Um QR na tela. A confirmação assim que o pagamento cair.
        </p>
      </header>
      {aguardando ? (
        <section
          aria-label="Situação do Pix"
          className="rounded-xl border border-areia bg-papel-2 p-5 sm:p-6"
        >
          <QrCode aria-hidden="true" className="mb-4 size-8 text-carvao" />
          <h2 className="text-xl font-bold">O Pix ainda não foi ligado.</h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            A equipe liga a conta Mercado Pago da empresa.
          </p>
        </section>
      ) : (
        <section
          aria-label="Situação do Pix"
          className={`rounded-xl border p-4 sm:p-5 ${suspensa || comErro ? 'border-ambar/40 bg-ambar-clara' : 'border-areia bg-branco'}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {!suspensa && !comErro && (
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#176b3a]" />
              )}
              <div>
                <h2 className="font-bold">
                  {suspensa ? 'Pix suspenso' : comErro ? 'O Pix precisa de atenção' : 'Conta Pix conectada'}
                </h2>
                <p className="mt-1 text-sm text-carvao">
                  {suspensa
                    ? 'Peça à equipe para reativar a integração.'
                    : comErro
                      ? 'Confira o aviso e, se necessário, peça ajuda à equipe.'
                      : 'Mercado Pago · confirmação automática'}
                </p>
              </div>
            </div>
            <span
              className={`rounded-md px-3 py-2 text-xs font-bold ${teste ? 'bg-ambar-clara text-[#805000]' : 'bg-verde-clara text-[#176b3a]'}`}
            >
              {teste ? 'Ambiente de teste' : 'Ambiente de produção'}
            </span>
          </div>
          {teste && (
            <p className="mt-3 text-sm font-semibold text-[#805000]">
              Use apenas para testar a integração. Não use para receber de clientes.
            </p>
          )}
          {integracao.ultimoErro && (
            <Mensagem tipo="erro" className="mt-4">
              {integracao.ultimoErro}
            </Mensagem>
          )}
        </section>
      )}
      <PainelPix cobrancas={cobrancas} podeGerar={!aguardando && !suspensa} />
    </div>
  )
}
