'use client'

import { useActionState } from 'react'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { Endereco } from '@/lib/dominio/endereco'
import { formatarTelefone } from '@/lib/dominio/telefone'
import type { TenantLinha } from '@/lib/supabase/tipos'
import type { EstadoFormulario } from '../../cardapio/actions'
import { guardarConta } from '../actions'

type Tenant = Omit<TenantLinha, 'endereco'> & { endereco: Endereco }

export function FormularioConta({ tenant }: { tenant: Tenant }) {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(guardarConta, {})

  return (
    <form action={accao} className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Dados do estabelecimento</h2>
      <Campo
        rotulo="Nome"
        name="nome_fantasia"
        defaultValue={tenant.nome_fantasia}
        required
        erro={estado.porCampo?.nome_fantasia}
      />
      <Campo
        rotulo="WhatsApp para pedidos"
        name="whatsapp"
        type="tel"
        defaultValue={formatarTelefone(tenant.whatsapp)}
        required
        erro={estado.porCampo?.whatsapp}
        ajuda="É para este número que os pedidos da página vão."
      />
      <Campo
        rotulo="Telefone (opcional)"
        name="telefone"
        type="tel"
        defaultValue={tenant.telefone ?? ''}
        erro={estado.porCampo?.telefone}
      />
      <div className="flex items-end gap-3">
        <Campo
          rotulo="Cor da página"
          name="cor_marca"
          type="color"
          defaultValue={tenant.cor_marca ?? '#f2541b'}
          className="w-28"
          erro={estado.porCampo?.cor_marca}
        />
        <p className="pb-3 text-sm text-cinza">Usada nos botões e destaques da sua página.</p>
      </div>

      <h2 className="mt-2 text-lg font-bold">Endereço</h2>
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <Campo rotulo="Rua" name="rua" defaultValue={tenant.endereco.rua ?? ''} />
        <Campo rotulo="Número" name="numero" defaultValue={tenant.endereco.numero ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Bairro" name="bairro" defaultValue={tenant.endereco.bairro ?? ''} />
        <Campo rotulo="Complemento" name="complemento" defaultValue={tenant.endereco.complemento ?? ''} />
      </div>
      <div className="grid grid-cols-[1fr_4rem_7rem] gap-3">
        <Campo rotulo="Cidade" name="cidade" defaultValue={tenant.endereco.cidade ?? ''} />
        <Campo
          rotulo="UF"
          name="uf"
          maxLength={2}
          defaultValue={tenant.endereco.uf ?? ''}
          erro={estado.porCampo?.['endereco.uf']}
        />
        <Campo
          rotulo="CEP"
          name="cep"
          inputMode="numeric"
          defaultValue={tenant.endereco.cep ?? ''}
          erro={estado.porCampo?.['endereco.cep']}
        />
      </div>
      <Campo rotulo="Ponto de referência" name="referencia" defaultValue={tenant.endereco.referencia ?? ''} />

      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.sucesso && <Mensagem tipo="sucesso">{estado.sucesso}</Mensagem>}
      <BotaoSubmeter tamanho="lg" cheio>
        Guardar
      </BotaoSubmeter>
    </form>
  )
}
