/** Ajudas puras sobre ficheiros, usadas no servidor e no browser. */

export function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function eImagem(tipo: string): boolean {
  return tipo.startsWith('image/')
}
