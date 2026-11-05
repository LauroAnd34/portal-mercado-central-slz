/**
 * Meios de transporte do "Como chegar": a pé, bicicleta, moto e carro.
 * - A pé e carro: rotas pelas ruas (calculadas antes, ou na hora pelo serviço).
 * - Bicicleta: rota de bicicleta do serviço; sem internet, usa o caminho a pé.
 * - Moto: usa o caminho de carro (mesmas ruas), um pouco mais rápida no trânsito.
 * Velocidades médias em km/h, usadas quando não há tempo calculado.
 */
const icone = (d) =>
  `<svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const MEIOS = Object.freeze([
  {
    id: 'a-pe',
    nome: 'A pé',
    servico: 'a-pe',
    rotaGuardada: 'a-pe',
    kmh: 4.5,
    google: 'walking',
    icone: icone('M13 4a1.5 1.5 0 1 0 0 .1M10 21l2-6 3 3v3M9 12l1-4 4 1 2 3 2 1M10 8l-2 4'),
  },
  {
    id: 'bicicleta',
    nome: 'Bicicleta',
    servico: 'bicicleta',
    rotaGuardada: 'a-pe',
    kmh: 14,
    google: 'bicycling',
    icone: icone(
      'M5.5 17.5a3.5 3.5 0 1 0 0-.1M18.5 17.5a3.5 3.5 0 1 0 0-.1M5.5 17.5 9 10h6l3.5 7.5M9 10 7.5 7H6m9 3-2.5 7.5',
    ),
  },
  {
    id: 'moto',
    nome: 'Moto',
    servico: 'carro',
    rotaGuardada: 'carro',
    kmh: 30,
    fatorSobreCarro: 0.8,
    google: 'driving',
    icone: icone(
      'M5 17.5a3 3 0 1 0 0-.1M19 17.5a3 3 0 1 0 0-.1M5 17.5h6l3-5h4l1 5M14 12.5l-2-4h-2M17 12.5l-1-3h2.5',
    ),
  },
  {
    id: 'carro',
    nome: 'Carro',
    servico: 'carro',
    rotaGuardada: 'carro',
    kmh: 25,
    google: 'driving',
    icone: icone(
      'M3 16v-4l2-5h14l2 5v4H3zM3 16v2h3v-2M18 16v2h3v-2M7.5 13.5h.1M16.5 13.5h.1M5 12h14',
    ),
  },
]);

export const meioPorId = (id) => MEIOS.find((m) => m.id === id) ?? MEIOS[0];

/**
 * Tempo em minutos de cada meio para uma distância (km pelas ruas).
 * minutosConhecidos: { 'a-pe': n, carro: n } quando já há rota calculada.
 */
export function temposPorMeio(distanciaKm, minutosConhecidos = {}) {
  const tempos = {};
  for (const meio of MEIOS) {
    let minutos = minutosConhecidos[meio.id];
    if (minutos === undefined && meio.fatorSobreCarro && minutosConhecidos.carro !== undefined)
      minutos = minutosConhecidos.carro * meio.fatorSobreCarro;
    if (minutos === undefined) minutos = (distanciaKm / meio.kmh) * 60 + (meio.id === 'a-pe' ? 0 : 2);
    tempos[meio.id] = Math.max(1, Math.round(minutos));
  }
  return tempos;
}

/** Meio sugerido: a pé até 1,5 km; depois, carro. */
export const meioSugerido = (distanciaKm) => (distanciaKm <= 1.5 ? 'a-pe' : 'carro');
