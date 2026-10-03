import 'server-only'

/**
 * A biblioteca de ficheiros de cada empresa. O ficheiro em si vive no bucket
 * privado `arquivos`; aqui fica o índice e a criação de links assinados para
 * ver e descarregar. Só operadores (RLS e políticas do Storage).
 */
import { eImagem } from '@/lib/dominio/ficheiro'
import type { Cliente } from '@/lib/supabase/server'
import type { ArquivoLinha } from '@/lib/supabase/tipos'
import type { RegistarArquivo } from '@/lib/validacao/arquivos'
import type { Autor } from './cadeia'
import { ErroDados, garantir, ouErro } from './erros'

export const BUCKET_ARQUIVOS = 'arquivos'
const VALIDADE_LINK_S = 60 * 60

export type Arquivo = ArquivoLinha & { url: string | null; imagem: boolean }

export async function listarArquivos(supabase: Cliente, tenantId: string): Promise<Arquivo[]> {
  const linhas = ouErro(
    await supabase
      .from('arquivos')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('criado_em', { ascending: false }),
    'Não foi possível listar os arquivos',
  )
  if (linhas.length === 0) return []

  // Um link assinado por ficheiro, válido uma hora: chega para ver e descarregar.
  const { data: assinados } = await supabase.storage.from(BUCKET_ARQUIVOS).createSignedUrls(
    linhas.map((l) => l.caminho),
    VALIDADE_LINK_S,
  )
  const urlPorCaminho = new Map((assinados ?? []).map((a) => [a.path, a.signedUrl]))
  return linhas.map((l) => ({
    ...l,
    url: urlPorCaminho.get(l.caminho) ?? null,
    imagem: eImagem(l.tipo),
  }))
}

export function pastasDe(arquivos: Pick<ArquivoLinha, 'pasta'>[]): Array<{ pasta: string; total: number }> {
  const contagem = new Map<string, number>()
  for (const a of arquivos) contagem.set(a.pasta, (contagem.get(a.pasta) ?? 0) + 1)
  return [...contagem.entries()]
    .map(([pasta, total]) => ({ pasta, total }))
    .sort((a, b) => a.pasta.localeCompare(b.pasta))
}

export async function registarArquivo(
  supabase: Cliente,
  dados: RegistarArquivo,
  autor: Autor,
): Promise<ArquivoLinha> {
  return ouErro(
    await supabase
      .from('arquivos')
      .insert({
        tenant_id: dados.tenantId,
        pasta: dados.pasta,
        nome: dados.nome,
        caminho: dados.caminho,
        tipo: dados.tipo,
        tamanho: dados.tamanho,
        autor_id: autor.id,
        autor_nome: autor.nome,
      })
      .select('*')
      .single(),
    'Não foi possível registar o arquivo',
  )
}

/** Apaga o índice e o ficheiro no bucket. */
export async function eliminarArquivo(supabase: Cliente, tenantId: string, id: string): Promise<void> {
  const { data: arquivo, error } = await supabase
    .from('arquivos')
    .select('caminho')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .maybeSingle()
  if (error) throw new ErroDados(`Não foi possível ler o arquivo: ${error.message}`, error)
  if (!arquivo) throw new ErroDados('Arquivo não encontrado')
  const { error: erroStorage } = await supabase.storage.from(BUCKET_ARQUIVOS).remove([arquivo.caminho])
  if (erroStorage) throw new ErroDados(`Não foi possível apagar o ficheiro: ${erroStorage.message}`)
  garantir(
    await supabase.from('arquivos').delete().eq('tenant_id', tenantId).eq('id', id),
    'Não foi possível apagar o registo',
  )
}

export async function contarArquivos(supabase: Cliente, tenantId: string): Promise<number> {
  const { count } = await supabase
    .from('arquivos')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
  return count ?? 0
}
