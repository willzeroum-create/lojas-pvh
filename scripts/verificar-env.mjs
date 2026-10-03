/**
 * Mostra quais variáveis de `.env.local` estão preenchidas, sem revelar os
 * valores. Útil antes de `pnpm dev`, `pnpm migrar` e `pnpm operador`.
 *
 *   pnpm env:verificar
 */
import { existsSync, readFileSync } from 'node:fs'

const ESPERADAS = [
  ['NEXT_PUBLIC_SUPABASE_URL', 'obrigatória'],
  ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'obrigatória'],
  ['SUPABASE_SECRET_KEY', 'obrigatória para pedidos, tenants e operador'],
  ['SUPABASE_DB_URL', 'só para pnpm migrar'],
  ['ANTHROPIC_API_KEY', 'só para o importador por foto'],
  ['NEXT_PUBLIC_URL_BASE', 'links absolutos'],
  ['NEXT_PUBLIC_WHATSAPP_COMERCIAL', 'botões da landing (sem ele levam ao contacto)'],
  ['PVH_SEGREDO_EQUIPE', 'opcional: assina o PIN da equipe (senão deriva da chave secreta)'],
  ['PVH_CHAVE_SEGREDOS', 'opcional: cifra tokens fiscal/Pix (senão deriva da chave secreta)'],
  ['PVH_SEGREDO_WEBHOOKS', 'opcional: assina as URLs de aviso Focus/Mercado Pago'],
  ['CRON_SECRET', 'resumo diário automático (Vercel Cron)'],
  ['WHATSAPP_TOKEN', 'resumo automático: API oficial do WhatsApp'],
  ['WHATSAPP_PHONE_NUMBER_ID', 'resumo automático: número que envia'],
  ['WHATSAPP_TEMPLATE_RESUMO', 'resumo automático: modelo aprovado'],
]

if (!existsSync('.env.local')) {
  console.log('.env.local não existe. Copie .env.example para .env.local e preencha.')
  process.exit(1)
}

const definidas = new Map()
for (const linha of readFileSync('.env.local', 'utf8').split('\n')) {
  const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) definidas.set(m[1], m[2].replace(/^["']|["']$/g, '').trim())
}

let faltam = 0
for (const [nome, nota] of ESPERADAS) {
  const valor = definidas.get(nome)
  const porPreencher = !valor || /^COLE_AQUI|xxxx|^sk-ant-xxx|SENHA@/.test(valor)
  const estado = !porPreencher ? 'preenchida' : valor === undefined ? 'AUSENTE' : 'POR PREENCHER'
  if (porPreencher && nota.startsWith('obrigatória')) faltam++
  console.log(`${estado.padEnd(10)} ${nome.padEnd(38)} ${nota}`)
}
process.exit(faltam > 0 ? 1 : 0)
