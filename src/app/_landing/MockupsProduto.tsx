import { AGENCIA } from '@/lib/config/agencia'
import { MODULOS } from '@/lib/modulos/catalogo'
import estilos from './mockups-produto.module.css'

const rotuloModulo = (id: string) => MODULOS.find((modulo) => modulo.id === id)?.nome

/** Dados ilustrativos do briefing; não representam pedidos ou métricas de clientes. */
export function MockupPainel() {
  return (
    <div
      className={estilos.painel}
      role="img"
      aria-label="Demonstração do painel: pedido 1042, 3 itens, R$ 529,70; estados Novo, Em preparo e Pronto."
    >
      <div className={estilos.barraJanela} aria-hidden="true">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>
          {AGENCIA.nome} / {rotuloModulo('pedidos')}
        </span>
        <span>↗</span>
      </div>
      <div className={estilos.painelCorpo} aria-hidden="true">
        <aside className={estilos.menuPainel}>
          <b>
            {AGENCIA.nome}
            <i />
          </b>
          {['pedidos', 'cardapio', 'resumo', 'loja'].map((id) => (
            <span key={id}>
              <i />
              {rotuloModulo(id)}
            </span>
          ))}
          <span className={estilos.conta}>{rotuloModulo('conta')}</span>
        </aside>
        <div className={estilos.pedidos}>
          <div className={estilos.tituloPainel}>
            <strong>{rotuloModulo('pedidos')}</strong>
            <span>Demonstração</span>
          </div>
          <div className={estilos.resumoPainel}>
            <span>
              Hoje<strong>R$ 529,70</strong>
            </span>
            <span>
              Pedido<strong>01</strong>
            </span>
            <span>
              Itens<strong>03</strong>
            </span>
          </div>
          <div className={estilos.estados}>
            <span>
              Novo <b>1</b>
            </span>
            <span>
              Em preparo <b>0</b>
            </span>
            <span>
              Pronto <b>0</b>
            </span>
          </div>
          <div className={estilos.cartaoPedido}>
            <div>
              <strong>#1042</strong>
              <span className={estilos.status}>Novo</span>
            </div>
            <span>3 itens</span>
            <b>R$ 529,70</b>
            <div className={estilos.linhasPedido}>
              <i />
              <i />
              <i />
            </div>
            <span className={estilos.acaoPedido}>
              Aceitar pedido <span>↗</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function MockupCatalogo({ compacto = false }: { compacto?: boolean }) {
  return (
    <div
      className={`${estilos.celular} ${compacto ? estilos.compacto : ''}`}
      role="img"
      aria-label="Demonstração do catálogo no celular, com produtos, preços e pedido pelo WhatsApp."
    >
      <div className={estilos.ilhaCelular} aria-hidden="true" />
      <div className={estilos.telaCelular} aria-hidden="true">
        <div className={estilos.topoCelular}>
          <span>9:41</span>
          <span>▰</span>
        </div>
        <div className={estilos.marcaLoja}>
          <span>
            {AGENCIA.nome}
            <i />
          </span>
          <small>Demonstração</small>
        </div>
        <div className={estilos.capaCatalogo}>
          <span>{rotuloModulo('cardapio')}</span>
          <b>↗</b>
          <div className={estilos.arcosCatalogo} />
        </div>
        <div className={estilos.filtroCatalogo}>
          <span>Todos</span>
          <span>Produtos</span>
        </div>
        <div className={estilos.produtosCatalogo}>
          {[1, 2].map((numero) => (
            <div key={numero} className={estilos.produtoCatalogo}>
              <div
                className={`${estilos.miniaturaProduto} ${numero === 2 ? estilos.miniaturaAlternativa : ''}`}
              >
                <span className={estilos.sacolaProduto} />
              </div>
              <div>
                <span>Produto 0{numero}</span>
                <strong>{numero === 1 ? 'R$ 199,90' : 'R$ 129,90'}</strong>
              </div>
              <span className={estilos.adicionarProduto}>+</span>
            </div>
          ))}
        </div>
        <div className={estilos.totalCatalogo}>
          <span>
            3 itens<strong>R$ 529,70</strong>
          </span>
          <span>↗</span>
        </div>
        <span className={estilos.enviarPedido}>
          Pedir no WhatsApp <span>↗</span>
        </span>
      </div>
    </div>
  )
}
