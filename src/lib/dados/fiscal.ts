import 'server-only'

import { montarNfceFocus, pendenciasNfce, type ConfigFiscal, type ItemFiscal, type PagamentoFiscal } from '@/lib/dominio/fiscal'
import { focusNfe, type AmbienteFiscal, type RespostaEmissor } from '@/lib/integracoes/fiscal/focus'
import { assinarWebhook } from '@/lib/integracoes/assinatura-webhook'
import { guardarSegredo, lerSegredo } from '@/lib/integracoes/segredos'
import { urlBase } from '@/lib/config/marca'
import type { Cliente } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/tipos'
import { ErroDados, garantir, ouErro } from './erros'

export type EstadoFiscal = {
  estado: 'aguardando_credenciais' | 'em_homologacao' | 'em_producao' | 'com_erro' | 'suspensa'
  ambiente: AmbienteFiscal
  provedor: string
  config: Partial<ConfigFiscal>
  ultimoErro: string | null
}

/** Estado da integração fiscal do tenant (sem segredos). */
export async function estadoFiscal(supabase: Cliente, tenantId: string): Promise<EstadoFiscal | null> {
  const { data } = await supabase.from('integracoes').select('*').eq('tenant_id', tenantId).eq('dominio', 'fiscal').maybeSingle()
  if (!data) return null
  return {
    estado: data.estado,
    ambiente: data.ambiente,
    provedor: data.provedor,
    config: (data.configuracao ?? {}) as Partial<ConfigFiscal>,
    ultimoErro: data.ultimo_erro,
  }
}

/**
 * Configura a nota fiscal do cliente (só operadores, pela RLS): dados da
 * empresa, ambiente e, se vier, o token do emissor (cifrado, fora da API).
 */
export async function configurarFiscal(
  supabase: Cliente,
  tenantId: string,
  d: { config: ConfigFiscal; ambiente: AmbienteFiscal; token?: string },
): Promise<void> {
  if (d.token) await guardarSegredo(tenantId, 'fiscal', `token_${d.ambiente}`, d.token)
  const temToken = d.token ? true : !!(await lerSegredo(tenantId, 'fiscal', `token_${d.ambiente}`))
  garantir(
    await supabase.from('integracoes').upsert(
      {
        tenant_id: tenantId,
        dominio: 'fiscal',
        provedor: 'focus',
        ambiente: d.ambiente,
        estado: !temToken ? 'aguardando_credenciais' : d.ambiente === 'producao' ? 'em_producao' : 'em_homologacao',
        configuracao: d.config as unknown as Json,
        ultimo_erro: null,
      },
      { onConflict: 'tenant_id,dominio' },
    ),
    'Não foi possível guardar a configuração fiscal',
  )
}

async function dadosDaVenda(supabase: Cliente, tenantId: string, pedidoId: string) {
  const { data: pedido } = await supabase
    .from('pedidos')
    .select('id, status, total, desconto, cliente_nome, criado_em, clientes:pessoas(documento, nome)')
    .eq('tenant_id', tenantId)
    .eq('id', pedidoId)
    .maybeSingle()
  if (!pedido) throw new ErroDados('Venda não encontrada.')
  if (pedido.status !== 'concluido') throw new ErroDados('Só se emite nota de venda concluída.')
  const [itens, pagamentos] = await Promise.all([
    supabase
      .from('itens_pedido')
      .select('produto_id, nome, quantidade, preco_unitario, desconto, total, preparo, produtos(unidade, ncm, cfop, csosn, origem_mercadoria, cest)')
      .eq('pedido_id', pedidoId),
    supabase.from('pagamentos_pedido').select('forma, valor, troco').eq('pedido_id', pedidoId),
  ])
  const itensFiscais: ItemFiscal[] = ouErro(itens, 'Não foi possível ler os itens')
    .filter((i) => i.preparo !== 'cancelado')
    .map((i) => {
      const p = i.produtos as unknown as { unidade: string; ncm: string | null; cfop: string; csosn: string; origem_mercadoria: number; cest: string | null } | null
      return {
        produtoId: i.produto_id,
        nome: i.nome,
        quantidade: Number(i.quantidade),
        precoUnitario: Number(i.preco_unitario),
        desconto: Number(i.desconto),
        total: Number(i.total),
        unidade: p?.unidade ?? 'un',
        ncm: p?.ncm ?? null,
        cfop: p?.cfop ?? '5102',
        csosn: p?.csosn ?? '102',
        origem: p?.origem_mercadoria ?? 0,
        cest: p?.cest ?? null,
      }
    })
  const pags: PagamentoFiscal[] = ouErro(pagamentos, 'Não foi possível ler os pagamentos').map((p) => ({
    forma: p.forma,
    valor: Number(p.valor),
    troco: Number(p.troco),
  }))
  return { pedido, itens: itensFiscais, pagamentos: pags }
}

export type ResultadoNota = RespostaEmissor & { documentoId: string }

/**
 * Emite a NFC-e de uma venda concluída. Grava a intenção primeiro (com a
 * chave de idempotência = id do pedido) e depois chama o emissor; uma nova
 * tentativa reaproveita a mesma `ref`, por isso nunca duplica.
 */
export async function emitirNfce(supabase: Cliente, tenantId: string, pedidoId: string, cpfCnpj?: string): Promise<ResultadoNota> {
  const estado = await estadoFiscal(supabase, tenantId)
  if (!estado || estado.estado === 'aguardando_credenciais') {
    throw new ErroDados('A nota fiscal ainda não está ligada: falta a equipa configurar o emissor (certificado A1, CSC e token).')
  }
  if (estado.estado === 'suspensa') throw new ErroDados('A emissão de notas está suspensa para esta empresa.')
  const token = await lerSegredo(tenantId, 'fiscal', `token_${estado.ambiente}`)
  if (!token) throw new ErroDados('Falta o token do emissor fiscal para este ambiente.')

  const { pedido, itens, pagamentos } = await dadosDaVenda(supabase, tenantId, pedidoId)
  const pendencias = pendenciasNfce(estado.config, itens)
  if (pendencias.length) throw new ErroDados(pendencias.map((p) => p.mensagem).join(' '))

  const cliente = pedido.clientes as unknown as { documento: string | null; nome: string } | null
  const doc = cpfCnpj ?? cliente?.documento ?? null
  const ref = `pedido-${pedido.id}`

  // Intenção primeiro; se já existe, reaproveita (idempotência).
  const { data: existente } = await supabase.from('documentos_fiscais').select('id, estado').eq('tenant_id', tenantId).eq('ref', ref).maybeSingle()
  if (existente?.estado === 'autorizado') throw new ErroDados('Esta venda já tem NFC-e autorizada.')
  let documentoId = existente?.id
  if (!documentoId) {
    documentoId = ouErro(
      await supabase
        .from('documentos_fiscais')
        .insert({
          tenant_id: tenantId,
          pedido_id: pedido.id,
          tipo: 'nfce',
          ref,
          provedor: 'focus',
          ambiente: estado.ambiente,
          cpf_cnpj_destinatario: doc,
          valor_total: Number(pedido.total),
        })
        .select('id')
        .single(),
      'Não foi possível registar a nota',
    ).id
  }

  const documento = montarNfceFocus(estado.config as ConfigFiscal, itens, pagamentos, {
    dataEmissao: new Date().toISOString(),
    cpfCnpjConsumidor: doc,
    nomeConsumidor: cliente?.nome ?? pedido.cliente_nome,
    descontoGeral: Number(pedido.desconto) - itens.reduce((s, i) => s + i.desconto, 0),
  })
  const resposta = await focusNfe.emitirNfce(estado.ambiente, token, ref, documento)
  await atualizarDocumento(tenantId, documentoId, resposta)
  return { ...resposta, documentoId }
}

/** Grava a resposta do emissor no documento (usado pela emissão e pelo webhook). */
export async function atualizarDocumento(tenantId: string, documentoId: string, r: RespostaEmissor, cliente?: Cliente): Promise<void> {
  const { clienteAdmin } = await import('@/lib/supabase/server')
  const db = cliente ?? clienteAdmin()
  garantir(
    await db
      .from('documentos_fiscais')
      .update({
        estado: r.estado,
        numero: r.numero,
        serie: r.serie,
        chave: r.chave,
        protocolo: r.protocolo,
        url_danfe: r.urlDanfe,
        url_xml: r.urlXml,
        mensagem: r.mensagem,
      })
      .eq('tenant_id', tenantId)
      .eq('id', documentoId),
    'Não foi possível actualizar a nota',
  )
}

export async function cancelarNfce(supabase: Cliente, tenantId: string, documentoId: string, justificativa: string): Promise<RespostaEmissor> {
  if (justificativa.trim().length < 15) throw new ErroDados('A justificativa do cancelamento precisa de pelo menos 15 caracteres (regra da SEFAZ).')
  const { data: d } = await supabase.from('documentos_fiscais').select('ref, ambiente, estado').eq('tenant_id', tenantId).eq('id', documentoId).maybeSingle()
  if (!d) throw new ErroDados('Nota não encontrada.')
  if (d.estado !== 'autorizado') throw new ErroDados('Só se cancela nota autorizada.')
  const token = await lerSegredo(tenantId, 'fiscal', `token_${d.ambiente}`)
  if (!token) throw new ErroDados('Falta o token do emissor fiscal.')
  const r = await focusNfe.cancelarNfce(d.ambiente, token, d.ref, justificativa.trim())
  await atualizarDocumento(tenantId, documentoId, r)
  return r
}

export async function listarDocumentosFiscais(supabase: Cliente, tenantId: string, limite = 100) {
  return ouErro(
    await supabase.from('documentos_fiscais').select('*').eq('tenant_id', tenantId).order('criado_em', { ascending: false }).limit(limite),
    'Não foi possível ler as notas',
  )
}

/** URL de aviso da Focus para este cliente (assinada por nós), a colar no painel da Focus. */
export function urlAvisoFiscal(tenantId: string): string {
  return `${urlBase()}/api/webhooks/focus?tenant=${tenantId}&assinatura=${assinarWebhook('focus', tenantId)}`
}

export type ProdutoFiscal = {
  id: string
  nome: string
  categoria: string | null
  ncm: string | null
  cfop: string
  csosn: string
  origem: number
  cest: string | null
}

/** Produtos com os dados fiscais; os sem NCM primeiro (bloqueiam a nota). */
export async function produtosFiscais(supabase: Cliente, tenantId: string): Promise<ProdutoFiscal[]> {
  const linhas = ouErro(
    await supabase
      .from('produtos')
      .select('id, nome, ncm, cfop, csosn, origem_mercadoria, cest, categorias(nome)')
      .eq('tenant_id', tenantId)
      .order('nome'),
    'Não foi possível ler os produtos',
  )
  return linhas
    .map((p) => ({
      id: p.id,
      nome: p.nome,
      categoria: (p.categorias as unknown as { nome: string } | null)?.nome ?? null,
      ncm: p.ncm,
      cfop: p.cfop,
      csosn: p.csosn,
      origem: p.origem_mercadoria,
      cest: p.cest,
    }))
    .sort((a, b) => Number(!!a.ncm) - Number(!!b.ncm))
}

export async function salvarFiscalProduto(
  supabase: Cliente,
  tenantId: string,
  produtoId: string,
  d: { ncm: string | null; cfop: string; csosn: string; origem: number; cest: string | null },
): Promise<void> {
  garantir(
    await supabase
      .from('produtos')
      .update({ ncm: d.ncm, cfop: d.cfop, csosn: d.csosn, origem_mercadoria: d.origem, cest: d.cest })
      .eq('tenant_id', tenantId)
      .eq('id', produtoId),
    'Não foi possível guardar os dados fiscais',
  )
}

export type VendaSemNota = { id: string; numero: number | null; canal: string; total: number; clienteNome: string | null; criadoEm: string }

/** Vendas concluídas dos últimos dias que ainda não têm NFC-e válida. */
export async function vendasSemNota(supabase: Cliente, tenantId: string, dias = 7): Promise<VendaSemNota[]> {
  const desde = new Date(Date.now() - dias * 86_400_000).toISOString()
  const [vendas, notas] = await Promise.all([
    supabase
      .from('pedidos')
      .select('id, numero, canal, total, cliente_nome, criado_em')
      .eq('tenant_id', tenantId)
      .eq('status', 'concluido')
      .gte('criado_em', desde)
      .order('criado_em', { ascending: false })
      .limit(200),
    supabase
      .from('documentos_fiscais')
      .select('pedido_id')
      .eq('tenant_id', tenantId)
      .eq('tipo', 'nfce')
      .neq('estado', 'cancelado')
      .gte('criado_em', desde),
  ])
  const comNota = new Set(ouErro(notas, 'Não foi possível ler as notas').map((n) => n.pedido_id))
  return ouErro(vendas, 'Não foi possível ler as vendas')
    .filter((v) => !comNota.has(v.id))
    .map((v) => ({ id: v.id, numero: v.numero, canal: v.canal, total: Number(v.total), clienteNome: v.cliente_nome, criadoEm: v.criado_em }))
}
