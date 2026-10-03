import 'server-only'

import { resumirCompras, type ResumoCompras } from '@/lib/dominio/cliente'
import type { Cliente } from '@/lib/supabase/server'
import type { ConsentimentoLinha, PedidoLinha, PessoaEnderecoLinha, PessoaLinha } from '@/lib/supabase/tipos'
import type { BuscaPessoas, DadosPessoa } from '@/lib/validacao/clientes'
import { ErroDados, garantir, ouErro } from './erros'

export const POR_PAGINA = 30

export type PessoaLista = Pick<
  PessoaLinha,
  'id' | 'tipo' | 'nome' | 'nome_fantasia' | 'documento' | 'whatsapp' | 'e_cliente' | 'e_fornecedor' | 'etiquetas' | 'origem'
>

/** Lista com busca por nome, documento ou WhatsApp. Anonimizados não aparecem. */
export async function listarPessoas(
  supabase: Cliente,
  tenantId: string,
  filtro: BuscaPessoas,
): Promise<{ itens: PessoaLista[]; total: number }> {
  let consulta = supabase
    .from('pessoas')
    .select('id, tipo, nome, nome_fantasia, documento, whatsapp, e_cliente, e_fornecedor, etiquetas, origem', {
      count: 'exact',
    })
    .eq('tenant_id', tenantId)
    .is('anonimizado_em', null)

  if (filtro.papel === 'clientes') consulta = consulta.eq('e_cliente', true)
  if (filtro.papel === 'fornecedores') consulta = consulta.eq('e_fornecedor', true)
  if (filtro.busca) {
    const digitos = filtro.busca.replace(/\D/g, '')
    const termo = filtro.busca.replace(/[%,()]/g, ' ')
    consulta = digitos.length >= 4
      ? consulta.or(`nome.ilike.%${termo}%,documento.like.%${digitos}%,whatsapp.like.%${digitos}%`)
      : consulta.or(`nome.ilike.%${termo}%,nome_fantasia.ilike.%${termo}%`)
  }

  const inicio = (filtro.pagina - 1) * POR_PAGINA
  const { data, error, count } = await consulta.order('nome').range(inicio, inicio + POR_PAGINA - 1)
  if (error) throw new ErroDados('Não foi possível listar as pessoas', error)
  return { itens: data ?? [], total: count ?? 0 }
}

export type PedidoDaFicha = Pick<PedidoLinha, 'id' | 'numero' | 'canal' | 'status' | 'total' | 'criado_em'>

export type FichaPessoa = {
  pessoa: PessoaLinha
  enderecos: PessoaEnderecoLinha[]
  /** Último registo por finalidade. */
  consentimentos: Partial<Record<ConsentimentoLinha['finalidade'], ConsentimentoLinha>>
  compras: ResumoCompras
  ultimosPedidos: PedidoDaFicha[]
}

/** Tudo numa tela: dados, endereços, consentimentos e o histórico de compras. */
export async function obterFichaPessoa(supabase: Cliente, tenantId: string, id: string): Promise<FichaPessoa | null> {
  const { data: pessoa } = await supabase.from('pessoas').select('*').eq('tenant_id', tenantId).eq('id', id).maybeSingle()
  if (!pessoa) return null

  const [enderecos, consentimentos, pedidos] = await Promise.all([
    supabase.from('pessoa_enderecos').select('*').eq('tenant_id', tenantId).eq('pessoa_id', id).order('principal', { ascending: false }),
    supabase
      .from('consentimentos')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('pessoa_id', id)
      .order('registado_em', { ascending: false }),
    supabase
      .from('pedidos')
      .select('id, numero, canal, status, total, criado_em')
      .eq('tenant_id', tenantId)
      .eq('cliente_id', id)
      .order('criado_em', { ascending: false })
      .limit(500),
  ])

  const ultimos: FichaPessoa['consentimentos'] = {}
  for (const c of ouErro(consentimentos, 'Não foi possível ler os consentimentos')) {
    ultimos[c.finalidade] ??= c
  }
  const listaPedidos = ouErro(pedidos, 'Não foi possível ler os pedidos do cliente')

  return {
    pessoa,
    enderecos: ouErro(enderecos, 'Não foi possível ler os endereços'),
    consentimentos: ultimos,
    compras: resumirCompras(
      listaPedidos.map((p) => ({ total: Number(p.total), criadoEm: p.criado_em, cancelado: p.status === 'cancelado' })),
      new Date(),
    ),
    ultimosPedidos: listaPedidos.slice(0, 10),
  }
}

function linhaPessoa(tenantId: string, d: DadosPessoa) {
  return {
    tenant_id: tenantId,
    tipo: d.documento?.tipo ?? 'pf',
    nome: d.nome,
    nome_fantasia: d.nome_fantasia ?? null,
    documento: d.documento?.digitos ?? null,
    whatsapp: d.whatsapp || null,
    email: d.email ?? null,
    nascimento: d.nascimento ?? null,
    observacoes: d.observacoes ?? null,
    e_cliente: d.e_cliente,
    e_fornecedor: d.e_fornecedor,
    etiquetas: d.etiquetas,
  }
}

function erroDeDuplicado(error: { code?: string; message: string } | null): never | void {
  if (error?.code === '23505') {
    const campo = error.message.includes('documento') ? 'este CPF/CNPJ' : 'este WhatsApp'
    throw new ErroDados(`Já existe uma pessoa com ${campo}.`)
  }
}

/** Cria ou actualiza a pessoa e o endereço principal; regista o consentimento de marketing se mudou. */
export async function salvarPessoa(supabase: Cliente, tenantId: string, d: DadosPessoa): Promise<string> {
  const linha = linhaPessoa(tenantId, d)
  const resposta = d.id
    ? await supabase.from('pessoas').update(linha).eq('tenant_id', tenantId).eq('id', d.id).select('id').single()
    : await supabase.from('pessoas').insert({ ...linha, origem: 'manual' }).select('id').single()
  erroDeDuplicado(resposta.error)
  const { id } = ouErro(resposta, 'Não foi possível guardar a pessoa')

  if (d.endereco && Object.entries(d.endereco).some(([k, v]) => k !== 'rotulo' && v)) {
    garantir(
      await supabase.from('pessoa_enderecos').delete().eq('tenant_id', tenantId).eq('pessoa_id', id).eq('principal', true),
      'Não foi possível actualizar o endereço',
    )
    garantir(
      await supabase.from('pessoa_enderecos').insert({
        tenant_id: tenantId,
        pessoa_id: id,
        principal: true,
        rotulo: d.endereco.rotulo,
        cep: d.endereco.cep || null,
        rua: d.endereco.rua ?? null,
        numero: d.endereco.numero ?? null,
        complemento: d.endereco.complemento ?? null,
        bairro: d.endereco.bairro ?? null,
        cidade: d.endereco.cidade ?? null,
        uf: d.endereco.uf ?? null,
        referencia: d.endereco.referencia ?? null,
      }),
      'Não foi possível guardar o endereço',
    )
  }

  if (d.aceita_marketing !== undefined) {
    await registarConsentimento(supabase, tenantId, id, 'marketing', d.aceita_marketing, 'painel')
  }
  return id
}

export async function registarConsentimento(
  supabase: Cliente,
  tenantId: string,
  pessoaId: string,
  finalidade: ConsentimentoLinha['finalidade'],
  concedido: boolean,
  origem: ConsentimentoLinha['origem'],
): Promise<void> {
  const { data: atual } = await supabase
    .from('consentimentos')
    .select('concedido')
    .eq('tenant_id', tenantId)
    .eq('pessoa_id', pessoaId)
    .eq('finalidade', finalidade)
    .order('registado_em', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (atual?.concedido === concedido) return
  garantir(
    await supabase.from('consentimentos').insert({ tenant_id: tenantId, pessoa_id: pessoaId, finalidade, concedido, origem }),
    'Não foi possível registar o consentimento',
  )
}

/** LGPD: apaga os dados pessoais e mantém os pedidos e os valores. Irreversível. */
export async function anonimizarPessoa(supabase: Cliente, tenantId: string, pessoaId: string): Promise<void> {
  garantir(
    await supabase.rpc('anonimizar_pessoa', { p_tenant: tenantId, p_pessoa: pessoaId }),
    'Não foi possível anonimizar',
  )
}
