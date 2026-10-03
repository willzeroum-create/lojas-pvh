'use client'

import {
  Armchair,
  BarChart3,
  Boxes,
  ChefHat,
  IdCard,
  Landmark,
  ScanBarcode,
  ChevronRight,
  ClipboardList,
  FileText,
  MoreHorizontal,
  Store,
  UserRound,
  Users,
  UtensilsCrossed,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'
import type { IconeModulo, Separador } from '@/lib/modulos/catalogo'
import { cn } from '@/lib/utils/cn'

const ICONES: Record<IconeModulo, LucideIcon> = {
  pedidos: ClipboardList,
  cardapio: UtensilsCrossed,
  clientes: Users,
  financeiro: Wallet,
  pdv: ScanBarcode,
  caixa: Landmark,
  estoque: Boxes,
  equipe: IdCard,
  fiscal: FileText,
  comandas: Armchair,
  cozinha: ChefHat,
  loja: Store,
  resumo: BarChart3,
  conta: UserRound,
}

/** Quatro atalhos no celular; os demais ficam na folha. No computador, todos. */
export function NavPainel({ separadores }: { separadores: Separador[] }) {
  const caminho = usePathname()
  const [caminhoDaFolha, definirCaminhoDaFolha] = useState<string | null>(null)
  const dialogo = useRef<HTMLDialogElement>(null)
  const botaoMais = useRef<HTMLButtonElement>(null)
  const id = useId()
  const extras = separadores.slice(4)
  const aberta = caminhoDaFolha === caminho
  const estaAtivo = (href: string) => caminho === href || caminho.startsWith(`${href}/`)
  const extraAtivo = extras.some(({ href }) => estaAtivo(href))
  const fechar = () => definirCaminhoDaFolha(null)

  useEffect(() => {
    const elemento = dialogo.current
    if (!elemento) return
    if (!aberta) {
      if (elemento.open) elemento.close()
      return
    }

    const transbordamento = document.body.style.overflow
    const computador = window.matchMedia('(min-width: 640px)')
    const fecharNoComputador = () => {
      if (computador.matches) elemento.close()
    }

    document.body.style.overflow = 'hidden'
    if (!elemento.open) elemento.showModal()
    computador.addEventListener('change', fecharNoComputador)
    fecharNoComputador()

    return () => {
      document.body.style.overflow = transbordamento
      computador.removeEventListener('change', fecharNoComputador)
      if (elemento.open) elemento.close()
    }
  }, [aberta])

  return (
    <>
      <nav
        aria-label="Painel"
        className={cn(
          'fixed inset-x-0 bottom-0 z-30 border-t border-areia bg-papel pb-segura',
          'sm:static sm:w-52 sm:shrink-0 sm:border-t-0 sm:border-r sm:pb-0',
        )}
      >
        <ul
          className="grid sm:flex sm:flex-col sm:gap-1 sm:p-3 sm:pt-6"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, Math.min(separadores.length, 4) + Number(extras.length > 0))}, minmax(0, 1fr))`,
          }}
        >
          {separadores.map(({ href, rotulo, icone }, indice) => {
            const Icone = ICONES[icone]
            const ativo = estaAtivo(href)
            return (
              <li key={href} className={cn('min-w-0', indice >= 4 && 'hidden sm:block')}>
                <Link
                  href={href}
                  aria-current={ativo ? 'page' : undefined}
                  className={cn(
                    'relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-1 text-xs font-semibold transition-colors motion-reduce:transition-none',
                    'focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tinta',
                    'sm:h-12 sm:flex-row sm:justify-start sm:gap-3 sm:rounded-lg sm:px-3 sm:text-sm',
                    ativo ? 'bg-papel-3 text-tinta' : 'text-carvao hover:bg-papel-2 hover:text-tinta',
                  )}
                >
                  {ativo && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 top-0 h-0.5 bg-tangerina sm:inset-y-2 sm:left-0 sm:h-auto sm:w-0.5"
                    />
                  )}
                  <Icone aria-hidden className="size-6 shrink-0 sm:size-5" strokeWidth={ativo ? 2.5 : 2} />
                  <span className="max-w-full text-center break-words sm:text-left">{rotulo}</span>
                </Link>
              </li>
            )
          })}
          {extras.length > 0 && (
            <li className="min-w-0 sm:hidden">
              <button
                ref={botaoMais}
                type="button"
                aria-haspopup="dialog"
                aria-controls={`${id}-folha`}
                aria-expanded={aberta}
                aria-label={extraAtivo ? 'Mais seções, seção atual neste menu' : 'Mais seções'}
                onClick={() => definirCaminhoDaFolha(caminho)}
                className={cn(
                  'relative flex min-h-14 w-full flex-col items-center justify-center gap-0.5 px-1 py-1 text-xs font-semibold hover:bg-papel-2',
                  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tinta',
                  extraAtivo ? 'bg-papel-3 text-tinta' : 'text-carvao',
                )}
              >
                {extraAtivo && <span aria-hidden className="absolute inset-x-3 top-0 h-0.5 bg-tangerina" />}
                <MoreHorizontal aria-hidden className="size-6" />
                <span>Mais</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
      <dialog
        ref={dialogo}
        id={`${id}-folha`}
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-descricao`}
        onClose={() => {
          fechar()
          if (!window.matchMedia('(min-width: 640px)').matches) botaoMais.current?.focus()
        }}
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fechar()
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-full overflow-hidden rounded-t-2xl border border-areia bg-papel p-0 text-tinta shadow-folha backdrop:bg-tinta/55"
      >
        <div className="flex max-h-[85dvh] flex-col pb-segura">
          <div className="flex items-start justify-between gap-4 border-b border-areia px-5 py-4">
            <div>
              <h2 id={`${id}-titulo`} className="font-sans text-xl font-bold">
                Mais seções
              </h2>
              <p id={`${id}-descricao`} className="mt-1 text-sm text-carvao">
                Outras áreas do seu negócio.
              </p>
            </div>
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar mais seções"
              className="-mt-1 -mr-2 flex size-12 shrink-0 items-center justify-center rounded-lg text-carvao hover:bg-papel-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>
          <nav
            aria-label="Outras seções do painel"
            className="min-h-0 overflow-y-auto overscroll-contain p-3"
          >
            <ul className="space-y-1">
              {extras.map(({ href, rotulo, icone }) => {
                const Icone = ICONES[icone]
                const ativo = estaAtivo(href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onNavigate={fechar}
                      aria-current={ativo ? 'page' : undefined}
                      className={cn(
                        'flex min-h-14 items-center gap-3 rounded-lg px-3 py-3 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta',
                        ativo ? 'bg-tinta text-papel' : 'text-carvao hover:bg-papel-3',
                      )}
                    >
                      <Icone aria-hidden className="size-5 shrink-0" />
                      <span className="min-w-0 flex-1 break-words">{rotulo}</span>
                      {ativo && <span className="text-xs font-medium">Atual</span>}
                      <ChevronRight aria-hidden className="size-4 shrink-0" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </dialog>
    </>
  )
}
