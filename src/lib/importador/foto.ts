import 'server-only'

/**
 * Importador de cardápio a partir de uma foto (cardápio de papel, quadro,
 * print de outra plataforma). Claude lê a imagem e devolve a lista de itens
 * num formato fixo; o operador revê tudo antes de gravar.
 *
 * A foto é reduzida no browser antes de chegar aqui (ver `importador.tsx`),
 * por isso cabe folgadamente no limite de imagem da API.
 */
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import type { LinhaBruta } from './planilha'

const MODELO = 'claude-opus-5'

const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
type TipoImagem = (typeof TIPOS_IMAGEM)[number]

const esquemaExtracao = z.object({
  itens: z.array(
    z.object({
      categoria: z
        .string()
        .describe('Secção do cardápio onde o item aparece. Se não houver secções, usar "Geral".'),
      nome: z.string().describe('Nome do item exactamente como está escrito.'),
      descricao: z.string().describe('Ingredientes ou detalhes escritos junto ao item. Vazio se não houver.'),
      preco: z.number().describe('Preço em reais, como número. Ex.: 18.5'),
    }),
  ),
  aviso: z
    .string()
    .describe(
      'Observações para quem vai rever: itens sem preço legível, partes cortadas, dúvidas de leitura. Vazio se não houver.',
    ),
})

const INSTRUCOES = `Você lê fotos de cardápios de pequenos comércios de alimentação no Brasil (lanchonete, pastelaria, marmitaria, açaí, pizzaria) e transcreve os itens.

Regras:
- Transcreva todos os itens com nome e preço legíveis. Mantenha a grafia original dos nomes.
- Use as secções do cardápio como categoria. Sem secções, use "Geral".
- Preço em reais como número (18,50 → 18.5). Se um item tem vários tamanhos com preços diferentes, crie um item por tamanho, com o tamanho no nome (ex.: "Açaí 300 ml", "Açaí 500 ml").
- Nunca invente preços. Item sem preço legível: não inclua e mencione no aviso.
- Se a imagem não for um cardápio, devolva a lista vazia e explique no aviso.`

export type ResultadoFoto = { ok: true; linhas: LinhaBruta[]; aviso?: string } | { ok: false; erro: string }

export async function importarDeFoto(ficheiro: File): Promise<ResultadoFoto> {
  if (!TIPOS_IMAGEM.includes(ficheiro.type as TipoImagem)) {
    return {
      ok: false,
      erro: 'Formato não suportado. Envie JPG, PNG ou WebP (fotos HEIC do iPhone: exporte como JPG).',
    }
  }

  const client = new Anthropic()
  const dados = Buffer.from(await ficheiro.arrayBuffer()).toString('base64')

  const resposta = await client.messages.parse({
    model: MODELO,
    max_tokens: 16000,
    system: INSTRUCOES,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: ficheiro.type as TipoImagem, data: dados } },
          { type: 'text', text: 'Transcreva este cardápio.' },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(esquemaExtracao) },
  })

  if (resposta.stop_reason === 'refusal') {
    return {
      ok: false,
      erro: 'A leitura da imagem foi recusada pelo modelo. Tente outra foto ou use uma planilha.',
    }
  }
  if (resposta.stop_reason === 'max_tokens') {
    return {
      ok: false,
      erro: 'O cardápio é grande demais para uma leitura só. Fotografe por partes (uma secção de cada vez).',
    }
  }
  const extraido = resposta.parsed_output
  if (!extraido)
    return { ok: false, erro: 'Não foi possível interpretar a resposta do modelo. Tente de novo.' }

  const linhas: LinhaBruta[] = extraido.itens
    .filter((i) => i.nome.trim() && Number.isFinite(i.preco) && i.preco >= 0)
    .map((i) => ({
      categoria: i.categoria.trim() || 'Geral',
      nome: i.nome.trim(),
      descricao: i.descricao.trim() || undefined,
      preco: Math.round(i.preco * 100) / 100,
    }))

  if (linhas.length === 0) {
    return { ok: false, erro: extraido.aviso.trim() || 'Não encontrei itens com nome e preço nesta imagem.' }
  }
  return { ok: true, linhas, aviso: extraido.aviso.trim() || undefined }
}
