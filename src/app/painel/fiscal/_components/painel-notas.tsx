'use client'

import { ExternalLink, FileText, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useRef, useState, useTransition, type FormEvent } from 'react'
import { Botao } from '@/components/ui/botao'
import { AreaTexto, Campo } from '@/components/ui/campo'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import type { VendaSemNota } from '@/lib/dados/fiscal'
import { formatarBRL } from '@/lib/dominio/moeda'
import type { DocumentoFiscalLinha } from '@/lib/supabase/tipos'
import { cancelarNfceAction, emitirNfceAction } from '../actions'
import { dataFiscal, LINK_FISCAL, SeloNota } from './apresentacao'

type NotaLista = Pick<
  DocumentoFiscalLinha,
  | 'id'
  | 'pedido_id'
  | 'tipo'
  | 'estado'
  | 'numero'
  | 'serie'
  | 'url_danfe'
  | 'mensagem'
  | 'valor_total'
  | 'criado_em'
>
type Aviso = { texto: string; tipo: 'sucesso' | 'info'; url?: string | null }
type Emissao = { pedidoId: string; titulo: string; valor: number }

function DialogoEmitir({
  venda,
  fechar,
  concluido,
}: {
  venda: Emissao
  fechar: () => void
  concluido: (aviso: Aviso) => void
}) {
  const roteador = useRouter()
  const [cpfCnpj, definirDocumento] = useState('')
  const [erro, definirErro] = useState('')
  const [pendente, iniciarTransicao] = useTransition()
  const enviando = useRef(false)

  function emitir(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current) return
    enviando.current = true
    definirErro('')
    iniciarTransicao(async () => {
      try {
        const resultado = await emitirNfceAction({ pedidoId: venda.pedidoId, cpfCnpj: cpfCnpj.trim() })
        roteador.refresh()
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        concluido({
          tipo: resultado.estado === 'autorizado' ? 'sucesso' : 'info',
          texto:
            resultado.estado === 'autorizado'
              ? `Nota ${resultado.numero ? `nº ${resultado.numero} ` : ''}autorizada.`
              : resultado.mensagem || 'Nota enviada. Acompanhe a autorização em Notas emitidas.',
          url: resultado.urlDanfe,
        })
      } catch {
        definirErro('Não foi possível confirmar a emissão. Atualize a lista antes de tentar novamente.')
        roteador.refresh()
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <DialogoOperacao titulo="Emitir nota" fechar={fechar} ocupado={pendente}>
      <form onSubmit={emitir} className="space-y-5">
        <div className="rounded-lg bg-papel-2 p-4">
          <p className="text-sm font-semibold text-carvao">{venda.titulo}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{formatarBRL(venda.valor)}</p>
        </div>
        <Campo
          name="cpf-cnpj-nota"
          rotulo="CPF na nota?"
          placeholder="CPF ou CNPJ (opcional)"
          inputMode="numeric"
          autoComplete="off"
          maxLength={18}
          value={cpfCnpj}
          onChange={(evento) => definirDocumento(evento.target.value)}
          disabled={pendente}
          aria-describedby="ajuda-documento-nota"
        />
        <p id="ajuda-documento-nota" className="text-sm leading-relaxed text-carvao">
          Informe só se o cliente pedir. O documento do cliente já cadastrado pode ser usado pelo emissor.
        </p>
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
          {pendente ? 'Emitindo nota…' : 'Emitir nota'}
        </Botao>
      </form>
    </DialogoOperacao>
  )
}

function DialogoCancelar({
  documento,
  fechar,
  concluido,
}: {
  documento: NotaLista
  fechar: () => void
  concluido: (aviso: Aviso) => void
}) {
  const roteador = useRouter()
  const [justificativa, definirJustificativa] = useState('')
  const [erro, definirErro] = useState('')
  const [pendente, iniciarTransicao] = useTransition()
  const enviando = useRef(false)
  const tamanho = justificativa.trim().length

  function cancelar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (enviando.current) return
    if (tamanho < 15 || tamanho > 255) {
      definirErro('Explique o motivo em 15 a 255 caracteres, sem contar os espaços nas pontas.')
      return
    }
    enviando.current = true
    definirErro('')
    iniciarTransicao(async () => {
      try {
        const resultado = await cancelarNfceAction(documento.id, justificativa.trim())
        roteador.refresh()
        if (!resultado.ok) {
          definirErro(resultado.erro)
          return
        }
        concluido({ tipo: 'sucesso', texto: 'Cancelamento da nota confirmado pelo emissor.' })
      } catch {
        definirErro(
          'Não foi possível confirmar o cancelamento. Atualize a lista para conferir o estado da nota.',
        )
        roteador.refresh()
      } finally {
        enviando.current = false
      }
    })
  }

  return (
    <DialogoOperacao titulo="Cancelar nota" fechar={fechar} ocupado={pendente}>
      <form onSubmit={cancelar} className="space-y-5">
        <div className="rounded-lg bg-papel-2 p-4">
          <p className="text-sm font-semibold text-carvao">
            {documento.numero ? `NFC-e nº ${documento.numero}` : 'NFC-e autorizada'}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{formatarBRL(Number(documento.valor_total))}</p>
        </div>
        <p className="text-sm leading-relaxed text-carvao">
          O motivo será enviado ao emissor. Confirme o cancelamento somente se esta nota não deve continuar
          válida.
        </p>
        <div className="space-y-2">
          <AreaTexto
            name="justificativa-nota"
            rotulo="Motivo do cancelamento"
            placeholder="Descreva por que a nota precisa ser cancelada"
            required
            minLength={15}
            maxLength={255}
            value={justificativa}
            onChange={(evento) => definirJustificativa(evento.target.value)}
            disabled={pendente}
            aria-describedby="contador-justificativa"
          />
          <p id="contador-justificativa" className="text-sm text-carvao">
            {tamanho}/255 caracteres · mínimo de 15
          </p>
        </div>
        {erro && (
          <Mensagem tipo="erro" className="break-words">
            {erro}
          </Mensagem>
        )}
        <Botao
          type="submit"
          variante="perigo"
          cheio
          carregando={pendente}
          disabled={tamanho < 15 || tamanho > 255}
        >
          {pendente ? 'Cancelando nota…' : 'Confirmar cancelamento'}
        </Botao>
      </form>
    </DialogoOperacao>
  )
}

const CANAIS: Record<string, string> = {
  cardapio: 'Cardápio',
  whatsapp: 'WhatsApp',
  balcao: 'Balcão',
  ifood: 'iFood',
  '99food': '99Food',
  mesa: 'Mesa',
}

const TIPOS_NOTA = { nfce: 'NFC-e', nfe: 'NF-e', nfse: 'NFS-e' } as const

export function PainelNotas({
  vendas,
  documentos,
  podeEmitir,
}: {
  vendas: VendaSemNota[]
  documentos: NotaLista[]
  podeEmitir: boolean
}) {
  const roteador = useRouter()
  const [atualizando, iniciarAtualizacao] = useTransition()
  const [emissao, definirEmissao] = useState<Emissao | null>(null)
  const [cancelamento, definirCancelamento] = useState<NotaLista | null>(null)
  const [aviso, definirAviso] = useState<Aviso | null>(null)

  function concluir(resultado: Aviso) {
    definirAviso(resultado)
    definirEmissao(null)
    definirCancelamento(null)
  }

  return (
    <>
      {aviso && (
        <Mensagem tipo={aviso.tipo} className="break-words">
          <div>
            <p>{aviso.texto}</p>
            {aviso.url && (
              <a
                href={aviso.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex min-h-12 items-center gap-2 font-bold underline"
              >
                Ver DANFE <ExternalLink aria-hidden="true" className="size-4" />
                <span className="sr-only"> (abre em nova aba)</span>
              </a>
            )}
          </div>
        </Mensagem>
      )}
      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-2">
        <section
          aria-labelledby="vendas-sem-nota"
          className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
        >
          <header className="border-b border-areia bg-papel-2/50 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 id="vendas-sem-nota" className="text-xl font-bold">
                Vendas sem nota
              </h2>
              <span className="text-3xl leading-none font-bold tabular-nums">{vendas.length}</span>
            </div>
            <p className="mt-2 text-sm text-carvao">Vendas concluídas nos últimos 7 dias.</p>
            {!podeEmitir && (
              <p className="mt-3 text-sm font-semibold text-carvao">
                A emissão estará disponível quando o emissor estiver ativo.
              </p>
            )}
          </header>
          {vendas.length ? (
            <ul className="divide-y divide-areia">
              {vendas.map((venda) => (
                <li key={venda.id} className="space-y-3 p-5">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold">
                        {venda.numero != null ? `Venda #${venda.numero}` : 'Venda concluída'}
                      </h3>
                      <p className="mt-1 text-sm break-words text-carvao">
                        {venda.clienteNome || 'Cliente não identificado'}
                      </p>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{formatarBRL(venda.total)}</p>
                  </div>
                  <p className="text-xs text-carvao">
                    {CANAIS[venda.canal] ?? venda.canal} · {dataFiscal(venda.criadoEm)}
                  </p>
                  <Botao
                    type="button"
                    cheio
                    disabled={!podeEmitir}
                    icone={<FileText aria-hidden="true" className="size-4" />}
                    className="bg-tangerina! text-tinta! hover:bg-tangerina-clara! active:bg-tangerina!"
                    onClick={() => {
                      definirAviso(null)
                      definirEmissao({
                        pedidoId: venda.id,
                        titulo: venda.numero != null ? `Venda #${venda.numero}` : 'Venda concluída',
                        valor: venda.total,
                      })
                    }}
                  >
                    Emitir nota
                  </Botao>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6">
              <p className="font-bold">Nenhuma venda aguardando nota.</p>
              <p className="mt-2 text-sm leading-relaxed text-carvao">
                Novas vendas concluídas sem nota aparecem aqui por 7 dias.
              </p>
            </div>
          )}
          {vendas.length >= 200 && (
            <p className="border-t border-areia p-5 text-xs text-carvao">
              Exibindo até 200 vendas recentes sem nota.
            </p>
          )}
        </section>
        <section
          aria-labelledby="notas-emitidas"
          className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-areia bg-papel-2/50 p-5">
            <div>
              <h2 id="notas-emitidas" className="text-xl font-bold">
                Notas emitidas
              </h2>
              <p className="mt-2 text-sm text-carvao">
                {documentos.length} {documentos.length === 1 ? 'nota recente' : 'notas recentes'}
              </p>
            </div>
            <Botao
              type="button"
              variante="secundario"
              carregando={atualizando}
              icone={<RefreshCw aria-hidden="true" className="size-4" />}
              onClick={() => iniciarAtualizacao(() => roteador.refresh())}
            >
              Atualizar
            </Botao>
          </header>
          {documentos.length ? (
            <ul className="divide-y divide-areia">
              {documentos.map((nota) => (
                <li key={nota.id} className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold">
                      {TIPOS_NOTA[nota.tipo]}
                      {nota.numero ? ` nº ${nota.numero}` : ' · aguardando número'}
                    </h3>
                    <SeloNota estado={nota.estado} />
                  </div>
                  <p className="text-2xl font-bold tabular-nums">{formatarBRL(Number(nota.valor_total))}</p>
                  <p className="text-xs text-carvao">
                    {dataFiscal(nota.criado_em)}
                    {nota.serie ? ` · Série ${nota.serie}` : ''}
                  </p>
                  {nota.mensagem && (
                    <p
                      className={`rounded-lg p-3 text-sm leading-relaxed break-words ${['erro', 'rejeitado', 'denegado'].includes(nota.estado) ? 'bg-vermelho-clara text-vermelho' : 'bg-papel text-carvao'}`}
                    >
                      {nota.mensagem}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {nota.url_danfe && (
                      <a
                        href={nota.url_danfe}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={LINK_FISCAL}
                      >
                        Ver DANFE <ExternalLink aria-hidden="true" className="size-4 shrink-0" />
                        <span className="sr-only"> (abre em nova aba)</span>
                      </a>
                    )}
                    {nota.tipo === 'nfce' && nota.estado === 'autorizado' && (
                      <Botao
                        type="button"
                        variante="perigo"
                        onClick={() => {
                          definirAviso(null)
                          definirCancelamento(nota)
                        }}
                      >
                        Cancelar nota
                      </Botao>
                    )}
                    {podeEmitir &&
                      nota.tipo === 'nfce' &&
                      nota.pedido_id &&
                      ['erro', 'rejeitado'].includes(nota.estado) && (
                        <Botao
                          type="button"
                          variante="secundario"
                          onClick={() => {
                            if (!nota.pedido_id) return
                            definirAviso(null)
                            definirEmissao({
                              pedidoId: nota.pedido_id,
                              titulo: 'Tentar emissão novamente',
                              valor: Number(nota.valor_total),
                            })
                          }}
                        >
                          Tentar emissão novamente
                        </Botao>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6">
              <p className="font-bold">A primeira nota aparece aqui.</p>
              <p className="mt-2 text-sm leading-relaxed text-carvao">
                Depois de emitir, acompanhe o estado e abra o DANFE assim que estiver disponível.
              </p>
            </div>
          )}
          {documentos.length >= 100 && (
            <p className="border-t border-areia p-5 text-xs text-carvao">
              Exibindo as 100 notas mais recentes.
            </p>
          )}
        </section>
      </div>
      {emissao && <DialogoEmitir venda={emissao} fechar={() => definirEmissao(null)} concluido={concluir} />}
      {cancelamento && (
        <DialogoCancelar
          documento={cancelamento}
          fechar={() => definirCancelamento(null)}
          concluido={concluir}
        />
      )}
    </>
  )
}
