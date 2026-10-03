/**
 * Junta o modelo (código) com as linhas guardadas (base) e calcula o
 * progresso. Puro: sem React nem Supabase.
 */
import { estaAberta, estaAtendida, estaAvaliada, type EstadoEtapa } from './estados'
import { FRENTE_LANCAMENTO, FRENTES, frenteDoModelo, type FrenteModelo } from './modelo'

/** Uma linha de `cadeia_etapas`, no mínimo. */
export type LinhaEtapa = {
  id: string
  frente: string
  chave: string
  titulo: string
  descricao: string | null
  ordem: number
  estado: EstadoEtapa
  notas: string | null
  url: string | null
  responsavel: string | null
  prevista_em: string | null
  concluida_em: string | null
  personalizada: boolean
}

/** Uma etapa como o console a vê: linha da base (se existir) mais o que o modelo sabe. */
export type EtapaVista = Omit<LinhaEtapa, 'id'> & {
  /** Sem id quando ainda não foi materializada para este tenant. */
  id: string | null
  pergunta: string | null
  fase: number | null
}

export type ResumoFrente = {
  total: number
  avaliadas: number
  atendidas: number
  abertas: number
  /** Onde a equipa deve pegar a seguir: a primeira aberta, senão a primeira por avaliar. */
  proxima: EtapaVista | null
  percentagem: number
}

export type FrenteVista = Omit<FrenteModelo, 'etapas'> & { etapas: EtapaVista[]; resumo: ResumoFrente }

const chaveDe = (frente: string, chave: string) => `${frente}/${chave}`

export function resumirEtapas(etapas: EtapaVista[]): ResumoFrente {
  const total = etapas.length
  const atendidas = etapas.filter((e) => estaAtendida(e.estado)).length
  return {
    total,
    avaliadas: etapas.filter((e) => estaAvaliada(e.estado)).length,
    atendidas,
    abertas: etapas.filter((e) => estaAberta(e.estado)).length,
    proxima: etapas.find((e) => estaAberta(e.estado)) ?? etapas.find((e) => !estaAvaliada(e.estado)) ?? null,
    percentagem: total === 0 ? 0 : Math.round((atendidas / total) * 100),
  }
}

/**
 * Monta a cadeia completa para um tenant. Etapas do modelo sem linha na base
 * aparecem como "não avaliado" e sem id; etapas personalizadas entram no fim
 * da sua frente; frentes que já não estão no modelo continuam visíveis.
 */
export function montarCadeia(linhas: LinhaEtapa[]): FrenteVista[] {
  const porChave = new Map(linhas.map((l) => [chaveDe(l.frente, l.chave), l]))
  const usadas = new Set<string>()

  const frentes: FrenteVista[] = FRENTES.map((modelo) => {
    const etapas: EtapaVista[] = modelo.etapas.map((e, i) => {
      const k = chaveDe(modelo.chave, e.chave)
      const linha = porChave.get(k)
      usadas.add(k)
      return linha
        ? { ...linha, pergunta: e.pergunta, fase: e.fase ?? null }
        : {
            id: null,
            frente: modelo.chave,
            chave: e.chave,
            titulo: e.titulo,
            descricao: e.descricao,
            ordem: i + 1,
            estado: 'nao_avaliado',
            notas: null,
            url: null,
            responsavel: null,
            prevista_em: null,
            concluida_em: null,
            personalizada: false,
            pergunta: e.pergunta,
            fase: e.fase ?? null,
          }
    })
    const personalizadas = linhas
      .filter((l) => l.frente === modelo.chave && !usadas.has(chaveDe(l.frente, l.chave)))
      .sort((a, b) => a.ordem - b.ordem)
      .map((l) => {
        usadas.add(chaveDe(l.frente, l.chave))
        return { ...l, pergunta: null, fase: null }
      })
    const todas = [...etapas, ...personalizadas]
    return { ...modelo, etapas: todas, resumo: resumirEtapas(todas) }
  })

  // Frentes fora do modelo (por exemplo, removidas do código): não se perdem.
  const orfas = linhas.filter((l) => !usadas.has(chaveDe(l.frente, l.chave)))
  const porFrente = new Map<string, LinhaEtapa[]>()
  for (const l of orfas) porFrente.set(l.frente, [...(porFrente.get(l.frente) ?? []), l])
  for (const [frente, lista] of porFrente) {
    const etapas = lista.sort((a, b) => a.ordem - b.ordem).map((l) => ({ ...l, pergunta: null, fase: null }))
    frentes.push({
      chave: frente,
      titulo: frente,
      descricao: 'Frente fora do modelo actual.',
      etapas,
      resumo: resumirEtapas(etapas),
    })
  }

  return frentes
}

/** As linhas que faltam inserir para o tenant ter todas as etapas do modelo. */
export function etapasEmFalta(linhas: Pick<LinhaEtapa, 'frente' | 'chave'>[]) {
  const existentes = new Set(linhas.map((l) => chaveDe(l.frente, l.chave)))
  return FRENTES.flatMap((f) =>
    f.etapas.flatMap((e, i) =>
      existentes.has(chaveDe(f.chave, e.chave))
        ? []
        : [{ frente: f.chave, chave: e.chave, titulo: e.titulo, descricao: e.descricao, ordem: i + 1 }],
    ),
  )
}

/** Os seis pontinhos da lista do console: a frente de lançamento, na ordem do modelo. */
export function pontosLancamento(
  linhas: Array<Pick<LinhaEtapa, 'frente' | 'chave' | 'estado'>>,
): Array<{ chave: string; titulo: string; estado: EstadoEtapa }> {
  const frente = frenteDoModelo(FRENTE_LANCAMENTO)
  return (frente?.etapas ?? []).map((e) => ({
    chave: e.chave,
    titulo: e.titulo,
    estado:
      linhas.find((l) => l.frente === FRENTE_LANCAMENTO && l.chave === e.chave)?.estado ?? 'nao_avaliado',
  }))
}

export function resumirCadeia(frentes: FrenteVista[]): ResumoFrente {
  return resumirEtapas(frentes.flatMap((f) => f.etapas))
}
