/**
 * Pontos turísticos da Ilha de São Luís.
 * Coordenadas conferidas no OpenStreetMap (Nominatim) em novembro de 2026.
 * Descrições curtas, escritas para o portal.
 *
 * Para adicionar um ponto: copie um objeto, mude o `id` (único, sem acentos),
 * escolha uma `categoria` existente em CATEGORIAS e informe [latitude, longitude].
 */

/** O centro do mapa: todos os caminhos partem daqui. */
export const MERCADO_CENTRAL = Object.freeze({
  id: 'mercado-central',
  nome: 'Mercado Central de São Luís',
  categoria: 'mercado',
  coordenadas: [-2.5344761, -44.3011069],
  endereco: 'Rua de São João, Centro',
  descricao:
    'Ponto de partida de todos os roteiros. Mercado público inaugurado em sua forma atual em 1941, em estilo Art Déco, com boxes de peixes, carnes, frutas, farinhas, ervas e artesanato.',
});

export const CATEGORIAS = Object.freeze({
  'centro-historico': { nome: 'Centro Histórico', cor: '#144670', simbolo: 'casarao' },
  fe: { nome: 'Igrejas e fé', cor: '#7a3e9d', simbolo: 'igreja' },
  cultura: { nome: 'Museus e cultura', cor: '#c32146', simbolo: 'museu' },
  praias: { nome: 'Praias e orla', cor: '#1a6fa3', simbolo: 'onda' },
  natureza: { nome: 'Natureza e mirantes', cor: '#2f6b3a', simbolo: 'folha' },
  ilha: { nome: 'Outros municípios da ilha', cor: '#8a5a00', simbolo: 'barco' },
});

export const PONTOS_TURISTICOS = Object.freeze([
  {
    id: 'mercado-da-cidade',
    nome: 'Mercado da Cidade (feirantes do Mercado Central)',
    categoria: 'centro-historico',
    coordenadas: [-2.5444427, -44.2984244],
    endereco: 'Avenida Senador Vitorino Freire, Aterro do Bacanga',
    descricao:
      'Desde novembro de 2025, os feirantes do Mercado Central atendem aqui, em quatro galpões, enquanto o prédio histórico é reconstruído. Localização aproximada.',
  },
  {
    id: 'casa-das-tulhas',
    nome: 'Casa das Tulhas (Feira da Praia Grande)',
    categoria: 'centro-historico',
    coordenadas: [-2.5293126, -44.3056557],
    endereco: 'Rua da Estrela, Praia Grande',
    descricao:
      'Antigo entreposto comercial, hoje feira de produtos típicos: camarão seco, farinhas, doces, licores e a tiquira.',
  },
  {
    id: 'rua-portugal',
    nome: 'Rua Portugal',
    categoria: 'centro-historico',
    coordenadas: [-2.5292023, -44.3066431],
    endereco: 'Praia Grande',
    descricao:
      'Um dos cartões-postais da cidade, com casarões revestidos de azulejos portugueses e ladeira de pedra.',
  },
  {
    id: 'palacio-dos-leoes',
    nome: 'Palácio dos Leões',
    categoria: 'centro-historico',
    coordenadas: [-2.5269686, -44.3065129],
    endereco: 'Avenida Dom Pedro II',
    descricao:
      'Sede do Governo do Estado, erguida no local do antigo forte francês que deu origem à cidade. Vista para a Baía de São Marcos.',
  },
  {
    id: 'fonte-do-ribeirao',
    nome: 'Fonte do Ribeirão',
    categoria: 'centro-historico',
    coordenadas: [-2.5279577, -44.3020009],
    endereco: 'Rua do Ribeirão',
    descricao:
      'Fonte colonial com carrancas de pedra, cercada de lendas sobre galerias subterrâneas sob o Centro.',
  },
  {
    id: 'fonte-das-pedras',
    nome: 'Fonte das Pedras',
    categoria: 'centro-historico',
    coordenadas: [-2.5330527, -44.3000927],
    endereco: 'Rua de São João',
    descricao:
      'Fonte histórica vizinha ao Mercado Central, ligada ao abastecimento de água da cidade colonial.',
  },
  {
    id: 'praca-goncalves-dias',
    nome: 'Praça Gonçalves Dias',
    categoria: 'centro-historico',
    coordenadas: [-2.5238845, -44.2961799],
    endereco: 'Rua dos Remédios',
    descricao:
      'Praça com a estátua do poeta maranhense e mirante para o Rio Anil, ao lado da Igreja dos Remédios.',
  },
  {
    id: 'catedral-da-se',
    nome: 'Catedral da Sé',
    categoria: 'fe',
    coordenadas: [-2.5280762, -44.3043194],
    endereco: 'Avenida Dom Pedro II',
    descricao:
      'Catedral de Nossa Senhora da Vitória, com retábulo dourado e fachada voltada para a Praça Pedro II.',
  },
  {
    id: 'igreja-do-carmo',
    nome: 'Igreja do Carmo',
    categoria: 'fe',
    coordenadas: [-2.5297577, -44.3029727],
    endereco: 'Praça João Lisboa',
    descricao:
      'Convento e igreja de Nossa Senhora do Carmo, um dos templos mais antigos da cidade.',
  },
  {
    id: 'igreja-do-desterro',
    nome: 'Igreja do Desterro',
    categoria: 'fe',
    coordenadas: [-2.5355763, -44.3042714],
    endereco: 'Rua da Palma, Desterro',
    descricao:
      'Igreja de São José do Desterro, com arquitetura de inspiração bizantina, no bairro mais antigo da cidade.',
  },
  {
    id: 'igreja-de-santo-antonio',
    nome: 'Igreja de Santo Antônio',
    categoria: 'fe',
    coordenadas: [-2.5268896, -44.2992406],
    endereco: 'Largo de Santo Antônio',
    descricao: 'Igreja e antigo convento franciscano, junto ao Seminário de Santo Antônio.',
  },
  {
    id: 'teatro-arthur-azevedo',
    nome: 'Teatro Arthur Azevedo',
    categoria: 'cultura',
    coordenadas: [-2.5290502, -44.3024774],
    endereco: 'Rua do Sol',
    descricao:
      'Um dos teatros mais antigos do Brasil em funcionamento, com plateia em forma de ferradura.',
  },
  {
    id: 'museu-historico',
    nome: 'Museu Histórico e Artístico do Maranhão',
    categoria: 'cultura',
    coordenadas: [-2.5291247, -44.3006894],
    endereco: 'Rua do Sol',
    descricao:
      'Solar do século XIX que reproduz ambientes de época e guarda acervo de arte e mobiliário.',
  },
  {
    id: 'convento-das-merces',
    nome: 'Convento das Mercês',
    categoria: 'cultura',
    coordenadas: [-2.5336381, -44.3047446],
    endereco: 'Rua da Palma',
    descricao:
      'Conjunto do século XVII onde pregou o Padre Antônio Vieira; hoje é espaço de memória e cultura.',
  },
  {
    id: 'cafua-das-merces',
    nome: 'Cafuá das Mercês (Museu do Negro)',
    categoria: 'cultura',
    coordenadas: [-2.5330594, -44.3052401],
    endereco: 'Rua Jacinto Maia',
    descricao: 'Museu dedicado à memória e à resistência da população negra no Maranhão.',
  },
  {
    id: 'museu-da-gastronomia',
    nome: 'Museu da Gastronomia Maranhense',
    categoria: 'cultura',
    coordenadas: [-2.528539, -44.3056151],
    endereco: 'Rua da Estrela, 82',
    descricao:
      'Conta a história dos ingredientes e pratos típicos — ótimo complemento à visita ao Mercado.',
  },
  {
    id: 'casa-de-nhozinho',
    nome: 'Casa de Nhozinho',
    categoria: 'cultura',
    coordenadas: [-2.5291381, -44.3067119],
    endereco: 'Rua Portugal, 185',
    descricao:
      'Museu de cultura popular com brinquedos de buriti, artesanato e objetos do cotidiano maranhense.',
  },
  {
    id: 'ponte-jose-sarney',
    nome: 'Ponte José Sarney',
    categoria: 'natureza',
    coordenadas: [-2.5210343, -44.3035233],
    endereco: 'Rio Anil',
    descricao:
      'Liga o Centro ao São Francisco; de lá se vê o casario do Centro Histórico às margens do Anil.',
  },
  {
    id: 'forte-santo-antonio',
    nome: 'Forte de Santo Antônio da Barra',
    categoria: 'centro-historico',
    coordenadas: [-2.5053577, -44.3178109],
    endereco: 'Ponta d’Areia',
    descricao: 'Fortificação colonial na entrada da baía, ao lado do Espigão Costeiro.',
  },
  {
    id: 'espigao-costeiro',
    nome: 'Espigão Costeiro',
    categoria: 'natureza',
    coordenadas: [-2.5011804, -44.3217742],
    endereco: 'Ponta d’Areia',
    descricao:
      'Píer avançando sobre o mar, com ciclovia e um dos pores do sol mais bonitos da ilha.',
  },
  {
    id: 'lagoa-da-jansen',
    nome: 'Lagoa da Jansen',
    categoria: 'natureza',
    coordenadas: [-2.4989259, -44.3009553],
    endereco: 'Ponta d’Areia / São Francisco',
    descricao: 'Parque com pista de caminhada, bares e restaurantes à beira da lagoa.',
  },
  {
    id: 'praia-ponta-dareia',
    nome: 'Praia da Ponta d’Areia',
    categoria: 'praias',
    coordenadas: [-2.4967497, -44.3074688],
    endereco: 'Ponta d’Areia',
    descricao: 'A praia mais próxima do Centro, com calçadão e barracas.',
  },
  {
    id: 'praia-sao-marcos',
    nome: 'Praia de São Marcos',
    categoria: 'praias',
    coordenadas: [-2.487992, -44.2801847],
    endereco: 'São Marcos',
    descricao: 'Praia urbana procurada para esportes de vento e caminhadas na maré baixa.',
  },
  {
    id: 'praia-do-calhau',
    nome: 'Praia do Calhau',
    categoria: 'praias',
    coordenadas: [-2.483011, -44.2539543],
    endereco: 'Avenida Litorânea',
    descricao: 'Faixa larga de areia ao longo da Avenida Litorânea, com quiosques e ciclovia.',
  },
  {
    id: 'praia-olho-dagua',
    nome: 'Praia do Olho d’Água',
    categoria: 'praias',
    coordenadas: [-2.4787884, -44.2274717],
    endereco: 'Olho d’Água',
    descricao: 'Praia extensa e tranquila, com dunas e falésias baixas.',
  },
  {
    id: 'praia-aracagi',
    nome: 'Praia do Araçagi',
    categoria: 'ilha',
    coordenadas: [-2.4650266, -44.191447],
    endereco: 'São José de Ribamar',
    descricao: 'Praia de águas calmas na maré baixa, com barracas de frutos do mar.',
  },
  {
    id: 'sitio-do-fisico',
    nome: 'Sítio do Físico',
    categoria: 'natureza',
    coordenadas: [-2.5728847, -44.2822651],
    endereco: 'Parque Estadual do Bacanga',
    descricao:
      'Ruínas de um complexo industrial do século XVIII em meio à mata, dentro do Parque do Bacanga.',
  },
  {
    id: 'parque-do-bacanga',
    nome: 'Parque Estadual do Bacanga',
    categoria: 'natureza',
    coordenadas: [-2.5925319, -44.275098],
    endereco: 'Bacanga',
    descricao: 'Área verde com trilhas, manguezais e a represa do Batatã.',
  },
  {
    id: 'sao-jose-de-ribamar',
    nome: 'São José de Ribamar (Santuário e orla)',
    categoria: 'ilha',
    coordenadas: [-2.5609115, -44.0559509],
    endereco: 'São José de Ribamar',
    descricao:
      'Cidade vizinha, conhecida pelo santuário de São José e pela orla com a estátua do padroeiro.',
  },
  {
    id: 'raposa',
    nome: 'Raposa',
    categoria: 'ilha',
    coordenadas: [-2.4410095, -44.1104256],
    endereco: 'Raposa',
    descricao:
      'Vila de pescadores famosa pela renda de bilro, pelos passeios de barco e pelos manguezais.',
  },
]);
