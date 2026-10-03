'use client'

import { ArrowLeft, ArrowRight, Pencil, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, type FormEvent } from 'react'
import type { MesaMapa } from '@/lib/dados/comandas'
import { DialogoPdv } from '../../../pdv/_components/dialogo-pdv'
import { salvarMesaAction } from '../../actions'
import { AvisoComanda, BOTAO_COMANDA, CAMPO_COMANDA, PRIMARIO_COMANDA } from '../../_components/apresentacao'

export function CadastroMesas({ mesas }: { mesas: MesaMapa[] }) {
  const [edicao, definirEdicao] = useState<MesaMapa | 'nova' | null>(null)
  const [sucesso, definirSucesso] = useState('')
  const ativas = mesas.filter((mesa) => mesa.ativa)
  return (
    <div className="comandas-area mx-auto flex max-w-5xl flex-col gap-6">
      <Link href="/painel/comandas" className={`${BOTAO_COMANDA} self-start`}>
        <ArrowLeft aria-hidden className="size-4" />
        Voltar ao salão
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-6">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-carvao uppercase">
            Atendimento / Cadastro
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mesas do salão</h1>
          <p className="mt-2 text-sm text-carvao">Organize por área e deixe ativas as mesas em uso.</p>
        </div>
        <button
          type="button"
          className={PRIMARIO_COMANDA}
          onClick={() => {
            definirSucesso('')
            definirEdicao('nova')
          }}
          aria-haspopup="dialog"
        >
          <Plus aria-hidden className="size-5" />
          Nova mesa
        </button>
      </header>
      {sucesso && <AvisoComanda>{sucesso}</AvisoComanda>}
      <dl className="grid grid-cols-3 overflow-hidden rounded-xl border border-areia bg-branco">
        <div className="p-4 sm:p-5">
          <dt className="text-xs font-bold text-carvao uppercase">Cadastradas</dt>
          <dd className="mt-2 text-3xl font-bold tabular-nums">{mesas.length}</dd>
        </div>
        <div className="border-x border-areia p-4 sm:p-5">
          <dt className="text-xs font-bold text-carvao uppercase">Ativas</dt>
          <dd className="mt-2 text-3xl font-bold tabular-nums">{ativas.length}</dd>
        </div>
        <div className="p-4 sm:p-5">
          <dt className="text-xs font-bold text-carvao uppercase">Lugares ativos</dt>
          <dd className="mt-2 text-3xl font-bold tabular-nums">
            {ativas.reduce((soma, mesa) => soma + mesa.lugares, 0)}
          </dd>
        </div>
      </dl>
      <section
        aria-label="Mesas cadastradas"
        className="overflow-hidden rounded-xl border border-areia bg-branco"
      >
        {mesas.length ? (
          <ul className="divide-y divide-areia">
            {mesas.map((mesa) => (
              <li key={mesa.id} className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-lg bg-papel-2">
                  <span className="text-[10px] font-bold tracking-wider text-carvao uppercase">Mesa</span>
                  <span className="text-2xl font-bold tabular-nums">{mesa.numero}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{mesa.area || 'Sem área'}</p>
                  <p className="mt-1 text-sm text-carvao">
                    {mesa.lugares} {mesa.lugares === 1 ? 'lugar' : 'lugares'}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold ${mesa.ativa ? 'bg-verde-clara text-[#176b3a]' : 'bg-papel-2 text-carvao'}`}
                  >
                    {mesa.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                  {mesa.comanda && (
                    <Link href={`/painel/comandas/${mesa.comanda.id}`} className={BOTAO_COMANDA}>
                      Comanda aberta
                      <ArrowRight aria-hidden className="size-4" />
                    </Link>
                  )}
                  <button
                    type="button"
                    className={`${BOTAO_COMANDA} flex-1 sm:flex-none`}
                    onClick={() => {
                      definirSucesso('')
                      definirEdicao(mesa)
                    }}
                    aria-label={`Editar mesa ${mesa.numero}`}
                    aria-haspopup="dialog"
                  >
                    <Pencil aria-hidden className="size-4" />
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 sm:p-10">
            <h2 className="text-xl font-bold">Cada mesa, um lugar no mapa.</h2>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-carvao">
              Comece pelo número que sua equipe já usa. A área ajuda a separar salão, varanda e balcão.
            </p>
            <button className={`${BOTAO_COMANDA} mt-5`} onClick={() => definirEdicao('nova')}>
              Cadastrar primeira mesa
              <Plus aria-hidden className="size-4" />
            </button>
          </div>
        )}
      </section>
      <p className="text-sm text-carvao">
        Mesas inativas não recebem novas comandas. Se houver uma conta aberta, ela continua acessível no mapa
        até o fechamento.
      </p>
      {edicao && (
        <FormularioMesa
          mesa={edicao === 'nova' ? undefined : edicao}
          fechar={() => definirEdicao(null)}
          salvo={(numero) => {
            definirEdicao(null)
            definirSucesso(`Mesa ${numero} salva.`)
          }}
        />
      )}
    </div>
  )
}

function FormularioMesa({
  mesa,
  fechar,
  salvo,
}: {
  mesa?: MesaMapa
  fechar: () => void
  salvo: (numero: number) => void
}) {
  const router = useRouter()
  const [numero, definirNumero] = useState(mesa ? String(mesa.numero) : '')
  const [area, definirArea] = useState(mesa?.area ?? '')
  const [lugares, definirLugares] = useState(String(mesa?.lugares ?? 4))
  const [ativa, definirAtiva] = useState(mesa?.ativa ?? true)
  const [erro, definirErro] = useState('')
  const [campos, definirCampos] = useState<Record<string, string>>({})
  const [pendente, iniciar] = useTransition()
  const trava = useRef(false)
  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (trava.current) return
    trava.current = true
    definirErro('')
    definirCampos({})
    iniciar(async () => {
      try {
        const resultado = await salvarMesaAction({
          id: mesa?.id,
          numero: Number(numero),
          area: area.trim(),
          lugares: Number(lugares),
          ativa,
        })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          definirCampos(resultado.porCampo ?? {})
          return
        }
        router.refresh()
        salvo(Number(numero))
      } catch {
        definirErro('Não foi possível confirmar o salvamento. Atualize a lista antes de repetir.')
      } finally {
        trava.current = false
      }
    })
  }
  return (
    <DialogoPdv titulo={mesa ? `Editar mesa ${mesa.numero}` : 'Nova mesa'} fechar={fechar} ocupado={pendente}>
      <form onSubmit={enviar} className="comandas-area space-y-5">
        {erro && <AvisoComanda erro>{erro}</AvisoComanda>}
        <fieldset disabled={pendente} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <label htmlFor="mesa-numero" className="flex flex-col gap-2 text-sm font-bold">
              Número
              <input
                id="mesa-numero"
                data-foco-inicial
                type="number"
                inputMode="numeric"
                min={1}
                max={9999}
                step={1}
                required
                value={numero}
                onChange={(evento) => definirNumero(evento.target.value)}
                className={CAMPO_COMANDA}
                aria-invalid={Boolean(campos.numero)}
                aria-describedby={campos.numero ? 'mesa-numero-erro' : undefined}
              />
              {campos.numero && (
                <span id="mesa-numero-erro" className="text-[#a82a1a]">
                  {campos.numero}
                </span>
              )}
            </label>
            <label htmlFor="mesa-lugares" className="flex flex-col gap-2 text-sm font-bold">
              Lugares
              <input
                id="mesa-lugares"
                type="number"
                inputMode="numeric"
                min={1}
                max={99}
                step={1}
                required
                value={lugares}
                onChange={(evento) => definirLugares(evento.target.value)}
                className={CAMPO_COMANDA}
                aria-invalid={Boolean(campos.lugares)}
                aria-describedby={campos.lugares ? 'mesa-lugares-erro' : undefined}
              />
              {campos.lugares && (
                <span id="mesa-lugares-erro" className="text-[#a82a1a]">
                  {campos.lugares}
                </span>
              )}
            </label>
          </div>
          <label htmlFor="mesa-area" className="flex flex-col gap-2 text-sm font-bold">
            Área <span className="font-normal text-carvao">Opcional</span>
            <input
              id="mesa-area"
              value={area}
              onChange={(evento) => definirArea(evento.target.value)}
              maxLength={40}
              placeholder="Ex.: Varanda"
              className={CAMPO_COMANDA}
              aria-invalid={Boolean(campos.area)}
              aria-describedby={campos.area ? 'mesa-area-erro' : undefined}
            />
            {campos.area && (
              <span id="mesa-area-erro" className="text-[#a82a1a]">
                {campos.area}
              </span>
            )}
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-areia bg-branco p-4">
            <input
              type="checkbox"
              checked={ativa}
              onChange={(evento) => definirAtiva(evento.target.checked)}
              className="size-5 accent-tinta"
            />
            <span>
              <span className="block text-sm font-bold">Mesa ativa</span>
              <span className="mt-1 block text-xs text-carvao">Disponível para abrir novas comandas.</span>
            </span>
          </label>
          {!ativa && mesa?.comanda && (
            <AvisoComanda>
              A comanda atual continua aberta e acessível. Desativar a mesa não encerra a conta.
            </AvisoComanda>
          )}
        </fieldset>
        <button
          type="submit"
          className={`${PRIMARIO_COMANDA} w-full`}
          disabled={pendente}
          aria-busy={pendente}
        >
          {pendente ? 'Salvando…' : 'Salvar mesa'}
        </button>
      </form>
    </DialogoPdv>
  )
}
