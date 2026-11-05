/**
 * Rotas reais pelas ruas usando o OSRM (OpenStreetMap), com instruções
 * passo a passo em português — essenciais para quem não enxerga o mapa.
 * Se o serviço não responder, o mapa usa uma linha reta como alternativa.
 */

const SERVIDORES = {
  'a-pe': 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
  bicicleta: 'https://routing.openstreetmap.de/routed-bike/route/v1/bike',
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
 * Converte os trechos (formato compacto: tipo, lado, rua, distância) em
 * instruções em português. Usado pelas rotas já calculadas e pelas buscadas.
 */
export function montarPassos(trechos, nomesDasParadas = []) {
  const ultimo = trechos.length - 1;
  return trechos.flatMap((passos, i) =>
    passos
      .filter((p) => !(p.tipo === 'depart' && i > 0)) // só uma "saída"
      .map((p) => {
        const chegada = p.tipo === 'arrive';
        const nome = nomesDasParadas[i];
        const texto =
          chegada && i < ultimo
            ? `Chegada: ${nome ?? `parada ${i + 1}`}`
            : chegada && nome
              ? `Você chegou: ${nome}`
              : traduzirInstrucao({
                  maneuver: { type: p.tipo, modifier: p.lado, exit: p.saida },
                  name: p.rua,
                });
        return { texto, distanciaM: p.distancia, parada: chegada };
      }),
  );
}

/** Rota guardada em src/dados/rotas-calculadas.json → objeto usado pelo mapa. */
export function converterRotaGuardada(guardada, nomesDasParadas = []) {
  return {
    coordenadas: guardada.coordenadas,
    distanciaKm: guardada.distancia / 1000,
    minutos: guardada.duracao / 60,
    passos: montarPassos(guardada.trechos, nomesDasParadas),
    aproximada: false,
  };
}

/**
 * Busca a rota entre dois pontos no serviço (usado só quando não há rota
 * guardada). Devolve { coordenadas: [lat,lon][], distanciaKm, minutos, passos, aproximada }.
 */
export function buscarRota(origem, destino, modo, opcoes) {
  return buscarRotaPorPontos([origem, destino], modo, opcoes);
}

/** Rota passando por vários pontos, em ordem. */
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
    return converterRotaGuardada(
      {
        distancia: rota.distance,
        duracao: rota.duration,
        coordenadas: rota.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
        trechos: rota.legs.map((perna) =>
          perna.steps.map((s) => ({
            tipo: s.maneuver.type,
            lado: s.maneuver.modifier,
            saida: s.maneuver.exit,
            rua: s.name,
            distancia: Math.round(s.distance),
          })),
        ),
      },
      nomesDasParadas,
    );
  } finally {
    clearTimeout(tempo);
  }
}
