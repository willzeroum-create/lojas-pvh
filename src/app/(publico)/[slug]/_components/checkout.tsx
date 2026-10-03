'use client'

import { useState, type FormEvent } from 'react'
import { Botao } from '@/components/ui/botao'
import { AreaTexto, Campo } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { TipoEntrega } from '@/lib/dominio/carrinho'
import type { Endereco } from '@/lib/dominio/endereco'
import { formatarBRL } from '@/lib/dominio/moeda'
import type { FormaPagamento } from '@/lib/dominio/whatsapp'
import { cn } from '@/lib/utils/cn'

export type DadosCheckout = {
  clienteNome: string
  clienteTelefone: string
  endereco?: Endereco
  formaPagamento: FormaPagamento
  trocoPara?: number
  observacoes?: string
  site?: string
}

type Props = {
  tipoEntrega: TipoEntrega
  /** Bairro já escolhido no carrinho (delivery por bairro): mostrado, não editável. */
  bairroFixo?: string
  total: number
  erros: string[]
  aEnviar: boolean
  onEnviar: (dados: DadosCheckout) => void
}

const PAGAMENTOS: Array<{ valor: FormaPagamento; rotulo: string }> = [
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'dinheiro', rotulo: 'Dinheiro' },
  { valor: 'cartao', rotulo: 'Cartão' },
]

/** Um ecrã só. Nome, telefone, endereço (se entrega), pagamento. Sem conta, sem senha. */
export function Checkout({ tipoEntrega, bairroFixo, total, erros, aEnviar, onEnviar }: Props) {
  const [pagamento, setPagamento] = useState<FormaPagamento>('pix')

  const submeter = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const texto = (nome: string) => {
      const v = fd.get(nome)
      return typeof v === 'string' && v.trim() ? v.trim() : undefined
    }
    const troco = texto('trocoPara')
    onEnviar({
      clienteNome: texto('clienteNome') ?? '',
      clienteTelefone: texto('clienteTelefone') ?? '',
      endereco:
        tipoEntrega === 'entrega'
          ? {
              rua: texto('rua'),
              numero: texto('numero'),
              complemento: texto('complemento'),
              bairro: texto('bairro'),
              referencia: texto('referencia'),
            }
          : undefined,
      formaPagamento: pagamento,
      trocoPara: pagamento === 'dinheiro' && troco ? Number(troco.replace(',', '.')) : undefined,
      observacoes: texto('observacoes'),
      site: texto('site'),
    })
  }

  return (
    <form onSubmit={submeter} className="flex flex-col gap-4">
      <Campo rotulo="Seu nome" name="clienteNome" autoComplete="name" required minLength={2} maxLength={60} />
      <Campo
        rotulo="Seu WhatsApp"
        name="clienteTelefone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(69) 99999-8888"
        required
      />

      {tipoEntrega === 'entrega' && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-carvao">Endereço de entrega</legend>
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <Campo rotulo="Rua" name="rua" autoComplete="address-line1" required />
            <Campo rotulo="Número" name="numero" inputMode="numeric" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bairroFixo ? (
              <Campo rotulo="Bairro" name="bairro" value={bairroFixo} readOnly />
            ) : (
              <Campo rotulo="Bairro" name="bairro" autoComplete="address-level3" />
            )}
            <Campo rotulo="Complemento" name="complemento" placeholder="Apto, bloco…" />
          </div>
          <Campo
            rotulo="Ponto de referência"
            name="referencia"
            placeholder="Ex.: portão azul, em frente à praça"
          />
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-carvao">
          Pagamento {tipoEntrega === 'entrega' ? 'na entrega' : 'na retirada'}
        </legend>
        <div role="radiogroup" className="grid grid-cols-3 gap-2">
          {PAGAMENTOS.map((p) => (
            <button
              key={p.valor}
              type="button"
              role="radio"
              aria-checked={pagamento === p.valor}
              onClick={() => setPagamento(p.valor)}
              className={cn(
                'h-12 rounded-lg border text-sm font-semibold transition-colors',
                pagamento === p.valor
                  ? 'border-tinta bg-tinta text-papel'
                  : 'border-areia bg-branco text-carvao',
              )}
            >
              {p.rotulo}
            </button>
          ))}
        </div>
        {pagamento === 'dinheiro' && (
          <Campo
            className="mt-3"
            rotulo="Troco para quanto?"
            name="trocoPara"
            inputMode="decimal"
            placeholder="Ex.: 50"
            ajuda="Deixe vazio se não precisar de troco."
          />
        )}
      </fieldset>

      <AreaTexto
        rotulo="Observações do pedido"
        name="observacoes"
        maxLength={300}
        placeholder="Algo que a loja precise saber?"
      />

      {/* Campo-armadilha para bots: invisível para pessoas, tem de ficar vazio. */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {erros.length > 0 && <Mensagem tipo="erro">{erros}</Mensagem>}

      <p className="text-xs text-cinza">
        Seus dados são usados só para este pedido e ficam com o estabelecimento.
      </p>

      <Botao
        type="submit"
        variante="marca"
        tamanho="lg"
        cheio
        carregando={aEnviar}
        className="justify-between"
      >
        <span>Enviar pelo WhatsApp</span>
        <span className="tabular-nums">{formatarBRL(total)}</span>
      </Botao>
    </form>
  )
}
