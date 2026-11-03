import { describe, it, expect } from 'vitest';
import rotas from '../src/dados/rotas-calculadas.json';
import { PONTOS_TURISTICOS } from '../src/dados/pontos-turisticos.js';
import { ROTEIROS } from '../src/dados/roteiros.js';
import { converterRotaGuardada } from '../src/recursos/mapa/rotas.js';

// Se este teste falhar, rode: npm run calcular-rotas
describe('rotas calculadas pelas ruas', () => {
  it('existem para todos os pontos, a pé e de carro', () => {
    for (const ponto of PONTOS_TURISTICOS) {
      expect(rotas.pontos[ponto.id]?.['a-pe'], ponto.id).toBeTruthy();
      expect(rotas.pontos[ponto.id]?.carro, ponto.id).toBeTruthy();
    }
  });
  it('existem para todos os roteiros, com uma perna por parada', () => {
    for (const roteiro of ROTEIROS) {
      expect(rotas.roteiros[roteiro.id]?.trechos, roteiro.id).toHaveLength(roteiro.paradas.length);
    }
  });
  it('seguem as ruas (muitos pontos, não uma linha reta)', () => {
    const rua = rotas.pontos['rua-portugal']['a-pe'];
    expect(rua.coordenadas.length).toBeGreaterThan(5);
    const convertida = converterRotaGuardada(rua);
    expect(convertida.passos[0].texto).toMatch(/^Saia do Mercado Central/);
    expect(convertida.distanciaKm).toBeGreaterThan(0.5);
  });
});
