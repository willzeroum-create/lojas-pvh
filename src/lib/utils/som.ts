'use client'

/**
 * Campainha de pedido novo, sintetizada com Web Audio: sem ficheiro de som,
 * sem pedido de rede. Dois tons curtos, como uma campainha de balcão.
 */
let contexto: AudioContext | null = null

function obterContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null
  contexto ??= new AudioContext()
  return contexto
}

/** Tem de ser chamado numa interacção do utilizador para o browser deixar tocar depois. */
export async function desbloquearSom(): Promise<boolean> {
  const ctx = obterContexto()
  if (!ctx) return false
  if (ctx.state === 'suspended') await ctx.resume()
  return ctx.state === 'running'
}

export function tocarCampainha() {
  const ctx = obterContexto()
  if (!ctx || ctx.state !== 'running') return
  const agora = ctx.currentTime
  for (const [frequencia, inicio] of [
    [880, 0],
    [1174.66, 0.18],
  ] as const) {
    const osc = ctx.createOscillator()
    const ganho = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequencia
    ganho.gain.setValueAtTime(0.0001, agora + inicio)
    ganho.gain.exponentialRampToValueAtTime(0.4, agora + inicio + 0.02)
    ganho.gain.exponentialRampToValueAtTime(0.0001, agora + inicio + 0.5)
    osc.connect(ganho).connect(ctx.destination)
    osc.start(agora + inicio)
    osc.stop(agora + inicio + 0.55)
  }
  if ('vibrate' in navigator) navigator.vibrate([120, 60, 120])
}
