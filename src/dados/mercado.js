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
  },
  {
    nome: 'Camarão seco',
    icone: 'camarao',
    texto: 'Base de muitos pratos e presença garantida no arroz de cuxá.',
  },
  {
    nome: 'Cuxá',
    icone: 'folha',
    texto: 'Molho de vinagreira, gergelim e camarão seco — símbolo da cozinha maranhense.',
  },
  {
    nome: 'Farinha d’água',
    icone: 'grao',
    texto: 'Grão grosso e sabor levemente ácido; acompanha peixes, caldos e a juçara.',
  },
  {
    nome: 'Doces e licores',
    icone: 'garrafa',
    texto: 'De bacuri, cupuaçu, buriti, murici e outras frutas da região.',
  },
  {
    nome: 'Ervas da terra',
    icone: 'ramo',
    texto: 'Para chás e temperos; os vendedores explicam o uso de cada folha.',
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
