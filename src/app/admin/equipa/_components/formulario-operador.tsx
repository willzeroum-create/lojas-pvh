'use client'

import { useActionState } from 'react'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import { adicionarOperador, type EstadoFormulario } from '../../actions'

export function FormularioOperador() {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(adicionarOperador, {})
  return (
    <form action={accao} className="flex flex-col gap-3">
      <Campo rotulo="Nome" name="nome" required maxLength={60} erro={estado.porCampo?.nome} />
      <Campo
        rotulo="E-mail ou nome de usuário"
        name="email"
        type="text"
        required
        erro={estado.porCampo?.email}
      />
      <Campo
        rotulo="Senha"
        name="senha"
        type="text"
        required
        minLength={8}
        autoComplete="off"
        erro={estado.porCampo?.senha}
        ajuda="Mínimo 8 caracteres. Envie por um canal seguro."
      />
      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.sucesso && <Mensagem tipo="sucesso">{estado.sucesso}</Mensagem>}
      <BotaoSubmeter>Dar acesso</BotaoSubmeter>
    </form>
  )
}
