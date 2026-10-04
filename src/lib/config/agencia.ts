/**
 * Conteúdo da página inicial: a landing da agência. Texto e dados vivem aqui;
 * as abas do site (`src/app/(site)`) só os lêem. Para mudar uma
 * frase, muda-se aqui.
 *
 * Por decidir com o dono (ver docs/pesquisa/landing.md):
 *   - nome da agência (provisório: MARCA.nome) e Instagram;
 *   - número do WhatsApp comercial (NEXT_PUBLIC_WHATSAPP_COMERCIAL).
 * Decidido: sem valores no site (cotação pelo WhatsApp); portfólio só com
 * capturas, sem links para os sites dos clientes.
 */
import { urlWhatsapp } from '@/lib/dominio/whatsapp'
import { MARCA } from './marca'

export type ItemPortfolio = {
  nome: string
  tipo: string
  descricao: string
  /** Endereço público do trabalho; sem ele o cartão não tem link. */
  url: string | null
  /** Imagem em /public; sem ela o cartão é só tipográfico. */
  imagem: string | null
}

export const AGENCIA = {
  nome: MARCA.nome,
  cidade: 'Porto Velho',
  uf: 'RO',
  /** WhatsApp comercial, só dígitos com DDI. Sem ele os CTAs levam à secção de contacto. */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_COMERCIAL || MARCA.whatsappSuporte,
  instagram: null as string | null,

  hero: {
    sobretitulo: 'Sistemas, sites e automação · de Porto Velho para o mundo',
    titulo: 'O sistema da sua empresa, montado só com o que você usa.',
    subtitulo:
      'Vendas, estoque, financeiro, nota fiscal, cardápio e WhatsApp num painel feito para o seu negócio. A gente vai até você, monta tudo e treina a equipe.',
    ctaPrincipal: 'Chamar no WhatsApp',
    ctaSecundario: 'Ver o que fazemos',
  },

  /** Abertura em ritmo de vídeo: etiquetas que entram uma a uma, depois a virada. */
  problema: {
    etiquetas: [
      'Tela cheia de botão',
      'Função que ninguém usa',
      'Template com o seu nome',
      'Suporte que não aparece',
    ],
    virada: 'Não é falta de sistema.',
    viradaDestaque: 'É sistema demais.',
    texto:
      'A maioria dos sistemas da cidade é o mesmo pacote para todo mundo: troca o nome e a cor e cobra pelo pacote inteiro. Você paga pelo que não usa e a equipe se perde em menus que não são do seu negócio.',
  },

  /** Onde já há clientes: aparece no portfólio e nas perguntas. */
  presenca: {
    titulo: 'Atendemos empresas em todo o mundo.',
    paises: ['Brasil', 'Portugal', 'Espanha', 'Países Baixos'],
    texto: 'Em Porto Velho vamos até você. Fora daqui, montamos e treinamos à distância, no seu idioma.',
  },

  /** As abas do site, pela ordem do menu. */
  abas: [
    { href: '/', rotulo: 'Início' },
    { href: '/servicos', rotulo: 'Serviços' },
    { href: '/segmentos', rotulo: 'Segmentos' },
    { href: '/trabalhos', rotulo: 'Trabalhos' },
    { href: '/monte-o-seu', rotulo: 'Monte o seu' },
    { href: '/contato', rotulo: 'Contato' },
  ],

  /** Os três mundos que atendemos: aparecem no Início e na aba Segmentos. */
  segmentos: [
    {
      id: 'restaurantes',
      nome: 'Restaurantes',
      frase: 'O pedido chega pronto. A cozinha sabe o que fazer.',
      texto:
        'Cardápio por link com pedido no WhatsApp, mesas e comandas no celular do garçom, cozinha na tela, caixa que fecha certo e entrega com o motoboy marcando pelo celular.',
      entregas: ['Cardápio digital', 'Comandas e mesas', 'Tela da cozinha', 'Delivery próprio', 'Cashback para o cliente voltar'],
      exemplo: null,
    },
    {
      id: 'stands',
      nome: 'Stands de carros',
      frase: 'O carro certo, encontrado em menos de um minuto.',
      texto:
        'Estoque com filtro que funciona, cada carro com a sua página, simulador de financiamento ou de importação e o contato no WhatsApp do vendedor. Em português, espanhol, inglês ou neerlandês.',
      entregas: ['Estoque online', 'Página por carro', 'Simuladores', 'Vários idiomas', 'Painel para a equipe atualizar'],
      exemplo: "Stijvers Auto's",
    },
    {
      id: 'lojas',
      nome: 'Lojas',
      frase: 'Vende no balcão, no site e no WhatsApp. Um estoque só.',
      texto:
        'Frente de caixa com leitor e balança, estoque que baixa sozinho, nota fiscal, Pix com QR que dá baixa sozinho e loja online com o produto que o cliente gira na tela.',
      entregas: ['Frente de caixa', 'Estoque e compras', 'Nota fiscal', 'Pix integrado', 'Loja virtual'],
      exemplo: 'SunWaves',
    },
  ],

  /** "Antes e depois": o que o dono larga quando o sistema entra. */
  antesDepois: {
    antes: ['Pedido anotado no caderno', 'Estoque na cabeça do dono', 'Caixa conferido na calculadora', 'Cliente esquecido depois da compra'],
    depois: ['Pedido entra no painel com som', 'Estoque baixa a cada venda', 'Caixa fecha com a diferença à vista', 'Cashback chama o cliente de volta'],
  },

  numeros: [
    { valor: '4', rotulo: 'países com clientes' },
    { valor: '10+', rotulo: 'projetos no ar' },
    { valor: '1 dia', rotulo: 'para um cardápio digital' },
    { valor: '100%', rotulo: 'feito sob medida' },
  ],

  servicos: [
    {
      id: 'sistema',
      titulo: 'Sistema de gestão sob medida',
      texto:
        'PDV, comandas, estoque, financeiro e nota fiscal. Ligamos só os módulos do seu negócio e acrescentamos o que precisar depois.',
    },
    {
      id: 'cardapio',
      titulo: 'Cardápio e catálogo com pedido no WhatsApp',
      texto:
        'Um link só, com foto, preço e opções. O pedido chega pronto no WhatsApp e no painel, com número e total.',
    },
    {
      id: 'sites',
      titulo: 'Sites que vendem',
      texto: 'Site institucional, landing page e loja, rápidos no celular e com o WhatsApp a um toque.',
    },
    {
      id: 'video',
      titulo: 'Vídeos e motion para redes',
      texto: 'Peças curtas que explicam o seu produto em segundos, prontas para Reels e Status.',
    },
    {
      id: 'ia',
      titulo: 'Resumo do dia no WhatsApp',
      texto: 'Todo fim de dia o dono recebe o que vendeu, o que entrou no caixa e quem bateu o ponto.',
    },
    {
      id: 'ponto',
      titulo: 'Ponto eletrônico com foto',
      texto:
        'Batida pela webcam ou pelo celular, com foto e local. O espelho de ponto sai pronto no fim do mês.',
    },
    {
      id: 'banco',
      titulo: 'Banco e Pix dentro do sistema',
      texto:
        'O Pix que cai na conta aparece no sistema e dá baixa sozinho. O fluxo de caixa fica certo sem digitar.',
    },
  ],

  /** "Monte o seu": o visitante escolhe módulos do catálogo e manda a lista pelo WhatsApp. */
  monteOSeu: {
    titulo: 'Monte o seu sistema',
    texto: 'Escolha o que a sua empresa usa. Loja e conta já vêm incluídas. A gente monta o resto na visita.',
    cta: 'Mandar esta lista no WhatsApp',
  },

  processo: [
    {
      titulo: 'Visita',
      texto:
        'Vamos até a sua empresa com notebook e tablet, entendemos a rotina e mostramos o sistema funcionando.',
    },
    {
      titulo: 'Montagem',
      texto: 'Ligamos só os módulos que você vai usar e cadastramos produtos, preços e equipe.',
    },
    {
      titulo: 'Implantação',
      texto: 'Instalamos, treinamos a equipe no balcão e acompanhamos a primeira semana.',
    },
    {
      titulo: 'Evolução',
      texto: 'Precisou de algo novo? A gente acrescenta. O sistema cresce com a empresa.',
    },
  ],

  planos: {
    /** Decisão do dono: enquanto for falso, a secção explica o modelo sem valores. */
    mostrarPrecos: false,
    mensal: {
      nome: 'Mensal sob medida',
      preco: 'a partir de R$ 400/mês',
      texto: 'Os módulos que você usa, suporte, atualizações e crédito de IA incluído.',
    },
    compra: {
      nome: 'Compra única',
      preco: 'a partir de R$ 15 mil',
      texto: 'O sistema completo, sem mensalidade. Custos de terceiros (nota fiscal, WhatsApp) à parte.',
    },
    semPreco: 'Não trabalhamos com tabela: cada empresa recebe um sistema montado para ela. Chame no WhatsApp e receba a sua cotação.',
    cta: 'Pedir cotação no WhatsApp',
  },

  portfolio: [
    {
      nome: "Stijvers Auto's",
      tipo: 'Site e catálogo · Países Baixos',
      descricao: 'Stand de viaturas sinistradas em Almere, desde 1938. Mais de 200 carros em stock com filtro rápido, para reparadores e exportadores.',
      url: null,
      imagem: '/media/portfolio/stijvers.png',
    },
    {
      nome: 'SunWaves',
      tipo: 'Loja virtual · Brasil',
      descricao: 'Ótica de Porto Velho com os óculos em 3D que o cliente gira na tela, kits com desconto automático e pedido direto no WhatsApp.',
      url: null,
      imagem: '/media/portfolio/sunwaves.png',
    },
    {
      nome: 'DEGE Cars',
      tipo: 'Site · Espanha',
      descricao: 'Remarketing de veículos em Alicante, em português, espanhol e inglês, com estoque e simulador.',
      url: null,
      imagem: '/media/portfolio/degecars.png',
    },
    {
      nome: 'Import Dream Car',
      tipo: 'Site e simulador · Portugal',
      descricao: 'Importação de carros da Alemanha, Holanda e Bélgica, com simulador do imposto e análise do anúncio por link.',
      url: null,
      imagem: '/media/portfolio/import-dream-car.png',
    },
    {
      nome: 'Alves & Bora',
      tipo: 'Site · Portugal',
      descricao: 'Cozinhas e interiores sob medida, com um atelier 3D para o cliente imaginar o espaço antes de encomendar.',
      url: null,
      imagem: '/media/portfolio/alves-bora-cozinhas.png',
    },
    {
      nome: 'Alves & Menon Imports',
      tipo: 'Site · Portugal',
      descricao: 'Importação de viaturas com cada carro em destaque, como numa vitrine.',
      url: null,
      imagem: '/media/portfolio/alves-menon-imports.png',
    },
    {
      nome: 'Futuro Automóvel',
      tipo: 'Site · Portugal',
      descricao: 'Stand de viaturas selecionadas, com estoque, garantia e financiamento à medida.',
      url: null,
      imagem: '/media/portfolio/futuro-automovel.png',
    },
    {
      nome: 'Sr. Ronaldo Reparações',
      tipo: 'Site · Portugal',
      descricao: 'Assistência técnica 24 horas: ligar ou mandar fotos do problema pelo WhatsApp a um toque.',
      url: null,
      imagem: '/media/portfolio/sr-ronaldo.png',
    },
    {
      nome: 'LegalCar',
      tipo: 'Sistema · Portugal',
      descricao: 'Gestão da legalização de carros importados, com portal para o cliente acompanhar cada etapa.',
      url: null,
      imagem: '/media/portfolio/legalcar.png',
    },
    {
      nome: 'Bem Veículos',
      tipo: 'Site e painel · Brasil',
      descricao: 'Loja de veículos com estoque, financiamento e troca, e um painel para a equipe atualizar tudo.',
      url: null,
      imagem: null,
    },
  ] satisfies readonly ItemPortfolio[],

  video: {
    src: '/media/video-catalogo-whatsapp.mp4',
    poster: '/media/video-catalogo-whatsapp.jpg',
    titulo: 'Vídeo para redes',
    descricao: '48 segundos para explicar um catálogo por link, do problema ao pedido.',
  },

  perguntas: [
    {
      pergunta: 'Preciso trocar de computador?',
      resposta: 'Não. O sistema roda no navegador: computador, tablet ou celular.',
    },
    {
      pergunta: 'Emite nota fiscal?',
      resposta:
        'Sim, por emissor parceiro homologado: NF-e, NFC-e e NFS-e. Você só precisa do certificado digital A1.',
    },
    {
      pergunta: 'E se eu precisar de uma função nova?',
      resposta: 'A gente desenvolve. É isso que sob medida quer dizer.',
    },
    {
      pergunta: 'Meus dados ficam separados dos de outras empresas?',
      resposta: 'Sim. Cada empresa tem os dados isolados e cada pessoa da equipe entra com o próprio acesso.',
    },
    {
      pergunta: 'Vocês atendem fora de Porto Velho?',
      resposta:
        'Sim. Temos clientes no Brasil, em Portugal, na Espanha e nos Países Baixos. Fora de Porto Velho, a montagem e o treinamento são feitos à distância.',
    },
    {
      pergunta: 'Quanto custa?',
      resposta: 'Depende do que a sua empresa precisa. Chame no WhatsApp, conte como funciona o seu negócio e receba a cotação.',
    },
    {
      pergunta: 'Quanto tempo leva para começar?',
      resposta:
        'Um cardápio digital fica no ar em um dia. Um sistema com estoque e financeiro, em poucas semanas.',
    },
  ],

  contato: {
    titulo: 'Bora montar o seu?',
    texto: 'Mande uma mensagem e receba a cotação. Em Porto Velho a gente vai até você; no resto do mundo, fazemos tudo à distância.',
  },
} as const

const MENSAGEM_PADRAO = 'Olá! Vi o site e quero conversar sobre um sistema para a minha empresa.'

/** Link do WhatsApp comercial com mensagem pronta; sem número configurado, a âncora do contacto. */
export function linkWhatsappAgencia(mensagem: string = MENSAGEM_PADRAO): string {
  return AGENCIA.whatsapp ? urlWhatsapp(AGENCIA.whatsapp, mensagem) : '#contato'
}

/** Mensagem do "Monte o seu": a lista de módulos escolhidos, um por linha. */
export function mensagemMonteOSeu(nomesModulos: readonly string[]): string {
  if (nomesModulos.length === 0) return MENSAGEM_PADRAO
  return [
    'Olá! Montei no site um sistema com estes módulos:',
    ...nomesModulos.map((n) => `• ${n}`),
    '',
    'Podemos marcar uma visita?',
  ].join('\n')
}
