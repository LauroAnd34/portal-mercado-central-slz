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
// versões leves (WebP) em vários tamanhos, criadas por `npm run otimizar-imagens`
const urlsLeves = import.meta.glob('../imagens/fotos/*-{480,960,1600}.webp', {
  query: '?url',
  import: 'default',
  eager: true,
});

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
    lugar: 'Cesto de camarão seco no Mercado Central',
    origem: 'Mercado Central',
    autor: 'MPMrocha',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Cesto_de_camar%C3%B5es.jpg',
    largura: 1100,
    altura: 825,
  },
  'mercado-garrafas': {
    arquivo: 'mercado-garrafas.jpg',
    lugar: 'Garrafas de aguardente com caranguejo no Mercado Central',
    origem: 'Mercado Central',
    autor: 'MPMrocha',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Garrafa_de_aguardente_com_caranguejo.jpg',
    largura: 1100,
    altura: 825,
  },
  'mercado-cidade-temperos': {
    arquivo: 'mercado-cidade-temperos.jpg',
    lugar: 'Pacotes de temperos empilhados no Mercado da Cidade',
    origem: 'Mercado da Cidade',
    autor: 'Equipe do projeto Portal do Mercado Central',
    licenca: 'acervo do projeto',
    largura: 1600,
    altura: 1067,
  },
  'mercado-cidade-garrafas': {
    arquivo: 'mercado-cidade-garrafas.jpg',
    lugar: 'Garrafas de licor e molhos numa banca do Mercado da Cidade',
    origem: 'Mercado da Cidade',
    autor: 'Equipe do projeto Portal do Mercado Central',
    licenca: 'acervo do projeto',
    largura: 1100,
    altura: 1650,
  },
  'mercado-cidade-farinha': {
    arquivo: 'mercado-cidade-farinha.jpg',
    lugar: 'Sacos de farinha e grãos numa banca do Mercado da Cidade',
    origem: 'Mercado da Cidade',
    autor: 'Equipe do projeto Portal do Mercado Central',
    licenca: 'acervo do projeto',
    largura: 1100,
    altura: 1650,
  },
  'mercado-cidade-ervas': {
    arquivo: 'mercado-cidade-ervas.jpg',
    lugar: 'Saquinhos de ervas pendurados numa banca do Mercado da Cidade',
    origem: 'Mercado da Cidade',
    autor: 'Equipe do projeto Portal do Mercado Central',
    licenca: 'acervo do projeto',
    largura: 1600,
    altura: 1067,
  },
  'mercado-central-frutaria': {
    arquivo: 'mercado-central-frutaria.jpg',
    lugar: 'Frutaria no Mercado Central (2023)',
    origem: 'Mercado Central',
    autor: 'Equipe do projeto Portal do Mercado Central',
    licenca: 'levantamento fotográfico do projeto',
    largura: 1600,
    altura: 804,
  },
  'mercado-central-bancas-frutas': {
    arquivo: 'mercado-central-bancas-frutas.jpg',
    lugar: 'Bancas de frutas no Mercado Central (2023)',
    origem: 'Mercado Central',
    autor: 'Equipe do projeto Portal do Mercado Central',
    licenca: 'levantamento fotográfico do projeto',
    largura: 1600,
    altura: 804,
  },
  'mercado-central-ervas': {
    arquivo: 'mercado-central-ervas.jpg',
    lugar: 'Banca de ervas e garrafadas no Mercado Central (2023)',
    origem: 'Mercado Central',
    autor: 'Equipe do projeto Portal do Mercado Central',
    licenca: 'levantamento fotográfico do projeto',
    largura: 1600,
    altura: 804,
  },
  'sabor-jucara-cachos': {
    arquivo: 'sabor-jucara-cachos.jpg',
    lugar: 'Cachos de juçara (açaí) recém-colhidos, no Amazonas',
    origem: 'Amazonas',
    autor: 'Jéssica Karoline Alves Portugal',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Fruto_do_a%C3%A7a%C3%AD.jpg',
    largura: 1100,
    altura: 1467,
  },
  'sabor-jucara-tigela': {
    arquivo: 'sabor-jucara-tigela.jpg',
    lugar: 'Juçara (açaí) grossa servida na tigela',
    autor: 'Gervásio Baptista/Agência Brasil',
    licenca: 'CC BY 3.0 BR',
    fonte: 'https://commons.wikimedia.org/wiki/File:A%C3%A7a%C3%AD.jpg',
    largura: 1311,
    altura: 813,
  },
  'sabor-camarao-raposa': {
    arquivo: 'sabor-camarao-raposa.jpg',
    lugar: 'Camarão secando ao sol na Raposa, ilha de São Luís',
    origem: 'Raposa, ilha de São Luís',
    autor: 'João Maria Bezerra',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:O_camar%C3%A3o_seco_da_Raposa_(MA).jpg',
    largura: 1100,
    altura: 733,
  },
  'sabor-arroz-de-cuxa': {
    arquivo: 'sabor-arroz-de-cuxa.jpg',
    lugar: 'Arroz de cuxá servido na panela, em Alcântara (MA)',
    origem: 'Alcântara, MA',
    autor: 'Ciriice',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Arroz_de_cux%C3%A1.jpg',
    largura: 1100,
    altura: 825,
  },
  'sabor-cuxa': {
    arquivo: 'sabor-cuxa.jpg',
    lugar: 'Cuxá no prato',
    autor: 'Porto Neto',
    licenca: 'CC BY-SA 4.0',
    fonte: 'https://commons.wikimedia.org/wiki/File:Cux%C3%A1_(tentativa).jpg',
    largura: 1100,
    altura: 825,
  },
  'sabor-farinha': {
    arquivo: 'sabor-farinha.jpg',
    lugar: 'Farinha de mandioca vendida a granel, numa feira de Jacobina (BA)',
    origem: 'Jacobina, BA',
    autor: 'Henry194507',
    licenca: 'CC BY-SA 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:IMG0529_Farinha_de_Mandioca_comercializada_na_Feira_Livre,_Jacobina_-_Bahia.jpg',
    largura: 1100,
    altura: 1467,
  },
  'sabor-bombom-bacuri': {
    arquivo: 'sabor-bombom-bacuri.jpg',
    lugar: 'Bombons de bacuri, doce típico do Norte e do Maranhão',
    autor: 'Sintegrity',
    licenca: 'CC BY-SA 4.0',
    fonte:
      'https://commons.wikimedia.org/wiki/File:Bombom_de_bacuri,_doce_do_norte_do_Brasil_01.jpg',
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
  'inventario-002-003': {
    arquivo: 'inventario-002-003.jpg',
    lugar: 'Laçarias amarelas e verdes com flor azul',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 708,
    altura: 708,
  },
  'inventario-035-018': {
    arquivo: 'inventario-035-018.jpg',
    lugar: 'Losango azul com flores',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 411,
    altura: 411,
  },
  'inventario-035-020': {
    arquivo: 'inventario-035-020.jpg',
    lugar: 'Estrela verde em moldura vermelha',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 518,
    altura: 518,
  },
  'inventario-035-022': {
    arquivo: 'inventario-035-022.jpg',
    lugar: 'Cruzes e estrelas em amarelo e preto',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 406,
    altura: 406,
  },
  'inventario-035-024': {
    arquivo: 'inventario-035-024.jpg',
    lugar: 'Flores azuis nos quatro cantos',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 411,
    altura: 411,
  },
  'inventario-035-026': {
    arquivo: 'inventario-035-026.jpg',
    lugar: 'Moldura amarela com folhas verdes',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 405,
    altura: 405,
  },
  'inventario-035-028': {
    arquivo: 'inventario-035-028.jpg',
    lugar: 'Folhas azuis em diagonal',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 409,
    altura: 409,
  },
  'inventario-036-033': {
    arquivo: 'inventario-036-033.jpg',
    lugar: 'Flor em relevo, estilo art nouveau',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 525,
    altura: 525,
  },
  'inventario-036-035': {
    arquivo: 'inventario-036-035.jpg',
    lugar: 'Rosa com moldura verde',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 512,
    altura: 512,
  },
  'inventario-036-037': {
    arquivo: 'inventario-036-037.jpg',
    lugar: 'Padrão tapete em vermelho e verde',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 525,
    altura: 525,
  },
  'inventario-038-059': {
    arquivo: 'inventario-038-059.jpg',
    lugar: 'Ramos de flores azuis',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 434,
    altura: 434,
  },
  'inventario-039-070': {
    arquivo: 'inventario-039-070.jpg',
    lugar: 'Folha branca em fundo azul',
    autor: 'Inventário do Patrimônio Azulejar do Maranhão (Santa Marta, 2012)',
    licenca: 'reprodução do livro',
    largura: 321,
    altura: 321,
  },
});

/** Endereço (URL) final da foto, já processado pelo Vite. */
export const urlDaFoto = (chave) => (FOTOS[chave] ? url(FOTOS[chave].arquivo) : null);

/** "foto-480.webp 480w, foto-960.webp 960w, …" — o navegador escolhe o tamanho certo. */
export function srcsetDaFoto(chave) {
  const foto = FOTOS[chave];
  if (!foto) return '';
  const base = foto.arquivo.replace(/\.jpg$/, '');
  return [480, 960, 1600]
    .map((l) => [urlsLeves[`../imagens/fotos/${base}-${l}.webp`], l])
    .filter(([u]) => u)
    .map(([u, l]) => `${u} ${Math.min(l, foto.largura)}w`)
    .join(', ');
}

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
  'inventario-002-003',
  'inventario-035-018',
  'inventario-035-020',
  'inventario-035-022',
  'inventario-035-024',
  'inventario-035-026',
  'inventario-035-028',
  'inventario-036-033',
  'inventario-036-035',
  'inventario-036-037',
  'inventario-038-059',
  'inventario-039-070',
]);
