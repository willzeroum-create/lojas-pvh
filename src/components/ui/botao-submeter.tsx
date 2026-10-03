'use client'

import { useFormStatus } from 'react-dom'
import { Botao, type BotaoProps } from './botao'

/** Botão de formulário que mostra o estado "a enviar" sozinho, via `useFormStatus`. */
export function BotaoSubmeter(props: BotaoProps) {
  const { pending } = useFormStatus()
  return <Botao type="submit" carregando={pending} {...props} />
}
