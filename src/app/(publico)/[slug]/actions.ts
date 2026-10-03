'use server'

/**
 * Registo do pedido vindo da página pública.
 *
 * O browser envia ids e quantidades. Aqui:
 *   1. valida a forma dos dados (zod);
 *   2. confirma que o tenant aceita pedidos e a loja está aberta;
 *   3. recalcula tudo a partir do catálogo lido sob RLS `anon`;
 *   4. grava numa transacção com a chave secreta;
 *   5. devolve o link do WhatsApp com a mensagem pronta.
 */
import { paraCatalogoCarrinho } from '@/lib/canais/cardapio'
import { obterCatalogo } from '@/lib/dados/cardapio'
import { codigoDaEntrega, linkAcompanhamento, zonasPublicas } from '@/lib/dados/delivery'
import { obterLojaPrincipal } from '@/lib/dados/lojas'
import { moduloLigado } from '@/lib/dados/modulos'
import { registarPedido } from '@/lib/dados/pedidos'
import { calcularPedido } from '@/lib/dominio/carrinho'
import { zonaDoBairro } from '@/lib/dominio/delivery'
import { estadoLoja } from '@/lib/dominio/horario'
import { montarMensagemPedido, urlWhatsapp } from '@/lib/dominio/whatsapp'
import { clienteAdmin, clienteAnonimo } from '@/lib/supabase/server'
import { esquemaNovoPedido } from '@/lib/validacao/pedido'
import { validar } from '@/lib/validacao/zod'

export type ResultadoCriarPedido = { ok: true; numero: number; url: string } | { ok: false; erros: string[] }

export async function criarPedido(entrada: unknown): Promise<ResultadoCriarPedido> {
  const r = validar(esquemaNovoPedido, entrada)
  if (!r.ok) return { ok: false, erros: r.erros }
  const dados = r.dados

  const anon = clienteAnonimo()
  const { data: tenant } = await anon
    .from('tenants')
    .select('id, nome_fantasia, whatsapp, status')
    .eq('id', dados.tenantId)
    .maybeSingle()
  if (!tenant || tenant.status === 'suspenso' || !(await moduloLigado(anon, tenant.id, 'cardapio')))
    return { ok: false, erros: ['Esta loja não está aceitando pedidos online no momento.'] }

  const loja = await obterLojaPrincipal(anon, tenant.id)
  if (!loja || loja.id !== dados.lojaId)
    return { ok: false, erros: ['Loja não encontrada. Recarregue a página.'] }

  const estado = estadoLoja(loja, new Date())
  if (!estado.aberta)
    return { ok: false, erros: ['A loja está fechada agora. Volte no horário de funcionamento.'] }

  // Delivery próprio: com bairros cadastrados, a taxa é a do bairro (e fora deles não se entrega).
  const delivery = await moduloLigado(anon, tenant.id, 'delivery')
  let taxaEntrega = loja.taxa_entrega
  if (delivery && dados.tipoEntrega === 'entrega') {
    const zona = zonaDoBairro(await zonasPublicas(anon, tenant.id), dados.endereco?.bairro)
    if (!zona.ok) return { ok: false, erros: [zona.erro] }
    if (zona.zona) taxaEntrega = zona.zona.taxa
  }

  const catalogo = paraCatalogoCarrinho(await obterCatalogo(anon, tenant.id))
  const calculo = calcularPedido(
    dados.itens,
    catalogo,
    {
      taxaEntrega,
      pedidoMinimo: loja.pedido_minimo,
      aceitaEntrega: loja.aceita_entrega,
      aceitaRetirada: loja.aceita_retirada,
    },
    dados.tipoEntrega,
  )
  if (!calculo.ok) return { ok: false, erros: calculo.erros }

  let pedido
  try {
    pedido = await registarPedido(clienteAdmin(), dados, calculo)
  } catch (erro) {
    console.error('[criarPedido]', erro)
    return {
      ok: false,
      erros: ['Não conseguimos registrar o pedido. Tente de novo ou chame direto no WhatsApp.'],
    }
  }

  const codigo = delivery && dados.tipoEntrega === 'entrega' ? await codigoDaEntrega(tenant.id, pedido.id) : null

  const mensagem = montarMensagemPedido({
    numero: pedido.numero ?? 0,
    nomeFantasia: tenant.nome_fantasia,
    clienteNome: dados.clienteNome,
    itens: calculo.itens,
    subtotal: calculo.subtotal,
    taxaEntrega: calculo.taxaEntrega,
    total: calculo.total,
    tipoEntrega: dados.tipoEntrega,
    endereco: dados.tipoEntrega === 'entrega' ? (dados.endereco ?? null) : null,
    formaPagamento: dados.formaPagamento,
    trocoPara: dados.formaPagamento === 'dinheiro' ? (dados.trocoPara ?? null) : null,
    observacoes: dados.observacoes ?? null,
    linkAcompanhamento: codigo ? linkAcompanhamento(codigo) : null,
  })

  return { ok: true, numero: pedido.numero ?? 0, url: urlWhatsapp(tenant.whatsapp, mensagem) }
}
