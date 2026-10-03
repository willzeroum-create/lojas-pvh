'use server'

/** Nota fiscal no painel: emitir a NFC-e de uma venda, cancelar e listar. */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import { ErroDados } from '@/lib/dados/erros'
import { cancelarNfce, emitirNfce } from '@/lib/dados/fiscal'
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
