'use server'

/** Nota fiscal no painel: emitir a NFC-e de uma venda, cancelar e listar. */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { cancelarNfce, emitirNfce, salvarFiscalProduto } from '@/lib/dados/fiscal'
import { lerDocumento } from '@/lib/dominio/documento'
import { uuid, validar, z } from '@/lib/validacao/zod'

export type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string }
const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

const esquemaEmitir = z.object({
  pedidoId: uuid,
  cpfCnpj: z.preprocess((v) => (v === '' ? undefined : v), z.string().refine((s) => lerDocumento(s) !== null, 'CPF ou CNPJ inválido').optional()),
})

export async function emitirNfceAction(
  entrada: unknown,
): Promise<Resultado<{ estado: string; numero: string | null; urlDanfe: string | null; mensagem: string | null }>> {
  const ctx = await exigirModulo('fiscal')
  const r = validar(esquemaEmitir, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    const nota = await emitirNfce(ctx.supabase, ctx.tenantId, r.dados.pedidoId, r.dados.cpfCnpj)
    revalidatePath('/painel/fiscal')
    if (nota.estado === 'rejeitado' || nota.estado === 'erro') return { ok: false, erro: nota.mensagem ?? 'A nota foi rejeitada.' }
    return { ok: true, estado: nota.estado, numero: nota.numero, urlDanfe: nota.urlDanfe, mensagem: nota.mensagem }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível emitir a nota.') }
  }
}

export async function cancelarNfceAction(documentoId: string, justificativa: string): Promise<Resultado> {
  const ctx = await exigirModulo('fiscal')
  const r = validar(z.object({ documentoId: uuid, justificativa: z.string().trim().min(15, 'Mínimo de 15 caracteres').max(255) }), {
    documentoId,
    justificativa,
  })
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    const resposta = await cancelarNfce(ctx.supabase, ctx.tenantId, r.dados.documentoId, r.dados.justificativa)
    revalidatePath('/painel/fiscal')
    return resposta.estado === 'cancelado' ? { ok: true } : { ok: false, erro: resposta.mensagem ?? 'O emissor não confirmou o cancelamento.' }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível cancelar.') }
  }
}

const vazioNulo = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)
const esquemaFiscalProduto = z.object({
  produtoId: uuid,
  ncm: z.preprocess(vazioNulo, z.string().regex(/^[0-9]{8}$/, 'NCM tem 8 dígitos').nullable()),
  cfop: z.string().regex(/^[0-9]{4}$/, 'CFOP tem 4 dígitos'),
  csosn: z.string().regex(/^[0-9]{3}$/, 'CSOSN tem 3 dígitos'),
  origem: z.coerce.number().int().min(0).max(8),
  cest: z.preprocess(vazioNulo, z.string().regex(/^[0-9]{7}$/, 'CEST tem 7 dígitos').nullable()),
})

/** NCM, CFOP, CSOSN, origem e CEST de um produto (o que a nota precisa). */
export async function salvarFiscalProdutoAction(entrada: unknown): Promise<Resultado> {
  const ctx = await exigirModulo('fiscal')
  // NCM e CEST costumam vir com pontos ("2106.90.90"): fica só o número.
  const soDigitos = new Set(['ncm', 'cfop', 'csosn', 'cest'])
  const bruto =
    entrada && typeof entrada === 'object'
      ? Object.fromEntries(Object.entries(entrada).map(([k, v]) => [k, soDigitos.has(k) && typeof v === 'string' ? v.replace(/[^0-9]/g, '') : v]))
      : entrada
  const r = validar(esquemaFiscalProduto, bruto)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    const { produtoId, ...d } = r.dados
    await salvarFiscalProduto(ctx.supabase, ctx.tenantId, produtoId, d)
    revalidatePath('/painel/fiscal')
    revalidatePath('/painel/fiscal/produtos')
    return { ok: true }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar.') }
  }
}
