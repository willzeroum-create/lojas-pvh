'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { TecladoPin } from '@/components/ui/teclado-pin'
import type { MembroEquipe } from '@/lib/dados/equipe'
import { PAPEIS, type Papel } from '@/lib/equipe/papeis'
import { salvarMembroAction } from '../actions'
import { ESTILO_BOTAO, ESTILO_CAMPO, ESTILO_PRIMARIO, PermissoesPapel } from './apresentacao'

export function FormularioMembro({
  membro,
  primeiro = false,
  aoSalvar,
  aoCancelar,
}: {
  membro?: MembroEquipe
  primeiro?: boolean
  aoSalvar?: () => void
  aoCancelar?: () => void
}) {
  const roteador = useRouter()
  const [nome, definirNome] = useState(membro?.nome ?? '')
  const [papel, definirPapel] = useState<Papel>(membro?.papel ?? (primeiro ? 'gerente' : 'atendente'))
  const [ativo, definirAtivo] = useState(membro?.ativo ?? true)
  const [pin, definirPin] = useState('')
  const [erro, definirErro] = useState('')
  const [porCampo, definirPorCampo] = useState<Record<string, string>>({})
  const [pendente, iniciar] = useTransition()
  const resumoErro = useRef<HTMLParagraphElement>(null)
  const campoNome = useRef<HTMLInputElement>(null)

  useEffect(() => {
    campoNome.current?.focus()
  }, [])
  useEffect(() => {
    if (erro) resumoErro.current?.focus()
  }, [erro])

  function salvar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (pendente) return
    definirErro('')
    definirPorCampo({})
    iniciar(async () => {
      try {
        const resultado = await salvarMembroAction({
          id: membro?.id,
          nome,
          papel: primeiro ? 'gerente' : papel,
          pin: pin || undefined,
          ativo: primeiro ? true : ativo,
        })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          definirPorCampo(resultado.porCampo ?? {})
          return
        }
        definirPin('')
        aoSalvar?.()
        roteador.refresh()
      } catch {
        definirErro('Não foi possível salvar. Confira sua conexão e tente novamente.')
      }
    })
  }

  return (
    <form onSubmit={salvar} className="min-w-0 space-y-5" aria-busy={pendente}>
      {erro && (
        <p
          ref={resumoErro}
          tabIndex={-1}
          role="alert"
          className="rounded-lg border border-vermelho/30 bg-vermelho-clara p-4 text-sm font-semibold text-vermelho"
        >
          {erro}
        </p>
      )}
      <fieldset disabled={pendente} className="min-w-0 space-y-5">
        <div className="space-y-2">
          <label htmlFor="membro-nome" className="block text-sm font-bold">
            Nome da pessoa
          </label>
          <input
            ref={campoNome}
            id="membro-nome"
            name="nome"
            required
            maxLength={60}
            autoComplete="name"
            value={nome}
            onChange={(evento) => definirNome(evento.target.value)}
            className={ESTILO_CAMPO}
            aria-invalid={Boolean(porCampo.nome)}
            aria-describedby={porCampo.nome ? 'membro-nome-erro' : undefined}
          />
          {porCampo.nome && (
            <p id="membro-nome-erro" className="text-sm text-vermelho">
              {porCampo.nome}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="membro-papel" className="block text-sm font-bold">
            Papel na equipe
          </label>
          <select
            id="membro-papel"
            name="papel"
            value={papel}
            disabled={primeiro}
            onChange={(evento) => definirPapel(evento.target.value as Papel)}
            className={ESTILO_CAMPO}
            aria-invalid={Boolean(porCampo.papel)}
            aria-describedby={porCampo.papel ? 'membro-papel-erro' : 'membro-papel-ajuda'}
          >
            {(Object.keys(PAPEIS) as Papel[]).map((opcao) => (
              <option key={opcao} value={opcao}>
                {PAPEIS[opcao]}
              </option>
            ))}
          </select>
          {porCampo.papel && (
            <p id="membro-papel-erro" className="text-sm text-vermelho">
              {porCampo.papel}
            </p>
          )}
          <div id="membro-papel-ajuda" className="rounded-lg bg-papel p-4">
            <PermissoesPapel papel={papel} />
          </div>
        </div>
        <div className="space-y-3 border-t border-areia pt-5">
          <TecladoPin
            id="membro-pin"
            valor={pin}
            onChange={definirPin}
            desabilitado={pendente}
            rotulo={membro ? 'Novo PIN (opcional)' : 'PIN de acesso'}
            erro={porCampo.pin}
          />
          <p className="text-sm leading-relaxed text-carvao">
            {membro ? 'Deixe vazio para manter o PIN atual. ' : ''}Use de 4 a 6 números, sem sequências ou
            números todos iguais. Cada pessoa deve ter seu próprio PIN.
          </p>
        </div>
        {!primeiro && (
          <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-areia bg-papel px-4 py-3">
            <input
              type="checkbox"
              name="ativo"
              checked={ativo}
              onChange={(evento) => definirAtivo(evento.target.checked)}
              className="size-5 accent-tinta"
              aria-describedby={porCampo.ativo ? 'membro-ativo-erro' : undefined}
            />
            <span>
              <span className="block text-sm font-bold">Pessoa ativa</span>
              <span className="text-sm text-carvao">Pode entrar no painel com o PIN.</span>
            </span>
          </label>
        )}
        {porCampo.ativo && (
          <p id="membro-ativo-erro" className="text-sm text-vermelho">
            {porCampo.ativo}
          </p>
        )}
      </fieldset>
      <div className="flex flex-col gap-2 min-[440px]:flex-row">
        <button
          type="submit"
          disabled={
            pendente || !nome.trim() || (!membro && pin.length < 4) || (pin.length > 0 && pin.length < 4)
          }
          className={`${ESTILO_PRIMARIO} flex-1`}
        >
          {pendente ? 'Salvando…' : primeiro ? 'Criar primeiro gerente' : 'Salvar pessoa'}
        </button>
        {aoCancelar && (
          <button type="button" disabled={pendente} onClick={aoCancelar} className={ESTILO_BOTAO}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
