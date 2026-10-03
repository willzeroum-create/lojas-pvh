'use client'

import { useActionState } from 'react'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo } from '@/components/ui/campo'
import { definirSenha, type EstadoFormulario } from '../../../actions'

export function FormularioSenha({ tenantId, userId }: { tenantId: string; userId: string }) {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(
    definirSenha.bind(null, tenantId, userId),
    {},
  )
  return (
    <form action={accao} className="mt-2 flex items-end gap-2">
      <Campo
        rotulo="Nova senha"
        name="senha"
        type="text"
        minLength={8}
        required
        autoComplete="off"
        className="flex-1"
        erro={estado.erro}
        ajuda={estado.sucesso}
      />
      <BotaoSubmeter variante="secundario" className="mb-[calc(1.25rem+6px)]">
        Definir
      </BotaoSubmeter>
    </form>
  )
}
