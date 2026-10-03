/**
 * Conteúdo da página inicial: a landing da agência. Texto e dados vivem aqui;
 * os componentes da landing (`src/app/_landing`) só os lêem. Para mudar uma
 * frase, muda-se aqui.
 *
 * Por decidir com o dono (ver docs/pesquisa/landing.md):
 *   - nome da agência (provisório: MARCA.nome) e Instagram;
 *   - publicar ou não os preços (`planos.mostrarPrecos`);
 *   - links e imagens do portfólio.
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
    sobretitulo: 'Sistemas, sites e automação em Porto Velho',
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
    semPreco: 'O valor depende dos módulos. Na visita a gente monta e você vê o preço antes de fechar.',
  },

  portfolio: [
    {
      nome: 'One',
      tipo: 'Site',
      descricao: 'Vídeo no topo e o carro em destaque trocado pelo próprio cliente.',
      url: null,
      imagem: null,
    },
    {
      nome: 'Ótica 3D',
      tipo: 'Loja virtual',
      descricao: 'Loja de óculos com modelo 3D que o cliente gira na tela antes de comprar.',
      url: null,
      imagem: null,
    },
    {
      nome: 'São Luís',
      tipo: 'Site',
      descricao: 'Simulação de financiamento que termina no WhatsApp do vendedor.',
      url: null,
      imagem: null,
    },
    {
      nome: 'Soundwaves',
      tipo: 'Site',
      descricao: 'Site institucional com identidade própria.',
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
      pergunta: 'Quanto tempo leva para começar?',
      resposta:
        'Um cardápio digital fica no ar em um dia. Um sistema com estoque e financeiro, em poucas semanas.',
    },
  ],

  contato: {
    titulo: 'Bora montar o seu?',
    texto: 'Mande uma mensagem e a gente marca uma visita na sua empresa.',
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
