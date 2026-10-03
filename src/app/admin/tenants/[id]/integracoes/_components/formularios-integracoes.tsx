'use client'

import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { FormEvent } from 'react'
import { Botao } from '@/components/ui/botao'
import { Campo, Seleccao } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { EstadoFiscal } from '@/lib/dados/fiscal'
import type { EstadoPix } from '@/lib/dados/pix'
import { configurarFiscalAction, configurarPixAction } from '../actions'

type Ambiente = 'homologacao' | 'producao'
type Retorno = { erro?: string; sucesso?: string }

function limparSegredo(formulario: HTMLFormElement, nome: string) {
  const campo = formulario.elements.namedItem(nome)
  if (campo instanceof HTMLInputElement) campo.value = ''
}

function Feedback({ retorno }: { retorno: Retorno }) {
  return (
    <div aria-live="polite" aria-atomic="true" className="empty:hidden">
      {retorno.erro && <Mensagem tipo="erro">{retorno.erro}</Mensagem>}
      {retorno.sucesso && <Mensagem tipo="sucesso">{retorno.sucesso}</Mensagem>}
    </div>
  )
}

export function FormularioFiscal({ tenantId, estado }: { tenantId: string; estado: EstadoFiscal | null }) {
  const navegador = useRouter()
  const [salvando, iniciarTransicao] = useTransition()
  const [retorno, definirRetorno] = useState<Retorno>({})
  const [ambiente, definirAmbiente] = useState<Ambiente>(estado?.ambiente ?? 'homologacao')

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    definirRetorno({})
    iniciarTransicao(async () => {
      try {
        const resultado = await configurarFiscalAction({
          tenantId,
          ambiente,
          cnpj: String(dados.get('cnpj') ?? '').trim(),
          inscricaoEstadual: String(dados.get('inscricaoEstadual') ?? '').trim(),
          regime: Number(dados.get('regime')),
          naturezaOperacao: String(dados.get('naturezaOperacao') ?? '').trim(),
          token: String(dados.get('token') ?? '').trim(),
        })
        if (!resultado.ok) {
          definirRetorno({ erro: resultado.erro })
          return
        }
        limparSegredo(formulario, 'token')
        definirRetorno({ sucesso: 'Configuração fiscal salva.' })
        navegador.refresh()
      } catch {
        definirRetorno({ erro: 'Não foi possível salvar. Verifique a conexão e tente novamente.' })
      }
    })
  }

  return (
    <form onSubmit={salvar} className="space-y-4" aria-busy={salvando}>
      <fieldset disabled={salvando} className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="sr-only">Configuração fiscal da empresa</legend>
        <Seleccao
          id="fiscal-ambiente"
          name="ambiente"
          rotulo="Ambiente"
          value={ambiente}
          onChange={(evento) => definirAmbiente(evento.target.value as Ambiente)}
          className="sm:col-span-2"
        >
          <option value="homologacao">Homologação (teste)</option>
          <option value="producao">Produção</option>
        </Seleccao>
        <Campo
          id="fiscal-cnpj"
          name="cnpj"
          rotulo="CNPJ da empresa"
          defaultValue={estado?.config.cnpj ?? ''}
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          maxLength={18}
          required
        />
        <Campo
          id="fiscal-inscricao"
          name="inscricaoEstadual"
          rotulo="Inscrição estadual"
          defaultValue={estado?.config.inscricaoEstadual ?? ''}
          placeholder="Número ou ISENTO"
          maxLength={14}
          pattern="[0-9]{2,14}|[Ii][Ss][Ee][Nn][Tt][Oo]"
          title="Informe de 2 a 14 números, sem pontos, ou ISENTO."
          required
        />
        <Seleccao
          id="fiscal-regime"
          name="regime"
          rotulo="Regime tributário"
          defaultValue={estado?.config.regime ?? ''}
          className="sm:col-span-2"
          required
        >
          <option value="" disabled>
            Selecione o regime
          </option>
          <option value="1">1 — Simples Nacional</option>
          <option value="2">2 — Simples (excesso de sublimite)</option>
          <option value="3">3 — Regime normal</option>
          <option value="4">4 — MEI</option>
        </Seleccao>
        <Campo
          id="fiscal-natureza"
          name="naturezaOperacao"
          rotulo="Natureza da operação (opcional)"
          defaultValue={estado?.config.naturezaOperacao ?? ''}
          maxLength={60}
          className="sm:col-span-2"
        />
        <Campo
          id="fiscal-token"
          name="token"
          type="password"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          rotulo={`Token da Focus · ${ambiente === 'producao' ? 'produção' : 'homologação'}`}
          minLength={10}
          maxLength={200}
          className="sm:col-span-2"
          aria-describedby="fiscal-token-ajuda"
        />
        <p id="fiscal-token-ajuda" className="-mt-2 text-sm leading-relaxed text-carvao sm:col-span-2">
          Deixe vazio para manter o token já salvo neste ambiente. O certificado e o CSC são configurados na
          Focus.
        </p>
      </fieldset>
      <Feedback retorno={retorno} />
      <Botao
        type="submit"
        carregando={salvando}
        icone={<Save className="size-4" aria-hidden />}
        className="w-full sm:w-auto"
      >
        {salvando ? 'Salvando…' : 'Salvar configuração fiscal'}
      </Botao>
    </form>
  )
}

export function FormularioPix({ tenantId, estado }: { tenantId: string; estado: EstadoPix | null }) {
  const navegador = useRouter()
  const [salvando, iniciarTransicao] = useTransition()
  const [retorno, definirRetorno] = useState<Retorno>({})

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvando) return
    const formulario = evento.currentTarget
    const dados = new FormData(formulario)
    definirRetorno({})
    iniciarTransicao(async () => {
      try {
        const resultado = await configurarPixAction({
          tenantId,
          ambiente: String(dados.get('ambiente')),
          token: String(dados.get('token') ?? '').trim(),
          segredoWebhook: String(dados.get('segredoWebhook') ?? '').trim(),
        })
        if (!resultado.ok) {
          definirRetorno({ erro: resultado.erro })
          return
        }
        limparSegredo(formulario, 'token')
        limparSegredo(formulario, 'segredoWebhook')
        definirRetorno({ sucesso: 'Configuração do Pix salva.' })
        navegador.refresh()
      } catch {
        definirRetorno({ erro: 'Não foi possível salvar. Verifique a conexão e tente novamente.' })
      }
    })
  }

  return (
    <form onSubmit={salvar} className="space-y-4" aria-busy={salvando}>
      <fieldset disabled={salvando} className="grid min-w-0 grid-cols-1 gap-4">
        <legend className="sr-only">Configuração Pix da empresa</legend>
        <Seleccao
          id="pix-ambiente"
          name="ambiente"
          rotulo="Ambiente"
          defaultValue={estado?.ambiente ?? 'homologacao'}
        >
          <option value="homologacao">Homologação (teste)</option>
          <option value="producao">Produção</option>
        </Seleccao>
        <Campo
          id="pix-token"
          name="token"
          type="password"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          rotulo="Token do Mercado Pago"
          aria-describedby="pix-token-ajuda"
        />
        <p id="pix-token-ajuda" className="-mt-2 text-sm leading-relaxed text-carvao">
          Use o token da empresa para o ambiente selecionado. Deixe vazio para manter o atual.
        </p>
        <Campo
          id="pix-segredo"
          name="segredoWebhook"
          type="password"
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="none"
          rotulo="Chave do webhook (assinatura secreta)"
          minLength={16}
          maxLength={200}
          aria-describedby="pix-segredo-ajuda"
        />
        <p id="pix-segredo-ajuda" className="-mt-2 text-sm leading-relaxed text-carvao">
          {estado?.temSegredoWebhook
            ? 'Chave já configurada. Deixe vazio para manter a atual.'
            : 'Chave ainda não configurada. Copie a assinatura secreta do webhook no Mercado Pago.'}
        </p>
      </fieldset>
      <Feedback retorno={retorno} />
      <Botao
        type="submit"
        carregando={salvando}
        icone={<Save className="size-4" aria-hidden />}
        className="w-full sm:w-auto"
      >
        {salvando ? 'Salvando…' : 'Salvar configuração Pix'}
      </Botao>
    </form>
  )
}
