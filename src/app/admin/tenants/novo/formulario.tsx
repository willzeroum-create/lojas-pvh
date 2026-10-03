'use client'

import { useActionState, useState } from 'react'
import { BotaoSubmeter } from '@/components/ui/botao-submeter'
import { Campo, Seleccao } from '@/components/ui/campo'
import { Mensagem } from '@/components/ui/mensagem'
import { gerarSlug } from '@/lib/dominio/slug'
import { FUSOS_BRASIL } from '@/lib/validacao/comum'
import { criarNovoTenant, type EstadoFormulario } from '../../actions'

function senhaAleatoria() {
  const letras = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (n) => letras[n % letras.length]).join('')
}

export function FormularioNovoTenant() {
  const [estado, accao] = useActionState<EstadoFormulario, FormData>(criarNovoTenant, {})
  const [nome, setNome] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [senha, setSenha] = useState(() => senhaAleatoria())

  return (
    <form action={accao} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <h2 className="col-span-full mt-2 text-lg font-bold">Comerciante</h2>
      <Campo
        rotulo="Nome fantasia"
        name="nome_fantasia"
        value={nome}
        onChange={(e) => {
          setNome(e.target.value)
          if (!slugManual) setSlug(gerarSlug(e.target.value))
        }}
        required
        erro={estado.porCampo?.nome_fantasia}
      />
      <Campo
        rotulo="Slug (endereço público)"
        name="slug"
        value={slug}
        onChange={(e) => {
          setSlugManual(true)
          setSlug(e.target.value)
        }}
        required
        ajuda={slug ? `/${slug}` : 'Gerado a partir do nome'}
        erro={estado.porCampo?.slug}
      />
      <Campo
        rotulo="WhatsApp para pedidos"
        name="whatsapp"
        type="tel"
        placeholder="(69) 99999-8888"
        required
        erro={estado.porCampo?.whatsapp}
      />
      <Campo rotulo="Telefone (opcional)" name="telefone" type="tel" erro={estado.porCampo?.telefone} />
      <Campo rotulo="Razão social" name="razao_social" erro={estado.porCampo?.razao_social} />
      <Campo
        rotulo="CNPJ"
        name="cnpj"
        inputMode="numeric"
        placeholder="só números"
        erro={estado.porCampo?.cnpj}
      />
      <Campo
        rotulo="Cor da página"
        name="cor_marca"
        type="color"
        defaultValue="#f2541b"
        className="w-32"
        erro={estado.porCampo?.cor_marca}
      />
      <Seleccao rotulo="Fuso horário" name="fuso_horario" defaultValue="America/Sao_Paulo">
        {FUSOS_BRASIL.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </Seleccao>

      <h2 className="col-span-full mt-2 text-lg font-bold">Endereço</h2>
      <div className="col-span-full grid grid-cols-[1fr_6rem] gap-4">
        <Campo rotulo="Rua" name="rua" />
        <Campo rotulo="Número" name="numero" />
      </div>
      <Campo rotulo="Bairro" name="bairro" />
      <Campo rotulo="Complemento" name="complemento" />
      <div className="col-span-full grid grid-cols-[1fr_4rem_7rem] gap-4">
        <Campo rotulo="Cidade" name="cidade" />
        <Campo rotulo="UF" name="uf" maxLength={2} erro={estado.porCampo?.['endereco.uf']} />
        <Campo rotulo="CEP" name="cep" inputMode="numeric" erro={estado.porCampo?.['endereco.cep']} />
      </div>
      <Campo className="col-span-full" rotulo="Ponto de referência" name="referencia" />

      <h2 className="col-span-full mt-2 text-lg font-bold">Acesso do dono</h2>
      <Campo
        rotulo="E-mail do dono"
        name="dono_email"
        type="email"
        required
        erro={estado.porCampo?.dono_email}
      />
      <Campo
        rotulo="Senha inicial"
        name="dono_senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        required
        minLength={8}
        ajuda="Anote e envie ao cliente. Pode ser trocada depois na ficha."
        erro={estado.porCampo?.dono_senha}
      />

      <div className="col-span-full mt-2 flex flex-col gap-3">
        {estado.erro && <Mensagem tipo="erro">{estado.erro}</Mensagem>}
        <BotaoSubmeter tamanho="lg">Criar tenant</BotaoSubmeter>
      </div>
    </form>
  )
}
