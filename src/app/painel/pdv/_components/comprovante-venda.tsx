import type { VendaRegistada } from '@/lib/dados/pdv'
import { ROTULO_FORMA } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import type { ItemCalculado, PagamentoVenda } from '@/lib/dominio/pdv'

type ItemComUnidade = ItemCalculado & { vendidoPorPeso?: boolean }

const dataHora = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Porto_Velho',
  dateStyle: 'short',
  timeStyle: 'short',
})

function quantidadeDoItem(item: ItemComUnidade) {
  const porPeso = item.vendidoPorPeso ?? !Number.isInteger(item.quantidade)
  const quantidade = item.quantidade.toLocaleString('pt-BR', {
    minimumFractionDigits: porPeso ? 3 : 0,
    maximumFractionDigits: 3,
  })
  return porPeso ? `${quantidade} kg` : quantidade
}

export function ComprovanteVenda({
  venda,
  itens,
  pagamentos,
  descontoGeral,
  cashback = 0,
  lojaNome,
  operador,
  clienteNome,
  criadoEm,
}: {
  venda: VendaRegistada
  itens: ItemComUnidade[]
  pagamentos: PagamentoVenda[]
  descontoGeral: number
  cashback?: number
  lojaNome: string
  operador: string
  clienteNome?: string
  criadoEm: string
}) {
  const subtotal =
    itens.reduce((soma, item) => soma + Math.round((item.total + item.desconto) * 100), 0) / 100
  const descontosItens = itens.reduce((soma, item) => soma + Math.round(item.desconto * 100), 0) / 100
  const recebido = pagamentos.reduce((soma, pagamento) => soma + Math.round(pagamento.valor * 100), 0) / 100
  const totalDosItens = itens.reduce((soma, item) => soma + Math.round(item.total * 100), 0)
  const precoAtualizado =
    totalDosItens - Math.round(descontoGeral * 100) - Math.round(cashback * 100) !==
    Math.round(venda.total * 100)

  return (
    <article
      id="comprovante-pdv"
      className="pdv-comprovante mx-auto w-full max-w-md rounded-xl border border-areia bg-branco p-5 text-tinta sm:p-7"
      aria-labelledby="comprovante-pdv-titulo"
    >
      <header className="border-b border-dashed border-areia pb-4 text-center">
        <h2 id="comprovante-pdv-titulo" className="font-sans text-xl font-bold break-words">
          {lojaNome}
        </h2>
        <p className="mt-2 text-xs font-bold tracking-[0.1em] uppercase">Comprovante não fiscal</p>
        <p className="mt-3 text-base font-bold">Venda #{venda.numero}</p>
        <p className="mt-1 text-xs text-carvao">
          <time dateTime={criadoEm}>{dataHora.format(new Date(criadoEm))}</time> · Porto Velho
        </p>
      </header>

      <dl className="space-y-1 border-b border-dashed border-areia py-3 text-xs text-carvao">
        <div className="flex flex-wrap justify-between gap-x-3">
          <dt>Operador</dt>
          <dd className="font-semibold break-words text-tinta">{operador}</dd>
        </div>
        {clienteNome && (
          <div className="flex flex-wrap justify-between gap-x-3">
            <dt>Cliente</dt>
            <dd className="font-semibold break-words text-tinta">{clienteNome}</dd>
          </div>
        )}
      </dl>

      <ol className="divide-y divide-dashed divide-areia py-1">
        {itens.map((item, indice) => (
          <li key={`${item.produtoId}-${indice}`} className="py-3 text-sm">
            <p className="font-bold break-words">{item.nome}</p>
            <div className="mt-1 flex flex-wrap justify-between gap-x-3 gap-y-1 tabular-nums">
              <p className="text-xs text-carvao">
                {quantidadeDoItem(item)}
                {!precoAtualizado && <> × {formatarBRL(item.precoUnitario)}</>}
              </p>
              {!precoAtualizado && <p className="font-semibold">{formatarBRL(item.total)}</p>}
            </div>
            {item.desconto > 0 && (
              <p className="mt-1 text-xs text-carvao">Desconto neste item: {formatarBRL(item.desconto)}</p>
            )}
          </li>
        ))}
      </ol>

      {precoAtualizado && (
        <p className="mb-4 rounded-md bg-papel-2 p-3 text-xs leading-relaxed text-carvao">
          O preço foi atualizado na confirmação. Total conforme a venda registrada.
        </p>
      )}

      <dl className="space-y-2 border-y border-dashed border-areia py-4 text-sm tabular-nums">
        {!precoAtualizado && (
          <div className="flex flex-wrap justify-between gap-2">
            <dt>Subtotal</dt>
            <dd>{formatarBRL(subtotal)}</dd>
          </div>
        )}
        {descontosItens > 0 && (
          <div className="flex flex-wrap justify-between gap-2 text-carvao">
            <dt>Descontos nos itens</dt>
            <dd>− {formatarBRL(descontosItens)}</dd>
          </div>
        )}
        {descontoGeral > 0 && (
          <div className="flex flex-wrap justify-between gap-2 text-carvao">
            <dt>Desconto geral</dt>
            <dd>− {formatarBRL(descontoGeral)}</dd>
          </div>
        )}
        {cashback > 0 && (
          <div className="flex flex-wrap justify-between gap-2 text-carvao">
            <dt>Cashback utilizado</dt>
            <dd>− {formatarBRL(cashback)}</dd>
          </div>
        )}
        <div className="flex flex-wrap justify-between gap-2 pt-2 text-xl font-bold">
          <dt>Total</dt>
          <dd>{formatarBRL(venda.total)}</dd>
        </div>
      </dl>

      <dl className="space-y-2 py-4 text-sm tabular-nums">
        {pagamentos.map((pagamento, indice) => (
          <div
            key={`${pagamento.forma}-${indice}`}
            className="flex flex-wrap justify-between gap-x-3 gap-y-1"
          >
            <dt>{ROTULO_FORMA[pagamento.forma]}</dt>
            <dd>{formatarBRL(pagamento.valor)}</dd>
          </div>
        ))}
        <div className="flex flex-wrap justify-between gap-2 pt-2 font-semibold">
          <dt>Valor recebido</dt>
          <dd>{formatarBRL(recebido)}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2 text-lg font-bold">
          <dt>Troco</dt>
          <dd>{formatarBRL(venda.troco)}</dd>
        </div>
      </dl>
      <footer className="border-t border-dashed border-areia pt-4 text-center text-xs leading-relaxed text-carvao">
        Obrigado pela preferência.
        <br />
        Este comprovante não substitui o documento fiscal.
      </footer>
    </article>
  )
}
