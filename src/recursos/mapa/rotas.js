/**
 * Rotas reais pelas ruas usando o OSRM (OpenStreetMap), com instruções
 * passo a passo em português — essenciais para quem não enxerga o mapa.
 * Se o serviço não responder, o mapa usa uma linha reta como alternativa.
 */

const SERVIDORES = {
  'a-pe': 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
  carro: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
};

const LADOS = {
  left: 'à esquerda',
  right: 'à direita',
  'slight left': 'levemente à esquerda',
  'slight right': 'levemente à direita',
  'sharp left': 'acentuadamente à esquerda',
  'sharp right': 'acentuadamente à direita',
  straight: 'em frente',
  uturn: 'fazendo o retorno',
};

// "na Rua", mas "no Largo" / "pelo Beco"
const MASCULINOS =
  /^(largo|beco|caminho|viaduto|anel|acesso|retorno|cais|elevado|túnel|tunel|parque)\b/i;
const ehMasculino = (nome) => MASCULINOS.test(nome ?? '');
export const naRua = (nome) => (nome ? ` ${ehMasculino(nome) ? 'no' : 'na'} ${nome}` : '');
export const pelaRua = (nome) => (nome ? ` ${ehMasculino(nome) ? 'pelo' : 'pela'} ${nome}` : '');

/** Traduz um passo do OSRM em uma frase em português. */
export function traduzirInstrucao(passo) {
  const { type, modifier } = passo.maneuver ?? {};
  const rua = passo.name?.trim();
  const lado = LADOS[modifier] ?? '';
  switch (type) {
    case 'depart':
      return `Saia do Mercado Central${pelaRua(rua)}`;
    case 'arrive':
      return 'Você chegou ao destino';
    case 'turn':
    case 'end of road':
      return modifier === 'straight'
        ? `Siga em frente${pelaRua(rua)}`
        : `Vire ${lado}${naRua(rua)}`;
    case 'new name':
    case 'continue':
      return `Continue ${lado && modifier !== 'straight' ? lado : 'em frente'}${pelaRua(rua)}`;
    case 'fork':
      return `Na bifurcação, mantenha-se ${lado}${pelaRua(rua)}`;
    case 'merge':
      return `Entre ${lado}${naRua(rua)}`;
    case 'roundabout':
    case 'rotary': {
      const saida = passo.maneuver?.exit;
      return `Na rotatória, pegue a ${saida ? `${saida}ª saída` : 'saída indicada'}${pelaRua(rua)}`;
    }
    default:
      return `Siga ${lado || 'em frente'}${pelaRua(rua)}`;
  }
}

/**
 * Busca a rota entre dois pontos.
 * Devolve { coordenadas: [lat,lon][], distanciaKm, minutos, passos, aproximada }.
 * @param {[number,number]} origem @param {[number,number]} destino @param {'a-pe'|'carro'} modo
 */
export function buscarRota(origem, destino, modo, opcoes) {
  return buscarRotaPorPontos([origem, destino], modo, opcoes);
}

/**
 * Rota passando por vários pontos, em ordem (usada nos roteiros).
 * `nomesDasParadas` (opcional) personaliza o aviso de chegada de cada trecho.
 */
export async function buscarRotaPorPontos(
  pontos,
  modo,
  { tempoLimiteMs = 10000, nomesDasParadas = [] } = {},
) {
  const caminho = pontos.map(([lat, lon]) => `${lon},${lat}`).join(';');
  const url = `${SERVIDORES[modo]}/${caminho}?overview=full&geometries=geojson&steps=true`;
  const controlador = new AbortController();
  const tempo = setTimeout(() => controlador.abort(), tempoLimiteMs);
  try {
    const resposta = await fetch(url, { signal: controlador.signal });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    const dados = await resposta.json();
    const rota = dados.routes?.[0];
    if (!rota) throw new Error('sem rota');
    const ultimoTrecho = rota.legs.length - 1;
    return {
      coordenadas: rota.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
      distanciaKm: rota.distance / 1000,
      minutos: rota.duration / 60,
      passos: rota.legs.flatMap((trecho, i) =>
        trecho.steps
          .filter((passo) => !(passo.maneuver.type === 'depart' && i > 0)) // só uma "saída"
          .map((passo) => {
            const chegada = passo.maneuver.type === 'arrive';
            const nome = nomesDasParadas[i];
            return {
              texto:
                chegada && i < ultimoTrecho
                  ? `Chegada: ${nome ?? `parada ${i + 1}`}`
                  : chegada && nome
                    ? `Você chegou: ${nome}`
                    : traduzirInstrucao(passo),
              distanciaM: Math.round(passo.distance),
              parada: chegada,
            };
          }),
      ),
      aproximada: false,
    };
  } finally {
    clearTimeout(tempo);
  }
}
