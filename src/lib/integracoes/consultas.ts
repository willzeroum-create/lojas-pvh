import 'server-only'

/**
 * Consultas públicas de CNPJ e CEP — a "integração com a Receita" que o
 * comerciante vê: digita o CNPJ e o cadastro preenche-se sozinho.
 *
 *   CNPJ  BrasilAPI (dados abertos da Receita Federal)
 *   CEP   BrasilAPI, com ViaCEP de reserva
 *
 * Gratuitas e sem chave. Cada chamada tem prazo curto: se o serviço falhar, o
 * formulário continua a funcionar à mão.
 */
import { lerCep, normalizarDocumento } from '@/lib/dominio/documento'
import { mapearCep, mapearCnpjBrasilApi, type EmpresaConsultada, type EnderecoConsultado } from './consultas-formato'

export type { EmpresaConsultada, EnderecoConsultado }

const PRAZO_MS = 6000

async function obterJson(url: string): Promise<Record<string, unknown> | null> {
  try {
    const resposta = await fetch(url, { signal: AbortSignal.timeout(PRAZO_MS), headers: { accept: 'application/json' } })
    if (!resposta.ok) return null
    return (await resposta.json()) as Record<string, unknown>
  } catch {
    return null
  }
}

export async function consultarCnpj(cnpj: string): Promise<EmpresaConsultada | null> {
  const dados = await obterJson(`https://brasilapi.com.br/api/cnpj/v1/${normalizarDocumento(cnpj)}`)
  return dados ? mapearCnpjBrasilApi(dados) : null
}

export async function consultarCep(entrada: string): Promise<EnderecoConsultado | null> {
  const cep = lerCep(entrada)
  if (!cep) return null
  const brasilApi = await obterJson(`https://brasilapi.com.br/api/cep/v2/${cep}`)
  if (brasilApi) return mapearCep(brasilApi)
  const viaCep = await obterJson(`https://viacep.com.br/ws/${cep}/json/`)
  return viaCep ? mapearCep(viaCep) : null
}
