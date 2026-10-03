/**
 * A ficha do cliente em números: quanto comprou, de quanto em quanto tempo e
 * há quanto tempo não volta. Lógica pura, calculada dos pedidos.
 */

export type CompraResumida = { total: number; criadoEm: string; cancelado: boolean }

export type ResumoCompras = {
  quantidade: number
  totalGasto: number
  ticketMedio: number
  primeiraCompra: string | null
  ultimaCompra: string | null
  /** Média de dias entre compras; null com menos de duas compras. */
  intervaloMedioDias: number | null
  diasSemComprar: number | null
  /** Passou mais de 1,5× o intervalo habitual sem comprar. */
  sumido: boolean
}

const DIA_MS = 86_400_000

export function resumirCompras(compras: readonly CompraResumida[], agora: Date): ResumoCompras {
  const validas = compras
    .filter((c) => !c.cancelado)
    .map((c) => ({ total: c.total, quando: new Date(c.criadoEm).getTime() }))
    .sort((a, b) => a.quando - b.quando)

  const quantidade = validas.length
  const totalGasto = Math.round(validas.reduce((s, c) => s + c.total, 0) * 100) / 100
  const primeira = validas[0]?.quando ?? null
  const ultima = validas.at(-1)?.quando ?? null
  const intervaloMedioDias =
    quantidade >= 2 && primeira !== null && ultima !== null
      ? Math.round(((ultima - primeira) / DIA_MS / (quantidade - 1)) * 10) / 10
      : null
  const diasSemComprar = ultima === null ? null : Math.floor((agora.getTime() - ultima) / DIA_MS)

  return {
    quantidade,
    totalGasto,
    ticketMedio: quantidade ? Math.round((totalGasto / quantidade) * 100) / 100 : 0,
    primeiraCompra: primeira === null ? null : new Date(primeira).toISOString(),
    ultimaCompra: ultima === null ? null : new Date(ultima).toISOString(),
    intervaloMedioDias,
    diasSemComprar,
    sumido:
      intervaloMedioDias !== null &&
      diasSemComprar !== null &&
      intervaloMedioDias > 0 &&
      diasSemComprar > intervaloMedioDias * 1.5,
  }
}
