/**
 * O catálogo da cadeia de produção: as frentes e etapas que a equipa
 * percorre com cada empresa. Vive no código para ser versionado e revisto
 * como qualquer outra decisão de produto; é materializado por tenant na
 * tabela `cadeia_etapas` (ver `progresso.ts` e `dados/cadeia.ts`).
 *
 * Para acrescentar uma etapa a todas as empresas: adicionar aqui. As
 * empresas existentes recebem-na (como "não avaliado") na próxima abertura
 * da cadeia no console.
 *
 * `fase` marca etapas cuja construção pertence a fases seguintes do brief. O
 * diagnóstico ("já tem?") faz-se desde já; a execução espera a fase.
 */

export type EtapaModelo = {
  chave: string
  titulo: string
  descricao: string
  /** A pergunta que se faz ao comerciante no diagnóstico. */
  pergunta: string
  fase?: 2 | 3 | 4
}

export type FrenteModelo = {
  chave: string
  titulo: string
  descricao: string
  etapas: EtapaModelo[]
}

export const FRENTE_LANCAMENTO = 'lancamento'

export const FRENTES: FrenteModelo[] = [
  {
    chave: FRENTE_LANCAMENTO,
    titulo: 'Lançamento na plataforma',
    descricao: 'O setup que se vende. Igual para todas as empresas, na mesma ordem.',
    etapas: [
      {
        chave: 'cadastro',
        titulo: 'Cadastro',
        descricao: 'Dados do comerciante, WhatsApp, endereço e acesso do dono ao painel.',
        pergunta: 'A conta está criada e o dono consegue entrar?',
      },
      {
        chave: 'cardapio',
        titulo: 'Cardápio carregado',
        descricao: 'Categorias, produtos, preços e grupos de opção conferidos com o dono.',
        pergunta: 'O cardápio está completo e com os preços certos?',
      },
      {
        chave: 'fotos',
        titulo: 'Fotos',
        descricao: 'Logo e fotos dos produtos principais, no mínimo os dez mais vendidos.',
        pergunta: 'Os principais produtos têm foto?',
      },
      {
        chave: 'pagina',
        titulo: 'Página publicada',
        descricao: 'Link entregue ao cliente, testado com um pedido real até ao WhatsApp.',
        pergunta: 'A página está no ar e o pedido de teste chegou?',
      },
      {
        chave: 'google',
        titulo: 'Link no Google',
        descricao: 'Link do cardápio no perfil do Google e na bio do Instagram.',
        pergunta: 'O link está no Google e no Instagram?',
      },
      {
        chave: 'cobranca',
        titulo: 'Cobrança ativa',
        descricao: 'Setup pago, mensalidade combinada e data de renovação na ficha.',
        pergunta: 'A cobrança está combinada e registada?',
      },
    ],
  },
  {
    chave: 'presenca_digital',
    titulo: 'Presença digital',
    descricao: 'O que o cliente encontra quando procura o negócio no telemóvel.',
    etapas: [
      {
        chave: 'instagram',
        titulo: 'Instagram',
        descricao: 'Perfil comercial ativo, bio com o link do cardápio, destaques com cardápio e horário.',
        pergunta: 'Já tem Instagram?',
      },
      {
        chave: 'whatsapp_business',
        titulo: 'WhatsApp Business',
        descricao: 'Conta Business com perfil preenchido, horário, mensagem de ausência e catálogo.',
        pergunta: 'Já usa WhatsApp Business?',
      },
      {
        chave: 'google_meu_negocio',
        titulo: 'Google Meu Negócio',
        descricao: 'Perfil reivindicado e verificado, com horário, fotos e endereço certos.',
        pergunta: 'Já tem perfil no Google?',
      },
      {
        chave: 'business_manager',
        titulo: 'Meta Business Manager',
        descricao: 'Gerenciador de negócios com a página, o Instagram e uma conta de anúncios ligados.',
        pergunta: 'Já tem Business Manager?',
      },
      {
        chave: 'site_proprio',
        titulo: 'Site ou domínio próprio',
        descricao: 'Domínio do negócio apontando para a página do cardápio ou para um site.',
        pergunta: 'Já tem site ou domínio?',
      },
      {
        chave: 'social_media',
        titulo: 'Produção de conteúdo',
        descricao: 'Alguém a publicar com regularidade: o dono, a equipa ou um social media contratado.',
        pergunta: 'Alguém cuida das redes?',
      },
      {
        chave: 'identidade_visual',
        titulo: 'Identidade visual',
        descricao: 'Logo em boa resolução, cores definidas e fotos dos produtos.',
        pergunta: 'Tem logo e fotos usáveis?',
      },
    ],
  },
  {
    chave: 'canais',
    titulo: 'Canais de venda e entrega',
    descricao: 'Por onde os pedidos entram e como chegam ao cliente.',
    etapas: [
      {
        chave: 'pedido_whatsapp',
        titulo: 'Pedido pelo WhatsApp',
        descricao: 'A página pública a gerar pedidos e o balcão a responder rápido.',
        pergunta: 'Já recebe pedidos pelo WhatsApp?',
      },
      {
        chave: 'ifood',
        titulo: 'iFood',
        descricao: 'Loja ativa no iFood. A integração de cardápio e pedidos entra na Fase 3 e exige CNPJ.',
        pergunta: 'Já está no iFood?',
        fase: 3,
      },
      {
        chave: 'noventa_nove_food',
        titulo: '99Food',
        descricao:
          'Loja ativa na 99Food. Integração por Open Delivery na Fase 3; uma loja só aceita um integrador.',
        pergunta: 'Já está na 99Food?',
        fase: 3,
      },
      {
        chave: 'outros_marketplaces',
        titulo: 'Outros marketplaces',
        descricao: 'Rappi, aiqfome ou aplicativos regionais.',
        pergunta: 'Está em mais algum aplicativo?',
      },
      {
        chave: 'entregadores',
        titulo: 'Entregadores',
        descricao: 'Entrega própria, motoboy fixo ou plataforma de entregadores.',
        pergunta: 'Como entrega hoje?',
      },
    ],
  },
  {
    chave: 'operacao',
    titulo: 'Operação e gestão',
    descricao: 'O que acontece atrás do balcão. As fases 2 e 4 do brief vivem aqui.',
    etapas: [
      {
        chave: 'pagamentos',
        titulo: 'Pagamentos',
        descricao: 'Pix com chave do negócio, maquininha, conta PJ.',
        pergunta: 'Como recebe hoje?',
      },
      {
        chave: 'cnpj',
        titulo: 'CNPJ e fiscal',
        descricao: 'CNPJ ativo (obrigatório para o iFood) e emissão de NFC-e por parceiro.',
        pergunta: 'Tem CNPJ organizado?',
      },
      {
        chave: 'estoque',
        titulo: 'Controle de estoque',
        descricao: 'Insumos com unidade, custo e mínimo; baixa automática por pedido. Fase 2.',
        pergunta: 'Controla o estoque?',
        fase: 2,
      },
      {
        chave: 'ficha_tecnica',
        titulo: 'Ficha técnica e margem',
        descricao: 'Quanto de cada insumo sai por produto; custo e margem reais. Fase 2.',
        pergunta: 'Sabe a margem de cada produto?',
        fase: 2,
      },
      {
        chave: 'analise',
        titulo: 'Análise de vendas',
        descricao: 'Vendas por canal, produto e hora; curva ABC; margem por canal. Fase 4.',
        pergunta: 'Sabe o que vende mais e o que dá mais lucro?',
        fase: 4,
      },
    ],
  },
]

export function frenteDoModelo(chave: string): FrenteModelo | undefined {
  return FRENTES.find((f) => f.chave === chave)
}

export function etapaDoModelo(frente: string, chave: string): EtapaModelo | undefined {
  return frenteDoModelo(frente)?.etapas.find((e) => e.chave === chave)
}
