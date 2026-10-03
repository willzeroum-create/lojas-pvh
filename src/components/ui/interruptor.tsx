'use client'

import { cn } from '@/lib/utils/cn'

type Props = {
  ligado: boolean
  onMudar: (ligado: boolean) => void
  rotulo: string
  desativado?: boolean
  ocupado?: boolean
  /** `grande` tem 48 px de alto: é o interruptor de disponibilidade do cardápio. */
  tamanho?: 'normal' | 'grande'
  /** Texto do estado ao lado; por defeito, o do cardápio. */
  textos?: { ligado: string; desligado: string }
}

const TEXTOS_CARDAPIO = { ligado: 'Disponível', desligado: 'Esgotado' }

/** Interruptor acessível com alvo de toque generoso. O texto do estado fica ao lado. */
export function Interruptor({
  ligado,
  onMudar,
  rotulo,
  desativado,
  ocupado,
  tamanho = 'normal',
  textos = TEXTOS_CARDAPIO,
}: Props) {
  const grande = tamanho === 'grande'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      aria-label={rotulo}
      aria-busy={ocupado || undefined}
      disabled={desativado || ocupado}
      onClick={() => onMudar(!ligado)}
      className={cn(
        'group inline-flex shrink-0 items-center gap-2.5 rounded-full transition-opacity disabled:opacity-60',
        grande ? 'min-h-12 px-1' : 'min-h-10',
      )}
    >
      <span
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          grande ? 'h-8 w-14' : 'h-6 w-11',
          ligado ? 'bg-verde' : 'bg-nevoa',
        )}
      >
        <span
          className={cn(
            'absolute rounded-full bg-branco shadow-sm transition-transform duration-200',
            grande ? 'left-1 size-6' : 'left-0.5 size-5',
            ligado ? (grande ? 'translate-x-6' : 'translate-x-5') : 'translate-x-0',
          )}
        />
      </span>
      <span
        className={cn('font-semibold', grande ? 'text-sm' : 'text-xs', ligado ? 'text-verde' : 'text-cinza')}
      >
        {ligado ? textos.ligado : textos.desligado}
      </span>
    </button>
  )
}
