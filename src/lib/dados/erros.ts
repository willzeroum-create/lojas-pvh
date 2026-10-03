import type { PostgrestError } from '@supabase/supabase-js'

/** Erro de dados com mensagem já pensada para o ecrã. */
export class ErroDados extends Error {
  constructor(
    mensagem: string,
    readonly causa?: PostgrestError | Error,
  ) {
    super(mensagem)
    this.name = 'ErroDados'
  }
}

function lancar(erro: PostgrestError, contexto: string): never {
  const detalhe = erro.code === '23505' ? 'já existe um registo igual' : erro.message
  throw new ErroDados(`${contexto}: ${detalhe}`, erro)
}

/** Leituras: lança um `ErroDados` legível se a resposta trouxer erro e garante dados não nulos. */
export function ouErro<T>(
  resposta: { data: T; error: PostgrestError | null },
  contexto: string,
): NonNullable<T> {
  if (resposta.error) lancar(resposta.error, contexto)
  if (resposta.data == null) throw new ErroDados(`${contexto}: sem dados`)
  return resposta.data
}

/** Escritas sem retorno: só verifica o erro. */
export function garantir(resposta: { error: PostgrestError | null }, contexto: string): void {
  if (resposta.error) lancar(resposta.error, contexto)
}
