import { Bricolage_Grotesque, Caveat, Instrument_Sans, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import { AGENCIA } from '@/lib/config/agencia'
import Menu from './_componentes/Menu'
import estilos from './site.module.css'

/** Site da agência: fontes próprias, só carregadas nestas abas. */
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['wdth', 'opsz'],
  variable: '--font-bricolage',
  display: 'swap',
})
const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument', display: 'swap' })
const manuscrita = Caveat({ subsets: ['latin'], weight: ['600'], variable: '--font-manuscrita', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono', display: 'swap' })

export default function LayoutSite({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bricolage.variable} ${instrument.variable} ${mono.variable} ${manuscrita.variable} ${estilos.site}`}>
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
