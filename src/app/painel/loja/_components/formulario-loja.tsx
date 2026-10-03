'use client'

import { useActionState } from 'react'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo, Seleccao } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import type { Loja } from '@/lib/dados/lojas'
import { FUSOS_BRASIL } from '@/lib/validacao/comum'
import type { EstadoFormulario } from '../../cardapio/actions'
import { guardarLoja } from '../actions'
import { EditorHorarios } from './editor-horarios'

const NOMES_FUSO: Record<string, string> = {
  'America/Sao_Paulo': 'Brasília (SP, RJ, MG, Sul, Nordeste…)',
  'America/Manaus': 'Manaus (AM, MT, MS, RR)',
  'America/Porto_Velho': 'Porto Velho (RO)',
  'America/Rio_Branco': 'Rio Branco (AC)',
  'America/Belem': 'Belém (PA, AP)',
  'America/Fortaleza': 'Fortaleza (CE, MA, PI, PB, RN)',
  'America/Recife': 'Recife (PE)',
  'America/Bahia': 'Salvador (BA)',
  'America/Cuiaba': 'Cuiabá (MT)',
  'America/Campo_Grande': 'Campo Grande (MS)',
  'America/Boa_Vista': 'Boa Vista (RR)',
  'America/Noronha': 'Fernando de Noronha',
}

export function FormularioLoja({ loja }: { loja: Loja }) {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(guardarLoja.bind(null, loja.id), {})
  const dinheiro = (v: number) => v.toFixed(2).replace('.', ',')

  return (
    <form action={accao} className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Horário de funcionamento</h2>
        <Seleccao
          rotulo="Fuso horário"
          name="fuso_horario"
          defaultValue={loja.fuso_horario}
          erro={estado.porCampo?.fuso_horario}
        >
          {FUSOS_BRASIL.map((f) => (
            <option key={f} value={f}>
              {NOMES_FUSO[f] ?? f}
            </option>
          ))}
        </Seleccao>
        <EditorHorarios iniciais={loja.horarios} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Entrega e retirada</h2>
        <label className="flex min-h-12 items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            name="aceita_entrega"
            defaultChecked={loja.aceita_entrega}
            className="size-5 accent-tinta"
          />
          Faz entrega
        </label>
        <label className="flex min-h-12 items-center gap-3 text-[15px]">
          <input
            type="checkbox"
            name="aceita_retirada"
            defaultChecked={loja.aceita_retirada}
            className="size-5 accent-tinta"
          />
          Aceita retirada no balcão
        </label>
        <div className="grid grid-cols-3 gap-3">
          <Campo
            rotulo="Taxa (R$)"
            name="taxa_entrega"
            inputMode="decimal"
            defaultValue={dinheiro(loja.taxa_entrega)}
            erro={estado.porCampo?.taxa_entrega}
          />
          <Campo
            rotulo="Raio (km)"
            name="raio_entrega_km"
            inputMode="decimal"
            defaultValue={loja.raio_entrega_km ?? ''}
            erro={estado.porCampo?.raio_entrega_km}
          />
          <Campo
            rotulo="Mínimo (R$)"
            name="pedido_minimo"
            inputMode="decimal"
            defaultValue={dinheiro(loja.pedido_minimo)}
            erro={estado.porCampo?.pedido_minimo}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">Endereço</h2>
        <input type="hidden" name="nome" value={loja.nome} />
        <div className="grid grid-cols-[1fr_6rem] gap-3">
          <Campo rotulo="Rua" name="rua" defaultValue={loja.endereco.rua ?? ''} />
          <Campo rotulo="Número" name="numero" defaultValue={loja.endereco.numero ?? ''} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Bairro" name="bairro" defaultValue={loja.endereco.bairro ?? ''} />
          <Campo rotulo="Complemento" name="complemento" defaultValue={loja.endereco.complemento ?? ''} />
        </div>
        <div className="grid grid-cols-[1fr_4rem_7rem] gap-3">
          <Campo rotulo="Cidade" name="cidade" defaultValue={loja.endereco.cidade ?? ''} />
          <Campo
            rotulo="UF"
            name="uf"
            maxLength={2}
            defaultValue={loja.endereco.uf ?? ''}
            erro={estado.porCampo?.['endereco.uf']}
          />
          <Campo
            rotulo="CEP"
            name="cep"
            inputMode="numeric"
            defaultValue={loja.endereco.cep ?? ''}
            erro={estado.porCampo?.['endereco.cep']}
          />
        </div>
        <Campo rotulo="Ponto de referência" name="referencia" defaultValue={loja.endereco.referencia ?? ''} />
      </section>

      {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
      {estado.sucesso && <Mensagem tipo="sucesso">{estado.sucesso}</Mensagem>}
      <BotaoSubmeter tamanho="lg" cheio>
        Guardar loja
      </BotaoSubmeter>
    </form>
  )
}
