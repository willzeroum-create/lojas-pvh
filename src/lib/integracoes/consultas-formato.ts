/**
 * Formato das consultas de CNPJ e CEP e a tradução das respostas dos serviços
 * públicos para ele. Puro: testável sem rede (ver consultas.ts).
 */
import { lerCep } from '@/lib/dominio/documento'
import { apenasDigitos } from '@/lib/dominio/telefone'

export type EnderecoConsultado = {
  cep: string
  rua: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  complemento: string | null
  numero: string | null
}

export type EmpresaConsultada = {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string | null
  situacao: string | null
  atividade: string | null
  telefone: string | null
  email: string | null
  endereco: EnderecoConsultado | null
}

const textoOuNulo = (v: unknown) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null)

/** Resposta da BrasilAPI /cnpj/v1 → o nosso formato. */
export function mapearCnpjBrasilApi(dados: Record<string, unknown>): EmpresaConsultada {
  const cep = lerCep(String(dados.cep ?? ''))
  const telefone = apenasDigitos(String(dados.ddd_telefone_1 ?? ''))
  return {
    cnpj: apenasDigitos(String(dados.cnpj ?? '')),
    razaoSocial: textoOuNulo(dados.razao_social) ?? '',
    nomeFantasia: textoOuNulo(dados.nome_fantasia),
    situacao: textoOuNulo(dados.descricao_situacao_cadastral),
    atividade: textoOuNulo(dados.cnae_fiscal_descricao),
    telefone: telefone.length >= 10 ? telefone : null,
    email: textoOuNulo(dados.email)?.toLowerCase() ?? null,
    endereco: cep
      ? {
          cep,
          rua: textoOuNulo([dados.descricao_tipo_de_logradouro, dados.logradouro].filter(Boolean).join(' ')),
          numero: textoOuNulo(dados.numero),
          complemento: textoOuNulo(dados.complemento),
          bairro: textoOuNulo(dados.bairro),
          cidade: textoOuNulo(dados.municipio),
          uf: textoOuNulo(dados.uf)?.toUpperCase() ?? null,
        }
      : null,
  }
}

/** Resposta da BrasilAPI /cep/v2 ou do ViaCEP → o nosso formato. */
export function mapearCep(dados: Record<string, unknown>): EnderecoConsultado | null {
  if (dados.erro) return null
  const cep = lerCep(String(dados.cep ?? ''))
  if (!cep) return null
  return {
    cep,
    rua: textoOuNulo(dados.street ?? dados.logradouro),
    bairro: textoOuNulo(dados.neighborhood ?? dados.bairro),
    cidade: textoOuNulo(dados.city ?? dados.localidade),
    uf: textoOuNulo(dados.state ?? dados.uf)?.toUpperCase() ?? null,
    complemento: textoOuNulo(dados.complemento),
    numero: null,
  }
}
