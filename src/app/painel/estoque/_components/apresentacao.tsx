import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import type { Margem } from '@/lib/dominio/ficha'

export const BOTAO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold text-tinta hover:bg-papel-2 disabled:cursor-not-allowed disabled:opacity-50'
export const PRIMARIO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-tangerina px-5 py-3 text-sm font-bold text-tinta hover:bg-tangerina-clara disabled:cursor-not-allowed disabled:opacity-50'
export const CAMPO =
  'min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 py-3 text-base text-tinta focus:border-tinta focus:outline-2 focus:outline-tinta disabled:bg-papel-2 aria-[invalid=true]:border-vermelho'
export const UNIDADES = ['un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'dz'] as const
export const quantidade = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(valor)
export const dataHora = (valor: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Porto_Velho',
  }).format(new Date(valor))

export function CabecalhoEstoque({
  titulo,
  descricao,
  children,
}: {
  titulo: string
  descricao: string
  children?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
          Seu negócio / Estoque
        </p>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{titulo}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-carvao">{descricao}</p>
      </div>
      {children}
    </header>
  )
}

export function CampoEstoque({
  rotulo,
  erro,
  name,
  id = name,
  ...atributos
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string; name: string }) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-carvao">
        {rotulo}
      </label>
      <input
        {...atributos}
        name={name}
        id={id}
        className={CAMPO}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
      />
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-vermelho">
          {erro}
        </p>
      )}
    </div>
  )
}

export function SelecaoEstoque({
  rotulo,
  erro,
  name,
  id = name,
  children,
  ...atributos
}: SelectHTMLAttributes<HTMLSelectElement> & { rotulo: string; erro?: string; name: string }) {
  return (
    <div className="min-w-0 space-y-2">
      <label htmlFor={id} className="block text-sm font-bold text-carvao">
        {rotulo}
      </label>
      <select
        {...atributos}
        name={name}
        id={id}
        className={CAMPO}
        aria-invalid={!!erro}
        aria-describedby={erro ? `${id}-erro` : undefined}
      >
        {children}
      </select>
      {erro && (
        <p id={`${id}-erro`} className="text-sm text-vermelho">
          {erro}
        </p>
      )}
    </div>
  )
}

export function SeloMargem({ situacao }: { situacao: Margem['situacao'] }) {
  const selos = {
    sem_preco: ['Sem preço', 'bg-papel-2 text-carvao'],
    prejuizo: ['Prejuízo', 'bg-vermelho-clara text-vermelho'],
    apertada: ['Margem apertada', 'bg-ambar-clara text-[#805000]'],
    saudavel: ['Saudável', 'bg-verde-clara text-[#176b3a]'],
  } as const
  const [rotulo, cor] = selos[situacao]
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${cor}`}>{rotulo}</span>
}
