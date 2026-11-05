/**
 * Cálculos geográficos puros (sem mapa, sem DOM) — testados em testes/.
 */
import { minutosPorDistancia } from './meios-de-transporte.js';

const RAIO_DA_TERRA_KM = 6371;
const grausParaRadianos = (graus) => (graus * Math.PI) / 180;

/** Distância em linha reta entre dois pontos [lat, lon] (fórmula de Haversine). */
export function calcularDistanciaKm([lat1, lon1], [lat2, lon2]) {
  const dLat = grausParaRadianos(lat2 - lat1);
  const dLon = grausParaRadianos(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(grausParaRadianos(lat1)) * Math.cos(grausParaRadianos(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * RAIO_DA_TERRA_KM * Math.asin(Math.sqrt(a));
}

/**
 * Estimativa de tempo a partir da distância em linha reta.
 * Fator 1,3 compensa as curvas das ruas; 4,5 km/h a pé e 25 km/h de carro
 * (média urbana). É só uma referência — a rota real é calculada sob demanda.
 */
export function estimarTempos(distanciaKm) {
  // sem rota pelas ruas: o caminho real costuma ser ~30% maior que a linha reta
  const real = distanciaKm * 1.3;
  return {
    aPeMinutos: minutosPorDistancia('a-pe', real),
    carroMinutos: minutosPorDistancia('carro', real),
  };
}

/** Sugere o modo de deslocamento: até 2,5 km vale ir a pé pelo Centro. */
export const sugerirModo = (distanciaKm) => (distanciaKm <= 2.5 ? 'a-pe' : 'carro');

export function formatarDistancia(km) {
  if (km < 1) return `${Math.round((km * 1000) / 10) * 10} m`;
  return `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

export function formatarDuracao(minutos) {
  const total = Math.round(minutos);
  if (total < 60) return `${total} min`;
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

/** Direção aproximada (para descrever o ponto a quem não vê o mapa). */
export function direcaoCardeal([lat1, lon1], [lat2, lon2]) {
  const y = Math.sin(grausParaRadianos(lon2 - lon1)) * Math.cos(grausParaRadianos(lat2));
  const x =
    Math.cos(grausParaRadianos(lat1)) * Math.sin(grausParaRadianos(lat2)) -
    Math.sin(grausParaRadianos(lat1)) *
      Math.cos(grausParaRadianos(lat2)) *
      Math.cos(grausParaRadianos(lon2 - lon1));
  const rumo = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  const direcoes = [
    'norte',
    'nordeste',
    'leste',
    'sudeste',
    'sul',
    'sudoeste',
    'oeste',
    'noroeste',
  ];
  return direcoes[Math.round(rumo / 45) % 8];
}

/** Link "Como chegar" no Google Maps, partindo do Mercado Central. */
export function linkComoChegar(origem, destino, modo = 'a-pe') {
  const parametros = new URLSearchParams({
    api: '1',
    origin: origem.join(','),
    destination: destino.join(','),
    travelmode:
      { 'a-pe': 'walking', carro: 'driving' }[modo] ??
      (['walking', 'bicycling', 'driving', 'transit'].includes(modo) ? modo : 'driving'),
  });
  return `https://www.google.com/maps/dir/?${parametros}`;
}
