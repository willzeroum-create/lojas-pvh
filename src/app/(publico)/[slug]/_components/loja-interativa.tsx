'use client'

import { ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { paraCatalogoCarrinho } from '@/lib/canais/cardapio'
import type { CatalogoCanonico, ItemCanonico } from '@/lib/canais/tipos'
import { calcularPedido, quantidadeTotal, type RegrasLoja } from '@/lib/dominio/carrinho'
import { formatarBRL } from '@/lib/dominio/moeda'
import { FolhaCarrinho } from './folha-carrinho'
import { FolhaItem } from './folha-item'
import { ListaCardapio } from './lista-cardapio'
import { NavCategorias } from './nav-categorias'
import { useCarrinho } from './use-carrinho'

export type TenantParaCarrinho = { id: string; slug: string; nome_fantasia: string; whatsapp: string }
export type LojaParaCarrinho = RegrasLoja & { id: string }

type Props = {
  tenant: TenantParaCarrinho
  loja: LojaParaCarrinho
  catalogo: CatalogoCanonico
  aberta: boolean
}

/**
 * Tudo o que é interactivo na página pública: navegação por categorias, o
 * cardápio com toque para escolher, a folha do item, a barra e a folha do
 * carrinho com o checkout.
 */
export function LojaInterativa({ tenant, loja, catalogo, aberta }: Props) {
  const carrinho = useCarrinho(tenant.slug)
  const [itemAberto, setItemAberto] = useState<ItemCanonico | null>(null)
  const [carrinhoAberto, setCarrinhoAberto] = useState(false)

  const catalogoCarrinho = useMemo(() => paraCatalogoCarrinho(catalogo), [catalogo])
  const totalItens = quantidadeTotal(carrinho.itens)
  const calculo = useMemo(
    () =>
      calcularPedido(
        carrinho.itens,
        catalogoCarrinho,
        loja,
        loja.aceitaRetirada && !loja.aceitaEntrega ? 'retirada' : 'entrega',
      ),
    [carrinho.itens, catalogoCarrinho, loja],
  )
  const subtotal = calculo.ok ? calculo.subtotal : null

  if (catalogo.categorias.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-16 text-center text-carvao">
        <p className="text-lg font-semibold">O cardápio está sendo preparado.</p>
        <p className="mt-1 text-sm">Chame no WhatsApp para fazer seu pedido.</p>
      </main>
    )
  }

  return (
    <>
      <NavCategorias categorias={catalogo.categorias} />
      <main className="mx-auto max-w-2xl px-5">
        {!aberta && (
          <p className="mb-4 rounded-lg bg-ambar-clara px-4 py-3 text-sm font-semibold text-[#8a5806]">
            A loja está fechada agora. Você pode ver o cardápio, mas os pedidos só são aceitos no horário de
            funcionamento.
          </p>
        )}
        <ListaCardapio categorias={catalogo.categorias} onEscolher={setItemAberto} />
      </main>

      <FolhaItem item={itemAberto} onFechar={() => setItemAberto(null)} onAdicionar={carrinho.adicionar} />

      {totalItens > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pt-2 pb-segura">
          <button
            type="button"
            onClick={() => setCarrinhoAberto(true)}
            className="mx-auto flex h-14 w-full max-w-2xl animate-aparecer items-center justify-between rounded-xl bg-tinta px-5 text-papel shadow-flutuante"
          >
            <span className="flex items-center gap-2.5 font-semibold">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-marca text-sm font-bold text-branco">
                {totalItens}
              </span>
              Ver pedido
            </span>
            <span className="flex items-center gap-2 font-display text-lg font-bold tabular-nums">
              {subtotal !== null ? formatarBRL(subtotal) : <ShoppingBag className="size-5" />}
            </span>
          </button>
        </div>
      )}

      <FolhaCarrinho
        aberta={carrinhoAberto}
        onFechar={() => setCarrinhoAberto(false)}
        tenant={tenant}
        loja={loja}
        lojaAberta={aberta}
        catalogo={catalogoCarrinho}
        carrinho={carrinho}
      />
    </>
  )
}
