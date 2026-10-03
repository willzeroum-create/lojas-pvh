/**
 * A equipa entra com um nome de utilizador curto ("will"), mas o Supabase Auth
 * só conhece e-mails. Um nome vira `nome@<domínio da equipa>`, um domínio que
 * não existe na Internet e nunca recebe correio; um e-mail completo passa como
 * está. Tudo em minúsculas, para "Will" e "will" serem a mesma pessoa.
 */
export const DOMINIO_EQUIPE = 'equipe.pvh.local'

const NOME_DE_UTILIZADOR = /^[a-z0-9](?:[a-z0-9._-]{0,38}[a-z0-9])?$/

export type Identificador = { ok: true; email: string } | { ok: false; erro: string }

export function normalizarIdentificador(entrada: string, dominio = DOMINIO_EQUIPE): Identificador {
  const texto = entrada.trim().toLowerCase()
  if (!texto) return { ok: false, erro: 'Informe o e-mail ou o nome de usuário' }
  if (texto.includes('@')) return { ok: true, email: texto }
  if (!NOME_DE_UTILIZADOR.test(texto)) {
    return { ok: false, erro: 'Nome de usuário só com letras, números, ponto, hífen ou sublinhado' }
  }
  return { ok: true, email: `${texto}@${dominio}` }
}

/** O que se mostra à equipa: "will" em vez de "will@equipe.pvh.local"; e-mails reais ficam inteiros. */
export function nomeDeUtilizador(email: string | null | undefined, dominio = DOMINIO_EQUIPE): string {
  if (!email) return ''
  const sufixo = `@${dominio}`
  return email.endsWith(sufixo) ? email.slice(0, -sufixo.length) : email
}
