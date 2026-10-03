import type { Metadata, Viewport } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import { MARCA } from '@/lib/config/marca'
import './globals.css'

/**
 * Fraunces para nomes e preços (display), Figtree para a interface. Pesos
 * limitados de propósito: a página pública tem de carregar em 4G.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-fraunces',
  display: 'swap',
})

const figtree = Figtree({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-figtree',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: MARCA.nome, template: `%s · ${MARCA.nome}` },
  description: MARCA.descricao,
}

export const viewport: Viewport = {
  themeColor: '#faf6ee',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${figtree.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  )
}
