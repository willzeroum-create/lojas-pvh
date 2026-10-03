'use server'

/**
 * Actions do Estoque e das fichas técnicas. Estoque exige o módulo `estoque`;
 * fichas e insumos exigem `producao`.
 */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import type { Sessao } from '@/lib/auth/sessao'
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
const nomeDe = (s: Sessao) => s.operador?.nome ?? s.email ?? 'Equipe'
const falha = (erros: string[], porCampo?: Record<string, string>) => ({ ok: false as const, erro: erros[0] ?? 'Dados inválidos', porCampo })

function revalidar() {
  revalidatePath('/painel/estoque', 'layout')
}

export async function registarSaidaAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId, sessao } = await exigirModulo('estoque')
  const r = validar(esquemaSaida, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await registarSaida(supabase, tenantId, r.dados.item, r.dados.quantidade, r.dados.motivo, nomeDe(sessao))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar a saída.') }
  }
  revalidar()
  return { ok: true }
}

export async function estornarMovimentoAction(movimentoId: string): Promise<Resultado> {
  const { supabase, tenantId, sessao } = await exigirModulo('estoque')
  const r = validar(uuid, movimentoId)
  if (!r.ok) return { ok: false, erro: 'Movimento inválido.' }
  try {
    await estornarMovimento(supabase, tenantId, r.dados, nomeDe(sessao))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível estornar.') }
  }
  revalidar()
  return { ok: true }
}

export async function importarXmlAction(entrada: unknown): Promise<Resultado<{ entradaId: string }>> {
  const { supabase, tenantId, sessao } = await exigirModulo('estoque')
  const r = validar(esquemaXmlNota, entrada)
  if (!r.ok) return falha(r.erros)
  try {
    const entradaId = await criarEntradaDeXml(supabase, tenantId, r.dados.xml, nomeDe(sessao))
    revalidar()
    return { ok: true, entradaId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível importar a nota.') }
  }
}

export async function criarEntradaManualAction(entrada: unknown): Promise<Resultado<{ entradaId: string }>> {
  const { supabase, tenantId, sessao } = await exigirModulo('estoque')
  const r = validar(esquemaEntradaManual, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    const entradaId = await criarEntradaManual(supabase, tenantId, r.dados, nomeDe(sessao))
    revalidar()
    return { ok: true, entradaId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível criar a entrada.') }
  }
}

export async function ligarItemEntradaAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('estoque')
  const r = validar(esquemaLigarItem, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await ligarItemEntrada(supabase, tenantId, r.dados.itemId, r.dados.alvo, r.dados.fator)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível ligar o item.') }
  }
  revalidar()
  return { ok: true }
}

export async function concluirEntradaAction(entradaId: string): Promise<Resultado<{ itens: number; contasCriadas: number }>> {
  const { supabase, tenantId, sessao } = await exigirModulo('estoque')
  const r = validar(uuid, entradaId)
  if (!r.ok) return { ok: false, erro: 'Entrada inválida.' }
  try {
    const res = await concluirEntrada(supabase, tenantId, r.dados, nomeDe(sessao))
    revalidar()
    revalidatePath('/painel/financeiro', 'layout')
    return { ok: true, ...res }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível concluir a entrada.') }
  }
}

export async function cancelarEntradaAction(entradaId: string): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('estoque')
  const r = validar(uuid, entradaId)
  if (!r.ok) return { ok: false, erro: 'Entrada inválida.' }
  try {
    await cancelarEntrada(supabase, tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar.') }
  }
  revalidar()
  return { ok: true }
}

export async function aplicarInventarioAction(entrada: unknown): Promise<Resultado<{ inventarioId: string }>> {
  const { supabase, tenantId, sessao } = await exigirModulo('estoque')
  const r = validar(esquemaInventario, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    const inventarioId = await aplicarInventario(supabase, tenantId, r.dados.descricao, r.dados.contagem, nomeDe(sessao))
    revalidar()
    return { ok: true, inventarioId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível aplicar o inventário.') }
  }
}

export async function configurarEstoqueProdutoAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('estoque')
  const r = validar(esquemaEstoqueProduto, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await configurarEstoqueProduto(supabase, tenantId, r.dados.produtoId, r.dados)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar.') }
  }
  revalidar()
  return { ok: true }
}

export async function salvarInsumoAction(entrada: unknown): Promise<Resultado<{ id: string }>> {
  const { supabase, tenantId } = await exigirModulo('producao')
  const r = validar(esquemaInsumo, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    const id = await salvarInsumo(supabase, tenantId, r.dados)
    revalidar()
    return { ok: true, id }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar o insumo.') }
  }
}

export async function salvarFichaAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId } = await exigirModulo('producao')
  const r = validar(esquemaFicha, entrada)
  if (!r.ok) return falha(r.erros, r.porCampo)
  try {
    await salvarFicha(supabase, tenantId, r.dados.produtoId, r.dados.linhas)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar a ficha.') }
  }
  revalidar()
  return { ok: true }
}
