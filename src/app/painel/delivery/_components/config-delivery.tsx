'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, HandCoins, Link2, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { Campo } from '@/components/ui/campo'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import type { Entregador, Zona } from '@/lib/dados/delivery'
import { formatarBRL } from '@/lib/dominio/moeda'
import { formatarTelefone } from '@/lib/dominio/telefone'
import { acertarEntregadorAction, linkEntregadorAction, removerZonaAction, salvarEntregadorAction, salvarZonaAction } from '../actions'

type EdicaoZona = { id?: string; nome: string; taxa: string; tempoMin: string; ativo: boolean }
type EdicaoEntregador = { id?: string; nome: string; whatsapp: string; repasse: string; ativo: boolean }

const numero = (v: number) => String(v).replace('.', ',')

export function ConfigDelivery({ zonas, entregadores, nomeLoja }: { zonas: Zona[]; entregadores: Entregador[]; nomeLoja: string }) {
  const router = useRouter()
  const [zona, definirZona] = useState<EdicaoZona | null>(null)
  const [entregador, definirEntregador] = useState<EdicaoEntregador | null>(null)
  const [link, definirLink] = useState<{ id: string; nome: string; whatsapp: string | null; url: string } | null>(null)
  const [aviso, definirAviso] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)
  const [pendente, iniciar] = useTransition()

  function executar<T extends { ok: boolean }>(acao: () => Promise<T>, depois?: (r: T) => void) {
    iniciar(async () => {
      definirAviso(null)
      const r = await acao()
      if (!r.ok) definirAviso({ tipo: 'erro', texto: (r as unknown as { erro: string }).erro })
      else {
        depois?.(r)
        router.refresh()
      }
    })
  }

  return (
    <div className="min-w-0 space-y-8">
      <header className="border-b border-areia pb-6">
        <Link href="/painel/delivery" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-carvao hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Entregas
        </Link>
        <h1 className="text-3xl leading-tight font-bold tracking-tight">Bairros e entregadores</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-carvao">
          Com bairros cadastrados, o cardápio cobra a taxa do bairro do cliente e não aceita entrega fora deles. Sem bairros,
          vale a taxa única da loja.
        </p>
      </header>

      {aviso && <Mensagem tipo={aviso.tipo}>{aviso.texto}</Mensagem>}

      <section aria-labelledby="titulo-bairros" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="titulo-bairros" className="text-xl font-bold">
            Bairros atendidos
          </h2>
          <Botao tamanho="sm" variante="secundario" icone={<Plus className="size-4" aria-hidden />} onClick={() => definirZona({ nome: '', taxa: '', tempoMin: '40', ativo: true })}>
            Bairro
          </Botao>
        </div>
        {zonas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-areia p-5 text-sm text-cinza">Nenhum bairro. A entrega usa a taxa única da loja.</p>
        ) : (
          <ul className="divide-y divide-areia overflow-hidden rounded-xl border border-areia bg-branco">
            {zonas.map((z) => (
              <li key={z.id} className={`flex items-center gap-3 px-4 py-3 ${z.ativo ? '' : 'opacity-60'}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{z.nome}</p>
                  <p className="text-sm text-cinza">
                    {formatarBRL(z.taxa)} · até {z.tempoMin} min{z.ativo ? '' : ' · pausado'}
                  </p>
                </div>
                <Botao
                  tamanho="sm"
                  variante="fantasma"
                  aria-label={`Editar ${z.nome}`}
                  icone={<Pencil className="size-4" aria-hidden />}
                  onClick={() => definirZona({ id: z.id, nome: z.nome, taxa: numero(z.taxa), tempoMin: String(z.tempoMin), ativo: z.ativo })}
                />
                <Botao
                  tamanho="sm"
                  variante="fantasma"
                  aria-label={`Remover ${z.nome}`}
                  disabled={pendente}
                  icone={<Trash2 className="size-4" aria-hidden />}
                  onClick={() => {
                    if (window.confirm(`Remover o bairro ${z.nome}?`)) executar(() => removerZonaAction(z.id))
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-entregadores" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="titulo-entregadores" className="text-xl font-bold">
            Entregadores
          </h2>
          <Botao tamanho="sm" variante="secundario" icone={<Plus className="size-4" aria-hidden />} onClick={() => definirEntregador({ nome: '', whatsapp: '', repasse: '', ativo: true })}>
            Entregador
          </Botao>
        </div>
        {entregadores.length === 0 ? (
          <p className="rounded-xl border border-dashed border-areia p-5 text-sm text-cinza">Nenhum entregador cadastrado.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {entregadores.map((e) => (
              <li key={e.id} className={`rounded-xl border border-areia bg-branco p-4 ${e.ativo ? '' : 'opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-lg font-bold">{e.nome}</p>
                    <p className="text-sm text-cinza">
                      {e.whatsapp ? formatarTelefone(e.whatsapp) : 'Sem WhatsApp'} · {formatarBRL(e.repasse)} por entrega
                      {e.ativo ? '' : ' · inativo'}
                    </p>
                  </div>
                  <Botao
                    tamanho="sm"
                    variante="fantasma"
                    aria-label={`Editar ${e.nome}`}
                    icone={<Pencil className="size-4" aria-hidden />}
                    onClick={() => definirEntregador({ id: e.id, nome: e.nome, whatsapp: e.whatsapp ?? '', repasse: numero(e.repasse), ativo: e.ativo })}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-papel-2 px-3 py-2">
                  <p className="text-sm">
                    A acertar: <strong className="tabular-nums">{formatarBRL(e.aAcertar.valor)}</strong>{' '}
                    <span className="text-cinza">({e.aAcertar.quantidade} {e.aAcertar.quantidade === 1 ? 'entrega' : 'entregas'})</span>
                  </p>
                  <Botao
                    tamanho="sm"
                    variante="secundario"
                    disabled={pendente || e.aAcertar.quantidade === 0}
                    icone={<HandCoins className="size-4" aria-hidden />}
                    onClick={() => {
                      if (window.confirm(`Confirmar que pagou ${formatarBRL(e.aAcertar.valor)} a ${e.nome}?`))
                        executar(
                          () => acertarEntregadorAction(e.id),
                          (r) => definirAviso({ tipo: 'sucesso', texto: `Acerto de ${formatarBRL((r as { valor: number }).valor)} registrado.` }),
                        )
                    }}
                  >
                    Acertar
                  </Botao>
                </div>
                <Botao
                  className="mt-3"
                  tamanho="sm"
                  variante="fantasma"
                  disabled={pendente}
                  icone={<Link2 className="size-4" aria-hidden />}
                  onClick={() => executar(() => linkEntregadorAction(e.id), (r) => definirLink({ id: e.id, nome: e.nome, whatsapp: e.whatsapp, url: (r as { link: string }).link }))}
                >
                  Link para o celular dele
                </Botao>
              </li>
            ))}
          </ul>
        )}
      </section>

      {zona && (
        <DialogoOperacao titulo={zona.id ? 'Editar bairro' : 'Novo bairro'} fechar={() => definirZona(null)} ocupado={pendente}>
          <form
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault()
              executar(
                () => salvarZonaAction({ ...zona, id: zona.id ?? '', taxa: zona.taxa, tempoMin: zona.tempoMin, ativo: zona.ativo }),
                () => definirZona(null),
              )
            }}
          >
            <Campo name="nome" rotulo="Bairro" value={zona.nome} onChange={(ev) => definirZona({ ...zona, nome: ev.target.value })} required maxLength={80} autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <Campo name="taxa" rotulo="Taxa (R$)" inputMode="decimal" value={zona.taxa} onChange={(ev) => definirZona({ ...zona, taxa: ev.target.value })} required />
              <Campo name="tempoMin" rotulo="Tempo (min)" inputMode="numeric" value={zona.tempoMin} onChange={(ev) => definirZona({ ...zona, tempoMin: ev.target.value })} required />
            </div>
            <label className="flex min-h-12 items-center gap-3 text-sm font-semibold">
              <input type="checkbox" className="size-5" checked={zona.ativo} onChange={(ev) => definirZona({ ...zona, ativo: ev.target.checked })} />
              Atendendo este bairro
            </label>
            <Botao type="submit" cheio carregando={pendente}>
              Salvar
            </Botao>
          </form>
        </DialogoOperacao>
      )}

      {entregador && (
        <DialogoOperacao titulo={entregador.id ? 'Editar entregador' : 'Novo entregador'} fechar={() => definirEntregador(null)} ocupado={pendente}>
          <form
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault()
              executar(() => salvarEntregadorAction({ ...entregador, id: entregador.id ?? '' }), () => definirEntregador(null))
            }}
          >
            <Campo name="nome" rotulo="Nome" value={entregador.nome} onChange={(ev) => definirEntregador({ ...entregador, nome: ev.target.value })} required maxLength={60} autoFocus />
            <Campo
              name="whatsapp"
              rotulo="WhatsApp"
              inputMode="tel"
              placeholder="(69) 99999-9999"
              value={entregador.whatsapp}
              onChange={(ev) => definirEntregador({ ...entregador, whatsapp: ev.target.value })}
            />
            <Campo
              name="repasse"
              rotulo="Repasse por entrega (R$)"
              ajuda="Quanto ele recebe por entrega concluída. Entra no acerto."
              inputMode="decimal"
              value={entregador.repasse}
              onChange={(ev) => definirEntregador({ ...entregador, repasse: ev.target.value })}
              required
            />
            <label className="flex min-h-12 items-center gap-3 text-sm font-semibold">
              <input type="checkbox" className="size-5" checked={entregador.ativo} onChange={(ev) => definirEntregador({ ...entregador, ativo: ev.target.checked })} />
              Ativo (aparece para despachar e o link funciona)
            </label>
            <Botao type="submit" cheio carregando={pendente}>
              Salvar
            </Botao>
          </form>
        </DialogoOperacao>
      )}

      {link && (
        <DialogoOperacao titulo={`Link de ${link.nome}`} fechar={() => definirLink(null)} ocupado={pendente}>
          <div className="space-y-4">
            <p className="text-sm text-carvao">
              Pelo link, {link.nome.split(' ')[0]} vê as entregas que estão com ele e marca “entregue” no celular, sem senha. Quem
              tiver o link entra — se o celular for perdido, gere outro.
            </p>
            <p className="rounded-lg bg-papel-2 p-3 text-sm break-all">{link.url}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Botao variante="secundario" icone={<Copy className="size-4" aria-hidden />} onClick={() => navigator.clipboard?.writeText(link.url)}>
                Copiar
              </Botao>
              {link.whatsapp && (
                <a
                  href={`https://wa.me/${link.whatsapp}?text=${encodeURIComponent(`Seu link de entregas da ${nomeLoja}: ${link.url}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-tinta px-5 text-[15px] font-semibold text-papel hover:bg-carvao"
                >
                  <MessageCircle className="size-4" aria-hidden /> Enviar no WhatsApp
                </a>
              )}
            </div>
            <Botao
              variante="perigo"
              cheio
              carregando={pendente}
              onClick={() => {
                if (window.confirm('O link atual deixa de funcionar. Gerar outro?'))
                  executar(() => linkEntregadorAction(link.id, true), (r) => definirLink({ ...link, url: (r as { link: string }).link }))
              }}
            >
              Gerar outro link (revoga este)
            </Botao>
          </div>
        </DialogoOperacao>
      )}
    </div>
  )
}
