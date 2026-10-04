'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AGENCIA, linkWhatsappAgencia } from '@/lib/config/agencia'
import estilos from '../site.module.css'

/** Menu de abas: a aba aberta fica destacada; no celular vira uma gaveta. */
export default function Menu() {
  const caminho = usePathname()
  const [aberto, definirAberto] = useState(false)
  const ativa = (href: string) => (href === '/' ? caminho === '/' : caminho.startsWith(href))

  useEffect(() => {
    if (!aberto) return
    const fechar = (e: KeyboardEvent) => e.key === 'Escape' && definirAberto(false)
    document.addEventListener('keydown', fechar)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fechar)
      document.body.style.overflow = ''
    }
  }, [aberto])

  return (
    <>
      <header className={estilos.topo}>
        <nav className={estilos.barra} aria-label="Abas do site">
          <Link href="/" className={estilos.marca} aria-label={`${AGENCIA.nome}, início`}>
            <span className={estilos.marcaSimbolo} aria-hidden="true" />
            {AGENCIA.nome}
          </Link>
          <ul className={estilos.abas}>
            {AGENCIA.abas.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className={`${estilos.aba} ${ativa(a.href) ? estilos.abaAtiva : ''}`}
                  aria-current={ativa(a.href) ? 'page' : undefined}
                >
                  {a.rotulo}
                </Link>
              </li>
            ))}
          </ul>
          <a href={linkWhatsappAgencia()} className={estilos.botaoSol}>
            {AGENCIA.planos.cta}
          </a>
          <button type="button" className={estilos.abrirMenu} aria-expanded={aberto} onClick={() => definirAberto((v) => !v)}>
            {aberto ? 'Fechar' : 'Menu'}
          </button>
        </nav>
      </header>
      {aberto && (
        <div className={estilos.gaveta} role="dialog" aria-modal="true" aria-label="Menu">
          <ul>
            {AGENCIA.abas.map((a) => (
              <li key={a.href}>
                <Link href={a.href} aria-current={ativa(a.href) ? 'page' : undefined} onClick={() => definirAberto(false)}>
                  {a.rotulo}
                </Link>
              </li>
            ))}
          </ul>
          <a href={linkWhatsappAgencia()} className={estilos.botaoSol}>
            {AGENCIA.planos.cta}
          </a>
        </div>
      )}
    </>
  )
}
