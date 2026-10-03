'use client'

import { useRef, useState } from 'react'
import { Botao } from './botao'
import { DialogoOperacao } from './dialogo-operacao'
import { Mensagem } from './mensagem'
import { TecladoPin } from './teclado-pin'

type ResultadoAprovacao = { ok: boolean; erro?: string; precisaGerente?: boolean }
type PedidoAprovacao = { executar: (pinGerente: string) => Promise<ResultadoAprovacao>; mensagem?: string }

/** Mantém a operação original na memória apenas enquanto o gerente a aprova. */
export function useAprovacaoGerente() {
  const [pedido, definirPedido] = useState<PedidoAprovacao | null>(null)
  const [pin, definirPin] = useState('')
  const [erro, definirErro] = useState('')
  const [ocupado, definirOcupado] = useState(false)
  const enviando = useRef(false)
  const formulario = useRef<HTMLFormElement>(null)
  function solicitar(executar: PedidoAprovacao['executar'], mensagem?: string) {
    definirPin('')
    definirErro('')
    definirPedido({ executar, mensagem })
  }
  function fechar() {
    if (enviando.current) return
    definirPedido(null)
    definirPin('')
    definirErro('')
  }
  const dialogo = pedido ? (
    <DialogoOperacao titulo="Aprovação do gerente" fechar={fechar} ocupado={ocupado}>
      <form
        ref={formulario}
        className="space-y-4"
        onSubmit={async (evento) => {
          evento.preventDefault()
          if (enviando.current || !/^\d{4,6}$/.test(pin)) return
          enviando.current = true
          definirOcupado(true)
          definirErro('')
          try {
            const resultado = await pedido.executar(pin)
            if (resultado.ok) {
              definirPedido(null)
              definirPin('')
            } else {
              definirErro(resultado.erro ?? 'Não foi possível aprovar. Tente novamente.')
              definirPin('')
              requestAnimationFrame(() =>
                formulario.current?.querySelector<HTMLElement>('[data-teclado-pin]')?.focus(),
              )
            }
          } catch {
            definirErro(
              'Não foi possível confirmar a operação. Verifique a conexão e o resultado antes de tentar novamente.',
            )
            definirPin('')
            requestAnimationFrame(() =>
              formulario.current?.querySelector<HTMLElement>('[data-teclado-pin]')?.focus(),
            )
          } finally {
            enviando.current = false
            definirOcupado(false)
          }
        }}
      >
        <p className="text-sm leading-relaxed text-carvao">
          {pedido.mensagem ?? 'Peça ao gerente para conferir esta operação e digitar o PIN.'}
        </p>
        <TecladoPin valor={pin} onChange={definirPin} desabilitado={ocupado} rotulo="PIN do gerente" />
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        <Botao type="submit" cheio carregando={ocupado} disabled={pin.length < 4}>
          Aprovar e continuar
        </Botao>
        <Botao type="button" cheio variante="secundario" disabled={ocupado} onClick={fechar}>
          Voltar sem aprovar
        </Botao>
      </form>
    </DialogoOperacao>
  ) : null
  return { solicitar, dialogo }
}
