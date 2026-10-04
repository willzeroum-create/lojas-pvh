import { Caveat, Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { AGENCIA } from '@/lib/config/agencia'
import Menu from './_componentes/Menu'
import estilos from './site.module.css'

/** Site da agência: fontes próprias, só carregadas nestas abas. */
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
const manuscrita = Caveat({ subsets: ['latin'], weight: ['600'], variable: '--font-manuscrita', display: 'swap' })
const mono = Geist_Mono({ subsets: ['latin'], weight: ['500'], variable: '--font-geist-mono', display: 'swap' })

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geist.variable} ${mono.variable} ${manuscrita.variable} ${estilos.site}`}>
      <Menu />
      <main>{children}</main>
      <footer className={estilos.rodape}>
        <div className={`${estilos.conteudo} ${estilos.rodapeGrade}`}>
          <p style={{ margin: 0 }}>
            {AGENCIA.nome} · {AGENCIA.cidade}/{AGENCIA.uf} · clientes no {AGENCIA.presenca.paises.join(', ')}
          </p>
          <ul className={estilos.rodapeAbas}>
            {AGENCIA.abas.map((a) => (
              <li key={a.href}>
                <Link href={a.href}>{a.rotulo}</Link>
              </li>
            ))}
            <li>
              <Link href="/entrar">Entrar no sistema</Link>
            </li>
          </ul>
        </div>
        <p className={estilos.conteudo} style={{ margin: '18px auto 0', fontSize: 12, opacity: 0.7 }}>
          Modelos 3D: Poly Haven (CC0) e “Car Concept” de Eric Chadwick para o Khronos Group (CC BY 4.0).
        </p>
      </footer>
      <div className={estilos.grao} aria-hidden="true" />
    </div>
  )
}
