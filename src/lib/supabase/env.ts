/**
 * Leitura das variáveis de ambiente do Supabase com erros claros. Lida em
 * tempo de execução, não de importação, para o `next build` passar sem
 * `.env.local`.
 */

function exigir(nome: string): string {
  const valor = process.env[nome]
  if (!valor) {
    throw new Error(`Falta a variável de ambiente ${nome}. Copie .env.example para .env.local e preencha.`)
  }
  return valor
}

export function envPublico() {
  return {
    url: exigir('NEXT_PUBLIC_SUPABASE_URL'),
    chave: exigir('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  }
}

export function chaveSecreta(): string {
  return exigir('SUPABASE_SECRET_KEY')
}
