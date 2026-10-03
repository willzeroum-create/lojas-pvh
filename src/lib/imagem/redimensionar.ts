'use client'

/**
 * Redimensiona uma foto no browser antes do upload. As fotos vêm do telemóvel
 * do comerciante com 4 a 6 MB; saem daqui com ~100 KB em WebP, o suficiente
 * para um cardápio.
 */
export async function redimensionarParaWebp(
  ficheiro: File,
  ladoMaximo = 1200,
  qualidade = 0.82,
): Promise<Blob> {
  const bitmap = await createImageBitmap(ficheiro, { imageOrientation: 'from-image' })
  const escala = Math.min(1, ladoMaximo / Math.max(bitmap.width, bitmap.height))
  const largura = Math.round(bitmap.width * escala)
  const altura = Math.round(bitmap.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Não foi possível processar a imagem neste navegador.')
  ctx.drawImage(bitmap, 0, 0, largura, altura)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolver) => canvas.toBlob(resolver, 'image/webp', qualidade))
  if (!blob) throw new Error('Não foi possível converter a imagem.')
  return blob
}
