/**
 * Roteiros prontos que começam no Mercado Central.
 * `paradas` são ids de PONTOS_TURISTICOS, na ordem da visita.
 */
export const ROTEIROS = Object.freeze([
  {
    id: 'centro-historico-a-pe',
    nome: 'Centro Histórico a pé',
    modo: 'a-pe',
    duracaoSugerida: 'manhã ou tarde (cerca de 3 horas com as visitas)',
    cor: '#144670',
    descricao:
      'Teatro, museus, igrejas, o Palácio dos Leões e os casarões de azulejo da Praia Grande.',
    paradas: [
      'fonte-das-pedras',
      'teatro-arthur-azevedo',
      'museu-historico',
      'igreja-do-carmo',
      'catedral-da-se',
      'palacio-dos-leoes',
      'rua-portugal',
      'casa-de-nhozinho',
      'casa-das-tulhas',
      'museu-da-gastronomia',
    ],
  },
  {
    id: 'fe-e-memoria',
    nome: 'Fé e memória',
    modo: 'a-pe',
    duracaoSugerida: 'cerca de 2 horas',
    cor: '#7a3e9d',
    descricao:
      'Igrejas centenárias, o Convento das Mercês e o Museu do Negro, terminando na Praça Gonçalves Dias.',
    paradas: [
      'igreja-do-desterro',
      'convento-das-merces',
      'cafua-das-merces',
      'igreja-do-carmo',
      'igreja-de-santo-antonio',
      'praca-goncalves-dias',
    ],
  },
  {
    id: 'por-do-sol-na-orla',
    nome: 'Pôr do sol na orla',
    modo: 'carro',
    duracaoSugerida: 'final da tarde, de carro, táxi ou ônibus',
    cor: '#1a6fa3',
    descricao: 'Atravesse a ponte, visite o forte e veja o sol se pôr no Espigão Costeiro.',
    paradas: [
      'ponte-jose-sarney',
      'forte-santo-antonio',
      'espigao-costeiro',
      'praia-ponta-dareia',
      'lagoa-da-jansen',
    ],
  },
]);
