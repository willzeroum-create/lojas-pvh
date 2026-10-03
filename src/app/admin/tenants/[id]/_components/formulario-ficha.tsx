'use client'

import { useActionState } from 'react'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo, Seleccao } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import { formatarTelefone } from '@/lib/dominio/telefone'
import type { TenantLinha } from '@/lib/supabase/tipos'
import { guardarFicha, type EstadoFormulario } from '../../../actions'

export function FormularioFicha({ tenant }: { tenant: TenantLinha }) {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(guardarFicha.bind(null, tenant.id), {})

  return (
    <form action={accao} className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Campo
        rotulo="Nome fantasia"
        name="nome_fantasia"
        defaultValue={tenant.nome_fantasia}
        required
        erro={estado.porCampo?.nome_fantasia}
      />
      <Campo
        rotulo="Slug"
        name="slug"
        defaultValue={tenant.slug}
        required
        erro={estado.porCampo?.slug}
        ajuda="Mudar o slug muda o link público."
      />
      <Campo
        rotulo="WhatsApp"
        name="whatsapp"
        defaultValue={formatarTelefone(tenant.whatsapp)}
        required
        erro={estado.porCampo?.whatsapp}
      />
      <Campo
        rotulo="Telefone"
        name="telefone"
        defaultValue={tenant.telefone ?? ''}
        erro={estado.porCampo?.telefone}
      />
      <Campo
        rotulo="Razão social"
        name="razao_social"
        defaultValue={tenant.razao_social ?? ''}
        erro={estado.porCampo?.razao_social}
      />
      <Campo
        rotulo="CNPJ"
        name="cnpj"
        defaultValue={tenant.cnpj ?? ''}
        inputMode="numeric"
        erro={estado.porCampo?.cnpj}
      />
      <Campo
        rotulo="Cor"
        name="cor_marca"
        type="color"
        defaultValue={tenant.cor_marca ?? '#f2541b'}
        className="w-28"
        erro={estado.porCampo?.cor_marca}
      />
      <Campo rotulo="Plano" name="plano" defaultValue={tenant.plano} required erro={estado.porCampo?.plano} />
      <Seleccao
        rotulo="Estado"
        name="status"
        defaultValue={tenant.status}
        erro={estado.porCampo?.status}
        ajuda="Suspenso mantém a página em modo reduzido. Cancelado tira-a do ar."
      >
        <option value="onboarding">Onboarding</option>
        <option value="ativo">Ativo</option>
        <option value="suspenso">Suspenso</option>
        <option value="cancelado">Cancelado</option>
      </Seleccao>
      <Campo
        rotulo="Renovação"
        name="renovacao_em"
        type="date"
        defaultValue={tenant.renovacao_em ?? ''}
        erro={estado.porCampo?.renovacao_em}
      />
      <div className="col-span-full flex flex-col gap-3">
        {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
        {estado.sucesso && <Mensagem tipo="sucesso">{estado.sucesso}</Mensagem>}
        <BotaoSubmeter>Guardar ficha</BotaoSubmeter>
      </div>
    </form>
  )
}
