import type { EstadoFiscal } from '@/lib/dados/fiscal'
import type { DocumentoFiscalLinha } from '@/lib/supabase/tipos'

export const LINK_FISCAL =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold text-tinta hover:bg-papel-2'

export const dataFiscal = (valor: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Porto_Velho',
  }).format(new Date(valor))

const ESTADOS_NOTA: Record<DocumentoFiscalLinha['estado'], readonly [string, string]> = {
  enfileirado: ['Na fila', 'bg-papel-2 text-carvao'],
  processando: ['Processando', 'bg-ambar-clara text-[#805000]'],
  autorizado: ['Autorizada', 'bg-verde-clara text-[#176b3a]'],
  rejeitado: ['Rejeitada', 'bg-vermelho-clara text-vermelho'],
  denegado: ['Denegada', 'bg-vermelho-clara text-vermelho'],
  cancelado: ['Cancelada', 'bg-papel-2 text-carvao'],
  contingencia: ['Em contingência', 'bg-ambar-clara text-[#805000]'],
  erro: ['Erro na emissão', 'bg-vermelho-clara text-vermelho'],
}

export function SeloNota({ estado }: { estado: DocumentoFiscalLinha['estado'] }) {
  const [rotulo, cor] = ESTADOS_NOTA[estado]
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${cor}`}>{rotulo}</span>
}

export function SituacaoFiscal({ integracao }: { integracao: EstadoFiscal | null }) {
  const aguardando = !integracao || integracao.estado === 'aguardando_credenciais'
  const problema = integracao?.estado === 'com_erro' || integracao?.estado === 'suspensa'
  const titulo = aguardando
    ? 'A nota fiscal ainda não foi ligada.'
    : integracao.estado === 'suspensa'
      ? 'Emissão de notas suspensa'
      : integracao.estado === 'com_erro'
        ? 'A emissão precisa de atenção'
        : 'Emissor conectado'
  return (
    <section
      aria-label="Situação da emissão fiscal"
      className={`rounded-xl border p-5 sm:p-6 ${problema ? 'border-vermelho/30 bg-vermelho-clara' : aguardando ? 'border-areia bg-papel-2' : 'border-areia bg-branco'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold tracking-widest text-carvao uppercase">Nota fiscal · NFC-e</p>
          <h2 className="mt-2 text-xl font-bold">{titulo}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-carvao">
            {aguardando
              ? 'A equipa configura o certificado e o emissor.'
              : integracao.estado === 'suspensa'
                ? 'Fale com a equipe para retomar a emissão. As notas anteriores continuam disponíveis.'
                : integracao.estado === 'com_erro'
                  ? 'Confira a mensagem abaixo. Se precisar, peça ajuda à equipe responsável.'
                  : 'Emita a nota de uma venda concluída e acompanhe a autorização aqui.'}
          </p>
        </div>
        {!aguardando && integracao.ambiente === 'producao' && !problema && (
          <span className="rounded-md bg-verde-clara px-3 py-2 text-xs font-bold text-[#176b3a]">
            Em produção
          </span>
        )}
      </div>
      {integracao?.ambiente === 'homologacao' && (
        <p className="mt-4 inline-flex rounded-md bg-ambar-clara px-3 py-2 text-sm font-bold text-[#805000]">
          Ambiente de teste (sem valor fiscal)
        </p>
      )}
      {integracao?.ultimoErro && !aguardando && (
        <p className="mt-4 text-sm leading-relaxed break-words text-vermelho">{integracao.ultimoErro}</p>
      )}
    </section>
  )
}
