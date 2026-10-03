'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Camera, ExternalLink, Plus, Printer, Settings2 } from 'lucide-react'
import { Botao } from '@/components/ui/botao'
import { DialogoOperacao } from '@/components/ui/dialogo-operacao'
import { Mensagem } from '@/components/ui/mensagem'
import { useAprovacaoGerente } from '@/components/ui/aprovacao-gerente'
import type { BatidaDoEspelho, EspelhoDoMembro } from '@/lib/dados/ponto'
import { diaLocal, formatarMinutos, ROTULO_BATIDA, type TipoBatida } from '@/lib/dominio/ponto'
import { anularBatidaAction, configurarPontoMembroAction, detalheBatidaAction, lancarBatidaManualAction, type Resultado } from '../actions'
import { BOTAO_PONTO, CAMPO_PONTO, horaPonto, NavegacaoMes, nomeMes, saldoPonto } from './apresentacao'

type Modal = { tipo: 'manual' } | { tipo: 'jornada' } | { tipo: 'anular'; batida: BatidaDoEspelho } | { tipo: 'detalhe'; batida: BatidaDoEspelho }
type Detalhe = Extract<Awaited<ReturnType<typeof detalheBatidaAction>>, { ok: true }>

function diasDoMes(dados: EspelhoDoMembro) {
  const [ano, mes] = dados.mes.split('-').map(Number) as [number, number]
  const quantidade = new Date(Date.UTC(ano, mes, 0)).getUTCDate()
  return Array.from({ length: quantidade }, (_, indice) => {
    const dia = `${dados.mes}-${String(indice + 1).padStart(2, '0')}`
    const jornadas = dados.espelho.dias.filter((jornada) => jornada.dia === dia)
    const somar = (campo: 'trabalhadoMin' | 'intervaloMin' | 'noturnoMin' | 'noturnoFictoMin' | 'saldoMin') => jornadas.reduce((total, jornada) => total + jornada[campo], 0)
    return {
      dia,
      batidas: jornadas.flatMap((jornada) => jornada.batidas),
      anuladas: dados.batidas.filter((batida) => batida.anulada && diaLocal(batida.momento) === dia),
      trabalhadoMin: somar('trabalhadoMin'), intervaloMin: somar('intervaloMin'), noturnoMin: somar('noturnoMin'), noturnoFictoMin: somar('noturnoFictoMin'), saldoMin: somar('saldoMin'),
      emAndamento: jornadas.some((jornada) => jornada.emAndamento),
      inconsistencias: jornadas.flatMap((jornada) => jornada.inconsistencias),
    }
  })
}

type Dia = ReturnType<typeof diasDoMes>[number]

function Marcacoes({ dia, batidas }: { dia: Dia; batidas: BatidaDoEspelho[] }) {
  if (!dia.batidas.length && !dia.anuladas.length) return <span className="text-carvao">Sem marcações</span>
  return <div className="space-y-2"><div className="flex flex-wrap gap-x-3 gap-y-2">{dia.batidas.map((batida, indice) => <span key={batida.id ?? `${batida.momento}-${indice}`} className="inline-flex flex-wrap items-baseline gap-x-1 text-sm"><span className="text-carvao">{ROTULO_BATIDA[batida.tipo]}</span><strong className="tabular-nums">{horaPonto(batida.momento)}</strong>{batidas.find((registro) => registro.id === batida.id)?.origem === 'manual' && <span className="rounded border border-areia px-1 text-xs font-semibold">manual</span>}</span>)}</div>{dia.anuladas.map((batida) => <p key={batida.id} className="text-sm text-vermelho"><s>{ROTULO_BATIDA[batida.tipo]} {horaPonto(batida.momento)}</s> · Anulada: {batida.anulada?.motivo}</p>)}{dia.emAndamento && <p className="text-sm font-semibold text-[#176b3a]">Jornada em andamento</p>}{dia.inconsistencias.length > 0 && <ul className="space-y-1 rounded-md bg-ambar-clara px-2 py-2 text-sm font-semibold text-[#805000]">{dia.inconsistencias.map((inconsistencia, indice) => <li key={indice}>{inconsistencia}</li>)}</ul>}</div>
}

function dataCurta(dia: string) {
  return new Date(`${dia}T12:00:00-04:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', weekday: 'short', timeZone: 'America/Porto_Velho' })
}

export function EspelhoPonto({ dados, empresa }: { dados: EspelhoDoMembro; empresa: string }) {
  const router = useRouter()
  const aprovacao = useAprovacaoGerente()
  const [modal, definirModal] = useState<Modal | null>(null)
  const [erro, definirErro] = useState('')
  const [mensagem, definirMensagem] = useState('')
  const [ocupado, definirOcupado] = useState(false)
  const [detalhe, definirDetalhe] = useState<Detalhe | null>(null)
  const [tipo, definirTipo] = useState<TipoBatida>('entrada')
  const [momentoLocal, definirMomentoLocal] = useState('')
  const [motivo, definirMotivo] = useState('')
  const [registra, definirRegistra] = useState(dados.membro.registraPonto)
  const [jornada, definirJornada] = useState(String(dados.membro.jornadaMinutos))
  const enviando = useRef(false)
  const pedidoDetalhe = useRef(0)
  const dias = diasDoMes(dados)
  const totais = dados.espelho.totais

  function fechar() {
    if (enviando.current) return
    pedidoDetalhe.current++
    definirModal(null)
    definirErro('')
  }

  function abrir(proximo: Modal) {
    definirErro('')
    definirMotivo('')
    definirModal(proximo)
    if (proximo.tipo === 'manual') {
      const agora = new Date()
      definirMomentoLocal(`${diaLocal(agora)}T${horaPonto(agora.toISOString())}`)
      definirTipo('entrada')
    }
    if (proximo.tipo === 'jornada') {
      definirJornada(String(dados.membro.jornadaMinutos))
      definirRegistra(dados.membro.registraPonto)
    }
  }

  async function abrirDetalhe(batida: BatidaDoEspelho) {
    abrir({ tipo: 'detalhe', batida })
    definirDetalhe(null)
    const pedido = ++pedidoDetalhe.current
    try {
      const resultado = await detalheBatidaAction(batida.id)
      if (pedido !== pedidoDetalhe.current) return
      if (resultado.ok) definirDetalhe(resultado)
      else definirErro(resultado.erro)
    } catch {
      if (pedido === pedidoDetalhe.current) definirErro('Não foi possível abrir a foto e a localização. Tente novamente.')
    }
  }

  async function executar(operacao: (pinGerente?: string) => Promise<Resultado>, confirmacao: string) {
    if (enviando.current) return
    enviando.current = true
    definirOcupado(true)
    definirErro('')
    definirMensagem('')
    const concluir = () => { definirModal(null); definirMensagem(confirmacao); router.refresh() }
    try {
      const resultado = await operacao()
      if (resultado.ok) concluir()
      else if (resultado.precisaGerente) {
        aprovacao.solicitar(async (pinGerente) => {
          const autorizado = await operacao(pinGerente)
          if (autorizado.ok) concluir()
          return autorizado
        }, 'Confira o ajuste de ponto e informe o PIN do gerente para registrar a alteração.')
      } else definirErro(resultado.erro)
    } catch { definirErro('Não foi possível confirmar. Confira a conexão e o resultado antes de tentar novamente.') }
    finally { enviando.current = false; definirOcupado(false) }
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!modal) return
    if (modal.tipo === 'manual') {
      const entrada = { membroId: dados.membro.id, tipo, momentoLocal, motivo: motivo.trim() }
      void executar((pinGerente) => lancarBatidaManualAction({ ...entrada, pinGerente }), 'Batida manual registrada. Espelho atualizado.')
    } else if (modal.tipo === 'anular') {
      const entrada = { batidaId: modal.batida.id, motivo: motivo.trim() }
      void executar((pinGerente) => anularBatidaAction({ ...entrada, pinGerente }), 'Batida anulada. O registro e o motivo continuam no histórico.')
    } else if (modal.tipo === 'jornada') {
      void executar(() => configurarPontoMembroAction({ membroId: dados.membro.id, registraPonto: registra, jornadaMinutos: Number(jornada) }), 'Configuração de ponto salva.')
    }
  }

  return (
    <div id="espelho-ponto" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-areia pb-5"><div className="min-w-0"><p className="text-sm font-bold tracking-widest text-carvao uppercase">{empresa} / Espelho de ponto</p><h1 className="mt-2 text-3xl font-bold break-words">{dados.membro.nome}</h1><p className="mt-2 text-base text-carvao"><span className="capitalize">{nomeMes(dados.mes)}</span> · Jornada de {formatarMinutos(dados.membro.jornadaMinutos)} por dia</p><p className="mt-1 text-sm text-carvao">Horário de Porto Velho · {dados.membro.registraPonto ? 'Registro de ponto habilitado' : 'Registro de ponto desabilitado'}</p></div><Link href={`/painel/ponto/equipe?mes=${dados.mes}`} className={`${BOTAO_PONTO} print:hidden`}><ArrowLeft aria-hidden className="size-5" /> Equipe</Link></header>
      <div className="space-y-4 print:hidden"><NavegacaoMes mes={dados.mes} caminho={`/painel/ponto/${dados.membro.id}`} /><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><Botao onClick={() => abrir({ tipo: 'manual' })} icone={<Plus aria-hidden className="size-5" />}>Lançar batida manual</Botao><Botao variante="secundario" onClick={() => abrir({ tipo: 'jornada' })} icone={<Settings2 aria-hidden className="size-5" />}>Jornada e bate ponto</Botao><Botao variante="secundario" onClick={() => window.print()} icone={<Printer aria-hidden className="size-5" />}>Imprimir espelho</Botao></div></div>
      {mensagem && <Mensagem tipo="sucesso" className="print:hidden">{mensagem}</Mensagem>}
      <section aria-label="Totais do mês" className="ponto-totais grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-xl bg-tinta p-5 text-papel"><p className="text-sm">Trabalhado</p><p className="mt-3 text-4xl font-bold tabular-nums">{formatarMinutos(totais.trabalhadoMin)}</p><p className="mt-2 text-sm">{totais.diasTrabalhados} dias trabalhados</p></div><div className="rounded-xl border border-areia bg-branco p-5"><p className="text-sm text-carvao">Saldo do mês</p><p className={`mt-3 text-4xl font-bold tabular-nums ${totais.saldoMin < 0 ? 'text-vermelho' : 'text-[#176b3a]'}`}>{saldoPonto(totais.saldoMin)}</p><p className="mt-2 text-sm text-carvao">Em relação à jornada prevista</p></div><div className="rounded-xl border border-areia bg-branco p-5"><p className="text-sm text-carvao">Horas noturnas</p><p className="mt-3 text-4xl font-bold tabular-nums">{formatarMinutos(totais.noturnoMin)}</p><p className="mt-2 text-sm text-carvao">Convertidas: {formatarMinutos(totais.noturnoFictoMin)}</p></div><div className={`rounded-xl border p-5 ${totais.inconsistencias ? 'border-ambar/40 bg-ambar-clara text-[#805000]' : 'border-areia bg-branco'}`}><p className="text-sm">Pendências</p><p className="mt-3 text-4xl font-bold tabular-nums">{totais.inconsistencias}</p><p className="mt-2 text-sm">Marcações para conferir</p></div></section>
      <section aria-labelledby="titulo-dias" className="space-y-4"><div><h2 id="titulo-dias" className="text-xl font-bold">Dia a dia</h2><p className="mt-1 text-sm text-carvao">Noturno convertido considera a hora noturna reduzida. Jornadas abertas ainda podem mudar.</p></div>{!dados.batidas.length && <p className="rounded-lg border border-dashed border-areia p-4 text-base text-carvao">Nenhuma batida registrada neste mês.</p>}
        <div className="space-y-3 xl:hidden print:hidden">{dias.map((dia) => <article key={dia.dia} className={`rounded-xl border p-4 ${dia.inconsistencias.length ? 'border-ambar/50 bg-ambar-clara/30' : 'border-areia bg-branco'}`}><h3 className="mb-3 text-lg font-bold">{dataCurta(dia.dia)}</h3><Marcacoes dia={dia} batidas={dados.batidas} />{dia.batidas.length > 0 && <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-areia pt-4">{[['Trabalhado', formatarMinutos(dia.trabalhadoMin)], ['Intervalo', formatarMinutos(dia.intervaloMin)], ['Noturno', formatarMinutos(dia.noturnoMin)], ['Noturno convertido', formatarMinutos(dia.noturnoFictoMin)], ['Saldo', saldoPonto(dia.saldoMin)]].map(([rotulo, valor]) => <div key={rotulo}><dt className="text-sm text-carvao">{rotulo}</dt><dd className={`mt-1 text-xl font-bold tabular-nums ${rotulo === 'Saldo' && dia.saldoMin < 0 ? 'text-vermelho' : ''}`}>{valor}</dd></div>)}</dl>}</article>)}</div>
        <div className="hidden overflow-x-auto rounded-xl border border-areia bg-branco xl:block print:block print:overflow-visible"><table className="ponto-tabela w-full border-collapse text-left text-sm"><caption className="sr-only">Espelho diário de {dados.membro.nome}, {nomeMes(dados.mes)}</caption><thead className="bg-papel-2"><tr>{['Dia', 'Marcações', 'Trabalhado', 'Intervalo', 'Noturno', 'Convertido', 'Saldo'].map((titulo) => <th key={titulo} scope="col" className="px-3 py-4 font-bold">{titulo}</th>)}</tr></thead><tbody>{dias.map((dia) => <tr key={dia.dia} className="border-t border-areia align-top"><th scope="row" className="px-3 py-4 whitespace-nowrap">{dataCurta(dia.dia)}</th><td className="px-3 py-4"><Marcacoes dia={dia} batidas={dados.batidas} /></td>{[dia.trabalhadoMin, dia.intervaloMin, dia.noturnoMin, dia.noturnoFictoMin].map((valor, indice) => <td key={indice} className="px-3 py-4 font-semibold whitespace-nowrap tabular-nums">{dia.batidas.length ? formatarMinutos(valor) : '—'}</td>)}<td className={`px-3 py-4 font-bold whitespace-nowrap tabular-nums ${dia.saldoMin < 0 ? 'text-vermelho' : ''}`}>{dia.batidas.length ? saldoPonto(dia.saldoMin) : '—'}</td></tr>)}</tbody></table></div>
      </section>
      <section aria-labelledby="titulo-registros" className="space-y-4 print:hidden"><div><h2 id="titulo-registros" className="text-xl font-bold">Registros e comprovantes</h2><p className="mt-1 text-sm text-carvao">Fotos, localização e ajustes ficam ligados a cada batida.</p></div>{dados.batidas.length ? <div className="divide-y divide-areia rounded-xl border border-areia bg-branco">{dados.batidas.map((batida) => <article key={batida.id} className="p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><p className="text-sm text-carvao">{dataCurta(diaLocal(batida.momento))}</p><h3 className={`mt-1 text-lg font-bold ${batida.anulada ? 'text-carvao line-through' : ''}`}>{ROTULO_BATIDA[batida.tipo]} · <span className="tabular-nums">{horaPonto(batida.momento)}</span></h3><span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold ${batida.origem === 'manual' ? 'bg-ambar-clara text-[#805000]' : 'bg-papel-2 text-carvao'}`}>{batida.origem === 'manual' ? 'Manual' : 'Relógio'}</span>{batida.motivo && <p className="mt-2 text-sm text-carvao">Motivo: {batida.motivo}</p>}{batida.registadoPor && <p className="mt-1 text-sm text-carvao">Registrado por {batida.registadoPor}</p>}{batida.anulada && <p className="mt-2 text-sm font-semibold text-vermelho">Anulada: {batida.anulada.motivo}{batida.anulada.por ? ` · por ${batida.anulada.por}` : ''}</p>}</div><div className="flex w-full flex-wrap gap-2 sm:w-auto">{(batida.temFoto || batida.temLocal) && <Botao variante="secundario" onClick={() => void abrirDetalhe(batida)} icone={<Camera aria-hidden className="size-4" />}>Ver foto/local</Botao>}{!batida.anulada && <Botao variante="perigo" onClick={() => abrir({ tipo: 'anular', batida })}>Anular</Botao>}</div></div>{!batida.temFoto && !batida.temLocal && <p className="mt-2 text-sm text-carvao">Sem foto ou localização neste registro.</p>}</article>)}</div> : <p className="rounded-lg border border-dashed border-areia p-4 text-carvao">Os comprovantes aparecerão após o primeiro registro.</p>}</section>
      <div className="ponto-assinaturas hidden grid-cols-2 gap-12 pt-16 print:grid"><div className="border-t border-tinta pt-3 text-center"><p>{dados.membro.nome}</p><p>Assinatura do empregado</p></div><div className="border-t border-tinta pt-3 text-center"><p>{empresa}</p><p>Assinatura do empregador</p></div></div>
      {modal && <DialogoOperacao titulo={modal.tipo === 'manual' ? 'Lançar batida manual' : modal.tipo === 'jornada' ? 'Jornada e registro de ponto' : modal.tipo === 'anular' ? 'Anular esta batida' : 'Foto e localização'} fechar={fechar} ocupado={ocupado}>
        {modal.tipo === 'detalhe' ? <div className="space-y-4"><p className="text-base font-bold">{ROTULO_BATIDA[modal.batida.tipo]} · {dataCurta(diaLocal(modal.batida.momento))} · {horaPonto(modal.batida.momento)}</p>{!detalhe && !erro && <p role="status" className="py-8 text-center text-carvao">Carregando comprovante…</p>}{detalhe && <>{detalhe.fotoUrl ? <Image src={detalhe.fotoUrl} alt={`Foto do registro de ponto de ${dados.membro.nome}`} width={480} height={360} unoptimized className="h-auto w-full rounded-lg border border-areia" /> : <p className="rounded-lg bg-papel-2 p-4 text-carvao">Sem foto disponível para esta batida.</p>}{detalhe.latitude != null && detalhe.longitude != null ? <div className="space-y-2"><a className={`${BOTAO_PONTO} w-full`} href={`https://www.openstreetmap.org/?mlat=${detalhe.latitude}&mlon=${detalhe.longitude}#map=18/${detalhe.latitude}/${detalhe.longitude}`} target="_blank" rel="noopener noreferrer">Ver localização no mapa <ExternalLink aria-hidden className="size-4" /></a>{detalhe.precisao != null && <p className="text-sm text-carvao">Precisão aproximada: {detalhe.precisao} m.</p>}</div> : <p className="text-sm text-carvao">Localização não disponível.</p>}{detalhe.dispositivo && <p className="text-sm break-words text-carvao">Aparelho: {detalhe.dispositivo}</p>}<p className="text-sm text-carvao">A foto fica disponível neste link por 5 minutos. Reabra o comprovante se o link expirar.</p></>}{erro && <><Mensagem tipo="erro">{erro}</Mensagem><Botao variante="secundario" onClick={() => void abrirDetalhe(modal.batida)}>Tentar novamente</Botao></>}</div> : <form onSubmit={enviar} className="space-y-4"><p className="text-base font-bold">{dados.membro.nome}</p>{modal.tipo === 'jornada' ? <><label className="flex min-h-12 items-center gap-3 rounded-lg border border-areia bg-branco p-3"><input type="checkbox" checked={registra} onChange={(evento) => definirRegistra(evento.target.checked)} disabled={ocupado} className="size-5 accent-tinta" /><span className="text-base font-semibold">Bate ponto</span></label><label className="block text-sm font-semibold">Jornada diária em minutos<input type="number" min="0" max="720" step="1" value={jornada} onChange={(evento) => definirJornada(evento.target.value)} required disabled={ocupado} className={`${CAMPO_PONTO} mt-2`} /></label><p className="text-sm text-carvao">{jornada !== '' && Number.isFinite(Number(jornada)) ? `${formatarMinutos(Number(jornada))} por dia. ` : ''}Exemplo: 480 minutos = 8 horas. Máximo: 720 minutos.</p></> : <>{modal.tipo === 'manual' ? <><label className="block text-sm font-semibold">Tipo de batida<select value={tipo} onChange={(evento) => definirTipo(evento.target.value as TipoBatida)} disabled={ocupado} className={`${CAMPO_PONTO} mt-2`}>{Object.entries(ROTULO_BATIDA).map(([chave, rotulo]) => <option key={chave} value={chave}>{rotulo}</option>)}</select></label><label className="block text-sm font-semibold">Data e hora em Porto Velho<input type="datetime-local" value={momentoLocal} onChange={(evento) => definirMomentoLocal(evento.target.value)} required disabled={ocupado} className={`${CAMPO_PONTO} mt-2`} /></label></> : <p className="rounded-lg bg-vermelho-clara p-4 text-base text-vermelho">{ROTULO_BATIDA[modal.batida.tipo]} de {dataCurta(diaLocal(modal.batida.momento))} às {horaPonto(modal.batida.momento)}. A batida deixará de contar nos totais e permanecerá no histórico.</p>}<label className="block text-sm font-semibold">Motivo do ajuste<textarea value={motivo} onChange={(evento) => definirMotivo(evento.target.value)} minLength={5} maxLength={300} required disabled={ocupado} rows={3} className={`${CAMPO_PONTO} mt-2`} /></label><p className="text-sm text-carvao">Explique em pelo menos 5 caracteres. O motivo ficará no histórico.</p></>}{erro && <Mensagem tipo="erro">{erro}</Mensagem>}<Botao type="submit" cheio carregando={ocupado} variante={modal.tipo === 'anular' ? 'perigo' : 'primario'} disabled={modal.tipo !== 'jornada' && motivo.trim().length < 5}>{modal.tipo === 'jornada' ? 'Salvar configuração' : modal.tipo === 'manual' ? 'Registrar batida manual' : 'Anular batida'}</Botao><Botao type="button" cheio variante="secundario" disabled={ocupado} onClick={fechar}>Cancelar</Botao></form>}
      </DialogoOperacao>}
      {aprovacao.dialogo}
    </div>
  )
}
