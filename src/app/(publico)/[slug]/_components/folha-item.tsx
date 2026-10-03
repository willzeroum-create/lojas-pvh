'use client'

import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Botao } from '@/components/ui/botao'
import { AreaTexto } from '@/components/ui/campo'
import { Folha } from '@/components/ui/folha'
import type { ItemCanonico } from '@/lib/canais/tipos'
import type { ItemCarrinho } from '@/lib/dominio/carrinho'
import { formatarBRL } from '@/lib/dominio/moeda'
import { cn } from '@/lib/utils/cn'
import { Preco } from './lista-cardapio'

type Props = {
  item: ItemCanonico | null
  onFechar: () => void
  onAdicionar: (item: ItemCarrinho) => void
}

/** A folha do item. O conteúdo é remontado por `key` a cada item novo, o que limpa a escolha anterior. */
export function FolhaItem({ item, onFechar, onAdicionar }: Props) {
  return (
    <Folha aberta={item !== null} onFechar={onFechar} titulo={item?.nome}>
      {item && <EscolhaItem key={item.id} item={item} onFechar={onFechar} onAdicionar={onAdicionar} />}
    </Folha>
  )
}

type PropsEscolha = {
  item: ItemCanonico
  onFechar: () => void
  onAdicionar: (item: ItemCarrinho) => void
}

/** Escolha de opções, quantidade e observação. Valida min/max de cada grupo antes de deixar adicionar. */
function EscolhaItem({ item, onFechar, onAdicionar }: PropsEscolha) {
  const [quantidade, setQuantidade] = useState(1)
  const [escolhidas, setEscolhidas] = useState<Set<string>>(() => new Set())
  const [observacao, setObservacao] = useState('')

  const alternar = (grupoMax: number, idsDoGrupo: string[], id: string) => {
    setEscolhidas((atual) => {
      const nova = new Set(atual)
      if (nova.has(id)) {
        nova.delete(id)
        return nova
      }
      if (grupoMax === 1) idsDoGrupo.forEach((o) => nova.delete(o))
      else if (idsDoGrupo.filter((o) => nova.has(o)).length >= grupoMax) return atual
      nova.add(id)
      return nova
    })
  }

  const { precoUnitario, gruposEmFalta } = useMemo(() => {
    let preco = item.preco.valor
    const emFalta: string[] = []
    for (const g of item.gruposOpcao) {
      const n = g.opcoes.filter((o) => escolhidas.has(o.id)).length
      const minimo = g.obrigatorio ? Math.max(1, g.min) : g.min
      if (n < minimo) emFalta.push(g.nome)
      preco += g.opcoes.filter((o) => escolhidas.has(o.id)).reduce((s, o) => s + o.preco.valor, 0)
    }
    return { precoUnitario: preco, gruposEmFalta: emFalta }
  }, [item, escolhidas])

  const adicionar = () => {
    if (gruposEmFalta.length > 0) return
    onAdicionar({
      produtoId: item.id,
      quantidade,
      opcoesIds: [...escolhidas],
      observacao: observacao.trim() || undefined,
    })
    onFechar()
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      {item.imagemUrl && (
        <div className="relative -mx-5 aspect-[16/9] bg-papel-3">
          <Image
            src={item.imagemUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 512px"
            className="object-cover"
          />
        </div>
      )}
      {item.descricao && <p className="text-carvao">{item.descricao}</p>}
      <p className="text-lg font-bold">
        <Preco item={item} />
      </p>

      {item.gruposOpcao.map((g) => {
        const ids = g.opcoes.map((o) => o.id)
        const escolhidasNoGrupo = ids.filter((id) => escolhidas.has(id)).length
        const minimo = g.obrigatorio ? Math.max(1, g.min) : g.min
        return (
          <fieldset key={g.id}>
            <legend className="flex w-full items-baseline justify-between">
              <span className="font-semibold">{g.nome}</span>
              <span
                className={cn(
                  'text-xs font-bold tracking-wide uppercase',
                  minimo > 0 && escolhidasNoGrupo < minimo ? 'marca' : 'text-cinza',
                )}
              >
                {minimo > 0 ? 'Obrigatório' : 'Opcional'} · {g.max === 1 ? 'escolha 1' : `até ${g.max}`}
              </span>
            </legend>
            <ul className="mt-2 overflow-hidden rounded-lg border border-areia bg-branco">
              {g.opcoes.map((o) => {
                const disponivel = o.status === 'AVAILABLE'
                const marcada = escolhidas.has(o.id)
                return (
                  <li key={o.id} className="border-b border-areia/60 last:border-b-0">
                    <label
                      className={cn(
                        'flex min-h-12 cursor-pointer items-center gap-3 px-3.5 py-2',
                        !disponivel && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      <input
                        type={g.max === 1 ? 'radio' : 'checkbox'}
                        name={`grupo-${g.id}`}
                        checked={marcada}
                        disabled={!disponivel}
                        onChange={() => alternar(g.max, ids, o.id)}
                        onClick={() => g.max === 1 && marcada && alternar(g.max, ids, o.id)}
                        className="size-5 accent-[var(--cor-marca)]"
                      />
                      <span className="flex-1">{o.nome}</span>
                      {o.preco.valor > 0 && (
                        <span className="text-sm font-semibold tabular-nums">
                          + {formatarBRL(o.preco.valor)}
                        </span>
                      )}
                      {!disponivel && (
                        <span className="text-xs font-bold text-cinza uppercase">esgotado</span>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        )
      })}

      <AreaTexto
        rotulo="Alguma observação?"
        name="observacao"
        placeholder="Ex.: sem cebola, bem passado…"
        maxLength={140}
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
      />

      <div className="sticky bottom-0 -mx-5 flex items-center gap-3 border-t border-areia/60 bg-papel px-5 py-3">
        <div className="flex h-12 items-center rounded-lg border border-areia bg-branco">
          <button
            type="button"
            aria-label="Menos um"
            onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
            className="flex size-12 items-center justify-center"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center font-bold tabular-nums" aria-live="polite">
            {quantidade}
          </span>
          <button
            type="button"
            aria-label="Mais um"
            onClick={() => setQuantidade((q) => Math.min(99, q + 1))}
            className="flex size-12 items-center justify-center"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Botao
          variante="marca"
          tamanho="md"
          cheio
          disabled={gruposEmFalta.length > 0}
          onClick={adicionar}
          className="justify-between"
        >
          <span>Adicionar</span>
          <span className="tabular-nums">{formatarBRL(precoUnitario * quantidade)}</span>
        </Botao>
      </div>
    </div>
  )
}
