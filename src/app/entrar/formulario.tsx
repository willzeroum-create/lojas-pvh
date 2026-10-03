'use client'

import { useActionState } from 'react'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import { entrar, type EstadoEntrar } from './actions'

export function FormularioEntrar({ proximo, avisoInicial }: { proximo?: string; avisoInicial?: string }) {
  const [estado, accao] = useActionState<EstadoEntrar, FormData>(entrar, { erro: null })

  return (
    <form action={accao} className="flex flex-col gap-4">
      {proximo && <input type="hidden" name="proximo" value={proximo} />}
      <Campo
        rotulo="E-mail ou nome de usuário"
        name="email"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        autoFocus
      />
      <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" required />
      {estado.erro ? (
        <Mensagem tipo="erro">{estado.erro}</Mensagem>
      ) : avisoInicial ? (
        <Mensagem tipo="info">{avisoInicial}</Mensagem>
      ) : null}
      <BotaoSubmeter tamanho="lg" cheio>
        Entrar
      </BotaoSubmeter>
    </form>
  )
}
