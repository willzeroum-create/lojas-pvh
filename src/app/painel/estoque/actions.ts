'use server'

/**
 * Actions do Estoque e das fichas técnicas. Estoque exige o módulo `estoque`;
 * fichas e insumos exigem `producao`.
 */
import { revalidatePath } from 'next/cache'
import { autorDe, exigirAprovacao, exigirModulo } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import {
  aplicarInventario,
  cancelarEntrada,
  concluirEntrada,
  configurarEstoqueProduto,
  criarEntradaDeXml,
  criarEntradaManual,
  estornarMovimento,
  ligarItemEntrada,
  registarSaida,
  salvarFicha,
  salvarInsumo,
} from '@/lib/dados/estoque'
import {
  esquemaEntradaManual,
  esquemaEstoqueProduto,
  esquemaFicha,
  esquemaInsumo,
  esquemaInventario,
  esquemaLigarItem,
  esquemaSaida,
  esquemaXmlNota,
} from '@/lib/validacao/estoque'
import { uuid, validar } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string> }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)
const falha = (erros: string[], porCampo?: Record<string, string>) => ({ ok: false as const, erro: erros[0] ?? 'Dados inválidos', porCampo })

function revalidar() {
  revalidatePath('/painel/estoque', 'layout')
}

export async function registarSaidaAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('estoque')
  const r = validar(esquemaSaida, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await registarSaida(ctx.supabase, ctx.tenantId, r.dados.item, r.dados.quantidade, r.dados.motivo, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar a saída.') }
  }
  revalidar()
  return { ok: true }
}

export async function estornarMovimentoAction(movimentoId: string, pinGerente?: string): Promise<Resultado> {
  const ctx = await exigirModulo('estoque')
  const r = validar(uuid, movimentoId)
  if (!r.ok) return { ok: false, erro: 'Movimento inválido.' }
  try {
    await exigirAprovacao(ctx, 'estornar_estoque', 'Estornou um movimento de estoque', pinGerente, r.dados)
    await estornarMovimento(ctx.supabase, ctx.tenantId, r.dados, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível estornar.') }
  }
  revalidar()
  return { ok: true }
}

export async function importarXmlAction(entrada: unknown): Promise<Resultado<{ entradaId: string }>> {
  const ctx = await exigirModulo('estoque')
  const r = validar(esquemaXmlNota, entrada)
  if (!r.ok) return falha(r.erros)
  try {
    const entradaId = await criarEntradaDeXml(ctx.supabase, ctx.tenantId, r.dados.xml, autorDe(ctx))
    revalidar()
    return { ok: true, entradaId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível importar a nota.') }
  }
}

export async function criarEntradaManualAction(entrada: unknown): Promise<Resultado<{ entradaId: string }>> {
  const ctx = await exigirModulo('estoque')
  const r = validar(esquemaEntradaManual, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    const entradaId = await criarEntradaManual(ctx.supabase, ctx.tenantId, r.dados, autorDe(ctx))
    revalidar()
    return { ok: true, entradaId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível criar a entrada.') }
  }
}

export async function ligarItemEntradaAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('estoque')
  const r = validar(esquemaLigarItem, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await ligarItemEntrada(ctx.supabase, ctx.tenantId, r.dados.itemId, r.dados.alvo, r.dados.fator)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível ligar o item.') }
  }
  revalidar()
  return { ok: true }
}

export async function concluirEntradaAction(entradaId: string): Promise<Resultado<{ itens: number; contasCriadas: number }>> {
  const ctx = await exigirModulo('estoque')
  const r = validar(uuid, entradaId)
  if (!r.ok) return { ok: false, erro: 'Entrada inválida.' }
  try {
    const res = await concluirEntrada(ctx.supabase, ctx.tenantId, r.dados, autorDe(ctx))
    revalidar()
    revalidatePath('/painel/financeiro', 'layout')
    return { ok: true, ...res }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível concluir a entrada.') }
  }
}

export async function cancelarEntradaAction(entradaId: string): Promise<Resultado> {
  const ctx = await exigirModulo('estoque')
  const r = validar(uuid, entradaId)
  if (!r.ok) return { ok: false, erro: 'Entrada inválida.' }
  try {
    await cancelarEntrada(ctx.supabase, ctx.tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar.') }
  }
  revalidar()
  return { ok: true }
}

export async function aplicarInventarioAction(entrada: unknown): Promise<Resultado<{ inventarioId: string }>> {
  const ctx = await exigirModulo('estoque')
  const r = validar(esquemaInventario, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    const inventarioId = await aplicarInventario(ctx.supabase, ctx.tenantId, r.dados.descricao, r.dados.contagem, autorDe(ctx))
    revalidar()
    return { ok: true, inventarioId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível aplicar o inventário.') }
  }
}

export async function configurarEstoqueProdutoAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('estoque')
  const r = validar(esquemaEstoqueProduto, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await configurarEstoqueProduto(ctx.supabase, ctx.tenantId, r.dados.produtoId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar.') }
  }
  revalidar()
  return { ok: true }
}

export async function salvarInsumoAction(entrada: unknown): Promise<Resultado<{ id: string }>> {
  const ctx = await exigirModulo('producao')
  const r = validar(esquemaInsumo, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    const id = await salvarInsumo(ctx.supabase, ctx.tenantId, r.dados)
    revalidar()
    return { ok: true, id }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar o insumo.') }
  }
}

export async function salvarFichaAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('producao')
  const r = validar(esquemaFicha, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await salvarFicha(ctx.supabase, ctx.tenantId, r.dados.produtoId, r.dados.linhas)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar a ficha.') }
  }
  revalidar()
  return { ok: true }
}
