'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Botao } from '@/components/ui/botao'
import { Mensagem } from '@/components/ui/mensagem'
import type { ConfigCashback } from '@/lib/dominio/fidelidade'
import { formatarBRL } from '@/lib/dominio/moeda'
import { salvarConfigCashbackAction } from '../actions'

const CAMPO =
  'mt-2 min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 text-base text-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:opacity-60'

export function ConfiguracaoCashback({ config }: { config: ConfigCashback }) {
  const router = useRouter()
  const [ativo, definirAtivo] = useState(config.ativo)
  const [percentual, definirPercentual] = useState(String(config.percentual))
  const [validade, definirValidade] = useState(String(config.validadeDias))
  const [minimo, definirMinimo] = useState(String(config.resgateMinimo))
  const [limite, definirLimite] = useState(String(config.limiteResgatePct))
  const [ocupado, definirOcupado] = useState(false)
  const [erro, definirErro] = useState('')
  const [sucesso, definirSucesso] = useState('')
  const enviando = useRef(false)
  const exemplo = (50 * (Number(percentual) || 0)) / 100

  async function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current) return
    enviando.current = true
    definirOcupado(true)
    definirErro('')
    definirSucesso('')
    try {
      const resultado = await salvarConfigCashbackAction({
        ativo,
        percentual: Number(percentual),
        validadeDias: Number(validade),
        resgateMinimo: Number(minimo),
        limiteResgatePct: Number(limite),
      })
      if (!resultado.ok) {
        definirErro(resultado.erro)
        return
      }
      definirSucesso('Regras salvas. As próximas compras já seguem esta configuração.')
      router.refresh()
    } catch {
      definirErro('Não foi possível confirmar. Confira as regras antes de tentar salvar novamente.')
    } finally {
      enviando.current = false
      definirOcupado(false)
    }
  }

  return (
    <section
      aria-labelledby="regras-cashback"
      className="min-w-0 rounded-xl border border-areia bg-papel-2 p-4 sm:p-5"
    >
      <h2 id="regras-cashback" className="text-xl font-bold">
        Regras do cashback
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-carvao">
        Quanto volta para o cliente e como ele pode usar.
      </p>
      <form onSubmit={salvar} className="mt-5 space-y-5" onChange={() => definirSucesso('')}>
        <fieldset disabled={ocupado} className="min-w-0 space-y-5">
          <legend className="sr-only">Configuração do programa</legend>
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-areia bg-branco p-3 font-bold">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(evento) => definirAtivo(evento.target.checked)}
              className="size-6 shrink-0 accent-tinta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta"
            />
            Programa ativo
          </label>
          <div className="grid min-w-0 grid-cols-2 gap-4">
            <label className="min-w-0 text-sm font-semibold">
              Devolução (%)
              <input
                className={CAMPO}
                type="number"
                inputMode="decimal"
                required
                min="0.01"
                max="50"
                step="0.01"
                value={percentual}
                onChange={(evento) => definirPercentual(evento.target.value)}
              />
            </label>
            <label className="min-w-0 text-sm font-semibold">
              Validade (dias)
              <input
                className={CAMPO}
                type="number"
                inputMode="numeric"
                required
                min="7"
                max="730"
                step="1"
                value={validade}
                onChange={(evento) => definirValidade(evento.target.value)}
              />
            </label>
            <label className="min-w-0 text-sm font-semibold">
              Saldo mínimo (R$)
              <input
                className={CAMPO}
                type="number"
                inputMode="decimal"
                required
                min="0"
                max="1000000"
                step="0.01"
                value={minimo}
                onChange={(evento) => definirMinimo(evento.target.value)}
                aria-describedby="minimo-cashback-ajuda"
              />
            </label>
            <label className="min-w-0 text-sm font-semibold">
              Limite da compra (%)
              <input
                className={CAMPO}
                type="number"
                inputMode="decimal"
                required
                min="0.01"
                max="90"
                step="0.01"
                value={limite}
                onChange={(evento) => definirLimite(evento.target.value)}
                aria-describedby="limite-cashback-ajuda"
              />
            </label>
          </div>
          <div className="space-y-2 text-sm leading-relaxed text-carvao">
            <p id="minimo-cashback-ajuda">
              Saldo mínimo: valor que o cliente precisa juntar para começar a usar.
            </p>
            <p id="limite-cashback-ajuda">Limite: parte de cada compra que pode ser paga com cashback.</p>
          </div>
        </fieldset>
        <div
          className="rounded-lg border-l-4 border-tangerina bg-branco p-4"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-xs font-bold tracking-wider text-carvao uppercase">Exemplo com estas regras</p>
          <p className="mt-2 text-lg leading-snug font-bold">
            Compra de {formatarBRL(50)} → {formatarBRL(exemplo)} de volta
          </p>
          <p className="mt-2 text-sm text-carvao">
            Vale {Number(validade) || 0} dias.
            {!ativo && ' O programa precisa estar ativo para gerar cashback.'}
          </p>
        </div>
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        {sucesso && (
          <Mensagem tipo="sucesso" className="text-[#176b3a]!">
            {sucesso}
          </Mensagem>
        )}
        <Botao type="submit" cheio carregando={ocupado}>
          Salvar regras
        </Botao>
      </form>
    </section>
  )
}
