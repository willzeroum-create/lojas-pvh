import 'server-only'

/**
 * Cadeia de produção, histórico e notas internas de cada empresa. Só
 * operadores chegam aqui (RLS), com o cliente de sessão.
 */
import { estaAtendida, type EstadoEtapa } from '@/lib/cadeia/estados'
import { etapaDoModelo } from '@/lib/cadeia/modelo'
import { etapasEmFalta, montarCadeia, type FrenteVista } from '@/lib/cadeia/progresso'
import { gerarSlug } from '@/lib/dominio/slug'
import type { Cliente } from '@/lib/supabase/server'
import type { CadeiaEtapaLinha, CadeiaRegistoLinha, NotaInternaLinha } from '@/lib/supabase/tipos'
import type { DadosNota, DetalhesEtapa } from '@/lib/validacao/cadeia'
import { ErroDados, garantir, ouErro } from './erros'

export type Autor = { id: string; nome: string }

// ---------------------------------------------------------------------------
// Etapas
// ---------------------------------------------------------------------------

export async function listarEtapas(supabase: Cliente, tenantId: string): Promise<CadeiaEtapaLinha[]> {
  return ouErro(
    await supabase.from('cadeia_etapas').select('*').eq('tenant_id', tenantId).order('frente').order('ordem'),
    'Não foi possível ler a cadeia',
  )
}

/**
 * Garante que o tenant tem todas as etapas do modelo. Idempotente: corre ao
 * criar o tenant e sempre que a cadeia é aberta no console, para que etapas
 * novas no código apareçam nas empresas antigas.
 */
export async function materializarCadeia(
  supabase: Cliente,
  tenantId: string,
  opcoes: { concluirCadastro?: boolean } = {},
): Promise<CadeiaEtapaLinha[]> {
  const existentes = await listarEtapas(supabase, tenantId)
  const faltam = etapasEmFalta(existentes)
  if (faltam.length === 0) return existentes

  const agora = new Date().toISOString()
  garantir(
    await supabase.from('cadeia_etapas').insert(
      faltam.map((e) => {
        const concluir = opcoes.concluirCadastro && e.frente === 'lancamento' && e.chave === 'cadastro'
        return {
          tenant_id: tenantId,
          frente: e.frente,
          chave: e.chave,
          titulo: e.titulo,
          descricao: e.descricao,
          ordem: e.ordem,
          estado: concluir ? ('concluido' as const) : ('nao_avaliado' as const),
          concluida_em: concluir ? agora : null,
        }
      }),
    ),
    'Não foi possível preparar a cadeia',
  )
  return listarEtapas(supabase, tenantId)
}

export async function obterCadeia(supabase: Cliente, tenantId: string): Promise<FrenteVista[]> {
  return montarCadeia(await materializarCadeia(supabase, tenantId))
}

async function obterEtapa(supabase: Cliente, tenantId: string, etapaId: string): Promise<CadeiaEtapaLinha> {
  const { data, error } = await supabase
    .from('cadeia_etapas')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', etapaId)
    .maybeSingle()
  if (error) throw new ErroDados(`Não foi possível ler a etapa: ${error.message}`, error)
  if (!data) throw new ErroDados('Etapa não encontrada')
  return data
}

async function registar(
  supabase: Cliente,
  etapa: Pick<CadeiaEtapaLinha, 'id' | 'tenant_id'>,
  autor: Autor,
  registo: {
    tipo: CadeiaRegistoLinha['tipo']
    de?: string | null
    para?: string | null
    texto?: string | null
  },
) {
  garantir(
    await supabase.from('cadeia_registos').insert({
      tenant_id: etapa.tenant_id,
      etapa_id: etapa.id,
      autor_id: autor.id,
      autor_nome: autor.nome,
      tipo: registo.tipo,
      de: registo.de ?? null,
      para: registo.para ?? null,
      texto: registo.texto ?? null,
    }),
    'Não foi possível gravar o histórico',
  )
}

/** Muda o estado e escreve no histórico. Devolve a etapa actualizada. */
export async function definirEstadoEtapa(
  supabase: Cliente,
  tenantId: string,
  etapaId: string,
  estado: EstadoEtapa,
  autor: Autor,
): Promise<CadeiaEtapaLinha> {
  const atual = await obterEtapa(supabase, tenantId, etapaId)
  if (atual.estado === estado) return atual
  const concluida_em = estaAtendida(estado) ? (atual.concluida_em ?? new Date().toISOString()) : null
  const linha = ouErro(
    await supabase
      .from('cadeia_etapas')
      .update({ estado, concluida_em })
      .eq('tenant_id', tenantId)
      .eq('id', etapaId)
      .select('*')
      .single(),
    'Não foi possível mudar o estado',
  )
  await registar(supabase, linha, autor, { tipo: 'estado', de: atual.estado, para: estado })
  return linha
}

export async function guardarDetalhesEtapa(
  supabase: Cliente,
  tenantId: string,
  dados: DetalhesEtapa,
  autor: Autor,
): Promise<CadeiaEtapaLinha> {
  const atual = await obterEtapa(supabase, tenantId, dados.etapaId)
  const linha = ouErro(
    await supabase
      .from('cadeia_etapas')
      .update({
        notas: dados.notas ?? null,
        url: dados.url ?? null,
        responsavel: dados.responsavel ?? null,
        prevista_em: dados.prevista_em ?? null,
      })
      .eq('tenant_id', tenantId)
      .eq('id', dados.etapaId)
      .select('*')
      .single(),
    'Não foi possível guardar a etapa',
  )
  const mudou = (a: string | null, b: string | null) => (a ?? '') !== (b ?? '')
  if (mudou(atual.notas, linha.notas)) {
    await registar(supabase, linha, autor, { tipo: 'nota', texto: (linha.notas ?? '').slice(0, 280) })
  }
  return linha
}

/** Etapa fora do modelo, só desta empresa. A chave sai do título. */
export async function criarEtapaPersonalizada(
  supabase: Cliente,
  tenantId: string,
  frente: string,
  dados: { titulo: string; descricao?: string },
  autor: Autor,
): Promise<CadeiaEtapaLinha> {
  const daFrente = (await listarEtapas(supabase, tenantId)).filter((e) => e.frente === frente)
  const base = gerarSlug(dados.titulo).replace(/-/g, '_').slice(0, 30)
  const chaves = new Set(daFrente.map((e) => e.chave))
  let chave = base
  for (let n = 2; chaves.has(chave); n++) chave = `${base}_${n}`
  const ordem = daFrente.reduce((m, e) => Math.max(m, e.ordem), 0) + 1

  const linha = ouErro(
    await supabase
      .from('cadeia_etapas')
      .insert({
        tenant_id: tenantId,
        frente,
        chave,
        titulo: dados.titulo,
        descricao: dados.descricao ?? null,
        ordem,
        estado: 'pendente',
        personalizada: true,
      })
      .select('*')
      .single(),
    'Não foi possível criar a etapa',
  )
  await registar(supabase, linha, autor, { tipo: 'criacao', texto: dados.titulo })
  return linha
}

export async function eliminarEtapaPersonalizada(
  supabase: Cliente,
  tenantId: string,
  etapaId: string,
): Promise<void> {
  const etapa = await obterEtapa(supabase, tenantId, etapaId)
  if (!etapa.personalizada) throw new ErroDados('Só etapas personalizadas podem ser apagadas')
  garantir(
    await supabase.from('cadeia_etapas').delete().eq('tenant_id', tenantId).eq('id', etapaId),
    'Não foi possível apagar a etapa',
  )
}

/** Usado por automatismos (por exemplo, o importador marca "cardápio carregado"). */
export async function concluirEtapaDoModelo(
  supabase: Cliente,
  tenantId: string,
  frente: string,
  chave: string,
  autor: Autor,
): Promise<void> {
  const modelo = etapaDoModelo(frente, chave)
  if (!modelo) throw new ErroDados(`Etapa ${frente}/${chave} não existe no modelo`)
  const linhas = await materializarCadeia(supabase, tenantId)
  const etapa = linhas.find((l) => l.frente === frente && l.chave === chave)
  if (!etapa) throw new ErroDados(`Etapa ${frente}/${chave} não foi materializada`)
  if (etapa.estado !== 'concluido') await definirEstadoEtapa(supabase, tenantId, etapa.id, 'concluido', autor)
}

// ---------------------------------------------------------------------------
// Histórico
// ---------------------------------------------------------------------------

export type RegistoComEtapa = CadeiaRegistoLinha & {
  cadeia_etapas: { titulo: string; frente: string } | null
}

export async function listarRegistos(
  supabase: Cliente,
  tenantId: string,
  limite = 80,
): Promise<RegistoComEtapa[]> {
  return ouErro(
    await supabase
      .from('cadeia_registos')
      .select('*, cadeia_etapas(titulo, frente)')
      .eq('tenant_id', tenantId)
      .order('criado_em', { ascending: false })
      .limit(limite),
    'Não foi possível ler o histórico',
  )
}

// ---------------------------------------------------------------------------
// Notas internas
// ---------------------------------------------------------------------------

export async function listarNotas(supabase: Cliente, tenantId: string): Promise<NotaInternaLinha[]> {
  return ouErro(
    await supabase
      .from('notas_internas')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('fixada', { ascending: false })
      .order('atualizado_em', { ascending: false }),
    'Não foi possível ler as notas',
  )
}

export async function obterNota(
  supabase: Cliente,
  tenantId: string,
  notaId: string,
): Promise<NotaInternaLinha | null> {
  const { data } = await supabase
    .from('notas_internas')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', notaId)
    .maybeSingle()
  return data
}

export async function criarNota(
  supabase: Cliente,
  tenantId: string,
  dados: DadosNota,
  autor: Autor,
): Promise<string> {
  const linha = ouErro(
    await supabase
      .from('notas_internas')
      .insert({
        tenant_id: tenantId,
        autor_id: autor.id,
        autor_nome: autor.nome,
        titulo: dados.titulo,
        conteudo: dados.conteudo,
        fixada: dados.fixada,
      })
      .select('id')
      .single(),
    'Não foi possível criar a nota',
  )
  return linha.id
}

export async function atualizarNota(
  supabase: Cliente,
  tenantId: string,
  notaId: string,
  dados: DadosNota,
): Promise<void> {
  garantir(
    await supabase
      .from('notas_internas')
      .update({ titulo: dados.titulo, conteudo: dados.conteudo, fixada: dados.fixada })
      .eq('tenant_id', tenantId)
      .eq('id', notaId),
    'Não foi possível guardar a nota',
  )
}

export async function eliminarNota(supabase: Cliente, tenantId: string, notaId: string): Promise<void> {
  garantir(
    await supabase.from('notas_internas').delete().eq('tenant_id', tenantId).eq('id', notaId),
    'Não foi possível apagar a nota',
  )
}

export async function contarNotas(supabase: Cliente, tenantId: string): Promise<number> {
  const { count } = await supabase
    .from('notas_internas')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
  return count ?? 0
}
