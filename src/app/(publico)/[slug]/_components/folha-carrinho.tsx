'use client'

import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { Botao } from '@/components/ui/botao'
import { Folha } from '@/components/ui/folha'
import { Mensagem } from '@/components/ui/mensagem'
import { calcularItem, calcularPedido, type ProdutoCatalogo, type TipoEntrega } from '@/lib/dominio/carrinho'
import { formatarBRL } from '@/lib/dominio/moeda'
import { criarPedido, type ResultadoCriarPedido } from '../actions'
import { Checkout, type DadosCheckout } from './checkout'
import type { LojaParaCarrinho, TenantParaCarrinho } from './loja-interativa'
import type { useCarrinho } from './use-carrinho'

type Props = {
  aberta: boolean
  onFechar: () => void
  tenant: TenantParaCarrinho
  loja: LojaParaCarrinho
  lojaAberta: boolean
  catalogo: ProdutoCatalogo[]
  carrinho: ReturnType<typeof useCarrinho>
}

type Passo = { nome: 'itens' } | { nome: 'checkout' } | { nome: 'enviado'; numero: number; url: string }

/** Itens → dados de entrega → pedido registado e WhatsApp aberto. Tudo numa folha. */
export function FolhaCarrinho({ aberta, onFechar, tenant, loja, lojaAberta, catalogo, carrinho }: Props) {
  const [passo, setPasso] = useState<Passo>({ nome: 'itens' })
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>(loja.aceitaEntrega ? 'entrega' : 'retirada')
  const [erros, setErros] = useState<string[]>([])
  const zonas = loja.zonas ?? []
  const [bairro, setBairro] = useState('')
  const zona = zonas.find((z) => z.chave === bairro)
  const porBairro = tipoEntrega === 'entrega' && zonas.length > 0
  const regras = useMemo(() => (porBairro ? { ...loja, taxaEntrega: zona?.taxa ?? 0 } : loja), [loja, porBairro, zona])
  const [aEnviar, iniciarTransicao] = useTransition()

  const porId = useMemo(() => new Map(catalogo.map((p) => [p.id, p])), [catalogo])
  const calculo = useMemo(
    () => calcularPedido(carrinho.itens, catalogo, regras, tipoEntrega),
    [carrinho.itens, catalogo, regras, tipoEntrega],
  )

  const fechar = () => {
    onFechar()
    if (passo.nome === 'enviado') {
      carrinho.limpar()
      setPasso({ nome: 'itens' })
    }
  }

  const enviar = (dados: DadosCheckout) => {
    setErros([])
    iniciarTransicao(async () => {
      const resultado: ResultadoCriarPedido = await criarPedido({
        tenantId: tenant.id,
        lojaId: loja.id,
        itens: carrinho.itens.map(({ produtoId, quantidade, opcoesIds, observacao }) => ({
          produtoId,
          quantidade,
          opcoesIds,
          observacao,
        })),
        tipoEntrega,
        ...dados,
      })
      if (!resultado.ok) {
        setErros(resultado.erros)
        return
      }
      setPasso({ nome: 'enviado', numero: resultado.numero, url: resultado.url })
      window.location.assign(resultado.url)
    })
  }

  const titulo =
    passo.nome === 'itens'
      ? 'Seu pedido'
      : passo.nome === 'checkout'
        ? 'Finalizar'
        : `Pedido #${passo.numero} enviado`

  return (
    <Folha aberta={aberta} onFechar={fechar} titulo={titulo}>
      {passo.nome === 'itens' && (
        <div className="flex flex-col gap-4 pb-4">
          {carrinho.itens.length === 0 ? (
            <p className="py-8 text-center text-carvao">Seu pedido está vazio.</p>
          ) : (
            <ul className="divide-y divide-areia/60">
              {carrinho.itens.map((linha) => {
                const r = calcularItem(linha, porId.get(linha.produtoId))
                const nome = porId.get(linha.produtoId)?.nome ?? 'Item indisponível'
                return (
                  <li key={linha.chave} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{nome}</p>
                      {r.ok && r.item.opcoes.length > 0 && (
                        <p className="text-sm text-cinza">{r.item.opcoes.map((o) => o.nome).join(', ')}</p>
                      )}
                      {linha.observacao && <p className="text-sm text-cinza">Obs: {linha.observacao}</p>}
                      <p className="mt-1 text-sm font-semibold tabular-nums">
                        {r.ok ? formatarBRL(r.item.total) : <span className="text-vermelho">{r.erro}</span>}
                      </p>
                    </div>
                    <div className="flex h-11 items-center rounded-lg border border-areia bg-branco">
                      <button
                        type="button"
                        aria-label="Menos um"
                        onClick={() => carrinho.definirQuantidade(linha.chave, linha.quantidade - 1)}
                        className="flex size-11 items-center justify-center"
                      >
                        {linha.quantidade === 1 ? (
                          <Trash2 className="size-4 text-vermelho" />
                        ) : (
                          <Minus className="size-4" />
                        )}
                      </button>
                      <span className="w-7 text-center text-sm font-bold tabular-nums">
                        {linha.quantidade}
                      </span>
                      <button
                        type="button"
                        aria-label="Mais um"
                        onClick={() => carrinho.definirQuantidade(linha.chave, linha.quantidade + 1)}
                        className="flex size-11 items-center justify-center"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {loja.aceitaEntrega && loja.aceitaRetirada && (
            <div
              role="radiogroup"
              aria-label="Como quer receber"
              className="grid grid-cols-2 gap-2 rounded-lg bg-papel-2 p-1"
            >
              {(['entrega', 'retirada'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={tipoEntrega === t}
                  onClick={() => setTipoEntrega(t)}
                  className={`h-11 rounded-md text-sm font-semibold transition-colors ${tipoEntrega === t ? 'bg-branco text-tinta shadow-cartao' : 'text-carvao'}`}
                >
                  {t === 'entrega' ? 'Entrega' : 'Retirar no balcão'}
                </button>
              ))}
            </div>
          )}

          {porBairro && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-carvao">Seu bairro</span>
              <select
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="h-12 w-full rounded-lg border border-areia bg-branco px-3.5 text-[15px] focus:border-tinta focus:ring-2 focus:ring-tinta/15 focus:outline-none"
              >
                <option value="">Escolha o bairro</option>
                {zonas.map((z) => (
                  <option key={z.chave} value={z.chave}>
                    {z.nome} — {z.taxa > 0 ? formatarBRL(z.taxa) : 'grátis'} · até {z.tempoMin} min
                  </option>
                ))}
              </select>
              <span className="text-sm text-cinza">Não achou o seu? Escolha retirar no balcão ou chame a loja no WhatsApp.</span>
            </label>
          )}

          {calculo.ok ? (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between text-carvao">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{formatarBRL(calculo.subtotal)}</dd>
              </div>
              {tipoEntrega === 'entrega' && (
                <div className="flex justify-between text-carvao">
                  <dt>Taxa de entrega</dt>
                  <dd className="tabular-nums">
                    {porBairro && !zona ? 'Escolha o bairro' : calculo.taxaEntrega > 0 ? formatarBRL(calculo.taxaEntrega) : 'Grátis'}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-areia/60 pt-2 text-lg font-bold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatarBRL(calculo.total)}</dd>
              </div>
            </dl>
          ) : (
            carrinho.itens.length > 0 && <Mensagem tipo="erro">{calculo.erros}</Mensagem>
          )}

          {!lojaAberta && (
            <Mensagem tipo="info">
              A loja está fechada agora. Volte no horário de funcionamento para enviar o pedido.
            </Mensagem>
          )}

          <Botao
            variante="marca"
            tamanho="lg"
            cheio
            disabled={!calculo.ok || !lojaAberta || (porBairro && !zona)}
            onClick={() => setPasso({ nome: 'checkout' })}
          >
            Continuar
          </Botao>
        </div>
      )}

      {passo.nome === 'checkout' && (
        <div className="flex flex-col gap-4 pb-4">
          <button
            type="button"
            onClick={() => setPasso({ nome: 'itens' })}
            className="inline-flex h-10 items-center gap-1.5 self-start text-sm font-semibold text-carvao"
          >
            <ArrowLeft className="size-4" /> Voltar aos itens
          </button>
          <Checkout
            tipoEntrega={tipoEntrega}
            bairroFixo={porBairro ? zona?.nome : undefined}
            total={calculo.ok ? calculo.total : 0}
            erros={erros}
            aEnviar={aEnviar}
            onEnviar={enviar}
          />
        </div>
      )}

      {passo.nome === 'enviado' && (
        <div className="flex flex-col items-center gap-4 pt-2 pb-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-verde-clara text-3xl">
            ✅
          </div>
          <p className="text-carvao">
            Seu pedido foi registrado. Estamos abrindo o WhatsApp de <strong>{tenant.nome_fantasia}</strong>{' '}
            com a mensagem pronta: é só enviar.
          </p>
          <a
            href={passo.url}
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-verde font-semibold text-branco"
          >
            Abrir o WhatsApp
          </a>
          <button
            type="button"
            onClick={fechar}
            className="h-10 text-sm font-semibold text-carvao underline underline-offset-4"
          >
            Fechar
          </button>
        </div>
      )}
    </Folha>
  )
}
