'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { exigirModulo } from '@/lib/auth/guardas'
import {
  atualizarCategoria,
  atualizarProduto,
  criarCategoria,
  criarProduto,
  definirDisponibilidade,
  definirFotoProduto,
  eliminarCategoria,
  eliminarProduto,
  substituirGruposDoProduto,
} from '@/lib/dados/cardapio'
import { ErroDados } from '@/lib/dados/erros'
import { esquemaCategoria, esquemaGrupoOpcao, esquemaProduto } from '@/lib/validacao/cardapio'
import { deFormData, uuid, validar, z } from '@/lib/validacao/zod'

export type EstadoFormulario = { erro?: string; porCampo?: Record<string, string>; sucesso?: string }

function mensagem(e: unknown, padrao: string): string {
  return e instanceof ErroDados ? e.message : padrao
}

export async function alternarDisponibilidade(
  produtoId: string,
  disponivel: boolean,
): Promise<{ ok: boolean }> {
  const { supabase, tenantId } = await exigirModulo('cardapio')
  try {
    await definirDisponibilidade(supabase, tenantId, uuid.parse(produtoId), disponivel)
  } catch {
    return { ok: false }
  }
  revalidatePath('/painel/cardapio')
  return { ok: true }
}

export async function guardarFotoProduto(produtoId: string, url: string | null): Promise<void> {
  const { supabase, tenantId } = await exigirModulo('cardapio')
  await definirFotoProduto(supabase, tenantId, uuid.parse(produtoId), url)
  revalidatePath('/painel/cardapio')
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export async function guardarCategoria(
  categoriaId: string | null,
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const r = validar(esquemaCategoria, deFormData(fd))
  if (!r.ok) return { erro: 'Confira os campos.', porCampo: r.porCampo }
  const { supabase, tenantId } = await exigirModulo('cardapio')
  try {
    if (categoriaId) await atualizarCategoria(supabase, tenantId, categoriaId, r.dados)
    else await criarCategoria(supabase, tenantId, r.dados)
  } catch (e) {
    return { erro: mensagem(e, 'Não foi possível guardar a categoria.') }
  }
  revalidatePath('/painel/cardapio')
  redirect('/painel/cardapio')
}

export async function apagarCategoria(categoriaId: string): Promise<void> {
  const { supabase, tenantId } = await exigirModulo('cardapio')
  await eliminarCategoria(supabase, tenantId, uuid.parse(categoriaId))
  revalidatePath('/painel/cardapio')
  redirect('/painel/cardapio')
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

const esquemaGrupos = z.array(esquemaGrupoOpcao).max(10)

export async function guardarProduto(
  produtoId: string | null,
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const campos = deFormData(fd)
  const r = validar(esquemaProduto, campos)
  if (!r.ok) return { erro: 'Confira os campos.', porCampo: r.porCampo }

  let grupos: z.infer<typeof esquemaGrupos> = []
  try {
    const bruto = typeof campos.grupos_json === 'string' ? JSON.parse(campos.grupos_json) : []
    const rg = validar(esquemaGrupos, bruto)
    if (!rg.ok) return { erro: `Grupos de opção: ${rg.erros[0]}` }
    grupos = rg.dados
  } catch {
    return { erro: 'Grupos de opção inválidos.' }
  }

  const { supabase, tenantId } = await exigirModulo('cardapio')
  let id = produtoId
  try {
    if (id) await atualizarProduto(supabase, tenantId, id, r.dados)
    else id = await criarProduto(supabase, tenantId, r.dados)
    await substituirGruposDoProduto(supabase, tenantId, id, grupos)
  } catch (e) {
    return { erro: mensagem(e, 'Não foi possível guardar o produto.') }
  }
  revalidatePath('/painel/cardapio')
  if (!produtoId) redirect(`/painel/cardapio/produto/${id}?criado=1`)
  return { sucesso: 'Produto guardado.' }
}

export async function apagarProduto(produtoId: string): Promise<void> {
  const { supabase, tenantId } = await exigirModulo('cardapio')
  await eliminarProduto(supabase, tenantId, uuid.parse(produtoId))
  revalidatePath('/painel/cardapio')
  redirect('/painel/cardapio')
}
