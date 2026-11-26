/**
 * Informações do Mercado para a página inicial.
 * Setores e sabores do Mercado, para a página inicial.
 */
export const SETORES = Object.freeze([
  {
    nome: 'Peixes e mariscos',
    texto: 'Peixe fresco, camarão, caranguejo e sururu, conforme a maré e a época do ano.',
  },
  { nome: 'Carnes', texto: 'Açougues com cortes bovinos, suínos, frango e carne de sol.' },
  {
    nome: 'Frutas e verduras',
    texto:
      'Bacuri, cupuaçu, buriti, murici, juçara, vinagreira, cheiro-verde e hortaliças da ilha e do interior.',
  },
  {
    nome: 'Farinhas e grãos',
    texto: 'Farinha d’água, farinha seca, tapioca, arroz, feijão e camarão seco.',
  },
  {
    nome: 'Ervas e garrafadas',
    texto: 'Folhas, raízes e cascas da medicina popular, com quem conhece cada uma delas.',
  },
  {
    nome: 'Artesanato e utilidades',
    texto: 'Cofos, cestos, peças de barro, redes, panelas e objetos do dia a dia.',
  },
]);

export const SABORES = Object.freeze([
  {
    nome: 'Juçara',
    icone: 'cuia',
    texto: 'Servida grossa, com farinha d’água e, para muitos, com camarão seco ou peixe frito.',
    fotos: [
      {
        chave: 'mercado-banca-jucara',
        alt: 'Banca do Mercado Central com a placa “Vende-se juçara”.',
      },
      {
        chave: 'mercado-cidade-frutas',
        alt: 'Banca de frutas com bananas, abacaxis e bandeirinhas de São João, no Mercado da Cidade.',
      },
    ],
  },
  {
    nome: 'Camarão seco',
    icone: 'camarao',
    texto: 'Base de muitos pratos e presença garantida no arroz de cuxá.',
    fotos: [
      {
        chave: 'mercado-camarao-seco',
        alt: 'Cesto de palha cheio de camarão seco, no Mercado Central.',
      },
      {
        chave: 'mercado-banca-jucara',
        alt: 'Banca do Mercado Central com sacos de camarão seco e farinha.',
      },
    ],
  },
  {
    nome: 'Cuxá',
    icone: 'folha',
    texto: 'Molho de vinagreira, gergelim e camarão seco. É um símbolo da cozinha maranhense.',
    fotos: [
      {
        chave: 'sabor-vinagreira',
        alt: 'Folha de vinagreira, a base do cuxá, num prato de borda azul.',
      },
      {
        chave: 'mercado-cidade-temperos',
        alt: 'Pacotes de gergelim, temperos e ervas empilhados numa banca do Mercado da Cidade.',
      },
    ],
  },
  {
    nome: 'Farinha d’água',
    icone: 'grao',
    texto: 'Grão grosso e sabor levemente ácido; acompanha peixes, caldos e a juçara.',
    fotos: [
      {
        chave: 'mercado-cidade-farinha',
        alt: 'Sacos de farinha e grãos no balcão de uma banca do Mercado da Cidade.',
      },
      {
        chave: 'mercado-cidade-farinha-banca',
        alt: 'Banca do Mercado da Cidade com farinhas, grãos e garrafas.',
      },
    ],
  },
  {
    nome: 'Doces e licores',
    icone: 'garrafa',
    texto: 'De bacuri, cupuaçu, buriti, murici e outras frutas da região.',
    fotos: [
      {
        chave: 'mercado-garrafas',
        alt: 'Garrafas de aguardente com caranguejo penduradas numa banca do Mercado Central.',
      },
      {
        chave: 'mercado-cidade-garrafas',
        alt: 'Garrafas de licor e molhos numa banca do Mercado da Cidade.',
      },
    ],
  },
  {
    nome: 'Ervas da terra',
    icone: 'ramo',
    texto: 'Para chás e temperos; os vendedores explicam o uso de cada folha.',
    fotos: [
      {
        chave: 'mercado-cidade-ervas',
        alt: 'Saquinhos de ervas secas pendurados numa banca do Mercado da Cidade.',
      },
      {
        chave: 'mercado-cidade-temperos',
        alt: 'Pacotes de temperos e ervas empilhados numa banca do Mercado da Cidade.',
      },
    ],
  },
]);

/**
 * Guia rápido "Onde encontro?": produtos e o setor em que ficam.
 * Para incluir um produto, acrescente-o à lista do setor.
 */
export const PRODUTOS_POR_SETOR = Object.freeze({
  'Peixes e mariscos': [
    'peixe',
    'pescada',
    'camarão fresco',
    'caranguejo',
    'sururu',
    'siri',
    'ostra',
    'tainha',
  ],
  Carnes: ['carne bovina', 'carne de porco', 'frango', 'carne de sol', 'linguiça', 'bucho'],
  'Frutas e verduras': [
    'bacuri',
    'cupuaçu',
    'buriti',
    'murici',
    'juçara',
    'açaí',
    'vinagreira',
    'cheiro-verde',
    'maxixe',
    'quiabo',
    'jambu',
    'pimenta',
  ],
  'Farinhas e grãos': [
    'farinha d’água',
    'farinha seca',
    'tapioca',
    'goma',
    'arroz',
    'feijão',
    'camarão seco',
    'gergelim',
  ],
  'Ervas e garrafadas': [
    'ervas medicinais',
    'garrafada',
    'boldo',
    'capim-santo',
    'erva-cidreira',
    'raízes',
    'cascas',
    'tiquira',
  ],
  'Artesanato e utilidades': [
    'cofo',
    'cesto',
    'peça de barro',
    'rede',
    'panela',
    'abano',
    'vassoura',
  ],
});
