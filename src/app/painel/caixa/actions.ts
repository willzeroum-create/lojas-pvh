'use server'

/**
 * Actions do Caixa (abrir, suprimento, sangria, fechamento cego, conferência)
 * e do PDV (vender e cancelar). O PDV exige o módulo `pdv`; o caixa, `caixa`.
 */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import type { Sessao } from '@/lib/auth/sessao'
import { abrirCaixa, conferirCaixa, fecharCaixa, movimentarCaixa, type ResultadoFechamento } from '@/lib/dados/caixa'
import { ErroDados } from '@/lib/dados/erros'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { cancelarVendaBalcao, registarVendaBalcao, type VendaRegistada } from '@/lib/dados/pdv'
import {
  esquemaAbrirCaixa,
  esquemaCancelarVenda,
  esquemaFecharCaixa,
  esquemaMovimentoCaixa,
  esquemaVenda,
} from '@/lib/validacao/caixa'
import { uuid, validar } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string> }

const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)
const nomeDe = (s: Sessao) => s.operador?.nome ?? s.email ?? 'Operador'

function revalidar() {
  revalidatePath('/painel/caixa', 'layout')
  revalidatePath('/painel/pdv')
}

export async function abrirCaixaAction(entrada: unknown): Promise<Resultado<{ sessaoId: string }>> {
  const { supabase, tenantId, sessao } = await exigirModulo('caixa')
  const r = validar(esquemaAbrirCaixa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja) return { ok: false, erro: 'A empresa ainda não tem loja.' }
  try {
    const sessaoId = await abrirCaixa(supabase, tenantId, loja.id, { id: sessao.userId, nome: nomeDe(sessao) }, r.dados.fundoTroco)
    revalidar()
    return { ok: true, sessaoId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível abrir o caixa.') }
  }
}

export async function movimentarCaixaAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId, sessao } = await exigirModulo('caixa')
  const r = validar(esquemaMovimentoCaixa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    await movimentarCaixa(supabase, tenantId, r.dados.sessaoId, r.dados.tipo, r.dados.valor, r.dados.motivo, nomeDe(sessao))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar.') }
  }
  revalidar()
  return { ok: true }
}

export async function fecharCaixaAction(entrada: unknown): Promise<Resultado<{ fechamento: ResultadoFechamento }>> {
  const { supabase, tenantId } = await exigirModulo('caixa')
  const r = validar(esquemaFecharCaixa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const fechamento = await fecharCaixa(supabase, tenantId, r.dados.sessaoId, r.dados.informado, r.dados.justificativa)
    revalidar()
    revalidatePath('/painel/financeiro', 'layout')
    return { ok: true, fechamento }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível fechar o caixa.') }
  }
}

export async function conferirCaixaAction(sessaoId: string): Promise<Resultado> {
  const { supabase, tenantId, sessao } = await exigirModulo('caixa')
  const r = validar(uuid, sessaoId)
  if (!r.ok) return { ok: false, erro: 'Caixa inválido.' }
  try {
    await conferirCaixa(supabase, tenantId, r.dados, nomeDe(sessao))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível conferir.') }
  }
  revalidar()
  return { ok: true }
}

export async function venderAction(entrada: unknown): Promise<Resultado<{ venda: VendaRegistada }>> {
  const { supabase, tenantId, sessao } = await exigirModulo('pdv')
  const r = validar(esquemaVenda, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  const loja = await obterLojaPrincipal(supabase, tenantId)
  if (!loja) return { ok: false, erro: 'A empresa ainda não tem loja.' }
  try {
    const venda = await registarVendaBalcao(
      supabase,
      tenantId,
      {
        lojaId: loja.id,
        itens: r.dados.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade, desconto: i.desconto, observacao: i.observacao })),
        descontoGeral: r.dados.descontoGeral,
        pagamentos: r.dados.pagamentos,
        clienteId: r.dados.clienteId,
        clienteNome: r.dados.clienteNome,
        observacoes: r.dados.observacoes,
      },
      nomeDe(sessao),
    )
    revalidar()
    return { ok: true, venda }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar a venda.') }
  }
}

export async function cancelarVendaAction(entrada: unknown): Promise<Resultado> {
  const { supabase, tenantId, sessao } = await exigirModulo('pdv')
  const r = validar(esquemaCancelarVenda, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    await cancelarVendaBalcao(supabase, tenantId, r.dados.pedidoId, r.dados.motivo, nomeDe(sessao))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar a venda.') }
  }
  revalidar()
  return { ok: true }
}
