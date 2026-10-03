'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Search, X } from 'lucide-react'
import { useRef, useState, useTransition, type InputHTMLAttributes, type ReactNode } from 'react'
import { formatarDocumento, normalizarDocumento } from '@/lib/dominio/documento'
import { formatarTelefone } from '@/lib/dominio/telefone'
import type { ConsentimentoLinha, PessoaEnderecoLinha, PessoaLinha } from '@/lib/supabase/tipos'
import { consultarCepAction, consultarCnpjAction, salvarPessoaAction } from '../actions'

type EnderecoFormulario = {
  rotulo: string
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  uf: string
  referencia: string
}

type Props = {
  pessoa?: PessoaLinha
  enderecoPrincipal?: PessoaEnderecoLinha
  consentimentoMarketing?: ConsentimentoLinha
}

const ESTILO_CAMPO =
  'min-h-12 w-full min-w-0 rounded-xl border border-areia bg-branco px-3.5 py-3 text-base text-tinta placeholder:text-carvao/60 focus:border-tinta focus:outline-none focus:ring-2 focus:ring-tinta/15 disabled:cursor-wait disabled:bg-papel-2 aria-[invalid=true]:border-vermelho'
const ESTILO_BOTAO =
  'inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-areia bg-papel px-4 py-3 text-sm font-bold text-tinta transition-colors hover:bg-papel-2 disabled:cursor-wait disabled:opacity-60'

function CampoPessoa({
  rotulo,
  erro,
  ajuda,
  name,
  className = '',
  ...atributos
}: InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string; ajuda?: string; name: string }) {
  const descricao = erro ? `${name}-erro` : ajuda ? `${name}-ajuda` : undefined
  return (
    <div className={`min-w-0 space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-bold text-carvao">
        {rotulo}
        {atributos.required && (
          <span className="ml-1 text-vermelho" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        {...atributos}
        id={name}
        name={name}
        className={ESTILO_CAMPO}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao}
      />
      {erro ? (
        <p id={`${name}-erro`} role="alert" className="text-sm font-medium text-vermelho">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={`${name}-ajuda`} className="text-sm leading-relaxed text-carvao">
          {ajuda}
        </p>
      ) : null}
    </div>
  )
}

function Secao({
  numero,
  titulo,
  descricao,
  children,
}: {
  numero: string
  titulo: string
  descricao: string
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={`secao-${numero}`}
      className="overflow-hidden rounded-2xl border border-areia bg-branco"
    >
      <div className="flex items-start gap-3 border-b border-areia bg-papel-2/50 px-4 py-5 sm:px-6">
        <span className="pt-0.5 text-xs font-extrabold tracking-wider text-carvao" aria-hidden="true">
          {numero}
        </span>
        <div className="min-w-0">
          <h2 id={`secao-${numero}`} className="font-sans text-lg font-bold tracking-tight">
            {titulo}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-carvao">{descricao}</p>
        </div>
      </div>
      <div className="space-y-5 p-4 sm:p-6">{children}</div>
    </section>
  )
}

export function FormularioPessoa({ pessoa, enderecoPrincipal, consentimentoMarketing }: Props) {
  const roteador = useRouter()
  const formulario = useRef<HTMLFormElement>(null)
  const resumoErro = useRef<HTMLDivElement>(null)
  const campoEtiqueta = useRef<HTMLInputElement>(null)
  const [salvando, iniciarSalvamento] = useTransition()
  const [navegando, setNavegando] = useState(false)
  const [consulta, setConsulta] = useState<'cnpj' | 'cep' | null>(null)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroGeral, setErroGeral] = useState('')
  const [erroCnpj, setErroCnpj] = useState('')
  const [erroCep, setErroCep] = useState('')
  const [avisoCep, setAvisoCep] = useState('')
  const [empresaConsultada, setEmpresaConsultada] = useState<{
    situacao: string | null
    atividade: string | null
  } | null>(null)
  const [novaEtiqueta, setNovaEtiqueta] = useState('')
  const [etiquetas, setEtiquetas] = useState(pessoa?.etiquetas ?? [])
  const [aceitaMarketing, setAceitaMarketing] = useState<boolean | undefined>(
    consentimentoMarketing?.concedido,
  )
  const [dados, setDados] = useState({
    nome: pessoa?.nome ?? '',
    nome_fantasia: pessoa?.nome_fantasia ?? '',
    documento: pessoa?.documento ? formatarDocumento(pessoa.documento) : '',
    whatsapp: pessoa?.whatsapp ? formatarTelefone(pessoa.whatsapp) : '',
    email: pessoa?.email ?? '',
    nascimento: pessoa?.nascimento ?? '',
    observacoes: pessoa?.observacoes ?? '',
    e_cliente: pessoa?.e_cliente ?? true,
    e_fornecedor: pessoa?.e_fornecedor ?? false,
  })
  const [endereco, setEndereco] = useState<EnderecoFormulario>({
    rotulo: enderecoPrincipal?.rotulo ?? 'Principal',
    cep: enderecoPrincipal?.cep ?? '',
    rua: enderecoPrincipal?.rua ?? '',
    numero: enderecoPrincipal?.numero ?? '',
    complemento: enderecoPrincipal?.complemento ?? '',
    bairro: enderecoPrincipal?.bairro ?? '',
    cidade: enderecoPrincipal?.cidade ?? '',
    uf: enderecoPrincipal?.uf ?? '',
    referencia: enderecoPrincipal?.referencia ?? '',
  })

  const ocupado = salvando || navegando || consulta !== null
  const temCnpj = normalizarDocumento(dados.documento).length === 14
  const destinoVoltar = pessoa ? `/painel/clientes/${pessoa.id}` : '/painel/clientes'
  const erroEtiquetas = Object.entries(erros).find(
    ([chave]) => chave === 'etiquetas' || chave.startsWith('etiquetas.'),
  )?.[1]

  function limparErro(campo: string) {
    setErros((anteriores) => {
      const atualizados = { ...anteriores }
      delete atualizados[campo]
      return atualizados
    })
  }

  function alterarDado<K extends keyof typeof dados>(campo: K, valor: (typeof dados)[K]) {
    setDados((anteriores) => ({ ...anteriores, [campo]: valor }))
    limparErro(campo)
    if (campo === 'documento') {
      setEmpresaConsultada(null)
      setErroCnpj('')
    }
    if (campo === 'e_fornecedor' || campo === 'e_cliente') limparErro('e_cliente')
  }

  function alterarEndereco(campo: keyof EnderecoFormulario, valor: string) {
    setEndereco((anterior) => ({ ...anterior, [campo]: valor }))
    limparErro(`endereco.${campo}`)
    limparErro('endereco')
    if (campo === 'cep') {
      setErroCep('')
      setAvisoCep('')
    }
  }

  function focarErro(porCampo?: Record<string, string>) {
    requestAnimationFrame(() => {
      const nome = Object.keys(porCampo ?? {})[0]
      const campo =
        nome && formulario.current?.elements.namedItem(nome.startsWith('etiquetas.') ? 'etiquetas' : nome)
      if (campo instanceof HTMLElement) campo.focus()
      else resumoErro.current?.focus()
    })
  }

  function adicionarEtiqueta() {
    const etiqueta = novaEtiqueta.trim().toLowerCase()
    if (!etiqueta) return
    if (etiquetas.length >= 20 && !etiquetas.includes(etiqueta)) {
      setErros((anteriores) => ({ ...anteriores, etiquetas: 'Use até 20 etiquetas por cadastro.' }))
      return
    }
    setEtiquetas((anteriores) => (anteriores.includes(etiqueta) ? anteriores : [...anteriores, etiqueta]))
    setNovaEtiqueta('')
    limparErro('etiquetas')
    campoEtiqueta.current?.focus()
  }

  async function buscarCnpj() {
    if (ocupado) return
    setConsulta('cnpj')
    setErroCnpj('')
    setEmpresaConsultada(null)
    try {
      const resultado = await consultarCnpjAction(dados.documento)
      if (!resultado.ok) {
        setErroCnpj(resultado.erro)
        return
      }
      const { empresa } = resultado
      setDados((anteriores) => ({
        ...anteriores,
        nome: empresa.razaoSocial || anteriores.nome,
        nome_fantasia: empresa.nomeFantasia ?? anteriores.nome_fantasia,
        email: empresa.email ?? anteriores.email,
        whatsapp: empresa.telefone ? formatarTelefone(empresa.telefone) : anteriores.whatsapp,
      }))
      if (empresa.endereco) {
        const encontrado = empresa.endereco
        setEndereco((anterior) => ({
          ...anterior,
          cep: encontrado.cep,
          rua: encontrado.rua ?? '',
          numero: encontrado.numero ?? '',
          complemento: encontrado.complemento ?? '',
          bairro: encontrado.bairro ?? '',
          cidade: encontrado.cidade ?? '',
          uf: encontrado.uf ?? '',
        }))
      }
      setEmpresaConsultada({ situacao: empresa.situacao, atividade: empresa.atividade })
      setErros({})
      setErroCep('')
      setAvisoCep('')
    } catch {
      setErroCnpj('Não foi possível consultar agora. Tente novamente ou preencha os dados manualmente.')
    } finally {
      setConsulta(null)
    }
  }

  async function buscarCep() {
    if (ocupado) return
    setConsulta('cep')
    setErroCep('')
    setAvisoCep('')
    try {
      const resultado = await consultarCepAction(endereco.cep)
      if (!resultado.ok) {
        setErroCep(resultado.erro)
        return
      }
      const encontrado = resultado.endereco
      setEndereco((anterior) => ({
        ...anterior,
        cep: encontrado.cep,
        rua: encontrado.rua ?? '',
        bairro: encontrado.bairro ?? '',
        cidade: encontrado.cidade ?? '',
        uf: encontrado.uf ?? '',
        complemento: encontrado.complemento ?? anterior.complemento,
      }))
      setErros((anteriores) =>
        Object.fromEntries(Object.entries(anteriores).filter(([chave]) => !chave.startsWith('endereco.'))),
      )
      setAvisoCep('Endereço preenchido. Confira o número e o complemento.')
    } catch {
      setErroCep('Não foi possível consultar agora. Você pode preencher o endereço manualmente.')
    } finally {
      setConsulta(null)
    }
  }

  function salvar() {
    if (ocupado) return
    setErroGeral('')
    setErros({})
    const temEndereco = Object.entries(endereco).some(([chave, valor]) => chave !== 'rotulo' && valor.trim())
    if (enderecoPrincipal && !temEndereco) {
      const mensagem =
        'Preencha o endereço principal para atualizá-lo. Apagar os campos não remove o endereço salvo.'
      setErroGeral('Confira o endereço antes de salvar.')
      setErros({ endereco: mensagem })
      focarErro({ 'endereco.cep': mensagem })
      return
    }
    const etiquetaPendente = novaEtiqueta.trim().toLowerCase()
    const etiquetasSalvar =
      etiquetaPendente && !etiquetas.includes(etiquetaPendente) ? [...etiquetas, etiquetaPendente] : etiquetas
    if (etiquetasSalvar.length > 20) {
      const mensagem = 'Use até 20 etiquetas por cadastro.'
      setErroGeral(mensagem)
      setErros({ etiquetas: mensagem })
      focarErro({ etiquetas: mensagem })
      return
    }
    iniciarSalvamento(async () => {
      try {
        const resultado = await salvarPessoaAction({
          ...dados,
          id: pessoa?.id,
          etiquetas: etiquetasSalvar,
          endereco: temEndereco ? endereco : undefined,
          aceita_marketing: aceitaMarketing,
        })
        if (!resultado.ok) {
          setErroGeral(resultado.erro)
          setErros(resultado.porCampo ?? {})
          focarErro(resultado.porCampo)
          return
        }
        setNavegando(true)
        roteador.push(`/painel/clientes/${resultado.id}`)
        roteador.refresh()
      } catch {
        setErroGeral(
          'Não foi possível salvar agora. Seus campos foram mantidos. Confira a conexão e tente novamente.',
        )
        focarErro()
      }
    })
  }

  return (
    <form
      ref={formulario}
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault()
        salvar()
      }}
      className="space-y-5"
      aria-busy={ocupado}
    >
      <fieldset disabled={ocupado} className="min-w-0 space-y-5">
        <legend className="sr-only">{pessoa ? 'Editar cadastro' : 'Novo cadastro'}</legend>
        <Secao
          numero="01"
          titulo="Dados e contato"
          descricao="Comece pelo nome. Os demais dados podem ser preenchidos depois."
        >
          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            <div className="min-w-0 space-y-3 md:col-span-2">
              <div className="flex min-w-0 flex-col items-stretch gap-3 lg:flex-row lg:items-start">
                <CampoPessoa
                  name="documento"
                  rotulo="CPF ou CNPJ"
                  inputMode="text"
                  autoCapitalize="characters"
                  maxLength={18}
                  value={dados.documento}
                  onChange={(evento) => alterarDado('documento', evento.target.value)}
                  onBlur={() =>
                    setDados((anteriores) => ({
                      ...anteriores,
                      documento: formatarDocumento(anteriores.documento),
                    }))
                  }
                  erro={erros.documento ?? erroCnpj}
                  ajuda="Digite com ou sem pontuação. Um CNPJ permite buscar os dados da empresa."
                  className="flex-1"
                />
                {temCnpj && (
                  <button
                    type="button"
                    onClick={buscarCnpj}
                    className={`${ESTILO_BOTAO} lg:mt-7`}
                    aria-busy={consulta === 'cnpj'}
                  >
                    <Search size={17} aria-hidden="true" />
                    {consulta === 'cnpj' ? 'Consultando Receita…' : 'Buscar na Receita'}
                  </button>
                )}
              </div>
              <div aria-live="polite" aria-atomic="true">
                {empresaConsultada && (
                  <div className="rounded-xl border border-areia bg-papel-2 p-4 text-sm leading-relaxed text-carvao">
                    <p className="flex items-center gap-2 font-bold text-tinta">
                      <Check size={17} aria-hidden="true" />
                      Dados da Receita preenchidos
                    </p>
                    <p className="mt-1">
                      Situação cadastral: <strong>{empresaConsultada.situacao ?? 'não informada'}</strong>.
                    </p>
                    {empresaConsultada.atividade && (
                      <p className="mt-1 break-words">{empresaConsultada.atividade}</p>
                    )}
                    <p className="mt-2">Confira os contatos e o endereço antes de salvar.</p>
                  </div>
                )}
              </div>
            </div>
            <CampoPessoa
              name="nome"
              rotulo={temCnpj ? 'Razão social' : 'Nome completo ou razão social'}
              autoComplete="name"
              required
              maxLength={120}
              value={dados.nome}
              onChange={(evento) => alterarDado('nome', evento.target.value)}
              erro={erros.nome}
              className="md:col-span-2"
            />
            <CampoPessoa
              name="nome_fantasia"
              rotulo="Nome fantasia"
              autoComplete="organization"
              maxLength={120}
              value={dados.nome_fantasia}
              onChange={(evento) => alterarDado('nome_fantasia', evento.target.value)}
              erro={erros.nome_fantasia}
              className="md:col-span-2"
            />
            <CampoPessoa
              name="whatsapp"
              rotulo="WhatsApp"
              type="tel"
              autoComplete="tel"
              maxLength={24}
              placeholder="(69) 99999-8888"
              value={dados.whatsapp}
              onChange={(evento) => alterarDado('whatsapp', evento.target.value)}
              onBlur={() =>
                setDados((anteriores) => ({ ...anteriores, whatsapp: formatarTelefone(anteriores.whatsapp) }))
              }
              erro={erros.whatsapp}
            />
            <CampoPessoa
              name="email"
              rotulo="E-mail"
              type="email"
              autoComplete="email"
              value={dados.email}
              onChange={(evento) => alterarDado('email', evento.target.value)}
              erro={erros.email}
            />
            <CampoPessoa
              name="nascimento"
              rotulo="Data de nascimento"
              type="date"
              autoComplete="bday"
              value={dados.nascimento}
              onChange={(evento) => alterarDado('nascimento', evento.target.value)}
              erro={erros.nascimento}
              ajuda="Para lembrar do aniversário."
            />
          </div>
        </Secao>

        <Secao
          numero="02"
          titulo="Relação com o negócio"
          descricao="Um mesmo cadastro pode ser cliente e fornecedor."
        >
          <fieldset aria-describedby={erros.e_cliente || erros.e_fornecedor ? 'papeis-erro' : undefined}>
            <legend className="mb-3 text-sm font-bold text-carvao">
              Papel no negócio{' '}
              <span className="text-vermelho" aria-hidden="true">
                *
              </span>
            </legend>
            <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
              {(
                [
                  { campo: 'e_cliente', titulo: 'Cliente', descricao: 'Compra do seu negócio' },
                  { campo: 'e_fornecedor', titulo: 'Fornecedor', descricao: 'Fornece para o seu negócio' },
                ] as const
              ).map(({ campo, titulo, descricao }) => (
                <label
                  key={campo}
                  className={`flex min-h-20 cursor-pointer items-center gap-3 rounded-xl border p-4 ${dados[campo] ? 'border-tinta bg-papel-2' : 'border-areia bg-branco'}`}
                >
                  <input
                    type="checkbox"
                    id={campo}
                    name={campo}
                    checked={dados[campo]}
                    onChange={(evento) => alterarDado(campo, evento.target.checked)}
                    aria-invalid={erros[campo] ? true : undefined}
                    aria-describedby={erros.e_cliente || erros.e_fornecedor ? 'papeis-erro' : undefined}
                    className="size-5 shrink-0 accent-tinta"
                  />
                  <span className="min-w-0">
                    <span className="block text-base font-bold">{titulo}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-carvao">{descricao}</span>
                  </span>
                </label>
              ))}
            </div>
            {(erros.e_cliente || erros.e_fornecedor) && (
              <p id="papeis-erro" className="mt-2 text-sm font-medium text-vermelho">
                {erros.e_cliente ?? erros.e_fornecedor}
              </p>
            )}
          </fieldset>
          <div className="space-y-3">
            <label htmlFor="etiquetas" className="block text-sm font-bold text-carvao">
              Etiquetas
            </label>
            <div className="flex min-w-0 flex-col gap-2 min-[440px]:flex-row">
              <input
                ref={campoEtiqueta}
                id="etiquetas"
                name="etiquetas"
                value={novaEtiqueta}
                onChange={(evento) => {
                  setNovaEtiqueta(evento.target.value)
                  limparErro('etiquetas')
                }}
                onKeyDown={(evento) => {
                  if (evento.key === 'Enter' || evento.key === ',') {
                    evento.preventDefault()
                    adicionarEtiqueta()
                  }
                }}
                maxLength={30}
                placeholder="Ex.: atacado"
                aria-invalid={erroEtiquetas ? true : undefined}
                aria-describedby={erroEtiquetas ? 'etiquetas-erro' : 'etiquetas-ajuda'}
                className={ESTILO_CAMPO}
              />
              <button
                type="button"
                onClick={adicionarEtiqueta}
                disabled={!novaEtiqueta.trim()}
                className={ESTILO_BOTAO}
              >
                Adicionar
              </button>
            </div>
            {erroEtiquetas ? (
              <p id="etiquetas-erro" className="text-sm font-medium text-vermelho">
                {erroEtiquetas}
              </p>
            ) : (
              <p id="etiquetas-ajuda" className="text-sm text-carvao">
                Organize do seu jeito. Até 20 etiquetas, com 30 caracteres cada.
              </p>
            )}
            {etiquetas.length > 0 && (
              <ul aria-label="Etiquetas do cadastro" className="flex flex-wrap gap-2">
                {etiquetas.map((etiqueta) => (
                  <li
                    key={etiqueta}
                    className="inline-flex max-w-full items-center rounded-xl border border-areia bg-papel-2 pl-3"
                  >
                    <span className="min-w-0 text-sm font-semibold break-words">{etiqueta}</span>
                    <button
                      type="button"
                      className="flex size-12 shrink-0 items-center justify-center rounded-xl text-carvao hover:bg-papel-3"
                      aria-label={`Remover etiqueta ${etiqueta}`}
                      onClick={() => {
                        setEtiquetas((anteriores) => anteriores.filter((item) => item !== etiqueta))
                        limparErro('etiquetas')
                        campoEtiqueta.current?.focus()
                      }}
                    >
                      <X size={16} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="observacoes" className="block text-sm font-bold text-carvao">
              Observações
            </label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={4}
              maxLength={2000}
              value={dados.observacoes}
              onChange={(evento) => alterarDado('observacoes', evento.target.value)}
              aria-invalid={erros.observacoes ? true : undefined}
              aria-describedby={erros.observacoes ? 'observacoes-erro' : 'observacoes-ajuda'}
              placeholder="Preferências ou informações úteis no próximo atendimento."
              className={`${ESTILO_CAMPO} resize-y`}
            />
            {erros.observacoes ? (
              <p id="observacoes-erro" className="text-sm font-medium text-vermelho">
                {erros.observacoes}
              </p>
            ) : (
              <p id="observacoes-ajuda" className="text-sm text-carvao">
                Visível apenas para a equipe do seu negócio.
              </p>
            )}
          </div>
        </Secao>

        <Secao
          numero="03"
          titulo="Endereço principal"
          descricao="Opcional. Use o CEP para preencher o endereço mais rápido."
        >
          {erros.endereco && (
            <p role="alert" className="text-sm font-medium text-vermelho">
              {erros.endereco}
            </p>
          )}
          <div className="grid min-w-0 gap-5 md:grid-cols-2">
            <div className="min-w-0 space-y-3 md:col-span-2">
              <div className="flex min-w-0 flex-col items-stretch gap-3 min-[440px]:flex-row min-[440px]:items-start">
                <CampoPessoa
                  name="endereco.cep"
                  rotulo="CEP"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={9}
                  placeholder="00000-000"
                  value={endereco.cep}
                  onChange={(evento) => alterarEndereco('cep', evento.target.value)}
                  erro={erros['endereco.cep'] ?? erroCep}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={buscarCep}
                  disabled={endereco.cep.replace(/\D/g, '').length !== 8}
                  className={`${ESTILO_BOTAO} min-[440px]:mt-7`}
                  aria-busy={consulta === 'cep'}
                >
                  <Search size={17} aria-hidden="true" />
                  {consulta === 'cep' ? 'Buscando…' : 'Buscar CEP'}
                </button>
              </div>
              <p role="status" className="text-sm text-carvao">
                {avisoCep}
              </p>
            </div>
            <CampoPessoa
              name="endereco.rotulo"
              rotulo="Nome do endereço"
              maxLength={40}
              value={endereco.rotulo}
              onChange={(evento) => alterarEndereco('rotulo', evento.target.value)}
              erro={erros['endereco.rotulo']}
              ajuda="Ex.: casa, loja ou depósito."
              className="md:col-span-2"
            />
            <CampoPessoa
              name="endereco.rua"
              rotulo="Rua ou avenida"
              autoComplete="address-line1"
              maxLength={120}
              value={endereco.rua}
              onChange={(evento) => alterarEndereco('rua', evento.target.value)}
              erro={erros['endereco.rua']}
              className="md:col-span-2"
            />
            <CampoPessoa
              name="endereco.numero"
              rotulo="Número"
              maxLength={20}
              value={endereco.numero}
              onChange={(evento) => alterarEndereco('numero', evento.target.value)}
              erro={erros['endereco.numero']}
            />
            <CampoPessoa
              name="endereco.complemento"
              rotulo="Complemento"
              autoComplete="address-line2"
              maxLength={80}
              value={endereco.complemento}
              onChange={(evento) => alterarEndereco('complemento', evento.target.value)}
              erro={erros['endereco.complemento']}
            />
            <CampoPessoa
              name="endereco.bairro"
              rotulo="Bairro"
              autoComplete="address-level3"
              maxLength={80}
              value={endereco.bairro}
              onChange={(evento) => alterarEndereco('bairro', evento.target.value)}
              erro={erros['endereco.bairro']}
            />
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] gap-3">
              <CampoPessoa
                name="endereco.cidade"
                rotulo="Cidade"
                autoComplete="address-level2"
                maxLength={80}
                value={endereco.cidade}
                onChange={(evento) => alterarEndereco('cidade', evento.target.value)}
                erro={erros['endereco.cidade']}
              />
              <CampoPessoa
                name="endereco.uf"
                rotulo="UF"
                autoComplete="address-level1"
                maxLength={2}
                value={endereco.uf}
                onChange={(evento) => alterarEndereco('uf', evento.target.value.toUpperCase())}
                erro={erros['endereco.uf']}
              />
            </div>
            <CampoPessoa
              name="endereco.referencia"
              rotulo="Ponto de referência"
              maxLength={120}
              value={endereco.referencia}
              onChange={(evento) => alterarEndereco('referencia', evento.target.value)}
              erro={erros['endereco.referencia']}
              className="md:col-span-2"
            />
          </div>
        </Secao>

        <Secao
          numero="04"
          titulo="Privacidade e consentimento"
          descricao="Registre a escolha da pessoa sobre mensagens promocionais."
        >
          <label className="flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border border-areia bg-papel-2/50 p-4">
            <input
              type="checkbox"
              id="aceita_marketing"
              name="aceita_marketing"
              checked={aceitaMarketing === true}
              onChange={(evento) => {
                setAceitaMarketing(evento.target.checked)
                limparErro('aceita_marketing')
              }}
              aria-describedby={erros.aceita_marketing ? 'aceita_marketing-erro' : 'aceita_marketing-ajuda'}
              aria-invalid={erros.aceita_marketing ? true : undefined}
              className="mt-0.5 size-5 shrink-0 accent-tinta"
            />
            <span className="text-sm leading-relaxed font-bold">Aceita receber promoções pelo WhatsApp</span>
          </label>
          {erros.aceita_marketing ? (
            <p id="aceita_marketing-erro" className="text-sm font-medium text-vermelho">
              {erros.aceita_marketing}
            </p>
          ) : (
            <p id="aceita_marketing-ajuda" className="text-sm leading-relaxed text-carvao">
              Marque somente com a autorização da pessoa. Ela pode mudar essa escolha a qualquer momento.
            </p>
          )}
          {consentimentoMarketing && (
            <p className="border-t border-areia pt-4 text-sm text-carvao">
              Escolha atual:{' '}
              <strong>
                {consentimentoMarketing.concedido ? 'promoções autorizadas' : 'promoções não autorizadas'}
              </strong>
              .
            </p>
          )}
        </Secao>
      </fieldset>

      {erroGeral && (
        <div
          ref={resumoErro}
          tabIndex={-1}
          role="alert"
          className="rounded-xl border border-vermelho/40 bg-vermelho-clara p-4 text-sm leading-relaxed text-vermelho"
        >
          <p className="font-bold">Não foi possível concluir</p>
          <p className="mt-1">{erroGeral}</p>
        </div>
      )}
      <div className="flex flex-col-reverse gap-3 border-t border-areia pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={destinoVoltar}
          aria-disabled={ocupado || undefined}
          tabIndex={ocupado ? -1 : undefined}
          onClick={(evento) => {
            if (ocupado) evento.preventDefault()
          }}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-carvao hover:bg-papel-2 ${ocupado ? 'pointer-events-none opacity-60' : ''}`}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={ocupado}
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-tangerina px-6 py-3 text-base font-bold text-tinta transition-colors hover:bg-tangerina/90 disabled:cursor-wait disabled:opacity-60"
        >
          {navegando ? 'Abrindo ficha…' : salvando ? 'Salvando cadastro…' : 'Salvar cadastro'}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p role="status" className="sr-only">
        {consulta === 'cnpj'
          ? 'Consultando os dados do CNPJ.'
          : consulta === 'cep'
            ? 'Consultando o endereço do CEP.'
            : salvando
              ? 'Salvando cadastro.'
              : navegando
                ? 'Cadastro salvo. Abrindo a ficha.'
                : ''}
      </p>
    </form>
  )
}
