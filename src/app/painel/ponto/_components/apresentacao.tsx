import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { diaLocal, formatarMinutos } from '@/lib/dominio/ponto'

export const BOTAO_PONTO = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-2 text-sm font-bold hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta'
export const CAMPO_PONTO = 'min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 py-2 text-base outline-offset-2 focus-visible:outline-2 focus-visible:outline-tinta'

export function mesValido(valor: string | string[] | undefined) {
  return typeof valor === 'string' && /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(valor)
    ? valor
    : diaLocal(new Date()).slice(0, 7)
}

export function nomeMes(mes: string) {
  return new Date(`${mes}-15T12:00:00-04:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Porto_Velho' })
}

export function horaPonto(momento: string) {
  return new Date(momento).toLocaleTimeString('pt-BR', { timeZone: 'America/Porto_Velho', hour: '2-digit', minute: '2-digit' })
}

export function saldoPonto(minutos: number) {
  return `${minutos > 0 ? '+' : minutos < 0 ? '−' : ''}${formatarMinutos(Math.abs(minutos))}`
}

export function NavegacaoMes({ mes, caminho }: { mes: string; caminho: string }) {
  const mudar = (passo: number) => {
    const data = new Date(`${mes}-15T12:00:00Z`)
    data.setUTCMonth(data.getUTCMonth() + passo)
    return data.toISOString().slice(0, 7)
  }
  return (
    <nav aria-label="Mês do ponto" className="flex flex-wrap items-center gap-2 print:hidden">
      <Link href={`${caminho}?mes=${mudar(-1)}`} aria-label="Mês anterior" className={BOTAO_PONTO}><ChevronLeft aria-hidden className="size-5" /></Link>
      <form action={caminho} className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-none">
        <label htmlFor="mes-ponto" className="sr-only">Mês do ponto</label>
        <input id="mes-ponto" name="mes" type="month" defaultValue={mes} required className={`${CAMPO_PONTO} !w-auto flex-1`} />
        <button type="submit" className={BOTAO_PONTO}>Ver mês</button>
      </form>
      <Link href={`${caminho}?mes=${mudar(1)}`} aria-label="Próximo mês" className={BOTAO_PONTO}><ChevronRight aria-hidden className="size-5" /></Link>
    </nav>
  )
}
