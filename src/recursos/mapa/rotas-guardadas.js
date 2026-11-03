/**
 * Acesso às rotas já calculadas pelas ruas (src/dados/rotas-calculadas.json,
 * gerado por `npm run calcular-rotas`). Se um ponto novo ainda não tiver rota
 * guardada, o mapa busca no serviço on-line ou, sem internet, usa linha reta.
 */
import rotas from '../../dados/rotas-calculadas.json';
import { converterRotaGuardada } from './rotas.js';

export const rotaGuardadaDoPonto = (idPonto, modo) => {
  const guardada = rotas.pontos?.[idPonto]?.[modo];
  return guardada ? converterRotaGuardada(guardada) : null;
};

export const caminhoDoPonto = (idPonto, modo) =>
  rotas.pontos?.[idPonto]?.[modo]?.coordenadas ?? null;

export const rotaGuardadaDoRoteiro = (idRoteiro, nomesDasParadas) => {
  const guardada = rotas.roteiros?.[idRoteiro];
  return guardada ? converterRotaGuardada(guardada, nomesDasParadas) : null;
};
