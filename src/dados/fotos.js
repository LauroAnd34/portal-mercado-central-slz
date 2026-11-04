/**
 * Fotos do Wikimedia Commons (licenças livres) usadas no site, com créditos.
 * Para trocar uma foto: substitua o arquivo em src/imagens/fotos/ e atualize
 * o autor/licença aqui. Os créditos aparecem no rodapé de todas as páginas.
 */

const urls = import.meta.glob('../imagens/fotos/*.jpg', {
  query: '?url',
  import: 'default',
  eager: true,
});
const url = (arquivo) => urls[`../imagens/fotos/${arquivo}`];

export const FOTOS = Object.freeze({
  'rua-portugal-azulejos': {
    arquivo: 'rua-portugal-azulejos.jpg',
    lugar: 'Casarão de azulejos na Rua Portugal',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Rua_Portugal_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-6049.jpg',
    largura: 1600,
    altura: 1067,
  },
  'rua-portugal': {
    arquivo: 'rua-portugal.jpg',
    lugar: 'Rua Portugal ao entardecer',
    autor: 'Mariza Bezerra',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Rua_Portugal_iluminada.jpg',
    largura: 900,
    altura: 1200,
  },
  'praia-grande-casarios': {
    arquivo: 'praia-grande-casarios.jpg',
    lugar: 'Casarões da Praia Grande',
    autor: 'MTur Destinos',
    licenca: 'Public domain',
    fonte:
      'https://commons.wikimedia.org/wiki/File:DouglasJunior_Rua_do_Portugal_S%C3%A3o_Luis_MA_(39970774855).jpg',
    largura: 1600,
    altura: 1067,
  },
  'mercado-camarao-seco': {
    arquivo: 'mercado-camarao-seco.jpg',
    lugar: 'Cesto de camarão seco',
    autor: 'MPMrocha',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Cesto_de_camar%C3%B5es.jpg',
    largura: 1100,
    altura: 825,
  },
  'mercado-garrafas': {
    arquivo: 'mercado-garrafas.jpg',
    lugar: 'Garrafas de aguardente com caranguejo',
    autor: 'MPMrocha',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Garrafa_de_aguardente_com_caranguejo.jpg',
    largura: 1100,
    altura: 825,
  },
  'palacio-dos-leoes': {
    arquivo: 'palacio-dos-leoes.jpg',
    lugar: 'Palácio dos Leões visto da baía',
    autor: 'Ridiculopathy',
    licenca: 'CC0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Mar2024._S%C3%A3o_Lu%C3%ADs,_Maranh%C3%A3o._Pal%C3%A1cio_dos_Le%C3%B5es_01.jpg',
    largura: 900,
    altura: 506,
  },
  'por-do-sol-baia': {
    arquivo: 'por-do-sol-baia.jpg',
    lugar: 'Pôr do sol na Baía de São Marcos',
    autor: 'Gerda Arendt',
    licenca: 'CC0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:S%C3%A3o_Lu%C3%ADs,_Pal%C3%A1cio_dos_Le%C3%B5es,_sunset.jpg',
    largura: 900,
    altura: 675,
  },
  'teatro-arthur-azevedo': {
    arquivo: 'teatro-arthur-azevedo.jpg',
    lugar: 'Teatro Arthur Azevedo',
    autor: 'Gerda Arendt',
    licenca: 'CC0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Teatro_Artur_Azevedo,_S%C3%A3o_Lu%C3%ADs,_facade.jpg',
    largura: 900,
    altura: 675,
  },
  'catedral-da-se': {
    arquivo: 'catedral-da-se.jpg',
    lugar: 'Catedral da Sé',
    autor: 'MTur Destinos',
    licenca: 'Public domain',
    fonte:
      'https://commons.wikimedia.org/wiki/File:DouglasJunior_Catedral_da_S%C3%A9_S%C3%A3o_Luis_MA_(26994421228).jpg',
    largura: 900,
    altura: 600,
  },
  'fonte-do-ribeirao': {
    arquivo: 'fonte-do-ribeirao.jpg',
    lugar: 'Fonte do Ribeirão',
    autor: 'Ridiculopathy',
    licenca: 'CC0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Ribeir%C3%A3o_Fountain_aka_Fonte_do_Ribeir%C3%A3o,_S%C3%A3o_Lu%C3%ADs,_Maranh%C3%A3o_01.jpg',
    largura: 900,
    altura: 506,
  },
  'casa-das-tulhas': {
    arquivo: 'casa-das-tulhas.jpg',
    lugar: 'Casa das Tulhas',
    autor: 'MTur Destinos',
    licenca: 'Public domain',
    fonte:
      'https://commons.wikimedia.org/wiki/File:DouglasJunior_Casa_das_Tulhas_S%C3%A3o_Lu%C3%ADs_MA_(41569924332).jpg',
    largura: 900,
    altura: 600,
  },
  'lagoa-da-jansen': {
    arquivo: 'lagoa-da-jansen.jpg',
    lugar: 'Lagoa da Jansen',
    autor: 'MTur Destinos',
    licenca: 'Public domain',
    fonte:
      'https://commons.wikimedia.org/wiki/File:DouglasJunior_lagoa_da_Jansen_S%C3%A3o_Luis_MA_(26994358828).jpg',
    largura: 900,
    altura: 600,
  },
  'espigao-costeiro': {
    arquivo: 'espigao-costeiro.jpg',
    lugar: 'Espigão Costeiro e Ponta d’Areia',
    autor: 'Gabriel Asker',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Espigao_Costeiro_-_Praia_Ponta_D%27Areia.jpg',
    largura: 900,
    altura: 506,
  },
  'praia-do-calhau': {
    arquivo: 'praia-do-calhau.jpg',
    lugar: 'Praia do Calhau',
    autor: 'MTur Destinos',
    licenca: 'Public domain',
    fonte:
      'https://commons.wikimedia.org/wiki/File:DouglasJunior_Praia_do_Calhau_S%C3%A3o_Luis_MA_(25992414547).jpg',
    largura: 900,
    altura: 600,
  },
  'igreja-do-desterro': {
    arquivo: 'igreja-do-desterro.jpg',
    lugar: 'Largo do Desterro',
    autor: 'Ciriice',
    licenca: 'CC BY-SA 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Igreja_de_S%C3%A3o_Jos%C3%A9_do_Desterro_03.jpg',
    largura: 900,
    altura: 675,
  },
  'sao-jose-de-ribamar': {
    arquivo: 'sao-jose-de-ribamar.jpg',
    lugar: 'Fitas de promessa em São José de Ribamar',
    autor: 'Ajmcbarreto',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:S%C3%A3o_Jos%C3%A9_de_Ribamar_-_17.jpg',
    largura: 900,
    altura: 675,
  },
  'convento-das-merces': {
    arquivo: 'convento-das-merces.jpg',
    lugar: 'Convento das Mercês',
    autor: 'Artur Oliveira Silva',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Convento_das_Merc%C3%AAs.jpg',
    largura: 900,
    altura: 600,
  },
  'ponte-jose-sarney': {
    arquivo: 'ponte-jose-sarney.jpg',
    lugar: 'Ponte José Sarney ao entardecer',
    autor: 'FlavioUzumaki',
    licenca: 'CC BY-SA 3.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Ponte_do_S%C3%A3o_Francisco_(Governador_Jos%C3%A9_Sarney)_(S%C3%A3o_Lu%C3%ADs).jpg',
    largura: 900,
    altura: 596,
  },
  'casa-de-nhozinho': {
    arquivo: 'casa-de-nhozinho.jpg',
    lugar: 'Casa de Nhozinho',
    autor: 'Mariahaversa',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Casa_de_Nhozinho.jpg',
    largura: 900,
    altura: 1200,
  },
  'azulejo-azul-couto-fernandes': {
    arquivo: 'azulejo-azul-couto-fernandes.jpg',
    lugar: 'Azulejos azuis na Travessa Couto Fernandes',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Travessa_Couto_Fernandes_60_Centro_S%C3%A3o_Lu%C3%ADs_2025-6016_(pcorr,_crop).jpg',
    largura: 1200,
    altura: 1199,
  },
  'azulejo-rua-nazare-08': {
    arquivo: 'azulejo-rua-nazare-08.jpg',
    lugar: 'Azulejos azuis e laranja na Rua de Nazaré',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Rua_Nazar%C3%A9_08_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-5997.jpg',
    largura: 1200,
    altura: 800,
  },
  'azulejo-policromo-centro': {
    arquivo: 'azulejo-policromo-centro.jpg',
    lugar: 'Azulejos amarelos, azuis e verdes no Centro Histórico',
    autor: 'Thuaia',
    licenca: 'CC BY-SA 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Azulejos_no_Centro_Hist%C3%B3rico_de_S%C3%A3o_Lu%C3%ADs.jpg',
    largura: 675,
    altura: 1200,
  },
  'azulejo-verde-rua-do-egito': {
    arquivo: 'azulejo-verde-rua-do-egito.jpg',
    lugar: 'Azulejos verdes na Rua do Egito',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Rua_do_Egito_37_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-5420.jpg',
    largura: 1200,
    altura: 900,
  },
  'azulejo-igreja-do-rosario': {
    arquivo: 'azulejo-igreja-do-rosario.jpg',
    lugar: 'Painel de azulejos na Igreja de Nossa Senhora do Rosário',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Igreja_de_Nossa_Senhora_do_Ros%C3%A1rio_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-5531.jpg',
    largura: 1200,
    altura: 900,
  },
  'azulejo-estrelas-dom-pedro-ii': {
    arquivo: 'azulejo-estrelas-dom-pedro-ii.jpg',
    lugar: 'Azulejos de estrelas na Avenida Dom Pedro II',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Avenida_Dom_Pedro_II_02_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-5947.jpg',
    largura: 800,
    altura: 1200,
  },
  'azulejo-rua-nazare-82': {
    arquivo: 'azulejo-rua-nazare-82.jpg',
    lugar: 'Azulejos com rosas na Rua de Nazaré',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Rua_Nazar%C3%A9_82_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-5975.jpg',
    largura: 1200,
    altura: 800,
  },
  'azulejo-rua-nazare-328': {
    arquivo: 'azulejo-rua-nazare-328.jpg',
    lugar: 'Azulejos de padrão grande na Rua de Nazaré',
    autor: 'Prburley',
    licenca: 'CC BY 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Rua_de_Nazar%C3%A9_328_S%C3%A3o_Lu%C3%ADs_Maranh%C3%A3o_2025-5782.jpg',
    largura: 1200,
    altura: 800,
  },
});

/** Endereço (URL) final da foto, já processado pelo Vite. */
export const urlDaFoto = (chave) => (FOTOS[chave] ? url(FOTOS[chave].arquivo) : null);

/** Foto de cada ponto turístico do mapa (id do ponto → chave da foto). */
export const FOTO_DO_PONTO = Object.freeze({
  'rua-portugal': 'rua-portugal',
  'palacio-dos-leoes': 'palacio-dos-leoes',
  'teatro-arthur-azevedo': 'teatro-arthur-azevedo',
  'catedral-da-se': 'catedral-da-se',
  'fonte-do-ribeirao': 'fonte-do-ribeirao',
  'casa-das-tulhas': 'casa-das-tulhas',
  'lagoa-da-jansen': 'lagoa-da-jansen',
  'espigao-costeiro': 'espigao-costeiro',
  'praia-do-calhau': 'praia-do-calhau',
  'igreja-do-desterro': 'igreja-do-desterro',
  'sao-jose-de-ribamar': 'sao-jose-de-ribamar',
  'convento-das-merces': 'convento-das-merces',
  'ponte-jose-sarney': 'ponte-jose-sarney',
  'casa-de-nhozinho': 'casa-de-nhozinho',
  'praia-ponta-dareia': 'espigao-costeiro',
});

/** Fotos da galeria "A cidade dos azulejos" (página inicial), na ordem de exibição. */
export const GALERIA_AZULEJOS = Object.freeze([
  'azulejo-azul-couto-fernandes',
  'azulejo-rua-nazare-08',
  'azulejo-policromo-centro',
  'azulejo-verde-rua-do-egito',
  'azulejo-igreja-do-rosario',
  'azulejo-estrelas-dom-pedro-ii',
  'azulejo-rua-nazare-82',
  'azulejo-rua-nazare-328',
]);
