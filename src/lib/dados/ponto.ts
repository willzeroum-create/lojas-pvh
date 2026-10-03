import 'server-only'

import { randomUUID } from 'node:crypto'
import { batidasPossiveis, diaLocal, espelhoDePonto, FUSO_PORTO_VELHO_MIN, type Batida, type Espelho, type TipoBatida } from '@/lib/dominio/ponto'
import { clienteAdmin, type Cliente } from '@/lib/supabase/server'
import type { PontoBatidaLinha } from '@/lib/supabase/tipos'
import { entrarComPin } from './equipe'
import { ErroDados, garantir, ouErro } from './erros'

export const BUCKET_PONTO = 'ponto'
const FOTO_MAX_BYTES = 512 * 1024

export type SituacaoPonto = 'fora' | 'trabalhando' | 'intervalo'

export type PessoaNoRelogio = {
  id: string
  nome: string
  situacao: SituacaoPonto
  desde: string | null
  proximas: TipoBatida[]
}

const situacaoDe = (ultima: TipoBatida | undefined): SituacaoPonto =>
  ultima === 'entrada' || ultima === 'volta_intervalo' ? 'trabalhando' : ultima === 'saida_intervalo' ? 'intervalo' : 'fora'

/** Quem bate ponto na loja e em que situação está agora (para o relógio e o "quem está a trabalhar"). */
export async function pessoasNoRelogio(supabase: Cliente, tenantId: string): Promise<PessoaNoRelogio[]> {
  const desde = new Date(Date.now() - 16 * 3_600_000).toISOString()
  const [membros, batidas] = await Promise.all([
    supabase.from('equipe_membros').select('id, nome').eq('tenant_id', tenantId).eq('ativo', true).eq('registra_ponto', true).order('nome'),
    supabase
      .from('ponto_batidas')
      .select('membro_id, tipo, momento')
      .eq('tenant_id', tenantId)
      .is('anulada_em', null)
      .gte('momento', desde)
      .order('momento', { ascending: true }),
  ])
  const porMembro = new Map<string, { tipo: TipoBatida; momento: string }[]>()
  for (const b of ouErro(batidas, 'Não foi possível ler o ponto')) {
    const lista = porMembro.get(b.membro_id) ?? []
    lista.push(b)
    porMembro.set(b.membro_id, lista)
  }
  return ouErro(membros, 'Não foi possível ler a equipe').map((m) => {
    const lista = porMembro.get(m.id) ?? []
    // Jornada actual: a partir da última entrada.
    const inicio = lista.map((b) => b.tipo).lastIndexOf('entrada')
    const jornada = inicio >= 0 ? lista.slice(inicio) : []
    const ultima = jornada.at(-1)
    const situacao = situacaoDe(ultima?.tipo)
    return {
      id: m.id,
      nome: m.nome,
      situacao,
      desde: situacao === 'fora' ? null : (ultima?.momento ?? null),
      proximas: batidasPossiveis(situacao === 'fora' ? null : (ultima?.tipo ?? null), jornada.some((b) => b.tipo === 'volta_intervalo')),
    }
  })
}

/** Lê uma foto vinda da webcam (data URL JPEG/WebP) e confere o tamanho. */
export function lerFotoWebcam(dataUrl: string): { bytes: Buffer; tipo: 'image/jpeg' | 'image/webp' } {
  const m = /^data:(image\/(?:jpeg|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)
  if (!m) throw new ErroDados('Foto inválida. Tente de novo.')
  const bytes = Buffer.from(m[2]!, 'base64')
  if (bytes.length === 0 || bytes.length > FOTO_MAX_BYTES) throw new ErroDados('Foto grande demais. Tente de novo.')
  return { bytes, tipo: m[1] as 'image/jpeg' | 'image/webp' }
}

export type NovaBatida = {
  membroId: string
  pin: string
  tipo: TipoBatida
  foto?: string
  latitude?: number
  longitude?: number
  precisao?: number
  dispositivo?: string
}

/**
 * Batida no relógio: confere o PIN (com o bloqueio de tentativas da equipe),
 * guarda a foto no bucket privado e grava a batida. A ordem das batidas é
 * conferida pela base (gatilho); a foto é opcional se a câmara falhar.
 */
export async function baterPonto(
  tenantId: string,
  d: NovaBatida,
): Promise<{ nome: string; tipo: TipoBatida; momento: string; comFoto: boolean }> {
  const membro = await entrarComPin(tenantId, d.membroId, d.pin)
  const admin = clienteAdmin()
  const { data: m } = await admin.from('equipe_membros').select('registra_ponto').eq('tenant_id', tenantId).eq('id', membro.id).single()
  if (!m?.registra_ponto) throw new ErroDados('Esta pessoa não bate ponto. O gerente pode mudar isso na equipe.')

  const id = randomUUID()
  let fotoPath: string | null = null
  if (d.foto) {
    const foto = lerFotoWebcam(d.foto)
    const caminho = `${tenantId}/${membro.id}/${diaLocal(new Date()).slice(0, 7)}/${id}.${foto.tipo === 'image/webp' ? 'webp' : 'jpg'}`
    const { error } = await admin.storage.from(BUCKET_PONTO).upload(caminho, foto.bytes, { contentType: foto.tipo, upsert: false })
    if (!error) fotoPath = caminho
  }

  const r = await admin
    .from('ponto_batidas')
    .insert({
      id,
      tenant_id: tenantId,
      membro_id: membro.id,
      tipo: d.tipo,
      origem: 'relogio',
      foto_path: fotoPath,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      precisao_m: d.precisao != null ? Math.round(d.precisao) : null,
      dispositivo: d.dispositivo?.slice(0, 200) ?? null,
    })
    .select('momento')
    .single()
  if (r.error) {
    if (fotoPath) await admin.storage.from(BUCKET_PONTO).remove([fotoPath])
    if (r.error.code === '23514') {
      throw new ErroDados(
        r.error.message.includes('repetida')
          ? 'Ponto já registado agora há pouco. Espere um minuto.'
          : 'Esta batida não segue a anterior. Confira a opção ou peça ao gerente para ajustar.',
      )
    }
    throw new ErroDados('Não foi possível registar o ponto.')
  }
  return { nome: membro.nome, tipo: d.tipo, momento: r.data.momento, comFoto: !!fotoPath }
}

export type BatidaDoEspelho = Batida & {
  id: string
  origem: 'relogio' | 'manual'
  temFoto: boolean
  temLocal: boolean
  motivo: string | null
  registadoPor: string | null
  anulada: { em: string; por: string | null; motivo: string } | null
}

export type EspelhoDoMembro = {
  membro: { id: string; nome: string; jornadaMinutos: number; registraPonto: boolean }
  mes: string
  espelho: Espelho
  batidas: BatidaDoEspelho[]
}

/** Limites UTC de um mês local (AAAA-MM). */
export function limitesDoMes(mes: string, fusoMin = FUSO_PORTO_VELHO_MIN): { de: string; ate: string } {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)) throw new ErroDados('Mês inválido.')
  const [a, m] = mes.split('-').map(Number) as [number, number]
  const de = Date.UTC(a, m - 1, 1) - fusoMin * 60_000
  const ate = Date.UTC(a, m, 1) - fusoMin * 60_000
  return { de: new Date(de).toISOString(), ate: new Date(ate).toISOString() }
}

/** Espelho de ponto do mês: as batidas anuladas aparecem, mas não contam. */
export async function espelhoDoMembro(supabase: Cliente, tenantId: string, membroId: string, mes: string): Promise<EspelhoDoMembro | null> {
  const { de, ate } = limitesDoMes(mes)
  const { data: m } = await supabase
    .from('equipe_membros')
    .select('id, nome, jornada_minutos, registra_ponto')
    .eq('tenant_id', tenantId)
    .eq('id', membroId)
    .maybeSingle()
  if (!m) return null
  // Uma jornada que começou no fim do mês anterior pode acabar já neste: lê-se uma margem.
  const linhas = ouErro(
    await supabase
      .from('ponto_batidas')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('membro_id', membroId)
      .gte('momento', new Date(new Date(de).getTime() - 16 * 3_600_000).toISOString())
      .lt('momento', new Date(new Date(ate).getTime() + 16 * 3_600_000).toISOString())
      .order('momento'),
    'Não foi possível ler o ponto',
  )
  const batidas = linhas.map(paraBatida)
  const validas = batidas.filter((b) => !b.anulada)
  const espelho = espelhoDePonto(validas, m.jornada_minutos)
  const dias = espelho.dias.filter((d) => d.dia >= mes + '-01' && d.dia.slice(0, 7) === mes)
  const soma = (f: (d: (typeof dias)[number]) => number) => dias.reduce((s, d) => s + f(d), 0)
  return {
    membro: { id: m.id, nome: m.nome, jornadaMinutos: m.jornada_minutos, registraPonto: m.registra_ponto },
    mes,
    espelho: {
      dias,
      totais: {
        trabalhadoMin: soma((d) => d.trabalhadoMin),
        saldoMin: soma((d) => d.saldoMin),
        noturnoMin: soma((d) => d.noturnoMin),
        noturnoFictoMin: soma((d) => d.noturnoFictoMin),
        diasTrabalhados: new Set(dias.map((d) => d.dia)).size,
        inconsistencias: soma((d) => d.inconsistencias.length),
      },
    },
    batidas: batidas.filter((b) => b.momento >= de && b.momento < ate),
  }
}

function paraBatida(l: PontoBatidaLinha): BatidaDoEspelho {
  return {
    id: l.id,
    tipo: l.tipo,
    momento: l.momento,
    origem: l.origem,
    temFoto: !!l.foto_path,
    temLocal: l.latitude != null && l.longitude != null,
    motivo: l.motivo,
    registadoPor: l.registado_por,
    anulada: l.anulada_em ? { em: l.anulada_em, por: l.anulada_por, motivo: l.anulada_motivo ?? '' } : null,
  }
}

/** Link assinado (5 min) da foto de uma batida, e o local se houver. */
export async function detalheBatida(
  supabase: Cliente,
  tenantId: string,
  batidaId: string,
): Promise<{ fotoUrl: string | null; latitude: number | null; longitude: number | null; precisao: number | null; dispositivo: string | null }> {
  const { data: b } = await supabase
    .from('ponto_batidas')
    .select('foto_path, latitude, longitude, precisao_m, dispositivo')
    .eq('tenant_id', tenantId)
    .eq('id', batidaId)
    .maybeSingle()
  if (!b) throw new ErroDados('Batida não encontrada.')
  let fotoUrl: string | null = null
  if (b.foto_path) {
    const { data } = await clienteAdmin().storage.from(BUCKET_PONTO).createSignedUrl(b.foto_path, 300)
    fotoUrl = data?.signedUrl ?? null
  }
  return {
    fotoUrl,
    latitude: b.latitude != null ? Number(b.latitude) : null,
    longitude: b.longitude != null ? Number(b.longitude) : null,
    precisao: b.precisao_m,
    dispositivo: b.dispositivo,
  }
}

/** Batida esquecida, lançada pelo gerente com motivo (a aprovação fica na auditoria). */
export async function lancarBatidaManual(
  supabase: Cliente,
  tenantId: string,
  d: { membroId: string; tipo: TipoBatida; momento: string; motivo: string },
  autor: string,
): Promise<void> {
  const { data: m } = await supabase.from('equipe_membros').select('id').eq('tenant_id', tenantId).eq('id', d.membroId).maybeSingle()
  if (!m) throw new ErroDados('Pessoa não encontrada.')
  if (new Date(d.momento).getTime() > Date.now() + 60_000) throw new ErroDados('Não se lança batida no futuro.')
  garantir(
    await clienteAdmin().from('ponto_batidas').insert({
      tenant_id: tenantId,
      membro_id: d.membroId,
      tipo: d.tipo,
      momento: d.momento,
      origem: 'manual',
      motivo: d.motivo,
      registado_por: autor,
    }),
    'Não foi possível lançar a batida',
  )
}

/** Anula uma batida (nunca se apaga): fica no espelho riscada, com motivo e autor. */
export async function anularBatida(supabase: Cliente, tenantId: string, batidaId: string, motivo: string, autor: string): Promise<void> {
  const { data: b } = await supabase.from('ponto_batidas').select('id, anulada_em').eq('tenant_id', tenantId).eq('id', batidaId).maybeSingle()
  if (!b) throw new ErroDados('Batida não encontrada.')
  if (b.anulada_em) throw new ErroDados('Esta batida já foi anulada.')
  garantir(
    await clienteAdmin()
      .from('ponto_batidas')
      .update({ anulada_em: new Date().toISOString(), anulada_por: autor, anulada_motivo: motivo })
      .eq('tenant_id', tenantId)
      .eq('id', batidaId)
      .is('anulada_em', null),
    'Não foi possível anular a batida',
  )
}

/** Quem bate ponto e a jornada prevista de cada um. */
export async function configurarPontoMembro(
  supabase: Cliente,
  tenantId: string,
  membroId: string,
  d: { registraPonto: boolean; jornadaMinutos: number },
): Promise<void> {
  garantir(
    await supabase
      .from('equipe_membros')
      .update({ registra_ponto: d.registraPonto, jornada_minutos: d.jornadaMinutos })
      .eq('tenant_id', tenantId)
      .eq('id', membroId),
    'Não foi possível guardar',
  )
}

/** Resumo do mês de toda a equipe (para a lista do gerente). */
export async function resumoPontoDoMes(supabase: Cliente, tenantId: string, mes: string) {
  const { data: membros } = await supabase.from('equipe_membros').select('id').eq('tenant_id', tenantId).eq('ativo', true).eq('registra_ponto', true).order('nome')
  const espelhos = await Promise.all((membros ?? []).map((m) => espelhoDoMembro(supabase, tenantId, m.id, mes)))
  return espelhos
    .filter((e): e is EspelhoDoMembro => !!e)
    .map((e) => ({ membro: e.membro, totais: e.espelho.totais, emAndamento: e.espelho.dias.some((d) => d.emAndamento) }))
}
