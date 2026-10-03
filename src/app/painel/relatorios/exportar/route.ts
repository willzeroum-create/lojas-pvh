/**
 * Exportação dos relatórios em CSV (abre no Excel em português):
 * /painel/relatorios/exportar?tipo=vendas|produtos&de=AAAA-MM-DD&ate=AAAA-MM-DD
 */
import { exigirModulo } from '@/lib/auth/guardas'
import { dadosParaExportar, type LinhaVenda } from '@/lib/dados/relatorios'
import { diaLocal } from '@/lib/dominio/ponto'
import { lerIntervalo, paraCsv, ROTULO_CANAL, ROTULO_FORMA, type LinhaAbc } from '@/lib/dominio/relatorios'

const dataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Porto_Velho', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const formas = (v: LinhaVenda) =>
  (v.pagamentos_pedido?.length ? v.pagamentos_pedido.map((p) => p.forma) : [v.forma_pagamento]).map((f) => ROTULO_FORMA[f] ?? f).join(' + ')

export async function GET(request: Request) {
  const { supabase, tenantId, tenant } = await exigirModulo('relatorios')
  const url = new URL(request.url)
  const tipo = url.searchParams.get('tipo') === 'produtos' ? 'produtos' : 'vendas'
  const { de, ate } = lerIntervalo(url.searchParams.get('de'), url.searchParams.get('ate'), diaLocal(new Date()))
  const dados = await dadosParaExportar(supabase, tenantId, de, ate)

  const csv =
    tipo === 'vendas'
      ? paraCsv(
          [
            { titulo: 'Data', valor: (v: LinhaVenda) => dataHora(v.criado_em) },
            { titulo: 'Número', valor: (v: LinhaVenda) => v.numero },
            { titulo: 'Canal', valor: (v: LinhaVenda) => ROTULO_CANAL[v.canal] ?? v.canal },
            { titulo: 'Cliente', valor: (v: LinhaVenda) => v.cliente_nome },
            { titulo: 'Pagamento', valor: formas },
            { titulo: 'Desconto', valor: (v: LinhaVenda) => Number(v.desconto) },
            { titulo: 'Taxa de entrega', valor: (v: LinhaVenda) => Number(v.taxa_entrega) },
            { titulo: 'Total', valor: (v: LinhaVenda) => Number(v.total) },
          ],
          dados.vendas,
        )
      : paraCsv(
          [
            { titulo: 'Produto', valor: (l: LinhaAbc) => l.nome },
            { titulo: 'Quantidade', valor: (l: LinhaAbc) => l.quantidade },
            { titulo: 'Faturamento', valor: (l: LinhaAbc) => l.total },
            { titulo: 'Participação %', valor: (l: LinhaAbc) => l.participacao },
            { titulo: 'Acumulado %', valor: (l: LinhaAbc) => l.acumulado },
            { titulo: 'Curva', valor: (l: LinhaAbc) => l.classe },
          ],
          dados.produtos,
        )

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${tenant.slug}-${tipo}-${de}-a-${ate}.csv"`,
      'cache-control': 'no-store',
    },
  })
}
