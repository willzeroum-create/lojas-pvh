'use client'

import { Check, Pencil, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, type FormEvent } from 'react'
import { Botao } from '@/components/ui/botao'
import { Campo } from '@/components/ui/campo'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import type { ProdutoFiscal } from '@/lib/dados/fiscal'
import { salvarFiscalProdutoAction } from '../actions'

function EditorProdutoFiscal({
  produto,
  fechar,
  salvo,
}: {
  produto: ProdutoFiscal
  fechar: () => void
  salvo: () => void
}) {
  const roteador = useRouter()
  const [valores, definirValores] = useState({
    ncm: produto.ncm ?? '',
    cfop: produto.cfop || '5102',
    csosn: produto.csosn || '102',
    origem: String(produto.origem ?? 0),
    cest: produto.cest ?? '',
  })
  const [erro, definirErro] = useState('')
  const [erros, definirErros] = useState<Record<string, string>>({})
  const [pendente, iniciarTransicao] = useTransition()
  const enviando = useRef(false)

  function mudar(campo: keyof typeof valores, valor: string) {
    definirValores((atual) => ({ ...atual, [campo]: valor }))
    definirErros((atuais) => ({ ...atuais, [campo]: '' }))
  }

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current) return
    const problemas: Record<string, string> = {}
    const digitos = (valor: string) => valor.replace(/[^0-9]/g, '')
    if (valores.ncm.trim() && digitos(valores.ncm).length !== 8) problemas.ncm = 'NCM precisa ter 8 dígitos.'
    if (digitos(valores.cfop).length !== 4) problemas.cfop = 'CFOP precisa ter 4 dígitos.'
    if (digitos(valores.csosn).length !== 3) problemas.csosn = 'CSOSN precisa ter 3 dígitos.'
    if (valores.cest.trim() && digitos(valores.cest).length !== 7)
      problemas.cest = 'CEST precisa ter 7 dígitos.'
    if (
      !valores.origem.trim() ||
      !Number.isInteger(Number(valores.origem)) ||
      Number(valores.origem) < 0 ||
      Number(valores.origem) > 8
    )
      problemas.origem = 'Use um código inteiro de 0 a 8.'
    definirErros(problemas)
    definirErro('')
    if (Object.keys(problemas).length) {
      definirErro('Confira os campos destacados antes de salvar.')
      return
    }
    enviando.current = true
    iniciarTransicao(async () => {
      try {
        const resultado = await salvarFiscalProdutoAction({
          produtoId: produto.id,
          ...valores,
          origem: Number(valores.origem),
        })
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        roteador.refresh()
        salvo()
      } catch {
        definirErro('Não foi possível salvar os dados fiscais. Confira a conexão e tente novamente.')
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <DialogoOperacao titulo="Dados fiscais do produto" fechar={fechar} ocupado={pendente}>
      <form onSubmit={salvar} className="space-y-5">
        <div className="rounded-lg bg-papel-2 p-4">
          <p className="font-bold break-words">{produto.nome}</p>
          <p className="mt-1 text-sm text-carvao">{produto.categoria || 'Sem categoria'}</p>
        </div>
        <Campo
          name="ncm-produto"
          rotulo="NCM"
          inputMode="numeric"
          placeholder="0000.00.00"
          maxLength={10}
          value={valores.ncm}
          onChange={(evento) => mudar('ncm', evento.target.value)}
          erro={erros.ncm}
          disabled={pendente}
          aria-describedby="ajuda-ncm-produto"
        />
        <p
          id="ajuda-ncm-produto"
          className={`text-sm ${valores.ncm.trim() ? 'text-carvao' : 'font-semibold text-vermelho'}`}
        >
          São 8 dígitos; pode usar pontos. Sem NCM, este produto impede a emissão da nota.
        </p>
        <div className="grid min-w-0 grid-cols-2 gap-3">
          <Campo
            name="cfop-produto"
            rotulo="CFOP"
            inputMode="numeric"
            maxLength={5}
            value={valores.cfop}
            onChange={(evento) => mudar('cfop', evento.target.value)}
            erro={erros.cfop}
            required
            disabled={pendente}
          />
          <Campo
            name="csosn-produto"
            rotulo="CSOSN"
            inputMode="numeric"
            maxLength={3}
            value={valores.csosn}
            onChange={(evento) => mudar('csosn', evento.target.value)}
            erro={erros.csosn}
            required
            disabled={pendente}
          />
        </div>
        <Campo
          name="origem-produto"
          rotulo="Origem da mercadoria (0 a 8)"
          type="number"
          inputMode="numeric"
          min={0}
          max={8}
          step={1}
          value={valores.origem}
          onChange={(evento) => mudar('origem', evento.target.value)}
          erro={erros.origem}
          required
          disabled={pendente}
          aria-describedby="ajuda-origem-produto"
        />
        <p id="ajuda-origem-produto" className="text-sm leading-relaxed text-carvao">
          0 = nacional. Use o código confirmado pela contabilidade.
        </p>
        <Campo
          name="cest-produto"
          rotulo="CEST (opcional)"
          inputMode="numeric"
          placeholder="00.000.00"
          maxLength={9}
          value={valores.cest}
          onChange={(evento) => mudar('cest', evento.target.value)}
          erro={erros.cest}
          disabled={pendente}
        />
        {erro && (
          <Mensagem tipo="erro" className="break-words">
            {erro}
          </Mensagem>
        )}
        <Botao
          type="submit"
          cheio
          carregando={pendente}
          className="bg-tangerina! text-tinta! hover:bg-tangerina-clara! active:bg-tangerina!"
        >
          {pendente ? 'Salvando dados…' : 'Salvar dados fiscais'}
        </Botao>
      </form>
    </DialogoOperacao>
  )
}

const normalizarBusca = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')

export function ListaProdutosFiscais({ produtos }: { produtos: ProdutoFiscal[] }) {
  const [busca, definirBusca] = useState('')
  const [soPendentes, definirSoPendentes] = useState(false)
  const [editando, definirEditando] = useState<ProdutoFiscal | null>(null)
  const [aviso, definirAviso] = useState('')
  const pendentes = produtos.filter((produto) => !produto.ncm).length
  const encontrados = produtos.filter(
    (produto) =>
      (!soPendentes || !produto.ncm) &&
      normalizarBusca(`${produto.nome} ${produto.categoria ?? ''} ${produto.ncm ?? ''}`).includes(
        normalizarBusca(busca.trim()),
      ),
  )

  return (
    <>
      <section
        aria-label="Pendências fiscais dos produtos"
        className={`flex flex-wrap items-start justify-between gap-4 rounded-xl border p-5 sm:p-6 ${pendentes ? 'border-vermelho/30 bg-vermelho-clara' : 'border-areia bg-branco'}`}
      >
        <div className="max-w-xl">
          <p
            className={`text-xs font-bold tracking-widest uppercase ${pendentes ? 'text-vermelho' : 'text-[#176b3a]'}`}
          >
            {pendentes ? 'Antes de emitir' : 'NCM preenchido'}
          </p>
          <h2 className="mt-2 text-xl font-bold">
            {pendentes
              ? `${pendentes} ${pendentes === 1 ? 'produto sem NCM' : 'produtos sem NCM'}`
              : 'Nenhum produto sem NCM'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            {pendentes
              ? 'Vendas com esses produtos terão a nota recusada. Eles aparecem primeiro na lista.'
              : 'Confira os demais códigos com a contabilidade antes da primeira emissão.'}
          </p>
        </div>
        {pendentes > 0 ? (
          <p className="text-5xl leading-none font-bold text-vermelho tabular-nums" aria-hidden="true">
            {pendentes}
          </p>
        ) : (
          <Check aria-hidden="true" className="size-8 text-[#176b3a]" />
        )}
      </section>
      {aviso && (
        <Mensagem tipo="sucesso" className="break-words">
          {aviso}
        </Mensagem>
      )}
      {produtos.length ? (
        <section aria-label="Lista de produtos" className="space-y-4">
          <div className="flex flex-col items-stretch gap-3 rounded-xl border border-areia bg-papel-2/50 p-4 sm:p-5 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <Campo
                name="busca-produto-fiscal"
                rotulo="Buscar produto"
                type="search"
                placeholder="Nome, categoria ou NCM"
                value={busca}
                onChange={(evento) => definirBusca(evento.target.value)}
              />
            </div>
            <Botao
              type="button"
              variante={soPendentes ? 'primario' : 'secundario'}
              aria-pressed={soPendentes}
              onClick={() => definirSoPendentes((atual) => !atual)}
            >
              Sem NCM ({pendentes})
            </Botao>
          </div>
          <p aria-live="polite" className="text-sm text-carvao">
            {encontrados.length} {encontrados.length === 1 ? 'produto na lista' : 'produtos na lista'}
          </p>
          {encontrados.length ? (
            <ul className="grid min-w-0 gap-3 lg:grid-cols-2">
              {encontrados.map((produto) => (
                <li
                  key={produto.id}
                  className={`min-w-0 rounded-xl border bg-branco p-5 ${produto.ncm ? 'border-areia' : 'border-vermelho/40'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold break-words">{produto.nome}</h3>
                      <p className="mt-1 text-sm text-carvao">{produto.categoria || 'Sem categoria'}</p>
                    </div>
                    {!produto.ncm && (
                      <span className="rounded-md bg-vermelho-clara px-2.5 py-1 text-xs font-bold text-vermelho">
                        NCM pendente
                      </span>
                    )}
                  </div>
                  <dl className="mt-5 grid min-w-0 grid-cols-2 gap-x-5 gap-y-3 border-t border-areia pt-4">
                    <div className="col-span-2">
                      <dt className="text-xs font-semibold text-carvao">NCM</dt>
                      <dd
                        className={`mt-1 text-2xl font-bold tabular-nums ${produto.ncm ? 'text-tinta' : 'text-vermelho'}`}
                      >
                        {produto.ncm || 'Não informado'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-carvao">CFOP</dt>
                      <dd className="mt-1 font-semibold tabular-nums">{produto.cfop || 'Não informado'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-carvao">CSOSN</dt>
                      <dd className="mt-1 font-semibold tabular-nums">{produto.csosn || 'Não informado'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-carvao">Origem</dt>
                      <dd className="mt-1 text-sm font-semibold">
                        {produto.origem === 0 ? '0 · Nacional' : produto.origem}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-carvao">CEST</dt>
                      <dd className="mt-1 text-sm font-semibold tabular-nums">
                        {produto.cest || 'Não informado'}
                      </dd>
                    </div>
                  </dl>
                  <Botao
                    type="button"
                    variante="secundario"
                    cheio
                    className="mt-5"
                    icone={<Pencil aria-hidden="true" className="size-4" />}
                    onClick={() => {
                      definirAviso('')
                      definirEditando(produto)
                    }}
                  >
                    {produto.ncm ? 'Editar dados fiscais' : 'Preencher dados fiscais'}
                  </Botao>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-areia bg-branco p-6">
              <Search aria-hidden="true" className="mb-3 size-5 text-carvao" />
              <h2 className="font-bold">Nenhum produto encontrado.</h2>
              <p className="mt-2 text-sm text-carvao">Confira o nome buscado ou remova o filtro.</p>
              <Botao
                type="button"
                variante="secundario"
                className="mt-4"
                onClick={() => {
                  definirBusca('')
                  definirSoPendentes(false)
                }}
              >
                Limpar busca e filtro
              </Botao>
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-xl border border-areia bg-branco p-6">
          <h2 className="text-xl font-bold">Nenhum produto cadastrado.</h2>
          <p className="mt-2 text-sm leading-relaxed text-carvao">
            Depois de cadastrar os produtos, preencha os dados fiscais aqui para emitir suas notas.
          </p>
        </section>
      )}
      {editando && (
        <EditorProdutoFiscal
          key={editando.id}
          produto={editando}
          fechar={() => definirEditando(null)}
          salvo={() => {
            definirAviso(`Dados fiscais de ${editando.nome} salvos.`)
            definirEditando(null)
          }}
        />
      )}
    </>
  )
}
