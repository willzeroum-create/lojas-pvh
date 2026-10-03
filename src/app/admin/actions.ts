'use server'

/**
 * Server Actions do console. Todas começam por `exigirConsole()`: só
 * operadores chegam aqui. O que o comerciante nunca poderia fazer sozinho
 * (mudar estado, plano, senha) passa pelo cliente admin.
 */
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { exigirConsole } from '@/lib/auth/guardas'
import { urlBase } from '@/lib/config/marca'
import { COOKIE_IMPERSONACAO, OPCOES_COOKIE_IMPERSONACAO } from '@/lib/auth/impersonacao'
import type { Sessao } from '@/lib/auth/sessao'
import { estaAtendida } from '@/lib/cadeia/estados'
import { FRENTE_LANCAMENTO } from '@/lib/cadeia/modelo'
import {
  atualizarNota,
  concluirEtapaDoModelo,
  criarEtapaPersonalizada,
  criarNota,
  definirEstadoEtapa,
  eliminarEtapaPersonalizada,
  eliminarNota,
  guardarDetalhesEtapa,
  type Autor,
} from '@/lib/dados/cadeia'
import { importarCardapio } from '@/lib/dados/cardapio'
import { eliminarArquivo, registarArquivo } from '@/lib/dados/arquivos'
import { ErroDados } from '@/lib/dados/erros'
import { definirModulo } from '@/lib/dados/modulos'
import { criarOperador, removerOperador as removerOperadorDados } from '@/lib/dados/operadores'
import { atualizarFichaTenant, criarTenant, definirSenhaMembro, marcarPublicado } from '@/lib/dados/tenants'
import { importarDeFoto } from '@/lib/importador/foto'
import { importarDePlanilha, type LinhaBruta } from '@/lib/importador/planilha'
import { clienteAdmin } from '@/lib/supabase/server'
import {
  esquemaDetalhesEtapa,
  esquemaEstadoEtapa,
  esquemaEtapaPersonalizada,
  esquemaNota,
} from '@/lib/validacao/cadeia'
import { esquemaRegistarArquivo } from '@/lib/validacao/arquivos'
import { esquemaImportacao } from '@/lib/validacao/cardapio'
import { esquemaAlternarModulo } from '@/lib/validacao/modulos'
import { esquemaNovoOperador } from '@/lib/validacao/operador'
import { esquemaFichaTenant, esquemaNovaSenha, esquemaNovoTenant } from '@/lib/validacao/tenant'
import { deFormData, uuid, validar } from '@/lib/validacao/zod'

export type EstadoFormulario = { erro?: string; porCampo?: Record<string, string>; sucesso?: string }
export type Resultado = { ok: true } | { ok: false; erro: string }

const mensagem = (e: unknown, padrao: string) => (e instanceof ErroDados ? e.message : padrao)

/** Quem assina o histórico da cadeia. */
const autorDe = (sessao: Sessao): Autor => ({
  id: sessao.userId,
  nome: sessao.operador?.nome ?? sessao.email ?? 'Operador',
})

function revalidarTenant(tenantId: string) {
  revalidatePath('/admin')
  revalidatePath(`/admin/tenants/${tenantId}`)
  revalidatePath(`/admin/tenants/${tenantId}/cadeia`)
  revalidatePath(`/admin/tenants/${tenantId}/notas`)
}

// ---------------------------------------------------------------------------
// Impersonação
// ---------------------------------------------------------------------------

export async function entrarComoTenant(tenantId: string): Promise<void> {
  const { supabase } = await exigirConsole()
  const id = uuid.parse(tenantId)
  const { data } = await supabase.from('tenants').select('id').eq('id', id).maybeSingle()
  if (!data) throw new ErroDados('Tenant não encontrado')
  const jarra = await cookies()
  jarra.set(COOKIE_IMPERSONACAO, id, OPCOES_COOKIE_IMPERSONACAO)
  redirect('/painel/pedidos')
}

export async function sairDaImpersonacao(): Promise<void> {
  await exigirConsole()
  const jarra = await cookies()
  jarra.delete(COOKIE_IMPERSONACAO)
  redirect('/admin')
}

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

function enderecoDe(campos: Record<string, unknown>) {
  return {
    rua: campos.rua,
    numero: campos.numero,
    complemento: campos.complemento,
    bairro: campos.bairro,
    cidade: campos.cidade,
    uf: campos.uf,
    cep: campos.cep,
    referencia: campos.referencia,
  }
}

export async function criarNovoTenant(_anterior: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await exigirConsole()
  const campos = deFormData(fd)
  const r = validar(esquemaNovoTenant, { ...campos, endereco: enderecoDe(campos) })
  if (!r.ok) return { erro: 'Confira os campos.', porCampo: r.porCampo }

  let criado: { tenantId: string }
  try {
    criado = await criarTenant(clienteAdmin(), r.dados)
  } catch (e) {
    return { erro: mensagem(e, 'Não foi possível criar o tenant.') }
  }
  revalidatePath('/admin')
  redirect(`/admin/tenants/${criado.tenantId}?criado=1`)
}

export async function guardarFicha(
  tenantId: string,
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await exigirConsole()
  const r = validar(esquemaFichaTenant, deFormData(fd))
  if (!r.ok) return { erro: 'Confira os campos.', porCampo: r.porCampo }
  try {
    await atualizarFichaTenant(clienteAdmin(), uuid.parse(tenantId), r.dados)
  } catch (e) {
    return { erro: mensagem(e, 'Não foi possível guardar a ficha.') }
  }
  revalidatePath('/admin')
  revalidatePath(`/admin/tenants/${tenantId}`)
  return { sucesso: 'Ficha guardada.' }
}

export async function definirSenha(
  tenantId: string,
  userId: string,
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const { supabase } = await exigirConsole()
  const r = validar(esquemaNovaSenha, deFormData(fd))
  if (!r.ok) return { erro: r.erros[0], porCampo: r.porCampo }
  const { data: membro } = await supabase
    .from('membros')
    .select('user_id')
    .eq('tenant_id', uuid.parse(tenantId))
    .eq('user_id', uuid.parse(userId))
    .maybeSingle()
  if (!membro) return { erro: 'Este utilizador não pertence ao tenant.' }
  try {
    await definirSenhaMembro(clienteAdmin(), userId, r.dados.senha)
  } catch (e) {
    return { erro: mensagem(e, 'Não foi possível definir a senha.') }
  }
  return { sucesso: 'Senha definida. Envie ao cliente por um canal seguro.' }
}

// ---------------------------------------------------------------------------
// Importador de cardápio
// ---------------------------------------------------------------------------

export type ResultadoExtracao =
  { ok: true; linhas: LinhaBruta[]; aviso?: string } | { ok: false; erro: string }

const LIMITE_FICHEIRO = 10 * 1024 * 1024

export async function extrairDePlanilha(fd: FormData): Promise<ResultadoExtracao> {
  await exigirConsole()
  const ficheiro = fd.get('ficheiro')
  if (!(ficheiro instanceof File) || ficheiro.size === 0) return { ok: false, erro: 'Escolha um ficheiro.' }
  if (ficheiro.size > LIMITE_FICHEIRO) return { ok: false, erro: 'Ficheiro acima de 10 MB.' }
  try {
    const linhas = importarDePlanilha(await ficheiro.arrayBuffer(), ficheiro.name)
    if (linhas.length === 0)
      return {
        ok: false,
        erro: 'Não encontrei produtos com nome e preço. Confira as colunas: categoria, nome, descrição, preço.',
      }
    return { ok: true, linhas }
  } catch (e) {
    return { ok: false, erro: e instanceof Error ? e.message : 'Não foi possível ler a planilha.' }
  }
}

export async function extrairDeFoto(fd: FormData): Promise<ResultadoExtracao> {
  await exigirConsole()
  const ficheiro = fd.get('ficheiro')
  if (!(ficheiro instanceof File) || ficheiro.size === 0) return { ok: false, erro: 'Escolha uma foto.' }
  if (ficheiro.size > LIMITE_FICHEIRO) return { ok: false, erro: 'Foto acima de 10 MB.' }
  if (!process.env.ANTHROPIC_API_KEY)
    return { ok: false, erro: 'Importação por foto desligada: falta ANTHROPIC_API_KEY no servidor.' }
  try {
    return await importarDeFoto(ficheiro)
  } catch (e) {
    console.error('[extrairDeFoto]', e)
    return {
      ok: false,
      erro: 'Não foi possível ler a foto. Tente uma imagem mais nítida ou use uma planilha.',
    }
  }
}

export async function gravarImportacao(
  tenantId: string,
  linhas: unknown,
): Promise<{ ok: true; produtos: number; categorias: number } | { ok: false; erro: string }> {
  const { sessao, supabase } = await exigirConsole()
  const id = uuid.parse(tenantId)
  const r = validar(esquemaImportacao, linhas)
  if (!r.ok) return { ok: false, erro: r.erros.slice(0, 3).join(' · ') }
  try {
    const resultado = await importarCardapio(supabase, id, r.dados)
    await concluirEtapaDoModelo(supabase, id, FRENTE_LANCAMENTO, 'cardapio', autorDe(sessao))
    revalidarTenant(tenantId)
    return { ok: true, ...resultado }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível gravar o cardápio.') }
  }
}

// ---------------------------------------------------------------------------
// Módulos: o produto montado para cada cliente
// ---------------------------------------------------------------------------

export async function alternarModulo(entrada: unknown): Promise<Resultado> {
  const { supabase } = await exigirConsole()
  const r = validar(esquemaAlternarModulo, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    await definirModulo(supabase, r.dados.tenantId, r.dados.modulo, r.dados.ativo)
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível mudar o módulo.') }
  }
  revalidatePath(`/admin/tenants/${r.dados.tenantId}`)
  revalidatePath('/painel', 'layout')
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Cadeia de produção
// ---------------------------------------------------------------------------

export async function mudarEstadoEtapa(entrada: unknown): Promise<Resultado> {
  const { sessao, supabase } = await exigirConsole()
  const r = validar(esquemaEstadoEtapa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    const etapa = await definirEstadoEtapa(
      supabase,
      r.dados.tenantId,
      r.dados.etapaId,
      r.dados.estado,
      autorDe(sessao),
    )
    // "Página publicada" controla o robots da página pública.
    if (etapa.frente === FRENTE_LANCAMENTO && etapa.chave === 'pagina') {
      await marcarPublicado(clienteAdmin(), r.dados.tenantId, estaAtendida(etapa.estado))
    }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível mudar o estado.') }
  }
  revalidarTenant(r.dados.tenantId)
  return { ok: true }
}

export async function guardarEtapa(entrada: unknown): Promise<Resultado> {
  const { sessao, supabase } = await exigirConsole()
  const r = validar(esquemaDetalhesEtapa, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    await guardarDetalhesEtapa(supabase, r.dados.tenantId, r.dados, autorDe(sessao))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível guardar a etapa.') }
  }
  revalidarTenant(r.dados.tenantId)
  return { ok: true }
}

export async function adicionarEtapa(
  entrada: unknown,
): Promise<{ ok: true; id: string } | { ok: false; erro: string }> {
  const { sessao, supabase } = await exigirConsole()
  const r = validar(esquemaEtapaPersonalizada, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    const etapa = await criarEtapaPersonalizada(
      supabase,
      r.dados.tenantId,
      r.dados.frente,
      { titulo: r.dados.titulo, descricao: r.dados.descricao },
      autorDe(sessao),
    )
    revalidarTenant(r.dados.tenantId)
    return { ok: true, id: etapa.id }
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível criar a etapa.') }
  }
}

export async function removerEtapa(tenantId: string, etapaId: string): Promise<Resultado> {
  const { supabase } = await exigirConsole()
  try {
    await eliminarEtapaPersonalizada(supabase, uuid.parse(tenantId), uuid.parse(etapaId))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível apagar a etapa.') }
  }
  revalidarTenant(tenantId)
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Notas internas
// ---------------------------------------------------------------------------

export async function guardarNota(
  tenantId: string,
  notaId: string | null,
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const { sessao, supabase } = await exigirConsole()
  const id = uuid.parse(tenantId)
  const r = validar(esquemaNota, deFormData(fd))
  if (!r.ok) return { erro: 'Confira os campos.', porCampo: r.porCampo }
  try {
    if (notaId) await atualizarNota(supabase, id, uuid.parse(notaId), r.dados)
    else await criarNota(supabase, id, r.dados, autorDe(sessao))
  } catch (e) {
    return { erro: mensagem(e, 'Não foi possível guardar a nota.') }
  }
  revalidarTenant(tenantId)
  redirect(`/admin/tenants/${tenantId}/notas`)
}

export async function apagarNota(tenantId: string, notaId: string): Promise<void> {
  const { supabase } = await exigirConsole()
  await eliminarNota(supabase, uuid.parse(tenantId), uuid.parse(notaId))
  revalidarTenant(tenantId)
  redirect(`/admin/tenants/${tenantId}/notas`)
}

// ---------------------------------------------------------------------------
// Equipa
// ---------------------------------------------------------------------------

export async function adicionarOperador(
  _anterior: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  await exigirConsole()
  const r = validar(esquemaNovoOperador, deFormData(fd))
  if (!r.ok) return { erro: 'Confira os campos.', porCampo: r.porCampo }
  try {
    await criarOperador(clienteAdmin(), r.dados)
  } catch (e) {
    return { erro: mensagem(e, 'Não foi possível criar o operador.') }
  }
  revalidatePath('/admin/equipa')
  return { sucesso: `${r.dados.nome} já pode entrar em /entrar e ir a /admin.` }
}

/** Tira o acesso ao console. Ninguém se remove a si próprio. */
export async function removerOperador(userId: string): Promise<void> {
  const { sessao } = await exigirConsole()
  const id = uuid.parse(userId)
  if (id === sessao.userId) throw new ErroDados('Não pode remover o seu próprio acesso')
  await removerOperadorDados(clienteAdmin(), id)
  revalidatePath('/admin/equipa')
}

/**
 * Link de entrada sem senha para o dono (magic link). O operador copia e envia
 * por WhatsApp; vale uma vez e expira ao fim de uma hora.
 */
export async function gerarLinkDeAcesso(
  tenantId: string,
  userId: string,
): Promise<{ ok: true; url: string } | { ok: false; erro: string }> {
  const { supabase } = await exigirConsole()
  const { data: membro } = await supabase
    .from('membros')
    .select('user_id')
    .eq('tenant_id', uuid.parse(tenantId))
    .eq('user_id', uuid.parse(userId))
    .maybeSingle()
  if (!membro) return { ok: false, erro: 'Este utilizador não pertence ao tenant.' }

  const admin = clienteAdmin()
  const { data: utilizador } = await admin.auth.admin.getUserById(userId)
  if (!utilizador.user?.email) return { ok: false, erro: 'Utilizador sem e-mail.' }
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: utilizador.user.email,
  })
  if (error || !data.properties?.hashed_token)
    return { ok: false, erro: error?.message ?? 'Não foi possível gerar o link.' }

  const url = new URL('/auth/confirmar', urlBase())
  url.searchParams.set('token_hash', data.properties.hashed_token)
  url.searchParams.set('type', 'magiclink')
  url.searchParams.set('proximo', '/painel')
  return { ok: true, url: url.toString() }
}

// ---------------------------------------------------------------------------
// Arquivos
// ---------------------------------------------------------------------------

/** O ficheiro já subiu para o bucket pelo browser; aqui fica o índice. */
export async function guardarArquivo(entrada: unknown): Promise<Resultado> {
  const { sessao, supabase } = await exigirConsole()
  const r = validar(esquemaRegistarArquivo, entrada)
  if (!r.ok) return { ok: false, erro: r.erros[0] ?? 'Dados inválidos' }
  try {
    await registarArquivo(supabase, r.dados, autorDe(sessao))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível registar o arquivo.') }
  }
  revalidatePath(`/admin/tenants/${r.dados.tenantId}/arquivos`)
  return { ok: true }
}

export async function apagarArquivo(tenantId: string, arquivoId: string): Promise<Resultado> {
  const { supabase } = await exigirConsole()
  try {
    await eliminarArquivo(supabase, uuid.parse(tenantId), uuid.parse(arquivoId))
  } catch (e) {
    return { ok: false, erro: mensagem(e, 'Não foi possível apagar o arquivo.') }
  }
  revalidatePath(`/admin/tenants/${tenantId}/arquivos`)
  return { ok: true }
}
