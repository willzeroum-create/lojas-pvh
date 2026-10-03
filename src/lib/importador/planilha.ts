/**
 * Importador de cardápio a partir de planilha (CSV ou XLSX).
 *
 * Aceita duas formas comuns:
 *   1. Tabela com cabeçalho: categoria | nome | descrição | preço (qualquer ordem,
 *      nomes aproximados: "produto", "item", "valor", "preco"…).
 *   2. Lista "de papel": uma linha só com o nome da categoria, seguida das
 *      linhas de produtos (nome, descrição, preço).
 *
 * Devolve linhas brutas para o operador rever antes de gravar. Nunca grava.
 */
import { read, utils } from 'xlsx'
import { interpretarBRL } from '@/lib/dominio/moeda'

export type LinhaBruta = { categoria: string; nome: string; descricao?: string; preco: number }

const chave = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

const NOMES_COLUNA = {
  categoria: ['categoria', 'secao', 'seccao', 'grupo', 'tipo'],
  nome: ['nome', 'produto', 'item', 'prato', 'lanche', 'descricao curta'],
  descricao: ['descricao', 'detalhes', 'ingredientes', 'composicao', 'obs'],
  preco: ['preco', 'valor', 'r$', 'price'],
} as const

type Colunas = Partial<Record<keyof typeof NOMES_COLUNA, number>>
/** Um cabeçalho só é válido se tiver, pelo menos, nome e preço. */
type Cabecalho = Colunas & { nome: number; preco: number }

function detectarCabecalho(linha: unknown[]): Cabecalho | null {
  const colunas: Colunas = {}
  linha.forEach((celula, i) => {
    const c = chave(celula)
    for (const [campo, nomes] of Object.entries(NOMES_COLUNA) as Array<
      [keyof typeof NOMES_COLUNA, readonly string[]]
    >) {
      if (colunas[campo] === undefined && nomes.some((n) => c === n || c.startsWith(n))) colunas[campo] = i
    }
  })
  const { nome, preco } = colunas
  return nome !== undefined && preco !== undefined ? { ...colunas, nome, preco } : null
}

/** Divide um CSV simples, respeitando aspas, com `;` ou `,`. */
export function lerCsv(texto: string): string[][] {
  const separador = (texto.match(/;/g)?.length ?? 0) > (texto.match(/,/g)?.length ?? 0) ? ';' : ','
  const linhas: string[][] = []
  let atual: string[] = []
  let celula = ''
  let entreAspas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]!
    if (entreAspas) {
      if (c === '"' && texto[i + 1] === '"') {
        celula += '"'
        i++
      } else if (c === '"') entreAspas = false
      else celula += c
    } else if (c === '"') entreAspas = true
    else if (c === separador) {
      atual.push(celula)
      celula = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      atual.push(celula)
      linhas.push(atual)
      atual = []
      celula = ''
    } else celula += c
  }
  if (celula !== '' || atual.length > 0) {
    atual.push(celula)
    linhas.push(atual)
  }
  return linhas.filter((l) => l.some((v) => v.trim() !== ''))
}

export function lerFicheiro(conteudo: ArrayBuffer | Uint8Array, nomeFicheiro: string): unknown[][] {
  if (/\.csv$|\.txt$/i.test(nomeFicheiro)) {
    return lerCsv(new TextDecoder('utf-8').decode(conteudo))
  }
  const livro = read(conteudo, { type: 'array' })
  const primeira = livro.SheetNames[0]
  if (!primeira) return []
  return utils.sheet_to_json<unknown[]>(livro.Sheets[primeira]!, { header: 1, blankrows: false, defval: '' })
}

/** Transforma a matriz de células em linhas de importação. */
export function interpretarLinhas(matriz: unknown[][]): LinhaBruta[] {
  if (matriz.length === 0) return []
  const cabecalho = detectarCabecalho(matriz[0]!)
  const corpo = cabecalho ? matriz.slice(1) : matriz
  // Com cabeçalho, uma coluna ausente é -1 (não existe). Sem cabeçalho, assume-se a ordem clássica.
  const colunas: Required<Colunas> = cabecalho
    ? {
        categoria: cabecalho.categoria ?? -1,
        nome: cabecalho.nome,
        descricao: cabecalho.descricao ?? -1,
        preco: cabecalho.preco,
      }
    : { categoria: 0, nome: 1, descricao: 2, preco: 3 }
  // Sem cabeçalho e com só três colunas: nome, descrição, preço (categoria vem das linhas soltas).
  const semCategoria = !cabecalho && Math.max(...corpo.map((l) => l.length)) <= 3
  if (semCategoria) Object.assign(colunas, { categoria: -1, nome: 0, descricao: 1, preco: 2 })

  const texto = (l: unknown[], i: number) => (i >= 0 ? String(l[i] ?? '').trim() : '')
  const saida: LinhaBruta[] = []
  let categoriaAtual = 'Geral'

  for (const linha of corpo) {
    const nome = texto(linha, colunas.nome)
    const preco = interpretarBRL(texto(linha, colunas.preco))
    const categoria = texto(linha, colunas.categoria)
    const preenchidas = linha.filter((v) => String(v ?? '').trim() !== '').length

    // Linha só com um texto e sem preço: é o nome de uma categoria.
    if (preco === null && preenchidas === 1) {
      const unico = linha.find((v) => String(v ?? '').trim() !== '')
      categoriaAtual = String(unico).trim()
      continue
    }
    if (!nome || preco === null) continue
    if (categoria) categoriaAtual = categoria

    saida.push({
      categoria: categoriaAtual,
      nome,
      descricao: texto(linha, colunas.descricao) || undefined,
      preco,
    })
  }
  return saida
}

export function importarDePlanilha(conteudo: ArrayBuffer | Uint8Array, nomeFicheiro: string): LinhaBruta[] {
  return interpretarLinhas(lerFicheiro(conteudo, nomeFicheiro))
}
