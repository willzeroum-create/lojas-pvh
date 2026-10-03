'use client'

import { Check, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { buscarClientePdvAction, type ClientePdv } from '@/app/painel/caixa/actions'

/** A seleção vincula o cadastro; texto livre identifica somente esta venda. */
export function BuscaCliente({
  nome,
  cliente,
  alterar,
  bloqueado = false,
}: {
  nome: string
  cliente: ClientePdv | null
  alterar: (nome: string, cliente: ClientePdv | null) => void
  bloqueado?: boolean
}) {
  const campo = useRef<HTMLInputElement>(null)
  const [aberta, definirAberta] = useState(false)
  const [consulta, definirConsulta] = useState<{
    termo: string
    clientes: ClientePdv[]
    erro?: string
  } | null>(null)
  const termo = nome.trim()
  const consultar = aberta && !cliente && termo.length >= 2
  const carregando = consultar && consulta?.termo !== termo
  const encontrados = consulta?.termo === termo ? consulta.clientes : []
  const erro = consulta?.termo === termo ? consulta.erro : undefined

  useEffect(() => {
    if (!consultar) return
    let ignorar = false
    const espera = window.setTimeout(async () => {
      try {
        const resposta = await buscarClientePdvAction(termo)
        if (!ignorar)
          definirConsulta({
            termo,
            clientes: resposta.ok ? resposta.clientes : [],
            erro: resposta.ok ? undefined : resposta.erro,
          })
      } catch {
        if (!ignorar)
          definirConsulta({
            termo,
            clientes: [],
            erro: 'Não foi possível buscar. Tente novamente ou use somente o nome.',
          })
      }
    }, 300)
    return () => {
      ignorar = true
      window.clearTimeout(espera)
    }
  }, [consultar, termo])

  return (
    <section
      aria-labelledby="cliente-pdv-rotulo"
      className="space-y-3 rounded-xl border border-areia bg-papel p-3 sm:p-4"
    >
      <label id="cliente-pdv-rotulo" htmlFor="cliente-pdv" className="block font-bold">
        Cliente <span className="font-normal text-carvao">(opcional)</span>
      </label>
      {cliente ? (
        <div className="flex items-center gap-3 rounded-lg border border-verde/30 bg-verde-clara p-3">
          <Check className="size-5 shrink-0 text-[#176b3a]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-bold break-words">{cliente.nome}</p>
            <p className="text-sm text-carvao">{cliente.contato || 'Cliente cadastrado'}</p>
          </div>
          <button
            type="button"
            className="pdv-icone shrink-0"
            disabled={bloqueado}
            aria-label="Trocar cliente"
            onClick={() => {
              alterar('', null)
              definirConsulta(null)
              definirAberta(true)
              requestAnimationFrame(() => campo.current?.focus())
            }}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-4 left-3 size-5 text-carvao" />
            <input
              ref={campo}
              id="cliente-pdv"
              value={nome}
              disabled={bloqueado}
              autoComplete="off"
              maxLength={120}
              className="pdv-campo pl-10"
              placeholder="Nome, WhatsApp ou CPF"
              aria-describedby="cliente-pdv-ajuda"
              aria-controls={consultar ? 'cliente-pdv-resultados' : undefined}
              onChange={(evento) => {
                alterar(evento.target.value, null)
                definirAberta(true)
              }}
              onFocus={() => definirAberta(true)}
              onKeyDown={(evento) => {
                if (evento.key === 'Escape' && aberta) {
                  evento.preventDefault()
                  evento.stopPropagation()
                  definirAberta(false)
                }
                if (evento.key === 'Enter') {
                  evento.preventDefault()
                  definirAberta(true)
                }
              }}
            />
          </div>
          <p id="cliente-pdv-ajuda" className="text-sm text-carvao">
            Busque com 2 letras ou digite só um nome, sem cadastro.
          </p>
          <div role="status" aria-live="polite" aria-atomic="true" className="text-sm text-carvao">
            {carregando
              ? 'Buscando clientes…'
              : consultar
                ? erro ||
                  (encontrados.length
                    ? `${encontrados.length} cliente(s) encontrado(s). Selecione abaixo.`
                    : 'Nenhum cliente encontrado.')
                : nome && !aberta
                  ? 'Somente o nome será salvo nesta venda.'
                  : ''}
          </div>
          {consultar && !carregando && (
            <div id="cliente-pdv-resultados" className="space-y-2">
              <ul
                aria-label="Clientes encontrados"
                className="divide-y divide-areia overflow-hidden rounded-lg border border-areia bg-branco"
              >
                {encontrados.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={bloqueado}
                      className="flex min-h-16 w-full flex-col justify-center px-3 py-2 text-left hover:bg-papel-2"
                      onClick={() => {
                        alterar(item.nome, item)
                        definirAberta(false)
                      }}
                    >
                      <span className="font-bold break-words">{item.nome}</span>
                      <span className="text-sm text-carvao">{item.contato || 'Sem contato'}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={bloqueado}
                className="pdv-botao w-full whitespace-normal"
                onClick={() => definirAberta(false)}
              >
                Usar só o nome, sem cadastro
              </button>
              {erro && (
                <button
                  type="button"
                  disabled={bloqueado}
                  className="pdv-botao w-full"
                  onClick={() => {
                    definirConsulta(null)
                    definirAberta(false)
                    requestAnimationFrame(() => definirAberta(true))
                  }}
                >
                  Tentar buscar novamente
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}
