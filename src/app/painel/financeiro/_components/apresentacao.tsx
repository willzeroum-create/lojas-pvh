import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import type { Situacao } from '@/lib/dominio/financeiro'

export const ESTILO_CAMPO =
  'min-h-12 w-full min-w-0 max-w-full rounded-xl border border-areia bg-branco px-3.5 py-3 text-base text-tinta placeholder:text-carvao/70 focus:border-tinta focus:outline-none focus:ring-2 focus:ring-tinta/15 disabled:cursor-not-allowed disabled:bg-papel-2 aria-[invalid=true]:border-vermelho'
export const ESTILO_BOTAO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-areia bg-papel px-4 py-3 text-sm font-bold text-tinta transition-colors hover:bg-papel-2 disabled:cursor-not-allowed disabled:opacity-60'
export const ESTILO_PRIMARIO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-tangerina px-5 py-3 text-sm font-bold text-tinta transition-colors hover:bg-tangerina-clara disabled:cursor-not-allowed disabled:opacity-60'

export const FORMAS_PAGAMENTO = [
  { valor: 'dinheiro', rotulo: 'Dinheiro' },
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'cartao_debito', rotulo: 'Cartão de débito' },
  { valor: 'cartao_credito', rotulo: 'Cartão de crédito' },
  { valor: 'boleto', rotulo: 'Boleto' },
  { valor: 'transferencia', rotulo: 'Transferência' },
  { valor: 'outro', rotulo: 'Outro' },
] as const

/** Datas civis da loja não passam pelo fuso horário do navegador. */
export function formatarDataFinanceira(data: string) {
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

const SITUACOES: Record<Situacao, { rotulo: string; estilo: string }> = {
  em_dia: { rotulo: 'Em dia', estilo: 'bg-papel-2 text-carvao' },
  vence_hoje: { rotulo: 'Vence hoje', estilo: 'bg-ambar-clara text-[#805000]' },
  vencida: { rotulo: 'Vencida', estilo: 'bg-vermelho-clara text-[#a82a1a]' },
  parcial: { rotulo: 'Parcial', estilo: 'bg-ambar-clara text-[#805000]' },
  paga: { rotulo: 'Paga', estilo: 'bg-verde-clara text-[#176b3a]' },
  cancelada: { rotulo: 'Cancelada', estilo: 'bg-papel-2 text-carvao' },
}

export function SeloSituacao({ situacao }: { situacao: Situacao }) {
  const selo = SITUACOES[situacao]
  return (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${selo.estilo}`}>
      {selo.rotulo}
    </span>
  )
}

type RotuloCampo = { rotulo: string; erro?: string; ajuda?: string; name: string }

function Envolvente({
  rotulo,
  erro,
  ajuda,
  id,
  required,
  children,
  className = '',
}: Omit<RotuloCampo, 'name'> & { id: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`min-w-0 space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-bold text-carvao">
        {rotulo}
        {required && (
          <span className="ml-1 text-vermelho" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="text-sm font-medium text-vermelho">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={`${id}-ajuda`} className="text-sm leading-relaxed text-carvao">
          {ajuda}
        </p>
      ) : null}
    </div>
  )
}

export function CampoFinanceiro({
  rotulo,
  erro,
  ajuda,
  name,
  id = name,
  className,
  ...atributos
}: InputHTMLAttributes<HTMLInputElement> & RotuloCampo) {
  return (
    <Envolvente
      rotulo={rotulo}
      erro={erro}
      ajuda={ajuda}
      id={id}
      required={atributos.required}
      className={className}
    >
      <input
        {...atributos}
        id={id}
        name={name}
        className={ESTILO_CAMPO}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined}
      />
    </Envolvente>
  )
}

export function SelecaoFinanceira({
  rotulo,
  erro,
  ajuda,
  name,
  id = name,
  className,
  children,
  ...atributos
}: SelectHTMLAttributes<HTMLSelectElement> & RotuloCampo) {
  return (
    <Envolvente
      rotulo={rotulo}
      erro={erro}
      ajuda={ajuda}
      id={id}
      required={atributos.required}
      className={className}
    >
      <select
        {...atributos}
        id={id}
        name={name}
        className={ESTILO_CAMPO}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined}
      >
        {children}
      </select>
    </Envolvente>
  )
}

export function TextoFinanceiro({
  rotulo,
  erro,
  ajuda,
  name,
  id = name,
  className,
  ...atributos
}: TextareaHTMLAttributes<HTMLTextAreaElement> & RotuloCampo) {
  return (
    <Envolvente
      rotulo={rotulo}
      erro={erro}
      ajuda={ajuda}
      id={id}
      required={atributos.required}
      className={className}
    >
      <textarea
        {...atributos}
        id={id}
        name={name}
        className={`${ESTILO_CAMPO} min-h-28 resize-y`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined}
      />
    </Envolvente>
  )
}
