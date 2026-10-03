import { exigirModulo } from '@/lib/auth/guardas'
import { listarItensEstoque } from '@/lib/dados/estoque'
import { CabecalhoEstoque } from '../_components/apresentacao'
import { ContagemEstoque } from '../_components/contagem-estoque'

export default async function PaginaInventario() {
  const ctx = await exigirModulo('estoque')
  const itens = (await listarItensEstoque(ctx.supabase, ctx.tenantId)).filter(
    (item) => item.tipo === 'produto' || ctx.modulos.has('producao'),
  )
  return (
    <>
      <CabecalhoEstoque
        titulo="Inventário"
        descricao="Conte o que existe de verdade. Confira as diferenças antes de atualizar os saldos."
      />
      <ContagemEstoque itens={itens} />
    </>
  )
}
