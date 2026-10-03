import { describe, expect, it } from 'vitest'
import { estaAberta, estaAtendida } from '@/lib/cadeia/estados'
import { FRENTES } from '@/lib/cadeia/modelo'
import {
  etapasEmFalta,
  montarCadeia,
  pontosLancamento,
  resumirCadeia,
  type LinhaEtapa,
} from '@/lib/cadeia/progresso'

function linha(parcial: Partial<LinhaEtapa> & Pick<LinhaEtapa, 'frente' | 'chave'>): LinhaEtapa {
  return {
    id: `id-${parcial.frente}-${parcial.chave}`,
    titulo: parcial.chave,
    descricao: null,
    ordem: 0,
    estado: 'nao_avaliado',
    notas: null,
    url: null,
    responsavel: null,
    prevista_em: null,
    concluida_em: null,
    personalizada: false,
    ...parcial,
  }
}

const TOTAL_MODELO = FRENTES.reduce((n, f) => n + f.etapas.length, 0)

describe('modelo', () => {
  it('não tem chaves repetidas dentro de uma frente nem frentes repetidas', () => {
    const frentes = FRENTES.map((f) => f.chave)
    expect(new Set(frentes).size).toBe(frentes.length)
    for (const f of FRENTES) {
      const chaves = f.etapas.map((e) => e.chave)
      expect(new Set(chaves).size).toBe(chaves.length)
    }
  })

  it('mantém as seis etapas do brief na frente de lançamento, pela ordem', () => {
    const lancamento = FRENTES.find((f) => f.chave === 'lancamento')!
    expect(lancamento.etapas.map((e) => e.chave)).toEqual([
      'cadastro',
      'cardapio',
      'fotos',
      'pagina',
      'google',
      'cobranca',
    ])
  })
})

describe('montarCadeia', () => {
  it('sem linhas, mostra o modelo inteiro como não avaliado e sem id', () => {
    const frentes = montarCadeia([])
    expect(frentes.map((f) => f.chave)).toEqual(FRENTES.map((f) => f.chave))
    const todas = frentes.flatMap((f) => f.etapas)
    expect(todas).toHaveLength(TOTAL_MODELO)
    expect(todas.every((e) => e.id === null && e.estado === 'nao_avaliado')).toBe(true)
    expect(resumirCadeia(frentes)).toMatchObject({
      total: TOTAL_MODELO,
      atendidas: 0,
      avaliadas: 0,
      percentagem: 0,
    })
  })

  it('usa a linha da base quando existe e junta a pergunta do modelo', () => {
    const frentes = montarCadeia([
      linha({
        frente: 'presenca_digital',
        chave: 'instagram',
        estado: 'ja_tinha',
        url: 'https://instagram.com/x',
        titulo: 'Instagram',
      }),
    ])
    const presenca = frentes.find((f) => f.chave === 'presenca_digital')!
    const instagram = presenca.etapas.find((e) => e.chave === 'instagram')!
    expect(instagram).toMatchObject({
      id: 'id-presenca_digital-instagram',
      estado: 'ja_tinha',
      url: 'https://instagram.com/x',
      pergunta: 'Já tem Instagram?',
    })
    expect(presenca.resumo).toMatchObject({ total: 7, atendidas: 1, avaliadas: 1, abertas: 0 })
  })

  it('acrescenta etapas personalizadas no fim da frente, por ordem', () => {
    const frentes = montarCadeia([
      linha({
        frente: 'canais',
        chave: 'quiosque',
        titulo: 'Quiosque no shopping',
        ordem: 2,
        personalizada: true,
      }),
      linha({ frente: 'canais', chave: 'feira', titulo: 'Barraca na feira', ordem: 1, personalizada: true }),
    ])
    const canais = frentes.find((f) => f.chave === 'canais')!
    expect(canais.etapas.slice(-2).map((e) => e.titulo)).toEqual(['Barraca na feira', 'Quiosque no shopping'])
    expect(canais.etapas.at(-1)!.pergunta).toBeNull()
  })

  it('não perde linhas de frentes que saíram do modelo', () => {
    const frentes = montarCadeia([linha({ frente: 'antiga', chave: 'x', titulo: 'Coisa antiga' })])
    expect(frentes.at(-1)).toMatchObject({ chave: 'antiga', etapas: [{ titulo: 'Coisa antiga' }] })
  })

  it('a próxima etapa é a primeira aberta, senão a primeira por avaliar', () => {
    const frentes = montarCadeia([
      linha({ frente: 'lancamento', chave: 'cadastro', estado: 'concluido' }),
      linha({ frente: 'lancamento', chave: 'cardapio', estado: 'em_curso' }),
      linha({ frente: 'lancamento', chave: 'fotos', estado: 'pendente' }),
    ])
    const lancamento = frentes.find((f) => f.chave === 'lancamento')!
    expect(lancamento.resumo.proxima?.chave).toBe('cardapio')
    expect(lancamento.resumo).toMatchObject({
      total: 6,
      atendidas: 1,
      avaliadas: 3,
      abertas: 2,
      percentagem: 17,
    })

    const soAvaliadas = montarCadeia([
      linha({ frente: 'lancamento', chave: 'cadastro', estado: 'concluido' }),
    ])
    expect(soAvaliadas.find((f) => f.chave === 'lancamento')!.resumo.proxima?.chave).toBe('cardapio')
  })
})

describe('etapasEmFalta', () => {
  it('lista tudo quando não há nada e só o que falta quando há algo', () => {
    expect(etapasEmFalta([])).toHaveLength(TOTAL_MODELO)
    const faltam = etapasEmFalta([
      { frente: 'lancamento', chave: 'cadastro' },
      { frente: 'operacao', chave: 'estoque' },
    ])
    expect(faltam).toHaveLength(TOTAL_MODELO - 2)
    expect(faltam.find((f) => f.frente === 'lancamento' && f.chave === 'cardapio')).toMatchObject({
      titulo: 'Cardápio carregado',
      ordem: 2,
    })
  })
})

describe('pontosLancamento', () => {
  it('devolve as seis etapas do lançamento pela ordem, ignorando personalizadas', () => {
    const pontos = pontosLancamento([
      linha({ frente: 'lancamento', chave: 'pagina', estado: 'concluido' }),
      linha({ frente: 'lancamento', chave: 'extra', titulo: 'Extra', personalizada: true }),
    ])
    expect(pontos.map((p) => p.chave)).toEqual([
      'cadastro',
      'cardapio',
      'fotos',
      'pagina',
      'google',
      'cobranca',
    ])
    expect(pontos[3]!.estado).toBe('concluido')
  })
})

describe('estados', () => {
  it('classifica atendidas e abertas', () => {
    expect(estaAtendida('ja_tinha')).toBe(true)
    expect(estaAtendida('nao_aplica')).toBe(true)
    expect(estaAtendida('pendente')).toBe(false)
    expect(estaAberta('em_curso')).toBe(true)
    expect(estaAberta('concluido')).toBe(false)
  })
})
