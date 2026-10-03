'use server'

/**
 * Actions do módulo Clientes. Todas passam por `exigirModulo('clientes')`:
 * sem o módulo ligado não se lê nem se grava nada.
 */
import { revalidatePath } from 'next/cache'
import { exigirModulo } from '@/lib/auth/guardas'
import { anonimizarPessoa, salvarPessoa } from '@/lib/dados/clientes'
import { ErroDados } from '@/lib/dados/erros'
import { lerDocumento } from '@/lib/dominio/documento'
import { consultarCep, consultarCnpj, type EmpresaConsultada, type EnderecoConsultado } from '@/lib/integracoes/consultas'
import { esquemaPessoa } from '@/lib/validacao/clientes'
import { uuid, validar } from '@/lib/validacao/zod'

export type ResultadoSalvar =
  | { ok: true; id: string }
  | { ok: false; erro: string; porCampo?: Record<string, string> }

export async function salvarPessoaAction(entrada: unknown): Promise<ResultadoSalvar> {
  const { supabase, tenantId } = await exigirModulo('clientes')
  const r = validar(esquemaPessoa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos', porCampo: r.porCampo }
  try {
    const id = await salvarPessoa(supabase, tenantId, r.dados)
    revalidatePath('/painel/clientes')
    revalidatePath(`/painel/clientes/${id}`)
    return { ok: true, id }
  } catch (e) {
    return { ok: false, erro: e instanceof ErroDados ? e.message : 'Não foi possível guardar.' }
  }
}

/** Preenche o cadastro a partir do CNPJ (dados abertos da Receita). */
export async function consultarCnpjAction(
  cnpj: string,
): Promise<{ ok: true; empresa: EmpresaConsultada } | { ok: false; erro: string }> {
  await exigirModulo('clientes')
  const doc = lerDocumento(cnpj)
  if (doc?.tipo !== 'pj') return { ok: false, erro: 'CNPJ inválido.' }
  const empresa = await consultarCnpj(doc.digitos)
  return empresa ? { ok: true, empresa } : { ok: false, erro: 'Não encontramos este CNPJ agora. Preencha à mão.' }
}

export async function consultarCepAction(
  cep: string,
): Promise<{ ok: true; endereco: EnderecoConsultado } | { ok: false; erro: string }> {
  await exigirModulo('clientes')
  const endereco = await consultarCep(cep)
  return endereco ? { ok: true, endereco } : { ok: false, erro: 'CEP não encontrado. Preencha à mão.' }
}

export async function anonimizarPessoaAction(id: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  const { supabase, tenantId } = await exigirModulo('clientes')
  const r = validar(uuid, id)
  if (!r.ok) return { ok: false, erro: 'Pessoa inválida.' }
  try {
    await anonimizarPessoa(supabase, tenantId, r.dados)
  } catch (e) {
    return { ok: false, erro: e instanceof ErroDados ? e.message : 'Não foi possível anonimizar.' }
  }
  revalidatePath('/painel/clientes')
  revalidatePath(`/painel/clientes/${r.dados}`)
  return { ok: true }
}
