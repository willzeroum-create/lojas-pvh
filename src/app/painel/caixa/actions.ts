'use server'

/**
 * Actions do Caixa (abrir, suprimento, sangria, fechamento cego, conferência)
 * e do PDV (vender e cancelar). O PDV exige o módulo `pdv`; o caixa, `caixa`.
 * Com a equipe ligada, sangria, diferença no fechamento, desconto acima do
 * limite do papel e cancelamento pedem o PIN de um gerente (`pinGerente`).
 */
import { revalidatePath } from 'next/cache'
import { autorDe, exigirAprovacao, exigirModulo } from '@/lib/auth/guardas'
import { abrirCaixa, conferirCaixa, detalheCaixa, fecharCaixa, movimentarCaixa, type ResultadoFechamento } from '@/lib/dados/caixa'
import { ErroDados, pedeGerente } from '@/lib/dados/erros'
import { listarPessoas } from '@/lib/dados/clientes'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { cancelarVendaBalcao, registarVendaBalcao, subtotalDaVenda, type VendaRegistada } from '@/lib/dados/pdv'
import { conferir } from '@/lib/dominio/caixa'
import { formatarBRL } from '@/lib/dominio/moeda'
import { descontoPrecisaAprovacao } from '@/lib/equipe/papeis'
import {
  esquemaAbrirCaixa,
  esquemaCancelarVenda,
  esquemaFecharCaixa,
  esquemaMovimentoCaixa,
  esquemaVenda,
} from '@/lib/validacao/caixa'
import { uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string; porCampo?: Record<string, string>; precisaGerente?: boolean }

const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)
const pin = z.object({ pinGerente: z.preprocess((v) => (v === '' ? undefined : v), z.string().regex(/^\d{4,6}$/).optional()) })

function revalidar() {
  revalidatePath('/painel/caixa', 'layout')
  revalidatePath('/painel/pdv')
}

export async function abrirCaixaAction(entrada: unknown): Promise<Resultado<{ sessaoId: string }>> {
  const ctx = await exigirModulo('caixa')
  const r = validar(esquemaAbrirCaixa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  const loja = await obterLojaPrincipal(ctx.supabase, ctx.tenantId)
  if (!loja) return { ok: false, erro: 'A empresa ainda não tem loja.' }
  try {
    const sessaoId = await abrirCaixa(ctx.supabase, ctx.tenantId, loja.id, { id: ctx.sessao.userId, nome: autorDe(ctx) }, r.dados.fundoTroco)
    revalidar()
    return { ok: true, sessaoId }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível abrir o caixa.') }
  }
}

export async function movimentarCaixaAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('caixa')
  const r = validar(esquemaMovimentoCaixa.and(pin), entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    if (r.dados.tipo === 'sangria') {
      await exigirAprovacao(ctx, 'sangria', `Sangria de ${formatarBRL(r.dados.valor)}: ${r.dados.motivo}`, r.dados.pinGerente, r.dados.sessaoId)
    }
    await movimentarCaixa(ctx.supabase, ctx.tenantId, r.dados.sessaoId, r.dados.tipo, r.dados.valor, r.dados.motivo, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar.'), precisaGerente: pedeGerente(e) }
  }
  revalidar()
  return { ok: true }
}

export async function fecharCaixaAction(entrada: unknown): Promise<Resultado<{ fechamento: ResultadoFechamento }>> {
  const ctx = await exigirModulo('caixa')
  const r = validar(esquemaFecharCaixa.and(pin), entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const atual = await detalheCaixa(ctx.supabase, ctx.tenantId, r.dados.sessaoId)
    if (atual) {
      const c = conferir(atual.esperado, r.dados.informado)
      if (!c.bate) {
        await exigirAprovacao(ctx, 'diferenca_caixa', `Fechou o caixa com diferença de ${formatarBRL(c.diferencaTotal)}`, r.dados.pinGerente, r.dados.sessaoId)
      }
    }
    const fechamento = await fecharCaixa(ctx.supabase, ctx.tenantId, r.dados.sessaoId, r.dados.informado, r.dados.justificativa)
    revalidar()
    revalidatePath('/painel/financeiro', 'layout')
    return { ok: true, fechamento }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível fechar o caixa.'), precisaGerente: pedeGerente(e) }
  }
}

export async function conferirCaixaAction(sessaoId: string): Promise<Resultado> {
  const ctx = await exigirModulo('caixa')
  const r = validar(uuid, sessaoId)
  if (!r.ok) return { ok: false, erro: 'Caixa inválido.' }
  if (ctx.equipe && ctx.equipe.papel !== 'gerente') return { ok: false, erro: 'Só um gerente confere o caixa.' }
  try {
    await conferirCaixa(ctx.supabase, ctx.tenantId, r.dados, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível conferir.') }
  }
  revalidar()
  return { ok: true }
}

export async function venderAction(entrada: unknown): Promise<Resultado<{ venda: VendaRegistada }>> {
  const ctx = await exigirModulo('pdv')
  const r = validar(esquemaVenda.and(pin), entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  const loja = await obterLojaPrincipal(ctx.supabase, ctx.tenantId)
  if (!loja) return { ok: false, erro: 'A empresa ainda não tem loja.' }
  try {
    const desconto = r.dados.descontoGeral + r.dados.itens.reduce((s, i) => s + (i.desconto ?? 0), 0)
    if (ctx.equipe && desconto > 0) {
      const subtotal = await subtotalDaVenda(ctx.supabase, ctx.tenantId, r.dados.itens)
      if (descontoPrecisaAprovacao(ctx.equipe.papel, desconto, subtotal)) {
        await exigirAprovacao(ctx, 'desconto_alto', `Desconto de ${formatarBRL(desconto)} numa venda de ${formatarBRL(subtotal)}`, r.dados.pinGerente)
      }
    }
    const venda = await registarVendaBalcao(
      ctx.supabase,
      ctx.tenantId,
      {
        lojaId: loja.id,
        itens: r.dados.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade, desconto: i.desconto, observacao: i.observacao })),
        descontoGeral: r.dados.descontoGeral,
        cashback: r.dados.cashback,
        pagamentos: r.dados.pagamentos,
        clienteId: r.dados.clienteId,
        clienteNome: r.dados.clienteNome,
        observacoes: r.dados.observacoes,
      },
      autorDe(ctx),
    )
    revalidar()
    return { ok: true, venda }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar a venda.'), precisaGerente: pedeGerente(e) }
  }
}

export async function cancelarVendaAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('pdv')
  const r = validar(esquemaCancelarVenda.and(pin), entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    await exigirAprovacao(ctx, 'cancelar_venda', `Cancelou uma venda: ${r.dados.motivo}`, r.dados.pinGerente, r.dados.pedidoId)
    await cancelarVendaBalcao(ctx.supabase, ctx.tenantId, r.dados.pedidoId, r.dados.motivo, autorDe(ctx))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar a venda.'), precisaGerente: pedeGerente(e) }
  }
  revalidar()
  return { ok: true }
}

export type ClientePdv = { id: string; nome: string; contato: string | null }

/** PDV: procurar o cliente por nome, WhatsApp ou CPF (para cashback e histórico). */
export async function buscarClientePdvAction(busca: string): Promise<Resultado<{ clientes: ClientePdv[] }>> {
  const ctx = await exigirModulo('pdv')
  const termo = typeof busca === 'string' ? busca.trim().slice(0, 60) : ''
  if (termo.length < 2) return { ok: true, clientes: [] }
  try {
    const { itens } = await listarPessoas(ctx.supabase, ctx.tenantId, { papel: 'todos', busca: termo, pagina: 1 })
    return {
      ok: true,
      clientes: itens.slice(0, 8).map((p) => ({
        id: p.id,
        nome: p.nome,
        // Só os últimos dígitos: o ecrã do caixa fica virado para o cliente.
        contato: p.whatsapp ? `WhatsApp …${p.whatsapp.slice(-4)}` : p.documento ? `Doc. …${p.documento.slice(-3)}` : null,
      })),
    }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível procurar.') }
  }
}
