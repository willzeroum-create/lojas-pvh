/**
 * Envia para a Vercel as variáveis de `.env.local` que a aplicação precisa em
 * produção e em preview. Os valores vão por stdin para `vercel env add` e
 * nunca aparecem no ecrã.
 *
 *   pnpm env:vercel
 *
 * Precisa da CLI da Vercel autenticada e da pasta ligada a um projecto
 * (`vercel link --project lojas-pvh`). Não envia `SUPABASE_DB_URL` (só serve
 * para migrar a partir da máquina da equipa) nem `NEXT_PUBLIC_URL_BASE`: na
 * Vercel o endereço vem de `VERCEL_PROJECT_PRODUCTION_URL`.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const ENVIAR = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'ANTHROPIC_API_KEY',
  'NEXT_PUBLIC_WHATSAPP_SUPORTE',
]
const AMBIENTES = ['production', 'preview']

const valores = {}
for (const linha of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) valores[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
}

let falhas = 0
for (const nome of ENVIAR) {
  const valor = valores[nome]
  if (!valor || valor.startsWith('COLE_AQUI')) {
    console.log(`- ${nome}: vazio no .env.local, não enviado`)
    continue
  }
  for (const ambiente of AMBIENTES) {
    // `vercel` é um .cmd no Windows e só arranca com shell; os argumentos são constantes deste ficheiro.
    const r = spawnSync('vercel', ['env', 'add', nome, ambiente, '--force'], {
      input: valor,
      encoding: 'utf8',
      shell: true,
    })
    const ok = r.status === 0
    if (!ok) falhas++
    const detalhe = ok
      ? ''
      : ': ' + (r.stdout + r.stderr).replaceAll(valor, '***').trim().split('\n').slice(-2).join(' ')
    console.log(`${ok ? '✓' : '✗'} ${nome} (${ambiente})${detalhe}`)
  }
}
process.exit(falhas ? 1 : 0)
